// Authentication routes for magic link system
const express = require('express');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const { promisify } = require('util');

const router = express.Router();

// JWT secret (should be in environment variables)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';
const JWT_EXPIRES_IN = '24h';
const MAGIC_LINK_EXPIRES_MINUTES = 15;

// Database connection
const db = new sqlite3.Database('./saunas.db');
const dbGet = promisify(db.get.bind(db));
const dbRun = promisify(db.run.bind(db));
const dbAll = promisify(db.all.bind(db));

// AWS SES configuration (for sending emails)
const AWS = require('aws-sdk');
const ses = new AWS.SES({
	region: process.env.AWS_REGION || 'eu-west-1',
	accessKeyId: process.env.AWS_ACCESS_KEY_ID,
	secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

// Helper function to generate magic link token
const generateMagicToken = () => {
	return crypto.randomBytes(32).toString('hex');
};

// Helper function to send magic link email
const sendMagicLinkEmail = async (email, token, frontendUrl = null) => {
	// Use provided frontend URL or fallback to environment variable or default
	const baseUrl = frontendUrl || process.env.FRONTEND_URL || 'https://tampereensaunalautat.fi';
	const magicLink = `${baseUrl}/login?token=${token}`;

	const params = {
		Source: process.env.FROM_EMAIL || 'noreply@tampereensaunalautat.fi',
		Destination: {
			ToAddresses: [email],
		},
		Message: {
			Subject: {
				Data: 'Kirjaudu sisään - Tampereensaunalautat.fi',
				Charset: 'UTF-8',
			},
			Body: {
				Html: {
					Data: `
            <html>
              <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2>Kirjaudu sisään</h2>
                <p>Hei!</p>
                <p>Klikkaa alla olevaa linkkiä kirjautuaksesi sisään Tampereensaunalautat.fi -palveluun:</p>
                <div style="margin: 30px 0;">
                  <a href="${magicLink}" 
                     style="background-color: #0066cc; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
                    Kirjaudu sisään
                  </a>
                </div>
                <p>Tämä linkki on voimassa 15 minuuttia.</p>
                <p>Jos et pyytänyt tätä kirjautumislinkkiä, voit jättää tämän viestin huomiotta.</p>
                <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
                <p style="color: #666; font-size: 12px;">
                  Tampereensaunalautat.fi<br>
                  <a href="https://tampereensaunalautat.fi">https://tampereensaunalautat.fi</a>
                </p>
              </body>
            </html>
          `,
					Charset: 'UTF-8',
				},
				Text: {
					Data: `
Kirjaudu sisään - Tampereensaunalautat.fi

Hei!

Klikkaa alla olevaa linkkiä kirjautuaksesi sisään:
${magicLink}

Tämä linkki on voimassa 15 minuuttia.

Jos et pyytänyt tätä kirjautumislinkkiä, voit jättää tämän viestin huomiotta.

Tampereensaunalautat.fi
https://tampereensaunalautat.fi
          `,
					Charset: 'UTF-8',
				},
			},
		},
	};

	try {
		const result = await ses.sendEmail(params).promise();
		return result;
	} catch (error) {
		console.error('Error sending magic link email:', error);
		throw error;
	}
};

// POST /auth/login - Request magic link
router.post('/login', async (req, res) => {
	try {
		const { email } = req.body;

		if (!email) {
			return res.status(400).json({
				success: false,
				message: 'Sähköpostiosoite on pakollinen',
			});
		}

		// Check if user exists
		const user = await dbGet('SELECT * FROM users WHERE email = ? AND status = "active"', [email]);

		if (!user) {
			return res.status(404).json({
				success: false,
				message: 'Käyttäjätiliä ei löytynyt tai se ei ole aktiivinen',
			});
		}

		// Generate magic link token
		const token = generateMagicToken();
		const expiresAt = new Date(Date.now() + MAGIC_LINK_EXPIRES_MINUTES * 60 * 1000);

		// Store magic link in database
		await dbRun(`
      INSERT INTO magic_links (token, email, expires_at, ip_address, user_agent)
      VALUES (?, ?, ?, ?, ?)
    `, [token, email, expiresAt.toISOString(), req.ip, req.get('User-Agent') || '']);

		// Get frontend URL from request headers (for dynamic branch URLs)
		const frontendUrl = req.get('Origin') || req.get('Referer')?.split('/').slice(0, 3).join('/') || null;

		// Send magic link email
		await sendMagicLinkEmail(email, token, frontendUrl);

		res.json({
			success: true,
			message: 'Kirjautumislinkki lähetetty sähköpostiin',
		});

	} catch (error) {
		console.error('Error in login:', error);
		res.status(500).json({
			success: false,
			message: 'Palvelimella tapahtui virhe',
		});
	}
});

// POST /auth/verify - Verify magic link token
router.post('/verify', async (req, res) => {
	try {
		const { token } = req.body;

		if (!token) {
			return res.status(400).json({
				success: false,
				message: 'Token on pakollinen',
			});
		}

		// Get magic link from database
		const magicLink = await dbGet(`
      SELECT * FROM magic_links 
      WHERE token = ? AND used = 0 AND expires_at > datetime('now')
    `, [token]);

		if (!magicLink) {
			return res.status(400).json({
				success: false,
				message: 'Virheellinen tai vanhentunut kirjautumislinkki',
			});
		}

		// Get user
		const user = await dbGet('SELECT * FROM users WHERE email = ? AND status = "active"', [magicLink.email]);

		if (!user) {
			return res.status(404).json({
				success: false,
				message: 'Käyttäjätiliä ei löytynyt',
			});
		}

		// Mark magic link as used
		await dbRun(`
      UPDATE magic_links 
      SET used = 1, used_at = datetime('now') 
      WHERE token = ?
    `, [token]);

		// Update user's last login
		await dbRun(`
      UPDATE users 
      SET last_login = datetime('now'), updated_at = datetime('now') 
      WHERE id = ?
    `, [user.id]);

		// Generate JWT token
		const jwtToken = jwt.sign(
			{
				userId: user.id,
				email: user.email,
				isAdmin: user.is_admin === 1
			},
			JWT_SECRET,
			{ expiresIn: JWT_EXPIRES_IN }
		);

		// Create refresh token
		const refreshToken = crypto.randomBytes(32).toString('hex');
		const refreshExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

		await dbRun(`
      INSERT INTO user_sessions (user_id, refresh_token, expires_at, ip_address, user_agent)
      VALUES (?, ?, ?, ?, ?)
    `, [user.id, refreshToken, refreshExpiresAt.toISOString(), req.ip, req.get('User-Agent') || '']);

		res.json({
			success: true,
			user: {
				id: user.id,
				email: user.email,
				name: user.name,
				isAdmin: user.is_admin === 1,
			},
			authToken: jwtToken,
			refreshToken: refreshToken,
		});

	} catch (error) {
		console.error('Error in verify:', error);
		res.status(500).json({
			success: false,
			message: 'Palvelimella tapahtui virhe',
		});
	}
});

// POST /auth/refresh - Refresh JWT token
router.post('/refresh', async (req, res) => {
	try {
		const { refreshToken } = req.body;

		if (!refreshToken) {
			return res.status(400).json({
				success: false,
				message: 'Refresh token on pakollinen',
			});
		}

		// Get session from database
		const session = await dbGet(`
      SELECT * FROM user_sessions 
      WHERE refresh_token = ? AND is_active = 1 AND expires_at > datetime('now')
    `, [refreshToken]);

		if (!session) {
			return res.status(401).json({
				success: false,
				message: 'Virheellinen tai vanhentunut refresh token',
			});
		}

		// Get user
		const user = await dbGet('SELECT * FROM users WHERE id = ? AND status = "active"', [session.user_id]);

		if (!user) {
			return res.status(404).json({
				success: false,
				message: 'Käyttäjätiliä ei löytynyt',
			});
		}

		// Update session last used
		await dbRun(`
      UPDATE user_sessions 
      SET last_used = datetime('now') 
      WHERE refresh_token = ?
    `, [refreshToken]);

		// Generate new JWT token
		const jwtToken = jwt.sign(
			{
				userId: user.id,
				email: user.email,
				isAdmin: user.is_admin === 1
			},
			JWT_SECRET,
			{ expiresIn: JWT_EXPIRES_IN }
		);

		res.json({
			success: true,
			authToken: jwtToken,
			user: {
				id: user.id,
				email: user.email,
				name: user.name,
				isAdmin: user.is_admin === 1,
			},
		});

	} catch (error) {
		console.error('Error in refresh:', error);
		res.status(500).json({
			success: false,
			message: 'Palvelimella tapahtui virhe',
		});
	}
});

// POST /auth/logout - Logout user (invalidate refresh token)
router.post('/logout', async (req, res) => {
	try {
		const { refreshToken } = req.body;

		if (refreshToken) {
			// Invalidate refresh token
			await dbRun(`
        UPDATE user_sessions 
        SET is_active = 0 
        WHERE refresh_token = ?
      `, [refreshToken]);
		}

		res.json({
			success: true,
			message: 'Kirjauduttu ulos onnistuneesti',
		});

	} catch (error) {
		console.error('Error in logout:', error);
		res.status(500).json({
			success: false,
			message: 'Palvelimella tapahtui virhe',
		});
	}
});

// GET /auth/me - Get current user info (protected route)
router.get('/me', authenticateToken, async (req, res) => {
	try {
		const user = await dbGet('SELECT * FROM users WHERE id = ? AND status = "active"', [req.user.userId]);

		if (!user) {
			return res.status(404).json({
				success: false,
				message: 'Käyttäjätiliä ei löytynyt',
			});
		}

		res.json({
			success: true,
			user: {
				id: user.id,
				email: user.email,
				name: user.name,
				isAdmin: user.is_admin === 1,
			},
		});

	} catch (error) {
		console.error('Error in me:', error);
		res.status(500).json({
			success: false,
			message: 'Palvelimella tapahtui virhe',
		});
	}
});

// Middleware to authenticate JWT token
function authenticateToken(req, res, next) {
	const authHeader = req.headers['authorization'];
	const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

	if (!token) {
		return res.status(401).json({
			success: false,
			message: 'Pääsy evätty - token puuttuu',
		});
	}

	jwt.verify(token, JWT_SECRET, (err, user) => {
		if (err) {
			return res.status(403).json({
				success: false,
				message: 'Virheellinen token',
			});
		}
		req.user = user;
		next();
	});
}

// GET /auth/user/:userId/saunas - Get user's saunas (protected route)
router.get('/user/:userId/saunas', authenticateToken, async (req, res) => {
	try {
		const { userId } = req.params;

		// Check if user is accessing their own data or is admin
		if (req.user.userId !== userId && !req.user.isAdmin) {
			return res.status(403).json({
				success: false,
				message: 'Ei oikeuksia',
			});
		}

		// Get user's saunas
		const saunas = await dbAll(`
      SELECT s.* FROM saunas s
      JOIN user_saunas us ON s.id = us.sauna_id
      WHERE us.user_id = ?
    `, [userId]);

		res.json({
			success: true,
			saunas: saunas,
		});

	} catch (error) {
		console.error('Error getting user saunas:', error);
		res.status(500).json({
			success: false,
			message: 'Palvelimella tapahtui virhe',
		});
	}
});

// Export the router and middleware
module.exports = {
	router,
	authenticateToken,
}; 
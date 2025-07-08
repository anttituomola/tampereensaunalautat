// Express server for Tampereensaunalautat.fi API with authentication
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { promisify } = require('util');

// Import authentication routes
const { router: authRouter, authenticateToken } = require('./auth-routes');

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// More restrictive rate limiting for auth endpoints
const authLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 5, // limit each IP to 5 auth requests per windowMs
	message: {
		success: false,
		message: 'Liian monta kirjautumisyritystä. Yritä uudelleen 15 minuutin kuluttua.'
	}
});
app.use('/api/auth', authLimiter);

// CORS configuration
app.use(cors({
	origin: process.env.NODE_ENV === 'production'
		? ['https://tampereensaunalautat.fi', 'https://www.tampereensaunalautat.fi']
		: ['http://localhost:3000', 'http://127.0.0.1:3000'],
	credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Database setup
const db = new sqlite3.Database('./saunas.db', (err) => {
	if (err) {
		console.error('Error opening database:', err.message);
	} else {
		console.log('Connected to SQLite database');
	}
});

// Promisify database methods
const dbGet = promisify(db.get.bind(db));
const dbRun = promisify(db.run.bind(db));
const dbAll = promisify(db.all.bind(db));

// Health check endpoint
app.get('/api/health', (req, res) => {
	res.json({
		status: 'OK',
		timestamp: new Date().toISOString(),
		environment: process.env.NODE_ENV || 'development',
		database: 'connected'
	});
});

// Authentication routes
app.use('/api/auth', authRouter);

// Get all saunas (public endpoint)
app.get('/api/sauna/list', async (req, res) => {
	try {
		const saunas = await dbAll('SELECT * FROM saunas ORDER BY name');

		// Transform data for frontend compatibility
		const transformedSaunas = saunas.map(sauna => ({
			...sauna,
			pricemin: sauna.price_min,
			pricemax: sauna.price_max,
			eventLength: sauna.event_length,
			mainImage: sauna.main_image,
			equipment: sauna.equipment ? JSON.parse(sauna.equipment) : [],
			images: sauna.images ? JSON.parse(sauna.images) : [],
			urlArray: sauna.url_array ? JSON.parse(sauna.url_array) : [],
			winter: sauna.winter === 1
		}));

		res.json(transformedSaunas);
	} catch (error) {
		console.error('Error fetching saunas:', error);
		res.status(500).json({
			success: false,
			message: 'Palvelimella tapahtui virhe'
		});
	}
});

// Get single sauna (public endpoint)
app.get('/api/sauna/:id', async (req, res) => {
	try {
		const { id } = req.params;
		const sauna = await dbGet('SELECT * FROM saunas WHERE id = ? OR url_name = ?', [id, id]);

		if (!sauna) {
			return res.status(404).json({
				success: false,
				message: 'Saunaa ei löytynyt'
			});
		}

		// Transform data for frontend compatibility
		const transformedSauna = {
			...sauna,
			pricemin: sauna.price_min,
			pricemax: sauna.price_max,
			eventLength: sauna.event_length,
			mainImage: sauna.main_image,
			equipment: sauna.equipment ? JSON.parse(sauna.equipment) : [],
			images: sauna.images ? JSON.parse(sauna.images) : [],
			urlArray: sauna.url_array ? JSON.parse(sauna.url_array) : [],
			winter: sauna.winter === 1
		};

		res.json(transformedSauna);
	} catch (error) {
		console.error('Error fetching sauna:', error);
		res.status(500).json({
			success: false,
			message: 'Palvelimella tapahtui virhe'
		});
	}
});

// Update sauna (protected endpoint)
app.put('/api/sauna/:id', authenticateToken, async (req, res) => {
	try {
		const { id } = req.params;
		const userId = req.user.userId;
		const isAdmin = req.user.isAdmin;

		// Check if user owns this sauna or is admin
		if (!isAdmin) {
			const ownership = await dbGet(`
        SELECT us.* FROM user_saunas us 
        WHERE us.sauna_id = ? AND us.user_id = ? AND us.role IN ('owner', 'manager')
      `, [id, userId]);

			if (!ownership) {
				return res.status(403).json({
					success: false,
					message: 'Ei oikeuksia muokata tätä saunaa'
				});
			}
		}

		const {
			name, location, capacity, event_length, price_min, price_max,
			equipment, email, phone, url, notes, winter
		} = req.body;

		// Validate required fields
		if (!name || !location || !capacity || !event_length || !price_min || !price_max || !email || !phone) {
			return res.status(400).json({
				success: false,
				message: 'Pakolliset kentät puuttuvat'
			});
		}

		// Update sauna
		await dbRun(`
      UPDATE saunas SET
        name = ?, location = ?, capacity = ?, event_length = ?, 
        price_min = ?, price_max = ?, equipment = ?, email = ?, 
        phone = ?, url = ?, notes = ?, winter = ?,
        updated_at = datetime('now')
      WHERE id = ?
    `, [
			name, location, capacity, event_length, price_min, price_max,
			JSON.stringify(equipment || []), email, phone, url, notes, winter ? 1 : 0, id
		]);

		// Get updated sauna
		const updatedSauna = await dbGet('SELECT * FROM saunas WHERE id = ?', [id]);

		res.json({
			success: true,
			message: 'Sauna päivitetty onnistuneesti',
			sauna: updatedSauna
		});

	} catch (error) {
		console.error('Error updating sauna:', error);
		res.status(500).json({
			success: false,
			message: 'Palvelimella tapahtui virhe'
		});
	}
});

// Get user's saunas (protected endpoint)
app.get('/api/user/saunas', authenticateToken, async (req, res) => {
	try {
		const userId = req.user.userId;

		const saunas = await dbAll(`
      SELECT s.*, us.role FROM saunas s
      JOIN user_saunas us ON s.id = us.sauna_id
      WHERE us.user_id = ?
      ORDER BY s.name
    `, [userId]);

		// Transform data for frontend compatibility
		const transformedSaunas = saunas.map(sauna => ({
			...sauna,
			pricemin: sauna.price_min,
			pricemax: sauna.price_max,
			eventLength: sauna.event_length,
			mainImage: sauna.main_image,
			equipment: sauna.equipment ? JSON.parse(sauna.equipment) : [],
			images: sauna.images ? JSON.parse(sauna.images) : [],
			urlArray: sauna.url_array ? JSON.parse(sauna.url_array) : [],
			winter: sauna.winter === 1
		}));

		res.json({
			success: true,
			saunas: transformedSaunas
		});

	} catch (error) {
		console.error('Error fetching user saunas:', error);
		res.status(500).json({
			success: false,
			message: 'Palvelimella tapahtui virhe'
		});
	}
});

// Serve static images
app.use('/images', express.static(path.join(__dirname, 'images')));

// Admin endpoints (protected)
app.get('/api/admin/users', authenticateToken, async (req, res) => {
	try {
		// Check if user is admin
		if (!req.user.isAdmin) {
			return res.status(403).json({
				success: false,
				message: 'Admin-oikeudet vaaditaan'
			});
		}

		const users = await dbAll(`
      SELECT u.*, COUNT(us.sauna_id) as sauna_count
      FROM users u
      LEFT JOIN user_saunas us ON u.id = us.user_id
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `);

		res.json({
			success: true,
			users: users
		});

	} catch (error) {
		console.error('Error fetching users:', error);
		res.status(500).json({
			success: false,
			message: 'Palvelimella tapahtui virhe'
		});
	}
});

app.get('/api/admin/pending-saunas', authenticateToken, async (req, res) => {
	try {
		// Check if user is admin
		if (!req.user.isAdmin) {
			return res.status(403).json({
				success: false,
				message: 'Admin-oikeudet vaaditaan'
			});
		}

		const pendingSaunas = await dbAll(`
      SELECT * FROM pending_saunas 
      WHERE status = 'pending' 
      ORDER BY created_at DESC
    `);

		res.json({
			success: true,
			pendingSaunas: pendingSaunas
		});

	} catch (error) {
		console.error('Error fetching pending saunas:', error);
		res.status(500).json({
			success: false,
			message: 'Palvelimella tapahtui virhe'
		});
	}
});

// Error handling middleware
app.use((err, req, res, next) => {
	console.error('Unhandled error:', err);
	res.status(500).json({
		success: false,
		message: 'Palvelimella tapahtui odottamaton virhe'
	});
});

// 404 handler
app.use('*', (req, res) => {
	res.status(404).json({
		success: false,
		message: 'Päätepistettä ei löytynyt'
	});
});

// Graceful shutdown
process.on('SIGINT', () => {
	console.log('\nShutting down server...');
	db.close((err) => {
		if (err) {
			console.error('Error closing database:', err.message);
		} else {
			console.log('Database connection closed.');
		}
		process.exit(0);
	});
});

// Start server
app.listen(PORT, () => {
	console.log(`🚀 Server running on port ${PORT}`);
	console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
	console.log(`Database: SQLite (saunas.db)`);
	console.log(`CORS enabled for: ${process.env.NODE_ENV === 'production' ? 'production domains' : 'localhost'}`);
}); 
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

// AWS SES configuration for admin notifications
const AWS = require('aws-sdk');
const ses = new AWS.SES({
	region: process.env.AWS_REGION || 'eu-west-1',
	accessKeyId: process.env.AWS_ACCESS_KEY_ID,
	secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

// Helper function to send admin notification email
const sendAdminNotificationEmail = async (registrationData) => {
	const adminEmail = process.env.ADMIN_EMAIL || 'admin@tampereensaunalautat.fi';
	const frontendUrl = process.env.FRONTEND_URL || 'https://tampereensaunalautat.fi';

	const {
		id, name, location, capacity, price_min, price_max,
		owner_email, owner_name, owner_phone, email, phone
	} = registrationData;

	const params = {
		Source: process.env.FROM_EMAIL || 'noreply@tampereensaunalautat.fi',
		Destination: {
			ToAddresses: [adminEmail],
		},
		Message: {
			Subject: {
				Data: `Uusi saunalautta-rekisteröinti: ${name}`,
				Charset: 'UTF-8',
			},
			Body: {
				Html: {
					Data: `
            <html>
              <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2>Uusi saunalautta-rekisteröinti</h2>
                <p>Hei!</p>
                <p>Uusi saunalautta on rekisteröity palveluun ja odottaa hyväksyntää:</p>
                
                <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h3 style="margin-top: 0;">Saunan tiedot</h3>
                  <p><strong>Nimi:</strong> ${name}</p>
                  <p><strong>Sijainti:</strong> ${location}</p>
                  <p><strong>Kapasiteetti:</strong> ${capacity} henkilöä</p>
                  <p><strong>Hinnat:</strong> ${price_min}€ - ${price_max}€</p>
                  
                  <h3>Omistajan tiedot</h3>
                  <p><strong>Nimi:</strong> ${owner_name}</p>
                  <p><strong>Sähköposti:</strong> ${owner_email}</p>
                  <p><strong>Puhelin:</strong> ${owner_phone}</p>
                  
                  <h3>Asiakkaiden yhteystiedot</h3>
                  <p><strong>Sähköposti:</strong> ${email}</p>
                  <p><strong>Puhelin:</strong> ${phone}</p>
                  
                  <p><strong>Rekisteröinti-ID:</strong> ${id}</p>
                </div>
                
                <div style="margin: 30px 0;">
                  <a href="${frontendUrl}/login" 
                     style="background-color: #0066cc; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin-right: 10px;">
                    Käsittele hallintapaneelissa
                  </a>
                </div>
                
                <p style="color: #666; font-size: 14px;">
                  Käsittele tämä rekisteröinti mahdollisimman pian. Omistaja saa automaattisen vahvistuksen sähköpostitse kun rekisteröinti on hyväksytty tai hylätty.
                </p>
                
                <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
                <p style="color: #666; font-size: 12px;">
                  Tampereensaunalautat.fi Admin<br>
                  <a href="${frontendUrl}">${frontendUrl}</a>
                </p>
              </body>
            </html>
          `,
					Charset: 'UTF-8',
				},
				Text: {
					Data: `
Uusi saunalautta-rekisteröinti: ${name}

Uusi saunalautta on rekisteröity palveluun ja odottaa hyväksyntää:

SAUNAN TIEDOT:
- Nimi: ${name}
- Sijainti: ${location}
- Kapasiteetti: ${capacity} henkilöä
- Hinnat: ${price_min}€ - ${price_max}€

OMISTAJAN TIEDOT:
- Nimi: ${owner_name}
- Sähköposti: ${owner_email}
- Puhelin: ${owner_phone}

ASIAKKAIDEN YHTEYSTIEDOT:
- Sähköposti: ${email}
- Puhelin: ${phone}

Rekisteröinti-ID: ${id}

Käsittele rekisteröinti hallintapaneelissa: ${frontendUrl}/login

Tampereensaunalautat.fi Admin
${frontendUrl}
          `,
					Charset: 'UTF-8',
				},
			},
		},
	};

	try {
		const result = await ses.sendEmail(params).promise();
		console.log('📧 Admin notification email sent successfully:', result.MessageId);
		return result;
	} catch (error) {
		console.error('❌ Error sending admin notification email:', error);
		throw error;
	}
};

// Import image management modules
const multer = require('multer');
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs').promises;
const fsSync = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration for images - same as API endpoints
const corsOrigins = process.env.CORS_ORIGINS
	? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim())
	: process.env.NODE_ENV === 'production'
		? ['https://tampereensaunalautat.fi', 'https://www.tampereensaunalautat.fi']
		: ['http://localhost:3000', 'http://127.0.0.1:3000'];

// Serve images FIRST - before any other middleware to avoid conflicts
app.use('/images', (req, res, next) => {
	const origin = req.get('origin');

	// Only set CORS headers if the origin is in our allowed list
	if (origin && corsOrigins.includes(origin)) {
		res.set('Access-Control-Allow-Origin', origin);
		res.set('Access-Control-Allow-Methods', 'GET');
		res.set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
	}

	next();
}, express.static(path.join(__dirname, 'images'), {
	setHeaders: (res, path, stat) => {
		// Set cache headers for proper image serving
		res.set({
			'Cache-Control': 'public, max-age=31536000', // 1 year cache
		});
	}
}));

// Security middleware - configure to allow cross-origin images
app.use(helmet({
	crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Rate limiting - more lenient for development
const isDevelopment = process.env.NODE_ENV !== 'production';

const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: isDevelopment ? 1000 : 100, // Higher limit for development
	message: {
		success: false,
		message: 'Liian monta pyyntöä. Yritä uudelleen myöhemmin.'
	}
});
app.use('/api/', limiter);

// More restrictive rate limiting for auth endpoints (but still reasonable for dev)
const authLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: isDevelopment ? 100 : 5, // Much higher limit for development
	message: {
		success: false,
		message: 'Liian monta kirjautumisyritystä. Yritä uudelleen 15 minuutin kuluttua.'
	}
});
app.use('/api/auth', authLimiter);

// CORS configuration for API endpoints only
app.use('/api', cors({
	origin: corsOrigins,
	credentials: true
}));

console.log('🌍 CORS enabled for origins:', corsOrigins);

// Body parsing middleware
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

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

// Image upload configuration
const storage = multer.memoryStorage();
const upload = multer({
	storage: storage,
	limits: {
		fileSize: 15 * 1024 * 1024, // 15MB limit per file
		files: 5 // Maximum 5 files per request
	},
	fileFilter: (req, file, cb) => {
		// Accept only image files
		if (file.mimetype.startsWith('image/')) {
			cb(null, true);
		} else {
			cb(new Error('Vain kuvatiedostot ovat sallittuja'), false);
		}
	}
});

// Ensure images directory exists
const imagesDir = path.join(__dirname, 'images');
if (!fsSync.existsSync(imagesDir)) {
	fsSync.mkdirSync(imagesDir, { recursive: true });
}

// Image processing function
const processImage = async (buffer, filename) => {
	console.log('🔄 Processing image:', filename);
	const baseFilename = filename.replace(/\.[^/.]+$/, '');
	const processedFilename = `${baseFilename}.webp`;
	const outputPath = path.join(imagesDir, processedFilename);

	console.log('📁 Output path:', outputPath);
	console.log('📊 Buffer size:', buffer.length, 'bytes');

	try {
		// Process image with sharp
		await sharp(buffer)
			.resize(1200, 800, {
				fit: 'inside',
				withoutEnlargement: true
			})
			.webp({
				quality: 85,
				effort: 4
			})
			.toFile(outputPath);

		console.log('✅ Image processed successfully:', processedFilename);

		// Verify file was created
		if (fsSync.existsSync(outputPath)) {
			const stats = fsSync.statSync(outputPath);
			console.log('📏 File size:', stats.size, 'bytes');
		} else {
			console.error('❌ File was not created:', outputPath);
		}

		return processedFilename;
	} catch (error) {
		console.error('❌ Error processing image:', error);
		throw error;
	}
};

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
			winter: sauna.winter === 1,
			visible: sauna.visible === 1
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
			winter: sauna.winter === 1,
			visible: sauna.visible === 1
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

// Register new sauna (public endpoint)
app.post('/api/register/sauna', async (req, res) => {
	try {
		const {
			owner_email, owner_name, owner_phone,
			name, location, capacity, event_length, price_min, price_max,
			equipment, email, phone, url, url_array, notes, winter
		} = req.body;

		// Validate required fields
		if (!owner_email || !owner_name || !owner_phone ||
			!name || !location || !capacity || !event_length ||
			!price_min || !price_max || !email || !phone) {
			return res.status(400).json({
				success: false,
				message: 'Pakolliset kentät puuttuvat'
			});
		}

		// Validate email format
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(owner_email) || !emailRegex.test(email)) {
			return res.status(400).json({
				success: false,
				message: 'Sähköpostin muoto on virheellinen'
			});
		}

		// Validate numeric fields
		if (capacity < 1 || capacity > 100 || event_length < 1 || event_length > 24 ||
			price_min < 0 || price_max < 0 || price_min > price_max) {
			return res.status(400).json({
				success: false,
				message: 'Numeroarvoissa on virheitä'
			});
		}

		// Check if location is valid
		if (!['Näsijärvi', 'Pyhäjärvi'].includes(location)) {
			return res.status(400).json({
				success: false,
				message: 'Virheellinen sijainti'
			});
		}

		// Validate URL formats if provided
		const urlRegex = /^https?:\/\/.+/;
		if (url && !urlRegex.test(url)) {
			return res.status(400).json({
				success: false,
				message: 'Verkkosivun osoite on virheellinen'
			});
		}

		// Validate URL array
		let urlArray = [];
		try {
			urlArray = url_array ? (typeof url_array === 'string' ? JSON.parse(url_array) : url_array) : [];
		} catch (e) {
			return res.status(400).json({
				success: false,
				message: 'Lisäverkkosivujen muoto on virheellinen'
			});
		}

		for (const singleUrl of urlArray) {
			if (singleUrl && !urlRegex.test(singleUrl)) {
				return res.status(400).json({
					success: false,
					message: 'Jokin lisäverkkosivun osoite on virheellinen'
				});
			}
		}

		// Sanitize notes length
		const sanitizedNotes = notes ? notes.substring(0, 500) : null;

		// Generate unique ID for pending sauna
		const pendingId = `pending_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

		// Insert into pending_saunas table
		await dbRun(`
			INSERT INTO pending_saunas (
				id, owner_email, name, location, capacity, event_length,
				price_min, price_max, equipment, email, phone, url,
				notes, winter, status, created_at
			) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', datetime('now'))
		`, [
			pendingId, owner_email, name, location, capacity, event_length,
			price_min, price_max, equipment || '[]', email, phone, url,
			sanitizedNotes, winter ? 1 : 0
		]);

		// Send email notification to admin
		try {
			await sendAdminNotificationEmail({
				id: pendingId,
				name,
				location,
				capacity,
				price_min,
				price_max,
				owner_email,
				owner_name,
				owner_phone,
				email,
				phone
			});
		} catch (emailError) {
			// Log email error but don't fail the registration
			console.error('❌ Failed to send admin notification email:', emailError);
		}

		res.json({
			success: true,
			message: 'Rekisteröinti lähetetty onnistuneesti! Saat vahvistuksen sähköpostitse, kun rekisteröinti on käsitelty.',
			registrationId: pendingId
		});

	} catch (error) {
		console.error('Error processing sauna registration:', error);
		res.status(500).json({
			success: false,
			message: 'Palvelimella tapahtui virhe rekisteröinnin käsittelyssä'
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
			equipment, email, phone, url, url_array, notes, winter
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
        phone = ?, url = ?, url_array = ?, notes = ?, winter = ?,
        updated_at = datetime('now')
      WHERE id = ?
    `, [
			name, location, capacity, event_length, price_min, price_max,
			JSON.stringify(equipment || []), email, phone, url,
			JSON.stringify(url_array || []), notes, winter ? 1 : 0, id
		]);

		// Get updated sauna
		const updatedSauna = await dbGet('SELECT * FROM saunas WHERE id = ?', [id]);

		// Transform data for frontend compatibility
		const transformedSauna = {
			...updatedSauna,
			pricemin: updatedSauna.price_min,
			pricemax: updatedSauna.price_max,
			eventLength: updatedSauna.event_length,
			mainImage: updatedSauna.main_image,
			equipment: updatedSauna.equipment ? JSON.parse(updatedSauna.equipment) : [],
			images: updatedSauna.images ? JSON.parse(updatedSauna.images) : [],
			urlArray: updatedSauna.url_array ? JSON.parse(updatedSauna.url_array) : [],
			winter: updatedSauna.winter === 1
		};

		res.json({
			success: true,
			message: 'Sauna päivitetty onnistuneesti',
			sauna: transformedSauna
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
		const isAdmin = req.user.isAdmin;

		let saunas;
		if (isAdmin) {
			// Admins can see all saunas
			saunas = await dbAll(`
        SELECT s.*, 'admin' as role FROM saunas s
        ORDER BY s.name
      `);
		} else {
			// Regular users see only their owned saunas
			saunas = await dbAll(`
        SELECT s.*, us.role FROM saunas s
        JOIN user_saunas us ON s.id = us.sauna_id
        WHERE us.user_id = ?
        ORDER BY s.name
      `, [userId]);
		}

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
			winter: sauna.winter === 1,
			visible: sauna.visible === 1
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

// Image management endpoints (protected)

// Upload images for a sauna
app.post('/api/sauna/:id/images/upload', authenticateToken, upload.array('images'), async (req, res) => {
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

		// Get current sauna data
		const sauna = await dbGet('SELECT * FROM saunas WHERE id = ?', [id]);
		if (!sauna) {
			return res.status(404).json({
				success: false,
				message: 'Saunaa ei löytynyt'
			});
		}

		// Check if files were uploaded
		if (!req.files || req.files.length === 0) {
			return res.status(400).json({
				success: false,
				message: 'Ei kuvia ladattavaksi'
			});
		}

		// Get current images
		const currentImages = sauna.images ? JSON.parse(sauna.images) : [];

		// Check image limit (15 images max)
		if (currentImages.length + req.files.length > 15) {
			return res.status(400).json({
				success: false,
				message: `Maksimi kuvia on 15. Sinulla on jo ${currentImages.length} kuvaa.`
			});
		}

		// Process uploaded images
		console.log(`📤 Processing ${req.files.length} uploaded files`);
		const processedImages = [];
		for (const file of req.files) {
			console.log(`📋 File: ${file.originalname}, Size: ${file.size} bytes, Type: ${file.mimetype}`);
			const uniqueFilename = `${uuidv4()}-${file.originalname}`;
			const processedFilename = await processImage(file.buffer, uniqueFilename);
			processedImages.push(processedFilename);
		}
		console.log('✅ All images processed:', processedImages);

		// Update database with new images
		const updatedImages = [...currentImages, ...processedImages];
		await dbRun(`
			UPDATE saunas SET
				images = ?,
				main_image = CASE 
					WHEN main_image IS NULL OR main_image = '' THEN ?
					ELSE main_image
				END,
				updated_at = datetime('now')
			WHERE id = ?
		`, [JSON.stringify(updatedImages), processedImages[0], id]);

		res.json({
			success: true,
			message: `${processedImages.length} kuvaa ladattu onnistuneesti`,
			images: processedImages
		});

	} catch (error) {
		console.error('Error uploading images:', error);
		res.status(500).json({
			success: false,
			message: 'Virhe kuvien lataamisessa'
		});
	}
});

// Delete an image from a sauna
app.delete('/api/sauna/:id/images/:filename', authenticateToken, async (req, res) => {
	try {
		const { id, filename } = req.params;
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

		// Get current sauna data
		const sauna = await dbGet('SELECT * FROM saunas WHERE id = ?', [id]);
		if (!sauna) {
			return res.status(404).json({
				success: false,
				message: 'Saunaa ei löytynyt'
			});
		}

		// Get current images
		const currentImages = sauna.images ? JSON.parse(sauna.images) : [];

		// Check if image exists in the array
		if (!currentImages.includes(filename)) {
			return res.status(404).json({
				success: false,
				message: 'Kuvaa ei löytynyt'
			});
		}

		// Remove image from array
		const updatedImages = currentImages.filter(img => img !== filename);

		// Determine new main image if the deleted image was the main image
		let newMainImage = sauna.main_image;
		if (sauna.main_image === filename) {
			newMainImage = updatedImages.length > 0 ? updatedImages[0] : null;
		}

		// Update database
		await dbRun(`
			UPDATE saunas SET
				images = ?,
				main_image = ?,
				updated_at = datetime('now')
			WHERE id = ?
		`, [JSON.stringify(updatedImages), newMainImage, id]);

		// Delete physical file
		try {
			const filePath = path.join(imagesDir, filename);
			await fs.unlink(filePath);
		} catch (fileError) {
			console.warn('Could not delete physical file:', filename, fileError.message);
		}

		res.json({
			success: true,
			message: 'Kuva poistettu onnistuneesti',
			deletedImage: filename,
			newMainImage: newMainImage
		});

	} catch (error) {
		console.error('Error deleting image:', error);
		res.status(500).json({
			success: false,
			message: 'Virhe kuvan poistamisessa'
		});
	}
});

// Reorder images for a sauna
app.put('/api/sauna/:id/images/order', authenticateToken, async (req, res) => {
	try {
		const { id } = req.params;
		const { imageOrder } = req.body;
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

		// Validate image order array
		if (!Array.isArray(imageOrder)) {
			return res.status(400).json({
				success: false,
				message: 'Kuvien järjestys täytyy olla lista'
			});
		}

		// Get current sauna data
		const sauna = await dbGet('SELECT * FROM saunas WHERE id = ?', [id]);
		if (!sauna) {
			return res.status(404).json({
				success: false,
				message: 'Saunaa ei löytynyt'
			});
		}

		// Get current images
		const currentImages = sauna.images ? JSON.parse(sauna.images) : [];

		// Validate that all images in the order exist in current images
		const invalidImages = imageOrder.filter(img => !currentImages.includes(img));
		if (invalidImages.length > 0) {
			return res.status(400).json({
				success: false,
				message: 'Järjestyksessä on kuvia, jotka eivät kuulu saunaan'
			});
		}

		// Update database with new order
		await dbRun(`
			UPDATE saunas SET
				images = ?,
				updated_at = datetime('now')
			WHERE id = ?
		`, [JSON.stringify(imageOrder), id]);

		res.json({
			success: true,
			message: 'Kuvien järjestys päivitetty onnistuneesti',
			imageOrder: imageOrder
		});

	} catch (error) {
		console.error('Error reordering images:', error);
		res.status(500).json({
			success: false,
			message: 'Virhe kuvien järjestämisessä'
		});
	}
});

// Set main image for a sauna
app.put('/api/sauna/:id/images/main', authenticateToken, async (req, res) => {
	try {
		const { id } = req.params;
		const { mainImage } = req.body;
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

		// Get current sauna data
		const sauna = await dbGet('SELECT * FROM saunas WHERE id = ?', [id]);
		if (!sauna) {
			return res.status(404).json({
				success: false,
				message: 'Saunaa ei löytynyt'
			});
		}

		// Get current images
		const currentImages = sauna.images ? JSON.parse(sauna.images) : [];

		// Check if the specified image exists
		if (!currentImages.includes(mainImage)) {
			return res.status(400).json({
				success: false,
				message: 'Pääkuva ei löydy saunan kuvista'
			});
		}

		// Update database
		await dbRun(`
			UPDATE saunas SET
				main_image = ?,
				updated_at = datetime('now')
			WHERE id = ?
		`, [mainImage, id]);

		res.json({
			success: true,
			message: 'Pääkuva asetettu onnistuneesti',
			mainImage: mainImage
		});

	} catch (error) {
		console.error('Error setting main image:', error);
		res.status(500).json({
			success: false,
			message: 'Virhe pääkuvan asettamisessa'
		});
	}
});

// Create new sauna (admin only)
app.post('/api/admin/sauna', authenticateToken, async (req, res) => {
	try {
		// Check if user is admin
		if (!req.user.isAdmin) {
			return res.status(403).json({
				success: false,
				message: 'Admin-oikeudet vaaditaan'
			});
		}

		const {
			name, url_name, location, capacity, event_length,
			price_min, price_max, equipment, images, main_image,
			email, phone, url, url_array, notes, winter, owner_email
		} = req.body;

		// Validate required fields
		if (!name || !url_name || !location || !capacity || !event_length ||
			!price_min || !price_max || !email || !phone || !owner_email) {
			return res.status(400).json({
				success: false,
				message: 'Pakolliset kentät puuttuvat'
			});
		}

		// Check if URL name is unique
		const existingSauna = await dbGet('SELECT id FROM saunas WHERE url_name = ?', [url_name]);
		if (existingSauna) {
			return res.status(400).json({
				success: false,
				message: 'URL-nimi on jo käytössä'
			});
		}

		// Generate unique sauna ID
		const saunaId = `sauna-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

		// Create sauna
		await dbRun(`
			INSERT INTO saunas (
				id, owner_email, name, url_name, location, capacity, event_length,
				price_min, price_max, equipment, images, main_image, email, phone,
				url, url_array, notes, winter, created_at, updated_at
			) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
		`, [
			saunaId, owner_email, name, url_name, location, capacity, event_length,
			price_min, price_max, equipment || '[]', images || '[]', main_image || '',
			email, phone, url || '', url_array || '[]', notes || '', winter ? 1 : 0
		]);

		// Find or create user account for the owner
		let user = await dbGet('SELECT * FROM users WHERE email = ?', [owner_email]);

		if (!user) {
			// Create new user account
			const userId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
			await dbRun(`
				INSERT INTO users (id, email, name, email_verified, status, created_at, updated_at)
				VALUES (?, ?, ?, 1, 'active', datetime('now'), datetime('now'))
			`, [userId, owner_email, owner_email]);

			user = await dbGet('SELECT * FROM users WHERE id = ?', [userId]);
		}

		// Link user to sauna
		await dbRun(`
			INSERT INTO user_saunas (user_id, sauna_id, role, created_at)
			VALUES (?, ?, 'owner', datetime('now'))
		`, [user.id, saunaId]);

		console.log('Admin created sauna:', name, 'for', owner_email, 'by admin:', req.user.email);

		res.json({
			success: true,
			message: 'Sauna luotu onnistuneesti',
			saunaId: saunaId,
			urlName: url_name
		});

	} catch (error) {
		console.error('Error creating sauna:', error);
		res.status(500).json({
			success: false,
			message: 'Virhe saunan luomisessa'
		});
	}
});

// Toggle sauna visibility (admin only)
app.put('/api/admin/sauna/:id/visibility', authenticateToken, async (req, res) => {
	try {
		// Check if user is admin
		if (!req.user.isAdmin) {
			return res.status(403).json({
				success: false,
				message: 'Admin-oikeudet vaaditaan'
			});
		}

		const { id } = req.params;
		const { visible } = req.body;

		// Update sauna visibility
		await dbRun(
			'UPDATE saunas SET visible = ?, updated_at = datetime("now") WHERE id = ?',
			[visible ? 1 : 0, id]
		);

		console.log('Admin toggled sauna visibility:', id, 'to', visible, 'by', req.user.email);

		res.json({
			success: true,
			message: visible ? 'Sauna näkyy nyt julkisesti' : 'Sauna piilotettu julkisesta näkymästä'
		});

	} catch (error) {
		console.error('Error toggling sauna visibility:', error);
		res.status(500).json({
			success: false,
			message: 'Virhe näkyvyyden vaihtamisessa'
		});
	}
});

// Delete sauna (admin only)
app.delete('/api/admin/sauna/:id', authenticateToken, async (req, res) => {
	try {
		// Check if user is admin
		if (!req.user.isAdmin) {
			return res.status(403).json({
				success: false,
				message: 'Admin-oikeudet vaaditaan'
			});
		}

		const { id } = req.params;

		// Get sauna info before deletion
		const sauna = await dbGet('SELECT name, owner_email FROM saunas WHERE id = ?', [id]);
		if (!sauna) {
			return res.status(404).json({
				success: false,
				message: 'Saunaa ei löytynyt'
			});
		}

		// Delete sauna and related data
		await dbRun('DELETE FROM user_saunas WHERE sauna_id = ?', [id]);
		await dbRun('DELETE FROM saunas WHERE id = ?', [id]);

		console.log('Admin deleted sauna:', sauna.name, 'owned by', sauna.owner_email, 'by admin:', req.user.email);

		res.json({
			success: true,
			message: `Sauna "${sauna.name}" poistettu onnistuneesti`
		});

	} catch (error) {
		console.error('Error deleting sauna:', error);
		res.status(500).json({
			success: false,
			message: 'Virhe saunan poistamisessa'
		});
	}
});

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

// Approve pending sauna registration (admin only)
app.put('/api/admin/pending/:id/approve', authenticateToken, async (req, res) => {
	try {
		// Check if user is admin
		if (!req.user.isAdmin) {
			return res.status(403).json({
				success: false,
				message: 'Admin-oikeudet vaaditaan'
			});
		}

		const { id } = req.params;
		const adminUserId = req.user.userId;

		// Get pending sauna registration
		const pendingSauna = await dbGet(`
			SELECT * FROM pending_saunas 
			WHERE id = ? AND status = 'pending'
		`, [id]);

		if (!pendingSauna) {
			return res.status(404).json({
				success: false,
				message: 'Odottavaa saunarekisteröintiä ei löytynyt'
			});
		}

		// Generate unique URL name
		const baseUrlName = pendingSauna.name.toLowerCase()
			.replace(/[åäö]/g, (match) => ({ å: 'a', ä: 'a', ö: 'o' }[match]))
			.replace(/[^a-z0-9]/g, '-')
			.replace(/-+/g, '-')
			.replace(/^-|-$/g, '');

		let urlName = baseUrlName;
		let counter = 1;
		while (await dbGet('SELECT id FROM saunas WHERE url_name = ?', [urlName])) {
			urlName = `${baseUrlName}-${counter}`;
			counter++;
		}

		// Create new sauna from pending registration
		const saunaId = `sauna-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

		await dbRun(`
			INSERT INTO saunas (
				id, owner_email, name, url_name, location, capacity, event_length,
				price_min, price_max, equipment, images, main_image, email, phone,
				url, url_array, notes, winter, created_at, updated_at
			) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
		`, [
			saunaId, pendingSauna.owner_email, pendingSauna.name, urlName,
			pendingSauna.location, pendingSauna.capacity, pendingSauna.event_length,
			pendingSauna.price_min, pendingSauna.price_max, pendingSauna.equipment,
			'[]', '', pendingSauna.email, pendingSauna.phone,
			pendingSauna.url || '', '[]', pendingSauna.notes || '',
			pendingSauna.winter,
		]);

		// Find or create user account for the owner
		let user = await dbGet('SELECT * FROM users WHERE email = ?', [pendingSauna.owner_email]);

		if (!user) {
			// Create new user account
			const userId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
			await dbRun(`
				INSERT INTO users (id, email, name, email_verified, status, created_at, updated_at)
				VALUES (?, ?, ?, 1, 'active', datetime('now'), datetime('now'))
			`, [userId, pendingSauna.owner_email, pendingSauna.owner_email]);

			user = await dbGet('SELECT * FROM users WHERE id = ?', [userId]);
		}

		// Link user to sauna
		await dbRun(`
			INSERT INTO user_saunas (user_id, sauna_id, role, created_at)
			VALUES (?, ?, 'owner', datetime('now'))
		`, [user.id, saunaId]);

		// Update pending registration status
		await dbRun(`
			UPDATE pending_saunas SET
				status = 'approved',
				reviewed_by = ?,
				reviewed_at = datetime('now'),
				updated_at = datetime('now')
			WHERE id = ?
		`, [adminUserId, id]);

		// TODO: Send approval email to owner
		console.log('Sauna approved:', pendingSauna.name, 'for', pendingSauna.owner_email);

		res.json({
			success: true,
			message: 'Saunarekisteröinti hyväksytty onnistuneesti',
			saunaId: saunaId,
			urlName: urlName
		});

	} catch (error) {
		console.error('Error approving sauna registration:', error);
		res.status(500).json({
			success: false,
			message: 'Virhe saunarekisteröinnin hyväksymisessä'
		});
	}
});

// Reject pending sauna registration (admin only)
app.delete('/api/admin/pending/:id/reject', authenticateToken, async (req, res) => {
	try {
		// Check if user is admin
		if (!req.user.isAdmin) {
			return res.status(403).json({
				success: false,
				message: 'Admin-oikeudet vaaditaan'
			});
		}

		const { id } = req.params;
		const { reason } = req.body;
		const adminUserId = req.user.userId;

		// Get pending sauna registration
		const pendingSauna = await dbGet(`
			SELECT * FROM pending_saunas 
			WHERE id = ? AND status = 'pending'
		`, [id]);

		if (!pendingSauna) {
			return res.status(404).json({
				success: false,
				message: 'Odottavaa saunarekisteröintiä ei löytynyt'
			});
		}

		// Update pending registration status
		await dbRun(`
			UPDATE pending_saunas SET
				status = 'rejected',
				reviewed_by = ?,
				reviewed_at = datetime('now'),
				rejection_reason = ?,
				updated_at = datetime('now')
			WHERE id = ?
		`, [adminUserId, reason || 'Ei syytä annettu', id]);

		// TODO: Send rejection email to applicant
		console.log('Sauna rejected:', pendingSauna.name, 'for', pendingSauna.owner_email, 'Reason:', reason);

		res.json({
			success: true,
			message: 'Saunarekisteröinti hylätty'
		});

	} catch (error) {
		console.error('Error rejecting sauna registration:', error);
		res.status(500).json({
			success: false,
			message: 'Virhe saunarekisteröinnin hylkäämisessä'
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
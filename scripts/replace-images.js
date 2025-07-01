const fs = require('fs');
const path = require('path');

const IMAGES_DIR = path.join(__dirname, '../public/images');
const OPTIMIZED_DIR = path.join(__dirname, '../public/images-optimized');
const BACKUP_DIR = path.join(__dirname, '../public/images-backup');

async function replaceImages() {
	// Create backup directory
	if (!fs.existsSync(BACKUP_DIR)) {
		fs.mkdirSync(BACKUP_DIR, { recursive: true });
		console.log('📁 Created backup directory');
	}

	// Get all optimized images
	if (!fs.existsSync(OPTIMIZED_DIR)) {
		console.error('❌ Optimized images directory not found. Run npm run optimize-images first.');
		process.exit(1);
	}

	const optimizedFiles = fs.readdirSync(OPTIMIZED_DIR);

	console.log(`🔄 Replacing ${optimizedFiles.length} images...\n`);

	for (const file of optimizedFiles) {
		const originalPath = path.join(IMAGES_DIR, file);
		const optimizedPath = path.join(OPTIMIZED_DIR, file);
		const backupPath = path.join(BACKUP_DIR, file);

		try {
			// Backup original
			if (fs.existsSync(originalPath)) {
				fs.copyFileSync(originalPath, backupPath);
			}

			// Replace with optimized
			fs.copyFileSync(optimizedPath, originalPath);

			console.log(`✓ Replaced ${file}`);
		} catch (error) {
			console.error(`❌ Error replacing ${file}:`, error);
		}
	}

	console.log(`\n✅ Image replacement complete!`);
	console.log(`📁 Original images backed up to: ${BACKUP_DIR}`);
	console.log(`🧹 You can now remove the optimized directory: rm -rf ${OPTIMIZED_DIR}`);
}

replaceImages().catch(console.error); 
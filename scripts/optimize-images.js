const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const IMAGES_DIR = path.join(__dirname, '../public/images');
const OPTIMIZED_DIR = path.join(__dirname, '../public/images-optimized');

// Create optimized directory if it doesn't exist
if (!fs.existsSync(OPTIMIZED_DIR)) {
	fs.mkdirSync(OPTIMIZED_DIR, { recursive: true });
}

async function optimizeImage(inputPath, outputPath) {
	try {
		const stats = fs.statSync(inputPath);
		const fileSizeKB = Math.round(stats.size / 1024);

		console.log(`Processing: ${path.basename(inputPath)} (${fileSizeKB}KB)`);

		await sharp(inputPath)
			.resize(1920, 1080, {
				fit: 'inside',
				withoutEnlargement: true
			})
			.jpeg({
				quality: 82,
				progressive: true,
				mozjpeg: true
			})
			.toFile(outputPath);

		const newStats = fs.statSync(outputPath);
		const newFileSizeKB = Math.round(newStats.size / 1024);
		const savings = Math.round(((stats.size - newStats.size) / stats.size) * 100);

		console.log(`✓ Optimized: ${fileSizeKB}KB → ${newFileSizeKB}KB (${savings}% reduction)`);

		return {
			original: fileSizeKB,
			optimized: newFileSizeKB,
			savings: savings
		};
	} catch (error) {
		console.error(`Error processing ${inputPath}:`, error);
		return null;
	}
}

async function optimizeAllImages() {
	const files = fs.readdirSync(IMAGES_DIR);
	const imageFiles = files.filter(file =>
		/\.(jpg|jpeg|png)$/i.test(file)
	);

	// Sort by file size (largest first) to prioritize big wins
	const fileStats = imageFiles.map(file => {
		const fullPath = path.join(IMAGES_DIR, file);
		const stats = fs.statSync(fullPath);
		return { file, size: stats.size, fullPath };
	}).sort((a, b) => b.size - a.size);

	console.log(`Found ${imageFiles.length} images to optimize\n`);

	let totalOriginal = 0;
	let totalOptimized = 0;

	for (const { file, size, fullPath } of fileStats) {
		const outputPath = path.join(OPTIMIZED_DIR, file);
		const result = await optimizeImage(fullPath, outputPath);

		if (result) {
			totalOriginal += result.original;
			totalOptimized += result.optimized;
		}
	}

	const totalSavings = Math.round(((totalOriginal - totalOptimized) / totalOriginal) * 100);
	console.log(`\n📊 Total optimization results:`);
	console.log(`Original: ${totalOriginal}KB`);
	console.log(`Optimized: ${totalOptimized}KB`);
	console.log(`Total savings: ${totalSavings}%`);
	console.log(`\n💡 Review the optimized images in ${OPTIMIZED_DIR}`);
	console.log(`If satisfied, run: npm run replace-images`);
}

optimizeAllImages().catch(console.error); 
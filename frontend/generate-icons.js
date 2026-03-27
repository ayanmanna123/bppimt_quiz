import Jimp from 'jimp';
import path from 'path';

async function generateIcons() {
  try {
    const inputImagePath = path.join(process.cwd(), 'public', 'img-1.png');
    const out192 = path.join(process.cwd(), 'public', 'pwa-192x192.png');
    const out512 = path.join(process.cwd(), 'public', 'pwa-512x512.png');

    console.log(`Reading: ${inputImagePath}`);
    const image = await Jimp.read(inputImagePath);
    
    // Resize and save 192x192
    image.clone().resize(192, 192).write(out192);
    console.log(`Saved: ${out192}`);
    
    // Resize and save 512x512
    image.clone().resize(512, 512).write(out512);
    console.log(`Saved: ${out512}`);

  } catch (err) {
    console.error('Error generating icons:', err);
  }
}

generateIcons();

import axios from 'axios';
import fs from 'fs';

const url = 'https://res.cloudinary.com/dxqdvzuog/image/upload/pg_1/v1770780778/bppimt_quiz_notes/tfqb9a6f1ebuacmobspd.jpg';

const downloadImage = async () => {
    try {
        console.log(`Downloading ${url}...`);
        const response = await axios.get(url, { responseType: 'stream' });

        const writer = fs.createWriteStream('test_image.jpg');
        response.data.pipe(writer);

        return new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });

    } catch (error) {
        console.error("Error downloading image:", error.message);
        if (error.response) {
            console.error("Status:", error.response.status);
            console.error("Headers:", error.response.headers);
        }
    }
};

downloadImage().then(() => console.log("Done. Check test_image.jpg"));

import axios from 'axios';
import fs from 'fs';
import archiver from 'archiver';

const files = [
    'https://res.cloudinary.com/dxqdvzuog/image/upload/pg_1/v1770780778/bppimt_quiz_notes/tfqb9a6f1ebuacmobspd.jpg',
    'https://res.cloudinary.com/dxqdvzuog/image/upload/pg_2/v1770780778/bppimt_quiz_notes/tfqb9a6f1ebuacmobspd.jpg'
];

const createZip = async () => {
    console.log("Starting zip creation...");
    const output = fs.createWriteStream('test_output.zip');
    const archive = archiver('zip', {
        zlib: { level: 9 }
    });

    output.on('close', function () {
        console.log(archive.pointer() + ' total bytes');
        console.log('archiver has been finalized and the output file descriptor has closed.');
    });

    output.on('end', function () {
        console.log('Data has been drained');
    });

    archive.on('warning', function (err) {
        if (err.code === 'ENOENT') {
            console.warn(err);
        } else {
            throw err;
        }
    });

    archive.on('error', function (err) {
        throw err;
    });

    archive.pipe(output);

    for (let i = 0; i < files.length; i++) {
        const url = files[i];
        console.log(`Fetching ${url}...`);
        const response = await axios.get(url, { responseType: 'stream' });

        console.log(`Appending ${url}...`);
        archive.append(response.data, { name: `page_${i + 1}.jpg` });
    }

    console.log("Finalizing...");
    await archive.finalize();
    console.log("Finalized.");
};

createZip().catch(console.error);

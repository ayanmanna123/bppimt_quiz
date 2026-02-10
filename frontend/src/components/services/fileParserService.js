import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';
import JSZip from 'jszip';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export const parseFile = async (file) => {
    const fileType = file.name.split('.').pop().toLowerCase();

    if (fileType === 'pdf') {
        return await parsePDF(file);
    } else if (fileType === 'docx') {
        return await parseDOCX(file);
    } else if (fileType === 'pptx') {
        return await parsePPTX(file);
    } else if (fileType === 'txt') {
        return await parseTXT(file);
    } else {
        throw new Error('Unsupported file type');
    }
};

const parsePDF = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let text = '';

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items.map((item) => item.str).join(' ');
        text += pageText + '\n';
    }

    return text;
};

const parseDOCX = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
};

const parsePPTX = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const zip = await JSZip.loadAsync(arrayBuffer);
    let text = '';

    // Find all slide files
    const slideFiles = Object.keys(zip.files).filter(
        (fileName) => fileName.startsWith('ppt/slides/slide') && fileName.endsWith('.xml')
    );

    // Sort slides to maintain order (slide1, slide2, ...)
    slideFiles.sort((a, b) => {
        const numA = parseInt(a.match(/slide(\d+)\.xml/)[1]);
        const numB = parseInt(b.match(/slide(\d+)\.xml/)[1]);
        return numA - numB;
    });

    for (const slideFile of slideFiles) {
        const slideContent = await zip.files[slideFile].async('string');
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(slideContent, 'text/xml');

        // Extract text from <a:t> tags
        const textNodes = xmlDoc.getElementsByTagName('a:t');
        let slideText = '';
        for (let i = 0; i < textNodes.length; i++) {
            slideText += textNodes[i].textContent + ' ';
        }

        text += `[Slide ${slideFiles.indexOf(slideFile) + 1}]\n${slideText}\n\n`;
    }

    return text;
};

const parseTXT = async (file) => {
    return await file.text();
};

import * as faceapi from '@vladmandic/face-api';

// Using a reliable CDN for models to avoid local serving issues or corrupted files
const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/';

export const loadModels = async () => {
    try {
        console.log('Loading face detection models from CDN...');
        // Loading more robust models for better results
        await Promise.all([
            faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL), // More accurate than TinyFaceDetector
            faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
            faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);
        console.log('Face models loaded successfully');
    } catch (error) {
        console.error('Error loading face models:', error);
        throw error;
    }
};

export const getFaceDescriptor = async (videoElement) => {
    try {
        // Using SSD Mobilenet for detection (requires models to be loaded first)
        const detection = await faceapi
            .detectSingleFace(videoElement, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 }))
            .withFaceLandmarks()
            .withFaceDescriptor();

        if (!detection) {
            return null;
        }

        return Array.from(detection.descriptor);
    } catch (error) {
        console.error('Error getting face descriptor:', error);
        return null;
    }
};

export const compareFaces = (descriptor1, descriptor2, threshold = 0.6) => {
    if (!descriptor1 || !descriptor2) return false;
    const distance = faceapi.euclideanDistance(descriptor1, descriptor2);
    return distance < threshold;
};

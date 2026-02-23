import * as faceapi from '@vladmandic/face-api';

// Using a reliable CDN for models to avoid local serving issues or corrupted files
const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/';

export const loadModels = async () => {
    try {
        console.log('Loading face detection models from CDN...');
        // Loading models - including TinyFaceDetector for fast liveness tracking
        await Promise.all([
            faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
            faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL), // Added for performance in liveness loop
            faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
            faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);
        console.log('Face models loaded successfully');
    } catch (error) {
        console.error('Error loading face models:', error);
        throw error;
    }
};

export const getFaceDescriptor = async (videoElement, useFast = false) => {
    try {
        // Use TinyFaceDetector for "fast" mode (liveness) to maintain high FPS
        // Increased inputSize to 320 for better quality landmarks
        const options = useFast
            ? new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.5 })
            : new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 });

        const detection = await faceapi
            .detectSingleFace(videoElement, options)
            .withFaceLandmarks()
            .withFaceDescriptor();

        if (!detection) {
            return null;
        }

        return {
            descriptor: Array.from(detection.descriptor),
            landmarks: detection.landmarks
        };
    } catch (error) {
        console.error('Error getting face descriptor:', error);
        return null;
    }
};

/**
 * Calculate Eye Aspect Ratio (EAR)
 * Measures how open the eye is.
 */
export const calculateEAR = (landmarks) => {
    if (!landmarks) return 0;

    try {
        const leftEye = landmarks.getLeftEye();
        const rightEye = landmarks.getRightEye();

        if (!leftEye || leftEye.length < 6 || !rightEye || rightEye.length < 6) {
            return 0;
        }

        const getEyeEAR = (eye) => {
            // Vertical distances
            const v1 = Math.sqrt(Math.pow(eye[1].x - eye[5].x, 2) + Math.pow(eye[1].y - eye[5].y, 2));
            const v2 = Math.sqrt(Math.pow(eye[2].x - eye[4].x, 2) + Math.pow(eye[2].y - eye[4].y, 2));
            // Horizontal distance
            const h = Math.sqrt(Math.pow(eye[0].x - eye[3].x, 2) + Math.pow(eye[0].y - eye[3].y, 2));

            if (h === 0) return 0;
            return (v1 + v2) / (2.0 * h);
        };

        const leftEAR = getEyeEAR(leftEye);
        const rightEAR = getEyeEAR(rightEye);

        return (leftEAR + rightEAR) / 2.0;
    } catch (e) {
        console.error("EAR Calculation error:", e);
        return 0;
    }
};

export const compareFaces = (descriptor1, descriptor2, threshold = 0.6) => {
    if (!descriptor1 || !descriptor2) return false;
    const distance = faceapi.euclideanDistance(descriptor1, descriptor2);
    return distance < threshold;
};

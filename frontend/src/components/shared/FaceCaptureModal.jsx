import React, { useRef, useState, useEffect } from 'react';
import Webcam from 'react-webcam';
import { loadModels, getFaceDescriptor } from '../services/FaceService';
import { Button } from '../ui/button';
import { Camera, X, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FaceCaptureModal = ({ isOpen, onClose, onCapture, title = "Face Verification" }) => {
    const webcamRef = useRef(null);
    const [isModelsLoaded, setIsModelsLoaded] = useState(false);
    const [error, setError] = useState(null);
    const [isCapturing, setIsCapturing] = useState(false);
    const [capturedDescriptor, setCapturedDescriptor] = useState(null);
    const [capturedImage, setCapturedImage] = useState(null);

    useEffect(() => {
        if (isOpen && !isModelsLoaded) {
            loadModels().then(() => setIsModelsLoaded(true)).catch(err => setError("Failed to load face detection models"));
        }
    }, [isOpen]);

    const handleCapture = async () => {
        if (!webcamRef.current) return;

        setIsCapturing(true);
        setError(null);

        try {
            const video = webcamRef.current.video;
            const descriptor = await getFaceDescriptor(video);

            if (descriptor) {
                setCapturedDescriptor(descriptor);
                setCapturedImage(webcamRef.current.getScreenshot());
            } else {
                setError("Face not detected. Please make sure your face is visible and properly lit.");
            }
        } catch (err) {
            console.error(err);
            setError("An error occurred during capture. Please try again.");
        } finally {
            setIsCapturing(false);
        }
    };

    const handleConfirm = () => {
        onCapture(capturedDescriptor, capturedImage);
        onClose();
    };

    const handleRetry = () => {
        setCapturedDescriptor(null);
        setCapturedImage(null);
        setError(null);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 dark:border-slate-800"
                >
                    <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                        <h2 className="text-xl font-bold dark:text-white flex items-center gap-2">
                            <Camera className="w-5 h-5 text-indigo-500" />
                            {title}
                        </h2>
                        <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors">
                            <X className="w-5 h-5 dark:text-slate-400" />
                        </button>
                    </div>

                    <div className="p-6 flex flex-col items-center gap-6">
                        {!isModelsLoaded && !error ? (
                            <div className="flex flex-col items-center gap-4 py-12">
                                <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                                <p className="text-slate-500 dark:text-slate-400 font-medium">Initializing camera and models...</p>
                            </div>
                        ) : error ? (
                            <div className="flex flex-col items-center gap-4 text-center py-8">
                                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                                    <AlertCircle className="w-8 h-8 text-red-500" />
                                </div>
                                <p className="text-red-600 dark:text-red-400 font-semibold">{error}</p>
                                <Button onClick={handleRetry} variant="outline" className="mt-2">Try Again</Button>
                            </div>
                        ) : capturedDescriptor ? (
                            <div className="flex flex-col items-center gap-6">
                                <div className="relative w-64 h-64 rounded-2xl overflow-hidden border-4 border-indigo-500 shadow-xl">
                                    <img src={capturedImage} alt="Captured face" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-indigo-500/10 flex items-center justify-center">
                                        <CheckCircle2 className="w-16 h-16 text-indigo-500 bg-white rounded-full p-2" />
                                    </div>
                                </div>
                                <p className="text-slate-600 dark:text-slate-400 text-sm font-medium text-center">
                                    Face captured successfully! Your face descriptor has been generated.
                                </p>
                                <div className="flex gap-4 w-full">
                                    <Button onClick={handleRetry} variant="outline" className="flex-1 py-6 rounded-2xl">
                                        <RefreshCw className="w-4 h-4 mr-2" />
                                        Retry
                                    </Button>
                                    <Button onClick={handleConfirm} className="flex-1 bg-indigo-600 hover:bg-indigo-700 py-6 rounded-2xl font-bold">
                                        Confirm
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-6">
                                <div className="relative w-64 h-64 rounded-2xl overflow-hidden border-4 border-slate-200 dark:border-slate-800 shadow-lg bg-slate-100 dark:bg-slate-800">
                                    <Webcam
                                        audio={false}
                                        ref={webcamRef}
                                        screenshotFormat="image/jpeg"
                                        className="w-full h-full object-cover"
                                        videoConstraints={{ width: 400, height: 400, facingMode: "user" }}
                                    />
                                    <div className="absolute inset-0 border-2 border-white/30 rounded-full m-8 border-dashed pointer-events-none"></div>
                                </div>
                                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium text-center">
                                    Position your face inside the circle and click the button below.
                                </p>
                                <Button
                                    onClick={handleCapture}
                                    disabled={isCapturing}
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 py-6 rounded-2xl font-bold text-lg shadow-lg"
                                >
                                    {isCapturing ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <Camera className="w-5 h-5 mr-2" />
                                            Capture Face
                                        </>
                                    )}
                                </Button>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default FaceCaptureModal;

import React, { useRef, useState, useEffect } from 'react';
import Webcam from 'react-webcam';
import * as faceapi from '@vladmandic/face-api';
import { loadModels, getFaceDescriptor, calculateEAR } from '../services/FaceService';
import { Button } from '../ui/button';
import { Camera, X, CheckCircle2, AlertCircle, RefreshCw, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FaceCaptureModal = ({ isOpen, onClose, onCapture, title = "Face Verification" }) => {
    const webcamRef = useRef(null);
    const canvasRef = useRef(null);
    const [isModelsLoaded, setIsModelsLoaded] = useState(false);
    const [error, setError] = useState(null);
    const [isCapturing, setIsCapturing] = useState(false);
    const [capturedDescriptor, setCapturedDescriptor] = useState(null);
    const [capturedImage, setCapturedImage] = useState(null);

    // Liveness states
    const [isLivenessPassed, setIsLivenessPassed] = useState(false);
    const [blinkCount, setBlinkCount] = useState(0);
    const [livenessStatus, setLivenessStatus] = useState("Initializing...");
    const [lastEar, setLastEar] = useState(0);
    const monitorRef = useRef(null);
    const earHistory = useRef([]);

    useEffect(() => {
        if (isOpen && !isModelsLoaded) {
            loadModels()
                .then(() => {
                    setIsModelsLoaded(true);
                    setLivenessStatus("Please blink to verify you're human");
                })
                .catch(err => setError("Failed to load face detection models"));
        }

        if (isOpen && isModelsLoaded && !isLivenessPassed) {
            startLivenessMonitor();
        }

        return () => stopLivenessMonitor();
    }, [isOpen, isModelsLoaded, isLivenessPassed]);

    const startLivenessMonitor = () => {
        if (monitorRef.current) return;

        const checkLiveness = async () => {
            if (!webcamRef.current || !webcamRef.current.video) return;

            try {
                const video = webcamRef.current.video;
                if (video.readyState !== 4) {
                    monitorRef.current = setTimeout(checkLiveness, 100);
                    return;
                }

                // Use fast mode (TinyFaceDetector) for the liveness loop
                const result = await getFaceDescriptor(video, true);

                // Draw landmarks for debug visualization
                if (canvasRef.current && result && result.landmarks) {
                    const displaySize = { width: video.videoWidth, height: video.videoHeight };

                    if (canvasRef.current.width !== displaySize.width) {
                        canvasRef.current.width = displaySize.width;
                        canvasRef.current.height = displaySize.height;
                    }

                    const ctx = canvasRef.current.getContext('2d');
                    ctx.clearRect(0, 0, displaySize.width, displaySize.height);

                    const resizedLandmarks = faceapi.resizeResults(result.landmarks, displaySize);

                    // Use a bright color for debugging
                    ctx.strokeStyle = '#00ff00';
                    ctx.fillStyle = '#00ff00';
                    faceapi.draw.drawFaceLandmarks(canvasRef.current, resizedLandmarks);

                    const ear = calculateEAR(result.landmarks);
                    setLastEar(ear);

                    ctx.fillStyle = ear < 0.25 ? "#ef4444" : "#22c55e";
                    ctx.font = 'bold 20px sans-serif';
                    ctx.fillText(`EAR: ${ear.toFixed(3)}`, 20, displaySize.height - 30);
                }

                if (result) {
                    const ear = calculateEAR(result.landmarks);
                    // Log EAR to console for the user to see
                    console.log(`[Liveness] EAR: ${ear.toFixed(4)} | History: ${earHistory.current.length} | Blink: ${blinkCount}`);

                    if (ear < 0.25) {
                        earHistory.current.push(true);
                        if (earHistory.current.length === 1) console.log("[Liveness] Eye drop detected!");
                    } else if (ear > 0.23) {
                        if (earHistory.current.length > 0) {
                            console.log("[Liveness] Eye recovery detected! SUCCESS.");
                            setBlinkCount(prev => {
                                const newCount = prev + 1;
                                if (newCount >= 1) {
                                    setIsLivenessPassed(true);
                                    setLivenessStatus("Liveness Verified!");
                                    stopLivenessMonitor();
                                }
                                return newCount;
                            });
                            earHistory.current = [];
                        }
                    }
                } else {
                    if (canvasRef.current) {
                        const ctx = canvasRef.current.getContext('2d');
                        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
                    }
                }
            } catch (err) {
                console.error("[Liveness] Monitor error:", err);
            }

            if (!isLivenessPassed) {
                // reduced from 150ms to 60ms for better responsiveness
                monitorRef.current = setTimeout(checkLiveness, 60);
            }
        };

        checkLiveness();
    };

    const stopLivenessMonitor = () => {
        if (monitorRef.current) {
            clearTimeout(monitorRef.current);
            monitorRef.current = null;
        }
    };

    const handleCapture = async () => {
        if (!webcamRef.current || !isLivenessPassed) return;

        setIsCapturing(true);
        setError(null);

        try {
            const video = webcamRef.current.video;
            const result = await getFaceDescriptor(video);

            if (result && result.descriptor) {
                setCapturedDescriptor(result.descriptor);
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
        setIsLivenessPassed(false);
        setBlinkCount(0);
        earHistory.current = [];
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
                                    <canvas
                                        ref={canvasRef}
                                        className="absolute inset-0 w-full h-full pointer-events-none"
                                    />
                                    {!isLivenessPassed && (
                                        <div className="absolute inset-0 border-4 border-indigo-500/50 rounded-full m-8 border-dashed animate-pulse pointer-events-none"></div>
                                    )}
                                </div>
                                <div className="flex flex-col items-center gap-2">
                                    <div className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 ${isLivenessPassed ? 'bg-green-100 text-green-700' : 'bg-indigo-100 text-indigo-700'}`}>
                                        {isLivenessPassed ? <CheckCircle2 className="w-4 h-4" /> : <Eye className="w-4 h-4 animate-bounce" />}
                                        {livenessStatus}
                                    </div>
                                    {!isLivenessPassed && (
                                        <div className="flex flex-col items-center">
                                            <p className="text-slate-500 dark:text-slate-400 text-xs font-medium text-center">
                                                Blink detected: {blinkCount}/1
                                            </p>
                                            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                                                Sensitivity: {lastEar.toFixed(3)} (Needs &lt; 0.25)
                                            </p>
                                        </div>
                                    )}
                                </div>
                                <Button
                                    onClick={handleCapture}
                                    disabled={isCapturing || !isLivenessPassed}
                                    className={`w-full py-6 rounded-2xl font-bold text-lg shadow-lg transition-all ${isLivenessPassed ? 'bg-indigo-600 hover:bg-indigo-700 opacity-100' : 'bg-slate-400 cursor-not-allowed opacity-50'}`}
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

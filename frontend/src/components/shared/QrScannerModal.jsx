import React, { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner, Html5Qrcode } from "html5-qrcode";
import { X, Camera, RefreshCw, MapPin } from "lucide-react";
import { toast } from "sonner";

const QrScannerModal = ({ isOpen, onClose, onScanSuccess }) => {
    const [scannerId] = useState(`qr-reader-${Math.random().toString(36).substr(2, 9)}`);
    const scannerRef = useRef(null);
    const [isScanning, setIsScanning] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const startScanner = async () => {
                try {
                    const html5QrCode = new Html5Qrcode(scannerId);
                    scannerRef.current = html5QrCode;
                    setIsScanning(true);

                    await html5QrCode.start(
                        { facingMode: "environment" },
                        {
                            fps: 10,
                            qrbox: { width: 250, height: 250 },
                        },
                        (decodedText) => {
                            // Success
                            onScanSuccess(decodedText);
                            stopScanner();
                        },
                        (errorMessage) => {
                            // Ignore constant "No QR code found" errors
                        }
                    );
                } catch (err) {
                    console.error("Scanner Error:", err);
                    toast.error("Failed to start camera. Please ensure camera permissions are granted.");
                    setIsScanning(false);
                }
            };

            startScanner();
        }

        return () => {
            stopScanner();
        };
    }, [isOpen, scannerId]);

    const stopScanner = async () => {
        if (scannerRef.current) {
            try {
                if (scannerRef.current.isScanning) {
                    await scannerRef.current.stop();
                }
                // Only clear if the scanner container still exists in the DOM
                const container = document.getElementById(scannerId);
                if (container) {
                    scannerRef.current.clear();
                }
            } catch (err) {
                // Ignore "Scanner not stopped" errors during unmount
                console.warn("Error during scanner cleanup:", err);
            } finally {
                scannerRef.current = null;
            }
        }
        setIsScanning(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-md">
            <div className="relative bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl max-w-lg w-full overflow-hidden border border-white/20 dark:border-slate-800 flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-gray-50/50 dark:bg-slate-900/50">
                    <div className="flex items-center gap-3">
                        <div className="bg-indigo-600 p-2 rounded-xl text-white">
                            <Camera className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Scan QR Code</h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Scan the QR code displayed by your teacher</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Scanner View */}
                <div className="p-8 flex flex-col items-center">
                    <div className="w-full aspect-square max-w-[320px] rounded-3xl overflow-hidden border-4 border-indigo-600 shadow-inner relative bg-black">
                        {/* 
                            CRITICAL: The scanner container must be EMPTY for html5-qrcode to manage it.
                            React-managed elements (like the loader) must be siblings, not children.
                        */}
                        <div id={scannerId} className="absolute inset-0 w-full h-full"></div>

                        {!isScanning && (
                            <div className="absolute inset-0 flex items-center justify-center text-white/50 z-10">
                                <RefreshCw className="w-10 h-10 animate-spin" />
                            </div>
                        )}
                    </div>

                    <div className="mt-8 flex items-center gap-3 bg-indigo-50 dark:bg-indigo-900/20 px-4 py-2 rounded-xl text-indigo-700 dark:text-indigo-400 text-sm font-medium border border-indigo-100 dark:border-indigo-800">
                        <MapPin className="w-4 h-4" />
                        <span>Verification requires GPS Location</span>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 bg-gray-50 dark:bg-slate-900/50 flex justify-center border-t border-gray-100 dark:border-slate-800">
                    <button
                        onClick={onClose}
                        className="px-8 py-3 rounded-2xl bg-gray-200 dark:bg-slate-800 text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-300 dark:hover:bg-slate-700 transition-all"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default QrScannerModal;

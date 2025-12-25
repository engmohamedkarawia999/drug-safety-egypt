import { useState, useRef } from 'react';
import Tesseract from 'tesseract.js';
import { Camera, Loader2, Plus, FileText } from 'lucide-react';
import { Drug } from '@/types';
import { searchDrug } from '@/lib/api';

interface OCRScannerProps {
    onDrugDetected: (drug: Drug) => void;
    isRTL: boolean;
    t: any;
}

export default function OCRScanner({ onDrugDetected, isRTL, t }: OCRScannerProps) {
    const [scanning, setScanning] = useState(false);
    const [progress, setProgress] = useState(0);
    const [detectedText, setDetectedText] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0]) return;

        const file = e.target.files[0];
        setScanning(true);
        setProgress(0);
        setDetectedText("");

        try {
            // Tesseract.js v5 pattern
            const worker = await Tesseract.createWorker('eng', 1, {
                logger: m => {
                    if (m.status === 'recognizing text') {
                        setProgress(Math.round(m.progress * 100));
                    }
                }
            });

            // Language already loaded by createWorker('eng')
            // await worker.loadLanguage('eng');
            // await worker.initialize('eng');

            const { data: { text } } = await worker.recognize(file);
            setDetectedText(text);

            // Basic extraction strategy:
            // 1. Split by newlines/spaces
            // 2. Filter short words
            // 3. Try to search top candidates
            processExtractedText(text);

            await worker.terminate();
        } catch (err) {
            console.error(err);
        } finally {
            setScanning(false);
        }
    };

    const processExtractedText = async (text: string) => {
        // Clean text
        const words = text.split(/[\s\n\r]+/)
            .map(w => w.replace(/[^a-zA-Z]/g, '')) // Keep simple for now
            .filter(w => w.length > 3);

        // We can't search EVERY word. 
        // Heuristic: Check words that look like Drugs (Capitalized? Rare?)
        // For prototype, we will just take unique top 10 unique words and search them?
        // Or just let user see text?

        // Better: Try to match known keywords from a small local list, OR just search the first few probable ones.
        // Let's try searching the first 5 4+ letter words concurrently.
        const uniqueWords = Array.from(new Set(words)).slice(0, 8); // Limit to 8 candidates

        for (const word of uniqueWords) {
            try {
                // Skip common trash words
                if (["tablet", "daily", "once", "twice", "tablets", "capsule", "mg", "take"].includes(word.toLowerCase())) continue;

                const res = await searchDrug(word);
                // If we get an exact-ish match
                if (res.results.length > 0) {
                    // Check if top result resembles the word
                    const top = res.results[0];
                    if (top.name.toLowerCase().includes(word.toLowerCase())) {
                        onDrugDetected(top);
                    }
                }
            } catch (e) {
                // ignore
            }
        }
    };

    return (
        <div className="mt-4">
            <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handleFileChange}
                disabled={scanning}
                aria-label="Upload Prescription Image"
                title="Upload Prescription Image"
            />
            <button
                onClick={() => fileInputRef.current?.click()}
                disabled={scanning}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl shadow-md hover:shadow-lg transition-all text-sm font-semibold active:scale-95 mx-auto"
            >
                {scanning ? (
                    <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {isRTL ? "جاري المسح..." : "Scanning..."} {progress}%
                    </>
                ) : (
                    <>
                        <Camera className="h-4 w-4" />
                        {isRTL ? "مسح الروشتة (Alpha)" : "Scan Prescription (Alpha)"}
                    </>
                )}
            </button>

            {/* Debug/Feedback Text */}
            {/* {detectedText && (
                <div className="mt-2 p-2 text-xs text-gray-400 bg-gray-50 rounded max-h-20 overflow-auto">
                    {detectedText}
                </div>
            )} */}
        </div>
    );
}

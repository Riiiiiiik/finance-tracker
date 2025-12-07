'use client';

import { useState, useRef } from 'react';
import { Camera, X, Check, Loader2, ScanLine } from 'lucide-react';
import Tesseract from 'tesseract.js';
import { parseSmartInput, detectCategory, CATEGORY_KEYWORDS } from '@/lib/smartParser';
import { useRouter } from 'next/navigation';

interface MonkVisionProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function MonkVision({ isOpen, onClose }: MonkVisionProps) {
    const [image, setImage] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [statusText, setStatusText] = useState('Inicializando...');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    if (!isOpen) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setImage(event.target?.result as string);
                processImage(event.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const processImage = async (imgData: string) => {
        setIsProcessing(true);
        setProgress(0);
        setStatusText('Inicializando Olho Monástico...');

        try {
            const result = await Tesseract.recognize(
                imgData,
                'por', // Portuguese
                {
                    logger: m => {
                        if (m.status === 'recognizing text') {
                            setProgress(Math.round(m.progress * 100));
                            setStatusText(`Lendo: ${Math.round(m.progress * 100)}%`);
                        } else {
                            setStatusText(translateStatus(m.status));
                        }
                    }
                }
            );

            const text = result.data.text;
            console.log('OCR Output:', text);
            extractDataAndRedirect(text);

        } catch (error) {
            console.error('OCR Error:', error);
            alert('Falha na leitura visual. Tente novamente.');
            setIsProcessing(false);
        }
    };

    const translateStatus = (s: string) => {
        if (s === 'loading tesseract core') return 'Carregando núcleo...';
        if (s === 'initializing tesseract') return 'Inicializando IA...';
        if (s === 'recognizing text') return 'Lendo caracteres...';
        return s;
    };

    const extractDataAndRedirect = (text: string) => {
        try {
            // STRATEGY: Semantic Total Search -> Fallback to Max Value

            const lines = text.split('\n');
            const moneyRegex = /(?:R\$\s?)?(\d{1,3}(?:[.,]\d{3})*[.,]\d{2})/g;

            // 1. Semantic Search (Look for "Total", "Valor Pagar", etc)
            let semanticTotal = 0;
            const totalKeywords = ['total', 'pagar', 'soma', 'valor cobrado', 'valor total'];

            for (const line of lines) {
                const lowerLine = line.toLowerCase();
                if (totalKeywords.some(k => lowerLine.includes(k))) {
                    // Found a candidate line. Extract money values from this line.
                    const matches = [...line.matchAll(moneyRegex)];
                    matches.forEach(match => {
                        const val = parseMoney(match[1]);
                        // Usually the Total is the largest number on the "Total" line (ignoring taxes if listed)
                        if (val > semanticTotal) semanticTotal = val;
                    });
                }
            }

            // 2. Max Value Search (Fallback)
            let globalMax = 0;
            const allMatches = [...text.matchAll(moneyRegex)];
            allMatches.forEach(match => {
                const val = parseMoney(match[1]);
                if (val > globalMax) globalMax = val;
            });

            // DECISION
            const finalAmount = semanticTotal > 0 ? semanticTotal : globalMax;
            const formattedAmountString = finalAmount > 0 ? finalAmount.toFixed(2) : '';

            // Date Extraction
            const dateRegex = /(\d{2})\/(\d{2})\/(\d{2,4})/;
            const dateMatch = text.match(dateRegex);
            let dateStr = '';
            if (dateMatch) {
                const day = dateMatch[1];
                const month = dateMatch[2];
                let year = dateMatch[3];
                if (year.length === 2) year = '20' + year;
                dateStr = `${year}-${month}-${day}`;
            }

            // Description Logic: Smart Item Detection -> Fallback to clean Header
            let description = '';

            // 1. Search for known items (Gasolina, Uber, Burger, etc.)
            const lowerText = text.toLowerCase();
            if (CATEGORY_KEYWORDS) {
                for (const keywords of Object.values(CATEGORY_KEYWORDS)) {
                    if (Array.isArray(keywords)) {
                        const found = keywords.find(k => lowerText.includes(k.toLowerCase()));
                        if (found) {
                            // Return capitalized item name (e.g., "Gasolina")
                            description = found.charAt(0).toUpperCase() + found.slice(1);
                            break;
                        }
                    }
                }
            }

            // 2. If no item found, fallback to Header with strict filtering
            if (!description) {
                const potentialDescLines = lines.filter(l => {
                    const clean = l.trim();
                    if (clean.length < 4) return false;
                    if (/^\d{2}\/\d{2}/.test(clean)) return false;
                    if (/R\$|Total|Pagar|Troco|CNPJ|CPF|IE/i.test(clean)) return false;
                    if ((clean.match(/\d/g) || []).length > clean.length * 0.3) return false;
                    if (clean.split(' ').length > 1 && clean.length < 8) return false; // "Ao 11" type junk
                    return true;
                });

                if (potentialDescLines.length > 0) {
                    description = potentialDescLines[0]
                        .substring(0, 30)
                        .replace(/[^a-zA-Z0-9 \u00C0-\u00FF]/g, '')
                        .trim();

                    // Capitalize
                    description = description.split(' ')
                        .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
                        .join(' ');
                } else {
                    description = 'Nova Despesa';
                }
            }

            // Category Detection
            const detectedCategory = detectCategory(text);

            const params = new URLSearchParams();
            if (formattedAmountString) params.set('amount', formattedAmountString);
            if (dateStr) params.set('date', dateStr);
            if (detectedCategory) params.set('category', detectedCategory);
            params.set('desc', description);
            params.set('action', 'scan');

            setIsProcessing(false); // Success! Stop spinner.
            onClose();
            router.push(`/dashboard?${params.toString()}`);

        } catch (error) {
            console.error("Extraction Logic Error:", error);
            setIsProcessing(false);
            alert("Erro ao processar os dados da nota.");
        }
    };

    const parseMoney = (rawValue: string): number => {
        let val = 0;
        if (/,\d{2}$/.test(rawValue)) {
            val = parseFloat(rawValue.replace(/\./g, '').replace(',', '.'));
        } else if (/\.\d{2}$/.test(rawValue)) {
            val = parseFloat(rawValue.replace(/,/g, ''));
        }
        return isNaN(val) ? 0 : val;
    };

    return (
        <div className="fixed inset-0 z-[60] bg-black/95 flex flex-col items-center justify-center p-4 animate-in fade-in duration-300">
            {/* Header */}
            <div className="absolute top-4 right-4 z-50">
                <button onClick={onClose} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
                    <X className="text-white w-6 h-6" />
                </button>
            </div>

            <div className="w-full max-w-md flex flex-col items-center gap-8">

                {/* Visual Feedback / Camera Viewport */}
                <div className="relative w-64 h-64 border-2 border-emerald-500/50 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(16,185,129,0.2)] bg-black/50">
                    {image ? (
                        <>
                            <img src={image} alt="Captured" className="w-full h-full object-cover opacity-50" />
                            {isProcessing && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                                    <ScanLine className="w-12 h-12 text-emerald-500 animate-pulse" />
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Camera className="w-16 h-16 text-emerald-500/30" />
                        </div>
                    )}

                    {/* Scanner Line Animation */}
                    {isProcessing && (
                        <div className="absolute inset-x-0 h-0.5 bg-emerald-400 shadow-[0_0_20px_#34d399] top-0 animate-[scan_2s_ease-in-out_infinite]" />
                    )}
                </div>

                {/* Status Text */}
                <div className="text-center space-y-2">
                    <h2 className="text-2xl font-bold text-white tracking-tight">Monk.Vision</h2>
                    <p className="text-emerald-400 font-mono text-sm h-6">
                        {isProcessing ? `> ${statusText}` : '> Aguardando input visual...'}
                    </p>
                </div>

                {/* Action Button */}
                {!isProcessing && (
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-2xl shadow-lg shadow-emerald-900/50 transition-all active:scale-95 flex items-center justify-center gap-3"
                    >
                        <Camera className="w-6 h-6" />
                        Capturar Nota
                    </button>
                )}

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={handleFileChange}
                />
            </div>

            <style jsx global>{`
                @keyframes scan {
                    0% { top: 0%; opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { top: 100%; opacity: 0; }
                }
            `}</style>
        </div>
    );
}

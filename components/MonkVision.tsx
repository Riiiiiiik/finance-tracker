'use client';

import { useState, useRef } from 'react';
import { Camera, X, Check, Loader2, ScanLine } from 'lucide-react';
import Tesseract from 'tesseract.js';
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
        // 1. Extract Amount (Procura por R$, vírgulas, etc)
        // Regex para encontrar valores monetários: "digits,digits" ou "digits.digits,digits"
        // Ex: 45,00 | 1.200,50 | R$ 50,00
        const amountRegex = /(?:R\$\s?)?(\d{1,3}(?:\.\d{3})*,\d{2})/g;
        const matches = [...text.matchAll(amountRegex)];

        // Estratégia: Pegar o MAIOR valor encontrado (geralmente é o TOTAL)
        let maxAmount = 0;
        let bestAmountStr = '';

        matches.forEach(match => {
            const valStr = match[1].replace('.', '').replace(',', '.');
            const val = parseFloat(valStr);
            if (val > maxAmount) {
                maxAmount = val;
                bestAmountStr = valStr; // formato float string '45.50'
            }
        });

        // 2. Extract Date
        // Regex para dd/mm/yyyy ou dd/mm/yy
        const dateRegex = /(\d{2})\/(\d{2})\/(\d{2,4})/;
        const dateMatch = text.match(dateRegex);
        let dateStr = '';
        if (dateMatch) {
            // Converter para YYYY-MM-DD
            const day = dateMatch[1];
            const month = dateMatch[2];
            let year = dateMatch[3];
            if (year.length === 2) year = '20' + year;
            dateStr = `${year}-${month}-${day}`;
        }

        // 3. Extract Possible Merchant (Simplificado: Pega primeira linha não vazia)
        const lines = text.split('\n').filter(l => l.trim().length > 3);
        const description = lines.length > 0 ? lines[0].substring(0, 30) : 'Nova Despesa';

        // Redirect
        const params = new URLSearchParams();
        if (bestAmountStr) params.set('amount', bestAmountStr);
        if (dateStr) params.set('date', dateStr);
        if (description) params.set('desc', description);
        params.set('action', 'scan');

        // Fechar modal e navegar
        onClose();
        router.push(`/dashboard?${params.toString()}`);
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

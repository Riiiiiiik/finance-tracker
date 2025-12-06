import { Hourglass } from 'lucide-react';

interface ReflectionModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function ReflectionModal({ isOpen, onClose }: ReflectionModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] animate-in fade-in duration-200 p-4">

            {/* O Cartão "Holográfico" */}
            <div className="bg-[#09090B] border border-[#6CA8FF]/50 rounded-2xl p-8 max-w-sm w-full relative overflow-hidden shadow-[0_0_50px_rgba(108,168,255,0.2)]">

                {/* Efeito de Scanline/Grade no fundo */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>

                <div className="relative z-10 text-center">

                    {/* Ícone Pulsante */}
                    <div className="mx-auto bg-[#6CA8FF]/10 w-20 h-20 rounded-full flex items-center justify-center mb-6 border border-[#6CA8FF]/30">
                        <Hourglass size={40} className="text-[#6CA8FF] animate-pulse" />
                    </div>

                    <h3 className="text-xl font-bold text-white mb-2 tracking-wide">
                        Protocolo de Incubação
                    </h3>

                    <p className="text-gray-400 text-sm leading-relaxed mb-8">
                        O Visionário detectou um impulso. <br />
                        Para garantir que esta é uma meta real e não passageira, o acesso foi bloqueado temporariamente.
                    </p>

                    {/* Contador (Visual Apenas) */}
                    <div className="bg-[#161616] rounded-lg p-3 mb-8 border border-[#333] flex justify-center gap-4 font-mono">
                        <div className="text-center">
                            <span className="block text-2xl font-bold text-white">23</span>
                            <span className="text-[10px] text-gray-500 uppercase">Horas</span>
                        </div>
                        <span className="text-2xl text-[#333] self-center pb-2">:</span>
                        <div className="text-center">
                            <span className="block text-2xl font-bold text-white">59</span>
                            <span className="text-[10px] text-gray-500 uppercase">Min</span>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="w-full bg-[#6CA8FF] hover:bg-[#5b95e8] text-[#09090B] font-bold py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(108,168,255,0.3)] uppercase tracking-wider text-sm"
                    >
                        Aguardar Maturação
                    </button>

                </div>
            </div>
        </div>
    );
}

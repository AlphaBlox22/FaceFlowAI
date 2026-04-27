
import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, Upload, X, Check, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { analyzeFace } from '../lib/gemini';
import { AnalysisResult } from '../types';
import { cn } from '../lib/utils';

interface CameraInputProps {
  onComplete: (image: string, result: AnalysisResult) => void;
  onCancel: () => void;
}

export default function CameraInput({ onComplete, onCancel }: CameraInputProps) {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const processImage = async () => {
    if (!image) return;
    setLoading(true);
    setError(null);
    try {
      const result = await analyzeFace(image);
      onComplete(image, result);
    } catch (err) {
      console.error(err);
      setError("AI analysis failed. Please try again with a clearer photo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-black">
      {/* Header */}
      <div className="px-6 py-4 flex items-center justify-between border-b border-white/5">
        <button onClick={onCancel} className="p-2 rounded-full hover:bg-white/5 text-white">
          <X className="w-6 h-6" />
        </button>
        <span className="text-sm font-bold uppercase tracking-widest text-zinc-400">Photo Input</span>
        <div className="w-10"></div>
      </div>

      <div className="flex-1 p-6 flex flex-col gap-6 overflow-y-auto">
        {!image ? (
          <div className="flex flex-col gap-6 h-full font-mono">
            {/* Guidance */}
            <div className="relative aspect-[3/4] w-full rounded-none overflow-hidden bg-[#111] border border-[#2A2A2A] flex flex-col items-center justify-center gap-4 group hover:border-white/30 transition-all cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              {/* Scan Graphics Overlay */}
              <div className="absolute inset-0 pointer-events-none">
                {/* Horizontal Scan Line */}
                <motion.div 
                  animate={{ top: ['10%', '90%', '10%'] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  className="absolute left-0 right-0 h-[1px] bg-cyan-500/20 z-10"
                />
                
                {/* Corner Accents */}
                <div className="absolute top-8 left-8 w-8 h-8 border-t border-l border-white/20"></div>
                <div className="absolute top-8 right-8 w-8 h-8 border-t border-r border-white/20"></div>
                <div className="absolute bottom-8 left-8 w-8 h-8 border-b border-l border-white/20"></div>
                <div className="absolute bottom-8 right-8 w-8 h-8 border-b border-r border-white/20"></div>

                {/* Technical Data Labels */}
                <div className="absolute top-12 left-12 text-[8px] text-cyan-400">FPS: 60.0</div>
                <div className="absolute top-12 right-12 text-[8px] text-amber-400">ISO: AUTO</div>
                <div className="absolute bottom-12 left-12 text-[8px] text-white/40 tracking-[0.3em]">REC [•]</div>
              </div>
              
              <div className="text-center relative z-20">
                <Camera className="w-12 h-12 text-white/20 mx-auto mb-4 stroke-[1]" />
                <p className="text-[10px] font-bold text-white uppercase tracking-[0.2em]">Acquisition Phase</p>
                <p className="text-[8px] text-[#555] uppercase tracking-widest mt-1 italic">Align facial coordinates</p>
              </div>
            </div>

            {/* Tips Card */}
            <div className="p-6 editorial-glass font-mono">
              <h4 className="text-[10px] font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                Scan Protocol
              </h4>
              <ul className="space-y-4 text-[9px] text-[#8E9299] uppercase tracking-wider leading-relaxed">
                <li className="flex gap-3">
                  <span className="text-cyan-400">[01]</span>
                  <span>Optimal luminance required (5000K+)</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-cyan-400">[02]</span>
                  <span>Maintain neutral sagittal alignment</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-amber-400">[!]</span>
                  <span>Occlusions may impact resonance accuracy</span>
                </li>
              </ul>
            </div>
            
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="mt-auto w-full py-5 bg-white text-black font-mono text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-white/90 transition-colors"
            >
              Initialize Cache
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-6 h-full font-mono">
            <div className="relative aspect-[3/4] w-full rounded-none overflow-hidden border border-[#2A2A2A]">
              <img src={image} alt="Preview" className="w-full h-full object-cover grayscale brightness-90" />
              {loading && (
                <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center gap-6 text-white">
                  <div className="relative w-20 h-20">
                    <div className="absolute inset-0 border border-white/10 rounded-full"></div>
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 border-t border-cyan-400 rounded-full"
                    />
                    <div className="absolute inset-0 flex items-center justify-center text-[8px] tracking-tighter mix-blend-difference">SCANNIG</div>
                  </div>
                  <div className="text-center">
                    <p className="font-serif italic text-lg text-white">Extracting Aura...</p>
                    <p className="text-[9px] text-white/30 tracking-[0.3em] uppercase mt-2 animate-pulse">Running Neural Engine 1.5</p>
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div className="p-4 bg-red-400/5 border border-red-400/20 text-red-400 text-[10px] uppercase tracking-widest font-mono">
                Error Log: {error}
              </div>
            )}

            {!loading && (
              <div className="flex gap-1 mt-auto">
                <button 
                  onClick={() => setImage(null)}
                  className="flex-1 py-5 bg-[#111] border border-[#2A2A2A] text-white font-mono text-[10px] uppercase tracking-[0.2em]"
                >
                  Discard
                </button>
                <button 
                  onClick={processImage}
                  className="flex-[2] py-5 bg-white text-black font-mono text-[10px] font-bold uppercase tracking-[0.3em]"
                >
                  Analyze
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <input 
        type="file" 
        accept="image/*" 
        capture="user"
        ref={fileInputRef} 
        className="hidden" 
        onChange={handleFileChange} 
      />
    </div>
  );
}


import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, MessageCircle, Sparkles, TrendingUp, Info, ChevronRight, CheckCircle2, Share2 } from 'lucide-react';
import { AnalysisResult } from '../types';
import { cn } from '../lib/utils';

interface AnalysisViewProps {
  result: AnalysisResult | null;
  image: string | null;
  onBack: () => void;
  onChat: () => void;
}

export default function AnalysisView({ result, image, onBack, onChat }: AnalysisViewProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'breakdown' | 'tips'>('overview');
  const [showSimulation, setShowSimulation] = useState(false);

  if (!result || !image) return null;

  const handleShare = async () => {
    const shareData = {
      title: 'My FaceFlow AI Analysis',
      text: `Check out my FaceFlow AI analysis! Overall Score: ${result.scores.overall.toFixed(1)}/10. Potential: ${result.potential.score.toFixed(1)}/10.`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
        alert('Results copied to clipboard');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  return (
    <div className="flex flex-col min-h-full bg-black">
      {/* Top Header */}
      <div className="px-6 py-4 flex items-center justify-between sticky top-0 z-30 bg-black/80 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <button onClick={onBack} className="p-2 rounded-full hover:bg-white/5 text-white">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-[#555]">Relativity Report</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={handleShare} className="p-2 rounded-full hover:bg-white/5 text-white">
            <Share2 className="w-4 h-4" />
          </button>
          <button onClick={onChat} className="p-2 rounded-full bg-white/5 text-white">
            <MessageCircle className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="p-6 space-y-12">
        {/* Technical Scan View */}
        <section className="relative group">
          <div className="editorial-glass relative aspect-[4/5] w-full overflow-hidden">
            <img 
              src={image} 
              alt="Subject" 
              className={cn(
                "w-full h-full object-cover transition-all duration-700 font-mono",
                showSimulation ? "grayscale-0 brightness-110 saturate-[1.2]" : "grayscale contrast-125 brightness-75"
              )} 
            />
            
            {/* Scan Graphics Overlays */}
            {!showSimulation && result.landmarks?.map((mark, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 + (i * 0.1) }}
                className="absolute pointer-events-none"
                style={{ left: `${mark.x}%`, top: `${mark.y}%` }}
              >
                {mark.type === 'box' ? (
                  <div 
                    className="border border-white/30 bg-white/5 backdrop-blur-[1px]"
                    style={{ 
                      width: `${mark.width || 40}px`, 
                      height: `${mark.height || 40}px`,
                      transform: 'translate(-50%, -50%)'
                    }}
                  >
                    <div className="absolute top-0 left-0 bg-white/50 text-[6px] px-1 font-mono uppercase tracking-tighter">REGION</div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 -translate-y-1/2">
                    <div className="w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_10px_white]" />
                    <div className="h-[0.5px] w-4 bg-white/40" />
                    <div className="bg-black/60 backdrop-blur-sm border border-white/10 px-1.5 py-0.5 whitespace-nowrap">
                      <span className="font-mono text-[7px] text-white uppercase tracking-widest">{mark.label}</span>
                      {mark.value && <span className="block font-mono text-[6px] text-cyan-400 mt-0.5">{mark.value}</span>}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}

            {/* Neural Overlay */}
            {showSimulation && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-cyan-500/10 mix-blend-overlay flex flex-col items-center justify-center pointer-events-none"
              >
                <div className="w-full h-full border-[20px] border-cyan-500/10 animate-pulse" />
              </motion.div>
            )}

            {/* Scanning Line */}
            <motion.div 
              animate={{ top: ['0%', '100%', '0%'] }}
              transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
              className="absolute left-0 right-0 h-[1.5px] bg-white/10 mix-blend-difference pointer-events-none z-10 shadow-[0_0_15px_rgba(255,255,255,0.2)]"
            />
          </div>

          <div className="mt-4 flex justify-between items-center font-mono text-[8px] text-[#555] uppercase tracking-widest">
            <span>RES: NATIVE_EXTRACT</span>
            <span>COORD_SYNC: ACTIVE</span>
          </div>
        </section>

        {/* Hero Score Section */}
        <section className="flex flex-col gap-10">
          <div className="flex justify-between items-end border-b border-[#2A2A2A] pb-8">
            <div>
              <span className="block font-serif italic text-2xl text-[#E0D8D0] mb-2 uppercase tracking-tighter">
                {showSimulation ? "Peak Potential" : "Current Aura"}
              </span>
              <div className="flex items-baseline gap-4">
                <span className="text-9xl font-bold tracking-tighter text-white leading-none">
                  {showSimulation ? result.potential.score.toFixed(1) : result.scores.overall.toFixed(1)}
                </span>
                <span className="text-3xl text-[#555] italic">/ 10</span>
              </div>
            </div>
            {!showSimulation && (
              <div className="text-right border-l border-[#2A2A2A] pl-8 pb-2">
                <span className="block text-[10px] uppercase font-bold tracking-widest text-cyan-400 mb-2 underline underline-offset-8 decoration-cyan-400/30">Potential Rank</span>
                <span className="text-5xl font-bold text-white leading-none">{result.potential.score.toFixed(1)}</span>
                <p className="text-[9px] font-mono text-[#8E9299] mt-3 max-w-[120px] leading-tight uppercase tracking-wider">Sync optimized state</p>
              </div>
            )}
          </div>
        </section>

        {/* Controls */}
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={() => setShowSimulation(!showSimulation)}
            className={cn(
              "py-4 font-mono text-[9px] font-bold uppercase transition-all tracking-[0.2em]",
              showSimulation 
                ? "bg-white text-black shadow-[0_0_20px_white]" 
                : "border border-[#2A2A2A] text-white hover:border-white/30"
            )}
          >
            {showSimulation ? "Reset Frame" : "Simulate 8.0"}
          </button>
          <button className="border border-[#2A2A2A] py-4 font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-white hover:bg-white hover:text-black transition-colors">
            Extract PDF
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-[#2A2A2A] gap-8 overflow-x-auto no-scrollbar">
          {(['overview', 'breakdown', 'tips'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "pb-4 text-[10px] font-mono uppercase tracking-[0.2em] transition-all relative whitespace-nowrap",
                activeTab === tab ? "text-white" : "text-[#555] hover:text-[#888]"
              )}
            >
              {tab}
              {activeTab === tab && (
                <motion.div 
                  layoutId="activeTab"
                   className="absolute bottom-[-1px] left-0 right-0 h-[1px] bg-white" 
                />
              )}
            </button>
          ))}
        </div>

        {/* Sections Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div 
              key="overview"
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-12"
            >
              <div className="space-y-6">
                <MetricRow label="Facial Structure" score={result.scores.structure} color="white" />
                <MetricRow label="Skin Quality" score={result.scores.skin} color="amber" />
                <MetricRow label="Grooming" score={result.scores.grooming} color="white" />
                <MetricRow label="Harmony" score={result.scores.harmony} color="cyan" />
              </div>

              <div className="p-8 editorial-glass relative">
                <div className="absolute top-0 right-0 p-4 font-mono text-[8px] text-[#555] tracking-widest uppercase">Summary_Extracted</div>
                <h3 className="text-[10px] font-mono font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-3">
                  <div className="w-1.5 h-1.5 bg-brand rounded-full"></div> AI Synthesized Report
                </h3>
                <p className="font-serif text-[#A0A0A0] text-lg leading-relaxed italic antialiased">
                  "{result.summary}"
                </p>
              </div>
            </motion.div>
          )}

          {activeTab === 'breakdown' && (
            <motion.div 
               key="breakdown"
               initial={{ opacity: 0, y: 10 }} 
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -10 }}
               className="space-y-px bg-[#2A2A2A] border border-[#2A2A2A]"
            >
               {Object.entries(result.breakdown).map(([key, val], idx) => (
                 <div key={key} className="p-6 bg-[#0A0A0A] flex flex-col gap-2">
                   <div className="flex justify-between items-baseline">
                     <span className="text-[10px] font-mono text-[#555] uppercase tracking-widest">{key}</span>
                     <span className="text-[8px] font-mono text-[#222]">ITEM_0{idx + 1}</span>
                   </div>
                   <p className="text-sm text-[#E0D8D0] font-sans leading-relaxed">{val}</p>
                 </div>
               ))}
            </motion.div>
          )}

          {activeTab === 'tips' && (
             <motion.div 
                key="tips"
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-12"
             >
                <TipSection title="Regimen: Skincare" items={result.recommendations.skincare} color="cyan" />
                <TipSection title="Protocol: Grooming" items={result.recommendations.grooming} color="amber" />
                <TipSection title="Lifestyle: Optimization" items={result.recommendations.lifestyle} color="white" />
             </motion.div>
          )}
        </AnimatePresence>

        {/* Chat Call-to-action */}
        <section className="pt-8 flex flex-col gap-4">
           <button 
             onClick={onChat}
             className="w-full p-8 editorial-glass flex items-center justify-between group hover:border-white/30 transition-all"
           >
              <div className="flex flex-col gap-2">
                <span className="text-[9px] font-mono text-cyan-400 uppercase tracking-widest">Interface Active</span>
                <h4 className="text-xl font-serif italic text-white flex items-center gap-3">
                  Consult Ashu AI
                </h4>
              </div>
              <div className="w-12 h-12 bg-white flex items-center justify-center text-black">
                <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" strokeWidth={3} />
              </div>
           </button>
        </section>

        <div className="h-20"></div>
      </div>
    </div>
  );
}

function MetricRow({ label, score, color }: { label: string, score: number, color: 'white' | 'amber' | 'cyan' }) {
  const barColors = {
    white: "bg-white",
    amber: "bg-amber-500",
    cyan: "bg-cyan-400"
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-between items-baseline font-mono text-[9px] uppercase tracking-widest">
        <span className="text-[#8E9299]">{label}</span>
        <span className="text-white font-bold">{score.toFixed(1)}</span>
      </div>
      <div className="w-full h-[1px] bg-[#222]">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${score * 10}%` }}
          className={cn("h-full", barColors[color])}
        />
      </div>
    </div>
  );
}

function TipSection({ title, items, color }: { title: string, items: string[], color: 'cyan' | 'amber' | 'white' }) {
  const dotColors = {
    cyan: "bg-cyan-400",
    amber: "bg-amber-500",
    white: "bg-white"
  };

  return (
    <div className="space-y-6">
      <h3 className="text-[10px] font-mono text-[#555] uppercase tracking-[0.3em] font-bold pb-2 border-b border-[#2A2A2A]">{title}</h3>
      <div className="flex flex-col gap-6">
        {items.map((item, i) => (
          <div key={i} className="flex gap-4 items-start">
            <div className={cn("w-1.5 h-1.5 mt-1.5 flex-shrink-0", dotColors[color])} />
            <p className="text-sm text-[#AFAFA7] leading-relaxed font-sans">{item}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

import { AnimatePresence } from 'framer-motion';

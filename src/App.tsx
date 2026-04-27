
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, LayoutDashboard, MessageCircle, History, Sparkles, User, Settings, Info } from 'lucide-react';
import { View, AnalysisResult, ChatMessage } from './types';
import { cn } from './lib/utils';
import Dashboard from './components/Dashboard';
import CameraInput from './components/CameraInput';
import AnalysisView from './components/AnalysisView';
import ChatView from './components/ChatView';

export default function App() {
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [history, setHistory] = useState<{image: string, result: AnalysisResult, date: number}[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('faceflow_history');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  const handleAnalysisComplete = (image: string, result: AnalysisResult) => {
    setCapturedImage(image);
    setAnalysisResult(result);
    setCurrentView(View.ANALYSIS);
    
    const newHistory = [{image, result, date: Date.now()}, ...history].slice(0, 10);
    setHistory(newHistory);
    localStorage.setItem('faceflow_history', JSON.stringify(newHistory));
  };

  const renderView = () => {
    switch (currentView) {
      case View.DASHBOARD:
        return <Dashboard history={history} onStart={() => setCurrentView(View.CAMERA)} onViewHistory={(h) => {
          setAnalysisResult(h.result);
          setCapturedImage(h.image);
          setCurrentView(View.ANALYSIS);
        }} />;
      case View.CAMERA:
        return <CameraInput onComplete={handleAnalysisComplete} onCancel={() => setCurrentView(View.DASHBOARD)} />;
      case View.ANALYSIS:
        return <AnalysisView result={analysisResult} image={capturedImage} onBack={() => setCurrentView(View.DASHBOARD)} onChat={() => setCurrentView(View.CHAT)} />;
      case View.CHAT:
        return <ChatView onBack={() => setCurrentView(View.DASHBOARD)} />;
      default:
        return <Dashboard history={history} onStart={() => setCurrentView(View.CAMERA)} onViewHistory={() => {}} />;
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-[#0A0A0A] overflow-hidden relative border-x border-[#2A2A2A] shadow-2xl">
      {/* Header */}
      <header className="px-6 pt-8 pb-6 bg-[#0A0A0A] border-b border-[#2A2A2A] z-40">
        <div>
          <h1 className="text-4xl font-serif tracking-tighter italic leading-none text-[#E0D8D0]">Aura Analysis</h1>
          <p className="font-mono text-[9px] uppercase tracking-widest text-[#8E9299] mt-2">Faceflow Engine 1.5 — Session Active</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto scrollbar-hide pb-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="h-full"
          >
            {renderView()}
          </motion.div>
        </AnimatePresence>
      </main>

      <BottomNav currentView={currentView} setCurrentView={setCurrentView} />
    </div>
  );
}

function BottomNav({ currentView, setCurrentView }: { currentView: View, setCurrentView: (v: View) => void }) {
  return (
    <nav className="absolute bottom-0 left-0 right-0 bg-[#0A0A0A] py-6 px-6 border-t border-[#2A2A2A] z-50 safe-bottom">
      <div className="flex items-center justify-around">
        <NavButton 
          active={currentView === View.DASHBOARD} 
          icon={LayoutDashboard} 
          label="Index" 
          onClick={() => setCurrentView(View.DASHBOARD)} 
        />
        <NavButton 
          active={currentView === View.CAMERA} 
          icon={Camera} 
          label="Scan" 
          onClick={() => setCurrentView(View.CAMERA)} 
          highlight
        />
        <NavButton 
          active={currentView === View.CHAT} 
          icon={MessageCircle} 
          label="Aura" 
          onClick={() => setCurrentView(View.CHAT)} 
        />
      </div>
    </nav>
  );
}

function NavButton({ active, icon: Icon, label, onClick, highlight }: { active: boolean, icon: any, label: string, onClick: () => void, highlight?: boolean }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1.5 transition-all outline-none",
        active ? "text-white" : "text-[#555]"
      )}
    >
      <div className={cn(
        "transition-transform",
        highlight && active && "scale-110",
        highlight && "text-white"
      )}>
        <Icon className={cn("w-5 h-5", highlight && "w-6 h-6")} strokeWidth={highlight ? 2 : 1.5} />
      </div>
      <span className="font-mono text-[8px] uppercase tracking-[0.2em]">{label}</span>
    </button>
  );
}


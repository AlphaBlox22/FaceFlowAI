
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, ArrowLeft, Loader2, Sparkles, User, Bot, AlertCircle } from 'lucide-react';
import Markdown from 'react-markdown';
import { chatWithAshu } from '../lib/gemini';
import { ChatMessage } from '../types';
import { cn } from '../lib/utils';

interface ChatViewProps {
  onBack: () => void;
}

export default function ChatView({ onBack }: ChatViewProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hello! I'm Ashu AI, your personal appearance and grooming consultant. How can I help you today? You can ask me about skincare routines, hair care, or specific tips from your analysis.",
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role === 'user' ? 'user' as const : 'model' as const,
        parts: [{ text: m.content }]
      }));

      const aiResponse = await chatWithAshu(input, history);
      
      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.error(err);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-black">
      {/* Header */}
      <div className="px-6 py-6 flex items-center gap-6 border-b border-[#2A2A2A] sticky top-0 z-40 bg-black/80 backdrop-blur-md">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-white/5 text-white">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-white flex items-center justify-center text-black font-serif italic text-lg">A</div>
          <div>
            <h2 className="text-[10px] font-mono font-bold text-white uppercase tracking-widest">Ashu AI</h2>
            <div className="flex items-center gap-2">
               <div className="w-1 h-1 rounded-full bg-cyan-400 animate-pulse" />
               <span className="text-[8px] text-[#555] font-mono uppercase tracking-[0.2em]">Consultant Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide font-sans"
      >
        {messages.map((m) => (
          <div 
            key={m.id}
            className={cn(
              "flex flex-col max-w-[90%]",
              m.role === 'user' ? "ml-auto items-end" : "mr-auto items-start"
            )}
          >
            <div className={cn(
              "p-6 text-sm leading-relaxed",
              m.role === 'user' 
                ? "bg-[#222] text-white border border-[#333]" 
                : "editorial-glass text-[#A0A0A0] italic border border-[#222]"
            )}>
              <div className="markdown-body">
                <Markdown>{m.content}</Markdown>
              </div>
            </div>
            <span className="font-mono text-[8px] text-[#444] mt-3 uppercase tracking-widest">
              {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-3 animate-pulse">
            <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
            <span className="font-mono text-[9px] text-[#555] uppercase tracking-widest">Synthesizing...</span>
          </div>
        )}

        <div className="p-6 editorial-glass border-dashed opacity-40">
           <div className="flex items-start gap-4">
             <AlertCircle className="w-4 h-4 text-[#555] flex-shrink-0 mt-0.5" />
             <p className="font-mono text-[8px] text-[#8E9299] uppercase leading-relaxed tracking-wider">
               Analysis is for heuristic representation only. Consult clinical personnel for physiological concerns.
             </p>
           </div>
        </div>
      </div>

      {/* Input Area */}
      <div className="p-6 bg-black border-t border-[#2A2A2A] safe-bottom">
        <div className="relative flex items-center gap-0">
          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Inquire about regimen or metrics..."
            className="flex-1 bg-[#111] border border-[#2A2A2A] py-5 px-6 font-mono text-[10px] text-white focus:outline-none focus:border-white/20 transition-all placeholder:text-[#444] uppercase tracking-widest"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="bg-white text-black p-5 border border-white disabled:opacity-30 transition-all active:scale-95"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

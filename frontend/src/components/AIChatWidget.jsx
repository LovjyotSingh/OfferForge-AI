import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Bot,
  Eye,
  GripVertical,
  Maximize2,
  Minimize2,
  RefreshCw,
  Send,
  Sparkles,
  X,
} from 'lucide-react';
import api from '../services/api';
import { getUser } from '../services/auth';

export default function AIChatWidget() {
  const location = useLocation();
  const user = getUser();

  // Widget state
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      text: `Hello ${user?.name || 'Candidate'}! I am your OfferForge AI Co-Pilot. I'm live watching your screen and session on **${location.pathname}**. Ask me anything about this page, technical questions, or interview tips!`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  // Dragging state
  const [position, setPosition] = useState(() => {
    const saved = localStorage.getItem('offerforge_chat_pos');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return { x: window.innerWidth - 80, y: window.innerHeight - 100 };
  });

  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, posX: 0, posY: 0 });
  const hasMovedRef = useRef(false);
  const chatEndRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    if (isOpen && !isMinimized) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isMinimized]);

  // Save position
  useEffect(() => {
    localStorage.setItem('offerforge_chat_pos', JSON.stringify(position));
  }, [position]);

  // Screen Context Extractor
  const captureScreenContext = () => {
    const route = location.pathname;
    const userObj = getUser();
    const title = document.title || 'OfferForge AI';

    // Extract visible screen summary
    let screenSummary = `Page Title: ${title}. Route: ${route}. `;
    try {
      const visibleText = document.body.innerText
        .replace(/\s+/g, ' ')
        .slice(0, 600);
      screenSummary += `Visible Content Snapshot: ${visibleText}`;
    } catch {}

    return {
      currentRoute: route,
      pageTitle: title,
      userName: userObj?.name || 'Candidate',
      targetRole: userObj?.targetRole || 'SDE',
      screenSummary,
    };
  };

  // Handle Dragging
  const handlePointerDown = (e) => {
    setIsDragging(true);
    hasMovedRef.current = false;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    dragStartRef.current = {
      x: clientX,
      y: clientY,
      posX: position.x,
      posY: position.y,
    };
  };

  useEffect(() => {
    const handlePointerMove = (e) => {
      if (!isDragging) return;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;

      const deltaX = clientX - dragStartRef.current.x;
      const deltaY = clientY - dragStartRef.current.y;

      if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
        hasMovedRef.current = true;
      }

      const newX = Math.max(20, Math.min(window.innerWidth - 70, dragStartRef.current.posX + deltaX));
      const newY = Math.max(20, Math.min(window.innerHeight - 70, dragStartRef.current.posY + deltaY));

      setPosition({ x: newX, y: newY });
    };

    const handlePointerUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handlePointerMove);
      window.addEventListener('mouseup', handlePointerUp);
      window.addEventListener('touchmove', handlePointerMove);
      window.addEventListener('touchend', handlePointerUp);
    }

    return () => {
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('touchend', handlePointerUp);
    };
  }, [isDragging]);

  const handleCircleClick = () => {
    if (!hasMovedRef.current) {
      setIsOpen((prev) => !prev);
      setIsMinimized(false);
    }
  };

  // Send Chat Message
  const handleSendMessage = async (textToSend) => {
    const query = textToSend || inputMessage;
    if (!query || !query.trim() || loading) return;

    const userMsg = {
      id: Date.now().toString(),
      role: 'user',
      text: query.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setLoading(true);

    try {
      const context = captureScreenContext();
      const history = messages.map((m) => ({ role: m.role, text: m.text }));

      const res = await api.post('/ai/chat', {
        message: query.trim(),
        context: { ...context, history },
      });

      const aiReply = res.data?.data?.reply || 'I am ready to assist you!';

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          text: aiReply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          text: 'I had trouble connecting to the AI assistant server. Please make sure your server is running and try again!',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    'Explain what I see on this page',
    'How do I get 100% on my interview?',
    'Optimize my resume for ATS',
    'Explain System Design rate limiter',
  ];

  return (
    <div className="fixed z-50 font-mono select-none">
      {/* Floating Draggable Circle Button */}
      <div
        style={{ left: `${position.x}px`, top: `${position.y}px` }}
        onMouseDown={handlePointerDown}
        onTouchStart={handlePointerDown}
        onClick={handleCircleClick}
        className={`fixed cursor-grab active:cursor-grabbing group transition-transform hover:scale-110 flex items-center justify-center`}
      >
        <div className="relative flex h-14 w-14 items-center justify-center rounded-full border border-white/30 bg-black/90 text-white shadow-[0_0_25px_rgba(255,255,255,0.3)] backdrop-blur-md">
          <Bot size={24} className="text-white group-hover:rotate-12 transition-transform" />
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-white border-2 border-black"></span>
          </span>
          <div className="absolute -bottom-1 text-[8px] font-extrabold uppercase text-white/60 flex items-center">
            <GripVertical size={10} />
          </div>
        </div>
      </div>

      {/* Floating Chat Drawer Window */}
      {isOpen && (
        <div
          className={`fixed bottom-20 right-4 sm:right-8 z-50 w-[92vw] sm:w-[420px] rounded-2xl border border-white/20 bg-black/95 text-white shadow-2xl backdrop-blur-xl transition-all duration-300 ${
            isMinimized ? 'h-16 overflow-hidden' : 'h-[550px] max-h-[82vh] flex flex-col'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/20 px-4 py-3 bg-black">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-black font-bold">
                <Sparkles size={16} />
              </div>
              <div>
                <div className="text-xs font-black uppercase text-glow-white flex items-center gap-1.5">
                  OfferForge AI Co-Pilot
                </div>
                <div className="text-[10px] text-white/60 flex items-center gap-1 font-mono">
                  <Eye size={11} className="text-white animate-pulse" />
                  <span>Watching: {location.pathname}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsMinimized((prev) => !prev)}
                className="rounded-lg p-1.5 text-white/60 hover:bg-white/10 hover:text-white transition"
                title={isMinimized ? 'Maximize' : 'Minimize'}
              >
                {isMinimized ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
              </button>
              <button
                onClick={() => {
                  setMessages([
                    {
                      id: Date.now().toString(),
                      role: 'assistant',
                      text: `Conversation reset. I am live watching your screen on **${location.pathname}**. How can I help?`,
                      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    },
                  ]);
                }}
                className="rounded-lg p-1.5 text-white/60 hover:bg-white/10 hover:text-white transition"
                title="Reset Chat"
              >
                <RefreshCw size={14} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1.5 text-white/60 hover:bg-white/10 hover:text-white transition"
                title="Close Chat"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Body */}
          {!isMinimized && (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs font-sans">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl p-3.5 leading-relaxed font-mono ${
                        m.role === 'user'
                          ? 'bg-white text-black font-semibold rounded-br-none shadow-md'
                          : 'bg-black/90 border border-white/20 text-white/95 rounded-bl-none'
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{m.text}</div>
                      <div
                        className={`text-[9px] mt-1.5 text-right font-mono ${
                          m.role === 'user' ? 'text-black/60' : 'text-white/40'
                        }`}
                      >
                        {m.time}
                      </div>
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="flex justify-start">
                    <div className="rounded-2xl rounded-bl-none border border-white/20 bg-black/90 p-3.5 text-xs text-white/80 font-mono flex items-center gap-2">
                      <Sparkles size={14} className="animate-spin text-white" />
                      <span>Analyzing screen context & crafting response...</span>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Quick Prompts */}
              <div className="px-3 py-2 border-t border-white/10 overflow-x-auto flex gap-1.5 scrollbar-none font-mono">
                {quickPrompts.map((qp, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(qp)}
                    disabled={loading}
                    className="shrink-0 text-[10px] font-bold border border-white/20 bg-white/5 hover:bg-white/15 text-white/90 rounded-lg px-2.5 py-1 transition"
                  >
                    {qp}
                  </button>
                ))}
              </div>

              {/* Input Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="p-3 border-t border-white/20 bg-black flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ask AI Co-Pilot (watches your screen)..."
                  className="flex-1 calm-input text-xs bg-black text-white border-white/30 px-3 py-2 font-mono"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading || !inputMessage.trim()}
                  className="calm-button p-2 text-xs font-extrabold uppercase shrink-0 disabled:opacity-50"
                >
                  <Send size={14} />
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </div>
  );
}

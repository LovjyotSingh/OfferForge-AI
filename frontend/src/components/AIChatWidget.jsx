import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Bot,
  Eye,
  GripHorizontal,
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

  // Widget State
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

  // Circle Button Position
  const [circlePos, setCirclePos] = useState(() => {
    const saved = localStorage.getItem('offerforge_circle_pos');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    const defaultX = Math.max(10, window.innerWidth - 80);
    const defaultY = Math.max(10, window.innerHeight - 90);
    return { x: defaultX, y: defaultY };
  });

  // Chat Window Position
  const [chatPos, setChatPos] = useState(() => {
    const saved = localStorage.getItem('offerforge_chat_win_pos');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    const defaultX = Math.max(10, window.innerWidth - 420);
    const defaultY = Math.max(10, window.innerHeight - 580);
    return { x: defaultX, y: defaultY };
  });

  // Drag states
  const [isDraggingCircle, setIsDraggingCircle] = useState(false);
  const [isDraggingChat, setIsDraggingChat] = useState(false);
  const circleDragStartRef = useRef({ x: 0, y: 0, posX: 0, posY: 0 });
  const chatDragStartRef = useRef({ x: 0, y: 0, posX: 0, posY: 0 });
  const circleMovedRef = useRef(false);
  const chatEndRef = useRef(null);

  // Save Positions
  useEffect(() => {
    localStorage.setItem('offerforge_circle_pos', JSON.stringify(circlePos));
  }, [circlePos]);

  useEffect(() => {
    localStorage.setItem('offerforge_chat_win_pos', JSON.stringify(chatPos));
  }, [chatPos]);

  // Auto Scroll
  useEffect(() => {
    if (isOpen && !isMinimized) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isMinimized]);

  // Position Chat Window relative to Circle Button when first opened
  const calculateNextToCirclePos = () => {
    const chatWidth = Math.min(window.innerWidth - 20, 410);
    const chatHeight = 520;

    let targetX = circlePos.x - chatWidth + 40;
    if (targetX < 10) targetX = circlePos.x + 60;
    targetX = Math.max(10, Math.min(window.innerWidth - chatWidth - 10, targetX));

    let targetY = circlePos.y - chatHeight + 40;
    if (targetY < 10) targetY = circlePos.y + 60;
    targetY = Math.max(10, Math.min(window.innerHeight - chatHeight - 10, targetY));

    return { x: targetX, y: targetY };
  };

  // Toggle Chat Open/Close
  const handleCircleClick = (e) => {
    if (e) e.stopPropagation();
    if (!circleMovedRef.current) {
      if (!isOpen) {
        setChatPos(calculateNextToCirclePos());
      }
      setIsOpen((prev) => !prev);
      setIsMinimized(false);
    }
  };

  // Screen Context Extractor
  const captureScreenContext = () => {
    const route = location.pathname;
    const userObj = getUser();
    const title = document.title || 'OfferForge AI';
    let screenSummary = `Page Title: ${title}. Route: ${route}. `;
    try {
      const visibleText = document.body.innerText.replace(/\s+/g, ' ').slice(0, 600);
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

  // ----------------------------------------------------
  // CIRCLE BUTTON DRAG HANDLERS (With Touch Prevention)
  // ----------------------------------------------------
  const handleCirclePointerDown = (e) => {
    if (e.touches && e.touches.length > 1) return;
    if (e.cancelable) e.preventDefault(); // Prevent mobile page scrolling

    setIsDraggingCircle(true);
    circleMovedRef.current = false;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    circleDragStartRef.current = {
      x: clientX,
      y: clientY,
      posX: circlePos.x,
      posY: circlePos.y,
    };
  };

  useEffect(() => {
    const handleCirclePointerMove = (e) => {
      if (!isDraggingCircle) return;
      if (e.cancelable) e.preventDefault(); // Keep page stable on mobile!

      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;

      const deltaX = clientX - circleDragStartRef.current.x;
      const deltaY = clientY - circleDragStartRef.current.y;

      if (Math.abs(deltaX) > 4 || Math.abs(deltaY) > 4) {
        circleMovedRef.current = true;
      }

      const clampedX = Math.max(10, Math.min(window.innerWidth - 65, circleDragStartRef.current.posX + deltaX));
      const clampedY = Math.max(10, Math.min(window.innerHeight - 65, circleDragStartRef.current.posY + deltaY));

      setCirclePos({ x: clampedX, y: clampedY });
    };

    const handleCirclePointerUp = () => {
      setIsDraggingCircle(false);
    };

    if (isDraggingCircle) {
      window.addEventListener('mousemove', handleCirclePointerMove, { passive: false });
      window.addEventListener('mouseup', handleCirclePointerUp);
      window.addEventListener('touchmove', handleCirclePointerMove, { passive: false });
      window.addEventListener('touchend', handleCirclePointerUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleCirclePointerMove);
      window.removeEventListener('mouseup', handleCirclePointerUp);
      window.removeEventListener('touchmove', handleCirclePointerMove);
      window.removeEventListener('touchend', handleCirclePointerUp);
    };
  }, [isDraggingCircle]);

  // ----------------------------------------------------
  // CHAT WINDOW HEADER DRAG HANDLERS
  // ----------------------------------------------------
  const handleChatHeaderPointerDown = (e) => {
    if (e.touches && e.touches.length > 1) return;
    if (e.cancelable) e.preventDefault();

    setIsDraggingChat(true);
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    chatDragStartRef.current = {
      x: clientX,
      y: clientY,
      posX: chatPos.x,
      posY: chatPos.y,
    };
  };

  useEffect(() => {
    const handleChatPointerMove = (e) => {
      if (!isDraggingChat) return;
      if (e.cancelable) e.preventDefault();

      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;

      const deltaX = clientX - chatDragStartRef.current.x;
      const deltaY = clientY - chatDragStartRef.current.y;

      const chatWidth = Math.min(window.innerWidth - 20, 410);
      const chatHeight = isMinimized ? 65 : 520;

      const clampedX = Math.max(10, Math.min(window.innerWidth - chatWidth - 10, chatDragStartRef.current.posX + deltaX));
      const clampedY = Math.max(10, Math.min(window.innerHeight - chatHeight - 10, chatDragStartRef.current.posY + deltaY));

      setChatPos({ x: clampedX, y: clampedY });
    };

    const handleChatPointerUp = () => {
      setIsDraggingChat(false);
    };

    if (isDraggingChat) {
      window.addEventListener('mousemove', handleChatPointerMove, { passive: false });
      window.addEventListener('mouseup', handleChatPointerUp);
      window.addEventListener('touchmove', handleChatPointerMove, { passive: false });
      window.addEventListener('touchend', handleChatPointerUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleChatPointerMove);
      window.removeEventListener('mouseup', handleChatPointerUp);
      window.removeEventListener('touchmove', handleChatPointerMove);
      window.removeEventListener('touchend', handleChatPointerUp);
    };
  }, [isDraggingChat, isMinimized]);

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
      {/* Draggable Floating Circle Icon (Page-Stable Touch Handling) */}
      <div
        style={{
          left: `${circlePos.x}px`,
          top: `${circlePos.y}px`,
          touchAction: 'none', // Prevents mobile touch scrolling on page
        }}
        onMouseDown={handleCirclePointerDown}
        onTouchStart={handleCirclePointerDown}
        onClick={handleCircleClick}
        className="fixed cursor-grab active:cursor-grabbing group transition-transform hover:scale-110 flex items-center justify-center"
      >
        <div className="relative flex h-14 w-14 items-center justify-center rounded-full border border-white/30 bg-black/90 text-white shadow-[0_0_25px_rgba(255,255,255,0.35)] backdrop-blur-md">
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

      {/* Draggable Floating Chat Window */}
      {isOpen && (
        <div
          style={{
            left: `${chatPos.x}px`,
            top: `${chatPos.y}px`,
            touchAction: 'none',
          }}
          className={`fixed z-50 w-[92vw] sm:w-[410px] rounded-2xl border border-white/25 bg-black/95 text-white shadow-[0_0_30px_rgba(0,0,0,0.8)] backdrop-blur-xl transition-all duration-150 ${
            isMinimized ? 'h-16 overflow-hidden' : 'h-[520px] max-h-[80vh] flex flex-col'
          }`}
        >
          {/* Draggable Window Header */}
          <div
            onMouseDown={handleChatHeaderPointerDown}
            onTouchStart={handleChatHeaderPointerDown}
            className="flex items-center justify-between border-b border-white/20 px-3.5 py-2.5 bg-black/90 cursor-grab active:cursor-grabbing hover:bg-white/5 transition"
          >
            <div className="flex items-center gap-2">
              <GripHorizontal size={14} className="text-white/50" />
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-black font-bold">
                <Sparkles size={14} />
              </div>
              <div>
                <div className="text-xs font-black uppercase text-glow-white flex items-center gap-1.5 leading-none">
                  OfferForge AI Co-Pilot
                </div>
                <div className="text-[9px] text-white/60 flex items-center gap-1 font-mono mt-0.5">
                  <Eye size={10} className="text-white animate-pulse" />
                  <span>Watching: {location.pathname}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1" onMouseDown={(e) => e.stopPropagation()} onTouchStart={(e) => e.stopPropagation()}>
              <button
                onClick={() => setIsMinimized((prev) => !prev)}
                className="rounded-lg p-1.5 text-white/60 hover:bg-white/10 hover:text-white transition"
                title={isMinimized ? 'Maximize' : 'Minimize'}
              >
                {isMinimized ? <Maximize2 size={13} /> : <Minimize2 size={13} />}
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
                <RefreshCw size={13} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1.5 text-white/60 hover:bg-white/10 hover:text-white transition"
                title="Close Chat"
              >
                <X size={13} />
              </button>
            </div>
          </div>

          {/* Window Body */}
          {!isMinimized && (
            <>
              <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 text-xs font-sans">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl p-3 leading-relaxed font-mono ${
                        m.role === 'user'
                          ? 'bg-white text-black font-semibold rounded-br-none shadow-md'
                          : 'bg-black/90 border border-white/20 text-white/95 rounded-bl-none'
                      }`}
                    >
                      <div className="whitespace-pre-wrap text-xs">{m.text}</div>
                      <div
                        className={`text-[9px] mt-1 text-right font-mono ${
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
                    <div className="rounded-2xl rounded-bl-none border border-white/20 bg-black/90 p-3 text-xs text-white/80 font-mono flex items-center gap-2">
                      <Sparkles size={13} className="animate-spin text-white" />
                      <span>Analyzing screen context & crafting response...</span>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Quick Prompts */}
              <div className="px-3 py-1.5 border-t border-white/10 overflow-x-auto flex gap-1.5 scrollbar-none font-mono">
                {quickPrompts.map((qp, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(qp)}
                    disabled={loading}
                    className="shrink-0 text-[9.5px] font-bold border border-white/20 bg-white/5 hover:bg-white/15 text-white/90 rounded-lg px-2.5 py-1 transition"
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
                className="p-2.5 border-t border-white/20 bg-black flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ask AI Co-Pilot (watches your screen)..."
                  className="flex-1 calm-input text-xs bg-black text-white border-white/30 px-3 py-1.5 font-mono"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading || !inputMessage.trim()}
                  className="calm-button p-2 text-xs font-extrabold uppercase shrink-0 disabled:opacity-50"
                >
                  <Send size={13} />
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </div>
  );
}

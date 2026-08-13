import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
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
      try {
        const parsed = JSON.parse(saved);
        if (parsed.x && parsed.y && parsed.x < window.innerWidth && parsed.y < window.innerHeight) {
          return parsed;
        }
      } catch {}
    }
    return {
      x: Math.max(10, window.innerWidth - 80),
      y: Math.max(10, window.innerHeight - 90),
    };
  });

  // Chat Window Position
  const [chatPos, setChatPos] = useState(() => {
    const saved = localStorage.getItem('offerforge_chat_win_pos');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.x && parsed.y && parsed.x < window.innerWidth && parsed.y < window.innerHeight) {
          return parsed;
        }
      } catch {}
    }
    return {
      x: Math.max(10, window.innerWidth - 420),
      y: Math.max(10, window.innerHeight - 580),
    };
  });

  // Drag states
  const [isDraggingCircle, setIsDraggingCircle] = useState(false);
  const [isDraggingChat, setIsDraggingChat] = useState(false);
  const circleDragStartRef = useRef({ x: 0, y: 0, posX: 0, posY: 0 });
  const chatDragStartRef = useRef({ x: 0, y: 0, posX: 0, posY: 0 });
  const circleMovedRef = useRef(false);
  const messageContainerRef = useRef(null);

  // Keep within bounds on window resize/scroll
  useEffect(() => {
    const handleResizeOrScroll = () => {
      setCirclePos((prev) => ({
        x: Math.max(5, Math.min(window.innerWidth - 60, prev.x)),
        y: Math.max(5, Math.min(window.innerHeight - 60, prev.y)),
      }));
      setChatPos((prev) => {
        const chatWidth = Math.min(window.innerWidth - 20, 410);
        return {
          x: Math.max(5, Math.min(window.innerWidth - chatWidth - 5, prev.x)),
          y: Math.max(5, Math.min(window.innerHeight - 60, prev.y)),
        };
      });
    };

    window.addEventListener('resize', handleResizeOrScroll);
    return () => window.removeEventListener('resize', handleResizeOrScroll);
  }, [isMinimized]);

  // Save Positions
  useEffect(() => {
    localStorage.setItem('offerforge_circle_pos', JSON.stringify(circlePos));
  }, [circlePos]);

  useEffect(() => {
    localStorage.setItem('offerforge_chat_win_pos', JSON.stringify(chatPos));
  }, [chatPos]);

  // Auto Scroll internal message box only (never scrolls the outer page/window!)
  useEffect(() => {
    if (isOpen && !isMinimized && messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
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
  // CIRCLE BUTTON POINTER DRAG HANDLERS (Pointer Capture)
  // ----------------------------------------------------
  const handleCirclePointerDown = (e) => {
    e.preventDefault();
    try { e.target.setPointerCapture(e.pointerId); } catch {}

    setIsDraggingCircle(true);
    circleMovedRef.current = false;
    circleDragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      posX: circlePos.x,
      posY: circlePos.y,
    };
  };

  const handleCirclePointerMove = (e) => {
    if (!isDraggingCircle) return;
    e.preventDefault();

    const deltaX = e.clientX - circleDragStartRef.current.x;
    const deltaY = e.clientY - circleDragStartRef.current.y;

    if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
      circleMovedRef.current = true;
    }

    const clampedX = Math.max(5, Math.min(window.innerWidth - 60, circleDragStartRef.current.posX + deltaX));
    const clampedY = Math.max(5, Math.min(window.innerHeight - 60, circleDragStartRef.current.posY + deltaY));

    setCirclePos({ x: clampedX, y: clampedY });
  };

  const handleCirclePointerUp = (e) => {
    if (isDraggingCircle) {
      try { e.target.releasePointerCapture(e.pointerId); } catch {}
      setIsDraggingCircle(false);
    }
  };

  // ----------------------------------------------------
  // CHAT WINDOW HEADER POINTER DRAG HANDLERS
  // ----------------------------------------------------
  const handleChatHeaderPointerDown = (e) => {
    e.preventDefault();
    try { e.target.setPointerCapture(e.pointerId); } catch {}

    setIsDraggingChat(true);
    chatDragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      posX: chatPos.x,
      posY: chatPos.y,
    };
  };

  const handleChatPointerMove = (e) => {
    if (!isDraggingChat) return;
    e.preventDefault();

    const deltaX = e.clientX - chatDragStartRef.current.x;
    const deltaY = e.clientY - chatDragStartRef.current.y;

    const chatWidth = Math.min(window.innerWidth - 20, 410);

    const clampedX = Math.max(5, Math.min(window.innerWidth - chatWidth - 5, chatDragStartRef.current.posX + deltaX));
    const clampedY = Math.max(5, Math.min(window.innerHeight - 60, chatDragStartRef.current.posY + deltaY));

    setChatPos({ x: clampedX, y: clampedY });
  };

  const handleChatPointerUp = (e) => {
    if (isDraggingChat) {
      try { e.target.releasePointerCapture(e.pointerId); } catch {}
      setIsDraggingChat(false);
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

  return createPortal(
    <div className="fixed z-[99999] font-mono select-none">
      {/* Draggable Floating Circle Icon (HTML5 Pointer Capture & Page-Stable) */}
      <div
        style={{
          left: `${circlePos.x}px`,
          top: `${circlePos.y}px`,
          touchAction: 'none',
        }}
        onPointerDown={handleCirclePointerDown}
        onPointerMove={handleCirclePointerMove}
        onPointerUp={handleCirclePointerUp}
        onPointerCancel={handleCirclePointerUp}
        onClick={handleCircleClick}
        className="fixed cursor-grab active:cursor-grabbing group transition-transform hover:scale-110 flex items-center justify-center"
      >
        <div className="relative flex h-14 w-14 items-center justify-center rounded-full calm-card shadow-lg backdrop-blur-md">
          <Bot size={24} className="group-hover:rotate-12 transition-transform pointer-events-none" />
          <span className="absolute -top-1 -right-1 flex h-4 w-4 pointer-events-none">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-current border-2 border-inherit"></span>
          </span>
          <div className="absolute -bottom-1 text-[8px] font-extrabold uppercase opacity-60 flex items-center pointer-events-none">
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
          className={`fixed z-[99999] w-[92vw] sm:w-[410px] rounded-2xl calm-card shadow-2xl backdrop-blur-xl transition-all duration-150 ${
            isMinimized ? 'h-16 overflow-hidden' : 'h-[520px] max-h-[80vh] flex flex-col'
          }`}
        >
          {/* Draggable Window Header */}
          <div
            onPointerDown={handleChatHeaderPointerDown}
            onPointerMove={handleChatPointerMove}
            onPointerUp={handleChatPointerUp}
            onPointerCancel={handleChatPointerUp}
            className="flex items-center justify-between border-b border-inherit px-3.5 py-2.5 theme-header cursor-grab active:cursor-grabbing hover:opacity-90 transition rounded-t-2xl"
          >
            <div className="flex items-center gap-2 pointer-events-none">
              <GripHorizontal size={14} className="opacity-50" />
              <div className="flex h-7 w-7 items-center justify-center rounded-lg calm-button font-bold">
                <Sparkles size={14} />
              </div>
              <div>
                <div className="text-xs font-black uppercase text-glow-white flex items-center gap-1.5 leading-none">
                  OfferForge AI Co-Pilot
                </div>
                <div className="text-[9px] opacity-60 flex items-center gap-1 font-mono mt-0.5">
                  <Eye size={10} className="animate-pulse" />
                  <span>Watching: {location.pathname}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1" onPointerDown={(e) => e.stopPropagation()}>
              <button
                onClick={() => setIsMinimized((prev) => !prev)}
                className="rounded-lg p-1.5 opacity-60 hover:opacity-100 hover:bg-current/10 transition"
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
                className="rounded-lg p-1.5 opacity-60 hover:opacity-100 hover:bg-current/10 transition"
                title="Reset Chat"
              >
                <RefreshCw size={13} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1.5 opacity-60 hover:opacity-100 hover:bg-current/10 transition"
                title="Close Chat"
              >
                <X size={13} />
              </button>
            </div>
          </div>

          {/* Window Body */}
          {!isMinimized && (
            <>
              <div ref={messageContainerRef} className="flex-1 overflow-y-auto p-3.5 space-y-3.5 text-xs font-sans">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl p-3 leading-relaxed font-mono ${
                        m.role === 'user'
                          ? 'calm-button font-semibold rounded-br-none shadow-md'
                          : 'border border-inherit bg-current/5 rounded-bl-none'
                      }`}
                    >
                      <div className="whitespace-pre-wrap text-xs">{m.text}</div>
                      <div
                        className={`text-[9px] mt-1 text-right font-mono ${
                          m.role === 'user' ? 'opacity-70' : 'opacity-50'
                        }`}
                      >
                        {m.time}
                      </div>
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="flex justify-start">
                    <div className="rounded-2xl rounded-bl-none border border-inherit bg-current/5 p-3 text-xs opacity-80 font-mono flex items-center gap-2">
                      <Sparkles size={13} className="animate-spin" />
                      <span>Analyzing screen context & crafting response...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Prompts */}
              <div className="px-3 py-1.5 border-t border-inherit overflow-x-auto flex gap-1.5 scrollbar-none font-mono">
                {quickPrompts.map((qp, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(qp)}
                    disabled={loading}
                    className="shrink-0 text-[9.5px] font-bold border border-inherit bg-current/5 hover:bg-current/15 rounded-lg px-2.5 py-1 transition"
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
                className="p-2.5 border-t border-inherit flex items-center gap-2 theme-header rounded-b-2xl"
              >
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ask AI Co-Pilot (watches your screen)..."
                  className="flex-1 calm-input text-xs px-3 py-1.5 font-mono"
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
    </div>,
    document.body
  );
}

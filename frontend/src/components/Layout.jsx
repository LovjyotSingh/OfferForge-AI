import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Cpu, FileText, LayoutDashboard, LogOut, Sparkles, User, ShieldCheck, Server, Code2 } from 'lucide-react';
import { clearAuth, getToken, getUser } from '../services/auth';
import CyberBackground from './CyberBackground';
import AIChatWidget from './AIChatWidget';
import ThemeSelector from './ThemeSelector';

export default function Layout({ children, showNav = true }) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getUser();
  const token = getToken();

  const logout = () => {
    clearAuth();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="app-shell relative flex flex-col justify-between font-sans min-h-screen">
      {/* Dynamic Background Canvas */}
      <CyberBackground />

      {showNav && (
        <header className="sticky top-0 z-50 theme-header border-b backdrop-blur-xl shadow-lg">
          {/* Top Ticker Bar */}
          <div className="border-b border-inherit px-4 py-1.5 text-[11px] flex items-center justify-between font-mono opacity-90">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 font-semibold">
                <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse"></span>
                SYSTEM ACTIVE
              </span>
              <span className="hidden sm:inline-block opacity-40">|</span>
              <span className="hidden sm:flex items-center gap-1 font-semibold">
                <ShieldCheck size={13} />
                COPYRIGHT © 2026 LOVJYOT SINGH
              </span>
            </div>
            <div className="flex items-center gap-3 font-semibold">
              <ThemeSelector />
              <span className="hidden sm:inline-block opacity-30">|</span>
              <span className="hidden sm:inline-block">POWERED BY GEMINI AI</span>
            </div>
          </div>

          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="flex min-h-16 items-center justify-between py-3">
              {/* Brand Logo */}
              <button onClick={() => navigate('/')} className="flex items-center gap-3 text-left group">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl calm-button font-bold shadow-md transition-transform group-hover:scale-105">
                  <Cpu size={20} />
                </div>
                <div className="leading-none">
                  <div className="text-xl font-black tracking-tight text-glow-white flex items-center gap-1">
                    OfferForge <span>AI</span>
                  </div>
                  <div className="text-[10px] font-mono tracking-widest opacity-80 uppercase mt-0.5 font-bold">Career Matrix Studio</div>
                </div>
              </button>

              {/* Navigation Items */}
              <nav className="hidden items-center gap-3 sm:flex">
                {token ? (
                  <>
                    <Link
                      to="/dashboard"
                      className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider transition ${
                        isActive('/dashboard')
                          ? 'calm-button shadow-md'
                          : 'calm-button-outline'
                      }`}
                    >
                      <LayoutDashboard size={15} />
                      Dashboard
                    </Link>
                    <Link
                      to="/resume"
                      className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider transition ${
                        isActive('/resume')
                          ? 'calm-button shadow-md'
                          : 'calm-button-outline'
                      }`}
                    >
                      <FileText size={15} />
                      ATS Scanner
                    </Link>
                    <Link
                      to="/job-copilot"
                      className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider transition ${
                        isActive('/job-copilot')
                          ? 'calm-button shadow-md'
                          : 'calm-button-outline'
                      }`}
                    >
                      <Sparkles size={15} className="text-emerald-400" />
                      Job Copilot
                    </Link>
                    <Link
                      to="/system-design"
                      className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider transition ${
                        isActive('/system-design')
                          ? 'calm-button shadow-md'
                          : 'calm-button-outline'
                      }`}
                    >
                      <Server size={15} />
                      System Design
                    </Link>
                    <Link
                      to="/code-sandbox"
                      className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider transition ${
                        isActive('/code-sandbox')
                          ? 'calm-button shadow-md'
                          : 'calm-button-outline'
                      }`}
                    >
                      <Code2 size={15} />
                      Code Sandbox
                    </Link>


                    <div className="h-4 w-px bg-current opacity-20 mx-1"></div>

                    <div className="flex items-center gap-2 rounded-lg border border-inherit px-3 py-1.5 text-xs font-bold">
                      <User size={13} />
                      <span>{user?.name || 'Candidate'}</span>
                    </div>

                    <button
                      onClick={logout}
                      className="flex items-center gap-1.5 rounded-lg calm-button-outline px-3 py-1.5 text-xs font-semibold transition"
                      title="Log Out"
                    >
                      <LogOut size={14} />
                      Exit
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="calm-button-outline px-4 py-1.5 text-xs font-bold uppercase transition"
                    >
                      Log In
                    </Link>
                    <Link
                      to="/register"
                      className="calm-button px-4 py-1.5 text-xs font-bold uppercase tracking-wider"
                    >
                      <span className="flex items-center gap-1.5">
                        <Sparkles size={14} />
                        Get Started
                      </span>
                    </Link>
                  </>
                )}
              </nav>

              {/* Mobile Trigger Button */}
              <div className="sm:hidden flex items-center gap-2">
                {token ? (
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="calm-button px-3.5 py-1.5 text-xs font-bold uppercase"
                  >
                    Dashboard
                  </button>
                ) : (
                  <button
                    onClick={() => navigate('/login')}
                    className="calm-button px-3.5 py-1.5 text-xs font-bold uppercase"
                  >
                    Log In
                  </button>
                )}
              </div>
            </div>
          </div>
        </header>
      )}

      <main className="flex-1 relative z-10">{children}</main>

      {/* Global Draggable Floating AI Chatbot Widget */}
      <AIChatWidget />

      {/* Dynamic Theme Footer */}
      <footer className="relative z-10 theme-footer border-t">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-5 text-xs sm:flex-row sm:px-6 font-mono opacity-90">
          <div className="flex items-center gap-2">
            <span>Copyright &copy; 2026 <strong className="font-bold">Lovjyot Singh</strong>. OfferForge AI Matrix. All Rights Reserved.</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] font-semibold">
            <span>AUTHOR: LOVJYOT SINGH</span>
            <span>•</span>
            <span className="font-bold uppercase">OFFERFORGE AI MATRIX</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

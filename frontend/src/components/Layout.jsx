import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Cpu, FileText, LayoutDashboard, LogOut, Sparkles, User, ShieldCheck } from 'lucide-react';
import { clearAuth, getToken, getUser } from '../services/auth';
import CyberBackground from './CyberBackground';

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
    <div className="app-shell relative flex flex-col justify-between text-white font-sans min-h-screen bg-black">
      {/* Black & Glowing White Particle Canvas */}
      <CyberBackground />

      {showNav && (
        <header className="sticky top-0 z-50 border-b border-white/20 bg-black/90 backdrop-blur-xl shadow-lg shadow-white/5">
          {/* Top Ticker Bar */}
          <div className="border-b border-white/10 bg-black px-4 py-1.5 text-[11px] text-white/80 flex items-center justify-between font-mono">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-white font-semibold">
                <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse"></span>
                SYSTEM ACTIVE
              </span>
              <span className="hidden sm:inline-block text-white/40">|</span>
              <span className="hidden sm:flex items-center gap-1 text-white font-semibold">
                <ShieldCheck size={13} className="text-white" />
                COPYRIGHT © 2026 LOVJYOT SINGH
              </span>
            </div>
            <div className="flex items-center gap-2 text-white/80 font-semibold">
              <span>POWERED BY GEMINI AI</span>
            </div>
          </div>

          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="flex min-h-16 items-center justify-between py-3">
              {/* Glowing White Brand Logo */}
              <button onClick={() => navigate('/')} className="flex items-center gap-3 text-left group">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-black font-bold shadow-md shadow-white/20 transition-transform group-hover:scale-105">
                  <Cpu size={20} />
                </div>
                <div className="leading-none">
                  <div className="text-xl font-black tracking-tight text-glow-white flex items-center gap-1">
                    OfferForge <span className="text-white">AI</span>
                  </div>
                  <div className="text-[10px] font-mono tracking-widest text-white/80 uppercase mt-0.5 font-bold">Career Matrix Studio</div>
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
                          ? 'bg-white text-black shadow-md shadow-white/20 font-bold'
                          : 'text-white/80 hover:bg-white/10 hover:text-white border border-white/20'
                      }`}
                    >
                      <LayoutDashboard size={15} />
                      Dashboard
                    </Link>
                    <Link
                      to="/resume"
                      className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider transition ${
                        isActive('/resume')
                          ? 'bg-white text-black shadow-md shadow-white/20 font-bold'
                          : 'text-white/80 hover:bg-white/10 hover:text-white border border-white/20'
                      }`}
                    >
                      <FileText size={15} />
                      ATS Scanner
                    </Link>

                    <div className="h-4 w-px bg-white/20 mx-1"></div>

                    <div className="flex items-center gap-2 rounded-lg border border-white/30 bg-black px-3 py-1.5 text-xs text-white">
                      <User size={13} className="text-white" />
                      <span className="font-bold text-white">{user?.name || 'Candidate'}</span>
                    </div>

                    <button
                      onClick={logout}
                      className="flex items-center gap-1.5 rounded-lg border border-white/30 bg-black px-3 py-1.5 text-xs font-semibold text-white/90 transition hover:bg-white/20"
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
                      className="rounded-lg border border-white/30 bg-black px-4 py-1.5 text-xs font-bold uppercase text-white transition hover:border-white hover:bg-white/10"
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

      {/* Black & Glowing White Footer */}
      <footer className="relative z-10 border-t border-white/20 bg-black">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-5 text-xs text-white/80 sm:flex-row sm:px-6 font-mono">
          <div className="flex items-center gap-2">
            <span>Copyright &copy; 2026 <strong className="text-white font-bold">Lovjyot Singh</strong>. OfferForge AI Matrix. All Rights Reserved.</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-white/80 font-semibold">
            <span>AUTHOR: LOVJYOT SINGH</span>
            <span>•</span>
            <span className="text-glow-white font-bold">BLACK & GLOWING WHITE EDITION</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

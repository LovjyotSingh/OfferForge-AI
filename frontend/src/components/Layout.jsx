import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'framer-motion';
import { LogOut, Menu, X } from 'lucide-react';
import Logo from './Logo';
import { EASE, PageTransition } from './motion';
import { clearAuth, getToken, getUser } from '../services/auth';

export function Backdrop() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute left-1/2 top-[-18rem] h-[36rem] w-[60rem] -translate-x-1/2 rounded-full bg-ember-600/20 blur-[140px] animate-breathe" />
      <div
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: 'radial-gradient(rgba(245,241,234,0.09) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
          maskImage: 'radial-gradient(ellipse 70% 55% at 50% 0%, #000 30%, transparent 75%)'
        }}
      />
    </div>
  );
}

function Navbar() {
  const navigate = useNavigate();
  const token = getToken();
  const user = getUser();
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);

  useMotionValueEvent(scrollY, 'change', latest => {
    const previous = scrollY.getPrevious() ?? 0;
    setScrolled(latest > 12);
    setHidden(latest > 240 && latest > previous && !open);
  });

  const logout = () => {
    clearAuth();
    setOpen(false);
    navigate('/');
  };

  const initial = (user?.name || '?').trim().charAt(0).toUpperCase();

  return (
    <motion.header
      animate={{ y: hidden ? -96 : 0 }}
      transition={{ duration: 0.45, ease: EASE }}
      className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-6"
    >
      <nav
        className={`mx-auto flex h-14 max-w-6xl items-center justify-between rounded-2xl border px-3 pl-4 transition-all duration-500 ${
          scrolled || open ? 'border-line bg-ink-950/70 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.8)] backdrop-blur-xl' : 'border-transparent'
        }`}
      >
        <Logo />

        <div className="hidden items-center gap-2 sm:flex">
          {token ? (
            <>
              <NavLink
                to="/dashboard"
                className={({ isActive }) => `rounded-full px-4 py-2 text-sm transition ${isActive ? 'text-paper' : 'text-muted hover:text-paper'}`}
              >
                Dashboard
              </NavLink>
              <div className="mx-1 h-5 w-px bg-line" />
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ember-500/15 text-xs font-semibold text-ember-300" title={user?.name}>
                {initial}
              </span>
              <button onClick={logout} className="rounded-full p-2 text-muted transition hover:bg-white/5 hover:text-paper" aria-label="Log out" title="Log out">
                <LogOut size={16} />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="rounded-full px-4 py-2 text-sm text-muted transition hover:text-paper">
                Sign in
              </Link>
              <Link to="/register" className="btn-primary py-2">
                Start practicing
              </Link>
            </>
          )}
        </div>

        <button onClick={() => setOpen(v => !v)} className="rounded-xl p-2 text-paper sm:hidden" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open}>
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="mx-auto mt-2 max-w-6xl rounded-2xl border border-line bg-ink-950/90 p-2 backdrop-blur-xl sm:hidden"
          >
            {token ? (
              <>
                <Link to="/dashboard" onClick={() => setOpen(false)} className="block rounded-xl px-4 py-3 text-sm hover:bg-white/5">
                  Dashboard
                </Link>
                <button onClick={logout} className="block w-full rounded-xl px-4 py-3 text-left text-sm text-muted hover:bg-white/5">
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setOpen(false)} className="block rounded-xl px-4 py-3 text-sm hover:bg-white/5">
                  Sign in
                </Link>
                <Link to="/register" onClick={() => setOpen(false)} className="btn-primary mt-1 w-full">
                  Start practicing
                </Link>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 py-8 text-xs text-faint sm:flex-row">
        <span>© {new Date().getFullYear()} OfferForge AI · Built by Lovjyot Singh</span>
        <span>Practice like it's the real thing.</span>
      </div>
    </footer>
  );
}

export default function Layout({ children, footer = true }) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <Backdrop />
      <Navbar />
      <PageTransition className="flex-1">{children}</PageTransition>
      {footer && <Footer />}
    </div>
  );
}

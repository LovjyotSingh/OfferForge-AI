import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import Logo, { Spark } from './Logo';
import { Backdrop } from './Layout';
import { EASE, PageTransition } from './motion';

const FLOATING = [
  { text: 'DSA ×2', className: 'left-[12%] top-[22%]', delay: 0 },
  { text: 'System Design ×2', className: 'right-[10%] top-[34%]', delay: 1.2 },
  { text: 'OOP ×2', className: 'left-[18%] bottom-[30%]', delay: 0.6 },
  { text: 'Behavioral ×1', className: 'right-[16%] bottom-[18%]', delay: 1.8 }
];

export function Field({ label, children, hint }) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      <div className="mt-2">{children}</div>
      {hint && <span className="mt-1.5 block text-xs text-faint">{hint}</span>}
    </label>
  );
}

export function PasswordInput(props) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <input {...props} type={visible ? 'text' : 'password'} className="input pr-11" />
      <button
        type="button"
        onClick={() => setVisible(v => !v)}
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-faint transition hover:text-paper"
        aria-label={visible ? 'Hide password' : 'Show password'}
      >
        {visible ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
}

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="relative grid min-h-screen lg:grid-cols-2">
      <Backdrop />

      <div className="flex flex-col px-5 py-6 sm:px-10">
        <Logo />
        <PageTransition className="flex flex-1 items-center justify-center py-12">
          <div className="w-full max-w-sm">
            <h1 className="text-4xl font-semibold tracking-[-0.03em]">{title}</h1>
            <p className="mt-2 text-muted">{subtitle}</p>
            <div className="mt-10">{children}</div>
            <div className="mt-8 text-center text-sm text-muted">{footer}</div>
          </div>
        </PageTransition>
      </div>

      <div className="relative hidden overflow-hidden border-l border-line bg-ink-900/50 lg:block">
        <motion.div
          aria-hidden
          className="absolute left-1/2 top-1/2 -ml-[15rem] -mt-[15rem] h-[30rem] w-[30rem] rounded-full bg-ember-600/25 blur-[110px]"
          animate={{ scale: [1, 1.15, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        {FLOATING.map(chip => (
          <motion.span
            key={chip.text}
            className={`chip absolute bg-ink-950/60 backdrop-blur ${chip.className}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: [0, -12, 0] }}
            transition={{
              opacity: { duration: 1, delay: 0.4 + chip.delay * 0.3 },
              y: { duration: 6, delay: chip.delay, repeat: Infinity, ease: 'easeInOut' }
            }}
          >
            {chip.text}
          </motion.span>
        ))}
        <div className="relative flex h-full flex-col items-center justify-center px-16 text-center">
          <motion.div initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} transition={{ duration: 1.2, ease: EASE }}>
            <Spark className="h-14 w-14" />
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: EASE }}
            className="mt-10 max-w-md font-display text-4xl italic leading-tight text-paper"
          >
            “The interview is the easy part when you've already done it ten times.”
          </motion.p>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="mt-6 text-sm text-muted">
            Structured rounds · Rubric grading · Honest feedback
          </motion.p>
        </div>
      </div>
    </div>
  );
}

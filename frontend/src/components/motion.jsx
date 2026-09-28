import { useEffect, useRef, useState } from 'react';
import { animate, motion, useInView, useMotionValue, useSpring } from 'framer-motion';

export const EASE = [0.16, 1, 0.3, 1];

export function Reveal({ children, delay = 0, y = 24, className, as = 'div', once = true, amount = 0.3 }) {
  const Component = motion[as];
  return (
    <Component
      className={className}
      initial={{ opacity: 0, y, filter: 'blur(8px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once, amount }}
      transition={{ duration: 0.9, delay, ease: EASE }}
    >
      {children}
    </Component>
  );
}

export function Stagger({ children, className, delay = 0, gap = 0.08, amount = 0.2 }) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: gap, delayChildren: delay } } }}
    >
      {children}
    </motion.div>
  );
}

export const staggerItem = {
  hidden: { opacity: 0, y: 28, filter: 'blur(6px)' },
  show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.8, ease: EASE } }
};

// Splits text into words that rise out of a clipping mask one after another.
export function WordReveal({ text, className, delay = 0, gap = 0.06, wordClassName }) {
  const words = text.split(' ');
  return (
    <span className={className} aria-label={text}>
      {words.map((word, i) => (
        <span key={`${word}-${i}`} aria-hidden className="inline-block overflow-hidden pb-[0.12em] align-bottom">
          <motion.span
            className={`inline-block ${wordClassName || ''}`}
            initial={{ y: '110%', rotate: 4 }}
            animate={{ y: '0%', rotate: 0 }}
            transition={{ duration: 1, delay: delay + i * gap, ease: EASE }}
          >
            {word}
            {i < words.length - 1 ? '\u00A0' : ''}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

export function CountUp({ value, duration = 1.4, className, suffix = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView || typeof value !== 'number') return undefined;
    const controls = animate(0, value, {
      duration,
      ease: EASE,
      onUpdate: v => setDisplay(Math.round(v))
    });
    return () => controls.stop();
  }, [inView, value, duration]);

  return (
    <span ref={ref} className={className}>
      {typeof value === 'number' ? display : '—'}
      {typeof value === 'number' ? suffix : ''}
    </span>
  );
}

// Pulls its child gently toward the cursor while hovered.
export function Magnetic({ children, strength = 0.3, className }) {
  const ref = useRef(null);
  const x = useSpring(useMotionValue(0), { stiffness: 250, damping: 18, mass: 0.4 });
  const y = useSpring(useMotionValue(0), { stiffness: 250, damping: 18, mass: 0.4 });

  const onMove = e => {
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - rect.left - rect.width / 2) * strength);
    y.set((e.clientY - rect.top - rect.height / 2) * strength);
  };
  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div ref={ref} style={{ x, y }} onMouseMove={onMove} onMouseLeave={reset} className={`inline-block ${className || ''}`}>
      {children}
    </motion.div>
  );
}

export function Spotlight({ as: Component = 'div', className = '', children, ...props }) {
  const onMove = e => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mx', `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty('--my', `${e.clientY - rect.top}px`);
  };
  return (
    <Component onMouseMove={onMove} className={`spotlight ${className}`} {...props}>
      {children}
    </Component>
  );
}

export function PageTransition({ children, className }) {
  return (
    <motion.main
      className={className}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.45, ease: EASE }}
    >
      {children}
    </motion.main>
  );
}

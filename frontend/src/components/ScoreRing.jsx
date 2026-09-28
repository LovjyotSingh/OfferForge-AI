import { motion } from 'framer-motion';
import { CountUp, EASE } from './motion';
import { scoreTone } from '../lib/format';

export default function ScoreRing({ score, size = 160, stroke = 10, label, delay = 0.2 }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const graded = typeof score === 'number';
  const tone = scoreTone(score);

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <div className="absolute inset-4 rounded-full blur-2xl" style={{ background: tone.color, opacity: graded ? 0.18 : 0 }} />
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(245,241,234,0.07)" strokeWidth={stroke} />
        {graded && (
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={tone.color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            whileInView={{ strokeDashoffset: circumference * (1 - score / 100) }}
            viewport={{ once: true }}
            transition={{ duration: 1.6, delay, ease: EASE }}
          />
        )}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display leading-none" style={{ fontSize: size * 0.34 }}>
          <CountUp value={graded ? score : null} duration={1.6} />
        </span>
        {label && <span className="mt-1 text-[11px] uppercase tracking-[0.16em] text-muted">{label}</span>}
      </div>
    </div>
  );
}

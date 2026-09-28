import { Link } from 'react-router-dom';

export function Spark({ className = 'h-5 w-5' }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <defs>
        <linearGradient id="spark-ember" x1="14" y1="10" x2="50" y2="54" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFDDA8" />
          <stop offset="0.5" stopColor="#FF9A3D" />
          <stop offset="1" stopColor="#E5480B" />
        </linearGradient>
      </defs>
      <path
        d="M32 6c2 15.5 8.5 22 26 26-17.5 4-24 10.5-26 26-2-15.5-8.5-22-26-26 17.5-4 24-10.5 26-26Z"
        fill="url(#spark-ember)"
      />
    </svg>
  );
}

export default function Logo({ to = '/' }) {
  return (
    <Link to={to} className="group flex items-center gap-2.5" aria-label="OfferForge AI home">
      <span className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-line bg-ink-900">
        <span className="absolute inset-0 rounded-xl bg-ember-500/20 opacity-0 blur-md transition duration-500 group-hover:opacity-100" />
        <Spark className="relative h-5 w-5 transition-transform duration-700 ease-out group-hover:rotate-90" />
      </span>
      <span className="text-[15px] font-semibold tracking-tight">
        OfferForge<span className="font-display text-lg italic text-ember-400"> AI</span>
      </span>
    </Link>
  );
}

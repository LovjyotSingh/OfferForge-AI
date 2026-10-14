import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';

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
    <Link to={to} className="flex shrink-0 items-center">
      <img src={logo} alt="OfferForge AI" className="h-10 w-auto sm:h-11" />
    </Link>
  );
}

import { useEffect, useState } from 'react';
import { Moon, Sun, Palette } from 'lucide-react';

export default function ThemeSelector() {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('offerforge_theme');
    return saved || 'dark';
  });

  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('offerforge_theme', theme);
  }, [theme]);

  const themes = [
    { id: 'dark', label: 'Dark Mode', icon: Moon, desc: 'Pitch Black & Glow' },
    { id: 'light', label: 'Light Mode', icon: Sun, desc: 'Clean Modern White' },
    { id: 'cyber', label: 'Aurora Gradient', icon: Palette, desc: 'Blue ➔ Green Cyber' },
  ];

  const currentThemeObj = themes.find((t) => t.id === theme) || themes[0];
  const CurrentIcon = currentThemeObj.icon;

  return (
    <div className="relative font-mono">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-1.5 rounded-lg border border-white/20 bg-black/50 px-2.5 py-1 text-xs font-bold text-white hover:bg-white/10 transition backdrop-blur-md shadow-sm"
        title="Change Website Theme"
      >
        <CurrentIcon size={14} className="text-white" />
        <span className="hidden md:inline uppercase text-[10px] tracking-wider">{currentThemeObj.label}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 z-50 w-48 rounded-xl border border-white/20 bg-black/95 p-1.5 text-white shadow-2xl backdrop-blur-xl">
          <div className="px-2 py-1 text-[9px] font-extrabold uppercase text-white/50 border-b border-white/10 mb-1">
            Choose Visual Theme
          </div>
          {themes.map((t) => {
            const IconComponent = t.icon;
            const isSelected = theme === t.id;
            return (
              <button
                key={t.id}
                onClick={() => {
                  setTheme(t.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-left text-xs transition ${
                  isSelected
                    ? 'bg-white text-black font-extrabold shadow-sm'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <IconComponent size={14} />
                  <div>
                    <div className="leading-tight font-bold">{t.label}</div>
                    <div className={`text-[9px] font-mono ${isSelected ? 'text-black/60' : 'text-white/50'}`}>
                      {t.desc}
                    </div>
                  </div>
                </div>
                {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-black"></span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

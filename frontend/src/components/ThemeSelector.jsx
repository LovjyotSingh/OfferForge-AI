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
        className="flex items-center gap-1.5 rounded-lg border border-inherit bg-current/10 px-2.5 py-1 text-xs font-bold hover:bg-current/20 transition backdrop-blur-md shadow-sm"
        title="Change Website Theme"
      >
        <CurrentIcon size={14} />
        <span className="hidden md:inline uppercase text-[10px] tracking-wider">{currentThemeObj.label}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 z-50 w-48 rounded-xl calm-card p-1.5 shadow-2xl backdrop-blur-xl">
          <div className="px-2 py-1 text-[9px] font-extrabold uppercase opacity-50 border-b border-inherit mb-1">
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
                    ? 'calm-button font-extrabold shadow-sm'
                    : 'opacity-80 hover:opacity-100 hover:bg-current/10'
                }`}
              >
                <div className="flex items-center gap-2">
                  <IconComponent size={14} />
                  <div>
                    <div className="leading-tight font-bold">{t.label}</div>
                    <div className="text-[9px] font-mono opacity-60">
                      {t.desc}
                    </div>
                  </div>
                </div>
                {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-current"></span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

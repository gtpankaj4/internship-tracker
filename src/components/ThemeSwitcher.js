import React, { useEffect, useState } from 'react';
import { Cog6ToothIcon, MoonIcon, SunIcon } from '@heroicons/react/24/solid';

const COLORS = [
  { name: 'Red', value: '#E50046' },
  { name: 'Teal', value: '#03A6A1' },
  { name: 'Purple', value: '#B13BFF' },
  { name: 'Blue', value: '#6fcffb' },
  { name: 'Orange', value: '#FF7D29' },
];

function ThemeSwitcher() {
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const [color, setColor] = useState(COLORS[3].value); // Default blue

  useEffect(() => {
    const savedColor = localStorage.getItem('themeColor');
    const savedDark = localStorage.getItem('themeDark') === 'true';
    if (savedColor) setColor(savedColor);
    setDark(savedDark);
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty('--primary-color', color);
    document.documentElement.style.setProperty('--primary-color-hover', shadeColor(color, -15));
    localStorage.setItem('themeColor', color);
  }, [color]);

  useEffect(() => {
    if (dark) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
    localStorage.setItem('themeDark', dark);
  }, [dark]);

  function shadeColor(hex, percent) {
    let R = parseInt(hex.substring(1,3),16);
    let G = parseInt(hex.substring(3,5),16);
    let B = parseInt(hex.substring(5,7),16);
    R = parseInt(R * (100 + percent) / 100);
    G = parseInt(G * (100 + percent) / 100);
    B = parseInt(B * (100 + percent) / 100);
    R = (R<255)?R:255;  G = (G<255)?G:255;  B = (B<255)?B:255;
    const RR = ((R.toString(16).length===1)?"0":"") + R.toString(16);
    const GG = ((G.toString(16).length===1)?"0":"") + G.toString(16);
    const BB = ((B.toString(16).length===1)?"0":"") + B.toString(16);
    return "#"+RR+GG+BB;
  }

  return (
    <div className={`fixed right-8 top-8 z-50 flex flex-col items-end gap-2 transition-transform duration-300 ${open ? 'translate-x-[-260px]' : ''}`}> {/* Slide left when open */}
      <div className="flex flex-col gap-4 mb-2 relative">
        {/* Theme color button */}
        <div
          className="w-12 h-12 rounded-full border-2 shadow cursor-pointer flex items-center justify-center bg-transparent"
          style={{ borderColor: color, background: 'transparent' }}
          onClick={() => setOpen(o => !o)}
          aria-label="Toggle theme switcher"
        >
          <Cog6ToothIcon className="w-6 h-6 animate-spin-slow" style={{ color }} />
        </div>
        {/* Theme switcher box, slides out to the right of the gear button */}
        <div className={`absolute left-20 top-1/2 style-switcher border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-2 transition-transform duration-300 ${open ? 'translate-x-0 opacity-100 pointer-events-auto' : 'translate-x-8 opacity-0 pointer-events-none'}`}
          style={{ minWidth: 220, background: dark ? 'rgba(30,30,30,0.85)' : 'rgba(255,255,255,0.85)', backdropFilter: 'blur(4px)', transform: 'translateY(-50%)', paddingRight: 8 }}>
          <h4 className={`font-bold mb-2 ${dark ? 'text-gray-100' : 'text-gray-700'}`} style={{ fontSize: '1rem' }}>Theme Colors</h4>
          <div className="flex gap-2 mb-1 colors">
            {COLORS.map((c, idx) => (
              <span
                key={c.value}
                className={`inline-block w-7 h-7 rounded-full cursor-pointer border-2 border-white shadow color-${idx+1}`}
                style={{ background: c.value, outline: color === c.value ? `2px solid ${color}` : 'none' }}
                onClick={() => setColor(c.value)}
                title={c.name}
              />
            ))}
          </div>
        </div>
        {/* Dark mode button */}
        <div
          className="w-12 h-12 rounded-full border-2 shadow cursor-pointer flex items-center justify-center bg-transparent"
          style={{ borderColor: dark ? color : '#bbb', background: 'transparent' }}
          onClick={() => setDark(d => !d)}
          aria-label="Toggle dark mode"
        >
          {dark ? (
            <SunIcon className="w-6 h-6 text-white" />
          ) : (
            <MoonIcon className="w-6 h-6" style={{ color: '#222' }} />
          )}
        </div>
      </div>
    </div>
  );
}

export default ThemeSwitcher; 
import React from 'react';
import { Moon, Sun, Bell } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function Topbar({ title, subtitle }) {
  const { theme, toggle } = useTheme();

  return (
    <header className="topbar">
      <div>
        <div className="topbar-title">{title}</div>
        {subtitle && <div className="topbar-subtitle">{subtitle}</div>}
      </div>
      <div className="topbar-actions">
        <button className="btn btn-ghost btn-sm" style={{ position: 'relative' }}>
          <Bell size={15} />
          <span className="notif-dot" />
        </button>
        <button className="theme-toggle" onClick={toggle} title="Toggle theme">
          {theme === 'dark'
            ? <Sun size={12} color="#fff" style={{ position: 'absolute', right: 4, top: 6 }} />
            : <Moon size={12} color="#fff" style={{ position: 'absolute', left: 4, top: 6 }} />}
        </button>
      </div>
    </header>
  );
}

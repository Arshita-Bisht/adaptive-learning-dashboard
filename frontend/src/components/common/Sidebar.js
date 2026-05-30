import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, BarChart3, Brain, Shield,
  TrendingUp, Bell, Trophy, BookOpen, Zap
} from 'lucide-react';

const navItems = [
  { label: 'Overview', icon: LayoutDashboard, path: '/', section: 'main' },
  { label: 'Students', icon: Users, path: '/students', section: 'main' },
  { label: 'Analytics', icon: BarChart3, path: '/analytics', section: 'main' },
  { label: 'Recommendations', icon: Brain, path: '/recommendations', section: 'main' },
  { label: 'Predictions', icon: TrendingUp, path: '/predictions', section: 'insights' },
  { label: 'Alerts', icon: Bell, path: '/alerts', section: 'insights' },
  { label: 'Leaderboard', icon: Trophy, path: '/leaderboard', section: 'insights' },
  { label: 'Admin Panel', icon: Shield, path: '/admin', section: 'admin' },
];

const sections = ['main', 'insights', 'admin'];
const sectionLabels = { main: 'Main', insights: 'Insights', admin: 'Admin' };

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <div style={{ width: 28, height: 28, background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={14} color="#fff" />
          </div>
          <span className="logo-text">LearnIQ</span>
        </div>
        <div className="logo-sub">Adaptive Learning</div>
      </div>

      <nav className="sidebar-nav">
        {sections.map(section => {
          const items = navItems.filter(i => i.section === section);
          return (
            <div key={section}>
              <div className="nav-section-label">{sectionLabels[section]}</div>
              {items.map(item => {
                const Icon = item.icon;
                const active = location.pathname === item.path ||
                  (item.path !== '/' && location.pathname.startsWith(item.path));
                return (
                  <div
                    key={item.path}
                    className={`nav-item ${active ? 'active' : ''}`}
                    onClick={() => navigate(item.path)}
                  >
                    <Icon className="nav-icon" />
                    <span>{item.label}</span>
                  </div>
                );
              })}
            </div>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div className="avatar" style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', width: 28, height: 28, fontSize: 11 }}>A</div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>Admin</div>
            <div style={{ fontSize: 10, color: 'var(--sidebar-text)' }}>Instructor</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

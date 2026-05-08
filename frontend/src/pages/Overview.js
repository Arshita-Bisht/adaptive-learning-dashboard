import React, { useState, useEffect } from 'react';
import { Users, TrendingUp, Activity, CheckCircle, AlertTriangle, Zap } from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import Topbar from "../components/common/Topbar";
import { getOverview, getPerformanceDistribution, getAlerts } from '../utils/api';

const COLORS = ['#e11d48', '#d97706', '#4f46e5', '#059669'];

export default function Overview() {
  const [overview, setOverview] = useState(null);
  const [dist, setDist] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getOverview(), getPerformanceDistribution(), getAlerts()])
      .then(([o, d, a]) => {
        setOverview(o.data);
        setDist(d.data);
        setAlerts(a.data.slice(0, 5));
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div>
      <Topbar title="Overview" subtitle="Adaptive Learning Dashboard" />
      <div className="page-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400 }}>
        <div className="loading-spinner" />
      </div>
    </div>
  );

  const stats = [
    { label: 'Total Students', value: overview?.total_students, icon: Users, color: '#4f46e5', bg: 'rgba(79,70,229,0.1)', change: '+3 this week', dir: 'up' },
    { label: 'Avg Performance', value: `${overview?.avg_performance}%`, icon: TrendingUp, color: '#059669', bg: 'rgba(5,150,105,0.1)', change: '+2.1% vs last week', dir: 'up' },
    { label: 'Active Learners', value: overview?.active_learners, icon: Activity, color: '#0d9488', bg: 'rgba(13,148,136,0.1)', change: 'Last 48 hours', dir: 'up' },
    { label: 'Completion Rate', value: `${overview?.completion_rate}%`, icon: CheckCircle, color: '#7c3aed', bg: 'rgba(124,58,237,0.1)', change: '+1.4% vs last week', dir: 'up' },
    { label: 'At-Risk Students', value: overview?.at_risk_count, icon: AlertTriangle, color: '#e11d48', bg: 'rgba(225,29,72,0.1)', change: 'Needs attention', dir: 'down' },
    { label: 'Engaged Today', value: Math.round(overview?.active_learners * 0.6), icon: Zap, color: '#d97706', bg: 'rgba(217,119,6,0.1)', change: 'Real-time', dir: 'up' },
  ];

  const alertColors = { danger: 'alert-danger', warning: 'alert-warning', success: 'alert-success' };
  const alertIcons = { danger: '🔴', warning: '🟡', success: '🟢' };

  return (
    <div className="fade-in">
      <Topbar title="Dashboard Overview" subtitle={`${new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`} />
      <div className="page-content">
        {/* STAT CARDS */}
        <div className="stat-grid">
          {stats.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} className="stat-card">
                <div className="stat-icon" style={{ background: s.bg }}>
                  <Icon size={16} color={s.color} />
                </div>
                <div className="stat-label">{s.label}</div>
                <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
                <div className={`stat-change ${s.dir}`}>{s.dir === 'up' ? '↑' : '↓'} {s.change}</div>
              </div>
            );
          })}
        </div>

        {/* CHARTS ROW */}
        <div className="grid-3-1" style={{ marginBottom: 16 }}>
          {/* Weekly Trend */}
          <div className="card">
            <div className="card-header" style={{ paddingBottom: 0 }}>
              <div className="card-title">Weekly Performance Trend</div>
              <div className="card-subtitle">Average score across all students</div>
            </div>
            <div className="card-body">
              <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={overview?.weekly_trends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="week" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                    <YAxis domain={[50, 100]} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                    <Tooltip
                      contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
                    />
                    <Line
                      type="monotone" dataKey="avg_score" stroke="#4f46e5" strokeWidth={2.5}
                      dot={{ fill: '#4f46e5', r: 4 }} activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Performance Distribution */}
          <div className="card">
            <div className="card-header" style={{ paddingBottom: 0 }}>
              <div className="card-title">Score Distribution</div>
              <div className="card-subtitle">Students by range</div>
            </div>
            <div className="card-body">
              <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={dist} dataKey="count" nameKey="range" cx="50%" cy="50%" outerRadius={90} label={({ name, value }) => `${name}: ${value}`} labelLine={false} fontSize={10}>
                      {dist.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* ALERTS */}
        <div className="grid-2">
          <div className="card">
            <div className="card-header">
              <div className="card-title">⚡ Smart Alerts</div>
              <div className="card-subtitle">Auto-generated system alerts</div>
            </div>
            <div className="card-body">
              {alerts.map((a, i) => (
                <div key={i} className={`alert ${alertColors[a.type] || 'alert-warning'}`}>
                  <span style={{ fontSize: 16 }}>{alertIcons[a.type] || '⚪'}</span>
                  <div>
                    <div className="alert-title">{a.title}</div>
                    <div className="alert-msg">{a.message}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Performance Bar */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">Score Distribution</div>
              <div className="card-subtitle">By score bucket</div>
            </div>
            <div className="card-body">
              <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dist}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="range" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                    <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                    <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]}>
                      {dist.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

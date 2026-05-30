import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react';
import Topbar from '../components/common/Topbar';
import { getAlerts } from '../utils/api';

const ALERT_CONFIG = {
  danger: { icon: XCircle, color: '#e11d48', bg: 'rgba(225,29,72,0.08)', border: '#e11d48', label: 'Critical' },
  warning: { icon: AlertTriangle, color: '#d97706', bg: 'rgba(217,119,6,0.08)', border: '#d97706', label: 'Warning' },
  success: { icon: CheckCircle, color: '#059669', bg: 'rgba(5,150,105,0.08)', border: '#059669', label: 'Info' },
};

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getAlerts().then(r => setAlerts(r.data)).finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? alerts : alerts.filter(a => a.type === filter);
  const counts = { danger: alerts.filter(a => a.type === 'danger').length, warning: alerts.filter(a => a.type === 'warning').length, success: alerts.filter(a => a.type === 'success').length };

  return (
    <div className="fade-in">
      <Topbar title="Smart Alerts" subtitle={`${alerts.length} active alerts`} />
      <div className="page-content">
        <div className="stat-grid" style={{ marginBottom: 20 }}>
          {[
            { label: 'Critical', count: counts.danger, color: '#e11d48', key: 'danger' },
            { label: 'Warnings', count: counts.warning, color: '#d97706', key: 'warning' },
            { label: 'Improvements', count: counts.success, color: '#059669', key: 'success' },
          ].map(s => (
            <div key={s.key} className="stat-card" style={{ cursor: 'pointer', border: filter === s.key ? `2px solid ${s.color}` : undefined }} onClick={() => setFilter(f => f === s.key ? 'all' : s.key)}>
              <div className="stat-label">{s.label}</div>
              <div className="stat-value" style={{ color: s.color }}>{s.count}</div>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div className="card-title">System Alerts</div>
              <div className="card-subtitle">Auto-generated from student data analysis</div>
            </div>
            <select value={filter} onChange={e => setFilter(e.target.value)}>
              <option value="all">All Types</option>
              <option value="danger">Critical</option>
              <option value="warning">Warning</option>
              <option value="success">Improvement</option>
            </select>
          </div>
          <div className="card-body">
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><div className="loading-spinner" /></div>
            ) : filtered.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>No alerts found</div>
            ) : (
              filtered.map((a, i) => {
                const cfg = ALERT_CONFIG[a.type] || ALERT_CONFIG.warning;
                const Icon = cfg.icon;
                return (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 16px',
                    borderRadius: 8, background: cfg.bg, borderLeft: `3px solid ${cfg.border}`,
                    marginBottom: 8, cursor: 'pointer', transition: 'opacity 0.15s'
                  }}
                    onClick={() => a.student_id && navigate(`/students/${a.student_id}`)}
                  >
                    <Icon size={16} color={cfg.color} style={{ flexShrink: 0, marginTop: 1 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{a.title}</div>
                        <span style={{ fontSize: 10, fontWeight: 700, color: cfg.color, background: `${cfg.border}20`, padding: '2px 7px', borderRadius: 10 }}>{cfg.label}</span>
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{a.message}</div>
                      {a.student_id && <div style={{ fontSize: 11, color: cfg.color, marginTop: 4 }}>Click to view student profile →</div>}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

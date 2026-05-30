import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, Users, AlertTriangle, Star, Shield } from 'lucide-react';
import Topbar from '../components/common/Topbar';
import { getAdminDashboard, getExportSummary } from '../utils/api';

export default function Admin() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getAdminDashboard().then(r => setData(r.data)).finally(() => setLoading(false));
  }, []);

  const exportCSV = async () => {
    const r = await getExportSummary();
    const rows = r.data;
    const headers = Object.keys(rows[0]).join(',');
    const body = rows.map(row => Object.values(row).join(',')).join('\n');
    const blob = new Blob([headers + '\n' + body], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'student_report.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return (
    <div>
      <Topbar title="Admin Panel" />
      <div className="page-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <div className="loading-spinner" />
      </div>
    </div>
  );

  return (
    <div className="fade-in">
      <Topbar title="Admin Panel" subtitle="Instructor & administrator tools" />
      <div className="page-content">
        {/* Stats */}
        <div className="stat-grid" style={{ marginBottom: 20 }}>
          {[
            { label: 'Total Students', value: data?.total_students, icon: Users, color: '#4f46e5' },
            { label: 'Struggling Students', value: data?.struggling_count, icon: AlertTriangle, color: '#e11d48' },
            { label: 'Avg Performance', value: `${data?.avg_performance}%`, icon: Star, color: '#059669' },
            { label: 'Subjects Tracked', value: data?.subjects?.length, icon: Shield, color: '#7c3aed' },
          ].map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} className="stat-card">
                <Icon size={18} color={s.color} />
                <div className="stat-label">{s.label}</div>
                <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
              </div>
            );
          })}
        </div>

        <div className="grid-2">
          {/* Struggling Students */}
          <div className="card">
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div className="card-title">⚠️ Struggling Students</div>
                <div className="card-subtitle">Score below 60% — needs intervention</div>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/students?risk_level=high')}>View All</button>
            </div>
            <div className="card-body">
              {data?.struggling_students?.map((s, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border-light)', cursor: 'pointer' }}
                  onClick={() => navigate(`/students/${s.id}`)}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{s.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.id}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div className="progress-bar" style={{ width: 80 }}>
                      <div className="progress-fill" style={{ width: `${s.score}%`, background: '#e11d48' }} />
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#e11d48', minWidth: 36 }}>{s.score}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Performers */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">🏆 Top Performers</div>
              <div className="card-subtitle">Highest scoring students</div>
            </div>
            <div className="card-body">
              {data?.top_performers?.map((s, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border-light)', cursor: 'pointer' }}
                  onClick={() => navigate(`/students/${s.id}`)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 22, height: 22, borderRadius: '50%', background: i === 0 ? '#FFD700' : i === 1 ? '#C0C0C0' : '#CD7F32', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: '#fff' }}>{i + 1}</div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{s.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.id}</div>
                    </div>
                  </div>
                  <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--accent-green)', fontFamily: 'Syne' }}>{s.score}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Subjects */}
        <div className="card" style={{ marginTop: 16 }}>
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div className="card-title">📊 Subjects Overview</div>
              <div className="card-subtitle">All tracked subjects</div>
            </div>
            <button className="btn btn-primary" onClick={exportCSV}>
              <Download size={14} /> Export CSV Report
            </button>
          </div>
          <div className="card-body">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {data?.subjects?.map((s, i) => (
                <span key={i} className="badge badge-blue" style={{ fontSize: 13, padding: '6px 14px' }}>{s}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

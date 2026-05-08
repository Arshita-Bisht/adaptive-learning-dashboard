import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import Topbar from '../components/common/Topbar';
import { getGradePredictions, getDropoutRisk } from '../utils/api';

export default function Predictions() {
  const [grades, setGrades] = useState([]);
  const [dropout, setDropout] = useState([]);
  const [tab, setTab] = useState('grades');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getGradePredictions(), getDropoutRisk()])
      .then(([g, d]) => { setGrades(g.data); setDropout(d.data); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div>
      <Topbar title="Predictions" />
      <div className="page-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <div className="loading-spinner" />
      </div>
    </div>
  );

  return (
    <div className="fade-in">
      <Topbar title="Predictive Analytics" subtitle="ML-powered forecasting" />
      <div className="page-content">
        <div className="tabs" style={{ marginBottom: 20 }}>
          {['grades', 'dropout'].map(t => (
            <button key={t} className={`tab-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
              {t === 'grades' ? 'Grade Predictions' : 'Dropout Risk'}
            </button>
          ))}
        </div>

        {tab === 'grades' && (
          <div>
            <div className="stat-grid" style={{ marginBottom: 16 }}>
              <div className="stat-card">
                <div className="stat-label">Students Predicted to Improve</div>
                <div className="stat-value" style={{ color: 'var(--accent-green)' }}>
                  {grades.filter(g => g.predicted_grade > g.current_avg).length}
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Average Predicted Grade</div>
                <div className="stat-value" style={{ color: 'var(--accent-blue)' }}>
                  {grades.length ? (grades.reduce((a, g) => a + g.predicted_grade, 0) / grades.length).toFixed(1) : 0}%
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Likely to Pass (≥60%)</div>
                <div className="stat-value" style={{ color: 'var(--accent-teal)' }}>
                  {grades.filter(g => g.predicted_grade >= 60).length}
                </div>
              </div>
            </div>
            <div className="card">
              <div className="card-header">
                <div className="card-title">Current vs Predicted Grades</div>
              </div>
              <div className="card-body">
                <div className="chart-container-lg">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={grades.slice(0, 20)}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} interval={0} angle={-30} textAnchor="end" height={50} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                      <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
                      <Bar dataKey="current_avg" fill="#4f46e5" name="Current" radius={[3, 3, 0, 0]} />
                      <Bar dataKey="predicted_grade" fill="#059669" name="Predicted" radius={[3, 3, 0, 0]} opacity={0.7} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === 'dropout' && (
          <div className="card">
            <div className="card-header">
              <div className="card-title">Dropout Risk Rankings</div>
              <div className="card-subtitle">Logistic Regression — Higher % = More at risk</div>
            </div>
            <div className="card-body">
              <div className="prob-bar-container">
                {dropout.slice(0, 20).map((s, i) => (
                  <div key={i} className="prob-bar-row">
                    <span className="prob-bar-label">{s.name}</span>
                    <div className="prob-bar-track">
                      <div className="prob-bar-fill" style={{
                        width: `${s.dropout_risk * 100}%`,
                        background: s.dropout_risk > 0.6 ? '#e11d48' : s.dropout_risk > 0.35 ? '#d97706' : '#059669'
                      }} />
                    </div>
                    <span className="prob-bar-value">{Math.round(s.dropout_risk * 100)}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

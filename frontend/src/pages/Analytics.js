import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ScatterChart, Scatter, LineChart, Line, Cell, PieChart, Pie, Legend
} from 'recharts';
import Topbar from '../components/common/Topbar';
import { getSubjectAnalytics, getScatterData, getClusters, getRiskAnalysis, getPerformanceDistribution } from '../utils/api';

const CLUSTER_COLORS = ['#e11d48', '#d97706', '#4f46e5', '#059669'];
const CLUSTER_NAMES = { 0: 'Struggling', 1: 'Average', 2: 'Advanced', 3: 'Exceptional' };
const RISK_COLORS = { high: '#e11d48', medium: '#d97706', low: '#059669' };

export default function Analytics() {
  const [subjects, setSubjects] = useState({});
  const [scatter, setScatter] = useState([]);
  const [clusters, setClusters] = useState({ clusters: [], stats: {} });
  const [risk, setRisk] = useState([]);
  const [dist, setDist] = useState([]);
  const [tab, setTab] = useState('subjects');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getSubjectAnalytics(), getScatterData(), getClusters(), getRiskAnalysis(), getPerformanceDistribution()])
      .then(([s, sc, cl, r, d]) => {
        setSubjects(s.data);
        setScatter(sc.data);
        setClusters(cl.data);
        setRisk(r.data);
        setDist(d.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const subjectChartData = Object.entries(subjects).map(([name, data]) => ({
    name: name.slice(0, 5),
    Quiz: data.avg_quiz,
    Assignment: data.avg_assignment,
    Passing: data.passing_rate,
  }));

  const clusterPieData = Object.entries(clusters.stats || {}).map(([key, val]) => ({
    name: val.name,
    value: val.count,
    cluster: parseInt(key)
  }));

  const riskSorted = [...risk].sort((a, b) => b.risk_probability - a.risk_probability).slice(0, 15);

  if (loading) return (
    <div>
      <Topbar title="Analytics" subtitle="Student Performance Analytics" />
      <div className="page-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <div className="loading-spinner" />
      </div>
    </div>
  );

  return (
    <div className="fade-in">
      <Topbar title="Analytics" subtitle="Deep dive into student performance" />
      <div className="page-content">
        <div className="tabs" style={{ marginBottom: 20 }}>
          {['subjects', 'scatter', 'clusters', 'risk'].map(t => (
            <button key={t} className={`tab-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {tab === 'subjects' && (
          <div>
            <div className="card" style={{ marginBottom: 16 }}>
              <div className="card-header">
                <div className="card-title">Subject-wise Average Scores</div>
                <div className="card-subtitle">Quiz vs Assignment comparison across all students</div>
              </div>
              <div className="card-body">
                <div className="chart-container-lg">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={subjectChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                      <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
                      <Legend />
                      <Bar dataKey="Quiz" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Assignment" fill="#0d9488" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
              {Object.entries(subjects).map(([subj, data]) => (
                <div key={subj} className="card">
                  <div className="card-body">
                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>{subj}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Avg Quiz</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#4f46e5' }}>{data.avg_quiz}%</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Avg Assign</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#0d9488' }}>{data.avg_assignment}%</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Pass Rate</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: data.passing_rate >= 70 ? '#059669' : '#d97706' }}>{data.passing_rate}%</span>
                    </div>
                    <div className="progress-bar" style={{ marginTop: 8 }}>
                      <div className="progress-fill" style={{ width: `${data.passing_rate}%`, background: data.passing_rate >= 70 ? '#059669' : '#d97706' }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'scatter' && (
          <div className="card">
            <div className="card-header">
              <div className="card-title">Study Time vs Average Score Correlation</div>
              <div className="card-subtitle">Each dot represents a student — color indicates risk level</div>
            </div>
            <div className="card-body">
              <div className="chart-container-lg">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="study_time" name="Study Time (hrs)" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} label={{ value: 'Study Time (hrs/day)', position: 'insideBottom', offset: -5, fill: 'var(--text-muted)', fontSize: 12 }} />
                    <YAxis dataKey="avg_score" name="Avg Score" domain={[0, 100]} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} label={{ value: 'Avg Score (%)', angle: -90, position: 'insideLeft', fill: 'var(--text-muted)', fontSize: 12 }} />
                    <Tooltip
                      cursor={{ strokeDasharray: '3 3' }}
                      contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
                      content={({ payload }) => {
                        if (!payload?.length) return null;
                        const d = payload[0]?.payload;
                        return (
                          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: 10, fontSize: 12 }}>
                            <div style={{ fontWeight: 600 }}>{d?.name}</div>
                            <div>Study: {d?.study_time} hrs</div>
                            <div>Score: {d?.avg_score}%</div>
                            <div>Risk: <span style={{ color: RISK_COLORS[d?.risk_level] }}>{d?.risk_level}</span></div>
                          </div>
                        );
                      }}
                    />
                    {['high', 'medium', 'low'].map(rl => (
                      <Scatter
                        key={rl}
                        name={`${rl} risk`}
                        data={scatter.filter(s => s.risk_level === rl)}
                        fill={RISK_COLORS[rl]}
                        opacity={0.75}
                      />
                    ))}
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
              <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 12 }}>
                {Object.entries(RISK_COLORS).map(([level, color]) => (
                  <div key={level} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: color }} />
                    <span style={{ fontSize: 12, textTransform: 'capitalize' }}>{level} Risk</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === 'clusters' && (
          <div className="grid-2">
            <div className="card">
              <div className="card-header">
                <div className="card-title">K-Means Student Clusters</div>
                <div className="card-subtitle">ML-based student grouping</div>
              </div>
              <div className="card-body">
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={clusterPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={110} label={({ name, value }) => `${name}: ${value}`} labelLine={false} fontSize={11}>
                        {clusterPieData.map((entry) => (
                          <Cell key={entry.cluster} fill={CLUSTER_COLORS[entry.cluster]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            <div className="card">
              <div className="card-header"><div className="card-title">Cluster Statistics</div></div>
              <div className="card-body">
                {Object.entries(clusters.stats || {}).map(([key, val]) => (
                  <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, padding: 12, borderRadius: 8, background: 'var(--bg-secondary)' }}>
                    <div style={{ width: 12, height: 12, borderRadius: '50%', background: CLUSTER_COLORS[parseInt(key)], flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{val.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{val.count} students · Avg: {val.avg_score}% · Attendance: {val.avg_attendance}%</div>
                    </div>
                    <span className="badge badge-blue">{val.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === 'risk' && (
          <div className="card">
            <div className="card-header">
              <div className="card-title">Dropout Risk Probability — Top 15 At-Risk Students</div>
              <div className="card-subtitle">Logistic Regression predictions</div>
            </div>
            <div className="card-body">
              <div className="prob-bar-container">
                {riskSorted.map((s, i) => (
                  <div key={i} className="prob-bar-row">
                    <span className="prob-bar-label">{s.name}</span>
                    <div className="prob-bar-track">
                      <div
                        className="prob-bar-fill"
                        style={{
                          width: `${s.risk_probability * 100}%`,
                          background: s.risk_probability > 0.6 ? '#e11d48' : s.risk_probability > 0.35 ? '#d97706' : '#059669'
                        }}
                      />
                    </div>
                    <span className="prob-bar-value">{Math.round(s.risk_probability * 100)}%</span>
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

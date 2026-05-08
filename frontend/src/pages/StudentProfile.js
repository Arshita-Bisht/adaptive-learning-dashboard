import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, Flame, Trophy, BookOpen, TrendingUp, AlertTriangle } from 'lucide-react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, Cell
} from 'recharts';
import Topbar from '../components/common/Topbar';
import { getStudentProfile } from '../utils/api';

const SUBJECTS_SHORT = ['Math', 'Physics', 'Chem', 'Bio', 'English', 'History', 'CS', 'Econ'];

export default function StudentProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');

  useEffect(() => {
    getStudentProfile(id)
      .then(r => setProfile(r.data))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div>
      <Topbar title="Student Profile" />
      <div className="page-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400 }}>
        <div className="loading-spinner" />
      </div>
    </div>
  );
  if (!profile) return <div className="page-content">Student not found</div>;

  const subjectNames = Object.keys(profile.subjects);
  const radarData = subjectNames.map((subj, i) => ({
    subject: SUBJECTS_SHORT[i] || subj.slice(0, 4),
    score: (profile.subjects[subj].quiz_score + profile.subjects[subj].assignment_score) / 2
  }));

  const histData = profile.performance_history.map((v, i) => ({ week: `W${i + 1}`, score: v }));

  const subjectBarData = subjectNames.map(subj => ({
    subject: subj.slice(0, 6),
    quiz: profile.subjects[subj].quiz_score,
    assignment: profile.subjects[subj].assignment_score,
  }));

  const riskColor = profile.risk_level === 'high' ? '#e11d48' : profile.risk_level === 'medium' ? '#d97706' : '#059669';

  return (
    <div className="fade-in">
      <Topbar title="Student Profile" subtitle={profile.name} />
      <div className="page-content">
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/students')} style={{ marginBottom: 20 }}>
          <ArrowLeft size={13} /> Back to Students
        </button>

        {/* PROFILE HEADER */}
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-body">
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
              <div style={{
                width: 72, height: 72, borderRadius: '50%',
                background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 24, fontWeight: 800, color: '#fff', fontFamily: 'Syne, sans-serif'
              }}>
                {profile.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>{profile.name}</h2>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>
                  {profile.id} · {profile.email} · Grade {profile.grade}
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {profile.badges.map((b, i) => (
                    <span key={i} className="achievement-chip">🏆 {b}</span>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 24, textAlign: 'center' }}>
                {[
                  { label: 'Avg Score', value: `${profile.avg_score}%`, color: '#4f46e5' },
                  { label: 'Attendance', value: `${Math.round(profile.attendance * 100)}%`, color: '#059669' },
                  { label: 'Streak', value: `🔥 ${profile.streak}`, color: '#d97706' },
                  { label: 'Points', value: profile.points, color: '#7c3aed' },
                ].map((m, i) => (
                  <div key={i}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: m.color, fontFamily: 'Syne, sans-serif' }}>{m.value}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{m.label}</div>
                  </div>
                ))}
              </div>
              <div style={{
                padding: '8px 16px', borderRadius: 8,
                background: `${riskColor}18`, border: `1px solid ${riskColor}30`
              }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Risk Level</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: riskColor, textTransform: 'capitalize' }}>
                  {profile.risk_level}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* TABS */}
        <div className="tabs" style={{ marginBottom: 16 }}>
          {['overview', 'analytics', 'recommendations', 'predictions'].map(t => (
            <button key={t} className={`tab-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {tab === 'overview' && (
          <div className="grid-2">
            {/* Radar */}
            <div className="card">
              <div className="card-header"><div className="card-title">Subject Radar</div></div>
              <div className="card-body">
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="var(--border)" />
                      <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
                      <Radar name="Score" dataKey="score" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.25} strokeWidth={2} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* History */}
            <div className="card">
              <div className="card-header"><div className="card-title">Performance Timeline</div></div>
              <div className="card-body">
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={histData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="week" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                      <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
                      <Line type="monotone" dataKey="score" stroke="#7c3aed" strokeWidth={2.5} dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Strengths & Weaknesses */}
            <div className="card">
              <div className="card-header"><div className="card-title">Strengths</div></div>
              <div className="card-body">
                {(profile.strengths || []).map((s, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Star size={14} color="#d97706" />
                      <span style={{ fontSize: 13 }}>{s.subject}</span>
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--accent-green)', fontSize: 13 }}>{s.score}%</div>
                      <div className="progress-bar" style={{ width: 80 }}>
                        <div className="progress-fill" style={{ width: `${s.score}%`, background: 'var(--accent-green)' }} />
                      </div>
                    </div>
                  </div>
                ))}
                {(!profile.strengths || profile.strengths.length === 0) && <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>No top strengths identified yet.</div>}
              </div>
            </div>

            <div className="card">
              <div className="card-header"><div className="card-title">Areas to Improve</div></div>
              <div className="card-body">
                {(profile.weaknesses || []).map((w, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <AlertTriangle size={14} color="#e11d48" />
                      <span style={{ fontSize: 13 }}>{w.subject}</span>
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--accent-rose)', fontSize: 13 }}>{w.score}%</div>
                      <div className="progress-bar" style={{ width: 80 }}>
                        <div className="progress-fill" style={{ width: `${w.score}%`, background: 'var(--accent-rose)' }} />
                      </div>
                    </div>
                  </div>
                ))}
                {(!profile.weaknesses || profile.weaknesses.length === 0) && <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>No major weaknesses found. Keep it up!</div>}
              </div>
            </div>
          </div>
        )}

        {tab === 'analytics' && (
          <div>
            <div className="card" style={{ marginBottom: 16 }}>
              <div className="card-header"><div className="card-title">Subject-wise Quiz vs Assignment</div></div>
              <div className="card-body">
                <div className="chart-container-lg">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={subjectBarData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="subject" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                      <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
                      <Bar dataKey="quiz" fill="#4f46e5" radius={[4, 4, 0, 0]} name="Quiz" />
                      <Bar dataKey="assignment" fill="#0d9488" radius={[4, 4, 0, 0]} name="Assignment" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === 'recommendations' && profile.recommendations && (
          <div>
            <div className="grid-2">
              <div className="card">
                <div className="card-header"><div className="card-title">📚 Weak Topics to Revise</div></div>
                <div className="card-body">
                  {profile.recommendations.weak_topics?.slice(0, 6).map((t, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500 }}>{t.topic}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{t.subject}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className="progress-bar" style={{ width: 80 }}>
                          <div className="progress-fill" style={{ width: `${t.mastery * 100}%`, background: t.mastery < 0.4 ? '#e11d48' : '#d97706' }} />
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 700, color: t.mastery < 0.4 ? '#e11d48' : '#d97706' }}>
                          {Math.round(t.mastery * 100)}%
                        </span>
                        <span className={`badge ${t.priority === 'high' ? 'badge-rose' : 'badge-amber'}`}>{t.priority}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card">
                <div className="card-header"><div className="card-title">🗺️ Learning Path</div></div>
                <div className="card-body">
                  {profile.recommendations.learning_path?.map((step, i) => (
                    <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                      <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--accent-blue)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                        {step.step}
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500 }}>{step.action}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{step.subject} · {step.duration}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="card" style={{ marginTop: 16 }}>
              <div className="card-header"><div className="card-title">📖 Recommended Materials</div></div>
              <div className="card-body">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
                  {profile.recommendations.recommended_materials?.slice(0, 4).map((m, i) => (
                    <div key={i} style={{ padding: 14, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span className="badge badge-blue">{m.subject}</span>
                        <span className="badge badge-teal">{m.difficulty}</span>
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{m.topic}</div>
                      {m.materials.map((mat, j) => (
                        <div key={j} style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <BookOpen size={10} /> {mat}
                        </div>
                      ))}
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>⏱ {m.estimated_time}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === 'predictions' && (
          <div className="grid-2">
            <div className="card">
              <div className="card-header"><div className="card-title">📈 Predicted Future Scores</div></div>
              <div className="card-body">
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={[...histData.slice(-4), ...(profile.future_predictions || [])]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="week" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                      <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }} />
                      <Line type="monotone" dataKey="score" stroke="#7c3aed" strokeWidth={2} dot={{ r: 3 }} name="Historical" />
                      <Line type="monotone" dataKey="predicted_score" stroke="#059669" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3 }} name="Predicted" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            <div className="card">
              <div className="card-header"><div className="card-title">⚠️ Risk Assessment</div></div>
              <div className="card-body">
                <div style={{ textAlign: 'center', marginBottom: 20 }}>
                  <div style={{ fontSize: 48, fontWeight: 800, fontFamily: 'Syne', color: profile.risk_level === 'high' ? '#e11d48' : profile.risk_level === 'medium' ? '#d97706' : '#059669' }}>
                    {Math.round(profile.dropout_risk * 100)}%
                  </div>
                  <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Dropout Risk Probability</div>
                </div>
                <div className="progress-bar" style={{ height: 12, marginBottom: 16 }}>
                  <div className="progress-fill" style={{
                    width: `${profile.dropout_risk * 100}%`,
                    background: profile.risk_level === 'high' ? '#e11d48' : profile.risk_level === 'medium' ? '#d97706' : '#059669'
                  }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div style={{ padding: 12, borderRadius: 8, background: 'var(--bg-secondary)', textAlign: 'center' }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: '#4f46e5', fontFamily: 'Syne' }}>{profile.predicted_grade}%</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Predicted Final Grade</div>
                  </div>
                  <div style={{ padding: 12, borderRadius: 8, background: 'var(--bg-secondary)', textAlign: 'center' }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: '#d97706', fontFamily: 'Syne', textTransform: 'capitalize' }}>{profile.learning_speed}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Learning Speed</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

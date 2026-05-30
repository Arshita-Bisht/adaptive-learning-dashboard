import React, { useState, useEffect } from 'react';
import { Brain, BookOpen, Target, MapPin } from 'lucide-react';
import Topbar from '../components/common/Topbar';
import { getStudents, getStudentRecommendations } from '../utils/api';

export default function Recommendations() {
  const [students, setStudents] = useState([]);
  const [selected, setSelected] = useState(null);
  const [recs, setRecs] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState('topics');

  useEffect(() => {
    getStudents({ risk_level: 'high', limit: 20 }).then(r => {
      const all = r.data.students;
      setStudents(all);
      if (all.length > 0) selectStudent(all[0].id);
    });
  }, []);

  function selectStudent(id) {
    setSelected(id);
    setLoading(true);
    getStudentRecommendations(id)
      .then(r => setRecs(r.data))
      .finally(() => setLoading(false));
  }

  return (
    <div className="fade-in">
      <Topbar title="Recommendations" subtitle="AI-powered personalized learning paths" />
      <div className="page-content">
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 16, alignItems: 'start' }}>
          {/* Student list */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">Students</div>
              <div className="card-subtitle">Select to view recommendations</div>
            </div>
            <div className="card-body" style={{ padding: '12px 8px', maxHeight: 600, overflowY: 'auto' }}>
              {students.map(s => (
                <div
                  key={s.id}
                  onClick={() => selectStudent(s.id)}
                  style={{
                    padding: '10px 12px', borderRadius: 8, cursor: 'pointer',
                    background: selected === s.id ? 'rgba(79,70,229,0.1)' : 'transparent',
                    border: selected === s.id ? '1px solid rgba(79,70,229,0.3)' : '1px solid transparent',
                    marginBottom: 4, transition: 'all 0.15s'
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{s.name}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                    <span className={`risk-dot risk-${s.risk_level}`} />
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.avg_score}% avg</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations panel */}
          <div>
            {loading ? (
              <div className="card" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
                <div className="loading-spinner" />
              </div>
            ) : recs ? (
              <div>
                <div className="tabs" style={{ marginBottom: 16 }}>
                  {['topics', 'materials', 'path', 'quizzes'].map(t => (
                    <button key={t} className={`tab-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                  ))}
                </div>

                {tab === 'topics' && (
                  <div className="card">
                    <div className="card-header">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Target size={16} color="var(--accent-rose)" />
                        <div className="card-title">Weak Topics to Revise</div>
                      </div>
                    </div>
                    <div className="card-body">
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
                        {recs.weak_topics?.map((t, i) => (
                          <div key={i} style={{ padding: 14, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                              <span className="badge badge-blue">{t.subject}</span>
                              <span className={`badge ${t.priority === 'high' ? 'badge-rose' : 'badge-amber'}`}>{t.priority}</span>
                            </div>
                            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>{t.topic}</div>
                            <div className="progress-bar">
                              <div className="progress-fill" style={{ width: `${t.mastery * 100}%`, background: t.mastery < 0.4 ? '#e11d48' : '#d97706' }} />
                            </div>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                              Mastery: {Math.round(t.mastery * 100)}%
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {tab === 'materials' && (
                  <div className="card">
                    <div className="card-header">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <BookOpen size={16} color="var(--accent-teal)" />
                        <div className="card-title">Recommended Study Materials</div>
                      </div>
                    </div>
                    <div className="card-body">
                      {recs.recommended_materials?.map((m, i) => (
                        <div key={i} style={{ padding: 16, borderRadius: 8, border: '1px solid var(--border)', marginBottom: 10, background: 'var(--bg-secondary)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                            <div>
                              <span className="badge badge-blue" style={{ marginRight: 6 }}>{m.subject}</span>
                              <span className="badge badge-teal">{m.topic}</span>
                            </div>
                            <div style={{ display: 'flex', gap: 6 }}>
                              <span className="badge badge-amber">{m.difficulty}</span>
                              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>⏱ {m.estimated_time}</span>
                            </div>
                          </div>
                          {m.materials?.map((mat, j) => (
                            <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderTop: j > 0 ? '1px solid var(--border-light)' : 'none' }}>
                              <BookOpen size={12} color="var(--text-muted)" />
                              <span style={{ fontSize: 13 }}>{mat}</span>
                              <button className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto', fontSize: 11 }}>Start →</button>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {tab === 'path' && (
                  <div className="card">
                    <div className="card-header">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <MapPin size={16} color="var(--accent-purple)" />
                        <div className="card-title">Personalized Learning Path</div>
                      </div>
                    </div>
                    <div className="card-body">
                      <div style={{ marginBottom: 20 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Study Plan</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
                          Daily goal: {recs.study_plan?.daily_goal} · Focus: {recs.study_plan?.focus_subjects?.join(', ')}
                        </div>
                      </div>
                      <div style={{ position: 'relative', paddingLeft: 24 }}>
                        <div style={{ position: 'absolute', left: 11, top: 0, bottom: 0, width: 2, background: 'var(--border)' }} />
                        {recs.learning_path?.map((step, i) => (
                          <div key={i} style={{ position: 'relative', marginBottom: 20 }}>
                            <div style={{ position: 'absolute', left: -18, top: 2, width: 16, height: 16, borderRadius: '50%', background: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: '#fff', fontWeight: 800 }}>
                              {step.step}
                            </div>
                            <div style={{ padding: '10px 14px', borderRadius: 8, background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                              <div style={{ fontSize: 13, fontWeight: 600 }}>{step.action}</div>
                              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{step.subject} · {step.duration}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div style={{ marginTop: 12 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Milestones</div>
                        {recs.study_plan?.milestones?.map((m, i) => (
                          <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 6 }}>
                            <span style={{ fontSize: 11, fontWeight: 700, color: '#4f46e5', width: 50 }}>Week {m.week}</span>
                            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{m.goal}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {tab === 'quizzes' && (
                  <div className="card">
                    <div className="card-header">
                      <div className="card-title">🎯 Practice Quizzes</div>
                    </div>
                    <div className="card-body">
                      {recs.practice_quizzes?.map((q, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 14, borderRadius: 8, border: '1px solid var(--border)', marginBottom: 10, background: 'var(--bg-secondary)' }}>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 600 }}>{q.topic} Quiz</div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{q.subject} · {q.questions} questions · {q.estimated_time}</div>
                          </div>
                          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            <span className={`badge ${q.difficulty === 'easy' ? 'badge-green' : 'badge-amber'}`}>{q.difficulty}</span>
                            <button className="btn btn-primary btn-sm">Start Quiz</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="card" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
                <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                  <Brain size={32} />
                  <div style={{ marginTop: 8, fontSize: 14 }}>Select a student to view recommendations</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

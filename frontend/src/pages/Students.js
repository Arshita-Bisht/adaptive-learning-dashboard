import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Eye, ChevronUp, ChevronDown } from 'lucide-react';
import Topbar from '../components/common/Topbar';
import { getStudents } from '../utils/api';

const AVATAR_COLORS = ['#4f46e5','#7c3aed','#0d9488','#d97706','#e11d48','#059669'];

function initials(name) {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

function avatarColor(name) {
  const code = name.charCodeAt(0) + name.charCodeAt(1);
  return AVATAR_COLORS[code % AVATAR_COLORS.length];
}

export default function Students() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [grade, setGrade] = useState('');
  const [risk, setRisk] = useState('');
  const [sort, setSort] = useState({ key: 'avg_score', dir: 'desc' });
  const navigate = useNavigate();

  useEffect(() => {
    const params = {};
    if (search) params.search = search;
    if (grade) params.grade = grade;
    if (risk) params.risk_level = risk;
    setLoading(true);
    getStudents(params)
      .then(r => setStudents(r.data.students))
      .finally(() => setLoading(false));
  }, [search, grade, risk]);

  const sorted = [...students].sort((a, b) => {
    const dir = sort.dir === 'asc' ? 1 : -1;
    return (a[sort.key] > b[sort.key] ? 1 : -1) * dir;
  });

  const toggleSort = (key) => setSort(s => ({ key, dir: s.key === key && s.dir === 'desc' ? 'asc' : 'desc' }));

  const SortIcon = ({ col }) => {
    if (sort.key !== col) return null;
    return sort.dir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />;
  };

  return (
    <div className="fade-in">
      <Topbar title="Students" subtitle={`${students.length} students total`} />
      <div className="page-content">
        {/* FILTERS */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-body" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <div className="search-input">
              <Search size={14} color="var(--text-muted)" />
              <input
                placeholder="Search by name or ID..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <select value={grade} onChange={e => setGrade(e.target.value)}>
              <option value="">All Grades</option>
              {['9','10','11','12'].map(g => <option key={g} value={g}>Grade {g}</option>)}
            </select>
            <select value={risk} onChange={e => setRisk(e.target.value)}>
              <option value="">All Risk Levels</option>
              <option value="high">High Risk</option>
              <option value="medium">Medium Risk</option>
              <option value="low">Low Risk</option>
            </select>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
              <Filter size={14} color="var(--text-muted)" />
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{sorted.length} results</span>
            </div>
          </div>
        </div>

        {/* TABLE */}
        <div className="card">
          <div className="card-body" style={{ padding: 0, overflow: 'auto' }}>
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
                <div className="loading-spinner" />
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th style={{ cursor: 'pointer' }} onClick={() => toggleSort('grade')}>
                      Grade <SortIcon col="grade" />
                    </th>
                    <th style={{ cursor: 'pointer' }} onClick={() => toggleSort('avg_score')}>
                      Avg Score <SortIcon col="avg_score" />
                    </th>
                    <th style={{ cursor: 'pointer' }} onClick={() => toggleSort('attendance')}>
                      Attendance <SortIcon col="attendance" />
                    </th>
                    <th style={{ cursor: 'pointer' }} onClick={() => toggleSort('study_time_hrs')}>
                      Study Time <SortIcon col="study_time_hrs" />
                    </th>
                    <th>Risk Level</th>
                    <th>Progress</th>
                    <th>Streak</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map(s => (
                    <tr key={s.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div className="avatar" style={{ background: avatarColor(s.name) }}>
                            {initials(s.name)}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 13 }}>{s.name}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.id} · {s.email}</div>
                          </div>
                        </div>
                      </td>
                      <td><span className="badge badge-blue">Grade {s.grade}</span></td>
                      <td>
                        <span style={{ fontWeight: 700, color: s.avg_score >= 75 ? 'var(--accent-green)' : s.avg_score >= 55 ? 'var(--accent-amber)' : 'var(--accent-rose)' }}>
                          {s.avg_score}%
                        </span>
                      </td>
                      <td>{Math.round(s.attendance * 100)}%</td>
                      <td>{s.study_time_hrs} hrs/day</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span className={`risk-dot risk-${s.risk_level}`} />
                          <span style={{ fontSize: 12, textTransform: 'capitalize' }}>{s.risk_level}</span>
                        </div>
                      </td>
                      <td style={{ width: 120 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div className="progress-bar" style={{ flex: 1 }}>
                            <div
                              className="progress-fill"
                              style={{
                                width: `${s.completion_rate * 100}%`,
                                background: s.completion_rate > 0.75 ? 'var(--accent-green)' : s.completion_rate > 0.5 ? 'var(--accent-amber)' : 'var(--accent-rose)'
                              }}
                            />
                          </div>
                          <span style={{ fontSize: 11, color: 'var(--text-muted)', width: 30 }}>
                            {Math.round(s.completion_rate * 100)}%
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className="streak-badge">🔥 {s.streak}</span>
                      </td>
                      <td>
                        <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/students/${s.id}`)}>
                          <Eye size={13} /> View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

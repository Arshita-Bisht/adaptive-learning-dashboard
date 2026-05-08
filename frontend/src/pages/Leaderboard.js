import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Flame, Star } from 'lucide-react';
import Topbar from '../components/common/Topbar';
import { getLeaderboard } from '../utils/api';

const RANK_COLORS = ['#FFD700', '#C0C0C0', '#CD7F32'];
const AVATAR_COLORS = ['#4f46e5','#7c3aed','#0d9488','#d97706','#e11d48','#059669'];

export default function Leaderboard() {
  const [board, setBoard] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getLeaderboard().then(r => setBoard(r.data)).finally(() => setLoading(false));
  }, []);

  const top3 = board.slice(0, 3);
  const rest = board.slice(3);

  return (
    <div className="fade-in">
      <Topbar title="Leaderboard" subtitle="Top performing students" />
      <div className="page-content">
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="loading-spinner" /></div>
        ) : (
          <>
            {/* PODIUM */}
            <div className="card" style={{ marginBottom: 20, padding: 32 }}>
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <Trophy size={28} color="#FFD700" />
                <div style={{ fontSize: 18, fontWeight: 800, fontFamily: 'Syne', marginTop: 4 }}>Hall of Fame</div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: 20 }}>
                {[top3[1], top3[0], top3[2]].filter(Boolean).map((s, i) => {
                  const realRank = i === 0 ? 2 : i === 1 ? 1 : 3;
                  const heights = [100, 130, 80];
                  const idx = i;
                  return (
                    <div key={s.id} style={{ textAlign: 'center', cursor: 'pointer' }} onClick={() => navigate(`/students/${s.id}`)}>
                      <div style={{
                        width: 52, height: 52, borderRadius: '50%', margin: '0 auto 8px',
                        background: `linear-gradient(135deg, ${AVATAR_COLORS[s.id.slice(-2) % AVATAR_COLORS.length]}, #7c3aed)`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 18, fontWeight: 800, color: '#fff', fontFamily: 'Syne',
                        border: `3px solid ${RANK_COLORS[realRank - 1]}`
                      }}>
                        {s.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 700 }}>{s.name.split(' ')[0]}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>{s.points} pts</div>
                      <div style={{
                        width: 80, height: heights[idx], background: `${RANK_COLORS[realRank - 1]}30`,
                        border: `2px solid ${RANK_COLORS[realRank - 1]}`, borderRadius: '8px 8px 0 0',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 22, fontWeight: 900, color: RANK_COLORS[realRank - 1], fontFamily: 'Syne'
                      }}>
                        #{realRank}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* REST OF LEADERBOARD */}
            <div className="card">
              <div className="card-header"><div className="card-title">Full Rankings</div></div>
              <div className="card-body">
                {board.map((s, i) => (
                  <div key={s.id} className="leaderboard-item" style={{ cursor: 'pointer' }} onClick={() => navigate(`/students/${s.id}`)}>
                    <div className="rank-badge" style={{
                      background: i < 3 ? `${RANK_COLORS[i]}20` : 'var(--bg-card)',
                      color: i < 3 ? RANK_COLORS[i] : 'var(--text-muted)',
                      border: i < 3 ? `1px solid ${RANK_COLORS[i]}40` : '1px solid var(--border)'
                    }}>
                      {i + 1}
                    </div>
                    <div className="avatar" style={{ background: AVATAR_COLORS[i % AVATAR_COLORS.length] }}>
                      {s.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{s.name}</div>
                      <div style={{ display: 'flex', gap: 6, marginTop: 2, flexWrap: 'wrap' }}>
                        {s.badges?.slice(0, 3).map((b, j) => (
                          <span key={j} className="achievement-chip" style={{ fontSize: 10, padding: '2px 7px' }}>🏆 {b}</span>
                        ))}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent-blue)' }}>{s.avg_score}%</div>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Avg Score</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div className="streak-badge" style={{ justifyContent: 'center' }}>🔥 {s.streak}</div>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Streak</div>
                      </div>
                      <div style={{ textAlign: 'center', minWidth: 60 }}>
                        <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--accent-purple)', fontFamily: 'Syne' }}>{s.points}</div>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Points</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

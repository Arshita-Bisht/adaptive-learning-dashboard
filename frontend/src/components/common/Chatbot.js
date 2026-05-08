import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot } from 'lucide-react';

const BOT_RESPONSES = {
  default: "I'm your AI learning assistant! Ask me about student performance, recommendations, or analytics.",
  help: "I can help you: \n• Find struggling students\n• Get learning recommendations\n• Explain analytics\n• Suggest study materials",
  risk: "High-risk students are those with attendance below 70%, avg score below 55, or study time under 2hrs/day. Check the Alerts page for details!",
  recommend: "Recommendations are based on topic mastery scores. Students scoring below 60% on a topic get personalized study materials and practice quizzes.",
  cluster: "Students are grouped into 4 clusters using K-Means: Struggling, Average, Advanced, and Exceptional. Check Analytics → Clusters for the breakdown.",
  predict: "We use Logistic Regression for dropout risk and Linear Trend models for grade prediction. Visit the Predictions page for full details.",
  improve: "To improve performance: increase study time, focus on weak topics, maintain 90%+ attendance, and complete all assignments.",
};

function getResponse(msg) {
  const lower = msg.toLowerCase();
  if (lower.includes('risk') || lower.includes('dropout')) return BOT_RESPONSES.risk;
  if (lower.includes('recommend') || lower.includes('material')) return BOT_RESPONSES.recommend;
  if (lower.includes('cluster') || lower.includes('group')) return BOT_RESPONSES.cluster;
  if (lower.includes('predict') || lower.includes('forecast')) return BOT_RESPONSES.predict;
  if (lower.includes('improve') || lower.includes('better') || lower.includes('help')) return BOT_RESPONSES.improve;
  if (lower.includes('help') || lower.includes('what can')) return BOT_RESPONSES.help;
  return BOT_RESPONSES.default;
}

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', text: "Hi! I'm LearnIQ AI 🤖 How can I help you today?" }
  ]);
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = () => {
    if (!input.trim()) return;
    const userMsg = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setTimeout(() => {
      const botMsg = { role: 'bot', text: getResponse(input) };
      setMessages(prev => [...prev, botMsg]);
    }, 600);
  };

  return (
    <div className="chatbot-panel">
      {open && (
        <div className="chatbot-window fade-in">
          <div className="chatbot-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Bot size={16} color="#fff" />
              <span style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>LearnIQ AI Assistant</span>
            </div>
            <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fff' }}>
              <X size={16} />
            </button>
          </div>
          <div className="chatbot-messages">
            {messages.map((m, i) => (
              <div key={i} className={`chat-msg ${m.role}`}>{m.text}</div>
            ))}
            <div ref={bottomRef} />
          </div>
          <div className="chatbot-input">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              placeholder="Ask about students, analytics..."
            />
            <button className="btn btn-primary btn-sm" onClick={send}><Send size={13} /></button>
          </div>
        </div>
      )}
      <button className="chatbot-fab" onClick={() => setOpen(o => !o)}>
        {open ? <X size={20} /> : <MessageCircle size={20} />}
      </button>
    </div>
  );
}

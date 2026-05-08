import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Sidebar from './components/common/Sidebar';
import Chatbot from './components/common/Chatbot';
import Overview from './pages/Overview';
import Students from './pages/Students';
import StudentProfile from './pages/StudentProfile';
import Analytics from './pages/Analytics';
import Recommendations from './pages/Recommendations';
import Predictions from './pages/Predictions';
import Alerts from './pages/Alerts';
import Leaderboard from './pages/Leaderboard';
import Admin from './pages/Admin';
import './index.css';

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <div className="app-layout">
          <Sidebar />
          <div className="main-content">
            <Routes>
              <Route path="/" element={<Overview />} />
              <Route path="/students" element={<Students />} />
              <Route path="/students/:id" element={<StudentProfile />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/recommendations" element={<Recommendations />} />
              <Route path="/predictions" element={<Predictions />} />
              <Route path="/alerts" element={<Alerts />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/admin" element={<Admin />} />
            </Routes>
          </div>
          <Chatbot />
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
}

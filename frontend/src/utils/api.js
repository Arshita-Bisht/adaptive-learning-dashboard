import axios from 'axios';

const api = axios.create({ baseURL: 'http://localhost:8000/api' });

export const getOverview = () => api.get('/analytics/overview');
export const getSubjectAnalytics = () => api.get('/analytics/subjects');
export const getScatterData = () => api.get('/analytics/scatter');
export const getHeatmapData = () => api.get('/analytics/heatmap');
export const getClusters = () => api.get('/analytics/clusters');
export const getRiskAnalysis = () => api.get('/analytics/risk');
export const getPerformanceDistribution = () => api.get('/analytics/performance-distribution');
export const getAttendanceImpact = () => api.get('/analytics/attendance-impact');

export const getStudents = (params = {}) => api.get('/students/', { params });
export const getStudent = (id) => api.get(`/students/${id}`);
export const getStudentProfile = (id) => api.get(`/students/${id}/profile`);
export const getStudentRecommendations = (id) => api.get(`/students/${id}/recommendations`);
export const getStudentPredictions = (id) => api.get(`/students/${id}/predictions`);
export const getLeaderboard = () => api.get('/students/leaderboard');

export const getAlerts = () => api.get('/alerts/');
export const getAdminDashboard = () => api.get('/admin/dashboard');
export const getExportSummary = () => api.get('/admin/export/summary');

export const getGradePredictions = () => api.get('/predictions/grades');
export const getDropoutRisk = () => api.get('/predictions/dropout-risk');

export default api;

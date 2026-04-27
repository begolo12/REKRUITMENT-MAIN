import { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ToastContainer from './components/ui/ToastContainer';
import Layout from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';
import { SkeletonDashboard, SkeletonList } from './components/Skeleton';

// Import all pages directly — fix navigation issues
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Candidates from './pages/Candidates';
import CandidateDetail from './pages/CandidateDetail';
import AssessmentFormWizard from './pages/AssessmentFormWizard';
import MyAssessments from './pages/MyAssessments';
import Rekap from './pages/Rekap';
import Users from './pages/Users';
import Questions from './pages/Questions';

function Private({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '100vh', 
      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
    }}>
      <div style={{
        width: '48px',
        height: '48px',
        border: '3px solid #e2e8f0',
        borderTop: '3px solid #4f46e5',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }} />
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      <p style={{ marginTop: '16px', color: '#64748b', fontSize: '0.9rem' }}>Memuat aplikasi...</p>
    </div>
  );
  return user ? children : <Navigate to="/login" />;
}

function AppRoutes() {
  const { user, loading } = useAuth();
  if (loading) return null;
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Private><Layout /></Private>}>
        <Route index element={<Dashboard />} />
        <Route path="candidates" element={<Candidates />} />
        {/* Tambah kandidat sekarang popup di halaman Candidates */}
        <Route path="candidates/:id" element={<CandidateDetail />} />
        <Route path="assessment/:candidateId" element={<AssessmentFormWizard />} />
        <Route path="my-assessments" element={<MyAssessments />} />
        <Route path="rekap" element={<Rekap />} />
        <Route path="users" element={<Users />} />
        <Route path="questions" element={<Questions />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <ToastProvider>
            <ToastContainer />
            <AppRoutes />
          </ToastProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

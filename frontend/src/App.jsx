import { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence, MotionConfig } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { getToken } from './services/auth';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import InterviewPage from './pages/InterviewPage';
import ResultsPage from './pages/ResultsPage';

function PrivateRoute({ children }) {
  return getToken() ? children : <Navigate to="/login" replace />;
}

function GuestRoute({ children }) {
  return getToken() ? <Navigate to="/dashboard" replace /> : children;
}

function AnimatedRoutes() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/interview/:id" element={<PrivateRoute><InterviewPage /></PrivateRoute>} />
        <Route path="/interview/:id/results" element={<PrivateRoute><ResultsPage /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <BrowserRouter>
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1A1714',
              color: '#F5F1EA',
              border: '1px solid rgba(245,241,234,0.08)',
              borderRadius: '14px',
              fontSize: '14px'
            },
            iconTheme: { primary: '#FF6B1A', secondary: '#0B0A09' }
          }}
        />
        <AnimatedRoutes />
      </BrowserRouter>
    </MotionConfig>
  );
}

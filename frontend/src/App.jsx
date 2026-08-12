import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { BrainCircuit } from 'lucide-react';
import { clearLegacyAuth, getToken } from './services/auth';

const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const InterviewPage = lazy(() => import('./pages/InterviewPage'));
const ResumePage = lazy(() => import('./pages/ResumePage'));

clearLegacyAuth();

function PrivateRoute({ children }) {
  const token = getToken();
  return token ? children : <Navigate to="/login" replace />;
}

function AppLoader() {
  return (
    <div className="app-shell flex min-h-screen items-center justify-center px-4 bg-slate-950 text-white font-mono">
      <div className="hud-panel rounded-2xl p-6 text-center border-sky-500/30 bg-slate-900/90 shadow-2xl">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/40">
          <BrainCircuit size={24} className="animate-spin" />
        </div>
        <div className="text-xs font-bold text-sky-300 uppercase tracking-wider">Loading OfferForge AI Matrix...</div>
      </div>
    </div>
  );
}


export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      <Suspense fallback={<AppLoader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/interview/:id" element={<PrivateRoute><InterviewPage /></PrivateRoute>} />
          <Route path="/resume" element={<PrivateRoute><ResumePage /></PrivateRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

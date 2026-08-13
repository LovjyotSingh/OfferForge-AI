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
const SystemDesignPage = lazy(() => import('./pages/SystemDesignPage'));
const VerifyCertificatePage = lazy(() => import('./pages/VerifyCertificatePage'));
const CodeSandboxPage = lazy(() => import('./pages/CodeSandboxPage'));

const savedTheme = localStorage.getItem('offerforge_theme') || 'dark';
document.documentElement.setAttribute('data-theme', savedTheme);

clearLegacyAuth();

function PrivateRoute({ children }) {
  const token = getToken();
  return token ? children : <Navigate to="/login" replace />;
}

function AppLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 bg-black text-white font-mono">
      <div className="w-full max-w-sm rounded-2xl p-8 text-center border border-white/20 bg-black/90 shadow-2xl backdrop-blur-md">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white text-black font-bold shadow-[0_0_20px_rgba(255,255,255,0.4)]">
          <BrainCircuit size={24} className="animate-spin" />
        </div>
        <div className="text-xs font-black uppercase tracking-widest text-white">Loading OfferForge AI...</div>
        <div className="mt-4 flex justify-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-white animate-ping"></div>
          <div className="h-1.5 w-1.5 rounded-full bg-white animate-ping [animation-delay:0.2s]"></div>
          <div className="h-1.5 w-1.5 rounded-full bg-white animate-ping [animation-delay:0.4s]"></div>
        </div>
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
          <Route path="/system-design" element={<PrivateRoute><SystemDesignPage /></PrivateRoute>} />
          <Route path="/code-sandbox" element={<PrivateRoute><CodeSandboxPage /></PrivateRoute>} />
          <Route path="/verify/:id" element={<VerifyCertificatePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

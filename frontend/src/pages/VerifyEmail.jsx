import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import api, { getApiErrorMessage } from '../services/api';
import { isLoggedIn, updateUser } from '../services/auth';

export default function VerifyEmail() {
  const [state, setState] = useState({ status: 'working', message: '' });
  const started = useRef(false);

  useEffect(() => {
    // Effects run twice in development; the token only works once.
    if (started.current) return;
    started.current = true;

    const token = new URLSearchParams(window.location.search).get('token') || '';
    // Remove the token from the address bar and history.
    window.history.replaceState(null, '', '/verify-email');

    api.post('/account/verify-email', { token })
      .then(res => {
        if (isLoggedIn()) updateUser(res.data.data.user);
        setState({ status: 'done', message: "You're all set. Interviews are unlocked." });
      })
      .catch(err => setState({ status: 'error', message: getApiErrorMessage(err, 'This confirmation link is invalid or has expired.') }));
  }, []);

  const next = isLoggedIn() ? { to: '/dashboard', label: 'Go to your dashboard' } : { to: '/login', label: 'Sign in' };

  return (
    <AuthLayout
      title={state.status === 'done' ? 'Email confirmed' : state.status === 'error' ? 'Link not valid' : 'Confirming…'}
      subtitle={state.status === 'working' ? 'One moment while we check your link.' : state.message}
      footer={<Link to="/" className="text-muted hover:text-paper">Back to home</Link>}
    >
      {state.status === 'working' && <Loader2 className="animate-spin text-ember-300" size={28} />}
      {state.status === 'done' && (
        <div className="space-y-6">
          <CheckCircle2 className="text-emerald-400" size={32} />
          <Link to={next.to} className="btn-primary w-full py-3">{next.label} <ArrowRight size={16} /></Link>
        </div>
      )}
      {state.status === 'error' && (
        <div className="space-y-6">
          <AlertCircle className="text-ember-300" size={32} />
          <p className="text-sm text-muted">You can send a fresh link from your dashboard after signing in.</p>
          <Link to={next.to} className="btn-primary w-full py-3">{next.label} <ArrowRight size={16} /></Link>
        </div>
      )}
    </AuthLayout>
  );
}

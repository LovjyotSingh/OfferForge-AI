import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import AuthLayout, { Field, PasswordInput } from '../components/AuthLayout';
import api, { getApiErrorMessage } from '../services/api';
import { setAuth } from '../services/auth';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState(() => localStorage.getItem('remembered_email') || '');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(() => localStorage.getItem('offerforge_remember') !== 'false');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      if (rememberMe) localStorage.setItem('remembered_email', email);
      else localStorage.removeItem('remembered_email');

      setAuth(res.data.data.token, res.data.data.user, rememberMe);
      navigate('/dashboard');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Login failed. Check your email and password.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Pick up where you left off."
      footer={
        <>
          New here?{' '}
          <Link to="/register" className="font-medium text-ember-300 hover:text-ember-200">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <Field label="Email">
          <input type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="input" required />
        </Field>
        <Field label="Password">
          <PasswordInput autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
        </Field>
        <label className="flex cursor-pointer select-none items-center gap-2.5 text-sm text-muted">
          <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} className="h-4 w-4 cursor-pointer accent-ember-500" />
          Keep me signed in on this device
        </label>
        <button type="submit" disabled={loading} className="btn-primary w-full py-3">
          {loading ? 'Signing in…' : 'Sign in'}
          {!loading && <ArrowRight size={16} />}
        </button>
      </form>
    </AuthLayout>
  );
}

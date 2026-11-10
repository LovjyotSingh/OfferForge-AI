import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import AuthLayout, { Field, PasswordInput } from '../components/AuthLayout';
import api, { getApiErrorMessage } from '../services/api';
import { clearAuth } from '../services/auth';
import { passwordHint, weakPasswordMessage } from '../lib/password';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [token] = useState(() => new URLSearchParams(window.location.search).get('token') || '');
  // Drop the token from the address bar and history once it's been read.
  useEffect(() => {
    window.history.replaceState(null, '', '/reset-password');
  }, []);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    const weak = weakPasswordMessage(password);
    if (weak) return toast.error(weak);
    if (password !== confirm) return toast.error("The passwords don't match");
    setLoading(true);
    try {
      const res = await api.post('/account/reset-password', { token, password });
      clearAuth();
      toast.success(res.data.message);
      navigate('/login');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Could not reset your password.'));
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <AuthLayout
        title="Link not valid"
        subtitle="This reset link is missing its code. Request a new one."
        footer={<Link to="/login" className="text-muted hover:text-paper">Back to sign in</Link>}
      >
        <Link to="/forgot-password" className="btn-primary w-full py-3">Request a new link <ArrowRight size={16} /></Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Choose a new password"
      subtitle="You'll be signed out on every device and can sign in with the new password."
      footer={<Link to="/forgot-password" className="text-muted hover:text-paper">Need a new link?</Link>}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <Field label="New password" hint={passwordHint}>
          <PasswordInput autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
        </Field>
        <Field label="Confirm new password">
          <PasswordInput autoComplete="new-password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="••••••••" required />
        </Field>
        <button type="submit" disabled={loading} className="btn-primary w-full py-3">
          {loading ? 'Saving…' : 'Set new password'}
          {!loading && <ArrowRight size={16} />}
        </button>
      </form>
    </AuthLayout>
  );
}

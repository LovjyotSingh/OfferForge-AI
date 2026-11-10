import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MailCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import AuthLayout, { Field } from '../components/AuthLayout';
import api, { getApiErrorMessage } from '../services/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sentMessage, setSentMessage] = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/account/forgot-password', { email });
      setSentMessage(res.data.message);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Could not send the reset email. Try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Forgot your password?"
      subtitle={sentMessage ? 'Check your email.' : "Enter your email and we'll send you a link to choose a new one."}
      footer={<>Remembered it? <Link to="/login" className="font-medium text-ember-300 hover:text-ember-200">Sign in</Link></>}
    >
      {sentMessage ? (
        <div className="space-y-4">
          <MailCheck className="text-ember-300" size={32} />
          <p className="text-sm leading-relaxed text-muted">{sentMessage}</p>
          <p className="text-sm text-faint">The link expires in 30 minutes.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <Field label="Email">
            <input type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="input" required />
          </Field>
          <button type="submit" disabled={loading} className="btn-primary w-full py-3">
            {loading ? 'Sending…' : 'Send reset link'}
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>
      )}
    </AuthLayout>
  );
}

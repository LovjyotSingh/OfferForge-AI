import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import AuthLayout, { Field, PasswordInput } from '../components/AuthLayout';
import { CodeInput, SpamHint } from '../components/EmailCode';
import api, { getApiErrorMessage } from '../services/api';
import { clearAuth } from '../services/auth';
import { passwordHint, weakPasswordMessage } from '../lib/password';

// Step 1: ask for the email. Step 2: enter the 6-digit code from it plus a new password.
export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const sendCode = async e => {
    e?.preventDefault();
    setLoading(true);
    try {
      await api.post('/account/forgot-password', { email });
      setStep('code');
      setCode('');
      if (!e) toast.success('We sent a new code.');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Could not send the code. Try again.'));
    } finally {
      setLoading(false);
    }
  };

  const reset = async e => {
    e.preventDefault();
    if (code.length !== 6) return toast.error('Enter the 6-digit code from the email');
    const weak = weakPasswordMessage(password);
    if (weak) return toast.error(weak);
    setLoading(true);
    try {
      const res = await api.post('/account/reset-password-code', { email, code, password });
      clearAuth();
      toast.success(res.data.message);
      navigate('/login');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Could not reset your password.'));
      setLoading(false);
    }
  };

  if (step === 'code') {
    return (
      <AuthLayout
        title="Enter your code"
        subtitle={`If an account exists for ${email}, we sent it a 6-digit code. It expires in 30 minutes.`}
        footer={
          <>
            Wrong email?{' '}
            <button type="button" onClick={() => setStep('email')} className="font-medium text-ember-300 hover:text-ember-200">
              Change it
            </button>
          </>
        }
      >
        <form onSubmit={reset} className="space-y-5">
          <Field label="6-digit code">
            <CodeInput value={code} onChange={setCode} autoFocus />
          </Field>
          <Field label="New password" hint={passwordHint}>
            <PasswordInput autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
          </Field>
          <button type="submit" disabled={loading} className="btn-primary w-full py-3">
            {loading ? 'Saving…' : 'Reset password'}
            {!loading && <ArrowRight size={16} />}
          </button>
          <SpamHint />
          <button type="button" onClick={() => sendCode()} disabled={loading} className="text-sm text-muted hover:text-paper">
            Didn't get a code? Send a new one
          </button>
        </form>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Forgot your password?"
      subtitle="Enter your email and we'll send you a 6-digit code to choose a new one."
      footer={<>Remembered it? <Link to="/login" className="font-medium text-ember-300 hover:text-ember-200">Sign in</Link></>}
    >
      <form onSubmit={sendCode} className="space-y-5">
        <Field label="Email">
          <input type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="input" required />
        </Field>
        <button type="submit" disabled={loading} className="btn-primary w-full py-3">
          {loading ? 'Sending…' : 'Send code'}
          {!loading && <ArrowRight size={16} />}
        </button>
      </form>
    </AuthLayout>
  );
}

import { useState } from 'react';
import { Inbox } from 'lucide-react';
import toast from 'react-hot-toast';
import api, { getApiErrorMessage } from '../services/api';

// Our emails often land in Spam at first (Gmail doesn't know the sender yet),
// so every "we emailed you" message points there, including in the Gmail app.
export function SpamHint({ className = '' }) {
  return (
    <p className={`flex items-start gap-2 text-xs leading-relaxed text-faint ${className}`}>
      <Inbox size={14} className="mt-0.5 shrink-0 text-ember-300" />
      <span>
        Can't find it? Check your <span className="text-paper">Spam</span> folder. In the Gmail app, tap{' '}
        <span className="text-paper">☰ Menu → Spam</span>. Marking it <span className="text-paper">Not spam</span> makes future
        emails land in your inbox.
      </span>
    </p>
  );
}

// A 6-digit code box that phones can autofill and that accepts "123 456" too.
export function CodeInput({ value, onChange, autoFocus = false }) {
  return (
    <input
      value={value}
      onChange={e => onChange(e.target.value.replace(/[^\d]/g, '').slice(0, 6))}
      inputMode="numeric"
      autoComplete="one-time-code"
      pattern="\d{6}"
      maxLength={7}
      placeholder="123456"
      aria-label="6-digit code"
      autoFocus={autoFocus}
      className="input text-center font-mono text-xl tracking-[0.4em] placeholder:tracking-[0.4em]"
      required
    />
  );
}

// Confirm-your-email form: type the code, or send a new one.
export function VerifyEmailCode({ email, onVerified }) {
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState('');

  const verify = async e => {
    e.preventDefault();
    if (code.length !== 6) return toast.error('Enter the 6-digit code from the email');
    setBusy('verify');
    try {
      const res = await api.post('/account/verify-code', { code });
      toast.success(res.data.message);
      onVerified?.(res.data.data.user);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Could not confirm the code'));
    } finally {
      setBusy('');
    }
  };

  const resend = async () => {
    setBusy('resend');
    try {
      const res = await api.post('/account/resend-verification');
      toast.success(res.data.message);
      setCode('');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Could not send the email'));
    } finally {
      setBusy('');
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted">
        We emailed a 6-digit code to <span className="text-paper">{email}</span>. Enter it here. It works on any device.
      </p>
      <form onSubmit={verify} className="flex flex-col gap-3 sm:flex-row">
        <div className="sm:w-56"><CodeInput value={code} onChange={setCode} /></div>
        <button type="submit" disabled={busy === 'verify'} className="btn-primary py-3">
          {busy === 'verify' ? 'Checking…' : 'Confirm email'}
        </button>
        <button type="button" onClick={resend} disabled={busy === 'resend'} className="btn-ghost py-3">
          {busy === 'resend' ? 'Sending…' : 'Send a new code'}
        </button>
      </form>
      <SpamHint />
    </div>
  );
}

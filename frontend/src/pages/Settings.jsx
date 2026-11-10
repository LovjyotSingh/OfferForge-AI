import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Download, LogOut, MailWarning, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';
import { Field, PasswordInput } from '../components/AuthLayout';
import { Reveal } from '../components/motion';
import { VerifyEmailCode } from '../components/EmailCode';
import api, { getApiErrorMessage } from '../services/api';
import { clearAuth, getUser, updateUser } from '../services/auth';
import { passwordHint, weakPasswordMessage } from '../lib/password';

function Section({ title, description, children, delay = 0, danger = false }) {
  return (
    <Reveal delay={delay} className={`card p-6 sm:p-8 ${danger ? 'border-red-500/20' : ''}`}>
      <h2 className="text-lg font-semibold">{title}</h2>
      {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      <div className="mt-6">{children}</div>
    </Reveal>
  );
}

export default function Settings() {
  const navigate = useNavigate();
  const [user, setUser] = useState(getUser());
  const [busy, setBusy] = useState('');
  const [passwords, setPasswords] = useState({ current: '', next: '' });
  const [deleting, setDeleting] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');

  useEffect(() => {
    api.get('/auth/me').then(res => {
      setUser(res.data.data.user);
      updateUser(res.data.data.user);
    }).catch(() => {});
  }, []);

  const run = async (key, task) => {
    setBusy(key);
    try {
      await task();
    } finally {
      setBusy('');
    }
  };

  const changePassword = e => {
    e.preventDefault();
    const weak = weakPasswordMessage(passwords.next);
    if (weak) return toast.error(weak);
    run('password', async () => {
      try {
        const res = await api.post('/account/change-password', { currentPassword: passwords.current, newPassword: passwords.next });
        toast.success(res.data.message);
        setPasswords({ current: '', next: '' });
      } catch (err) {
        toast.error(getApiErrorMessage(err, 'Could not change your password'));
      }
    });
  };

  const logoutEverywhere = () => run('logout', async () => {
    try {
      await api.post('/auth/logout-all');
    } finally {
      clearAuth();
      toast.success('Signed out on every device');
      navigate('/login');
    }
  });

  const exportData = () => run('export', async () => {
    try {
      const res = await api.get('/account/export', { responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'offerforge-my-data.json';
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Could not download your data'));
    }
  });

  const deleteAccount = e => {
    e.preventDefault();
    run('delete', async () => {
      try {
        const res = await api.post('/account/delete', { password: deletePassword });
        clearAuth();
        toast.success(res.data.message);
        navigate('/');
      } catch (err) {
        toast.error(getApiErrorMessage(err, 'Could not delete your account'));
      }
    });
  };

  return (
    <Layout>
      <div className="mx-auto max-w-2xl px-4 pb-24 pt-32 sm:px-6">
        <h1 className="text-4xl font-semibold tracking-[-0.03em]">Account settings</h1>
        <p className="mt-2 text-muted">{user.email}</p>

        <div className="mt-10 space-y-6">
          <Section title="Email" description="We use your email to sign you in and to send password reset links.">
            {user.emailVerified ? (
              <p className="flex items-center gap-2 text-sm text-emerald-400"><CheckCircle2 size={16} /> Confirmed</p>
            ) : user.needsVerification ? (
              <div className="space-y-4">
                <p className="flex items-center gap-2 text-sm text-ember-300"><MailWarning size={16} /> Not confirmed yet</p>
                <VerifyEmailCode
                  email={user.email}
                  onVerified={verified => {
                    setUser(verified);
                    updateUser(verified);
                  }}
                />
              </div>
            ) : (
              <p className="text-sm text-muted">Email confirmation isn't switched on for this site yet.</p>
            )}
          </Section>

          <Section title="Password" description="Changing your password signs you out on your other devices." delay={0.05}>
            <form onSubmit={changePassword} className="space-y-5">
              <Field label="Current password">
                <PasswordInput autoComplete="current-password" value={passwords.current} onChange={e => setPasswords(p => ({ ...p, current: e.target.value }))} required />
              </Field>
              <Field label="New password" hint={passwordHint}>
                <PasswordInput autoComplete="new-password" value={passwords.next} onChange={e => setPasswords(p => ({ ...p, next: e.target.value }))} required />
              </Field>
              <button type="submit" disabled={busy === 'password'} className="btn-primary">
                {busy === 'password' ? 'Saving…' : 'Change password'}
              </button>
            </form>
          </Section>

          <Section title="Sessions" description="Lost a device, or signed in on a shared computer? Sign out everywhere at once." delay={0.1}>
            <button onClick={logoutEverywhere} disabled={busy === 'logout'} className="btn-ghost">
              <LogOut size={16} /> Sign out on every device
            </button>
          </Section>

          <Section title="Your data" description="Download a copy of your account, interviews and answers as a JSON file." delay={0.15}>
            <button onClick={exportData} disabled={busy === 'export'} className="btn-ghost">
              <Download size={16} /> {busy === 'export' ? 'Preparing…' : 'Download my data'}
            </button>
          </Section>

          <Section
            title="Delete account"
            description="Permanently deletes your account and every interview, answer and score. This can't be undone."
            delay={0.2}
            danger
          >
            {deleting ? (
              <form onSubmit={deleteAccount} className="space-y-5">
                <Field label="Enter your password to confirm">
                  <PasswordInput autoComplete="current-password" value={deletePassword} onChange={e => setDeletePassword(e.target.value)} required />
                </Field>
                <div className="flex flex-wrap gap-3">
                  <button type="submit" disabled={busy === 'delete'} className="btn border border-red-500/40 bg-red-500/15 text-red-300 hover:bg-red-500/25">
                    <Trash2 size={16} /> {busy === 'delete' ? 'Deleting…' : 'Delete my account forever'}
                  </button>
                  <button type="button" onClick={() => { setDeleting(false); setDeletePassword(''); }} className="btn-ghost">Cancel</button>
                </div>
              </form>
            ) : (
              <button onClick={() => setDeleting(true)} className="btn border border-red-500/30 text-red-300 hover:bg-red-500/10">
                <Trash2 size={16} /> Delete account
              </button>
            )}
          </Section>
        </div>
      </div>
    </Layout>
  );
}

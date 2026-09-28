import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import AuthLayout, { Field, PasswordInput } from '../components/AuthLayout';
import api, { getApiErrorMessage } from '../services/api';
import { setAuth } from '../services/auth';
import { getCatalog } from '../services/catalog';

export default function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [targetRole, setTargetRole] = useState('sde');
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getCatalog().then(c => setRoles(c.roles)).catch(() => {});
  }, []);

  const handleSubmit = async e => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/auth/register', { name, email, password, targetRole });
      setAuth(res.data.data.token, res.data.data.user);
      navigate(`/dashboard?role=${targetRole}`);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Registration failed. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Your first structured round is two minutes away."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-ember-300 hover:text-ember-200">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <Field label="Full name">
          <input type="text" autoComplete="name" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" className="input" minLength={2} maxLength={50} required />
        </Field>
        <Field label="Email">
          <input type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="input" required />
        </Field>
        <Field label="Password" hint="At least 6 characters.">
          <PasswordInput autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
        </Field>
        <Field label="Role you're preparing for">
          <select value={targetRole} onChange={e => setTargetRole(e.target.value)} className="input appearance-none">
            {(roles.length ? roles : [{ id: 'sde', title: 'Software Development Engineer' }]).map(r => (
              <option key={r.id} value={r.id} className="bg-ink-900">
                {r.title}
              </option>
            ))}
          </select>
        </Field>
        <button type="submit" disabled={loading} className="btn-primary w-full py-3">
          {loading ? 'Creating account…' : 'Create account'}
          {!loading && <ArrowRight size={16} />}
        </button>
      </form>
    </AuthLayout>
  );
}

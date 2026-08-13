import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Cpu, Lock, Mail, User } from 'lucide-react';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';
import api, { getApiErrorMessage } from '../services/api';
import { setAuth } from '../services/auth';

const ROLES = ['SDE', 'Data Analyst', 'Business Analyst', 'Product Manager'];

export default function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [targetRole, setTargetRole] = useState('SDE');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/register', { name, email, password, targetRole });
      setAuth(res.data.data.token, res.data.data.user);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Registration failed. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="mx-auto flex min-h-[80vh] max-w-md items-center justify-center px-4 py-12 font-mono">
        <div className="reveal-up calm-card w-full rounded-2xl p-6 sm:p-8">
          <div className="text-center mb-6">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl calm-button font-bold">
              <Cpu size={20} />
            </div>
            <h1 className="text-2xl font-black text-glow-white">Create Account</h1>
            <p className="text-xs opacity-70 mt-1">Start placement preparation with OfferForge AI</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase opacity-80 mb-1.5">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Lovjyot Singh"
                  className="calm-input text-xs pl-9"
                  required
                />
                <User size={14} className="absolute left-3 top-3 opacity-60" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase opacity-80 mb-1.5">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="calm-input text-xs pl-9"
                  required
                />
                <Mail size={14} className="absolute left-3 top-3 opacity-60" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase opacity-80 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="calm-input text-xs pl-9"
                  required
                />
                <Lock size={14} className="absolute left-3 top-3 opacity-60" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase opacity-80 mb-1.5">Target Role</label>
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="calm-input text-xs font-bold"
              >
                {ROLES.map((r) => (
                  <option key={r} value={r} className="bg-slate-900 text-white">
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="calm-button w-full py-2.5 text-xs font-extrabold uppercase mt-2 disabled:opacity-60"
            >
              {loading ? 'Creating Account...' : 'Get Started'}
              <ArrowRight size={14} className="ml-2" />
            </button>
          </form>

          <div className="mt-6 text-center text-xs opacity-80">
            Already have an account?{' '}
            <Link to="/login" className="font-bold underline hover:text-glow-white">
              Log In
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}

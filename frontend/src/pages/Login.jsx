import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Cpu, Lock, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';
import api, { getApiErrorMessage } from '../services/api';
import { setAuth } from '../services/auth';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      setAuth(res.data.data.token, res.data.data.user);
      toast.success('Logged in successfully!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Login failed. Please check credentials.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="mx-auto flex min-h-[75vh] max-w-md items-center justify-center px-4 py-12 bg-black text-white">
        <div className="reveal-up calm-card w-full rounded-2xl p-6 sm:p-8 border-white/20 bg-black/90 font-mono">
          <div className="text-center mb-6">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white text-black font-bold">
              <Cpu size={20} />
            </div>
            <h1 className="text-2xl font-black text-glow-white">Welcome Back</h1>
            <p className="text-xs text-white/70 mt-1">Log in to continue your placement preparation</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-white/80 mb-1.5">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="calm-input text-xs pl-9 bg-black text-white border-white/30"
                  required
                />
                <Mail size={14} className="absolute left-3 top-3 text-white/60" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-white/80 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="calm-input text-xs pl-9 bg-black text-white border-white/30"
                  required
                />
                <Lock size={14} className="absolute left-3 top-3 text-white/60" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="calm-button w-full py-2.5 text-xs font-extrabold uppercase mt-2 disabled:opacity-60"
            >
              {loading ? 'Signing in...' : 'Sign In'}
              <ArrowRight size={14} className="ml-2" />
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-white/80">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-bold text-white underline hover:text-glow-white">
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}

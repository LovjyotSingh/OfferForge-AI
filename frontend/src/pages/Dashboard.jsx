import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3,
  BookOpenCheck,
  Cpu,
  FileText,
  Gauge,
  Play,
  TrendingUp,
  Activity,
} from 'lucide-react';
import { Line, LineChart, PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';
import CompanyTargetSelector from '../components/CompanyTargetSelector';
import PracticeHeatmap from '../components/PracticeHeatmap';
import OfferPredictorCard from '../components/OfferPredictorCard';
import api, { getApiErrorMessage } from '../services/api';
import { getUser } from '../services/auth';

const ROLES = ['SDE', 'Data Analyst', 'Business Analyst', 'Product Manager'];

export default function Dashboard() {
  const navigate = useNavigate();
  const user = getUser();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startingInterview, setStartingInterview] = useState(false);
  const [selectedRole, setSelectedRole] = useState(user?.targetRole || 'SDE');
  const [difficulty, setDifficulty] = useState('medium');

  useEffect(() => {
    api
      .get('/analytics/dashboard')
      .then((res) => setStats(res.data.data))
      .catch((err) => toast.error(getApiErrorMessage(err, 'Could not load stats')))
      .finally(() => setLoading(false));
  }, []);

  const startInterview = async () => {
    setStartingInterview(true);
    try {
      const res = await api.post('/interviews/start', {
        targetRole: selectedRole,
        difficulty,
        questionCount: 10,
      });
      navigate(`/interview/${res.data.data.interviewId}`);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Could not start interview'));
      setStartingInterview(false);
    }
  };

  const radarData = stats
    ? [
        { subject: 'Technical', score: stats.scoreBreakdown?.technical || 0 },
        { subject: 'Communication', score: stats.scoreBreakdown?.communication || 0 },
        { subject: 'Confidence', score: stats.scoreBreakdown?.confidence || 0 },
      ]
    : [];

  const statCards = [
    {
      label: 'TOTAL SESSIONS',
      value: stats?.overview?.totalInterviews || 0,
      icon: BookOpenCheck,
    },
    {
      label: 'AVERAGE SCORE',
      value: `${stats?.overview?.averageScore || 0}%`,
      icon: Gauge,
    },
    {
      label: 'HIGHEST SCORE',
      value: `${stats?.overview?.highestScore || 0}%`,
      icon: TrendingUp,
    },
  ];

  return (
    <Layout>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-10 font-sans">
        {/* Main Launcher Card */}
        <section className="reveal-up grid gap-6 lg:grid-cols-[1fr_22rem]">
          <div className="calm-card rounded-2xl p-6 sm:p-8">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div>
                <h1 className="text-2xl font-black sm:text-3xl text-glow-white">
                  Welcome back, <span className="underline">{user?.name || 'Candidate'}</span>
                </h1>
                <p className="mt-1 text-xs opacity-70 font-mono">
                  Select role parameters & launch real-time AI evaluation.
                </p>
              </div>
              <button
                onClick={() => navigate('/resume')}
                className="calm-button-outline px-4 py-2 text-xs font-bold uppercase shrink-0"
              >
                <FileText size={15} className="mr-1.5" />
                ATS Scanner
              </button>
            </div>

            {/* Launch Form Controls */}
            <div className="mt-6 grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end font-mono">
              <label className="block">
                <span className="mb-1.5 block text-xs font-bold uppercase opacity-80">Target Role</span>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="calm-input text-xs font-bold"
                >
                  {ROLES.map((role) => (
                    <option key={role} value={role} className="bg-slate-900 text-white">
                      {role}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs font-bold uppercase opacity-80">Difficulty</span>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="calm-input text-xs font-bold"
                >
                  <option value="easy" className="bg-slate-900 text-white">
                    Easy (Foundational)
                  </option>
                  <option value="medium" className="bg-slate-900 text-white">
                    Medium (Standard)
                  </option>
                  <option value="hard" className="bg-slate-900 text-white">
                    Hard (Advanced Architecture)
                  </option>
                </select>
              </label>

              <button
                onClick={startInterview}
                disabled={startingInterview}
                className="calm-button px-6 py-2.5 text-xs font-extrabold uppercase disabled:opacity-60"
              >
                <span className="flex items-center justify-center gap-2">
                  {startingInterview ? 'Starting...' : 'Start Interview'}
                  <Play size={14} fill="currentColor" />
                </span>
              </button>
            </div>
          </div>

          {/* Response Tips Card */}
          <div className="calm-card rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2.5 border-b border-inherit pb-3 font-mono">
                <Cpu size={18} />
                <div className="text-sm font-bold uppercase tracking-wider">Response Protocol</div>
              </div>
              <div className="mt-4 space-y-2 text-xs opacity-80 font-sans">
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-current"></span>
                  <span>Lead with quantifiable impact</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-current"></span>
                  <span>Explain technical tradeoffs</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-current"></span>
                  <span>Summarize key architecture</span>
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between text-[11px] opacity-80 font-mono">
              <span>STATUS: READY</span>
              <Activity size={14} className="animate-pulse" />
            </div>
          </div>
        </section>

        {/* Daily Practice Heatmap */}
        <section className="mt-6">
          <PracticeHeatmap totalSessions={stats?.overview?.totalInterviews || 0} />
        </section>

        {/* AI Compensation & Offer Package Predictor */}
        <section className="mt-6">
          <OfferPredictorCard
            averageScore={stats?.overview?.averageScore || 80}
            atsScore={stats?.overview?.highestScore || 85}
            targetRole={user?.targetRole || 'SDE'}
          />
        </section>

        {/* Company Target Matrix Selector */}
        <section className="mt-6">
          <CompanyTargetSelector />
        </section>

        {loading ? (
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {[0, 1, 2].map((item) => (
              <div key={item} className="h-28 animate-pulse rounded-2xl calm-card" />
            ))}
          </div>
        ) : (
          <>
            {/* Stat Cards */}
            <section className="mt-8 grid gap-5 sm:grid-cols-3">
              {statCards.map((card) => {
                const IconComponent = card.icon;
                return (
                  <div key={card.label} className="calm-card rounded-2xl p-5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold opacity-80 uppercase tracking-wider font-mono">{card.label}</span>
                      <IconComponent size={18} />
                    </div>
                    <div className="mt-3 text-3xl font-black text-glow-white">{card.value}</div>
                  </div>
                );
              })}
            </section>

            {/* Performance Analytics Charts */}
            <section className="mt-8 grid gap-6 lg:grid-cols-2">
              {/* Score Trend Line Chart */}
              <div className="calm-card rounded-2xl p-6">
                <div className="mb-4 flex items-center justify-between font-mono">
                  <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                    <TrendingUp size={16} />
                    Performance Progress Trend
                  </h3>
                  <span className="text-[10px] opacity-70">LAST 10 SESSIONS</span>
                </div>
                <div className="h-60 w-full">
                  {stats?.trend?.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={stats.trend}>
                        <XAxis dataKey="date" stroke="currentColor" fontSize={11} tickLine={false} />
                        <YAxis domain={[0, 100]} stroke="currentColor" fontSize={11} tickLine={false} />
                        <Tooltip
                          contentStyle={{ background: 'var(--app-card-bg)', borderColor: 'var(--app-card-border)', borderRadius: '0.75rem', color: 'var(--app-text)' }}
                        />
                        <Line type="monotone" dataKey="score" stroke="currentColor" strokeWidth={2.5} dot={{ r: 4, fill: 'currentColor' }} />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs opacity-60 font-mono">
                      Complete your first interview round to render trend data.
                    </div>
                  )}
                </div>
              </div>

              {/* Skill Radar Chart */}
              <div className="calm-card rounded-2xl p-6">
                <div className="mb-4 flex items-center justify-between font-mono">
                  <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                    <BarChart3 size={16} />
                    Skill Breakdown Matrix
                  </h3>
                </div>
                <div className="h-60 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="rgba(150,150,150,0.3)" />
                      <PolarAngleAxis dataKey="subject" stroke="currentColor" fontSize={11} />
                      <Radar name="Score" dataKey="score" stroke="currentColor" fill="currentColor" fillOpacity={0.25} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </Layout>
  );
}

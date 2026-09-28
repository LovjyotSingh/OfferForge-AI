import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, ChevronRight, Clock3, ListChecks, Play, RotateCcw, Target } from 'lucide-react';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';
import { CountUp, EASE, Magnetic, Reveal } from '../components/motion';
import api, { getApiErrorMessage } from '../services/api';
import { getUser } from '../services/auth';
import { getCatalog } from '../services/catalog';
import { LEVEL_LABELS, formatDate, scoreTone } from '../lib/format';

function greeting() {
  const h = new Date().getHours();
  if (h < 5) return 'Up late';
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function resolveRoleId(roles, value) {
  if (!value) return null;
  const v = String(value).toLowerCase();
  return roles.find(r => r.id === v || r.title.toLowerCase() === v)?.id || null;
}

function RolePicker({ roles, value, onChange }) {
  return (
    <div className="-mx-1 flex snap-x gap-2 overflow-x-auto px-1 pb-2 sm:grid sm:grid-cols-2 sm:overflow-visible lg:grid-cols-4" role="radiogroup" aria-label="Role">
      {roles.map(role => {
        const active = role.id === value;
        return (
          <button
            key={role.id}
            role="radio"
            aria-checked={active}
            onClick={() => onChange(role.id)}
            className={`relative min-w-[13rem] snap-start rounded-2xl border p-4 text-left transition sm:min-w-0 ${active ? 'border-transparent' : 'border-line hover:border-white/15 hover:bg-white/[0.02]'}`}
          >
            {active && (
              <motion.span
                layoutId="role-highlight"
                className="absolute inset-0 rounded-2xl border border-ember-500/50 bg-ember-500/[0.07] shadow-[0_0_40px_-12px_rgba(255,107,26,0.6)]"
                transition={{ type: 'spring', stiffness: 380, damping: 32 }}
              />
            )}
            <span className="relative block font-medium leading-snug">{role.title}</span>
            <span className="relative mt-2 flex items-center gap-3 text-xs text-faint">
              <span>{role.totalQuestions} questions</span>
              <span>~{role.estimatedMinutes} min</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

function LevelPicker({ levels, value, onChange }) {
  return (
    <div className="inline-flex rounded-full border border-line bg-ink-900/60 p-1" role="radiogroup" aria-label="Level">
      {levels.map(level => (
        <button
          key={level.id}
          role="radio"
          aria-checked={value === level.id}
          onClick={() => onChange(level.id)}
          className={`relative rounded-full px-4 py-2 text-sm transition ${value === level.id ? 'text-ink-950' : 'text-muted hover:text-paper'}`}
        >
          {value === level.id && (
            <motion.span layoutId="level-pill" className="absolute inset-0 rounded-full bg-paper" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />
          )}
          <span className="relative font-medium">{level.label}</span>
        </button>
      ))}
    </div>
  );
}

function SectionPlan({ role }) {
  return (
    <AnimatePresence mode="wait">
      <motion.ol
        key={role.id}
        initial="hidden"
        animate="show"
        exit="hidden"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
        className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3"
      >
        {role.sections.map((s, i) => (
          <motion.li
            key={s.key}
            variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE } } }}
            className="flex items-center gap-3 rounded-xl border border-line bg-ink-950/40 px-4 py-3"
          >
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ember-500/15 font-mono text-[11px] text-ember-300">{i + 1}</span>
            <span className="flex-1 text-sm">{s.title}</span>
            <span className="font-mono text-xs text-muted">{s.count} Q</span>
          </motion.li>
        ))}
      </motion.ol>
    </AnimatePresence>
  );
}

function Sparkline({ points }) {
  if (points.length < 2) {
    return <div className="flex h-28 items-center text-sm text-faint">Complete two rounds to see your trend.</div>;
  }
  const w = 320;
  const h = 112;
  const pad = 8;
  const xs = points.map((_, i) => pad + (i * (w - pad * 2)) / (points.length - 1));
  const ys = points.map(p => h - pad - (p.score / 100) * (h - pad * 2));
  const d = xs.map((x, i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${ys[i].toFixed(1)}`).join(' ');

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-28 w-full overflow-visible" preserveAspectRatio="none">
      <defs>
        <linearGradient id="spark-fill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#FF6B1A" stopOpacity="0.25" />
          <stop offset="1" stopColor="#FF6B1A" stopOpacity="0" />
        </linearGradient>
      </defs>
      <motion.path
        d={`${d} L${xs[xs.length - 1]},${h} L${xs[0]},${h} Z`}
        fill="url(#spark-fill)"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1, delay: 0.8 }}
      />
      <motion.path
        d={d}
        fill="none"
        stroke="#FF9A3D"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.6, ease: EASE }}
      />
    </svg>
  );
}

function StatCard({ label, value, suffix, delay }) {
  return (
    <Reveal delay={delay} className="card p-5 sm:p-6">
      <span className="label">{label}</span>
      <div className="mt-3 font-display text-5xl leading-none">
        <CountUp value={value} suffix={suffix} />
      </div>
    </Reveal>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const user = getUser();
  const [catalog, setCatalog] = useState(null);
  const [stats, setStats] = useState(null);
  const [roleId, setRoleId] = useState(null);
  const [level, setLevel] = useState('easy');
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    Promise.all([getCatalog(), api.get('/analytics/dashboard').then(r => r.data.data)])
      .then(([cat, dash]) => {
        setCatalog(cat);
        setStats(dash);
        setRoleId(resolveRoleId(cat.roles, params.get('role')) || resolveRoleId(cat.roles, user?.targetRole) || cat.roles[0]?.id);
      })
      .catch(err => toast.error(getApiErrorMessage(err, 'Could not load your dashboard')));
  }, []);

  const role = useMemo(() => catalog?.roles.find(r => r.id === roleId), [catalog, roleId]);
  const firstName = (user?.name || '').split(' ')[0];

  const start = async () => {
    setStarting(true);
    try {
      const res = await api.post('/interviews/start', { roleId, difficulty: level });
      navigate(`/interview/${res.data.data.interviewId}`);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Could not start the interview'));
      setStarting(false);
    }
  };

  const weakest = stats?.sectionStats?.[0];

  return (
    <Layout>
      <div className="mx-auto max-w-6xl px-4 pb-24 pt-32 sm:px-6">
        <Reveal>
          <h1 className="text-4xl font-semibold tracking-[-0.03em] sm:text-5xl">
            {greeting()}
            {firstName && <>, <span className="font-display font-normal italic text-ember">{firstName}</span></>}.
          </h1>
          <p className="mt-3 text-muted">Pick a role, choose your level, and run a full structured round.</p>
        </Reveal>

        <AnimatePresence>
          {stats?.inProgress && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <Link
                to={`/interview/${stats.inProgress._id}`}
                className="group mt-8 flex flex-col gap-3 rounded-2xl border border-ember-500/30 bg-ember-500/[0.06] p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5"
              >
                <span className="flex items-center gap-3 text-sm">
                  <RotateCcw size={16} className="text-ember-400" />
                  <span>
                    Unfinished <strong className="font-semibold">{stats.inProgress.targetRole}</strong> round · {stats.inProgress.answeredQuestions} of {stats.inProgress.totalQuestions} answered
                  </span>
                </span>
                <span className="flex items-center gap-1 text-sm font-medium text-ember-300">
                  Resume <ArrowRight size={15} className="transition group-hover:translate-x-1" />
                </span>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>

        <Reveal delay={0.1} className="card mt-8 p-5 sm:p-8">
          {!catalog || !role ? (
            <div className="space-y-4">
              <div className="h-6 w-40 animate-pulse rounded bg-white/5" />
              <div className="grid gap-2 sm:grid-cols-4">
                {Array.from({ length: 4 }, (_, i) => <div key={i} className="h-20 animate-pulse rounded-2xl bg-white/[0.03]" />)}
              </div>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <span className="label text-ember-400">New round</span>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight">Choose your interview</h2>
                </div>
                <LevelPicker levels={catalog.levels} value={level} onChange={setLevel} />
              </div>

              <div className="mt-6">
                <RolePicker roles={catalog.roles} value={roleId} onChange={setRoleId} />
              </div>

              <div className="mt-8 border-t border-line pt-6">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm text-muted">{role.blurb}</span>
                  <span className="flex items-center gap-4 text-xs text-faint">
                    <span className="flex items-center gap-1.5"><ListChecks size={13} /> {role.totalQuestions} questions</span>
                    <span className="flex items-center gap-1.5"><Clock3 size={13} /> ~{role.estimatedMinutes} min</span>
                  </span>
                </div>
                <SectionPlan role={role} />
              </div>

              <div className="mt-8 flex justify-end">
                <Magnetic strength={0.2}>
                  <button onClick={start} disabled={starting} className="btn-primary px-7 py-3.5 text-[15px]">
                    {starting ? 'Setting up your round…' : 'Start interview'}
                    {!starting && <Play size={15} className="fill-current" />}
                  </button>
                </Magnetic>
              </div>
            </>
          )}
        </Reveal>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <StatCard label="Rounds completed" value={stats ? stats.overview.totalInterviews : null} delay={0.05} />
          <StatCard label="Average score" value={stats?.overview.averageScore ?? null} delay={0.1} />
          <StatCard label="Best score" value={stats?.overview.bestScore ?? null} delay={0.15} />
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_1fr]">
          <Reveal className="card p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <span className="label">Section averages</span>
              {weakest && (
                <span className="flex items-center gap-1.5 text-xs text-ember-300">
                  <Target size={13} /> Focus next: {weakest.title}
                </span>
              )}
            </div>
            {stats?.sectionStats?.length ? (
              <div className="mt-6 space-y-4">
                {stats.sectionStats.map((s, i) => {
                  const tone = scoreTone(s.averageScore);
                  return (
                    <div key={s.key}>
                      <div className="mb-1.5 flex justify-between text-sm">
                        <span>{s.title}</span>
                        <span className={`font-mono text-xs ${tone.text}`}>{s.averageScore}</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ background: tone.color }}
                          initial={{ width: 0 }}
                          whileInView={{ width: `${s.averageScore}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1.1, delay: i * 0.06, ease: EASE }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="mt-6 text-sm text-faint">Finish a round to see how you do in each section.</p>
            )}
          </Reveal>

          <Reveal delay={0.1} className="card p-5 sm:p-6">
            <span className="label">Score trend</span>
            <div className="mt-6">
              <Sparkline points={stats?.trend || []} />
            </div>
          </Reveal>
        </div>

        <Reveal className="card mt-6 p-2 sm:p-3">
          <div className="px-3 pb-2 pt-3 sm:px-4">
            <span className="label">Recent rounds</span>
          </div>
          {stats?.recentInterviews?.length ? (
            <ul>
              {stats.recentInterviews.map(iv => {
                const tone = scoreTone(iv.overallScore);
                return (
                  <li key={iv._id}>
                    <Link to={`/interview/${iv._id}/results`} className="group flex items-center gap-4 rounded-2xl px-3 py-3.5 transition hover:bg-white/[0.03] sm:px-4">
                      <span className={`w-12 font-display text-3xl leading-none ${tone.text}`}>{iv.overallScore ?? '—'}</span>
                      <span className="flex-1">
                        <span className="block font-medium">{iv.targetRole}</span>
                        <span className="text-xs text-faint">
                          {LEVEL_LABELS[iv.difficulty] || ''} · {formatDate(iv.createdAt)}
                        </span>
                      </span>
                      {iv.recommendation && <span className="hidden text-sm text-muted sm:block">{iv.recommendation}</span>}
                      <ChevronRight size={16} className="text-faint transition group-hover:translate-x-1 group-hover:text-paper" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="px-3 pb-4 text-sm text-faint sm:px-4">No completed rounds yet. Your first one takes under an hour.</p>
          )}
        </Reveal>
      </div>
    </Layout>
  );
}

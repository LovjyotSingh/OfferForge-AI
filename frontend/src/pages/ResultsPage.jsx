import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Check, ChevronDown, Compass, RotateCcw, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';
import RichText from '../components/RichText';
import ScoreRing from '../components/ScoreRing';
import { EASE, Reveal, Stagger, staggerItem } from '../components/motion';
import api, { getApiErrorMessage } from '../services/api';
import { LEVEL_LABELS, formatDate, formatDuration, scoreTone } from '../lib/format';

function QuestionRow({ response, number }) {
  const [open, setOpen] = useState(false);
  const ev = response.evaluation || {};
  const tone = scoreTone(ev.score);

  return (
    <li className="border-t border-line first:border-t-0">
      <button onClick={() => setOpen(v => !v)} className="flex w-full items-start gap-4 px-5 py-4 text-left transition hover:bg-white/[0.02] sm:px-6">
        <span className="mt-0.5 font-mono text-xs text-faint">{String(number).padStart(2, '0')}</span>
        <RichText text={response.question} className="flex-1 text-sm leading-relaxed text-paper/90 sm:text-[15px]" />
        <span className={`shrink-0 font-mono text-sm ${response.skipped ? 'text-faint' : tone.text}`}>
          {response.skipped ? 'Skipped' : ev.score ?? '—'}
        </span>
        <ChevronDown size={16} className={`mt-0.5 shrink-0 text-faint transition ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.35, ease: EASE }} className="overflow-hidden">
            <div className="space-y-5 px-5 pb-6 pl-12 sm:px-6 sm:pl-14">
              {ev.feedback && <p className="text-sm leading-relaxed text-muted">{ev.feedback}</p>}
              {ev.rubric?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {ev.rubric.map(r => (
                    <span key={r.criterion} className="chip">
                      {r.criterion} <span className={`font-mono ${scoreTone(r.score * 10).text}`}>{r.score}/10</span>
                    </span>
                  ))}
                </div>
              )}
              {!response.skipped && (
                <div>
                  <span className="label">Your answer</span>
                  <pre className="mt-2 max-h-72 overflow-auto whitespace-pre-wrap rounded-xl border border-line bg-ink-950/60 p-4 font-mono text-xs leading-relaxed text-paper/80">{response.userAnswer}</pre>
                </div>
              )}
              {ev.idealAnswer?.length > 0 && (
                <div>
                  <span className="label text-ember-300">A strong answer covers</span>
                  <ul className="mt-2 space-y-1.5 text-sm text-paper/85">
                    {ev.idealAnswer.map(p => (
                      <li key={p} className="flex gap-2"><span className="text-ember-400">·</span><RichText text={p} /></li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}

function ListCard({ title, items, icon: Icon, iconClass }) {
  if (!items?.length) return null;
  return (
    <motion.div variants={staggerItem} className="card p-6">
      <span className="label">{title}</span>
      <ul className="mt-4 space-y-3 text-sm">
        {items.map(item => (
          <li key={item} className="flex gap-2.5">
            <Icon size={16} className={`mt-0.5 shrink-0 ${iconClass}`} />
            <RichText text={item} className="leading-relaxed text-paper/90" />
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

export default function ResultsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [interview, setInterview] = useState(null);

  useEffect(() => {
    api
      .get(`/interviews/${id}`)
      .then(res => {
        const iv = res.data.data.interview;
        if (iv.status === 'in-progress') navigate(`/interview/${id}`, { replace: true });
        else setInterview(iv);
      })
      .catch(err => {
        toast.error(getApiErrorMessage(err, 'Could not load results'));
        navigate('/dashboard', { replace: true });
      });
  }, [id, navigate]);

  if (!interview) {
    return (
      <Layout>
        <div className="mx-auto max-w-5xl px-4 pt-36 sm:px-6">
          <div className="h-10 w-72 animate-pulse rounded-lg bg-white/5" />
          <div className="card mt-8 h-64 animate-pulse" />
        </div>
      </Layout>
    );
  }

  const tone = scoreTone(interview.overallScore);
  const sections = interview.sections || [];
  const responses = interview.responses || [];

  return (
    <Layout>
      <div className="mx-auto max-w-5xl px-4 pb-24 pt-32 sm:px-6">
        <Reveal>
          <span className="label text-ember-400">Interview debrief</span>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.03em] sm:text-5xl">{interview.targetRole}</h1>
          <p className="mt-3 text-sm text-muted">
            {LEVEL_LABELS[interview.difficulty]} · {formatDate(interview.endTime || interview.createdAt)}
            {interview.duration ? ` · ${formatDuration(interview.duration)}` : ''} · {responses.length} questions
          </p>
        </Reveal>

        <Reveal delay={0.1} className="card relative mt-10 overflow-hidden p-6 sm:p-10">
          <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full blur-[100px]" style={{ background: tone.color, opacity: 0.12 }} />
          <div className="relative flex flex-col items-center gap-8 md:flex-row md:items-center">
            <ScoreRing score={interview.overallScore} size={188} stroke={12} label="Overall" />
            <div className="flex-1 text-center md:text-left">
              <motion.span
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.9, duration: 0.5, ease: EASE }}
                className="inline-flex rounded-full border px-4 py-1.5 text-sm font-semibold"
                style={{ color: tone.color, borderColor: `${tone.color}55`, background: `${tone.color}12` }}
              >
                {interview.recommendation || tone.label}
              </motion.span>
              {interview.overallFeedback && <p className="mt-5 max-w-2xl leading-relaxed text-paper/85">{interview.overallFeedback}</p>}
            </div>
          </div>

          {sections.length > 0 && (
            <div className="relative mt-10 grid gap-5 border-t border-line pt-8 sm:grid-cols-2">
              {sections.map((s, i) => {
                const st = scoreTone(s.score);
                return (
                  <div key={s.key}>
                    <div className="mb-2 flex items-baseline justify-between gap-3">
                      <span className="text-sm">{s.title}</span>
                      <span className={`font-mono text-sm ${st.text}`}>{s.score ?? '—'}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: st.color }}
                        initial={{ width: 0 }}
                        whileInView={{ width: `${s.score ?? 0}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.2, delay: 0.3 + i * 0.1, ease: EASE }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Reveal>

        <Stagger className="mt-6 grid gap-4 md:grid-cols-3">
          <ListCard title="Strengths" items={interview.strengths} icon={Check} iconClass="text-emerald-400" />
          <ListCard title="Biggest gaps" items={interview.improvementAreas} icon={Sparkles} iconClass="text-ember-400" />
          <ListCard title="Practice next" items={interview.recommendations} icon={Compass} iconClass="text-ember-300" />
        </Stagger>

        <div className="mt-14 space-y-6">
          <Reveal>
            <h2 className="text-2xl font-semibold tracking-tight">Question by question</h2>
          </Reveal>
          {sections.map(s => {
            const inSection = responses.filter(r => r.sectionKey === s.key);
            if (!inSection.length) return null;
            return (
              <Reveal key={s.key} className="card overflow-hidden">
                <div className="flex items-center justify-between border-b border-line bg-white/[0.015] px-5 py-3.5 sm:px-6">
                  <span className="font-medium">{s.title}</span>
                  <span className={`font-mono text-xs ${scoreTone(s.score).text}`}>{s.score ?? '—'} avg</span>
                </div>
                <ul>
                  {inSection.map(r => <QuestionRow key={r._id} response={r} number={(r.index ?? 0) + 1} />)}
                </ul>
              </Reveal>
            );
          })}
        </div>

        <Reveal className="mt-14 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link to={`/dashboard?role=${interview.roleId || ''}`} className="btn-primary px-7 py-3.5">
            <RotateCcw size={16} /> Practice this role again
          </Link>
          <Link to="/dashboard" className="btn-ghost px-6 py-3.5">
            Back to dashboard <ArrowRight size={16} />
          </Link>
        </Reveal>
      </div>
    </Layout>
  );
}

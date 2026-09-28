import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Check, ChevronDown, Clock3, Lightbulb, Mic, MicOff, SkipForward, Sparkles, Volume2, VolumeX, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { Backdrop } from '../components/Layout';
import { Spark } from '../components/Logo';
import RichText from '../components/RichText';
import ScoreRing from '../components/ScoreRing';
import { EASE, WordReveal } from '../components/motion';
import api, { getApiErrorMessage } from '../services/api';
import { formatClock, scoreTone } from '../lib/format';

const AI_TIMEOUT = 90000;
const CODE_KINDS = new Set(['coding']);

function sectionForIndex(sections, index) {
  let offset = 0;
  for (const s of sections) {
    if (index < offset + s.count) return s;
    offset += s.count;
  }
  return null;
}

function useSpeechInput(onText) {
  const [listening, setListening] = useState(false);
  const recRef = useRef(null);
  const onTextRef = useRef(onText);
  onTextRef.current = onText;

  const stop = useCallback(() => {
    recRef.current?.stop();
    setListening(false);
  }, []);

  const toggle = () => {
    if (listening) return stop();
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      toast.error('Voice input is not supported in this browser. Try Chrome or Edge.');
      return undefined;
    }
    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = false;
    rec.lang = 'en-US';
    rec.onresult = e => {
      for (let i = e.resultIndex; i < e.results.length; i += 1) {
        if (e.results[i].isFinal) onTextRef.current(e.results[i][0].transcript.trim());
      }
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    rec.start();
    recRef.current = rec;
    setListening(true);
    return undefined;
  };

  useEffect(() => () => recRef.current?.stop(), []);
  return { listening, toggle, stop };
}

function useSpeak() {
  const [speaking, setSpeaking] = useState(false);
  const stop = useCallback(() => {
    window.speechSynthesis?.cancel();
    setSpeaking(false);
  }, []);
  const toggle = text => {
    if (!window.speechSynthesis) return toast.error('Read-aloud is not supported in this browser.');
    if (speaking) return stop();
    const u = new SpeechSynthesisUtterance(text.replace(/`/g, ''));
    const voice = window.speechSynthesis.getVoices().find(v => v.lang.startsWith('en') && /Google|Natural|Samantha/.test(v.name));
    if (voice) u.voice = voice;
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(u);
    return undefined;
  };
  useEffect(() => () => window.speechSynthesis?.cancel(), []);
  return { speaking, toggle, stop };
}

function ProgressRail({ sections, currentIndex, answered }) {
  let n = 0;
  return (
    <div className="flex min-w-0 flex-1 gap-2 sm:gap-3">
      {sections.map(s => {
        const indexes = Array.from({ length: s.count }, () => n++);
        const active = indexes.includes(currentIndex);
        return (
          <div key={s.key} className="flex min-w-0 flex-col gap-1.5" style={{ flex: s.count }}>
            <div className="flex gap-1">
              {indexes.map(idx => (
                <div key={idx} className="h-1 flex-1 overflow-hidden rounded-full bg-white/[0.07]">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-ember-300 to-ember-500"
                    initial={false}
                    animate={{ width: idx < answered ? '100%' : idx === currentIndex ? '35%' : '0%' }}
                    transition={{ duration: 0.8, ease: EASE }}
                  />
                </div>
              ))}
            </div>
            <span className={`hidden truncate text-[11px] transition-colors duration-500 md:block ${active ? 'text-ember-300' : 'text-faint'}`}>{s.short}</span>
          </div>
        );
      })}
    </div>
  );
}

function SectionIntro({ interview, question, onBegin }) {
  const s = question.section;
  const resuming = question.indexInSection > 0;

  useEffect(() => {
    const onKey = e => {
      if (e.key === 'Enter') onBegin();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onBegin]);

  return (
    <motion.div
      key={`intro-${question.sectionIndex}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.97, filter: 'blur(8px)' }}
      transition={{ duration: 0.5, ease: EASE }}
      className="relative flex min-h-[calc(100vh-9rem)] flex-col items-center justify-center py-10 text-center"
    >
      <motion.div
        aria-hidden
        className="absolute left-1/2 top-1/2 -ml-[18rem] -mt-[12rem] h-[24rem] w-[36rem] rounded-full bg-ember-600/20 blur-[110px]"
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.6, ease: EASE }}
      />
      <motion.span
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE }}
        className="label relative text-ember-400"
      >
        {resuming ? 'Resuming · ' : ''}Section {question.sectionIndex + 1} of {interview.sections.length}
      </motion.span>
      <h1 className="relative mt-6 max-w-4xl text-[clamp(2.4rem,7vw,5.2rem)] font-semibold leading-[0.98] tracking-[-0.04em]">
        <WordReveal text={s.title} delay={0.15} gap={0.08} />
      </h1>
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5, ease: EASE }}
        className="relative mt-6 max-w-xl leading-relaxed text-muted"
      >
        {s.brief}
      </motion.p>
      <motion.div
        initial="hidden"
        animate="show"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06, delayChildren: 0.7 } } }}
        className="relative mt-8 flex max-w-2xl flex-wrap justify-center gap-2"
      >
        {[`${s.count} ${s.count === 1 ? 'question' : 'questions'}`, ...question.rubric].map((chip, i) => (
          <motion.span
            key={chip}
            variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}
            className={`chip ${i === 0 ? 'border-ember-500/30 text-ember-300' : ''}`}
          >
            {chip}
          </motion.span>
        ))}
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 1, ease: EASE }} className="relative mt-12 flex flex-col items-center gap-3">
        <button onClick={onBegin} className="btn-primary px-8 py-3.5 text-[15px]">
          {resuming ? 'Continue' : 'Begin section'} <ArrowRight size={16} />
        </button>
        <span className="text-xs text-faint">or press Enter</span>
      </motion.div>
    </motion.div>
  );
}

function Grading({ question }) {
  return (
    <motion.div
      key="grading"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="card mx-auto mt-10 max-w-xl p-8 text-center sm:p-10"
    >
      <motion.div className="mx-auto w-fit" animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}>
        <Spark className="h-10 w-10" />
      </motion.div>
      <h2 className="mt-6 text-xl font-semibold">Grading your answer</h2>
      <p className="mt-2 text-sm text-muted">Scoring it against the {question.section.title} rubric.</p>
      <ul className="mt-8 space-y-3 text-left">
        {question.rubric.map((criterion, i) => (
          <li key={criterion}>
            <div className="mb-1.5 text-sm text-paper/80">{criterion}</div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.05]">
              <motion.div
                className="h-full w-1/3 rounded-full bg-gradient-to-r from-transparent via-ember-400/70 to-transparent"
                animate={{ x: ['-100%', '300%'] }}
                transition={{ duration: 1.6, delay: i * 0.18, repeat: Infinity, ease: 'easeInOut' }}
              />
            </div>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

function Feedback({ question, result, interview, onNext }) {
  const [showAnswer, setShowAnswer] = useState(false);
  const { response, progress } = result;
  const ev = response.evaluation;
  const tone = scoreTone(ev.score);
  const upcoming = progress.finished ? null : sectionForIndex(interview.sections, progress.answered);
  const nextLabel = progress.finished
    ? 'Finish & see results'
    : upcoming && upcoming.key !== question.section.key
      ? `Next section: ${upcoming.title}`
      : 'Next question';

  const item = { hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } } };

  return (
    <motion.div
      key="feedback"
      initial="hidden"
      animate="show"
      exit={{ opacity: 0, y: -12, transition: { duration: 0.3 } }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
      className="space-y-4"
    >
      <motion.div variants={item} className="card flex flex-col items-center gap-6 p-6 sm:flex-row sm:p-8">
        <ScoreRing score={ev.score} size={132} stroke={9} />
        <div className="text-center sm:text-left">
          <span className="label">{question.section.title} · Question {question.indexInSection + 1}</span>
          <div className={`mt-2 text-3xl font-semibold tracking-tight ${response.skipped ? 'text-faint' : tone.text}`}>{ev.verdict}</div>
          <p className="mt-2 max-w-xl leading-relaxed text-muted">{ev.feedback}</p>
        </div>
      </motion.div>

      {ev.rubric?.length > 0 && (
        <motion.div variants={item} className="card p-6 sm:p-8">
          <span className="label">Rubric</span>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            {ev.rubric.map((r, i) => (
              <div key={r.criterion}>
                <div className="mb-1.5 flex justify-between gap-3 text-sm">
                  <span>{r.criterion}</span>
                  <span className={`font-mono text-xs ${scoreTone(r.score * 10).text}`}>{r.score}/10</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: scoreTone(r.score * 10).color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${r.score * 10}%` }}
                    transition={{ duration: 1, delay: 0.4 + i * 0.1, ease: EASE }}
                  />
                </div>
                {r.comment && <p className="mt-2 text-xs leading-relaxed text-faint">{r.comment}</p>}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {(ev.strengths?.length > 0 || ev.improvements?.length > 0) && (
        <motion.div variants={item} className="grid gap-4 sm:grid-cols-2">
          <div className="card p-6">
            <span className="label">What worked</span>
            <ul className="mt-4 space-y-2.5 text-sm">
              {(ev.strengths.length ? ev.strengths : ['Nothing stood out yet.']).map(s => (
                <li key={s} className="flex gap-2.5"><Check size={16} className="mt-0.5 shrink-0 text-emerald-400" /><span className="text-paper/90">{s}</span></li>
              ))}
            </ul>
          </div>
          <div className="card p-6">
            <span className="label">Fix next time</span>
            <ul className="mt-4 space-y-2.5 text-sm">
              {ev.improvements.map(s => (
                <li key={s} className="flex gap-2.5"><Sparkles size={16} className="mt-0.5 shrink-0 text-ember-400" /><span className="text-paper/90">{s}</span></li>
              ))}
            </ul>
          </div>
        </motion.div>
      )}

      {ev.idealAnswer?.length > 0 && (
        <motion.div variants={item} className="card border-ember-500/20 bg-ember-500/[0.04] p-6 sm:p-8">
          <span className="label text-ember-300">A strong answer covers</span>
          <ol className="mt-4 space-y-2.5 text-sm">
            {ev.idealAnswer.map((point, i) => (
              <li key={point} className="flex gap-3">
                <span className="font-mono text-xs text-ember-400">{String(i + 1).padStart(2, '0')}</span>
                <RichText text={point} className="text-paper/90" />
              </li>
            ))}
          </ol>
        </motion.div>
      )}

      {!response.skipped && (
        <motion.div variants={item} className="card overflow-hidden">
          <button onClick={() => setShowAnswer(v => !v)} className="flex w-full items-center justify-between px-6 py-4 text-sm text-muted hover:text-paper">
            Your answer
            <ChevronDown size={16} className={`transition ${showAnswer ? 'rotate-180' : ''}`} />
          </button>
          <AnimatePresence initial={false}>
            {showAnswer && (
              <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                <pre className="whitespace-pre-wrap border-t border-line px-6 py-4 font-mono text-xs leading-relaxed text-paper/80">{response.userAnswer}</pre>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      <motion.div
        variants={item}
        className="pointer-events-none sticky bottom-0 z-10 -mx-2 flex justify-end bg-gradient-to-t from-ink-950 via-ink-950/85 to-transparent px-2 pb-6 pt-12"
      >
        <button onClick={onNext} className="btn-primary pointer-events-auto w-full px-7 py-3.5 text-[15px] sm:w-auto shadow-[0_10px_40px_-10px_rgba(255,107,26,0.6)]">
          {nextLabel} <ArrowRight size={16} />
        </button>
      </motion.div>
    </motion.div>
  );
}

export default function InterviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [phase, setPhase] = useState('loading');
  const [interview, setInterview] = useState(null);
  const [question, setQuestion] = useState(null);
  const [answer, setAnswer] = useState('');
  const [result, setResult] = useState(null);
  const [seconds, setSeconds] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [confirmSkip, setConfirmSkip] = useState(false);
  const [error, setError] = useState(null);
  const lastSection = useRef(-1);
  const inflight = useRef(false);
  const textareaRef = useRef(null);

  const voice = useSpeechInput(text => setAnswer(a => (a.trim() ? `${a.trimEnd()} ${text}` : text)));
  const speech = useSpeak();
  const draftKey = question ? `offerforge_draft_${id}_${question.index}` : null;

  const finish = useCallback(async () => {
    setPhase('finishing');
    try {
      await api.post(`/interviews/${id}/complete`, {}, { timeout: AI_TIMEOUT });
      navigate(`/interview/${id}/results`, { replace: true });
    } catch (err) {
      setError({ message: getApiErrorMessage(err, 'Could not finish the interview.'), retry: 'finish' });
      setPhase('error');
    }
  }, [id, navigate]);

  const loadNext = useCallback(async () => {
    if (inflight.current) return;
    inflight.current = true;
    setPhase('loading');
    try {
      const { data } = await api.get(`/interviews/${id}/next-question`, { timeout: AI_TIMEOUT });
      const { interview: iv, question: q } = data.data;
      setInterview(iv);

      if (!q) {
        if (iv.status === 'completed') navigate(`/interview/${id}/results`, { replace: true });
        else if (iv.status === 'in-progress' && iv.finished) await finish();
        else {
          toast('That round was closed. Start a new one from your dashboard.');
          navigate('/dashboard', { replace: true });
        }
        return;
      }

      setQuestion(q);
      setAnswer(localStorage.getItem(`offerforge_draft_${id}_${q.index}`) || '');
      setResult(null);
      setShowHint(false);
      setSeconds(0);
      if (q.sectionIndex !== lastSection.current) {
        lastSection.current = q.sectionIndex;
        setPhase('intro');
      } else {
        setPhase('question');
      }
    } catch (err) {
      setError({ message: getApiErrorMessage(err, 'Could not load the next question.'), retry: 'load' });
      setPhase('error');
    } finally {
      inflight.current = false;
    }
  }, [id, navigate, finish]);

  useEffect(() => {
    loadNext();
  }, [loadNext]);

  useEffect(() => {
    if (phase !== 'question') return undefined;
    const t = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(t);
  }, [phase]);

  useEffect(() => {
    if (phase === 'question' && draftKey) {
      if (answer) localStorage.setItem(draftKey, answer);
      else localStorage.removeItem(draftKey);
    }
  }, [answer, draftKey, phase]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(Math.max(el.scrollHeight, 220), 640)}px`;
  }, [answer, phase]);

  useEffect(() => {
    if (!confirmSkip) return undefined;
    const t = setTimeout(() => setConfirmSkip(false), 3000);
    return () => clearTimeout(t);
  }, [confirmSkip]);

  const begin = useCallback(() => {
    setPhase('question');
    setTimeout(() => textareaRef.current?.focus(), 450);
  }, []);

  const submit = async () => {
    if (!answer.trim() || phase !== 'question') return;
    voice.stop();
    speech.stop();
    setPhase('grading');
    try {
      const { data } = await api.post(`/interviews/${id}/answer`, { answer, timeSpent: seconds }, { timeout: AI_TIMEOUT });
      localStorage.removeItem(draftKey);
      setResult(data.data);
      setPhase('feedback');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      if (err.response?.status === 409) {
        toast('That question was already answered. Loading the next one.');
        loadNext();
        return;
      }
      toast.error(getApiErrorMessage(err, 'Could not grade your answer. Your draft is saved, so try again.'));
      setPhase('question');
    }
  };

  const skip = async () => {
    if (!confirmSkip) {
      setConfirmSkip(true);
      return;
    }
    setConfirmSkip(false);
    voice.stop();
    speech.stop();
    try {
      const { data } = await api.post(`/interviews/${id}/skip`, { timeSpent: seconds });
      localStorage.removeItem(draftKey);
      if (data.data.progress.finished) finish();
      else loadNext();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Could not skip the question.'));
    }
  };

  const onKeyDown = e => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      submit();
      return;
    }
    if (e.key === 'Tab' && CODE_KINDS.has(question?.section.kind)) {
      e.preventDefault();
      const el = e.currentTarget;
      const { selectionStart: start, selectionEnd: end } = el;
      const next = `${answer.slice(0, start)}  ${answer.slice(end)}`;
      setAnswer(next);
      requestAnimationFrame(() => el.setSelectionRange(start + 2, start + 2));
    }
  };

  const retry = () => (error?.retry === 'finish' ? finish() : loadNext());
  const answered = result?.progress.answered ?? question?.index ?? 0;
  const isCode = CODE_KINDS.has(question?.section.kind);

  return (
    <div className="relative min-h-screen">
      <Backdrop />

      <header className="fixed inset-x-0 top-0 z-40 border-b border-line bg-ink-950/75 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-5xl items-center gap-4 px-4 sm:gap-6 sm:px-6">
          <button onClick={() => navigate('/dashboard')} className="flex shrink-0 items-center gap-1.5 rounded-full py-1.5 pr-2 text-sm text-muted transition hover:text-paper" title="Your progress is saved">
            <X size={16} /> <span className="hidden sm:inline">Exit</span>
          </button>
          {interview ? (
            <ProgressRail sections={interview.sections} currentIndex={question?.index ?? -1} answered={answered} />
          ) : (
            <div className="flex-1" />
          )}
          <span className="flex shrink-0 items-center gap-1.5 font-mono text-xs text-muted">
            <Clock3 size={13} /> {formatClock(seconds)}
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 pb-24 pt-24 sm:px-6 sm:pt-28">
        <AnimatePresence mode="wait">
          {(phase === 'loading' || phase === 'finishing') && (
            <motion.div key={phase} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex min-h-[60vh] flex-col items-center justify-center gap-5 text-center">
              <motion.div animate={{ rotate: 360, scale: [1, 1.15, 1] }} transition={{ rotate: { duration: 3, repeat: Infinity, ease: 'linear' }, scale: { duration: 1.5, repeat: Infinity } }}>
                <Spark className="h-10 w-10" />
              </motion.div>
              <p className="text-muted">{phase === 'finishing' ? 'Writing your debrief…' : 'Your interviewer is preparing the next question…'}</p>
            </motion.div>
          )}

          {phase === 'error' && (
            <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="card mx-auto mt-16 max-w-md p-8 text-center">
              <p className="text-paper">{error?.message}</p>
              <div className="mt-6 flex justify-center gap-3">
                <button onClick={() => navigate('/dashboard')} className="btn-ghost">Dashboard</button>
                <button onClick={retry} className="btn-primary">Try again</button>
              </div>
            </motion.div>
          )}

          {phase === 'intro' && question && interview && <SectionIntro key={`intro-${question.sectionIndex}`} interview={interview} question={question} onBegin={begin} />}

          {phase === 'question' && question && (
            <motion.div
              key={`q-${question.index}`}
              initial={{ opacity: 0, y: 24, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -16, filter: 'blur(6px)' }}
              transition={{ duration: 0.6, ease: EASE }}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="label text-ember-400">
                  {question.section.title} · {question.indexInSection + 1} of {question.section.count}
                </span>
                <span className="font-mono text-xs text-faint">
                  Q{question.index + 1}/{interview.total}
                </span>
              </div>

              <h1 className="mt-5 text-2xl font-medium leading-relaxed tracking-tight text-paper sm:text-[1.7rem] sm:leading-[1.45]">
                <RichText text={question.question} />
              </h1>

              <div className="mt-5 flex flex-wrap items-center gap-2">
                {question.hint && (
                  <button onClick={() => setShowHint(v => !v)} className={`chip transition hover:text-paper ${showHint ? 'border-ember-500/30 text-ember-300' : ''}`}>
                    <Lightbulb size={13} /> {showHint ? 'Hide hint' : 'Hint'}
                  </button>
                )}
                <button onClick={() => speech.toggle(question.question)} className="chip transition hover:text-paper">
                  {speech.speaking ? <VolumeX size={13} /> : <Volume2 size={13} />} {speech.speaking ? 'Stop' : 'Read aloud'}
                </button>
              </div>
              <AnimatePresence>
                {showHint && (
                  <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                    <span className="mt-3 block rounded-xl border border-ember-500/15 bg-ember-500/[0.05] px-4 py-3 text-sm text-paper/85">{question.hint}</span>
                  </motion.p>
                )}
              </AnimatePresence>

              <div className="card mt-8 overflow-hidden focus-within:border-ember-500/40 focus-within:shadow-[0_0_0_4px_rgba(255,107,26,0.06)]">
                <textarea
                  ref={textareaRef}
                  value={answer}
                  onChange={e => setAnswer(e.target.value)}
                  onKeyDown={onKeyDown}
                  data-lenis-prevent
                  spellCheck={!isCode}
                  placeholder={isCode ? 'Explain your approach, then write the code or query, then state the complexity…' : 'Write your answer the way you would say it in the room…'}
                  className={`block w-full resize-none bg-transparent px-5 py-5 text-paper placeholder:text-faint focus:outline-none sm:px-6 ${isCode ? 'font-mono text-[13px] leading-relaxed' : 'text-[15px] leading-relaxed'}`}
                />
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-3 py-3 sm:px-4">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={voice.toggle}
                      className={`flex items-center gap-1.5 rounded-full px-3 py-2 text-xs transition ${voice.listening ? 'bg-rose-500/15 text-rose-300' : 'text-muted hover:bg-white/5 hover:text-paper'}`}
                    >
                      {voice.listening ? <MicOff size={14} /> : <Mic size={14} />}
                      {voice.listening ? (
                        <span className="flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 animate-ping rounded-full bg-rose-400" /> Listening
                        </span>
                      ) : (
                        'Speak'
                      )}
                    </button>
                    <button
                      onClick={skip}
                      className={`flex items-center gap-1.5 rounded-full px-3 py-2 text-xs transition ${confirmSkip ? 'bg-white/10 text-paper' : 'text-muted hover:bg-white/5 hover:text-paper'}`}
                    >
                      <SkipForward size={14} /> {confirmSkip ? 'Click again to skip' : 'Skip'}
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="hidden font-mono text-[11px] text-faint sm:inline">Ctrl + Enter</span>
                    <button onClick={submit} disabled={!answer.trim()} className="btn-primary">
                      Submit answer <ArrowRight size={15} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {phase === 'grading' && question && <Grading key="grading" question={question} />}

          {phase === 'feedback' && result && question && interview && (
            <Feedback key={`fb-${question.index}`} question={question} result={result} interview={interview} onNext={() => (result.progress.finished ? finish() : loadNext())} />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

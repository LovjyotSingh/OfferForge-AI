import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useScroll, useSpring, useTransform } from 'framer-motion';
import { ArrowRight, ArrowDown, Check, Clock3, ListChecks } from 'lucide-react';
import Layout from '../components/Layout';
import { Spark } from '../components/Logo';
import ScoreRing from '../components/ScoreRing';
import { EASE, Magnetic, Reveal, Spotlight, Stagger, WordReveal, staggerItem } from '../components/motion';
import useSmoothScroll from '../hooks/useSmoothScroll';
import { getCatalog } from '../services/catalog';
import { getToken } from '../services/auth';

const DEMO_QUESTIONS = [
  { section: 'Data Structures & Algorithms', text: 'Given a string s, find the length of the longest substring without repeating characters.' },
  { section: 'System Design', text: 'Design a rate limiter for a public API that allows each user 100 requests per minute.' },
  { section: 'Object-Oriented Programming', text: 'Design the classes for a parking lot with multiple floors and spot sizes.' }
];

const DEMO_PLAN = [
  { short: 'DSA', count: 2 },
  { short: 'System Design', count: 2 },
  { short: 'OOP', count: 2 },
  { short: 'CS Core', count: 2 },
  { short: 'Behavioral', count: 1 }
];

const TOPICS = [
  'Data Structures & Algorithms', 'System Design', 'Object-Oriented Programming', 'Operating Systems', 'DBMS',
  'Computer Networks', 'JavaScript', 'React', 'SQL', 'Statistics', 'Machine Learning', 'Product Sense',
  'Metrics', 'Requirements', 'Behavioral'
];

const STEPS = [
  {
    title: 'Pick your role and level',
    body: 'SDE, frontend, backend, data, or product, from entry level to senior. Each role has its own fixed set of sections, just like a real interview loop.'
  },
  {
    title: 'Answer section by section',
    body: 'An SDE round opens with two DSA problems, moves to system design, then OOP, CS fundamentals, and a behavioral question. You always know where you are.'
  },
  {
    title: 'Graded on a rubric',
    body: 'Every section has its own criteria. DSA is judged on approach, complexity, and edge cases. Behavioral is judged on ownership and impact. Length earns nothing.'
  },
  {
    title: 'Get a real debrief',
    body: 'A score per section, a hire / no-hire call, and what a strong answer would have covered, so you know exactly what to practice next.'
  }
];

const DEMO_RUBRIC = [
  { criterion: 'Approach & correctness', score: 8 },
  { criterion: 'Complexity analysis', score: 7 },
  { criterion: 'Edge cases', score: 5 },
  { criterion: 'Clarity of explanation', score: 9 }
];

function useTypewriter(items, { typeMs = 28, holdMs = 2600 } = {}) {
  const [index, setIndex] = useState(0);
  const [length, setLength] = useState(0);
  const full = items[index].text;

  useEffect(() => {
    if (length < full.length) {
      const t = setTimeout(() => setLength(l => l + 1), typeMs);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => {
      setIndex(i => (i + 1) % items.length);
      setLength(0);
    }, holdMs);
    return () => clearTimeout(t);
  }, [length, full, items.length, typeMs, holdMs]);

  return { item: items[index], index, typed: full.slice(0, length), done: length >= full.length };
}

function InterviewPreview() {
  const { item, index, typed, done } = useTypewriter(DEMO_QUESTIONS);
  const activeQuestion = index * 2;

  return (
    <div className="card overflow-hidden bg-ink-900/80 shadow-[0_40px_120px_-30px_rgba(255,107,26,0.35)] backdrop-blur-xl">
      <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-3.5">
        <div className="flex shrink-0 items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-400/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-ember-300/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
        </div>
        <span className="min-w-0 truncate font-mono text-[11px] text-faint">
          <span className="sm:hidden">SDE</span>
          <span className="hidden sm:inline">Software Development Engineer</span> · Entry level
        </span>
        <span className="flex shrink-0 items-center gap-1.5 font-mono text-[11px] text-muted">
          <Clock3 size={12} /> 04:12
        </span>
      </div>

      <div className="flex gap-1.5 px-5 pt-5">
        {DEMO_PLAN.flatMap((s, si) =>
          Array.from({ length: s.count }, (_, qi) => {
            const n = DEMO_PLAN.slice(0, si).reduce((a, x) => a + x.count, 0) + qi;
            return (
              <div key={`${si}-${qi}`} className="h-1 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-ember-300 to-ember-500"
                  animate={{ width: n < activeQuestion ? '100%' : n === activeQuestion ? '50%' : '0%' }}
                  transition={{ duration: 0.8, ease: EASE }}
                />
              </div>
            );
          })
        )}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 px-5 pt-2.5">
        {DEMO_PLAN.map((s, i) => (
          <span key={s.short} className={`text-[11px] transition-colors duration-500 ${i === index ? 'text-ember-300' : 'text-faint'}`}>
            {s.short} ×{s.count}
          </span>
        ))}
      </div>

      <div className="px-5 pb-6 pt-6 sm:px-7">
        <motion.span key={item.section} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="label text-ember-400">
          {item.section}
        </motion.span>
        <p className="mt-3 min-h-[5.5rem] text-lg font-medium leading-relaxed text-paper sm:min-h-[4.5rem] sm:text-xl">
          {typed}
          <span className="ml-0.5 inline-block h-[1.1em] w-[2px] translate-y-[3px] animate-caret bg-ember-400" />
        </p>
        <div className="mt-5 flex items-center justify-between gap-3 rounded-2xl border border-line bg-ink-950/60 px-4 py-3">
          <span className="font-mono text-xs text-faint">Your answer…</span>
          <motion.span
            animate={{ opacity: done ? 1 : 0.35 }}
            className="rounded-full bg-ember-500/15 px-3 py-1 text-xs font-medium text-ember-300"
          >
            Submit
          </motion.span>
        </div>
      </div>
    </div>
  );
}

function Hero() {
  const token = getToken();
  const heroRef = useRef(null);
  const cardRef = useRef(null);

  const glowX = useSpring(useMotionValue(-600), { stiffness: 60, damping: 20 });
  const glowY = useSpring(useMotionValue(-600), { stiffness: 60, damping: 20 });
  const onMove = e => {
    const rect = heroRef.current.getBoundingClientRect();
    glowX.set(e.clientX - rect.left);
    glowY.set(e.clientY - rect.top);
  };

  const { scrollYProgress: heroProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const textY = useTransform(heroProgress, [0, 1], [0, -120]);
  const textOpacity = useTransform(heroProgress, [0, 0.45], [1, 0]);

  const { scrollYProgress: cardProgress } = useScroll({ target: cardRef, offset: ['start end', 'center center'] });
  const rotateX = useTransform(cardProgress, [0, 1], [32, 0]);
  const scale = useTransform(cardProgress, [0, 1], [0.86, 1]);
  const cardY = useTransform(cardProgress, [0, 1], [60, 0]);

  const scrollToHow = () => document.getElementById('how')?.scrollIntoView({ behavior: 'smooth' });

  return (
    <section ref={heroRef} onMouseMove={onMove} className="relative overflow-hidden px-4 pb-24 pt-36 sm:px-6 sm:pt-44">
      <motion.div
        aria-hidden
        style={{ x: glowX, y: glowY }}
        className="pointer-events-none absolute left-0 top-0 -ml-[300px] -mt-[300px] h-[600px] w-[600px] rounded-full bg-ember-500/[0.09] blur-[100px]"
      />

      <motion.div style={{ y: textY, opacity: textOpacity }} className="relative mx-auto max-w-5xl text-center">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: EASE }} className="chip mx-auto">
          <Spark className="h-3.5 w-3.5" />
          Structured mock interviews for 7 roles
        </motion.div>

        <h1 className="mt-8 text-[clamp(2.9rem,9vw,7rem)] font-semibold leading-[0.95] tracking-[-0.045em]">
          <WordReveal text="Interviews that" delay={0.15} />
          <br />
          <WordReveal text="feel" delay={0.35} />{' '}
          <WordReveal text="real." delay={0.45} wordClassName="font-display font-normal italic tracking-[-0.02em] text-ember pr-2" />
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.75, ease: EASE }}
          className="mx-auto mt-7 max-w-2xl text-base leading-relaxed text-muted sm:text-lg"
        >
          No random trivia. Pick your role and face the same sections a real panel runs, from DSA and system design to OOP and more. Every answer is graded against that section's own rubric.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.9, ease: EASE }}
          className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <Magnetic>
            <Link to={token ? '/dashboard' : '/register'} className="btn-primary px-7 py-3.5 text-[15px]">
              {token ? 'Go to your dashboard' : 'Start your first round'}
              <ArrowRight size={17} />
            </Link>
          </Magnetic>
          <button onClick={scrollToHow} className="btn-ghost px-6 py-3.5 text-[15px]">
            See how it works
            <ArrowDown size={16} />
          </button>
        </motion.div>
      </motion.div>

      <div ref={cardRef} className="relative mx-auto mt-20 max-w-3xl" style={{ perspective: 1400 }}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 1 }}
          style={{ rotateX, scale, y: cardY, transformOrigin: 'center top' }}
        >
          <InterviewPreview />
        </motion.div>
      </div>
    </section>
  );
}

function TopicMarquee() {
  const row = [...TOPICS, ...TOPICS];
  return (
    <section aria-label="Topics covered" className="mask-fade-x overflow-hidden border-y border-line py-6">
      <div className="flex w-max animate-marquee items-center gap-8 hover:[animation-play-state:paused]">
        {row.map((topic, i) => (
          <span key={i} className="flex items-center gap-8 whitespace-nowrap text-lg text-muted sm:text-2xl">
            <span className={i % 3 === 1 ? 'font-display italic text-paper' : ''}>{topic}</span>
            <Spark className="h-3.5 w-3.5 opacity-60" />
          </span>
        ))}
      </div>
    </section>
  );
}

function HowItWorks() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 65%', 'end 55%'] });
  const fill = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });

  return (
    <section id="how" ref={ref} className="relative mx-auto grid max-w-6xl gap-14 px-4 py-28 sm:px-6 md:grid-cols-[1fr_1.1fr] md:py-40">
      <div className="md:sticky md:top-36 md:self-start">
        <Reveal>
          <span className="label text-ember-400">How a round works</span>
          <h2 className="mt-4 text-4xl font-semibold leading-[1.05] tracking-[-0.03em] sm:text-5xl">
            One round.
            <br />
            <span className="font-display font-normal italic text-muted">Every section</span> a real panel covers.
          </h2>
          <p className="mt-6 max-w-md leading-relaxed text-muted">
            Real interview loops are structured, so this is too. You know which section you're in, how many questions are left, and exactly what you're being judged on.
          </p>
        </Reveal>
      </div>

      <div className="relative pl-10 sm:pl-14">
        <div className="absolute bottom-2 left-[11px] top-2 w-px bg-line sm:left-[15px]" />
        <motion.div style={{ scaleY: fill }} className="absolute bottom-2 left-[11px] top-2 w-px origin-top bg-gradient-to-b from-ember-300 via-ember-500 to-ember-600 sm:left-[15px]" />

        <div className="space-y-16 sm:space-y-24">
          {STEPS.map((step, i) => (
            <Step key={step.title} step={step} index={i} progress={scrollYProgress} total={STEPS.length} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Step({ step, index, progress, total }) {
  const at = index / (total - 1 || 1);
  const lit = useTransform(progress, [Math.max(0, at - 0.12), at], [0, 1]);
  const dotScale = useTransform(lit, [0, 1], [0.6, 1]);

  return (
    <div className="relative">
      <div className="absolute -left-10 top-1 flex h-6 w-6 items-center justify-center sm:-left-14 sm:h-8 sm:w-8">
        <div className="absolute inset-0 rounded-full border border-line bg-ink-950" />
        <motion.div style={{ opacity: lit, scale: dotScale }} className="absolute inset-0 rounded-full bg-ember-500 shadow-[0_0_24px_rgba(255,107,26,0.8)]" />
        <span className="relative font-mono text-[11px] font-semibold text-paper">{index + 1}</span>
      </div>
      <Reveal amount={0.6}>
        <h3 className="text-2xl font-semibold tracking-tight sm:text-3xl">{step.title}</h3>
        <p className="mt-3 max-w-lg leading-relaxed text-muted">{step.body}</p>
      </Reveal>
    </div>
  );
}

function RoleCard({ role }) {
  const token = getToken();
  return (
    <motion.div variants={staggerItem} className="h-full">
      <Spotlight as={Link} to={token ? `/dashboard?role=${role.id}` : '/register'} className="card group flex h-full flex-col p-6 transition duration-500 hover:-translate-y-1 hover:border-ember-500/30">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-xl font-semibold tracking-tight">{role.title}</h3>
          <ArrowRight size={18} className="mt-1 shrink-0 -translate-x-2 text-ember-400 opacity-0 transition duration-500 group-hover:translate-x-0 group-hover:opacity-100" />
        </div>
        <p className="mt-2 text-sm leading-relaxed text-muted">{role.blurb}</p>
        <div className="mt-6 space-y-2">
          {role.sections.map((s, i) => (
            <div key={s.key} className="flex items-center gap-3 text-sm">
              <span className="w-4 font-mono text-[11px] text-faint">{i + 1}</span>
              <span className="flex-1 text-paper/90">{s.title}</span>
              <span className="font-mono text-xs text-ember-300">×{s.count}</span>
            </div>
          ))}
        </div>
        <div className="min-h-6 flex-1" />
        <div className="flex items-center gap-4 border-t border-line pt-4 text-xs text-faint">
          <span className="flex items-center gap-1.5"><ListChecks size={13} /> {role.totalQuestions} questions</span>
          <span className="flex items-center gap-1.5"><Clock3 size={13} /> ~{role.estimatedMinutes} min</span>
        </div>
      </Spotlight>
    </motion.div>
  );
}

function Roles() {
  const [catalog, setCatalog] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    getCatalog().then(setCatalog).catch(() => setFailed(true));
  }, []);

  return (
    <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
      <Reveal className="max-w-2xl">
        <span className="label text-ember-400">Roles</span>
        <h2 className="mt-4 text-4xl font-semibold leading-[1.05] tracking-[-0.03em] sm:text-5xl">
          Pick your role.{' '}
          <span className="font-display font-normal italic text-muted">See exactly what you'll face.</span>
        </h2>
      </Reveal>

      {failed ? (
        <p className="mt-12 text-sm text-faint">Roles will appear here once the API is reachable.</p>
      ) : catalog ? (
        <Stagger className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {catalog.roles.map(role => <RoleCard key={role.id} role={role} />)}
        </Stagger>
      ) : (
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="card h-72 animate-pulse bg-white/[0.02]" />
          ))}
        </div>
      )}
    </section>
  );
}

function FeedbackPreview() {
  return (
    <section className="mx-auto grid max-w-6xl items-center gap-14 px-4 py-24 sm:px-6 md:grid-cols-2 md:py-32">
      <Reveal>
        <span className="label text-ember-400">Feedback</span>
        <h2 className="mt-4 text-4xl font-semibold leading-[1.05] tracking-[-0.03em] sm:text-5xl">
          Feedback that tells you <span className="font-display font-normal italic text-ember">what to fix.</span>
        </h2>
        <ul className="mt-8 space-y-4 text-muted">
          {[
            'A score for each rubric criterion, with a one-line reason',
            'What a strong answer would have covered',
            'Section-by-section breakdown and a hire / no-hire call at the end',
            'An honest "not graded" when the AI grader is unavailable, never a made-up number'
          ].map(line => (
            <li key={line} className="flex gap-3">
              <Check size={18} className="mt-0.5 shrink-0 text-ember-400" />
              <span>{line}</span>
            </li>
          ))}
        </ul>
      </Reveal>

      <Reveal delay={0.15}>
        <div className="card bg-ink-900/70 p-6 sm:p-8">
          <div className="flex items-center gap-6">
            <ScoreRing score={73} size={120} stroke={8} />
            <div>
              <span className="label">Data Structures & Algorithms · Q1</span>
              <div className="mt-2 text-2xl font-semibold text-ember-300">Solid</div>
              <p className="mt-1 text-sm text-muted">Right idea and clean explanation. Missed the empty-string case.</p>
            </div>
          </div>
          <div className="mt-8 space-y-4">
            {DEMO_RUBRIC.map((r, i) => (
              <div key={r.criterion}>
                <div className="mb-1.5 flex justify-between text-sm">
                  <span className="text-paper/90">{r.criterion}</span>
                  <span className="font-mono text-xs text-muted">{r.score}/10</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-ember-300 to-ember-500"
                    initial={{ width: 0 }}
                    whileInView={{ width: `${r.score * 10}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.2, delay: 0.3 + i * 0.12, ease: EASE }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  );
}

function FinalCta() {
  const token = getToken();
  return (
    <section className="relative overflow-hidden px-4 py-32 text-center sm:px-6 sm:py-44">
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 h-[28rem] w-[48rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-ember-600/20 blur-[120px]" />
      <Reveal className="relative mx-auto max-w-4xl">
        <h2 className="text-[clamp(2.5rem,7vw,5.5rem)] font-semibold leading-[0.98] tracking-[-0.04em]">
          Make your next interview
          <br />
          <span className="font-display font-normal italic text-ember">a rehearsal.</span>
        </h2>
        <div className="mt-12">
          <Magnetic>
            <Link to={token ? '/dashboard' : '/register'} className="btn-primary px-8 py-4 text-base">
              {token ? 'Start a round' : 'Create a free account'}
              <ArrowRight size={18} />
            </Link>
          </Magnetic>
        </div>
      </Reveal>
    </section>
  );
}

export default function Home() {
  useSmoothScroll();

  return (
    <Layout>
      <Hero />
      <TopicMarquee />
      <HowItWorks />
      <Roles />
      <FeedbackPreview />
      <FinalCta />
    </Layout>
  );
}

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  Clock3,
  FileCheck2,
  Send,
  SkipForward,
  Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api, { getApiErrorMessage } from '../services/api';
import Layout from '../components/Layout';
import AIWaveform from '../components/AIWaveform';

export default function InterviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(10);
  const [answer, setAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [timer, setTimer] = useState(0);
  const [phase, setPhase] = useState('question');

  useEffect(() => {
    fetchNextQuestion();
  }, [id]);

  useEffect(() => {
    if (phase !== 'question') return;
    const interval = setInterval(() => {
      setTimer((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [phase]);

  const fetchNextQuestion = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/interviews/${id}/next-question`);
      const data = res.data.data;

      if (data.isCompleted) {
        setPhase('complete');
        return;
      }

      setCurrentQuestion(data.question);
      setCurrentIndex(data.questionIndex || 0);
      setTotalQuestions(data.totalQuestions || 10);
      setPhase('question');
      setAnswer('');
      setFeedback(null);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Could not fetch next question'));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!answer.trim()) {
      toast.error('Please type your response before submitting');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post(`/interviews/${id}/submit-response`, {
        questionId: currentQuestion?.id || currentQuestion?._id || currentIndex,
        response: answer,
        timeTakenSeconds: timer,
      });

      setFeedback(res.data.data.feedback);
      setPhase('feedback');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Could not evaluate response'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleSkipQuestion = async () => {
    try {
      await api.post(`/interviews/${id}/skip-question`, {
        questionId: currentQuestion?.id || currentQuestion?._id || currentIndex,
      });
      fetchNextQuestion();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Could not skip question'));
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex + 1 >= totalQuestions) {
      setPhase('complete');
    } else {
      fetchNextQuestion();
    }
  };

  const fmt = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (loading && !currentQuestion) {
    return (
      <Layout>
        <div className="flex min-h-[70vh] items-center justify-center p-4 font-mono">
          <div className="calm-card w-full max-w-sm p-8 text-center rounded-2xl">
            <BrainCircuit size={32} className="animate-spin mx-auto mb-3" />
            <div className="text-xs font-bold uppercase">Preparing AI Question...</div>
          </div>
        </div>
      </Layout>
    );
  }

  const completion = Math.round(((currentIndex + (phase === 'feedback' ? 1 : 0)) / totalQuestions) * 100);
  const qText = typeof currentQuestion === 'string' ? currentQuestion : (currentQuestion?.question || 'Technical Question');
  const qCategory = typeof currentQuestion === 'object' ? (currentQuestion?.category || 'Technical') : 'Technical';
  const qContext = typeof currentQuestion === 'object' ? currentQuestion?.context : null;

  return (
    <Layout>
      <div className="min-h-screen font-sans">
        {/* Top Control Bar */}
        <header className="border-b border-inherit px-4 py-3 font-mono">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 text-xs font-bold opacity-80 hover:opacity-100 transition"
            >
              <ArrowLeft size={16} />
              Exit Session
            </button>

            {/* Session Progress */}
            <div className="flex items-center gap-3 text-xs font-bold">
              <span>Question {currentIndex + 1} of {totalQuestions}</span>
              <div className="h-2 w-28 overflow-hidden rounded-full bg-current/20">
                <div className="h-full bg-current transition-all duration-300" style={{ width: `${completion}%` }} />
              </div>
            </div>

            {/* Timer Badge */}
            <div className="flex items-center gap-1.5 rounded-lg border border-inherit px-3 py-1 text-xs font-bold font-mono">
              <Clock3 size={14} />
              {fmt(timer)}
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
          {phase === 'question' && (
            <div className="space-y-6 reveal-up">
              <AIWaveform active={submitting} label="AI INTERVIEWER ACTIVE" />

              {/* Question Card */}
              <div className="calm-card rounded-2xl p-6 sm:p-8 font-sans">
                <div className="mb-3 flex items-center justify-between font-mono">
                  <span className="rounded-md border border-inherit bg-current/10 px-2.5 py-0.5 text-[11px] font-bold uppercase">
                    {qCategory}
                  </span>
                  <span className="text-[11px] opacity-60 font-bold">
                    Question #{currentIndex + 1}
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-bold leading-snug text-glow-white">
                  {qText}
                </h1>
                {qContext && (
                  <p className="mt-3 text-xs opacity-70 font-sans leading-relaxed">
                    {qContext}
                  </p>
                )}
              </div>

              {/* Answer Box */}
              <div className="calm-card rounded-2xl p-6">
                <label className="block mb-2 text-xs font-bold uppercase font-mono">
                  Your Response
                </label>
                <textarea
                  rows={6}
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Type your response here... (Structure your answer clearly with key technical details)"
                  className="calm-input text-sm leading-relaxed"
                />
                <div className="mt-4 flex items-center justify-between text-xs font-mono opacity-80">
                  <div className="flex items-center gap-3">
                    <span>{answer.length} characters</span>
                    <button
                      onClick={handleSkipQuestion}
                      disabled={submitting}
                      className="opacity-60 hover:opacity-100 flex items-center gap-1 text-[11px] transition"
                    >
                      <SkipForward size={13} />
                      Skip Question
                    </button>
                  </div>
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={submitting || !answer.trim()}
                    className="calm-button px-6 py-2 text-xs font-extrabold uppercase disabled:opacity-50"
                  >
                    {submitting ? 'Evaluating...' : 'Submit Response'}
                    <Send size={14} className="ml-2" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {phase === 'feedback' && (
            <div className="space-y-6 reveal-up">
              {/* Feedback Summary Card */}
              <div className="calm-card rounded-2xl p-6 sm:p-8 font-sans">
                <div className="flex items-center justify-between border-b border-inherit pb-4 mb-6 font-mono">
                  <div>
                    <span className="text-xs opacity-80 font-bold uppercase">AI EVALUATION SCORE</span>
                    <div className="text-4xl font-black text-glow-white mt-1">
                      {feedback?.score || feedback?.technicalScore || 80}%
                    </div>
                  </div>
                  <div className="flex gap-4 text-xs font-bold">
                    <div className="text-center">
                      <div className="opacity-80">Technical</div>
                      <div className="font-bold">{feedback?.technicalScore || 80}%</div>
                    </div>
                    <div className="text-center">
                      <div className="opacity-80">Clarity</div>
                      <div className="font-bold">{feedback?.clarityScore || 80}%</div>
                    </div>
                  </div>
                </div>

                {/* Feedback Content */}
                <div className="space-y-4 text-sm">
                  <div>
                    <h4 className="font-bold text-xs uppercase mb-1.5 font-mono">Key Strengths</h4>
                    <ul className="space-y-1 text-xs">
                      {(feedback?.strengths || ['Good structured explanation']).map((s, idx) => (
                        <li key={idx} className="flex items-center gap-2 opacity-90">
                          <CheckCircle2 size={13} className="shrink-0" />
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-bold text-xs uppercase mb-1.5 font-mono font-bold">Key Improvements</h4>
                    <ul className="space-y-1 text-xs">
                      {(feedback?.improvements || ['Add specific performance metrics']).map((imp, idx) => (
                        <li key={idx} className="flex items-center gap-2 opacity-90">
                          <Sparkles size={13} className="shrink-0" />
                          <span>{imp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {feedback?.feedback && (
                    <div className="mt-4 rounded-xl border border-inherit bg-current/5 p-4 text-xs leading-relaxed font-sans">
                      {feedback.feedback}
                    </div>
                  )}
                </div>

                <div className="mt-6 flex justify-end font-mono">
                  <button onClick={handleNextQuestion} className="calm-button px-6 py-2.5 text-xs font-extrabold uppercase">
                    Next Question
                    <ArrowRight size={14} className="ml-2" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {phase === 'complete' && (
            <div className="text-center py-12 calm-card rounded-2xl p-8 reveal-up font-sans">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl calm-button font-bold">
                <FileCheck2 size={28} />
              </div>
              <h2 className="text-2xl font-black mb-2 text-glow-white">Interview Round Completed!</h2>
              <p className="text-sm opacity-80 max-w-md mx-auto mb-6 font-sans">
                Your performance analytics have been saved to your dashboard.
              </p>
              <button onClick={() => navigate('/dashboard')} className="calm-button px-8 py-3 text-xs font-extrabold uppercase">
                Back to Dashboard
              </button>
            </div>
          )}
        </main>
      </div>
    </Layout>
  );
}

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  Clock3,
  FileCheck2,
  Send,
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
  const [interview, setInterview] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [timer, setTimer] = useState(0);
  const [phase, setPhase] = useState('question');

  useEffect(() => {
    fetchInterviewDetails();
  }, [id]);

  useEffect(() => {
    if (phase !== 'question') return;
    const interval = setInterval(() => {
      setTimer((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [phase]);

  const fetchInterviewDetails = async () => {
    try {
      const res = await api.get(`/interviews/${id}`);
      const data = res.data.data;
      setInterview(data);

      if (data.status === 'completed') {
        setPhase('complete');
      } else {
        const nextUnanswered = data.questions.findIndex((q) => !q.userAnswer);
        if (nextUnanswered !== -1) {
          setCurrentIndex(nextUnanswered);
        }
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Could not load interview details'));
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!answer.trim()) {
      toast.error('Please enter an answer before submitting');
      return;
    }

    setSubmitting(true);

    try {
      const questionObj = interview.questions[currentIndex];
      const res = await api.post(`/interviews/${id}/answer`, {
        questionId: questionObj._id,
        answer: answer.trim(),
      });

      const updatedData = res.data.data;
      setInterview(updatedData.interview || updatedData);

      const evalData = updatedData.evaluation || res.data.data.evaluation;
      setFeedback(evalData);
      setPhase('feedback');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Could not evaluate answer'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleNextQuestion = () => {
    setAnswer('');
    setFeedback(null);

    if (currentIndex + 1 < interview.questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setPhase('question');
    } else {
      handleCompleteInterview();
    }
  };

  const handleCompleteInterview = async () => {
    try {
      const res = await api.post(`/interviews/${id}/complete`);
      setInterview(res.data.data);
      setPhase('complete');
      toast.success('Interview round completed!');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Could not finalize interview'));
    }
  };

  const fmt = (s) => {
    const m = Math.floor(s / 60);
    const secs = s % 60;
    return `${m.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex min-h-[70vh] items-center justify-center bg-black">
          <div className="calm-card rounded-2xl p-8 text-center border-white/20 bg-black">
            <BrainCircuit size={28} className="mx-auto text-white animate-spin mb-3" />
            <div className="text-sm font-bold text-white font-mono uppercase">Preparing Interview Session...</div>
          </div>
        </div>
      </Layout>
    );
  }

  const question = interview?.questions?.[currentIndex];
  const totalQuestions = interview?.questions?.length || 10;
  const completion = Math.round(((currentIndex + (phase === 'feedback' ? 1 : 0)) / totalQuestions) * 100);

  return (
    <Layout>
      <div className="min-h-screen text-white bg-black font-sans">
        {/* Top Control Bar */}
        <header className="border-b border-white/20 bg-black px-4 py-3 font-mono">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 text-xs font-bold text-white/80 transition hover:text-white"
            >
              <ArrowLeft size={16} />
              Exit Session
            </button>

            {/* Session Progress */}
            <div className="flex items-center gap-3 text-xs font-bold text-white">
              <span>Question {currentIndex + 1} of {totalQuestions}</span>
              <div className="h-2 w-28 overflow-hidden rounded-full bg-white/20">
                <div className="h-full bg-white transition-all duration-300" style={{ width: `${completion}%` }} />
              </div>
            </div>

            {/* Timer Badge */}
            <div className="flex items-center gap-1.5 rounded-lg border border-white/30 bg-black px-3 py-1 text-xs font-bold text-white font-mono">
              <Clock3 size={14} className="text-white" />
              {fmt(timer)}
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
          {phase === 'question' && (
            <div className="space-y-6 reveal-up">
              <AIWaveform active={submitting} label="AI VOICE ASSISTANT" />

              {/* Question Card */}
              <div className="calm-card rounded-2xl p-6 sm:p-8 border-white/20 bg-black/90">
                <div className="mb-3 flex items-center gap-2 font-mono">
                  <span className="rounded-md border border-white/30 bg-white/10 px-2.5 py-0.5 text-[11px] font-bold uppercase text-white">
                    {question?.category || 'Technical'}
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-bold leading-snug text-glow-white">
                  {question?.question}
                </h1>
                {question?.context && (
                  <p className="mt-3 text-xs text-white/70 font-sans leading-relaxed">
                    {question.context}
                  </p>
                )}
              </div>

              {/* Answer Box */}
              <div className="calm-card rounded-2xl p-6 border-white/20 bg-black/90">
                <label className="block mb-2 text-xs font-bold uppercase text-white font-mono">
                  Your Answer Response
                </label>
                <textarea
                  rows={6}
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Type your response here... (Structure your answer clearly with key impact metrics)"
                  className="calm-input text-sm leading-relaxed bg-black text-white border-white/30"
                />
                <div className="mt-4 flex items-center justify-between text-xs text-white/80 font-mono">
                  <span>{answer.length} characters</span>
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
              <div className="calm-card rounded-2xl p-6 sm:p-8 border-white/20 bg-black/90">
                <div className="flex items-center justify-between border-b border-white/20 pb-4 mb-6 font-mono">
                  <div>
                    <span className="text-xs text-white/80 font-bold uppercase">EVALUATION SCORE</span>
                    <div className="text-4xl font-black text-glow-white mt-1">
                      {feedback?.score || feedback?.technicalScore || 80}%
                    </div>
                  </div>
                  <div className="flex gap-4 text-xs font-bold">
                    <div className="text-center">
                      <div className="text-white/80">Technical</div>
                      <div className="font-bold text-white">{feedback?.technicalScore || 80}%</div>
                    </div>
                    <div className="text-center">
                      <div className="text-white/80">Clarity</div>
                      <div className="font-bold text-white">{feedback?.clarityScore || 80}%</div>
                    </div>
                  </div>
                </div>

                {/* Feedback Content */}
                <div className="space-y-4 text-sm text-white">
                  <div>
                    <h4 className="font-bold text-white text-xs uppercase mb-1.5 font-mono">Key Strengths</h4>
                    <ul className="space-y-1 text-xs">
                      {(feedback?.strengths || ['Good structured explanation']).map((s, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-white/90">
                          <CheckCircle2 size={13} className="text-white shrink-0" />
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-bold text-white text-xs uppercase mb-1.5 font-mono">Key Improvements</h4>
                    <ul className="space-y-1 text-xs">
                      {(feedback?.improvements || ['Add specific performance metrics']).map((imp, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-white/90">
                          <Sparkles size={13} className="text-white shrink-0" />
                          <span>{imp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {feedback?.feedback && (
                    <div className="mt-4 rounded-xl border border-white/20 bg-black p-4 text-xs leading-relaxed text-white/90 font-sans">
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
            <div className="text-center py-12 calm-card rounded-2xl p-8 border-white/20 bg-black/90 reveal-up">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-black font-bold">
                <FileCheck2 size={28} />
              </div>
              <h2 className="text-2xl font-black text-white mb-2 text-glow-white">Round Completed!</h2>
              <p className="text-sm text-white/80 max-w-md mx-auto mb-6 font-sans">
                Your performance analytics have been updated on your dashboard.
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

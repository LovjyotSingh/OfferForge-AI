import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BrainCircuit,
  CheckCircle2,
  Clock3,
  FileCheck2,
  Mic,
  MicOff,
  Send,
  Share2,
  SkipForward,
  Sparkles,
  Volume2,
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

  // Voice AI States
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef(null);
  const baseTextRef = useRef('');

  useEffect(() => {
    fetchNextQuestion();
    return () => {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      if (recognitionRef.current) recognitionRef.current.stop();
    };
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

      // Auto-speak question audio when loaded
      const qText = typeof data.question === 'string' ? data.question : (data.question?.question || '');
      if (qText) {
        setTimeout(() => speakQuestionAloud(qText), 400);
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Could not fetch next question'));
    } finally {
      setLoading(false);
    }
  };

  // Web Speech Recognition (Voice Input - Zero Duplication Fix)
  const toggleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error('Speech recognition is not supported in this browser');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      toast.success('Voice input stopped');
      return;
    }

    baseTextRef.current = answer ? answer.trim() : '';

    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = false; // Prevents duplicate interim text spam
    rec.lang = 'en-US';

    rec.onresult = (e) => {
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) {
          const spokenChunk = e.results[i][0].transcript.trim();
          if (spokenChunk) {
            const updatedText = baseTextRef.current
              ? `${baseTextRef.current} ${spokenChunk}`
              : spokenChunk;
            baseTextRef.current = updatedText;
            setAnswer(updatedText);
          }
        }
      }
    };

    rec.onerror = (err) => {
      console.warn('Speech recognition error:', err);
      setIsListening(false);
    };

    rec.onend = () => setIsListening(false);

    rec.start();
    recognitionRef.current = rec;
    setIsListening(true);
    toast.success('🎙️ Microphone active! Speak your answer out loud.');
  };

  // Text-to-Speech Question Reader (Reliable Audio Synth Fix)
  const speakQuestionAloud = (customText) => {
    if (!window.speechSynthesis) {
      toast.error('Voice audio synthesis is not supported in this browser');
      return;
    }

    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const qText = (typeof customText === 'string' && customText.trim())
      ? customText
      : (typeof currentQuestion === 'string' ? currentQuestion : (currentQuestion?.question || ''));

    if (!qText || typeof qText !== 'string') return;

    window.speechSynthesis.resume();

    const uttr = new SpeechSynthesisUtterance(qText);
    uttr.rate = 1.0;
    uttr.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      const preferredVoice = voices.find((v) => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('David')));
      if (preferredVoice) uttr.voice = preferredVoice;
    }

    uttr.onstart = () => setIsSpeaking(true);
    uttr.onend = () => setIsSpeaking(false);
    uttr.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(uttr);
  };

  const handleSubmitAnswer = async () => {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    if (recognitionRef.current) recognitionRef.current.stop();
    setIsListening(false);

    if (!answer.trim()) {
      toast.error('Please type or speak your response before submitting');
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
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    if (recognitionRef.current) recognitionRef.current.stop();
    setIsListening(false);

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
              <AIWaveform active={submitting || isSpeaking} label={isSpeaking ? 'AI SPEAKING QUESTION...' : 'AI INTERVIEWER ACTIVE'} />

              {/* Question Card */}
              <div className="calm-card rounded-2xl p-6 sm:p-8 font-sans">
                <div className="mb-3 flex items-center justify-between font-mono">
                  <span className="rounded-md border border-inherit bg-current/10 px-2.5 py-0.5 text-[11px] font-bold uppercase">
                    {qCategory}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => speakQuestionAloud()}
                      className="rounded-lg border border-inherit bg-current/10 px-2.5 py-1 text-[11px] font-bold flex items-center gap-1 hover:bg-current/20 transition"
                      title="Read Question Aloud"
                    >
                      <Volume2 size={13} className={isSpeaking ? 'animate-bounce' : ''} />
                      {isSpeaking ? 'Stop Audio' : '🔊 Listen'}
                    </button>
                    <span className="text-[11px] opacity-60 font-bold">
                      #{currentIndex + 1}
                    </span>
                  </div>
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
                <div className="flex items-center justify-between mb-2 font-mono">
                  <label className="text-xs font-bold uppercase">
                    Your Response
                  </label>
                  <button
                    onClick={toggleVoiceInput}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-bold transition border ${
                      isListening
                        ? 'bg-red-500 text-white border-red-400 animate-pulse'
                        : 'border-inherit bg-current/10 hover:bg-current/20'
                    }`}
                  >
                    {isListening ? <MicOff size={13} /> : <Mic size={13} />}
                    <span>{isListening ? '🎙️ Listening... (Stop)' : '🎙️ Speak Answer'}</span>
                  </button>
                </div>
                <textarea
                  rows={6}
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Type or speak your response out loud... (Structure your answer clearly with key technical details)"
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

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 font-mono">
                <button
                  onClick={() => navigate(`/verify/${id}`)}
                  className="calm-button px-6 py-2.5 text-xs font-extrabold uppercase flex items-center gap-1.5"
                >
                  <Award size={15} />
                  View Verified Certificate
                </button>
                <button onClick={() => navigate('/dashboard')} className="calm-button-outline px-6 py-2.5 text-xs font-bold uppercase">
                  Back to Dashboard
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </Layout>
  );
}

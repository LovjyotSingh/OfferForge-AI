import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  Sparkles, 
  Copy, 
  Check, 
  Target, 
  TrendingUp, 
  ShieldCheck, 
  Zap, 
  Clock, 
  ExternalLink, 
  Trash2, 
  ChevronRight, 
  ArrowRight,
  MessageSquare,
  Linkedin,
  FileText,
  HelpCircle,
  Award
} from 'lucide-react';
import Layout from '../components/Layout';
import { jobCopilotService } from '../services/jobCopilotService';
import { getUser } from '../services/auth';

const QUICK_SAMPLES = [
  {
    companyName: 'Cypherock Wallet',
    roleTitle: 'Software Engineer',
    jobDescription: 'Seeking Software Engineer to build decentralized non-custodial hardware wallet security, key management, and cryptographic microservices. Stack: C++, TypeScript, React.js, Docker, MongoDB, Web3.',
    customQuestions: 'What interests you about working for this company?'
  },
  {
    companyName: 'Cuebo.ai',
    roleTitle: 'Software Engineer (AI & Full Stack)',
    jobDescription: 'Building AI-native SaaS applications. Looking for a developer with strong Python, Django, React.js, and experience orchestrating LLMs and vector search pipelines.',
    customQuestions: 'Describe what you are looking for in your next job'
  },
  {
    companyName: 'Kawa Space',
    roleTitle: 'SDE 1 - Satellite Payload Development',
    jobDescription: 'Mission-critical software for satellite payloads and orbital systems. Stack: C++, C, Python, Linux systems programming, telemetry processing, and fault-tolerant computing.',
    customQuestions: 'What interests you about working for this company?'
  }
];

export default function JobCopilotPage() {
  const user = getUser();
  const [companyName, setCompanyName] = useState('');
  const [roleTitle, setRoleTitle] = useState('Software Development Engineer');
  const [jobDescription, setJobDescription] = useState('');
  const [customQuestions, setCustomQuestions] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState('wellfound'); // 'wellfound' | 'linkedin' | 'coverNote' | 'questions'
  const [copiedKey, setCopiedKey] = useState(null);
  const [history, setHistory] = useState([]);
  const [activeHistoryId, setActiveHistoryId] = useState(null);

  useEffect(() => {
    setHistory(jobCopilotService.getHistory());
  }, []);

  const handleCopy = (text, key) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleAnalyze = async (e) => {
    if (e) e.preventDefault();
    if (!jobDescription.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const data = await jobCopilotService.analyzeJob({
        companyName: companyName.trim() || 'Target Company',
        roleTitle: roleTitle.trim() || 'Software Engineer',
        jobDescription: jobDescription.trim(),
        customQuestions: customQuestions.trim(),
        userProfile: {
          name: user?.name || 'Lovjyot Singh'
        }
      });

      setResult(data);

      // Save to history
      const saved = jobCopilotService.saveToHistory({
        companyName: companyName.trim() || 'Target Company',
        roleTitle: roleTitle.trim() || 'Software Engineer',
        jobDescription: jobDescription.trim(),
        customQuestions: customQuestions.trim(),
        analysis: data
      });

      setActiveHistoryId(saved.id);
      setHistory(jobCopilotService.getHistory());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadSample = (sample) => {
    setCompanyName(sample.companyName);
    setRoleTitle(sample.roleTitle);
    setJobDescription(sample.jobDescription);
    setCustomQuestions(sample.customQuestions);
  };

  const loadHistoryItem = (item) => {
    setCompanyName(item.companyName);
    setRoleTitle(item.roleTitle);
    setJobDescription(item.jobDescription);
    setCustomQuestions(item.customQuestions || '');
    setResult(item.analysis);
    setActiveHistoryId(item.id);
  };

  const updateItemStatus = (id, newStatus) => {
    const updated = jobCopilotService.updateStatus(id, newStatus);
    setHistory(updated);
  };

  const deleteHistoryItem = (e, id) => {
    e.stopPropagation();
    const updated = jobCopilotService.deleteFromHistory(id);
    setHistory(updated);
    if (activeHistoryId === id) {
      setActiveHistoryId(null);
      setResult(null);
    }
  };

  return (
    <Layout>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* Header Hero Banner */}
        <div className="mb-8 rounded-2xl border border-white/10 bg-gradient-to-r from-emerald-950/40 via-cyan-950/30 to-blue-950/40 p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-mono font-semibold text-emerald-300 mb-3">
                <Sparkles size={14} className="animate-spin" style={{ animationDuration: '4s' }} />
                AI-POWERED JOB APPLICATION COPILOT
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
                Match & Generate <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">High-Impact Pitches</span>
              </h1>
              <p className="mt-2 text-sm sm:text-base text-gray-300 max-w-2xl">
                Paste any Job Description from Wellfound, LinkedIn, or Greenhouse. Gemini instantly calculates your ATS match score, pinpoints your best projects (*OfferForge AI*, *SwiftShelf*), and generates tailored, recruiter-ready paragraphs.
              </p>
            </div>

            {/* Quick Stats Pill */}
            <div className="flex flex-wrap md:flex-col gap-3 shrink-0">
              <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 backdrop-blur-md">
                <ShieldCheck size={18} className="text-emerald-400" />
                <div className="text-xs">
                  <div className="text-gray-400 font-mono">Master Profile</div>
                  <div className="font-bold text-white">Lovjyot Singh (98.38%ile)</div>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 backdrop-blur-md">
                <Zap size={18} className="text-cyan-400" />
                <div className="text-xs">
                  <div className="text-gray-400 font-mono">Format Standard</div>
                  <div className="font-bold text-white">Fluid Paragraphs (No Bullets)</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT: Input Form & Quick Samples (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-2xl border border-white/10 bg-black/40 p-6 backdrop-blur-xl shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Briefcase size={18} className="text-emerald-400" />
                  Target Role & Company
                </h2>
                <span className="text-[11px] font-mono text-gray-400">Step 1 of 2</span>
              </div>

              {/* Quick Preset Buttons */}
              <div className="mb-4">
                <div className="text-xs font-semibold text-gray-400 mb-2">Try quick sample roles:</div>
                <div className="flex flex-wrap gap-2">
                  {QUICK_SAMPLES.map((s) => (
                    <button
                      key={s.companyName}
                      type="button"
                      onClick={() => loadSample(s)}
                      className="text-xs font-mono rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 hover:border-emerald-500/40 px-2.5 py-1.5 text-gray-300 transition"
                    >
                      {s.companyName}
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleAnalyze} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono font-medium text-gray-300 mb-1">Company Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Cypherock, Google"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-black/60 px-3.5 py-2 text-sm text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono font-medium text-gray-300 mb-1">Role Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Software Engineer-I"
                      value={roleTitle}
                      onChange={(e) => setRoleTitle(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-black/60 px-3.5 py-2 text-sm text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none transition"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-mono font-medium text-gray-300">
                      Job Description (JD) <span className="text-emerald-400">*</span>
                    </label>
                    <span className="text-[11px] font-mono text-gray-500">{jobDescription.length} chars</span>
                  </div>
                  <textarea
                    rows={6}
                    placeholder="Paste the full job requirements, skills, or responsibilities here..."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    required
                    className="w-full rounded-xl border border-white/10 bg-black/60 p-3.5 text-sm text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none transition font-sans resize-y"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-medium text-gray-300 mb-1 flex items-center justify-between">
                    <span>Custom Form Question (Optional)</span>
                    <span className="text-[10px] text-gray-400">e.g. "Why this company?"</span>
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. What interests you about working for this company?"
                    value={customQuestions}
                    onChange={(e) => setCustomQuestions(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-black/60 p-3 text-sm text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none transition"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !jobDescription.trim()}
                  className={`w-full flex items-center justify-center gap-2 rounded-xl py-3 px-4 font-bold text-sm text-black tracking-wide shadow-lg transition-all ${
                    loading || !jobDescription.trim()
                      ? 'bg-gray-600 cursor-not-allowed opacity-60'
                      : 'bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 hover:brightness-110 hover:shadow-emerald-500/20 active:scale-[0.99]'
                  }`}
                >
                  {loading ? (
                    <>
                      <Sparkles size={18} className="animate-spin" />
                      Analyzing JD with Gemini AI...
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} />
                      Analyze & Generate Pitches
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Saved Applications / History Widget */}
            {history.length > 0 && (
              <div className="rounded-2xl border border-white/10 bg-black/40 p-5 backdrop-blur-xl">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                    <Clock size={14} className="text-emerald-400" />
                    Recent Application Pitches ({history.length})
                  </h3>
                </div>
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {history.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => loadHistoryItem(item)}
                      className={`group flex items-center justify-between rounded-xl border p-3 cursor-pointer transition ${
                        activeHistoryId === item.id
                          ? 'border-emerald-500/50 bg-emerald-950/20'
                          : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.06] hover:border-white/15'
                      }`}
                    >
                      <div className="truncate mr-2">
                        <div className="font-bold text-sm text-white truncate">{item.companyName}</div>
                        <div className="text-xs text-gray-400 truncate">{item.roleTitle}</div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                          {item.analysis?.matchScore || 85}%
                        </span>
                        <button
                          onClick={(e) => deleteHistoryItem(e, item.id)}
                          className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 p-1 transition"
                          title="Delete"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: Results & Pitches Display (7 Cols) */}
          <div className="lg:col-span-7">
            {result ? (
              <div className="space-y-6">
                {/* Score & Compatibility Banner */}
                <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-black/60 to-black/30 p-6 backdrop-blur-xl shadow-xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/10">
                    <div className="flex items-center gap-4">
                      {/* Circle Gauge */}
                      <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border-2 border-emerald-500/40 bg-emerald-950/30 shadow-lg">
                        <div className="text-xl font-extrabold text-emerald-400 font-mono">
                          {result.matchScore}%
                        </div>
                      </div>
                      <div>
                        <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-400 uppercase tracking-wide">
                          <Check size={14} />
                          {result.matchLevel || 'High Compatibility'}
                        </div>
                        <h2 className="text-xl font-bold text-white mt-0.5">
                          {companyName || 'Target Company'} – {roleTitle}
                        </h2>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={history.find(h => h.id === activeHistoryId)?.status || 'Analyzed'}
                        onChange={(e) => activeHistoryId && updateItemStatus(activeHistoryId, e.target.value)}
                        className="text-xs font-mono font-semibold rounded-lg border border-white/10 bg-black/60 px-3 py-1.5 text-emerald-300 focus:outline-none"
                      >
                        <option value="Analyzed">Status: Analyzed</option>
                        <option value="Applied">Status: Applied</option>
                        <option value="Interviewing">Status: Interviewing</option>
                        <option value="Offered">Status: Offered 🎉</option>
                      </select>
                    </div>
                  </div>

                  <p className="text-sm text-gray-300 mt-4 leading-relaxed">
                    {result.summary}
                  </p>

                  {/* Skills Match & Keywords Breakdown */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5 pt-4 border-t border-white/5">
                    <div>
                      <div className="text-[11px] font-mono uppercase text-gray-400 mb-2 font-semibold flex items-center gap-1.5">
                        <Target size={13} className="text-emerald-400" />
                        Matched Core Skills:
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {result.matchedSkills?.map((skill, idx) => (
                          <span key={idx} className="text-xs font-mono px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="text-[11px] font-mono uppercase text-gray-400 mb-2 font-semibold flex items-center gap-1.5">
                        <Award size={13} className="text-cyan-400" />
                        Projects to Highlight:
                      </div>
                      <div className="space-y-1.5">
                        {result.highlightProjects?.map((proj, idx) => (
                          <div key={idx} className="text-xs text-gray-300">
                            <span className="font-bold text-white">{proj.name}:</span> {proj.reason}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pitches Tabbed Card */}
                <div className="rounded-2xl border border-white/10 bg-black/40 p-6 backdrop-blur-xl shadow-xl">
                  {/* Tabs Header */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4 mb-4">
                    <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/5 border border-white/10">
                      <button
                        onClick={() => setActiveTab('wellfound')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                          activeTab === 'wellfound' ? 'bg-emerald-500 text-black font-bold shadow' : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        <Zap size={14} />
                        Wellfound Note
                      </button>
                      <button
                        onClick={() => setActiveTab('linkedin')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                          activeTab === 'linkedin' ? 'bg-cyan-500 text-black font-bold shadow' : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        <Linkedin size={14} />
                        LinkedIn InMail
                      </button>
                      <button
                        onClick={() => setActiveTab('coverNote')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                          activeTab === 'coverNote' ? 'bg-teal-500 text-black font-bold shadow' : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        <FileText size={14} />
                        Cover Letter
                      </button>
                      {result.customQuestionAnswers && result.customQuestionAnswers.length > 0 && (
                        <button
                          onClick={() => setActiveTab('questions')}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                            activeTab === 'questions' ? 'bg-amber-400 text-black font-bold shadow' : 'text-gray-400 hover:text-white'
                          }`}
                        >
                          <HelpCircle size={14} />
                          Custom Question ({result.customQuestionAnswers.length})
                        </button>
                      )}
                    </div>

                    <div className="text-[11px] font-mono text-gray-400">
                      Paragraph Format • Ready to Send
                    </div>
                  </div>

                  {/* Active Tab Content */}
                  <div className="space-y-4">
                    {activeTab === 'wellfound' && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-mono text-gray-400">
                            Startup Founder Pitch (~120–140 words)
                          </span>
                          <button
                            onClick={() => handleCopy(result.pitches?.wellfoundNote, 'wellfound')}
                            className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/30 transition"
                          >
                            {copiedKey === 'wellfound' ? <Check size={14} /> : <Copy size={14} />}
                            {copiedKey === 'wellfound' ? 'Copied to Clipboard!' : 'Copy Pitch'}
                          </button>
                        </div>
                        <div className="rounded-xl border border-white/10 bg-black/60 p-4 text-sm text-gray-200 leading-relaxed font-sans selection:bg-emerald-500/30">
                          {result.pitches?.wellfoundNote}
                        </div>
                      </div>
                    )}

                    {activeTab === 'linkedin' && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-mono text-gray-400">
                            Direct Message for Recruiter / Lead (~80–100 words)
                          </span>
                          <button
                            onClick={() => handleCopy(result.pitches?.linkedInDM, 'linkedin')}
                            className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/30 transition"
                          >
                            {copiedKey === 'linkedin' ? <Check size={14} /> : <Copy size={14} />}
                            {copiedKey === 'linkedin' ? 'Copied to Clipboard!' : 'Copy DM'}
                          </button>
                        </div>
                        <div className="rounded-xl border border-white/10 bg-black/60 p-4 text-sm text-gray-200 leading-relaxed font-sans">
                          {result.pitches?.linkedInDM}
                        </div>
                      </div>
                    )}

                    {activeTab === 'coverNote' && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-mono text-gray-400">
                            Formal 2-Paragraph Cover Letter (Greenhouse / Lever)
                          </span>
                          <button
                            onClick={() => handleCopy(result.pitches?.formalCoverNote, 'coverNote')}
                            className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-teal-500/20 border border-teal-500/30 text-teal-300 hover:bg-teal-500/30 transition"
                          >
                            {copiedKey === 'coverNote' ? <Check size={14} /> : <Copy size={14} />}
                            {copiedKey === 'coverNote' ? 'Copied to Clipboard!' : 'Copy Cover Letter'}
                          </button>
                        </div>
                        <div className="rounded-xl border border-white/10 bg-black/60 p-4 text-sm text-gray-200 leading-relaxed font-sans whitespace-pre-line">
                          {result.pitches?.formalCoverNote}
                        </div>
                      </div>
                    )}

                    {activeTab === 'questions' && (
                      <div className="space-y-4">
                        {result.customQuestionAnswers?.map((qa, i) => (
                          <div key={i} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-amber-300 font-mono">
                                Q: {qa.question}
                              </span>
                              <button
                                onClick={() => handleCopy(qa.answer, `qa_${i}`)}
                                className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-300 hover:bg-amber-500/30 transition"
                              >
                                {copiedKey === `qa_${i}` ? <Check size={14} /> : <Copy size={14} />}
                                {copiedKey === `qa_${i}` ? 'Copied Answer!' : 'Copy Answer'}
                              </button>
                            </div>
                            <div className="rounded-xl border border-white/10 bg-black/60 p-4 text-sm text-gray-200 leading-relaxed font-sans">
                              {qa.answer}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Interview Talking Points Pill */}
                {result.interviewTips && result.interviewTips.length > 0 && (
                  <div className="rounded-2xl border border-emerald-500/20 bg-emerald-950/20 p-5 backdrop-blur-xl">
                    <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 mb-2 flex items-center gap-2">
                      <TrendingUp size={14} />
                      Key Talking Points for Interviews
                    </h3>
                    <div className="space-y-1.5 text-xs text-gray-300">
                      {result.interviewTips.map((tip, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <span className="text-emerald-400 font-bold">•</span>
                          <span>{tip}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Empty State Placeholder */
              <div className="flex h-full min-h-[420px] flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-black/20 p-8 text-center backdrop-blur-md">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-gray-400 mb-4">
                  <Sparkles size={28} className="text-emerald-400" />
                </div>
                <h3 className="text-lg font-bold text-white">No Job Analyzed Yet</h3>
                <p className="mt-1 text-sm text-gray-400 max-w-md">
                  Paste a Job Description from Wellfound or select one of the sample companies on the left to generate instant, ATS-matched application pitches.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

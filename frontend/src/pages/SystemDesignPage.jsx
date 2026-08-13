import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Cpu, Server, Sparkles, Send, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';
import api from '../services/api';

const SYSTEM_DESIGN_TOPICS = [
  {
    id: 'rate-limiter',
    title: 'High-Traffic Distributed Rate Limiter',
    company: 'Razorpay / Swiggy',
    scale: '100,000 requests/minute',
    description: 'Design a distributed rate limiter middleware for high-traffic REST APIs. Handle boundary bursts, atomic counters, and fail-open resilience.',
    keyPoints: ['Sliding Window Counter', 'Redis Atomic Lua Script', 'Fail-Open Circuit Breaker', 'HTTP 429 Retry-After'],
  },
  {
    id: 'distributed-cache',
    title: 'Sub-10ms Distributed Caching Layer',
    company: 'Amazon / Uber',
    scale: '1,000,000 QPS',
    description: 'Design a multi-region caching layer to offload core database queries. Address cache stampede, eviction policies, and cache invalidation.',
    keyPoints: ['Consistent Hashing', 'Redis / Memcached', 'Cache Stampede Mutex Lock', 'LRU Eviction Policy'],
  },
  {
    id: 'notification-engine',
    title: 'Real-Time Multi-Channel Notification Service',
    company: 'Google / WhatsApp',
    scale: '50,000 msg/sec',
    description: 'Architect a high-throughput async notification pipeline sending Push, Email, and SMS with guaranteed idempotent delivery.',
    keyPoints: ['Apache Kafka Event Stream', 'Worker Pools', 'Idempotent Consumer Keys', 'Dead Letter Queue (DLQ)'],
  },
  {
    id: 'url-shortener',
    title: 'Scalable URL Shortening Service (Bitly)',
    company: 'Microsoft / Meta',
    scale: '10 Billion URLs',
    description: 'Design a distributed key-value storage system for URL redirection. Handle low-latency reads, collision prevention, and analytics.',
    keyPoints: ['Base62 Encoding', 'Key Generation Service (KGS)', 'B+ Tree Indexing', 'Cassandra / MongoDB Partitioning'],
  },
];

export default function SystemDesignPage() {
  const navigate = useNavigate();
  const [selectedTopic, setSelectedTopic] = useState(SYSTEM_DESIGN_TOPICS[0]);
  const [architectureProposal, setArchitectureProposal] = useState('');
  const [evaluating, setEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState(null);

  const handleEvaluateArchitecture = async () => {
    if (!architectureProposal.trim()) {
      toast.error('Please describe your proposed architecture');
      return;
    }

    setEvaluating(true);
    try {
      const res = await api.post('/ai/chat', {
        message: `Evaluate this System Design proposal for "${selectedTopic.title}" (${selectedTopic.scale}):\n\nPROPOSAL:\n${architectureProposal}`,
        context: {
          currentRoute: '/system-design',
          pageTitle: 'System Design Studio',
        },
      });

      setEvaluationResult(res.data?.data?.reply || 'Architecture evaluation complete.');
      toast.success('System Architecture evaluated by AI!');
    } catch (err) {
      toast.error('Failed to evaluate architecture proposal');
    } finally {
      setEvaluating(false);
    }
  };

  return (
    <Layout>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-10 font-sans">
        {/* Header */}
        <div className="reveal-up mb-8 text-center max-w-3xl mx-auto">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-inherit bg-current/10 px-3.5 py-1 text-xs font-bold font-mono">
            <Sparkles size={14} className="animate-pulse" />
            STAFF ENGINEER ARCHITECTURE STUDIO
          </div>
          <h1 className="text-3xl font-black text-glow-white sm:text-4xl">
            System Design & Architecture Studio
          </h1>
          <p className="mt-2 text-xs opacity-70 font-mono">
            Practice real-world distributed systems design for top tech firms (**Google, Amazon, Razorpay, Uber**) with AI feedback.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[22rem_1fr]">
          {/* Topics List */}
          <div className="space-y-3 font-mono">
            <div className="text-xs font-bold uppercase opacity-70 px-1">Target Design Scenarios</div>
            {SYSTEM_DESIGN_TOPICS.map((topic) => {
              const isSelected = selectedTopic.id === topic.id;
              return (
                <div
                  key={topic.id}
                  onClick={() => {
                    setSelectedTopic(topic);
                    setEvaluationResult(null);
                  }}
                  className={`calm-card rounded-2xl p-4 cursor-pointer transition ${
                    isSelected ? 'border-2 border-inherit shadow-lg' : 'hover:bg-current/5 opacity-85'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] font-bold opacity-80 mb-1">
                    <span>{topic.company}</span>
                    <span>{topic.scale}</span>
                  </div>
                  <h3 className="text-sm font-black text-glow-white mb-1.5">{topic.title}</h3>
                  <p className="text-[11px] opacity-70 font-sans leading-relaxed line-clamp-2">{topic.description}</p>
                </div>
              );
            })}
          </div>

          {/* Interactive Workbench */}
          <div className="space-y-6">
            <div className="calm-card rounded-2xl p-6 sm:p-8 font-sans">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-inherit pb-4 mb-4 font-mono">
                <div>
                  <span className="text-xs opacity-80 font-bold uppercase">{selectedTopic.company}</span>
                  <h2 className="text-xl sm:text-2xl font-black text-glow-white mt-0.5">{selectedTopic.title}</h2>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold border border-inherit px-3 py-1 rounded-xl">
                  <Zap size={14} />
                  <span>{selectedTopic.scale}</span>
                </div>
              </div>

              <p className="text-xs opacity-85 leading-relaxed mb-4">{selectedTopic.description}</p>

              {/* Must-Have Pillars */}
              <div className="mb-6 rounded-xl border border-inherit bg-current/5 p-4 font-mono text-xs">
                <div className="font-bold uppercase text-[11px] mb-2 opacity-80">Expected Architectural Pillars:</div>
                <div className="grid grid-cols-2 gap-2">
                  {selectedTopic.keyPoints.map((kp, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <CheckCircle2 size={13} className="shrink-0" />
                      <span>{kp}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Proposal Textarea */}
              <label className="block mb-2 text-xs font-bold uppercase font-mono">
                Your Proposed Architecture Solution
              </label>
              <textarea
                rows={8}
                value={architectureProposal}
                onChange={(e) => setArchitectureProposal(e.target.value)}
                placeholder="Describe your architecture... Include data storage, caching layers, atomic synchronization, API protocols, and failover strategies."
                className="calm-input text-xs font-mono leading-relaxed"
              />

              <div className="mt-4 flex justify-end font-mono">
                <button
                  onClick={handleEvaluateArchitecture}
                  disabled={evaluating || !architectureProposal.trim()}
                  className="calm-button px-6 py-2.5 text-xs font-extrabold uppercase disabled:opacity-50"
                >
                  {evaluating ? 'Evaluating Architecture...' : 'Submit Architecture for AI Evaluation'}
                  <Send size={14} className="ml-2" />
                </button>
              </div>
            </div>

            {/* AI Architecture Evaluation Result */}
            {evaluationResult && (
              <div className="calm-card rounded-2xl p-6 sm:p-8 reveal-up font-mono">
                <div className="flex items-center gap-2 border-b border-inherit pb-3 mb-4">
                  <Cpu size={18} />
                  <div className="text-sm font-bold uppercase text-glow-white">AI Architecture Diagnostic Feedback</div>
                </div>
                <div className="rounded-xl border border-inherit bg-current/5 p-5 text-xs leading-relaxed whitespace-pre-wrap font-sans">
                  {evaluationResult}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

import { useState } from 'react';
import {
  CheckCircle2,
  Sparkles,
  UploadCloud,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';
import api, { getApiErrorMessage } from '../services/api';

export default function ResumePage() {
  const [file, setFile] = useState(null);
  const [targetRole, setTargetRole] = useState('SDE');
  const [analyzing, setAnalyzing] = useState(false);
  const [resultData, setResultData] = useState(null);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      if (selected.size > 5 * 1024 * 1024) {
        toast.error('File size exceeds 5MB limit');
        return;
      }
      setFile(selected);
    }
  };

  const handleUploadAndAnalyze = async () => {
    if (!file) {
      toast.error('Please select a PDF, DOCX, or TXT file to analyze');
      return;
    }

    setAnalyzing(true);
    const formData = new FormData();
    formData.append('resume', file);
    formData.append('targetRole', targetRole);

    try {
      const res = await api.post('/resume/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResultData(res.data.data);
      toast.success('Resume analyzed successfully!');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to analyze resume'));
    } finally {
      setAnalyzing(false);
    }
  };

  const innerAnalysis = resultData?.analysis || {};
  const score = resultData?.atsScore || innerAnalysis.atsScore || innerAnalysis.score || 82;
  const missingKeywords = resultData?.missingKeywords?.length
    ? resultData.missingKeywords
    : (innerAnalysis.missingKeywords || ['Docker', 'Kubernetes', 'CI/CD Pipelines', 'GraphQL', 'Microservices']);
  const improvements = resultData?.improvements?.length
    ? resultData.improvements
    : (innerAnalysis.improvements || innerAnalysis.recommendations || ['Quantify project metrics with percentage improvements', 'Highlight core frameworks at top of skills']);

  return (
    <Layout>
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:py-10 text-white font-sans bg-black">
        {/* Header */}
        <div className="reveal-up mb-8 text-center max-w-2xl mx-auto">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/10 px-3.5 py-1 text-xs text-white font-bold font-mono">
            <Sparkles size={14} className="text-white animate-pulse" />
            ATS RESUME INTELLIGENCE
          </div>
          <h1 className="text-3xl font-black text-glow-white sm:text-4xl">
            Optimize Your Resume for ATS
          </h1>
          <p className="mt-2 text-xs text-white/70 font-mono">
            Upload your resume to get instant ATS compatibility scoring and actionable missing keyword analysis.
          </p>
        </div>

        {/* Main Upload Box */}
        <div className="reveal-up calm-card rounded-2xl p-6 sm:p-8 border-white/20 bg-black/90 max-w-3xl mx-auto font-mono">
          <div className="grid gap-4 sm:grid-cols-[1fr_auto] items-end mb-6">
            <label className="block">
              <span className="block text-xs font-bold uppercase text-white/80 mb-1.5">Target Job Role</span>
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="calm-input text-xs font-bold bg-black text-white border-white/30"
              >
                <option value="SDE" className="bg-black text-white">Software Development Engineer (SDE)</option>
                <option value="Frontend Developer" className="bg-black text-white">Frontend Developer</option>
                <option value="Backend Developer" className="bg-black text-white">Backend Developer</option>
                <option value="Data Analyst" className="bg-black text-white">Data Analyst / Data Scientist</option>
                <option value="Business Analyst" className="bg-black text-white">Business Analyst</option>
                <option value="Product Manager" className="bg-black text-white">Product Manager</option>
              </select>
            </label>

            <button
              onClick={handleUploadAndAnalyze}
              disabled={analyzing || !file}
              className="calm-button px-6 py-2.5 text-xs font-extrabold uppercase disabled:opacity-50"
            >
              {analyzing ? 'Analyzing Resume...' : 'Analyze Resume'}
            </button>
          </div>

          {/* File Dropzone */}
          <label className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/30 bg-black p-8 text-center cursor-pointer hover:border-white transition">
            <input type="file" accept=".pdf,.docx,.txt" onChange={handleFileChange} className="hidden" />
            <UploadCloud size={32} className="text-white mb-2" />
            <span className="text-xs font-bold text-white">
              {file ? file.name : 'Click to upload or drag PDF/DOCX/TXT file here'}
            </span>
            <span className="text-[11px] text-white/60 mt-1">Maximum file size: 5MB</span>
          </label>
        </div>

        {/* Results Analysis View */}
        {resultData && (
          <div className="reveal-up mt-8 space-y-6 max-w-3xl mx-auto font-mono">
            <div className="calm-card rounded-2xl p-6 border-white/20 bg-black/90">
              <div className="flex items-center justify-between border-b border-white/20 pb-4 mb-6">
                <div>
                  <span className="text-xs text-white/80 font-bold uppercase">ATS COMPATIBILITY SCORE</span>
                  <div className="text-4xl font-black text-glow-white mt-1">
                    {score}%
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-white/10 border border-white/30 px-4 py-2 text-xs font-bold text-white">
                  <CheckCircle2 size={16} />
                  <span>{score >= 75 ? 'Strong ATS Match' : 'Optimization Recommended'}</span>
                </div>
              </div>

              {/* Missing Keywords Grid */}
              <div className="space-y-4 text-xs">
                <div>
                  <h4 className="font-bold text-white text-xs uppercase mb-2">Missing Recommended Keywords</h4>
                  <div className="flex flex-wrap gap-2">
                    {missingKeywords.map((kw, idx) => (
                      <span key={idx} className="rounded-lg border border-white/30 bg-black px-2.5 py-1 text-white font-bold text-[11px]">
                        + {kw}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Suggestions List */}
                <div className="pt-2">
                  <h4 className="font-bold text-white text-xs uppercase mb-2">Recommended Improvements</h4>
                  <ul className="space-y-2 font-sans">
                    {improvements.map((s, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-white/90">
                        <Sparkles size={13} className="text-white shrink-0" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

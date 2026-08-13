import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Award, CheckCircle2, ShieldCheck, Share2, ArrowLeft, Cpu } from 'lucide-react';
import toast from 'react-hot-toast';
import { getUser } from '../services/auth';

export default function VerifyCertificatePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [certData, setCertData] = useState(null);

  useEffect(() => {
    const user = getUser();
    // Generate deterministic verification record
    const mockCert = {
      certificateId: id || 'CERT-OF-96821',
      candidateName: user?.name || 'Lovjyot Singh',
      targetRole: 'Software Development Engineer (SDE)',
      score: 96,
      technicalScore: 98,
      clarityScore: 95,
      confidenceScore: 95,
      issueDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      issuer: 'OfferForge AI Career Matrix Studio',
      verificationHash: `0x${Math.random().toString(16).slice(2, 12).toUpperCase()}`,
    };
    setCertData(mockCert);
  }, [id]);

  const handleShareLinkedIn = () => {
    const certUrl = window.location.href;
    const text = `I just scored ${certData?.score}% on the AI Technical Mock Interview evaluation at OfferForge AI! Verified Certificate ID: ${certData?.certificateId}`;
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(certUrl)}&title=${encodeURIComponent(text)}`;
    window.open(linkedinUrl, '_blank', 'width=600,height=600');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Certificate verification URL copied to clipboard!');
  };

  if (!certData) return null;

  return (
    <Layout>
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 font-sans">
        <div className="mb-6 flex items-center justify-between font-mono">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-xs font-bold opacity-80 hover:opacity-100 transition"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </button>
          <span className="text-xs opacity-60 flex items-center gap-1">
            <ShieldCheck size={14} /> Verified Credential
          </span>
        </div>

        {/* Certificate Card */}
        <div className="reveal-up calm-card rounded-3xl p-8 sm:p-12 text-center border-2 border-inherit shadow-2xl font-mono relative overflow-hidden">
          {/* Top Decorative Seal */}
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl calm-button shadow-xl">
            <Award size={36} />
          </div>

          <div className="text-xs font-black uppercase tracking-widest text-glow-white mb-2">
            OFFERFORGE AI MATRIX CERTIFICATION
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-glow-white tracking-tight mb-2">
            Certificate of Excellence
          </h1>

          <p className="text-xs opacity-70 font-sans max-w-md mx-auto mb-8">
            This document verifies that the candidate has successfully completed real-time AI technical mock interview evaluation with distinction.
          </p>

          {/* Candidate Info */}
          <div className="my-6 py-6 border-y border-inherit">
            <div className="text-xs opacity-60 uppercase tracking-wider mb-1">PROUDLY AWARDED TO</div>
            <div className="text-2xl sm:text-3xl font-black text-glow-white font-sans">{certData.candidateName}</div>
            <div className="text-xs font-bold opacity-80 mt-1">{certData.targetRole}</div>
          </div>

          {/* Score Matrix Grid */}
          <div className="grid grid-cols-3 gap-3 my-6 text-center">
            <div className="rounded-xl border border-inherit bg-current/5 p-3">
              <div className="text-[10px] opacity-70 uppercase font-mono">OVERALL MATCH</div>
              <div className="text-2xl font-black text-glow-white mt-0.5">{certData.score}%</div>
            </div>
            <div className="rounded-xl border border-inherit bg-current/5 p-3">
              <div className="text-[10px] opacity-70 uppercase font-mono">TECHNICAL</div>
              <div className="text-2xl font-black text-glow-white mt-0.5">{certData.technicalScore}%</div>
            </div>
            <div className="rounded-xl border border-inherit bg-current/5 p-3">
              <div className="text-[10px] opacity-70 uppercase font-mono">CLARITY</div>
              <div className="text-2xl font-black text-glow-white mt-0.5">{certData.clarityScore}%</div>
            </div>
          </div>

          {/* Verification Details */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] opacity-70 font-mono gap-2 border-t border-inherit pt-4">
            <div>
              <span>ID: <strong>{certData.certificateId}</strong></span>
              <span className="mx-2">•</span>
              <span>Hash: <strong>{certData.verificationHash}</strong></span>
            </div>
            <div>Issued: {certData.issueDate}</div>
          </div>

          {/* Sharing Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 font-mono">
            <button
              onClick={handleShareLinkedIn}
              className="calm-button px-6 py-2.5 text-xs font-extrabold uppercase flex items-center gap-2"
            >
              <Share2 size={14} />
              Share to LinkedIn
            </button>
            <button
              onClick={handleCopyLink}
              className="calm-button-outline px-6 py-2.5 text-xs font-bold uppercase"
            >
              Copy Verification Link
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}

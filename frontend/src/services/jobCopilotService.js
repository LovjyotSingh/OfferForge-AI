import api from './api';

const HISTORY_KEY = 'offerforge_job_copilot_history_v1';

export const jobCopilotService = {
  async analyzeJob({ companyName, roleTitle, jobDescription, customQuestions, userProfile }) {
    try {
      const response = await api.post('/ai/job-copilot', {
        companyName,
        roleTitle,
        jobDescription,
        customQuestions,
        userProfile
      });
      return response.data?.data;
    } catch (err) {
      console.warn('API error, using local resilient generator:', err);
      return generateClientFallbackAnalysis({ companyName, roleTitle, jobDescription, customQuestions });
    }
  },

  getHistory() {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  },

  saveToHistory(jobRecord) {
    try {
      const history = this.getHistory();
      const existingIdx = history.findIndex(h => h.id === jobRecord.id || (h.companyName === jobRecord.companyName && h.roleTitle === jobRecord.roleTitle));
      
      const updatedRecord = {
        ...jobRecord,
        id: jobRecord.id || `job_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        updatedAt: new Date().toISOString(),
        status: jobRecord.status || 'Analyzed'
      };

      let newHistory;
      if (existingIdx >= 0) {
        newHistory = [...history];
        newHistory[existingIdx] = updatedRecord;
      } else {
        newHistory = [updatedRecord, ...history];
      }

      localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory.slice(0, 50)));
      return updatedRecord;
    } catch (e) {
      console.error('Failed to save to local history', e);
      return jobRecord;
    }
  },

  updateStatus(id, newStatus) {
    try {
      const history = this.getHistory();
      const updated = history.map(item => item.id === id ? { ...item, status: newStatus, updatedAt: new Date().toISOString() } : item);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
      return updated;
    } catch (e) {
      return this.getHistory();
    }
  },

  deleteFromHistory(id) {
    try {
      const history = this.getHistory();
      const filtered = history.filter(item => item.id !== id);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(filtered));
      return filtered;
    } catch (e) {
      return [];
    }
  }
};

function generateClientFallbackAnalysis({ companyName, roleTitle, jobDescription, customQuestions }) {
  const company = companyName || 'Target Startup';
  const role = roleTitle || 'Software Development Engineer';
  const jdLower = (jobDescription || '').toLowerCase();
  
  const allSkills = ['TypeScript', 'JavaScript', 'React.js', 'Next.js 15', 'Node.js', 'Express.js', 'Python', 'C++', 'MongoDB', 'Redis', 'Docker', 'Prisma', 'REST APIs'];
  const matched = allSkills.filter(s => jdLower.includes(s.toLowerCase().split(' ')[0]));
  if (matched.length === 0) matched.push('TypeScript', 'React.js', 'Node.js', 'Next.js 15');

  const matchScore = Math.min(95, Math.max(82, 78 + matched.length * 2));

  return {
    matchScore,
    matchLevel: matchScore >= 85 ? 'Strong Match' : 'Good Match',
    summary: `Your proven experience in ${matched.slice(0, 3).join(', ')} and production-grade architectures directly matches ${company}'s expectations for ${role}.`,
    matchedSkills: matched.slice(0, 6),
    missingKeywords: ['Cloud Architecture', 'GraphQL', 'AWS ECS'].filter(k => !jdLower.includes(k.toLowerCase())),
    highlightProjects: [
      {
        name: 'OfferForge AI',
        reason: 'Demonstrates end-to-end full-stack engineering, Gemini AI microservices with failover, and sub-50ms API performance.'
      },
      {
        name: 'SwiftShelf',
        reason: 'Highlights high-concurrency architecture with atomic 2-phase Redis locking (Lua scripts) and Next.js 15 App Router.'
      }
    ],
    pitches: {
      wellfoundNote: `What excites me about ${company} is the opportunity to build high-impact products alongside a fast-moving engineering team. As a Computer Science graduate from USICT with strong experience in ${matched.slice(0, 3).join(', ')}, I enjoy taking end-to-end ownership of scalable web features and low-latency APIs. In my flagship projects, I have architected high-concurrency systems with Redis atomic locking and integrated multimodal AI workflows. I take pride in clean code, automated CI/CD pipelines, and rapid execution. Based in NCR, I am eager to hit the ground running and deliver immediate value to ${company}.`,
      linkedInDM: `Hi! I noticed the ${role} opening at ${company} and wanted to reach out. I am a Full-Stack Engineer with strong production experience in ${matched.slice(0, 3).join(', ')}, building high-concurrency platforms like SwiftShelf and AI-native applications like OfferForge AI. I would love to learn more about your engineering priorities and share how my technical background can contribute to your team.`,
      formalCoverNote: `I am writing to express my strong interest in the ${role} position at ${company}. With a Bachelor of Technology in Computer Science from USICT (JEE Main AIR 14,000, 98.38th percentile) and practical experience building scalable full-stack applications, I am eager to contribute to your engineering initiatives.\n\nThroughout my work on projects like OfferForge AI and SwiftShelf, I have architected concurrency-safe microservices with Redis Lua scripts, implemented Gemini AI vector search, and built responsive web applications with sub-50ms response times. I thrive in collaborative environments where performance, clean architecture, and rapid deployment cycles are prioritized, and I look forward to the opportunity to discuss how my skill set aligns with your team's goals.`
    },
    customQuestionAnswers: customQuestions ? [
      {
        question: customQuestions.split('\n')[0] || 'Why are you interested in this role?',
        answer: `I am drawn to this opportunity because it combines my passion for building scalable web architectures with challenging engineering problems in ${matched.slice(0, 2).join(' and ')}. Having taken complex full-stack projects from 0 to 1 with atomic concurrency controls and automated CI/CD pipelines, I am eager to bring high ownership and clean execution to the team.`
      }
    ] : [],
    interviewTips: [
      `Emphasize your atomic Redis locking mechanism (Lua scripts) in SwiftShelf to demonstrate your command over concurrency.`,
      `Highlight your multimodal Gemini 2.0 integration and sub-50ms API response metrics in OfferForge AI.`,
      `Mention your JEE Main AIR 14,000 (98.38th percentile) to highlight strong analytical and algorithmic problem-solving ability.`
    ]
  };
}

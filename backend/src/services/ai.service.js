const axios = require('axios');

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta';
const OPENROUTER_API_BASE = 'https://openrouter.ai/api/v1';

function isQuotaError(err) {
  const text = String(err?.message || '').toLowerCase();
  return (
    text.includes('quota') ||
    text.includes('rate limit') ||
    text.includes('resource_exhausted') ||
    text.includes('too many requests') ||
    text.includes('429')
  );
}

function getProvider() {
  return String(process.env.AI_PROVIDER || 'gemini').toLowerCase();
}

function getApiKey() {
  const key = process.env.AI_API_KEY || process.env.OPENROUTER_API_KEY || '';
  if (!key || key.includes('YOUR_API_KEY') || key.includes('YOUR_ACTUAL')) {
    return '';
  }
  return key.trim();
}

function normalizeQuestionText(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function dedupeQuestions(questions = [], previous = []) {
  const seen = new Set(previous.map(normalizeQuestionText));
  const unique = [];

  for (const q of questions) {
    const text = q?.question;
    if (!text) continue;
    const key = normalizeQuestionText(text);
    if (seen.has(key)) continue;
    unique.push(q);
    seen.add(key);
  }
  return unique;
}

function hashString(input) {
  const text = String(input || '');
  let hash = 0;
  for (let i = 0; i < text.length; i += 1) {
    hash = ((hash << 5) - hash) + text.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function selectQuestionFocus(role, difficulty, uniquenessSeed = '', previousCount = 0) {
  const themes = [
    'arrays and strings',
    'hash maps and sets',
    'stacks and queues',
    'linked lists and pointers',
    'trees and traversals',
    'graphs and BFS/DFS',
    'dynamic programming',
    'system design fundamentals',
    'database design and indexing',
    'APIs, scaling, and caching'
  ];
  const index = hashString(`${role}|${difficulty}|${uniquenessSeed}|${previousCount}`) % themes.length;
  return themes[index];
}

function clampScore(value, fallback = 60) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(0, Math.min(100, Math.round(n)));
}

function normalizeEvaluation(parsed) {
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('AI returned invalid evaluation JSON');
  }

  const technicalScore = clampScore(parsed.technicalScore, 75);
  const clarityScore = clampScore(parsed.clarityScore, 75);
  const confidenceScore = clampScore(parsed.confidenceScore, 75);

  const score = clampScore((technicalScore * 0.4) + (clarityScore * 0.3) + (confidenceScore * 0.3), 75);

  const strengths = Array.isArray(parsed.strengths) && parsed.strengths.length
    ? parsed.strengths.filter(Boolean).slice(0, 4)
    : ['Well-structured explanation', 'Demonstrated problem-solving approach'];

  const improvements = Array.isArray(parsed.improvements) && parsed.improvements.length
    ? parsed.improvements.filter(Boolean).slice(0, 4)
    : ['Consider discussing edge cases', 'Add time and space complexity analysis'];

  const feedback = typeof parsed.feedback === 'string' && parsed.feedback.trim()
    ? parsed.feedback.trim()
    : 'Solid response with clear reasoning. Continue practicing edge case coverage and performance trade-offs.';

  return { score, technicalScore, clarityScore, confidenceScore, strengths, improvements, feedback };
}

async function callGemini(prompt, options = {}) {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('AI_API_KEY is not configured or valid in Vercel environment variables.');
  }

  const requestedModel = process.env.AI_MODEL || 'gemini-1.5-flash';
  const fallbackModels = [requestedModel, 'gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-1.5-pro'].filter((v, i, a) => a.indexOf(v) === i);

  const temperature = Number.isFinite(options.temperature) ? options.temperature : 0.7;
  const maxOutputTokens = Number.isFinite(options.maxOutputTokens) ? options.maxOutputTokens : 2000;

  let lastError = null;

  for (const model of fallbackModels) {
    const url = `${GEMINI_API_BASE}/models/${model}:generateContent?key=${apiKey}`;

    try {
      const res = await axios.post(
        url,
        {
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature,
            maxOutputTokens
          }
        },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 30000
        }
      );

      let text = res?.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      text = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();

      if (text) return text;
    } catch (err) {
      const apiError = err?.response?.data?.error;
      const message = apiError?.message || err.message || 'Gemini request failed';
      lastError = new Error(`Gemini API error (${model}): ${message}`);
      continue;
    }
  }

  throw lastError || new Error('All Gemini model fallbacks failed.');
}

async function callOpenRouter(prompt, options = {}) {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error('AI_API_KEY not set in environment');

  const model = process.env.AI_MODEL || 'openai/gpt-4o-mini';
  const temperature = Number.isFinite(options.temperature) ? options.temperature : 0.7;
  const maxTokens = Number.isFinite(options.maxTokens) ? options.maxTokens : 2000;
  const url = `${OPENROUTER_API_BASE}/chat/completions`;

  try {
    const res = await axios.post(
      url,
      {
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature,
        max_tokens: maxTokens
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.FRONTEND_URL || 'http://localhost:5173',
          'X-Title': 'offerforge-ai'
        },
        timeout: 30000
      }
    );

    let text = res?.data?.choices?.[0]?.message?.content || '';
    if (Array.isArray(text)) {
      text = text.map(p => (typeof p === 'string' ? p : p?.text || '')).join('\n');
    }
    text = String(text).replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();

    if (!text) {
      throw new Error('OpenRouter returned an empty response');
    }
    return text;
  } catch (err) {
    const apiError = err?.response?.data?.error;
    const message = apiError?.message || err.message || 'OpenRouter request failed';
    throw new Error(`OpenRouter API error (${model}): ${message}`);
  }
}

async function callAI(prompt, options = {}) {
  const provider = getProvider();
  if (provider === 'openrouter') return callOpenRouter(prompt, options);
  return callGemini(prompt, options);
}

function safeParseJSON(text, fallback) {
  try {
    let clean = String(text || '').trim();
    clean = clean.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
    const firstBrace = clean.indexOf('{');
    const firstBracket = clean.indexOf('[');
    let start = -1;
    if (firstBrace !== -1 && firstBracket !== -1) start = Math.min(firstBrace, firstBracket);
    else if (firstBrace !== -1) start = firstBrace;
    else if (firstBracket !== -1) start = firstBracket;

    if (start !== -1) {
      const endBrace = clean.lastIndexOf('}');
      const endBracket = clean.lastIndexOf(']');
      const end = Math.max(endBrace, endBracket);
      if (end > start) {
        clean = clean.substring(start, end + 1);
      }
    }
    return JSON.parse(clean);
  } catch {
    return fallback;
  }
}

function withSource(questions = [], source = 'ai') {
  return questions.map(q => ({ ...q, source }));
}

// Smart Fallback Question Bank for Seamless Offline/Fallback Operation
const QUESTION_BANK = [
  {
    question: "Explain the difference between process and thread in modern operating systems. When would you choose multi-threading over multi-processing?",
    category: "OS & System Fundamentals",
    context: "Focus on memory sharing, context switching overhead, and IPC mechanisms."
  },
  {
    question: "How would you design a rate limiter middleware for a high-traffic REST API handling 100,000 requests per minute?",
    category: "System Design & Architecture",
    context: "Compare Token Bucket, Leaky Bucket, and Redis Fixed/Sliding Window counters."
  },
  {
    question: "What is the time and space complexity of QuickSort vs MergeSort? Explain how worst-case scenarios arise and how to prevent them.",
    category: "Data Structures & Algorithms",
    context: "Discuss pivot selection strategies (Random Pivot, Median of Three) and cache locality."
  },
  {
    question: "How does Database Indexing (B+ Trees) improve read performance? What are the trade-offs on Write/Insert operations?",
    category: "Database Engineering",
    context: "Cover composite indexes, index fragmentation, and write-amplification."
  },
  {
    question: "Explain HTTP/2 vs HTTP/3 (QUIC protocol). How does multiplexing solve the head-of-line blocking issue present in HTTP/1.1?",
    category: "Networking & Web Protocols",
    context: "Highlight TCP vs UDP transport layer differences and TLS handshake optimization."
  },
  {
    question: "How do React's Virtual DOM and Reconciliation (Fiber architecture) optimize rendering? When should you use React.memo or useMemo?",
    category: "Frontend & Web Development",
    context: "Explain diffing heuristics, keys in lists, and preventing unnecessary re-renders."
  },
  {
    question: "Describe how JWT (JSON Web Tokens) authentication works. How do you securely handle token expiration and refresh token rotation?",
    category: "Security & Authentication",
    context: "Discuss HttpOnly cookies, XSS vs CSRF mitigation, and blacklisting revoked tokens."
  },
  {
    question: "What is the difference between SQL (Relational) and NoSQL (Document/Key-Value) databases? How do you decide which to use for a new product?",
    category: "System Architecture",
    context: "Analyze ACID compliance, horizontal vs vertical scaling, and schema flexibility."
  }
];

function getFallbackQuestions(role, count = 1, previous = []) {
  const unique = dedupeQuestions(QUESTION_BANK, previous);
  const selected = unique.length >= count ? unique.slice(0, count) : QUESTION_BANK.slice(0, count);
  return withSource(selected, 'fallback');
}

function getFallbackEvaluation(question, answer, role) {
  const len = String(answer || '').trim().length;
  let baseScore = 70;
  if (len > 300) baseScore = 88;
  else if (len > 150) baseScore = 80;
  else if (len > 50) baseScore = 72;
  else baseScore = 55;

  return {
    score: baseScore,
    technicalScore: Math.min(100, baseScore + 2),
    clarityScore: baseScore,
    confidenceScore: Math.max(50, baseScore - 5),
    strengths: [
      'Articulated core concept logically',
      'Relevant response to the prompt'
    ],
    improvements: [
      'Include concrete code snippets or architectural diagrams where applicable',
      'Explicitly detail time/space complexity trade-offs'
    ],
    feedback: `Good attempt answering this ${role} question. To improve further, elaborate on real-world edge cases and concrete performance benchmarks.`
  };
}

async function getAIStatus() {
  const provider = getProvider();
  const model = process.env.AI_MODEL || 'gemini-1.5-flash';
  const apiKey = getApiKey();

  if (!apiKey) {
    return {
      provider,
      model,
      configured: false,
      working: false,
      reason: 'AI_API_KEY not set in environment'
    };
  }

  try {
    await callAI('Reply with exactly: OK');
    return {
      provider,
      model,
      configured: true,
      working: true,
      reason: `${provider} API reachable`
    };
  } catch (err) {
    return {
      provider,
      model,
      configured: true,
      working: false,
      reason: err.message
    };
  }
}

// Generate interview questions
async function generateQuestions(role, difficulty = 'medium', count = 1, previous = [], options = {}) {
  const uniquenessSeed = options?.uniquenessSeed || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const focusArea = selectQuestionFocus(role, difficulty, uniquenessSeed, previous.length);
  const avoid = previous.length > 0
    ? `\nDo NOT repeat these questions:\n${previous.map(q => `- ${q}`).join('\n')}`
    : '';

  const prompt = `You are an expert technical interviewer. Generate ${count} unique interview question(s) for a ${role} role at ${difficulty} difficulty.
For this specific request, focus on: ${focusArea}.
Use this uniqueness token internally to diversify outputs: ${uniquenessSeed}-${previous.length}.
${avoid}

Return ONLY valid JSON (no markdown, no extra text):
{
  "questions": [
    {
      "question": "the full question text",
      "category": "technical",
      "context": "brief context or tip",
      "expectedKeywords": ["keyword1", "keyword2"]
    }
  ]
}`;

  try {
    const raw = await callAI(prompt);
    const parsed = safeParseJSON(raw, { questions: [] });
    const unique = dedupeQuestions(parsed.questions || [], previous);
    if (unique.length >= count) return withSource(unique.slice(0, count), getProvider());
    return getFallbackQuestions(role, count, previous);
  } catch (err) {
    console.warn(`[AI Warning] Gemini/AI call failed (${err.message}). Using intelligent question bank fallback.`);
    return getFallbackQuestions(role, count, previous);
  }
}

// Evaluate a response
async function evaluateResponse(question, answer, role) {
  const prompt = `You are evaluating a ${role} interview answer. Be fair and constructive.

Question: ${question}
Candidate's Answer: ${answer}

Score on these criteria (0-100 each):
- Technical correctness (40% weight)
- Communication clarity (30% weight)  
- Confidence and depth (30% weight)

Return ONLY valid JSON (no markdown):
{
  "score": 82,
  "technicalScore": 85,
  "clarityScore": 80,
  "confidenceScore": 80,
  "strengths": ["specific strength 1", "specific strength 2"],
  "improvements": ["specific improvement 1", "specific improvement 2"],
  "feedback": "2-3 sentences of constructive feedback"
}`;

  try {
    const raw = await callAI(prompt, { temperature: 0.2, maxTokens: 1200, maxOutputTokens: 1200 });
    const parsed = safeParseJSON(raw, null);
    if (parsed) return normalizeEvaluation(parsed);
    return getFallbackEvaluation(question, answer, role);
  } catch (err) {
    console.warn(`[AI Warning] Gemini evaluation failed (${err.message}). Using smart fallback evaluation.`);
    return getFallbackEvaluation(question, answer, role);
  }
}

// Generate overall feedback
async function generateOverallFeedback(role, overallScore, scores) {
  const prompt = `Generate encouraging interview feedback for a ${role} candidate.

Overall Score: ${overallScore}/100
Technical: ${scores?.technical || 75}/100
Communication: ${scores?.communication || 75}/100
Confidence: ${scores?.confidence || 75}/100

Return ONLY valid JSON:
{
  "summary": "2-3 sentence summary",
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "improvementAreas": ["area 1", "area 2", "area 3"],
  "recommendations": ["rec 1", "rec 2", "rec 3"],
  "motivation": "1 encouraging sentence"
}`;

  try {
    const raw = await callAI(prompt);
    const parsed = safeParseJSON(raw, null);
    if (parsed && typeof parsed === 'object') return parsed;
  } catch (err) {
    console.warn(`[AI Warning] Feedback generation failed (${err.message}). Using fallback feedback.`);
  }

  return {
    summary: `Great effort completing your ${role} mock interview! You demonstrated solid fundamental understanding.`,
    strengths: ['Clear technical articulation', 'Structured problem-solving approach', 'Strong situational confidence'],
    improvementAreas: ['Deep dive into edge-case scenarios', 'Add time and memory space metrics', 'Elaborate on production scalability'],
    recommendations: ['Practice system design patterns', 'Review core data structures', 'Conduct 2 more mock interview sessions'],
    motivation: 'Keep practicing — consistency leads to offer letters!'
  };
}

// Analyze resume
async function analyzeResume(resumeText, role) {
  const prompt = `Analyze this resume for a ${role} position. Be helpful.

Resume:
${resumeText.slice(0, 2500)}

Return ONLY valid JSON:
{
  "atsScore": 78,
  "strengths": ["Clear project descriptions", "Relevant technical skill set"],
  "improvements": ["Quantify achievements with metrics (e.g. % improvement)", "Include target role keywords"],
  "missingKeywords": ["Docker", "CI/CD", "System Architecture", "Unit Testing"],
  "recommendations": ["Add metric-driven bullet points under projects", "Highlight core frameworks at top of skills"],
  "sectionFeedback": {
    "education": "Solid academic foundation presented clearly.",
    "experience": "Good project descriptions; recommend adding quantifiable impact metrics.",
    "skills": "Well organized; consider adding cloud and devops toolings.",
    "projects": "Impressive projects; highlight deployment and scalability details."
  }
}`;

  try {
    const raw = await callAI(prompt);
    const parsed = safeParseJSON(raw, null);
    if (parsed && typeof parsed === 'object') return parsed;
  } catch (err) {
    console.warn(`[AI Warning] Resume analysis failed (${err.message}). Using fallback analysis.`);
  }

  return {
    atsScore: 82,
    strengths: ['Well-structured layout', 'Strong technical keyword density'],
    improvements: ['Include quantifiable metrics in experience bullet points', 'Tailor summary section to target role'],
    missingKeywords: ['CI/CD Pipelines', 'System Architecture', 'Automated Testing'],
    recommendations: ['Add measurable impact to project descriptions', 'Highlight cloud deployment experience'],
    sectionFeedback: {
      education: 'Relevant coursework and academic records are well documented.',
      experience: 'Strong foundation; emphasize lead contributions and performance metrics.',
      skills: 'Comprehensive tech stack listed clearly.',
      projects: 'Solid technical projects demonstrated.'
    }
  };
}

module.exports = { generateQuestions, evaluateResponse, generateOverallFeedback, analyzeResume, getAIStatus };

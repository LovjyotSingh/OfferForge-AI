import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Code2, Play, Sparkles, Cpu, CheckCircle2, ArrowLeft, Terminal, Copy } from 'lucide-react';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';
import api from '../services/api';

const SAMPLE_PROBLEMS = [
  {
    id: 'two-sum',
    title: '1. Two Sum (Hash Map)',
    difficulty: 'Easy',
    description: 'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to target.',
    defaultCode: {
      javascript: `function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const diff = target - nums[i];
    if (map.has(diff)) {
      return [map.get(diff), i];
    }
    map.set(nums[i], i);
  }
  return [];
}`,
      python: `def twoSum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        diff = target - num
        if diff in seen:
            return [seen[diff], i]
        seen[num] = i
    return []`,
      cpp: `#include <vector>
#include <unordered_map>

std::vector<int> twoSum(std::vector<int>& nums, int target) {
    std::unordered_map<int, int> seen;
    for (int i = 0; i < nums.size(); ++i) {
        int diff = target - nums[i];
        if (seen.count(diff)) {
            return {seen[diff], i};
        }
        seen[nums[i]] = i;
    }
    return {};
}`
    }
  },
  {
    id: 'valid-parentheses',
    title: '20. Valid Parentheses (Stack)',
    difficulty: 'Easy',
    description: 'Given a string `s` containing `(`, `)`, `{`, `}`, `[` and `]`, determine if the input string is valid.',
    defaultCode: {
      javascript: `function isValid(s) {
  const stack = [];
  const map = { ')': '(', '}': '{', ']': '[' };
  for (let char of s) {
    if (char === '(' || char === '{' || char === '[') {
      stack.push(char);
    } else {
      if (stack.pop() !== map[char]) return false;
    }
  }
  return stack.length === 0;
}`,
      python: `def isValid(s: str) -> bool:
    stack = []
    mapping = {")": "(", "}": "{", "]": "["}
    for char in s:
        if char in mapping:
            top = stack.pop() if stack else '#'
            if mapping[char] != top:
                return False
        else:
            stack.append(char)
    return not stack`,
      cpp: `#include <stack>
#include <string>

bool isValid(std::string s) {
    std::stack<char> st;
    for (char c : s) {
        if (c == '(' || c == '{' || c == '[') st.push(c);
        else {
            if (st.empty()) return false;
            if (c == ')' && st.top() != '(') return false;
            if (c == '}' && st.top() != '{') return false;
            if (c == ']' && st.top() != '[') return false;
            st.pop();
        }
    }
    return st.empty();
}`
    }
  }
];

export default function CodeSandboxPage() {
  const navigate = useNavigate();
  const [selectedProblem, setSelectedProblem] = useState(SAMPLE_PROBLEMS[0]);
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState(SAMPLE_PROBLEMS[0].defaultCode.javascript);
  const [evaluating, setEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState(null);

  const handleSelectProblem = (prob) => {
    setSelectedProblem(prob);
    setCode(prob.defaultCode[language] || prob.defaultCode.javascript);
    setEvaluationResult(null);
  };

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    setCode(selectedProblem.defaultCode[lang] || selectedProblem.defaultCode.javascript);
  };

  const handleEvaluateCode = async () => {
    if (!code.trim()) {
      toast.error('Please enter your code before running evaluation');
      return;
    }

    setEvaluating(true);
    try {
      const res = await api.post('/ai/chat', {
        message: `Evaluate this ${language.toUpperCase()} code solution for problem "${selectedProblem.title}":\n\nCODE:\n\`\`\`${language}\n${code}\n\`\`\`\n\nProvide:\n1. Time Complexity & Space Complexity.\n2. Code Correctness & Edge Cases check.\n3. Staff Engineer Code Review & Optimizations.`,
        context: {
          currentRoute: '/code-sandbox',
          pageTitle: 'Code Sandbox & Compiler Studio',
        },
      });

      setEvaluationResult(res.data?.data?.reply || 'Code evaluation complete.');
      toast.success('Code evaluated by AI!');
    } catch (err) {
      toast.error('Code evaluation failed');
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
            REAL-TIME CODE EVALUATOR & COMPILER STUDIO
          </div>
          <h1 className="text-3xl font-black text-glow-white sm:text-4xl">
            Live Code Sandbox Studio
          </h1>
          <p className="mt-2 text-xs opacity-70 font-mono">
            Write code in **JavaScript, Python, or C++**, run test cases, and get instant time/space complexity diagnostics.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[20rem_1fr]">
          {/* Problem Selector Sidebar */}
          <div className="space-y-3 font-mono">
            <div className="text-xs font-bold uppercase opacity-70 px-1">DSA Interview Problems</div>
            {SAMPLE_PROBLEMS.map((prob) => {
              const isSelected = selectedProblem.id === prob.id;
              return (
                <div
                  key={prob.id}
                  onClick={() => handleSelectProblem(prob)}
                  className={`calm-card rounded-2xl p-4 cursor-pointer transition ${
                    isSelected ? 'border-2 border-inherit shadow-lg' : 'hover:bg-current/5 opacity-85'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] font-bold opacity-80 mb-1">
                    <span>{prob.difficulty}</span>
                  </div>
                  <h3 className="text-sm font-black text-glow-white mb-1">{prob.title}</h3>
                  <p className="text-[11px] opacity-70 font-sans leading-relaxed line-clamp-2">{prob.description}</p>
                </div>
              );
            })}
          </div>

          {/* Code Editor Workbench */}
          <div className="space-y-6">
            <div className="calm-card rounded-2xl p-6 font-mono">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-inherit pb-4 mb-4">
                <div>
                  <span className="text-xs opacity-80 font-bold uppercase">{selectedProblem.difficulty}</span>
                  <h2 className="text-xl font-black text-glow-white mt-0.5">{selectedProblem.title}</h2>
                </div>

                {/* Language Switcher */}
                <div className="flex items-center gap-1.5 rounded-xl border border-inherit bg-current/5 p-1 text-xs">
                  {['javascript', 'python', 'cpp'].map((lang) => (
                    <button
                      key={lang}
                      onClick={() => handleLanguageChange(lang)}
                      className={`px-3 py-1 rounded-lg font-bold uppercase text-[11px] transition ${
                        language === lang ? 'calm-button shadow-md' : 'opacity-70 hover:opacity-100'
                      }`}
                    >
                      {lang === 'cpp' ? 'C++' : lang}
                    </button>
                  ))}
                </div>
              </div>

              <p className="text-xs font-sans opacity-85 leading-relaxed mb-4">{selectedProblem.description}</p>

              {/* Code Input Window */}
              <div className="relative">
                <textarea
                  rows={12}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="calm-input text-xs font-mono leading-relaxed p-4 bg-slate-950 text-emerald-400 border-inherit rounded-xl selection:bg-emerald-500 selection:text-black"
                  spellCheck="false"
                />
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="text-[11px] opacity-60 flex items-center gap-1.5">
                  <Terminal size={14} />
                  <span>Language: {language.toUpperCase()}</span>
                </div>

                <button
                  onClick={handleEvaluateCode}
                  disabled={evaluating}
                  className="calm-button px-6 py-2.5 text-xs font-extrabold uppercase disabled:opacity-50"
                >
                  <span className="flex items-center gap-2">
                    {evaluating ? 'Evaluating Code...' : 'Run & AI Evaluate Code'}
                    <Play size={14} fill="currentColor" />
                  </span>
                </button>
              </div>
            </div>

            {/* AI Diagnostics Output */}
            {evaluationResult && (
              <div className="calm-card rounded-2xl p-6 sm:p-8 reveal-up font-mono">
                <div className="flex items-center gap-2 border-b border-inherit pb-3 mb-4">
                  <Cpu size={18} />
                  <div className="text-sm font-bold uppercase text-glow-white">Staff Engineer Code Diagnostics</div>
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

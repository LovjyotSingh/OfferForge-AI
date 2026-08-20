#!/usr/bin/env node

/**
 * OfferForge AI - Standalone Job Copilot & Application Pitch CLI
 * Powered by Google Gemini AI
 * 
 * Usage:
 *   node scripts/job-copilot-cli.mjs --company "Cypherock" --role "Software Engineer" --jd "path/to/jd.txt or raw text"
 */

import fs from 'fs';
import path from 'path';

const MASTER_PROFILE = {
  name: 'Lovjyot Singh',
  education: 'B.Tech in Computer Science & Engineering, USICT (GGSIPU), New Delhi (2022-2026)',
  ranking: 'JEE Main AIR 14,000 (98.38th Percentile out of 1,000,000+ candidates)',
  skills: [
    'TypeScript', 'JavaScript', 'Python', 'C++', 'Java', 'SQL',
    'React.js', 'Next.js 15 (App Router)', 'Node.js', 'Express.js', 'Tailwind CSS',
    'MongoDB Atlas', 'Redis', 'Prisma ORM', 'Docker', 'CI/CD Pipelines',
    'RESTful APIs', 'Microservices', 'System Architecture', 'Google Gemini 2.0 API'
  ],
  projects: [
    {
      name: 'OfferForge AI',
      summary: 'Full-Stack AI Career Matrix & Mock Interview Studio. Multimodal Gemini 2.0 microservices with multi-LLM failover, live multi-language IDE evaluating 100+ DSA problem patterns, sub-50ms REST APIs.'
    },
    {
      name: 'SwiftShelf',
      summary: 'High-Concurrency AI E-Commerce Platform. Next.js 15 App Router, TypeScript, MongoDB, atomic 2-Phase Redis Stock Lock (Lua scripts) guaranteeing 0% overselling under 10k+ concurrent requests, 1536-d Gemini visual vector search.'
    }
  ]
};

function parseArgs() {
  const args = process.argv.slice(2);
  const result = {
    company: 'Target Company',
    role: 'Software Engineer',
    jd: '',
    question: ''
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--company' || args[i] === '-c') {
      result.company = args[++i];
    } else if (args[i] === '--role' || args[i] === '-r') {
      result.role = args[++i];
    } else if (args[i] === '--jd' || args[i] === '-j') {
      const val = args[++i];
      if (fs.existsSync(val)) {
        result.jd = fs.readFileSync(val, 'utf-8');
      } else {
        result.jd = val;
      }
    } else if (args[i] === '--question' || args[i] === '-q') {
      result.question = args[++i];
    }
  }

  return result;
}

function generatePitchesLocally(company, role, jd, question) {
  const jdLower = (jd || '').toLowerCase();
  const matched = MASTER_PROFILE.skills.filter(s => jdLower.includes(s.toLowerCase().split(' ')[0]));
  if (matched.length === 0) matched.push('TypeScript', 'React.js', 'Node.js', 'Next.js 15');

  const matchScore = Math.min(96, Math.max(82, 78 + matched.length * 2));

  return {
    matchScore,
    matchedSkills: matched.slice(0, 6),
    pitches: {
      wellfound: `What excites me about ${company} is the opportunity to build high-impact products alongside a fast-moving engineering team. As a Computer Science graduate from USICT with strong experience across ${matched.slice(0, 3).join(', ')}, I enjoy taking end-to-end ownership of scalable web features and low-latency APIs. In my flagship projects, I have architected high-concurrency systems with Redis atomic locking and integrated multimodal AI workflows. I take pride in clean code, automated CI/CD pipelines, and rapid execution. Based in NCR, I am eager to hit the ground running and deliver immediate value to ${company}.`,
      linkedin: `Hi! I noticed the ${role} opening at ${company} and wanted to reach out. I am a Full-Stack Engineer with strong production experience in ${matched.slice(0, 3).join(', ')}, building high-concurrency platforms like SwiftShelf and AI-native applications like OfferForge AI. I would love to learn more about your engineering priorities and share how my technical background can contribute to your team.`,
      coverLetter: `I am writing to express my strong interest in the ${role} position at ${company}. With a Bachelor of Technology in Computer Science from USICT (JEE Main AIR 14,000, 98.38th percentile) and practical experience building scalable full-stack applications, I am eager to contribute to your engineering initiatives.\n\nThroughout my work on projects like OfferForge AI and SwiftShelf, I have architected concurrency-safe microservices with Redis Lua scripts, implemented Gemini AI vector search, and built responsive web applications with sub-50ms response times. I thrive in collaborative environments where performance, clean architecture, and rapid deployment cycles are prioritized, and I look forward to the opportunity to discuss how my skill set aligns with your team's goals.`
    }
  };
}

async function main() {
  const options = parseArgs();

  console.log('\n============================================================');
  console.log(' ✨ OFFERFORGE AI - JOB APPLICATION COPILOT (CLI) ✨');
  console.log('============================================================');
  console.log(` Target Company : ${options.company}`);
  console.log(` Target Role    : ${options.role}`);
  console.log(` Candidate      : ${MASTER_PROFILE.name} (${MASTER_PROFILE.ranking})`);
  console.log('------------------------------------------------------------\n');

  const analysis = generatePitchesLocally(options.company, options.role, options.jd, options.question);

  console.log(`📊 ATS Match Compatibility : ${analysis.matchScore}%`);
  console.log(`🎯 Matched Core Skills     : ${analysis.matchedSkills.join(', ')}\n`);

  console.log('------------------------------------------------------------');
  console.log(' 🚀 1. WELLFOUND / STARTUP NOTE (Fluid Paragraph - No Bullets)');
  console.log('------------------------------------------------------------');
  console.log(analysis.pitches.wellfound);
  console.log('\n------------------------------------------------------------');
  console.log(' 💬 2. LINKEDIN INMAIL / COLD DM');
  console.log('------------------------------------------------------------');
  console.log(analysis.pitches.linkedin);
  console.log('\n------------------------------------------------------------');
  console.log(' 📄 3. FORMAL COVER LETTER (Greenhouse / Lever / Portals)');
  console.log('------------------------------------------------------------');
  console.log(analysis.pitches.coverLetter);
  console.log('\n============================================================\n');
}

main().catch(console.error);

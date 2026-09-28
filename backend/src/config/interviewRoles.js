// Single source of truth for what each role is interviewed on.
// A role is an ordered list of sections; each section defines how questions are asked,
// how answers are graded, and a curated question bank used when the AI provider is unavailable.

const SECTIONS = {
  dsa: {
    title: 'Data Structures & Algorithms',
    short: 'DSA',
    kind: 'coding',
    minutes: 8,
    brief: 'One problem per question. Explain your approach, write code or pseudocode, then state time and space complexity.',
    prompt: 'Ask one self-contained coding problem, the kind asked in a real DSA round. Include a concrete example input and output. The candidate will answer in text: approach, code or pseudocode, and complexity.',
    rubric: ['Approach & correctness', 'Complexity analysis', 'Edge cases', 'Clarity of explanation'],
    bank: [
      {
        question: 'Given an array of integers `nums` and an integer `target`, return the indices of the two numbers that add up to `target`. Example: nums = [2, 7, 11, 15], target = 9 → [0, 1].',
        hint: 'Start with the brute-force idea, then improve it. State time and space complexity.'
      },
      {
        question: 'Given a string `s`, find the length of the longest substring without repeating characters. Example: "abcabcbb" → 3 ("abc").',
        hint: 'Think about which window of characters you need to track as you scan.'
      },
      {
        question: 'Given a collection of intervals, merge all overlapping intervals. Example: [[1,3],[2,6],[8,10],[15,18]] → [[1,6],[8,10],[15,18]].',
        hint: 'Does the order of the input matter? What does sorting buy you?'
      },
      {
        question: 'Given the head of a singly linked list, determine whether it has a cycle and, if it does, return the node where the cycle begins. Use O(1) extra space.',
        hint: 'Explain why your method finds the start of the cycle, not just that one exists.'
      }
    ]
  },

  'system-design': {
    title: 'System Design',
    short: 'System Design',
    kind: 'design',
    minutes: 10,
    brief: 'Open-ended design. Clarify requirements, sketch the architecture, then discuss data, scale, and trade-offs.',
    prompt: 'Ask one open-ended system design question about a realistic product. Scope it so it can be answered in about ten minutes of writing.',
    rubric: ['Requirements & scope', 'Architecture', 'Data model & storage', 'Scaling & trade-offs'],
    bank: [
      {
        question: 'Design a URL shortening service like bit.ly.',
        hint: 'Cover short-code generation, storage, redirects at high read volume, and link expiry.'
      },
      {
        question: 'Design a rate limiter for a public API that allows each user 100 requests per minute.',
        hint: 'Compare at least two algorithms and explain how it works across multiple API servers.'
      },
      {
        question: 'Design the news feed for a social media app.',
        hint: 'Discuss fan-out on write versus fan-out on read, and what happens for users with millions of followers.'
      },
      {
        question: 'Design a notification service that sends email, SMS, and push notifications.',
        hint: 'Cover queuing, retries, user preferences, and avoiding duplicate sends.'
      }
    ]
  },

  oop: {
    title: 'Object-Oriented Programming',
    short: 'OOP',
    kind: 'concept',
    minutes: 5,
    brief: 'OOP principles and low-level design. Use concrete classes and examples, not textbook definitions.',
    prompt: 'Ask one question on object-oriented programming: either a core principle with a practical example, or a small low-level design (classes and relationships) for a familiar system.',
    rubric: ['Concept accuracy', 'Design quality', 'Practical examples', 'Clarity'],
    bank: [
      {
        question: 'Design the classes for a parking lot: multiple floors, spot sizes (bike, car, truck), and tickets issued at entry and paid at exit.',
        hint: 'Name the main classes, their relationships, and where polymorphism helps.'
      },
      {
        question: 'Explain the SOLID principles. Pick two and show a small example where violating them causes a real problem.',
        hint: 'Concrete code or class sketches beat definitions.'
      },
      {
        question: 'What is the difference between composition and inheritance? Give an example where inheritance is the wrong choice.',
        hint: 'Explain what breaks when the hierarchy has to change.'
      }
    ]
  },

  'cs-fundamentals': {
    title: 'CS Fundamentals',
    short: 'CS Core',
    kind: 'concept',
    minutes: 4,
    brief: 'Operating systems, databases, and networking. Explain how things actually work under the hood.',
    prompt: 'Ask one core computer science question from operating systems, DBMS, or computer networks, the kind asked in campus placement interviews.',
    rubric: ['Accuracy', 'Depth', 'Real-world connection', 'Clarity'],
    bank: [
      {
        question: 'What is the difference between a process and a thread? What does a context switch cost, and when would you choose multiple processes over multiple threads?',
        hint: 'Cover memory sharing and isolation.'
      },
      {
        question: 'How does a database index speed up reads? Explain the B+ tree structure and what indexes cost on writes.',
        hint: 'Mention when adding an index is a bad idea.'
      },
      {
        question: 'What happens, step by step, when you type a URL into a browser and press Enter?',
        hint: 'DNS, TCP, TLS, HTTP, and rendering. Go as deep as you can.'
      },
      {
        question: 'What is a deadlock? Explain the four necessary conditions and one way to prevent it.',
        hint: 'A small example with two locks helps.'
      }
    ]
  },

  javascript: {
    title: 'JavaScript',
    short: 'JavaScript',
    kind: 'concept',
    minutes: 5,
    brief: 'Language fundamentals that trip people up in real code.',
    prompt: 'Ask one JavaScript language question (event loop, closures, scope, `this`, promises, prototypes, etc.). Short code snippets in the question are encouraged.',
    rubric: ['Accuracy', 'Depth', 'Examples', 'Clarity'],
    bank: [
      {
        question: 'Explain the JavaScript event loop. In what order does this log, and why?\n\nconsole.log(1);\nsetTimeout(() => console.log(2), 0);\nPromise.resolve().then(() => console.log(3));\nconsole.log(4);',
        hint: 'Distinguish microtasks from macrotasks.'
      },
      {
        question: 'What is a closure? Show a practical use of one, and a common bug closures cause.',
        hint: 'The classic `var` inside a loop is a good example.'
      },
      {
        question: 'How is the value of `this` determined in JavaScript? Cover regular functions, arrow functions, object methods, and call/apply/bind.',
        hint: 'Show a case where `this` is not what you expect.'
      }
    ]
  },

  react: {
    title: 'React & Frontend Architecture',
    short: 'React',
    kind: 'concept',
    minutes: 6,
    brief: 'How React works and how you structure real frontend code.',
    prompt: 'Ask one practical React or frontend-architecture question: rendering, hooks, state management, data fetching, or performance.',
    rubric: ['Accuracy', 'Practical judgment', 'Performance awareness', 'Clarity'],
    bank: [
      {
        question: 'How does React decide what to re-render? Explain reconciliation, why keys matter in lists, and when React.memo or useMemo actually help.',
        hint: 'Mention when memoization is not worth it.'
      },
      {
        question: 'A component fetches data based on a prop. Walk through the useEffect code, its cleanup, the race condition when the prop changes quickly, and how you handle loading and errors.',
        hint: 'Code is welcome.'
      },
      {
        question: 'When would you lift state up, use React context, or use an external store like Redux or Zustand? What are the trade-offs?',
        hint: 'Think about re-renders and how many components need the data.'
      }
    ]
  },

  'web-fundamentals': {
    title: 'Web Fundamentals',
    short: 'Web',
    kind: 'concept',
    minutes: 5,
    brief: 'Browser, CSS, performance, and accessibility.',
    prompt: 'Ask one web platform question covering HTML/CSS layout, browser rendering, web performance, or accessibility.',
    rubric: ['Accuracy', 'Practical approach', 'Depth', 'Clarity'],
    bank: [
      {
        question: 'A page loads slowly on mobile. How do you diagnose it, and what would you fix?',
        hint: 'Mention Core Web Vitals and the tools you would use.'
      },
      {
        question: 'Explain the CSS box model, then the difference between Flexbox and Grid. When would you use each?',
        hint: 'A layout example for each helps.'
      },
      {
        question: 'How do you make a custom dropdown accessible to keyboard and screen-reader users?',
        hint: 'Cover focus management, keyboard controls, and ARIA.'
      }
    ]
  },

  backend: {
    title: 'APIs & Backend Engineering',
    short: 'Backend',
    kind: 'concept',
    minutes: 6,
    brief: 'API design, authentication, and building reliable services.',
    prompt: 'Ask one practical backend engineering question: REST/API design, authentication, caching, queues, reliability, or security.',
    rubric: ['Correctness', 'Design quality', 'Reliability & security', 'Clarity'],
    bank: [
      {
        question: 'Design a REST API for a to-do app with users, lists, and tasks. Show the endpoints, status codes, and how you handle pagination and validation.',
        hint: 'Be specific about URLs and HTTP methods.'
      },
      {
        question: 'How does JWT authentication work? Where should the client store the token, and how do you handle expiry and refresh?',
        hint: 'Discuss XSS and CSRF risks.'
      },
      {
        question: 'Your endpoint calls a slow, sometimes-failing third-party payment API. How do you make it reliable?',
        hint: 'Cover timeouts, retries, idempotency keys, and queues.'
      }
    ]
  },

  databases: {
    title: 'Databases',
    short: 'Databases',
    kind: 'concept',
    minutes: 6,
    brief: 'Schema design, indexing, transactions, and choosing the right store.',
    prompt: 'Ask one database question for a backend engineer: schema design, indexing, transactions and isolation, or SQL versus NoSQL trade-offs.',
    rubric: ['Correctness', 'Data modeling', 'Performance', 'Trade-offs'],
    bank: [
      {
        question: 'Design a relational schema for an e-commerce app with users, products, orders, and order items. Which indexes would you add, and why?',
        hint: 'Show tables, keys, and relationships.'
      },
      {
        question: 'Explain ACID and transaction isolation levels. Give an example of a bug that appears at a weaker isolation level.',
        hint: 'Lost updates or phantom reads make good examples.'
      },
      {
        question: 'For a chat application\'s message store, would you pick SQL or NoSQL? Justify the choice.',
        hint: 'Think about access patterns and scale.'
      }
    ]
  },

  sql: {
    title: 'SQL',
    short: 'SQL',
    kind: 'coding',
    minutes: 6,
    brief: 'Write real queries. Watch for NULLs, duplicates, and ties.',
    prompt: 'Ask one SQL question. Define the table schema in the question and ask the candidate to write a query (joins, aggregation, window functions, subqueries).',
    rubric: ['Query correctness', 'SQL technique', 'Edge cases', 'Clarity'],
    bank: [
      {
        question: 'Tables: employees(id, name, department_id, salary) and departments(id, name). Write a query that returns the highest-paid employee in each department, including ties.',
        hint: 'A window function or a correlated subquery both work.'
      },
      {
        question: 'Table: orders(order_id, customer_id, order_date, amount). Write a query that returns monthly revenue and the month-over-month growth percentage.',
        hint: 'Think about the first month, which has no previous month.'
      },
      {
        question: 'Explain INNER, LEFT, and FULL OUTER JOIN, and the difference between WHERE and HAVING. Give a short query for each.',
        hint: 'Show what happens to unmatched rows.'
      }
    ]
  },

  statistics: {
    title: 'Statistics & Probability',
    short: 'Statistics',
    kind: 'concept',
    minutes: 5,
    brief: 'Statistical reasoning applied to real product and business decisions.',
    prompt: 'Ask one applied statistics or probability question: hypothesis testing, A/B testing, distributions, or sampling.',
    rubric: ['Statistical correctness', 'Intuition', 'Application', 'Clarity'],
    bank: [
      {
        question: 'Explain a p-value to a product manager. What does p = 0.03 mean, and what does it not mean?',
        hint: 'Avoid jargon but stay correct.'
      },
      {
        question: 'You are A/B testing a new checkout button. How do you choose the sample size and duration, and what could make the result misleading?',
        hint: 'Mention statistical power and peeking.'
      },
      {
        question: 'Mean versus median: when is each the better summary? Give a real example with a skewed distribution.',
        hint: 'Salaries and delivery times are good examples.'
      }
    ]
  },

  'analytics-case': {
    title: 'Analytics Case',
    short: 'Case',
    kind: 'case',
    minutes: 7,
    brief: 'A business problem to break down with data. Structure first, then metrics and hypotheses.',
    prompt: 'Give one realistic business or analytics case where the candidate must structure the problem, pick metrics, form hypotheses, and say what data they would pull.',
    rubric: ['Structured thinking', 'Metric choice', 'Hypotheses & data', 'Recommendation'],
    bank: [
      {
        question: 'Daily active users of a food delivery app dropped 15% week over week. How would you investigate?',
        hint: 'Rule out data issues first, then segment.'
      },
      {
        question: 'An e-commerce company launched a loyalty program. How would you tell whether it is working?',
        hint: 'Think about a control group and what "working" means.'
      },
      {
        question: 'The sales team asks you for a dashboard. How do you decide what goes on it?',
        hint: 'Start from the decisions they need to make.'
      }
    ]
  },

  ml: {
    title: 'Machine Learning',
    short: 'ML',
    kind: 'concept',
    minutes: 6,
    brief: 'Core ML concepts and practical modeling judgment.',
    prompt: 'Ask one machine learning question covering model fundamentals, evaluation, feature engineering, or an end-to-end modeling scenario.',
    rubric: ['Conceptual accuracy', 'Practical judgment', 'Evaluation', 'Clarity'],
    bank: [
      {
        question: 'Explain the bias–variance trade-off. How do you detect overfitting, and what do you do about it?',
        hint: 'Refer to training versus validation curves.'
      },
      {
        question: 'You are building a fraud detection model where 0.5% of transactions are fraudulent. Which metrics do you use, and how do you handle the class imbalance?',
        hint: 'Explain why accuracy is misleading here.'
      },
      {
        question: 'Walk through how you would build a model that predicts customer churn, from raw data to deployment.',
        hint: 'Include how you define churn and how you monitor the model.'
      }
    ]
  },

  requirements: {
    title: 'Requirements & Process',
    short: 'Requirements',
    kind: 'case',
    minutes: 5,
    brief: 'Turning vague asks into clear, testable requirements and managing stakeholders.',
    prompt: 'Ask one business analysis question about gathering requirements, writing user stories, process modeling, or stakeholder management.',
    rubric: ['Stakeholder understanding', 'Structured approach', 'Clarity of requirements', 'Communication'],
    bank: [
      {
        question: 'A stakeholder says, "We need a report of everything." How do you turn that into clear requirements?',
        hint: 'What questions do you ask, and what do you deliver?'
      },
      {
        question: 'Explain functional versus non-functional requirements. Write two of each for a loan application portal.',
        hint: 'Make them specific and testable.'
      },
      {
        question: 'Two department heads want conflicting features in the same release. How do you handle it?',
        hint: 'Think about data, priorities, and who decides.'
      }
    ]
  },

  'product-sense': {
    title: 'Product Sense',
    short: 'Product',
    kind: 'case',
    minutes: 7,
    brief: 'Designing and improving products. Start from users and their problems.',
    prompt: 'Ask one product sense question: improve an existing product or design a new product for a specific user group.',
    rubric: ['User focus', 'Structured thinking', 'Creativity', 'Prioritization'],
    bank: [
      {
        question: 'How would you improve Google Maps for daily commuters?',
        hint: 'Pick a user segment, find their pain points, then prioritize solutions.'
      },
      {
        question: 'Design a product that helps college students find internships.',
        hint: 'Who are the users on each side, and what is the MVP?'
      },
      {
        question: 'What is a product you love? Why, and what would you change about it?',
        hint: 'Be specific about the user and the problem.'
      }
    ]
  },

  metrics: {
    title: 'Metrics & Analytics',
    short: 'Metrics',
    kind: 'case',
    minutes: 6,
    brief: 'Defining success and diagnosing changes in the numbers.',
    prompt: 'Ask one product metrics question: define success metrics for a feature, or diagnose an unexpected metric change.',
    rubric: ['Metric selection', 'Structured thinking', 'Trade-off awareness', 'Clarity'],
    bank: [
      {
        question: 'Which metrics would you track to measure the success of Instagram Reels?',
        hint: 'Name one north-star metric and a few guardrail metrics.'
      },
      {
        question: 'Ride cancellations on Uber rose 10% this week. How do you investigate?',
        hint: 'Separate rider-side from driver-side causes.'
      },
      {
        question: 'A feature increases engagement but decreases revenue. How do you decide whether to keep it?',
        hint: 'Think long-term versus short-term.'
      }
    ]
  },

  execution: {
    title: 'Execution & Prioritization',
    short: 'Execution',
    kind: 'case',
    minutes: 5,
    brief: 'Prioritizing, shipping, and handling things going wrong.',
    prompt: 'Ask one product execution question about prioritization, roadmap trade-offs, launches, or handling delays and conflicts.',
    rubric: ['Prioritization', 'Stakeholder management', 'Pragmatism', 'Clarity'],
    bank: [
      {
        question: 'You have 10 feature requests and capacity for 3 this quarter. How do you decide which to build?',
        hint: 'Name a framework, but show judgment beyond it.'
      },
      {
        question: 'Engineering tells you a key launch will slip by three weeks. What do you do?',
        hint: 'Think about scope, communication, and options.'
      },
      {
        question: 'How would you plan the launch of a new payments feature?',
        hint: 'Cover rollout, risk, and success criteria.'
      }
    ]
  },

  behavioral: {
    title: 'Behavioral',
    short: 'Behavioral',
    kind: 'behavioral',
    minutes: 4,
    brief: 'Real stories from your experience. Use the STAR format: Situation, Task, Action, Result.',
    prompt: 'Ask one behavioral question about teamwork, ownership, conflict, failure, or learning. Candidates may draw on college projects and internships.',
    rubric: ['Situation & context', 'Ownership of actions', 'Result & impact', 'Reflection'],
    bank: [
      {
        question: 'Tell me about a time you disagreed with a teammate. How did you resolve it?',
        hint: 'Use STAR. Focus on what you did.'
      },
      {
        question: 'Tell me about the most challenging project you have worked on. What was your role, and what would you do differently?',
        hint: 'College projects and internships count.'
      },
      {
        question: 'Describe a time you failed or missed a deadline. What happened, and what did you learn?',
        hint: 'Be honest about your part in it.'
      },
      {
        question: 'Tell me about a time you had to learn something new very quickly.',
        hint: 'Explain how you learned, not just that you did.'
      }
    ]
  }
};

const ROLES = [
  {
    id: 'sde',
    title: 'Software Development Engineer',
    aliases: ['SDE'],
    blurb: 'The classic SDE loop: problem solving, design, OOP, and CS fundamentals.',
    sections: [['dsa', 2], ['system-design', 2], ['oop', 2], ['cs-fundamentals', 2], ['behavioral', 1]]
  },
  {
    id: 'frontend',
    title: 'Frontend Developer',
    aliases: [],
    blurb: 'JavaScript depth, React, and the web platform, plus a coding round.',
    sections: [['javascript', 2], ['react', 2], ['web-fundamentals', 2], ['dsa', 1], ['behavioral', 1]]
  },
  {
    id: 'backend',
    title: 'Backend Developer',
    aliases: [],
    blurb: 'Algorithms, APIs, databases, and designing systems that scale.',
    sections: [['dsa', 2], ['backend', 2], ['databases', 2], ['system-design', 2], ['behavioral', 1]]
  },
  {
    id: 'data-analyst',
    title: 'Data Analyst',
    aliases: ['Data Analyst'],
    blurb: 'SQL, statistics, and turning business questions into analysis.',
    sections: [['sql', 2], ['statistics', 2], ['analytics-case', 2], ['behavioral', 1]]
  },
  {
    id: 'data-scientist',
    title: 'Data Scientist',
    aliases: [],
    blurb: 'Statistics, machine learning, and the SQL to get the data.',
    sections: [['statistics', 2], ['ml', 2], ['sql', 2], ['behavioral', 1]]
  },
  {
    id: 'business-analyst',
    title: 'Business Analyst',
    aliases: ['Business Analyst'],
    blurb: 'Requirements, stakeholders, and data-driven business cases.',
    sections: [['requirements', 2], ['analytics-case', 2], ['sql', 1], ['behavioral', 2]]
  },
  {
    id: 'product-manager',
    title: 'Product Manager',
    aliases: ['Product Manager'],
    blurb: 'Product sense, metrics, execution, and leadership stories.',
    sections: [['product-sense', 2], ['metrics', 2], ['execution', 2], ['behavioral', 2]]
  }
];

const LEVELS = {
  easy: { label: 'Entry level', prompt: 'an entry-level candidate (fresher or new graduate, 0-1 years of experience)' },
  medium: { label: 'Mid level', prompt: 'a mid-level candidate (2-4 years of experience)' },
  hard: { label: 'Senior', prompt: 'a senior candidate (5+ years of experience) who is expected to show depth and trade-offs' }
};

function getRole(idOrAlias) {
  if (!idOrAlias) return null;
  const needle = String(idOrAlias).trim().toLowerCase();
  return ROLES.find(r =>
    r.id === needle ||
    r.title.toLowerCase() === needle ||
    r.aliases.some(a => a.toLowerCase() === needle)
  ) || null;
}

function getSection(key) {
  return SECTIONS[key] || null;
}

function buildPlan(role) {
  return role.sections.map(([key, count]) => {
    const s = SECTIONS[key];
    return { key, title: s.title, short: s.short, kind: s.kind, brief: s.brief, count };
  });
}

// Maps a zero-based question index onto its section within a plan.
function locateQuestion(plan, index) {
  let offset = 0;
  for (let i = 0; i < plan.length; i += 1) {
    if (index < offset + plan[i].count) {
      return { sectionIndex: i, section: plan[i], indexInSection: index - offset };
    }
    offset += plan[i].count;
  }
  return null;
}

function publicCatalog() {
  return {
    levels: Object.entries(LEVELS).map(([id, l]) => ({ id, label: l.label })),
    roles: ROLES.map(role => {
      const plan = buildPlan(role);
      return {
        id: role.id,
        title: role.title,
        blurb: role.blurb,
        sections: plan.map(s => ({ ...s, rubric: SECTIONS[s.key].rubric })),
        totalQuestions: plan.reduce((n, s) => n + s.count, 0),
        estimatedMinutes: role.sections.reduce((n, [key, count]) => n + SECTIONS[key].minutes * count, 0)
      };
    })
  };
}

const USER_TARGET_ROLES = [
  ...ROLES.map(r => r.id),
  ...ROLES.flatMap(r => r.aliases),
  'Not Set'
].filter((v, i, a) => a.indexOf(v) === i);

module.exports = {
  SECTIONS,
  ROLES,
  LEVELS,
  USER_TARGET_ROLES,
  getRole,
  getSection,
  buildPlan,
  locateQuestion,
  publicCatalog
};

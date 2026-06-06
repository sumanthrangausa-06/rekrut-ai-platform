# Rekrut AI Prompt Engineering — Examples & Cost Estimates

## Files Created

| File | Size | Functions |
|------|------|-----------|
| `interviewPrompts.ts` | ~9.3 KB | `getInterviewSystemMessage`, `generateInterviewQuestions`, `gradeInterviewAnswer`, `generateInterviewFeedback` |
| `assessmentPrompts.ts` | ~8.6 KB | `getAssessmentSystemMessage`, `generateSkillAssessment`, `gradeOpenEndedAnswer` |
| `matchingPrompts.ts` | ~6.2 KB | `getMatchingSystemMessage`, `generateProfileSummary`, `calculateJobMatch` |
| `index.ts` | ~1.3 KB | Barrel re-exports for all modules |

---

## API Usage Pattern

```typescript
import OpenAI from 'openai';
import {
  getInterviewSystemMessage,
  generateInterviewQuestions,
} from './prompts';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const jobRole = 'Senior Frontend Engineer';
const experienceLevel = 'senior';

const response = await openai.chat.completions.create({
  model: 'gpt-4o-mini',
  messages: [
    { role: 'system', content: getInterviewSystemMessage(jobRole) },
    { role: 'user', content: generateInterviewQuestions(jobRole, experienceLevel) },
  ],
  response_format: { type: 'json_object' },  // Enforces JSON output
  temperature: 0.7,  // Balanced creativity/consistency
});

const questions = JSON.parse(response.choices[0].message.content);
```

---

## Example: generateInterviewQuestions

### Input
```typescript
generateInterviewQuestions('Senior Frontend Engineer', 'senior');
```

### Sample Output
```json
{
  "questions": [
    {
      "id": "q1",
      "question": "Tell me about a time you had to push back on a design decision that would have hurt performance or accessibility. What was the situation, and how did you handle it?",
      "category": "behavioral",
      "difficulty": "medium",
      "context": "Senior frontend engineers must advocate for user experience and technical quality when working with designers and product managers.",
      "followUpPrompts": [
        "What was the outcome? Did the team change the design?",
        "How do you balance aesthetic goals with performance budgets?"
      ]
    },
    {
      "id": "q2",
      "question": "Describe a situation where you mentored a junior developer who was struggling with React concepts. How did you approach it?",
      "category": "behavioral",
      "difficulty": "medium",
      "context": "Senior engineers are expected to uplevel the team through mentoring and knowledge sharing.",
      "followUpPrompts": [
        "What specific techniques did you use to help them understand?",
        "How did you measure their improvement over time?"
      ]
    },
    {
      "id": "q3",
      "question": "Your team needs to build a real-time collaborative editor (like Google Docs) with 1000+ concurrent users. Walk me through your technical approach — architecture, data sync, conflict resolution.",
      "category": "technical",
      "difficulty": "hard",
      "context": "Tests system design skills for a complex, real-world frontend problem requiring deep architectural thinking.",
      "followUpPrompts": [
        "How would you handle offline editing and subsequent sync?",
        "What trade-offs would you consider between latency and consistency?"
      ]
    },
    {
      "id": "q4",
      "question": "You inherit a legacy React codebase using class components and Redux. The product team wants to ship a major new feature in 3 months. How do you decide what to refactor vs. what to leave as-is?",
      "category": "technical",
      "difficulty": "hard",
      "context": "Senior engineers must make pragmatic technical decisions balancing business delivery with technical health.",
      "followUpPrompts": [
        "What criteria do you use to prioritize refactoring work?",
        "How do you communicate technical debt to non-technical stakeholders?"
      ]
    },
    {
      "id": "q5",
      "question": "You're leading the frontend for a new product. Two weeks before launch, Lighthouse reports a performance score of 45 on mobile. Walk me through your diagnosis and remediation plan.",
      "category": "situational",
      "difficulty": "medium",
      "context": "Tests ability to diagnose and fix performance issues under time pressure — a common real-world scenario.",
      "followUpPrompts": [
        "Which metrics would you prioritize and why?",
        "How would you prevent this from happening in future releases?"
      ]
    }
  ]
}
```

---

## Example: gradeInterviewAnswer

### Input
```typescript
gradeInterviewAnswer(
  "Tell me about a time you had to optimize a slow React application. What was your approach?",
  "I used React.memo on some components and lazy loading with Suspense. Also used the React DevTools profiler to find slow renders. Reduced initial load time from 4s to 2s.",
  "Senior Frontend Engineer"
);
```

### Sample Output
```json
{
  "score": 7,
  "strengths": [
    "You mentioned specific optimization techniques (React.memo, lazy loading, Suspense) that show hands-on experience with React performance.",
    "Including the metric (4s to 2s) demonstrates results-oriented thinking and quantifies your impact.",
    "Using React DevTools profiler shows you approach performance work methodically rather than guessing."
  ],
  "improvements": [
    "Describe the specific scenario that caused the slowness — was it large lists, unnecessary re-renders, bundle size, or something else? Context helps interviewers understand your diagnosis skills.",
    "Mention trade-offs: React.memo adds complexity. When would you NOT use it?",
    "Discuss how you measured and validated the improvement. Did you set up monitoring to prevent regression?"
  ],
  "modelAnswer": "At my previous company, our dashboard app had grown to the point where initial load was taking over 4 seconds on 3G connections. I started by using the React DevTools Profiler to identify the bottlenecks — turns out we had a large table component re-rendering on every keystroke in a search filter, and our main bundle was over 800KB because everything was imported eagerly. I broke the problem into three parts: first, I used React.memo and useMemo strategically on the table and chart components with custom comparison functions where needed. Second, I implemented route-based code splitting with React.lazy and Suspense, which cut our initial bundle to about 250KB. Third, I virtualized the long lists using react-window since we were rendering hundreds of rows. The result was we dropped initial load to under 2 seconds and interaction times improved significantly. I also set up Lighthouse CI in our pipeline to catch performance regressions before they hit production.",
  "detailedFeedback": "You gave a solid answer with concrete techniques and a quantified result, which is exactly what interviewers want to hear. To level up, add more context about the root cause, discuss trade-offs of your chosen solutions, and mention how you prevented the problem from recurring. These details show senior-level thinking."
}
```

---

## Example: generateInterviewFeedback

### Input
```typescript
generateInterviewFeedback([
  { question: "Q1 behavioral", answer: "Good answer with STAR method", score: 8 },
  { question: "Q2 behavioral", answer: "Decent but lacked specifics", score: 6 },
  { question: "Q3 technical", answer: "Strong system design discussion", score: 8 },
  { question: "Q4 technical", answer: "Okay but missed trade-offs", score: 6 },
  { question: "Q5 situational", answer: "Weak performance answer", score: 5 },
]);
```

### Sample Output
```json
{
  "overallScore": 6.5,
  "summary": "You demonstrated solid technical knowledge and structured thinking, particularly in system design questions. Your behavioral answers were strongest when you used specific examples. The main area for growth is adding more depth and specificity to your technical trade-off discussions.",
  "topStrengths": [
    "Strong system design thinking — your architecture answer showed clear understanding of scalability trade-offs",
    "Good use of STAR method in behavioral questions, especially Q1 where you structured the narrative well",
    "You quantified results when possible, which adds credibility to your answers"
  ],
  "keyImprovements": [
    "Add more specificity to behavioral answers — name the technologies, team size, and timeline rather than speaking generally",
    "When discussing technical decisions, always mention trade-offs. No solution is perfect — interviewers want to see that you understand the costs",
    "Your situational answer was too brief. Practice walking through your thought process step-by-step, even if you're not sure of the 'right' answer"
  ],
  "roleSpecificAdvice": "For a Senior Frontend Engineer position, focus on demonstrating both deep React expertise AND broad frontend ecosystem knowledge. Practice explaining performance optimization with specific metrics, and be ready to discuss how you balance technical excellence with product delivery timelines.",
  "nextSteps": [
    "Practice the 'Trade-offs Framework' — for every technical decision, proactively discuss at least 2 alternative approaches and why you rejected them",
    "Prepare 5-6 detailed STAR stories from your career covering leadership, conflict resolution, technical challenge, and failure/recovery scenarios",
    "Review common frontend system design patterns (rendering strategies, state management at scale, micro-frontends) and practice explaining them aloud"
  ]
}
```

---

## Example: generateSkillAssessment

### Input
```typescript
generateSkillAssessment('Frontend Engineer', 'mid');
```

### Sample Output (truncated to 2 questions)
```json
{
  "title": "Frontend Engineer Skills Assessment",
  "description": "A comprehensive assessment evaluating key skills for mid-level Frontend Engineer positions. Covers React patterns, performance optimization, state management, and testing. Estimated time: 45-60 minutes.",
  "questions": [
    {
      "id": "mcq1",
      "type": "multiple_choice",
      "question": "A React component re-renders excessively whenever a parent updates, even though its props haven't changed. Which approach correctly solves this with the least complexity?",
      "options": [
        "A) Convert the component to use useReducer instead of useState",
        "B) Move the component's state into a global Redux store",
        "C) Wrap the component with React.memo and provide a custom comparison function if needed",
        "D) Use useCallback on all functions passed as props to the component"
      ],
      "correctAnswer": "C",
      "explanation": "React.memo is specifically designed to prevent re-renders when props haven't changed. Option A doesn't address the re-render issue. Option B adds unnecessary complexity. Option D helps with referential equality but doesn't prevent re-renders by itself.",
      "difficulty": "medium",
      "skillArea": "React Performance"
    },
    {
      "id": "oe1",
      "type": "open_ended",
      "question": "Describe how you would architect state management for a mid-size e-commerce application with user authentication, a shopping cart, product catalog with filters, and an order history page. Explain your choices and trade-offs.",
      "rubric": {
        "criteria": [
          "Identifies appropriate state categorization (local vs global vs server)",
          "Chooses suitable state management solution with justification",
          "Discusses data fetching and caching strategy",
          "Addresses performance considerations",
          "Considers maintainability and team scalability"
        ],
        "maxPoints": 10
      },
      "sampleGoodAnswer": "I would start by categorizing state: server state (products, orders, user data) managed with React Query or SWR for caching and synchronization; client global state (auth, cart) managed with Zustand or Context + useReducer for simplicity; and local component state with useState. React Query handles caching, background refetching, and optimistic updates out of the box. The cart needs global state because multiple components (header badge, cart page, add-to-cart buttons) read from it. I'd persist cart state to localStorage for UX. For the product filters, I'd keep filter state in the URL query parameters so filtered views are shareable and bookmarkable. This approach keeps the architecture simple — we avoid Redux boilerplate while getting powerful server-state management from React Query."
    }
  ]
}
```

---

## Example: gradeOpenEndedAnswer

### Input
```typescript
gradeOpenEndedAnswer(
  "Describe how you would architect state management for a mid-size e-commerce application...",
  {
    criteria: [
      "Identifies appropriate state categorization",
      "Chooses suitable state management solution",
      "Discusses data fetching and caching",
      "Addresses performance",
      "Considers maintainability"
    ],
    maxPoints: 10
  },
  "I would use Redux for everything. It's predictable and has great devtools. For the cart, I'd store it in Redux. For products, I'd also use Redux with thunks for async operations. I think this approach is good because Redux is the industry standard."
);
```

### Sample Output
```json
{
  "score": 4,
  "criteriaScores": [
    {
      "criterion": "Identifies appropriate state categorization",
      "score": 1,
      "maxPoints": 2,
      "feedback": "You mentioned storing everything in Redux but didn't distinguish between different types of state (server, client global, local). Modern frontend architecture separates these concerns."
    },
    {
      "criterion": "Chooses suitable state management solution",
      "score": 1,
      "maxPoints": 2,
      "feedback": "Redux is a valid choice but using it for ALL state including server state is outdated. Tools like React Query or SWR are now preferred for server state. Your answer should acknowledge modern alternatives."
    },
    {
      "criterion": "Discusses data fetching and caching strategy",
      "score": 1,
      "maxPoints": 2,
      "feedback": "Mentioning thunks shows awareness of async Redux patterns, but you didn't discuss caching, deduping requests, background refetching, or optimistic updates — all critical for e-commerce."
    },
    {
      "criterion": "Addresses performance considerations",
      "score": 0,
      "maxPoints": 2,
      "feedback": "No performance discussion. For e-commerce, re-render optimization, bundle size, and caching strategies are essential."
    },
    {
      "criterion": "Considers maintainability and team scalability",
      "score": 1,
      "maxPoints": 2,
      "feedback": "Mentioning Redux devtools is valid, but you didn't discuss how the architecture scales with team size or how new developers onboard."
    }
  ],
  "overallFeedback": "You showed familiarity with Redux, which is a good starting point. However, modern frontend architecture distinguishes between server state and client state, and uses specialized tools for each. I'd recommend learning about React Query or SWR for server state, and reserving Redux or Zustand for truly global client state. Also, practice discussing trade-offs — every architectural choice has pros and cons.",
  "modelAnswer": "I would start by categorizing state into three buckets: server state (products, orders, user data), global client state (auth, shopping cart), and local component state (form inputs, UI toggles). For server state, I'd use React Query — it handles caching, background refetching, stale-while-revalidate, and optimistic updates out of the box, which eliminates a lot of boilerplate. For global client state like auth and cart, Zustand or Jotai would be my choice — they're simpler than Redux with less boilerplate but still powerful. The cart specifically needs global state because the cart icon in the header, the cart page, and add-to-cart buttons all need access. I'd persist the cart to localStorage so users don't lose it on refresh. For URL-shareable state like product filters, I'd sync those to query parameters. This architecture keeps concerns separated: React Query owns server data, Zustand owns shared client state, and useState owns component-local state. It's maintainable because each tool has a clear responsibility."
}
```

---

## Example: generateProfileSummary

### Input
```typescript
generateProfileSummary(`
John Doe
Senior Software Engineer, TechCorp (2020-Present)
- Led migration from monolith to microservices serving 2M daily users
- Built real-time notification system using WebSockets and Redis
- Mentored 4 junior engineers

Software Engineer, StartupXYZ (2017-2020)
- Developed REST APIs using Node.js and PostgreSQL
- Implemented CI/CD pipelines with GitHub Actions
- Reduced API latency by 60% through query optimization

BS Computer Science, State University (2017)
Skills: JavaScript, TypeScript, Node.js, React, PostgreSQL, Redis, Docker, AWS, GraphQL
`);
```

### Sample Output
```json
{
  "skills": [
    "JavaScript",
    "TypeScript",
    "Node.js",
    "React",
    "PostgreSQL",
    "Redis",
    "Docker",
    "AWS",
    "GraphQL",
    "WebSockets",
    "Microservices Architecture",
    "CI/CD (GitHub Actions)",
    "Mentoring",
    "Performance Optimization",
    "API Design"
  ],
  "experienceYears": 7,
  "keyAchievements": [
    "Led migration from monolith to microservices serving 2M daily users",
    "Built real-time notification system using WebSockets and Redis",
    "Mentored 4 junior engineers",
    "Reduced API latency by 60% through query optimization"
  ],
  "education": "BS Computer Science, State University (2017)",
  "roleFit": [
    "Senior Backend Engineer",
    "Full Stack Engineer",
    "Staff Engineer",
    "Engineering Manager (technical track)"
  ]
}
```

---

## Example: calculateJobMatch

### Input
```typescript
calculateJobMatch(
  {
    skills: ["JavaScript", "TypeScript", "Node.js", "React", "PostgreSQL", "Redis", "Docker", "AWS"],
    experienceYears: 7,
    keyAchievements: ["Led microservices migration for 2M users", "Reduced API latency by 60%"],
    education: "BS Computer Science",
    roleFit: ["Senior Backend Engineer", "Full Stack Engineer"]
  },
  `Senior Full Stack Engineer at FinTech Startup
  Requirements:
  - 5+ years experience with Node.js and React
  - Strong TypeScript skills
  - Experience with PostgreSQL and Redis
  - Docker and Kubernetes experience
  - GraphQL API development
  - Experience in financial services or high-transaction systems
  - AWS infrastructure knowledge`
);
```

### Sample Output
```json
{
  "matchScore": 82,
  "skillMatches": [
    { "skill": "Node.js", "match": "strong" },
    { "skill": "React", "match": "strong" },
    { "skill": "TypeScript", "match": "strong" },
    { "skill": "PostgreSQL", "match": "strong" },
    { "skill": "Redis", "match": "strong" },
    { "skill": "Docker", "match": "strong" },
    { "skill": "GraphQL", "match": "partial" },
    { "skill": "Kubernetes", "match": "missing" },
    { "skill": "AWS", "match": "strong" },
    { "skill": "Financial services experience", "match": "missing" }
  ],
  "experienceMatch": "The candidate has 7 years of experience, exceeding the 5+ year requirement. Their experience includes backend API development and frontend work, aligning well with a full stack role.",
  "gapAreas": [
    "No Kubernetes experience listed — the role requires container orchestration. Docker experience provides a foundation but K8s knowledge would need to be acquired.",
    "No financial services domain experience — though their high-transaction system experience (2M daily users) partially transfers.",
    "GraphQL experience is listed but should be validated in interview — only partial match if limited to basic usage."
  ],
  "recommendation": "Strong match overall — recommend scheduling an interview. The candidate exceeds the experience requirement and matches most technical skills. The main gap is Kubernetes, which is learnable given their Docker experience. Their microservices migration experience at scale is a significant asset for a FinTech environment. Consider assessing GraphQL depth and financial domain learning ability during the interview."
}
```

---

## Cost Estimates (GPT-4o-mini)

**Pricing**: $0.15 / 1M input tokens | $0.60 / 1M output tokens

| Function | Est. Input Tokens | Est. Output Tokens | Cost per Call | Notes |
|----------|-------------------|--------------------|---------------|-------|
| `generateInterviewQuestions` | ~400 | ~800 | $0.00054 | One-time per interview session |
| `gradeInterviewAnswer` | ~350 + answer length | ~600 | $0.00041-$0.00041 | Called per answer (5x per interview = ~$0.002) |
| `generateInterviewFeedback` | ~800 + all Q&A | ~500 | $0.00042 | One-time per completed interview |
| `generateSkillAssessment` | ~400 | ~2,500 | $0.00156 | One-time per assessment creation |
| `gradeOpenEndedAnswer` | ~400 + answer | ~700 | $0.00048 | Called per open-ended answer (3x per assessment = ~$0.0014) |
| `generateProfileSummary` | ~800 + resume | ~400 | $0.00036 | Once per resume upload — **cache this** |
| `calculateJobMatch` | ~500 + job desc | ~500 | $0.00038 | Once per job application |

### Session Cost Estimates

| Session Type | Total API Calls | Total Cost |
|--------------|----------------|------------|
| **Interview Coaching** (1 session: 5 questions + 5 grades + 1 feedback) | 7 calls | **~$0.0033** (0.3 cents) |
| **Skill Assessment** (1 assessment: creation + 3 graded open-ended) | 4 calls | **~$0.0030** (0.3 cents) |
| **Profile Matching** (resume parse + job match) | 2 calls | **~$0.0007** (0.07 cents) |
| **Full Candidate Flow** (interview + assessment + matching) | 13 calls | **~$0.007** (0.7 cents) |

### Monthly Cost Projections

| Monthly Volume | Interview Sessions | Assessments | Profile Matches | Total Monthly Cost |
|----------------|-------------------|-------------|-----------------|-------------------|
| 1,000 users | $3.30 | $3.00 | $0.70 | **~$7.00** |
| 10,000 users | $33.00 | $30.00 | $7.00 | **~$70.00** |
| 50,000 users | $165.00 | $150.00 | $35.00 | **~$350.00** |
| 100,000 users | $330.00 | $300.00 | $70.00 | **~$700.00** |

### Cost Optimization Tips

1. **Cache embeddings & summaries**: `generateProfileSummary` results should be cached in Redis/DB. Resumes don't change often.
2. **Cache assessments**: `generateSkillAssessment` for common role/level combos (e.g., "Senior Frontend Engineer") can be cached and reused.
3. **Use streaming for real-time UX**: Stream grading feedback so users see results immediately without waiting for full generation.
4. **Temperature tuning**: Use `temperature: 0.5` for assessments (consistency matters) and `temperature: 0.7` for interview questions (variety matters).
5. **Response validation**: Always parse JSON with try/catch. If parsing fails, retry once with `temperature: 0.3` for more deterministic output.
6. **Token trimming**: Truncate resumes to ~3000 tokens before sending. Most relevant info is in the first 2/3 of a resume.

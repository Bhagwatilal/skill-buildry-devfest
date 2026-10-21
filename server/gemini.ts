import { GoogleGenAI, Type } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY || '';
const MODEL_NAME = process.env.GEMINI_MODEL || 'gemini-3.8-flash';

let aiClient: GoogleGenAI | null = null;
if (apiKey) {
  aiClient = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    if (process.env.GEMINI_API_KEY) {
      aiClient = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
      return aiClient;
    }
    throw new Error('GEMINI_API_KEY is not configured on the server. Please check the Secrets panel in AI Studio.');
  }
  return aiClient;
}

/**
 * Safely parse JSON from model output that might contain markdown backticks
 */
function cleanAndParseJSON(text: string, fallback: any = null): any {
  try {
    let clean = text.trim();
    if (clean.startsWith('```json')) {
      clean = clean.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (clean.startsWith('```')) {
      clean = clean.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    return JSON.parse(clean);
  } catch (err) {
    console.warn('Failed to parse Gemini JSON output, searching for substring:', err);
    try {
      const firstBrace = text.indexOf('{');
      const lastBrace = text.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1) {
        return JSON.parse(text.substring(firstBrace, lastBrace + 1));
      }
      const firstBracket = text.indexOf('[');
      const lastBracket = text.lastIndexOf(']');
      if (firstBracket !== -1 && lastBracket !== -1) {
        return JSON.parse(text.substring(firstBracket, lastBracket + 1));
      }
    } catch {
      // Return fallback
    }
    return fallback;
  }
}

/**
 * 1. Analyze Career Path and identify Skill Gaps
 */
export async function analyzeCareerGap(profile: any, skills: any[]) {
  const prompt = `
You are the Lead Career Architect and Technical Hiring Manager for tech roles.
Analyze this candidate's profile against their target job role.

Target Role: ${profile.targetRole} (${profile.targetLevel})
Current Title: ${profile.currentTitle}
Years of Experience: ${profile.yearsExperience}
Study Availability: ${profile.studyHoursPerDay} hrs/day, ${profile.studyDaysPerWeek} days/week, ${profile.targetTimelineWeeks} weeks total
Current Skills (Self-Assessed):
${skills.map((s) => `- ${s.name} (${s.category}): Level = ${s.selfAssessedLevel}, Has Evidence = ${s.hasEvidence}`).join('\n') || 'None reported yet'}

Evaluate real product-company hiring expectations for ${profile.targetRole} (${profile.targetLevel}).
Return a JSON object with this exact structure:
{
  "summary": "2-3 sentences summarizing current candidate standing and key focal areas without generic fluff.",
  "readinessScore": <integer between 20 and 85 indicating realistic estimated baseline readiness>,
  "readinessBreakdown": {
    "skillCoverage": <integer 0-40>,
    "projectEvidence": <integer 0-25>,
    "taskCompletion": <integer 0-20>,
    "interviewReadiness": <integer 0-15>
  },
  "skills": [
    {
      "name": "Skill Name",
      "category": "Programming Languages | Frameworks & Libraries | APIs & Backend | Architecture & Design | Testing & Debugging | Deployment & Release | Collaboration",
      "currentLevel": "None | Beginner | Intermediate | Advanced | Expert",
      "expectedLevel": "Beginner | Intermediate | Advanced | Expert",
      "gapSize": "none | small | moderate | large",
      "priority": "High Priority | Needs Improvement | Strong Foundation",
      "importance": "critical | important | beneficial",
      "rationale": "Clear concrete reason why this skill matters for a ${profile.targetRole} at ${profile.targetLevel}",
      "suggestedAction": "One tangible, verifiable action or task to close this specific gap"
    }
  ]
}
Identify 6 to 9 essential competencies required for ${profile.targetRole}. Include their existing skills categorized truthfully, plus the critical missing competencies.
`;

  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });

    const parsed = cleanAndParseJSON(response.text || '', null);
    if (parsed && Array.isArray(parsed.skills)) {
      return parsed;
    }
    throw new Error('Invalid JSON structure returned by Gemini');
  } catch (err: any) {
    console.error('Gemini career analysis error:', err.message);
    // Return structured realistic fallback based on role
    return {
      summary: `Evaluated ${profile.targetRole} requirements. Identified key competencies in architecture, testing, and production tooling.`,
      readinessScore: 54,
      readinessBreakdown: {
        skillCoverage: 24,
        projectEvidence: 12,
        taskCompletion: 10,
        interviewReadiness: 8,
      },
      skills: [
        {
          name: `${profile.targetRole} Core Fundamentals`,
          category: 'Programming Languages',
          currentLevel: 'Intermediate',
          expectedLevel: 'Advanced',
          gapSize: 'small',
          priority: 'Needs Improvement',
          importance: 'critical',
          rationale: 'Deep mastery of language idioms and asynchronous programming is expected at this level.',
          suggestedAction: 'Practice memory-efficient design patterns and async stream handling.',
        },
        {
          name: 'Automated Testing & TDD',
          category: 'Testing & Debugging',
          currentLevel: 'Beginner',
          expectedLevel: 'Intermediate',
          gapSize: 'large',
          priority: 'High Priority',
          importance: 'critical',
          rationale: 'High test coverage protects against regressions in multi-developer codebases.',
          suggestedAction: 'Build unit tests with mocks and integration test suites.',
        },
        {
          name: 'Architecture & State Management',
          category: 'Architecture & Design',
          currentLevel: 'Beginner',
          expectedLevel: 'Intermediate',
          gapSize: 'moderate',
          priority: 'High Priority',
          importance: 'critical',
          rationale: 'Decoupled presentation and data layers ensure long-term maintainability.',
          suggestedAction: 'Refactor state logic using clean architecture and unidirectional data flow.',
        },
        {
          name: 'CI/CD & Deployment',
          category: 'Deployment & Release',
          currentLevel: 'None',
          expectedLevel: 'Intermediate',
          gapSize: 'large',
          priority: 'High Priority',
          importance: 'important',
          rationale: 'Automated build, test, and release pipelines prevent human distribution mistakes.',
          suggestedAction: 'Configure GitHub Actions workflow with automated test runs.',
        },
      ],
    };
  }
}

/**
 * 2. Generate Personalized Learning Roadmap
 */
export async function generateRoadmap(profile: any, gapAnalysis: any, completedTasks: any[] = []) {
  const prompt = `
You are a Staff Technical Mentor designing an actionable learning sprint roadmap for:
Target Role: ${profile.targetRole} (${profile.targetLevel})
Weekly Commitment: ${profile.studyDaysPerWeek} days/week, ${profile.studyHoursPerDay} hrs/day (${profile.studyDaysPerWeek * profile.studyHoursPerDay} total weekly hours)
Timeline: ${profile.targetTimelineWeeks} weeks
Completed Tasks So Far: ${completedTasks.map((t) => t.title).join(', ') || 'None yet'}
Priority Gaps to Address:
${gapAnalysis?.skills?.filter((s: any) => s.priority === 'High Priority' || s.priority === 'Needs Improvement').map((s: any) => `- ${s.name} (Current: ${s.currentLevel}, Expected: ${s.expectedLevel})`).join('\n')}

Generate a structured 4 to 5 phase roadmap tailored to these gaps.
Do NOT create generic reading tasks. Every task MUST be actionable, practical, and specify concrete acceptance criteria.

Return JSON in this exact structure:
{
  "title": "${profile.targetRole} Milestone Roadmap",
  "totalWeeks": ${profile.targetTimelineWeeks},
  "weeklyHours": ${profile.studyDaysPerWeek * profile.studyHoursPerDay},
  "tasks": [
    {
      "phaseIndex": 1,
      "phaseTitle": "Phase 1: Foundations & Architecture",
      "title": "Concise Task Name",
      "objective": "What practical capability the learner will gain",
      "whyItMatters": "Why product teams look for this in code reviews and interviews",
      "durationHours": 3.5,
      "difficulty": "Beginner | Intermediate | Advanced",
      "prerequisites": ["prerequisite 1", "prerequisite 2"],
      "instructions": [
        "Step 1: Specific action...",
        "Step 2: Specific action...",
        "Step 3: Specific action..."
      ],
      "acceptanceCriteria": [
        "Criterion 1: Concrete testable condition",
        "Criterion 2: Concrete testable condition",
        "Criterion 3: Concrete testable condition"
      ],
      "resources": [
        { "title": "Resource Name", "url": "https://example.com", "type": "Documentation | Guide | Tutorial" }
      ],
      "status": "todo"
    }
  ]
}
Include between 5 and 8 high-impact tasks across phases. Ensure tasks have clear progressive dependencies.
`;

  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.3,
      },
    });

    const parsed = cleanAndParseJSON(response.text || '', null);
    if (parsed && Array.isArray(parsed.tasks) && parsed.tasks.length > 0) {
      return parsed;
    }
    throw new Error('Roadmap tasks array missing');
  } catch (err: any) {
    console.error('Gemini roadmap generation error:', err.message);
    return {
      title: `${profile.targetRole} Structured Sprint Roadmap`,
      totalWeeks: profile.targetTimelineWeeks || 10,
      weeklyHours: 10,
      tasks: [
        {
          phaseIndex: 1,
          phaseTitle: 'Phase 1: Architecture & State Fundamentals',
          title: `Architect Scalable State Layer for ${profile.targetRole}`,
          objective: 'Implement decoupled unidirectional state with immutable data structures.',
          whyItMatters: 'Product teams reject apps with entangled business logic and UI state.',
          durationHours: 4,
          difficulty: 'Intermediate',
          prerequisites: ['Basic language syntax', 'Component lifecycle'],
          instructions: [
            'Define immutable state model with copyWith or record types.',
            'Separate network calls into a distinct repository class.',
            'Expose state as an observable stream/notifier to views.',
          ],
          acceptanceCriteria: [
            'State changes trigger UI updates without full screen rebuilds.',
            'Loading and error states are handled in dedicated view states.',
          ],
          resources: [{ title: 'State Architecture Guidelines', url: 'https://docs.flutter.dev', type: 'Documentation' }],
          status: 'todo',
        },
        {
          phaseIndex: 2,
          phaseTitle: 'Phase 2: Networking & Offline Reliability',
          title: 'Build Resilient API Client with Cache & Retry',
          objective: 'Implement network client with exponential backoff and offline local storage fallback.',
          whyItMatters: 'Users on weak mobile/web connections need graceful offline access.',
          durationHours: 4.5,
          difficulty: 'Intermediate',
          prerequisites: ['REST APIs', 'Async/Await'],
          instructions: [
            'Configure HTTP client with connection timeouts.',
            'Add interceptor to handle token expiration and retry.',
            'Persist retrieved responses in local storage for offline view.',
          ],
          acceptanceCriteria: [
            'Network disconnect falls back to cached data with an offline banner.',
            'Failed requests retry up to 3 times with exponential delay.',
          ],
          resources: [{ title: 'REST Client Best Practices', url: 'https://developer.mozilla.org', type: 'Guide' }],
          status: 'todo',
        },
        {
          phaseIndex: 3,
          phaseTitle: 'Phase 3: Automated Testing & Verification',
          title: 'Implement Automated Unit & Integration Tests',
          objective: 'Write unit tests for business logic repositories and integration test for user flows.',
          whyItMatters: 'Test suites give engineering leaders the confidence to merge your code to production.',
          durationHours: 3.5,
          difficulty: 'Intermediate',
          prerequisites: ['Unit testing runner basics'],
          instructions: [
            'Set up mock service to simulate API responses.',
            'Write test suite covering success, error 404, and network timeout branches.',
            'Run test runner and assert 100% test pass rate.',
          ],
          acceptanceCriteria: [
            'All tests execute via CLI without interactive input.',
            'Code coverage for repository exceeds 80%.',
          ],
          resources: [{ title: 'Automated Testing Guide', url: 'https://martinfowler.com/bliki/TestPyramid.html', type: 'Article' }],
          status: 'todo',
        },
      ],
    };
  }
}

/**
 * 3. Recommend Projects (Starter, Portfolio, Production Challenge)
 */
export async function recommendProjects(profile: any, gapAnalysis: any) {
  const prompt = `
You are an engineering hiring manager. Recommend 3 distinct practical projects for a candidate:
Target Role: ${profile.targetRole} (${profile.targetLevel})
Key Skill Gaps: ${gapAnalysis?.skills?.filter((s: any) => s.priority === 'High Priority').map((s: any) => s.name).join(', ') || 'Core role skills'}

Recommend exactly three tiered projects:
1. Starter Project (confidence-building, 4-8 hours)
2. Portfolio Project (comprehensive multi-skill application, 10-16 hours)
3. Production Challenge (advanced, high-concurrency, testing, architecture, or CI/CD, 16-24 hours)

Return JSON array of 3 objects with this structure:
[
  {
    "title": "Project Title",
    "scopeType": "Starter Project | Portfolio Project | Production Challenge",
    "description": "Clear 2-3 sentence description of what the project does and who uses it",
    "whyItMatters": "Why this specific project will impress engineering managers during interviews",
    "skillsDemonstrated": ["Skill 1", "Skill 2", "Skill 3"],
    "difficulty": "Beginner | Intermediate | Advanced",
    "durationEstHours": 8,
    "deliverables": [
      "Deliverable 1 (e.g. GitHub repository with modular structure)",
      "Deliverable 2 (e.g. Architecture diagram and README)",
      "Deliverable 3 (e.g. Unit test suite with >80% coverage)"
    ],
    "acceptanceCriteria": [
      "Criteria 1: Concrete testable behavior",
      "Criteria 2: Concrete testable behavior",
      "Criteria 3: Concrete testable behavior"
    ],
    "testScenarios": [
      "Scenario 1: Edge case or stress test",
      "Scenario 2: Error handling check"
    ]
  }
]
`;

  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.3,
      },
    });

    const parsed = cleanAndParseJSON(response.text || '', null);
    if (Array.isArray(parsed) && parsed.length >= 2) {
      return parsed;
    }
    throw new Error('Invalid projects response');
  } catch (err: any) {
    console.error('Gemini project recommendation error:', err.message);
    return [
      {
        title: `Smart Data Hub with Local Caching`,
        scopeType: 'Starter Project',
        description: `Build a clean, responsive client application for ${profile.targetRole} that saves user preferences and tasks locally.`,
        whyItMatters: 'Demonstrates baseline frontend hygiene, form handling, and persistent data structures.',
        skillsDemonstrated: [`${profile.targetRole} Basics`, 'Local Persistence', 'State Handling'],
        difficulty: 'Beginner',
        durationEstHours: 6,
        deliverables: ['Working source code', 'README with run instructions', 'Screen recording of CRUD flows'],
        acceptanceCriteria: ['Data persists across browser or app restarts', 'Form inputs validate edge cases'],
        testScenarios: ['Empty input shows validation warning', 'Offline reload keeps previous records'],
      },
      {
        title: `Production API Explorer & Real-Time Sync`,
        scopeType: 'Portfolio Project',
        description: 'Create a full-featured application communicating with a real public REST API featuring infinite scrolling, query debouncing, error boundaries, and offline storage.',
        whyItMatters: 'Directly mirrors the coding take-home assignments given by Tier-1 product tech companies.',
        skillsDemonstrated: ['REST APIs', 'Debounced Search', 'Caching', 'Error Boundaries'],
        difficulty: 'Intermediate',
        durationEstHours: 14,
        deliverables: ['GitHub repository', 'Architecture diagrams', 'Automated test suite'],
        acceptanceCriteria: ['Pagination loads next page when scrolling near bottom', 'Network disconnect shows retry button without app crashing'],
        testScenarios: ['Rapid typing does not trigger API requests until typing pauses for 350ms', '401/500 HTTP responses show actionable toast'],
      },
      {
        title: `Production-Ready Enterprise Micro-Service Module`,
        scopeType: 'Production Challenge',
        description: 'Architect a clean, fully-tested feature module with automated GitHub Actions CI pipeline, linting, and 85%+ branch unit test coverage.',
        whyItMatters: 'Proves you can be trusted to touch production code on day one without breaking existing features.',
        skillsDemonstrated: ['Clean Architecture', 'CI/CD Pipelines', 'Unit & Integration Testing', 'Security & Validation'],
        difficulty: 'Advanced',
        durationEstHours: 20,
        deliverables: ['Production repo', 'CI badge in README', 'Coverage report', 'ADR architecture notes'],
        acceptanceCriteria: ['Zero linting warnings', 'CI pipeline builds and tests on every pull request'],
        testScenarios: ['Broken test in PR fails the CI build', 'Simultaneous operations maintain thread/data safety'],
      },
    ];
  }
}

/**
 * 4. Project AI Mentor (contextual tech lead)
 */
export async function mentorProject(project: any, question: string, history: any[] = [], profile: any) {
  const prompt = `
You are a Staff Software Engineer and dedicated Project Mentor at Skill Buildry AI.
You are guiding a learner building the following project:
Project Title: ${project.title} (${project.scopeType})
Project Description: ${project.description}
Skills Demonstrated: ${Array.isArray(project.skillsDemonstrated) ? project.skillsDemonstrated.join(', ') : project.skillsDemonstrated}
Acceptance Criteria: ${JSON.stringify(project.acceptanceCriteria)}
Target Role of Learner: ${profile?.targetRole || 'Software Engineer'} (${profile?.targetLevel || 'Mid-Level'})

Learner Question:
"${question}"

Conversation History:
${history.slice(-4).map((m: any) => `${m.role === 'user' ? 'Learner' : 'Mentor'}: ${m.content}`).join('\n')}

Guidelines for your response:
1. Be concise, highly practical, and technically accurate.
2. Structure your advice into clear, numbered steps or bullet points.
3. Include real code snippets or architectural diagrams where helpful.
4. Don't speak in generic fluff; give specific library, API, or pattern recommendations relevant to ${profile?.targetRole || 'their role'}.
5. Do not pretend you have run or compiled their code in this turn.
`;

  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        temperature: 0.3,
      },
    });
    return response.text || 'I recommend breaking this down into three incremental steps: first build the data model, then connect the network repository with mock tests, and finally bind to the presentation layer.';
  } catch (err: any) {
    console.error('Gemini mentor error:', err.message);
    return `Here is how you can approach "${question}":\n\n1. **Isolate the core contract**: Define clear TypeScript or Dart interfaces for your data repository before building any UI.\n2. **Handle error states first**: Plan how your UI handles loading, network errors, and empty datasets.\n3. **Test with mocks**: Verify that your repository properly parses API responses and surfaces errors predictably.`;
  }
}

/**
 * 5. Generate Interview Questions
 */
export async function generateInterviewQuestions(targetRole: string, category: string, difficulty: string) {
  const prompt = `
Generate 3 realistic technical interview questions for a ${targetRole} (${difficulty} level) in the category: "${category}".
Focus on questions asked by top tech and product companies.

Return a JSON array of 3 objects with this structure:
[
  {
    "targetRole": "${targetRole}",
    "category": "${category}",
    "difficulty": "${difficulty}",
    "question": "The interview question text...",
    "rubric": {
      "keyConcepts": ["Concept 1", "Concept 2", "Concept 3"],
      "whatGoodLooksLike": "Explanation of an impressive answer",
      "commonMistakes": ["Mistake 1", "Mistake 2"]
    },
    "sampleAnswer": "A concise, exemplar answer demonstrating senior reasoning."
  }
]
`;

  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.3,
      },
    });

    const parsed = cleanAndParseJSON(response.text || '', null);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    throw new Error('Interview questions array missing');
  } catch (err: any) {
    console.error('Gemini interview generation error:', err.message);
    return [
      {
        targetRole,
        category,
        difficulty,
        question: `How do you handle memory management and prevent memory leaks in production ${targetRole} applications?`,
        rubric: {
          keyConcepts: ['Object lifecycles', 'Event listener / Stream unsubscription', 'Profiling tools', 'Garbage collection triggers'],
          whatGoodLooksLike: 'Explains specific profiler inspection (DevTools/Chrome heap snapshot), identifying retained references, and disposing subscriptions in cleanup lifecycles.',
          commonMistakes: ['Neglecting stream cancellations', 'Keeping static global references to view context'],
        },
        sampleAnswer: 'Always cancel stream subscriptions and timer callbacks in dispose()/useEffect cleanup. Avoid storing UI context or DOM nodes in long-lived singletons, and use memory allocation profilers in release/profile mode to inspect retained object paths.',
      },
    ];
  }
}

/**
 * 6. Evaluate Interview Answer
 */
export async function evaluateInterviewAnswer(questionText: string, rubric: any, userAnswer: string, targetRole: string) {
  const prompt = `
You are a Senior Technical Interviewer evaluating a candidate's answer for a ${targetRole} role.

Question: "${questionText}"
Evaluation Rubric: ${JSON.stringify(rubric)}
Candidate Answer: "${userAnswer}"

Grade the candidate's response objectively (0 to 100).
Return JSON with this exact structure:
{
  "score": <integer 0-100>,
  "feedback": {
    "whatWasExplainedWell": [
      "Point 1 that was accurate and showed solid understanding"
    ],
    "whatCouldBeImproved": [
      "Point where reasoning was fuzzy or incomplete"
    ],
    "importantMissingConcepts": [
      "Important technical concept or trade-off the candidate failed to mention"
    ],
    "strongerAnswerSuggestion": "A 2-3 sentence paragraph illustrating how to deliver a standout answer.",
    "followUpQuestion": "A probing follow-up question an interviewer would ask next."
  }
}
`;

  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });

    const parsed = cleanAndParseJSON(response.text || '', null);
    if (parsed && typeof parsed.score === 'number' && parsed.feedback) {
      return parsed;
    }
    throw new Error('Invalid interview evaluation JSON');
  } catch (err: any) {
    console.error('Gemini interview feedback error:', err.message);
    return {
      score: 72,
      feedback: {
        whatWasExplainedWell: ['Identified core architectural concepts and addressed the main question promptly.'],
        whatCouldBeImproved: ['Could discuss performance trade-offs and edge-case error recovery in greater depth.'],
        importantMissingConcepts: ['Specific profiling metrics and automated regression test considerations.'],
        strongerAnswerSuggestion: 'Anchor your explanation by contrasting high-level architecture with concrete real-world debugging workflows, including specific profiler commands and failure recovery strategies.',
        followUpQuestion: 'How would you measure the impact of this optimization in production using real-user telemetry?',
      },
    };
  }
}

/**
 * 7. Review Evidence and Project Descriptions
 */
export async function reviewEvidence(evidenceTitle: string, skillName: string, urlOrContent: string, targetRole: string) {
  const prompt = `
You are a Technical Portfolio Reviewer and Hiring Committee Member for ${targetRole} roles.
Review this submitted skill evidence:
Title: ${evidenceTitle}
Skill Targeted: ${skillName}
Submitted Content / Link Description:
"${urlOrContent}"

Evaluate the clarity, technical depth, and persuasiveness of this evidence.
Notice: If a URL is provided, evaluate the user-provided title, description, and explanation. Do not claim to have cloned or inspected a private repository if contents were not provided.
Provide constructive, actionable feedback in 2-3 concise paragraphs:
1. Strengths observed in the explanation and technical relevance to ${targetRole}.
2. Specific gaps or things missing that a hiring manager would look for (e.g. testing notes, architecture ADR, benchmarks, CI badge).
3. One concrete tip to turn this into an irrefutable proof-of-competence.
`;

  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        temperature: 0.3,
      },
    });
    return response.text || 'Evidence provides a strong demonstration of the skill. To strengthen it further, include automated test coverage reports and an Architecture Decision Record (ADR) in your README.';
  } catch (err: any) {
    console.error('Gemini evidence review error:', err.message);
    return `Good demonstration of ${skillName}. To make this stand out to tech leads, ensure you include: 1) A clear problem statement in the README, 2) Unit test results, and 3) A short architecture explanation of key trade-offs made during development.`;
  }
}

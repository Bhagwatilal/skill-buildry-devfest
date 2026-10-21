import type {
  User,
  Profile,
  SkillItem,
  GapAnalysis,
  Roadmap,
  ProjectRecommendation,
  ProjectMentorMessage,
  EvidenceRecord,
  InterviewQuestion,
  InterviewAttempt,
  ProgressHistoryEvent,
} from '../types/index.ts';

const DEMO_USER: User = {
  id: 'usr_bhagwatilal_demo',
  email: 'bhagwatilal.joshi@skillsprint.demo',
  name: 'Bhagwatilal Joshi',
  avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Bhagwatilal%20Joshi',
};

const DEMO_PROFILE: Profile = {
  targetRole: 'Flutter Developer',
  targetLevel: 'Mid-Level',
  currentTitle: 'Junior Mobile Developer',
  yearsExperience: 1.5,
  studyHoursPerDay: 2,
  studyDaysPerWeek: 5,
  targetTimelineWeeks: 10,
  learningStyle: 'hands-on',
  githubUrl: 'https://github.com/Bhagwatilal',
  portfolioUrl: 'https://bhagwatilal.dev',
  linkedinUrl: 'https://linkedin.com/in/bhagwatilal',
  bio: 'Software engineer and Flutter developer with hands-on experience looking to level up in testing, state architecture, and CI/CD for product companies.',
};

const DEMO_SKILLS: SkillItem[] = [
  { id: 'sk_1', name: 'Dart Language', category: 'Programming Languages', selfAssessedLevel: 'Advanced', hasEvidence: true },
  { id: 'sk_2', name: 'Flutter Widgets & Layout', category: 'Frameworks & Libraries', selfAssessedLevel: 'Advanced', hasEvidence: true },
  { id: 'sk_3', name: 'REST API & HTTP Integration', category: 'APIs & Backend', selfAssessedLevel: 'Intermediate', hasEvidence: true },
  { id: 'sk_4', name: 'Git & GitHub Collaboration', category: 'Collaboration', selfAssessedLevel: 'Intermediate', hasEvidence: false },
  { id: 'sk_5', name: 'Riverpod / BLoC State Management', category: 'Architecture & Design', selfAssessedLevel: 'Beginner', hasEvidence: false },
  { id: 'sk_6', name: 'Automated Unit & Widget Testing', category: 'Testing & Debugging', selfAssessedLevel: 'Beginner', hasEvidence: false },
  { id: 'sk_7', name: 'Mobile CI/CD & Fastlane', category: 'Deployment & Release', selfAssessedLevel: 'None', hasEvidence: false },
  { id: 'sk_8', name: 'Performance Profiling & Memory Leaks', category: 'Testing & Debugging', selfAssessedLevel: 'Beginner', hasEvidence: false },
];

const DEMO_GAP_ANALYSIS: GapAnalysis = {
  targetRole: 'Flutter Developer',
  targetLevel: 'Mid-Level',
  readinessScore: 62,
  readinessBreakdown: {
    skillCoverage: 28,
    projectEvidence: 15,
    taskCompletion: 10,
    interviewReadiness: 9,
  },
  summary: 'Strong foundational grasp of Dart and declarative UI widgets. The principal gaps for mid-level product engineering are production testing (unit/widget test suites), clean state architecture (Riverpod), and automated CI/CD pipeline mastery.',
  skills: [
    {
      name: 'Dart Language',
      category: 'Programming Languages',
      currentLevel: 'Advanced',
      expectedLevel: 'Advanced',
      gapSize: 'none',
      priority: 'Strong Foundation',
      importance: 'critical',
      rationale: 'Sound asynchronous Dart understanding (Streams, Futures) is crucial for production apps.',
      suggestedAction: 'Keep writing idiomatic patterns like sealed classes and record types in Dart 3.',
    },
    {
      name: 'Flutter Widgets & UI',
      category: 'Frameworks & Libraries',
      currentLevel: 'Advanced',
      expectedLevel: 'Advanced',
      gapSize: 'none',
      priority: 'Strong Foundation',
      importance: 'critical',
      rationale: 'Solid understanding of widget lifecycle, CustomScrollView, and responsive constraints.',
      suggestedAction: 'Explore RenderObject optimizations for custom drawing when needed.',
    },
    {
      name: 'REST API & Networking',
      category: 'APIs & Backend',
      currentLevel: 'Intermediate',
      expectedLevel: 'Advanced',
      gapSize: 'small',
      priority: 'Needs Improvement',
      importance: 'important',
      rationale: 'Needs resilient offline caching, exponential backoff, and auth token refresh interceptors.',
      suggestedAction: 'Implement Dio interceptor with automatic retry and secure token persistence.',
    },
    {
      name: 'Automated Unit & Widget Testing',
      category: 'Testing & Debugging',
      currentLevel: 'Beginner',
      expectedLevel: 'Intermediate',
      gapSize: 'large',
      priority: 'High Priority',
      importance: 'critical',
      rationale: 'Product teams demand high test coverage for business logic and UI regression protection.',
      suggestedAction: 'Write mocktail tests for your repository and widget tester tests for forms.',
    },
    {
      name: 'State Management (Riverpod / BLoC)',
      category: 'Architecture & Design',
      currentLevel: 'Beginner',
      expectedLevel: 'Intermediate',
      gapSize: 'moderate',
      priority: 'High Priority',
      importance: 'critical',
      rationale: 'GetX is common in tutorials, but product-scale apps standardly enforce Riverpod or BLoC with separation of concerns.',
      suggestedAction: 'Refactor a screen using AsyncNotifierProvider with immutable domain states.',
    },
    {
      name: 'Mobile CI/CD (Fastlane / Actions)',
      category: 'Deployment & Release',
      currentLevel: 'None',
      expectedLevel: 'Intermediate',
      gapSize: 'large',
      priority: 'High Priority',
      importance: 'important',
      rationale: 'Eliminating manual release steps prevents distribution errors and speeds feature cycles.',
      suggestedAction: 'Create a GitHub Actions workflow that executes flutter test and builds release APK/AAB.',
    },
  ],
};

const DEMO_ROADMAP: Roadmap = {
  id: 'rd_1',
  targetRole: 'Flutter Developer',
  title: 'Mid-Level Product Flutter Mastery Sprint',
  totalWeeks: 10,
  weeklyHours: 10,
  phases: [
    {
      index: 1,
      title: 'Phase 1: Architecture & Resilient State',
      tasks: [
        {
          id: 'tsk_1',
          title: 'Master Riverpod 2.0 with AsyncNotifier',
          objective: 'Replace singletons/GetX with compile-safe, immutable Riverpod state management and automatic error handling.',
          whyItMatters: 'Product teams value testable, decoupled architecture over monolithic global states.',
          durationHours: 3.5,
          difficulty: 'Intermediate',
          prerequisites: ['Dart Future/Stream basics', 'Flutter widget tree rebuild concepts'],
          instructions: [
            'Add flutter_riverpod and riverpod_annotation packages to your test app.',
            'Define an AsyncNotifier for a paginated feed state containing {items, hasMore, isLoading}.',
            'Handle AsyncValue.when() in the view layer to cleanly render loading, error, and data states.',
            'Inject a mock repository via Riverpod provider override.',
          ],
          acceptanceCriteria: [
            'Screen displays shimmer on initial load.',
            'Errors trigger an actionable retry snackbar without tearing down the view.',
            'Pull-to-refresh invalidates the provider smoothly.',
          ],
          resources: [
            { title: 'Official Riverpod 2.0 Docs', url: 'https://riverpod.dev', type: 'Documentation' },
            { title: 'AsyncNotifier Pattern Guide', url: 'https://codewithandrea.com', type: 'Article' },
          ],
          status: 'completed',
          completedAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
        },
        {
          id: 'tsk_2',
          title: 'Implement Resilient HTTP Networking with Dio & Cache',
          objective: 'Build an API client with auth interceptors, exponential backoff retry, and local Drift/Hive cache fallback.',
          whyItMatters: 'Mobile networks drop frequently; apps that crash or display blank screens on poor connectivity get uninstalled.',
          durationHours: 4,
          difficulty: 'Intermediate',
          prerequisites: ['REST API basics', 'JSON serialization'],
          instructions: [
            'Set up a Dio client instance configured with connection and send timeouts.',
            'Implement an Interceptor that catches 401 Unauthorized and attempts a token refresh before retrying.',
            'Store cached responses in a local key-value store to enable offline viewing.',
          ],
          acceptanceCriteria: [
            'Simulated network disconnect shows cached feed with an "Offline Mode" chip.',
            'Duplicate simultaneous requests are debounced or throttled.',
          ],
          resources: [
            { title: 'Dio HTTP Client for Dart', url: 'https://pub.dev/packages/dio', type: 'Package' },
          ],
          status: 'in_progress',
        },
      ],
    },
    {
      index: 2,
      title: 'Phase 2: Automated Testing & Code Quality',
      tasks: [
        {
          id: 'tsk_3',
          title: 'Write Unit Tests for Business Logic with Mocktail',
          objective: 'Achieve 85%+ branch coverage on repository and state notifier classes using mocktail.',
          whyItMatters: 'Automated testing protects against regressions and lets you deploy new features with confidence.',
          durationHours: 3,
          difficulty: 'Intermediate',
          prerequisites: ['Dart unit test package', 'Dependency injection'],
          instructions: [
            'Create mock class class MockApiClient extends Mock implements ApiClient {}.',
            'Write test group verifying repository returns domain models when API returns HTTP 200.',
            'Write test verifying repository throws CustomNetworkException when API returns 500.',
          ],
          acceptanceCriteria: [
            'flutter test passes with 0 failures.',
            'Edge cases like malformed JSON and null fields are tested and guarded.',
          ],
          resources: [
            { title: 'Flutter Unit Testing Guide', url: 'https://docs.flutter.dev/testing/overview#unit-tests', type: 'Official Guide' },
          ],
          status: 'todo',
        },
        {
          id: 'tsk_4',
          title: 'Widget & Golden Testing for Interactive Components',
          objective: 'Test user interaction flows and widget rendering without running an emulator.',
          whyItMatters: 'Widget tests catch UI bugs 10x faster than manual simulator testing.',
          durationHours: 3.5,
          difficulty: 'Intermediate',
          prerequisites: ['WidgetTester fundamentals'],
          instructions: [
            'Use testWidgets() to pump the LoginScreen with Riverpod container override.',
            'Simulate typing invalid email format and tap submit.',
            'Verify error text "Enter valid email" appears on screen.',
          ],
          acceptanceCriteria: [
            'Validation triggers visibly in test.',
            'Form submission is blocked until inputs are valid.',
          ],
          resources: [
            { title: 'An Introduction to Widget Testing', url: 'https://docs.flutter.dev/cookbook/testing/widget/introduction', type: 'Documentation' },
          ],
          status: 'todo',
        },
      ],
    },
    {
      index: 3,
      title: 'Phase 3: CI/CD & Release Pipeline',
      tasks: [
        {
          id: 'tsk_5',
          title: 'Configure GitHub Actions for Flutter CI',
          objective: 'Automate linting, unit tests, and release APK building on every pull request.',
          whyItMatters: 'Every modern tech company uses CI to prevent broken code from landing on main.',
          durationHours: 2.5,
          difficulty: 'Intermediate',
          prerequisites: ['Git basics', 'YAML syntax'],
          instructions: [
            'Create .github/workflows/flutter_ci.yml.',
            'Add subosito/flutter-action with stable channel.',
            'Run flutter analyze --fatal-infos and flutter test --coverage.',
          ],
          acceptanceCriteria: [
            'Workflow runs automatically on PR push.',
            'Linter and tests enforce zero broken builds.',
          ],
          resources: [
            { title: 'Continuous Integration for Flutter', url: 'https://docs.flutter.dev/deployment/cd', type: 'Guide' },
          ],
          status: 'todo',
        },
      ],
    },
  ],
};

const DEMO_PROJECTS: ProjectRecommendation[] = [
  {
    id: 'prj_1',
    title: 'Smart Habit & Task Tracker with SQLite Persistence',
    scopeType: 'Starter Project',
    description: 'Build a focused daily productivity tracker with local database storage, input validation, and filterable views.',
    whyItMatters: 'Demonstrates clean local persistence, state management, and responsive Flutter widget craftsmanship.',
    skillsDemonstrated: ['Flutter Widgets', 'SQLite / Drift', 'Form Validation', 'State Management'],
    difficulty: 'Beginner',
    durationEstHours: 6,
    deliverables: ['Working Flutter app code', 'Database migration schema', 'Screen recordings of CRUD operations'],
    acceptanceCriteria: [
      'CRUD operations work seamlessly without UI hitching.',
      'Data persists across app restarts.',
      'Form inputs validate non-empty title and valid deadline.',
    ],
    testScenarios: [
      'Add task -> Force close app -> Reopen -> Task exists',
      'Submit task with 0 characters -> Shows validation error',
    ],
    status: 'completed',
  },
  {
    id: 'prj_2',
    title: 'API Explorer with Offline Caching & Paginated Feed',
    scopeType: 'Portfolio Project',
    description: 'Create a production-style application consuming a public REST API with infinite scroll pagination, query debouncing, offline caching, and error recovery states.',
    whyItMatters: 'This directly tackles the #1 interview assignment given by mobile teams at product startups.',
    skillsDemonstrated: ['REST APIs', 'Pagination', 'Riverpod', 'Offline Cache', 'Debounced Search'],
    difficulty: 'Intermediate',
    durationEstHours: 12,
    deliverables: ['GitHub repository with clean README', 'Architecture diagram', 'Demo video', 'Unit test suite'],
    acceptanceCriteria: [
      'List fetches 20 items per page with scroll listener indicator.',
      'Cached data loads instantly even in airplane mode.',
      'Search query debounces by 350ms to prevent spamming the backend.',
    ],
    testScenarios: [
      'Fast scroll to bottom triggers next page load exactly once.',
      'Simulated 500 error shows non-blocking retry button.',
    ],
    status: 'in_progress',
  },
  {
    id: 'prj_3',
    title: 'Production-Grade E-Commerce Feature Module with Unit & Widget Tests',
    scopeType: 'Production Challenge',
    description: 'Architect a complete checkout and cart module using Clean Architecture principles, full dependency injection, 90% unit test coverage, and a GitHub Actions workflow.',
    whyItMatters: 'Proves to hiring managers that you can step into an existing mid/senior engineering team without needing hand-holding.',
    skillsDemonstrated: ['Clean Architecture', 'Unit & Widget Testing', 'GitHub Actions CI/CD', 'Performance Profiling'],
    difficulty: 'Advanced',
    durationEstHours: 18,
    deliverables: ['Production repo', 'Test coverage report', 'CI pipeline badge', 'Architecture ADR (decision records)'],
    acceptanceCriteria: [
      'Zero coupling between data layer and UI layer.',
      'Unit test coverage strictly above 85%.',
      'GitHub Actions CI runs and passes on every PR.',
    ],
    testScenarios: [
      'Discounts apply correctly with currency rounding edge cases.',
      'Concurrent cart additions never lose items.',
    ],
    status: 'not_started',
  },
];

const DEMO_EVIDENCE: EvidenceRecord[] = [
  {
    id: 'ev_1',
    title: 'Flutter UI Kit & Custom Shimmer Components',
    skillName: 'Flutter Widgets & Layout',
    evidenceType: 'GitHub Repository',
    urlOrContent: 'https://github.com/Bhagwatilal/flutter-smooth-ui-kit',
    verificationStatus: 'AI-Reviewed',
    aiFeedback: 'Solid repository structure with clear widget separation. Reusable shimmer skeletons demonstrate good understanding of render repaints. Recommendation: Add golden UI snapshot tests to verify cross-device layouts.',
    score: 88,
    createdAt: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
  },
  {
    id: 'ev_2',
    title: 'REST API Client with Dio & Retry Interceptor',
    skillName: 'REST API & HTTP Integration',
    evidenceType: 'Code Snippet',
    urlOrContent: 'https://github.com/Bhagwatilal/flutter-dio-resilient-client',
    verificationStatus: 'AI-Reviewed',
    aiFeedback: 'The interceptor handles 401 refresh flows well. Be sure to implement a lock on concurrent token refresh calls so multiple simultaneous 401s do not trigger duplicate refresh network requests.',
    score: 82,
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
  },
];

const DEMO_QUESTIONS: InterviewQuestion[] = [
  {
    id: 'q_1',
    targetRole: 'Flutter Developer',
    category: 'Fundamentals',
    difficulty: 'Mid-Level',
    question: 'Explain the difference between Stateless and Stateful widgets in Flutter, and describe when you would choose an external state management library over setState().',
    rubric: {
      keyConcepts: ['Element tree vs Widget tree', 'setState scope and rebuild cost', 'Separation of business logic from UI', 'Shared state across unrelated widget branches'],
      whatGoodLooksLike: 'Clear explanation that widgets are immutable configurations, stateful widgets maintain mutable state objects across rebuilds, and external state management decouples logic, aids testability, and prevents full-screen re-renders.',
      commonMistakes: ['Thinking widgets are destroyed and rebuilt entirely on the GPU', 'Using setState at root level for global state'],
    },
    sampleAnswer: 'StatelessWidgets are immutable configurations rebuilt when parent props change. StatefulWidgets hold mutable State across rebuilds. External state management like Riverpod is chosen when state must be shared across disparate screen trees, cached, or tested in isolation without widget mounting.',
  },
  {
    id: 'q_2',
    targetRole: 'Flutter Developer',
    category: 'Architecture & Design',
    difficulty: 'Mid-Level',
    question: 'How would you structure a production Flutter app using Clean Architecture? Explain the roles of Domain, Data, and Presentation layers.',
    rubric: {
      keyConcepts: ['Domain layer purity (no Flutter dependency)', 'Repositories as interfaces in Domain, implementations in Data', 'Presentation layer holds UI and ViewModels/Notifiers', 'Dependency inversion principle'],
      whatGoodLooksLike: 'Domain contains entities and use-cases with zero external package imports. Data implements repositories and handles JSON parsing / DB queries. Presentation observes state and dispatches user actions.',
      commonMistakes: ['Calling API directly from widget initState', 'Putting database models into domain layer'],
    },
    sampleAnswer: 'In Clean Architecture, Domain is the inner core containing Entities and abstract Repository contracts with no Flutter dependencies. Data contains Datasources (REST, SQLite) and Repository implementations. Presentation contains Widgets and StateNotifiers.',
  },
  {
    id: 'q_3',
    targetRole: 'Flutter Developer',
    category: 'Debugging & Troubleshooting',
    difficulty: 'Mid-Level',
    question: 'A user reports that your Flutter list view stutters (janks) when scrolling through 500 items containing images. How do you profile and fix this using Flutter DevTools?',
    rubric: {
      keyConcepts: ['Flutter DevTools Performance view & raster/UI thread metrics', 'ListView.builder vs ListView()', 'Image cache width/height constraints (cacheWidth)', 'const constructors to prevent unnecessary rebuilds'],
      whatGoodLooksLike: 'Identifies using Flutter DevTools timeline to see whether UI or Raster thread exceeds 16ms budget. Points out ListView.builder for lazy loading, resizing images at decode time with cacheWidth/cacheHeight, and RepaintBoundary for heavy custom elements.',
      commonMistakes: ['Saying just restart the app or turn off debug mode without explaining profiler metrics'],
    },
    sampleAnswer: 'I open Flutter DevTools in Profile mode (never Debug) to inspect frame render times. If the Raster thread is slow, images are likely too large; I set cacheWidth and cacheHeight on Image.network so high-res images aren\'t decoded at full scale into RAM. If the UI thread is slow, ensure ListView.builder is used and heavy calculations are moved off the main isolate.',
  },
];

const DEMO_EVENTS: ProgressHistoryEvent[] = [
  { id: 'ev_h1', type: 'gap_analyzed', description: 'Initial Career Gap Analysis completed', timestamp: new Date(Date.now() - 72 * 3600 * 1000).toISOString() },
  { id: 'ev_h2', type: 'task_completed', description: 'Completed: Master Riverpod 2.0 with AsyncNotifier', timestamp: new Date(Date.now() - 48 * 3600 * 1000).toISOString() },
  { id: 'ev_h3', type: 'evidence_added', description: 'Added project evidence for Flutter UI Kit', timestamp: new Date(Date.now() - 24 * 3600 * 1000).toISOString() },
];

// In-Memory / Local Storage state manager for Vercel/Static deployments
function getStorage<T>(key: string, defaultVal: T): T {
  try {
    const val = localStorage.getItem(`sb_${key}`);
    return val ? JSON.parse(val) : defaultVal;
  } catch {
    return defaultVal;
  }
}

function setStorage<T>(key: string, val: T): void {
  try {
    localStorage.setItem(`sb_${key}`, JSON.stringify(val));
  } catch {
    // Ignore storage quota
  }
}

export function handleClientFallback(endpoint: string, options: RequestInit = {}): any {
  const method = (options.method || 'GET').toUpperCase();
  const body = options.body ? JSON.parse(options.body as string) : {};

  // Auth endpoints
  if (endpoint === '/api/auth/demo') {
    setStorage('current_user', DEMO_USER);
    return { user: DEMO_USER, token: 'demo_token_' + Date.now() };
  }

  if (endpoint === '/api/auth/login') {
    const name = body.name || (body.email ? body.email.split('@')[0] : 'Bhagwatilal Joshi');
    const user: User = {
      id: 'usr_' + Date.now(),
      email: body.email || 'bhagwatilal@gmail.com',
      name: name.charAt(0).toUpperCase() + name.slice(1),
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${name}`,
    };
    setStorage('current_user', user);
    return { user, token: 'token_' + Date.now() };
  }

  if (endpoint === '/api/auth/register') {
    const user: User = {
      id: 'usr_' + Date.now(),
      email: body.email,
      name: body.name || 'Bhagwatilal Joshi',
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${body.name || 'User'}`,
    };
    setStorage('current_user', user);
    return { user, token: 'token_' + Date.now() };
  }

  if (endpoint === '/api/auth/me') {
    const user = getStorage('current_user', DEMO_USER);
    return { authenticated: Boolean(user), user };
  }

  if (endpoint === '/api/auth/logout') {
    localStorage.removeItem('sb_current_user');
    return { success: true };
  }

  // Profile
  if (endpoint === '/api/profile') {
    if (method === 'POST') {
      const existing = getStorage('profile', DEMO_PROFILE);
      const updated = { ...existing, ...body };
      setStorage('profile', updated);
      return { profile: updated };
    }
    return {
      profile: getStorage('profile', DEMO_PROFILE),
      skills: getStorage('skills', DEMO_SKILLS),
    };
  }

  // Skills
  if (endpoint === '/api/skills') {
    if (method === 'POST') {
      const skills = getStorage('skills', DEMO_SKILLS);
      const newSkill: SkillItem = { id: 'sk_' + Date.now(), ...body };
      const updated = [...skills, newSkill];
      setStorage('skills', updated);
      return { skill: newSkill, skills: updated };
    }
    return { skills: getStorage('skills', DEMO_SKILLS) };
  }

  // Gap Analysis
  if (endpoint.startsWith('/api/gap-analysis')) {
    return { analysis: getStorage('gap_analysis', DEMO_GAP_ANALYSIS) };
  }

  // Roadmap
  if (endpoint === '/api/roadmap' || endpoint === '/api/roadmap/generate') {
    return { roadmap: getStorage('roadmap', DEMO_ROADMAP) };
  }

  if (endpoint.startsWith('/api/roadmap/tasks/')) {
    const taskId = endpoint.split('/').pop();
    const roadmap = getStorage('roadmap', DEMO_ROADMAP);
    const updatedPhases = roadmap.phases.map(p => ({
      ...p,
      tasks: p.tasks.map(t => t.id === taskId ? { ...t, status: body.status } : t),
    }));
    const updated = { ...roadmap, phases: updatedPhases };
    setStorage('roadmap', updated);
    return { roadmap: updated };
  }

  // Projects
  if (endpoint === '/api/projects' || endpoint === '/api/projects/recommend') {
    return { projects: getStorage('projects', DEMO_PROJECTS) };
  }

  if (endpoint.includes('/mentor')) {
    return {
      reply: {
        id: 'msg_' + Date.now(),
        sender: 'mentor' as const,
        text: `Great question! When architecting this solution, focus on clean separation of concerns. Make sure your repository abstractions isolate data access and use dependency injection for testability.`,
        timestamp: new Date().toISOString(),
      },
      history: [
        {
          id: 'msg_h1',
          sender: 'user' as const,
          text: body.question || 'How should I structure this?',
          timestamp: new Date().toISOString(),
        },
        {
          id: 'msg_h2',
          sender: 'mentor' as const,
          text: 'Focus on clear interfaces and automated test coverage.',
          timestamp: new Date().toISOString(),
        },
      ],
    };
  }

  // Evidence
  if (endpoint === '/api/evidence') {
    const existing = getStorage('evidence', DEMO_EVIDENCE);
    if (method === 'POST') {
      const newRec: EvidenceRecord = {
        id: 'ev_' + Date.now(),
        title: body.title,
        skillName: body.skillName,
        evidenceType: body.evidenceType,
        urlOrContent: body.urlOrContent,
        verificationStatus: 'AI-Reviewed',
        aiFeedback: 'Verified and reviewed. Clear architectural separation and clean code implementation.',
        score: 85,
        createdAt: new Date().toISOString(),
      };
      const updated = [newRec, ...existing];
      setStorage('evidence', updated);
      return { evidence: updated };
    }
    return { evidence: existing };
  }

  // Interview
  if (endpoint === '/api/interview/questions' || endpoint === '/api/interview/generate') {
    return { questions: getStorage('questions', DEMO_QUESTIONS) };
  }

  if (endpoint === '/api/interview/attempts') {
    return { attempts: getStorage('attempts', []) };
  }

  if (endpoint === '/api/interview/submit-answer') {
    const attempt: InterviewAttempt = {
      id: 'att_' + Date.now(),
      questionId: body.questionId,
      userAnswer: body.userAnswer,
      score: 86,
      feedback: 'Strong answer demonstrating practical system design concepts and architectural clarity.',
      rubricScores: {
        soundness: 22,
        tradeoffs: 21,
        failureModes: 21,
        precision: 22,
      },
      attemptedAt: new Date().toISOString(),
    };
    const attempts = getStorage('attempts', []);
    setStorage('attempts', [attempt, ...attempts]);
    return { attempt };
  }

  // Progress
  if (endpoint === '/api/progress/events') {
    return { events: getStorage('events', DEMO_EVENTS) };
  }

  // Reset Demo
  if (endpoint === '/api/settings/reset-demo') {
    localStorage.removeItem('sb_profile');
    localStorage.removeItem('sb_skills');
    localStorage.removeItem('sb_gap_analysis');
    localStorage.removeItem('sb_roadmap');
    localStorage.removeItem('sb_projects');
    localStorage.removeItem('sb_evidence');
    localStorage.removeItem('sb_attempts');
    setStorage('current_user', DEMO_USER);
    return { success: true, message: 'Database reset to default demo showcase' };
  }

  // Default empty
  return {};
}

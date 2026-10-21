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

const TOKEN_KEY = 'skillsprint_auth_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string | null) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // Target backend server on 5000 if accessed from another port (e.g. 5173 or 3000)
  let url = endpoint;
  if (typeof window !== 'undefined' && window.location.port !== '5000' && window.location.hostname === 'localhost') {
    url = `http://localhost:5000${endpoint}`;
  }

  const res = await fetch(url, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || `HTTP error ${res.status}: ${res.statusText}`);
  }

  return data as T;
}

export const api = {
  // Auth
  auth: {
    async register(email: string, password: string, name: string) {
      const res = await request<{ user: User; token: string }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, name }),
      });
      setStoredToken(res.token);
      return res;
    },
    async login(email: string, password: string) {
      const res = await request<{ user: User; token: string }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      setStoredToken(res.token);
      return res;
    },
    async loginAsDemo() {
      const res = await request<{ user: User; token: string }>('/api/auth/demo', {
        method: 'POST',
      });
      setStoredToken(res.token);
      return res;
    },
    async logout() {
      try {
        await request('/api/auth/logout', { method: 'POST' });
      } finally {
        setStoredToken(null);
      }
    },
    async getMe() {
      return request<{ authenticated: boolean; user: User }>('/api/auth/me');
    },
  },

  // Profile & Skills
  profile: {
    async get() {
      return request<{ profile: Profile | null; skills: SkillItem[] }>('/api/profile');
    },
    async save(data: Partial<Profile>) {
      return request<{ profile: Profile }>('/api/profile', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
  },

  skills: {
    async getAll() {
      return request<{ skills: SkillItem[] }>('/api/skills');
    },
    async add(skill: { name: string; category: string; selfAssessedLevel: string; hasEvidence?: boolean }) {
      return request<{ skill: SkillItem }>('/api/skills', {
        method: 'POST',
        body: JSON.stringify(skill),
      });
    },
    async delete(id: string) {
      return request<{ success: boolean }>(`/api/skills/${id}`, {
        method: 'DELETE',
      });
    },
  },

  // Gap Analysis
  gapAnalysis: {
    async getLatest() {
      return request<{ analysis: GapAnalysis | null }>('/api/gap-analysis');
    },
    async analyze(payload?: { profile?: any; skills?: any[] }) {
      return request<{ analysis: GapAnalysis }>('/api/gap-analysis/analyze', {
        method: 'POST',
        body: JSON.stringify(payload || {}),
      });
    },
  },

  // Roadmap
  roadmap: {
    async get() {
      return request<{ roadmap: Roadmap | null }>('/api/roadmap');
    },
    async generate() {
      return request<{ roadmap: Roadmap }>('/api/roadmap/generate', {
        method: 'POST',
      });
    },
    async updateTaskStatus(taskId: string, status: 'todo' | 'in_progress' | 'completed') {
      return request<{ roadmap: Roadmap }>(`/api/roadmap/tasks/${taskId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
    },
  },

  // Projects
  projects: {
    async getAll() {
      return request<{ projects: ProjectRecommendation[] }>('/api/projects');
    },
    async recommend() {
      return request<{ projects: ProjectRecommendation[] }>('/api/projects/recommend', {
        method: 'POST',
      });
    },
    async updateStatus(projectId: string, status: string) {
      return request<{ projects: ProjectRecommendation[] }>(`/api/projects/${projectId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
    },
    async getMentorMessages(projectId: string) {
      return request<{ messages: ProjectMentorMessage[] }>(`/api/projects/${projectId}/mentor`);
    },
    async askMentor(projectId: string, question: string) {
      return request<{ reply: ProjectMentorMessage; history: ProjectMentorMessage[] }>(`/api/projects/${projectId}/mentor`, {
        method: 'POST',
        body: JSON.stringify({ question }),
      });
    },
  },

  // Evidence
  evidence: {
    async getAll() {
      return request<{ evidence: EvidenceRecord[] }>('/api/evidence');
    },
    async add(record: {
      title: string;
      skillName: string;
      evidenceType: string;
      urlOrContent: string;
      requestAiReview?: boolean;
      projectId?: string;
    }) {
      return request<{ evidence: EvidenceRecord[] }>('/api/evidence', {
        method: 'POST',
        body: JSON.stringify(record),
      });
    },
    async delete(id: string) {
      return request<{ evidence: EvidenceRecord[] }>(`/api/evidence/${id}`, {
        method: 'DELETE',
      });
    },
  },

  // Interview Prep
  interview: {
    async getQuestions() {
      return request<{ questions: InterviewQuestion[] }>('/api/interview/questions');
    },
    async generateQuestions(category: string, difficulty?: string) {
      return request<{ questions: InterviewQuestion[] }>('/api/interview/generate', {
        method: 'POST',
        body: JSON.stringify({ category, difficulty }),
      });
    },
    async getAttempts() {
      return request<{ attempts: InterviewAttempt[] }>('/api/interview/attempts');
    },
    async submitAnswer(questionId: string, questionText: string, rubric: any, userAnswer: string) {
      return request<{ attempt: InterviewAttempt }>('/api/interview/submit-answer', {
        method: 'POST',
        body: JSON.stringify({ questionId, questionText, rubric, userAnswer }),
      });
    },
  },

  // Progress & Settings
  progress: {
    async getEvents() {
      return request<{ events: ProgressHistoryEvent[] }>('/api/progress/events');
    },
  },

  settings: {
    async resetDemo() {
      return request<{ success: boolean; message: string }>('/api/settings/reset-demo', {
        method: 'POST',
      });
    },
  },

  system: {
    async getHealth() {
      return request<{
        status: string;
        service: string;
        timestamp: string;
        database: {
          type: string;
          status: string;
          stats: {
            users: number;
            activeSessions: number;
            roadmapTasks: number;
          };
        };
        aiEngine: {
          model: string;
          hasKey: boolean;
          fallbackEnabled: boolean;
        };
        environment: string;
      }>('/api/health');
    },
  },
};

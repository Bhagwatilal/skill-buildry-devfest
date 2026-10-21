import type {
  User,
  Profile,
  SkillItem,
  GapAnalysis,
  Roadmap,
  RoadmapTask,
  ProjectRecommendation,
  ProjectMentorMessage,
  EvidenceRecord,
  InterviewQuestion,
  InterviewAttempt,
  ProgressHistoryEvent,
} from '../types/index.ts';

import {
  TECHNOLOGY_TRACKS,
  DEFAULT_TRACK_ID,
  getTrack,
  type TechnologyTrack,
} from '../data/technologyTracks.ts';

const DEMO_USER: User = {
  id: 'usr_bhagwatilal_demo',
  email: 'bhagwatilal.joshi@skillsprint.demo',
  name: 'Bhagwatilal Joshi',
  avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Bhagwatilal%20Joshi',
};

function getStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const val = localStorage.getItem('sb_' + key);
    return val ? JSON.parse(val) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('sb_' + key, JSON.stringify(value));
  } catch (err) {
    console.error('Storage error:', err);
  }
}

export function getCurrentTrackId(): string {
  return getStorage<string>('current_track_id', DEFAULT_TRACK_ID);
}

export function setCurrentTrackId(trackId: string): void {
  setStorage('current_track_id', trackId);
}

export function getActiveTrack(): TechnologyTrack {
  const trackId = getCurrentTrackId();
  return getTrack(trackId);
}

export function handleClientFallback(endpoint: string, options: RequestInit = {}): any {
  const method = (options.method || 'GET').toUpperCase();
  const body = options.body ? JSON.parse(options.body as string) : {};
  const activeTrack = getActiveTrack();

  // ---------------- Track Management Endpoints ----------------
  if (endpoint === '/api/tracks') {
    return {
      activeTrackId: getCurrentTrackId(),
      tracks: Object.values(TECHNOLOGY_TRACKS).map((t) => ({
        id: t.id,
        name: t.name,
        badge: t.badge,
        category: t.category,
        tagline: t.tagline,
      })),
    };
  }

  if (endpoint === '/api/tracks/switch' || (endpoint === '/api/tracks' && method === 'POST')) {
    const targetTrackId = body.trackId || DEFAULT_TRACK_ID;
    const newTrack = getTrack(targetTrackId);
    setCurrentTrackId(newTrack.id);

    // Overwrite cached state with the new track presets
    setStorage('profile', newTrack.profile);
    setStorage('skills', newTrack.skills);
    setStorage('gap_analysis', newTrack.gapAnalysis);
    setStorage('roadmap', newTrack.roadmap);
    setStorage('projects', newTrack.projects);
    setStorage('evidence', newTrack.evidence);
    setStorage('questions', newTrack.interviewQuestions);

    const switchEvent: ProgressHistoryEvent = {
      id: 'ev_' + Date.now(),
      userId: DEMO_USER.id,
      eventType: 'track_switched',
      title: `Switched career track to ${newTrack.name}`,
      createdAt: new Date().toISOString(),
    };
    const events = getStorage<ProgressHistoryEvent[]>('events', []);
    setStorage('events', [switchEvent, ...events]);

    return {
      success: true,
      activeTrackId: newTrack.id,
      track: newTrack,
      profile: newTrack.profile,
      skills: newTrack.skills,
      gapAnalysis: newTrack.gapAnalysis,
      roadmap: newTrack.roadmap,
      projects: newTrack.projects,
    };
  }

  // ---------------- Auth Endpoints ----------------
  if (endpoint === '/api/auth/demo') {
    setStorage('current_user', DEMO_USER);
    // Ensure active track is loaded
    if (!localStorage.getItem('sb_profile')) {
      setStorage('profile', activeTrack.profile);
      setStorage('skills', activeTrack.skills);
      setStorage('gap_analysis', activeTrack.gapAnalysis);
      setStorage('roadmap', activeTrack.roadmap);
      setStorage('projects', activeTrack.projects);
      setStorage('evidence', activeTrack.evidence);
      setStorage('questions', activeTrack.interviewQuestions);
    }
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
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(body.name || 'User')}`,
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

  // ---------------- Profile ----------------
  if (endpoint === '/api/profile') {
    if (method === 'POST') {
      const existing = getStorage('profile', activeTrack.profile);
      const updated = { ...existing, ...body };
      setStorage('profile', updated);
      return { profile: updated };
    }
    return {
      profile: getStorage('profile', activeTrack.profile),
      skills: getStorage('skills', activeTrack.skills),
    };
  }

  // ---------------- Skills ----------------
  if (endpoint === '/api/skills') {
    if (method === 'POST') {
      const skills = getStorage('skills', activeTrack.skills);
      const newSkill: SkillItem = {
        id: 'sk_' + Date.now(),
        userId: DEMO_USER.id,
        name: body.name,
        category: body.category || 'Frameworks & Libraries',
        selfAssessedLevel: body.selfAssessedLevel || 'Intermediate',
        hasEvidence: Boolean(body.hasEvidence),
      };
      const updated = [newSkill, ...skills];
      setStorage('skills', updated);
      return { skill: newSkill, skills: updated };
    }
    return { skills: getStorage('skills', activeTrack.skills) };
  }

  if (endpoint.startsWith('/api/skills/') && method === 'DELETE') {
    const skillId = endpoint.split('/').pop();
    const skills = getStorage('skills', activeTrack.skills);
    const updated = skills.filter((s: SkillItem) => s.id !== skillId);
    setStorage('skills', updated);
    return { success: true, skills: updated };
  }

  // ---------------- Gap Analysis ----------------
  if (endpoint.startsWith('/api/gap-analysis')) {
    if (method === 'POST') {
      // Re-run gap analysis
      const analysis = getStorage('gap_analysis', activeTrack.gapAnalysis);
      const updated = {
        ...analysis,
        readinessScore: Math.min(95, analysis.readinessScore + 3),
        generatedAt: new Date().toISOString(),
      };
      setStorage('gap_analysis', updated);
      return { analysis: updated };
    }
    return { analysis: getStorage('gap_analysis', activeTrack.gapAnalysis) };
  }

  // ---------------- Roadmap & Tasks ----------------
  if (endpoint === '/api/roadmap' || endpoint === '/api/roadmap/generate') {
    return { roadmap: getStorage('roadmap', activeTrack.roadmap) };
  }

  if (endpoint.startsWith('/api/roadmap/tasks/')) {
    const taskId = endpoint.split('/').pop();
    const roadmap = getStorage('roadmap', activeTrack.roadmap);
    const updatedTasks = (roadmap.tasks || []).map((t: RoadmapTask) => {
      if (t.id === taskId) {
        return {
          ...t,
          status: body.status,
          completedAt: body.status === 'completed' ? new Date().toISOString() : undefined,
        };
      }
      return t;
    });

    const completedCount = updatedTasks.filter((t: RoadmapTask) => t.status === 'completed').length;
    const progressPct = updatedTasks.length > 0 ? Math.round((completedCount / updatedTasks.length) * 100) : 0;
    const updatedRoadmap = {
      ...roadmap,
      tasks: updatedTasks,
      progressPct,
    };
    setStorage('roadmap', updatedRoadmap);

    // If completed, add a progress history event
    if (body.status === 'completed') {
      const taskObj = updatedTasks.find((t: RoadmapTask) => t.id === taskId);
      const event: ProgressHistoryEvent = {
        id: 'ev_' + Date.now(),
        userId: DEMO_USER.id,
        eventType: 'task_completed',
        title: `Completed: ${taskObj?.title || 'Sprint Task'}`,
        createdAt: new Date().toISOString(),
      };
      const events = getStorage<ProgressHistoryEvent[]>('events', []);
      setStorage('events', [event, ...events]);
    }

    return { roadmap: updatedRoadmap };
  }

  // ---------------- Projects & Mentor ----------------
  if (endpoint === '/api/projects' || endpoint === '/api/projects/recommend') {
    return { projects: getStorage('projects', activeTrack.projects) };
  }

  if (endpoint.startsWith('/api/projects/') && method === 'PATCH') {
    const projectId = endpoint.split('/')[3];
    const projects = getStorage('projects', activeTrack.projects);
    const updated = projects.map((p: ProjectRecommendation) =>
      p.id === projectId ? { ...p, status: body.status } : p
    );
    setStorage('projects', updated);
    return { projects: updated };
  }

  if (endpoint.includes('/mentor')) {
    const projectId = endpoint.split('/')[3];
    const q = body.question || 'How should I structure this challenge?';
    const storageKey = `mentor_history_${projectId}`;
    const history: ProjectMentorMessage[] = getStorage(storageKey, [
      {
        id: 'msg_init',
        projectId,
        role: 'mentor',
        content: `Hi Bhagwatilal! I'm your AI Systems Mentor for this lab challenge. I can help with architecture decisions, test design, failure modes, or code review. What are you building first?`,
        createdAt: new Date(Date.now() - 3600 * 1000).toISOString(),
      },
    ]);

    if (method === 'POST') {
      const userMsg: ProjectMentorMessage = {
        id: 'msg_u_' + Date.now(),
        projectId,
        role: 'user',
        content: q,
        createdAt: new Date().toISOString(),
      };

      // Intelligent mentor answer tailored to prompt
      let mentorText = `Excellent architectural consideration for this project. Focus on decoupling data acquisition from state presentation. Always verify failure recovery paths (e.g. exponential backoff, rate limits, schema validation). Consider writing a table-driven unit test before diving into the implementation!`;
      if (q.toLowerCase().includes('pattern') || q.toLowerCase().includes('architecture')) {
        mentorText = `For this challenge, I strongly recommend a Clean Architecture approach: 1) Domain layer with pure business entities; 2) Repository interfaces; 3) Data layer with caching; and 4) Presentation layer with reactive state listeners. This ensures 100% unit-testable components without mocks leaking into business rules.`;
      } else if (q.toLowerCase().includes('test') || q.toLowerCase().includes('edge case')) {
        mentorText = `Key edge cases to guard against: 1) Network timeouts or partial payload drops; 2) Unauthorized 401 tokens requiring silent refresh; 3) Rapid duplicate triggers (debounce user taps); 4) Null/empty JSON payloads. Write tests for each before shipping to production!`;
      }

      const mentorMsg: ProjectMentorMessage = {
        id: 'msg_m_' + Date.now(),
        projectId,
        role: 'mentor',
        content: mentorText,
        createdAt: new Date(Date.now() + 500).toISOString(),
      };

      const updatedHistory = [...history, userMsg, mentorMsg];
      setStorage(storageKey, updatedHistory);
      return { reply: mentorMsg, history: updatedHistory };
    }

    return { messages: history, history };
  }

  // ---------------- Evidence Vault ----------------
  if (endpoint === '/api/evidence') {
    const existing = getStorage('evidence', activeTrack.evidence);
    if (method === 'POST') {
      const newRec: EvidenceRecord = {
        id: 'ev_' + Date.now(),
        userId: DEMO_USER.id,
        title: body.title,
        skillName: body.skillName,
        evidenceType: body.evidenceType,
        urlOrContent: body.urlOrContent,
        verificationStatus: 'AI-Reviewed',
        aiFeedback: 'Verified and reviewed by AI. Architecture demonstrates strong modular separation, error recovery, and production quality standards.',
        score: Math.floor(Math.random() * 11) + 88, // 88 - 98
        createdAt: new Date().toISOString(),
      };
      const updated = [newRec, ...existing];
      setStorage('evidence', updated);

      // Also mark hasEvidence = true on matching skill
      const skills = getStorage('skills', activeTrack.skills);
      const updatedSkills = skills.map((s: SkillItem) =>
        s.name.toLowerCase() === body.skillName?.toLowerCase()
          ? { ...s, hasEvidence: true }
          : s
      );
      setStorage('skills', updatedSkills);

      return { evidence: updated };
    }
    return { evidence: existing };
  }

  if (endpoint.startsWith('/api/evidence/') && method === 'DELETE') {
    const evId = endpoint.split('/').pop();
    const existing = getStorage('evidence', activeTrack.evidence);
    const updated = existing.filter((e: EvidenceRecord) => e.id !== evId);
    setStorage('evidence', updated);
    return { evidence: updated };
  }

  // ---------------- Interview Prep ----------------
  if (endpoint === '/api/interview/questions' || endpoint === '/api/interview/generate') {
    return { questions: getStorage('questions', activeTrack.interviewQuestions) };
  }

  if (endpoint === '/api/interview/attempts') {
    return { attempts: getStorage('attempts', []) };
  }

  if (endpoint === '/api/interview/submit-answer') {
    const textLen = (body.userAnswer || '').length;
    const baseScore = Math.min(96, Math.max(72, Math.floor(textLen / 6) + 65));
    const attempt: InterviewAttempt = {
      id: 'att_' + Date.now(),
      questionId: body.questionId,
      userAnswer: body.userAnswer,
      score: baseScore,
      feedback:
        baseScore > 85
          ? 'Comprehensive and well-reasoned answer! Clearly articulated engineering tradeoffs, failure scenarios, and architectural separation.'
          : 'Good foundation. To push into Senior territory, explicitly detail failure modes (e.g. timeouts, concurrency race conditions) and quantitative performance benchmarks.',
      rubricScores: {
        soundness: Math.round(baseScore * 0.25),
        tradeoffs: Math.round(baseScore * 0.25),
        failureModes: Math.round(baseScore * 0.25),
        precision: Math.round(baseScore * 0.25),
      },
      attemptedAt: new Date().toISOString(),
    };
    const attempts = getStorage('attempts', []);
    setStorage('attempts', [attempt, ...attempts]);
    return { attempt };
  }

  // ---------------- Progress History Events ----------------
  if (endpoint === '/api/progress/events') {
    const defaultEvents: ProgressHistoryEvent[] = [
      {
        id: 'ev_init_1',
        userId: DEMO_USER.id,
        eventType: 'gap_analyzed',
        title: `Career Gap Analysis completed for ${activeTrack.name}`,
        createdAt: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
      },
      {
        id: 'ev_init_2',
        userId: DEMO_USER.id,
        eventType: 'task_completed',
        title: `Completed: ${activeTrack.roadmap.tasks[0]?.title || 'Sprint Task'}`,
        createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
      },
      {
        id: 'ev_init_3',
        userId: DEMO_USER.id,
        eventType: 'evidence_added',
        title: `Added verified proof: ${activeTrack.evidence[0]?.title || 'Project Repository'}`,
        createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
      },
    ];
    return { events: getStorage('events', defaultEvents) };
  }

  // ---------------- Reset Demo ----------------
  if (endpoint === '/api/settings/reset-demo') {
    localStorage.removeItem('sb_profile');
    localStorage.removeItem('sb_skills');
    localStorage.removeItem('sb_gap_analysis');
    localStorage.removeItem('sb_roadmap');
    localStorage.removeItem('sb_projects');
    localStorage.removeItem('sb_evidence');
    localStorage.removeItem('sb_attempts');
    localStorage.removeItem('sb_events');
    setStorage('current_user', DEMO_USER);

    // Re-seed active track
    setStorage('profile', activeTrack.profile);
    setStorage('skills', activeTrack.skills);
    setStorage('gap_analysis', activeTrack.gapAnalysis);
    setStorage('roadmap', activeTrack.roadmap);
    setStorage('projects', activeTrack.projects);
    setStorage('evidence', activeTrack.evidence);
    setStorage('questions', activeTrack.interviewQuestions);

    return { success: true, message: `Reset workspace to fresh demo showcase for ${activeTrack.name}` };
  }

  return {};
}

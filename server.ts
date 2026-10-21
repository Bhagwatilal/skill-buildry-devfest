import http from 'node:http';
import express, { Request, Response, NextFunction } from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

dotenv.config();

import * as db from './server/db.ts';
import * as gemini from './server/gemini.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;

app.use(express.json());

// Auth extraction middleware
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization || req.headers['x-session-token'];
  let token = '';

  if (typeof authHeader === 'string') {
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7).trim();
    } else {
      token = authHeader.trim();
    }
  }

  if (!token) {
    return next();
  }

  const session = db.getSession(token);
  if (!session) {
    return next();
  }

  const user = db.getUserById(session.user_id);
  if (user) {
    req.user = user;
  }
  next();
}

app.use(authMiddleware);

function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required. Please sign in or explore the demo account.' });
  }
  next();
}

// ----------------- Auth API Endpoints -----------------

app.post('/api/auth/register', (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const existing = db.getUserByEmail(email);
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const user = db.createUser(email, password, name);
    const token = db.createSession(user.id);
    res.json({ user, token });
  } catch (err: any) {
    console.error('Registration error:', err);
    res.status(500).json({ error: err.message || 'Registration failed' });
  }
});

app.post('/api/auth/login', (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = db.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isValid = db.verifyPassword(password, user.password_hash, user.salt);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = db.createSession(user.id);
    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
      },
      token,
    });
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({ error: err.message || 'Login failed' });
  }
});

// Demo login - provides instant access to the rich demo profile for contest judges
app.post('/api/auth/demo', (_req: Request, res: Response) => {
  try {
    const demoUser = db.seedDemoData();
    const token = db.createSession(demoUser.id);
    res.json({
      user: {
        id: demoUser.id,
        email: demoUser.email,
        name: demoUser.name,
        avatar: demoUser.avatar,
      },
      token,
    });
  } catch (err: any) {
    console.error('Demo auth error:', err);
    res.status(500).json({ error: 'Failed to initialize demo session' });
  }
});

app.post('/api/auth/logout', (req: AuthenticatedRequest, res: Response) => {
  const authHeader = req.headers.authorization || req.headers['x-session-token'];
  let token = '';
  if (typeof authHeader === 'string') {
    token = authHeader.replace(/^Bearer\s+/, '').trim();
  }
  if (token) {
    db.deleteSession(token);
  }
  res.json({ success: true });
});

app.get('/api/auth/me', (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ authenticated: false });
  }
  res.json({ authenticated: true, user: req.user });
});

// ----------------- Profile & Skills Endpoints -----------------

app.get('/api/profile', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const profile = db.getProfile(req.user!.id);
  const skills = db.getSkills(req.user!.id);
  res.json({ profile, skills });
});

app.post('/api/profile', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const updated = db.saveProfile(req.user!.id, req.body);
    res.json({ profile: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/skills', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const skills = db.getSkills(req.user!.id);
  res.json({ skills });
});

app.post('/api/skills', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const saved = db.saveSkill(req.user!.id, req.body);
    res.json({ skill: saved });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/skills/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  db.deleteSkill(req.user!.id, req.params.id);
  res.json({ success: true });
});

// ----------------- Gap Analysis & Gemini Endpoints -----------------

app.get('/api/gap-analysis', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const analysis = db.getLatestGapAnalysis(req.user!.id);
  res.json({ analysis });
});

app.post('/api/gap-analysis/analyze', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    let profile = db.getProfile(userId);

    // If new profile submitted in payload, save first
    if (req.body.profile) {
      profile = db.saveProfile(userId, req.body.profile);
    }
    if (!profile) {
      return res.status(400).json({ error: 'Please create your career profile before running an analysis.' });
    }

    // If new skills list submitted in payload, sync them
    if (Array.isArray(req.body.skills)) {
      for (const s of req.body.skills) {
        db.saveSkill(userId, s);
      }
    }

    const currentSkills = db.getSkills(userId);
    const aiResult = await gemini.analyzeCareerGap(profile, currentSkills);

    const saved = db.saveGapAnalysis(userId, {
      targetRole: profile.targetRole,
      targetLevel: profile.targetLevel,
      ...aiResult,
    });

    db.recordProgressEvent(userId, 'gap_analyzed', `Completed skill gap analysis for ${profile.targetRole}`);
    res.json({ analysis: saved });
  } catch (err: any) {
    console.error('Analyze career gap error:', err);
    res.status(500).json({ error: err.message || 'AI career analysis failed' });
  }
});

// ----------------- Roadmap Endpoints -----------------

app.get('/api/roadmap', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const roadmap = db.getRoadmap(req.user!.id);
  res.json({ roadmap });
});

app.post('/api/roadmap/generate', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const profile = db.getProfile(userId);
    if (!profile) {
      return res.status(400).json({ error: 'Profile not found. Please complete onboarding first.' });
    }

    const gapAnalysis = db.getLatestGapAnalysis(userId);
    const currentRoadmap = db.getRoadmap(userId);
    const completedTasks = currentRoadmap?.tasks?.filter((t) => t.status === 'completed') || [];

    const newRoadmapData = await gemini.generateRoadmap(profile, gapAnalysis, completedTasks);

    // If there were completed tasks, preserve them or include them
    const saved = db.saveRoadmapWithTasks(userId, {
      ...newRoadmapData,
      targetRole: profile.targetRole,
    });

    db.recordProgressEvent(userId, 'gap_analyzed', `Generated learning roadmap for ${profile.targetRole}`);
    res.json({ roadmap: saved });
  } catch (err: any) {
    console.error('Roadmap generation error:', err);
    res.status(500).json({ error: err.message || 'Failed to generate roadmap' });
  }
});

app.patch('/api/roadmap/tasks/:taskId', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status } = req.body;
    if (!['todo', 'in_progress', 'completed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid task status' });
    }

    const updated = db.updateTaskStatus(req.user!.id, req.params.taskId, status);
    res.json({ roadmap: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------- Projects & Mentor Endpoints -----------------

app.get('/api/projects', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const projects = db.getProjects(req.user!.id);
  res.json({ projects });
});

app.post('/api/projects/recommend', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const profile = db.getProfile(userId);
    if (!profile) return res.status(400).json({ error: 'Profile required' });

    const gapAnalysis = db.getLatestGapAnalysis(userId);
    const recommended = await gemini.recommendProjects(profile, gapAnalysis);

    const saved = db.saveProjectsBatch(userId, recommended);
    res.json({ projects: saved });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to recommend projects' });
  }
});

app.patch('/api/projects/:projectId', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { status } = req.body;
  const updated = db.updateProjectStatus(req.user!.id, req.params.projectId, status);
  res.json({ projects: updated });
});

app.get('/api/projects/:projectId/mentor', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const messages = db.getMentorMessages(req.params.projectId, req.user!.id);
  res.json({ messages });
});

app.post('/api/projects/:projectId/mentor', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { question } = req.body;
    if (!question || !question.trim()) {
      return res.status(400).json({ error: 'Question is required' });
    }

    const userId = req.user!.id;
    const projectId = req.params.projectId;
    const projects = db.getProjects(userId);
    const project = projects.find((p) => p.id === projectId);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const profile = db.getProfile(userId);
    const history = db.getMentorMessages(projectId, userId);

    // Save user question
    db.saveMentorMessage(projectId, userId, 'user', question.trim());

    // Generate AI response
    const mentorReply = await gemini.mentorProject(project, question.trim(), history, profile);

    // Save AI reply
    const assistantMessage = db.saveMentorMessage(projectId, userId, 'assistant', mentorReply);

    res.json({
      reply: assistantMessage,
      history: db.getMentorMessages(projectId, userId),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Mentor request failed' });
  }
});

// ----------------- Evidence Endpoints -----------------

app.get('/api/evidence', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const evidence = db.getEvidenceRecords(req.user!.id);
  res.json({ evidence });
});

app.post('/api/evidence', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const profile = db.getProfile(userId);
    const { title, skillName, evidenceType, urlOrContent, requestAiReview } = req.body;

    if (!title || !skillName || !urlOrContent) {
      return res.status(400).json({ error: 'Title, skill name, and URL or explanation are required.' });
    }

    let aiFeedback = null;
    let verificationStatus: 'Self-Reported' | 'AI-Reviewed' = 'Self-Reported';

    if (requestAiReview) {
      aiFeedback = await gemini.reviewEvidence(title, skillName, urlOrContent, profile?.targetRole || 'Software Engineer');
      verificationStatus = 'AI-Reviewed';
    }

    const records = db.saveEvidenceRecord(userId, {
      title,
      skillName,
      evidenceType,
      urlOrContent,
      verificationStatus,
      aiFeedback,
      projectId: req.body.projectId || null,
    });

    res.json({ evidence: records });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to save evidence' });
  }
});

app.delete('/api/evidence/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const records = db.deleteEvidenceRecord(req.user!.id, req.params.id);
  res.json({ evidence: records });
});

// ----------------- Interview Endpoints -----------------

app.get('/api/interview/questions', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const questions = db.getInterviewQuestions(req.user!.id);
  res.json({ questions });
});

app.post('/api/interview/generate', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const profile = db.getProfile(userId);
    const { category, difficulty } = req.body;

    const questions = await gemini.generateInterviewQuestions(
      profile?.targetRole || 'Software Engineer',
      category || 'Fundamentals',
      difficulty || profile?.targetLevel || 'Mid-Level'
    );

    const saved = db.saveInterviewQuestions(userId, questions);
    res.json({ questions: saved });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to generate interview questions' });
  }
});

app.get('/api/interview/attempts', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const attempts = db.getInterviewAttempts(req.user!.id);
  res.json({ attempts });
});

app.post('/api/interview/submit-answer', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const profile = db.getProfile(userId);
    const { questionId, questionText, rubric, userAnswer } = req.body;

    if (!userAnswer || !userAnswer.trim()) {
      return res.status(400).json({ error: 'Please enter your answer before submitting.' });
    }

    const evaluation = await gemini.evaluateInterviewAnswer(
      questionText,
      rubric,
      userAnswer,
      profile?.targetRole || 'Software Engineer'
    );

    const savedAttempt = db.saveInterviewAttempt(userId, {
      questionId,
      userAnswer,
      score: evaluation.score,
      feedback: evaluation.feedback,
    });

    res.json({ attempt: savedAttempt });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Evaluation failed' });
  }
});

// ----------------- Progress & Settings Endpoints -----------------

app.get('/api/progress/events', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const events = db.getProgressEvents(req.user!.id);
  res.json({ events });
});

app.post('/api/settings/reset-demo', (_req: Request, res: Response) => {
  try {
    db.db.exec(`
      DELETE FROM sessions;
      DELETE FROM progress_events;
      DELETE FROM interview_attempts;
      DELETE FROM interview_questions;
      DELETE FROM evidence_records;
      DELETE FROM project_mentor_messages;
      DELETE FROM projects;
      DELETE FROM roadmap_tasks;
      DELETE FROM roadmaps;
      DELETE FROM gap_analyses;
      DELETE FROM skills;
      DELETE FROM profiles;
      DELETE FROM users;
    `);
    const demoUser = db.seedDemoData();
    res.json({ success: true, message: 'Database reset to default demo showcase' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------- System Health & Diagnostic Endpoint -----------------

app.get('/api/health', (_req: Request, res: Response) => {
  try {
    const userCountRow = db.db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
    const sessionCountRow = db.db.prepare('SELECT COUNT(*) as count FROM sessions').get() as { count: number };
    const taskCountRow = db.db.prepare('SELECT COUNT(*) as count FROM roadmap_tasks').get() as { count: number };

    res.json({
      status: 'ok',
      service: 'Skill Buildry Full-Stack API',
      timestamp: new Date().toISOString(),
      database: {
        type: 'SQLite (node:sqlite)',
        status: 'connected',
        stats: {
          users: userCountRow.count,
          activeSessions: sessionCountRow.count,
          roadmapTasks: taskCountRow.count,
        },
      },
      aiEngine: {
        model: process.env.GEMINI_MODEL || 'gemini-3.8-flash',
        hasKey: Boolean(process.env.GEMINI_API_KEY),
        fallbackEnabled: true,
      },
      environment: process.env.NODE_ENV || 'development',
    });
  } catch (err: any) {
    res.status(500).json({ status: 'error', error: err.message });
  }
});

// ----------------- Vite Integration in Dev / Static in Prod -----------------

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';
  const httpServer = http.createServer(app);

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: {
          server: httpServer,
        },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  let currentPort = PORT;

  function listen(port: number) {
    httpServer.listen(port, '0.0.0.0', () => {
      console.log(`\n  🚀 [Skill Buildry AI] Full-Stack App is ready at:`);
      console.log(`  > Local:   http://localhost:${port}`);
      console.log(`  > Network: http://127.0.0.1:${port}\n`);
    });
  }

  httpServer.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`  ⚠️ Port ${currentPort} is busy. Automatically switching to http://localhost:${currentPort + 1}...`);
      currentPort += 1;
      setTimeout(() => {
        listen(currentPort);
      }, 250);
    } else {
      console.error('Server startup error:', err);
      process.exit(1);
    }
  });

  listen(currentPort);
}

startServer().catch((err) => {
  console.error('Server startup error:', err);
  process.exit(1);
});

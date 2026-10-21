import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';

const DATA_DIR = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, 'skillsprint.db');
export const db = new DatabaseSync(DB_PATH);

// Initialize Tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    salt TEXT NOT NULL,
    name TEXT NOT NULL,
    avatar TEXT,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS profiles (
    user_id TEXT PRIMARY KEY,
    target_role TEXT NOT NULL,
    target_level TEXT NOT NULL,
    current_title TEXT NOT NULL,
    years_experience REAL NOT NULL,
    study_hours_per_day REAL NOT NULL,
    study_days_per_week INTEGER NOT NULL,
    target_timeline_weeks INTEGER NOT NULL,
    learning_style TEXT NOT NULL,
    github_url TEXT,
    portfolio_url TEXT,
    linkedin_url TEXT,
    bio TEXT,
    updated_at TEXT NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS skills (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    self_assessed_level TEXT NOT NULL,
    verified_level TEXT,
    has_evidence INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS gap_analyses (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    target_role TEXT NOT NULL,
    target_level TEXT NOT NULL,
    readiness_score INTEGER NOT NULL,
    analysis_json TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS roadmaps (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    target_role TEXT NOT NULL,
    title TEXT NOT NULL,
    total_weeks INTEGER NOT NULL,
    weekly_hours REAL NOT NULL,
    current_phase INTEGER NOT NULL DEFAULT 1,
    progress_pct INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS roadmap_tasks (
    id TEXT PRIMARY KEY,
    roadmap_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    phase_index INTEGER NOT NULL,
    phase_title TEXT NOT NULL,
    title TEXT NOT NULL,
    objective TEXT NOT NULL,
    why_it_matters TEXT NOT NULL,
    duration_hours REAL NOT NULL,
    difficulty TEXT NOT NULL,
    prerequisites_json TEXT NOT NULL,
    instructions_json TEXT NOT NULL,
    acceptance_criteria_json TEXT NOT NULL,
    resources_json TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'todo',
    completed_at TEXT,
    sort_order INTEGER NOT NULL,
    FOREIGN KEY(roadmap_id) REFERENCES roadmaps(id) ON DELETE CASCADE,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    scope_type TEXT NOT NULL,
    description TEXT NOT NULL,
    why_it_matters TEXT NOT NULL,
    skills_json TEXT NOT NULL,
    difficulty TEXT NOT NULL,
    duration_est_hours REAL NOT NULL,
    deliverables_json TEXT NOT NULL,
    acceptance_criteria_json TEXT NOT NULL,
    test_scenarios_json TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'not_started',
    created_at TEXT NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS project_mentor_messages (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS evidence_records (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    skill_id TEXT,
    skill_name TEXT NOT NULL,
    evidence_type TEXT NOT NULL,
    url_or_content TEXT NOT NULL,
    verification_status TEXT NOT NULL DEFAULT 'Self-Reported',
    ai_feedback TEXT,
    project_id TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS interview_questions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    target_role TEXT NOT NULL,
    category TEXT NOT NULL,
    difficulty TEXT NOT NULL,
    question TEXT NOT NULL,
    rubric_json TEXT NOT NULL,
    sample_answer TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS interview_attempts (
    id TEXT PRIMARY KEY,
    question_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    user_answer TEXT NOT NULL,
    score INTEGER NOT NULL,
    feedback_json TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY(question_id) REFERENCES interview_questions(id) ON DELETE CASCADE,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS progress_events (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    event_type TEXT NOT NULL,
    title TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );
`);

// Password utilities
export function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const actualSalt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, actualSalt, 64).toString('hex');
  return { hash, salt: actualSalt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  try {
    const testHash = crypto.scryptSync(password, salt, 64).toString('hex');
    return crypto.timingSafeEqual(Buffer.from(testHash, 'hex'), Buffer.from(hash, 'hex'));
  } catch {
    return false;
  }
}

// User & Auth queries
export function createUser(email: string, password: string, name: string): { id: string; email: string; name: string } {
  const id = 'usr_' + crypto.randomUUID();
  const { hash, salt } = hashPassword(password);
  const now = new Date().toISOString();

  const stmt = db.prepare(`
    INSERT INTO users (id, email, password_hash, salt, name, avatar, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run(id, email.toLowerCase().trim(), hash, salt, name, `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`, now);

  return { id, email: email.toLowerCase().trim(), name };
}

export function getUserByEmail(email: string) {
  const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
  return stmt.get(email.toLowerCase().trim()) as {
    id: string;
    email: string;
    password_hash: string;
    salt: string;
    name: string;
    avatar: string;
    created_at: string;
  } | undefined;
}

export function getUserById(id: string) {
  const stmt = db.prepare('SELECT id, email, name, avatar, created_at FROM users WHERE id = ?');
  return stmt.get(id) as {
    id: string;
    email: string;
    name: string;
    avatar: string;
    created_at: string;
  } | undefined;
}

export function createSession(userId: string): string {
  const token = 'tok_' + crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  const stmt = db.prepare('INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)');
  stmt.run(token, userId, expiresAt);
  return token;
}

export function getSession(token: string) {
  const stmt = db.prepare('SELECT * FROM sessions WHERE token = ? AND expires_at > ?');
  return stmt.get(token, new Date().toISOString()) as { token: string; user_id: string; expires_at: string } | undefined;
}

export function deleteSession(token: string) {
  const stmt = db.prepare('DELETE FROM sessions WHERE token = ?');
  stmt.run(token);
}

// Profile queries
export function getProfile(userId: string) {
  const stmt = db.prepare('SELECT * FROM profiles WHERE user_id = ?');
  const row = stmt.get(userId) as any;
  if (!row) return null;
  return {
    userId: row.user_id,
    targetRole: row.target_role,
    targetLevel: row.target_level,
    currentTitle: row.current_title,
    yearsExperience: row.years_experience,
    studyHoursPerDay: row.study_hours_per_day,
    studyDaysPerWeek: row.study_days_per_week,
    targetTimelineWeeks: row.target_timeline_weeks,
    learningStyle: row.learning_style,
    githubUrl: row.github_url,
    portfolioUrl: row.portfolio_url,
    linkedinUrl: row.linkedin_url,
    bio: row.bio,
    updatedAt: row.updated_at,
  };
}

export function saveProfile(userId: string, data: any) {
  const now = new Date().toISOString();
  const stmt = db.prepare(`
    INSERT INTO profiles (user_id, target_role, target_level, current_title, years_experience, study_hours_per_day, study_days_per_week, target_timeline_weeks, learning_style, github_url, portfolio_url, linkedin_url, bio, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(user_id) DO UPDATE SET
      target_role=excluded.target_role,
      target_level=excluded.target_level,
      current_title=excluded.current_title,
      years_experience=excluded.years_experience,
      study_hours_per_day=excluded.study_hours_per_day,
      study_days_per_week=excluded.study_days_per_week,
      target_timeline_weeks=excluded.target_timeline_weeks,
      learning_style=excluded.learning_style,
      github_url=excluded.github_url,
      portfolio_url=excluded.portfolio_url,
      linkedin_url=excluded.linkedin_url,
      bio=excluded.bio,
      updated_at=excluded.updated_at
  `);
  stmt.run(
    userId,
    data.targetRole || 'Full Stack Developer',
    data.targetLevel || 'Mid-Level',
    data.currentTitle || 'Developer',
    Number(data.yearsExperience) || 0,
    Number(data.studyHoursPerDay) || 2,
    Number(data.studyDaysPerWeek) || 5,
    Number(data.targetTimelineWeeks) || 12,
    data.learningStyle || 'hands-on',
    data.githubUrl || '',
    data.portfolioUrl || '',
    data.linkedinUrl || '',
    data.bio || '',
    now
  );
  return getProfile(userId);
}

// Skills queries
export function getSkills(userId: string) {
  const stmt = db.prepare('SELECT * FROM skills WHERE user_id = ? ORDER BY category, name');
  const rows = stmt.all(userId) as any[];
  return rows.map((r) => ({
    id: r.id,
    userId: r.user_id,
    name: r.name,
    category: r.category,
    selfAssessedLevel: r.self_assessed_level,
    verifiedLevel: r.verified_level,
    hasEvidence: Boolean(r.has_evidence),
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }));
}

export function saveSkill(userId: string, skill: { id?: string; name: string; category: string; selfAssessedLevel: string; hasEvidence?: boolean }) {
  const id = skill.id || 'skl_' + crypto.randomUUID();
  const now = new Date().toISOString();
  const stmt = db.prepare(`
    INSERT INTO skills (id, user_id, name, category, self_assessed_level, verified_level, has_evidence, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      name=excluded.name,
      category=excluded.category,
      self_assessed_level=excluded.self_assessed_level,
      has_evidence=excluded.has_evidence,
      updated_at=excluded.updated_at
  `);
  stmt.run(id, userId, skill.name, skill.category || 'General', skill.selfAssessedLevel || 'Beginner', null, skill.hasEvidence ? 1 : 0, now, now);
  return { id, userId, ...skill };
}

export function deleteSkill(userId: string, skillId: string) {
  const stmt = db.prepare('DELETE FROM skills WHERE id = ? AND user_id = ?');
  stmt.run(skillId, userId);
}

// Gap analysis queries
export function getLatestGapAnalysis(userId: string) {
  const stmt = db.prepare('SELECT * FROM gap_analyses WHERE user_id = ? ORDER BY created_at DESC LIMIT 1');
  const row = stmt.get(userId) as any;
  if (!row) return null;
  const analysis = JSON.parse(row.analysis_json);
  return {
    id: row.id,
    userId: row.user_id,
    targetRole: row.target_role,
    targetLevel: row.target_level,
    readinessScore: row.readiness_score,
    ...analysis,
    generatedAt: row.created_at,
  };
}

export function saveGapAnalysis(userId: string, data: any) {
  const id = 'gap_' + crypto.randomUUID();
  const now = new Date().toISOString();
  const stmt = db.prepare(`
    INSERT INTO gap_analyses (id, user_id, target_role, target_level, readiness_score, analysis_json, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run(
    id,
    userId,
    data.targetRole || 'Developer',
    data.targetLevel || 'Mid-Level',
    Number(data.readinessScore) || 50,
    JSON.stringify(data),
    now
  );
  return { id, userId, ...data, generatedAt: now };
}

// Roadmap queries
export function getRoadmap(userId: string) {
  const rStmt = db.prepare('SELECT * FROM roadmaps WHERE user_id = ? ORDER BY created_at DESC LIMIT 1');
  const roadmapRow = rStmt.get(userId) as any;
  if (!roadmapRow) return null;

  const tStmt = db.prepare('SELECT * FROM roadmap_tasks WHERE roadmap_id = ? ORDER BY sort_order ASC');
  const taskRows = tStmt.all(roadmapRow.id) as any[];

  const tasks = taskRows.map((t) => ({
    id: t.id,
    roadmapId: t.roadmap_id,
    phaseIndex: t.phase_index,
    phaseTitle: t.phase_title,
    title: t.title,
    objective: t.objective,
    whyItMatters: t.why_it_matters,
    durationHours: t.duration_hours,
    difficulty: t.difficulty,
    prerequisites: JSON.parse(t.prerequisites_json || '[]'),
    instructions: JSON.parse(t.instructions_json || '[]'),
    acceptanceCriteria: JSON.parse(t.acceptance_criteria_json || '[]'),
    resources: JSON.parse(t.resources_json || '[]'),
    status: t.status,
    completedAt: t.completed_at,
    sortOrder: t.sort_order,
  }));

  const completedCount = tasks.filter((t) => t.status === 'completed').length;
  const progressPct = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return {
    id: roadmapRow.id,
    userId: roadmapRow.user_id,
    targetRole: roadmapRow.target_role,
    title: roadmapRow.title,
    totalWeeks: roadmapRow.total_weeks,
    weeklyHours: roadmapRow.weekly_hours,
    currentPhase: roadmapRow.current_phase,
    progressPct,
    tasks,
    createdAt: roadmapRow.created_at,
  };
}

export function saveRoadmapWithTasks(userId: string, data: any) {
  const roadmapId = 'rdm_' + crypto.randomUUID();
  const now = new Date().toISOString();

  const rStmt = db.prepare(`
    INSERT INTO roadmaps (id, user_id, target_role, title, total_weeks, weekly_hours, current_phase, progress_pct, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  rStmt.run(
    roadmapId,
    userId,
    data.targetRole || 'Developer',
    data.title || 'Personalized Career Sprint',
    Number(data.totalWeeks) || 12,
    Number(data.weeklyHours) || 10,
    1,
    0,
    now
  );

  const tStmt = db.prepare(`
    INSERT INTO roadmap_tasks (
      id, roadmap_id, user_id, phase_index, phase_title, title, objective, why_it_matters,
      duration_hours, difficulty, prerequisites_json, instructions_json,
      acceptance_criteria_json, resources_json, status, completed_at, sort_order
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  let order = 0;
  for (const task of data.tasks || []) {
    const taskId = 'tsk_' + crypto.randomUUID();
    tStmt.run(
      taskId,
      roadmapId,
      userId,
      task.phaseIndex || 1,
      task.phaseTitle || 'Phase 1',
      task.title,
      task.objective || '',
      task.whyItMatters || '',
      Number(task.durationHours) || 2,
      task.difficulty || 'Intermediate',
      JSON.stringify(task.prerequisites || []),
      JSON.stringify(task.instructions || []),
      JSON.stringify(task.acceptanceCriteria || []),
      JSON.stringify(task.resources || []),
      task.status || 'todo',
      task.completedAt || null,
      order++
    );
  }

  return getRoadmap(userId);
}

export function updateTaskStatus(userId: string, taskId: string, status: 'todo' | 'in_progress' | 'completed') {
  const completedAt = status === 'completed' ? new Date().toISOString() : null;
  const stmt = db.prepare(`
    UPDATE roadmap_tasks
    SET status = ?, completed_at = ?
    WHERE id = ? AND user_id = ?
  `);
  stmt.run(status, completedAt, taskId, userId);

  // If completed, record progress event
  if (status === 'completed') {
    const taskStmt = db.prepare('SELECT title FROM roadmap_tasks WHERE id = ?');
    const task = taskStmt.get(taskId) as any;
    if (task) {
      recordProgressEvent(userId, 'task_completed', `Completed: ${task.title}`);
    }
  }

  return getRoadmap(userId);
}

// Projects queries
export function getProjects(userId: string) {
  const stmt = db.prepare('SELECT * FROM projects WHERE user_id = ? ORDER BY created_at DESC');
  const rows = stmt.all(userId) as any[];
  return rows.map((r) => ({
    id: r.id,
    userId: r.user_id,
    title: r.title,
    scopeType: r.scope_type,
    description: r.description,
    whyItMatters: r.why_it_matters,
    skillsDemonstrated: JSON.parse(r.skills_json || '[]'),
    difficulty: r.difficulty,
    durationEstHours: r.duration_est_hours,
    deliverables: JSON.parse(r.deliverables_json || '[]'),
    acceptanceCriteria: JSON.parse(r.acceptance_criteria_json || '[]'),
    testScenarios: JSON.parse(r.test_scenarios_json || '[]'),
    status: r.status,
    createdAt: r.created_at,
  }));
}

export function saveProjectsBatch(userId: string, projectsList: any[]) {
  const now = new Date().toISOString();
  const stmt = db.prepare(`
    INSERT INTO projects (
      id, user_id, title, scope_type, description, why_it_matters, skills_json,
      difficulty, duration_est_hours, deliverables_json, acceptance_criteria_json,
      test_scenarios_json, status, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const p of projectsList) {
    const id = p.id || 'prj_' + crypto.randomUUID();
    stmt.run(
      id,
      userId,
      p.title,
      p.scopeType || 'Portfolio Project',
      p.description,
      p.whyItMatters || '',
      JSON.stringify(p.skillsDemonstrated || []),
      p.difficulty || 'Intermediate',
      Number(p.durationEstHours) || 8,
      JSON.stringify(p.deliverables || []),
      JSON.stringify(p.acceptanceCriteria || []),
      JSON.stringify(p.testScenarios || []),
      p.status || 'not_started',
      now
    );
  }

  return getProjects(userId);
}

export function updateProjectStatus(userId: string, projectId: string, status: string) {
  const stmt = db.prepare('UPDATE projects SET status = ? WHERE id = ? AND user_id = ?');
  stmt.run(status, projectId, userId);
  return getProjects(userId);
}

// Project Mentor Messages
export function getMentorMessages(projectId: string, userId: string) {
  const stmt = db.prepare('SELECT * FROM project_mentor_messages WHERE project_id = ? AND user_id = ? ORDER BY created_at ASC');
  const rows = stmt.all(projectId, userId) as any[];
  return rows.map((r) => ({
    id: r.id,
    projectId: r.project_id,
    role: r.role,
    content: r.content,
    createdAt: r.created_at,
  }));
}

export function saveMentorMessage(projectId: string, userId: string, role: 'user' | 'assistant', content: string) {
  const id = 'msg_' + crypto.randomUUID();
  const now = new Date().toISOString();
  const stmt = db.prepare('INSERT INTO project_mentor_messages (id, project_id, user_id, role, content, created_at) VALUES (?, ?, ?, ?, ?, ?)');
  stmt.run(id, projectId, userId, role, content, now);
  return { id, projectId, userId, role, content, createdAt: now };
}

// Evidence Records
export function getEvidenceRecords(userId: string) {
  const stmt = db.prepare('SELECT * FROM evidence_records WHERE user_id = ? ORDER BY created_at DESC');
  const rows = stmt.all(userId) as any[];
  return rows.map((r) => ({
    id: r.id,
    userId: r.user_id,
    title: r.title,
    skillId: r.skill_id,
    skillName: r.skill_name,
    evidenceType: r.evidence_type,
    urlOrContent: r.url_or_content,
    verificationStatus: r.verification_status,
    aiFeedback: r.ai_feedback,
    projectId: r.project_id,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }));
}

export function saveEvidenceRecord(userId: string, data: any) {
  const id = data.id || 'evd_' + crypto.randomUUID();
  const now = new Date().toISOString();
  const stmt = db.prepare(`
    INSERT INTO evidence_records (id, user_id, title, skill_id, skill_name, evidence_type, url_or_content, verification_status, ai_feedback, project_id, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      title=excluded.title,
      skill_name=excluded.skill_name,
      evidence_type=excluded.evidence_type,
      url_or_content=excluded.url_or_content,
      verification_status=excluded.verification_status,
      ai_feedback=excluded.ai_feedback,
      updated_at=excluded.updated_at
  `);
  stmt.run(
    id,
    userId,
    data.title,
    data.skillId || null,
    data.skillName,
    data.evidenceType || 'GitHub Repository',
    data.urlOrContent,
    data.verificationStatus || 'AI-Reviewed',
    data.aiFeedback || null,
    data.projectId || null,
    now,
    now
  );

  // Mark skill as having evidence if matched
  if (data.skillName) {
    db.prepare('UPDATE skills SET has_evidence = 1 WHERE user_id = ? AND LOWER(name) = LOWER(?)').run(userId, data.skillName);
  }

  recordProgressEvent(userId, 'evidence_added', `Evidence added for ${data.skillName}`);
  return getEvidenceRecords(userId);
}

export function deleteEvidenceRecord(userId: string, id: string) {
  const stmt = db.prepare('DELETE FROM evidence_records WHERE id = ? AND user_id = ?');
  stmt.run(id, userId);
  return getEvidenceRecords(userId);
}

// Interview queries
export function getInterviewQuestions(userId: string) {
  const stmt = db.prepare('SELECT * FROM interview_questions WHERE user_id = ? ORDER BY created_at DESC');
  const rows = stmt.all(userId) as any[];
  return rows.map((r) => ({
    id: r.id,
    userId: r.user_id,
    targetRole: r.target_role,
    category: r.category,
    difficulty: r.difficulty,
    question: r.question,
    rubric: JSON.parse(r.rubric_json || '{}'),
    sampleAnswer: r.sample_answer,
    createdAt: r.created_at,
  }));
}

export function saveInterviewQuestions(userId: string, questions: any[]) {
  const now = new Date().toISOString();
  const stmt = db.prepare(`
    INSERT INTO interview_questions (id, user_id, target_role, category, difficulty, question, rubric_json, sample_answer, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const q of questions) {
    const id = q.id || 'que_' + crypto.randomUUID();
    stmt.run(
      id,
      userId,
      q.targetRole || 'Developer',
      q.category || 'Fundamentals',
      q.difficulty || 'Mid-Level',
      q.question,
      JSON.stringify(q.rubric || {}),
      q.sampleAnswer || '',
      now
    );
  }
  return getInterviewQuestions(userId);
}

export function getInterviewAttempts(userId: string) {
  const stmt = db.prepare('SELECT * FROM interview_attempts WHERE user_id = ? ORDER BY created_at DESC');
  const rows = stmt.all(userId) as any[];
  return rows.map((r) => ({
    id: r.id,
    questionId: r.question_id,
    userId: r.user_id,
    userAnswer: r.user_answer,
    score: r.score,
    feedback: JSON.parse(r.feedback_json || '{}'),
    createdAt: r.created_at,
  }));
}

export function saveInterviewAttempt(userId: string, data: any) {
  const id = 'att_' + crypto.randomUUID();
  const now = new Date().toISOString();
  const stmt = db.prepare(`
    INSERT INTO interview_attempts (id, question_id, user_id, user_answer, score, feedback_json, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run(
    id,
    data.questionId,
    userId,
    data.userAnswer,
    Number(data.score) || 75,
    JSON.stringify(data.feedback || {}),
    now
  );

  recordProgressEvent(userId, 'interview_completed', `Scored ${data.score}/100 on interview question`);
  return { id, userId, ...data, createdAt: now };
}

// Progress Events History
export function recordProgressEvent(userId: string, eventType: string, title: string) {
  const id = 'evt_' + crypto.randomUUID();
  const now = new Date().toISOString();
  const stmt = db.prepare('INSERT INTO progress_events (id, user_id, event_type, title, created_at) VALUES (?, ?, ?, ?, ?)');
  stmt.run(id, userId, eventType, title, now);
}

export function getProgressEvents(userId: string) {
  const stmt = db.prepare('SELECT * FROM progress_events WHERE user_id = ? ORDER BY created_at DESC LIMIT 30');
  const rows = stmt.all(userId) as any[];
  return rows.map((r) => ({
    id: r.id,
    userId: r.user_id,
    eventType: r.event_type,
    title: r.title,
    timestamp: r.created_at,
  }));
}

// Demo account seeder
export function seedDemoData() {
  const demoEmail = 'alex.chen@skillsprint.demo';
  let demoUser = getUserByEmail(demoEmail);

  if (!demoUser) {
    const user = createUser(demoEmail, 'demopassword123', 'Alex Chen');
    demoUser = getUserByEmail(demoEmail)!;
  }

  const userId = demoUser.id;

  // Check if profile exists
  if (!getProfile(userId)) {
    saveProfile(userId, {
      targetRole: 'Flutter Developer',
      targetLevel: 'Mid-Level',
      currentTitle: 'Junior Mobile Developer',
      yearsExperience: 1.5,
      studyHoursPerDay: 2,
      studyDaysPerWeek: 5,
      targetTimelineWeeks: 10,
      learningStyle: 'hands-on',
      githubUrl: 'https://github.com/alexchen-dev',
      portfolioUrl: 'https://alexchen.dev',
      linkedinUrl: 'https://linkedin.com/in/alexchen-dev',
      bio: 'Junior mobile developer with hands-on Dart & Flutter experience looking to level up in testing, state architecture, and CI/CD for product companies.',
    });

    // Seed Skills
    const initialSkills = [
      { name: 'Dart Language', category: 'Programming Languages', selfAssessedLevel: 'Advanced', hasEvidence: true },
      { name: 'Flutter Widgets & Layout', category: 'Frameworks & Libraries', selfAssessedLevel: 'Advanced', hasEvidence: true },
      { name: 'REST API & HTTP Integration', category: 'APIs & Backend', selfAssessedLevel: 'Intermediate', hasEvidence: true },
      { name: 'Git & GitHub Collaboration', category: 'Collaboration', selfAssessedLevel: 'Intermediate', hasEvidence: false },
      { name: 'Riverpod / BLoC State Management', category: 'Architecture & Design', selfAssessedLevel: 'Beginner', hasEvidence: false },
      { name: 'Automated Unit & Widget Testing', category: 'Testing & Debugging', selfAssessedLevel: 'Beginner', hasEvidence: false },
      { name: 'Mobile CI/CD & Fastlane', category: 'Deployment & Release', selfAssessedLevel: 'None', hasEvidence: false },
      { name: 'Performance Profiling & Memory Leaks', category: 'Testing & Debugging', selfAssessedLevel: 'Beginner', hasEvidence: false },
    ];
    for (const s of initialSkills) {
      saveSkill(userId, s);
    }

    // Seed Gap Analysis
    saveGapAnalysis(userId, {
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
          suggestedAction: 'Write mockito / mocktail tests for your repository and widget tester tests for forms.',
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
    });

    // Seed Roadmap
    saveRoadmapWithTasks(userId, {
      targetRole: 'Flutter Developer',
      title: 'Mid-Level Product Flutter Mastery Sprint',
      totalWeeks: 10,
      weeklyHours: 10,
      tasks: [
        {
          phaseIndex: 1,
          phaseTitle: 'Phase 1: Architecture & Resilient State',
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
          phaseIndex: 1,
          phaseTitle: 'Phase 1: Architecture & Resilient State',
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
        {
          phaseIndex: 2,
          phaseTitle: 'Phase 2: Automated Testing & Code Quality',
          title: 'Write Unit Tests for Business Logic with Mocktail',
          objective: 'Achieve 85%+ branch coverage on repository and state notifier classes using mocktail.',
          whyItMatters: 'Automated testing protects against regressions and lets you deploy new features with confidence.',
          durationHours: 3,
          difficulty: 'Intermediate',
          prerequisites: ['Dart unit test package', 'Dependency injection'],
          instructions: [
            'Create mock class `class MockApiClient extends Mock implements ApiClient {}`.',
            'Write test group verifying repository returns domain models when API returns HTTP 200.',
            'Write test verifying repository throws CustomNetworkException when API returns 500.',
          ],
          acceptanceCriteria: [
            '`flutter test` passes with 0 failures.',
            'Edge cases like malformed JSON and null fields are tested and guarded.',
          ],
          resources: [
            { title: 'Flutter Unit Testing Guide', url: 'https://docs.flutter.dev/testing/overview#unit-tests', type: 'Official Guide' },
          ],
          status: 'todo',
        },
        {
          phaseIndex: 2,
          phaseTitle: 'Phase 2: Automated Testing & Code Quality',
          title: 'Widget & Golden Testing for Interactive Components',
          objective: 'Test user interaction flows and widget rendering without running an emulator.',
          whyItMatters: 'Widget tests catch UI bugs 10x faster than manual simulator testing.',
          durationHours: 3.5,
          difficulty: 'Intermediate',
          prerequisites: ['WidgetTester fundamentals'],
          instructions: [
            'Use `testWidgets()` to pump the LoginScreen with Riverpod container override.',
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
        {
          phaseIndex: 3,
          phaseTitle: 'Phase 3: CI/CD & Release Pipeline',
          title: 'Configure GitHub Actions for Flutter CI',
          objective: 'Automate linting, unit tests, and release APK building on every pull request.',
          whyItMatters: 'Every modern tech company uses CI to prevent broken code from landing on main.',
          durationHours: 2.5,
          difficulty: 'Intermediate',
          prerequisites: ['Git basics', 'YAML syntax'],
          instructions: [
            'Create `.github/workflows/flutter_ci.yml`.',
            'Add subosito/flutter-action with stable channel.',
            'Run `flutter analyze --fatal-infos` and `flutter test --coverage`.',
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
    });

    // Seed Projects
    saveProjectsBatch(userId, [
      {
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
        title: 'API Explorer with Offline Caching & Paginated Feed',
        scopeType: 'Portfolio Project',
        description: 'Create a production-style application consuming a public REST API (e.g. GitHub repositories or OpenWeather) with infinite scroll pagination, query debouncing, offline caching, and error recovery states.',
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
    ]);

    // Seed Evidence
    saveEvidenceRecord(userId, {
      title: 'Flutter UI Kit & Custom Shimmer Components',
      skillName: 'Flutter Widgets & Layout',
      evidenceType: 'GitHub Repository',
      urlOrContent: 'https://github.com/alexchen-dev/flutter-smooth-ui-kit',
      verificationStatus: 'AI-Reviewed',
      aiFeedback: 'Solid repository structure with clear widget separation. Reusable shimmer skeletons demonstrate good understanding of render repaints. Recommendation: Add golden UI snapshot tests to verify cross-device layouts.',
    });

    saveEvidenceRecord(userId, {
      title: 'REST API Client with Dio & Retry Interceptor',
      skillName: 'REST API & HTTP Integration',
      evidenceType: 'Code Snippet',
      urlOrContent: 'https://github.com/alexchen-dev/flutter-dio-resilient-client',
      verificationStatus: 'AI-Reviewed',
      aiFeedback: 'The interceptor handles 401 refresh flows well. Be sure to implement a lock on concurrent token refresh calls so multiple simultaneous 401s do not trigger duplicate refresh network requests.',
    });

    // Seed Interview Questions
    saveInterviewQuestions(userId, [
      {
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
    ]);

    // Record initial events
    recordProgressEvent(userId, 'gap_analyzed', 'Initial Career Gap Analysis completed');
    recordProgressEvent(userId, 'task_completed', 'Completed: Master Riverpod 2.0 with AsyncNotifier');
    recordProgressEvent(userId, 'evidence_added', 'Added project evidence for Flutter UI Kit');
  }

  return demoUser;
}

// Automatically seed demo data on server start
try {
  seedDemoData();
} catch (err) {
  console.error('Error seeding demo data:', err);
}

import type { SkillLevel, SkillItem, RoadmapTask } from '../types/index.ts';

/**
 * Maps categorical skill assessment level to numeric score (0 to 1)
 */
export function levelToNumeric(level: SkillLevel): number {
  switch (level) {
    case 'Expert':
      return 1.0;
    case 'Advanced':
      return 0.8;
    case 'Intermediate':
      return 0.55;
    case 'Beginner':
      return 0.25;
    case 'None':
    default:
      return 0.0;
  }
}

/**
 * Calculates completion percentage and task metrics for a learning roadmap
 */
export function calculateRoadmapProgress(tasks: RoadmapTask[]): {
  total: number;
  completed: number;
  inProgress: number;
  percentage: number;
} {
  if (!tasks || tasks.length === 0) {
    return { total: 0, completed: 0, inProgress: 0, percentage: 0 };
  }
  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === 'completed').length;
  const inProgress = tasks.filter((t) => t.status === 'in_progress').length;
  const percentage = Math.round((completed / total) * 100);

  return { total, completed, inProgress, percentage };
}

/**
 * Computes skill coverage metrics based on user's current assessed skills
 */
export function calculateSkillMetrics(skills: SkillItem[]): {
  totalSkills: number;
  coveredSkills: number;
  verifiedCount: number;
  coveragePercentage: number;
} {
  if (!skills || skills.length === 0) {
    return { totalSkills: 0, coveredSkills: 0, verifiedCount: 0, coveragePercentage: 0 };
  }

  const totalSkills = skills.length;
  // Skills with at least Intermediate self-assessment or evidence
  const coveredSkills = skills.filter((s) => s.selfAssessedLevel !== 'None' && s.selfAssessedLevel !== 'Beginner').length;
  const verifiedCount = skills.filter((s) => s.hasEvidence || s.verifiedLevel).length;

  const totalPoints = skills.reduce((acc, s) => acc + levelToNumeric(s.selfAssessedLevel), 0);
  const coveragePercentage = Math.min(100, Math.round((totalPoints / (totalSkills * 0.8)) * 100));

  return {
    totalSkills,
    coveredSkills,
    verifiedCount,
    coveragePercentage,
  };
}

/**
 * Calculates Career Readiness score (0-100) transparently from 4 core pillars:
 * 1. Skill Coverage (40%)
 * 2. Project & Verifiable Evidence (25%)
 * 3. Learning Task Completion (20%)
 * 4. Technical Interview Readiness (15%)
 */
export function calculateCareerReadiness(params: {
  skillCoveragePct: number;
  taskCompletionPct: number;
  evidenceCount: number;
  interviewAvgScore: number;
}): {
  overallScore: number;
  breakdown: {
    skillCoverage: number;
    projectEvidence: number;
    taskCompletion: number;
    interviewReadiness: number;
  };
  tierLabel: string;
} {
  const { skillCoveragePct, taskCompletionPct, evidenceCount, interviewAvgScore } = params;

  // 1. Skill coverage contributes up to 40 points
  const skillPart = Math.min(40, Math.round((Math.max(0, skillCoveragePct) / 100) * 40));

  // 2. Project evidence: 4+ solid pieces of evidence yields full 25 points (6.25 pts per item)
  const evidencePart = Math.min(25, Math.round(evidenceCount * 6.25));

  // 3. Learning task completion contributes up to 20 points
  const taskPart = Math.min(20, Math.round((Math.max(0, taskCompletionPct) / 100) * 20));

  // 4. Interview preparation: average score contributes up to 15 points
  const interviewPart = Math.min(15, Math.round((Math.max(0, interviewAvgScore) / 100) * 15));

  const overallScore = Math.min(100, skillPart + evidencePart + taskPart + interviewPart);

  let tierLabel = 'Early Foundations';
  if (overallScore >= 85) {
    tierLabel = 'Job-Interview Ready';
  } else if (overallScore >= 70) {
    tierLabel = 'Strong Candidate Phase';
  } else if (overallScore >= 50) {
    tierLabel = 'Intermediate Progression';
  } else if (overallScore >= 25) {
    tierLabel = 'Building Core Competencies';
  }

  return {
    overallScore,
    breakdown: {
      skillCoverage: skillPart,
      projectEvidence: evidencePart,
      taskCompletion: taskPart,
      interviewReadiness: interviewPart,
    },
    tierLabel,
  };
}

/**
 * Filters and prioritizes today's active sprint tasks:
 * Takes tasks currently in progress first, then upcoming incomplete tasks.
 */
export function getTodaySprintTasks(tasks: RoadmapTask[], maxTasks = 3): RoadmapTask[] {
  if (!tasks || tasks.length === 0) return [];

  const inProgress = tasks.filter((t) => t.status === 'in_progress');
  const todo = tasks.filter((t) => t.status === 'todo');

  return [...inProgress, ...todo].slice(0, maxTasks);
}

export type SkillLevel = 'None' | 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt?: string;
}

export interface Profile {
  userId: string;
  targetRole: string;
  targetLevel: 'Entry-Level' | 'Junior' | 'Mid-Level' | 'Senior';
  currentTitle: string;
  yearsExperience: number;
  studyHoursPerDay: number;
  studyDaysPerWeek: number;
  targetTimelineWeeks: number;
  learningStyle: 'hands-on' | 'guided' | 'reading' | 'mixed';
  githubUrl?: string;
  portfolioUrl?: string;
  linkedinUrl?: string;
  bio?: string;
  updatedAt?: string;
}

export interface SkillItem {
  id: string;
  userId: string;
  name: string;
  category: string;
  selfAssessedLevel: SkillLevel;
  verifiedLevel?: SkillLevel;
  hasEvidence: boolean;
  relatedProjectCount?: number;
  updatedAt?: string;
}

export interface GapSkill {
  name: string;
  category: string;
  currentLevel: SkillLevel;
  expectedLevel: SkillLevel;
  gapSize: 'none' | 'small' | 'moderate' | 'large';
  priority: 'High Priority' | 'Needs Improvement' | 'Strong Foundation';
  importance: 'critical' | 'important' | 'beneficial';
  rationale: string;
  suggestedAction: string;
}

export interface GapAnalysis {
  id?: string;
  userId: string;
  targetRole: string;
  targetLevel: string;
  readinessScore: number;
  readinessBreakdown: {
    skillCoverage: number;
    projectEvidence: number;
    taskCompletion: number;
    interviewReadiness: number;
  };
  summary: string;
  skills: GapSkill[];
  generatedAt: string;
}

export interface RoadmapTask {
  id: string;
  roadmapId: string;
  phaseIndex: number;
  phaseTitle: string;
  title: string;
  objective: string;
  whyItMatters: string;
  durationHours: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  prerequisites: string[];
  instructions: string[];
  acceptanceCriteria: string[];
  resources: Array<{ title: string; url: string; type: string }>;
  status: 'todo' | 'in_progress' | 'completed';
  completedAt?: string;
  sortOrder: number;
}

export interface Roadmap {
  id: string;
  userId: string;
  targetRole: string;
  title: string;
  totalWeeks: number;
  weeklyHours: number;
  currentPhase: number;
  progressPct: number;
  tasks: RoadmapTask[];
  createdAt: string;
}

export interface ProjectRecommendation {
  id: string;
  userId: string;
  title: string;
  scopeType: 'Starter Project' | 'Portfolio Project' | 'Production Challenge';
  description: string;
  whyItMatters: string;
  skillsDemonstrated: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  durationEstHours: number;
  deliverables: string[];
  acceptanceCriteria: string[];
  testScenarios: string[];
  status: 'not_started' | 'in_progress' | 'completed';
  createdAt?: string;
}

export interface ProjectMentorMessage {
  id: string;
  projectId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export interface EvidenceRecord {
  id: string;
  userId: string;
  title: string;
  skillId?: string;
  skillName: string;
  evidenceType: 'GitHub Repository' | 'Live Project' | 'Portfolio Link' | 'Code Snippet' | 'Architecture Document';
  urlOrContent: string;
  verificationStatus: 'Self-Reported' | 'AI-Reviewed' | 'Evidence-Attached';
  aiFeedback?: string;
  projectId?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface InterviewQuestion {
  id: string;
  userId: string;
  targetRole: string;
  category: 'Fundamentals' | 'Practical Implementation' | 'Debugging & Troubleshooting' | 'Architecture & Design' | 'Scenario-Based';
  difficulty: 'Junior' | 'Mid-Level' | 'Senior';
  question: string;
  rubric: {
    keyConcepts: string[];
    whatGoodLooksLike: string;
    commonMistakes: string[];
  };
  sampleAnswer?: string;
  createdAt: string;
}

export interface InterviewAttempt {
  id: string;
  questionId: string;
  userId: string;
  userAnswer: string;
  score: number; // 0-100
  feedback: {
    whatWasExplainedWell: string[];
    whatCouldBeImproved: string[];
    importantMissingConcepts: string[];
    strongerAnswerSuggestion: string;
    followUpQuestion: string;
  };
  createdAt: string;
}

export interface ProgressHistoryEvent {
  id: string;
  userId: string;
  eventType: 'task_completed' | 'evidence_added' | 'interview_completed' | 'gap_analyzed';
  title: string;
  timestamp: string;
}

export interface UserGoalReward {
  id: string;
  userId?: string;
  title: string;
  category: 'gadget' | 'travel' | 'entertainment' | 'dining' | 'lifestyle';
  targetMilestone: string;
  estimatedCost?: string;
  requiredTasks: number;
  isUnlocked: boolean;
  isClaimed?: boolean;
  createdAt: string;
}

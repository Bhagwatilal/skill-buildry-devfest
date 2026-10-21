import test from 'node:test';
import assert from 'node:assert/strict';
import {
  levelToNumeric,
  calculateRoadmapProgress,
  calculateSkillMetrics,
  calculateCareerReadiness,
  getTodaySprintTasks,
} from './scoring.ts';
import type { SkillItem, RoadmapTask } from '../types/index.ts';

test('levelToNumeric returns expected float score for levels', () => {
  assert.equal(levelToNumeric('Expert'), 1.0);
  assert.equal(levelToNumeric('Advanced'), 0.8);
  assert.equal(levelToNumeric('Intermediate'), 0.55);
  assert.equal(levelToNumeric('Beginner'), 0.25);
  assert.equal(levelToNumeric('None'), 0.0);
});

test('calculateRoadmapProgress handles empty and non-empty tasks correctly', () => {
  assert.deepEqual(calculateRoadmapProgress([]), {
    total: 0,
    completed: 0,
    inProgress: 0,
    percentage: 0,
  });

  const dummyTasks = [
    { id: '1', status: 'completed' },
    { id: '2', status: 'in_progress' },
    { id: '3', status: 'todo' },
    { id: '4', status: 'completed' },
  ] as RoadmapTask[];

  const progress = calculateRoadmapProgress(dummyTasks);
  assert.equal(progress.total, 4);
  assert.equal(progress.completed, 2);
  assert.equal(progress.inProgress, 1);
  assert.equal(progress.percentage, 50);
});

test('calculateSkillMetrics calculates correct coverage and verified skills', () => {
  const dummySkills: SkillItem[] = [
    {
      id: 's1',
      userId: 'u1',
      name: 'Dart',
      category: 'Languages',
      selfAssessedLevel: 'Advanced',
      hasEvidence: true,
    },
    {
      id: 's2',
      userId: 'u1',
      name: 'Flutter',
      category: 'Frameworks',
      selfAssessedLevel: 'Intermediate',
      hasEvidence: false,
    },
    {
      id: 's3',
      userId: 'u1',
      name: 'Testing',
      category: 'Quality',
      selfAssessedLevel: 'Beginner',
      hasEvidence: false,
    },
  ];

  const metrics = calculateSkillMetrics(dummySkills);
  assert.equal(metrics.totalSkills, 3);
  assert.equal(metrics.coveredSkills, 2); // Dart and Flutter
  assert.equal(metrics.verifiedCount, 1); // Dart has evidence
  assert.ok(metrics.coveragePercentage > 50);
});

test('calculateCareerReadiness transparently aggregates 4 pillars', () => {
  const readiness = calculateCareerReadiness({
    skillCoveragePct: 75,
    taskCompletionPct: 50,
    evidenceCount: 2,
    interviewAvgScore: 80,
  });

  // skillPart: 75% of 40 = 30
  // evidencePart: 2 * 6.25 = 12.5 -> 13 rounded
  // taskPart: 50% of 20 = 10
  // interviewPart: 80% of 15 = 12
  // Total: 30 + 13 + 10 + 12 = 65
  assert.equal(readiness.breakdown.skillCoverage, 30);
  assert.equal(readiness.breakdown.taskCompletion, 10);
  assert.equal(readiness.breakdown.interviewReadiness, 12);
  assert.equal(readiness.overallScore, 65);
  assert.equal(readiness.tierLabel, 'Intermediate Progression');
});

test('getTodaySprintTasks prioritizes in_progress then todo tasks up to limit', () => {
  const tasks = [
    { id: '1', title: 'Task 1', status: 'completed' },
    { id: '2', title: 'Task 2', status: 'in_progress' },
    { id: '3', title: 'Task 3', status: 'todo' },
    { id: '4', title: 'Task 4', status: 'todo' },
    { id: '5', title: 'Task 5', status: 'todo' },
  ] as RoadmapTask[];

  const sprint = getTodaySprintTasks(tasks, 2);
  assert.equal(sprint.length, 2);
  assert.equal(sprint[0].id, '2'); // in_progress first
  assert.equal(sprint[1].id, '3'); // then first todo
});

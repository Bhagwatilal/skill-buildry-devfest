import type { UserGoalReward } from '../types/index.ts';

const REWARDS_STORAGE_KEY = 'skillbuildry_goal_rewards_v1';

export const DEFAULT_GOAL_REWARDS: UserGoalReward[] = [
  {
    id: 'reward-1',
    title: 'Sony WH-1000XM5 Noise-Cancelling Headphones',
    category: 'gadget',
    targetMilestone: 'Master Raft Consensus & Complete Week 4 Sprint',
    estimatedCost: '$380',
    requiredTasks: 8,
    isUnlocked: false,
    isClaimed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'reward-2',
    title: 'Weekend Solo Road Trip & Mountain Cabin Getaway',
    category: 'travel',
    targetMilestone: 'Reach 85+ Career Readiness Score & Deploy Vault',
    estimatedCost: '$450',
    requiredTasks: 16,
    isUnlocked: false,
    isClaimed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'reward-3',
    title: 'IMAX Sci-Fi Movie Night & Gourmet Burger Feast with Friends',
    category: 'entertainment',
    targetMilestone: 'Complete First 5 Auditable Roadmap Tasks',
    estimatedCost: '$65',
    requiredTasks: 5,
    isUnlocked: false,
    isClaimed: false,
    createdAt: new Date().toISOString(),
  },
];

export function getSavedGoalRewards(): UserGoalReward[] {
  try {
    const raw = localStorage.getItem(REWARDS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to load saved goal rewards from localStorage:', e);
  }
  return DEFAULT_GOAL_REWARDS;
}

export function saveGoalRewards(rewards: UserGoalReward[]): void {
  try {
    localStorage.setItem(REWARDS_STORAGE_KEY, JSON.stringify(rewards));
  } catch (e) {
    console.warn('Failed to save goal rewards to localStorage:', e);
  }
}

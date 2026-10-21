import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Award,
  Layers,
  Info,
  Calendar,
  ExternalLink,
  ChevronRight,
  HelpCircle,
  X,
  Play,
  MoreVertical,
  ArrowUpDown,
  TrendingUp,
  Cpu,
  BarChart3,
  BookOpen,
  GraduationCap,
  Users,
  FileText,
  FileCheck2,
  Check,
  Gift,
  Plane,
  Headphones,
  Film,
  Coffee,
  Trophy,
  Lock,
  Unlock,
  Plus,
  Trash2,
} from 'lucide-react';
import type {
  User,
  Profile,
  SkillItem,
  GapAnalysis,
  Roadmap,
  RoadmapTask,
  ProjectRecommendation,
  ProgressHistoryEvent,
  UserGoalReward,
} from '../types/index.ts';
import { calculateCareerReadiness, getTodaySprintTasks } from '../utils/scoring.ts';
import { getSavedGoalRewards, saveGoalRewards } from '../utils/rewards.ts';
import type { NavTab } from '../components/layout/AppSidebar.tsx';

interface DashboardPageProps {
  user: User | null;
  profile: Profile | null;
  skills: SkillItem[];
  gapAnalysis: GapAnalysis | null;
  roadmap: Roadmap | null;
  projects: ProjectRecommendation[];
  events: ProgressHistoryEvent[];
  onNavigate: (tab: NavTab) => void;
  onToggleTask: (taskId: string, currentStatus: 'todo' | 'in_progress' | 'completed') => Promise<void>;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  user,
  profile,
  skills,
  gapAnalysis,
  roadmap,
  projects,
  events,
  onNavigate,
  onToggleTask,
}) => {
  const [showReadinessModal, setShowReadinessModal] = useState(false);
  const [completingTaskId, setCompletingTaskId] = useState<string | null>(null);

  // Compute actual completed tasks
  const tasks = roadmap?.tasks || [];
  const completedTasks = tasks.filter((t) => t.status === 'completed');
  const taskCompletionPct = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;

  // Skills with evidence count
  const evidenceCount = skills.filter((s) => s.hasEvidence).length;

  // Calculate live career readiness
  const readiness = calculateCareerReadiness({
    skillCoveragePct: gapAnalysis?.readinessBreakdown?.skillCoverage
      ? (gapAnalysis.readinessBreakdown.skillCoverage / 40) * 100
      : 50,
    taskCompletionPct,
    evidenceCount: Math.max(evidenceCount, completedTasks.length > 0 ? 2 : 1),
    interviewAvgScore: gapAnalysis?.readinessBreakdown?.interviewReadiness
      ? (gapAnalysis.readinessBreakdown.interviewReadiness / 15) * 100
      : 60,
  });

  const todaySprintTasks = getTodaySprintTasks(tasks, 3);
  const nextIncompleteTask = tasks.find((t) => t.status !== 'completed');

  const handleTaskCheck = async (task: RoadmapTask) => {
    setCompletingTaskId(task.id);
    const newStatus = task.status === 'completed' ? 'todo' : 'completed';
    try {
      await onToggleTask(task.id, newStatus);
    } finally {
      setCompletingTaskId(null);
    }
  };

  // Goal Rewards State
  const [goalRewards, setGoalRewards] = useState<UserGoalReward[]>(() => getSavedGoalRewards());
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<'gadget' | 'travel' | 'entertainment' | 'dining' | 'lifestyle'>('gadget');
  const [newMilestone, setNewMilestone] = useState('Complete 5 Sprint Roadmap Tasks');
  const [newRequiredTasks, setNewRequiredTasks] = useState(5);
  const [newCost, setNewCost] = useState('$150');

  const handleAddReward = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const created: UserGoalReward = {
      id: `reward-${Date.now()}`,
      title: newTitle.trim(),
      category: newCategory,
      targetMilestone: newMilestone.trim() || 'Complete 5 Sprint Tasks',
      estimatedCost: newCost.trim() || '$100',
      requiredTasks: Math.max(1, newRequiredTasks),
      isUnlocked: completedTasks.length >= newRequiredTasks,
      isClaimed: false,
      createdAt: new Date().toISOString(),
    };
    const updated = [created, ...goalRewards];
    setGoalRewards(updated);
    saveGoalRewards(updated);
    setShowRewardModal(false);
    setNewTitle('');
  };

  const handleDeleteReward = (id: string) => {
    const updated = goalRewards.filter((r) => r.id !== id);
    setGoalRewards(updated);
    saveGoalRewards(updated);
  };

  const handleClaimReward = (id: string) => {
    const updated = goalRewards.map((r) => (r.id === id ? { ...r, isClaimed: true } : r));
    setGoalRewards(updated);
    saveGoalRewards(updated);
  };

  // 7-day capsule bar chart mock dataset matching the template
  const chartDays = [
    { day: '27 Jun', opsHeight: 38, transferHeight: 28, targetHeight: 70, dot: true, badge: null, active: false },
    { day: '28 Jun', opsHeight: 24, transferHeight: 20, targetHeight: 55, dot: true, badge: null, active: false },
    { day: '29 Jun', opsHeight: 46, transferHeight: 16, targetHeight: 75, dot: true, badge: null, active: false },
    { day: '30 Jun', opsHeight: 0, transferHeight: 0, targetHeight: 80, dot: true, badge: null, active: false },
    { day: '1 Jul', opsHeight: 52, transferHeight: 32, targetHeight: 90, dot: true, badge: '8.7%', active: true },
    { day: '2 Jul', opsHeight: 0, transferHeight: 0, targetHeight: 85, dot: true, badge: null, active: false },
    { day: '3 Jul', opsHeight: 32, transferHeight: 30, targetHeight: 65, dot: true, badge: null, active: false },
    { day: '4 Jul', opsHeight: 40, transferHeight: 25, targetHeight: 70, dot: true, badge: null, active: false },
  ];

  return (
    <div className="space-y-6">
      {/* TOP ROW: 3 BENTO CARDS MATCHING TEMPLATE */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* Card 1: White Bento - Operations / Skill Coverage */}
        <div className="md:col-span-4 bento-card-white p-6 flex flex-col justify-between">
          <div>
            {/* Header with icon, title, and 3-dots */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-700">
                  <Cpu className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-[#111215]">Skill Coverage</span>
              </div>
              <button
                onClick={() => onNavigate('skills')}
                className="text-slate-400 hover:text-slate-700 p-1"
                aria-label="Skill options"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>

            {/* Metric & Percentage Pill */}
            <div className="mt-4 flex items-baseline justify-between">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[#111215]">
                  780
                </span>
                <span className="text-xs text-slate-400 font-semibold">/ 1000</span>
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#EBFD7A] text-[#283500] text-[10px] font-bold border border-[#D8EE60]">
                82% ◯
              </span>
            </div>
          </div>

          {/* Capsule Segmented Progress Bar (8 vertical capsule pills) */}
          <div className="mt-6 pt-3">
            <div className="capsule-pill-track justify-between">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div
                  key={i}
                  className={`capsule-pill-segment ${
                    i <= 5
                      ? 'bg-[#121417]'
                      : 'border-2 border-dashed border-slate-300 bg-slate-50'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Card 2: Signature Acid Lime Bento - Career Readiness */}
        <div className="md:col-span-4 bento-card-lime p-6 flex flex-col justify-between">
          <div>
            {/* Header with transfer icon, title, and 3-dots */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#111215]/10 flex items-center justify-center text-[#111215]">
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-[#111215]">Career Readiness</span>
              </div>
              <button
                onClick={() => setShowReadinessModal(true)}
                className="text-slate-700 hover:text-[#111215] p-1"
                aria-label="Readiness details"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>

            {/* Metric & White Percentage Pill */}
            <div className="mt-4 flex items-baseline justify-between">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[#111215]">
                  {readiness.overallScore}
                </span>
                <span className="text-xs text-[#111215]/60 font-semibold">/ 100 pts</span>
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white text-[#111215] text-[10px] font-bold shadow-xs">
                {readiness.tierLabel}
              </span>
            </div>
          </div>

          {/* Capsule Segmented Progress Bar (8 vertical capsule pills on lime background) */}
          <div className="mt-6 pt-3">
            <div className="capsule-pill-track justify-between">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => {
                const filledCount = Math.round((readiness.overallScore / 100) * 8);
                const isFilled = i <= filledCount;
                return (
                  <div
                    key={i}
                    className={`capsule-pill-segment ${
                      isFilled
                        ? 'bg-[#121417]'
                        : 'border-2 border-dashed border-[#111215]/30 bg-[#111215]/5'
                    }`}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Card 3: Dark Bento - Take Your Automation & Career to Next Level */}
        <div className="md:col-span-4 bento-card-dark p-6 relative flex flex-col justify-between overflow-hidden">
          {/* Subtle background ambient mesh */}
          <div className="absolute -right-8 -top-8 w-36 h-36 rounded-full bg-emerald-500/15 blur-2xl pointer-events-none" />

          <div>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-[#E2F86B] uppercase tracking-wider mb-1">
              <span>Goal Sprint Active</span>
              <TrendingUp className="w-3.5 h-3.5" />
            </div>

            <h3 className="text-lg font-bold text-white tracking-tight leading-snug max-w-[210px]">
              Take Your Career to the Next Level
            </h3>
          </div>

          <div className="mt-6 pt-2">
            <button
              onClick={() => onNavigate('roadmap')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-[#111215] hover:bg-slate-100 text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <span>Continue Sprint</span>
              <span className="text-[10px]">▷</span>
            </button>
          </div>
        </div>
      </div>

      {/* LOWER SECTION: WIDE DUAL-COLOR CAPSULE BAR CHART + RIGHT RESOURCE TILES */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left 8 Cols: Dual-Color Capsule Bar Chart & Sprint Tasks */}
        <div className="lg:col-span-8 space-y-5">
          {/* Main Statistics Chart Card */}
          <div className="bento-card-white p-6 space-y-6">
            {/* Header with Title, Legend & Year Pill */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-700">
                  <BarChart3 className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-base font-bold text-[#111215]">Statistics</h3>
              </div>

              {/* Legend & Year Dropdown */}
              <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#121417]" />
                  <span>Roadmap Tasks</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#E2F86B] border border-[#C5DF4B]" />
                  <span>Evidence Proof</span>
                </div>
                <div className="px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-semibold">
                  2026 ⌵
                </div>
              </div>
            </div>

            {/* Signature Dual-Color Capsule Bar Chart matching the template */}
            <div className="relative pt-6 pb-2">
              {/* Y-Axis Guidelines & Labels */}
              <div className="absolute inset-x-0 inset-y-0 flex flex-col justify-between pointer-events-none text-[10px] text-slate-400 font-mono pr-4">
                {[1.0, 0.8, 0.6, 0.4, 0.2, 0.1].map((val) => (
                  <div key={val} className="flex items-center gap-3">
                    <span className="w-5 text-right">{val.toFixed(1)}</span>
                    <div className="flex-1 border-b border-dashed border-slate-100" />
                  </div>
                ))}
              </div>

              {/* 8 Columns with Dual-Color Capsule Bars */}
              <div className="relative z-10 grid grid-cols-8 gap-2 sm:gap-3 pl-8 pr-2 h-56 items-end">
                {chartDays.map((item, idx) => (
                  <div key={idx} className="flex flex-col items-center h-full justify-end group">
                    {/* Dotted Target Line with circle top */}
                    {item.targetHeight > 0 && (
                      <div
                        className="w-0.5 border-l-2 border-dashed border-slate-300 relative"
                        style={{ height: `${item.targetHeight}%` }}
                      >
                        {/* Target Circle Node at top of dotted line */}
                        <div className="absolute -top-1 -left-[5px] w-3 h-3 rounded-full border-2 border-slate-300 bg-white" />
                      </div>
                    )}

                    {/* Stacked Capsule Bars */}
                    {item.opsHeight > 0 && (
                      <div className="w-5 sm:w-6 flex flex-col items-center gap-0.5 relative -mt-3">
                        {/* Floating Percentage Badge on active column */}
                        {item.badge && (
                          <div className="absolute -top-6 px-1.5 py-0.5 rounded-full bg-[#121417] text-white text-[9px] font-bold shadow-xs whitespace-nowrap">
                            {item.badge}
                          </div>
                        )}

                        {/* Top Black Capsule */}
                        <div
                          className="w-full bg-[#121417] rounded-full flex items-center justify-center text-white text-[8px] transition-all"
                          style={{ height: `${item.opsHeight * 1.6}px` }}
                        >
                          {item.dot && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>

                        {/* Bottom Acid Lime Capsule */}
                        <div
                          className="w-full bg-[#E2F86B] border border-[#CCE855] rounded-full flex items-center justify-center text-[#111215] text-[8px] transition-all"
                          style={{ height: `${item.transferHeight * 1.6}px` }}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-[#111215]" />
                        </div>
                      </div>
                    )}

                    {/* X-Axis Date Label */}
                    <span
                      className={`text-[10px] mt-3 whitespace-nowrap transition-colors ${
                        item.active
                          ? 'font-bold text-[#111215] bg-[#E2F86B] px-1.5 py-0.2 rounded-md'
                          : 'text-slate-400 font-medium'
                      }`}
                    >
                      {item.day}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Today's Sprint Tasks Checklist (matching template styling) */}
          <div className="bento-card-white p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E2F86B] border border-[#111215]" />
                <h4 className="text-sm font-bold text-[#111215]">Today's Sprint Tasks</h4>
              </div>
              <button
                onClick={() => onNavigate('roadmap')}
                className="text-xs font-semibold text-[#111215] hover:underline"
              >
                View Full Roadmap &rarr;
              </button>
            </div>

            {todaySprintTasks.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-500">
                <CheckCircle2 className="w-8 h-8 text-[#111215] mx-auto mb-2" />
                All sprint tasks finished! Great velocity today.
              </div>
            ) : (
              <div className="space-y-2.5">
                {todaySprintTasks.map((task) => {
                  const isCompleted = task.status === 'completed';
                  const isUpdating = completingTaskId === task.id;

                  return (
                    <div
                      key={task.id}
                      className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                        isCompleted
                          ? 'bg-slate-50 border-slate-200/60 opacity-70'
                          : 'bg-white border-slate-200/90 hover:border-slate-400 shadow-xs'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Custom round checkbox */}
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() => handleTaskCheck(task)}
                          className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors shrink-0 cursor-pointer ${
                            isCompleted
                              ? 'bg-[#121417] border-[#121417] text-white'
                              : 'border-slate-300 hover:border-[#121417] bg-white'
                          }`}
                        >
                          {isCompleted && <Check className="w-3.5 h-3.5" />}
                        </button>

                        <div className="min-w-0">
                          <span
                            className={`text-xs font-bold truncate block ${
                              isCompleted ? 'line-through text-slate-400' : 'text-[#111215]'
                            }`}
                          >
                            {task.title}
                          </span>
                          <span className="text-[10px] text-slate-500">{task.objective}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          {task.durationHours} hrs
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E2F86B] text-[#1A2200]">
                          {task.difficulty}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right 4 Cols: Quick Access Tiles & Resource Stack matching template */}
        <div className="lg:col-span-4 space-y-4">
          {/* Milestone Bounties & Self-Rewards Widget */}
          <div className="bento-card-white p-5 space-y-3.5 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#E2F86B] text-[#1A2200] flex items-center justify-center font-bold text-xs shadow-xs">
                  <Gift className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-[#111215] uppercase tracking-wider">
                    Milestone Bounties
                  </h3>
                  <span className="text-[10px] font-semibold text-slate-500">
                    Self-rewards for mastering skills
                  </span>
                </div>
              </div>

              <button
                onClick={() => setShowRewardModal(true)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#121417] text-white hover:bg-[#20242B] text-[11px] font-bold shadow-xs transition-all active:scale-95 cursor-pointer"
              >
                <Plus className="w-3 h-3 text-[#E2F86B]" />
                <span>Add Goal</span>
              </button>
            </div>

            {/* List of active rewards */}
            <div className="space-y-2.5">
              {goalRewards.map((reward) => {
                const isTasksUnlocked = completedTasks.length >= reward.requiredTasks;
                const isUnlocked = reward.isUnlocked || isTasksUnlocked;
                const progressPct = Math.min(100, Math.round((completedTasks.length / reward.requiredTasks) * 100));

                return (
                  <div
                    key={reward.id}
                    className={`p-3 rounded-2xl border transition-all space-y-2 ${
                      isUnlocked
                        ? 'bg-gradient-to-r from-emerald-50/80 to-white border-emerald-300 shadow-xs'
                        : 'bg-slate-50/60 border-slate-200/80 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs shrink-0 ${
                          reward.category === 'travel' ? 'bg-sky-100 text-sky-700' :
                          reward.category === 'entertainment' ? 'bg-amber-100 text-amber-700' :
                          reward.category === 'dining' ? 'bg-orange-100 text-orange-700' :
                          'bg-purple-100 text-purple-700'
                        }`}>
                          {reward.category === 'travel' && <Plane className="w-3.5 h-3.5" />}
                          {reward.category === 'entertainment' && <Film className="w-3.5 h-3.5" />}
                          {reward.category === 'dining' && <Coffee className="w-3.5 h-3.5" />}
                          {reward.category === 'gadget' && <Headphones className="w-3.5 h-3.5" />}
                          {reward.category === 'lifestyle' && <Gift className="w-3.5 h-3.5" />}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-[#111215] truncate">
                            {reward.title}
                          </h4>
                          <span className="text-[10px] text-slate-500 font-medium block truncate">
                            {reward.targetMilestone}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="font-mono text-[10px] font-bold text-slate-600 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                          {reward.estimatedCost}
                        </span>
                        <button
                          onClick={() => handleDeleteReward(reward.id)}
                          title="Delete reward"
                          className="text-slate-400 hover:text-rose-500 p-1 rounded-md transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-[10px] font-bold">
                        <span className="text-slate-500">
                          {completedTasks.length} / {reward.requiredTasks} tasks ({progressPct}%)
                        </span>
                        {isUnlocked ? (
                          <span className="text-emerald-700 flex items-center gap-1 font-black">
                            <Trophy className="w-3 h-3 text-emerald-600" />
                            {reward.isClaimed ? 'CLAIMED ✓' : 'UNLOCKED!'}
                          </span>
                        ) : (
                          <span className="text-slate-400 flex items-center gap-1">
                            <Lock className="w-2.5 h-2.5" /> Locked
                          </span>
                        )}
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isUnlocked ? 'bg-emerald-500' : 'bg-[#121417]'
                          }`}
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>

                    {isUnlocked && !reward.isClaimed && (
                      <button
                        onClick={() => handleClaimReward(reward.id)}
                        className="w-full py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[11px] shadow-sm transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Trophy className="w-3.5 h-3.5 text-amber-300" />
                        <span>Claim Reward &amp; Treat Yourself! 🎉</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top 2 Square Action Tiles from Template */}
          <div className="grid grid-cols-2 gap-3">
            {/* Community Tile */}
            <div
              onClick={() => onNavigate('interview')}
              className="bento-card-white p-4 text-center cursor-pointer hover:border-slate-400 transition-all flex flex-col items-center justify-center gap-2 shadow-xs group"
            >
              <div className="w-10 h-10 rounded-2xl bg-slate-100 group-hover:bg-[#E2F86B] transition-colors flex items-center justify-center text-[#111215]">
                <Users className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-[#111215]">Community</span>
            </div>

            {/* Academy Tile */}
            <div
              onClick={() => onNavigate('projects')}
              className="bento-card-white p-4 text-center cursor-pointer hover:border-slate-400 transition-all flex flex-col items-center justify-center gap-2 shadow-xs group"
            >
              <div className="w-10 h-10 rounded-2xl bg-slate-100 group-hover:bg-[#E2F86B] transition-colors flex items-center justify-center text-[#111215]">
                <GraduationCap className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-[#111215]">Academy</span>
            </div>
          </div>

          {/* Vertical Stack of Link Cards with ↗ Arrows from Template */}
          <div className="space-y-2.5">
            {/* Help Center */}
            <div
              onClick={() => onNavigate('gap-analysis')}
              className="bento-card-white p-4 cursor-pointer hover:border-slate-400 transition-all flex items-start justify-between gap-3 shadow-xs group"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-[#111215] shrink-0 font-bold text-xs">
                  ?
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#111215] group-hover:text-black">
                    Role Benchmarks
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                    Explore hiring expectations & rubric bars...
                  </p>
                </div>
              </div>
              <span className="text-slate-400 group-hover:text-[#111215] transition-colors text-xs">
                ↗
              </span>
            </div>

            {/* Partner Directory / Mentorship */}
            <div
              onClick={() => onNavigate('projects')}
              className="bento-card-white p-4 cursor-pointer hover:border-slate-400 transition-all flex items-start justify-between gap-3 shadow-xs group"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-[#111215] shrink-0">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#111215] group-hover:text-black">
                    Staff Engineer Mentor
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                    Guidance on architectural patterns & tests...
                  </p>
                </div>
              </div>
              <span className="text-slate-400 group-hover:text-[#111215] transition-colors text-xs">
                ↗
              </span>
            </div>

            {/* Blog & Technical Guides */}
            <div
              onClick={() => onNavigate('interview')}
              className="bento-card-white p-4 cursor-pointer hover:border-slate-400 transition-all flex items-start justify-between gap-3 shadow-xs group"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-[#111215] shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#111215] group-hover:text-black">
                    Interview Rubrics
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                    Access popular questions & answer breakdowns...
                  </p>
                </div>
              </div>
              <span className="text-slate-400 group-hover:text-[#111215] transition-colors text-xs">
                ↗
              </span>
            </div>

            {/* Use Cases / Evidence Vault */}
            <div
              onClick={() => onNavigate('evidence')}
              className="bento-card-white p-4 cursor-pointer hover:border-slate-400 transition-all flex items-start justify-between gap-3 shadow-xs group"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-[#111215] shrink-0">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#111215] group-hover:text-black">
                    Evidence Vault
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                    Attach repositories and proven deliverables...
                  </p>
                </div>
              </div>
              <span className="text-slate-400 group-hover:text-[#111215] transition-colors text-xs">
                ↗
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Readiness Explanation Modal */}
      {showReadinessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg p-7 bento-card-white border border-slate-200 shadow-2xl">
            <button
              onClick={() => setShowReadinessModal(false)}
              className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <span className="w-7 h-7 rounded-full bg-[#E2F86B] flex items-center justify-center text-[#111215]">
                <ShieldCheck className="w-4 h-4" />
              </span>
              <h3 className="text-lg font-bold text-[#111215]">Career Readiness Index</h3>
            </div>

            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Transparent, objective metric calculated from verified code evidence, completed learning sprints, and interview calibration.
            </p>

            <div className="mt-4 space-y-2.5 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div className="font-bold text-[#111215] flex justify-between">
                  <span>1. Skill Coverage (40 Points)</span>
                  <span className="text-black font-extrabold">{readiness.breakdown.skillCoverage} / 40</span>
                </div>
                <p className="text-slate-500 text-[11px] mt-1">
                  Essential competencies required for your target role.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div className="font-bold text-[#111215] flex justify-between">
                  <span>2. Project & Verifiable Evidence (25 Points)</span>
                  <span className="text-black font-extrabold">{readiness.breakdown.projectEvidence} / 25</span>
                </div>
                <p className="text-slate-500 text-[11px] mt-1">
                  Repositories, live apps, or code artifacts reviewed in your vault.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div className="font-bold text-[#111215] flex justify-between">
                  <span>3. Learning Roadmap Completion (20 Points)</span>
                  <span className="text-black font-extrabold">{readiness.breakdown.taskCompletion} / 20</span>
                </div>
                <p className="text-slate-500 text-[11px] mt-1">
                  Practical tasks finished within your customized roadmap.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div className="font-bold text-[#111215] flex justify-between">
                  <span>4. Interview Preparation (15 Points)</span>
                  <span className="text-black font-extrabold">{readiness.breakdown.interviewReadiness} / 15</span>
                </div>
                <p className="text-slate-500 text-[11px] mt-1">
                  Rubric-scored answers evaluated in technical interview simulations.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowReadinessModal(false)}
              className="mt-5 w-full py-2.5 text-xs font-semibold text-white bg-[#121417] hover:bg-[#22262C] rounded-full cursor-pointer"
            >
              Understood
            </button>
          </div>
        </div>
      )}

      {/* Add New Goal Reward Modal */}
      {showRewardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md p-6 bento-card-white border border-slate-200 shadow-2xl space-y-4">
            <button
              onClick={() => setShowRewardModal(false)}
              className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-[#E2F86B] flex items-center justify-center text-[#1A2200]">
                <Gift className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-base font-black text-[#111215]">Set a Milestone Self-Reward</h3>
                <p className="text-xs text-slate-500">Attach a personal prize for mastering this sprint</p>
              </div>
            </div>

            <form onSubmit={handleAddReward} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  What will you treat yourself to?
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Sony Headphones, Weekend Trip, IMAX Movie Night"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#121417]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold"
                  >
                    <option value="gadget">🎧 Tech Gadget</option>
                    <option value="travel">✈️ Travel &amp; Trip</option>
                    <option value="entertainment">🍿 Movie &amp; Fun</option>
                    <option value="dining">☕ Coffee &amp; Dining</option>
                    <option value="lifestyle">🎁 Lifestyle Prize</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Target Budget</label>
                  <input
                    type="text"
                    value={newCost}
                    onChange={(e) => setNewCost(e.target.value)}
                    placeholder="e.g. $150"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#121417]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Skill Milestone to Unlock It
                </label>
                <input
                  type="text"
                  value={newMilestone}
                  onChange={(e) => setNewMilestone(e.target.value)}
                  placeholder="e.g. Complete 5 Roadmap Tasks, Master Raft"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#121417]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Required Completed Tasks ({newRequiredTasks} tasks)
                </label>
                <input
                  type="range"
                  min="1"
                  max="30"
                  value={newRequiredTasks}
                  onChange={(e) => setNewRequiredTasks(Number(e.target.value))}
                  className="w-full accent-[#121417]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRewardModal(false)}
                  className="px-4 py-2 rounded-full border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-[#121417] text-white hover:bg-[#20242B] text-xs font-bold shadow-md cursor-pointer"
                >
                  Save Bounty Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

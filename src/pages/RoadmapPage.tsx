import React, { useState } from 'react';
import {
  Map,
  CheckCircle2,
  Clock,
  Layers,
  ChevronDown,
  ChevronUp,
  Sparkles,
  RefreshCw,
  ExternalLink,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Check,
  Play,
  X,
} from 'lucide-react';
import type { Roadmap, RoadmapTask, Profile } from '../types/index.ts';

interface RoadmapPageProps {
  roadmap: Roadmap | null;
  profile: Profile | null;
  onToggleTask: (taskId: string, newStatus: 'todo' | 'in_progress' | 'completed') => Promise<void>;
  onRegenerateRoadmap: () => Promise<void>;
  isRegenerating: boolean;
}

export const RoadmapPage: React.FC<RoadmapPageProps> = ({
  roadmap,
  profile,
  onToggleTask,
  onRegenerateRoadmap,
  isRegenerating,
}) => {
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [confirmRegenerate, setConfirmRegenerate] = useState(false);
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);

  const tasks = roadmap?.tasks || [];
  const completedCount = tasks.filter((t) => t.status === 'completed').length;
  const progressPct = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  // Group tasks by phaseIndex
  const phasesMap: Record<number, { title: string; tasks: RoadmapTask[] }> = {};
  tasks.forEach((t) => {
    if (!phasesMap[t.phaseIndex]) {
      phasesMap[t.phaseIndex] = { title: t.phaseTitle, tasks: [] };
    }
    phasesMap[t.phaseIndex].tasks.push(t);
  });

  const phaseKeys = Object.keys(phasesMap).map(Number).sort((a, b) => a - b);

  const handleStatusChange = async (taskId: string, newStatus: 'todo' | 'in_progress' | 'completed') => {
    setUpdatingTaskId(taskId);
    try {
      await onToggleTask(taskId, newStatus);
    } finally {
      setUpdatingTaskId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 p-6 sm:p-7 rounded-3xl glass-panel-elevated border border-white/90 shadow-sm bg-gradient-to-r from-indigo-50/50 via-white/80 to-purple-50/40">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              Personalized Career Sprint
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200/50">
              {roadmap?.totalWeeks || 10} Weeks
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            {roadmap?.title || `${profile?.targetRole || 'Developer'} Career Roadmap`}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
            Targeted practical tasks engineered around your verified gaps. Complete acceptance criteria to lock in your progress.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-500">
            <div>
              Velocity: <span className="text-slate-900 font-semibold">{roadmap?.weeklyHours || 10} hrs/week</span>
            </div>
            <div>&middot;</div>
            <div>
              Tasks: <span className="text-slate-900 font-semibold">{completedCount} of {tasks.length} Completed</span>
            </div>
            <div>&middot;</div>
            <div>
              Sprint Status: <span className="text-indigo-600 font-semibold">{progressPct}% Finished</span>
            </div>
          </div>
        </div>

        {/* Progress Metric / Action */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="text-right hidden sm:block">
            <div className="text-xs text-slate-500 font-medium">Roadmap Progress</div>
            <div className="text-3xl font-black text-slate-900">{progressPct}%</div>
          </div>

          <button
            onClick={() => setConfirmRegenerate(true)}
            disabled={isRegenerating}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200/80 rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-indigo-600 ${isRegenerating ? 'animate-spin' : ''}`} />
            <span>Adapt Roadmap</span>
          </button>
        </div>
      </div>

      {/* Timeline Phases */}
      {phaseKeys.length === 0 ? (
        <div className="p-12 text-center glass-panel rounded-3xl border border-slate-200/70 text-sm text-slate-500">
          No roadmap generated yet. Click "Adapt Roadmap" to generate your milestone plan.
        </div>
      ) : (
        <div className="space-y-8">
          {phaseKeys.map((phaseIndex) => {
            const phase = phasesMap[phaseIndex];
            const phaseCompleted = phase.tasks.every((t) => t.status === 'completed');
            const phaseCompletedCount = phase.tasks.filter((t) => t.status === 'completed').length;

            return (
              <div key={phaseIndex} className="space-y-4">
                {/* Phase Header */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-200/70">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold ${
                        phaseCompleted
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                          : 'bg-indigo-50 text-indigo-700 border border-indigo-200/60'
                      }`}
                    >
                      {phaseCompleted ? '✓' : phaseIndex}
                    </div>
                    <h3 className="font-extrabold text-slate-900 text-base tracking-tight">{phase.title}</h3>
                  </div>

                  <span className="text-xs font-semibold text-slate-500">
                    {phaseCompletedCount} / {phase.tasks.length} Completed
                  </span>
                </div>

                {/* Phase Tasks List */}
                <div className="space-y-3 pl-2 sm:pl-4 border-l-2 border-slate-200/80">
                  {phase.tasks.map((task) => {
                    const isExpanded = expandedTaskId === task.id;
                    const isCompleted = task.status === 'completed';
                    const isInProgress = task.status === 'in_progress';
                    const isUpdating = updatingTaskId === task.id;

                    return (
                      <div
                        key={task.id}
                        className={`rounded-3xl border transition-all glass-card ${
                          isCompleted
                            ? 'bg-slate-50/70 border-slate-200/60 opacity-80'
                            : isInProgress
                            ? 'bg-indigo-50/30 border-indigo-200/80 shadow-xs'
                            : 'bg-white/80 border-slate-200/70 hover:border-indigo-200'
                        }`}
                      >
                        {/* Task Summary Line */}
                        <div className="p-4 sm:p-5 flex items-start gap-3.5">
                          {/* Status toggle checkbox */}
                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() =>
                              handleStatusChange(task.id, isCompleted ? 'todo' : 'completed')
                            }
                            className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-colors shrink-0 cursor-pointer ${
                              isCompleted
                                ? 'bg-emerald-500 border-emerald-500 text-white'
                                : 'border-slate-300 hover:border-indigo-500 bg-white'
                            }`}
                            aria-label={isCompleted ? `Mark '${task.title}' as incomplete` : `Mark '${task.title}' as complete`}
                          >
                            {isCompleted && <CheckCircle2 className="w-3.5 h-3.5" />}
                          </button>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <span
                                className={`text-sm sm:text-base font-bold cursor-pointer hover:text-indigo-600 transition-colors ${
                                  isCompleted ? 'line-through text-slate-400' : 'text-slate-900'
                                }`}
                                onClick={() => setExpandedTaskId(isExpanded ? null : task.id)}
                              >
                                {task.title}
                              </span>

                              <div className="flex items-center gap-2 shrink-0">
                                <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                                  {task.durationHours} hrs
                                </span>
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase ${
                                    task.difficulty === 'Advanced'
                                      ? 'bg-rose-50 text-rose-700 border border-rose-200/60'
                                      : task.difficulty === 'Intermediate'
                                      ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/60'
                                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                                  }`}
                                >
                                  {task.difficulty}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setExpandedTaskId(isExpanded ? null : task.id)}
                                  className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                                  aria-label={isExpanded ? `Collapse details for '${task.title}'` : `Expand details for '${task.title}'`}
                                >
                                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                </button>
                              </div>
                            </div>

                            <p className="text-xs text-slate-500 mt-1">{task.objective}</p>

                            {/* Prerequisites badges */}
                            {task.prerequisites && task.prerequisites.length > 0 && (
                              <div className="flex flex-wrap items-center gap-1.5 mt-2.5 text-[10px]">
                                <span className="text-slate-400 font-semibold uppercase">Prerequisites:</span>
                                {task.prerequisites.map((p, i) => (
                                  <span key={i} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200/70">
                                    {p}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Expanded Task Instructions & Acceptance Criteria */}
                        {isExpanded && (
                          <div className="px-5 pb-5 pt-3 border-t border-slate-200/60 bg-white/60 rounded-b-3xl space-y-4 text-xs">
                            {/* Why it matters */}
                            <div className="p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-100 text-indigo-950">
                              <span className="font-bold text-indigo-900 block mb-0.5">Why Product Teams Require This:</span>
                              {task.whyItMatters}
                            </div>

                            {/* Step-by-Step Instructions */}
                            {task.instructions && task.instructions.length > 0 && (
                              <div>
                                <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px] block mb-2">
                                  Step-by-Step Implementation Instructions
                                </span>
                                <ol className="space-y-1.5 list-decimal list-inside text-slate-600 pl-1">
                                  {task.instructions.map((inst, i) => (
                                    <li key={i} className="leading-relaxed">{inst}</li>
                                  ))}
                                </ol>
                              </div>
                            )}

                            {/* Acceptance Criteria */}
                            {task.acceptanceCriteria && task.acceptanceCriteria.length > 0 && (
                              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70">
                                <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] block mb-2">
                                  Acceptance Criteria (Definition of Done)
                                </span>
                                <ul className="space-y-1.5 text-slate-600">
                                  {task.acceptanceCriteria.map((crit, i) => (
                                    <li key={i} className="flex items-start gap-2">
                                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                                      <span>{crit}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Resources */}
                            {task.resources && task.resources.length > 0 && (
                              <div className="flex flex-wrap items-center gap-2 pt-1">
                                <span className="text-[11px] text-slate-500 font-bold uppercase">Learning Links:</span>
                                {task.resources.map((res, i) => (
                                  <a
                                    key={i}
                                    href={res.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-slate-900 transition-colors shadow-xs"
                                  >
                                    <ExternalLink className="w-3 h-3 text-indigo-600" />
                                    <span>{res.title}</span>
                                  </a>
                                ))}
                              </div>
                            )}

                            {/* Quick status actions */}
                            <div className="pt-2 flex items-center justify-between border-t border-slate-200/60">
                              <span className="text-slate-500 text-[11px]">
                                {isCompleted ? 'Marked as completed' : 'Ready to work on this sprint task'}
                              </span>
                              <div className="flex items-center gap-2">
                                {!isCompleted && (
                                  <button
                                    type="button"
                                    onClick={() => handleStatusChange(task.id, 'in_progress')}
                                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 shadow-xs cursor-pointer"
                                  >
                                    Set In-Progress
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleStatusChange(task.id, isCompleted ? 'todo' : 'completed')}
                                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs ${
                                    isCompleted
                                      ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                      : 'bg-slate-900 hover:bg-slate-800 text-white'
                                  }`}
                                >
                                  {isCompleted ? 'Reset to Todo' : 'Mark Completed ✓'}
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Modal for Regenerate */}
      {confirmRegenerate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/35 backdrop-blur-md">
          <div className="relative w-full max-w-md p-6 glass-panel-elevated rounded-3xl border border-white/90 shadow-2xl">
            <button
              onClick={() => setConfirmRegenerate(false)}
              className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-2 text-indigo-600">
              <Sparkles className="w-5 h-5" />
              <h3 className="text-lg font-bold text-slate-900">Adapt Your Roadmap</h3>
            </div>

            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Recalibrate your milestones against your latest assessed skills, remaining time,
              and target weekly hours.
            </p>

            <div className="p-3 my-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-xs text-indigo-950">
              Your {completedCount} already completed tasks and submitted project evidence will be preserved!
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmRegenerate(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-900 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  setConfirmRegenerate(false);
                  await onRegenerateRoadmap();
                }}
                className="px-5 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs cursor-pointer"
              >
                Regenerate Roadmap
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

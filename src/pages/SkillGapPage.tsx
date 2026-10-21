import React, { useState } from 'react';
import {
  GitCompare,
  Sparkles,
  RefreshCw,
  AlertTriangle,
  Clock,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Info,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type { GapAnalysis, GapSkill, Profile } from '../types/index.ts';

interface SkillGapPageProps {
  analysis: GapAnalysis | null;
  profile: Profile | null;
  onRefreshAnalysis: () => Promise<void>;
  isAnalyzing: boolean;
  onNavigateToRoadmap?: () => void;
}

export const SkillGapPage: React.FC<SkillGapPageProps> = ({
  analysis,
  profile,
  onRefreshAnalysis,
  isAnalyzing,
  onNavigateToRoadmap,
}) => {
  const [filter, setFilter] = useState<'All' | 'High Priority' | 'Needs Improvement' | 'Strong Foundation'>('All');
  const [selectedSkill, setSelectedSkill] = useState<GapSkill | null>(null);

  const skillsList = analysis?.skills || [];
  const filteredSkills = skillsList.filter((s) => {
    if (filter === 'All') return true;
    return s.priority === filter;
  });

  const highPriority = skillsList.filter((s) => s.priority === 'High Priority');
  const needsImprovement = skillsList.filter((s) => s.priority === 'Needs Improvement');
  const strongFoundation = skillsList.filter((s) => s.priority === 'Strong Foundation');

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-7 rounded-3xl glass-panel-elevated border border-white/90 shadow-sm bg-gradient-to-r from-indigo-50/50 via-white/80 to-purple-50/40">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              Role Comparison Matrix
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200/50">
              Benchmark Active
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            {profile?.targetRole || 'Software Engineer'} Gap Analysis
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
            {analysis?.summary ||
              'Comparing your self-assessed capabilities against production engineering requirements to identify your highest-impact learning priorities.'}
          </p>
        </div>

        <button
          onClick={onRefreshAnalysis}
          disabled={isAnalyzing}
          className="flex items-center justify-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs disabled:opacity-50 transition-all shrink-0 cursor-pointer active:scale-95"
        >
          <RefreshCw className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
          <span>{isAnalyzing ? 'Analyzing...' : 'Update Analysis'}</span>
        </button>
      </div>

      {/* Metric Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl glass-panel border border-slate-200/70 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-500">Total Evaluated</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{skillsList.length}</div>
          <span className="text-[11px] text-slate-500">Core competencies</span>
        </div>

        <div className="p-5 rounded-3xl glass-panel border border-rose-200/70 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-rose-600">High Priority Gaps</span>
          <div className="text-2xl font-black text-rose-600 mt-1">{highPriority.length}</div>
          <span className="text-[11px] text-slate-500">Must close for screenings</span>
        </div>

        <div className="p-5 rounded-3xl glass-panel border border-amber-200/70 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-amber-600">Needs Practice</span>
          <div className="text-2xl font-black text-amber-600 mt-1">{needsImprovement.length}</div>
          <span className="text-[11px] text-slate-500">Moderate gap size</span>
        </div>

        <div className="p-5 rounded-3xl glass-panel border border-emerald-200/70 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-emerald-600">Strong Foundation</span>
          <div className="text-2xl font-black text-emerald-600 mt-1">{strongFoundation.length}</div>
          <span className="text-[11px] text-slate-500">Meets expectations</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-slate-200/60 pb-3 overflow-x-auto">
        {(['All', 'High Priority', 'Needs Improvement', 'Strong Foundation'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all shrink-0 cursor-pointer ${
              filter === tab
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Comparison Table / Cards */}
      <div className="space-y-3">
        {filteredSkills.length === 0 ? (
          <div className="p-8 text-center glass-panel rounded-3xl border border-slate-200/70 text-xs text-slate-500">
            No skills match the selected filter.
          </div>
        ) : (
          filteredSkills.map((item, idx) => {
            const isSelected = selectedSkill?.name === item.name;
            return (
              <div
                key={idx}
                className={`rounded-3xl border transition-all glass-card ${
                  item.priority === 'High Priority'
                    ? 'border-rose-200/80 bg-rose-50/15 hover:border-rose-300'
                    : item.priority === 'Needs Improvement'
                    ? 'border-amber-200/80 bg-amber-50/15 hover:border-amber-300'
                    : 'border-emerald-200/80 bg-emerald-50/15 hover:border-emerald-300'
                }`}
              >
                {/* Main Row */}
                <div
                  onClick={() => setSelectedSkill(isSelected ? null : item)}
                  className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer"
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm sm:text-base">{item.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium">
                        {item.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-1">{item.rationale}</p>
                  </div>

                  {/* Level Comparison Columns */}
                  <div className="flex items-center gap-4 sm:gap-6 shrink-0 text-xs">
                    <div>
                      <div className="text-[10px] text-slate-400 font-medium uppercase">Current</div>
                      <div className="font-semibold text-slate-700">{item.currentLevel}</div>
                    </div>

                    <ArrowRight className="w-3.5 h-3.5 text-slate-300 hidden sm:block" />

                    <div>
                      <div className="text-[10px] text-slate-400 font-medium uppercase">Expected</div>
                      <div className="font-semibold text-indigo-600">{item.expectedLevel}</div>
                    </div>

                    <div className="min-w-28 text-right">
                      <span
                        className={`inline-block px-2.5 py-1 text-[11px] font-semibold rounded-lg ${
                          item.priority === 'High Priority'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200/70'
                            : item.priority === 'Needs Improvement'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200/70'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200/70'
                        }`}
                      >
                        {item.priority}
                      </span>
                    </div>

                    <div className="text-slate-400">
                      {isSelected ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Detail Panel */}
                {isSelected && (
                  <div className="px-5 pb-5 pt-3 border-t border-slate-200/60 bg-white/60 rounded-b-3xl space-y-3 text-xs">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
                          Why this gap matters in interviews
                        </div>
                        <p className="text-slate-600 leading-relaxed">{item.rationale}</p>
                      </div>

                      <div>
                        <div className="font-bold text-indigo-600 uppercase tracking-wider text-[10px] mb-1">
                          Recommended Action to Close Gap
                        </div>
                        <p className="text-slate-600 leading-relaxed">{item.suggestedAction}</p>
                      </div>
                    </div>

                    {onNavigateToRoadmap && (
                      <div className="pt-2 flex justify-end">
                        <button
                          onClick={onNavigateToRoadmap}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200/80 rounded-xl shadow-xs transition-colors cursor-pointer"
                        >
                          <span>View Roadmap Sprint Tasks</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

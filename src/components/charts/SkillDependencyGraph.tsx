import React, { useState } from 'react';
import type { DependencyNode } from '../../data/technologyTracks.ts';
import { GitBranch, CheckCircle2, Clock, Target, ArrowRight, X } from 'lucide-react';

interface SkillDependencyGraphProps {
  nodes: DependencyNode[];
  onSelectNode?: (node: DependencyNode) => void;
}

export const SkillDependencyGraph: React.FC<SkillDependencyGraphProps> = ({
  nodes,
  onSelectNode,
}) => {
  const [activeNode, setActiveNode] = useState<DependencyNode | null>(nodes[0] || null);

  const tier1 = nodes.filter((n) => n.tier === 1);
  const tier2 = nodes.filter((n) => n.tier === 2);
  const tier3 = nodes.filter((n) => n.tier === 3);

  const tiers = [
    { number: 1, label: 'Tier 1: Language Core & Fundamentals', items: tier1 },
    { number: 2, label: 'Tier 2: Architecture & Resilient State', items: tier2 },
    { number: 3, label: 'Tier 3: Production, Testing & Release', items: tier3 },
  ];

  return (
    <div className="bento-card-white p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-700">
              <GitBranch className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-base font-bold text-[#111215]">Skill Dependency Tree (DAG)</h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Visual prerequisite pathways from core language foundations to high-scale production systems.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs font-semibold">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E2F86B] border border-[#111215]" />
            <span className="text-[#111215]">Mastered</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#121417]" />
            <span className="text-slate-700">In Progress</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full border-2 border-dashed border-slate-400 bg-white" />
            <span className="text-slate-500">Target</span>
          </div>
        </div>
      </div>

      {/* 3-Tier Dependency Columns with Connectors */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative pt-2">
        {tiers.map((tier, tIdx) => (
          <div key={tier.number} className="space-y-4">
            {/* Tier Column Header */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-700 tracking-tight">
                {tier.label}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold">
                {tier.items.length} nodes
              </span>
            </div>

            {/* Nodes in this Tier */}
            <div className="space-y-3">
              {tier.items.map((node) => {
                const isSelected = activeNode?.id === node.id;
                return (
                  <div
                    key={node.id}
                    onClick={() => {
                      setActiveNode(node);
                      if (onSelectNode) onSelectNode(node);
                    }}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer relative group ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/20 shadow-md ring-2 ring-indigo-500/20'
                        : 'border-slate-200/80 bg-white hover:border-slate-300 hover:shadow-xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="font-bold text-xs sm:text-sm text-[#111215] group-hover:text-indigo-600 transition-colors">
                          {node.name}
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                          {node.description}
                        </p>
                      </div>

                      {/* Status Badge */}
                      <div className="shrink-0">
                        {node.status === 'mastered' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#EBFD7A] text-[#283500] text-[10px] font-bold border border-[#D8EE60]">
                            <CheckCircle2 className="w-3 h-3" />
                            Done
                          </span>
                        )}
                        {node.status === 'in_progress' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#121417] text-white text-[10px] font-bold">
                            <Clock className="w-3 h-3" />
                            Active
                          </span>
                        )}
                        {node.status === 'target' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-dashed border-slate-300 text-slate-600 text-[10px] font-semibold bg-slate-50">
                            <Target className="w-3 h-3" />
                            Target
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Prerequisites Indicator */}
                    {node.prerequisites.length > 0 && (
                      <div className="mt-3 pt-2 border-t border-slate-100 flex items-center gap-1 text-[10px] text-slate-400">
                        <ArrowRight className="w-3 h-3 text-slate-300" />
                        <span>Requires: </span>
                        <span className="font-mono text-slate-600 font-semibold">
                          {node.prerequisites.join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Selected Node Details Drawer */}
      {activeNode && (
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-in">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                Selected Competency Focus
              </span>
              <span className="text-xs font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                Tier {activeNode.tier}
              </span>
            </div>
            <h4 className="text-sm sm:text-base font-extrabold text-[#111215]">
              {activeNode.name}
            </h4>
            <p className="text-xs text-slate-600 max-w-xl">
              {activeNode.description}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span
              className={`px-3 py-1.5 text-xs font-bold rounded-xl ${
                activeNode.status === 'mastered'
                  ? 'bg-[#E2F86B] text-[#111215] border border-[#CCE855]'
                  : activeNode.status === 'in_progress'
                  ? 'bg-[#121417] text-white'
                  : 'bg-white text-slate-700 border border-slate-200'
              }`}
            >
              Status: {activeNode.status === 'mastered' ? 'Mastered' : activeNode.status === 'in_progress' ? 'In Progress' : 'Target Next'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import {
  Search,
  Plus,
  Trash2,
  ShieldCheck,
  Award,
  Layers,
  ArrowRight,
  ExternalLink,
  BookOpen,
  X,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import type { SkillItem, SkillLevel, Profile } from '../types/index.ts';

interface SkillProfilePageProps {
  skills: SkillItem[];
  profile: Profile | null;
  onAddSkill: (skill: { name: string; category: string; selfAssessedLevel: string; hasEvidence?: boolean }) => Promise<void>;
  onDeleteSkill: (id: string) => Promise<void>;
  onNavigateToRoadmap?: () => void;
  onNavigateToEvidence?: () => void;
}

const CATEGORIES = [
  'All',
  'Programming Languages',
  'Frameworks & Libraries',
  'Architecture & Design',
  'APIs & Backend',
  'Testing & Debugging',
  'Deployment & Release',
  'Collaboration',
];

export const SkillProfilePage: React.FC<SkillProfilePageProps> = ({
  skills,
  profile,
  onAddSkill,
  onDeleteSkill,
  onNavigateToRoadmap,
  onNavigateToEvidence,
}) => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkill, setSelectedSkill] = useState<SkillItem | null>(skills[0] || null);

  // Add Skill Modal
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Programming Languages');
  const [level, setLevel] = useState<SkillLevel>('Intermediate');
  const [hasEvidence, setHasEvidence] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const filteredSkills = skills.filter((s) => {
    const matchesCategory = selectedCategory === 'All' || s.category === selectedCategory;
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCreateSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      await onAddSkill({
        name: name.trim(),
        category,
        selfAssessedLevel: level,
        hasEvidence,
      });
      setName('');
      setIsAdding(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-7 rounded-3xl glass-panel-elevated border border-white/90 shadow-sm bg-gradient-to-r from-indigo-50/50 via-white/80 to-purple-50/40">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Skill Library & Assessments</h2>
          <p className="text-xs text-slate-600 mt-1">
            Track your current competencies. Clearly separate self-reported skills from skills backed by code evidence.
          </p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs transition-all cursor-pointer active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Skill</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs glass-input rounded-xl placeholder:text-slate-400"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl shrink-0 transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200/70 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid: Skill Cards & Detail Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Skill Cards List (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          {filteredSkills.length === 0 ? (
            <div className="p-8 text-center glass-panel rounded-3xl border border-slate-200/70 text-xs text-slate-400">
              No skills found in this category. Click "Add New Skill" to track one.
            </div>
          ) : (
            filteredSkills.map((skill) => {
              const isSelected = selectedSkill?.id === skill.id;
              return (
                <div
                  key={skill.id}
                  onClick={() => setSelectedSkill(skill)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 glass-card ${
                    isSelected
                      ? 'border-indigo-400 bg-white ring-2 ring-indigo-500/10 shadow-sm'
                      : 'border-slate-200/70 bg-white/70 hover:border-slate-300'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 truncate">{skill.name}</span>
                      {skill.hasEvidence ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          Evidence Backed
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                          Self-Assessed
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-500">{skill.category}</span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={`text-xs px-2.5 py-1 rounded-lg font-semibold ${
                        skill.selfAssessedLevel === 'Expert' || skill.selfAssessedLevel === 'Advanced'
                          ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/60'
                          : skill.selfAssessedLevel === 'Intermediate'
                          ? 'bg-slate-100 text-slate-700 border border-slate-200/60'
                          : 'bg-slate-50 text-slate-500 border border-slate-200/50'
                      }`}
                    >
                      {skill.selfAssessedLevel}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteSkill(skill.id);
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 cursor-pointer"
                      title="Delete skill"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right: Selected Skill Detail Panel (5 cols) */}
        <div className="lg:col-span-5">
          {selectedSkill ? (
            <div className="p-6 rounded-3xl glass-panel border border-slate-200/70 shadow-xs sticky top-24 space-y-5">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-indigo-600 font-bold">
                    {selectedSkill.category}
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 mt-0.5">{selectedSkill.name}</h3>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold text-indigo-700 px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200/60">
                    {selectedSkill.selfAssessedLevel}
                  </span>
                </div>
              </div>

              {/* Distinction info box */}
              <div
                className={`p-3.5 rounded-2xl text-xs flex items-center gap-2.5 ${
                  selectedSkill.hasEvidence
                    ? 'bg-emerald-50/60 border border-emerald-200/60 text-emerald-800'
                    : 'bg-slate-50 border border-slate-200/80 text-slate-700'
                }`}
              >
                {selectedSkill.hasEvidence ? (
                  <>
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>This skill is supported by verifiable code records in your Evidence Vault.</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Self-reported assessment only. Submit project evidence to convert it into proof.</span>
                  </>
                )}
              </div>

              {/* Why it matters */}
              <div className="space-y-1 text-xs">
                <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                  Relevance for {profile?.targetRole || 'Target Role'}
                </span>
                <p className="text-slate-600 leading-relaxed">
                  Deep proficiency in {selectedSkill.name} enables you to write clean, decoupled code,
                  prevent regressions, and speak confidently during architectural system design rounds.
                </p>
              </div>

              {/* Next Steps Buttons */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                {onNavigateToEvidence && (
                  <button
                    onClick={onNavigateToEvidence}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200/80 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors cursor-pointer shadow-xs"
                  >
                    <span>Attach Code Evidence for {selectedSkill.name}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-indigo-600" />
                  </button>
                )}

                {onNavigateToRoadmap && (
                  <button
                    onClick={onNavigateToRoadmap}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200/80 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors cursor-pointer shadow-xs"
                  >
                    <span>View Roadmap Tasks for this Skill</span>
                    <ArrowRight className="w-3.5 h-3.5 text-indigo-600" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center glass-panel rounded-3xl border border-slate-200/70 text-xs text-slate-400">
              Select any skill on the left to view requirements and attached evidence.
            </div>
          )}
        </div>
      </div>

      {/* Add Skill Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/35 backdrop-blur-md">
          <div className="relative w-full max-w-md p-7 glass-panel-elevated rounded-3xl border border-white/90 shadow-2xl">
            <button
              onClick={() => setIsAdding(false)}
              className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 mb-1">Add Skill Assessment</h3>
            <p className="text-xs text-slate-500 mb-4">
              Track a new competency in your career portfolio.
            </p>

            <form onSubmit={handleCreateSkill} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Skill Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Riverpod, Docker, SQL..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 glass-input rounded-xl placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none shadow-xs"
                >
                  {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Self-Assessed Level</label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value as SkillLevel)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none shadow-xs"
                >
                  <option value="Beginner">Beginner (Understands fundamentals with help)</option>
                  <option value="Intermediate">Intermediate (Solves common tasks independently)</option>
                  <option value="Advanced">Advanced (Solves complex issues & explains decisions)</option>
                  <option value="Expert">Expert (Designs architecture & guides teams)</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="hasEvidenceCheck"
                  checked={hasEvidence}
                  onChange={(e) => setHasEvidence(e.target.checked)}
                  className="w-4 h-4 rounded-md accent-indigo-600"
                />
                <label htmlFor="hasEvidenceCheck" className="text-xs text-slate-700 cursor-pointer">
                  I already have project code demonstrating this skill
                </label>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-2 py-2.5 px-4 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all cursor-pointer shadow-xs active:scale-98"
              >
                {submitting ? 'Saving...' : 'Add to Skill Profile'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

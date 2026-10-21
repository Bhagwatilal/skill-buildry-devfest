import React, { useState } from 'react';
import {
  FileCheck2,
  Plus,
  Trash2,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Github,
  Globe,
  FileCode,
  Layers,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import type { EvidenceRecord, SkillItem, Profile } from '../types/index.ts';

interface EvidencePageProps {
  evidence: EvidenceRecord[];
  skills: SkillItem[];
  profile: Profile | null;
  onAddEvidence: (record: {
    title: string;
    skillName: string;
    evidenceType: string;
    urlOrContent: string;
    requestAiReview?: boolean;
  }) => Promise<void>;
  onDeleteEvidence: (id: string) => Promise<void>;
}

const EVIDENCE_TYPES = [
  'GitHub Repository',
  'Live Project',
  'Portfolio Link',
  'Code Snippet',
  'Architecture Document',
];

export const EvidencePage: React.FC<EvidencePageProps> = ({
  evidence,
  skills,
  profile,
  onAddEvidence,
  onDeleteEvidence,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<EvidenceRecord | null>(evidence[0] || null);

  // Form State
  const [title, setTitle] = useState('');
  const [skillName, setSkillName] = useState(skills[0]?.name || 'Core Competency');
  const [evidenceType, setEvidenceType] = useState('GitHub Repository');
  const [urlOrContent, setUrlOrContent] = useState('');
  const [requestAiReview, setRequestAiReview] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !urlOrContent.trim()) return;

    setSubmitting(true);
    try {
      await onAddEvidence({
        title: title.trim(),
        skillName,
        evidenceType,
        urlOrContent: urlOrContent.trim(),
        requestAiReview,
      });
      setTitle('');
      setUrlOrContent('');
      setIsAdding(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-7 rounded-3xl glass-panel-elevated border border-white/90 shadow-sm bg-gradient-to-r from-indigo-50/50 via-white/80 to-purple-50/40">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              Proof-of-Skill Vault
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200/60">
              {evidence.length} Verified Records
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Verifiable Evidence & Portfolio Records
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
            Knowing a concept and proving it are different things. Attach GitHub repositories, production links,
            and architecture notes to back up your claimed competencies.
          </p>
        </div>

        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs transition-all shrink-0 cursor-pointer active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Evidence</span>
        </button>
      </div>

      {/* Grid: Records List & Detail Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Evidence Records List (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          {evidence.length === 0 ? (
            <div className="p-12 text-center glass-panel rounded-3xl border border-slate-200/70 text-xs text-slate-500 space-y-3">
              <FileCheck2 className="w-10 h-10 text-slate-300 mx-auto" />
              <p>No evidence records added yet. Add a GitHub repository or project link to verify your skills.</p>
              <button
                onClick={() => setIsAdding(true)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer shadow-xs"
              >
                Add Your First Evidence Record
              </button>
            </div>
          ) : (
            evidence.map((record) => {
              const isSelected = selectedRecord?.id === record.id;
              const isAiReviewed = record.verificationStatus === 'AI-Reviewed';

              return (
                <div
                  key={record.id}
                  onClick={() => setSelectedRecord(record)}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer glass-card ${
                    isSelected
                      ? 'border-indigo-400 bg-white shadow-md ring-2 ring-indigo-500/10'
                      : 'border-slate-200/70 bg-white/70 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm truncate">{record.title}</span>
                        {isAiReviewed ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                            Reviewed
                          </span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                            {record.verificationStatus}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span className="text-indigo-600 font-medium">{record.skillName}</span>
                        <span>&middot;</span>
                        <span>{record.evidenceType}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteEvidence(record.id);
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 cursor-pointer"
                      title="Delete record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-xs text-slate-600 mt-2 font-mono truncate bg-slate-50 p-2.5 rounded-xl border border-slate-200/70">
                    {record.urlOrContent}
                  </p>
                </div>
              );
            })
          )}
        </div>

        {/* Right: Selected Evidence Detail & AI Review Panel (5 cols) */}
        <div className="lg:col-span-5">
          {selectedRecord ? (
            <div className="p-6 rounded-3xl glass-panel border border-slate-200/70 shadow-xs space-y-5 sticky top-24">
              <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                <div>
                  <span className="text-[10px] uppercase font-bold text-indigo-600">
                    {selectedRecord.evidenceType}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 mt-0.5">{selectedRecord.title}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Skill: {selectedRecord.skillName}</p>
                </div>
              </div>

              {/* URL or Content box */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                  Artifact Link / Content
                </span>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70 text-xs font-mono text-indigo-700 break-all flex items-center justify-between gap-2">
                  <span>{selectedRecord.urlOrContent}</span>
                  {selectedRecord.urlOrContent.startsWith('http') && (
                    <a
                      href={selectedRecord.urlOrContent}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1 text-slate-500 hover:text-slate-900"
                      title="Open link"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>

              {/* AI Feedback Section */}
              <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100/80 space-y-2 text-xs">
                <div className="flex items-center gap-1.5 text-indigo-900 font-bold uppercase tracking-wider text-[11px]">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span>Reviewer Feedback</span>
                </div>

                <p className="text-slate-700 leading-relaxed">
                  {selectedRecord.aiFeedback ||
                    'Evidence recorded. Add tests and an Architecture Decision Record (ADR) in your README to maximize candidate credibility.'}
                </p>

                <div className="pt-2 text-[10px] text-slate-500 border-t border-indigo-100">
                  Evaluated based on submitted repository structure and explanation for {profile?.targetRole || 'this role'}.
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center glass-panel rounded-3xl border border-slate-200/70 text-xs text-slate-400">
              Select any evidence item on the left to view the review report.
            </div>
          )}
        </div>
      </div>

      {/* Add Evidence Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/35 backdrop-blur-md">
          <div className="relative w-full max-w-lg p-7 glass-panel-elevated rounded-3xl border border-white/90 shadow-2xl">
            <button
              onClick={() => setIsAdding(false)}
              className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 mb-1">Add Proof-of-Skill Artifact</h3>
            <p className="text-xs text-slate-500 mb-4">
              Attach a project repository or documentation snippet demonstrating your skill.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Evidence Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Offline-First Dio Client & Cache"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2 glass-input rounded-xl text-slate-900 placeholder:text-slate-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Associated Skill</label>
                  <select
                    value={skillName}
                    onChange={(e) => setSkillName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none shadow-xs"
                  >
                    {skills.map((s) => (
                      <option key={s.id} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Evidence Type</label>
                  <select
                    value={evidenceType}
                    onChange={(e) => setEvidenceType(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none shadow-xs"
                  >
                    {EVIDENCE_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  GitHub URL or Implementation Description
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="https://github.com/username/repo or paste your architecture explanation..."
                  value={urlOrContent}
                  onChange={(e) => setUrlOrContent(e.target.value)}
                  className="w-full p-3 glass-input rounded-xl text-slate-900 placeholder:text-slate-400 resize-none font-mono"
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-100 flex items-center gap-2.5">
                <input
                  type="checkbox"
                  id="requestAiCheck"
                  checked={requestAiReview}
                  onChange={(e) => setRequestAiReview(e.target.checked)}
                  className="w-4 h-4 rounded-md accent-indigo-600"
                />
                <label htmlFor="requestAiCheck" className="text-slate-700 cursor-pointer leading-relaxed">
                  Request instant review to evaluate how compelling this evidence is for {profile?.targetRole || 'tech hiring'}
                </label>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all cursor-pointer shadow-xs active:scale-98"
              >
                {submitting ? 'Submitting & Reviewing...' : 'Add to Evidence Vault'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

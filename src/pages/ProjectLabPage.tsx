import React, { useState, useEffect } from 'react';
import {
  FlaskConical,
  Sparkles,
  Layers,
  Award,
  Clock,
  ArrowRight,
  Bot,
  Send,
  CheckCircle2,
  AlertCircle,
  FileCode2,
  ExternalLink,
  MessageSquare,
  ShieldCheck,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import type {
  ProjectRecommendation,
  ProjectMentorMessage,
  Profile,
} from '../types/index.ts';
import { api } from '../services/api.ts';

interface ProjectLabPageProps {
  projects: ProjectRecommendation[];
  profile: Profile | null;
  onUpdateStatus: (projectId: string, status: string) => Promise<void>;
  onNavigateToEvidence?: () => void;
}

export const ProjectLabPage: React.FC<ProjectLabPageProps> = ({
  projects,
  profile,
  onUpdateStatus,
  onNavigateToEvidence,
}) => {
  const [selectedProject, setSelectedProject] = useState<ProjectRecommendation | null>(projects[0] || null);

  // Mentor Chat State
  const [messages, setMessages] = useState<ProjectMentorMessage[]>([]);
  const [userQuery, setUserQuery] = useState('');
  const [isAskingMentor, setIsAskingMentor] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    if (selectedProject) {
      loadMentorHistory(selectedProject.id);
    }
  }, [selectedProject?.id]);

  const loadMentorHistory = async (projectId: string) => {
    setLoadingHistory(true);
    try {
      const res = await api.projects.getMentorMessages(projectId);
      setMessages(res.messages || []);
    } catch (err) {
      console.error('Failed to load mentor messages:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleAskMentor = async (queryText?: string) => {
    const q = queryText || userQuery;
    if (!q.trim() || !selectedProject || isAskingMentor) return;

    setUserQuery('');
    setIsAskingMentor(true);

    // Optimistically add user message
    const tempUserMsg: ProjectMentorMessage = {
      id: 'temp_' + Date.now(),
      projectId: selectedProject.id,
      role: 'user',
      content: q.trim(),
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const res = await api.projects.askMentor(selectedProject.id, q.trim());
      setMessages(res.history || []);
    } catch (err) {
      console.error('Mentor request failed:', err);
    } finally {
      setIsAskingMentor(false);
    }
  };

  const suggestedPrompts = [
    'How should I break this project into smaller implementation stages?',
    'What architectural pattern is best suited for this challenge?',
    'What edge cases and failure scenarios should I write tests for?',
    'What should I highlight in my GitHub README to impress recruiters?',
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 sm:p-7 rounded-3xl glass-panel-elevated border border-white/90 shadow-sm bg-gradient-to-r from-indigo-50/50 via-white/80 to-purple-50/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              Proof-of-Work Lab
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200/50">
              3 Scoped Challenges
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Portfolio Challenges for {profile?.targetRole || 'Your Target Role'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
            Move past basic tutorial exercises. Build scoped applications with acceptance criteria, unit test suites,
            and real-time guidance from our Staff Engineer AI Mentor.
          </p>
        </div>
      </div>

      {/* 3 Tiered Cards Selector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {projects.map((project) => {
          const isSelected = selectedProject?.id === project.id;
          const isCompleted = project.status === 'completed';
          const isInProgress = project.status === 'in_progress';

          return (
            <div
              key={project.id}
              onClick={() => setSelectedProject(project)}
              className={`p-5 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between glass-card ${
                isSelected
                  ? 'border-indigo-400 bg-white shadow-md ring-2 ring-indigo-500/10'
                  : 'border-slate-200/70 bg-white/70 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase ${
                      project.scopeType === 'Starter Project'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                        : project.scopeType === 'Portfolio Project'
                        ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/60'
                        : 'bg-rose-50 text-rose-700 border border-rose-200/60'
                    }`}
                  >
                    {project.scopeType}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    {project.durationEstHours} hrs
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-base mt-2 line-clamp-2">{project.title}</h3>
                <p className="text-xs text-slate-500 mt-2 line-clamp-3 leading-relaxed">
                  {project.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500">
                  Status:{' '}
                  <span className={isCompleted ? 'text-emerald-600 font-bold' : isInProgress ? 'text-indigo-600 font-bold' : 'text-slate-400'}>
                    {isCompleted ? 'Completed ✓' : isInProgress ? 'In Progress' : 'Not Started'}
                  </span>
                </span>
                <span className="text-xs font-semibold text-indigo-600 flex items-center gap-1">
                  Open Lab &rarr;
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Project Workspace & AI Mentor */}
      {selectedProject && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Workspace Details (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Overview Card */}
            <div className="p-6 rounded-3xl glass-panel border border-slate-200/70 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div>
                  <span className="text-[10px] uppercase font-bold text-indigo-600">{selectedProject.scopeType}</span>
                  <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">{selectedProject.title}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={selectedProject.status}
                    onChange={(e) => onUpdateStatus(selectedProject.id, e.target.value)}
                    className="bg-white border border-slate-200/90 text-xs font-semibold text-slate-800 rounded-xl px-3 py-1.5 focus:outline-none shadow-xs cursor-pointer"
                  >
                    <option value="not_started">Not Started</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed ✓</option>
                  </select>
                </div>
              </div>

              {/* Why it matters */}
              <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 text-xs text-indigo-950">
                <span className="font-bold text-indigo-900 block mb-1">Why This Project Impresses Hiring Teams:</span>
                {selectedProject.whyItMatters}
              </div>

              {/* Skills Demonstrated */}
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
                  Demonstrated Skills
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {(selectedProject.skillsDemonstrated || []).map((skill, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 text-xs rounded-lg bg-slate-100 text-slate-700 border border-slate-200/70"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Acceptance Criteria */}
              {selectedProject.acceptanceCriteria && selectedProject.acceptanceCriteria.length > 0 && (
                <div className="space-y-2 pt-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                    Acceptance Criteria
                  </span>
                  <ul className="space-y-2 text-xs text-slate-600">
                    {selectedProject.acceptanceCriteria.map((c, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Test Scenarios */}
              {selectedProject.testScenarios && selectedProject.testScenarios.length > 0 && (
                <div className="space-y-2 pt-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-700 block">
                    Recommended Test Scenarios & Edge Cases
                  </span>
                  <ul className="space-y-2 text-xs text-slate-600">
                    {selectedProject.testScenarios.map((t, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Submit to Evidence Action */}
              {onNavigateToEvidence && (
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500">Ready to submit repository link or code snippet?</span>
                  <button
                    onClick={onNavigateToEvidence}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all cursor-pointer shadow-xs active:scale-95"
                  >
                    <span>Record in Evidence Vault</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* AI Project Mentor Panel (5 cols) */}
          <div className="lg:col-span-5 p-6 rounded-3xl glass-panel border border-slate-200/70 shadow-xs flex flex-col h-[640px]">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200/60 flex items-center justify-center text-indigo-600">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Staff Project Mentor</h4>
                  <p className="text-[10px] text-slate-500">{selectedProject.title}</p>
                </div>
              </div>
              <span className="text-[10px] font-semibold text-slate-400">Gemini Active</span>
            </div>

            {/* Suggested prompt chips */}
            <div className="py-2.5 border-b border-slate-100 shrink-0 space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Suggested questions:</span>
              <div className="flex flex-col gap-1">
                {suggestedPrompts.slice(0, 2).map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => handleAskMentor(prompt)}
                    className="text-left text-[11px] text-slate-600 hover:text-indigo-600 px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200/70 hover:border-indigo-200 truncate transition-colors cursor-pointer"
                  >
                    &ldquo;{prompt}&rdquo;
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto py-3 space-y-3 pr-1 text-xs">
              {messages.length === 0 ? (
                <div className="py-8 text-center text-slate-400">
                  <Bot className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  Ask any question about architecture, library selection, testing edge cases, or documentation for this project.
                </div>
              ) : (
                messages.map((m, i) => (
                  <div
                    key={i}
                    className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[88%] p-3.5 rounded-2xl leading-relaxed whitespace-pre-wrap shadow-xs ${
                        m.role === 'user'
                          ? 'bg-slate-900 text-white rounded-tr-xs'
                          : 'bg-white border border-slate-200/80 text-slate-800 rounded-tl-xs'
                      }`}
                    >
                      {m.content}
                    </div>
                    <span className="text-[9px] text-slate-400 mt-0.5 px-1 font-medium">
                      {m.role === 'user' ? 'You' : 'Staff Mentor'}
                    </span>
                  </div>
                ))
              )}
              {isAskingMentor && (
                <div className="flex items-center gap-2 p-3 rounded-2xl bg-indigo-50/50 text-indigo-700 text-xs">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Mentor is formulating technical guidance...</span>
                </div>
              )}
            </div>

            {/* Query Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAskMentor();
              }}
              className="pt-3 border-t border-slate-100 flex gap-2 shrink-0"
            >
              <input
                type="text"
                placeholder="Ask about architecture, edge cases, tests..."
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
                disabled={isAskingMentor}
                className="flex-1 px-3 py-2 text-xs glass-input rounded-xl placeholder-slate-400 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!userQuery.trim() || isAskingMentor}
                className="p-2.5 text-white bg-slate-900 hover:bg-slate-800 rounded-xl disabled:opacity-40 transition-colors cursor-pointer"
                aria-label="Send question to mentor"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

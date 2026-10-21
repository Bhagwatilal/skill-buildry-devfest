import React, { useState } from 'react';
import {
  MessageSquareCode,
  Sparkles,
  RefreshCw,
  Send,
  Award,
  CheckCircle2,
  AlertCircle,
  Clock,
  HelpCircle,
  ArrowRight,
  RotateCcw,
  ShieldCheck,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import type { InterviewQuestion, InterviewAttempt, Profile } from '../types/index.ts';

interface InterviewPrepPageProps {
  questions: InterviewQuestion[];
  attempts: InterviewAttempt[];
  profile: Profile | null;
  onGenerateQuestions: (category: string, difficulty?: string) => Promise<void>;
  onSubmitAnswer: (questionId: string, questionText: string, rubric: any, userAnswer: string) => Promise<InterviewAttempt>;
  isGenerating: boolean;
}

const CATEGORIES = [
  'Fundamentals',
  'Practical Implementation',
  'Debugging & Troubleshooting',
  'Architecture & Design',
  'Scenario-Based',
];

export const InterviewPrepPage: React.FC<InterviewPrepPageProps> = ({
  questions,
  attempts,
  profile,
  onGenerateQuestions,
  onSubmitAnswer,
  isGenerating,
}) => {
  const [selectedQuestion, setSelectedQuestion] = useState<InterviewQuestion | null>(questions[0] || null);
  const [selectedCategory, setSelectedCategory] = useState('Fundamentals');
  const [userAnswer, setUserAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [latestAttempt, setLatestAttempt] = useState<InterviewAttempt | null>(null);

  React.useEffect(() => {
    if (selectedQuestion) {
      const prev = attempts.find((a) => a.questionId === selectedQuestion.id);
      if (prev) {
        setLatestAttempt(prev);
      }
    }
  }, [selectedQuestion?.id, attempts]);

  const handleSelectQuestion = (q: InterviewQuestion) => {
    setSelectedQuestion(q);
    setUserAnswer('');
    const prev = attempts.find((a) => a.questionId === q.id);
    setLatestAttempt(prev || null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuestion || !userAnswer.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const attempt = await onSubmitAnswer(
        selectedQuestion.id,
        selectedQuestion.question,
        selectedQuestion.rubric,
        userAnswer.trim()
      );
      setLatestAttempt(attempt);
    } catch (err: any) {
      console.error('Answer submission failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-7 rounded-3xl glass-panel-elevated border border-white/90 shadow-sm bg-gradient-to-r from-indigo-50/50 via-white/80 to-purple-50/40">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              Technical Interview Simulator
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200/50">
              Rubric Scored
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Interview Preparation for {profile?.targetRole || 'Software Engineer'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
            Practice articulating your reasoning for real technical interview questions. Receive instant staff-level feedback
            identifying your strengths, missing edge cases, and a model answer.
          </p>
        </div>

        {/* Generate Category Dropdown & Button */}
        <div className="flex items-center gap-2 shrink-0">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-white border border-slate-200/80 text-xs font-semibold text-slate-800 rounded-xl px-3 py-2.5 focus:outline-none shadow-xs"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <button
            onClick={() => onGenerateQuestions(selectedCategory, profile?.targetLevel || 'Mid-Level')}
            disabled={isGenerating}
            className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs disabled:opacity-50 transition-all cursor-pointer active:scale-95"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>Generate Questions</span>
          </button>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Questions Selector List (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
            <span>Interview Bank ({questions.length})</span>
            <span className="text-indigo-600 font-semibold">{attempts.length} Attempted</span>
          </div>

          <div className="space-y-2 max-h-[680px] overflow-y-auto pr-1">
            {questions.map((q) => {
              const isSelected = selectedQuestion?.id === q.id;
              const pastAttempt = attempts.find((a) => a.questionId === q.id);

              return (
                <div
                  key={q.id}
                  onClick={() => handleSelectQuestion(q)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer glass-card ${
                    isSelected
                      ? 'border-indigo-400 bg-white shadow-md ring-2 ring-indigo-500/10'
                      : 'border-slate-200/70 bg-white/70 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                      {q.category}
                    </span>
                    {pastAttempt && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-1.5 py-0.2 rounded-md">
                        {pastAttempt.score}/100 ✓
                      </span>
                    )}
                  </div>
                  <h4 className="text-xs font-semibold text-slate-900 line-clamp-2 leading-relaxed">
                    {q.question}
                  </h4>
                </div>
              );
            })}
          </div>
        </div>

        {/* Practice & Feedback Area (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {selectedQuestion ? (
            <div className="p-6 sm:p-7 rounded-3xl glass-panel border border-slate-200/70 shadow-xs space-y-5">
              {/* Question Header */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                    {selectedQuestion.category} &middot; {selectedQuestion.difficulty}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 leading-relaxed">
                  {selectedQuestion.question}
                </h3>
              </div>

              {/* Rubric Hints */}
              {selectedQuestion.rubric && (
                <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100/80 space-y-2 text-xs">
                  <span className="font-bold text-indigo-900 uppercase tracking-wider text-[10px] block">
                    Interviewer Rubric & Key Concepts
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {(selectedQuestion.rubric.keyConcepts || []).map((concept, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-md bg-white text-indigo-700 border border-indigo-200/60 shadow-2xs">
                        {concept}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Answer Input Area */}
              <form onSubmit={handleSubmit} className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Your Answer
                </label>
                <textarea
                  rows={6}
                  required
                  placeholder="Explain your approach, architectural trade-offs, and how you prevent failure scenarios..."
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full p-3.5 text-xs sm:text-sm glass-input rounded-2xl placeholder-slate-400 resize-none disabled:opacity-50 leading-relaxed font-mono"
                />

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-500">
                    Graded against industry hiring standards for {profile?.targetRole || 'this role'}.
                  </span>
                  <button
                    type="submit"
                    disabled={!userAnswer.trim() || isSubmitting}
                    className="flex items-center gap-2 px-6 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs disabled:opacity-50 transition-all cursor-pointer active:scale-95"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Evaluating Answer...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Submit for Evaluation</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Latest Attempt / Feedback Card */}
              {latestAttempt && (
                <div className="mt-6 pt-6 border-t border-slate-200/60 space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-white/80 border border-slate-200/70 shadow-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200/60 flex items-center justify-center text-indigo-700 font-extrabold text-xl">
                        {latestAttempt.score}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">Evaluation Score: {latestAttempt.score}/100</div>
                        <div className="text-[11px] text-slate-500">
                          {latestAttempt.score >= 80 ? 'Strong Candidate Answer' : 'Solid Base with Growth Gaps'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Feedback Breakdown */}
                  {latestAttempt.feedback && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      {/* Explained Well */}
                      <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/60 space-y-2">
                        <span className="font-bold text-emerald-800 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          What You Explained Well
                        </span>
                        <ul className="space-y-1 text-slate-700">
                          {(latestAttempt.feedback.whatWasExplainedWell || []).map((item, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <span className="text-emerald-600 font-bold">&bull;</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Important Missing Concepts */}
                      <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200/60 space-y-2">
                        <span className="font-bold text-rose-800 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                          Missing Concepts & Edge Cases
                        </span>
                        <ul className="space-y-1 text-slate-700">
                          {(latestAttempt.feedback.importantMissingConcepts || []).map((item, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <span className="text-rose-600 font-bold">&bull;</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Stronger Answer Suggestion */}
                  {latestAttempt.feedback?.strongerAnswerSuggestion && (
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                      <span className="font-bold text-slate-800 uppercase tracking-wider text-[10px] block">
                        Exemplar Standout Answer:
                      </span>
                      <p className="text-slate-600 leading-relaxed">
                        {latestAttempt.feedback.strongerAnswerSuggestion}
                      </p>
                    </div>
                  )}

                  {/* Follow-up question */}
                  {latestAttempt.feedback?.followUpQuestion && (
                    <div className="p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-100 text-xs text-indigo-900">
                      <strong>Interviewer Follow-Up:</strong> &ldquo;{latestAttempt.feedback.followUpQuestion}&rdquo;
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 text-center glass-panel rounded-3xl border border-slate-200/70 text-xs text-slate-400">
              Select an interview question on the left to start your practice session.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

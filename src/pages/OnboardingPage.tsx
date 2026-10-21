import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  Plus,
  Trash2,
  Briefcase,
  GraduationCap,
  Clock,
  Calendar,
  Layers,
  Github,
  Globe,
  Linkedin,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import type { SkillLevel } from '../types/index.ts';

interface OnboardingPageProps {
  onComplete: (data: { profile: any; skills: any[] }) => Promise<void>;
  onCancel: () => void;
}

const COMMON_ROLES = [
  'Flutter Developer',
  'Frontend Developer (React)',
  'Backend Developer (Node/Go)',
  'Full Stack Developer',
  'AI/ML Engineer',
  'Data Analyst',
  'DevOps & Cloud Engineer',
  'Mobile Developer (iOS/Android)',
];

const PRESET_SKILLS_BY_ROLE: Record<string, Array<{ name: string; category: string }>> = {
  'Flutter Developer': [
    { name: 'Dart Language', category: 'Programming Languages' },
    { name: 'Flutter Widgets & UI', category: 'Frameworks & Libraries' },
    { name: 'REST API & HTTP', category: 'APIs & Backend' },
    { name: 'Git & GitHub', category: 'Collaboration' },
    { name: 'Riverpod / BLoC State Management', category: 'Architecture & Design' },
    { name: 'Automated Unit & Widget Testing', category: 'Testing & Debugging' },
    { name: 'Mobile CI/CD & Fastlane', category: 'Deployment & Release' },
  ],
  default: [
    { name: 'JavaScript / TypeScript', category: 'Programming Languages' },
    { name: 'React / Next.js', category: 'Frameworks & Libraries' },
    { name: 'REST & GraphQL APIs', category: 'APIs & Backend' },
    { name: 'Git Version Control', category: 'Collaboration' },
    { name: 'Unit & Integration Testing', category: 'Testing & Debugging' },
    { name: 'SQL & Database Design', category: 'Databases' },
  ],
};

export const OnboardingPage: React.FC<OnboardingPageProps> = ({ onComplete, onCancel }) => {
  const [step, setStep] = useState(1);

  // Form State
  const [targetRole, setTargetRole] = useState('Flutter Developer');
  const [customRole, setCustomRole] = useState('');
  const [targetLevel, setTargetLevel] = useState<'Entry-Level' | 'Junior' | 'Mid-Level' | 'Senior'>('Mid-Level');

  const [currentTitle, setCurrentTitle] = useState('Junior Mobile Developer');
  const [yearsExperience, setYearsExperience] = useState<number>(1.5);
  const [bio, setBio] = useState('Building client applications, eager to master architecture, testing, and production pipelines.');

  const [skills, setSkills] = useState<Array<{ name: string; category: string; selfAssessedLevel: SkillLevel }>>([
    { name: 'Dart Language', category: 'Programming Languages', selfAssessedLevel: 'Advanced' },
    { name: 'Flutter Widgets & UI', category: 'Frameworks & Libraries', selfAssessedLevel: 'Advanced' },
    { name: 'REST API & HTTP', category: 'APIs & Backend', selfAssessedLevel: 'Intermediate' },
    { name: 'Git & GitHub', category: 'Collaboration', selfAssessedLevel: 'Intermediate' },
  ]);

  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCategory, setNewSkillCategory] = useState('General');
  const [newSkillLevel, setNewSkillLevel] = useState<SkillLevel>('Intermediate');

  const [studyHoursPerDay, setStudyHoursPerDay] = useState<number>(2);
  const [studyDaysPerWeek, setStudyDaysPerWeek] = useState<number>(5);
  const [targetTimelineWeeks, setTargetTimelineWeeks] = useState<number>(10);
  const [learningStyle, setLearningStyle] = useState<'hands-on' | 'guided' | 'reading' | 'mixed'>('hands-on');

  const [githubUrl, setGithubUrl] = useState('https://github.com/my-profile');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');

  // Loading state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingPhase, setLoadingPhase] = useState(0);

  const activeRole = targetRole === 'Custom' ? customRole : targetRole;

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;
    setSkills([
      ...skills,
      {
        name: newSkillName.trim(),
        category: newSkillCategory,
        selfAssessedLevel: newSkillLevel,
      },
    ]);
    setNewSkillName('');
  };

  const handleRemoveSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const handleAddSuggestedSkill = (s: { name: string; category: string }) => {
    if (skills.some((existing) => existing.name.toLowerCase() === s.name.toLowerCase())) return;
    setSkills([...skills, { ...s, selfAssessedLevel: 'Beginner' }]);
  };

  const handleSubmitAnalysis = async () => {
    setIsSubmitting(true);
    setLoadingPhase(1);

    const timer1 = setTimeout(() => setLoadingPhase(2), 1200);
    const timer2 = setTimeout(() => setLoadingPhase(3), 2600);
    const timer3 = setTimeout(() => setLoadingPhase(4), 4000);

    try {
      await onComplete({
        profile: {
          targetRole: activeRole || 'Software Engineer',
          targetLevel,
          currentTitle,
          yearsExperience,
          studyHoursPerDay,
          studyDaysPerWeek,
          targetTimelineWeeks,
          learningStyle,
          githubUrl,
          portfolioUrl,
          linkedinUrl,
          bio,
        },
        skills,
      });
    } finally {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      setIsSubmitting(false);
    }
  };

  const loadingMessages = [
    'Connecting to intelligence engine...',
    'Understanding role expectations & hiring criteria...',
    'Mapping self-assessed skills to production competencies...',
    'Generating targeted skill gap breakdown & sprint roadmap...',
  ];

  return (
    <div className="min-h-screen w-full bg-[#F8F9FA] text-[#111215] flex flex-col justify-between p-4 sm:p-6 lg:p-8 font-sans">
      {/* Top Bar with Step Progress */}
      <div className="max-w-2xl mx-auto w-full mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#121417] text-[#E2F86B] font-bold text-xs shadow-xs">
              ✦
            </div>
            <span className="font-extrabold text-[#111215] text-sm">Career Profile Builder</span>
          </div>
          <button
            onClick={onCancel}
            className="text-xs font-semibold text-slate-700 hover:text-black px-3.5 py-1.5 rounded-full bg-white/80 hover:bg-white border border-slate-200/80 transition-colors cursor-pointer"
          >
            Exit to Home
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-white rounded-full h-2.5 overflow-hidden border border-slate-200/80">
          <div
            className="bg-[#121417] h-full transition-all duration-300"
            style={{ width: `${(step / 6) * 100}%` }}
          />
        </div>
        <div className="flex justify-between text-[11px] text-slate-600 mt-2 font-medium">
          <span>Step {step} of 6</span>
          <span className="font-bold text-[#111215]">{Math.round((step / 6) * 100)}% Complete</span>
        </div>
      </div>

      {/* Main Card */}
      <main className="max-w-2xl mx-auto w-full bento-card-white rounded-[2.5rem] p-6 sm:p-8 shadow-2xl relative">
        {isSubmitting ? (
          /* Loading Overlay during analysis request */
          <div className="py-16 text-center space-y-6">
            <div className="relative mx-auto w-16 h-16 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
              <Sparkles className="w-6 h-6 text-indigo-600 animate-pulse" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-slate-900">Analyzing Your Career Path</h3>
              <p className="mt-2 text-sm text-indigo-600 font-semibold">
                {loadingMessages[loadingPhase] || loadingMessages[0]}
              </p>
            </div>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Comparing your experience against production expectations for {activeRole}.
            </p>
          </div>
        ) : (
          <div>
            {/* STEP 1: TARGET ROLE & LEVEL */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">What role are you working towards?</h2>
                  <p className="mt-1 text-xs sm:text-sm text-slate-600">
                    Your target role and seniority determine the expected depth of skills and portfolio projects.
                  </p>
                </div>

                <div className="space-y-3">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Select target role
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {COMMON_ROLES.map((role) => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => setTargetRole(role)}
                        className={`text-left p-3.5 rounded-2xl border text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                          targetRole === role
                            ? 'bg-indigo-50 border-indigo-300 text-indigo-900 font-semibold shadow-xs'
                            : 'bg-white/80 border-slate-200/70 text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        {role}
                      </button>
                    ))}
                  </div>

                  <div className="pt-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                      Or custom role
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Flutter Architect, Rust Systems Engineer..."
                      value={customRole}
                      onChange={(e) => {
                        setCustomRole(e.target.value);
                        setTargetRole('Custom');
                      }}
                      className="w-full px-3.5 py-2 text-sm glass-input rounded-xl placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Target Experience Level
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {(['Entry-Level', 'Junior', 'Mid-Level', 'Senior'] as const).map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setTargetLevel(lvl)}
                        className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                          targetLevel === lvl
                            ? 'bg-indigo-50 border-indigo-300 text-indigo-900 shadow-xs'
                            : 'bg-white border-slate-200/70 text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: CURRENT EXPERIENCE */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Your Current Experience</h2>
                  <p className="mt-1 text-xs sm:text-sm text-slate-600">
                    We calibrate expectations so recommendations meet you right where you are.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                      Current Job Title or Status
                    </label>
                    <input
                      type="text"
                      value={currentTitle}
                      onChange={(e) => setCurrentTitle(e.target.value)}
                      placeholder="e.g. CS Student, Junior Developer, Self-Taught Learner"
                      className="w-full px-3.5 py-2 text-sm glass-input rounded-xl placeholder:text-slate-400"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1 font-semibold uppercase tracking-wider text-slate-500">
                      <span>Years of Relevant Experience</span>
                      <span className="text-indigo-600 font-bold">{yearsExperience} {yearsExperience === 1 ? 'Year' : 'Years'}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      step="0.5"
                      value={yearsExperience}
                      onChange={(e) => setYearsExperience(parseFloat(e.target.value))}
                      className="w-full accent-indigo-600 cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                      Brief Background & Career Goal
                    </label>
                    <textarea
                      rows={3}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="What projects have you completed? What's your immediate goal?"
                      className="w-full px-3.5 py-2 text-sm glass-input rounded-xl placeholder:text-slate-400 resize-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: EXISTING SKILLS */}
            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">What skills do you already know?</h2>
                  <p className="mt-1 text-xs sm:text-sm text-slate-600">
                    Self-assess your current comfort level honestly. We will use this to find the exact gaps.
                  </p>
                </div>

                {/* Suggested skills pills */}
                <div className="space-y-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    Suggested for {activeRole}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {(PRESET_SKILLS_BY_ROLE[activeRole] || PRESET_SKILLS_BY_ROLE.default).map((s) => (
                      <button
                        key={s.name}
                        type="button"
                        onClick={() => handleAddSuggestedSkill(s)}
                        className="px-2.5 py-1 text-xs rounded-lg bg-white border border-slate-200 text-slate-700 hover:border-indigo-300 hover:text-indigo-700 flex items-center gap-1 cursor-pointer shadow-xs"
                      >
                        <Plus className="w-3 h-3 text-indigo-600" />
                        <span>{s.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Current skills list */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    Your Current Assessed Skills ({skills.length})
                  </span>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {skills.map((s, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2.5 rounded-2xl bg-white/80 border border-slate-200/70"
                      >
                        <div>
                          <div className="font-semibold text-xs text-slate-900">{s.name}</div>
                          <div className="text-[10px] text-slate-500">{s.category}</div>
                        </div>

                        <div className="flex items-center gap-2">
                          <select
                            value={s.selfAssessedLevel}
                            onChange={(e) => {
                              const updated = [...skills];
                              updated[idx].selfAssessedLevel = e.target.value as SkillLevel;
                              setSkills(updated);
                            }}
                            className="bg-slate-50 border border-slate-200 text-xs text-indigo-700 rounded-lg px-2 py-1 focus:outline-none"
                          >
                            <option value="Beginner">Beginner</option>
                            <option value="Intermediate">Intermediate</option>
                            <option value="Advanced">Advanced</option>
                            <option value="Expert">Expert</option>
                          </select>
                          <button
                            type="button"
                            onClick={() => handleRemoveSkill(idx)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded-md cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Add custom skill input */}
                <form onSubmit={handleAddSkill} className="flex gap-2 pt-2">
                  <input
                    type="text"
                    placeholder="Add custom skill (e.g. SQLite, Docker)..."
                    value={newSkillName}
                    onChange={(e) => setNewSkillName(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs glass-input rounded-xl placeholder:text-slate-400"
                  />
                  <select
                    value={newSkillLevel}
                    onChange={(e) => setNewSkillLevel(e.target.value as SkillLevel)}
                    className="bg-white border border-slate-200 text-xs text-slate-700 rounded-xl px-2 py-1.5 focus:outline-none shadow-xs"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Expert">Expert</option>
                  </select>
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl cursor-pointer shadow-xs"
                  >
                    Add
                  </button>
                </form>
              </div>
            )}

            {/* STEP 4: LEARNING PREFERENCES */}
            {step === 4 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Your Learning Availability</h2>
                  <p className="mt-1 text-xs sm:text-sm text-slate-600">
                    Realistic planning prevents burnout. Sprints are sized to your calendar.
                  </p>
                </div>

                <div className="space-y-5">
                  <div>
                    <div className="flex justify-between text-xs mb-1 font-semibold uppercase tracking-wider text-slate-500">
                      <span>Daily Study Time</span>
                      <span className="text-indigo-600 font-bold">{studyHoursPerDay} Hours / Day</span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="6"
                      step="0.5"
                      value={studyHoursPerDay}
                      onChange={(e) => setStudyHoursPerDay(parseFloat(e.target.value))}
                      className="w-full accent-indigo-600 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1 font-semibold uppercase tracking-wider text-slate-500">
                      <span>Days Per Week</span>
                      <span className="text-indigo-600 font-bold">{studyDaysPerWeek} Days / Week</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="7"
                      step="1"
                      value={studyDaysPerWeek}
                      onChange={(e) => setStudyDaysPerWeek(parseInt(e.target.value, 10))}
                      className="w-full accent-indigo-600 cursor-pointer"
                    />
                    <p className="text-[11px] text-slate-500 mt-1">
                      Total commitment: <span className="text-slate-800 font-semibold">{studyHoursPerDay * studyDaysPerWeek} hours/week</span>
                    </p>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1 font-semibold uppercase tracking-wider text-slate-500">
                      <span>Target Milestone Timeline</span>
                      <span className="text-indigo-600 font-bold">{targetTimelineWeeks} Weeks</span>
                    </div>
                    <input
                      type="range"
                      min="4"
                      max="24"
                      step="2"
                      value={targetTimelineWeeks}
                      onChange={(e) => setTargetTimelineWeeks(parseInt(e.target.value, 10))}
                      className="w-full accent-indigo-600 cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                      Preferred Learning Style
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'hands-on', label: 'Hands-On Projects', desc: 'Code first, theory on demand' },
                        { id: 'guided', label: 'Guided Exercises', desc: 'Step-by-step walkthroughs' },
                        { id: 'mixed', label: 'Balanced Mix', desc: 'Equal theory and build challenges' },
                        { id: 'reading', label: 'Deep Reading', desc: 'Architecture docs & RFCs' },
                      ].map((style) => (
                        <button
                          key={style.id}
                          type="button"
                          onClick={() => setLearningStyle(style.id as any)}
                          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                            learningStyle === style.id
                              ? 'bg-indigo-50 border-indigo-300 text-indigo-900 shadow-xs'
                              : 'bg-white border-slate-200/70 text-slate-700 hover:border-slate-300'
                          }`}
                        >
                          <div className="text-xs font-bold">{style.label}</div>
                          <div className="text-[10px] text-slate-500 mt-0.5">{style.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 5: PORTFOLIO & EVIDENCE */}
            {step === 5 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Portfolio & Existing Evidence</h2>
                  <p className="mt-1 text-xs sm:text-sm text-slate-600">
                    Optionally provide links to your code or profiles to incorporate into your proof profile.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                      GitHub Profile URL
                    </label>
                    <div className="relative">
                      <Github className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                      <input
                        type="url"
                        value={githubUrl}
                        onChange={(e) => setGithubUrl(e.target.value)}
                        placeholder="https://github.com/username"
                        className="w-full pl-9 pr-3 py-2 text-sm glass-input rounded-xl placeholder:text-slate-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                      Portfolio or Live App URL
                    </label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                      <input
                        type="url"
                        value={portfolioUrl}
                        onChange={(e) => setPortfolioUrl(e.target.value)}
                        placeholder="https://yourportfolio.dev"
                        className="w-full pl-9 pr-3 py-2 text-sm glass-input rounded-xl placeholder:text-slate-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                      LinkedIn URL
                    </label>
                    <div className="relative">
                      <Linkedin className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                      <input
                        type="url"
                        value={linkedinUrl}
                        onChange={(e) => setLinkedinUrl(e.target.value)}
                        placeholder="https://linkedin.com/in/username"
                        className="w-full pl-9 pr-3 py-2 text-sm glass-input rounded-xl placeholder:text-slate-400"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 6: SUMMARY & ANALYZE */}
            {step === 6 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Review Your Profile</h2>
                  <p className="mt-1 text-xs sm:text-sm text-slate-600">
                    Ready to run your career gap analysis and generate your personalized sprint plan.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white/80 border border-slate-200/70 space-y-3 text-xs shadow-xs">
                  <div className="flex justify-between pb-2 border-b border-slate-100">
                    <span className="text-slate-500">Target Role:</span>
                    <span className="font-bold text-slate-900">{activeRole} ({targetLevel})</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-slate-100">
                    <span className="text-slate-500">Current Standing:</span>
                    <span className="font-medium text-slate-800">{currentTitle} &middot; {yearsExperience} yrs exp</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-slate-100">
                    <span className="text-slate-500">Weekly Commitment:</span>
                    <span className="font-medium text-indigo-600">{studyHoursPerDay * studyDaysPerWeek} hours/week over {targetTimelineWeeks} weeks</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Skills Reported:</span>
                    <span className="font-medium text-emerald-600">{skills.length} skills ready for evaluation</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-100 text-xs text-indigo-950 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>Role expectations will be evaluated to formulate concrete proof-of-skill tasks.</span>
                </div>
              </div>
            )}

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-6 mt-6 border-t border-slate-100">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200/80 rounded-xl transition-colors cursor-pointer shadow-xs"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
              ) : (
                <div />
              )}

              {step < 6 ? (
                <button
                  type="button"
                  onClick={() => setStep(step + 1)}
                  className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs transition-all cursor-pointer active:scale-95"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmitAnalysis}
                  className="flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-md transition-all cursor-pointer active:scale-95"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Analyze My Career Path</span>
                </button>
              )}
            </div>
          </div>
        )}
      </main>

      <footer className="max-w-2xl mx-auto w-full text-center text-[11px] text-slate-400 mt-8">
        Skill Buildry &middot; Intelligent Career Workspace
      </footer>
    </div>
  );
};

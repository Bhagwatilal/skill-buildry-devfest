import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { AppSidebar, NavTab } from './components/layout/AppSidebar.tsx';
import { Topbar } from './components/layout/Topbar.tsx';
import { AuthModal } from './components/layout/AuthModal.tsx';

import { LandingPage } from './pages/LandingPage.tsx';
import { OnboardingPage } from './pages/OnboardingPage.tsx';
import { DashboardPage } from './pages/DashboardPage.tsx';
import { SkillProfilePage } from './pages/SkillProfilePage.tsx';
import { SkillGapPage } from './pages/SkillGapPage.tsx';
import { RoadmapPage } from './pages/RoadmapPage.tsx';
import { ProjectLabPage } from './pages/ProjectLabPage.tsx';
import { InterviewPrepPage } from './pages/InterviewPrepPage.tsx';
import { EvidencePage } from './pages/EvidencePage.tsx';
import { SettingsPage } from './pages/SettingsPage.tsx';

import { api } from './services/api.ts';
import type {
  Profile,
  SkillItem,
  GapAnalysis,
  Roadmap,
  ProjectRecommendation,
  EvidenceRecord,
  InterviewQuestion,
  InterviewAttempt,
  ProgressHistoryEvent,
} from './types/index.ts';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

function AppContent() {
  const { user, isLoading: authLoading, loginAsDemo, logout } = useAuth();

  // Navigation & UI State
  const [currentTab, setCurrentTab] = useState<NavTab>('overview');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authDefaultMode, setAuthDefaultMode] = useState<'login' | 'register'>('login');
  const [showStoryLanding, setShowStoryLanding] = useState(true);

  // Application Data State
  const [profile, setProfile] = useState<Profile | null>(null);
  const [skills, setSkills] = useState<SkillItem[]>([]);
  const [gapAnalysis, setGapAnalysis] = useState<GapAnalysis | null>(null);
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [projects, setProjects] = useState<ProjectRecommendation[]>([]);
  const [evidence, setEvidence] = useState<EvidenceRecord[]>([]);
  const [interviewQuestions, setInterviewQuestions] = useState<InterviewQuestion[]>([]);
  const [interviewAttempts, setInterviewAttempts] = useState<InterviewAttempt[]>([]);
  const [progressEvents, setProgressEvents] = useState<ProgressHistoryEvent[]>([]);

  // Loading States
  const [dataLoading, setDataLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingRoadmap, setIsGeneratingRoadmap] = useState(false);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);

  // Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Active Technology Track (Default to Flutter or saved track)
  const [currentTrackId, setCurrentTrackId] = useState<string>(() => {
    try {
      return localStorage.getItem('sb_current_track_id') || 'flutter';
    } catch {
      return 'flutter';
    }
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Switch Active Career Track & Tech Stack
  const handleSwitchTrack = async (trackId: string) => {
    setDataLoading(true);
    try {
      setCurrentTrackId(trackId);
      const res = await api.tracks.switchTrack(trackId);
      setProfile(res.profile);
      setSkills(res.skills);
      setGapAnalysis(res.gapAnalysis);
      setRoadmap(res.roadmap);
      setProjects(res.projects);

      // Refresh auxiliary data
      const [evRes, qRes, attRes, evtsRes] = await Promise.all([
        api.evidence.getAll().catch(() => ({ evidence: [] })),
        api.interview.getQuestions().catch(() => ({ questions: [] })),
        api.interview.getAttempts().catch(() => ({ attempts: [] })),
        api.progress.getEvents().catch(() => ({ events: [] })),
      ]);
      setEvidence(evRes.evidence || []);
      setInterviewQuestions(qRes.questions || []);
      setInterviewAttempts(attRes.attempts || []);
      setProgressEvents(evtsRes.events || []);

      showToast(`Switched career track to ${res.profile.targetRole}!`);
    } catch (err: any) {
      showToast(err.message || 'Failed to switch track');
    } finally {
      setDataLoading(false);
    }
  };

  // Fetch full application state when user changes
  const loadAppData = async () => {
    if (!user) {
      setProfile(null);
      setSkills([]);
      setGapAnalysis(null);
      setRoadmap(null);
      setProjects([]);
      setEvidence([]);
      setInterviewQuestions([]);
      setInterviewAttempts([]);
      setProgressEvents([]);
      return;
    }

    setDataLoading(true);
    try {
      const [
        profileRes,
        gapRes,
        roadmapRes,
        projectsRes,
        evidenceRes,
        questionsRes,
        attemptsRes,
        eventsRes,
      ] = await Promise.all([
        api.profile.get().catch(() => ({ profile: null, skills: [] })),
        api.gapAnalysis.getLatest().catch(() => ({ analysis: null })),
        api.roadmap.get().catch(() => ({ roadmap: null })),
        api.projects.getAll().catch(() => ({ projects: [] })),
        api.evidence.getAll().catch(() => ({ evidence: [] })),
        api.interview.getQuestions().catch(() => ({ questions: [] })),
        api.interview.getAttempts().catch(() => ({ attempts: [] })),
        api.progress.getEvents().catch(() => ({ events: [] })),
      ]);

      setProfile(profileRes.profile);
      setSkills(profileRes.skills || []);
      setGapAnalysis(gapRes.analysis);
      setRoadmap(roadmapRes.roadmap);
      setProjects(projectsRes.projects || []);
      setEvidence(evidenceRes.evidence || []);
      setInterviewQuestions(questionsRes.questions || []);
      setInterviewAttempts(attemptsRes.attempts || []);
      setProgressEvents(eventsRes.events || []);

      // If user has no profile, direct them to onboarding flow
      if (!profileRes.profile) {
        setIsOnboarding(true);
      } else {
        setIsOnboarding(false);
      }
    } catch (err: any) {
      console.error('Failed to load application data:', err);
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    loadAppData();
  }, [user?.id]);

  // Handler: Complete Onboarding Flow
  const handleOnboardingComplete = async (data: { profile: any; skills: any[] }) => {
    // If not authenticated, create account or register demo session
    if (!user) {
      await loginAsDemo();
    }

    try {
      // 1. Run gap analysis
      const analysisRes = await api.gapAnalysis.analyze({
        profile: data.profile,
        skills: data.skills,
      });
      setGapAnalysis(analysisRes.analysis);

      // 2. Refresh profile & skills
      const profRes = await api.profile.get();
      setProfile(profRes.profile);
      setSkills(profRes.skills);

      // 3. Generate initial roadmap & project recommendations
      const [roadmapRes, projectsRes] = await Promise.all([
        api.roadmap.generate().catch(() => ({ roadmap: null })),
        api.projects.recommend().catch(() => ({ projects: [] })),
      ]);

      if (roadmapRes.roadmap) setRoadmap(roadmapRes.roadmap);
      if (projectsRes.projects) setProjects(projectsRes.projects);

      setIsOnboarding(false);
      setCurrentTab('overview');
      showToast('Career analysis and customized roadmap generated!');
    } catch (err: any) {
      console.error('Onboarding analysis error:', err);
      showToast('Profile created. Showing customized career sprint.');
      setIsOnboarding(false);
      setCurrentTab('overview');
    }
  };

  // Handler: Refresh / Update Gap Analysis with Gemini
  const handleRefreshAnalysis = async () => {
    if (!profile) return;
    setIsAnalyzing(true);
    try {
      const res = await api.gapAnalysis.analyze();
      setGapAnalysis(res.analysis);
      showToast('AI skill gap analysis updated with Gemini!');
    } catch (err: any) {
      showToast(err.message || 'Failed to update analysis');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handler: Toggle Task Status
  const handleToggleTask = async (taskId: string, newStatus: 'todo' | 'in_progress' | 'completed') => {
    try {
      const res = await api.roadmap.updateTaskStatus(taskId, newStatus);
      setRoadmap(res.roadmap);

      // Refresh progress events
      const eventsRes = await api.progress.getEvents();
      setProgressEvents(eventsRes.events || []);

      if (newStatus === 'completed') {
        showToast('Sprint task completed! Saved to database.');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to update task status');
    }
  };

  // Handler: Regenerate Roadmap
  const handleRegenerateRoadmap = async () => {
    setIsGeneratingRoadmap(true);
    try {
      const res = await api.roadmap.generate();
      setRoadmap(res.roadmap);
      showToast('Roadmap adapted with Gemini!');
    } catch (err: any) {
      showToast(err.message || 'Failed to adapt roadmap');
    } finally {
      setIsGeneratingRoadmap(false);
    }
  };

  // Handler: Skills
  const handleAddSkill = async (newSkill: { name: string; category: string; selfAssessedLevel: string; hasEvidence?: boolean }) => {
    const res = await api.skills.add(newSkill);
    const refreshed = await api.skills.getAll();
    setSkills(refreshed.skills);
    showToast(`Added ${newSkill.name} to skill profile`);
  };

  const handleDeleteSkill = async (id: string) => {
    await api.skills.delete(id);
    const refreshed = await api.skills.getAll();
    setSkills(refreshed.skills);
    showToast('Skill deleted');
  };

  // Handler: Evidence
  const handleAddEvidence = async (record: {
    title: string;
    skillName: string;
    evidenceType: string;
    urlOrContent: string;
    requestAiReview?: boolean;
  }) => {
    const res = await api.evidence.add(record);
    setEvidence(res.evidence);

    // Refresh skills to reflect hasEvidence
    const refreshedSkills = await api.skills.getAll();
    setSkills(refreshedSkills.skills);

    showToast('Evidence recorded and evaluated by Gemini!');
  };

  const handleDeleteEvidence = async (id: string) => {
    const res = await api.evidence.delete(id);
    setEvidence(res.evidence);
    showToast('Evidence record removed');
  };

  // Handler: Interview
  const handleGenerateInterviewQuestions = async (category: string, difficulty?: string) => {
    setIsGeneratingQuestions(true);
    try {
      const res = await api.interview.generateQuestions(category, difficulty);
      setInterviewQuestions(res.questions);
      showToast('Generated new interview questions with Gemini!');
    } catch (err: any) {
      showToast(err.message || 'Failed to generate questions');
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  const handleSubmitInterviewAnswer = async (questionId: string, questionText: string, rubric: any, userAnswer: string) => {
    const res = await api.interview.submitAnswer(questionId, questionText, rubric, userAnswer);
    const updatedAttempts = await api.interview.getAttempts();
    setInterviewAttempts(updatedAttempts.attempts);
    showToast(`Answer evaluated! Score: ${res.attempt.score}/100`);
    return res.attempt;
  };

  // Handler: Update Project Status
  const handleUpdateProjectStatus = async (projectId: string, status: string) => {
    const res = await api.projects.updateStatus(projectId, status);
    setProjects(res.projects);
    showToast('Project status updated');
  };

  // Handler: Update Profile
  const handleUpdateProfile = async (data: Partial<Profile>) => {
    const res = await api.profile.save(data);
    setProfile(res.profile);
    showToast('Profile updated');
  };

  // 1. Loading Splash
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-3" />
        <span className="text-xs font-semibold text-slate-500">Loading Skill Buildry...</span>
      </div>
    );
  }

  // 2. 3D Story Landing Page (shown before dashboard)
  if (showStoryLanding && !isOnboarding) {
    return (
      <>
        <LandingPage
          isLoggedIn={Boolean(user)}
          userName={user?.name || 'Bhagwatilal Joshi'}
          userEmail={user?.email || ''}
          onLogout={logout}
          onStartOnboarding={() => {
            if (!user) {
              setAuthDefaultMode('register');
              setAuthModalOpen(true);
            } else {
              setShowStoryLanding(false);
              setIsOnboarding(true);
            }
          }}
          onEnterWorkspace={() => {
            if (!user) {
              setAuthDefaultMode('login');
              setAuthModalOpen(true);
            } else {
              setShowStoryLanding(false);
            }
          }}
          onExploreDemo={async () => {
            if (!user) {
              await loginAsDemo();
            }
            setShowStoryLanding(false);
            setCurrentTab('overview');
          }}
          onOpenAuth={(mode = 'login') => {
            setAuthDefaultMode(mode);
            setAuthModalOpen(true);
          }}
        />
        <AuthModal
          isOpen={authModalOpen}
          defaultMode={authDefaultMode}
          onClose={() => setAuthModalOpen(false)}
          onSuccess={() => {
            setAuthModalOpen(false);
            setShowStoryLanding(false);
          }}
        />
      </>
    );
  }

  // 3. Onboarding Flow
  if (isOnboarding) {
    return (
      <OnboardingPage
        onComplete={handleOnboardingComplete}
        onCancel={() => {
          setIsOnboarding(false);
          if (profile) setCurrentTab('overview');
          else setShowStoryLanding(true);
        }}
      />
    );
  }

  // 4. Authenticated Application Shell
  return (
    <div className="min-h-screen w-full bg-[#F8F9FA] text-[#111215] flex flex-col lg:flex-row items-start p-4 sm:p-6 lg:p-7 gap-5 lg:gap-7 font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-5 py-3 text-xs font-bold text-[#111215] bg-white rounded-full shadow-2xl border border-slate-200/90 animate-fade-in">
          <span className="w-2.5 h-2.5 rounded-full bg-[#E2F86B] border border-[#111215]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Left Vertical Dark Dock */}
      <AppSidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        profile={profile}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        onNewSprint={() => setCurrentTab('roadmap')}
        onOpenStory={() => setShowStoryLanding(true)}
      />

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col min-w-0 w-full">
        <Topbar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          onOpenMobile={() => setMobileSidebarOpen(true)}
          profile={profile}
          onUpdateAnalysis={currentTab === 'gap-analysis' || currentTab === 'overview' ? handleRefreshAnalysis : undefined}
          onContinueLearning={currentTab === 'overview' ? () => setCurrentTab('roadmap') : undefined}
          isAnalyzing={isAnalyzing}
          onOpenStory={() => setShowStoryLanding(true)}
          currentTrackId={currentTrackId}
          onSwitchTrack={handleSwitchTrack}
        />

          <main className="flex-1 w-full pt-1">
          {dataLoading ? (
            <div className="py-24 text-center">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-3" />
              <p className="text-xs text-slate-500">Loading your career workspace...</p>
            </div>
          ) : (
            <>
              {currentTab === 'overview' && (
                <DashboardPage
                  user={user}
                  profile={profile}
                  skills={skills}
                  gapAnalysis={gapAnalysis}
                  roadmap={roadmap}
                  projects={projects}
                  events={progressEvents}
                  onNavigate={setCurrentTab}
                  onToggleTask={handleToggleTask}
                />
              )}

              {currentTab === 'skills' && (
                <SkillProfilePage
                  skills={skills}
                  profile={profile}
                  onAddSkill={handleAddSkill}
                  onDeleteSkill={handleDeleteSkill}
                  onNavigateToRoadmap={() => setCurrentTab('roadmap')}
                  onNavigateToEvidence={() => setCurrentTab('evidence')}
                />
              )}

              {currentTab === 'gap-analysis' && (
                <SkillGapPage
                  analysis={gapAnalysis}
                  profile={profile}
                  onRefreshAnalysis={handleRefreshAnalysis}
                  isAnalyzing={isAnalyzing}
                  onNavigateToRoadmap={() => setCurrentTab('roadmap')}
                />
              )}

              {currentTab === 'roadmap' && (
                <RoadmapPage
                  roadmap={roadmap}
                  profile={profile}
                  onToggleTask={handleToggleTask}
                  onRegenerateRoadmap={handleRegenerateRoadmap}
                  isRegenerating={isGeneratingRoadmap}
                />
              )}

              {currentTab === 'projects' && (
                <ProjectLabPage
                  projects={projects}
                  profile={profile}
                  onUpdateStatus={handleUpdateProjectStatus}
                  onNavigateToEvidence={() => setCurrentTab('evidence')}
                />
              )}

              {currentTab === 'interview' && (
                <InterviewPrepPage
                  questions={interviewQuestions}
                  attempts={interviewAttempts}
                  profile={profile}
                  onGenerateQuestions={handleGenerateInterviewQuestions}
                  onSubmitAnswer={handleSubmitInterviewAnswer}
                  isGenerating={isGeneratingQuestions}
                />
              )}

              {currentTab === 'evidence' && (
                <EvidencePage
                  evidence={evidence}
                  skills={skills}
                  profile={profile}
                  onAddEvidence={handleAddEvidence}
                  onDeleteEvidence={handleDeleteEvidence}
                />
              )}

              {currentTab === 'settings' && (
                <SettingsPage
                  user={user}
                  profile={profile}
                  onUpdateProfile={handleUpdateProfile}
                  onResetComplete={loadAppData}
                  currentTrackId={currentTrackId}
                  onSwitchTrack={handleSwitchTrack}
                />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

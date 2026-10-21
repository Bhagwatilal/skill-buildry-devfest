import React, { useState } from 'react';
import {
  Settings,
  User,
  ShieldCheck,
  Sparkles,
  RotateCcw,
  LogOut,
  Save,
  CheckCircle2,
  AlertTriangle,
  X,
  Database,
  Cpu,
  Download,
  Layers,
  Check,
} from 'lucide-react';
import type { Profile, User as UserType } from '../types/index.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../services/api.ts';
import { TECHNOLOGY_TRACKS } from '../data/technologyTracks.ts';

interface SettingsPageProps {
  user: UserType | null;
  profile: Profile | null;
  onUpdateProfile: (data: Partial<Profile>) => Promise<void>;
  onResetComplete: () => Promise<void>;
  currentTrackId?: string;
  onSwitchTrack?: (trackId: string) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  user,
  profile,
  onUpdateProfile,
  onResetComplete,
  currentTrackId = 'flutter',
  onSwitchTrack,
}) => {
  const { logout } = useAuth();

  const [targetRole, setTargetRole] = useState(profile?.targetRole || 'Flutter Developer');
  const [targetLevel, setTargetLevel] = useState(profile?.targetLevel || 'Mid-Level');
  const [currentTitle, setCurrentTitle] = useState(profile?.currentTitle || 'Junior Developer');
  const [yearsExperience, setYearsExperience] = useState(profile?.yearsExperience || 1.5);
  const [studyHoursPerDay, setStudyHoursPerDay] = useState(profile?.studyHoursPerDay || 2);
  const [studyDaysPerWeek, setStudyDaysPerWeek] = useState(profile?.studyDaysPerWeek || 5);
  const [targetTimelineWeeks, setTargetTimelineWeeks] = useState(profile?.targetTimelineWeeks || 10);

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetting, setResetting] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);
    try {
      await onUpdateProfile({
        targetRole,
        targetLevel,
        currentTitle,
        yearsExperience,
        studyHoursPerDay,
        studyDaysPerWeek,
        targetTimelineWeeks,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleResetDemo = async () => {
    setResetting(true);
    try {
      await api.settings.resetDemo();
      setShowResetModal(false);
      await onResetComplete();
    } finally {
      setResetting(false);
    }
  };

  const handleExportData = () => {
    const exportObject = {
      user,
      profile,
      activeTrackId: currentTrackId,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(exportObject, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `skill-buildry-export-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* 1. Technology Track Switcher Grid */}
      <div className="p-6 sm:p-8 bento-card-white space-y-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              Technology Tracks
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold border border-indigo-200/60">
              {Object.keys(TECHNOLOGY_TRACKS).length} Pre-configured Stacks
            </span>
          </div>
          <h2 className="text-xl font-black text-[#111215] mt-1">
            Choose Your Target Tech Stack
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Switching tracks updates your categorized skills, AI gap analysis, roadmap tasks, project challenges, and interview questions.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 pt-1">
          {Object.values(TECHNOLOGY_TRACKS).map((track) => {
            const isSelected = track.id === currentTrackId;
            return (
              <div
                key={track.id}
                onClick={() => onSwitchTrack && onSwitchTrack(track.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                  isSelected
                    ? 'bg-[#121417] text-white shadow-md border-[#121417]'
                    : 'bg-white hover:border-slate-300 hover:bg-slate-50/80 border-slate-200/90 text-[#111215]'
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isSelected
                          ? 'bg-[#E2F86B] text-[#121417]'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {track.badge}
                    </span>
                    {isSelected && (
                      <span className="w-5 h-5 rounded-full bg-[#E2F86B] text-[#121417] flex items-center justify-center">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <h4 className="font-extrabold text-sm leading-snug">
                    {track.name}
                  </h4>
                  <p
                    className={`text-[11px] line-clamp-2 ${
                      isSelected ? 'text-slate-300' : 'text-slate-500'
                    }`}
                  >
                    {track.tagline}
                  </p>
                </div>

                <div
                  className={`text-[10px] font-bold uppercase tracking-wider pt-2 border-t ${
                    isSelected ? 'border-slate-800 text-[#E2F86B]' : 'border-slate-100 text-indigo-600'
                  }`}
                >
                  {isSelected ? '● Active Track' : 'Select Track →'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Profile Preferences Form */}
      <div className="p-6 sm:p-8 bento-card-white space-y-6">
        <div>
          <h2 className="text-xl font-black text-[#111215] flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#E2F86B] flex items-center justify-center text-[#111215]">
              <User className="w-4 h-4" />
            </div>
            <span>Career Profile Preferences</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1.5 ml-10">
            Fine-tune your customized target role, seniority level, and study availability.
          </p>
        </div>

        {savedSuccess && (
          <div className="p-3.5 text-xs text-emerald-900 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Preferences saved successfully to database!</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Target Role
              </label>
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs glass-input rounded-xl text-slate-900 font-semibold"
                placeholder="e.g. Flutter Developer, AI Engineer"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Target Seniority Level
              </label>
              <select
                value={targetLevel}
                onChange={(e: any) => setTargetLevel(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs glass-input rounded-xl text-slate-900 font-semibold cursor-pointer"
              >
                <option value="Entry-Level">Entry-Level</option>
                <option value="Junior">Junior</option>
                <option value="Mid-Level">Mid-Level</option>
                <option value="Senior">Senior</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Current Title / Experience
              </label>
              <input
                type="text"
                value={currentTitle}
                onChange={(e) => setCurrentTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs glass-input rounded-xl text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Years of Experience
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="25"
                value={yearsExperience}
                onChange={(e) => setYearsExperience(parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 text-xs glass-input rounded-xl text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Study Hours / Day
              </label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                max="12"
                value={studyHoursPerDay}
                onChange={(e) => setStudyHoursPerDay(parseFloat(e.target.value) || 1)}
                className="w-full px-3.5 py-2.5 text-xs glass-input rounded-xl text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Study Days / Week
              </label>
              <input
                type="number"
                min="1"
                max="7"
                value={studyDaysPerWeek}
                onChange={(e) => setStudyDaysPerWeek(parseInt(e.target.value, 10) || 1)}
                className="w-full px-3.5 py-2.5 text-xs glass-input rounded-xl text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Target Timeline (Weeks)
              </label>
              <input
                type="number"
                min="2"
                max="52"
                value={targetTimelineWeeks}
                onChange={(e) => setTargetTimelineWeeks(parseInt(e.target.value, 10) || 4)}
                className="w-full px-3.5 py-2.5 text-xs glass-input rounded-xl text-slate-900"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#121417] text-white hover:bg-[#20242B] text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5 text-[#E2F86B]" />
              <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* 3. Data Management & Actions */}
      <div className="p-6 sm:p-8 bento-card-white space-y-4">
        <h3 className="text-base font-black text-[#111215] flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
            <Database className="w-4 h-4" />
          </div>
          <span>Workspace & Session Actions</span>
        </h3>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <div>
            <div className="text-xs font-bold text-[#111215]">Export Workspace Portfolio</div>
            <p className="text-[11px] text-slate-500">
              Download your profile, skills, and roadmap as a portable JSON file.
            </p>
          </div>

          <button
            onClick={handleExportData}
            className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-slate-800 bg-white border border-slate-200/90 hover:bg-slate-50 rounded-full transition-colors cursor-pointer shrink-0 shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
          <div>
            <div className="text-xs font-bold text-[#111215]">Reset Demo Showcase Data</div>
            <p className="text-[11px] text-slate-500">
              Restores the default showcase profile for contest judges and live demonstrations.
            </p>
          </div>

          <button
            onClick={() => setShowResetModal(true)}
            className="px-5 py-2 text-xs font-bold text-rose-700 hover:text-rose-900 bg-rose-50 hover:bg-rose-100/80 border border-rose-200 rounded-full transition-colors cursor-pointer shrink-0"
          >
            Reset Demo Data
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
          <div>
            <div className="text-xs font-bold text-[#111215]">Sign Out of Account</div>
            <p className="text-[11px] text-slate-500">Ends your current session token on this browser.</p>
          </div>

          <button
            onClick={() => logout()}
            className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-slate-700 hover:text-black bg-slate-100 hover:bg-slate-200 rounded-full transition-colors cursor-pointer shrink-0"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="relative w-full max-w-md p-7 bento-card-white shadow-2xl">
            <button
              onClick={() => setShowResetModal(false)}
              className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-black text-slate-900 mb-2">Reset Demo Data?</h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-5">
              This will reseed the active track to its default showcase profile,
              re-populating the roadmap tasks, project challenges, and initial evidence records.
            </p>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-900 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={resetting}
                onClick={handleResetDemo}
                className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-full disabled:opacity-50 cursor-pointer shadow-xs"
              >
                {resetting ? 'Resetting...' : 'Confirm Reset'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

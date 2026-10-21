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
} from 'lucide-react';
import type { Profile, User as UserType } from '../types/index.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../services/api.ts';

interface SettingsPageProps {
  user: UserType | null;
  profile: Profile | null;
  onUpdateProfile: (data: Partial<Profile>) => Promise<void>;
  onResetComplete: () => Promise<void>;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  user,
  profile,
  onUpdateProfile,
  onResetComplete,
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

  return (
    <div className="max-w-4xl space-y-6">
      {/* Profile Form */}
      <div className="p-6 sm:p-8 bento-card-white space-y-6">
        <div>
          <h2 className="text-xl font-black text-[#111215] flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#E2F86B] flex items-center justify-center text-[#111215]">
              <User className="w-4 h-4" />
            </div>
            <span>Career Profile Preferences</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1.5 ml-10">
            Update your target role, seniority level, and study availability.
          </p>
        </div>

        {savedSuccess && (
          <div className="p-3.5 text-xs text-emerald-900 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Preferences saved successfully to local database!</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">Target Job Role</label>
              <input
                type="text"
                required
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50/80 border border-slate-200 focus:border-[#111215] focus:bg-white rounded-2xl text-slate-900 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5">Target Seniority Level</label>
              <select
                value={targetLevel}
                onChange={(e) => setTargetLevel(e.target.value as any)}
                className="w-full px-4 py-2.5 bg-slate-50/80 border border-slate-200 focus:border-[#111215] focus:bg-white rounded-2xl text-slate-900 outline-none transition-all shadow-xs"
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
              <label className="block font-bold text-slate-700 mb-1.5">Current Title</label>
              <input
                type="text"
                value={currentTitle}
                onChange={(e) => setCurrentTitle(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50/80 border border-slate-200 focus:border-[#111215] focus:bg-white rounded-2xl text-slate-900 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5">Years of Relevant Experience</label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="20"
                value={yearsExperience}
                onChange={(e) => setYearsExperience(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-2.5 bg-slate-50/80 border border-slate-200 focus:border-[#111215] focus:bg-white rounded-2xl text-slate-900 outline-none transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-slate-100">
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">Study Hours / Day</label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                max="8"
                value={studyHoursPerDay}
                onChange={(e) => setStudyHoursPerDay(parseFloat(e.target.value) || 1)}
                className="w-full px-4 py-2.5 bg-slate-50/80 border border-slate-200 focus:border-[#111215] focus:bg-white rounded-2xl text-slate-900 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5">Study Days / Week</label>
              <input
                type="number"
                min="1"
                max="7"
                value={studyDaysPerWeek}
                onChange={(e) => setStudyDaysPerWeek(parseInt(e.target.value, 10) || 1)}
                className="w-full px-4 py-2.5 bg-slate-50/80 border border-slate-200 focus:border-[#111215] focus:bg-white rounded-2xl text-slate-900 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5">Target Timeline (Weeks)</label>
              <input
                type="number"
                min="2"
                max="52"
                value={targetTimelineWeeks}
                onChange={(e) => setTargetTimelineWeeks(parseInt(e.target.value, 10) || 10)}
                className="w-full px-4 py-2.5 bg-slate-50/80 border border-slate-200 focus:border-[#111215] focus:bg-white rounded-2xl text-slate-900 outline-none transition-all"
              />
            </div>
          </div>

          <div className="pt-3 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-[#121417] hover:bg-[#20242B] rounded-full transition-all cursor-pointer shadow-sm active:scale-95"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Saving...' : 'Save Preferences'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* AI & Persistence Architecture Info */}
      <div className="p-6 sm:p-8 bento-card-white space-y-4">
        <h3 className="text-base font-black text-[#111215] flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-[#111215]">
            <Cpu className="w-4 h-4" />
          </div>
          <span>Full-Stack & Workspace Architecture</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-5 rounded-2xl bg-[#F8F9FA] border border-slate-200/80 space-y-1.5">
            <div className="font-bold text-[#111215] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#E2F86B] border border-black/40" />
              <span>Gemini 3.8 Intelligence</span>
            </div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              API credentials are kept strictly on the backend via Express proxy routes. Structured responses are
              validated before storage.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#F8F9FA] border border-slate-200/80 space-y-1.5">
            <div className="font-bold text-[#111215] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Persistent SQLite Database</span>
            </div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              All roadmap tasks, evidence records, interview scores, and sessions are written to disk in
              Node native SQLite database.
            </p>
          </div>
        </div>
      </div>

      {/* Data Management & Session Controls */}
      <div className="p-6 sm:p-8 bento-card-white space-y-4">
        <h3 className="text-base font-black text-[#111215] flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <span>Workspace Actions</span>
        </h3>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <div>
            <div className="text-xs font-bold text-[#111215]">Reset Demo Showcase Data</div>
            <p className="text-[11px] text-slate-500">
              Restores the curated Bhagwatilal Joshi Flutter Developer profile for live demonstrations.
            </p>
          </div>

          <button
            onClick={() => setShowResetModal(true)}
            className="px-5 py-2.5 text-xs font-bold text-rose-700 hover:text-rose-900 bg-rose-50 hover:bg-rose-100/80 border border-rose-200 rounded-full transition-colors cursor-pointer shrink-0"
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
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-slate-700 hover:text-black bg-slate-100 hover:bg-slate-200 rounded-full transition-colors cursor-pointer shrink-0"
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
              This will reseed the database to the default Bhagwatilal Joshi Flutter Developer profile,
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

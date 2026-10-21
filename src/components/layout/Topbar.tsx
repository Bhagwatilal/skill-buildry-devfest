import React from 'react';
import { Menu, Settings, Plus, Sparkles, RefreshCw, Cpu, Layers } from 'lucide-react';
import type { NavTab } from './AppSidebar.tsx';
import type { Profile } from '../../types/index.ts';
import { TrackSelector } from '../common/TrackSelector.tsx';

interface TopbarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenMobile: () => void;
  profile: Profile | null;
  onUpdateAnalysis?: () => void;
  onContinueLearning?: () => void;
  isAnalyzing?: boolean;
  onOpenStory?: () => void;
  currentTrackId?: string;
  onSwitchTrack?: (trackId: string) => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  currentTab,
  onSelectTab,
  onOpenMobile,
  profile,
  onUpdateAnalysis,
  onContinueLearning,
  isAnalyzing,
  onOpenStory,
  currentTrackId = 'flutter',
  onSwitchTrack,
}) => {
  const tabs: Array<{ id: NavTab; label: string }> = [
    { id: 'overview', label: 'Overview' },
    { id: 'skills', label: 'Skill Profile' },
    { id: 'gap-analysis', label: 'Gap Analysis' },
    { id: 'roadmap', label: 'Roadmap' },
    { id: 'projects', label: 'Project Lab' },
    { id: 'interview', label: 'Interview Prep' },
    { id: 'evidence', label: 'Evidence Vault' },
    { id: 'settings', label: 'Settings' },
  ];

  return (
    <div className="space-y-4 pb-2">
      {/* Top Header Row with Template Editorial Heading & Action Buttons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Mobile menu button + Editorial Headline */}
        <div className="flex items-start gap-3">
          <button
            onClick={onOpenMobile}
            className="p-2 -ml-2 text-slate-700 rounded-lg hover:bg-slate-200/60 lg:hidden cursor-pointer mt-1"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[#111215] leading-[1.2]">
              Managing{' '}
              <span className="inline-flex items-center justify-center align-middle w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white border border-slate-200/80 shadow-xs mx-1 text-slate-700">
                <Cpu className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-700" />
              </span>{' '}
              Your Career <br className="hidden sm:block" />
              and{' '}
              <span className="inline-flex items-center justify-center align-middle px-3 py-0.5 rounded-full bg-[#E2F86B] border border-[#D5EE5B] text-[#1A2200] font-bold text-xs sm:text-sm mx-1 shadow-xs">
                <Sparkles className="w-3.5 h-3.5 mr-1 text-[#1A2200]" />
                Skills
              </span>{' '}
              Roadmap
            </h1>
          </div>
        </div>

        {/* Right Action Controls from Template */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-start md:self-center">
          {/* Tech Track Selector Dropdown */}
          {onSwitchTrack && (
            <TrackSelector
              currentTrackId={currentTrackId}
              onSelectTrack={onSwitchTrack}
            />
          )}

          {/* 3D Story & Vision Button */}
          {onOpenStory && (
            <button
              onClick={onOpenStory}
              title="View 3D Story Landing Experience"
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-[#111215] bg-[#E2F86B] hover:bg-[#D7F255] border border-[#CCE855] rounded-full shadow-xs transition-all cursor-pointer active:scale-95"
            >
              <span>✦</span>
              <span className="hidden sm:inline">3D Story</span>
            </button>
          )}

          {/* Settings Circle Button */}
          <button
            onClick={() => onSelectTab('settings')}
            title="Workspace Settings"
            className="w-10 h-10 rounded-full bg-white border border-slate-200/90 text-slate-700 hover:text-slate-900 hover:bg-slate-50 flex items-center justify-center transition-all shadow-xs cursor-pointer active:scale-95"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Signature Black Capsule Button */}
          <button
            onClick={() => onSelectTab('roadmap')}
            className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-semibold text-white bg-[#121417] hover:bg-[#22262C] rounded-full shadow-xs transition-all cursor-pointer active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create a New Sprint</span>
          </button>
        </div>
      </div>

      {/* Horizontal Subnavigation Pill Row (from Template) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`subnav-chip cursor-pointer ${
                isActive ? 'subnav-chip-active' : 'subnav-chip-inactive'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

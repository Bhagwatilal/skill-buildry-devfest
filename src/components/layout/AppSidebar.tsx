import React from 'react';
import {
  LayoutDashboard,
  UserCheck,
  GitCompare,
  Map,
  FlaskConical,
  MessageSquareCode,
  FileCheck2,
  Settings,
  Plus,
  HelpCircle,
  BookOpen,
  Rocket,
  Globe,
  Share2,
  MoreHorizontal,
  X,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import type { Profile } from '../../types/index.ts';

export type NavTab =
  | 'overview'
  | 'skills'
  | 'gap-analysis'
  | 'roadmap'
  | 'projects'
  | 'interview'
  | 'evidence'
  | 'settings';

interface AppSidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  profile: Profile | null;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  onNewSprint?: () => void;
  onOpenStory?: () => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  currentTab,
  onSelectTab,
  profile,
  mobileOpen,
  onCloseMobile,
  onNewSprint,
  onOpenStory,
}) => {
  const { user, logout } = useAuth();

  const mainNavItems = [
    { id: 'overview' as NavTab, label: 'Overview', icon: LayoutDashboard },
    { id: 'skills' as NavTab, label: 'Skills Profile', icon: UserCheck },
    { id: 'gap-analysis' as NavTab, label: 'Gap Analysis', icon: GitCompare },
    { id: 'roadmap' as NavTab, label: 'Roadmap', icon: Map },
    { id: 'projects' as NavTab, label: 'Project Lab', icon: FlaskConical },
    { id: 'interview' as NavTab, label: 'Interview Prep', icon: MessageSquareCode },
    { id: 'evidence' as NavTab, label: 'Evidence Vault', icon: FileCheck2 },
  ];

  const handleTabClick = (id: NavTab) => {
    onSelectTab(id);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Template Vertical Dark Dock Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col items-center w-20 sidebar-dock py-3.5 px-2.5 transition-all duration-300 ease-in-out shrink-0 overflow-y-auto lg:overflow-visible ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:static lg:translate-x-0 lg:sticky lg:top-6 lg:self-start lg:h-fit`}
      >
        {/* Top: Plus Action Button & Navigation Group */}
        <div className="flex flex-col items-center gap-2.5 w-full">
          {/* Plus Action Button */}
          <button
            onClick={() => {
              if (onNewSprint) onNewSprint();
              else onSelectTab('roadmap');
            }}
            title="Create a New Sprint"
            className="w-10 h-10 rounded-xl bg-[#20242B] hover:bg-[#2A303A] border border-white/10 flex items-center justify-center text-white transition-all cursor-pointer shadow-xs active:scale-95 group relative"
          >
            <div className="w-4.5 h-4.5 rounded-lg border border-white/40 flex items-center justify-center group-hover:border-white transition-colors">
              <Plus className="w-3.5 h-3.5" />
            </div>
            <div className="absolute left-full ml-3 px-2.5 py-1 rounded-lg bg-[#121417] text-white text-[11px] font-semibold border border-white/10 shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
              New Sprint
            </div>
          </button>

          {/* Close for mobile */}
          <button
            onClick={onCloseMobile}
            className="p-1 rounded-lg text-slate-400 hover:text-white lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Vertical Navigation Icons Grouped Right Under Plus */}
          <nav className="flex flex-col items-center gap-1 w-full">
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  title={item.label}
                  className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer group ${
                    isActive
                      ? 'bg-[#23272F] text-white shadow-sm border border-white/10'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className={`w-4.5 h-4.5 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : ''}`} />
                  {/* Template Acid Lime Active Indicator */}
                  {isActive && (
                    <span className="absolute -left-2.5 top-1/2 -translate-y-1/2 w-1.5 h-4 rounded-r-full bg-[#E2F86B] shadow-[0_0_8px_rgba(226,248,107,0.7)]" />
                  )}
                  {/* Sleek Tooltip */}
                  <div className="absolute left-full ml-3 px-2.5 py-1 rounded-lg bg-[#121417] text-white text-[11px] font-semibold border border-white/10 shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
                    {item.label}
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Lower Group & User Avatar from Template */}
        <div className="flex flex-col items-center gap-1.5 pt-2.5 mt-2.5 border-t border-white/10 w-full">
          {/* 3D Story Button */}
          {onOpenStory && (
            <button
              onClick={onOpenStory}
              title="3D Story & Vision"
              className="relative w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer group text-[#E2F86B] hover:bg-white/10"
            >
              <span className="text-sm group-hover:scale-125 transition-transform">✦</span>
              <div className="absolute left-full ml-3 px-2.5 py-1 rounded-lg bg-[#121417] text-white text-[11px] font-semibold border border-white/10 shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
                3D Story & Vision
              </div>
            </button>
          )}

          {/* Settings Tab Button */}
          <button
            onClick={() => handleTabClick('settings')}
            title="Settings"
            className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer group ${
              currentTab === 'settings'
                ? 'bg-[#23272F] text-white border border-white/10'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Settings className="w-4.5 h-4.5 transition-transform group-hover:scale-110" />
            {currentTab === 'settings' && (
              <span className="absolute -left-2.5 top-1/2 -translate-y-1/2 w-1.5 h-4 rounded-r-full bg-[#E2F86B] shadow-[0_0_8px_rgba(226,248,107,0.7)]" />
            )}
            <div className="absolute left-full ml-3 px-2.5 py-1 rounded-lg bg-[#121417] text-white text-[11px] font-semibold border border-white/10 shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
              Settings
            </div>
          </button>

          {/* User Avatar */}
          <div className="relative pt-1 group">
            <button
              onClick={() => logout()}
              title={`Sign out (${user?.name || 'User'})`}
              className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/20 hover:border-[#E2F86B] transition-colors cursor-pointer bg-slate-800 flex items-center justify-center shrink-0"
            >
              <img
                src={user?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.name || 'User'}`}
                alt={user?.name || 'User avatar'}
                className="w-full h-full object-cover"
              />
            </button>
            <div className="absolute left-full ml-3 top-2 px-2.5 py-1 rounded-lg bg-[#121417] text-white text-[11px] font-semibold border border-white/10 shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
              Sign out ({user?.name || 'User'})
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

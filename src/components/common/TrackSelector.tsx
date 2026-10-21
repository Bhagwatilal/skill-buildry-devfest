import React, { useState, useRef, useEffect } from 'react';
import { TECHNOLOGY_TRACKS, type TechnologyTrack } from '../../data/technologyTracks.ts';
import { ChevronDown, Check, Sparkles, Layers } from 'lucide-react';

interface TrackSelectorProps {
  currentTrackId: string;
  onSelectTrack: (trackId: string) => void;
  className?: string;
}

export const TrackSelector: React.FC<TrackSelectorProps> = ({
  currentTrackId,
  onSelectTrack,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeTrack = TECHNOLOGY_TRACKS[currentTrackId] || TECHNOLOGY_TRACKS.flutter;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200/90 shadow-xs hover:border-slate-300 hover:bg-slate-50 transition-all text-xs font-semibold text-[#111215] cursor-pointer"
        title="Switch Career Track & Technology Stack"
      >
        <span className="w-2 h-2 rounded-full bg-[#E2F86B] border border-[#111215]" />
        <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">Track:</span>
        <span className="font-bold truncate max-w-[130px] sm:max-w-[180px]">
          {activeTrack.badge} {activeTrack.name.split(' ')[0]}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-slate-200/90 p-2.5 z-50 animate-fade-in space-y-1">
          <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Select Tech Track & Curriculum</span>
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              {Object.keys(TECHNOLOGY_TRACKS).length} Tracks
            </span>
          </div>

          <div className="max-h-80 overflow-y-auto space-y-1 py-1 no-scrollbar">
            {Object.values(TECHNOLOGY_TRACKS).map((track) => {
              const isSelected = track.id === currentTrackId;
              return (
                <div
                  key={track.id}
                  onClick={() => {
                    onSelectTrack(track.id);
                    setIsOpen(false);
                  }}
                  className={`p-3 rounded-2xl transition-all cursor-pointer flex items-start justify-between gap-3 ${
                    isSelected
                      ? 'bg-[#121417] text-white shadow-xs'
                      : 'hover:bg-slate-50 text-[#111215]'
                  }`}
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold truncate">
                        {track.name}
                      </span>
                      <span
                        className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${
                          isSelected
                            ? 'bg-[#E2F86B] text-[#121417]'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {track.badge}
                      </span>
                    </div>
                    <p
                      className={`text-[11px] line-clamp-1 ${
                        isSelected ? 'text-slate-300' : 'text-slate-500'
                      }`}
                    >
                      {track.tagline}
                    </p>
                  </div>

                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-[#E2F86B] text-[#121417] flex items-center justify-center shrink-0 mt-1">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-100 px-3 py-1.5 text-[10px] text-slate-400">
            Switching tracks updates skills, gap analysis, roadmaps, project labs & interview questions.
          </div>
        </div>
      )}
    </div>
  );
};

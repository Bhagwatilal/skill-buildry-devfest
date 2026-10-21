import React, { useState } from 'react';
import type { CompetencyMetric } from '../../data/technologyTracks.ts';
import { Sparkles, Info } from 'lucide-react';

interface SkillRadarChartProps {
  metrics: CompetencyMetric[];
  title?: string;
  subtitle?: string;
  showLegend?: boolean;
}

export const SkillRadarChart: React.FC<SkillRadarChartProps> = ({
  metrics,
  title = 'Competency Radar',
  subtitle = 'Current capability vs. production engineering benchmark',
  showLegend = true,
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // SVG Chart Geometry
  const size = 320;
  const center = size / 2;
  const radius = center - 52;
  const total = metrics.length;

  if (total < 3) return null;

  // Compute (x, y) coordinates for a given axis index and normalized value (0 - 100)
  const getCoordinates = (index: number, value: number) => {
    // Angle in radians, starting from the top (-PI / 2)
    const angle = (Math.PI * 2 / total) * index - Math.PI / 2;
    const r = (value / 100) * radius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y, angle };
  };

  // Concentric polygon web levels (20%, 40%, 60%, 80%, 100%)
  const webLevels = [20, 40, 60, 80, 100];

  const getPolygonPoints = (values: number[]) => {
    return values
      .map((val, idx) => {
        const { x, y } = getCoordinates(idx, val);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  };

  const targetPoints = getPolygonPoints(metrics.map((m) => m.expected));
  const currentPoints = getPolygonPoints(metrics.map((m) => m.current));

  return (
    <div className="bento-card-white p-5 sm:p-6 flex flex-col justify-between relative overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>{title}</span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
        </div>

        {showLegend && (
          <div className="flex items-center gap-3 text-[11px] font-semibold">
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E2F86B] border border-[#121417]" />
              <span className="text-[#121417]">Your Level</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full border border-dashed border-indigo-400 bg-indigo-50" />
              <span className="text-slate-500">Benchmark</span>
            </div>
          </div>
        )}
      </div>

      {/* Interactive SVG Radar Web */}
      <div className="relative flex items-center justify-center py-2">
        <svg
          viewBox={`0 0 ${size} ${size}`}
          className="w-full max-w-[340px] aspect-square overflow-visible"
        >
          {/* Background Concentric Spider Webs */}
          {webLevels.map((lvl) => (
            <polygon
              key={lvl}
              points={getPolygonPoints(Array(total).fill(lvl))}
              fill={lvl === 100 ? '#F8FAFC' : 'none'}
              stroke="#E2E8F0"
              strokeWidth={lvl === 100 ? '1.5' : '1'}
              strokeDasharray={lvl === 100 ? 'none' : '3,3'}
            />
          ))}

          {/* Radial Axis Lines */}
          {metrics.map((_, idx) => {
            const { x, y } = getCoordinates(idx, 100);
            return (
              <line
                key={idx}
                x1={center}
                y1={center}
                x2={x}
                y2={y}
                stroke="#E2E8F0"
                strokeWidth="1"
              />
            );
          })}

          {/* Target Benchmark Polygon (Translucent Indigo Dotted Outline) */}
          <polygon
            points={targetPoints}
            fill="rgba(99, 102, 241, 0.08)"
            stroke="#818CF8"
            strokeWidth="1.5"
            strokeDasharray="4,4"
          />

          {/* Current Level Polygon (Signature Acid-Lime / Dark Outline) */}
          <polygon
            points={currentPoints}
            fill="rgba(226, 248, 107, 0.35)"
            stroke="#121417"
            strokeWidth="2.5"
            className="filter drop-shadow-sm transition-all duration-300"
          />

          {/* Vertex Points & Interactive Hit Targets */}
          {metrics.map((metric, idx) => {
            const { x: curX, y: curY } = getCoordinates(idx, metric.current);
            const { x: expX, y: expY } = getCoordinates(idx, metric.expected);
            const { x: labelX, y: labelY, angle } = getCoordinates(idx, 122);
            const isHovered = hoveredIdx === idx;

            // Align text properly based on angle
            let textAnchor: 'middle' | 'start' | 'end' = 'middle';
            if (Math.cos(angle) > 0.3) textAnchor = 'start';
            else if (Math.cos(angle) < -0.3) textAnchor = 'end';

            return (
              <g key={idx}>
                {/* Benchmark ghost node */}
                <circle
                  cx={expX}
                  cy={expY}
                  r="3.5"
                  fill="#818CF8"
                  className="opacity-70"
                />

                {/* Current Level Interactive Node */}
                <circle
                  cx={curX}
                  cy={curY}
                  r={isHovered ? '7' : '5'}
                  fill="#E2F86B"
                  stroke="#121417"
                  strokeWidth="2"
                  className="cursor-pointer transition-all duration-200"
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                />

                {/* Dimension Label Text */}
                <text
                  x={labelX}
                  y={labelY + 4}
                  textAnchor={textAnchor}
                  className={`text-[10px] font-bold select-none cursor-pointer transition-colors ${
                    isHovered ? 'fill-indigo-600 font-extrabold' : 'fill-slate-600'
                  }`}
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                >
                  {metric.dimension.length > 18
                    ? metric.dimension.slice(0, 16) + '…'
                    : metric.dimension}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover Floating Card */}
        {hoveredIdx !== null && (
          <div className="absolute top-2 right-2 bg-[#121417] text-white p-3 rounded-2xl shadow-xl text-xs space-y-1 z-30 max-w-[210px] border border-slate-700 animate-fade-in pointer-events-none">
            <div className="font-bold text-sm text-[#E2F86B]">
              {metrics[hoveredIdx].dimension}
            </div>
            <div className="flex items-center justify-between gap-4 pt-1 text-[11px]">
              <span className="text-slate-400">Current Level:</span>
              <span className="font-mono font-bold text-white">
                {metrics[hoveredIdx].current}%
              </span>
            </div>
            <div className="flex items-center justify-between gap-4 text-[11px]">
              <span className="text-slate-400">Benchmark Target:</span>
              <span className="font-mono font-bold text-indigo-300">
                {metrics[hoveredIdx].expected}%
              </span>
            </div>
            <div className="pt-1.5 border-t border-slate-800 text-[10px] text-slate-300 leading-tight">
              Focus: <span className="font-semibold text-white">{metrics[hoveredIdx].keySkill}</span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Summary Pill */}
      <div className="mt-2 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
        <span className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-slate-400" />
          <span>Average Competency:</span>
        </span>
        <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-full text-[11px]">
          {Math.round(
            metrics.reduce((acc, m) => acc + m.current, 0) / (metrics.length || 1)
          )}% Readiness
        </span>
      </div>
    </div>
  );
};

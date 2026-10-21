import React, { useState } from 'react';
import type { CompetencyMetric } from '../../data/technologyTracks.ts';
import { Sparkles, Info, CheckCircle2 } from 'lucide-react';

interface SkillRadarChartProps {
  metrics: CompetencyMetric[];
  title?: string;
  subtitle?: string;
  showLegend?: boolean;
}

function getShortLabel(metric: CompetencyMetric): string {
  if (metric.shortLabel) return metric.shortLabel;
  const d = metric.dimension;
  if (d.includes('Dart & Language') || d.includes('Dart Language')) return 'Dart Core';
  if (d.includes('UI & Render') || d.includes('Flutter Widgets')) return 'UI & Widgets';
  if (d.includes('State & Architecture') || d.includes('Riverpod')) return 'State Arch';
  if (d.includes('APIs & Local') || d.includes('REST API') || d.includes('Networking')) return 'APIs & Data';
  if (d.includes('Testing & QA') || d.includes('Unit & Widget') || d.includes('Automation')) return 'Testing & QA';
  if (d.includes('CI/CD') || d.includes('Fastlane') || d.includes('Release')) return 'CI/CD';
  if (d.includes('TypeScript') || d.includes('React Core')) return 'React Core';
  if (d.includes('SSR & App') || d.includes('Next.js')) return 'Next.js SSR';
  if (d.includes('Backend & REST') || d.includes('Node.js')) return 'Node Backend';
  if (d.includes('Database & ORM') || d.includes('PostgreSQL')) return 'PostgreSQL';
  if (d.includes('Python & LLM') || d.includes('Python')) return 'Python & LLM';
  if (d.includes('RAG & Vector') || d.includes('Embeddings')) return 'RAG & Search';
  if (d.includes('Agentic') || d.includes('Agent')) return 'Agent Loops';
  if (d.includes('Prompt Engineering') || d.includes('Prompt')) return 'Prompts & Eval';
  if (d.includes('Docker & Containers') || d.includes('Docker')) return 'Containers';
  if (d.includes('Kubernetes')) return 'Kubernetes';
  if (d.includes('Infrastructure as Code') || d.includes('Terraform')) return 'Terraform';
  if (d.includes('Monitoring') || d.includes('Prometheus')) return 'Monitoring';
  if (d.includes('Linux') || d.includes('Security')) return 'Security';
  if (d.includes('Go Language') || d.includes('Concurrency')) return 'Go & Channels';
  if (d.includes('Microservices') || d.includes('gRPC')) return 'gRPC & Proto';
  if (d.includes('Event Streaming') || d.includes('Kafka')) return 'Kafka Streams';

  // Fallback: take first 2 words
  const words = d.split(' ');
  return words.slice(0, 2).join(' ');
}

export const SkillRadarChart: React.FC<SkillRadarChartProps> = ({
  metrics,
  title = 'Competency Radar',
  subtitle = 'Current capability vs. production engineering benchmark',
  showLegend = true,
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // SVG Chart Geometry - carefully tuned for compact widgets and zero label overflow
  const width = 380;
  const height = 290;
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = 80;
  const total = metrics.length;

  if (total < 3) return null;

  // Compute (x, y) coordinates for a given axis index and value (0 - 100)
  const getCoordinates = (index: number, value: number) => {
    // Angle in radians, starting from the top (-PI / 2)
    const angle = (Math.PI * 2 / total) * index - Math.PI / 2;
    const r = (value / 100) * radius;
    const x = centerX + r * Math.cos(angle);
    const y = centerY + r * Math.sin(angle);
    return { x, y, angle };
  };

  // Concentric polygon web levels (20%, 40%, 60%, 80%, 100%)
  const webLevels = [25, 50, 75, 100];

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
    <div className="bento-card-white p-5 sm:p-6 flex flex-col justify-between relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-2">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <span className="truncate">{title}</span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5 truncate">{subtitle}</p>
        </div>

        {showLegend && (
          <div className="flex items-center gap-3 text-[11px] font-semibold shrink-0">
            <div className="flex items-center gap-1.5 whitespace-nowrap">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E2F86B] border border-[#121417] shrink-0" />
              <span className="text-[#121417]">Your Level</span>
            </div>
            <div className="flex items-center gap-1.5 whitespace-nowrap">
              <span className="w-2.5 h-2.5 rounded-full border border-dashed border-indigo-400 bg-indigo-50 shrink-0" />
              <span className="text-slate-500">Benchmark</span>
            </div>
          </div>
        )}
      </div>

      {/* Interactive SVG Radar Web */}
      <div className="relative flex items-center justify-center py-1">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full max-w-[380px] overflow-visible select-none"
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
                x1={centerX}
                y1={centerY}
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
            fill="rgba(226, 248, 107, 0.38)"
            stroke="#121417"
            strokeWidth="2.5"
            className="filter drop-shadow-sm transition-all duration-300"
          />

          {/* Vertex Points & Interactive Hit Targets */}
          {metrics.map((metric, idx) => {
            const { x: curX, y: curY } = getCoordinates(idx, metric.current);
            const { x: expX, y: expY } = getCoordinates(idx, metric.expected);
            const { x: edgeX, y: edgeY, angle } = getCoordinates(idx, 100);
            const isHovered = hoveredIdx === idx;
            const shortName = getShortLabel(metric);

            // Compute label coordinates with safe offset
            let labelX = edgeX;
            let labelY = edgeY;
            let textAnchor: 'middle' | 'start' | 'end' = 'middle';

            const cosA = Math.cos(angle);
            const sinA = Math.sin(angle);

            if (Math.abs(sinA) > 0.85) {
              // Top or Bottom
              labelY = sinA < 0 ? edgeY - 12 : edgeY + 16;
              textAnchor = 'middle';
            } else if (cosA > 0) {
              // Right side
              labelX = edgeX + 10;
              labelY = edgeY + 4;
              textAnchor = 'start';
            } else {
              // Left side
              labelX = edgeX - 10;
              labelY = edgeY + 4;
              textAnchor = 'end';
            }

            return (
              <g key={idx}>
                {/* Benchmark ghost node */}
                <circle
                  cx={expX}
                  cy={expY}
                  r="3"
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

                {/* Dimension Label Text - Guaranteed zero overflow */}
                <text
                  x={labelX}
                  y={labelY}
                  textAnchor={textAnchor}
                  className={`text-[11px] font-bold select-none cursor-pointer transition-colors ${
                    isHovered ? 'fill-indigo-600 font-black' : 'fill-slate-700'
                  }`}
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                >
                  {shortName}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover Floating Tooltip */}
        {hoveredIdx !== null && (
          <div className="absolute top-1 right-2 bg-[#121417] text-white p-3 rounded-2xl shadow-xl text-xs space-y-1 z-30 max-w-[210px] border border-slate-700 animate-fade-in pointer-events-none">
            <div className="font-bold text-xs text-[#E2F86B]">
              {metrics[hoveredIdx].dimension}
            </div>
            <div className="flex items-center justify-between gap-4 pt-1 text-[11px]">
              <span className="text-slate-400">Your Level:</span>
              <span className="font-mono font-bold text-white">
                {metrics[hoveredIdx].current}%
              </span>
            </div>
            <div className="flex items-center justify-between gap-4 text-[11px]">
              <span className="text-slate-400">Benchmark:</span>
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
          <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
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

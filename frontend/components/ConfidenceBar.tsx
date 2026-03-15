import React from 'react';

interface Props { score: number; animate?: boolean; }

export default function ConfidenceBar({ score, animate = true }: Props) {
  const color = score >= 80 ? '#22C55E' : score >= 60 ? '#F59E0B' : '#EF4444';
  const label = score >= 80 ? 'HIGH MATCH' : score >= 60 ? 'POSSIBLE' : 'LOW';

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-[10px] font-mono text-text-dim uppercase tracking-widest">
          Confidence
        </span>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider"
            style={{ color }}>{label}</span>
          <span className="text-sm font-bold font-mono" style={{ color }}>
            {score.toFixed(1)}%
          </span>
        </div>
      </div>
      <div className="h-2 bg-panel rounded-full overflow-hidden border border-border">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{
            width: animate ? `${score}%` : `${score}%`,
            backgroundColor: color,
            boxShadow: `0 0 8px ${color}60`,
          }}
        />
      </div>
    </div>
  );
}

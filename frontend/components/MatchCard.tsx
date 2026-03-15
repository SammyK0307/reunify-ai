import React from 'react';
import { MapPin, Calendar, Hash, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import ConfidenceBar from './ConfidenceBar';

interface Match {
  child_id: string;
  name: string;
  age: number;
  last_seen_location: string;
  case_status: string;
  confidence_score: number;
  case_number?: string;
  description?: string;
}

interface Props { match: Match; rank: number; delay?: number; }

const rankColors = ['#4F8EF7', '#22C55E', '#F59E0B'];
const rankLabels = ['#1 BEST MATCH', '#2 MATCH', '#3 MATCH'];

export default function MatchCard({ match, rank, delay = 0 }: Props) {
  const rankColor = rankColors[rank] || '#6B7280';

  return (
    <div
      className="bg-panel border border-border rounded-xl overflow-hidden fade-in-up"
      style={{ animationDelay: `${delay}ms`, borderColor: rank === 0 ? `${rankColor}40` : undefined }}
    >
      {/* Rank badge */}
      <div className="px-4 py-2.5 flex items-center justify-between border-b border-border"
        style={{ backgroundColor: `${rankColor}10` }}>
        <span className="text-[10px] font-mono font-bold uppercase tracking-widest"
          style={{ color: rankColor }}>{rankLabels[rank] || `#${rank+1}`}</span>
        {rank === 0 && (
          <div className="flex items-center gap-1.5">
            <AlertCircle size={12} style={{ color: rankColor }} />
            <span className="text-[10px] font-mono" style={{ color: rankColor }}>
              Priority Alert
            </span>
          </div>
        )}
      </div>

      <div className="p-4 space-y-4">
        {/* Identity */}
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-lg flex items-center justify-center text-lg font-bold"
            style={{ backgroundColor: `${rankColor}20`, color: rankColor, border: `1px solid ${rankColor}30` }}>
            {match.name[0]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-text text-base leading-tight">{match.name}</div>
            <div className="text-sm text-text-dim mt-0.5">Age {match.age} years</div>
            <div className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase"
              style={{
                backgroundColor: match.case_status === 'active' ? '#EF444420' : '#22C55E20',
                color: match.case_status === 'active' ? '#EF4444' : '#22C55E',
                border: `1px solid ${match.case_status === 'active' ? '#EF444440' : '#22C55E40'}`
              }}>
              {match.case_status === 'active' ? '● MISSING' : '✓ ' + match.case_status.toUpperCase()}
            </div>
          </div>
        </div>

        {/* Confidence */}
        <ConfidenceBar score={match.confidence_score} />

        {/* Details */}
        <div className="space-y-2 text-xs">
          <div className="flex items-start gap-2 text-text-dim">
            <MapPin size={12} className="mt-0.5 shrink-0 text-accent" />
            <span>{match.last_seen_location}</span>
          </div>
          {match.case_number && (
            <div className="flex items-center gap-2 text-text-dim">
              <Hash size={12} className="shrink-0 text-accent" />
              <span className="font-mono">{match.case_number}</span>
            </div>
          )}
          {match.description && (
            <div className="flex items-start gap-2 text-text-dim">
              <FileText size={12} className="mt-0.5 shrink-0 text-accent" />
              <span>{match.description}</span>
            </div>
          )}
        </div>

        {/* Action */}
        <button className="w-full py-2 rounded-lg text-xs font-semibold transition-all"
          style={{
            backgroundColor: `${rankColor}15`,
            color: rankColor,
            border: `1px solid ${rankColor}30`,
          }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = `${rankColor}25`)}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = `${rankColor}15`)}
        >
          View Full Case File →
        </button>
      </div>
    </div>
  );
}

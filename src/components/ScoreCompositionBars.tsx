import React from 'react';
import { PlayerResult } from '../types';

interface ScoreCompositionBarsProps {
  results: PlayerResult[];
  turmoilEnabled: boolean;
}

export const ScoreCompositionBars: React.FC<ScoreCompositionBarsProps> = ({
  results,
  turmoilEnabled
}) => {
  const maxVP = Math.max(...results.map(r => r.totalVP), 1);

  return (
    <div className="mt-4 pt-4 border-t border-[#2b354d]">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <span className="text-xs uppercase tracking-wider font-bold text-[#8c9bb3]">
          Point Composition Breakdown
        </span>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-[11px] font-semibold">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-[#2980b9]" />
            <span>TR</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-[#d4ac0d]" />
            <span>Milestones</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-[#d35400]" />
            <span>Awards</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-[#27ae60]" />
            <span>Greeneries</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-[#7f8c8d]" />
            <span>Cities</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-[#8e44ad]" />
            <span>Cards</span>
          </div>
          {turmoilEnabled && (
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#c0392b]" />
              <span>Turmoil</span>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {results.map((r) => {
          const trPct = (r.tr / maxVP) * 100;
          const milePct = (r.milestonesVP / maxVP) * 100;
          const awardPct = (r.awardsVP / maxVP) * 100;
          const greenPct = (r.greeneryVP / maxVP) * 100;
          const cityPct = (r.citiesVP / maxVP) * 100;
          const cardPct = (Math.max(0, r.cardsVP) / maxVP) * 100;
          const turmoilPct = turmoilEnabled ? (r.turmoilVP / maxVP) * 100 : 0;

          return (
            <div key={r.id} className="flex items-center gap-3">
              <div
                className="w-32 sm:w-36 text-xs font-semibold text-white truncate flex items-center gap-1.5 flex-shrink-0"
                title={`${r.name} (${r.totalVP} VP)`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-xs flex-shrink-0"
                  style={{ backgroundColor: r.color }}
                />
                <span className="truncate">{r.name}</span>
                <span className="text-[#8c9bb3] text-[10px]">({r.totalVP})</span>
              </div>

              <div className="flex-1 h-5 bg-[#101420] rounded border border-[#232c3f] overflow-hidden flex">
                <div
                  className="h-full bg-[#2980b9] transition-all duration-300"
                  style={{ width: `${trPct}%` }}
                  title={`TR: ${r.tr} VP`}
                />
                <div
                  className="h-full bg-[#d4ac0d] transition-all duration-300"
                  style={{ width: `${milePct}%` }}
                  title={`Milestones: ${r.milestonesVP} VP`}
                />
                <div
                  className="h-full bg-[#d35400] transition-all duration-300"
                  style={{ width: `${awardPct}%` }}
                  title={`Awards: ${r.awardsVP} VP`}
                />
                <div
                  className="h-full bg-[#27ae60] transition-all duration-300"
                  style={{ width: `${greenPct}%` }}
                  title={`Greeneries: ${r.greeneryVP} VP`}
                />
                <div
                  className="h-full bg-[#7f8c8d] transition-all duration-300"
                  style={{ width: `${cityPct}%` }}
                  title={`Cities: ${r.citiesVP} VP`}
                />
                <div
                  className="h-full bg-[#8e44ad] transition-all duration-300"
                  style={{ width: `${cardPct}%` }}
                  title={`Cards: ${r.cardsVP} VP`}
                />
                {turmoilEnabled && (
                  <div
                    className="h-full bg-[#c0392b] transition-all duration-300"
                    style={{ width: `${turmoilPct}%` }}
                    title={`Turmoil: ${r.turmoilVP} VP`}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

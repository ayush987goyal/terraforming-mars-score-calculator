import React from 'react';
import { PlayerResult } from '../types';

interface LeaderboardProps {
  results: PlayerResult[];
  turmoilEnabled: boolean;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ results, turmoilEnabled }) => {
  return (
    <div className="overflow-x-auto rounded-lg border border-[#2b354d] shadow-md mb-6">
      <table className="w-full border-collapse text-left text-sm">
        <thead>
          <tr className="bg-[#1b2132] text-[#8c9bb3] uppercase text-[11px] font-bold tracking-wider border-b border-[#2b354d]">
            <th className="py-3 px-3 text-center w-12">Rank</th>
            <th className="py-3 px-3">Player & Corporation</th>
            <th className="py-3 px-3 text-center">TR (1 VP)</th>
            <th className="py-3 px-3 text-center">Milestones (5 VP)</th>
            <th className="py-3 px-3 text-center">Awards</th>
            <th className="py-3 px-3 text-center">Greeneries</th>
            <th className="py-3 px-3 text-center">Cities</th>
            <th className="py-3 px-3 text-center">Cards</th>
            {turmoilEnabled && <th className="py-3 px-3 text-center">Turmoil</th>}
            <th className="py-3 px-3 text-center">Total VP</th>
            <th className="py-3 px-3 text-right">M€ Cash (Tiebreak)</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#1e2638] bg-[#141824]">
          {results.map((r) => {
            const rankMedal =
              r.rank === 1 ? '🥇 1' : r.rank === 2 ? '🥈 2' : r.rank === 3 ? '🥉 3' : `#${r.rank}`;

            return (
              <tr
                key={r.id}
                className={`transition hover:bg-[#171d2b] ${
                  r.isWinner ? 'bg-[#f1c40f]/5' : ''
                }`}
              >
                <td className="py-3 px-3 text-center font-bold text-sm">
                  <span
                    className={
                      r.rank === 1
                        ? 'text-[#f1c40f]'
                        : r.rank === 2
                        ? 'text-slate-300'
                        : r.rank === 3
                        ? 'text-amber-600'
                        : 'text-[#8c9bb3]'
                    }
                  >
                    {rankMedal}
                  </span>
                </td>
                <td className="py-3 px-3">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-3.5 h-3.5 rounded-sm flex-shrink-0 border border-white/30"
                      style={{ backgroundColor: r.color }}
                    />
                    <div>
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <span>{r.name}</span>
                        {r.tiebreakWon && (
                          <span title="Won tiebreaker on M€ cash" className="text-amber-400 text-xs">
                            ⭐
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-[#8c9bb3]">{r.corporation}</div>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-3 text-center">
                  <span className="inline-block px-2 py-0.5 rounded text-xs font-semibold bg-sky-500/15 text-sky-400">
                    {r.tr}
                  </span>
                </td>
                <td className="py-3 px-3 text-center">
                  <span className="inline-block px-2 py-0.5 rounded text-xs font-semibold bg-amber-500/15 text-amber-300">
                    {r.milestonesVP}
                  </span>
                </td>
                <td className="py-3 px-3 text-center">
                  <span className="inline-block px-2 py-0.5 rounded text-xs font-semibold bg-orange-500/15 text-orange-300">
                    {r.awardsVP}
                  </span>
                </td>
                <td className="py-3 px-3 text-center">
                  <span className="inline-block px-2 py-0.5 rounded text-xs font-semibold bg-emerald-500/15 text-emerald-400">
                    {r.greeneryVP}
                  </span>
                </td>
                <td className="py-3 px-3 text-center">
                  <span className="inline-block px-2 py-0.5 rounded text-xs font-semibold bg-slate-500/15 text-slate-300">
                    {r.citiesVP}
                  </span>
                </td>
                <td className="py-3 px-3 text-center">
                  <span className="inline-block px-2 py-0.5 rounded text-xs font-semibold bg-purple-500/15 text-purple-300">
                    {r.cardsVP}
                  </span>
                </td>
                {turmoilEnabled && (
                  <td className="py-3 px-3 text-center">
                    <span className="inline-block px-2 py-0.5 rounded text-xs font-semibold bg-red-500/15 text-red-300">
                      {r.turmoilVP}
                    </span>
                  </td>
                )}
                <td className="py-3 px-3 text-center">
                  <span className="font-rajdhani text-xl font-bold text-white">
                    {r.totalVP}
                  </span>
                </td>
                <td className="py-3 px-3 text-right font-semibold text-[#f39c12]">
                  {r.megacredits} M€
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

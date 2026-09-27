import React from 'react';
import { PlayerResult } from '../types';

interface WinnerSpotlightProps {
  results: PlayerResult[];
}

export const WinnerSpotlight: React.FC<WinnerSpotlightProps> = ({ results }) => {
  if (results.length === 0) return null;

  const winner = results[0];
  const tiedWinners = results.filter(r => r.rank === 1);
  const isCoWinners = tiedWinners.length > 1;

  return (
    <div className="bg-gradient-to-r from-[#f39c12]/15 via-[#e2583e]/15 to-[#f39c12]/15 border border-[#f39c12]/40 rounded-xl p-5 mb-5 shadow-lg flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="text-4xl drop-shadow-[0_2px_10px_rgba(241,196,15,0.5)] select-none">
          {isCoWinners ? '🤝' : '🏆'}
        </div>
        <div>
          {isCoWinners ? (
            <div>
              <h3 className="font-rajdhani text-2xl font-bold text-white flex items-center gap-2">
                {tiedWinners.map(w => w.name).join(' & ')}
              </h3>
              <p className="text-xs text-[#8c9bb3]">Tied for 1st Place (Co-Winners)</p>
              <div className="inline-block bg-[#f1c40f]/20 border border-[#f1c40f]/50 text-[#f7dc6f] text-[11px] font-bold px-2 py-0.5 rounded mt-1">
                Identical VP ({winner.totalVP}) and Cash ({winner.megacredits} M€)
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-2">
                <span
                  className="w-3.5 h-3.5 rounded-sm flex-shrink-0 border border-white/30"
                  style={{ backgroundColor: winner.color }}
                />
                <h3 className="font-rajdhani text-2xl font-bold text-white">
                  {winner.name}
                </h3>
              </div>
              <p className="text-xs text-[#8c9bb3]">{winner.corporation}</p>

              {winner.tiebreakWon && results.length > 1 && (
                <div className="inline-block bg-[#f1c40f]/20 border border-[#f1c40f]/50 text-[#f7dc6f] text-[11px] font-bold px-2 py-0.5 rounded mt-1 shadow-sm">
                  ⚡ Won on Tiebreaker: +{winner.megacredits - results[1].megacredits} M€ cash ({winner.megacredits} vs {results[1].megacredits} M€)
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="text-right sm:text-right">
        <div className="font-orbitron text-4xl sm:text-5xl font-black text-[#f1c40f] drop-shadow-[0_0_15px_rgba(241,196,15,0.4)] leading-none">
          {winner.totalVP}
        </div>
        <div className="text-[11px] font-bold text-[#8c9bb3] uppercase tracking-wider mt-1">
          Total Victory Points
        </div>
      </div>
    </div>
  );
};

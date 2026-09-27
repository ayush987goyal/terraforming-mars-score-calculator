import React from 'react';
import { BoardType, Milestone, Player } from '../types';

interface MilestonesTrackerProps {
  board: BoardType;
  onSelectBoard: (board: BoardType) => void;
  milestones: Milestone[];
  claimedCount: number;
  players: Player[];
  onClaimMilestone: (milestoneId: string, playerId: string) => void;
}

export const MilestonesTracker: React.FC<MilestonesTrackerProps> = ({
  board,
  onSelectBoard,
  milestones,
  claimedCount,
  players,
  onClaimMilestone
}) => {
  const isLimitReached = claimedCount >= 3;

  return (
    <div className="bg-[#141824] border border-[#2b354d] rounded-xl p-5 shadow-lg">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-3 border-b border-[#2b354d]">
        <div className="flex items-center gap-2">
          <span className="text-xl">🚩</span>
          <h3 className="font-rajdhani text-lg font-bold text-white uppercase tracking-wide">
            Milestones (5 VP)
          </h3>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-xs text-[#8c9bb3]">
            <span>Board:</span>
            <select
              value={board}
              onChange={(e) => onSelectBoard(e.target.value as BoardType)}
              className="bg-[#101420] text-white border border-[#2b354d] rounded px-2.5 py-1 text-xs outline-none focus:border-[#e2583e] cursor-pointer"
            >
              <option value="tharsis">Tharsis (Standard)</option>
              <option value="hellas">Hellas</option>
              <option value="elysium">Elysium</option>
            </select>
          </div>

          <div
            className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
              isLimitReached
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
            }`}
          >
            {claimedCount} / 3 Claimed
          </div>
        </div>
      </div>

      <p className="text-xs text-[#8c9bb3] mb-4">
        Maximum 3 milestones can be claimed game-wide across all players. Each milestone awards 5 VP.
      </p>

      <div className="space-y-2.5">
        {milestones.map((m) => {
          const isClaimed = Boolean(m.claimedBy);
          const isLocked = isLimitReached && !isClaimed;

          return (
            <div
              key={m.id}
              className={`flex items-center justify-between gap-3 p-3 rounded-lg border transition ${
                isClaimed
                  ? 'bg-amber-500/10 border-amber-500/40'
                  : 'bg-[#1b2132] border-[#2b354d]'
              }`}
            >
              <div>
                <div className="font-bold text-sm text-white flex items-center gap-1.5">
                  <span>🚩</span> {m.name}
                </div>
                <div className="text-xs text-[#8c9bb3]">{m.req}</div>
              </div>

              <div>
                <select
                  value={m.claimedBy || ''}
                  onChange={(e) => onClaimMilestone(m.id, e.target.value)}
                  disabled={isLocked}
                  className={`bg-[#101420] text-white border border-[#2b354d] rounded px-2.5 py-1.5 text-xs outline-none focus:border-[#e2583e] min-w-[130px] cursor-pointer ${
                    isLocked ? 'opacity-40 cursor-not-allowed' : ''
                  }`}
                  title={isLocked ? 'Max 3 milestones already claimed' : 'Select player'}
                >
                  <option value="">-- Unclaimed --</option>
                  {players.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

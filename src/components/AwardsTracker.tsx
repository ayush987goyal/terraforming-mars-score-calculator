import React from 'react';
import { BoardType, AwardSlotState, AwardDefinition, Player } from '../types';

interface AwardsTrackerProps {
  board: BoardType;
  onSelectBoard: (board: BoardType) => void;
  availableAwards: AwardDefinition[];
  awards: AwardSlotState[];
  fundedCount: number;
  players: Player[];
  onSelectAward: (slot: number, awardId: string) => void;
  onToggleFirstPlace: (slot: number, playerId: string) => void;
  onToggleSecondPlace: (slot: number, playerId: string) => void;
}

export const AwardsTracker: React.FC<AwardsTrackerProps> = ({
  board,
  onSelectBoard,
  availableAwards,
  awards,
  fundedCount,
  players,
  onSelectAward,
  onToggleFirstPlace,
  onToggleSecondPlace
}) => {
  const isLimitReached = fundedCount >= 3;
  const is2Player = players.length <= 2;

  return (
    <div className="bg-[#141824] border border-[#2b354d] rounded-xl p-5 shadow-lg">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-3 border-b border-[#2b354d]">
        <div className="flex items-center gap-2">
          <span className="text-xl">🎖️</span>
          <h3 className="font-rajdhani text-lg font-bold text-white uppercase tracking-wide">
            Funded Awards
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
                : 'bg-orange-500/15 text-orange-300 border-orange-500/30'
            }`}
          >
            {fundedCount} / 3 Funded
          </div>
        </div>
      </div>

      <p className="text-xs text-[#8c9bb3] mb-4">
        1st place = 5 VP, 2nd place = 2 VP. (2-player: 0 VP for 2nd; 1st place tie gives 5 VP each and cancels 2nd place).
      </p>

      <div className="space-y-4">
        {awards.map((a) => {
          const is1stTied = (a.firstPlace || []).length > 1;

          return (
            <div
              key={a.slot}
              className="bg-[#1b2132] border border-[#2b354d] rounded-lg p-3.5"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Slot {a.slot}:
                  </span>
                  <select
                    value={a.awardId}
                    onChange={(e) => onSelectAward(a.slot, e.target.value)}
                    className="bg-[#101420] text-white border border-[#2b354d] rounded px-2.5 py-1 text-xs outline-none focus:border-[#e2583e] min-w-[200px] cursor-pointer"
                  >
                    <option value="">-- Not Funded --</option>
                    {availableAwards.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.name} ({opt.desc})
                      </option>
                    ))}
                  </select>
                </div>

                {a.funded && (
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-orange-500/20 text-orange-300 border border-orange-500/40">
                    Active
                  </span>
                )}
              </div>

              {a.funded && a.awardId && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                  {/* 1st Place Column */}
                  <div className="bg-[#101420] p-2.5 rounded-md border border-[#232a3d]">
                    <div className="flex items-center justify-between text-xs font-bold text-[#f1c40f] uppercase tracking-wider pb-1.5 mb-2 border-b border-[#232a3d]">
                      <span>🥇 1st Place (5 VP)</span>
                      {is1stTied && (
                        <span className="text-[10px] font-bold text-amber-300 bg-amber-400/20 px-1.5 py-0.2 rounded">
                          Tied (5 VP each)
                        </span>
                      )}
                    </div>
                    <div className="space-y-1.5 max-h-32 overflow-y-auto">
                      {players.map((p) => {
                        const checked = (a.firstPlace || []).includes(p.id);
                        return (
                          <label
                            key={p.id}
                            className="flex items-center gap-2 text-xs text-white cursor-pointer select-none hover:text-white/80"
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => onToggleFirstPlace(a.slot, p.id)}
                              className="accent-[#e2583e] cursor-pointer"
                            />
                            <span
                              className="w-2.5 h-2.5 rounded-xs flex-shrink-0"
                              style={{ backgroundColor: p.color }}
                            />
                            <span>{p.name}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* 2nd Place Column */}
                  <div className="bg-[#101420] p-2.5 rounded-md border border-[#232a3d]">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-300 uppercase tracking-wider pb-1.5 mb-2 border-b border-[#232a3d]">
                      <span>🥈 2nd Place (2 VP)</span>
                      {is1stTied ? (
                        <span className="text-[10px] font-bold text-red-400 bg-red-500/20 px-1.5 py-0.2 rounded">
                          Cancelled
                        </span>
                      ) : is2Player ? (
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-500/20 px-1.5 py-0.2 rounded">
                          0 VP (2p)
                        </span>
                      ) : null}
                    </div>

                    <div className="space-y-1.5 max-h-32 overflow-y-auto">
                      {is1stTied ? (
                        <div className="text-[11px] text-red-400 py-1">
                          ⚠️ 1st place tie cancels 2nd place per official rules.
                        </div>
                      ) : is2Player ? (
                        <div className="text-[11px] text-[#8c9bb3] py-1">
                          ℹ️ In 2-player games, 2nd place receives 0 VP.
                        </div>
                      ) : (
                        players.map((p) => {
                          const isFirst = (a.firstPlace || []).includes(p.id);
                          const checked = (a.secondPlace || []).includes(p.id);

                          return (
                            <label
                              key={p.id}
                              className={`flex items-center gap-2 text-xs select-none ${
                                isFirst
                                  ? 'opacity-30 cursor-not-allowed text-slate-500'
                                  : 'text-white cursor-pointer hover:text-white/80'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                disabled={isFirst}
                                onChange={() => onToggleSecondPlace(a.slot, p.id)}
                                className="accent-[#e2583e] cursor-pointer"
                              />
                              <span
                                className="w-2.5 h-2.5 rounded-xs flex-shrink-0"
                                style={{ backgroundColor: p.color }}
                              />
                              <span>{p.name}</span>
                            </label>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

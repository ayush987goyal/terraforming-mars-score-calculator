import React, { useState } from 'react';
import { GameState, BoardType, Player, WalkthroughStep } from '../types';
import { BOARD_DATA, VENUS_MILESTONE, VENUS_AWARD } from '../data/gameData';
import {
  ChevronLeft,
  ChevronRight,
  Trophy,
  Check,
  ChevronDown,
  Calculator,
  Plus,
  Minus
} from 'lucide-react';

interface KeypadTarget {
  playerId: string;
  field: keyof Player;
  title: string;
  subtitle: string;
  value: number;
  min?: number;
  max?: number;
  allowNegative?: boolean;
}

interface ScreenWalkthroughProps {
  gameState: GameState;
  currentStep: WalkthroughStep;
  onSetStep: (step: WalkthroughStep) => void;
  onBackToSetup: () => void;
  onFinishScoring: () => void;
  onUpdatePlayer: (id: string, updates: Partial<Player>) => void;
  onClaimMilestone: (milestoneId: string, playerId: string) => void;
  onSelectAward: (slot: number, awardId: string) => void;
  onToggleFirstPlace: (slot: number, playerId: string) => void;
  onToggleSecondPlace: (slot: number, playerId: string) => void;
  onOpenKeypad: (target: {
    title: string;
    subtitle?: string;
    playerColor?: string;
    value: number;
    min?: number;
    max?: number;
    allowNegative?: boolean;
    onConfirm: (val: number) => void;
  }) => void;
  onShowToast: (msg: string) => void;
}

export const ScreenWalkthrough: React.FC<ScreenWalkthroughProps> = ({
  gameState,
  currentStep,
  onSetStep,
  onBackToSetup,
  onFinishScoring,
  onUpdatePlayer,
  onClaimMilestone,
  onSelectAward,
  onToggleFirstPlace,
  onToggleSecondPlace,
  onOpenKeypad,
  onShowToast
}) => {
  const { players, milestones, awards, settings, boardMilestones, boardAwards } = gameState;
  const is2Player = players.length <= 2;

  // Local drawer toggles for special tiles & card calc
  const [openSpecial, setOpenSpecial] = useState<Record<string, boolean>>({});
  const [openCardCalc, setOpenCardCalc] = useState<Record<string, boolean>>({});
  const [cardCalcState, setCardCalcState] = useState<
    Record<string, { fixed: number; resources: number; jovian: number }>
  >({});

  const toggleSpecial = (playerId: string) => {
    setOpenSpecial((prev) => ({ ...prev, [playerId]: !prev[playerId] }));
  };

  const toggleCardCalc = (playerId: string) => {
    setOpenCardCalc((prev) => ({ ...prev, [playerId]: !prev[playerId] }));
  };

  const handleStepDelta = (
    playerId: string,
    field: keyof Player,
    delta: number,
    min = 0,
    max = 300
  ) => {
    const player = players.find((p) => p.id === playerId);
    if (!player) return;
    const current = Number(player[field]) || 0;
    const next = Math.min(max, Math.max(min, current + delta));
    onUpdatePlayer(playerId, { [field]: next });
  };

  const handleApplyCardHelper = (playerId: string) => {
    const calc = cardCalcState[playerId] || { fixed: 0, resources: 0, jovian: 0 };
    const total = Number(calc.fixed) + Number(calc.resources) + Number(calc.jovian);
    onUpdatePlayer(playerId, { cardsVP: total });
    const p = players.find((item) => item.id === playerId);
    onShowToast(`Updated Card VP for ${p?.name || 'Player'}: ${total} VP`);
  };

  // Milestone count
  const claimedMilestoneCount = milestones.filter((m) => Boolean(m.claimedBy)).length;
  const isMilestoneLimitReached = claimedMilestoneCount >= 3;

  // Awards available
  const availableAwards = [...BOARD_DATA[boardAwards].awards];
  if (settings.venus) {
    availableAwards.push(VENUS_AWARD);
  }
  const fundedAwardCount = awards.filter((a) => a.funded && Boolean(a.awardId)).length;

  const STEPS = [
    { num: 1 as WalkthroughStep, title: 'Final TR', icon: '🌐', short: 'TR' },
    { num: 2 as WalkthroughStep, title: 'Milestones & Awards', icon: '🚩', short: 'Goals' },
    { num: 3 as WalkthroughStep, title: 'Greeneries & Cities', icon: '🌲', short: 'Board' },
    { num: 4 as WalkthroughStep, title: 'Cards & Turmoil', icon: '🃏', short: 'Cards' }
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-24 animate-in fade-in duration-200">
      {/* 1. Top Step Tracker */}
      <div className="bg-[#141824] border border-[#2b354d] rounded-2xl p-4 shadow-xl">
        <div className="flex items-center justify-between text-xs text-[#8c9bb3] mb-3">
          <span className="font-bold uppercase tracking-wider text-[#e2583e]">
            Category {currentStep} of 4
          </span>
          <span className="italic">Scores remain veiled until podium reveal</span>
        </div>

        {/* Step Tabs Grid */}
        <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
          {STEPS.map((s) => {
            const isActive = currentStep === s.num;
            const isCompleted = currentStep > s.num;

            return (
              <button
                key={s.num}
                type="button"
                onClick={() => onSetStep(s.num)}
                className={`py-2 px-1.5 sm:px-3 rounded-xl border text-left transition flex flex-col sm:flex-row items-center sm:items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-[#e2583e]/25 to-[#f39c12]/20 border-[#e2583e] shadow-md shadow-[#e2583e]/20 ring-1 ring-[#e2583e]/50'
                    : isCompleted
                    ? 'bg-[#1b2132] border-emerald-500/40 text-emerald-400 hover:bg-[#222a3e]'
                    : 'bg-[#101420] border-[#232a3d] text-[#8c9bb3] hover:text-white'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    isActive
                      ? 'bg-[#e2583e] text-white shadow'
                      : isCompleted
                      ? 'bg-emerald-500 text-slate-950 font-black'
                      : 'bg-[#1b2132] text-[#8c9bb3]'
                  }`}
                >
                  {isCompleted ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : s.num}
                </div>
                <div className="truncate text-center sm:text-left">
                  <div
                    className={`text-xs font-bold truncate ${
                      isActive ? 'text-white' : isCompleted ? 'text-emerald-300' : 'text-[#8c9bb3]'
                    }`}
                  >
                    <span className="sm:hidden">{s.short}</span>
                    <span className="hidden sm:inline">{s.title}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Step 1: Final Terraform Rating (TR) */}
      {currentStep === 1 && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="bg-[#141824] border border-[#2b354d] rounded-2xl p-5 shadow-xl">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">🌐</span>
              <div>
                <h3 className="font-orbitron text-xl font-bold text-white tracking-wide">
                  Step 1: Final Terraform Rating (TR)
                </h3>
                <p className="text-xs text-[#8c9bb3]">
                  Record each player's final position on the TR track. Each 1 TR awards 1 Victory Point (starts at 20).
                </p>
              </div>
            </div>
            <div className="mt-3 py-1.5 px-3 rounded-lg bg-sky-950/30 border border-sky-500/30 text-[11px] text-sky-300 flex items-center gap-2">
              <span>💡</span>
              <span>Tap any number box to open the full in-app numeric keypad, or use +/- for quick adjustment.</span>
            </div>
          </div>

          {/* Player Input Rows */}
          <div className="space-y-3">
            {players.map((p) => (
              <div
                key={p.id}
                className="bg-[#141824] border border-[#2b354d] rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                {/* Player identity */}
                <div className="flex items-center gap-3">
                  <span
                    className="w-4 h-4 rounded-full flex-shrink-0 border border-white/40 shadow-sm"
                    style={{ backgroundColor: p.color }}
                  />
                  <div>
                    <h4 className="font-bold text-base text-white">{p.name}</h4>
                    <p className="text-xs text-[#8c9bb3]">{p.corporation}</p>
                  </div>
                </div>

                {/* TR Stepper & Keypad Button */}
                <div className="flex items-center justify-end gap-2">
                  <span className="text-xs font-bold uppercase text-[#8c9bb3] mr-1 hidden sm:inline">
                    Final TR:
                  </span>

                  <button
                    type="button"
                    onClick={() => handleStepDelta(p.id, 'tr', -1, 0, 200)}
                    className="w-10 h-10 rounded-xl bg-[#1b2132] hover:bg-[#252e46] active:bg-[#e2583e] active:text-white border border-[#2b354d] text-white font-bold text-lg flex items-center justify-center transition cursor-pointer select-none"
                    aria-label="Decrease TR"
                  >
                    <Minus className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      onOpenKeypad({
                        title: `${p.name} — Final TR`,
                        subtitle: `${p.corporation} • 1 TR = 1 VP`,
                        playerColor: p.color,
                        value: p.tr,
                        min: 0,
                        max: 200,
                        onConfirm: (val) => onUpdatePlayer(p.id, { tr: val })
                      })
                    }
                    className="min-w-24 px-4 py-2 bg-[#101420] hover:bg-[#1a2033] border-2 border-sky-500/50 hover:border-sky-400 rounded-xl text-center transition cursor-pointer group shadow-inner"
                    title="Tap to open in-app keypad"
                  >
                    <div className="font-orbitron text-2xl font-black text-sky-400 group-hover:text-sky-300">
                      {p.tr}
                    </div>
                    <div className="text-[9px] uppercase font-bold tracking-widest text-[#8c9bb3]">
                      TR Points
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStepDelta(p.id, 'tr', 1, 0, 200)}
                    className="w-10 h-10 rounded-xl bg-[#1b2132] hover:bg-[#252e46] active:bg-[#e2583e] active:text-white border border-[#2b354d] text-white font-bold text-lg flex items-center justify-center transition cursor-pointer select-none"
                    aria-label="Increase TR"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Step 2: Milestones & Awards */}
      {currentStep === 2 && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Section Header */}
          <div className="bg-[#141824] border border-[#2b354d] rounded-2xl p-5 shadow-xl">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">🚩</span>
              <div>
                <h3 className="font-orbitron text-xl font-bold text-white tracking-wide">
                  Step 2: Milestones & Funded Awards
                </h3>
                <p className="text-xs text-[#8c9bb3]">
                  Milestones award 5 VP each (max 3 claimed game-wide). Funded awards grant 5 VP for 1st place and 2 VP for 2nd place.
                </p>
              </div>
            </div>
          </div>

          {/* Part A: Milestones Tracker */}
          <div className="bg-[#141824] border border-[#2b354d] rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#232a3d]">
              <div>
                <h4 className="font-rajdhani text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <span>🚩</span> Claimed Milestones (5 VP Each)
                </h4>
                <p className="text-xs text-[#8c9bb3]">
                  Maximum 3 milestones can be claimed across all players.
                </p>
              </div>
              <div
                className={`text-xs font-bold px-3 py-1 rounded-full border ${
                  isMilestoneLimitReached
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                }`}
              >
                {claimedMilestoneCount} / 3 Claimed
              </div>
            </div>

            <div className="space-y-2.5">
              {milestones.map((m) => {
                const isClaimed = Boolean(m.claimedBy);
                const isLocked = isMilestoneLimitReached && !isClaimed;
                const claimedPlayer = players.find((p) => p.id === m.claimedBy);

                return (
                  <div
                    key={m.id}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border transition ${
                      isClaimed
                        ? 'bg-amber-500/10 border-amber-500/40'
                        : 'bg-[#1b2132] border-[#2b354d]'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-sm text-white flex items-center gap-2">
                        <span>🚩 {m.name}</span>
                        {isClaimed && claimedPlayer && (
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: claimedPlayer.color }}
                          />
                        )}
                      </div>
                      <div className="text-xs text-[#8c9bb3]">{m.req}</div>
                    </div>

                    <div>
                      <select
                        value={m.claimedBy || ''}
                        onChange={(e) => onClaimMilestone(m.id, e.target.value)}
                        disabled={isLocked}
                        className={`bg-[#101420] text-white border border-[#2b354d] focus:border-[#e2583e] rounded-xl px-3 py-2 text-xs outline-none min-w-[160px] cursor-pointer ${
                          isLocked ? 'opacity-40 cursor-not-allowed' : ''
                        }`}
                        title={isLocked ? 'Maximum 3 milestones already claimed' : 'Select player'}
                      >
                        <option value="">-- Unclaimed --</option>
                        {players.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} (+5 VP)
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Part B: Awards Tracker */}
          <div className="bg-[#141824] border border-[#2b354d] rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#232a3d]">
              <div>
                <h4 className="font-rajdhani text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <span>🎖️</span> Funded Awards
                </h4>
                <p className="text-xs text-[#8c9bb3]">
                  1st place = 5 VP, 2nd place = 2 VP. (2-player: 0 VP for 2nd; 1st tie gives 5 VP each and cancels 2nd).
                </p>
              </div>
              <div
                className={`text-xs font-bold px-3 py-1 rounded-full border ${
                  fundedAwardCount >= 3
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-orange-500/15 text-orange-300 border-orange-500/30'
                }`}
              >
                {fundedAwardCount} / 3 Funded
              </div>
            </div>

            <div className="space-y-4">
              {awards.map((a) => {
                const is1stTied = (a.firstPlace || []).length > 1;

                return (
                  <div
                    key={a.slot}
                    className="bg-[#1b2132] border border-[#2b354d] rounded-xl p-4 space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="text-xs font-bold text-white uppercase tracking-wider flex-shrink-0">
                          Slot {a.slot}:
                        </span>
                        <select
                          value={a.awardId}
                          onChange={(e) => onSelectAward(a.slot, e.target.value)}
                          className="bg-[#101420] text-white border border-[#2b354d] focus:border-[#e2583e] rounded-lg px-2.5 py-1.5 text-xs outline-none w-full max-w-xs cursor-pointer"
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
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        {/* 1st Place */}
                        <div className="bg-[#101420] p-3 rounded-xl border border-[#232a3d]">
                          <div className="flex items-center justify-between text-xs font-bold text-[#f1c40f] uppercase tracking-wider pb-1.5 mb-2 border-b border-[#232a3d]">
                            <span>🥇 1st Place (5 VP)</span>
                            {is1stTied && (
                              <span className="text-[10px] font-bold text-amber-300 bg-amber-400/20 px-1.5 py-0.2 rounded">
                                Tied (5 VP each)
                              </span>
                            )}
                          </div>
                          <div className="space-y-1.5">
                            {players.map((p) => {
                              const checked = (a.firstPlace || []).includes(p.id);
                              return (
                                <label
                                  key={p.id}
                                  className="flex items-center gap-2 text-xs text-white cursor-pointer select-none hover:text-white/80 p-1 rounded hover:bg-white/5"
                                >
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={() => onToggleFirstPlace(a.slot, p.id)}
                                    className="accent-[#e2583e] w-4 h-4 cursor-pointer"
                                  />
                                  <span
                                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                    style={{ backgroundColor: p.color }}
                                  />
                                  <span>{p.name}</span>
                                </label>
                              );
                            })}
                          </div>
                        </div>

                        {/* 2nd Place */}
                        <div className="bg-[#101420] p-3 rounded-xl border border-[#232a3d]">
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

                          <div className="space-y-1.5">
                            {is1stTied ? (
                              <div className="text-[11px] text-red-400 py-1">
                                ⚠️ 1st place tie gives 5 VP to each and cancels 2nd place.
                              </div>
                            ) : is2Player ? (
                              <div className="text-[11px] text-[#8c9bb3] py-1">
                                ℹ️ In 2-player games, 2nd place receives 0 VP per official rules.
                              </div>
                            ) : (
                              players.map((p) => {
                                const isFirst = (a.firstPlace || []).includes(p.id);
                                const checked = (a.secondPlace || []).includes(p.id);

                                return (
                                  <label
                                    key={p.id}
                                    className={`flex items-center gap-2 text-xs select-none p-1 rounded ${
                                      isFirst
                                        ? 'opacity-30 cursor-not-allowed text-slate-500'
                                        : 'text-white cursor-pointer hover:bg-white/5'
                                    }`}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={checked}
                                      disabled={isFirst}
                                      onChange={() => onToggleSecondPlace(a.slot, p.id)}
                                      className="accent-[#e2583e] w-4 h-4 cursor-pointer"
                                    />
                                    <span
                                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
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
        </div>
      )}

      {/* 4. Step 3: Board Greeneries & Cities */}
      {currentStep === 3 && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="bg-[#141824] border border-[#2b354d] rounded-2xl p-5 shadow-xl">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">🌲</span>
              <div>
                <h3 className="font-orbitron text-xl font-bold text-white tracking-wide">
                  Step 3: Board Greeneries & Cities
                </h3>
                <p className="text-xs text-[#8c9bb3]">
                  1 VP per owned greenery tile. Cities score 1 VP per adjacent greenery tile (owned by anyone). Tap numbers for in-app keypad.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {players.map((p) => {
              const hasSpecialOpen = Boolean(openSpecial[p.id]);

              return (
                <div
                  key={p.id}
                  className="bg-[#141824] border border-[#2b354d] rounded-2xl p-4 sm:p-5 shadow-lg space-y-4"
                >
                  {/* Player header */}
                  <div className="flex items-center justify-between pb-3 border-b border-[#232a3d]">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-3.5 h-3.5 rounded-full flex-shrink-0 border border-white/40"
                        style={{ backgroundColor: p.color }}
                      />
                      <h4 className="font-bold text-base text-white">{p.name}</h4>
                      <span className="text-xs text-[#8c9bb3]">({p.corporation})</span>
                    </div>
                  </div>

                  {/* Input Grid: Greeneries & City Adjacencies */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Greeneries */}
                    <div className="bg-[#101420] border border-[#232a3d] rounded-xl p-3.5">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span>🌲</span> Greeneries Owned
                        </span>
                        <span className="text-[10px] text-[#8c9bb3]">1 VP each</span>
                      </div>

                      <div className="flex items-center justify-between gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleStepDelta(p.id, 'greeneries', -1, 0, 100)}
                          className="w-8 h-8 rounded-lg bg-[#1b2132] hover:bg-[#252e46] active:bg-[#e2583e] active:text-white border border-[#2b354d] text-white font-bold flex items-center justify-center transition cursor-pointer select-none"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            onOpenKeypad({
                              title: `${p.name} — Greeneries Owned`,
                              subtitle: '1 VP per owned greenery tile',
                              playerColor: p.color,
                              value: p.greeneries,
                              min: 0,
                              max: 100,
                              onConfirm: (val) => onUpdatePlayer(p.id, { greeneries: val })
                            })
                          }
                          className="flex-1 py-1.5 bg-[#171d2b] hover:bg-[#1f273a] border border-emerald-500/40 rounded-lg text-center transition cursor-pointer"
                        >
                          <div className="font-orbitron text-xl font-black text-emerald-400">
                            {p.greeneries}
                          </div>
                          <div className="text-[9px] uppercase font-bold text-[#8c9bb3]">
                            Tiles
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleStepDelta(p.id, 'greeneries', 1, 0, 100)}
                          className="w-8 h-8 rounded-lg bg-[#1b2132] hover:bg-[#252e46] active:bg-[#e2583e] active:text-white border border-[#2b354d] text-white font-bold flex items-center justify-center transition cursor-pointer select-none"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* City Adjacencies */}
                    <div className="bg-[#101420] border border-[#232a3d] rounded-xl p-3.5">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span>🏙️</span> City Adjacencies
                        </span>
                        <span className="text-[10px] text-[#8c9bb3]">1 VP per adj. greenery</span>
                      </div>

                      <div className="flex items-center justify-between gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleStepDelta(p.id, 'cityAdjacencies', -1, 0, 150)}
                          className="w-8 h-8 rounded-lg bg-[#1b2132] hover:bg-[#252e46] active:bg-[#e2583e] active:text-white border border-[#2b354d] text-white font-bold flex items-center justify-center transition cursor-pointer select-none"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            onOpenKeypad({
                              title: `${p.name} — City Adjacencies`,
                              subtitle: '1 VP per adjacent greenery to owned cities',
                              playerColor: p.color,
                              value: p.cityAdjacencies,
                              min: 0,
                              max: 150,
                              onConfirm: (val) => onUpdatePlayer(p.id, { cityAdjacencies: val })
                            })
                          }
                          className="flex-1 py-1.5 bg-[#171d2b] hover:bg-[#1f273a] border border-slate-500/40 rounded-lg text-center transition cursor-pointer"
                        >
                          <div className="font-orbitron text-xl font-black text-slate-300">
                            {p.cityAdjacencies}
                          </div>
                          <div className="text-[9px] uppercase font-bold text-[#8c9bb3]">
                            Adjacencies
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleStepDelta(p.id, 'cityAdjacencies', 1, 0, 150)}
                          className="w-8 h-8 rounded-lg bg-[#1b2132] hover:bg-[#252e46] active:bg-[#e2583e] active:text-white border border-[#2b354d] text-white font-bold flex items-center justify-center transition cursor-pointer select-none"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Special Tiles Drawer (Capital & Commercial District) */}
                  <div className="bg-[#101420] border border-[#232a3d] rounded-xl p-3">
                    <button
                      type="button"
                      onClick={() => toggleSpecial(p.id)}
                      className="flex items-center justify-between w-full text-xs font-semibold text-sky-400 hover:text-sky-300 cursor-pointer"
                    >
                      <span className="flex items-center gap-1.5">
                        <span>🌟</span>
                        <span>Special Tiles (Capital & Commercial District)</span>
                        {(p.hasCapital || p.hasCommercialDistrict) && (
                          <span className="text-[10px] font-bold text-amber-300 bg-amber-400/20 px-1.5 py-0.2 rounded">
                            Active
                          </span>
                        )}
                      </span>
                      {hasSpecialOpen ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>

                    {hasSpecialOpen && (
                      <div className="mt-3 pt-3 border-t border-dashed border-[#2b354d] space-y-3">
                        {/* Capital */}
                        <div className="flex items-center justify-between text-xs">
                          <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={p.hasCapital}
                              onChange={(e) =>
                                onUpdatePlayer(p.id, { hasCapital: e.target.checked })
                              }
                              className="accent-[#e2583e] w-4 h-4 cursor-pointer"
                            />
                            <span className="text-white">Capital (+1 VP per ocean adjacent)</span>
                          </label>

                          {p.hasCapital && (
                            <div className="flex items-center gap-1.5">
                              <span className="text-[11px] text-[#8c9bb3]">Oceans:</span>
                              <div className="flex items-center bg-[#1b2132] border border-[#2b354d] rounded-md p-0.5">
                                <button
                                  type="button"
                                  onClick={() => handleStepDelta(p.id, 'capitalOceans', -1, 0, 9)}
                                  className="w-6 h-6 flex items-center justify-center font-bold text-xs"
                                >
                                  -
                                </button>
                                <span className="w-6 text-center font-bold text-xs text-sky-400">
                                  {p.capitalOceans}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleStepDelta(p.id, 'capitalOceans', 1, 0, 9)}
                                  className="w-6 h-6 flex items-center justify-center font-bold text-xs"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Commercial District */}
                        <div className="flex items-center justify-between text-xs">
                          <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={p.hasCommercialDistrict}
                              onChange={(e) =>
                                onUpdatePlayer(p.id, {
                                  hasCommercialDistrict: e.target.checked
                                })
                              }
                              className="accent-[#e2583e] w-4 h-4 cursor-pointer"
                            />
                            <span className="text-white">Commercial District (+1 VP per city)</span>
                          </label>

                          {p.hasCommercialDistrict && (
                            <div className="flex items-center gap-1.5">
                              <span className="text-[11px] text-[#8c9bb3]">Cities:</span>
                              <div className="flex items-center bg-[#1b2132] border border-[#2b354d] rounded-md p-0.5">
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleStepDelta(p.id, 'commercialCities', -1, 0, 6)
                                  }
                                  className="w-6 h-6 flex items-center justify-center font-bold text-xs"
                                >
                                  -
                                </button>
                                <span className="w-6 text-center font-bold text-xs text-sky-400">
                                  {p.commercialCities}
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleStepDelta(p.id, 'commercialCities', 1, 0, 6)
                                  }
                                  className="w-6 h-6 flex items-center justify-center font-bold text-xs"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. Step 4: Cards VP & Turmoil */}
      {currentStep === 4 && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="bg-[#141824] border border-[#2b354d] rounded-2xl p-5 shadow-xl">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">🃏</span>
              <div>
                <h3 className="font-orbitron text-xl font-bold text-white tracking-wide">
                  Step 4: Cards VP & Turmoil
                </h3>
                <p className="text-xs text-[#8c9bb3]">
                  Sum of project card Victory Points (fixed + resource + Jovian multipliers). If Turmoil is active, score Chairman and Party Leaders. Enter final MegaCredits (M€ cash) for tiebreaker.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {players.map((p) => {
              const hasCardCalc = Boolean(openCardCalc[p.id]);
              const calc = cardCalcState[p.id] || { fixed: 0, resources: 0, jovian: 0 };

              return (
                <div
                  key={p.id}
                  className="bg-[#141824] border border-[#2b354d] rounded-2xl p-4 sm:p-5 shadow-lg space-y-4"
                >
                  {/* Player header */}
                  <div className="flex items-center justify-between pb-3 border-b border-[#232a3d]">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-3.5 h-3.5 rounded-full flex-shrink-0 border border-white/40"
                        style={{ backgroundColor: p.color }}
                      />
                      <h4 className="font-bold text-base text-white">{p.name}</h4>
                      <span className="text-xs text-[#8c9bb3]">({p.corporation})</span>
                    </div>
                  </div>

                  {/* Cards VP & Tiebreaker Cash */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Cards VP */}
                    <div className="bg-[#101420] border border-[#232a3d] rounded-xl p-3.5">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span>🃏</span> Cards VP Total
                        </span>
                        <span className="text-[10px] text-[#8c9bb3]">Fixed & Variable</span>
                      </div>

                      <div className="flex items-center justify-between gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleStepDelta(p.id, 'cardsVP', -1, -50, 200)}
                          className="w-8 h-8 rounded-lg bg-[#1b2132] hover:bg-[#252e46] active:bg-[#e2583e] active:text-white border border-[#2b354d] text-white font-bold flex items-center justify-center transition cursor-pointer select-none"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            onOpenKeypad({
                              title: `${p.name} — Cards VP`,
                              subtitle: 'Sum of all card Victory Points',
                              playerColor: p.color,
                              value: p.cardsVP,
                              min: -50,
                              max: 200,
                              allowNegative: true,
                              onConfirm: (val) => onUpdatePlayer(p.id, { cardsVP: val })
                            })
                          }
                          className="flex-1 py-1.5 bg-[#171d2b] hover:bg-[#1f273a] border border-purple-500/40 rounded-lg text-center transition cursor-pointer"
                        >
                          <div className="font-orbitron text-xl font-black text-purple-300">
                            {p.cardsVP}
                          </div>
                          <div className="text-[9px] uppercase font-bold text-[#8c9bb3]">
                            Points
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleStepDelta(p.id, 'cardsVP', 1, -50, 200)}
                          className="w-8 h-8 rounded-lg bg-[#1b2132] hover:bg-[#252e46] active:bg-[#e2583e] active:text-white border border-[#2b354d] text-white font-bold flex items-center justify-center transition cursor-pointer select-none"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Tiebreaker: MegaCredits Cash */}
                    <div className="bg-[#101420] border border-[#232a3d] rounded-xl p-3.5">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-[#f39c12] flex items-center gap-1.5">
                          <span>💰</span> M€ Cash (Tiebreaker)
                        </span>
                        <span className="text-[10px] text-[#8c9bb3]">Most cash wins ties</span>
                      </div>

                      <div className="flex items-center justify-between gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleStepDelta(p.id, 'megacredits', -1, 0, 300)}
                          className="w-8 h-8 rounded-lg bg-[#1b2132] hover:bg-[#252e46] active:bg-[#e2583e] active:text-white border border-[#2b354d] text-white font-bold flex items-center justify-center transition cursor-pointer select-none"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            onOpenKeypad({
                              title: `${p.name} — MegaCredits Cash`,
                              subtitle: 'Tiebreaker: Most M€ on hand wins ties',
                              playerColor: p.color,
                              value: p.megacredits,
                              min: 0,
                              max: 300,
                              onConfirm: (val) => onUpdatePlayer(p.id, { megacredits: val })
                            })
                          }
                          className="flex-1 py-1.5 bg-[#171d2b] hover:bg-[#1f273a] border border-amber-500/40 rounded-lg text-center transition cursor-pointer"
                        >
                          <div className="font-orbitron text-xl font-black text-amber-400">
                            {p.megacredits} M€
                          </div>
                          <div className="text-[9px] uppercase font-bold text-[#8c9bb3]">
                            Cash
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleStepDelta(p.id, 'megacredits', 1, 0, 300)}
                          className="w-8 h-8 rounded-lg bg-[#1b2132] hover:bg-[#252e46] active:bg-[#e2583e] active:text-white border border-[#2b354d] text-white font-bold flex items-center justify-center transition cursor-pointer select-none"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Card Breakdown Helper Drawer */}
                  <div className="bg-[#101420] border border-[#232a3d] rounded-xl p-3">
                    <button
                      type="button"
                      onClick={() => toggleCardCalc(p.id)}
                      className="flex items-center justify-between w-full text-xs font-semibold text-purple-400 hover:text-purple-300 cursor-pointer"
                    >
                      <span className="flex items-center gap-1.5">
                        <Calculator className="w-3.5 h-3.5" />
                        <span>Optional Card VP Breakdown Helper (Fixed / Bio / Jovian)</span>
                      </span>
                      {hasCardCalc ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>

                    {hasCardCalc && (
                      <div className="mt-3 pt-3 border-t border-dashed border-[#2b354d] space-y-2.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-[#8c9bb3]">Fixed (+/-) Card VP:</span>
                          <input
                            type="number"
                            value={calc.fixed}
                            onChange={(e) =>
                              setCardCalcState((prev) => ({
                                ...prev,
                                [p.id]: {
                                  ...calc,
                                  fixed: Number(e.target.value) || 0
                                }
                              }))
                            }
                            className="w-16 bg-[#1b2132] border border-[#2b354d] rounded px-2 py-1 text-center text-white"
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-[#8c9bb3]">Animal / Microbe / Floater VP:</span>
                          <input
                            type="number"
                            value={calc.resources}
                            onChange={(e) =>
                              setCardCalcState((prev) => ({
                                ...prev,
                                [p.id]: {
                                  ...calc,
                                  resources: Number(e.target.value) || 0
                                }
                              }))
                            }
                            className="w-16 bg-[#1b2132] border border-[#2b354d] rounded px-2 py-1 text-center text-white"
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-[#8c9bb3]">Jovian Multipliers VP:</span>
                          <input
                            type="number"
                            value={calc.jovian}
                            onChange={(e) =>
                              setCardCalcState((prev) => ({
                                ...prev,
                                [p.id]: {
                                  ...calc,
                                  jovian: Number(e.target.value) || 0
                                }
                              }))
                            }
                            className="w-16 bg-[#1b2132] border border-[#2b354d] rounded px-2 py-1 text-center text-white"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => handleApplyCardHelper(p.id)}
                          className="w-full mt-2 py-2 rounded-lg bg-purple-700/40 hover:bg-purple-700/60 border border-purple-500/50 text-white font-bold text-xs transition cursor-pointer"
                        >
                          Apply Sum to Cards VP ({Number(calc.fixed) + Number(calc.resources) + Number(calc.jovian)} VP)
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Turmoil Inputs (if enabled) */}
                  {settings.turmoil && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="font-semibold text-red-300 text-xs flex items-center gap-1.5">
                          <span>🏛️</span> Turmoil Positions
                        </div>
                        <div className="text-[10px] text-[#8c9bb3]">
                          Chairman (1 VP) + Party Leaders (1 VP each)
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-1.5 text-xs text-white cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={p.isChairman}
                            onChange={(e) =>
                              onUpdatePlayer(p.id, { isChairman: e.target.checked })
                            }
                            className="accent-[#e2583e] w-4 h-4 cursor-pointer"
                          />
                          <span>Chairman</span>
                        </label>

                        <div className="flex items-center gap-1.5 text-xs">
                          <span className="text-[#8c9bb3]">Leaders:</span>
                          <div className="flex items-center bg-[#101420] border border-[#2b354d] rounded-md p-0.5">
                            <button
                              type="button"
                              onClick={() => handleStepDelta(p.id, 'partyLeaders', -1, 0, 6)}
                              className="w-6 h-6 flex items-center justify-center font-bold text-xs"
                            >
                              -
                            </button>
                            <span className="w-6 text-center font-bold text-xs text-white">
                              {p.partyLeaders}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleStepDelta(p.id, 'partyLeaders', 1, 0, 6)}
                              className="w-6 h-6 flex items-center justify-center font-bold text-xs"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 6. Sticky Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#0c0e14]/95 backdrop-blur-md border-t border-[#2b354d] p-3 sm:p-4 shadow-2xl">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
          {/* Back button */}
          <button
            type="button"
            onClick={() => {
              if (currentStep > 1) {
                onSetStep((currentStep - 1) as WalkthroughStep);
              } else {
                onBackToSetup();
              }
            }}
            className="px-4 py-3 rounded-xl bg-[#141824] hover:bg-[#1b2132] border border-[#2b354d] text-slate-300 font-rajdhani text-sm font-bold uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>{currentStep === 1 ? 'Match Setup' : 'Back'}</span>
          </button>

          {/* Next / Reveal button */}
          {currentStep < 4 ? (
            <button
              type="button"
              onClick={() => onSetStep((currentStep + 1) as WalkthroughStep)}
              className="flex-1 py-3 px-5 rounded-xl bg-gradient-to-r from-[#e2583e] to-[#f39c12] hover:from-[#f0684f] hover:to-[#ffb02e] text-white font-rajdhani text-sm sm:text-base font-bold uppercase tracking-wider shadow-lg shadow-[#e2583e]/25 flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <span>Next: {STEPS[currentStep].title}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onFinishScoring}
              className="flex-1 py-3 px-5 rounded-xl bg-gradient-to-r from-[#f39c12] via-[#e2583e] to-[#c0392b] hover:from-[#ffb02e] hover:to-[#d94838] text-white font-orbitron text-sm sm:text-base font-extrabold uppercase tracking-wider shadow-xl shadow-[#f39c12]/30 flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Trophy className="w-4 h-4 text-amber-300" />
              <span>Reveal Winner & Standings</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

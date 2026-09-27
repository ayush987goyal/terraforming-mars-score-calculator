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
import { triggerHaptic } from '../utils/haptics';
import { PlayerBadge } from './PlayerBadge';
import { Stepper } from './Stepper';

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
    onConfirmAndNext?: (val: number) => void;
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
    triggerHaptic(10);
    setOpenSpecial((prev) => ({ ...prev, [playerId]: !prev[playerId] }));
  };

  const toggleCardCalc = (playerId: string) => {
    triggerHaptic(10);
    setOpenCardCalc((prev) => ({ ...prev, [playerId]: !prev[playerId] }));
  };

  const handleStepDelta = (
    playerId: string,
    field: keyof Player,
    delta: number,
    min = 0,
    max = 300
  ) => {
    triggerHaptic(10);
    const player = players.find((p) => p.id === playerId);
    if (!player) return;
    const current = Number(player[field]) || 0;
    const next = Math.min(max, Math.max(min, current + delta));
    onUpdatePlayer(playerId, { [field]: next });
  };

  const handleApplyCardHelper = (playerId: string) => {
    triggerHaptic(15);
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

  // Keypad cycling helper: wires "Set & Next Player"
  const handleOpenKeypadWithCycling = (
    playerId: string,
    field: 'tr' | 'greeneries' | 'cityAdjacencies' | 'cardsVP' | 'megacredits'
  ) => {
    const playerIndex = players.findIndex((p) => p.id === playerId);
    const player = players[playerIndex];
    if (!player) return;

    const fieldConfig = {
      tr: {
        title: (p: Player) => `${p.name} — Final TR`,
        subtitle: (p: Player, idx: number) =>
          `Player ${idx + 1} of ${players.length} • ${p.corporation} • 1 TR = 1 VP`,
        min: 0,
        max: 200,
        allowNegative: false
      },
      greeneries: {
        title: (p: Player) => `${p.name} — Greeneries Owned`,
        subtitle: (p: Player, idx: number) =>
          `Player ${idx + 1} of ${players.length} • 1 VP per owned greenery tile`,
        min: 0,
        max: 100,
        allowNegative: false
      },
      cityAdjacencies: {
        title: (p: Player) => `${p.name} — City Adjacencies`,
        subtitle: (p: Player, idx: number) =>
          `Player ${idx + 1} of ${players.length} • 1 VP per adjacent greenery to owned cities`,
        min: 0,
        max: 150,
        allowNegative: false
      },
      cardsVP: {
        title: (p: Player) => `${p.name} — Cards VP`,
        subtitle: (p: Player, idx: number) =>
          `Player ${idx + 1} of ${players.length} • Sum of all card Victory Points`,
        min: -50,
        max: 200,
        allowNegative: true
      },
      megacredits: {
        title: (p: Player) => `${p.name} — MegaCredits Cash`,
        subtitle: (p: Player, idx: number) =>
          `Player ${idx + 1} of ${players.length} • Tiebreaker: Most M€ on hand wins ties`,
        min: 0,
        max: 300,
        allowNegative: false
      }
    }[field];

    onOpenKeypad({
      title: fieldConfig.title(player),
      subtitle: fieldConfig.subtitle(player, playerIndex),
      playerColor: player.color,
      value: Number(player[field]) || 0,
      min: fieldConfig.min,
      max: fieldConfig.max,
      allowNegative: fieldConfig.allowNegative,
      onConfirm: (val: number) => {
        onUpdatePlayer(player.id, { [field]: val });
      },
      onConfirmAndNext: (val: number) => {
        onUpdatePlayer(player.id, { [field]: val });
        const nextIndex = (playerIndex + 1) % players.length;
        const nextPlayer = players[nextIndex];
        handleOpenKeypadWithCycling(nextPlayer.id, field);
      }
    });
  };

  const STEPS = [
    { num: 1 as WalkthroughStep, title: 'Final TR', icon: '🌐', short: 'TR' },
    { num: 2 as WalkthroughStep, title: 'Milestones & Awards', icon: '🚩', short: 'Goals' },
    { num: 3 as WalkthroughStep, title: 'Greeneries & Cities', icon: '🌲', short: 'Board' },
    { num: 4 as WalkthroughStep, title: 'Cards & Turmoil', icon: '🃏', short: 'Cards' }
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-32 sm:pb-36 animate-in fade-in duration-200">
      {/* 1. Top Step Tracker */}
      <div className="bg-[#141824] border border-[#2b354d] rounded-2xl p-4 sm:p-5 shadow-xl">
        <div className="flex items-center justify-between text-xs text-slate-300 mb-3">
          <span className="font-bold uppercase tracking-wider text-[#e2583e]">
            Category {currentStep} of 4
          </span>
          <span className="italic">Scores veiled until reveal</span>
        </div>

        {/* Step Tabs Grid (44px+ Min Hit Targets) */}
        <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
          {STEPS.map((s) => {
            const isActive = currentStep === s.num;
            const isCompleted = currentStep > s.num;

            return (
              <button
                key={s.num}
                type="button"
                onClick={() => {
                  triggerHaptic(10);
                  onSetStep(s.num);
                }}
                className={`min-h-[48px] py-2 px-2 sm:px-3 rounded-xl border text-left transition flex flex-col sm:flex-row items-center sm:items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-[#e2583e]/25 to-[#f39c12]/20 border-[#e2583e] shadow-md shadow-[#e2583e]/20 ring-1 ring-[#e2583e]/50'
                    : isCompleted
                    ? 'bg-[#1b2132] border-emerald-500/40 text-emerald-400 hover:bg-[#222a3e]'
                    : 'bg-[#101420] border-[#232a3d] text-slate-300 hover:text-white'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    isActive
                      ? 'bg-[#e2583e] text-white shadow'
                      : isCompleted
                      ? 'bg-emerald-500 text-slate-950 font-black'
                      : 'bg-[#1b2132] text-slate-300'
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : s.num}
                </div>
                <div className="truncate text-center sm:text-left">
                  <div
                    className={`text-xs font-bold truncate ${
                      isActive ? 'text-white' : isCompleted ? 'text-emerald-300' : 'text-slate-300'
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
            <div className="flex items-center gap-3">
              <span className="text-2xl">🌐</span>
              <div>
                <h3 className="font-orbitron text-xl font-bold text-white tracking-wide">
                  Step 1: Final Terraform Rating (TR)
                </h3>
                <p className="text-xs text-slate-300">
                  1 VP per TR (starts at 20). Tap any number for keypad.
                </p>
              </div>
            </div>
          </div>

          {/* Player Input Rows */}
          <div className="space-y-3">
            {players.map((p) => (
              <div
                key={p.id}
                className="bg-[#141824] border border-[#2b354d] rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                {/* Player identity with High-Contrast Halo for Charcoal */}
                <div className="flex items-center gap-3">
                  <PlayerBadge color={p.color} size="md" />
                  <div>
                    <h4 className="font-bold text-base text-white">{p.name}</h4>
                    <p className="text-xs text-slate-300">{p.corporation}</p>
                  </div>
                </div>

                {/* TR Stepper & Keypad Button (44px+ hit targets) */}
                <div className="flex items-center justify-end gap-2 w-full sm:w-auto">
                  <span className="text-xs font-bold uppercase text-slate-300 mr-1 hidden sm:inline">
                    Final TR:
                  </span>
                  <div className="w-full sm:w-48">
                    <Stepper
                      value={p.tr}
                      min={0}
                      max={200}
                      step={1}
                      label="TR Points"
                      colorTheme="sky"
                      onValueChange={(val) => onUpdatePlayer(p.id, { tr: val })}
                      onOpenKeypad={() => handleOpenKeypadWithCycling(p.id, 'tr')}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Step 2: Milestones & Awards (44px Touch-Friendly Player Toggle Pills) */}
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
                <p className="text-xs text-slate-300">
                  Milestones: 5 VP each (max 3). Awards: 1st (5 VP), 2nd (2 VP).
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
                <p className="text-xs text-slate-300">
                  Max 3 claimed across all players.
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

            <div className="space-y-3">
              {milestones.map((m) => {
                const isClaimed = Boolean(m.claimedBy);
                const isLocked = isMilestoneLimitReached && !isClaimed;
                const claimedPlayer = players.find((p) => p.id === m.claimedBy);

                return (
                  <div
                    key={m.id}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-xl border transition ${
                      isClaimed
                        ? 'bg-amber-500/10 border-amber-500/50'
                        : 'bg-[#1b2132] border-[#2b354d]'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-sm text-white flex items-center gap-2">
                        <span>🚩 {m.name}</span>
                        {isClaimed && claimedPlayer && (
                          <PlayerBadge color={claimedPlayer.color} size="xs" />
                        )}
                      </div>
                      <div className="text-xs text-slate-300">{m.req}</div>
                    </div>

                    {/* Touch-Friendly 44px Player Toggle Pills for Milestones */}
                    <div className="flex flex-wrap items-center gap-2 pt-1 sm:pt-0">
                      {players.map((p) => {
                        const isThisPlayer = m.claimedBy === p.id;
                        return (
                          <button
                            key={p.id}
                            type="button"
                            disabled={isLocked && !isThisPlayer}
                            onClick={() => {
                              triggerHaptic(10);
                              onClaimMilestone(m.id, isThisPlayer ? '' : p.id);
                            }}
                            className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border transition cursor-pointer active:scale-95 ${
                              isThisPlayer
                                ? 'bg-amber-500/25 border-amber-400 text-white shadow-md ring-1 ring-amber-400/50 scale-[1.02]'
                                : isLocked
                                ? 'opacity-30 cursor-not-allowed border-transparent bg-[#101420] text-slate-500'
                                : 'bg-[#101420] hover:bg-[#1a2133] border-[#2b354d] text-slate-300'
                            }`}
                          >
                            <PlayerBadge color={p.color} size="xs" />
                            <span>{p.name}</span>
                            {isThisPlayer && (
                              <Check className="w-3.5 h-3.5 text-amber-300 stroke-[3]" />
                            )}
                          </button>
                        );
                      })}
                      {m.claimedBy && (
                        <button
                          type="button"
                          onClick={() => {
                            triggerHaptic(10);
                            onClaimMilestone(m.id, '');
                          }}
                          className="min-h-[44px] px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-[#101420] hover:bg-slate-800 border border-[#2b354d] transition cursor-pointer"
                          title="Clear milestone claim"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Part B: Awards Tracker (44px Touch-Friendly Player Toggle Pills) */}
          <div className="bg-[#141824] border border-[#2b354d] rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#232a3d]">
              <div>
                <h4 className="font-rajdhani text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <span>🎖️</span> Funded Awards
                </h4>
                <p className="text-xs text-slate-300">
                  1st = 5 VP, 2nd = 2 VP (2-player: 0 VP for 2nd).
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
                          onChange={(e) => {
                            triggerHaptic(10);
                            onSelectAward(a.slot, e.target.value);
                          }}
                          className="bg-[#101420] text-white border border-[#2b354d] focus:border-[#e2583e] rounded-lg px-3 py-2 text-xs outline-none w-full max-w-xs min-h-[40px] cursor-pointer"
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
                        <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-orange-500/20 text-orange-300 border border-orange-500/40">
                          Active
                        </span>
                      )}
                    </div>

                    {a.funded && a.awardId && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        {/* 1st Place Touch-Friendly 44px Player Toggle Pills */}
                        <div className="bg-[#101420] p-3.5 rounded-xl border border-[#232a3d]">
                          <div className="flex items-center justify-between text-xs font-bold text-[#f1c40f] uppercase tracking-wider pb-2 mb-2.5 border-b border-[#232a3d]">
                            <span>🥇 1st Place (5 VP)</span>
                            {is1stTied && (
                              <span className="text-xs font-bold text-amber-300 bg-amber-400/20 px-2 py-0.5 rounded">
                                Tied (5 VP each)
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            {players.map((p) => {
                              const checked = (a.firstPlace || []).includes(p.id);
                              return (
                                <button
                                  key={p.id}
                                  type="button"
                                  onClick={() => {
                                    triggerHaptic(10);
                                    onToggleFirstPlace(a.slot, p.id);
                                  }}
                                  className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border transition cursor-pointer active:scale-95 ${
                                    checked
                                      ? 'bg-amber-500/25 border-amber-400 text-white shadow-md ring-1 ring-amber-400/50 scale-[1.02]'
                                      : 'bg-[#141824] hover:bg-[#1a2133] border-[#2b354d] text-slate-300'
                                  }`}
                                >
                                  <PlayerBadge color={p.color} size="xs" />
                                  <span>{p.name}</span>
                                  {checked && (
                                    <Check className="w-3.5 h-3.5 text-amber-300 stroke-[3]" />
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* 2nd Place Touch-Friendly 44px Player Toggle Pills */}
                        <div className="bg-[#101420] p-3.5 rounded-xl border border-[#232a3d]">
                          <div className="flex items-center justify-between text-xs font-bold text-slate-300 uppercase tracking-wider pb-2 mb-2.5 border-b border-[#232a3d]">
                            <span>🥈 2nd Place (2 VP)</span>
                            {is1stTied ? (
                              <span className="text-xs font-bold text-red-400 bg-red-500/20 px-2 py-0.5 rounded">
                                Cancelled
                              </span>
                            ) : is2Player ? (
                              <span className="text-xs font-bold text-slate-400 bg-slate-500/20 px-2 py-0.5 rounded">
                                0 VP (2p)
                              </span>
                            ) : null}
                          </div>

                          <div>
                            {is1stTied ? (
                              <div className="text-xs text-red-400 py-1.5 font-medium">
                                ⚠️ 1st place tie gives 5 VP to each and cancels 2nd place.
                              </div>
                            ) : is2Player ? (
                              <div className="text-xs text-slate-300 py-1.5 font-medium">
                                ℹ️ In 2-player games, 2nd place receives 0 VP per official rules.
                              </div>
                            ) : (
                              <div className="flex flex-wrap items-center gap-2">
                                {players.map((p) => {
                                  const isFirst = (a.firstPlace || []).includes(p.id);
                                  const checked = (a.secondPlace || []).includes(p.id);

                                  return (
                                    <button
                                      key={p.id}
                                      type="button"
                                      disabled={isFirst}
                                      onClick={() => {
                                        triggerHaptic(10);
                                        onToggleSecondPlace(a.slot, p.id);
                                      }}
                                      className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border transition cursor-pointer active:scale-95 ${
                                        checked
                                          ? 'bg-slate-700/40 border-slate-300 text-white shadow-md ring-1 ring-slate-300/50 scale-[1.02]'
                                          : isFirst
                                          ? 'opacity-30 cursor-not-allowed border-transparent bg-[#141824] text-slate-500'
                                          : 'bg-[#141824] hover:bg-[#1a2133] border-[#2b354d] text-slate-300'
                                      }`}
                                    >
                                      <PlayerBadge color={p.color} size="xs" />
                                      <span>{p.name}</span>
                                      {checked && (
                                        <Check className="w-3.5 h-3.5 text-slate-200 stroke-[3]" />
                                      )}
                                    </button>
                                  );
                                })}
                              </div>
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

      {/* 4. Step 3: Board Greeneries & Cities (44px Steppers & Keypad) */}
      {currentStep === 3 && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="bg-[#141824] border border-[#2b354d] rounded-2xl p-5 shadow-xl">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">🌲</span>
              <div>
                <h3 className="font-orbitron text-xl font-bold text-white tracking-wide">
                  Step 3: Board Greeneries & Cities
                </h3>
                <p className="text-xs text-slate-300">
                  1 VP per owned greenery. Cities score 1 VP per adjacent greenery.
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
                  {/* Player header with Halo */}
                  <div className="flex items-center justify-between pb-3 border-b border-[#232a3d]">
                    <div className="flex items-center gap-2.5">
                      <PlayerBadge color={p.color} size="sm" />
                      <h4 className="font-bold text-base text-white">{p.name}</h4>
                      <span className="text-xs text-slate-300">({p.corporation})</span>
                    </div>
                  </div>

                  {/* Input Grid: Greeneries & City Adjacencies */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Greeneries (44px Stepper) */}
                    <div className="bg-[#101420] border border-[#232a3d] rounded-xl p-3.5 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span>🌲</span> Greeneries Owned
                        </span>
                        <span className="text-xs text-slate-300 font-medium">1 VP each</span>
                      </div>

                      <Stepper
                        value={p.greeneries}
                        min={0}
                        max={100}
                        step={1}
                        unit="Tiles"
                        colorTheme="emerald"
                        onValueChange={(val) => onUpdatePlayer(p.id, { greeneries: val })}
                        onOpenKeypad={() => handleOpenKeypadWithCycling(p.id, 'greeneries')}
                      />
                    </div>

                    {/* City Adjacencies (44px Stepper) */}
                    <div className="bg-[#101420] border border-[#232a3d] rounded-xl p-3.5 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span>🏙️</span> City Adjacencies
                        </span>
                        <span className="text-xs text-slate-300 font-medium">1 VP per adj. greenery</span>
                      </div>

                      <Stepper
                        value={p.cityAdjacencies}
                        min={0}
                        max={150}
                        step={1}
                        unit="Adjacencies"
                        colorTheme="slate"
                        onValueChange={(val) => onUpdatePlayer(p.id, { cityAdjacencies: val })}
                        onOpenKeypad={() => handleOpenKeypadWithCycling(p.id, 'cityAdjacencies')}
                      />
                    </div>
                  </div>

                  {/* Special Tiles Drawer (Capital & Commercial District) */}
                  <div className="bg-[#101420] border border-[#232a3d] rounded-xl p-3.5">
                    <button
                      type="button"
                      onClick={() => toggleSpecial(p.id)}
                      className="min-h-[44px] flex items-center justify-between w-full text-xs font-semibold text-sky-400 hover:text-sky-300 cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <span>🌟</span>
                        <span>Special Tiles (Capital & Commercial)</span>
                        {(p.hasCapital || p.hasCommercialDistrict) && (
                          <span className="text-xs font-bold text-amber-300 bg-amber-400/20 px-2 py-0.5 rounded">
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
                      <div className="mt-3 pt-3 border-t border-dashed border-[#2b354d] space-y-3.5">
                        {/* Capital */}
                        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                          <label className="flex items-center gap-2.5 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={p.hasCapital}
                              onChange={(e) => {
                                triggerHaptic(10);
                                onUpdatePlayer(p.id, { hasCapital: e.target.checked });
                              }}
                              className="accent-[#e2583e] w-5 h-5 cursor-pointer"
                            />
                            <span className="text-white font-medium">Capital (+1 VP per ocean adjacent)</span>
                          </label>

                          {p.hasCapital && (
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-slate-300">Oceans:</span>
                              <div className="flex items-center bg-[#1b2132] border border-[#2b354d] rounded-xl p-1 gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleStepDelta(p.id, 'capitalOceans', -1, 0, 9)}
                                  className="min-w-[36px] min-h-[36px] w-9 h-9 rounded-lg bg-[#101420] text-slate-200 hover:text-white flex items-center justify-center font-bold text-sm cursor-pointer"
                                >
                                  -
                                </button>
                                <span className="w-7 text-center font-orbitron font-bold text-sm text-sky-400">
                                  {p.capitalOceans}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleStepDelta(p.id, 'capitalOceans', 1, 0, 9)}
                                  className="min-w-[36px] min-h-[36px] w-9 h-9 rounded-lg bg-[#101420] text-slate-200 hover:text-white flex items-center justify-center font-bold text-sm cursor-pointer"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Commercial District */}
                        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                          <label className="flex items-center gap-2.5 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={p.hasCommercialDistrict}
                              onChange={(e) => {
                                triggerHaptic(10);
                                onUpdatePlayer(p.id, {
                                  hasCommercialDistrict: e.target.checked
                                });
                              }}
                              className="accent-[#e2583e] w-5 h-5 cursor-pointer"
                            />
                            <span className="text-white font-medium">Commercial District (+1 VP per city)</span>
                          </label>

                          {p.hasCommercialDistrict && (
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-slate-300">Cities:</span>
                              <div className="flex items-center bg-[#1b2132] border border-[#2b354d] rounded-xl p-1 gap-1">
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleStepDelta(p.id, 'commercialCities', -1, 0, 6)
                                  }
                                  className="min-w-[36px] min-h-[36px] w-9 h-9 rounded-lg bg-[#101420] text-slate-200 hover:text-white flex items-center justify-center font-bold text-sm cursor-pointer"
                                >
                                  -
                                </button>
                                <span className="w-7 text-center font-orbitron font-bold text-sm text-sky-400">
                                  {p.commercialCities}
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleStepDelta(p.id, 'commercialCities', 1, 0, 6)
                                  }
                                  className="min-w-[36px] min-h-[36px] w-9 h-9 rounded-lg bg-[#101420] text-slate-200 hover:text-white flex items-center justify-center font-bold text-sm cursor-pointer"
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

      {/* 5. Step 4: Cards VP & Turmoil (44px Steppers & Keypad) */}
      {currentStep === 4 && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="bg-[#141824] border border-[#2b354d] rounded-2xl p-5 shadow-xl">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">🃏</span>
              <div>
                <h3 className="font-orbitron text-xl font-bold text-white tracking-wide">
                  Step 4: Cards VP & Turmoil
                </h3>
                <p className="text-xs text-slate-300">
                  Cards VP and tiebreaker cash (M€). Chairman & Leaders if Turmoil active.
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
                  {/* Player header with Halo */}
                  <div className="flex items-center justify-between pb-3 border-b border-[#232a3d]">
                    <div className="flex items-center gap-2.5">
                      <PlayerBadge color={p.color} size="sm" />
                      <h4 className="font-bold text-base text-white">{p.name}</h4>
                      <span className="text-xs text-slate-300">({p.corporation})</span>
                    </div>
                  </div>

                  {/* Cards VP & Tiebreaker Cash */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Cards VP (44px Stepper) */}
                    <div className="bg-[#101420] border border-[#232a3d] rounded-xl p-3.5 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span>🃏</span> Cards VP Total
                        </span>
                        <span className="text-xs text-slate-300 font-medium">Fixed & Variable</span>
                      </div>

                      <Stepper
                        value={p.cardsVP}
                        min={-50}
                        max={200}
                        step={1}
                        unit="Points"
                        colorTheme="purple"
                        onValueChange={(val) => onUpdatePlayer(p.id, { cardsVP: val })}
                        onOpenKeypad={() => handleOpenKeypadWithCycling(p.id, 'cardsVP')}
                      />
                    </div>

                    {/* Tiebreaker: MegaCredits Cash (44px Stepper) */}
                    <div className="bg-[#101420] border border-[#232a3d] rounded-xl p-3.5 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#f39c12] flex items-center gap-1.5">
                          <span>💰</span> M€ Cash (Tiebreaker)
                        </span>
                        <span className="text-xs text-slate-300 font-medium">Most cash wins ties</span>
                      </div>

                      <Stepper
                        value={p.megacredits}
                        min={0}
                        max={300}
                        step={1}
                        unit="Cash"
                        colorTheme="amber"
                        onValueChange={(val) => onUpdatePlayer(p.id, { megacredits: val })}
                        onOpenKeypad={() => handleOpenKeypadWithCycling(p.id, 'megacredits')}
                      />
                    </div>
                  </div>

                  {/* Card Breakdown Helper Drawer */}
                  <div className="bg-[#101420] border border-[#232a3d] rounded-xl p-3.5">
                    <button
                      type="button"
                      onClick={() => toggleCardCalc(p.id)}
                      className="min-h-[44px] flex items-center justify-between w-full text-xs font-semibold text-purple-400 hover:text-purple-300 cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <Calculator className="w-4 h-4" />
                        <span>Card VP Helper (Fixed / Bio / Jovian)</span>
                      </span>
                      {hasCardCalc ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>

                    {hasCardCalc && (
                      <div className="mt-3 pt-3 border-t border-dashed border-[#2b354d] space-y-3 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-300 font-medium">Fixed (+/-) Card VP:</span>
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
                            className="w-20 min-h-[40px] bg-[#1b2132] border border-[#2b354d] rounded-lg px-2.5 py-1.5 text-center text-white font-bold"
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-slate-300 font-medium">Animal / Microbe / Floater VP:</span>
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
                            className="w-20 min-h-[40px] bg-[#1b2132] border border-[#2b354d] rounded-lg px-2.5 py-1.5 text-center text-white font-bold"
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-slate-300 font-medium">Jovian Multipliers VP:</span>
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
                            className="w-20 min-h-[40px] bg-[#1b2132] border border-[#2b354d] rounded-lg px-2.5 py-1.5 text-center text-white font-bold"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => handleApplyCardHelper(p.id)}
                          className="min-h-[44px] w-full mt-2 py-2.5 rounded-xl bg-purple-700/40 hover:bg-purple-700/60 border border-purple-500/50 text-white font-bold text-xs uppercase tracking-wider transition cursor-pointer"
                        >
                          Apply Sum to Cards VP ({Number(calc.fixed) + Number(calc.resources) + Number(calc.jovian)} VP)
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Turmoil Inputs (if enabled) */}
                  {settings.turmoil && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="font-semibold text-red-300 text-xs flex items-center gap-1.5">
                          <span>🏛️</span> Turmoil Positions
                        </div>
                        <div className="text-xs text-slate-300">
                          Chairman (1 VP) + Party Leaders (1 VP each)
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-2 text-xs text-white cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={p.isChairman}
                            onChange={(e) => {
                              triggerHaptic(10);
                              onUpdatePlayer(p.id, { isChairman: e.target.checked });
                            }}
                            className="accent-[#e2583e] w-5 h-5 cursor-pointer"
                          />
                          <span className="font-medium">Chairman</span>
                        </label>

                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-slate-300">Leaders:</span>
                          <div className="flex items-center bg-[#101420] border border-[#2b354d] rounded-xl p-1 gap-1">
                            <button
                              type="button"
                              onClick={() => handleStepDelta(p.id, 'partyLeaders', -1, 0, 6)}
                              className="min-w-[36px] min-h-[36px] w-9 h-9 rounded-lg bg-[#1b2132] text-slate-200 hover:text-white flex items-center justify-center font-bold text-sm cursor-pointer"
                            >
                              -
                            </button>
                            <span className="w-7 text-center font-orbitron font-bold text-sm text-white">
                              {p.partyLeaders}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleStepDelta(p.id, 'partyLeaders', 1, 0, 6)}
                              className="min-w-[36px] min-h-[36px] w-9 h-9 rounded-lg bg-[#1b2132] text-slate-200 hover:text-white flex items-center justify-center font-bold text-sm cursor-pointer"
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

      {/* 6. Sticky Bottom Navigation Bar (with Safe Area Inset) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#0c0e14]/95 backdrop-blur-md border-t border-[#2b354d] p-3 sm:p-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-2xl">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
          {/* Back button */}
          <button
            type="button"
            onClick={() => {
              triggerHaptic(10);
              if (currentStep > 1) {
                onSetStep((currentStep - 1) as WalkthroughStep);
              } else {
                onBackToSetup();
              }
            }}
            className="min-h-[48px] px-4 py-3 rounded-xl bg-[#141824] hover:bg-[#1b2132] border border-[#2b354d] text-slate-300 font-rajdhani text-sm font-bold uppercase tracking-wider flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>{currentStep === 1 ? 'Match Setup' : 'Back'}</span>
          </button>

          {/* Next / Reveal button */}
          {currentStep < 4 ? (
            <button
              type="button"
              onClick={() => {
                triggerHaptic(15);
                onSetStep((currentStep + 1) as WalkthroughStep);
              }}
              className="flex-1 min-h-[48px] py-3 px-5 rounded-xl bg-gradient-to-r from-[#e2583e] to-[#f39c12] hover:from-[#f0684f] hover:to-[#ffb02e] text-white font-rajdhani text-sm sm:text-base font-bold uppercase tracking-wider shadow-lg shadow-[#e2583e]/25 flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer"
            >
              <span>Next: {STEPS[currentStep].title}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                triggerHaptic(20);
                onFinishScoring();
              }}
              className="flex-1 min-h-[48px] py-3 px-5 rounded-xl bg-gradient-to-r from-[#f39c12] via-[#e2583e] to-[#c0392b] hover:from-[#ffb02e] hover:to-[#d94838] text-white font-orbitron text-sm sm:text-base font-extrabold uppercase tracking-wider shadow-xl shadow-[#f39c12]/30 flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer"
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

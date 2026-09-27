import React, { useState } from 'react';
import { PlayerResult, GameSettings } from '../types';
import { ScoreCompositionBars } from './ScoreCompositionBars';
import {
  Trophy,
  Copy,
  RotateCcw,
  Edit3,
  ChevronDown,
  ChevronUp,
  Award
} from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';
import { PlayerBadge } from './PlayerBadge';

interface ScreenPodiumProps {
  results: PlayerResult[];
  settings: GameSettings;
  onCopyReport: () => void;
  onEditScores: () => void;
  onNewGame: () => void;
}

export const ScreenPodium: React.FC<ScreenPodiumProps> = ({
  results,
  settings,
  onCopyReport,
  onEditScores,
  onNewGame
}) => {
  const [breakdownOpen, setBreakdownOpen] = useState(false);

  if (results.length === 0) return null;

  const winner = results[0];
  const second = results.length > 1 ? results[1] : null;
  const third = results.length > 2 ? results[2] : null;

  const tiedWinners = results.filter((r) => r.rank === 1);
  const isCoWinners = tiedWinners.length > 1;

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-28 sm:pb-32 animate-in fade-in zoom-in-95 duration-300">
      {/* 1. Winner Spotlight Banner */}
      <div className="bg-gradient-to-r from-[#f39c12]/20 via-[#e2583e]/20 to-[#f39c12]/20 border-2 border-[#f39c12]/50 rounded-2xl p-5 sm:p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#f1c40f]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#f1c40f] to-[#d35400] flex items-center justify-center text-3xl shadow-lg shadow-[#f1c40f]/30 select-none flex-shrink-0 animate-bounce">
              {isCoWinners ? '🤝' : '🏆'}
            </div>

            <div>
              <div className="text-xs uppercase tracking-widest font-extrabold text-[#f7dc6f] mb-0.5">
                {isCoWinners ? 'Co-Winners (Tie)' : 'Match Champion'}
              </div>

              {isCoWinners ? (
                <div>
                  <h2 className="font-orbitron text-2xl sm:text-3xl font-black text-white">
                    {tiedWinners.map((w) => w.name).join(' & ')}
                  </h2>
                  <div className="inline-block bg-[#f1c40f]/20 border border-[#f1c40f]/60 text-[#f7dc6f] text-xs font-bold px-2.5 py-0.5 rounded-full mt-1.5">
                    Identical {winner.totalVP} VP & {winner.megacredits} M€ Cash
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-2">
                    <PlayerBadge color={winner.color} size="sm" />
                    <h2 className="font-orbitron text-2xl sm:text-3xl font-black text-white tracking-wide">
                      {winner.name}
                    </h2>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">{winner.corporation}</p>

                  {winner.tiebreakWon && second && (
                    <div className="inline-flex items-center gap-1.5 bg-[#f1c40f]/20 border border-[#f1c40f]/60 text-[#f7dc6f] text-xs font-bold px-2.5 py-1 rounded-full mt-2 shadow-sm animate-pulse">
                      <span>⚡</span>
                      <span>
                        Won via Tiebreaker: +{winner.megacredits - second.megacredits} M€ cash ({winner.megacredits} vs {second.megacredits} M€)
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="text-right">
            <div className="font-orbitron text-5xl sm:text-6xl font-black text-[#f1c40f] drop-shadow-[0_0_20px_rgba(241,196,15,0.5)] leading-none">
              {winner.totalVP}
            </div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mt-1">
              Victory Points
            </div>
          </div>
        </div>
      </div>

      {/* 2. Tabletop Podium (1st, 2nd, 3rd) */}
      <div className="bg-[#141824] border border-[#2b354d] rounded-2xl p-5 sm:p-6 shadow-xl">
        <div className="text-center mb-6">
          <h3 className="font-orbitron text-lg font-bold text-white uppercase tracking-wider flex items-center justify-center gap-2">
            <span>🎖️</span> Official Post-Game Podium
          </h3>
          <p className="text-xs text-slate-300 mt-0.5">
            Final standings with cash tiebreaker resolution
          </p>
        </div>

        {/* Podium Pillars Layout */}
        <div className="flex items-end justify-center gap-2 sm:gap-4 pt-8 pb-4 border-b border-[#232a3d]">
          {/* 2nd Place (Silver) */}
          {second && (
            <div className="flex-1 max-w-[170px] flex flex-col items-center text-center animate-in fade-in slide-in-from-bottom-6 duration-300 delay-100">
              {/* Player Info Badge */}
              <div className="mb-2 w-full px-1">
                <span className="text-2xl select-none">🥈</span>
                <div className="font-bold text-xs sm:text-sm text-white truncate flex items-center justify-center gap-1.5">
                  <PlayerBadge color={second.color} size="xs" />
                  <span>{second.name}</span>
                </div>
                <div className="text-xs text-slate-300 truncate">{second.corporation}</div>
                <div className="font-orbitron font-black text-slate-200 text-lg sm:text-xl mt-0.5">
                  {second.totalVP} <span className="text-xs font-normal text-slate-400">VP</span>
                </div>
                <div className="text-xs font-semibold text-amber-400">
                  {second.megacredits} M€
                </div>
              </div>

              {/* Pedestal */}
              <div className="w-full h-32 sm:h-36 rounded-t-xl bg-gradient-to-t from-slate-900 to-slate-700/80 border-t-2 border-x-2 border-slate-400/50 shadow-lg flex flex-col items-center justify-start pt-3 relative overflow-hidden">
                <div
                  className="w-full h-2 absolute top-0"
                  style={{ backgroundColor: second.color }}
                />
                <span className="font-orbitron text-2xl sm:text-3xl font-black text-slate-300">
                  2
                </span>
                <span className="text-xs uppercase font-bold tracking-wider text-slate-300 mt-1">
                  Silver
                </span>
              </div>
            </div>
          )}

          {/* 1st Place (Gold) - Elevated in Center */}
          <div className="flex-1 max-w-[190px] flex flex-col items-center text-center animate-in fade-in slide-in-from-bottom-8 duration-300">
            {/* Player Info Badge */}
            <div className="mb-2 w-full px-1">
              <span className="text-3xl select-none drop-shadow-[0_0_10px_rgba(241,196,15,0.6)]">
                👑
              </span>
              <div className="font-bold text-sm sm:text-base text-white truncate flex items-center justify-center gap-1.5">
                <PlayerBadge color={winner.color} size="xs" />
                <span>{winner.name}</span>
                {winner.tiebreakWon && <span title="Won on tiebreaker">⭐</span>}
              </div>
              <div className="text-xs text-slate-300 truncate">{winner.corporation}</div>
              <div className="font-orbitron font-black text-[#f1c40f] text-2xl sm:text-3xl mt-0.5 drop-shadow-[0_0_10px_rgba(241,196,15,0.4)]">
                {winner.totalVP} <span className="text-xs font-normal text-slate-400">VP</span>
              </div>
              <div className="text-xs font-bold text-amber-400">
                {winner.megacredits} M€ cash
              </div>
            </div>

            {/* Pedestal */}
            <div className="w-full h-44 sm:h-48 rounded-t-xl bg-gradient-to-t from-amber-950/80 to-[#f39c12]/80 border-t-2 border-x-2 border-[#f1c40f] shadow-2xl shadow-[#f1c40f]/20 flex flex-col items-center justify-start pt-3 relative overflow-hidden ring-1 ring-[#f1c40f]/40">
              <div
                className="w-full h-2.5 absolute top-0"
                style={{ backgroundColor: winner.color }}
              />
              <span className="font-orbitron text-3xl sm:text-4xl font-black text-white drop-shadow">
                1
              </span>
              <span className="text-xs uppercase font-extrabold tracking-wider text-amber-200 mt-1">
                Champion
              </span>
            </div>
          </div>

          {/* 3rd Place (Bronze) */}
          {third && (
            <div className="flex-1 max-w-[170px] flex flex-col items-center text-center animate-in fade-in slide-in-from-bottom-4 duration-300 delay-200">
              {/* Player Info Badge */}
              <div className="mb-2 w-full px-1">
                <span className="text-2xl select-none">🥉</span>
                <div className="font-bold text-xs sm:text-sm text-white truncate flex items-center justify-center gap-1.5">
                  <PlayerBadge color={third.color} size="xs" />
                  <span>{third.name}</span>
                </div>
                <div className="text-xs text-slate-300 truncate">{third.corporation}</div>
                <div className="font-orbitron font-black text-amber-600 text-lg sm:text-xl mt-0.5">
                  {third.totalVP} <span className="text-xs font-normal text-slate-400">VP</span>
                </div>
                <div className="text-xs font-semibold text-amber-400">
                  {third.megacredits} M€
                </div>
              </div>

              {/* Pedestal */}
              <div className="w-full h-24 sm:h-28 rounded-t-xl bg-gradient-to-t from-stone-900 to-amber-950/70 border-t-2 border-x-2 border-amber-700/50 shadow-md flex flex-col items-center justify-start pt-2 relative overflow-hidden">
                <div
                  className="w-full h-2 absolute top-0"
                  style={{ backgroundColor: third.color }}
                />
                <span className="font-orbitron text-2xl sm:text-3xl font-black text-amber-500">
                  3
                </span>
                <span className="text-xs uppercase font-bold tracking-wider text-amber-500 mt-0.5">
                  Bronze
                </span>
              </div>
            </div>
          )}
        </div>

        {/* 3. Clean Ranked Leaderboard Table */}
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#232a3d] text-xs uppercase tracking-wider text-slate-300">
                <th className="py-2.5 px-3 text-center w-12">Rank</th>
                <th className="py-2.5 px-3">Player & Corporation</th>
                <th className="py-2.5 px-3 text-center">Total VP</th>
                <th className="py-2.5 px-3 text-right">Cash (Tiebreak)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2638]">
              {results.map((r) => {
                const medal =
                  r.rank === 1 ? '🥇 1' : r.rank === 2 ? '🥈 2' : r.rank === 3 ? '🥉 3' : `#${r.rank}`;

                return (
                  <tr
                    key={r.id}
                    className={`transition hover:bg-[#1a2133] ${
                      r.isWinner ? 'bg-[#f1c40f]/5' : ''
                    }`}
                  >
                    <td className="py-3 px-3 text-center font-bold">
                      <span
                        className={
                          r.rank === 1
                            ? 'text-[#f1c40f]'
                            : r.rank === 2
                            ? 'text-slate-300'
                            : r.rank === 3
                            ? 'text-amber-500'
                            : 'text-slate-400'
                        }
                      >
                        {medal}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <PlayerBadge color={r.color} size="sm" />
                        <div>
                          <div className="font-bold text-white flex items-center gap-1.5">
                            <span>{r.name}</span>
                            {r.tiebreakWon && (
                              <span
                                title="Won tiebreaker on MegaCredits cash"
                                className="text-amber-400 text-xs"
                              >
                                ⭐
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-300">{r.corporation}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="font-orbitron font-extrabold text-xl text-white">
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

        {/* 4. Expandable 'Full Point Breakdown' Drawer */}
        <div className="mt-6 pt-4 border-t border-[#232a3d]">
          <button
            type="button"
            onClick={() => {
              triggerHaptic(10);
              setBreakdownOpen(!breakdownOpen);
            }}
            className="w-full min-h-[44px] flex items-center justify-between p-3.5 rounded-xl bg-[#1b2132] hover:bg-[#222a3e] border border-[#2b354d] text-white font-rajdhani text-sm font-bold uppercase tracking-wider transition cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Award className="w-4 h-4 text-sky-400" />
              <span>Full Point Breakdown & Category Details</span>
            </span>
            {breakdownOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {breakdownOpen && (
            <div className="mt-4 space-y-4 animate-in fade-in duration-200">
              {/* Category Breakdown Matrix */}
              <div className="overflow-x-auto rounded-xl border border-[#2b354d]">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#1b2132] text-slate-300 uppercase font-bold border-b border-[#2b354d]">
                    <tr>
                      <th className="py-2.5 px-3">Player</th>
                      <th className="py-2.5 px-2 text-center text-sky-400">TR</th>
                      <th className="py-2.5 px-2 text-center text-amber-300">Milestones</th>
                      <th className="py-2.5 px-2 text-center text-orange-400">Awards</th>
                      <th className="py-2.5 px-2 text-center text-emerald-400">Greeneries</th>
                      <th className="py-2.5 px-2 text-center text-slate-300">Cities</th>
                      <th className="py-2.5 px-2 text-center text-purple-300">Cards</th>
                      {settings.turmoil && (
                        <th className="py-2.5 px-2 text-center text-red-300">Turmoil</th>
                      )}
                      <th className="py-2.5 px-3 text-center text-white font-extrabold">Total VP</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1e2638] bg-[#141824]">
                    {results.map((r) => (
                      <tr key={r.id}>
                        <td className="py-2.5 px-3 font-semibold text-white flex items-center gap-2">
                          <PlayerBadge color={r.color} size="xs" />
                          <span>{r.name}</span>
                        </td>
                        <td className="py-2.5 px-2 text-center font-bold text-sky-300">{r.tr}</td>
                        <td className="py-2.5 px-2 text-center font-bold text-amber-300">
                          {r.milestonesVP}
                        </td>
                        <td className="py-2.5 px-2 text-center font-bold text-orange-300">
                          {r.awardsVP}
                        </td>
                        <td className="py-2.5 px-2 text-center font-bold text-emerald-300">
                          {r.greeneryVP}
                        </td>
                        <td className="py-2.5 px-2 text-center font-bold text-slate-300">
                          {r.citiesVP}
                        </td>
                        <td className="py-2.5 px-2 text-center font-bold text-purple-300">
                          {r.cardsVP}
                        </td>
                        {settings.turmoil && (
                          <td className="py-2.5 px-2 text-center font-bold text-red-300">
                            {r.turmoilVP}
                          </td>
                        )}
                        <td className="py-2.5 px-3 text-center font-orbitron font-bold text-white">
                          {r.totalVP}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Composition Stacked Bars */}
              <ScoreCompositionBars results={results} turmoilEnabled={settings.turmoil} />
            </div>
          )}
        </div>
      </div>

      {/* Sticky Bottom Action Bar with Safe Area Inset */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#0c0e14]/95 backdrop-blur-md border-t border-[#2b354d] p-3 sm:p-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-2xl">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-2.5">
          <button
            type="button"
            onClick={() => {
              triggerHaptic(10);
              onEditScores();
            }}
            className="min-h-[48px] px-4 py-3 rounded-xl bg-[#1b2132] hover:bg-[#252e46] active:scale-95 border border-[#2b354d] text-slate-200 font-rajdhani text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition cursor-pointer"
            title="Return to walkthrough to tweak any values"
          >
            <Edit3 className="w-4 h-4 text-slate-400" />
            <span className="hidden sm:inline">Edit Scores</span>
            <span className="sm:hidden">Edit</span>
          </button>

          <button
            type="button"
            onClick={() => {
              triggerHaptic(10);
              onCopyReport();
            }}
            className="flex-1 min-h-[48px] py-3 px-4 rounded-xl bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-500 hover:to-blue-600 active:scale-95 text-white font-rajdhani text-sm sm:text-base font-bold uppercase tracking-wider shadow-lg shadow-sky-600/25 flex items-center justify-center gap-2 transition cursor-pointer"
            title="Copy markdown report for Discord, Slack, or SMS"
          >
            <Copy className="w-4 h-4" />
            <span>Copy Match Report</span>
          </button>

          <button
            type="button"
            onClick={() => {
              triggerHaptic(10);
              onNewGame();
            }}
            className="min-h-[48px] px-3.5 py-3 rounded-xl bg-[#231515] hover:bg-red-950/70 active:scale-95 border border-red-800/40 text-red-200 font-rajdhani text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition cursor-pointer"
            title="Start a new game"
          >
            <RotateCcw className="w-4 h-4 text-red-400" />
            <span className="hidden sm:inline">New Game</span>
          </button>
        </div>
      </div>
    </div>
  );
};

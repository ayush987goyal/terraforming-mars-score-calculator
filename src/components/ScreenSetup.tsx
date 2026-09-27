import React from 'react';
import { GameState, BoardType, Player } from '../types';
import { CORPORATIONS, COLOR_PALETTE } from '../data/gameData';
import { ArrowRight, ShieldCheck, Layers, Users, Check } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';
import { PlayerBadge, isCharcoalOrDark } from './PlayerBadge';

interface ScreenSetupProps {
  gameState: GameState;
  onSetPlayerCount: (count: number) => void;
  onUpdatePlayer: (id: string, updates: Partial<Player>) => void;
  onToggleTurmoil: (enabled: boolean) => void;
  onToggleVenus: (enabled: boolean) => void;
  onSelectBoard: (board: BoardType) => void;
  onStartScoring: () => void;
}

export const ScreenSetup: React.FC<ScreenSetupProps> = ({
  gameState,
  onSetPlayerCount,
  onUpdatePlayer,
  onToggleTurmoil,
  onToggleVenus,
  onSelectBoard,
  onStartScoring
}) => {
  const { numPlayers, players, settings, boardMilestones } = gameState;

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-28 sm:pb-32 animate-in fade-in duration-200">
      {/* Hero Welcome & Quick Setup Header */}
      <div className="bg-[#141824] border border-[#2b354d] rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-gradient-to-br from-[#e2583e]/20 to-transparent rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#e2583e] bg-[#e2583e]/15 px-2.5 py-1 rounded-full border border-[#e2583e]/30">
              Screen 1 of 3
            </span>
            <span className="text-xs text-slate-300 font-medium">Setup</span>
          </div>
        </div>

        <h2 className="font-orbitron text-2xl sm:text-3xl font-extrabold text-white tracking-wide">
          Match Setup
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
          Set player count, colors, board map, and active expansions.
        </p>

        {/* 1. Minimalist Player Count Selector (44px+ Hit Targets) */}
        <div className="mt-6 pt-5 border-t border-[#232a3d]">
          <div className="flex items-center justify-between gap-2 mb-3">
            <label className="text-xs font-bold uppercase tracking-wider text-[#f0f3f8] flex items-center gap-2">
              <Users className="w-4 h-4 text-[#e2583e]" />
              <span>Player Count</span>
            </label>
            <span className="text-xs text-slate-300 font-semibold">{numPlayers} Players</span>
          </div>

          <div className="grid grid-cols-5 gap-2 sm:gap-3 bg-[#101420] p-1.5 rounded-xl border border-[#232a3d]">
            {[1, 2, 3, 4, 5].map((cnt) => {
              const isSelected = numPlayers === cnt;
              return (
                <button
                  key={cnt}
                  type="button"
                  onClick={() => {
                    triggerHaptic(10);
                    onSetPlayerCount(cnt);
                  }}
                  className={`min-h-[48px] py-2.5 sm:py-3 rounded-lg font-orbitron font-extrabold text-base sm:text-lg transition cursor-pointer flex items-center justify-center ${
                    isSelected
                      ? 'bg-gradient-to-r from-[#e2583e] to-[#f39c12] text-white shadow-lg shadow-[#e2583e]/30 scale-[1.02]'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {cnt}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Clean Player Names & Touch-Friendly Color Selection */}
      <div className="bg-[#141824] border border-[#2b354d] rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#232a3d]">
          <h3 className="font-rajdhani text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <span>👥</span> Players & Corporations
          </h3>
          <span className="text-xs text-slate-300">Tap color to change</span>
        </div>

        <div className="space-y-4">
          {players.map((p, idx) => (
            <div
              key={p.id}
              className="bg-[#1b2132] border border-[#2b354d] hover:border-[#3c4a6c] rounded-xl p-3.5 sm:p-4 transition space-y-3"
            >
              {/* Top Row: Name and Corporation */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <PlayerBadge color={p.color} size="lg">
                    <span className="text-[10px] font-extrabold text-white/95 drop-shadow">#{idx + 1}</span>
                  </PlayerBadge>

                  <div className="flex-1 min-w-0">
                    <label className="text-xs uppercase font-bold text-slate-300 block mb-0.5">
                      Name
                    </label>
                    <input
                      type="text"
                      value={p.name}
                      onChange={(e) => onUpdatePlayer(p.id, { name: e.target.value })}
                      placeholder={`Player ${idx + 1}`}
                      className="bg-[#101420] border border-[#2b354d] focus:border-[#e2583e] text-white font-semibold text-sm px-3 py-2 rounded-lg outline-none w-full min-h-[40px]"
                    />
                  </div>
                </div>

                {/* Corporation dropdown */}
                <div className="sm:w-60 min-w-0">
                  <label className="text-xs uppercase font-bold text-slate-300 block mb-0.5">
                    Corporation
                  </label>
                  <select
                    value={p.corporation}
                    onChange={(e) => onUpdatePlayer(p.id, { corporation: e.target.value })}
                    className="bg-[#101420] text-white border border-[#2b354d] focus:border-[#e2583e] rounded-lg px-3 py-2 text-xs outline-none w-full min-h-[40px] cursor-pointer"
                  >
                    {CORPORATIONS.map((corp) => (
                      <option key={corp} value={corp}>
                        {corp}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Bottom Row: Inline 36px Touchable Color Pills */}
              <div className="pt-2 border-t border-[#232a3d] flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-slate-300 mr-1">Color:</span>
                <div className="flex flex-wrap items-center gap-2">
                  {COLOR_PALETTE.map((c) => {
                    const isSelected = p.color.toLowerCase() === c.hex.toLowerCase();
                    const isDark = isCharcoalOrDark(c.hex);

                    return (
                      <button
                        key={c.hex}
                        type="button"
                        onClick={() => {
                          triggerHaptic(10);
                          onUpdatePlayer(p.id, { color: c.hex });
                        }}
                        className={`w-9 h-9 min-w-[36px] min-h-[36px] rounded-full flex items-center justify-center transition-all cursor-pointer ${
                          isSelected
                            ? 'scale-110 ring-2 ring-white shadow-md'
                            : 'opacity-75 hover:opacity-100 hover:scale-105 border border-white/20'
                        } ${isDark ? 'ring-2 ring-slate-200 ring-offset-2 ring-offset-slate-950 shadow-[0_0_8px_rgba(255,255,255,0.3)]' : ''}`}
                        style={{ backgroundColor: c.hex }}
                        title={`${c.name} color`}
                        aria-label={`Select ${c.name} for Player ${idx + 1}`}
                      >
                        {isSelected && (
                          <Check className="w-4 h-4 text-white stroke-[3] drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Board Map Selection & Expansion Badges */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Board Map Selector */}
        <div className="bg-[#141824] border border-[#2b354d] rounded-2xl p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#232a3d]">
            <h3 className="font-rajdhani text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-sky-400" />
              <span>Board Map</span>
            </h3>
            <span className="text-xs text-slate-300">Milestones & Awards</span>
          </div>

          <div className="space-y-2.5">
            {[
              {
                id: 'tharsis' as BoardType,
                name: 'Tharsis (Standard)',
                desc: 'Terraformer, Mayor, Gardener • Landlord, Banker, Scientist'
              },
              {
                id: 'hellas' as BoardType,
                name: 'Hellas (South Pole)',
                desc: 'Diversifier, Tactician, Polar Explorer • Cultivator, Magnate, Space Baron'
              },
              {
                id: 'elysium' as BoardType,
                name: 'Elysium',
                desc: 'Generalist, Specialist, Ecologist • Celebrity, Industrialist, Desert Settler'
              }
            ].map((board) => {
              const isSelected = boardMilestones === board.id;
              return (
                <button
                  key={board.id}
                  type="button"
                  onClick={() => {
                    triggerHaptic(10);
                    onSelectBoard(board.id);
                  }}
                  className={`min-h-[48px] w-full text-left p-3.5 rounded-xl border transition cursor-pointer ${
                    isSelected
                      ? 'bg-sky-950/30 border-sky-500/60 ring-1 ring-sky-500/50'
                      : 'bg-[#1b2132] border-[#2b354d] hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-white flex items-center gap-2">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          isSelected ? 'bg-sky-400' : 'bg-slate-600'
                        }`}
                      />
                      {board.name}
                    </span>
                    {isSelected && (
                      <span className="text-xs uppercase font-bold text-sky-300 bg-sky-500/20 px-2 py-0.5 rounded">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 mt-1 pl-4.5">{board.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Expansion Badges / Toggles */}
        <div className="bg-[#141824] border border-[#2b354d] rounded-2xl p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#232a3d]">
            <h3 className="font-rajdhani text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Expansions</span>
            </h3>
            <span className="text-xs text-slate-300">Optional</span>
          </div>

          <div className="space-y-2.5">
            {/* Turmoil Badge Toggle */}
            <div
              onClick={() => {
                triggerHaptic(10);
                onToggleTurmoil(!settings.turmoil);
              }}
              className={`min-h-[48px] p-3.5 rounded-xl border transition cursor-pointer flex items-center justify-between gap-3 ${
                settings.turmoil
                  ? 'bg-red-950/20 border-red-500/50 ring-1 ring-red-500/40'
                  : 'bg-[#1b2132] border-[#2b354d] hover:border-slate-600'
              }`}
            >
              <div className="flex items-start gap-2.5">
                <span className="text-xl">🏛️</span>
                <div>
                  <div className="font-bold text-sm text-white flex items-center gap-1.5">
                    <span>Turmoil Expansion</span>
                    {settings.turmoil && (
                      <span className="text-xs uppercase font-bold text-red-300 bg-red-500/20 px-1.5 py-0.5 rounded">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300">
                    Chairman & Party Leaders (1 VP each)
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.turmoil}
                onChange={() => {}} // handled by parent div
                className="accent-[#e2583e] w-5 h-5 cursor-pointer"
              />
            </div>

            {/* Venus Next Badge Toggle */}
            <div
              onClick={() => {
                triggerHaptic(10);
                onToggleVenus(!settings.venus);
              }}
              className={`min-h-[48px] p-3.5 rounded-xl border transition cursor-pointer flex items-center justify-between gap-3 ${
                settings.venus
                  ? 'bg-amber-950/20 border-amber-500/50 ring-1 ring-amber-500/40'
                  : 'bg-[#1b2132] border-[#2b354d] hover:border-slate-600'
              }`}
            >
              <div className="flex items-start gap-2.5">
                <span className="text-xl">☁️</span>
                <div>
                  <div className="font-bold text-sm text-white flex items-center gap-1.5">
                    <span>Venus Next Expansion</span>
                    {settings.venus && (
                      <span className="text-xs uppercase font-bold text-amber-300 bg-amber-500/20 px-1.5 py-0.5 rounded">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300">
                    Adds Hoverlord & Venuphile
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.venus}
                onChange={() => {}} // handled by parent div
                className="accent-[#e2583e] w-5 h-5 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Action Bar with Safe Area Inset */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#0c0e14]/95 backdrop-blur-md border-t border-[#2b354d] p-3 sm:p-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-2xl">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
          <div className="hidden sm:block">
            <div className="text-xs font-bold text-white uppercase tracking-wider">
              Ready to Score
            </div>
            <div className="text-xs text-slate-300">
              {numPlayers} Players • {boardMilestones.toUpperCase()} Map
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              triggerHaptic(15);
              onStartScoring();
            }}
            className="flex-1 sm:flex-initial sm:min-w-[240px] min-h-[48px] py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#e2583e] via-[#e67e22] to-[#f39c12] hover:from-[#f0684f] hover:to-[#ffb02e] text-white font-orbitron font-extrabold text-sm sm:text-base tracking-wider uppercase shadow-xl shadow-[#e2583e]/30 flex items-center justify-center gap-2 transition-all transform active:scale-95 cursor-pointer"
          >
            <span>Start Scoring</span>
            <ArrowRight className="w-5 h-5 stroke-[3]" />
          </button>
        </div>
      </div>
    </div>
  );
};

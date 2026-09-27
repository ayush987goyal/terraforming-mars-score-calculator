import React, { useState } from 'react';
import { Player, PlayerResult } from '../types';
import { CORPORATIONS } from '../data/gameData';
import { ChevronDown, ChevronRight, Calculator } from 'lucide-react';

interface PlayerCardProps {
  player: Player;
  result: PlayerResult;
  turmoilEnabled: boolean;
  onUpdatePlayer: (id: string, updates: Partial<Player>) => void;
  onShowToast: (msg: string) => void;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({
  player,
  result,
  turmoilEnabled,
  onUpdatePlayer,
  onShowToast
}) => {
  const [specialOpen, setSpecialOpen] = useState(false);
  const [cardCalcOpen, setCardCalcOpen] = useState(false);

  // Card calculator local state
  const [fixedCards, setFixedCards] = useState(0);
  const [resourceCards, setResourceCards] = useState(0);
  const [jovianCards, setJovianCards] = useState(0);

  const handleApplyCardCalc = () => {
    const total = Number(fixedCards) + Number(resourceCards) + Number(jovianCards);
    onUpdatePlayer(player.id, { cardsVP: total });
    onShowToast(`Calculated ${total} Card VP for ${player.name}`);
  };

  const handleStep = (field: keyof Player, delta: number, min = 0, max = 300) => {
    const current = Number(player[field]) || 0;
    const next = Math.min(max, Math.max(min, current + delta));
    onUpdatePlayer(player.id, { [field]: next });
  };

  return (
    <div className="bg-[#141824] border border-[#2b354d] hover:border-[#3b4868] rounded-xl overflow-hidden shadow-lg flex flex-col transition duration-150">
      {/* Top Color Banner */}
      <div className="h-1.5 w-full" style={{ backgroundColor: player.color }} />

      {/* Card Header */}
      <div className="p-4 bg-[#1b2132] border-b border-[#2b354d] flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1.5">
            <span
              className="w-3.5 h-3.5 rounded-sm flex-shrink-0 border border-white/30"
              style={{ backgroundColor: player.color }}
            />
            <input
              type="text"
              value={player.name}
              onChange={(e) => onUpdatePlayer(player.id, { name: e.target.value })}
              placeholder="Player Name"
              className="bg-transparent border-b border-dashed border-white/30 focus:border-[#e2583e] text-white font-bold text-base outline-none w-full"
            />
          </div>

          <select
            value={player.corporation}
            onChange={(e) => onUpdatePlayer(player.id, { corporation: e.target.value })}
            className="bg-[#101420] text-[#8c9bb3] focus:text-white border border-[#2b354d] focus:border-[#e2583e] rounded px-2 py-0.5 text-xs outline-none w-full cursor-pointer"
          >
            {CORPORATIONS.map((corp) => (
              <option key={corp} value={corp}>
                {corp}
              </option>
            ))}
          </select>
        </div>

        <div className="text-right flex-shrink-0">
          <div
            className="font-orbitron text-3xl font-black leading-none drop-shadow"
            style={{ color: player.color }}
          >
            {result.totalVP}
          </div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#8c9bb3] mt-1">
            Rank #{result.rank}
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 flex flex-col gap-3.5 flex-1 text-sm">
        {/* TR (Terraform Rating) */}
        <div className="flex items-center justify-between gap-2 pb-2 border-b border-[#1c2333]">
          <div>
            <div className="font-semibold text-white text-xs sm:text-sm flex items-center gap-1.5">
              <span>🌐</span> Terraform Rating (TR)
            </div>
            <div className="text-[11px] text-[#8c9bb3]">1 VP per 1 TR (Default 20)</div>
          </div>
          <div className="flex items-center bg-[#101420] border border-[#2b354d] rounded-md p-0.5">
            <button
              onClick={() => handleStep('tr', -1, 0, 200)}
              className="w-7 h-7 flex items-center justify-center font-bold text-base hover:bg-white/10 rounded cursor-pointer"
            >
              -
            </button>
            <input
              type="number"
              value={player.tr}
              onChange={(e) => onUpdatePlayer(player.id, { tr: Number(e.target.value) || 0 })}
              className="w-12 bg-transparent text-center font-rajdhani font-bold text-base text-white outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <button
              onClick={() => handleStep('tr', 1, 0, 200)}
              className="w-7 h-7 flex items-center justify-center font-bold text-base hover:bg-white/10 rounded cursor-pointer"
            >
              +
            </button>
          </div>
        </div>

        {/* Milestones VP Summary */}
        <div className="flex items-center justify-between gap-2 pb-2 border-b border-[#1c2333]">
          <div>
            <div className="font-semibold text-white text-xs sm:text-sm flex items-center gap-1.5">
              <span>🚩</span> Milestones
            </div>
            <div className="text-[11px] text-[#8c9bb3]">
              {result.milestonesClaimed.length > 0
                ? result.milestonesClaimed.join(', ')
                : 'Set in Milestones Tracker'}
            </div>
          </div>
          <div className="font-bold text-sm text-[#f7dc6f] px-2 py-0.5 rounded bg-amber-500/10">
            +{result.milestonesVP} VP
          </div>
        </div>

        {/* Awards VP Summary */}
        <div className="flex items-center justify-between gap-2 pb-2 border-b border-[#1c2333]">
          <div>
            <div className="font-semibold text-white text-xs sm:text-sm flex items-center gap-1.5">
              <span>🎖️</span> Awards
            </div>
            <div className="text-[11px] text-[#8c9bb3]">
              {result.awardsWon.length > 0
                ? result.awardsWon
                    .map((w) => `${w.award} (${w.place === 1 ? '1st' : '2nd'}${w.tied ? ' tie' : ''})`)
                    .join(', ')
                : 'Set in Awards Tracker'}
            </div>
          </div>
          <div className="font-bold text-sm text-[#f8c471] px-2 py-0.5 rounded bg-orange-500/10">
            +{result.awardsVP} VP
          </div>
        </div>

        {/* Greeneries Owned */}
        <div className="flex items-center justify-between gap-2 pb-2 border-b border-[#1c2333]">
          <div>
            <div className="font-semibold text-white text-xs sm:text-sm flex items-center gap-1.5">
              <span>🌲</span> Greeneries
            </div>
            <div className="text-[11px] text-[#8c9bb3]">1 VP per owned greenery tile</div>
          </div>
          <div className="flex items-center bg-[#101420] border border-[#2b354d] rounded-md p-0.5">
            <button
              onClick={() => handleStep('greeneries', -1, 0, 100)}
              className="w-7 h-7 flex items-center justify-center font-bold text-base hover:bg-white/10 rounded cursor-pointer"
            >
              -
            </button>
            <input
              type="number"
              value={player.greeneries}
              onChange={(e) =>
                onUpdatePlayer(player.id, { greeneries: Number(e.target.value) || 0 })
              }
              className="w-12 bg-transparent text-center font-rajdhani font-bold text-base text-white outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <button
              onClick={() => handleStep('greeneries', 1, 0, 100)}
              className="w-7 h-7 flex items-center justify-center font-bold text-base hover:bg-white/10 rounded cursor-pointer"
            >
              +
            </button>
          </div>
        </div>

        {/* City Adjacencies */}
        <div className="flex items-center justify-between gap-2 pb-1">
          <div>
            <div className="font-semibold text-white text-xs sm:text-sm flex items-center gap-1.5">
              <span>🏙️</span> City Adjacencies
            </div>
            <div className="text-[11px] text-[#8c9bb3]">1 VP per adjacent greenery (any owner)</div>
          </div>
          <div className="flex items-center bg-[#101420] border border-[#2b354d] rounded-md p-0.5">
            <button
              onClick={() => handleStep('cityAdjacencies', -1, 0, 150)}
              className="w-7 h-7 flex items-center justify-center font-bold text-base hover:bg-white/10 rounded cursor-pointer"
            >
              -
            </button>
            <input
              type="number"
              value={player.cityAdjacencies}
              onChange={(e) =>
                onUpdatePlayer(player.id, { cityAdjacencies: Number(e.target.value) || 0 })
              }
              className="w-12 bg-transparent text-center font-rajdhani font-bold text-base text-white outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <button
              onClick={() => handleStep('cityAdjacencies', 1, 0, 150)}
              className="w-7 h-7 flex items-center justify-center font-bold text-base hover:bg-white/10 rounded cursor-pointer"
            >
              +
            </button>
          </div>
        </div>

        {/* Special Tiles Box (Capital / Commercial District) */}
        <div className="bg-[#101420] border border-[#232c3f] rounded-lg p-2.5">
          <button
            onClick={() => setSpecialOpen(!specialOpen)}
            className="flex items-center gap-1.5 text-xs font-semibold text-sky-400 hover:text-sky-300 w-full text-left cursor-pointer"
          >
            {specialOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            <span>Special Tiles (Capital / Commercial District)</span>
          </button>

          {specialOpen && (
            <div className="mt-2.5 pt-2.5 border-t border-dashed border-[#2b354d] space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={player.hasCapital}
                    onChange={(e) =>
                      onUpdatePlayer(player.id, { hasCapital: e.target.checked })
                    }
                    className="accent-[#e2583e]"
                  />
                  <span>Capital (+1 VP per ocean)</span>
                </label>
                {player.hasCapital && (
                  <div className="flex items-center bg-[#1b2132] border border-[#2b354d] rounded p-0.5">
                    <button
                      onClick={() => handleStep('capitalOceans', -1, 0, 9)}
                      className="w-5 h-5 flex items-center justify-center font-bold text-xs"
                    >
                      -
                    </button>
                    <span className="w-6 text-center font-bold text-xs text-white">
                      {player.capitalOceans}
                    </span>
                    <button
                      onClick={() => handleStep('capitalOceans', 1, 0, 9)}
                      className="w-5 h-5 flex items-center justify-center font-bold text-xs"
                    >
                      +
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={player.hasCommercialDistrict}
                    onChange={(e) =>
                      onUpdatePlayer(player.id, { hasCommercialDistrict: e.target.checked })
                    }
                    className="accent-[#e2583e]"
                  />
                  <span>Commercial District (+1 VP per city)</span>
                </label>
                {player.hasCommercialDistrict && (
                  <div className="flex items-center bg-[#1b2132] border border-[#2b354d] rounded p-0.5">
                    <button
                      onClick={() => handleStep('commercialCities', -1, 0, 6)}
                      className="w-5 h-5 flex items-center justify-center font-bold text-xs"
                    >
                      -
                    </button>
                    <span className="w-6 text-center font-bold text-xs text-white">
                      {player.commercialCities}
                    </span>
                    <button
                      onClick={() => handleStep('commercialCities', 1, 0, 6)}
                      className="w-5 h-5 flex items-center justify-center font-bold text-xs"
                    >
                      +
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Cards VP */}
        <div className="flex items-center justify-between gap-2 pb-1">
          <div>
            <div className="font-semibold text-white text-xs sm:text-sm flex items-center gap-1.5">
              <span>🃏</span> Cards VP
            </div>
            <div className="text-[11px] text-[#8c9bb3]">Sum of fixed & variable card VP</div>
          </div>
          <div className="flex items-center bg-[#101420] border border-[#2b354d] rounded-md p-0.5">
            <button
              onClick={() => handleStep('cardsVP', -1, -50, 200)}
              className="w-7 h-7 flex items-center justify-center font-bold text-base hover:bg-white/10 rounded cursor-pointer"
            >
              -
            </button>
            <input
              type="number"
              value={player.cardsVP}
              onChange={(e) =>
                onUpdatePlayer(player.id, { cardsVP: Number(e.target.value) || 0 })
              }
              className="w-12 bg-transparent text-center font-rajdhani font-bold text-base text-white outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <button
              onClick={() => handleStep('cardsVP', 1, -50, 200)}
              className="w-7 h-7 flex items-center justify-center font-bold text-base hover:bg-white/10 rounded cursor-pointer"
            >
              +
            </button>
          </div>
        </div>

        {/* Card Breakdown Helper Drawer */}
        <div className="bg-[#101420] border border-[#282740] rounded-lg p-2.5">
          <button
            onClick={() => setCardCalcOpen(!cardCalcOpen)}
            className="flex items-center gap-1.5 text-xs font-semibold text-purple-400 hover:text-purple-300 w-full text-left cursor-pointer"
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Card VP Breakdown Helper</span>
            {cardCalcOpen ? <ChevronDown className="w-3.5 h-3.5 ml-auto" /> : <ChevronRight className="w-3.5 h-3.5 ml-auto" />}
          </button>

          {cardCalcOpen && (
            <div className="mt-2.5 pt-2.5 border-t border-dashed border-[#3a2e4f] space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span>Fixed (+/-) Card VP:</span>
                <input
                  type="number"
                  value={fixedCards}
                  onChange={(e) => setFixedCards(Number(e.target.value) || 0)}
                  className="w-14 bg-[#1b2132] border border-[#2b354d] text-center rounded text-white py-0.5"
                />
              </div>
              <div className="flex items-center justify-between">
                <span>Animals / Microbes / Floaters:</span>
                <input
                  type="number"
                  value={resourceCards}
                  onChange={(e) => setResourceCards(Number(e.target.value) || 0)}
                  className="w-14 bg-[#1b2132] border border-[#2b354d] text-center rounded text-white py-0.5"
                />
              </div>
              <div className="flex items-center justify-between">
                <span>Jovian Multipliers VP:</span>
                <input
                  type="number"
                  value={jovianCards}
                  onChange={(e) => setJovianCards(Number(e.target.value) || 0)}
                  className="w-14 bg-[#1b2132] border border-[#2b354d] text-center rounded text-white py-0.5"
                />
              </div>
              <button
                onClick={handleApplyCardCalc}
                className="w-full mt-2 py-1.5 bg-purple-700/40 hover:bg-purple-700/60 border border-purple-500/50 text-white rounded font-semibold text-xs transition cursor-pointer"
              >
                Apply to Total Card VP ({Number(fixedCards) + Number(resourceCards) + Number(jovianCards)} VP)
              </button>
            </div>
          )}
        </div>

        {/* Turmoil Inputs (if enabled) */}
        {turmoilEnabled && (
          <div className="bg-red-500/5 border border-red-500/25 rounded-lg p-2.5 flex items-center justify-between gap-2">
            <div>
              <div className="font-semibold text-red-300 text-xs sm:text-sm flex items-center gap-1">
                <span>🏛️</span> Turmoil VP
              </div>
              <div className="text-[11px] text-[#8c9bb3]">1 VP Chairman + 1 VP per Party Leader</div>
            </div>
            <div className="flex items-center gap-2.5">
              <label className="flex items-center gap-1 text-xs text-white cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={player.isChairman}
                  onChange={(e) =>
                    onUpdatePlayer(player.id, { isChairman: e.target.checked })
                  }
                  className="accent-[#e2583e]"
                />
                <span className="text-[11px]">Chair</span>
              </label>

              <div className="flex items-center bg-[#101420] border border-[#2b354d] rounded p-0.5">
                <button
                  onClick={() => handleStep('partyLeaders', -1, 0, 6)}
                  className="w-5 h-5 flex items-center justify-center font-bold text-xs"
                  title="Decrease party leaders"
                >
                  -
                </button>
                <span
                  className="w-6 text-center font-bold text-xs text-white"
                  title="Party leader seats"
                >
                  {player.partyLeaders}
                </span>
                <button
                  onClick={() => handleStep('partyLeaders', 1, 0, 6)}
                  className="w-5 h-5 flex items-center justify-center font-bold text-xs"
                  title="Increase party leaders"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tiebreaker: MegaCredits Cash (M€) */}
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-2.5 flex items-center justify-between gap-2 mt-auto">
          <div>
            <div className="font-semibold text-[#f39c12] text-xs sm:text-sm flex items-center gap-1.5">
              <span>💰</span> MegaCredits Cash (M€)
            </div>
            <div className="text-[11px] text-[#8c9bb3]">Official tiebreaker: Most cash wins ties</div>
          </div>
          <div className="flex items-center bg-[#101420] border border-[#2b354d] rounded-md p-0.5">
            <button
              onClick={() => handleStep('megacredits', -1, 0, 300)}
              className="w-7 h-7 flex items-center justify-center font-bold text-base hover:bg-white/10 rounded cursor-pointer"
            >
              -
            </button>
            <input
              type="number"
              value={player.megacredits}
              onChange={(e) =>
                onUpdatePlayer(player.id, { megacredits: Number(e.target.value) || 0 })
              }
              className="w-12 bg-transparent text-center font-rajdhani font-bold text-base text-amber-400 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <button
              onClick={() => handleStep('megacredits', 1, 0, 300)}
              className="w-7 h-7 flex items-center justify-center font-bold text-base hover:bg-white/10 rounded cursor-pointer"
            >
              +
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

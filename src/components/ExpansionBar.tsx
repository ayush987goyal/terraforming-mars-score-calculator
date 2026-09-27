import React from 'react';

interface ExpansionBarProps {
  turmoil: boolean;
  onToggleTurmoil: (enabled: boolean) => void;
  venus: boolean;
  onToggleVenus: (enabled: boolean) => void;
  numPlayers: number;
  onSetPlayerCount: (count: number) => void;
}

export const ExpansionBar: React.FC<ExpansionBarProps> = ({
  turmoil,
  onToggleTurmoil,
  venus,
  onToggleVenus,
  numPlayers,
  onSetPlayerCount
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 bg-[#141824] border border-[#2b354d] rounded-lg px-4 py-3 mb-6 shadow-sm">
      <div className="flex flex-wrap items-center gap-6">
        <span className="text-xs uppercase tracking-wider font-bold text-[#8c9bb3]">
          Expansions:
        </span>

        {/* Turmoil Toggle */}
        <label className="flex items-center gap-2.5 cursor-pointer select-none">
          <div className="relative inline-flex items-center">
            <input
              type="checkbox"
              checked={turmoil}
              onChange={(e) => onToggleTurmoil(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-10 h-5 bg-[#2b354d] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#e2583e]"></div>
          </div>
          <span className="text-xs font-semibold text-[#f0f3f8] flex items-center gap-1">
            <span>🏛️</span> Turmoil
          </span>
        </label>

        {/* Venus Toggle */}
        <label className="flex items-center gap-2.5 cursor-pointer select-none">
          <div className="relative inline-flex items-center">
            <input
              type="checkbox"
              checked={venus}
              onChange={(e) => onToggleVenus(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-10 h-5 bg-[#2b354d] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#e2583e]"></div>
          </div>
          <span className="text-xs font-semibold text-[#f0f3f8] flex items-center gap-1">
            <span>☁️</span> Venus Next
          </span>
        </label>
      </div>

      {/* Player Count Selector */}
      <div className="flex items-center gap-3">
        <span className="text-xs uppercase tracking-wider font-bold text-[#8c9bb3]">
          Players:
        </span>
        <div className="flex bg-[#101420] p-0.5 rounded-md border border-[#2b354d]">
          {[1, 2, 3, 4, 5].map((cnt) => (
            <button
              key={cnt}
              onClick={() => onSetPlayerCount(cnt)}
              className={`px-3 py-1 text-xs font-bold rounded transition cursor-pointer ${
                numPlayers === cnt
                  ? 'bg-[#e2583e] text-white shadow'
                  : 'text-[#8c9bb3] hover:text-white'
              }`}
            >
              {cnt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

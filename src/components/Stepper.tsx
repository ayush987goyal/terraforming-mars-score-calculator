import React from 'react';
import { Minus, Plus } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';

interface StepperProps {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  unit?: string;
  colorTheme?: 'sky' | 'emerald' | 'slate' | 'purple' | 'amber' | 'mars';
  onValueChange: (newValue: number) => void;
  onOpenKeypad?: () => void;
  className?: string;
}

export const Stepper: React.FC<StepperProps> = ({
  value,
  min = 0,
  max = 300,
  step = 1,
  label,
  unit,
  colorTheme = 'sky',
  onValueChange,
  onOpenKeypad,
  className = ''
}) => {
  const handleDecrement = () => {
    triggerHaptic(10);
    const next = Math.max(min, value - step);
    onValueChange(next);
  };

  const handleIncrement = () => {
    triggerHaptic(10);
    const next = Math.min(max, value + step);
    onValueChange(next);
  };

  const themeColors = {
    sky: {
      text: 'text-sky-400 group-hover:text-sky-300',
      border: 'border-sky-500/40 hover:border-sky-400',
      bg: 'bg-[#171d2b]'
    },
    emerald: {
      text: 'text-emerald-400 group-hover:text-emerald-300',
      border: 'border-emerald-500/40 hover:border-emerald-400',
      bg: 'bg-[#171d2b]'
    },
    slate: {
      text: 'text-slate-200 group-hover:text-white',
      border: 'border-slate-500/40 hover:border-slate-400',
      bg: 'bg-[#171d2b]'
    },
    purple: {
      text: 'text-purple-300 group-hover:text-purple-200',
      border: 'border-purple-500/40 hover:border-purple-400',
      bg: 'bg-[#171d2b]'
    },
    amber: {
      text: 'text-amber-400 group-hover:text-amber-300',
      border: 'border-amber-500/40 hover:border-amber-400',
      bg: 'bg-[#171d2b]'
    },
    mars: {
      text: 'text-[#ff8c73] group-hover:text-white',
      border: 'border-[#e2583e]/50 hover:border-[#e2583e]',
      bg: 'bg-[#171d2b]'
    }
  }[colorTheme];

  return (
    <div className={`flex items-center justify-between gap-1.5 ${className}`}>
      {/* 44px+ Minimum Hit Target: Minus Button */}
      <button
        type="button"
        onClick={handleDecrement}
        disabled={value <= min}
        className="min-w-[44px] min-h-[44px] w-11 h-11 rounded-xl bg-[#1b2132] hover:bg-[#252e46] active:bg-[#e2583e] active:text-white border border-[#2b354d] text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed font-bold text-lg flex items-center justify-center transition cursor-pointer select-none shadow-sm"
        aria-label="Decrease value"
      >
        <Minus className="w-4 h-4 stroke-[2.5]" />
      </button>

      {/* 44px+ Minimum Hit Target: Middle Keypad Trigger */}
      <button
        type="button"
        onClick={() => {
          triggerHaptic(10);
          onOpenKeypad?.();
        }}
        className={`flex-1 min-h-[44px] px-3 py-2 ${themeColors.bg} hover:bg-[#1f273a] border ${themeColors.border} rounded-xl text-center transition cursor-pointer group shadow-inner flex flex-col items-center justify-center`}
        title="Tap to open numeric keypad"
      >
        <div className={`font-orbitron text-xl sm:text-2xl font-black leading-tight ${themeColors.text}`}>
          {value}
        </div>
        {(label || unit) && (
          <div className="text-[10px] sm:text-xs uppercase font-bold tracking-wider text-slate-400 mt-0.5">
            {unit || label}
          </div>
        )}
      </button>

      {/* 44px+ Minimum Hit Target: Plus Button */}
      <button
        type="button"
        onClick={handleIncrement}
        disabled={value >= max}
        className="min-w-[44px] min-h-[44px] w-11 h-11 rounded-xl bg-[#1b2132] hover:bg-[#252e46] active:bg-[#e2583e] active:text-white border border-[#2b354d] text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed font-bold text-lg flex items-center justify-center transition cursor-pointer select-none shadow-sm"
        aria-label="Increase value"
      >
        <Plus className="w-4 h-4 stroke-[2.5]" />
      </button>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { X, Check, Delete, ArrowRight, RotateCcw } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';
import { PlayerBadge } from './PlayerBadge';

export interface NumericKeypadModalProps {
  isOpen: boolean;
  title: string;
  subtitle?: string;
  playerColor?: string;
  initialValue: number;
  min?: number;
  max?: number;
  allowNegative?: boolean;
  onConfirm: (val: number) => void;
  onConfirmAndNext?: (val: number) => void;
  onClose: () => void;
}

export const NumericKeypadModal: React.FC<NumericKeypadModalProps> = ({
  isOpen,
  title,
  subtitle,
  playerColor,
  initialValue,
  min = 0,
  max = 300,
  allowNegative = false,
  onConfirm,
  onConfirmAndNext,
  onClose
}) => {
  const [valStr, setValStr] = useState<string>(String(initialValue));
  const [isFresh, setIsFresh] = useState<boolean>(true);

  useEffect(() => {
    if (isOpen) {
      setValStr(String(initialValue));
      setIsFresh(true);
    }
  }, [isOpen, initialValue, title]);

  // Handle ESC or Enter keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'Enter') {
        handleDone();
      } else if (e.key >= '0' && e.key <= '9') {
        triggerHaptic(10);
        handleDigit(e.key);
      } else if (e.key === 'Backspace') {
        triggerHaptic(10);
        handleBackspace();
      } else if (e.key === '-' && allowNegative) {
        triggerHaptic(10);
        handleToggleSign();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, valStr, isFresh, allowNegative]);

  if (!isOpen) return null;

  const currentNum = Number(valStr) || 0;

  const clampValue = (val: number): number => {
    return Math.min(max, Math.max(min, val));
  };

  const handleDigit = (digit: string) => {
    triggerHaptic(10);
    if (isFresh) {
      setValStr(digit);
      setIsFresh(false);
    } else {
      // Prevent excess length
      if (valStr.length >= 5) return;
      if (valStr === '0') {
        setValStr(digit);
      } else if (valStr === '-0') {
        setValStr('-' + digit);
      } else {
        const next = valStr + digit;
        setValStr(next);
      }
    }
  };

  const handleBackspace = () => {
    triggerHaptic(10);
    setIsFresh(false);
    if (valStr.length <= 1 || (valStr.length === 2 && valStr.startsWith('-'))) {
      setValStr('0');
    } else {
      setValStr(valStr.slice(0, -1));
    }
  };

  const handleClear = () => {
    triggerHaptic(10);
    setValStr('0');
    setIsFresh(false);
  };

  const handleToggleSign = () => {
    if (!allowNegative) return;
    triggerHaptic(10);
    setIsFresh(false);
    if (valStr.startsWith('-')) {
      setValStr(valStr.slice(1) || '0');
    } else {
      setValStr(valStr === '0' ? '-0' : '-' + valStr);
    }
  };

  const handleQuickAdd = (delta: number) => {
    triggerHaptic(10);
    setIsFresh(false);
    const updated = clampValue(currentNum + delta);
    setValStr(String(updated));
  };

  const handleDone = () => {
    triggerHaptic(15);
    const finalNum = clampValue(Number(valStr) || 0);
    onConfirm(finalNum);
    onClose();
  };

  const handleDoneAndNext = () => {
    triggerHaptic(15);
    const finalNum = clampValue(Number(valStr) || 0);
    if (onConfirmAndNext) {
      onConfirmAndNext(finalNum);
    } else {
      onConfirm(finalNum);
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-sm bg-[#141824] border border-[#2b354d] sm:rounded-2xl rounded-t-2xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        {/* Header */}
        <div className="p-4 bg-[#1b2132] border-b border-[#2b354d] flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            {playerColor && <PlayerBadge color={playerColor} size="sm" />}
            <div className="truncate">
              <h3 className="font-rajdhani text-base font-bold text-white uppercase tracking-wider truncate">
                {title}
              </h3>
              {subtitle && <p className="text-xs text-slate-300 truncate">{subtitle}</p>}
            </div>
          </div>
          <button
            onClick={() => {
              triggerHaptic(10);
              onClose();
            }}
            className="min-w-[44px] min-h-[44px] w-11 h-11 rounded-xl bg-[#101420] text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Display Box */}
        <div className="p-4 bg-[#0c0e14] border-b border-[#232a3d] text-center">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
            Current Value
          </div>
          <div className="font-orbitron text-4xl sm:text-5xl font-black text-amber-400 tracking-wide select-none drop-shadow-[0_0_15px_rgba(245,158,11,0.3)]">
            {valStr}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Range: {min} to {max}
          </div>
        </div>

        {/* Quick Stepper Row (44px+ hit targets) */}
        <div className="px-4 py-3 bg-[#171d2b] border-b border-[#232a3d] flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => handleQuickAdd(-5)}
            className="flex-1 min-h-[44px] h-12 text-sm font-bold rounded-xl bg-[#101420] text-slate-200 hover:bg-slate-800/60 active:scale-95 border border-[#2b354d] transition cursor-pointer flex items-center justify-center"
          >
            -5
          </button>
          <button
            type="button"
            onClick={() => handleQuickAdd(-1)}
            className="flex-1 min-h-[44px] h-12 text-sm font-bold rounded-xl bg-[#101420] text-slate-200 hover:bg-slate-800/60 active:scale-95 border border-[#2b354d] transition cursor-pointer flex items-center justify-center"
          >
            -1
          </button>
          <button
            type="button"
            onClick={() => handleQuickAdd(1)}
            className="flex-1 min-h-[44px] h-12 text-sm font-bold rounded-xl bg-[#101420] text-emerald-400 hover:bg-emerald-950/40 active:scale-95 border border-emerald-500/40 transition cursor-pointer flex items-center justify-center"
          >
            +1
          </button>
          <button
            type="button"
            onClick={() => handleQuickAdd(5)}
            className="flex-1 min-h-[44px] h-12 text-sm font-bold rounded-xl bg-[#101420] text-emerald-400 hover:bg-emerald-950/40 active:scale-95 border border-emerald-500/40 transition cursor-pointer flex items-center justify-center"
          >
            +5
          </button>
        </div>

        {/* Numeric Keypad Grid (Thumb-friendly h-14 buttons) */}
        <div className="p-4 grid grid-cols-3 gap-2.5 select-none bg-[#141824]">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleDigit(digit)}
              className="min-h-[44px] h-14 font-orbitron text-2xl font-bold bg-[#1b2132] hover:bg-[#252e46] active:bg-[#e2583e] active:text-white active:scale-95 border border-[#2b354d] text-white rounded-xl shadow-xs transition flex items-center justify-center cursor-pointer"
            >
              {digit}
            </button>
          ))}

          {/* Bottom Row */}
          {allowNegative ? (
            <button
              type="button"
              onClick={handleToggleSign}
              className="min-h-[44px] h-14 font-rajdhani text-xl font-bold bg-[#101420] hover:bg-[#1f2639] active:scale-95 border border-[#2b354d] text-slate-200 rounded-xl transition flex items-center justify-center cursor-pointer"
              title="Toggle Positive / Negative"
            >
              ±
            </button>
          ) : (
            <button
              type="button"
              onClick={handleClear}
              className="min-h-[44px] h-14 font-rajdhani text-xs font-bold uppercase tracking-wider bg-[#101420] hover:bg-red-950/30 active:scale-95 border border-[#2b354d] text-red-300 rounded-xl transition flex items-center justify-center cursor-pointer"
            >
              Clear
            </button>
          )}

          <button
            type="button"
            onClick={() => handleDigit('0')}
            className="min-h-[44px] h-14 font-orbitron text-2xl font-bold bg-[#1b2132] hover:bg-[#252e46] active:bg-[#e2583e] active:text-white active:scale-95 border border-[#2b354d] text-white rounded-xl shadow-xs transition flex items-center justify-center cursor-pointer"
          >
            0
          </button>

          <button
            type="button"
            onClick={handleBackspace}
            className="min-h-[44px] h-14 font-bold bg-[#101420] hover:bg-[#1f2639] active:scale-95 border border-[#2b354d] text-amber-400 rounded-xl transition flex items-center justify-center cursor-pointer"
            title="Backspace"
            aria-label="Backspace"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        {/* Footer Actions with "Set & Next Player" Flow */}
        <div className="p-4 bg-[#171d2b] border-t border-[#232a3d] flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleClear}
            className="min-h-[44px] h-12 px-3.5 rounded-xl bg-[#101420] hover:bg-[#1f2639] border border-[#2b354d] text-xs font-bold uppercase tracking-wider text-slate-300 transition cursor-pointer flex items-center justify-center gap-1"
            title="Reset to 0"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Reset</span>
          </button>

          {onConfirmAndNext && (
            <button
              type="button"
              onClick={handleDoneAndNext}
              className="flex-1 min-h-[44px] h-12 px-3 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-rajdhani text-sm sm:text-base font-bold uppercase tracking-wider shadow-lg shadow-sky-600/25 flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
              title="Save current value and advance directly to the next player"
            >
              <span>Set & Next</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          )}

          <button
            type="button"
            onClick={handleDone}
            className="flex-1 min-h-[44px] h-12 px-3 rounded-xl bg-gradient-to-r from-[#e2583e] to-[#f39c12] hover:from-[#f0684f] hover:to-[#ffb02e] text-white font-rajdhani text-sm sm:text-base font-bold uppercase tracking-wider shadow-lg shadow-[#e2583e]/25 flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>Done ({clampValue(currentNum)})</span>
          </button>
        </div>
      </div>
    </div>
  );
};

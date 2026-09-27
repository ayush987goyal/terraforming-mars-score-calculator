import React from 'react';
import { AppScreen } from '../types';
import { Copy, RotateCcw, Download, Layers, CheckCircle2, Trophy } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';

interface HeaderProps {
  currentScreen: AppScreen;
  onNavigateScreen: (screen: AppScreen) => void;
  onCopyReport: () => void;
  onReset: () => void;
  installPrompt: any | null;
  onInstallPwa: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentScreen,
  onNavigateScreen,
  onCopyReport,
  onReset,
  installPrompt,
  onInstallPwa
}) => {
  return (
    <header className="pt-[max(0.75rem,env(safe-area-inset-top))] pb-5 mb-6 border-b border-[#2b354d]">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[radial-gradient(circle_at_35%_35%,#ff7b54,#c0392b_60%,#4a1208)] shadow-[0_0_25px_rgba(226,88,62,0.4)] border border-white/20 flex items-center justify-center text-2xl flex-shrink-0 select-none">
            🪐
          </div>
          <div>
            <h1 className="font-orbitron text-lg sm:text-xl font-extrabold tracking-wider text-white uppercase drop-shadow">
              Terraforming Mars
            </h1>
            <p className="text-xs text-slate-300 font-medium">
              Tabletop End-Game Score Calculator • Offline Ready
            </p>
          </div>
        </div>

        {/* Global Toolbar Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {installPrompt && (
            <button
              type="button"
              onClick={() => {
                triggerHaptic(10);
                onInstallPwa();
              }}
              className="min-h-[44px] flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-400/70 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.3)] transition cursor-pointer"
              title="Install app to your home screen for offline access"
            >
              <Download className="w-4 h-4 animate-pulse" />
              <span>Install App</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              triggerHaptic(10);
              onCopyReport();
            }}
            className="min-h-[44px] flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#1b2132] hover:bg-[#21293e] border border-[#2b354d] text-[#f0f3f8] hover:border-[#435172] transition cursor-pointer"
            title="Copy markdown box score to clipboard"
          >
            <Copy className="w-4 h-4 text-sky-400" />
            <span className="hidden sm:inline">Copy Report</span>
          </button>

          <button
            type="button"
            onClick={() => {
              triggerHaptic(10);
              onReset();
            }}
            className="min-h-[44px] flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-red-950/20 hover:bg-red-900/40 border border-red-800/40 text-red-300 transition cursor-pointer"
            title="Reset match data"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* Screen Navigation Tabs */}
      <div className="mt-4 flex items-center gap-2 bg-[#101420] p-1.5 rounded-xl border border-[#232a3d] max-w-md">
        <button
          type="button"
          onClick={() => {
            triggerHaptic(10);
            onNavigateScreen('setup');
          }}
          className={`flex-1 min-h-[44px] py-2 px-3 rounded-lg text-xs font-rajdhani font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition cursor-pointer ${
            currentScreen === 'setup'
              ? 'bg-[#e2583e] text-white shadow'
              : 'text-slate-300 hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>1. Setup</span>
        </button>

        <button
          type="button"
          onClick={() => {
            triggerHaptic(10);
            onNavigateScreen('walkthrough');
          }}
          className={`flex-1 min-h-[44px] py-2 px-3 rounded-lg text-xs font-rajdhani font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition cursor-pointer ${
            currentScreen === 'walkthrough'
              ? 'bg-[#e2583e] text-white shadow'
              : 'text-slate-300 hover:text-white'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>2. Scoring</span>
        </button>

        <button
          type="button"
          onClick={() => {
            triggerHaptic(10);
            onNavigateScreen('podium');
          }}
          className={`flex-1 min-h-[44px] py-2 px-3 rounded-lg text-xs font-rajdhani font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition cursor-pointer ${
            currentScreen === 'podium'
              ? 'bg-gradient-to-r from-[#f39c12] to-[#e2583e] text-white shadow'
              : 'text-slate-300 hover:text-white'
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>3. Podium</span>
        </button>
      </div>
    </header>
  );
};

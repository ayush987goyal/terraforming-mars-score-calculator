import React, { useState, useEffect } from 'react';
import { GameState, BoardType, Player, AppScreen, WalkthroughStep } from './types';
import {
  getInitialGameState,
  BOARD_DATA,
  VENUS_MILESTONE,
  DEFAULT_PLAYERS
} from './data/gameData';
import { calculateScores, generateMatchReport } from './utils/scoring';
import { Header } from './components/Header';
import { ScreenSetup } from './components/ScreenSetup';
import { ScreenWalkthrough } from './components/ScreenWalkthrough';
import { ScreenPodium } from './components/ScreenPodium';
import { NumericKeypadModal } from './components/NumericKeypadModal';
import { Toast } from './components/Toast';

const STATE_STORAGE_KEY = 'tfm_score_calc_state_v2';
const SCREEN_STORAGE_KEY = 'tfm_score_calc_screen_v2';
const STEP_STORAGE_KEY = 'tfm_score_calc_step_v2';

export const App: React.FC = () => {
  // Game State
  const [gameState, setGameState] = useState<GameState>(() => {
    try {
      const saved = localStorage.getItem(STATE_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load saved state:', e);
    }
    return getInitialGameState();
  });

  // Current Screen: 'setup' | 'walkthrough' | 'podium'
  const [currentScreen, setCurrentScreen] = useState<AppScreen>(() => {
    try {
      const saved = localStorage.getItem(SCREEN_STORAGE_KEY);
      if (saved === 'setup' || saved === 'walkthrough' || saved === 'podium') {
        return saved;
      }
    } catch (e) {
      console.error('Failed to load saved screen:', e);
    }
    return 'setup';
  });

  // Walkthrough Step: 1 | 2 | 3 | 4
  const [walkthroughStep, setWalkthroughStep] = useState<WalkthroughStep>(() => {
    try {
      const saved = Number(localStorage.getItem(STEP_STORAGE_KEY));
      if (saved >= 1 && saved <= 4) {
        return saved as WalkthroughStep;
      }
    } catch (e) {
      console.error('Failed to load saved step:', e);
    }
    return 1;
  });

  // In-App Keypad Modal State
  const [keypadConfig, setKeypadConfig] = useState<{
    isOpen: boolean;
    title: string;
    subtitle?: string;
    playerColor?: string;
    value: number;
    min?: number;
    max?: number;
    allowNegative?: boolean;
    onConfirm: (val: number) => void;
    onConfirmAndNext?: (val: number) => void;
  }>({
    isOpen: false,
    title: '',
    value: 0,
    onConfirm: () => {}
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [installPrompt, setInstallPrompt] = useState<any | null>(null);

  // Persist State
  useEffect(() => {
    try {
      localStorage.setItem(STATE_STORAGE_KEY, JSON.stringify(gameState));
    } catch (e) {
      console.error('Failed to persist game state:', e);
    }
  }, [gameState]);

  // Persist Screen
  useEffect(() => {
    try {
      localStorage.setItem(SCREEN_STORAGE_KEY, currentScreen);
    } catch (e) {
      console.error('Failed to persist screen:', e);
    }
  }, [currentScreen]);

  // Persist Step
  useEffect(() => {
    try {
      localStorage.setItem(STEP_STORAGE_KEY, String(walkthroughStep));
    } catch (e) {
      console.error('Failed to persist step:', e);
    }
  }, [walkthroughStep]);

  // Auto Scroll-to-Top on Screen and Category Step Transitions
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentScreen, walkthroughStep]);

  // Capture PWA install prompt
  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    const handleAppInstalled = () => {
      setInstallPrompt(null);
      showToast('App installed successfully!');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3000);
  };

  const handleInstallPwa = async () => {
    if (!installPrompt) return;
    try {
      await installPrompt.prompt();
      const choiceResult = await installPrompt.userChoice;
      if (choiceResult && choiceResult.outcome === 'accepted') {
        showToast('App installed to your device!');
      } else {
        showToast('App installation dismissed.');
      }
    } catch (e) {
      console.error('Install prompt error:', e);
    } finally {
      setInstallPrompt(null);
    }
  };

  // Calculations
  const { results } = calculateScores(gameState);

  // State Mutators
  const setPlayerCount = (count: number) => {
    setGameState((prev) => {
      let players = [...prev.players];
      if (count > players.length) {
        for (let i = players.length; i < count; i++) {
          players.push(JSON.parse(JSON.stringify(DEFAULT_PLAYERS[i])));
        }
      } else if (count < players.length) {
        const removed = players.slice(count).map((p) => p.id);
        players = players.slice(0, count);

        // Clear removed player claims
        const milestones = prev.milestones.map((m) =>
          removed.includes(m.claimedBy || '') ? { ...m, claimedBy: '' } : m
        );
        const awards = prev.awards.map((a) => ({
          ...a,
          firstPlace: a.firstPlace.filter((id) => !removed.includes(id)),
          secondPlace: a.secondPlace.filter((id) => !removed.includes(id))
        }));

        return {
          ...prev,
          numPlayers: count,
          players,
          milestones,
          awards
        };
      }

      return {
        ...prev,
        numPlayers: count,
        players
      };
    });
    showToast(`Player count set to ${count}`);
  };

  const updatePlayer = (id: string, updates: Partial<Player>) => {
    setGameState((prev) => ({
      ...prev,
      players: prev.players.map((p) => (p.id === id ? { ...p, ...updates } : p))
    }));
  };

  const toggleTurmoil = (enabled: boolean) => {
    setGameState((prev) => ({
      ...prev,
      settings: { ...prev.settings, turmoil: enabled }
    }));
    showToast(`Turmoil Expansion ${enabled ? 'Enabled' : 'Disabled'}`);
  };

  const toggleVenus = (enabled: boolean) => {
    setGameState((prev) => {
      const nextVenus = enabled;
      const baseMilestones = [...BOARD_DATA[prev.boardMilestones].milestones];
      if (nextVenus) {
        baseMilestones.push(VENUS_MILESTONE);
      }

      const existingClaims = new Map(prev.milestones.map((m) => [m.id, m.claimedBy]));
      const milestones = baseMilestones.map((b) => ({
        ...b,
        claimedBy: existingClaims.get(b.id) || ''
      }));

      return {
        ...prev,
        settings: { ...prev.settings, venus: nextVenus },
        milestones
      };
    });
    showToast(`Venus Next ${enabled ? 'Enabled' : 'Disabled'}`);
  };

  const selectBoard = (board: BoardType) => {
    setGameState((prev) => {
      const base = [...BOARD_DATA[board].milestones];
      if (prev.settings.venus) {
        base.push(VENUS_MILESTONE);
      }
      const existingClaims = new Map(prev.milestones.map((m) => [m.id, m.claimedBy]));
      const milestones = base.map((b) => ({
        ...b,
        claimedBy: existingClaims.get(b.id) || ''
      }));

      return {
        ...prev,
        boardMilestones: board,
        boardAwards: board,
        milestones
      };
    });
    showToast(`Board map set to ${board.toUpperCase()}`);
  };

  const claimMilestone = (milestoneId: string, playerId: string) => {
    setGameState((prev) => ({
      ...prev,
      milestones: prev.milestones.map((m) =>
        m.id === milestoneId ? { ...m, claimedBy: playerId } : m
      )
    }));
  };

  const selectAward = (slot: number, awardId: string) => {
    setGameState((prev) => ({
      ...prev,
      awards: prev.awards.map((a) =>
        a.slot === slot
          ? {
              ...a,
              awardId,
              funded: Boolean(awardId),
              firstPlace: awardId ? a.firstPlace : [],
              secondPlace: awardId ? a.secondPlace : []
            }
          : a
      )
    }));
  };

  const toggleFirstPlace = (slot: number, playerId: string) => {
    setGameState((prev) => ({
      ...prev,
      awards: prev.awards.map((a) => {
        if (a.slot !== slot) return a;
        const exists = a.firstPlace.includes(playerId);
        const nextFirst = exists
          ? a.firstPlace.filter((id) => id !== playerId)
          : [...a.firstPlace, playerId];

        // Also remove from 2nd place if added to 1st
        const nextSecond = exists ? a.secondPlace : a.secondPlace.filter((id) => id !== playerId);

        return { ...a, firstPlace: nextFirst, secondPlace: nextSecond };
      })
    }));
  };

  const toggleSecondPlace = (slot: number, playerId: string) => {
    setGameState((prev) => ({
      ...prev,
      awards: prev.awards.map((a) => {
        if (a.slot !== slot) return a;
        const exists = a.secondPlace.includes(playerId);
        const nextSecond = exists
          ? a.secondPlace.filter((id) => id !== playerId)
          : [...a.secondPlace, playerId];

        return { ...a, secondPlace: nextSecond };
      })
    }));
  };

  const reset = () => {
    if (window.confirm('Reset all match setup, players, and scores to default values?')) {
      setGameState(getInitialGameState());
      setCurrentScreen('setup');
      setWalkthroughStep(1);
      showToast('Game state reset.');
    }
  };

  const copyReport = () => {
    const md = generateMatchReport(results, gameState.settings.turmoil);
    navigator.clipboard
      .writeText(md)
      .then(() => {
        showToast('Match report copied to clipboard!');
      })
      .catch(() => {
        const textarea = document.createElement('textarea');
        textarea.value = md;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showToast('Match report copied to clipboard!');
      });
  };

  const handleOpenKeypad = (config: {
    title: string;
    subtitle?: string;
    playerColor?: string;
    value: number;
    min?: number;
    max?: number;
    allowNegative?: boolean;
    onConfirm: (val: number) => void;
    onConfirmAndNext?: (val: number) => void;
  }) => {
    setKeypadConfig({
      ...config,
      isOpen: true
    });
  };

  const handleCloseKeypad = () => {
    setKeypadConfig((prev) => ({ ...prev, isOpen: false }));
  };

  return (
    <div className="max-w-5xl mx-auto px-4 pt-[max(0.5rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))] min-h-screen">
      {/* Global App Header */}
      <Header
        currentScreen={currentScreen}
        onNavigateScreen={setCurrentScreen}
        onCopyReport={copyReport}
        onReset={reset}
        installPrompt={installPrompt}
        onInstallPwa={handleInstallPwa}
      />

      {/* Screen 1: Match Setup */}
      {currentScreen === 'setup' && (
        <ScreenSetup
          gameState={gameState}
          onSetPlayerCount={setPlayerCount}
          onUpdatePlayer={updatePlayer}
          onToggleTurmoil={toggleTurmoil}
          onToggleVenus={toggleVenus}
          onSelectBoard={selectBoard}
          onStartScoring={() => {
            setCurrentScreen('walkthrough');
            setWalkthroughStep(1);
          }}
        />
      )}

      {/* Screen 2: Guided Step-by-Step Walkthrough */}
      {currentScreen === 'walkthrough' && (
        <ScreenWalkthrough
          gameState={gameState}
          currentStep={walkthroughStep}
          onSetStep={setWalkthroughStep}
          onBackToSetup={() => setCurrentScreen('setup')}
          onFinishScoring={() => setCurrentScreen('podium')}
          onUpdatePlayer={updatePlayer}
          onClaimMilestone={claimMilestone}
          onSelectAward={selectAward}
          onToggleFirstPlace={toggleFirstPlace}
          onToggleSecondPlace={toggleSecondPlace}
          onOpenKeypad={handleOpenKeypad}
          onShowToast={showToast}
        />
      )}

      {/* Screen 3: Post-Game Podium & Reveal */}
      {currentScreen === 'podium' && (
        <ScreenPodium
          results={results}
          settings={gameState.settings}
          onCopyReport={copyReport}
          onEditScores={() => {
            setCurrentScreen('walkthrough');
            setWalkthroughStep(4);
          }}
          onNewGame={() => {
            if (window.confirm('Start a new game?')) {
              setGameState(getInitialGameState());
              setCurrentScreen('setup');
              setWalkthroughStep(1);
              showToast('Ready for new game setup!');
            }
          }}
        />
      )}

      {/* In-App Numeric Keypad Modal / Bottom-Sheet */}
      <NumericKeypadModal
        isOpen={keypadConfig.isOpen}
        title={keypadConfig.title}
        subtitle={keypadConfig.subtitle}
        playerColor={keypadConfig.playerColor}
        initialValue={keypadConfig.value}
        min={keypadConfig.min}
        max={keypadConfig.max}
        allowNegative={keypadConfig.allowNegative}
        onConfirm={keypadConfig.onConfirm}
        onConfirmAndNext={keypadConfig.onConfirmAndNext}
        onClose={handleCloseKeypad}
      />

      <Toast message={toastMessage} />
    </div>
  );
};

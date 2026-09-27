/**
 * Haptic feedback utility for mobile tabletop interactions.
 * Uses the Web Vibration API with safe fallback for unsupported platforms.
 */
export const triggerHaptic = (durationMs: number = 10): void => {
  try {
    if (typeof window !== 'undefined' && 'navigator' in window && typeof navigator.vibrate === 'function') {
      navigator.vibrate(durationMs);
    }
  } catch {
    // Ignore environments where vibrate is restricted or fails
  }
};

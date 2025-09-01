import { useCallback, useEffect, useReducer } from "react";
import type { UnitId } from "../types";

export type UnitProgress = {
  stars: number; // 0-3
  xp: number;
  vocab: { studied: number; quizBest: number };
  grammar: { studied: number; reorderBest: number };
  text: { read: number; arrangeBest: number };
  challenge: { clearedLevels: number; bestTimeSec: number; bestScore: number };
};

export type Progress = {
  byUnit: Record<UnitId, UnitProgress>;
  badges: Record<string, { unlocked: boolean; unlockedAt?: string }>;
  totalXP: number;
};

const STORAGE_KEY = "learningquest-progress-v1";

const defaultUnitProgress = (): UnitProgress => ({
  stars: 0,
  xp: 0,
  vocab: { studied: 0, quizBest: 0 },
  grammar: { studied: 0, reorderBest: 0 },
  text: { read: 0, arrangeBest: 0 },
  challenge: { clearedLevels: 0, bestTimeSec: 0, bestScore: 0 },
});

const defaultProgress = (): Progress => ({
  byUnit: {
    1: defaultUnitProgress(),
    2: defaultUnitProgress(),
    3: defaultUnitProgress(),
    4: defaultUnitProgress(),
    5: defaultUnitProgress(),
    6: defaultUnitProgress(),
  },
  badges: {
    FIRST_STEPS: { unlocked: false },
    VOCAB_NOVICE: { unlocked: false },
    GRAMMAR_APPRENTICE: { unlocked: false },
    STORY_EXPLORER: { unlocked: false },
    SPEEDSTER: { unlocked: false },
    PERFECT_10: { unlocked: false },
    UNIT_MASTER: { unlocked: false },
  },
  totalXP: 0,
});

function computeStars(u: UnitProgress): number {
  const scoreLike =
    u.vocab.quizBest + u.grammar.reorderBest + u.text.arrangeBest + u.challenge.bestScore / 5;
  return Math.min(3, Math.floor(scoreLike / 5));
}

function awardIf(cond: boolean, key: string, progress: Progress): Progress {
  if (!cond) return progress;
  if (progress.badges[key]?.unlocked) return progress;
  return {
    ...progress,
    badges: {
      ...progress.badges,
      [key]: { unlocked: true, unlockedAt: new Date().toISOString() },
    },
  };
}

function evaluateBadges(progress: Progress): Progress {
  let p = { ...progress };
  const anyUnit = Object.values(p.byUnit);
  p = awardIf(anyUnit.some((u) => u.vocab.studied >= 1), "FIRST_STEPS", p);
  p = awardIf(anyUnit.some((u) => u.vocab.quizBest >= 6), "VOCAB_NOVICE", p);
  p = awardIf(anyUnit.some((u) => u.grammar.reorderBest >= 1), "GRAMMAR_APPRENTICE", p);
  p = awardIf(anyUnit.some((u) => u.text.read >= 1), "STORY_EXPLORER", p);
  p = awardIf(
    anyUnit.some((u) => u.challenge.bestTimeSec > 0 && u.challenge.bestTimeSec <= 40),
    "SPEEDSTER",
    p
  );
  p = awardIf(anyUnit.some((u) => u.challenge.bestScore >= 10), "PERFECT_10", p);
  p = awardIf(anyUnit.some((u) => u.stars >= 3), "UNIT_MASTER", p);
  return p;
}

function recompute(progress: Progress): Progress {
  const byUnit = { ...progress.byUnit };
  (Object.keys(byUnit) as unknown as UnitId[]).forEach((k) => {
    const u = byUnit[k];
    byUnit[k] = { ...u, stars: computeStars(u) };
  });
  return evaluateBadges({ ...progress, byUnit });
}

function restore(): Progress | null {
  try {
    const raw =
      typeof localStorage !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    return raw ? (JSON.parse(raw) as Progress) : null;
  } catch {
    return null;
  }
}

function persist(p: Progress) {
  try {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
    }
  } catch {}
}

// ----------------- Reducer & Hook -----------------
type Action =
  | { type: "ADD_XP"; unit: UnitId; amount: number }
  | { type: "PATCH_UNIT"; unit: UnitId; patch: Partial<UnitProgress> }
  | { type: "AWARD_BADGE"; key: string }
  | { type: "RESET" }
  | { type: "LOAD"; progress: Progress };

function reducer(state: Progress, action: Action): Progress {
  switch (action.type) {
    case "ADD_XP": {
      const byUnit = { ...state.byUnit };
      const u = { ...byUnit[action.unit], xp: byUnit[action.unit].xp + action.amount };
      byUnit[action.unit] = u;
      return recompute({ ...state, byUnit, totalXP: state.totalXP + action.amount });
    }
    case "PATCH_UNIT": {
      const byUnit = { ...state.byUnit };
      byUnit[action.unit] = { ...byUnit[action.unit], ...action.patch } as UnitProgress;
      return recompute({ ...state, byUnit });
    }
    case "AWARD_BADGE": {
      if (state.badges[action.key]?.unlocked) return state;
      return {
        ...state,
        badges: {
          ...state.badges,
          [action.key]: { unlocked: true, unlockedAt: new Date().toISOString() },
        },
      };
    }
    case "RESET":
      return defaultProgress();
    case "LOAD":
      return action.progress;
    default:
      return state;
  }
}

export function useProgress() {
  const [progress, dispatch] = useReducer(
    reducer,
    undefined as unknown as Progress,
    () => restore() ?? defaultProgress()
  );

  useEffect(() => {
    persist(progress);
  }, [progress]);

  const addXP = useCallback((unit: UnitId, amount: number) => {
    dispatch({ type: "ADD_XP", unit, amount });
  }, []);

  const patchUnit = useCallback((unit: UnitId, patch: Partial<UnitProgress>) => {
    dispatch({ type: "PATCH_UNIT", unit, patch });
  }, []);

  const awardBadge = useCallback((key: string) => {
    dispatch({ type: "AWARD_BADGE", key });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: "RESET" });
    // 同步清空 localStorage（可選）
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  }, []);

  return { progress, addXP, patchUnit, awardBadge, reset };
}

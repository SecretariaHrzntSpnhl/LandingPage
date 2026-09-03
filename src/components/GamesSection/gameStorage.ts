export type GameAnswer = {
  question: string;
  isCorrect: boolean;
};

export type GameResult = {
  gameId: number;
  completed: boolean;
  answers: GameAnswer[];
  correctCount: number;
  totalQuestions: number;
};

export type MedalData = {
  emoji: string;
  title: string;
  range: string;
};

export type TotalStats = {
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  overallPercentage: number;
  currentMedal: MedalData;
  completedGames: number;
};

export type ProgressData = {
  gameHistory: Record<string, GameResult>;
  totalStats: TotalStats;
};

export const STORAGE_KEY = 'horizonte-espanhol-games-v1';

export function createEmptyProgress(): ProgressData {
  return {
    gameHistory: {},
    totalStats: {
      totalQuestions: 0,
      correctAnswers: 0,
      incorrectAnswers: 0,
      overallPercentage: 0,
      currentMedal: {
        emoji: '🌱',
        title: 'Explorador Iniciante',
        range: '0% - 20%',
      },
      completedGames: 0,
    },
  };
}

export function getMedalByPercentage(percentage: number): MedalData {
  if (percentage <= 20) {
    return { emoji: '🥉', title: 'Explorador Iniciante', range: '0% - 20%' };
  }

  if (percentage <= 40) {
    return { emoji: '🥈', title: 'Aventureiro Básico', range: '21% - 40%' };
  }

  if (percentage <= 60) {
    return { emoji: '🥇', title: 'Narrador Intermediário', range: '41% - 60%' };
  }

  if (percentage <= 80) {
    return { emoji: '💎', title: 'Mestre da Comunicação', range: '61% - 80%' };
  }

  return { emoji: '👑', title: 'Fluente em Espanhol', range: '81% - 100%' };
}

export function calculateStats(gameHistory: Record<string, GameResult>): TotalStats {
  const completedGames = Object.values(gameHistory).filter((game) => game.completed).length;
  const totalQuestions = Object.values(gameHistory).reduce((sum, game) => sum + game.totalQuestions, 0);
  const correctAnswers = Object.values(gameHistory).reduce((sum, game) => sum + game.correctCount, 0);
  const incorrectAnswers = totalQuestions - correctAnswers;
  const overallPercentage = totalQuestions === 0 ? 0 : Math.round((correctAnswers / totalQuestions) * 100);

  return {
    totalQuestions,
    correctAnswers,
    incorrectAnswers,
    overallPercentage,
    currentMedal: getMedalByPercentage(overallPercentage),
    completedGames,
  };
}

export function getUnlockedLevel(gameHistory: Record<string, GameResult>): number {
  let unlockedLevel = 1;

  while (unlockedLevel <= 5 && gameHistory[`game${unlockedLevel}`]?.completed) {
    unlockedLevel += 1;
  }

  return unlockedLevel;
}

export function loadProgress(): ProgressData {
  if (typeof window === 'undefined') {
    return createEmptyProgress();
  }

  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      return createEmptyProgress();
    }

    const parsed = JSON.parse(saved) as Partial<ProgressData>;
    const gameHistory = parsed.gameHistory ?? {};
    return {
      gameHistory,
      totalStats: parsed.totalStats ?? calculateStats(gameHistory),
    };
  } catch {
    return createEmptyProgress();
  }
}

export function saveProgress(progress: ProgressData) {
  if (typeof window === 'undefined') {
    return;
  }

  const nextProgress = {
    ...progress,
    totalStats: progress.totalStats ?? calculateStats(progress.gameHistory),
  };

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextProgress));
}

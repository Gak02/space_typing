import type { RomajiMatcher, InputResult } from './core/romaji-engine';

// Re-export for convenience
export type { RomajiMatcher, InputResult };

// === Word System ===
export interface WordDefinition {
  display: string;
  reading: string;
  category: 'professional' | 'nuisance';
}

export interface ActiveWord {
  id: string;
  definition: WordDefinition;
  position: number;       // 0.0 (top) to 1.0 (bottom)
  speed: number;          // position units per millisecond
  matcher: RomajiMatcher;
  spawnedAt: number;
  lane: number;           // horizontal lane (0-based)
}

// === Stage System ===
export interface ClearCondition {
  wordsToComplete: number;
  maxMissedWords: number;
}

export interface StageDefinition {
  id: number;
  name: string;
  mission: string;
  words: WordDefinition[];
  clearCondition: ClearCondition;
  nuisanceIntervalMs: number;
  wordSpawnIntervalMs: number;
  wordSpeed: { min: number; max: number }; // position units per ms
}

// === Scoring ===
export interface StageScore {
  stageId: number;
  accuracy: number;          // 0.0 - 1.0
  averageSpeed: number;      // chars per second
  stressTolerance: number;   // 0.0 - 1.0
  wordsClearedCount: number;
  missedWordsCount: number;
}

export interface TotalScore {
  stages: StageScore[];
  overallAccuracy: number;
  overallSpeed: number;
  overallStressTolerance: number;
}

// === Diagnosis ===
export interface DiagnosisResult {
  careerTitle: string;
  careerDescription: string;
  parameters: {
    accuracy: { value: number; rank: string };
    speed: { value: number; rank: string };
    stressTolerance: { value: number; rank: string };
  };
  shareText: string;
}

// === Game State ===
export type GamePhase =
  | { type: 'title' }
  | { type: 'stage-intro'; stageId: number }
  | { type: 'playing'; stageId: number }
  | { type: 'stage-clear'; stageId: number; score: StageScore }
  | { type: 'game-over'; stageId: number; score: StageScore }
  | { type: 'diagnosis'; result: DiagnosisResult };

export interface GameState {
  phase: GamePhase;
  activeWords: ActiveWord[];
  currentInput: string;
  targetWordId: string | null;
  missedWords: number;
  clearedWords: number;
  totalKeystrokes: number;
  correctKeystrokes: number;
  startTime: number | null;
}

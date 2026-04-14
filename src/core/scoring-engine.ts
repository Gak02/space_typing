import type { StageScore, TotalScore } from '../types';

const STAGE_WEIGHTS = [1.0, 1.2, 1.4, 1.6];

export class ScoringEngine {
  private totalKeystrokes = 0;
  private correctKeystrokes = 0;
  private keystrokeTimestamps: number[] = [];
  private nuisanceClearScores: number[] = [];

  recordKeystroke(correct: boolean, timestampMs: number): void {
    this.totalKeystrokes++;
    if (correct) {
      this.correctKeystrokes++;
    }
    this.keystrokeTimestamps.push(timestampMs);
  }

  recordNuisanceCleared(clearTimeMs: number, timeLimitMs: number): void {
    const score = Math.max(0, (timeLimitMs - clearTimeMs) / timeLimitMs);
    this.nuisanceClearScores.push(score);
  }

  getTotalKeystrokes(): number {
    return this.totalKeystrokes;
  }

  getCorrectKeystrokes(): number {
    return this.correctKeystrokes;
  }

  getAccuracy(): number {
    if (this.totalKeystrokes === 0) return 0;
    return this.correctKeystrokes / this.totalKeystrokes;
  }

  getSpeed(): number {
    if (this.keystrokeTimestamps.length < 2) return 0;
    const first = this.keystrokeTimestamps[0];
    const last = this.keystrokeTimestamps[this.keystrokeTimestamps.length - 1];
    const durationSec = (last - first) / 1000;
    if (durationSec <= 0) return 0;
    return this.correctKeystrokes / durationSec;
  }

  getStressTolerance(): number {
    if (this.nuisanceClearScores.length === 0) return 0;
    const sum = this.nuisanceClearScores.reduce((a, b) => a + b, 0);
    return sum / this.nuisanceClearScores.length;
  }

  getStageScore(stageId: number, clearedWords: number, missedWords: number): StageScore {
    return {
      stageId,
      accuracy: this.getAccuracy(),
      averageSpeed: this.getSpeed(),
      stressTolerance: this.getStressTolerance(),
      wordsClearedCount: clearedWords,
      missedWordsCount: missedWords,
    };
  }

  reset(): void {
    this.totalKeystrokes = 0;
    this.correctKeystrokes = 0;
    this.keystrokeTimestamps = [];
    this.nuisanceClearScores = [];
  }
}

export function computeTotalScore(stages: StageScore[]): TotalScore {
  if (stages.length === 0) {
    return {
      stages,
      overallAccuracy: 0,
      overallSpeed: 0,
      overallStressTolerance: 0,
    };
  }

  let weightSum = 0;
  let accSum = 0;
  let speedSum = 0;
  let stressSum = 0;

  for (let i = 0; i < stages.length; i++) {
    const weight = STAGE_WEIGHTS[i] ?? 1.0;
    accSum += stages[i].accuracy * weight;
    speedSum += stages[i].averageSpeed * weight;
    stressSum += stages[i].stressTolerance * weight;
    weightSum += weight;
  }

  return {
    stages,
    overallAccuracy: accSum / weightSum,
    overallSpeed: speedSum / weightSum,
    overallStressTolerance: stressSum / weightSum,
  };
}

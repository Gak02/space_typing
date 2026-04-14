import { describe, it, expect, beforeEach } from 'vitest';
import { ScoringEngine } from '../../src/core/scoring-engine';

describe('ScoringEngine', () => {
  let engine: ScoringEngine;

  beforeEach(() => {
    engine = new ScoringEngine();
  });

  describe('keystroke recording', () => {
    it('should start with zero keystrokes', () => {
      expect(engine.getTotalKeystrokes()).toBe(0);
      expect(engine.getCorrectKeystrokes()).toBe(0);
    });

    it('should count correct keystrokes', () => {
      engine.recordKeystroke(true, 1000);
      engine.recordKeystroke(true, 1100);
      expect(engine.getCorrectKeystrokes()).toBe(2);
      expect(engine.getTotalKeystrokes()).toBe(2);
    });

    it('should count wrong keystrokes', () => {
      engine.recordKeystroke(true, 1000);
      engine.recordKeystroke(false, 1100);
      expect(engine.getCorrectKeystrokes()).toBe(1);
      expect(engine.getTotalKeystrokes()).toBe(2);
    });
  });

  describe('accuracy calculation', () => {
    it('should return 1.0 for all correct', () => {
      engine.recordKeystroke(true, 1000);
      engine.recordKeystroke(true, 1100);
      engine.recordKeystroke(true, 1200);
      expect(engine.getAccuracy()).toBe(1.0);
    });

    it('should return 0.5 for half correct', () => {
      engine.recordKeystroke(true, 1000);
      engine.recordKeystroke(false, 1100);
      expect(engine.getAccuracy()).toBe(0.5);
    });

    it('should return 0 when no keystrokes', () => {
      expect(engine.getAccuracy()).toBe(0);
    });
  });

  describe('speed calculation', () => {
    it('should calculate chars per second', () => {
      // 4 correct keystrokes over 2 seconds
      engine.recordKeystroke(true, 1000);
      engine.recordKeystroke(true, 1500);
      engine.recordKeystroke(true, 2000);
      engine.recordKeystroke(true, 3000);
      // Speed = 4 correct / 2.0 seconds (from first to last)
      expect(engine.getSpeed()).toBeCloseTo(2.0, 1);
    });

    it('should return 0 when insufficient data', () => {
      expect(engine.getSpeed()).toBe(0);
      engine.recordKeystroke(true, 1000);
      expect(engine.getSpeed()).toBe(0);
    });
  });

  describe('nuisance word tracking (stress tolerance)', () => {
    it('should start with 0 stress tolerance when no nuisance words', () => {
      expect(engine.getStressTolerance()).toBe(0);
    });

    it('should calculate stress tolerance from nuisance clear times', () => {
      // Time limit 5000ms, cleared in 2000ms => (5000-2000)/5000 = 0.6
      engine.recordNuisanceCleared(2000, 5000);
      expect(engine.getStressTolerance()).toBeCloseTo(0.6, 2);
    });

    it('should average multiple nuisance clears', () => {
      engine.recordNuisanceCleared(2000, 5000); // 0.6
      engine.recordNuisanceCleared(1000, 5000); // 0.8
      expect(engine.getStressTolerance()).toBeCloseTo(0.7, 2);
    });

    it('should clamp to 0 when cleared slowly', () => {
      engine.recordNuisanceCleared(6000, 5000); // negative => 0
      expect(engine.getStressTolerance()).toBe(0);
    });
  });

  describe('stage score generation', () => {
    it('should generate a stage score', () => {
      engine.recordKeystroke(true, 1000);
      engine.recordKeystroke(true, 1500);
      engine.recordKeystroke(false, 2000);
      engine.recordNuisanceCleared(2000, 5000);

      const score = engine.getStageScore(1, 5, 1);
      expect(score.stageId).toBe(1);
      expect(score.accuracy).toBeCloseTo(2 / 3, 2);
      expect(score.wordsClearedCount).toBe(5);
      expect(score.missedWordsCount).toBe(1);
      expect(score.stressTolerance).toBeCloseTo(0.6, 2);
    });
  });

  describe('cross-stage total score', () => {
    it('should compute weighted average across stages', async () => {
      const { computeTotalScore } = await import('../../src/core/scoring-engine');

      const stages = [
        { stageId: 1, accuracy: 0.8, averageSpeed: 3.0, stressTolerance: 0.5, wordsClearedCount: 10, missedWordsCount: 2 },
        { stageId: 2, accuracy: 0.9, averageSpeed: 4.0, stressTolerance: 0.7, wordsClearedCount: 12, missedWordsCount: 1 },
      ];

      const total = computeTotalScore(stages);
      // Weights: stage 1 = 1.0, stage 2 = 1.2
      // overallAccuracy = (0.8*1.0 + 0.9*1.2) / (1.0 + 1.2) = (0.8 + 1.08) / 2.2 = 0.8545...
      expect(total.overallAccuracy).toBeCloseTo(0.8545, 2);
      expect(total.overallSpeed).toBeCloseTo(3.545, 2);
      expect(total.overallStressTolerance).toBeCloseTo(0.609, 2);
    });
  });
});

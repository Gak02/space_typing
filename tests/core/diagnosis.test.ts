import { describe, it, expect } from 'vitest';
import { diagnose } from '../../src/core/diagnosis';
import type { TotalScore } from '../../src/types';

// overallSpeed is in chars per second (cps).
// The diagnosis normalizes it: normalizedSpeed = min(cps / 6, 1.0)
// So 5.7 cps => 0.95 normalized, 4.8 cps => 0.8, 3.0 cps => 0.5

describe('Diagnosis', () => {
  describe('career mapping', () => {
    it('should assign 宇宙法務・ルールメイカー for accuracy-dominant', () => {
      const score: TotalScore = {
        stages: [],
        overallAccuracy: 0.95,
        overallSpeed: 3.0,       // normalized: 0.5
        overallStressTolerance: 0.5,
      };
      const result = diagnose(score);
      expect(result.careerTitle).toBe('宇宙法務・ルールメイカー');
    });

    it('should assign 軌道上トラフィックマネージャー for speed-dominant', () => {
      const score: TotalScore = {
        stages: [],
        overallAccuracy: 0.5,
        overallSpeed: 5.7,       // normalized: 0.95
        overallStressTolerance: 0.5,
      };
      const result = diagnose(score);
      expect(result.careerTitle).toBe('軌道上トラフィックマネージャー');
    });

    it('should assign 惑星保護官 for stress-dominant', () => {
      const score: TotalScore = {
        stages: [],
        overallAccuracy: 0.5,
        overallSpeed: 3.0,       // normalized: 0.5
        overallStressTolerance: 0.95,
      };
      const result = diagnose(score);
      expect(result.careerTitle).toBe('惑星保護官');
    });

    it('should assign 月面居住区アーキテクト for balanced scores', () => {
      const score: TotalScore = {
        stages: [],
        overallAccuracy: 0.8,
        overallSpeed: 4.8,       // normalized: 0.8
        overallStressTolerance: 0.8,
      };
      const result = diagnose(score);
      expect(result.careerTitle).toBe('月面居住区アーキテクト');
    });
  });

  describe('rank assignment', () => {
    it('should assign S rank for 0.9+', () => {
      const score: TotalScore = {
        stages: [],
        overallAccuracy: 0.95,
        overallSpeed: 5.7,       // normalized: 0.95
        overallStressTolerance: 0.95,
      };
      const result = diagnose(score);
      expect(result.parameters.accuracy.rank).toBe('S');
      expect(result.parameters.speed.rank).toBe('S');
      expect(result.parameters.stressTolerance.rank).toBe('S');
    });

    it('should assign A rank for 0.7-0.9', () => {
      const score: TotalScore = {
        stages: [],
        overallAccuracy: 0.8,
        overallSpeed: 4.8,
        overallStressTolerance: 0.8,
      };
      const result = diagnose(score);
      expect(result.parameters.accuracy.rank).toBe('A');
    });

    it('should assign B rank for 0.5-0.7', () => {
      const score: TotalScore = {
        stages: [],
        overallAccuracy: 0.6,
        overallSpeed: 3.6,       // normalized: 0.6
        overallStressTolerance: 0.6,
      };
      const result = diagnose(score);
      expect(result.parameters.accuracy.rank).toBe('B');
    });

    it('should assign C rank for below 0.5', () => {
      const score: TotalScore = {
        stages: [],
        overallAccuracy: 0.3,
        overallSpeed: 1.8,       // normalized: 0.3
        overallStressTolerance: 0.3,
      };
      const result = diagnose(score);
      expect(result.parameters.accuracy.rank).toBe('C');
    });
  });

  describe('share text', () => {
    it('should generate share text with career title', () => {
      const score: TotalScore = {
        stages: [],
        overallAccuracy: 0.8,
        overallSpeed: 4.8,       // normalized: 0.8
        overallStressTolerance: 0.8,
      };
      const result = diagnose(score);
      expect(result.shareText).toContain('月面居住区アーキテクト');
      expect(result.shareText).toContain('月面転職クエスト');
    });
  });

  describe('career description', () => {
    it('should provide a non-empty description', () => {
      const score: TotalScore = {
        stages: [],
        overallAccuracy: 0.8,
        overallSpeed: 3.0,
        overallStressTolerance: 0.5,
      };
      const result = diagnose(score);
      expect(result.careerDescription.length).toBeGreaterThan(0);
    });
  });
});

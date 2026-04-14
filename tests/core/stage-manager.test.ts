import { describe, it, expect, beforeEach } from 'vitest';
import { StageManager } from '../../src/core/stage-manager';
import { STAGES } from '../../src/data/stages';

describe('StageManager', () => {
  let sm: StageManager;

  beforeEach(() => {
    sm = new StageManager();
  });

  describe('stage progression', () => {
    it('should start at stage 1', () => {
      expect(sm.getCurrentStage().id).toBe(1);
    });

    it('should advance to stage 2', () => {
      const next = sm.advanceStage();
      expect(next).not.toBeNull();
      expect(next!.id).toBe(2);
      expect(sm.getCurrentStage().id).toBe(2);
    });

    it('should advance through all 4 stages', () => {
      expect(sm.getCurrentStage().id).toBe(1);
      sm.advanceStage();
      expect(sm.getCurrentStage().id).toBe(2);
      sm.advanceStage();
      expect(sm.getCurrentStage().id).toBe(3);
      sm.advanceStage();
      expect(sm.getCurrentStage().id).toBe(4);
    });

    it('should return null after final stage', () => {
      sm.advanceStage(); // 2
      sm.advanceStage(); // 3
      sm.advanceStage(); // 4
      const next = sm.advanceStage(); // beyond
      expect(next).toBeNull();
    });

    it('should report isLastStage correctly', () => {
      expect(sm.isLastStage()).toBe(false);
      sm.advanceStage(); // 2
      expect(sm.isLastStage()).toBe(false);
      sm.advanceStage(); // 3
      expect(sm.isLastStage()).toBe(false);
      sm.advanceStage(); // 4
      expect(sm.isLastStage()).toBe(true);
    });
  });

  describe('clear condition checking', () => {
    it('should not be cleared with 0 words', () => {
      expect(sm.checkClearCondition(0)).toBe(false);
    });

    it('should be cleared when enough words completed', () => {
      const stage = sm.getCurrentStage();
      expect(sm.checkClearCondition(stage.clearCondition.wordsToComplete)).toBe(true);
    });

    it('should not be cleared below threshold', () => {
      const stage = sm.getCurrentStage();
      expect(sm.checkClearCondition(stage.clearCondition.wordsToComplete - 1)).toBe(false);
    });
  });

  describe('game over checking', () => {
    it('should not be game over with 0 misses', () => {
      expect(sm.checkGameOver(0)).toBe(false);
    });

    it('should be game over when too many misses', () => {
      const stage = sm.getCurrentStage();
      expect(sm.checkGameOver(stage.clearCondition.maxMissedWords + 1)).toBe(true);
    });

    it('should not be game over at exact max', () => {
      const stage = sm.getCurrentStage();
      expect(sm.checkGameOver(stage.clearCondition.maxMissedWords)).toBe(false);
    });
  });

  describe('stage data integrity', () => {
    it('should have 4 stages loaded', () => {
      expect(STAGES).toHaveLength(4);
    });

    it('each stage should have professional and nuisance words', () => {
      for (const stage of STAGES) {
        const pro = stage.words.filter(w => w.category === 'professional');
        const nui = stage.words.filter(w => w.category === 'nuisance');
        expect(pro.length).toBeGreaterThan(0);
        expect(nui.length).toBeGreaterThan(0);
      }
    });
  });
});

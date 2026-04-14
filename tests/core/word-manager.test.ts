import { describe, it, expect, beforeEach } from 'vitest';
import { WordManager } from '../../src/core/word-manager';
import { STAGES } from '../../src/data/stages';

describe('WordManager', () => {
  let wm: WordManager;
  const stage = STAGES[0]; // Stage 1

  beforeEach(() => {
    wm = new WordManager(stage);
  });

  describe('word spawning', () => {
    it('should start with no active words', () => {
      expect(wm.getActiveWords()).toHaveLength(0);
    });

    it('should spawn a word after spawn interval elapses', () => {
      wm.tick(stage.wordSpawnIntervalMs + 1);
      expect(wm.getActiveWords().length).toBeGreaterThanOrEqual(1);
    });

    it('should spawn words at position 0 (top)', () => {
      wm.tick(stage.wordSpawnIntervalMs + 1);
      const words = wm.getActiveWords();
      expect(words[0].position).toBe(0);
    });

    it('should not spawn more than maxActiveWords', () => {
      // Tick many times
      for (let i = 0; i < 20; i++) {
        wm.tick(stage.wordSpawnIntervalMs + 1);
      }
      expect(wm.getActiveWords().length).toBeLessThanOrEqual(5);
    });
  });

  describe('word movement', () => {
    it('should move words down on tick', () => {
      wm.tick(stage.wordSpawnIntervalMs + 1); // spawn a word
      const wordBefore = wm.getActiveWords()[0];
      const posBefore = wordBefore.position;

      wm.tick(1000); // tick 1 second
      const wordAfter = wm.getActiveWords().find(w => w.id === wordBefore.id);
      expect(wordAfter!.position).toBeGreaterThan(posBefore);
    });

    it('should detect words that reach the bottom', () => {
      wm.tick(stage.wordSpawnIntervalMs + 1); // spawn
      // Tick enough for word to reach bottom (position >= 1.0)
      const missedBefore = wm.getMissedCount();
      wm.tick(20000); // 20 seconds should be enough
      expect(wm.getMissedCount()).toBeGreaterThan(missedBefore);
    });
  });

  describe('word clearing', () => {
    it('should remove a word when cleared', () => {
      wm.tick(stage.wordSpawnIntervalMs + 1);
      const word = wm.getActiveWords()[0];
      wm.clearWord(word.id);
      expect(wm.getActiveWords().find(w => w.id === word.id)).toBeUndefined();
    });

    it('should track cleared count', () => {
      wm.tick(stage.wordSpawnIntervalMs + 1);
      const word = wm.getActiveWords()[0];
      expect(wm.getClearedCount()).toBe(0);
      wm.clearWord(word.id);
      expect(wm.getClearedCount()).toBe(1);
    });
  });

  describe('nuisance word spawning', () => {
    it('should spawn nuisance words at nuisance interval', () => {
      // First tick to start, then wait for nuisance interval
      wm.tick(stage.nuisanceIntervalMs + 1);
      const words = wm.getActiveWords();
      const hasNuisance = words.some(w => w.definition.category === 'nuisance');
      expect(hasNuisance).toBe(true);
    });
  });

  describe('word selection from pool', () => {
    it('should assign unique ids to each word', () => {
      wm.tick(stage.wordSpawnIntervalMs + 1);
      wm.tick(stage.wordSpawnIntervalMs + 1);
      const words = wm.getActiveWords();
      if (words.length >= 2) {
        expect(words[0].id).not.toBe(words[1].id);
      }
    });

    it('should assign lane positions to words', () => {
      wm.tick(stage.wordSpawnIntervalMs + 1);
      const word = wm.getActiveWords()[0];
      expect(word.lane).toBeGreaterThanOrEqual(0);
    });
  });
});

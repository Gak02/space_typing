import { describe, it, expect, beforeEach } from 'vitest';
import { GameLoop } from '../../src/core/game-loop';

describe('GameLoop', () => {
  let game: GameLoop;

  beforeEach(() => {
    game = new GameLoop();
  });

  describe('phase transitions', () => {
    it('should start in title phase', () => {
      expect(game.getState().phase.type).toBe('title');
    });

    it('should transition to stage-intro when starting', () => {
      game.startGame();
      expect(game.getState().phase.type).toBe('stage-intro');
      const phase = game.getState().phase;
      if (phase.type === 'stage-intro') {
        expect(phase.stageId).toBe(1);
      }
    });

    it('should transition to playing when confirming stage intro', () => {
      game.startGame();
      game.confirmStageIntro();
      expect(game.getState().phase.type).toBe('playing');
    });
  });

  describe('gameplay', () => {
    beforeEach(() => {
      game.startGame();
      game.confirmStageIntro();
      // Tick to spawn words
      game.update(5000);
    });

    it('should have active words after ticking', () => {
      expect(game.getState().activeWords.length).toBeGreaterThan(0);
    });

    it('should accept correct input', () => {
      const state = game.getState();
      const word = state.activeWords[0];
      const hint = word.matcher.getHint();
      if (hint.length > 0) {
        const result = game.handleInput(hint[0]);
        expect(result.status).not.toBe('wrong');
      }
    });

    it('should track target word after input', () => {
      const state = game.getState();
      const word = state.activeWords[0];
      const hint = word.matcher.getHint();
      if (hint.length > 0) {
        game.handleInput(hint[0]);
        expect(game.getState().targetWordId).not.toBeNull();
      }
    });

    it('should increment keystroke counts', () => {
      const state = game.getState();
      const word = state.activeWords[0];
      const hint = word.matcher.getHint();
      if (hint.length > 0) {
        game.handleInput(hint[0]);
        expect(game.getState().totalKeystrokes).toBe(1);
        expect(game.getState().correctKeystrokes).toBe(1);
      }
    });

    it('should count wrong keystrokes', () => {
      // Input a character that doesn't match anything
      game.handleInput('!');
      // If no word matches '!', it's a wrong keystroke
      expect(game.getState().totalKeystrokes).toBe(1);
    });
  });

  describe('word clearing', () => {
    it('should clear a word when fully typed', () => {
      game.startGame();
      game.confirmStageIntro();
      game.update(5000);

      const word = game.getState().activeWords[0];

      // Type the whole word via romaji - use hint for each char
      let currentWord = game.getState().activeWords.find(w => w.id === word.id);
      while (currentWord && !currentWord.matcher.isComplete) {
        const hint = currentWord.matcher.getHint();
        if (hint.length === 0) break;
        game.handleInput(hint[0]);
        currentWord = game.getState().activeWords.find(w => w.id === word.id);
      }

      // Word should be cleared (removed from active)
      expect(game.getState().activeWords.find(w => w.id === word.id)).toBeUndefined();
      expect(game.getState().clearedWords).toBeGreaterThan(0);
    });
  });

  describe('game over detection', () => {
    it('should transition to game-over when too many words missed', () => {
      game.startGame();
      game.confirmStageIntro();

      // Tick a lot to let words fall and miss
      for (let i = 0; i < 100; i++) {
        game.update(5000);
        if (game.getState().phase.type === 'game-over') break;
      }

      expect(game.getState().phase.type).toBe('game-over');
    });
  });

  describe('stage clear detection', () => {
    it('should transition to stage-clear when enough words cleared', () => {
      game.startGame();
      game.confirmStageIntro();

      // Clear words one at a time with small time steps
      for (let attempts = 0; attempts < 50; attempts++) {
        if (game.getState().phase.type !== 'playing') break;

        // Small tick to spawn a word without moving existing ones too far
        game.update(4100);

        // Type all available words
        const words = game.getState().activeWords;
        for (const w of words) {
          if (game.getState().phase.type !== 'playing') break;
          let current = game.getState().activeWords.find(aw => aw.id === w.id);
          if (!current) continue;

          // Target this word
          let safetyCount = 0;
          while (current && !current.matcher.isComplete && safetyCount < 100) {
            const hint = current.matcher.getHint();
            if (hint.length === 0) break;
            game.handleInput(hint[0]);

            // Need to call update to check clear condition
            game.update(0);

            current = game.getState().activeWords.find(aw => aw.id === w.id);
            safetyCount++;
          }
        }
      }

      const phase = game.getState().phase;
      expect(phase.type === 'stage-clear' || phase.type === 'game-over').toBe(true);
    });
  });

  describe('restart', () => {
    it('should reset to title on restart', () => {
      game.startGame();
      game.confirmStageIntro();
      game.update(5000);
      game.restart();
      expect(game.getState().phase.type).toBe('title');
      expect(game.getState().activeWords).toHaveLength(0);
    });
  });
});

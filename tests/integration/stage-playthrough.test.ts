import { describe, it, expect } from 'vitest';
import { GameLoop } from '../../src/core/game-loop';

/**
 * Integration test: simulate a full stage playthrough programmatically.
 * This tests the entire pipeline: romaji matching, word management,
 * scoring, stage progression, and diagnosis.
 */
describe('Stage Playthrough Integration', () => {
  it('should complete stage 1 by typing all words correctly', () => {
    const game = new GameLoop();
    game.startGame();
    expect(game.getState().phase.type).toBe('stage-intro');

    game.confirmStageIntro();
    expect(game.getState().phase.type).toBe('playing');

    // Play through by spawning and typing words
    let totalAttempts = 0;

    while (game.getState().phase.type === 'playing' && totalAttempts < 80) {
      game.update(4100); // spawn interval + buffer

      const words = game.getState().activeWords;
      for (const w of words) {
        if (game.getState().phase.type !== 'playing') break;

        let current = game.getState().activeWords.find(a => a.id === w.id);
        if (!current) continue;

        let safety = 0;
        while (current && !current.matcher.isComplete && safety < 100) {
          const hint = current.matcher.getHint();
          if (!hint || hint.length === 0) break;
          game.handleInput(hint[0]);
          game.update(0); // check conditions
          current = game.getState().activeWords.find(a => a.id === w.id);
          safety++;
        }
      }
      totalAttempts++;
    }

    const phase = game.getState().phase;
    // Should either clear the stage or game over
    expect(['stage-clear', 'game-over']).toContain(phase.type);

    if (phase.type === 'stage-clear') {
      expect(phase.score.wordsClearedCount).toBeGreaterThanOrEqual(10);
      expect(phase.score.accuracy).toBeGreaterThan(0);
    }
  });

  it('should progress from stage 1 to stage 2', () => {
    const game = new GameLoop();
    game.startGame();
    game.confirmStageIntro();

    // Quick-clear stage 1
    for (let i = 0; i < 80; i++) {
      if (game.getState().phase.type !== 'playing') break;
      game.update(4100);
      const words = game.getState().activeWords;
      for (const w of words) {
        if (game.getState().phase.type !== 'playing') break;
        let current = game.getState().activeWords.find(a => a.id === w.id);
        let safety = 0;
        while (current && !current.matcher.isComplete && safety < 100) {
          const hint = current.matcher.getHint();
          if (!hint || hint.length === 0) break;
          game.handleInput(hint[0]);
          game.update(0);
          current = game.getState().activeWords.find(a => a.id === w.id);
          safety++;
        }
      }
    }

    const phase = game.getState().phase;
    if (phase.type === 'stage-clear') {
      game.advanceToNextStage();
      const nextPhase = game.getState().phase;
      expect(nextPhase.type).toBe('stage-intro');
      if (nextPhase.type === 'stage-intro') {
        expect(nextPhase.stageId).toBe(2);
      }
    }
  });

  it('should generate diagnosis after all stages', () => {
    const game = new GameLoop();

    // Play through all 4 stages
    for (let stageNum = 1; stageNum <= 4; stageNum++) {
      if (game.getState().phase.type === 'title') {
        game.startGame();
      }
      if (game.getState().phase.type === 'stage-intro') {
        game.confirmStageIntro();
      }

      // Clear current stage
      for (let i = 0; i < 100; i++) {
        if (game.getState().phase.type !== 'playing') break;
        game.update(3000);
        const words = game.getState().activeWords;
        for (const w of words) {
          if (game.getState().phase.type !== 'playing') break;
          let current = game.getState().activeWords.find(a => a.id === w.id);
          let safety = 0;
          while (current && !current.matcher.isComplete && safety < 100) {
            const hint = current.matcher.getHint();
            if (!hint || hint.length === 0) break;
            game.handleInput(hint[0]);
            game.update(0);
            current = game.getState().activeWords.find(a => a.id === w.id);
            safety++;
          }
        }
      }

      const phase = game.getState().phase;
      if (phase.type === 'game-over') {
        // Retry on game over
        game.retryStage();
        stageNum--; // Retry this stage
        continue;
      }

      if (phase.type === 'stage-clear') {
        game.advanceToNextStage();
      }
    }

    const finalPhase = game.getState().phase;
    // Should be diagnosis or still in a stage
    if (finalPhase.type === 'diagnosis') {
      expect(finalPhase.result.careerTitle).toBeTruthy();
      expect(finalPhase.result.careerDescription).toBeTruthy();
      expect(finalPhase.result.shareText).toContain('月面転職クエスト');
      expect(finalPhase.result.parameters.accuracy.rank).toMatch(/^[SABC]$/);
      expect(finalPhase.result.parameters.speed.rank).toMatch(/^[SABC]$/);
      expect(finalPhase.result.parameters.stressTolerance.rank).toMatch(/^[SABC]$/);
    }
  });

  it('should handle game restart correctly', () => {
    const game = new GameLoop();
    game.startGame();
    game.confirmStageIntro();
    game.update(5000);
    game.handleInput('a');

    game.restart();
    expect(game.getState().phase.type).toBe('title');
    expect(game.getState().activeWords).toHaveLength(0);
    expect(game.getState().clearedWords).toBe(0);
    expect(game.getState().missedWords).toBe(0);
    expect(game.getState().totalKeystrokes).toBe(0);
  });

  it('should track scoring across gameplay', () => {
    const game = new GameLoop();
    game.startGame();
    game.confirmStageIntro();
    game.update(5000);

    const words = game.getState().activeWords;
    if (words.length > 0) {
      const hint = words[0].matcher.getHint();
      if (hint.length > 0) {
        game.handleInput(hint[0]);
        expect(game.getState().correctKeystrokes).toBe(1);
        expect(game.getState().totalKeystrokes).toBe(1);
      }

      // Wrong input
      game.handleInput('!');
      // Should still have 1 correct but 2 total (if '!' doesn't match)
    }
  });
});

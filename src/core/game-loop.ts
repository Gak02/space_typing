import type { GameState, StageScore } from '../types';
import type { InputResult } from './romaji-engine';
import { WordManager } from './word-manager';
import { ScoringEngine, computeTotalScore } from './scoring-engine';
import { StageManager } from './stage-manager';
import { diagnose } from './diagnosis';

export class GameLoop {
  private state: GameState;
  private wordManager: WordManager | null = null;
  private scoringEngine: ScoringEngine;
  private stageManager: StageManager;
  private stageScores: StageScore[] = [];
  private now = 0;

  constructor() {
    this.scoringEngine = new ScoringEngine();
    this.stageManager = new StageManager();
    this.state = this.createInitialState();
  }

  getState(): GameState {
    return { ...this.state, activeWords: this.wordManager?.getActiveWords() ?? [] };
  }

  startGame(): void {
    this.stageManager.reset();
    this.stageScores = [];
    this.state.phase = { type: 'stage-intro', stageId: this.stageManager.getCurrentStage().id };
  }

  confirmStageIntro(): void {
    if (this.state.phase.type !== 'stage-intro') return;
    const stage = this.stageManager.getCurrentStage();
    this.wordManager = new WordManager(stage);
    this.scoringEngine.reset();
    this.state = {
      ...this.createInitialState(),
      phase: { type: 'playing', stageId: stage.id },
      startTime: this.now,
    };
  }

  update(deltaMs: number): void {
    this.now += deltaMs;

    if (this.state.phase.type !== 'playing') return;
    if (!this.wordManager) return;

    this.wordManager.tick(deltaMs);

    const missed = this.wordManager.getMissedCount();
    this.state.missedWords = missed;
    this.state.clearedWords = this.wordManager.getClearedCount();

    // Check game over
    if (this.stageManager.checkGameOver(missed)) {
      const score = this.scoringEngine.getStageScore(
        this.state.phase.stageId,
        this.state.clearedWords,
        this.state.missedWords
      );
      this.state.phase = { type: 'game-over', stageId: this.state.phase.stageId, score };
      this.state.targetWordId = null;
      return;
    }

    // Check stage clear
    if (this.stageManager.checkClearCondition(this.wordManager.getClearedCount())) {
      const score = this.scoringEngine.getStageScore(
        this.state.phase.stageId,
        this.state.clearedWords,
        this.state.missedWords
      );
      this.stageScores.push(score);
      this.state.phase = { type: 'stage-clear', stageId: this.state.phase.stageId, score };
      this.state.targetWordId = null;
      return;
    }

    // Check if target word is still active
    if (this.state.targetWordId) {
      const words = this.wordManager.getActiveWords();
      if (!words.find(w => w.id === this.state.targetWordId)) {
        this.state.targetWordId = null;
        this.state.currentInput = '';
      }
    }
  }

  handleInput(char: string): InputResult {
    if (this.state.phase.type !== 'playing') return { status: 'wrong' };
    if (!this.wordManager) return { status: 'wrong' };

    const words = this.wordManager.getActiveWords();

    // If we have a target word, send input to it
    if (this.state.targetWordId) {
      const target = words.find(w => w.id === this.state.targetWordId);
      if (target) {
        const result = target.matcher.input(char);
        this.state.totalKeystrokes++;

        if (result.status === 'wrong') {
          this.scoringEngine.recordKeystroke(false, this.now);
          return result;
        }

        this.state.correctKeystrokes++;
        this.scoringEngine.recordKeystroke(true, this.now);
        this.state.currentInput += char;

        if (result.status === 'complete') {
          // Record nuisance clear time if applicable
          if (target.definition.category === 'nuisance') {
            const clearTime = this.now - target.spawnedAt;
            const timeLimit = 10000; // 10 second limit for nuisance words
            this.scoringEngine.recordNuisanceCleared(clearTime, timeLimit);
          }
          this.wordManager.clearWord(target.id);
          this.state.clearedWords = this.wordManager.getClearedCount();
          this.state.targetWordId = null;
          this.state.currentInput = '';
          return { status: 'complete' };
        }

        return result;
      }
    }

    // No target - try to find a matching word
    // Sort by position (closest to bottom first = most urgent)
    const sortedWords = [...words].sort((a, b) => b.position - a.position);

    for (const word of sortedWords) {
      const hint = word.matcher.getHint();
      if (hint.length > 0 && hint[0] === char) {
        // This word matches - target it
        this.state.targetWordId = word.id;
        const result = word.matcher.input(char);
        this.state.totalKeystrokes++;

        if (result.status !== 'wrong') {
          this.state.correctKeystrokes++;
          this.scoringEngine.recordKeystroke(true, this.now);
          this.state.currentInput = char;

          if (result.status === 'complete') {
            if (word.definition.category === 'nuisance') {
              const clearTime = this.now - word.spawnedAt;
              this.scoringEngine.recordNuisanceCleared(clearTime, 10000);
            }
            this.wordManager.clearWord(word.id);
            this.state.clearedWords = this.wordManager.getClearedCount();
            this.state.targetWordId = null;
            this.state.currentInput = '';
            return { status: 'complete' };
          }
        }
        return result;
      }
    }

    // No matching word found
    this.state.totalKeystrokes++;
    this.scoringEngine.recordKeystroke(false, this.now);
    return { status: 'wrong' };
  }

  advanceToNextStage(): void {
    if (this.state.phase.type !== 'stage-clear') return;

    const next = this.stageManager.advanceStage();
    if (next) {
      this.state.phase = { type: 'stage-intro', stageId: next.id };
    } else {
      // All stages complete - show diagnosis
      const totalScore = computeTotalScore(this.stageScores);
      const result = diagnose(totalScore);
      this.state.phase = { type: 'diagnosis', result };
    }
  }

  retryStage(): void {
    if (this.state.phase.type !== 'game-over') return;
    const stage = this.stageManager.getCurrentStage();
    this.wordManager = new WordManager(stage);
    this.scoringEngine.reset();
    this.state = {
      ...this.createInitialState(),
      phase: { type: 'playing', stageId: stage.id },
      startTime: this.now,
    };
  }

  restart(): void {
    this.stageManager.reset();
    this.stageScores = [];
    this.wordManager = null;
    this.scoringEngine.reset();
    this.now = 0;
    this.state = this.createInitialState();
  }

  getCurrentStageName(): string {
    return this.stageManager.getCurrentStage().name;
  }

  getCurrentMission(): string {
    return this.stageManager.getCurrentStage().mission;
  }

  private createInitialState(): GameState {
    return {
      phase: { type: 'title' },
      activeWords: [],
      currentInput: '',
      targetWordId: null,
      missedWords: 0,
      clearedWords: 0,
      totalKeystrokes: 0,
      correctKeystrokes: 0,
      startTime: null,
    };
  }
}

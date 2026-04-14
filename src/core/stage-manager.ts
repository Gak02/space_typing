import type { StageDefinition } from '../types';
import { STAGES } from '../data/stages';

export class StageManager {
  private currentIndex = 0;

  getCurrentStage(): StageDefinition {
    return STAGES[this.currentIndex];
  }

  advanceStage(): StageDefinition | null {
    if (this.currentIndex + 1 >= STAGES.length) {
      return null;
    }
    this.currentIndex++;
    return STAGES[this.currentIndex];
  }

  isLastStage(): boolean {
    return this.currentIndex === STAGES.length - 1;
  }

  checkClearCondition(clearedWords: number): boolean {
    return clearedWords >= this.getCurrentStage().clearCondition.wordsToComplete;
  }

  checkGameOver(missedWords: number): boolean {
    return missedWords > this.getCurrentStage().clearCondition.maxMissedWords;
  }

  getCurrentStageIndex(): number {
    return this.currentIndex;
  }

  reset(): void {
    this.currentIndex = 0;
  }
}

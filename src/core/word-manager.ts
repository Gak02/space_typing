import type { StageDefinition, ActiveWord, WordDefinition } from '../types';
import { createRomajiMatcher } from './romaji-engine';

const MAX_ACTIVE_WORDS = 3;
const NUM_LANES = 5;

export class WordManager {
  private activeWords: ActiveWord[] = [];
  private missedCount = 0;
  private clearedCount = 0;
  private timeSinceLastSpawn = 0;
  private timeSinceLastNuisance = 0;
  private nextWordId = 0;
  private professionalPool: WordDefinition[];
  private nuisancePool: WordDefinition[];
  private professionalIndex = 0;
  private nuisanceIndex = 0;
  private stage: StageDefinition;

  constructor(stage: StageDefinition) {
    this.stage = stage;
    this.professionalPool = this.shuffleArray(
      stage.words.filter(w => w.category === 'professional')
    );
    this.nuisancePool = this.shuffleArray(
      stage.words.filter(w => w.category === 'nuisance')
    );
    // Start spawn timer at the interval so first word spawns on first tick
    this.timeSinceLastSpawn = stage.wordSpawnIntervalMs;
  }

  tick(deltaMs: number): void {
    // Move existing words
    for (const word of this.activeWords) {
      word.position += word.speed * deltaMs;
    }

    // Check for words that hit bottom
    const missed = this.activeWords.filter(w => w.position >= 1.0);
    this.missedCount += missed.length;
    this.activeWords = this.activeWords.filter(w => w.position < 1.0);

    // Spawn new professional words
    this.timeSinceLastSpawn += deltaMs;
    if (this.timeSinceLastSpawn >= this.stage.wordSpawnIntervalMs &&
        this.activeWords.length < MAX_ACTIVE_WORDS) {
      this.spawnWord('professional');
      this.timeSinceLastSpawn = 0;
    }

    // Spawn nuisance words
    this.timeSinceLastNuisance += deltaMs;
    if (this.timeSinceLastNuisance >= this.stage.nuisanceIntervalMs &&
        this.activeWords.length < MAX_ACTIVE_WORDS) {
      this.spawnWord('nuisance');
      this.timeSinceLastNuisance = 0;
    }
  }

  getActiveWords(): ActiveWord[] {
    return [...this.activeWords];
  }

  getMissedCount(): number {
    return this.missedCount;
  }

  getClearedCount(): number {
    return this.clearedCount;
  }

  clearWord(id: string): void {
    const index = this.activeWords.findIndex(w => w.id === id);
    if (index !== -1) {
      this.activeWords.splice(index, 1);
      this.clearedCount++;
    }
  }

  private spawnWord(category: 'professional' | 'nuisance'): void {
    const definition = this.pickWord(category);
    if (!definition) return;

    const speed = this.stage.wordSpeed.min +
      Math.random() * (this.stage.wordSpeed.max - this.stage.wordSpeed.min);

    const lane = this.pickLane();

    const word: ActiveWord = {
      id: `word-${this.nextWordId++}`,
      definition,
      position: 0,
      speed,
      matcher: createRomajiMatcher(definition.reading),
      spawnedAt: Date.now(),
      lane,
    };

    this.activeWords.push(word);
  }

  private pickWord(category: 'professional' | 'nuisance'): WordDefinition | null {
    if (category === 'professional') {
      if (this.professionalPool.length === 0) return null;
      const word = this.professionalPool[this.professionalIndex % this.professionalPool.length];
      this.professionalIndex++;
      return word;
    } else {
      if (this.nuisancePool.length === 0) return null;
      const word = this.nuisancePool[this.nuisanceIndex % this.nuisancePool.length];
      this.nuisanceIndex++;
      return word;
    }
  }

  private pickLane(): number {
    // Pick a lane not currently occupied, or random if all occupied
    const occupiedLanes = new Set(this.activeWords.map(w => w.lane));
    const freeLanes = [];
    for (let i = 0; i < NUM_LANES; i++) {
      if (!occupiedLanes.has(i)) freeLanes.push(i);
    }
    if (freeLanes.length > 0) {
      return freeLanes[Math.floor(Math.random() * freeLanes.length)];
    }
    return Math.floor(Math.random() * NUM_LANES);
  }

  private shuffleArray<T>(arr: T[]): T[] {
    const result = [...arr];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
}

import { describe, it, expect } from 'vitest';
import { createRomajiMatcher } from '../../src/core/romaji-engine';

describe('RomajiEngine', () => {
  describe('basic single hiragana characters', () => {
    it('should match "ka" for "か"', () => {
      const matcher = createRomajiMatcher('か');
      expect(matcher.input('k')).toEqual({ status: 'correct' });
      expect(matcher.input('a')).toEqual({ status: 'complete' });
      expect(matcher.isComplete).toBe(true);
    });

    it('should match "a" for "あ"', () => {
      const matcher = createRomajiMatcher('あ');
      expect(matcher.input('a')).toEqual({ status: 'complete' });
      expect(matcher.isComplete).toBe(true);
    });

    it('should reject wrong input', () => {
      const matcher = createRomajiMatcher('か');
      expect(matcher.input('t')).toEqual({ status: 'wrong' });
      expect(matcher.isComplete).toBe(false);
    });

    it('should match all vowels', () => {
      const vowels = [
        { hiragana: 'あ', romaji: 'a' },
        { hiragana: 'い', romaji: 'i' },
        { hiragana: 'う', romaji: 'u' },
        { hiragana: 'え', romaji: 'e' },
        { hiragana: 'お', romaji: 'o' },
      ];
      for (const { hiragana, romaji } of vowels) {
        const matcher = createRomajiMatcher(hiragana);
        expect(matcher.input(romaji)).toEqual({ status: 'complete' });
      }
    });

    it('should match k-row', () => {
      const kRow = [
        { hiragana: 'か', romaji: 'ka' },
        { hiragana: 'き', romaji: 'ki' },
        { hiragana: 'く', romaji: 'ku' },
        { hiragana: 'け', romaji: 'ke' },
        { hiragana: 'こ', romaji: 'ko' },
      ];
      for (const { hiragana, romaji } of kRow) {
        const matcher = createRomajiMatcher(hiragana);
        for (const ch of romaji) {
          matcher.input(ch);
        }
        expect(matcher.isComplete).toBe(true);
      }
    });
  });

  describe('multi-path romaji (ambiguous characters)', () => {
    it('should accept "si" for "し"', () => {
      const matcher = createRomajiMatcher('し');
      expect(matcher.input('s')).toEqual({ status: 'correct' });
      expect(matcher.input('i')).toEqual({ status: 'complete' });
    });

    it('should accept "shi" for "し"', () => {
      const matcher = createRomajiMatcher('し');
      expect(matcher.input('s')).toEqual({ status: 'correct' });
      expect(matcher.input('h')).toEqual({ status: 'correct' });
      expect(matcher.input('i')).toEqual({ status: 'complete' });
    });

    it('should accept "ti" for "ち"', () => {
      const matcher = createRomajiMatcher('ち');
      expect(matcher.input('t')).toEqual({ status: 'correct' });
      expect(matcher.input('i')).toEqual({ status: 'complete' });
    });

    it('should accept "chi" for "ち"', () => {
      const matcher = createRomajiMatcher('ち');
      expect(matcher.input('c')).toEqual({ status: 'correct' });
      expect(matcher.input('h')).toEqual({ status: 'correct' });
      expect(matcher.input('i')).toEqual({ status: 'complete' });
    });

    it('should accept "tu" for "つ"', () => {
      const matcher = createRomajiMatcher('つ');
      expect(matcher.input('t')).toEqual({ status: 'correct' });
      expect(matcher.input('u')).toEqual({ status: 'complete' });
    });

    it('should accept "tsu" for "つ"', () => {
      const matcher = createRomajiMatcher('つ');
      expect(matcher.input('t')).toEqual({ status: 'correct' });
      expect(matcher.input('s')).toEqual({ status: 'correct' });
      expect(matcher.input('u')).toEqual({ status: 'complete' });
    });

    it('should accept "hu" for "ふ"', () => {
      const matcher = createRomajiMatcher('ふ');
      expect(matcher.input('h')).toEqual({ status: 'correct' });
      expect(matcher.input('u')).toEqual({ status: 'complete' });
    });

    it('should accept "fu" for "ふ"', () => {
      const matcher = createRomajiMatcher('ふ');
      expect(matcher.input('f')).toEqual({ status: 'correct' });
      expect(matcher.input('u')).toEqual({ status: 'complete' });
    });

    it('should accept "zi" for "じ"', () => {
      const matcher = createRomajiMatcher('じ');
      expect(matcher.input('z')).toEqual({ status: 'correct' });
      expect(matcher.input('i')).toEqual({ status: 'complete' });
    });

    it('should accept "ji" for "じ"', () => {
      const matcher = createRomajiMatcher('じ');
      expect(matcher.input('j')).toEqual({ status: 'correct' });
      expect(matcher.input('i')).toEqual({ status: 'complete' });
    });
  });

  describe('multi-character words', () => {
    it('should match "かき" as "kaki"', () => {
      const matcher = createRomajiMatcher('かき');
      expect(matcher.input('k')).toEqual({ status: 'correct' });
      expect(matcher.input('a')).toEqual({ status: 'correct' });
      expect(matcher.completedChars).toBe(1);
      expect(matcher.input('k')).toEqual({ status: 'correct' });
      expect(matcher.input('i')).toEqual({ status: 'complete' });
      expect(matcher.completedChars).toBe(2);
    });

    it('should track completedChars correctly', () => {
      const matcher = createRomajiMatcher('あいう');
      expect(matcher.completedChars).toBe(0);
      expect(matcher.totalChars).toBe(3);
      matcher.input('a');
      expect(matcher.completedChars).toBe(1);
      matcher.input('i');
      expect(matcher.completedChars).toBe(2);
      matcher.input('u');
      expect(matcher.completedChars).toBe(3);
      expect(matcher.isComplete).toBe(true);
    });
  });

  describe('double consonant (っ)', () => {
    it('should match "かった" as "katta"', () => {
      const matcher = createRomajiMatcher('かった');
      const input = 'katta';
      for (let i = 0; i < input.length - 1; i++) {
        expect(matcher.input(input[i])).toEqual({ status: 'correct' });
      }
      expect(matcher.input(input[input.length - 1])).toEqual({ status: 'complete' });
    });

    it('should match "きって" as "kitte"', () => {
      const matcher = createRomajiMatcher('きって');
      const input = 'kitte';
      for (let i = 0; i < input.length - 1; i++) {
        expect(matcher.input(input[i])).toEqual({ status: 'correct' });
      }
      expect(matcher.input(input[input.length - 1])).toEqual({ status: 'complete' });
    });

    it('should also accept "xtu" for standalone っ', () => {
      const matcher = createRomajiMatcher('かっ');
      // か = ka, っ = xtu
      expect(matcher.input('k')).toEqual({ status: 'correct' });
      expect(matcher.input('a')).toEqual({ status: 'correct' });
      expect(matcher.input('x')).toEqual({ status: 'correct' });
      expect(matcher.input('t')).toEqual({ status: 'correct' });
      expect(matcher.input('u')).toEqual({ status: 'complete' });
    });
  });

  describe('"ん" handling', () => {
    it('should accept "nn" for "ん"', () => {
      const matcher = createRomajiMatcher('ん');
      expect(matcher.input('n')).toEqual({ status: 'correct' });
      expect(matcher.input('n')).toEqual({ status: 'complete' });
    });

    it('should accept "n" before consonant for "んか"', () => {
      const matcher = createRomajiMatcher('んか');
      expect(matcher.input('n')).toEqual({ status: 'correct' });
      expect(matcher.input('k')).toEqual({ status: 'correct' }); // n confirmed as ん, k starts か
      expect(matcher.input('a')).toEqual({ status: 'complete' });
    });

    it('should require "nn" before vowel for "んあ"', () => {
      const matcher = createRomajiMatcher('んあ');
      expect(matcher.input('n')).toEqual({ status: 'correct' });
      expect(matcher.input('n')).toEqual({ status: 'correct' }); // nn confirms ん
      expect(matcher.input('a')).toEqual({ status: 'complete' });
    });

    it('should match "かんじ" as "kanji"', () => {
      const matcher = createRomajiMatcher('かんじ');
      const input = 'kanji';
      for (let i = 0; i < input.length - 1; i++) {
        expect(matcher.input(input[i])).toEqual({ status: 'correct' });
      }
      expect(matcher.input(input[input.length - 1])).toEqual({ status: 'complete' });
    });

    it('should also accept "kannji" for "かんじ"', () => {
      const matcher = createRomajiMatcher('かんじ');
      const input = 'kannji';
      for (let i = 0; i < input.length - 1; i++) {
        expect(matcher.input(input[i])).toEqual({ status: 'correct' });
      }
      expect(matcher.input(input[input.length - 1])).toEqual({ status: 'complete' });
    });
  });

  describe('combination characters (しゃ, ちょ, etc.)', () => {
    it('should match "しゃ" as "sha"', () => {
      const matcher = createRomajiMatcher('しゃ');
      expect(matcher.input('s')).toEqual({ status: 'correct' });
      expect(matcher.input('h')).toEqual({ status: 'correct' });
      expect(matcher.input('a')).toEqual({ status: 'complete' });
    });

    it('should match "しゃ" as "sya"', () => {
      const matcher = createRomajiMatcher('しゃ');
      expect(matcher.input('s')).toEqual({ status: 'correct' });
      expect(matcher.input('y')).toEqual({ status: 'correct' });
      expect(matcher.input('a')).toEqual({ status: 'complete' });
    });

    it('should match "ちょ" as "cho"', () => {
      const matcher = createRomajiMatcher('ちょ');
      expect(matcher.input('c')).toEqual({ status: 'correct' });
      expect(matcher.input('h')).toEqual({ status: 'correct' });
      expect(matcher.input('o')).toEqual({ status: 'complete' });
    });

    it('should match "ちょ" as "tyo"', () => {
      const matcher = createRomajiMatcher('ちょ');
      expect(matcher.input('t')).toEqual({ status: 'correct' });
      expect(matcher.input('y')).toEqual({ status: 'correct' });
      expect(matcher.input('o')).toEqual({ status: 'complete' });
    });
  });

  describe('acceptedRomaji tracking', () => {
    it('should track accepted romaji string', () => {
      const matcher = createRomajiMatcher('かき');
      matcher.input('k');
      matcher.input('a');
      expect(matcher.acceptedRomaji).toBe('ka');
      matcher.input('k');
      matcher.input('i');
      expect(matcher.acceptedRomaji).toBe('kaki');
    });
  });

  describe('hint generation', () => {
    it('should provide romaji hint for next expected input', () => {
      const matcher = createRomajiMatcher('かき');
      expect(matcher.getHint()).toContain('k');
      matcher.input('k');
      matcher.input('a');
      expect(matcher.getHint()).toContain('k');
    });
  });

  describe('real game words', () => {
    it('should match "あるてみすごうい" (アルテミス合意)', () => {
      const matcher = createRomajiMatcher('あるてみすごうい');
      const input = 'arutemisugouI';
      // Replace I with i for lowercase
      const normalizedInput = input.toLowerCase();
      for (let i = 0; i < normalizedInput.length - 1; i++) {
        const result = matcher.input(normalizedInput[i]);
        expect(result.status).not.toBe('wrong');
      }
      expect(matcher.input(normalizedInput[normalizedInput.length - 1])).toEqual({ status: 'complete' });
    });

    it('should match "けすらーしんどろーむ" (ケスラーシンドローム)', () => {
      const matcher = createRomajiMatcher('けすらーしんどろーむ');
      const input = 'kesura-sindoro-mu';
      for (let i = 0; i < input.length - 1; i++) {
        const result = matcher.input(input[i]);
        expect(result.status).not.toBe('wrong');
      }
      expect(matcher.input(input[input.length - 1])).toEqual({ status: 'complete' });
    });
  });
});

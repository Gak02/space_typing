import { ROMAJI_TABLE, N_CONFIRM_CONSONANTS } from './romaji-table';

export interface InputResult {
  status: 'correct' | 'wrong' | 'complete';
}

export interface RomajiMatcher {
  input(char: string): InputResult;
  readonly completedChars: number;
  readonly totalChars: number;
  readonly acceptedRomaji: string;
  readonly isComplete: boolean;
  getHint(): string;
}

/**
 * Segment: a single hiragana unit that can be typed independently.
 * A segment has multiple possible romaji paths.
 */
interface Segment {
  hiragana: string;
  romajiOptions: string[];
}

/**
 * Parse a hiragana string into segments.
 * Handles combination characters (e.g., しゃ) and っ doubling.
 */
function parseSegments(reading: string): Segment[] {
  const segments: Segment[] = [];
  let i = 0;

  while (i < reading.length) {
    // Try 2-character combinations first (e.g., しゃ, きょ)
    if (i + 1 < reading.length) {
      const twoChar = reading.slice(i, i + 2);
      if (ROMAJI_TABLE[twoChar]) {
        segments.push({ hiragana: twoChar, romajiOptions: ROMAJI_TABLE[twoChar] });
        i += 2;
        continue;
      }
    }

    // Handle っ (double consonant)
    if (reading[i] === 'っ') {
      // Look ahead to see what follows
      let nextSegmentRomajis: string[] | null = null;
      let nextLen = 0;

      if (i + 2 < reading.length) {
        const twoChar = reading.slice(i + 1, i + 3);
        if (ROMAJI_TABLE[twoChar]) {
          nextSegmentRomajis = ROMAJI_TABLE[twoChar];
          nextLen = 2;
        }
      }
      if (!nextSegmentRomajis && i + 1 < reading.length) {
        const oneChar = reading[i + 1];
        if (ROMAJI_TABLE[oneChar]) {
          nextSegmentRomajis = ROMAJI_TABLE[oneChar];
          nextLen = 1;
        }
      }

      if (nextSegmentRomajis) {
        // っ + next char: double the first consonant of next char's romaji
        const doubledOptions: string[] = [];
        for (const romaji of nextSegmentRomajis) {
          if (romaji.length > 0) {
            doubledOptions.push(romaji[0] + romaji);
          }
        }
        // Combined options: doubled consonant
        segments.push({
          hiragana: 'っ' + reading.slice(i + 1, i + 1 + nextLen),
          romajiOptions: doubledOptions,
        });
        i += 1 + nextLen;
        continue;
      }

      // Standalone っ (at end or before unknown char)
      segments.push({ hiragana: 'っ', romajiOptions: ROMAJI_TABLE['っ'] });
      i += 1;
      continue;
    }

    // Single character
    const oneChar = reading[i];
    if (ROMAJI_TABLE[oneChar]) {
      segments.push({ hiragana: oneChar, romajiOptions: ROMAJI_TABLE[oneChar] });
    } else {
      // Unknown character - pass through as-is
      segments.push({ hiragana: oneChar, romajiOptions: [oneChar] });
    }
    i += 1;
  }

  return segments;
}

/**
 * Create a romaji matcher for a given hiragana reading.
 * The matcher accepts one character at a time and tracks progress.
 */
export function createRomajiMatcher(reading: string): RomajiMatcher {
  const segments = parseSegments(reading);
  let currentSegmentIndex = 0;
  let acceptedRomaji = '';

  // For each segment, track which romaji options are still valid
  // and how many characters have been matched in the current segment
  let currentInputBuffer = '';
  let validPaths: string[] = [];
  let pendingN = false; // True when we've seen 'n' and waiting to determine if it's ん or start of na/ni/etc.

  function initSegmentPaths() {
    if (currentSegmentIndex < segments.length) {
      validPaths = [...segments[currentSegmentIndex].romajiOptions];
      currentInputBuffer = '';
      pendingN = false;
    }
  }

  initSegmentPaths();

  function isNSegment(): boolean {
    return currentSegmentIndex < segments.length &&
      segments[currentSegmentIndex].hiragana === 'ん';
  }

  function advanceSegment(): boolean {
    currentSegmentIndex++;
    if (currentSegmentIndex >= segments.length) {
      return true; // Complete
    }
    initSegmentPaths();
    return false;
  }

  function getTotalHiraganaChars(): number {
    let count = 0;
    for (const seg of segments) {
      count += seg.hiragana.length;
    }
    return count;
  }

  function getCompletedHiraganaChars(): number {
    let count = 0;
    for (let i = 0; i < currentSegmentIndex; i++) {
      count += segments[i].hiragana.length;
    }
    return count;
  }

  const matcher: RomajiMatcher = {
    input(char: string): InputResult {
      if (currentSegmentIndex >= segments.length) {
        return { status: 'wrong' };
      }

      // Handle ん special case
      if (isNSegment() && currentInputBuffer === 'n' && !pendingN) {
        // We already have 'n' in the buffer for ん segment
        // Check if char is 'n' (to complete as 'nn')
        if (char === 'n') {
          acceptedRomaji += 'n';
          const complete = advanceSegment();
          return { status: complete ? 'complete' : 'correct' };
        }
        if (char === "'") {
          acceptedRomaji += "'";
          const complete = advanceSegment();
          return { status: complete ? 'complete' : 'correct' };
        }
        // Check if next segment exists and char could start it
        if (currentSegmentIndex + 1 < segments.length) {
          const nextSeg = segments[currentSegmentIndex + 1];
          const nextPaths = nextSeg.romajiOptions;
          const canStartNext = nextPaths.some(p => p.startsWith(char));

          if (canStartNext && N_CONFIRM_CONSONANTS.has(char)) {
            // n is confirmed as ん, char starts next segment
            currentSegmentIndex++;
            if (currentSegmentIndex >= segments.length) {
              return { status: 'complete' };
            }
            initSegmentPaths();
            // Now process char against new segment
            return processCharForCurrentSegment(char);
          }
        }
        // char doesn't match anything useful
        return { status: 'wrong' };
      }

      return processCharForCurrentSegment(char);
    },

    get completedChars(): number {
      return getCompletedHiraganaChars();
    },

    get totalChars(): number {
      return getTotalHiraganaChars();
    },

    get acceptedRomaji(): string {
      return acceptedRomaji;
    },

    get isComplete(): boolean {
      return currentSegmentIndex >= segments.length;
    },

    getHint(): string {
      if (currentSegmentIndex >= segments.length) return '';
      const remaining = validPaths[0]?.slice(currentInputBuffer.length) || '';
      // Also peek at next segments for a more complete hint
      let hint = remaining;
      for (let i = currentSegmentIndex + 1; i < Math.min(currentSegmentIndex + 3, segments.length); i++) {
        hint += segments[i].romajiOptions[0] || '';
      }
      return hint;
    },
  };

  function processCharForCurrentSegment(char: string): InputResult {
    const testBuffer = currentInputBuffer + char;

    // Check which paths still match
    const stillValid = validPaths.filter(p => p.startsWith(testBuffer));

    if (stillValid.length === 0) {
      return { status: 'wrong' };
    }

    // Check if any path is exactly completed
    const exactMatch = stillValid.find(p => p === testBuffer);

    if (exactMatch) {
      acceptedRomaji += char;
      const complete = advanceSegment();
      return { status: complete ? 'complete' : 'correct' };
    }

    // Partial match - keep going
    currentInputBuffer = testBuffer;
    validPaths = stillValid;
    acceptedRomaji += char;

    // Special handling for ん: if buffer is 'n' and this is ん segment, mark pending
    if (isNSegment() && testBuffer === 'n') {
      pendingN = false; // Will be handled in main input()
    }

    return { status: 'correct' };
  }

  return matcher;
}

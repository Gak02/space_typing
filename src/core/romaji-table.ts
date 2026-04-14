/**
 * Hiragana to romaji mapping table.
 * Each hiragana (or hiragana combination) maps to an array of valid romaji inputs.
 */

// Single hiragana -> romaji options
export const ROMAJI_TABLE: Record<string, string[]> = {
  // Vowels
  'あ': ['a'],
  'い': ['i'],
  'う': ['u'],
  'え': ['e'],
  'お': ['o'],

  // K-row
  'か': ['ka'],
  'き': ['ki'],
  'く': ['ku'],
  'け': ['ke'],
  'こ': ['ko'],

  // S-row
  'さ': ['sa'],
  'し': ['si', 'shi'],
  'す': ['su'],
  'せ': ['se'],
  'そ': ['so'],

  // T-row
  'た': ['ta'],
  'ち': ['ti', 'chi'],
  'つ': ['tu', 'tsu'],
  'て': ['te'],
  'と': ['to'],

  // N-row
  'な': ['na'],
  'に': ['ni'],
  'ぬ': ['nu'],
  'ね': ['ne'],
  'の': ['no'],

  // H-row
  'は': ['ha'],
  'ひ': ['hi'],
  'ふ': ['hu', 'fu'],
  'へ': ['he'],
  'ほ': ['ho'],

  // M-row
  'ま': ['ma'],
  'み': ['mi'],
  'む': ['mu'],
  'め': ['me'],
  'も': ['mo'],

  // Y-row
  'や': ['ya'],
  'ゆ': ['yu'],
  'よ': ['yo'],

  // R-row
  'ら': ['ra'],
  'り': ['ri'],
  'る': ['ru'],
  'れ': ['re'],
  'ろ': ['ro'],

  // W-row
  'わ': ['wa'],
  'を': ['wo'],

  // N
  'ん': ['nn', "n'"],

  // Dakuten (voiced)
  'が': ['ga'],
  'ぎ': ['gi'],
  'ぐ': ['gu'],
  'げ': ['ge'],
  'ご': ['go'],

  'ざ': ['za'],
  'じ': ['zi', 'ji'],
  'ず': ['zu'],
  'ぜ': ['ze'],
  'ぞ': ['zo'],

  'だ': ['da'],
  'ぢ': ['di'],
  'づ': ['du', 'dzu'],
  'で': ['de'],
  'ど': ['do'],

  'ば': ['ba'],
  'び': ['bi'],
  'ぶ': ['bu'],
  'べ': ['be'],
  'ぼ': ['bo'],

  // Handakuten (semi-voiced)
  'ぱ': ['pa'],
  'ぴ': ['pi'],
  'ぷ': ['pu'],
  'ぺ': ['pe'],
  'ぽ': ['po'],

  // Small kana
  'ぁ': ['xa', 'la'],
  'ぃ': ['xi', 'li'],
  'ぅ': ['xu', 'lu'],
  'ぇ': ['xe', 'le'],
  'ぉ': ['xo', 'lo'],
  'っ': ['xtu', 'xtsu', 'ltu', 'ltsu'],
  'ゃ': ['xya', 'lya'],
  'ゅ': ['xyu', 'lyu'],
  'ょ': ['xyo', 'lyo'],

  // Combination characters (yi-dan + small ya/yu/yo)
  'きゃ': ['kya'],
  'きゅ': ['kyu'],
  'きょ': ['kyo'],

  'しゃ': ['sha', 'sya'],
  'しゅ': ['shu', 'syu'],
  'しょ': ['sho', 'syo'],

  'ちゃ': ['cha', 'tya'],
  'ちゅ': ['chu', 'tyu'],
  'ちょ': ['cho', 'tyo'],

  'にゃ': ['nya'],
  'にゅ': ['nyu'],
  'にょ': ['nyo'],

  'ひゃ': ['hya'],
  'ひゅ': ['hyu'],
  'ひょ': ['hyo'],

  'みゃ': ['mya'],
  'みゅ': ['myu'],
  'みょ': ['myo'],

  'りゃ': ['rya'],
  'りゅ': ['ryu'],
  'りょ': ['ryo'],

  'ぎゃ': ['gya'],
  'ぎゅ': ['gyu'],
  'ぎょ': ['gyo'],

  'じゃ': ['ja', 'zya', 'jya'],
  'じゅ': ['ju', 'zyu', 'jyu'],
  'じょ': ['jo', 'zyo', 'jyo'],

  'びゃ': ['bya'],
  'びゅ': ['byu'],
  'びょ': ['byo'],

  'ぴゃ': ['pya'],
  'ぴゅ': ['pyu'],
  'ぴょ': ['pyo'],

  // Long vowel mark
  'ー': ['-'],
};

// Characters that, when following 'n', confirm it as ん (not na/ni/nu/ne/no/nya/etc.)
// These are consonants other than n and y, plus some special characters
export const N_CONFIRM_CONSONANTS = new Set([
  'b', 'c', 'd', 'f', 'g', 'h', 'j', 'k', 'm', 'p', 'r', 's', 't', 'w', 'z',
]);

// Characters following 'n' that are ambiguous (could be na, ni, etc.)
export const N_VOWELS_AND_Y = new Set(['a', 'i', 'u', 'e', 'o', 'y', 'n']);

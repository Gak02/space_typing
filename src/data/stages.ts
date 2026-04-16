import type { StageDefinition, WordDefinition } from '../types';

const stage1Words: WordDefinition[] = [
  { display: 'アルテミス', reading: 'あるてみす', category: 'professional' },
  { display: '損害責任', reading: 'そんがいせきにん', category: 'professional' },
  { display: '平和利用', reading: 'へいわりよう', category: 'professional' },
  { display: '月面資源', reading: 'げつめんしげん', category: 'professional' },
  { display: '宇宙法', reading: 'うちゅうほう', category: 'professional' },
  { display: '宇宙条約', reading: 'うちゅうじょうやく', category: 'professional' },
  { display: '月協定', reading: 'つききょうてい', category: 'professional' },
  { display: '領有権', reading: 'りょうゆうけん', category: 'professional' },
  { display: '登録条約', reading: 'とうろくじょうやく', category: 'professional' },
  { display: '活動法', reading: 'かつどうほう', category: 'professional' },
  { display: '救助協定', reading: 'きゅうじょきょうてい', category: 'professional' },
  { display: '天体資源', reading: 'てんたいしげん', category: 'professional' },
  // Nuisance words
  { display: '理不尽なクレーム', reading: 'りふじんなくれーむ', category: 'nuisance' },
  { display: '徹夜の翻訳', reading: 'てつやのほんやく', category: 'nuisance' },
  { display: '無茶振り', reading: 'むちゃぶり', category: 'nuisance' },
];

const stage2Words: WordDefinition[] = [
  { display: 'ケスラー', reading: 'けすらー', category: 'professional' },
  { display: '衝突回避', reading: 'しょうとつかいひ', category: 'professional' },
  { display: 'デブリ除去', reading: 'でぶりじょきょ', category: 'professional' },
  { display: '低軌道', reading: 'ていきどう', category: 'professional' },
  { display: '状況監視', reading: 'じょうきょうかんし', category: 'professional' },
  { display: '軌道遷移', reading: 'きどうせんい', category: 'professional' },
  { display: '再突入', reading: 'さいとつにゅう', category: 'professional' },
  { display: 'デブリ', reading: 'でぶり', category: 'professional' },
  { display: '静止軌道', reading: 'せいしきどう', category: 'professional' },
  { display: '軌道力学', reading: 'きどうりきがく', category: 'professional' },
  { display: '接近警報', reading: 'せっきんけいほう', category: 'professional' },
  { display: '交通管制', reading: 'こうつうかんせい', category: 'professional' },
  // Nuisance words
  { display: '衛星が邪魔', reading: 'えいせいがじゃま', category: 'nuisance' },
  { display: '通信遅延', reading: 'つうしんちえん', category: 'nuisance' },
  { display: '予算削減', reading: 'よさんさくげん', category: 'nuisance' },
];

const stage3Words: WordDefinition[] = [
  { display: 'バイオバーデン', reading: 'ばいおばーでん', category: 'professional' },
  { display: 'クリーンルーム', reading: 'くりーんるーむ', category: 'professional' },
  { display: '汚染阻止', reading: 'おせんそし', category: 'professional' },
  { display: '惑星保護', reading: 'わくせいほご', category: 'professional' },
  { display: '微生物', reading: 'びせいぶつ', category: 'professional' },
  { display: '無菌組立', reading: 'むきんくみたて', category: 'professional' },
  { display: '滅菌処理', reading: 'めっきんしょり', category: 'professional' },
  { display: '生命探査', reading: 'せいめいたんさ', category: 'professional' },
  { display: '前方汚染', reading: 'ぜんぽうおせん', category: 'professional' },
  { display: '生物隔離', reading: 'せいぶつかくり', category: 'professional' },
  { display: '試料回収', reading: 'しりょうかいしゅう', category: 'professional' },
  { display: '検疫', reading: 'けんえき', category: 'professional' },
  { display: '汚染防止', reading: 'おせんぼうし', category: 'professional' },
  { display: '極限環境', reading: 'きょくげんかんきょう', category: 'professional' },
  // Nuisance words
  { display: '素手で触った', reading: 'すでさわった', category: 'nuisance' },
  { display: '謎の菌', reading: 'なぞのきん', category: 'nuisance' },
  { display: '締切が昨日', reading: 'しめきりがきのう', category: 'nuisance' },
];

const finalStageWords: WordDefinition[] = [
  { display: 'レゴリス', reading: 'れごりす', category: 'professional' },
  { display: '溶岩チューブ', reading: 'ようがんちゅーぶ', category: 'professional' },
  { display: '生命維持', reading: 'せいめいいじ', category: 'professional' },
  { display: '月面基地', reading: 'げつめんきち', category: 'professional' },
  { display: '放射線', reading: 'ほうしゃせん', category: 'professional' },
  { display: '水氷採掘', reading: 'すいひょうさいくつ', category: 'professional' },
  { display: '太陽光', reading: 'たいようこう', category: 'professional' },
  { display: 'モジュール', reading: 'もじゅーる', category: 'professional' },
  { display: 'ローバー', reading: 'ろーばー', category: 'professional' },
  { display: '通信中継', reading: 'つうしんちゅうけい', category: 'professional' },
  { display: '維持装置', reading: 'いじそうち', category: 'professional' },
  { display: '熱制御', reading: 'ねつせいぎょ', category: 'professional' },
  { display: 'エアロック', reading: 'えあろっく', category: 'professional' },
  { display: '月面測量', reading: 'げつめんそくりょう', category: 'professional' },
  { display: '重力実験', reading: 'じゅうりょくじっけん', category: 'professional' },
  { display: '宇宙農業', reading: 'うちゅうのうぎょう', category: 'professional' },
  // Nuisance words
  { display: 'トイレ故障', reading: 'といれこしょう', category: 'nuisance' },
  { display: '社内政治', reading: 'しゃないせいじ', category: 'nuisance' },
  { display: '通信途絶', reading: 'つうしんとぜつ', category: 'nuisance' },
];

// Convert fall time (seconds) to speed (position units per ms)
// position 0.0 (top) -> 1.0 (bottom), so speed = 1.0 / (fallTimeMs)
function fallTimeToSpeed(seconds: number): number {
  return 1.0 / (seconds * 1000);
}

export const STAGES: StageDefinition[] = [
  {
    id: 1,
    name: '宇宙法務・ルールメイカー',
    mission: '月面資源の所有権を巡る国際法務を切り抜けろ！',
    words: stage1Words,
    clearCondition: { wordsToComplete: 7, maxMissedWords: 8 },
    nuisanceIntervalMs: 20000,
    wordSpawnIntervalMs: 5000,
    wordSpeed: { min: fallTimeToSpeed(18), max: fallTimeToSpeed(14) },
  },
  {
    id: 2,
    name: '軌道上トラフィックマネージャー',
    mission: '渋滞する地球低軌道で、デブリとの衝突を回避せよ！',
    words: stage2Words,
    clearCondition: { wordsToComplete: 8, maxMissedWords: 7 },
    nuisanceIntervalMs: 18000,
    wordSpawnIntervalMs: 4500,
    wordSpeed: { min: fallTimeToSpeed(16), max: fallTimeToSpeed(12) },
  },
  {
    id: 3,
    name: '惑星保護官',
    mission: '地球の菌から月を守り抜け！',
    words: stage3Words,
    clearCondition: { wordsToComplete: 9, maxMissedWords: 6 },
    nuisanceIntervalMs: 15000,
    wordSpawnIntervalMs: 4000,
    wordSpeed: { min: fallTimeToSpeed(14), max: fallTimeToSpeed(10) },
  },
  {
    id: 4,
    name: '月面居住区アーキテクト',
    mission: '過酷な環境に、人類の新たなオフィスを建設せよ！',
    words: finalStageWords,
    clearCondition: { wordsToComplete: 10, maxMissedWords: 5 },
    nuisanceIntervalMs: 12000,
    wordSpawnIntervalMs: 3500,
    wordSpeed: { min: fallTimeToSpeed(12), max: fallTimeToSpeed(8) },
  },
];

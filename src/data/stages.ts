import type { StageDefinition, WordDefinition } from '../types';

const stage1Words: WordDefinition[] = [
  { display: 'アルテミス合意', reading: 'あるてみすごうい', category: 'professional' },
  { display: '損害責任条約', reading: 'そんがいせきにんじょうやく', category: 'professional' },
  { display: '宇宙空間平和利用委員会', reading: 'うちゅうくうかんへいわりよういいんかい', category: 'professional' },
  { display: '月面資源', reading: 'げつめんしげん', category: 'professional' },
  { display: '国際宇宙法', reading: 'こくさいうちゅうほう', category: 'professional' },
  { display: '宇宙条約', reading: 'うちゅうじょうやく', category: 'professional' },
  { display: '月協定', reading: 'つききょうてい', category: 'professional' },
  { display: '領有権禁止', reading: 'りょうゆうけんきんし', category: 'professional' },
  { display: '登録条約', reading: 'とうろくじょうやく', category: 'professional' },
  { display: '宇宙活動法', reading: 'うちゅうかつどうほう', category: 'professional' },
  { display: '救助返還協定', reading: 'きゅうじょへんかんきょうてい', category: 'professional' },
  { display: '天体資源法', reading: 'てんたいしげんほう', category: 'professional' },
  // Nuisance words
  { display: '他国からの理不尽なクレーム', reading: 'たこくからのりふじんなくれーむ', category: 'nuisance' },
  { display: '解釈違いによる徹夜の条約翻訳', reading: 'かいしゃくちがいによるてつやのじょうやくほんやく', category: 'nuisance' },
  { display: '上司の無茶振り', reading: 'じょうしのむちゃぶり', category: 'nuisance' },
];

const stage2Words: WordDefinition[] = [
  { display: 'ケスラーシンドローム', reading: 'けすらーしんどろーむ', category: 'professional' },
  { display: '衝突回避マヌーバ', reading: 'しょうとつかいひまぬーば', category: 'professional' },
  { display: '能動的デブリ除去', reading: 'のうどうてきでぶりじょきょ', category: 'professional' },
  { display: '地球低軌道', reading: 'ちきゅうていきどう', category: 'professional' },
  { display: '宇宙状況監視', reading: 'うちゅうじょうきょうかんし', category: 'professional' },
  { display: '軌道遷移', reading: 'きどうせんい', category: 'professional' },
  { display: '再突入', reading: 'さいとつにゅう', category: 'professional' },
  { display: 'デブリ追跡', reading: 'でぶりついせき', category: 'professional' },
  { display: '静止軌道', reading: 'せいしきどう', category: 'professional' },
  { display: '軌道力学', reading: 'きどうりきがく', category: 'professional' },
  { display: '接近警報', reading: 'せっきんけいほう', category: 'professional' },
  { display: '宇宙交通管制', reading: 'うちゅうこうつうかんせい', category: 'professional' },
  // Nuisance words
  { display: '大富豪の衛星が道を譲らない', reading: 'だいふごうのえいせいがみちをゆずらない', category: 'nuisance' },
  { display: '通信遅延によるニアミス', reading: 'つうしんちえんによるにあみす', category: 'nuisance' },
  { display: '予算削減の通達', reading: 'よさんさくげんのつうたつ', category: 'nuisance' },
];

const stage3Words: WordDefinition[] = [
  { display: 'バイオバーデン評価', reading: 'ばいおばーでんひょうか', category: 'professional' },
  { display: 'クリーンルーム検疫', reading: 'くりーんるーむけんえき', category: 'professional' },
  { display: '後方汚染阻止', reading: 'こうほうおせんそし', category: 'professional' },
  { display: '惑星保護', reading: 'わくせいほご', category: 'professional' },
  { display: '微生物管理', reading: 'びせいぶつかんり', category: 'professional' },
  { display: '無菌組立', reading: 'むきんくみたて', category: 'professional' },
  { display: '滅菌処理', reading: 'めっきんしょり', category: 'professional' },
  { display: '生命探査', reading: 'せいめいたんさ', category: 'professional' },
  { display: '前方汚染', reading: 'ぜんぽうおせん', category: 'professional' },
  { display: '生物隔離', reading: 'せいぶつかくり', category: 'professional' },
  { display: '試料回収', reading: 'しりょうかいしゅう', category: 'professional' },
  { display: '宇宙検疫', reading: 'うちゅうけんえき', category: 'professional' },
  { display: '汚染防止基準', reading: 'おせんぼうしきじゅん', category: 'professional' },
  { display: '極限環境微生物', reading: 'きょくげんかんきょうびせいぶつ', category: 'professional' },
  // Nuisance words
  { display: '技術者が素手で機体を触った', reading: 'ぎじゅつしゃがすでできたいをさわった', category: 'nuisance' },
  { display: '謎の菌を検出', reading: 'なぞのきんをけんしゅつ', category: 'nuisance' },
  { display: '報告書の締切が昨日', reading: 'ほうこくしょのしめきりがきのう', category: 'nuisance' },
];

const finalStageWords: WordDefinition[] = [
  { display: 'レゴリス3Dプリント', reading: 'れごりすすりーでぃーぷりんと', category: 'professional' },
  { display: '地下溶岩チューブ', reading: 'ちかようがんちゅーぶ', category: 'professional' },
  { display: '閉鎖生態系生命維持システム', reading: 'へいさせいたいけいせいめいいじしすてむ', category: 'professional' },
  { display: '月面基地', reading: 'げつめんきち', category: 'professional' },
  { display: '放射線遮蔽', reading: 'ほうしゃせんしゃへい', category: 'professional' },
  { display: '水氷採掘', reading: 'すいひょうさいくつ', category: 'professional' },
  { display: '太陽光発電', reading: 'たいようこうはつでん', category: 'professional' },
  { display: '居住モジュール', reading: 'きょじゅうもじゅーる', category: 'professional' },
  { display: '月面ローバー', reading: 'げつめんろーばー', category: 'professional' },
  { display: '通信中継', reading: 'つうしんちゅうけい', category: 'professional' },
  { display: '生命維持装置', reading: 'せいめいいじそうち', category: 'professional' },
  { display: '熱制御システム', reading: 'ねつせいぎょしすてむ', category: 'professional' },
  { display: 'エアロック', reading: 'えあろっく', category: 'professional' },
  { display: '月面測量', reading: 'げつめんそくりょう', category: 'professional' },
  { display: '微小重力実験', reading: 'びしょうじゅうりょくじっけん', category: 'professional' },
  { display: '宇宙農業', reading: 'うちゅうのうぎょう', category: 'professional' },
  // Nuisance words
  { display: '微小重力下でのトイレ故障', reading: 'びしょうじゅうりょくかでのといれこしょう', category: 'nuisance' },
  { display: '水資源を巡る社内政治', reading: 'みずしげんをめぐるしゃないせいじ', category: 'nuisance' },
  { display: '地球との通信が途切れた', reading: 'ちきゅうとのつうしんがとぎれた', category: 'nuisance' },
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
    clearCondition: { wordsToComplete: 10, maxMissedWords: 5 },
    nuisanceIntervalMs: 15000,
    wordSpawnIntervalMs: 4000,
    wordSpeed: { min: fallTimeToSpeed(12), max: fallTimeToSpeed(8) },
  },
  {
    id: 2,
    name: '軌道上トラフィックマネージャー',
    mission: '渋滞する地球低軌道で、デブリとの衝突を回避せよ！',
    words: stage2Words,
    clearCondition: { wordsToComplete: 12, maxMissedWords: 4 },
    nuisanceIntervalMs: 12000,
    wordSpawnIntervalMs: 3500,
    wordSpeed: { min: fallTimeToSpeed(10), max: fallTimeToSpeed(6) },
  },
  {
    id: 3,
    name: '惑星保護官',
    mission: '地球の菌から月を守り抜け！',
    words: stage3Words,
    clearCondition: { wordsToComplete: 14, maxMissedWords: 3 },
    nuisanceIntervalMs: 10000,
    wordSpawnIntervalMs: 3000,
    wordSpeed: { min: fallTimeToSpeed(8), max: fallTimeToSpeed(5) },
  },
  {
    id: 4,
    name: '月面居住区アーキテクト',
    mission: '過酷な環境に、人類の新たなオフィスを建設せよ！',
    words: finalStageWords,
    clearCondition: { wordsToComplete: 16, maxMissedWords: 3 },
    nuisanceIntervalMs: 8000,
    wordSpawnIntervalMs: 2500,
    wordSpeed: { min: fallTimeToSpeed(7), max: fallTimeToSpeed(4) },
  },
];

import type { TotalScore, DiagnosisResult } from '../types';

interface CareerProfile {
  title: string;
  description: string;
}

const CAREERS: Record<string, CareerProfile> = {
  accuracy: {
    title: '宇宙法務・ルールメイカー',
    description: 'あなたの正確無比なタイピングは、宇宙法務の世界で輝きます。複雑な国際条約のドラフトも、一字一句間違えない精密さが求められるこの職業にぴったり。月面資源の所有権紛争も、あなたの手にかかれば円満解決です。',
  },
  speed: {
    title: '軌道上トラフィックマネージャー',
    description: 'その圧倒的なスピードは、地球低軌道の交通管制にうってつけ。毎秒数千個のデブリが飛び交う宇宙空間で、瞬時の判断と素早い操作が命綱。大富豪の衛星が道を譲らなくても、あなたなら華麗に回避できるでしょう。',
  },
  stress: {
    title: '惑星保護官',
    description: 'お邪魔ワードにも動じないメンタルの強さは、惑星保護官の資質そのもの。技術者が素手で機体を触っても、謎の菌が検出されても、冷静に対処できるあなたは地球と月の両方を汚染から守る最後の砦です。',
  },
  balanced: {
    title: '月面居住区アーキテクト',
    description: '正確性・スピード・ストレス耐性がバランスよく高いあなたは、月面居住区の設計者にふさわしい。レゴリス3Dプリントも地下溶岩チューブ活用も、総合力が問われるこの職業で、人類の新たなオフィスを完成させてください。',
  },
};

function getRank(value: number): string {
  if (value >= 0.9) return 'S';
  if (value >= 0.7) return 'A';
  if (value >= 0.5) return 'B';
  return 'C';
}

function determineDominantParam(score: TotalScore): string {
  const { overallAccuracy, overallSpeed, overallStressTolerance } = score;

  // Normalize speed to 0-1 range (assume 6 cps = 1.0)
  const normalizedSpeed = Math.min(overallSpeed / 6, 1.0);

  const params = [
    { key: 'accuracy', value: overallAccuracy },
    { key: 'speed', value: normalizedSpeed },
    { key: 'stress', value: overallStressTolerance },
  ];

  params.sort((a, b) => b.value - a.value);

  // Check if balanced (top and bottom within 0.15)
  if (params[0].value - params[2].value < 0.15) {
    return 'balanced';
  }

  return params[0].key;
}

export function diagnose(score: TotalScore): DiagnosisResult {
  const dominant = determineDominantParam(score);
  const career = CAREERS[dominant];
  const normalizedSpeed = Math.min(score.overallSpeed / 6, 1.0);

  return {
    careerTitle: career.title,
    careerDescription: career.description,
    parameters: {
      accuracy: { value: score.overallAccuracy, rank: getRank(score.overallAccuracy) },
      speed: { value: normalizedSpeed, rank: getRank(normalizedSpeed) },
      stressTolerance: { value: score.overallStressTolerance, rank: getRank(score.overallStressTolerance) },
    },
    shareText: `【月面転職クエスト】\nあなたの月面での最終役職は【${career.title}】です！\n正確性: ${getRank(score.overallAccuracy)} / スピード: ${getRank(normalizedSpeed)} / ストレス耐性: ${getRank(score.overallStressTolerance)}\n#月面転職クエスト`,
  };
}

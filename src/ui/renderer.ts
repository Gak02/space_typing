import type { GameState, ActiveWord, StageScore, DiagnosisResult } from '../types';
import { GameLoop } from '../core/game-loop';

export class Renderer {
  private app: HTMLElement;
  private game: GameLoop;
  private previousWordIds = new Set<string>();
  private starfieldCreated = false;

  constructor(app: HTMLElement, game: GameLoop) {
    this.app = app;
    this.game = game;
  }

  render(state: GameState): void {
    const phase = state.phase;

    switch (phase.type) {
      case 'title':
        this.renderTitleScreen();
        break;
      case 'stage-intro':
        this.renderStageIntroScreen(phase.stageId);
        break;
      case 'playing':
        this.renderGameScreen(state);
        break;
      case 'stage-clear':
        this.renderStageClearScreen(phase.stageId, phase.score);
        break;
      case 'game-over':
        this.renderGameOverScreen(phase.stageId, phase.score);
        break;
      case 'diagnosis':
        this.renderDiagnosisScreen(phase.result);
        break;
    }
  }

  private renderTitleScreen(): void {
    if (this.app.querySelector('.title-screen')) return;
    this.app.innerHTML = `
      <div class="screen title-screen bg-dark-gradient">
        <div class="starfield" id="starfield"></div>
        <div class="title-logo animate-fadein" style="position:relative;z-index:1;">
          <div class="title-main">月面転職クエスト</div>
          <div class="title-decoration"></div>
          <div class="title-sub">未知の宇宙職業で月を目指せ</div>
        </div>
        <div class="title-cta animate-fadein delay-3" style="position:relative;z-index:1;">
          <button class="btn-primary" id="btn-start">ミッション開始</button>
        </div>
      </div>
    `;
    this.createStarfield();
    document.getElementById('btn-start')?.addEventListener('click', () => {
      this.game.startGame();
    });
  }

  private renderStageIntroScreen(stageId: number): void {
    if (this.app.querySelector('.stage-intro-screen')) return;
    const stageName = this.game.getCurrentStageName();
    const mission = this.game.getCurrentMission();
    const stageLabel = stageId === 4 ? 'Final Stage' : `Stage ${stageId}`;

    this.app.innerHTML = `
      <div class="screen stage-intro-screen bg-dark-gradient">
        <div class="starfield" id="starfield"></div>
        <div style="position:relative;z-index:1;display:flex;flex-direction:column;align-items:center;">
          <div class="stage-number animate-fadein">${stageLabel}</div>
          <div class="stage-name animate-fadein delay-1">${stageName}</div>
          <div class="stage-mission-label animate-fadein delay-2">Mission</div>
          <div class="stage-mission animate-fadein delay-3">${mission}</div>
          <div class="stage-start-btn animate-fadein delay-4">
            <button class="btn-primary" id="btn-stage-start">開始</button>
          </div>
        </div>
      </div>
    `;
    this.createStarfield();
    document.getElementById('btn-stage-start')?.addEventListener('click', () => {
      this.game.confirmStageIntro();
    });
  }

  private renderGameScreen(state: GameState): void {
    const phase = state.phase;
    if (phase.type !== 'playing') return;

    // Only create the game layout once
    if (!this.app.querySelector('.game-area')) {
      const stage = this.game.getCurrentStageName();
      const mission = this.game.getCurrentMission();
      this.app.innerHTML = `
        <div class="game-area bg-dark-gradient">
          <div class="starfield" id="starfield"></div>
          <div class="game-hud">
            <div class="hud-left">
              <div class="hud-stage-name">${stage}</div>
              <div class="hud-mission">${mission}</div>
            </div>
            <div class="hud-right">
              <div class="hud-stat">
                <div class="hud-stat-label">cleared</div>
                <div class="hud-stat-value" id="hud-cleared">0</div>
              </div>
              <div class="hud-stat">
                <div class="hud-stat-label">missed</div>
                <div class="hud-stat-value" id="hud-missed">0</div>
              </div>
              <div class="hud-stat">
                <div class="hud-stat-label">accuracy</div>
                <div class="hud-stat-value" id="hud-accuracy">-</div>
              </div>
            </div>
          </div>
          <div class="game-progress">
            <div class="progress-bar">
              <div class="progress-bar-fill" id="progress-fill" style="width: 0%"></div>
            </div>
          </div>
          <div class="word-container" id="word-container"></div>
          <div class="input-area">
            <div class="input-display">
              <span id="input-text"></span><span class="input-cursor"></span>
            </div>
            <div class="input-hint">タイピングで宇宙用語を撃破せよ</div>
          </div>
        </div>
      `;
      this.createStarfield();
      this.previousWordIds.clear();
    }

    // Update HUD
    this.updateHUD(state);

    // Update words
    this.updateWords(state);

    // Update input display
    this.updateInputDisplay(state);
  }

  private updateHUD(state: GameState): void {
    const clearedEl = document.getElementById('hud-cleared');
    const missedEl = document.getElementById('hud-missed');
    const accuracyEl = document.getElementById('hud-accuracy');
    const progressEl = document.getElementById('progress-fill');

    if (clearedEl) clearedEl.textContent = String(state.clearedWords);

    if (missedEl) {
      missedEl.textContent = String(state.missedWords);
      missedEl.className = state.missedWords >= 3
        ? 'hud-stat-value hud-stat-value--danger'
        : 'hud-stat-value';
    }

    if (accuracyEl) {
      const acc = state.totalKeystrokes > 0
        ? Math.round((state.correctKeystrokes / state.totalKeystrokes) * 100)
        : 100;
      accuracyEl.textContent = `${acc}%`;
    }

    if (progressEl) {
      // Progress based on stage clear condition (assume 10 for stage 1, etc.)
      const target = 10 + (state.phase.type === 'playing' ? (state.phase.stageId - 1) * 2 : 0);
      const pct = Math.min(100, (state.clearedWords / target) * 100);
      progressEl.style.width = `${pct}%`;
    }
  }

  private updateWords(state: GameState): void {
    const container = document.getElementById('word-container');
    if (!container) return;

    const currentWordIds = new Set(state.activeWords.map(w => w.id));

    // Remove words that are no longer active (with clearing animation)
    for (const prevId of this.previousWordIds) {
      if (!currentWordIds.has(prevId)) {
        const el = document.getElementById(`word-${prevId}`);
        if (el) {
          el.classList.add('falling-word--clearing');
          setTimeout(() => el.remove(), 400);
        }
      }
    }

    // Add/update words
    for (const word of state.activeWords) {
      let el = document.getElementById(`word-${word.id}`);

      if (!el) {
        el = this.createWordElement(word);
        container.appendChild(el);
      }

      this.updateWordElement(el, word, state.targetWordId);
    }

    this.previousWordIds = currentWordIds;
  }

  private createWordElement(word: ActiveWord): HTMLElement {
    const el = document.createElement('div');
    el.id = `word-${word.id}`;
    el.className = `falling-word lane-${word.lane}`;

    if (word.definition.category === 'nuisance') {
      el.classList.add('falling-word--nuisance');
    }

    el.innerHTML = `
      <div class="word-display">${word.definition.display}</div>
      <div class="word-reading">${word.definition.reading}</div>
      <div class="word-romaji">
        <span class="typed"></span><span class="remaining"></span>
      </div>
    `;

    return el;
  }

  private updateWordElement(el: HTMLElement, word: ActiveWord, targetId: string | null): void {
    // Update position
    const containerHeight = document.getElementById('word-container')?.offsetHeight || 600;
    const topPx = word.position * containerHeight;
    el.style.top = `${topPx}px`;

    // Update targeted state
    if (word.id === targetId) {
      el.classList.add('falling-word--targeted');
    } else {
      el.classList.remove('falling-word--targeted');
    }

    // Update romaji display
    const typedSpan = el.querySelector('.typed');
    const remainingSpan = el.querySelector('.remaining');
    if (typedSpan && remainingSpan) {
      typedSpan.textContent = word.matcher.acceptedRomaji;
      remainingSpan.textContent = word.matcher.getHint();
    }
  }

  private updateInputDisplay(state: GameState): void {
    const inputEl = document.getElementById('input-text');
    if (inputEl) {
      inputEl.textContent = state.currentInput;
    }
  }

  showWrongFlash(): void {
    const area = this.app.querySelector('.game-area');
    if (area) {
      area.classList.add('wrong-flash');
      setTimeout(() => area.classList.remove('wrong-flash'), 300);
    }
  }

  private renderStageClearScreen(stageId: number, score: StageScore): void {
    if (this.app.querySelector('.stage-clear-screen')) return;

    const accPct = Math.round(score.accuracy * 100);
    const speedStr = score.averageSpeed.toFixed(1);

    this.app.innerHTML = `
      <div class="screen stage-clear-screen bg-dark-gradient">
        <div class="starfield" id="starfield"></div>
        <div style="position:relative;z-index:1;display:flex;flex-direction:column;align-items:center;">
          <div class="clear-title animate-fadein">Stage Clear</div>
          <div class="clear-stats animate-fadein delay-2">
            <div class="clear-stat">
              <div class="clear-stat-label">正確性</div>
              <div class="clear-stat-value clear-stat-value--highlight">${accPct}%</div>
            </div>
            <div class="clear-stat">
              <div class="clear-stat-label">速度</div>
              <div class="clear-stat-value">${speedStr} cps</div>
            </div>
            <div class="clear-stat">
              <div class="clear-stat-label">クリア</div>
              <div class="clear-stat-value">${score.wordsClearedCount}</div>
            </div>
            <div class="clear-stat">
              <div class="clear-stat-label">ミス</div>
              <div class="clear-stat-value">${score.missedWordsCount}</div>
            </div>
          </div>
          <div class="animate-fadein delay-4" style="margin-top:32px;">
            <button class="btn-primary" id="btn-next-stage">次のステージへ</button>
          </div>
        </div>
      </div>
    `;
    this.createStarfield();
    document.getElementById('btn-next-stage')?.addEventListener('click', () => {
      this.game.advanceToNextStage();
    });
  }

  private renderGameOverScreen(stageId: number, score: StageScore): void {
    if (this.app.querySelector('.gameover-screen')) return;

    this.app.innerHTML = `
      <div class="screen gameover-screen bg-dark-gradient">
        <div class="starfield" id="starfield"></div>
        <div style="position:relative;z-index:1;display:flex;flex-direction:column;align-items:center;">
          <div class="gameover-title animate-fadein">Mission Failed</div>
          <div class="gameover-message animate-fadein delay-1">
            ミッション失敗...しかし宇宙開発に失敗はつきもの。再挑戦して月を目指そう。
          </div>
          <div class="clear-stats animate-fadein delay-2" style="margin-top:24px;">
            <div class="clear-stat">
              <div class="clear-stat-label">クリア</div>
              <div class="clear-stat-value">${score.wordsClearedCount}</div>
            </div>
            <div class="clear-stat">
              <div class="clear-stat-label">ミス</div>
              <div class="clear-stat-value" style="color:var(--commerce-orange)">${score.missedWordsCount}</div>
            </div>
          </div>
          <div class="gameover-actions animate-fadein delay-3">
            <button class="btn-primary" id="btn-retry">再挑戦</button>
            <button class="btn-secondary" id="btn-title">タイトルへ</button>
          </div>
        </div>
      </div>
    `;
    this.createStarfield();
    document.getElementById('btn-retry')?.addEventListener('click', () => {
      this.game.retryStage();
    });
    document.getElementById('btn-title')?.addEventListener('click', () => {
      this.game.restart();
    });
  }

  private renderDiagnosisScreen(result: DiagnosisResult): void {
    if (this.app.querySelector('.diagnosis-screen')) return;

    const rankClass = (rank: string) => rank === 'S' ? 'diagnosis-param-rank diagnosis-param-rank--s' : 'diagnosis-param-rank';

    this.app.innerHTML = `
      <div class="screen diagnosis-screen">
        <div class="diagnosis-header animate-fadein">あなたの月面での最終役職</div>
        <div class="diagnosis-career-title animate-fadein delay-1">${result.careerTitle}</div>
        <div class="title-decoration animate-fadein delay-2" style="background:var(--ps-blue);"></div>
        <div class="diagnosis-description animate-fadein delay-2">${result.careerDescription}</div>
        <div class="diagnosis-params animate-fadein delay-3">
          <div class="diagnosis-param">
            <div class="diagnosis-param-label">正確性</div>
            <div class="${rankClass(result.parameters.accuracy.rank)}">${result.parameters.accuracy.rank}</div>
            <div class="diagnosis-param-value">${Math.round(result.parameters.accuracy.value * 100)}%</div>
          </div>
          <div class="diagnosis-param">
            <div class="diagnosis-param-label">速度</div>
            <div class="${rankClass(result.parameters.speed.rank)}">${result.parameters.speed.rank}</div>
            <div class="diagnosis-param-value">${Math.round(result.parameters.speed.value * 100)}%</div>
          </div>
          <div class="diagnosis-param">
            <div class="diagnosis-param-label">ストレス耐性</div>
            <div class="${rankClass(result.parameters.stressTolerance.rank)}">${result.parameters.stressTolerance.rank}</div>
            <div class="diagnosis-param-value">${Math.round(result.parameters.stressTolerance.value * 100)}%</div>
          </div>
        </div>
        <div class="diagnosis-share animate-fadein delay-4">
          <button class="btn-primary" id="btn-share">結果をシェア</button>
          <button class="btn-secondary" id="btn-restart">もう一度プレイ</button>
        </div>
      </div>
    `;

    document.getElementById('btn-share')?.addEventListener('click', () => {
      if (navigator.share) {
        navigator.share({ text: result.shareText });
      } else {
        navigator.clipboard.writeText(result.shareText);
        const btn = document.getElementById('btn-share');
        if (btn) {
          btn.textContent = 'コピーしました';
          setTimeout(() => { btn.textContent = '結果をシェア'; }, 2000);
        }
      }
    });

    document.getElementById('btn-restart')?.addEventListener('click', () => {
      this.game.restart();
    });
  }

  private createStarfield(): void {
    const container = document.getElementById('starfield');
    if (!container || container.children.length > 0) return;

    const count = 80;
    for (let i = 0; i < count; i++) {
      const star = document.createElement('div');
      const size = Math.random();
      star.className = `star ${size < 0.5 ? 'star--small' : size < 0.8 ? 'star--medium' : 'star--large'}`;
      if (Math.random() > 0.7) star.classList.add('star--twinkle');
      star.style.left = `${Math.random() * 100}%`;
      star.style.top = `${Math.random() * 100}%`;
      star.style.animationDelay = `${Math.random() * 5}s`;
      container.appendChild(star);
    }
  }
}

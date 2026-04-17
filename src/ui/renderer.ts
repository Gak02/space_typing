import type { GameState, ActiveWord, StageScore, DiagnosisResult } from '../types';
import { GameLoop } from '../core/game-loop';

// === Constellation Data (real star positions, simplified) ===
interface ConstellationStar { x: number; y: number; }
interface Constellation {
  name: string;
  nameJp: string;
  stars: ConstellationStar[];
  lines: [number, number][];
}

const CONSTELLATIONS: Constellation[] = [
  { // Orion (オリオン座)
    name: 'Orion', nameJp: 'オリオン座',
    stars: [
      { x: 0.12, y: 0.10 }, { x: 0.18, y: 0.08 },
      { x: 0.15, y: 0.15 }, { x: 0.14, y: 0.18 }, { x: 0.16, y: 0.18 },
      { x: 0.11, y: 0.25 }, { x: 0.19, y: 0.24 },
    ],
    lines: [[0,2],[1,2],[2,3],[2,4],[3,5],[4,6]],
  },
  { // Cassiopeia (カシオペア座) - W shape
    name: 'Cassiopeia', nameJp: 'カシオペア座',
    stars: [
      { x: 0.70, y: 0.05 }, { x: 0.74, y: 0.10 },
      { x: 0.78, y: 0.06 }, { x: 0.82, y: 0.11 },
      { x: 0.86, y: 0.07 },
    ],
    lines: [[0,1],[1,2],[2,3],[3,4]],
  },
  { // Ursa Major (おおぐま座 - 北斗七星)
    name: 'Big Dipper', nameJp: '北斗七星',
    stars: [
      { x: 0.30, y: 0.30 }, { x: 0.35, y: 0.28 },
      { x: 0.39, y: 0.30 }, { x: 0.40, y: 0.34 },
      { x: 0.37, y: 0.37 }, { x: 0.33, y: 0.39 },
      { x: 0.29, y: 0.37 },
    ],
    lines: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6]],
  },
  { // Scorpius (さそり座)
    name: 'Scorpius', nameJp: 'さそり座',
    stars: [
      { x: 0.82, y: 0.35 }, { x: 0.85, y: 0.40 },
      { x: 0.87, y: 0.45 }, { x: 0.86, y: 0.50 },
      { x: 0.83, y: 0.53 }, { x: 0.80, y: 0.50 },
    ],
    lines: [[0,1],[1,2],[2,3],[3,4],[4,5]],
  },
  { // Cygnus (はくちょう座 - 十字形)
    name: 'Cygnus', nameJp: 'はくちょう座',
    stars: [
      { x: 0.55, y: 0.08 }, { x: 0.55, y: 0.14 },
      { x: 0.55, y: 0.20 }, { x: 0.50, y: 0.14 },
      { x: 0.60, y: 0.14 },
    ],
    lines: [[0,1],[1,2],[3,1],[1,4]],
  },
  { // Leo (しし座)
    name: 'Leo', nameJp: 'しし座',
    stars: [
      { x: 0.05, y: 0.45 }, { x: 0.10, y: 0.42 },
      { x: 0.14, y: 0.45 }, { x: 0.12, y: 0.50 },
      { x: 0.08, y: 0.52 }, { x: 0.05, y: 0.50 },
    ],
    lines: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,0]],
  },
  { // Gemini (ふたご座)
    name: 'Gemini', nameJp: 'ふたご座',
    stars: [
      { x: 0.42, y: 0.05 }, { x: 0.48, y: 0.05 },
      { x: 0.41, y: 0.12 }, { x: 0.49, y: 0.12 },
      { x: 0.40, y: 0.18 }, { x: 0.50, y: 0.18 },
    ],
    lines: [[0,2],[2,4],[1,3],[3,5],[0,1]],
  },
  { // Southern Cross (みなみじゅうじ座)
    name: 'Crux', nameJp: 'みなみじゅうじ座',
    stars: [
      { x: 0.65, y: 0.28 }, { x: 0.65, y: 0.38 },
      { x: 0.60, y: 0.33 }, { x: 0.70, y: 0.33 },
    ],
    lines: [[0,1],[2,3]],
  },
];

// === 3D SVG Lander (Apollo LM / Orion inspired, with gradients) ===
const LANDER_SVG = `<svg viewBox="0 0 130 155" xmlns="http://www.w3.org/2000/svg" class="lander-svg">
  <defs>
    <!-- Metallic blue-silver body -->
    <linearGradient id="ld-body" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%"   stop-color="#c8e8ff"/>
      <stop offset="30%"  stop-color="#5599cc"/>
      <stop offset="70%"  stop-color="#1a3a5c"/>
      <stop offset="100%" stop-color="#060e1a"/>
    </linearGradient>
    <!-- Gold thermal insulation (Mylar foil) -->
    <linearGradient id="ld-gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%"   stop-color="#fff0a0"/>
      <stop offset="35%"  stop-color="#e8a800"/>
      <stop offset="75%"  stop-color="#a06000"/>
      <stop offset="100%" stop-color="#3a1e00"/>
    </linearGradient>
    <!-- Dark metallic for engine bell / collar -->
    <linearGradient id="ld-metal" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%"   stop-color="#aaaaaa"/>
      <stop offset="40%"  stop-color="#444455"/>
      <stop offset="100%" stop-color="#111122"/>
    </linearGradient>
    <!-- Landing leg gradient -->
    <linearGradient id="ld-leg" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%"   stop-color="#88aacc"/>
      <stop offset="50%"  stop-color="#334466"/>
      <stop offset="100%" stop-color="#112233"/>
    </linearGradient>
    <!-- Window -->
    <radialGradient id="ld-win" cx="35%" cy="30%" r="65%">
      <stop offset="0%"   stop-color="#aaeeff"/>
      <stop offset="45%"  stop-color="#0077bb"/>
      <stop offset="100%" stop-color="#002244"/>
    </radialGradient>
    <!-- Flame outer -->
    <radialGradient id="ld-flame" cx="50%" cy="5%" r="95%">
      <stop offset="0%"   stop-color="#ffffff" stop-opacity="1"/>
      <stop offset="15%"  stop-color="#ffee88" stop-opacity="1"/>
      <stop offset="50%"  stop-color="#ff6600" stop-opacity="0.85"/>
      <stop offset="100%" stop-color="#ff1100" stop-opacity="0"/>
    </radialGradient>
    <!-- Drop shadow -->
    <filter id="ld-shadow" x="-15%" y="-15%" width="130%" height="130%">
      <feDropShadow dx="1" dy="3" stdDeviation="2.5" flood-color="#000033" flood-opacity="0.7"/>
    </filter>
    <!-- Subtle glow for whole ship -->
    <filter id="ld-glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>

  <!-- ── Antenna ── -->
  <line x1="65" y1="3" x2="65" y2="18" stroke="#88ccee" stroke-width="1.5" stroke-linecap="round"/>
  <circle cx="65" cy="3" r="2.5" fill="#ff4444">
    <animate attributeName="opacity" values="1;0.1;1" dur="1.4s" repeatCount="indefinite"/>
  </circle>

  <!-- ── Command module cone (3D: gradient fill + highlight sliver) ── -->
  <polygon points="43,44 65,16 87,44"
    fill="url(#ld-body)" stroke="#3377aa" stroke-width="0.6"
    filter="url(#ld-shadow)"/>
  <!-- Highlight on lit face -->
  <polygon points="50,44 65,18 70,44" fill="rgba(255,255,255,0.18)"/>
  <!-- Shadow on dark face -->
  <polygon points="80,44 65,18 87,44" fill="rgba(0,0,30,0.3)"/>

  <!-- ── Docking collar ── -->
  <rect x="53" y="42" width="24" height="7" rx="2"
    fill="url(#ld-metal)" stroke="#4488aa" stroke-width="0.5"/>
  <rect x="55" y="43" width="10" height="3" rx="1" fill="rgba(200,240,255,0.25)"/>

  <!-- ── Ascent stage body (gold thermal blanket) ── -->
  <rect x="39" y="49" width="52" height="26" rx="3"
    fill="url(#ld-gold)" stroke="#cc8800" stroke-width="0.6"
    filter="url(#ld-shadow)"/>
  <!-- Gold highlight (top bright strip) -->
  <rect x="39" y="49" width="52" height="9" rx="3" fill="rgba(255,255,200,0.28)"/>
  <!-- Gold shadow (bottom dark strip) -->
  <rect x="39" y="66" width="52" height="9" rx="3" fill="rgba(60,30,0,0.35)"/>
  <!-- Panel seam lines -->
  <line x1="39" y1="60" x2="91" y2="60" stroke="#aa7700" stroke-width="0.6" opacity="0.5"/>
  <line x1="57" y1="49" x2="57" y2="75" stroke="#aa7700" stroke-width="0.6" opacity="0.5"/>
  <line x1="73" y1="49" x2="73" y2="75" stroke="#aa7700" stroke-width="0.5" opacity="0.4"/>

  <!-- ── Porthole window ── -->
  <circle cx="65" cy="61" r="8" fill="url(#ld-win)" stroke="#66aacc" stroke-width="1.2"/>
  <!-- Specular highlight -->
  <ellipse cx="61" cy="57" rx="3" ry="2" fill="rgba(255,255,255,0.55)" transform="rotate(-20,61,57)"/>
  <!-- Rim reflection -->
  <circle cx="65" cy="61" r="8" fill="none" stroke="rgba(180,230,255,0.4)" stroke-width="0.8"/>

  <!-- ── RCS thruster pods (sides) ── -->
  <rect x="27" y="55" width="12" height="9" rx="2"
    fill="url(#ld-metal)" stroke="#335577" stroke-width="0.5"/>
  <rect x="91" y="55" width="12" height="9" rx="2"
    fill="url(#ld-metal)" stroke="#335577" stroke-width="0.5"/>
  <!-- Nozzle openings -->
  <ellipse cx="27" cy="59" rx="2" ry="3" fill="#000a1a"/>
  <ellipse cx="103" cy="59" rx="2" ry="3" fill="#000a1a"/>
  <!-- Highlight on pods -->
  <rect x="28" y="55" width="5" height="4" rx="1" fill="rgba(180,220,255,0.2)"/>
  <rect x="92" y="55" width="5" height="4" rx="1" fill="rgba(180,220,255,0.2)"/>

  <!-- ── Descent stage (lower box) ── -->
  <rect x="37" y="75" width="56" height="20" rx="3"
    fill="url(#ld-body)" stroke="#2255aa" stroke-width="0.6"
    filter="url(#ld-shadow)"/>
  <!-- Descent stage top highlight -->
  <rect x="37" y="75" width="56" height="7" rx="3" fill="rgba(120,180,255,0.22)"/>
  <!-- Panel details -->
  <line x1="55" y1="75" x2="55" y2="95" stroke="#1a3355" stroke-width="0.6" opacity="0.6"/>
  <line x1="75" y1="75" x2="75" y2="95" stroke="#1a3355" stroke-width="0.6" opacity="0.6"/>
  <rect x="59" y="79" width="12" height="7" rx="1" fill="rgba(0,200,255,0.12)" stroke="#336699" stroke-width="0.4"/>

  <!-- ── Engine bell (3D tapered) ── -->
  <path d="M48,95 L39,116 L91,116 L82,95 Z"
    fill="url(#ld-metal)" stroke="#334455" stroke-width="0.7"
    filter="url(#ld-shadow)"/>
  <!-- Inner bell (dark bore) -->
  <path d="M51,95 L43,113 L87,113 L79,95 Z" fill="#080c18"/>
  <!-- Rim highlight -->
  <ellipse cx="65" cy="116" rx="26" ry="5" fill="none" stroke="#556677" stroke-width="1.2"/>
  <!-- Interior engine glow -->
  <ellipse cx="65" cy="113" rx="19" ry="3.5" fill="rgba(255,160,0,0.35)">
    <animate attributeName="fill-opacity" values="0.35;0.65;0.25;0.35" dur="0.35s" repeatCount="indefinite"/>
  </ellipse>

  <!-- ── Landing legs ── -->
  <!-- Primary struts -->
  <line x1="42" y1="88" x2="14" y2="128" stroke="url(#ld-leg)" stroke-width="3" stroke-linecap="round"/>
  <line x1="88" y1="88" x2="116" y2="128" stroke="url(#ld-leg)" stroke-width="3" stroke-linecap="round"/>
  <!-- Diagonal braces -->
  <line x1="37" y1="100" x2="16" y2="120" stroke="#3366aa" stroke-width="1.2" stroke-linecap="round" opacity="0.8"/>
  <line x1="93" y1="100" x2="114" y2="120" stroke="#3366aa" stroke-width="1.2" stroke-linecap="round" opacity="0.8"/>

  <!-- ── Foot pads (3D ellipses) ── -->
  <ellipse cx="14" cy="130" rx="12" ry="4.5"
    fill="url(#ld-metal)" stroke="#3366aa" stroke-width="1.2"/>
  <ellipse cx="14" cy="128" rx="8" ry="2.5" fill="rgba(150,200,255,0.2)"/>
  <ellipse cx="116" cy="130" rx="12" ry="4.5"
    fill="url(#ld-metal)" stroke="#3366aa" stroke-width="1.2"/>
  <ellipse cx="116" cy="128" rx="8" ry="2.5" fill="rgba(150,200,255,0.2)"/>

  <!-- ── Engine flame (3-layer animated) ── -->
  <g filter="url(#ld-glow)">
    <!-- Outer flame -->
    <path d="M46,118 Q43,138 65,152 Q87,138 84,118 Z" fill="url(#ld-flame)" opacity="0.75">
      <animate attributeName="d"
        values="M46,118 Q43,138 65,152 Q87,138 84,118 Z;M44,118 Q40,142 65,156 Q90,142 86,118 Z;M46,118 Q44,136 65,150 Q86,136 84,118 Z"
        dur="0.14s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0.75;0.95;0.6;0.75" dur="0.18s" repeatCount="indefinite"/>
    </path>
    <!-- Mid flame -->
    <path d="M51,118 Q52,134 65,144 Q78,134 79,118 Z" fill="rgba(255,200,60,0.9)">
      <animate attributeName="d"
        values="M51,118 Q52,134 65,144 Q78,134 79,118 Z;M50,118 Q52,137 65,148 Q78,137 80,118 Z;M51,118 Q53,132 65,142 Q77,132 79,118 Z"
        dur="0.11s" repeatCount="indefinite"/>
    </path>
    <!-- Core (white hot) -->
    <path d="M56,118 Q58,128 65,136 Q72,128 74,118 Z" fill="rgba(255,255,240,0.98)">
      <animate attributeName="d"
        values="M56,118 Q58,128 65,136 Q72,128 74,118 Z;M55,118 Q58,130 65,138 Q72,130 75,118 Z;M56,118 Q59,127 65,135 Q71,127 74,118 Z"
        dur="0.09s" repeatCount="indefinite"/>
    </path>
  </g>
  <!-- Engine heat bloom -->
  <ellipse cx="65" cy="120" rx="18" ry="7" fill="rgba(255,140,0,0.12)">
    <animate attributeName="rx" values="18;22;16;18" dur="0.3s" repeatCount="indefinite"/>
    <animate attributeName="opacity" values="0.12;0.22;0.08;0.12" dur="0.3s" repeatCount="indefinite"/>
  </ellipse>
</svg>`;

// Small 3D lander for stage intro (shared defs use lds- prefix to avoid ID conflict)
const LANDER_SVG_SMALL = `<svg viewBox="0 0 130 155" xmlns="http://www.w3.org/2000/svg" class="lander-svg-small">
  <defs>
    <linearGradient id="lds-body" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#c8e8ff"/><stop offset="30%" stop-color="#5599cc"/>
      <stop offset="70%" stop-color="#1a3a5c"/><stop offset="100%" stop-color="#060e1a"/>
    </linearGradient>
    <linearGradient id="lds-gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fff0a0"/><stop offset="40%" stop-color="#e8a800"/>
      <stop offset="100%" stop-color="#3a1e00"/>
    </linearGradient>
    <linearGradient id="lds-metal" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#aaaaaa"/><stop offset="100%" stop-color="#111122"/>
    </linearGradient>
    <radialGradient id="lds-win" cx="35%" cy="30%" r="65%">
      <stop offset="0%" stop-color="#aaeeff"/><stop offset="100%" stop-color="#002244"/>
    </radialGradient>
  </defs>
  <line x1="65" y1="3" x2="65" y2="18" stroke="#88ccee" stroke-width="1.5"/>
  <circle cx="65" cy="3" r="2.5" fill="#ff4444">
    <animate attributeName="opacity" values="1;0.1;1" dur="1.4s" repeatCount="indefinite"/>
  </circle>
  <polygon points="43,44 65,16 87,44" fill="url(#lds-body)" stroke="#3377aa" stroke-width="0.6"/>
  <polygon points="50,44 65,18 70,44" fill="rgba(255,255,255,0.18)"/>
  <rect x="53" y="42" width="24" height="7" rx="2" fill="url(#lds-metal)" stroke="#4488aa" stroke-width="0.5"/>
  <rect x="39" y="49" width="52" height="26" rx="3" fill="url(#lds-gold)" stroke="#cc8800" stroke-width="0.6"/>
  <rect x="39" y="49" width="52" height="9" rx="3" fill="rgba(255,255,200,0.28)"/>
  <line x1="39" y1="60" x2="91" y2="60" stroke="#aa7700" stroke-width="0.6" opacity="0.5"/>
  <circle cx="65" cy="61" r="8" fill="url(#lds-win)" stroke="#66aacc" stroke-width="1.2"/>
  <ellipse cx="61" cy="57" rx="3" ry="2" fill="rgba(255,255,255,0.55)" transform="rotate(-20,61,57)"/>
  <rect x="37" y="75" width="56" height="20" rx="3" fill="url(#lds-body)" stroke="#2255aa" stroke-width="0.6"/>
  <rect x="37" y="75" width="56" height="7" rx="3" fill="rgba(120,180,255,0.22)"/>
  <path d="M48,95 L39,116 L91,116 L82,95 Z" fill="url(#lds-metal)" stroke="#334455" stroke-width="0.7"/>
  <path d="M51,95 L43,113 L87,113 L79,95 Z" fill="#080c18"/>
  <ellipse cx="65" cy="113" rx="19" ry="3.5" fill="rgba(255,160,0,0.35)">
    <animate attributeName="fill-opacity" values="0.35;0.65;0.25;0.35" dur="0.35s" repeatCount="indefinite"/>
  </ellipse>
  <line x1="42" y1="88" x2="14" y2="128" stroke="#3366aa" stroke-width="2.5" stroke-linecap="round"/>
  <line x1="88" y1="88" x2="116" y2="128" stroke="#3366aa" stroke-width="2.5" stroke-linecap="round"/>
  <ellipse cx="14" cy="130" rx="12" ry="4.5" fill="url(#lds-metal)" stroke="#3366aa" stroke-width="1.2"/>
  <ellipse cx="116" cy="130" rx="12" ry="4.5" fill="url(#lds-metal)" stroke="#3366aa" stroke-width="1.2"/>
  <path d="M46,118 Q43,138 65,152 Q87,138 84,118 Z" fill="rgba(255,120,0,0.7)">
    <animate attributeName="d" values="M46,118 Q43,138 65,152 Q87,138 84,118 Z;M44,118 Q40,142 65,156 Q90,142 86,118 Z;M46,118 Q44,136 65,150 Q86,136 84,118 Z" dur="0.14s" repeatCount="indefinite"/>
  </path>
  <path d="M56,118 Q58,128 65,136 Q72,128 74,118 Z" fill="rgba(255,255,240,0.95)">
    <animate attributeName="d" values="M56,118 Q58,128 65,136 Q72,128 74,118 Z;M55,118 Q58,130 65,138 Q72,130 75,118 Z;M56,118 Q59,127 65,135 Q71,127 74,118 Z" dur="0.1s" repeatCount="indefinite"/>
  </path>
</svg>`;

// Crashed lander SVG for game over
const CRASHED_LANDER_SVG = `<svg viewBox="0 0 160 120" xmlns="http://www.w3.org/2000/svg" class="crashed-lander-svg">
  <!-- Debris pieces -->
  <polygon points="50,80 65,50 80,80" fill="none" stroke="#ff3333" stroke-width="1.5" transform="rotate(-15, 65, 65)" opacity="0.8"/>
  <rect x="70" y="55" width="30" height="20" rx="2" fill="none" stroke="#ff3333" stroke-width="1.5" transform="rotate(25, 85, 65)" opacity="0.7"/>
  <line x1="40" y1="90" x2="25" y2="100" stroke="#ff3333" stroke-width="1.5" opacity="0.6"/>
  <line x1="120" y1="85" x2="135" y2="100" stroke="#ff3333" stroke-width="1.5" opacity="0.6"/>
  <!-- Broken landing leg -->
  <line x1="45" y1="78" x2="30" y2="95" stroke="#ff3333" stroke-width="1.5"/>
  <line x1="110" y1="75" x2="130" y2="90" stroke="#ff3333" stroke-width="1.5" transform="rotate(10, 120, 82)"/>
  <!-- Explosion sparks -->
  <circle cx="75" cy="60" r="2" fill="#ffaa00" opacity="0.8">
    <animate attributeName="opacity" values="0.8;0;0.8" dur="0.5s" repeatCount="indefinite"/>
  </circle>
  <circle cx="90" cy="50" r="1.5" fill="#ff6600" opacity="0.6">
    <animate attributeName="opacity" values="0.6;0;0.6" dur="0.7s" repeatCount="indefinite"/>
  </circle>
  <circle cx="60" cy="45" r="1" fill="#ffaa00" opacity="0.7">
    <animate attributeName="opacity" values="0.7;0;0.7" dur="0.4s" repeatCount="indefinite"/>
  </circle>
  <circle cx="100" cy="55" r="1.5" fill="#ff3333" opacity="0.5">
    <animate attributeName="opacity" values="0.5;0;0.5" dur="0.6s" repeatCount="indefinite"/>
  </circle>
  <!-- Smoke wisps -->
  <path d="M70,45 Q65,30 70,20" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="2">
    <animate attributeName="d" values="M70,45 Q65,30 70,20;M70,45 Q75,28 68,15;M70,45 Q65,30 70,20" dur="2s" repeatCount="indefinite"/>
  </path>
  <path d="M85,40 Q90,25 82,12" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="1.5">
    <animate attributeName="d" values="M85,40 Q90,25 82,12;M85,40 Q80,22 88,10;M85,40 Q90,25 82,12" dur="2.5s" repeatCount="indefinite"/>
  </path>
  <!-- Ground line -->
  <line x1="10" y1="100" x2="150" y2="100" stroke="#ff3333" stroke-width="1" opacity="0.3" stroke-dasharray="4,4"/>
</svg>`;

// Moon SVG for diagnosis
const MOON_SVG = `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" class="moon-svg">
  <!-- Moon body -->
  <circle cx="100" cy="100" r="80" fill="none" stroke="#ffaa00" stroke-width="1.5" opacity="0.6"/>
  <circle cx="100" cy="100" r="78" fill="rgba(255,170,0,0.05)"/>
  <!-- Craters -->
  <circle cx="75" cy="70" r="15" fill="none" stroke="#ffaa00" stroke-width="0.8" opacity="0.3"/>
  <circle cx="110" cy="90" r="10" fill="none" stroke="#ffaa00" stroke-width="0.8" opacity="0.25"/>
  <circle cx="90" cy="120" r="18" fill="none" stroke="#ffaa00" stroke-width="0.8" opacity="0.2"/>
  <circle cx="130" cy="65" r="8" fill="none" stroke="#ffaa00" stroke-width="0.8" opacity="0.3"/>
  <circle cx="65" cy="110" r="6" fill="none" stroke="#ffaa00" stroke-width="0.8" opacity="0.25"/>
  <!-- Landed lander on surface (tiny) -->
  <g transform="translate(115, 148) scale(0.2)">
    <polygon points="40,42 60,18 80,42" fill="none" stroke="#00ffff" stroke-width="4"/>
    <rect x="38" y="42" width="44" height="30" rx="3" fill="none" stroke="#00ffff" stroke-width="4"/>
    <line x1="38" y1="72" x2="18" y2="105" stroke="#00ffff" stroke-width="4"/>
    <line x1="82" y1="72" x2="102" y2="105" stroke="#00ffff" stroke-width="4"/>
  </g>
  <!-- Flag -->
  <line x1="125" y1="155" x2="125" y2="140" stroke="#00ffff" stroke-width="1"/>
  <rect x="125" y="140" width="8" height="5" fill="rgba(0,255,255,0.3)" stroke="#00ffff" stroke-width="0.5"/>
  <!-- Glow -->
  <circle cx="100" cy="100" r="85" fill="none" stroke="#ffaa00" stroke-width="0.5" opacity="0.2">
    <animate attributeName="r" values="85;88;85" dur="3s" repeatCount="indefinite"/>
    <animate attributeName="opacity" values="0.2;0.1;0.2" dur="3s" repeatCount="indefinite"/>
  </circle>
</svg>`;

const TITLE_INVADERS = `  ▀▄ ▄▀     ▀▄ ▄▀     ▀▄ ▄▀
 ▄█▀█▀█▄   ▄█▀█▀█▄   ▄█▀█▀█▄
█▀█████▀█ █▀█████▀█ █▀█████▀█
█ ▀▀ ▀▀ █ █ ▀▀ ▀▀ █ █ ▀▀ ▀▀ █`;

export class Renderer {
  private app: HTMLElement;
  private game: GameLoop;
  private previousWordIds = new Set<string>();
  private debrisIntervalId: ReturnType<typeof setInterval> | null = null;

  constructor(app: HTMLElement, game: GameLoop) {
    this.app = app;
    this.game = game;
  }

  // ── Debris / Meteor spawner ──────────────────────────────────────
  private startDebrisSpawner(): void {
    if (this.debrisIntervalId !== null) return;
    // Spawn immediately, then on interval
    this.spawnDebris();
    this.debrisIntervalId = setInterval(() => {
      this.spawnDebris();
      if (Math.random() > 0.55) this.spawnDebris(); // occasionally double-spawn
    }, 1800 + Math.random() * 1200);
  }

  private stopDebrisSpawner(): void {
    if (this.debrisIntervalId !== null) {
      clearInterval(this.debrisIntervalId);
      this.debrisIntervalId = null;
    }
  }

  private spawnDebris(): void {
    const gameArea = this.app.querySelector('.game-area');
    if (!gameArea) return;

    const isMeteor = Math.random() > 0.45;
    const el = document.createElement('div');

    const leftPct  = 3 + Math.random() * 94;
    const duration = isMeteor
      ? 1.2 + Math.random() * 1.8   // meteors: fast
      : 5   + Math.random() * 6;    // debris:  slow tumble

    el.style.left = `${leftPct}%`;
    el.style.setProperty('--fall-dur', `${duration}s`);

    if (isMeteor) {
      const angle = 20 + Math.random() * 30; // 20°–50° diagonal
      const size  = 8 + Math.random() * 14;
      el.className = 'space-debris space-debris--meteor';
      el.style.setProperty('--meteor-angle', `${angle}deg`);
      el.innerHTML = this.buildMeteorSVG(size);
    } else {
      const size = 7 + Math.random() * 18;
      el.className = 'space-debris space-debris--chunk';
      el.innerHTML = this.buildChunkSVG(size);
    }

    gameArea.appendChild(el);
    setTimeout(() => el.remove(), (duration + 0.5) * 1000);
  }

  private buildMeteorSVG(size: number): string {
    const w = Math.round(size * 5);
    const h = Math.round(size * 1.6);
    const r = Math.round(size * 0.55);
    return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" style="display:block;overflow:visible">
  <defs>
    <linearGradient id="mt-trail-${Math.random().toString(36).slice(2,6)}" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%"   stop-color="#ff4400" stop-opacity="0"/>
      <stop offset="60%"  stop-color="#ff8800" stop-opacity="0.5"/>
      <stop offset="100%" stop-color="#ffcc44" stop-opacity="0.85"/>
    </linearGradient>
  </defs>
  <rect x="0" y="${Math.round(h*0.3)}" width="${w - r}" height="${Math.round(h*0.4)}" rx="${Math.round(h*0.2)}"
    fill="rgba(255,100,0,0.35)"/>
  <ellipse cx="${w - r}" cy="${h / 2}" rx="${r}" ry="${r * 0.7}"
    fill="#dd7722" stroke="#ffaa44" stroke-width="0.8"/>
  <ellipse cx="${w - r - 2}" cy="${h * 0.38}" rx="${Math.round(r*0.4)}" ry="${Math.round(r*0.25)}"
    fill="rgba(255,230,120,0.75)"/>
</svg>`;
  }

  private buildChunkSVG(size: number): string {
    // Generate random convex-ish polygon
    const sides = 5 + Math.floor(Math.random() * 4);
    const pts: string[] = [];
    const half = size;
    for (let i = 0; i < sides; i++) {
      const angle = (i / sides) * Math.PI * 2 - Math.PI / 2;
      const r = half * (0.55 + Math.random() * 0.45);
      pts.push(`${(Math.cos(angle) * r + half).toFixed(1)},${(Math.sin(angle) * r + half).toFixed(1)}`);
    }
    const d = pts.join(' ');
    // pick 3 highlight pts (first facet)
    const hi = pts.slice(0, 3).join(' ');
    const dim = Math.round(size * 2);
    // Randomise grey tone
    const grey = 90 + Math.floor(Math.random() * 60);
    return `<svg width="${dim}" height="${dim}" viewBox="0 0 ${dim} ${dim}" xmlns="http://www.w3.org/2000/svg" style="display:block;overflow:visible">
  <polygon points="${d}" fill="rgb(${grey},${grey - 10},${grey - 15})" stroke="rgb(${grey + 40},${grey + 35},${grey + 30})" stroke-width="0.7"/>
  <polygon points="${hi}" fill="rgba(255,255,255,0.22)"/>
</svg>`;
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
    this.stopDebrisSpawner();
    this.app.innerHTML = `
      <div class="screen title-screen">
        <div class="starfield" id="starfield"></div>
        <div class="title-logo animate-fadein" style="position:relative;z-index:1;">
          <div class="title-invaders">${TITLE_INVADERS}</div>
          <div class="title-main">月面転職クエスト</div>
          <div class="title-decoration"></div>
          <div class="title-sub">〜 未知の宇宙職業で月を目指せ 〜</div>
        </div>
        <div class="title-insert-coin animate-fadein delay-3" style="position:relative;z-index:1;">
          PRESS START
        </div>
        <div class="title-cta animate-fadein delay-4" style="position:relative;z-index:1;">
          <button class="btn-primary" id="btn-start">ミッション開始</button>
        </div>
        <div class="title-credit animate-fadein delay-5" style="position:relative;z-index:1;margin-top:24px;">
          &copy; 2026 LUNAR QUEST CORP.
        </div>
      </div>
      <div class="crt-overlay"></div>
    `;
    this.createStarfield();
    document.getElementById('btn-start')?.addEventListener('click', () => {
      this.game.startGame();
    });
  }

  private renderStageIntroScreen(stageId: number): void {
    if (this.app.querySelector('.stage-intro-screen')) return;
    this.stopDebrisSpawner();
    const stageName = this.game.getCurrentStageName();
    const mission = this.game.getCurrentMission();
    const stageLabel = stageId === 4 ? 'FINAL STAGE' : `STAGE ${stageId}`;

    // Distance to Moon decreases with each stage
    const distances = ['384,400 km', '280,000 km', '150,000 km', '50 km - 着陸態勢'];
    const distanceLabel = distances[stageId - 1] || distances[0];

    this.app.innerHTML = `
      <div class="screen stage-intro-screen">
        <div class="starfield" id="starfield"></div>
        <div style="position:relative;z-index:1;display:flex;flex-direction:column;align-items:center;">
          <div class="stage-number animate-fadein">${stageLabel}</div>
          <div class="stage-name animate-fadein delay-1">${stageName}</div>
          <div class="stage-distance animate-fadein delay-2">月まで ${distanceLabel}</div>
          <div class="stage-mission-label animate-fadein delay-2">- MISSION -</div>
          <div class="stage-mission animate-fadein delay-3">${mission}</div>
          <div class="stage-lander-art animate-fadein delay-3">${LANDER_SVG_SMALL}</div>
          <div class="stage-start-btn animate-fadein delay-4">
            <button class="btn-primary" id="btn-stage-start">発進</button>
          </div>
        </div>
      </div>
      <div class="crt-overlay"></div>
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
      const stageId = phase.stageId;
      this.app.innerHTML = `
        <div class="game-area">
          <canvas class="constellation-canvas" id="constellation-canvas"></canvas>
          <div class="starfield" id="starfield"></div>
          <div class="moon-bg moon-bg--stage${stageId}" id="moon-bg"></div>
          <div class="game-hud">
            <div class="hud-left">
              <div class="hud-stage-name">${stage}</div>
              <div class="hud-mission">${mission}</div>
            </div>
            <div class="hud-right">
              <div class="hud-stat">
                <div class="hud-stat-label">CLEAR</div>
                <div class="hud-stat-value" id="hud-cleared">0</div>
              </div>
              <div class="hud-stat">
                <div class="hud-stat-label">MISS</div>
                <div class="hud-stat-value" id="hud-missed">0</div>
              </div>
              <div class="hud-stat">
                <div class="hud-stat-label">ACC</div>
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
          <div class="lander-container" id="lander-container">
            ${LANDER_SVG}
          </div>
          <div class="input-area">
            <div class="input-display">
              <span id="input-text"></span><span class="input-cursor"></span>
            </div>
            <div class="input-hint">タイピングで宇宙デブリを撃破して月を目指せ！</div>
          </div>
        </div>
        <div class="crt-overlay"></div>
      `;
      this.createStarfield();
      this.drawConstellations(stageId);
      this.previousWordIds.clear();
      this.startDebrisSpawner();
    }

    this.updateHUD(state);
    this.updateWords(state);
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
      const target = this.getStageTarget(state);
      const pct = Math.min(100, (state.clearedWords / target) * 100);
      progressEl.style.width = `${pct}%`;
    }
  }

  private getStageTarget(state: GameState): number {
    if (state.phase.type === 'playing') {
      return 5 + state.phase.stageId + 1;
    }
    return 7;
  }

  private updateWords(state: GameState): void {
    const container = document.getElementById('word-container');
    if (!container) return;

    const currentWordIds = new Set(state.activeWords.map(w => w.id));

    // Remove words that are no longer active (with explosion animation)
    for (const prevId of this.previousWordIds) {
      if (!currentWordIds.has(prevId)) {
        const el = document.getElementById(`word-${prevId}`);
        if (el) {
          el.classList.add('falling-word--clearing');
          this.showScorePopup(el);
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

  private showScorePopup(wordEl: HTMLElement): void {
    const popup = document.createElement('div');
    popup.className = 'score-popup';
    popup.textContent = '+100';
    popup.style.left = wordEl.style.left || '50%';
    popup.style.top = wordEl.style.top || '50%';
    const container = document.getElementById('word-container');
    if (container) {
      container.appendChild(popup);
      setTimeout(() => popup.remove(), 600);
    }
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
    const containerHeight = document.getElementById('word-container')?.offsetHeight || 600;
    const topPx = word.position * containerHeight;
    el.style.top = `${topPx}px`;

    if (word.id === targetId) {
      el.classList.add('falling-word--targeted');
    } else {
      el.classList.remove('falling-word--targeted');
    }

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
    this.stopDebrisSpawner();

    const accPct = Math.round(score.accuracy * 100);
    const speedStr = score.averageSpeed.toFixed(1);
    const nextLabel = stageId < 4 ? '次のステージへ' : '診断結果へ';
    const approachMsgs = [
      '地球を離脱...月が少し大きく見えてきた',
      '軌道修正完了...月の輪郭がはっきりと',
      'もうすぐだ...月面のクレーターが見える',
      '月面着陸シーケンス開始！',
    ];
    const approachMsg = approachMsgs[stageId - 1] || '';

    this.app.innerHTML = `
      <div class="screen stage-clear-screen">
        <div class="starfield" id="starfield"></div>
        <div style="position:relative;z-index:1;display:flex;flex-direction:column;align-items:center;">
          <div class="clear-title animate-fadein">STAGE CLEAR!</div>
          <div class="clear-approach animate-fadein delay-1">${approachMsg}</div>
          <div class="clear-stats animate-fadein delay-2">
            <div class="clear-stat">
              <div class="clear-stat-label">ACC</div>
              <div class="clear-stat-value clear-stat-value--highlight">${accPct}%</div>
            </div>
            <div class="clear-stat">
              <div class="clear-stat-label">SPEED</div>
              <div class="clear-stat-value">${speedStr}</div>
            </div>
            <div class="clear-stat">
              <div class="clear-stat-label">CLEAR</div>
              <div class="clear-stat-value">${score.wordsClearedCount}</div>
            </div>
            <div class="clear-stat">
              <div class="clear-stat-label">MISS</div>
              <div class="clear-stat-value">${score.missedWordsCount}</div>
            </div>
          </div>
          <div class="animate-fadein delay-4" style="margin-top:32px;">
            <button class="btn-primary" id="btn-next-stage">${nextLabel}</button>
          </div>
        </div>
      </div>
      <div class="crt-overlay"></div>
    `;
    this.createStarfield();
    document.getElementById('btn-next-stage')?.addEventListener('click', () => {
      this.game.advanceToNextStage();
    });
  }

  private renderGameOverScreen(_stageId: number, score: StageScore): void {
    if (this.app.querySelector('.gameover-screen')) return;
    this.stopDebrisSpawner();
    this.app.innerHTML = `
      <div class="screen gameover-screen">
        <div class="starfield" id="starfield"></div>
        <div style="position:relative;z-index:1;display:flex;flex-direction:column;align-items:center;">
          <div class="gameover-title animate-fadein">MISSION FAILED</div>
          <div class="gameover-crash animate-fadein delay-1">${CRASHED_LANDER_SVG}</div>
          <div class="gameover-message animate-fadein delay-2">
            ランダー大破...しかし宇宙開発に失敗はつきもの。再挑戦して月を目指そう！
          </div>
          <div class="clear-stats animate-fadein delay-3" style="margin-top:24px;">
            <div class="clear-stat">
              <div class="clear-stat-label">CLEAR</div>
              <div class="clear-stat-value">${score.wordsClearedCount}</div>
            </div>
            <div class="clear-stat">
              <div class="clear-stat-label">MISS</div>
              <div class="clear-stat-value" style="color:var(--retro-red);text-shadow:var(--crt-glow-red)">${score.missedWordsCount}</div>
            </div>
          </div>
          <div class="gameover-actions animate-fadein delay-4">
            <button class="btn-primary" id="btn-retry">再挑戦</button>
            <button class="btn-secondary" id="btn-title">タイトルへ</button>
          </div>
        </div>
      </div>
      <div class="crt-overlay"></div>
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
    this.stopDebrisSpawner();
    const rankClass = (rank: string) => rank === 'S' ? 'diagnosis-param-rank diagnosis-param-rank--s' : 'diagnosis-param-rank';

    this.app.innerHTML = `
      <div class="screen diagnosis-screen">
        <div class="starfield" id="starfield"></div>
        <div style="position:relative;z-index:1;display:flex;flex-direction:column;align-items:center;">
          <div class="diagnosis-moon-art animate-fadein">${MOON_SVG}</div>
          <div class="diagnosis-header animate-fadein delay-1">月面着陸成功！あなたの月面での最終役職</div>
          <div class="diagnosis-career-title animate-fadein delay-2">${result.careerTitle}</div>
          <div class="title-decoration animate-fadein delay-2"></div>
          <div class="diagnosis-description animate-fadein delay-3">${result.careerDescription}</div>
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
              <div class="diagnosis-param-label">耐性</div>
              <div class="${rankClass(result.parameters.stressTolerance.rank)}">${result.parameters.stressTolerance.rank}</div>
              <div class="diagnosis-param-value">${Math.round(result.parameters.stressTolerance.value * 100)}%</div>
            </div>
          </div>
          <div class="diagnosis-share animate-fadein delay-4">
            <button class="btn-primary" id="btn-share">結果をシェア</button>
            <button class="btn-secondary" id="btn-restart">もう一度プレイ</button>
          </div>
        </div>
      </div>
      <div class="crt-overlay"></div>
    `;
    this.createStarfield();

    document.getElementById('btn-share')?.addEventListener('click', () => {
      if (navigator.share) {
        navigator.share({ text: result.shareText });
      } else {
        navigator.clipboard.writeText(result.shareText);
        const btn = document.getElementById('btn-share');
        if (btn) {
          btn.textContent = 'コピー完了！';
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

    const count = 120;
    for (let i = 0; i < count; i++) {
      const star = document.createElement('div');
      const size = Math.random();
      star.className = `star ${size < 0.5 ? 'star--small' : size < 0.8 ? 'star--medium' : 'star--large'}`;
      if (Math.random() > 0.6) star.classList.add('star--twinkle');
      star.style.left = `${Math.random() * 100}%`;
      star.style.top = `${Math.random() * 100}%`;
      star.style.animationDelay = `${Math.random() * 4}s`;
      container.appendChild(star);
    }
  }

  /** Draw constellations on the background canvas */
  private drawConstellations(stageId: number): void {
    const canvas = document.getElementById('constellation-canvas') as HTMLCanvasElement | null;
    if (!canvas) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // More constellations visible as stages progress (approaching the moon = seeing more of space)
    const count = Math.min(CONSTELLATIONS.length, 2 + stageId * 2);
    const visible = CONSTELLATIONS.slice(0, count);

    for (const constellation of visible) {
      // Draw connecting lines
      ctx.strokeStyle = 'rgba(51, 255, 51, 0.12)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);

      for (const [from, to] of constellation.lines) {
        const s1 = constellation.stars[from];
        const s2 = constellation.stars[to];
        ctx.beginPath();
        ctx.moveTo(s1.x * canvas.width, s1.y * canvas.height);
        ctx.lineTo(s2.x * canvas.width, s2.y * canvas.height);
        ctx.stroke();
      }

      ctx.setLineDash([]);

      // Draw stars
      for (const star of constellation.stars) {
        const x = star.x * canvas.width;
        const y = star.y * canvas.height;

        // Glow halo
        ctx.fillStyle = 'rgba(51, 255, 51, 0.15)';
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fill();

        // Core dot
        ctx.fillStyle = 'rgba(51, 255, 51, 0.7)';
        ctx.beginPath();
        ctx.arc(x, y, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Label
      if (constellation.stars.length > 0) {
        const cx = constellation.stars.reduce((s, st) => s + st.x, 0) / constellation.stars.length;
        const cy = constellation.stars.reduce((s, st) => s + st.y, 0) / constellation.stars.length;
        ctx.font = '8px "Press Start 2P", monospace';
        ctx.fillStyle = 'rgba(51, 255, 51, 0.15)';
        ctx.textAlign = 'center';
        ctx.fillText(constellation.nameJp, cx * canvas.width, cy * canvas.height + 24);
      }
    }

    // Handle resize
    window.addEventListener('resize', () => {
      this.drawConstellations(stageId);
    }, { once: true });
  }
}

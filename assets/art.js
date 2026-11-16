window.makeGameCover = function(g) {
  const uid = 'g' + g.id;
  const motif = g.motif;
  let scene = '';

  if (motif === 'towerdef') {
    scene = `
      <path d="M0 95 L75 95 L75 45 L165 45 L165 100 L260 100" fill="none" stroke="rgba(15,23,42,0.7)" stroke-width="26" stroke-linejoin="round"/>
      <path d="M0 95 L75 95 L75 45 L165 45 L165 100 L260 100" fill="none" stroke="#eab308" stroke-width="3" stroke-dasharray="6 6" opacity="0.5"/>
      <circle cx="118" cy="82" r="14" fill="#38bdf8" stroke="#fff" stroke-width="2.5"/>
      <line x1="118" y1="82" x2="132" y2="62" stroke="#fff" stroke-width="4" stroke-linecap="round"/>
      <circle cx="195" cy="64" r="14" fill="#f43f5e" stroke="#fff" stroke-width="2.5"/>
      <circle cx="75" cy="65" r="8" fill="#ef4444"/><circle cx="130" cy="45" r="8" fill="#f97316"/>
      <circle cx="165" cy="75" r="8" fill="#ef4444"/>`;
  } else if (motif === 'pacman') {
    scene = `
      <rect x="26" y="22" width="208" height="96" rx="14" fill="rgba(10,12,35,0.5)" stroke="#3b82f6" stroke-width="3"/>
      <circle cx="135" cy="70" r="5" fill="#fde047"/><circle cx="160" cy="70" r="5" fill="#fde047"/><circle cx="185" cy="70" r="5" fill="#fde047"/>
      <path d="M85,70 L107,54 A24,24 0 1,0 107,86 Z" fill="#facc15"/>
      <path d="M192 84 L192 64 A12 12 0 0 1 216 64 L216 84 L210 78 L204 84 L198 78 Z" fill="#f43f5e"/>`;
  } else if (motif === 'flappy') {
    scene = `
      <rect x="65" y="0" width="26" height="58" rx="4" fill="#22c55e" stroke="#14532d" stroke-width="2"/>
      <rect x="65" y="102" width="26" height="58" rx="4" fill="#22c55e" stroke="#14532d" stroke-width="2"/>
      <rect x="175" y="0" width="26" height="42" rx="4" fill="#22c55e" stroke="#14532d" stroke-width="2"/>
      <rect x="175" y="88" width="26" height="72" rx="4" fill="#22c55e" stroke="#14532d" stroke-width="2"/>
      <circle cx="122" cy="70" r="16" fill="#facc15" stroke="#fff" stroke-width="2"/>
      <circle cx="128" cy="66" r="3.5" fill="#0f172a"/>
      <polygon points="136,70 149,74 136,78" fill="#f97316"/>`;
  } else if (motif === 'snake') {
    scene = `
      <path d="M40 100 L95 100 L95 52 L165 52 L165 84 L205 84" fill="none" stroke="#4ade80" stroke-width="18" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="205" cy="84" r="11" fill="#86efac"/>
      <circle cx="230" cy="46" r="10" fill="#ef4444"/>`;
  } else if (motif === 'space' || motif === 'asteroids' || motif === 'missile' || motif === 'rocket' || motif === 'orbit') {
    scene = `
      <circle cx="40" cy="30" r="2" fill="#fff"/><circle cx="220" cy="28" r="2" fill="#fff"/><circle cx="195" cy="52" r="1.5" fill="#fff"/>
      <circle cx="130" cy="72" r="32" fill="none" stroke="rgba(255,255,255,0.24)" stroke-width="2" stroke-dasharray="5 5"/>
      <circle cx="130" cy="72" r="18" fill="#38bdf8"/>
      <polygon points="75,54 92,61 75,68 79,61" fill="#f43f5e"/>
      <polygon points="184,42 200,50 188,62" fill="#fbbf24"/>
      <rect x="127" y="100" width="6" height="22" rx="3" fill="#facc15"/>`;
  } else if (motif === 'tetris') {
    scene = `
      <g stroke="rgba(255,255,255,0.25)" stroke-width="2">
        <rect x="55" y="38" width="32" height="32" rx="5" fill="#f43f5e"/>
        <rect x="89" y="38" width="32" height="32" rx="5" fill="#f43f5e"/>
        <rect x="89" y="72" width="32" height="32" rx="5" fill="#f43f5e"/>
        <rect x="135" y="30" width="32" height="32" rx="5" fill="#38bdf8"/>
        <rect x="169" y="30" width="32" height="32" rx="5" fill="#facc15"/>
        <rect x="135" y="64" width="32" height="32" rx="5" fill="#4ade80"/>
        <rect x="169" y="64" width="32" height="32" rx="5" fill="#a855f7"/>
      </g>`;
  } else if (motif === 'pinball' || motif === 'bricks' || motif === 'bubbles') {
    scene = `
      <circle cx="90" cy="44" r="18" fill="#f43f5e" stroke="#fff" stroke-width="3"/>
      <circle cx="170" cy="44" r="18" fill="#38bdf8" stroke="#fff" stroke-width="3"/>
      <circle cx="130" cy="78" r="20" fill="#facc15" stroke="#fff" stroke-width="3"/>
      <line x1="66" y1="110" x2="112" y2="120" stroke="#f472b6" stroke-width="10" stroke-linecap="round"/>
      <line x1="194" y1="110" x2="148" y2="120" stroke="#f472b6" stroke-width="10" stroke-linecap="round"/>`;
  } else if (motif === 'bowling' || motif === 'target') {
    scene = `
      <circle cx="130" cy="68" r="44" fill="#fff" opacity="0.18"/>
      <circle cx="130" cy="68" r="30" fill="#ef4444"/>
      <circle cx="130" cy="68" r="18" fill="#fff"/>
      <circle cx="130" cy="68" r="8" fill="#facc15"/>
      <circle cx="186" cy="92" r="14" fill="#3b82f6" stroke="#fff" stroke-width="2"/>`;
  } else if (motif === 'volcano' || motif === 'laser') {
    scene = `
      <polygon points="50,126 130,30 210,126" fill="#291518"/>
      <path d="M115 48 L130 30 L145 48 L135 62 L122 56Z" fill="#ff7b29"/>
      <rect x="0" y="110" width="260" height="50" fill="#ef4444" opacity="0.85"/>`;
  } else if (motif === 'dive' || motif === 'ship') {
    scene = `
      <path d="M0 44 Q65 30 130 44 T260 44 L260 160 L0 160Z" fill="rgba(56,189,248,0.28)"/>
      <ellipse cx="126" cy="80" rx="34" ry="18" fill="#facc15"/>
      <circle cx="138" cy="80" r="7" fill="#0ea5e9" stroke="#fff" stroke-width="2"/>
      <circle cx="195" cy="92" r="10" fill="#f43f5e"/>`;
  } else if (motif === 'slots' || motif === 'casino' || motif === 'cards') {
    scene = `
      <rect x="52" y="30" width="46" height="66" rx="8" fill="#fff" transform="rotate(-8 75 63)"/>
      <rect x="107" y="24" width="46" height="66" rx="8" fill="#fef08a"/>
      <rect x="162" y="30" width="46" height="66" rx="8" fill="#fff" transform="rotate(8 185 63)"/>
      <text x="130" y="68" text-anchor="middle" font-family="system-ui,sans-serif" font-weight="900" font-size="28" fill="#dc2626">777</text>`;
  } else if (motif === 'ghost' || motif === 'mole') {
    scene = `
      <polygon points="30,126 130,32 230,126" fill="rgba(254,240,138,0.22)"/>
      <path d="M102 84 C102 48 158 48 158 84 L158 108 L144 98 L130 108 L116 98 L102 108 Z" fill="#e2e8f0"/>
      <circle cx="120" cy="72" r="5" fill="#0f172a"/><circle cx="140" cy="72" r="5" fill="#0f172a"/>`;
  } else if (motif === 'car') {
    scene = `
      <polygon points="85,26 175,26 225,136 35,136" fill="rgba(15,23,42,0.55)"/>
      <line x1="130" y1="32" x2="130" y2="132" stroke="#facc15" stroke-width="4" stroke-dasharray="12 10"/>
      <rect x="102" y="60" width="56" height="36" rx="10" fill="#ef4444" stroke="#fff" stroke-width="2"/>
      <rect x="110" y="65" width="40" height="12" rx="4" fill="#bae6fd"/>`;
  } else if (motif === 'board' || motif === 'maze' || motif === 'pong') {
    scene = `
      <rect x="70" y="26" width="120" height="90" rx="10" fill="rgba(15,23,42,0.45)" stroke="rgba(255,255,255,0.25)" stroke-width="2"/>
      <circle cx="105" cy="55" r="14" fill="#ef4444" stroke="#fff" stroke-width="2"/>
      <circle cx="155" cy="55" r="14" fill="#facc15" stroke="#fff" stroke-width="2"/>
      <circle cx="105" cy="88" r="14" fill="#facc15" stroke="#fff" stroke-width="2"/>
      <circle cx="155" cy="88" r="14" fill="#ef4444" stroke="#fff" stroke-width="2"/>`;
  } else if (motif === 'piano' || motif === 'simon' || motif === 'flags' || motif === 'word') {
    scene = `
      <rect x="52" y="34" width="34" height="72" rx="6" fill="#f43f5e"/>
      <rect x="92" y="34" width="34" height="72" rx="6" fill="#38bdf8"/>
      <rect x="132" y="34" width="34" height="72" rx="6" fill="#facc15"/>
      <rect x="172" y="34" width="34" height="72" rx="6" fill="#4ade80"/>`;
  } else {
    scene = `
      <circle cx="130" cy="70" r="38" fill="rgba(255,255,255,0.16)"/>
      <polygon points="118,50 156,70 118,90" fill="#fff" opacity="0.9"/>`;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 160" preserveAspectRatio="xMidYMid slice">
    <defs>
      <linearGradient id="${uid}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${g.c1}"/>
        <stop offset="100%" stop-color="${g.c2}"/>
      </linearGradient>
    </defs>
    <rect width="260" height="160" fill="url(#${uid})"/>
    <circle cx="220" cy="25" r="70" fill="rgba(255,255,255,0.07)"/>
    ${scene}
  </svg>`;
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
};

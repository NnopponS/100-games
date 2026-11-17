window.makeGameCover = function(g) {
  const id = Number(g.id) || 1;
  const uid = 'cov_' + id;

  // 100 distinct palettes & background pattern styles
  const palettes = {
    1:  ['#0284c7','#0c4a6e','clouds'],
    2:  ['#059669','#022c22','grid'],
    3:  ['#ea580c','#431407','dots'],
    4:  ['#1d4ed8','#090d1e','grid'],
    5:  ['#7c3aed','#1e1b4b','grid'],
    6:  ['#db2777','#3b0764','dots'],
    7:  ['#65a30d','#1a2e05','sunburst'],
    8:  ['#475569','#0f172a','grid'],
    9:  ['#d97706','#451a03','dots'],
    10: ['#0891b2','#082f49','grid'],
    11: ['#9333ea','#2e1065','radial'],
    12: ['#312e81','#050714','stars'],
    13: ['#0f172a','#020617','stars'],
    14: ['#15803d','#052e16','stripes'],
    15: ['#eab308','#422006','clouds'],
    16: ['#991b1b','#14070a','stars'],
    17: ['#334155','#020617','stars'],
    18: ['#0d9488','#042f2e','circuit'],
    19: ['#e11d48','#31102f','sunburst'],
    20: ['#4f46e5','#0f172a','stripes'],
    21: ['#1e40af','#0f172a','dots'],
    22: ['#0369a1','#0c4a6e','paper'],
    23: ['#16a34a','#052e16','grid'],
    24: ['#ca8a04','#1c1917','radial'],
    25: ['#0284c7','#090d16','circuit'],
    26: ['#1e1b4b','#070919','dots'],
    27: ['#0891b2','#091826','stripes'],
    28: ['#be185d','#2e0a24','sunburst'],
    29: ['#2563eb','#0f172a','radial'],
    30: ['#15803d','#062c1b','felt'],
    31: ['#c2410c','#291105','grid'],
    32: ['#334155','#0b1120','dots'],
    33: ['#1d4ed8','#0b132b','grid'],
    34: ['#0369a1','#041c2c','radar'],
    35: ['#047857','#022c22','felt'],
    36: ['#b45309','#291504','wood'],
    37: ['#7f1d1d','#1c1917','wood'],
    38: ['#7e22ce','#1e1b4b','dots'],
    39: ['#0e7490','#090d1a','circuit'],
    40: ['#d97706','#3b1704','sunburst'],
    41: ['#be123c','#180814','stars'],
    42: ['#ea580c','#271026','stripes'],
    43: ['#0284c7','#e0f2fe','snow'],
    44: ['#0284c7','#04243b','waves'],
    45: ['#b91c1c','#1f2937','radial'],
    46: ['#15803d','#0f291e','sunburst'],
    47: ['#c2410c','#1f1008','stripes'],
    48: ['#16a34a','#063319','felt'],
    49: ['#22c55e','#064e3b','felt'],
    50: ['#1e3a8a','#090d1a','stripes'],
    51: ['#991b1b','#0f172a','radial'],
    52: ['#dc2626','#111827','stripes'],
    53: ['#16a34a','#0c2438','grid'],
    54: ['#0369a1','#031320','waves'],
    55: ['#db2777','#2e1065','clouds'],
    56: ['#92400e','#271104','sunburst'],
    57: ['#e11d48','#1e0824','radial'],
    58: ['#7c3aed','#0f0a24','circuit'],
    59: ['#db2777','#170c2e','grid'],
    60: ['#2563eb','#0f172a','dots'],
    61: ['#6d28d9','#171130','paper'],
    62: ['#0284c7','#172554','dots'],
    63: ['#581c87','#111827','grid'],
    64: ['#0891b2','#0a1628','circuit'],
    65: ['#be185d','#111827','dots'],
    66: ['#c2410c','#120b18','radial'],
    67: ['#0284c7','#130c2e','circuit'],
    68: ['#db2777','#18182b','grid'],
    69: ['#b91c1c','#450a0a','dots'],
    70: ['#a16207','#1c1917','dots'],
    71: ['#059669','#0b1726','grid'],
    72: ['#be185d','#110929','circuit'],
    73: ['#0284c7','#0a192f','radial'],
    74: ['#15803d','#052414','felt'],
    75: ['#ca8a04','#111827','stripes'],
    76: ['#4c1d95','#060914','stars'],
    77: ['#65a30d','#14532d','sunburst'],
    78: ['#1d4ed8','#0b132b','stars'],
    79: ['#e11d48','#141625','grid'],
    80: ['#0284c7','#1e293b','dots'],
    81: ['#4338ca','#050714','stars'],
    82: ['#ea580c','#090d16','stars'],
    83: ['#b45309','#150d29','radial'],
    84: ['#db2777','#1f2937','dots'],
    85: ['#15803d','#06331e','felt'],
    86: ['#9333ea','#240b3b','sunburst'],
    87: ['#b91c1c','#18181b','dots'],
    88: ['#16a34a','#070d12','grid'],
    89: ['#0284c7','#141632','radial'],
    90: ['#2563eb','#082f49','snow'],
    91: ['#c2410c','#1c0a0d','stars'],
    92: ['#0891b2','#031624','waves'],
    93: ['#4d7c0f','#13220c','dots'],
    94: ['#4338ca','#05060f','stars'],
    95: ['#be123c','#090d16','circuit'],
    96: ['#0284c7','#171536','sunburst'],
    97: ['#a16207','#0f172a','grid'],
    98: ['#0891b2','#040814','stars'],
    99: ['#0284c7','#0c2d48','clouds'],
    100:['#15803d','#07120d','circuit']
  };

  const [c1, c2, pat] = palettes[id] || [g.c1 || '#6366f1', g.c2 || '#1e1b4b', 'dots'];

  let bgTex = '';
  if (pat === 'stars') {
    bgTex = '<g fill="#fff" opacity="0.55"><circle cx="24" cy="24" r="1.4"/><circle cx="72" cy="18" r="1"/><circle cx="195" cy="22" r="1.6"/><circle cx="236" cy="40" r="1.2"/><circle cx="48" cy="76" r="1.1"/><circle cx="218" cy="88" r="1.4"/><circle cx="145" cy="16" r="1.1"/></g>';
  } else if (pat === 'grid') {
    bgTex = '<path d="M0 32H260M0 64H260M0 96H260M40 0V160M80 0V160M120 0V160M160 0V160M200 0V160M240 0V160" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>';
  } else if (pat === 'stripes') {
    bgTex = '<g stroke="rgba(255,255,255,0.07)" stroke-width="10"><line x1="-20" y1="160" x2="80" y2="0"/><line x1="40" y1="160" x2="140" y2="0"/><line x1="100" y1="160" x2="200" y2="0"/><line x1="160" y1="160" x2="260" y2="0"/><line x1="220" y1="160" x2="320" y2="0"/></g>';
  } else if (pat === 'sunburst') {
    bgTex = '<g fill="rgba(255,255,255,0.06)"><polygon points="130,72 0,0 45,0"/><polygon points="130,72 95,0 165,0"/><polygon points="130,72 215,0 260,0"/><polygon points="130,72 260,55 260,105"/><polygon points="130,72 0,55 0,105"/></g>';
  } else if (pat === 'radial') {
    bgTex = '<g fill="none" stroke="rgba(255,255,255,0.09)" stroke-width="1.5"><circle cx="130" cy="68" r="36"/><circle cx="130" cy="68" r="62"/><circle cx="130" cy="68" r="90"/></g>';
  } else if (pat === 'waves') {
    bgTex = '<path d="M0 34 Q32 22 65 34 T130 34 T195 34 T260 34 M0 74 Q32 62 65 74 T130 74 T195 74 T260 74" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="2"/>';
  } else if (pat === 'clouds') {
    bgTex = '<g fill="rgba(255,255,255,0.14)"><circle cx="44" cy="34" r="14"/><circle cx="58" cy="32" r="18"/><circle cx="74" cy="36" r="12"/><circle cx="204" cy="28" r="12"/><circle cx="218" cy="26" r="16"/><circle cx="232" cy="30" r="11"/></g>';
  } else if (pat === 'circuit') {
    bgTex = '<g fill="none" stroke="rgba(56,189,248,0.16)" stroke-width="1.6"><path d="M10 30 H55 L70 45 H105"/><path d="M250 34 H205 L190 50 H165"/><circle cx="105" cy="45" r="3" fill="rgba(56,189,248,0.28)"/><circle cx="165" cy="50" r="3" fill="rgba(56,189,248,0.28)"/></g>';
  } else if (pat === 'radar') {
    bgTex = '<g fill="none" stroke="rgba(56,189,248,0.2)" stroke-width="1.2"><circle cx="130" cy="68" r="24"/><circle cx="130" cy="68" r="48"/><line x1="130" y1="12" x2="130" y2="124"/><line x1="74" y1="68" x2="186" y2="68"/></g>';
  } else if (pat === 'snow') {
    bgTex = '<g fill="#fff" opacity="0.65"><circle cx="30" cy="24" r="2"/><circle cx="80" cy="44" r="1.5"/><circle cx="170" cy="20" r="2.2"/><circle cx="220" cy="50" r="1.8"/><circle cx="55" cy="82" r="1.6"/><circle cx="205" cy="86" r="2"/></g>';
  } else {
    bgTex = '<g fill="rgba(255,255,255,0.09)"><circle cx="30" cy="26" r="3"/><circle cx="60" cy="26" r="3"/><circle cx="200" cy="26" r="3"/><circle cx="230" cy="26" r="3"/><circle cx="30" cy="56" r="3"/><circle cx="230" cy="56" r="3"/></g>';
  }

  let s = '';
  switch (id) {
    case 1: // Flappy Bird
      s = `<rect x="52" y="0" width="26" height="52" rx="3" fill="#22c55e" stroke="#14532d" stroke-width="2"/>
        <rect x="48" y="42" width="34" height="12" rx="3" fill="#4ade80" stroke="#14532d" stroke-width="2"/>
        <rect x="52" y="96" width="26" height="64" rx="3" fill="#22c55e" stroke="#14532d" stroke-width="2"/>
        <rect x="182" y="0" width="26" height="36" rx="3" fill="#22c55e" stroke="#14532d" stroke-width="2"/>
        <rect x="182" y="80" width="26" height="80" rx="3" fill="#22c55e" stroke="#14532d" stroke-width="2"/>
        <rect x="178" y="78" width="34" height="12" rx="3" fill="#4ade80" stroke="#14532d" stroke-width="2"/>
        <circle cx="126" cy="68" r="17" fill="#facc15" stroke="#fff" stroke-width="2.5"/>
        <ellipse cx="117" cy="70" rx="8" ry="5" fill="#fef08a"/>
        <circle cx="133" cy="63" r="4" fill="#fff"/><circle cx="134" cy="63" r="2" fill="#0f172a"/>
        <polygon points="140,67 156,72 140,77" fill="#f97316"/>`; break;
    case 2: // Snake
      s = `<path d="M36 96 L88 96 L88 46 L154 46 L154 80 L196 80" fill="none" stroke="#4ade80" stroke-width="18" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="196" cy="80" r="12" fill="#86efac"/><circle cx="200" cy="75" r="2.5" fill="#052e16"/><circle cx="200" cy="85" r="2.5" fill="#052e16"/>
        <path d="M208 80 L216 77 M208 80 L216 83" stroke="#ef4444" stroke-width="2"/>
        <circle cx="228" cy="48" r="12" fill="#ef4444" stroke="#fecaca" stroke-width="2"/>
        <path d="M228 36 Q234 26 240 30" fill="none" stroke="#86efac" stroke-width="3" stroke-linecap="round"/>`; break;
    case 3: // Breakout
      s = `<g stroke="rgba(0,0,0,0.25)" stroke-width="1.5">
        <rect x="30" y="20" width="44" height="14" rx="4" fill="#ef4444"/><rect x="78" y="20" width="44" height="14" rx="4" fill="#ef4444"/><rect x="138" y="20" width="44" height="14" rx="4" fill="#ef4444"/><rect x="186" y="20" width="44" height="14" rx="4" fill="#ef4444"/>
        <rect x="30" y="38" width="44" height="14" rx="4" fill="#facc15"/><rect x="78" y="38" width="44" height="14" rx="4" fill="#facc15"/><rect x="138" y="38" width="44" height="14" rx="4" fill="#38bdf8"/><rect x="186" y="38" width="44" height="14" rx="4" fill="#facc15"/>
        </g>
        <line x1="130" y1="100" x2="158" y2="54" stroke="#fde047" stroke-width="3" stroke-dasharray="4 4"/>
        <circle cx="158" cy="54" r="9" fill="#fff" stroke="#f97316" stroke-width="3"/>
        <rect x="86" y="102" width="88" height="13" rx="6" fill="#38bdf8" stroke="#fff" stroke-width="2"/>`; break;
    case 4: // Pong
      s = `<line x1="130" y1="16" x2="130" y2="120" stroke="rgba(255,255,255,0.3)" stroke-width="3" stroke-dasharray="7 7"/>
        <rect x="36" y="34" width="14" height="52" rx="7" fill="#38bdf8" stroke="#fff" stroke-width="2"/>
        <rect x="210" y="48" width="14" height="52" rx="7" fill="#f43f5e" stroke="#fff" stroke-width="2"/>
        <line x1="72" y1="74" x2="162" y2="52" stroke="rgba(255,255,255,0.28)" stroke-width="8" stroke-linecap="round"/>
        <circle cx="164" cy="52" r="10" fill="#fff"/>
        <text x="96" y="34" font-weight="900" font-size="18" fill="#93c5fd">7</text><text x="154" y="34" font-weight="900" font-size="18" fill="#fda4af">5</text>`; break;
    case 5: // Tetris
      s = `<g stroke="rgba(255,255,255,0.25)" stroke-width="2">
        <rect x="52" y="34" width="26" height="26" rx="4" fill="#f43f5e"/><rect x="78" y="34" width="26" height="26" rx="4" fill="#f43f5e"/><rect x="78" y="60" width="26" height="26" rx="4" fill="#f43f5e"/><rect x="104" y="60" width="26" height="26" rx="4" fill="#f43f5e"/>
        <rect x="148" y="22" width="26" height="26" rx="4" fill="#38bdf8"/><rect x="148" y="48" width="26" height="26" rx="4" fill="#38bdf8"/><rect x="148" y="74" width="26" height="26" rx="4" fill="#38bdf8"/><rect x="174" y="74" width="26" height="26" rx="4" fill="#38bdf8"/>
        <rect x="52" y="90" width="26" height="26" rx="4" fill="#facc15"/><rect x="78" y="90" width="26" height="26" rx="4" fill="#facc15"/><rect x="104" y="90" width="26" height="26" rx="4" fill="#a855f7"/></g>`; break;
    case 6: // Memory Match
      s = `<rect x="44" y="24" width="50" height="68" rx="8" fill="#1e293b" stroke="#f472b6" stroke-width="2.5" transform="rotate(-7 69 58)"/>
        <text x="68" y="66" text-anchor="middle" font-weight="900" font-size="24" fill="#f472b6" transform="rotate(-7 69 58)">?</text>
        <rect x="105" y="22" width="50" height="68" rx="8" fill="#fff" stroke="#fde047" stroke-width="3"/>
        <polygon points="130,36 136,50 151,50 139,59 143,74 130,65 117,74 121,59 109,50 124,50" fill="#f59e0b"/>
        <rect x="166" y="24" width="50" height="68" rx="8" fill="#fff" stroke="#38bdf8" stroke-width="3" transform="rotate(7 191 58)"/>
        <polygon points="191,38 197,52 212,52 200,61 204,76 191,67 178,76 182,61 170,52 185,52" fill="#f59e0b" transform="rotate(7 191 58)"/>`; break;
    case 7: // Whack-a-Mole
      s = `<ellipse cx="115" cy="100" rx="52" ry="15" fill="#451a03"/>
        <path d="M84 96 L84 62 A31 31 0 0 1 146 62 L146 96 Z" fill="#a16207" stroke="#451a03" stroke-width="2.5"/>
        <ellipse cx="115" cy="70" rx="14" ry="10" fill="#fde68a"/><circle cx="115" cy="67" r="4.5" fill="#ec4899"/>
        <circle cx="104" cy="54" r="4" fill="#0f172a"/><circle cx="126" cy="54" r="4" fill="#0f172a"/>
        <g transform="rotate(-28 188 50)"><rect x="178" y="42" width="12" height="58" rx="4" fill="#d97706"/><rect x="162" y="20" width="44" height="26" rx="6" fill="#ef4444" stroke="#fff" stroke-width="2"/></g>`; break;
    case 8: // Minesweeper
      s = `<g stroke="rgba(255,255,255,0.22)" stroke-width="2">
        <rect x="64" y="20" width="38" height="38" rx="6" fill="#334155"/><rect x="111" y="20" width="38" height="38" rx="6" fill="#1e293b"/><rect x="158" y="20" width="38" height="38" rx="6" fill="#334155"/>
        <rect x="64" y="66" width="38" height="38" rx="6" fill="#1e293b"/><rect x="111" y="66" width="38" height="38" rx="6" fill="#ef4444"/><rect x="158" y="66" width="38" height="38" rx="6" fill="#1e293b"/>
        </g>
        <line x1="83" y1="26" x2="83" y2="50" stroke="#fff" stroke-width="2.5"/><polygon points="83,26 98,33 83,40" fill="#f43f5e"/>
        <text x="130" y="46" text-anchor="middle" font-weight="900" font-size="20" fill="#38bdf8">1</text>
        <text x="83" y="92" text-anchor="middle" font-weight="900" font-size="20" fill="#4ade80">2</text>
        <circle cx="130" cy="85" r="10" fill="#0f172a"/><path d="M130 70 V100 M115 85 H145 M120 75 L140 95 M140 75 L120 95" stroke="#0f172a" stroke-width="3"/>`; break;
    case 9: // 2048
      s = `<rect x="68" y="18" width="124" height="96" rx="12" fill="rgba(15,23,42,0.55)"/>
        <rect x="76" y="26" width="50" height="38" rx="7" fill="#fef08a"/><text x="101" y="51" text-anchor="middle" font-weight="900" font-size="18" fill="#713f12">2</text>
        <rect x="134" y="26" width="50" height="38" rx="7" fill="#fb923c"/><text x="159" y="51" text-anchor="middle" font-weight="900" font-size="18" fill="#fff">64</text>
        <rect x="76" y="70" width="50" height="38" rx="7" fill="#ef4444"/><text x="101" y="95" text-anchor="middle" font-weight="900" font-size="16" fill="#fff">512</text>
        <rect x="134" y="70" width="50" height="38" rx="7" fill="#facc15"/><text x="159" y="95" text-anchor="middle" font-weight="900" font-size="15" fill="#1e293b">2048</text>`; break;
    case 10: // Tic Tac Toe
      s = `<g stroke="rgba(255,255,255,0.4)" stroke-width="4" stroke-linecap="round"><line x1="106" y1="22" x2="106" y2="112"/><line x1="154" y1="22" x2="154" y2="112"/><line x1="66" y1="52" x2="194" y2="52"/><line x1="66" y1="84" x2="194" y2="84"/></g>
        <g stroke="#38bdf8" stroke-width="5" stroke-linecap="round"><line x1="76" y1="28" x2="96" y2="46"/><line x1="96" y1="28" x2="76" y2="46"/><line x1="120" y1="60" x2="140" y2="78"/><line x1="140" y1="60" x2="120" y2="78"/><line x1="164" y1="90" x2="184" y2="108"/><line x1="184" y1="90" x2="164" y2="108"/></g>
        <circle cx="174" cy="36" r="10" fill="none" stroke="#f43f5e" stroke-width="5"/><circle cx="86" cy="99" r="10" fill="none" stroke="#f43f5e" stroke-width="5"/>
        <line x1="72" y1="24" x2="188" y2="112" stroke="#facc15" stroke-width="4" opacity="0.85"/>`; break;
    case 11: // Simon Says
      s = `<circle cx="130" cy="66" r="46" fill="#0f172a"/>
        <path d="M126 62 L126 24 A42 42 0 0 0 88 62 Z" fill="#22c55e"/>
        <path d="M134 62 L172 62 A42 42 0 0 0 134 24 Z" fill="#ef4444"/>
        <path d="M126 70 L88 70 A42 42 0 0 0 126 108 Z" fill="#facc15"/>
        <path d="M134 70 L134 108 A42 42 0 0 0 172 70 Z" fill="#38bdf8"/>
        <circle cx="130" cy="66" r="15" fill="#1e293b" stroke="#fff" stroke-width="2"/>`; break;
    case 12: // Space Invaders
      s = `<g fill="#4ade80"><rect x="60" y="24" width="22" height="14" rx="2"/><rect x="119" y="24" width="22" height="14" rx="2"/><rect x="178" y="24" width="22" height="14" rx="2"/>
        <rect x="88" y="46" width="22" height="14" rx="2"/><rect x="150" y="46" width="22" height="14" rx="2"/></g>
        <line x1="130" y1="62" x2="130" y2="88" stroke="#f43f5e" stroke-width="4" stroke-linecap="round"/>
        <polygon points="130,86 146,110 114,110" fill="#38bdf8" stroke="#fff" stroke-width="2"/>`; break;
    case 13: // Asteroids
      s = `<polygon points="56,30 82,24 94,48 70,66 46,52" fill="none" stroke="#94a3b8" stroke-width="3"/>
        <polygon points="178,24 214,34 208,66 174,60" fill="none" stroke="#cbd5e1" stroke-width="3"/>
        <polygon points="130,52 146,96 130,86 114,96" fill="none" stroke="#38bdf8" stroke-width="3"/>
        <line x1="130" y1="48" x2="168" y2="30" stroke="#facc15" stroke-width="3" stroke-dasharray="6 4"/>`; break;
    case 14: // Frogger
      s = `<rect x="0" y="54" width="260" height="44" fill="#334155"/>
        <line x1="0" y1="76" x2="260" y2="76" stroke="#facc15" stroke-width="2" stroke-dasharray="10 8"/>
        <rect x="34" y="60" width="44" height="14" rx="4" fill="#ef4444"/><rect x="172" y="80" width="50" height="14" rx="4" fill="#38bdf8"/>
        <rect x="0" y="18" width="260" height="32" fill="#0284c7"/>
        <rect x="74" y="24" width="66" height="18" rx="9" fill="#92400e"/>
        <circle cx="130" cy="94" r="13" fill="#4ade80" stroke="#14532d" stroke-width="2"/>
        <circle cx="124" cy="88" r="3" fill="#fff"/><circle cx="136" cy="88" r="3" fill="#fff"/>`; break;
    case 15: // Doodle Jump
      s = `<rect x="48" y="88" width="52" height="11" rx="5" fill="#22c55e" stroke="#14532d" stroke-width="2"/>
        <rect x="150" y="58" width="52" height="11" rx="5" fill="#38bdf8" stroke="#0c4a6e" stroke-width="2"/>
        <rect x="82" y="28" width="52" height="11" rx="5" fill="#22c55e" stroke="#14532d" stroke-width="2"/>
        <path d="M114 78 L114 52 A16 16 0 0 1 146 52 L146 78 Z" fill="#84cc16" stroke="#1a2e05" stroke-width="2"/>
        <circle cx="124" cy="52" r="3" fill="#0f172a"/><circle cx="136" cy="52" r="3" fill="#0f172a"/>
        <line x1="146" y1="58" x2="158" y2="58" stroke="#1a2e05" stroke-width="4" stroke-linecap="round"/>`; break;
    case 16: // Missile Command
      s = `<path d="M40 16 L112 72 M198 14 L152 68 M130 10 L130 56" stroke="#f87171" stroke-width="3" stroke-dasharray="4 3"/>
        <circle cx="112" cy="72" r="18" fill="rgba(250,204,21,0.55)" stroke="#fef08a" stroke-width="2.5"/>
        <circle cx="152" cy="68" r="14" fill="rgba(251,146,60,0.6)" stroke="#fed7aa" stroke-width="2"/>
        <rect x="34" y="96" width="22" height="20" fill="#38bdf8"/><rect x="76" y="88" width="20" height="28" fill="#60a5fa"/><rect x="166" y="92" width="24" height="24" fill="#38bdf8"/><rect x="206" y="98" width="18" height="18" fill="#60a5fa"/>`; break;
    case 17: // Lunar Lander
      s = `<path d="M0 108 Q65 92 105 106 L155 106 Q200 90 260 108 L260 160 L0 160Z" fill="#475569"/>
        <rect x="104" y="102" width="52" height="6" rx="2" fill="#22c55e"/>
        <polygon points="116,74 144,74 136,92 124,92" fill="#f97316"/>
        <rect x="114" y="42" width="32" height="24" rx="5" fill="#e2e8f0" stroke="#94a3b8" stroke-width="2"/>
        <line x1="116" y1="66" x2="104" y2="82" stroke="#cbd5e1" stroke-width="3"/><line x1="144" y1="66" x2="156" y2="82" stroke="#cbd5e1" stroke-width="3"/>`; break;
    case 18: // Helicopter
      s = `<polygon points="0,0 260,0 260,28 190,18 130,36 65,16 0,30" fill="#134e4a"/>
        <polygon points="0,114 70,96 140,112 205,94 260,112 260,160 0,160" fill="#134e4a"/>
        <line x1="88" y1="50" x2="152" y2="50" stroke="#e2e8f0" stroke-width="4" stroke-linecap="round"/>
        <line x1="120" y1="50" x2="120" y2="60" stroke="#e2e8f0" stroke-width="3"/>
        <ellipse cx="122" cy="68" rx="28" ry="13" fill="#2dd4bf" stroke="#fff" stroke-width="2"/>
        <line x1="76" y1="68" x2="96" y2="68" stroke="#99f6e4" stroke-width="4"/>`; break;
    case 19: // Stack Tower
      s = `<rect x="64" y="92" width="132" height="18" rx="4" fill="#e11d48" stroke="#fff" stroke-width="1.5"/>
        <rect x="74" y="72" width="112" height="18" rx="4" fill="#f97316" stroke="#fff" stroke-width="1.5"/>
        <rect x="84" y="52" width="92" height="18" rx="4" fill="#facc15" stroke="#fff" stroke-width="1.5"/>
        <rect x="96" y="32" width="68" height="18" rx="4" fill="#4ade80" stroke="#fff" stroke-width="1.5"/>
        <rect x="114" y="14" width="44" height="14" rx="4" fill="#38bdf8" stroke="#fff" stroke-width="1.5" opacity="0.85"/>`; break;
    case 20: // Piano Tiles
      s = `<rect x="52" y="14" width="156" height="104" rx="8" fill="#f8fafc"/>
        <line x1="91" y1="14" x2="91" y2="118" stroke="#cbd5e1" stroke-width="2"/><line x1="130" y1="14" x2="130" y2="118" stroke="#cbd5e1" stroke-width="2"/><line x1="169" y1="14" x2="169" y2="118" stroke="#cbd5e1" stroke-width="2"/>
        <rect x="54" y="18" width="35" height="34" rx="4" fill="#0f172a"/><rect x="132" y="42" width="35" height="34" rx="4" fill="#0f172a"/><rect x="93" y="76" width="35" height="34" rx="4" fill="#6366f1"/>
        <line x1="48" y1="88" x2="212" y2="88" stroke="#38bdf8" stroke-width="3"/>`; break;
    case 21: // Connect Four
      s = `<rect x="66" y="20" width="128" height="94" rx="10" fill="#2563eb" stroke="#93c5fd" stroke-width="2"/>
        <circle cx="90" cy="42" r="10" fill="#0f172a"/><circle cx="117" cy="42" r="10" fill="#ef4444"/><circle cx="144" cy="42" r="10" fill="#0f172a"/><circle cx="171" cy="42" r="10" fill="#facc15"/>
        <circle cx="90" cy="67" r="10" fill="#ef4444"/><circle cx="117" cy="67" r="10" fill="#facc15"/><circle cx="144" cy="67" r="10" fill="#ef4444"/><circle cx="171" cy="67" r="10" fill="#facc15"/>
        <circle cx="90" cy="92" r="10" fill="#facc15"/><circle cx="117" cy="92" r="10" fill="#ef4444"/><circle cx="144" cy="92" r="10" fill="#facc15"/><circle cx="171" cy="92" r="10" fill="#ef4444"/>`; break;
    case 22: // Hangman
      s = `<path d="M58 106 H120 M80 106 V24 H136 V38" fill="none" stroke="#e2e8f0" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="136" cy="48" r="10" fill="none" stroke="#fde047" stroke-width="3"/>
        <path d="M136 58 V82 M136 66 L122 76 M136 66 L150 76" stroke="#fde047" stroke-width="3" stroke-linecap="round"/>
        <text x="180" y="76" font-weight="900" font-size="22" fill="#fff">A _ E</text>`; break;
    case 23: // Wordle
      s = `<g font-weight="900" font-size="18" text-anchor="middle" fill="#fff">
        <rect x="46" y="24" width="30" height="32" rx="5" fill="#475569"/><text x="61" y="46">S</text>
        <rect x="80" y="24" width="30" height="32" rx="5" fill="#eab308"/><text x="95" y="46">M</text>
        <rect x="114" y="24" width="30" height="32" rx="5" fill="#22c55e"/><text x="129" y="46">A</text>
        <rect x="148" y="24" width="30" height="32" rx="5" fill="#475569"/><text x="163" y="46">R</text>
        <rect x="182" y="24" width="30" height="32" rx="5" fill="#22c55e"/><text x="197" y="46">T</text>
        <rect x="46" y="64" width="30" height="32" rx="5" fill="#22c55e"/><text x="61" y="86">G</text>
        <rect x="80" y="64" width="30" height="32" rx="5" fill="#22c55e"/><text x="95" y="86">A</text>
        <rect x="114" y="64" width="30" height="32" rx="5" fill="#22c55e"/><text x="129" y="86">M</text>
        <rect x="148" y="64" width="30" height="32" rx="5" fill="#22c55e"/><text x="163" y="86">E</text>
        <rect x="182" y="64" width="30" height="32" rx="5" fill="#22c55e"/><text x="197" y="86">S</text></g>`; break;
    case 24: // Reaction Timer
      s = `<circle cx="130" cy="66" r="40" fill="rgba(15,23,42,0.7)" stroke="#facc15" stroke-width="5"/>
        <polygon points="136,38 114,68 128,68 122,94 146,62 132,62" fill="#facc15"/>
        <text x="196" y="42" font-weight="900" font-size="14" fill="#4ade80">184ms</text>`; break;
    case 25: // Maze Runner
      s = `<rect x="64" y="20" width="132" height="92" rx="8" fill="#090d16" stroke="#38bdf8" stroke-width="4"/>
        <path d="M94 20 V68 M128 46 V112 M162 20 V82 M64 52 H112 M146 52 H196" stroke="#38bdf8" stroke-width="4" stroke-linecap="round"/>
        <circle cx="79" cy="36" r="7" fill="#facc15"/><rect x="172" y="86" width="14" height="14" rx="3" fill="#22c55e"/>`; break;
    case 26: // Pac-Man Lite
      s = `<rect x="26" y="22" width="208" height="88" rx="12" fill="rgba(10,12,35,0.65)" stroke="#3b82f6" stroke-width="3"/>
        <circle cx="122" cy="66" r="5" fill="#fde047"/><circle cx="146" cy="66" r="5" fill="#fde047"/><circle cx="170" cy="66" r="5" fill="#fde047"/>
        <path d="M78,66 L99,50 A22,22 0 1,0 99,82 Z" fill="#facc15"/>
        <path d="M188 80 L188 60 A12 12 0 0 1 212 60 L212 80 L206 74 L200 80 L194 74 Z" fill="#f43f5e"/>`; break;
    case 27: // Typing Racer
      s = `<g fill="#1e293b" stroke="#38bdf8" stroke-width="2">
        <rect x="44" y="26" width="38" height="38" rx="7"/><rect x="90" y="26" width="38" height="38" rx="7"/><rect x="136" y="26" width="38" height="38" rx="7"/><rect x="182" y="26" width="38" height="38" rx="7"/>
        <rect x="64" y="72" width="132" height="30" rx="7" fill="#0f172a"/></g>
        <g fill="#fff" font-weight="900" font-size="18" text-anchor="middle"><text x="63" y="51">F</text><text x="109" y="51">A</text><text x="155" y="51">S</text><text x="201" y="51">T</text><text x="122" y="92" font-size="13" fill="#38bdf8">112 WPM</text></g><polygon points="158,79 168,79 162,89 170,89 156,102 160,90 152,90" fill="#fde047"/>`; break;
    case 28: // Rock Paper Scissors
      s = `<circle cx="68" cy="64" r="24" fill="rgba(255,255,255,0.16)" stroke="#fff" stroke-width="2"/>
        <circle cx="130" cy="64" r="24" fill="rgba(255,255,255,0.16)" stroke="#fff" stroke-width="2"/>
        <circle cx="192" cy="64" r="24" fill="rgba(255,255,255,0.16)" stroke="#fff" stroke-width="2"/>
        <circle cx="68" cy="64" r="11" fill="#94a3b8"/><circle cx="60" cy="56" r="5" fill="#94a3b8"/><circle cx="76" cy="56" r="5" fill="#94a3b8"/>
        <rect x="120" y="50" width="20" height="26" rx="4" fill="#e2e8f0"/><rect x="118" y="46" width="4" height="10" rx="2" fill="#e2e8f0"/><rect x="126" y="44" width="4" height="10" rx="2" fill="#e2e8f0"/><rect x="134" y="46" width="4" height="10" rx="2" fill="#e2e8f0"/>
        <path d="M186 52 L199 74 M199 52 L186 74" stroke="#e2e8f0" stroke-width="5" stroke-linecap="round"/><circle cx="186" cy="52" r="4" fill="none" stroke="#e2e8f0" stroke-width="3"/><circle cx="199" cy="52" r="4" fill="none" stroke="#e2e8f0" stroke-width="3"/>`; break;
    case 29: // Guess the Number
      s = `<rect x="52" y="24" width="60" height="78" rx="12" fill="#1e293b" stroke="#60a5fa" stroke-width="3"/>
        <text x="82" y="76" text-anchor="middle" font-weight="900" font-size="38" fill="#fde047">?</text>
        <polygon points="152,44 172,22 192,44" fill="#4ade80"/><polygon points="152,80 172,102 192,80" fill="#f43f5e"/>`; break;
    case 30: // Blackjack
      s = `<rect x="64" y="24" width="56" height="80" rx="8" fill="#fff" transform="rotate(-10 92 64)"/>
        <text x="84" y="50" font-weight="900" font-size="18" fill="#0f172a" transform="rotate(-10 92 64)">A</text><path d="M99 40 c-4 5 -8 7.5 -8 11 a5 5 0 0 0 9 3 l-1.5 6 h5 l-1.5 -6 a5 5 0 0 0 9 -3 c0 -3.5 -4 -6 -8 -11 z" fill="#0f172a" transform="rotate(-10 100 48)"/>
        <rect x="132" y="22" width="56" height="80" rx="8" fill="#fff" stroke="#facc15" stroke-width="2.5" transform="rotate(8 160 62)"/>
        <text x="158" y="64" text-anchor="middle" font-weight="900" font-size="24" fill="#dc2626" transform="rotate(8 160 62)">21</text>`; break;
    case 31: // 15 Sliding Puzzle
      s = `<rect x="74" y="18" width="112" height="96" rx="10" fill="#1e293b" stroke="#fb923c" stroke-width="2"/>
        <g font-weight="900" font-size="18" text-anchor="middle" fill="#fff">
        <rect x="82" y="26" width="30" height="26" rx="5" fill="#f97316"/><text x="97" y="45">1</text>
        <rect x="115" y="26" width="30" height="26" rx="5" fill="#fb923c"/><text x="130" y="45">2</text>
        <rect x="148" y="26" width="30" height="26" rx="5" fill="#f97316"/><text x="163" y="45">3</text>
        <rect x="82" y="55" width="30" height="26" rx="5" fill="#fb923c"/><text x="97" y="74">4</text>
        <rect x="115" y="55" width="30" height="26" rx="5" fill="#f97316"/><text x="130" y="74">5</text>
        <rect x="82" y="84" width="30" height="26" rx="5" fill="#f97316"/><text x="97" y="103">7</text>
        <rect x="148" y="84" width="30" height="26" rx="5" fill="#fbbf24"/><text x="163" y="103" fill="#0f172a">15</text></g>`; break;
    case 32: // Lights Out
      s = `<g stroke="rgba(255,255,255,0.2)" stroke-width="2">
        <rect x="74" y="20" width="32" height="28" rx="6" fill="#facc15"/><rect x="114" y="20" width="32" height="28" rx="6" fill="#1e293b"/><rect x="154" y="20" width="32" height="28" rx="6" fill="#facc15"/>
        <rect x="74" y="53" width="32" height="28" rx="6" fill="#1e293b"/><rect x="114" y="53" width="32" height="28" rx="6" fill="#fde047"/><rect x="154" y="53" width="32" height="28" rx="6" fill="#1e293b"/>
        <rect x="74" y="86" width="32" height="28" rx="6" fill="#facc15"/><rect x="114" y="86" width="32" height="28" rx="6" fill="#1e293b"/><rect x="154" y="86" width="32" height="28" rx="6" fill="#facc15"/></g>`; break;
    case 33: // Sudoku
      s = `<rect x="74" y="18" width="112" height="96" rx="8" fill="#f8fafc" stroke="#3b82f6" stroke-width="3"/>
        <path d="M111 18 V114 M149 18 V114 M74 50 H186 M74 82 H186" stroke="#1e293b" stroke-width="2.5"/>
        <g font-weight="900" font-size="18" text-anchor="middle" fill="#1e293b"><text x="92" y="40">9</text><text x="130" y="40" fill="#2563eb">4</text><text x="167" y="72">7</text><text x="92" y="104" fill="#2563eb">5</text><text x="130" y="104">8</text></g>`; break;
    case 34: // Battleship
      s = `<rect x="52" y="22" width="156" height="86" rx="8" fill="rgba(4,28,44,0.8)" stroke="#38bdf8" stroke-width="2"/>
        <rect x="74" y="46" width="84" height="22" rx="11" fill="#64748b" stroke="#e2e8f0" stroke-width="2"/>
        <circle cx="116" cy="57" r="7" fill="#ef4444"/><line x1="110" y1="51" x2="122" y2="63" stroke="#fff" stroke-width="2.5"/><line x1="122" y1="51" x2="110" y2="63" stroke="#fff" stroke-width="2.5"/>
        <circle cx="176" cy="84" r="6" fill="#fff" opacity="0.6"/>`; break;
    case 35: // Reversi
      s = `<rect x="70" y="20" width="120" height="92" rx="8" fill="#065f46" stroke="#34d399" stroke-width="2.5"/>
        <line x1="130" y1="20" x2="130" y2="112" stroke="rgba(0,0,0,0.3)" stroke-width="2"/><line x1="70" y1="66" x2="190" y2="66" stroke="rgba(0,0,0,0.3)" stroke-width="2"/>
        <circle cx="102" cy="44" r="15" fill="#0f172a" stroke="#475569" stroke-width="2"/><circle cx="158" cy="44" r="15" fill="#f8fafc"/>
        <circle cx="102" cy="88" r="15" fill="#f8fafc"/><circle cx="158" cy="88" r="15" fill="#0f172a" stroke="#475569" stroke-width="2"/>`; break;
    case 36: // Gomoku
      s = `<rect x="66" y="20" width="128" height="92" rx="8" fill="#d97706" stroke="#fde68a" stroke-width="2"/>
        <path d="M84 20 V112 M114 20 V112 M146 20 V112 M176 20 V112 M66 42 H194 M66 66 H194 M66 90 H194" stroke="rgba(69,26,3,0.45)" stroke-width="1.5"/>
        <circle cx="84" cy="90" r="9" fill="#0f172a"/><circle cx="114" cy="66" r="9" fill="#0f172a"/><circle cx="146" cy="42" r="9" fill="#0f172a"/><circle cx="176" cy="90" r="9" fill="#fff"/><circle cx="114" cy="42" r="9" fill="#fff"/>`; break;
    case 37: // Checkers
      s = `<rect x="74" y="20" width="112" height="92" rx="8" fill="#1c1917" stroke="#f8fafc" stroke-width="2"/>
        <rect x="74" y="20" width="56" height="46" fill="#fef3c7" opacity="0.25"/><rect x="130" y="66" width="56" height="46" fill="#fef3c7" opacity="0.25"/>
        <circle cx="102" cy="43" r="16" fill="#dc2626" stroke="#fff" stroke-width="2"/>
        <circle cx="158" cy="89" r="16" fill="#f8fafc" stroke="#facc15" stroke-width="3"/>
        <path d="M147 96 L145 82 l6 4.5 4 -7.5 4 7.5 6 -4.5 -2 14 z" fill="#ca8a04"/>`; break;
    case 38: // Bubble Shooter
      s = `<circle cx="78" cy="34" r="15" fill="#f43f5e" stroke="#fff" stroke-width="2"/><circle cx="110" cy="34" r="15" fill="#38bdf8" stroke="#fff" stroke-width="2"/><circle cx="142" cy="34" r="15" fill="#38bdf8" stroke="#fff" stroke-width="2"/><circle cx="174" cy="34" r="15" fill="#4ade80" stroke="#fff" stroke-width="2"/>
        <circle cx="126" cy="60" r="15" fill="#facc15" stroke="#fff" stroke-width="2"/>
        <line x1="130" y1="108" x2="126" y2="76" stroke="#fff" stroke-width="3" stroke-dasharray="4 4"/>
        <circle cx="130" cy="104" r="12" fill="#f43f5e" stroke="#fff" stroke-width="2"/>`; break;
    case 39: // Air Hockey
      s = `<rect x="34" y="20" width="192" height="92" rx="16" fill="#090d1a" stroke="#22d3ee" stroke-width="3"/>
        <line x1="130" y1="20" x2="130" y2="112" stroke="rgba(34,211,238,0.4)" stroke-width="2"/>
        <circle cx="76" cy="66" r="16" fill="#38bdf8" stroke="#fff" stroke-width="3"/>
        <circle cx="186" cy="54" r="16" fill="#f43f5e" stroke="#fff" stroke-width="3"/>
        <circle cx="134" cy="74" r="9" fill="#facc15"/>`; break;
    case 40: // Catch Falling
      s = `<circle cx="88" cy="34" r="11" fill="#ef4444"/><polygon points="130,22 135,34 148,34 138,42 142,54 130,46 118,54 122,42 112,34 125,34" fill="#facc15"/>
        <circle cx="174" cy="40" r="10" fill="#4ade80"/>
        <path d="M90 82 H170 L160 108 H100 Z" fill="#d97706" stroke="#fde68a" stroke-width="2.5"/>`; break;
    case 41: // Dodger
      s = `<polygon points="56,28 74,46 56,64 38,46" fill="#f43f5e"/><polygon points="188,24 206,42 188,60 170,42" fill="#f43f5e"/><polygon points="94,70 110,86 94,102 78,86" fill="#fb7185"/>
        <circle cx="144" cy="76" r="14" fill="#38bdf8" stroke="#fff" stroke-width="3"/>
        <path d="M126 76 H112" stroke="#38bdf8" stroke-width="3" stroke-linecap="round"/>`; break;
    case 42: // Endless Runner
      s = `<line x1="0" y1="100" x2="260" y2="100" stroke="#fb923c" stroke-width="4"/>
        <rect x="166" y="66" width="16" height="34" rx="4" fill="#4ade80"/><rect x="186" y="76" width="12" height="24" rx="4" fill="#22c55e"/>
        <circle cx="90" cy="48" r="11" fill="#fff"/><path d="M90 59 L82 80 L66 88 M86 68 L104 62 M82 80 L98 92" stroke="#fff" stroke-width="5" stroke-linecap="round" fill="none"/>`; break;
    case 43: // Ski Slope
      s = `<polygon points="44,86 58,42 72,86" fill="#15803d"/><polygon points="196,94 214,40 232,94" fill="#166534"/>
        <path d="M98 22 Q130 56 112 96" fill="none" stroke="#93c5fd" stroke-width="4" stroke-dasharray="6 4"/>
        <circle cx="136" cy="58" r="10" fill="#ef4444"/><line x1="120" y1="86" x2="154" y2="96" stroke="#0f172a" stroke-width="4" stroke-linecap="round"/>`; break;
    case 44: // Fishing Frenzy
      s = `<path d="M0 44 Q65 34 130 44 T260 44 L260 160 L0 160Z" fill="rgba(14,165,233,0.35)"/>
        <line x1="130" y1="10" x2="130" y2="66" stroke="#e2e8f0" stroke-width="2"/><path d="M130 66 Q130 78 140 74" fill="none" stroke="#facc15" stroke-width="2.5"/>
        <ellipse cx="164" cy="82" rx="22" ry="12" fill="#f97316"/><polygon points="184,82 198,72 198,92" fill="#fb923c"/><circle cx="152" cy="80" r="2.5" fill="#fff"/>`; break;
    case 45: // Target Shooter
      s = `<circle cx="130" cy="64" r="40" fill="#fff"/><circle cx="130" cy="64" r="28" fill="#ef4444"/><circle cx="130" cy="64" r="16" fill="#fff"/><circle cx="130" cy="64" r="7" fill="#ef4444"/>
        <circle cx="130" cy="64" r="22" fill="none" stroke="#0f172a" stroke-width="2"/><line x1="130" y1="18" x2="130" y2="110" stroke="#0f172a" stroke-width="1.5"/><line x1="84" y1="64" x2="176" y2="64" stroke="#0f172a" stroke-width="1.5"/>`; break;
    case 46: // Archery
      s = `<path d="M62 24 Q94 66 62 108" fill="none" stroke="#fbbf24" stroke-width="5" stroke-linecap="round"/><line x1="62" y1="24" x2="62" y2="108" stroke="#e2e8f0" stroke-width="1.8"/>
        <line x1="64" y1="66" x2="164" y2="66" stroke="#fff" stroke-width="3"/><polygon points="164,60 176,66 164,72" fill="#fde047"/>
        <ellipse cx="198" cy="66" rx="14" ry="38" fill="#ef4444" stroke="#fff" stroke-width="4"/><ellipse cx="198" cy="66" rx="6" ry="18" fill="#facc15"/>`; break;
    case 47: // Basketball
      s = `<rect x="86" y="18" width="88" height="54" rx="6" fill="rgba(255,255,255,0.9)"/><rect x="110" y="34" width="40" height="24" fill="none" stroke="#ef4444" stroke-width="3"/>
        <line x1="106" y1="64" x2="154" y2="64" stroke="#f97316" stroke-width="5" stroke-linecap="round"/>
        <circle cx="130" cy="92" r="20" fill="#f97316" stroke="#1e293b" stroke-width="2.5"/><path d="M110 92 H150 M130 72 V112" stroke="#1e293b" stroke-width="2"/>`; break;
    case 48: // Penalty Kicks
      s = `<rect x="64" y="24" width="132" height="58" fill="none" stroke="#fff" stroke-width="5"/>
        <path d="M64 42 H196 M64 60 H196 M96 24 V82 M130 24 V82 M164 24 V82" stroke="rgba(255,255,255,0.22)" stroke-width="1.5"/>
        <circle cx="130" cy="88" r="18" fill="#fff" stroke="#0f172a" stroke-width="2.5"/><polygon points="130,80 137,86 134,94 126,94 123,86" fill="#0f172a"/>`; break;
    case 49: // Mini Golf
      s = `<rect x="44" y="72" width="172" height="36" rx="18" fill="#15803d" stroke="#86efac" stroke-width="3"/>
        <ellipse cx="176" cy="88" rx="10" ry="5" fill="#0f172a"/>
        <line x1="176" y1="24" x2="176" y2="88" stroke="#fff" stroke-width="3"/><polygon points="176,24 206,34 176,44" fill="#ef4444"/>
        <circle cx="88" cy="88" r="9" fill="#fff"/>`; break;
    case 50: // Bowling
      s = `<polygon points="88,16 172,16 206,126 54,126" fill="#d4a36a" opacity="0.9"/>
        <circle cx="130" cy="38" r="6" fill="#fff"/><circle cx="118" cy="28" r="6" fill="#fff"/><circle cx="142" cy="28" r="6" fill="#fff"/>
        <circle cx="130" cy="86" r="20" fill="#2563eb" stroke="#fff" stroke-width="2.5"/><circle cx="123" cy="79" r="3" fill="#0f172a"/><circle cx="133" cy="78" r="3" fill="#0f172a"/>`; break;
    case 51: // Darts
      s = `<circle cx="130" cy="64" r="42" fill="#0f172a" stroke="#facc15" stroke-width="3"/><circle cx="130" cy="64" r="28" fill="#dc2626"/><circle cx="130" cy="64" r="16" fill="#22c55e"/><circle cx="130" cy="64" r="6" fill="#ef4444"/>
        <line x1="130" y1="64" x2="184" y2="26" stroke="#e2e8f0" stroke-width="3"/><polygon points="184,26 196,16 198,28 188,34" fill="#38bdf8"/>`; break;
    case 52: // Car Dodger
      s = `<polygon points="82,20 178,20 226,126 34,126" fill="#1e293b"/>
        <line x1="130" y1="26" x2="130" y2="120" stroke="#facc15" stroke-width="4" stroke-dasharray="10 8"/>
        <rect x="86" y="34" width="26" height="42" rx="6" fill="#38bdf8"/><rect x="142" y="64" width="30" height="46" rx="7" fill="#ef4444" stroke="#fff" stroke-width="2"/>`; break;
    case 53: // Crossy Road
      s = `<rect x="0" y="50" width="260" height="36" fill="#334155"/><rect x="34" y="56" width="44" height="22" rx="4" fill="#f97316"/><rect x="176" y="56" width="48" height="22" rx="4" fill="#38bdf8"/>
        <rect x="114" y="72" width="32" height="32" rx="5" fill="#fff" stroke="#0f172a" stroke-width="2"/>
        <rect x="124" y="66" width="12" height="8" rx="2" fill="#ef4444"/><rect x="144" y="82" width="10" height="7" fill="#f97316"/>`; break;
    case 54: // Submarine
      s = `<ellipse cx="122" cy="70" rx="42" ry="20" fill="#facc15" stroke="#fff" stroke-width="2"/>
        <rect x="112" y="40" width="16" height="14" rx="3" fill="#eab308"/><circle cx="110" cy="70" r="6" fill="#0ea5e9" stroke="#fff" stroke-width="2"/><circle cx="134" cy="70" r="6" fill="#0ea5e9" stroke="#fff" stroke-width="2"/>
        <circle cx="192" cy="64" r="5" fill="#bae6fd"/><circle cx="206" cy="50" r="7" fill="#bae6fd"/>`; break;
    case 55: // Balloon Pop
      s = `<ellipse cx="82" cy="52" rx="20" ry="25" fill="#f43f5e" stroke="#fff" stroke-width="2"/><ellipse cx="132" cy="44" rx="20" ry="25" fill="#38bdf8" stroke="#fff" stroke-width="2"/><ellipse cx="178" cy="60" rx="18" ry="22" fill="#facc15" stroke="#fff" stroke-width="2"/>
        <path d="M82 77 Q78 96 86 110 M132 69 Q136 90 128 106 M178 82 Q174 98 182 110" fill="none" stroke="rgba(255,255,255,0.6)" stroke-width="2"/>`; break;
    case 56: // Cookie Clicker
      s = `<circle cx="130" cy="64" r="42" fill="#d97706" stroke="#fde68a" stroke-width="3"/>
        <circle cx="112" cy="48" r="6" fill="#451a03"/><circle cx="148" cy="52" r="7" fill="#451a03"/><circle cx="122" cy="78" r="6" fill="#451a03"/><circle cx="150" cy="82" r="5" fill="#451a03"/><circle cx="102" cy="66" r="4.5" fill="#451a03"/>
        <polygon points="154,68 176,84 166,88 172,100 164,104 158,92 150,96" fill="#fff" stroke="#0f172a" stroke-width="2"/>`; break;
    case 57: // Button Masher
      s = `<ellipse cx="130" cy="84" rx="54" ry="20" fill="#334155"/><ellipse cx="130" cy="66" rx="44" ry="22" fill="#ef4444" stroke="#fca5a5" stroke-width="3"/>
        <text x="130" y="72" text-anchor="middle" font-weight="900" font-size="14" fill="#fff">TAP!</text>
        <path d="M74 34 L86 44 M186 34 L174 44 M130 20 V34" stroke="#fde047" stroke-width="3" stroke-linecap="round"/>`; break;
    case 58: // Rhythm Tap
      s = `<line x1="70" y1="16" x2="70" y2="112" stroke="rgba(255,255,255,0.2)" stroke-width="2"/><line x1="110" y1="16" x2="110" y2="112" stroke="rgba(255,255,255,0.2)" stroke-width="2"/><line x1="150" y1="16" x2="150" y2="112" stroke="rgba(255,255,255,0.2)" stroke-width="2"/><line x1="190" y1="16" x2="190" y2="112" stroke="rgba(255,255,255,0.2)" stroke-width="2"/>
        <rect x="44" y="84" width="172" height="10" rx="5" fill="rgba(255,255,255,0.25)"/>
        <circle cx="70" cy="40" r="11" fill="#f43f5e"/><circle cx="110" cy="89" r="13" fill="#38bdf8" stroke="#fff" stroke-width="3"/><circle cx="150" cy="56" r="11" fill="#4ade80"/><circle cx="190" cy="30" r="11" fill="#facc15"/>`; break;
    case 59: // Dance Arrows
      s = `<g stroke="#fff" stroke-width="2">
        <circle cx="62" cy="64" r="20" fill="#f43f5e"/><polygon points="67,53 67,75 51,64" fill="#fff"/>
        <circle cx="108" cy="64" r="20" fill="#38bdf8"/><polygon points="97,59 119,59 108,75" fill="#fff"/>
        <circle cx="154" cy="64" r="20" fill="#4ade80"/><polygon points="143,69 165,69 154,53" fill="#fff"/>
        <circle cx="200" cy="64" r="20" fill="#facc15"/><polygon points="195,53 195,75 211,64" fill="#fff"/></g>`; break;
    case 60: // Math Sprint
      s = `<rect x="52" y="24" width="156" height="84" rx="12" fill="rgba(15,23,42,0.7)" stroke="#60a5fa" stroke-width="2.5"/>
        <text x="130" y="64" text-anchor="middle" font-weight="900" font-size="26" fill="#fff">7 × 8 = ?</text>
        <text x="130" y="92" text-anchor="middle" font-weight="800" font-size="14" fill="#4ade80">+ − × ÷</text>`; break;
    case 61: // Word Scramble
      s = `<g font-weight="900" font-size="20" text-anchor="middle" fill="#1e293b">
        <rect x="44" y="34" width="36" height="40" rx="7" fill="#fde047" transform="rotate(-8 62 54)"/><text x="62" y="61" transform="rotate(-8 62 54)">P</text>
        <rect x="88" y="42" width="36" height="40" rx="7" fill="#38bdf8" transform="rotate(6 106 62)"/><text x="106" y="69" transform="rotate(6 106 62)">L</text>
        <rect x="132" y="32" width="36" height="40" rx="7" fill="#4ade80" transform="rotate(-5 150 52)"/><text x="150" y="59" transform="rotate(-5 150 52)">A</text>
        <rect x="176" y="42" width="36" height="40" rx="7" fill="#f472b6" transform="rotate(8 194 62)"/><text x="194" y="69" transform="rotate(8 194 62)">Y</text></g>`; break;
    case 62: // Flags Quiz
      s = `<rect x="44" y="30" width="76" height="50" rx="6" fill="#fff"/><circle cx="82" cy="55" r="14" fill="#bc002d"/>
        <rect x="140" y="30" width="76" height="50" rx="6" fill="#0055a4"/><rect x="165" y="30" width="26" height="50" fill="#fff"/><rect x="191" y="30" width="25" height="50" fill="#ef4135"/>`; break;
    case 63: // Knight's Tour
      s = `<rect x="74" y="20" width="112" height="90" rx="8" fill="#1e293b" stroke="#c084fc" stroke-width="2"/>
        <rect x="74" y="20" width="56" height="45" fill="rgba(255,255,255,0.18)"/><rect x="130" y="65" width="56" height="45" fill="rgba(255,255,255,0.18)"/>
        <path d="M98 88 L130 42 L160 72" fill="none" stroke="#facc15" stroke-width="3" stroke-dasharray="5 4"/>
        <path d="M112 84 L112 74 Q110 62 118 54 L124 48 L122 40 L130 46 L138 44 Q148 46 148 56 Q148 64 142 68 L142 84 Z M122 84 h20 v6 h-20 z" fill="#fff"/><circle cx="132" cy="56" r="2.4" fill="#1e293b"/>`; break;
    case 64: // Pipe Connect
      s = `<path d="M30 48 H108 V88 H230" fill="none" stroke="#22d3ee" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M164 16 V60 H230" fill="none" stroke="#facc15" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/>`; break;
    case 65: // Color Flood
      s = `<rect x="66" y="20" width="42" height="42" fill="#f43f5e"/><rect x="108" y="20" width="42" height="42" fill="#38bdf8"/><rect x="150" y="20" width="42" height="42" fill="#facc15"/>
        <rect x="66" y="62" width="42" height="42" fill="#38bdf8"/><rect x="108" y="62" width="42" height="42" fill="#4ade80"/><rect x="150" y="62" width="42" height="42" fill="#a855f7"/>`; break;
    case 66: // Chain Reaction
      s = `<circle cx="96" cy="52" r="18" fill="#f97316" stroke="#fff" stroke-width="2"/><circle cx="152" cy="48" r="14" fill="#ef4444" stroke="#fff" stroke-width="2"/>
        <circle cx="128" cy="84" r="16" fill="#facc15" stroke="#fff" stroke-width="2"/>
        <line x1="110" y1="58" x2="122" y2="74" stroke="#fff" stroke-width="2.5"/><line x1="142" y1="58" x2="134" y2="74" stroke="#fff" stroke-width="2.5"/>`; break;
    case 67: // Gravity Flip
      s = `<rect x="0" y="22" width="260" height="8" fill="#38bdf8"/><rect x="0" y="96" width="260" height="8" fill="#f43f5e"/>
        <rect x="74" y="72" width="24" height="24" rx="5" fill="#facc15"/>
        <path d="M126 78 V44 M118 52 L126 42 L134 52" stroke="#fff" stroke-width="3.5" stroke-linecap="round" fill="none"/>
        <rect x="166" y="30" width="24" height="24" rx="5" fill="#4ade80"/>`; break;
    case 68: // Pixel Painter
      s = `<rect x="66" y="20" width="90" height="86" rx="8" fill="#fff"/>
        <rect x="78" y="32" width="22" height="22" fill="#ef4444"/><rect x="100" y="32" width="22" height="22" fill="#facc15"/><rect x="122" y="32" width="22" height="22" fill="#38bdf8"/>
        <rect x="100" y="54" width="22" height="22" fill="#4ade80"/><rect x="78" y="76" width="22" height="22" fill="#a855f7"/>
        <path d="M174 34 L196 56 L160 92 L138 70 Z" fill="#f472b6" stroke="#fff" stroke-width="2"/>`; break;
    case 69: // Etch A Sketch
      s = `<rect x="50" y="18" width="160" height="96" rx="12" fill="#dc2626" stroke="#fca5a5" stroke-width="2"/>
        <rect x="68" y="28" width="124" height="64" rx="5" fill="#cbd5e1"/>
        <polyline points="82,76 102,44 134,76 158,42 178,68" fill="none" stroke="#1e293b" stroke-width="3.5" stroke-linejoin="round"/>
        <circle cx="72" cy="102" r="9" fill="#f8fafc"/><circle cx="188" cy="102" r="9" fill="#f8fafc"/>`; break;
    case 70: // Falling Sand
      s = `<path d="M50 112 Q110 74 165 98 Q210 110 260 88 L260 124 L0 124 Z" fill="#eab308"/>
        <path d="M0 106 Q45 90 95 112 L0 124 Z" fill="#0ea5e9" opacity="0.8"/>
        <g fill="#fde047"><circle cx="130" cy="24" r="3"/><circle cx="126" cy="40" r="3"/><circle cx="134" cy="54" r="3"/><circle cx="129" cy="68" r="3"/></g>`; break;
    case 71: // Tower Defense
      s = `<path d="M0 90 L76 90 L76 42 L166 42 L166 94 L260 94" fill="none" stroke="rgba(15,23,42,0.75)" stroke-width="24" stroke-linejoin="round"/>
        <circle cx="118" cy="78" r="14" fill="#38bdf8" stroke="#fff" stroke-width="2.5"/><line x1="118" y1="78" x2="132" y2="56" stroke="#fff" stroke-width="4" stroke-linecap="round"/>
        <circle cx="196" cy="58" r="14" fill="#f43f5e" stroke="#fff" stroke-width="2.5"/><circle cx="76" cy="58" r="8" fill="#ef4444"/><circle cx="134" cy="42" r="8" fill="#f97316"/>`; break;
    case 72: // Neon Pinball
      s = `<circle cx="90" cy="42" r="16" fill="#f43f5e" stroke="#fff" stroke-width="2.5"/><circle cx="170" cy="42" r="16" fill="#38bdf8" stroke="#fff" stroke-width="2.5"/>
        <circle cx="130" cy="72" r="10" fill="#fde047"/>
        <line x1="66" y1="98" x2="112" y2="108" stroke="#f472b6" stroke-width="10" stroke-linecap="round"/><line x1="194" y1="98" x2="148" y2="108" stroke="#f472b6" stroke-width="10" stroke-linecap="round"/>`; break;
    case 73: // Ice Curling
      s = `<circle cx="130" cy="62" r="40" fill="#ef4444"/><circle cx="130" cy="62" r="28" fill="#fff"/><circle cx="130" cy="62" r="16" fill="#2563eb"/>
        <circle cx="136" cy="66" r="11" fill="#facc15" stroke="#0f172a" stroke-width="2.5"/><line x1="130" y1="62" x2="142" y2="62" stroke="#0f172a" stroke-width="3"/>`; break;
    case 74: // Pool Lite
      s = `<rect x="40" y="20" width="180" height="90" rx="10" fill="#15803d" stroke="#78350f" stroke-width="6"/>
        <circle cx="100" cy="64" r="11" fill="#fff"/><circle cx="152" cy="54" r="11" fill="#ef4444"/><circle cx="168" cy="66" r="11" fill="#facc15"/><circle cx="152" cy="76" r="11" fill="#0f172a"/>
        <line x1="48" y1="88" x2="90" y2="68" stroke="#fde68a" stroke-width="4" stroke-linecap="round"/>`; break;
    case 75: // Train Switcher
      s = `<path d="M24 72 H120 L196 34 M120 72 L196 98" fill="none" stroke="#94a3b8" stroke-width="8" stroke-linecap="round"/>
        <rect x="44" y="54" width="46" height="24" rx="6" fill="#facc15" stroke="#0f172a" stroke-width="2"/>
        <circle cx="120" cy="72" r="8" fill="#22c55e" stroke="#fff" stroke-width="2"/>`; break;
    case 76: // Fireworks
      s = `<circle cx="84" cy="48" r="24" fill="none" stroke="#f472b6" stroke-width="3" stroke-dasharray="4 6"/><circle cx="84" cy="48" r="5" fill="#fff"/>
        <circle cx="170" cy="60" r="30" fill="none" stroke="#facc15" stroke-width="3" stroke-dasharray="5 7"/><circle cx="170" cy="60" r="6" fill="#38bdf8"/>`; break;
    case 77: // Farm Clicker
      s = `<circle cx="198" cy="36" r="16" fill="#fde047"/>
        <rect x="78" y="48" width="66" height="48" fill="#dc2626" stroke="#fff" stroke-width="2"/><polygon points="72,48 111,22 150,48" fill="#991b1b" stroke="#fff" stroke-width="2"/>
        <rect x="102" y="68" width="18" height="28" fill="#78350f"/>`; break;
    case 78: // World Capitals Quiz
      s = `<circle cx="126" cy="64" r="38" fill="#2563eb" stroke="#93c5fd" stroke-width="3"/>
        <path d="M104 42 Q122 52 116 74 Q138 82 148 56 Q132 34 104 42Z" fill="#4ade80"/>
        <path d="M168 30 A12 12 0 1 1 192 30 Q192 44 180 56 Q168 44 168 30Z" fill="#f43f5e"/><circle cx="180" cy="30" r="4" fill="#fff"/>`; break;
    case 79: // Tangram
      s = `<polygon points="84,96 130,34 176,96" fill="#f43f5e" stroke="#fff" stroke-width="2"/>
        <polygon points="84,96 130,96 107,65" fill="#facc15" stroke="#fff" stroke-width="2"/>
        <polygon points="130,96 176,96 153,65" fill="#38bdf8" stroke="#fff" stroke-width="2"/>`; break;
    case 80: // Jigsaw Lite
      s = `<path d="M74 28 H124 V48 A10 10 0 1 1 124 68 V96 H74 Z" fill="#38bdf8" stroke="#fff" stroke-width="2"/>
        <path d="M124 28 H186 V96 H124 V68 A10 10 0 1 0 124 48 Z" fill="#facc15" stroke="#fff" stroke-width="2"/>`; break;
    case 81: // Orbit Dodge
      s = `<circle cx="130" cy="64" r="22" fill="#818cf8" stroke="#c7d2fe" stroke-width="2"/>
        <circle cx="130" cy="64" r="42" fill="none" stroke="rgba(255,255,255,0.35)" stroke-width="2" stroke-dasharray="6 4"/>
        <circle cx="172" cy="64" r="9" fill="#38bdf8" stroke="#fff" stroke-width="2"/><circle cx="88" cy="40" r="7" fill="#f43f5e"/>`; break;
    case 82: // Rocket Escape
      s = `<polygon points="130,22 152,72 130,62 108,72" fill="#f8fafc" stroke="#f97316" stroke-width="2.5"/>
        <polygon points="120,72 130,104 140,72" fill="#facc15"/>
        <circle cx="64" cy="48" r="12" fill="#64748b"/><circle cx="196" cy="76" r="14" fill="#475569"/>`; break;
    case 83: // Shadow Guess
      s = `<polygon points="130,16 74,108 186,108" fill="rgba(253,224,71,0.22)"/>
        <circle cx="130" cy="62" r="22" fill="#090d16"/>
        <text x="130" y="72" text-anchor="middle" font-weight="900" font-size="28" fill="#facc15">?</text>`; break;
    case 84: // Emoji Match
      s = `<circle cx="82" cy="62" r="22" fill="#facc15"/><circle cx="75" cy="57" r="3" fill="#0f172a"/><circle cx="89" cy="57" r="3" fill="#0f172a"/><path d="M74 68 Q82 75 90 68" stroke="#0f172a" stroke-width="2.5" fill="none"/>
        <circle cx="178" cy="62" r="22" fill="#facc15"/><circle cx="171" cy="57" r="3" fill="#0f172a"/><circle cx="185" cy="57" r="3" fill="#0f172a"/><path d="M170 68 Q178 75 186 68" stroke="#0f172a" stroke-width="2.5" fill="none"/>
        <path d="M112 62 H148" stroke="#f472b6" stroke-width="4" stroke-dasharray="4 4"/>`; break;
    case 85: // Golf Solitaire
      s = `<rect x="64" y="28" width="46" height="66" rx="7" fill="#fff" stroke="#0f172a" stroke-width="1.5"/>
        <rect x="108" y="28" width="46" height="66" rx="7" fill="#fff" stroke="#0f172a" stroke-width="1.5"/>
        <rect x="152" y="28" width="46" height="66" rx="7" fill="#fef08a" stroke="#facc15" stroke-width="2"/>
        <text x="169" y="66" text-anchor="middle" font-weight="900" font-size="20" fill="#dc2626">Q</text><path d="M184 56 c-4 -4 -9 -1 -9 3 c0 4 5 7 9 10 c4 -3 9 -6 9 -10 c0 -4 -5 -7 -9 -3 z" fill="#dc2626"/>`; break;
    case 86: // Slot Machine
      s = `<rect x="52" y="26" width="46" height="66" rx="8" fill="#fff"/><rect x="107" y="26" width="46" height="66" rx="8" fill="#fef08a"/><rect x="162" y="26" width="46" height="66" rx="8" fill="#fff"/>
        <g font-weight="900" font-size="28" text-anchor="middle" fill="#dc2626"><text x="75" y="68">7</text><text x="130" y="68">7</text><text x="185" y="68">7</text></g>`; break;
    case 87: // Dice Battle
      s = `<rect x="64" y="34" width="52" height="52" rx="10" fill="#fff" transform="rotate(-10 90 60)"/>
        <circle cx="78" cy="48" r="4" fill="#0f172a"/><circle cx="102" cy="72" r="4" fill="#0f172a"/>
        <rect x="142" y="34" width="52" height="52" rx="10" fill="#ef4444" stroke="#fff" stroke-width="2" transform="rotate(10 168 60)"/>
        <circle cx="156" cy="48" r="4" fill="#fff"/><circle cx="168" cy="60" r="4" fill="#fff"/><circle cx="180" cy="72" r="4" fill="#fff"/>`; break;
    case 88: // Snake Maze
      s = `<rect x="54" y="20" width="152" height="88" rx="8" fill="#090d16" stroke="#22c55e" stroke-width="3"/>
        <path d="M96 20 V68 M164 44 V108" stroke="#22c55e" stroke-width="4"/>
        <path d="M74 88 H134 V44 H178" fill="none" stroke="#4ade80" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="192" cy="86" r="7" fill="#ef4444"/>`; break;
    case 89: // Bounce Ball
      s = `<rect x="54" y="88" width="52" height="10" rx="5" fill="#38bdf8"/><rect x="148" y="68" width="52" height="10" rx="5" fill="#f43f5e"/>
        <path d="M78 78 Q126 16 174 58" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="2.5" stroke-dasharray="5 5"/>
        <circle cx="126" cy="38" r="13" fill="#facc15" stroke="#fff" stroke-width="2"/>`; break;
    case 90: // Ice Breaker
      s = `<rect x="56" y="24" width="44" height="22" rx="4" fill="#bae6fd" stroke="#fff" stroke-width="2"/><rect x="108" y="24" width="44" height="22" rx="4" fill="#7dd3fc" stroke="#fff" stroke-width="2"/><rect x="160" y="24" width="44" height="22" rx="4" fill="#bae6fd" stroke="#fff" stroke-width="2"/>
        <circle cx="130" cy="68" r="10" fill="#fff" stroke="#38bdf8" stroke-width="3"/>
        <rect x="90" y="96" width="80" height="12" rx="6" fill="#0ea5e9" stroke="#fff" stroke-width="2"/>`; break;
    case 91: // Volcano Escape
      s = `<polygon points="56,112 130,26 204,112" fill="#291518"/><path d="M114 46 L130 26 L146 46 L135 58 L124 52Z" fill="#ff7b29"/>
        <rect x="0" y="100" width="260" height="24" fill="#ef4444" opacity="0.88"/><rect x="92" y="70" width="26" height="8" rx="3" fill="#facc15"/>`; break;
    case 92: // Treasure Dive
      s = `<rect x="92" y="54" width="76" height="46" rx="6" fill="#92400e" stroke="#fde047" stroke-width="3"/>
        <line x1="92" y1="70" x2="168" y2="70" stroke="#facc15" stroke-width="4"/><circle cx="130" cy="72" r="6" fill="#fde047"/>
        <circle cx="72" cy="40" r="6" fill="rgba(255,255,255,0.45)"/><circle cx="190" cy="36" r="8" fill="rgba(255,255,255,0.45)"/>`; break;
    case 93: // Bug Squash
      s = `<ellipse cx="102" cy="56" rx="14" ry="18" fill="#84cc16" stroke="#fff" stroke-width="2"/><circle cx="102" cy="38" r="7" fill="#1a2e05"/>
        <ellipse cx="158" cy="76" rx="14" ry="18" fill="#ef4444" stroke="#fff" stroke-width="2"/>
        <circle cx="158" cy="76" r="24" fill="none" stroke="#fde047" stroke-width="3" stroke-dasharray="6 4"/>`; break;
    case 94: // Ghost Catch
      s = `<polygon points="36,110 130,30 224,110" fill="rgba(254,240,138,0.2)"/>
        <path d="M104 78 C104 44 156 44 156 78 L156 102 L143 92 L130 102 L117 92 L104 102 Z" fill="#e2e8f0"/>
        <circle cx="120" cy="68" r="4.5" fill="#0f172a"/><circle cx="140" cy="68" r="4.5" fill="#0f172a"/>`; break;
    case 95: // Laser Reflect
      s = `<circle cx="44" cy="36" r="10" fill="#f43f5e"/><circle cx="212" cy="92" r="12" fill="#22c55e" stroke="#bbf7d0" stroke-width="3"/>
        <polyline points="44,36 164,36 164,92 212,92" fill="none" stroke="#fb7185" stroke-width="4.5" stroke-linecap="round"/>
        <line x1="150" y1="22" x2="178" y2="50" stroke="#38bdf8" stroke-width="5"/><line x1="150" y1="106" x2="178" y2="78" stroke="#38bdf8" stroke-width="5"/>`; break;
    case 96: // Color Match Rush
      s = `<rect x="64" y="26" width="44" height="64" rx="8" fill="#ef4444" stroke="#fff" stroke-width="2.5" transform="rotate(-10 86 58)"/>
        <rect x="108" y="24" width="44" height="64" rx="8" fill="#3b82f6" stroke="#fff" stroke-width="2.5"/>
        <rect x="152" y="26" width="44" height="64" rx="8" fill="#22c55e" stroke="#fff" stroke-width="2.5" transform="rotate(10 174 58)"/>
        <text x="130" y="64" text-anchor="middle" font-weight="900" font-size="24" fill="#fff">7</text>`; break;
    case 97: // Math Blocks
      s = `<rect x="66" y="24" width="54" height="36" rx="7" fill="#eab308" stroke="#fff" stroke-width="2"/><text x="93" y="48" text-anchor="middle" font-weight="900" font-size="16" fill="#0f172a">3+4</text>
        <rect x="138" y="42" width="54" height="36" rx="7" fill="#38bdf8" stroke="#fff" stroke-width="2"/><text x="165" y="66" text-anchor="middle" font-weight="900" font-size="16" fill="#0f172a">9×2</text>
        <rect x="96" y="82" width="68" height="26" rx="6" fill="#22c55e"/><text x="130" y="100" text-anchor="middle" font-weight="900" font-size="14" fill="#fff">= 18</text>`; break;
    case 98: // Planet Defender
      s = `<circle cx="130" cy="70" r="24" fill="#22c55e" stroke="#0284c7" stroke-width="5"/>
        <path d="M90 70 A40 40 0 0 1 170 70" fill="none" stroke="#22d3ee" stroke-width="6" stroke-linecap="round"/>
        <circle cx="194" cy="36" r="10" fill="#f97316"/><circle cx="62" cy="40" r="8" fill="#ef4444"/>`; break;
    case 99: // Kite Flyer
      s = `<polygon points="130,22 162,54 130,86 98,54" fill="#f43f5e" stroke="#fff" stroke-width="2.5"/>
        <polygon points="130,22 162,54 130,54" fill="#facc15"/><polygon points="130,54 98,54 130,86" fill="#38bdf8"/>
        <path d="M130 86 Q116 102 134 114" fill="none" stroke="#fde047" stroke-width="3" stroke-linecap="round"/>`; break;
    case 100: // Wrap-Around Worm
      s = `<path d="M12 68 H106 M154 68 H248" fill="none" stroke="#4ade80" stroke-width="16" stroke-linecap="round"/>
        <circle cx="106" cy="68" r="10" fill="#86efac"/>
        <line x1="12" y1="22" x2="12" y2="110" stroke="#22d3ee" stroke-width="4" stroke-dasharray="6 4"/>
        <line x1="248" y1="22" x2="248" y2="110" stroke="#22d3ee" stroke-width="4" stroke-dasharray="6 4"/>`; break;
    default:
      s = `<circle cx="130" cy="66" r="36" fill="rgba(255,255,255,0.16)"/><polygon points="118,46 154,66 118,86" fill="#fff"/>`;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 160" preserveAspectRatio="xMidYMid slice">
    <defs>
      <linearGradient id="${uid}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${c1}"/>
        <stop offset="100%" stop-color="${c2}"/>
      </linearGradient>
    </defs>
    <rect width="260" height="160" fill="url(#${uid})"/>
    ${bgTex}
    <circle cx="220" cy="24" r="64" fill="rgba(255,255,255,0.06)"/>
    ${s}
  </svg>`;
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
};

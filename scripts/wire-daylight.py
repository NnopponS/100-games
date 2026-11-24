#!/usr/bin/env python3
"""Add the same early image/audio ownership and late CSS layer to all game routes."""
from pathlib import Path
import re

root = Path(__file__).resolve().parent.parent
files = sorted((p for p in root.glob('[0-9]*/index.html') if p.parent.name.split('-', 1)[0].isdigit()), key=lambda p: int(p.parent.name.split('-', 1)[0]))
assert [int(p.parent.name.split('-', 1)[0]) for p in files] == list(range(1, 101))
early = '''<!-- daylight:early -->
<meta name="color-scheme" content="light">
<meta name="theme-color" content="#f5f9ff">
<script src="../assets/audio-lifecycle.js?v=daylight1"></script>
<script src="../assets/stage-light.js?v=daylight1"></script>
<!-- /daylight:early -->'''
late = '''<!-- daylight:late -->
<link rel="stylesheet" href="../assets/stage-light.css?v=daylight1">
<!-- /daylight:late -->
'''
for file in files:
    html = file.read_text()
    html = re.sub(r'<!-- daylight:early -->.*?<!-- /daylight:early -->\s*', '', html, flags=re.S)
    html = re.sub(r'<!-- daylight:late -->.*?<!-- /daylight:late -->\s*', '', html, flags=re.S)
    html, n = re.subn(r'(<meta\s+charset\s*=\s*["\']?utf-8["\']?\s*/?>)\s*', lambda m: m[1] + '\n' + early + '\n', html, count=1, flags=re.I)
    assert n == 1, f'missing charset in {file}'
    html, n = re.subn(r'</head>', lambda m: late + m[0], html, count=1, flags=re.I)
    assert n == 1, f'missing head close in {file}'
    html, n = re.subn(r'aaa-arcade\.js(?:\?[^"\']*)?', 'aaa-arcade.js?v=daylight1', html, count=1)
    assert n == 1, f'missing shared HUD in {file}'
    html, n = re.subn(r'(?:<script src="\.\./assets/features\.js[^"]*" defer></script>\s*)?(<script src="\.\./assets/missions\.js(?:\?[^"]*)?" defer></script>)',
      '<script src="../assets/features.js?v=daylight1" defer></script>\n<script src="../assets/missions.js?v=daylight1" defer></script>', html, count=1)
    assert n == 1, f'missing mission layer in {file}'
    file.write_text(html)
print(f'{len(files)} game routes wired with versioned light, audio and native mode UI assets.')

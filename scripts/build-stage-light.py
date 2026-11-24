#!/usr/bin/env python3
"""Generate the Daylight DOM palette from the 100 games (requires tinycss2).
The numbered games are not modified. The committed CSS is used directly by Pages.
"""
import argparse
import colorsys
from pathlib import Path
import json
import re
from html.parser import HTMLParser

import tinycss2 as css
from tinycss2.color3 import parse_color

ROOT = Path(__file__).resolve().parents[1]
BACKGROUND = {'background', 'background-color', 'background-image'}
TEXT = {'color', 'caret-color', 'text-decoration-color', '-webkit-text-fill-color'}
SHADOW = {'box-shadow', 'text-shadow'}
BORDER = {'border','border-color','border-top','border-top-color','border-right','border-right-color','border-bottom','border-bottom-color','border-left','border-left-color','outline','outline-color'}
SURFACE_VAR = re.compile(r'(?:^|[-_])(?:background|bg|ink|fg|text|muted|panel|surface|paper|body|overlay|card|border|line)(?:$|[-_\d])')
TEXT_VAR = re.compile(r'(?:^|[-_])(?:ink|fg|text|muted)(?:$|[-_\d])')
BORDER_VAR = re.compile(r'(?:^|[-_])(?:border|line)(?:$|[-_\d])')
# These selectors represent game pieces or swatches; keep their material colors.
PLAY_OBJECT = re.compile(r'(?i)(?:[.#][\w-]*(?:sprite|swatch|projectile|hitbox|crosshair|pip|coin|trail|flag-image|selected-color|card-back|mole|dirt|rim|bigcookie|golden|cookie-chip)(?:[\s.#:[>+~]|$)|[.#](?:checker|checker-piece|disk|disc|token|pawn|ball|brick|ship|ghost|player-piece|target|dot)(?:[\s.#:[>+~]|$)|\[data-(?:color|player|element)\b)')
LARGE_OVERLAY = re.compile(r'overlay|backdrop|modal|gameover|pause-screen|game-over|result-screen|startscreen|start-screen|\#(?:ov|screen)\b',re.I)
ROOT_ELEMENT = re.compile(r'^(?::root|html)(?=$|[\s.#:\[>+~])')
ROOT_SURFACE = re.compile(r'^(?:html|body|:root)(?:[.#](?:[\w-]+))?$')
DIFFERENT_SQUARE = re.compile(r'(?i)(?:[.#](?:dark|black|odd)(?:[\s.#:[>+~]|$)|(?:[.#](?:square|cell)\b).*nth-child)')
ORNAMENT_FILTER = re.compile(r'(?i)filter|opacity')

class Styles(HTMLParser):
    def __init__(self):
        super().__init__()
        self.active = False
        self.styles = []
    def handle_starttag(self, tag, attrs):
        if tag == 'style': self.active = True
    def handle_endtag(self, tag):
        if tag == 'style': self.active = False
    def handle_data(self, data):
        if self.active: self.styles.append(data)

def clamp(x): return max(0, min(1, x))
def rgb(color):
    return color.red, color.green, color.blue
def luminance(rgb):
    return sum(c*w for c,w in zip(rgb,(.2126,.7152,.0722)))
def as_css(v,a):
    return 'rgb(' + ' '.join(str(round(clamp(c)*255)) for c in v) + ('' if a > .998 else f' / {round(clamp(a),3):g}') + ')'
def softened(v, selector, chroma=True):
    # Yellow, red, blue and green remain locally distinguishable; dim no hue uses neutral slate.
    h,l,s = colorsys.rgb_to_hls(*v)
    if l >= .76: return v
    target = .88 if DIFFERENT_SQUARE.search(selector) else .94
    s = min(.69, max(.20, s*.56)) if chroma else .17
    return colorsys.hls_to_rgb(h if max(v)-min(v) > .035 else .63, target - (1-l)*.045, s)
def darken(v):
    if luminance(v) <= .36: return v
    h,l,s = colorsys.rgb_to_hls(*v)
    if s < .12: return (.15,.19,.26)
    return colorsys.hls_to_rgb(h, min(l,.31), min(s,.69))
def transform_color(color, kind, selector):
    v = rgb(color)
    a = color.alpha
    if a < .009: return None
    lum = luminance(v)
    if kind == 'surface':
        if a < .34:
            # Old white highlights become gentle blue accents; old black ambient shadows are softened.
            if min(v) > .75: return as_css((.25,.36,.56),a*.36)
            if lum < .27: return as_css(softened(v,selector),a*.58)
            return None
        if lum < .73: return as_css(softened(v,selector),max(a,.90) if LARGE_OVERLAY.search(selector) else a)
    elif kind == 'text':
        if lum > .33: return as_css(darken(v), max(a,.83))
    elif kind == 'border':
        if min(v) > .75 and a < .43: return as_css((.34,.43,.58),max(.17,a*.85))
        if lum < .31 and a > .43: return as_css((.47,.55,.68),min(.69,a))
    elif kind == 'shadow':
        if lum < .25 and a > .18: return as_css((.20,.28,.43),min(a*.49,.24))
    return None

def recolor(tokens, kind, selector):
    out = []
    changed = False
    for token in tokens:
        try: color = parse_color(token)
        except (ValueError,TypeError): color = None
        replacement = transform_color(color,kind,selector) if hasattr(color,'alpha') else None
        if replacement:
            out.append(replacement)
            changed = True
        elif token.type == 'function' and 'gradient' in token.lower_name:
            inner, flag = recolor(token.arguments,kind,selector)
            out.append(token.name+'('+inner+')')
            changed |= flag
        else:
            out.append(css.serialize([token]))
    return ''.join(out), changed

def selectors(tokens):
    start=0
    for i, token in enumerate(tokens):
        if token.type == 'literal' and token.value == ',':
            yield css.serialize(tokens[start:i]).strip()
            start=i+1
    yield css.serialize(tokens[start:]).strip()

def scope(selector, key):
    # First compound keeps :root/html matchable, including html body descendants.
    root=f':root[data-arcade-stage="{key}"]'
    if ROOT_ELEMENT.match(selector):
        return ROOT_ELEMENT.sub(root,selector,count=1)
    return root+' '+selector

def rewrite(rules, key):
    result=[]
    for r in rules:
        if r.type=='at-rule' and r.lower_at_keyword in {'media','supports','container','layer'} and r.content:
            body = rewrite(css.parse_rule_list(r.content,skip_whitespace=True,skip_comments=True),key)
            if body: result.append('@'+r.lower_at_keyword+css.serialize(r.prelude)+'{'+body+'}')
        if r.type!='qualified-rule': continue
        descriptions=css.parse_declaration_list(r.content,skip_whitespace=True,skip_comments=True)
        for sel in selectors(r.prelude):
            if not sel: continue
            sprite=bool(PLAY_OBJECT.search(sel))
            clip_text=any(d.type=='declaration' and d.lower_name in {'background-clip','-webkit-background-clip'} and css.serialize(d.value).strip()=='text' for d in descriptions)
            changes=[]
            for d in descriptions:
                if d.type!='declaration': continue
                name=d.lower_name
                kind=None
                if name in BACKGROUND and not sprite: kind='text' if clip_text or re.search(r'\.title(?:[ .#].*|$)',sel) else 'surface'
                elif name in TEXT and not sprite: kind='text'
                elif name in SHADOW and not sprite: kind='shadow'
                elif name in BORDER and not sprite: kind='border'
                elif name.startswith('--') and SURFACE_VAR.search(name):
                    kind='text' if TEXT_VAR.search(name) else ('border' if BORDER_VAR.search(name) else 'surface')
                if not kind:continue
                value, changed=recolor(d.value,kind,sel)
                if changed:
                    changes.append(d.name+':'+value.strip()+(' !important' if d.important else ''))
                    if name=='background' and kind=='text':
                        changes.extend(('-webkit-background-clip:text','background-clip:text'))
            if changes:
                selectors_str=scope(sel,key)
                result.append(selectors_str+'{'+';'.join(changes)+'}')
    return '\n'.join(result)

BASE = """/* Generated by scripts/build-stage-light.py. The original game controls, sprites and CSS geometry remain in each game page. */
@layer arcade-defaults {
  :root[data-arcade-stage] { color-scheme:only light; --arc-stage-paper:#f7f8fc; --arc-stage-ink:#19243a; accent-color:#4334ab; }
}
html[data-arcade-stage] { color-scheme:only light; background:#f5f7fc; }
html[data-arcade-stage] body { color:#17233a; }
html[data-arcade-stage] :focus-visible { outline-offset:3px }
html[data-arcade-stage] img,html[data-arcade-stage] video { max-inline-size:100% }
html[data-arcade-stage] canvas:not([hidden]) { max-inline-size:100% }
@media(max-width:540px){
  html[data-arcade-stage] { overflow-x:clip; }
  html[data-arcade-stage] body { min-inline-size:0;max-inline-size:100%;overflow-x:clip;overflow-y:auto; }
  html[data-arcade-stage] body>:is(.wrap,#wrap,.container,.game-shell,.game-wrap,.layout,main){min-inline-size:0;max-inline-size:100%;}
  html[data-arcade-stage] :is(button,input,select,textarea){max-inline-size:100%;}
  html[data-arcade-stage] :is(.hud,.controls,.buttons,.toolbar,.actions){min-inline-size:0;max-inline-size:100%;}
}
@media(prefers-reduced-motion:reduce){
  html[data-arcade-stage] :is(#bg3d,.aurora,.background-blobs),html[data-arcade-stage] body::before,html[data-arcade-stage] body::after,html[data-arcade-stage] #bg3d * { animation-duration:.001ms!important }
}
"""

OVERRIDES = """ 
/* The light browser canvas is present even under a themed gradient and dark OS preference. */
html[data-arcade-stage] { background-color:#f5f7fc!important; color-scheme:only light!important; }
/* Whack-a-Mole: the animals are a gameplay target, not scenery. Hide those below a rim without recoloring them. */
html[data-arcade-stage="07"] .mole:not(.up):not(.bonked){visibility:hidden}
html[data-arcade-stage="07"] .mole.bonked{visibility:hidden}
html[data-arcade-stage="07"] body{background:radial-gradient(ellipse at top,#f6fceb,#e8f5ed 60%,#edf4fc);color:#142b23}
html[data-arcade-stage="07"] .hud .stat{background:#fffefa;border-color:#bfd7c6;box-shadow:0 4px 9px #18352513}
html[data-arcade-stage="07"] .hud .label{color:#2d5f4e}html[data-arcade-stage="07"] #time{color:#8b4a08}
@media(max-width:420px){html[data-arcade-stage="07"] body{padding-top:52px}}

/* Mobile fixes for originally fixed-width sections, without scaling touch coordinates. */
@media(max-width:480px){
 /* Hangman: give the scene and keyboard separate rows and size each key to its track. */
 html[data-arcade-stage="22"] .game {display:grid;grid-template-columns:minmax(0,1fr);justify-items:center;}
 html[data-arcade-stage="22"] :is(.left,.right) {min-width:0;width:100%;max-width:100%;}
 html[data-arcade-stage="22"] .stage {width:min(300px,100%);}
 html[data-arcade-stage="22"] #gallows {width:100%;height:auto;}
 html[data-arcade-stage="22"] .keyboard {min-width:0;max-width:100%;}
 html[data-arcade-stage="22"] .krow {display:grid;grid-auto-flow:column;grid-auto-columns:minmax(0,1fr);gap:3px;width:100%;}
 html[data-arcade-stage="22"] .krow .key {min-width:0;max-width:none;width:100%;height:44px;padding:0;font-size:clamp(12px,4vw,15px);}
 html[data-arcade-stage="22"] :is(.stats,.controls) {flex-wrap:wrap;justify-content:center;max-width:100%;}
 html[data-arcade-stage="22"] .hint {min-width:0;max-width:100%;text-align:center;overflow-wrap:anywhere;}
 html[data-arcade-stage="22"] .hint .key {max-width:100%;min-height:40px;white-space:normal;}
 /* Wordle: keyboard follows the padded layout width, not the raw viewport. */
 html[data-arcade-stage="23"] .keyboard {width:min(100%,500px);}
 html[data-arcade-stage="23"] .krow {gap:clamp(2px,0.9vw,4px);min-width:0;}
 html[data-arcade-stage="23"] .key {min-width:0;padding:0;font-size:clamp(12px,3.65vw,15px);}
 html[data-arcade-stage="23"] .key.wide {flex:1 1 51px;font-size:clamp(9px,2.5vw,11px);letter-spacing:0;}
 html[data-arcade-stage="23"] .subtitle {max-width:100%;text-align:center;letter-spacing:.18em;}
 html[data-arcade-stage="23"] #toast {max-width:calc(100% - 24px);overflow-wrap:anywhere;}
 /* Target Shooter: five equal-width stats, with responsive gaps, never above the field width. */
 html[data-arcade-stage="45"] #hud {display:grid;grid-template-columns:minmax(0,3fr) minmax(0,2fr);padding:10px 7px;gap:5px;}
 html[data-arcade-stage="45"] .hud-group {display:grid;grid-auto-flow:column;grid-auto-columns:minmax(0,1fr);min-width:0;gap:3px;}
 html[data-arcade-stage="45"] #hud .stat {min-width:0;}
 html[data-arcade-stage="45"] #hud .label {font-size:clamp(8px,2.35vw,10px);letter-spacing:.04em;}
 html[data-arcade-stage="45"] #hud .value {font-size:clamp(16px,5.1vw,22px);}
 html[data-arcade-stage="71"] .app {min-width:0;width:100%;}
 html[data-arcade-stage="71"] .overlay {padding:7px;align-items:safe center;overflow:auto;}
 html[data-arcade-stage="71"] .panel {padding:9px 12px;}
 html[data-arcade-stage="71"] .panel .howto {gap:3px;margin:6px 0 7px;}
 html[data-arcade-stage="71"] .panel .howto div,html[data-arcade-stage="71"] .panel p {font-size:11px;line-height:1.25;}
 html[data-arcade-stage="71"] button.big {padding:7px 16px;}
 html[data-arcade-stage="71"] .panel .tiny {margin-top:5px;}
 html[data-arcade-stage="71"] .actions {flex-wrap:wrap;}
 /* Farm: lock chips and shop controls must not set the farm grid's intrinsic width. */
 html[data-arcade-stage="77"] main {grid-template-columns:minmax(0,1fr);}
 html[data-arcade-stage="77"] :is(.app,.farm-card,.shop-card,.plot) {min-width:0;max-width:100%;}
 html[data-arcade-stage="77"] .farm {grid-template-columns:repeat(3,minmax(0,1fr));}
 html[data-arcade-stage="77"] .farm-actions {flex-wrap:wrap;max-width:100%;}
 html[data-arcade-stage="77"] .upg-title {flex-wrap:wrap;gap:3px;}
 html[data-arcade-stage="77"] :is(.lock-cost,.lock-label,.plot-name,.plot-timer) {max-width:100%;overflow-wrap:anywhere;white-space:normal;text-align:center;}
 html[data-arcade-stage="77"] .toasts {max-width:calc(100% - 32px);}
 /* Jigsaw: preserve all advanced buttons on wrapping rows; the game remains the flex remainder. */
 html[data-arcade-stage="80"] header {width:100%;padding:8px 10px;gap:5px;}
 html[data-arcade-stage="80"] :is(.stats,.controls) {flex-wrap:wrap;min-width:0;margin-left:0;gap:5px;}
 html[data-arcade-stage="80"] .controls {flex:1 1 100%;min-height:77px;align-content:flex-start;}
 html[data-arcade-stage="80"] .controls button {min-height:36px;padding-inline:8px;}
 html[data-arcade-stage="80"] .controls .icon {width:36px;}
 html[data-arcade-stage="80"] .seg {max-width:100%;}
 html[data-arcade-stage="80"] .stat {padding:4px 6px;}
 /* Laser: a first row of four stats and second row of three accessible controls. */
 html[data-arcade-stage="95"] .wrap {display:grid;grid-template-columns:minmax(0,1fr);}
 html[data-arcade-stage="95"] .hud {grid-column:1;grid-row:1;display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:4px;padding:6px;}
 html[data-arcade-stage="95"] .hud>div {grid-column:span 3;min-width:0;text-align:center;}
 html[data-arcade-stage="95"] .hud .lab {letter-spacing:.08em;}
 html[data-arcade-stage="95"] .hud .reset {grid-column:span 4;padding:6px 4px;min-height:36px;white-space:normal;font-size:clamp(10px,2.8vw,13px);}
 html[data-arcade-stage="95"] #c {grid-column:1;grid-row:2;width:100%;height:auto;}
 html[data-arcade-stage="95"] .msg {grid-column:1;grid-row:3;}
 html[data-arcade-stage="95"] .ov {grid-column:1;grid-row:2;position:relative;inset:auto;padding:12px;gap:8px;min-width:0;}
}
"""

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check',action='store_true')
    args=parser.parse_args()
    games=sorted(ROOT.glob('[0-9]*/index.html'),key=lambda p:int(p.parent.name.split('-')[0]))
    assert len(games)==100,f'wrong game count: {len(games)}'
    built=[]
    for page in games:
        sty=Styles(); sty.feed(page.read_text(encoding='utf-8'))
        stage=page.parent.name.split('-')[0]
        contents = []
        for block in sty.styles:
            if 'ARC-STAGE-GENERATED' in block: continue
            contents.append(rewrite(css.parse_stylesheet(block,skip_comments=True,skip_whitespace=True),stage))
        # A light base is guaranteed, even if the original game used gradients and custom variables.
        # Keep geometry and layout intact.
        built.append(f'/* {page.parent.name} */\nhtml[data-arcade-stage="{stage}"] body{{background-color:#f3f6fc;color:#17233a}}\n'+'\n'.join(s for s in contents if s))
    output=BASE+'\n\n'+'\n\n'.join(built)+'\n'+OVERRIDES+'\n'
    target=ROOT/'assets/stage-light.css'
    if args.check:
        if not target.exists() or target.read_text(encoding='utf-8')!=output:
            raise SystemExit('Daylight stylesheet is stale')
        print(f'100 stage palettes current ({len(output)} chars)')
    else:
        target.write_text(output,encoding='utf-8')
        print(f'Generated 100 stage palettes ({len(output)} chars)')

if __name__=='__main__': main()

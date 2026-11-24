/* Daylight stage renderer. Adapt the playfield paint, not the frame's pixels.
   Only broad backdrops (or the explicitly known empty sand color) are changed.
   Original sprites, collisions, geometry, pointer coordinates and artwork remain native. */
(() => {
  'use strict';
  const key = location.pathname.match(/\/(\d{2,3})-[^/]+\/(?:index\.html)?$/)?.[1];
  if (!key) return;
  document.documentElement.dataset.arcadeStage = key;
  const ctxProto = window.CanvasRenderingContext2D?.prototype;
  if (!ctxProto?.fillRect) return;
  const saved = {
    fillRect:ctxProto.fillRect, clearRect:ctxProto.clearRect, fillText:ctxProto.fillText,
    strokeText:ctxProto.strokeText, stroke:ctxProto.stroke, putImageData:ctxProto.putImageData,
    createLinearGradient:ctxProto.createLinearGradient, createRadialGradient:ctxProto.createRadialGradient,
    createConicGradient:ctxProto.createConicGradient
  };
  const gradientProto = window.CanvasGradient?.prototype;
  const addStop = gradientProto?.addColorStop;
  const gradientMeta = new WeakMap();
  const lightFields = new WeakSet();
  const cached = new Map();
  const sandCache = new WeakMap();
  const staticBackdrops = new Set(['25','71','82']);
  // Native game pre-rendered surfaces are distinct from external images and sprite atlases.
  function mainField(canvas) {
    return !!(canvas?.isConnected && canvas.width >= 128 && canvas.height >= 90
      && !/^(?:bg3d|fx|ghost|nextCanvas|coins|preview|ui)$/i.test(canvas.id)
      && !canvas.closest('#bg3d,#planet3d,.background-art,.app-logo'));
  }
  function rgb(value) {
    if (typeof value !== 'string') return null;
    if (cached.has(value)) return cached.get(value);
    const s = value.toLowerCase().trim();
    let rgba = null;
    const hex = /^#([a-f0-9]{3,8})$/i.exec(s)?.[1];
    if (hex?.length === 3 || hex?.length === 4) {
      rgba = [...hex].map(c => parseInt(c+c,16));
      rgba[3] = (rgba[3] ?? 255) / 255;
    } else if (hex?.length === 6 || hex?.length === 8) {
      rgba = hex.match(/../g).map(c => parseInt(c,16));
      rgba[3] = (rgba[3] ?? 255) / 255;
    } else if (/^rgba?\(/.test(s)) {
      const p = s.slice(s.indexOf('(')+1,-1).trim().split(/[,/\s]+/);
      if (p.length >= 3) rgba = p.slice(0,3).map(c=>parseFloat(c) * (c.endsWith('%') ? 2.55 : 1)).concat(p[3] == null ? 1 : parseFloat(p[3]) / (p[3].endsWith('%') ? 100 : 1));
    } else if (s === 'black') rgba = [0,0,0,1];
    else if (s === 'white') rgba = [255,255,255,1];
    else if (s === 'transparent') rgba = [0,0,0,0];
    else if (/^hsla?\(/.test(s)) {
      const p = s.slice(s.indexOf('(')+1,-1).trim().split(/[,/\s]+/);
      const h = ((parseFloat(p[0]) % 360 + 360) % 360) / 60;
      const sat = parseFloat(p[1])/100, light = parseFloat(p[2])/100;
      const c = (1 - Math.abs(2*light-1))*sat, x = c*(1-Math.abs(h%2-1));
      const order = [[c,x,0],[x,c,0],[0,c,x],[0,x,c],[x,0,c],[c,0,x]][Math.min(5,Math.floor(h))];
      if (order) rgba = order.map(i=>(i + light-c/2)*255).concat(p[3] == null ? 1 : parseFloat(p[3])/(p[3].endsWith('%')?100:1));
    }
    if (rgba?.some(channel=>!Number.isFinite(channel))) rgba=null;
    if (cached.size>512) cached.clear();
    cached.set(value,rgba);
    return rgba;
  }
  const luma = p => .2126*p[0]+.7152*p[1]+.0722*p[2];
  const css = (p,a) => `rgba(${p.map(c=>Math.max(0,Math.min(255,Math.round(c)))).join(',')},${a})`;
  function backgroundColor(value) {
    const p = rgb(value);
    if (!p || p[3]<.02 || luma(p)>200) return value;
    const a = p[3];
    // Vignettes/feedback are not new solid backgrounds: use small soft tints, keeping center clear.
    if (a < .77) {
      if (luma(p) < 80) return css([119,142,180],Math.min(.16, a*.26));
      return value;
    }
    const brightness = luma(p);
    const paper = key === '76' ? [252,237,238] : [239,245,254];
    const tint = brightness <= 155 ? .19 : .28;
    const mapped = paper.map((c,i)=>c * (1-tint) + p[i] * tint);
    const boost = Math.max(0,201-luma(mapped));
    return css(mapped.map(c=>c+boost),a);
  }
  function textColor(value) {
    const p = rgb(value);
    if (!p || p[3]<.16 || luma(p)<121) return value;
    const max = Math.max(1,p[0],p[1],p[2]);
    const min = Math.min(p[0],p[1],p[2]);
    if (max-min<30) return css([24,36,57],Math.max(.90,p[3]));
    return css(p.slice(0,3).map((ch,i)=>24+(ch-min)/(max-min)*72+(i===2 ? 12 : 0)),Math.max(.79,p[3]));
  }
  if (addStop) {
    for (const name of ['createLinearGradient','createRadialGradient','createConicGradient']) {
      if (typeof saved[name] !== 'function') continue;
      ctxProto[name] = function (...args) {
        const g = saved[name].apply(this,args);
        gradientMeta.set(g,{name,args,stops:[],alternate:null});
        return g;
      };
    }
    gradientProto.addColorStop = function (offset,color) {
      const result = addStop.call(this,offset,color);
      const data = gradientMeta.get(this);
      if (data) { data.stops.push([offset,color]); data.alternate=null; }
      return result;
    };
  }
  function translatePaint(context,paint) {
    if (typeof paint === 'string') return backgroundColor(paint);
    const data = gradientMeta.get(paint);
    if (!data?.stops.length) return paint;
    if (data.alternate) return data.alternate;
    const stops = data.stops.map(([at,color])=>[at,backgroundColor(color)]);
    if (stops.every((entry,i)=>entry[1]===data.stops[i][1])) return data.alternate=paint;
    try {
      const alternate = saved[data.name].apply(context,data.args);
      for (const [at,color] of stops) addStop.call(alternate,at,color);
      return data.alternate=alternate;
    } catch { return paint; }
  }
  // Scene tests discard most sprite calls before DOM/style access.
  function broadRect(context,x,y,w,h) {
    const canvas = context.canvas;
    if (w<90||h<28||canvas.width<128||canvas.height<90
      || canvas.closest?.('#bg3d,#planet3d,.background-art')) return false;
    let scaled = {a:1,b:0,c:0,d:1,e:0,f:0};
    try { scaled=context.getTransform(); } catch {}
    if (Math.abs(scaled.b||0)>.005 || Math.abs(scaled.c||0)>.005
      || scaled.a<.001 || scaled.d<.001) return false;
    const sx = x*scaled.a+scaled.e, sw = w*scaled.a, sh = h*scaled.d;
    if (sw<canvas.width*.91 || sh<canvas.height*.155 || sx>canvas.width*.045 || sx+sw<canvas.width*.955) return false;
    if (mainField(canvas)) return true;
    return staticBackdrops.has(key) && !canvas.isConnected && sw>=canvas.width*.96 && sh>=canvas.height*.95;
  }
  ctxProto.fillRect = function(x,y,w,h) {
    if (!broadRect(this,x,y,w,h) || !/source-over|copy/.test(this.globalCompositeOperation)) return saved.fillRect.call(this,x,y,w,h);
    // Preserve special green felt/racing terrain identity with a tint; never replace a sprite fill.
    const original = this.fillStyle, adapted = translatePaint(this,original);
    lightFields.add(this);
    if (original===adapted) return saved.fillRect.call(this,x,y,w,h);
    try { this.fillStyle=adapted; return saved.fillRect.call(this,x,y,w,h); }
    finally { this.fillStyle=original; }
  };
  if (typeof saved.clearRect === 'function') ctxProto.clearRect = function(x,y,w,h) {
    if (broadRect(this,x,y,w,h)) lightFields.add(this);
    return saved.clearRect.call(this,x,y,w,h);
  };
  for (const [method,style] of [['fillText','fillStyle'],['strokeText','strokeStyle']]) {
    if (typeof saved[method] !== 'function') continue;
    ctxProto[method] = function (...args) {
      if (!lightFields.has(this) && !mainField(this.canvas)) return saved[method].apply(this,args);
      const original=this[style], adapted=textColor(original);
      if (original===adapted) return saved[method].apply(this,args);
      try { this[style]=adapted; return saved[method].apply(this,args); }
      finally { this[style]=original; }
    };
  }
  if (key==='25' && typeof saved.stroke==='function') ctxProto.stroke = function(...args) {
    // This specific neon value is the labyrinth's permanent wall, not a player or collectible.
    if (!this.canvas.isConnected && this.strokeStyle==='#a7ffdf' && lightFields.has(this)) {
      const original=this.strokeStyle;
      try { this.strokeStyle='#268267'; return saved.stroke.apply(this,args); } finally { this.strokeStyle=original; }
    }
    return saved.stroke.apply(this,args);
  };
  if (key==='70' && typeof saved.putImageData==='function') ctxProto.putImageData = function (source,x,y,...rest) {
    // The simulator paints with ImageData. Adapt its exact empty-pixel constant only.
    if (!mainField(this.canvas) || !source?.data || x!==0 || y!==0) return saved.putImageData.call(this,source,x,y,...rest);
    let layer = sandCache.get(source);
    if (!layer) {layer=this.createImageData(source.width,source.height); sandCache.set(source,layer);}
    const from=source.data, dst=layer.data;
    dst.set(from);
    for(let i=0;i<from.length;i+=4) if(from[i]===20 && from[i+1]===21 && from[i+2]===26 && from[i+3]===255) {
      dst[i]=236; dst[i+1]=240; dst[i+2]=249;
    }
    return saved.putImageData.call(this,layer,x,y,...rest);
  };
})();

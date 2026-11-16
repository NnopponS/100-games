
(function(){
"use strict";

/* ==================== helpers ==================== */
var $ = function(id){ return document.getElementById(id); };
var rnd = function(){ return 1 + Math.floor(Math.random()*6); };
var sleep = function(ms){ return new Promise(function(r){ setTimeout(r, ms); }); };

var PIPS = {
  0: [],
  1: [[2,2]],
  2: [[1,1],[3,3]],
  3: [[1,1],[2,2],[3,3]],
  4: [[1,1],[1,3],[3,1],[3,3]],
  5: [[1,1],[1,3],[2,2],[3,1],[3,3]],
  6: [[1,1],[1,3],[2,1],[2,3],[3,1],[3,3]]
};

/* ==================== audio ==================== */
var AC = null, soundOn = true;
function actx(){
  if (!AC){
    try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch(e){ AC = null; }
  }
  if (AC && AC.state === "suspended") { try { AC.resume(); } catch(e){} }
  return AC;
}
function tone(freq, dur, type, gain, delay){
  if (!soundOn) return;
  var c = actx(); if (!c) return;
  try {
    var t0 = c.currentTime + (delay || 0);
    var o = c.createOscillator();
    var g = c.createGain();
    o.type = type || "sine";
    o.frequency.setValueAtTime(freq, t0);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(gain || 0.05, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(c.destination);
    o.start(t0); o.stop(t0 + dur + 0.03);
  } catch(e){}
}
function sweep(f1, f2, dur, type, gain){
  if (!soundOn) return;
  var c = actx(); if (!c) return;
  try {
    var t0 = c.currentTime;
    var o = c.createOscillator(), g = c.createGain();
    o.type = type || "sawtooth";
    o.frequency.setValueAtTime(f1, t0);
    o.frequency.exponentialRampToValueAtTime(f2, t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(gain || 0.05, t0 + 0.03);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(c.destination);
    o.start(t0); o.stop(t0 + dur + 0.03);
  } catch(e){}
}
var SFX = {
  roll: function(){ for (var i=0;i<3;i++) tone(160 + Math.random()*260, 0.05, "square", 0.022, i*0.05); },
  hold: function(){ tone(880, 0.05, "sine", 0.03); },
  bank: function(){ tone(523.25, 0.1, "triangle", 0.05); tone(783.99, 0.16, "triangle", 0.045, 0.07); },
  win:  function(){ [523.25,659.25,783.99,1046.5].forEach(function(f,i){ tone(f, 0.2, "triangle", 0.055, i*0.075); }); },
  lose: function(){ [392,349.23,293.66,233.08].forEach(function(f,i){ tone(f, 0.24, "sawtooth", 0.035, i*0.09); }); },
  draw: function(){ tone(440, 0.18, "triangle", 0.04); tone(440, 0.18, "triangle", 0.04, 0.2); },
  bust: function(){ sweep(220, 55, 0.5, "sawtooth", 0.07); },
  allin:function(){ sweep(180, 900, 0.4, "square", 0.045); }
};

/* ==================== scoring ==================== */
var COMBOS = {
  0: { name: "NOTHING",        bonus: 0,   tier: 0 },
  1: { name: "PAIR",           bonus: 10,  tier: 1 },
  2: { name: "TWO PAIR",       bonus: 20,  tier: 2 },
  3: { name: "THREE OF A KIND",bonus: 30,  tier: 3 },
  4: { name: "STRAIGHT",       bonus: 45,  tier: 4 },
  5: { name: "FULL HOUSE",     bonus: 50,  tier: 5 },
  6: { name: "FOUR OF A KIND", bonus: 70,  tier: 6 },
  7: { name: "FIVE OF A KIND", bonus: 120, tier: 7 }
};

function evaluate(values){
  var sorted = values.slice().sort(function(a,b){ return a-b; });
  var counts = {};
  sorted.forEach(function(v){ counts[v] = (counts[v] || 0) + 1; });
  var groups = Object.keys(counts).map(function(k){ return counts[k]; })
                    .sort(function(a,b){ return b-a; });
  var sum = sorted.reduce(function(a,b){ return a+b; }, 0);
  var joined = sorted.join("");
  var straight = (joined === "12345" || joined === "23456");

  var key;
  if (groups[0] === 5) key = 7;
  else if (groups[0] === 4) key = 6;
  else if (groups[0] === 3 && groups[1] === 2) key = 5;
  else if (straight) key = 4;
  else if (groups[0] === 3) key = 3;
  else if (groups[0] === 2 && groups[1] === 2) key = 2;
  else if (groups[0] === 2) key = 1;
  else key = 0;

  var c = COMBOS[key];
  return { key: key, name: c.name, tier: c.tier, bonus: c.bonus, sum: sum, total: sum + c.bonus };
}

/* ==================== state ==================== */
var S = {
  wins:   { p: 0, a: 0 },
  pts:    { p: 0, a: 0 },
  round:  0,
  dice:   { p: [0,0,0,0,0], a: [0,0,0,0,0] },
  held:   [false,false,false,false,false],
  rerolls: 2,
  riskUsed: false,
  pScore: null,
  aScore: null,
  phase:  "idle",     // idle | player | ai | resolve | over
  busy:   false,
  allIn:  null        // null | "win" | "bust"
};

/* ==================== DOM build ==================== */
var pRow = $("pRow"), aiRow = $("aiRow");
var pEls = [], aEls = [];

function makeDie(parent, extra){
  var d = document.createElement("div");
  d.className = "die " + extra;
  var g = document.createElement("div");
  g.className = "pips";
  d.appendChild(g);
  parent.appendChild(d);
  return d;
}
for (var i = 0; i < 5; i++){
  var pd = makeDie(pRow, "clickable");
  pd.dataset.idx = i;
  pd.addEventListener("click", onDieClick);
  pEls.push(pd);
  aEls.push(makeDie(aiRow, "ai small"));
}

function renderFace(dieEl, value){
  var grid = dieEl.firstChild;
  var pips = PIPS[value] || [];
  grid.innerHTML = "";
  for (var i = 0; i < pips.length; i++){
    var p = document.createElement("span");
    p.className = "pip";
    p.style.gridArea = pips[i][0] + " / " + pips[i][1];
    grid.appendChild(p);
  }
  dieEl.dataset.value = value;
}

function paintDice(){
  for (var i = 0; i < 5; i++){
    if (!S.busy) renderFace(pEls[i], S.dice.p[i]);
    pEls[i].classList.toggle("held", !!S.held[i]);
    pEls[i].classList.toggle("clickable", S.phase === "player" && !S.busy);
    if (!S.busy) renderFace(aEls[i], S.dice.a[i]);
  }
}

function animateRoll(els, values, baseDelay, only){
  baseDelay = baseDelay || 0;
  var list = only || values.map(function(_, i){ return i; });
  return Promise.all(list.map(function(i){
    var v = values[i];
    return new Promise(function(resolve){
      var d = els[i];
      d.classList.add("rolling");
      var iv = setInterval(function(){
        renderFace(d, rnd());
      }, 55);
      setTimeout(function(){
        clearInterval(iv);
        renderFace(d, v);
        d.classList.remove("rolling");
        d.classList.add("pop");
        setTimeout(function(){ d.classList.remove("pop"); }, 240);
        resolve();
      }, baseDelay + 420 + i * 75);
    });
  }));
}

/* ==================== UI ==================== */
function winDots(el, n){
  el.innerHTML = "";
  for (var i = 0; i < 3; i++){
    var s = document.createElement("i");
    s.className = "wdot" + (i < n ? " on" : "");
    el.appendChild(s);
  }
}

function updateUI(){
  $("roundNum").textContent = S.round || 1;
  $("pPts").innerHTML = S.pts.p + '<span class="u">PTS</span>';
  $("aPts").innerHTML = S.pts.a + '<span class="u">PTS</span>';
  winDots($("pWins"), S.wins.p);
  winDots($("aWins"), S.wins.a);

  $("laneP").classList.toggle("active", S.phase === "player");
  $("laneA").classList.toggle("active", S.phase === "ai");

  var pS = $("pScore"), aS = $("aScore");
  pS.textContent = S.pScore === null ? "—" : S.pScore + " pts";
  pS.classList.toggle("live", S.pScore !== null);
  aS.textContent = S.aScore === null ? "—" : S.aScore + " pts";
  aS.classList.toggle("live", S.aScore !== null);

  $("rrLabel").textContent = S.rerolls + " LEFT";
  $("btnReroll").disabled = !(S.phase === "player" && !S.busy && S.rerolls > 0 && !allHeld());
  $("btnBank").disabled   = !(S.phase === "player" && !S.busy);
  $("btnAllIn").disabled  = !(S.phase === "player" && !S.busy && !S.riskUsed);

  paintDice();
  updateComboReadout();
}

function allHeld(){
  return S.held.every(function(h){ return h; });
}

function updateComboReadout(){
  var nameEl = $("comboName"), subEl = $("comboSub");

  if (S.phase === "idle"){
    nameEl.className = "combo-name";
    nameEl.textContent = "TAP RE-ROLL TO START";
    subEl.innerHTML = "5 dice &middot; 2 re-rolls &middot; first to 3 rounds";
    return;
  }
  if (S.phase === "over"){ return; }

  if (S.phase === "player" || S.busy){
    var ev = evaluate(S.dice.p);
    nameEl.className = "combo-name " + (ev.tier >= 2 ? "good" : "bad");
    nameEl.textContent = ev.name;
    subEl.innerHTML = "SUM <b>" + ev.sum + "</b> + BONUS <b>" + ev.bonus + "</b> = <b>" + ev.total + "</b> PTS";
    return;
  }
  if (S.phase === "ai"){
    nameEl.className = "combo-name";
    nameEl.textContent = "AI IS ROLLING";
    subEl.textContent = "hold tight…";
    return;
  }
  if (S.phase === "resolve"){
    nameEl.className = "combo-name good";
    nameEl.textContent = "ROUND " + S.round + " COMPLETE";
    subEl.innerHTML = "YOU <b>" + (S.pScore||0) + "</b> &nbsp;vs&nbsp; AI <b>" + (S.aScore||0) + "</b>";
  }
}

var hintEl = $("hint");
function hint(t){ hintEl.textContent = t; }

var bannerEl = $("banner");
var bannerTimer = null;
function banner(text, cls){
  clearTimeout(bannerTimer);
  bannerEl.textContent = text;
  bannerEl.className = "banner show " + (cls || "mid");
  bannerTimer = setTimeout(function(){
    bannerEl.className = "banner " + (cls || "mid");
  }, 950);
}

/* ==================== player actions ==================== */
function onDieClick(e){
  if (S.phase !== "player" || S.busy) return;
  var idx = parseInt(e.currentTarget.dataset.idx, 10);
  S.held[idx] = !S.held[idx];
  if (S.held[idx]) SFX.hold();
  updateUI();
  hint(S.held[idx] ? "Die held — re-roll the rest, or bank." : "Tap dice to hold them before re-rolling.");
}

function actReroll(){
  if (S.phase !== "player" || S.busy || S.rerolls <= 0 || allHeld()) return;
  S.busy = true;
  S.rerolls--;
  var idx = [];
  for (var i = 0; i < 5; i++){
    if (!S.held[i]){ S.dice.p[i] = rnd(); idx.push(i); }
  }
  SFX.roll();
  updateUI();
  hint("Re-rolling " + idx.length + " dice…");
  animateRoll(pEls, S.dice.p, 0, idx).then(function(){
    S.busy = false;
    updateUI();
    hint(S.rerolls > 0 ? "Re-rolls left: " + S.rerolls + "." : "No re-rolls left — bank it or go ALL IN.");
  });
}

function actBank(){
  if (S.phase !== "player" || S.busy) return;
  S.busy = true;
  var ev = evaluate(S.dice.p);
  S.pScore = ev.total;
  SFX.bank();
  hint("Banked " + ev.total + " points.");
  S.phase = "ai";
  S.busy = false;
  updateUI();
  setTimeout(function(){ aiTurn(); }, 520);
}

function actAllIn(){
  if (S.phase !== "player" || S.busy || S.riskUsed) return;
  S.busy = true;
  S.riskUsed = true;
  S.held = [false,false,false,false,false];
  S.dice.p = [rnd(), rnd(), rnd(), rnd(), rnd()];
  SFX.allin();
  updateUI();
  hint("ALL IN — everything rides on this roll!");
  animateRoll(pEls, S.dice.p, 0).then(function(){
    var ev = evaluate(S.dice.p);
    var success = ev.tier >= 2;
    S.allIn = success ? "win" : "bust";
    if (success){
      S.pScore = ev.total * 2;
      SFX.win();
      banner("ALL IN! ×2", "good");
      hint(ev.name + " — doubled to " + S.pScore + "!");
      pEls.forEach(function(d, i){
        setTimeout(function(){ d.classList.add("win"); }, i * 60);
      });
    } else {
      S.pScore = 0;
      SFX.bust();
      banner("BUSTED", "bad");
      hint(ev.name + " — the all-in fizzles. 0 points.");
      document.getElementById("app").classList.add("shake");
      setTimeout(function(){ document.getElementById("app").classList.remove("shake"); }, 450);
    }
    S.busy = false;
    S.phase = "ai";
    updateUI();
    setTimeout(function(){ aiTurn(); }, 900);
  });
}

/* ==================== AI ==================== */
function chooseHolds(values){
  var counts = {};
  values.forEach(function(v, i){ (counts[v] = counts[v] || []).push(i); });
  var groups = Object.keys(counts).map(function(k){ return counts[k]; })
                    .sort(function(a, b){ return b.length - a.length; });
  var keep = [false,false,false,false,false];

  if (groups[0].length >= 4){
    groups[0].forEach(function(i){ keep[i] = true; });
    return keep;
  }
  if (groups[0].length === 3){
    groups[0].forEach(function(i){ keep[i] = true; });
    if (groups[1] && groups[1].length === 2){
      groups[1].forEach(function(i){ keep[i] = true; });
    }
    return keep;
  }
  if (groups[0].length === 2){
    groups[0].forEach(function(i){ keep[i] = true; });
    if (groups[1] && groups[1].length === 2){
      groups[1].forEach(function(i){ keep[i] = true; });
    }
    return keep;
  }

  // hunt for a straight run
  var uniq = [];
  values.forEach(function(v){ if (uniq.indexOf(v) === -1) uniq.push(v); });
  uniq.sort(function(a, b){ return a - b; });

  var best = [], run = [];
  for (var i = 0; i < uniq.length; i++){
    if (i > 0 && uniq[i] === uniq[i-1] + 1) run.push(uniq[i]);
    else run = [uniq[i]];
    if (run.length > best.length) best = run.slice();
  }
  if (best.length >= 4){
    var used = {};
    values.forEach(function(v, idx){
      if (best.indexOf(v) !== -1 && !used[v]){ keep[idx] = true; used[v] = true; }
    });
    return keep;
  }
  return keep;
}

async function aiTurn(){
  S.phase = "ai";
  S.aScore = null;
  S.dice.a = [0,0,0,0,0];
  updateUI();
  hint("AI takes the table…");

  await sleep(300);
  S.dice.a = [rnd(), rnd(), rnd(), rnd(), rnd()];
  SFX.roll();
  await animateRoll(aEls, S.dice.a, 0);

  var rerolls = 2;
  while (rerolls > 0){
    await sleep(330);
    var keep = chooseHolds(S.dice.a);
    if (keep.every(Boolean)) break;
    for (var i = 0; i < 5; i++){ if (!keep[i]) S.dice.a[i] = rnd(); }
    rerolls--;
    SFX.roll();
    await animateRoll(aEls, S.dice.a, 0);
  }

  await sleep(320);
  var ev = evaluate(S.dice.a);
  var score = ev.total;

  // AI risk logic: desperate hands go all in
  if (score < 30 && Math.random() < 0.75){
    hint("AI goes ALL IN!");
    await sleep(560);
    SFX.allin();
    S.dice.a = [rnd(), rnd(), rnd(), rnd(), rnd()];
    await animateRoll(aEls, S.dice.a, 0);
    var ev2 = evaluate(S.dice.a);
    if (ev2.tier >= 2){
      score = ev2.total * 2;
      banner("AI ALL IN ×2", "bad");
      aEls.forEach(function(d, i){
        setTimeout(function(){ d.classList.add("win"); }, i * 60);
      });
    } else {
      score = 0;
      banner("AI BUSTS", "good");
      SFX.bust();
    }
    await sleep(750);
  }

  S.aScore = score;
  S.phase = "resolve";
  updateUI();
  await sleep(500);
  resolveRound();
}

/* ==================== round resolution ==================== */
function clearDiceFx(){
  pEls.forEach(function(d){ d.classList.remove("win"); });
  aEls.forEach(function(d){ d.classList.remove("win"); });
}

function resolveRound(){
  clearDiceFx();
  S.phase = "resolve";
  var p = S.pScore || 0;
  var a = S.aScore || 0;

  S.pts.p += p;
  S.pts.a += a;

  var msg, cls;
  if (p > a){
    S.wins.p++;
    msg = "ROUND WON";
    cls = "good";
    SFX.win();
  } else if (a > p){
    S.wins.a++;
    msg = "ROUND LOST";
    cls = "bad";
    SFX.lose();
  } else {
    msg = "DRAW";
    cls = "mid";
    SFX.draw();
  }

  updateUI();
  banner(msg, cls);
  hint("You " + p + " — AI " + a + "  ·  rounds " + S.wins.p + "–" + S.wins.a);

  setTimeout(function(){
    if (S.wins.p >= 3 || S.wins.a >= 3){
      endMatch();
    } else {
      startRound();
    }
  }, 1650);
}

function endMatch(){
  S.phase = "over";
  updateUI();
  var won = S.wins.p >= 3;
  var t = $("ovTitle"), sub = $("ovSub");
  t.className = won ? "win" : "lose";
  t.textContent = won ? "YOU WIN THE MATCH" : "AI WINS THE MATCH";
  sub.innerHTML = "ROUNDS <b>" + S.wins.p + " – " + S.wins.a + "</b><br>" +
                  "TOTAL POINTS <b>" + S.pts.p + " – " + S.pts.a + "</b>";
  $("overlay").classList.remove("hidden");
  if (won) SFX.win(); else SFX.lose();
  hint(won ? "Champion of the table." : "Run it back?");
}

/* ==================== round flow ==================== */
function startRound(){
  clearDiceFx();
  S.round++;
  S.held = [false,false,false,false,false];
  S.rerolls = 2;
  S.riskUsed = false;
  S.allIn = null;
  S.pScore = null;
  S.aScore = null;
  S.dice.a = [0,0,0,0,0];
  S.dice.p = [rnd(), rnd(), rnd(), rnd(), rnd()];
  S.phase = "player";
  S.busy = true;
  updateUI();
  hint("Rolling…");
  SFX.roll();
  animateRoll(pEls, S.dice.p, 100).then(function(){
    S.busy = false;
    updateUI();
    hint("Tap dice to hold them, then re-roll the rest.");
  });
}

function resetMatch(){
  S.wins.p = 0; S.wins.a = 0;
  S.pts.p = 0;  S.pts.a = 0;
  S.round = 0;
  S.dice.p = [0,0,0,0,0];
  S.dice.a = [0,0,0,0,0];
  S.held = [false,false,false,false,false];
  S.pScore = null; S.aScore = null;
  S.phase = "idle";
  S.busy = false;
  $("overlay").classList.add("hidden");
  updateUI();
  startRound();
}

/* ==================== wiring ==================== */
$("btnReroll").addEventListener("click", actReroll);
$("btnBank").addEventListener("click", actBank);
$("btnAllIn").addEventListener("click", actAllIn);
$("ovBtn").addEventListener("click", resetMatch);

$("btnSound").addEventListener("click", function(){
  soundOn = !soundOn;
  this.textContent = soundOn ? "♪" : "✕";
  this.style.color = soundOn ? "" : "#5a6a86";
  if (soundOn) SFX.hold();
});

document.addEventListener("keydown", function(e){
  if (e.repeat) return;
  var k = e.key.toLowerCase();
  if (k === "r") actReroll();
  else if (k === "b") actBank();
  else if (k === "a") actAllIn();
  else if (k === "enter" && !$("overlay").classList.contains("hidden")) resetMatch();
});

/* boot */
winDots($("pWins"), 0);
winDots($("aWins"), 0);
for (var j = 0; j < 5; j++){ renderFace(pEls[j], 0); renderFace(aEls[j], 0); }
updateUI();
setTimeout(startRound, 420);

})();

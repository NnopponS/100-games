(() => {
  'use strict';
  const games = Array.isArray(window.GAMES_DATA) ? window.GAMES_DATA : [];
  const byId = new Map(games.map(game => [game.id, game]));
  const byDir = new Map(games.map(game => [game.dir, game]));
  const genre = {all: 'All games', arcade: 'Quick arcade', brain: 'Puzzle & logic', action: 'Action', board: 'Board & cards', sports: 'Sports & skill', creative: 'Creative & sandbox'};
  const genreAliases = {arcade: '5 minute fun rhythm classic', brain: 'train your brain quiz', action: 'adrenaline shooter escape', board: 'play with friends strategy AI', sports: 'bowling pinball golf', creative: 'pixel art sand farm'};
  const $ = id => document.getElementById(id);
  const read = (key, fallback) => {
    try { const item = localStorage.getItem(key); return item == null ? fallback : JSON.parse(item); }
    catch { return fallback; }
  };
  const write = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch {} };
  const numericIds = list => Array.isArray(list) ? [...new Set(list.map(Number))].filter(id => byId.has(id)) : [];
  const favs = new Set(numericIds(read('arcade100_favs', [])));
  let recents = numericIds(read('arcade100_recent', [])).slice(0, 10);
  const state = { category: 'all', favorites: false, search: '', sort: 'id' };
  const coverCache = new Map();
  const featured = [71, 9, 72, 25];
  const player = $('playerOverlay');
  const playerMount = $('playerMount');
  let frame = null;
  let displayMode = 'normal';
  let pageFullscreenToken = null;
  let fullscreenPending = false;
  const favoriteFilter = $('favFilterBtn');
  const dailyEligible = games.filter(game => game.dir !== '30-blackjack' && game.dir !== '86-slot-machine');
  let playing = null;
  let returnFocus = null;
  let daily = null;
  let uiSound = read('portal_sound', 0) !== 0;
  let audio = null;
  const playerRoot = $('portalPage');
  const controls = $('playerOverlay').querySelector('.player-right');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const features = window.ARCADE_FEATURES || window.ARCADE_PLUS_FEATURES || {};
  const featureFor = game => Array.isArray(features) ? features.find(item => Number(item.id) === game.id) : features[game.id] ?? features[game.dir];
  const medalTitles = ['No medal yet', 'Bronze', 'Silver', 'Gold'];

  const node = (tag, className, text) => {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text != null) el.textContent = text;
    return el;
  };
  function beep(freq) {
    if (!uiSound) return;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      audio ??= new AC();
      if (audio.state === 'suspended') audio.resume().catch(() => {});
      const t = audio.currentTime;
      const sound = audio.createOscillator();
      const gain = audio.createGain();
      sound.type = 'triangle';
      sound.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.03, t + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0005, t + 0.07);
      sound.connect(gain);
      gain.connect(audio.destination);
      sound.start(t);
      sound.stop(t + 0.08);
    } catch {}
  }
  function setFavoriteButton(button, game) {
    const isFavorite = favs.has(game.id);
    button.textContent = isFavorite ? '♥' : '♡';
    button.setAttribute('aria-pressed', String(isFavorite));
    button.setAttribute('aria-label', (isFavorite ? 'Remove ' : 'Save ') + game.title + (isFavorite ? ' from favorites' : ' to favorites'));
  }
  function updateFavoriteCount() {
    $('favCount').textContent = String(favs.size);
    favoriteFilter.setAttribute('aria-pressed', String(state.favorites));
  }
  function updateFavorite(game) {
    if (favs.has(game.id)) favs.delete(game.id); else favs.add(game.id);
    write('arcade100_favs', [...favs]);
    document.querySelectorAll(`[data-fav-id="${game.id}"]`).forEach(btn => setFavoriteButton(btn, game));
    if (state.favorites) {
      renderLibrary();
      if (!document.activeElement || document.activeElement === document.body) favoriteFilter.focus();
    }
    updateFavoriteCount();
    beep(784);
  }

  function routeFor(game, date, mode = 'classic') {
    return '#play=' + game.dir + (date ? '&daily=' + date : mode === 'trial' || mode === 'plus' ? '&mode=' + mode : '');
  }
  function gameUrl(game, date, mode, restart = false) {
    const params = new URLSearchParams();
    if (date) params.set('daily', date);
    else if (mode === 'trial' || mode === 'plus') params.set('mode', mode);
    params.set('edition', 'daylight');
    if (restart) params.set('restart', Date.now());
    return './' + game.dir + '/index.html' + (params.size ? '?' + params : '');
  }
  function focusLibrary() {
    $('librarySection').scrollIntoView({ behavior: prefersReducedMotion.matches ? 'instant' : 'smooth' });
    $('librarySection').focus({ preventScroll: true });
  }
  function validDate(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return false;
    const parsed = new Date(value + 'T00:00:00Z');
    return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === value;
  }
  function dailyForDate(date) {
    if (!dailyEligible.length || !validDate(date)) return null;
    const index = Math.floor(Date.parse(date + 'T00:00:00Z') / 86400000);
    return dailyEligible[((index * 37 % dailyEligible.length) + dailyEligible.length) % dailyEligible.length];
  }
  function missionFor(game, date) {
    const safe = read(date ? `arcade100:daily:${date}:${game.id}` : `arcade100:mission:${game.id}`, null);
    return safe && Number.isInteger(safe.medal) && safe.medal >= 1 && safe.medal <= 3 ? safe : null;
  }
  function paintDaily() {
    if (!daily) return;
    $('dailyTitle').textContent = daily.game.title;
    $('dailyDate').dateTime = daily.date;
    $('dailyDate').textContent = new Intl.DateTimeFormat('en', {month: 'short', day: 'numeric', timeZone: 'UTC'}).format(new Date(daily.date + 'T00:00:00Z')).toUpperCase() + ' UTC';
    const saved = missionFor(daily.game, daily.date);
    $('dailyDetail').textContent = saved ? `Your best: ${medalTitles[saved.medal]} medal today. Play again to improve it.` : 'A new game every day. Play its mission and aim for a medal.';
    $('dailyPlayBtn').href = routeFor(daily.game, daily.date);
    $('dailyPlayBtn').onclick = event => {
      if (modifierClick(event)) return;
      event.preventDefault();
      launch(daily.game, daily.date, event.currentTarget);
    };
  }
  function syncDaily() {
    const date = new Date().toISOString().slice(0, 10);
    if (date !== daily?.date) {
      const game = dailyForDate(date);
      daily = game ? {game, date} : null;
    }
    paintDaily();
  }
  const modifierClick = event => event.defaultPrevented || event.button !== 0 || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey;
  function makeCard(game, accent = false) {
    const article = node('article', 'game-card');
    const link = node('a', 'game-link');
    link.href = routeFor(game, null, 'plus');
    link.dataset.gameId = game.id;
    link.onclick = event => {
      if (modifierClick(event)) return;
      event.preventDefault();
      launch(game, null, link, 'plus');
    };
    const media = node('div', 'game-media');
    if (window.makeGameCover) {
      if (!coverCache.has(game.id)) {
        try { coverCache.set(game.id, window.makeGameCover(game)); } catch {}
      }
      const url = coverCache.get(game.id);
      if (url) {
        const cover = node('img');
        cover.alt = '';
        cover.loading = accent ? 'eager' : 'lazy';
        cover.decoding = 'async';
        cover.width = 640;
        cover.height = 360;
        cover.src = url;
        media.append(cover);
      }
    }
    media.append(node('span', 'game-num', '#' + String(game.id).padStart(2, '0')));
    const progress = missionFor(game);
    if (progress) media.append(node('span', 'game-tag', medalTitles[progress.medal]));
    else if (accent) media.append(node('span', 'game-tag', 'EDITOR’S PICK'));
    const copy = node('div', 'game-copy');
    const labels = node('div');
    labels.append(node('strong', '', game.title), node('small', '', genre[game.cat] || 'Arcade'));
    const feature = featureFor(game);
    if (feature?.name) labels.append(node('small', 'game-variant', 'Arcade+ · ' + feature.name));
    const arrow = node('span', 'play-arrow', '↗');
    arrow.setAttribute('aria-hidden', 'true');
    copy.append(labels, arrow);
    link.append(media, copy);
    const save = node('button', 'fav-btn');
    save.type = 'button';
    save.dataset.favId = game.id;
    setFavoriteButton(save, game);
    save.onclick = () => updateFavorite(game);
    article.append(link, save);
    return article;
  }
  function replaceList(target, items, accent = false) {
    target.replaceChildren(...items.map(game => makeCard(game, accent)));
  }
  function renderRecents() {
    $('recentSection').hidden = !recents.length;
    replaceList($('recentGrid'), recents.slice(0, 4).map(id => byId.get(id)));
  }
  function resetFilters() {
    state.category = 'all';
    state.favorites = false;
    state.search = '';
    $('searchInput').value = '';
    renderLibrary();
  }
  function renderLibrary() {
    const query = state.search.trim().toLowerCase();
    const terms = query.split(/\s+/).filter(Boolean);
    const list = games.filter(game => {
      if (state.favorites && !favs.has(game.id)) return false;
      if (state.category !== 'all' && game.cat !== state.category) return false;
      const source = `${game.id} ${String(game.id).padStart(2, '0')} ${game.title} ${game.dir} ${game.cat} ${game.badge} ${genre[game.cat]} ${genreAliases[game.cat]}`.toLowerCase();
      return terms.every(term => source.includes(term));
    });
    if (state.sort === 'az') list.sort((a,b) => a.title.localeCompare(b.title));
    if (state.sort === 'pop') list.sort((a,b) => b.playNum - a.playNum);
    for (const filter of $('filterTabs').children) filter.setAttribute('aria-pressed', String(filter.dataset.category === state.category));
    updateFavoriteCount();
    $('shownCount').textContent = state.favorites ? `${list.length} saved ${list.length === 1 ? 'game' : 'games'}` : `${list.length} of ${games.length} games`;
    const grid = $('allGrid');
    if (list.length) replaceList(grid, list);
    else {
      const empty = node('div', 'empty-state');
      const clear = node('button', 'button button-line', 'Show all games');
      clear.type = 'button';
      clear.onclick = () => { resetFilters(); $('searchInput').focus(); };
      empty.append(node('strong', '', 'No games found'), node('p', '', state.favorites ? 'Save a game with its heart button to build your collection.' : 'Try a different title, number, or genre.'), clear);
      grid.replaceChildren(empty);
    }
  }
  for (const [key, title] of Object.entries(genre)) {
    const count = key === 'all' ? games.length : games.filter(game => game.cat === key).length;
    if (!count && key !== 'all') continue;
    const button = node('button', 'filter', title + ' · ' + count);
    button.type = 'button';
    button.dataset.category = key;
    button.onclick = () => { state.category = key; beep(520); renderLibrary(); };
    $('filterTabs').append(button);
  }

  function paintPlayerMode({game,date,mode}) {
    const feature = featureFor(game);
    $('playerTitle').textContent = game.title;
    $('playerCat').textContent = date ? `Daily challenge · ${date} UTC` : mode === 'trial' ? 'Medal Trial' : mode === 'plus' ? 'Arcade+' : '#' + String(game.id).padStart(2, '0') + ' / ' + (genre[game.cat] || 'Arcade');
    $('classicModeBtn').setAttribute('aria-pressed', String(mode === 'classic'));
    $('plusModeBtn').setAttribute('aria-pressed', String(mode === 'plus'));
    $('trialModeBtn').setAttribute('aria-pressed', String(mode === 'trial'));
    $('openDirectLink').href = gameUrl(game, date, mode);
    const info = $('playerFeature');
    info.hidden = !(mode === 'plus' && (feature?.description || feature?.name));
    info.textContent = info.hidden ? '' : [feature.name, feature.description].filter(Boolean).join(' · ');
    if (frame) frame.title = game.title + (date ? ' daily challenge' : mode === 'trial' ? ' medal trial' : mode === 'plus' ? ' Arcade+ mode' : '');
  }

  function deactivateFrame() {
    if (!frame) return;
    const old = frame;
    frame = null;
    old.onload = null;
    let audioLifecycle;
    try { audioLifecycle = old.contentWindow?.ArcadeAudioLifecycle; } catch {}
    try { audioLifecycle?.setActive(false); } catch {}
    try { audioLifecycle?.destroy(); } catch {}
    old.remove();
  }

  function mountFrame(current, restart = false) {
    deactivateFrame();
    const next = node('iframe', 'player-frame');
    next.id = 'playerFrame';
    next.allow = 'fullscreen';
    frame = next;
    next.onload = () => {
      if (playing !== current || frame !== next) return;
      try {
        next.contentDocument?.addEventListener('keydown', exitOnEscape, true);
        next.contentWindow?.ArcadeAudioLifecycle?.setActive(!document.hidden);
        if (!document.hidden) next.contentWindow?.focus();
      } catch {}
    };
    next.src = gameUrl(current.game, current.date, current.mode, restart);
    playerMount.append(next);
    paintPlayerMode(current);
  }

  function launch(game, date, opener, mode = 'classic') {
    if (!game) return;
    // Validate the day and the rotated game's identity before awarding daily progress.
    if (dailyForDate(date)?.id !== game.id) date = null;
    else if (date !== new Date().toISOString().slice(0, 10)) { date = null; mode = 'trial'; }
    mode = date ? 'daily' : ['trial','plus'].includes(mode) ? mode : 'classic';
    if (playing?.game.id === game.id && playing.date === date && playing.mode === mode && player.open) return;
    if (!player.open) returnFocus = opener || document.activeElement;
    const current = {game, date, mode};
    playing = current;
    recents = [game.id, ...recents.filter(id => id !== game.id)].slice(0, 10);
    write('arcade100_recent', recents);
    if (!player.open) player.showModal();
    mountFrame(current);
    document.body.style.overflow = 'hidden';
    playerRoot.inert = true;
    const hash = routeFor(game, date, mode);
    if (location.hash !== hash) history.pushState({arcadePlayer:true}, '', hash);
    beep(660);
  }
  function closePlayer(fromRoute = false) {
    if (!player.open) return;
    leavePresentation(false);
    deactivateFrame();
    player.close();
    playerRoot.inert = false;
    document.body.style.overflow = '';
    playing = null;
    if (!fromRoute && location.hash.startsWith('#play=')) history.pushState(null, '', location.pathname + location.search);
    paintDaily();
    const retained = returnFocus;
    const id = retained?.dataset?.gameId;
    renderRecents();
    renderLibrary();
    if (retained?.isConnected && retained !== document.body) retained.focus({preventScroll:true});
    else if (id) $('allGrid').querySelector(`[data-game-id="${id}"]`)?.focus({preventScroll:true});
    else $('librarySection').focus({preventScroll:true});
  }
  function handleHash() {
    const params = new URLSearchParams(location.hash.slice(1));
    if (params.has('play')) {
      const game = byDir.get(params.get('play'));
      if (game) launch(game, params.get('daily'), null, params.get('mode'));
      else closePlayer(true);
    } else closePlayer(true);
  }
  function shiftGame(direction) {
    if (!playing || !games.length) return;
    const at = games.findIndex(game => game.id === playing.game.id);
    launch(games[(at + direction + games.length) % games.length], null, null, playing.mode === 'daily' ? 'plus' : playing.mode);
  }
  favoriteFilter.onclick = () => {
    state.favorites = !state.favorites;
    if (state.favorites) { state.category = 'all'; state.search = ''; $('searchInput').value = ''; }
    beep(600);
    renderLibrary();
    focusLibrary();
  };
  $('randomBtn').onclick = event => {
    const pool = dailyEligible.filter(game => game.id !== recents[0]);
    if (pool.length) launch(pool[Math.floor(Math.random() * pool.length)], null, event.currentTarget, 'plus');
  };
  $('clearRecentBtn').onclick = () => {
    recents = [];
    write('arcade100_recent', recents);
    renderRecents();
    focusLibrary();
  };
  $('searchInput').oninput = event => { state.search = event.target.value; renderLibrary(); };
  $('searchForm').onsubmit = event => {
    event.preventDefault();
    const found = $('allGrid').querySelectorAll('.game-link');
    if (found.length === 1) found[0].click();
    else found[0]?.focus();
  };
  $('sortSelect').onchange = event => { state.sort = event.target.value; renderLibrary(); };
  $('closePlayerBtn').onclick = () => closePlayer();
  $('plusModeBtn').onclick = () => { if (playing) launch(playing.game, null, null, 'plus'); };
  $('classicModeBtn').onclick = () => { if (playing) launch(playing.game, null, null, 'classic'); };
  $('trialModeBtn').onclick = () => { if (playing) launch(playing.game, null, null, 'trial'); };
  $('prevGameBtn').onclick = () => shiftGame(-1);
  $('nextGameBtn').onclick = () => shiftGame(1);
  $('reloadGameBtn').onclick = () => {
    if (playing) mountFrame(playing, true);
  };
  const stage = $('gamePresentation');
  const enterButton = $('fullscreenBtn');
  const exitButton = $('exitScreenBtn');
  function setPresentation(mode) {
    displayMode = mode;
    if (mode === 'normal') delete player.dataset.presentation;
    else player.dataset.presentation = mode;
    exitButton.hidden = mode === 'normal';
    enterButton.setAttribute('aria-pressed', String(mode !== 'normal'));
    if (mode !== 'normal') exitButton.focus({preventScroll:true});
  }
  function leavePresentation(rewind) {
    const previous = displayMode;
    const token = pageFullscreenToken;
    pageFullscreenToken = null;
    if (previous === 'normal') return;
    setPresentation('normal');
    if (document.fullscreenElement === stage) document.exitFullscreen?.().catch(() => {});
    if (previous === 'immersive' && token && history.state?.arcadePresentation === token) {
      if (rewind) history.back();
      else {
        const state = {...history.state};
        delete state.arcadePresentation;
        history.replaceState(state,'',location.href);
      }
    }
    if (player.open && rewind) enterButton.focus({preventScroll:true});
  }
  async function enterPresentation() {
    if (!player.open || !frame || fullscreenPending) return;
    if (displayMode !== 'normal') { leavePresentation(true); return; }
    fullscreenPending = true;
    const currentFrame = frame;
    try {
      if (document.fullscreenEnabled && typeof stage.requestFullscreen === 'function') {
        try { await stage.requestFullscreen({navigationUI:'hide'}); } catch { /* CSS fullscreen fallback below */ }
      }
      if (frame !== currentFrame || !player.open) {
        if (document.fullscreenElement === stage) document.exitFullscreen?.().catch(() => {});
        return;
      }
      if (document.fullscreenElement === stage) setPresentation('native');
      else {
        pageFullscreenToken = String(Date.now());
        history.pushState({...history.state,arcadePresentation:pageFullscreenToken},'',location.href);
        setPresentation('immersive');
      }
    } finally { fullscreenPending = false; }
  }
  function exitOnEscape(event) {
    if (event.key !== 'Escape' || displayMode === 'normal') return;
    if (event.composedPath().some(el => el.matches?.('dialog[open]') && el !== player)) return;
    event.preventDefault(); event.stopPropagation(); leavePresentation(true);
  }
  enterButton.hidden = false;
  enterButton.setAttribute('aria-pressed','false');
  enterButton.onclick = enterPresentation;
  exitButton.onclick = () => leavePresentation(true);
  document.addEventListener('fullscreenchange', () => {
    if (displayMode === 'native' && document.fullscreenElement !== stage) {
      setPresentation('normal');
      if (player.open) enterButton.focus({preventScroll:true});
    }
  });
  document.addEventListener('keydown', exitOnEscape, true);
  player.addEventListener('cancel', event => {
    event.preventDefault();
    if (displayMode !== 'normal') leavePresentation(true);
    else closePlayer();
  });
  controls.addEventListener('keydown', event => {
    if (event.key === 'ArrowDown') { event.preventDefault(); frame?.focus(); }
  });
  window.addEventListener('keydown', event => {
    if (event.key !== '/' || event.altKey || event.ctrlKey || event.metaKey
      || playing || event.target?.matches?.('input, textarea, select, [contenteditable]')) return;
    event.preventDefault();
    $('searchInput').focus();
  });
  window.addEventListener('hashchange', handleHash);
  window.addEventListener('popstate', event => {
    if (displayMode === 'immersive' && event.state?.arcadePresentation !== pageFullscreenToken) leavePresentation(false);
    handleHash();
  });
  window.addEventListener('message', event => {
    if (!playing || !frame || event.source !== frame.contentWindow
      || (location.protocol !== 'file:' && event.origin !== location.origin)
      || Number(event.data?.id) !== playing.game.id) return;
    if (event.data.type === 'arcade100:mission') paintDaily();
    if (event.data.type === 'arcade100:mode' && ['classic','plus','trial'].includes(event.data.mode)) {
      launch(playing.game, null, null, event.data.mode);
    }
  });
  window.addEventListener('storage', event => { if (event.key?.startsWith('arcade100:daily:')) paintDaily(); });
  document.addEventListener('visibilitychange', () => {
    try { frame?.contentWindow?.ArcadeAudioLifecycle?.setActive(!document.hidden); } catch {}
    if (!document.hidden) syncDaily();
  });
  window.addEventListener('pagehide', event => { if (!event.persisted) deactivateFrame(); else try { frame?.contentWindow?.ArcadeAudioLifecycle?.setActive(false); } catch {} });
  window.addEventListener('pageshow', () => { try { frame?.contentWindow?.ArcadeAudioLifecycle?.setActive(!document.hidden); } catch {} });
  window.setInterval(syncDaily, 60000);
  const sound = $('portalSound');
  const syncSound = () => { sound.setAttribute('aria-pressed', String(uiSound)); sound.textContent = uiSound ? 'UI sound on' : 'UI sound off'; };
  sound.onclick = () => { uiSound = !uiSound; write('portal_sound', uiSound ? 1 : 0); syncSound(); beep(660); };
  syncSound();
  syncDaily();
  replaceList($('featuredGrid'), featured.map(id => byId.get(id)).filter(Boolean), true);
  renderRecents();
  renderLibrary();
  handleHash();
})();

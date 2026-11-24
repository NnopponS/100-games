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
  const frame = $('playerFrame');
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
    return '#play=' + game.dir + (date ? '&daily=' + date : mode === 'trial' ? '&mode=trial' : '');
  }
  function gameUrl(game, date, mode, restart = false) {
    const params = new URLSearchParams();
    if (date) params.set('daily', date);
    else if (mode === 'trial') params.set('mode', 'trial');
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
    link.href = routeFor(game);
    link.dataset.gameId = game.id;
    link.onclick = event => {
      if (modifierClick(event)) return;
      event.preventDefault();
      launch(game, null, link);
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
    $('playerTitle').textContent = game.title;
    $('playerCat').textContent = date ? `Daily challenge · ${date} UTC` : (mode === 'trial' ? 'Medal Trial' : '#' + String(game.id).padStart(2, '0') + ' / ' + (genre[game.cat] || 'Arcade'));
    $('classicModeBtn').setAttribute('aria-pressed', String(mode === 'classic'));
    $('trialModeBtn').setAttribute('aria-pressed', String(mode === 'trial'));
    $('openDirectLink').href = gameUrl(game, date, mode);
    frame.title = game.title + (date ? ' daily challenge' : mode === 'trial' ? ' medal trial' : '');
  }

  function launch(game, date, opener, mode = 'classic') {
    if (!game) return;
    // Validate the day and the rotated game's identity before awarding daily progress.
    if (dailyForDate(date)?.id !== game.id) date = null;
    else if (date !== new Date().toISOString().slice(0, 10)) { date = null; mode = 'trial'; }
    mode = date ? 'daily' : mode === 'trial' ? 'trial' : 'classic';
    if (playing?.game.id === game.id && playing.date === date && playing.mode === mode && player.open) return;
    if (!player.open) returnFocus = opener || document.activeElement;
    const current = {game, date, mode};
    playing = current;
    recents = [game.id, ...recents.filter(id => id !== game.id)].slice(0, 10);
    write('arcade100_recent', recents);
    paintPlayerMode(current);
    frame.onload = () => { if (playing === current) try { frame.contentWindow.focus(); } catch {} };
    frame.src = gameUrl(game, date, mode);
    if (!player.open) player.showModal();
    document.body.style.overflow = 'hidden';
    playerRoot.inert = true;
    const hash = routeFor(game, date, mode);
    if (location.hash !== hash) history.pushState({arcadePlayer:true}, '', hash);
    beep(660);
  }
  function closePlayer(fromRoute = false) {
    if (!player.open) return;
    if (document.fullscreenElement === player) document.exitFullscreen?.().catch(() => {});
    player.close();
    playerRoot.inert = false;
    document.body.style.overflow = '';
    frame.onload = null;
    frame.src = 'about:blank';
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
    launch(games[(at + direction + games.length) % games.length], null, null, playing.mode === 'trial' ? 'trial' : 'classic');
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
    if (pool.length) launch(pool[Math.floor(Math.random() * pool.length)], null, event.currentTarget);
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
  $('classicModeBtn').onclick = () => { if (playing) launch(playing.game, null, null, 'classic'); };
  $('trialModeBtn').onclick = () => { if (playing) launch(playing.game, null, null, 'trial'); };
  $('prevGameBtn').onclick = () => shiftGame(-1);
  $('nextGameBtn').onclick = () => shiftGame(1);
  $('reloadGameBtn').onclick = () => {
    if (playing) frame.src = gameUrl(playing.game, playing.date, playing.mode, true);
  };
  $('fullscreenBtn').hidden = !document.fullscreenEnabled || !player.requestFullscreen;
  $('fullscreenBtn').onclick = () => {
    const pending = document.fullscreenElement ? document.exitFullscreen?.() : player.requestFullscreen?.();
    pending?.catch(() => frame.focus());
  };
  document.addEventListener('fullscreenchange', () => {
    $('fullscreenBtn').textContent = document.fullscreenElement ? 'Exit fullscreen' : 'Fullscreen';
  });
  player.addEventListener('cancel', event => { event.preventDefault(); closePlayer(); });
  controls.addEventListener('keydown', event => {
    if (event.key === 'ArrowDown') { event.preventDefault(); frame.focus(); }
  });
  window.addEventListener('keydown', event => {
    if (event.key !== '/' || event.altKey || event.ctrlKey || event.metaKey
      || playing || event.target?.matches?.('input, textarea, select, [contenteditable]')) return;
    event.preventDefault();
    $('searchInput').focus();
  });
  window.addEventListener('hashchange', handleHash);
  window.addEventListener('popstate', handleHash);
  window.addEventListener('message', event => {
    if (!playing || event.source !== frame.contentWindow
      || (location.protocol !== 'file:' && event.origin !== location.origin)
      || Number(event.data?.id) !== playing.game.id) return;
    if (event.data.type === 'arcade100:mission') paintDaily();
    if (event.data.type === 'arcade100:mode' && ['classic','trial'].includes(event.data.mode)) {
      playing.mode = event.data.mode;
      playing.date = null;
      paintPlayerMode(playing);
      const hash = routeFor(playing.game, null, playing.mode);
      if (location.hash !== hash) history.pushState({arcadePlayer:true}, '', hash);
    }
  });
  window.addEventListener('storage', event => { if (event.key?.startsWith('arcade100:daily:')) paintDaily(); });
  document.addEventListener('visibilitychange', () => { if (!document.hidden) syncDaily(); });
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

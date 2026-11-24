/* Generated from the per-game mechanism inventory. */
window.ARCADE_FEATURES = [
  {
    "id": 1,
    "name": "Gale Flight",
    "description": "Moving pipe gates rise and fall, so each gap needs a different height and timing.",
    "mode": "Arcade+",
    "evidence": "Start, observe two successive paints: spawned gate moves vertically in Plus.",
    "slug": "01-flappy-bird",
    "title": "Flappy Bird",
    "genre": "arcade"
  },
  {
    "id": 2,
    "name": "Maze Rush",
    "description": "Maze Rush starts with solid obstacles, timed golden apples and a separate high-score table. Wraparound remains selectable.",
    "mode": "Arcade+",
    "evidence": "Start from Plus route: default mode Maze and 20 walls; four apples enable optional timed gold.",
    "slug": "02-snake",
    "title": "Snake",
    "genre": "arcade"
  },
  {
    "id": 3,
    "name": "Brick Lab",
    "description": "Brick Lab starts with rotating formations, two-hit armor, falling paddle wideners and one-use ball shields.",
    "mode": "Arcade+",
    "evidence": "Start on Brick Lab, strike armored brick twice; first hit earns no points.",
    "slug": "03-breakout",
    "title": "Breakout",
    "genre": "arcade"
  },
  {
    "id": 4,
    "name": "Spin Cup",
    "description": "first to seven by two, with paddle motion imparting spin and stronger late-rally ball speed.",
    "mode": "Arcade+",
    "evidence": "Play to 7–6: game continues until 2-point difference.",
    "slug": "04-pong",
    "title": "Pong",
    "genre": "board"
  },
  {
    "id": 5,
    "name": "Hold Stack",
    "description": "swap one tetromino per placement with C or the on-screen Hold control.",
    "mode": "Arcade+",
    "evidence": "Press C, then C again before placing: only first hold swaps.",
    "slug": "05-tetris",
    "title": "Tetris",
    "genre": "brain"
  },
  {
    "id": 6,
    "name": "Memory Flash",
    "description": "preview the whole board, then matching seasons require a 28-move budget and quicker mismatch reveals.",
    "mode": "Arcade+",
    "evidence": "Observe preview, then play mismatches: board is concealed after brief reveal; 28th unresolved attempt exhausts budget.",
    "slug": "06-memory-match",
    "title": "Memory Match",
    "genre": "brain"
  },
  {
    "id": 7,
    "name": "Garden Rush",
    "description": "inactive moles are fully hidden, portrait uses the screen, and tough helmet moles require two taps alongside gold and bombs.",
    "mode": "Arcade+",
    "evidence": "Tap armored mole twice; first breaks armor without scoring, second adds two. Inactive moles are invisible.",
    "slug": "07-whack-a-mole",
    "title": "Whack-a-Mole",
    "genre": "arcade"
  },
  {
    "id": 8,
    "name": "Chord Sweep",
    "description": "tap a revealed number when nearby flags match it to open neighboring squares in one action. The first move stays safe.",
    "mode": "Arcade+",
    "evidence": "Flag indicated neighbors of a revealed clue then tap the clue; unflagged neighbors open.",
    "slug": "08-minesweeper",
    "title": "Minesweeper",
    "genre": "brain"
  },
  {
    "id": 9,
    "name": "Daily Sprint",
    "description": "Daily Sprint selects a repeatable seeded opening, targets 1024 in 120 moves; switch to Practice for three undo charges.",
    "mode": "Arcade+",
    "evidence": "Use Classic and Daily modes in separate tabs; Plus opens reproducible Daily Sprint and caps it at 120 moves.",
    "slug": "09-2048",
    "title": "2048",
    "genre": "brain"
  },
  {
    "id": 10,
    "name": "Opening Gambit",
    "description": "AI opens with a pre-placed corner mark each board; the player must defend from turn one.",
    "mode": "Arcade+",
    "evidence": "Load an opening round: CPU already occupies a corner, center stays available for player.",
    "slug": "10-tic-tac-toe-ai",
    "title": "Tic-Tac-Toe vs AI",
    "genre": "board"
  },
  {
    "id": 11,
    "name": "Reverse Echo",
    "description": "after the first two rounds, repeat the sequence backwards rather than forward.",
    "mode": "Arcade+",
    "evidence": "Get to round 3, enter played pads in reverse order: accepts reverse, not ordinary order.",
    "slug": "11-simon-says",
    "title": "Simon Says",
    "genre": "brain"
  },
  {
    "id": 12,
    "name": "Armored Fleet",
    "description": "helmet-lined command invaders need two shots before being eliminated; enemy shots come only from the front line.",
    "mode": "Arcade+",
    "evidence": "Shoot marked top-row invader: survives first shot, then awards points on second.",
    "slug": "12-space-invaders",
    "title": "Space Invaders",
    "genre": "action"
  },
  {
    "id": 13,
    "name": "Vector Brake",
    "description": "hold B or the touch brake for tighter steering while faster asteroid fields push you to manage momentum.",
    "mode": "Arcade+",
    "evidence": "Accelerate and hold B: horizontal or vertical momentum decays faster.",
    "slug": "13-asteroids",
    "title": "Asteroids",
    "genre": "action"
  },
  {
    "id": 14,
    "name": "Tidal Crossing",
    "description": "river lanes surge and slow on different cycles; there is a tighter 46-second crossing budget.",
    "mode": "Arcade+",
    "evidence": "Cross river: platforms change speed by row cycle and player is carried by the same speed.",
    "slug": "14-frogger",
    "title": "Frogger",
    "genre": "arcade"
  },
  {
    "id": 15,
    "name": "Wind Garden",
    "description": "land on narrower, more varied aerial routes, with intermittent wind near the edges and extra springs as escape routes.",
    "mode": "Arcade+",
    "evidence": "Steer near left and right edges: wind modifies horizontal steering; platforms are narrower.",
    "slug": "15-doodle-jump",
    "title": "Doodle Jump",
    "genre": "action"
  },
  {
    "id": 16,
    "name": "Tactical Stockpile",
    "description": "survive paired salvos and carry unused ammo into the next wave; use a limited partial resupply.",
    "mode": "Arcade+",
    "evidence": "Finish two waves with a depleted battery: next wave refills just a reserve, some salvos pair missiles.",
    "slug": "16-missile-command",
    "title": "Missile Command",
    "genre": "action"
  },
  {
    "id": 17,
    "name": "Crosswind Landing",
    "description": "approach with reduced fuel, a narrower pad and horizontal gusts; the pad beacon previews wind direction and strength.",
    "mode": "Arcade+",
    "evidence": "Keep controls neutral: display reports wind and horizontal velocity drifts; fuel starts lower.",
    "slug": "17-lunar-lander",
    "title": "Lunar Lander",
    "genre": "sports"
  },
  {
    "id": 18,
    "name": "Pulse Caves",
    "description": "cave clearance tightens and opens periodically, making reading the route and conserving altitude more important.",
    "mode": "Arcade+",
    "evidence": "Enter a long cave section: after a number of columns the gap falls and recovers periodically.",
    "slug": "18-helicopter",
    "title": "Helicopter Cave Flyer",
    "genre": "action"
  },
  {
    "id": 19,
    "name": "Precision Recovery",
    "description": "each third consecutive perfect landing rebuilds part of the platform, offsetting width lost earlier.",
    "mode": "Arcade+",
    "evidence": "Stack three perfect blocks on a narrowed base: the landing restores some width.",
    "slug": "19-stack-tower",
    "title": "Stack Tower",
    "genre": "arcade"
  },
  {
    "id": 20,
    "name": "Offbeat",
    "description": "decoy notes interrupt the chart. Ignore outlined rests, hit the solid tiles, and avoid treating a rest as a note.",
    "mode": "Arcade+",
    "evidence": "Allow an outlined rest to pass without tapping: no loss; hitting the rest ends the streak.",
    "slug": "20-piano-tiles",
    "title": "Piano Tiles",
    "genre": "arcade"
  },
  {
    "id": 21,
    "name": "Tactical Connect",
    "description": "CPU uses center-first traversal, deeper search and no random blunders at any difficulty; immediate threats still take priority.",
    "mode": "Arcade+",
    "evidence": "Play Easy: no random branch; CPU chooses immediate win or block before deeper alpha-beta search.",
    "slug": "21-connect-four",
    "title": "Connect Four vs AI",
    "genre": "board"
  },
  {
    "id": 22,
    "name": "Long Words",
    "description": "the category clue is withheld and tougher words are selected; spend one reveal at the cost of a life.",
    "mode": "Arcade+",
    "evidence": "Use reveal once; reveals a missing letter, spends one life, and disables further reveals.",
    "slug": "22-hangman",
    "title": "Hangman",
    "genre": "brain"
  },
  {
    "id": 23,
    "name": "Hard Wordle",
    "description": "every later guess must keep all known greens and include known yellow letters; feedback explains each rejection.",
    "mode": "Arcade+",
    "evidence": "After a green or yellow signal, enter a dictionary word ignoring it: guess rejected without spending a row.",
    "slug": "23-wordle-clone",
    "title": "Wordle Clone",
    "genre": "brain"
  },
  {
    "id": 24,
    "name": "Fakeout Reflex",
    "description": "amber decoys interrupt the wait; wait for green while collecting seven samples.",
    "mode": "Arcade+",
    "evidence": "Wait through an amber decoy; clicking it fails, green accepts a valid reaction sample.",
    "slug": "24-reaction-timer",
    "title": "Reaction Timer",
    "genre": "arcade"
  },
  {
    "id": 25,
    "name": "Keykeeper Maze",
    "description": "collect a glowing key midway before the exit opens. Maze sizing follows the available mobile viewport.",
    "mode": "Arcade+",
    "evidence": "Reach the exit before collecting the key: still locked. Collect key, return and finish.",
    "slug": "25-maze-runner",
    "title": "Maze Runner",
    "genre": "brain"
  },
  {
    "id": 26,
    "name": "Chaser Rush",
    "description": "only two lives, shorter power windows, and a ghost that moves close to player speed as levels advance.",
    "mode": "Arcade+",
    "evidence": "Start a run: lose third-life buffer, ghost chases at higher speed, power pellets expire sooner.",
    "slug": "26-pacman-lite",
    "title": "Pac-Man Lite",
    "genre": "arcade"
  },
  {
    "id": 27,
    "name": "Ghost Sprint",
    "description": "race a pace car set to 42 WPM, with forward progress based only on the uninterrupted correct prefix. Pasting is disabled in this mode.",
    "mode": "Arcade+",
    "evidence": "Type one wrong character: car pauses at correct prefix while pace ghost advances.",
    "slug": "27-typing-racer",
    "title": "Typing Racer",
    "genre": "arcade"
  },
  {
    "id": 28,
    "name": "Pattern Duel",
    "description": "the AI notices repeated choices and tends to counter your most frequent move across the last six rounds. First to eight.",
    "mode": "Arcade+",
    "evidence": "Repeat a hand for several rounds; AI is more likely to counter that recurring choice.",
    "slug": "28-rock-paper-scissors",
    "title": "Rock Paper Scissors",
    "genre": "board"
  },
  {
    "id": 29,
    "name": "Blind Search",
    "description": "higher/lower hints are removed; use relative warmer/colder feedback and a one-use neighborhood scanner. Ten guesses.",
    "mode": "Arcade+",
    "evidence": "Guess, then scan: one 20-number range shown and no higher/lower clue.",
    "slug": "29-guess-number",
    "title": "Guess the Number",
    "genre": "brain"
  },
  {
    "id": 30,
    "name": "Single-Deck Practice",
    "description": "a separate virtual-chip balance, earlier reshuffles and dealer draws on soft 17. No real-money play.",
    "mode": "Arcade+",
    "evidence": "Practice deck shows 52 cards before deal. Soft-17 dealer hand draws; virtual Classic chips unaffected.",
    "slug": "30-blackjack",
    "title": "Blackjack",
    "genre": "board"
  },
  {
    "id": 31,
    "name": "Single-Step Slide",
    "description": "no multi-tile shoves. Boards are scrambled by a solvable random walk and hints are disabled in this mode.",
    "mode": "Arcade+",
    "evidence": "Try a nonadjacent tile in the same row: no movement. An adjacent move succeeds.",
    "slug": "31-sliding-puzzle",
    "title": "15 Sliding Puzzle",
    "genre": "brain"
  },
  {
    "id": 32,
    "name": "X-Switch",
    "description": "touching a light toggles diagonals instead of orthogonal neighbors. Generator uses the same rule, so puzzles stay solvable.",
    "mode": "Arcade+",
    "evidence": "Tap center: toggles the center and four diagonals, leaving orthogonal neighbors unchanged.",
    "slug": "32-lights-out",
    "title": "Lights Out",
    "genre": "brain"
  },
  {
    "id": 33,
    "name": "Three Strikes Sudoku",
    "description": "three incorrect entries end the board; checking spends one of two audit tokens. Candidate notes still work.",
    "mode": "Arcade+",
    "evidence": "Use two audits, then enter three incorrect values: audits disabled and third mistake ends board.",
    "slug": "33-sudoku",
    "title": "Sudoku",
    "genre": "brain"
  },
  {
    "id": 34,
    "name": "Sonar Tactics",
    "description": "use one non-damaging 3×3 scan per match; successful shots keep your firing turn, changing the attack strategy.",
    "mode": "Arcade+",
    "evidence": "In battle, select Sonar then enemy center: counts unhit hull nearby, consumes sonar, leaves normal shot available.",
    "slug": "34-battleship",
    "title": "Battleship vs AI",
    "genre": "board"
  },
  {
    "id": 35,
    "name": "Corner Siege",
    "description": "The CPU looks a move ahead to restrict mobility and deny dangerous corners.",
    "mode": "Arcade+",
    "evidence": "",
    "slug": "35-reversi",
    "title": "Reversi",
    "genre": "board"
  },
  {
    "id": 36,
    "name": "Fork Hunter",
    "description": "The AI searches for double threats before choosing its move.",
    "mode": "Arcade+",
    "evidence": "",
    "slug": "36-gomoku",
    "title": "Gomoku",
    "genre": "board"
  },
  {
    "id": 37,
    "name": "Reverse Captures",
    "description": "Uncrowned pieces jump backward as well as forward, so multi-capture chains have more routes.",
    "mode": "Arcade+",
    "evidence": "",
    "slug": "37-checkers",
    "title": "Checkers vs AI",
    "genre": "board"
  },
  {
    "id": 38,
    "name": "Pocket Swap",
    "description": "Swap the current and next bubble once per shot. Use the Swap bubble button or Space.",
    "mode": "Arcade+",
    "evidence": "",
    "slug": "38-bubble-shooter",
    "title": "Bubble Shooter",
    "genre": "arcade"
  },
  {
    "id": 39,
    "name": "Bankshot CPU",
    "description": "The CPU predicts bank shots off the side walls instead of reacting to the puck’s current position.",
    "mode": "Arcade+",
    "evidence": "",
    "slug": "39-air-hockey",
    "title": "Air Hockey vs AI",
    "genre": "board"
  },
  {
    "id": 40,
    "name": "Harvest Streak",
    "description": "Every third fruit caught in a row is worth double. Missing fruit or catching a bomb breaks the streak.",
    "mode": "Arcade+",
    "evidence": "",
    "slug": "40-catch-falling",
    "title": "Catch Falling Items",
    "genre": "arcade"
  },
  {
    "id": 41,
    "name": "Crosswind Debris",
    "description": "Falling rocks drift sideways and bounce off arena edges. Keep watching their approach, not just their spawn lane.",
    "mode": "Arcade+",
    "evidence": "",
    "slug": "41-dodger",
    "title": "Dodger",
    "genre": "action"
  },
  {
    "id": 42,
    "name": "Low Clearance",
    "description": "Low flying obstacles appear from the start and more often. Duck to pass beneath them.",
    "mode": "Arcade+",
    "evidence": "",
    "slug": "42-endless-runner",
    "title": "Endless Runner",
    "genre": "action"
  },
  {
    "id": 43,
    "name": "Ice Slalom",
    "description": "Icy skis hold their speed longer, and alternating gusts push you sideways.",
    "mode": "Arcade+",
    "evidence": "",
    "slug": "43-ski-slope",
    "title": "Ski Slope",
    "genre": "sports"
  },
  {
    "id": 44,
    "name": "Deepwater Derby",
    "description": "Long casts reach a shorter bite window and can hook prize fish found only in deep water.",
    "mode": "Arcade+",
    "evidence": "",
    "slug": "44-fishing",
    "title": "Fishing Frenzy",
    "genre": "creative"
  },
  {
    "id": 45,
    "name": "Discipline Range",
    "description": "Missed clicks cost 0.75 seconds, while moving targets keep their normal lifespan.",
    "mode": "Arcade+",
    "evidence": "",
    "slug": "45-target-shooter",
    "title": "Target Shooter",
    "genre": "sports"
  },
  {
    "id": 46,
    "name": "Gust Field",
    "description": "An alternating sideways gust bends arrows mid-flight. Time the release and aim into the wind.",
    "mode": "Arcade+",
    "evidence": "",
    "slug": "46-archery",
    "title": "Archery",
    "genre": "sports"
  },
  {
    "id": 47,
    "name": "Moving Hoop",
    "description": "The hoop and backboard move up and down together. Read the motion before committing your shot.",
    "mode": "Arcade+",
    "evidence": "",
    "slug": "47-basketball",
    "title": "Basketball Shootout",
    "genre": "sports"
  },
  {
    "id": 48,
    "name": "Read the Keeper",
    "description": "The keeper remembers your last shot zone. Repeating it makes a save much more likely.",
    "mode": "Arcade+",
    "evidence": "",
    "slug": "48-penalty-kicks",
    "title": "Penalty Kicks",
    "genre": "sports"
  },
  {
    "id": 49,
    "name": "Bankshot Open",
    "description": "Each course is mirrored top to bottom, and crisp rail rebounds reward bank shots.",
    "mode": "Arcade+",
    "evidence": "",
    "slug": "49-mini-golf",
    "title": "Mini Golf",
    "genre": "sports"
  },
  {
    "id": 50,
    "name": "Sport Oil",
    "description": "The front of the bowling lane resists spin. The ball hooks hard in the back half.",
    "mode": "Arcade+",
    "evidence": "",
    "slug": "50-bowling",
    "title": "Strike Alley Bowling",
    "genre": "sports"
  },
  {
    "id": 51,
    "name": "Double-Out 301",
    "description": "A tournament checkout requires a double. Leaving one point or finishing on a single busts the turn.",
    "mode": "Arcade+",
    "evidence": "",
    "slug": "51-darts",
    "title": "Darts",
    "genre": "sports"
  },
  {
    "id": 52,
    "name": "Mixed Traffic",
    "description": "Cars approach at three different speeds; a lane that looks safe now may close sooner than expected.",
    "mode": "Arcade+",
    "evidence": "",
    "slug": "52-car-dodger",
    "title": "Car Dodger",
    "genre": "action"
  },
  {
    "id": 53,
    "name": "River Route",
    "description": "A separate fixed route adds more water crossings, broken up by reliable grass rest lanes.",
    "mode": "Arcade+",
    "evidence": "",
    "slug": "53-crossy-road",
    "title": "Crossy Road",
    "genre": "action"
  },
  {
    "id": 54,
    "name": "Silent Running",
    "description": "Mines stay live, but releasing the dive control reduces torpedo homing. Alternate short dives and quiet climbs.",
    "mode": "Arcade+",
    "evidence": "",
    "slug": "54-submarine",
    "title": "Submarine",
    "genre": "action"
  },
  {
    "id": 55,
    "name": "Foil Decoys",
    "description": "Striped balloons are decoys. Popping one costs two points; gold and regular balloons still earn points.",
    "mode": "Arcade+",
    "evidence": "",
    "slug": "55-balloon-pop",
    "title": "Balloon Pop",
    "genre": "arcade"
  },
  {
    "id": 56,
    "name": "Golden Workshop",
    "description": "Start a separate bakery where buildings become expensive faster but golden cookies appear in short, frequent windows.",
    "mode": "Arcade+",
    "evidence": "",
    "slug": "56-cookie-clicker",
    "title": "Cookie Clicker",
    "genre": "creative"
  },
  {
    "id": 57,
    "name": "Pulse Mash",
    "description": "Tap during GO windows only. Early taps cost a point; green lasts most of each pulse.",
    "mode": "Arcade+",
    "evidence": "",
    "slug": "57-button-masher",
    "title": "Button Masher",
    "genre": "arcade"
  },
  {
    "id": 58,
    "name": "Syncopated Remix",
    "description": "A new chart adds offbeat notes and early two-key chords.",
    "mode": "Arcade+",
    "evidence": "",
    "slug": "58-rhythm-tap",
    "title": "Rhythm Tap",
    "genre": "arcade"
  },
  {
    "id": 59,
    "name": "Mirror Steps",
    "description": "The patterns are mirrored left-to-right, and tight scoring windows reward more exact timing.",
    "mode": "Arcade+",
    "evidence": "",
    "slug": "59-dance-arrows",
    "title": "Dance Arrows",
    "genre": "arcade"
  },
  {
    "id": 60,
    "name": "Two-Step Sprint",
    "description": "Some equations combine multiplication and addition or subtraction. Use order of operations.",
    "mode": "Arcade+",
    "evidence": "",
    "slug": "60-math-sprint",
    "title": "Math Sprint",
    "genre": "brain"
  },
  {
    "id": 61,
    "name": "Streak Sprints",
    "description": "Take a harder round with a single clue, and earn two extra seconds every third correct word in a row.",
    "mode": "Arcade+",
    "evidence": "",
    "slug": "61-word-scramble",
    "title": "Word Scramble",
    "genre": "brain"
  },
  {
    "id": 62,
    "name": "Passport Blitz",
    "description": "Each flag has seven seconds. A timeout reveals the answer and resets your streak.",
    "mode": "Arcade+",
    "evidence": "",
    "slug": "62-flags-quiz",
    "title": "Flags Quiz",
    "genre": "brain"
  },
  {
    "id": 63,
    "name": "Blind Knight",
    "description": "Hints are hidden and the whole tour has only one undo. All board sizes remain available.",
    "mode": "Arcade+",
    "evidence": "",
    "slug": "63-knight-tour",
    "title": "Knight's Tour",
    "genre": "brain"
  },
  {
    "id": 64,
    "name": "Braided Circuit",
    "description": "Generated layouts have extra connected loops, so more junctions and alternate routes must be rotated into place.",
    "mode": "Arcade+",
    "evidence": "",
    "slug": "64-pipe-connect",
    "title": "Pipe Connect",
    "genre": "brain"
  },
  {
    "id": 65,
    "name": "Flood Tactics",
    "description": "Wasted color changes cost two moves. Choose colors that actually annex new tiles.",
    "mode": "Arcade+",
    "evidence": "",
    "slug": "65-color-flood",
    "title": "Color Flood",
    "genre": "brain"
  },
  {
    "id": 66,
    "name": "Reactor Chambers",
    "description": "Every chamber starts with blocked cells. One fewer move and extra primed orbs reward smart chain placement.",
    "mode": "Arcade+",
    "evidence": "",
    "slug": "66-chain-reaction",
    "title": "Chain Reaction",
    "genre": "board"
  },
  {
    "id": 67,
    "name": "Crossed Gravity",
    "description": "The run regularly forces a choice between opposing obstacles. The paired traps alternate their safe side.",
    "mode": "Arcade+",
    "evidence": "",
    "slug": "67-gravity-flip",
    "title": "Gravity Flip Runner",
    "genre": "action"
  },
  {
    "id": 68,
    "name": "Mirror brush & undo",
    "description": "Mirror brush paints both halves; 24 Undo steps include a whole touch stroke, Fill or Clear.",
    "mode": "Native option / control",
    "evidence": "",
    "slug": "68-pixel-painter",
    "title": "Pixel Painter",
    "genre": "creative"
  },
  {
    "id": 69,
    "name": "Pen lift",
    "description": "Lift the pen to reposition without drawing; touch control or L key makes separate shapes possible.",
    "mode": "Native option / control",
    "evidence": "",
    "slug": "69-etch-sketch",
    "title": "Etch A Sketch",
    "genre": "creative"
  },
  {
    "id": 70,
    "name": "Steam lab",
    "description": "Water consumes flame and creates rising steam; freeze and step expose one simulation tick at a time.",
    "mode": "Native option / control",
    "evidence": "",
    "slug": "70-falling-sand",
    "title": "Falling Sand",
    "genre": "creative"
  },
  {
    "id": 71,
    "name": "Tower priorities & Siege",
    "description": "Tower priorities specialize Archer/Frost/other shots; optional Siege reinforcement every fourth round costs risk to earn extra takedowns.",
    "mode": "Native option / control",
    "evidence": "",
    "slug": "71-tower-defense",
    "title": "Tower Defense Lite",
    "genre": "board"
  },
  {
    "id": 72,
    "name": "Bumper bank",
    "description": "Light each of the five different bumpers in one ball to earn a 750 point table-completion award.",
    "mode": "All modes",
    "evidence": "",
    "slug": "72-pinball",
    "title": "Neon Pinball",
    "genre": "sports"
  },
  {
    "id": 73,
    "name": "Sweep budget",
    "description": "Each red throw gives a finite sweep budget. Save it to carry longer through the house; CPU shots cannot be swept.",
    "mode": "All modes",
    "evidence": "",
    "slug": "73-curling",
    "title": "Ice Curling",
    "genre": "sports"
  },
  {
    "id": 74,
    "name": "Cue spin",
    "description": "Optional position play puts Topspin and Draw on the cue ball after first contact; Normal leaves the familiar break.",
    "mode": "Native option / control",
    "evidence": "",
    "slug": "74-pool-lite",
    "title": "Pool Lite",
    "genre": "sports"
  },
  {
    "id": 75,
    "name": "Signal hold",
    "description": "A signal gives the dispatcher one two-second traffic hold per map to inspect junctions, and pending level changes cannot override Restart.",
    "mode": "Native option / control",
    "evidence": "",
    "slug": "75-train-switcher",
    "title": "Train Switcher",
    "genre": "brain"
  },
  {
    "id": 76,
    "name": "Choreography",
    "description": "Choose Peony, Ring or Split bursts, and manually alternate patterns to earn a choreography bonus and a higher combo.",
    "mode": "Native option / control",
    "evidence": "",
    "slug": "76-fireworks",
    "title": "Fireworks",
    "genre": "creative"
  },
  {
    "id": 77,
    "name": "Crop rotation",
    "description": "Crop rotation adds a 15% soil bonus when the next harvested species differs on that plot, including after save/reload.",
    "mode": "All modes",
    "evidence": "",
    "slug": "77-farm-clicker",
    "title": "Farm Clicker",
    "genre": "creative"
  },
  {
    "id": 78,
    "name": "Reverse geography",
    "description": "Each quiz asks both countries and capitals: every third question shows the capital and asks for the country.",
    "mode": "All modes",
    "evidence": "",
    "slug": "78-capitals-quiz",
    "title": "World Capitals Quiz",
    "genre": "brain"
  },
  {
    "id": 79,
    "name": "Par & undo",
    "description": "Puzzle-specific move par and Undo let players plan rotations and placements instead of restarting a whole silhouette.",
    "mode": "All modes",
    "evidence": "",
    "slug": "79-tangram",
    "title": "Tangram Puzzle",
    "genre": "brain"
  },
  {
    "id": 80,
    "name": "Edge sorting",
    "description": "Edge sorting gathers loose border pieces into the trays without moving your placed pieces; the picture preview is independently toggleable.",
    "mode": "Native option / control",
    "evidence": "",
    "slug": "80-jigsaw",
    "title": "Jigsaw Lite",
    "genre": "brain"
  },
  {
    "id": 81,
    "name": "Charged shield",
    "description": "A limited Shield absorbs one meteor hit; earning three successive star pickups recharges it.",
    "mode": "All modes",
    "evidence": "",
    "slug": "81-orbit-dodge",
    "title": "Orbit Dodge",
    "genre": "action"
  },
  {
    "id": 82,
    "name": "Rocket boost",
    "description": "A charged evasive Boost accelerates upward, pushes horizontal velocity, and can be fired with X or its touch button.",
    "mode": "All modes",
    "evidence": "",
    "slug": "82-rocket-escape",
    "title": "Rocket Escape",
    "genre": "action"
  },
  {
    "id": 83,
    "name": "Outline clues",
    "description": "Two outline clues per run drop one wrong answer. Late rounds rotate the silhouette without rotating the answer labels.",
    "mode": "Native option / control",
    "evidence": "",
    "slug": "83-shadow-guess",
    "title": "Shadow Guess",
    "genre": "brain"
  },
  {
    "id": 84,
    "name": "Memory matches",
    "description": "Optional Memory mode shows each target briefly, then hides it until a correct match or timeout; wrong taps still cost clock.",
    "mode": "Native option / control",
    "evidence": "",
    "slug": "84-emoji-match",
    "title": "Symbol Match",
    "genre": "brain"
  },
  {
    "id": 85,
    "name": "Wild bridge",
    "description": "A single Wild bridge lets you connect one nonadjacent card to recover a dead board; Undo refunds both the move and bridge.",
    "mode": "Native option / control",
    "evidence": "",
    "slug": "85-solitaire-golf",
    "title": "Golf Solitaire",
    "genre": "board"
  },
  {
    "id": 86,
    "name": "Symbol Lab",
    "description": "Free Symbol Lab adds a no-stake pattern exercise: build a matching triple with reel controls, without affecting pretend credits.",
    "mode": "Native option / control",
    "evidence": "",
    "slug": "86-slot-machine",
    "title": "Slot Machine",
    "genre": "board"
  },
  {
    "id": 87,
    "name": "Hold advisor",
    "description": "Strategy advice optionally marks dice to keep for the next reroll, using the same combination analysis as the opponent.",
    "mode": "Native option / control",
    "evidence": "",
    "slug": "87-dice-battle",
    "title": "Dice Battle",
    "genre": "board"
  },
  {
    "id": 88,
    "name": "Solid tail maze",
    "description": "Arcade+ activates tail collisions and an extra orb per maze, turning long routes into a planning constraint.",
    "mode": "Arcade+",
    "evidence": "",
    "slug": "88-snake-maze",
    "title": "Snake Maze",
    "genre": "brain"
  },
  {
    "id": 89,
    "name": "Air brake",
    "description": "Tap Air brake or B to slow once per bounce. It restores control over moving platforms instead of constant left/right steering.",
    "mode": "All modes",
    "evidence": "",
    "slug": "89-bounce-ball",
    "title": "Bounce Ball",
    "genre": "arcade"
  },
  {
    "id": 90,
    "name": "Refreeze",
    "description": "Ice Breaker can restore the most recently cracked block while it is still intact, with one Refreeze per life.",
    "mode": "Native option / control",
    "evidence": "",
    "slug": "90-ice-breaker",
    "title": "Ice Breaker",
    "genre": "arcade"
  },
  {
    "id": 91,
    "name": "Air dash",
    "description": "A once-per-landing air dash commits to the facing direction, letting climbs route around crumble platforms.",
    "mode": "All modes",
    "evidence": "",
    "slug": "91-volcano-escape",
    "title": "Volcano Escape",
    "genre": "action"
  },
  {
    "id": 92,
    "name": "Load or bail",
    "description": "Heavy treasure slows your swim. A Bail command drops part of the load for a brief escape boost and forces a haul-versus-air decision.",
    "mode": "All modes",
    "evidence": "",
    "slug": "92-treasure-dive",
    "title": "Treasure Dive",
    "genre": "action"
  },
  {
    "id": 93,
    "name": "Repel swarm",
    "description": "A limited Repel action pushes the entire swarm away from the picnic; every eight confirmed bugs recharges it.",
    "mode": "All modes",
    "evidence": "",
    "slug": "93-bug-squash",
    "title": "Bug Squash",
    "genre": "arcade"
  },
  {
    "id": 94,
    "name": "Touch beam & flash",
    "description": "Touch can reveal and catch with the same aimed gesture. A rechargeable Flash briefly lights the entire board.",
    "mode": "All modes",
    "evidence": "",
    "slug": "94-ghost-catch",
    "title": "Ghost Catch",
    "genre": "action"
  },
  {
    "id": 95,
    "name": "Optical hints & undo",
    "description": "A one-use optical hint finds the nearest solvable orientation for the current chamber; Undo reverses individual mirror flips before crystal lock.",
    "mode": "Native option / control",
    "evidence": "",
    "slug": "95-laser-reflect",
    "title": "Laser Reflect",
    "genre": "brain"
  },
  {
    "id": 96,
    "name": "Reverse cards",
    "description": "Arcade+ reverses the yes/no rule on every sixth card, with a clear live rule label and a bonus for correctly reading it.",
    "mode": "Arcade+",
    "evidence": "",
    "slug": "96-uno-colors",
    "title": "Color Match Rush",
    "genre": "arcade"
  },
  {
    "id": 97,
    "name": "Reachable chains",
    "description": "Every target is generated from an actual connected route. Arcade+ requires a three-tile minimum and adds a solvable-path clue with a cap.",
    "mode": "Arcade+",
    "evidence": "",
    "slug": "97-math-blocks",
    "title": "Math Blocks",
    "genre": "brain"
  },
  {
    "id": 98,
    "name": "Pulse burst",
    "description": "A Pulse Burst clears meteors near the shield. Six regular deflections recharge it, so it saves out-of-position runs without replacing aiming.",
    "mode": "All modes",
    "evidence": "",
    "slug": "98-planet-defender",
    "title": "Planet Defender",
    "genre": "action"
  },
  {
    "id": 99,
    "name": "Taut line",
    "description": "Pull the line to surge sideways through the wind, briefly negating gust drift. Rings recharge that ability.",
    "mode": "All modes",
    "evidence": "",
    "slug": "99-kite-flyer",
    "title": "Kite Flyer",
    "genre": "action"
  },
  {
    "id": 100,
    "name": "Milestone rocks",
    "description": "Arcade+ adds visible rocks on five-food milestones; food avoids occupied tiles and room is retained for steering.",
    "mode": "Arcade+",
    "evidence": "",
    "slug": "100-worm-game",
    "title": "Wrap-Around Worm",
    "genre": "arcade"
  }
];

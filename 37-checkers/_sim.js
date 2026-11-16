const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const js = html.split('<script>')[1].split('</script>')[0];

const stub = `
var document = {
  getElementById: function(){
    return {
      innerHTML:'', textContent:'', style:{},
      addEventListener:function(){},
      classList:{add:function(){},remove:function(){}}
    };
  }
};
`;

const driver = `
function playerRandomMove(){
  const info = sideMoves(board,'red');
  const pool = info.captures.length ? info.captures : info.moves;
  if (!pool.length) return;
  const s = pool[Math.floor(Math.random()*pool.length)];
  doPlayerStep(s);
  let g = 0;
  while (locked && !over && g++ < 20){
    const s2 = selMoves[Math.floor(Math.random()*selMoves.length)];
    doPlayerStep({from: selected, to: s2.to, cap: s2.cap});
  }
}
let plies = 0;
const iv = setInterval(() => {
  if (over){
    clearInterval(iv);
    console.log('GAME OVER after', plies, 'player plies ->', statusEl.textContent,
      '| red:', countPieces(board,'red'), 'blk:', countPieces(board,'blk'));
    process.exit(0);
  }
  if (turn === 'red' && !locked){ plies++; playerRandomMove(); }
}, 40);
setTimeout(() => { console.log('TIMEOUT - game never finished'); process.exit(1); }, 120000);
`;

eval(stub + js + driver);

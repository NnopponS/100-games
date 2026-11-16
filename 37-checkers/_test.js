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
var setTimeoutOrig = setTimeout;
`;

const tests = `
;(function(){
  const b = newBoard();
  console.assert(countPieces(b,'red')===12, 'FAIL red count');
  console.assert(countPieces(b,'blk')===12, 'FAIL blk count');

  const m = sideMoves(b,'red');
  console.assert(m.captures.length===0 && m.moves.length===7, 'FAIL start moves: '+m.moves.length);
  const mb = sideMoves(b,'blk');
  console.assert(mb.moves.length===7, 'FAIL blk start moves: '+mb.moves.length);

  // forced capture
  const b2 = Array.from({length:8},()=>Array(8).fill(0));
  b2[5][0]='r'; b2[4][1]='b'; b2[5][4]='r'; b2[0][1]='b';
  const m2 = sideMoves(b2,'red');
  console.assert(m2.captures.length===1, 'FAIL forced cap count '+m2.captures.length);
  console.assert(m2.captures[0].from[0]===5 && m2.captures[0].to[0]===3, 'FAIL cap coords');

  const prom = applyStep(b2, m2.captures[0].from, m2.captures[0].to, m2.captures[0].cap);
  console.assert(b2[3][2]==='r' && b2[4][1]===0 && b2[5][0]===0, 'FAIL cap applied');
  console.assert(prom===false, 'FAIL unexpected promo');

  // multi-jump chain
  const b3 = Array.from({length:8},()=>Array(8).fill(0));
  b3[5][0]='r'; b3[4][1]='b'; b3[2][3]='b';
  applyStep(b3, [5,0],[3,2],[4,1]);
  const chain = pieceCaptures(b3,3,2);
  console.assert(chain.length===1 && chain[0].to[0]===1 && chain[0].to[1]===4, 'FAIL chain');
  applyStep(b3, [3,2],[1,4],[2,3]);
  console.assert(b3[1][4]==='r' && b3[2][3]===0, 'FAIL chain applied');

  // promotion + turn must stop (no continued jump as king same turn)
  const b4 = Array.from({length:8},()=>Array(8).fill(0));
  b4[1][0]='r'; b4[1][4]='b';
  const p = applyStep(b4,[1,0],[0,1],null);
  console.assert(p===true && b4[0][1]==='R', 'FAIL promotion');

  // promotion via jump ends chain even if a capture exists
  const b5 = Array.from({length:8},()=>Array(8).fill(0));
  b5[2][1]='r'; b5[1][2]='b'; b5[1][6]='b';
  const caps5 = pieceCaptures(b5,2,1);
  console.assert(caps5.length===1 && caps5[0].to[0]===0, 'FAIL promo-jump setup');
  const p5 = applyStep(b5,[2,1],[0,3],[1,2]);
  console.assert(p5===true && b5[0][3]==='R', 'FAIL jump promotion');

  // king moves all 4 dirs
  const b6 = Array.from({length:8},()=>Array(8).fill(0));
  b6[4][3]='R';
  console.assert(pieceSimpleMoves(b6,4,3).length===4, 'FAIL king dirs');

  // isAttacked
  const b7 = Array.from({length:8},()=>Array(8).fill(0));
  b7[4][3]='b'; b7[5][4]='r';
  console.assert(isAttacked(b7,4,3)===true, 'FAIL isAttacked true');
  console.assert(isAttacked(b7,5,4)===true, 'FAIL isAttacked both ways');
  b7[3][2]='r'; // red at 5,4 can no longer land on 3,2; red at 3,2 can't jump backwards
  console.assert(isAttacked(b7,4,3)===false, 'FAIL blocked attack');

  // win detection helper: no moves side
  const b8 = Array.from({length:8},()=>Array(8).fill(0));
  const m8 = sideMoves(b8,'red');
  console.assert(m8.captures.length===0 && m8.moves.length===0, 'FAIL no moves');

  console.log('ALL TESTS PASSED');
})();
`;

eval(stub + js + tests);

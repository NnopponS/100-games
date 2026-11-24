'use strict';
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const root = path.resolve(__dirname,'..');
const fixtures = Object.create(null);
fixtures.window = fixtures;
vm.runInNewContext(fs.readFileSync(path.join(root,'assets/games.js'),'utf8'),fixtures);
const inputs = process.argv.slice(2);
if(!inputs.length) inputs.push(path.join(root,'docs/arcade-plus-mechanisms.json'));
const source = inputs.flatMap(p=>JSON.parse(fs.readFileSync(p,'utf8')).filter(Boolean));
const byId = new Map();
for (const row of source) {
  const id = Number(row.id);
  const name = row.name || row.feature || row.title;
  const description = row.description || row.effect || row.summary || row.detail;
  if (!Number.isInteger(id) || id<1 || id>100 || byId.has(id) || !name || !description) throw new Error('Bad/duplicate feature: '+JSON.stringify(row));
  byId.set(id,{id,name:String(name),description:String(description), mode: row.mode || 'Arcade+', evidence: row.evidence || row.test || ''});
}
if(byId.size!==100)throw new Error('Need exactly 100 game mechanisms; got '+byId.size);
const table = fixtures.GAMES_DATA.map(g => {
  const item=byId.get(g.id);
  if(!item)throw new Error('Catalog/feature mismatch for '+g.id);
  return {...item,slug:g.dir,title:g.title,genre:g.cat};
});
const quote=v=>'"'+String(v).replaceAll('"','""')+'"';
const headings = ['id','slug','title','genre','name','description','mode','evidence'];
fs.writeFileSync(path.join(root,'docs/game-feature-matrix.csv'),headings.join(',')+'\n'+table.map(x=>headings.map(k=>quote(x[k])).join(',')).join('\n')+'\n');
fs.writeFileSync(path.join(root,'assets/features.js'),'/* Generated from the per-game mechanism inventory. */\nwindow.ARCADE_FEATURES = '+JSON.stringify(table,null,2)+';\n');
console.log('Generated a public inventory of '+table.length+' title-specific Arcade+ changes.');

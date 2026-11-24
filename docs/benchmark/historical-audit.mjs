import { execFileSync } from 'node:child_process';
import { Script } from 'node:vm';
const repo=process.argv[2];
const commits=['7fc5a2af210cd7ce654ba013eb2cc997bf66212e','2e8b6316ac0939bc66b8cc1e02af94e434438c0a','8843194ffb496b2f085936f4ce65e73abfc62425'];
const git=(...args)=>execFileSync('git',['-C',repo,...args],{encoding:'utf8',maxBuffer:4*1024*1024});
const summary=[];
for(const sha of commits) {
 const all=git('ls-tree','-r','--name-only',sha).trim().split('\n'), paths=all.filter(p=>/^\d{2,3}-[^/]+\/index\.html$/.test(p));
 const ids=paths.map(p=>Number.parseInt(p,10)).sort((a,b)=>a-b);
 let bytes=0,lines=0,scriptCount=0,canvas=0,svg=0,nativeAudioReferences=0,localStorageReferences=0;
 const failures=[];
 for(const p of paths) {
   const html=git('show',sha+':'+p);
   bytes+=Buffer.byteLength(html);
   lines+=html.split(/\r?\n/).length-(html.endsWith('\n')?1:0);
   if(/<canvas\b/i.test(html))canvas++;
   if(/<svg\b/i.test(html))svg++;
   if(/\b(?:webkit)?AudioContext\b/i.test(html))nativeAudioReferences++;
   if(/\blocalStorage\b/.test(html))localStorageReferences++;
   for(const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
     if(/\bsrc\s*=/i.test(match[1])||/type\s*=\s*["'](?:application\/json|module)/i.test(match[1])||!match[2].trim()) continue;
     scriptCount++;
     try { new Script(match[2]); } catch(e) { failures.push({path:p,error:String(e)}); }
   }
 }
 const [authorDate,commitDate,subject]=git('show','-s','--format=%aI%n%cI%n%s',sha).trim().split('\n');
 summary.push({sha,authorUTC:new Date(authorDate).toISOString(),commitUTC:new Date(commitDate).toISOString(),subject,htmlGames:paths.length,idsContiguous:JSON.stringify(ids)===JSON.stringify(Array.from({length:100},(_,i)=>i+1)),bytes,lines,scriptCount,syntaxFailures:failures,canvasMarkup:canvas,svgMarkup:svg,nativeAudioReferences,localStorageReferences,reportPresent:all.includes('AI_EXPERIMENT_REPORT.md')});
}
console.log(JSON.stringify({node:process.version,summary},null,2));

const fs = require('fs');
let h = fs.readFileSync('index.html', 'utf8');
const inject = [
  '<script>',
  'window.addEventListener("load", function () {',
  '  setTimeout(function () { window.dispatchEvent(new KeyboardEvent("keydown", { code: "Space" })); }, 50);',
  '  setTimeout(function () { window.dispatchEvent(new KeyboardEvent("keydown", { code: "ArrowRight" })); }, 200);',
  '  setTimeout(function () { window.dispatchEvent(new KeyboardEvent("keyup", { code: "ArrowRight" })); window.dispatchEvent(new KeyboardEvent("keydown", { code: "ArrowUp" })); }, 1000);',
  '});',
  '</' + 'script>'
].join('\n');
h = h.replace('</body>', inject + '\n</body>');
fs.writeFileSync('.play-test.html', h);
console.log('wrote .play-test.html');

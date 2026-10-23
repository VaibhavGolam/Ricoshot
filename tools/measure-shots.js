// Plays generated levels with a simple aiming bot and prints a fair shot limit for each.
// Usage: node tools/measure-shots.js <from> <to> [runs] [file]
// Output: JSON array of shot limits, starting at <from>. Paste into GEN_SHOTS in www/index.html
// (GEN_SHOTS[0] is level 16) after changing the generator or physics.
const fs = require('fs');
const path = require('path');
const file = process.argv[5] || path.join(__dirname, '..', 'www', 'index.html');
const src = fs.readFileSync(file, 'utf8');
const core = src.split('/*CORE-START*/')[1].split('/*CORE-END*/')[0]
  .replace(/const GEN_SHOTS = \[[^\]]*\];/, 'const GEN_SHOTS = [];'); // measure from scratch
const api = new Function(core + '\nreturn {CONFIG,newGame,fire,updateTurn,countBricks,canAim,ROWS,COLS,CELL,FX0,FY0,FLOOR,R};')();
const { CONFIG, newGame, fire, updateTurn, countBricks, ROWS, COLS, CELL, FX0, FY0, FLOOR, R } = api;

function aim(G, rnd) {
  const t = [];
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) { const o = G.grid[r][c]; if (o && o.k === 'brick') t.push([r, c]); }
  for (let i = 0; i < 10; i++) {
    const [r, c] = t[Math.floor(rnd() * t.length)];
    const a = Math.atan2((FLOOR - R) - (FY0 + r * CELL + CELL / 2), FX0 + c * CELL + CELL / 2 + (rnd() - 0.5) * 60 - G.launchX);
    if (api.canAim(a)) return a;
  }
  return (20 + rnd() * 140) * Math.PI / 180;
}
function play(n, seed) {
  const G = newGame('level', n, 1);
  let s = seed; const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
  let k = 0;
  while (countBricks(G) > 0 && k < 400) {
    fire(G, aim(G, rnd));
    let t = 0;
    while (G.phase === 'fire' && t < 200) { updateTurn(G, CONFIG.STEP); t += CONFIG.STEP; }
    k++;
  }
  return G.shotsUsed;
}
const from = +process.argv[2] || 16, to = +process.argv[3] || CONFIG.LEVEL_COUNT, runs = +process.argv[4] || 12;
const out = [];
const t0 = Date.now();
for (let n = from; n <= to; n++) {
  const r = [];
  for (let k = 1; k <= runs; k++) r.push(play(n, k * 977 + n));
  r.sort((a, b) => a - b);
  const med = r[Math.floor(runs / 2)], p80 = r[Math.floor(runs * 0.8)];
  const ease = Math.sqrt(Math.max(0, (n - 16) / (CONFIG.LEVEL_COUNT - 16)));
  const slack = 1.25 - 0.13 * ease; // a little tighter as the game goes on
  out.push(Math.max(p80 + 1, Math.ceil(med * slack)));
  if (process.env.VERBOSE) console.error(`L${n} shots=${out[out.length - 1]} med=${med} max=${r[runs - 1]} ${((Date.now() - t0) / 1000).toFixed(1)}s`);
}
console.log(JSON.stringify(out));

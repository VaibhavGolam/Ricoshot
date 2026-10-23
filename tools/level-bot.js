// Plays levels with a simple aiming bot and reports how many shots it needed.
// Run: node tools/level-bot.js            (all levels; takes ~20 minutes)
//      node tools/level-bot.js 12         (just level 12)
//      node tools/level-bot.js 100 200    (levels 100 to 200)
// A level is fair if the bot wins it at least ~50% of the time within its shot limit.
// If you change the generator or physics, re-measure with tools/measure-shots.js.
const fs = require('fs');
const src = fs.readFileSync(__dirname + '/../www/index.html', 'utf8');
const core = src.split('/*CORE-START*/')[1].split('/*CORE-END*/')[0];
const api = new Function(core + '\nreturn {CONFIG,newGame,fire,updateTurn,countBricks,canAim,ROWS,COLS,CELL,FX0,FY0,FLOOR,R};')();
const { CONFIG, newGame, fire, updateTurn, countBricks, ROWS, COLS, CELL, FX0, FY0, FLOOR, R } = api;

function botAngle(G, rnd) {
  const targets = [];
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) { const o = G.grid[r][c]; if (o && o.k === 'brick') targets.push([r, c]); }
  for (let tries = 0; tries < 10; tries++) {
    const [r, c] = targets[Math.floor(rnd() * targets.length)];
    const tx = FX0 + c * CELL + CELL / 2 + (rnd() - 0.5) * 60, ty = FY0 + r * CELL + CELL / 2;
    const a = Math.atan2((FLOOR - R) - ty, tx - G.launchX);
    if (api.canAim(a)) return a;
  }
  return (20 + rnd() * 140) * Math.PI / 180;
}
function play(level, seed) {
  const G = newGame('level', level, 1);
  let s = seed; const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
  let safety = 0;
  while (countBricks(G) > 0 && safety < 400) {
    fire(G, botAngle(G, rnd));
    let t = 0;
    while (G.phase === 'fire' && t < 200) { updateTurn(G, CONFIG.STEP); t += CONFIG.STEP; }
    safety++;
  }
  return G.shotsUsed;
}

const a = +process.argv[2] || 1;
const b = +process.argv[3] || (process.argv[2] ? a : CONFIG.LEVEL_COUNT);
let weak = 0;
for (let n = a; n <= b; n++) {
  const res = [];
  for (let k = 1; k <= 12; k++) res.push(play(n, k * 977));
  res.sort((x, y) => x - y);
  const G0 = newGame('level', n, 1);
  const winRate = res.filter(u => u <= G0.shots).length / res.length;
  if (winRate < 0.5) weak++;
  console.log(`L${String(n).padStart(4)} balls=${String(G0.ballCount).padStart(2)} shots=${String(G0.shots).padStart(2)} bot med=${res[6]} max=${res[11]} win=${Math.round(winRate * 100)}%`);
}
console.log('levels under 50% bot win rate:', weak);

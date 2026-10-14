// Plays every level with a simple aiming bot and reports how many shots it needed.
// Run: node tools/level-bot.js        (or: node tools/level-bot.js 12  for one level)
// If you change a level or CONFIG, run this and adjust GEN_SHOTS / the hand level shots.
const fs = require('fs');
const src = fs.readFileSync(__dirname + '/../www/index.html', 'utf8');
const core = src.split('/*CORE-START*/')[1].split('/*CORE-END*/')[0];
const api = new Function(core + '\nreturn {CONFIG,newGame,fire,updateTurn,countBricks,canAim,ROWS,COLS,CELL,FX0,FY0,FLOOR,R,getLevel};')();
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
  while (countBricks(G) > 0 && safety < 200) {
    fire(G, botAngle(G, rnd));
    let t = 0;
    while (G.phase === 'fire' && t < 200) { updateTurn(G, CONFIG.STEP); t += CONFIG.STEP; }
    safety++;
  }
  return { used: G.shotsUsed, shots: G.shots };
}

const only = process.argv[2] ? +process.argv[2] : null;
const rows = [];
let fails = 0;
for (let n = only || 1; n <= (only || CONFIG.LEVEL_COUNT); n++) {
  const res = [];
  for (let k = 1; k <= 12; k++) res.push(play(n, k * 977).used);
  res.sort((a, b) => a - b);
  const shots = newGame('level', n, 1).shots;
  const p75 = res[Math.floor(res.length * 0.75)], med = res[Math.floor(res.length / 2)];
  const winRate = res.filter(u => u <= shots).length / res.length;
  if (winRate < 0.75) fails++;
  rows.push(`L${String(n).padStart(2)} balls=${String(newGame('level', n, 1).ballCount).padStart(2)} shots=${String(shots).padStart(2)} bot med=${med} p75=${p75} max=${res[res.length - 1]} win=${Math.round(winRate * 100)}%`);
}
console.log(rows.join('\n'));
console.log('levels under 75% bot win rate:', fails);

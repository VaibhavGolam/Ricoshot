// Copies Capacitor's browser bridge into www/ so the game can talk to native plugins
// (AdMob, purchases, back button) without a bundler. Runs automatically after npm install.
const fs = require('fs');
const path = require('path');
const src = path.join(__dirname, '..', 'node_modules', '@capacitor', 'core', 'dist', 'capacitor.js');
const dest = path.join(__dirname, '..', 'www', 'vendor', 'capacitor.js');
fs.mkdirSync(path.dirname(dest), { recursive: true });
fs.copyFileSync(src, dest);
console.log('Copied capacitor.js to www/vendor/');

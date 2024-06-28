// esbuild.config.js
const esbuild = require('esbuild');

esbuild.build({
  entryPoints: ['public/app.js', 'public/chatai.js'],
  bundle: true,
  outdir: 'public/bundle',
  sourcemap: true,
  format: 'esm',
  platform: 'browser', // Change to 'node' if you need Node.js compatibility
  watch: process.argv.includes('--watch'),
}).catch(() => process.exit(1));

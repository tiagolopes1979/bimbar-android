const esbuild = require('esbuild')

esbuild.build({
  entryPoints: ['src/app.js'],
  outfile: 'www/app.bundle.js',
  bundle: true,
  platform: 'browser',
  target: 'es2020',
  format: 'iife',
  minify: false,
  sourcemap: false,
}).catch(() => process.exit(1))

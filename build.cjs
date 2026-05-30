const esbuild = require('esbuild')
const fs = require('fs')
const path = require('path')

esbuild.build({
  entryPoints: ['src/app.js'],
  outfile: 'www/app.bundle.js',
  bundle: true,
  platform: 'browser',
  target: 'es2020',
  format: 'iife',
  minify: false,
  sourcemap: false,
}).then(() => {
  const wasmDir = path.join('www', 'assets', 'wasm')
  fs.mkdirSync(wasmDir, { recursive: true })
  fs.copyFileSync(
    path.join('node_modules', 'sql.js', 'dist', 'sql-wasm.wasm'),
    path.join(wasmDir, 'sql-wasm.wasm')
  )
}).catch(() => process.exit(1))

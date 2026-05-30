import Database from 'better-sqlite3'

const db = new Database('licencas.db')
db.pragma('journal_mode = WAL')
db.exec(`
  CREATE TABLE IF NOT EXISTS licencas (
    chave TEXT PRIMARY KEY,
    tipo TEXT NOT NULL,
    email TEXT NOT NULL,
    dias INTEGER NOT NULL DEFAULT 0,
    device_uuid TEXT,
    status TEXT NOT NULL DEFAULT 'disponivel',
    ativada_em TEXT,
    criada_em TEXT NOT NULL DEFAULT (datetime('now'))
  )
`)

function decodificarChave(key) {
  const clean = key.replace(/^BIMBAR-/i, '').replace(/-/g, '')
  const decoded = Buffer.from(clean, 'base64').toString('utf-8')
  const parts = decoded.split('|')
  if (parts.length !== 5) throw new Error('Formato inválido: ' + key)
  const [tipo, email, diasStr] = parts
  return { tipo, email, dias: parseInt(diasStr) }
}

const keys = process.argv.slice(2)
if (keys.length === 0) {
  console.log('Uso: node seed.js BIMBAR-... BIMBAR-...')
  console.log('Importa chaves existentes no banco do servidor como "disponível"')
  process.exit(1)
}

const insert = db.prepare('INSERT OR IGNORE INTO licencas (chave, tipo, email, dias) VALUES (?, ?, ?, ?)')
let count = 0
for (const key of keys) {
  try {
    const info = decodificarChave(key)
    insert.run(key, info.tipo, info.email, info.dias)
    count++
    console.log(`  OK  ${info.tipo.padEnd(12)} ${info.email.padEnd(20)} ${key}`)
  } catch (e) {
    console.log(`  ERR ${e.message}`)
  }
}
console.log(`\n${count} chave(s) importada(s)`)

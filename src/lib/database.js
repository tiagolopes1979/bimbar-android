import { CapacitorSQLite, SQLiteConnection } from '@capacitor-community/sqlite'
import { Capacitor } from '@capacitor/core'
import { defineCustomElements as defineJeepSqlite } from 'jeep-sqlite/loader'

let db = null
let sqliteConn = null

export async function initDatabase() {
  await initWebSQLite()
  sqliteConn = new SQLiteConnection(CapacitorSQLite)
  if (Capacitor.getPlatform() === 'web') {
    await sqliteConn.initWebStore()
  }
  const ret = await sqliteConn.createConnection('bimbar', true, 'AES-256', 1, false)
  await ret.open()
  db = ret
  await createSchema()
  await ensureDeviceUuid()
  return db
}

async function initWebSQLite() {
  if (Capacitor.getPlatform() !== 'web') return

  defineJeepSqlite(window)
  if (!document.querySelector('jeep-sqlite')) {
    const jeepSqlite = document.createElement('jeep-sqlite')
    jeepSqlite.setAttribute('autoSave', 'true')
    jeepSqlite.setAttribute('wasmPath', '/assets/wasm')
    document.body.appendChild(jeepSqlite)
  }
  await customElements.whenDefined('jeep-sqlite')
}

export function getDb() { return db }

export async function query(sql, values) {
  const res = await db.query(sql, values)
  return res.values || []
}

export async function run(sql, values) {
  const res = await db.run(sql, values)
  return res
}

export async function execute(sql) {
  return await db.execute(sql)
}

export async function closeDb() {
  if (db) { await db.close() }
  if (sqliteConn) { await sqliteConn.closeConnection('bimbar') }
}

async function createSchema() {
  await execute(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      salt TEXT NOT NULL,
      hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'gerente' CHECK(role IN ('admin','gerente','caixa')),
      nome_completo TEXT,
      ativo INTEGER NOT NULL DEFAULT 1,
      token_version INTEGER NOT NULL DEFAULT 0,
      criado_em TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `)

  await execute(`
    CREATE TABLE IF NOT EXISTS dancarinas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT UNIQUE NOT NULL,
      telefone TEXT,
      ativa INTEGER NOT NULL DEFAULT 1,
      comissao REAL NOT NULL DEFAULT 0,
      comissao_percentual REAL NOT NULL DEFAULT 30,
      comissao_danca_percentual REAL NOT NULL DEFAULT 62.50,
      danca_30_nome TEXT DEFAULT '',
      danca_30_qty INTEGER DEFAULT 0,
      danca_30_valor REAL DEFAULT 160,
      danca_60_nome TEXT DEFAULT '',
      danca_60_qty INTEGER DEFAULT 0,
      danca_60_valor REAL DEFAULT 320,
      danca_3_nome TEXT DEFAULT '',
      danca_3_qty INTEGER DEFAULT 0,
      danca_3_valor REAL DEFAULT 0,
      danca_4_nome TEXT DEFAULT '',
      danca_4_qty INTEGER DEFAULT 0,
      danca_4_valor REAL DEFAULT 0,
      criado_em TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `)

  await execute(`
    CREATE TABLE IF NOT EXISTS funcionarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT UNIQUE NOT NULL,
      cargo TEXT,
      telefone TEXT,
      ativo INTEGER NOT NULL DEFAULT 1,
      criado_em TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `)

  await execute(`
    CREATE TABLE IF NOT EXISTS caixa_diario (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      data TEXT UNIQUE NOT NULL,
      troco_inicial REAL NOT NULL DEFAULT 0,
      comanda_inicio INTEGER,
      comanda_fim INTEGER,
      total_comandas REAL NOT NULL DEFAULT 0,
      total_cartoes REAL NOT NULL DEFAULT 0,
      total_especies REAL NOT NULL DEFAULT 0,
      dinheiro_contado REAL,
      diferenca_caixa REAL,
      responsavel_fechamento TEXT,
      fechado_em TEXT,
      observacao TEXT,
      criado_por INTEGER REFERENCES usuarios(id),
      criado_em TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `)

  await execute(`
    CREATE TABLE IF NOT EXISTS caixa_saidas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      caixa_diario_id INTEGER NOT NULL REFERENCES caixa_diario(id),
      categoria TEXT NOT NULL CHECK(categoria IN ('UBER','PAGODE','GELO','CIGARRO','MERCADO','PAGAMENTOS','VALES_ESPECIES','VALES_BAR','FIADO','LAVANDERIAS','SEGURANCA','SHOW','OUTROS')),
      valor REAL NOT NULL,
      descricao TEXT,
      cancelada INTEGER NOT NULL DEFAULT 0,
      motivo_cancelamento TEXT,
      cancelada_em TEXT,
      criado_por INTEGER REFERENCES usuarios(id),
      criado_em TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `)

  await execute(`
    CREATE TABLE IF NOT EXISTS shows_controle (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      caixa_diario_id INTEGER NOT NULL REFERENCES caixa_diario(id),
      dancarina_id INTEGER REFERENCES dancarinas(id),
      numero_linha INTEGER CHECK(numero_linha BETWEEN 1 AND 23),
      valor_show REAL,
      quartos INTEGER DEFAULT 1,
      tempo TEXT,
      hora_entrada TEXT,
      hora_saida TEXT,
      tipo TEXT CHECK(tipo IN ('FX','FL')),
      cancelado INTEGER NOT NULL DEFAULT 0,
      motivo_cancelamento TEXT,
      cancelado_em TEXT,
      criado_por INTEGER REFERENCES usuarios(id),
      criado_em TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `)

  await execute(`
    CREATE TABLE IF NOT EXISTS show_dancas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      show_controle_id INTEGER NOT NULL REFERENCES shows_controle(id) ON DELETE CASCADE,
      dancarina_id INTEGER NOT NULL REFERENCES dancarinas(id) ON DELETE CASCADE,
      valor_danca REAL NOT NULL CHECK(valor_danca > 0),
      quartos INTEGER DEFAULT 1,
      hora_entrada TEXT,
      hora_saida TEXT,
      criado_em TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `)

  await execute(`
    CREATE TABLE IF NOT EXISTS vales (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tipo_pessoa TEXT NOT NULL CHECK(tipo_pessoa IN ('dancarina','funcionario')),
      pessoa_id INTEGER NOT NULL,
      valor REAL NOT NULL CHECK(valor > 0),
      descricao TEXT,
      pago INTEGER NOT NULL DEFAULT 0,
      data_valor TEXT NOT NULL DEFAULT (date('now')),
      cancelado INTEGER NOT NULL DEFAULT 0,
      motivo_cancelamento TEXT,
      cancelado_em TEXT,
      caixa_saida_id INTEGER REFERENCES caixa_saidas(id) ON DELETE SET NULL,
      criado_por INTEGER REFERENCES usuarios(id),
      criado_em TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `)

  await execute(`
    CREATE TABLE IF NOT EXISTS audit_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
      acao TEXT NOT NULL,
      tabela TEXT NOT NULL,
      registro_id INTEGER,
      dados_antigos TEXT,
      dados_novos TEXT,
      ip TEXT,
      user_agent TEXT,
      criado_em TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `)

  await execute(`
    CREATE TABLE IF NOT EXISTS schema_version (
      version INTEGER PRIMARY KEY,
      applied_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `)

  await execute(`
    CREATE TABLE IF NOT EXISTS config (
      chave TEXT PRIMARY KEY,
      valor TEXT NOT NULL
    )
  `)
}

async function ensureDeviceUuid() {
  const rows = await query("SELECT valor FROM config WHERE chave = 'device_uuid'")
  if (rows.length === 0) {
    const uuid = crypto.randomUUID()
    await run("INSERT INTO config (chave, valor) VALUES (?, ?)", ['device_uuid', uuid])
  }
}

export async function hashPassword(password) {
  const crypto = window.crypto
  const salt = Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map(b => b.toString(36).padStart(2, '0')).join('')
  const encoder = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey('raw', encoder.encode(password + salt), 'PBKDF2', false, ['deriveBits'])
  const hashBuffer = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: encoder.encode(salt), iterations: 100000, hash: 'SHA-256' }, keyMaterial, 256)
  const hash = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(36).padStart(2, '0')).join('')
  return { salt, hash }
}

export async function verifyPassword(password, salt, storedHash) {
  const encoder = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey('raw', encoder.encode(password + salt), 'PBKDF2', false, ['deriveBits'])
  const hashBuffer = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: encoder.encode(salt), iterations: 100000, hash: 'SHA-256' }, keyMaterial, 256)
  const hash = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(36).padStart(2, '0')).join('')
  return hash === storedHash
}

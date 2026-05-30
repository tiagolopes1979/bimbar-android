import express from 'express'
import Database from 'better-sqlite3'
import crypto from 'crypto'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'
import cors from 'cors'
import { createHash } from 'crypto'

// Carregar variáveis de ambiente seguras
const JWT_SECRET = process.env.JWT_SECRET
const LICENSE_SECRET = process.env.LICENSE_SECRET
const ADMIN_SECRET = process.env.ADMIN_SECRET
const ADMIN_TOKEN_HASH = process.env.ADMIN_TOKEN_HASH
const PORT = process.env.PORT || 3000
const DB_PATH = process.env.DB_PATH || 'licencas.db'

for (const [name, value, expectedLength] of [
  ['JWT_SECRET', JWT_SECRET, 128],
  ['LICENSE_SECRET', LICENSE_SECRET, 64],
  ['ADMIN_SECRET', ADMIN_SECRET, 64],
  ['ADMIN_TOKEN_HASH', ADMIN_TOKEN_HASH, 64]
]) {
  if (!value || value.length !== expectedLength || !/^[a-f0-9]+$/i.test(value)) {
    console.error(`${name} ausente ou inválido. Gere um .env seguro com node setup-env.js.`)
    process.exit(1)
  }
}

// Inicializar banco com criptografia
const db = new Database(DB_PATH)
db.pragma('journal_mode = WAL')
db.pragma('synchronous = FULL')

const LICENSE_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS licencas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    chave_hash TEXT UNIQUE NOT NULL,
    chave_iv TEXT NOT NULL,
    tipo TEXT NOT NULL CHECK(tipo IN ('trial','single','enterprise','custom')),
    email TEXT NOT NULL,
    dias INTEGER NOT NULL DEFAULT 0,
    exp_timestamp INTEGER,
    device_uuid TEXT,
    device_fingerprint TEXT,
    play_integrity_token TEXT,
    status TEXT NOT NULL DEFAULT 'disponivel' CHECK(status IN ('disponivel','ativa','bloqueada','expirada')),
    ativada_em TEXT,
    renovada_em TEXT,
    ultima_validacao TEXT,
    tentativas_falhas INTEGER DEFAULT 0,
    criado_em TEXT NOT NULL DEFAULT (datetime('now'))
  )
`

function tableColumns(tableName) {
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(tableName)) throw new Error('Invalid table name')
  return db.prepare(`PRAGMA table_info(${tableName})`).all().map(col => col.name)
}

function tableExists(tableName) {
  return db.prepare(`
    SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = ?
  `).get(tableName)
}

function migrateLegacyLicencasTable() {
  if (!tableExists('licencas')) return
  const cols = tableColumns('licencas')
  if (cols.includes('chave_hash')) return
  if (!cols.includes('chave')) {
    throw new Error('Tabela licencas incompatível: coluna chave_hash ausente')
  }

  const legacyName = `licencas_legacy_${Date.now()}`
  db.exec(`ALTER TABLE licencas RENAME TO ${legacyName}`)
  db.exec(LICENSE_TABLE_SQL)

  const legacyRows = db.prepare(`SELECT * FROM ${legacyName}`).all()
  const insert = db.prepare(`
    INSERT OR IGNORE INTO licencas (
      chave_hash, chave_iv, tipo, email, dias, exp_timestamp, device_uuid,
      status, ativada_em, ultima_validacao, criado_em
    )
    VALUES (?, '', ?, ?, ?, NULL, ?, ?, ?, ?, ?)
  `)

  const tx = db.transaction(rows => {
    for (const row of rows) {
      insert.run(
        hashKey(row.chave),
        row.tipo || 'single',
        row.email || 'legacy@example.local',
        Number(row.dias || 0),
        row.device_uuid || null,
        row.status || 'disponivel',
        row.ativada_em || null,
        row.renovada_em || row.ativada_em || null,
        row.criada_em || row.criado_em || new Date().toISOString()
      )
    }
  })
  tx(legacyRows)
  console.log(`Migração concluída: ${legacyRows.length} licença(s) migrada(s) de ${legacyName}`)
}

migrateLegacyLicencasTable()

// Criar tabelas seguras
db.exec(LICENSE_TABLE_SQL)

db.exec(`
  CREATE TABLE IF NOT EXISTS audit_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ip TEXT,
    user_agent TEXT,
    acao TEXT NOT NULL,
    detalhes TEXT,
    criado_em TEXT NOT NULL DEFAULT (datetime('now'))
  )
`)

db.exec(`
  CREATE TABLE IF NOT EXISTS session_tokens (
    token_hash TEXT PRIMARY KEY,
    licenca_id INTEGER NOT NULL REFERENCES licencas(id) ON DELETE CASCADE,
    device_uuid TEXT NOT NULL,
    exp INTEGER NOT NULL,
    criado_em TEXT NOT NULL DEFAULT (datetime('now'))
  )
`)

db.exec(`CREATE INDEX IF NOT EXISTS idx_chave_hash ON licencas(chave_hash)`)
db.exec(`CREATE INDEX IF NOT EXISTS idx_status ON licencas(status)`)
db.exec(`CREATE INDEX IF NOT EXISTS idx_session_tokens_licenca ON session_tokens(licenca_id)`)

// Criar tabela de validações únicas (uma vez por dispositivo)
db.exec(`
  CREATE TABLE IF NOT EXISTS validacoes_dispositivo (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    licenca_id INTEGER NOT NULL REFERENCES licencas(id),
    device_uuid TEXT NOT NULL,
    device_fingerprint TEXT NOT NULL,
    validado_em TEXT NOT NULL DEFAULT (datetime('now')),
    ip TEXT,
    user_agent TEXT,
    UNIQUE(licenca_id, device_uuid)
  )
`)
db.exec(`CREATE INDEX IF NOT EXISTS idx_validacoes_licenca ON validacoes_dispositivo(licenca_id)`)
db.exec(`CREATE INDEX IF NOT EXISTS idx_validacoes_device ON validacoes_dispositivo(device_uuid)`)

// Funções de criptografia AES-256-GCM
function encrypt(text) {
  const iv = crypto.randomBytes(16)
  const key = Buffer.from(LICENSE_SECRET.slice(0, 64), 'hex')
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)
  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  const authTag = cipher.getAuthTag()
  return {
    iv: iv.toString('hex'),
    encrypted,
    authTag: authTag.toString('hex')
  }
}

function decrypt(encryptedData) {
  const key = Buffer.from(LICENSE_SECRET.slice(0, 64), 'hex')
  const iv = Buffer.from(encryptedData.iv, 'hex')
  const authTag = Buffer.from(encryptedData.authTag, 'hex')
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv)
  decipher.setAuthTag(authTag)
  let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  return decrypted
}

function normalizeActivationKey(chave) {
  return String(chave || '').trim().toUpperCase()
}

function hashKey(chave) {
  return createHash('sha256').update(normalizeActivationKey(chave) + LICENSE_SECRET).digest('hex')
}

// Logging de segurança
function sanitizeUserAgent(ua) {
  return String(ua || '').replace(/[<>&'"]/g, '').slice(0, 500)
}

function logSecurity(ip, userAgent, acao, detalhes) {
  try {
    db.prepare(`
      INSERT INTO audit_log (ip, user_agent, acao, detalhes)
      VALUES (?, ?, ?, ?)
    `).run(ip, sanitizeUserAgent(userAgent), acao, JSON.stringify(detalhes))
  } catch (e) {
    console.error('Erro ao logar:', e)
  }
}

// Rate limiting agressivo
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100,
  message: { error: 'Muitas tentativas. Tente novamente mais tarde.' },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip
})

const strictLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 10,
  message: { error: 'Muitas tentativas falhas. Conta bloqueada temporariamente.' },
  standardHeaders: true,
  legacyHeaders: false
})

const adminLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 50,
  message: { error: 'Muitas requisições admin.' }
})

// Middleware de autenticação admin
function requireAdmin(req, res, next) {
  const auth = req.headers.authorization
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Autenticação necessária' })
  }
  
  const token = auth.slice(7)
  const expectedHash = createHash('sha256').update(token + ADMIN_SECRET).digest('hex')
  const configuredHash = Buffer.from(ADMIN_TOKEN_HASH, 'hex')
  const suppliedHash = Buffer.from(expectedHash, 'hex')
  
  // Comparação constante para timing attack
  const constantTime = configuredHash.length === suppliedHash.length &&
    crypto.timingSafeEqual(suppliedHash, configuredHash)
  
  if (!constantTime) {
    logSecurity(req.ip, req.get('user-agent'), 'admin_auth_failed', {})
    return res.status(401).json({ error: 'Autenticação inválida' })
  }
  
  next()
}

// Verificação de segurança do dispositivo
function verifyDeviceSecurity(deviceFingerprint, playIntegrityToken) {
  if (!deviceFingerprint) {
    return { valid: false, reason: 'Device fingerprint required' }
  }
  
  // Validar formato do fingerprint
  const fpPattern = /^[a-zA-Z0-9_-]{20,200}$/
  if (!fpPattern.test(deviceFingerprint)) {
    return { valid: false, reason: 'Invalid device fingerprint' }
  }
  
  // Se token de integrity for fornecido, validar (implementar com Google API)
  if (playIntegrityToken) {
    // Aqui você integraria com Google Play Integrity API
    // Por enquanto, validamos formato básico
    const tokenPattern = /^[a-zA-Z0-9_-]{100,5000}$/
    if (!tokenPattern.test(playIntegrityToken)) {
      return { valid: false, reason: 'Invalid integrity token format' }
    }
  }
  
  return { valid: true }
}

// Gerar token JWT de sessão
function generateSessionToken(licencaData) {
  const sessionExp = licencaData.exp_timestamp ||
    Date.now() + Math.max(licencaData.dias || 30, 30) * 24 * 60 * 60 * 1000
  const payload = {
    licenca_id: licencaData.id,
    tipo: licencaData.tipo,
    exp: sessionExp,
    iat: Date.now()
  }
  
  const token = crypto.randomBytes(32).toString('hex')
  const tokenHash = createHash('sha256').update(token + JWT_SECRET).digest('hex')
  
  return { token, tokenHash, exp: payload.exp }
}

function storeSessionToken(licencaId, deviceUuid, sessionToken) {
  db.prepare(`
    INSERT OR REPLACE INTO session_tokens (token_hash, licenca_id, device_uuid, exp)
    VALUES (?, ?, ?, ?)
  `).run(sessionToken.tokenHash, licencaId, deviceUuid, sessionToken.exp)
}

// App Express
const app = express()

// Segurança com Helmet
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'none'"],
      scriptSrc: ["'none'"],
      styleSrc: ["'none'"],
      imgSrc: ["'none'"],
      connectSrc: ["'self'"],
      fontSrc: ["'none'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'none'"],
      frameSrc: ["'none'"],
      formAction: ["'none'"],
    }
  },
  crossOriginEmbedderPolicy: true,
  crossOriginOpenerPolicy: true,
  crossOriginResourcePolicy: { policy: "same-site" },
  dnsPrefetchControl: { allow: false },
  frameguard: { action: 'deny' },
  hidePoweredBy: true,
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  ieNoOpen: true,
  noSniff: true,
  originAgentCluster: true,
  permittedCrossDomainPolicies: { permittedPolicies: "none" },
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  xssFilter: true
}))

function isAllowedOrigin(origin) {
  if (!origin) return false
  if (process.env.ALLOWED_ORIGINS) {
    return process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim()).includes(origin)
  }
  return false // Negar todas origens por padrão

// CORS restrito
app.use(cors({
  origin(origin, callback) {
    if (isAllowedOrigin(origin)) return callback(null, true)
    return callback(null, false)
  },
  methods: ['POST', 'GET'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400
}))

// Body size limit
app.use(express.json({ limit: '1kb' }))

// Rate limiting global
app.use(limiter)

// Logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path} ${req.ip}`)
  next()
})

// Endpoint de ativação com proteção
app.post('/api/v2/ativar', strictLimiter, async (req, res) => {
  const { chave, device_uuid, device_fingerprint, play_integrity_token } = req.body
  const ip = req.ip
  const userAgent = req.get('user-agent')
  
  // Validação básica
  if (!chave || !device_uuid || !device_fingerprint) {
    logSecurity(ip, userAgent, 'ativacao_failed', { reason: 'missing_fields' })
    return res.status(400).json({ valido: false, motivo: 'Campos obrigatórios faltando' })
  }
  
  // Verificar segurança do dispositivo
  const securityCheck = verifyDeviceSecurity(device_fingerprint, play_integrity_token)
  if (!securityCheck.valid) {
    logSecurity(ip, userAgent, 'ativacao_failed', { reason: securityCheck.reason })
    return res.status(400).json({ valido: false, motivo: securityCheck.reason })
  }
  
  // Hash da chave para não armazenar texto puro
  const chaveHash = hashKey(chave)
  
  try {
    // Verificar se chave existe
    const licenca = db.prepare('SELECT * FROM licencas WHERE chave_hash = ?').get(chaveHash)
    
    if (!licenca) {
      logSecurity(ip, userAgent, 'ativacao_failed', { reason: 'license_not_found' })
      return res.status(401).json({ valido: false, motivo: 'Chave de ativação inválida' })
    }
    
    // Verificar status
    if (licenca.status === 'bloqueada') {
      logSecurity(ip, userAgent, 'ativacao_failed', { reason: 'license_blocked', licenca_id: licenca.id })
      return res.status(401).json({ valido: false, motivo: 'Chave de ativação inválida' })
    }
    
    if (licenca.status === 'expirada') {
      logSecurity(ip, userAgent, 'ativacao_failed', { reason: 'license_expired', licenca_id: licenca.id })
      return res.status(401).json({ valido: false, motivo: 'Chave de ativação inválida' })
    }
    
    // Verificar se já está ativa em outro dispositivo
    if (licenca.status === 'ativa' && licenca.device_uuid !== device_uuid) {
      db.prepare('UPDATE licencas SET tentativas_falhas = tentativas_falhas + 1 WHERE id = ?')
        .run(licenca.id)
      
      logSecurity(ip, userAgent, 'ativacao_conflict', { 
        licenca_id: licenca.id, 
        existing_device: licenca.device_uuid 
      })
      
      return res.status(401).json({ 
        valido: false, 
        motivo: 'Chave de ativação inválida'
      })
    }
    
    // Verificar limite de tentativas falhas
    if (licenca.tentativas_falhas >= 5) {
      logSecurity(ip, userAgent, 'ativacao_blocked', { licenca_id: licenca.id })
      return res.status(401).json({ 
        valido: false, 
        motivo: 'Chave de ativação inválida'
      })
    }
    
    // VERIFICAÇÃO DE VALIDAÇÃO ÚNICA POR DISPOSITIVO
    const validacaoExistente = db.prepare(`
      SELECT * FROM validacoes_dispositivo
      WHERE licenca_id = ? AND device_uuid = ?
    `).get(licenca.id, device_uuid)
    
    if (validacaoExistente) {
      // Mesma licença + mesmo dispositivo = REATIVAÇÃO (permitido)
      logSecurity(ip, userAgent, 'reativacao_success', { 
        licenca_id: licenca.id,
        device_uuid: device_uuid.slice(0, 8) + '...',
        motivo: 'Reativação no mesmo dispositivo'
      })
      
      // Atualizar licença
      const now = new Date().toISOString()
      const exp_timestamp = licenca.dias > 0 ? Date.now() + (licenca.dias * 24 * 60 * 60 * 1000) : null
      
      db.prepare(`
        UPDATE licencas 
        SET status = 'ativa',
            device_uuid = ?,
            device_fingerprint = ?,
            play_integrity_token = ?,
            renovada_em = ?,
            tentativas_falhas = 0
        WHERE id = ?
      `).run(device_uuid, device_fingerprint, play_integrity_token || null, now, licenca.id)
      
      // Atualizar registro de validação
      db.prepare(`
        UPDATE validacoes_dispositivo
        SET validado_em = ?, ip = ?, user_agent = ?
        WHERE id = ?
      `).run(now, ip, userAgent, validacaoExistente.id)
      
      const sessionToken = generateSessionToken({
        id: licenca.id,
        tipo: licenca.tipo,
        exp_timestamp,
        dias: licenca.dias
      })
      storeSessionToken(licenca.id, device_uuid, sessionToken)
      
      return res.json({ 
        valido: true, 
        tipo: licenca.tipo,
        email: licenca.email,
        exp: exp_timestamp,
        session_token: sessionToken.token,
        session_exp: sessionToken.exp,
        reativacao: true,
        mensagem: 'Dispositivo reconhecido. Acesso reativado.'
      })
    }
    
    // Nova combinação licença + dispositivo
    // Verificar quantos dispositivos já usam esta licença
    const totalDispositivos = db.prepare(`
      SELECT COUNT(*) as count FROM validacoes_dispositivo
      WHERE licenca_id = ?
    `).get(licenca.id).count
    
    // Limite: 1 dispositivo por licença (Single)
    // Para Enterprise, pode ajustar conforme contrato
    const limiteDispositivos = licenca.tipo === 'enterprise' ? 10 : 1
    
    if (totalDispositivos >= limiteDispositivos) {
      logSecurity(ip, userAgent, 'ativacao_limit_reached', { 
        licenca_id: licenca.id,
        total_dispositivos: totalDispositivos,
        limite: limiteDispositivos
      })
      
      return res.status(401).json({ 
        valido: false, 
        motivo: 'Chave de ativação inválida'
      })
    }
    
    // Registrar nova validação única
    db.prepare(`
      INSERT INTO validacoes_dispositivo 
      (licenca_id, device_uuid, device_fingerprint, ip, user_agent)
      VALUES (?, ?, ?, ?, ?)
    `).run(licenca.id, device_uuid, device_fingerprint, ip, userAgent)
    
    // Atualizar licença
    const now = new Date().toISOString()
    const exp_timestamp = licenca.dias > 0 ? Date.now() + (licenca.dias * 24 * 60 * 60 * 1000) : null
    
    db.prepare(`
      UPDATE licencas 
      SET status = 'ativa',
          device_uuid = ?,
          device_fingerprint = ?,
          play_integrity_token = ?,
          ativada_em = ?,
          renovada_em = ?,
          tentativas_falhas = 0
      WHERE id = ?
    `).run(device_uuid, device_fingerprint, play_integrity_token || null, now, now, licenca.id)
    
    // Gerar token de sessão
    const sessionToken = generateSessionToken({
      id: licenca.id,
      tipo: licenca.tipo,
      exp_timestamp,
      dias: licenca.dias
    })
    storeSessionToken(licenca.id, device_uuid, sessionToken)
    
    logSecurity(ip, userAgent, 'ativacao_success', { 
      licenca_id: licenca.id,
      device_uuid: device_uuid.slice(0, 8) + '...'
    })
    
    res.json({ 
      valido: true, 
      tipo: licenca.tipo,
      email: licenca.email,
      exp: exp_timestamp,
      session_token: sessionToken.token,
      session_exp: sessionToken.exp
    })
    
  } catch (error) {
    console.error('Erro na ativação:', error)
    logSecurity(ip, userAgent, 'ativacao_error', { error: error.message })
    res.status(500).json({ valido: false, motivo: 'Erro interno do servidor' })
  }
})

// Endpoint de validação de sessão
app.post('/api/v2/validar', (req, res) => {
  const { session_token, device_uuid } = req.body
  
  if (!session_token || !device_uuid) {
    return res.status(400).json({ valido: false, motivo: 'Token e device_uuid necessários' })
  }
  
  const tokenHash = createHash('sha256').update(session_token + JWT_SECRET).digest('hex')
  
  // Buscar licença com token válido
  const licenca = db.prepare(`
    SELECT l.*, t.exp as token_exp
    FROM licencas l
    JOIN session_tokens t ON t.licenca_id = l.id
    WHERE l.device_uuid = ?
    AND t.device_uuid = ?
    AND t.token_hash = ?
    AND t.exp > ?
    AND l.status = 'ativa'
  `).get(device_uuid, device_uuid, tokenHash, Date.now())
  
  if (!licenca) {
    return res.json({ valido: false, motivo: 'Sessão inválida' })
  }
  
  // Verificar expiração
  if (licenca.exp_timestamp && Date.now() > licenca.exp_timestamp) {
    db.prepare("UPDATE licencas SET status = 'expirada' WHERE id = ?").run(licenca.id)
    return res.json({ valido: false, motivo: 'Licença expirada' })
  }
  
  // Atualizar ultima validação
  db.prepare("UPDATE licencas SET ultima_validacao = ? WHERE id = ?")
    .run(new Date().toISOString(), licenca.id)
  
  res.json({ 
    valido: true, 
    tipo: licenca.tipo,
    exp: licenca.exp_timestamp
  })
})

// Endpoint de status (consultar licença sem ativar)
app.get('/api/v2/status/:chave_hash', (req, res) => {
  const { chave_hash } = req.params
  
  if (!/^[a-f0-9]{64}$/.test(chave_hash)) {
    return res.status(400).json({ error: 'Hash inválido' })
  }
  
  const licenca = db.prepare('SELECT tipo, email, dias, status, exp_timestamp FROM licencas WHERE chave_hash = ?').get(chave_hash)
  
  if (!licenca) {
    return res.status(404).json({ error: 'Chave não encontrada' })
  }
  
  res.json({
    encontrado: true,
    tipo: licenca.tipo,
    status: licenca.status,
    exp: licenca.exp_timestamp
  })
})

// Admin endpoints com autenticação
app.post('/api/v2/admin/revisar', adminLimiter, requireAdmin, (req, res) => {
  const { chave, acao, motivo } = req.body
  const ip = req.ip
  
  if (!chave || !acao) {
    return res.status(400).json({ erro: 'chave e acao obrigatórios' })
  }
  
  if (!['bloquear', 'desbloquear', 'renovar'].includes(acao)) {
    return res.status(400).json({ erro: 'acao inválida' })
  }
  
  const chaveHash = hashKey(chave)
  const licenca = db.prepare('SELECT * FROM licencas WHERE chave_hash = ?').get(chaveHash)
  
  if (!licenca) {
    return res.status(404).json({ erro: 'Licença não encontrada' })
  }
  
  let updateQuery = ''
  let novoStatus = licenca.status
  
  switch (acao) {
    case 'bloquear':
      updateQuery = "UPDATE licencas SET status = 'bloqueada' WHERE id = ?"
      novoStatus = 'bloqueada'
      break
    case 'desbloquear':
      updateQuery = "UPDATE licencas SET status = 'disponivel', device_uuid = NULL WHERE id = ?"
      novoStatus = 'disponivel'
      break
    case 'renovar':
      updateQuery = "UPDATE licencas SET renovada_em = datetime('now'), tentativas_falhas = 0 WHERE id = ?"
      novoStatus = licenca.status
      break
  }
  
  db.prepare(updateQuery).run(licenca.id)
  
  logSecurity(ip, req.get('user-agent'), `admin_${acao}`, { 
    licenca_id: licenca.id,
    motivo: motivo || 'Sem motivo'
  })
  
  res.json({ ok: true, status: novoStatus })
})

app.get('/api/v2/admin/listar', adminLimiter, requireAdmin, (req, res) => {
  const { status, tipo, limit = 100, offset = 0 } = req.query
  
  let query = 'SELECT * FROM licencas WHERE 1=1'
  const params = []
  
  if (status) {
    query += ' AND status = ?'
    params.push(status)
  }
  
  if (tipo) {
    query += ' AND tipo = ?'
    params.push(tipo)
  }
  
  query += ' ORDER BY criado_em DESC LIMIT ? OFFSET ?'
  params.push(parseInt(limit), parseInt(offset))
  
  const licencas = db.prepare(query).all(...params)
  const total = db.prepare('SELECT COUNT(*) as count FROM licencas').get().count
  
  res.json({ licencas, total })
})

app.get('/api/v2/admin/audit-log', adminLimiter, requireAdmin, (req, res) => {
  const { limit = 100, acao } = req.query
  
  let query = 'SELECT * FROM audit_log WHERE 1=1'
  const params = []
  
  if (acao) {
    query += ' AND acao = ?'
    params.push(acao)
  }
  
  query += ' ORDER BY criado_em DESC LIMIT ?'
  params.push(parseInt(limit))
  
  const logs = db.prepare(query).all(...params)
  res.json(logs)
})

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err)
  res.status(500).json({ error: 'Internal server error' })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint não encontrado' })
})

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`✅ Servidor de licença v2 rodando em port ${PORT}`)
  console.log(`🔒 HTTPS apenas - Certificados exigidos`)
  console.log(`🛡️ Rate limiting ativo`)
  console.log(`📝 Audit logging ativo`)
  console.log(`\nEndpoints:`)
  console.log(`  POST /api/v2/ativar    — Ativação de licença`)
  console.log(`  POST /api/v2/validar   — Validação de sessão`)
  console.log(`  GET  /api/v2/status/:hash — Consultar status`)
  console.log(`  POST /api/v2/admin/revisar — Admin (autenticação necessária)`)
  console.log(`  GET  /api/v2/admin/listar — Listar licenças`)
  console.log(`  GET  /api/v2/admin/audit-log — Logs de segurança`)
})

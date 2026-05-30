#!/usr/bin/env node
/**
 * Gerador de Licenças Seguras - Bimbar
 * 
 * Uso:
 *   node generate-license.js --tipo single --email cliente@exemplo.com --dias 0
 * 
 * Variáveis de ambiente:
 *   LICENSE_SECRET=seu_secret_aqui
 */

import crypto from 'crypto'
import { existsSync, readFileSync } from 'fs'

function readEnvSecret(name) {
  if (process.env[name]) return process.env[name]
  for (const envPath of ['.env', './server/.env']) {
    if (!existsSync(envPath)) continue
    const line = readFileSync(envPath, 'utf8')
      .split('\n')
      .find(l => l.trim().startsWith(`${name}=`))
    if (line) return line.split('=').slice(1).join('=').trim()
  }
  return null
}

function requireHexSecret(name, expectedLength) {
  const value = readEnvSecret(name)
  if (!value || value.length !== expectedLength || !/^[a-f0-9]+$/i.test(value)) {
    console.error(`Erro: ${name} inválida. Gere um .env seguro com node setup-env.js.`)
    process.exit(1)
  }
  return value
}

function sqlString(value) {
  return `'${String(value).replaceAll("'", "''")}'`
}

function normalizeActivationKey(key) {
  return key.trim().toUpperCase()
}

const LICENSE_SECRET = requireHexSecret('LICENSE_SECRET', 64)

const args = process.argv.slice(2)
const tipo = args.find(a => a.startsWith('--tipo='))?.split('=')[1] || 'trial'
const email = args.find(a => a.startsWith('--email='))?.split('=')[1] || 'test@test.com'
const dias = parseInt(args.find(a => a.startsWith('--dias='))?.split('=')[1] || '0')

// Validar tipo
if (!['trial', 'single', 'enterprise', 'custom'].includes(tipo)) {
  console.error('Erro: tipo inválido. Use: trial, single, enterprise, custom')
  process.exit(1)
}

// Calcular expiração
const expTimestamp = dias > 0 ? Date.now() + (dias * 24 * 60 * 60 * 1000) : 0

// Dados da licença (não sensíveis, apenas para identificação)
const licenseData = {
  tipo,
  email,
  dias,
  exp_timestamp: expTimestamp,
  criado_em: new Date().toISOString(),
  uuid: crypto.randomUUID()
}

// Gerar hash único da licença usando HMAC
const licenseString = JSON.stringify(licenseData)
const hmac = crypto.createHmac('sha256', LICENSE_SECRET)
hmac.update(licenseString)
const signature = hmac.digest('hex')

// Chave única (UUID + assinatura parcial)
const activationKey = normalizeActivationKey(`BIMBAR-${licenseData.uuid.slice(0, 8)}-${signature.slice(0, 16)}`)

// Hash para armazenamento no banco
const hash = crypto.createHash('sha256')
  .update(activationKey + LICENSE_SECRET)
  .digest('hex')

console.log('=== LICENÇA GERADA ===')
console.log(`Tipo: ${tipo}`)
console.log(`Email: ${email}`)
console.log(`Dias: ${dias} ${dias === 0 ? '(vitalício)' : ''}`)
console.log(`\n--- Dados para banco de dados ---`)
console.log(`chave_hash: ${hash}`)
console.log(`\n--- Chave de ativação (entregar ao cliente) ---`)
console.log(activationKey)
console.log(`\n--- Informações adicionais ---`)
console.log(`UUID: ${licenseData.uuid}`)
console.log(`Expira: ${expTimestamp > 0 ? new Date(expTimestamp).toISOString() : 'Nunca'}`)
console.log(`\n--- Comando SQL para inserir ---`)
console.log(`INSERT INTO licencas (chave_hash, chave_iv, tipo, email, dias, exp_timestamp, status) VALUES (${sqlString(hash)}, '', ${sqlString(tipo)}, ${sqlString(email)}, ${dias}, ${expTimestamp > 0 ? expTimestamp : 'NULL'}, 'disponivel');`)

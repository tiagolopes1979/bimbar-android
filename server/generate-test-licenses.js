#!/usr/bin/env node
/**
 * Gerador de Licenças de Teste - Bimbar
 * 
 * Uso:
 *   node generate-test-licenses.js
 * 
 * Este script gera licenças de teste válidas para desenvolvimento.
 */

import crypto from 'crypto'
import { existsSync, readFileSync, writeFileSync } from 'fs'

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
    console.error(`❌ Erro: ${name} inválida`)
    console.error('   Gere um .env seguro com node setup-env.js')
    process.exit(1)
  }
  return value
}

function sqlString(value) {
  return `'${String(value).replaceAll("'", "''")}'`
}

const LICENSE_SECRET = requireHexSecret('LICENSE_SECRET', 64)

// Configurações das licenças de teste
const testLicenses = [
  { tipo: 'trial', email: 'trial7@bimbar.com.br', dias: 7, desc: 'Trial 7 dias' },
  { tipo: 'trial', email: 'trial30@bimbar.com.br', dias: 30, desc: 'Trial 30 dias' },
  { tipo: 'single', email: 'single@bimbar.com.br', dias: 0, desc: 'Single (vitalício)' },
  { tipo: 'enterprise', email: 'enterprise@bimbar.com.br', dias: 0, desc: 'Enterprise (ilimitado)' }
]

console.log('🔐 Gerando licenças de teste seguras...\n')

const output = []

for (const license of testLicenses) {
  // Gerar UUID único
  const uuid = crypto.randomUUID()
  
  // Dados da licença
  const licenseData = {
    tipo: license.tipo,
    email: license.email,
    dias: license.dias,
    exp_timestamp: license.dias > 0 ? Date.now() + (license.dias * 24 * 60 * 60 * 1000) : 0,
    criado_em: new Date().toISOString(),
    uuid: uuid
  }

  // Gerar assinatura HMAC
  const licenseString = JSON.stringify(licenseData)
  const hmac = crypto.createHmac('sha256', LICENSE_SECRET)
  hmac.update(licenseString)
  const signature = hmac.digest('hex')

  // Chave no formato BIMBAR-XXXX-XXXX-XXXX-XXXX
  const key = `BIMBAR-${uuid.slice(0, 8)}-${signature.slice(0, 16)}`
  
  // Hash para banco de dados
  const hash = crypto.createHash('sha256')
    .update(key + LICENSE_SECRET)
    .digest('hex')

  output.push({
    desc: license.desc,
    key: key,
    hash: hash,
    email: license.email,
    tipo: license.tipo,
    exp: license.dias > 0 ? new Date(licenseData.exp_timestamp).toISOString() : 'Nunca',
    sql: `INSERT INTO licencas (chave_hash, chave_iv, tipo, email, dias, exp_timestamp, status) VALUES (${sqlString(hash)}, '', ${sqlString(license.tipo)}, ${sqlString(license.email)}, ${license.dias}, ${license.dias > 0 ? licenseData.exp_timestamp : 'NULL'}, 'disponivel');`
  })

  console.log(`✅ ${license.desc}`)
  console.log(`   Chave: ${key}`)
  console.log(`   Email: ${license.email}`)
  console.log(`   Expira: ${output[output.length - 1].exp}`)
  console.log()
}

// Escrever em arquivo
const outputFile = 'test-licenses.txt'
const content = `=== LICENÇAS DE TESTE BIMBAR ===
Gerado em: ${new Date().toISOString()}
⚠️  GUARDE COM SEGURANÇA - NÃO COMMITAR NO GIT

${output.map((l, i) => `
--- Licença ${i + 1}: ${l.desc} ---
Chave: ${l.key}
Email: ${l.email}
Tipo: ${l.tipo}
Expira: ${l.exp}

--- SQL para inserir no banco ---
${l.sql}
`).join('\n')}

=== COMANDOS RÁPIDOS ===
# Inserir todas as licenças:
${output.map(l => `echo "${l.sql}" | sqlite3 licencas.db`).join('\n')}
`

writeFileSync(outputFile, content)
console.log(`\n📝 Licenças salvas em: ${outputFile}`)
console.log(`📝 Hash das licenças também salvas para referência`)

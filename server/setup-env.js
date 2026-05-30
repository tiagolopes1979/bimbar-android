#!/usr/bin/env node
/**
 * Script para criar .env seguro
 */

import crypto from 'crypto'
import { existsSync, writeFileSync } from 'fs'

if (existsSync('.env')) {
  console.error('Arquivo .env já existe. Mova ou remova o arquivo atual antes de gerar outro.')
  process.exit(1)
}

console.log('Gerando chaves seguras...\n')

// Gerar LICENSE_SECRET (32 bytes = 64 hex chars)
const LICENSE_SECRET = crypto.randomBytes(32).toString('hex')

// Gerar JWT_SECRET (64 bytes = 128 hex chars)
const JWT_SECRET = crypto.randomBytes(64).toString('hex')

// Gerar ADMIN_SECRET (32 bytes = 64 hex chars)
const ADMIN_SECRET = crypto.randomBytes(32).toString('hex')

// Gerar ADMIN_TOKEN (será hashado)
const ADMIN_TOKEN = crypto.randomBytes(32).toString('hex')
const ADMIN_TOKEN_HASH = crypto.createHash('sha256').update(ADMIN_TOKEN + ADMIN_SECRET).digest('hex')

// Escrever no .env
const envContent = `# Gerado automaticamente - NUNCA compartilhe
LICENSE_SECRET=${LICENSE_SECRET}
JWT_SECRET=${JWT_SECRET}
ADMIN_SECRET=${ADMIN_SECRET}
ADMIN_TOKEN_HASH=${ADMIN_TOKEN_HASH}
PORT=3000
NODE_ENV=production
`

writeFileSync('.env', envContent, { mode: 0o600, flag: 'wx' })
console.log('\n✅ Arquivo .env criado com sucesso!')
console.log(`⚠️  GUARDE O ADMIN_TOKEN: ${ADMIN_TOKEN}`)
console.log('   Ele será usado para autenticação admin na API')
console.log('   As demais secrets foram salvas somente no .env local.')

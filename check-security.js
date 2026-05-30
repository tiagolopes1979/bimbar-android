#!/usr/bin/env node
/**
 * Verificador de Segurança - Bimbar
 * 
 * Executa verificações automáticas de segurança
 * Uso: node check-security.js
 */

import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

const ROOT = process.cwd()
let errors = 0
let warnings = 0
let passed = 0

function check(name, condition, message, level = 'error') {
  if (condition) {
    console.log(`✅ ${name}`)
    passed++
  } else {
    if (level === 'error') {
      console.error(`❌ ${name}`)
      console.error(`   ${message}`)
      errors++
    } else {
      console.warn(`⚠️  ${name}`)
      console.warn(`   ${message}`)
      warnings++
    }
  }
}

function readIfExists(path) {
  return existsSync(path) ? readFileSync(path, 'utf8') : ''
}

function noneContain(files, pattern) {
  return files.every(file => !readIfExists(join(ROOT, file)).match(pattern))
}

console.log('🔒 Verificação de Segurança Bimbar\n')
console.log('='.repeat(50))

// 1. Verificar arquivos sensíveis no git
console.log('\n📁 Arquivos Sensíveis')
check(
  '.env não commitado',
  !existsSync(join(ROOT, 'server', '.env')) || 
    readFileSync(join(ROOT, 'server', '.env'), 'utf8').includes('seu_secret'),
  'Arquivo .env deve ser criado manualmente, não commitado'
)

check(
  'test-licenses.txt não commitado',
  !existsSync(join(ROOT, 'test-licenses.txt')),
  'Licenças de teste não devem ser commitadas'
)

check(
  '*.keystore não commitado',
  !existsSync(join(ROOT, 'android', 'app', 'bimbar-release.keystore')) && 
  !existsSync(join(ROOT, 'android', 'app', 'bimbar-release.jks')),
  'Keystore não deve ser commitado',
  'error'
)

// 2. Verificar build.gradle
console.log('\n🏗️  Build Configuration')
const buildGradle = readFileSync(join(ROOT, 'android', 'app', 'build.gradle'), 'utf8')

check(
  'Sem senhas hardcoded',
  !buildGradle.includes("'bimbar123'") && !buildGradle.match(/storePassword\s+['"][^'"]+['"]/),
  'Senhas não devem estar hardcoded no build.gradle',
  'error'
)

check(
  'Usando variáveis de ambiente',
  buildGradle.includes('System.getenv(') || buildGradle.includes('System.getenv()'),
  'Deve usar System.getenv() para senhas',
  'error'
)

check(
  'ProGuard habilitado',
  buildGradle.includes('minifyEnabled true'),
  'ProGuard deve estar habilitado em release',
  'error'
)

check(
  'ShrinkResources habilitado',
  buildGradle.includes('shrinkResources true'),
  'ShrinkResources deve estar habilitado',
  'warning'
)

// 3. Verificar AndroidManifest
console.log('\n📱 Android Manifest')
const manifest = readFileSync(join(ROOT, 'android', 'app', 'src', 'main', 'AndroidManifest.xml'), 'utf8')

check(
  'Backup desabilitado',
  manifest.includes('allowBackup="false"'),
  'android:allowBackup deve ser false',
  'error'
)

check(
  'Network Security Config',
  manifest.includes('networkSecurityConfig'),
  'Deve ter networkSecurityConfig definido',
  'error'
)

// 4. Verificar source code
console.log('\n💻 Source Code')
const licenseJs = readFileSync(join(ROOT, 'src', 'lib', 'license.js'), 'utf8')
const databaseJs = readFileSync(join(ROOT, 'src', 'lib', 'database.js'), 'utf8')
const appBundleFiles = [
  'www/app.bundle.js',
  'android/app/src/main/assets/public/app.bundle.js'
]

check(
  'Sem SECRET no license.js',
  !licenseJs.match(/const\s+SECRET\s*=\s*['"`][^'"`]{10,}/),
  'SECRET key não deve estar no client-side',
  'error'
)

check(
  'Sem segredos legados no código fonte',
  noneContain([
    'src/lib/license.js',
    'src/app.js',
    'src/lib/database.js',
    'tools/genkey.cjs',
    'server/seed.js'
  ], /password\s*=\s*['"][^'"]{3,}['"]/i),
  'Possível senha hardcoded encontrada em fonte',
  'error'
)

check(
  'Sem senha padrão admin/admin',
  !databaseJs.includes("encode('admin' + salt)") &&
    !databaseJs.includes('encode("admin" + salt)') &&
    noneContain(appBundleFiles, /encode\(["']admin["']\s*\+\s*salt\)/),
  'O app não deve criar usuário admin com senha admin',
  'error'
)

check(
  'Usando HTTPS',
  licenseJs.includes('https://') || licenseJs.match(/https?:\/\/\+/),
  'Deve usar HTTPS para conexões',
  'warning'
)

// 5. Verificar database
console.log('\n🗄️  Database')

check(
  'Criptografia habilitada',
  databaseJs.includes('true') && databaseJs.includes('AES-256'),
  'Criptografia deve estar habilitada no SQLite',
  'error'
)

check(
  'Prepared statements',
  databaseJs.includes('query(') && databaseJs.includes('run('),
  'Deve usar prepared statements',
  'warning'
)

// 6. Verificar servidor
console.log('\n🖥️  Server')
const serverIndex = readFileSync(join(ROOT, 'server', 'index.js'), 'utf8')
const generateLicense = readIfExists(join(ROOT, 'server', 'generate-license.js'))
const generateTestLicenses = readIfExists(join(ROOT, 'server', 'generate-test-licenses.js'))
const setupEnv = readIfExists(join(ROOT, 'server', 'setup-env.js'))

check(
  'Rate limiting',
  serverIndex.includes('rateLimit') || serverIndex.includes('express-rate-limit'),
  'Rate limiting deve estar implementado',
  'error'
)

check(
  'Helmet security',
  serverIndex.includes('helmet'),
  'Helmet deve estar implementado',
  'warning'
)

check(
  'Admin authentication',
  serverIndex.includes('requireAdmin') || serverIndex.includes('requireAdmin'),
  'Endpoints admin devem ter autenticação',
  'error'
)

check(
  'Secrets obrigatórias no servidor',
  !serverIndex.includes('|| crypto.randomBytes') &&
    serverIndex.includes('process.exit(1)'),
  'Servidor não deve gerar secrets aleatórias silenciosamente em runtime',
  'error'
)

check(
  'Session token persistido e validado',
  serverIndex.includes('CREATE TABLE IF NOT EXISTS session_tokens') &&
    serverIndex.includes('storeSessionToken') &&
    serverIndex.includes('JOIN session_tokens'),
  'Token de sessão precisa ser armazenado e validado, não apenas calculado',
  'error'
)

check(
  'Login exige licença ativa',
  readIfExists(join(ROOT, 'src', 'app.js')).includes('Ative sua licença antes de entrar') &&
    readIfExists(join(ROOT, 'src', 'app.js')).includes('await isAtivado()'),
  'Login não deve ser possível antes da ativação da licença',
  'error'
)

check(
  'Chave de ativação normalizada no servidor',
  serverIndex.includes('normalizeActivationKey') &&
    serverIndex.includes('trim().toUpperCase()'),
  'Servidor deve normalizar a chave antes de gerar chave_hash',
  'error'
)

check(
  'Geradores usam LICENSE_SECRET forte',
  generateLicense.includes("requireHexSecret('LICENSE_SECRET', 64)") &&
    generateTestLicenses.includes("requireHexSecret('LICENSE_SECRET', 64)") &&
    !generateLicense.includes('length < 32') &&
    !generateTestLicenses.includes('length < 32'),
  'Geradores devem exigir LICENSE_SECRET hex de 64 caracteres',
  'error'
)

check(
  'Gerador hasheia chave completa',
  generateLicense.includes('update(activationKey + LICENSE_SECRET)') &&
    generateTestLicenses.includes('update(key + LICENSE_SECRET)'),
  'Hash salvo precisa usar a mesma chave que o cliente envia ao servidor',
  'error'
)

check(
  'setup-env não sobrescreve .env',
  setupEnv.includes("existsSync('.env')") &&
    setupEnv.includes("flag: 'wx'") &&
    setupEnv.includes('mode: 0o600'),
  'setup-env deve evitar sobrescrever secrets e criar .env com permissão restrita',
  'error'
)

check(
  'HTTPS enforcement',
  serverIndex.includes('cleartextTrafficPermitted="false"') || 
    manifest.includes('usesCleartextTraffic="false"'),
  'HTTPS deve ser obrigatório no AndroidManifest',
  'warning'
)

check(
  'Audit logging',
  serverIndex.includes('audit_log') || serverIndex.includes('logSecurity'),
  'Audit logging deve estar implementado',
  'warning'
)

// 7. Verificar .gitignore
console.log('\n🚫 Git Ignore')
const gitignore = readFileSync(join(ROOT, '.gitignore'), 'utf8')

check(
  '.env no gitignore',
  gitignore.includes('.env'),
  '.env deve estar no .gitignore',
  'error'
)

check(
  '*.keystore no gitignore',
  gitignore.includes('.keystore') || gitignore.includes('.jks'),
  'Keystores devem estar no .gitignore',
  'error'
)

check(
  'test-licenses.txt no gitignore',
  gitignore.includes('test-licenses'),
  'test-licenses.txt deve estar no .gitignore',
  'warning'
)

// 8. Verificar documentação
console.log('\n📚 Documentação')
check(
  'SECURITY.md existe',
  existsSync(join(ROOT, 'SECURITY.md')),
  'Deve ter SECURITY.md',
  'warning'
)

check(
  'IMPLEMENTATION.md existe',
  existsSync(join(ROOT, 'IMPLEMENTATION.md')),
  'Deve ter IMPLEMENTATION.md',
  'warning'
)

// Resumo
console.log('\n' + '='.repeat(50))
console.log('\n📊 Resumo')
console.log(`✅ Passou: ${passed}`)
console.log(`❌ Erros: ${errors}`)
console.log(`⚠️  Avisos: ${warnings}`)

if (errors > 0) {
  console.log('\n❌ Verificação FAILED - Corrija os erros acima')
  process.exit(1)
} else if (warnings > 0) {
  console.log('\n⚠️  Verificação PASSED com avisos - Revise os avisos')
  process.exit(0)
} else {
  console.log('\n✅ Verificação PASSED - Tudo OK!')
  process.exit(0)
}

const crypto = require('crypto')

const SECRET = process.env.LICENSE_SECRET || 'bimbar-license-secret-change-in-production-2025'

function gerarChave(tipo, email, dias) {
  const payload = `${tipo}|${email}|${dias}`
  const exp = dias > 0 ? Date.now() + dias * 86400000 : 0
  const data = `${payload}|${exp}`
  const hmac = crypto.createHmac('sha256', SECRET).update(data).digest('hex').substring(0, 16).toUpperCase()
  const raw = `${tipo}|${email}|${exp}|${hmac}`
  const key = 'BIMBAR-' + Buffer.from(raw).toString('base64').replace(/=/g, '').substring(0, 32)
                   .match(/.{1,8}/g).join('-')
  return key
}

function validarChave(key) {
  try {
    const clean = key.replace(/^BIMBAR-/, '').replace(/-/g, '')
    const decoded = Buffer.from(clean, 'base64').toString('utf-8')
    const parts = decoded.split('|')
    if (parts.length !== 4) return { valido: false, motivo: 'Formato inválido' }

    const [tipo, email, expStr, hmac] = parts
    const data = `${tipo}|${email}|${expStr}`
    const expectedHmac = crypto.createHmac('sha256', SECRET).update(data).digest('hex').substring(0, 16).toUpperCase()

    if (hmac !== expectedHmac) return { valido: false, motivo: 'Chave inválida' }

    const exp = parseInt(expStr)
    if (exp > 0 && Date.now() > exp) return { valido: false, motivo: 'Licença expirada' }

    const tipoLabel = { single: 'Perpétua (dispositivo único)', enterprise: 'Enterprise (ilimitado)', trial: 'Trial' }
    return { valido: true, tipo, email, exp: exp > 0 ? new Date(exp).toISOString() : null, tipoLabel: tipoLabel[tipo] || tipo }
  } catch {
    return { valido: false, motivo: 'Chave inválida' }
  }
}

// Modo CLI
const [,, cmd, ...args] = process.argv
if (cmd === 'gerar') {
  const [tipo = 'single', email = 'cliente@email.com', dias = '0'] = args
  console.log('Chave gerada:', gerarChave(tipo, email, parseInt(dias)))
  console.log('Tipo:', tipo, '| Email:', email, '| Dias:', dias || 'perpétuo')
} else if (cmd === 'validar') {
  const key = args[0]
  if (!key) { console.log('Uso: node genkey.js validar <chave>'); process.exit(1) }
  const res = validarChave(key)
  console.log(JSON.stringify(res, null, 2))
} else {
  console.log('Uso:')
  console.log('  node tools/genkey.js gerar <tipo> <email> <dias>')
  console.log('  node tools/genkey.js validar <chave>')
  console.log('')
  console.log('  Tipos: single (perpétua), enterprise (ilimitada), trial (avaliação)')
  console.log('  Dias: 0 = perpétuo, >0 = expira em N dias')
}

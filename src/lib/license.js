const SECRET = new TextEncoder().encode('bimbar-license-secret-change-in-production-2025')

export async function validarChave(key) {
  try {
    const clean = key.replace(/^BIMBAR-/i, '').replace(/-/g, '')
    const decoded = atob(clean)
    const parts = decoded.split('|')
    if (parts.length !== 4) return { valido: false, motivo: 'Formato inválido' }

    const [tipo, email, expStr, hmacEsperado] = parts
    const data = `${tipo}|${email}|${expStr}`

    const keyMaterial = await crypto.subtle.importKey('raw', SECRET, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
    const signature = await crypto.subtle.sign('HMAC', keyMaterial, new TextEncoder().encode(data))
    const hmacGerado = Array.from(new Uint8Array(signature)).slice(0, 16).map(b => b.toString(16).padStart(2, '0').toUpperCase()).join('')

    if (hmacGerado !== hmacEsperado) return { valido: false, motivo: 'Chave inválida' }

    const exp = parseInt(expStr)
    if (exp > 0 && Date.now() > exp) return { valido: false, motivo: 'Licença expirada' }

    const tipoLabel = { single: 'Perpétua (1 dispositivo)', enterprise: 'Enterprise (ilimitado)', trial: 'Trial' }
    return { valido: true, tipo, email, exp: exp > 0 ? new Date(exp).toISOString() : null, tipoLabel: tipoLabel[tipo] || tipo }
  } catch (e) {
    return { valido: false, motivo: 'Chave inválida: ' + e.message }
  }
}

export async function isAtivado(db) {
  const rows = await db.query('SELECT valor FROM config WHERE chave = ?', ['license_key'])
  if (rows.length === 0) return false
  const result = await validarChave(rows[0].valor)
  return result.valido
}

import { query, run } from './database.js'

// Configuração do servidor
const DEFAULT_SERVER_URL = 'https://api.bimbar.com.br' // Substitua pela sua URL

export async function getServerUrl() {
  const rows = await query("SELECT valor FROM config WHERE chave = 'server_url'")
  return rows.length > 0 ? rows[0].valor : DEFAULT_SERVER_URL
}

export async function setServerUrl(url) {
  const val = url.trim()
  // Validar HTTPS obrigatório
  const isLocalDev = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?(\/.*)?$/i.test(val)
  if (val && !/^https:\/\/.+/i.test(val) && !isLocalDev) {
    throw new Error('URL deve usar HTTPS para segurança')
  }
  await run('INSERT OR REPLACE INTO config (chave, valor) VALUES (?, ?)', ['server_url', val || DEFAULT_SERVER_URL])
}

export async function testarConexaoServidor() {
  const url = await getServerUrl()
  try {
    const res = await fetch(`${url}/health`, { 
      method: 'GET', 
      signal: AbortSignal.timeout(5000) 
    })
    if (!res.ok) return { ok: false, motivo: `Servidor respondeu com status ${res.status}` }
    return { ok: true, motivo: `Conectado a ${url}` }
  } catch (e) {
    return { ok: false, motivo: e.name === 'TimeoutError' ? 'Tempo limite excedido (5s)' : `Sem conexão: ${e.message}` }
  }
}

/**
 * Valida licença no servidor (SEM secret no client)
 * @returns {Promise<{valido: boolean, tipo?: string, exp?: number, session_token?: string, motivo?: string}>}
 */
export async function validarChave(chave) {
  try {
    const url = await getServerUrl()
    const normalizedKey = chave.trim().toUpperCase()
    
    // Obter fingerprint do dispositivo
    const deviceFingerprint = await gerarDeviceFingerprint()
    
    const res = await fetch(`${url}/api/v2/ativar`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'User-Agent': navigator.userAgent
      },
      body: JSON.stringify({
        chave: normalizedKey,
        device_uuid: await getDeviceUuid(),
        device_fingerprint: deviceFingerprint,
        play_integrity_token: null // Implementar Play Integrity quando disponível
      }),
      signal: AbortSignal.timeout(10000)
    })

    const data = await res.json()
    
    if (!data.valido) {
      return { valido: false, motivo: data.motivo || 'Erro na validação' }
    }

    // Salvar token de sessão
    if (data.session_token) {
      await run("INSERT OR REPLACE INTO config (chave, valor) VALUES (?, ?)", 
        ['session_token', data.session_token])
      await run("INSERT OR REPLACE INTO config (chave, valor) VALUES (?, ?)", 
        ['session_exp', data.session_exp || ''])
      await run("INSERT OR REPLACE INTO config (chave, valor) VALUES (?, ?)", 
        ['license_origin', 'server'])
    }

    return {
      valido: true,
      tipo: data.tipo,
      email: data.email,
      exp: data.exp,
      tipoLabel: getTipoLabel(data.tipo)
    }
  } catch (e) {
    console.error('Erro na validação:', e)
    return { valido: false, motivo: 'Erro de conexão com servidor: ' + e.message }
  }
}

/**
 * Valida sessão local (offline mode com token)
 */
export async function validarSessao() {
  try {
    const tokenRows = await query("SELECT valor FROM config WHERE chave = 'session_token'")
    if (tokenRows.length === 0) return { valido: false, motivo: 'Nenhuma sessão ativa' }
    
    const sessionToken = tokenRows[0].valor
    
    const expRows = await query("SELECT valor FROM config WHERE chave = 'session_exp'")
    const exp = expRows.length > 0 ? parseInt(expRows[0].valor) : null
    
    // Verificar expiração
    if (exp && Date.now() > exp) {
      await run("DELETE FROM config WHERE chave IN ('session_token', 'session_exp')")
      return { valido: false, motivo: 'Sessão expirada' }
    }
    
    // Validar com servidor se houver conexão
    const url = await getServerUrl()
    try {
      const res = await fetch(`${url}/api/v2/validar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_token: sessionToken,
          device_uuid: await getDeviceUuid()
        }),
        signal: AbortSignal.timeout(5000)
      })
      
      const data = await res.json()
      if (!data.valido) {
        await run("DELETE FROM config WHERE chave IN ('session_token', 'session_exp')")
        return { valido: false, motivo: data.motivo }
      }
      
      return {
        valido: true,
        tipo: data.tipo,
        exp: data.exp
      }
    } catch {
      // Offline - validar localmente apenas expiração
      return {
        valido: true,
        tipo: 'offline',
        exp: exp
      }
    }
  } catch (e) {
    return { valido: false, motivo: e.message }
  }
}

async function getDeviceUuid() {
  const rows = await query("SELECT valor FROM config WHERE chave = 'device_uuid'")
  if (rows.length > 0) return rows[0].valor
  
  const uuid = crypto.randomUUID()
  await run("INSERT INTO config (chave, valor) VALUES (?, ?)", ['device_uuid', uuid])
  return uuid
}

async function gerarDeviceFingerprint() {
  // Gerar fingerprint único baseado em características do dispositivo
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  ctx.textBaseline = 'top'
  ctx.font = '14px Arial'
  ctx.fillText('fingerprint', 2, 2)
  const canvasData = canvas.toDataURL()
  
  const fingerprint = {
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    screenResolution: `${screen.width}x${screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    canvas: canvasData.slice(-50) // Últimos 50 chars do hash
  }
  
  // Criar hash do fingerprint
  const str = JSON.stringify(fingerprint)
  const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str))
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  
  return hash.slice(0, 64)
}

function getTipoLabel(tipo) {
  const labels = {
    trial: 'Trial',
    single: 'Perpétua (1 dispositivo)',
    enterprise: 'Enterprise (ilimitado)',
    custom: 'Personalizado'
  }
  return labels[tipo] || tipo
}

/**
 * Verifica se o app está ativado (valida licença ou sessão)
 */
export async function isAtivado() {
  // Primeiro tentar validar sessão
  const sessao = await validarSessao()
  if (sessao.valido) return true
  
  // Se não tiver sessão, verificar se há chave salva
  const keyRows = await query("SELECT valor FROM config WHERE chave = 'license_key'")
  if (keyRows.length === 0) return false
  
  // Tentar validar chave no servidor
  const result = await validarChave(keyRows[0].valor)
  return result.valido
}

/**
 * Ativa nova chave
 */
export async function ativarChave(key) {
  const normalizedKey = key.trim().toUpperCase()
  // Salvar chave temporariamente
  await run("INSERT OR REPLACE INTO config (chave, valor) VALUES (?, ?)", ['license_key', normalizedKey])
  
  // Validar no servidor
  const result = await validarChave(normalizedKey)
  
  if (!result.valido) {
    await run("DELETE FROM config WHERE chave = 'license_key'")
    return result
  }
  
  return result
}

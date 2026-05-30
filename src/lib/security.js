import { Capacitor } from '@capacitor/core'

/**
 * Root/Jailbreak Detection para Android/iOS
 * Retorna true se o dispositivo estiver comprometido
 */
export async function isDeviceCompromised() {
  if (Capacitor.getPlatform() !== 'android') {
    return false // Apenas Android tem detecção robusta
  }

  try {
    // Verificar via WebView/JavaScript
    const indicators = await checkDeviceIndicators()
    return indicators.isCompromised
  } catch (e) {
    console.error('Erro na detecção de root:', e)
    return false // Falha segura: não bloquear se não conseguir verificar
  }
}

async function checkDeviceIndicators() {
  // Lista de indicadores de dispositivo comprometido
  const indicators = {
    isRooted: false,
    reasons: []
  }

  // 1. Verificar build props via WebView
  const buildChecks = await checkBuildProps()
  if (buildChecks.isRooted) {
    indicators.isRooted = true
    indicators.reasons.push(...buildChecks.reasons)
  }

  // 2. Verificar paths comuns de root
  const pathChecks = await checkRootPaths()
  if (pathChecks.isRooted) {
    indicators.isRooted = true
    indicators.reasons.push(...pathChecks.reasons)
  }

  // 3. Verificar su binary
  const suCheck = await checkSuBinary()
  if (suCheck.isRooted) {
    indicators.isRooted = true
    indicators.reasons.push(...suCheck.reasons)
  }

  // 4. Verificar apps de root conhecidos
  const appCheck = await checkRootApps()
  if (appCheck.isRooted) {
    indicators.isRooted = true
    indicators.reasons.push(...appCheck.reasons)
  }

  // 5. Verificar debuggable flag
  const debugCheck = await checkDebuggable()
  if (debugCheck.isDebuggable) {
    indicators.reasons.push('App rodando em modo debug')
  }

  return {
    isCompromised: indicators.isRooted,
    reasons: indicators.reasons,
    timestamp: new Date().toISOString()
  }
}

async function checkBuildProps() {
  const reasons = []
  let isRooted = false

  // Propriedades de build que indicam root
  const suspiciousProps = [
    'ro.build.tags=test-keys',
    'ro.debuggable=1',
    'ro.secure=0'
  ]

  try {
    // Tentar acessar via JavaScript bridge (necessário plugin nativo)
    const result = await window.Capacitor?.Plugins?.DeviceInfo?.getBuildProps?.({
      props: suspiciousProps
    })

    if (result?.props) {
      for (const [prop, value] of Object.entries(result.props)) {
        if (value && (value.includes('test-keys') || value === '1' || value === '0')) {
          if (prop === 'ro.build.tags' && value === 'test-keys') {
            isRooted = true
            reasons.push(`Build tag: ${value}`)
          }
          if (prop === 'ro.debuggable' && value === '1') {
            isRooted = true
            reasons.push(`Debuggable: ${value}`)
          }
        }
      }
    }
  } catch (e) {
    // Plugin não disponível - tentar fallback
    console.log('DeviceInfo plugin não disponível')
  }

  return { isRooted, reasons }
}

async function checkRootPaths() {
  const reasons = []
  let isRooted = false

  // Paths comuns de root (verificação via WebView)
  const rootPaths = [
    '/system/app/Superuser.apk',
    '/sbin/su',
    '/system/bin/su',
    '/system/xbin/su',
    '/system/sbin/su',
    '/system/bin/.ext/su',
    '/system/usr/we-need-root/su',
    '/system/app/Kinguser.apk',
    '/data/adb/magisk',
    '/sbin/.magisk',
    '/cache/.disable_magisk',
    '/dev/.magisk.unblock',
    '/cache/magisk.log',
    '/data/adb/magisk.img',
    '/data/adb/magisk.db'
  ]

  // Nota: Em produção, use um plugin nativo para verificar existência de arquivos
  // Esta é uma verificação limitada via JavaScript
  try {
    const result = await window.Capacitor?.Plugins?.Filesystem?.checkPaths?.({
      paths: rootPaths.slice(0, 10) // Verificar primeiros 10
    })

    if (result?.found) {
      isRooted = true
      reasons.push(`Arquivos de root encontrados: ${result.found.length} paths`)
    }
  } catch (e) {
    console.log('Filesystem check não disponível')
  }

  return { isRooted, reasons }
}

async function checkSuBinary() {
  let isRooted = false
  const reasons = []

  try {
    // Tentar executar comando su (funciona apenas se root plugin estiver disponível)
    const result = await window.Capacitor?.Plugins?.RootChecker?.checkSu?.()
    
    if (result?.hasSu) {
      isRooted = true
      reasons.push('Binary su encontrado')
    }
  } catch (e) {
    // Plugin não disponível
  }

  return { isRooted, reasons }
}

async function checkRootApps() {
  const reasons = []
  let isRooted = false

  // Apps de root conhecidos
  const rootApps = [
    'com.noshufou.android.su',
    'com.noshufou.android.su.elite',
    'eu.chainfire.supersu',
    'com.koushikdutta.superuser',
    'com.thirdparty.superuser',
    'com.yellowes.su',
    'com.koushikdutta.rommanager',
    'com.koushikdutta.rommanager.license',
    'com.dimonvideo.luckypatcher',
    'com.chelpus.lackypatch',
    'com.ramdroid.appquarantine',
    'com.ramdroid.appquarantinepro',
    'com.topjohnwu.magisk',
    'com.kingroot.kinguser',
    'com.kingo.root',
    'com.smedialink.oneclickroot',
    'com.zhuiyi.chenguang.manager',
    'com.trigonic.apptools',
    'org.adaway',
    'com.matthewtyler.android.norootforroot',
    'io.changy.stable'
  ]

  try {
    const result = await window.Capacitor?.Plugins?.PackageChecker?.checkPackages?.({
      packages: rootApps
    })

    if (result?.installed) {
      isRooted = true
      reasons.push(`Apps de root instalados: ${result.installed.length}`)
    }
  } catch (e) {
    console.log('PackageChecker não disponível')
  }

  return { isRooted, reasons }
}

async function checkDebuggable() {
  let isDebuggable = false

  try {
    const result = await window.Capacitor?.Plugins?.DeviceInfo?.getDebuggable?.()
    isDebuggable = result?.isDebuggable || false
  } catch (e) {
    // Fallback: verificar se está em modo desenvolvedor
    isDebuggable = window.navigator.webdriver || false
  }

  return { isDebuggable }
}

/**
 * Verificação adicional: Checksum da aplicação
 * Detecta se o APK foi modificado
 */
export async function verifyAppIntegrity() {
  if (Capacitor.getPlatform() !== 'android') {
    return { valid: true }
  }

  try {
    const result = await window.Capacitor?.Plugins?.AppIntegrity?.verify?.()
    if (result?.play_integrity_available) {
      const tokenResult = await window.Capacitor?.Plugins?.AppIntegrity?.getPlayIntegrityToken?.()
      return {
        valid: result?.valid || false,
        signature: result?.apk_signature_digest,
        isReleaseBuild: result?.device_integrity?.is_release_build || false,
        playIntegrityToken: tokenResult?.token || '',
        playIntegrityAvailable: true,
        timestamp: new Date().toISOString()
      }
    }
    return {
      valid: result?.valid || false,
      signature: result?.apk_signature_digest || result?.signature,
      isReleaseBuild: result?.device_integrity?.is_release_build || false,
      playIntegrityToken: '',
      playIntegrityAvailable: false,
      timestamp: new Date().toISOString()
    }
  } catch (e) {
    return { valid: true, error: e.message }
  }
}

export async function getPlayIntegrityToken() {
  if (Capacitor.getPlatform() !== 'android') {
    return { token: null, available: false }
  }

  try {
    const result = await window.Capacitor?.Plugins?.AppIntegrity?.getPlayIntegrityToken?.()
    return {
      token: result?.token || null,
      available: result?.available || false,
      apkDigest: result?.apk_digest
    }
  } catch (e) {
    return { token: null, available: false, error: e.message }
  }
}

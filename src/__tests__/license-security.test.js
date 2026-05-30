import { jest, describe, expect, test, beforeEach } from '@jest/globals'

const config = new Map()

jest.unstable_mockModule('../lib/database.js', () => ({
  query: async (sql) => {
    if (sql.includes("chave = 'server_url'")) {
      return config.has('server_url') ? [{ valor: config.get('server_url') }] : []
    }
    return []
  },
  run: async (sql, params) => {
    if (sql.includes('INSERT OR REPLACE INTO config')) {
      config.set(params[0], params[1])
    }
    return { changes: { lastId: 0 } }
  },
}))

const { getServerUrl, normalizeServerUrl, setServerUrl } = await import('../lib/license.js')

beforeEach(() => {
  config.clear()
})

describe('server URL security', () => {
  test('requires HTTPS for non-local servers', () => {
    expect(() => normalizeServerUrl('http://api.bimbar.com.br')).toThrow('HTTPS')
  })

  test('allows local HTTP only for development', () => {
    expect(normalizeServerUrl('http://localhost:3333/')).toBe('http://localhost:3333')
    expect(normalizeServerUrl('http://127.0.0.1:3333/health')).toBe('http://127.0.0.1:3333/health')
  })

  test('normalizes HTTPS server URLs', () => {
    expect(normalizeServerUrl(' https://api.bimbar.com.br/ ')).toBe('https://api.bimbar.com.br')
  })

  test('rejects credentials embedded in server URL', () => {
    expect(() => normalizeServerUrl('https://user:secret@api.bimbar.com.br')).toThrow('usuário ou senha')
  })

  test('setServerUrl persists only normalized safe URL', async () => {
    await setServerUrl('https://api.bimbar.com.br/')
    await expect(getServerUrl()).resolves.toBe('https://api.bimbar.com.br')
  })
})

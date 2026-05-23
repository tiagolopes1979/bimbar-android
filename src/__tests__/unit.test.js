// Testes de funções puras (não precisam de database)
// Portados dos testes originais do bimbar-api

// ===== calcComissao =====
function calcComissao(comissaoFixa, totalDancas, comissaoDancaPct) {
  if (comissaoFixa > 0) return comissaoFixa
  return Math.round(totalDancas * comissaoDancaPct / 100 * 100) / 100
}

// ===== fmt =====
function fmt(n) { return 'R$ ' + Number(n).toFixed(2).replace('.',',') }

// ===== Helper de validação (portado do middleware original) =====
function hasPermission(role, resource) {
  const permissions = {
    admin: 'all',
    gerente: ['caixa', 'saidas', 'shows', 'dancarinas', 'funcionarios', 'vales', 'relatorios', 'operacao'],
    caixa: ['caixa_read', 'saidas', 'shows', 'dancarinas_read', 'vales_read', 'relatorios', 'operacao'],
  }
  if (role === 'admin') return true
  const resourceBase = resource.replace(/_read$/, '')
  const allowed = permissions[role] || []
  return allowed.includes(resource) || allowed.includes(resourceBase)
}

describe('calcComissao (pure)', () => {
  test('comissao fixa > 0 retorna valor fixo', () => {
    expect(calcComissao(100, 500, 30)).toBe(100)
  })

  test('comissao fixa = 0 calcula percentual', () => {
    expect(calcComissao(0, 200, 30)).toBe(60)
  })

  test('comissao fixa = 0 com total zero', () => {
    expect(calcComissao(0, 0, 62.50)).toBe(0)
  })

  test('arredondamento 2 casas', () => {
    expect(calcComissao(0, 100, 33.33)).toBe(33.33)
  })

  test('comissao fixa = 0 com valor negativo', () => {
    expect(calcComissao(0, -100, 50)).toBe(-50)
  })
})

describe('fmt (pure)', () => {
  test('formata valor inteiro', () => {
    expect(fmt(100)).toBe('R$ 100,00')
  })

  test('formata valor decimal', () => {
    expect(fmt(25.50)).toBe('R$ 25,50')
  })

  test('formata zero', () => {
    expect(fmt(0)).toBe('R$ 0,00')
  })
})

describe('hasPermission (pure)', () => {
  test('admin tem acesso a tudo', () => {
    expect(hasPermission('admin', 'any_resource')).toBe(true)
  })

  test('gerente tem acesso a caixa', () => {
    expect(hasPermission('gerente', 'caixa')).toBe(true)
  })

  test('gerente tem acesso a saidas', () => {
    expect(hasPermission('gerente', 'saidas')).toBe(true)
  })

  test('gerente tem acesso a relatorios', () => {
    expect(hasPermission('gerente', 'relatorios')).toBe(true)
  })

  test('caixa tem acesso a saidas', () => {
    expect(hasPermission('caixa', 'saidas')).toBe(true)
  })

  test('caixa tem acesso a caixa_read', () => {
    expect(hasPermission('caixa', 'caixa_read')).toBe(true)
  })

  test('caixa NAO tem acesso a usuarios', () => {
    expect(hasPermission('caixa', 'usuarios')).toBe(false)
  })

  test('caixa NAO tem acesso a audit', () => {
    expect(hasPermission('caixa', 'audit')).toBe(false)
  })

  test('gerente NAO tem acesso a usuarios', () => {
    expect(hasPermission('gerente', 'usuarios')).toBe(false)
  })

  test('role inexistente retorna false', () => {
    expect(hasPermission('inexistente', 'caixa')).toBe(false)
  })

  test('caixa_read resolve para caixa', () => {
    expect(hasPermission('gerente', 'caixa_read')).toBe(true)
  })

  test('dancarinas_read resolve para dancarinas', () => {
    expect(hasPermission('caixa', 'dancarinas_read')).toBe(true)
  })
})

describe('ROLES', () => {
  const ROLES = { ADMIN: 'admin', GERENTE: 'gerente', CAIXA: 'caixa' }

  test('deve conter ADMIN', () => {
    expect(ROLES.ADMIN).toBe('admin')
  })
  test('deve conter GERENTE', () => {
    expect(ROLES.GERENTE).toBe('gerente')
  })
  test('deve conter CAIXA', () => {
    expect(ROLES.CAIXA).toBe('caixa')
  })
})

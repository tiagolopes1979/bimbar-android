import { jest, describe, expect, test, beforeEach } from '@jest/globals'
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const { createTestDb } = require('./testDb.js')

const db = createTestDb()

jest.unstable_mockModule('../lib/database.js', () => ({
  query: async (sql, params) => db.prepare(sql).all(...(params || [])),
  run: async (sql, params) => {
    const stmt = db.prepare(sql)
    const result = stmt.run(...(params || []))
    return { changes: { lastId: Number(result.lastInsertRowid) } }
  },
  execute: async (sql) => db.exec(sql),
  getDb: () => db,
}))

const dancarinaService = await import('../services/dancarinaService.js')
const caixaService = await import('../services/caixaService.js')
const saidaService = await import('../services/saidaService.js')
const showService = await import('../services/showService.js')
const funcionarioService = await import('../services/funcionarioService.js')
const valeService = await import('../services/valeService.js')
const relatorioService = await import('../services/relatorioService.js')
const operacaoService = await import('../services/operacaoService.js')

beforeEach(() => {
  db.exec(`
    DELETE FROM vales; DELETE FROM show_dancas; DELETE FROM shows_controle;
    DELETE FROM caixa_saidas; DELETE FROM caixa_diario;
    DELETE FROM dancarinas; DELETE FROM funcionarios;
    DELETE FROM audit_log; DELETE FROM usuarios;
    DELETE FROM sqlite_sequence;
  `)
  db.exec(`
    INSERT INTO usuarios (username, salt, hash, role, nome_completo, ativo)
    VALUES ('admin', 'test-salt', 'test-hash', 'admin', 'Admin Teste', 1)
  `)
})

// ===== UNIT: calcComissao =====
describe('calcComissao', () => {
  test('comissao fixa > 0 retorna comissao fixa', () => {
    expect(dancarinaService.calcComissao(50, 200, 30)).toBe(50)
  })

  test('comissao fixa = 0 calcula percentual', () => {
    expect(dancarinaService.calcComissao(0, 200, 30)).toBe(60)
  })

  test('comissao fixa = 0 com valor zero retorna 0', () => {
    expect(dancarinaService.calcComissao(0, 0, 62.50)).toBe(0)
  })

  test('arredonda para 2 casas decimais', () => {
    expect(dancarinaService.calcComissao(0, 333.33, 62.50)).toBe(208.33)
  })
})

// ===== DANÇARINAS =====
describe('DancarinaService', () => {
  test('criar e listar dancarina', async () => {
    const { id } = await dancarinaService.criarDancarina({ nome: 'Maria', telefone: '11999999999' })
    expect(id).toBeTruthy()

    const { data } = await dancarinaService.listarDancarinas()
    expect(data).toHaveLength(1)
    expect(data[0].nome).toBe('Maria')
  })

  test('criar com valores customizados', async () => {
    const { id } = await dancarinaService.criarDancarina({
      nome: 'Joana', telefone: '11888888888', comissao: 0, comissao_percentual: 40,
      comissao_danca_percentual: 50, danca_30_valor: 200
    })
    const d = await dancarinaService.getDancarina(id)
    expect(d.comissao_percentual).toBe(40)
    expect(d.comissao_danca_percentual).toBe(50)
    expect(d.danca_30_valor).toBe(200)
  })

  test('atualizar dancarina', async () => {
    const { id } = await dancarinaService.criarDancarina({ nome: 'Maria', telefone: '11999999999' })
    await dancarinaService.atualizarDancarina(id, {
      nome: 'Maria Updated', telefone: '11777777777', comissao: 100,
      comissao_percentual: 30, comissao_danca_percentual: 62.50,
      danca_30_nome: '30 min', danca_30_qty: 1, danca_30_valor: 160,
      danca_60_nome: '60 min', danca_60_qty: 0, danca_60_valor: 320,
      danca_3_nome: '', danca_3_qty: 0, danca_3_valor: 0,
      danca_4_nome: '', danca_4_qty: 0, danca_4_valor: 0,
    })
    const d = await dancarinaService.getDancarina(id)
    expect(d.nome).toBe('Maria Updated')
    expect(d.comissao).toBe(100)
  })

  test('excluir dancarina (soft-delete)', async () => {
    const { id } = await dancarinaService.criarDancarina({ nome: 'Maria' })
    await dancarinaService.excluirDancarina(id)
    const d = await dancarinaService.getDancarina(id)
    expect(d).toBeNull()
  })

  test('listar dancarinas select', async () => {
    await dancarinaService.criarDancarina({ nome: 'Ana' })
    await dancarinaService.criarDancarina({ nome: 'Bia' })
    const rows = await dancarinaService.listarDancarinasSelect()
    expect(rows).toHaveLength(2)
    expect(rows[0].nome).toBe('Ana')
  })
})

// ===== FUNCIONÁRIOS =====
describe('FuncionarioService', () => {
  test('criar e listar funcionario', async () => {
    const { id } = await funcionarioService.criarFuncionario({ nome: 'João', cargo: 'Segurança', telefone: '11911111111' })
    expect(id).toBeTruthy()
    const { data } = await funcionarioService.listarFuncionarios()
    expect(data).toHaveLength(1)
    expect(data[0].nome).toBe('João')
    expect(data[0].cargo).toBe('Segurança')
  })

  test('atualizar funcionario', async () => {
    const { id } = await funcionarioService.criarFuncionario({ nome: 'João', cargo: 'Porteiro' })
    await funcionarioService.atualizarFuncionario(id, { nome: 'João Update', cargo: 'Gerente', telefone: '' })
    const f = await funcionarioService.getFuncionario(id)
    expect(f.nome).toBe('João Update')
    expect(f.cargo).toBe('Gerente')
  })

  test('excluir funcionario (soft-delete)', async () => {
    const { id } = await funcionarioService.criarFuncionario({ nome: 'João' })
    await funcionarioService.excluirFuncionario(id)
    expect(await funcionarioService.getFuncionario(id)).toBeNull()
  })

  test('excluir funcionario e verificar que sumiu da lista', async () => {
    await funcionarioService.criarFuncionario({ nome: 'Pedro' })
    const { id } = await funcionarioService.criarFuncionario({ nome: 'Paulo' })
    await funcionarioService.excluirFuncionario(id)
    const { data } = await funcionarioService.listarFuncionarios()
    expect(data).toHaveLength(1)
    expect(data[0].nome).toBe('Pedro')
  })
})

// ===== CAIXA =====
describe('CaixaService', () => {
  test('abrir caixa', async () => {
    const res = await caixaService.abrirCaixa({ data: '2025-06-01', troco_inicial: 300, comanda_inicio: 1 })
    expect(res.data).toBe('2025-06-01')

    const caixa = await caixaService.getCaixa('2025-06-01')
    expect(caixa).toBeTruthy()
    expect(caixa.troco_inicial).toBe(300)
  })

  test('abrir caixa na mesma data faz upsert', async () => {
    await caixaService.abrirCaixa({ data: '2025-06-01', troco_inicial: 300 })
    await caixaService.abrirCaixa({ data: '2025-06-01', troco_inicial: 500 })
    const caixa = await caixaService.getCaixa('2025-06-01')
    expect(caixa.troco_inicial).toBe(500)
  })

  test('listar caixas', async () => {
    await caixaService.abrirCaixa({ data: '2025-06-01', troco_inicial: 300 })
    await caixaService.abrirCaixa({ data: '2025-06-02', troco_inicial: 500 })
    const { data } = await caixaService.listarCaixas()
    expect(data).toHaveLength(2)
  })

  test('fechar caixa calcula diferença', async () => {
    const data = '2025-06-01'
    await caixaService.abrirCaixa({ data, troco_inicial: 300, comanda_inicio: 1 })
    const res = await caixaService.fecharCaixa(data, {
      total_comandas: 1000, total_cartoes: 500, total_especies: 200,
      comanda_fim: 50, dinheiro_contado: 2000,
      responsavel_fechamento: 'Admin'
    })
    expect(res.data).toBe(data)
    expect(typeof res.diferenca).toBe('number')

    const caixa = await caixaService.getCaixa(data)
    expect(caixa.fechado_em).toBeTruthy()
    expect(caixa.responsavel_fechamento).toBe('Admin')
  })

  test('excluir caixa', async () => {
    await caixaService.abrirCaixa({ data: '2025-06-01' })
    await caixaService.excluirCaixa('2025-06-01')
    expect(await caixaService.getCaixa('2025-06-01')).toBeNull()
  })
})

// ===== SAÍDAS =====
describe('SaidaService', () => {
  beforeEach(async () => {
    await caixaService.abrirCaixa({ data: '2025-06-01', troco_inicial: 300 })
  })

  test('criar saida', async () => {
    const { id } = await saidaService.criarSaida('2025-06-01', { categoria: 'UBER', valor: 25, descricao: 'Uber ida' })
    expect(id).toBeTruthy()
  })

  test('criar saida cria caixa automaticamente', async () => {
    const { id } = await saidaService.criarSaida('2025-07-01', { categoria: 'GELO', valor: 50 })
    expect(id).toBeTruthy()
    const caixa = await caixaService.getCaixa('2025-07-01')
    expect(caixa).toBeTruthy()
  })

  test('listar saidas do dia', async () => {
    await saidaService.criarSaida('2025-06-01', { categoria: 'UBER', valor: 25 })
    await saidaService.criarSaida('2025-06-01', { categoria: 'GELO', valor: 50 })
    const rows = await saidaService.listarSaidas('2025-06-01')
    expect(rows).toHaveLength(2)
  })

  test('atualizar saida', async () => {
    const { id } = await saidaService.criarSaida('2025-06-01', { categoria: 'UBER', valor: 25 })
    await saidaService.atualizarSaida(id, { categoria: 'GELO', valor: 30, descricao: 'Gelo festa' })
    const rows = await saidaService.listarSaidas('2025-06-01')
    expect(rows[0].categoria).toBe('GELO')
    expect(rows[0].valor).toBe(30)
  })

  test('excluir saida (soft-delete)', async () => {
    const { id } = await saidaService.criarSaida('2025-06-01', { categoria: 'UBER', valor: 25 })
    await saidaService.excluirSaida(id)
    const rows = await saidaService.listarSaidas('2025-06-01')
    expect(rows).toHaveLength(0)
  })
})

// ===== SHOWS =====
describe('ShowService', () => {
  beforeEach(async () => {
    await dancarinaService.criarDancarina({ nome: 'Maria' })
    await dancarinaService.criarDancarina({ nome: 'Joana' })
    await caixaService.abrirCaixa({ data: '2025-06-01' })
  })

  test('criar show com dancarina unica', async () => {
    const { id } = await showService.criarShow('2025-06-01', {
      dancarina_ids: [1], numero_linha: 1, valor_show: 160,
      tipo: 'FX', hora_entrada: '21:00', hora_saida: '21:30'
    })
    expect(id).toBeTruthy()
  })

  test('criar show com multiplas dancarinas', async () => {
    await showService.criarShow('2025-06-01', {
      dancarina_ids: [1, 2], numero_linha: 2, valor_show: 320,
      tipo: 'FL', hora_entrada: '22:00', hora_saida: '23:00'
    })
    const shows = await showService.listarShows('2025-06-01')
    expect(shows).toHaveLength(1)
    expect(shows[0].dancas).toHaveLength(2)
  })

  test('proxima linha disponivel', async () => {
    await showService.criarShow('2025-06-01', {
      dancarina_ids: [1], numero_linha: 1, valor_show: 160
    })
    await showService.criarShow('2025-06-01', {
      dancarina_ids: [2], numero_linha: 2, valor_show: 160
    })

    const prox = await showService.getProximaLinha('2025-06-01')
    expect(prox).toBe(3)
  })

  test('excluir show', async () => {
    const { id } = await showService.criarShow('2025-06-01', {
      dancarina_ids: [1], numero_linha: 1, valor_show: 160
    })
    await showService.excluirShow(id)
    const shows = await showService.listarShows('2025-06-01')
    expect(shows).toHaveLength(0)
  })
})

// ===== VALES =====
describe('ValeService', () => {
  beforeEach(async () => {
    await dancarinaService.criarDancarina({ nome: 'Maria' })
    await caixaService.abrirCaixa({ data: '2025-06-01' })
    await showService.criarShow('2025-06-01', {
      dancarina_ids: [1], numero_linha: 1, valor_show: 200, tipo: 'FX'
    })
  })

  test('criar vale', async () => {
    const { id } = await valeService.criarVale({
      tipo_pessoa: 'dancarina', pessoa_id: 1, valor: 50,
      descricao: 'Adiantamento', data_valor: '2025-06-01', gerar_saida: 'nao'
    }, null)
    expect(id).toBeTruthy()
  })

  test('criar vale com geracao de saida no caixa', async () => {
    const { id } = await valeService.criarVale({
      tipo_pessoa: 'dancarina', pessoa_id: 1, valor: 50,
      descricao: 'Adiantamento', data_valor: '2025-06-01', gerar_saida: 'sim'
    }, null)
    expect(id).toBeTruthy()

    const saidas = await saidaService.listarSaidas('2025-06-01')
    expect(saidas).toHaveLength(1)
    expect(saidas[0].categoria).toBe('VALES_ESPECIES')
  })

  test('rejeitar vale que excede 50% dos shows', async () => {
    await expect(valeService.criarVale({
      tipo_pessoa: 'dancarina', pessoa_id: 1, valor: 150,
      descricao: 'Vale muito alto', data_valor: '2025-06-01', gerar_saida: 'nao'
    }, null)).rejects.toThrow('50%')
  })

  test('listar vales', async () => {
    await valeService.criarVale({
      tipo_pessoa: 'dancarina', pessoa_id: 1, valor: 50,
      data_valor: '2025-06-01', gerar_saida: 'nao'
    }, null)
    const vales = await valeService.listarVales()
    expect(vales).toHaveLength(1)
    expect(vales[0].valor).toBe(50)
  })

  test('pagar vale', async () => {
    const { id } = await valeService.criarVale({
      tipo_pessoa: 'dancarina', pessoa_id: 1, valor: 50,
      data_valor: '2025-06-01', gerar_saida: 'nao'
    }, null)
    await valeService.pagarVale(id)
    const vales = await valeService.listarVales()
    expect(vales[0].pago).toBe(1)
  })

  test('excluir vale cancela saida vinculada', async () => {
    const { id } = await valeService.criarVale({
      tipo_pessoa: 'dancarina', pessoa_id: 1, valor: 50,
      data_valor: '2025-06-01', gerar_saida: 'sim'
    }, null)
    await valeService.excluirVale(id)
    const vales = await valeService.listarVales()
    expect(vales).toHaveLength(0)
  })
})

// ===== RELATÓRIOS =====
describe('RelatorioService', () => {
  beforeEach(async () => {
    await dancarinaService.criarDancarina({ nome: 'Maria' })
    await caixaService.abrirCaixa({ data: '2025-06-01', troco_inicial: 300 })
    await saidaService.criarSaida('2025-06-01', { categoria: 'UBER', valor: 25 })
    await saidaService.criarSaida('2025-06-01', { categoria: 'GELO', valor: 50 })
    await saidaService.criarSaida('2025-06-01', { categoria: 'UBER', valor: 15 })
    await showService.criarShow('2025-06-01', {
      dancarina_ids: [1], numero_linha: 1, valor_show: 160, tipo: 'FX',
      hora_entrada: '21:00', hora_saida: '21:30'
    })
    await showService.criarShow('2025-06-01', {
      dancarina_ids: [1], numero_linha: 2, valor_show: 320, tipo: 'FL',
      hora_entrada: '22:00', hora_saida: '23:00'
    })
  })

  test('saidas por categoria', async () => {
    const rows = await relatorioService.saidasPorCategoria('2025-06-01')
    expect(rows).toHaveLength(2)
    const uber = rows.find(r => r.categoria === 'UBER')
    expect(uber.total).toBe(40)
    expect(uber.quantidade).toBe(2)
  })

  test('resumo caixa', async () => {
    await caixaService.fecharCaixa('2025-06-01', {
      total_comandas: 1000, total_cartoes: 500, total_especies: 200,
      responsavel_fechamento: 'Admin'
    })
    const res = await relatorioService.resumoCaixa('2025-06-01')
    expect(res).toBeTruthy()
    expect(res.total_shows).toBe(2)
    expect(res.totalSaidas).toBe(90)
  })

  test('resumo caixa sem caixa retorna null', async () => {
    const res = await relatorioService.resumoCaixa('2025-12-01')
    expect(res).toBeNull()
  })

  test('total dancarinas', async () => {
    const rows = await relatorioService.totalDancarinas('2025-06-01')
    expect(rows).toHaveLength(1)
    expect(rows[0].total_dancas).toBe(2)
    expect(rows[0].fx_count).toBe(1)
    expect(rows[0].fl_count).toBe(1)
  })

  test('financeiro dancarinas', async () => {
    const rows = await relatorioService.financeiroDancarinas('2025-06-01')
    expect(rows).toHaveLength(1)
    expect(rows[0].valor_shows).toBe(480)
    expect(rows[0].comissao_calculada).toBeGreaterThan(0)
  })
})

// ===== OPERAÇÃO =====
describe('OperacaoService', () => {
  beforeEach(async () => {
    await dancarinaService.criarDancarina({ nome: 'Maria' })
    await caixaService.abrirCaixa({ data: '2025-06-01', troco_inicial: 300 })
    await saidaService.criarSaida('2025-06-01', { categoria: 'UBER', valor: 25 })
    await showService.criarShow('2025-06-01', {
      dancarina_ids: [1], numero_linha: 1, valor_show: 160, tipo: 'FX'
    })
    await showService.criarShow('2025-06-01', {
      dancarina_ids: [1], numero_linha: 2, valor_show: 320, tipo: 'FL'
    })
    await valeService.criarVale({
      tipo_pessoa: 'dancarina', pessoa_id: 1, valor: 50,
      data_valor: '2025-06-01', gerar_saida: 'nao'
    }, null)
  })

  test('getResumoOperacao retorna dados completos', async () => {
    const res = await operacaoService.getResumoOperacao('2025-06-01')
    expect(res.caixa).toBeTruthy()
    expect(res.totalSaidas).toBe(25)
    expect(res.totalShows).toBe(2)
    expect(res.totalShowsValor).toBe(480)
    expect(res.valesPendentes).toBe(50)
    expect(res.proximaLinha).toBe(3)
    expect(res.comissoes).toHaveLength(1)
    expect(res.ultimos.length).toBeGreaterThanOrEqual(3)
  })

  test('getResumoOperacao em dia sem caixa', async () => {
    const res = await operacaoService.getResumoOperacao('2025-07-01')
    expect(res.caixa).toBeNull()
    expect(res.totalSaidas).toBe(0)
    expect(res.totalShows).toBe(0)
  })

  test('comissoes detalhadas', async () => {
    const rows = await operacaoService.getComissoesDetalhadas('2025-06-01')
    expect(rows).toHaveLength(1)
    expect(rows[0].total_dancas).toBe(2)
  })
})

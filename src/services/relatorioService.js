import { query } from '../lib/database.js'
import { calcComissao } from './dancarinaService.js'

export async function saidasPorCategoria(data) {
  return await query(
    `SELECT categoria, COUNT(*) as quantidade, SUM(valor) as total
    FROM caixa_saidas
    WHERE cancelada = 0 AND caixa_diario_id = (SELECT id FROM caixa_diario WHERE data = ?)
    GROUP BY categoria ORDER BY total DESC`,
    [data]
  )
}

export async function resumoCaixa(data) {
  const caixa = await query('SELECT * FROM caixa_diario WHERE data = ?', [data])
  if (caixa.length === 0) return null

  const saidas = await query(
    "SELECT COALESCE(SUM(valor), 0) as total FROM caixa_saidas WHERE cancelada = 0 AND caixa_diario_id = (SELECT id FROM caixa_diario WHERE data = ?)",
    [data]
  )

  const shows = await query(
    `SELECT COUNT(*) as total_shows, COALESCE(SUM(sc.valor_show), 0) as valor_shows,
      COUNT(DISTINCT sd.dancarina_id) as total_dancarinas
    FROM shows_controle sc
    LEFT JOIN show_dancas sd ON sd.show_controle_id = sc.id
    WHERE sc.cancelado = 0 AND sc.caixa_diario_id = (SELECT id FROM caixa_diario WHERE data = ?)`,
    [data]
  )

  const c = caixa[0]
  const entradas = Number(c.total_comandas) + Number(c.total_cartoes) + Number(c.total_especies)
  const totalSaidas = saidas[0]?.total || 0
  const saldo = entradas - totalSaidas + Number(c.troco_inicial)

  return {
    data: c.data,
    troco_inicial: c.troco_inicial,
    comanda_inicio: c.comanda_inicio,
    comanda_fim: c.comanda_fim,
    total_comandas: c.total_comandas,
    total_cartoes: c.total_cartoes,
    total_especies: c.total_especies,
    dinheiro_contado: c.dinheiro_contado,
    diferenca_caixa: c.diferenca_caixa,
    responsavel_fechamento: c.responsavel_fechamento,
    observacao: c.observacao,
    entradas,
    totalSaidas,
    saldo,
    fechado_em: c.fechado_em,
    ...shows[0]
  }
}

export async function totalDancarinas(data) {
  return await query(
    `SELECT d.id, d.nome, COUNT(sd.id) as total_dancas, COALESCE(SUM(sd.valor_danca), 0) as valor_total,
      COALESCE(SUM(sd.quartos), 0) as total_quartos,
      SUM(CASE WHEN sc.tipo = 'FX' THEN 1 ELSE 0 END) as fx_count,
      SUM(CASE WHEN sc.tipo = 'FL' THEN 1 ELSE 0 END) as fl_count
    FROM dancarinas d
    JOIN show_dancas sd ON sd.dancarina_id = d.id
    JOIN shows_controle sc ON sc.id = sd.show_controle_id
    JOIN caixa_diario cd ON cd.id = sc.caixa_diario_id
    WHERE cd.data = ? AND sc.cancelado = 0 AND d.ativa = 1
    GROUP BY d.id, d.nome ORDER BY d.nome`,
    [data]
  )
}

export async function financeiroDancarinas(data) {
  const rows = await query(
    `SELECT d.id, d.nome, d.comissao, d.comissao_percentual, d.comissao_danca_percentual,
      COUNT(sd.id) as total_dancas, COALESCE(SUM(sd.valor_danca), 0) as valor_shows,
      COALESCE(SUM(sd.quartos), 0) as total_quartos
    FROM dancarinas d
    LEFT JOIN show_dancas sd ON sd.dancarina_id = d.id
    LEFT JOIN shows_controle sc ON sc.id = sd.show_controle_id AND sc.cancelado = 0
    LEFT JOIN caixa_diario cd ON cd.id = sc.caixa_diario_id AND cd.data = ?
    WHERE d.ativa = 1
    GROUP BY d.id ORDER BY d.nome`,
    [data]
  )

  const vales = await query(
    "SELECT pessoa_id, SUM(valor) as total_vales FROM vales WHERE tipo_pessoa = 'dancarina' AND cancelado = 0 AND data_valor = ? GROUP BY pessoa_id",
    [data]
  )
  const valeMap = {}
  for (const v of vales) valeMap[v.pessoa_id] = v.total_vales

  return rows.map(d => {
    const comissaoCalc = calcComissao(Number(d.comissao), Number(d.valor_shows), Number(d.comissao_danca_percentual))
    const valesTotal = Number(valeMap[d.id] || 0)
    return {
      ...d,
      comissao_calculada: comissaoCalc,
      total_vales: valesTotal,
      valor_a_receber: Math.max(0, Number(d.valor_shows) - comissaoCalc - valesTotal)
    }
  })
}

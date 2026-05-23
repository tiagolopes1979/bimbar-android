import { query } from '../lib/database.js'
import { calcComissao } from './dancarinaService.js'

export async function getResumoOperacao(data) {
  const caixaRows = await query('SELECT * FROM caixa_diario WHERE data = ?', [data])
  const caixa = caixaRows[0] || null

  const saidas = await query(
    "SELECT COALESCE(SUM(valor), 0) as total FROM caixa_saidas WHERE cancelada = 0 AND caixa_diario_id = (SELECT id FROM caixa_diario WHERE data = ?)",
    [data]
  )
  const totalSaidas = saidas[0]?.total || 0

  const shows = await query(
    "SELECT COUNT(*) as qtd, COALESCE(SUM(valor_show), 0) as total FROM shows_controle WHERE cancelado = 0 AND caixa_diario_id = (SELECT id FROM caixa_diario WHERE data = ?)",
    [data]
  )
  const totalShowsValor = shows[0]?.total || 0
  const totalShowsQtd = shows[0]?.qtd || 0

  const vales = await query(
    "SELECT COALESCE(SUM(valor), 0) as total FROM vales WHERE cancelado = 0 AND data_valor = ? AND pago = 0",
    [data]
  )
  const valesPendentes = vales[0]?.total || 0

  const entradas = (caixa ? Number(caixa.total_comandas) + Number(caixa.total_cartoes) + Number(caixa.total_especies) : 0)
  const saldoPrevisto = entradas - totalSaidas
  const diferenca = caixa?.diferenca_caixa != null ? Number(caixa.diferenca_caixa) : null

  const proxLinha = await getProximaLinhaNumero(data)

  const comissoesRows = await query(
    `SELECT d.id, d.nome, d.comissao, d.comissao_percentual, d.comissao_danca_percentual,
      COALESCE(s.total_dancas, 0) as total_dancas, COALESCE(s.valor_shows, 0) as valor_shows
    FROM dancarinas d
    LEFT JOIN (
      SELECT sd.dancarina_id, COUNT(*) as total_dancas, SUM(sd.valor_danca) as valor_shows
      FROM show_dancas sd
      JOIN shows_controle sc ON sc.id = sd.show_controle_id
      JOIN caixa_diario cd ON cd.id = sc.caixa_diario_id
      WHERE cd.data = ? AND sc.cancelado = 0
      GROUP BY sd.dancarina_id
    ) s ON s.dancarina_id = d.id
    WHERE d.ativa = 1
    ORDER BY d.nome`,
    [data]
  )

  const comissoes = comissoesRows.map(d => ({
    ...d,
    comissao_calculada: calcComissao(Number(d.comissao), Number(d.valor_shows), Number(d.comissao_danca_percentual))
  }))

  const totalComissao = comissoes.reduce((acc, c) => acc + c.comissao_calculada, 0)

  const ultimosRows = await query(
    `SELECT 'saida' as tipo, s.valor, s.descricao, s.categoria, s.criado_em FROM caixa_saidas s
    WHERE s.cancelada = 0 AND s.caixa_diario_id = (SELECT id FROM caixa_diario WHERE data = ?)
    UNION ALL
    SELECT 'show' as tipo, sc.valor_show as valor, sd.dancarina_id || '' as descricao, sc.tipo as categoria, sc.criado_em FROM shows_controle sc
    LEFT JOIN show_dancas sd ON sd.show_controle_id = sc.id
    WHERE sc.cancelado = 0 AND sc.caixa_diario_id = (SELECT id FROM caixa_diario WHERE data = ?)
    ORDER BY criado_em DESC LIMIT 20`,
    [data, data]
  )

  return {
    caixa,
    entradas,
    totalSaidas,
    saldoPrevisto,
    totalShows: totalShowsQtd,
    totalShowsValor,
    valesPendentes,
    totalComissao,
    diferenca,
    proximaLinha: proxLinha,
    comissoes,
    ultimos: ultimosRows
  }
}

async function getProximaLinhaNumero(data) {
  const linhas = await query(
    `SELECT numero_linha FROM shows_controle
    WHERE cancelado = 0 AND caixa_diario_id = (SELECT id FROM caixa_diario WHERE data = ?)
    ORDER BY numero_linha`,
    [data]
  )
  const usadas = new Set(linhas.map(r => r.numero_linha))
  for (let i = 1; i <= 23; i++) if (!usadas.has(i)) return i
  return 23
}

export async function getComissoesDetalhadas(data) {
  return await query(
    `SELECT d.id, d.nome, d.comissao, d.comissao_percentual, d.comissao_danca_percentual,
      COUNT(sd.id) as total_dancas, COALESCE(SUM(sd.valor_danca), 0) as valor_shows,
      COALESCE(v.total_vales, 0) as total_vales
    FROM dancarinas d
    LEFT JOIN show_dancas sd ON sd.dancarina_id = d.id
    LEFT JOIN shows_controle sc ON sc.id = sd.show_controle_id AND sc.cancelado = 0
    LEFT JOIN caixa_diario cd ON cd.id = sc.caixa_diario_id AND cd.data = ?
    LEFT JOIN (SELECT pessoa_id, SUM(valor) as total_vales FROM vales WHERE tipo_pessoa = 'dancarina' AND cancelado = 0 AND pago = 0 GROUP BY pessoa_id) v ON v.pessoa_id = d.id
    WHERE d.ativa = 1
    GROUP BY d.id ORDER BY d.nome`,
    [data]
  )
}

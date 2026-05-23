import { query, run } from '../lib/database.js'

export async function listarCaixas(page = 1, limit = 50) {
  const offset = (page - 1) * limit
  const rows = await query(
    `SELECT cd.*, u.nome_completo as responsavel_nome,
      COALESCE(s.total_saidas, 0) as total_saidas, COALESCE(s.valor_saidas, 0) as valor_saidas
    FROM caixa_diario cd
    LEFT JOIN usuarios u ON u.id = cd.criado_por
    LEFT JOIN (SELECT caixa_diario_id, COUNT(*) as total_saidas, SUM(valor) as valor_saidas FROM caixa_saidas WHERE cancelada = 0 GROUP BY caixa_diario_id) s ON s.caixa_diario_id = cd.id
    ORDER BY cd.data DESC LIMIT ? OFFSET ?`,
    [limit, offset]
  )
  const [{ c }] = await query('SELECT COUNT(*) as c FROM caixa_diario')
  return { data: rows, total: c }
}

export async function getCaixa(data) {
  const rows = await query('SELECT * FROM caixa_diario WHERE data = ?', [data])
  return rows.length > 0 ? rows[0] : null
}

export async function abrirCaixa(dados) {
  await run(
    `INSERT INTO caixa_diario (data, troco_inicial, comanda_inicio, criado_por)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(data) DO UPDATE SET troco_inicial = excluded.troco_inicial, comanda_inicio = excluded.comanda_inicio`,
    [dados.data, dados.troco_inicial || 0, dados.comanda_inicio || null, dados.criado_por || null]
  )
  return { data: dados.data }
}

export async function fecharCaixa(data, dados) {
  const caixa = await getCaixa(data)
  if (!caixa) throw new Error('Caixa não encontrado para esta data')

  const entradas = (dados.total_comandas || 0) + (dados.total_cartoes || 0) + (dados.total_especies || 0)
  const saidas = caixa.valor_saidas || 0
  const diferenca = dados.dinheiro_contado != null
    ? Math.round((dados.dinheiro_contado - (caixa.troco_inicial + entradas - saidas)) * 100) / 100
    : null

  await run(
    `UPDATE caixa_diario SET
      total_comandas = ?, total_cartoes = ?, total_especies = ?,
      comanda_fim = ?, dinheiro_contado = ?, diferenca_caixa = ?,
      responsavel_fechamento = ?, fechado_em = datetime('now'), observacao = ?
    WHERE data = ?`,
    [dados.total_comandas || 0, dados.total_cartoes || 0, dados.total_especies || 0,
      dados.comanda_fim || null, dados.dinheiro_contado || null, diferenca,
      dados.responsavel_fechamento || null, dados.observacao || '', data]
  )
  return { data, diferenca }
}

export async function excluirCaixa(data) {
  const caixa = await getCaixa(data)
  if (!caixa) throw new Error('Caixa não encontrado')
  await run('UPDATE caixa_saidas SET cancelada = 1, motivo_cancelamento = ?, cancelada_em = datetime(\'now\') WHERE caixa_diario_id = ?', ['Caixa cancelado', caixa.id])
  await run('UPDATE shows_controle SET cancelado = 1, motivo_cancelamento = ?, cancelado_em = datetime(\'now\') WHERE caixa_diario_id = ?', ['Caixa cancelado', caixa.id])
  await run('DELETE FROM caixa_diario WHERE data = ?', [data])
}

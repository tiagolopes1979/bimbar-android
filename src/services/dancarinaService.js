import { query, run, getDb } from '../lib/database.js'

function calcComissao(comissaoFixa, totalDancas, comissaoDancaPct) {
  if (comissaoFixa > 0) return comissaoFixa
  return Math.round(totalDancas * comissaoDancaPct / 100 * 100) / 100
}

export async function listarDancarinas(page = 1, limit = 50) {
  const offset = (page - 1) * limit
  const rows = await query(
    'SELECT d.*, COALESCE(v.total_vales, 0) as total_vales, COALESCE(v.total_pendente, 0) as vales_pendentes FROM dancarinas d LEFT JOIN (SELECT pessoa_id, SUM(valor) as total_vales, SUM(CASE WHEN pago = 0 AND cancelado = 0 THEN valor ELSE 0 END) as total_pendente FROM vales WHERE tipo_pessoa = ? AND cancelado = 0 GROUP BY pessoa_id) v ON v.pessoa_id = d.id WHERE d.ativa = 1 ORDER BY d.nome LIMIT ? OFFSET ?',
    ['dancarina', limit, offset]
  )
  const [{ c }] = await query('SELECT COUNT(*) as c FROM dancarinas WHERE ativa = 1')
  return { data: rows, total: c }
}

export async function getDancarina(id) {
  const rows = await query('SELECT * FROM dancarinas WHERE id = ? AND ativa = 1', [id])
  if (rows.length === 0) return null
  return rows[0]
}

export async function criarDancarina(dados) {
  const r = await run(
    `INSERT INTO dancarinas (nome, telefone, comissao, comissao_percentual, comissao_danca_percentual,
      danca_30_nome, danca_30_qty, danca_30_valor, danca_60_nome, danca_60_qty, danca_60_valor,
      danca_3_nome, danca_3_qty, danca_3_valor, danca_4_nome, danca_4_qty, danca_4_valor)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [dados.nome, dados.telefone, dados.comissao || 0, dados.comissao_percentual || 30, dados.comissao_danca_percentual || 62.50,
      dados.danca_30_nome || '30 min', dados.danca_30_qty || 0, dados.danca_30_valor || 160,
      dados.danca_60_nome || '60 min', dados.danca_60_qty || 0, dados.danca_60_valor || 320,
      dados.danca_3_nome || '', dados.danca_3_qty || 0, dados.danca_3_valor || 0,
      dados.danca_4_nome || '', dados.danca_4_qty || 0, dados.danca_4_valor || 0]
  )
  return { id: r.changes?.lastId || r.lastId }
}

export async function atualizarDancarina(id, dados) {
  await run(
    `UPDATE dancarinas SET nome = ?, telefone = ?, comissao = ?, comissao_percentual = ?, comissao_danca_percentual = ?,
      danca_30_nome = ?, danca_30_qty = ?, danca_30_valor = ?, danca_60_nome = ?, danca_60_qty = ?, danca_60_valor = ?,
      danca_3_nome = ?, danca_3_qty = ?, danca_3_valor = ?, danca_4_nome = ?, danca_4_qty = ?, danca_4_valor = ?
    WHERE id = ? AND ativa = 1`,
    [dados.nome, dados.telefone, dados.comissao || 0, dados.comissao_percentual || 30, dados.comissao_danca_percentual || 62.50,
      dados.danca_30_nome || '30 min', dados.danca_30_qty || 0, dados.danca_30_valor || 160,
      dados.danca_60_nome || '60 min', dados.danca_60_qty || 0, dados.danca_60_valor || 320,
      dados.danca_3_nome || '', dados.danca_3_qty || 0, dados.danca_3_valor || 0,
      dados.danca_4_nome || '', dados.danca_4_qty || 0, dados.danca_4_valor || 0, id]
  )
  return { id }
}

export async function excluirDancarina(id) {
  await run('UPDATE dancarinas SET ativa = 0 WHERE id = ?', [id])
}

export async function listarDancarinasSelect() {
  return await query('SELECT id, nome FROM dancarinas WHERE ativa = 1 ORDER BY nome')
}

export { calcComissao }

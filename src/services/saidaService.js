import { query, run } from '../lib/database.js'

export async function listarSaidas(data) {
  return await query(
    'SELECT s.*, u.nome_completo as criado_por_nome FROM caixa_saidas s LEFT JOIN usuarios u ON u.id = s.criado_por WHERE s.cancelada = 0 AND s.caixa_diario_id = (SELECT id FROM caixa_diario WHERE data = ?) ORDER BY s.criado_em DESC',
    [data]
  )
}

export async function criarSaida(data, dados, criadoPor) {
  const caixas = await query('SELECT id FROM caixa_diario WHERE data = ?', [data])
  let caixaId
  if (caixas.length === 0) {
    const r = await run('INSERT INTO caixa_diario (data) VALUES (?)', [data])
    caixaId = r.changes?.lastId || r.lastId
  } else {
    caixaId = caixas[0].id
  }

  const r = await run(
    'INSERT INTO caixa_saidas (caixa_diario_id, categoria, valor, descricao, criado_por) VALUES (?, ?, ?, ?, ?)',
    [caixaId, dados.categoria, dados.valor, dados.descricao || '', criadoPor || null]
  )
  return { id: r.changes?.lastId || r.lastId }
}

export async function atualizarSaida(id, dados) {
  await run(
    'UPDATE caixa_saidas SET categoria = ?, valor = ?, descricao = ? WHERE id = ? AND cancelada = 0',
    [dados.categoria, dados.valor, dados.descricao || '', id]
  )
}

export async function excluirSaida(id, motivo) {
  await run(
    "UPDATE caixa_saidas SET cancelada = 1, motivo_cancelamento = ?, cancelada_em = datetime('now') WHERE id = ?",
    [motivo || 'Cancelado manualmente', id]
  )
}

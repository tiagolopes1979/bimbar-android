import { query, run } from '../lib/database.js'

export async function listarVales(filtros = {}) {
  let sql = `SELECT v.*, CASE WHEN v.tipo_pessoa = 'dancarina' THEN d.nome WHEN v.tipo_pessoa = 'funcionario' THEN f.nome END as pessoa_nome
    FROM vales v
    LEFT JOIN dancarinas d ON d.id = v.pessoa_id AND v.tipo_pessoa = 'dancarina'
    LEFT JOIN funcionarios f ON f.id = v.pessoa_id AND v.tipo_pessoa = 'funcionario'
    WHERE v.cancelado = 0`
  const params = []

  if (filtros.tipo) { sql += ' AND v.tipo_pessoa = ?'; params.push(filtros.tipo) }
  if (filtros.pessoa_id) { sql += ' AND v.pessoa_id = ?'; params.push(filtros.pessoa_id) }
  if (filtros.data) { sql += ' AND v.data_valor = ?'; params.push(filtros.data) }

  sql += ' ORDER BY v.criado_em DESC'
  return await query(sql, params)
}

export async function criarVale(dados, criadoPor) {
  const rows = await query(
    `SELECT COALESCE(SUM(sd.valor_danca), 0) as total_shows FROM show_dancas sd
    JOIN shows_controle sc ON sc.id = sd.show_controle_id
    JOIN caixa_diario cd ON cd.id = sc.caixa_diario_id
    WHERE sd.dancarina_id = ? AND cd.data = ? AND sc.cancelado = 0`,
    [dados.pessoa_id, dados.data_valor]
  )

  const totalShows = rows[0]?.total_shows || 0
  if (dados.valor > totalShows * 0.5) {
    throw new Error(`Valor do vale (R$ ${dados.valor}) excede 50% do total de shows (R$ ${totalShows})`)
  }

  let caixaSaidaId = null
  if (dados.gerar_saida !== 'nao') {
    const caixas = await query('SELECT id FROM caixa_diario WHERE data = ?', [dados.data_valor])
    let caixaId
    if (caixas.length === 0) {
      const r = await run('INSERT INTO caixa_diario (data) VALUES (?)', [dados.data_valor])
      caixaId = r.changes?.lastId || r.lastId
    } else {
      caixaId = caixas[0].id
    }
    const r2 = await run(
      `INSERT INTO caixa_saidas (caixa_diario_id, categoria, valor, descricao, criado_por)
      VALUES (?, 'VALES_ESPECIES', ?, ?, ?)`,
      [caixaId, dados.valor, `Vale: ${dados.descricao || ''}`, criadoPor || null]
    )
    caixaSaidaId = r2.changes?.lastId || r2.lastId
  }

  const tipoCat = dados.tipo_pessoa === 'dancarina' ? 'VALES_ESPECIES' : 'VALES_BAR'
  const r = await run(
    'INSERT INTO vales (tipo_pessoa, pessoa_id, valor, descricao, data_valor, caixa_saida_id, criado_por) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [dados.tipo_pessoa, dados.pessoa_id, dados.valor, dados.descricao || '', dados.data_valor, caixaSaidaId, criadoPor || null]
  )
  return { id: r.changes?.lastId || r.lastId }
}

export async function pagarVale(id) {
  await run('UPDATE vales SET pago = 1 WHERE id = ? AND cancelado = 0', [id])
}

export async function excluirVale(id, motivo) {
  await run(
    "UPDATE vales SET cancelado = 1, motivo_cancelamento = ?, cancelado_em = datetime('now') WHERE id = ?",
    [motivo || 'Cancelado manualmente', id]
  )
  const vales = await query('SELECT caixa_saida_id FROM vales WHERE id = ?', [id])
  if (vales[0]?.caixa_saida_id) {
    await run(
      "UPDATE caixa_saidas SET cancelada = 1, motivo_cancelamento = ?, cancelada_em = datetime('now') WHERE id = ?",
      ['Vale cancelado', vales[0].caixa_saida_id]
    )
  }
}

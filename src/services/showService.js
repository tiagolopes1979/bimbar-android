import { query, run } from '../lib/database.js'

export async function listarShows(data) {
  const rows = await query(
    `SELECT sc.*, d.nome as dancarina_nome FROM shows_controle sc
    LEFT JOIN dancarinas d ON d.id = sc.dancarina_id
    WHERE sc.cancelado = 0 AND sc.caixa_diario_id = (SELECT id FROM caixa_diario WHERE data = ?)
    ORDER BY sc.numero_linha`,
    [data]
  )

  for (const show of rows) {
    const dancas = await query(
      `SELECT sd.*, d.nome as dancarina_nome FROM show_dancas sd
      JOIN dancarinas d ON d.id = sd.dancarina_id
      WHERE sd.show_controle_id = ?`,
      [show.id]
    )
    show.dancas = dancas
    show.dancarina_ids = dancas.map(sd => sd.dancarina_id)
    show.dancarina_nomes = dancas.map(sd => sd.dancarina_nome).join(', ')
  }

  return rows
}

export async function getProximaLinha(data) {
  const linhas = await query(
    `SELECT numero_linha FROM shows_controle
    WHERE cancelado = 0 AND caixa_diario_id = (SELECT id FROM caixa_diario WHERE data = ?)
    ORDER BY numero_linha`,
    [data]
  )
  const usadas = new Set(linhas.map(r => r.numero_linha))
  const limiteSuperior = linhas.length > 0 ? Math.max(...usadas) + 1 : 1
  for (let i = 1; i <= Math.min(limiteSuperior, 23); i++) {
    if (!usadas.has(i)) return i
  }
  if (limiteSuperior <= 23) return limiteSuperior
  for (let i = 1; i <= 23; i++) if (!usadas.has(i)) return i
  return null
}

export async function criarShow(data, dados, criadoPor) {
  const caixas = await query('SELECT id FROM caixa_diario WHERE data = ?', [data])
  let caixaId
  if (caixas.length === 0) {
    const r = await run('INSERT INTO caixa_diario (data) VALUES (?)', [data])
    caixaId = r.changes?.lastId || r.lastId
  } else {
    caixaId = caixas[0].id
  }

  const r = await run(
    `INSERT INTO shows_controle (caixa_diario_id, dancarina_id, numero_linha, valor_show, quartos, tempo, hora_entrada, hora_saida, tipo, criado_por)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [caixaId, null, dados.numero_linha, dados.valor_show, dados.quartos || 1, dados.tempo || '30 min',
      dados.hora_entrada || null, dados.hora_saida || null, dados.tipo || 'FX', criadoPor || null]
  )
  const showId = r.changes?.lastId || r.lastId

  if (dados.dancarina_ids && dados.dancarina_ids.length > 0) {
    for (const did of dados.dancarina_ids) {
      await run(
        'INSERT INTO show_dancas (show_controle_id, dancarina_id, valor_danca, quartos, hora_entrada, hora_saida) VALUES (?, ?, ?, ?, ?, ?)',
        [showId, did, dados.valor_show, dados.quartos || 1, dados.hora_entrada || null, dados.hora_saida || null]
      )
    }
  } else if (dados.dancarina_id) {
    await run(
      'INSERT INTO show_dancas (show_controle_id, dancarina_id, valor_danca, quartos, hora_entrada, hora_saida) VALUES (?, ?, ?, ?, ?, ?)',
      [showId, dados.dancarina_id, dados.valor_show, dados.quartos || 1, dados.hora_entrada || null, dados.hora_saida || null]
    )
  }

  return { id: showId }
}

export async function atualizarShow(id, dados) {
  await run(
    `UPDATE shows_controle SET numero_linha = ?, valor_show = ?, quartos = ?, tempo = ?, hora_entrada = ?, hora_saida = ?, tipo = ?
    WHERE id = ? AND cancelado = 0`,
    [dados.numero_linha, dados.valor_show, dados.quartos || 1, dados.tempo || '30 min',
      dados.hora_entrada || null, dados.hora_saida || null, dados.tipo || 'FX', id]
  )

  await run('DELETE FROM show_dancas WHERE show_controle_id = ?', [id])

  if (dados.dancarina_ids && dados.dancarina_ids.length > 0) {
    for (const did of dados.dancarina_ids) {
      await run(
        'INSERT INTO show_dancas (show_controle_id, dancarina_id, valor_danca, quartos, hora_entrada, hora_saida) VALUES (?, ?, ?, ?, ?, ?)',
        [id, did, dados.valor_show, dados.quartos || 1, dados.hora_entrada || null, dados.hora_saida || null]
      )
    }
  }
}

export async function excluirShow(id, motivo) {
  await run(
    "UPDATE shows_controle SET cancelado = 1, motivo_cancelamento = ?, cancelado_em = datetime('now') WHERE id = ?",
    [motivo || 'Cancelado manualmente', id]
  )
  await run('DELETE FROM show_dancas WHERE show_controle_id = ?', [id])
}

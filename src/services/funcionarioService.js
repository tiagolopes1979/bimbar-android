import { query, run } from '../lib/database.js'

export async function listarFuncionarios(page = 1, limit = 50) {
  const offset = (page - 1) * limit
  const rows = await query(
    `SELECT f.*, COALESCE(v.total_vales, 0) as total_vales, COALESCE(v.total_pendente, 0) as vales_pendentes
    FROM funcionarios f
    LEFT JOIN (SELECT pessoa_id, SUM(valor) as total_vales, SUM(CASE WHEN pago = 0 AND cancelado = 0 THEN valor ELSE 0 END) as total_pendente FROM vales WHERE tipo_pessoa = ? AND cancelado = 0 GROUP BY pessoa_id) v ON v.pessoa_id = f.id
    WHERE f.ativo = 1 ORDER BY f.nome LIMIT ? OFFSET ?`,
    ['funcionario', limit, offset]
  )
  const [{ c }] = await query('SELECT COUNT(*) as c FROM funcionarios WHERE ativo = 1')
  return { data: rows, total: c }
}

export async function getFuncionario(id) {
  const rows = await query('SELECT * FROM funcionarios WHERE id = ? AND ativo = 1', [id])
  return rows.length > 0 ? rows[0] : null
}

export async function criarFuncionario(dados) {
  const r = await run('INSERT INTO funcionarios (nome, cargo, telefone) VALUES (?, ?, ?)',
    [dados.nome, dados.cargo || '', dados.telefone || ''])
  return { id: r.changes?.lastId || r.lastId }
}

export async function atualizarFuncionario(id, dados) {
  await run('UPDATE funcionarios SET nome = ?, cargo = ?, telefone = ? WHERE id = ? AND ativo = 1',
    [dados.nome, dados.cargo || '', dados.telefone || '', id])
}

export async function excluirFuncionario(id) {
  await run('UPDATE funcionarios SET ativo = 0 WHERE id = ?', [id])
}

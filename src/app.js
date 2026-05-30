import { initDatabase, query, run, verifyPassword, hashPassword } from './lib/database.js'
import * as dancarinaService from './services/dancarinaService.js'
import * as caixaService from './services/caixaService.js'
import * as saidaService from './services/saidaService.js'
import * as showService from './services/showService.js'
import * as funcionarioService from './services/funcionarioService.js'
import * as valeService from './services/valeService.js'
import * as operacaoService from './services/operacaoService.js'
import * as relatorioService from './services/relatorioService.js'
import { validarChave, isAtivado, ativarChave, getServerUrl, setServerUrl, testarConexaoServidor } from './lib/license.js'
import { isDeviceCompromised, verifyAppIntegrity } from './lib/security.js'

let usuarioAtual = null
let licenseInfo = null
let deviceSecure = true

function fmt(n) { return 'R$ ' + Number(n).toFixed(2).replace('.',',') }
function fmtPct(n) { return Number(n || 0).toFixed(2).replace('.', ',') + '%' }
const hojeISO = () => new Date().toISOString().split('T')[0]
const $ = id => document.getElementById(id)
const v = id => $(id).value
function esc(val) { return String(val).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;') }
function erroHtml(m) { return '<div class="erro">' + esc(m) + '</div>' }
function sucessoHtml(m) { return '<div class="sucesso">' + esc(m) + '</div>' }

function tabela(elId, dados, colunas, botoes) {
  const el = $(elId)
  if (!dados || dados.length === 0) { el.innerHTML = '<span class="vazio">Nenhum registro encontrado.</span>'; return }
  const hasActions = botoes && botoes.length > 0
  let h = '<table><tr>' + colunas.map(c => '<th>' + esc(c.rotulo) + '</th>').join('')
  if (hasActions) h += '<th class="th-actions">Ações</th>'
  h += '</tr>'
  dados.forEach(d => {
    h += '<tr>' + colunas.map(c => {
      let val = d[c.chave]
      if (c.formato === 'moeda') val = fmt(val)
      else if (c.formato === 'data') val = val ? val.split('T')[0] : '-'
      else if (c.formato === 'simnao') val = val ? 'Sim' : 'Não'
      return '<td>' + esc(val ?? '-') + '</td>'
    }).join('')
    if (hasActions) h += '<td class="td-actions">' + botoes.map(b => `<button class="btn btn-sm ${b.classe || 'btn-ghost'}" data-action="${b.acao}" data-id="${d.id}">${b.rotulo}</button>`).join('') + '</td>'
    h += '</tr>'
  })
  h += '</table>'
  el.innerHTML = h
}

function mostrarAtivacao() {
  document.getElementById('app-ativacao').style.display = 'flex'
  document.getElementById('app-login').style.display = 'none'
  document.getElementById('app-main').style.display = 'none'
}

function mostrarLogin() {
  document.getElementById('app-ativacao').style.display = 'none'
  document.getElementById('app-login').style.display = 'flex'
  document.getElementById('app-main').style.display = 'none'
}

function mostrarMain() {
  document.getElementById('app-ativacao').style.display = 'none'
  document.getElementById('app-login').style.display = 'none'
  document.getElementById('app-main').style.display = 'flex'
}

async function handleAtivacao(e) {
  e.preventDefault()
  const key = v('ativacao-chave')
  const erro = $('erro-ativacao')
  const serverUrlInput = $('ativacao-server-url')

  if (serverUrlInput?.value.trim()) {
    try {
      await setServerUrl(serverUrlInput.value)
    } catch (err) {
      erro.textContent = err.message
      return
    }
  }

  const result = await ativarChave(key)
  if (!result.valido) {
    erro.textContent = result.motivo
    return
  }

  licenseInfo = result
  mostrarLogin()
}
window.handleAtivacao = handleAtivacao

const ALLOWED_ACTIONS = new Set([
  'lancarSaidaRapida','lancarShowRapido','abrirCaixa','fecharCaixa','excluirCaixa',
  'listarCaixas','lancarSaida','verSaidas','excluirSaida',
  'cadastrarDancarina','listarDancarinas','editarDancarina','excluirDancarina',
  'carregarDancarinasSelect','lancarShow','verShows','excluirShow',
  'cadastrarFuncionario','listarFuncionarios','excluirFuncionario',
  'carregarPessoasVale','cadastrarVale','listarVales','pagarVale','excluirVale',
  'relSaidas','relResumo','relTotalDancarinas','exportarCSV',
  'gerarPDF','imprimir','voltarPainel',
  'abrirPainel','abrirAbaDancarinas','toggleSidebar','sair',
  'salvarConfigServidor','testarConexaoServidor',
  'carregarOperacao','cancelarEdicaoDanca'
])

document.addEventListener('click', async e => {
  const btn = e.target.closest('[data-action]')
  if (!btn) return
  const action = btn.dataset.action
  const id = btn.dataset.id
  if (ALLOWED_ACTIONS.has(action) && typeof window[action] === 'function') {
    await window[action](e, id)
  }
})

document.addEventListener('change', e => {
  if (e.target.id === 'v-tipo') carregarPessoasVale()
})

// ===== LOGIN =====
let loginAttempts = 0
let loginBlockedUntil = 0

async function handleLogin(e) {
  e.preventDefault()

  const now = Date.now()
  if (now < loginBlockedUntil) {
    const s = Math.ceil((loginBlockedUntil - now) / 1000)
    $('erro-login').textContent = `Aguarde ${s}s para nova tentativa`
    return
  }

  const username = v('login-usuario')
  const password = v('login-senha')
  const erro = $('erro-login')

  if (!licenseInfo && !(await isAtivado())) {
    erro.textContent = 'Ative sua licença antes de entrar'
    mostrarAtivacao()
    return
  }

  const totalUsers = await query('SELECT COUNT(*) as total FROM usuarios')
  if (totalUsers[0]?.total === 0) {
    if (username.length < 3 || password.length < 8) {
      erro.textContent = 'Primeiro acesso: use usuário com 3+ caracteres e senha com 8+ caracteres'
      return
    }
    const { salt, hash } = await hashPassword(password)
    await run(
      "INSERT INTO usuarios (username, salt, hash, role, nome_completo, ativo) VALUES (?, ?, ?, 'admin', ?, 1)",
      [username, salt, hash, 'Administrador']
    )
  }

  const users = await query('SELECT * FROM usuarios WHERE username = ? AND ativo = 1', [username])
  if (users.length === 0) {
    loginAttempts++
    if (loginAttempts >= 5) { loginBlockedUntil = Date.now() + 30000; loginAttempts = 0 }
    erro.textContent = 'Usuário ou senha incorretos'
    return
  }

  const user = users[0]
  const ok = await verifyPassword(password, user.salt, user.hash)
  if (!ok) {
    loginAttempts++
    if (loginAttempts >= 5) { loginBlockedUntil = Date.now() + 30000; loginAttempts = 0 }
    erro.textContent = 'Usuário ou senha incorretos'
    return
  }

  loginAttempts = 0
  usuarioAtual = user
  mostrarMain()
  if (licenseInfo) {
    $('license-info').textContent = `${licenseInfo.tipoLabel} • ${licenseInfo.email || ''}`
  }
  inicializarApp()
}
window.handleLogin = handleLogin

// ===== LOGOUT =====
function sair() {
  usuarioAtual = null
  mostrarLogin()
}
window.sair = sair

// ===== SIDEBAR =====
function toggleSidebar() {
  $('sidebar').classList.toggle('aberta')
  $('sidebar-overlay').classList.toggle('visivel')
}
window.toggleSidebar = toggleSidebar

function abrirAbaDancarinas(aba) {
  document.querySelectorAll('.sub-dancarinas-cadastro, .sub-dancarinas-lancar, .sub-dancarinas-shows-dia').forEach(el => el.classList.remove('ativo'))
  document.querySelectorAll('.tab-btn[data-tab]').forEach(el => el.classList.remove('ativo'))
  const map = { cadastro: 'sub-dancarinas-cadastro', lancar: 'sub-dancarinas-lancar', 'shows-dia': 'sub-dancarinas-shows-dia' }
  const target = map[aba] || 'sub-dancarinas-cadastro'
  document.querySelector(`.${target}`)?.classList.add('ativo')
  document.querySelector(`.tab-btn[data-tab="${aba}"]`)?.classList.add('ativo')
  if (aba === 'lancar') { carregarDancarinasSelect('sh-danc') }
  if (aba === 'shows-dia') verShows()
}
window.abrirAbaDancarinas = abrirAbaDancarinas

function abrirPainel(nome) {
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('ativo'))
  document.querySelectorAll('.painel').forEach(p => p.classList.remove('ativo'))
  document.querySelector(`.nav-btn[data-painel="${nome}"]`).classList.add('ativo')
  $(`#p-${nome}`).classList.add('ativo')

  const titulos = { operacao:'⚡ Operação', caixa:'💰 Caixa', saidas:'📤 Saídas', dancarinas:'💃 Dançarinas / Shows', funcionarios:'👥 Funcionários', vales:'💳 Vales', relatorios:'📊 Relatórios', config:'⚙️ Configurações' }
  $('titulo-pagina').textContent = titulos[nome] || nome

  if (nome === 'operacao') { carregarDancarinasSelect('op-sh-danc'); carregarOperacao() }
  if (nome === 'dancarinas') carregarDancarinasSelect()
  if (nome === 'vales') carregarPessoasVale()
  if (nome === 'config') carregarConfig()
}
window.abrirPainel = abrirPainel

// ===== OPERAÇÃO =====
async function carregarOperacao() {
  const data = v('op-data') || hojeISO()
  try {
    const res = await operacaoService.getResumoOperacao(data)
    $('op-entradas').textContent = fmt(res.entradas)
    $('op-saidas').textContent = fmt(res.totalSaidas)
    $('op-saldo').textContent = fmt(res.saldoPrevisto)
    $('op-shows').textContent = res.totalShows
    $('op-valor-shows').textContent = fmt(res.totalShowsValor)
    $('op-comissao').textContent = fmt(res.totalComissao)
    $('op-vales').textContent = fmt(res.valesPendentes)
    $('op-linha').textContent = res.proximaLinha
    $('op-diferenca').textContent = res.diferenca != null ? fmt(res.diferenca) : '-'
    $('op-status').textContent = res.caixa ? 'Caixa Aberto' : 'Sem Caixa'
    $('op-status').className = 'badge ' + (res.caixa ? 'badge-success' : 'badge-warning')

    const geral = $('op-comissoes-geral')
    geral.innerHTML = res.comissoes.map(d =>
      `<div class="comissao-item"><span>${esc(d.nome)}</span><span>${fmt(d.comissao_calculada)}</span></div>`
    ).join('')

    $('op-ultimos').innerHTML = res.ultimos.length
      ? res.ultimos.map(u => `<div class="lancamento-item"><span>${u.tipo === 'saida' ? '📤' : '💃'}</span><span>${esc(u.descricao || u.categoria)}</span><span>${fmt(u.valor)}</span></div>`).join('')
      : '<span class="vazio">Nenhum lançamento hoje.</span>'

    $('op-comissoes').innerHTML = res.comissoes.length
      ? res.comissoes.map(d => `<div class="comissao-item"><span>${esc(d.nome)}</span><span>${fmt(d.comissao_calculada)}</span></div>`).join('')
      : '<span class="vazio">Nenhuma dança no dia.</span>'

    $('op-comissoes-qtd').textContent = res.comissoes.length + ' dançarinas'
  } catch (err) {
    $('op-alerta').innerHTML = erroHtml(err.message)
  }
}
window.carregarOperacao = carregarOperacao

async function lancarSaidaRapida() {
  const data = v('op-data') || hojeISO()
  try {
    await saidaService.criarSaida(data, {
      categoria: v('op-s-cat'),
      valor: parseFloat(v('op-s-val')),
      descricao: v('op-s-desc')
    }, usuarioAtual?.id)
    $('op-s-val').value = ''; $('op-s-desc').value = ''
    await carregarOperacao()
  } catch (err) { alert(err.message) }
}
window.lancarSaidaRapida = lancarSaidaRapida

async function lancarShowRapido() {
  const data = v('op-data') || hojeISO()
  try {
    await showService.criarShow(data, {
      dancarina_ids: [parseInt(v('op-sh-danc'))],
      numero_linha: parseInt(v('op-sh-linha')),
      valor_show: parseFloat(v('op-sh-valor')),
      quartos: parseInt(v('op-sh-quartos')),
      tempo: v('op-sh-preset') === 'custom' ? 'Personalizado' : v('op-sh-preset') + ' min',
      hora_entrada: v('op-sh-hrin') || null,
      hora_saida: v('op-sh-hrout') || null,
      tipo: v('op-sh-tipo')
    }, usuarioAtual?.id)
    await carregarOperacao()
  } catch (err) { alert(err.message) }
}
window.lancarShowRapido = lancarShowRapido

// ===== CAIXA =====
async function abrirCaixa() {
  try {
    await caixaService.abrirCaixa({
      data: v('cx-data') || hojeISO(),
      troco_inicial: parseFloat(v('cx-troco')) || 0,
      comanda_inicio: parseInt(v('cx-comanda-inicio')) || null,
      criado_por: usuarioAtual?.id
    })
    await listarCaixas()
  } catch (err) { alert(err.message) }
}
window.abrirCaixa = abrirCaixa

async function listarCaixas() {
  try {
    const res = await caixaService.listarCaixas()
    tabela('r-caixa', res.data, [
      {rotulo:'Data', chave:'data'}, {rotulo:'Troco', chave:'troco_inicial', formato:'moeda'},
      {rotulo:'Comandas', chave:'total_comandas', formato:'moeda'}, {rotulo:'Cartões', chave:'total_cartoes', formato:'moeda'},
      {rotulo:'Dinheiro', chave:'total_especies', formato:'moeda'}, {rotulo:'Saídas', chave:'valor_saidas', formato:'moeda'},
      {rotulo:'Diferença', chave:'diferenca_caixa', formato:'moeda'}, {rotulo:'Fechado', chave:'fechado_em'}
    ], [
      {rotulo:'Excluir', acao:'excluirCaixa', classe:'btn-danger btn-sm'}
    ])
  } catch (err) { alert(err.message) }
}
window.listarCaixas = listarCaixas

async function fecharCaixa() {
  try {
    await caixaService.fecharCaixa(v('cx-fecha-data') || hojeISO(), {
      total_comandas: parseFloat(v('cx-com')) || 0,
      total_cartoes: parseFloat(v('cx-car')) || 0,
      total_especies: parseFloat(v('cx-esp')) || 0,
      comanda_fim: parseInt(v('cx-comanda-fim')) || null,
      dinheiro_contado: parseFloat(v('cx-dinheiro')) || null,
      responsavel_fechamento: v('cx-responsavel'),
      observacao: v('cx-obs')
    })
    await listarCaixas()
  } catch (err) { alert(err.message) }
}
window.fecharCaixa = fecharCaixa

async function excluirCaixa(e, id) {
  if (!confirm('Excluir caixa deste dia?')) return
  try {
    await caixaService.excluirCaixa(id)
    await listarCaixas()
  } catch (err) { alert(err.message) }
}
window.excluirCaixa = excluirCaixa

// ===== SAÍDAS =====
async function lancarSaida() {
  const data = v('s-data') || hojeISO()
  try {
    await saidaService.criarSaida(data, {
      categoria: v('s-cat'),
      valor: parseFloat(v('s-val')),
      descricao: v('s-desc')
    }, usuarioAtual?.id)
    await verSaidas()
  } catch (err) { alert(err.message) }
}
window.lancarSaida = lancarSaida

async function verSaidas() {
  const data = v('s-data') || hojeISO()
  try {
    const rows = await saidaService.listarSaidas(data)
    tabela('r-saidas', rows, [
      {rotulo:'Categoria', chave:'categoria'}, {rotulo:'Valor', chave:'valor', formato:'moeda'},
      {rotulo:'Descrição', chave:'descricao'}, {rotulo:'Criado por', chave:'criado_por_nome'}
    ], [
      {rotulo:'Excluir', acao:'excluirSaida', classe:'btn-danger btn-sm'}
    ])
  } catch (err) { alert(err.message) }
}
window.verSaidas = verSaidas

async function excluirSaida(e, id) {
  if (!confirm('Excluir esta saída?')) return
  try {
    await saidaService.excluirSaida(id)
    await verSaidas()
  } catch (err) { alert(err.message) }
}
window.excluirSaida = excluirSaida

// ===== DANÇARINAS =====
async function cadastrarDancarina() {
  const id = $('btn-cadastrar-danca').dataset.editId
  const dados = {
    nome: v('d-nome'), telefone: v('d-tel'),
    comissao: parseFloat(v('d-comissao')) || 0,
    comissao_percentual: parseFloat(v('d-comissao-pct')) || 30,
    comissao_danca_percentual: parseFloat(v('d-comissao-danca-pct')) || 62.50,
    danca_30_nome: v('d-d1-nome'), danca_30_qty: parseInt(v('d-d1-qty')) || 0, danca_30_valor: parseFloat(v('d-d1-val')) || 160,
    danca_60_nome: v('d-d2-nome'), danca_60_qty: parseInt(v('d-d2-qty')) || 0, danca_60_valor: parseFloat(v('d-d2-val')) || 320,
    danca_3_nome: v('d-d3-nome'), danca_3_qty: parseInt(v('d-d3-qty')) || 0, danca_3_valor: parseFloat(v('d-d3-val')) || 0,
    danca_4_nome: v('d-d4-nome'), danca_4_qty: parseInt(v('d-d4-qty')) || 0, danca_4_valor: parseFloat(v('d-d4-val')) || 0
  }
  try {
    if (id) { await dancarinaService.atualizarDancarina(parseInt(id), dados) }
    else { await dancarinaService.criarDancarina(dados) }
    await listarDancarinas()
  } catch (err) { alert(err.message) }
}
window.cadastrarDancarina = cadastrarDancarina

async function listarDancarinas() {
  try {
    const res = await dancarinaService.listarDancarinas()
    tabela('r-dancarinas', res.data, [
      {rotulo:'Nome', chave:'nome'}, {rotulo:'Telefone', chave:'telefone'},
      {rotulo:'Comissão', chave:'comissao', formato:'moeda'}, {rotulo:'Com %', chave:'comissao_percentual', formato:'porcentagem'},
      {rotulo:'Vales Pend.', chave:'vales_pendentes', formato:'moeda'}
    ], [
      {rotulo:'Editar', acao:'editarDancarina', classe:'btn-primary btn-sm'},
      {rotulo:'Excluir', acao:'excluirDancarina', classe:'btn-danger btn-sm'}
    ])
  } catch (err) { alert(err.message) }
}
window.listarDancarinas = listarDancarinas

async function editarDancarina(e, id) {
  try {
    const d = await dancarinaService.getDancarina(parseInt(id))
    if (!d) return
    $('d-nome').value = d.nome; $('d-tel').value = d.telefone || ''
    $('d-comissao').value = d.comissao; $('d-comissao-pct').value = d.comissao_percentual
    $('d-comissao-danca-pct').value = d.comissao_danca_percentual
    $('d-d1-nome').value = d.danca_30_nome; $('d-d1-qty').value = d.danca_30_qty; $('d-d1-val').value = d.danca_30_valor
    $('d-d2-nome').value = d.danca_60_nome; $('d-d2-qty').value = d.danca_60_qty; $('d-d2-val').value = d.danca_60_valor
    $('d-d3-nome').value = d.danca_3_nome || ''; $('d-d3-qty').value = d.danca_3_qty || 0; $('d-d3-val').value = d.danca_3_valor || 0
    $('d-d4-nome').value = d.danca_4_nome || ''; $('d-d4-qty').value = d.danca_4_qty || 0; $('d-d4-val').value = d.danca_4_valor || 0
    $('btn-cadastrar-danca').dataset.editId = id
    $('btn-cadastrar-danca').textContent = 'Atualizar'
    $('btn-cancelar-danca').classList.remove('hidden')
  } catch (err) { alert(err.message) }
}
window.editarDancarina = editarDancarina

function cancelarEdicaoDanca() {
  delete $('btn-cadastrar-danca').dataset.editId
  $('btn-cadastrar-danca').textContent = 'Cadastrar'
  $('btn-cancelar-danca').classList.add('hidden')
}
window.cancelarEdicaoDanca = cancelarEdicaoDanca

async function excluirDancarina(e, id) {
  if (!confirm('Excluir esta dançarina?')) return
  try { await dancarinaService.excluirDancarina(parseInt(id)); await listarDancarinas() }
  catch (err) { alert(err.message) }
}
window.excluirDancarina = excluirDancarina

async function carregarDancarinasSelect(elId = 'sh-danc') {
  try {
    const rows = await dancarinaService.listarDancarinasSelect()
    const sel = $(elId)
    sel.innerHTML = rows.map(d => `<option value="${d.id}">${esc(d.nome)}</option>`).join('')
  } catch (err) {}
}
window.carregarDancarinasSelect = carregarDancarinasSelect

// ===== SHOWS =====
async function lancarShow() {
  const data = v('sh-data') || hojeISO()
  const sel = $('sh-danc')
  const ids = Array.from(sel.selectedOptions).map(o => parseInt(o.value))
  try {
    await showService.criarShow(data, {
      dancarina_ids: ids,
      numero_linha: parseInt(v('sh-linha')),
      valor_show: parseFloat(v('sh-valor')),
      quartos: parseInt(v('sh-quartos')) || 1,
      tempo: v('sh-tempo'),
      hora_entrada: v('sh-hrin') || null,
      hora_saida: v('sh-hrout') || null,
      tipo: v('sh-tipo')
    }, usuarioAtual?.id)
    await verShows()
  } catch (err) { alert(err.message) }
}
window.lancarShow = lancarShow

async function verShows() {
  const data = v('sh-data') || hojeISO()
  try {
    const rows = await showService.listarShows(data)
    tabela('r-shows', rows, [
      {rotulo:'Linha', chave:'numero_linha'}, {rotulo:'Dançarinas', chave:'dancarina_nomes'},
      {rotulo:'Valor', chave:'valor_show', formato:'moeda'}, {rotulo:'Quartos', chave:'quartos'},
      {rotulo:'Tipo', chave:'tipo'}, {rotulo:'Horário', chave:'hora_entrada'}
    ], [
      {rotulo:'Excluir', acao:'excluirShow', classe:'btn-danger btn-sm'}
    ])
  } catch (err) { alert(err.message) }
}
window.verShows = verShows

async function excluirShow(e, id) {
  if (!confirm('Excluir este show?')) return
  try { await showService.excluirShow(parseInt(id)); await verShows() }
  catch (err) { alert(err.message) }
}
window.excluirShow = excluirShow

// ===== FUNCIONÁRIOS =====
async function cadastrarFuncionario() {
  try {
    await funcionarioService.criarFuncionario({
      nome: v('f-nome'), cargo: v('f-cargo'), telefone: v('f-tel')
    })
    await listarFuncionarios()
  } catch (err) { alert(err.message) }
}
window.cadastrarFuncionario = cadastrarFuncionario

async function listarFuncionarios() {
  try {
    const res = await funcionarioService.listarFuncionarios()
    tabela('r-funcionarios', res.data, [
      {rotulo:'Nome', chave:'nome'}, {rotulo:'Cargo', chave:'cargo'},
      {rotulo:'Telefone', chave:'telefone'}, {rotulo:'Vales Pend.', chave:'vales_pendentes', formato:'moeda'}
    ], [
      {rotulo:'Excluir', acao:'excluirFuncionario', classe:'btn-danger btn-sm'}
    ])
  } catch (err) { alert(err.message) }
}
window.listarFuncionarios = listarFuncionarios

async function excluirFuncionario(e, id) {
  if (!confirm('Excluir este funcionário?')) return
  try { await funcionarioService.excluirFuncionario(parseInt(id)); await listarFuncionarios() }
  catch (err) { alert(err.message) }
}
window.excluirFuncionario = excluirFuncionario

// ===== VALES =====
async function carregarPessoasVale() {
  const tipo = v('v-tipo')
  const sel = $('v-pessoa')
  try {
    const rows = tipo === 'dancarina'
      ? await dancarinaService.listarDancarinasSelect()
      : await funcionarioService.listarFuncionarios()
    sel.innerHTML = rows.map(r => `<option value="${r.id}">${esc(r.nome)}</option>`).join('')
  } catch (err) {}
}
window.carregarPessoasVale = carregarPessoasVale

async function cadastrarVale() {
  try {
    await valeService.criarVale({
      tipo_pessoa: v('v-tipo'),
      pessoa_id: parseInt(v('v-pessoa')),
      valor: parseFloat(v('v-valor')),
      descricao: v('v-desc'),
      data_valor: v('v-data') || hojeISO(),
      gerar_saida: v('v-gerar-saida')
    }, usuarioAtual?.id)
    await listarVales()
  } catch (err) { alert(err.message) }
}
window.cadastrarVale = cadastrarVale

async function listarVales() {
  try {
    const rows = await valeService.listarVales()
    tabela('r-vales', rows, [
      {rotulo:'Tipo', chave:'tipo_pessoa'}, {rotulo:'Pessoa', chave:'pessoa_nome'},
      {rotulo:'Valor', chave:'valor', formato:'moeda'}, {rotulo:'Descrição', chave:'descricao'},
      {rotulo:'Pago', chave:'pago', formato:'simnao'}, {rotulo:'Data', chave:'data_valor'}
    ], [
      {rotulo:'Pagar', acao:'pagarVale', classe:'btn-success btn-sm'},
      {rotulo:'Excluir', acao:'excluirVale', classe:'btn-danger btn-sm'}
    ])
  } catch (err) { alert(err.message) }
}
window.listarVales = listarVales

async function pagarVale(e, id) {
  if (!confirm('Marcar este vale como pago?')) return
  try { await valeService.pagarVale(parseInt(id)); await listarVales() }
  catch (err) { alert(err.message) }
}
window.pagarVale = pagarVale

async function excluirVale(e, id) {
  if (!confirm('Excluir este vale?')) return
  try { await valeService.excluirVale(parseInt(id)); await listarVales() }
  catch (err) { alert(err.message) }
}
window.excluirVale = excluirVale

// ===== RELATÓRIOS =====
async function relSaidas() {
  const data = v('rel-data') || hojeISO()
  try {
    const rows = await relatorioService.saidasPorCategoria(data)
    tabela('r-relatorios', rows, [
      {rotulo:'Categoria', chave:'categoria'}, {rotulo:'Qtd', chave:'quantidade'},
      {rotulo:'Total', chave:'total', formato:'moeda'}
    ])
  } catch (err) { alert(err.message) }
}
window.relSaidas = relSaidas

async function relResumo() {
  const data = v('rel-data') || hojeISO()
  try {
    const res = await relatorioService.resumoCaixa(data)
    if (!res) { $('r-relatorios').innerHTML = erroHtml('Nenhum caixa encontrado para esta data.'); return }
    $('r-relatorios').innerHTML = `
      <div class="resumo-card">
        <div class="resumo-item"><span class="rotulo">📅 Data</span><span class="vd">${res.data}</span></div>
        <div class="resumo-item"><span class="rotulo">💰 Troco Inicial</span><span class="vd">${fmt(res.troco_inicial)}</span></div>
        <div class="resumo-item"><span class="rotulo">🍺 Comandas</span><span class="vd">${fmt(res.total_comandas)}</span></div>
        <div class="resumo-item"><span class="rotulo">💳 Cartões</span><span class="vd">${fmt(res.total_cartoes)}</span></div>
        <div class="resumo-item"><span class="rotulo">💵 Dinheiro</span><span class="vd">${fmt(res.total_especies)}</span></div>
        <div class="resumo-item"><span class="rotulo">📥 Total Entradas</span><span class="vd">${fmt(res.entradas)}</span></div>
        <div class="resumo-item"><span class="rotulo">📤 Total Saídas</span><span class="vd primary-text">${fmt(res.totalSaidas)}</span></div>
        <div class="resumo-item"><span class="rotulo">✅ Saldo Final</span><span class="vd">${fmt(res.saldo)}</span></div>
        <div class="resumo-item"><span class="rotulo">💃 Shows</span><span class="vd">${res.total_shows}</span></div>
        <div class="resumo-item"><span class="rotulo">💃 Dançarinas</span><span class="vd">${res.total_dancarinas}</span></div>
        ${res.diferenca_caixa != null ? `<div class="resumo-item"><span class="rotulo">📊 Diferença</span><span class="vd">${fmt(res.diferenca_caixa)}</span></div>` : ''}
        ${res.responsavel_fechamento ? `<div class="resumo-item"><span class="rotulo">👤 Responsável</span><span class="vd">${esc(res.responsavel_fechamento)}</span></div>` : ''}
      </div>`
  } catch (err) { alert(err.message) }
}
window.relResumo = relResumo

async function relTotalDancarinas() {
  const data = v('rel-data') || hojeISO()
  try {
    const rows = await relatorioService.totalDancarinas(data)
    tabela('r-relatorios', rows, [
      {rotulo:'Dançarina', chave:'nome'}, {rotulo:'Danças', chave:'total_dancas'},
      {rotulo:'Valor Total', chave:'valor_total', formato:'moeda'}, {rotulo:'Quartos', chave:'total_quartos'},
      {rotulo:'FX', chave:'fx_count'}, {rotulo:'FL', chave:'fl_count'}
    ])
  } catch (err) { alert(err.message) }
}
window.relTotalDancarinas = relTotalDancarinas

function escCsv(val) {
  const s = String(val ?? '')
  if (/^[=+\-@]/.test(s)) return "'" + s
  if (s.includes(',') || s.includes('"') || s.includes('\n')) return '"' + s.replace(/"/g, '""') + '"'
  return s
}

async function exportarCSV() {
  const data = v('rel-data') || hojeISO()
  try {
    const [saidas, resumo, dancarinas] = await Promise.all([
      relatorioService.saidasPorCategoria(data),
      relatorioService.resumoCaixa(data),
      relatorioService.totalDancarinas(data)
    ])
    let csv = '=== SAÍDAS POR CATEGORIA ===\nCategoria,Quantidade,Total\n'
    csv += saidas.map(s => `${escCsv(s.categoria)},${s.quantidade},${s.total}`).join('\n')
    csv += '\n\n=== RESUMO CAIXA ===\n'
    if (resumo) csv += Object.entries(resumo).map(([k, v]) => `${escCsv(k)},${escCsv(v)}`).join('\n')
    csv += '\n\n=== TOTAL DANÇARINAS ===\nDançarina,Danças,Valor,Quartos\n'
    csv += dancarinas.map(d => `${escCsv(d.nome)},${d.total_dancas},${d.valor_total},${d.total_quartos}`).join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `relatorio-${data}.csv`; a.click()
    URL.revokeObjectURL(url)
  } catch (err) { alert(err.message) }
}
window.exportarCSV = exportarCSV

// ===== PDF / PRINT =====
async function gerarPDF() {
  const data = v('cx-fecha-data') || hojeISO()
  try {
    const [resumo, saidas, financeiro] = await Promise.all([
      relatorioService.resumoCaixa(data),
      relatorioService.saidasPorCategoria(data),
      relatorioService.financeiroDancarinas(data)
    ])
    if (!resumo) { alert('Nenhum caixa encontrado para esta data.'); return }

    $('print-data').textContent = new Date(data + 'T12:00:00').toLocaleDateString('pt-BR')
    $('p-data').textContent = resumo.data
    $('p-troco').textContent = fmt(resumo.troco_inicial)
    $('p-comandas').textContent = fmt(resumo.total_comandas)
    $('p-comanda-inicio').textContent = resumo.comanda_inicio ?? '-'
    $('p-comanda-fim').textContent = resumo.comanda_fim ?? '-'
    $('p-cartoes').textContent = fmt(resumo.total_cartoes)
    $('p-especies').textContent = fmt(resumo.total_especies)
    $('p-entradas').textContent = fmt(resumo.entradas)
    $('p-saidas-val').textContent = fmt(resumo.totalSaidas)
    $('p-saldo').textContent = fmt(resumo.saldo)

    tabela('p-print-saidas', saidas, [
      {rotulo:'Categoria', chave:'categoria'}, {rotulo:'Qtd', chave:'quantidade'}, {rotulo:'Total', chave:'total', formato:'moeda'}
    ])

    if (financeiro.length > 0) {
      $('p-print-dancarinas').innerHTML = financeiro.map(d =>
        `<div class="comissao-item">
          <span>${esc(d.nome)}</span>
          <span>${d.total_dancas} danças | ${fmt(d.valor_shows)} | Comissão: ${fmt(d.comissao_calculada)} | Vales: ${fmt(d.total_vales)} | Receber: ${fmt(d.valor_a_receber)}</span>
        </div>`
      ).join('<hr>')
    } else {
      $('p-print-dancarinas').innerHTML = '<span class="vazio">Nenhuma dançarina.</span>'
    }

    $('print-gerado-em').textContent = new Date().toLocaleString('pt-BR')
    abrirPainel('print')
  } catch (err) { alert(err.message) }
}
window.gerarPDF = gerarPDF

function imprimir() { window.print() }
window.imprimir = imprimir

function voltarPainel() { abrirPainel('caixa') }
window.voltarPainel = voltarPainel

// ===== INIT =====
function atualizarData() {
  $('data-atual').textContent = new Date().toLocaleDateString('pt-BR', { weekday:'long', year:'numeric', month:'long', day:'numeric' })
}

function inicializarApp() {
  atualizarData()
  document.querySelectorAll('input[type="date"]').forEach(el => { if (!el.value) el.value = hojeISO() })
  carregarOperacao()
  carregarDancarinasSelect('op-sh-danc')
}

// ===== CONFIGURAÇÕES =====
async function carregarConfig() {
  try {
    const url = await getServerUrl()
    $('cfg-server-url').value = url

    if (licenseInfo) {
      $('cfg-lic-tipo').textContent = licenseInfo.tipoLabel || licenseInfo.tipo || '-'
      $('cfg-lic-email').textContent = licenseInfo.email || '-'
      $('cfg-lic-exp').textContent = licenseInfo.exp ? new Date(licenseInfo.exp).toLocaleDateString('pt-BR') : 'Nunca expira'
    }
    const originRows = await query("SELECT valor FROM config WHERE chave = 'license_origin'")
    $('cfg-lic-origem').textContent = originRows.length > 0 ? originRows[0].valor === 'server' ? 'Servidor online ✅' : 'Local (offline) 🔒' : '-'
  } catch (e) {
    $('cfg-status').innerHTML = erroHtml('Erro ao carregar: ' + e.message)
  }
}

async function salvarConfigServidor() {
  const url = $('cfg-server-url').value.trim()
  const status = $('cfg-status')
  try {
    await setServerUrl(url)
    status.innerHTML = sucessoHtml('URL salva com sucesso!')
  } catch (e) {
    status.innerHTML = erroHtml(e.message)
  }
}
window.salvarConfigServidor = salvarConfigServidor

async function handleTestarConexao() {
  const status = $('cfg-status')
  status.innerHTML = '<span style="color:#f0b429">Testando conexão...</span>'
  const res = await testarConexaoServidor()
  status.innerHTML = res.ok ? sucessoHtml(res.motivo) : erroHtml(res.motivo)
}
window.testarConexaoServidor = handleTestarConexao

async function init() {
  try {
    // 1. Verificar segurança do dispositivo
    const securityCheck = await isDeviceCompromised()
    if (securityCheck) {
      document.body.innerHTML = `
        <div style="padding:40px;color:#ff3b6f;text-align:center;max-width:500px;margin:0 auto">
          <h2>⚠️ Dispositivo Não Seguro</h2>
          <p style="color:#9898b0;margin:20px 0">
            Detectamos que este dispositivo pode estar comprometido (root/jailbreak).
            Por segurança, o Bimbar não pode ser executado neste ambiente.
          </p>
          <p style="color:#666;font-size:14px">
            Se você acredita que isso é um erro, entre em contato com o suporte.
          </p>
        </div>
      `
      return
    }

    deviceSecure = true

    // 2. Verificar integridade do app
    const integrityCheck = await verifyAppIntegrity()
    if (!integrityCheck.valid) {
      document.body.innerHTML = `
        <div style="padding:40px;color:#ff3b6f;text-align:center;max-width:500px;margin:0 auto">
          <h2>⚠️ Aplicativo Modificado</h2>
          <p style="color:#9898b0;margin:20px 0">
            A integridade do aplicativo não pôde ser verificada.
            Por favor, reinstale o app da fonte oficial.
          </p>
        </div>
      `
      return
    }

    // 3. Inicializar banco de dados
    await initDatabase()

    // 4. Verificar licença
    if (await isAtivado()) {
      const rows = await query('SELECT valor FROM config WHERE chave = ?', ['license_key'])
      if (rows.length > 0) {
        const result = await validarChave(rows[0].valor)
        if (result.valido) {
          licenseInfo = result
          mostrarLogin()
          return
        }
      }
    }

    mostrarAtivacao()
  } catch (err) {
    console.error('Erro ao iniciar:', err)
    document.body.innerHTML = `<div style="padding:40px;color:red">Erro ao iniciar: ${esc(err.message)}</div>`
  }
}

init()

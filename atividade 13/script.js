// ===== CALENDÁRIO CUSTOMIZADO =====
const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho',
               'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
const DIAS_SEMANA = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb']

let calAtual = new Date()   // mês/ano exibido no calendário
let calSelecionado = null   // data selecionada (objeto Date)

const calEl       = document.getElementById('calendario')
const dataDisplay = document.getElementById('data-display')
const dataHidden  = document.getElementById('data')

// Abre/fecha o calendário ao clicar no input
dataDisplay.addEventListener('click', (e) => {
  e.stopPropagation()
  calEl.classList.toggle('hidden')
  if (!calEl.classList.contains('hidden')) renderCalendario()
})

// Fecha ao clicar em qualquer lugar fora do calendário e do input
document.addEventListener('click', (e) => {
  if (!calEl.classList.contains('hidden') &&
      !calEl.contains(e.target) &&
      e.target !== dataDisplay) {
    calEl.classList.add('hidden')
  }
})

// Impede que cliques dentro do calendário propaguem para o document
calEl.addEventListener('click', (e) => e.stopPropagation())

function renderCalendario() {
  const hoje  = new Date()
  hoje.setHours(0,0,0,0)

  const ano = calAtual.getFullYear()
  const mes = calAtual.getMonth()

  // Limpa e monta o cabeçalho
  calEl.innerHTML = `
    <div class="cal-header">
      <button class="cal-nav" id="cal-prev" type="button">‹</button>
      <span>${MESES[mes]} ${ano}</span>
      <button class="cal-nav" id="cal-next" type="button">›</button>
    </div>
    <div class="cal-grid" id="cal-grid"></div>
  `

  document.getElementById('cal-prev').addEventListener('click', (e) => {
    calAtual.setMonth(calAtual.getMonth() - 1)
    renderCalendario()
  })

  document.getElementById('cal-next').addEventListener('click', (e) => {
    calAtual.setMonth(calAtual.getMonth() + 1)
    renderCalendario()
  })

  const grid = document.getElementById('cal-grid')

  // Cabeçalho dos dias da semana
  DIAS_SEMANA.forEach(d => {
    const span = document.createElement('span')
    span.classList.add('cal-dia-semana')
    span.textContent = d
    grid.appendChild(span)
  })

  // Dia da semana do primeiro dia do mês (0=Dom)
  const primeiroDia = new Date(ano, mes, 1).getDay()
  // Total de dias no mês
  const totalDias  = new Date(ano, mes + 1, 0).getDate()

  // Células vazias antes do dia 1
  for (let i = 0; i < primeiroDia; i++) {
    const vazio = document.createElement('button')
    vazio.classList.add('cal-dia', 'cal-vazio')
    vazio.type = 'button'
    grid.appendChild(vazio)
  }

  // Dias do mês
  for (let dia = 1; dia <= totalDias; dia++) {
    const btn  = document.createElement('button')
    btn.type   = 'button'
    btn.classList.add('cal-dia')
    btn.textContent = dia

    const dataBtn = new Date(ano, mes, dia)
    dataBtn.setHours(0,0,0,0)

    if (dataBtn < hoje) {
      // Dia passado — desabilitado
      btn.classList.add('cal-passado')
    } else {
      if (dataBtn.getTime() === hoje.getTime()) btn.classList.add('cal-hoje')

      if (calSelecionado && dataBtn.getTime() === calSelecionado.getTime()) {
        btn.classList.add('cal-selecionado')
      }

      btn.addEventListener('click', () => {
        calSelecionado = dataBtn

        // Formata para exibição (DD/MM/AAAA)
        const dd = String(dia).padStart(2,'0')
        const mm = String(mes + 1).padStart(2,'0')
        dataDisplay.value = `${dd}/${mm}/${ano}`

        // Valor real no formato YYYY-MM-DD para o script
        dataHidden.value = `${ano}-${mm}-${dd}`

        // Dispara change para atualizar o mapa de cadeiras
        dataHidden.dispatchEvent(new Event('change'))

        calEl.classList.add('hidden')
      })
    }

    grid.appendChild(btn)
  }
}

// ===== PROTEÇÃO DE ROTA =====
// Se não houver sessão ativa, redireciona para o login
const sessao = JSON.parse(localStorage.getItem('cinema-sessao') || 'null')
if (!sessao) {
  window.location.href = 'login.html'
}

// Exibe o nome do usuário logado
document.getElementById('user-nome').textContent = `👤 ${sessao ? sessao.nome : ''}`

// Logout — remove a sessão e volta para o login
document.getElementById('btn-logout').addEventListener('click', () => {
  if (confirm('Deseja sair?')) {
    localStorage.removeItem('cinema-sessao')
    window.location.href = 'login.html'
  }
})

// ===== CONSTANTES =====
const PRECO_INTEIRA   = 30
const PRECO_ESTUDANTE = 15
const MAX_CADEIRAS    = 6

// Retorna a quantidade de cadeiras da sala selecionada
function totalCadeiras() {
  return parseInt(document.getElementById('sala').value) || 35
}

// ===== ESTADO =====
const tabela = document.getElementById('tabela-reservas').getElementsByTagName('tbody')[0]

// Map: "filme|data|horario" → Set de cadeiras ocupadas (por sessão)
const ocupadasPorSessao = new Map()

// Map: número → tipo — cadeiras em seleção atual
const cadeirasSelecionadas = new Map()

// Controle de ordenação da tabela
const sortState = { col: -1, asc: true }

const tooltip = document.getElementById('tooltip')

// ===== TEMA =====
function aplicarTema(tema) {
  document.documentElement.setAttribute('data-theme', tema)
  document.getElementById('btn-tema').textContent = tema === 'dark' ? '🌙' : '☀️'
  localStorage.setItem('cinema-tema', tema)
}

document.getElementById('btn-tema').addEventListener('click', () => {
  const atual = document.documentElement.getAttribute('data-theme')
  aplicarTema(atual === 'dark' ? 'light' : 'dark')
})

// ===== SESSÃO =====
function chaveSessao() {
  const filme   = document.getElementById('filme').value
  const data    = document.getElementById('data').value
  const horario = document.getElementById('horario').value
  const sala    = document.getElementById('sala').value
  return `${filme}|${data}|${horario}|${sala}`
}

function ocupadasDaSessao(chave) {
  if (!ocupadasPorSessao.has(chave)) ocupadasPorSessao.set(chave, new Set())
  return ocupadasPorSessao.get(chave)
}

// ===== MAPA =====
function gerarMapa() {
  renderizarMapa()
}

// Reconstrói o mapa inteiro conforme a sala selecionada
function renderizarMapa() {
  const total = totalCadeiras()
  const cols  = total === 35 ? 7 : 10   // 35 = 5 fileiras x 7 | 70 = 7 fileiras x 10
  const mapa  = document.getElementById('mapa-cadeiras')
  mapa.innerHTML = ''
  mapa.style.gridTemplateColumns = `repeat(${cols}, 1fr)`

  const tela = document.createElement('div')
  tela.classList.add('tela')
  tela.textContent = '🎥 TELA'
  mapa.appendChild(tela)

  for (let i = 1; i <= total; i++) {
    const btn = document.createElement('button')
    btn.classList.add('cadeira')
    btn.textContent = i
    btn.id = `cadeira-${i}`
    btn.type = 'button'

    btn.addEventListener('click',      () => toggleSelecionada(i))
    btn.addEventListener('mouseenter', (e) => mostrarTooltip(e, i))
    btn.addEventListener('mousemove',  (e) => moverTooltip(e))
    btn.addEventListener('mouseleave', () => esconderTooltip())

    mapa.appendChild(btn)
  }

  // Limpa seleção ao trocar de sala
  cadeirasSelecionadas.clear()
  atualizarTags()
  atualizarTotal()
}

function atualizarMapa() {
  const chave    = chaveSessao()
  const ocupadas = ocupadasDaSessao(chave)
  const total    = totalCadeiras()
  let ocupadasCount = 0

  for (let i = 1; i <= total; i++) {
    const btn = document.getElementById(`cadeira-${i}`)
    if (!btn) continue
    btn.classList.remove('ocupada', 'selecionada')

    if (ocupadas.has(i)) {
      btn.classList.add('ocupada')
      ocupadasCount++
    } else if (cadeirasSelecionadas.has(i)) {
      btn.classList.add('selecionada')
    }
  }

  document.getElementById('contador-mapa').textContent =
    `${total - ocupadasCount} livres · ${ocupadasCount} ocupadas`
}

function toggleSelecionada(numero) {
  const chave    = chaveSessao()
  const ocupadas = ocupadasDaSessao(chave)
  if (ocupadas.has(numero)) return

  const btn = document.getElementById(`cadeira-${numero}`)

  if (cadeirasSelecionadas.has(numero)) {
    cadeirasSelecionadas.delete(numero)
    btn.classList.remove('selecionada')
  } else {
    if (cadeirasSelecionadas.size >= MAX_CADEIRAS) {
      alert(`Limite de ${MAX_CADEIRAS} cadeiras por reserva atingido.`)
      return
    }
    cadeirasSelecionadas.set(numero, 'Inteira')
    btn.classList.add('selecionada')
  }

  atualizarTags()
  atualizarTotal()
  atualizarMapa()
}

// ===== TOOLTIP =====
function mostrarTooltip(e, numero) {
  const chave    = chaveSessao()
  const ocupadas = ocupadasDaSessao(chave)
  const status   = ocupadas.has(numero)
    ? '🔴 Ocupada'
    : cadeirasSelecionadas.has(numero)
      ? '🟡 Selecionada'
      : '🟢 Livre'

  tooltip.textContent = `Cadeira ${numero} — ${status}`
  tooltip.classList.add('visivel')
  moverTooltip(e)
}
function moverTooltip(e) {
  tooltip.style.left = (e.clientX + 12) + 'px'
  tooltip.style.top  = (e.clientY + 12) + 'px'
}
function esconderTooltip() { tooltip.classList.remove('visivel') }

// ===== TAGS =====
function atualizarTags() {
  const box      = document.getElementById('cadeiras-selecionadas')
  const contador = document.getElementById('contador-sel')
  box.innerHTML  = ''

  if (cadeirasSelecionadas.size === 0) {
    box.innerHTML = `<span class="placeholder-tag">Clique nas cadeiras no mapa abaixo (máx. ${MAX_CADEIRAS})</span>`
    contador.textContent = ''
    return
  }

  contador.textContent = `(${cadeirasSelecionadas.size}/${MAX_CADEIRAS})`

  ;[...cadeirasSelecionadas.keys()].sort((a, b) => a - b).forEach(numero => {
    const tipo = cadeirasSelecionadas.get(numero)

    const tag = document.createElement('div')
    tag.classList.add('tag')

    const num = document.createElement('span')
    num.classList.add('tag-num')
    num.textContent = `Cadeira ${numero}`

    const sel = document.createElement('select')
    sel.innerHTML = `
      <option value="Inteira"   ${tipo === 'Inteira'   ? 'selected' : ''}>🎟️ Inteira R$${PRECO_INTEIRA}</option>
      <option value="Estudante" ${tipo === 'Estudante' ? 'selected' : ''}>🎓 Estudante R$${PRECO_ESTUDANTE}</option>
    `
    sel.addEventListener('change', () => {
      cadeirasSelecionadas.set(numero, sel.value)
      atualizarTotal()
    })

    const removeBtn = document.createElement('button')
    removeBtn.classList.add('tag-remove')
    removeBtn.type = 'button'
    removeBtn.textContent = '✕'
    removeBtn.addEventListener('click', () => {
      cadeirasSelecionadas.delete(numero)
      document.getElementById(`cadeira-${numero}`).classList.remove('selecionada')
      atualizarTags()
      atualizarTotal()
      atualizarMapa()
    })

    tag.appendChild(num)
    tag.appendChild(sel)
    tag.appendChild(removeBtn)
    box.appendChild(tag)
  })
}

// ===== TOTAL =====
function atualizarTotal() {
  let total = 0
  cadeirasSelecionadas.forEach(tipo => {
    total += tipo === 'Inteira' ? PRECO_INTEIRA : PRECO_ESTUDANTE
  })
  document.getElementById('total-valor').textContent =
    `R$ ${total.toFixed(2).replace('.', ',')}`
}

// ===== MODAL COMPROVANTE =====
function abrirModal(dados) {
  const cadeirasHtml = dados.lista.map(c => {
    const cls = c.tipo === 'Inteira' ? 'tipo-inteira' : 'tipo-estudante'
    return `<div class="item-cadeira">Cadeira ${c.numero} — <span class="${cls}">${c.tipo}</span></div>`
  }).join('')

  document.getElementById('modal-conteudo').innerHTML = `
    <h3>✅ Reserva Confirmada!</h3>
    <p><strong>Cliente:</strong> ${dados.nome}</p>
    <p><strong>Filme:</strong> ${dados.filme}</p>
    <p><strong>Data:</strong> ${dados.data} às ${dados.horario}</p>
    <p><strong>Sala:</strong> ${dados.sala === '70' ? 'Sala 2' : 'Sala 1'} (${dados.sala} cadeiras)</p>
    <div class="comprovante-cadeiras">${cadeirasHtml}</div>
    <p style="margin-top:0.75rem"><strong>Total:</strong> ${dados.totalStr}</p>
  `
  document.getElementById('modal-overlay').classList.remove('hidden')
}

document.getElementById('btn-fechar').addEventListener('click', () => {
  document.getElementById('modal-overlay').classList.add('hidden')
})

document.getElementById('btn-imprimir').addEventListener('click', () => {
  window.print()
})

// Fecha modal ao clicar fora
document.getElementById('modal-overlay').addEventListener('click', (e) => {
  if (e.target === document.getElementById('modal-overlay')) {
    document.getElementById('modal-overlay').classList.add('hidden')
  }
})

// ===== FILTRO =====
document.getElementById('filtro').addEventListener('input', function () {
  const termo = this.value.toLowerCase()
  tabela.querySelectorAll('tr').forEach(linha => {
    const celulas = linha.querySelectorAll('td')
    if (!celulas.length) return
    const nome  = celulas[0].innerText.toLowerCase()
    const filme = celulas[1].innerText.toLowerCase()
    linha.classList.toggle('oculta', !nome.includes(termo) && !filme.includes(termo))
  })
})

// ===== ORDENAÇÃO =====
document.querySelectorAll('th.sortable').forEach(th => {
  th.addEventListener('click', () => {
    const col = parseInt(th.dataset.col)

    if (sortState.col === col) {
      sortState.asc = !sortState.asc
    } else {
      sortState.col = col
      sortState.asc = true
    }

    // Atualiza ícones
    document.querySelectorAll('th.sortable .sort-icon').forEach(ic => ic.textContent = '↕')
    th.querySelector('.sort-icon').textContent = sortState.asc ? '↑' : '↓'

    const linhas = [...tabela.querySelectorAll('tr')]
    linhas.sort((a, b) => {
      const ta = a.querySelectorAll('td')[col]?.innerText.trim() || ''
      const tb = b.querySelectorAll('td')[col]?.innerText.trim() || ''
      return sortState.asc ? ta.localeCompare(tb, 'pt') : tb.localeCompare(ta, 'pt')
    })
    linhas.forEach(l => tabela.appendChild(l))
  })
})

// ===== PERSISTÊNCIA =====
function salvarReservas() {
  const linhas = tabela.querySelectorAll('tr')
  const dados  = []
  linhas.forEach(linha => {
    const celulas = linha.querySelectorAll('td')
    if (!celulas.length) return
    dados.push({
      nome:     celulas[0].innerText,
      filme:    celulas[1].innerText,
      data:     celulas[2].innerText,
      horario:  celulas[3].innerText,
      sala:     celulas[4].innerText,
      cadeiras: JSON.parse(celulas[5].dataset.cadeiras),
      total:    celulas[6].innerText,
    })
  })
  localStorage.setItem('cinema-reservas', JSON.stringify(dados))
}

function carregarReservas() {
  const dados = JSON.parse(localStorage.getItem('cinema-reservas') || '[]')
  dados.forEach(r => inserirLinha(r.nome, r.filme, r.data, r.horario, r.sala || '35', r.cadeiras, r.total, false))
}

// ===== INSERIR LINHA =====
function inserirLinha(nome, filme, data, horario, sala, lista, totalStr, animar = true) {
  const chave    = `${filme}|${data}|${horario}|${sala}`
  const ocupadas = ocupadasDaSessao(chave)
  lista.forEach(c => ocupadas.add(c.numero))

  const cadeirasHtml = lista.map(c => {
    const cls = c.tipo === 'Inteira' ? 'tipo-inteira' : 'tipo-estudante'
    return `<div class="item-cadeira">Cadeira ${c.numero} — <span class="${cls}">${c.tipo}</span></div>`
  }).join('')

  const linha = tabela.insertRow()
  if (animar) linha.classList.add('linha-nova')

  linha.innerHTML = `
    <td>${nome}</td>
    <td>${filme}</td>
    <td>${data}</td>
    <td>${horario}</td>
    <td>Sala ${sala === '70' ? '2' : '1'} (${sala})</td>
    <td data-cadeiras='${JSON.stringify(lista)}'><div class="lista-cadeiras">${cadeirasHtml}</div></td>
    <td class="total-cell">${totalStr}</td>
    <td>
      <button class="btn-editar"  onclick="editar(this)">✏️ Editar</button>
      <button class="btn-excluir" onclick="excluir(this)">🗑️ Excluir</button>
    </td>
  `
}

// ===== CADASTRO =====
function cadastrar(evento) {
  evento.preventDefault()

  const nome    = document.getElementById('nome').value
  const filme   = document.getElementById('filme').value
  const data    = dataHidden.value
  const horario = document.getElementById('horario').value
  const sala    = document.getElementById('sala').value

  if (!nome || !filme || !data) {
    alert('Por favor, preencha todos os campos.')
    return
  }

  if (cadeirasSelecionadas.size === 0) {
    alert('Selecione ao menos uma cadeira no mapa.')
    return
  }

  // Valida nome duplicado na mesma sessão
  const chave = `${filme}|${data}|${horario}|${sala}`
  const jaExiste = [...tabela.querySelectorAll('tr')].some(linha => {
    const celulas = linha.querySelectorAll('td')
    return celulas.length &&
      celulas[0].innerText.trim().toLowerCase() === nome.trim().toLowerCase() &&
      `${celulas[1].innerText}|${celulas[2].innerText}|${celulas[3].innerText}|${celulas[4].innerText.match(/\d+/)?.[0]}` === chave
  })

  if (jaExiste) {
    alert(`"${nome}" já possui uma reserva para essa sessão.`)
    return
  }

  const lista = [...cadeirasSelecionadas.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([numero, tipo]) => ({ numero, tipo }))

  let total = 0
  lista.forEach(c => { total += c.tipo === 'Inteira' ? PRECO_INTEIRA : PRECO_ESTUDANTE })
  const totalStr = `R$ ${total.toFixed(2).replace('.', ',')}`

  inserirLinha(nome, filme, data, horario, sala, lista, totalStr)
  salvarReservas()

  abrirModal({ nome, filme, data, horario, sala, lista, totalStr })

  cadeirasSelecionadas.clear()
  document.getElementById('form-reserva').reset()
  dataDisplay.value = ''
  dataHidden.value  = ''
  calSelecionado    = null
  atualizarTags()
  atualizarTotal()
  atualizarMapa()
  document.getElementById('nome').focus()
}

// Remove com confirmação — botão → <td> → <tr> → .remove()
function excluir(elemento) {
  if (!confirm('Deseja excluir esta reserva?')) return

  const linha   = elemento.parentElement.parentElement
  const celulas = linha.querySelectorAll('td')
  const lista   = JSON.parse(celulas[5].dataset.cadeiras)
  const sala    = celulas[4].innerText.match(/\d+/)?.[0] || '35'
  const chave   = `${celulas[1].innerText}|${celulas[2].innerText}|${celulas[3].innerText}|${sala}`

  lista.forEach(c => ocupadasDaSessao(chave).delete(c.numero))
  linha.remove()
  salvarReservas()
  atualizarMapa()
}

// Devolve dados para o formulário e reseleciona cadeiras
function editar(elemento) {
  const linha   = elemento.parentElement.parentElement
  const celulas = linha.querySelectorAll('td')
  const lista   = JSON.parse(celulas[5].dataset.cadeiras)
  const filme   = celulas[1].innerText
  const data    = celulas[2].innerText
  const horario = celulas[3].innerText
  const sala    = celulas[4].innerText.match(/\d+/)?.[0] || '35'
  const chave   = `${filme}|${data}|${horario}|${sala}`

  lista.forEach(c => ocupadasDaSessao(chave).delete(c.numero))

  document.getElementById('nome').value    = celulas[0].innerText
  document.getElementById('filme').value   = filme
  const partes = celulas[2].innerText.split('-')
  dataHidden.value  = celulas[2].innerText
  dataDisplay.value = `${partes[2]}/${partes[1]}/${partes[0]}`
  calSelecionado    = new Date(partes[0], parseInt(partes[1])-1, parseInt(partes[2]))
  document.getElementById('horario').value = horario
  document.getElementById('sala').value    = sala

  lista.forEach(({ numero, tipo }) => {
    cadeirasSelecionadas.set(numero, tipo)
    document.getElementById(`cadeira-${numero}`).classList.add('selecionada')
  })

  atualizarTags()
  atualizarTotal()
  linha.remove()
  salvarReservas()
  atualizarMapa()
  document.getElementById('nome').focus()
}

// Atualiza mapa ao trocar sessão ou sala
;['filme', 'horario', 'sala'].forEach(id => {
  document.getElementById(id).addEventListener('change', atualizarMapa)
})

// Ao trocar sala reconstrói o mapa inteiro
document.getElementById('sala').addEventListener('change', renderizarMapa)

document.getElementById('btn-reservar').addEventListener('click', cadastrar)

document.getElementById('data').addEventListener('keydown', (evento) => {
  if (evento.key === 'Enter') cadastrar(evento)
})

// ===== INICIALIZAÇÃO =====
const temaSalvo = localStorage.getItem('cinema-tema') || 'dark'
aplicarTema(temaSalvo)

gerarMapa()
carregarReservas()
atualizarMapa()

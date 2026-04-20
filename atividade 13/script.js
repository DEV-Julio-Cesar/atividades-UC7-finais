// ===== CONSTANTES =====
const PRECO_INTEIRA   = 30
const PRECO_ESTUDANTE = 15
const MAX_CADEIRAS    = 6

// ===== ESTADO =====
// Captura o tbody pelo id da tabela + getElementsByTagName (padrão da atividade 12)
const tabela = document.getElementById('tabela-reservas').getElementsByTagName('tbody')[0]

// Map: chave "filme|data|horario" → Set de cadeiras ocupadas
// Permite que a mesma cadeira seja reservada em sessões diferentes
const ocupadasPorSessao = new Map()

// Map: número → tipo ('Inteira' | 'Estudante') — cadeiras em seleção atual
const cadeirasSelecionadas = new Map()

// Referência ao tooltip
const tooltip = document.getElementById('tooltip')

// ===== SESSÃO ATUAL =====
// Retorna a chave da sessão com base nos campos do formulário
function chaveSessao() {
  const filme   = document.getElementById('filme').value
  const data    = document.getElementById('data').value
  const horario = document.getElementById('horario').value
  return `${filme}|${data}|${horario}`
}

// Retorna o Set de cadeiras ocupadas da sessão atual (cria se não existir)
function ocupadasDaSessao(chave) {
  if (!ocupadasPorSessao.has(chave)) ocupadasPorSessao.set(chave, new Set())
  return ocupadasPorSessao.get(chave)
}

// ===== MAPA DE CADEIRAS =====
function gerarMapa() {
  const mapa = document.getElementById('mapa-cadeiras')

  const tela = document.createElement('div')
  tela.classList.add('tela')
  tela.textContent = '🎥 TELA'
  mapa.appendChild(tela)

  for (let i = 1; i <= 50; i++) {
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
}

// Atualiza o visual do mapa conforme a sessão selecionada no formulário
function atualizarMapa() {
  const chave    = chaveSessao()
  const ocupadas = ocupadasDaSessao(chave)
  let livres = 0, ocupadasCount = 0

  for (let i = 1; i <= 50; i++) {
    const btn = document.getElementById(`cadeira-${i}`)
    btn.classList.remove('ocupada', 'selecionada')

    if (ocupadas.has(i)) {
      btn.classList.add('ocupada')
      ocupadasCount++
    } else if (cadeirasSelecionadas.has(i)) {
      btn.classList.add('selecionada')
      livres++
    } else {
      livres++
    }
  }

  document.getElementById('contador-mapa').textContent =
    `${50 - ocupadasCount} livres · ${ocupadasCount} ocupadas`
}

// Alterna seleção de uma cadeira
function toggleSelecionada(numero) {
  const chave    = chaveSessao()
  const ocupadas = ocupadasDaSessao(chave)

  if (ocupadas.has(numero)) return // já reservada nessa sessão

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

function esconderTooltip() {
  tooltip.classList.remove('visivel')
}

// ===== TAGS =====
function atualizarTags() {
  const box = document.getElementById('cadeiras-selecionadas')
  const contador = document.getElementById('contador-sel')
  box.innerHTML = ''

  if (cadeirasSelecionadas.size === 0) {
    box.innerHTML = `<span class="placeholder-tag">Clique nas cadeiras no mapa abaixo (máx. ${MAX_CADEIRAS})</span>`
    contador.textContent = ''
    return
  }

  contador.textContent = `(${cadeirasSelecionadas.size}/${MAX_CADEIRAS})`

  const ordenadas = [...cadeirasSelecionadas.keys()].sort((a, b) => a - b)

  ordenadas.forEach(numero => {
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
      const btn = document.getElementById(`cadeira-${numero}`)
      if (btn) btn.classList.remove('selecionada')
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

// ===== PERSISTÊNCIA (localStorage) =====
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
      cadeiras: JSON.parse(celulas[4].dataset.cadeiras),
      total:    celulas[5].innerText,
    })
  })

  localStorage.setItem('cinema-reservas', JSON.stringify(dados))
}

function carregarReservas() {
  const dados = JSON.parse(localStorage.getItem('cinema-reservas') || '[]')
  dados.forEach(r => inserirLinha(r.nome, r.filme, r.data, r.horario, r.cadeiras, r.total))
}

// ===== INSERIR LINHA NA TABELA =====
function inserirLinha(nome, filme, data, horario, lista, totalStr) {
  // Marca cadeiras como ocupadas na sessão correspondente
  const chave    = `${filme}|${data}|${horario}`
  const ocupadas = ocupadasDaSessao(chave)
  lista.forEach(c => ocupadas.add(c.numero))

  const cadeirasHtml = lista.map(c => {
    const cls = c.tipo === 'Inteira' ? 'tipo-inteira' : 'tipo-estudante'
    return `<div class="item-cadeira">Cadeira ${c.numero} — <span class="${cls}">${c.tipo}</span></div>`
  }).join('')

  const dadosJson = JSON.stringify(lista)

  const linha = tabela.insertRow() // cria <tr></tr> no tbody

  // innerHTML com template literal — preenche todas as células de uma vez
  linha.innerHTML = `
    <td>${nome}</td>
    <td>${filme}</td>
    <td>${data}</td>
    <td>${horario}</td>
    <td data-cadeiras='${dadosJson}'><div class="lista-cadeiras">${cadeirasHtml}</div></td>
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
  const data    = document.getElementById('data').value
  const horario = document.getElementById('horario').value

  if (!nome || !filme || !data) {
    alert('Por favor, preencha todos os campos.')
    return
  }

  if (cadeirasSelecionadas.size === 0) {
    alert('Selecione ao menos uma cadeira no mapa.')
    return
  }

  const lista = [...cadeirasSelecionadas.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([numero, tipo]) => ({ numero, tipo }))

  let total = 0
  lista.forEach(c => { total += c.tipo === 'Inteira' ? PRECO_INTEIRA : PRECO_ESTUDANTE })
  const totalStr = `R$ ${total.toFixed(2).replace('.', ',')}`

  inserirLinha(nome, filme, data, horario, lista, totalStr)
  salvarReservas()
  atualizarMapa()

  cadeirasSelecionadas.clear()
  document.getElementById('form-reserva').reset()
  document.getElementById('data').min = new Date().toISOString().split('T')[0]
  atualizarTags()
  atualizarTotal()
  document.getElementById('nome').focus()
}

// Remove a linha, libera cadeiras e atualiza localStorage
// Navegação DOM: botão → <td> → <tr> → .remove()
function excluir(elemento) {
  const linha   = elemento.parentElement.parentElement
  const celulas = linha.querySelectorAll('td')
  const lista   = JSON.parse(celulas[4].dataset.cadeiras)
  const filme   = celulas[1].innerText
  const data    = celulas[2].innerText
  const horario = celulas[3].innerText
  const chave   = `${filme}|${data}|${horario}`

  lista.forEach(c => ocupadasDaSessao(chave).delete(c.numero))
  linha.remove()
  salvarReservas()
  atualizarMapa()
}

// Devolve dados para o formulário e reseleciona cadeiras no mapa
function editar(elemento) {
  const linha   = elemento.parentElement.parentElement
  const celulas = linha.querySelectorAll('td')
  const lista   = JSON.parse(celulas[4].dataset.cadeiras)
  const filme   = celulas[1].innerText
  const data    = celulas[2].innerText
  const horario = celulas[3].innerText
  const chave   = `${filme}|${data}|${horario}`

  lista.forEach(c => ocupadasDaSessao(chave).delete(c.numero))

  document.getElementById('nome').value    = celulas[0].innerText
  document.getElementById('filme').value   = filme
  document.getElementById('data').value    = data
  document.getElementById('horario').value = horario

  lista.forEach(({ numero, tipo }) => {
    cadeirasSelecionadas.set(numero, tipo)
    const btn = document.getElementById(`cadeira-${numero}`)
    if (btn) btn.classList.add('selecionada')
  })

  atualizarTags()
  atualizarTotal()
  linha.remove()
  salvarReservas()
  atualizarMapa()
  document.getElementById('nome').focus()
}

// Atualiza o mapa quando o usuário muda filme, data ou horário
;['filme', 'data', 'horario'].forEach(id => {
  document.getElementById(id).addEventListener('change', atualizarMapa)
})

document.getElementById('btn-reservar').addEventListener('click', cadastrar)

document.getElementById('data').addEventListener('keydown', (evento) => {
  if (evento.key === 'Enter') cadastrar(evento)
})

// ===== INICIALIZAÇÃO =====
document.getElementById('data').min = new Date().toISOString().split('T')[0]
gerarMapa()
carregarReservas() // restaura reservas salvas no localStorage
atualizarMapa()

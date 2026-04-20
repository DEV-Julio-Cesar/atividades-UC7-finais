// Captura o tbody pelo id da tabela + getElementsByTagName (padrão da atividade 12)
const tabela = document.getElementById('tabela-reservas').getElementsByTagName('tbody')[0]

// Set com cadeiras permanentemente ocupadas (já reservadas)
const cadeirasOcupadas = new Set()

// Map: número da cadeira → tipo ('Inteira' | 'Estudante')
// Permite saber o tipo de cada cadeira selecionada individualmente
const cadeirasSelecionadas = new Map()

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

    btn.addEventListener('click', () => toggleSelecionada(i))
    mapa.appendChild(btn)
  }
}

// Alterna seleção de uma cadeira no mapa
function toggleSelecionada(numero) {
  if (cadeirasOcupadas.has(numero)) return

  const btn = document.getElementById(`cadeira-${numero}`)

  if (cadeirasSelecionadas.has(numero)) {
    // Deseleciona
    cadeirasSelecionadas.delete(numero)
    btn.classList.remove('selecionada')
  } else {
    // Seleciona com tipo padrão 'Inteira'
    cadeirasSelecionadas.set(numero, 'Inteira')
    btn.classList.add('selecionada')
  }

  atualizarTags()
}

// Renderiza as tags — cada uma com número + select de tipo + botão remover
function atualizarTags() {
  const box = document.getElementById('cadeiras-selecionadas')
  box.innerHTML = ''

  if (cadeirasSelecionadas.size === 0) {
    box.innerHTML = '<span class="placeholder-tag">Clique nas cadeiras no mapa abaixo</span>'
    return
  }

  const ordenadas = [...cadeirasSelecionadas.keys()].sort((a, b) => a - b)

  ordenadas.forEach(numero => {
    const tipo = cadeirasSelecionadas.get(numero)

    const tag = document.createElement('div')
    tag.classList.add('tag')

    // Número da cadeira
    const num = document.createElement('span')
    num.classList.add('tag-num')
    num.textContent = `Cadeira ${numero}`

    // Select de tipo — individual por cadeira
    const sel = document.createElement('select')
    sel.innerHTML = `
      <option value="Inteira"   ${tipo === 'Inteira'   ? 'selected' : ''}>🎟️ Inteira</option>
      <option value="Estudante" ${tipo === 'Estudante' ? 'selected' : ''}>🎓 Estudante</option>
    `
    // Atualiza o Map quando o usuário muda o tipo
    sel.addEventListener('change', () => {
      cadeirasSelecionadas.set(numero, sel.value)
    })

    // Botão remover
    const removeBtn = document.createElement('button')
    removeBtn.classList.add('tag-remove')
    removeBtn.type = 'button'
    removeBtn.textContent = '✕'
    removeBtn.addEventListener('click', () => removerCadeira(numero))

    tag.appendChild(num)
    tag.appendChild(sel)
    tag.appendChild(removeBtn)
    box.appendChild(tag)
  })
}

// Remove uma cadeira da seleção
function removerCadeira(numero) {
  cadeirasSelecionadas.delete(numero)
  const btn = document.getElementById(`cadeira-${numero}`)
  if (btn) btn.classList.remove('selecionada')
  atualizarTags()
}

// Marca cadeiras como ocupadas após reserva
function ocuparCadeiras(lista) {
  lista.forEach(numero => {
    cadeirasOcupadas.add(numero)
    cadeirasSelecionadas.delete(numero)
    const btn = document.getElementById(`cadeira-${numero}`)
    if (btn) { btn.classList.remove('selecionada'); btn.classList.add('ocupada') }
  })
}

// Libera cadeiras ao excluir ou editar
function liberarCadeiras(lista) {
  lista.forEach(numero => {
    cadeirasOcupadas.delete(numero)
    const btn = document.getElementById(`cadeira-${numero}`)
    if (btn) btn.classList.remove('ocupada')
  })
}

// ===== CADASTRO =====
function cadastrar(evento) {
  evento.preventDefault()

  const nome  = document.getElementById('nome').value
  const filme = document.getElementById('filme').value
  const data  = document.getElementById('data').value

  if (!nome || !filme || !data) {
    alert('Por favor, preencha todos os campos.')
    return
  }

  if (cadeirasSelecionadas.size === 0) {
    alert('Selecione ao menos uma cadeira no mapa.')
    return
  }

  // Monta lista ordenada de { numero, tipo }
  const lista = [...cadeirasSelecionadas.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([numero, tipo]) => ({ numero, tipo }))

  ocuparCadeiras(lista.map(c => c.numero))

  // Gera o HTML interno da célula de cadeiras:
  // cada cadeira em uma linha com seu tipo colorido
  const cadeirasHtml = lista.map(c => {
    const cls = c.tipo === 'Inteira' ? 'tipo-inteira' : 'tipo-estudante'
    return `<div class="item-cadeira">Cadeira ${c.numero} — <span class="${cls}">${c.tipo}</span></div>`
  }).join('')

  // Armazena JSON no data-attribute para recuperar no editar/excluir
  const dadosJson = JSON.stringify(lista)

  const linha = tabela.insertRow() // cria <tr></tr> no tbody

  // innerHTML com template literal — preenche todas as células de uma vez
  linha.innerHTML = `
    <td>${nome}</td>
    <td>${filme}</td>
    <td>${data}</td>
    <td data-cadeiras='${dadosJson}'><div class="lista-cadeiras">${cadeirasHtml}</div></td>
    <td>
      <button class="btn-editar"  onclick="editar(this)">✏️ Editar</button>
      <button class="btn-excluir" onclick="excluir(this)">🗑️ Excluir</button>
    </td>
  `

  document.getElementById('form-reserva').reset()
  atualizarTags()
  document.getElementById('nome').focus()
}

// Remove a linha e libera as cadeiras
// Navegação DOM: botão → <td> → <tr> → .remove()
function excluir(elemento) {
  const linha   = elemento.parentElement.parentElement
  const celulas = linha.querySelectorAll('td')
  const lista   = JSON.parse(celulas[3].dataset.cadeiras)

  liberarCadeiras(lista.map(c => c.numero))
  linha.remove()
}

// Devolve dados para o formulário e reseleciona cadeiras no mapa
function editar(elemento) {
  const linha   = elemento.parentElement.parentElement
  const celulas = linha.querySelectorAll('td')
  const lista   = JSON.parse(celulas[3].dataset.cadeiras)

  liberarCadeiras(lista.map(c => c.numero))

  document.getElementById('nome').value  = celulas[0].innerText
  document.getElementById('filme').value = celulas[1].innerText
  document.getElementById('data').value  = celulas[2].innerText

  // Reseleciona cada cadeira com o tipo que já tinha
  lista.forEach(({ numero, tipo }) => {
    cadeirasSelecionadas.set(numero, tipo)
    const btn = document.getElementById(`cadeira-${numero}`)
    if (btn) btn.classList.add('selecionada')
  })

  atualizarTags()
  linha.remove()
  document.getElementById('nome').focus()
}

document.getElementById('btn-reservar').addEventListener('click', cadastrar)

// keydown no select de filme — dispara cadastro ao pressionar Enter
document.getElementById('data').addEventListener('keydown', (evento) => {
  if (evento.key === 'Enter') cadastrar(evento)
})

// Inicializa o mapa
gerarMapa()

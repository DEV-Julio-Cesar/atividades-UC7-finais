// Captura o tbody pelo id da tabela + getElementsByTagName (mesmo padrão da atividade 12)
const tabela = document.getElementById('tabela-reservas').getElementsByTagName('tbody')[0]

// Set que armazena os números das cadeiras já ocupadas
const cadeirasOcupadas = new Set()

// ===== MAPA DE CADEIRAS =====
// Gera os 50 botões de cadeira dinamicamente via createElement + appendChild
function gerarMapa() {
  const mapa = document.getElementById('mapa-cadeiras')

  // Cria a "tela" do cinema no topo do mapa
  const tela = document.createElement('div')
  tela.classList.add('tela')
  tela.textContent = '🎥 TELA'
  mapa.appendChild(tela)

  // Loop de 1 a 50 — cria um botão para cada cadeira
  for (let i = 1; i <= 50; i++) {
    const btn = document.createElement('button')
    btn.classList.add('cadeira')
    btn.textContent = i
    btn.id = `cadeira-${i}`

    // Ao clicar na cadeira, preenche o input automaticamente
    btn.addEventListener('click', () => {
      if (cadeirasOcupadas.has(i)) return // ignora cadeiras ocupadas
      document.getElementById('cadeira').value = i
    })

    mapa.appendChild(btn)
  }
}

// Marca visualmente uma cadeira como ocupada no mapa
function ocuparCadeira(numero) {
  cadeirasOcupadas.add(numero)
  const btn = document.getElementById(`cadeira-${numero}`)
  if (btn) btn.classList.add('ocupada')
}

// Libera visualmente uma cadeira no mapa
function liberarCadeira(numero) {
  cadeirasOcupadas.delete(numero)
  const btn = document.getElementById(`cadeira-${numero}`)
  if (btn) btn.classList.remove('ocupada')
}

// ===== CADASTRO DE RESERVA =====
function cadastrar(evento) {
  evento.preventDefault()

  const nome    = document.getElementById('nome').value
  const filme   = document.getElementById('filme').value
  const data    = document.getElementById('data').value
  const cadeira = parseInt(document.getElementById('cadeira').value)

  if (!nome || !filme || !data || !cadeira) {
    alert('Por favor, preencha todos os campos.')
    return
  }

  if (cadeirasOcupadas.has(cadeira)) {
    alert(`A cadeira ${cadeira} já está ocupada. Escolha outra.`)
    return
  }

  // Marca a cadeira como ocupada no mapa
  ocuparCadeira(cadeira)

  const linha = tabela.insertRow() // cria <tr></tr> no tbody

  // innerHTML com template literal — preenche todas as células de uma vez
  // Botões inline passando this como parâmetro (padrão da atividade 12)
  linha.innerHTML = `
    <td>${nome}</td>
    <td>${filme}</td>
    <td>${data}</td>
    <td>${cadeira}</td>
    <td>
      <button class="btn-editar"  onclick="editar(this)">✏️ Editar</button>
      <button class="btn-excluir" onclick="excluir(this)">🗑️ Excluir</button>
    </td>
  `

  document.getElementById('form-reserva').reset()
  document.getElementById('nome').focus()
}

// Remove a linha e libera a cadeira no mapa
// Navegação DOM: botão → <td> → <tr> → .remove()
function excluir(elemento) {
  const linha   = elemento.parentElement.parentElement
  const celulas = linha.querySelectorAll('td')
  const numero  = parseInt(celulas[3].innerText)

  liberarCadeira(numero)
  linha.remove()
}

// Devolve os dados da linha para os inputs e libera a cadeira para reedição
function editar(elemento) {
  const linha   = elemento.parentElement.parentElement
  const celulas = linha.querySelectorAll('td')

  const numero = parseInt(celulas[3].innerText)
  liberarCadeira(numero) // libera a cadeira para poder reatribuir

  document.getElementById('nome').value    = celulas[0].innerText
  document.getElementById('filme').value   = celulas[1].innerText
  document.getElementById('data').value    = celulas[2].innerText
  document.getElementById('cadeira').value = celulas[3].innerText

  linha.remove()
  document.getElementById('nome').focus()
}

document.getElementById('btn-reservar').addEventListener('click', cadastrar)

// keydown no último input — dispara cadastro ao pressionar Enter
document.getElementById('cadeira').addEventListener('keydown', (evento) => {
  if (evento.key === 'Enter') {
    cadastrar(evento)
  }
})

// Inicializa o mapa ao carregar a página
gerarMapa()

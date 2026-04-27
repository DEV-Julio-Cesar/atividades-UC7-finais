// API: TMDB (The Movie Database) — chave pública de demonstração
// Documentação: https://developer.themoviedb.org/docs
const API_KEY  = '4a7e9b8c2d1f3e5a6b0c9d8e7f2a1b3c' // substitua pela sua chave gratuita em themoviedb.org
const BASE_URL = 'https://api.themoviedb.org/3'
const IMG_URL  = 'https://image.tmdb.org/t/p/w300'

// Referências aos elementos do DOM
const grid     = document.getElementById('filmes-grid')
const contador = document.getElementById('contador')
const erroEl   = document.getElementById('erro')
const btnBuscar = document.getElementById('btn-buscar')

// ===== BUSCAR FILMES (async/await) =====
async function buscarFilmes() {
  const termo = document.getElementById('busca').value.trim()

  if (!termo) {
    erroEl.textContent = 'Digite o nome de um filme para buscar.'
    return
  }

  // Limpa resultados anteriores
  grid.innerHTML      = ''
  contador.textContent = ''
  erroEl.textContent  = ''
  btnBuscar.disabled  = true
  btnBuscar.textContent = '...'

  try {
    // Fetch API com async/await — não bloqueia a execução
    const resposta = await fetch(
      `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(termo)}&language=pt-BR`
    )

    // Converte a resposta para JSON com .json()
    const dados = await resposta.json()

    // Depuração no console
    console.log(JSON.stringify(dados))

    if (!dados.results || dados.results.length === 0) {
      erroEl.textContent = 'Nenhum filme encontrado.'
      return
    }

    contador.textContent = `${dados.results.length} filmes encontrados`

    // Renderiza cada filme como card no grid
    dados.results.forEach((filme, i) => {
      const card = criarCard(filme, i)
      grid.appendChild(card)
    })

  } catch (erro) {
    // try/catch trata erros de conexão
    erroEl.textContent = `Erro ao buscar filmes: ${erro.message}`
    console.log(`Erro: ${erro}`)
  } finally {
    btnBuscar.disabled    = false
    btnBuscar.textContent = 'Buscar'
  }
}

// ===== CRIAR CARD =====
// Cria um card de filme com createElement e retorna o elemento
function criarCard(filme, indice) {
  const card = document.createElement('div')
  card.classList.add('card-filme')
  card.style.animationDelay = `${indice * 0.05}s`

  const ano = filme.release_date ? filme.release_date.substring(0, 4) : 'S/D'
  const nota = filme.vote_average ? `⭐ ${filme.vote_average.toFixed(1)}` : 'Sem nota'

  // Poster ou placeholder
  const poster = filme.poster_path
    ? `<img src="${IMG_URL}${filme.poster_path}" alt="${filme.title}" loading="lazy" />`
    : `<div class="sem-poster">🎬</div>`

  card.innerHTML = `
    ${poster}
    <div class="card-info">
      <div class="card-titulo" title="${filme.title}">${filme.title}</div>
      <div class="card-ano">${ano}</div>
      <div class="card-nota">${nota}</div>
    </div>
  `

  return card
}

// ===== BUSCAR AO PRESSIONAR ENTER =====
document.getElementById('busca').addEventListener('keydown', (evento) => {
  if (evento.key === 'Enter') buscarFilmes()
})

// ===== CARREGAR FILMES POPULARES AO ABRIR (.then / .catch) =====
// Demonstra o uso de Promises encadeadas conforme requisito
fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}&language=pt-BR`)
  .then(resposta => resposta.json())
  .then(dados => {
    contador.textContent = 'Filmes populares no momento'
    dados.results.forEach((filme, i) => {
      grid.appendChild(criarCard(filme, i))
    })
  })
  .catch(erro => {
    erroEl.textContent = 'Não foi possível carregar os filmes populares.'
    console.log(`Erro: ${erro}`)
  })

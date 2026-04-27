// API: OMDB (Open Movie Database)
// Dados:   http://www.omdbapi.com/?apikey=[yourkey]&
// Posters: http://img.omdbapi.com/?apikey=[yourkey]&
// Cadastre sua chave gratuita em: https://www.omdbapi.com/apikey.aspx
const API_KEY  = 'SUA_CHAVE_AQUI'
const BASE_URL = `https://www.omdbapi.com/?apikey=${API_KEY}`
const IMG_URL  = `https://img.omdbapi.com/?apikey=${API_KEY}`

// Referências ao DOM
const grid      = document.getElementById('filmes-grid')
const contador  = document.getElementById('contador')
const erroEl    = document.getElementById('erro')
const btnBuscar = document.getElementById('btn-buscar')

// ===== BUSCAR FILMES (async/await) =====
async function buscarFilmes() {
  const termo = document.getElementById('busca').value.trim()

  if (!termo) {
    erroEl.textContent = 'Digite o nome de um filme para buscar.'
    return
  }

  grid.innerHTML       = ''
  contador.textContent = ''
  erroEl.textContent   = ''
  btnBuscar.disabled   = true
  btnBuscar.textContent = '...'

  try {
    // Fetch com async/await — não bloqueia a execução
    // OMDB: parâmetro s= para busca por título
    const resposta = await fetch(`${BASE_URL}&s=${encodeURIComponent(termo)}&type=movie`)
    const dados    = await resposta.json() // converte para JSON com .json()

    // Depuração no console conforme requisito
    console.log(JSON.stringify(dados))

    if (dados.Response === 'False') {
      erroEl.textContent = dados.Error || 'Nenhum filme encontrado.'
      return
    }

    contador.textContent = `${dados.totalResults} filmes encontrados`

    // Renderiza cada filme como card
    dados.Search.forEach((filme, i) => {
      grid.appendChild(criarCard(filme, i))
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
function criarCard(filme, indice) {
  const card = document.createElement('div')
  card.classList.add('card-filme')
  card.style.animationDelay = `${indice * 0.05}s`

  // OMDB retorna 'N/A' quando não há poster — usa placeholder
  const poster = filme.Poster && filme.Poster !== 'N/A'
    ? `<img src="${filme.Poster}" alt="${filme.Title}" loading="lazy" />`
    : `<div class="sem-poster">🎬</div>`

  card.innerHTML = `
    ${poster}
    <div class="card-info">
      <div class="card-titulo" title="${filme.Title}">${filme.Title}</div>
      <div class="card-ano">${filme.Year}</div>
      <div class="card-tipo">${filme.Type}</div>
    </div>
  `

  // Clique no card busca detalhes pelo imdbID usando .then()/.catch()
  card.addEventListener('click', () => buscarDetalhes(filme.imdbID))

  return card
}

// ===== DETALHES DO FILME (.then / .catch) =====
// Demonstra Promises encadeadas conforme requisito
function buscarDetalhes(imdbID) {
  fetch(`${BASE_URL}&i=${imdbID}&plot=short`)
    .then(resposta => resposta.json())
    .then(dados => {
      console.log(JSON.stringify(dados))
      alert(
        `🎬 ${dados.Title} (${dados.Year})\n\n` +
        `⭐ Nota: ${dados.imdbRating}\n` +
        `🎭 Gênero: ${dados.Genre}\n` +
        `🎬 Diretor: ${dados.Director}\n\n` +
        `📖 ${dados.Plot}`
      )
    })
    .catch(erro => console.log(`Erro ao buscar detalhes: ${erro}`))
}

// Busca ao pressionar Enter
document.getElementById('busca').addEventListener('keydown', (evento) => {
  if (evento.key === 'Enter') buscarFilmes()
})

// Carrega filmes populares ao abrir usando .then()/.catch()
fetch(`${BASE_URL}&s=marvel&type=movie`)
  .then(resposta => resposta.json())
  .then(dados => {
    if (dados.Response === 'True') {
      contador.textContent = 'Filmes em destaque — clique para ver detalhes'
      dados.Search.forEach((filme, i) => grid.appendChild(criarCard(filme, i)))
    }
  })
  .catch(erro => console.log(`Erro: ${erro}`))

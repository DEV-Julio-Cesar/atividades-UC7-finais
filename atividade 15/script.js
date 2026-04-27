// ===== OMDB API =====
// Dados:   https://www.omdbapi.com/?apikey=[yourkey]&
// Posters: https://img.omdbapi.com/?apikey=[yourkey]&
// Chave gratuita em: https://www.omdbapi.com/apikey.aspx
const API_KEY  = 'cd9e2b29'
const BASE_URL = `https://www.omdbapi.com/?apikey=${API_KEY}`

// Estado da paginação
let paginaAtual  = 1
let totalPaginas = 1
let termoBusca   = ''

// Referências ao DOM
const grid      = document.getElementById('filmes-grid')
const contador  = document.getElementById('contador')
const erroEl    = document.getElementById('erro')
const btnBuscar = document.getElementById('btn-buscar')

// ===== BUSCA POR TÍTULO (parâmetro s=) — async/await =====
// Parâmetros usados: s, type, y, page, r=json
async function buscarFilmes(pagina = 1) {
  const termo = document.getElementById('busca').value.trim()
  const tipo  = document.getElementById('tipo').value   // movie | series | episode | ''
  const ano   = document.getElementById('ano').value    // y= ano de lançamento

  if (!termo) {
    erroEl.textContent = 'Digite um título para buscar.'
    return
  }

  termoBusca  = termo
  paginaAtual = pagina

  grid.innerHTML       = ''
  erroEl.textContent   = ''
  contador.textContent = 'Buscando...'
  btnBuscar.disabled   = true
  btnBuscar.textContent = '...'

  // Monta a URL com os parâmetros da documentação
  let url = `${BASE_URL}&s=${encodeURIComponent(termo)}&r=json&page=${pagina}`
  if (tipo) url += `&type=${tipo}`   // parâmetro type: movie | series | episode
  if (ano)  url += `&y=${ano}`       // parâmetro y: ano de lançamento

  try {
    // Fetch com async/await — não bloqueia a execução
    const resposta = await fetch(url)
    const dados    = await resposta.json() // .json() converte a resposta

    // Depuração no console com JSON.stringify conforme requisito
    console.log(JSON.stringify(dados))

    if (dados.Response === 'False') {
      erroEl.textContent   = dados.Error || 'Nenhum resultado encontrado.'
      contador.textContent = ''
      renderizarPaginacao(0)
      return
    }

    const total = parseInt(dados.totalResults) // totalResults retornado no nível raiz
    totalPaginas = Math.ceil(total / 10)       // OMDB retorna 10 por página

    contador.textContent = `${total} resultado(s) — página ${pagina} de ${totalPaginas}`

    // Renderiza os cards
    dados.Search.forEach((filme, i) => grid.appendChild(criarCard(filme, i)))

    renderizarPaginacao(total)

  } catch (erro) {
    // try/catch trata erros de conexão
    erroEl.textContent = `Erro de conexão: ${erro.message}`
    console.log(`Erro: ${erro}`)
  } finally {
    btnBuscar.disabled    = false
    btnBuscar.textContent = '🔍 Buscar'
  }
}

// ===== CRIAR CARD =====
function criarCard(filme, indice) {
  const card = document.createElement('div')
  card.classList.add('card-filme')
  card.style.animationDelay = `${indice * 0.04}s`

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

  // Clique no card busca detalhes pelo imdbID (parâmetro i=)
  card.addEventListener('click', () => buscarDetalhes(filme.imdbID))

  return card
}

// ===== DETALHES POR ID (parâmetro i=) — .then() / .catch() =====
// Demonstra Promises encadeadas conforme requisito
function buscarDetalhes(imdbID) {
  const enredo = document.getElementById('enredo').value // short | full

  // Parâmetros: i= (imdbID), plot= (enredo), r=json
  fetch(`${BASE_URL}&i=${imdbID}&plot=${enredo}&r=json`)
    .then(resposta => resposta.json())
    .then(dados => {
      console.log(JSON.stringify(dados))
      abrirModal(dados)
    })
    .catch(erro => {
      console.log(`Erro ao buscar detalhes: ${erro}`)
    })
}

// ===== MODAL DE DETALHES =====
function abrirModal(dados) {
  const overlay = document.getElementById('modal-overlay')
  const corpo   = document.getElementById('modal-corpo')

  const poster = dados.Poster && dados.Poster !== 'N/A'
    ? `<img src="${dados.Poster}" alt="${dados.Title}" />`
    : `<div class="sem-poster" style="width:120px;height:180px;border-radius:8px">🎬</div>`

  corpo.innerHTML = `
    ${poster}
    <div class="modal-body">
      <h2>${dados.Title} (${dados.Year})</h2>
      <p><span class="destaque">⭐ ${dados.imdbRating}</span> — ${dados.Genre}</p>
      <p><strong>Diretor:</strong> ${dados.Director}</p>
      <p><strong>Elenco:</strong> ${dados.Actors}</p>
      <p><strong>Duração:</strong> ${dados.Runtime}</p>
      <p style="margin-top:0.5rem">${dados.Plot}</p>
    </div>
  `

  overlay.classList.remove('hidden')
}

// ===== PAGINAÇÃO =====
function renderizarPaginacao(total) {
  const pag = document.getElementById('paginacao')
  pag.innerHTML = ''
  if (total <= 10) return

  // Botão anterior
  if (paginaAtual > 1) {
    const btn = document.createElement('button')
    btn.classList.add('btn-pag')
    btn.textContent = '‹ Anterior'
    btn.addEventListener('click', () => buscarFilmes(paginaAtual - 1))
    pag.appendChild(btn)
  }

  // Páginas numeradas (máx 5 ao redor da atual)
  const inicio = Math.max(1, paginaAtual - 2)
  const fim    = Math.min(totalPaginas, paginaAtual + 2)

  for (let p = inicio; p <= fim; p++) {
    const btn = document.createElement('button')
    btn.classList.add('btn-pag')
    if (p === paginaAtual) btn.classList.add('ativa')
    btn.textContent = p
    btn.addEventListener('click', () => buscarFilmes(p))
    pag.appendChild(btn)
  }

  // Botão próximo
  if (paginaAtual < totalPaginas) {
    const btn = document.createElement('button')
    btn.classList.add('btn-pag')
    btn.textContent = 'Próximo ›'
    btn.addEventListener('click', () => buscarFilmes(paginaAtual + 1))
    pag.appendChild(btn)
  }
}

// ===== FECHAR MODAL =====
document.getElementById('btn-fechar-modal').addEventListener('click', () => {
  document.getElementById('modal-overlay').classList.add('hidden')
})

document.getElementById('modal-overlay').addEventListener('click', (e) => {
  if (e.target === document.getElementById('modal-overlay')) {
    document.getElementById('modal-overlay').classList.add('hidden')
  }
})

// Enter no campo de busca
document.getElementById('busca').addEventListener('keydown', (evento) => {
  if (evento.key === 'Enter') buscarFilmes(1)
})

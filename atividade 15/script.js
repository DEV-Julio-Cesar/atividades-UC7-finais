// ===================================================
//  FILMES — OMDB API
//  https://www.omdbapi.com/?apikey=[yourkey]&
// ===================================================
const API_KEY  = 'cd9e2b29'
const OMDB_URL = `https://www.omdbapi.com/?apikey=${API_KEY}`

let paginaFilmes  = 1
let totalFilmes   = 1
let termoFilmes   = ''

// ===== BUSCA POR TÍTULO (parâmetro s=) — async/await =====
async function buscarFilmes(pagina = 1) {
  const termo = document.getElementById('busca').value.trim()
  const tipo  = document.getElementById('tipo').value
  const ano   = document.getElementById('ano').value

  if (!termo) { document.getElementById('erro').textContent = 'Digite um título.'; return }

  termoFilmes  = termo
  paginaFilmes = pagina

  const grid = document.getElementById('filmes-grid')
  grid.innerHTML = ''
  document.getElementById('erro').textContent   = ''
  document.getElementById('contador').textContent = 'Buscando...'

  const btn = document.getElementById('btn-buscar')
  btn.disabled = true; btn.textContent = '...'

  // Monta URL com parâmetros da documentação OMDB
  let url = `${OMDB_URL}&s=${encodeURIComponent(termo)}&r=json&page=${pagina}`
  if (tipo) url += `&type=${tipo}`   // type: movie | series | episode
  if (ano)  url += `&y=${ano}`       // y: ano de lançamento

  try {
    const resposta = await fetch(url)
    const dados    = await resposta.json()   // .json() converte a resposta
    console.log(JSON.stringify(dados))       // depuração conforme requisito

    if (dados.Response === 'False') {
      document.getElementById('erro').textContent    = dados.Error
      document.getElementById('contador').textContent = ''
      renderPaginacaoFilmes(0); return
    }

    const total = parseInt(dados.totalResults)  // totalResults no nível raiz
    totalFilmes = Math.ceil(total / 10)

    document.getElementById('contador').textContent =
      `${total} resultado(s) — página ${pagina} de ${totalFilmes}`

    dados.Search.forEach((f, i) => grid.appendChild(criarCardFilme(f, i)))
    renderPaginacaoFilmes(total)

  } catch (erro) {
    document.getElementById('erro').textContent = `Erro: ${erro.message}`
  } finally {
    btn.disabled = false; btn.textContent = '🔍 Buscar'
  }
}

// ===== CARD FILME =====
function criarCardFilme(filme, i) {
  const card = document.createElement('div')
  card.classList.add('card-filme')
  card.style.animationDelay = `${i * 0.04}s`

  const poster = filme.Poster && filme.Poster !== 'N/A'
    ? `<img src="${filme.Poster}" alt="${filme.Title}" loading="lazy" />`
    : `<div class="sem-poster">🎬</div>`

  card.innerHTML = `
    ${poster}
    <div class="card-info">
      <div class="card-titulo" title="${filme.Title}">${filme.Title}</div>
      <div class="card-sub">${filme.Year}</div>
      <div class="card-badge">${filme.Type}</div>
    </div>
  `
  // Clique busca detalhes pelo imdbID (parâmetro i=) usando .then()/.catch()
  card.addEventListener('click', () => buscarDetalhesFilme(filme.imdbID))
  return card
}

// ===== DETALHES FILME (parâmetro i=) — .then() / .catch() =====
function buscarDetalhesFilme(imdbID) {
  const enredo = document.getElementById('enredo').value  // short | full
  fetch(`${OMDB_URL}&i=${imdbID}&plot=${enredo}&r=json`)
    .then(r => r.json())
    .then(d => {
      console.log(JSON.stringify(d))
      const poster = d.Poster && d.Poster !== 'N/A'
        ? `<img src="${d.Poster}" alt="${d.Title}" />`
        : `<div class="sem-poster" style="width:130px;height:195px;border-radius:8px">🎬</div>`

      abrirModal(`
        ${poster}
        <div class="modal-body">
          <h2>${d.Title} (${d.Year})</h2>
          <p><span class="destaque">⭐ ${d.imdbRating}</span> — ${d.Genre}</p>
          <p><strong>Diretor:</strong> ${d.Director}</p>
          <p><strong>Elenco:</strong> ${d.Actors}</p>
          <p><strong>Duração:</strong> ${d.Runtime}</p>
          <p style="margin-top:0.5rem">${d.Plot}</p>
        </div>
      `)
    })
    .catch(e => console.log(`Erro detalhes: ${e}`))
}

// ===== PAGINAÇÃO FILMES =====
function renderPaginacaoFilmes(total) {
  const pag = document.getElementById('paginacao-filmes')
  pag.innerHTML = ''
  if (total <= 10) return

  const botoes = [
    { label: '‹ Anterior', p: paginaFilmes - 1, show: paginaFilmes > 1 },
    { label: 'Próximo ›',  p: paginaFilmes + 1, show: paginaFilmes < totalFilmes },
  ]

  if (botoes[0].show) { const b = criarBtnPag(botoes[0].label, () => buscarFilmes(botoes[0].p)); pag.appendChild(b) }

  const ini = Math.max(1, paginaFilmes - 2)
  const fim = Math.min(totalFilmes, paginaFilmes + 2)
  for (let p = ini; p <= fim; p++) {
    const b = criarBtnPag(p, () => buscarFilmes(p))
    if (p === paginaFilmes) b.classList.add('ativa')
    pag.appendChild(b)
  }

  if (botoes[1].show) { const b = criarBtnPag(botoes[1].label, () => buscarFilmes(botoes[1].p)); pag.appendChild(b) }
}

// ===================================================
//  DRAGON BALL API
//  https://www.dragonball-api.com/api
// ===================================================
const DB_URL = 'https://dragonball-api.com/api'

let dbLinks = {}   // guarda os links de navegação retornados pela API

// Alterna filtros visíveis conforme a seção escolhida
function trocarSecaoDB() {
  const secao = document.getElementById('db-secao').value
  const isChar = secao === 'characters'
  document.getElementById('db-filtro-raca').classList.toggle('hidden', !isChar)
  document.getElementById('db-filtro-afiliacao').classList.toggle('hidden', !isChar)
  document.getElementById('db-filtro-destruido').classList.toggle('hidden', isChar)
  document.getElementById('db-grid').innerHTML = ''
  document.getElementById('paginacao-db').innerHTML = ''
  document.getElementById('db-contador').textContent = ''
}

// ===== BUSCA DB (async/await) =====
async function buscarDB(pagina = 1, urlDireta = null) {
  const secao = document.getElementById('db-secao').value
  const grid  = document.getElementById('db-grid')
  grid.innerHTML = ''
  document.getElementById('db-erro').textContent    = ''
  document.getElementById('db-contador').textContent = 'Buscando...'

  // Monta URL com filtros ou usa urlDireta (links de paginação)
  let url = urlDireta || `${DB_URL}/${secao}?page=${pagina}&limit=12`

  if (!urlDireta) {
    if (secao === 'characters') {
      const raca  = document.getElementById('db-raca').value
      const afil  = document.getElementById('db-afiliacao').value
      // Filtros não têm paginação conforme documentação
      if (raca || afil) {
        url = `${DB_URL}/characters?`
        if (raca) url += `race=${encodeURIComponent(raca)}&`
        if (afil) url += `affiliation=${encodeURIComponent(afil)}`
      }
    } else {
      const dest = document.getElementById('db-destruido').value
      if (dest !== '') url = `${DB_URL}/planets?isDestroyed=${dest}`
    }
  }

  try {
    const resposta = await fetch(url)
    const dados    = await resposta.json()
    console.log(JSON.stringify(dados))

    // Resposta com paginação tem .items e .meta
    const itens = Array.isArray(dados) ? dados : dados.items
    const meta  = dados.meta  || null
    dbLinks     = dados.links || {}

    if (!itens || itens.length === 0) {
      document.getElementById('db-erro').textContent    = 'Nenhum resultado encontrado.'
      document.getElementById('db-contador').textContent = ''
      return
    }

    const total = meta ? meta.totalItems : itens.length
    const pAtual = meta ? meta.currentPage : 1
    const pTotal = meta ? meta.totalPages  : 1
    document.getElementById('db-contador').textContent =
      `${total} resultado(s)${meta ? ` — página ${pAtual} de ${pTotal}` : ''}`

    itens.forEach((item, i) => {
      const card = secao === 'characters' ? criarCardPersonagem(item, i) : criarCardPlaneta(item, i)
      grid.appendChild(card)
    })

    // Paginação usando os links retornados pela API
    if (meta && meta.totalPages > 1) renderPaginacaoDB(meta)

  } catch (erro) {
    document.getElementById('db-erro').textContent = `Erro: ${erro.message}`
    console.log(`Erro DB: ${erro}`)
  }
}

// ===== CARD PERSONAGEM =====
function criarCardPersonagem(p, i) {
  const card = document.createElement('div')
  card.classList.add('card-db')
  card.style.animationDelay = `${i * 0.04}s`

  const img = p.image
    ? `<img src="${p.image}" alt="${p.name}" loading="lazy" />`
    : `<div class="sem-poster">👤</div>`

  card.innerHTML = `
    ${img}
    <div class="card-info">
      <div class="card-titulo">${p.name}</div>
      <div class="card-sub">${p.race} — ${p.gender}</div>
      <div class="card-badge">⚡ Ki: ${p.ki}</div>
    </div>
  `
  // Clique busca detalhes do personagem (parâmetro /characters/{id})
  card.addEventListener('click', () => buscarDetalhesDB('characters', p.id))
  return card
}

// ===== CARD PLANETA =====
function criarCardPlaneta(p, i) {
  const card = document.createElement('div')
  card.classList.add('card-db')
  card.style.animationDelay = `${i * 0.04}s`

  const img = p.image
    ? `<img src="${p.image}" alt="${p.name}" loading="lazy" />`
    : `<div class="sem-poster">🌍</div>`

  const status = p.isDestroyed
    ? `<span style="color:#e50914">💥 Destruído</span>`
    : `<span style="color:#2ecc71">✅ Existente</span>`

  card.innerHTML = `
    ${img}
    <div class="card-info">
      <div class="card-titulo">${p.name}</div>
      <div class="card-sub">${status}</div>
    </div>
  `
  card.addEventListener('click', () => buscarDetalhesDB('planets', p.id))
  return card
}

// ===== DETALHES DB — .then() / .catch() =====
function buscarDetalhesDB(secao, id) {
  fetch(`${DB_URL}/${secao}/${id}`)
    .then(r => r.json())
    .then(d => {
      console.log(JSON.stringify(d))
      if (secao === 'characters') mostrarModalPersonagem(d)
      else mostrarModalPlaneta(d)
    })
    .catch(e => console.log(`Erro detalhes DB: ${e}`))
}

function mostrarModalPersonagem(d) {
  const transfs = d.transformations && d.transformations.length > 0
    ? `<div class="transformacoes">${d.transformations.map(t =>
        `<div class="transf-item"><img src="${t.image}" alt="${t.name}" />${t.name}</div>`
      ).join('')}</div>`
    : ''

  abrirModal(`
    <img src="${d.image}" alt="${d.name}" />
    <div class="modal-body">
      <h2>${d.name}</h2>
      <p>
        <span class="tag">${d.race}</span>
        <span class="tag">${d.gender}</span>
        <span class="tag">${d.affiliation}</span>
      </p>
      <p><span class="destaque">⚡ Ki:</span> ${d.ki} / Max: ${d.maxKi}</p>
      <p>${d.description}</p>
      ${d.originPlanet ? `<p><strong>Planeta de origem:</strong> ${d.originPlanet.name}</p>` : ''}
      ${transfs ? `<p><strong>Transformações:</strong></p>${transfs}` : ''}
    </div>
  `)
}

function mostrarModalPlaneta(d) {
  const status = d.isDestroyed
    ? `<span style="color:#e50914">💥 Destruído</span>`
    : `<span style="color:#2ecc71">✅ Existente</span>`

  const personagens = d.characters && d.characters.length > 0
    ? d.characters.map(c => `<span class="tag">${c.name}</span>`).join('')
    : 'Nenhum personagem associado'

  abrirModal(`
    <img src="${d.image}" alt="${d.name}" />
    <div class="modal-body">
      <h2>${d.name}</h2>
      <p>${status}</p>
      <p>${d.description}</p>
      <p><strong>Personagens:</strong></p>
      <p>${personagens}</p>
    </div>
  `)
}

// ===== PAGINAÇÃO DB (usando links da API) =====
function renderPaginacaoDB(meta) {
  const pag = document.getElementById('paginacao-db')
  pag.innerHTML = ''

  // Usa os links retornados pela API conforme documentação
  if (dbLinks.first)    pag.appendChild(criarBtnPag('« Primeiro', () => buscarDB(1, dbLinks.first)))
  if (dbLinks.previous) pag.appendChild(criarBtnPag('‹ Anterior', () => buscarDB(1, dbLinks.previous)))

  const ini = Math.max(1, meta.currentPage - 2)
  const fim = Math.min(meta.totalPages, meta.currentPage + 2)
  for (let p = ini; p <= fim; p++) {
    const b = criarBtnPag(p, () => buscarDB(p))
    if (p === meta.currentPage) b.classList.add('ativa')
    pag.appendChild(b)
  }

  if (dbLinks.next) pag.appendChild(criarBtnPag('Próximo ›', () => buscarDB(1, dbLinks.next)))
  if (dbLinks.last) pag.appendChild(criarBtnPag('Último »',  () => buscarDB(1, dbLinks.last)))
}

// ===== HELPERS =====
function criarBtnPag(label, fn) {
  const b = document.createElement('button')
  b.classList.add('btn-pag')
  b.textContent = label
  b.addEventListener('click', fn)
  return b
}

function abrirModal(html) {
  document.getElementById('modal-corpo').innerHTML = html
  document.getElementById('modal-overlay').classList.remove('hidden')
}

// ===== TROCAR ABA =====
function trocarAba(aba) {
  document.getElementById('aba-filmes').classList.toggle('hidden', aba !== 'filmes')
  document.getElementById('aba-dragonball').classList.toggle('hidden', aba !== 'dragonball')
  document.querySelectorAll('.tab').forEach((t, i) => {
    t.classList.toggle('ativa', (i === 0 && aba === 'filmes') || (i === 1 && aba === 'dragonball'))
  })
}

// ===== FECHAR MODAL =====
document.getElementById('btn-fechar-modal').addEventListener('click', () => {
  document.getElementById('modal-overlay').classList.add('hidden')
})
document.getElementById('modal-overlay').addEventListener('click', (e) => {
  if (e.target === document.getElementById('modal-overlay'))
    document.getElementById('modal-overlay').classList.add('hidden')
})

// Enter na busca de filmes
document.getElementById('busca').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') buscarFilmes(1)
})

// Carrega personagens Dragon Ball ao abrir a aba
buscarDB(1)

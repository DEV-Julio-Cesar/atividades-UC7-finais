// ===== TEMA (compartilhado com script.js) =====
function aplicarTema(tema) {
  document.documentElement.setAttribute('data-theme', tema)
  document.getElementById('btn-tema').textContent = tema === 'dark' ? '🌙' : '☀️'
  localStorage.setItem('cinema-tema', tema)
}

document.getElementById('btn-tema').addEventListener('click', () => {
  const atual = document.documentElement.getAttribute('data-theme')
  aplicarTema(atual === 'dark' ? 'light' : 'dark')
})

const temaSalvo = localStorage.getItem('cinema-tema') || 'dark'
aplicarTema(temaSalvo)

// ===== USUÁRIOS =====
// Lê a lista de usuários do localStorage (array de { nome, email, senha })
function getUsuarios() {
  return JSON.parse(localStorage.getItem('cinema-usuarios') || '[]')
}

function salvarUsuarios(lista) {
  localStorage.setItem('cinema-usuarios', JSON.stringify(lista))
}

// ===== SESSÃO =====
// Salva o usuário logado e redireciona para o sistema
function iniciarSessao(usuario) {
  localStorage.setItem('cinema-sessao', JSON.stringify(usuario))
  window.location.href = 'index.html'
}

// ===== ALTERNAR PAINÉIS =====
function mostrarPainel(qual) {
  document.getElementById('painel-login').classList.toggle('hidden', qual !== 'login')
  document.getElementById('painel-cadastro').classList.toggle('hidden', qual !== 'cadastro')
  document.getElementById('erro-login').textContent    = ''
  document.getElementById('erro-cadastro').textContent = ''
}

// ===== TOGGLE VER SENHA =====
function toggleSenha(inputId, btn) {
  const input = document.getElementById(inputId)
  if (input.type === 'password') {
    input.type = 'text'
    btn.textContent = '🙈'
  } else {
    input.type = 'password'
    btn.textContent = '👁️'
  }
}

// ===== LOGIN =====
document.getElementById('form-login').addEventListener('submit', (evento) => {
  evento.preventDefault()

  const email = document.getElementById('login-email').value.trim().toLowerCase()
  const senha = document.getElementById('login-senha').value
  const erro  = document.getElementById('erro-login')

  const usuario = getUsuarios().find(u => u.email === email && u.senha === senha)

  if (!usuario) {
    erro.textContent = 'E-mail ou senha incorretos.'
    return
  }

  iniciarSessao(usuario)
})

// ===== CRIAR CONTA =====
document.getElementById('form-cadastro').addEventListener('submit', (evento) => {
  evento.preventDefault()

  const nome     = document.getElementById('cad-nome').value.trim()
  const email    = document.getElementById('cad-email').value.trim().toLowerCase()
  const senha    = document.getElementById('cad-senha').value
  const confirma = document.getElementById('cad-confirma').value
  const erro     = document.getElementById('erro-cadastro')

  if (senha.length < 6) {
    erro.textContent = 'A senha deve ter no mínimo 6 caracteres.'
    return
  }

  if (senha !== confirma) {
    erro.textContent = 'As senhas não coincidem.'
    return
  }

  const usuarios = getUsuarios()

  if (usuarios.find(u => u.email === email)) {
    erro.textContent = 'Este e-mail já está cadastrado.'
    return
  }

  const novoUsuario = { nome, email, senha }
  usuarios.push(novoUsuario)
  salvarUsuarios(usuarios)
  iniciarSessao(novoUsuario)
})

// Se já estiver logado, vai direto para o sistema
if (localStorage.getItem('cinema-sessao')) {
  window.location.href = 'index.html'
}

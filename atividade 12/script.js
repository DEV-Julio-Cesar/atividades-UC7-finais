// Captura o tbody pelo id da tabela + getElementsByTagName (padrão do exemplo)
const tabela = document.getElementById('tabela-pacientes').getElementsByTagName('tbody')[0]

/**
 * Calcula o IMC e retorna valor, classe CSS e classificação.
 * Fórmula: IMC = peso / (altura²)
 */
function calcularIMC(peso, altura) {
  const imc = peso / (altura * altura)
  let classe, label

  if (imc < 18.5) {
    classe = 'imc-baixo'
    label  = 'Abaixo do peso'
  } else if (imc < 25) {
    classe = 'imc-normal'
    label  = 'Normal'
  } else if (imc < 30) {
    classe = 'imc-sobre'
    label  = 'Sobrepeso'
  } else {
    classe = 'imc-obeso'
    label  = 'Obesidade'
  }

  return { valor: imc.toFixed(2), classe, label }
}

function cadastrar(evento) {
  evento.preventDefault()

  const nome       = document.getElementById('nome').value
  const nascimento = document.getElementById('nascimento').value
  const email      = document.getElementById('email').value
  const telefone   = document.getElementById('telefone').value
  const endereco   = document.getElementById('endereco').value
  const profissao  = document.getElementById('profissao').value
  const altura     = parseFloat(document.getElementById('altura').value)
  const peso       = parseFloat(document.getElementById('peso').value)

  if (!nome || !nascimento || !email || !telefone || !endereco || !profissao || !altura || !peso) {
    alert('Por favor, preencha todos os campos.')
    return
  }

  const imc  = calcularIMC(peso, altura)
  const linha = tabela.insertRow() // cria <tr></tr> no tbody

  // innerHTML com template literal — preenche todas as células de uma vez
  // Botões inline passando this como parâmetro (padrão do exemplo)
  linha.innerHTML = `
    <td>${nome}</td>
    <td>${nascimento}</td>
    <td>${email}</td>
    <td>${telefone}</td>
    <td>${endereco}</td>
    <td>${profissao}</td>
    <td>${altura.toFixed(2)}</td>
    <td>${peso.toFixed(1)}</td>
    <td class="${imc.classe}" title="${imc.label}">${imc.valor}</td>
    <td>
      <button class="btn-editar"  onclick="editar(this)">✏️ Editar</button>
      <button class="btn-excluir" onclick="excluir(this)">🗑️ Excluir</button>
    </td>
  `

  document.getElementById('form-paciente').reset()
  document.getElementById('nome').focus()
}

// Remove a linha: botão → <td> → <tr> → .remove()
function excluir(elemento) {
  elemento.parentElement.parentElement.remove()
}

// Devolve os dados da linha para os inputs do formulário
function editar(elemento) {
  const linha   = elemento.parentElement.parentElement
  const celulas = linha.querySelectorAll('td')

  document.getElementById('nome').value       = celulas[0].innerText
  document.getElementById('nascimento').value = celulas[1].innerText
  document.getElementById('email').value      = celulas[2].innerText
  document.getElementById('telefone').value   = celulas[3].innerText
  document.getElementById('endereco').value   = celulas[4].innerText
  document.getElementById('profissao').value  = celulas[5].innerText
  document.getElementById('altura').value     = celulas[6].innerText
  document.getElementById('peso').value       = celulas[7].innerText

  linha.remove()
  document.getElementById('nome').focus()
}

document.getElementById('btn-cadastrar').addEventListener('click', cadastrar)

// keydown no último input — dispara cadastro ao pressionar Enter
document.getElementById('peso').addEventListener('keydown', (evento) => {
  if (evento.key === 'Enter') {
    cadastrar(evento)
  }
})

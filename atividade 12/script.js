// Captura o tbody pelo id da tabela + getElementsByTagName (padrão do exemplo)
const tabela = document.getElementById('tabela-pacientes').getElementsByTagName('tbody')[0]

// ===== VIACEP =====
// Consulta o CEP na API ViaCEP usando async/await e preenche os campos automaticamente
async function consultarCEP() {
  const cep = document.getElementById('cep').value.replace(/\D/g, '') // remove traço/espaço

  if (cep.length !== 8) return // CEP precisa ter 8 dígitos

  const btn = document.getElementById('btn-cep')
  btn.textContent = '...'
  btn.disabled    = true

  try {
    // Fetch API com async/await — não bloqueia a execução
    const resposta = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
    const dados    = await resposta.json() // converte para JSON

    // Depuração no console conforme requisito
    console.log(JSON.stringify(dados))

    // CEP inexistente retorna { erro: true }
    if (dados.erro) {
      alert('CEP não encontrado.')
      return
    }

    // Preenche os campos automaticamente com os dados retornados
    document.getElementById('logradouro').value = dados.logradouro
    document.getElementById('bairro').value     = dados.bairro
    document.getElementById('cidade').value     = dados.localidade
    document.getElementById('estado-pac').value = dados.uf

    // Foca no campo número para o usuário completar
    document.getElementById('numero').focus()

  } catch (erro) {
    // try/catch trata erros de conexão
    alert(`Erro ao consultar CEP: ${erro.message}`)
  } finally {
    btn.textContent = 'Consultar'
    btn.disabled    = false
  }
}

// ===== IMC =====
function calcularIMC(peso, altura) {
  const imc = peso / (altura * altura)
  let classe, label

  if (imc < 18.5)      { classe = 'imc-baixo';  label = 'Abaixo do peso' }
  else if (imc < 25)   { classe = 'imc-normal'; label = 'Normal'         }
  else if (imc < 30)   { classe = 'imc-sobre';  label = 'Sobrepeso'      }
  else                 { classe = 'imc-obeso';  label = 'Obesidade'      }

  return { valor: imc.toFixed(2), classe, label }
}

// ===== CADASTRAR =====
function cadastrar(evento) {
  evento.preventDefault()

  const nome       = document.getElementById('nome').value
  const nascimento = document.getElementById('nascimento').value
  const email      = document.getElementById('email').value
  const telefone   = document.getElementById('telefone').value
  const cep        = document.getElementById('cep').value
  const logradouro = document.getElementById('logradouro').value
  const numero     = document.getElementById('numero').value
  const bairro     = document.getElementById('bairro').value
  const cidade     = document.getElementById('cidade').value
  const estadoPac  = document.getElementById('estado-pac').value
  const profissao  = document.getElementById('profissao').value
  const altura     = parseFloat(document.getElementById('altura').value)
  const peso       = parseFloat(document.getElementById('peso').value)

  if (!nome || !nascimento || !email || !telefone || !profissao || !altura || !peso) {
    alert('Por favor, preencha todos os campos obrigatórios.')
    return
  }

  const imc  = calcularIMC(peso, altura)
  const linha = tabela.insertRow() // cria <tr></tr> no tbody

  linha.innerHTML = `
    <td>${nome}</td>
    <td>${nascimento}</td>
    <td>${email}</td>
    <td>${telefone}</td>
    <td>${logradouro}</td>
    <td>${numero}</td>
    <td>${bairro}</td>
    <td>${cidade}</td>
    <td>${estadoPac}</td>
    <td>${cep}</td>
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
  document.getElementById('logradouro').value = celulas[4].innerText
  document.getElementById('numero').value     = celulas[5].innerText
  document.getElementById('bairro').value     = celulas[6].innerText
  document.getElementById('cidade').value     = celulas[7].innerText
  document.getElementById('estado-pac').value = celulas[8].innerText
  document.getElementById('cep').value        = celulas[9].innerText
  document.getElementById('profissao').value  = celulas[10].innerText
  document.getElementById('altura').value     = celulas[11].innerText
  document.getElementById('peso').value       = celulas[12].innerText

  linha.remove()
  document.getElementById('nome').focus()
}

document.getElementById('btn-cadastrar').addEventListener('click', cadastrar)

document.getElementById('peso').addEventListener('keydown', (evento) => {
  if (evento.key === 'Enter') cadastrar(evento)
})

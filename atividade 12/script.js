/**
 * ============================================================
 *  SISTEMA DA NUTRICIONISTA — script.js
 * ============================================================
 */

/**
 * Calcula o IMC e retorna valor, classe CSS e classificação textual.
 * Fórmula: IMC = peso / (altura²)
 *
 * @param {number} peso   - peso em kg
 * @param {number} altura - altura em metros
 * @returns {{ valor: string, classe: string, label: string }}
 */
function calcularIMC(peso, altura) {
  const imc = peso / (altura * altura);
  let classe, label;

  if (imc < 18.5) {
    classe = 'imc-baixo';
    label  = 'Abaixo do peso';
  } else if (imc < 25) {
    classe = 'imc-normal';
    label  = 'Normal';
  } else if (imc < 30) {
    classe = 'imc-sobre';
    label  = 'Sobrepeso';
  } else {
    classe = 'imc-obeso';
    label  = 'Obesidade';
  }

  return { valor: imc.toFixed(2), classe, label };
}

/**
 * Cadastra um novo paciente na tabela.
 * - Lê os valores dos inputs via getElementById
 * - Valida se todos os campos foram preenchidos
 * - Calcula o IMC
 * - Insere a linha com insertRow() + innerHTML (template literal)
 * - Limpa o formulário após o cadastro
 *
 * @param {Event} evento - evento de clique ou keydown
 */
function cadastrar(evento) {
  // preventDefault — impede o recarregamento padrão da página
  evento.preventDefault();

  const nome       = document.getElementById('nome').value.trim();
  const nascimento = document.getElementById('nascimento').value;
  const email      = document.getElementById('email').value.trim();
  const telefone   = document.getElementById('telefone').value.trim();
  const endereco   = document.getElementById('endereco').value.trim();
  const profissao  = document.getElementById('profissao').value.trim();
  const altura     = parseFloat(document.getElementById('altura').value);
  const peso       = parseFloat(document.getElementById('peso').value);

  if (!nome || !nascimento || !email || !telefone || !endereco || !profissao || !altura || !peso) {
    alert('Por favor, preencha todos os campos.');
    return;
  }

  const imc    = calcularIMC(peso, altura);
  const tabela = document.getElementById('tbody-pacientes');

  // insertRow() — cria e insere uma nova <tr> no final do tbody
  const linha = tabela.insertRow();

  // innerHTML com template literal — preenche todas as células de uma vez
  // Botões chamam as funções inline passando 'this' (o próprio botão)
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
  `;

  document.getElementById('form-paciente').reset();
  document.getElementById('nome').focus();
}

/**
 * Remove a linha da tabela a partir do botão clicado.
 * Navegação DOM: botão → <td> → <tr> → .remove()
 *
 * @param {HTMLElement} elemento - botão clicado
 */
function excluir(elemento) {
  elemento.parentElement.parentElement.remove();
}

/**
 * Devolve os dados da linha para os campos do formulário.
 * - Navega até a <tr> via parentElement
 * - Usa querySelectorAll('td') para obter todas as células
 * - Lê o texto de cada célula com .innerText e atribui ao .value do input
 * - Remove a linha para evitar duplicata ao recadastrar
 *
 * @param {HTMLElement} elemento - botão clicado
 */
function editar(elemento) {
  // button → td → tr
  const linha   = elemento.parentElement.parentElement;
  const celulas = linha.querySelectorAll('td');

  document.getElementById('nome').value       = celulas[0].innerText;
  document.getElementById('nascimento').value = celulas[1].innerText;
  document.getElementById('email').value      = celulas[2].innerText;
  document.getElementById('telefone').value   = celulas[3].innerText;
  document.getElementById('endereco').value   = celulas[4].innerText;
  document.getElementById('profissao').value  = celulas[5].innerText;
  document.getElementById('altura').value     = celulas[6].innerText;
  document.getElementById('peso').value       = celulas[7].innerText;

  linha.remove();
  document.getElementById('nome').focus();
}

// addEventListener no botão Cadastrar
document.getElementById('btn-cadastrar').addEventListener('click', cadastrar);

// addEventListener('keydown') no último input — dispara cadastro ao pressionar Enter
document.getElementById('peso').addEventListener('keydown', function (evento) {
  if (evento.key === 'Enter') {
    cadastrar(evento);
  }
});

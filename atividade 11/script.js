/**
 * ============================================================
 *  EXERCÍCIO 1 — LISTA DE COMPRAS DINÂMICA
 * ============================================================
 */

/**
 * Mapa que associa o valor do <option> ao rótulo exibido na UI.
 * Facilita a criação dos títulos de categoria sem depender do DOM do <select>.
 */
const CATEGORY_LABELS = {
  frutas:    '🍎 Frutas',
  limpeza:   '🧹 Limpeza',
  mercearia: '🛍️ Mercearia',
  congelados:'🧊 Congelados',
  bebidas:   '🥤 Bebidas',
  padaria:   '🍞 Padaria',
};

// Referências aos elementos do formulário de compras
const shoppingForm     = document.getElementById('shopping-form');
const productInput     = document.getElementById('product-input');
const categorySelect   = document.getElementById('category-select');
const categoriesContainer = document.getElementById('categories-container');

/**
 * Retorna (ou cria) o bloco <div> de uma categoria específica.
 * Usa querySelector para verificar se o bloco já existe no DOM.
 *
 * @param {string} category - chave da categoria (ex: 'frutas')
 * @returns {HTMLOListElement} - o elemento <ol> onde os itens serão inseridos
 */
function getOrCreateCategoryBlock(category) {
  // Tenta encontrar um bloco já existente pelo atributo data-category
  let block = categoriesContainer.querySelector(`[data-category="${category}"]`);

  if (!block) {
    // createElement — cria um novo nó de elemento no DOM
    block = document.createElement('div');
    block.classList.add('category-block');
    block.dataset.category = category; // atributo data-* para identificação

    // innerHTML — define o HTML interno do bloco com título e lista vazia
    block.innerHTML = `
      <h3>${CATEGORY_LABELS[category]} <span class="count">(0)</span></h3>
      <ol class="item-list"></ol>
    `;

    // appendChild — insere o novo bloco como filho do container
    categoriesContainer.appendChild(block);
  }

  return block;
}

/**
 * Atualiza o contador de itens exibido no título da categoria.
 * querySelectorAll retorna uma NodeList com todos os itens da lista.
 *
 * @param {HTMLElement} block - o bloco da categoria
 */
function updateCategoryCount(block) {
  // querySelectorAll — seleciona todos os <li> dentro do bloco
  const total = block.querySelectorAll('li').length;
  // querySelector — seleciona o primeiro elemento .count dentro do bloco
  block.querySelector('.count').textContent = `(${total})`;
}

/**
 * Cria e insere um novo item na lista da categoria correspondente.
 * Demonstra: createElement, textContent, classList, addEventListener, appendChild, remove.
 *
 * @param {string} productName - nome do produto digitado
 * @param {string} category    - categoria selecionada
 */
function addShoppingItem(productName, category) {
  const block = getOrCreateCategoryBlock(category);
  const list  = block.querySelector('.item-list');

  // Cria o elemento <li> que envolve o item
  const li = document.createElement('li');
  li.classList.add('shopping-item');

  // Cria o <span> com o nome do produto
  const span = document.createElement('span');
  span.classList.add('item-text');
  span.textContent = productName;

  /**
   * addEventListener('click') — escuta cliques no texto do item.
   * toggle — alterna a classe 'bought', aplicando/removendo o risco visual.
   */
  span.addEventListener('click', () => {
    span.classList.toggle('bought');
  });

  // Cria o botão de exclusão
  const deleteBtn = document.createElement('button');
  deleteBtn.classList.add('delete-item-btn');
  deleteBtn.textContent = '✕';
  deleteBtn.setAttribute('aria-label', `Remover ${productName}`);

  /**
   * .remove() — remove o elemento <li> diretamente do DOM,
   * sem precisar referenciar o elemento pai.
   */
  deleteBtn.addEventListener('click', () => {
    li.remove();
    updateCategoryCount(block);

    // Se a lista ficou vazia, remove o bloco inteiro da categoria
    if (block.querySelectorAll('li').length === 0) {
      block.remove();
    }
  });

  // Monta a estrutura: li > span + button
  li.appendChild(span);
  li.appendChild(deleteBtn);
  list.appendChild(li);

  updateCategoryCount(block);
}

/**
 * Listener do submit do formulário de compras.
 * preventDefault — impede o recarregamento padrão da página.
 */
shoppingForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const name     = productInput.value.trim();
  const category = categorySelect.value;

  if (!name) return; // guarda contra strings vazias após trim

  addShoppingItem(name, category);

  // Limpa o campo de texto após inserção (requisito do exercício)
  productInput.value = '';
  productInput.focus(); // devolve o foco para agilizar a digitação
});


/**
 * ============================================================
 *  EXERCÍCIO 2 — QUADRO KANBAN
 * ============================================================
 */

// Referências ao formulário Kanban
const kanbanForm   = document.getElementById('kanban-form');
const taskTitle    = document.getElementById('task-title');
const taskDesc     = document.getElementById('task-desc');
const taskPriority = document.getElementById('task-priority');
const clearBtn     = document.getElementById('clear-btn');

/**
 * Ordem das colunas usada para calcular o avanço da tarefa.
 * O índice determina a progressão: todo → doing → done → (excluir)
 */
const COLUMNS = ['todo', 'doing', 'done'];

/**
 * Rótulos legíveis para cada valor de prioridade.
 */
const PRIORITY_LABELS = {
  baixa: '🟢 Baixa',
  media: '🟡 Média',
  alta:  '🔴 Alta',
};

/**
 * Cria e retorna um card Kanban completo como elemento do DOM.
 * Demonstra: createElement, innerHTML, classList, dataset, addEventListener.
 *
 * @param {Object} task - { title, desc, priority }
 * @returns {HTMLElement} - o card pronto para ser inserido no DOM
 */
function createCard(task) {
  const card = document.createElement('div');
  card.classList.add('kanban-card', task.priority); // classe de prioridade para cor

  // innerHTML — preenche o card com título, descrição e prioridade
  card.innerHTML = `
    <div class="card-title">${escapeHtml(task.title)}</div>
    <div class="card-desc">${escapeHtml(task.desc)}</div>
    <div class="card-priority ${task.priority}">${PRIORITY_LABELS[task.priority]}</div>
    <div class="card-actions">
      <button class="btn-advance">Avançar ▶</button>
      <button class="btn-edit">✏️ Editar</button>
      <button class="btn-delete">🗑️ Excluir</button>
    </div>
  `;

  // ---- Botão AVANÇAR ----
  card.querySelector('.btn-advance').addEventListener('click', () => {
    advanceCard(card);
  });

  // ---- Botão EXCLUIR ----
  card.querySelector('.btn-delete').addEventListener('click', () => {
    card.remove(); // .remove() exclui o card diretamente do DOM
  });

  // ---- Botão EDITAR ----
  card.querySelector('.btn-edit').addEventListener('click', () => {
    toggleEditMode(card, task);
  });

  return card;
}

/**
 * Move o card para a próxima coluna.
 * Se já estiver em 'done', o card é excluído com .remove().
 *
 * Usa closest() para subir na árvore do DOM e encontrar
 * o container pai (.cards-container) e seu atributo data-column.
 *
 * @param {HTMLElement} card - o card a ser avançado
 */
function advanceCard(card) {
  // closest — percorre os ancestrais até encontrar .cards-container
  const currentContainer = card.closest('.cards-container');
  const currentColumn    = currentContainer.dataset.column; // lê data-column
  const currentIndex     = COLUMNS.indexOf(currentColumn);

  if (currentIndex === COLUMNS.length - 1) {
    // Já está em 'done': exclui o card
    card.remove();
    return;
  }

  // Calcula a próxima coluna e move o card
  const nextColumn    = COLUMNS[currentIndex + 1];
  const nextContainer = document.querySelector(`.cards-container[data-column="${nextColumn}"]`);
  nextContainer.appendChild(card); // appendChild move o nó (não duplica)
}

/**
 * Alterna o modo de edição inline do card.
 * Substitui os elementos de exibição por inputs editáveis,
 * e adiciona um botão "Salvar" para confirmar as alterações.
 *
 * Demonstra: querySelector, textContent, value, replaceWith.
 *
 * @param {HTMLElement} card - o card sendo editado
 * @param {Object}      task - referência ao objeto de dados da tarefa
 */
function toggleEditMode(card, task) {
  const titleEl    = card.querySelector('.card-title');
  const descEl     = card.querySelector('.card-desc');
  const actionsEl  = card.querySelector('.card-actions');

  // Cria inputs preenchidos com os valores atuais
  const titleInput = document.createElement('input');
  titleInput.type  = 'text';
  titleInput.classList.add('card-edit-input');
  titleInput.value = task.title;

  const descInput = document.createElement('textarea');
  descInput.classList.add('card-edit-input');
  descInput.rows  = 2;
  descInput.value = task.desc;

  // Substitui os elementos de texto pelos inputs
  // replaceWith — substitui um nó por outro no DOM
  titleEl.replaceWith(titleInput);
  descEl.replaceWith(descInput);

  // Cria botão Salvar temporário
  const saveBtn = document.createElement('button');
  saveBtn.textContent = '💾 Salvar';
  saveBtn.classList.add('btn-edit');
  actionsEl.prepend(saveBtn); // prepend — insere como primeiro filho

  // Esconde o botão Editar enquanto está no modo edição
  const editBtn = actionsEl.querySelector('.btn-edit:not(:first-child)');
  if (editBtn) editBtn.style.display = 'none';

  saveBtn.addEventListener('click', () => {
    // Atualiza o objeto de dados
    task.title = titleInput.value.trim() || task.title;
    task.desc  = descInput.value.trim();

    // Cria novos elementos de exibição com os valores atualizados
    const newTitle = document.createElement('div');
    newTitle.classList.add('card-title');
    newTitle.textContent = task.title;

    const newDesc = document.createElement('div');
    newDesc.classList.add('card-desc');
    newDesc.textContent = task.desc;

    // Restaura os elementos de texto
    titleInput.replaceWith(newTitle);
    descInput.replaceWith(newDesc);

    // Remove o botão Salvar e reexibe o botão Editar
    saveBtn.remove();
    if (editBtn) editBtn.style.display = '';
  });
}

/**
 * Sanitiza strings para evitar injeção de HTML (XSS básico).
 * Usa a API do DOM (createElement + textContent) para escapar
 * caracteres especiais de forma segura.
 *
 * @param {string} str - string a ser escapada
 * @returns {string}
 */
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/**
 * Listener do submit do formulário Kanban.
 * Cria um objeto de tarefa e insere o card na coluna 'To Do'.
 */
kanbanForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const title    = taskTitle.value.trim();
  const desc     = taskDesc.value.trim();
  const priority = taskPriority.value;

  if (!title) return;

  const task = { title, desc, priority };
  const card = createCard(task);

  // Insere sempre na coluna To Do (primeiro da lista COLUMNS)
  const todoContainer = document.querySelector('.cards-container[data-column="todo"]');
  todoContainer.appendChild(card);

  // Limpa o formulário após adicionar
  clearKanbanForm();
});

/**
 * Limpa todos os campos do formulário Kanban.
 * Listener também atribuído ao botão "Limpar".
 */
function clearKanbanForm() {
  taskTitle.value    = '';
  taskDesc.value     = '';
  taskPriority.value = 'baixa';
  taskTitle.focus();
}

// Botão Limpar chama a mesma função de limpeza
clearBtn.addEventListener('click', clearKanbanForm);

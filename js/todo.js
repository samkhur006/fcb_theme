// --- /js/todo.js ---
function createTodoPopup() {
  // Popup zaten varsa kapat
  const existing = document.getElementById('todoPopup');
  if (existing) {
    existing.remove();
    return;
  }

  // Popup kapsayıcısı
  const popup = document.createElement('div');
  popup.id = 'todoPopup';
  popup.className = 'toolPopup';
  popup.innerHTML = `
    <button id="todo-close" class="popup-close">&times;</button>
    <h3 class="todo-title">My To‑Do List</h3>
    <div class="todo-input-group">
      <input type="text" id="todo-input" placeholder="New task..." />
      <button id="todo-add">Add</button>
    </div>
    <ul id="todo-list" class="todo-list"></ul>
  `;
  document.body.appendChild(popup);

  // Elemanlar
  const listEl  = popup.querySelector('#todo-list');
  const inputEl = popup.querySelector('#todo-input');
  const addBtn  = popup.querySelector('#todo-add');
  const closeBtn= popup.querySelector('#todo-close');

  // LocalStorage’den yükle
  let todos = JSON.parse(localStorage.getItem('todos') || '[]');
  function save() {
    localStorage.setItem('todos', JSON.stringify(todos));
  }

  // Listeyi render et
  function render() {
    listEl.innerHTML = '';
    todos.forEach((t, i) => {
      const li = document.createElement('li');
      li.className = t.done ? 'done' : '';
      li.innerHTML = `
        <span class="todo-text">${t.text}</span>
        <div class="todo-actions">
          <button data-action="toggle"   data-i="${i}">${t.done? '↺' : '✓'}</button>
          <button data-action="delete"   data-i="${i}">✕</button>
        </div>
      `;
      listEl.appendChild(li);
    });
  }

  // Butonlar
  addBtn.addEventListener('click', () => {
    const v = inputEl.value.trim();
    if (!v) return;
    todos.push({ text: v, done: false });
    inputEl.value = '';
    save(); render();
  });

  listEl.addEventListener('click', e => {
    const btn = e.target.closest('button');
    if (!btn) return;
    const i = +btn.dataset.i;
    if (btn.dataset.action === 'delete') {
      todos.splice(i,1);
    } else if (btn.dataset.action === 'toggle') {
      todos[i].done = !todos[i].done;
    }
    save(); render();
  });

  closeBtn.addEventListener('click', () => popup.remove());

  // İlk render
  render();
}

// İkon tıklandığında aç
document.addEventListener('DOMContentLoaded', () => {
  const icon = document.getElementById('todoIcon');
  if (icon) icon.addEventListener('click', createTodoPopup);
});

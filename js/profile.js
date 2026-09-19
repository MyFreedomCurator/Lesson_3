// ---------- Инициализация ----------
const student = JSON.parse(localStorage.getItem('student') || 'null');
if (!student) {
  window.location.href = 'index.html';
}
document.getElementById('student-name').textContent =
  `${student.lastname} ${student.firstname}`;

const tasksList   = document.getElementById('tasks-list');
const modal       = document.getElementById('modal');
const modalTitle  = document.getElementById('modal-title');
const modalCond   = document.getElementById('modal-condition');
const rewardEl    = document.getElementById('reward');

let currentTask = null;

// ---------- Список задач ----------
function isTaskDone(taskId) {
  return localStorage.getItem('done_' + taskId) === '1';
}

function markTaskDone(taskId) {
  localStorage.setItem('done_' + taskId, '1');
}

function renderTasks() {
  tasksList.innerHTML = '';
  TASKS.forEach((t) => {
    const card = document.createElement('div');
    card.className = 'task-card' + (isTaskDone(t.id) ? ' done' : '');
    card.dataset.taskId = t.id;
    card.innerHTML = `<h3>${t.title}</h3>`;
    card.addEventListener('click', () => openTask(t));
    tasksList.appendChild(card);
  });
}

function refreshTaskCard(taskId) {
  const card = tasksList.querySelector(`[data-task-id="${taskId}"]`);
  if (card) card.classList.add('done');
}

// ---------- Открытие задачи ----------
function openTask(task) {
  currentTask = task;
  modalTitle.textContent = task.title;
  modalCond.innerHTML = task.condition;

  // localStorage хранит последний введённый код (сохраняем при каждом закрытии/проверке)
  const saved = localStorage.getItem('code_' + task.id);
  initEditor('code-editor', saved ?? task.starterCode);

  modal.classList.remove('hidden');
}

// ---------- Закрытие ----------
function closeModal() {
  if (currentTask && typeof getEditorCode === 'function') {
    localStorage.setItem('code_' + currentTask.id, getEditorCode());
  }
  modal.classList.add('hidden');
  currentTask = null;
}

document.getElementById('modal-close').addEventListener('click', closeModal);
modal.addEventListener('click', (e) => {
  if (e.target === modal) closeModal();
});

// ---------- Анимация "+5 к программированию" ----------
function showReward() {
  rewardEl.classList.remove('hidden');
  // Перезапускаем анимацию на случай повторного показа
  const inner = rewardEl.querySelector('.reward-inner');
  inner.style.animation = 'none';
  void inner.offsetWidth;      // reflow
  inner.style.animation = '';
}

function hideReward() {
  rewardEl.classList.add('hidden');
}

// ---------- Кнопка «Проверить» ----------
document.getElementById('btn-check').addEventListener('click', async () => {
  if (!currentTask) return;

  const code = getEditorCode();
  localStorage.setItem('code_' + currentTask.id, code);

  const result = await runPython(code);

  if (result.success) {
    showToast('✅ Ошибок нет — отличная работа!', 'success');
    await submitAnswer(currentTask, code, /* score */ 1);
  } else {
    let human;
    try {
      human = translateError(result.error);
    } catch (e) {
      human = 'Ошибка: ' + (result.error?.message || e.message);
    }
    showToast('⚠️ ' + human, 'error', 8000);
  }
});

// ---------- Кнопка «Отправить как есть» ----------
document.getElementById('btn-submit').addEventListener('click', async () => {
  if (!currentTask) return;

  const code = getEditorCode();
  localStorage.setItem('code_' + currentTask.id, code);

  showToast('📤 Работа отправлена как есть.', 'info');
  await submitAnswer(currentTask, code, /* score */ 1);
});

// ---------- Отправка + закрытие + награда ----------
async function submitAnswer(task, code, score) {
  // Отправляем в Google Sheets (не блокируем UI)
  sendToSheets({
    name: `${student.lastname} ${student.firstname}`,
    score,
    answer: code
  }).catch(() => {});

  // Помечаем задачу выполненной
  markTaskDone(task.id);
  refreshTaskCard(task.id);

  // Сохраняем код ещё раз (на случай если что-то поменялось)
  localStorage.setItem('code_' + task.id, code);

  // Показываем награду
  showReward();

  // Через 1.4 секунды — убираем награду и закрываем модалку
  setTimeout(() => {
    hideReward();
    // Закрываем без повторного сохранения — уже сохранили выше
    modal.classList.add('hidden');
    currentTask = null;
  }, 1400);
}

// ---------- Уведомления ----------
function showToast(message, type = 'info', duration = 5000) {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('hide');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// ---------- Старт ----------
renderTasks();

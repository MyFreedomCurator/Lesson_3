document.getElementById('login-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const lastname  = document.getElementById('lastname').value.trim();
  const firstname = document.getElementById('firstname').value.trim();

  // Сохраняем в localStorage, чтобы использовать на странице профиля
  localStorage.setItem('student', JSON.stringify({ lastname, firstname }));

  // Переход на профиль
  window.location.href = 'profile.html';
});

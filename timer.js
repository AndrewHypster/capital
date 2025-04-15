// Кількість часу для таймера (в секундах) — наприклад, 1 хвилин:
let countdown = 230; // 3хв, 50сек

const timerHours = document.querySelector('.timer-h .timer-num');
const timerMinutes = document.querySelector('.timer-m .timer-num');
const timerSeconds = document.querySelector('.timer-s .timer-num');

function updateTimer() {
  const hours = Math.floor(countdown / 3600);
  const minutes = Math.floor((countdown % 3600) / 60);
  const seconds = countdown % 60;

  timerHours.textContent = String(hours).padStart(2, '0');
  timerMinutes.textContent = String(minutes).padStart(2, '0');
  timerSeconds.textContent = String(seconds).padStart(2, '0');

  if (countdown > 0) {
    countdown--;
  } else {
    clearInterval(timerInterval);
    // Додатково: можеш викликати тут alert або якусь подію
  }
}

updateTimer(); // Перший запуск одразу
const timerInterval = setInterval(updateTimer, 1000); // Кожну секунду
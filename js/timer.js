function createTimerPopup() {
  const existing = document.getElementById('timerPopup');
  if (existing) {
    existing.remove();
    return;
  }

  let startTime = 0;
  let elapsed = 0;
  let timerInterval = null;

  const popup = document.createElement('div');
  popup.id = 'timerPopup';
  popup.className = 'toolPopup';
  popup.innerHTML = `
    <div class="timer-header">
      <h3>Timer</h3>
      <button id="timerClose" class="popup-close">×</button>
    </div>
    <div id="timerDisplay" class="timer-display">00:00:00</div>
    <div class="timer-controls">
      <button id="timerStart">Start</button>
      <button id="timerStop">Stop</button>
      <button id="timerReset">Reset</button>
    </div>
  `;
  document.body.appendChild(popup);

  const displayEl = popup.querySelector('#timerDisplay');
  const btnStart = popup.querySelector('#timerStart');
  const btnStop = popup.querySelector('#timerStop');
  const btnReset = popup.querySelector('#timerReset');
  const btnClose = popup.querySelector('#timerClose');

  function formatTime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const hrs = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
    const mins = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
    const secs = String(totalSeconds % 60).padStart(2, '0');
    return `${hrs}:${mins}:${secs}`;
  }

  function update() {
    elapsed = Date.now() - startTime;
    displayEl.textContent = formatTime(elapsed);
  }

  btnStart.addEventListener('click', () => {
    if (timerInterval) return;
    startTime = Date.now() - elapsed;
    timerInterval = setInterval(update, 500);
  });

  btnStop.addEventListener('click', () => {
    if (!timerInterval) return;
    clearInterval(timerInterval);
    timerInterval = null;
  });

  btnReset.addEventListener('click', () => {
    clearInterval(timerInterval);
    timerInterval = null;
    elapsed = 0;
    displayEl.textContent = '00:00:00';
  });

  btnClose.addEventListener('click', () => {
    popup.remove();
    clearInterval(timerInterval);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const icon = document.getElementById('timerIcon');
  if (icon) icon.addEventListener('click', createTimerPopup);
});

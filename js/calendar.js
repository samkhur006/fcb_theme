// calendar.js

function createCalendarPopup() {
  // Eğer açıksa kapa
  const existing = document.getElementById('calendarPopup');
  if (existing) {
    existing.remove();
    return;
  }

  // Dil ayarı
  const locale = navigator.language || 'en-US';
  const today = new Date();
  let currentMonth = today.getMonth();
  let currentYear  = today.getFullYear();

  // Başlık ve grid container
  const popup = document.createElement('div');
  popup.id        = 'calendarPopup';
  popup.className = 'toolPopup';
  popup.innerHTML = `
    <div class="cal-header">
      <button id="prevMonth" class="nav-btn">&lt;</button>
      <h3 id="calTitle"></h3>
      <button id="nextMonth" class="nav-btn">&gt;</button>
    </div>
    <div id="calGrid" class="cal-grid"></div>
  `;
  document.body.appendChild(popup);

  const titleEl = popup.querySelector('#calTitle');
  const gridEl  = popup.querySelector('#calGrid');
  const prevEl  = popup.querySelector('#prevMonth');
  const nextEl  = popup.querySelector('#nextMonth');

  // Ay ve gün isimlerini locale bazlı al
  const monthNames = Array.from({length:12}, (_,i) =>
    new Date(2000, i, 1).toLocaleString(locale, { month: 'long' })
  );
  const dayNames = Array.from({length:7}, (_,i) =>
    new Date(2020, 5, i + 7).toLocaleString(locale, { weekday: 'short' })
  );

  function renderCalendar(month, year) {
    titleEl.textContent = `${monthNames[month]} ${year}`;

    const firstDay    = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month+1, 0).getDate();

    // Gün isimleri ve hücreler
    let html = '<div class="cal-day-names">' +
      dayNames.map(d => `<div>${d}</div>`).join('') +
      '</div><div class="cal-days">';

    for (let i = 0; i < firstDay; i++) {
      html += '<div class="empty"></div>';
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const isToday = d === today.getDate() &&
                      month === today.getMonth() &&
                      year === today.getFullYear();
      html += `<div class="day${isToday ? ' today' : ''}">${d}</div>`;
    }
    html += '</div>';
    gridEl.innerHTML = html;
  }

  // Nav düğmeleri
  prevEl.addEventListener('click', () => {
    currentMonth--;
    if (currentMonth < 0) {
      currentMonth = 11;
      currentYear--;
    }
    renderCalendar(currentMonth, currentYear);
  });
  nextEl.addEventListener('click', () => {
    currentMonth++;
    if (currentMonth > 11) {
      currentMonth = 0;
      currentYear++;
    }
    renderCalendar(currentMonth, currentYear);
  });

  renderCalendar(currentMonth, currentYear);

  // Boş alana tıklayınca kapanma
  setTimeout(() => {
    function outsideClickListener(e) {
      const icon = document.getElementById('calendarIcon');
      if (!popup.contains(e.target) && e.target !== icon) {
        popup.remove();
        document.removeEventListener('click', outsideClickListener);
      }
    }
    document.addEventListener('click', outsideClickListener);
  }, 0);
}

document.addEventListener('DOMContentLoaded', () => {
  const icon = document.getElementById('calendarIcon');
  if (icon) icon.addEventListener('click', createCalendarPopup);
});

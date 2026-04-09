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
  let currentView = 'day'; // 'day', 'month', or 'year'
  let yearRangeStart = Math.floor(currentYear / 10) * 10;

  // Başlık ve grid container
  const popup = document.createElement('div');
  popup.id        = 'calendarPopup';
  popup.className = 'toolPopup';
  popup.innerHTML = `
    <div class="cal-header">
      <button id="prevMonth" class="nav-btn">&lt;</button>
      <h3 id="calTitle" style="cursor: pointer;"></h3>
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
  const monthNamesShort = Array.from({length:12}, (_,i) =>
    new Date(2000, i, 1).toLocaleString(locale, { month: 'short' })
  );
  const dayNames = Array.from({length:7}, (_,i) =>
    new Date(2020, 5, i + 7).toLocaleString(locale, { weekday: 'short' })
  );

  function renderDayView(month, year) {
    currentView = 'day';
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

  function renderMonthView(year) {
    currentView = 'month';
    titleEl.textContent = `${year}`;

    let html = '<div class="cal-months">';
    for (let i = 0; i < 12; i++) {
      const isCurrentMonth = i === today.getMonth() && year === today.getFullYear();
      html += `<div class="month-item${isCurrentMonth ? ' current' : ''}" data-month="${i}">${monthNamesShort[i]}</div>`;
    }
    html += '</div>';
    gridEl.innerHTML = html;

    // Add click handlers for months
    gridEl.querySelectorAll('.month-item').forEach(el => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        const monthIndex = parseInt(el.dataset.month);
        currentMonth = monthIndex;
        renderDayView(currentMonth, currentYear);
      });
    });
  }

  function renderYearView(rangeStart) {
    currentView = 'year';
    const rangeEnd = rangeStart + 9;
    titleEl.textContent = `${rangeStart} - ${rangeEnd}`;

    let html = '<div class="cal-years">';
    for (let i = 0; i < 10; i++) {
      const year = rangeStart + i;
      const isCurrentYear = year === today.getFullYear();
      html += `<div class="year-item${isCurrentYear ? ' current' : ''}" data-year="${year}">${year}</div>`;
    }
    html += '</div>';
    gridEl.innerHTML = html;

    // Add click handlers for years
    gridEl.querySelectorAll('.year-item').forEach(el => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        currentYear = parseInt(el.dataset.year);
        renderMonthView(currentYear);
      });
    });
  }

  // Title click handler - switch views
  titleEl.addEventListener('click', () => {
    if (currentView === 'day') {
      renderMonthView(currentYear);
    } else if (currentView === 'month') {
      yearRangeStart = Math.floor(currentYear / 10) * 10;
      renderYearView(yearRangeStart);
    }
  });

  // Nav düğmeleri
  prevEl.addEventListener('click', () => {
    if (currentView === 'day') {
      currentMonth--;
      if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
      }
      renderDayView(currentMonth, currentYear);
    } else if (currentView === 'month') {
      currentYear--;
      renderMonthView(currentYear);
    } else if (currentView === 'year') {
      yearRangeStart -= 10;
      renderYearView(yearRangeStart);
    }
  });

  nextEl.addEventListener('click', () => {
    if (currentView === 'day') {
      currentMonth++;
      if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
      }
      renderDayView(currentMonth, currentYear);
    } else if (currentView === 'month') {
      currentYear++;
      renderMonthView(currentYear);
    } else if (currentView === 'year') {
      yearRangeStart += 10;
      renderYearView(yearRangeStart);
    }
  });

  renderDayView(currentMonth, currentYear);

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

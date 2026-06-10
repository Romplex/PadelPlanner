function bookSlot(slotId) {
  fetch('/bookings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ slotId })
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        window.refreshCalendar?.();
      } else {
        alert('Buchung fehlgeschlagen');
      }
    });
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function getInitials(name) {
  const trimmed = name.trim();
  const parts = trimmed.split(/\s+/);
  
  if (parts.length >= 2) {
    // Vor- und Nachname vorhanden: Initiale von jedem
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  } else {
    // Nur ein Name: erste 2 Buchstaben
    return trimmed.substring(0, 2).toUpperCase();
  }
}

function groupSlotsByDate(slots) {
  return slots.reduce((acc, slot) => {
    if (!acc[slot.date]) acc[slot.date] = [];
    acc[slot.date].push(slot);
    return acc;
  }, {});
}

function buildDateKey(year, month, day) {
  const mm = String(month + 1).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  return `${year}-${mm}-${dd}`;
}

function getMonthLabel(year, month) {
  return new Date(year, month, 1).toLocaleDateString('de-DE', {
    month: 'long',
    year: 'numeric'
  });
}

function renderCalendar(availableDates, bookedDates, fullDates, selectedDate, currentYear, currentMonth) {
  const calendarEl = document.getElementById('calendar');
  const monthLabel = document.getElementById('calendar-month');
  monthLabel.textContent = getMonthLabel(currentYear, currentMonth);

  calendarEl.innerHTML = '';
  const firstOfMonth = new Date(currentYear, currentMonth, 1);
  const firstWeekday = (firstOfMonth.getDay() + 6) % 7;
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  for (let i = 0; i < firstWeekday; i++) {
    const empty = document.createElement('div');
    empty.className = 'calendar-cell empty';
    calendarEl.appendChild(empty);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dateKey = buildDateKey(currentYear, currentMonth, day);
    const cell = document.createElement('button');
    cell.className = 'calendar-cell';
    cell.type = 'button';
    cell.textContent = day;

    if (availableDates.has(dateKey)) {
      cell.classList.add('available-day');
      cell.addEventListener('click', () => {
        updateSelectedDate(dateKey);
      });
    } else {
      cell.classList.add('disabled-day');
      cell.disabled = true;
    }

    if (bookedDates.has(dateKey)) {
      cell.classList.add('booked-day');
    }

    if (fullDates.has(dateKey)) {
      cell.classList.add('full-day');
    }

    if (dateKey === selectedDate) {
      cell.classList.add('selected-day');
    }

    calendarEl.appendChild(cell);
  }
}

function renderSlotsForDate(date, groupedSlots) {
  const selectedDateTitle = document.getElementById('selected-date-title');
  const slotGrid = document.getElementById('slot-grid');
  const slots = groupedSlots[date] || [];

  selectedDateTitle.textContent = date
    ? new Date(date).toLocaleDateString('de-DE', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })
    : 'Kein Datum ausgewählt';

  if (!slots.length) {
    slotGrid.innerHTML = '<div class="empty-state">Für diesen Tag gibt es keine freien Slots.</div>';
    return;
  }

  slotGrid.innerHTML = slots.map(slot => {
    const isFull = slot.booking_count >= 4;
    const hasBookings = slot.booking_count > 0;
    const isBookedByUser = slot.user_booked;
    const disabled = isFull && !isBookedByUser ? 'disabled' : '';
    let className = 'slot-button available';

    if (disabled) {
      className = 'slot-button full';
    } else if (isFull) {
      className = 'slot-button fullWithMe';
    } else if (hasBookings && !isBookedByUser) {
      className = 'slot-button booked';
    } else if (hasBookings && isBookedByUser) {
      className = 'slot-button user-booked';
    }

    const tooltip = slot.booked_users
      ? `Gebucht: ${slot.booked_users}`
      : 'Noch keine Buchungen';
    const onClick = disabled ? '' : `bookSlot(${slot.id})`;

    // Avatar-Initialen
    let avatarsHtml = '';
    if (hasBookings && slot.booked_users) {
      const names = slot.booked_users.split(', ');
      avatarsHtml = '<div class="slot-avatars">' +
        names.map(name => {
          const initials = getInitials(name);
          return `<div class="slot-avatar" title="${escapeHtml(name)}">${initials}</div>`;
        }).join('') +
        '</div>';
    }

    return `
      <button
        type="button"
        class="${className}"
        title="${escapeHtml(tooltip)}"
        ${disabled}
        onclick="${onClick}">
        <div class="slot-time">${slot.start_time_formatted} - ${slot.end_time_formatted} (${slot.booking_count}/4)</div>
        ${avatarsHtml}
      </button>
    `;
  }).join('');
}

function getFirstSelectableDate(availableDates) {
  return [...availableDates].sort()[0] || null;
}

function initCalendar() {
  const slotData = window.slotData || [];
  const groupedSlots = groupSlotsByDate(slotData);
  
  // Alle möglichen Daten sammeln
  const allAvailableDates = new Set(
    slotData
      .filter(slot => slot.booking_count < 4)
      .map(slot => slot.date)
  );
  const allBookedDates = new Set(
    slotData
      .filter(slot => slot.booking_count > 0)
      .map(slot => slot.date)
  );
  const allFullDates = new Set(
    slotData
      .filter(slot => slot.booking_count >= 4)
      .map(slot => slot.date)
  );

  // Filter-State aus localStorage laden
  const activeFilters = new Set();
  const savedFilters = localStorage.getItem('activeFilters');
  if (savedFilters) {
    try {
      JSON.parse(savedFilters).forEach(f => activeFilters.add(f));
    } catch (e) {
      // Fallback falls JSON kaputt ist
    }
  }

  function applyFilters() {
    // Wenn keine Filter aktiv: ALLES anzeigen
    if (activeFilters.size === 0) {
      const filteredSlots = slotData;
      const filteredGroupedSlots = groupSlotsByDate(filteredSlots);
      const filteredAvailableDates = new Set(
        filteredSlots
          .filter(slot => slot.booking_count < 4)
          .map(slot => slot.date)
      );
      
      return {
        availableDates: filteredAvailableDates,
        bookedDates: allBookedDates,
        fullDates: allFullDates,
        groupedSlots: filteredGroupedSlots
      };
    }

    // Slots filtern basierend auf aktiven Filtern
    let filteredSlots = slotData.filter(slot => {
      const isFull = slot.booking_count >= 4;
      const hasBookings = slot.booking_count > 0 && slot.booking_count < 4;
      const isAvailable = slot.booking_count === 0;

      if (isAvailable && activeFilters.has('available')) return true;
      if (hasBookings && activeFilters.has('booked')) return true;
      if (isFull && activeFilters.has('full')) return true;
      return false;
    });

    const filteredGroupedSlots = groupSlotsByDate(filteredSlots);
    
    // Alle Tage mit gefilterten Slots sammeln (können alle sein, die diese Slots haben)
    const availableDates = new Set(filteredSlots.map(slot => slot.date));
    const bookedDates = new Set(
      filteredSlots
        .filter(slot => slot.booking_count > 0)
        .map(slot => slot.date)
    );
    const fullDates = new Set(
      filteredSlots
        .filter(slot => slot.booking_count >= 4)
        .map(slot => slot.date)
    );

    return {
      availableDates: availableDates,
      bookedDates,
      fullDates,
      groupedSlots: filteredGroupedSlots
    };
  }

  const savedDate = localStorage.getItem('selectedDate');
  const { availableDates, bookedDates, fullDates, groupedSlots: initialGroupedSlots } = applyFilters();
  
  let selectedDate = savedDate && availableDates.has(savedDate)
    ? savedDate
    : getFirstSelectableDate(availableDates);

  const activeDate = selectedDate ? new Date(selectedDate) : new Date();
  let currentYear = activeDate.getFullYear();
  let currentMonth = activeDate.getMonth();
  let currentSelectedDate = selectedDate;

  const updateCalendar = () => {
    const { availableDates: filtered, bookedDates: filtered2, fullDates: filtered3, groupedSlots: filtered4 } = applyFilters();
    
    // Wenn keine Tage verfügbar sind, deselektieren
    if (filtered.size === 0) {
      currentSelectedDate = null;
      localStorage.setItem('selectedDate', '');
    } else if (!currentSelectedDate || !filtered.has(currentSelectedDate)) {
      // Wenn kein Tag ausgewählt oder nicht in Filtern: zum ersten verfügbaren springen
      currentSelectedDate = getFirstSelectableDate(filtered);
      if (currentSelectedDate) {
        localStorage.setItem('selectedDate', currentSelectedDate);
      }
    }
    
    renderCalendar(filtered, filtered2, filtered3, currentSelectedDate, currentYear, currentMonth);
    if (currentSelectedDate) {
      renderSlotsForDate(currentSelectedDate, filtered4);
    } else {
      // Wenn kein Tag ausgewählt, zeige empty-state
      document.getElementById('selected-date-title').textContent = 'Keine buchbaren Tage gefunden';
      document.getElementById('slot-grid').innerHTML = '';
    }
  };

  window.updateSelectedDate = date => {
    currentSelectedDate = date;
    localStorage.setItem('selectedDate', date);
    updateCalendar();
  };

  window.refreshCalendar = () => {
    location.reload();
  };

  // Filter-Buttons
  document.querySelectorAll('.legend-item').forEach(btn => {
    const filter = btn.dataset.filter;
    // Visuell markieren falls Filter aktiv ist
    if (activeFilters.has(filter)) {
      btn.classList.add('active');
    }
    
    btn.addEventListener('click', () => {
      if (activeFilters.has(filter)) {
        activeFilters.delete(filter);
        btn.classList.remove('active');
      } else {
        activeFilters.add(filter);
        btn.classList.add('active');
      }
      
      // Speichern in localStorage
      localStorage.setItem('activeFilters', JSON.stringify([...activeFilters]));
      updateCalendar();
    });
  });

  document.getElementById('prev-month').addEventListener('click', () => {
    currentMonth--;
    if (currentMonth < 0) {
      currentMonth = 11;
      currentYear--;
    }
    updateCalendar();
  });

  document.getElementById('next-month').addEventListener('click', () => {
    currentMonth++;
    if (currentMonth > 11) {
      currentMonth = 0;
      currentYear++;
    }
    updateCalendar();
  });

  if (!currentSelectedDate) {
    document.getElementById('selected-date-title').textContent = 'Keine buchbaren Tage gefunden';
    document.getElementById('slot-grid').innerHTML = '';
  }

  updateCalendar();
}

window.addEventListener('DOMContentLoaded', initCalendar);
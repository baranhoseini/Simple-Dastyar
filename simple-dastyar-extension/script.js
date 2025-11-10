// ------------------------------
// 🔍 SEARCH BAR FUNCTIONALITY
// ------------------------------
document.getElementById('search-button').addEventListener('click', () => {
  const query = document.getElementById('search-input').value.trim();
  if (query) {
    const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    window.open(googleUrl, '_blank');
  }
});

// Optional: allow pressing Enter key to search too
document.getElementById('search-input').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    document.getElementById('search-button').click();
  }
});


// ------------------------------
// ⚡ QUICK ACCESS FUNCTIONALITY (Final Polished Version)
// ------------------------------
const shortcutsContainer = document.getElementById('shortcuts-container');
const addShortcutBtn = document.getElementById('add-shortcut');

let shortcuts = JSON.parse(localStorage.getItem('shortcuts')) || [
  { name: 'Google', url: 'https://www.google.com' },
  { name: 'YouTube', url: 'https://www.youtube.com' },
  { name: 'Gmail', url: 'https://mail.google.com' },
  { name: 'GitHub', url: 'https://github.com' }
];

function renderShortcuts() {
  shortcutsContainer.innerHTML = '';

  shortcuts.forEach((shortcut, index) => {
    const tile = document.createElement('div');
    tile.className = 'shortcut';
    const favicon = `https://www.google.com/s2/favicons?sz=64&domain_url=${shortcut.url}`;

    tile.innerHTML = `
      <button class="action-btn edit-btn" title="ویرایش">🪄</button>
      <button class="action-btn delete-btn" title="حذف">×</button>
      <img src="${favicon}" alt="${shortcut.name} icon">
      <span>${shortcut.name}</span>
    `;

    // open link
    tile.addEventListener('click', (e) => {
      if (e.target.classList.contains('action-btn')) return; // don't trigger link on edit/delete
      window.open(shortcut.url, '_blank');
    });

    // delete
    tile.querySelector('.delete-btn').addEventListener('click', () => {
      if (confirm(`آیا از حذف "${shortcut.name}" مطمئن هستید؟`)) {
        shortcuts.splice(index, 1);
        saveShortcuts();
        renderShortcuts();
      }
    });

    // edit
    tile.querySelector('.edit-btn').addEventListener('click', () => {
      const newName = prompt('نام جدید:', shortcut.name);
      const newUrl = prompt('آدرس جدید:', shortcut.url);
      if (newName && newUrl) {
        shortcuts[index].name = newName;
        shortcuts[index].url = newUrl;
        saveShortcuts();
        renderShortcuts();
      }
    });

    shortcutsContainer.appendChild(tile);
  });
}

function saveShortcuts() {
  localStorage.setItem('shortcuts', JSON.stringify(shortcuts));
}

addShortcutBtn.addEventListener('click', () => {
  const name = prompt('نام سایت را وارد کنید:');
  const url = prompt('آدرس سایت را وارد کنید (مثلاً https://example.com):');
  if (name && url) {
    shortcuts.push({ name, url });
    saveShortcuts();
    renderShortcuts();
  }
});

renderShortcuts();


// ------------------------------
// 📅 CALENDAR (Gregorian)
// ------------------------------
const calendarGrid = document.getElementById('calendar-grid');
const monthYear = document.getElementById('month-year');
const prevMonthBtn = document.getElementById('prev-month');
const nextMonthBtn = document.getElementById('next-month');
const todayBtn = document.getElementById('today-btn');

// Popup elements
const datePopup = document.getElementById('date-note-popup');
const popupDate = document.getElementById('popup-date');
// const dateNotesList = document.getElementById('date-notes-list');
// const addDateNoteBtn = document.getElementById('add-date-note');
// const closePopupBtn = document.getElementById('close-popup');



let currentDate = new Date();

const daysRow = document.getElementById('calendar-days');


// 🧩 Build weekday headers for each mode
function buildGregorianHeader() {
  const names = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  daysRow.innerHTML = '';
  names.forEach(n => {
    const div = document.createElement('div');
    div.textContent = n;
    daysRow.appendChild(div);
  });
}

function buildPersianHeader() {
  const namesFa = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];
  daysRow.innerHTML = '';
  namesFa.forEach(n => {
    const div = document.createElement('div');
    div.textContent = n;
    daysRow.appendChild(div);
  });
}

// 🧭 Attach Gregorian navigation (so Persian overrides don’t leak back)
function attachGregorianNav() {
  prevMonthBtn.onclick = () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar(currentDate);
  };
  nextMonthBtn.onclick = () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar(currentDate);
  };
  todayBtn.onclick = () => {
    currentDate = new Date();
    renderCalendar(currentDate);
  };
}


function renderCalendar(date) {
  buildGregorianHeader(); // ensure EN header & Sun-first alignment in Gregorian

  calendarGrid.innerHTML = '';

  const year = date.getFullYear();
  const month = date.getMonth();

  // month names
  const monthNames = [
    'ژانویه', 'فوریه', 'مارس', 'آوریل', 'مه', 'ژوئن',
    'ژوئیه', 'اوت', 'سپتامبر', 'اکتبر', 'نوامبر', 'دسامبر'
  ];
  monthYear.textContent = `${monthNames[month]} ${year}`;

  // start of month
  const firstDay = new Date(year, month, 1);
  const startDay = firstDay.getDay(); // 0 = Sun ... 6 = Sat

  // number of days in month
  const lastDay = new Date(year, month + 1, 0);
  const totalDays = lastDay.getDate();

  // previous month padding
  const prevLastDay = new Date(year, month, 0).getDate();

  // notes (for indicator)
  const notes = JSON.parse(localStorage.getItem('notes')) || [];

  // fill calendar
  const totalCells = startDay + totalDays;
  const nextDays = 7 - (totalCells % 7);
  const today = new Date();

  // previous month's days (grayed out)
  for (let i = startDay; i > 0; i--) {
    const div = document.createElement('div');
    div.className = 'day other-month';
    div.textContent = prevLastDay - i + 1;
    calendarGrid.appendChild(div);
  }

  // current month's days
  for (let day = 1; day <= totalDays; day++) {
    const div = document.createElement('div');
    div.className = 'day';
    div.textContent = day;
    
    // highlight today
    if (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    ) {
      div.classList.add('today');
    }

    // mark days that have notes (if note.date matches this day)
    if (notes.some(n => {
      const noteDate = new Date(n.date);
      return (
        noteDate.getDate() === day &&
        noteDate.getMonth() === month &&
        noteDate.getFullYear() === year
      );
    })) {
      div.classList.add('has-note');
    }

    calendarGrid.appendChild(div);
  }

  // next month's days (grayed out)
  if (nextDays < 7) {
    for (let i = 1; i <= nextDays; i++) {
      const div = document.createElement('div');
      div.className = 'day other-month';
      div.textContent = i;
      calendarGrid.appendChild(div);
    }
  }
  attachGregorianNav();   // ensure Gregorian prev/next/today handlers are active

  calendarGrid.classList.add('fade-in');
  setTimeout(() => calendarGrid.classList.remove('fade-in'), 1000);
}


// 🆕 Persian Calendar Mode
const calendarModeCheckbox = document.getElementById('calendar-mode');
const calendarModeLabel = document.getElementById('calendar-mode-label');

let isPersian = false;

let jalaliContext = { jYear: null, jMonth: null };

// 🟦 helper: convert Persian digits to English
function persianToEnglishDigits(str) {
  return str.replace(/[۰-۹]/g, ch => '۰۱۲۳۴۵۶۷۸۹'.indexOf(ch)).replace(/[^\d]/g,'');
}

// 🟦 helper: convert English digits to Persian
function convertToPersianDigits(num) {
  return num.toString().replace(/[0-9]/g, d => '۰۱۲۳۴۵۶۷۸۹'[d]);
}

calendarModeCheckbox.addEventListener('change', () => {
  isPersian = calendarModeCheckbox.checked;
  calendarModeLabel.textContent = isPersian ? 'تقویم شمسی' : 'تقویم میلادی';

  if (isPersian) {
    renderPersianCalendar(currentDate);
  } else {
    renderCalendar(currentDate);
  }
});


// Convert between Gregorian <-> Jalali using jalaali-js
// ==========================================================
// 🆕 Persian Calendar Renderer — Fully Localized & Synced
// ==========================================================
function renderPersianCalendar(date) {
  calendarGrid.innerHTML = '';

  // Convert base Gregorian date to Jalali
  const gYear = date.getFullYear();
  const gMonth = date.getMonth() + 1;
  const gDay = date.getDate();
  const jDate = jalaali.toJalaali(gYear, gMonth, gDay);

  let jYear = jDate.jy;
  let jMonth = jDate.jm;
  jalaliContext.jYear = jYear;
  jalaliContext.jMonth = jMonth;

  const monthNamesFa = [
    'فروردین', 'اردیبهشت', 'خرداد', 'تیر',
    'مرداد', 'شهریور', 'مهر', 'آبان',
    'آذر', 'دی', 'بهمن', 'اسفند'
  ];
  monthYear.textContent = `${monthNamesFa[jMonth - 1]} ${convertToPersianDigits(jYear)}`;

  
  buildPersianHeader();


  // 🟩 Determine Jalali month layout
  const jFirst = jalaali.toGregorian(jYear, jMonth, 1);
  const gFirstDow = new Date(jFirst.gy, jFirst.gm - 1, jFirst.gd).getDay(); // 0=Sun...6=Sat
  const startDay = (gFirstDow + 1) % 7; // Sat-first grid
  const totalDays = jalaali.jalaaliMonthLength(jYear, jMonth);

  // Padding for previous month
  for (let i = 0; i < startDay; i++) {
    const div = document.createElement('div');
    div.className = 'day other-month';
    calendarGrid.appendChild(div);
  }

  const notes = JSON.parse(localStorage.getItem('notes')) || [];
  const todayG = new Date();
  const todayJ = jalaali.toJalaali(todayG.getFullYear(), todayG.getMonth() + 1, todayG.getDate());

  // 🟩 Render all days
  for (let day = 1; day <= totalDays; day++) {
    const div = document.createElement('div');
    div.className = 'day';
    div.textContent = convertToPersianDigits(day);

    // highlight today
    if (day === todayJ.jd && jMonth === todayJ.jm && jYear === todayJ.jy) {
      div.classList.add('today');
    }

    // mark notes
    if (notes.some(n => {
      const nDate = new Date(n.date);
      const nJ = jalaali.toJalaali(nDate.getFullYear(), nDate.getMonth() + 1, nDate.getDate());
      return nJ.jd === day && nJ.jm === jMonth && nJ.jy === jYear;
    })) {
      div.classList.add('has-note');
    }

    calendarGrid.appendChild(div);
  }

  // fill remaining cells
  const cells = calendarGrid.children.length;
  const remainder = cells % 7;
  if (remainder !== 0) {
    for (let i = 0; i < 7 - remainder; i++) {
      const div = document.createElement('div');
      div.className = 'day other-month';
      calendarGrid.appendChild(div);
    }
  }

  // animation
  calendarGrid.classList.add('fade-in');
  setTimeout(() => calendarGrid.classList.remove('fade-in'), 1000);

  // 🟩 month navigation
  prevMonthBtn.onclick = () => {
    if (jMonth === 1) { jMonth = 12; jYear--; } else jMonth--;
    const g = jalaali.toGregorian(jYear, jMonth, 1);
    currentDate = new Date(g.gy, g.gm - 1, g.gd);
    renderPersianCalendar(currentDate);
  };
  nextMonthBtn.onclick = () => {
    if (jMonth === 12) { jMonth = 1; jYear++; } else jMonth++;
    const g = jalaali.toGregorian(jYear, jMonth, 1);
    currentDate = new Date(g.gy, g.gm - 1, g.gd);
    renderPersianCalendar(currentDate);
  };
  todayBtn.onclick = () => {
    currentDate = new Date();
    renderPersianCalendar(currentDate);
  };
}





// // navigation
// prevMonthBtn.addEventListener('click', () => {
//   currentDate.setMonth(currentDate.getMonth() - 1);
//   renderCalendar(currentDate);
// });

// nextMonthBtn.addEventListener('click', () => {
//   currentDate.setMonth(currentDate.getMonth() + 1);
//   renderCalendar(currentDate);
// });

// todayBtn.addEventListener('click', () => {
//   currentDate = new Date();
//   renderCalendar(currentDate);
// });

renderCalendar(currentDate);


// ------------------------------
// 📝 NOTES SECTION
// ------------------------------
const notesList = document.getElementById('notes-list');
const addNoteBtn = document.getElementById('add-note');

let notes = JSON.parse(localStorage.getItem('notes')) || [];

// Function to render notes
function renderNotes() {
  notesList.innerHTML = '';
  if (notes.length === 0) {
    notesList.innerHTML = '<p style="color:#888;">هیچ یادداشتی وجود ندارد.</p>';
    // ✨ Add fade-in effect when notes refresh
    notesList.classList.add('fade-in');
    setTimeout(() => notesList.classList.remove('fade-in'), 1000);

    return;
  }

  notes.forEach((note, index) => {
    const div = document.createElement('div');
    div.className = 'note';
    div.innerHTML = `
      <div class="note-actions">
        <button class="edit-note" title="ویرایش">🪄</button>
        <button class="delete-note" title="حذف">×</button>
      </div>
      <div class="note-title">${note.title}</div>
      <div class="note-content">${note.content}</div>
    `;

    // Delete note
    div.querySelector('.delete-note').addEventListener('click', () => {
      if (confirm(`آیا از حذف "${note.title}" مطمئن هستید؟`)) {
        notes.splice(index, 1);
        saveNotes();
        renderNotes();
        renderCalendar(currentDate); 
      }
    });

    // Edit note
    div.querySelector('.edit-note').addEventListener('click', () => {
      const newTitle = prompt('عنوان جدید:', note.title);
      const newContent = prompt('متن جدید:', note.content);
      if (newTitle && newContent) {
        notes[index].title = newTitle;
        notes[index].content = newContent;
        saveNotes();
        renderNotes();
        renderCalendar(currentDate);
      }
    });

    notesList.appendChild(div);
  });
}

// Function to save notes
function saveNotes() {
  localStorage.setItem('notes', JSON.stringify(notes));
}

// Add a new note
addNoteBtn.addEventListener('click', () => {
  const title = prompt('عنوان یادداشت:');
  const content = prompt('متن یادداشت:');
  if (title && content) {
    const newNote = {
      title,
      content,
      date: new Date().toISOString() // for future calendar linking
    };
    notes.push(newNote);
    saveNotes();
    renderNotes();
    renderCalendar(currentDate);
  }
});

// Initial render
renderNotes();


// ======================================================
// 📅 DATE-SPECIFIC NOTES POPUP (FINAL WORKING VERSION)
// ======================================================

// 🟦 Create popup dynamically if it's not in the HTML
if (!document.getElementById('date-note-popup')) {
  const popupHtml = `
    <div id="date-note-popup" style="
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.25);
      padding: 20px;
      width: 320px;
      max-height: 80vh;
      overflow-y: auto;
      z-index: 9999;
      display: none;
      text-align: right;
    ">
      <h3 id="popup-date" style="color:#245b9b; margin-bottom:10px;"></h3>
      <div id="date-notes-list" style="margin-bottom:15px;"></div>
      <button id="add-date-note" style="
        background-color:#4a90e2;
        color:white;
        border:none;
        border-radius:8px;
        padding:6px 12px;
        cursor:pointer;
      ">➕ افزودن یادداشت</button>
      <button id="close-popup" style="
        background-color:#ccc;
        color:black;
        border:none;
        border-radius:8px;
        padding:6px 12px;
        margin-top:10px;
        cursor:pointer;
      ">بستن</button>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', popupHtml);
}

// 🟦 References (some already exist)
const popup = document.getElementById('date-note-popup');
const popupDateTitle = document.getElementById('popup-date');
const dateNotesList = document.getElementById('date-notes-list');
const addDateNoteBtn = document.getElementById('add-date-note');
const closePopupBtn = document.getElementById('close-popup');

let selectedDate = null;

// 🟨 Listen for clicks on calendar days
calendarGrid.addEventListener('click', (e) => {
  if (!e.target.classList.contains('day') || e.target.classList.contains('other-month')) return;

  // Works for Persian or English digits
  const raw = e.target.textContent.trim();
  const dayNum = Number(persianToEnglishDigits(raw) || raw);
  let year, month, day;

  if (isPersian) {
    // convert Jalali → Gregorian
    const g = jalaali.toGregorian(jalaliContext.jYear, jalaliContext.jMonth, dayNum);
    year = g.gy; month = g.gm; day = g.gd;
  } else {
    year = currentDate.getFullYear();
    month = currentDate.getMonth() + 1;
    day = dayNum;
  }

  selectedDate = new Date(year, month - 1, day);

  popupDateTitle.textContent = isPersian
    ? `یادداشت‌های ${convertToPersianDigits(dayNum)} / ${convertToPersianDigits(jalaliContext.jMonth)} / ${convertToPersianDigits(jalaliContext.jYear)}`
    : `یادداشت‌های ${day} / ${month} / ${year}`;

  popup.style.display = 'block';
  renderDateNotes();
});


// 🟨 Close popup
closePopupBtn.addEventListener('click', () => {
  popup.style.display = 'none';
});

// 🟨 Add a new note for the selected date
addDateNoteBtn.addEventListener('click', () => {
  if (!selectedDate) return;
  const title = prompt('عنوان یادداشت:');
  const content = prompt('متن یادداشت:');
  if (title && content) {
    const allNotes = JSON.parse(localStorage.getItem('notes')) || [];
    allNotes.push({
      title,
      content,
      date: selectedDate.toISOString()
    });
    localStorage.setItem('notes', JSON.stringify(allNotes));

    // 🔹 Sync global notes and refresh
    notes = allNotes;
    renderDateNotes();
    renderNotes();
    renderCalendar(currentDate);
  }
});


// 🟨 Render notes for the selected date
function renderDateNotes() {
  const allNotes = JSON.parse(localStorage.getItem('notes')) || [];
  const dayNotes = allNotes.filter(n => {
    const d = new Date(n.date);
    
    return (
      d.getDate() === selectedDate.getDate() &&
      d.getMonth() === selectedDate.getMonth() &&
      d.getFullYear() === selectedDate.getFullYear()
    );
  });

  dateNotesList.innerHTML = '';
  dateNotesList.classList.add('fade-in');
  setTimeout(() => dateNotesList.classList.remove('fade-in'), 1000);
  if (dayNotes.length === 0) {
    dateNotesList.innerHTML = '<p style="color:#888;">هیچ یادداشتی برای این روز وجود ندارد.</p>';
    return;
  }

  dayNotes.forEach(note => {
    const div = document.createElement('div');
    div.className = 'note';
    div.style.marginBottom = '10px';
    div.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <strong>${note.title}</strong>
        <div>
          <button class="edit-date-note" style="margin-left:5px;">🪄</button>
          <button class="delete-date-note">×</button>
        </div>
      </div>
      <div style="font-size:0.9rem; margin-top:4px;">${note.content}</div>
    `;

    // Edit note
    div.querySelector('.edit-date-note').addEventListener('click', () => {
      const newTitle = prompt('عنوان جدید:', note.title);
      const newContent = prompt('متن جدید:', note.content);
      if (newTitle && newContent) {
        note.title = newTitle;
        note.content = newContent;
        localStorage.setItem('notes', JSON.stringify(allNotes));
        notes = allNotes;
        renderDateNotes();
        renderNotes();
        renderCalendar(currentDate);
      }
    });

    // Delete note
    div.querySelector('.delete-date-note').addEventListener('click', () => {
      if (confirm(`آیا از حذف "${note.title}" مطمئن هستید؟`)) {
        const idx = allNotes.indexOf(note);
        allNotes.splice(idx, 1);
        localStorage.setItem('notes', JSON.stringify(allNotes));
        notes = allNotes;
        renderDateNotes();
        renderNotes();
        renderCalendar(currentDate);
      }
    });

    dateNotesList.appendChild(div);
  });
}

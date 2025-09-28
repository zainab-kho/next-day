window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('minimizeBtn')?.addEventListener('click', () => {
    window.electron.minimizeApp();
  });

  document.getElementById('closeBtn')?.addEventListener('click', () => {
    window.electron.closeApp();
  });
});

// DOM references
const restDays = document.querySelector('#restDaysInput');
const themeBoxes = document.querySelectorAll('.themes div');
const themeError = document.getElementById('themeError');
const dateInput = document.querySelector('#startDateInput');
const dateError = document.getElementById('dateError');
const countOptions = document.querySelectorAll('.countOptions div');
const submitBtn = document.querySelector('#submitBtn');
const savedUser = JSON.parse(localStorage.getItem('userData'));

const today = new Date();
today.setHours(0, 0, 0, 0);

const month = String(today.getMonth() + 1).padStart(2, '0'); // months are 0-indexed
const day = String(today.getDate()).padStart(2, '0');
const year = today.getFullYear();

const formatted = `${month}/${day}/${year}`;
dateInput.value = formatted;

let user = {
  startDate: '',
  restDays: '',
  theme: '',
  countOption: '',
};

let dateInputTyped = false;
let selectedTheme = null;
let selectedCount = null;

function updateWindowIcons(themeClass) {
  const minIcon = document.getElementById('minimizeIcon');
  const closeIcon = document.getElementById('closeIcon');

  if (!minIcon || !closeIcon) {
    return;
  }

  const themeName = themeClass.replace('-theme', ''); // "pink-theme" → "pink"
  minIcon.src = `assets/${themeName}-min.png`;
  closeIcon.src = `assets/${themeName}-close.png`;
}

function clearThemes() {
  document.documentElement.classList.remove(
    'default',
    'turqoise-theme',
    'yellow-theme',
    'green-theme',
    'pink-theme',
    'purple-theme'
  );
}

// THEME PREVIEW HANDLER
themeBoxes.forEach(box => {
  box.addEventListener('click', () => {
    themeBoxes.forEach(b => b.classList.remove('selected-theme'));
    box.classList.add('selected-theme');

    const rawTheme = [...box.classList].find(cls => cls.startsWith('theme-'));
    selectedTheme = rawTheme.replace('theme-', '') + '-theme';

    clearThemes();
    document.documentElement.classList.add(selectedTheme); // sets class on <html>
    updateWindowIcons(selectedTheme);
    themeError.style.visibility = 'hidden';
  });
});

function validateInputs() {
  let isValid = true;
  const datePattern = /^\d{2}\/\d{2}\/\d{4}$/;
  const userStartDate = dateInput.value;

  if (!datePattern.test(userStartDate)) {
    dateError.style.visibility = 'visible';
    dateInput.style.border = '2px solid var(--error)';
    dateError.textContent = 'please enter a valid date';
    isValid = false;
  } else {
    const [month, day, year] = userStartDate.split('/');
    const enteredDate = new Date(Number(year), Number(month) - 1, Number(day));
    enteredDate.setHours(0, 0, 0, 0);

    const [endMonth, endDay, endYear] = (savedUser?.endDate || '').split('/');
    const savedEnd = new Date(`${endYear}-${endMonth}-${endDay}`);
    savedEnd.setHours(0, 0, 0, 0);

    if (enteredDate.getTime() < today.getTime() || enteredDate.getTime() > savedEnd.getTime()) {
      dateInput.style.border = '2px solid var(--error)';
      dateError.style.visibility = 'visible';
      dateError.textContent = 'enter date within your goal range';
      return false;
    } else {
      dateInput.style.border = '1.5px solid var(--border)';
      dateError.style.visibility = 'hidden';
      user.startDate = userStartDate;
    }
  }

  return isValid;
}

// COUNT OPTION SELECTION
countOptions.forEach(option => {
  option.addEventListener('click', () => {
    countOptions.forEach(o => o.classList.remove('selected-count'));
    option.classList.add('selected-count');
    selectedCount = option.classList.contains('countdown') ? 'countdown' : 'countup';
  });
});

// DATE INPUT BEHAVIOR
dateInput.addEventListener('focus', () => {
  dateInputTyped = true;
});

dateInput.addEventListener('blur', () => {
  if (dateInputTyped && dateInput.value.trim() === '') {
    dateInput.style.border = '2px solid var(--error)';
  } else {
    validateInputs();
  }
});

// SUBMIT HANDLER
submitBtn.addEventListener('click', () => {
  let restDayInput = restDays.value.trim();
  let valid = validateInputs();

  if (!selectedTheme) {
    themeError.style.visibility = 'visible';
    selectedTheme = 'default';
    document.body.classList.add('default');
    valid = false;
  } else {
    user.theme = selectedTheme;
  }

  if (!selectedCount) {
    user.selectedCount = 'countdown';
  } else {
    user.countOption = selectedCount;
  }

  if (!valid) return;

  if (!restDayInput) {
    user.restDays = 0;
  } else {
    user.restDays = restDayInput;
  }

  const existingUser = JSON.parse(localStorage.getItem('userData'));
  const fullUser = { ...existingUser, ...user };
  localStorage.setItem('userData', JSON.stringify(fullUser));

  location.href = 'counter-page.html';
});

document.querySelector('#cancelBtn').addEventListener('click', () => {
  localStorage.clear();
  location.href = 'index.html';
});

window.electron?.send?.('ready-to-show-ui');
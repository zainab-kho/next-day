window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('minimizeBtn')?.addEventListener('click', () => {
    window.electron.minimizeApp();
  });

  document.getElementById('closeBtn')?.addEventListener('click', () => {
    window.electron.closeApp();
  });

  window.electron?.send?.('ready-to-show-ui');
});

const savedUser = JSON.parse(localStorage.getItem('userData'));
if (savedUser && savedUser.name && savedUser.endDate && savedUser.startDate && savedUser.theme) {
  location.href = 'counter-page.html';
}

const dateInput = document.querySelector('#dateInput');
const titleInput = document.querySelector('#titleInput');
const goalsContainer = document.querySelector('.goalsContainer');
const goalRow = document.querySelector('.goalRow');
const submitBtn = document.querySelector('#submitBtn')
const today = new Date();
today.setHours(0, 0, 0, 0);

let user = {
  name: '',
  goals: [],
  startDate: '',
  endDate: '',
};

let dateInputTyped = false;
let titleInputTyped = false;

// functions

function validateInputs() {
  let isValid = true;
  const datePattern = /^\d{2}\/\d{2}\/\d{4}$/;
  const userEndDate = dateInput.value;

  if (!datePattern.test(userEndDate)) {
    dateError.style.visibility = 'visible';
    dateInput.style.border = '2px solid var(--error)';
    dateError.textContent = 'please enter a valid date';
    isValid = false;
  } else {
    const [month, day, year] = userEndDate.split('/');
    const enteredDate = new Date(Number(year), Number(month) - 1, Number(day)); // month is 0-indexed
    enteredDate.setHours(0, 0, 0, 0);

    if (enteredDate <= today) {
      dateInput.style.border = '2px solid var(--error)';
      dateError.style.visibility = 'visible';
      dateError.textContent = 'please enter a valid future date';
      return false;
    }

    dateError.textContent = '';
    dateInput.style.border = '1.5px solid var(--border)';
  }

  return true;
}

function createNewGoal() {
  const newRow = document.createElement('div');
  newRow.className = 'goalRow';

  const realCheckbox = document.createElement('div');
  realCheckbox.className = 'checkbox';

  const realInput = document.createElement('input');
  realInput.type = 'text';
  realInput.className = 'goalInput';

  newRow.appendChild(realCheckbox);
  newRow.appendChild(realInput);
  goalsContainer.appendChild(newRow);

  // focus on new goal
  realInput.focus();

  return realInput;
}

function createGhostRow() {
  const inputs = goalsContainer.querySelectorAll('.goalInput');
  const firstValue = inputs[0]?.value.trim();
  const ghostExists = goalsContainer.querySelector('.ghostRow');

  if (!firstValue || ghostExists) return;

  const ghostRow = document.createElement('div');
  ghostRow.className = 'goalRow ghostRow';

  const checkbox = document.createElement('div');
  checkbox.className = 'checkbox';

  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'goalInput';
  input.placeholder = 'new goal';
  input.readOnly = true;

  ghostRow.appendChild(checkbox);
  ghostRow.appendChild(input);
  goalsContainer.appendChild(ghostRow);

  // convert ghost to real row on click
  ghostRow.addEventListener('click', () => {
    const allInputs = goalsContainer.querySelectorAll('.goalInput');
    const ghostIndex = [...goalsContainer.children].indexOf(ghostRow);
    const previousInput = allInputs[ghostIndex - 1];

    if (!previousInput || previousInput.value.trim() === '') {
      // do nothing if the goal above is empty
      return;
    }

    ghostRow.remove();

    // create real row
    createNewGoal();
  });
}

// event listeners

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

titleInput.addEventListener('focus', () => {
  titleInputTyped = true;
})

titleInput.addEventListener('blur', () => {
  if (titleInputTyped && titleInput.value.trim() === '') {
    titleInput.style.border = '2px solid var(--error)';
    titleError.style.visibility = 'visible';
  } else {
    titleInput.style.border = '1.5px solid var(--border)';
    titleError.style.visibility = 'hidden';
  }
})

goalsContainer.addEventListener('keydown', (e) => {
  if (!e.target.classList.contains('goalInput')) return;

  const inputValue = e.target.value.trim();
  const checkboxes = document.querySelectorAll('.checkbox');

  checkboxes.forEach(box => {
    box.style.border = '1.5px solid var(--border)';
  })

  if (e.key === 'Enter' && inputValue !== '') {
    if (inputValue === '') return;

    createNewGoal();
  }

  // delete checkbox if user presses enter again
  if (e.key === 'Enter' && inputValue === '') {
    const row = e.target.closest('.goalRow');
    const allInputs = [...document.querySelectorAll('.goalInput')];

    if (allInputs.length > 1) {
      const index = allInputs.indexOf(e.target);
      row.remove();
    }
  }

  // delete goalRow if user presses backspace on a null row
  if (e.key === 'Backspace' && inputValue === '') {
    e.preventDefault(); // stop backspace from deleting in the new input

    const row = e.target.closest('.goalRow');
    const allInputs = [...document.querySelectorAll('.goalInput')];

    if (allInputs.length > 1) {
      const index = allInputs.indexOf(e.target);
      row.remove();

      // focus on previous input if it exists
      if (index > 0) {
        allInputs[index - 1].focus();
      }
    }
  }
})

// show ghost on mouse enter
goalsContainer.addEventListener('mouseenter', () => {
  createGhostRow();
});

// fully remove ghost on leave
goalsContainer.addEventListener('mouseleave', () => {
  const ghost = goalsContainer.querySelector('.ghostRow');
  if (ghost) ghost.remove();
});

// remove ghost if user focuses on a real input
goalsContainer.addEventListener('focusin', (e) => {
  if (e.target.classList.contains('goalInput')) {
    const ghost = goalsContainer.querySelector('.ghostRow');
    if (ghost) ghost.remove();
  }
});

submitBtn.addEventListener('click', () => {

  const userEndDate = dateInput.value.trim();
  let validEndDate = validateInputs();
  const userTitle = titleInput.value.trim();
  const goalInputs = document.querySelectorAll('.goalInput');
  const checkboxes = document.querySelectorAll('.checkbox');

  let valid = true;

  if (!validEndDate) {
    dateInput.style.border = '2px solid var(--error)';
    dateError.style.visibility = 'visible';
    valid = false;
  }

  if (!userTitle) {
    titleInput.style.border = '2px solid var(--error)';
    titleError.style.visibility = 'visible';
    valid = false;
  }

  const goals = [...goalInputs].some(input => input.value.trim() !== '');
  if (!goals) {
    checkboxes.forEach(box => {
      box.style.border = '2px solid var(--error)';
    });
    valid = false;
  } else {
    checkboxes.forEach(box => {
      box.style.border = '1.5px solid var(--border)';
    })
  }

  if (!valid) return;

  user.name = userTitle;
  user.endDate = userEndDate;
  user.goals = [];

  goalInputs.forEach(goal => {
    const val = goal.value.trim();
    if (val !== '') user.goals.push(val);
  });

  localStorage.setItem('userData', JSON.stringify(user));

  window.location.href='extra-info.html';
})



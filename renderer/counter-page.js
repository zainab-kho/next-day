// grab user and check/reset daily
const user = JSON.parse(localStorage.getItem('userData'));
const todayStr = new Date().toLocaleDateString();

if (user?.lastCheckedDate !== todayStr) {
    user.checkedGoals = [];
    user.lastCheckedDate = todayStr;

    // reset rest state for new day
    user.isResting = false;

    localStorage.setItem('userData', JSON.stringify(user));
}

const userRef = { current: user };
const savedTheme = user?.theme || 'default';
document.body.classList.add(savedTheme);
updateWindowIcons(savedTheme);

let checkedGoals = user.checkedGoals || [];

// DOM elements
const goalName = document.querySelector('.goalName');
const titleCounter = document.querySelector('.counterTitle h2');
const goalsContainer = document.querySelector('.goalsList');
const progressBar = document.querySelector('.progress-fill');
const progressText = document.querySelector('.progress-text');
const refreshBtn = document.querySelector('#refreshBtn');
const hiddenContent = document.querySelector('.hiddenContent');
const restDayBtn = document.querySelector('.rest-btn');
const Alert = document.querySelector('.alert');

// window controls
window.addEventListener('DOMContentLoaded', () => {
    document.getElementById('minimizeBtn')?.addEventListener('click', () => {
        window.electron.minimizeApp();
    });

    document.getElementById('closeBtn')?.addEventListener('click', () => {
        window.electron.closeApp();
    });
});

function updateWindowIcons(themeClass) {
    const minIcon = document.getElementById('minimizeIcon');
    const closeIcon = document.getElementById('closeIcon');

    if (!minIcon || !closeIcon) return;

    const themeName = themeClass.replace('-theme', '');
    minIcon.src = `assets/${themeName}-min.png`;
    closeIcon.src = `assets/${themeName}-close.png`;
}

// function to get the amount of days left based on user choices
function daysLeft() {
    // get todays date and set hours to 0
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // get start and end date from users inputs
    const start = new Date(userRef.current.startDate);
    const end = new Date(userRef.current.endDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    // minutes from start
    const msFromStart = today - start;
    const msToEnd = end - today;

    // convert minutes to days
    const upDayCount = Math.floor(msFromStart / (1000 * 60 * 60 * 24));
    const downDayCount = Math.ceil(msToEnd / (1000 * 60 * 60 * 24));

    const isComplete = today >= end;
    const isNotStarted = today < start;

    if (isComplete) return 'complete - great job!';
    if (isNotStarted) {
        const daysUntilStart = Math.ceil((start - today) / (1000 * 60 * 60 * 24));
        return `starts in ${daysUntilStart} day${daysUntilStart === 1 ? '' : 's'}`;
    }

    return userRef.current.countOption === 'countup'
    ? `day ${upDayCount + 1}`
    : downDayCount === 1
        ? `${downDayCount} day left`
        : `${downDayCount} days left`;
}

function getDaysRemaining() {
    const result = daysLeft();

    if (typeof result === 'string') {
        const match = result.match(/\d+/);
        return match ? parseInt(match[0]) : 0;
    }

    return 0;
}

function updateProgress() {
    const total = userRef.current.goals.length;
    const checked = checkedGoals.length;
    const percent = total ? Math.round((checked / total) * 100) : 0;

    if (progressBar) progressBar.style.width = `${percent}%`;
    if (progressText) progressText.textContent = `${percent}%`;
}

function renderGoals() {
    goalsContainer.innerHTML = '';

    userRef.current.goals.forEach((goal, index) => {
        const row = document.createElement('div');
        row.className = 'counterGoalRow';

        const box = document.createElement('div');
        box.className = 'goalBox';
        if (checkedGoals.includes(index)) {
            box.classList.add('goalBoxChecked');
            box.innerHTML = '&#10003;';
        } else {
            box.innerHTML = '';
        }

        const text = document.createElement('p');
        text.className = 'goalText';
        text.textContent = goal;
        if (checkedGoals.includes(index)) text.classList.add('goalTextChecked');

        row.appendChild(box);
        row.appendChild(text);

        row.addEventListener('click', () => {
            if (checkedGoals.includes(index)) {
                checkedGoals = checkedGoals.filter(i => i !== index);
            } else {
                checkedGoals.push(index);
            }

            localStorage.setItem('userData', JSON.stringify({
                ...userRef.current,
                checkedGoals,
                lastCheckedDate: todayStr
            }));

            renderGoals();
            updateProgress();
        });

        goalsContainer.appendChild(row);
    });
}

function checkRestDay() {
    const restDays = Number(userRef.current.restDays);

    if (restDays === 0) {
        restDayBtn.style.visibility = 'hidden';
    } else {
        restDayBtn.style.visibility = 'visible';
    }
}

function updateView() {
    const dayText = daysLeft();
    const name = userRef.current.name;
    goalName.textContent = name;

    if (userRef.current.isResting) {
        titleCounter.textContent = 'resting today...';
        hiddenContent.style.display = 'none';
        return;
    }

    titleCounter.textContent = dayText;

    if (dayText === 'complete - great job!' || dayText.startsWith('starts in')) {
        hiddenContent.style.display = 'none';
    } else {
        hiddenContent.style.display = 'block';
    }

    renderGoals();
    checkRestDay();
    updateProgress();
}

// refresh button
refreshBtn.addEventListener('click', () => {
    const status = daysLeft();
    const isDone = status.includes('complete');
    const notStarted = status.includes('starts in');

    if (!isDone && !notStarted) {
        const isCountUp = userRef.current.countOption === 'countup';
        const upDays = getDaysRemaining();

        // get days left no matter what mode we're in
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const endDate = new Date(userRef.current.endDate);
        endDate.setHours(0, 0, 0, 0);
        const msToEnd = endDate - today;
        const daysLeft = Math.ceil(msToEnd / (1000 * 60 * 60 * 24));

        let message;

        if (isCountUp && upDays === 0) {
            message = `you just started!<br>are you sure you want to restart?`;
        } else {
            message = `you still have ${daysLeft} day${daysLeft === 1 ? '' : 's'} left.<br>are you sure you want to restart?`;
        }

        document.querySelector('.alert-message').innerHTML = message;
        Alert.style.visibility = 'visible';

        document.querySelector('.yes-btn').addEventListener('click', () => {
            localStorage.clear();
            location.href = 'index.html';
        });

        document.querySelector('.no-btn').addEventListener('click', () => {
            Alert.style.visibility = 'hidden';
        });

        return; // stop the reset if alert was shown
    }

    // if it's done or hasn't started, just reset immediately
    localStorage.clear();
    location.href = 'index.html';
});

// rest day click
restDayBtn.addEventListener('click', () => {
    const remaining = Number(userRef.current.restDays);

    if (remaining > 0) {
        document.querySelector('.alert-message').innerHTML = `
        you have ${remaining} rest day${remaining === 1 ? '' : 's'} left.
        <br>are you sure?
        `;
        Alert.style.visibility = 'visible';

        document.querySelector('.yes-btn').addEventListener('click', () => {
            userRef.current.isResting = true;
            userRef.current.lastRestDate = todayStr;
            userRef.current.restDays = remaining - 1;

            localStorage.setItem('userData', JSON.stringify(userRef.current));

            titleCounter.textContent = 'resting today...';
            Alert.style.visibility = 'hidden';
            hiddenContent.style.display = 'none';

            checkRestDay(); // make sure button hides if no days left
        });

        document.querySelector('.no-btn').addEventListener('click', () => {
            Alert.style.visibility = 'hidden';
        });
    }
});

// initial load
updateView();
window.electron?.send?.('ready-to-show-ui');
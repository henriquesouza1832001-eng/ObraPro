const screens = [...document.querySelectorAll('[data-screen]')];
const progress = document.querySelector('[data-app-progress]');
const progressLabels = document.querySelectorAll('[data-progress-label]');

function showScreen(target) {
    const screen = screens.find((candidate) => candidate.dataset.screen === target);

    if (!screen) {
        return;
    }

    screens.forEach((candidate) => candidate.classList.toggle('is-active', candidate === screen));

    const step = Number(screen.dataset.step || 1);
    const percentage = Math.round((step / 5) * 100);

    if (progress) {
        progress.style.width = `${percentage}%`;
    }

    progressLabels.forEach((label) => {
        label.textContent = `Etapa ${step} de 5`;
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

document.addEventListener('click', (event) => {
    const trigger = event.target.closest('[data-go]');

    if (trigger) {
        showScreen(trigger.dataset.go);
    }
});

const checklist = [...document.querySelectorAll('[data-check-item]')];
const checklistCount = document.querySelector('[data-check-count]');
const finishButton = document.querySelector('[data-finish]');

function updateChecklist() {
    const checked = checklist.filter((item) => item.checked).length;

    if (checklistCount) {
        checklistCount.textContent = `${checked} de ${checklist.length} conferidos`;
    }

    if (finishButton) {
        finishButton.disabled = checked !== checklist.length;
    }
}

checklist.forEach((item) => item.addEventListener('change', updateChecklist));
updateChecklist();

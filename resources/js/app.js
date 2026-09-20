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

document.querySelectorAll('[data-screen="home"] .grid button').forEach((button) => {
    button.dataset.go = 'category';
});

function showDemoFeedback(message) {
    let feedback = document.querySelector('[data-demo-feedback]');

    if (!feedback) {
        feedback = document.createElement('div');
        feedback.dataset.demoFeedback = '';
        feedback.className = 'demo-feedback';
        document.body.append(feedback);
    }

    feedback.textContent = message;
    window.clearTimeout(feedback.timeout);
    feedback.timeout = window.setTimeout(() => feedback.remove(), 3000);
}

document.addEventListener('click', (event) => {
    const trigger = event.target.closest('button');

    if (!trigger || trigger.dataset.go || trigger.dataset.dashboardGo || trigger.dataset.checkItem || trigger.dataset.finish !== undefined) {
        return;
    }

    if (trigger.getAttribute('aria-label')?.includes('vídeo')) {
        showDemoFeedback('Vídeo demonstrativo pronto para a próxima etapa.');
        return;
    }

    showDemoFeedback('Esta ação está preparada para a próxima versão do seu ambiente.');
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

const dashboardViews = [...document.querySelectorAll('[data-dashboard-view]')];

function showDashboardView(target) {
    if (!dashboardViews.length) return;

    dashboardViews.forEach((view) => view.classList.toggle('hidden', view.dataset.dashboardView !== target));
    document.querySelectorAll('[data-dashboard-go]').forEach((button) => {
        const isActive = button.dataset.dashboardGo === target;
        button.classList.toggle('bg-white/10', isActive);
        button.classList.toggle('font-bold', isActive);
        button.classList.toggle('text-slate-300', !isActive);
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

document.addEventListener('click', (event) => {
    const trigger = event.target.closest('[data-dashboard-go]');
    if (trigger) showDashboardView(trigger.dataset.dashboardGo);
});

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => navigator.serviceWorker.register('/service-worker.js'));
}

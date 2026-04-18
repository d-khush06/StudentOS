// Smooth scroll to sections
function scrollToSection(sectionId) {
    const target = document.getElementById(sectionId);
    if (!target) return;
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Greeting based on time
function setGreeting() {
    const hour = new Date().getHours();
    const greetingElement = document.getElementById('greeting-text');
    if(!greetingElement) return;
    
    let greeting = "Good Evening";
    if (hour < 12) greeting = "Good Morning";
    else if (hour < 18) greeting = "Good Afternoon";

    greetingElement.innerText = `${greeting}, Khush,`;
}

// Set current date
function setDate() {
    const dateElement = document.getElementById('current-date');
    if(!dateElement) return;
    const options = { weekday: 'long', month: 'short', day: 'numeric' };
    dateElement.innerText = new Date().toLocaleDateString('en-US', options);
}

// Mobile Menu Toggle Logic
function initMobileMenu() {
    const openBtn = document.getElementById('open-menu');
    const closeBtn = document.getElementById('close-menu');
    const sidebar = document.getElementById('sidebar');

    if(openBtn && closeBtn && sidebar) {
        openBtn.addEventListener('click', () => sidebar.classList.remove('hidden'));
        closeBtn.addEventListener('click', () => sidebar.classList.add('hidden'));
    }
}

// Theme Toggle Logic matched to new CSS
function initThemeToggle() {
    const toggle = document.getElementById('theme-toggle');
    if (!toggle) return;

    const stored = localStorage.getItem('studentos-theme');
    if (stored === 'light') {
        document.body.classList.add('theme-light');
    }

    toggle.addEventListener('click', () => {
        document.body.classList.toggle('theme-light');
        const mode = document.body.classList.contains('theme-light') ? 'light' : 'dark';
        localStorage.setItem('studentos-theme', mode);
    });
}

// Pomodoro Logic
function initPomodoro() {
    const ring = document.getElementById('pomodoro-ring');
    const timeEl = document.getElementById('pomodoro-time');
    const labelEl = document.getElementById('pomodoro-label');
    const toggleBtn = document.getElementById('pomodoro-toggle');
    const resetBtn = document.getElementById('pomodoro-reset');
    const presetDeep = document.getElementById('preset-deep');
    const presetSprint = document.getElementById('preset-sprint');
    const breakEl = document.getElementById('pomodoro-break');
    const focusInput = document.getElementById('pomodoro-focus-input');
    const breakInput = document.getElementById('pomodoro-break-input');
    const applyBtn = document.getElementById('pomodoro-apply');
    const focusZone = document.getElementById('focus-zone');

    if (!ring || !timeEl) return;
    const ringRadius = Number(ring.getAttribute('r') || 60);
    const ringLength = Math.round(2 * Math.PI * ringRadius);
    let timerId = null;
    let isRunning = false;
    let isBreak = false;

    const presets = {
        deep: { focus: 50 * 60, rest: 10 * 60, label: 'Deep Work Block' },
        sprint: { focus: 25 * 60, rest: 5 * 60, label: 'Sprint Focus' },
        custom: { focus: 50 * 60, rest: 10 * 60, label: 'Custom Focus' }
    };
    let activePreset = 'deep';
    let remaining = presets[activePreset].focus;

    function pad(num) { return String(num).padStart(2, '0'); }

    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${pad(minutes)}:${pad(secs)}`;
    }

    function updateRing() {
        const total = isBreak ? presets[activePreset].rest : presets[activePreset].focus;
        const progress = 1 - remaining / total;
        const offset = ringLength * progress;
        ring.style.strokeDasharray = String(ringLength);
        ring.style.strokeDashoffset = String(offset);
    }

    function updateUI() {
        timeEl.textContent = formatTime(remaining);
        labelEl.textContent = isBreak ? 'Recharge Break' : presets[activePreset].label;
        breakEl.textContent = `${Math.floor(presets[activePreset].rest / 60)} min`;
        updateRing();
    }

    function tick() {
        if (remaining > 0) {
            remaining -= 1;
            updateUI();
            return;
        }
        isBreak = !isBreak;
        remaining = isBreak ? presets[activePreset].rest : presets[activePreset].focus;
        updateUI();

        if (isBreak) {
            exitFullscreen();
        }
    }

    function requestFullscreen() {
        if (!focusZone || document.fullscreenElement) return;
        if (focusZone.requestFullscreen) {
            focusZone.requestFullscreen().catch(() => {});
        }
    }

    function exitFullscreen() {
        if (!document.fullscreenElement) return;
        if (document.exitFullscreen) {
            document.exitFullscreen().catch(() => {});
        }
    }

    function startTimer() {
        if (timerId) return;
        timerId = setInterval(tick, 1000);
        isRunning = true;
        toggleBtn.textContent = 'Pause';
        if (!isBreak) {
            requestFullscreen();
        }
    }

    function pauseTimer() {
        clearInterval(timerId);
        timerId = null;
        isRunning = false;
        toggleBtn.textContent = 'Start Focus';
    }

    function resetTimer() {
        pauseTimer();
        isBreak = false;
        remaining = presets[activePreset].focus;
        updateUI();
    }

    function setPreset(name) {
        activePreset = name;
        
        // Handle UI toggle styling for active preset
        if (name === 'deep') {
            presetDeep.className = 'flex-1 py-3 rounded-xl bg-dynamic text-white text-sm font-bold shadow-lg';
            presetSprint.className = 'flex-1 py-3 rounded-xl border border-dynamic text-[var(--text-primary)] text-sm font-bold hover:bg-[var(--border-color)] transition';
        } else if (name === 'sprint') {
            presetSprint.className = 'flex-1 py-3 rounded-xl bg-dynamic text-white text-sm font-bold shadow-lg';
            presetDeep.className = 'flex-1 py-3 rounded-xl border border-dynamic text-[var(--text-primary)] text-sm font-bold hover:bg-[var(--border-color)] transition';
        }
        if (name === 'custom' && focusInput && breakInput) {
            presetDeep.className = 'flex-1 py-3 rounded-xl border border-dynamic text-[var(--text-primary)] text-sm font-bold hover:bg-[var(--border-color)] transition';
            presetSprint.className = 'flex-1 py-3 rounded-xl border border-dynamic text-[var(--text-primary)] text-sm font-bold hover:bg-[var(--border-color)] transition';
        }
        resetTimer();
    }

    function applyCustomTimes() {
        if (!focusInput || !breakInput) return;
        const focusMinutes = Math.max(5, Math.min(120, Number(focusInput.value) || 50));
        const breakMinutes = Math.max(3, Math.min(30, Number(breakInput.value) || 10));
        presets.custom.focus = focusMinutes * 60;
        presets.custom.rest = breakMinutes * 60;
        activePreset = 'custom';
        remaining = presets.custom.focus;
        isBreak = false;
        updateUI();
    }

    toggleBtn.addEventListener('click', () => (isRunning ? pauseTimer() : startTimer()));
    resetBtn.addEventListener('click', resetTimer);
    presetDeep.addEventListener('click', () => setPreset('deep'));
    presetSprint.addEventListener('click', () => setPreset('sprint'));
    if (applyBtn) applyBtn.addEventListener('click', applyCustomTimes);

    updateUI();
}

function initTasks() {
    const listEl = document.getElementById('task-list');
    const countEl = document.getElementById('task-count');
    const addBtn = document.getElementById('task-add');
    const titleInput = document.getElementById('task-title');
    const categoryInput = document.getElementById('task-category');
    const priorityInput = document.getElementById('task-priority');
    const statusInput = document.getElementById('task-status');
    const dueInput = document.getElementById('task-due');
    const categoryDisplay = document.getElementById('task-category-display');
    const completedTotalEl = document.getElementById('tasks-completed-total');
    const majorAlert = document.getElementById('major-priority-alert');
    const majorText = document.getElementById('major-priority-text');

    if (!listEl || !countEl || !addBtn || !titleInput || !categoryInput || !priorityInput || !dueInput) {
        return;
    }

    let nextId = 6;
    const tasks = [
        { id: 1, title: 'Finish Lab 4 write-up (AVL rotations)', category: 'lab', priority: 'high', status: 'in-progress', due: '2026-04-19' },
        { id: 2, title: 'Submit Compiler Design assignment #3', category: 'assignment', priority: 'medium', status: 'todo', due: '2026-04-20' },
        { id: 3, title: 'Refactor auth flow for Cybersecurity demo', category: 'project', priority: 'high', status: 'todo', due: '2026-04-18' },
        { id: 4, title: 'Read Lab Manual: UART interrupts', category: 'lab', priority: 'low', status: 'todo', due: '2026-04-21' },
        { id: 5, title: 'Prepare quiz notes: Binary trees', category: 'assignment', priority: 'medium', status: 'done', due: '2026-04-22' }
    ];

    function badgeText(category) {
        if (category === 'lab') return 'Lab Manual';
        if (category === 'project') return 'Project';
        return 'Assignment';
    }

    function updateCategoryDisplay() {
        if (!categoryDisplay) return;
        categoryDisplay.textContent = badgeText(categoryInput.value);
    }

    function priorityColor(priority) {
        if (priority === 'major') return 'text-purple-500';
        if (priority === 'high') return 'text-red-500';
        if (priority === 'medium') return 'text-amber-500';
        return 'text-emerald-500';
    }

    function statusLabel(status) {
        if (status === 'done') return 'Completed';
        if (status === 'in-progress') return 'In Progress';
        return 'To Do';
    }

    function renderTasks() {
        listEl.innerHTML = '';
        tasks.forEach(task => {
            const row = document.createElement('div');
            row.className = 'task-row flex flex-wrap items-center justify-between gap-3 border border-slate-200/70 rounded-xl px-4 py-3';
            const isDone = task.status === 'done';
            row.innerHTML = `
                <div class="task-main flex-1 min-w-[220px]">
                    <div class="text-primary font-semibold ${isDone ? 'line-through opacity-60' : ''}">${task.title}</div>
                    <div class="text-sm text-secondary ${isDone ? 'line-through opacity-60' : ''}">Due ${task.due} • ${badgeText(task.category)}</div>
                </div>
                <div class="task-actions flex items-center gap-3">
                    <span class="text-xs ${priorityColor(task.priority)} font-semibold">${task.priority.toUpperCase()}</span>
                    <span class="text-xs text-dynamic font-semibold">${statusLabel(task.status)}</span>
                    <button data-action="toggle" data-id="${task.id}" class="px-3 py-1 rounded-lg border border-slate-200/70 text-xs text-primary">${task.status === 'done' ? 'Undo' : 'Mark Done'}</button>
                    <button data-action="delete" data-id="${task.id}" class="px-3 py-1 rounded-lg border border-slate-200/70 text-xs text-secondary">Remove</button>
                </div>
            `;
            listEl.appendChild(row);
        });
        const completed = tasks.filter(task => task.status === 'done').length;
        countEl.textContent = String(tasks.filter(task => task.status !== 'done').length);
        if (completedTotalEl) {
            completedTotalEl.textContent = `${completed}/${tasks.length}`;
        }

        if (majorAlert && majorText) {
            const majorTask = tasks.find(task => task.priority === 'major' && task.status !== 'done');
            if (majorTask) {
                majorText.textContent = `${majorTask.title} • Due ${majorTask.due}`;
                majorAlert.classList.remove('hidden');
            } else {
                majorAlert.classList.add('hidden');
                majorText.textContent = '';
            }
        }
    }

    addBtn.addEventListener('click', () => {
        const title = titleInput.value.trim();
        if (!title) return;
        const newTask = {
            id: nextId++,
            title,
            category: categoryInput.value,
            priority: priorityInput.value,
            status: statusInput ? statusInput.value : 'todo',
            due: dueInput.value || '2026-04-25'
        };
        tasks.unshift(newTask);
        titleInput.value = '';
        renderTasks();
    });

    categoryInput.addEventListener('change', updateCategoryDisplay);

    listEl.addEventListener('click', event => {
        const target = event.target;
        if (!(target instanceof HTMLElement)) return;
        const id = Number(target.dataset.id);
        if (target.dataset.action === 'delete') {
            const index = tasks.findIndex(task => task.id === id);
            if (index >= 0) tasks.splice(index, 1);
            renderTasks();
        }
        if (target.dataset.action === 'toggle') {
            const task = tasks.find(item => item.id === id);
            if (task) task.status = task.status === 'done' ? 'todo' : 'done';
            renderTasks();
        }
    });

    renderTasks();
    updateCategoryDisplay();
}

function initSchedulePlanner() {
    const listEl = document.getElementById('schedule-list');
    const addBtn = document.getElementById('schedule-add');
    const timeInput = document.getElementById('schedule-time');
    const titleInput = document.getElementById('schedule-title');
    const notesInput = document.getElementById('schedule-notes');
    const typeInput = document.getElementById('schedule-type');

    if (!listEl || !addBtn || !timeInput || !titleInput || !notesInput || !typeInput) {
        return;
    }

    let nextId = 6;
    const entries = [
        { id: 1, time: '08:00', title: 'Morning review', notes: 'Revise lab manual + pack dev kit', type: 'Prep' },
        { id: 2, time: '09:00', title: 'Computer Architecture', notes: 'Room 206 • Pipeline hazards', type: 'Class' },
        { id: 3, time: '11:30', title: 'Data Structures', notes: 'Room 402 • AVL rotations', type: 'Class' },
        { id: 4, time: '14:00', title: 'Embedded Systems Lab', notes: 'Lab 3 • UART debugging', type: 'Lab' },
        { id: 5, time: '16:15', title: 'AI Seminar', notes: 'Auditorium • LLM safety', type: 'Talk' }
    ];

    function sortEntries() {
        entries.sort((a, b) => a.time.localeCompare(b.time));
    }

    function renderSchedule() {
        sortEntries();
        listEl.innerHTML = '';
        entries.forEach(item => {
            const row = document.createElement('div');
            row.className = 'schedule-row flex items-center gap-4';
            row.innerHTML = `
                <span class="text-sm font-mono text-secondary w-20">${item.time}</span>
                <div class="flex-1 border-l border-slate-200 pl-4">
                    <div class="font-semibold text-primary">${item.title}</div>
                    <div class="text-sm text-secondary">${item.notes}</div>
                </div>
                <div class="flex items-center gap-3">
                    <span class="text-xs text-dynamic font-semibold">${item.type}</span>
                    <button data-action="delete" data-id="${item.id}" class="px-3 py-1 rounded-lg border border-slate-200/70 text-xs text-secondary">Remove</button>
                </div>
            `;
            listEl.appendChild(row);
        });
    }

    addBtn.addEventListener('click', () => {
        const time = timeInput.value;
        const title = titleInput.value.trim();
        if (!time || !title) return;
        const notes = notesInput.value.trim() || '—';
        const type = typeInput.value;
        entries.push({ id: nextId++, time, title, notes, type });
        timeInput.value = '';
        titleInput.value = '';
        notesInput.value = '';
        renderSchedule();
    });

    listEl.addEventListener('click', event => {
        const target = event.target;
        if (!(target instanceof HTMLElement)) return;
        if (target.dataset.action !== 'delete') return;
        const id = Number(target.dataset.id);
        const index = entries.findIndex(item => item.id === id);
        if (index >= 0) {
            entries.splice(index, 1);
            renderSchedule();
        }
    });

    renderSchedule();
}

function initStudyAnalytics() {
    const studyChart = document.getElementById('study-chart');
    const densityChart = document.getElementById('density-chart');
    const rangeButtons = document.querySelectorAll('.range-btn');
    const exportBtn = document.getElementById('export-pdf');

    if (!studyChart || !densityChart) return;

    const dataSets = {
        week: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            subjects: [
                { name: 'DSA', color: '#a855f7', values: [2, 1.5, 2.5, 1.5, 2, 0.5, 1] },
                { name: 'Arch', color: '#facc15', values: [1, 2, 1, 1, 0.5, 0.5, 0] },
                { name: 'Cyber', color: '#38bdf8', values: [1.5, 1, 1, 2, 1.5, 0.5, 0.5] }
            ],
            density: [5, 4, 6, 5, 4, 3, 2]
        },
        last7: {
            labels: ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
            subjects: [
                { name: 'DSA', color: '#a855f7', values: [1, 0.5, 2, 2.5, 1.5, 2, 2] },
                { name: 'Arch', color: '#facc15', values: [0.5, 0.5, 1, 1, 1.5, 1, 0.5] },
                { name: 'Cyber', color: '#38bdf8', values: [1, 0, 1.5, 1, 1, 2, 1.5] }
            ],
            density: [3, 2, 5, 6, 4, 5, 4]
        },
        month: {
            labels: ['W1', 'W2', 'W3', 'W4'],
            subjects: [
                { name: 'DSA', color: '#a855f7', values: [8, 9, 7, 10] },
                { name: 'Arch', color: '#facc15', values: [5, 4, 6, 5] },
                { name: 'Cyber', color: '#38bdf8', values: [6, 7, 5, 6] }
            ],
            density: [18, 20, 16, 22]
        }
    };

    function renderStackedChart(target, data, max = 8) {
        target.innerHTML = '';
        data.labels.forEach((label, idx) => {
            const wrapper = document.createElement('div');
            wrapper.className = 'chart-bar';

            const stack = document.createElement('div');
            stack.className = 'chart-stack';

            data.subjects.forEach(subject => {
                const seg = document.createElement('div');
                const value = subject.values[idx] || 0;
                seg.className = 'chart-seg';
                seg.style.height = `${(value / max) * 140}px`;
                seg.style.background = subject.color;
                stack.appendChild(seg);
            });

            const labelEl = document.createElement('div');
            labelEl.className = 'chart-label';
            labelEl.textContent = label;

            wrapper.appendChild(stack);
            wrapper.appendChild(labelEl);
            target.appendChild(wrapper);
        });
    }

    function renderDensityChart(target, labels, values) {
        target.innerHTML = '';
        const max = Math.max(...values, 1);
        labels.forEach((label, idx) => {
            const wrapper = document.createElement('div');
            wrapper.className = 'chart-bar';

            const stack = document.createElement('div');
            stack.className = 'chart-stack';

            const seg = document.createElement('div');
            const value = values[idx] || 0;
            seg.className = 'chart-seg';
            seg.style.height = `${(value / max) * 140}px`;
            seg.style.background = 'rgba(168, 85, 247, 0.5)';
            stack.appendChild(seg);

            const labelEl = document.createElement('div');
            labelEl.className = 'chart-label';
            labelEl.textContent = label;

            wrapper.appendChild(stack);
            wrapper.appendChild(labelEl);
            target.appendChild(wrapper);
        });
    }

    function setActiveRange(range) {
        const data = dataSets[range];
        if (!data) return;

        rangeButtons.forEach(btn => {
            const isActive = btn.dataset.range === range;
            btn.classList.toggle('bg-dynamic', isActive);
            btn.classList.toggle('text-white', isActive);
            btn.classList.toggle('border', !isActive);
        });

        const max = range === 'month' ? 14 : 8;
        renderStackedChart(studyChart, data, max);
        renderDensityChart(densityChart, data.labels, data.density);
    }

    rangeButtons.forEach(btn => {
        btn.addEventListener('click', () => setActiveRange(btn.dataset.range));
    });

    function exportCustomPdf() {
        const studySection = document.getElementById('study-analytics');
        const gradesSection = document.getElementById('academic-tracker');
        const scheduleSection = document.getElementById('daily-schedule');
        const wellnessSection = document.getElementById('health-tracker');
        const quickStatsSection = document.getElementById('quick-stats');
        if (!studySection || !gradesSection || !window.html2canvas || !window.jspdf) return;

        const wrapper = document.createElement('div');
        wrapper.style.position = 'fixed';
        wrapper.style.left = '-9999px';
        wrapper.style.top = '0';
        wrapper.style.width = '1000px';
        wrapper.style.background = '#ffffff';
        wrapper.style.padding = '24px';
        wrapper.style.fontFamily = 'Inter, sans-serif';

        const studyClone = studySection.cloneNode(true);
        const gradesClone = gradesSection.cloneNode(true);
        if (quickStatsSection) {
            wrapper.appendChild(quickStatsSection.cloneNode(true));
        }
        if (scheduleSection) {
            wrapper.appendChild(scheduleSection.cloneNode(true));
        }
        if (wellnessSection) {
            wrapper.appendChild(wellnessSection.cloneNode(true));
        }
        wrapper.appendChild(studyClone);
        wrapper.appendChild(gradesClone);
        document.body.appendChild(wrapper);

        window.html2canvas(wrapper, { scale: 2 }).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new window.jspdf.jsPDF('p', 'pt', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = pdfWidth;
            const imgHeight = canvas.height * imgWidth / canvas.width;

            let heightLeft = imgHeight;
            let position = 0;
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pdfHeight;

            while (heightLeft > 0) {
                position -= pdfHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pdfHeight;
            }

            pdf.save('studentos-report.pdf');
            document.body.removeChild(wrapper);
        }).catch(() => {
            document.body.removeChild(wrapper);
        });
    }

    if (exportBtn) {
        exportBtn.addEventListener('click', exportCustomPdf);
    }

    setActiveRange('week');
}

// Initialize functions on load
window.onload = () => {
    setGreeting();
    setDate();
    initMobileMenu();
    initThemeToggle();
    initPomodoro();
    initTasks();
    initSchedulePlanner();
    initStudyAnalytics();
};
// ========================
// Quotes Rotation
// ========================
const quotes = [
    "Discipline equals freedom.",
    "Consistency beats intensity.",
    "Focus on progress, not perfection.",
    "Small daily improvements lead to big results.",
    "Your habits define your success."
];

const quoteElement = document.getElementById("daily-quote");

function setRandomQuote() {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    quoteElement.textContent = `"${quotes[randomIndex]}"`; // Add quotes for styling
}

// Rotate quote every 24 hours (or reload for now)
setRandomQuote();

// ========================
// Hero Slider Logic
// ========================
const slides = document.querySelectorAll('.slide');
let currentSlide = 0;
const slideInterval = 5000; // 5 seconds

function nextSlide() {
    slides[currentSlide].classList.remove('active');
    currentSlide = (currentSlide + 1) % slides.length;
    slides[currentSlide].classList.add('active');
}

setInterval(nextSlide, slideInterval);

// ========================
// Sidebar Logic
// ========================
const menuBtn = document.getElementById('menu-btn');
const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebar-overlay');
const closeSidebarBtn = document.getElementById('close-sidebar-btn');

function openSidebar() {
    sidebar.classList.add('active');
    sidebarOverlay.classList.add('active');
}

function closeSidebar() {
    sidebar.classList.remove('active');
    sidebarOverlay.classList.remove('active');
}

menuBtn.addEventListener('click', openSidebar);
closeSidebarBtn.addEventListener('click', closeSidebar);
sidebarOverlay.addEventListener('click', closeSidebar);

// Close sidebar when a link is clicked
document.querySelectorAll('.sidebar-links a').forEach(link => {
    link.addEventListener('click', closeSidebar);
});

// ========================
// Settings Modal Logic
// ========================
const settingsBtn = document.getElementById('settings-btn');
const settingsModal = document.getElementById('settings-modal');
const closeModalBtn = document.querySelector('.close-modal');
const tabBtns = document.querySelectorAll('.tab-btn');
const panels = document.querySelectorAll('.panel');

// Open Settings
settingsBtn.addEventListener('click', () => {
    closeSidebar(); // Close sidebar first if open
    settingsModal.classList.add('active');
});

// Close Settings
closeModalBtn.addEventListener('click', () => {
    settingsModal.classList.remove('active');
});

// Tab Switching
tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Remove active class from all
        tabBtns.forEach(b => b.classList.remove('active'));
        panels.forEach(p => p.classList.remove('active'));

        // Add active class to clicked
        btn.classList.add('active');
        const tabName = btn.getAttribute('data-tab');
        document.getElementById(tabName).classList.add('active');
    });
});

// ========================
// Sample Learning Data
// ========================
// ========================
// Sample Learning Data (Initialized Empty)
// ========================
const dailyData = {
    labels: [],
    datasets: [{
        label: "Hours Today",
        data: [],
        backgroundColor: [],
        borderRadius: 4,
        barThickness: 20
    }]
};

const weeklyData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [{
        label: "Hours per day",
        data: [0, 0, 0, 0, 0, 0, 0],
        borderColor: "#4f8cff",
        backgroundColor: "rgba(79, 140, 255, 0.2)",
        fill: true,
        tension: 0.3
    }]
};

const monthlyData = {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
    datasets: [{
        label: "Cumulative Hours",
        data: [0, 0, 0, 0],
        borderColor: "#22c55e",
        backgroundColor: "rgba(34, 197, 94, 0.2)",
        fill: true,
        tension: 0.3
    }]
};

// ========================
// Data Exports (CSV & PDF)
// ========================
function exportCSV() {
    let csv = "Date,Skill/Category,Hours,Type,Notes\n";
    appData.skills.forEach(log => {
        csv += `${new Date(log.date).toLocaleDateString()},${log.skill},${log.hours},${log.focusSession ? 'Deep Work' : 'General'},"${log.notes || ''}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `prime_dashboard_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showNotification("Export Complete", "CSV file has been downloaded.");
}

async function exportPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text("Prime Dashboard - Productivity Report", 14, 22);
    doc.setFontSize(11);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);

    const tableData = appData.skills.map(log => [
        new Date(log.date).toLocaleDateString(),
        log.skill,
        log.hours.toFixed(1) + "h",
        log.focusSession ? 'Deep Work' : 'General',
        log.notes || '-'
    ]);

    doc.autoTable({
        startY: 40,
        head: [['Date', 'Skill/Category', 'Hours', 'Type', 'Notes']],
        body: tableData,
    });

    doc.save(`prime_productivity_report_${new Date().toISOString().split('T')[0]}.pdf`);
    showNotification("Export Complete", "PDF report has been generated.");
}

document.getElementById('export-csv-btn').addEventListener('click', exportCSV);
document.getElementById('export-pdf-btn').addEventListener('click', exportPDF);

// ========================
// Task Management Logic
// ========================
const taskForm = document.getElementById('task-manager-form');
const taskMgmtList = document.getElementById('task-mgmt-list');
const taskParentSelect = document.getElementById('task-parent-select');

if (taskForm) {
    taskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const parent = taskParentSelect.value;
        const name = document.getElementById('task-name-input').value.trim();
        const priority = document.getElementById('task-priority').value;

        appData.tasks.push({ id: Date.now(), parent, name, priority, completed: false });
        saveData();
        renderTasks();
        renderWork();
        renderClasses();
        taskForm.reset();
    });
}

function renderTasks() {
    if (!taskMgmtList) return;
    taskMgmtList.innerHTML = '';
    appData.tasks.forEach(task => {
        const div = document.createElement('div');
        div.className = 'list-item';
        div.innerHTML = `
            <div style="flex: 1;">
                <input type="checkbox" ${task.completed ? 'checked' : ''} onchange="toggleTask(${task.id})">
                <strong style="${task.completed ? 'text-decoration: line-through; opacity: 0.6;' : ''}">${task.name}</strong>
                <small>${task.parent} | ${task.priority}</small>
            </div>
            <button onclick="deleteTask(${task.id})" style="background:none; color:#ef4444;">&times;</button>
        `;
        taskMgmtList.appendChild(div);
    });
}

window.toggleTask = (id) => {
    const task = appData.tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        saveData();
        renderTasks();
        renderWork();
        renderClasses();
        updateUserRank();
    }
};

window.deleteTask = (id) => {
    appData.tasks = appData.tasks.filter(t => t.id !== id);
    saveData();
    renderTasks();
    renderWork();
    renderClasses();
};

function updateTaskParentDropdown() {
    if (!taskParentSelect) return;
    taskParentSelect.innerHTML = '<option value="" disabled selected>Select Class/Work</option>';
    [...appData.classes, ...appData.work].forEach(item => {
        const opt = document.createElement('option');
        opt.value = item.name;
        opt.textContent = item.name;
        taskParentSelect.appendChild(opt);
    });
}

// ========================
// Deep Insights (Heatmap & Correlations)
// ========================
function renderHeatmap() {
    const grid = document.getElementById('activity-heatmap');
    if (!grid) return;
    grid.innerHTML = '';

    const data = AI_Engine.generateHeatmapData(appData.skills);
    data.forEach(day => {
        const cell = document.createElement('div');
        cell.className = `heatmap-cell level-${day.level}`;
        cell.title = `${day.date}: ${day.hours.toFixed(1)}h`;
        grid.appendChild(cell);
    });
}

function renderCorrelations() {
    const container = document.getElementById('correlation-results');
    if (!container) return;
    container.innerHTML = '';

    const findings = AI_Engine.analyzeCorrelations(appData);
    findings.forEach(pattern => {
        const p = document.createElement('p');
        p.innerHTML = pattern;
        container.appendChild(p);
    });
}

// ========================
// Focus Buddies (PeerJS)
// ========================
let peer;
const buddies = new Set();

function initBuddies() {
    peer = new Peer();

    peer.on('open', (id) => {
        console.log('My Peer ID:', id);
        // Show ID in settings or buddy panel for sharing
        const addBtn = document.getElementById('add-buddy-btn');
        if (addBtn) addBtn.title = `Your ID: ${id} (Click to copy)`;
    });

    peer.on('connection', (conn) => {
        setupConnection(conn);
    });
}

function setupConnection(conn) {
    conn.on('open', () => {
        buddies.add(conn);
        conn.send({ type: 'status', status: 'online', name: 'Fellow Focus' });
        updateBuddyUI();
    });

    conn.on('data', (data) => {
        if (data.type === 'status') {
            updateBuddyStatusUI(conn.peer, data);
        }
    });
}

function updateBuddyUI() {
    const list = document.getElementById('buddy-list');
    if (!list) return;
    list.innerHTML = '';
    buddies.forEach(conn => {
        const item = document.createElement('div');
        item.className = 'buddy-item';
        item.id = `buddy-${conn.peer}`;
        item.innerHTML = `
            <span class="buddy-status online"></span>
            <span>Peer: ${conn.peer.substring(0, 6)}</span>
        `;
        list.appendChild(item);
    });
}

function updateBuddyStatusUI(peerId, data) {
    const item = document.getElementById(`buddy-${peerId}`);
    if (item) {
        const statusDot = item.querySelector('.buddy-status');
        statusDot.className = `buddy-status ${data.status}`;
    }
}

document.getElementById('add-buddy-btn').addEventListener('click', () => {
    const id = prompt("Enter Peer ID of your buddy:");
    if (id) {
        const conn = peer.connect(id);
        setupConnection(conn);
    }
});

// ========================
// Cloud Sync & Privacy
// ========================
const syncPassInput = document.getElementById('sync-passphrase');
const cloudToggle = document.getElementById('toggle-cloud-sync');
const cloudControls = document.getElementById('cloud-controls');

if (cloudToggle) {
    cloudToggle.addEventListener('change', (e) => {
        cloudControls.style.display = e.target.checked ? 'block' : 'none';
        appData.settings.cloudSync = e.target.checked;
        saveData();
    });
}

function encryptData(data, pass) {
    return CryptoJS.AES.encrypt(JSON.stringify(data), pass).toString();
}

function decryptData(ciphertext, pass) {
    const bytes = CryptoJS.AES.decrypt(ciphertext, pass);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
}

async function syncToCloud() {
    const pass = syncPassInput.value;
    if (!pass) return alert("Enter passphrase for encryption!");

    const encrypted = encryptData(appData, pass);
    showNotification("Syncing...", "Encryption active. Sending to cloud.");

    // Placeholder for actual Firebase call
    console.log("Encrypted Payload:", encrypted);
    setTimeout(() => {
        showNotification("Cloud Synced", "Backup successful.");
    }, 1500);
}

document.getElementById('sync-now-btn').addEventListener('click', syncToCloud);

// ========================
// Gamification / Ranking
// ========================
function updateUserRank() {
    const totalHours = appData.skills.reduce((sum, s) => sum + s.hours, 0);
    const completedTasks = appData.tasks.filter(t => t.completed).length;

    // Level formula: floor(sqrt(hours * 5 + tasks * 2))
    const level = Math.floor(Math.sqrt(totalHours * 5 + completedTasks * 2)) + 1;

    const rankDisplay = document.getElementById('user-rank-display');
    if (rankDisplay) {
        const rankTitles = ["Novice Learner", "Consistent Grind", "Flow Master", "Deep Work Pro", "Architect of Mind", "Unstoppable"];
        const titleIdx = Math.min(Math.floor(level / 5), rankTitles.length - 1);

        rankDisplay.innerHTML = `
            <span class="rank-badge">Level ${level}</span>
            <span class="rank-title">${rankTitles[titleIdx]}</span>
        `;

        updateHallOfFame(totalHours, completedTasks);
    }
}

function updateHallOfFame(hours, tasks) {
    const badgesGrid = document.querySelector('.badges-grid');
    if (!badgesGrid) return;

    const badges = badgesGrid.querySelectorAll('.badge');
    if (badges.length >= 3) {
        if (hours >= 10) badges[0].classList.remove('locked');
        // Simple streak check on first work item for demo
        const firstWork = appData.work[0];
        if (firstWork && calculateStreak(firstWork.name) >= 7) badges[1].classList.remove('locked');
        const focusSessions = appData.skills.filter(s => s.focusSession).length;
        if (focusSessions >= 10) badges[2].classList.remove('locked');
    }
}

// ========================
// Initialize Charts
// ========================
Chart.defaults.color = '#7DA0CA'; // Mid-bright text
Chart.defaults.font.family = "'Inter', sans-serif";
Chart.defaults.scale.grid.color = 'rgba(125, 160, 202, 0.05)';
Chart.defaults.plugins.tooltip.backgroundColor = 'rgba(2, 16, 36, 0.9)';
Chart.defaults.plugins.tooltip.titleColor = '#C1E8FF';
Chart.defaults.plugins.tooltip.bodyColor = '#C1E8FF';
Chart.defaults.plugins.tooltip.borderColor = 'rgba(125, 160, 202, 0.3)';
Chart.defaults.plugins.tooltip.borderWidth = 1;

const dailyChart = new Chart(
    document.getElementById('dailyChart'),
    {
        type: 'bar',
        data: dailyData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                title: { display: true, text: 'Daily Focus', padding: { bottom: 20 } }
            },
            scales: {
                y: { beginAtZero: true, grid: { display: false } },
                x: { grid: { display: false } }
            }
        }
    }
);

const weeklyChart = new Chart(
    document.getElementById('weeklyChart'),
    {
        type: 'line',
        data: weeklyData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                title: { display: true, text: 'Weekly Trend', padding: { bottom: 20 } }
            },
            scales: {
                y: { grid: { color: 'rgba(125, 160, 202, 0.05)' } },
                x: { grid: { display: false } }
            }
        }
    }
);

const monthlyChart = new Chart(
    document.getElementById('monthlyChart'),
    {
        type: 'line',
        data: monthlyData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                title: { display: true, text: 'Monthly Progress', padding: { bottom: 20 } }
            },
            scales: {
                y: { grid: { color: 'rgba(125, 160, 202, 0.05)' } },
                x: { grid: { display: false } }
            }
        }
    }
);

// ========================
// Data Management (LocalStorage)
// ========================
const STORAGE_KEY = 'dashboard_data_v1';

let appData = {
    timetable: [],
    exams: [],
    skills: [],
    classes: [],
    work: [],
    tasks: [],
    settings: {
        theme: 'premium',
        customBg: null,
        notifications: true,
        predictive: true,
        deepWork: true,
        pomoWorkTime: 25,
        pomoBreakTime: 5
    }
};

// Pomodoro State
let pomoTimer = null;
let pomoTimeRemaining = 25 * 60;
let isPomoRunning = false;
let isPomoWorkSession = true; // true = Work, false = Break
let pomoSessionStartTime = null;

// ========================
// Pomodoro Logic
// ========================
const pomoDisplay = document.getElementById('pomo-time');
const pomoLabel = document.getElementById('pomo-label');
const pomoStartBtn = document.getElementById('pomo-start-btn');
const pomoPauseBtn = document.getElementById('pomo-pause-btn');
const pomoSkipBtn = document.getElementById('pomo-skip-btn');
const pomoProgress = document.querySelector('.timer-progress');

function updatePomoUI() {
    const mins = Math.floor(pomoTimeRemaining / 60);
    const secs = pomoTimeRemaining % 60;
    pomoDisplay.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

    // Update circular progress
    const totalTime = isPomoWorkSession ? appData.settings.pomoWorkTime * 60 : appData.settings.pomoBreakTime * 60;
    const progress = (pomoTimeRemaining / totalTime) * 283;
    pomoProgress.style.strokeDashoffset = 283 - progress;
}

function startPomo() {
    if (isPomoRunning) return;
    isPomoRunning = true;
    pomoStartBtn.style.display = 'none';
    pomoPauseBtn.style.display = 'block';

    if (!pomoSessionStartTime && isPomoWorkSession) {
        pomoSessionStartTime = new Date();
    }

    pomoTimer = setInterval(() => {
        pomoTimeRemaining--;
        updatePomoUI();

        if (pomoTimeRemaining <= 0) {
            clearInterval(pomoTimer);
            isPomoRunning = false;
            handlePomoComplete();
        }
    }, 1000);
}

function pausePomo() {
    isPomoRunning = false;
    clearInterval(pomoTimer);
    pomoStartBtn.style.display = 'block';
    pomoPauseBtn.style.display = 'none';
}

function skipPomo() {
    pausePomo();
    handlePomoComplete();
}

function handlePomoComplete() {
    if (isPomoWorkSession) {
        // Log deep work session
        const actualHours = (new Date() - pomoSessionStartTime) / (1000 * 60 * 60);
        if (actualHours >= 0.1) { // Log if at least 6 mins
            appData.skills.push({
                id: Date.now(),
                date: new Date().toISOString(),
                skill: "Deep Work Session",
                hours: parseFloat(actualHours.toFixed(2)),
                focusSession: true,
                notes: "Logged via Pomodoro"
            });
            saveData();
            rebuildAllCharts();
            showNotification("Focus Session Complete", "Your work has been logged!");
        }

        isPomoWorkSession = false;
        pomoLabel.textContent = "Break Time";
        pomoTimeRemaining = appData.settings.pomoBreakTime * 60;
    } else {
        isPomoWorkSession = true;
        pomoLabel.textContent = "Deep Work";
        pomoTimeRemaining = appData.settings.pomoWorkTime * 60;
        showNotification("Break's Over", "Ready for the next session?");
    }

    pomoSessionStartTime = null;
    pomoStartBtn.style.display = 'block';
    pomoPauseBtn.style.display = 'none';
    updatePomoUI();
}

pomoStartBtn.addEventListener('click', startPomo);
pomoPauseBtn.addEventListener('click', pausePomo);
pomoSkipBtn.addEventListener('click', skipPomo);

// ========================
// Search & Filter
// ========================
const searchInput = document.getElementById('dashboard-search');

searchInput.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();

    // Filter Class Cards
    document.querySelectorAll('#classes .dashboard-item').forEach(item => {
        const text = item.innerText.toLowerCase();
        item.style.display = text.includes(term) ? 'block' : 'none';
    });

    // Filter Work Cards
    document.querySelectorAll('#work .dashboard-item').forEach(item => {
        const text = item.innerText.toLowerCase();
        item.style.display = text.includes(term) ? 'block' : 'none';
    });

    // Filter Skills
    document.querySelectorAll('#skills .dashboard-item').forEach(item => {
        const text = item.innerText.toLowerCase();
        item.style.display = text.includes(term) ? 'block' : 'none';
    });
});

// ========================
// Drag and Drop (SortableJS)
// ========================
function initSortable() {
    const list = document.getElementById('timetable-list');
    if (!list) return;

    new Sortable(list, {
        animation: 150,
        ghostClass: 'sortable-ghost',
        onEnd: () => {
            // Update appData based on new order
            const newOrder = [];
            list.querySelectorAll('.list-item').forEach(item => {
                const id = parseInt(item.getAttribute('data-id'));
                const entry = appData.timetable.find(t => t.id === id);
                if (entry) newOrder.push(entry);
            });
            appData.timetable = newOrder;
            saveData();
        }
    });
}


// Load Data
function loadData() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        appData = JSON.parse(saved);
        // Ensure new arrays/settings exist for legacy data
        if (!appData.classes) appData.classes = [];
        if (!appData.work) appData.work = [];
        if (!appData.skills) appData.skills = [];
        if (!appData.tasks) appData.tasks = [];
        if (!appData.settings) appData.settings = { theme: 'premium' };

        // Phase 2 Migrations
        if (appData.settings.notifications === undefined) appData.settings.notifications = true;
        if (appData.settings.predictive === undefined) appData.settings.predictive = true;
        if (appData.settings.deepWork === undefined) appData.settings.deepWork = true;
        if (appData.settings.theme === 'dark') appData.settings.theme = 'premium';

        renderTimetable();
        renderExams();
        renderClasses();
        renderWork();
        renderTasks();
        renderHeatmap();
        renderCorrelations();
        rebuildAllCharts();
        updateSkillDropdown();
        updateTaskParentDropdown();
        updateUserRank();
        initBuddies();
        applyTheme(appData.settings.theme);
        applyCustomBackground(appData.settings.customBg);
        syncTogglesToUI();
        if (appData.settings.notifications) checkExamsNotifications();

        // Init Pomodoro
        pomoTimeRemaining = appData.settings.pomoWorkTime * 60;
        updatePomoUI();
        initSortable();
    }
}

function checkExamsNotifications() {
    const now = new Date();
    const threeDays = 3 * 24 * 60 * 60 * 1000;
    appData.exams.forEach(exam => {
        const examDate = new Date(exam.date);
        const diff = examDate - now;
        if (diff > 0 && diff <= threeDays) {
            showNotification("Upcoming Exam Reminder", `${exam.subject} (${exam.type}) is on ${exam.date}. Get ready!`);
        }
    });
}

// Apply Theme
function applyTheme(themeId) {
    const themes = ['premium', 'light', 'ocean', 'nature'];
    themes.forEach(t => document.body.classList.remove(`${t}-theme`));

    if (themeId !== 'premium') {
        document.body.classList.add(`${themeId}-theme`);
    }

    appData.settings.theme = themeId;

    // Update UI active state if modal is open
    document.querySelectorAll('.theme-option').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-theme-id') === themeId);
    });

    saveData();
}

function applyCustomBackground(base64) {
    if (base64) {
        // Appending a style tag or setting body style
        document.body.style.backgroundImage = `url(${base64})`;
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundAttachment = 'fixed';
    } else {
        document.body.style.backgroundImage = 'none';
    }
    appData.settings.customBg = base64;
    saveData();
}

function syncTogglesToUI() {
    const notif = document.getElementById('toggle-notifications');
    const pred = document.getElementById('toggle-predictive');
    const dw = document.getElementById('toggle-deepwork');

    if (notif) notif.checked = appData.settings.notifications;
    if (pred) pred.checked = appData.settings.predictive;
    if (dw) dw.checked = appData.settings.deepWork;
}

// Save Data
function saveData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
}

// ========================
// Chart Logic (Rebuild & Update)
// ========================
function rebuildAllCharts() {
    // 1. Reset All Data
    dailyData.labels = [];
    dailyData.datasets[0].data = [];
    dailyData.datasets[0].backgroundColor = [];

    // Initialize labels for weekly and monthly if not already
    weeklyData.datasets[0].data = [0, 0, 0, 0, 0, 0, 0];
    monthlyData.datasets[0].data = [0, 0, 0, 0];

    if (!appData.skills || appData.skills.length === 0) {
        dailyChart.update();
        weeklyChart.update();
        monthlyChart.update();
        return;
    }

    // Theme-aware Color Palettes
    let colors = ["#5483B3", "#7DA0CA", "#C1E8FF", "#052659", "#4f8cff", "#22c55e"];
    if (appData.settings.theme === 'ocean') {
        colors = ["#0077be", "#00a9d8", "#4f8cff", "#70d6ff", "#003554", "#0582ca"];
    } else if (appData.settings.theme === 'nature') {
        colors = ["#2d6a4f", "#40916c", "#52b788", "#74c69d", "#95d5b2", "#1b4332"];
    } else if (appData.settings.theme === 'light') {
        colors = ["#3b82f6", "#10b981", "#6366f1", "#f59e0b", "#8b5cf6", "#ec4899"];
    }

    // 2. Aggregate Today's Data (Daily Chart)
    const todayStr = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD
    const skillCountsToday = {};

    appData.skills.forEach(log => {
        const logDate = new Date(log.date).toLocaleDateString('en-CA');
        if (logDate === todayStr) {
            skillCountsToday[log.skill] = (skillCountsToday[log.skill] || 0) + log.hours;
        }
    });

    let colorIndex = 0;
    for (const [skill, hours] of Object.entries(skillCountsToday)) {
        dailyData.labels.push(skill);
        dailyData.datasets[0].data.push(hours);
        dailyData.datasets[0].backgroundColor.push(colors[colorIndex % colors.length]);
        colorIndex++;
    }

    // 3. Aggregate Weekly Data (Mon-Sun Trend)
    const now = new Date();
    const currentDay = now.getDay(); // 0 (Sun) to 6 (Sat)
    const diff = now.getDate() - currentDay + (currentDay === 0 ? -6 : 1); // Adjust to Monday
    const startOfWeek = new Date(now);
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);

    appData.skills.forEach(log => {
        const d = new Date(log.date);
        if (d >= startOfWeek) {
            let dayIdx = d.getDay();
            dayIdx = (dayIdx === 0) ? 6 : dayIdx - 1; // Map Sun to 6, Mon to 0
            if (dayIdx >= 0 && dayIdx < 7) {
                weeklyData.datasets[0].data[dayIdx] += log.hours;
            }
        }
    });

    // 4. Aggregate Monthly Data (Last 4 Weeks / rolling 28 days)
    const rollingNow = new Date();
    const monthAgo = new Date();
    monthAgo.setDate(rollingNow.getDate() - 28);
    monthAgo.setHours(0, 0, 0, 0);

    appData.skills.forEach(log => {
        const d = new Date(log.date);
        if (d >= monthAgo) {
            const daysDiff = Math.floor((rollingNow - d) / (1000 * 60 * 60 * 24));
            const weekIdx = 3 - Math.floor(daysDiff / 7); // 0 (oldest) to 3 (this week)
            if (weekIdx >= 0 && weekIdx <= 3) {
                monthlyData.datasets[0].data[weekIdx] += log.hours;
            }
        }
    });

    monthlyData.labels = ["3 Weeks Ago", "2 Weeks Ago", "Last Week", "This Week"];

    dailyChart.update();
    weeklyChart.update();
    monthlyChart.update();
}

// Save Data
function saveData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
}

// ========================
// Timetable Logic
// ========================
const timetableForm = document.getElementById('timetable-form');
const timetableList = document.getElementById('timetable-list');

timetableForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const day = document.getElementById('day-select').value;
    const subject = document.getElementById('subject-input').value;
    const time = document.getElementById('time-input').value;
    const notes = document.getElementById('notes-input').value;

    appData.timetable.push({ id: Date.now(), day, subject, time, notes });
    saveData();
    renderTimetable();
    timetableForm.reset();
});

function renderTimetable() {
    timetableList.innerHTML = '';
    // Group by Day (Simplified for now, just listing)
    appData.timetable.forEach(item => {
        const div = document.createElement('div');
        div.className = 'list-item';
        div.setAttribute('data-id', item.id);
        div.innerHTML = `
            <div>
                <strong>${item.day}: ${item.subject}</strong>
                <small>${item.time} ${item.notes ? '- ' + item.notes : ''}</small>
            </div>
            <button onclick="deleteTimetableItem(${item.id})" style="background:none; color:#ef4444; padding:0;">&times;</button>
        `;
        timetableList.appendChild(div);
    });
}

window.deleteTimetableItem = (id) => {
    appData.timetable = appData.timetable.filter(i => i.id !== id);
    saveData();
    renderTimetable();
};

// ========================
// Exam Logic
// ========================
const examForm = document.getElementById('exam-form');
const examList = document.getElementById('exam-list');

examForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const subject = document.getElementById('exam-subject').value;
    const date = document.getElementById('exam-date').value;
    const type = document.getElementById('exam-type').value;

    appData.exams.push({ id: Date.now(), subject, date, type });
    appData.exams.sort((a, b) => new Date(a.date) - new Date(b.date)); // Sort by date
    saveData();
    renderExams();
    examForm.reset();
});

function renderExams() {
    examList.innerHTML = '';
    appData.exams.forEach(item => {
        const div = document.createElement('div');
        div.className = 'list-item';
        div.innerHTML = `
            <div>
                <strong>${item.subject} (${item.type})</strong>
                <small>Date: ${item.date}</small>
            </div>
            <button onclick="deleteExamItem(${item.id})" style="background:none; color:#ef4444; padding:0;">&times;</button>
        `;
        examList.appendChild(div);
    });
}

window.deleteExamItem = (id) => {
    appData.exams = appData.exams.filter(i => i.id !== id);
    saveData();
    renderExams();
};

// ========================
// Classes & Work Management Logic
// ========================
const classForm = document.getElementById('class-manager-form');
const workForm = document.getElementById('work-manager-form');
const skillForm = document.getElementById('skill-log-form'); // Fixed missing declaration
const classesMgmtList = document.getElementById('classes-mgmt-list');
const workMgmtList = document.getElementById('work-mgmt-list');

// Consistency Engine 
function calculateConsistencyScore() {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    // Threshold: 30 mins
    const MIN_EFFORT = 0.5;

    const monthLogs = appData.skills.filter(log => {
        const d = new Date(log.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const activeDays = new Set();
    const dailyTotals = {};

    monthLogs.forEach(log => {
        const dateStr = log.date.split('T')[0];
        dailyTotals[dateStr] = (dailyTotals[dateStr] || 0) + log.hours;
        if (dailyTotals[dateStr] >= MIN_EFFORT) {
            activeDays.add(dateStr);
        }
    });

    const totalDaysInMonthSoFar = today.getDate();
    const percentage = Math.round((activeDays.size / totalDaysInMonthSoFar) * 100) || 0;

    // Focus Score = Total Deep Work / Total Hours
    const totalHoursAll = monthLogs.reduce((sum, log) => sum + log.hours, 0);
    const totalDeepWorkHours = monthLogs.filter(log => log.focusSession).reduce((sum, log) => sum + log.hours, 0);
    const focusScore = totalHoursAll > 0 ? Math.round((totalDeepWorkHours / totalHoursAll) * 100) : 0;

    let grade = 'F';
    if (percentage >= 90) grade = 'A';
    else if (percentage >= 80) grade = 'B';
    else if (percentage >= 70) grade = 'C';
    else if (percentage >= 60) grade = 'D';

    const display = document.getElementById('consistency-display');
    if (display) {
        display.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <span>Consistency: <strong>${percentage}% (${grade})</strong></span>
                <span>Focus Score: <strong>${focusScore}%</strong></span>
            </div>
            <small>${activeDays.size} active days this month</small>
        `;

        if (percentage >= 80) display.style.color = '#22c55e';
        else if (percentage >= 60) display.style.color = '#eab308';
        else display.style.color = '#ef4444';
    }

    return { percentage, grade, activeDays: activeDays.size, focusScore };
}

function detectPeakWindow() {
    const hourCounts = new Array(24).fill(0);
    appData.skills.forEach(log => {
        const hour = new Date(log.date).getHours();
        hourCounts[hour]++;
    });
    const peakHour = hourCounts.indexOf(Math.max(...hourCounts));
    const peakEnd = (peakHour + 2) % 24;
    return { start: peakHour, end: peakEnd };
}

// Deep Work Detection
function detectDeepWork(hours) {
    return hours >= 1.5; // 90 minutes
}

// Classes
classForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('class-name-input').value.trim();
    const desc = document.getElementById('class-desc-input').value.trim();

    if (!name) return;

    if (appData.classes.some(c => c.name.toLowerCase() === name.toLowerCase())) {
        alert("Class already exists!");
        return;
    }

    appData.classes.push({ id: Date.now(), name, desc });
    saveData();
    renderClasses();
    classForm.reset();
});

function renderClasses() {
    // 1. Render in Settings
    classesMgmtList.innerHTML = '';
    appData.classes.forEach(item => {
        const div = document.createElement('div');
        div.className = 'list-item';
        div.innerHTML = `
            <div style="flex: 1;">
                <strong>${item.name}</strong>
                <small>${item.desc || 'No notes'}</small>
            </div>
            <div style="display: flex; gap: 8px;">
                <button onclick="editClassItem(${item.id})" style="background:none; color:var(--mid-bright); font-size: 0.9rem;">Edit</button>
                <button onclick="deleteClassItem(${item.id})" style="background:none; color:#ef4444;">&times;</button>
            </div>
        `;
        classesMgmtList.appendChild(div);
    });

    // 2. Render on Dashboard
    const container = document.querySelector('#classes .card-content');
    container.innerHTML = '';
    if (appData.classes.length === 0) {
        container.innerHTML = '<p class="empty-state">No classes added yet.</p>';
    } else {
        appData.classes.forEach(item => {
            const tasksHTML = appData.tasks
                .filter(t => t.parent === item.name)
                .map(t => `<li style="font-size: 0.8rem; opacity: 0.8; ${t.completed ? 'text-decoration: line-through;' : ''}">${t.name}</li>`)
                .join('');

            const div = document.createElement('div');
            div.className = 'dashboard-item';
            div.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                    <div>
                        <strong>${item.name}</strong>
                        <p>${item.desc || 'Active Enrollment'}</p>
                    </div>
                </div>
                ${tasksHTML ? `<ul style="list-style:none; padding-left:0; margin-top:8px; border-top:1px solid rgba(255,255,255,0.05); padding-top:8px;">${tasksHTML}</ul>` : ''}
            `;
            container.appendChild(div);
        });
    }
    updateSkillDropdown();
    updateTaskParentDropdown();
}

window.deleteClassItem = (id) => {
    if (confirm("Are you sure you want to delete this class? Related session logs will remain but won't be categorized.")) {
        appData.classes = appData.classes.filter(i => i.id !== id);
        saveData();
        renderClasses();
        rebuildAllCharts();
    }
};

window.editClassItem = (id) => {
    const item = appData.classes.find(i => i.id === id);
    if (!item) return;

    const newName = prompt("Edit Class Name:", item.name);
    if (newName === null) return;
    const newDesc = prompt("Edit Class Description:", item.desc);

    if (newName.trim() === "") {
        alert("Class name cannot be empty.");
        return;
    }

    item.name = newName.trim();
    item.desc = newDesc ? newDesc.trim() : "";
    saveData();
    renderClasses();
};

// Work/Skills
workForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('work-name-input').value.trim();
    const category = document.getElementById('work-category-input').value.trim();

    if (!name) return;

    if (appData.work.some(w => w.name.toLowerCase() === name.toLowerCase())) {
        alert("Work stream already exists!");
        return;
    }

    appData.work.push({ id: Date.now(), name, category });
    saveData();
    renderWork();
    workForm.reset();
});

function renderWork() {
    // 1. Render in Settings
    workMgmtList.innerHTML = '';
    appData.work.forEach(item => {
        const div = document.createElement('div');
        div.className = 'list-item';
        div.innerHTML = `
            <div style="flex: 1;">
                <strong>${item.name}</strong>
                <small>${item.category || 'General'}</small>
            </div>
            <div style="display: flex; gap: 8px;">
                <button onclick="editWorkItem(${item.id})" style="background:none; color:var(--mid-bright); font-size: 0.9rem;">Edit</button>
                <button onclick="deleteWorkItem(${item.id})" style="background:none; color:#ef4444;">&times;</button>
            </div>
        `;
        workMgmtList.appendChild(div);
    });

    // 2. Render on Dashboard (Work & Tracked Skills)
    const workContainer = document.querySelector('#work .card-content');
    const skillsContainer = document.querySelector('#skills .card-content');

    workContainer.innerHTML = '';
    skillsContainer.innerHTML = '';

    if (appData.work.length === 0) {
        workContainer.innerHTML = '<p class="empty-state">Add items in settings.</p>';
        skillsContainer.innerHTML = '<p class="empty-state">No skills tracked yet.</p>';
    } else {
        appData.work.forEach(item => {
            // Work Card - with Streak info
            const streak = calculateStreak(item.name);
            const tasksHTML = appData.tasks
                .filter(t => t.parent === item.name)
                .map(t => `<li style="font-size: 0.8rem; opacity: 0.8; ${t.completed ? 'text-decoration: line-through;' : ''}">${t.name}</li>`)
                .join('');

            const workDiv = document.createElement('div');
            workDiv.className = 'dashboard-item';
            workDiv.innerHTML = `
                <div style="display:flex; justify-content:space-between;">
                    <strong>${item.name}</strong>
                    <span style="font-size:0.75rem; color:var(--mid-bright);">${streak} day streak 🔥</span>
                </div>
                <p>${item.category || 'Active'}</p>
                ${tasksHTML ? `<ul style="list-style:none; padding-left:0; margin-top:8px; border-top:1px solid rgba(255,255,255,0.05); padding-top:8px;">${tasksHTML}</ul>` : ''}
            `;
            workContainer.appendChild(workDiv);

            // Skills Card (Aggregate from skills logs)
            const totalHours = appData.skills
                .filter(s => s.skill.toLowerCase() === item.name.toLowerCase())
                .reduce((sum, s) => sum + s.hours, 0);

            // Balance Detection
            const isNeglected = !appData.skills.some(s => s.skill.toLowerCase() === item.name.toLowerCase() &&
                (new Date() - new Date(s.date)) < (3 * 24 * 60 * 60 * 1000));
            const statusColor = isNeglected ? '#ef4444' : 'var(--mid-bright)';

            const skillDiv = document.createElement('div');
            skillDiv.className = 'dashboard-item';
            skillDiv.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <strong style="color:${statusColor}">${item.name}</strong>
                    <span style="font-size:0.8rem; opacity:0.7;">${totalHours.toFixed(1)}h</span>
                </div>
                <div class="progress-bar" style="height:4px; margin-top:8px;">
                    <div class="progress" style="width: ${Math.min((totalHours / 100) * 100, 100)}%; background: ${statusColor}"></div>
                </div>
            `;
            skillsContainer.appendChild(skillDiv);
        });
    }
    updateSkillDropdown();
}

window.deleteWorkItem = (id) => {
    if (confirm("Are you sure you want to delete this work stream?")) {
        appData.work = appData.work.filter(i => i.id !== id);
        saveData();
        renderWork();
        rebuildAllCharts();
    }
};

window.editWorkItem = (id) => {
    const item = appData.work.find(i => i.id === id);
    if (!item) return;

    const newName = prompt("Edit Work/Skill Name:", item.name);
    if (newName === null) return;
    const newCat = prompt("Edit Category:", item.category);

    if (newName.trim() === "") {
        alert("Name cannot be empty.");
        return;
    }

    item.name = newName.trim();
    item.category = newCat ? newCat.trim() : "";
    saveData();
    renderWork();
};

function updateSkillDropdown() {
    const select = document.getElementById('skill-select');
    if (!select) return;

    select.innerHTML = '<option value="" disabled selected>Select Item</option>';

    const combined = [
        ...appData.classes.map(c => ({ name: c.name, type: 'Class' })),
        ...appData.work.map(w => ({ name: w.name, type: 'Work' }))
    ];

    combined.forEach(item => {
        const opt = document.createElement('option');
        opt.value = item.name;
        opt.textContent = `${item.name} (${item.type})`;
        select.appendChild(opt);
    });
}

skillForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const skill = document.getElementById('skill-select').value; // Fixed missing variable
    const hours = parseFloat(document.getElementById('skill-hours').value);

    if (!skill || isNaN(hours) || hours <= 0) {
        alert("Please select an item and enter valid duration.");
        return;
    }

    // Log entry
    const isDeepWork = appData.settings.deepWork && hours >= 1.5;
    appData.skills.push({
        id: Date.now(),
        date: new Date().toISOString(),
        skill: skill,
        hours: hours,
        focusSession: isDeepWork
    });
    saveData();

    // Update Charts & Metrics
    rebuildAllCharts();
    renderWork(); // Refresh skill bars
    updateInsightDisplay(); // Refresh insights & consistency

    const feedback = isDeepWork ? `Logged ${hours}h for ${skill}. Deep Work detected! 🔥` : `Logged ${hours}h for ${skill}`;
    alert(feedback);
    skillForm.reset();
});

// Removed updateDailyChart as rebuildAllCharts handles everything unified

// Data Controls
// ========================
// Theme Toggle Logic (Added to Data Panel UI in HTML shortly or via JS)
function createThemeToggle() {
    const dataPanel = document.getElementById('data');
    if (!dataPanel) return;

    const themeBox = document.createElement('div');
    themeBox.className = 'data-controls';
    themeBox.style.marginTop = '20px';
    themeBox.innerHTML = `
        <p>Appearance</p>
        <button id="theme-toggle-btn">Switch to ${appData.settings.theme === 'light' ? 'Dark' : 'Light'} Mode</button>
    `;
    dataPanel.appendChild(themeBox);

    document.getElementById('theme-toggle-btn').addEventListener('click', () => {
        const newTheme = appData.settings.theme === 'light' ? 'dark' : 'light';
        applyTheme(newTheme);
        document.getElementById('theme-toggle-btn').textContent = `Switch to ${newTheme === 'light' ? 'Dark' : 'Light'} Mode`;
    });
}

document.getElementById('reset-btn').addEventListener('click', () => {
    if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
        localStorage.removeItem(STORAGE_KEY);
        appData = { timetable: [], exams: [], skills: [], settings: { theme: 'blue-premium' } };
        renderTimetable();
        renderExams();
        alert('All data has been reset.');
    }
});

// Export Data
document.getElementById('export-btn').addEventListener('click', () => {
    const dataStr = JSON.stringify(appData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dashboard_data_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
});

// Import Data Trigger
document.getElementById('import-btn').addEventListener('click', () => {
    document.getElementById('import-file').click();
});

// Handle File Select
document.getElementById('import-file').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            appData = JSON.parse(e.target.result);
            saveData();
            renderTimetable();
            renderExams();
            alert('Data imported successfully!');
        } catch (err) {
            alert('Error importing data. Invalid JSON file.');
            console.error(err);
        }
    };
    reader.readAsText(file);
});

// ========================
// AI Integration
// ========================
const smartInput = document.getElementById('smart-input');
const smartSubmit = document.getElementById('smart-submit');
const insightElement = document.getElementById('ai-insight');
let currentView = 'daily';

function handleSmartInput() {
    const text = smartInput.value.trim();
    if (!text) return;

    // Check for Commands first
    const queryResult = window.AI_Engine.processQuery(text, appData);
    if (queryResult === "opening_stats") {
        document.getElementById('settings-btn').click(); // Open settings
        smartInput.value = '';
        return;
    }

    // Attempt Log Parsing
    const result = window.AI_Engine.parseLogInput(text, appData);

    if (result.valid) {
        // Save to data
        const hours = result.entry.hours;
        const isDeepWork = detectDeepWork(hours);
        result.entry.focusSession = isDeepWork;

        appData.skills.push(result.entry);
        saveData();

        // Update Everything
        rebuildAllCharts();
        updateWorkProgress();
        updateInsightDisplay();

        // Feedback & Suggestions
        smartInput.value = '';
        let msg = isDeepWork ? `Deep Work Logged: ${result.entry.skill} ✅🔥` : `Logged: ${result.entry.skill} ✅`;

        if (result.suggestion) {
            msg += ` (Suggestion: create "${result.suggestion}")`;
            if (confirm(`Unrecognized category "${result.suggestion}" detected. Create it now?`)) {
                // Determine if it's a class or work (heuristic: if it looks like a subject, class)
                if (text.includes("subject") || text.includes("class")) {
                    appData.classes.push({ id: Date.now(), name: result.suggestion, desc: "Auto-created" });
                    renderClasses();
                } else {
                    appData.work.push({ id: Date.now(), name: result.suggestion, category: "Auto-created" });
                    renderWork();
                }
                saveData();
            }
        }

        smartInput.placeholder = msg;
        setTimeout(() => {
            smartInput.placeholder = "✨ Ask or Log (e.g., 'Forex 2h')";
        }, 5000);
    } else {
        smartInput.classList.add('error');
        setTimeout(() => smartInput.classList.remove('error'), 500);
    }
}

function updateWorkProgress() {
    renderWork();
}

function updateInsightDisplay() {
    if (window.AI_Engine) {
        let message = "";
        const title = document.getElementById('insight-title');

        if (currentView === 'daily') {
            title.textContent = "Daily Insight";
            message = window.AI_Engine.generateDailyInsight(appData.skills);
        } else if (currentView === 'weekly') {
            title.textContent = "Weekly Reflection";
            message = window.AI_Engine.generateWeeklyInsight(appData.skills);
        } else if (currentView === 'monthly') {
            title.textContent = "Monthly Reflection";
            message = window.AI_Engine.generateMonthlyInsight(appData.skills);
        }

        insightElement.textContent = message;

        // Trigger animation
        const card = insightElement.parentElement.parentElement;
        card.style.animation = 'none';
        card.offsetHeight;
        card.style.animation = 'fadeIn 0.5s ease-out';

        // Also update consistency score whenever insights refresh
        calculateConsistencyScore();
    }
}

// Toggle Event Listeners
document.querySelectorAll('.toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentView = btn.getAttribute('data-view');
        updateInsightDisplay();

        // Scroll to charts or highlight relevant chart based on view if desired?
        // For now, just update the text.
    });
});

smartSubmit.addEventListener('click', handleSmartInput);
smartInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSmartInput();
});

// Update insight on load
window.addEventListener('load', () => {
    setTimeout(updateInsightDisplay, 500); // Small delay to ensure data loaded
});

// Initialize
loadData();

// Initial Render Trigger
window.addEventListener('load', () => {
    renderClasses();
    renderWork();
    createThemeToggle();
    initPhase2Listeners();
});

function initPhase2Listeners() {
    // Theme Switching
    document.querySelectorAll('.theme-option').forEach(btn => {
        btn.addEventListener('click', () => {
            const themeId = btn.getAttribute('data-theme-id');
            applyTheme(themeId);
        });
    });

    // Background Upload
    const bgUpload = document.getElementById('bg-upload');
    if (bgUpload) {
        bgUpload.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    applyCustomBackground(event.target.result);
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Reset Background
    const resetBg = document.getElementById('reset-bg');
    if (resetBg) {
        resetBg.addEventListener('click', () => {
            applyCustomBackground(null);
        });
    }

    // Toggles
    const toggles = {
        'toggle-notifications': 'notifications',
        'toggle-predictive': 'predictive',
        'toggle-deepwork': 'deepWork'
    };

    for (const [id, key] of Object.entries(toggles)) {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('change', (e) => {
                appData.settings[key] = e.target.checked;
                saveData();
                if (key === 'predictive') updateInsightDisplay();
            });
        }
    }
}

function showNotification(title, body) {
    if (!("Notification" in window)) return;
    if (Notification.permission === "granted") {
        new Notification(title, { body });
    } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then(permission => {
            if (permission === "granted") {
                new Notification(title, { body });
            }
        });
    }
}

function calculateStreak(skillName) {
    const logs = appData.skills
        .filter(s => s.skill.toLowerCase() === skillName.toLowerCase())
        .sort((a, b) => new Date(b.date) - new Date(a.date));

    if (logs.length === 0) return 0;

    let streak = 0;
    let lastDate = new Date();
    lastDate.setHours(0, 0, 0, 0);

    // Check if logged today or yesterday to start streak
    const mostRecent = new Date(logs[0].date);
    mostRecent.setHours(0, 0, 0, 0);

    const diffDays = Math.floor((lastDate - mostRecent) / (1000 * 60 * 60 * 24));
    if (diffDays > 1) return 0; // Streak broken

    let currentDate = mostRecent;
    for (let log of logs) {
        let logDate = new Date(log.date);
        logDate.setHours(0, 0, 0, 0);

        if (logDate.getTime() === currentDate.getTime()) {
            if (streak === 0 || logDate.getTime() !== new Date(logs[logs.indexOf(log) - 1]?.date).setHours(0, 0, 0, 0)) {
                // First log for this day
            }
        } else if (logDate.getTime() === new Date(currentDate.getTime() - 86400000).getTime()) {
            streak++;
            currentDate = logDate;
        } else if (logDate.getTime() < new Date(currentDate.getTime() - 86400000).getTime()) {
            break;
        }
    }
    return streak + (diffDays <= 1 ? 1 : 0);
}

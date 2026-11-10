// PROSPECT - Football Scouting Notebook
// Main Application Module

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await PROSPECT_DB.init();
        initApp();
    } catch (error) {
        console.error('Failed to initialize:', error);
    }
});

const state = { currentSection: 'dashboard', players: [] };
const elements = {};

async function initApp() {
    cacheElements();
    await loadSettings();
    setupEventListeners();
    setupNavigation();
    await loadInitialData();
    setupPWA();
    setupTheme();
}

function cacheElements() {
    elements.app = document.getElementById('app');
    elements.sidebar = document.getElementById('sidebar');
    elements.mainContent = document.getElementById('main-content');
    elements.sectionContent = document.getElementById('section-content');
    elements.menuToggle = document.getElementById('menu-toggle');
    elements.themeToggle = document.getElementById('theme-toggle');
    elements.globalSearch = document.getElementById('global-search');
    elements.addNewBtn = document.getElementById('add-new');
    elements.currentSection = document.getElementById('current-section');
    elements.modalContainer = document.getElementById('modal-container');
    elements.toastContainer = document.getElementById('toast-container');
    elements.totalPlayers = document.getElementById('total-players');
    elements.totalReports = document.getElementById('total-reports');
    elements.totalMatches = document.getElementById('total-matches');
    elements.totalNotes = document.getElementById('total-notes');
    elements.recentActivityList = document.getElementById('recent-activity-list');
    elements.recentlyViewedList = document.getElementById('recently-viewed-list');
    elements.playersGrid = document.getElementById('players-grid');
    elements.reportsList = document.getElementById('reports-list');
    elements.notesGrid = document.getElementById('notes-grid');
    elements.matchesList = document.getElementById('matches-list');
    elements.analysisGrid = document.getElementById('analysis-grid');
    elements.positionFilter = document.getElementById('position-filter');
    elements.ageFilter = document.getElementById('age-filter');
    elements.playerSearch = document.getElementById('player-search');
    elements.themeSelect = document.getElementById('theme-select');
}


async function loadSettings() {
    try {
        const savedTheme = await PROSPECT_DB.getSetting('theme', 'system');
        state.theme = savedTheme;
        if (elements.themeSelect) elements.themeSelect.value = savedTheme;
        applyTheme(savedTheme);
    } catch (error) {}
}

function setupEventListeners() {
    if (elements.menuToggle) elements.menuToggle.addEventListener('click', toggleSidebar);
    if (elements.themeToggle) elements.themeToggle.addEventListener('click', toggleTheme);
    if (elements.themeSelect) elements.themeSelect.addEventListener('change', (e) => {
        state.theme = e.target.value;
        applyTheme(e.target.value);
        PROSPECT_DB.setSetting('theme', e.target.value);
    });
    if (elements.globalSearch) elements.globalSearch.addEventListener('input', (e) => performGlobalSearch(e.target.value));
    if (elements.addNewBtn) elements.addNewBtn.addEventListener('click', handleAddNew);
    if (elements.positionFilter) elements.positionFilter.addEventListener('change', filterPlayers);
    if (elements.ageFilter) elements.ageFilter.addEventListener('change', filterPlayers);
    if (elements.playerSearch) elements.playerSearch.addEventListener('input', filterPlayers);
    
    document.getElementById('add-player-btn')?.addEventListener('click', () => showPlayerModal());
    document.getElementById('add-report-btn')?.addEventListener('click', () => showReportModal());
    document.getElementById('add-note-btn')?.addEventListener('click', () => showNoteModal());
    document.getElementById('add-match-btn')?.addEventListener('click', () => showMatchModal());
    document.getElementById('export-data-btn')?.addEventListener('click', exportData);
    
    const importBtn = document.getElementById('import-data-btn');
    const importFile = document.getElementById('import-file');
    if (importBtn && importFile) {
        importBtn.addEventListener('click', () => importFile.click());
        importFile.addEventListener('change', handleImport);
    }
    
    document.getElementById('clear-data-btn')?.addEventListener('click', () => {
        showConfirmModal('Clear All Data', 'Are you sure? This cannot be undone.', async () => {
            await clearAllData();
            showToast('All data cleared', 'success');
            await loadInitialData();
        });
    });
    
    document.getElementById('install-btn')?.addEventListener('click', installPWA);
    
    elements.modalContainer?.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-overlay')) closeAllModals();
    });
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeAllModals();
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
            e.preventDefault();
            elements.globalSearch?.focus();
        }
    });
}

function setupNavigation() {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => navigateTo(item.dataset.section));
    });
    
    window.addEventListener('hashchange', () => {
        const hash = window.location.hash.substring(1);
        if (hash) navigateTo(hash);
    });
    
    const initialHash = window.location.hash.substring(1);
    if (initialHash) navigateTo(initialHash);
}

function navigateTo(section) {
    state.currentSection = section;
    window.location.hash = section;
    
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.section === section);
    });
    document.querySelectorAll('.section').forEach(s => {
        s.classList.toggle('active', s.id === `${section}-section`);
    });
    
    if (elements.currentSection) {
        const names = { dashboard: 'Dashboard', players: 'Players', scouting: 'Scouting', 
            notebook: 'Notebook', matches: 'Matches', analysis: 'Analysis', settings: 'Settings' };
        elements.currentSection.textContent = names[section] || section;
    }
    
    if (window.innerWidth <= 768) closeSidebar();
    loadSectionData(section);
    elements.sectionContent?.scrollTo(0, 0);
}

async function loadSectionData(section) {
    const loaders = {
        dashboard: loadDashboard,
        players: loadPlayers,
        scouting: loadReports,
        notebook: loadNotes,
        matches: loadMatches,
        analysis: loadAnalysis,
        settings: loadSettingsUI
    };
    if (loaders[section]) await loaders[section]();
}

async function loadInitialData() {
    await loadDashboard();
    await loadPlayersForDropdowns();
}


async function loadDashboard() {
    try {
        const stats = await PROSPECT_DB.getStatistics();
        if (elements.totalPlayers) elements.totalPlayers.textContent = stats.players;
        if (elements.totalReports) elements.totalReports.textContent = stats.reports;
        if (elements.totalMatches) elements.totalMatches.textContent = stats.matches;
        if (elements.totalNotes) elements.totalNotes.textContent = stats.notes;
        await loadRecentActivity();
        await loadRecentlyViewedPlayers();
    } catch (error) {}
}

async function loadRecentActivity() {
    try {
        const activities = await PROSPECT_DB.getActivity(0, 5);
        if (!elements.recentActivityList) return;
        
        if (activities.length === 0) {
            elements.recentActivityList.innerHTML = '<div class="empty-state"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg><p>No recent activity</p></div>';
            return;
        }
        
        const icons = {
            create: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
            update: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',
            delete: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>'
        };
        const entityNames = { players: 'Player', reports: 'Report', matches: 'Match', notes: 'Note' };
        const actionNames = { create: 'Added', update: 'Updated', delete: 'Deleted' };
        
        elements.recentActivityList.innerHTML = activities.map(activity => {
            const icon = icons[activity.type] || icons.create;
            const entity = entityNames[activity.entity] || activity.entity;
            const action = actionNames[activity.type] || activity.type;
            const time = formatDate(new Date(activity.timestamp));
            return `<div class="activity-item" onclick="navigateTo('${activity.entity}')"><div class="activity-icon">${icon}</div><div class="activity-info"><span class="activity-title">${action} ${entity}</span><span class="activity-time">${time}</span></div></div>`;
        }).join('');
    } catch (error) {}
}

async function loadRecentlyViewedPlayers() {
    try {
        const players = await PROSPECT_DB.getAll('players', 'createdAt');
        const recentPlayers = players.slice(-3).reverse();
        if (!elements.recentlyViewedList) return;
        
        if (recentPlayers.length === 0) {
            elements.recentlyViewedList.innerHTML = '<div class="empty-state"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="8" r="5"/><path d="M3 21v-2a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v2"/></svg><p>No players viewed yet</p></div>';
            return;
        }
        
        elements.recentlyViewedList.innerHTML = recentPlayers.map(player => {
            const initials = getInitials(player.name);
            return `<div class="player-item" onclick="viewPlayer('${player.id}')"><div class="player-avatar">${initials}</div><div class="player-info"><span class="player-name">${player.name}</span><span class="player-position">${player.position || 'N/A'}</span></div></div>`;
        }).join('');
    } catch (error) {}
}


async function loadPlayers() {
    try {
        const players = await PROSPECT_DB.getAll('players');
        if (!elements.playersGrid) return;
        
        if (players.length === 0) {
            elements.playersGrid.innerHTML = '<div class="empty-state"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="8" r="5"/><path d="M3 21v-2a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v2"/></svg><p>No players added yet</p><p class="empty-hint">Click "Add Player" to create your first player profile</p><button class="btn btn-primary" onclick="showPlayerModal()">Add Your First Player</button></div>';
            return;
        }
        
        elements.playersGrid.innerHTML = players.map(createPlayerCard).join('');
    } catch (error) {}
}

function createPlayerCard(player) {
    const initials = getInitials(player.name);
    const position = player.position || 'N/A';
    const club = player.club || 'N/A';
    const age = player.age || calculateAge(player.dob);
    const height = player.height ? `${player.height}cm` : 'N/A';
    const foot = player.preferredFoot || 'N/A';
    
    return `
        <div class="player-card" onclick="viewPlayer('${player.id}')">
            <div class="player-card-header">
                <div class="player-card-avatar">${initials}</div>
                <div class="player-card-info">
                    <div class="player-card-name">${player.name}</div>
                    <span class="player-card-position">${position}</span>
                    <div class="player-card-club">${club}</div>
                </div>
            </div>
            <div class="player-card-details">
                <div class="player-card-detail"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg><span>${age || 'N/A'} years</span></div>
                <div class="player-card-detail"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg><span>${height}</span></div>
                <div class="player-card-detail"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg><span>${foot}</span></div>
            </div>
            <div class="player-card-actions">
                <button class="btn btn-text btn-sm" onclick="event.stopPropagation(); editPlayer('${player.id}')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
                <button class="btn btn-text btn-sm" onclick="event.stopPropagation(); confirmDelete('${player.id}', 'players', 'player')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>
            </div>
        </div>
    `;
}

async function filterPlayers() {
    try {
        let players = await PROSPECT_DB.getAll('players');
        const position = elements.positionFilter?.value;
        const age = elements.ageFilter?.value;
        const search = elements.playerSearch?.value?.toLowerCase();
        
        if (position) players = players.filter(p => p.position === position);
        if (age) players = players.filter(p => filterByAge(p, age));
        if (search) players = players.filter(p => p.name.toLowerCase().includes(search) || p.club.toLowerCase().includes(search) || p.position.toLowerCase().includes(search));
        
        if (!elements.playersGrid) return;
        elements.playersGrid.innerHTML = players.length === 0 
            ? '<div class="empty-state"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="8" r="5"/><path d="M3 21v-2a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v2"/></svg><p>No players found</p><p class="empty-hint">Try adjusting filters</p></div>'
            : players.map(createPlayerCard).join('');
    } catch (error) {}
}

function filterByAge(player, ageRange) {
    const age = player.age || calculateAge(player.dob);
    if (!age) return false;
    if (ageRange === 'U18') return age < 18;
    if (ageRange === '18-21') return age >= 18 && age <= 21;
    if (ageRange === '22-25') return age >= 22 && age <= 25;
    if (ageRange === '26-30') return age >= 26 && age <= 30;
    if (ageRange === '30+') return age > 30;
    return true;
}


async function loadReports() {
    try {
        const reports = await PROSPECT_DB.getAll('reports');
        if (!elements.reportsList) return;
        
        if (reports.length === 0) {
            elements.reportsList.innerHTML = '<div class="empty-state"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg><p>No reports yet</p><p class="empty-hint">Create your first scouting report</p></div>';
            return;
        }
        
        elements.reportsList.innerHTML = reports.map(createReportCard).join('');
    } catch (error) {}
}

function createReportCard(report) {
    const player = state.players.find(p => p.id === report.playerId) || { name: 'Unknown' };
    const date = formatDate(new Date(report.date || report.createdAt));
    const rating = calculateAverageRating(report.attributes);
    
    return `
        <div class="report-card" onclick="viewReport('${report.id}')">
            <div class="report-card-header">
                <div class="report-card-avatar">${getInitials(player.name)}</div>
                <div class="report-card-info">
                    <div class="report-card-player">${player.name}</div>
                    <div class="report-card-date">${date}</div>
                </div>
            </div>
            <div class="report-card-rating"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg><span>${rating.toFixed(1)}</span></div>
            <div class="report-card-actions">
                <button class="btn btn-text btn-sm" onclick="event.stopPropagation(); editReport('${report.id}')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
                <button class="btn btn-text btn-sm" onclick="event.stopPropagation(); confirmDelete('${report.id}', 'reports', 'report')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>
            </div>
        </div>
    `;
}

async function loadNotes() {
    try {
        const notes = await PROSPECT_DB.getAll('notes');
        if (!elements.notesGrid) return;
        
        if (notes.length === 0) {
            elements.notesGrid.innerHTML = '<div class="empty-state"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg><p>No notes yet</p><p class="empty-hint">Start writing observations</p></div>';
            return;
        }
        
        elements.notesGrid.innerHTML = notes.map(createNoteCard).join('');
    } catch (error) {}
}

function createNoteCard(note) {
    const date = formatDate(new Date(note.createdAt));
    const player = note.playerId ? state.players.find(p => p.id === note.playerId) : null;
    const tags = note.tags ? note.tags.split(',').map(t => t.trim()) : [];
    
    return `
        <div class="note-card" onclick="viewNote('${note.id}')">
            <div class="note-card-header">
                <div class="note-card-title">${note.title || 'Untitled'}</div>
                <div class="note-card-meta"><span>${date}</span>${player ? `<span>• ${player.name}</span>` : ''}</div>
            </div>
            <div class="note-card-content">${note.content || 'No content'}</div>
            ${tags.length > 0 ? `<div class="note-card-tags">${tags.map(tag => `<span class="note-card-tag">${tag}</span>`).join('')}</div>` : ''}
            <div class="note-card-actions">
                <button class="btn btn-text btn-sm" onclick="event.stopPropagation(); editNote('${note.id}')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
                <button class="btn btn-text btn-sm" onclick="event.stopPropagation(); confirmDelete('${note.id}', 'notes', 'note')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>
            </div>
        </div>
    `;
}

async function loadMatches() {
    try {
        const matches = await PROSPECT_DB.getAll('matches');
        if (!elements.matchesList) return;
        
        if (matches.length === 0) {
            elements.matchesList.innerHTML = '<div class="empty-state"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg><p>No matches yet</p><p class="empty-hint">Add your first match observation</p></div>';
            return;
        }
        
        elements.matchesList.innerHTML = matches.map(createMatchCard).join('');
    } catch (error) {}
}

function createMatchCard(match) {
    const date = formatDate(new Date(match.date || match.createdAt));
    const player = state.players.find(p => p.id === match.playerId) || { name: 'Unknown' };
    const position = match.positionPlayed || player.position || 'N/A';
    const rating = match.rating || 0;
    
    return `
        <div class="match-card" onclick="viewMatch('${match.id}')">
            <div class="match-card-header">
                <div class="match-card-opponent">${match.opponent || 'Unknown'}</div>
                <div class="match-card-info"><span>${match.competition || 'N/A'}</span><span>• ${date}</span><span>• ${match.venue || 'N/A'}</span></div>
            </div>
            <div class="match-card-player">
                <div class="match-card-player-avatar">${getInitials(player.name)}</div>
                <div class="match-card-player-info">
                    <div class="match-card-player-name">${player.name}</div>
                    <div class="match-card-player-position">${position} - ${match.minutesPlayed || 'N/A'} mins</div>
                </div>
                <div class="match-card-rating"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg><span>${rating}</span></div>
            </div>
            <div class="match-card-actions">
                <button class="btn btn-text btn-sm" onclick="event.stopPropagation(); editMatch('${match.id}')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
                <button class="btn btn-text btn-sm" onclick="event.stopPropagation(); confirmDelete('${match.id}', 'matches', 'match')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>
            </div>
        </div>
    `;
}


async function loadAnalysis() {
    try {
        const reports = await PROSPECT_DB.getAll('reports');
        if (!elements.analysisGrid) return;
        
        if (reports.length === 0) {
            elements.analysisGrid.innerHTML = '<div class="empty-state"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg><p>No analysis data available</p><p class="empty-hint">Create scouting reports to generate analysis</p></div>';
            return;
        }
        
        const playerReports = {};
        reports.forEach(report => {
            if (!playerReports[report.playerId]) playerReports[report.playerId] = [];
            playerReports[report.playerId].push(report);
        });
        
        elements.analysisGrid.innerHTML = Object.entries(playerReports).map(([playerId, playerReports]) => {
            const player = state.players.find(p => p.id === playerId) || { name: 'Unknown' };
            const avgRating = calculateAverageReportRating(playerReports);
            const technicalRating = calculateAverageCategoryRating(playerReports, 'technical');
            const tacticalRating = calculateAverageCategoryRating(playerReports, 'tactical');
            const physicalRating = calculateAverageCategoryRating(playerReports, 'physical');
            const mentalRating = calculateAverageCategoryRating(playerReports, 'mental');
            
            return `
                <div class="analysis-card" onclick="viewPlayerAnalysis('${playerId}')">
                    <div class="analysis-card-header">
                        <h3>${player.name}</h3>
                        <span class="badge badge-primary">${playerReports.length} report${playerReports.length > 1 ? 's' : ''}</span>
                    </div>
                    <div class="analysis-card-content">
                        <div class="progress-ring" style="--progress: ${avgRating * 20}">
                            <svg class="progress-ring-circle" width="80" height="80" viewBox="0 0 80 80">
                                <circle class="progress-ring-bg" cx="40" cy="40" r="32"/>
                                <circle class="progress-ring-progress" cx="40" cy="40" r="32" style="stroke-dasharray: ${avgRating * 20 * 2.01}, 201"/>
                            </svg>
                            <div class="progress-ring-text">${avgRating.toFixed(1)}</div>
                        </div>
                        <div class="attribute-stats">
                            <div class="attribute-stat"><span class="attribute-stat-label">Technical</span><div class="attribute-bar"><div class="attribute-bar-fill technical" style="width: ${technicalRating * 20}%"></div></div><span class="attribute-stat-value">${technicalRating.toFixed(1)}</span></div>
                            <div class="attribute-stat"><span class="attribute-stat-label">Tactical</span><div class="attribute-bar"><div class="attribute-bar-fill tactical" style="width: ${tacticalRating * 20}%"></div></div><span class="attribute-stat-value">${tacticalRating.toFixed(1)}</span></div>
                            <div class="attribute-stat"><span class="attribute-stat-label">Physical</span><div class="attribute-bar"><div class="attribute-bar-fill physical" style="width: ${physicalRating * 20}%"></div></div><span class="attribute-stat-value">${physicalRating.toFixed(1)}</span></div>
                            <div class="attribute-stat"><span class="attribute-stat-label">Mental</span><div class="attribute-bar"><div class="attribute-bar-fill mental" style="width: ${mentalRating * 20}%"></div></div><span class="attribute-stat-value">${mentalRating.toFixed(1)}</span></div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    } catch (error) {}
}

async function loadSettingsUI() {
    updatePWAStatus();
}

async function loadPlayersForDropdowns() {
    try {
        state.players = await PROSPECT_DB.getAll('players');
    } catch (error) {}
}


// ============================================
// Theme Functions
// ============================================

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(nextTheme);
    state.theme = nextTheme;
    PROSPECT_DB.setSetting('theme', nextTheme);
    if (elements.themeSelect) elements.themeSelect.value = nextTheme;
}

function applyTheme(theme) {
    if (theme === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', systemTheme);
    } else {
        document.documentElement.setAttribute('data-theme', theme);
    }
}

function setupTheme() {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (state.theme === 'system') applyTheme('system');
    });
}

// ============================================
// Sidebar Functions
// ============================================

function toggleSidebar() {
    elements.sidebar?.classList.toggle('active');
    if (window.innerWidth <= 768) {
        document.body.style.overflow = elements.sidebar?.classList.contains('active') ? 'hidden' : '';
    }
}

function closeSidebar() {
    elements.sidebar?.classList.remove('active');
    document.body.style.overflow = '';
}

// ============================================
// PWA Functions
// ============================================

let deferredPrompt;

function setupPWA() {
    updatePWAStatus();
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        updatePWAStatus();
    });
    window.addEventListener('appinstalled', () => {
        deferredPrompt = null;
        updatePWAStatus();
    });
}

function updatePWAStatus() {
    const pwaStatus = document.getElementById('pwa-status');
    const pwaText = document.getElementById('pwa-text');
    const installBtn = document.getElementById('install-btn');
    
    if (!pwaStatus || !pwaText) return;
    
    if (window.matchMedia('(display-mode: standalone)').matches) {
        pwaText.textContent = 'Installed';
        if (installBtn) installBtn.style.display = 'none';
        return;
    }
    
    if (deferredPrompt) {
        pwaText.textContent = 'Available to install';
        if (installBtn) installBtn.style.display = 'block';
    } else {
        pwaText.textContent = 'Not installed';
        if (installBtn) installBtn.style.display = 'none';
    }
}

async function installPWA() {
    if (!deferredPrompt) {
        showToast('Install prompt not available', 'error');
        return;
    }
    
    try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') showToast('App will be installed', 'success');
        deferredPrompt = null;
        updatePWAStatus();
    } catch (error) {
        showToast('Failed to install app', 'error');
    }
}

// ============================================
// Export/Import Functions
// ============================================

async function exportData() {
    try {
        const data = await PROSPECT_DB.exportAllData();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `prospect-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast('Data exported successfully', 'success');
    } catch (error) {
        showToast('Failed to export data', 'error');
    }
}

async function handleImport(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    try {
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const data = JSON.parse(e.target.result);
                await PROSPECT_DB.importData(data);
                showToast('Data imported successfully', 'success');
                await loadInitialData();
                navigateTo(state.currentSection);
                event.target.value = '';
            } catch (error) {
                showToast('Invalid import file', 'error');
            }
        };
        reader.readAsText(file);
    } catch (error) {
        showToast('Failed to read file', 'error');
    }
}

async function clearAllData() {
    try {
        await Promise.all([
            PROSPECT_DB.clearAll('players'),
            PROSPECT_DB.clearAll('reports'),
            PROSPECT_DB.clearAll('matches'),
            PROSPECT_DB.clearAll('notes'),
            PROSPECT_DB.clearAll('activity')
        ]);
    } catch (error) {
        throw error;
    }
}

// ============================================
// Utility Functions
// ============================================

function getInitials(name) {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

function formatDate(date) {
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} min ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} hour${Math.floor(diff / 3600000) > 1 ? 's' : ''} ago`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)} day${Math.floor(diff / 86400000) > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: now.getFullYear() !== date.getFullYear() ? 'numeric' : undefined });
}

function calculateAge(dob) {
    if (!dob) return null;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
}

function calculateAverageRating(attributes) {
    if (!attributes) return 0;
    const ratings = Object.values(attributes).filter(r => typeof r === 'number' && r > 0);
    if (ratings.length === 0) return 0;
    return ratings.reduce((acc, val) => acc + val, 0) / ratings.length;
}

function calculateCategoryRating(attributes, category) {
    if (!attributes) return 0;
    const categoryAttributes = {
        technical: ['firstTouch', 'ballControl', 'passing', 'dribbling', 'shooting', 'crossing', 'heading'],
        tactical: ['positioning', 'decisionMaking', 'spatialAwareness', 'movementOffBall', 'defensiveAwareness', 'gameIntelligence'],
        physical: ['acceleration', 'speed', 'strength', 'stamina', 'agility', 'balance'],
        mental: ['workRate', 'concentration', 'confidence', 'composure', 'leadership', 'determination']
    };
    const attrs = categoryAttributes[category] || [];
    const ratings = attrs.map(a => attributes[a]).filter(r => typeof r === 'number' && r > 0);
    if (ratings.length === 0) return 0;
    return ratings.reduce((acc, val) => acc + val, 0) / ratings.length;
}

function calculateAverageReportRating(reports) {
    if (!reports || reports.length === 0) return 0;
    const ratings = reports.map(r => calculateAverageRating(r.attributes));
    return ratings.reduce((acc, val) => acc + val, 0) / ratings.length;
}

function calculateAverageCategoryRating(reports, category) {
    if (!reports || reports.length === 0) return 0;
    const ratings = reports.map(r => calculateCategoryRating(r.attributes, category));
    return ratings.reduce((acc, val) => acc + val, 0) / ratings.length;
}

// ============================================
// Toast Notifications
// ============================================

function showToast(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icons = {
        success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
        error: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
        info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'
    };
    
    toast.innerHTML = `
        <div class="toast-icon">${icons[type] || icons.info}</div>
        <div class="toast-message">${message}</div>
        <button class="toast-close" onclick="this.parentElement.remove()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
        </button>
    `;
    
    elements.toastContainer?.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 300); }, duration);
}

// ============================================
// Confirm Modal
// ============================================

let confirmCallback = null;

function showConfirmModal(title, message, callback) {
    confirmCallback = callback;
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-overlay"></div>
        <div class="modal-content modal-sm">
            <div class="modal-header">
                <h2>${title}</h2>
                <button class="modal-close" onclick="closeConfirmModal()">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                </button>
            </div>
            <div class="modal-body">
                <p>${message}</p>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="closeConfirmModal()">Cancel</button>
                <button type="button" class="btn btn-danger" onclick="confirmAction()">Confirm</button>
            </div>
        </div>
    `;
    elements.modalContainer?.appendChild(modal);
}

function closeConfirmModal() {
    confirmCallback = null;
    elements.modalContainer.innerHTML = '';
}

function confirmAction() {
    if (confirmCallback) confirmCallback();
    confirmCallback = null;
    closeConfirmModal();
}

// ============================================
// Delete Confirmation
// ============================================

function confirmDelete(id, store, type) {
    showConfirmModal(
        `Delete ${type.charAt(0).toUpperCase() + type.slice(1)}`,
        `Are you sure you want to delete this ${type}? This action cannot be undone.`,
        async () => {
            try {
                await PROSPECT_DB.remove(store, id);
                showToast(`${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully`, 'success');
                navigateTo(store);
            } catch (error) {
                showToast(`Failed to delete ${type}`, 'error');
            }
        }
    );
}

// ============================================
// Add New Handler
// ============================================

function handleAddNew() {
    const handlers = {
        dashboard: () => showPlayerModal(),
        players: () => showPlayerModal(),
        scouting: () => showReportModal(),
        notebook: () => showNoteModal(),
        matches: () => showMatchModal()
    };
    const handler = handlers[state.currentSection] || handlers.dashboard;
    handler();
}

// ============================================
// Global Functions for HTML
// ============================================

window.navigateTo = navigateTo;
window.showPlayerModal = showPlayerModal;
window.showReportModal = showReportModal;
window.showNoteModal = showNoteModal;
window.showMatchModal = showMatchModal;
window.closeConfirmModal = closeConfirmModal;
window.confirmAction = confirmAction;


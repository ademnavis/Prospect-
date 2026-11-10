// PROSPECT - Football Scouting Notebook
// Players Module

// Player Modal Functions
function showPlayerModal(playerId = null) {
    if (playerId) {
        editPlayer(playerId);
    } else {
        createPlayerModal();
    }
}

function createPlayerModal() {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-overlay"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h2>Add Player</h2>
                <button class="modal-close" onclick="closePlayerModal()">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                </button>
            </div>
            <div class="modal-body">
                <form id="player-form" class="form">
                    <div class="form-group">
                        <label for="player-first-name">First Name *</label>
                        <input type="text" id="player-first-name" required>
                    </div>
                    <div class="form-group">
                        <label for="player-last-name">Last Name *</label>
                        <input type="text" id="player-last-name" required>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="player-dob">Date of Birth</label>
                            <input type="date" id="player-dob">
                        </div>
                        <div class="form-group">
                            <label for="player-age">Age</label>
                            <input type="number" id="player-age" min="12" max="50">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="player-nationality">Nationality</label>
                            <input type="text" id="player-nationality" list="nationalities">
                            <datalist id="nationalities">
                                <option value="English"><option value="Spanish"><option value="French"><option value="German">
                                <option value="Italian"><option value="Brazilian"><option value="Argentinian"><option value="Dutch">
                                <option value="Portuguese"><option value="Belgian">
                            </datalist>
                        </div>
                        <div class="form-group">
                            <label for="player-height">Height (cm)</label>
                            <input type="number" id="player-height" min="150" max="220">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="player-primary-position">Primary Position *</label>
                            <select id="player-primary-position" required>
                                <option value="">Select Position</option>
                                <option value="GK">Goalkeeper (GK)</option>
                                <option value="CB">Centre Back (CB)</option>
                                <option value="LB">Left Back (LB)</option>
                                <option value="RB">Right Back (RB)</option>
                                <option value="WB">Wing Back (WB)</option>
                                <option value="DM">Defensive Midfielder (DM)</option>
                                <option value="CM">Central Midfielder (CM)</option>
                                <option value="AM">Attacking Midfielder (AM)</option>
                                <option value="LW">Left Winger (LW)</option>
                                <option value="RW">Right Winger (RW)</option>
                                <option value="ST">Striker (ST)</option>
                                <option value="CF">Centre Forward (CF)</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="player-secondary-position">Secondary Position</label>
                            <select id="player-secondary-position">
                                <option value="">None</option>
                                <option value="GK">Goalkeeper (GK)</option>
                                <option value="CB">Centre Back (CB)</option>
                                <option value="LB">Left Back (LB)</option>
                                <option value="RB">Right Back (RB)</option>
                                <option value="WB">Wing Back (WB)</option>
                                <option value="DM">Defensive Midfielder (DM)</option>
                                <option value="CM">Central Midfielder (CM)</option>
                                <option value="AM">Attacking Midfielder (AM)</option>
                                <option value="LW">Left Winger (LW)</option>
                                <option value="RW">Right Winger (RW)</option>
                                <option value="ST">Striker (ST)</option>
                                <option value="CF">Centre Forward (CF)</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="player-preferred-foot">Preferred Foot</label>
                            <select id="player-preferred-foot">
                                <option value="">Select</option>
                                <option value="Right">Right</option>
                                <option value="Left">Left</option>
                                <option value="Both">Both</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="player-identification-number">ID Number</label>
                            <input type="text" id="player-identification-number" placeholder="Scouting ID">
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="player-club">Club/Academy</label>
                        <input type="text" id="player-club" list="clubs">
                        <datalist id="clubs">
                            <option value="Manchester United"><option value="Manchester City"><option value="Liverpool">
                            <option value="Arsenal"><option value="Chelsea"><option value="Real Madrid"><option value="Barcelona">
                            <option value="Bayern Munich"><option value="Juventus"><option value="PSG">
                        </datalist>
                    </div>
                    <div class="form-group">
                        <label for="player-current-team">Current Team</label>
                        <input type="text" id="player-current-team">
                    </div>
                    <div class="form-group">
                        <label for="player-notes">General Notes</label>
                        <textarea id="player-notes" rows="4" placeholder="Additional information..."></textarea>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="closePlayerModal()">Cancel</button>
                <button type="button" class="btn btn-primary" onclick="savePlayer()">Save Player</button>
            </div>
        </div>
    `;
    
    document.getElementById('modal-container').appendChild(modal);
}

async function editPlayer(playerId) {
    try {
        const player = await PROSPECT_DB.getById('players', playerId);
        if (!player) {
            showToast('Player not found', 'error');
            return;
        }
        
        state.currentPlayer = player;
        
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Edit Player</h2>
                    <button class="modal-close" onclick="closePlayerModal()">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                    </button>
                </div>
                <div class="modal-body">
                    <form id="player-form" class="form">
                        <input type="hidden" id="player-id" value="${player.id}">
                        <div class="form-group">
                            <label for="player-first-name">First Name *</label>
                            <input type="text" id="player-first-name" value="${player.firstName || ''}" required>
                        </div>
                        <div class="form-group">
                            <label for="player-last-name">Last Name *</label>
                            <input type="text" id="player-last-name" value="${player.lastName || ''}" required>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="player-dob">Date of Birth</label>
                                <input type="date" id="player-dob" value="${player.dob || ''}">
                            </div>
                            <div class="form-group">
                                <label for="player-age">Age</label>
                                <input type="number" id="player-age" min="12" max="50" value="${player.age || ''}">
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="player-nationality">Nationality</label>
                                <input type="text" id="player-nationality" value="${player.nationality || ''}" list="nationalities">
                                <datalist id="nationalities">
                                    <option value="English"><option value="Spanish"><option value="French"><option value="German">
                                    <option value="Italian"><option value="Brazilian"><option value="Argentinian"><option value="Dutch">
                                    <option value="Portuguese"><option value="Belgian">
                                </datalist>
                            </div>
                            <div class="form-group">
                                <label for="player-height">Height (cm)</label>
                                <input type="number" id="player-height" min="150" max="220" value="${player.height || ''}">
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="player-primary-position">Primary Position *</label>
                                <select id="player-primary-position" required>
                                    <option value="">Select Position</option>
                                    <option value="GK" ${player.position === 'GK' ? 'selected' : ''}>Goalkeeper (GK)</option>
                                    <option value="CB" ${player.position === 'CB' ? 'selected' : ''}>Centre Back (CB)</option>
                                    <option value="LB" ${player.position === 'LB' ? 'selected' : ''}>Left Back (LB)</option>
                                    <option value="RB" ${player.position === 'RB' ? 'selected' : ''}>Right Back (RB)</option>
                                    <option value="WB" ${player.position === 'WB' ? 'selected' : ''}>Wing Back (WB)</option>
                                    <option value="DM" ${player.position === 'DM' ? 'selected' : ''}>Defensive Midfielder (DM)</option>
                                    <option value="CM" ${player.position === 'CM' ? 'selected' : ''}>Central Midfielder (CM)</option>
                                    <option value="AM" ${player.position === 'AM' ? 'selected' : ''}>Attacking Midfielder (AM)</option>
                                    <option value="LW" ${player.position === 'LW' ? 'selected' : ''}>Left Winger (LW)</option>
                                    <option value="RW" ${player.position === 'RW' ? 'selected' : ''}>Right Winger (RW)</option>
                                    <option value="ST" ${player.position === 'ST' ? 'selected' : ''}>Striker (ST)</option>
                                    <option value="CF" ${player.position === 'CF' ? 'selected' : ''}>Centre Forward (CF)</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="player-secondary-position">Secondary Position</label>
                                <select id="player-secondary-position">
                                    <option value="">None</option>
                                    <option value="GK" ${player.secondaryPosition === 'GK' ? 'selected' : ''}>Goalkeeper (GK)</option>
                                    <option value="CB" ${player.secondaryPosition === 'CB' ? 'selected' : ''}>Centre Back (CB)</option>
                                    <option value="LB" ${player.secondaryPosition === 'LB' ? 'selected' : ''}>Left Back (LB)</option>
                                    <option value="RB" ${player.secondaryPosition === 'RB' ? 'selected' : ''}>Right Back (RB)</option>
                                    <option value="WB" ${player.secondaryPosition === 'WB' ? 'selected' : ''}>Wing Back (WB)</option>
                                    <option value="DM" ${player.secondaryPosition === 'DM' ? 'selected' : ''}>Defensive Midfielder (DM)</option>
                                    <option value="CM" ${player.secondaryPosition === 'CM' ? 'selected' : ''}>Central Midfielder (CM)</option>
                                    <option value="AM" ${player.secondaryPosition === 'AM' ? 'selected' : ''}>Attacking Midfielder (AM)</option>
                                    <option value="LW" ${player.secondaryPosition === 'LW' ? 'selected' : ''}>Left Winger (LW)</option>
                                    <option value="RW" ${player.secondaryPosition === 'RW' ? 'selected' : ''}>Right Winger (RW)</option>
                                    <option value="ST" ${player.secondaryPosition === 'ST' ? 'selected' : ''}>Striker (ST)</option>
                                    <option value="CF" ${player.secondaryPosition === 'CF' ? 'selected' : ''}>Centre Forward (CF)</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="player-preferred-foot">Preferred Foot</label>
                                <select id="player-preferred-foot">
                                    <option value="">Select</option>
                                    <option value="Right" ${player.preferredFoot === 'Right' ? 'selected' : ''}>Right</option>
                                    <option value="Left" ${player.preferredFoot === 'Left' ? 'selected' : ''}>Left</option>
                                    <option value="Both" ${player.preferredFoot === 'Both' ? 'selected' : ''}>Both</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="player-identification-number">ID Number</label>
                                <input type="text" id="player-identification-number" value="${player.identificationNumber || ''}" placeholder="Scouting ID">
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="player-club">Club/Academy</label>
                            <input type="text" id="player-club" value="${player.club || ''}" list="clubs">
                            <datalist id="clubs">
                                <option value="Manchester United"><option value="Manchester City"><option value="Liverpool">
                                <option value="Arsenal"><option value="Chelsea"><option value="Real Madrid"><option value="Barcelona">
                                <option value="Bayern Munich"><option value="Juventus"><option value="PSG">
                            </datalist>
                        </div>
                        <div class="form-group">
                            <label for="player-current-team">Current Team</label>
                            <input type="text" id="player-current-team" value="${player.currentTeam || ''}">
                        </div>
                        <div class="form-group">
                            <label for="player-notes">General Notes</label>
                            <textarea id="player-notes" rows="4" placeholder="Additional information...">${player.notes || ''}</textarea>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" onclick="closePlayerModal()">Cancel</button>
                    <button type="button" class="btn btn-primary" onclick="savePlayer()">Save Player</button>
                </div>
            </div>
        `;
        
        document.getElementById('modal-container').appendChild(modal);
    } catch (error) {
        showToast('Failed to load player', 'error');
    }
}

async function savePlayer() {
    try {
        const playerId = document.getElementById('player-id')?.value;
        const firstName = document.getElementById('player-first-name').value.trim();
        const lastName = document.getElementById('player-last-name').value.trim();
        const dob = document.getElementById('player-dob').value;
        const age = document.getElementById('player-age').value ? parseInt(document.getElementById('player-age').value) : null;
        const nationality = document.getElementById('player-nationality').value.trim();
        const height = document.getElementById('player-height').value ? parseInt(document.getElementById('player-height').value) : null;
        const position = document.getElementById('player-primary-position').value;
        const secondaryPosition = document.getElementById('player-secondary-position').value;
        const preferredFoot = document.getElementById('player-preferred-foot').value;
        const identificationNumber = document.getElementById('player-identification-number').value.trim();
        const club = document.getElementById('player-club').value.trim();
        const currentTeam = document.getElementById('player-current-team').value.trim();
        const notes = document.getElementById('player-notes').value.trim();
        
        if (!firstName || !lastName || !position) {
            showToast('Please fill in required fields', 'error');
            return;
        }
        
        const playerData = {
            name: `${firstName} ${lastName}`,
            firstName,
            lastName,
            dob,
            age,
            nationality,
            height,
            position,
            secondaryPosition,
            preferredFoot,
            identificationNumber,
            club,
            currentTeam,
            notes
        };
        
        if (playerId) {
            await PROSPECT_DB.update('players', playerId, playerData);
            showToast('Player updated successfully', 'success');
        } else {
            await PROSPECT_DB.create('players', playerData);
            showToast('Player created successfully', 'success');
        }
        
        closePlayerModal();
        await PROSPECT_APP.loadPlayersForDropdowns();
        navigateTo('players');
    } catch (error) {
        showToast('Failed to save player', 'error');
    }
}

function closePlayerModal() {
    document.getElementById('modal-container').innerHTML = '';
    state.currentPlayer = null;
}

async function viewPlayer(playerId) {
    try {
        const player = await PROSPECT_DB.getById('players', playerId);
        if (!player) {
            showToast('Player not found', 'error');
            return;
        }
        
        state.currentPlayer = player;
        
        const modal = document.createElement('div');
        modal.className = 'modal active';
        const initials = getInitials(player.name);
        const age = player.age || calculateAge(player.dob);
        const height = player.height ? `${player.height}cm` : 'N/A';
        const foot = player.preferredFoot || 'N/A';
        
        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Player Profile</h2>
                    <button class="modal-close" onclick="closePlayerModal()">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="player-profile">
                        <div class="player-profile-header">
                            <div class="player-profile-avatar">${initials}</div>
                            <div class="player-profile-info">
                                <h3>${player.name}</h3>
                                <span class="badge">${player.position || 'N/A'}</span>
                                <p>${player.club || 'N/A'}</p>
                            </div>
                        </div>
                        <div class="player-profile-details">
                            <div class="player-profile-section">
                                <h4>Personal Information</h4>
                                <div class="player-detail"><span>Date of Birth:</span><span>${player.dob ? new Date(player.dob).toLocaleDateString() : 'N/A'}</span></div>
                                <div class="player-detail"><span>Age:</span><span>${age || 'N/A'}</span></div>
                                <div class="player-detail"><span>Nationality:</span><span>${player.nationality || 'N/A'}</span></div>
                                <div class="player-detail"><span>Height:</span><span>${height}</span></div>
                                <div class="player-detail"><span>Preferred Foot:</span><span>${foot}</span></div>
                                <div class="player-detail"><span>ID Number:</span><span>${player.identificationNumber || 'N/A'}</span></div>
                            </div>
                            <div class="player-profile-section">
                                <h4>Position</h4>
                                <div class="player-detail"><span>Primary:</span><span>${player.position || 'N/A'}</span></div>
                                <div class="player-detail"><span>Secondary:</span><span>${player.secondaryPosition || 'N/A'}</span></div>
                            </div>
                            <div class="player-profile-section">
                                <h4>Team Information</h4>
                                <div class="player-detail"><span>Club/Academy:</span><span>${player.club || 'N/A'}</span></div>
                                <div class="player-detail"><span>Current Team:</span><span>${player.currentTeam || 'N/A'}</span></div>
                            </div>
                            ${player.notes ? `<div class="player-profile-section"><h4>Notes</h4><p>${player.notes}</p></div>` : ''}
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" onclick="closePlayerModal()">Close</button>
                    <button type="button" class="btn btn-primary" onclick="editPlayer('${player.id}')">Edit</button>
                </div>
            </div>
        `;
        
        document.getElementById('modal-container').appendChild(modal);
    } catch (error) {
        showToast('Failed to load player profile', 'error');
    }
}

// Global functions
window.closePlayerModal = closePlayerModal;
window.editPlayer = editPlayer;
window.viewPlayer = viewPlayer;
window.savePlayer = savePlayer;

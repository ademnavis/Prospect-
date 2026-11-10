// PROSPECT - Football Scouting Notebook
// Matches Module

// Match Modal Functions
function showMatchModal(matchId = null) {
    if (matchId) {
        editMatch(matchId);
    } else {
        createMatchModal();
    }
}

function createMatchModal() {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-overlay"></div>
        <div class="modal-content modal-lg">
            <div class="modal-header">
                <h2>New Match Observation</h2>
                <button class="modal-close" onclick="closeMatchModal()">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                </button>
            </div>
            <div class="modal-body">
                <form id="match-form" class="form">
                    <div class="form-section">
                        <h3>Match Information</h3>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="match-opponent">Opponent *</label>
                                <input type="text" id="match-opponent" required>
                            </div>
                            <div class="form-group">
                                <label for="match-competition">Competition</label>
                                <input type="text" id="match-competition" list="competitions">
                                <datalist id="competitions">
                                    <option value="Premier League"><option value="Champions League"><option value="FA Cup">
                                    <option value="League Cup"><option value="Friendly"><option value="Youth League">
                                    <option value="Academy Match">
                                </datalist>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="match-date">Date</label>
                                <input type="date" id="match-date" value="${new Date().toISOString().split('T')[0]}">
                            </div>
                            <div class="form-group">
                                <label for="match-venue">Venue</label>
                                <input type="text" id="match-venue">
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-section">
                        <h3>Observed Player</h3>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="match-player">Player *</label>
                                <select id="match-player" required>
                                    <option value="">Select Player</option>
                                    ${PROSPECT_APP.state.players.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="match-position-played">Position Played</label>
                                <select id="match-position-played">
                                    <option value="">Same as Primary</option>
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
                                <label for="match-minutes-played">Minutes Played</label>
                                <input type="number" id="match-minutes-played" min="0" max="120" placeholder="90">
                            </div>
                            <div class="form-group">
                                <label for="match-rating">Performance Rating</label>
                                <select id="match-rating">
                                    <option value="">Rate</option>
                                    <option value="1">1 - Poor</option>
                                    <option value="2">2 - Weak</option>
                                    <option value="3">3 - Average</option>
                                    <option value="4">4 - Good</option>
                                    <option value="5">5 - Excellent</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-section">
                        <h3>Match Observations</h3>
                        <div class="form-group">
                            <label for="match-key-observations">Key Observations</label>
                            <textarea id="match-key-observations" rows="3" placeholder="Main observations from the match..."></textarea>
                        </div>
                        <div class="form-group">
                            <label for="match-strengths">Strengths Shown</label>
                            <textarea id="match-strengths" rows="3" placeholder="What the player did well..."></textarea>
                        </div>
                        <div class="form-group">
                            <label for="match-weaknesses">Weaknesses Shown</label>
                            <textarea id="match-weaknesses" rows="3" placeholder="Areas needing improvement..."></textarea>
                        </div>
                        <div class="form-group">
                            <label for="match-areas-for-improvement">Areas for Improvement</label>
                            <textarea id="match-areas-for-improvement" rows="3" placeholder="Specific areas to work on..."></textarea>
                        </div>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="closeMatchModal()">Cancel</button>
                <button type="button" class="btn btn-primary" onclick="saveMatch()">Save Observation</button>
            </div>
        </div>
    `;
    
    document.getElementById('modal-container').appendChild(modal);
}

async function editMatch(matchId) {
    try {
        const match = await PROSPECT_DB.getById('matches', matchId);
        if (!match) {
            showToast('Match not found', 'error');
            return;
        }
        
        state.currentMatch = match;
        createMatchModal();
        
        // Populate form
        document.getElementById('match-opponent').value = match.opponent || '';
        document.getElementById('match-competition').value = match.competition || '';
        document.getElementById('match-date').value = match.date || match.createdAt.split('T')[0];
        document.getElementById('match-venue').value = match.venue || '';
        document.getElementById('match-player').value = match.playerId || '';
        document.getElementById('match-position-played').value = match.positionPlayed || '';
        document.getElementById('match-minutes-played').value = match.minutesPlayed || '';
        document.getElementById('match-rating').value = match.rating || '';
        document.getElementById('match-key-observations').value = match.keyObservations || '';
        document.getElementById('match-strengths').value = match.strengths || '';
        document.getElementById('match-weaknesses').value = match.weaknesses || '';
        document.getElementById('match-areas-for-improvement').value = match.areasForImprovement || '';
        
        // Add hidden ID field
        const form = document.getElementById('match-form');
        const idInput = document.createElement('input');
        idInput.type = 'hidden';
        idInput.id = 'match-id';
        idInput.value = match.id;
        form.prepend(idInput);
        
    } catch (error) {
        showToast('Failed to load match', 'error');
    }
}

async function saveMatch() {
    try {
        const matchId = document.getElementById('match-id')?.value;
        const opponent = document.getElementById('match-opponent').value.trim();
        const competition = document.getElementById('match-competition').value.trim();
        const date = document.getElementById('match-date').value;
        const venue = document.getElementById('match-venue').value.trim();
        const playerId = document.getElementById('match-player').value;
        const positionPlayed = document.getElementById('match-position-played').value;
        const minutesPlayed = document.getElementById('match-minutes-played').value ? parseInt(document.getElementById('match-minutes-played').value) : null;
        const rating = document.getElementById('match-rating').value ? parseInt(document.getElementById('match-rating').value) : null;
        const keyObservations = document.getElementById('match-key-observations').value.trim();
        const strengths = document.getElementById('match-strengths').value.trim();
        const weaknesses = document.getElementById('match-weaknesses').value.trim();
        const areasForImprovement = document.getElementById('match-areas-for-improvement').value.trim();
        
        if (!opponent || !playerId) {
            showToast('Please fill in required fields', 'error');
            return;
        }
        
        const matchData = {
            opponent,
            competition,
            date,
            venue,
            playerId,
            positionPlayed,
            minutesPlayed,
            rating,
            keyObservations,
            strengths,
            weaknesses,
            areasForImprovement
        };
        
        if (matchId) {
            await PROSPECT_DB.update('matches', matchId, matchData);
            showToast('Match observation updated successfully', 'success');
        } else {
            await PROSPECT_DB.create('matches', matchData);
            showToast('Match observation created successfully', 'success');
        }
        
        closeMatchModal();
        navigateTo('matches');
    } catch (error) {
        showToast('Failed to save match observation', 'error');
    }
}

function closeMatchModal() {
    document.getElementById('modal-container').innerHTML = '';
    state.currentMatch = null;
}

async function viewMatch(matchId) {
    try {
        const match = await PROSPECT_DB.getById('matches', matchId);
        if (!match) {
            showToast('Match not found', 'error');
            return;
        }
        
        state.currentMatch = match;
        const player = PROSPECT_APP.state.players.find(p => p.id === match.playerId);
        const date = new Date(match.date || match.createdAt).toLocaleString();
        const position = match.positionPlayed || (player ? player.position : 'N/A');
        
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content modal-lg">
                <div class="modal-header">
                    <h2>Match Observation</h2>
                    <button class="modal-close" onclick="closeMatchModal()">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="match-view">
                        <div class="match-view-header">
                            <div class="match-view-opponent">${match.opponent}</div>
                            <div class="match-view-info">
                                <span>${match.competition || 'N/A'}</span>
                                <span>${date}</span>
                                <span>${match.venue || 'N/A'}</span>
                            </div>
                        </div>
                        
                        <div class="match-view-player">
                            <div class="match-view-player-avatar">${player ? PROSPECT_APP.getInitials(player.name) : '?'}</div>
                            <div class="match-view-player-info">
                                <h4>${player ? player.name : 'Unknown'}</h4>
                                <p>Position: ${position}</p>
                                <p>Minutes: ${match.minutesPlayed || 'N/A'}</p>
                                ${match.rating ? `<p>Rating: ${match.rating}/5</p>` : ''}
                            </div>
                        </div>
                        
                        ${match.keyObservations ? `<div class="match-view-section"><h4>Key Observations</h4><p>${match.keyObservations}</p></div>` : ''}
                        ${match.strengths ? `<div class="match-view-section"><h4>Strengths</h4><p>${match.strengths}</p></div>` : ''}
                        ${match.weaknesses ? `<div class="match-view-section"><h4>Weaknesses</h4><p>${match.weaknesses}</p></div>` : ''}
                        ${match.areasForImprovement ? `<div class="match-view-section"><h4>Areas for Improvement</h4><p>${match.areasForImprovement}</p></div>` : ''}
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" onclick="closeMatchModal()">Close</button>
                    <button type="button" class="btn btn-primary" onclick="editMatch('${match.id}')">Edit</button>
                </div>
            </div>
        `;
        
        document.getElementById('modal-container').appendChild(modal);
    } catch (error) {
        showToast('Failed to load match', 'error');
    }
}

// Global functions
window.closeMatchModal = closeMatchModal;
window.editMatch = editMatch;
window.viewMatch = viewMatch;
window.saveMatch = saveMatch;

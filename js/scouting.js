// PROSPECT - Football Scouting Notebook
// Scouting Reports Module

// Report Modal Functions
function showReportModal(reportId = null) {
    if (reportId) {
        editReport(reportId);
    } else {
        createReportModal();
    }
}

function createReportModal() {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-overlay"></div>
        <div class="modal-content modal-xl">
            <div class="modal-header">
                <h2>New Scouting Report</h2>
                <button class="modal-close" onclick="closeReportModal()">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                </button>
            </div>
            <div class="modal-body">
                <form id="report-form" class="form">
                    <div class="form-section">
                        <h3>Player Information</h3>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="report-player">Player *</label>
                                <select id="report-player" required>
                                    <option value="">Select Player</option>
                                    ${PROSPECT_APP.state.players.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="report-date">Report Date</label>
                                <input type="date" id="report-date" value="${new Date().toISOString().split('T')[0]}">
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-section technical-section">
                        <h3>Technical Attributes</h3>
                        <div class="attributes-grid">
                            ${['firstTouch', 'ballControl', 'passing', 'dribbling', 'shooting', 'crossing', 'heading'].map(attr => `
                                <div class="attribute-item">
                                    <label>${formatAttributeName(attr)}</label>
                                    <select class="rating-select" data-attribute="${attr}">
                                        <option value="">Rate</option>
                                        <option value="1">1 - Poor</option>
                                        <option value="2">2 - Weak</option>
                                        <option value="3">3 - Average</option>
                                        <option value="4">4 - Good</option>
                                        <option value="5">5 - Excellent</option>
                                    </select>
                                    <textarea class="attribute-notes" data-attribute="${attr}" placeholder="Observations..."></textarea>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="form-section tactical-section">
                        <h3>Tactical Attributes</h3>
                        <div class="attributes-grid">
                            ${['positioning', 'decisionMaking', 'spatialAwareness', 'movementOffBall', 'defensiveAwareness', 'gameIntelligence'].map(attr => `
                                <div class="attribute-item">
                                    <label>${formatAttributeName(attr)}</label>
                                    <select class="rating-select" data-attribute="${attr}">
                                        <option value="">Rate</option>
                                        <option value="1">1 - Poor</option>
                                        <option value="2">2 - Weak</option>
                                        <option value="3">3 - Average</option>
                                        <option value="4">4 - Good</option>
                                        <option value="5">5 - Excellent</option>
                                    </select>
                                    <textarea class="attribute-notes" data-attribute="${attr}" placeholder="Observations..."></textarea>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="form-section physical-section">
                        <h3>Physical Attributes</h3>
                        <div class="attributes-grid">
                            ${['acceleration', 'speed', 'strength', 'stamina', 'agility', 'balance'].map(attr => `
                                <div class="attribute-item">
                                    <label>${formatAttributeName(attr)}</label>
                                    <select class="rating-select" data-attribute="${attr}">
                                        <option value="">Rate</option>
                                        <option value="1">1 - Poor</option>
                                        <option value="2">2 - Weak</option>
                                        <option value="3">3 - Average</option>
                                        <option value="4">4 - Good</option>
                                        <option value="5">5 - Excellent</option>
                                    </select>
                                    <textarea class="attribute-notes" data-attribute="${attr}" placeholder="Observations..."></textarea>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="form-section mental-section">
                        <h3>Mental Attributes</h3>
                        <div class="attributes-grid">
                            ${['workRate', 'concentration', 'confidence', 'composure', 'leadership', 'determination'].map(attr => `
                                <div class="attribute-item">
                                    <label>${formatAttributeName(attr)}</label>
                                    <select class="rating-select" data-attribute="${attr}">
                                        <option value="">Rate</option>
                                        <option value="1">1 - Poor</option>
                                        <option value="2">2 - Weak</option>
                                        <option value="3">3 - Average</option>
                                        <option value="4">4 - Good</option>
                                        <option value="5">5 - Excellent</option>
                                    </select>
                                    <textarea class="attribute-notes" data-attribute="${attr}" placeholder="Observations..."></textarea>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="form-section">
                        <h3>Overall Assessment</h3>
                        <div class="form-group">
                            <label for="report-strengths">Strengths</label>
                            <textarea id="report-strengths" rows="3" placeholder="List the player's main strengths..."></textarea>
                        </div>
                        <div class="form-group">
                            <label for="report-weaknesses">Weaknesses</label>
                            <textarea id="report-weaknesses" rows="3" placeholder="List areas for improvement..."></textarea>
                        </div>
                        <div class="form-group">
                            <label for="report-summary">Summary</label>
                            <textarea id="report-summary" rows="4" placeholder="Overall assessment and recommendations..."></textarea>
                        </div>
                        <div class="form-group">
                            <label for="report-recommendation">Recommendation</label>
                            <select id="report-recommendation">
                                <option value="">Select Recommendation</option>
                                <option value="Sign Immediately">Sign Immediately</option>
                                <option value="Strongly Recommend">Strongly Recommend</option>
                                <option value="Recommend">Recommend</option>
                                <option value="Consider">Consider</option>
                                <option value="Not Recommended">Not Recommended</option>
                            </select>
                        </div>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="closeReportModal()">Cancel</button>
                <button type="button" class="btn btn-primary" onclick="saveReport()">Save Report</button>
            </div>
        </div>
    `;
    
    document.getElementById('modal-container').appendChild(modal);
}

function formatAttributeName(name) {
    return name.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
}

async function editReport(reportId) {
    try {
        const report = await PROSPECT_DB.getById('reports', reportId);
        if (!report) {
            showToast('Report not found', 'error');
            return;
        }
        
        state.currentReport = report;
        createReportModal();
        
        // Populate form
        document.getElementById('report-player').value = report.playerId;
        document.getElementById('report-date').value = report.date || report.createdAt.split('T')[0];
        
        // Populate attributes
        const attributeKeys = ['firstTouch', 'ballControl', 'passing', 'dribbling', 'shooting', 'crossing', 'heading',
            'positioning', 'decisionMaking', 'spatialAwareness', 'movementOffBall', 'defensiveAwareness', 'gameIntelligence',
            'acceleration', 'speed', 'strength', 'stamina', 'agility', 'balance',
            'workRate', 'concentration', 'confidence', 'composure', 'leadership', 'determination'];
        
        attributeKeys.forEach(key => {
            const select = document.querySelector(`select[data-attribute="${key}"]`);
            const textarea = document.querySelector(`textarea[data-attribute="${key}"]`);
            if (select && report.attributes && report.attributes[key]) {
                select.value = report.attributes[key];
            }
            if (textarea && report.attributeNotes && report.attributeNotes[key]) {
                textarea.value = report.attributeNotes[key];
            }
        });
        
        // Populate assessment
        document.getElementById('report-strengths').value = report.strengths || '';
        document.getElementById('report-weaknesses').value = report.weaknesses || '';
        document.getElementById('report-summary').value = report.summary || '';
        document.getElementById('report-recommendation').value = report.recommendation || '';
        
        // Add hidden ID field
        const form = document.getElementById('report-form');
        const idInput = document.createElement('input');
        idInput.type = 'hidden';
        idInput.id = 'report-id';
        idInput.value = report.id;
        form.prepend(idInput);
        
    } catch (error) {
        showToast('Failed to load report', 'error');
    }
}

async function saveReport() {
    try {
        const reportId = document.getElementById('report-id')?.value;
        const playerId = document.getElementById('report-player').value;
        const date = document.getElementById('report-date').value;
        const player = PROSPECT_APP.state.players.find(p => p.id === playerId);
        
        if (!playerId || !date) {
            showToast('Please fill in required fields', 'error');
            return;
        }
        
        // Collect attributes
        const attributeKeys = ['firstTouch', 'ballControl', 'passing', 'dribbling', 'shooting', 'crossing', 'heading',
            'positioning', 'decisionMaking', 'spatialAwareness', 'movementOffBall', 'defensiveAwareness', 'gameIntelligence',
            'acceleration', 'speed', 'strength', 'stamina', 'agility', 'balance',
            'workRate', 'concentration', 'confidence', 'composure', 'leadership', 'determination'];
        
        const attributes = {};
        const attributeNotes = {};
        
        attributeKeys.forEach(key => {
            const select = document.querySelector(`select[data-attribute="${key}"]`);
            const textarea = document.querySelector(`textarea[data-attribute="${key}"]`);
            if (select && select.value) {
                attributes[key] = parseInt(select.value);
            }
            if (textarea && textarea.value) {
                attributeNotes[key] = textarea.value;
            }
        });
        
        const reportData = {
            playerId,
            playerName: player ? player.name : 'Unknown',
            date,
            attributes,
            attributeNotes,
            strengths: document.getElementById('report-strengths').value.trim(),
            weaknesses: document.getElementById('report-weaknesses').value.trim(),
            summary: document.getElementById('report-summary').value.trim(),
            recommendation: document.getElementById('report-recommendation').value
        };
        
        if (reportId) {
            await PROSPECT_DB.update('reports', reportId, reportData);
            showToast('Report updated successfully', 'success');
        } else {
            await PROSPECT_DB.create('reports', reportData);
            showToast('Report created successfully', 'success');
        }
        
        closeReportModal();
        navigateTo('scouting');
    } catch (error) {
        showToast('Failed to save report', 'error');
    }
}

function closeReportModal() {
    document.getElementById('modal-container').innerHTML = '';
    state.currentReport = null;
}

async function viewReport(reportId) {
    try {
        const report = await PROSPECT_DB.getById('reports', reportId);
        if (!report) {
            showToast('Report not found', 'error');
            return;
        }
        
        state.currentReport = report;
        const player = PROSPECT_APP.state.players.find(p => p.id === report.playerId);
        const date = new Date(report.date || report.createdAt).toLocaleDateString();
        const avgRating = PROSPECT_APP.calculateAverageRating(report.attributes);
        
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content modal-lg">
                <div class="modal-header">
                    <h2>Scouting Report</h2>
                    <button class="modal-close" onclick="closeReportModal()">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="report-view">
                        <div class="report-view-header">
                            <div class="report-view-avatar">${player ? PROSPECT_APP.getInitials(player.name) : '?'}</div>
                            <div class="report-view-info">
                                <h3>${player ? player.name : 'Unknown Player'}</h3>
                                <p>${player ? player.position : 'N/A'} - ${player ? player.club : 'N/A'}</p>
                                <p>Report Date: ${date}</p>
                            </div>
                            <div class="report-view-rating">
                                <div class="progress-ring" style="--progress: ${avgRating * 20}; width: 80px; height: 80px;">
                                    <svg class="progress-ring-circle" width="80" height="80" viewBox="0 0 80 80">
                                        <circle class="progress-ring-bg" cx="40" cy="40" r="32"/>
                                        <circle class="progress-ring-progress" cx="40" cy="40" r="32" style="stroke-dasharray: ${avgRating * 20 * 2.01}, 201"/>
                                    </svg>
                                    <div class="progress-ring-text">${avgRating.toFixed(1)}</div>
                                </div>
                                <span>Overall Rating</span>
                            </div>
                        </div>
                        
                        <div class="report-view-section">
                            <h4>Category Ratings</h4>
                            <div class="category-ratings">
                                <div class="category-rating"><span>Technical:</span><span>${PROSPECT_APP.calculateCategoryRating(report.attributes, 'technical').toFixed(1)}</span></div>
                                <div class="category-rating"><span>Tactical:</span><span>${PROSPECT_APP.calculateCategoryRating(report.attributes, 'tactical').toFixed(1)}</span></div>
                                <div class="category-rating"><span>Physical:</span><span>${PROSPECT_APP.calculateCategoryRating(report.attributes, 'physical').toFixed(1)}</span></div>
                                <div class="category-rating"><span>Mental:</span><span>${PROSPECT_APP.calculateCategoryRating(report.attributes, 'mental').toFixed(1)}</span></div>
                            </div>
                        </div>
                        
                        ${report.strengths ? `<div class="report-view-section"><h4>Strengths</h4><p>${report.strengths}</p></div>` : ''}
                        ${report.weaknesses ? `<div class="report-view-section"><h4>Weaknesses</h4><p>${report.weaknesses}</p></div>` : ''}
                        ${report.summary ? `<div class="report-view-section"><h4>Summary</h4><p>${report.summary}</p></div>` : ''}
                        ${report.recommendation ? `<div class="report-view-section"><h4>Recommendation</h4><span class="badge badge-primary">${report.recommendation}</span></div>` : ''}
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" onclick="closeReportModal()">Close</button>
                    <button type="button" class="btn btn-primary" onclick="editReport('${report.id}')">Edit</button>
                </div>
            </div>
        `;
        
        document.getElementById('modal-container').appendChild(modal);
    } catch (error) {
        showToast('Failed to load report', 'error');
    }
}

// Global functions
window.closeReportModal = closeReportModal;
window.editReport = editReport;
window.viewReport = viewReport;
window.saveReport = saveReport;

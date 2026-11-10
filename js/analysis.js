// PROSPECT - Football Scouting Notebook
// Analysis Module

async function viewPlayerAnalysis(playerId) {
    try {
        const player = await PROSPECT_DB.getById('players', playerId);
        if (!player) {
            showToast('Player not found', 'error');
            return;
        }
        
        const reports = await PROSPECT_DB.getAll('reports', 'playerId', playerId);
        if (reports.length === 0) {
            showToast('No reports found for this player', 'error');
            return;
        }
        
        const avgRating = PROSPECT_APP.calculateAverageReportRating(reports);
        const technicalRating = PROSPECT_APP.calculateAverageCategoryRating(reports, 'technical');
        const tacticalRating = PROSPECT_APP.calculateAverageCategoryRating(reports, 'tactical');
        const physicalRating = PROSPECT_APP.calculateAverageCategoryRating(reports, 'physical');
        const mentalRating = PROSPECT_APP.calculateAverageCategoryRating(reports, 'mental');
        
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content modal-xl">
                <div class="modal-header">
                    <h2>Player Analysis: ${player.name}</h2>
                    <button class="modal-close" onclick="closeAnalysisModal()">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="analysis-view">
                        <div class="analysis-view-header">
                            <div class="analysis-view-avatar">${PROSPECT_APP.getInitials(player.name)}</div>
                            <div class="analysis-view-info">
                                <h3>${player.name}</h3>
                                <p>${player.position || 'N/A'} - ${player.club || 'N/A'}</p>
                                <p>Based on ${reports.length} report${reports.length > 1 ? 's' : ''}</p>
                            </div>
                            <div class="analysis-view-rating">
                                <div class="progress-ring" style="--progress: ${avgRating * 20}">
                                    <svg class="progress-ring-circle" width="100" height="100" viewBox="0 0 100 100">
                                        <circle class="progress-ring-bg" cx="50" cy="50" r="42"/>
                                        <circle class="progress-ring-progress" cx="50" cy="50" r="42" style="stroke-dasharray: ${avgRating * 20 * 3.17}, 265"/>
                                    </svg>
                                    <div class="progress-ring-text">${avgRating.toFixed(1)}</div>
                                </div>
                                <span>Overall Rating</span>
                            </div>
                        </div>
                        
                        <div class="analysis-view-sections">
                            <div class="analysis-section">
                                <h4>Technical Attributes</h4>
                                <div class="attribute-bars">
                                    ${['firstTouch', 'ballControl', 'passing', 'dribbling', 'shooting', 'crossing', 'heading'].map(attr => {
                                        const rating = PROSPECT_APP.calculateAverageCategoryRatingForAttribute(reports, attr);
                                        return `<div class="attribute-bar"><span>${formatAttributeName(attr)}:</span><div class="attribute-bar-container"><div class="attribute-bar-fill technical" style="width: ${rating * 20}%"></div></div><span>${rating.toFixed(1)}</span></div>`;
                                    }).join('')}
                                </div>
                                <div class="category-average">
                                    <span>Category Average:</span>
                                    <span class="category-average-value">${technicalRating.toFixed(1)}</span>
                                </div>
                            </div>
                            
                            <div class="analysis-section">
                                <h4>Tactical Attributes</h4>
                                <div class="attribute-bars">
                                    ${['positioning', 'decisionMaking', 'spatialAwareness', 'movementOffBall', 'defensiveAwareness', 'gameIntelligence'].map(attr => {
                                        const rating = PROSPECT_APP.calculateAverageCategoryRatingForAttribute(reports, attr);
                                        return `<div class="attribute-bar"><span>${formatAttributeName(attr)}:</span><div class="attribute-bar-container"><div class="attribute-bar-fill tactical" style="width: ${rating * 20}%"></div></div><span>${rating.toFixed(1)}</span></div>`;
                                    }).join('')}
                                </div>
                                <div class="category-average">
                                    <span>Category Average:</span>
                                    <span class="category-average-value">${tacticalRating.toFixed(1)}</span>
                                </div>
                            </div>
                            
                            <div class="analysis-section">
                                <h4>Physical Attributes</h4>
                                <div class="attribute-bars">
                                    ${['acceleration', 'speed', 'strength', 'stamina', 'agility', 'balance'].map(attr => {
                                        const rating = PROSPECT_APP.calculateAverageCategoryRatingForAttribute(reports, attr);
                                        return `<div class="attribute-bar"><span>${formatAttributeName(attr)}:</span><div class="attribute-bar-container"><div class="attribute-bar-fill physical" style="width: ${rating * 20}%"></div></div><span>${rating.toFixed(1)}</span></div>`;
                                    }).join('')}
                                </div>
                                <div class="category-average">
                                    <span>Category Average:</span>
                                    <span class="category-average-value">${physicalRating.toFixed(1)}</span>
                                </div>
                            </div>
                            
                            <div class="analysis-section">
                                <h4>Mental Attributes</h4>
                                <div class="attribute-bars">
                                    ${['workRate', 'concentration', 'confidence', 'composure', 'leadership', 'determination'].map(attr => {
                                        const rating = PROSPECT_APP.calculateAverageCategoryRatingForAttribute(reports, attr);
                                        return `<div class="attribute-bar"><span>${formatAttributeName(attr)}:</span><div class="attribute-bar-container"><div class="attribute-bar-fill mental" style="width: ${rating * 20}%"></div></div><span>${rating.toFixed(1)}</span></div>`;
                                    }).join('')}
                                </div>
                                <div class="category-average">
                                    <span>Category Average:</span>
                                    <span class="category-average-value">${mentalRating.toFixed(1)}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="analysis-view-summary">
                            <h4>Summary</h4>
                            <div class="summary-categories">
                                <div class="summary-category">
                                    <div class="summary-category-header">
                                        <span>Technical</span>
                                        <span class="summary-category-rating">${technicalRating.toFixed(1)}</span>
                                    </div>
                                    <div class="summary-bar"><div class="summary-bar-fill technical" style="width: ${technicalRating * 20}%"></div></div>
                                </div>
                                <div class="summary-category">
                                    <div class="summary-category-header">
                                        <span>Tactical</span>
                                        <span class="summary-category-rating">${tacticalRating.toFixed(1)}</span>
                                    </div>
                                    <div class="summary-bar"><div class="summary-bar-fill tactical" style="width: ${tacticalRating * 20}%"></div></div>
                                </div>
                                <div class="summary-category">
                                    <div class="summary-category-header">
                                        <span>Physical</span>
                                        <span class="summary-category-rating">${physicalRating.toFixed(1)}</span>
                                    </div>
                                    <div class="summary-bar"><div class="summary-bar-fill physical" style="width: ${physicalRating * 20}%"></div></div>
                                </div>
                                <div class="summary-category">
                                    <div class="summary-category-header">
                                        <span>Mental</span>
                                        <span class="summary-category-rating">${mentalRating.toFixed(1)}</span>
                                    </div>
                                    <div class="summary-bar"><div class="summary-bar-fill mental" style="width: ${mentalRating * 20}%"></div></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" onclick="closeAnalysisModal()">Close</button>
                </div>
            </div>
        `;
        
        document.getElementById('modal-container').appendChild(modal);
    } catch (error) {
        showToast('Failed to load player analysis', 'error');
    }
}

function formatAttributeName(name) {
    return name.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
}

function closeAnalysisModal() {
    document.getElementById('modal-container').innerHTML = '';
}

// Add method to PROSPECT_APP for calculating average rating for a specific attribute
if (!PROSPECT_APP.calculateAverageCategoryRatingForAttribute) {
    PROSPECT_APP.calculateAverageCategoryRatingForAttribute = function(reports, attribute) {
        if (!reports || reports.length === 0) return 0;
        const ratings = reports.map(r => r.attributes && r.attributes[attribute] ? parseInt(r.attributes[attribute]) : 0).filter(r => r > 0);
        if (ratings.length === 0) return 0;
        return ratings.reduce((acc, val) => acc + val, 0) / ratings.length;
    };
}

// Global functions
window.viewPlayerAnalysis = viewPlayerAnalysis;
window.closeAnalysisModal = closeAnalysisModal;

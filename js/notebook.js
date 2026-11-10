// PROSPECT - Football Scouting Notebook
// Notebook Module

// Note Modal Functions
function showNoteModal(noteId = null) {
    if (noteId) {
        editNote(noteId);
    } else {
        createNoteModal();
    }
}

function createNoteModal() {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-overlay"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h2>New Note</h2>
                <button class="modal-close" onclick="closeNoteModal()">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                </button>
            </div>
            <div class="modal-body">
                <form id="note-form" class="form">
                    <div class="form-group">
                        <label for="note-title">Title *</label>
                        <input type="text" id="note-title" required placeholder="Note title...">
                    </div>
                    <div class="form-group">
                        <label for="note-category">Category</label>
                        <select id="note-category">
                            <option value="">None</option>
                            <option value="General">General</option>
                            <option value="Player">Player</option>
                            <option value="Match">Match</option>
                            <option value="Tactical">Tactical</option>
                            <option value="Scouting">Scouting</option>
                            <option value="Observation">Observation</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="note-associated-player">Associated Player</label>
                        <select id="note-associated-player">
                            <option value="">None</option>
                            ${PROSPECT_APP.state.players.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="note-content">Content *</label>
                        <textarea id="note-content" rows="8" required placeholder="Write your notes here..."></textarea>
                    </div>
                    <div class="form-group">
                        <label for="note-tags">Tags</label>
                        <input type="text" id="note-tags" placeholder="Separate tags with commas...">
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="closeNoteModal()">Cancel</button>
                <button type="button" class="btn btn-primary" onclick="saveNote()">Save Note</button>
            </div>
        </div>
    `;
    
    document.getElementById('modal-container').appendChild(modal);
}

async function editNote(noteId) {
    try {
        const note = await PROSPECT_DB.getById('notes', noteId);
        if (!note) {
            showToast('Note not found', 'error');
            return;
        }
        
        state.currentNote = note;
        createNoteModal();
        
        // Populate form
        document.getElementById('note-title').value = note.title || '';
        document.getElementById('note-category').value = note.category || '';
        document.getElementById('note-associated-player').value = note.playerId || '';
        document.getElementById('note-content').value = note.content || '';
        document.getElementById('note-tags').value = note.tags || '';
        
        // Add hidden ID field
        const form = document.getElementById('note-form');
        const idInput = document.createElement('input');
        idInput.type = 'hidden';
        idInput.id = 'note-id';
        idInput.value = note.id;
        form.prepend(idInput);
        
    } catch (error) {
        showToast('Failed to load note', 'error');
    }
}

async function saveNote() {
    try {
        const noteId = document.getElementById('note-id')?.value;
        const title = document.getElementById('note-title').value.trim();
        const category = document.getElementById('note-category').value;
        const playerId = document.getElementById('note-associated-player').value;
        const content = document.getElementById('note-content').value.trim();
        const tags = document.getElementById('note-tags').value.trim();
        
        if (!title || !content) {
            showToast('Please fill in required fields', 'error');
            return;
        }
        
        const noteData = {
            title,
            category,
            playerId,
            content,
            tags
        };
        
        if (noteId) {
            await PROSPECT_DB.update('notes', noteId, noteData);
            showToast('Note updated successfully', 'success');
        } else {
            await PROSPECT_DB.create('notes', noteData);
            showToast('Note created successfully', 'success');
        }
        
        closeNoteModal();
        navigateTo('notebook');
    } catch (error) {
        showToast('Failed to save note', 'error');
    }
}

function closeNoteModal() {
    document.getElementById('modal-container').innerHTML = '';
    state.currentNote = null;
}

async function viewNote(noteId) {
    try {
        const note = await PROSPECT_DB.getById('notes', noteId);
        if (!note) {
            showToast('Note not found', 'error');
            return;
        }
        
        state.currentNote = note;
        const player = note.playerId ? PROSPECT_APP.state.players.find(p => p.id === note.playerId) : null;
        const date = new Date(note.createdAt).toLocaleString();
        const tags = note.tags ? note.tags.split(',').map(t => t.trim()) : [];
        
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h2>${note.title || 'Untitled'}</h2>
                    <button class="modal-close" onclick="closeNoteModal()">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="note-view">
                        <div class="note-view-meta">
                            <span>${date}</span>
                            ${note.category ? `<span class="badge">${note.category}</span>` : ''}
                            ${player ? `<span class="badge badge-info">${player.name}</span>` : ''}
                        </div>
                        <div class="note-view-content">${note.content}</div>
                        ${tags.length > 0 ? `<div class="note-view-tags">${tags.map(tag => `<span class="note-card-tag">${tag}</span>`).join('')}</div>` : ''}
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" onclick="closeNoteModal()">Close</button>
                    <button type="button" class="btn btn-primary" onclick="editNote('${note.id}')">Edit</button>
                </div>
            </div>
        `;
        
        document.getElementById('modal-container').appendChild(modal);
    } catch (error) {
        showToast('Failed to load note', 'error');
    }
}

// Global functions
window.closeNoteModal = closeNoteModal;
window.editNote = editNote;
window.viewNote = viewNote;
window.saveNote = saveNote;

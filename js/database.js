// PROSPECT - Football Scouting Notebook
// Database Module - IndexedDB Operations

const DATABASE_NAME = 'PROSPECT_DB';
const DATABASE_VERSION = 1;

// Store names
const STORE_PLAYERS = 'players';
const STORE_REPORTS = 'reports';
const STORE_MATCHES = 'matches';
const STORE_NOTES = 'notes';
const STORE_SETTINGS = 'settings';
const STORE_ACTIVITY = 'activity';

// Database instance
let db;

// Database schema
const schema = {
    [STORE_PLAYERS]: {
        keyPath: 'id',
        indexes: [
            { name: 'name', keyPath: 'name', unique: false },
            { name: 'position', keyPath: 'position', unique: false },
            { name: 'club', keyPath: 'club', unique: false },
            { name: 'createdAt', keyPath: 'createdAt', unique: false },
            { name: 'updatedAt', keyPath: 'updatedAt', unique: false }
        ]
    },
    [STORE_REPORTS]: {
        keyPath: 'id',
        indexes: [
            { name: 'playerId', keyPath: 'playerId', unique: false },
            { name: 'date', keyPath: 'date', unique: false },
            { name: 'createdAt', keyPath: 'createdAt', unique: false },
            { name: 'updatedAt', keyPath: 'updatedAt', unique: false }
        ]
    },
    [STORE_MATCHES]: {
        keyPath: 'id',
        indexes: [
            { name: 'playerId', keyPath: 'playerId', unique: false },
            { name: 'date', keyPath: 'date', unique: false },
            { name: 'opponent', keyPath: 'opponent', unique: false },
            { name: 'createdAt', keyPath: 'createdAt', unique: false }
        ]
    },
    [STORE_NOTES]: {
        keyPath: 'id',
        indexes: [
            { name: 'title', keyPath: 'title', unique: false },
            { name: 'category', keyPath: 'category', unique: false },
            { name: 'playerId', keyPath: 'playerId', unique: false },
            { name: 'createdAt', keyPath: 'createdAt', unique: false },
            { name: 'updatedAt', keyPath: 'updatedAt', unique: false }
        ]
    },
    [STORE_SETTINGS]: {
        keyPath: 'key'
    },
    [STORE_ACTIVITY]: {
        keyPath: 'id',
        indexes: [
            { name: 'type', keyPath: 'type', unique: false },
            { name: 'timestamp', keyPath: 'timestamp', unique: false }
        ]
    }
};

// Initialize database
async function initDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
        
        request.onerror = (event) => {
            console.error('Database error:', event.target.error);
            reject(event.target.error);
        };
        
        request.onsuccess = (event) => {
            db = event.target.result;
            console.log('Database initialized successfully');
            resolve(db);
        };
        
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            
            // Create object stores
            for (const [storeName, options] of Object.entries(schema)) {
                if (!db.objectStoreNames.contains(storeName)) {
                    const store = db.createObjectStore(storeName, options);
                    
                    // Create indexes
                    if (options.indexes) {
                        options.indexes.forEach(index => {
                            store.createIndex(index.name, index.keyPath, { unique: index.unique });
                        });
                    }
                }
            }
        };
    });
}

// Generate unique ID
function generateId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Get current timestamp
function getTimestamp() {
    return new Date().toISOString();
}

// ============================================
// CRUD Operations
// ============================================

// Create
async function create(storeName, data) {
    return new Promise((resolve, reject) => {
        if (!db) {
            reject(new Error('Database not initialized'));
            return;
        }
        
        const transaction = db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        
        const item = { ...data, id: generateId(), createdAt: getTimestamp(), updatedAt: getTimestamp() };
        
        const request = store.add(item);
        
        request.onsuccess = () => {
            // Add to activity log
            addActivity({
                type: 'create',
                entity: storeName,
                entityId: item.id,
                timestamp: getTimestamp()
            });
            resolve(item);
        };
        
        request.onerror = (event) => {
            reject(event.target.error);
        };
    });
}

// Read - Get by ID
async function getById(storeName, id) {
    return new Promise((resolve, reject) => {
        if (!db) {
            reject(new Error('Database not initialized'));
            return;
        }
        
        const transaction = db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        
        const request = store.get(id);
        
        request.onsuccess = () => {
            resolve(request.result);
        };
        
        request.onerror = (event) => {
            reject(event.target.error);
        };
    });
}

// Read - Get all
async function getAll(storeName, indexName = null, query = null) {
    return new Promise((resolve, reject) => {
        if (!db) {
            reject(new Error('Database not initialized'));
            return;
        }
        
        const transaction = db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        
        let request;
        
        if (indexName && query) {
            const index = store.index(indexName);
            request = index.getAll(query);
        } else if (indexName) {
            const index = store.index(indexName);
            request = index.getAll();
        } else {
            request = store.getAll();
        }
        
        request.onsuccess = () => {
            resolve(request.result);
        };
        
        request.onerror = (event) => {
            reject(event.target.error);
        };
    });
}

// Read - Get all with pagination
async function getAllPaginated(storeName, offset = 0, limit = 10, indexName = null, query = null) {
    return new Promise((resolve, reject) => {
        if (!db) {
            reject(new Error('Database not initialized'));
            return;
        }
        
        const transaction = db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        
        let request;
        let index;
        
        if (indexName) {
            index = store.index(indexName);
            request = query ? index.openCursor(IDBKeyRange.only(query)) : index.openCursor();
        } else {
            request = store.openCursor();
        }
        
        const results = [];
        let currentOffset = 0;
        
        request.onsuccess = (event) => {
            const cursor = event.target.result;
            
            if (cursor) {
                if (currentOffset >= offset && results.length < limit) {
                    results.push(cursor.value);
                }
                currentOffset++;
                cursor.continue();
            } else {
                resolve(results);
            }
        };
        
        request.onerror = (event) => {
            reject(event.target.error);
        };
    });
}

// Read - Count
async function count(storeName) {
    return new Promise((resolve, reject) => {
        if (!db) {
            reject(new Error('Database not initialized'));
            return;
        }
        
        const transaction = db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        
        const request = store.count();
        
        request.onsuccess = () => {
            resolve(request.result);
        };
        
        request.onerror = (event) => {
            reject(event.target.error);
        };
    });
}

// Update
async function update(storeName, id, data) {
    return new Promise((resolve, reject) => {
        if (!db) {
            reject(new Error('Database not initialized'));
            return;
        }
        
        const transaction = db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        
        const request = store.get(id);
        
        request.onsuccess = () => {
            const item = request.result;
            if (!item) {
                reject(new Error('Item not found'));
                return;
            }
            
            const updatedItem = { ...item, ...data, updatedAt: getTimestamp() };
            
            const updateRequest = store.put(updatedItem);
            
            updateRequest.onsuccess = () => {
                // Add to activity log
                addActivity({
                    type: 'update',
                    entity: storeName,
                    entityId: id,
                    timestamp: getTimestamp()
                });
                resolve(updatedItem);
            };
            
            updateRequest.onerror = (event) => {
                reject(event.target.error);
            };
        };
        
        request.onerror = (event) => {
            reject(event.target.error);
        };
    });
}

// Delete
async function remove(storeName, id) {
    return new Promise((resolve, reject) => {
        if (!db) {
            reject(new Error('Database not initialized'));
            return;
        }
        
        const transaction = db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        
        const request = store.get(id);
        
        request.onsuccess = () => {
            const item = request.result;
            if (!item) {
                reject(new Error('Item not found'));
                return;
            }
            
            const deleteRequest = store.delete(id);
            
            deleteRequest.onsuccess = () => {
                // Add to activity log
                addActivity({
                    type: 'delete',
                    entity: storeName,
                    entityId: id,
                    timestamp: getTimestamp()
                });
                resolve(item);
            };
            
            deleteRequest.onerror = (event) => {
                reject(event.target.error);
            };
        };
        
        request.onerror = (event) => {
            reject(event.target.error);
        };
    });
}

// Delete all
async function clearAll(storeName) {
    return new Promise((resolve, reject) => {
        if (!db) {
            reject(new Error('Database not initialized'));
            return;
        }
        
        const transaction = db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        
        const request = store.clear();
        
        request.onsuccess = () => {
            resolve(true);
        };
        
        request.onerror = (event) => {
            reject(event.target.error);
        };
    });
}

// ============================================
// Activity Log
// ============================================

async function addActivity(activity) {
    try {
        await create(STORE_ACTIVITY, activity);
    } catch (error) {
        console.error('Error adding activity:', error);
    }
}

async function getActivity(offset = 0, limit = 10) {
    try {
        const activities = await getAllPaginated(STORE_ACTIVITY, offset, limit, 'timestamp');
        return activities.reverse(); // Return newest first
    } catch (error) {
        console.error('Error getting activity:', error);
        return [];
    }
}

// ============================================
// Settings
// ============================================

async function getSetting(key, defaultValue = null) {
    try {
        const setting = await getById(STORE_SETTINGS, key);
        return setting ? setting.value : defaultValue;
    } catch (error) {
        console.error('Error getting setting:', error);
        return defaultValue;
    }
}

async function setSetting(key, value) {
    try {
        await create(STORE_SETTINGS, { key, value });
    } catch (error) {
        // If key already exists, update it
        if (error.name === 'ConstraintError') {
            await update(STORE_SETTINGS, key, { value });
        } else {
            console.error('Error setting setting:', error);
        }
    }
}

// ============================================
// Search
// ============================================

async function searchPlayers(query) {
    try {
        const allPlayers = await getAll(STORE_PLAYERS);
        const lowerQuery = query.toLowerCase();
        
        return allPlayers.filter(player => {
            return player.name.toLowerCase().includes(lowerQuery) ||
                   player.club.toLowerCase().includes(lowerQuery) ||
                   player.position.toLowerCase().includes(lowerQuery) ||
                   (player.notes && player.notes.toLowerCase().includes(lowerQuery));
        });
    } catch (error) {
        console.error('Error searching players:', error);
        return [];
    }
}

async function searchReports(query) {
    try {
        const allReports = await getAll(STORE_REPORTS);
        const lowerQuery = query.toLowerCase();
        
        return allReports.filter(report => {
            return report.playerName.toLowerCase().includes(lowerQuery) ||
                   report.summary.toLowerCase().includes(lowerQuery);
        });
    } catch (error) {
        console.error('Error searching reports:', error);
        return [];
    }
}

async function searchNotes(query) {
    try {
        const allNotes = await getAll(STORE_NOTES);
        const lowerQuery = query.toLowerCase();
        
        return allNotes.filter(note => {
            return note.title.toLowerCase().includes(lowerQuery) ||
                   note.content.toLowerCase().includes(lowerQuery) ||
                   note.category.toLowerCase().includes(lowerQuery);
        });
    } catch (error) {
        console.error('Error searching notes:', error);
        return [];
    }
}

async function searchMatches(query) {
    try {
        const allMatches = await getAll(STORE_MATCHES);
        const lowerQuery = query.toLowerCase();
        
        return allMatches.filter(match => {
            return match.opponent.toLowerCase().includes(lowerQuery) ||
                   match.competition.toLowerCase().includes(lowerQuery) ||
                   match.venue.toLowerCase().includes(lowerQuery);
        });
    } catch (error) {
        console.error('Error searching matches:', error);
        return [];
    }
}

// ============================================
// Export/Import
// ============================================

async function exportAllData() {
    try {
        const [players, reports, matches, notes, settings, activity] = await Promise.all([
            getAll(STORE_PLAYERS),
            getAll(STORE_REPORTS),
            getAll(STORE_MATCHES),
            getAll(STORE_NOTES),
            getAll(STORE_SETTINGS),
            getAll(STORE_ACTIVITY)
        ]);
        
        return {
            version: DATABASE_VERSION,
            exportedAt: getTimestamp(),
            data: {
                players,
                reports,
                matches,
                notes,
                settings: settings.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {}),
                activity
            }
        };
    } catch (error) {
        console.error('Error exporting data:', error);
        throw error;
    }
}

async function importData(data) {
    if (!data || !data.data) {
        throw new Error('Invalid import data');
    }
    
    const transaction = db.transaction(
        [STORE_PLAYERS, STORE_REPORTS, STORE_MATCHES, STORE_NOTES, STORE_SETTINGS, STORE_ACTIVITY],
        'readwrite'
    );
    
    return new Promise((resolve, reject) => {
        try {
            // Clear existing data
            transaction.objectStore(STORE_PLAYERS).clear();
            transaction.objectStore(STORE_REPORTS).clear();
            transaction.objectStore(STORE_MATCHES).clear();
            transaction.objectStore(STORE_NOTES).clear();
            transaction.objectStore(STORE_SETTINGS).clear();
            transaction.objectStore(STORE_ACTIVITY).clear();
            
            // Import new data
            if (data.data.players) {
                data.data.players.forEach(player => {
                    transaction.objectStore(STORE_PLAYERS).add(player);
                });
            }
            
            if (data.data.reports) {
                data.data.reports.forEach(report => {
                    transaction.objectStore(STORE_REPORTS).add(report);
                });
            }
            
            if (data.data.matches) {
                data.data.matches.forEach(match => {
                    transaction.objectStore(STORE_MATCHES).add(match);
                });
            }
            
            if (data.data.notes) {
                data.data.notes.forEach(note => {
                    transaction.objectStore(STORE_NOTES).add(note);
                });
            }
            
            if (data.data.settings) {
                Object.entries(data.data.settings).forEach(([key, value]) => {
                    transaction.objectStore(STORE_SETTINGS).add({ key, value });
                });
            }
            
            if (data.data.activity) {
                data.data.activity.forEach(activity => {
                    transaction.objectStore(STORE_ACTIVITY).add(activity);
                });
            }
            
            transaction.oncomplete = () => {
                resolve(true);
            };
            
            transaction.onerror = (event) => {
                reject(event.target.error);
            };
        } catch (error) {
            reject(error);
        }
    });
}

// ============================================
// Statistics
// ============================================

async function getStatistics() {
    try {
        const [playersCount, reportsCount, matchesCount, notesCount] = await Promise.all([
            count(STORE_PLAYERS),
            count(STORE_REPORTS),
            count(STORE_MATCHES),
            count(STORE_NOTES)
        ]);
        
        return {
            players: playersCount,
            reports: reportsCount,
            matches: matchesCount,
            notes: notesCount
        };
    } catch (error) {
        console.error('Error getting statistics:', error);
        return { players: 0, reports: 0, matches: 0, notes: 0 };
    }
}

// ============================================
// Utility Functions
// ============================================

// Check if database is ready
function isDatabaseReady() {
    return db !== undefined;
}

// Close database
function closeDatabase() {
    if (db) {
        db.close();
        db = null;
    }
}

// Delete database (use with caution)
async function deleteDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.deleteDatabase(DATABASE_NAME);
        
        request.onsuccess = () => {
            db = null;
            resolve(true);
        };
        
        request.onerror = (event) => {
            reject(event.target.error);
        };
    });
}

// Export for use in other modules
window.PROSPECT_DB = {
    init: initDatabase,
    isReady: isDatabaseReady,
    close: closeDatabase,
    
    // CRUD
    create,
    getById,
    getAll,
    getAllPaginated,
    count,
    update,
    remove,
    clearAll,
    
    // Activity
    addActivity,
    getActivity,
    
    // Settings
    getSetting,
    setSetting,
    
    // Search
    searchPlayers,
    searchReports,
    searchNotes,
    searchMatches,
    
    // Export/Import
    exportAllData,
    importData,
    
    // Statistics
    getStatistics,
    
    // Stores
    STORE_PLAYERS,
    STORE_REPORTS,
    STORE_MATCHES,
    STORE_NOTES,
    STORE_SETTINGS,
    STORE_ACTIVITY
};

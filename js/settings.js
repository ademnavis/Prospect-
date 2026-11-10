// PROSPECT - Football Scouting Notebook
// Settings Module

// Settings functions are already handled in app.js
// This file is for additional settings functionality

// Check for updates
async function checkForUpdates() {
    try {
        // Check if service worker has updates
        if ('serviceWorker' in navigator) {
            const registration = await navigator.serviceWorker.getRegistration();
            if (registration) {
                registration.update().then(() => {
                    showToast('Checking for updates...', 'info');
                });
            }
        }
    } catch (error) {
        console.error('Error checking for updates:', error);
    }
}

// Reset settings
async function resetSettings() {
    try {
        await PROSPECT_DB.setSetting('theme', 'system');
        showToast('Settings reset to default', 'success');
        location.reload();
    } catch (error) {
        showToast('Failed to reset settings', 'error');
    }
}

// Global functions
window.checkForUpdates = checkForUpdates;
window.resetSettings = resetSettings;

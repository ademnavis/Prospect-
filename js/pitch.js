// PROSPECT - Football Scouting Notebook
// Pitch Annotation Module

// Pitch Canvas Setup
let pitchCanvas, pitchCtx;
let pitchMarkers = [];
let isDrawing = false;
let currentPath = [];

function initPitchCanvas(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    
    pitchCanvas = canvas;
    pitchCtx = canvas.getContext('2d');
    
    // Set canvas size
    resizePitchCanvas();
    
    // Draw pitch
    drawPitch();
    
    // Setup event listeners
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);
    
    // Touch support
    canvas.addEventListener('touchstart', handleTouchStart);
    canvas.addEventListener('touchmove', handleTouchMove);
    canvas.addEventListener('touchend', handleTouchEnd);
    
    // Window resize
    window.addEventListener('resize', resizePitchCanvas);
}

function resizePitchCanvas() {
    if (!pitchCanvas) return;
    
    const container = pitchCanvas.parentElement;
    if (container) {
        pitchCanvas.width = container.clientWidth;
        pitchCanvas.height = container.clientHeight;
    } else {
        pitchCanvas.width = 400;
        pitchCanvas.height = 300;
    }
    
    drawPitch();
    drawMarkers();
}

function drawPitch() {
    if (!pitchCtx) return;
    
    // Clear canvas
    pitchCtx.clearRect(0, 0, pitchCanvas.width, pitchCanvas.height);
    
    // Draw pitch background
    pitchCtx.fillStyle = '#22C55E';
    pitchCtx.fillRect(0, 0, pitchCanvas.width, pitchCanvas.height);
    
    // Draw pitch lines
    pitchCtx.strokeStyle = 'white';
    pitchCtx.lineWidth = 2;
    
    // Center circle
    const centerX = pitchCanvas.width / 2;
    const centerY = pitchCanvas.height / 2;
    const radius = Math.min(pitchCanvas.width, pitchCanvas.height) * 0.15;
    pitchCtx.beginPath();
    pitchCtx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    pitchCtx.stroke();
    
    // Halfway line
    pitchCtx.beginPath();
    pitchCtx.moveTo(centerX, 0);
    pitchCtx.lineTo(centerX, pitchCanvas.height);
    pitchCtx.stroke();
    
    // Penalty areas (simplified)
    const penaltyWidth = pitchCanvas.width * 0.3;
    const penaltyHeight = pitchCanvas.height * 0.2;
    
    // Left penalty area
    pitchCtx.beginPath();
    pitchCtx.rect(0, (pitchCanvas.height - penaltyHeight) / 2, penaltyWidth, penaltyHeight);
    pitchCtx.stroke();
    
    // Right penalty area
    pitchCtx.beginPath();
    pitchCtx.rect(pitchCanvas.width - penaltyWidth, (pitchCanvas.height - penaltyHeight) / 2, penaltyWidth, penaltyHeight);
    pitchCtx.stroke();
    
    // Center spot
    pitchCtx.fillStyle = 'white';
    pitchCtx.beginPath();
    pitchCtx.arc(centerX, centerY, 4, 0, Math.PI * 2);
    pitchCtx.fill();
    
    // Corner arcs
    const cornerRadius = 8;
    [
        { x: 0, y: 0 },
        { x: pitchCanvas.width, y: 0 },
        { x: 0, y: pitchCanvas.height },
        { x: pitchCanvas.width, y: pitchCanvas.height }
    ].forEach(corner => {
        pitchCtx.beginPath();
        pitchCtx.arc(corner.x, corner.y, cornerRadius, 0, Math.PI * 0.5);
        pitchCtx.stroke();
    });
    
    // Draw markers
    drawMarkers();
}

function drawMarkers() {
    if (!pitchCtx) return;
    
    pitchMarkers.forEach(marker => {
        pitchCtx.fillStyle = marker.color || '#EF4444';
        pitchCtx.beginPath();
        pitchCtx.arc(marker.x, marker.y, 8, 0, Math.PI * 2);
        pitchCtx.fill();
        
        pitchCtx.strokeStyle = 'white';
        pitchCtx.lineWidth = 2;
        pitchCtx.beginPath();
        pitchCtx.arc(marker.x, marker.y, 8, 0, Math.PI * 2);
        pitchCtx.stroke();
        
        // Draw label if available
        if (marker.label) {
            pitchCtx.fillStyle = 'white';
            pitchCtx.font = '12px Arial';
            pitchCtx.textAlign = 'center';
            pitchCtx.fillText(marker.label, marker.x, marker.y - 15);
        }
    });
    
    // Draw paths
    if (currentPath.length > 1) {
        pitchCtx.strokeStyle = '#3B82F6';
        pitchCtx.lineWidth = 3;
        pitchCtx.beginPath();
        pitchCtx.moveTo(currentPath[0].x, currentPath[0].y);
        for (let i = 1; i < currentPath.length; i++) {
            pitchCtx.lineTo(currentPath[i].x, currentPath[i].y);
        }
        pitchCtx.stroke();
    }
}

function startDrawing(e) {
    isDrawing = true;
    currentPath = [];
    const rect = pitchCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    currentPath.push({ x, y });
}

function draw(e) {
    if (!isDrawing) return;
    const rect = pitchCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    currentPath.push({ x, y });
    drawPitch();
}

function stopDrawing() {
    isDrawing = false;
    if (currentPath.length > 0) {
        // Save the path as markers
        pitchMarkers.push({
            type: 'path',
            points: currentPath,
            color: '#3B82F6'
        });
        currentPath = [];
    }
}

function handleTouchStart(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = pitchCanvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    isDrawing = true;
    currentPath = [{ x, y }];
}

function handleTouchMove(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = pitchCanvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    if (isDrawing) {
        currentPath.push({ x, y });
        drawPitch();
    }
}

function handleTouchEnd(e) {
    e.preventDefault();
    stopDrawing();
}

function addPlayerMarker() {
    // Add a marker at the center for now
    const centerX = pitchCanvas.width / 2;
    const centerY = pitchCanvas.height / 2;
    
    pitchMarkers.push({
        type: 'marker',
        x: centerX,
        y: centerY,
        color: '#EF4444',
        label: 'P'
    });
    
    drawPitch();
}

function clearPitch() {
    pitchMarkers = [];
    currentPath = [];
    drawPitch();
}

function getPitchData() {
    return {
        markers: pitchMarkers,
        paths: []
    };
}

function setPitchData(data) {
    if (data) {
        pitchMarkers = data.markers || [];
        drawPitch();
    }
}

// Global functions
window.initPitchCanvas = initPitchCanvas;
window.addPlayerMarker = addPlayerMarker;
window.clearPitch = clearPitch;
window.getPitchData = getPitchData;
window.setPitchData = setPitchData;

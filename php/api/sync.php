<?php
// PROSPECT - Football Scouting Notebook
// API Endpoint for Data Synchronization

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../database.php';

header('Content-Type: application/json');

// Check request method
$method = $_SERVER['REQUEST_METHOD'];

// Handle OPTIONS for CORS
if ($method === 'OPTIONS') {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    http_response_code(200);
    exit;
}

// Enable CORS
header('Access-Control-Allow-Origin: *');

// Check CSRF token for write operations
if (in_array($method, ['POST', 'PUT', 'DELETE'])) {
    $input = json_decode(file_get_contents('php://input'), true);
    if (!isset($input['csrf_token']) || !validateCSRF($input['csrf_token'])) {
        jsonResponse(['error' => 'Invalid CSRF token'], 403);
    }
}

try {
    switch ($method) {
        case 'GET':
            handleGetRequest();
            break;
        case 'POST':
            handlePostRequest();
            break;
        case 'PUT':
            handlePutRequest();
            break;
        case 'DELETE':
            handleDeleteRequest();
            break;
        default:
            jsonResponse(['error' => 'Method not allowed'], 405);
    }
} catch (Exception $e) {
    jsonResponse(['error' => $e->getMessage()], 500);
}

function handleGetRequest() {
    // Get sync token or user identifier
    $token = $_GET['token'] ?? '';
    
    // For now, just return server info
    jsonResponse([
        'status' => 'success',
        'server' => 'PROSPECT Sync Server',
        'version' => APP_VERSION,
        'timestamp' => date('c')
    ]);
}

function handlePostRequest() {
    $input = json_decode(file_get_contents('php://input'), true);
    
    // Handle data sync from client
    if (isset($input['data'])) {
        $data = $input['data'];
        
        // Validate and sanitize data
        $sanitizedData = sanitizeInput($data);
        
        // Process the data (store in database, etc.)
        // This is a placeholder - implement actual sync logic
        
        jsonResponse([
            'status' => 'success',
            'message' => 'Data received',
            'data' => $sanitizedData
        ]);
    }
    
    jsonResponse(['error' => 'No data provided'], 400);
}

function handlePutRequest() {
    $input = json_decode(file_get_contents('php://input'), true);
    
    // Handle update requests
    jsonResponse(['error' => 'Update endpoint not implemented'], 501);
}

function handleDeleteRequest() {
    $input = json_decode(file_get_contents('php://input'), true);
    
    // Handle delete requests
    jsonResponse(['error' => 'Delete endpoint not implemented'], 501);
}

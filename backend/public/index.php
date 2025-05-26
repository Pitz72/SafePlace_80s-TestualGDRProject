<?php

/**
 * Entry Point API per The Safe Place
 * Gestisce tutte le richieste REST
 */

// Headers CORS per permettere richieste dal frontend
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Gestione preflight OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Autoload Composer
require_once __DIR__ . '/../vendor/autoload.php';

// Carica le classi del progetto
require_once __DIR__ . '/../src/Database.php';

use SafePlace\Database;

// Gestione errori globali
set_error_handler(function($severity, $message, $file, $line) {
    throw new ErrorException($message, 0, $severity, $file, $line);
});

try {
    // Parsing dell'URL
    $requestUri = $_SERVER['REQUEST_URI'];
    $requestMethod = $_SERVER['REQUEST_METHOD'];
    
    // Rimuovi il path base se necessario
    $basePath = '/backend/public';
    if (strpos($requestUri, $basePath) === 0) {
        $requestUri = substr($requestUri, strlen($basePath));
    }
    
    // Parsing dei parametri
    $urlParts = explode('?', $requestUri);
    $path = trim($urlParts[0], '/');
    $pathParts = $path ? explode('/', $path) : [];
    
    // Routing semplice
    if (empty($pathParts) || $pathParts[0] !== 'api') {
        throw new Exception('Endpoint non valido', 404);
    }
    
    // Rimuovi 'api' dal path
    array_shift($pathParts);
    
    if (empty($pathParts)) {
        // Endpoint di test
        echo json_encode([
            'status' => 'success',
            'message' => 'The Safe Place API v1.0',
            'timestamp' => date('Y-m-d H:i:s'),
            'endpoints' => [
                'GET /api/test' => 'Test connessione database',
                'GET /api/status' => 'Stato del server',
                'POST /api/game/save' => 'Salva partita (futuro)',
                'GET /api/game/load' => 'Carica partita (futuro)'
            ]
        ]);
        exit();
    }
    
    $endpoint = $pathParts[0];
    
    switch ($endpoint) {
        case 'test':
            handleTestEndpoint();
            break;
            
        case 'status':
            handleStatusEndpoint();
            break;
            
        case 'game':
            handleGameEndpoint($pathParts, $requestMethod);
            break;
            
        default:
            throw new Exception('Endpoint non trovato: ' . $endpoint, 404);
    }
    
} catch (Exception $e) {
    http_response_code($e->getCode() ?: 500);
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage(),
        'timestamp' => date('Y-m-d H:i:s')
    ]);
}

/**
 * Test connessione database
 */
function handleTestEndpoint(): void
{
    try {
        $db = Database::getConnection();
        $result = Database::fetchOne('SELECT VERSION() as mysql_version, NOW() as `current_time`');
        
        echo json_encode([
            'status' => 'success',
            'message' => 'Database connesso correttamente',
            'data' => $result,
            'timestamp' => date('Y-m-d H:i:s')
        ]);
        
    } catch (Exception $e) {
        throw new Exception('Errore database: ' . $e->getMessage(), 500);
    }
}

/**
 * Stato del server
 */
function handleStatusEndpoint(): void
{
    echo json_encode([
        'status' => 'success',
        'server' => [
            'php_version' => PHP_VERSION,
            'memory_usage' => memory_get_usage(true),
            'memory_peak' => memory_get_peak_usage(true),
            'uptime' => sys_getloadavg()
        ],
        'timestamp' => date('Y-m-d H:i:s')
    ]);
}

/**
 * Endpoint gioco (futuro)
 */
function handleGameEndpoint(array $pathParts, string $method): void
{
    if (count($pathParts) < 2) {
        throw new Exception('Azione gioco non specificata', 400);
    }
    
    $action = $pathParts[1];
    
    switch ($action) {
        case 'save':
            echo json_encode([
                'status' => 'info',
                'message' => 'Endpoint save-game in sviluppo',
                'timestamp' => date('Y-m-d H:i:s')
            ]);
            break;
            
        case 'load':
            echo json_encode([
                'status' => 'info',
                'message' => 'Endpoint load-game in sviluppo',
                'timestamp' => date('Y-m-d H:i:s')
            ]);
            break;
            
        default:
            throw new Exception('Azione gioco non valida: ' . $action, 400);
    }
} 
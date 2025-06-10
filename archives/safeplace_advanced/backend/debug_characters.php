<?php
/**
 * Debug Characters Endpoint
 */

echo "<h1>🔍 Debug Characters Endpoint</h1>";

// Autoload Composer
require_once __DIR__ . '/vendor/autoload.php';

// Carica le classi del progetto
require_once __DIR__ . '/src/Database.php';
require_once __DIR__ . '/api/GameController.php';

use SafePlace\Database;
use SafePlace\Api\GameController;

try {
    echo "<h2>1. Test Database Connection</h2>";
    $db = Database::getInstance();
    echo "✅ Database instance created<br>";
    
    echo "<h2>2. Test GameController Creation</h2>";
    $gameController = new GameController();
    echo "✅ GameController instance created<br>";
    
    echo "<h2>3. Test getCharacters Method</h2>";
    $result = $gameController->getCharacters();
    echo "✅ getCharacters method called<br>";
    echo "<pre>" . print_r($result, true) . "</pre>";
    
} catch (Exception $e) {
    echo "❌ <strong>ERRORE:</strong> " . $e->getMessage() . "<br>";
    echo "<strong>File:</strong> " . $e->getFile() . "<br>";
    echo "<strong>Line:</strong> " . $e->getLine() . "<br>";
    echo "<pre>" . $e->getTraceAsString() . "</pre>";
}

echo "<hr>";
echo "<p><em>Debug completato: " . date('Y-m-d H:i:s') . "</em></p>";
?> 
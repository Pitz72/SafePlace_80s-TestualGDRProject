<?php
/**
 * Test semplice per verificare PHP e Database
 * Accesso: http://localhost/backend/test_simple.php
 */

echo "<h1>Test The Safe Place Backend</h1>";
echo "<p><strong>PHP Version:</strong> " . PHP_VERSION . "</p>";
echo "<p><strong>Timestamp:</strong> " . date('Y-m-d H:i:s') . "</p>";

// Test connessione database
try {
    require_once __DIR__ . '/src/Database.php';
    
    $db = SafePlace\Database::getConnection();
    $result = SafePlace\Database::fetchOne('SELECT VERSION() as mysql_version, NOW() as `current_time`');
    
    echo "<h2>✅ Database Connesso</h2>";
    echo "<p><strong>MySQL Version:</strong> " . $result['mysql_version'] . "</p>";
    echo "<p><strong>Current Time:</strong> " . $result['current_time'] . "</p>";
    
    // Test tabelle
    $tables = SafePlace\Database::fetchAll('SHOW TABLES');
    echo "<h3>Tabelle nel database:</h3>";
    echo "<ul>";
    foreach ($tables as $table) {
        $tableName = array_values($table)[0];
        echo "<li>$tableName</li>";
    }
    echo "</ul>";
    
} catch (Exception $e) {
    echo "<h2>❌ Errore Database</h2>";
    echo "<p style='color: red;'>" . $e->getMessage() . "</p>";
}

echo "<hr>";
echo "<h3>Test API Endpoints:</h3>";
echo "<ul>";
echo "<li><a href='/backend/public/api' target='_blank'>GET /api</a> - Info API</li>";
echo "<li><a href='/backend/public/api/status' target='_blank'>GET /api/status</a> - Status Server</li>";
echo "<li><a href='/backend/public/api/test' target='_blank'>GET /api/test</a> - Test Database</li>";
echo "</ul>";
?> 
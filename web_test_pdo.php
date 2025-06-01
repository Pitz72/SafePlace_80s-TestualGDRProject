<?php
header('Content-Type: text/plain; charset=utf-8');

echo "=== TEST PDO VIA WEB MAMP ===\n";
echo "PHP Version: " . phpversion() . "\n";
echo "PDO Extension: " . (extension_loaded('pdo') ? 'YES' : 'NO') . "\n";

echo "\nPDO Drivers:\n";
$drivers = PDO::getAvailableDrivers();
if (empty($drivers)) {
    echo "- NONE FOUND!\n";
} else {
    foreach ($drivers as $driver) {
        echo "- $driver\n";
    }
}

echo "\n=== TEST MySQL CONNECTION ===\n";

$configs = [
    ['host' => 'localhost', 'port' => 3306, 'user' => 'root', 'pass' => ''],
    ['host' => 'localhost', 'port' => 3306, 'user' => 'root', 'pass' => 'root'],
];

foreach ($configs as $i => $config) {
    echo "\nTest " . ($i+1) . ": {$config['host']}:{$config['port']}\n";
    
    try {
        $dsn = "mysql:host={$config['host']};port={$config['port']}";
        $pdo = new PDO($dsn, $config['user'], $config['pass'], [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_TIMEOUT => 3
        ]);
        
        echo "✅ CONNECTION SUCCESS!\n";
        
        // Test database existence
        $stmt = $pdo->query("SHOW DATABASES");
        $databases = $stmt->fetchAll(PDO::FETCH_COLUMN);
        echo "Databases found: " . implode(', ', $databases) . "\n";
        
        if (in_array('safeplace_db', $databases)) {
            echo "✅ safeplace_db DATABASE FOUND!\n";
            
            // Test tables
            $pdo->exec("USE safeplace_db");
            $stmt = $pdo->query("SHOW TABLES");
            $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
            echo "Tables: " . implode(', ', $tables) . "\n";
        } else {
            echo "⚠️ safeplace_db DATABASE NOT FOUND\n";
        }
        
        $pdo = null;
        break;
        
    } catch (PDOException $e) {
        echo "❌ ERROR: " . $e->getMessage() . "\n";
    }
}

echo "\n=== END TEST ===\n";
?> 
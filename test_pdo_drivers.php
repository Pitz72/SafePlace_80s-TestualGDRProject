<?php
echo "=== TEST DRIVER PDO ===\n";
echo "PHP Version: " . phpversion() . "\n";
echo "PDO estensione: " . (extension_loaded('pdo') ? 'SI' : 'NO') . "\n";

echo "\nDriver PDO disponibili:\n";
$drivers = PDO::getAvailableDrivers();
foreach ($drivers as $driver) {
    echo "- $driver\n";
}

echo "\n=== TEST CONNESSIONE MAMP ===\n";

// Test connessione con diverse configurazioni MAMP
$configs = [
    ['host' => 'localhost', 'port' => 3306, 'user' => 'root', 'pass' => ''],
    ['host' => 'localhost', 'port' => 3306, 'user' => 'root', 'pass' => 'root'],
    ['host' => '127.0.0.1', 'port' => 3306, 'user' => 'root', 'pass' => ''],
    ['host' => '127.0.0.1', 'port' => 3306, 'user' => 'root', 'pass' => 'root'],
];

foreach ($configs as $i => $config) {
    echo "\nTest " . ($i+1) . ": {$config['host']}:{$config['port']} - user:{$config['user']} pass:" . ($config['pass'] ?: '(vuota)') . "\n";
    
    try {
        $dsn = "mysql:host={$config['host']};port={$config['port']}";
        $pdo = new PDO($dsn, $config['user'], $config['pass'], [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_TIMEOUT => 5
        ]);
        
        echo "✅ CONNESSIONE RIUSCITA!\n";
        
        // Test esistenza database
        $stmt = $pdo->query("SHOW DATABASES LIKE 'safeplace_db'");
        if ($stmt->fetch()) {
            echo "✅ Database 'safeplace_db' TROVATO!\n";
        } else {
            echo "⚠️ Database 'safeplace_db' NON TROVATO\n";
        }
        
        $pdo = null;
        break; // Ferma al primo successo
        
    } catch (PDOException $e) {
        echo "❌ ERRORE: " . $e->getMessage() . "\n";
    }
}

echo "\n=== FINE TEST ===\n";
?> 
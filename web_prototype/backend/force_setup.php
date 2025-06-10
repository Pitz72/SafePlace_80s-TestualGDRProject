<?php
/**
 * Force Setup Database - The Safe Place
 * Script che forza la creazione delle tabelle
 */

echo "<h1>🔧 Force Setup Database - The Safe Place</h1>";

// Configurazione database
$host = 'localhost';
$dbname = 'safeplace_db';
$username = 'root';
$password = 'root';

try {
    // Connessione al database
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "<p>✅ Connesso al database <strong>$dbname</strong></p>";
    
    // Leggi e esegui il file SQL
    $sqlFile = __DIR__ . '/sql/create_database.sql';
    if (!file_exists($sqlFile)) {
        throw new Exception("File SQL non trovato: $sqlFile");
    }
    
    $sql = file_get_contents($sqlFile);
    
    // Dividi in query separate
    $queries = explode(';', $sql);
    
    echo "<h2>📋 Esecuzione Query SQL:</h2>";
    echo "<ul>";
    
    $successCount = 0;
    $errorCount = 0;
    
    foreach ($queries as $query) {
        $query = trim($query);
        if (empty($query) || strpos($query, '--') === 0) {
            continue; // Salta commenti e query vuote
        }
        
        try {
            $pdo->exec($query);
            $shortQuery = substr($query, 0, 50) . '...';
            echo "<li>✅ <code>$shortQuery</code></li>";
            $successCount++;
        } catch (PDOException $e) {
            $shortQuery = substr($query, 0, 50) . '...';
            echo "<li>⚠️ <code>$shortQuery</code> - " . $e->getMessage() . "</li>";
            $errorCount++;
        }
    }
    
    echo "</ul>";
    
    // Verifica tabelle create
    echo "<h2>📊 Verifica Tabelle Create:</h2>";
    $result = $pdo->query("SHOW TABLES");
    $tables = $result->fetchAll(PDO::FETCH_COLUMN);
    
    echo "<ul>";
    foreach ($tables as $table) {
        echo "<li>✅ <strong>$table</strong></li>";
    }
    echo "</ul>";
    
    echo "<h2>📈 Riepilogo:</h2>";
    echo "<p>✅ Query eseguite con successo: <strong>$successCount</strong></p>";
    echo "<p>⚠️ Query con errori: <strong>$errorCount</strong></p>";
    echo "<p>📋 Tabelle totali: <strong>" . count($tables) . "</strong></p>";
    
    if (count($tables) >= 5) {
        echo "<p style='color: green; font-weight: bold;'>🎉 Setup completato con successo!</p>";
    } else {
        echo "<p style='color: orange; font-weight: bold;'>⚠️ Setup parziale - alcune tabelle potrebbero mancare</p>";
    }
    
} catch (Exception $e) {
    echo "<h2>❌ Errore:</h2>";
    echo "<p style='color: red;'>" . $e->getMessage() . "</p>";
}

echo "<hr>";
echo "<p><em>Setup completato: " . date('Y-m-d H:i:s') . "</em></p>";
?> 
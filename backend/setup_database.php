<?php
/**
 * Script per creare automaticamente le tabelle del database
 * Esegui: http://localhost/backend/setup_database.php
 */

echo "<h1>Setup Database - The Safe Place</h1>";

try {
    // Carica la configurazione database
    require_once __DIR__ . '/src/Database.php';
    
    $db = SafePlace\Database::getConnection();
    echo "<p>✅ Connesso al database</p>";
    
    // Leggi e esegui lo script SQL
    $sqlScript = file_get_contents(__DIR__ . '/sql/create_database.sql');
    
    // Dividi lo script in singole query (rimuovi commenti e query vuote)
    $queries = array_filter(
        array_map('trim', 
            preg_split('/;[\r\n]+/', $sqlScript)
        ), 
        function($query) {
            return !empty($query) && !preg_match('/^--/', $query) && $query !== 'USE safeplace_db';
        }
    );
    
    echo "<h2>Esecuzione Script SQL:</h2>";
    echo "<ul>";
    
    foreach ($queries as $query) {
        if (trim($query)) {
            try {
                $db->exec($query);
                
                // Estrai il nome della tabella o azione per il log
                if (preg_match('/CREATE TABLE.*?(\w+)/i', $query, $matches)) {
                    echo "<li>✅ Tabella <strong>{$matches[1]}</strong> creata</li>";
                } elseif (preg_match('/CREATE INDEX.*?(\w+)/i', $query, $matches)) {
                    echo "<li>✅ Indice <strong>{$matches[1]}</strong> creato</li>";
                } elseif (preg_match('/INSERT INTO.*?(\w+)/i', $query, $matches)) {
                    echo "<li>✅ Dati inseriti in <strong>{$matches[1]}</strong></li>";
                } else {
                    echo "<li>✅ Query eseguita</li>";
                }
            } catch (PDOException $e) {
                echo "<li>⚠️ Query saltata (probabilmente già esistente): " . substr($query, 0, 50) . "...</li>";
            }
        }
    }
    
    echo "</ul>";
    
    // Verifica tabelle create
    $tables = SafePlace\Database::fetchAll('SHOW TABLES');
    echo "<h2>✅ Tabelle nel database:</h2>";
    echo "<ul>";
    foreach ($tables as $table) {
        $tableName = array_values($table)[0];
        echo "<li><strong>$tableName</strong></li>";
    }
    echo "</ul>";
    
    // Test dati inseriti
    $testUser = SafePlace\Database::fetchOne('SELECT * FROM users WHERE username = ?', ['test_player']);
    if ($testUser) {
        echo "<h2>✅ Dati di test inseriti:</h2>";
        echo "<p><strong>Utente test:</strong> {$testUser['username']} ({$testUser['email']})</p>";
        
        $testCharacter = SafePlace\Database::fetchOne('SELECT * FROM characters WHERE user_id = ?', [$testUser['id']]);
        if ($testCharacter) {
            echo "<p><strong>Personaggio test:</strong> {$testCharacter['name']} (Level {$testCharacter['level']})</p>";
        }
    }
    
    echo "<hr>";
    echo "<h2>🎉 Setup Completato!</h2>";
    echo "<p><a href='test_simple.php'>← Torna al test principale</a></p>";
    echo "<p><a href='public/api'>🔗 Testa API</a></p>";
    
} catch (Exception $e) {
    echo "<h2>❌ Errore:</h2>";
    echo "<p style='color: red;'>" . $e->getMessage() . "</p>";
}
?> 
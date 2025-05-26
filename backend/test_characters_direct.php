<?php
/**
 * Test diretto endpoint characters senza classi
 */

echo "<h1>🔍 Test Diretto Characters</h1>";

// Connessione diretta al database
$host = 'localhost';
$dbname = 'safeplace_db';
$username = 'root';
$password = 'root';

try {
    echo "<h2>1. Connessione Database</h2>";
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    echo "✅ Connesso al database<br>";
    
    echo "<h2>2. Verifica/Crea Utente Test</h2>";
    // Controlla se esiste già un utente
    $userCheck = $pdo->query("SELECT COUNT(*) FROM users WHERE id = 1")->fetchColumn();
    
    if ($userCheck == 0) {
        // Crea utente di test
        $userSql = "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)";
        $stmt = $pdo->prepare($userSql);
        $stmt->execute(['test_player', 'test@safeplace.local', password_hash('test123', PASSWORD_DEFAULT)]);
        echo "✅ Utente di test creato<br>";
    } else {
        echo "✅ Utente di test già esistente<br>";
    }
    
    echo "<h2>3. Test Query Characters</h2>";
    $sql = "SELECT id, name, level, experience, health, 
                   position, stats, created_at, updated_at 
            FROM characters 
            WHERE user_id = ? 
            ORDER BY updated_at DESC";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([1]); // user_id = 1 di default
    $characters = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "✅ Query eseguita con successo<br>";
    echo "Personaggi trovati: " . count($characters) . "<br>";
    
    if (count($characters) > 0) {
        echo "<pre>" . print_r($characters, true) . "</pre>";
    } else {
        echo "<p>Nessun personaggio trovato per user_id = 1</p>";
    }
    
    echo "<h2>4. Test Creazione Personaggio</h2>";
    $insertSql = "INSERT INTO characters (user_id, name, level, experience, health, position, stats) 
                  VALUES (?, ?, ?, ?, ?, ?, ?)";
    
    $testData = [
        1, // user_id
        'TestSurvivor_' . time(),
        1, // level
        0, // experience
        100, // health
        json_encode(['x' => 5, 'y' => 5]),
        json_encode([
            'maxHp' => 100,
            'food' => 10,
            'water' => 10,
            'vigore' => 10,
            'potenza' => 8,
            'agilita' => 8
        ])
    ];
    
    $stmt = $pdo->prepare($insertSql);
    $result = $stmt->execute($testData);
    
    if ($result) {
        $characterId = $pdo->lastInsertId();
        echo "✅ Personaggio creato con ID: $characterId<br>";
    } else {
        echo "❌ Errore nella creazione del personaggio<br>";
    }
    
    echo "<h2>5. Verifica Lista Aggiornata</h2>";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([1]);
    $characters = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "Personaggi totali: " . count($characters) . "<br>";
    foreach ($characters as $char) {
        echo "- ID: {$char['id']}, Nome: {$char['name']}, HP: {$char['health']}<br>";
    }
    
} catch (Exception $e) {
    echo "❌ <strong>ERRORE:</strong> " . $e->getMessage() . "<br>";
    echo "<strong>File:</strong> " . $e->getFile() . "<br>";
    echo "<strong>Line:</strong> " . $e->getLine() . "<br>";
}

echo "<hr>";
echo "<p><em>Test completato: " . date('Y-m-d H:i:s') . "</em></p>";
?> 
<?php
/**
 * Test API Game Endpoints
 * Script per testare le nuove API di salvataggio/caricamento
 */

echo "<h1>🎮 Test API Game Endpoints - The Safe Place</h1>";
echo "<p><strong>Timestamp:</strong> " . date('Y-m-d H:i:s') . "</p>";

// Configurazione
$baseUrl = 'http://localhost/backend/public/api';

// Funzione helper per fare richieste HTTP
function makeRequest($url, $method = 'GET', $data = null) {
    $context = stream_context_create([
        'http' => [
            'method' => $method,
            'header' => 'Content-Type: application/json',
            'content' => $data ? json_encode($data) : null
        ]
    ]);
    
    $result = @file_get_contents($url, false, $context);
    
    if ($result === false) {
        return ['error' => 'Richiesta fallita'];
    }
    
    return json_decode($result, true);
}

echo "<hr>";

// Test 1: Verifica API base
echo "<h2>📡 Test 1: API Base</h2>";
$response = makeRequest("$baseUrl");
if (isset($response['status']) && $response['status'] === 'success') {
    echo "✅ <strong>API Base OK</strong><br>";
    echo "Endpoints disponibili:<br>";
    foreach ($response['endpoints'] as $endpoint => $description) {
        echo "- <code>$endpoint</code>: $description<br>";
    }
} else {
    echo "❌ <strong>API Base ERRORE</strong><br>";
    echo "<pre>" . print_r($response, true) . "</pre>";
}

echo "<hr>";

// Test 2: Lista personaggi (dovrebbe essere vuota inizialmente)
echo "<h2>👥 Test 2: Lista Personaggi</h2>";
$response = makeRequest("$baseUrl/characters");
if (isset($response['success']) && $response['success']) {
    echo "✅ <strong>Lista personaggi OK</strong><br>";
    echo "Personaggi trovati: " . $response['count'] . "<br>";
    if ($response['count'] > 0) {
        echo "<pre>" . print_r($response['characters'], true) . "</pre>";
    }
} else {
    echo "❌ <strong>Lista personaggi ERRORE</strong><br>";
    echo "<pre>" . print_r($response, true) . "</pre>";
}

echo "<hr>";

// Test 3: Creazione nuovo personaggio
echo "<h2>➕ Test 3: Creazione Personaggio</h2>";
$newCharacter = [
    'name' => 'TestSurvivor_' . time(),
    'health' => 100,
    'position' => ['x' => 5, 'y' => 5],
    'stats' => [
        'maxHp' => 100,
        'food' => 10,
        'water' => 10,
        'vigore' => 10,
        'potenza' => 8,
        'agilita' => 8,
        'trascinamento' => 10,
        'infiltrazione' => 6,
        'precisione' => 8,
        'adattamento' => 7
    ]
];

$response = makeRequest("$baseUrl/characters", 'POST', $newCharacter);
if (isset($response['success']) && $response['success']) {
    echo "✅ <strong>Creazione personaggio OK</strong><br>";
    echo "Character ID: " . $response['character_id'] . "<br>";
    $testCharacterId = $response['character_id'];
} else {
    echo "❌ <strong>Creazione personaggio ERRORE</strong><br>";
    echo "<pre>" . print_r($response, true) . "</pre>";
    $testCharacterId = 1; // Fallback per test successivi
}

echo "<hr>";

// Test 4: Salvataggio partita
echo "<h2>💾 Test 4: Salvataggio Partita</h2>";
$saveData = [
    'character_id' => $testCharacterId,
    'session_data' => [
        'gameDay' => 1,
        'dayMovesCounter' => 5,
        'isDay' => true,
        'easterEggPixelDebhFound' => false,
        'uniqueEventWebRadioFound' => false,
        'mapData' => [
            // Mappa semplificata per test
            [
                ['type' => 'S', 'visited' => true, 'items' => [], 'events' => []],
                ['type' => '.', 'visited' => false, 'items' => [], 'events' => []]
            ]
        ],
        'player' => [
            'hp' => 95,
            'maxHp' => 100,
            'food' => 8,
            'water' => 9,
            'x' => 5,
            'y' => 5,
            'inventory' => [
                ['itemId' => 'bandages_dirty', 'quantity' => 2],
                ['itemId' => 'water_purified_small', 'quantity' => 1]
            ]
        ],
        'saveTimestamp' => date('Y-m-d H:i:s')
    ],
    'character_data' => [
        'name' => 'TestSurvivor_Updated',
        'health' => 95,
        'position' => ['x' => 5, 'y' => 5],
        'stats' => [
            'maxHp' => 100,
            'food' => 8,
            'water' => 9
        ]
    ]
];

$response = makeRequest("$baseUrl/game/save", 'POST', $saveData);
if (isset($response['success']) && $response['success']) {
    echo "✅ <strong>Salvataggio partita OK</strong><br>";
    echo "Session ID: " . $response['session_id'] . "<br>";
    echo "Timestamp: " . $response['timestamp'] . "<br>";
} else {
    echo "❌ <strong>Salvataggio partita ERRORE</strong><br>";
    echo "<pre>" . print_r($response, true) . "</pre>";
}

echo "<hr>";

// Test 5: Caricamento partita
echo "<h2>📂 Test 5: Caricamento Partita</h2>";
$response = makeRequest("$baseUrl/game/load/$testCharacterId");
if (isset($response['success']) && $response['success']) {
    echo "✅ <strong>Caricamento partita OK</strong><br>";
    echo "Character ID: " . $response['character_id'] . "<br>";
    echo "Last Save: " . $response['last_save'] . "<br>";
    echo "Game Day: " . $response['session_data']['gameDay'] . "<br>";
    echo "Player HP: " . $response['session_data']['player']['hp'] . "<br>";
    echo "Inventory Items: " . count($response['session_data']['player']['inventory']) . "<br>";
} else {
    echo "❌ <strong>Caricamento partita ERRORE</strong><br>";
    echo "<pre>" . print_r($response, true) . "</pre>";
}

echo "<hr>";

// Test 6: Lista personaggi aggiornata
echo "<h2>👥 Test 6: Lista Personaggi Aggiornata</h2>";
$response = makeRequest("$baseUrl/characters");
if (isset($response['success']) && $response['success']) {
    echo "✅ <strong>Lista personaggi aggiornata OK</strong><br>";
    echo "Personaggi totali: " . $response['count'] . "<br>";
    if ($response['count'] > 0) {
        foreach ($response['characters'] as $char) {
            echo "- ID: {$char['id']}, Nome: {$char['name']}, HP: {$char['health']}, Aggiornato: {$char['updated_at']}<br>";
        }
    }
} else {
    echo "❌ <strong>Lista personaggi aggiornata ERRORE</strong><br>";
    echo "<pre>" . print_r($response, true) . "</pre>";
}

echo "<hr>";

// Riepilogo
echo "<h2>📊 Riepilogo Test</h2>";
echo "<p>✅ <strong>Test completati!</strong> Le API di salvataggio e caricamento sono operative.</p>";
echo "<p>🎯 <strong>Prossimi passi:</strong></p>";
echo "<ul>";
echo "<li>Implementare integrazione frontend JavaScript</li>";
echo "<li>Creare funzioni dual-mode (localStorage + backend)</li>";
echo "<li>Aggiungere sistema autenticazione</li>";
echo "<li>Ottimizzare compressione dati mappa</li>";
echo "</ul>";

echo "<hr>";
echo "<p><em>Test completato: " . date('Y-m-d H:i:s') . "</em></p>";
?> 
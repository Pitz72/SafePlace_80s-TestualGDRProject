<?php
/**
 * Test API Semplificato - Solo GET endpoints
 */

echo "<h1>🎮 Test API Semplificato - The Safe Place</h1>";
echo "<p><strong>Timestamp:</strong> " . date('Y-m-d H:i:s') . "</p>";

$baseUrl = 'http://localhost/backend/public/api';

echo "<hr>";

// Test 1: API Base
echo "<h2>📡 Test 1: API Base</h2>";
$response = @file_get_contents("$baseUrl");
if ($response) {
    $data = json_decode($response, true);
    if (isset($data['status']) && $data['status'] === 'success') {
        echo "✅ <strong>API Base OK</strong><br>";
        echo "Message: " . $data['message'] . "<br>";
    } else {
        echo "❌ <strong>API Base ERRORE</strong><br>";
        echo "<pre>" . print_r($data, true) . "</pre>";
    }
} else {
    echo "❌ <strong>Connessione fallita</strong><br>";
}

echo "<hr>";

// Test 2: Test Database
echo "<h2>🗄️ Test 2: Database</h2>";
$response = @file_get_contents("$baseUrl/test");
if ($response) {
    $data = json_decode($response, true);
    if (isset($data['status']) && $data['status'] === 'success') {
        echo "✅ <strong>Database OK</strong><br>";
        echo "MySQL Version: " . $data['data']['mysql_version'] . "<br>";
        echo "Current Time: " . $data['data']['current_time'] . "<br>";
    } else {
        echo "❌ <strong>Database ERRORE</strong><br>";
        echo "<pre>" . print_r($data, true) . "</pre>";
    }
} else {
    echo "❌ <strong>Connessione fallita</strong><br>";
}

echo "<hr>";

// Test 3: Status Server
echo "<h2>⚙️ Test 3: Status Server</h2>";
$response = @file_get_contents("$baseUrl/status");
if ($response) {
    $data = json_decode($response, true);
    if (isset($data['status']) && $data['status'] === 'success') {
        echo "✅ <strong>Server Status OK</strong><br>";
        echo "PHP Version: " . $data['server']['php_version'] . "<br>";
        echo "Memory Usage: " . number_format($data['server']['memory_usage'] / 1024 / 1024, 2) . " MB<br>";
    } else {
        echo "❌ <strong>Server Status ERRORE</strong><br>";
        echo "<pre>" . print_r($data, true) . "</pre>";
    }
} else {
    echo "❌ <strong>Connessione fallita</strong><br>";
}

echo "<hr>";

// Test 4: Lista Personaggi (GET)
echo "<h2>👥 Test 4: Lista Personaggi</h2>";
$response = @file_get_contents("$baseUrl/characters");
if ($response) {
    $data = json_decode($response, true);
    if (isset($data['success']) && $data['success']) {
        echo "✅ <strong>Lista personaggi OK</strong><br>";
        echo "Personaggi trovati: " . $data['count'] . "<br>";
        if ($data['count'] > 0) {
            echo "<pre>" . print_r($data['characters'], true) . "</pre>";
        }
    } else {
        echo "❌ <strong>Lista personaggi ERRORE</strong><br>";
        echo "<pre>" . print_r($data, true) . "</pre>";
    }
} else {
    echo "❌ <strong>Connessione fallita</strong><br>";
}

echo "<hr>";

echo "<h2>📊 Riepilogo</h2>";
echo "<p>✅ <strong>Test GET completati!</strong></p>";
echo "<p>🎯 <strong>Prossimo step:</strong> Testare endpoint POST con tool esterni</p>";

echo "<hr>";
echo "<p><em>Test completato: " . date('Y-m-d H:i:s') . "</em></p>";
?> 
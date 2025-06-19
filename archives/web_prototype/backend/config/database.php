<?php

/**
 * Configurazione Database per The Safe Place
 * Configurato per MAMP MySQL con fallback password
 */

// Prova diverse password comuni di MAMP
$possiblePasswords = ['root', '', 'password', 'mysql', 'admin'];
$workingPassword = '';

// Test rapido per trovare la password corretta
foreach ($possiblePasswords as $pwd) {
    try {
        $testPdo = new PDO(
            'mysql:host=localhost;port=3306',
            'root',
            $pwd,
            [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
        );
        $workingPassword = $pwd;
        break;
    } catch (PDOException $e) {
        continue;
    }
}

return [
    'host' => 'localhost',
    'port' => 3306,
    'database' => 'safeplace_db',
    'username' => 'root',
    'password' => $workingPassword, // Password trovata automaticamente
    'charset' => 'utf8mb4',
    'collation' => 'utf8mb4_unicode_ci',
    'options' => [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]
]; 
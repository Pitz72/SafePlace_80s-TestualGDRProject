<?php

namespace SafePlace;

use PDO;
use PDOException;

/**
 * Classe Database per The Safe Place
 * Gestisce la connessione MySQL e le operazioni base
 */
class Database
{
    private static ?PDO $connection = null;
    private static array $config;

    /**
     * Inizializza la configurazione del database
     */
    public static function init(): void
    {
        self::$config = require __DIR__ . '/../config/database.php';
    }

    /**
     * Ottiene la connessione al database (Singleton)
     */
    public static function getConnection(): PDO
    {
        if (self::$connection === null) {
            self::init();
            self::connect();
        }
        
        return self::$connection;
    }

    /**
     * Crea la connessione al database
     */
    private static function connect(): void
    {
        try {
            $dsn = sprintf(
                'mysql:host=%s;port=%d;dbname=%s;charset=%s',
                self::$config['host'],
                self::$config['port'],
                self::$config['database'],
                self::$config['charset']
            );

            self::$connection = new PDO(
                $dsn,
                self::$config['username'],
                self::$config['password'],
                self::$config['options']
            );

            // Test della connessione
            self::$connection->query('SELECT 1');
            
        } catch (PDOException $e) {
            throw new PDOException(
                "Errore connessione database: " . $e->getMessage(),
                (int)$e->getCode()
            );
        }
    }

    /**
     * Esegue una query preparata
     */
    public static function query(string $sql, array $params = []): \PDOStatement
    {
        $stmt = self::getConnection()->prepare($sql);
        $stmt->execute($params);
        return $stmt;
    }

    /**
     * Ottiene un singolo record
     */
    public static function fetchOne(string $sql, array $params = []): ?array
    {
        $stmt = self::query($sql, $params);
        $result = $stmt->fetch();
        return $result ?: null;
    }

    /**
     * Ottiene tutti i record
     */
    public static function fetchAll(string $sql, array $params = []): array
    {
        $stmt = self::query($sql, $params);
        return $stmt->fetchAll();
    }

    /**
     * Esegue un INSERT e ritorna l'ID inserito
     */
    public static function insert(string $table, array $data): int
    {
        $columns = implode(', ', array_keys($data));
        $placeholders = ':' . implode(', :', array_keys($data));
        
        $sql = "INSERT INTO {$table} ({$columns}) VALUES ({$placeholders})";
        self::query($sql, $data);
        
        return (int)self::getConnection()->lastInsertId();
    }

    /**
     * Esegue un UPDATE
     */
    public static function update(string $table, array $data, string $where, array $whereParams = []): int
    {
        $setParts = [];
        foreach (array_keys($data) as $column) {
            $setParts[] = "{$column} = :{$column}";
        }
        $setClause = implode(', ', $setParts);
        
        $sql = "UPDATE {$table} SET {$setClause} WHERE {$where}";
        $stmt = self::query($sql, array_merge($data, $whereParams));
        
        return $stmt->rowCount();
    }

    /**
     * Chiude la connessione
     */
    public static function close(): void
    {
        self::$connection = null;
    }
} 
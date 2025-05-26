<?php
/**
 * The Safe Place - Backend API
 * GameController.php
 * 
 * Controller per gestire salvataggio e caricamento partite
 * Gestisce la migrazione da localStorage a MySQL
 */

namespace SafePlace\Api;

use SafePlace\Database;
use PDO;

class GameController {
    private $db;
    
    public function __construct() {
        $this->db = Database::getInstance();
    }
    
    /**
     * Salva una partita nel database
     * POST /api/game/save
     */
    public function saveGame() {
        try {
            // Verifica metodo HTTP
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
                http_response_code(405);
                return ['error' => 'Metodo non consentito'];
            }
            
            // Leggi dati JSON dal body
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!$input) {
                http_response_code(400);
                return ['error' => 'Dati JSON non validi'];
            }
            
            // Validazione dati richiesti
            $requiredFields = ['character_id', 'session_data'];
            foreach ($requiredFields as $field) {
                if (!isset($input[$field])) {
                    http_response_code(400);
                    return ['error' => "Campo richiesto mancante: $field"];
                }
            }
            
            $characterId = (int)$input['character_id'];
            $sessionData = $input['session_data'];
            $characterData = $input['character_data'] ?? null;
            
            // Validazione character_id
            if ($characterId <= 0) {
                http_response_code(400);
                return ['error' => 'character_id non valido'];
            }
            
            // Verifica che il personaggio esista
            $character = $this->getCharacterById($characterId);
            if (!$character) {
                http_response_code(404);
                return ['error' => 'Personaggio non trovato'];
            }
            
            // Inizia transazione
            $this->db->getConnection()->beginTransaction();
            
            try {
                // Aggiorna dati personaggio se forniti
                if ($characterData) {
                    $this->updateCharacter($characterId, $characterData);
                }
                
                // Salva/aggiorna sessione di gioco
                $sessionId = $this->saveGameSession($characterId, $sessionData);
                
                // Aggiorna inventario se presente nei dati sessione
                if (isset($sessionData['player']['inventory'])) {
                    $this->updateInventory($characterId, $sessionData['player']['inventory']);
                }
                
                // Commit transazione
                $this->db->getConnection()->commit();
                
                return [
                    'success' => true,
                    'message' => 'Partita salvata con successo',
                    'session_id' => $sessionId,
                    'character_id' => $characterId,
                    'timestamp' => date('Y-m-d H:i:s')
                ];
                
            } catch (Exception $e) {
                $this->db->getConnection()->rollback();
                throw $e;
            }
            
        } catch (Exception $e) {
            error_log("Errore saveGame: " . $e->getMessage());
            http_response_code(500);
            return ['error' => 'Errore interno del server durante il salvataggio'];
        }
    }
    
    /**
     * Carica una partita dal database
     * GET /api/game/load/{character_id}
     */
    public function loadGame($characterId) {
        try {
            // Verifica metodo HTTP
            if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
                http_response_code(405);
                return ['error' => 'Metodo non consentito'];
            }
            
            $characterId = (int)$characterId;
            
            if ($characterId <= 0) {
                http_response_code(400);
                return ['error' => 'character_id non valido'];
            }
            
            // Carica dati personaggio
            $character = $this->getCharacterById($characterId);
            if (!$character) {
                http_response_code(404);
                return ['error' => 'Personaggio non trovato'];
            }
            
            // Carica ultima sessione
            $session = $this->getLatestGameSession($characterId);
            if (!$session) {
                http_response_code(404);
                return ['error' => 'Nessuna sessione salvata trovata'];
            }
            
            // Carica inventario
            $inventory = $this->getInventory($characterId);
            
            return [
                'success' => true,
                'character_data' => $character,
                'session_data' => json_decode($session['session_data'], true),
                'inventory' => $inventory,
                'last_save' => $session['last_save'],
                'character_id' => $characterId
            ];
            
        } catch (Exception $e) {
            error_log("Errore loadGame: " . $e->getMessage());
            http_response_code(500);
            return ['error' => 'Errore interno del server durante il caricamento'];
        }
    }
    
    /**
     * Lista personaggi di un utente
     * GET /api/characters/{user_id}
     */
    public function getCharacters($userId = null) {
        try {
            // Per ora usiamo un user_id di default (sistema senza autenticazione)
            $userId = $userId ?? 1;
            
            $sql = "SELECT id, name, level, experience, health, 
                           position, stats, created_at, updated_at 
                    FROM characters 
                    WHERE user_id = ? 
                    ORDER BY updated_at DESC";
            
            $characters = $this->db->fetchAll($sql, [$userId]);
            
            // Decodifica JSON fields
            foreach ($characters as &$character) {
                $character['position'] = json_decode($character['position'], true);
                $character['stats'] = json_decode($character['stats'], true);
            }
            
            return [
                'success' => true,
                'characters' => $characters,
                'count' => count($characters)
            ];
            
        } catch (Exception $e) {
            error_log("Errore getCharacters: " . $e->getMessage());
            http_response_code(500);
            return ['error' => 'Errore interno del server'];
        }
    }
    
    /**
     * Crea un nuovo personaggio
     * POST /api/characters
     */
    public function createCharacter() {
        try {
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
                http_response_code(405);
                return ['error' => 'Metodo non consentito'];
            }
            
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!$input) {
                http_response_code(400);
                return ['error' => 'Dati JSON non validi'];
            }
            
            // Dati di default per nuovo personaggio
            $name = $input['name'] ?? 'Survivor_' . time();
            $userId = $input['user_id'] ?? 1; // Default user per ora
            $level = $input['level'] ?? 1;
            $experience = $input['experience'] ?? 0;
            $health = $input['health'] ?? 100;
            $position = json_encode($input['position'] ?? ['x' => 5, 'y' => 5]);
            $stats = json_encode($input['stats'] ?? [
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
            ]);
            
            $sql = "INSERT INTO characters (user_id, name, level, experience, health, position, stats) 
                    VALUES (?, ?, ?, ?, ?, ?, ?)";
            
            $characterId = $this->db->insert($sql, [
                $userId, $name, $level, $experience, $health, $position, $stats
            ]);
            
            return [
                'success' => true,
                'character_id' => $characterId,
                'message' => 'Personaggio creato con successo'
            ];
            
        } catch (Exception $e) {
            error_log("Errore createCharacter: " . $e->getMessage());
            http_response_code(500);
            return ['error' => 'Errore interno del server'];
        }
    }
    
    // --- METODI PRIVATI DI SUPPORTO ---
    
    private function getCharacterById($characterId) {
        $sql = "SELECT * FROM characters WHERE id = ?";
        $character = $this->db->fetchOne($sql, [$characterId]);
        
        if ($character) {
            $character['position'] = json_decode($character['position'], true);
            $character['stats'] = json_decode($character['stats'], true);
        }
        
        return $character;
    }
    
    private function updateCharacter($characterId, $characterData) {
        $sql = "UPDATE characters SET 
                name = ?, level = ?, experience = ?, health = ?, 
                position = ?, stats = ?, updated_at = CURRENT_TIMESTAMP 
                WHERE id = ?";
        
        $this->db->query($sql, [
            $characterData['name'] ?? 'Survivor',
            $characterData['level'] ?? 1,
            $characterData['experience'] ?? 0,
            $characterData['health'] ?? 100,
            json_encode($characterData['position'] ?? ['x' => 5, 'y' => 5]),
            json_encode($characterData['stats'] ?? []),
            $characterId
        ]);
    }
    
    private function saveGameSession($characterId, $sessionData) {
        // Controlla se esiste già una sessione per questo personaggio
        $existingSession = $this->getLatestGameSession($characterId);
        
        $sessionDataJson = json_encode($sessionData);
        
        if ($existingSession) {
            // Aggiorna sessione esistente
            $sql = "UPDATE game_sessions SET 
                    session_data = ?, last_save = CURRENT_TIMESTAMP 
                    WHERE character_id = ?";
            
            $this->db->query($sql, [$sessionDataJson, $characterId]);
            return $existingSession['id'];
        } else {
            // Crea nuova sessione
            $sql = "INSERT INTO game_sessions (character_id, session_data) VALUES (?, ?)";
            return $this->db->insert($sql, [$characterId, $sessionDataJson]);
        }
    }
    
    private function getLatestGameSession($characterId) {
        $sql = "SELECT * FROM game_sessions 
                WHERE character_id = ? 
                ORDER BY last_save DESC 
                LIMIT 1";
        
        return $this->db->fetchOne($sql, [$characterId]);
    }
    
    private function updateInventory($characterId, $inventoryData) {
        // Cancella inventario esistente
        $sql = "DELETE FROM inventory WHERE character_id = ?";
        $this->db->query($sql, [$characterId]);
        
        // Inserisci nuovo inventario
        if (!empty($inventoryData)) {
            $sql = "INSERT INTO inventory (character_id, item_id, quantity, durability, item_data) 
                    VALUES (?, ?, ?, ?, ?)";
            
            foreach ($inventoryData as $item) {
                $this->db->query($sql, [
                    $characterId,
                    $item['itemId'],
                    $item['quantity'] ?? 1,
                    $item['durability'] ?? 100,
                    json_encode($item)
                ]);
            }
        }
    }
    
    private function getInventory($characterId) {
        $sql = "SELECT * FROM inventory WHERE character_id = ?";
        $items = $this->db->fetchAll($sql, [$characterId]);
        
        foreach ($items as &$item) {
            $item['item_data'] = json_decode($item['item_data'], true);
        }
        
        return $items;
    }
} 
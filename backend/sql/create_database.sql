-- Script di creazione database per The Safe Place
-- Eseguire in phpMyAdmin o MySQL command line

-- Creazione database
CREATE DATABASE IF NOT EXISTS safeplace_db 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE safeplace_db;

-- Tabella utenti (per futuro sistema autenticazione)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE
);

-- Tabella personaggi
CREATE TABLE IF NOT EXISTS characters (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(50) NOT NULL,
    level INT DEFAULT 1,
    experience INT DEFAULT 0,
    health INT DEFAULT 100,
    max_health INT DEFAULT 100,
    energy INT DEFAULT 100,
    max_energy INT DEFAULT 100,
    position_x INT DEFAULT 0,
    position_y INT DEFAULT 0,
    current_map VARCHAR(50) DEFAULT 'wasteland',
    stats JSON NOT NULL, -- Statistiche del personaggio
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabella sessioni di gioco
CREATE TABLE IF NOT EXISTS game_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    character_id INT NOT NULL,
    session_data JSON NOT NULL, -- Stato completo del gioco
    last_save TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE
);

-- Tabella inventario
CREATE TABLE IF NOT EXISTS inventory (
    id INT AUTO_INCREMENT PRIMARY KEY,
    character_id INT NOT NULL,
    item_id VARCHAR(50) NOT NULL,
    quantity INT DEFAULT 1,
    durability INT DEFAULT 100,
    item_data JSON NULL, -- Dati specifici dell'oggetto
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE
);

-- Tabella eventi/log
CREATE TABLE IF NOT EXISTS events_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    character_id INT NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    event_data JSON NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE
);

-- Indici per performance
CREATE INDEX idx_characters_user_id ON characters(user_id);
CREATE INDEX idx_game_sessions_character_id ON game_sessions(character_id);
CREATE INDEX idx_inventory_character_id ON inventory(character_id);
CREATE INDEX idx_events_character_id ON events_log(character_id);
CREATE INDEX idx_events_timestamp ON events_log(timestamp);

-- Inserimento dati di test
INSERT INTO users (username, email, password_hash) VALUES 
('test_player', 'test@safeplace.local', '$2y$10$example_hash_for_testing');

INSERT INTO characters (user_id, name, stats) VALUES 
(1, 'Sopravvissuto', '{"strength": 10, "agility": 8, "intelligence": 12, "luck": 6}');

-- Messaggio di conferma
SELECT 'Database The Safe Place creato con successo!' as message; 
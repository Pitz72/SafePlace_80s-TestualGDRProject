# Analisi Struttura Database - The Safe Place

Questo documento descrive la struttura del database `safeplace_db` come definito in `archives/safeplace_advanced/backend/sql/create_database.sql`.

## Schema Generale

Il database è progettato per supportare un gioco di ruolo (GDR) con salvataggi di stato, gestione dei personaggi e un sistema di inventario. L'uso estensivo di campi `JSON` indica che molti dettagli specifici del gioco sono gestiti a livello applicativo (PHP/JavaScript) piuttosto che essere definiti rigidamente nello schema del database.

## Analisi delle Tabelle

### 1. `users`

*   **Scopo:** Gestire gli account dei giocatori.
*   **Campi Chiave:**
    *   `id`: Chiave primaria.
    *   `username`, `email`: Credenziali utente.
    *   `password_hash`: Per l'autenticazione.
*   **Note:** Tabella standard per l'autenticazione, probabilmente per un futuro sistema multi-utente.

### 2. `characters`

*   **Scopo:** Tabella centrale che definisce i personaggi giocanti.
*   **Campi Chiave:**
    *   `id`: Chiave primaria.
    *   `user_id`: Collega il personaggio a un utente.
    *   `name`: Nome del personaggio.
    *   `level`, `experience`: Sistema di progressione.
    *   `health`, `max_health`, `energy`, `max_energy`: Risorse primarie del personaggio.
    *   `position_x`, `position_y`, `current_map`: Posizione nel mondo di gioco.
    *   `stats` (JSON): Contiene le statistiche base (es. forza, agilità, intelligenza). L'uso di JSON permette di aggiungere/modificare statistiche senza alterare lo schema DB.

### 3. `game_sessions`

*   **Scopo:** Gestire i dati di salvataggio.
*   **Campi Chiave:**
    *   `id`: Chiave primaria.
    *   `character_id`: Associa il salvataggio a un personaggio.
    *   `session_data` (JSON): Contiene uno snapshot completo dello stato del gioco al momento del salvataggio. Questo potrebbe includere lo stato degli NPC, degli eventi in corso, e altre informazioni dinamiche del mondo.

### 4. `inventory`

*   **Scopo:** Gestire l'inventario di un personaggio.
*   **Campi Chiave:**
    *   `id`: Chiave primaria.
    *   `character_id`: Associa l'oggetto a un personaggio.
    *   `item_id` (VARCHAR): Identificatore univoco del tipo di oggetto (es. "pistola_9mm", "medkit"). La logica degli oggetti risiederà nel codice.
    *   `quantity`: Numero di oggetti dello stesso tipo.
    *   `durability`: Valore di usura dell'oggetto, suggerisce una meccanica di riparazione/degrado.
    *   `item_data` (JSON): Per dati specifici di un'istanza di un oggetto (es. mod, statistiche bonus).

### 5. `events_log`

*   **Scopo:** Tracciare le azioni e gli eventi importanti per un personaggio.
*   **Campi Chiave:**
    *   `id`: Chiave primaria.
    *   `character_id`: Associa l'evento a un personaggio.
    *   `event_type` (VARCHAR): Categoria dell'evento (es. `combattimento`, `dialogo`, `crafting`).
    *   `event_data` (JSON): Contiene i dettagli specifici dell'evento (es. nemico sconfitto, oggetto trovato, scelta effettuata).

## Implicazioni per il Porting

*   **Flessibilità dei Dati:** L'uso di JSON per statistiche, dati di sessione e oggetti significa che il nuovo engine dovrà avere un robusto sistema di serializzazione/deserializzazione per gestire questi dati.
*   **Logica Applicativa:** La vera "intelligenza" del gioco (come funzionano gli oggetti, gli eventi, le statistiche) non è nel database ma nel codice (PHP/JS). L'analisi di questi script sarà fondamentale.
*   **Entità di Gioco:** Lo schema conferma le entità di base da ricreare: Utenti, Personaggi, Inventario, Sessioni, Log Eventi. 
# Analisi API e Endpoint - GameController

Questo documento analizza il controller principale del backend, `archives/safeplace_advanced/backend/api/GameController.php`. Questo file è il cervello del backend e gestisce la logica di gioco lato server.

## Architettura Generale

*   **Controller API REST-like**: Lo script non genera HTML. Il suo unico scopo è fornire endpoint (URL) a cui il frontend JavaScript può inviare e da cui può ricevere dati.
*   **Formato Dati JSON**: Tutta la comunicazione tra frontend e backend avviene tramite il formato JSON. Il controller riceve JSON e risponde con JSON.
*   **Logica di Business**: Contiene la logica di alto livello per le operazioni fondamentali del gioco, come il salvataggio e il caricamento.
*   **Astrazione del Database**: Come previsto dall'analisi precedente, questo file non contiene codice SQL o di connessione. Utilizza esclusivamente i metodi forniti dalla classe `SafePlace\Database` per interagire con il database.
*   **Transazioni per l'Integrità dei Dati**: L'operazione di salvataggio è avvolta in una transazione di database (`beginTransaction`, `commit`, `rollback`). Questo è un punto cruciale perché garantisce che i dati rimangano consistenti: se anche solo una parte del salvataggio fallisce (es. l'inventario), l'intero salvataggio viene annullato.

## Endpoint Principali (Metodi Pubblici)

Anche se non è presente un router esplicito, possiamo dedurre i seguenti endpoint dai metodi e dai commenti:

### 1. `saveGame()` - `POST /api/game/save`

*   **Funzione**: Salva lo stato completo di una partita.
*   **Logica**:
    1.  Riceve un oggetto JSON contenente `character_id`, `session_data` (lo stato del mondo di gioco) e `character_data` (lo stato del personaggio).
    2.  Avvia una transazione.
    3.  Aggiorna la tabella `characters` con i dati correnti del personaggio (livello, vita, etc.).
    4.  Salva/Aggiorna la tabella `game_sessions` con il JSON `session_data`.
    5.  Sincronizza l'inventario del giocatore nella tabella `inventory` basandosi sui dati ricevuti.
    6.  Esegue il commit della transazione.
*   **Implicazioni**: Il frontend è responsabile di mantenere lo stato aggiornato e di inviarlo periodicamente o su richiesta al backend.

### 2. `loadGame($characterId)` - `GET /api/game/load/{character_id}`

*   **Funzione**: Carica una partita per un dato personaggio.
*   **Logica**:
    1.  Recupera i dati principali dalla tabella `characters`.
    2.  Recupera l'ultima sessione dalla tabella `game_sessions`.
    3.  Recupera l'intero inventario dalla tabella `inventory`.
    4.  Aggrega tutti questi dati in un unico oggetto JSON e lo restituisce al frontend.
*   **Implicazioni**: Al caricamento, il frontend riceve un "pacchetto" completo con tutte le informazioni necessarie per ricostruire lo stato del gioco.

### 3. `getCharacters($userId)` - `GET /api/characters/{user_id}`

*   **Funzione**: Fornisce una lista di personaggi salvati per un utente (attualmente l'utente è hardcoded a `1`).
*   **Implicazioni**: Supporta un menu di selezione del personaggio.

### 4. `createCharacter()` - `POST /api/characters`

*   **Funzione**: Crea un nuovo personaggio nel database.
*   **Logica**:
    1.  Riceve un nome per il personaggio.
    2.  Crea una nuova riga nella tabella `characters` con valori e statistiche di default.
*   **Fonte di Dati Chiave**: Le statistiche di default definite in questo metodo sono una miniera di informazioni sulle meccaniche di base del gioco:
    *   `maxHp`: Punti vita massimi.
    *   `food`, `water`: Meccaniche di sopravvivenza (fame e sete).
    *   `vigore`, `potenza`, `agilita`, `precisione`: Statistiche di combattimento.
    *   `trascinamento`: Probabilmente legato al peso trasportabile/inventario.
    *   `infiltrazione`: Meccanica stealth/furtività.
    *   `adattamento`: Statistica di resistenza o ambientale.

## Implicazioni per il Porting

*   **Architettura Client-Server**: Il nuovo engine dovrà replicare questa architettura. Un'API lato server gestirà la persistenza dei dati, mentre il client di gioco gestirà la logica in tempo reale e comunicherà con l'API.
*   **Stato di Gioco**: Il concetto di `session_data` (un grande oggetto JSON che rappresenta lo stato del mondo) è un pattern centrale da replicare. Il nuovo engine dovrà essere in grado di serializzare e deserializzare il suo stato di gioco in un formato simile.
*   **Meccaniche di Gioco**: Le statistiche di `createCharacter` forniscono una checklist iniziale per le meccaniche di base da implementare.
*   **Flusso di Dati**: Il flusso `load` -> `play` (sul client) -> `save` è chiaramente definito e deve essere mantenuto. 
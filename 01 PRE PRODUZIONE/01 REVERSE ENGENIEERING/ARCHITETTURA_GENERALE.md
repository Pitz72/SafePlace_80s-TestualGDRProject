# Documento di Architettura Generale - The Safe Place

Questo documento descrive l'architettura tecnica complessiva del progetto "The Safe Place", analizzata dalla versione in `archives/safeplace_advanced`.

## 1. Panoramica Generale

Il progetto è un'applicazione web monolitica con una chiara separazione tra backend e frontend, pur essendo servita dallo stesso web server.

-   **Stack Tecnologico**:
    -   **Backend**: PHP 8.2 (Vanilla)
    -   **Database**: MySQL
    -   **Frontend**: HTML5, CSS3, JavaScript (ES6+, Vanilla)
-   **Paradigmi di Progettazione**:
    -   **Backend**: API REST-like
    -   **Frontend**: Single Page Application (SPA), design modulare e event-driven.

## 2. Architettura del Backend

Il backend è un'applicazione PHP "vanilla" (senza framework) con responsabilità limitate e ben definite.

-   **Struttura**:
    -   `public/index.php`: Entry point per le richieste API.
    -   `api/GameController.php`: Il cuore del backend. Gestisce le chiamate API per le operazioni di gioco principali.
    -   `src/Database.php`: Una classe wrapper per la connessione al database tramite PDO, che garantisce l'uso di prepared statements per la sicurezza.
    -   `sql/create_database.sql`: Script SQL per la creazione dello schema del database.
-   **Funzionalità Principali**:
    -   **API REST-like**: Comunica con il frontend tramite JSON.
    -   **Persistenza Dati**: Le uniche responsabilità del backend sono salvare, caricare e creare i dati della partita del giocatore (stato del personaggio, inventario, progressi).
    -   **Stateless**: Il backend non mantiene lo stato del gioco; riceve lo stato completo dal frontend, lo salva nel database e lo restituisce quando richiesto.
-   **Database**:
    -   Lo schema del database è ben strutturato e fa uso di campi JSON per immagazzinare dati complessi come l'inventario o i flag narrativi, garantendo flessibilità.

## 3. Architettura del Frontend

Il frontend è dove risiede la quasi totalità della logica di gioco. È un'applicazione JavaScript "vanilla" complessa.

-   **Struttura**:
    -   `index.html`: Il singolo entry point dell'applicazione.
    -   `js/`: Contiene tutto il codice JavaScript, suddiviso in file con responsabilità specifiche.
    -   `css/`: Fogli di stile per l'interfaccia utente.
-   **Design Modulare**: Nonostante l'assenza di un framework, il codice è organizzato in moduli de-facto:
    -   `game_core.js`: Gestore dello stato globale e del loop di gioco principale.
    -   `ui.js`: Motore di rendering che aggiorna il DOM.
    -   `player.js`: Modulo che gestisce i dati e le azioni del giocatore.
    -   `advanced_combat_system.js`: Modulo autonomo per la logica di combattimento.
    -   `lore_event_manager.js`: Modulo per la gestione del ritmo narrativo.
-   **Event-Driven**: L'interazione dell'utente e gli eventi di gioco guidano il flusso dell'applicazione.
-   **Monkey Patching**: Il codice fa un uso intelligente del "monkey patching" per estendere le funzionalità di base senza modificarle direttamente (es. il `LoreEventManager` che si aggancia a `window.movePlayer`).

## 4. Flusso di Dati

-   **Avvio del Gioco**: Il browser carica `index.html`, che a sua volta carica tutti i file CSS e JS.
-   **Inizio Partita**: Il frontend gestisce la creazione del personaggio e l'inizializzazione dello stato di gioco.
-   **Gameplay**: Tutta la logica di gioco (movimento, combattimento, eventi) è gestita interamente lato client in JavaScript.
-   **Salvataggio/Caricamento**:
    -   **Salvataggio**: Quando il giocatore salva, il frontend invia l'intero stato del gioco (oggetto `player`, `game_state`, etc.) al backend tramite una richiesta API POST. Il backend salva questi dati nel database.
    -   **Caricamento**: All'avvio, il frontend può richiedere al backend i dati di una partita salvata. Il backend li recupera dal database e li restituisce come JSON, che il frontend usa per ripristinare lo stato del gioco.

## 5. Conclusione per il Porting

-   **Backend Sostituibile**: L'architettura del backend è così semplice che può essere facilmente sostituita da qualsiasi altro sistema (Node.js, C#, etc.) o persino eliminata in favore di salvataggi locali (file, LocalStorage) se non è richiesta una persistenza online.
-   **Frontend da Riscrivere**: Il frontend è il cuore del progetto. Il porting richiederà una riscrittura completa della logica contenuta nei file JavaScript, adattandola alle API e ai paradigmi del nuovo engine. Tuttavia, la chiara suddivisione in moduli faciliterà la migrazione delle singole funzionalità (combattimento, inventario, eventi, etc.). 
# Roadmap per il Porting di "The Safe Place"

Questo documento traccia le attività necessarie per analizzare il progetto originale in `archives/safeplace_advanced` e produrre la documentazione tecnica per un futuro porting su un nuovo engine.

## Stato Attuale: FASE 2 Completata

-   [X] **FASE 1: Analisi Backend**
    -   [X] 1.1: Analisi Struttura Database (`backend/sql/create_database.sql`)
    -   [X] 1.2: Analisi Logica di Connessione al DB (`backend/src/Database.php`)
    -   [X] 1.3: Analisi API e Endpoint (`backend/api/GameController.php`)
    -   [X] 1.4: Analisi Script di Supporto (`backend/*.php`)
-   [X] **FASE 2: Analisi Frontend**
    -   [X] 2.1: Analisi Struttura HTML (`index.html` - *Nota: la lista script è obsoleta*)
    -   [X] 2.2: Analisi Logica Principale UI e Core (`js/game_core.js`, `js/ui.js`, `js/player.js`)
    -   [X] 2.3: Analisi Sistema di Combattimento (`js/advanced_combat_system.js`, `js/events.js`)
    -   [X] 2.4: Analisi Gestione Inventario (in `js/player.js` e `js/ui.js`)
    -   [X] 2.5: Analisi Sistemi di Progressione (in `js/player.js`)
-   [X] **FASE 3: Analisi Contenuti di Gioco**
    -   [X] 3.1: Analisi Eventi (`js/events.js`, `js/lore_event_manager.js`)
    -   [X] 3.2: Analisi Database Oggetti (`js/game_data.js`, `js/advanced_items_database.js`)
    -   [X] 3.3: Analisi Database Nemici (in `js/game_data.js`?) - Trovato in `js/data/enemies_database.js`
    -   [X] 3.4: Analisi Testi Narrativi e Lore
-   [X] **FASE 4: Analisi Asset**
    -   [X] 4.1: Catalogazione Immagini (`image/`)
-   [X] **FASE 5: Sintesi Progettuale**
    -   [X] 5.1: Creazione Documento Architettura Generale
    -   [X] 5.2: Creazione Documento Game Design (Meccaniche, Loop di Gioco)
    -   [X] 5.3: Creazione Documento Contenuti (Eventi, Oggetti, Personaggi)

---

*Questo documento verrà aggiornato al completamento di ogni task.* 
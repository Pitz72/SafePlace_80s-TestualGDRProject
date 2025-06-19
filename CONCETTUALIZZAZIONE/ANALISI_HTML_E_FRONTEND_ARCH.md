# Analisi Struttura HTML e Architettura Frontend

Questo documento analizza il file `archives/safeplace_advanced/index.html`. Questo file è la base dell'intera applicazione frontend e fornisce indizi fondamentali sulla struttura dell'interfaccia utente (UI) e sull'architettura del codice JavaScript.

## 1. Struttura dell'Interfaccia Utente (UI)

Il corpo del documento HTML definisce una serie di "schermate" e "pannelli", ognuno con un ID univoco. Questo ci fornisce una mappa completa degli elementi visivi del gioco.

### Schermate Principali

*   `start-screen-container`: Il menu principale del gioco (`Nuova Partita`, `Carica Partita`).
*   `character-selection-screen`: UI per selezionare un personaggio salvato.
*   `character-creation-screen`: UI per dare un nome a un nuovo personaggio.
*   `game-container`: Il contenitore principale visibile durante il gameplay attivo.
*   `end-screen`: La schermata mostrata alla fine di una partita.

### Layout del Gioco (`game-container`)

L'interfaccia di gioco è un classico layout a tre colonne, tipico dei giochi di ruolo testuali/grafici:

*   **Pannello Sinistro (`left-panel`):** Contiene informazioni dinamiche sullo stato del giocatore e del mondo.
    *   `survival-panel`: Mostra le statistiche di sopravvivenza (fame, sete).
    *   `inventory-panel`: Lista degli oggetti del giocatore.
    *   `messages-panel`: Log degli eventi e delle azioni.
*   **Pannello Centrale (`map-panel`):** Il fulcro dell'interazione.
    *   `map-display`: Un tag `<pre>` destinato a contenere la mappa in stile ASCII art.
    *   `controls`: Controlli di movimento e comandi di salvataggio.
*   **Pannello Destro (`right-panel`):** Contiene le statistiche e le informazioni di riferimento.
    *   `game-info`: Posizione, tipo di luogo, ora.
    *   `stats`: Le statistiche di combattimento e abilità del personaggio.
    *   `legend-panel`: Legenda dei simboli della mappa.

### Interfacce Sovrapposte (Overlays/Popups)

Il gioco utilizza degli overlay a schermo intero per gestire interazioni specifiche, mettendo in pausa il gioco principale:

*   `event-overlay`: Per eventi narrativi che richiedono scelte.
*   `item-action-overlay`: Per mostrare le azioni disponibili per un oggetto (Usa, Equipaggia, etc.).
*   `crafting-overlay`: Un'interfaccia di crafting complessa con ricette e ingredienti.

## 2. Architettura del Codice JavaScript

L'ordine di inclusione dei file `<script>` alla fine del file HTML è l'indizio più importante sull'architettura del frontend.

### Separazione tra Dati e Logica

C'è una netta distinzione tra file che contengono *dati di gioco* e file che contengono *logica di gioco*.

*   **Dati di Gioco (`js/data/` e `js/events/`)**:
    *   Queste cartelle contengono file JavaScript che definiscono oggetti, nemici, ricette, eventi e dialoghi come variabili o oggetti JavaScript.
    *   **Implicazione Fondamentale**: La maggior parte dei contenuti del gioco **non risiede nel database MySQL**. Il database serve a salvare lo *stato di avanzamento* del giocatore (inventario, posizione, statistiche), ma le definizioni di base degli elementi di gioco sono hardcoded nel codice frontend. Per il porting, questi file devono essere analizzati e i loro dati estratti con la stessa attenzione del database.

*   **Logica di Gioco (`js/managers/`)**:
    *   Il codice è organizzato in un **pattern a "Manager"**, dove ogni file ha una responsabilità chiara e distinta.
    *   **Esempi**: `UIManager` (aggiorna l'HTML), `MapManager` (disegna la mappa), `PlayerManager` (gestisce i dati del giocatore), `SaveLoadManager` (comunica con l'API PHP), `CombatManager`, `CraftingManager`.
    *   Questa architettura modulare è un'ottima base per il porting, poiché le responsabilità sono già separate.

### Punto di Ingresso

*   **`js/main.js`**: Essendo l'ultimo script caricato, questo è l'entry point dell'applicazione. Sarà responsabile di inizializzare tutti i manager e di avviare il loop di gioco.

## 3. Implicazioni per il Porting

*   **Mappa della UI**: La struttura HTML fornisce una checklist completa di tutte le schermate e i pannelli che l'interfaccia del nuovo gioco dovrà avere.
*   **Architettura da Replicare**: Il pattern a Manager è solido e può essere replicato nel nuovo engine. Si possono creare classi o sistemi equivalenti per ogni manager.
*   **Doppia Fonte di Dati**: Il processo di estrazione dei dati per il porting deve considerare due fonti principali:
    1.  Il **database MySQL** per la struttura dei salvataggi e dei dati persistenti del giocatore.
    2.  Le cartelle **`js/data/` e `js/events/`** per tutti i contenuti di gioco (oggetti, nemici, lore, eventi, etc.).
*   **Prossimi Passi di Analisi**: L'analisi del frontend deve procedere esaminando `js/main.js` per capire il flusso di inizializzazione, e successivamente i manager più critici come `GameManager`, `UIManager`, e `SaveLoadManager`. 
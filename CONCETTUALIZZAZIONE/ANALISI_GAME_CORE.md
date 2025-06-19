# FASE 2: Analisi del Frontend - `game_core.js` e Costanti di Gioco

Questo documento analizza `archives/safeplace_advanced/js/game_core.js` e le costanti fondamentali definite in `game_data.js`. Insieme, questi elementi costituiscono il "cervello" e le "leggi fisiche" del mondo di gioco.

## 1. Architettura e Ruoli

A differenza di altri script focalizzati su un singolo aspetto (come `player.js`), questi file hanno un ruolo più orchestrale e normativo.

*   **`game_core.js` (Il Direttore d'Orchestra)**: Gestisce il **flusso di gioco** ad alto livello. Si occupa di:
    *   **Inizializzazione**: Avviare una nuova partita (`initializeGame`), resettando tutte le variabili di stato.
    *   **Gestione degli Input**: Contiene i principali *event listener* che catturano i comandi da tastiera e mouse.
    *   **Loop di Gioco**: Implementa la logica che avanza lo stato del gioco a ogni azione del giocatore (es. il passaggio del tempo, il ciclo giorno/notte).
    *   **Condizioni di Vittoria/Sconfitta**: Contiene la logica `endGame` che determina e visualizza la fine della partita.

*   **`game_data.js` (Il Libro delle Regole)**: Funge da database statico per le **costanti di gioco**. Definisce le regole numeriche immutabili che bilanciano l'esperienza. Esempi includono le soglie per gli stati di salute, le probabilità degli eventi e i tassi di consumo delle risorse.

## 2. Meccaniche Fondamentali Estratte

### 2.1. Il Ciclo di Vita di una Partita

1.  L'utente clicca "Nuova Partita", che invoca `initializeGame()`.
2.  `initializeGame` resetta le variabili globali (`gameDay`, `isDay`, etc.), invoca `generateCharacter()` e `generateMap()`, e infine renderizza lo stato iniziale della UI.
3.  Il gioco attende l'input del giocatore.
4.  Ogni azione del giocatore (es. un movimento) avanza il contatore del tempo (`dayMovesCounter`).
5.  Raggiunta una soglia di azioni, scatta la transizione giorno/notte, che applica penalità o consuma risorse.
6.  Il ciclo si ripete finché non viene raggiunta una condizione di `endGame` (HP a zero, o raggiungimento del Safe Place).

### 2.2. Gestione del Tempo e delle Risorse

Il tempo non scorre in modo reale, ma è **legato alle azioni**. Ogni movimento del giocatore consuma una frazione di giornata.

*   **Consumo Passivo**: Ad ogni transizione (specialmente al calar della notte), il gioco riduce le risorse del giocatore (`food`, `water`) e applica penalità se si trova all'aperto. Questo crea la pressione fondamentale del genere survival.
*   **Soglie di Stato**: Le costanti in `game_data.js` definiscono le soglie numeriche a cui scattano gli stati negativi (es. `player.hp <= 20` per lo stato "Morente").

## 3. Implicazioni per il Porting

*   **GameManager/GameController**: La logica di `game_core.js` dovrebbe essere incapsulata in una classe `GameManager` o `GameController`. Questa classe sarebbe responsabile del ciclo di vita del gioco, della gestione dello stato (pausa, attivo, game over) e di orchestrare le chiamate agli altri sistemi (Player, UI, Eventi).
*   **File di Configurazione**: Le costanti di `game_data.js` dovrebbero essere estratte in un file di configurazione facilmente modificabile (es. JSON, YAML, o un oggetto di configurazione statico). Questo permette di bilanciare il gioco senza dover toccare il codice sorgente della logica.
*   **Motore a Stati**: Il flusso del gioco (Menu Principale -> Gioco -> Schermata di Fine) è un esempio perfetto di una macchina a stati finiti (`Finite State Machine`), un pattern di progettazione molto comune nello sviluppo di giochi per gestire lo stato globale dell'applicazione.

---

## APPENDICE A: Codice e Costanti Fondamentali

### A.1 Ciclo di Vita (`initializeGame`, `endGame`)

```javascript
// Da game_core.js
function initializeGame() {
    gameActive = true;
    gamePaused = false;
    eventScreenActive = false;
    gameDay = 1;
    dayMovesCounter = 0;
    isDay = true;
    
    // ... reset altre variabili ...

    generateCharacter();
    generateMap();
    renderMap();
    renderStats();
    // ...
}

function endGame(isVictory) {
    gameActive = false;
    const endMessage = isVictory ? "Sei sopravvissuto. Hai raggiunto il Safe Place." : "La tua avventura finisce qui. Il mondo post-apocalittico non perdona.";
    
    // ... (Logica per mostrare la schermata finale) ...
}
```

### A.2 Gestione del Tempo e delle Risorse

```javascript
// Da game_core.js (logica all'interno di movePlayer e altre funzioni di avanzamento tempo)
function advanceTime() {
    dayMovesCounter++;
    
    // Esempio di consumo risorse per azione
    player.food -= 0.1; 
    player.water -= 0.15;

    if (dayMovesCounter >= MOVES_PER_DAY) {
        transitionToNight();
    }
}

function transitionToNight() {
    isDay = false;
    gameDay++;
    dayMovesCounter = 0;
    
    // Applica penalità notturne se il giocatore è all'aperto
    if (!isInShelter()) {
        player.hp -= 10; // Danno da esposizione
        addMessage(getRandomText(STATO_MESSAGGI.NOTTE_APERTO), 'danger');
    }
    // ...
}
```

### A.3 Selezione di Costanti Fondamentali

```javascript
// Da game_data.js o file di costanti simile
const MAX_INVENTORY_SLOTS = 20;
const STARTING_FOOD = 5;
const STARTING_WATER = 5;

// Probabilità di base per eventi casuali
const COMPLEX_EVENT_CHANCE = 0.25; // 25% di probabilità per passo
const EVENT_CHANCE = {
    PLAINS: 0.1,
    FOREST: 0.15,
    CITY: 0.2,
    // ...
};

// Soglie di stato
const HP_THRESHOLD_WOUNDED = 50;
const HP_THRESHOLD_DYING = 20;
const HUNGER_THRESHOLD = 2;
const THIRST_THRESHOLD = 2;

// Regole del tempo
const MOVES_PER_DAY = 20; // Quante azioni per far passare un giorno
``` 
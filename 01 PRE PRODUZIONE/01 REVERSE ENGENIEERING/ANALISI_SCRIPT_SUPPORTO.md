# Analisi Script di Supporto Backend

Questo documento analizza i file PHP aggiuntivi trovati nella directory `archives/safeplace_advanced/backend/`.

## Scopo Generale

Gli script trovati in questa cartella (al di fuori delle sottodirectory `src`, `api`, etc.) non contengono logica di gioco principale. Il loro scopo è fornire strumenti per lo **sviluppo, il setup dell'ambiente, il debug e il testing**.

## Analisi dei File Chiave

### 1. `composer.json`

*   **Scopo**: Gestione delle dipendenze e configurazione del progetto PHP.
*   **Scoperte**:
    *   **Nessuna Dipendenza di Produzione**: Il progetto è "vanilla PHP" e non richiede librerie esterne per funzionare.
    *   **Dipendenze di Sviluppo**: Utilizza `PHPUnit` per i test automatici.
    *   **Autoloading PSR-4**: Il codice è strutturato secondo lo standard PSR-4, che permette il caricamento automatico delle classi.
    *   **Punto di Ingresso**: Lo script `"serve"` definito in `composer.json` (`php -S localhost:8000 -t public`) indica chiaramente che il punto di ingresso per tutte le richieste web è il file `public/index.php`. Questa è un'informazione architetturale fondamentale.

### 2. `force_setup.php` (e `setup_database.php`)

*   **Scopo**: Script per l'inizializzazione del database.
*   **Logica**:
    1.  Si connette al server MySQL.
    2.  Legge il file `sql/create_database.sql`.
    3.  Esegue le query SQL contenute nel file per creare la struttura del database e inserire i dati iniziali.
*   **Implicazioni**: Conferma che `sql/create_database.sql` è la fonte autorevole per lo schema del database. Fornisce un modo semplice per un nuovo sviluppatore di preparare l'ambiente.

### 3. `debug_characters.php`

*   **Scopo**: Script di debug per testare la visualizzazione dei personaggi.
*   **Logica**: Istanzia il `GameController` e chiama il suo metodo `getCharacters()`, stampando a schermo il risultato.
*   **Implicazioni**: Non aggiunge nuova logica, ma fornisce un esempio pratico di come viene chiamato un metodo del controller e quale output produce.

### 4. File `test_*.php`

*   **Scopo**: Script per test manuali o semi-automatici di varie parti del backend (connessione al DB, API, etc.).
*   **Implicazioni**: Sono utili per capire le intenzioni dello sviluppatore e possono contenere esempi di utilizzo dell'API, ma non sono parte dell'applicazione finale.

## Conclusioni Finali della Fase 1 (Backend)

L'analisi del backend è completa. Abbiamo una visione chiara di un'applicazione PHP ben strutturata:

*   **Dati**: La struttura è definita in `sql/create_database.sql`.
*   **Accesso ai Dati**: Un data-layer pulito e sicuro è fornito dalla classe `Database`.
*   **Logica di Business**: La logica applicativa è concentrata nel `GameController`, che espone un'API JSON.
*   **Punto d'Ingresso**: Tutte le richieste passano per `public/index.php`.
*   **Strumenti**: Il resto dei file fornisce strumenti di supporto per lo sviluppo.

Con queste informazioni, abbiamo una solida base per capire come il frontend interagisce con il server e quali dati si aspetta di ricevere. La FASE 1 della roadmap può essere considerata completata.

# FASE 2: Analisi Script di Supporto - `game_utils.js`

Questo documento analizza `archives/safeplace_advanced/js/game_utils.js`, la "cassetta degli attrezzi" del progetto. Contiene funzioni di utilità generiche, a basso livello, che vengono riutilizzate in quasi tutti gli altri script del gioco.

## 1. Ruolo e Responsabilità

A differenza degli script che gestiscono una specifica area del gameplay (come `player.js` o `events.js`), `game_utils.js` ha il compito di **astrarre la logica comune**. Il suo scopo è fornire una libreria di funzioni riutilizzabili per compiti come:

*   **Generazione di Aleatorietà**: Fornire funzioni standard per generare numeri casuali o scegliere elementi da un array.
*   **Manipolazione di Stringhe e Testo**: Creare funzioni per formattare e gestire i messaggi di log.
*   **Logica Matematica di Gioco**: Incapsulare le formule e gli algoritmi chiave che costituiscono le fondamenta delle meccaniche di gioco (es. la risoluzione di uno "skill check").

L'esistenza di questo file è un segno di buona pratica di programmazione, in quanto riduce la duplicazione del codice e centralizza la logica fondamentale.

## 2. Funzioni Chiave Analizzate

### 2.1. Il Motore di "Tiro di Dado": `performSkillCheck`

Questa è senza dubbio la funzione più importante del file. È il cuore di quasi ogni interazione non banale nel gioco.

*   **Funzionamento**: Simula un tiro di dado d20 in stile Dungeons & Dragons. Prende la statistica rilevante del giocatore, calcola un "modificatore", aggiunge il risultato del d20 e confronta il totale con una soglia di difficoltà.
*   **Contesto-sensibile**: La funzione è abbastanza intelligente da modificare la difficoltà del tiro in base allo stato attuale del giocatore (es. essere `isInjured` rende più difficili i tiri basati su `agilita`).
*   **Impatto**: Centralizzare questa logica qui significa che il bilanciamento del gioco (es. rendere più o meno difficili tutti gli skill check) può essere fatto modificando una singola funzione.

### 2.2. Feedback al Giocatore: `getSkillCheckLikelihood`

Strettamente legata alla precedente, questa funzione non influenza il gameplay ma è cruciale per l'**esperienza utente (UX)**.

*   **Funzionamento**: Invece di mostrare al giocatore la formula esatta ("hai il 55% di possibilità di successo"), traduce la probabilità di successo di uno skill check in un testo qualitativo e comprensibile (es. "Probabilità: Alta", "Probabilità: Bassa").
*   **Impatto**: Questo permette al giocatore di prendere decisioni informate senza essere sopraffatto da calcoli numerici, mantenendo l'immersione.

### 2.3. Selezione Pesata: `chooseWeighted`

Questa funzione è il motore dietro la selezione degli eventi complessi in `events.js`.

*   **Funzionamento**: Permette di scegliere un elemento da una lista non in modo puramente casuale, ma in base a delle "probabilità pesate". Per esempio, permette di rendere l'evento "Incontro con Predoni" più probabile dell'evento "Scoperta di Tracce".
*   **Impatto**: È fondamentale per controllare il "pacing" e la varietà del gioco, assicurando che gli eventi più rari e interessanti non appaiano con la stessa frequenza di quelli più comuni.

## 3. Implicazioni per il Porting

*   **Libreria Statica o Singleton**: In un'architettura moderna, queste funzioni potrebbero essere implementate come metodi statici di una classe `GameUtils` o come un "singleton", per renderle facilmente accessibili da qualsiasi punto del codice senza bisogno di creare istanze.
*   **Criticità per la Fedeltà**: Replicare queste funzioni in modo esatto è **fondamentale** per preservare il "feel" e il bilanciamento del gioco originale. Qualsiasi modifica all'algoritmo di `performSkillCheck` o `chooseWeighted` altererebbe drasticamente l'esperienza di gioco.
*   **Punto di Partenza per il Bilanciamento**: Questi algoritmi centralizzati sono i primi punti da analizzare e modificare se si desidera alterare il livello di difficoltà o il ritmo del gioco nel porting.

---

## APPENDICE A: Codice Sorgente delle Utility Chiave

### A.1 Generazione di Aleatorietà

```javascript
// Genera un numero intero casuale tra min e max (inclusi).
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Seleziona un elemento da un array in base a probabilità pesate.
// L'input è un array di oggetti, ognuno con una proprietà 'weight'.
function chooseWeighted(weightedArray) {
    if (!weightedArray || weightedArray.length === 0) return null;

    const totalWeight = weightedArray.reduce((sum, item) => sum + (item.weight || 0), 0);
    if (totalWeight <= 0) return weightedArray[0]; // Ritorna il primo se i pesi non sono validi

    let random = Math.random() * totalWeight;
    for (const item of weightedArray) {
        random -= (item.weight || 0);
        if (random < 0) {
            return item;
        }
    }
    return weightedArray[weightedArray.length - 1]; // Fallback
}
```

### A.2 Logica degli Skill Check

```javascript
// Esegue un check su una statistica del giocatore contro una difficoltà.
function performSkillCheck(statValue, difficulty) {
    // Calcola il bonus/malus come Modificatore in D&D (stat - 10 / 2)
    const bonus = Math.floor((statValue - 10) / 2);
    const roll = getRandomInt(1, 20);

    // Applica penalità alla difficoltà basate sullo stato del giocatore
    let difficultyPenalty = 0;
    if (player.isInjured && (/* check su forza o agilità */)) {
        difficultyPenalty += 2;
    }
    if (player.isSick && (/* check su vigore o adattamento */)) {
        difficultyPenalty += 2;
    }

    const finalDifficulty = difficulty + difficultyPenalty;
    const total = roll + bonus;
    const success = total >= finalDifficulty;

    return { success, roll, bonus, total, finalDifficulty };
}

// Calcola e restituisce una stima qualitativa della probabilità di successo.
function getSkillCheckLikelihood(statKey, difficulty) {
    const statValue = player.stats[statKey];
    const bonus = Math.floor((statValue - 10) / 2);
    
    // ... (Calcola la difficoltà finale includendo le penalità) ...
    const finalDifficulty = difficulty + /* ... penalità ... */;

    // Calcola il tiro minimo necessario sul d20 per avere successo
    const targetRoll = finalDifficulty - bonus;

    if (targetRoll <= 1) return "Garantita";
    if (targetRoll <= 3) return "Molto Alta";
    if (targetRoll <= 6) return "Alta";
    if (targetRoll <= 10) return "Media";
    if (targetRoll <= 14) return "Bassa";
    if (targetRoll <= 17) return "Molto Bassa";
    return "Quasi Impossibile";
}
``` 
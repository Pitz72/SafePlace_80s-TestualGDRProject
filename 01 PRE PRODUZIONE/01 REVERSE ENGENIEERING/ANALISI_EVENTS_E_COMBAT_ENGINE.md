# Analisi Gestione Eventi e Motore di Combattimento - `events.js`

Questo documento analizza il file `archives/safeplace_advanced/js/events.js`. Questo script gestisce la generazione di tutti gli eventi narrativi e, in modo cruciale, contiene il **motore di combattimento** del gioco, che si è rivelato essere un sistema basato su skill check astratti piuttosto che un loop a turni tradizionale.

## Ruolo e Responsabilità

1.  **Generatore di Eventi**: La funzione principale del file è decidere quando e quale evento mostrare al giocatore. Questo è diviso in due categorie:
    *   `triggerTileEvent`: Attiva eventi predefiniti e specifici in base alla casella della mappa su cui si trova il giocatore (es. un incontro unico in una `CITTA'`).
    *   `triggerComplexEvent`: Attiva eventi casuali da un pool generico (es. incontri con predoni, animali, scoperta di tracce) durante l'esplorazione.

2.  **Gestore delle Scelte e Conseguenze**: Il cuore logico del file è la funzione `handleEventChoice`. Quando un giocatore fa una scelta in un popup di evento, questa funzione:
    *   Esegue uno **skill check**: Un "tiro di dado" virtuale che confronta una statistica del giocatore con una soglia di difficoltà (`difficulty`) per determinare il successo o il fallimento dell'azione.
    *   Applica le **conseguenze**: In base all'esito dello skill check, invoca altre funzioni (`applyChoiceReward`, `applyPenalty`) per modificare lo stato del giocatore (dando oggetti, infliggendo danni, etc.).

## Il Motore di Combattimento Svelato

L'analisi ha rivelato che il combattimento non è un sistema a turni, ma un tipo speciale di evento risolto con un singolo, decisivo skill check.

### Flusso di un Incontro di Combattimento

1.  **Innesco**: Durante il movimento, `triggerComplexEvent` decide di avviare un incontro ostile (es. `PREDATOR`).
2.  **Setup del Nemico**: Viene chiamata la funzione `selectEnemyForCombat`. Questa funzione:
    *   Sceglie un nemico specifico dal database `ENEMIES_DATABASE`.
    *   Usa il `TIER_SYSTEM` (da `advanced_combat_system.js`) per scalarne le statistiche in base alla difficoltà attuale del gioco.
3.  **Costruzione dell'Evento**: Lo script costruisce i dati per il popup dell'evento, inclusa l'opzione "Combatti". La difficoltà (`difficulty`) dello skill check per questa opzione è calcolata dinamicamente in base alle statistiche del nemico selezionato e ad altri fattori (es. ora del giorno).
4.  **Azione del Giocatore**: Il giocatore vede l'evento e sceglie "Combatti".
5.  **Risoluzione**: Viene chiamata `handleEventChoice`. Questa esegue lo skill check (es. `player.stats.potenza` vs `difficulty`).
    *   **Successo**: Il nemico è sconfitto. Il giocatore riceve esperienza e loot (tramite `applyChoiceReward`).
    *   **Fallimento**: Il giocatore viene sconfitto. Subisce danni ingenti e/o altre penalità (tramite `applyPenalty`), che possono portare al game over.
6.  **Fine del Combattimento**: L'evento si conclude e il gioco torna alla mappa.

### Vantaggi di Questo Approccio

*   **Velocità e Tensione**: Mantiene il ritmo del gioco veloce, tipico dei roguelike, trasformando ogni combattimento in un momento teso e decisivo.
*   **Astrazione**: Evita la complessità di sviluppare un'interfaccia grafica e una logica per un sistema di combattimento a turni dettagliato.
*   **Flessibilità**: Le meccaniche avanzate di `advanced_combat_system.js` (effetti di stato, abilità speciali) vengono comunque utilizzate per influenzare lo scontro, modificando la difficoltà dello skill check o applicando effetti secondari al giocatore dopo la risoluzione (es. "Hai vinto, ma sei rimasto avvelenato").

## Implicazioni per il Porting

*   **Decisione Chiave di Design**: Per il porting, bisogna fare una scelta fondamentale:
    1.  **Replicare il Sistema Esistente**: Mantenere il combattimento come un sistema astratto basato su skill check. Questo è più veloce da implementare e fedele all'originale.
    2.  **Espandere in un Sistema a Turni**: Utilizzare i dati esistenti (statistiche, abilità) come base per costruire un vero e proprio sistema di combattimento a turni, con una schermata dedicata. Questa sarebbe un'espansione significativa del gioco originale.
*   **Logica da Estrarre**: Indipendentemente dalla scelta, la logica all'interno di `handleEventChoice`, `applyChoiceReward`, e `applyPenalty` contiene le formule esatte per l'assegnazione di esperienza, la generazione del loot e il calcolo dei danni, e deve essere preservata.
*   **Generazione degli Eventi**: Le funzioni `triggerTileEvent` e `triggerComplexEvent` contengono la logica che determina la frequenza e il tipo di incontri, e sono fondamentali per replicare il ritmo e la varietà del gioco.

---

## APPENDICE A: Codice Sorgente Grezzo del Motore Eventi (`events.js`)

Di seguito è riportato il codice sorgente delle funzioni chiave che compongono il motore di gestione degli eventi.

### A.1 Funzioni di Innesco Eventi (`triggerTileEvent`, `triggerComplexEvent`)

Queste due funzioni sono il punto di partenza di ogni evento. La prima gestisce gli eventi legati a una specifica casella della mappa, la seconda gestisce gli incontri casuali e generici.

```javascript
/**
 * Tenta di attivare un evento casuale specifico della casella corrente.
 */
function triggerTileEvent(tileSymbol) {
    // Non fare nulla se un popup evento è già attivo, se il gioco non è attivo, o se il tileSymbol non è valido.
    if (eventScreenActive || !gameActive || !tileSymbol) return;

    // Trova la chiave testuale corrispondente al simbolo del tile (es. '.' -> 'PLAINS').
    const tileKey = Object.keys(TILE_SYMBOLS).find(k => TILE_SYMBOLS[k] === tileSymbol);
    if (!tileKey || !EVENT_DATA[tileKey]) {
        return; // Nessun dato evento definito per questo tipo di casella.
    }
    
    // ... (logica per eventi unici e di sosta omessa per brevità) ...

    // Se la pool di eventi filtrata è vuota o la probabilità non si verifica, non fare nulla.
    if (eventPool.length === 0 || Math.random() > eventChance) {
        return;
    }

    // Seleziona un evento casuale dalla pool standard FILTRATA.
    const randomEvent = getRandomText(eventPool); 

    if (randomEvent) {
         showEventPopup(randomEvent); 
    }
}


/**
 * Tenta di attivare un evento complesso generico (Predatori, Animali, etc.).
 */
function triggerComplexEvent(tileSymbol) {
    if (!gameActive || !tileSymbol) return; 

    if (SHELTER_TILES.includes(tileSymbol)) {
         return;
    }

    if (Math.random() > COMPLEX_EVENT_CHANCE) {
        return; 
    }

    const chosenEventTypeObj = chooseWeighted(/* ... */);
    let eventType = chosenEventTypeObj ? chosenEventTypeObj.type : null;

     if (!eventType) {
         return;
     }

    // ... (Logica di adattamento del tipo di evento all'ambiente e all'ora) ...
    
    // Costruzione dei dati dell'evento (titolo, descrizione, scelte)
    let eventData = null;
    switch(eventType) {
        case 'PREDATOR':
            // ... costruisce l'evento di scontro con predoni
            break;
        case 'ANIMAL':
             // ... costruisce l'evento di incontro con animale
             break;
        // ... altri casi
    }

    if (eventData) {
        showEventPopup(eventData);
    }
}
```

### A.2 Funzione di Gestione della Scelta (`handleEventChoice`)

Questa è la funzione più importante. Viene chiamata quando il giocatore clicca su un'opzione in un evento e ne gestisce tutte le conseguenze.

```javascript
/**
 * Gestisce la scelta del giocatore in un evento.
 * @param {number} choiceIndex - L'indice della scelta fatta.
 */
function handleEventChoice(choiceIndex) {
    if (!currentEventChoices || choiceIndex >= currentEventChoices.length) {
        // ... gestione errore ...
        return;
    }

    const choice = currentEventChoices[choiceIndex];
    
    // ... (Logica per consumo risorse, usura, ecc.) ...

    let skillCheckResult = { success: true, isCritical: false }; // Default per scelte senza skill check
    if (choice.skillCheck) {
        skillCheckResult = performSkillCheck(player.stats[choice.skillCheck.stat], choice.skillCheck.difficulty);
    }
    
    // --- RISOLUZIONE COMBATTIMENTO ASTRATTO ---
    if (choice.actionKey === 'lotta' || choice.actionKey === 'attacca') {
        const combatResult = CombatSystem.resolveCombat(player, currentEventContext.enemy);
        skillCheckResult.success = combatResult.playerWon;

        if (combatResult.playerWon) {
            // ... (logica per ricompense post-combattimento) ...
        } else {
            // ... (logica per penalità post-combattimento) ...
        }
        showCombatResultWithSuspense(combatResult, currentEventContext.enemy.name);
        return; // Esce per mostrare il risultato del combattimento
    }

    // --- GESTIONE ALTRE SCELTE ---
    if (skillCheckResult.success) {
        // Applica ricompense
        if (choice.reward) {
            applyChoiceReward(choice.reward);
        }
        // ... (mostra testo di successo) ...
    } else {
        // Applica penalità
        if (choice.penalty) {
            applyPenalty(choice.penalty);
        }
        // ... (mostra testo di fallimento) ...
    }
    
    // ... (chiusura popup, aggiornamento UI) ...
}
```

### A.3 Funzioni di Risultato (`applyChoiceReward`, `applyPenalty`)

Queste funzioni applicano materialmente i cambiamenti di stato al giocatore in base all'esito di una scelta.

```javascript
/**
 * Applica le ricompense di una scelta al giocatore.
 * @param {object} rewardData - L'oggetto contenente le ricompense.
 */
function applyChoiceReward(rewardData) {
    if (rewardData.items) {
        rewardData.items.forEach(item => addItemToInventory(item.id, item.quantity));
    }
    if (rewardData.status) {
        // ... (logica per curare fame, sete, etc.) ...
    }
    if (rewardData.xp) {
        // ... (logica per dare esperienza) ...
    }
    // ... (altri tipi di ricompense) ...
}

/**
 * Applica le penalità di una scelta al giocatore.
 * @param {object} penaltyObject - L'oggetto contenente le penalità.
 */
function applyPenalty(penaltyObject) {
    if (penaltyObject.damage) {
        let finalDamage = getRandomInt(penaltyObject.damage.min, penaltyObject.damage.max);
        player.currentHP -= finalDamage;
        // ... (logica per game over se HP <= 0) ...
    }
    if (penaltyObject.itemsLost) {
        // ... (logica per perdere oggetti) ...
    }
    // ... (altri tipi di penalità) ...
}
```

### A.4 Selezione Nemici (`selectEnemyForCombat`)

Questa funzione è responsabile della selezione e della scalabilità dei nemici prima di un combattimento.

```javascript
/**
 * Seleziona un nemico appropriato e lo scala in base alla difficoltà.
 * @returns {object|null} L'oggetto del nemico pronto per il combattimento.
 */
function selectEnemyForCombat(eventType, context) {
    const tier = TIER_SYSTEM.getTierForDay(player.daysSurvived);
    const availableTypes = TIER_SYSTEM.getAvailableEnemyTypes(tier);

    // Filtra il database nemici per categoria (es. PREDONE, BESTIA)
    const enemyCategory = (eventType === 'PREDATOR') ? 'RAIDER' : 'BEAST'; // Semplificazione
    const possibleEnemies = ENEMY_DATABASE[enemyCategory].filter(e => availableTypes.includes(e.type));
    
    if (possibleEnemies.length === 0) return null;

    const baseEnemy = { ...getRandomText(possibleEnemies) }; // Clona l'oggetto
    
    // Scala il nemico in base al tier
    const scaledEnemy = TIER_SYSTEM.getEnemyScaling(tier, baseEnemy);
    
    return scaledEnemy;
}
``` 
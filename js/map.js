/**
 * TheSafePlace - Roguelike Postapocalittico
 * File: js/map.js
 * Descrizione: Gestisce la generazione della mappa, il movimento del giocatore e il ciclo giorno/notte.
 * Dipende da: game_constants.js, game_data.js, game_utils.js, ui.js, events.js, player.js
 */

// Dipendenze:
// - Variabili di stato globali (player, map, isDay, dayMovesCounter, nightMovesCounter, daysSurvived, gameActive) da game_constants.js
// - Costanti (MAP_WIDTH, MAP_HEIGHT, TILE_SYMBOLS, TILE_DESC, DAY_LENGTH_MOVES, NIGHT_LENGTH_MOVES, NIGHT_FOOD_COST, NIGHT_WATER_COST, MOVE_FOOD_COST, MOVE_WATER_COST, SHELTER_TILES, FLAVOR_TEXT_CHANCE, LORE_FRAGMENT_CHANCE, STATO_MESSAGGI, HUNGER_PENALTY_HP, THIRST_PENALTY_HP, PASSIVE_HUNGER_DAMAGE, PASSIVE_THIRST_DAMAGE, PASSIVE_INJURY_DAMAGE, PASSIVE_SICKNESS_DAMAGE, PASSIVE_POISON_DAMAGE, SICKNESS_EXTRA_FOOD_COST, SICKNESS_EXTRA_WATER_COST, mountainBlockMessages, ...) da game_constants.js/game_data.js
// - Funzioni utility (getRandomInt, addMessage, getRandomText, isWalkable) da game_utils.js
// - Funzioni UI (renderMap, renderStats) da ui.js
// - Funzioni Eventi (triggerTileEvent, triggerComplexEvent, checkAndLogStatusMessages) da events.js
// - Funzioni Player (checkAmmoAvailability - usata indirettamente forse per flavor text? No, solo in ui.js e events.js)
// - Funzione endGame (da game_core.js)


/**
 * Genera la mappa di gioco completa con tutti i tipi di terreno e posiziona Start ed End.
 * Inizializza l'array globale `map`.
 * Dipende da: game_constants.js (map, player, MAP_WIDTH, MAP_HEIGHT, TILE_SYMBOLS), game_utils.js (getRandomInt, isWalkable).
 */
function generateMap() {
    // console.log("generateMap: Inizio generazione mappa..."); // Log di debug

    // Resetta l'array della mappa (definito in game_constants.js)
    map = [];

    // Inizializza la mappa con il tipo di terreno base (Pianura)
    for (let y = 0; y < MAP_HEIGHT; y++) {
        map[y] = [];
        for (let x = 0; x < MAP_WIDTH; x++) {
             // Ogni casella ora è un oggetto con il tipo e uno stato visited
            map[y][x] = { type: TILE_SYMBOLS.PLAINS, visited: false };
        }
    }
    // console.log(`generateMap: Mappa base ${MAP_WIDTH}x${MAP_HEIGHT} inizializzata con pianura.`); // Log di debug


    // --- Aggiunta di elementi procedurali (semplice randomizzazione per ora) ---
    // Aggiunge montagne (ostacoli non attraversabili)
    const mountainCount = Math.floor((MAP_WIDTH * MAP_HEIGHT) * 0.06); // ~6% della mappa come montagna
    for (let i = 0; i < mountainCount; i++) {
        // Posiziona gruppi di montagne per renderle più realistiche
        const groupSize = getRandomInt(1, 3); // Gruppi di 1-3 caselle adiacenti
        let currentX = getRandomInt(0, MAP_WIDTH - 1);
        let currentY = getRandomInt(0, MAP_HEIGHT - 1);

        for (let j = 0; j < groupSize; j++) {
             // Assicurati che le coordinate siano valide
            currentX = Math.max(0, Math.min(MAP_WIDTH - 1, currentX + getRandomInt(-1, 1)));
            currentY = Math.max(0, Math.min(MAP_HEIGHT - 1, currentY + getRandomInt(-1, 1)));

            // Imposta il tipo di casella a montagna
            if (map[currentY] && map[currentY][currentX]) { // Verifica che la casella esista prima di modificarla
                map[currentY][currentX].type = TILE_SYMBOLS.MOUNTAIN;
            } else {
                console.warn(`generateMap: Tentativo di posizionare montagna fuori dai limiti: (${currentX}, ${currentY})`);
            }
        }
    }
    // console.log(`generateMap: Aggiunte ~${mountainCount} montagne.`); // Log di debug


    // Aggiunge foreste (terreno speciale)
    const forestCount = Math.floor((MAP_WIDTH * MAP_HEIGHT) * 0.1); // ~10% della mappa
     for (let i = 0; i < forestCount; i++) {
         const groupSize = getRandomInt(3, 6); // Gruppi di 3-6 caselle adiacenti
         let currentX = getRandomInt(0, MAP_WIDTH - 1);
         let currentY = getRandomInt(0, MAP_HEIGHT - 1);

         for (let j = 0; j < groupSize; j++) {
              currentX = Math.max(0, Math.min(MAP_WIDTH - 1, currentX + getRandomInt(-2, 2)));
              currentY = Math.max(0, Math.min(MAP_HEIGHT - 1, currentY + getRandomInt(-2, 2)));

             // Evita di sovrascrivere montagne
             if (map[currentY] && map[currentY][currentX] && map[currentY][currentX].type !== TILE_SYMBOLS.MOUNTAIN) {
                 map[currentY][currentX].type = TILE_SYMBOLS.FOREST;
             } else {
                 // console.warn(`generateMap: Tentativo di posizionare foresta fuori limiti o su montagna: (${currentX}, ${currentY})`); // Log di debug rimosso
             }
         }
     }
     // console.log(`generateMap: Aggiunte ~${forestCount} caselle foresta.`); // Log di debug


    // Aggiunge fiumi (ostacoli parziali per isWalkable)
    const riverCount = getRandomInt(1, 2); // 1-2 fiumi principali
     for (let i = 0; i < riverCount; i++) {
        // Decide se il fiume è orizzontale o verticale
        const isHorizontal = Math.random() < 0.5;
        const riverWidth = getRandomInt(1, 2); // Fiume largo 1 o 2 caselle

        if (isHorizontal) {
             // Fiume orizzontale (da sinistra a destra)
             const startY = getRandomInt(5, MAP_HEIGHT - 6); // Inizia non troppo vicino ai bordi verticali
             let currentY = startY;

             for (let x = 0; x < MAP_WIDTH; x++) {
                 // Ogni tanto il fiume cambia leggermente direzione sull'asse Y
                 if (Math.random() < 0.2 && x > 0) {
                     const direction = Math.random() < 0.5 ? 1 : -1; // Su o giù
                     currentY = Math.min(Math.max(2, currentY + direction), MAP_HEIGHT - 3); // Mantiene lontano dai bordi estremi
                 }
                 // Applica il fiume per la sua larghezza
                 for(let w = 0; w < riverWidth; w++) {
                    if (map[currentY + w] && map[currentY + w][x] && map[currentY + w][x].type !== TILE_SYMBOLS.MOUNTAIN) {
                        map[currentY + w][x].type = TILE_SYMBOLS.RIVER;
                    }
                 }
             }
         } else {
             // Fiume verticale (dall'alto in basso)
             const startX = getRandomInt(5, MAP_WIDTH - 6); // Inizia non troppo vicino ai bordi orizzontali
             let currentX = startX;

             for (let y = 0; y < MAP_HEIGHT; y++) {
                 // Ogni tanto il fiume cambia leggermente direzione sull'asse X
                 if (Math.random() < 0.2 && y > 0) {
                     const direction = Math.random() < 0.5 ? 1 : -1; // Sinistra o destra
                     currentX = Math.min(Math.max(2, currentX + direction), MAP_WIDTH - 3); // Mantiene lontano dai bordi estremi
                 }
                  // Applica il fiume per la sua larghezza
                  for(let w = 0; w < riverWidth; w++) {
                      if (map[y] && map[y][currentX + w] && map[y][currentX + w].type !== TILE_SYMBOLS.MOUNTAIN) {
                          map[y][currentX + w].type = TILE_SYMBOLS.RIVER;
                      }
                  }
             }
         }
     }
     // console.log(`generateMap: Aggiunti ${riverCount} fiumi.`); // Log di debug


    // Aggiunge villaggi (risorse, eventi specifici)
    const villageCount = getRandomInt(3, 5); // 3-5 villaggi
     for (let i = 0; i < villageCount; i++) {
         // Trova una posizione valida (non su montagne, fiumi, o troppo vicino ai bordi)
         let x, y;
         let attempts = 0;
         const maxAttempts = 100;
         do {
             x = getRandomInt(5, MAP_WIDTH - 6);
             y = getRandomInt(5, MAP_HEIGHT - 6);
             attempts++;
         } while (
              !map[y]?.[x] || // Casella deve esistere
              map[y][x].type === TILE_SYMBOLS.MOUNTAIN ||
              map[y][x].type === TILE_SYMBOLS.RIVER ||
              map[y][x].type === TILE_SYMBOLS.VILLAGE || // Evita di sovrapporre villaggi
              map[y][x].type === TILE_SYMBOLS.CITY || // Evita di sovrapporre città
              map[y][x].type === TILE_SYMBOLS.REST_STOP // Evita di sovrapporre aree sosta
             && attempts < maxAttempts
         );

         if (attempts < maxAttempts) {
             map[y][x].type = TILE_SYMBOLS.VILLAGE;
         } else {
            console.warn("generateMap: Impossibile trovare posizione valida per un villaggio dopo 100 tentativi.");
         }
     }
     // console.log(`generateMap: Aggiunti ${villageCount} villaggi.`); // Log di debug


    // Aggiunge città (risorse, eventi specifici, eventi unici)
    const cityCount = getRandomInt(1, 2); // 1-2 città
     for (let i = 0; i < cityCount; i++) {
         // Trova una posizione valida (più spazio richiesto, lontano da altri POI)
         let x, y;
         let attempts = 0;
         const maxAttempts = 150; // Più tentativi per POI rari
         do {
             x = getRandomInt(8, MAP_WIDTH - 9);
             y = getRandomInt(8, MAP_HEIGHT - 9);
             attempts++;
         } while (
             !map[y]?.[x] || // Casella deve esistere
             map[y][x].type !== TILE_SYMBOLS.PLAINS || // Preferisce pianura per le città
             map[y][x].type === TILE_SYMBOLS.MOUNTAIN ||
             map[y][x].type === TILE_SYMBOLS.RIVER ||
              // Controlla un'area intorno alla posizione proposta per evitare vicinanza con altri POI
             checkForNearbyPOI(x, y, [TILE_SYMBOLS.VILLAGE, TILE_SYMBOLS.CITY, TILE_SYMBOLS.REST_STOP], 5) // Controlla in un raggio di 5 caselle
             && attempts < maxAttempts
         );

         if (attempts < maxAttempts) {
             map[y][x].type = TILE_SYMBOLS.CITY;
         } else {
            console.warn("generateMap: Impossibile trovare posizione valida per una città dopo 150 tentativi.");
         }
     }
     // console.log(`generateMap: Aggiunte ${cityCount} città.`); // Log di debug

     // Helper per controllare POI nelle vicinanze
     function checkForNearbyPOI(centerX, centerY, poiTypes, radius) {
         for (let dy = -radius; dy <= radius; dy++) {
             for (let dx = -radius; dx <= radius; dx++) {
                 const checkX = centerX + dx;
                 const checkY = centerY + dy;
                 // Controlla se la casella è nei limiti e il suo tipo è nella lista dei POI da evitare
                 if (checkX >= 0 && checkX < MAP_WIDTH && checkY >= 0 && checkY < MAP_HEIGHT && map[checkY]?.[checkX]) {
                     if (poiTypes.includes(map[checkY][checkX].type)) {
                         return true; // Trovato un POI nelle vicinanze
                     }
                 }
             }
         }
         return false; // Nessun POI trovato nelle vicinanze
     }


    // Aggiunge aree di sosta (rifugi sicuri per la notte, eventi specifici)
    const restStopCount = getRandomInt(2, 4); // 2-4 aree di sosta
     for (let i = 0; i < restStopCount; i++) {
         // Trova una posizione valida (non su altre strutture, preferibilmente non montagna/fiume)
         let x, y;
         let attempts = 0;
         const maxAttempts = 100;
         do {
             x = getRandomInt(3, MAP_WIDTH - 4);
             y = getRandomInt(3, MAP_HEIGHT - 4);
             attempts++;
         } while (
             !map[y]?.[x] || // Casella deve esistere
              map[y][x].type === TILE_SYMBOLS.MOUNTAIN ||
              map[y][x].type === TILE_SYMBOLS.RIVER ||
              map[y][x].type === TILE_SYMBOLS.VILLAGE || // Evita di sovrapporre villaggi
              map[y][x].type === TILE_SYMBOLS.CITY || // Evita di sovrapporre città
             map[y][x].type === TILE_SYMBOLS.REST_STOP // Evita di sovrapporre aree sosta
             && attempts < maxAttempts
         );

         if (attempts < maxAttempts) {
             map[y][x].type = TILE_SYMBOLS.REST_STOP;
         } else {
            console.warn("generateMap: Impossibile trovare posizione valida per un'area di sosta dopo 100 tentativi.");
         }
     }
     // console.log(`generateMap: Aggiunte ${restStopCount} aree di sosta.`); // Log di debug


    // --- Posizionamento Start ('S') e End ('E') ---

    // Posiziona il punto di Start ('S') nella parte sinistra-superiore
    let startX, startY;
    let attempts = 0;
    const maxAttemptsStart = 200; // Più tentativi per garantire Start accessibile
    do {
        startX = getRandomInt(1, Math.floor(MAP_WIDTH / 4)); // Preferibilmente nelle prime 1/4 colonne
        startY = getRandomInt(1, Math.floor(MAP_HEIGHT / 4)); // Preferibilmente nelle prime 1/4 righe
        attempts++;
        // Deve essere attraversabile (non montagna per isWalkable)
    } while (!isWalkable(map[startY]?.[startX]?.type) && attempts < maxAttemptsStart);

    // Fallback sicuro se non si trova una posizione valida
    if (attempts >= maxAttemptsStart) {
         startX = 1; startY = 1;
         // Assicura che anche il fallback sia PLAINS se possibile
         if (map[1]?.[1] && map[1][1].type === TILE_SYMBOLS.MOUNTAIN) {
             map[1][1].type = TILE_SYMBOLS.PLAINS; // Forza a pianura se era montagna
         }
         console.warn("generateMap: Posizione Start fallback utilizzata (1,1).");
    }

    // Imposta la casella di Start (e la marca come visitata)
    map[startY][startX] = { type: TILE_SYMBOLS.START, visited: true };
    // Assegna la posizione iniziale al giocatore (sull'oggetto player globale)
    player.x = startX;
    player.y = startY;
    // console.log(`generateMap: Posizionato Start a (${startX}, ${startY}).`); // Log di debug


    // Posiziona il punto di End ('E') nella parte destra-inferiore, lontano dallo Start
    let endX, endY;
    attempts = 0;
    const maxAttemptsEnd = 200; // Più tentativi per garantire End accessibile e lontano da Start
    const minDistanceSq = Math.pow(MAP_WIDTH / 3, 2) + Math.pow(MAP_HEIGHT / 3, 2); // Distanza minima al quadrato approssimativa
    let distanceSq; // Dichiarazione qui fuori dal ciclo

    do {
        endX = getRandomInt(Math.floor(MAP_WIDTH * 3 / 4), MAP_WIDTH - 2); // Preferibilmente nelle ultime 1/4 colonne
        endY = getRandomInt(Math.floor(MAP_HEIGHT * 3 / 4), MAP_HEIGHT - 2); // Preferibilmente nelle ultime 1/4 righe
        attempts++;
        // Deve essere attraversabile e sufficientemente lontano dallo Start
        distanceSq = Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2);
    } while (
        !map[endY]?.[endX] || // Casella deve esistere
        !isWalkable(map[endY][endX].type) || // Deve essere attraversabile
        distanceSq < minDistanceSq // Deve essere sufficientemente lontano da Start
        && attempts < maxAttemptsEnd
    );

     // Fallback sicuro se non si trova una posizione valida o lontana
    if (attempts >= maxAttemptsEnd) {
         endX = MAP_WIDTH - 2; endY = MAP_HEIGHT - 2;
         // Assicura che anche il fallback sia PLAINS se possibile
         if (map[MAP_HEIGHT - 2]?.[MAP_WIDTH - 2] && map[MAP_HEIGHT - 2][MAP_WIDTH - 2].type === TILE_SYMBOLS.MOUNTAIN) {
              map[MAP_HEIGHT - 2][MAP_WIDTH - 2].type = TILE_SYMBOLS.PLAINS; // Forza a pianura se era montagna
         }
         console.warn(`generateMap: Posizione End fallback utilizzata (${endX},${endY}).`);
    }

    // Imposta la casella di End
    map[endY][endX] = { type: TILE_SYMBOLS.END, visited: false }; // End non è visitato all'inizio
    // console.log(`generateMap: Posizionato End a (${endX}, ${endY}).`); // Log di debug


    // console.log("generateMap: Generazione mappa completata."); // Log di debug
    // La funzione di rendering della mappa (renderMap) sarà chiamata da game_core dopo la generazione.
}

/**
 * Muove il giocatore sulla mappa, aggiorna lo stato e il rendering.
 * Gestisce costi di movimento, transizioni giorno/notte e trigger di eventi.
 * Dipende da: game_constants.js (player, map, MAP_WIDTH, MAP_HEIGHT, TILE_SYMBOLS, isDay, dayMovesCounter, nightMovesCounter, DAY_LENGTH_MOVES, NIGHT_LENGTH_MOVES, MOVE_FOOD_COST, MOVE_WATER_COST, SHELTER_TILES, STATO_MESSAGGI, HUNGER_PENALTY_HP, THIRST_PENALTY_HP, PASSIVE_HUNGER_DAMAGE, PASSIVE_THIRST_DAMAGE, PASSIVE_INJURY_DAMAGE, PASSIVE_SICKNESS_DAMAGE, PASSIVE_POISON_DAMAGE, SICKNESS_EXTRA_FOOD_COST, SICKNESS_EXTRA_WATER_COST, mountainBlockMessages),
 * game_utils.js (addMessage, getRandomText, isWalkable), ui.js (renderMap, renderStats, disableControls, enableControls),
 * events.js (triggerTileEvent, triggerComplexEvent, checkAndLogStatusMessages), game_core.js (endGame).
 * @param {number} dx - Lo spostamento orizzontale (-1, 0, 1).
 * @param {number} dy - Lo spostamento verticale (-1, 0, 1).
 */
function movePlayer(dx, dy) {
    // console.log(`movePlayer: Tentativo di movimento (${dx},${dy}).`); // Log di debug

    // Non permettere il movimento se il gioco non è attivo o se è in pausa (es. evento aperto)
    // gamePaused è gestito da disableControls/enableControls in ui.js
    if (!gameActive || gamePaused) {
        // console.log("movePlayer: Movimento bloccato (Gioco non attivo o in pausa)."); // Log di debug
        return;
    }

    // Calcola la nuova posizione
    const newX = player.x + dx;
    const newY = player.y + dy;

    // Controllo limiti mappa
    if (newX < 0 || newX >= MAP_WIDTH || newY < 0 || newY >= MAP_HEIGHT) {
        // console.log("movePlayer: Movimento bloccato (Fuori limiti mappa)."); // Log di debug
        addMessage("Non puoi andare oltre i confini del mondo conosciuto.", "warning");
        return;
    }

    // Controllo robusto esistenza casella target
     if (!map || !map[newY] || !map[newY][newX]) {
         console.error(`movePlayer: Tentativo di accedere a casella mappa non valida o inesistente: (${newX}, ${newY})`);
         addMessage("Errore interno: la destinazione non è valida.", "danger");
         return;
     }
    const targetTile = map[newY][newX]; // Ora siamo sicuri che targetTile esiste

    // Controllo se la casella è attraversabile (usa la utility isWalkable)
    if (!isWalkable(targetTile.type)) {
        // console.log(`movePlayer: Movimento bloccato (Casella non attraversabile: ${targetTile.type}).`); // Log di debug
        // Messaggio specifico per Montagna (usa array da game_data.js)
        if (targetTile.type === TILE_SYMBOLS.MOUNTAIN) {
            addMessage(getRandomText(mountainBlockMessages), "warning");
        } else {
            // Messaggio generico per altri tipi di ostacoli non esplicitamente gestiti
            addMessage("Non puoi passare di qui.", "warning");
        }
        return; // Esce dalla funzione movePlayer
    }


    // --- LOGICA MOVIMENTO VALIDO ---

    // Se il movimento è valido, disabilita i controlli e imposta la pausa logica
    // Queste funzioni (disableControls) sono definite in ui.js
    disableControls(); // Imposta gamePaused = true

    // Aggiorna la posizione del giocatore
    player.x = newX;
    player.y = newY;
    // Marca la casella di destinazione come visitata
    targetTile.visited = true; // Riferimento corretto a targetTile

    // Log del movimento (mostra descrizione del luogo)
    addMessage(`Ti muovi verso (${newX}, ${newY}). Luogo: ${TILE_DESC[targetTile.type] || '???'}`);


    // --- LOGICA CICLO GIORNO/NOTTE E PASSI ---

    // Se è notte E il giocatore si sposta SU una casella rifugio, la notte passa automaticamente
    // Questo gestisce il caso in cui si cerca un rifugio muovendosi e lo si trova.
    if (!isDay && SHELTER_TILES.includes(targetTile.type)) {
        // Non applichiamo costi/penalità di movimento qui, li applichiamo solo se si muove all'aperto di notte.
        // Il fatto di essere entrati nel rifugio fa passare la notte.
        addMessage(`Hai raggiunto un rifugio (${TILE_DESC[targetTile.type]}). Passi la notte al sicuro.`, "info", true);
        transitionToDay(); // Funzione definita in questo modulo map.js
        // La UI (renderStats/Map) verrà aggiornata in transitionToDay.
        // I controlli verranno riabilitati in transitionToDay (se non c'è evento popup).
        return; // Esci subito dopo aver passato la notte
    }


    // Applica consumo risorse per questo movimento (usa la funzione definita qui sotto)
    consumeResourcesOnMove();

    // Applica effetti passivi degli stati (danno per fame/sete/ferito/malato/avvelenato)
    // Questa funzione (applyPassiveStatusEffects) è definita qui sotto
    applyPassiveStatusEffects();

    // Applica penalità aggiuntiva per movimento notturno all'aperto
    if (!isDay && !SHELTER_TILES.includes(targetTile.type)) {
        const nightMoveDamage = NIGHT_MOVE_PENALTY_HP;
        if (nightMoveDamage > 0 && player.hp > 0) { // Applica solo se c'è danno e il giocatore è vivo
            const oldHp = player.hp;
            player.hp = Math.max(0, player.hp - nightMoveDamage);
            const actualDamage = Math.floor(oldHp - player.hp);
            if (actualDamage > 0) {
                 addMessage("Muoversi nell'oscurità ti sfianca...", 'warning');
                 // Non mostriamo il danno specifico nel messaggio per non essere troppo ripetitivi,
                 // la barra HP che scende è sufficiente.
            }
        }
    }

     // Controlla se il giocatore è morto per gli effetti passivi O per il movimento notturno.
     // La funzione endGame è definita in game_core.js
    if (player.hp <= 0) {
        if (typeof endGame === 'function') endGame(false);
        return; // Esci subito se il giocatore è morto
    }


    // Gestisce i contatori di passi giorno/notte
    if (isDay) {
        dayMovesCounter++;
        // console.log(`movePlayer: Passi giorno: ${dayMovesCounter}/${DAY_LENGTH_MOVES}`); // Log di debug
        // Se i passi giorno raggiungono il limite, transizione a notte
        if (dayMovesCounter >= DAY_LENGTH_MOVES) {
            transitionToNight(); // Funzione definita in questo modulo map.js
             // La UI verrà aggiornata in transitionToNight.
             // I controlli rimarranno disabilitati (o abilitati solo per cercare rifugio).
             return; // Esci subito dopo la transizione a notte
        }
    } else { // È notte
        nightMovesCounter++;
        // console.log(`movePlayer: Passi notte: ${nightMovesCounter}/${NIGHT_LENGTH_MOVES}`); // Log di debug
        // Se i passi notte (all'aperto, al chiuso non contano per questo limite) raggiungono il limite, transizione a giorno
        // La transizione a giorno per movimento notturno si verifica solo se NON si è in un rifugio
        if (!SHELTER_TILES.includes(targetTile.type) && nightMovesCounter >= NIGHT_LENGTH_MOVES) {
             addMessage("La lunga notte finalmente passa... il sole sorge all'orizzonte.", "info", true);
             transitionToDay(); // Funzione definita in questo modulo map.js
             // La UI verrà aggiornata in transitionToDay.
             // I controlli verranno riabilitati in transitionToDay (se non c'è evento popup).
             return; // Esci subito dopo la transizione a giorno
        }
        // Se si è in rifugio di notte, i passi notturni non contano per la transizione forzata dal contatore.
        // La transizione avverrà solo se si usa l'azione "Riposare" nel rifugio (gestita altrove, es. evento specifico rifugio)
        // o se si entra in un rifugio come gestito all'inizio di questa funzione.
    }


    // --- LOGICA EVENTI CASUALI ---
    // Tentativo di attivare eventi dopo il movimento, solo se il gioco è ancora attivo
    // (Non morto e non arrivato alla fine)
    if (gameActive) {
        // Triggera eventi specifici del tile corrente (usa funzione da events.js)
        // triggerTileEvent controlla se c'è un evento specifico e lo mostra.
        // Se triggerTileEvent mostra un popup, eventScreenActive diventa true (gestito in ui.js/events.js).
        if (typeof triggerTileEvent === 'function') {
            triggerTileEvent(targetTile.type); // Passa solo il simbolo del tile
        } else {
            console.warn("movePlayer: triggerTileEvent non disponibile.");
        }


        // Se NESSUN evento specifico del tile ha aperto un popup:
        // Triggera un evento complesso generico (Predatori, Animali, ecc.) con una certa probabilità.
        // triggerComplexEvent controlla la probabilità e apre un popup se necessario.
        // Questo controllo avviene SOLO se eventScreenActive NON è già true.
        if (!eventScreenActive && typeof triggerComplexEvent === 'function') {
             triggerComplexEvent(targetTile.type); // Passa solo il simbolo del tile
        } else if (!eventScreenActive) {
            console.warn("movePlayer: triggerComplexEvent non disponibile.");
        }

        // Se NESSUN evento popup è stato attivato da triggerTileEvent o triggerComplexEvent:
        // Mostra flavor text e controlla per frammenti di lore (probabilità minori)
        // checkAndLogStatusMessages logga messaggi stato (fame, sete, ferito, malato, morente, avvelenato) con probabilità.
        // showRandomFlavorText mostra un testo descrittivo (usa array da game_data.js) con probabilità.
        // checkForLoreFragment trova frammenti di lore (usa array da game_data.js) con probabilità.
        // Queste funzioni NON aprono popup, loggano solo messaggi.
         if (!eventScreenActive) {
             if (typeof checkAndLogStatusMessages === 'function') {
                 checkAndLogStatusMessages();
             } else { console.warn("movePlayer: checkAndLogStatusMessages non disponibile."); }

             if (typeof showRandomFlavorText === 'function') {
                  showRandomFlavorText(targetTile.type);
             } else { console.warn("movePlayer: showRandomFlavorText non disponibile."); }

              if (typeof checkForLoreFragment === 'function') {
                 checkForLoreFragment();
              } else { console.warn("movePlayer: checkForLoreFragment non disponibile."); }
         }
    }


    // --- LOGICA FINE GIOCO ---
    // Controlla se il giocatore è arrivato alla casella End (dopo aver applicato danni e gestito giorno/notte/eventi)
     if (targetTile.type === TILE_SYMBOLS.END && gameActive) {
          // console.log("movePlayer: Raggiunto punto END. Fine gioco (Vittoria)."); // Log di debug
          // La funzione endGame è definita in game_core.js
          if (typeof endGame === 'function') endGame(true);
          return; // Esci perché il gioco è finito
     }

    // --- AGGIORNAMENTO UI E CONTROLLI FINALE ---
    // Aggiorna UI solo se il gioco è ancora attivo e NESSUN evento popup è stato attivato.
    // Se un evento popup è stato attivato, renderMap/Stats e enableControls
    // verranno chiamati da closeEventPopup quando il popup viene chiuso.
     if (gameActive && !eventScreenActive) {
         // console.log("movePlayer: Nessun evento popup. Aggiorno UI e riabilito controlli."); // Log di debug
         if (typeof renderMap === 'function') renderMap(); else console.warn("movePlayer: renderMap non disponibile.");
         if (typeof renderStats === 'function') renderStats(); else console.warn("movePlayer: renderStats non disponibile.");
         // Abilita i controlli di movimento (definita in ui.js)
         enableControls(); // gamePaused viene impostato a false
     } else if (gameActive && eventScreenActive) {
         // console.log("movePlayer: Evento popup attivo. UI e controlli verranno aggiornati alla chiusura del popup."); // Log di debug
         // I controlli rimangono disabilitati (gamePaused = true).
     } else {
         // console.log("movePlayer: Gioco non più attivo. Nessun aggiornamento UI o riabilitazione controlli."); // Log di debug
         // Il gioco è finito (vittoria o sconfitta), i controlli rimangono disabilitati.
     }

    // console.log("movePlayer: Fine esecuzione."); // Log di debug
}


/**
 * Applica il consumo di risorse base per ogni movimento.
 * Applica costi extra se malato.
 * Dipende da: game_constants.js (player, MOVE_FOOD_COST, MOVE_WATER_COST, SICKNESS_EXTRA_FOOD_COST, SICKNESS_EXTRA_WATER_COST, STATO.AFFAMATO, STATO.ASSETATO), game_utils.js (addMessage, getRandomText).
 */
function consumeResourcesOnMove() {
    // Verifica che il giocatore esista
    if (!player) return;

    // Applica consumo base per movimento
    player.food = Math.max(0, player.food - MOVE_FOOD_COST);
    player.water = Math.max(0, player.water - MOVE_WATER_COST);
    // console.log(`consumeResourcesOnMove: Consumato ${MOVE_FOOD_COST} cibo, ${MOVE_WATER_COST} acqua. Restano: ${player.food.toFixed(2)}, ${player.water.toFixed(2)}`); // Log di debug

    // Applica consumo extra risorse se Malato (STATO.INFETTO)
    if (player.isSick) { // Controlla il flag booleano isSick
        player.food = Math.max(0, player.food - SICKNESS_EXTRA_FOOD_COST);
        player.water = Math.max(0, player.water - SICKNESS_EXTRA_WATER_COST);
        // console.log(`consumeResourcesOnMove: Costo extra malattia: ${SICKNESS_EXTRA_FOOD_COST} cibo, ${SICKNESS_EXTRA_WATER_COST} acqua.`); // Log di debug
    }

    // I messaggi di stato (Affamato/Assetato) e il danno passivo
    // vengono gestiti in applyPassiveStatusEffects() e checkAndLogStatusMessages().
}

/**
 * Applica danni passivi per stati negativi (fame, sete, ferito, malato, avvelenato) a ogni passo.
 * Dipende da: game_constants.js (player, PASSIVE_HUNGER_DAMAGE, PASSIVE_THIRST_DAMAGE, PASSIVE_INJURY_DAMAGE, PASSIVE_SICKNESS_DAMAGE, PASSIVE_POISON_DAMAGE), game_core.js (endGame).
 */
function applyPassiveStatusEffects() {
    // Verifica che il giocatore esista
    if (!player) return;

    let totalPassiveDamage = 0;
    let damageSources = []; // Per loggare le fonti di danno passivo

    // Danno per Sete (Idratazione <= 0)
    if (player.water <= 0) {
        totalPassiveDamage += PASSIVE_THIRST_DAMAGE;
        damageSources.push("Disidratazione");
    }

    // Danno per Fame (Sazietà <= 0)
    if (player.food <= 0) {
        totalPassiveDamage += PASSIVE_HUNGER_DAMAGE;
        damageSources.push("Inedia");
    }

    // Danno per Ferita
    if (player.isInjured) {
        totalPassiveDamage += PASSIVE_INJURY_DAMAGE;
        damageSources.push("Ferita");
    }

    // Danno per Malattia
    if (player.isSick) {
        totalPassiveDamage += PASSIVE_SICKNESS_DAMAGE;
        damageSources.push("Malattia");
    }

    // Danno per Avvelenamento
    if (player.isPoisoned) {
        totalPassiveDamage += PASSIVE_POISON_DAMAGE;
        damageSources.push("Avvelenamento");
    }

    // Applica il danno passivo totale (anche se molto piccolo a ogni passo)
    if (totalPassiveDamage > 0) {
        const oldHp = player.hp;
        player.hp = Math.max(0, player.hp - totalPassiveDamage);
        // console.log(`applyPassiveStatusEffects: Danno passivo totale: ${totalPassiveDamage.toFixed(2)}. Fonti: ${damageSources.join(', ')}. HP rimanenti: ${player.hp.toFixed(2)}`); // Log di debug
        // Un messaggio visivo per il danno passivo potrebbe essere eccessivo ad ogni passo,
        // i messaggi di stato (affamato, morente, ecc.) e la barra HP bastano.
    }
}


/**
 * Gestisce la transizione da giorno a notte.
 * Si verifica quando dayMovesCounter raggiunge DAY_LENGTH_MOVES,
 * o quando si entra in un rifugio di notte.
 * Dipende da: game_constants.js (isDay, dayMovesCounter, nightMovesCounter, daysSurvived, SHELTER_TILES, NIGHT_FOOD_COST, NIGHT_WATER_COST, HUNGER_PENALTY_HP, THIRST_PENALTY_HP, player),
 * game_utils.js (addMessage, getRandomText), ui.js (renderStats, enableControls).
 * Richiede endGame (game_core.js).
 */
function transitionToNight() {
    // console.log("transitionToNight: Avvio transizione a notte..."); // Log di debug
    if (!gameActive) {
         // console.log("transitionToNight: Gioco non attivo, annullo transizione."); // Log di debug
        return; // Non fare nulla se il gioco è finito
    }

    isDay = false;
    dayMovesCounter = 0; // Resetta il contatore passi diurni
    nightMovesCounter = 0; // Resetta il contatore passi notturni

    // Controlla se il giocatore è in un rifugio ALL'INIZIO della notte (cioè, finisce il giorno in un rifugio)
    const currentTile = map[player.y]?.[player.x];
    const inShelter = currentTile && SHELTER_TILES.includes(currentTile.type);

    if (inShelter) {
        // Passa la notte al sicuro
        addMessage("Il sole tramonta. Ti trovi al sicuro nel rifugio. Riposi fino all'alba.", "info", true);
        // Applica i costi di "riposo notturno" (indipendenti dall'essere all'aperto o al chiuso, rappresentano consumo base dormendo)
        // Queste costanti (NIGHT_FOOD_COST, NIGHT_WATER_COST) sono definite in game_constants.js
        player.food = Math.max(0, player.food - NIGHT_FOOD_COST);
        player.water = Math.max(0, player.water - NIGHT_WATER_COST);
        // Nessuna penalità di danno aggiuntiva se si è in rifugio.
        // La transizione a giorno avviene subito se la notte è trascorsa in un rifugio sicuro.
         // console.log(`transitionToNight: Passata la notte in rifugio. Consumato ${NIGHT_FOOD_COST} cibo, ${NIGHT_WATER_COST} acqua.`); // Log di debug
        transitionToDay(); // Passa subito al giorno successivo
    } else {
        // Passa la notte all'aperto
        addMessage("Il sole tramonta. Sei all'aperto - la notte sarà pericolosa. Trova un rifugio al più presto!", "warning", true);
        // Applica i costi di "riposo notturno"
        player.food = Math.max(0, player.food - NIGHT_FOOD_COST);
        player.water = Math.max(0, player.water - NIGHT_WATER_COST);
        // console.log(`transitionToNight: Passata la notte all'aperto. Consumato ${NIGHT_FOOD_COST} cibo, ${NIGHT_WATER_COST} acqua.`); // Log di debug

        // Applica le penalità di danno per non aver trovato rifugio (basato solo su risorse 0 alla fine del giorno)
        // Queste costanti (HUNGER_PENALTY_HP, THIRST_PENALTY_HP) sono definite in game_constants.js
        let nightPenaltyDamage = 0;
        if (player.food <= 0) {
            nightPenaltyDamage += HUNGER_PENALTY_HP;
             // Messaggio specifico fame notturna (opzionale, STATO_MESSAGGI.AFFAMATO può bastare)
             // addMessage(getRandomText(STATO_MESSAGGI.AFFAMATO), 'warning');
        }
        if (player.water <= 0) {
            nightPenaltyDamage += THIRST_PENALTY_HP;
             // Messaggio specifico sete notturna (opzionale)
             // addMessage(getRandomText(STATO_MESSAGGI.ASSETATO), 'warning');
        }

        if (nightPenaltyDamage > 0) {
             const oldHp = player.hp;
            player.hp -= nightPenaltyDamage;
            const actualDamage = oldHp - player.hp;
             addMessage(`Hai sofferto l'esposizione notturna (-${actualDamage} HP).`, "danger", true);
             // Messaggio generico per notte all'aperto (da game_data.js)
             addMessage(getRandomText(STATO_MESSAGGI.NOTTE_APERTO), 'warning');
        }

        // Controlla se il giocatore è morto per le penalità notturne
        if (player.hp <= 0) {
             // console.log("transitionToNight: Giocatore morto per penalità notturne."); // Log di debug
             if (typeof endGame === 'function') endGame(false);
             return; // Esci perché il gioco è finito
        }

        // Se il giocatore sopravvive alla notte all'aperto, il gioco continua in modalità notte.
        // Il prossimo movimento (se all'aperto) conteggerà nel nightMovesCounter.
        // Dopo NIGHT_LENGTH_MOVES passi notturni all'aperto, passerà al giorno in movePlayer.
    }

    // Aggiorna la UI delle statistiche (HP, risorse, ora)
    if (typeof renderStats === 'function') renderStats(); else console.warn("transitionToNight: renderStats non disponibile.");

    // Se il gioco non è finito, i controlli vengono riabilitati in movePlayer (dopo il check eventScreenActive).
    // Se l'utente finisce il giorno all'aperto, potrà comunque muoversi per cercare un rifugio.
    // I controlli non vengono disabilitati qui, la pausa è gestita in movePlayer.
}


/**
 * Gestisce la transizione da notte a giorno.
 * Si verifica quando nightMovesCounter raggiunge NIGHT_LENGTH_MOVES (se all'aperto),
 * o quando si entra in un rifugio di notte, o dopo aver riposato in un rifugio.
 * Dipende da: game_constants.js (isDay, dayMovesCounter, nightMovesCounter, daysSurvived, gameActive),
 * game_utils.js (addMessage), ui.js (renderStats, enableControls).
 */
function transitionToDay() {
    // console.log("transitionToDay: Avvio transizione a giorno..."); // Log di debug
    if (!gameActive) {
         // console.log("transitionToDay: Gioco non attivo, annullo transizione."); // Log di debug
        return; // Non fare nulla se il gioco è finito
    }

    isDay = true;
    dayMovesCounter = 0; // Resetta il contatore passi diurni
    nightMovesCounter = 0; // Resetta il contatore passi notturni
    daysSurvived++; // Incrementa il conteggio dei giorni sopravvissuti

    // Resetta il flag di avviso notturno
    if (player) player.hasBeenWarnedAboutNight = false;

    addMessage(`Sorge un nuovo giorno... Giorno ${daysSurvived}. La luce del sole porta un po' di speranza.`, "info", true);

    // Aggiorna la UI delle statistiche (HP, risorse, ora)
    if (typeof renderStats === 'function') renderStats(); else console.warn("transitionToDay: renderStats non disponibile.");
    // La mappa potrebbe dover essere renderizzata nuovamente per colori/stile diverso giorno/notte (se implementato)
    if (typeof renderMap === 'function') renderMap(); else console.warn("transitionToDay: renderMap non disponibile.");


    // Riabilita i controlli UI e resetta il flag gamePaused
    // Questa funzione (enableControls) è definita in ui.js
    // Si assicura che i controlli siano abilitati DOPO la transizione, a meno che un evento non sia attivo.
    if (!eventScreenActive) { // gamePaused è già false qui
       enableControls(); // gamePaused = false
    } else {
        // Se un popup evento è attivo, i controlli rimangono disabilitati (gamePaused = true)
        // Verranno riabilitati da closeEventPopup.
         // console.log("transitionToDay: Evento popup attivo. Controlli rimangono disabilitati."); // Log di debug
    }

    // console.log("transitionToDay: Transizione a giorno completata."); // Log di debug
}


// --- Eventi casuali minori (Flavor Text, Lore) ---
// Queste funzioni non sono eventi complessi, solo log di atmosfera o lore.
// Chiamate da movePlayer se nessun evento complesso/tile specifico si attiva.

/**
 * Mostra un testo descrittivo (flavor text) casuale basato sulla casella corrente e l'ora.
 * Non viene mostrato se un evento specifico si è già attivato nella stessa casella.
 * Dipende da: game_constants.js (isDay, TILE_SYMBOLS, FLAVOR_TEXT_CHANCE), game_data.js (...flavorTexts arrays), game_utils.js (getRandomText, addMessage).
 * @param {string} tileSymbol - Il simbolo del tipo di casella su cui si trova il giocatore.
 */
function showRandomFlavorText(tileSymbol) {
    // Non mostrare flavor text se un evento popup è attivo, se il gioco è finito
    // eventScreenActive è gestito in ui.js/events.js
    if (eventScreenActive || !gameActive || !tileSymbol) return;

    // Non mostrare flavor text su Start o End (o Player, ma Player non è un tile type)
    if (tileSymbol === TILE_SYMBOLS.START || tileSymbol === TILE_SYMBOLS.END || tileSymbol === TILE_SYMBOLS.PLAYER) return;

    // Controlla la probabilità di mostrare un flavor text (costante da game_constants.js)
    if (Math.random() < FLAVOR_TEXT_CHANCE) {
        let flavorArray = null; // Array di testi specifici per la situazione

        // Selezione dell'array di testi corretto in base a tipo di terreno e ora (usando dati da game_data.js)
        const tileKey = Object.keys(TILE_SYMBOLS).find(k => TILE_SYMBOLS[k] === tileSymbol);

        if (!tileKey) {
             console.warn(`showRandomFlavorText: Chiave tile non trovata per simbolo '${tileSymbol}'.`);
             return; // Esce se non trova la chiave per il tipo di tile
        }

        // Converte la chiave per corrispondere ai nomi degli array (es. 'PLAINS' -> 'flavorTextsPlains')
        const arrayName = `flavorTexts${tileKey.charAt(0).toUpperCase() + tileKey.slice(1).toLowerCase()}${isDay ? '' : 'Night'}`;

        // Recupera l'array di testi usando il nome costruito
        // Accesso dinamico a variabili globali/costanti può essere rischioso,
        // ma in questa struttura semplice è accettabile se si sa dove cercare.
        // Assumiamo che gli array flavorTextsXxx siano definiti in game_data.js e accessibili.
        flavorArray = window[arrayName]; // Accesso come proprietà dell'oggetto globale window


        // Se abbiamo trovato un array valido e non vuoto:
        if (Array.isArray(flavorArray) && flavorArray.length > 0) {
             // Selezioniamo un testo casuale usando la utility (getRandomText da game_utils.js)
            const randomText = getRandomText(flavorArray);
            if (randomText) {
                // Logghiamo il testo nel log di gioco (usando addMessage da game_utils.js)
                addMessage(randomText, 'normal'); // Usiamo tipo 'normal' per flavor text
                // console.log(`showRandomFlavorText: Mostrato flavor text per ${tileSymbol} (${isDay ? 'Giorno' : 'Notte'}).`); // Log di debug rimosso
            } else {
                 console.warn(`showRandomFlavorText: getRandomText ha ritornato vuoto per array ${arrayName}.`);
            }
        } else {
            // console.log(`showRandomFlavorText: Nessun array di flavor text disponibile per ${tileSymbol} (${isDay ? 'Giorno' : 'Notte'}). Array ${arrayName}:`, flavorArray); // Log di debug rimosso
        }
    }
}

/**
 * Controlla la possibilità di trovare un frammento di lore casuale.
 * Viene chiamato da movePlayer dopo ogni movimento (se nessun evento popup è attivo).
 * Dipende da: game_constants.js (LORE_FRAGMENT_CHANCE), game_data.js (loreFragments), game_utils.js (getRandomText, addMessage).
 */
function checkForLoreFragment() {
    // Non cercare lore se un evento popup è attivo o se il gioco è finito
    // eventScreenActive è gestito in ui.js/events.js
    if (eventScreenActive || !gameActive) return;

    // Controlla la probabilità di trovare un frammento di lore (costante da game_constants.js)
    if (Math.random() < LORE_FRAGMENT_CHANCE) {
         // Verifica che l'array dei frammenti di lore sia disponibile (da game_data.js)
        if (Array.isArray(loreFragments) && loreFragments.length > 0) {
             // Seleziona un frammento casuale (usa la utility getRandomText)
            const randomLore = getRandomText(loreFragments);
            if (randomLore) {
                // Logga il frammento al log di gioco (usando addMessage da game_utils.js)
                addMessage("Trovi un frammento di conoscenza perduta:", 'lore', true); // Messaggio introduttivo importante
                addMessage(randomLore, 'lore'); // Il frammento di testo effettivo
                // console.log("checkForLoreFragment: Trovato e loggato un frammento di lore."); // Log di debug rimosso
                // TODO: Potresti voler aggiungere l'item 'lore_fragment_item' all'inventario qui se i frammenti di lore sono oggetti fisici.
                // addItemToInventory('lore_fragment_item', 1); // Se il lore è rappresentato da un oggetto inventariabile
            } else {
                 console.warn("checkForLoreFragment: getRandomText ha ritornato vuoto per loreFragments.");
            }
        } else {
             console.warn("checkForLoreFragment: Array 'loreFragments' non disponibile o vuoto in game_data.js.");
        }
    }
}

// --- Funzione per applicare le penalità notturne (quando si finisce il giorno all'aperto) ---
// Chiamata da transitionToNight se !inShelter.
// Dipende da: game_constants.js (player, NIGHT_FOOD_COST, NIGHT_WATER_COST, HUNGER_PENALTY_HP, THIRST_PENALTY_HP, STATO_MESSAGGI.NOTTE_APERTO),
// game_utils.js (addMessage, getRandomText), game_core.js (endGame).
/*
// Questa funzione è stata spostata e implementata dentro transitionToNight stessa.
// Non è più una funzione separata chiamata DA transitionToNight.
function applyNightPenalties() {
    // ... codice implementato in transitionToNight ...
}
*/


// NOTA: Le funzioni che cambiano lo stato globale (`player`, `map`, `isDay`, `dayMovesCounter`, ecc.) devono
// assicurarsi di chiamare le funzioni di rendering (`renderStats`, `renderMap`) definite in `ui.js`
// per aggiornare l'interfaccia dopo la modifica.
// Le funzioni che innescano eventi (`triggerTileEvent`, `triggerComplexEvent`) sono definite in `events.js`.

// --- FINE LOGICA MAPPA E MOVIMENTO ---
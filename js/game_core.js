/**
 * TheSafePlace - Roguelike Postapocalittico
 * Versione: v0.7.09
 * File: js/game_core.js
 * Descrizione: Logica principale del gioco, inizializzazione, loop di gioco (input/azioni), fine partita.
 * Dipende da: game_constants.js, dom_references.js, game_utils.js, ui.js, player.js, map.js, events.js
 */

// Dipendenze:
// - Variabili di stato globali (gameActive, gamePaused, eventScreenActive, player, map, ...) da game_constants.js
// - Costanti (TILE_SYMBOLS, MAP_WIDTH, MAP_HEIGHT, ...) da game_constants.js/game_data.js
// - Riferimenti DOM (gameContainer, mapDisplay, endScreen, restartButton, moveButtons, inventoryList, eventChoicesContainer, ...) da dom_references.js
// - Funzioni utility (addMessage) da game_utils.js
// - Funzioni UI (renderLegend, renderStats, renderInventory, renderMap, disableControls, enableControls, hideItemTooltip, showItemTooltip) da ui.js
// - Funzioni Player (generateCharacter, handleInventoryClick) da player.js
// - Funzioni Map (generateMap, movePlayer) da map.js
// - Funzioni Eventi (handleChoiceContainerClick, handleEventKeyPress) da events.js


/**
 * Inizializza lo stato del gioco, genera personaggio e mappa, e configura i listener per avviare il gioco interattivo.
 * Chiamata da window.onload.
 */
function initializeGame() {
    // --- Reset dello stato globale del gioco ---
    // Resetta le variabili di stato (definite in game_constants.js) ai loro valori iniziali.
    // Questo assicura che un nuovo gioco parta da zero.
    player = {}; // Sostituito dall'inizializzazione in generateCharacter
    map = []; // Sostituito dalla generazione in generateMap
    messages = []; // Array vuoto per il log.
    gameActive = false; // Il gioco non è ancora formalmente attivo finché non è tutto pronto.
    eventScreenActive = false; // Nessun popup attivo all'inizio.
    gamePaused = false; // Il gioco non è in pausa all'inizio.
    currentEventChoices = []; // Nessuna scelta di evento attiva.
    currentEventContext = null; // Nessun contesto evento attivo.
    dayMovesCounter = 0; // Contatori passi a zero.
    nightMovesCounter = 0;
    isDay = true; // Inizia sempre di giorno.
    daysSurvived = 0; // Inizia dal Giorno 0.
    easterEggPixelDebhFound = false; // Flag easter egg a falso.
    uniqueEventWebRadioFound = false; // Flag evento unico a falso.
    
    // --- Verifica Riferimenti DOM ---
    // Verifichiamo se gli elementi critici sono stati trovati e popolati correttamente nell'oggetto DOM.
    if (!DOM.gameContainer || !DOM.mapDisplay || !DOM.messagesList || !DOM.inventoryList || !DOM.legendList || !DOM.eventOverlay || !DOM.eventPopup || !DOM.eventTitle || !DOM.eventContent || !DOM.eventChoicesContainer || !DOM.continueButton || !DOM.endScreen || !DOM.restartButton || !DOM.statsList || !DOM.itemTooltip || !DOM.tooltipItemName || !DOM.tooltipItemDesc) {
         console.error("CRITICO: initializeGame: Elementi UI essenziali non trovati in dom_references.js!");
         // Mostra un messaggio di errore nell'area di gioco se possibile
         if(DOM.gameContainer) DOM.gameContainer.innerHTML = "<p style='color:red; padding: 20px;'>ERRORE CRITICO: Elementi UI mancanti. Controlla l'HTML e la console del browser.</p>";
         // Imposta gameActive a false per sicurezza e ritorna
         gameActive = false;
         return; // Interrompe l'inizializzazione
    }


    // --- Generazione Personaggio e Mappa ---
    try {
        // Genera il personaggio (statistiche, inventario iniziale).
        // generateCharacter è definita in player.js. Inizializza l'oggetto player.
        if (typeof generateCharacter === 'function') {
            generateCharacter();
             if (!player || typeof player.vigore !== 'number' || player.x === undefined || player.y === undefined) { // player.x/y inizializzati a -1 in player.js
                 throw new Error("Oggetto player non valido dopo generateCharacter.");
             }
        } else { throw new Error("Funzione generateCharacter non disponibile (player.js non caricato?)."); }


        // Genera la mappa del mondo e posiziona Start/End.
        // generateMap è definita in map.js. Inizializza l'array map e imposta player.x/y.
        if (typeof generateMap === 'function') {
            generateMap();

             if (!map || map.length === 0 || map[0]?.length === 0 || typeof player.x !== 'number' || typeof player.y !== 'number' || player.x < 0 || player.y < 0) {
                 throw new Error("Mappa non valida o posizione giocatore non impostata dopo generateMap.");
             }
              if (map[player.y] && map[player.y][player.x]) {
                   map[player.y][player.x].visited = true;
              }
        } else { throw new Error("Funzione generateMap non disponibile (map.js non caricato?)."); }


    } catch(e) {
        console.error("initializeGame: ERRORE CRITICO DURANTE GENERAZIONE:", e);
        // Mostra errore all'utente in modo più visibile
        if(DOM.gameContainer) DOM.gameContainer.innerHTML = `<p style='color:red; padding: 20px;'>ERRORE GRAVE INIZIALIZZAZIONE: ${e.message}. Impossibile avviare il gioco. Controlla la console.</p>`;
        gameActive = false; // Impedisce l'avvio del gioco
        return; // Ferma l'esecuzione se l'inizializzazione fallisce
    }


    // --- Configurazione UI Iniziale ---
    // Assicurati che la schermata di gioco sia visibile e quella di fine nascosta.
    if(DOM.endScreen) DOM.endScreen.style.display = 'none';
    if(DOM.gameContainer) DOM.gameContainer.style.display = 'flex'; // Mostra il container di gioco (display flex da CSS)
    // Rimuove eventuali classi di overlay attive da una partita precedente
     if(DOM.gameContainer) DOM.gameContainer.classList.remove('overlay-active');
     if(DOM.eventOverlay) DOM.eventOverlay.classList.remove('visible');


    // Chiama le funzioni di rendering
    // Effettua il rendering iniziale dell'interfaccia.
    // render functions sono definite in ui.js
    try {
        if (typeof renderLegend === 'function') renderLegend(); else throw new Error("Funzione renderLegend non disponibile (ui.js?).");
        if (typeof renderStats === 'function') renderStats(); else throw new Error("Funzione renderStats non disponibile (ui.js?)."); // Renderizza statistiche e risorse
        if (typeof renderInventory === 'function') renderInventory(); else throw new Error("Funzione renderInventory non disponibile (ui.js?)."); // Renderizza l'inventario iniziale
        if (typeof renderMap === 'function') renderMap(); else throw new Error("Funzione renderMap non disponibile (ui.js?)."); // Renderizza la mappa
        if (typeof renderMessages === 'function') renderMessages(); else throw new Error("Funzione renderMessages non disponibile (ui.js?)."); // Pulisce il log precedente e renderizza

        // Logga il messaggio iniziale di benvenuto
         // addMessage è definita in game_utils.js
        if (typeof addMessage === 'function') {
             addMessage(`Inizio del viaggio. HP:${Math.floor(player.hp)}/${player.maxHp}, Sazietà:${Math.floor(player.food)}/10, Idratazione:${Math.floor(player.water)}/10. È Giorno.`, 'info', true);
             // Logga il messaggio di inizio specifico del tile START
             const startTileSymbol = map[player.y][player.x].type;
             if (startTileSymbol === TILE_SYMBOLS.START) {
                 addMessage(`Ti trovi al ${TILE_DESC[startTileSymbol] || 'Punto di Partenza'}. Trova il ${TILE_DESC[TILE_SYMBOLS.END] || 'Rifugio'} per vincere.`, 'info');
             }
        } else { console.warn("initializeGame: addMessage non disponibile (game_utils.js?)."); }

    } catch (e) {
        console.error("initializeGame: ERRORE DURANTE RENDERING INIZIALE:", e);
        if(DOM.mapDisplay) DOM.mapDisplay.textContent = "Errore nel rendering iniziale!";
        gameActive = false; // Impedisce di giocare se il rendering fallisce
        return; // Ferma l'inizializzazione
    }


    // --- Configurazione Input Listener ---
    // Imposta tutti gli event listener necessari per l'interazione utente.
    // setupInputListeners è definita qui sotto in game_core.js.
    try {
        setupInputListeners();
    } catch (e) {
        console.error("initializeGame: ERRORE DURANTE SETUP INPUT LISTENERS:", e);
        if(DOM.gameContainer) addMessage("Errore nella configurazione dei controlli.", 'danger');
        gameActive = false; // Impedisce il gioco interattivo
        return; // Ferma l'inizializzazione
    }


    // --- Avvio Formale del Gioco ---
    // Se tutto è andato bene fin qui, imposta il gioco come attivo.
    gameActive = true;
    gamePaused = false; // Assicura che non sia in pausa all'avvio
    // Abilita i controlli di movimento.
    // enableControls è definita in ui.js.
    if (typeof enableControls === 'function') enableControls(); else console.warn("initializeGame: enableControls non disponibile (ui.js?).");


    // Imposta il focus sul documento body per garantire che i tasti vengano catturati.
     // Questo dovrebbe essere fatto DOPO che l'UI è visibile e i listener sono attivi.
    try {
         document.body.focus();
    } catch (e) {
         console.warn("initializeGame: Impossibile impostare il focus iniziale sul document.body.", e);
         // Questo non è critico, ma può causare problemi di input su alcuni browser/dispositivi.
    }


}


/**
 * Gestisce la pressione dei tasti per il movimento e altre azioni globali del gioco.
 * Chiamato da un event listener keydown aggiunto da setupInputListeners.
 * Dipende da: game_constants.js (gameActive, gamePaused, eventScreenActive, isDay, dayMovesCounter, nightMovesCounter, DAY_LENGTH_MOVES, NIGHT_LENGTH_MOVES, MOVE_FOOD_COST, MOVE_WATER_COST),
 * map.js (movePlayer, transitionToNight, transitionToDay), ui.js (renderStats), events.js (handleEventKeyPress).
 * @param {KeyboardEvent} event - L'oggetto evento della tastiera.
 */
function handleKeyPress(event) {
    // Impedisce lo scrolling della pagina con le frecce o WASD, indipendentemente dallo stato del gioco.
     if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "w", "a", "s", "d"].includes(event.key.toLowerCase())) {
        event.preventDefault();
    }

    // Gestione input SPECIFICO degli EVENTI (numeri per scelte, Esc, Enter) - alta priorità.
    // Se un popup evento è attivo, passa l'input a handleEventKeyPress in events.js.
    // eventScreenActive è gestito da showEventPopup/closeEventPopup in ui.js/events.js.
    // handleEventKeyPress è definita in events.js.
    if (eventScreenActive) {
         if (typeof handleEventKeyPress === 'function') {
            handleEventKeyPress(event); // Passa l'evento originale
         } else {
            console.error("handleKeyPress: handleEventKeyPress non disponibile (events.js?).");
         }
         return; // Consuma l'input, non elaborarlo ulteriormente qui.
    }

    // Gestione input GLOBALE (movimento, inventario, ecc.) - solo se il gioco è attivo e NON in pausa (nessun popup attivo).
    // gameActive e gamePaused sono gestiti in game_constants.js e ui.js/events.js.
    if (!gameActive || gamePaused) {
         return; // Ignora l'input di gioco se non è il momento giusto.
    }

    // Elabora l'input di gioco (movimento, azioni globali).
    const key = event.key.toLowerCase(); // Converte il tasto in minuscolo per consistenza

    switch (key) {
        case 'w': // Muovi su
        case 'arrowup':
            // movePlayer è definita in map.js
             if (typeof movePlayer === 'function') movePlayer(0, -1); else console.error("handleKeyPress: movePlayer non disponibile (map.js?).");
            break;
        case 's': // Muovi giù
        case 'arrowdown':
             if (typeof movePlayer === 'function') movePlayer(0, 1); else console.error("handleKeyPress: movePlayer non disponibile (map.js?).");
            break;
        case 'a': // Muovi sinistra
        case 'arrowleft':
             if (typeof movePlayer === 'function') movePlayer(-1, 0); else console.error("handleKeyPress: movePlayer non disponibile (map.js?).");
            break;
        case 'd': // Muovi destra
        case 'arrowright':
             if (typeof movePlayer === 'function') movePlayer(1, 0); else console.error("handleKeyPress: movePlayer non disponibile (map.js?).");
            break;
        case ' ': // Tasto Spazio: Attendi/Riposa per 1 unità di tempo
            // Questo simula un "passo nullo" che fa avanzare il tempo e consuma risorse,
            // ma non cambia la posizione.
            // La logica di avanzamento tempo/consumo/effetti passivi è in movePlayer.
            // Possiamo replicarla qui per un passo nullo, o creare una funzione helper "passTime(amount)".
            // Per semplicità, replichiamo la logica essenziale di un passo singolo.
             if (typeof movePlayer === 'function') { // Reutilizza movePlayer ma senza spostamento.
                  // Potremmo passare dx=0, dy=0 a movePlayer, ma movePlayer controlla e blocca se dx=0, dy=0.
                  // Dobbiamo eseguire solo la parte di movePlayer che gestisce tempo/risorse/eventi.
                  // Creiamo una funzione dedicata nel map.js o qui? Creiamo una funzione in map.js "passTime(amount)".
                  // Per ora, replichiamo la logica minima qui:
                   // Disable controls e imposta pausa *prima* di simulare il passo
                  disableControls(); // Imposta gamePaused = true

                   // Consume risorse (base + malattia)
                  if (typeof consumeResourcesOnMove === 'function') consumeResourcesOnMove();
                  else console.warn("handleKeyPress: consumeResourcesOnMove non disponibile.");

                   // Applica effetti passivi status
                   if (typeof applyPassiveStatusEffects === 'function') applyPassiveStatusEffects();
                   else console.warn("handleKeyPress: applyPassiveStatusEffects non disponibile.");

                   // Controlla se il giocatore è morto
                   if (player.hp <= 0) {
                        if (typeof endGame === 'function') endGame(false);
                        return; // Esci se morto
                   }

                   // Gestisce contatori giorno/notte e transizioni
                   if (isDay) {
                       dayMovesCounter++;
                       if (dayMovesCounter >= DAY_LENGTH_MOVES) {
                           if (typeof transitionToNight === 'function') transitionToNight(); else console.warn("handleKeyPress: transitionToNight non disponibile.");
                       }
                   } else { // Notte
                       // I passi di "attesa" di notte non dovrebbero contare per il contatore NIGHT_LENGTH_MOVES
                       // (che simula il movimento all'aperto forzando l'alba).
                       // Aspettare in un rifugio non forza l'alba. Aspettare all'aperto fa passare il tempo ma non muove.
                       // Decidiamo che "Attendere" (Spazio) fa avanzare il tempo sia di giorno che di notte,
                       // ma non conta per NIGHT_LENGTH_MOVES (che è solo per spostamenti effettivi).
                       // Quindi nightMovesCounter non incrementa qui.

                       // Se si attende di notte FUORI da un rifugio, forse c'è una piccola chance di incontro notturno?
                       // Questa logica è già gestita dal sistema eventi casuali in movePlayer, ma un passo nullo non chiama movePlayer.
                       // Potremmo aggiungere un piccolo check qui.
                       // Per ora, semplifichiamo: "Attendi" è solo consumo risorse + check status messages.
                   }

                   // Logga l'azione "Attendi"
                    if (typeof addMessage === 'function') addMessage("Attendi e riposi brevemente.", 'info');

                   // Aggiorna UI stats (per HP, risorse, ora)
                   if (typeof renderStats === 'function') renderStats(); else console.warn("handleKeyPress: renderStats non disponibile.");

                   // Controlla e logga messaggi di stato (fame, sete, ecc.)
                   if (typeof checkAndLogStatusMessages === 'function') checkAndLogStatusMessages();
                   else console.warn("handleKeyPress: checkAndLogStatusMessages non disponibile.");

                   // Riabilita i controlli e rimuove la pausa *dopo* la simulazione del passo nullo e del logging
                   enableControls(); // gamePaused = false

             } else {
                 console.error("handleKeyPress: Funzione movePlayer non disponibile (map.js?), impossibile simulare passo nullo.");
             }

            break;

        case 'i': // Tasto 'I': Mostra/interagisci con Inventario

            // Per ora, un click sull'inventario apre il popup azione item.
            // Potremmo implementare un popup inventario dedicato più complesso in futuro.
            // Per coerenza con il click, re-indirizziamo a un click simulato sul primo item o apriamo un popup generico.
            // Un popup generico dell'inventario che mostra tutti gli item e permette di cliccarli sarebbe meglio.
            // Per ora, non c'è un popup inventario dedicato. L'interazione avviene cliccando direttamente sulla lista.
            // Non facciamo nulla con il tasto 'I' per ora.

            break;

        // Aggiungere altri tasti per azioni globali (es. 'C' per Scheda Personaggio, 'M' per Mappa estesa se implementata)
    }
}


/**
 * Gestisce il click su bottoni di scelta nei popup eventi.
 * Questa funzione viene chiamata tramite event delegation sul container di scelte.
 * Trova il bottone cliccato, estrae l'indice della scelta e chiama handleEventChoice.
 * @param {MouseEvent} event - L'evento mouse click.
 */
function handleChoiceContainerClick(event) {
    // Verifica che il click provenga da un bottone con indice scelta o dal bottone Continua
    const button = event.target.closest('button');
    if (!button || !DOM.eventChoicesContainer.contains(button)) return;

    const choiceIndexStr = button.dataset.choiceIndex; // Rinominato per chiarezza (è una stringa)

    // Se è un bottone con un indice scelta numerico
    if (choiceIndexStr !== undefined) {
        const choiceIndex = parseInt(choiceIndexStr, 10); // Converti in numero

        // Controlla se il contesto corrente è per un popup di azione oggetto
        if (currentEventContext && currentEventContext.isActionPopup === true) {
            // È un popup di azione oggetto: esegui l'azione definita nella scelta.
            if (currentEventContext.choices && currentEventContext.choices[choiceIndex] && typeof currentEventContext.choices[choiceIndex].action === 'function') {
                currentEventContext.choices[choiceIndex].action();
                // Nota: L'azione stessa (es. usare un item) dovrebbe gestire la chiusura del popup
                // o la visualizzazione di un messaggio di risultato. Se non lo fa,
                // potrebbe essere necessario chiamare closeEventPopup() qui come fallback,
                // ma è preferibile che l'azione sia autoconsistente.
            } else {
                console.error("Azione non trovata o non è una funzione per la scelta selezionata nel popup azione oggetto.");
                if (typeof closeEventPopup === 'function') closeEventPopup(); // Chiudi in caso di errore per sbloccare UI
            }
        } else {
            // È un popup di evento normale: chiama handleEventChoice.
            if (typeof handleEventChoice === 'function') {
                handleEventChoice(choiceIndex);
            } else {
                console.error("handleChoiceContainerClick: Funzione handleEventChoice non trovata (events.js)!");
                if (typeof closeEventPopup === 'function') closeEventPopup(); // Chiudi se non può gestire
            }
        }
    } else if (button.classList.contains('continue-button')) {
        // Gestione del bottone "Continua" (logica esistente)
        if (typeof closeEventPopup === 'function') {
            closeEventPopup();
        } else {
            console.error("handleChoiceContainerClick: Funzione closeEventPopup non trovata (ui.js)!");
        }
    }
}

/**
 * Gestisce la pressione dei tasti numerici durante popup eventi.
 * Permette di selezionare le opzioni con i numeri da 1 a 9.
 * Chiama handleEventChoice con l'indice corrispondente al numero premuto.
 * @param {KeyboardEvent} event - L'evento tastiera.
 */
function handleEventKeyPress(event) {
    // Controlla se è stato premuto un tasto numerico da 1 a 9
    const key = event.key;
    const numKey = parseInt(key, 10);
    
    // Se è un numero da 1 a 9
    if (!isNaN(numKey) && numKey >= 1 && numKey <= 9) {
        // Converti il numero premuto in indice di scelta (0-based)
        const choiceIndex = numKey - 1;
        
        // Chiama la funzione handleEventChoice (definita in events.js) passando l'indice
        if (typeof handleEventChoice === 'function') {
            handleEventChoice(choiceIndex);
        } else {
            console.error("handleEventKeyPress: handleEventChoice non disponibile (events.js?).");
        }
    } 
    // Gestisci anche i tasti Esc o Enter per continuare/chiudere popup
    else if (key === 'Escape' || key === 'Enter') {
        // Cerca il bottone continua e simulane il click se presente
        if (DOM.continueButton && DOM.continueButton.style.display !== 'none') {
            DOM.continueButton.click();
        }
    }
}


/**
 * Imposta tutti gli event listener necessari per l'input utente.
 * Chiamato da initializeGame().
 * Dipende da: dom_references.js (moveButtons, inventoryList, eventChoicesContainer, continueButton, restartButton),
 * game_core.js (handleKeyPress), player.js (handleInventoryClick), events.js (handleChoiceContainerClick).
 */
function setupInputListeners() {
    // Rimuovi listener precedenti per sicurezza (se setup viene chiamato più volte, es. riavvio partita)
    document.removeEventListener('keydown', handleKeyPress); // Listener tastiera principale
    // Rimuovi i listener sui bottoni di movimento se fossero stati aggiunti (attualmente sono in HTML con onclick)
    // if (moveButtons) moveButtons.forEach(btn => btn.removeEventListener('click', ...));

    // Aggiungi il listener principale per la tastiera al documento intero.
    // handleKeyPress è definita in game_core.js (sopra).
    document.addEventListener('keydown', handleKeyPress);


    // Listener per i pulsanti di movimento HTML (già definiti con onclick="movePlayer(dx, dy)" nel HTML).
    // Non è necessario aggiungere altri listener qui per il movimento base.


    // Listener per click sull'inventario (event delegation).
    // Attaccato al container <ul> con ID 'inventory'.
    // handleInventoryClick è definita in player.js.
    if (DOM.inventoryList) {
        // Rimuovi listener precedenti per sicurezza
        DOM.inventoryList.removeEventListener('click', handleInventoryClick);
        // Aggiungi il listener
        if (typeof handleInventoryClick === 'function') {
             DOM.inventoryList.addEventListener('click', handleInventoryClick);
        } else { console.error("setupInputListeners: handleInventoryClick non disponibile (player.js?)."); }

        // Listener per hover/pointer su inventario (per tooltip) - gestito in ui.js dove sono le funzioni tooltip.
        // Questi listener sono aggiunti alla LISTA <ul>, non ai singoli <li>, per delegation.
        // showItemTooltip e hideItemTooltip sono definite in ui.js.
        if (typeof showItemTooltip === 'function' && typeof hideItemTooltip === 'function') {
            // Rimuovi listener precedenti per sicurezza
            DOM.inventoryList.removeEventListener('pointerenter', handleInventoryPointerEnter);
            DOM.inventoryList.removeEventListener('pointerleave', handleInventoryPointerLeave);
            // Aggiungi listener (usiamo helper functions per il delegation)
            DOM.inventoryList.addEventListener('pointerenter', handleInventoryPointerEnter);
            DOM.inventoryList.addEventListener('pointerleave', handleInventoryPointerLeave);
        } else { console.warn("setupInputListeners: Funzioni tooltip (show/hideItemTooltip) non disponibili (ui.js?)."); }

    } else { console.error("setupInputListeners: Elemento #inventory non trovato per listener."); }


    // Listener per click sui bottoni di scelta/azione nei popup evento (event delegation).
    // Attaccato al container <div> con ID 'event-choices'.
    // handleChoiceContainerClick è definita in events.js.
    if (DOM.eventChoicesContainer) {
         // Rimuovi listener precedenti per sicurezza
         DOM.eventChoicesContainer.removeEventListener('click', handleChoiceContainerClick);
         // Aggiungi il listener
         if (typeof handleChoiceContainerClick === 'function') {
              DOM.eventChoicesContainer.addEventListener('click', handleChoiceContainerClick);
         } else { console.error("setupInputListeners: handleChoiceContainerClick non disponibile (events.js?)."); }
    } else { console.error("setupInputListeners: Elemento #event-choices non trovato per listener."); }

    // Listener per il bottone "Continua" nei popup di esito/info.
    // Questo bottone ha un listener diretto `onclick` impostato da showEventPopup (ui.js) quando viene mostrato.
    // Non è necessario aggiungere un delegation listener qui per "Continua".


    // Listener per il bottone di riavvio nella schermata di fine gioco.
    // restartButton è recuperato in dom_references.js.
    // endGame è definita qui sotto in game_core.js.
    if (DOM.restartButton) {
        // Rimuovi listener precedenti per sicurezza
        DOM.restartButton.removeEventListener('click', handleRestartClick);
        // Aggiungi il listener (usiamo helper function per chiarezza)
        DOM.restartButton.addEventListener('click', handleRestartClick);
    } else { console.error("setupInputListeners: Elemento #restart-button non trovato per listener."); }


    // Listener per resize della finestra (per ridisegnare la mappa e adattare la viewport).
    // Mappiamo questo listener qui perché è una funzione globale.
    // La funzione di ridisegno mappa (renderMap) è in ui.js.
    // Usiamo un debounce per evitare di ridisegnare troppo spesso durante il resize.
    window.removeEventListener('resize', handleResize); // Rimuovi listener precedente
    window.addEventListener('resize', handleResize); // Aggiungi listener


}

// --- Helper functions per i listener (per poterli rimuovere facilmente) ---

function handleRestartClick() {
     // Chiama la funzione di fine gioco per riavviare.
     // endGame è definita qui sotto in game_core.js. Passiamo true o false a seconda del contesto,
     // ma dal bottone riavvia non importa il contesto vittoria/sconfitta, semplicemente riavvia.
     // La funzione initializeGame gestisce il reset.
     // Chiamiamo direttamente initializeGame che resetta e riavvia.
     if (typeof initializeGame === 'function') {
          initializeGame();
     } else {
          console.error("handleRestartClick: initializeGame non disponibile. Impossibile riavviare.");
     }
}

let resizeTimeout; // Variabile per il debounce
function handleResize() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        // Solo ridisegna la mappa se il gioco è attivo e non in pausa (es. evento aperto)
        if (gameActive && !gamePaused) {
             // renderMap è definita in ui.js.
             if (typeof renderMap === 'function') renderMap(); else console.warn("handleResize: renderMap non disponibile.");
             // Potresti voler anche ri-renderizzare stats/inventory/legend se il layout cambia significativamente.
             // Per ora, solo la mappa è dinamica con il resize.
        } else {
        }
    }, 250); // Tempo di debounce (250ms)
}

// Helper per delegation listener pointerenter/leave su #inventory (tooltip)
function handleInventoryPointerEnter(event) {
     const listItem = event.target.closest('li[data-item-id]');
     // Non mostrare se il gioco è in pausa (es. popup evento aperto)
     // gamePaused è definito in game_constants.js
     if (listItem && typeof showItemTooltip === 'function' && !gamePaused) {
         const itemId = listItem.dataset.itemId;
          // player e ITEM_DATA sono definiti in game_constants.js / game_data.js
         const itemInInventory = player?.inventory.find(slot => slot.itemId === itemId);
         if (itemInInventory && ITEM_DATA[itemId]) {
              // showItemTooltip è definita in ui.js
             showItemTooltip(itemInInventory, event); // Passa lo slot item (con quantity) e l'evento
         } else {
              // Item non valido o non trovato, nascondi il tooltip
             if (typeof hideItemTooltip === 'function') hideItemTooltip();
         }
     } else if (typeof hideItemTooltip === 'function') {
         // Se gioco in pausa o non è un item list item, nascondi il tooltip per sicurezza
         hideItemTooltip();
     }
}

function handleInventoryPointerLeave(event) {
     // Controlla se il mouse sta uscendo dall'elemento lista o da un suo figlio (e non entrando in un altro list item figlio)
     // Questa logica può essere complessa con delegation. Spesso è più semplice nascondere sempre on mouseout
     // e lasciare che il mouseover sul nuovo elemento lo mostri.
     // hideItemTooltip è definita in ui.js.
     if (typeof hideItemTooltip === 'function') {
         hideItemTooltip();
     } else { console.warn("handleInventoryPointerLeave: hideItemTooltip not available."); }
}


/**
 * Termina la partita (vittoria o sconfitta).
 * Chiamato da movePlayer (map.js) o da handleEventChoice (events.js).
 * Dipende da: game_constants.js (gameActive, gamePaused, daysSurvived, player),
 * dom_references.js (gameContainer, endScreen, endTitle, endMessage, restartButton),
 * ui.js (disableControls, addMessage, renderStats).
 * @param {boolean} isVictory - True se il giocatore ha vinto, false se ha perso.
 */
function endGame(isVictory) {
    gameActive = false;
    gamePaused = true; // Assicura che il gioco sia in pausa

    // Verifica esistenza riferimenti DOM prima di usarli
    if (!DOM.gameContainer || !DOM.endScreen || !DOM.endTitle || !DOM.endMessage || !DOM.restartButton || !DOM.statPanel) {
        console.error("endGame: Riferimenti DOM essenziali mancanti! Impossibile mostrare schermata finale.");
        // Aggiungere un alert o un messaggio fallback per l'utente?
        alert("Errore critico: Impossibile terminare il gioco correttamente.");
        return;
    }

    // Nascondi l'interfaccia di gioco principale e mostra la schermata di fine
    DOM.gameContainer.style.display = 'none'; // Nasconde tutta l'interfaccia di gioco
    DOM.statPanel.style.display = 'none'; // Nascondi anche il pannello statistiche
    // Nascondi eventuali overlay eventi/azioni aperti
    if(DOM.eventOverlay) DOM.eventOverlay.classList.remove('visible');

    if(DOM.endScreen) DOM.endScreen.style.display = 'flex'; // Usa flex o block a seconda del CSS
    if(DOM.endScreen) DOM.endScreen.classList.add('visible'); // Aggiunge la classe per l'animazione fade-in

    // Imposta il messaggio di fine gioco
    if (isVictory) {
        DOM.endTitle.textContent = "Sei Sopravvissuto!";
        if(DOM.endMessage && player) {
            let message = `Dopo ${daysSurvived} giorni di viaggio estenuante, hai finalmente raggiunto la destinazione.

Non è un paradiso, ma è un luogo sicuro. Forse qui potrai ricostruire qualcosa che assomigli a una vita.

Ce l'hai fatta. Sei sopravvissuto.`;

            // Aggiungi statistiche finali alla fine del messaggio
            message += `\n\n`; // Due a capo per separare
            message += `--- Statistiche Finali ---`;
            message += `\nGiorni Sopravvissuti: ${daysSurvived}`;
            message += `\nHP: ${Math.floor(player.hp)}/${player.maxHp}`;
            message += `\nSazietà: ${Math.floor(player.food)}/10`;
            message += `\nIdratazione: ${Math.floor(player.water)}/10`;
            message += `\nOggetti nell'inventario: ${player.inventory.length}`;
            message += `\n--- Fine Statistiche ---`;

            DOM.endMessage.textContent = message;

            if (typeof addMessage === 'function') {
                addMessage("Hai raggiunto la Destinazione Incerta! Hai vinto!", "success", true);
            } else { console.warn("endGame: addMessage not available."); }
        } else if (DOM.endMessage) {
            DOM.endMessage.textContent = "Vittoria (dati non disponibili)";
        }
    } else {
        DOM.endTitle.textContent = "Il Viaggio Finisce Qui";
        if(DOM.endMessage && player) {
            let message = `Sei sopravvissuto per ${daysSurvived} giorni.

Le terre desolate reclamano un'altra vittima.

La fame, la sete, le ferite, la malattia o gli orrori indicibili hanno avuto la meglio.
Il tuo viaggio finisce qui, nell'oblio.`;

            // Aggiungi statistiche finali alla fine del messaggio
            message += `\n\n`; // Due a capo per separare
            message += `--- Statistiche Finali ---`;
            message += `\nGiorni Sopravvissuti: ${daysSurvived}`;
            message += `\nHP: ${Math.floor(player.hp)}/${player.maxHp}`;
            message += `\nSazietà: ${Math.floor(player.food)}/10`;
            message += `\nIdratazione: ${Math.floor(player.water)}/10`;
            message += `\nOggetti nell'inventario: ${player.inventory.length}`;
            message += `\n--- Fine Statistiche ---`;

            DOM.endMessage.textContent = message;

            if (typeof addMessage === 'function') {
                let cause = "sconosciuta";
                if (player.hp <= 0) cause = "morte";
                if (player.food <= 0) cause = "fame";
                if (player.water <= 0) cause = "sete";
                if (player.isInjured) cause = "ferite";
                if (player.isSick) cause = "malattia";
                if (player.isPoisoned) cause = "veleno";

                addMessage(`Sei morto dopo ${daysSurvived} giorni. Causa: ${cause}.`, "danger", true);
            } else { console.warn("endGame: addMessage not available."); }
        } else if (DOM.endMessage) {
            DOM.endMessage.textContent = "Sconfitta (dati non disponibili)";
        }
    }

    // Il bottone di riavvio ha un listener attaccato in setupInputListeners che chiama handleRestartClick (definita qui sopra).
    // handleRestartClick chiama initializeGame.
}

// --- Avvio del Gioco al Caricamento della Pagina ---
// Questo listener window.onload è il punto di ingresso principale dopo che il DOM è pronto.
// Assicurati che dom_references.js sia caricato prima di questo.
// Assicurati che questo script (game_core.js) sia incluso DOPO dom_references.js e gli altri moduli
// da cui initializeGame dipende.
window.onload = function() {
    // Chiama la funzione principale di inizializzazione del gioco.
    initializeGame();
};


// NOTA: Questo file dipende da funzioni e variabili globali definite in TUTTI gli altri moduli JS.
// L'ordine di inclusione in index.html è fondamentale.
// (game_data.js, game_constants.js, game_utils.js, dom_references.js, ui.js, player.js, map.js, events.js, game_core.js)

// --- FINE LOGICA PRINCIPALE ---
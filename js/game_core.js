/**
 * TheSafePlace - Roguelike Postapocalittico
 * Versione: v0.7.11
 * File: js/game_core.js
 * Descrizione: Logica principale del gioco, inizializzazione, loop di gioco (se presente), gestione input globali.
 * Dipende da: game_constants.js, game_data.js, map.js, player.js, ui.js, events.js, game_utils.js, dom_references.js
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
 * Helper per mostrare una schermata e nascondere le altre
 */
function showScreen(screenToShow) {
    const screens = [
        DOM.startScreenContainer,
        DOM.instructionsScreen,
        DOM.storyScreen,
        DOM.gameContainer,
        DOM.endScreen
    ];
    screens.forEach(screen => {
        if (screen && screen !== screenToShow) {
            screen.style.display = 'none';
        }
    });
    if (screenToShow) {
        screenToShow.style.display = 'flex'; // o 'block' a seconda del tuo CSS
    }
}

function initializeStartScreen() {
    showScreen(DOM.startScreenContainer);
    // Assicurati che il gioco NON sia attivo o in pausa all'inizio
    gameActive = false;
    gamePaused = true; // Iniziamo in uno stato "pausato" finché non si inizia la partita

    // Configura i listener per i bottoni del menu principale
    if (DOM.menuBtnNewGame) {
        DOM.menuBtnNewGame.onclick = function() {
            showScreen(DOM.gameContainer); // Mostra la schermata di gioco
            if (DOM.statPanel) DOM.statPanel.style.display = 'flex'; // Assicurati che il pannello stats sia visibile
            initializeGame(); // Chiama la funzione di inizializzazione del gioco esistente
        };
    }
    if (DOM.menuBtnInstructions) {
        DOM.menuBtnInstructions.onclick = function() {
            showScreen(DOM.instructionsScreen);
            // Potresti popolare #instructions-legend-list qui se necessario
            // Ad esempio, copiando la logica da renderLegend() o chiamando una sua versione modificata.
            // Per ora, assumiamo contenuto statico o lo faremo dopo.
            if (typeof populateInstructionsLegend === 'function') {
                populateInstructionsLegend();
            }
        };
    }
    if (DOM.menuBtnStory) {
        DOM.menuBtnStory.onclick = function() {
            showScreen(DOM.storyScreen);
        };
    }

    // Listener per i bottoni "Torna al Menu"
    if (DOM.backToMenuButtons) {
        DOM.backToMenuButtons.forEach(button => {
            button.onclick = function() {
                showScreen(DOM.startScreenContainer);
            };
        });
    }
    
    // TODO: Listener per DOM.menuBtnLoadGame (Fase 3)
}

/**
 * Inizializza lo stato del gioco, genera personaggio e mappa, ecc.
 * Chiamata quando si clicca "NUOVA PARTITA".
 */
function initializeGame() {
    // La logica esistente di initializeGame va qui, MA:
    // 1. Rimuovi la parte che mostra/nasconde gameContainer/endScreen,
    //    perché ora è gestita da showScreen() e initializeStartScreen().
    // 2. Assicurati che gameActive venga impostato a true ALLA FINE di questa funzione.

    // --- Reset dello stato globale del gioco ---
    player = {}; 
    map = []; 
    messages = []; 
    // gameActive = false; // Lasciato commentato perché viene impostato alla fine
    // gamePaused = false; // Lasciato commentato perché viene impostato alla fine
    currentEventChoices = []; 
    currentEventContext = null; 
    dayMovesCounter = 0; 
    nightMovesCounter = 0;
    isDay = true; 
    daysSurvived = 0; 
    easterEggPixelDebhFound = false; 
    uniqueEventWebRadioFound = false; 
    

    // --- Verifica Riferimenti DOM --- 
    // Rimossi log di DEBUG

    if (!DOM.gameContainer || !DOM.mapDisplay || !DOM.messagesList || !DOM.inventoryList || !DOM.legendList || !DOM.eventOverlay || !DOM.eventPopup || !DOM.eventTitle || !DOM.eventContent || !DOM.eventChoicesContainer || !DOM.continueButton || !DOM.endScreen || !DOM.restartButton || !DOM.statsList || !DOM.itemTooltip || !DOM.tooltipItemName || !DOM.tooltipItemDesc) {
         console.error("CRITICO: initializeGame: Elementi UI essenziali non trovati in dom_references.js!");
         if(DOM.gameContainer) DOM.gameContainer.innerHTML = "<p style='color:red; padding: 20px;'>ERRORE CRITICO: Elementi UI mancanti. Controlla l'HTML e la console del browser.</p>";
         gameActive = false; // Imposta gameActive a false per sicurezza
         return; 
    }


    // --- Generazione Personaggio e Mappa --- 
    try {
        if (typeof generateCharacter === 'function') {
            generateCharacter();
             if (!player || typeof player.vigore !== 'number' || player.x === undefined || player.y === undefined) { 
                 throw new Error("Oggetto player non valido dopo generateCharacter.");
             }
        } else { throw new Error("Funzione generateCharacter non disponibile (player.js non caricato?)."); }

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
        if(DOM.gameContainer) DOM.gameContainer.innerHTML = `<p style='color:red; padding: 20px;'>ERRORE GRAVE INIZIALIZZAZIONE: ${e.message}. Impossibile avviare il gioco. Controlla la console.</p>`;
        gameActive = false; 
        return; 
    }


    // --- Configurazione UI Iniziale ---
    if(DOM.gameContainer) DOM.gameContainer.classList.remove('overlay-active');
    if(DOM.eventOverlay) DOM.eventOverlay.classList.remove('visible');


    try {
        if (typeof renderLegend === 'function') renderLegend(); else throw new Error("Funzione renderLegend non disponibile (ui.js?).");
        if (typeof renderStats === 'function') renderStats(); else throw new Error("Funzione renderStats non disponibile (ui.js?)."); 
        if (typeof renderInventory === 'function') renderInventory(); else throw new Error("Funzione renderInventory non disponibile (ui.js?)."); 
        if (typeof renderMap === 'function') renderMap(); else throw new Error("Funzione renderMap non disponibile (ui.js?)."); 
        if (typeof renderMessages === 'function') {
            renderMessages(); // Pulisce e renderizza
            // Logga il messaggio iniziale di benvenuto
            if (typeof addMessage === 'function') {
                 addMessage(`Inizio del viaggio. HP:${Math.floor(player.hp)}/${player.maxHp}, Sazietà:${Math.floor(player.food)}/10, Idratazione:${Math.floor(player.water)}/10. È Giorno.`, 'info', true);
                 const startTileSymbol = map[player.y][player.x].type;
                 if (startTileSymbol === TILE_SYMBOLS.START) {
                     addMessage(`Ti trovi al ${TILE_DESC[startTileSymbol] || 'Punto di Partenza'}. Trova il ${TILE_DESC[TILE_SYMBOLS.END] || 'Rifugio'} per vincere.`, 'info');
                 }
            } else { console.warn("initializeGame: addMessage non disponibile (game_utils.js?)."); }
        } else { 
            throw new Error("Funzione renderMessages non disponibile (ui.js?).");
        }
    } catch (e) {
        console.error("initializeGame: ERRORE DURANTE RENDERING INIZIALE:", e);
        if(DOM.mapDisplay) DOM.mapDisplay.textContent = "Errore nel rendering iniziale!";
        gameActive = false; 
        return; 
    }


    // --- Configurazione Input Listener --- 
    try {
        setupInputListeners();
    } catch (e) {
        console.error("initializeGame: ERRORE DURANTE SETUP INPUT LISTENERS:", e);
        if(DOM.gameContainer && typeof addMessage === 'function') addMessage("Errore nella configurazione dei controlli.", 'danger');
        else if (DOM.gameContainer) DOM.gameContainer.innerHTML += "<p style='color:red;'>Errore controlli!</p>";
        gameActive = false; 
        return; 
    }


    // --- Avvio Formale del Gioco ---
    gameActive = true;
    gamePaused = false; 
    if (typeof enableControls === 'function') enableControls(); else console.warn("initializeGame: enableControls non disponibile (ui.js?).");
    
    try {
        // document.body.focus(); // Focus su gameContainer potrebbe essere meglio se gameContainer è l'elemento principale per l'input
        if(DOM.gameContainer) DOM.gameContainer.focus();
    } catch (e) {
        console.warn("initializeGame: Impossibile impostare il focus iniziale.", e);
    }
}

// Rinomina handleKeyPress a handleGlobalKeyPress per evitare confusione
// e aggiungi controlli per gameActive
function handleGlobalKeyPress(event) {
    // Se siamo in una schermata diversa da quella di gioco o end-game, ignora l'input globale.
    if (DOM.startScreenContainer && DOM.startScreenContainer.style.display === 'flex' ||
        DOM.instructionsScreen && DOM.instructionsScreen.style.display === 'flex' ||
        DOM.storyScreen && DOM.storyScreen.style.display === 'flex') {
        
        if (event.key === 'Escape') {
            if (DOM.instructionsScreen && DOM.instructionsScreen.style.display === 'flex' || 
                DOM.storyScreen && DOM.storyScreen.style.display === 'flex') {
                showScreen(DOM.startScreenContainer);
            }
        }
        return;
    }
    
    // Impedisce lo scrolling della pagina con le frecce o WASD, se il gioco è attivo.
    // Questo controllo va fatto prima di gameActive/gamePaused per evitare scroll indesiderati
    // anche se il gioco è in pausa ma la schermata di gioco è visibile.
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "w", "a", "s", "d", " "].includes(event.key.toLowerCase())) {
        // Preveniamo lo scroll solo se il gameContainer è effettivamente visibile
        // o se è attiva la endScreen (dove lo scroll non serve)
        if ((DOM.gameContainer && DOM.gameContainer.style.display === 'flex') || 
            (DOM.endScreen && DOM.endScreen.style.display === 'flex')) {
            event.preventDefault();
        }
    }

    // Se un popup evento è attivo (gestito da eventScreenActive)
    if (eventScreenActive) {
         if (typeof handleEventKeyPress === 'function') { // Questa è la handleEventKeyPress di game_core per i numeri/Esc/Enter
            handleEventKeyPress(event); 
         } else { 
            console.error("handleGlobalKeyPress: handleEventKeyPress non disponibile (events.js o game_core.js?).");
         }
         return; 
    }

    // Se il gioco non è attivo o è in pausa (diversa da pausa per evento UI)
    if (!gameActive || gamePaused) {
         return; 
    }

    // Il resto della logica di handleKeyPress (movimento, spazio per attendere)
    const key = event.key.toLowerCase(); 

    switch (key) {
        case 'w': 
        case 'arrowup':
             if (typeof movePlayer === 'function') movePlayer(0, -1); else console.error("handleGlobalKeyPress: movePlayer non disponibile (map.js?).");
            break;
        case 's': 
        case 'arrowdown':
             if (typeof movePlayer === 'function') movePlayer(0, 1); else console.error("handleGlobalKeyPress: movePlayer non disponibile (map.js?).");
            break;
        case 'a': 
        case 'arrowleft':
             if (typeof movePlayer === 'function') movePlayer(-1, 0); else console.error("handleGlobalKeyPress: movePlayer non disponibile (map.js?).");
            break;
        case 'd': 
        case 'arrowright':
             if (typeof movePlayer === 'function') movePlayer(1, 0); else console.error("handleGlobalKeyPress: movePlayer non disponibile (map.js?).");
            break;
        case ' ': 
            if (typeof disableControls === 'function') disableControls(); 
            else console.warn("handleGlobalKeyPress (Spazio): disableControls non disponibile.");

            if (typeof consumeResourcesOnMove === 'function') consumeResourcesOnMove();
            else console.warn("handleGlobalKeyPress (Spazio): consumeResourcesOnMove non disponibile.");

            if (typeof applyPassiveStatusEffects === 'function') applyPassiveStatusEffects();
            else console.warn("handleGlobalKeyPress (Spazio): applyPassiveStatusEffects non disponibile.");

            if (player && player.hp <= 0) {
                if (typeof endGame === 'function') endGame(false);
                return; 
            }

            if (isDay) {
                dayMovesCounter++;
                if (dayMovesCounter >= DAY_LENGTH_MOVES) {
                    if (typeof transitionToNight === 'function') transitionToNight(); else console.warn("handleGlobalKeyPress (Spazio): transitionToNight non disponibile.");
                }
            } else { 
                // nightMovesCounter non incrementa per "Attendere"
            }

            if (typeof addMessage === 'function') addMessage("Attendi e riposi brevemente.", 'info');
            else console.warn("handleGlobalKeyPress (Spazio): addMessage non disponibile.");

            if (typeof renderStats === 'function') renderStats(); else console.warn("handleGlobalKeyPress (Spazio): renderStats non disponibile.");

            if (typeof checkAndLogStatusMessages === 'function') checkAndLogStatusMessages();
            else console.warn("handleGlobalKeyPress (Spazio): checkAndLogStatusMessages non disponibile.");

            if (typeof enableControls === 'function') enableControls();
            else console.warn("handleGlobalKeyPress (Spazio): enableControls non disponibile.");
            break;
        // case 'i': (Lasciato per riferimento, non implementato)
        // break;
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
    if (!button || !DOM.eventChoicesContainer || !DOM.eventChoicesContainer.contains(button)) return; // Aggiunto check esistenza container

    const choiceIndexStr = button.dataset.choiceIndex; 

    if (choiceIndexStr !== undefined) {
        const choiceIndex = parseInt(choiceIndexStr, 10); 

        if (currentEventContext && currentEventContext.isActionPopup === true) {
            if (currentEventContext.choices && currentEventContext.choices[choiceIndex] && typeof currentEventContext.choices[choiceIndex].action === 'function') {
                currentEventContext.choices[choiceIndex].action();
            } else {
                console.error("Azione non trovata o non valida nel popup azione oggetto.");
                if (typeof closeEventPopup === 'function') closeEventPopup(); 
            }
        } else {
            if (typeof handleEventChoice === 'function') {
                handleEventChoice(choiceIndex);
            } else {
                console.error("handleChoiceContainerClick: Funzione handleEventChoice non trovata (events.js)!");
                if (typeof closeEventPopup === 'function') closeEventPopup(); 
            }
        }
    } else if (button.classList.contains('continue-button')) {
        if (typeof closeEventPopup === 'function') {
            closeEventPopup();
        } else {
            console.error("handleChoiceContainerClick: Funzione closeEventPopup non trovata (ui.js)!");
        }
    }
}

// handleEventKeyPress (quella per i popup evento, da game_core.js)
// Assicurati che non ci sia un conflitto di nomi se events.js ne ha una sua.
// Se events.js ha la sua, questa potrebbe non essere necessaria o rinominata.
// Per ora, la lascio come l'avevamo definita, assumendo che sia quella usata.
function handleEventKeyPress(event) {
    const key = event.key;
    const numKey = parseInt(key, 10);
    
    if (!isNaN(numKey) && numKey >= 1 && numKey <= 9) {
        const choiceIndex = numKey - 1;
        if (currentEventChoices && choiceIndex < currentEventChoices.length) { // Aggiunto controllo lunghezza array
            if (typeof handleEventChoice === 'function') {
                handleEventChoice(choiceIndex);
            } else {
                console.error("handleEventKeyPress (core): handleEventChoice non disponibile (events.js?).");
            }
        } else {
            // console.warn(`handleEventKeyPress (core): Scelta ${numKey} non valida.`);
        }
    } 
    else if (key === 'Escape' || key === 'Enter') {
        if (DOM.continueButton && DOM.continueButton.style.display !== 'none') {
            DOM.continueButton.click();
        } else {
            // Se non c'è un bottone "Continua", potremmo voler chiudere popup semplici con Esc.
            // Questo dipende da come è strutturato closeEventPopup.
            // Per ora, ci affidiamo al bottone continua.
        }
    }
}


/**
 * Imposta tutti gli event listener necessari per l'input utente.
 */
function setupInputListeners() {
    document.removeEventListener('keydown', handleGlobalKeyPress); 
    document.addEventListener('keydown', handleGlobalKeyPress);

    if (DOM.inventoryList) {
        DOM.inventoryList.removeEventListener('click', handleInventoryClick);
        if (typeof handleInventoryClick === 'function') {
             DOM.inventoryList.addEventListener('click', handleInventoryClick);
        } else { console.error("setupInputListeners: handleInventoryClick non disponibile (player.js?)."); }

        DOM.inventoryList.removeEventListener('pointerenter', handleInventoryPointerEnter, true); // Usa capturing per pointerenter
        DOM.inventoryList.removeEventListener('pointerleave', handleInventoryPointerLeave, true); // Usa capturing per pointerleave
        if (typeof showItemTooltip === 'function' && typeof hideItemTooltip === 'function') {
            DOM.inventoryList.addEventListener('pointerenter', handleInventoryPointerEnter, true);
            DOM.inventoryList.addEventListener('pointerleave', handleInventoryPointerLeave, true);
        } else { console.warn("setupInputListeners: Funzioni tooltip (show/hideItemTooltip) non disponibili (ui.js?)."); }
    } else { console.error("setupInputListeners: Elemento #inventory non trovato per listener."); }

    if (DOM.eventChoicesContainer) {
         DOM.eventChoicesContainer.removeEventListener('click', handleChoiceContainerClick);
         if (typeof handleChoiceContainerClick === 'function') {
              DOM.eventChoicesContainer.addEventListener('click', handleChoiceContainerClick);
         } else { console.error("setupInputListeners: handleChoiceContainerClick non disponibile (game_core.js?)."); }
    } else { console.error("setupInputListeners: Elemento #event-choices non trovato per listener."); }

    if (DOM.restartButton) {
        DOM.restartButton.removeEventListener('click', handleRestartClick);
        DOM.restartButton.addEventListener('click', handleRestartClick);
    } else { console.error("setupInputListeners: Elemento #restart-button non trovato per listener."); }

    window.removeEventListener('resize', handleResize); 
    window.addEventListener('resize', handleResize); 
}

// --- Helper functions per i listener (per poterli rimuovere facilmente) ---

function handleRestartClick() {
     initializeStartScreen(); 
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
    gamePaused = true; 

    if (!DOM.gameContainer || !DOM.endScreen || !DOM.endTitle || !DOM.endMessage || !DOM.restartButton || !DOM.statPanel) {
        console.error("endGame: Riferimenti DOM essenziali mancanti! Impossibile mostrare schermata finale.");
        alert("Errore critico: Impossibile terminare il gioco correttamente.");
        return;
    }

    showScreen(DOM.endScreen); // Usa la nuova funzione helper
    if(DOM.gameContainer) DOM.gameContainer.style.display = 'none'; // Assicura che sia nascosto
    if(DOM.statPanel) DOM.statPanel.style.display = 'none'; // Assicura che sia nascosto


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
    // L'oggetto DOM dovrebbe essere già popolato da dom_references.js caricato prima
    initializeStartScreen();
};


// NOTA: Questo file dipende da funzioni e variabili globali definite in TUTTI gli altri moduli JS.
// L'ordine di inclusione in index.html è fondamentale.
// (game_data.js, game_constants.js, game_utils.js, dom_references.js, ui.js, player.js, map.js, events.js, game_core.js)

// --- FINE LOGICA PRINCIPALE ---
/**
 * TheSafePlace - Roguelike Postapocalittico
 * Versione: v0.7.20 BugFix 1
 * File: js/game_core.js
 * Descrizione: Logica principale del gioco, inizializzazione, loop di gioco e gestione input.
 * Dipende da: game_constants.js, game_data.js, game_utils.js, ui.js, player.js, map.js, events.js, dom_references.js
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
        // Assicurati che screen esista prima di tentare di modificarne lo stile
        if (screen) { 
            if (screen !== screenToShow) {
                screen.style.display = 'none';
            } else {
                // Non è necessario fare nulla se screen === screenToShow qui, 
                // perché lo mostreremo dopo il loop.
            }
        } else {
            // Opzionale: logga un avviso se uno degli screen attesi è mancante
            // console.warn("showScreen: Uno degli elementi screen nell'array 'screens' è null o undefined.");
        }
    });

    // Mostra lo screen richiesto, solo se esiste
    if (screenToShow) {
        // Tentativo di forzare il browser a calcolare lo stile
        try {
            const _ = screenToShow.style.display; // Leggi lo stile attuale
        } catch (e) {
            console.error("showScreen: Errore durante la lettura di screenToShow.style.display", e, screenToShow);
            return; // Esci se non possiamo nemmeno leggere lo stile
        }
        screenToShow.style.display = 'flex'; // o 'block' a seconda del tuo CSS
    } else {
        console.error("showScreen: screenToShow è null o undefined. Impossibile mostrare la schermata richiesta.");
    }
}

function initializeStartScreen() {
    showScreen(DOM.startScreenContainer);
    if (DOM.gameVersionDisplay && typeof GAME_VERSION !== 'undefined') {
        DOM.gameVersionDisplay.textContent = `Versione: ${GAME_VERSION}`;
    }
    // Assicurati che il gioco NON sia attivo o in pausa all'inizio
    gameActive = false;
    gamePaused = true; // Iniziamo in uno stato "pausato" finché non si inizia la partita

    // Listener per i bottoni "Torna al Menu" dalle schermate Istruzioni/Storia
    if (DOM.backToMenuButtons) {
        DOM.backToMenuButtons.forEach(button => {
            button.onclick = function() {
                showScreen(DOM.startScreenContainer);
            };
        });
    }
}

/**
 * Inizializza lo stato del gioco, genera personaggio e mappa, ecc.
 * Chiamata quando si clicca "NUOVA PARTITA".
 */
function initializeGame() {
    console.log("Inizializzazione gioco...");
    gameActive = true;
    gamePaused = false;
    eventScreenActive = false;
    gameDay = 1;
    dayMovesCounter = 0;
    isDay = true;
    easterEggPixelDebhFound = false;
    uniqueEventWebRadioFound = false;
    currentEventChoices = [];
    currentEventContext = null;

    // Pulisci log messaggi precedente
    if(DOM.messagesList) DOM.messagesList.innerHTML = '';
    messages.length = 0;

    // Genera personaggio e mappa
    if (typeof generateCharacter === 'function') generateCharacter(); else console.error("initializeGame: generateCharacter non trovata!");
    if (typeof generateMap === 'function') generateMap(); else console.error("initializeGame: generateMap non trovata!");

    // Renderizza stato iniziale
    if (typeof renderMap === 'function') renderMap(); else console.error("initializeGame: renderMap non trovata!");
    if (typeof renderStats === 'function') renderStats(); else console.error("initializeGame: renderStats non trovata!");
    if (typeof renderInventory === 'function') renderInventory(); else console.error("initializeGame: renderInventory non trovata!");
    if (typeof renderLegend === 'function') renderLegend(); else console.error("initializeGame: renderLegend non trovata!");
    
    addMessage(`Giorno ${gameDay}. L'avventura inizia...`, "info");

    // Aggiorna versione visualizzata (anche se non cambia, buona pratica)
    if (DOM.gameVersion) DOM.gameVersion.textContent = GAME_VERSION;

    // Imposta focus per input tastiera
    try {
        // document.body.focus(); // Focus su gameContainer potrebbe essere meglio se gameContainer è l'elemento principale per l'input
        if(DOM.gameContainer) DOM.gameContainer.focus();
    } catch (e) {
        console.warn("initializeGame: Impossibile impostare il focus iniziale.", e);
    }
    // console.log("Gioco Iniziato!"); // RIMOSSO
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
    let activeContext = currentEventContext; // Usa currentEventContext di default

    // console.log("DEBUG handleChoiceContainerClick: currentEventContext ALL'INGRESSO:", JSON.stringify(currentEventContext, null, 2));
    // Assicurati che savedActionPopupContext sia accessibile qui (dovrebbe esserlo se definita in player.js o globalmente)
    // console.log("DEBUG handleChoiceContainerClick: savedActionPopupContext ALL'INGRESSO:", typeof savedActionPopupContext !== 'undefined' ? JSON.stringify(savedActionPopupContext, null, 2) : 'savedActionPopupContext non definito');

    // Se currentEventContext è null, ma abbiamo un savedActionPopupContext, usiamo quello!
    if (!activeContext && typeof savedActionPopupContext !== 'undefined' && savedActionPopupContext && savedActionPopupContext.isActionPopup) {
        // console.log("DEBUG handleChoiceContainerClick: currentEventContext era null, USO savedActionPopupContext!");
        activeContext = savedActionPopupContext;
    }

    // console.log("DEBUG handleChoiceContainerClick: Contesto ATTIVO che verrà usato:", JSON.stringify(activeContext, null, 2));
    // console.log("DEBUG handleChoiceContainerClick: Inizio. Event target:", event.target);
    
    const button = event.target.closest('button');
    if (!button || !DOM.eventChoicesContainer || !DOM.eventChoicesContainer.contains(button)) return;

    const choiceIndexStr = button.dataset.choiceIndex; 

    if (choiceIndexStr !== undefined) {
        const choiceIndex = parseInt(choiceIndexStr, 10);
        
        let isActionPopupValue = 'Non definito/Contesto Falsy';
        if (activeContext) { 
            if (activeContext.hasOwnProperty('isActionPopup')) {
                isActionPopupValue = activeContext.isActionPopup;
            } else {
                isActionPopupValue = 'isActionPopup non è una proprietà del contesto';
            }
        }
        // console.log("DEBUG handleChoiceContainerClick: choiceIndex:", choiceIndex, "Valore di isActionPopup (da activeContext):", isActionPopupValue);

        if (activeContext && activeContext.isActionPopup === true) { 
            // console.log("DEBUG handleChoiceContainerClick: Chiamo azione diretta del popup (da activeContext).");
            if (activeContext.choices && activeContext.choices[choiceIndex] && typeof activeContext.choices[choiceIndex].action === 'function') {
                activeContext.choices[choiceIndex].action();
                if (typeof savedActionPopupContext !== 'undefined') savedActionPopupContext = null; // Consumato, quindi pulisci
            } else {
                console.error("Azione non trovata o non valida nel popup azione oggetto (da activeContext).");
                if (typeof closeEventPopup === 'function') closeEventPopup(); 
                if (typeof savedActionPopupContext !== 'undefined') savedActionPopupContext = null; // Errore, pulisci comunque
            }
        } else {
            // console.log("DEBUG handleChoiceContainerClick: Chiamo handleEventChoice (activeContext non era per popup azione).");
            if (typeof savedActionPopupContext !== 'undefined' && savedActionPopupContext) {
                 // console.log("DEBUG handleChoiceContainerClick: C'era un savedActionPopupContext, lo pulisco prima di chiamare handleEventChoice.");
                 savedActionPopupContext = null; 
            }
            
            if (typeof handleEventChoice === 'function') {
                handleEventChoice(choiceIndex); 
            } else {
                console.error("handleChoiceContainerClick: Funzione handleEventChoice non trovata (events.js)!");
                if (typeof closeEventPopup === 'function') closeEventPopup(); 
            }
        }
    } else if (button.classList.contains('continue-button')) {
        if (typeof savedActionPopupContext !== 'undefined' && savedActionPopupContext) {
            // console.log("DEBUG handleChoiceContainerClick: Bottone Continua premuto, pulisco savedActionPopupContext.");
            savedActionPopupContext = null;
        }
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

    // Listener per input da tastiera (movimento, azioni rapide)
    if (DOM.gameContainer) {
        // Usiamo keydown per catturare anche i tasti freccia/numpad
        DOM.gameContainer.addEventListener('keydown', handleGlobalKeyPress);
    } else {
        console.error("setupInputListeners: gameContainer non trovato nel DOM!");
    }

    // Listener per click sull'inventario (delegation sul contenitore ul#inventory)
    if (DOM.inventoryList) {
        // handleInventoryClick è definita in player.js
        DOM.inventoryList.addEventListener('click', handleInventoryClick);
    } else {
        console.error("setupInputListeners: inventoryList non trovato nel DOM!");
    }

    // Listener per i pulsanti della schermata iniziale
    if (DOM.startButton) {
        DOM.startButton.addEventListener('click', () => {
            showScreen(DOM.gameContainer);
            initializeGame();
        });
    }
    if (DOM.instructionsButton) {
        DOM.instructionsButton.addEventListener('click', () => {
            // console.log("[Debug] Attempting to show Instructions screen. DOM.instructionsScreen:", DOM.instructionsScreen); // RIMOSSO
            showScreen(DOM.instructionsScreen)
        });
    }
    if (DOM.storyButton) {
        DOM.storyButton.addEventListener('click', () => {
            // console.log("[Debug] Attempting to show Story screen. DOM.storyScreen:", DOM.storyScreen); // RIMOSSO
            showScreen(DOM.storyScreen)
        });
    }
    // Listener per il NUOVO pulsante Carica Partita
    if (DOM.loadGameButton) {
        DOM.loadGameButton.addEventListener('click', () => {
            if (!loadGame()) { // Tenta di caricare
                 // Se loadGame ritorna false (errore o nessun salvataggio), rimane sulla schermata iniziale
                 console.log("Caricamento fallito o nessun salvataggio.");
            }
            // Se loadGame() ha successo, si occupa già lui di cambiare schermata e attivare il gioco.
        });

        // Disabilita il pulsante Carica se non ci sono dati salvati
        if (!localStorage.getItem(SAVE_KEY)) {
            DOM.loadGameButton.disabled = true;
            DOM.loadGameButton.title = "Nessuna partita salvata trovata";
        }
    }

    // Listener per i pulsanti "Indietro" nelle schermate Istruzioni/Storia/Fine
    const backButtons = document.querySelectorAll('.back-to-start-button');
    backButtons.forEach(button => {
        button.addEventListener('click', () => showScreen('start-screen-container'));
    });

    // Listener per il NUOVO pulsante Salva Partita
    if (DOM.saveGameButton) {
        DOM.saveGameButton.addEventListener('click', saveGame);
    } else {
         console.error("setupInputListeners: saveGameButton non trovato nel DOM!");
    }

    // NUOVO: Listener per il pulsante "Crafting"
    if (DOM.openCraftingButton) {
        DOM.openCraftingButton.addEventListener('click', () => {
            if (typeof showCraftingPopup === 'function') {
                showCraftingPopup();
            } else {
                console.error("setupInputListeners: Funzione showCraftingPopup non trovata in ui.js");
                if (typeof addMessage === 'function') addMessage("Errore: Funzione Crafting non disponibile.", "error");
            }
        });
    } else {
        console.warn("setupInputListeners: Pulsante openCraftingButton non trovato nel DOM.");
    }

    // Aggiungere qui altri listener globali se necessario
     console.log("Input listeners impostati.");
}

// --- Helper functions per i listener (per poterli rimuovere facilmente) ---

function handleRestartClick() {
     showScreen(DOM.startScreenContainer); // Mostra la schermata iniziale
     // initializeStartScreen(); // Non chiamare di nuovo, gameActive/Paused sono già gestiti
     //                           // e i listener dei bottoni menu sono già in setupInputListeners
     gameActive = false; // Reimposta lo stato per la schermata iniziale
     gamePaused = true;
     // Potrebbe essere necessario disabilitare/riabilitare il bottone loadGame qui
     if (DOM.loadGameButton) {
        DOM.loadGameButton.disabled = !localStorage.getItem(SAVE_KEY);
        DOM.loadGameButton.title = localStorage.getItem(SAVE_KEY) ? "" : "Nessuna partita salvata trovata";
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
    // Se un popup evento è attivo, chiudilo prima di procedere con la schermata di fine gioco.
    if (eventScreenActive && typeof closeEventPopup === 'function') {
        closeEventPopup(); // Questa funzione dovrebbe resettare eventScreenActive e gamePaused (se necessario)
    }

    // console.log("endGame chiamata! Vittoria:", isVictory, "HP Giocatore:", player ? player.hp : 'player non definito'); // Log di debug
    gameActive = false; // Imposta lo stato del gioco come non attivo
    gamePaused = true;
    console.log("Flag di stato impostati. gameActive:", gameActive, "gamePaused:", gamePaused);

    if (!DOM.gameContainer || !DOM.endScreen || !DOM.endTitle || !DOM.endMessage || !DOM.restartButton) {
        console.error("endGame: Riferimenti DOM essenziali mancanti! Impossibile mostrare schermata finale.");
        // Forse uscire o mostrare un alert di base?
        // alert("Errore critico: impossibile terminare il gioco correttamente.");
        return; // Esce per evitare ulteriori errori
    }

    // Nasconde il contenitore principale del gioco e mostra la schermata di fine
    if (DOM.gameContainer) DOM.gameContainer.style.display = 'none';
    if (DOM.endScreen) DOM.endScreen.style.display = 'flex'; // Usa flex per centrare il contenuto

    let dayString = (daysSurvived === 1) ? "giorno" : "giorni";

    if (isVictory) {
        DOM.endTitle.textContent = "Sei Sopravvissuto!";
        if(DOM.endMessage && player) {
            let message = `Dopo ${daysSurvived} ${dayString} di viaggio estenuante, hai finalmente raggiunto la destinazione.\n\nNon è un paradiso, ma è un luogo sicuro. Forse qui potrai ricostruire qualcosa che assomigli a una vita.\n\nCe l'hai fatta. Sei sopravvissuto.`;

            // Aggiungi statistiche finali alla fine del messaggio
            message += `\n\n`; // Due a capo per separare
            message += `--- Statistiche Finali ---`;
            message += `\nGiorni Sopravvissuti: ${daysSurvived} ${dayString}`;
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
            let message = `Sei sopravvissuto per ${daysSurvived} ${dayString}.\n\nLe terre desolate reclamano un'altra vittima.\n\nLa fame, la sete, le ferite, la malattia o gli orrori indicibili hanno avuto la meglio.\nIl tuo viaggio finisce qui, nell'oblio.`;

            // Aggiungi statistiche finali alla fine del messaggio
            message += `\n\n`; // Due a capo per separare
            message += `--- Statistiche Finali ---`;
            message += `\nGiorni Sopravvissuti: ${daysSurvived} ${dayString}`;
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
    // Chiamata a assignAllDOMReferences() è gestita automaticamente da dom_references.js
    
    initializeStartScreen(); // Prepara la schermata iniziale
    setupInputListeners();   // Attacca TUTTI gli event listener necessari, inclusi quelli del menu
};


// NOTA: Questo file dipende da funzioni e variabili globali definite in TUTTI gli altri moduli JS.
// L'ordine di inclusione in index.html è fondamentale.
// (game_data.js, game_constants.js, game_utils.js, dom_references.js, ui.js, player.js, map.js, events.js, game_core.js)

// --- FINE LOGICA PRINCIPALE ---

// --- FUNZIONI DI SALVATAGGIO E CARICAMENTO ---

const SAVE_KEY = 'theSafePlaceSaveData'; // Chiave per localStorage

/**
 * Raccoglie lo stato corrente del gioco e lo salva in localStorage.
 */
function saveGame() {
    console.log("Salvataggio partita...");
    try {
        const saveData = {
            player: player,
            map: map,
            dayMovesCounter: dayMovesCounter,
            isDay: isDay,
            gameDay: gameDay,
            easterEggPixelDebhFound: easterEggPixelDebhFound,
            uniqueEventWebRadioFound: uniqueEventWebRadioFound,
            // Aggiungere qui altre variabili globali da salvare se necessario
            saveTimestamp: new Date().toISOString() // Data/ora salvataggio
        };

        // Converti in JSON
        // Nota: JSON.stringify gestisce bene oggetti semplici e array, ma attenzione a oggetti complessi o con riferimenti circolari (non dovremmo averne qui).
        const saveDataString = JSON.stringify(saveData);

        // Salva in localStorage
        localStorage.setItem(SAVE_KEY, saveDataString);

        addMessage("Partita salvata con successo!", "success");
        console.log("Salvataggio completato.");

    } catch (error) {
        console.error("Errore durante il salvataggio della partita:", error);
        addMessage("Errore durante il salvataggio della partita!", "danger");
    }
}

/**
 * Carica lo stato del gioco da localStorage.
 * @returns {boolean} True se il caricamento ha avuto successo, false altrimenti.
 */
function loadGame() {
    console.log("Caricamento partita...");
    try {
        const saveDataString = localStorage.getItem(SAVE_KEY);

        if (!saveDataString) {
            console.log("Nessun dato di salvataggio trovato.");
            addMessage("Nessuna partita salvata trovata.", "warning");
            return false;
        }

        // Converti da JSON
        const loadedData = JSON.parse(saveDataString);

        // Verifica dati base (opzionale ma consigliato)
        if (!loadedData || !loadedData.player || !loadedData.map) {
             console.error("Dati di salvataggio corrotti o incompleti.", loadedData);
             addMessage("Errore: Dati di salvataggio corrotti o non validi.", "danger");
             localStorage.removeItem(SAVE_KEY); // Rimuovi dati corrotti
             return false;
        }

        // --- Ripristina Stato Globale --- 
        // NOTA IMPORTANTE: Sovrascriviamo le variabili globali direttamente.
        // Per oggetti complessi come player e map, questo è generalmente ok perché
        // JSON.parse crea nuovi oggetti/array, rompendo i riferimenti precedenti.
        player = loadedData.player;
        map = loadedData.map;
        dayMovesCounter = loadedData.dayMovesCounter;
        isDay = loadedData.isDay;
        gameDay = loadedData.gameDay;
        easterEggPixelDebhFound = loadedData.easterEggPixelDebhFound;
        uniqueEventWebRadioFound = loadedData.uniqueEventWebRadioFound;
        // Ripristinare qui altre variabili globali salvate

        console.log("Stato del gioco ripristinato:", loadedData);

        // --- Aggiorna Interfaccia --- 
        // È cruciale chiamare tutte le funzioni di rendering per riflettere lo stato caricato
        // Usiamo setTimeout per dare tempo al browser di calcolare il layout dopo showScreen
        setTimeout(() => {
            console.log("Rendering UI after load timeout...");
            if (typeof renderMap === 'function') renderMap(); else console.error("loadGame: renderMap non trovata!");
            if (typeof renderStats === 'function') renderStats(); else console.error("loadGame: renderStats non trovata!");
            if (typeof renderInventory === 'function') renderInventory(); else console.error("loadGame: renderInventory non trovata!");
            if (typeof renderLegend === 'function') renderLegend(); // Aggiunto anche renderLegend
             // Potrebbe essere necessario un refresh specifico per tooltip o altro stato UI?
        }, 100); // Ritardo di 100ms (aggiustabile se necessario)

        // --- Transizione Schermata e Attivazione Gioco --- 
        if (typeof showScreen === 'function') {
            showScreen(DOM.gameContainer); // CORRETTO: Passa l'oggetto DOM
        } else {
            console.error("loadGame: showScreen non trovata!");
        }
        gameActive = true; // Attiva il gioco
        gamePaused = false; // Assicura che non sia in pausa
        eventScreenActive = false; // Assicura che nessun popup evento sia attivo
        // Imposta focus per input tastiera
        try {
            if(DOM.gameContainer) DOM.gameContainer.focus();
        } catch (e) {
            console.warn("loadGame: Impossibile impostare il focus iniziale.", e);
        }

        addMessage(`Partita caricata (salvata il ${new Date(loadedData.saveTimestamp).toLocaleString()}).`, "success");
        console.log("Caricamento completato.");
        return true;

    } catch (error) {
        console.error("Errore durante il caricamento della partita:", error);
        addMessage("Errore durante il caricamento della partita! Potrebbe essere corrotta.", "danger");
        // Considera di rimuovere dati corrotti?
        // localStorage.removeItem(SAVE_KEY);
        return false;
    }
}



// --- FUNZIONI DI GESTIONE INPUT ---
/**
 * TheSafePlace - Roguelike Postapocalittico
 * File: js/events.js
 * Descrizione: Gestione degli eventi di gioco (specifici del tile, complessi, popup)
 * Dipende da: game_constants.js, game_data.js, game_utils.js, ui.js, player.js
 */

// Dipendenze:
// - Variabili di stato globali (player, map, isDay, eventScreenActive, gamePaused, currentEventChoices, currentEventContext, ...) da game_constants.js
// - Costanti (EVENT_CHANCE, EVENT_DATA, COMPLEX_EVENT_CHANCE, COMPLEX_EVENT_TYPE_WEIGHTS, TILE_SYMBOLS, STATO_MESSAGGI, ...costanti esiti/probabilità danni/loot) da game_constants.js/game_data.js
// - Funzioni utility (getRandomInt, addMessage, getRandomText, performSkillCheck, getSkillCheckLikelihood, chooseWeighted) da game_utils.js
// - Funzioni UI (showEventPopup, closeEventPopup, renderStats, renderMap, disableControls, enableControls) da ui.js
// - Funzioni Player (addItemToInventory, removeItemFromInventory, consumeAmmo, checkAmmoAvailability) da player.js
// - Funzioni Map (transitionToDay, transitionToNight) da map.js
// - Funzione endGame (da game_core.js)


// --- Funzioni di Trigger Eventi ---

/**
 * Tenta di attivare un evento casuale specifico della casella corrente, se applicabile.
 * Chiamato da movePlayer (map.js).
 * Dipende da: game_constants.js (map, player, EVENT_CHANCE, TILE_SYMBOLS, easterEggPixelDebhFound, uniqueEventWebRadioFound),
 * game_data.js (EVENT_DATA), ui.js (showEventPopup).
 * @param {string} tileSymbol - Il simbolo del tipo di casella su cui si trova il giocatore.
 */
function triggerTileEvent(tileSymbol) {
    // Non fare nulla se un popup evento è già attivo, se il gioco non è attivo, o se il tileSymbol non è valido.
    if (eventScreenActive || !gameActive || !tileSymbol) return;

    // Non scatenare eventi specifici su Start o End (la fine è gestita altrove).
    if (tileSymbol === TILE_SYMBOLS.START) {
        // console.log("triggerTileEvent: Non scateno eventi su Start."); // Log di debug rimosso
        // TODO: Evento speciale inizio gioco? Gestito in game_core.js initializeGame per ora.
        return;
    }
     if (tileSymbol === TILE_SYMBOLS.END) {
         // console.log("triggerTileEvent: Non scateno eventi su End (fine gioco)."); // Log di debug rimosso
         // La logica di fine gioco (EndGame) è già stata chiamata in movePlayer.
         return;
     }


    // Trova la chiave testuale corrispondente al simbolo del tile (es. '.' -> 'PLAINS').
    const tileKey = Object.keys(TILE_SYMBOLS).find(k => TILE_SYMBOLS[k] === tileSymbol);
    if (!tileKey || !EVENT_DATA[tileKey]) {
        // console.log(`triggerTileEvent: Nessun dato evento definito per tile type '${tileSymbol}' (chiave '${tileKey}').`); // Log di debug rimosso
        return; // Nessun dato evento definito per questo tipo di casella.
    }

    // Recupera la lista di eventi possibili per questo tipo di casella.
    let eventPool = EVENT_DATA[tileKey];
    // Recupera la probabilità base che un evento specifico del tile accada.
    const eventChance = EVENT_CHANCE[tileKey] || 0; // Default a 0 se non definita.

    // --- LOGICA EVENTI UNICI (CITY ONLY) ---
    // Gestisce gli eventi unici che dovrebbero accadere solo una volta nella partita.
    // Questi hanno una probabilità separata e più bassa.
    if (tileKey === 'CITY') {
        const uniqueEvents = eventPool.filter(event => event.isUnique);
        const standardEvents = eventPool.filter(event => !event.isUnique);

        for (const uniqueEvent of uniqueEvents) {
            // Controlla se l'evento unico è già stato trovato (usando flag globali)
            let eventAlreadyFound = false;
            if (uniqueEvent.id === "city_easter_egg_pixeldebh" && easterEggPixelDebhFound) eventAlreadyFound = true;
            if (uniqueEvent.id === "city_unique_webradio" && uniqueEventWebRadioFound) eventAlreadyFound = true;

            // Se l'evento non è stato trovato E la probabilità bassa si verifica:
            if (!eventAlreadyFound && Math.random() < EASTER_EGG_CHANCE) { // Usa la costante EASTER_EGG_CHANCE
                 // console.log(`triggerTileEvent: Attivo evento unico '${uniqueEvent.id}' su CITY.`); // Log di debug
                 showEventPopup(uniqueEvent); // Mostra l'evento unico.

                 // Imposta il flag per marcare l'evento come trovato.
                 if (uniqueEvent.id === "city_easter_egg_pixeldebh") easterEggPixelDebhFound = true;
                 if (uniqueEvent.id === "city_unique_webradio") uniqueEventWebRadioFound = true;

                 return; // Evento unico trovato e attivato, esci dalla funzione.
            }
        }
        // Dopo aver controllato gli eventi unici, continua con gli eventi standard usando la pool standard.
        eventPool = standardEvents;
    }
    // --- FINE LOGICA EVENTI UNICI ---


    // --- LOGICA EVENTI STANDARD DEL TILE ---

    // --- NUOVO: Filtra la pool di eventi standard in base all'ora del giorno ---
    // Utilizza la variabile globale 'isDay' e la proprietà 'triggerCondition' nell'oggetto evento.
    const originalPoolLength = eventPool.length;
    const filteredEventPool = eventPool.filter(event => {
        // Se l'evento non ha triggerCondition, è valido sia di giorno che di notte.
        if (!event.triggerCondition) {
            return true;
        }
        // Se ha triggerCondition: 'isDay', è valido solo se isDay è true.
        if (event.triggerCondition === 'isDay' && isDay) {
            return true;
        }
        // Se ha triggerCondition: 'isNight', è valido solo se isDay è false.
        if (event.triggerCondition === 'isNight' && !isDay) {
            return true;
        }
        // Altrimenti (es. triggerCondition è presente ma non corrisponde all'ora), non è valido.
        return false;
    });

    // Sostituisce la pool originale con quella filtrata
    eventPool = filteredEventPool;
    // console.log(`triggerTileEvent: Pool filtrata per ora (${isDay ? 'Giorno' : 'Notte'}). Originale: ${originalPoolLength}, Filtrata: ${eventPool.length}`); // Log di debug

    // Filtra dalla pool filtrata eventuali eventi che non dovrebbero più accadere
    // (es. se un evento è stato progettato per accadere una sola volta ma non ha il flag isUnique per qualche ragione).
    // Per ora non abbiamo eventi standard one-time che non siano "isUnique".
    // Potremmo aggiungere logica qui in futuro se necessario.

    // Se la pool di eventi filtrata è vuota o la probabilità non si verifica, non fare nulla.
    if (eventPool.length === 0 || Math.random() > eventChance) {
        // console.log(`triggerTileEvent: Nessun evento standard attivato su ${tileSymbol}. Probabilità: ${eventChance}, Pool Filtrata: ${eventPool.length}`); // Log di debug rimosso
        return;
    }

    // Seleziona un evento casuale dalla pool standard FILTRATA.
    const randomEvent = getRandomText(eventPool); // Usa la utility getRandomText sulla pool filtrata

    // Mostra l'evento selezionato (se valido).
    if (randomEvent) {
         // console.log(`triggerTileEvent: Attivo evento standard '${randomEvent.id}' su ${tileSymbol}.`); // Log di debug
         showEventPopup(randomEvent); // showEventPopup imposta eventScreenActive = true.
    } else {
         console.warn(`triggerTileEvent: Selezione casuale evento standard ha ritornato null o undefined per tile type '${tileSymbol}'.`);
    }

    // console.log("triggerTileEvent: Fine esecuzione."); // Log di debug rimosso
}


/**
 * Tenta di attivare un evento complesso generico (Predatori, Animali, etc.).
 * Viene chiamato da movePlayer (map.js) SOLO se un evento specifico del tile NON è stato attivato.
 * Dipende da: game_constants.js (gameActive, eventScreenActive, COMPLEX_EVENT_CHANCE, COMPLEX_EVENT_TYPE_WEIGHTS, TILE_SYMBOLS, ...costanti esiti/probabilità danni/loot),
 * game_data.js (...descrizioni eventi complessi arrays, tipiBestie), game_utils.js (addMessage, getRandomText, performSkillCheck, chooseWeighted, getSkillCheckLikelihood, getRandomInt),
 * ui.js (showEventPopup, renderStats), player.js (addItemToInventory, removeItemFromInventory, checkRepairMaterials, applyRepair, checkAmmoAvailability, consumeAmmo),
 * map.js (transitionToDay, transitionToNight), game_core.js (endGame).
 * @param {string} tileSymbol - Il simbolo del tipo di casella su cui si trova il giocatore.
 */
function triggerComplexEvent(tileSymbol) {
    // Non attivare se un popup è già attivo (garantito da movePlayer chiamante), gioco non attivo, o tile non valido.
    if (!gameActive || !tileSymbol) return; // eventScreenActive controllato dal chiamante

    // Non attivare eventi complessi generici nei rifugi sicuri (Villaggi, Città, Aree Sosta).
    // Gli eventi specifici del tile (EVENT_DATA) gestiranno gli incontri/opportunità in questi luoghi.
    if (SHELTER_TILES.includes(tileSymbol)) {
         // console.log(`triggerComplexEvent: Non scateno eventi complessi generici in un rifugio sicuro (${tileSymbol}).`); // Log di debug rimosso
         return;
    }

    // Controlla probabilità base che un evento complesso generico accada a questo passo.
    // Questa costante (COMPLEX_EVENT_CHANCE) è definita in game_constants.js.
    if (Math.random() > COMPLEX_EVENT_CHANCE) {
        // console.log("triggerComplexEvent: Nessun evento complesso attivato (fallito check probabilità base)."); // Log di debug rimosso
        return; // La probabilità non si è verificata, nessun evento complesso.
    }


    // --- Selezione del Tipo di Evento Complesso ---
    // Usa la funzione chooseWeighted per selezionare un tipo di evento basato sui pesi definiti.
    // chooseWeighted è definita in game_utils.js
    // COMPLEX_EVENT_TYPE_WEIGHTS è definito in game_constants.js.
    const chosenEventTypeObj = chooseWeighted(Object.keys(COMPLEX_EVENT_TYPE_WEIGHTS).map(type => ({ type: type, weight: COMPLEX_EVENT_TYPE_WEIGHTS[type] })));
    let eventType = chosenEventTypeObj ? chosenEventTypeObj.type : null;

     // Se la selezione fallisce o il tipo è nullo, esci.
     if (!eventType) {
         console.error("triggerComplexEvent: Errore nella selezione del tipo di evento complesso.");
         return;
     }


    // --- Adattamento del Tipo di Evento all'Ambiente e all'Ora ---
    // Alcuni tipi di eventi sono più probabili o esclusivi in determinate condizioni.
    // Questa logica di adattamento era nel game_logic.js originale, la ripristiniamo qui.

    if (isDay) {
        // Eventi di Orrore sono molto meno probabili di giorno
        if (eventType === 'HORROR') {
             // Con una piccola probabilità l'evento Horror di giorno diventa Environmental, altrimenti non succede
             if (Math.random() < 0.5) eventType = 'ENVIRONMENTAL'; else eventType = null;
        }
         // Predatori potrebbero essere meno attivi di giorno? Converti alcuni in Animali.
         if (eventType === 'PREDATOR' && Math.random() < 0.3) { // 30% dei Predatori di giorno diventano Animali
             eventType = 'ANIMAL';
         }

    } else { // È notte
        // Eventi Dilemma Morale sono meno probabili di notte, converti alcuni in Orrore o Predatore.
        if (eventType === 'DILEMMA') {
             if (Math.random() < 0.6) eventType = 'HORROR'; // 60% dei Dilemmi notturni diventano Orrore
             else eventType = 'PREDATOR'; // 40% diventano Predatore
        }
         // Animali potrebbero essere più attivi o diversi di notte? (La logica di generazione descrizioni già gestisce questo)
         // Predatori potrebbero essere più attivi di notte? (La logica di generazione descrizioni già gestisce questo)
    }

     // Se il tipo di evento è diventato nullo dopo l'adattamento, esci.
     if (!eventType) {
         // console.log("triggerComplexEvent: Tipo evento annullato dopo adattamento giorno/notte."); // Log di debug rimosso
         return;
     }


    // --- Costruzione dei Dati dell'Evento Complesso specifici per il tipo ---
    // Crea l'oggetto dati evento completo con titolo, descrizione e scelte dinamiche.
    // Queste funzioni (getRandomPredatorEvent, etc.) sono definite qui sotto.
    let eventData = null;
    let eventTitle = "Evento Complesso"; // Fallback title
    let eventDescription = "È successo qualcosa di insolito..."; // Fallback description
    let eventChoices = []; // Fallback choices
    let context = {}; // Contesto specifico dell'evento (es. tipo animale, tipo pericolo)

    switch(eventType) {
        case 'PREDATOR':
            eventTitle = "Incontro Ostile";
            eventDescription = getRandomText(descrizioniIncontroPredoni); // Usa testi da game_data.js
            eventChoices = [
                { text: "Fuggi", skillCheck: { stat: 'agilita', difficulty: !isDay ? 13 : 12 }, actionKey: 'fuga' }, // Più difficile fuggire di notte
                { text: "Combatti", skillCheck: { stat: 'potenza', difficulty: SHELTER_TILES.includes(tileSymbol) ? 13 : 14 }, actionKey: 'lotta' }, // Forse più facile combattere al chiuso? O più difficile per mancanza spazio? Dipende dal design. Lasciamo 14 default.
                { text: "Prova a parlare", skillCheck: { stat: 'influenza', difficulty: !isDay ? 14 : 13 }, actionKey: 'parla' } // Più difficile parlare di notte?
            ];
            break;
        case 'ANIMAL':
             const animalType = getRandomText(tipiBestie); // Usa testi da game_data.js
             context.animalType = animalType; // Salva il tipo animale nel contesto
             eventTitle = `Bestia Pericolosa: ${animalType}`;
             eventDescription = getRandomText(descrizioniIncontroBestie).replace("{animale}", animalType); // Sostituisce placeholder
             eventChoices = [
                 { text: "Evita silenziosamente", skillCheck: { stat: 'tracce', difficulty: !isDay ? 12 : 11 }, actionKey: 'evita' }, // Più difficile evitare di notte
                 { text: "Attacca la bestia", skillCheck: { stat: 'potenza', difficulty: 13 }, actionKey: 'attacca' }, // Difficoltà fissa per attaccare
                 // { text: "Osserva da lontano", skillCheck: { stat: 'presagio', difficulty: 10 }, actionKey: 'osserva' } // Opzione rimossa nel codice originale
             ];
             break;
        case 'TRACKS':
             eventTitle = "Tracce Strane";
             eventDescription = getRandomText(descrizioniTracce); // Usa testi da game_data.js
             eventChoices = [
                 { text: "Segui le tracce", skillCheck: { stat: 'tracce', difficulty: !isDay ? 11 : 10 }, actionKey: 'segui', isSearchAction: true }, // Search action costa tempo
                 { text: "Ispeziona attentamente", skillCheck: { stat: 'presagio', difficulty: !isDay ? 10 : 9 }, actionKey: 'ispeziona', isSearchAction: true }, // Search action costa tempo
                 { text: "Ignora le tracce", outcome: getRandomText(esitiSeguiTracceOkNulla), actionKey: 'ignora'} // Ignora porta sempre a esito Nulla (usa uno dei testi Nulla)
             ];
             break;
        // VILLAGE_HOSTILE e SHELTER_INSPECT non sono triggerati come eventi complessi generici
        // ma tramite EVENT_DATA sui tile VILLAGE/REST_STOP o azioni specifiche (es. cercare in rifugio)
        /*
        case 'VILLAGE_HOSTILE':
             eventTitle = "Villaggio Ostile";
             eventDescription = getRandomText(descrizioniVillaggioOstile); // Usa testi da game_data.js
             eventChoices = [
                 { text: "Allontanati lentamente", outcome: esitiVillaggioOstileAllontanati, actionKey: 'allontanati' }, // Usa testi da game_data.js
                 { text: "Tenta di negoziare", skillCheck: { stat: 'influenza', difficulty: 12 }, actionKey: 'negozia' } // Usa Influenza
             ];
             break;
         case 'SHELTER_INSPECT':
              eventTitle = "Ispezione Rifugio";
              eventDescription = getRandomText(descrizioniRifugioStrano); // Usa testi da game_data.js
              eventChoices = [
                  { text: "Ispeziona attentamente", skillCheck: { stat: 'tracce', difficulty: 11 }, actionKey: 'ispeziona', isSearchAction: true }, // Search action costa tempo
                  { text: "Lascia perdere", outcome: esitiRifugioLasciaPerdere, actionKey: 'ignora' } // Usa testi da game_data.js
              ];
             break;
        */
        case 'ENVIRONMENTAL':
             eventTitle = "Pericolo Ambientale";
             const isAgilityBased = Math.random() < 0.5; // Sceglie casualmente se il check sarà basato su Agilità o Presagio
             // CORREZIONE: Usa placeholder finché le costanti non sono definite in game_data.js
             const description = isAgilityBased
                ? "Devi reagire in fretta a un pericolo improvviso!" // Placeholder Agilità
                : "Avverti una minaccia imminente nell'ambiente..."; // Placeholder Presagio
             eventDescription = description; // Imposta la descrizione

            // La scelta ha skillCheck 'evita'
            // La logica degli esiti (Evitato/Colpito con danno/status) è gestita in handleEventChoice.
            const choices = [
                {
                     text: isAgilityBased ? "Reagisci rapidamente (Agilità)" : "Percepisci il pericolo (Presagio)",
                     skillCheck: {
                         stat: isAgilityBased ? 'agilita' : 'presagio',
                         difficulty: !isDay ? 13 : 12 // Più difficile reagire/percepire di notte
                     },
                     actionKey: 'evita'
                }
                // Opzione Ignora? Un pericolo ambientale spesso richiede una reazione.
                // Potremmo aggiungere una scelta "Subisci il pericolo" o "Ignora (subendo conseguenze garantite)".
                // Per ora, l'unica opzione è tentare di evitarlo con un check.
            ];
            eventChoices = choices; // Imposta le scelte

            break;
        case 'DILEMMA':
             eventTitle = "Dilemma Morale";
             const dilemmaDescription = "Ti trovi di fronte a una scelta difficile..."; // Placeholder
             eventDescription = dilemmaDescription; // Imposta la descrizione

            // Le scelte hanno skillCheck o outcome diretto.
            // Le difficoltà dei check possono variare giorno/notte.
            const dilemmaChoices = [
                { text: "Indaga e Intervieni (Presagio)", skillCheck: { stat: 'presagio', difficulty: !isDay ? 14 : 13 }, actionKey: 'intervieni' }, // Check Presagio, più difficile di notte
                { text: "Ignora e prosegui", outcome: getRandomText(esitiSeguiTracceOkNulla), actionKey: 'ignora' } // Usa testi 'Nulla' per ora
            ];
            eventChoices = dilemmaChoices; // Imposta le scelte

            break;
        case 'HORROR': // Solo di notte (filtrato sopra)
             eventTitle = "Orrore Indicibile";
             const horrorDescription = getRandomText(descrizioniOrroreIndicibile);
             eventDescription = horrorDescription; // Imposta la descrizione

            // Le scelte hanno skillCheck ('fuga' con Agilità, 'affronta' con Adattamento)
            // Le difficoltà sono alte per questo tipo di evento.
            const horrorChoices = [
                { text: "Fuggi terrorizzato (Agilità)", skillCheck: { stat: 'agilita', difficulty: 14 }, actionKey: 'fuga' }, // Check Agilità (difficile fuggire)
                { text: "Affronta l'orrore (Adattamento)", skillCheck: { stat: 'adattamento', difficulty: 15 }, actionKey: 'affronta' } // Check Adattamento (molto difficile resistere mentalmente)
            ];
            eventChoices = horrorChoices; // Imposta le scelte

            break;
        default:
             console.error(`triggerComplexEvent: Tipo evento complesso '${eventType}' non gestito nella costruzione.`);
             // Fallback a un evento semplice "nulla"
             eventData = {
                 title: "Qualcosa Accade...",
                 description: "Avverti una presenza o un fenomeno insolito, ma svanisce prima che tu possa comprenderlo.",
                 choices: [], // Nessuna scelta
                 isOutcome: true // Trattalo come un risultato semplice (solo bottone Continua)
             };
             break; // Esci dallo switch per usare i dati fallback
    }

    // Se il tipo di evento è stato gestito (cioè non è andato nel fallback default)
    if (eventType !== null && eventData === null) { // eventData è null solo se non è andato nel fallback default
        // Costruisci l'oggetto eventData combinando titolo, descrizione, scelte e contesto.
        // Il contesto è utile per handleEventChoice per accedere a dettagli specifici (es. tipo animale).
        eventData = {
            type: eventType, // Aggiunge il tipo per la logica esito in handleEventChoice
            title: eventTitle,
            description: eventDescription,
            choices: eventChoices,
            isOutcome: false, // Non è un popup di risultato iniziale
            context: context // CORRETTO: usa la variabile 'context' definita nello scope
        };
        // console.log(`triggerComplexEvent: Costruito evento di tipo '${eventType}'.`); // Log di debug
    }

    // Mostra il popup evento utilizzando la funzione UI.
    // showEventPopup imposta eventScreenActive = true e gamePaused = true.
    if (eventData && typeof showEventPopup === 'function') {
         showEventPopup(eventData);
    } else if (eventData) { // eventData esiste ma showEventPopup no
         console.error("triggerComplexEvent: showEventPopup non disponibile in ui.js!");
         addMessage("Errore interno nel sistema eventi.", "danger");
    }

    // console.log("triggerComplexEvent: Fine esecuzione."); // Log di debug
}


// --- Funzioni di Gestione Popup Eventi (Interazione Utente) ---

/**
 * Gestisce la scelta del giocatore in un evento.
 * Chiamato quando l'utente clicca un bottone scelta nel popup evento (handleChoiceContainerClick)
 * o preme un tasto numerico corrispondente (handleEventKeyPress).
 * Dipende da: game_constants.js (player, currentEventChoices, currentEventContext, ...costanti status/probabilità/danni/loot),
 * game_data.js (ITEM_DATA, loreFragments, ...descrizioni esiti), game_utils.js (performSkillCheck, addMessage, getRandomText, getRandomInt, chooseWeighted),
 * ui.js (renderStats, renderInventory, buildAndShowComplexEventOutcome), player.js (addItemToInventory, removeItemFromInventory, checkAmmoAvailability, consumeAmmo, checkRepairMaterials, applyRepair),
 * map.js (transitionToDay), game_core.js (endGame).
 * @param {number} choiceIndex - L'indice (0-based) della scelta selezionata dall'utente.
 */
function handleEventChoice(choiceIndex) {
    // console.log('handleEventChoice: Ricevuto choiceIndex:', choiceIndex); // RIMOSSO
    // console.log(`handleEventChoice: Gestione scelta indice ${choiceIndex}.`); // Log di debug originale

    // Verifica che il contesto dell'evento e la scelta selezionata siano validi.
    // currentEventContext e currentEventChoices sono popolati da showEventPopup.
    if (!currentEventContext || !Array.isArray(currentEventChoices) || choiceIndex < 0 || choiceIndex >= currentEventChoices.length) {
        console.error(`handleEventChoice chiamato con dati evento/scelta non validi. Indice: ${choiceIndex}, Scelte:`, currentEventChoices, "Contesto:", currentEventContext);
        addMessage("Errore nell'elaborazione della scelta dell'evento.", "danger");
        if (typeof closeEventPopup === 'function') closeEventPopup(); // Chiude il popup in caso di errore
        return;
    }

    // Ottieni la scelta selezionata e i dati dell'evento dal contesto
    const choice = currentEventChoices[choiceIndex];
    // console.log('handleEventChoice: Oggetto choice recuperato:', choice); // RIMOSSO
    const eventType = currentEventContext.type; // Tipo dell'evento (complesso o specifico del tile, es. 'PREDATOR' o 'VILLAGE')
    const isSearchAction = choice.isSearchAction || false; // Flag se l'azione costa tempo
    const actionKey = choice.actionKey; // Chiave azione (fuga, lotta, segui, ispeziona, etc.)

    // --- Ottieni il simbolo del tile corrente ---
    const currentTileSymbol = map[player.y]?.[player.x]?.type;
    if (!currentTileSymbol) {
        console.error("handleEventChoice: Impossibile ottenere currentTileSymbol!");
        // Gestione errore: potremmo usare un fallback o uscire, per ora logghiamo
        // addMessage("Errore: Impossibile determinare la posizione attuale.", "danger");
        // if (typeof closeEventPopup === 'function') closeEventPopup();
        // return;
    }

    // Applica costo in tempo per le azioni di ricerca (isSearchAction)
    // ... (codice costo tempo invariato) ...


    // --- LOGICA DI RISOLUZIONE: Check Abilità o Esito Diretto ---

    let outcomeTitle = "Risultato"; // Titolo del popup di esito
    let outcomeDescription = ""; // Descrizione testuale dell'esito
    let outcomeCheckDetails = null; // Dettagli del tiro abilità per il log/popup
    let outcomeConsequencesText = ""; // Testo delle conseguenze meccaniche per il popup di esito
    let messageType = 'info'; // Tipo di messaggio per il log e lo stile del popup esito

    // console.log('handleEventChoice: Controllo if (choice.outcome)...'); // RIMOSSO
    // Se la scelta ha un esito diretto predefinito (outcome)
    if (choice.outcome) {
        // console.log('handleEventChoice: Entrato nel blocco if (choice.outcome)'); // RIMOSSO
        outcomeDescription = choice.outcome;
        // Verifica se c'è una ricompensa associata anche all'outcome diretto
        if (choice.successReward) {
             const rewardFeedback = applyChoiceReward(choice.successReward);
             if (rewardFeedback) outcomeConsequencesText += rewardFeedback;
        }

        // Logga il messaggio di esito completo al log di gioco.
        addMessage(outcomeDescription + (outcomeConsequencesText ? `\n${outcomeConsequencesText}` : ''), messageType, true);

        // Mostra il popup di risultato con l'esito diretto
        // console.log('handleEventChoice: Chiamando buildAndShowComplexEventOutcome con:', outcomeTitle, outcomeDescription, messageType); // RIMOSSO
        buildAndShowComplexEventOutcome(outcomeTitle, outcomeDescription + (outcomeConsequencesText ? `<br>${outcomeConsequencesText}` : ''), null, null, messageType);

    }
    // Se la scelta richiede un check di abilità
    else if (choice.skillCheck) {
        // ... (Codice verifica skillCheck con controlli esistenza - invariato) ...

        // Esegui il check di abilità solo se i dati sono validi
        const checkResult = performSkillCheck(choice.skillCheck.stat, choice.skillCheck.difficulty);
        outcomeCheckDetails = checkResult.text; // Stringa descrittiva del tiro


        // --- Gestione Esito Check (Successo o Fallimento) ---
        if (checkResult.success) {
            // --- Successo del Check ---
            outcomeTitle = "Successo!";
            messageType = 'success';

            // Controlla esistenza successText prima di usarlo
            outcomeDescription = choice.successText || "Hai avuto successo!";

            // Controlla esistenza successReward prima di usarlo
            if (choice.successReward) {
                const rewardFeedback = applyChoiceReward(choice.successReward);
                 if (rewardFeedback) outcomeConsequencesText += rewardFeedback;
            }

            // Logica specifica per il successo di alcuni EVENTI COMPLESSI (basata sull'actionKey)
            switch (eventType) {
                 case 'PREDATOR':
                      if (actionKey === 'lotta') {
                          // Logica Danno Giocatore Inflitto (con arma equipaggiata) su Successo Lotta.
                          // Passa currentTileSymbol
                          let playerDamageDescription = describeWeaponDamage(player.equippedWeapon, currentTileSymbol);
                          if (playerDamageDescription) outcomeConsequencesText += `\\n${playerDamageDescription}`;

                          // ... (logica loot predatore successo invariata) ...
                      }
                      // Successo Fuga/Parla già gestito da outcomeDescription e successReward nell'oggetto choice
                     break;

                case 'ANIMAL':
                     if (actionKey === 'attacca') { // Successo Attacca Animale
                          // Logica Danno Giocatore Inflitto (uguale a Lotta Predoni successo)
                          // Passa currentTileSymbol
                           let playerDamageDescription = describeWeaponDamage(player.equippedWeapon, currentTileSymbol);
                           if (playerDamageDescription) outcomeConsequencesText += `\\n${playerDamageDescription}`;

                          // ... (logica loot carne successo invariata) ...
                     }
                     // Successo Evita già gestito da outcomeDescription e successReward nell'oggetto choice
                    break;

                // ... (Altri casi switch successo invariati, non usano applyDamage o describeWeaponDamage) ...

                default: // Questo default cattura i check successo degli eventi specifici del tile
                    // ... (codice default successo invariato) ...
                    // Qui possiamo aggiungere logica specifica per actionKey di eventi TILE
                    break;
            }

            // --- NUOVA LOGICA SPECIFICA PER AZIONE 'explore_shelter' (Successo) ---
            if (actionKey === 'explore_shelter') {
                 // Verifica dipendenze necessarie per questa logica specifica
                if (typeof SHELTER_INSPECT_LOOT_CHANCE === 'undefined' || typeof SHELTER_INSPECT_LORE_CHANCE === 'undefined' || typeof SHELTER_INSPECT_LOOT_WEIGHTS === 'undefined' || typeof chooseWeighted !== 'function' || typeof applyChoiceReward !== 'function') {
                    console.error("handleEventChoice (explore_shelter success): Dipendenze mancanti (costanti/funzioni)!");
                    outcomeDescription = "Errore nell'esplorazione del rifugio.";
                    messageType = 'danger';
                } else {
                    const exploreRoll = Math.random();

                    if (exploreRoll < SHELTER_INSPECT_LOOT_CHANCE) { // Es. 0.50
                        // Esito: Loot
                        outcomeDescription = "Esplorando attentamente, trovi qualcosa di utile!";
                        messageType = 'success';
                        // Prepara tabella loot e scegli
                        const lootTable = Object.keys(SHELTER_INSPECT_LOOT_WEIGHTS).map(id => ({ id: id, weight: SHELTER_INSPECT_LOOT_WEIGHTS[id] }));
                        if (lootTable.length > 0) {
                            const chosenLoot = chooseWeighted(lootTable);
                            if (chosenLoot && chosenLoot.id) {
                                // Applica la ricompensa e aggiungi feedback
                                const rewardFeedback = applyChoiceReward({ itemId: chosenLoot.id, quantity: 1 });
                                if (rewardFeedback) outcomeConsequencesText += rewardFeedback;
                            } else {
                                console.warn("handleEventChoice (explore_shelter success): chooseWeighted non ha restituito loot valido.");
                                outcomeConsequencesText += "<br>(Ricerca infruttuosa...)";
                                messageType = 'info';
                            }
                        } else {
                            console.warn("handleEventChoice (explore_shelter success): SHELTER_INSPECT_LOOT_WEIGHTS è vuota.");
                             outcomeConsequencesText += "<br>(Nessun loot definibile...)";
                             messageType = 'info';
                        }

                    } else if (exploreRoll < SHELTER_INSPECT_LOOT_CHANCE + SHELTER_INSPECT_LORE_CHANCE) { // Es. 0.50 + 0.30 = 0.80
                        // Esito: Lore
                        outcomeDescription = "Tra la polvere, scopri un indizio sul passato...";
                        messageType = 'lore';
                        // Prova a dare un frammento di lore
                        const loreRewardFeedback = applyChoiceReward({ itemId: 'lore_fragment_item', quantity: 1 });
                         if (loreRewardFeedback) {
                             outcomeConsequencesText += "<br>Hai trovato un frammento di lore.";
                             // Nota: applyChoiceReward con 'lore_fragment_item' potrebbe non dare feedback testuale diretto,
                             // il messaggio qui sopra serve a confermare al giocatore.
                         } else {
                             // Se applyChoiceReward fallisce per lore (es. inventario pieno o item non valido),
                             // consideralo come 'Nulla'.
                             outcomeDescription = "Il rifugio è stato rovistato a fondo. Non trovi nulla di interessante o utile.";
                             messageType = 'info';
                         }
                    } else {
                        // Esito: Nulla
                        outcomeDescription = "Il rifugio è stato rovistato a fondo. Non trovi nulla di interessante o utile.";
                        messageType = 'info';
                        // outcomeConsequencesText rimane vuoto
                    }
                } // Fine else (dipendenze OK)
            } // Fine if actionKey === 'explore_shelter'
            // --- FINE NUOVA LOGICA ---


        } else {
            // --- Fallimento del Check ---
            outcomeTitle = "Fallimento";
            messageType = 'warning'; // Default warning per fallimento check

            // Controlla esistenza failureText prima di usarlo
            outcomeDescription = choice.failureText || "Hai fallito.";

            // Controlla esistenza failurePenalty prima di usarlo
            if (choice.failurePenalty) {
                 const penaltyFeedback = applyPenalty(choice.failurePenalty);
                 if (penaltyFeedback) {
                     // Usa <br> invece di \n
                     outcomeConsequencesText += `<br>${penaltyFeedback}`;
                 }
            }


            // Logica specifica per il fallimento di alcuni EVENTI COMPLESSI (basata sull'actionKey)
            switch (eventType) {
                case 'PREDATOR':
                     if (actionKey === 'fuga') {
                         outcomeDescription = getRandomText(esitiFugaPredoniKo);
                         if (!choice.failurePenalty) {
                             const baseDamage = getRandomInt(PREDATOR_FLEE_FAIL_DAMAGE_MIN, PREDATOR_FLEE_FAIL_DAMAGE_MAX);
                             const damageFeedback = applyPenalty({ type: 'damage', amount: baseDamage });
                             // Usa <br> invece di \n
                             outcomeConsequencesText += `<br>Non riesci a fuggire!${damageFeedback}.`;
                             if(Math.random() < 0.3) {
                                const resourceLoss = Math.random() < 0.5 ? 'food' : 'water';
                                const lossAmount = 1;
                                 if (player[resourceLoss] >= lossAmount) {
                                     player[resourceLoss] -= lossAmount;
                                     // Usa <br> invece di \n
                                     outcomeConsequencesText += `<br>Nella fuga perdi ${lossAmount} unità di ${resourceLoss === 'food' ? 'cibo' : 'acqua'}.`;
                                      if (typeof renderStats === 'function') renderStats();
                                 }
                             }
                         }
                         messageType = 'danger';
                     } else if (actionKey === 'lotta') {
                         outcomeDescription = "Sei sopraffatto dai predoni."; // Placeholder
                          if (!choice.failurePenalty) {
                              const baseDamage = getRandomInt(PREDATOR_FIGHT_FAIL_DAMAGE_MIN, PREDATOR_FIGHT_FAIL_DAMAGE_MAX);
                              const damageFeedback = applyPenalty({ type: 'damage', amount: baseDamage });
                              // Usa <br> invece di \n
                              outcomeConsequencesText += `<br>Sei sopraffatto!${damageFeedback}.`;
                              const resourceLossFood = getRandomInt(0, Math.min(Math.floor(player.food), 2));
                              const resourceLossWater = getRandomInt(0, Math.min(Math.floor(player.water), 2));
                              if (resourceLossFood > 0) {
                                  player.food -= resourceLossFood;
                                  // Usa <br> invece di \n
                                  outcomeConsequencesText += `<br>Ti rubano ${resourceLossFood} unità di cibo.`;
                              }
                               if (resourceLossWater > 0) {
                                   player.water -= resourceLossWater;
                                   // Usa <br> invece di \n
                                   outcomeConsequencesText += `<br>Ti rubano ${resourceLossWater} unità di acqua.`;
                               }
                              if (resourceLossFood > 0 || resourceLossWater > 0) {
                                   if (typeof renderStats === 'function') renderStats();
                                   if (typeof renderInventory === 'function') renderInventory();
                              }
                         }
                         messageType = 'danger';
                    } else if (actionKey === 'parla') {
                         outcomeDescription = getRandomText(esitiParlaPredoniKo);
                         // Usa <br> invece di \n
                         outcomeConsequencesText += "<br>Le tue parole non hanno effetto, si preparano ad attaccare!";
                          if (!choice.failurePenalty) {
                              const baseDamage = getRandomInt(PREDATOR_TALK_FAIL_DAMAGE_MIN, PREDATOR_TALK_FAIL_DAMAGE_MAX);
                              const damageFeedback = applyPenalty({ type: 'damage', amount: baseDamage });
                              // Usa <br> invece di \n
                              outcomeConsequencesText += `<br>Ti colpiscono mentre cerchi di parlare${damageFeedback}.`;
                              if (Math.random() < 0.25) {
                                  const resourceLoss = Math.random() < 0.5 ? 'food' : 'water';
                                  const lossAmount = 1;
                                   if (player[resourceLoss] >= lossAmount) {
                                       player[resourceLoss] -= lossAmount;
                                       // Usa <br> invece di \n
                                       outcomeConsequencesText += `<br>Nella confusione ti cade ${lossAmount} unità di ${resourceLoss === 'food' ? 'cibo' : 'acqua'}.`;
                                        if (typeof renderStats === 'function') renderStats();
                                   }
                              }
                         }
                         messageType = 'warning';
                    }
                    break;

                case 'ANIMAL':
                     if (actionKey === 'evita') {
                         outcomeDescription = getRandomText(esitiEvitaAnimaleKo);
                          if (!choice.failurePenalty) {
                             const baseDamage = getRandomInt(ANIMAL_EVADE_FAIL_DAMAGE_MIN, ANIMAL_EVADE_FAIL_DAMAGE_MAX);
                             const damageFeedback = applyPenalty({ type: 'damage', amount: baseDamage });
                             // Usa <br> invece di \n
                             outcomeConsequencesText += `<br>L'animale ti scopre e ti attacca!${damageFeedback}.`;
                         }
                         messageType = 'warning';
                     } else if (actionKey === 'attacca') {
                          outcomeDescription = getRandomText(esitiAttaccoAnimaleKo);
                          if (!choice.failurePenalty) {
                             const baseDamage = getRandomInt(ANIMAL_ATTACK_FAIL_DAMAGE_MIN, ANIMAL_ATTACK_FAIL_DAMAGE_MAX);
                             const damageFeedback = applyPenalty({ type: 'damage', amount: baseDamage });
                             // Usa <br> invece di \n
                             outcomeConsequencesText += `<br>L'animale si difende ferocemente!${damageFeedback}.`;
                         }
                         messageType = 'danger';
                     }
                    break;

                case 'TRACKS':
                     if (actionKey === 'segui' || actionKey === 'ispeziona') {
                         outcomeDescription = getRandomText(descrizioniTracceNothing);
                         // Usa <br> invece di \n
                         outcomeConsequencesText += "<br>Perdi tempo prezioso seguendo tracce sbagliate o confondendoti.";
                         messageType = 'info';
                     }
                    break;

                case 'ENVIRONMENTAL':
                    outcomeDescription = getRandomText(esitiPericoloAmbientaleColpito);
                      if (!choice.failurePenalty) {
                         const baseDamage = getRandomInt(ENVIRONMENTAL_FAIL_DAMAGE_MIN, ENVIRONMENTAL_FAIL_DAMAGE_MAX);
                         const damageFeedback = applyPenalty({ type: 'damage', amount: baseDamage });
                         // Usa <br> invece di \n
                         outcomeConsequencesText += `<br>Sei colpito dal pericolo ambientale!${damageFeedback}.`;
                          const extraEffectChance = ENVIRONMENTAL_SICKNESS_CHANCE;
                          if (Math.random() < extraEffectChance) {
                              const statusFeedback = applyPenalty({ type: 'status', status: 'isSick' });
                              // Usa <br> invece di \n (già presente in statusFeedback? No, lo aggiungiamo qui)
                              outcomeConsequencesText += `<br>${statusFeedback}`; 
                              if (typeof renderStats === 'function') renderStats();
                          }
                      }
                     messageType = 'danger';
                    break;

                case 'DILEMMA':
                     outcomeDescription = getRandomText(esitiDilemmaMoraleIndagaKo);
                     // Usa <br> invece di \n
                     outcomeConsequencesText += "<br>Il tuo tentativo di intervento fallisce!";
                      if (!choice.failurePenalty) {
                          const baseDamage = getRandomInt(DILEMMA_INTERVENE_FAIL_DAMAGE_MIN, DILEMMA_INTERVENE_FAIL_DAMAGE_MAX);
                          const damageFeedback = applyPenalty({ type: 'damage', amount: baseDamage });
                          // Usa <br> invece di \n (già presente in damageFeedback? No, lo aggiungiamo qui)
                          outcomeConsequencesText += `<br>${damageFeedback}`;
                      }
                     messageType = 'danger';
                    break;

                case 'HORROR':
                     if (actionKey === 'fuga') {
                         outcomeDescription = getRandomText(esitiOrroreIndicibileFugaKo);
                          if (!choice.failurePenalty) {
                              const baseDamage = getRandomInt(HORROR_FLEE_FAIL_DAMAGE_MIN, HORROR_FLEE_FAIL_DAMAGE_MAX);
                              const damageFeedback = applyPenalty({ type: 'damage', amount: baseDamage, isMentalHorror: true });
                              // Usa <br> invece di \n
                              outcomeConsequencesText += `<br>L'orrore ti raggiunge! Subisci danni (fisici/mentali)${damageFeedback}.`;
                          }
                         messageType = 'danger';
                     } else if (actionKey === 'affronta') {
                          outcomeDescription = getRandomText(esitiOrroreIndicibileAffrontaKo);
                          if (!choice.failurePenalty) {
                              const baseDamage = getRandomInt(HORROR_AFFRONT_FAIL_DAMAGE_MIN, HORROR_AFFRONT_FAIL_DAMAGE_MAX);
                              const damageFeedback = applyPenalty({ type: 'damage', amount: baseDamage, isMentalHorror: true });
                              // Usa <br> invece di \n
                              outcomeConsequencesText += `<br>L'orrore ti sopraffà! Subisci danni devastanti${damageFeedback}.`;
                               if (!player.isSick) {
                                  const statusFeedback = applyPenalty({ type: 'status', status: 'isSick' });
                                  // Usa <br> invece di \n (già presente in statusFeedback? No)
                                  outcomeConsequencesText += `<br>${statusFeedback}`;
                                  if (typeof renderStats === 'function') renderStats();
                                  addMessage("La tua mente vacilla. Sei stato segnato dall'indicibile!", 'danger', true);
                               }
                          }
                         messageType = 'danger';
                     }
                    break;

                 case 'SHELTER_INSPECT':
                      const failRoll = Math.random();
                      let inspectFailOutcomeType = 'nothing';
                       if (failRoll < 0.5) { 
                           inspectFailOutcomeType = 'trap';
                       }
                      switch(inspectFailOutcomeType) {
                          case 'trap':
                              outcomeDescription = getRandomText(esitiRifugioIspezionaKoTrappola);
                               if (!choice.failurePenalty) {
                                   const baseDamage = getRandomInt(SHELTER_INSPECT_TRAP_DAMAGE_MIN, SHELTER_INSPECT_TRAP_DAMAGE_MAX);
                                   const damageFeedback = applyPenalty({ type: 'damage', amount: baseDamage });
                                   // Usa <br> invece di \n
                                   outcomeConsequencesText += `<br>Era una trappola!${damageFeedback}.`;
                                   const sickChance = SHELTER_INSPECT_TRAP_SICKNESS_CHANCE;
                                   if (Math.random() < sickChance) {
                                       const statusFeedback = applyPenalty({ type: 'status', status: 'isSick' });
                                       // Usa <br> invece di \n (già presente in statusFeedback? No)
                                       outcomeConsequencesText += `<br>${statusFeedback}`;
                                       if (typeof renderStats === 'function') renderStats();
                                   }
                               }
                              messageType = 'danger';
                              break;
                          case 'nothing':
                          default:
                              outcomeDescription = getRandomText(esitiRifugioIspezionaKoNulla);
                               // Usa <br> invece di \n
                               outcomeConsequencesText += "<br>L'ispezione non rivela nulla, né di buono né di cattivo.";
                              messageType = 'info';
                              break;
                      }
                     break;
                default:
                    break;
            }

             // Check morte dopo l'applicazione delle penalità
             if (player.hp <= 0) {
                 // endGame è già chiamata dentro applyPenalty se il danno porta a morte.
                 return; // Esci per evitare ulteriori elaborazioni
             }

        } // Fine gestione esito check successo/fallimento

        // --- Preparazione e Visualizzazione Popup di Esito ---
        // Nota: addMessage ora gestisce \n -> <br>, ma qui lo facciamo esplicitamente per il popup
        let cleanOutcomeDesc = (outcomeDescription || "").replace(/\n/g, '<br>');
        // RIMOSSO: Non serve più pulire outcomeConsequencesText, contiene già <br>
        // let cleanConsequences = (outcomeConsequencesText || "").replace(/\n/g, '<br>');

        // Costruisci il testo completo per il popup di esito usando <br>
        let finalOutcomeText = cleanOutcomeDesc; // Parte principale
        if (outcomeCheckDetails && outcomeCheckDetails.text) {
            if (finalOutcomeText) finalOutcomeText += `<br>`;
            finalOutcomeText += `(${outcomeCheckDetails.text})`; 
        }
        if (outcomeConsequencesText) { // Usa direttamente outcomeConsequencesText
            if (finalOutcomeText) finalOutcomeText += `<br>`;
            finalOutcomeText += outcomeConsequencesText; // Aggiungi conseguenze con <br>
        }

        // Logga il messaggio di esito completo al log di gioco.
         addMessage(`${outcomeTitle}. ${finalOutcomeText}`, messageType, true);

        // Mostra il popup di risultato dell'evento complesso
        // Rimosso log diagnostico DOM
        // if (!checkResult.success) {
        //     console.log("handleEventChoice: Stato DOM PRIMA di chiamare buildAndShowComplexEventOutcome (check fallito):", DOM);
        // }
        buildAndShowComplexEventOutcome(outcomeTitle, finalOutcomeText, null, null, messageType);

    } // Fine gestione IF skillCheck
    // Else (scelta senza check e senza outcome valido): Gestione errore o log
     else {
         // Gestione errore o log se la scelta non ha né outcome né skillCheck validi
         console.error(`handleEventChoice: Scelta ${choiceIndex} per evento ${eventType} non ha né outcome né skillCheck validi.`, choice);
         addMessage(`Errore nella gestione dell'esito della scelta: ${choice.text}`, "danger");
         // Chiudi comunque il popup per evitare blocchi
         if (typeof closeEventPopup === 'function') closeEventPopup();
     }

}


// --- Implementazione check & log status messages ---


// --- Funzione helper interna per descrivere il danno inflitto con l'arma ---
/**
 * Calcola il danno base inflitto dal giocatore con l'arma equipaggiata e genera un messaggio descrittivo.
 * Applica bonus danno basati sul tipo di arma/ambiente/stats.
 * Consuma munizioni e riduce durabilità dell'arma.
 * @param {string|null} equippedWeaponId - L'ID dell'arma equipaggiata.
 * @param {string|null} currentTileSymbol - Il simbolo del tile corrente (può essere null se errore posizione).
 * @returns {string} Un messaggio descrittivo del danno inflitto e dello stato dell'arma/munizioni.
 */
function describeWeaponDamage(equippedWeaponId, currentTileSymbol) { // Accetta currentTileSymbol
    let playerDamage = 1; // Danno base a mani nude
    let weaponName = "mani nude";
    let weaponDescription = "";
    let durabilityMessage = "";
    let ammoMessage = "";

    if (equippedWeaponId && ITEM_DATA[equippedWeaponId]) {
        const weaponData = ITEM_DATA[equippedWeaponId];
        weaponName = weaponData.name;

        // Verifica se l'arma è rotta (durabilità <= 0)
        if (weaponData.durability !== undefined && weaponData.durability <= 0) {
            playerDamage = 1; // Arma rotta infligge solo danno base
            weaponDescription = " (ROTTA)";
            durabilityMessage = " La tua arma è completamente danneggiata e quasi inutile.";
        } else {
            // Arma funzionante - Danno base dell'arma
            playerDamage = weaponData.damage || 1;

            // Gestione Armi a Distanza (Munizioni e Consumo)
            let hasAmmo = true;
            if (['fuoco', 'balestra', 'arco'].includes(weaponData.weaponType) && weaponData.ammoType) {
                // Check munizioni
                if (typeof checkAmmoAvailability === 'function') {
                    hasAmmo = checkAmmoAvailability().hasAmmo;
                } else { console.warn("describeWeaponDamage: checkAmmoAvailability non disponibile."); }

                if (!hasAmmo) {
                    playerDamage = 1; // Danno base se senza munizioni
                    weaponDescription += ` (Sei senza ${ITEM_DATA[weaponData.ammoType]?.name || weaponData.ammoType}!)`;
                } else {
                    // Consuma una munizione
                    if (typeof consumeAmmo === 'function') {
                        const consumeResult = consumeAmmo();
                        if (consumeResult.consumed) ammoMessage += ` Hai usato una munizione.`;
                        if (consumeResult.recovered) ammoMessage += ` Sei riuscito a recuperare una munizione!`;
                    } else { console.warn("describeWeaponDamage: consumeAmmo non disponibile."); }
                }
            }

            // Applica bonus al danno
            let bonusDamage = 0;
            switch(weaponData.weaponType) {
                 // ... (casi switch bonus invariati) ...
                 case 'bianca_lunga': // Bonus in spazi aperti
                     // Usa currentTileSymbol passato come argomento
                     if (currentTileSymbol && (currentTileSymbol === TILE_SYMBOLS.PLAINS || currentTileSymbol === TILE_SYMBOLS.FOREST)) {
                         bonusDamage += 1; weaponDescription += " (Vantaggio di portata)";
                     }
                     break;
                 // ... (altri casi switch bonus invariati) ...
            }
            playerDamage += bonusDamage; // Applica bonus

            // Riduci la durabilità dell'arma dopo l'uso
            if (weaponData.durability !== undefined && weaponData.maxDurability !== undefined) {
                 // ... (logica riduzione durabilità invariata) ...
            }

        } // Fine if arma funzionante
    } // Fine if equippedWeaponId

    // Costruisci il messaggio finale
    let message = `Infliggi ${playerDamage} danni con ${weaponName}${weaponDescription}.`;
    if (durabilityMessage) message += durabilityMessage;
    if (ammoMessage) message += ammoMessage;

    return message;
}


// --- FINE LOGICA EVENTI ---

// --- DEFINIZIONI FUNZIONI HELPER RIPRISTINATE ---

/**
 * Applica la ricompensa definita in un oggetto choice.
 * Gestisce l'aggiunta di oggetti specifici, oggetti casuali, o altri tipi di ricompense.
 * Dipende da: player.js (addItemToInventory), game_data.js (ITEM_DATA), game_utils.js (getRandomText, chooseWeighted, getRandomInt), game_constants.js (COMMON_RESOURCES_POOL).
 * @param {object} rewardData - L'oggetto reward definito nella scelta (es. { itemId: 'canned_food', quantity: 1 } o { type: 'random_common_resource', quantity: 1 }).
 * @returns {string|null} Una stringa di feedback testuale sulla ricompensa ottenuta, o null se la ricompensa non è valida/gestita.
 */
function applyChoiceReward(rewardData) {
    if (!rewardData) return null;

    let feedback = "";
    let itemAdded = false;

    // Caso 1: Ricompensa è un oggetto specifico
    if (rewardData.itemId) {
        const quantity = rewardData.quantity || 1;
        const itemInfo = ITEM_DATA[rewardData.itemId];
        if (itemInfo) {
            addItemToInventory(rewardData.itemId, quantity); // addItemToInventory logga il messaggio
            feedback = `\nHai ottenuto: ${quantity} x ${itemInfo.name}!`;
            itemAdded = true;
        } else {
            console.warn(`applyChoiceReward: itemId '${rewardData.itemId}' non trovato in ITEM_DATA.`);
            feedback = "\n(Ricompensa oggetto non valida)";
        }
    }
    // Caso 2: Ricompensa è di un tipo specifico (es. risorsa casuale)
    else if (rewardData.type) {
        const quantity = rewardData.quantity || 1;
        switch (rewardData.type) {
            case 'random_common_resource':
                 // Sceglie una risorsa casuale dalla pool definita in game_constants.js
                 if (Array.isArray(COMMON_RESOURCES_POOL) && COMMON_RESOURCES_POOL.length > 0) {
                     const randomItemId = getRandomText(COMMON_RESOURCES_POOL); // Sceglie un ID casuale
                     const itemInfo = ITEM_DATA[randomItemId];
                     if (itemInfo) {
                          addItemToInventory(randomItemId, quantity);
                          feedback = `\nHai trovato qualcosa di utile: ${quantity} x ${itemInfo.name}!`;
                          itemAdded = true;
                     } else {
                          console.warn(`applyChoiceReward: random_common_resource ha scelto itemId '${randomItemId}' non valido.`);
                          feedback = "\n(Ricompensa risorsa casuale non valida)";
                     }
                 } else {
                      console.warn("applyChoiceReward: COMMON_RESOURCES_POOL non definito o vuoto in game_constants.js.");
                      feedback = "\n(Impossibile generare risorsa casuale)";
                 }
                break;
            // Aggiungere altri tipi di ricompense (es. 'stat_bonus') qui se necessario
            /*
            case 'stat_bonus':
                if (rewardData.stat && typeof player[rewardData.stat] !== 'undefined') {
                    player[rewardData.stat] += quantity;
                    feedback = `\nLa tua statistica ${rewardData.stat} è aumentata di ${quantity}!`;
                    // Aggiorna UI Stats
                    if (typeof renderStats === 'function') renderStats();
                } else {
                    feedback = "\n(Ricompensa statistica non valida)";
                }
                break;
            */
            default:
                console.warn(`applyChoiceReward: Tipo di ricompensa sconosciuto '${rewardData.type}'.`);
                feedback = "\n(Tipo ricompensa non gestito)";
                break;
        }
    }
    // Caso 3: Nessun itemId o type valido
    else {
         console.warn("applyChoiceReward: Oggetto ricompensa non valido:", rewardData);
         feedback = "\n(Definizione ricompensa non valida)";
    }

    // Aggiorna l'inventario nella UI se un oggetto è stato aggiunto
    if (itemAdded && typeof renderInventory === 'function') {
        renderInventory();
    }

    return feedback.trim() || null; // Ritorna il feedback o null
}

/**
 * Applica una penalità definita in un oggetto choice (solitamente su fallimento).
 * Gestisce danni (con riduzione armatura), perdita risorse, applicazione status, perdita durabilità.
 * Dipende da: game_constants.js (player, ITEM_DATA, ARMOR_DAMAGE_REDUCTION_FACTOR, ARMOR_HORROR_REDUCTION_FACTOR),
 * game_utils.js (getRandomInt, addMessage), ui.js (renderStats), game_core.js (endGame).
 * @param {object} penaltyObject - L'oggetto penalty (es. { type: 'damage', amount: 5, isMentalHorror: false }, { type: 'status', status: 'isInjured' }).
 * @returns {string} Una stringa di feedback testuale sulla penalità subita.
 */
function applyPenalty(penaltyObject) {
    if (!penaltyObject || !penaltyObject.type) {
        console.warn("applyPenalty chiamato con oggetto penalità non valido.");
        return "(Errore nell'applicazione della penalità)";
    }

    let feedback = "";
    let messageType = 'warning'; // Default per penalità

    switch (penaltyObject.type) {
        case 'damage':
            let baseDamage = 0;
            // Calcola danno base (fisso o range)
            if (typeof penaltyObject.amount === 'number') {
                baseDamage = penaltyObject.amount;
            } else if (typeof penaltyObject.amount === 'object' && penaltyObject.amount.min !== undefined && penaltyObject.amount.max !== undefined) {
                baseDamage = getRandomInt(penaltyObject.amount.min, penaltyObject.amount.max);
            } else {
                console.warn("applyPenalty: Danno specificato non valido", penaltyObject.amount);
                return "(Errore nel calcolo del danno)";
            }

            let damageReduction = 0;
            let finalDamage = baseDamage;
            const isMentalHorror = penaltyObject.isMentalHorror || false;

            // Calcola riduzione armatura
            if (player.equippedArmor && ITEM_DATA[player.equippedArmor]) {
                const armorInfo = ITEM_DATA[player.equippedArmor];
                if (armorInfo.armorValue && armorInfo.armorValue > 0) {
                    const reductionFactor = isMentalHorror ? ARMOR_HORROR_REDUCTION_FACTOR : ARMOR_DAMAGE_REDUCTION_FACTOR;
                    damageReduction = Math.round(armorInfo.armorValue * reductionFactor); // Arrotonda la riduzione
                    finalDamage = Math.max(0, baseDamage - damageReduction); // Danno minimo 0
                }
            }

            const oldHp = player.hp;
            player.hp = Math.max(0, player.hp - finalDamage);
            const actualDamageTaken = Math.floor(oldHp - player.hp); // Danno effettivo subito (intero)

            feedback = `Subisci ${actualDamageTaken} danni`;
            if (damageReduction > 0) {
                feedback += ` (ridotti di ${damageReduction} dall'armatura)`;
            }
            feedback += ".";
            messageType = 'danger'; // Danno è sempre 'danger'

            // Check morte
            if (player.hp <= 0) {
                 feedback += " Sei morto...";
                 if (typeof endGame === 'function') endGame(false);
                 // Non aggiornare UI stats se morto, endGame gestisce la schermata finale.
            } else {
                 if (typeof renderStats === 'function') renderStats(); // Aggiorna UI se non morto
            }
            break;

        case 'status':
            const statusKey = penaltyObject.status;
            if (statusKey && typeof player[statusKey] === 'boolean' && !player[statusKey]) {
                player[statusKey] = true;
                let statusName = "uno stato alterato";
                if (statusKey === 'isInjured') statusName = "Ferito";
                else if (statusKey === 'isSick') statusName = "Infetto";
                else if (statusKey === 'isPoisoned') statusName = "Avvelenato";
                feedback = `Hai contratto lo stato: ${statusName}!`;
                messageType = 'danger'; // Acquisire status è 'danger'
                 if (typeof renderStats === 'function') renderStats(); // Aggiorna UI
            } else if (statusKey && player[statusKey]) {
                 feedback = `(Sei già ${statusKey.replace('is', '')})` // Già afflitto
                 messageType = 'info';
            } else {
                console.warn("applyPenalty: Status specificato non valido", penaltyObject.status);
                feedback = "(Errore nell'applicazione dello stato)";
            }
            break;

        case 'resource_loss':
            const resource = penaltyObject.resource;
            const amountLoss = penaltyObject.amount || 1;
            if ((resource === 'food' || resource === 'water') && player[resource] >= amountLoss) {
                player[resource] = Math.max(0, player[resource] - amountLoss);
                feedback = `Perdi ${amountLoss} unità di ${resource === 'food' ? 'cibo' : 'acqua'}.`;
                messageType = 'warning';
                 if (typeof renderStats === 'function') renderStats(); // Aggiorna UI
            } else if ((resource === 'food' || resource === 'water') && player[resource] < amountLoss) {
                 const actualLoss = player[resource];
                 player[resource] = 0;
                 feedback = `Perdi le ultime ${actualLoss} unità di ${resource === 'food' ? 'cibo' : 'acqua'}.`;
                 messageType = 'warning';
                  if (typeof renderStats === 'function') renderStats(); // Aggiorna UI
            } else {
                console.warn("applyPenalty: Risorsa specificata non valida", penaltyObject.resource);
                feedback = "(Errore nella perdita di risorse)";
            }
            break;

        case 'durability_loss':
            const targetEquip = penaltyObject.target; // 'weapon' or 'armor'
            const durabilityLoss = penaltyObject.amount || 1;
            let equippedItemId = null;
            if (targetEquip === 'weapon') equippedItemId = player.equippedWeapon;
            else if (targetEquip === 'armor') equippedItemId = player.equippedArmor;

            if (equippedItemId && ITEM_DATA[equippedItemId] && ITEM_DATA[equippedItemId].durability !== undefined) {
                 const itemInfo = ITEM_DATA[equippedItemId];
                 const oldDurability = itemInfo.durability;
                 itemInfo.durability = Math.max(0, itemInfo.durability - durabilityLoss);
                 const actualLoss = oldDurability - itemInfo.durability;
                 feedback = `${itemInfo.name} subisce ${actualLoss} danni alla durabilità.`;
                 if (itemInfo.durability <= 0) {
                     feedback += " È rotto!";
                     messageType = 'danger';
                 } else {
                      messageType = 'warning';
                 }
                 if (typeof renderStats === 'function') renderStats(); // Aggiorna UI
            } else {
                feedback = `(Nessun ${targetEquip} equipaggiato o senza durabilità per subire danni)`;
                messageType = 'info';
            }
            break;

        default:
            console.warn("applyPenalty: Tipo di penalità sconosciuto", penaltyObject.type);
            feedback = "(Tipo di penalità non gestito)";
            break;
    }

    // Logga il messaggio di feedback (potrebbe essere duplicato se chiamato dentro handleEventChoice prima di buildAndShowComplexEventOutcome)
    // Decidiamo di non loggarlo qui, handleEventChoice si occupa del log dell'esito completo.
    // addMessage(feedback, messageType);

    return feedback; // Ritorna la stringa di feedback per il popup
}

/**
 * Esegue un check passivo per trovare loot nel rifugio 'R' durante la notte.
 * Chiamata da closeEventPopup quando viene chiuso il popup specifico.
 * Dipende da: game_constants.js (player, SHELTER_INSPECT_LOOT_WEIGHTS), game_data.js (ITEM_DATA),
 * game_utils.js (addMessage, chooseWeighted), player.js (addItemToInventory).
 */
function performRestStopNightLootCheck() {
    // Verifica che le dipendenze necessarie siano disponibili
    if (typeof player === 'undefined' || typeof player.presagio === 'undefined') {
        console.error("performRestStopNightLootCheck: Oggetto player o player.presagio non definito.");
        return; // Esce se il giocatore non è definito
    }
    if (typeof SHELTER_INSPECT_LOOT_WEIGHTS === 'undefined') {
        console.error("performRestStopNightLootCheck: SHELTER_INSPECT_LOOT_WEIGHTS non definito in game_constants.js.");
        return;
    }
    if (typeof ITEM_DATA === 'undefined') {
        console.error("performRestStopNightLootCheck: ITEM_DATA non definito in game_data.js.");
        return;
    }
    if (typeof chooseWeighted !== 'function') {
        console.error("performRestStopNightLootCheck: Funzione chooseWeighted non trovata (game_utils.js).");
        return;
    }
     if (typeof addItemToInventory !== 'function') {
        console.error("performRestStopNightLootCheck: Funzione addItemToInventory non trovata (player.js).");
        return;
    }
    if (typeof addMessage !== 'function') {
        console.error("performRestStopNightLootCheck: Funzione addMessage non trovata (game_utils.js).");
        return;
    }

    // 1. Calcolare la probabilità di trovare loot basata su Presagio
    const baseChance = 0.10;
    // Applica bonus solo se presagio > 10
    const presagioBonus = player.presagio > 10 ? (player.presagio - 10) * 0.02 : 0;
    let lootChance = baseChance + presagioBonus;
    // Limita la probabilità tra 0 e 1
    lootChance = Math.max(0.0, Math.min(1.0, lootChance));

    // 2. Generare numero casuale
    const randomRoll = Math.random();

    // 3. Controllare se si trova loot
    if (randomRoll < lootChance) {
        // Loot trovato!
        // Prepara la tabella di loot per chooseWeighted
        const lootTable = Object.keys(SHELTER_INSPECT_LOOT_WEIGHTS).map(id => ({
            id: id,
            weight: SHELTER_INSPECT_LOOT_WEIGHTS[id]
        }));

        if (lootTable.length === 0) {
             console.warn("performRestStopNightLootCheck: La tabella di loot SHELTER_INSPECT_LOOT_WEIGHTS è vuota o non valida.");
             return; // Esci se la tabella è vuota
        }

        // Scegli un oggetto dalla tabella
        const chosenLoot = chooseWeighted(lootTable);

        if (chosenLoot && chosenLoot.id) {
            // Oggetto valido scelto
            const itemInfo = ITEM_DATA[chosenLoot.id];
            const quantity = 1; // Quantità fissa per questo check passivo

            if (itemInfo) {
                // Informazioni oggetto valide, aggiungi all'inventario
                addItemToInventory(chosenLoot.id, quantity);
                // Logga il messaggio di successo
                addMessage(`Durante il riposo, noti qualcosa di utile nascosto! Trovato: ${itemInfo.name}.`, 'success', true);
                // addItemToInventory aggiorna già renderInventory
            } else {
                // Logga warning se l'ID oggetto scelto non esiste in ITEM_DATA
                console.warn(`performRestStopNightLootCheck: Loot scelto ('${chosenLoot.id}') non trovato in ITEM_DATA.`);
            }
        } else {
            // Logga warning se chooseWeighted non ha restituito un oggetto valido
            console.warn("performRestStopNightLootCheck: chooseWeighted non ha restituito un loot valido dalla tabella SHELTER_INSPECT_LOOT_WEIGHTS.");
        }
    } else {
        // 4. Nessun loot trovato
        addMessage("Riposi senza trovare nulla di particolare nel rifugio.", 'info');
    }
    // Nessun aggiornamento UI diretto necessario qui, dovrebbe essere gestito dopo la chiamata a questa funzione (in closeEventPopup)
}
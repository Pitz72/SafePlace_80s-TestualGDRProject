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
    // Filtra dalla pool standard eventuali eventi che non dovrebbero più accadere
    // (es. se un evento è stato progettato per accadere una sola volta ma non ha il flag isUnique per qualche ragione).
    // Per ora non abbiamo eventi standard one-time che non siano "isUnique".
    // Potremmo aggiungere logica qui in futuro se necessario.

    // Se la pool di eventi standard è vuota o la probabilità non si verifica, non fare nulla.
    if (eventPool.length === 0 || Math.random() > eventChance) {
        // console.log(`triggerTileEvent: Nessun evento standard attivato su ${tileSymbol}. Probabilità: ${eventChance}, Pool: ${eventPool.length}`); // Log di debug rimosso
        return;
    }

    // Seleziona un evento casuale dalla pool standard.
    const randomEvent = getRandomText(eventPool); // Usa la utility getRandomText

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
             const description = getRandomText(isAgilityBased ? descrizioniPericoloAmbientaleAgilita : descrizioniPericoloAmbientalePresagio);
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
             const dilemmaDescription = getRandomText(descrizioniDilemmaMorale);
             eventDescription = dilemmaDescription; // Imposta la descrizione

            // Le scelte hanno skillCheck o outcome diretto.
            // Le difficoltà dei check possono variare giorno/notte.
            const dilemmaChoices = [
                { text: "Indaga e Intervieni (Presagio)", skillCheck: { stat: 'presagio', difficulty: !isDay ? 14 : 13 }, actionKey: 'intervieni' }, // Check Presagio, più difficile di notte
                { text: "Ignora e prosegui", outcome: getRandomText(esitiDilemmaMoraleIgnora), actionKey: 'ignora' } // Outcome diretto, usa testi da game_data.js
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
            context: eventCtx // Aggiunge il contesto originale
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
    // console.log(`handleEventChoice: Gestione scelta indice ${choiceIndex}.`); // Log di debug

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
    const eventType = currentEventContext.type; // Tipo dell'evento (complesso o specifico del tile, es. 'PREDATOR' o 'VILLAGE')
    const isSearchAction = choice.isSearchAction || false; // Flag se l'azione costa tempo
    const actionKey = choice.actionKey; // Chiave azione (fuga, lotta, segui, ispeziona, etc.)


    // Pulisce le scelte memorizzate subito, in quanto la scelta è stata fatta.
    // Questo impedisce ulteriori input numerici/click su queste scelte.
    // currentEventChoices = []; // << SPOSTATO ALLA FINE DELLA FUNZIONE


    // Applica costo in tempo per le azioni di ricerca (isSearchAction)
    // Questa logica era nel game_logic.js originale, la ripristiniamo qui.
    // Dipende da: game_constants.js (isDay, dayMovesCounter, SEARCH_TIME_COST, DAY_LENGTH_MOVES), map.js (transitionToNight), ui.js (renderStats).
    // NOTA: Applichiamo il costo tempo PRIMA del check. Questo è il comportamento originale.
    // Un'alternativa di design sarebbe applicarlo SOLO in caso di successo o fallimento,
    // o applicare un costo minore per il tentativo. Manteniamo il design originale per ora.
    if (isSearchAction) {
         // console.log(`handleEventChoice: Azione di ricerca, costo tempo: ${SEARCH_TIME_COST}.`); // Log di debug
         if (isDay) {
             dayMovesCounter += SEARCH_TIME_COST;
             // Se i passi giorno superano il limite, forza la transizione a notte
             if (dayMovesCounter >= DAY_LENGTH_MOVES) {
                 if (typeof transitionToNight === 'function') transitionToNight(); else console.warn("handleEventChoice: transitionToNight non disponibile.");
                 // NOTA: Se la transizione a notte avviene qui, il popup potrebbe rimanere aperto
                 // finché l'utente non clicca Continua sull'esito. La logica Notte in movePlayer
                 // controllerà se si è in rifugio al passo successivo.
             }
         } else {
             // Se è notte, le azioni di ricerca all'aperto potrebbero costare passi notturni?
             // La logica originale in movePlayer conteggiava passi notturni SOLO per movimento.
             // Per semplicità, per ora le azioni di ricerca costano tempo solo di giorno.
             // Potrebbe essere necessario un design diverso per la notte.
         }
         // Aggiorna UI stats per mostrare il tempo passato
         if (typeof renderStats === 'function') renderStats(); else console.warn("handleEventChoice: renderStats non disponibile.");
    }


    // --- LOGICA DI RISOLUZIONE: Check Abilità o Esito Diretto ---

    let outcomeTitle = "Risultato"; // Titolo del popup di esito
    let outcomeDescription = ""; // Descrizione testuale dell'esito
    let outcomeCheckDetails = null; // Dettagli del tiro abilità per il log/popup
    let outcomeConsequencesText = ""; // Testo delle conseguenze meccaniche per il popup di esito
    let messageType = 'info'; // Tipo di messaggio per il log e lo stile del popup esito


    // Se la scelta ha un esito diretto predefinito (outcome)
    if (choice.outcome) {
        outcomeTitle = "La Tua Scelta"; // Titolo per esito diretto
        outcomeDescription = getRandomText(choice.outcome); // Seleziona un testo casuale se outcome è un array
        messageType = 'info'; // Default info per esito diretto

        // Applica ricompensa o penalità se definite sull'outcome diretto
        if (choice.successReward) { // Le ricompense su esiti diretti
            const rewardFeedback = applyChoiceReward(choice.successReward); // Usa la utility applyChoiceReward
            if (rewardFeedback) {
                 // Aggiunge il feedback della ricompensa alla descrizione delle conseguenze
                 outcomeConsequencesText += rewardFeedback; // applyChoiceReward ritorna già un messaggio formattato con \n
                 messageType = 'success'; // Se c'è una ricompensa diretta, l'esito è spesso un successo informativo.
            }
        }
        if (choice.failurePenalty) { // Penalità su esiti diretti
             const penaltyFeedback = applyPenalty(choice.failurePenalty); // Usa la utility applyPenalty
             if (penaltyFeedback) {
                 outcomeConsequencesText += `\n${penaltyFeedback}`; // Aggiunge il feedback della penalità con \n
                 messageType = 'warning'; // Se c'è una penalità diretta, è un avviso.
             }
        }


    }
    // Se la scelta richiede un check di abilità
    else if (choice.skillCheck) {
        // Verifica che i dati skillCheck siano completi
        if (!choice.skillCheck || typeof choice.skillCheck.stat === 'undefined' || typeof choice.skillCheck.difficulty === 'undefined') {
            console.error(`handleEventChoice: Dati skillCheck mancanti o non validi per la scelta: '${choice.text}'.`);
             outcomeTitle = "Errore";
             outcomeDescription = "Errore nell'elaborazione del check abilità.";
             messageType = 'danger';
             // Non procedere con il check
             let finalOutcomeText = `${outcomeDescription}`;
             if(outcomeCheckDetails) finalOutcomeText += `\n(${outcomeCheckDetails})`;
             if(outcomeConsequencesText) finalOutcomeText += `\n${outcomeConsequencesText}`;
             // Logga l'esito e mostra il popup di esito (chiama buildAndShowComplexEventOutcome)
             buildAndShowComplexEventOutcome(outcomeTitle, finalOutcomeText, outcomeCheckDetails, outcomeConsequencesText, messageType);
             return; // Esci dalla funzione
        }

        // Esegui il check di abilità (usando la utility performSkillCheck)
        const checkResult = performSkillCheck(choice.skillCheck.stat, choice.skillCheck.difficulty);
        outcomeCheckDetails = checkResult.text; // Stringa descrittiva del tiro (es. "Agilità Check: 15 + 2 = 17 vs Difficoltà 12")


        // --- Gestione Esito Check (Successo o Fallimento) ---
        if (checkResult.success) {
            // --- Successo del Check ---
            outcomeTitle = "Successo!";
            messageType = 'success';

            // La descrizione testuale dell'esito principale
            outcomeDescription = choice.successText || "Hai avuto successo!"; // Usa il testo di successo definito nella scelta

            // Conseguenze meccaniche del successo (ricompense specifiche definite nel choice, o logica complessa per eventi generici)
            // Applica la ricompensa definita nel choice object (successReward).
            // Usa la utility applyChoiceReward. Questa gestisce sia ricompense item specifiche che randomiche.
            if (choice.successReward) {
                const rewardFeedback = applyChoiceReward(choice.successReward);
                 if (rewardFeedback) outcomeConsequencesText += rewardFeedback; // Aggiunge feedback ricompensa con \n
            }

            // Logica specifica per il successo di alcuni EVENTI COMPLESSI (basata sull'actionKey)
            switch (eventType) {
                 case 'PREDATOR':
                      if (actionKey === 'lotta') {
                          // Logica Danno Giocatore Inflitto (con arma equipaggiata) su Successo Lotta.
                          // Non applichiamo danno al nemico (non c'è sistema di combattimento a parte).
                          // Solo descriviamo il danno inflitto e la durabilità dell'arma.
                          let playerDamageDescription = describeWeaponDamage(player.equippedWeapon, tileSymbol); // Funzione helper interna
                          if (playerDamageDescription) outcomeConsequencesText += `\n${playerDamageDescription}`;

                          // Su successo lotta, l'animale/predone sconfitto potrebbe dare loot (Carne, Equipaggiamento).
                           // Questa logica è gestita da applyChoiceReward se la ricompensa è definita nell'evento specifico,
                           // ma per gli eventi complessi generici potremmo volerla qui.
                           // Nel codice originale, solo successo attacco animale dava carne.
                           if (eventType === 'ANIMAL') { // Aggiunge loot Carne solo per animali sconfitti
                                const meatDropChance = ANIMAL_MEAT_DROP_CHANCE;
                                if (Math.random() < meatDropChance) {
                                    const meatAmount = getRandomInt(1, 2);
                                    addItemToInventory('raw_meat', meatAmount); // addItemToInventory logga il messaggio
                                    outcomeConsequencesText += `\nHai sconfitto ${currentEventContext.context?.animalType || 'l\'animale'} e raccogli ${meatAmount} unità di Carne Cruda.`;
                                } else {
                                    outcomeConsequencesText += `\nHai sconfitto ${currentEventContext.context?.animalType || 'l\'animale'}, ma la carcassa è troppo danneggiata per ricavarne cibo utile.`;
                                }
                           } else if (eventType === 'PREDATOR') { // Su successo lotta predatore, c'è chance di loot equipaggiamento base
                                const predatorLootChance = 0.4; // 40% chance di loot da predatore sconfitto
                                if (Math.random() < predatorLootChance) {
                                    // Scegli un oggetto casuale dalla pool loot predatore (semplice per ora)
                                    const predatorLootPool = ['canned_food', 'water_purified_small', 'scrap_metal', 'bandages_dirty', 'pipe_wrench', 'leather_jacket_worn', 'ammo_9mm'];
                                    const lootId = getRandomText(predatorLootPool);
                                    if (lootId) {
                                         let lootQty = 1;
                                         if (lootId === 'ammo_9mm') lootQty = getRandomInt(2, 5);
                                         addItemToInventory(lootId, lootQty); // addItemToInventory logga il messaggio
                                         outcomeConsequencesText += `\nHai sconfitto i predoni! Trovi ${lootQty} x ${ITEM_DATA[lootId]?.name || lootId} tra i loro resti.`;
                                     }
                                } else {
                                    outcomeConsequencesText += "\nHai sconfitto i predoni, ma non trovi nulla di utile tra i loro resti.";
                                }
                           }

                         // Aggiorna UI stats (per durabilità arma) e inventario (per munizioni/loot carne)
                         if (typeof renderStats === 'function') renderStats();
                         if (typeof renderInventory === 'function') renderInventory();
                      }
                      // Successo Fuga/Parla già gestito da outcomeDescription e successReward nell'oggetto choice
                     break;

                case 'ANIMAL':
                     if (actionKey === 'attacca') { // Successo Attacca Animale
                          // Logica Danno Giocatore Inflitto (uguale a Lotta Predoni successo)
                           let playerDamageDescription = describeWeaponDamage(player.equippedWeapon, tileSymbol);
                           if (playerDamageDescription) outcomeConsequencesText += `\n${playerDamageDescription}`;

                          // Loot carne da animale su successo attacco animale
                           const meatDropChance = ANIMAL_MEAT_DROP_CHANCE; // Costante per chance (game_constants.js)
                           if (Math.random() < meatDropChance) {
                               const meatAmount = getRandomInt(1, 2);
                               addItemToInventory('raw_meat', meatAmount); // addItemToInventory logga il messaggio
                               outcomeConsequencesText += `\nHai sconfitto ${currentEventContext.context?.animalType || 'l\'animale'} e raccogli ${meatAmount} unità di Carne Cruda.`;
                           } else {
                               outcomeConsequencesText += `\nHai sconfitto ${currentEventContext.context?.animalType || 'l\'animale'}, ma la carcassa è troppo danneggiata per ricavarne cibo utile.`;
                           }

                          // Aggiorna UI stats (per durabilità arma) e inventario (per munizioni/loot carne)
                          if (typeof renderStats === 'function') renderStats();
                          if (typeof renderInventory === 'function') renderInventory();
                     }
                     // Successo Evita già gestito da outcomeDescription e successReward nell'oggetto choice
                    break;

                case 'TRACKS':
                     if (actionKey === 'segui' || actionKey === 'ispeziona') { // Successo Segui o Ispeziona Tracce
                          // Risolvi l'esito specifico delle Tracce (Loot, Lore, Danger, Nothing)
                          // Usa le probabilità in cascata definite come costanti in game_constants.js.
                          const outcomeRoll = Math.random();
                          let trackOutcomeType = 'nothing'; // Default a nulla

                          if (outcomeRoll < TRACCE_LOOT_CHANCE) { trackOutcomeType = 'loot'; }
                          else if (outcomeRoll < TRACCE_LOOT_CHANCE + TRACCE_LORE_CHANCE) { trackOutcomeType = 'lore'; }
                          else if (outcomeRoll < TRACCE_LOOT_CHANCE + TRACCE_LORE_CHANCE + TRACCE_DANGER_CHANCE) { trackOutcomeType = 'danger'; }

                          // Applica l'esito in base al tipo
                          switch(trackOutcomeType) {
                              case 'loot':
                                  outcomeDescription = getRandomText(descrizioniTracceLoot); // Sostituisci la descrizione base del successo
                                  // Logica Loot Pesato (usa pesi da game_constants.js)
                                  const lootItem = chooseWeighted(Object.keys(TRACCE_SUCCESS_LOOT_WEIGHTS).map(id => ({ id: id, weight: TRACCE_SUCCESS_LOOT_WEIGHTS[id] })));
                                  if (lootItem) {
                                       let lootQty = 1; // Default
                                       if (lootItem.id === 'ammo_9mm') lootQty = getRandomInt(2, 5);
                                       else if (['canned_food', 'water_purified_small', 'berries', 'vitamins', 'bandages_clean', 'repair_kit'].includes(lootItem.id)) lootQty = 1;
                                       else if (['bandages_dirty', 'scrap_metal', 'mechanical_parts'].includes(lootItem.id)) lootQty = getRandomInt(1, 2);
                                       addItemToInventory(lootItem.id, lootQty); // addItemToInventory logga il messaggio
                                       outcomeConsequencesText += `\nTrovi: ${lootQty} x ${ITEM_DATA[lootItem.id]?.name || lootItem.id}!`;
                                  } else {
                                       outcomeConsequencesText += "\nTrovi qualcosa, ma è rotto o inutile.";
                                  }
                                  if (typeof renderInventory === 'function') renderInventory(); // Aggiorna inventario
                                  break;
                              case 'lore':
                                  outcomeDescription = getRandomText(descrizioniTracceLore); // Sostituisci la descrizione base
                                  const loreFeedback = findLoreFragment(); // findLoreFragment logga già il messaggio
                                   if (loreFeedback) outcomeConsequencesText += `\nHai scoperto un frammento del passato.`; // Aggiunge un feedback generico
                                  break;
                              case 'danger':
                                  outcomeDescription = getRandomText(descrizioniTracceDanger); // Sostituisci la descrizione base
                                  outcomeConsequencesText += "\nLe tracce ti hanno condotto dritto in un'imboscata!";
                                  addMessage("Senti un fischio e delle figure emergono dalle ombre!", 'danger', true); // Messaggio di avviso aggiuntivo
                                  // TODO: Potrebbe triggerare un incontro PREDATOR qui invece di solo un messaggio?
                                  // Per ora, simula solo un pericolo senza danno immediato
                                  break;
                              case 'nothing':
                              default:
                                  outcomeDescription = getRandomText(descrizioniTracceNothing); // Sostituisci la descrizione base
                                  outcomeConsequencesText += "\nLe tracce non hanno portato a nulla di utile.";
                                  break;
                          }
                     } else { /* Azioni diverse da Segui/Ispeziona (es. Ignora) già gestite sopra */ }
                    break;

                case 'ENVIRONMENTAL': // Successo Evita Pericolo Ambientale
                    // outcomeDescription già impostata dal choice.successText
                     outcomeConsequencesText += "\nSei riuscito ad evitare il pericolo senza conseguenze!";
                    break;

                case 'DILEMMA': // Successo Indaga e Intervieni
                    // outcomeDescription già impostata dal choice.successText
                     const outcomeRoll = Math.random();
                     if (outcomeRoll < 0.8) { // 80% Esito positivo (Ricompensa)
                         outcomeDescription = getRandomText(esitiDilemmaMoraleIndagaOkPositivo); // Testo specifico successo positivo
                         // Ricompensa variabile (Risorsa o Stat Bonus)
                         const bonusType = Math.random() < 0.5 ? 'resource' : 'stat_bonus'; // 50/50 tra risorsa e stat
                         if (bonusType === 'resource') {
                              // Ricompensa risorsa comune (cibo, acqua, med base)
                              const resourcePool = ['canned_food', 'water_purified_small', 'bandages_dirty', 'suspicious_pills'];
                              const lootId = getRandomText(resourcePool);
                              const lootQty = getRandomInt(1,2);
                              addItemToInventory(lootId, lootQty); // addItemToInventory logga il messaggio
                              outcomeConsequencesText += `\nLa tua azione è stata ricompensata: ${lootQty} x ${ITEM_DATA[lootId]?.name || lootId}!`;
                              if (typeof renderInventory === 'function') renderInventory(); // Aggiorna inventario
                         } else {
                              // Ricompensa stat bonus (es. Vigore o Adattamento)
                              const statToBoost = Math.random() < 0.5 ? 'vigore' : 'adattamento'; // 50/50 tra Vigore e Adattamento
                              const statGain = DILEMMA_STAT_GAIN; // Quantità bonus (costante)
                              player[statToBoost] += statGain;
                              outcomeConsequencesText += `\nHai agito correttamente. Ti senti più forte. (${statToBoost.charAt(0).toUpperCase() + statToBoost.slice(1)} +${statGain})`;
                              // Aggiorna HP Max se Vigore aumenta
                              if (statToBoost === 'vigore') {
                                  const oldMaxHp = player.maxHp;
                                  player.maxHp = 10 + player.vigore;
                                  player.hp = Math.min(player.hp + (player.maxHp - oldMaxHp), player.maxHp); // Aggiunge HP per l'aumento
                                  outcomeConsequencesText += ` I tuoi HP massimi sono aumentati a ${player.maxHp}.`;
                              }
                              if (typeof renderStats === 'function') renderStats(); // Aggiorna UI stats
                         }
                         messageType = 'success'; // Esito positivo con ricompensa

                     } else { // 20% Esito negativo (Penalità)
                         outcomeDescription = getRandomText(esitiDilemmaMoraleIndagaOkNegativo); // Testo specifico successo negativo (azioni che finiscono male)
                         // Penalità variabile (danno lieve, perdita risorse)
                         const penaltyType = Math.random() < 0.6 ? 'damage' : 'resource_loss'; // 60% danno, 40% perdita risorse
                         if (penaltyType === 'damage') {
                             const baseDamage = getRandomInt(1, 3); // Danno lieve
                             const damageFeedback = applyDamage(baseDamage);
                             outcomeConsequencesText += `\nIl tuo intervento è andato male.${damageFeedback}.`;
                         } else {
                              const resourceLoss = Math.random() < 0.5 ? 'food' : 'water';
                              const lossAmount = 1;
                               if (player[resourceLoss] >= lossAmount) {
                                   player[resourceLoss] -= lossAmount;
                                   outcomeConsequencesText += `\nNella confusione, perdi ${lossAmount} unità di ${resourceLoss === 'food' ? 'cibo' : 'acqua'}.`;
                                   if (typeof renderStats === 'function') renderStats(); // Aggiorna UI risorse
                              } else {
                                   outcomeConsequencesText += "\nIl tuo intervento è andato male, ma non subisci perdite immediate.";
                              }
                         }
                         if (player.hp <= 0) { if (typeof endGame === 'function') endGame(false); return; } // Check morte
                         messageType = 'warning'; // Esito negativo, non un vero fallimento ma finisce male.
                     }
                    break;

                case 'HORROR': // Successo Fuga o Affronta
                     if (actionKey === 'fuga') {
                         outcomeDescription = getRandomText(esitiOrroreIndicibileFugaOk); // Testo successo fuga
                         outcomeConsequencesText += "\nRiesci a fuggire dall'orrore, anche se con il fiato corto e la mente scossa.";
                         messageType = 'success'; // Successo di fuga
                     } else if (actionKey === 'affronta') {
                         outcomeDescription = getRandomText(esitiOrroreIndicibileAffrontaOk); // Testo successo affronta
                         // Bonus significativo all'adattamento per aver affrontato l'orrore
                         const statGain = HORROR_ADAPTATION_GAIN; // Quantità bonus (costante)
                         player.adattamento += statGain;
                         outcomeConsequencesText += `\nAffronti l'indicibile e ne esci più forte. (Adattamento +${statGain})`;
                         if (typeof renderStats === 'function') renderStats(); // Aggiorna UI stats
                         messageType = 'success'; // Successo di affrontare l'orrore
                     }
                    break;

                 case 'SHELTER_INSPECT': // Successo Ispezione Rifugio
                      // Risolvi l'esito specifico dell'Ispezione (Loot, Lore, Nothing)
                      // Usa le probabilità definite come costanti in game_constants.js.
                       const findRoll = Math.random();
                       let inspectOutcomeType = 'nothing'; // Default a nulla

                       if (findRoll < SHELTER_INSPECT_LOOT_CHANCE) { // Check per Loot
                          inspectOutcomeType = 'loot';
                       } else if (findRoll < SHELTER_INSPECT_LOOT_CHANCE + SHELTER_INSPECT_LORE_CHANCE) { // Check per Lore (dopo fallimento Loot)
                           inspectOutcomeType = 'lore';
                       } // Altrimenti rimane 'nothing' (il 25% rimanente)

                       // Applica l'esito in base al tipo
                       switch(inspectOutcomeType) {
                           case 'loot':
                               outcomeDescription = getRandomText(esitiRifugioIspezionaOkLoot); // Sostituisci descrizione base
                               // Logica Loot Pesato (usa pesi da game_constants.js)
                               const lootItem = chooseWeighted(Object.keys(SHELTER_INSPECT_LOOT_WEIGHTS).map(id => ({ id: id, weight: SHELTER_INSPECT_LOOT_WEIGHTS[id] })));
                               if (lootItem) {
                                   let lootQty = 1; // Default
                                   // Quantità variabile per alcuni oggetti (simili a loot tracce)
                                   if (lootItem.id === 'ammo_9mm') lootQty = getRandomInt(2, 6);
                                   else if (['canned_food', 'water_purified_small', 'vitamins', 'bandages_clean', 'repair_kit'].includes(lootItem.id)) lootQty = 1; // repair_kit puo' essere 1
                                   else if (['bandages_dirty', 'scrap_metal', 'mechanical_parts'].includes(lootItem.id)) lootQty = getRandomInt(1, 2);
                                   addItemToInventory(lootItem.id, lootQty); // addItemToInventory logga il messaggio
                                   outcomeConsequencesText += `\nLa tua ispezione rivela: ${lootQty} x ${ITEM_DATA[lootItem.id]?.name || lootItem.id}!`;
                               } else {
                                    outcomeConsequencesText += "\nLa tua ispezione rivela qualcosa, ma è rotto o inutile.";
                               }
                               if (typeof renderInventory === 'function') renderInventory(); // Aggiorna inventario
                               messageType = 'success'; // Successo significativo
                               break;
                           case 'lore':
                               outcomeDescription = getRandomText(esitiRifugioIspezionaOkLore); // Sostituisci descrizione base
                               const loreFeedback = findLoreFragment(); // findLoreFragment logga già il messaggio
                                if (loreFeedback) outcomeConsequencesText += `\nScopri qualcosa di interessante sul passato di questo luogo.`; // Feedback generico
                               messageType = 'info'; // Lore è informativo
                               break;
                           case 'nothing':
                           default:
                               outcomeDescription = getRandomText(esitiRifugioIspezionaKoNulla); // Sostituisci descrizione base (Nulla)
                               outcomeConsequencesText += "\nNon trovi nulla di particolare.";
                               messageType = 'info'; // Esito neutro
                               break;
                       }
                     break;

                // Default per eventi specifici del tile (non eventi complessi generici)
                default: // Questo default cattura i check successo degli eventi specifici del tile (es. eventi da EVENT_DATA)
                     // outcomeDescription già impostata dal choice.successText
                     // Le ricompense definite nel choice.successReward sono già gestite sopra da applyChoiceReward.
                     // Le conseguenze testuali definite nel choice.consequences sono già gestite sopra.
                     // Nessuna logica aggiuntiva complessa specifica per questi eventi qui.
                    break;
            }


        } else {
            // --- Fallimento del Check ---
            outcomeTitle = "Fallimento";
            messageType = 'warning'; // Default warning per fallimento check

            // La descrizione testuale dell'esito principale
            outcomeDescription = choice.failureText || "Hai fallito."; // Usa il testo di fallimento definito nella scelta

            // Conseguenze meccaniche del fallimento (penalità specifiche definite nel choice, o logica complessa per eventi generici)
            // Applica la penalità definita nel choice object (failurePenalty).
            // Usa la utility applyPenalty. Questa gestisce danni, perdita risorse, status, perdita durabilità.
            if (choice.failurePenalty) {
                const penaltyFeedback = applyPenalty(choice.failurePenalty);
                 if (penaltyFeedback) outcomeConsequencesText += `\n${penaltyFeedback}`; // Aggiunge feedback penalità con \n
                // applyPenalty già imposta messageType a warning/danger se applica danno o status.
                // Manteniamo il messageType impostato da applyPenalty se più grave di 'warning'.
                if (penaltyObject.type === 'damage' || penaltyObject.type === 'status') messageType = 'danger';
            }
             // Le ricompense definite su failure non hanno senso logico, le ignoriamo.


            // Logica specifica per il fallimento di alcuni EVENTI COMPLESSI (basata sull'actionKey)
            // Alcuni fallimenti hanno conseguenze più complesse o specifici testi KO.
            switch (eventType) {
                case 'PREDATOR':
                     if (actionKey === 'fuga') {
                         outcomeDescription = getRandomText(esitiFugaPredoniKo); // Sostituisci descrizione base
                         // Danno lieve e possibile perdita risorse (già gestito da applyPenalty se failurePenalty è definito con type 'damage'/'resource_loss')
                         // Se non c'era failurePenalty, applichiamo qui la penalità standard di fallimento fuga predatore.
                         if (!choice.failurePenalty) {
                             const baseDamage = getRandomInt(PREDATOR_FLEE_FAIL_DAMAGE_MIN, PREDATOR_FLEE_FAIL_DAMAGE_MAX);
                             const damageFeedback = applyDamage(baseDamage);
                             outcomeConsequencesText += `\nNon riesci a fuggire!${damageFeedback}.`;
                             if(Math.random() < 0.3) { // 30% probabilità di perdere risorse
                                const resourceLoss = Math.random() < 0.5 ? 'food' : 'water';
                                const lossAmount = 1;
                                 if (player[resourceLoss] >= lossAmount) {
                                     player[resourceLoss] -= lossAmount;
                                     outcomeConsequencesText += ` Nella fuga perdi ${lossAmount} unità di ${resourceLoss === 'food' ? 'cibo' : 'acqua'}.`;
                                      if (typeof renderStats === 'function') renderStats();
                                 }
                             }
                         }
                         messageType = 'danger'; // Fallimento fuga predatore è pericoloso
                     } else if (actionKey === 'lotta') {
                         outcomeDescription = getRandomText(esitiLottaPredoniKo); // Sostituisci descrizione base
                         // Danno Moderato/Grave e Perdita Risorse Garantita su Fallimento Lotta
                         // Se non c'era failurePenalty, applichiamo qui la penalità standard di fallimento lotta predatore.
                          if (!choice.failurePenalty) {
                              const baseDamage = getRandomInt(PREDATOR_FIGHT_FAIL_DAMAGE_MIN, PREDATOR_FIGHT_FAIL_DAMAGE_MAX);
                              const damageFeedback = applyDamage(baseDamage);
                              outcomeConsequencesText += `\nSei sopraffatto!${damageFeedback}.`;
                              const resourceLossFood = getRandomInt(0, Math.min(Math.floor(player.food), 2));
                              const resourceLossWater = getRandomInt(0, Math.min(Math.floor(player.water), 2));
                              if (resourceLossFood > 0) {
                                  player.food -= resourceLossFood;
                                  outcomeConsequencesText += ` Ti rubano ${resourceLossFood} unità di cibo.`;
                              }
                               if (resourceLossWater > 0) {
                                   player.water -= resourceLossWater;
                                   outcomeConsequencesText += ` Ti rubano ${resourceLossWater} unità di acqua.`;
                               }
                              if (resourceLossFood > 0 || resourceLossWater > 0) {
                                   if (typeof renderStats === 'function') renderStats();
                                   if (typeof renderInventory === 'function') renderInventory();
                              }
                         }
                         messageType = 'danger'; // Fallimento lotta predatore è molto pericoloso
                    } else if (actionKey === 'parla') {
                         outcomeDescription = getRandomText(esitiParlaPredoniKo); // Sostituisci descrizione base
                         outcomeConsequencesText += "\nLe tue parole non hanno effetto, si preparano ad attaccare!";
                         // Lieve danno iniziale e chance di perdita risorse su fallimento parlare
                         // Se non c'era failurePenalty, applichiamo qui la penalità standard.
                          if (!choice.failurePenalty) {
                              const baseDamage = getRandomInt(PREDATOR_TALK_FAIL_DAMAGE_MIN, PREDATOR_TALK_FAIL_DAMAGE_MAX);
                              const damageFeedback = applyDamage(baseDamage);
                              outcomeConsequencesText += ` Ti colpiscono mentre cerchi di parlare${damageFeedback}.`;
                              if (Math.random() < 0.25) { // 25% probabilità
                                  const resourceLoss = Math.random() < 0.5 ? 'food' : 'water';
                                  const lossAmount = 1;
                                   if (player[resourceLoss] >= lossAmount) {
                                       player[resourceLoss] -= lossAmount;
                                       outcomeConsequencesText += ` Nella confusione ti cade ${lossAmount} unità di ${resourceLoss === 'food' ? 'cibo' : 'acqua'}.`;
                                        if (typeof renderStats === 'function') renderStats();
                                   }
                              }
                         }
                         messageType = 'warning'; // Fallimento parlare è un avviso, può portare a peggio
                    }
                    break;

                case 'ANIMAL':
                     if (actionKey === 'evita') {
                         outcomeDescription = getRandomText(esitiEvitaAnimaleKo); // Sostituisci descrizione base
                         // Danno lieve da animale scoperto
                         // Se non c'era failurePenalty, applichiamo qui la penalità standard.
                          if (!choice.failurePenalty) {
                             const baseDamage = getRandomInt(ANIMAL_EVADE_FAIL_DAMAGE_MIN, ANIMAL_EVADE_FAIL_DAMAGE_MAX);
                             const damageFeedback = applyDamage(baseDamage);
                             outcomeConsequencesText += `\nL'animale ti scopre e ti attacca!${damageFeedback}.`;
                         }
                         messageType = 'warning'; // Fallimento evitare animale è pericoloso
                     } else if (actionKey === 'attacca') {
                          outcomeDescription = getRandomText(esitiAttaccoAnimaleKo); // Sostituisci descrizione base
                         // Danno moderato da lotta con animale persa
                         // Se non c'era failurePenalty, applichiamo qui la penalità standard.
                          if (!choice.failurePenalty) {
                             const baseDamage = getRandomInt(ANIMAL_ATTACK_FAIL_DAMAGE_MIN, ANIMAL_ATTACK_FAIL_DAMAGE_MAX);
                             const damageFeedback = applyDamage(baseDamage);
                             outcomeConsequencesText += `\nL'animale si difende ferocemente!${damageFeedback}.`;
                         }
                         messageType = 'danger'; // Fallimento attaccare animale è molto pericoloso
                     }
                    break;

                case 'TRACKS':
                     if (actionKey === 'segui' || actionKey === 'ispeziona') { // Fallimento Segui o Ispeziona Tracce
                         outcomeDescription = getRandomText(esitiSeguiTracceKo); // Sostituisci descrizione base
                         outcomeConsequencesText += "\nPerdi tempo prezioso seguendo tracce sbagliate o confondendoti.";
                         // Nessun danno diretto standard da fallimento check tracce (solo tempo perso, già gestito parzialmente)
                         messageType = 'info'; // Esito neutro/negativo minore
                     }
                    break;

                case 'ENVIRONMENTAL': // Fallimento Evita Pericolo Ambientale
                    outcomeDescription = getRandomText(esitiPericoloAmbientaleColpito); // Sostituisci descrizione base
                     // Danno variabile in base al tipo di pericolo e chance status (gestito da applyPenalty se failurePenalty definito)
                     // Se non c'era failurePenalty, applichiamo qui la penalità standard.
                      if (!choice.failurePenalty) {
                         const baseDamage = getRandomInt(ENVIRONMENTAL_FAIL_DAMAGE_MIN, ENVIRONMENTAL_FAIL_DAMAGE_MAX);
                         const damageFeedback = applyDamage(baseDamage);
                         outcomeConsequencesText += `\nSei colpito dal pericolo ambientale!${damageFeedback}.`;
                          // Possibile effetto aggiuntivo (es. status malattia)
                          const extraEffectChance = ENVIRONMENTAL_SICKNESS_CHANCE;
                          if (Math.random() < extraEffectChance) {
                              player.isSick = true;
                              outcomeConsequencesText += ` Potresti esserti infettato. (Stato: Infetto)`;
                               if (typeof renderStats === 'function') renderStats(); // Aggiorna UI stato
                          }
                      }
                     messageType = 'danger'; // Fallimento pericolo ambientale è pericoloso
                    break;

                case 'DILEMMA': // Fallimento Indaga e Intervieni
                     outcomeDescription = getRandomText(esitiDilemmaMoraleIndagaKo); // Sostituisci descrizione base
                     outcomeConsequencesText += "\nIl tuo tentativo di intervento fallisce!";
                     // Danno per fallimento intervento (gestito da applyPenalty se failurePenalty definito)
                     // Se non c'era failurePenalty, applichiamo qui la penalità standard.
                      if (!choice.failurePenalty) {
                          const baseDamage = getRandomInt(DILEMMA_INTERVENE_FAIL_DAMAGE_MIN, DILEMMA_INTERVENE_FAIL_DAMAGE_MAX);
                          const damageFeedback = applyDamage(baseDamage);
                          outcomeConsequencesText += damageFeedback;
                      }
                     messageType = 'danger'; // Fallimento dilemma è pericoloso
                    break;

                case 'HORROR': // Fallimento Fuga o Affronta
                     if (actionKey === 'fuga') {
                         outcomeDescription = getRandomText(esitiOrroreIndicibileFugaKo); // Testo fallimento fuga
                         // Danno lieve HP + possibile status negativo temporaneo (paura?)
                         // Se non c'era failurePenalty, applichiamo qui la penalità standard.
                          if (!choice.failurePenalty) {
                              const baseDamage = getRandomInt(HORROR_FLEE_FAIL_DAMAGE_MIN, HORROR_FLEE_FAIL_DAMAGE_MAX);
                               // Danno da orrore è "mentale/psichico", armatura ha riduzione dimezzata
                              const damageFeedback = applyDamage(baseDamage, true); // isMentalHorror = true
                              outcomeConsequencesText += `\nL'orrore ti raggiunge! Subisci danni (fisici/mentali)${damageFeedback}.`;
                              // TODO: Possibile status di Paura/Confusione/Follia temporanea qui?
                          }
                         messageType = 'danger'; // Fallimento fuga da orrore è pericoloso
                     } else if (actionKey === 'affronta') {
                          outcomeDescription = getRandomText(esitiOrroreIndicibileAffrontaKo); // Testo fallimento affronta
                         // Danno HP significativo + status negativo (Follia temporanea?)
                         // Se non c'era failurePenalty, applichiamo qui la penalità standard.
                          if (!choice.failurePenalty) {
                              const baseDamage = getRandomInt(HORROR_AFFRONT_FAIL_DAMAGE_MIN, HORROR_AFFRONT_FAIL_DAMAGE_MAX);
                              const damageFeedback = applyDamage(baseDamage, true); // isMentalHorror = true
                              outcomeConsequencesText += `\nL'orrore ti sopraffà! Subisci danni devastanti${damageFeedback}.`;
                              // Applica status Malattia per simulare trauma/follia temporanea (se non già malato)
                               if (!player.isSick) {
                                  player.isSick = true;
                                   outcomeConsequencesText += ` La tua mente è scossa. (Stato: Infetto)`; // Usiamo Infetto per ora, ma servirebbe uno stato FOLLIA
                                   if (typeof renderStats === 'function') renderStats();
                                   addMessage("La tua mente vacilla. Sei stato segnato dall'indicibile!", 'danger', true);
                               }
                          }
                         messageType = 'danger'; // Fallimento affrontare orrore è molto pericoloso
                     }
                    break;

                 case 'SHELTER_INSPECT': // Fallimento Ispezione Rifugio
                     // Risolvi l'esito Fallimento Ispezione (Trappola o Nulla)
                     // Usa le probabilità definite come costanti in game_constants.js.
                      const failRoll = Math.random();
                      let inspectFailOutcomeType = 'nothing'; // Default a nulla
                       // SHELTER_INSPECT_TRAP_CHANCE
                       if (failRoll < 0.5) { // 50% Trappola (come nel codice originale)
                           inspectFailOutcomeType = 'trap';
                       } // Altrimenti nulla (l'altro 50%)

                      switch(inspectFailOutcomeType) {
                          case 'trap':
                              outcomeDescription = getRandomText(esitiRifugioIspezionaKoTrappola); // Sostituisci descrizione base
                              // Danno da trappola e chance status malattia
                              // Se non c'era failurePenalty, applichiamo qui la penalità standard.
                               if (!choice.failurePenalty) {
                                   const baseDamage = getRandomInt(SHELTER_INSPECT_TRAP_DAMAGE_MIN, SHELTER_INSPECT_TRAP_DAMAGE_MAX);
                                   const damageFeedback = applyDamage(baseDamage);
                                   outcomeConsequencesText += `\nEra una trappola!${damageFeedback}.`;
                                   const sickChance = SHELTER_INSPECT_TRAP_SICKNESS_CHANCE;
                                   if (Math.random() < sickChance) {
                                       player.isSick = true;
                                       outcomeConsequencesText += ` La trappola potrebbe averti infettato! (Stato: Infetto)`;
                                        if (typeof renderStats === 'function') renderStats(); // Aggiorna UI stato
                                   }
                               }
                              messageType = 'danger'; // Trappola è pericoloso
                              break;
                          case 'nothing':
                          default:
                              outcomeDescription = getRandomText(esitiRifugioIspezionaKoNulla); // Sostituisci descrizione base (Nulla)
                               outcomeConsequencesText += "\nL'ispezione non rivela nulla, né di buono né di cattivo.";
                              messageType = 'info'; // Esito neutro
                              break;
                      }
                     break;


                // Default per fallimenti di eventi specifici del tile (non eventi complessi generici)
                default: // Questo default cattura i check fallimento degli eventi specifici del tile (es. eventi da EVENT_DATA)
                     // outcomeDescription già impostata dal choice.failureText
                     // Le penalità definite nel choice.failurePenalty sono già gestite sopra da applyPenalty.
                     // Le conseguenze testuali definite nel choice.consequences (o failureConsequences) sono già gestite sopra.
                     // Nessuna logica aggiuntiva complessa specifica per questi eventi qui.
                    break;
            }

             // Check morte dopo l'applicazione delle penalità
             if (player.hp <= 0) {
                 // endGame (definita in game_core.js) è chiamata dentro applyDamage o applyPenalty se il danno/stato porta a morte.
                 // Ritorna per uscire dalla catena di gestione eventi.
                 return;
             }

        } // Fine gestione esito check successo/fallimento

        // --- Preparazione e Visualizzazione Popup di Esito ---
        // Costruisce il testo completo per il popup di esito
        let finalOutcomeText = `${outcomeDescription}`;
        if (outcomeCheckDetails) finalOutcomeText += `\n(${outcomeCheckDetails})`; // Aggiunge dettagli check sotto (es. "Agilità Check: ...")
        if (outcomeConsequencesText) finalOutcomeText += `\n${outcomeConsequencesText}`; // Aggiunge conseguenze (loot, danni, status) sotto

        // Logga il messaggio di esito completo al log di gioco.
        // Questo è il messaggio principale che riassume cosa è successo.
         addMessage(`${outcomeTitle}. ${finalOutcomeText}`, messageType, true);


        // Mostra il popup di risultato dell'evento complesso (chiama la funzione UI).
        // buildAndShowComplexEventOutcome è definita in ui.js. Imposta isOutcome = true e gestisce il bottone Continua.
        // Passiamo il titolo, la descrizione completa (che include check details e conseguenze testuali),
        // e il tipo di messaggio per lo styling.
        buildAndShowComplexEventOutcome(outcomeTitle, finalOutcomeText, null, null, messageType); // checkDetails e consequences sono ora inclusi in finalOutcomeText


    } // Fine gestione IF skillCheck
    // Else (scelta senza check e senza outcome diretto): non dovrebbe succedere con i choices ben definiti, ma per sicurezza.
     else {
         console.warn(`handleEventChoice: Scelta senza skillCheck e senza outcome/successReward/failurePenalty: '${choice.text}'. Non succede nulla.`);
         addMessage(`Hai scelto: "${choice.text}". Non succede nulla.`, 'info');
          if (typeof closeEventPopup === 'function') closeEventPopup(); // Chiudi il popup
     }

    // Pulisci le scelte globali ORA che l'evento è stato gestito.
    currentEventChoices = [];

    // La funzione non ritorna esplicitamente true/false perché la continuazione del gioco
    // avviene cliccando il bottone "Continua" sul popup di esito, che chiama closeEventPopup.
}


// --- Implementazione check & log status messages ---
// Chiamata da movePlayer (map.js). Logicamante sta qui perché logga stati legati agli eventi/condizioni.
// Dipende da: game_constants.js (player, STATO_MESSAGGI, ...altre costanti stato), game_utils.js (getRandomText, addMessage), ui.js (renderStats).
// (Già definita sopra, ma ri-menzionata per completezza)


// --- Funzione helper interna per descrivere il danno inflitto con l'arma (usata su successo lotta) ---
// Dipende da game_constants.js (player, ITEM_DATA, ...costanti bonus arma, RECOVER_ARROW_BOLT_CHANCE), game_utils.js (getRandomInt, checkAmmoAvailability, consumeAmmo).
// Usata da handleEventChoice.
/**
 * Calcola il danno base inflitto dal giocatore con l'arma equipaggiata e genera un messaggio descrittivo.
 * Applica bonus danno basati sul tipo di arma/ambiente/stats.
 * Consuma munizioni e riduce durabilità dell'arma.
 * @param {string|null} equippedWeaponId - L'ID dell'arma equipaggiata.
 * @param {string} currentTileSymbol - Il simbolo del tile corrente (per bonus ambientali).
 * @returns {string} Un messaggio descrittivo del danno inflitto e dello stato dell'arma/munizioni.
 */
function describeWeaponDamage(equippedWeaponId, currentTileSymbol) {
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
                // Check munizioni (la funzione checkAmmoAvailability è in player.js)
                if (typeof checkAmmoAvailability === 'function') {
                    hasAmmo = checkAmmoAvailability().hasAmmo;
                } else { console.warn("describeWeaponDamage: checkAmmoAvailability non disponibile."); }

                if (!hasAmmo) {
                    playerDamage = 1; // Danno base se senza munizioni
                    weaponDescription += ` (Sei senza ${ITEM_DATA[weaponData.ammoType]?.name || weaponData.ammoType}!)`;
                } else {
                    // Consuma una munizione (la funzione consumeAmmo è in player.js)
                    if (typeof consumeAmmo === 'function') {
                        const consumeResult = consumeAmmo();
                        if (consumeResult.consumed) ammoMessage += ` Hai usato una munizione.`;
                        if (consumeResult.recovered) ammoMessage += ` Sei riuscito a recuperare una munizione!`;
                    } else { console.warn("describeWeaponDamage: consumeAmmo non disponibile."); }
                }
            }

            // Applica bonus al danno in base al tipo di arma e statistiche/ambiente (implementazione semplificata del concetto)
            let bonusDamage = 0;
            switch(weaponData.weaponType) {
                 case 'mischia': // Bonus vs 1 solo nemico? Difficile da implementare qui.
                     // Bonus in spazi chiusi/ristretti? Non abbiamo tile "interni" per ora.
                     break;
                 case 'bianca_lunga': // Bonus in spazi aperti (Pianura, Foresta)
                     if (currentTileSymbol === TILE_SYMBOLS.PLAINS || currentTileSymbol === TILE_SYMBOLS.FOREST) {
                         bonusDamage += 1; weaponDescription += " (Vantaggio di portata)";
                     }
                     break;
                 case 'bianca_corta': // Bonus con alta agilità
                     if (player.agilita > 12) {
                         bonusDamage += 1; weaponDescription += " (Fendente rapido)";
                     }
                     break;
                  case 'lancio': // Possibilità di colpo iniziale bonus (simulato come bonus danno qui)
                      if (Math.random() < 0.5) { // 50% chance di colpo iniziale efficace
                          bonusDamage += 2; weaponDescription += " (Colpo iniziale riuscito!)";
                      }
                      // TODO: Logica specifica per armi da lancio equipaggiate (rimozione dallo slot equipaggiato DOPO il lancio).
                      break;
                  case 'fuoco': // Rischio inceppamento critico (riduce danno a 1)
                       if (hasAmmo && Math.random() < 0.25) { // 25% chance (solo se ha munizioni)
                           playerDamage = 1; // Danno ridotto a base
                           weaponDescription += " (La tua arma si inceppa al momento cruciale!)";
                       }
                       // Consumo munizioni gestito sopra.
                       break;
                  case 'balestra':
                  case 'arco': // Danno preciso (più probabilità di colpo critico? Simulato con bonus danno)
                       if (hasAmmo && Math.random() < 0.6) { // 60% chance di colpo preciso bonus
                           bonusDamage += 2; weaponDescription += " (Colpo preciso!)";
                       }
                       // Consumo munizioni gestito sopra.
                       break;
            }
            playerDamage += bonusDamage; // Applica bonus

            // Riduci la durabilità dell'arma dopo l'uso in combattimento (anche su successo)
            if (weaponData.durability !== undefined && weaponData.maxDurability !== undefined) {
                 let durabilityDecrease = 1; // Decremento base
                 // Armi corpo a corpo si usurano più velocemente
                 if (['mischia', 'bianca_lunga', 'bianca_corta', 'lancio'].includes(weaponData.weaponType)) {
                     durabilityDecrease = 2;
                 }
                  // Armi a distanza si usurano meno
                  if (['fuoco', 'balestra', 'arco'].includes(weaponData.weaponType)) {
                     durabilityDecrease = 1;
                 }

                const oldDurability = weaponData.durability;
                weaponData.durability = Math.max(0, weaponData.durability - durabilityDecrease);
                const actualLoss = oldDurability - weaponData.durability;

                // Messaggio sullo stato della durabilità
                if (weaponData.durability <= 0) {
                    durabilityMessage = " La tua arma si è rotta!";
                } else if (weaponData.durability <= weaponData.maxDurability * 0.25) {
                    durabilityMessage = ` La durabilità è diminuita di ${actualLoss}. È gravemente danneggiata!`;
                     if (typeof addMessage === 'function') addMessage(`${weaponData.name} è gravemente danneggiata.`, 'warning');
                } else if (weaponData.durability <= weaponData.maxDurability * 0.5) {
                     durabilityMessage = ` La durabilità è diminuita di ${actualLoss}. È danneggiata.`;
                     if (typeof addMessage === 'function') addMessage(`${weaponData.name} è danneggiata.`, 'info');
                } else if (actualLoss > 0) {
                     durabilityMessage = ` La durabilità è diminuita di ${actualLoss}.`; // Messaggio per usura normale
                }
                 // Aggiorna UI stats (per durabilità arma visualizzata)
                 if (typeof renderStats === 'function') renderStats();
            }

        } // Fine if arma funzionante
    } // Fine if equippedWeaponId

    // Costruisci il messaggio finale
    let message = `Infliggi ${playerDamage} danni con ${weaponName}${weaponDescription}.`;
    if (durabilityMessage) message += durabilityMessage;
    if (ammoMessage) message += ammoMessage; // Aggiunge messaggio munizioni (consumate/recuperate)

    return message;
}


// --- FINE LOGICA EVENTI ---

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
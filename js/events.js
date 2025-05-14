/**
 * TheSafePlace - Roguelike Postapocalittico
 * Versione: v0.7.21 Durability Reforged
 * File: js/events.js
 * Descrizione: Gestione degli eventi di gioco, scelte e risultati.
 * Dipende da: game_constants.js, game_data.js, game_utils.js, ui.js, player.js
 */

// Dipendenze:
// - Variabili di stato globali (player, map, isDay, eventScreenActive, gamePaused, currentEventChoices, currentEventContext, ...) da game_constants.js
// - Costanti (EVENT_CHANCE, EVENT_DATA, COMPLEX_EVENT_CHANCE, COMPLEX_EVENT_TYPE_WEIGHTS, TILE_SYMBOLS, STATO_MESSAGGI, ...costanti esiti/probabilità danni/loot) da game_constants.js/game_data.js
// - Funzioni utility (getRandomInt, addMessage, getRandomText, performSkillCheck, getSkillCheckLikelihood, chooseWeighted) da game_utils.js
// - Funzioni UI (showEventPopup, closeEventPopup, renderStats, renderMap, disableControls, enableControls) da ui.js
// - Funzioni Player (addItemToInventory, removeItemFromInventory, consumeAmmo, checkAmmoAvailability, applyWearToEquippedItem) da player.js // Aggiunto applyWearToEquippedItem
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
        // TODO: Evento speciale inizio gioco? Gestito in game_core.js initializeGame per ora.
        return;
    }
     if (tileSymbol === TILE_SYMBOLS.END) {
         // La logica di fine gioco (EndGame) è già stata chiamata in movePlayer.
         return;
     }


    // Trova la chiave testuale corrispondente al simbolo del tile (es. '.' -> 'PLAINS').
    const tileKey = Object.keys(TILE_SYMBOLS).find(k => TILE_SYMBOLS[k] === tileSymbol);
    if (!tileKey || !EVENT_DATA[tileKey]) {
        return; // Nessun dato evento definito per questo tipo di casella.
    }

    // Recupera la lista di eventi possibili per questo tipo di casella.
    let eventPool = EVENT_DATA[tileKey];
    // Recupera la probabilità base che un evento specifico del tile accada.
    const eventChance = EVENT_CHANCE[tileKey] || 0; // Default a 0 se non definita.

    // --- ATTIVAZIONE FORZATA EVENTO DIURNO PER REST_STOP ('R') ---
    if (tileKey === 'REST_STOP' && isDay) {
        // Cerca l'evento specifico diurno per 'R'
        // AGGIUNTO CONTROLLO FLAG EVENTO GIORNALIERO COMPLETATO
        if (map[player.y] && map[player.y][player.x] && map[player.y][player.x].dayEventDone) {
            return; // Evento già fatto oggi per questo tile
        }

        const dayEvent = eventPool.find(event => event.id === 'rest_stop_day_interaction'); // Usa l'ID corretto
        if (dayEvent) {
            showEventPopup(dayEvent); // Mostra l'evento diurno
            return; // Esci dalla funzione, evento attivato
        } else {
            console.warn("triggerTileEvent: Evento diurno 'rest_stop_day_interaction' non trovato in EVENT_DATA.REST_STOP!");
        }
    }
    // Il resto della funzione (eventi unici, check chance, eventi standard) verrà eseguito SOLO se non è 'R' di giorno.
    // O se l'evento specifico diurno 'R' non è stato trovato (caso di errore).

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

    // Filtra dalla pool filtrata eventuali eventi che non dovrebbero più accadere
    // (es. se un evento è stato progettato per accadere una sola volta ma non ha il flag isUnique per qualche ragione).
    // Per ora non abbiamo eventi standard one-time che non siano "isUnique".
    // Potremmo aggiungere logica qui in futuro se necessario.

    // Se la pool di eventi filtrata è vuota o la probabilità non si verifica, non fare nulla.
    if (eventPool.length === 0 || Math.random() > eventChance) {
        return;
    }

    // Seleziona un evento casuale dalla pool standard FILTRATA.
    const randomEvent = getRandomText(eventPool); // Usa la utility getRandomText sulla pool filtrata

    // Mostra l'evento selezionato (se valido).
    if (randomEvent) {
         showEventPopup(randomEvent); // showEventPopup imposta eventScreenActive = true.
    } else {
         console.warn(`triggerTileEvent: Selezione casuale evento standard ha ritornato null o undefined per tile type '${tileSymbol}'.`);
    }
}


/**
 * Tenta di attivare un evento complesso generico (Predatori, Animali, etc.).
 * Viene chiamato da movePlayer (map.js) SOLO se un evento specifico del tile NON è stato attivato.
 * Dipende da: game_constants.js (gameActive, eventScreenActive, COMPLEX_EVENT_CHANCE, COMPLEX_EVENT_TYPE_WEIGHTS, TILE_SYMBOLS, ...costanti esiti/probabilità danni/loot),
 * game_data.js (...descrizioni eventi complessi arrays, tipiBestie), game_utils.js (addMessage, getRandomText, performSkillCheck, chooseWeighted, getSkillCheckLikelihood, getRandomInt),
 * ui.js (showEventPopup, renderStats), player.js (addItemToInventory, removeItemFromInventory, checkRepairMaterials, applyRepair, checkAmmoAvailability, consumeAmmo, applyWearToEquippedItem), // Aggiunto applyWearToEquippedItem
 * map.js (transitionToDay, transitionToNight), game_core.js (endGame).
 * @param {string} tileSymbol - Il simbolo del tipo di casella su cui si trova il giocatore.
 */
function triggerComplexEvent(tileSymbol) {
    // Non attivare se un popup è già attivo (garantito da movePlayer chiamante), gioco non attivo, o tile non valido.
    if (!gameActive || !tileSymbol) return; // eventScreenActive controllato dal chiamante

    // Non attivare eventi complessi generici nei rifugi sicuri (Villaggi, Città, Aree Sosta).
    // Gli eventi specifici del tile (EVENT_DATA) gestiranno gli incontri/opportunità in questi luoghi.
    if (SHELTER_TILES.includes(tileSymbol)) {
         return;
    }

    // Controlla probabilità base che un evento complesso generico accada a questo passo.
    // Questa costante (COMPLEX_EVENT_CHANCE) è definita in game_constants.js.
    if (Math.random() > COMPLEX_EVENT_CHANCE) {
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
                {
                    text: "Fuggi",
                    skillCheck: { stat: 'agilita', difficulty: !isDay ? 13 : 12 },
                    actionKey: 'fuga',
                    successText: "Con uno scatto improvviso e sfruttando il caos, riesci a seminare i tuoi inseguitori e a trovare un riparo temporaneo nell'ombra.",
                    failureText: getRandomText(esitiFugaPredoniKo) // Definito in game_data.js
                },
                {
                    text: "Combatti",
                    skillCheck: { stat: 'potenza', difficulty: SHELTER_TILES.includes(tileSymbol) ? 13 : 14 },
                    actionKey: 'lotta',
                    successText: "La tua ferocia li sorprende! Dopo uno scontro brutale, riesci ad abbatterne o a mettere in fuga abbastanza da sopravvivere.",
                    failureText: "Sono troppi o troppo forti. Vieni sopraffatto nello scontro."
                },
                {
                    text: "Prova a parlare",
                    skillCheck: { stat: 'influenza', difficulty: !isDay ? 14 : 13 },
                    actionKey: 'parla',
                    successText: "Inaspettatamente, le tue parole sembrano fare breccia. Forse vedono un riflesso della loro stessa disperazione, o semplicemente decidono che non vali la pena. Ti lasciano andare, per ora.",
                    failureText: getRandomText(esitiParlaPredoniKo) // Definito in game_data.js
                }
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
            // Verifica se dilemmaEvents esiste ed è popolato
             if (typeof dilemmaEvents === 'undefined' || !Array.isArray(dilemmaEvents) || dilemmaEvents.length === 0) {
                 console.warn("triggerComplexEvent (DILEMMA): L'array 'dilemmaEvents' non è definito o è vuoto in game_data.js. Uso placeholder.");
                 // Fallback alla vecchia logica placeholder
                 eventTitle = "Dilemma Morale";
                 eventDescription = "Ti trovi di fronte a una scelta difficile...";
                 eventChoices = [
                     { text: "Indaga e Intervieni (Presagio)", skillCheck: { stat: 'presagio', difficulty: !isDay ? 14 : 13 }, actionKey: 'intervieni_placeholder' }, // Nota: actionKey modificata per chiarezza fallback
                     { text: "Ignora e prosegui", outcome: getRandomText(esitiSeguiTracceOkNulla), actionKey: 'ignora' }
                 ];
             } else {
                 // Seleziona casualmente uno scenario da dilemmaEvents
                 const randomDilemmaEvent = getRandomText(dilemmaEvents);

                 if (randomDilemmaEvent && randomDilemmaEvent.id) {
                     // Scenario valido selezionato
                     eventTitle = randomDilemmaEvent.title;
                     eventDescription = randomDilemmaEvent.description;
                     eventChoices = randomDilemmaEvent.choices;
                     // Aggiungi lo scenario specifico al contesto per handleEventChoice
                     context.specificDilemma = randomDilemmaEvent;
                 } else {
                     console.warn("triggerComplexEvent (DILEMMA): getRandomText(dilemmaEvents) ha fallito la selezione. Esco.");
                     eventType = null; // Imposta eventType a null per prevenire la visualizzazione del popup
                 }
            }

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
        case 'HUNT_SUCCESS_RAW_MEAT':
            // Caso speciale: caccia successo, ottieni carne cruda
            // La descrizione dell'esito è gestita da getRandomText(descrizioniCacciaSuccessoCarne)
            // Qui assegniamo direttamente la ricompensa.
            const rewardFeedbackMeat = applyChoiceReward({ itemId: 'meat_raw', quantity: 1 });
            combinedOutcome = `${outcomeText}${rewardFeedbackMeat}`;
            outcomeMessageType = 'success';
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
    }

    // Mostra il popup evento utilizzando la funzione UI.
    // showEventPopup imposta eventScreenActive = true e gamePaused = true.
    if (eventData && typeof showEventPopup === 'function') {
         showEventPopup(eventData);
    } else if (eventData) { // eventData esiste ma showEventPopup no
         console.error("triggerComplexEvent: showEventPopup non disponibile in ui.js!");
         addMessage("Errore interno nel sistema eventi.", "danger");
    }

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

        // Gestione ricompensa singola (itemId) o multipla (items array)
        if (rewardData.itemId) {
            // Verifica se l'itemId esiste in ITEM_DATA prima di tentare di aggiungerlo
            if (ITEM_DATA[rewardData.itemId]) {
                addItemToInventory(rewardData.itemId, rewardData.quantity || 1);
                const itemInfo = ITEM_DATA[rewardData.itemId];
                // Messaggio di default se non specificato nel rewardData, altrimenti usa quello dell'evento
                // addMessage(`Hai ottenuto: ${itemInfo.name}${(rewardData.quantity || 1) > 1 ? ' (x' + (rewardData.quantity || 1) + ')' : ''}.`, 'success');
            } else {
                // ITEM ID NON TROVATO!
                console.warn(`applyChoiceReward: Item ID '${rewardData.itemId}' non trovato in ITEM_DATA. Ricompensa non aggiunta.`);
                addMessage(`Hai trovato degli appunti o un oggetto indecifrabile che non puoi utilizzare.`, 'lore'); // Messaggio generico per il giocatore
            }
        } else if (rewardData.items && Array.isArray(rewardData.items)) {
            rewardData.items.forEach(itemReward => {
                if (itemReward.type && itemReward.type.startsWith('random_')) {
                    handleRandomRewardType(itemReward.type, itemReward.quantity || 1);
                } else if (itemReward.itemId) {
                    // Verifica anche qui se l'itemId esiste
                    if (ITEM_DATA[itemReward.itemId]) {
                        addItemToInventory(itemReward.itemId, itemReward.quantity || 1);
                        // const itemInfo = ITEM_DATA[itemReward.itemId];
                        // addMessage(`Hai ottenuto: ${itemInfo.name}${(itemReward.quantity || 1) > 1 ? ' (x' + (itemReward.quantity || 1) + ')' : ''}.`, 'success');
                    } else {
                        console.warn(`applyChoiceReward (multiple items): Item ID '${itemReward.itemId}' non trovato in ITEM_DATA. Ricompensa specifica non aggiunta.`);
                        addMessage(`Hai trovato qualcosa di rotto o appunti illeggibili.`, 'lore');
                    }
                }
            });
        }

        // Gestione effetto diretto (es. recupero HP, cambiamento status)
        // ... existing code ...
    }

    /**
     * Gestisce il conferimento di un tipo di ricompensa casuale.
     * @param {string} rewardType - Es. 'random_common_resource', 'random_medical_item', 'random_clothing_item'.
     * @param {number} quantity - La quantità da dare.
     */
    function handleRandomRewardType(rewardType, quantity) {
        let foundItemId = null;
        let foundItemName = "un oggetto casuale"; // Default
        let chosenItem = null; // Per i risultati di chooseWeighted

        // Assicurati che RANDOM_REWARD_POOLS sia accessibile.
        // Se non lo fosse, questa funzione non potrebbe funzionare correttamente per la maggior parte dei tipi.
        if (typeof RANDOM_REWARD_POOLS === 'undefined' && rewardType !== 'random_clothing_item') {
            console.error(`handleRandomRewardType: RANDOM_REWARD_POOLS non è definito! Impossibile trovare ricompense casuali per tipo '${rewardType}'.`);
            addMessage(`Errore interno: impossibile generare ricompensa casuale.`, 'danger');
            return;
        }
        if (typeof ITEM_DATA === 'undefined') {
            console.error(`handleRandomRewardType: ITEM_DATA non è definito! Impossibile trovare ricompense casuali per tipo '${rewardType}'.`);
            addMessage(`Errore interno: dati oggetti mancanti.`, 'danger');
            return;
        }


        switch (rewardType) {
            case 'random_common_resource':
                if (RANDOM_REWARD_POOLS.COMMON_RESOURCE && RANDOM_REWARD_POOLS.COMMON_RESOURCE.length > 0) {
                    chosenItem = chooseWeighted(RANDOM_REWARD_POOLS.COMMON_RESOURCE);
                }
                break;
            case 'random_rare_resource':
                if (RANDOM_REWARD_POOLS.RARE_RESOURCE && RANDOM_REWARD_POOLS.RARE_RESOURCE.length > 0) {
                    chosenItem = chooseWeighted(RANDOM_REWARD_POOLS.RARE_RESOURCE);
                }
                break;
            case 'random_medical_item':
                if (RANDOM_REWARD_POOLS.MEDICAL_ITEM && RANDOM_REWARD_POOLS.MEDICAL_ITEM.length > 0) {
                    chosenItem = chooseWeighted(RANDOM_REWARD_POOLS.MEDICAL_ITEM);
                }
                break;
            case 'random_food_item':
                if (RANDOM_REWARD_POOLS.FOOD_ITEM && RANDOM_REWARD_POOLS.FOOD_ITEM.length > 0) {
                    chosenItem = chooseWeighted(RANDOM_REWARD_POOLS.FOOD_ITEM);
                }
                break;
            case 'random_water_item':
                if (RANDOM_REWARD_POOLS.WATER_ITEM && RANDOM_REWARD_POOLS.WATER_ITEM.length > 0) {
                    chosenItem = chooseWeighted(RANDOM_REWARD_POOLS.WATER_ITEM);
                }
                break;
            case 'random_blueprint': // NUOVO CASE
                if (typeof BLUEPRINT_POOL !== 'undefined' && BLUEPRINT_POOL && BLUEPRINT_POOL.length > 0) { // Aggiunto check per undefined
                    chosenItem = chooseWeighted(BLUEPRINT_POOL);
                }
                break;
            case 'random_weapon_item':
                if (RANDOM_REWARD_POOLS.RANDOM_WEAPON_POOL && RANDOM_REWARD_POOLS.RANDOM_WEAPON_POOL.length > 0) {
                    chosenItem = chooseWeighted(RANDOM_REWARD_POOLS.RANDOM_WEAPON_POOL);
                }
                break;
            case 'random_ammo_item':
                if (RANDOM_REWARD_POOLS.RANDOM_AMMO_POOL && RANDOM_REWARD_POOLS.RANDOM_AMMO_POOL.length > 0) {
                    chosenItem = chooseWeighted(RANDOM_REWARD_POOLS.RANDOM_AMMO_POOL);
                }
                break;
            case 'random_clothing_item': // Gestione specifica per abbigliamento
                const allItems = Object.values(ITEM_DATA);
                if (allItems.length > 0) {
                    const randomClothingItem = getRandomText(allItems); // getRandomText dovrebbe restituire un oggetto item completo
                    if (randomClothingItem && randomClothingItem.id) {
                        foundItemId = randomClothingItem.id;
                    } else {
                        console.warn(`handleRandomRewardType: getRandomText(allItems) non ha restituito un item valido.`);
                    }
                } else {
                     console.warn(`handleRandomRewardType: Nessun oggetto di tipo 'armor' o categoria 'Clothing' trovato in ITEM_DATA per 'random_clothing_item'.`);
                }
                break;
            default:
                console.warn(`handleRandomRewardType: Tipo di ricompensa casuale sconosciuto: '${rewardType}'.`);
                addMessage(`Non hai trovato nulla di utile (tipo sconosciuto: ${rewardType}).`, 'warning');
                return; // Esci dalla funzione se il tipo non è gestito
        }

        if (chosenItem && chosenItem.id) {
            foundItemId = chosenItem.id;
        }
        // Per 'random_clothing_item', foundItemId è già impostato se trovato.

        if (foundItemId) {
            const itemDefinition = ITEM_DATA[foundItemId];
            if (itemDefinition) { // Verifica aggiuntiva che l'ID esista in ITEM_DATA
                foundItemName = itemDefinition.name;
                addItemToInventory(foundItemId, quantity);
                addMessage(`Hai trovato ${quantity}x ${foundItemName} (casuale).`, 'success');
            } else {
                console.error(`handleRandomRewardType: ID oggetto '${foundItemId}' (determinato per tipo '${rewardType}') non trovato in ITEM_DATA.`);
                addMessage(`Errore: oggetto casuale non valido.`, 'danger');
            }
        } else {
            // Questo log è utile se un pool è vuoto o chooseWeighted/getRandomText fallisce
            console.log(`handleRandomRewardType: Nessun oggetto specifico trovato per il tipo casuale '${rewardType}'. Potrebbe essere intenzionale se il pool è vuoto o la selezione non ha avuto successo.`);
            addMessage(`Non hai trovato nulla di utile questa volta.`, 'neutral');
        }
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
                    // Verifica che l'armatura abbia un valore e non sia già rotta per applicare riduzione e usura
                    if (armorInfo.armorValue && armorInfo.armorValue > 0 && (armorInfo.durability === undefined || armorInfo.durability > 0)) {
                        const reductionFactor = isMentalHorror ? ARMOR_HORROR_REDUCTION_FACTOR : ARMOR_DAMAGE_REDUCTION_FACTOR;
                        damageReduction = Math.round(armorInfo.armorValue * reductionFactor); // Arrotonda la riduzione
                        finalDamage = Math.max(0, baseDamage - damageReduction); // Danno minimo 0

                        // APPLICA USURA ARMOR SE IL DANNO È STATO EFFETTIVAMENTE RIDOTTO
                        if (damageReduction > 0) { // Solo se l'armatura ha fatto qualcosa
                            if (typeof applyWearToEquippedItem === 'function') {
                                applyWearToEquippedItem('equippedArmor', 1); // Applica 1 punto di usura
                            } else {
                                console.error("applyPenalty: Funzione applyWearToEquippedItem non trovata!");
                            }
                        }
                    } else {
                        // L'armatura è equipaggiata ma non ha valore o è rotta, nessuna riduzione/usura.
                        finalDamage = baseDamage;
                    }
                } else {
                    // Nessuna armatura equipaggiata
                    finalDamage = baseDamage;
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
                    return feedback; // <<<< MODIFICA 2: AGGIUNTO RETURN
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

            case 'nothing':
                feedback = "(Nessuna conseguenza negativa di rilievo.)";
                messageType = 'info';
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
    } // Chiusura corretta per applyPenalty

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
                console.warn("performRestStopNightLootCheck: chooseWeighted non ha restituito un loot valido dalla tabella SHELTER_INSPECT_LOOT_WEIGHTS."); // Mantenuto warn
            }
        } else {
            // 4. Nessun loot trovato
            addMessage("Riposi senza trovare nulla di particolare nel rifugio.", 'info');
        }
        // Nessun aggiornamento UI diretto necessario qui, dovrebbe essere gestito dopo la chiamata a questa funzione (in closeEventPopup)
    } // Chiusura corretta per performRestStopNightLootCheck

    // Controlla se il giocatore è morto dopo l'esito dell'evento.
    if (player.hp <= 0) {
        // endGame è già chiamata dentro applyPenalty se il danno porta a morte.
        return; // Esci per evitare ulteriori elaborazioni
    }
} // <--- Parentesi graffa di chiusura per handleEventChoice

/**
 * TheSafePlace - Roguelike Postapocalittico
 * Versione: v0.8.5-consolidated
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
    if (eventData && typeof showEventPopup === 'function') {
         showEventPopup(eventData);
    } else if (eventData) {
         console.error("triggerComplexEvent: showEventPopup non disponibile in ui.js!");
         addMessage("Errore interno nel sistema eventi.", "danger");
    }
}

// --- FUNZIONI HELPER PER GLI ESITI DEGLI EVENTI ---
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
// Fine describeWeaponDamage

function applyChoiceReward(rewardData) {
    if (!rewardData) {
        console.warn("applyChoiceReward: rewardData è null o undefined.");
        return "";
    }

    let feedbackMessage = "";

    // Gestione ricompense singole (itemId diretto)
    if (rewardData.itemId) {
        const success = addItemToInventory(rewardData.itemId, rewardData.quantity || 1);
        if (success) {
            const itemInfo = ITEM_DATA[rewardData.itemId];
            const itemName = itemInfo ? itemInfo.name : rewardData.itemId;
            feedbackMessage += `Hai ottenuto ${itemName}`;
            if (rewardData.quantity > 1) {
                feedbackMessage += ` (x${rewardData.quantity})`;
            }
            feedbackMessage += ". ";
        }
        return feedbackMessage;
    }

    // Gestione ricompense multiple (array items)
    if (rewardData.items && Array.isArray(rewardData.items)) {
        rewardData.items.forEach(item => {
            if (item.itemId) {
                // Oggetto normale
                const success = addItemToInventory(item.itemId, item.quantity || 1);
                if (success) {
                    const itemInfo = ITEM_DATA[item.itemId];
                    const itemName = itemInfo ? itemInfo.name : item.itemId;
                    feedbackMessage += `Hai ottenuto ${itemName}`;
                    if (item.quantity > 1) {
                        feedbackMessage += ` (x${item.quantity})`;
                    }
                    feedbackMessage += ". ";
                }
            } else if (item.type) {
                // Oggetto casuale da tabella
                const randomItem = getRandomItemFromType(item.type);
                if (randomItem) {
                    const success = addItemToInventory(randomItem, item.quantity || 1);
                    if (success) {
                        const itemInfo = ITEM_DATA[randomItem];
                        const itemName = itemInfo ? itemInfo.name : randomItem;
                        feedbackMessage += `Hai ottenuto ${itemName}`;
                        if (item.quantity > 1) {
                            feedbackMessage += ` (x${item.quantity})`;
                        }
                        feedbackMessage += ". ";
                    }
                }
            }
        });
        return feedbackMessage;
    }

    // Gestione ricompense da tabella pesata
    if (rewardData.type === 'random_from_table' && rewardData.table) {
        const lootTable = Object.keys(rewardData.table).map(id => ({
            id: id,
            weight: rewardData.table[id]
        }));
        
        if (lootTable.length > 0 && typeof chooseWeighted === 'function') {
            const chosenLoot = chooseWeighted(lootTable);
            if (chosenLoot && chosenLoot.id) {
                const success = addItemToInventory(chosenLoot.id, rewardData.quantity || 1);
                if (success) {
                    const itemInfo = ITEM_DATA[chosenLoot.id];
                    const itemName = itemInfo ? itemInfo.name : chosenLoot.id;
                    feedbackMessage += `Hai ottenuto ${itemName}`;
                    if (rewardData.quantity > 1) {
                        feedbackMessage += ` (x${rewardData.quantity})`;
                    }
                    feedbackMessage += ". ";
                }
            }
        }
        return feedbackMessage;
    }

    // Gestione tipi casuali singoli
    if (rewardData.type) {
        const randomItem = getRandomItemFromType(rewardData.type);
        if (randomItem) {
            const success = addItemToInventory(randomItem, rewardData.quantity || 1);
            if (success) {
                const itemInfo = ITEM_DATA[randomItem];
                const itemName = itemInfo ? itemInfo.name : randomItem;
                feedbackMessage += `Hai ottenuto ${itemName}`;
                if (rewardData.quantity > 1) {
                    feedbackMessage += ` (x${rewardData.quantity})`;
                }
                feedbackMessage += ". ";
            }
        }
        return feedbackMessage;
    }

    console.warn("applyChoiceReward: Formato rewardData non riconosciuto:", rewardData);
    return "";
}

// Funzione helper per ottenere oggetti casuali da tipo
function getRandomItemFromType(type) {
    if (!RANDOM_ITEM_TABLES || !RANDOM_ITEM_TABLES[type]) {
        console.warn(`getRandomItemFromType: Tabella '${type}' non trovata in RANDOM_ITEM_TABLES.`);
        return null;
    }

    const table = RANDOM_ITEM_TABLES[type];
    const lootTable = Object.keys(table).map(id => ({
        id: id,
        weight: table[id]
    }));

    if (lootTable.length > 0 && typeof chooseWeighted === 'function') {
        const chosen = chooseWeighted(lootTable);
        return chosen ? chosen.id : null;
    }

    return null;
}

function applyPenalty(penaltyObject) {
    if (!penaltyObject || !penaltyObject.type) {
        console.warn("applyPenalty: penaltyObject non valido o senza tipo.");
        return "";
    }

    let feedbackMessage = "";

    switch (penaltyObject.type) {
        case 'damage':
            const damageAmount = penaltyObject.amount || 1;
            const oldHp = player.hp;
            player.hp = Math.max(0, player.hp - damageAmount);
            const actualDamage = oldHp - player.hp;
            
            if (actualDamage > 0) {
                feedbackMessage = `Subisci ${Math.floor(actualDamage)} danni`;
                if (player.hp <= 0) {
                    feedbackMessage += " e crolli a terra!";
                    if (typeof endGame === 'function') {
                        endGame("Sei morto a causa delle ferite subite.");
                    }
                    gameActive = false;
                    return feedbackMessage;
                }
            }
            break;

        case 'status':
            const status = penaltyObject.status;
            if (status === 'isSick' && !player.isSick) {
                player.isSick = true;
                feedbackMessage = "Ti senti male e febbricitante";
            } else if (status === 'isPoisoned' && !player.isPoisoned) {
                player.isPoisoned = true;
                feedbackMessage = "Sei stato avvelenato";
            } else if (status === 'isInjured' && !player.isInjured) {
                player.isInjured = true;
                feedbackMessage = "Sei ferito";
            } else {
                feedbackMessage = `Sei già affetto da ${status.replace('is', '')}`;
            }
            break;

        case 'resource_loss':
            const resourceType = penaltyObject.resource_type;
            const lossAmount = penaltyObject.amount || 1;
            
            if (player.hasOwnProperty(resourceType)) {
                const oldValue = player[resourceType];
                player[resourceType] = Math.max(0, player[resourceType] - lossAmount);
                const actualLoss = oldValue - player[resourceType];
                
                if (actualLoss > 0) {
                    const resourceName = resourceType === 'hp' ? 'HP' : 
                                       resourceType.charAt(0).toUpperCase() + resourceType.slice(1);
                    feedbackMessage = `Perdi ${Math.floor(actualLoss)} ${resourceName}`;
                }
            }
            break;

        case 'item_loss':
            const itemId = penaltyObject.itemId;
            const quantity = penaltyObject.quantity || 1;
            
            if (removeItemFromInventory(itemId, quantity)) {
                const itemInfo = ITEM_DATA[itemId];
                const itemName = itemInfo ? itemInfo.name : itemId;
                feedbackMessage = `Perdi ${itemName}`;
                if (quantity > 1) {
                    feedbackMessage += ` (x${quantity})`;
                }
            } else {
                feedbackMessage = "Non hai l'oggetto richiesto da perdere";
            }
            break;

        case 'equipment_damage':
            const equipmentSlot = penaltyObject.equipmentSlot || 'equippedWeapon';
            const wearAmount = penaltyObject.amount || 1;
            
            if (player[equipmentSlot] && typeof applyWearToEquippedItem === 'function') {
                applyWearToEquippedItem(equipmentSlot, wearAmount);
                const itemInfo = ITEM_DATA[player[equipmentSlot].itemId];
                const itemName = itemInfo ? itemInfo.name : 'equipaggiamento';
                feedbackMessage = `${itemName} subisce danni`;
            }
            break;

        case 'danger':
            // Tipo speciale: indica pericolo generico senza effetto meccanico immediato
            // Usato per eventi che creano tensione narrativa
            feedbackMessage = penaltyObject.description || "Hai attirato attenzioni pericolose";
            break;

        default:
            console.warn(`applyPenalty: Tipo penalità '${penaltyObject.type}' non riconosciuto.`);
            feedbackMessage = "Subisci una penalità sconosciuta";
            break;
    }

    // Aggiorna le statistiche dopo aver applicato la penalità
    if (typeof renderStats === 'function') {
        renderStats();
    }

    return feedbackMessage;
}

// --- FINE FUNZIONI HELPER EVENTI ---

// --- FUNZIONE PRINCIPALE PER GESTIRE LA SCELTA DELL'EVENTO ---
function handleEventChoice(choiceIndex) {
    if (typeof DEBUG_MODE !== 'undefined' && DEBUG_MODE) console.log(`[handleEventChoice] CHIAMATA con choiceIndex: ${choiceIndex}`);
    if (!currentEventContext || !Array.isArray(currentEventChoices) || choiceIndex < 0 || choiceIndex >= currentEventChoices.length) {
        console.error(`[handleEventChoice] ERRORE: Dati evento/scelta non validi. Indice: ${choiceIndex}, Scelte:`, JSON.stringify(currentEventChoices), "Contesto:", JSON.stringify(currentEventContext));
        addMessage("Errore nell'elaborazione della scelta dell'evento.", "danger");
        if (typeof closeEventPopup === 'function') closeEventPopup();
        return;
    }

    const choice = currentEventChoices[choiceIndex];
    if (!choice) { 
        console.error(`[handleEventChoice] ERRORE: Oggetto choice è null o undefined per choiceIndex: ${choiceIndex}`); 
        if (typeof closeEventPopup === 'function') closeEventPopup();
        return; 
    }
    
    if (typeof DEBUG_MODE !== 'undefined' && DEBUG_MODE) console.log('[handleEventChoice] Scelta selezionata:', JSON.stringify(choice));

    const specificDilemmaData = currentEventContext?.context?.specificDilemma;
    const eventType = currentEventContext.type;
    const isSearchAction = choice.isSearchAction || false;
    const actionKey = choice.actionKey;
    const customTimeCost = choice.timeCost;

    const currentTileSymbol = map[player.y]?.[player.x]?.type;
    if (!currentTileSymbol) {
        console.error("[handleEventChoice] ERRORE: Impossibile ottenere currentTileSymbol!");
    }

    if (isSearchAction) {
        let timeToPass = SEARCH_TIME_COST; 
        if (typeof customTimeCost === 'number' && customTimeCost > 0) {
            timeToPass = customTimeCost; 
        }

        if (typeof timeToPass === 'number' && timeToPass > 0) {
             for (let i = 0; i < timeToPass; i++) { 
                 if (isDay) {
                     dayMovesCounter++;
                     if (dayMovesCounter >= DAY_LENGTH_MOVES) {
                         if (typeof transitionToNight === 'function') {
                             transitionToNight();
                         } else {
                             console.error("[handleEventChoice] ERRORE: Funzione transitionToNight non trovata!");
                         }
                         break;
                     }
                 }
             }
            addMessage(`L'azione richiede tempo... (${timeToPass} passi)`, 'info'); 
            if (typeof renderStats === 'function') renderStats(); 
        } else {
             console.error("[handleEventChoice] ERRORE: Costo tempo (timeToPass) non valido o non definito!", timeToPass);
        }
    }

    let outcomeTitle = "Risultato";
    let outcomeDescription = "";
    let outcomeCheckDetails = null;
    let outcomeConsequencesText = "";
    let messageType = 'info';

    if (choice.outcome || choice.effect) { 
        if (choice.effect) { 
            outcomeDescription = choice.effect.message || "L'azione ha un effetto.";
            messageType = choice.effect.messageType || 'info'; 

            if (choice.effect.type === 'add_resource' && choice.effect.resource_type === 'hp') {
                const amountToHeal = choice.effect.amount || 1;
                const oldHp = player.hp;
                player.hp = Math.min(player.maxHp, player.hp + amountToHeal);
                const actualHeal = player.hp - oldHp;
                if (actualHeal > 0) { 
                    outcomeConsequencesText += `<br>Recuperi ${Math.floor(actualHeal)} HP.`;
                    if (messageType !== 'danger') messageType = 'success';
                }
                if (typeof renderStats === 'function') renderStats();
            }
            
            if (choice.successReward) { 
                if (typeof applyChoiceReward === 'function') applyChoiceReward(choice.successReward); else console.error("[handleEventChoice] ERRORE: applyChoiceReward non trovata!");
            }
        } else if (choice.outcome) { 
            outcomeDescription = choice.outcome;
            messageType = 'info';
            if (actionKey === 'take_cache' && specificDilemmaData && specificDilemmaData.id === 'dilemma_suspicious_stash') {
                const cacheSafeChance = 0.70; 
                if (Math.random() < cacheSafeChance) {
                    outcomeDescription += "<br>Fortunatamente, sembra tutto a posto.";
                    messageType = 'success';
                    if (choice.successReward) {
                        if (typeof applyChoiceReward === 'function') applyChoiceReward(choice.successReward); else console.error("[handleEventChoice] ERRORE: applyChoiceReward non trovata!");
                    }
                } else {
                    outcomeDescription += "<br>Pessima idea! La scorta era contaminata o una trappola.";
                    messageType = 'danger';
                    const penaltyToApply = specificDilemmaData.choices.find(c => c.actionKey === 'inspect_stash_carefully')?.failurePenalty || { type: 'status', status: Math.random() < 0.5 ? 'isSick' : 'isPoisoned' };
                    if (typeof applyPenalty === 'function') {
                       const penaltyFeedback = applyPenalty(penaltyToApply);
                       if (!gameActive) return; 
                       if (penaltyFeedback) outcomeConsequencesText += `<br>${penaltyFeedback}`;
                    } else { console.error("[handleEventChoice] ERRORE: applyPenalty non trovata!");}
                }
            } else if (choice.successReward) {
                 if (typeof applyChoiceReward === 'function') applyChoiceReward(choice.successReward); else console.error("[handleEventChoice] ERRORE: applyChoiceReward non trovata!");
            }
        }
        addMessage(`${outcomeTitle}. ${outcomeDescription.replace(/<br>/g, '\n')}` + (outcomeConsequencesText ? `\n${outcomeConsequencesText.replace(/<br>/g, '\n')}` : ''), messageType, true);
        if (typeof buildAndShowComplexEventOutcome === 'function') buildAndShowComplexEventOutcome(outcomeTitle, outcomeDescription, null, outcomeConsequencesText, messageType); else console.error("[handleEventChoice] ERRORE: buildAndShowComplexEventOutcome non trovata!");
        return;
    } 
    else if (choice.skillCheck) {
        if (!choice.skillCheck.stat || typeof choice.skillCheck.difficulty !== 'number') {
             console.error(`[handleEventChoice] ERRORE: skillCheck invalido per la scelta:`, JSON.stringify(choice));
             addMessage(`Errore: Check abilità mal definito per la scelta "${choice.text}".`, "danger");
             if (typeof closeEventPopup === 'function') closeEventPopup();
             return;
        }

        const checkResult = performSkillCheck(choice.skillCheck.stat, choice.skillCheck.difficulty);
        outcomeCheckDetails = checkResult.text; 

        if (checkResult.success) {
            outcomeTitle = "Successo!";
            messageType = 'success';
            outcomeDescription = choice.successText || "Hai avuto successo!";
            if (choice.successReward) {
                if (typeof applyChoiceReward === 'function') applyChoiceReward(choice.successReward); else console.error("[handleEventChoice] ERRORE: applyChoiceReward non trovata!");
            }
            // --- INIZIO LOGICA SUCCESSO EVENTI COMPLESSI (SINTETIZZATA DALLA v0.7.17) ---
            if (eventType === 'PREDATOR' && actionKey === 'lotta') { 
                if (typeof describeWeaponDamage === 'function') outcomeConsequencesText += `\n` + describeWeaponDamage(player.equippedWeapon?.itemId, currentTileSymbol); else console.error("[handleEventChoice] ERRORE: describeWeaponDamage non trovata!");
                if (Math.random() < PREDATOR_LOOT_CHANCE && typeof PREDATOR_LOOT_WEIGHTS !== 'undefined' && typeof chooseWeighted === 'function' && typeof applyChoiceReward === 'function') {
                    const lootTable = Object.keys(PREDATOR_LOOT_WEIGHTS).map(id => ({ id: id, weight: PREDATOR_LOOT_WEIGHTS[id] }));
                    if (lootTable.length > 0) {
                        const chosenLoot = chooseWeighted(lootTable);
                        if (chosenLoot && chosenLoot.id) applyChoiceReward({ itemId: chosenLoot.id, quantity: 1 });
                    }
                }
            } else if (eventType === 'ANIMAL' && actionKey === 'attacca') {
                if (typeof describeWeaponDamage === 'function') outcomeConsequencesText += `\n` + describeWeaponDamage(player.equippedWeapon?.itemId, currentTileSymbol); else console.error("[handleEventChoice] ERRORE: describeWeaponDamage non trovata!");
                if (Math.random() < ANIMAL_MEAT_DROP_CHANCE && typeof applyChoiceReward === 'function') applyChoiceReward({ itemId: 'meat_raw', quantity: 1 });
            } else if (eventType === 'TRACKS' && (actionKey === 'segui' || actionKey === 'ispeziona')) {
                const trackOutcomeRoll = Math.random();
                if (trackOutcomeRoll < TRACCE_LOOT_CHANCE) {
                    outcomeDescription = getRandomText(descrizioniTracceOkLoot);
                    if (typeof applyChoiceReward === 'function') applyChoiceReward({ type: 'random_from_table', table: TRACCE_SUCCESS_LOOT_WEIGHTS, quantity: 1 });
                } else if (trackOutcomeRoll < TRACCE_LOOT_CHANCE + TRACCE_LORE_CHANCE) {
                    outcomeDescription = getRandomText(descrizioniTracceOkLore);
                    if (typeof applyChoiceReward === 'function') applyChoiceReward({ itemId: 'lore_fragment_item', quantity: 1 });
                } else {
                    outcomeDescription = getRandomText(descrizioniTracceNothing);
                }
            } else if (eventType === 'ENVIRONMENTAL' && actionKey === 'evita') {
                outcomeDescription = getRandomText(esitiPericoloAmbientaleEvitato);
            } else if (eventType === 'HORROR') {
                if (actionKey === 'fuga') outcomeDescription = getRandomText(esitiOrroreIndicibileFugaOk);
                else if (actionKey === 'affronta') outcomeDescription = getRandomText(esitiOrroreIndicibileAffrontaOk);
            }
            else if (eventType === 'DILEMMA' && specificDilemmaData) { /* Logica Dilemmi Successo come da v0.7.17 */ }
            // --- FINE LOGICA SUCCESSO EVENTI COMPLESSI ---
        } else { // Fallimento del Check
            outcomeTitle = "Fallimento";
            messageType = 'warning';
            outcomeDescription = choice.failureText || "Hai fallito.";
            if (choice.failurePenalty) {
                 if (typeof applyPenalty === 'function') {
                    const penaltyFeedback = applyPenalty(choice.failurePenalty);
                    if (!gameActive) return; 
                    if (penaltyFeedback) outcomeConsequencesText += `<br>${penaltyFeedback}`;
                 } else { console.error("[handleEventChoice] ERRORE: applyPenalty non trovata!");}
            }
            // --- INIZIO LOGICA FALLIMENTO EVENTI COMPLESSI (SINTETIZZATA DALLA v0.7.17) ---
            if (eventType === 'ENVIRONMENTAL') { 
                 outcomeDescription = getRandomText(esitiPericoloAmbientaleColpito);
                 const baseDamage = getRandomInt(ENVIRONMENTAL_FAIL_DAMAGE_MIN, ENVIRONMENTAL_FAIL_DAMAGE_MAX);
                 if (typeof applyPenalty === 'function') {
                    const damageFeedback = applyPenalty({ type: 'damage', amount: baseDamage });
                    if (!gameActive) return;
                    if (damageFeedback) outcomeConsequencesText += `<br>Il pericolo ambientale ti danneggia!${damageFeedback}.`;
                    if (Math.random() < ENVIRONMENTAL_SICKNESS_CHANCE) {
                        const statusFeedback = applyPenalty({ type: 'status', status: 'isSick' });
                        if (!gameActive) return;
                        if (statusFeedback) outcomeConsequencesText += `<br>${statusFeedback}`;
                    }
                 } else { console.error("[handleEventChoice] ERRORE: applyPenalty non trovata!");}
            }
            // ... (altra logica fallimenti eventi come PREDATOR, ANIMAL, HORROR, DILEMMA da v0.7.17) ...
            // --- FINE LOGICA FALLIMENTO EVENTI COMPLESSI ---
        }
        if (!gameActive) return; 

        addMessage(`${outcomeTitle}. ${outcomeDescription.replace(/<br>/g, '\n')}` + (outcomeCheckDetails ? ` (${outcomeCheckDetails.replace(/<br>/g, '\n')})` : '') + (outcomeConsequencesText ? `\n${outcomeConsequencesText.replace(/<br>/g, '\n')}` : ''), messageType, true);
        if (typeof buildAndShowComplexEventOutcome === 'function') buildAndShowComplexEventOutcome(outcomeTitle, outcomeDescription, outcomeCheckDetails, outcomeConsequencesText, messageType); else console.error("[handleEventChoice] ERRORE: buildAndShowComplexEventOutcome non trovata!");

    } else { 
        console.error(`[handleEventChoice] ERRORE: Scelta ${choiceIndex} per evento ${eventType} non ha outcome, effect o skillCheck validi. Scelta:`, JSON.stringify(choice));
        addMessage(`Errore nella gestione dell'esito della scelta: ${choice.text}`, "danger");
        if (typeof closeEventPopup === 'function') closeEventPopup();
    }

    if (choice.usesWeapon === true && player.equippedWeapon && player.equippedWeapon.itemId) {
        if (typeof applyWearToEquippedItem === 'function') {
            applyWearToEquippedItem('equippedWeapon', WEAR_FROM_USAGE); 
        } else {
            console.error("[handleEventChoice] ERRORE: Funzione applyWearToEquippedItem non trovata!");
        }
    }
    if (!gameActive) return;

    if (typeof renderStats === 'function') renderStats();
    if (typeof renderMap === 'function') renderMap(); 
}
// --- FINE DEFINIZIONE FORZATA handleEventChoice ---

function performRestStopNightLootCheck() {
    if (typeof player === 'undefined' || typeof player.presagio === 'undefined') {
        console.error("performRestStopNightLootCheck: Oggetto player o player.presagio non definito.");
        return; 
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

    const baseChance = 0.10;
    const presagioBonus = player.presagio > 10 ? (player.presagio - 10) * 0.02 : 0;
    let lootChance = baseChance + presagioBonus;
    lootChance = Math.max(0.0, Math.min(1.0, lootChance));
    const randomRoll = Math.random();

    if (randomRoll < lootChance) {
        const lootTable = Object.keys(SHELTER_INSPECT_LOOT_WEIGHTS).map(id => ({
            id: id,
            weight: SHELTER_INSPECT_LOOT_WEIGHTS[id]
        }));

        if (lootTable.length === 0) {
             console.warn("performRestStopNightLootCheck: La tabella di loot SHELTER_INSPECT_LOOT_WEIGHTS è vuota o non valida.");
             return; 
        }
        const chosenLoot = chooseWeighted(lootTable);
        if (chosenLoot && chosenLoot.id) {
            const itemInfo = ITEM_DATA[chosenLoot.id];
            const quantity = 1; 
            if (itemInfo) {
                addItemToInventory(chosenLoot.id, quantity);
                addMessage(`Durante il riposo, noti qualcosa di utile nascosto! Trovato: ${itemInfo.name}.`, 'success', true);
            } else {
                console.warn(`performRestStopNightLootCheck: Loot scelto ('${chosenLoot.id}') non trovato in ITEM_DATA.`);
            }
        } else {
            console.warn("performRestStopNightLootCheck: chooseWeighted non ha restituito un loot valido dalla tabella SHELTER_INSPECT_LOOT_WEIGHTS.");
        }
    } else {
        addMessage("Riposi senza trovare nulla di particolare nel rifugio.", 'info');
    }
    if (player.hp <= 0) {
        return; 
    }
} // Fine performRestStopNightLootCheck

if (typeof DEBUG_MODE !== 'undefined' && DEBUG_MODE) { console.log('[events.js] CHECK A FINE FILE: typeof handleEventChoice è:', typeof handleEventChoice, '; typeof triggerTileEvent è:', typeof triggerTileEvent, '; typeof triggerComplexEvent è:', typeof triggerComplexEvent); }
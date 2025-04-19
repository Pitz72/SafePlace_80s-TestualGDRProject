/**
 * The Safe Place - Minimal Roguelike
 * File: event_system.js
 * Descrizione: Contiene le funzioni per la gestione degli eventi e dei popup.
 */

/**
 * Mostra un popup di evento con contenuto e scelte.
 * @param {Object} eventData - I dati dell'evento da mostrare.
 */
function showEventPopup(eventData) {
    if (!eventOverlay || !eventTitle || !eventContent || !eventChoicesContainer) {
        console.error("Riferimenti agli elementi del popup mancanti!");
        return;
    }
    
    // Pulisce le scelte precedenti e resetta il contesto
    eventChoicesContainer.innerHTML = "";
    continueButton.style.display = "none";
    currentEventChoices = [];
    currentEventContext = null;
    
    // Imposta titolo e descrizione
    eventTitle.textContent = eventData.title || "Evento";
    eventContent.innerHTML = eventData.description || "Nessuna descrizione disponibile.";
    
    // Se ci sono scelte, le mostra
    if (eventData.choices && eventData.choices.length > 0) {
        // Memorizza le scelte correnti per l'input da tastiera
        currentEventChoices = eventData.choices;
        
        // Crea bottoni per ogni scelta
        eventData.choices.forEach((choice, index) => {
            const button = document.createElement("button");
            
            // Costruisce il testo del pulsante
            let buttonText = choice.text;
            
            // Se la scelta ha uno skillCheck, mostra la difficoltà
            if (choice.skillCheck) {
                const likelihood = getSkillCheckLikelihood(choice.skillCheck.stat, choice.skillCheck.difficulty);
                buttonText += ` [${choice.skillCheck.stat.toUpperCase()}, ${likelihood}]`;
            }
            
            button.textContent = buttonText;
            button.dataset.choiceIndex = index; // Memorizza l'indice della scelta
            
            // Evidenzia scelte di ricerca se costose in termini di tempo
            if (choice.isSearchAction) {
                button.classList.add('search-action');
            }
            
            // Aggiunge listener per il click
            button.addEventListener("click", function() {
                handleEventChoice(index);
            });
            
            eventChoicesContainer.appendChild(button);
        });
        
        // Aggiorna il contesto dell'evento corrente
        currentEventContext = {
            eventData: eventData,
            type: 'choice' // Indica che è un evento con scelte
        };
    } else {
        // Se non ci sono scelte, mostra il pulsante "Continua"
        continueButton.style.display = "block";
        continueButton.onclick = closeEventPopup;
        
        // Imposta il contesto dell'evento corrente
        currentEventContext = {
            eventData: eventData,
            type: 'info' // Indica che è un evento informativo
        };
    }
    
    // Mostra l'overlay
    eventOverlay.classList.add("visible");
    gameContainer.classList.add("overlay-active");
    
    // Disabilita i controlli di movimento
    disableControls();
    
    // Attiva il flag che indica che un evento è attivo
    eventScreenActive = true;
    
    // Aggiunge gli event listener per i tasti
    document.addEventListener("keydown", handleEventKeyPress);
}

/**
 * Gestisce la scelta del giocatore in un evento.
 * @param {number} choiceIndex - L'indice della scelta selezionata.
 */
function handleEventChoice(choiceIndex) {
    // Verifica se ci sono scelte valide
    if (!currentEventChoices || !currentEventChoices[choiceIndex]) {
        closeEventPopup();
        return;
    }
    
    const choice = currentEventChoices[choiceIndex];
    
    // Resetta le scelte correnti poiché la scelta è stata fatta
    currentEventChoices = [];
    
    // Se la scelta ha un'azione personalizzata, la esegue
    if (choice.action && typeof choice.action === 'function') {
        choice.action();
        return; // Se c'è un'azione, presumibilmente gestirà la chiusura/continuazione
    }
    
    // Se la scelta richiede un check di abilità
    if (choice.skillCheck) {
        // Ottieni i dettagli del check
        const { stat, difficulty } = choice.skillCheck;
        
        // Possibile costo in tempo per le azioni di ricerca
        if (choice.isSearchAction) {
            dayMovesCounter += SEARCH_TIME_COST;
            // Controlla se è notte dopo l'incremento
            if (dayMovesCounter >= DAY_LENGTH_MOVES && isDay) {
                transitionToNight();
            }
        }
        
        // Esegui il check
        const success = performSkillCheck(stat, difficulty);
        
        // Memorizza alcune informazioni per log e debriefing
        const checkResultDetails = {
            stat,
            difficulty,
            success
        };
        
        // Gestisci l'esito del check
        if (success) {
            // Successo
            let outcomeText = choice.successText || "Hai avuto successo!";
            
            // Se c'è una ricompensa, applicala
            if (choice.successReward) {
                const rewardFeedback = applyChoiceReward(choice.successReward);
                if (rewardFeedback) {
                    outcomeText += " " + rewardFeedback;
                }
            }
            
            // Mostra l'esito
            buildAndShowComplexEventOutcome(
                "Successo!",
                outcomeText,
                checkResultDetails,
                choice.consequences,
                "success"
            );
            
        } else {
            // Fallimento
            let outcomeText = choice.failureText || "Hai fallito.";
            
            // Se c'è una penalità, applicala
            if (choice.failurePenalty) {
                // Implementare logica penalità
                // ...
            }
            
            // Mostra l'esito
            buildAndShowComplexEventOutcome(
                "Fallimento",
                outcomeText,
                checkResultDetails,
                choice.consequences,
                "warning"
            );
        }
    } else {
        // Se è un risultato semplice senza check
        let outcomeText = choice.outcome || "Hai fatto una scelta.";
        
        // Se c'è una ricompensa, applicala
        if (choice.successReward) {
            const rewardFeedback = applyChoiceReward(choice.successReward);
            if (rewardFeedback) {
                outcomeText += " " + rewardFeedback;
            }
        }
        
        // Mostra l'esito
        buildAndShowComplexEventOutcome(
            "",  // Titolo vuoto per eventi semplici
            outcomeText,
            null, // Nessun dettaglio check
            choice.consequences,
            "info"
        );
    }
}

/**
 * Mostra l'esito di un evento complesso.
 * @param {string} title - Il titolo dell'esito.
 * @param {string} description - La descrizione dell'esito.
 * @param {Object} checkDetails - Dettagli del check di abilità (se applicabile).
 * @param {string} consequences - Eventuali conseguenze dell'esito.
 * @param {string} messageType - Il tipo di messaggio per lo stile.
 */
function buildAndShowComplexEventOutcome(title, description, checkDetails, consequences, messageType) {
    // Crea una descrizione dell'evento per il pulsante continua
    eventContent.innerHTML = description;
    
    // Pulisce le scelte precedenti per mostrare solo il pulsante continua
    eventChoicesContainer.innerHTML = "";
    
    if (title) {
        eventTitle.textContent = title;
    }
    
    // Mostra il pulsante continua
    continueButton.style.display = "block";
    continueButton.onclick = closeEventPopup;
    
    // Imposta il contesto dell'evento corrente
    currentEventContext = {
        type: 'outcome',
        messageType
    };
    
    // Aggiunge il messaggio al log (se non è già stato aggiunto)
    if (description) {
        addMessage(description, messageType);
    }
}

/**
 * Chiude il popup dell'evento e ripristina i controlli.
 */
function closeEventPopup() {
    // Nasconde il popup
    if (eventOverlay) eventOverlay.classList.remove("visible");
    if (gameContainer) gameContainer.classList.remove("overlay-active");
    
    // Riabilita i controlli di movimento
    enableControls();
    
    // Rimuove gli event listener
    document.removeEventListener("keydown", handleEventKeyPress);
    
    // Disattiva il flag che indica che un evento è attivo
    eventScreenActive = false;
    
    // Resetta il contesto dell'evento
    currentEventContext = null;
    
    // Aggiorna la mappa e le statistiche
    renderMap();
    renderStats();
}

/**
 * Gestisce gli input da tastiera durante un evento.
 * @param {KeyboardEvent} e - L'evento tastiera.
 */
function handleEventKeyPress(e) {
    // Ignora se non c'è un evento attivo
    if (!eventScreenActive) return;
    
    // Se è premuto Escape, chiudi l'evento (se possibile)
    if (e.key === "Escape") {
        // Solo se c'è un pulsante continua visibile
        if (continueButton.style.display === "block") {
            closeEventPopup();
        }
        return;
    }
    
    // Se il tasto è un numero e ci sono scelte disponibili, seleziona quella scelta
    if (e.key >= "1" && e.key <= "9") {
        const index = parseInt(e.key) - 1;
        if (currentEventChoices && index < currentEventChoices.length) {
            handleEventChoice(index);
        }
    }
    
    // Se è premuto Enter e c'è il pulsante continua, cliccalo
    if (e.key === "Enter" && continueButton.style.display === "block") {
        closeEventPopup();
    }
}

/**
 * Gestisce la logica dell'evento sulla casella corrente.
 * @param {string} tile - Il tipo di casella su cui si trova il giocatore.
 */
function triggerTileEvent(tile) {
    // Per sicurezza aggiunge sempre un controllo
    if (!player || !map || !EVENT_DATA) return;

    // Messaggio speciale se il giocatore è sull'uscita di END
    if (tile === TILE_SYMBOLS.END) {
        addMessage("Hai raggiunto il Rifugio! La missione è completata!", "success", true);
        endGame(true);
        return;
    }
    
    // Messaggio speciale se il giocatore è sulla partenza
    if (tile === TILE_SYMBOLS.START && daysSurvived === 0) {
        addMessage("Inizi il tuo viaggio nel desolato Territorio Calmo. Trova il Rifugio per vincere.", "info", true);
        return;
    }
    
    // Per ogni altro tipo di casella, determina l'evento in base al tipo
    let eventList;
    let chance;

    switch (tile) {
        case TILE_SYMBOLS.PLAINS:
            eventList = EVENT_DATA.PLAINS;
            chance = EVENT_CHANCE.PLAINS;
            break;
        case TILE_SYMBOLS.FOREST:
            eventList = EVENT_DATA.FOREST;
            chance = EVENT_CHANCE.FOREST;
            break;
        case TILE_SYMBOLS.RIVER:
            eventList = EVENT_DATA.RIVER;
            chance = EVENT_CHANCE.RIVER;
            break;
        case TILE_SYMBOLS.VILLAGE:
            eventList = EVENT_DATA.VILLAGE;
            chance = EVENT_CHANCE.VILLAGE;
            break;
        case TILE_SYMBOLS.CITY:
            eventList = EVENT_DATA.CITY;
            chance = EVENT_CHANCE.CITY;
            break;
        case TILE_SYMBOLS.REST_STOP:
            eventList = EVENT_DATA.REST_STOP;
            chance = EVENT_CHANCE.REST_STOP;
            break;
        default:
            // Per caselle non mappate, non fare nulla
            return;
    }

    // Se non ci sono eventi per questa casella o la lista è vuota
    if (!eventList || eventList.length === 0) {
        console.log(`Nessun evento disponibile per la casella ${tile}`);
        return;
    }

    // Verifica se l'evento deve accadere
    if (Math.random() > chance) {
        // Nessun evento
        return;
    }

    // Seleziona un evento casuale dalla lista
    const randomEvent = eventList[Math.floor(Math.random() * eventList.length)];
    
    // Mostra l'evento
    showEventPopup(randomEvent);
}

/**
 * Sceglie casualmente un tipo di evento complesso basato sulle probabilità relative.
 * @returns {string} Il tipo di evento scelto.
 */
function chooseWeightedEventType() {
    // Verifica se è notte e aggiusta le probabilità
    let weights = { ...COMPLEX_EVENT_TYPE_WEIGHTS };
    
    // Di notte aumenta la probabilità di eventi horror/predator
    if (!isDay) {
        // Normalizza le probabilità (la somma sarà sempre 1)
        const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
        
        // Raddoppia la probabilità di HORROR di notte
        weights.HORROR *= 2; 
        
        // Aumenta leggermente PREDATOR di notte
        weights.PREDATOR *= 1.5;
        
        // Ricalcola il totale con i pesi modificati
        const newTotalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
        
        // Normalizza i pesi per avere somma 1
        for (let key in weights) {
            weights[key] = weights[key] / newTotalWeight;
        }
    } else {
        // Di giorno, HORROR è molto raro
        weights.HORROR *= 0.2;
        
        // Normalizza i pesi
        const newTotalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
        for (let key in weights) {
            weights[key] = weights[key] / newTotalWeight;
        }
    }
    
    // Seleziona un tipo basato sui pesi
    const rand = Math.random();
    let cumulativeProbability = 0;
    
    for (let type in weights) {
        cumulativeProbability += weights[type];
        if (rand <= cumulativeProbability) {
            return type;
        }
    }
    
    // In caso di errori di arrotondamento, ritorna un tipo predefinito
    return "ENVIRONMENTAL";
}

/**
 * Gestisce la generazione di eventi complessi casuali.
 * @param {string} tile - Il tipo di casella corrente.
 */
function triggerComplexEvent(tile) {
    // Per sicurezza aggiunge sempre un controllo
    if (!player || !map) return;
    
    // Verifica se deve accadere un evento complesso (basato sulla probabilità base)
    if (Math.random() > COMPLEX_EVENT_CHANCE) {
        return; // Nessun evento
    }
    
    // Scegli il tipo di evento in base alle probabilità
    const eventType = chooseWeightedEventType();
    
    // Context object per l'evento
    const eventContext = { 
        type: eventType,
        tile: tile, 
        isNight: !isDay 
    };
    
    // Log per debugging
    console.log(`Evento complesso di tipo ${eventType} generato (${isDay ? "Giorno" : "Notte"})`);
    
    // Mostra l'evento complesso utilizzando la funzione di costruzione
    buildAndShowComplexEvent(eventContext);
}

/**
 * Costruisce e mostra un evento complesso basato sul contesto.
 * @param {Object} eventCtx - Il contesto dell'evento.
 */
function buildAndShowComplexEvent(eventCtx) {
    // Questa è solo una funzione di passaggio che richiama la giusta funzione
    // per il tipo di evento specifico. Nelle vostre funzioni reali, sarete più espliciti.
    
    // Per ora, mostriamo un evento generico, ma dovreste implementare
    // funzioni specifiche per ogni tipo di evento in un'applicazione reale.
    
    // Ottiene i dati specifici per il tipo di evento
    let eventData = null;
    
    switch (eventCtx.type) {
        case "PREDATOR":
            eventData = getRandomPredatorEvent(eventCtx);
            break;
        case "ANIMAL":
            eventData = getRandomAnimalEvent(eventCtx);
            break;
        case "TRACKS":
            eventData = getRandomTracksEvent(eventCtx);
            break;
        case "ENVIRONMENTAL":
            eventData = getRandomEnvironmentalEvent(eventCtx);
            break;
        case "DILEMMA":
            eventData = getRandomDilemmaEvent(eventCtx);
            break;
        case "HORROR":
            eventData = getRandomHorrorEvent(eventCtx);
            break;
        default:
            // Fallback per tipi sconosciuti
            eventData = {
                title: "Evento imprevisto",
                description: "Qualcosa di insolito succede, ma non riesci a comprenderlo appieno.",
                choices: [
                    {
                        text: "Continua",
                        outcome: "Decidi di proseguire con cautela."
                    }
                ]
            };
    }
    
    // Mostra l'evento
    if (eventData) {
        showEventPopup(eventData);
    }
}

/**
 * Applica una ricompensa in base all'oggetto ricompensa fornito.
 * @param {Object} rewardObject - L'oggetto che descrive la ricompensa.
 * @returns {string} Un messaggio che descrive la ricompensa ottenuta.
 */
function applyChoiceReward(rewardObject) {
    if (!rewardObject) return "";
    
    let rewardMessage = "";
    
    // Se rewardObject non ha un tipo definito ma ha itemId, lo trattiamo come tipo 'item'
    if (!rewardObject.type) {
        if (rewardObject.itemId) {
            // È un oggetto senza tipo specificato ma con itemId -> trattiamolo come 'item'
            console.log("Ricompensa con itemId ma senza tipo definito, assumo tipo 'item':", rewardObject);
            rewardObject.type = 'item';
        } else {
            // Non ha né tipo né itemId, non possiamo fare molto
            console.log("Ricompensa senza tipo definito:", rewardObject);
            rewardMessage = "Hai ottenuto una piccola ricompensa.";
            return rewardMessage;
        }
    }
    
    switch(rewardObject.type) {
        case 'item':
            // Ricompensa oggetto specifico
            if (rewardObject.itemId && rewardObject.quantity) {
                addItemToInventory(rewardObject.itemId, rewardObject.quantity);
                
                // Ottiene il nome dell'oggetto per il messaggio
                const itemName = ITEM_DATA[rewardObject.itemId]?.name || rewardObject.itemId;
                rewardMessage = `Hai ottenuto ${rewardObject.quantity} ${itemName}.`;
            }
            break;
            
        case 'random_common_resource':
            // Ricompensa casuale tra cibo/acqua
            const resourceType = Math.random() < 0.5 ? 'food' : 'water';
            const quantity = rewardObject.quantity || 1;
            
            if (resourceType === 'food') {
                const foodItems = ['jerky', 'berries', 'canned_food'];
                const randomItem = foodItems[Math.floor(Math.random() * foodItems.length)];
                addItemToInventory(randomItem, quantity);
                
                // Ottiene il nome dell'oggetto per il messaggio
                const itemName = ITEM_DATA[randomItem]?.name || randomItem;
                rewardMessage = `Hai trovato ${quantity} ${itemName}.`;
            } else {
                const waterItems = ['water_bottle', 'purified_water'];
                const randomItem = waterItems[Math.floor(Math.random() * waterItems.length)];
                addItemToInventory(randomItem, quantity);
                
                // Ottiene il nome dell'oggetto per il messaggio
                const itemName = ITEM_DATA[randomItem]?.name || randomItem;
                rewardMessage = `Hai trovato ${quantity} ${itemName}.`;
            }
            break;
            
        case 'random_lore_fragment':
            // Frammento di lore casuale
            const loreText = findLoreFragment();
            rewardMessage = loreText;
            
            // Aggiunge separatamente al log come messaggio lore
            addMessage(loreText, 'lore');
            break;
            
        case 'heal':
            // Cura il giocatore
            const healAmount = rewardObject.amount || 2;
            player.hp = Math.min(player.hp + healAmount, player.maxHp);
            rewardMessage = `Recuperi ${healAmount} punti salute.`;
            
            // Aggiorna le stats
            renderStats();
            break;
            
        case 'heal_condition':
            // Cura condizioni
            if (rewardObject.condition === 'injury' && player.isInjured) {
                player.isInjured = false;
                rewardMessage = "Le tue ferite sono state curate.";
            } else if (rewardObject.condition === 'sickness' && player.isSick) {
                player.isSick = false;
                rewardMessage = "La tua malattia è stata curata.";
            }
            
            // Aggiorna le stats
            renderStats();
            break;
            
        default:
            console.log("Tipo di ricompensa sconosciuto:", rewardObject.type);
            rewardMessage = "Hai ottenuto una ricompensa sconosciuta.";
    }
    
    return rewardMessage;
}

/**
 * Genera un evento predatore casuale basato sul contesto.
 * @param {Object} eventCtx - Il contesto dell'evento.
 * @returns {Object} Un oggetto evento per un predatore.
 */
function getRandomPredatorEvent(eventCtx) {
    const isNight = eventCtx.isNight;
    
    // Titoli più minacciosi di notte
    const title = isNight 
        ? "Predatore nella notte" 
        : "Predatore all'agguato";
    
    const descriptions = [
        "Scorgi un movimento rapido tra gli alberi. Un predatore si sta avvicinando.",
        "Un rumore di passi pesanti attira la tua attenzione. C'è qualcosa che ti sta cacciando.",
        "Un verso gutturale risuona nei dintorni. Qualcosa di pericoloso sta cercando una preda.",
        "Il tuo istinto ti avverte: non sei solo. Un predatore ti ha puntato."
    ];
    
    // Aggiunge descrizioni più minacciose di notte
    if (isNight) {
        descriptions.push(
            "Nell'oscurità, due occhi luminosi ti fissano. Un predatore affamato ti ha trovato.",
            "Un'ombra si muove silenziosa nella notte. Il predatore è più vicino di quanto pensassi."
        );
    }
    
    // Sceglie una descrizione casuale
    const description = descriptions[Math.floor(Math.random() * descriptions.length)];
    
    // Crea l'evento
    return {
        title: title,
        description: description,
        choices: [
            {
                text: "Intimidisci il predatore",
                skillCheck: {
                    stat: "potenza",
                    difficulty: isNight ? 13 : 11 // Più difficile di notte
                },
                successText: "Ti ergi in tutta la tua statura e urli con forza. Il predatore esita, poi si allontana.",
                failureText: "Tenti di sembrare minaccioso, ma il predatore non sembra impressionato. Si avvicina e ti attacca!",
                successReward: {
                    type: "random_lore_fragment"
                }
            },
            {
                text: "Nasconditi",
                skillCheck: {
                    stat: "agilita",
                    difficulty: 10
                },
                successText: "Ti nascondi rapidamente. Il predatore passa vicino senza notarti.",
                failureText: "Cerchi di nasconderti, ma fai troppo rumore. Il predatore ti trova e attacca!",
                failurePenalty: {
                    type: "damage",
                    amount: 3
                }
            },
            {
                text: "Fuggi rapidamente",
                successText: "Corri più veloce che puoi. Il predatore inizialmente ti insegue, ma poi desiste."
            }
        ]
    };
}

/**
 * Genera un evento animale casuale basato sul contesto.
 * @param {Object} eventCtx - Il contesto dell'evento.
 * @returns {Object} Un oggetto evento per un animale.
 */
function getRandomAnimalEvent(eventCtx) {
    const tile = eventCtx.tile || TILE_SYMBOLS.PLAINS;
    
    // Animali in base al tipo di terreno
    let animalTypes = ["piccolo roditore", "cervo", "volpe"];
    
    if (tile === TILE_SYMBOLS.FOREST) {
        animalTypes = ["cervo", "cinghiale", "scoiattolo", "lupo solitario"];
    } else if (tile === TILE_SYMBOLS.RIVER) {
        animalTypes = ["pesce", "rana", "castoro", "anatra"];
    } else if (tile === TILE_SYMBOLS.MOUNTAIN) {
        animalTypes = ["capra di montagna", "aquila", "marmotta"];
    }
    
    // Sceglie un animale casuale
    const animal = animalTypes[Math.floor(Math.random() * animalTypes.length)];
    
    // Crea l'evento
    return {
        title: `Incontro con un ${animal}`,
        description: `Incontri un ${animal} che sembra relativamente tranquillo. Potresti avvicinarti o lasciarlo in pace.`,
        choices: [
            {
                text: "Avvicinati con cautela",
                skillCheck: {
                    stat: "presagio",
                    difficulty: 9
                },
                successText: `Ti avvicini lentamente al ${animal}, che rimane calmo. Osservi il suo comportamento e impari qualcosa sul territorio.`,
                failureText: `Tenti di avvicinarti, ma il ${animal} si spaventa e fugge rapidamente.`,
                successReward: {
                    type: "random_lore_fragment"
                }
            },
            {
                text: "Tenta di cacciarlo",
                skillCheck: {
                    stat: "potenza",
                    difficulty: 11
                },
                successText: `Riesci a cacciare il ${animal}, ottenendo del cibo fresco.`,
                failureText: `Tenti di cacciare il ${animal}, ma è troppo veloce e fugge.`,
                successReward: {
                    type: "item",
                    itemId: "jerky",
                    quantity: 1
                },
                isSearchAction: true
            },
            {
                text: "Lascialo in pace",
                outcome: `Decidi di non disturbare il ${animal} e prosegui per la tua strada.`
            }
        ]
    };
}

/**
 * Genera un evento tracce casuale basato sul contesto.
 * @param {Object} eventCtx - Il contesto dell'evento.
 * @returns {Object} Un oggetto evento per tracce.
 */
function getRandomTracksEvent(eventCtx) {
    const tile = eventCtx.tile || TILE_SYMBOLS.PLAINS;
    
    // Tipi di tracce in base al terreno
    let trackTypes = [];
    
    if (tile === TILE_SYMBOLS.FOREST || tile === TILE_SYMBOLS.PLAINS) {
        trackTypes = ["impronte umane", "tracce di animali", "segni di accampamento"];
    } else if (tile === TILE_SYMBOLS.RIVER) {
        trackTypes = ["impronte sulla riva", "resti di un pescatore", "segni di un guado"];
    } else if (tile === TILE_SYMBOLS.MOUNTAIN) {
        trackTypes = ["sentiero di montagna", "segni di arrampicata", "vecchio riparo"];
    } else if (tile === TILE_SYMBOLS.VILLAGE || tile === TILE_SYMBOLS.CITY) {
        trackTypes = ["segni di saccheggio", "impronte recenti", "nascondiglio"];
    } else {
        trackTypes = ["tracce misteriose", "impronte strane", "segni di passaggio"];
    }
    
    // Sceglie un tipo di traccia casuale
    const trackType = trackTypes[Math.floor(Math.random() * trackTypes.length)];
    
    // Crea l'evento
    return {
        title: `Hai trovato ${trackType}`,
        description: `Noti ${trackType} nei dintorni. Potresti investigare o ignorarle.`,
        choices: [
            {
                text: "Segui le tracce",
                skillCheck: {
                    stat: "tracce",
                    difficulty: 10
                },
                successText: `Segui ${trackType} con attenzione. Ti conducono a qualcosa di interessante.`,
                failureText: `Tenti di seguire ${trackType}, ma perdi la pista rapidamente.`,
                successReward: {
                    type: "random_common_resource",
                    quantity: 1
                },
                isSearchAction: true
            },
            {
                text: "Ispeziona attentamente",
                skillCheck: {
                    stat: "presagio",
                    difficulty: 9
                },
                successText: `Esamini attentamente ${trackType} e scopri un indizio importante.`,
                failureText: `Esamini ${trackType}, ma non noti nulla di significativo.`,
                successReward: {
                    type: "random_lore_fragment"
                },
                isSearchAction: true
            },
            {
                text: "Ignora e prosegui",
                outcome: `Decidi di ignorare ${trackType} e continui il tuo viaggio.`
            }
        ]
    };
}

/**
 * Genera un evento ambientale casuale basato sul contesto.
 * @param {Object} eventCtx - Il contesto dell'evento.
 * @returns {Object} Un oggetto evento ambientale.
 */
function getRandomEnvironmentalEvent(eventCtx) {
    const tile = eventCtx.tile || TILE_SYMBOLS.PLAINS;
    const isNight = eventCtx.isNight;
    
    // Eventi in base al terreno e all'ora
    let eventOptions = [];
    
    if (tile === TILE_SYMBOLS.FOREST) {
        eventOptions = isNight 
            ? ["tronco caduto", "nebbia improvvisa", "alberi insoliti"] 
            : ["raggio di sole", "frutta selvatica", "corteccia utile"];
    } else if (tile === TILE_SYMBOLS.RIVER) {
        eventOptions = ["corrente rapida", "acqua limpida", "riva fangosa"];
    } else if (tile === TILE_SYMBOLS.MOUNTAIN) {
        eventOptions = isNight 
            ? ["vento gelido", "percorso instabile", "nebbia di montagna"] 
            : ["vista panoramica", "erbe medicinali", "riparo naturale"];
    } else if (tile === TILE_SYMBOLS.PLAINS) {
        eventOptions = isNight 
            ? ["vento freddo", "nebbia bassa", "strana luce distante"] 
            : ["campo fiorito", "terreno fertile", "sorgente d'acqua"];
    } else {
        eventOptions = ["detriti interessanti", "struttura insolita", "oggetto abbandonato"];
    }
    
    // Sceglie un evento casuale
    const eventOption = eventOptions[Math.floor(Math.random() * eventOptions.length)];
    
    // Crea l'evento
    return {
        title: `Hai trovato: ${eventOption}`,
        description: `Ti imbatti in ${eventOption}. Potrebbe essere un'opportunità o un pericolo.`,
        choices: [
            {
                text: "Esamina attentamente",
                skillCheck: {
                    stat: "adattamento",
                    difficulty: 9
                },
                successText: `Esamini attentamente ${eventOption} e scopri qualcosa di utile.`,
                failureText: `Esamini ${eventOption}, ma non trovi nulla di interessante.`,
                successReward: {
                    type: "random_common_resource",
                    quantity: 1
                },
                isSearchAction: true
            },
            {
                text: "Interagisci",
                outcome: `Interagisci con ${eventOption}. L'esperienza ti fa riflettere sul mondo che ti circonda.`,
                successReward: {
                    type: "random_lore_fragment"
                }
            },
            {
                text: "Ignora e prosegui",
                outcome: `Decidi di ignorare ${eventOption} e continui il tuo viaggio.`
            }
        ]
    };
}

/**
 * Genera un evento dilemma casuale basato sul contesto.
 * @param {Object} eventCtx - Il contesto dell'evento.
 * @returns {Object} Un oggetto evento dilemma.
 */
function getRandomDilemmaEvent(eventCtx) {
    // Diversi tipi di dilemmi
    const dilemmas = [
        {
            title: "La strada si divide",
            description: "Il sentiero davanti a te si divide in due direzioni. Una sembra più sicura ma più lunga, l'altra più pericolosa ma diretta.",
            choices: [
                {
                    text: "Prendi la strada sicura",
                    outcome: "Scegli la sicurezza. Il percorso è più lungo, ma eviti potenziali pericoli."
                },
                {
                    text: "Rischia la strada diretta",
                    skillCheck: {
                        stat: "presagio",
                        difficulty: 10
                    },
                    successText: "La strada diretta si rivela una buona scelta. Trovi un passaggio sicuro e qualcosa di utile.",
                    failureText: "La strada diretta è più pericolosa del previsto. Inciampi e ti ferisci leggermente.",
                    successReward: {
                        type: "random_common_resource",
                        quantity: 1
                    },
                    failurePenalty: {
                        type: "damage",
                        amount: 1
                    }
                }
            ]
        },
        {
            title: "Rifugio temporaneo",
            description: "Trovi un piccolo rifugio abbandonato. Sembra sicuro, ma potrebbe essere una trappola o appartenere a qualcuno.",
            choices: [
                {
                    text: "Ispeziona con cautela",
                    skillCheck: {
                        stat: "presagio",
                        difficulty: 10
                    },
                    successText: "Ispezionando attentamente il rifugio, trovi che è sicuro e contiene alcune provviste.",
                    failureText: "Mentre ispezionati il rifugio, fai cadere alcuni detriti e ti ferisci leggermente.",
                    successReward: {
                        type: "random_common_resource",
                        quantity: 1
                    },
                    failurePenalty: {
                        type: "damage",
                        amount: 1
                    },
                    isSearchAction: true
                },
                {
                    text: "Utilizzalo per riposare",
                    outcome: "Decidi di rischiare e utilizzare il rifugio per riposare. Recuperi un po' delle tue forze.",
                    successReward: {
                        type: "heal",
                        amount: 2
                    }
                },
                {
                    text: "Ignora e prosegui",
                    outcome: "Preferisci non rischiare e continui il tuo viaggio."
                }
            ]
        },
        {
            title: "Bagaglio abbandonato",
            description: "Trovi un bagaglio abbandonato. Potrebbe contenere oggetti utili, ma potrebbe anche appartenere a qualcuno nei paraggi.",
            choices: [
                {
                    text: "Prendi tutto",
                    outcome: "Decidi di prendere tutto ciò che trovi nel bagaglio. Ottieni alcune risorse, ma ti senti in colpa.",
                    successReward: {
                        type: "random_common_resource",
                        quantity: 2
                    }
                },
                {
                    text: "Prendi solo l'essenziale",
                    skillCheck: {
                        stat: "influenza",
                        difficulty: 9
                    },
                    successText: "Prendi solo l'essenziale, lasciando il resto. Trovi qualcosa di utile.",
                    failureText: "Mentre cerchi di prendere solo l'essenziale, ti rendi conto che il bagaglio è vuoto.",
                    successReward: {
                        type: "random_common_resource",
                        quantity: 1
                    }
                },
                {
                    text: "Lascia tutto",
                    outcome: "Decidi di rispettare la proprietà altrui e non toccare nulla."
                }
            ]
        }
    ];
    
    // Sceglie un dilemma casuale
    return dilemmas[Math.floor(Math.random() * dilemmas.length)];
}

/**
 * Genera un evento horror casuale basato sul contesto.
 * @param {Object} eventCtx - Il contesto dell'evento.
 * @returns {Object} Un oggetto evento horror.
 */
function getRandomHorrorEvent(eventCtx) {
    const isNight = eventCtx.isNight;
    
    // Eventi horror più intensi di notte
    const horrorEvents = [
        {
            title: isNight ? "Sussurri nell'oscurità" : "Presenza inquietante",
            description: isNight 
                ? "Senti sussurri indistinti provenire dall'oscurità circostante. Non riesci a capire cosa dicano, ma ti mettono a disagio." 
                : "Avverti una presenza inquietante. Qualcosa ti sta osservando, ma non riesci a vedere nulla.",
            choices: [
                {
                    text: "Investiga",
                    skillCheck: {
                        stat: "presagio",
                        difficulty: 12
                    },
                    successText: "Segui la tua intuizione e riesci a comprendere la natura di questa presenza inquietante.",
                    failureText: "Ti avvicini alla fonte dei sussurri. La presenza si intensifica e senti un freddo improvviso. Sei colto dal panico.",
                    successReward: {
                        type: "random_lore_fragment"
                    },
                    failurePenalty: {
                        type: "damage",
                        amount: 2
                    }
                },
                {
                    text: "Resisti mentalmente",
                    skillCheck: {
                        stat: "adattamento",
                        difficulty: 10
                    },
                    successText: "Concentri la tua mente e resisti all'influenza inquietante. La presenza sembra svanire.",
                    failureText: "Tenti di resistere, ma la presenza è troppo forte. Senti la tua mente vacillare per un momento.",
                    failurePenalty: {
                        type: "damage",
                        amount: 1
                    }
                },
                {
                    text: "Allontanati rapidamente",
                    outcome: "Decidi che è meglio non rischiare. Ti allontani rapidamente dalla fonte di inquietudine."
                }
            ]
        },
        {
            title: "Visioni disturbanti",
            description: "Improvvisamente, hai delle visioni inquietanti che sembrano sovrapporsi alla realtà. Figure sfocate si muovono ai margini della tua vista.",
            choices: [
                {
                    text: "Cerca di interpretarle",
                    skillCheck: {
                        stat: "presagio",
                        difficulty: 11
                    },
                    successText: "Concentrandoti sulle visioni, riesci a interpretarne il significato. Trovi una connessione con il territorio circostante.",
                    failureText: "Le visioni diventano più intense e disturbanti. È difficile distinguere cosa sia reale.",
                    successReward: {
                        type: "random_lore_fragment"
                    },
                    failurePenalty: {
                        type: "damage",
                        amount: 1
                    }
                },
                {
                    text: "Ignora le visioni",
                    skillCheck: {
                        stat: "adattamento",
                        difficulty: 9
                    },
                    successText: "Ti concentri sul mondo reale e ignori le visioni. Gradualmente svaniscono.",
                    failureText: "Tenti di ignorare le visioni, ma continuano a perseguitarti. Ti senti mentalmente esausto.",
                    failurePenalty: {
                        type: "damage",
                        amount: 1
                    }
                },
                {
                    text: "Scappa dalla zona",
                    outcome: "Decidi che è meglio allontanarsi da quest'area. Le visioni sembrano diminuire con la distanza."
                }
            ]
        },
        {
            title: isNight ? "Ombre che si muovono" : "Anomalia inquietante",
            description: isNight 
                ? "Noti delle ombre che si muovono in modo innaturale nell'oscurità. Non sembrano corrispondere a nulla di reale." 
                : "C'è qualcosa di sbagliato in questo luogo. La natura stessa sembra distorta e innaturale.",
            choices: [
                {
                    text: "Osserva attentamente",
                    skillCheck: {
                        stat: "presagio",
                        difficulty: 10
                    },
                    successText: "Osservando con attenzione, noti un pattern nel fenomeno anomalo. Comprendi qualcosa di importante.",
                    failureText: "Mentre osservi, il fenomeno sembra intensificarsi. Ti senti vulnerabile e esposto.",
                    successReward: {
                        type: "random_lore_fragment"
                    }
                },
                {
                    text: "Cerca un riparo",
                    outcome: "Cerchi un riparo sicuro e aspetti che il fenomeno passi. Ti senti più al sicuro."
                },
                {
                    text: "Allontanati immediatamente",
                    outcome: "Decidi di allontanarti immediatamente dall'area. Meglio non rischiare."
                }
            ]
        }
    ];
    
    // Sceglie un evento horror casuale
    return horrorEvents[Math.floor(Math.random() * horrorEvents.length)];
}

/**
 * Restituisce un frammento casuale di lore dal mondo di gioco.
 * @returns {string} Un frammento di lore.
 */
function findLoreFragment() {
    // Array di frammenti di lore possibili
    const loreFragments = [
        "Si dice che il Territorio Calmo non sia sempre stato così. Antiche leggende narrano di un tempo in cui questa terra era prospera e piena di vita.",
        
        "Secondo i racconti degli anziani, 'Il Rifugio' è l'ultimo baluardo di sicurezza in un mondo devastato da eventi sconosciuti.",
        
        "Simboli misteriosi incisi sugli alberi... chi li ha lasciati? E perché? Sembrano indicare una direzione, o forse un avvertimento.",
        
        "Le rovine sparse per il territorio non sono casuali. Una volta formavano una rete di insediamenti connessi tra loro, prima della catastrofe.",
        
        "I più vecchi abitanti dei villaggi parlano di 'Guardiani' che un tempo proteggevano queste terre. Alcuni credono che ancora veglino, nascosti.",
        
        "La natura sembra guarire lentamente, ma qualcosa di innaturale permane nell'aria. Come se un'eco di ciò che è accaduto risuonasse ancora.",
        
        "Le stelle qui sembrano diverse, più vicine. I navigatori esperti dicono che alcune costellazioni non corrispondono a nessuna mappa conosciuta.",
        
        "Strani fenomeni luminosi sono stati avvistati nelle notti più buie. Alcuni li chiamano 'Sussurri del Cielo'.",
        
        "I fiumi sembrano seguire percorsi che sfidano la gravità. C'è chi sostiene che l'acqua stessa conservi memoria di ciò che è accaduto.",
        
        "Alcune piante mostrano proprietà insolite, mai documentate prima. Forse si sono adattate a qualcosa che è cambiato nell'ambiente.",
        
        "Rare incisioni trovate sulle rocce di montagna raccontano di un 'Grande Viaggio' intrapreso dai sopravvissuti dopo il 'Giorno del Cambiamento'.",
        
        "Le zone più remote del territorio ospitano creature che non dovrebbero esistere, come se fossero state alterate da qualche forza sconosciuta.",
        
        "I più anziani raccontano che, prima dell'arrivo del silenzio, si potevano sentire voci provenire dal cielo. Ora resta solo il rumore del vento.",
        
        "Antiche mappe mostrano che dove ora ci sono vaste pianure, un tempo c'erano grandi città. Cosa le ha cancellate così completamente?",
        
        "Negli angoli più remoti del territorio, il confine tra realtà e illusione sembra assottigliarsi, soprattutto durante il crepuscolo.",
        
        "Il simbolo inciso sulla corteccia sembra pulsare debolmente al tocco. Senti un lieve calore emanare da esso, come se fosse vivo.",
        
        "L'acqua di alcuni fiumi emette un tenue bagliore blu nelle notti senza luna. Gli animali sembrano evitare di berla.",
        
        "I bambini nati dopo l'evento mostrano talvolta capacità insolite. Alcuni anziani li tengono d'occhio con preoccupazione.",
        
        "Nei villaggi si tramanda la storia del 'Cercatore', l'ultimo a trovare Il Rifugio prima che le sue coordinate andassero perdute.",
        
        "Le più antiche strutture sembrano costruite con tecniche sconosciute, materiali che non si deteriorano con il tempo."
    ];
    
    // Scegli un frammento casuale
    return loreFragments[Math.floor(Math.random() * loreFragments.length)];
} 
/**
 * The Safe Place - Minimal Roguelike
 * File: player_actions.js
 * Descrizione: Contiene le funzioni per le azioni del giocatore come il movimento.
 */

/**
 * Gestisce il movimento del giocatore nella mappa.
 * @param {number} dx - Spostamento orizzontale (-1, 0, 1).
 * @param {number} dy - Spostamento verticale (-1, 0, 1).
 */
function movePlayer(dx, dy) {
    // Non muove il giocatore se il gioco non è attivo, se un evento è attivo o se il gioco è in pausa
    if (!gameActive || eventScreenActive || gamePaused) return;
    
    // Calcola la nuova posizione
    const newX = player.x + dx;
    const newY = player.y + dy;
    
    // Controlla se la nuova posizione è all'interno della mappa
    if (newX < 0 || newX >= MAP_WIDTH || newY < 0 || newY >= MAP_HEIGHT) {
        addMessage("Non puoi andare oltre i confini della mappa.", 'warning');
        return;
    }
    
    // Controlla se la nuova posizione è accessibile
    if (!isWalkable(map[newY][newX])) {
        addMessage("Non puoi attraversare questo terreno.", 'warning');
        return;
    }
    
    // Se tutti i controlli sono passati, aggiorna la posizione del giocatore
    player.x = newX;
    player.y = newY;
    
    // Aggiorna il contatore dei passi per il giorno/notte
    if (isDay) {
        dayMovesCounter++;
        
        // Se il giocatore ha fatto abbastanza passi, passa alla notte
        if (dayMovesCounter >= DAY_LENGTH_MOVES) {
            transitionToNight();
        }
    } else {
        nightMovesCounter++;
        
        // Se il giocatore ha fatto abbastanza passi durante la notte, passa al giorno
        if (nightMovesCounter >= NIGHT_LENGTH_MOVES) {
            transitionToDay();
        }
    }
    
    // Applica consumo risorse per il movimento
    consumeResourcesOnMove();
    
    // Controlla se il giocatore è morto per fame/sete/altro
    if (player.hp <= 0) {
        endGame(false);
        return;
    }
    
    // Controlla e visualizza messaggi sullo stato del giocatore (fame, sete, ecc.)
    checkAndLogStatusMessages();
    
    // Prova a generare eventi speciali
    // 1. Testo di Flavor (piccoli dettagli ambientali)
    showRandomFlavorText(map[player.y][player.x]);
    
    // 2. Frammenti di Lore (testi narrativi più rari)
    checkForLoreFragment();
    
    // 3. Eventi complessi (predatori, animali, ecc.)
    triggerComplexEvent(map[player.y][player.x]);
    
    // 4. Eventi basati su casella
    triggerTileEvent(map[player.y][player.x]);
    
    // Easter Egg - troppo raro, lo omettiamo qui
    // if (!easterEggPixelDebhFound && Math.random() < EASTER_EGG_CHANCE) {
    //     // ...
    // }
    
    // Aggiorna l'interfaccia
    renderMap();
    renderStats();
}

/**
 * Consuma risorse del giocatore per il movimento.
 */
function consumeResourcesOnMove() {
    // Consumo base di cibo e acqua per movimento
    player.food = Math.max(0, player.food - MOVE_FOOD_COST);
    player.water = Math.max(0, player.water - MOVE_WATER_COST);
    
    // Costi extra se il giocatore è malato
    if (player.isSick) {
        player.food = Math.max(0, player.food - SICKNESS_EXTRA_FOOD_COST);
        player.water = Math.max(0, player.water - SICKNESS_EXTRA_WATER_COST);
    }
    
    // Danni passivi basati sullo stato
    let totalDamage = 0;
    
    // Fame
    if (player.food <= 0) {
        totalDamage += PASSIVE_HUNGER_DAMAGE;
    }
    
    // Sete
    if (player.water <= 0) {
        totalDamage += PASSIVE_THIRST_DAMAGE;
    }
    
    // Ferite
    if (player.isInjured) {
        totalDamage += PASSIVE_INJURY_DAMAGE;
    }
    
    // Malattia
    if (player.isSick) {
        totalDamage += PASSIVE_SICKNESS_DAMAGE;
    }
    
    // Applica i danni totali
    if (totalDamage > 0) {
        player.hp = Math.max(0, player.hp - totalDamage);
    }
}

/**
 * Passa dal giorno alla notte.
 */
function transitionToNight() {
    // Resetta il contatore dei passi giornalieri
    dayMovesCounter = 0;
    
    // Imposta la flag di notte
    isDay = false;
    
    // Controllo se il giocatore è in un rifugio per la notte
    const currentTile = map[player.y][player.x];
    const inShelter = SHELTER_TILES.includes(currentTile);
    
    // Messaggio appropriato
    if (inShelter) {
        addMessage("Il sole tramonta. Ti trovi al riparo per la notte.", 'info', true);
    } else {
        addMessage("Il sole tramonta. Sei all'aperto - la notte sarà pericolosa.", 'warning', true);
        
        // Se non è in riparo, applica penalità extra
        applyNightPenalties();
    }
    
    // Aggiorna l'interfaccia
    renderStats();
}

/**
 * Applica penalità per passare la notte all'aperto.
 */
function applyNightPenalties() {
    // Già implementato, semplicemente chiamato da transitionToNight
    // Questo simula il danno da esposizione notturna
    
    // Costo di sopravvivenza notturna se all'aperto
    player.food = Math.max(0, player.food - NIGHT_FOOD_COST);
    player.water = Math.max(0, player.water - NIGHT_WATER_COST);
    
    // Danno da esposizione
    if (player.food <= 0) {
        player.hp -= HUNGER_PENALTY_HP;
        addMessage(getRandomText(STATO_MESSAGGI.AFFAMATO), 'warning');
    }
    
    if (player.water <= 0) {
        player.hp -= THIRST_PENALTY_HP;
        addMessage(getRandomText(STATO_MESSAGGI.ASSETATO), 'warning');
    }
    
    // Messaggio di esposizione notturna
    addMessage(getRandomText(STATO_MESSAGGI.NOTTE_APERTO), 'warning');
}

/**
 * Passa dalla notte al giorno.
 */
function transitionToDay() {
    // Resetta il contatore dei passi notturni
    nightMovesCounter = 0;
    
    // Imposta la flag di giorno
    isDay = true;
    
    // Incrementa i giorni sopravvissuti
    daysSurvived++;
    
    // Messaggio per un nuovo giorno
    addMessage(`L'alba sorge sul giorno ${daysSurvived}. La luce del sole porta un po' di speranza.`, 'success', true);
    
    // Aggiorna l'interfaccia
    renderStats();
}

/**
 * Termina il gioco con un messaggio di vittoria o sconfitta.
 * @param {boolean} isVictory - Se true, il giocatore ha vinto. Se false, ha perso.
 */
function endGame(isVictory) {
    // Imposta lo stato del gioco
    gameActive = false;
    
    // Nascondi il container di gioco
    gameContainer.style.display = 'none';
    
    // Mostra la schermata di fine
    endScreen.style.display = 'flex';
    
    // Imposta titolo e messaggio appropriati
    if (isVictory) {
        endTitle.textContent = "VITTORIA!";
        
        // Messaggio di vittoria con statistiche
        endMessage.innerHTML = `
            Hai trovato il rifugio sicuro dopo ${daysSurvived} giorni di viaggio.
            <br><br>
            <strong>Statistiche Finali:</strong><br>
            HP: ${Math.floor(player.hp)}/${player.maxHp}<br>
            Sazietà: ${Math.floor(player.food)}/10<br>
            Idratazione: ${Math.floor(player.water)}/10<br>
            Oggetti nell'inventario: ${player.inventory.length}<br>
            <br>
            Sei sopravvissuto al Territorio Calmo. Per ora.
        `;
    } else {
        endTitle.textContent = "SCONFITTA";
        
        // Determina la causa della morte
        let causeOfDeath = "sconosciuta";
        
        if (player.hp <= 0) {
            if (player.food <= 0 && player.water <= 0) {
                causeOfDeath = "inedia e disidratazione";
            } else if (player.food <= 0) {
                causeOfDeath = "inedia";
            } else if (player.water <= 0) {
                causeOfDeath = "disidratazione";
            } else if (player.isInjured && player.isSick) {
                causeOfDeath = "infezione e ferite non curate";
            } else if (player.isInjured) {
                causeOfDeath = "emorragia da ferite non curate";
            } else if (player.isSick) {
                causeOfDeath = "malattia";
            } else {
                causeOfDeath = "cause sconosciute";
            }
        }
        
        // Messaggio di sconfitta con statistiche
        endMessage.innerHTML = `
            Sei morto dopo ${daysSurvived} giorni nel Territorio Calmo.
            <br>
            Causa della morte: ${causeOfDeath}
            <br><br>
            <strong>Statistiche Finali:</strong><br>
            HP: 0/${player.maxHp}<br>
            Sazietà: ${Math.floor(player.food)}/10<br>
            Idratazione: ${Math.floor(player.water)}/10<br>
            <br>
            Il Territorio Calmo reclama un'altra vittima.
        `;
    }
    
    // Collega il pulsante di riavvio
    if (restartButton) {
        restartButton.onclick = () => {
            // Nascondi la schermata di fine
            endScreen.style.display = 'none';
            
            // Ricomincia il gioco
            initializeGame();
        };
    }
}

/**
 * Mostra un testo di flavor casuale legato al tipo di casella.
 * @param {string} tile - Il tipo di casella corrente.
 */
function showRandomFlavorText(tile) {
    // Verifica se mostrare un testo (probabilità)
    if (Math.random() > FLAVOR_TEXT_CHANCE) return;
    
    let flavorTexts = [];
    
    // Selezione testi in base al tipo di casella
    switch (tile) {
        case TILE_SYMBOLS.PLAINS:
            flavorTexts = [
                "Il vento solleva polvere dalla terra arida.",
                "L'erba alta ondeggia nel vento, gialla e secca.",
                "Il terreno è screpolato dalla siccità.",
                "Piante basse si aggrappano tenacemente al terreno.",
                "In lontananza, miraggi tremolano nell'aria calda."
            ];
            break;
        case TILE_SYMBOLS.FOREST:
            flavorTexts = [
                "Tra gli alberi, ombre si muovono con il vento.",
                "Foglie secche scricchiolano sotto i tuoi passi.",
                "Rami contorti formano motivi inquietanti sopra di te.",
                "Il sottobosco è una rete impenetrabile di rovi e arbusti.",
                "Uno strato di nebbia ristagna tra i tronchi."
            ];
            break;
        case TILE_SYMBOLS.RIVER:
            flavorTexts = [
                "L'acqua scorre lenta, torbida e densa.",
                "Bolle occasionali rompono la superficie dell'acqua.",
                "Piante acquatiche formano chiazze dense lungo le rive.",
                "L'odore di melma e decomposizione permea l'aria.",
                "Piccole onde lambiscono la riva fangosa."
            ];
            break;
        case TILE_SYMBOLS.VILLAGE:
            flavorTexts = [
                "Porte sbattono nel vento tra case abbandonate.",
                "Finestre rotte fissano come occhi vuoti.",
                "Oggetti personali sparsi raccontano di una partenza frettolosa.",
                "Graffiti sbiaditi decorano i muri decrepiti.",
                "Un'insegna cigola, appesa a un solo chiodo."
            ];
            break;
        case TILE_SYMBOLS.CITY:
            flavorTexts = [
                "Grattacieli si ergono come scheletri contro il cielo.",
                "Vie deserte echeggiano di un silenzio innaturale.",
                "Vetrine rotte espongono merce impolverata.",
                "Veicoli abbandonati bloccano parzialmente la strada.",
                "Manifesti strappati svolazzano nel vento tra gli edifici."
            ];
            break;
        case TILE_SYMBOLS.REST_STOP:
            flavorTexts = [
                "I resti di un falò suggeriscono che qualcuno si è accampato qui.",
                "Vecchie scorte sono ancora visibili in un angolo.",
                "Graffi e segni sulle pareti raccontano storie silenziose.",
                "Un riparo improvvisato di fortuna offre un minimo di protezione.",
                "Resti di cibo indicano un pasto consumato in fretta."
            ];
            break;
        default:
            return; // Per altri tipi di casella, non mostra nulla
    }
    
    // Seleziona un testo casuale dalla lista appropriata
    const randomText = getRandomText(flavorTexts);
    
    // Mostra il messaggio
    addMessage(randomText);
}

/**
 * Verifica se il giocatore trova un frammento di lore.
 */
function checkForLoreFragment() {
    if (Math.random() < LORE_FRAGMENT_CHANCE) {
        const loreText = findLoreFragment();
        addMessage(loreText, 'lore');
    }
}

/**
 * Controlla e mostra messaggi relativi allo stato del giocatore.
 */
function checkAndLogStatusMessages() {
    // Mostra messaggi solo occasionalmente per non spammare il log
    if (Math.random() > 0.15) return;
    
    // Controlla priorità di stato (più grave prima)
    if (player.hp <= player.maxHp * 0.2) {
        // Stato morente
        addMessage(getRandomText(STATO_MESSAGGI.MORENTE), 'warning');
    } else if (player.isInjured && player.isSick) {
        // Stato critico combinato
        if (Math.random() < 0.5) {
            addMessage(getRandomText(STATO_MESSAGGI.FERITO), 'warning');
        } else {
            addMessage(getRandomText(STATO_MESSAGGI.INFETTO), 'warning');
        }
    } else if (player.isSick) {
        // Stato malato
        addMessage(getRandomText(STATO_MESSAGGI.INFETTO), 'warning');
    } else if (player.isInjured) {
        // Stato ferito
        addMessage(getRandomText(STATO_MESSAGGI.FERITO), 'warning');
    } else if (player.food <= 0 && player.water <= 0) {
        // Affamato e assetato
        if (Math.random() < 0.5) {
            addMessage(getRandomText(STATO_MESSAGGI.AFFAMATO), 'warning');
        } else {
            addMessage(getRandomText(STATO_MESSAGGI.ASSETATO), 'warning');
        }
    } else if (player.food <= 0) {
        // Solo affamato
        addMessage(getRandomText(STATO_MESSAGGI.AFFAMATO), 'warning');
    } else if (player.water <= 0) {
        // Solo assetato
        addMessage(getRandomText(STATO_MESSAGGI.ASSETATO), 'warning');
    }
}

/**
 * Gestisce gli input da tastiera per il movimento e altre azioni.
 * @param {KeyboardEvent} event - L'evento tastiera.
 */
function handleKeyPress(event) {
    // Previene lo scrolling della pagina
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "w", "a", "s", "d"].includes(event.key)) {
        event.preventDefault();
    }
    
    // Ignora input se il gioco non è attivo o se un evento è attivo
    if (!gameActive || eventScreenActive || gamePaused) return;
    
    // Movimento con tasti freccia o WASD
    switch (event.key) {
        case "ArrowUp":
        case "w":
        case "W":
            movePlayer(0, -1);
            break;
        case "ArrowDown":
        case "s":
        case "S":
            movePlayer(0, 1);
            break;
        case "ArrowLeft":
        case "a":
        case "A":
            movePlayer(-1, 0);
            break;
        case "ArrowRight":
        case "d":
        case "D":
            movePlayer(1, 0);
            break;
        case " ": // Spazio per attendere (non fare nulla per un turno)
            // Incrementa contatori come se avesse fatto un movimento
            if (isDay) {
                dayMovesCounter++;
                if (dayMovesCounter >= DAY_LENGTH_MOVES) {
                    transitionToNight();
                }
            } else {
                nightMovesCounter++;
                if (nightMovesCounter >= NIGHT_LENGTH_MOVES) {
                    transitionToDay();
                }
            }
            
            // Consuma risorse per l'attesa (meno del movimento)
            player.food = Math.max(0, player.food - MOVE_FOOD_COST * 0.5);
            player.water = Math.max(0, player.water - MOVE_WATER_COST * 0.5);
            
            // Aggiorna interfaccia
            renderStats();
            addMessage("Attendi e riposi brevemente.", 'info');
            break;
    }
}

/**
 * Imposta i listener per gli input utente.
 */
function setupInputListeners() {
    // Aggiungi event listener per la tastiera
    document.addEventListener('keydown', handleKeyPress);
    
    // Event listener per il click sul pulsante di riavvio
    if (restartButton) {
        restartButton.addEventListener('click', () => {
            endScreen.style.display = 'none';
            initializeGame();
        });
    }
    
    // Event listener per i pulsanti di movimento (già impostati in HTML con onclick)
    // Nessun altro setup necessario qui
    
    // Event listener per il container delle scelte degli eventi
    eventChoicesContainer.addEventListener('click', handleChoiceContainerClick);
}

/**
 * Gestisce il click sul container delle scelte negli eventi.
 * @param {Event} event - L'evento click.
 */
function handleChoiceContainerClick(event) {
    // Se non c'è un evento attivo o il gioco è in pausa, non fare nulla
    if (!eventScreenActive || gamePaused) return;
    
    // Trova il pulsante cliccato
    const button = event.target.closest('button');
    if (!button) return; // Se il click non è su un pulsante, ignora
    
    // Ottieni l'indice della scelta dal dataset
    const choiceIndex = button.dataset.choiceIndex;
    if (choiceIndex === undefined) return; // Se non c'è un indice, ignora
    
    // Chiama la funzione di gestione della scelta
    handleEventChoice(parseInt(choiceIndex));
} 
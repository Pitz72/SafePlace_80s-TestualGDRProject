// Funzione helper per numeri casuali interi (inclusivo)
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Funzione helper per selezionare un testo casuale da un array
function getRandomText(textArray) {
    if (!textArray || textArray.length === 0) return "";
    return textArray[Math.floor(Math.random() * textArray.length)];
}

// Funzione per aggiungere messaggi al log e controllare il limite
function addMessage(text, type = 'normal', important = false) {
    if (!text) return;
    let prefix = "";
    if (type === 'warning') prefix = "<span class='msg-warning'>[!]</span> ";
    else if (type === 'info') prefix = "<span class='msg-info'>[*]</span> ";
    if (important) text = `<strong>${text}</strong>`;

    messages.unshift(prefix + text); // Aggiunge all'inizio per visualizzare i più recenti in alto
    if (messages.length > MAX_MESSAGES) {
        messages.pop(); // Rimuove il messaggio più vecchio se si supera il limite
    }
    if (messagesList) renderMessages(); // Aggiorna la lista nel DOM
}

// --- Variabili di Stato ---
let player = {};
let map = [];
let messages = [];
let gameActive = false;
let eventScreenActive = false;
let currentEventChoices = [];
let currentEventContext = null;
let dayMovesCounter = 0; // Contatore passi diurni
let isDay = true;       // Flag Giorno/Notte
let daysSurvived = 0;   // Contatore giorni completati

// --- Riferimenti DOM (Definiti subito) ---
const gameContainer = document.getElementById('game-container');
const endScreen = document.getElementById('end-screen');
const endTitle = document.getElementById('end-title');
const endMessage = document.getElementById('end-message');
const mapDisplay = document.getElementById('map-display');
const statsList = document.getElementById('stats-list');
const statHp = document.getElementById('stat-hp');
const statMaxHp = document.getElementById('stat-maxhp');
const statVig = document.getElementById('stat-vig');
const statPot = document.getElementById('stat-pot');
const statAgi = document.getElementById('stat-agi');
const statTra = document.getElementById('stat-tra');
const statInf = document.getElementById('stat-inf');
const statPre = document.getElementById('stat-pre');
const statAda = document.getElementById('stat-ada');
const statAcq = document.getElementById('stat-acq');
const statFood = document.getElementById('stat-food');
const statWater = document.getElementById('stat-water');
const posX = document.getElementById('pos-x');
const posY = document.getElementById('pos-y');
const tileType = document.getElementById('tile-type');
const statDayTime = document.getElementById('stat-day-time');
const messagesList = document.getElementById('messages');
const moveButtons = document.querySelectorAll('#controls button');
const eventOverlay = document.getElementById('event-overlay');
const eventTitle = document.getElementById('event-title');
const eventContent = document.getElementById('event-content');
const legendList = document.getElementById('legend-list');
const continueButton = eventOverlay.querySelector('.continue-button');

// --- FUNZIONI DI GIOCO ---

function initializeGame() {
    // Pulisce stato precedente
    messages = [];
    player = {};
    map = [];
    gameActive = false;
    eventScreenActive = false;
    dayMovesCounter = 0;
    isDay = true;
    daysSurvived = 0;

    try {
        generateCharacter();
        if (!player || typeof player.vigore !== 'number') throw new Error("Generazione Personaggio Fallita");
        generateMap();
        if (!map || map.length === 0 || typeof player.x !== 'number') throw new Error("Generazione Mappa/Posizione Fallita");
    } catch(e) {
        console.error("ERRORE INIZIALIZZAZIONE:", e);
        if(mapDisplay) mapDisplay.textContent = `ERRORE INIZIALIZZAZIONE: ${e.message}`;
        return; // Ferma se l'inizializzazione fallisce
    }

    gameActive = true;
    eventOverlay.style.display = 'none';
    endScreen.style.display = 'none';
    gameContainer.style.display = 'flex'; // Mostra l'interfaccia di gioco

    try {
        renderLegend();
        renderStats();
        renderMap();
        renderMessages(); // Pulisce log precedente se c'era
        addMessage(`Inizio viaggio. HP:${player.hp}, Cibo:${player.food}, Acqua:${player.water}. È Giorno.`);
    } catch (e) {
        console.error("ERRORE RENDER INIZIALE:", e);
        if(mapDisplay) mapDisplay.textContent = "Errore nel rendering iniziale!";
        gameActive = false; // Impedisce di giocare se il rendering fallisce
    }

    if (gameActive) {
        enableControls();
        setupInputListeners();
    }
}

function generateCharacter() {
    player = {
        name: "Ultimo",
        vigore: 9 + getRandomInt(0, 2),
        potenza: 9 + getRandomInt(0, 2),
        agilita: 14 + getRandomInt(0, 2),
        tracce: 14 + getRandomInt(0, 2),
        influenza: 6 + getRandomInt(0, 2),
        presagio: 7 + getRandomInt(0, 2),
        adattamento: 9 + getRandomInt(0, 2),
        acquisita: 8 + getRandomInt(0, 2),
        maxHp: 0, hp: 0, x: undefined, y: undefined,
        food: STARTING_FOOD, water: STARTING_WATER,
        ammo: 0, // Non usata al momento?
        movesCounter: 0, // Non usata al momento?
        isInjured: false, // Flag Ferito
        isSick: false    // Flag Malato
    };
    player.maxHp = 10 + player.vigore;
    player.hp = player.maxHp;
}

function generateMap() {
    map = [];
    let startPos = null;
    // Genera mappa base
    for (let y = 0; y < MAP_HEIGHT; y++) {
        map[y] = [];
        for (let x = 0; x < MAP_WIDTH; x++) {
            let tileType = TILE_SYMBOLS.PLAINS;
            const rand = Math.random();
            if (rand < 0.10) tileType = TILE_SYMBOLS.MOUNTAIN;
            else if (rand < 0.20) tileType = TILE_SYMBOLS.FOREST;
            else if (rand < 0.26) tileType = TILE_SYMBOLS.RIVER;
            else if (rand < 0.30) tileType = TILE_SYMBOLS.VILLAGE;
            else if (rand < 0.32) tileType = TILE_SYMBOLS.CITY;
            else if (rand < 0.35) tileType = TILE_SYMBOLS.REST_STOP;
            map[y][x] = { type: tileType, visited: false };
        }
    }
    // Posiziona Start ('S')
    let startX, startY, attempts = 0;
    do {
        startX = getRandomInt(1, Math.floor(MAP_WIDTH / 4));
        startY = getRandomInt(1, Math.floor(MAP_HEIGHT / 4));
        attempts++;
    } while ((!map[startY]?.[startX] || map[startY][startX].type !== TILE_SYMBOLS.PLAINS) && attempts < 100);
    if (attempts >= 100) { startX = 1; startY = 1; } // Fallback
    map[startY][startX] = { type: TILE_SYMBOLS.START, visited: true };
    startPos = { x: startX, y: startY };

    // Posiziona End ('E')
    let endX, endY;
    attempts = 0;
    do {
        endX = getRandomInt(Math.floor(MAP_WIDTH * 3 / 4), MAP_WIDTH - 2);
        endY = getRandomInt(Math.floor(MAP_HEIGHT * 3 / 4), MAP_HEIGHT - 2);
        attempts++;
        if (attempts > 100) { endX = MAP_WIDTH - 2; endY = MAP_HEIGHT - 2; break; } // Fallback
    } while (!map[endY]?.[endX] || map[endY][endX].type === TILE_SYMBOLS.MOUNTAIN || map[endY][endX].type === TILE_SYMBOLS.RIVER || (endX === startX && endY === startY));

    if (map[endY]?.[endX]) {
        map[endY][endX] = { type: TILE_SYMBOLS.END, visited: false };
    } else { // Fallback estremo se le coordinate generate non sono valide
         map[MAP_HEIGHT - 2][MAP_WIDTH - 2] = { type: TILE_SYMBOLS.END, visited: false };
    }

    player.x = startPos.x;
    player.y = startPos.y;
}

function renderStats() {
    try {
        statHp.textContent = player?.hp ?? '--'; statMaxHp.textContent = player?.maxHp ?? '--';
        statVig.textContent = player?.vigore ?? '--'; statPot.textContent = player?.potenza ?? '--';
        statAgi.textContent = player?.agilita ?? '--'; statTra.textContent = player?.tracce ?? '--';
        statInf.textContent = player?.influenza ?? '--'; statPre.textContent = player?.presagio ?? '--';
        statAda.textContent = player?.adattamento ?? '--'; statAcq.textContent = player?.acquisita ?? '--';
        statFood.textContent = player?.food ?? '--'; statWater.textContent = player?.water ?? '--';
        statFood.classList.toggle('low-resource', (player?.food ?? 99) <= 1);
        statWater.classList.toggle('low-resource', (player?.water ?? 99) <= 1);
        posX.textContent = player?.x ?? '--'; posY.textContent = player?.y ?? '--';

        // Aggiorna Status Condizione
        const conditionSpan = document.getElementById('stat-condition');
        if (conditionSpan) {
            let statusText = "Normale";
            let statusClass = "status-normal";
            if (player?.isInjured && player?.isSick) {
                statusText = "Ferito, Malato";
                statusClass = "status-danger";
            } else if (player?.isInjured) {
                statusText = "Ferito";
                statusClass = "status-warning";
            } else if (player?.isSick) {
                statusText = "Malato";
                statusClass = "status-warning";
            }
            conditionSpan.textContent = statusText;
            conditionSpan.className = statusClass; // Rimuove classi vecchie e imposta la nuova
        }

        if (gameActive && map?.[player?.y]?.[player?.x]) {
            const currentTile = map[player.y][player.x];
            tileType.textContent = TILE_DESC[currentTile.type] || '???';
        } else if (gameActive) {
            tileType.textContent = 'Inizio...';
        } else {
            tileType.textContent = '--';
        }

        if (statDayTime) {
            if (isDay) {
                statDayTime.textContent = `${DAY_LENGTH_MOVES - dayMovesCounter} p.`;
            } else {
                statDayTime.textContent = 'Notte';
            }
        }
    } catch (e) {
        console.error("Errore rendering statistiche:", e);
        if (tileType) tileType.textContent = 'ERR STATS';
    }
}

function renderMessages() {
    try { messagesList.innerHTML = messages.map(msg => `<li>${msg}</li>`).join(''); }
    catch (e) { console.error("Errore rendering messaggi:", e); }
}

function renderLegend() {
    try {
        legendList.innerHTML = '';
        const legendItems = [
            { s: TILE_SYMBOLS.PLAYER, d: TILE_DESC['@'] }, { s: TILE_SYMBOLS.PLAINS, d: TILE_DESC['.'] },
            { s: TILE_SYMBOLS.FOREST, d: TILE_DESC['F'] }, { s: TILE_SYMBOLS.MOUNTAIN, d: TILE_DESC['M'] },
            { s: TILE_SYMBOLS.RIVER, d: TILE_DESC['~'] }, { s: TILE_SYMBOLS.VILLAGE, d: TILE_DESC['V'] },
            { s: TILE_SYMBOLS.CITY, d: TILE_DESC['C'] }, { s: TILE_SYMBOLS.REST_STOP, d: TILE_DESC['R'] },
            { s: TILE_SYMBOLS.START, d: TILE_DESC['S'] }, { s: TILE_SYMBOLS.END, d: TILE_DESC['E'] }
        ];
        legendItems.forEach(item => {
            const tileKey = Object.keys(TILE_SYMBOLS).find(k => TILE_SYMBOLS[k] === item.s);
            const tileClass = `tile-${tileKey ? tileKey.toLowerCase().replace(/_/g, '-') : 'unk'}`;
            const endClass = item.s === TILE_SYMBOLS.END ? 'tile-end' : '';
            legendList.innerHTML += `<li><span class="legend-symbol ${tileClass} ${endClass}">${item.s}</span> = ${item.d}</li>`;
        });
    } catch (e) { console.error("Errore rendering legenda:", e); }
}

function renderMap() {
    const display = mapDisplay; if (!display) return;
    if (!player || typeof player.x !== 'number') { display.textContent = "ERRORE: Player non valido"; return; }
    if (!map || !map.length) { display.textContent = "ERRORE: Mappa non valida"; return; }

    player.x = Math.max(0, Math.min(MAP_WIDTH - 1, player.x));
    player.y = Math.max(0, Math.min(MAP_HEIGHT - 1, player.y));

    let mapString = "";
    const viewWidth = 40, viewHeight = 25; // Dimensioni viewport mappa
    const halfWidth = Math.floor(viewWidth / 2);
    const halfHeight = Math.floor(viewHeight / 2);

    // Calcola coordinate start viewport, centrate sul giocatore ma limitate dai bordi mappa
    let startX = Math.max(0, player.x - halfWidth);
    let startY = Math.max(0, player.y - halfHeight);
    startX = Math.min(startX, MAP_WIDTH - viewWidth);
    startY = Math.min(startY, MAP_HEIGHT - viewHeight);
    startX = Math.max(0, startX); // Assicura non sia < 0 dopo la correzione
    startY = Math.max(0, startY); // Assicura non sia < 0 dopo la correzione

    let endX = Math.min(MAP_WIDTH, startX + viewWidth);
    let endY = Math.min(MAP_HEIGHT, startY + viewHeight);

    try {
        for (let y = startY; y < endY; y++) {
            if (y < 0 || y >= map.length) continue; // Sicurezza extra
            for (let x = startX; x < endX; x++) {
                if (x < 0 || !map[y] || x >= map[y].length) continue; // Sicurezza extra

                if (x === player.x && y === player.y) {
                    mapString += `<span class="player-marker">${TILE_SYMBOLS.PLAYER}</span>`;
                } else {
                    const tile = map[y][x];
                    const symbol = tile?.type || '?';
                    const tileKey = Object.keys(TILE_SYMBOLS).find(k => TILE_SYMBOLS[k] === symbol);
                    let tileClass = `tile-${tileKey ? tileKey.toLowerCase().replace(/_/g, '-') : 'unk'}`;
                    let visitedClass = tile?.visited ? 'visited' : '';
                    let endClass = symbol === TILE_SYMBOLS.END ? 'tile-end' : '';
                    mapString += `<span class="${tileClass} ${visitedClass} ${endClass}">${symbol}</span>`;
                }
            }
            mapString += "\n"; // Nuova riga alla fine di ogni riga della mappa
        }
    } catch (e) {
        console.error("Errore loop rendering mappa:", e);
        display.textContent = "Errore Rendering Mappa!";
        return;
    }
    display.innerHTML = mapString; // Usa innerHTML per interpretare gli span
}

function disableControls(disabled = true) { moveButtons.forEach(btn => btn.disabled = disabled); }
function enableControls() { if (gameActive) moveButtons.forEach(btn => btn.disabled = false); }

function performSkillCheck(statKey, difficulty) {
    const statValue = player[statKey] || 5; // Default a 5 se stat non trovata
    const roll = getRandomInt(1, 20);
    const bonus = Math.floor((statValue - 10) / 2); // Modificatore D&D style

    // Applica penalità status
    let difficultyPenalty = 0;
    let penaltyReason = "";
    if (player.isInjured && (statKey === 'potenza' || statKey === 'agilita')) {
        difficultyPenalty = 2; // Penalità Ferito per Potenza/Agilità
        penaltyReason = " (Ferito)";
    }
    if (player.isSick && (statKey === 'vigore' || statKey === 'adattamento')) {
        difficultyPenalty = 2; // Penalità Malato per Vigore/Adattamento
        // Se era già ferito, la penalità si somma?
        // Per ora, la seconda penalità sovrascrive la prima se la stat è diversa.
        // Se la stat è la stessa (improbabile qui), si potrebbe sommare.
        // Scegliamo la penalità più alta se entrambe si applicano alla stessa stat?
        // Per semplicità, ora si applica solo l'ultima condizione verificata.
        // Possiamo affinare: se entrambe le condizioni sono vere e si applicano a stat diverse,
        // si potrebbero applicare entrambe? No, il check è per una sola stat.
        // Quindi, se la stat è Vigore e si è sia Feriti che Malati, si applica solo la penalità Malato.
        // Facciamo che la penalità si applica SE lo stato impatta la stat specifica.
        penaltyReason = " (Malato)";
    }

    const finalDifficulty = difficulty + difficultyPenalty;
    const total = roll + bonus;
    const success = total >= finalDifficulty;
    // Aggiorna testo risultato per mostrare la penalità
    const resultText = `Prova ${statKey.toUpperCase()}(Diff ${difficulty}${penaltyReason !== "" ? `->${finalDifficulty}`: ""}${penaltyReason}): D20(${roll}) + Mod(${bonus}) = ${total} -> ${success ? "SUCCESSO!" : '<span class="danger-text">FALLIMENTO!</span>'}`;
    return { success: success, text: resultText };
}

function showEventPopup(title, content, choices = [], checkResult = null, consequenceText = "") {
    if (!gameActive && !(title.includes("Fine") || title.includes("Destinazione"))) return; // Permette popup fine gioco

    eventTitle.textContent = title;
    let fullHTML = content.replace(/\n/g, '<br>'); // Gestisce newline nel testo

    if (checkResult) {
        fullHTML += `<br><br>${checkResult.text}`; // Mostra risultato check
    }
    if (consequenceText) {
         // Aggiunge nuova riga solo se c'è già testo risultato check, altrimenti usa la prima
        fullHTML += `${checkResult ? '<br>' : '<br><br>'}${consequenceText.replace(/\n/g, '<br>')}`;
    }

    let choiceHTML = "";
    if (choices?.length > 0) {
        currentEventChoices = choices; // Salva scelte per input tastiera
        choices.forEach(choice => {
            choiceHTML += `<div class="event-choice"><button onclick="handleEventChoice('${choice.key}')">${choice.text}</button></div>`;
        });
        continueButton.classList.add('hidden'); // Nasconde "Continua" se ci sono scelte
    } else {
        currentEventChoices = []; // Nessuna scelta
        currentEventContext = null; // Resetta contesto
        continueButton.classList.remove('hidden'); // Mostra "Continua"
    }

    eventContent.innerHTML = fullHTML + choiceHTML; // Inserisce contenuto e pulsanti
    eventOverlay.style.display = 'block';
    disableControls(true); // Disabilita controlli mappa
    eventScreenActive = true;
    eventContent.scrollTop = 0; // Scrolla all'inizio
}

function hideEventScreen() {
    if (!eventScreenActive) return;
    eventOverlay.style.display = 'none';
    eventScreenActive = false;
    currentEventChoices = [];
    currentEventContext = null;
    if (gameActive) enableControls(); // Riabilita controlli mappa se il gioco è attivo
}

function showEndGameMessage(isVictory) {
    gameActive = false;
    disableControls(true);
    eventOverlay.style.display = 'none';
    gameContainer.style.display = 'none';

    if (isVictory) {
        endTitle.textContent = "Destinazione Raggiunta...";
        endMessage.innerHTML = `...Sei arrivato. Davanti a te, una vecchia porta blindata semi-sepolta, con uno strano simbolo inciso... Il simbolo di tuo padre... L\'aria all\'interno è viziata... Un terminale spento è incassato nella parete... È questo il \'Safe Place\'? ...Il tuo viaggio per ora termina qui, Ultimo. Ma la storia... sembra appena iniziata. (Fine del Prototipo - Capitolo 1)`.replace(/\n/g, '<br>');
    } else {
        endTitle.textContent = "Il Viaggio Termina Qui";
        endMessage.textContent = "Le ferite, la fame, la disperazione... Questo mondo non perdona. Sei caduto, Ultimo. Le rovine reclamano un\'altra vita. La ricerca del Safe Place finisce nell\'oblio.";
    }
    endScreen.style.display = 'flex';
}

function handleTileEvent(tile) {
    if (!tile || !gameActive) return false;
    tile.visited = true;
    const tileSymbol = tile.type;
    let popupShown = false;
    let statsChanged = false;
    let penaltyApplied = false;

    addMessage(`Entri: ${TILE_DESC[tileSymbol] || '???'}${(isDay ? '' : ' (Notte)')}`);

    // Probabilità base e pool eventi (giorno)
    let baseEventChance = 0;
    let allowedEventsOnTile = [];
    switch(tileSymbol) {
        case TILE_SYMBOLS.PLAINS: baseEventChance = 0.15; allowedEventsOnTile = ['animale', 'loot_semplice', 'lore', 'tracce_strane', 'eco_radio']; break;
        case TILE_SYMBOLS.FOREST: baseEventChance = 0.30; allowedEventsOnTile = ['animale', 'tracce_strane', 'pericolo_ambientale', 'lore', 'dilemma_morale', 'ritrovamento_dubbio']; break;
        case TILE_SYMBOLS.MOUNTAIN: baseEventChance = 0.20; allowedEventsOnTile = ['animale', 'pericolo_ambientale', 'lore', 'tracce_strane']; break;
        case TILE_SYMBOLS.RIVER: baseEventChance = 0.10; allowedEventsOnTile = ['loot_semplice']; break;
        case TILE_SYMBOLS.CITY: baseEventChance = 0.65; allowedEventsOnTile = ['predoni', 'animale', 'tracce_strane', 'loot_semplice', 'lore', 'pericolo_ambientale', 'dilemma_morale', 'eco_radio', 'ritrovamento_dubbio']; break;
        case TILE_SYMBOLS.VILLAGE: baseEventChance = 0.50; allowedEventsOnTile = ['villaggio_ostile', 'loot_semplice', 'lore', 'tracce_strane', 'dilemma_morale']; break;
    }

    // Modifiche per la notte
    if (!isDay) {
        baseEventChance *= 1.8; // Aumenta probabilità di notte
        const nightEventPool = ['predoni', 'animale_notturno', 'pericolo_ambientale_notturno', 'orrore_indicibile', 'tracce_strane'];
        // Filtra gli eventi possibili di notte basandosi su quelli permessi sulla tile
        const possibleNightEvents = allowedEventsOnTile.filter(type => nightEventPool.includes(type));
        if (possibleNightEvents.length > 0) {
            allowedEventsOnTile = possibleNightEvents;
        } else {
            // Se la tile non ha eventi notturni specifici, usa il pool generico notturno con bassa probabilità
             if (Math.random() < 0.1) { // Bassa chance di evento generico notturno
                allowedEventsOnTile = nightEventPool;
            } else {
                baseEventChance = 0; // Nessun evento casuale se non specifici per la notte
            }
        }
        if (allowedEventsOnTile.length === 0) baseEventChance = 0;
    }

    // Controlla evento casuale sulla tile (se non Start, End, Rest Stop)
    if (tileSymbol !== TILE_SYMBOLS.START && tileSymbol !== TILE_SYMBOLS.END && tileSymbol !== TILE_SYMBOLS.REST_STOP && baseEventChance > 0 && Math.random() < baseEventChance) {
        triggerRandomEvent(allowedEventsOnTile);
        return true; // Evento casuale ha mostrato un popup
    }

    // Logica eventi specifici per tile / Flavor text
    let flavor = "";
    let immediateEvent = false;
    let specificEventTitle = "", specificEventDesc = "", specificEventChoices = [], specificEventCheck = null, specificEventCons = "";

    switch (tileSymbol) {
        case TILE_SYMBOLS.REST_STOP:
            if (!isDay) { // Notte: Riposo forzato
                immediateEvent = true;
                specificEventTitle = "Rifugio Trovato (Notte)";
                specificEventDesc = "Sei riuscito a trovare un rifugio appena in tempo! Puoi finalmente riposare fino all'alba.";

                // Logica Recupero Status
                let recoveredStatusMsg = "";
                if (player.isInjured && Math.random() < 0.30) { // 30% chance recupero Ferito
                    player.isInjured = false;
                    recoveredStatusMsg += " La ferita sembra guarita.";
                    statsChanged = true;
                }
                if (player.isSick && Math.random() < 0.35) { // 35% chance recupero Malato
                    player.isSick = false;
                    recoveredStatusMsg += " La febbre è passata.";
                    statsChanged = true;
                }

                // Passaggio Giorno/Notte
                isDay = true;
                dayMovesCounter = 0;
                daysSurvived++;
                addMessage(`[FASE] Hai passato la notte. Sorge un nuovo Giorno (Giorno ${daysSurvived + 1}).${recoveredStatusMsg}`, 'info', true);

                player.food = Math.max(0, player.food - NIGHT_FOOD_COST);
                player.water = Math.max(0, player.water - NIGHT_WATER_COST);
                addMessage(`[CONSUMO] Il riposo ha richiesto energie (-${NIGHT_FOOD_COST} Cibo, -${NIGHT_WATER_COST} Acqua).`, 'info');
                statsChanged = true;

                if (player.food === 0) {
                    player.hp = Math.max(0, player.hp - HUNGER_PENALTY_HP);
                    addMessage(`[ATTENZIONE] Fame! Hai passato la notte senza cibo (-${HUNGER_PENALTY_HP} HP)`, 'info', true);
                    penaltyApplied = true;
                }
                if (player.water === 0) {
                    player.hp = Math.max(0, player.hp - THIRST_PENALTY_HP);
                    addMessage(`[ATTENZIONE] Sete! Hai passato la notte senz'acqua (-${THIRST_PENALTY_HP} HP)`, 'info', true);
                    penaltyApplied = true;
                }

                if (player.hp < player.maxHp && !penaltyApplied && !player.isInjured && !player.isSick) { // Recupero HP solo se non penalizzato e non Ferito/Malato
                    const recoveredHp = getRandomInt(1, 2);
                    player.hp = Math.min(player.maxHp, player.hp + recoveredHp);
                    specificEventCons = `Riprendi un po' di fiato (+${recoveredHp} HP).`;
                    statsChanged = true;
                } else if (penaltyApplied) {
                    specificEventCons = "Sei esausto e affamato/assetato, il riposo non basta.";
                } else if (player.isInjured || player.isSick) {
                     specificEventCons = "Il riposo aiuta, ma senti ancora gli effetti della tua condizione.";
                } else {
                    specificEventCons = "Passi la notte relativamente tranquillo.";
                }
                specificEventChoices = [];

            } else { // Giorno: Possibilità di ispezionare
                flavor = getRandomText(flavorTextsRestStop);
                specificEventTitle = "Rifugio Esplorato (Giorno)";
                specificEventDesc = `${flavor ? flavor + '\n\n' : ''}Trovi un rifugio. Potrebbe essere utile fermarsi più tardi.\n${getRandomText(descrizioniRifugioStrano)}\nCosa fai?`;
                immediateEvent = true;
                specificEventChoices = [
                    { key: 'I', text: "Ispeziona (Tracce)" },
                    { key: 'L', text: "Lascia perdere" }
                ];
                currentEventContext = { event: 'rifugio_scelta', difficulty: 11 };
            }
            break;

        case TILE_SYMBOLS.END:
            if (gameActive) showEndGameMessage(true);
            return false; // Nessun popup evento qui, gestito da showEndGameMessage

        // Aggiungi flavor text per altre caselle se non c'è stato evento casuale
        case TILE_SYMBOLS.PLAINS: flavor = getRandomText(isDay ? flavorTextsPlains : flavorTextsNightPlains); break;
        case TILE_SYMBOLS.FOREST: flavor = getRandomText(isDay ? flavorTextsForest : flavorTextsNightForest); break;
        case TILE_SYMBOLS.MOUNTAIN: flavor = getRandomText(flavorTextsMountain); break;
        case TILE_SYMBOLS.RIVER: flavor = getRandomText(flavorTextsRiver); break;
        case TILE_SYMBOLS.CITY: flavor = getRandomText(flavorTextsCity); break;
        case TILE_SYMBOLS.VILLAGE: flavor = getRandomText(flavorTextsVillage); break;
    }

    if (flavor && !immediateEvent) { // Mostra flavor solo se non c'è già un evento specifico immediato
        addMessage(flavor);
    }

    // Gestione statistiche e game over dopo eventi specifici (es. riposo notturno)
    if (statsChanged) {
         renderStats();
         if (checkGameOver()) return true; // Esce se game over
     }

    // Mostra popup evento specifico se necessario
    if (immediateEvent && !eventScreenActive) {
         showEventPopup(specificEventTitle, specificEventDesc, specificEventChoices, specificEventCheck, specificEventCons);
         return true; // Popup mostrato
    }

    return false; // Nessun popup mostrato da questa funzione
}

function triggerRandomEvent(allowedTypes = []) {
    if (!gameActive || eventScreenActive || allowedTypes.length === 0) return;

    let eventType = "";
    let difficultyModifier = 0; // Modificatore difficoltà base (es. per notte)
    let baseDifficulty = 12;    // Difficoltà base generica

    // Filtra eventi permessi e applica modificatore notte
    let possibleEvents = [];
    if (!isDay) { // NOTTE
        const nightPool = ['predoni', 'animale_notturno', 'pericolo_ambientale_notturno', 'orrore_indicibile', 'tracce_strane'];
        possibleEvents = allowedTypes.filter(type => nightPool.includes(type));
        if (possibleEvents.length === 0) { // Fallback se tile non ha eventi notturni specifici
            possibleEvents = nightPool.filter(type => allowedTypes.includes(type)); // Cerca nel pool generale notturno
            if (possibleEvents.length === 0) return; // Nessun evento notturno possibile
        }
        difficultyModifier = getRandomInt(1, 3); // Notte rende più difficile
    } else { // GIORNO
         const dayPool = ['predoni', 'animale', 'tracce_strane', 'loot_semplice', 'lore', 'pericolo_ambientale', 'dilemma_morale', 'villaggio_ostile', 'eco_radio', 'ritrovamento_dubbio', 'acqua_contaminata'];
         possibleEvents = allowedTypes.filter(type => dayPool.includes(type));
         if (possibleEvents.length === 0) return; // Nessun evento diurno possibile
    }

    eventType = getRandomText(possibleEvents);

     // Log evento scelto (esclusi loot e lore che loggano dopo l'esito)
    if (eventType !== 'loot_semplice' && eventType !== 'lore') {
        addMessage(`[EVENTO] ${isDay ? '' : '[NOTTE] '}${eventType.replace(/_/g, ' ')}!`, 'info', true);
    }

    let title = "Evento Inaspettato", desc = "", choices = [], check = null, cons = "";
    let statsChanged = false;
    currentEventContext = { event: eventType, difficultyMod: difficultyModifier }; // Imposta contesto base

    // Definisci difficoltà specifiche per evento
    switch (eventType) {
         case 'predoni': baseDifficulty = 12; break;
         case 'animale': baseDifficulty = 11; break;
         case 'animale_notturno': baseDifficulty = 13; break;
         case 'tracce_strane': baseDifficulty = 13; break;
         case 'villaggio_ostile': baseDifficulty = 14; break;
         case 'pericolo_ambientale': baseDifficulty = 12; break; // Sarà sovrascritto dal sottotipo
         case 'pericolo_ambientale_notturno': baseDifficulty = 13; break; // Sarà sovrascritto dal sottotipo
         case 'dilemma_morale': baseDifficulty = 12; break;
         case 'orrore_indicibile': baseDifficulty = 15; break;
         case 'eco_radio': baseDifficulty = 13; break;
         case 'ritrovamento_dubbio': baseDifficulty = 12; break;
         case 'acqua_contaminata': baseDifficulty = 11; break; // Imposto difficoltà base
         // loot e lore non hanno difficoltà
         default: baseDifficulty = 12; break;
    }
     currentEventContext.difficulty = baseDifficulty; // Salva difficoltà base nel contesto

    // Logica specifica per tipo di evento
    switch (eventType) {
        case 'predoni':
            title = isDay ? "Predoni!" : "Imboscata Notturna!";
            desc = `${getRandomText(isDay ? descrizioniPredoni : descrizioniPredoniNotturni)}\n${getRandomText(vociPredoni)}`;
            choices = [{ key: 'F', text: "Fuggi (Agilità)" },{ key: 'C', text: "Combatti (Potenza)" },{ key: 'P', text: "Parla (Influenza)" }];
            break;
        case 'animale':
            title = "Animale Selvatico!";
            desc = `Un ${getRandomText(descrizioniAnimali)} ti sbarra il passo, ringhiando.`;
            choices = [{ key: 'E', text: "Evita (Agilità/Tracce)" },{ key: 'S', text: "Spaventa (Influenza)" },{ key: 'A', text: "Attacca (Potenza)" }];
            break;
        case 'animale_notturno':
            title = "Bestia Notturna!";
            desc = getRandomText(descrizioniAnimaleNotturno);
            choices = [ { key: 'E', text: "Evita furtivamente (Agilità)" }, { key: 'A', text: "Attacca nell'ombra (Potenza)" }, { key: 'O', text: "Osserva da lontano (Tracce)" }];
            break;
        case 'tracce_strane':
            title = "Tracce Strane"; desc = getRandomText(descrizioniTracce);
            choices = [{ key: 'I', text: "Ignora" },{ key: 'S', text: "Segui (Tracce)" }];
            break;
        case 'villaggio_ostile':
            title = "Accampamento Ostile"; desc = getRandomText(descrizioniVillaggioOstile);
            choices = [{ key: 'A', text: "Allontanati" },{ key: 'N', text: "Negozia (Influenza)" }];
            break;
        case 'loot_semplice':
            title = "Oggetti Abbandonati";
            const lootType = Math.random() < 0.6 ? 'Cibo' : 'Acqua';
            const amount = getRandomInt(1, 3);
            desc = `Frugando tra i detriti, trovi ${amount} unità di ${lootType}.`;
            if (lootType === 'Cibo') player.food += amount; else player.water += amount;
            statsChanged = true; choices = []; cons = ""; // Nessuna scelta, conseguenza diretta
            addMessage(`Hai trovato ${amount} ${lootType}.`, 'info');
            break;
        case 'lore':
            title = "Eco dal Passato";
            desc = `Trovi un frammento di conoscenza perduta:\n"${getRandomText(loreFragments)}"`;
            addMessage("Hai trovato un frammento di lore.", 'info'); choices = []; cons = "";
            break;
        case 'pericolo_ambientale':
            title = "Pericolo Improvviso!";
            if (Math.random() < 0.5) {
                 desc = getRandomText(descrizioniPericoloAmbientaleAgilita); choices = [ { key: 'S', text: "Schiva (Agilità)" } ];
                 currentEventContext.subType = 'agilita_check'; currentEventContext.difficulty = 12; currentEventContext.damage = getRandomInt(1, 2);
            } else {
                desc = getRandomText(descrizioniPericoloAmbientalePresagio); choices = [ { key: 'R', text: "Reagisci (Presagio)" } ];
                currentEventContext.subType = 'presagio_check'; currentEventContext.difficulty = 13; currentEventContext.damage = getRandomInt(1, 3);
            }
            break;
        case 'pericolo_ambientale_notturno':
             title = "Pericolo nell'Ombra!";
             desc = getRandomText(descrizioniPericoloAmbientaleNotturno);
             if (Math.random() < 0.5) {
                 choices = [ { key: 'S', text: "Balza via (Agilità)" } ];
                 currentEventContext.subType = 'agilita_check'; currentEventContext.difficulty = 13; currentEventContext.damage = getRandomInt(1, 3);
             } else {
                 choices = [ { key: 'P', text: "Percepisci (Presagio)" } ];
                 currentEventContext.subType = 'presagio_check'; currentEventContext.difficulty = 14; currentEventContext.damage = getRandomInt(2, 3);
             }
             break;
        case 'dilemma_morale':
             title = "Dilemma Morale"; desc = getRandomText(descrizioniDilemmaMorale);
             choices = [{ key: 'I', text: "Indaga / Intervieni (Rischioso)" },{ key: 'N', text: "Non è affar mio / Ignora" }];
             break;
        case 'orrore_indicibile':
             title = "Orrore Indicibile"; desc = getRandomText(descrizioniOrroreIndicibile);
             choices = [ { key: 'F', text: "Fuggi disperatamente (Agilità)" }, { key: 'A', text: "Affronta l'ignoto (Vigore)" }];
             currentEventContext.sanityDamage = getRandomInt(1, 2);
             break;
         case 'eco_radio':
             title = getRandomText(["Eco Radio Debole", "Segnale Intermittente", "Voce nella Statica"]);
             desc = getRandomText(["Senti un debole crepitio radio.", "Una vecchia radio emette strani suoni.", "Un frammento di voce metallica..."]);
             check = performSkillCheck('adattamento', currentEventContext.difficulty + currentEventContext.difficultyMod); // Applica mod notte qui
             if (check.success) { cons = `Riesci a sentire:\n'${getRandomText(radioMessages)}'`; }
             else { cons = getRandomText(["Solo statica.", "Troppo danneggiato.", "Segnale perso."]); }
             choices = []; // Nessuna scelta, solo risultato
             break;
        case 'ritrovamento_dubbio':
            title = getRandomText(["Ritrovamento Dubbio", "Offerta Inaspettata?"]);
            desc = getRandomText(["Trovi un fagotto avvolto con cura.", "Una borraccia quasi nuova è appesa a un ramo.", "Vedi una figura scomparire, lasciando cadere qualcosa."]);
            desc += "\n\nSembra troppo bello per essere vero. Cosa fai?";
            choices = [ { key: 'P', text: "Prendi la Scorta (Rischioso)" }, { key: 'L', text: "Lascia perdere (Sicuro)" }];
            break;
        case 'acqua_contaminata':
            title = "Fonte d'Acqua Sospetta";
            desc = "Trovi una piccola pozza d'acqua dall'aspetto stagnante e un odore leggermente acre. Potrebbe essere rischioso berla, ma la sete si fa sentire.";
            choices = [ { key: 'B', text: "Bevi (Rischio Malattia - Vigore)" }, { key: 'I', text: "Ignora (Sicuro)" }];
            break;
        default: // Evento non gestito? Logga e non fare nulla
            console.warn(`Tipo evento casuale non gestito: ${eventType}`);
            return; // Esce senza mostrare popup
    }

    // Aggiorna stats se l'evento ha avuto effetto immediato (loot)
    if (statsChanged) {
        renderStats();
        if (checkGameOver()) return; // Esce se game over dopo loot
    }

    // Mostra il popup dell'evento
    showEventPopup(title, desc, choices, check, cons);
}


function handleEventChoice(choiceKey) {
    let outcomeTitle = "Esito", outcomeDesc = "", statsChanged = false, outcomeChoices = [], checkResult = null, consequenceText = "";
    const context = currentEventContext; // Usa contesto salvato

    // Nascosto popup precedente DOPO aver recuperato il contesto
    // hideEventScreen(); // Chiamato qui causava flickering, lo lasciamo alla fine

    if (!context) {
        addMessage("Errore nell'elaborazione dell'evento.", 'warning');
        hideEventScreen(); // Nasconde comunque il popup se c'è errore
        return;
    }

    const baseDifficulty = context.difficulty || 12;
    const effectiveDifficulty = baseDifficulty + (context.difficultyMod || 0);

    switch (context.event) {
        case 'predoni':
            outcomeTitle = "Scontro con Predoni";
            let predoniDmg = 0, predoniFoodLoss = 0, predoniWaterLoss = 0;
            switch (choiceKey) {
                case 'F': // Fuga
                    checkResult = performSkillCheck('agilita', effectiveDifficulty);
                    if (checkResult.success) { outcomeDesc = getRandomText(esitiFugaPredoniOk); }
                    else {
                        outcomeDesc = getRandomText(esitiFugaPredoniKo);
                        predoniDmg = getRandomInt(1, 3);
                        player.isInjured = true; // Stato Ferito
                        consequenceText = `Vieni colpito e ferito! (-${predoniDmg} HP).`;
                    }
                    break;
                case 'C': // Combatti
                    checkResult = performSkillCheck('potenza', effectiveDifficulty + 1); // Combattere è più difficile
                    if (checkResult.success) { outcomeDesc = getRandomText(esitiLottaPredoniOk); }
                    else {
                        outcomeDesc = getRandomText(esitiLottaPredoniKo);
                        predoniDmg = getRandomInt(isDay ? 2 : 3, isDay ? 4 : 5);
                        predoniFoodLoss = Math.min(player.food, getRandomInt(0, isDay ? 1 : 2));
                        predoniWaterLoss = Math.min(player.water, getRandomInt(0, isDay ? 1 : 2));
                        player.isInjured = true; // Stato Ferito
                        consequenceText = `Subisci danni e vieni ferito (-${predoniDmg} HP)`;
                        if (predoniFoodLoss > 0) consequenceText += `, perdi cibo (-${predoniFoodLoss})`;
                        if (predoniWaterLoss > 0) consequenceText += `, perdi acqua (-${predoniWaterLoss})`;
                        consequenceText += ".";
                    }
                    break;
                case 'P': // Parla
                    checkResult = performSkillCheck('influenza', effectiveDifficulty + 2); // Parlare è molto più difficile
                    if (checkResult.success) { outcomeDesc = getRandomText(esitiParlaPredoniOk); }
                    else {
                        outcomeDesc = getRandomText(esitiParlaPredoniKo);
                        predoniDmg = getRandomInt(isDay ? 1 : 2, isDay ? 3 : 4);
                        predoniFoodLoss = Math.min(player.food, getRandomInt(0, isDay ? 2 : 3));
                        predoniWaterLoss = Math.min(player.water, getRandomInt(0, isDay ? 2 : 3));
                        player.isInjured = true; // Stato Ferito
                        consequenceText = `Ti attaccano e ti feriscono (-${predoniDmg} HP)`;
                        if (predoniFoodLoss > 0) consequenceText += `, perdi cibo (-${predoniFoodLoss})`;
                        if (predoniWaterLoss > 0) consequenceText += `, perdi acqua (-${predoniWaterLoss})`;
                        consequenceText += ".";
                    }
                    break;
            }
            // Applica danni/perdite predoni
            if (predoniDmg > 0) player.hp = Math.max(0, player.hp - predoniDmg);
            if (predoniFoodLoss > 0) player.food -= predoniFoodLoss;
            if (predoniWaterLoss > 0) player.water -= predoniWaterLoss;
            if (predoniDmg > 0 || predoniFoodLoss > 0 || predoniWaterLoss > 0) statsChanged = true;
            break;

        case 'animale':
        case 'animale_notturno':
            outcomeTitle = context.event === 'animale' ? "Incontro con Animale" : "Incontro Notturno";
            let animaleDmg = 0;
             switch (choiceKey) {
                case 'E': // Evita
                    const statToUse = (player.agilita > player.tracce ? 'agilita' : 'tracce');
                    checkResult = performSkillCheck(statToUse, effectiveDifficulty);
                    if (checkResult.success) { outcomeDesc = getRandomText(esitiEvitaAnimaleOk); }
                    else {
                        outcomeDesc = getRandomText(esitiEvitaAnimaleKo);
                        animaleDmg = getRandomInt(isDay ? 1 : 2, isDay ? 2 : 3);
                        player.isInjured = true; // Stato Ferito
                        consequenceText = `L'animale ti attacca e ti ferisce! (-${animaleDmg} HP).`;
                    }
                    break;
                case 'S': // Spaventa (Solo giorno)
                    if (context.event === 'animale_notturno') { outcomeDesc = "Non puoi spaventare efficacemente ciò che non vedi bene..."; checkResult={text:"Azione inefficace di notte.", success:false}; break; }
                    checkResult = performSkillCheck('influenza', effectiveDifficulty);
                    if (checkResult.success) { outcomeDesc = getRandomText(esitiSpaventaAnimaleOk); }
                    else {
                        outcomeDesc = getRandomText(esitiSpaventaAnimaleKo);
                        animaleDmg = getRandomInt(1, 3);
                        player.isInjured = true; // Stato Ferito
                        consequenceText = `La bestia si infuria, attacca e ti ferisce! (-${animaleDmg} HP).`;
                    }
                    break;
                case 'A': // Attacca
                    checkResult = performSkillCheck('potenza', effectiveDifficulty);
                    if (checkResult.success) { outcomeDesc = getRandomText(esitiAttaccoAnimaleOk); }
                    else {
                        outcomeDesc = getRandomText(esitiAttaccoAnimaleKo);
                        animaleDmg = getRandomInt(isDay ? 2 : 3, isDay ? 4 : 5);
                        player.isInjured = true; // Stato Ferito
                        consequenceText = `Vieni ferito nello scontro (-${animaleDmg} HP).`;
                    }
                    break;
                 case 'O': // Osserva (Solo notte)
                     if (context.event === 'animale') { outcomeDesc = "Non c'è tempo per osservare!"; checkResult={text:"Azione non disponibile di giorno.", success:false}; break;}
                     checkResult = performSkillCheck('tracce', effectiveDifficulty -1); // Osservare è leggermente più facile
                     if (checkResult.success) { outcomeDesc = "Riesci a capire la natura della creatura e a evitarla senza combattere."; /* Potrebbe dare bonus Adattamento? */ }
                     else {
                         outcomeDesc = "Non riesci a capire cosa sia, e ti attacca alla sprovvista!";
                         animaleDmg = getRandomInt(2, 4);
                         player.isInjured = true; // Stato Ferito
                         consequenceText = `Attacco improvviso e ferita! (-${animaleDmg} HP).`;
                        }
                     break;
            }
             // Applica danni animale
            if (animaleDmg > 0) { player.hp = Math.max(0, player.hp - animaleDmg); statsChanged = true; }
            break;

        case 'tracce_strane':
            outcomeTitle = "Seguendo le Tracce";
            if (choiceKey === 'I') { outcomeDesc = "Decidi di non rischiare e prosegui."; }
            else if (choiceKey === 'S') {
                checkResult = performSkillCheck('tracce', effectiveDifficulty);
                if (checkResult.success) {
                    const outcomeRoll = Math.random();
                    if (isDay && outcomeRoll < 0.35) { // Loot (giorno)
                        const foundLootType = Math.random() < 0.5 ? 'Cibo' : 'Acqua'; const foundAmount = getRandomInt(1, 3);
                        outcomeDesc = `${getRandomText(esitiSeguiTracceOkLoot)} Trovi ${foundAmount} ${foundLootType}.`;
                        if (foundLootType === 'Cibo') player.food += foundAmount; else player.water += foundAmount; statsChanged = true;
                    } else if (isDay && outcomeRoll < 0.55) { // Lore (giorno)
                        outcomeDesc = `${getRandomText(esitiSeguiTracceOkLore)}\n"${getRandomText(loreFragments)}"`;
                        addMessage("Hai trovato della lore seguendo le tracce.", 'info');
                    } else if (outcomeRoll < 0.80) { // Pericolo (Predoni/Animale Notturno)
                        outcomeDesc = getRandomText(esitiSeguiTracceOkPredoni);
                        // Mostra esito tracce, poi triggera nuovo evento
                        showEventPopup(outcomeTitle, outcomeDesc, [], checkResult, consequenceText);
                        triggerRandomEvent(isDay ? ['predoni'] : ['predoni', 'animale_notturno']);
                        return; // Esce, l'evento successivo gestirà il flusso
                    } else { // Nulla
                        outcomeDesc = getRandomText(esitiSeguiTracceOkNulla);
                    }
                } else { // Fallimento check Tracce
                    outcomeDesc = getRandomText(esitiSeguiTracceKo);
                    if(Math.random() < (isDay ? 0.3 : 0.5)) { // Penalità per fallimento
                        const dmg = 1; player.hp = Math.max(0, player.hp - dmg);
                        consequenceText = `La disattenzione ti costa (-${dmg} HP).`; statsChanged = true;
                    }
                }
            }
            break;

        case 'villaggio_ostile':
            outcomeTitle = "Accampamento Guardingo";
            if (choiceKey === 'A') { outcomeDesc = getRandomText(esitiVillaggioOstileAllontanati); }
            else if (choiceKey === 'N') {
                checkResult = performSkillCheck('influenza', effectiveDifficulty);
                if (checkResult.success) { outcomeDesc = getRandomText(esitiVillaggioOstileNegoziaOk); }
                else {
                    outcomeDesc = getRandomText(esitiVillaggioOstileNegoziaKo);
                    if(Math.random() < 0.4) { // 40% chance di attacco dopo fallimento
                        consequenceText = "Ti attaccano!";
                        // Mostra esito negoziazione fallita, poi triggera attacco
                        showEventPopup(outcomeTitle, outcomeDesc, [], checkResult, consequenceText);
                        triggerRandomEvent(['predoni']); // Usa evento predoni standard
                        return; // Esce
                    }
                }
            }
            break;

        case 'pericolo_ambientale':
        case 'pericolo_ambientale_notturno':
            outcomeTitle = "Esito Pericolo";
            let skill = 'agilita'; // Default
            if (context.subType === 'presagio_check') skill = 'presagio';
            // Usa la difficoltà specifica del sottotipo salvata nel contesto
            let hazardDifficulty = (context.subType === 'agilita_check' ? (isDay ? 12 : 13) : (isDay ? 13 : 14));
            hazardDifficulty += (context.difficultyMod || 0); // Aggiunge mod generico (notte)
            checkResult = performSkillCheck(skill, hazardDifficulty);
            if (checkResult.success) { outcomeDesc = getRandomText(esitiPericoloAmbientaleEvitato); }
            else {
                const hazardDmg = context.damage || getRandomInt(1,3); // Usa danno dal contesto o default
                outcomeDesc = getRandomText(esitiPericoloAmbientaleColpito);
                player.hp = Math.max(0, player.hp - hazardDmg);
                player.isInjured = true; // Stato Ferito
                consequenceText = `Subisci ${hazardDmg} HP di danno e rimani ferito.`;
                statsChanged = true;
            }
            break;

        case 'dilemma_morale':
            outcomeTitle = "Conseguenze";
            if (choiceKey === 'N') { outcomeDesc = getRandomText(esitiDilemmaMoraleIgnora); }
            else if (choiceKey === 'I') {
                checkResult = performSkillCheck('presagio', effectiveDifficulty); // Prova su Presagio per intuire la situazione
                if (checkResult.success) { // Intuito corretto -> esito positivo
                    outcomeDesc = getRandomText(esitiDilemmaMoraleIndagaOkPositivo);
                    if (Math.random() < 0.5) { // 50% chance di loot bonus
                        const res = Math.random() < 0.5 ? 'food' : 'water'; const amt = getRandomInt(1, 2);
                        player[res] += amt; consequenceText = `Trovi ${amt} ${res}.`; statsChanged = true;
                    }
                } else { // Intuito fallito -> esito negativo
                     outcomeDesc = getRandomText(esitiDilemmaMoraleIndagaOkNegativo);
                     if (Math.random() < 0.5) { // 50% chance di danno
                        const dmg = getRandomInt(1, 3); player.hp = Math.max(0, player.hp - dmg);
                        player.isInjured = true; // Stato Ferito
                        consequenceText = `Vieni coinvolto e ferito (-${dmg} HP).`; statsChanged = true;
                     }
                }
            }
            break;

        case 'orrore_indicibile':
            outcomeTitle = "Confronto con l'Ignoto";
            let sanityDmg = 0;
            switch(choiceKey) {
                case 'F': // Fuga (Agilità)
                    checkResult = performSkillCheck('agilita', effectiveDifficulty);
                    if (checkResult.success) { outcomeDesc = getRandomText(esitiOrroreIndicibileFugaOk); }
                    else { outcomeDesc = getRandomText(esitiOrroreIndicibileFugaKo); sanityDmg = context.sanityDamage || 1; consequenceText = `Il terrore ti sfianca (-${sanityDmg} HP).`; }
                    break;
                case 'A': // Affronta (Vigore)
                    checkResult = performSkillCheck('vigore', effectiveDifficulty + 1); // Affrontare è più difficile
                    if (checkResult.success) { outcomeDesc = getRandomText(esitiOrroreIndicibileAffrontaOk); }
                    else { outcomeDesc = getRandomText(esitiOrroreIndicibileAffrontaKo); sanityDmg = (context.sanityDamage || 1) * 2; consequenceText = `La tua mente vacilla (-${sanityDmg} HP).`; }
                    break;
            }
             // Applica danni "sanità" (HP)
            if (sanityDmg > 0) { player.hp = Math.max(0, player.hp - sanityDmg); statsChanged = true; }
            break;

        case 'rifugio_scelta': // Evento ispezione rifugio (giorno)
            if (choiceKey === 'L') {
                outcomeTitle = "Prudenza";
                outcomeDesc = "Decidi di non rischiare e lasci perdere.";
            } else if (choiceKey === 'I') {
                outcomeTitle = "Ispezione Rifugio";
                checkResult = performSkillCheck('tracce', context.difficulty || 11); // Usa difficoltà dal contesto
                if (checkResult.success) {
                    const outcomeRoll = Math.random();
                    if (outcomeRoll < 0.4) { // Loot
                        const resType = Math.random() < 0.5 ? 'food' : 'water'; const foundAmount = getRandomInt(1, 2);
                        player[resType] += foundAmount;
                        outcomeDesc = getRandomText(esitiRifugioIspezionaOkLoot); consequenceText = `Trovi ${foundAmount} ${resType}.`; statsChanged = true;
                    } else if (outcomeRoll < 0.7) { // Lore
                        outcomeDesc = getRandomText(esitiRifugioIspezionaOkLore); consequenceText = `"${getRandomText(loreFragments)}"`;
                    } else { // Nulla
                        outcomeDesc = getRandomText(esitiRifugioIspezionaKoNulla); consequenceText = "Non trovi nulla di valore.";
                    }
                } else { // Fallimento check Tracce
                    const outcomeRoll = Math.random();
                    if (outcomeRoll < 0.5) { // Trappola
                        const dmg = getRandomInt(1, 2); player.hp = Math.max(0, player.hp - dmg);
                        player.isInjured = true; // Stato Ferito
                        outcomeDesc = getRandomText(esitiRifugioIspezionaKoTrappola); consequenceText = `Scatta una trappola e ti ferisci! (-${dmg} HP).`; statsChanged = true;
                    } else { // Nulla
                        outcomeDesc = getRandomText(esitiRifugioIspezionaKoNulla); consequenceText = "Non trovi nulla di nascosto.";
                    }
                }
            }
            break; // Fine case 'rifugio_scelta'

        case 'ritrovamento_dubbio':
            if (choiceKey === 'L') {
                outcomeTitle = "Prudenza";
                outcomeDesc = "Il tuo istinto ti dice di diffidare. Prosegui.";
            } else if (choiceKey === 'P') {
                outcomeTitle = "Rischio Calcolato";
                outcomeDesc = "Ti avvicini con cautela...";
                checkResult = performSkillCheck('presagio', effectiveDifficulty);
                if (checkResult.success) { // Successo Presagio - Loot!
                    const lootType = Math.random() < 0.5 ? 'food' : 'water'; const amount = getRandomInt(1, 2);
                    player[lootType] += amount;
                    outcomeDesc += `\n${getRandomText(["Sembra tutto a posto. Trovi provviste utili!", "È un colpo di fortuna!", "Il contenuto è genuino."])}`;
                    consequenceText = `Hai trovato ${amount} ${lootType}.`; statsChanged = true;
                    addMessage("Ritrovamento fortunato!", "info");
                } else { // Fallimento Presagio - Trappola/Pericolo!
                    outcomeDesc += `\n${getRandomText(["Appena tocchi l'oggetto, scatta una trappola!", "Era un'esca!", "Qualcosa non torna..."])}`;
                    const trapType = Math.random();
                    if (trapType < 0.6) { // Danno HP
                        const dmg = getRandomInt(1, 3); player.hp = Math.max(0, player.hp - dmg);
                        player.isInjured = true; // Stato Ferito
                        consequenceText = `Vieni ferito dalla trappola! (-${dmg} HP).`; statsChanged = true;
                        addMessage("Era una trappola!", "warning", true);
                    } else { // Imboscata Predoni
                        consequenceText = "Sei caduto in un'imboscata!";
                        addMessage("Imboscata!", "warning", true);
                        // Mostra esito fallimento, poi triggera predoni
                        showEventPopup(outcomeTitle, outcomeDesc, [], checkResult, consequenceText);
                        triggerRandomEvent(['predoni']);
                        return; // Esce
                    }
                }
            }
             break; // <--- !! BREAK AGGIUNTO !!

         // --- NUOVO EVENTO PER STATO MALATO --- (Semplificato per ora)
        case 'acqua_contaminata':
            outcomeTitle = "Acqua Sospetta";
            if (choiceKey === 'I') { // Scelta Ignora
                outcomeDesc = "Decidi saggiamente di non bere quell'acqua dall'aspetto terribile.";
                // Nessuna conseguenza, nessuna stats cambiata
            } else if (choiceKey === 'B') { // Scelta Bevi
                checkResult = performSkillCheck('vigore', effectiveDifficulty); // Check su Vigore
                if (checkResult.success) {
                    outcomeDesc = "Bevi con cautela e non sembra avere effetti negativi. Ti senti rinfrescato.";
                    player.water += 2; // Bonus acqua se resisti
                    consequenceText = "Guadagni 2 Acqua.";
                    statsChanged = true; // Aggiorniamo le stats perché l'acqua è cambiata
                } else {
                    outcomeDesc = "L'acqua aveva un sapore strano... inizi a sentirti poco bene.";
                    player.isSick = true; // Stato Malato
                    consequenceText = "Ti senti Malato.";
                    statsChanged = true; // Aggiorniamo le stats per mostrare lo stato malato
                }
            }
            break;

        default:
            console.warn(`Evento non gestito in handleEventChoice: ${context.event}`);
            outcomeTitle = "Evento Sconosciuto";
            outcomeDesc = "L'esito non è chiaro...";
            break;
    }

    // --- Gestione comune fine evento ---
    hideEventScreen(); // Nasconde il popup delle scelte QUI, prima di mostrare l'esito

    if (statsChanged) {
        renderStats();
        if (checkGameOver()) return; // Esce se il giocatore muore dopo l'evento
    }

    // Mostra popup finale dell'evento (con l'esito)
    // Usa outcomeChoices che di solito è vuoto, a meno che un esito non porti ad altre scelte (raro)
    showEventPopup(outcomeTitle, outcomeDesc, outcomeChoices, checkResult, consequenceText);
}

function checkGameOver() {
    if (player.hp <= 0 && gameActive) {
        showEndGameMessage(false);
        return true;
    }
    return false;
}

function movePlayer(dx, dy) {
    if (!gameActive || eventScreenActive) return;

    const nextX = player.x + dx;
    const nextY = player.y + dy;

    // Controllo confini mappa
    if (nextX < 0 || nextX >= MAP_WIDTH || nextY < 0 || nextY >= MAP_HEIGHT) {
        addMessage("Non puoi andare in quella direzione.");
        return;
    }

    // Aggiorna posizione giocatore
    player.x = nextX;
    player.y = nextY;

    // Gestione ciclo Giorno/Notte
    if (isDay) {
        dayMovesCounter++;
        if (dayMovesCounter >= DAY_LENGTH_MOVES) {
            isDay = false;
            dayMovesCounter = 0; // Resetta contatore
            addMessage("[FASE] Il sole tramonta. È calata la NOTTE. Cerca un rifugio!", 'info', true);
            renderMap(); // Aggiorna mappa per possibile cambio stile notturno
            renderStats(); // Aggiorna UI per indicare Notte
        }
    } else {
        // Azioni per ogni passo notturno? (Al momento la difficoltà è gestita negli eventi)
    }

    const currentTile = map[player.y]?.[player.x];
    if (!currentTile) {
        console.error("ERRORE: Casella non valida a", player.x, player.y);
        addMessage("Errore nel terreno!", "warning");
        return;
    }

    // Gestisce evento sulla casella (che può mostrare un popup)
    // handleTileEvent gestisce anche il passaggio da Notte a Giorno nel rifugio
    const popupWasShownByEvent = handleTileEvent(currentTile);

    // Render mappa/stats solo se NON è stato mostrato un popup dall'evento
    // e se il gioco è ancora attivo (non game over)
    if (!popupWasShownByEvent && gameActive) {
        renderMap();
        renderStats(); // Render stats dopo movimento SE non c'è popup
    }
    // checkGameOver è già chiamato all'interno di handleTileEvent se necessario
}

function handleKeyPress(event) {
     // Ignora se tasto tenuto premuto
    if (event.repeat) return;

    if (eventScreenActive && currentEventChoices.length > 0) {
        // Gestione input per scelte evento
        const key = event.key.toUpperCase();
        const choice = currentEventChoices.find(c => c.key === key);
        if (choice) {
            event.preventDefault(); // Previene azione default (es. scroll pagina)
            handleEventChoice(key);
        }
         // Se il tasto non corrisponde a una scelta, non fare nulla
    } else if (gameActive && !eventScreenActive) {
        // Gestione input per movimento
        let dx = 0, dy = 0;
        let validMoveKey = false;
        const lowerCaseKey = event.key.toLowerCase();

        switch (lowerCaseKey) {
            case "arrowup": case "w": dy = -1; validMoveKey = true; break;
            case "arrowdown": case "s": dy = 1; validMoveKey = true; break;
            case "arrowleft": case "a": dx = -1; validMoveKey = true; break;
            case "arrowright": case "d": dx = 1; validMoveKey = true; break;
        }

        if (validMoveKey) {
            event.preventDefault(); // Previene scroll pagina con frecce
            movePlayer(dx, dy);
        }
    }
     // Ignora altri tasti se gioco non attivo o evento senza scelte attivo
}

function setupInputListeners() {
    // Rimuove listener precedente per sicurezza (evita duplicati)
    document.removeEventListener('keydown', handleKeyPress);
    // Aggiunge nuovo listener
    document.addEventListener('keydown', handleKeyPress);
}

// Avvio del gioco all'onload
window.onload = () => {
    mapDisplay.textContent = "Caricamento..."; // Messaggio iniziale
    initializeGame(); // Avvia direttamente il gioco
}; 
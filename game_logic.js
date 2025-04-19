/**
 * The Safe Place - Minimal Roguelike
 * File: game_logic.js (Versione Pulita)
 * Descrizione: Contiene la logica principale del gioco, la gestione degli eventi,
 * il movimento, il rendering e le interazioni del giocatore.
 * Le funzioni utility da utils.js sono state integrate qui.
 * Il codice commentato obsoleto è stato rimosso.
 */

// --- FUNZIONI UTILITY (Integrate da utils.js e ottimizzate) ---

// getRandomInt è stato spostato in game_data.js per risolvere ReferenceError

/**
 * Seleziona e restituisce un elemento testuale casuale da un array.
 * @param {string[]} textArray - L'array di stringhe tra cui scegliere.
 * @returns {string} Una stringa casuale dall'array, o "" se l'array è vuoto o non valido.
 */
function getRandomText(textArray) {
    if (!textArray || textArray.length === 0) return "";
    return textArray[Math.floor(Math.random() * textArray.length)];
}

/**
 * Aggiunge un messaggio al log di gioco e aggiorna l'interfaccia.
 * @param {string} text - Il testo del messaggio da aggiungere.
 * @param {string} [type='normal'] - Il tipo di messaggio ('normal', 'warning', 'info', 'lore', 'success'). Influisce sullo stile.
 * @param {boolean} [important=false] - Se true, il messaggio viene visualizzato in grassetto.
 */
function addMessage(text, type = 'normal', important = false) {
    if (typeof text !== 'string') text = String(text); // Assicura che sia una stringa
    if (!text || !messagesList) return; // Esce se non c'è testo o riferimento alla lista

    let prefix = "";
    let cssClass = ""; // Classe CSS per l'elemento <li>

    switch(type) {
        case 'warning':
            prefix = "<span class='msg-warning'>[!]</span> ";
            cssClass = "log-warning"; // Usa la classe definita per i warning
            break;
        case 'info':
            prefix = "<span class='msg-info'>[*]</span> ";
            cssClass = "info"; // Classe generica per info
            break;
        case 'lore':
            prefix = ""; // Nessun prefisso per la lore
            cssClass = "lore"; // Classe specifica per lore
            break;
        case 'success':
             prefix = ""; // Nessun prefisso per successo
             cssClass = "success"; // Classe specifica per successo
             break;
        // 'normal' non ha prefisso né classe speciale di default
    }

    // Applica grassetto se richiesto
    if (important) text = `<strong>${text}</strong>`;

    // Aggiunge il messaggio alla FINE dell'array logico (il CSS gestirà l'ordine inverso)
    messages.push({ text: prefix + text, class: cssClass });

    // Mantiene il log entro la dimensione massima
    if (messages.length > MAX_MESSAGES) {
        // Rimuove il messaggio più vecchio (il primo dell'array)
        messages.shift();
    }

    // Aggiorna la visualizzazione nel DOM
    renderMessages();
}


// --- VARIABILI DI STATO GLOBALI ---
let player = {}; // Oggetto contenente i dati del giocatore
let map = []; // Array bidimensionale rappresentante la mappa
let messages = []; // Array contenente gli oggetti messaggio per il log {text: string, class: string}
let gameActive = false; // Flag per indicare se il gioco è in corso
let eventScreenActive = false; // Flag per indicare se un popup evento/inventario è attivo VISIVAMENTE
let gamePaused = false; // << NUOVO: Flag per bloccare input giocatore (eventi, animazioni, etc.)
let currentEventChoices = []; // Array per memorizzare le scelte dell'evento corrente (per input tastiera)
let currentEventContext = null; // Oggetto per memorizzare il contesto dell'evento corrente
let dayMovesCounter = 0; // Contatore dei passi effettuati durante il giorno
let nightMovesCounter = 0; // Contatore dei passi effettuati durante la notte
let isDay = true; // Flag per indicare se è giorno (true) o notte (false)
let daysSurvived = 0; // Contatore dei giorni sopravvissuti
let easterEggPixelDebhFound = false; // Flag per easter egg unico
let uniqueEventWebRadioFound = false; // Flag per evento unico WebRadio

// Costante per il numero di passi dopo i quali la notte passerà automaticamente al giorno
const NIGHT_LENGTH_MOVES = 8; // Dopo 8 passi di notte, sorgerà il sole

// Costanti per le probabilità di trovare testi
const FLAVOR_TEXT_CHANCE = 0.20; // 20% di probabilità di mostrare un flavor text dopo un movimento
const LORE_FRAGMENT_CHANCE = 0.02; // 2% di probabilità di trovare un frammento di lore per passo

// Costanti per Eventi Complessi
const COMPLEX_EVENT_CHANCE = 0.15; // 15% probabilità base di un evento complesso per passo
// Probabilità relative dei tipi di evento complesso (devono sommarsi a 1 o essere normalizzate)
const COMPLEX_EVENT_TYPE_WEIGHTS = {
    PREDATOR: 0.20,      // 20%
    ANIMAL: 0.25,        // 25% (più comune)
    TRACKS: 0.20,        // 20%
    ENVIRONMENTAL: 0.15, // 15%
    DILEMMA: 0.10,       // 10%
    HORROR: 0.10         // 10% (solo di notte)
};
// Probabilità per l'esito dell'evento Tracce Strane (dopo successo check)
const TRACCE_LOOT_CHANCE = 0.35;        // 35% probabilità di trovare loot
const TRACCE_LORE_CHANCE = 0.25;        // 25% probabilità di trovare lore
const TRACCE_DANGER_CHANCE = 0.15;      // 15% probabilità di finire in pericolo (testo)
// Il restante 25% (100 - 35 - 25 - 15) sarà 'Nulla'

// --- NUOVE COSTANTI PER EFFETTI PASSIVI STATUS ---
const PASSIVE_HUNGER_DAMAGE = 0.1; // Danno HP per passo se Sazietà <= 0
const PASSIVE_THIRST_DAMAGE = 0.15; // Danno HP per passo se Idratazione <= 0
const PASSIVE_INJURY_DAMAGE = 0.05; // Danno HP per passo se Ferito
const PASSIVE_SICKNESS_DAMAGE = 0.08; // Danno HP per passo se Malato
const SICKNESS_EXTRA_FOOD_COST = 0.05; // Costo extra Sazietà per passo se Malato
const SICKNESS_EXTRA_WATER_COST = 0.08; // Costo extra Idratazione per passo se Malato
const EASTER_EGG_CHANCE = 0.003; // Probabilità (0.3%) per gli eventi unici (ridotta ulteriormente)
// --- FINE NUOVE COSTANTI ---

// --- RIFERIMENTI AGLI ELEMENTI DEL DOM ---
// Otteniamo i riferimenti agli elementi HTML una sola volta all'inizio per efficienza.
const gameContainer = document.getElementById('game-container');
const endScreen = document.getElementById('end-screen');
const endTitle = document.getElementById('end-title');
const endMessage = document.getElementById('end-message');
const mapDisplay = document.getElementById('map-display');
// Riferimenti per le statistiche nella colonna destra
const statsList = document.getElementById('stats-list'); // Non usato direttamente, ma utile per contesto
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
// Riferimenti per le risorse nella colonna sinistra
const statFood = document.getElementById('stat-food');
const statWater = document.getElementById('stat-water');
const statCondition = document.getElementById('stat-condition'); // Riferimento per lo stato (Ferito/Malato)
// Riferimenti per le info di gioco nella colonna destra
const posX = document.getElementById('pos-x');
const posY = document.getElementById('pos-y');
const tileType = document.getElementById('tile-type');
const statDayTime = document.getElementById('stat-day-time');
// Riferimenti per log, controlli, overlay
const messagesList = document.getElementById('messages');
const moveButtons = document.querySelectorAll('.control-grid button'); // Selettore più specifico per i bottoni nella griglia
// const inventoryButton = document.getElementById('btn-inventory'); // Commentato - Non più necessario
const eventOverlay = document.getElementById('event-overlay');
const eventPopup = document.getElementById('event-popup'); // Contenitore interno del popup
const eventTitle = document.getElementById('event-title');
const eventContent = document.getElementById('event-content');
const eventChoicesContainer = document.getElementById('event-choices'); // Contenitore scelte DENTRO il popup
const legendList = document.getElementById('legend'); // ID CORRETTO
const continueButton = eventOverlay.querySelector('.continue-button');
const inventoryList = document.getElementById('inventory'); // ID CORRETTO
const restartButton = document.getElementById('restart-button');


// --- FUNZIONI PRINCIPALI DI GIOCO ---

/**
 * Inizializza lo stato del gioco, genera personaggio e mappa, e avvia il rendering iniziale.
 */
function initializeGame() {
    // Pulisce lo stato precedente
    messages = [];
    player = {};
    map = [];
    gameActive = false;
    eventScreenActive = false;
    gamePaused = false; // << RESET gamePaused
    dayMovesCounter = 0;
    nightMovesCounter = 0;
    isDay = true;
    daysSurvived = 0;
    easterEggPixelDebhFound = false; // Resetta il flag a inizio partita
    uniqueEventWebRadioFound = false; // Resetta flag evento WebRadio

    try {
        // Genera personaggio e mappa (funzioni definite più avanti)
        generateCharacter();
        if (!player || typeof player.vigore !== 'number') {
            throw new Error("Generazione Personaggio Fallita o personaggio non valido.");
        }
        generateMap();
        if (!map || map.length === 0 || typeof player.x !== 'number' || typeof player.y !== 'number') {
            throw new Error("Generazione Mappa Fallita o posizione giocatore non valida.");
        }
    } catch(e) {
        console.error("ERRORE CRITICO INIZIALIZZAZIONE:", e);
        // Mostra errore all'utente in modo più visibile
        if(gameContainer) gameContainer.innerHTML = `<p style='color:red; padding: 20px;'>ERRORE INIZIALIZZAZIONE: ${e.message}. Impossibile avviare il gioco. Ricarica la pagina.</p>`;
        return; // Ferma l'esecuzione se l'inizializzazione fallisce
    }

    // Imposta il gioco come attivo
    gameActive = true;
    // Usa la classe 'visible' per gestire la visibilità con transizioni
    if(eventOverlay) eventOverlay.classList.remove('visible');
    if(gameContainer) gameContainer.classList.remove('overlay-active');
    if(endScreen) endScreen.style.display = 'none';
    if(gameContainer) gameContainer.style.display = 'flex'; // Mostra l'interfaccia di gioco

    // Effettua il rendering iniziale dell'interfaccia
    try {
        // console.log("--- Inizio Rendering Iniziale ---"); // LOG RIMOSSO
        // console.log("Chiamo renderLegend()..."); // LOG RIMOSSO
        renderLegend();
        // console.log("...renderLegend() completato."); // LOG RIMOSSO

        // console.log("Chiamo renderStats()..."); // LOG RIMOSSO
        renderStats(); // Renderizza statistiche e risorse
        // console.log("...renderStats() completato."); // LOG RIMOSSO

        // console.log("Chiamo renderInventory()..."); // LOG RIMOSSO
        renderInventory(); // Renderizza l'inventario iniziale
        // console.log("...renderInventory() completato."); // LOG RIMOSSO

        // console.log("Chiamo renderMap()..."); // LOG RIMOSSO
        renderMap(); // Renderizza la mappa
        // console.log("...renderMap() completato."); // LOG RIMOSSO

        // console.log("Chiamo renderMessages()..."); // LOG RIMOSSO
        renderMessages(); // Pulisce il log precedente
        // console.log("...renderMessages() completato."); // LOG RIMOSSO

        // console.log("Chiamo addMessage() iniziale..."); // LOG RIMOSSO
        addMessage(`Inizio del viaggio. HP:${player.hp}, Sazietà:${player.food}, Idratazione:${player.water}. È Giorno.`, 'info');
        // console.log("...addMessage() iniziale completato."); // LOG RIMOSSO
        // console.log("--- Fine Rendering Iniziale (Try Block) ---"); // LOG RIMOSSO
    } catch (e) {
        console.error("ERRORE RENDER INIZIALE:", e);
        // console.log("--- Errore durante Rendering Iniziale (Catch Block) ---"); // LOG RIMOSSO
        if(mapDisplay) mapDisplay.textContent = "Errore nel rendering iniziale!";
        gameActive = false; // Impedisce di giocare se il rendering fallisce
    }

    // Se tutto è andato bene, abilita i controlli e imposta i listener
    if (gameActive) {
        setupInputListeners();

        // --- NUOVO: Imposta focus esplicito ---
        try {
            document.body.focus();
            // console.log(">>> initializeGame: Focus impostato su document.body"); // RIMOSSO LOG
        } catch (e) {
            console.error("Errore nell'impostare il focus iniziale:", e);
        }
    }
}

/**
 * Aggiunge un oggetto all'inventario del giocatore o ne aumenta la quantità se già presente.
 * @param {string} itemId - L'ID dell'oggetto da aggiungere (corrispondente a una chiave in itemData).
 * @param {number} quantity - La quantità dell'oggetto da aggiungere.
 */
function addItemToInventory(itemId, quantity) {
    if (!player || !player.inventory) {
        console.error("Tentativo di aggiungere oggetto a inventario non inizializzato.");
        return;
    }
    if (quantity <= 0) return; // Non aggiungere quantità nulle o negative

    // Cerca se l'oggetto è già presente
    const existingItem = player.inventory.find(item => item.itemId === itemId);

    if (existingItem) {
        // Se esiste, aumenta la quantità
        existingItem.quantity += quantity;
    } else {
        // Se non esiste, aggiungi un nuovo oggetto all'inventario
        // TODO: Potrebbe essere utile verificare se itemId esiste in itemData
        player.inventory.push({ itemId: itemId, quantity: quantity });
    }

    // Aggiorna la visualizzazione dell'inventario se la funzione è già definita
    if (typeof renderInventory === 'function') {
        renderInventory();
    }
}

/**
 * Genera le statistiche e l'inventario iniziale del personaggio giocante.
 */
function generateCharacter() {
    // Statistiche base con una piccola variazione casuale
    player = {
        name: "Ultimo",
        vigore: 9 + getRandomInt(0, 2),      // Resistenza fisica, HP
        potenza: 9 + getRandomInt(0, 2),     // Forza fisica, combattimento
        agilita: 14 + getRandomInt(0, 2),    // Schivata, velocità, fuga
        tracce: 14 + getRandomInt(0, 2),     // Seguire/nascondere tracce, furtività, osservazione
        influenza: 6 + getRandomInt(0, 2),   // Interazione sociale, persuasione, intimidazione
        presagio: 7 + getRandomInt(0, 2),    // Intuizione, percepire pericoli/opportunità nascoste
        adattamento: 9 + getRandomInt(0, 2), // Resistenza a malattie/veleni, riparazioni?
        acquisita: 8 + getRandomInt(0, 2),   // Conoscenza del mondo pre-collasso, tecnologia? (Non usata attivamente ora)

        // Risorse e stato
        maxHp: 0, // Calcolato dopo le stats base
        hp: 0,
        food: STARTING_FOOD,
        water: STARTING_WATER,

        // Posizione (verrà definita in generateMap)
        x: undefined,
        y: undefined,

        // Stati negativi
        isInjured: false, // Flag Ferito
        isSick: false,    // Flag Malato

        // Inventario: array di oggetti { itemId: string, quantity: number }
        inventory: []
    };

    // Calcola HP massimi basati sul Vigore
    player.maxHp = 10 + player.vigore;
    player.hp = player.maxHp; // Inizia con HP pieni

    // Aggiunge oggetti iniziali all'inventario
    // Nota: La funzione addItemToInventory è definita più avanti, ma JS gestisce l'hoisting.
    addItemToInventory('bandages_dirty', 2);
    addItemToInventory('water_purified_small', 1);
    addItemToInventory('canned_food', 1);
    addItemToInventory('medicine_crude', 1);
}

/**
 * Genera la mappa di gioco con diversi tipi di terreno e posiziona Start ed End.
 */
function generateMap() {
    map = []; // Resetta la mappa
    let startPos = null; // Posizione di partenza
    let endPos = null;   // Posizione di arrivo

    // 1. Genera mappa base con terreni casuali
    for (let y = 0; y < MAP_HEIGHT; y++) {
        map[y] = [];
        for (let x = 0; x < MAP_WIDTH; x++) {
            let tileSymbol = TILE_SYMBOLS.PLAINS; // Default a pianura
            const rand = Math.random(); // Numero casuale tra 0 e 1

            // Assegna tipo di tile in base a probabilità
            if (rand < 0.10) tileSymbol = TILE_SYMBOLS.MOUNTAIN;
            else if (rand < 0.20) tileSymbol = TILE_SYMBOLS.FOREST;
            else if (rand < 0.26) tileSymbol = TILE_SYMBOLS.RIVER;
            else if (rand < 0.30) tileSymbol = TILE_SYMBOLS.VILLAGE;
            else if (rand < 0.32) tileSymbol = TILE_SYMBOLS.CITY;
            else if (rand < 0.35) tileSymbol = TILE_SYMBOLS.REST_STOP;
            // Altrimenti rimane PLAINS

            map[y][x] = { type: tileSymbol, visited: false }; // Crea oggetto tile
        }
    }

    // 2. Posiziona il punto di Start ('S')
    let startX, startY, attempts = 0;
    const maxAttempts = 100;
    // Cerca una posizione valida (pianura nella parte sinistra della mappa)
    do {
        startX = getRandomInt(1, Math.floor(MAP_WIDTH / 4)); // Preferibilmente a sinistra
        startY = getRandomInt(1, Math.floor(MAP_HEIGHT / 4)); // Preferibilmente in alto
        attempts++;
    } while (
        (!map[startY]?.[startX] || map[startY][startX].type !== TILE_SYMBOLS.PLAINS) // Deve essere pianura valida
        && attempts < maxAttempts
    );
    // Se non trova una posizione valida dopo N tentativi, usa un fallback sicuro
    if (attempts >= maxAttempts) { startX = 1; startY = 1; console.warn("Posizione Start fallback utilizzata."); }
    map[startY][startX] = { type: TILE_SYMBOLS.START, visited: true }; // Imposta tile Start
    startPos = { x: startX, y: startY };

    // 3. Posiziona il punto di End ('E')
    let endX, endY;
    attempts = 0;
    // Cerca una posizione valida (non montagna/fiume, lontana dallo start, nella parte destra)
    do {
        endX = getRandomInt(Math.floor(MAP_WIDTH * 3 / 4), MAP_WIDTH - 2); // Preferibilmente a destra
        endY = getRandomInt(Math.floor(MAP_HEIGHT * 3 / 4), MAP_HEIGHT - 2); // Preferibilmente in basso
        attempts++;
        if (attempts > maxAttempts) { // Fallback se non trova posizione ideale
             endX = MAP_WIDTH - 2; endY = MAP_HEIGHT - 2;
             console.warn("Posizione End fallback utilizzata.");
             break;
        }
    } while (
        !map[endY]?.[endX] // Deve essere una casella valida
        || map[endY][endX].type === TILE_SYMBOLS.MOUNTAIN // Non su montagna
        || map[endY][endX].type === TILE_SYMBOLS.RIVER   // Non su fiume
        || (endX === startX && endY === startY) // Non sulla stessa casella dello start
    );

    // Assicura che la casella di End esista prima di modificarla
    if (map[endY]?.[endX]) {
        map[endY][endX] = { type: TILE_SYMBOLS.END, visited: false };
        endPos = { x: endX, y: endY };
    } else { // Fallback estremo se le coordinate generate non sono valide
         console.error("ERRORE CRITICO: Impossibile posizionare End. Uso fallback estremo.");
         map[MAP_HEIGHT - 2][MAP_WIDTH - 2] = { type: TILE_SYMBOLS.END, visited: false };
         endPos = { x: MAP_WIDTH - 2, y: MAP_HEIGHT - 2 };
    }

    // 4. Assegna posizione iniziale al giocatore
    player.x = startPos.x;
    player.y = startPos.y;
}

/**
 * Aggiorna la visualizzazione delle statistiche, risorse e stato del giocatore nell'interfaccia.
 */
function renderStats() {
    // Usa try-catch per evitare errori fatali se un elemento non viene trovato
    try {
        // Aggiorna statistiche principali (colonna dx)
        statHp.textContent = Math.floor(player?.hp ?? 0); // Arrotondo HP a interi
        statMaxHp.textContent = Math.floor(player?.maxHp ?? 0); // Arrotondo MaxHP a interi
        statVig.textContent = player?.vigore ?? '--';
        statPot.textContent = player?.potenza ?? '--';
        statAgi.textContent = player?.agilita ?? '--';
        statTra.textContent = player?.tracce ?? '--';
        statInf.textContent = player?.influenza ?? '--';
        statPre.textContent = player?.presagio ?? '--';
        statAda.textContent = player?.adattamento ?? '--';
        statAcq.textContent = player?.acquisita ?? '--';

        // Aggiorna risorse (colonna sx)
        // Usa Math.floor() per mostrare solo interi
        statFood.textContent = Math.floor(player?.food ?? 0);
        statWater.textContent = Math.floor(player?.water ?? 0);
        // Applica/rimuovi classe 'low-resource' per effetto visivo (es. rosso lampeggiante)
        statFood.classList.toggle('low-resource', (player?.food ?? 99) <= 1);
        statWater.classList.toggle('low-resource', (player?.water ?? 99) <= 1);

        // Aggiorna stato condizione (colonna sx)
        if (statCondition) {
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
            statCondition.textContent = statusText;
            statCondition.className = statusClass; // Imposta la classe corretta per lo stile CSS
        }

        // Aggiorna info di gioco (colonna dx)
        posX.textContent = player?.x ?? '--';
        posY.textContent = player?.y ?? '--';

        // Aggiorna tipo di luogo corrente
        if (gameActive && map?.[player?.y]?.[player?.x]) {
            const currentTile = map[player.y][player.x];
            tileType.textContent = TILE_DESC[currentTile.type] || 'Sconosciuto';
        } else if (gameActive) {
            tileType.textContent = 'Inizio...'; // Messaggio iniziale prima del primo movimento
        } else {
            tileType.textContent = '--'; // Se gioco non attivo
        }

        // Aggiorna indicatore Giorno/Notte
        if (statDayTime) {
            if (isDay) {
                // Calcola l'orario tra 6:00 e 19:00 in base al progresso del giorno
                // DAY_LENGTH_MOVES = 18 (il numero totale di mosse nel giorno)
                // Mappiamo 0-18 mosse su 6-19 ore (13 ore in totale)
                const currentHour = Math.floor(6 + (dayMovesCounter * 13 / DAY_LENGTH_MOVES));
                // Formatta l'ora in formato 24h con zero iniziale se necessario
                const formattedHour = currentHour.toString().padStart(2, '0');
                statDayTime.textContent = `${formattedHour}:00`;
            } else {
                statDayTime.textContent = 'Notte';
            }
        }
    } catch (e) {
        console.error("Errore durante il rendering delle statistiche:", e);
        if (tileType) tileType.textContent = 'ERR STATS'; // Indica errore nell'UI
    }
}

/**
 * Aggiorna la visualizzazione del log dei messaggi.
 */
function renderMessages() {
    if (!messagesList) return;
    try {
        // Crea una copia invertita dell'array dei messaggi PRIMA di creare l'HTML
        const reversedMessages = [...messages].reverse();
        // Ricostruisce l'HTML della lista messaggi basandosi sull'array invertito
        messagesList.innerHTML = reversedMessages.map(msg => `<li class="${msg.class || ''}">${msg.text}</li>`).join('');
    } catch (e) {
        console.error("Errore durante il rendering dei messaggi:", e);
        if (messagesList) messagesList.innerHTML = '<li>Errore nel log!</li>';
    }
}

/**
 * Aggiorna la visualizzazione dell'inventario nella colonna sinistra.
 */
function renderInventory() {
    if (!inventoryList) return; // Verifica che l'elemento esista
    if (!player || !Array.isArray(player.inventory)) {
        inventoryList.innerHTML = '<li>Errore inventario</li>';
        console.error("Errore: player.inventory non è un array valido.");
        return;
    }

    // Pulisce la lista precedente
    inventoryList.innerHTML = '';

    if (player.inventory.length === 0) {
        inventoryList.innerHTML = '<li>-- Vuoto --</li>';
        return;
    }

    // Aggiunge un elemento <li> per ogni oggetto nell'inventario
    player.inventory.forEach(slot => {
        const itemInfo = ITEM_DATA[slot.itemId]; // Recupera dati oggetto da game_data.js
        if (itemInfo) {
            const li = document.createElement('li');
            li.textContent = `${itemInfo.name} (${slot.quantity})`;
            // Aggiunge un data attribute per identificare l'oggetto (utile per interazioni future)
            li.dataset.itemId = slot.itemId;
            inventoryList.appendChild(li);
        } else {
            // Logga un avviso se un oggetto nell'inventario non esiste in ITEM_DATA
            console.warn(`Oggetto con ID ${slot.itemId} nell'inventario non trovato in ITEM_DATA.`);
            const li = document.createElement('li');
            li.textContent = `Oggetto Sconosciuto (${slot.quantity})`;
            li.style.color = 'red'; // Evidenzia l'errore
            inventoryList.appendChild(li);
        }
    });
}

/**
 * Aggiorna la visualizzazione della legenda della mappa.
 */
function renderLegend() {
    if (!legendList) {
        console.error("renderLegend: Errore - Elemento legendList non trovato!");
        return;
    }
    try {
        legendList.innerHTML = '';
        // Definisce gli elementi della legenda
        const legendItems = [
            { s: TILE_SYMBOLS.PLAYER, d: TILE_DESC['@'] },
            { s: TILE_SYMBOLS.PLAINS, d: TILE_DESC['.'] },
            { s: TILE_SYMBOLS.FOREST, d: TILE_DESC['F'] },
            { s: TILE_SYMBOLS.MOUNTAIN, d: TILE_DESC['M'] },
            { s: TILE_SYMBOLS.RIVER, d: TILE_DESC['~'] },
            { s: TILE_SYMBOLS.VILLAGE, d: TILE_DESC['V'] },
            { s: TILE_SYMBOLS.CITY, d: TILE_DESC['C'] },
            { s: TILE_SYMBOLS.REST_STOP, d: TILE_DESC['R'] },
            { s: TILE_SYMBOLS.START, d: TILE_DESC['S'] },
            { s: TILE_SYMBOLS.END, d: TILE_DESC['E'] }
        ];
        // Crea un elemento <li> per ogni voce della legenda
        legendItems.forEach(item => {
            // Trova la chiave corrispondente al simbolo per applicare la classe CSS corretta
            const tileKey = Object.keys(TILE_SYMBOLS).find(k => TILE_SYMBOLS[k] === item.s);
            const tileClass = `tile-${tileKey ? tileKey.toLowerCase().replace(/_/g, '-') : 'unk'}`;
            // Aggiunge classe speciale per il simbolo del giocatore e della fine
            const specialClass = item.s === TILE_SYMBOLS.PLAYER ? 'player-marker' : (item.s === TILE_SYMBOLS.END ? 'tile-end' : '');

            legendList.innerHTML += `<li><span class="legend-symbol ${tileClass} ${specialClass}">${item.s}</span> = ${item.d}</li>`;
        });
    } catch (e) {
        console.error("renderLegend: Errore durante il rendering:", e);
        if (legendList) legendList.innerHTML = '<li>Errore legenda</li>';
    }
}

/**
 * Renderizza la porzione visibile della mappa di gioco centrata sul giocatore.
 */
function renderMap() {
    const display = mapDisplay;
    if (!display) { console.error("Elemento map-display non trovato!"); return; }
    if (!player || typeof player.x !== 'number' || typeof player.y !== 'number') {
        display.textContent = "ERRORE: Dati giocatore non validi per rendering mappa.";
        console.error("Dati giocatore mancanti o non validi:", player);
        return;
    }
    if (!map || !Array.isArray(map) || map.length === 0) {
        display.textContent = "ERRORE: Mappa non valida o non generata.";
        console.error("Mappa non valida:", map);
        return;
    }

    // Assicura che le coordinate del giocatore siano nei limiti della mappa
    player.x = Math.max(0, Math.min(MAP_WIDTH - 1, player.x));
    player.y = Math.max(0, Math.min(MAP_HEIGHT - 1, player.y));

    let mapString = ""; // Stringa HTML che conterrà la mappa renderizzata
    const viewWidth = 40; // Larghezza della visuale della mappa (in caratteri)
    const viewHeight = 25; // Altezza della visuale della mappa (in caratteri)
    const halfWidth = Math.floor(viewWidth / 2);
    const halfHeight = Math.floor(viewHeight / 2);

    // Calcola le coordinate di inizio della visuale (viewport)
    // Centra sul giocatore, ma limita ai bordi della mappa fisica
    let startX = Math.max(0, player.x - halfWidth);
    let startY = Math.max(0, player.y - halfHeight);
    // Assicura che la viewport non vada oltre i bordi destri/inferiori
    startX = Math.min(startX, MAP_WIDTH - viewWidth);
    startY = Math.min(startY, MAP_HEIGHT - viewHeight);
    // Ricontrolla che non sia < 0 dopo la correzione precedente (importante per mappe piccole)
    startX = Math.max(0, startX);
    startY = Math.max(0, startY);

    // Calcola le coordinate di fine della visuale
    let endX = Math.min(MAP_WIDTH, startX + viewWidth);
    let endY = Math.min(MAP_HEIGHT, startY + viewHeight);

    // Cicla sulle righe e colonne della porzione di mappa visibile
    try {
        for (let y = startY; y < endY; y++) {
            // Sicurezza extra: salta righe non valide (non dovrebbe succedere con i calcoli sopra)
            if (y < 0 || y >= map.length || !map[y]) continue;

            for (let x = startX; x < endX; x++) {
                // Sicurezza extra: salta colonne non valide
                if (x < 0 || x >= map[y].length || !map[y][x]) continue;

                // Se è la posizione del giocatore, usa il simbolo del giocatore
                if (x === player.x && y === player.y) {
                    mapString += `<span class="player-marker">${TILE_SYMBOLS.PLAYER}</span>`;
                } else {
                    // Altrimenti, usa il simbolo della casella
                    const tile = map[y][x];
                    const symbol = tile?.type || '?'; // Usa '?' se il tipo non è definito
                    // Trova la chiave corrispondente al simbolo per la classe CSS
                    const tileKey = Object.keys(TILE_SYMBOLS).find(k => TILE_SYMBOLS[k] === symbol);
                    let tileClass = `tile-${tileKey ? tileKey.toLowerCase().replace(/_/g, '-') : 'unk'}`;
                    // Aggiunge classe 'visited' se la casella è stata visitata
                    let visitedClass = tile?.visited ? 'visited' : '';
                    // Aggiunge classe 'tile-end' per la casella finale
                    let endClass = symbol === TILE_SYMBOLS.END ? 'tile-end' : '';

                    mapString += `<span class="${tileClass} ${visitedClass} ${endClass}">${symbol}</span>`;
                }
            }
            mapString += "\n"; // Aggiunge newline alla fine di ogni riga della mappa
        }
        // Aggiorna l'HTML del display della mappa
        display.innerHTML = mapString;
    } catch (e) {
        console.error("Errore durante il loop di rendering della mappa:", e);
        display.textContent = "Errore Rendering Mappa!";
    }
}

/**
 * Disabilita i controlli di movimento.
 * Aggiunge un log per il debug.
 */
function disableControls() {
    // console.log(">>> Disabilito Controlli Movimento"); // RIMOSSO DEBUG LOG
    if (!moveButtons) return;
    moveButtons.forEach(btn => btn.disabled = true);
}

/**
 * Abilita i controlli di movimento (se il gioco è attivo e non in pausa).
 * Aggiunge un log per il debug.
 */
function enableControls() {
    // console.log(">>> Abilito Controlli Movimento (Gioco attivo:", gameActive, ", Pausa:", gamePaused, ")"); // RIMOSSO DEBUG LOG
    if (gameActive && !gamePaused) { // Controlla anche gamePaused
        if (!moveButtons) return;
        moveButtons.forEach(btn => btn.disabled = false);
    } else {
        // console.log("...Abilitazione controlli saltata (Gioco non attivo o in pausa)"); // RIMOSSO DEBUG LOG
    }
}

/**
 * Esegue un check su una statistica del giocatore contro una difficoltà.
 * Applica penalità basate sullo stato (Ferito/Malato).
 * @param {string} statKey - La chiave della statistica da usare (es. 'agilita', 'vigore').
 * @param {number} difficulty - La difficoltà base del check.
 * @returns {{success: boolean, text: string}} Oggetto con l'esito (successo/fallimento) e una stringa descrittiva del tiro.
 */
function performSkillCheck(statKey, difficulty) {
    // Ottiene il valore della statistica, con fallback a 5 se non trovata
    const statValue = player[statKey] || 5;
    // Calcola il modificatore stile D&D (bonus/malus ogni 2 punti sopra/sotto 10)
    const bonus = Math.floor((statValue - 10) / 2);
    // Tira un dado a 20 facce
    const roll = getRandomInt(1, 20);

    // Applica penalità basate sullo stato del giocatore
    let difficultyPenalty = 0;
    let penaltyReason = "";
    // Penalità se Ferito e il check usa Potenza o Agilità
    if (player.isInjured && (statKey === 'potenza' || statKey === 'agilita')) {
        difficultyPenalty = 2;
        penaltyReason = " (Ferito)";
    }
    // Penalità se Malato e il check usa Vigore o Adattamento
    // Nota: Se entrambe le condizioni si applicano alla stessa stat (improbabile),
    // questa logica applica solo la penalità per Malato. Si potrebbe modificare per sommarle.
    if (player.isSick && (statKey === 'vigore' || statKey === 'adattamento')) {
        difficultyPenalty = 2; // Potrebbe sovrascrivere la penalità 'Ferito' se la stat è la stessa
        penaltyReason = " (Malato)";
    }

    // Calcola la difficoltà finale e l'esito
    const finalDifficulty = difficulty + difficultyPenalty;
    const total = roll + bonus;
    const success = total >= finalDifficulty;

    // Costruisce la stringa descrittiva del tiro
    const checkText = `Tiro ${statKey.charAt(0).toUpperCase() + statKey.slice(1)}: ${roll} + ${bonus} (bonus) = ${total} vs Difficoltà ${difficulty}${penaltyReason ? penaltyReason : ''} = ${finalDifficulty}`;

    // Ritorna l'oggetto con l'esito e la stringa
    return { success: success, text: checkText };
}

/**
 * Calcola e restituisce un descrittore qualitativo della probabilità di successo
 * per un dato skill check, basato sullo stato attuale del giocatore.
 * @param {string} statKey - La chiave della statistica da usare (es. 'agilita', 'vigore').
 * @param {number} difficulty - La difficoltà base del check.
 * @returns {string} Un descrittore testuale (es. "Favorevole", "Incerto", "Rischioso").
 */
function getSkillCheckLikelihood(statKey, difficulty) {
    if (!player || typeof player[statKey] === 'undefined') {
        // Se il giocatore o la statistica non sono validi, restituisce un valore generico
        console.warn(`getSkillCheckLikelihood: Statistica '${statKey}' non trovata nel giocatore.`);
        return "Incerto"; // O forse "Sconosciuto"?
    }

    const statValue = player[statKey];
    const bonus = Math.floor((statValue - 10) / 2);

    // Simula il calcolo delle penalità di performSkillCheck
    let difficultyPenalty = 0;
    if (player.isInjured && (statKey === 'potenza' || statKey === 'agilita')) {
        difficultyPenalty = 2;
    }
    if (player.isSick && (statKey === 'vigore' || statKey === 'adattamento')) {
        // Sovrascrive la penalità 'Ferito' se la stat è la stessa (come in performSkillCheck)
        difficultyPenalty = 2;
    }
    const finalDifficulty = difficulty + difficultyPenalty;

    // Calcola il tiro minimo necessario sul d20 per avere successo
    // Successo se: roll + bonus >= finalDifficulty  =>  roll >= finalDifficulty - bonus
    const targetRoll = finalDifficulty - bonus;

    // Mappa il tiro necessario a descrittori qualitativi
    // (Le soglie sono indicative e possono essere aggiustate con playtesting)
    if (targetRoll <= 1) return "Garantito"; // Praticamente impossibile fallire (serve 1 o meno)
    if (targetRoll <= 6) return "Molto Favorevole"; // Serve 6 o meno (75%+) - Alta probabilità
    if (targetRoll <= 10) return "Favorevole";  // Serve 10 o meno (55%+) - Buona probabilità
    if (targetRoll <= 13) return "Incerto";     // Serve 13 o meno (~40%) - Media probabilità
    if (targetRoll <= 16) return "Rischioso";   // Serve 16 o meno (25%+) - Bassa probabilità
    if (targetRoll <= 19) return "Molto Rischioso"; // Serve 19 o meno (10%+) - Bassissima probabilità
    return "Quasi Impossibile"; // Serve 20 o più
}

// --- LOGICA DI GIOCO E MOVIMENTO ---

/**
 * Controlla se una casella è attraversabile dal giocatore.
 * @param {object} tile - L'oggetto tile della mappa.
 * @returns {boolean} True se la casella è attraversabile, false altrimenti.
 */
function isWalkable(tile) {
    if (!tile) return false;
    // Per ora, solo le montagne non sono attraversabili.
    return tile.type !== TILE_SYMBOLS.MOUNTAIN;
}

/**
 * Muove il giocatore sulla mappa, aggiorna lo stato e il rendering.
 * @param {number} dx - Lo spostamento orizzontale (-1, 0, 1).
 * @param {number} dy - Lo spostamento verticale (-1, 0, 1).
 */
function movePlayer(dx, dy) {
    // console.log(`movePlayer Tentativo (${dx},${dy}). Gioco Attivo: ${gameActive}, Pausa: ${gamePaused}`); // RIMOSSO DEBUG LOG
    if (!gameActive || gamePaused) {
        // console.log("...Movimento bloccato."); // RIMOSSO DEBUG LOG
        return;
    }

    const currentTile = map[player.y]?.[player.x];

    // Se è notte e il giocatore NON è in un rifugio, permettiamo comunque il movimento
    // ma con una penalità e un avviso
    if (!isDay && currentTile && !SHELTER_TILES.includes(currentTile.type)) {
        // La prima volta avvisa il giocatore che muoversi di notte è pericoloso
        if (!player.hasBeenWarnedAboutNight) {
            addMessage("È notte fonda. Muoversi al buio è pericoloso, trova un rifugio il prima possibile!", "warning", true);
            player.hasBeenWarnedAboutNight = true;
        }

        // Aggiungiamo una penalità per muoversi di notte (consumo doppio di risorse)
        const nightMovePenalty = 0.15; // Penalità aggiuntiva di HP per movimento notturno
        player.hp = Math.max(0, player.hp - nightMovePenalty);

        if (player.hp <= 0) {
            addMessage("L'oscurità nasconde troppi pericoli. Non riesci più ad andare avanti...", "danger");
            endGame(false);
            return;
        }
    }

    // Se è notte MA il giocatore è in un rifugio, la prima azione fa passare al giorno
    if (!isDay && currentTile && SHELTER_TILES.includes(currentTile.type)) {
        transitionToDay();
        renderStats(); // transitionToDay già chiama renderStats
        renderMap(); // Serve per aggiornare subito la mappa dopo il cambio tile (anche se non ci si sposta)
        // enableControls(); // transitionToDay già chiama enableControls
        return;
    }

    // Impedisce movimento nullo
    if (dx === 0 && dy === 0) return;

    const newX = player.x + dx;
    const newY = player.y + dy;

    // Controllo limiti mappa
    if (newX < 0 || newX >= MAP_WIDTH || newY < 0 || newY >= MAP_HEIGHT) {
        addMessage("Non puoi andare oltre i confini del mondo conosciuto.", "warning");
        return;
    }

    // --- AGGIUNTO: Controllo robusto esistenza casella ---
    if (!map || !map[newY] || !map[newY][newX]) {
        console.error(`Tentativo di accedere a casella mappa non valida o inesistente: (${newX}, ${newY})`);
        addMessage("Errore interno: la destinazione non è valida.", "danger");
        return;
    }
    // --- FINE AGGIUNTO ---

    const targetTile = map[newY][newX]; // Ora siamo sicuri che targetTile esiste

    // Controllo se la casella è attraversabile
    if (!isWalkable(targetTile)) { // isWalkable dovrebbe già gestire tile null/undefined, ma questo previene chiamate inutili
        addMessage("Non puoi passare di qui.", "warning");
        return;
    }

    // Movimento valido
    disableControls(); // Disabilita controlli *prima* di iniziare l'azione
    gamePaused = true; // << IMPOSTA PAUSA per la durata dell'azione
    // console.log(">>> Movimento Iniziato - gamePaused impostato a true"); // RIMOSSO DEBUG LOG

    player.x = newX;
    player.y = newY;
    targetTile.visited = true; // Riferimento corretto a targetTile

    addMessage(`Ti muovi verso (${newX}, ${newY}). Luogo: ${TILE_DESC[targetTile.type] || '???'}`);

    triggerTileEvent(targetTile); // Prima gli eventi specifici del tile

    let specificEventTriggered = eventScreenActive; // eventScreenActive viene messo a true da showEventPopup

    if (!specificEventTriggered) {
        triggerComplexEvent(targetTile); // Poi prova gli eventi complessi generici
    }

    let complexEventTriggered = eventScreenActive && !specificEventTriggered;

    if (!eventScreenActive) { // Se NESSUN evento popup è stato attivato (eventScreenActive non è true)
        // console.log("...Nessun evento popup attivato, procedo con azioni post-movimento."); // RIMOSSO DEBUG LOG
        // Mostra flavor text solo se NESSUN evento popup è stato attivato
        showRandomFlavorText(targetTile);

        // Controlla sempre se viene trovato un frammento di lore (anche se c'è flavor)
        checkForLoreFragment();

        consumeResourcesOnMove(); // Consumo base

        // --- INIZIO NUOVA LOGICA: Applicazione Effetti Passivi Status ---
        let passiveDamageApplied = false; // Flag per sapere se è stato applicato danno

        // Applica consumo extra risorse se Malato
        if (player.isSick) {
             player.food = Math.max(0, player.food - SICKNESS_EXTRA_FOOD_COST);
             player.water = Math.max(0, player.water - SICKNESS_EXTRA_WATER_COST);
        }

        // Applica danno HP per Sete
        if (player.water <= 0) {
            player.hp -= PASSIVE_THIRST_DAMAGE;
            passiveDamageApplied = true;
            if (player.hp <= 0) {
                endGame(false);
                return; // Esce subito se morto
            }
        }

        // Applica danno HP per Fame
        if (player.food <= 0) {
            player.hp -= PASSIVE_HUNGER_DAMAGE;
            passiveDamageApplied = true;
            if (player.hp <= 0) {
                endGame(false);
                return; // Esce subito se morto
            }
        }

        // Applica danno HP per Ferita
        if (player.isInjured) {
            player.hp -= PASSIVE_INJURY_DAMAGE;
            passiveDamageApplied = true;
            if (player.hp <= 0) {
                endGame(false);
                return; // Esce subito se morto
            }
        }

        // Applica danno HP per Malattia
        if (player.isSick) {
            player.hp -= PASSIVE_SICKNESS_DAMAGE;
            passiveDamageApplied = true;
            if (player.hp <= 0) {
                endGame(false);
                return; // Esce subito se morto
            }
        }
        // --- FINE NUOVA LOGICA Effetti Passivi Status ---

        // Logica Giorno/Notte (contatori, transizioni, etc.)
        if (isDay) {
            dayMovesCounter++;
            renderStats();
            if (dayMovesCounter >= DAY_LENGTH_MOVES) {
                transitionToNight();
            } else {
                 // Non riabilitare i controlli qui, lo facciamo alla fine
            }
        } else {
            // Gestione movimenti durante la notte
            nightMovesCounter++;
            renderStats();

            if (nightMovesCounter >= NIGHT_LENGTH_MOVES) {
                addMessage("La notte finalmente passa... il sole sorge all'orizzonte.", "info", true);
                transitionToDay();
            } else {
                 // Non riabilitare i controlli qui
            }
        }

        // Controlla se arrivato alla fine (dopo aver applicato danni e gestito giorno/notte)
        // Aggiunto check gameActive perché endGame potrebbe averlo messo a false
        if (targetTile.type === TILE_SYMBOLS.END && gameActive) {
             endGame(true);
             return; // Esce perché il gioco è finito
        }

        // Logica post-movimento completata (senza popup)
        gamePaused = false; // << RIMUOVE PAUSA
        // console.log(">>> Azioni Post-Movimento Completate - gamePaused impostato a false"); // RIMOSSO DEBUG LOG

    } else {
        // console.log("...Evento popup attivato, azioni post-movimento saltate."); // RIMOSSO DEBUG LOG
        // Se un popup è attivo, NON resettiamo gamePaused qui.
        // Sarà compito di closeEventPopup resettarlo quando l'utente chiude il popup.
    }

    renderMap();
    checkAndLogStatusMessages();

    // Riabilita i controlli SOLO se il gioco è attivo e NON in pausa
    // (gamePaused sarà false solo se non ci sono stati popup)
    if (gameActive && !gamePaused) {
         enableControls();
    }
}

/**
 * Applica il consumo di risorse base per ogni movimento.
 */
function consumeResourcesOnMove() {
    if (!player) return;
    // Applica un piccolo costo ad ogni passo
    player.food = Math.max(0, player.food - MOVE_FOOD_COST);
    player.water = Math.max(0, player.water - MOVE_WATER_COST);

    // TODO: Aggiungere messaggi di avviso quando le risorse scendono sotto una soglia?
    // if (player.food < 3) addMessage("Inizi a sentire fame...", "warning");
    // if (player.water < 3) addMessage("Hai sete...", "warning");
}

/**
 * Gestisce la transizione da giorno a notte.
 */
function transitionToNight() {
    isDay = false;
    dayMovesCounter = 0;
    nightMovesCounter = 0; // Reset contatore passi notturni
    addMessage("È calata la notte...", "info", true);
    // Non disabilitiamo più i controlli di notte per permettere al giocatore di cercare rifugio
    // disableControls();
    renderStats();

    addMessage(`Consumi risorse per la notte... (${NIGHT_FOOD_COST} Sazietà, ${NIGHT_WATER_COST} Idratazione)`);
    player.food = Math.max(0, player.food - NIGHT_FOOD_COST);
    player.water = Math.max(0, player.water - NIGHT_WATER_COST);

    applyNightPenalties(); // Applica penalità e controlla morte
    if (!gameActive) return; // Esce se il giocatore è morto

    // Controlla se il giocatore è in un rifugio
    const currentTile = map[player.y]?.[player.x];
    if (currentTile && SHELTER_TILES.includes(currentTile.type)) {
        addMessage("Passi la notte al sicuro nel rifugio.", "info");
        transitionToDay(); // Passa subito al giorno successivo se in rifugio
    } else {
        addMessage("Sei all'aperto. Cerca di trovare un rifugio al più presto o subirai danni muovendoti nel buio.", "warning");
        // Il gioco rimane in stato Notte, ma i controlli sono ancora attivi
    }
    renderStats(); // Aggiorna UI dopo costi/penalità/eventuale cambio giorno
}

/**
 * Applica le penalità di HP se il giocatore è affamato o assetato durante la notte.
 */
function applyNightPenalties() {
    let penaltyMessage = "";
    if (player.food <= 0) {
        player.hp -= HUNGER_PENALTY_HP;
        penaltyMessage += `Soffri la fame (-${HUNGER_PENALTY_HP} HP). `;
    }
    if (player.water <= 0) {
        player.hp -= THIRST_PENALTY_HP;
        penaltyMessage += `Soffri la sete (-${THIRST_PENALTY_HP} HP). `;
    }
    if (penaltyMessage) {
        addMessage(penaltyMessage, "warning", true);
    }
    // Controlla se il giocatore è morto per le penalità
    if (player.hp <= 0) {
        endGame(false); // Chiamare funzione game over
    }
}

/**
 * Gestisce la transizione da notte a giorno.
 */
function transitionToDay() {
    if (!gameActive) return; // Non fare nulla se il gioco è finito

    isDay = true;
    dayMovesCounter = 0; // Resetta il contatore del giorno a 0, quindi avrà di nuovo DAY_LENGTH_MOVES passi
    nightMovesCounter = 0; // Resetta il contatore della notte
    daysSurvived++;
    addMessage(`Sorge un nuovo giorno... Giorno ${daysSurvived}.`, "info", true);

    if (!eventScreenActive) { // Riabilita i controlli solo se non c'è un popup aperto
       enableControls();
    }
    renderStats();
}

/**
 * Termina la partita (vittoria o sconfitta).
 * @param {boolean} isVictory - True se il giocatore ha vinto, false se ha perso.
 */
function endGame(isVictory) {
    gameActive = false;
    gamePaused = true; // << Imposta pausa anche a fine gioco
    disableControls();

    if (isVictory) {
        endTitle.textContent = "Sei Arrivato!";
        endMessage.textContent = `Dopo ${daysSurvived} giorni di viaggio estenuante, hai finalmente raggiunto la destinazione.

Non è un paradiso, ma è un luogo sicuro. Forse qui potrai ricostruire qualcosa che assomigli a una vita.

Ce l'hai fatta. Sei sopravvissuto.` ;
         addMessage("Hai raggiunto la Destinazione Incerta! Hai vinto!", "success", true);
    } else {
        endTitle.textContent = "Il Viaggio Finisce Qui";
        endMessage.textContent = `Sei sopravvissuto per ${daysSurvived} giorni.

Le terre desolate reclamano un'altra vittima.

La fame, la sete, le ferite, la malattia o gli orrori indicibili hanno avuto la meglio.
Il tuo viaggio finisce qui, nell'oblio.`;
         addMessage("Sei morto... Il tuo viaggio è finito.", "warning", true);
    }

    if(gameContainer) gameContainer.style.display = 'none';
    if(gameContainer) gameContainer.classList.remove('overlay-active'); // Rimuove oscuramento se presente
    if(endScreen) endScreen.style.display = 'flex'; // Mostra schermata fine

    // Aggiungi listener al bottone restart solo una volta
    if (restartButton && !restartButton.dataset.listenerAttached) {
        restartButton.addEventListener('click', initializeGame);
        restartButton.dataset.listenerAttached = 'true'; // Flag per evitare aggiunte multiple
    }
}

// --- GESTIONE EVENTI ---

/**
 * Attiva un evento casuale basato sulla casella corrente, se applicabile.
 * @param {object} tile - L'oggetto tile su cui si trova il giocatore.
 */
function triggerTileEvent(tile) {
    if (!tile || tile.type === TILE_SYMBOLS.START || tile.type === TILE_SYMBOLS.END) {
        return; // Nessun evento su Start, End o caselle non valide
    }

    const tileKey = Object.keys(TILE_SYMBOLS).find(k => TILE_SYMBOLS[k] === tile.type);
    if (!tileKey) return; // Safety check

    // --- CHECK EVENTI UNICI (CITY ONLY) ---
    if (tileKey === 'CITY') {
        // 1. Check Easter Egg PixelDebh
        if (!easterEggPixelDebhFound && Math.random() < EASTER_EGG_CHANCE) {
            const easterEggEvent = EVENT_DATA.CITY.find(event => event.id === "city_easter_egg_pixeldebh");
            if (easterEggEvent) {
                showEventPopup(easterEggEvent);
                easterEggPixelDebhFound = true;
                return; // Trovato PixelDebh, esci
            } else {
                 console.warn("Evento Easter Egg 'city_easter_egg_pixeldebh' non trovato in EVENT_DATA.CITY");
            }
        // 2. Check Evento Unico WebRadio (solo se PixelDebh non è stato trovato in questo check)
        } else if (!uniqueEventWebRadioFound && Math.random() < EASTER_EGG_CHANCE) { // Usa la stessa chance rara
             const webRadioEvent = EVENT_DATA.CITY.find(event => event.id === "city_unique_webradio");
             if (webRadioEvent) {
                showEventPopup(webRadioEvent);
                uniqueEventWebRadioFound = true;
                return; // Trovato WebRadio, esci
             } else {
                 console.warn("Evento Unico 'city_unique_webradio' non trovato in EVENT_DATA.CITY");
             }
        }
    }
    // --- FINE CHECK EVENTI UNICI ---

    // --- Logica Eventi Standard --- (Modificata per filtrare entrambi gli unici)
    let eventPool = [];
    let eventChance = 0;

    try {
        if (EVENT_DATA && EVENT_DATA[tileKey]) {
            // Filtra via gli eventi unici se sono già stati trovati
            eventPool = EVENT_DATA[tileKey].filter(event => {
                const isPixelDebh = event.id === "city_easter_egg_pixeldebh";
                const isWebRadio = event.id === "city_unique_webradio";
                // Escludi se è PixelDebh E PixelDebh è stato trovato
                // OPPURE se è WebRadio E WebRadio è stato trovato
                return !( (isPixelDebh && easterEggPixelDebhFound) || (isWebRadio && uniqueEventWebRadioFound) );
            });
        }
        if (EVENT_CHANCE && typeof EVENT_CHANCE[tileKey] === 'number') {
            eventChance = EVENT_CHANCE[tileKey];
        }
    } catch (e) {
        console.warn("Dati eventi (EVENT_DATA/EVENT_CHANCE) non trovati o non validi in game_data.js", e);
        return; // Esce se mancano i dati fondamentali
    }

    // Controlla la probabilità per gli eventi standard
    if (eventPool.length > 0 && Math.random() < eventChance) {
        const randomEvent = getRandomText(eventPool); // Seleziona casualmente dalla pool filtrata
        if (randomEvent) {
             // Mostra evento normale con scelte (o senza se choices è vuoto)
             showEventPopup(randomEvent);
        } else {
             console.warn(`Tentativo di attivare evento standard per ${tile.type}, ma l'evento selezionato non è valido dalla pool filtrata.`);
        }
    }
    // --- FINE Logica Eventi Standard ---
}

/**
 * Mostra il popup dell'evento con titolo, descrizione e scelte.
 * Imposta lo stato di pausa.
 * @param {object} eventData - L'oggetto evento da visualizzare.
 */
function showEventPopup(eventData) {
    // console.log(">>> showEventPopup: Inizio esecuzione"); // <-- RIMOSSO LOG
    // console.log("showEventPopup INIZIO - Stato Pausa Precedente:", gamePaused); // RIMOSSO DEBUG LOG
    if (!eventOverlay || !eventTitle || !eventContent || !eventChoicesContainer || !gameContainer) {
        console.error("Elementi del popup evento o gameContainer non trovati nel DOM.");
        return;
    }
    if (!eventData) {
        console.error("showEventPopup chiamata senza eventData valido.");
        return;
    }

    disableControls(); // Disabilita bottoni movimento
    gamePaused = true; // << IMPOSTA PAUSA
    eventScreenActive = true; // Indica che il popup è VISIVAMENTE attivo
    currentEventContext = eventData;

    eventTitle.textContent = eventData.title || "Evento";

    // Costruisce il contenuto HTML
    let contentHTML = eventData.description || "Qualcosa è successo...";

    // Se sono presenti dettagli del check (passati da handleEventChoice)
    if (eventData.checkDetails) {
        contentHTML += `<br><br><span class="log-dim">(${eventData.checkDetails})</span>`; // Aggiunge dettagli check
    }
    // Se sono presenti conseguenze specifiche (passate da handleEventChoice)
    if (eventData.consequences) {
        contentHTML += `<br><span class="log-info">${eventData.consequences}</span>`; // Aggiunge conseguenze
    }
    eventContent.innerHTML = contentHTML;

    eventChoicesContainer.innerHTML = '';
    const choices = eventData.choices || [];
    currentEventChoices = choices; // Salva per gestione tastiera eventi standard

    // Distingue tra popup evento standard e popup azioni oggetto
    if (!eventData.isActionPopup && choices.length > 0 && !eventData.isOutcome) {
        // Popup evento standard con scelte
        choices.forEach((choice, index) => {
            const button = document.createElement('button');
            let buttonText = `${index + 1}. ${choice.text}`;

            // --- NUOVO: Aggiungi descrittore probabilità se c'è skillCheck ---
            if (choice.skillCheck) {
                const likelihood = getSkillCheckLikelihood(choice.skillCheck.stat, choice.skillCheck.difficulty);
                buttonText += ` (${likelihood})`; // Aggiunge es. " (Favorevole)"
            }
            // --- FINE NUOVO ---

            button.textContent = buttonText;
            // button.onclick = () => handleEventChoice(index); // RIMOSSO onclick DIRETTO

            // --- AGGIUNTO: data-choice-index per DELEGAZIONE ---
            button.dataset.choiceIndex = index;

            if (choice.cssClass) button.classList.add(choice.cssClass);
            eventChoicesContainer.appendChild(button);
        });

        // --- NUOVO EVENT LISTENER sul CONTENITORE ---
        // --- DEBUG LOG: Verifica Contenitore Scelte ---
        if (eventChoicesContainer) {
            // console.log("Verifica eventChoicesContainer prima di aggiungere listener:",
            //     `Esiste: ${!!eventChoicesContainer}`,
            //     `Ha figli (bottoni): ${eventChoicesContainer.children.length > 0}`,
            //     `Visibile (display): ${window.getComputedStyle(eventChoicesContainer).display}`,
            //     `Pointer Events: ${window.getComputedStyle(eventChoicesContainer).pointerEvents}`
            // );
        } else {
            console.error("ERRORE CRITICO: eventChoicesContainer è null o undefined prima di aggiungere listener!");
        }
        // --- FINE DEBUG LOG ---
        eventChoicesContainer.addEventListener('click', handleChoiceContainerClick);

        if(continueButton) continueButton.style.display = 'none';
    } else if (eventData.isActionPopup) {
        // Popup azioni oggetto (Usa, Annulla, etc.)
        // console.log("Creazione bottoni ActionPopup. Choices:", choices); // RIMOSSO DEBUG LOG
         choices.forEach((choice) => {
            const button = document.createElement('button');
            button.textContent = choice.text;

            // --- RIMUOVI onclick DIRETTO ---
             // button.onclick = (clickEvent) => { ... }; // RIMOSSO

            // --- AGGIUNGI DATA ATTRIBUTES per DELEGAZIONE ---
            button.dataset.actionType = 'itemAction'; // Tipo generico
            // Crea una chiave semplice per l'azione
            if (choice.text.toLowerCase() === 'annulla') {
                 button.dataset.actionKey = 'cancel';
            } else if (choice.text.toLowerCase().startsWith('usa')) {
                button.dataset.actionKey = 'use';
                // Potremmo aggiungere l'itemId qui se servisse, ma è già in currentEventContext
                // button.dataset.itemId = currentEventContext.itemId; // Esempio, ma non necessario ora
            }
            button.dataset.actionText = choice.text; // Mantiene il testo per riferimento/lookup

             if (choice.cssClass) button.classList.add(choice.cssClass);
             eventChoicesContainer.appendChild(button);
         });
         if(continueButton) continueButton.style.display = 'none';
     } else {
        // Popup di risultato evento o evento senza scelte
         if(continueButton) {
             continueButton.style.display = 'inline-block';
             continueButton.onclick = () => closeEventPopup();
         }
    }

    // console.log(">>> showEventPopup: Prima di rendere visibile overlay"); // <-- RIMOSSO LOG
    // Mostra overlay e oscura sfondo usando le classi CSS
    gameContainer.classList.add('overlay-active');
    eventOverlay.classList.add('visible');

    // console.log("showEventPopup FINE - Stato Pausa:", gamePaused, "Overlay visibile:", eventOverlay.classList.contains('visible')); // RIMOSSO DEBUG LOG
}

/**
 * Gestisce la selezione di una scelta nell'evento.
 * @param {number} choiceIndex - L'indice della scelta selezionata.
 */
function handleEventChoice(choiceIndex) {
    // Validazione input e contesto
    if (!currentEventChoices || choiceIndex < 0 || choiceIndex >= currentEventChoices.length || !currentEventContext) {
        console.error("handleEventChoice chiamato con dati evento non validi:", { choiceIndex, currentEventChoices, currentEventContext });
        addMessage("Errore nell'elaborazione dell'evento.", "danger");
        closeEventPopup();
        return;
    }

    try {
        // Ottieni la scelta selezionata
        const choice = currentEventChoices[choiceIndex];
        if (!choice) {
            throw new Error(`Scelta con indice ${choiceIndex} non trovata.`);
        }

        const baseEventTitle = currentEventContext.title || "Evento";
        const eventType = currentEventContext.type;

        let outcomeTitle = "Risultato";
        let outcomeDescription = `Hai scelto: ${choice.text}.`;
        let outcomeCheckDetails = null;
        let outcomeConsequences = "";
        let messageType = 'info';
        let timePassedMessage = "";

        if (isDay && choice.isSearchAction) {
            dayMovesCounter += SEARCH_TIME_COST;
            timePassedMessage = `Passi ${SEARCH_TIME_COST} unità di tempo a cercare...`;
            addMessage(timePassedMessage, 'info');
            renderStats();
            if (dayMovesCounter >= DAY_LENGTH_MOVES) {
                transitionToNight();
            }
        }

        let finalOutcomeDescription = outcomeDescription;
        let rewardConsequences = "";
        let rewardMessageType = 'info';

        if (choice.outcome) {
            const outcomeText = Array.isArray(choice.outcome) ? getRandomText(choice.outcome) : "";
            finalOutcomeDescription += outcomeText ? ` ${outcomeText}` : "";

            const rewardResult = applyChoiceReward(choice.successReward);
            rewardConsequences = rewardResult.consequences;
            rewardMessageType = rewardResult.messageType;
            if (rewardConsequences) {
                finalOutcomeDescription += `\n${rewardConsequences}`;
            }
            if (rewardMessageType !== 'info') {
                 messageType = rewardMessageType;
            }
            addMessage(`${baseEventTitle}: ${choice.text}. ${outcomeDescription}${rewardConsequences}`, messageType, true);
            buildAndShowComplexEventOutcome(outcomeTitle, finalOutcomeDescription, null, null, messageType);

        } else if (choice.skillCheck) {
            if (!choice.skillCheck || typeof choice.skillCheck.stat === 'undefined' || typeof choice.skillCheck.difficulty === 'undefined') {
                throw new Error(`Dati skillCheck mancanti o non validi per la scelta: ${choice.text}`);
            }
            const checkResult = performSkillCheck(choice.skillCheck.stat, choice.skillCheck.difficulty);
            outcomeCheckDetails = checkResult.text;

            if (checkResult.success) {
                outcomeTitle = "Successo!";
                messageType = 'success';
                switch (eventType) {
                    case 'PREDATOR':
                        if (choice.actionKey === 'fuga') {
                            outcomeDescription = getRandomText(esitiFugaPredoniOk);
                            outcomeConsequences = "Sei riuscito a fuggire senza conseguenze.";
                        } else if (choice.actionKey === 'lotta') {
                            outcomeDescription = getRandomText(esitiLottaPredoniOk);
                            let lootChance = 0.5;
                            if (Math.random() < lootChance) {
                               const lootTypes = ['food', 'water', 'scrap_metal', 'bandages_dirty', 'bandages_clean', 'vitamins'];
                               const lootId = lootTypes[Math.floor(Math.random() * lootTypes.length)];
                               const lootQty = getRandomInt(1,3);
                               addItemToInventory(lootId, lootQty);
                               const lootItemInfo = ITEM_DATA[lootId];
                               if (!lootItemInfo) throw new Error(`ITEM_DATA mancante per ID: ${lootId}`);
                               outcomeConsequences = `Li hai respinti! Trovi ${lootQty} ${lootItemInfo.name} tra le loro cose.`;
                            } else {
                                outcomeConsequences = "Li hai respinti! Si ritirano senza lasciare nulla.";
                            }
                        } else if (choice.actionKey === 'parla') {
                            outcomeDescription = getRandomText(esitiParlaPredoniOk);
                            outcomeConsequences = "Sei riuscito a convincerli a lasciarti in pace.";
                            if (Math.random() < 0.20) {
                                findLoreFragment();
                                outcomeConsequences += " Nella conversazione, scopri qualcosa di interessante.";
                            }
                        }
                        break;
                    case 'ANIMAL':
                        if (choice.actionKey === 'evita') {
                            outcomeDescription = getRandomText(esitiEvitaAnimaleOk);
                            outcomeConsequences = "Sei riuscito ad evitare l'animale senza attirare la sua attenzione.";
                        } else if (choice.actionKey === 'attacca') {
                            outcomeDescription = getRandomText(esitiAttaccoAnimaleOk);
                            let foodAmount = getRandomInt(1, 3);
                            addItemToInventory('canned_food', foodAmount);
                            outcomeConsequences = `Hai sconfitto ${currentEventContext.context?.animalType || 'l\'animale'}! Raccogli ${foodAmount} unità di cibo (carne).`;
                        }
                        break;
                    case 'TRACKS':
                        if (choice.actionKey === 'segui') {
                            const outcomeRoll = Math.random();
                            if (outcomeRoll < 0.4) { // 40% Loot
                                outcomeDescription = getRandomText(descrizioniTracceLoot);
                                const lootTypes = ['canned_food', 'water_purified_small', 'scrap_metal', 'bandages_dirty', 'medicine_crude', 'bandages_clean', 'vitamins'];
                                const lootId = lootTypes[Math.floor(Math.random() * lootTypes.length)];
                                const lootQty = getRandomInt(1,3);
                                addItemToInventory(lootId, lootQty);
                                outcomeConsequences = `Le tracce ti portano a: ${lootQty} ${ITEM_DATA[lootId].name}!`;
                            } else if (outcomeRoll < 0.65) { // 25% Lore
                                outcomeDescription = getRandomText(descrizioniTracceLore);
                                findLoreFragment();
                                outcomeConsequences = "Hai scoperto un frammento del passato.";
                            } else if (outcomeRoll < 0.85) { // 20% Pericolo (Predoni)
                                outcomeDescription = getRandomText(descrizioniTracceDanger);
                                outcomeConsequences = "Le tracce ti hanno condotto dritto in un'imboscata!";
                                 addMessage("Senti un fischio e delle figure emergono dalle ombre!", 'danger', true);
                            } else { // 15% Nulla
                                outcomeDescription = getRandomText(descrizioniTracceNothing);
                                outcomeConsequences = "Le tracce non hanno portato a nulla di utile.";
                            }
                        }
                        break;
                    case 'VILLAGE_HOSTILE':
                        if (choice.actionKey === 'negozia') {
                             outcomeDescription = getRandomText(esitiVillaggioOstileNegoziaOk);
                             outcomeConsequences = "Sei riuscito a passare senza incidenti.";
                        }
                        break;
                    case 'ENVIRONMENTAL':
                            outcomeDescription = getRandomText(esitiPericoloAmbientaleEvitato);
                            outcomeConsequences = "Sei riuscito ad evitare il pericolo senza conseguenze!";
                            break;
                    case 'DILEMMA':
                            if (choice.actionKey === 'intervieni') {
                                const outcomeRoll = Math.random();
                                if (outcomeRoll < 0.8) { // 80% Esito positivo
                                    outcomeDescription = getRandomText(esitiDilemmaMoraleIndagaOkPositivo);
                                     const bonusType = Math.random() < 0.5 ? 'resource' : 'stat_bonus';
                                     if (bonusType === 'resource') {
                                         const lootTypes = ['canned_food', 'water_purified_small', 'medicine_crude'];
                                         const lootId = lootTypes[Math.floor(Math.random() * lootTypes.length)];
                                         const lootQty = getRandomInt(1,2);
                                         addItemToInventory(lootId, lootQty);
                                         outcomeConsequences = `La tua azione è stata ricompensata: ${lootQty} ${ITEM_DATA[lootId].name}!`;
                                     } else {
                                         const statBonus = 1;
                                         playerStats.adattamento += statBonus; // Bonus Adattamento
                                         renderStats();
                                         outcomeConsequences = `Hai agito correttamente. Ti senti più forte. (Adattamento +${statBonus})`;
                                     }
                                } else { // 20% Esito negativo
                                    outcomeDescription = getRandomText(esitiDilemmaMoraleIndagaOkNegativo);
                                     // Penalità variabile (danno lieve, perdita risorse?)
                                     const penaltyType = Math.random() < 0.6 ? 'damage' : 'resource_loss';
                                     if (penaltyType === 'damage') {
                                         const damage = getRandomInt(1, 3);
                                         player.hp -= damage;
                                         player.isInjured = true;
                                         outcomeConsequences = `Il tuo intervento è andato male. Subisci ${damage} danni.`;
                                         if (player.hp <= 0) endGame(false);
                                     } else {
                                         const resourceLoss = Math.random() < 0.5 ? 'food' : 'water';
                                         const lossAmount = 1;
                                         if (player[resourceLoss] >= lossAmount) {
                                             player[resourceLoss] -= lossAmount;
                                             outcomeConsequences = `Nella confusione, perdi ${lossAmount} unità di ${resourceLoss === 'food' ? 'cibo' : 'acqua'}.`;
                                         } else {
                                             outcomeConsequences = "Il tuo intervento è andato male, ma non subisci perdite immediate.";
                                         }
                                     }
                                     renderStats();
                                }
                            }
                            break;

                         case 'SHELTER_INSPECT':
                             if (choice.actionKey === 'ispeziona') {
                                 const findRoll = Math.random();
                                 if (findRoll < 0.5) { // 50% Loot
                                    outcomeDescription = getRandomText(esitiRifugioIspezionaOkLoot);
                                     // Aggiunti 'bandages_clean' e 'vitamins' alla lista loot
                                     const lootTypes = ['canned_food', 'water_purified_small', 'scrap_metal', 'bandages_dirty', 'medicine_crude', 'bandages_clean', 'vitamins'];
                                     const lootId = lootTypes[Math.floor(Math.random() * lootTypes.length)];
                                     const lootQty = getRandomInt(1,3);
                                     addItemToInventory(lootId, lootQty);
                                     outcomeConsequences = `La tua ispezione porta a: ${lootQty} ${ITEM_DATA[lootId].name}!`;
                                 } else if (findRoll < 0.75) { // 25% Lore -> Ora 50% -> 75%
                                    outcomeDescription = getRandomText(esitiRifugioIspezionaOkLore);
                                     findLoreFragment();
                                     outcomeConsequences = "Scopri qualcosa di interessante sul passato di questo luogo.";
                                 } else { // 25% Nulla -> Ora 75% -> 100%
                                    outcomeDescription = getRandomText(esitiRifugioIspezionaKoNulla); // Rinominato per coerenza? No, è OK
                                     outcomeConsequences = "Non trovi nulla di particolare.";
                                 }
                             }
                             break;

                        case 'HORROR':
                            if (choice.actionKey === 'fuga') {
                                outcomeDescription = getRandomText(esitiOrroreIndicibileFugaOk);
                                outcomeConsequences = "Riesci a fuggire dall'orrore, anche se con il fiato corto e la mente scossa.";
                            } else if (choice.actionKey === 'affronta') {
                                outcomeDescription = getRandomText(esitiOrroreIndicibileAffrontaOk);
                                // Bonus significativo all'adattamento per aver affrontato l'orrore
                                const statGain = 2;
                                playerStats.adattamento += statGain;
                                renderStats();
                                outcomeConsequences = `Affronti l'indicibile e ne esci più forte. (Adattamento +${statGain})`;
                            }
                            break;

                        default:
                            // Fallback per eventi specifici del tile (non complessi)
                            outcomeDescription = choice.successText || "Ce l'hai fatta!";
                            finalOutcomeDescription = outcomeDescription; // Inizia la descrizione finale

                            // Applica la ricompensa generica qui usando l'helper
                            const defaultRewardResult = applyChoiceReward(choice.successReward);
                            rewardConsequences = defaultRewardResult.consequences;
                            rewardMessageType = defaultRewardResult.messageType;

                            if (rewardConsequences) {
                                finalOutcomeDescription += `\n${rewardConsequences}`; // Aggiunge conseguenze alla descr. popup
                            }
                            if (rewardMessageType !== 'info') {
                                 messageType = rewardMessageType; // Sovrascrive tipo messaggio se necessario
                            }
                            break; // Aggiunto break mancante
                    }
                    // outcomeConsequences (la variabile locale di handleEventChoice) potrebbe essere stata riempita
                    // dai case specifici dello switch. La aggiungiamo alla descrizione finale se presente.
                     if (outcomeConsequences && !finalOutcomeDescription.includes(outcomeConsequences)) {
                         finalOutcomeDescription += `\n${outcomeConsequences}`;
                     }

                } else {
                    // --- Fallimento check abilità ---
                    outcomeTitle = "Fallimento...";
                    messageType = 'warning';

                     // Logica Esito Fallimento Evento Complesso
                     switch (eventType) {
                        case 'PREDATOR':
                            if (choice.actionKey === 'fuga') {
                                outcomeDescription = getRandomText(esitiFugaPredoniKo);
                                 // Danno lieve e possibile perdita risorse
                                 const damage = getRandomInt(2, 5);
                                 player.hp -= damage;
                                 player.isInjured = true;
                                 outcomeConsequences = `Non riesci a fuggire! Subisci ${damage} danni.`;
                                 const resourceLossRoll = Math.random();
                                 if(resourceLossRoll < 0.3) {
                                    const resourceLoss = Math.random() < 0.5 ? 'food' : 'water';
                                    const lossAmount = 1;
                                     if (player[resourceLoss] >= lossAmount) {
                                         player[resourceLoss] -= lossAmount;
                                         outcomeConsequences += ` Nella fuga perdi ${lossAmount} unità di ${resourceLoss === 'food' ? 'cibo' : 'acqua'}.`;
                                     }
                                 }
                            } else if (choice.actionKey === 'lotta') {
                                outcomeDescription = getRandomText(esitiLottaPredoniKo);
                                // Danno moderato/grave e perdita garantita risorse
                                const damage = getRandomInt(5, 12);
                                player.hp -= damage;
                                player.isInjured = true;
                                outcomeConsequences = `Sei sopraffatto! Subisci ${damage} danni.`;
                                const resourceLossFood = getRandomInt(0, Math.min(player.food, 2)); // Perde 0-2 cibo
                                const resourceLossWater = getRandomInt(0, Math.min(player.water, 2)); // Perde 0-2 acqua
                                if (resourceLossFood > 0) {
                                    player.food -= resourceLossFood;
                                    outcomeConsequences += ` Ti rubano ${resourceLossFood} unità di cibo.`;
                                }
                                 if (resourceLossWater > 0) {
                                     player.water -= resourceLossWater;
                                     outcomeConsequences += ` Ti rubano ${resourceLossWater} unità di acqua.`;
                                 }
                            } else if (choice.actionKey === 'parla') {
                                outcomeDescription = getRandomText(esitiParlaPredoniKo);
                                // Tentativo di parlare fallito spesso porta a lotta
                                outcomeConsequences = "Le tue parole non hanno effetto, si preparano ad attaccare!";
                                 // Potrebbe triggerare un attacco immediato o dare chance di fuga/lotta
                                 // Per semplicità, ora solo messaggio, ma potrebbe scalare a `esitiLottaPredoniKo`.
                                 const damage = getRandomInt(1, 4); // Danno lieve iniziale
                                 player.hp -= damage;
                                 player.isInjured = true;
                                 outcomeConsequences += ` Ti colpiscono mentre cerchi di parlare (-${damage} HP).`;
                                 // Punto 5: Aggiunta chance (25%) di perdita risorse nel fallimento
                                 if (Math.random() < 0.25) {
                                     const resourceLoss = Math.random() < 0.5 ? 'food' : 'water';
                                     const lossAmount = 1;
                                      if (player[resourceLoss] >= lossAmount) {
                                          player[resourceLoss] -= lossAmount;
                                          outcomeConsequences += ` Nella confusione ti cade ${lossAmount} unità di ${resourceLoss === 'food' ? 'cibo' : 'acqua'}.`;
                                      }
                                 }
                            }
                             if (player.hp <= 0) endGame(false);
                             renderStats();
                            break;

                        case 'ANIMAL':
                            if (choice.actionKey === 'evita') {
                                outcomeDescription = getRandomText(esitiEvitaAnimaleKo);
                                 // Danno lieve da animale scoperto
                                 const damage = getRandomInt(3, 7);
                                 player.hp -= damage;
                                 player.isInjured = true;
                                 outcomeConsequences = `L'animale ti scopre e ti attacca! Subisci ${damage} danni.`;
                            } else if (choice.actionKey === 'attacca') {
                                outcomeDescription = getRandomText(esitiAttaccoAnimaleKo);
                                // Danno moderato da lotta con animale persa
                                const damage = getRandomInt(6, 15);
                                player.hp -= damage;
                                player.isInjured = true;
                                 const sickChance = 0.2; // 20% chance di infezione dal morso/graffio
                                 if (Math.random() < sickChance) {
                                     player.isSick = true;
                                     outcomeConsequences = `Vieni ferito gravemente (${damage} danni) e la ferita sembra infetta! (Stato: Infetto)`;
                                 } else {
                                    outcomeConsequences = `Vieni ferito gravemente (${damage} danni)!`;
                                 }
                            }
                             if (player.hp <= 0) endGame(false);
                             renderStats();
                            break;

                        case 'TRACKS':
                            if (choice.actionKey === 'segui') {
                                outcomeDescription = getRandomText(esitiSeguiTracceKo);
                                outcomeConsequences = "Perdi tempo prezioso seguendo tracce sbagliate o confondendoti.";
                                // Nessun danno diretto, ma perdita di tempo (già gestita se isSearchAction)
                            }
                            break;

                        case 'VILLAGE_HOSTILE':
                            if (choice.actionKey === 'negozia') {
                                 outcomeDescription = getRandomText(esitiVillaggioOstileNegoziaKo);
                                 outcomeConsequences = "Il tentativo di negoziare fallisce miseramente. Ti cacciano via.";
                                 // Possibile lieve danno se insistono
                                 if (Math.random() < 0.2) {
                                     const damage = getRandomInt(1, 3);
                                     player.hp -= damage;
                                     outcomeConsequences += ` Ti lanciano un sasso (-${damage} HP).`;
                                     if (player.hp <= 0) endGame(false);
                                     renderStats();
                                 }
                            }
                            break;

                        case 'ENVIRONMENTAL':
                            outcomeDescription = getRandomText(esitiPericoloAmbientaleColpito);
                             // Danno variabile in base al tipo di pericolo
                             const damage = getRandomInt(4, 10);
                             player.hp -= damage;
                             player.isInjured = true;
                             outcomeConsequences = `Sei colpito dal pericolo ambientale! Subisci ${damage} danni.`;
                              // Possibile effetto aggiuntivo (es. veleno, malattia)
                              const extraEffectChance = 0.15;
                              if (Math.random() < extraEffectChance) {
                                  player.isSick = true;
                                  outcomeConsequences += ` Potresti esserti infettato. (Stato: Infetto)`;
                              }
                             if (player.hp <= 0) endGame(false);
                             renderStats();
                            break;

                        case 'DILEMMA':
                            if (choice.actionKey === 'intervieni') {
                                 outcomeDescription = getRandomText(esitiDilemmaMoraleIndagaKo);
                                 // Penalità per fallimento intervento
                                 const damage = getRandomInt(3, 8);
                                 player.hp -= damage;
                                 player.isInjured = true;
                                 outcomeConsequences = `Il tuo tentativo di intervento fallisce! Subisci ${damage} danni.`;
                                 if (player.hp <= 0) endGame(false);
                                 renderStats();
                            }
                            break;

                         case 'SHELTER_INSPECT':
                             if (choice.actionKey === 'ispeziona') {
                                  const failRoll = Math.random();
                                  // Punto 3: Ridotta probabilità trappola (50% invece di 60%)
                                  if (failRoll < 0.5) { // 50% Trappola
                                      outcomeDescription = getRandomText(esitiRifugioIspezionaKoTrappola);
                                       const damage = getRandomInt(5, 12);
                                       player.hp -= damage;
                                       player.isInjured = true;
                                       outcomeConsequences = `Era una trappola! Subisci ${damage} danni.`;
                                        const sickChance = 0.1;
                                        if (Math.random() < sickChance) {
                                            player.isSick = true;
                                            outcomeConsequences += ` La trappola potrebbe averti infettato! (Stato: Infetto)`;
                                        }
                                       if (player.hp <= 0) endGame(false);
                                       renderStats();
                                  } else { // 50% Nulla (era 40%)
                                     outcomeDescription = getRandomText(esitiRifugioIspezionaKoNulla);
                                      outcomeConsequences = "L'ispezione non rivela nulla, né di buono né di cattivo.";
                                  }
                             }
                             break;

                        case 'HORROR':
                            if (choice.actionKey === 'fuga') {
                                outcomeDescription = getRandomText(esitiOrroreIndicibileFugaKo);
                                 // Danno lieve HP + possibile status negativo temporaneo (paura?)
                                 const damage = getRandomInt(1, 5);
                                 player.hp -= damage;
                                 outcomeConsequences = `Non riesci a fuggire dall'orrore! Subisci ${damage} danni alla tua sanità mentale (HP).`;
                                 // TODO: Implementare status 'Paura' o simili?
                            } else if (choice.actionKey === 'affronta') {
                                outcomeDescription = getRandomText(esitiOrroreIndicibileAffrontaKo);
                                // Danno HP significativo + status negativo (Follia temporanea?)
                                const damage = getRandomInt(5, 15);
                                player.hp -= damage * 2; // Danno raddoppiato per fallimento confronto diretto
                                 player.isSick = true; // Rappresenta trauma/follia temporanea
                                outcomeConsequences = `L'orrore ti sopraffà! Subisci ${damage * 2} danni alla sanità (HP). La tua mente è scossa. (Stato: Infetto/Traumatizzato)`;
                            }
                             if (player.hp <= 0) endGame(false);
                             renderStats();
                            break;

                        default:
                            // Fallback per eventi specifici del tile (non complessi)
                            outcomeDescription = choice.failureText || "Non è andata bene...";
                            finalOutcomeDescription = outcomeDescription; // Descrizione finale per il popup
                            // outcomeConsequences rimane quella definita nei case sopra (se presente)
                             if (outcomeConsequences && !finalOutcomeDescription.includes(outcomeConsequences)) {
                                 finalOutcomeDescription += `\n${outcomeConsequences}`;
                             }
                             break; // Aggiunto break mancante
                    }
                }

                // Mostra il popup di risultato (costruito sopra)
                // Log messaggio (spostato qui per loggare l'esito completo)
                addMessage(`${baseEventTitle}: ${outcomeTitle}. ${outcomeDescription}${outcomeConsequences}${rewardConsequences}`, messageType, true);
                buildAndShowComplexEventOutcome(outcomeTitle, finalOutcomeDescription, outcomeCheckDetails, null, messageType);

            // } // <-- Questa parentesi graffa sembrava errata e causava il problema. Rimuovendola, il blocco if/else si chiude correttamente.

        } // <-- Chiusura di 'else if (choice.skillCheck)'

        // Assicuriamoci che renderStats() sia l'ultima istruzione DENTRO il blocco try
        renderStats();

    } // <-- Questa è la parentesi graffa che chiude il blocco try
    catch (error) { // Il catch inizia SUBITO DOPO la chiusura del try
        console.error("Errore grave durante handleEventChoice:", error);
        addMessage(`Si è verificato un errore interno nell\'evento: ${error.message}`, "danger", true);
        closeEventPopup();
    }
} // Chiusura funzione handleEventChoice

/**
 * Costruisce e mostra il popup di risultato per un evento (anche complesso).
 * @param {string} title Titolo del popup (es. Successo!, Fallimento...)
 * @param {string} description Descrizione completa dell'esito (inclusi dettagli check e conseguenze).
 * @param {string|null} checkDetails Dettagli del tiro abilità (ora incorporati in description).
 * @param {string|null} consequences Conseguenze meccaniche (ora incorporate in description).
 * @param {string} messageType Tipo messaggio (info, success, warning, danger) per stile
 */
function buildAndShowComplexEventOutcome(title, description, checkDetails, _consequences, messageType) { // Mark consequences as unused
    let fullDescription = description;
    // Aggiunge i dettagli del check se non già inclusi nella descrizione principale
    // (Assumiamo che ora siano inclusi da handleEventChoice)
    // if (checkDetails && !fullDescription.includes(checkDetails)) {
    //     fullDescription += `\n(${checkDetails})`;
    // }
    // Le conseguenze sono ora parte della 'description'

    showEventPopup({
        isOutcome: true, // Indica che è un popup di risultato
        title: title,
        description: fullDescription, // Mostra la descrizione completa
        choices: [], // Nessuna scelta, solo bottone Continua
        messageType: messageType // Passa il tipo per lo stile
    });
    // Log messaggio spostato in handleEventChoice
}

/**
 * Chiude il popup dell'evento.
 * Rimuove lo stato di pausa e riabilita i controlli.
 */
function closeEventPopup() {
    // console.log("closeEventPopup INIZIO - Stato Pausa Precedente:", gamePaused); // RIMOSSO DEBUG LOG
    if(gameContainer) gameContainer.classList.remove('overlay-active');
    if(eventOverlay) eventOverlay.classList.remove('visible');
    eventScreenActive = false;
    gamePaused = false;
    currentEventContext = null;
    currentEventChoices = null;
    document.removeEventListener('keydown', handleEventKeyPress);
    document.addEventListener('keydown', handleKeyPress);
    renderStats();
    renderMap(); // <-- AGGIUNTO: Assicura che la mappa sia ridisegnata dopo la chiusura del popup
    enableControls();
    // console.log("closeEventPopup FINE - Stato Pausa:", gamePaused, "Overlay visibile:", eventOverlay.classList.contains('visible')); // RIMOSSO DEBUG LOG
}

/**
 * Gestisce l'input da tastiera quando un popup evento standard è attivo.
 * @param {Event} e L'evento keydown.
 */
function handleEventKeyPress(e) {
    if (!eventScreenActive || !currentEventChoices || currentEventChoices.length === 0) return;

    // Gestione tasti numerici 1-9 per le scelte
    const choiceIndex = parseInt(e.key) - 1;
    if (choiceIndex >= 0 && choiceIndex < currentEventChoices.length) {
        handleEventChoice(choiceIndex);
    }
    // Potrebbe gestire tasto Invio per bottone "Continua" in esiti?
    // else if (e.key === 'Enter' && /* verifica se è popup di esito */) {
    //     closeEventPopup();
    // }
}


// --- GESTIONE INPUT ---

/**
 * Gestisce la pressione dei tasti per il movimento e altre azioni.
 * @param {KeyboardEvent} event - L'oggetto evento della tastiera.
 */
function handleKeyPress(event) {
    // console.log(`>>> handleKeyPress: Tasto premuto: ${event.key}`); // RIMOSSO LOG DI VERIFICA

    // Gestione input per SCELTE EVENTO (se popup attivo)
    if (eventScreenActive && currentEventChoices && currentEventChoices.length > 0) {
        const choiceIndex = parseInt(event.key) - 1; // Converte tasto numerico (1, 2, ...) in indice (0, 1, ...)
        if (!isNaN(choiceIndex) && choiceIndex >= 0 && choiceIndex < currentEventChoices.length) {
            handleEventChoice(choiceIndex);
            return; // Impedisce ulteriore elaborazione del tasto
        }
    }
    // console.log(`handleKeyPress Tentativo: ${event.key.toUpperCase()}. Gioco Attivo: ${gameActive}, Pausa: ${gamePaused}`); // RIMOSSO DEBUG LOG

    // --- RIMOSSO LOG: Verifica Stato Gioco ---
    // console.log(`>>> handleKeyPress: Verifico stato - gameActive: ${gameActive}, gamePaused: ${gamePaused}`);

    // Gestione input MOVIMENTO (se gioco attivo e popup NON attivo)
    if (!gameActive || gamePaused) {
         // --- RIMOSSO LOG: Controllo Blocco Input ---
         // console.log(`>>> handleKeyPress: Input bloccato! (!gameActive: ${!gameActive}, gamePaused: ${gamePaused})`);
         return; // Ignora input se gioco non attivo o se popup evento è aperto
    }

    // --- RIMOSSO LOG: Input Accettato ---
    // console.log(`>>> handleKeyPress: Input accettato, procedo con switch.`);

    const key = event.key.toUpperCase(); // Converte il tasto in maiuscolo per consistenza

    // TODO: Implementare la logica di movimento e azioni
    switch (key) {
        case 'W':
        case 'ARROWUP':
            movePlayer(0, -1); // Muovi su
            break;
        case 'S':
        case 'ARROWDOWN':
            movePlayer(0, 1); // Muovi giù
            break;
        case 'A':
        case 'ARROWLEFT':
            movePlayer(-1, 0); // Muovi sinistra
            break;
        case 'D':
        case 'ARROWRIGHT':
            movePlayer(1, 0); // Muovi destra
            break;
        case 'I':
            // console.log("Azione: Inventario (da implementare)"); // Rimosso
            break;
        // Aggiungere altri tasti se necessario (es. 'E' per Interagisci, 'C' per Scheda Personaggio)
    }
}

/**
 * Imposta gli event listener per l'input da tastiera e dai pulsanti su schermo.
 */
function setupInputListeners() {
    // Listener per la tastiera
    // console.log(">>> setupInputListeners: Aggiungo listener keydown a document"); // RIMOSSO LOG
    document.removeEventListener('keydown', handleKeyPress);
    document.addEventListener('keydown', handleKeyPress);

    // Listener per click sull'inventario (event delegation)
    if (inventoryList) {
        inventoryList.addEventListener('click', (event) => {
            const clickedLi = event.target.closest('li'); // Trova l'elemento <li> cliccato
            if (clickedLi && clickedLi.dataset.itemId) { // Assicurati che sia un LI con un itemId
                const itemId = clickedLi.dataset.itemId;
                showItemActionPopup(itemId); // Mostra le opzioni per l'oggetto cliccato
            }
        });
    }

    /* // Listener per bottone Inventario (I) - Commentato
    if(inventoryButton) {
        inventoryButton.addEventListener('click', () => {
             console.log("Azione: Inventario Bottone (da implementare - es. toggle visibilità pannello?)");
        });
    }
    */

    // TODO: Aggiungere listener per i pulsanti su schermo se necessario,
    // ad esempio collegando i bottoni a movePlayer o showInventory.
    // Esempio:
    // const btnUp = document.getElementById('btn-up');
    // if (btnUp) btnUp.addEventListener('click', () => movePlayer(0, -1));
}

/**
 * Mostra un popup con le azioni disponibili per un oggetto dell'inventario.
 * @param {string} itemId - L'ID dell'oggetto selezionato.
 */
function showItemActionPopup(itemId) {
    const itemInfo = ITEM_DATA[itemId];
    const itemInInventory = player.inventory.find(slot => slot.itemId === itemId);

    if (!itemInfo || !itemInInventory) {
        console.error(`showItemActionPopup: Oggetto ${itemId} non trovato o non nell'inventario.`);
        addMessage("Errore nel selezionare l'oggetto.", "warning");
        return;
    }

    const popupTitle = itemInfo.name;
    const popupDescription = itemInfo.description;
    const popupChoices = [];

    // Aggiunge il pulsante "Usa" se l'oggetto è utilizzabile
    if (itemInfo.usable) {
        popupChoices.push({
            text: `Usa ${itemInfo.name}`, // Testo del pulsante
            action: () => useItem(itemId) // Funzione da chiamare al click
        });
    }

    // Aggiunge il pulsante "Annulla"
    popupChoices.push({
        text: "Annulla",
        action: () => closeEventPopup() // Semplice chiusura popup
    });

    // Modifichiamo showEventPopup per accettare azioni dirette nei choices
    showEventPopup({
        isActionPopup: true, // Nuovo flag per distinguere da eventi normali
        title: popupTitle,
        description: popupDescription,
        choices: popupChoices // Passa le scelte con le azioni associate
    });

    // --- NUOVO: Aggiungi listener QUI, DOPO aver chiamato showEventPopup ---
    if (eventChoicesContainer) {
        // console.log("Aggiungo listener a eventChoicesContainer da showItemActionPopup"); // RIMOSSO Log
        eventChoicesContainer.removeEventListener('click', handleChoiceContainerClick); // Rimuovi eventuali listener precedenti per sicurezza
        eventChoicesContainer.addEventListener('click', handleChoiceContainerClick);
    } else {
        console.error("ERRORE: Impossibile aggiungere listener da showItemActionPopup perché eventChoicesContainer non trovato!");
    }
    // --- FINE NUOVO ---
}

/**
 * Applica l'effetto di un oggetto utilizzabile.
 * @param {string} itemId - L'ID dell'oggetto da usare.
 */
function useItem(itemId) {
    // console.log(`useItem INIZIO - itemId: ${itemId}, Stato Pausa: ${gamePaused}`); // RIMOSSO DEBUG LOG
    const itemInfo = ITEM_DATA[itemId];
    const itemIndex = player.inventory.findIndex(slot => slot.itemId === itemId);

    // Verifica esistenza, usabilità e quantità
    if (!itemInfo || !itemInfo.usable || itemIndex === -1) {
        console.error(`useItem: Impossibile usare l'oggetto ${itemId}. Non trovato, non usabile o non nell'inventario.`);
        addMessage(`Non puoi usare ${itemInfo?.name || 'questo oggetto'}.`, "warning");
        // È importante chiamare closeEventPopup anche in caso di errore per sbloccare!
        closeEventPopup();
        // console.log(`useItem ERRORE - itemId: ${itemId}, Chiamata closeEventPopup() effettuata.`); // DEBUG LOG
        return;
    }

    const itemSlot = player.inventory[itemIndex];
    let message = `Hai usato ${itemInfo.name}.`;
    let effectAppliedSuccessfully = false; // Indica se l'effetto ha avuto successo (es. rimozione status)

    // Applica effetto
    if (itemInfo.effect) {
        const effect = itemInfo.effect;
        try { // Aggiungo un try...catch qui per sicurezza
            switch (effect.type) {
                case 'add_resource':
                    if (player.hasOwnProperty(effect.resource_type)) {
                        const currentValue = player[effect.resource_type];
                        // Calcola nuovo valore, clampando al massimo se necessario (es. 10? da definire)
                        // Per ora, non clampiamo. TODO: Definire MAX_FOOD, MAX_WATER?
                        player[effect.resource_type] += effect.amount;
                        message += ` (+${effect.amount} ${effect.resource_type === 'food' ? 'Sazietà' : 'Idratazione'})`;
                        effectAppliedSuccessfully = true;
                    } else {
                        message += " Ma non ha avuto effetto.";
                        console.warn(`Effetto add_resource per ${itemId}: tipo risorsa ${effect.resource_type} non trovato nel player.`);
                    }
                    break;

                case 'heal_status':
                    if (player.hasOwnProperty(effect.status_cured) && player[effect.status_cured]) {
                         const healChance = effect.chance || 1.0; // Assume 100% se non specificato
                         let hpHealedMessagePart = "";
                         let hpActuallyHealed = 0;

                         // --- NUOVO: Applica recupero HP GARANTITO per bende se ferito, PRIMA del check ---
                         const HEAL_AMOUNT_BANDAGES = 1; // Quanto HP recuperano le bende
                         if (effect.status_cured === 'isInjured') { // Controlla se l'oggetto è inteso per curare 'isInjured'
                             const hpBeforeHeal = player.hp;
                             player.hp = Math.min(player.maxHp, player.hp + HEAL_AMOUNT_BANDAGES);
                             hpActuallyHealed = Math.round((player.hp - hpBeforeHeal) * 10) / 10;
                             if (hpActuallyHealed > 0) {
                                hpHealedMessagePart = ` (+${hpActuallyHealed} HP)`; // Prepara parte del messaggio
                             }
                         }
                         // --- FINE NUOVO ---

                         // Ora controlla se rimuove lo status
                         if (Math.random() < healChance) {
                             player[effect.status_cured] = false;
                             // Costruisce messaggio successo: effetto base + eventuale cura HP base
                             message += ` ${effect.success_message || 'Ti senti meglio!'}${hpHealedMessagePart}`;

                             // --- NUOVO: Gestione heal_hp_on_success ---
                             if (effect.heal_hp_on_success && effect.heal_hp_on_success > 0) {
                                 const hpBeforeBonusHeal = player.hp;
                                 player.hp = Math.min(player.maxHp, player.hp + effect.heal_hp_on_success);
                                 const hpBonusHealed = Math.round((player.hp - hpBeforeBonusHeal) * 10) / 10;
                                 if (hpBonusHealed > 0) {
                                    message += ` (+${hpBonusHealed} HP bonus)`; // Aggiunge info specifica
                                 }
                             }
                             // --- FINE NUOVO ---

                             effectAppliedSuccessfully = true;
                         } else {
                             // Costruisce messaggio fallimento: effetto base + eventuale cura HP (la cura HP avviene comunque)
                             message += ` ${effect.failure_message || 'Non ha funzionato...'}${hpHealedMessagePart}`;
                             // Consideriamo l'effetto applicato solo se lo status viene rimosso? O anche se cura solo HP?
                             // Per ora, consideriamo effectApplied = true solo se rimuove lo status.
                             // Ma l'oggetto viene comunque consumato perché ha tentato un effetto (cura HP).
                             effectAppliedSuccessfully = false; // Status non rimosso
                         }
                    } else {
                        // Se lo stato non esiste o non è attivo, non fa nulla
                        message += " Ma non ne avevi bisogno.";
                    }
                    break;

                // --- NUOVO CASE per HEAL_HP ---
                case 'heal_hp':
                    const minHeal = effect.amount_min || 1; // Fallback a 1 se non definito
                    const maxHeal = effect.amount_max || minHeal; // Fallback a minHeal se non definito
                    const healAmount = getRandomInt(minHeal, maxHeal); // Calcola HP casuali nel range

                    const hpBeforeHeal = player.hp;
                    player.hp = Math.min(player.maxHp, player.hp + healAmount);
                    const hpActuallyHealed = Math.round((player.hp - hpBeforeHeal) * 10) / 10; // Arrotonda

                    if (hpActuallyHealed > 0) {
                        message += ` Ti senti leggermente rinvigorito. (+${hpActuallyHealed} HP)`;
                        effectAppliedSuccessfully = true;
                    } else {
                        message += " Ma non sembrano avere effetto su di te ora."; // Già al massimo HP
                        effectAppliedSuccessfully = false; // Nessun effetto reale applicato
                    }
                    break;
                // --- FINE NUOVO CASE ---

                default:
                     message += " Ma il suo effetto è sconosciuto.";
                     console.warn(`Effetto non gestito per ${itemId}: tipo ${effect.type}`);
            }
        } catch (e) {
             console.error(`Errore durante l'applicazione dell'effetto per ${itemId}:`, e);
             message += " Ma qualcosa è andato storto durante l'uso.";
             effectAppliedSuccessfully = false;
        }
    } else {
        message += " Ma non sembra avere alcun effetto.";
        console.log(`Oggetto ${itemId} usato ma senza effetto definito. Non consumato.`);
        effectAppliedSuccessfully = false; // Nessun effetto
    }

    // Consuma oggetto solo se l'effetto è stato applicato O se non c'era effetto ma era usabile?
    // Modifichiamo per consumare SEMPRE se l'oggetto è usabile e l'azione è stata tentata.
    if (itemInfo.usable) {
        itemSlot.quantity -= 1;
        if (itemSlot.quantity <= 0) {
            player.inventory.splice(itemIndex, 1); // Rimuove oggetto se quantità è 0
        }
    }

    addMessage(message, effectAppliedSuccessfully ? 'success' : 'info', true);
    renderStats();
    renderInventory();

    // Chiama closeEventPopup ALLA FINE, dopo tutte le altre operazioni
    closeEventPopup();

    // console.log(`useItem FINE - itemId: ${itemId}, Chiamata closeEventPopup() effettuata.`); // RIMOSSO DEBUG LOG
}

// --- GESTIONE EVENTI AMBIENTALI E LORE ---

/**
 * Mostra un testo descrittivo (flavor text) casuale basato sulla casella corrente e l'ora.
 * Non viene mostrato se un evento specifico si è già attivato nella stessa casella.
 * @param {object} tile - L'oggetto tile su cui si trova il giocatore.
 */
function showRandomFlavorText(tile) {
    // Non mostrare flavor text se un evento popup è attivo o se il gioco è finito
    if (eventScreenActive || !gameActive || !tile) return;

    // Non mostrare flavor text su Start o End
    if (tile.type === TILE_SYMBOLS.START || tile.type === TILE_SYMBOLS.END) return;

    // Controlla la probabilità
    if (Math.random() < FLAVOR_TEXT_CHANCE) {
        let flavorArray = null;
        const tileKey = Object.keys(TILE_SYMBOLS).find(k => TILE_SYMBOLS[k] === tile.type);

        if (!tileKey) return; // Esce se non trova la chiave per il tipo di tile

        // Seleziona l'array di testi corretto in base a tipo di terreno e ora
        if (isDay) {
            switch (tileKey) {
                case 'PLAINS': flavorArray = flavorTextsPlains; break;
                case 'FOREST': flavorArray = flavorTextsForest; break;
                case 'MOUNTAIN': flavorArray = flavorTextsMountain; break;
                case 'RIVER': flavorArray = flavorTextsRiver; break;
                case 'CITY': flavorArray = flavorTextsCity; break;
                case 'VILLAGE': flavorArray = flavorTextsVillage; break;
                case 'REST_STOP': flavorArray = flavorTextsRestStop; break;
                // START, END, PLAYER non hanno flavor text
            }
        } else { // È notte
            switch (tileKey) {
                case 'PLAINS': flavorArray = flavorTextsNightPlains; break;
                case 'FOREST': flavorArray = flavorTextsNightForest; break;
                // Aggiungere altri case per NightMountain, NightRiver etc. se verranno creati
                // Per ora, se non c'è un array specifico per la notte, non mostriamo nulla
            }
        }

        // Se abbiamo trovato un array valido, selezioniamo e mostriamo un testo
        if (flavorArray && flavorArray.length > 0) {
            const randomText = getRandomText(flavorArray);
            if (randomText) {
                addMessage(randomText, 'normal'); // Usiamo tipo 'normal' per flavor text
            }
        }
    }
}

/**
 * Controlla la possibilità di trovare un frammento di lore casuale.
 * Viene chiamato dopo ogni movimento.
 */
function checkForLoreFragment() {
    if (eventScreenActive || !gameActive) return; // Non cercare se popup attivo o gioco finito

    if (Math.random() < LORE_FRAGMENT_CHANCE) {
        if (loreFragments && loreFragments.length > 0) {
            const randomLore = getRandomText(loreFragments);
            if (randomLore) {
                addMessage("Trovi un frammento di conoscenza perduta:", 'lore');
                addMessage(randomLore, 'lore'); // Mostra il frammento effettivo
            }
        }
    }
}

// --- GESTIONE EVENTI COMPLESSI ---

/**
 * Tenta di attivare un evento complesso generico (Predoni, Animali, etc.).
 * Viene chiamato solo se un evento specifico del tile non è stato attivato.
 * @param {object} tile - L'oggetto tile su cui si trova il giocatore.
 */
function triggerComplexEvent(tile) {
    if (eventScreenActive || !gameActive || !tile) return;
    if (tile.type === TILE_SYMBOLS.START || tile.type === TILE_SYMBOLS.END) return;

    // Non attivare eventi complessi nei rifugi (sono sicuri)
    const tileKey = Object.keys(TILE_SYMBOLS).find(k => TILE_SYMBOLS[k] === tile.type);
    if ([TILE_SYMBOLS.VILLAGE, TILE_SYMBOLS.CITY, TILE_SYMBOLS.REST_STOP].includes(tile.type)) {
        // Probabilità ridotta di eventi ostili nei rifugi? O solo eventi specifici?
        // Per ora, disabilitiamo eventi complessi generici nei rifugi.
        // Gli eventi specifici del tile (es. cercare nel villaggio) possono comunque attivarsi.
        return;
    }

    // Controlla probabilità base evento complesso
    if (Math.random() < COMPLEX_EVENT_CHANCE) {
        let eventType = chooseWeightedEventType();

        // --- Logica Selezione Tipo Evento ---
        let eventDescription = "";
        let eventChoices = [];
        let eventTitle = "Qualcosa Accade...";
        let context = {}; // Contesto specifico evento (es. tipo animale)

        // Adatta il tipo di evento all'ambiente e all'ora
        if (isDay) {
            if (eventType === 'HORROR') eventType = 'ANIMAL'; // Niente Orrore di giorno
        } else { // Notte
             if (eventType === 'PREDATOR') eventType = 'ANIMAL'; // Predoni più rari di notte? Mettiamo Animali
             if (eventType === 'DILEMMA') eventType = 'HORROR'; // Dilemmi meno probabili di notte?
        }

        switch(eventType) {
            case 'PREDATOR':
                eventTitle = "Incontro Ostile";
                eventDescription = getRandomText(descrizioniIncontroPredoni);
                eventChoices = [
                    { text: "Fuggi (Agilità)", skillCheck: { stat: 'agilita', difficulty: 12 }, actionKey: 'fuga' },
                    { text: "Combatti (Potenza)", skillCheck: { stat: 'potenza', difficulty: 14 }, actionKey: 'lotta' },
                    { text: "Prova a parlare (Influenza)", skillCheck: { stat: 'influenza', difficulty: 13 }, actionKey: 'parla' } // Usa Influenza invece di Carisma
                ];
                break;
            case 'ANIMAL':
                 const animalType = getRandomText(tipiBestie);
                 context.animalType = animalType;
                 eventTitle = `Bestia Pericolosa: ${animalType}`;
                 eventDescription = getRandomText(descrizioniIncontroBestie).replace("{animale}", animalType);
                 eventChoices = [
                     { text: "Evita silenziosamente (Tracce)", skillCheck: { stat: 'tracce', difficulty: 11 }, actionKey: 'evita' },
                     { text: "Attacca la bestia (Potenza)", skillCheck: { stat: 'potenza', difficulty: 13 }, actionKey: 'attacca' },
                     // { text: "Osserva da lontano (Presagio)", skillCheck: { stat: 'presagio', difficulty: 10 }, actionKey: 'osserva' } // Opzione rimossa
                 ];
                 break;
            case 'TRACKS':
                 eventTitle = "Tracce Strane";
                 eventDescription = getRandomText(descrizioniTracce);
                 eventChoices = [
                     { text: "Segui le tracce (Tracce)", skillCheck: { stat: 'tracce', difficulty: 10 }, actionKey: 'segui' },
                     { text: "Ignora le tracce", outcome: ["Decidi di non perdere tempo e prosegui.", "La prudenza ti suggerisce di ignorare le tracce."] , actionKey: 'ignora'}
                 ];
                 break;
            case 'VILLAGE_HOSTILE': // Esempio specifico, attivabile solo in Villaggi?
                 eventTitle = "Villaggio Ostile";
                 eventDescription = getRandomText(descrizioniVillaggioOstile);
                 eventChoices = [
                     { text: "Allontanati lentamente", outcome: esitiVillaggioOstileAllontanati, actionKey: 'allontanati' },
                     { text: "Tenta di negoziare (Influenza)", skillCheck: { stat: 'influenza', difficulty: 12 }, actionKey: 'negozia' } // Usa Influenza invece di Carisma
                 ];
                 break;
            case 'ENVIRONMENTAL':
                 eventTitle = "Pericolo Ambientale";
                 const isAgilityBased = Math.random() < 0.5;
                 if (isAgilityBased) {
                    eventDescription = getRandomText(descrizioniPericoloAmbientaleAgilita);
                    eventChoices = [
                        { text: "Schiva! (Agilità)", skillCheck: { stat: 'agilita', difficulty: 12 }, actionKey: 'evita' }
                    ];
                 } else {
                    eventDescription = getRandomText(descrizioniPericoloAmbientalePresagio);
                     eventChoices = [
                         { text: "Percepisci il pericolo! (Presagio)", skillCheck: { stat: 'presagio', difficulty: 11 }, actionKey: 'evita' }
                     ];
                 }
                 break;
            case 'DILEMMA':
                 eventTitle = "Dilemma Morale";
                 eventDescription = getRandomText(descrizioniDilemmaMorale);
                 eventChoices = [
                     { text: "Indaga/Intervieni (Presagio)", skillCheck: { stat: 'presagio', difficulty: 13 }, actionKey: 'intervieni' },
                     { text: "Ignora e prosegui", outcome: esitiDilemmaMoraleIgnora, actionKey: 'ignora' }
                 ];
                 break;
             case 'SHELTER_INSPECT': // Attivato solo se giocatore sceglie di cercare in rifugio?
                  eventTitle = "Ispezione Rifugio";
                  eventDescription = getRandomText(descrizioniRifugioStrano);
                  eventChoices = [
                      { text: "Ispeziona attentamente (Tracce)", skillCheck: { stat: 'tracce', difficulty: 11 }, actionKey: 'ispeziona' },
                      { text: "Lascia perdere", outcome: esitiRifugioLasciaPerdere, actionKey: 'ignora' }
                  ];
                  break;
            case 'HORROR': // Solo di notte
                 eventTitle = "Orrore Indicibile";
                 eventDescription = getRandomText(descrizioniOrroreIndicibile);
                 eventChoices = [
                     { text: "Fuggi terrorizzato! (Agilità?)", skillCheck: { stat: 'agilita', difficulty: 14 }, actionKey: 'fuga' }, // Difficile fuggire
                     { text: "Affronta l'orrore (Adattamento?)", skillCheck: { stat: 'adattamento', difficulty: 15 }, actionKey: 'affronta' } // Molto difficile resistere
                 ];
                 break;
            default:
                 console.warn("Tipo evento complesso non riconosciuto:", eventType);
                 return; // Non fare nulla se tipo non valido
        }

        // Salva contesto evento complesso
        currentEventContext = { type: eventType, title: eventTitle, description: eventDescription, choices: eventChoices, context: context };

        // Mostra il popup evento
        buildAndShowComplexEvent(currentEventContext);

    }
}

/**
 * Costruisce e mostra il popup per un evento complesso.
 * @param {object} eventCtx Il contesto dell'evento complesso.
 */
function buildAndShowComplexEvent(eventCtx) {
    showEventPopup({
        title: eventCtx.title,
        description: eventCtx.description,
        choices: eventCtx.choices,
        isOutcome: false,
        type: eventCtx.type // Passa il tipo per riferimento futuro
    });
}

/**
 * Funzione helper per ottenere un testo casuale da un array.
 * @param {Array<string>} textArray L'array di stringhe.
 * @returns {string|null} Una stringa casuale o null se l'array è vuoto/non valido.
 */
function getRandomText(textArray) {
    if (!textArray || textArray.length === 0) {
        return null;
    }
    const randomIndex = Math.floor(Math.random() * textArray.length);
    return textArray[randomIndex];
}

/**
 * Funzione helper per trovare e aggiungere un frammento di lore.
 */
function findLoreFragment() {
    if (loreFragments && loreFragments.length > 0) {
        const randomLore = getRandomText(loreFragments);
        if (randomLore) {
            addMessage("Trovi un frammento di conoscenza perduta:", 'lore');
            addMessage(randomLore, 'lore');
        }
    }
}

/**
 * Sceglie casualmente un tipo di evento complesso basato su pesi (probabilità).
 * @returns {string} Il tipo di evento scelto (es. 'PREDATOR', 'ANIMAL').
 */
function chooseWeightedEventType() {
    const weights = {
        'PREDATOR': 0.25, // 25%
        'ANIMAL': 0.35,   // 35%
        'TRACKS': 0.15,   // 15%
        'ENVIRONMENTAL': 0.10, // 10%
        'DILEMMA': 0.05,   // 5% (più raro)
        'HORROR': 0.10    // 10% (solo di notte)
        // 'VILLAGE_HOSTILE' e 'SHELTER_INSPECT' non sono scelti casualmente qui
    };

    let totalWeight = 0;
    for (const type in weights) {
        totalWeight += weights[type];
    }

    let randomNum = Math.random() * totalWeight;
    let weightSum = 0;

    for (const type in weights) {
        weightSum += weights[type];
        if (randomNum <= weightSum) {
            return type;
        }
    }

    return 'ANIMAL'; // Fallback predefinito
}

// --- AVVIO GIOCO ---

window.onload = function() {
    try {
        initializeGame(); // Chiamata alla funzione originale
    } catch (e) {
        console.error("ERRORE CATTURATO direttamente nell'wrapper onload:", e);
        // Potrebbe essere utile mostrare l'errore nel DOM se la console non è visibile
        if(gameContainer) gameContainer.innerHTML = `<p style='color:red; padding: 20px;'>ERRORE FATALE ONLOAD: ${e.message}. Impossibile avviare. Controlla la console.</p>`;
    }
};

// --- NUOVA FUNZIONE PER MESSAGGI DI STATO ---

/**
 * Controlla lo stato del giocatore (fame, sete, ferite, malattia)
 * e aggiunge messaggi descrittivi casuali al log se necessario.
 */
function checkAndLogStatusMessages() {
    if (!gameActive || !player) return;

    // Messaggi Fame/Sete (mostrati sempre se attivi)
    if (player.food <= 0) {
        const msg = getRandomText(STATO_MESSAGGI.AFFAMATO);
        if(msg) addMessage(msg, 'warning');
    }
    if (player.water <= 0) {
        const msg = getRandomText(STATO_MESSAGGI.ASSETATO);
        if(msg) addMessage(msg, 'warning');
    }

    // Messaggi Ferito/Malato (mostrati con probabilità per evitare spam)
    const statusMessageChance = 0.25; // 25% probabilità per turno
    if (player.isInjured && Math.random() < statusMessageChance) {
         const msg = getRandomText(STATO_MESSAGGI.FERITO);
         if(msg) addMessage(msg, 'warning');
    }
    if (player.isSick && Math.random() < statusMessageChance) {
         const msg = getRandomText(STATO_MESSAGGI.INFETTO);
         if(msg) addMessage(msg, 'warning');
    }

    // Messaggio Morente (se HP bassi)
    const dyingThreshold = player.maxHp * 0.25; // Es. sotto il 25% HP
    if (player.hp <= dyingThreshold && player.hp > 0) { // Solo se non già morto
         const msg = getRandomText(STATO_MESSAGGI.MORENTE);
         if(msg) addMessage(msg, 'danger', true); // Messaggio importante
    }
}

/**
 * Applica la ricompensa definita in un oggetto choice.successReward.
 * @param {object | null} rewardObject L'oggetto successReward della scelta.
 * @returns {{consequences: string, messageType: string}} Un oggetto con la stringa delle conseguenze e il tipo di messaggio.
 */
function applyChoiceReward(rewardObject) {
    let consequences = "";
    let messageType = 'info'; // Default

    if (!rewardObject) return { consequences, messageType };

    try {
        if (rewardObject.type === 'random_common_resource') {
            // Definisce le risorse comuni e le loro probabilità (pesi)
            // scrap_metal (40%), bandages_dirty (30%), canned_food (15%), water_purified_small (15%)
            const commonResources = [
                { id: 'scrap_metal', weight: 40 },
                { id: 'bandages_dirty', weight: 30 },
                { id: 'canned_food', weight: 15 },
                { id: 'water_purified_small', weight: 15 }
            ];
            const totalWeight = commonResources.reduce((sum, item) => sum + item.weight, 0);
            let randomNum = Math.random() * totalWeight;
            let randomItemId = commonResources[commonResources.length - 1].id; // Fallback all'ultimo

            for (const item of commonResources) {
                if (randomNum < item.weight) {
                    randomItemId = item.id;
                    break;
                }
                randomNum -= item.weight;
            }

            const quantity = rewardObject.quantity || 1;
            addItemToInventory(randomItemId, quantity);
            const itemInfo = ITEM_DATA[randomItemId];
            if (itemInfo) {
                 consequences = ` Trovi ${quantity} x ${itemInfo.name}!`;
                 messageType = 'success';
            } else {
                 console.warn("Random resource generated invalid item ID:", randomItemId);
                 consequences = " Trovi qualcosa, ma non riesci a identificarlo.";
                 messageType = 'warning';
            }
        } else if (rewardObject.type === 'random_lore_fragment') {
            findLoreFragment(); // Questa funzione logga già i messaggi di lore
            consequences = " Scopri un frammento interessante del passato.";
            messageType = 'info';
        } else if (rewardObject.itemId) { // Gestisce ricompense specifiche esistenti
            const itemInfo = ITEM_DATA[rewardObject.itemId];
            const quantity = rewardObject.quantity || 1;
            if (itemInfo && quantity > 0) {
                addItemToInventory(rewardObject.itemId, quantity);
                consequences = ` Hai trovato ${quantity} x ${itemInfo.name}!`;
                messageType = 'success';
            } else {
                console.warn(`Reward defined with invalid itemId '${rewardObject.itemId}' or quantity 0.`);
                consequences = " Trovi qualcosa di rotto o inutile.";
                messageType = 'warning';
            }
        }
        // Aggiungere altri tipi di ricompensa qui se necessario
    } catch (e) {
        console.error("Errore durante l'applicazione della ricompensa:", e, "Reward Object:", rewardObject);
        consequences = " Si verifica un errore nel determinare la ricompensa.";
        messageType = 'warning';
    }

    return { consequences, messageType };
}

// ----- Gestione Tooltip Inventario (Aggiunto da modifiche UI/UX) -----

const itemTooltip = document.getElementById('item-tooltip');
const tooltipItemName = document.getElementById('tooltip-item-name');
const tooltipItemDesc = document.getElementById('tooltip-item-desc');
// const tooltipActions = document.getElementById('tooltip-item-actions'); // Per futuri bottoni

// Funzione per mostrare il tooltip
function showItemTooltip(item, event) {
    if (gamePaused || !item || !itemTooltip || !tooltipItemName || !tooltipItemDesc) return; // Non mostrare se gioco in pausa

    tooltipItemName.textContent = item.name;
    tooltipItemDesc.textContent = item.description || "Nessuna descrizione disponibile.";

    // Posizionamento (Mantenuto esempio base, aggiustare se necessario)
    const mainRect = gameContainer.getBoundingClientRect();
    let x = event.clientX - mainRect.left + 15;
    let y = event.clientY - mainRect.top + 15;
    if (x + itemTooltip.offsetWidth > mainRect.width) x = mainRect.width - itemTooltip.offsetWidth - 10;
    if (y + itemTooltip.offsetHeight > mainRect.height) y = mainRect.height - itemTooltip.offsetHeight - 10;
    if (x < 10) x = 10; if (y < 10) y = 10;
    itemTooltip.style.left = `${x}px`; itemTooltip.style.top = `${y}px`;

    itemTooltip.classList.remove('hidden');
}

// Funzione per nascondere il tooltip
function hideItemTooltip() { if (itemTooltip) itemTooltip.classList.add('hidden'); }

// Aggiungere listener 'mouseover' e 'mouseout' a inventoryList (spostati qui da setupInputListeners per raggruppare)
if (inventoryList) {
     inventoryList.addEventListener('mouseover', (event) => {
         const listItem = event.target.closest('li[data-item-id]');
         if (listItem && !gamePaused) { // Non mostrare se gioco in pausa
             const itemId = listItem.dataset.itemId;
             const itemData = ITEM_DATA[itemId];
             if (itemData) showItemTooltip(itemData, event);
         }
     });
     inventoryList.addEventListener('mouseout', (event) => {
         const listItem = event.target.closest('li[data-item-id]');
         if (listItem) hideItemTooltip();
     });
     // Il listener 'click' è già stato modificato in setupInputListeners
}
// ----- Fine Gestione Tooltip Inventario -----

// --- NUOVA FUNZIONE per gestire click sul CONTENITORE delle scelte ---
function handleChoiceContainerClick(event) {
    // Trova il BOTTONE specifico che è stato cliccato all'interno del contenitore
    const clickedButton = event.target.closest('button');
    if (!clickedButton || !eventChoicesContainer.contains(clickedButton)) {
        return; // Non era un click su un bottone dentro il nostro contenitore
    }

    // Determina il tipo di azione dal data attribute
    if (clickedButton.dataset.choiceIndex !== undefined) {
        // --- Gestione Scelta Evento Standard ---
        const choiceIndex = parseInt(clickedButton.dataset.choiceIndex, 10);
        // Rimuoviamo il listener PRIMA di chiamare handleEventChoice,
        // perché handleEventChoice può aprire un NUOVO popup (risultato)
        // che avrà il suo bottone 'Continua' (gestito da showEventPopup con onclick diretto per ora).
        eventChoicesContainer.removeEventListener('click', handleChoiceContainerClick);
        handleEventChoice(choiceIndex); // Questa funzione apre il popup risultato o chiude
        // Non fare altro qui, l'esecuzione prosegue dentro handleEventChoice
        return; // Esce dalla funzione handleChoiceContainerClick

    } else if (clickedButton.dataset.actionType === 'itemAction') {
        // --- Gestione Azione Oggetto ---
        const actionKey = clickedButton.dataset.actionKey;
        const actionText = clickedButton.dataset.actionText;

        // Rimuoviamo il listener solo se l'azione chiuderà il popup ('cancel' o 'use' che chiama closeEventPopup)
        eventChoicesContainer.removeEventListener('click', handleChoiceContainerClick);

        if (actionKey === 'cancel') {
            closeEventPopup();
        } else if (actionKey === 'use') {
            // Recupera e esegue l'azione originale
            if (currentEventContext && currentEventContext.isActionPopup && currentEventContext.choices) {
                const correspondingChoice = currentEventContext.choices.find(c => c.text === actionText);
                if (correspondingChoice && typeof correspondingChoice.action === 'function') {
                    correspondingChoice.action(); // Questa chiama useItem, che chiama closeEventPopup
                } else {
                    console.error(`Funzione azione originale non trovata per '${actionText}'`);
                    closeEventPopup();
                }
            } else {
                console.error("Contesto evento non valido per recuperare azione 'use'!");
                closeEventPopup();
            }
        } else {
            console.warn(`Chiave azione oggetto non gestita: '${actionKey}'`);
            closeEventPopup();
        }
        return; // Esce dalla funzione

    } else if (clickedButton.classList.contains('continue-button')){
        // --- Gestione Bottone Continua (se aggiunto al container in futuro) ---
        // Al momento, il bottone continua ha un onclick diretto in showEventPopup
        eventChoicesContainer.removeEventListener('click', handleChoiceContainerClick);
        closeEventPopup();
        return; // Esce dalla funzione
    }

    // --- Fallback ---
    // Se arriviamo qui, è un bottone nel contenitore ma non riconosciuto
    console.warn("Click su bottone non riconosciuto nel contenitore scelte.");
    eventChoicesContainer.removeEventListener('click', handleChoiceContainerClick);
    closeEventPopup();
}

// La seconda definizione (quella problematica) è stata rimossa.
// La funzione handleEventChoice corretta è quella definita precedentemente nel codice.
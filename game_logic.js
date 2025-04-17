/**
 * The Safe Place - Minimal Roguelike
 * File: game_logic.js (Versione Pulita)
 * Descrizione: Contiene la logica principale del gioco, la gestione degli eventi,
 * il movimento, il rendering e le interazioni del giocatore.
 * Le funzioni utility da utils.js sono state integrate qui.
 * Il codice commentato obsoleto è stato rimosso.
 */

// --- FUNZIONI UTILITY (Integrate da utils.js e ottimizzate) ---

/**
 * Genera un numero intero casuale tra min e max (inclusi).
 * @param {number} min - Il valore minimo.
 * @param {number} max - Il valore massimo.
 * @returns {number} Un numero intero casuale nell'intervallo specificato.
 */
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

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

    // Aggiunge il messaggio alla FINE dell'array logico
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
let eventScreenActive = false; // Flag per indicare se un popup evento/inventario è attivo
let currentEventChoices = []; // Array per memorizzare le scelte dell'evento corrente (per input tastiera)
let currentEventContext = null; // Oggetto per memorizzare il contesto dell'evento corrente
let dayMovesCounter = 0; // Contatore dei passi effettuati durante il giorno
let isDay = true; // Flag per indicare se è giorno (true) o notte (false)
let daysSurvived = 0; // Contatore dei giorni sopravvissuti


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
const moveButtons = document.querySelectorAll('#controls button:not(#btn-inventory)'); // Seleziona solo i bottoni di movimento
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
    dayMovesCounter = 0;
    isDay = true;
    daysSurvived = 0;

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
    if(eventOverlay) eventOverlay.style.display = 'none';
    if(endScreen) endScreen.style.display = 'none';
    if(gameContainer) gameContainer.style.display = 'flex'; // Mostra l'interfaccia di gioco

    // Effettua il rendering iniziale dell'interfaccia
    try {
        renderLegend();
        renderStats(); // Renderizza statistiche e risorse
        renderInventory(); // Renderizza l'inventario iniziale
        renderMap(); // Renderizza la mappa
        renderMessages(); // Pulisce il log precedente
        addMessage(`Inizio del viaggio. HP:${player.hp}, Sazietà:${player.food}, Idratazione:${player.water}. È Giorno.`, 'info');
    } catch (e) {
        console.error("ERRORE RENDER INIZIALE:", e);
        if(mapDisplay) mapDisplay.textContent = "Errore nel rendering iniziale!";
        gameActive = false; // Impedisce di giocare se il rendering fallisce
    }

    // Se tutto è andato bene, abilita i controlli e imposta i listener
    if (gameActive) {
        enableControls();
        setupInputListeners(); // Imposta listener per tastiera e pulsanti
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
        statHp.textContent = player?.hp ?? '--';
        statMaxHp.textContent = player?.maxHp ?? '--';
        statVig.textContent = player?.vigore ?? '--';
        statPot.textContent = player?.potenza ?? '--';
        statAgi.textContent = player?.agilita ?? '--';
        statTra.textContent = player?.tracce ?? '--';
        statInf.textContent = player?.influenza ?? '--';
        statPre.textContent = player?.presagio ?? '--';
        statAda.textContent = player?.adattamento ?? '--';
        statAcq.textContent = player?.acquisita ?? '--';

        // Aggiorna risorse (colonna sx)
        statFood.textContent = player?.food ?? '--';
        statWater.textContent = player?.water ?? '--';
        // Applica/rimuove classe 'low-resource' per effetto visivo (es. rosso lampeggiante)
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
                // Mostra passi rimanenti nel giorno
                statDayTime.textContent = `Giorno (${DAY_LENGTH_MOVES - dayMovesCounter} p.)`;
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
        // Ricostruisce l'HTML della lista messaggi basandosi sull'array 'messages'
        messagesList.innerHTML = messages.map(msg => `<li class="${msg.class || ''}">${msg.text}</li>`).join('');
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
    console.log("renderLegend: Inizio"); // DEBUG
    if (!legendList) {
        console.error("renderLegend: Errore - Elemento legendList non trovato!");
        return;
    }
    try {
        legendList.innerHTML = ''; // Pulisce legenda precedente
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
        console.log("renderLegend: Fine (Successo)"); // DEBUG
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
 * Disabilita o abilita i controlli di movimento.
 * @param {boolean} [disabled=true] - Se true, disabilita i controlli, altrimenti li abilita.
 */
function disableControls(disabled = true) {
    if (!moveButtons) return;
    moveButtons.forEach(btn => btn.disabled = disabled);
    // if(inventoryButton) inventoryButton.disabled = disabled; // Disabilita/Abilita anche bottone inventario
}

/**
 * Abilita i controlli di movimento (se il gioco è attivo).
 */
function enableControls() {
    if (gameActive) {
       disableControls(false); // Chiama disableControls con false per abilitare
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
    if (!gameActive || eventScreenActive || (dx === 0 && dy === 0)) {
        return; // Non muovere se gioco non attivo, evento aperto, o movimento nullo
    }

    const newX = player.x + dx;
    const newY = player.y + dy;

    // Controllo limiti mappa
    if (newX < 0 || newX >= MAP_WIDTH || newY < 0 || newY >= MAP_HEIGHT) {
        addMessage("Non puoi andare oltre i confini del mondo conosciuto.", "warning");
        return;
    }

    const targetTile = map[newY]?.[newX];

    // Controllo se la casella è attraversabile
    if (!targetTile || !isWalkable(targetTile)) {
        addMessage("Non puoi passare di qui.", "warning");
        return;
    }

    // Movimento valido
    disableControls(); // Disabilita controlli durante l'elaborazione

    player.x = newX;
    player.y = newY;
    targetTile.visited = true;

    addMessage(`Ti muovi verso (${newX}, ${newY}). Luogo: ${TILE_DESC[targetTile.type] || '???'}`);

    // Attiva evento PRIMA di consumare risorse/tempo?
    triggerTileEvent(targetTile);

    // Se un evento NON è attivo, procedi con consumo risorse e tempo
    if (!eventScreenActive) {
        // TODO: Consumo risorse (cibo/acqua)
        // TODO: Controllo giorno/notte (dayMovesCounter, isDay)
        // TODO: Controllo vittoria (se targetTile.type === TILE_SYMBOLS.END)
        enableControls(); // Riabilita i controlli SOLO se non c'è un evento
    }

    // Aggiorna l'interfaccia (mappa e stats vengono aggiornate anche se evento si attiva)
    renderMap();
    renderStats();

    // enableControls(); // Spostato sopra, nel blocco !eventScreenActive
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

    let eventPool = [];
    let eventChance = 0;

    // Recupera pool eventi e chance da game_data (se esistono)
    try {
        const tileKey = Object.keys(TILE_SYMBOLS).find(k => TILE_SYMBOLS[k] === tile.type);
        if (tileKey && EVENT_DATA && EVENT_DATA[tileKey]) {
            eventPool = EVENT_DATA[tileKey];
        }
        if (tileKey && EVENT_CHANCE && typeof EVENT_CHANCE[tileKey] === 'number') {
            eventChance = EVENT_CHANCE[tileKey];
        }
    } catch (e) {
        console.warn("Dati eventi (EVENT_DATA/EVENT_CHANCE) non trovati o non validi in game_data.js", e);
        return; // Esce se mancano i dati fondamentali
    }

    // Controlla la probabilità
    if (eventPool.length > 0 && Math.random() < eventChance) {
        const randomEvent = getRandomText(eventPool);
        if (randomEvent) {
            showEventPopup(randomEvent);
        } else {
             console.warn(`Tentativo di attivare evento per ${tile.type}, ma l'evento selezionato non è valido.`);
        }
    }
}

/**
 * Mostra il popup dell'evento con titolo, descrizione e scelte.
 * @param {object} eventData - L'oggetto evento da visualizzare.
 */
function showEventPopup(eventData) {
    if (!eventOverlay || !eventTitle || !eventContent || !eventChoicesContainer) {
        console.error("Elementi del popup evento non trovati nel DOM.");
        return;
    }
    if (!eventData) {
        console.error("showEventPopup chiamata senza eventData valido.");
        return;
    }

    disableControls();
    eventScreenActive = true;
    currentEventContext = eventData; // Salva contesto/dati base evento

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
            button.textContent = `${index + 1}. ${choice.text}`;
            button.onclick = () => handleEventChoice(index); // Chiama handleEventChoice
            if (choice.cssClass) button.classList.add(choice.cssClass);
            eventChoicesContainer.appendChild(button);
        });
        if(continueButton) continueButton.style.display = 'none';
    } else if (eventData.isActionPopup) {
        // Popup azioni oggetto (Usa, Annulla, etc.)
         choices.forEach((choice) => { // Non serve l'indice numerico qui
            const button = document.createElement('button');
            button.textContent = choice.text;
            button.onclick = choice.action; // Chiama direttamente l'azione definita
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

    eventOverlay.style.display = 'flex';
}

/**
 * Gestisce la selezione di una scelta nell'evento.
 * @param {number} choiceIndex - L'indice della scelta selezionata.
 */
function handleEventChoice(choiceIndex) {
    if (!currentEventChoices || choiceIndex < 0 || choiceIndex >= currentEventChoices.length) {
        console.error("Indice scelta evento non valido:", choiceIndex);
        closeEventPopup(); // Chiude comunque per sicurezza
        return;
    }

    const choice = currentEventChoices[choiceIndex];
    const baseEventTitle = currentEventContext.title || "Evento"; // Titolo evento originale

    let outcomeTitle = "Risultato";
    let outcomeDescription = `Hai scelto: ${choice.text}.`;
    let outcomeCheckDetails = null;
    let outcomeConsequences = "";
    let messageType = 'info'; // Per il log nel diario

    // --- LOGICA ESECUZIONE SCELTA --- 
    if (choice.outcome) {
        // Outcome semplice predefinito
        outcomeDescription += ` ${choice.outcome}`;
        addMessage(`${baseEventTitle}: ${choice.text}. ${choice.outcome}`, messageType, true); // Log nel diario

    } else if (choice.skillCheck) {
        // Esegue il check abilità
        const checkResult = performSkillCheck(choice.skillCheck.stat, choice.skillCheck.difficulty);
        outcomeCheckDetails = checkResult.text; // Salva dettagli check per popup

        if(checkResult.success) {
            outcomeTitle = "Successo!";
            outcomeDescription += ` ${choice.successText || "Ce l'hai fatta!"}`;
            messageType = 'success';
            
            // --- Applica Conseguenze Successo ---
            // Esempio specifico per "Strani Rumori -> Indaga (Tracce)"
            if (choice.skillCheck.stat === 'tracce' && choice.text.includes("Indaga")) {
                addItemToInventory('berries', 1);
                outcomeConsequences = "Hai raccolto delle Bacche!"; 
            } else {
                // Placeholder generico per altri successi
                outcomeConsequences = "(Placeholder: Conseguenza positiva)";
            }
            // TODO: Aggiungere logica per altre scelte/eventi

        } else {
            outcomeTitle = "Fallimento...";
            outcomeDescription += ` ${choice.failureText || "Non è andata bene..."}`;
            messageType = 'warning';
            
            // --- Applica Conseguenze Fallimento ---
            // Esempio specifico per "Strani Rumori -> Indaga (Tracce)"
             if (choice.skillCheck.stat === 'tracce' && choice.text.includes("Indaga")) {
                outcomeConsequences = "Non trovi nulla di utile.";
             } else {
                 // Placeholder generico per altri fallimenti
                 outcomeConsequences = "(Placeholder: Conseguenza negativa)";
             }
            // TODO: Aggiungere logica per altre scelte/eventi
        }
        // Log nel diario (include check ma non conseguenze dettagliate)
         addMessage(`${baseEventTitle}: ${choice.text}. ${outcomeCheckDetails}. Esito: ${checkResult.success ? 'Successo' : 'Fallimento'}.`, messageType, true);

    } else {
         // Scelta senza outcome o check definito
         outcomeDescription += " (Nessuna conseguenza particolare)";
         addMessage(`${baseEventTitle}: ${choice.text}. (Nessuna conseguenza particolare)`, messageType, true); // Log nel diario
    }
    // --- FINE LOGICA ESECUZIONE SCELTA ---

    // Mostra il risultato in un NUOVO popup evento
    showEventPopup({
        isOutcome: true, // Flag per indicare che è un popup di risultato
        title: outcomeTitle,
        description: outcomeDescription,
        checkDetails: outcomeCheckDetails, // Passa dettagli check
        consequences: outcomeConsequences // Passa conseguenze
        // choices: [] // Nessuna scelta nel popup di risultato
    });

    // Non chiudiamo il popup qui, lo fa l'utente cliccando 'Continua' nel nuovo popup
    // closeEventPopup(); 
}

/**
 * Chiude il popup dell'evento e riattiva i controlli.
 */
function closeEventPopup() {
    if (eventOverlay) eventOverlay.style.display = 'none';
    eventScreenActive = false;
    currentEventChoices = [];
    currentEventContext = null;
    enableControls();
}


// --- GESTIONE INPUT --- 

/**
 * Gestisce la pressione dei tasti per il movimento e altre azioni.
 * @param {KeyboardEvent} event - L'oggetto evento della tastiera.
 */
function handleKeyPress(event) {
    // Gestione input per SCELTE EVENTO (se popup attivo)
    if (eventScreenActive && currentEventChoices.length > 0) {
        const choiceIndex = parseInt(event.key) - 1; // Converte tasto numerico (1, 2, ...) in indice (0, 1, ...)
        if (!isNaN(choiceIndex) && choiceIndex >= 0 && choiceIndex < currentEventChoices.length) {
            handleEventChoice(choiceIndex);
            return; // Impedisce ulteriore elaborazione del tasto
        }
    }

    // Gestione input MOVIMENTO (se gioco attivo e popup NON attivo)
    if (!gameActive || eventScreenActive) {
         return; // Ignora input se gioco non attivo o se popup evento è aperto
    }

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
            console.log("Azione: Inventario (da implementare)");
            break;
        // Aggiungere altri tasti se necessario (es. 'E' per Interagisci, 'C' per Scheda Personaggio)
    }
}

/**
 * Imposta gli event listener per l'input da tastiera e dai pulsanti su schermo.
 */
function setupInputListeners() {
    // Listener per la tastiera
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
}

/**
 * Applica l'effetto di un oggetto utilizzabile.
 * @param {string} itemId - L'ID dell'oggetto da usare.
 */
function useItem(itemId) {
    const itemInfo = ITEM_DATA[itemId];
    const itemIndex = player.inventory.findIndex(slot => slot.itemId === itemId);

    // Verifica esistenza, usabilità e quantità
    if (!itemInfo || !itemInfo.usable || itemIndex === -1) {
        console.error(`useItem: Impossibile usare l'oggetto ${itemId}. Non trovato, non usabile o non nell'inventario.`);
        addMessage(`Non puoi usare ${itemInfo?.name || 'questo oggetto'}.`, "warning");
        closeEventPopup();
        return;
    }

    const itemSlot = player.inventory[itemIndex];
    let message = `Hai usato ${itemInfo.name}.`;
    let effectApplied = false;

    // Applica effetto
    if (itemInfo.effect) {
        const effect = itemInfo.effect;
        switch (effect.type) {
            case 'add_resource':
                if (player.hasOwnProperty(effect.resource_type)) {
                    const currentValue = player[effect.resource_type];
                    // Calcola nuovo valore, clampando al massimo se necessario (es. 10? da definire)
                    // Per ora, non clampiamo. TODO: Definire MAX_FOOD, MAX_WATER?
                    player[effect.resource_type] += effect.amount;
                    message += ` (+${effect.amount} ${effect.resource_type === 'food' ? 'Sazietà' : 'Idratazione'})`;
                    effectApplied = true;
                } else {
                    message += " Ma non ha avuto effetto.";
                    console.warn(`Effetto add_resource per ${itemId}: tipo risorsa ${effect.resource_type} non trovato nel player.`);
                }
                break;

            case 'heal_status':
                if (player.hasOwnProperty(effect.status_cured) && player[effect.status_cured]) {
                     const healChance = effect.chance || 1.0; // Assume 100% se non specificato
                     if (Math.random() < healChance) {
                         player[effect.status_cured] = false;
                         message += ` ${effect.success_message || 'Ti senti meglio!'}`;
                         effectApplied = true;
                     } else {
                         message += ` ${effect.failure_message || 'Non ha funzionato...'}`;
                         // Non consideriamo l'effetto applicato se il check fallisce
                     }
                } else {
                    // Se lo stato non esiste o non è attivo, non fa nulla
                    message += " Ma non ne avevi bisogno.";
                }
                break;
            
            // TODO: Aggiungere altri tipi di effetto (es. heal_hp)

            default:
                 message += " Ma il suo effetto è sconosciuto.";
                 console.warn(`Effetto non gestito per ${itemId}: tipo ${effect.type}`);
        }
    } else {
        message += " Ma non sembra avere alcun effetto.";
    }

    // Consuma oggetto solo se l'effetto è stato applicato (o se non c'era effetto specifico ma l'oggetto è usabile)
    // O forse consumare sempre se usabile? Dipende dal design.
    // Per ora, consumiamo se usabile e un effetto è stato tentato.
    if (itemInfo.effect) { // Consumiamo se c'era un effetto definito
        itemSlot.quantity -= 1;
        if (itemSlot.quantity <= 0) {
            player.inventory.splice(itemIndex, 1); // Rimuove oggetto se quantità è 0
        }
    } else {
        // Se non c'era effetto, potremmo comunque voler consumare item usabili senza effetto? O loggare? 
        // Decidiamo di non consumarlo per ora.
         console.log(`Oggetto ${itemId} usato ma senza effetto definito. Non consumato.`);
    }

    addMessage(message, effectApplied ? 'success' : 'info', true);
    renderStats();
    renderInventory();
    closeEventPopup(); // Chiude il popup dopo l'uso
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
/**
 * TheSafePlace - Roguelike Postapocalittico
 * Versione: v0.7.20 BugFix 1
 * File: js/ui.js
 * Descrizione: Gestione dell'interfaccia utente, aggiornamento DOM, popup.
 * Dipende da: dom_references.js, game_constants.js, game_data.js, game_utils.js, player.js
 */

// Dipendenze:
// - Variabili di stato globali (player, map, messages, isDay, dayMovesCounter) da game_constants.js
// - Costanti descrittive (TILE_SYMBOLS, TILE_DESC, ITEM_DATA, TIPO_ARMA_LABELS, ITEM_EFFECT_DESCRIPTIONS) da game_data.js
// - Costanti numeriche (MAP_WIDTH, MAP_HEIGHT, DAY_LENGTH_MOVES, MAX_INVENTORY_SLOTS) da game_constants.js
// - Riferimenti DOM (DOM.statHp, DOM.mapDisplay, DOM.messagesList, DOM.eventOverlay, ecc.) da dom_references.js
// - Funzioni utility (getRandomText, addMessage, getTipoArmaLabel, getItemEffectsText) da game_utils.js
// - Funzioni player (showItemActionPopup, handleInventoryClick - queste verranno definite in player.js,
//   ma la UI deve potervi fare riferimento per gli event listener)
// - Funzione di controllo munizioni (checkAmmoAvailability - definita in player.js, usata per UI arma)


/**
 * Aggiorna la visualizzazione delle statistiche del giocatore nell'interfaccia.
 */
function renderStats() {
    // Verifica che il giocatore esista e che i riferimenti DOM siano validi.
    if (!player || !DOM.statHp || !DOM.statMaxHp || !DOM.statVig || !DOM.statPot || !DOM.statAgi || !DOM.statTra || !DOM.statInf || !DOM.statPre || !DOM.statAda || !DOM.statAcq || !DOM.statFood || !DOM.statWater || !DOM.statCondition || !DOM.statWeapon || !DOM.statArmor || !DOM.posX || !DOM.posY || !DOM.tileType || !DOM.statDayTime) {
        console.warn("renderStats: Elementi DOM o dati giocatore non pronti.");
        return;
    }

    // Aggiorna i valori delle statistiche primarie e secondarie
    DOM.statHp.textContent = Math.floor(player.hp); // Arrotonda HP a interi per UI
    DOM.statMaxHp.textContent = player.maxHp;
    DOM.statVig.textContent = player.vigore;
    if (DOM.statVig.parentElement) DOM.statVig.parentElement.setAttribute('title', 'Vigore');
    
    DOM.statPot.textContent = player.potenza;
    if (DOM.statPot.parentElement) DOM.statPot.parentElement.setAttribute('title', 'Potenza');
    
    DOM.statAgi.textContent = player.agilita;
    if (DOM.statAgi.parentElement) DOM.statAgi.parentElement.setAttribute('title', 'Agilità');
    
    DOM.statTra.textContent = player.tracce;
    if (DOM.statTra.parentElement) DOM.statTra.parentElement.setAttribute('title', 'Tracce');
    
    DOM.statInf.textContent = player.influenza;
    if (DOM.statInf.parentElement) DOM.statInf.parentElement.setAttribute('title', 'Influenza');
    
    DOM.statPre.textContent = player.presagio;
    if (DOM.statPre.parentElement) DOM.statPre.parentElement.setAttribute('title', 'Presagio');
    
    DOM.statAda.textContent = player.adattamento;
    if (DOM.statAda.parentElement) DOM.statAda.parentElement.setAttribute('title', 'Adattamento');
    
    DOM.statAcq.textContent = player.acquisita || 0;
    if (DOM.statAcq.parentElement) DOM.statAcq.parentElement.setAttribute('title', 'Acquisita');

    // Aggiorna visualizzazione risorse (cibo e acqua)
    DOM.statFood.textContent = Math.floor(player.food); // Arrotonda risorse a interi per UI
    DOM.statWater.textContent = Math.floor(player.water);
    // Applica/rimuovi classe 'low-resource' per feedback visivo
    DOM.statFood.classList.toggle('low-resource', player.food <= 1 && player.food > 0);
    DOM.statWater.classList.toggle('low-resource', player.water <= 1 && player.water > 0);
    // Aggiunge classe specifica per risorsa a 0
     DOM.statFood.classList.toggle('zero-resource', player.food <= 0);
     DOM.statWater.classList.toggle('zero-resource', player.water <= 0);


    // Aggiorna visualizzazione stato condizione
    let statoText = "Normale";
    let statoClass = "status-normal";

    // Determina lo stato più grave per visualizzazione (con priorità)
    if (player.hp <= 0) {
        statoText = "Morto";
        statoClass = "status-dying"; // HP a 0
    } else if (player.hp <= player.maxHp * 0.2) { // Soglia morente (es. 20%)
        statoText = "Morente";
        statoClass = "status-dying"; // HP bassi ma > 0
    } else if (player.isPoisoned) { // Avvelenato ha alta priorità visiva
        statoText = "Avvelenato";
        statoClass = "status-poisoned";
    }
     else if (player.isInjured && player.isSick) { // Ferito E Malato è critico
        statoText = "Ferito & Infetto";
        statoClass = "status-critical";
    } else if (player.isSick) { // Solo Malato
        statoText = "Infetto";
        statoClass = "status-sick";
    } else if (player.isInjured) { // Solo Ferito
        statoText = "Ferito";
        statoClass = "status-injured";
    } else if (player.food <= 0 && player.water <= 0) { // Affamato E Assetato è critico risorse
        statoText = "Affamato & Assetato";
        statoClass = "status-critical";
    } else if (player.food <= 0) { // Solo Affamato
        statoText = "Affamato";
        statoClass = "status-hungry";
    } else if (player.water <= 0) { // Solo Assetato
        statoText = "Assetato";
        statoClass = "status-thirsty";
    }
    // Se nessuno stato negativo grave è attivo, rimane "Normale"

    DOM.statCondition.textContent = statoText;
    DOM.statCondition.className = ''; // Pulisce tutte le classi esistenti
    DOM.statCondition.classList.add(statoClass); // Applica solo la classe corretta


    // Aggiorna visualizzazione Equipaggiamento con stato munizioni
    const weaponId = player.equippedWeapon;
    if (weaponId && ITEM_DATA[weaponId]) {
        // MODIFICATO: Usa nameShort se disponibile
        let weaponName = ITEM_DATA[weaponId].nameShort || ITEM_DATA[weaponId].name;
        // Verifica munizioni se la funzione checkAmmoAvailability esiste nel modulo player
        if (typeof checkAmmoAvailability === 'function') {
            const ammoStatus = checkAmmoAvailability();
            weaponName += ammoStatus.message; // Aggiunge tipo munizione e/o stato (Senza X)
        } else {
            // Fallback se checkAmmoAvailability non è ancora disponibile
            console.warn("checkAmmoAvailability non disponibile per visualizzazione stato arma.");
        }
        DOM.statWeapon.textContent = weaponName;
    } else {
        DOM.statWeapon.textContent = "Nessuna"; // O "Mani Nude"
    }

    const armorId = player.equippedArmor;
    if (armorId && ITEM_DATA[armorId]) {
        // MODIFICATO: Usa nameShort se disponibile
        DOM.statArmor.textContent = ITEM_DATA[armorId].nameShort || ITEM_DATA[armorId].name;
    } else {
        DOM.statArmor.textContent = "Nessuna"; // O "Vestiti"
    }


    // Aggiorna informazioni di gioco (posizione, luogo, ora, giorno)
    DOM.posX.textContent = player.x;
    DOM.posY.textContent = player.y;

    // Determina e aggiorna la descrizione del luogo corrente
     if (player.x >= 0 && player.y >= 0 && player.x < MAP_WIDTH && player.y < MAP_HEIGHT && map[player.y] && map[player.y][player.x]) {
        const currentTileSymbol = map[player.y][player.x].type; // Prendi il simbolo dal tile object
        // Usa TILE_DESC da game_data.js
        DOM.tileType.textContent = TILE_DESC[currentTileSymbol] || 'Sconosciuto';
    } else {
        DOM.tileType.textContent = '--'; // Valore di default se la posizione non è valida
    }


    // Aggiorna indicatore Giorno/Notte e Ora
    if (isDay) {
        // Calcola l'orario simulato in base al progresso del giorno
        // Mappiamo dayMovesCounter (0 a DAY_LENGTH_MOVES-1) su ore 6:00 a 18:xx
        const totalHoursOfDay = 13; // Dalle 6 alle 19
        const movesPerDay = DAY_LENGTH_MOVES;
        const currentHour = Math.floor(6 + (dayMovesCounter / movesPerDay) * totalHoursOfDay);
        // Simula i minuti per maggiore precisione (ogni passo ~3-4 minuti d'ora simulata)
        const simulatedMinutesPerMove = Math.floor((totalHoursOfDay * 60) / movesPerDay);
        const currentMinute = Math.floor((dayMovesCounter % movesPerDay) * simulatedMinutesPerMove) % 60; // Minuti nell'ora corrente
        const formattedHour = currentHour.toString().padStart(2, '0');
        const formattedMinute = currentMinute.toString().padStart(2, '0');

        DOM.statDayTime.textContent = `${formattedHour}:${formattedMinute}`;
    } else {
        // Per la notte, mostriamo solo "Notte" o potremmo simulare ore notturne
        // Simula ore notturne (es. 19:00 a 5:59) in base a nightMovesCounter se non si è in rifugio?
        // Per ora, semplifichiamo e mostriamo solo "Notte"
        DOM.statDayTime.textContent = 'Notte';
        // Potresti voler aggiungere un indicatore del progresso notturno se necessario.
    }

    // Aggiungi listener per interazione con oggetti equipaggiati (Tooltip e Azioni)
    // Assicurati che questi listener vengano aggiunti solo una volta o gestiti correttamente se renderStats viene chiamata frequentemente.
    // Un modo è rimuovere e riaggiungere, oppure usare un flag.
    // Per semplicità iniziale, li aggiungiamo qui. Se renderStats è chiamata molto spesso, potremmo spostarli in una initUI una tantum.

    const setupEquippedItemInteraction = (element, itemSlotKey) => {
        if (!element) return;

        // Rimuovi listener esistenti per evitare duplicazioni se questa funzione viene chiamata più volte
        // Questo richiede che le funzioni handler siano definite in modo da poterle referenziare per la rimozione.
        // Per ora, ci affidiamo al fatto che gli ID degli oggetti cambiano e quindi i dati del tooltip/popup si aggiornano.
        // Una soluzione più robusta userebbe .removeEventListener con named functions.

        element.onmouseover = (event) => {
            const itemId = player[itemSlotKey];
            if (itemId && ITEM_DATA[itemId]) {
                // Per showItemTooltip, abbiamo bisogno di un itemSlot (con itemId e quantity) e dell'evento.
                // Poiché un oggetto equipaggiato ha sempre quantity 1 e non è uno "slot" dell'inventario,
                // creiamo un oggetto fittizio simile a uno slot.
                const mockItemSlot = { itemId: itemId, quantity: 1 }; 
                if (typeof showItemTooltip === 'function') {
                    showItemTooltip(mockItemSlot, event);
                }
            }
        };
        element.onmouseout = () => {
            if (typeof hideItemTooltip === 'function') {
                hideItemTooltip();
            }
        };
        element.onclick = () => {
            const itemId = player[itemSlotKey];
            if (itemId && ITEM_DATA[itemId]) {
                if (typeof showItemActionPopup === 'function') {
                    // Passiamo l'itemId e un'indicazione che la sorgente è 'equipped'
                    showItemActionPopup(itemId, 'equipped'); 
                }
            }
        };
    };

    // Se DOM.statWeapon e DOM.statArmor sono già stati popolati da dom_references.js
    if (DOM.statWeapon) {
        setupEquippedItemInteraction(DOM.statWeapon, 'equippedWeapon');
    }
    if (DOM.statArmor) {
        setupEquippedItemInteraction(DOM.statArmor, 'equippedArmor');
    }
}

/**
 * Aggiorna la visualizzazione del log dei messaggi.
 * Dipende dalla variabile globale `messages` e dalla costante `MAX_MESSAGES` da game_constants.js,
 * e dai riferimenti DOM `DOM.messagesList` da dom_references.js.
 */
function renderMessages() {
    // Verifica che l'elemento della lista messaggi sia disponibile
    if (!DOM.messagesList) {
        console.warn("renderMessages: Elemento 'DOM.messagesList' non trovato.");
        return;
    }
    // Verifica che l'array dei messaggi sia disponibile e sia un array
    if (!Array.isArray(messages)) {
        console.error("renderMessages: Array 'messages' non inizializzato.");
        return;
    }

    // Pulisce la lista messaggi esistente
    DOM.messagesList.innerHTML = "";

    // Aggiunge i messaggi all'interfaccia (dal più recente al più vecchio)
    // I messaggi sono aggiunti alla fine dell'array logico, quindi iteriamo dall'ultimo al primo
    // per mostrarli in ordine cronologico inverso nella UI (messaggio più recente in alto).
    // L'HTML viene costruito in modo da aggiungere i nuovi messaggi in cima (o gestito dal CSS flexbox/grid)
    // Con la struttura attuale che ricrea l'HTML ad ogni chiamata, l'ordine inverso è corretto.
    for (let i = messages.length - 1; i >= 0; i--) {
        const message = messages[i];
        const li = document.createElement("li");
        li.innerHTML = message.text; // Usiamo innerHTML perché il testo può contenere span per prefissi
        // Aggiunge la classe CSS per lo stile del messaggio
        if (message.class) li.classList.add(message.class);
        DOM.messagesList.appendChild(li);
    }

    // Opzionale: scorrere automaticamente alla fine se necessario (non sempre desiderabile per un log)
    // DOM.messagesList.scrollTop = DOM.messagesList.scrollHeight;
}

/**
 * Aggiorna la visualizzazione dell'inventario nella colonna sinistra.
 * Dipende dalla variabile globale `player`, dalla costante `MAX_INVENTORY_SLOTS` da game_constants.js,
 * dai riferimenti DOM `DOM.inventoryList` da dom_references.js, e da `ITEM_DATA` in game_data.js.
 * Richiede le funzioni `showItemActionPopup` e `hideItemTooltip` (definite in player.js e/o ui.js).
 */
function renderInventory() {
    // Verifica che gli elementi necessari e i dati del giocatore siano disponibili
    if (!player || !Array.isArray(player.inventory) || !DOM.inventoryList) {
        console.warn("renderInventory: Elemento 'DOM.inventoryList' o dati giocatore non pronti.");
        return;
    }

    // Pulisce la lista dell'inventario esistente
    DOM.inventoryList.innerHTML = "";

    // Se l'inventario è vuoto, mostra un messaggio apposito
    if (player.inventory.length === 0) {
        const emptyItem = document.createElement("li");
        emptyItem.textContent = "Inventario Vuoto";
        emptyItem.classList.add("empty-inventory"); // Classe CSS per stile specifico
        DOM.inventoryList.appendChild(emptyItem);
        // Assicurati che il tooltip non sia mostrato se l'inventario è vuoto
        if (typeof hideItemTooltip === 'function') {
             hideItemTooltip();
        }
        return;
    }

    // Ordina l'inventario per categoria e nome per una migliore visualizzazione (opzionale ma utile)
    const sortedInventory = [...player.inventory].sort((a, b) => {
        const itemA = ITEM_DATA[a.itemId];
        const itemB = ITEM_DATA[b.itemId];

        // Gestione di oggetti non definiti in ITEM_DATA (dovrebbe essere rara se addItemToInventory controlla)
        if (!itemA && !itemB) return 0;
        if (!itemA) return 1; // Metti quelli non definiti alla fine
        if (!itemB) return -1;

        // Ordinamento per categoria, poi per nome
        const categoryA = itemA.category || "Unknown"; // Fallback 'Unknown' se categoria non definita
        const categoryB = itemB.category || "Unknown";

        if (categoryA !== categoryB) {
            return categoryA.localeCompare(categoryB); // Ordina per categoria (alfabetico)
        } else {
            const nameA = itemA.name || a.itemId;
            const nameB = itemB.name || b.itemId;
            return nameA.localeCompare(nameB); // Ordina per nome (alfabetico) all'interno della categoria
        }
    });

    // Aggiunge gli elementi dell'inventario alla lista HTML
    sortedInventory.forEach((slot, index) => {
        const itemData = ITEM_DATA[slot.itemId];
        if (itemData) {
            // MODIFICATO: Usa itemData.nameShort se esiste, altrimenti itemData.name
            const itemName = itemData.nameShort || itemData.name;
            const itemText = `${itemName} (x${slot.quantity})`;
            const li = document.createElement("li");
            li.textContent = itemText;
            li.dataset.itemId = slot.itemId; // Aggiunge data attribute per click handling
            li.dataset.itemIndex = index;    // Aggiunge data attribute per indice (opzionale)

            // Aggiunge classe CSS in base al TIPO dell'oggetto per styling
            if (itemData.type) { // Controlla se itemData.type esiste
                li.classList.add(`item-type-${itemData.type.toLowerCase()}`); // Usa itemData.type e aggiungi prefisso "item-type-"
            } else {
                li.classList.add("item-unknown"); // Fallback se itemData.type non è definito
            }

            // Aggiunge event listener per mostrare il tooltip (mouseover/pointerenter)
            // Usiamo pointerenter/pointerleave per supportare meglio i dispositivi touch/penna
            if (typeof showItemTooltip === 'function' && typeof hideItemTooltip === 'function') {
                li.addEventListener('pointerenter', (e) => showItemTooltip(slot, e)); // Passa slot (con quantity) e l'evento
                li.addEventListener('pointerleave', hideItemTooltip);
                 // Aggiungi listener per touchmove per aggiornare la posizione del tooltip su touch devices
                 // (Questo può essere gestito meglio nella funzione showItemTooltip stessa)
            } else {
                 console.warn("Funzioni showItemTooltip o hideItemTooltip non disponibili.");
            }


            // Aggiunge event listener per il click sull'oggetto (per mostrare le azioni)
            // Questa funzione (showItemActionPopup) deve essere definita nel modulo player.js
            // e deve essere accessibile globalmente o tramite un'altra funzione di coordinamento.
            if (typeof handleInventoryClick === 'function') {
                // Delega il click handler al container come prima
                 // NOTE: Il listener handleInventoryClick è aggiunto una volta nel setupInputListeners
                 // sul container inventoryList, non sui singoli li qui.
                 // Questo è l'approccio preferito per performance. Quindi non aggiungiamo listeners qui.
            } else {
                console.warn("Funzione handleInventoryClick non disponibile. Interazione inventario limitata.");
                // Aggiungi un listener diretto come fallback per debug se il delegation non funziona
                 // li.addEventListener('click', () => { console.warn(`handleInventoryClick non disponibile, click su ${slot.itemId}`); /* showItemActionPopup(slot.itemId); */ }); // Commentato showItemActionPopup finché non è certo che funzioni
            }


            // Aggiunge l'elemento lista alla lista dell'inventario nel DOM
            DOM.inventoryList.appendChild(li);
        }
    });

    // Aggiorna il numero di slot occupati vs totali (potrebbe essere aggiunto alla UI)
    // const inventoryCount = document.getElementById('inventory-count');
    // if (inventoryCount) inventoryCount.textContent = `${player.inventory.length}/${MAX_INVENTORY_SLOTS}`;
}


/**
 * Aggiorna la visualizzazione della legenda della mappa.
 * Dipende dai riferimenti DOM `DOM.legendList` da dom_references.js,
 * e da `TILE_SYMBOLS`, `TILE_DESC` in game_data.js.
 */
function renderLegend() {
    // Verifica che l'elemento della legenda sia disponibile
    if (!DOM.legendList) {
        console.warn("renderLegend: Elemento 'DOM.legendList' non trovato.");
        return;
    }
     // Verifica che i dati dei simboli e delle descrizioni siano disponibili
     if (!TILE_SYMBOLS || !TILE_DESC) {
         console.error("renderLegend: Dati TILE_SYMBOLS o TILE_DESC non disponibili in game_data.js.");
         DOM.legendList.innerHTML = '<li>Errore dati legenda</li>';
         return;
     }

    // Pulisce la legenda esistente
    DOM.legendList.innerHTML = "";

    // Definisce gli elementi della legenda da mostrare e il loro ordine
    const legendItems = [
        { s: TILE_SYMBOLS.PLAYER, d: TILE_DESC['@'], key: 'PLAYER' },
        { s: TILE_SYMBOLS.PLAINS, d: TILE_DESC['.'], key: 'PLAINS' },
        { s: TILE_SYMBOLS.FOREST, d: TILE_DESC['F'], key: 'FOREST' },
        { s: TILE_SYMBOLS.MOUNTAIN, d: TILE_DESC['M'], key: 'MOUNTAIN' },
        { s: TILE_SYMBOLS.RIVER, d: TILE_DESC['~'], key: 'RIVER' },
        { s: TILE_SYMBOLS.VILLAGE, d: TILE_DESC['V'], key: 'VILLAGE' },
        { s: TILE_SYMBOLS.CITY, d: TILE_DESC['C'], key: 'CITY' },
        { s: TILE_SYMBOLS.REST_STOP, d: TILE_DESC['R'], key: 'REST_STOP' },
        { s: TILE_SYMBOLS.START, d: TILE_DESC['S'], key: 'START' },
        { s: TILE_SYMBOLS.END, d: TILE_DESC['E'], key: 'END' }
    ];

    // Crea un elemento <li> per ogni voce della legenda
    legendItems.forEach(item => {
        const li = document.createElement("li");
        const symbolSpan = document.createElement("span");

        symbolSpan.textContent = item.s;
        // Aggiunge la classe CSS basata sulla chiave del tile per lo styling
        symbolSpan.classList.add("legend-symbol");
        symbolSpan.classList.add(`tile-${item.key.toLowerCase().replace(/_/g, '-')}`);

        // Aggiunge classi speciali per il giocatore e la destinazione finale per stile/animazioni
        if (item.key === 'PLAYER') symbolSpan.classList.add('player-marker');
        if (item.key === 'END') symbolSpan.classList.add('tile-end');


        li.appendChild(symbolSpan);
        li.appendChild(document.createTextNode(` = ${item.d}`)); // Aggiunge la descrizione

        DOM.legendList.appendChild(li);
    });
}

/**
 * Renderizza la porzione visibile della mappa di gioco centrata sul giocatore.
 * Calcola dinamicamente la viewport in base alle dimensioni del contenitore se possibile.
 * Dipende dalla variabile globale `player`, `map`, `isDay` da game_constants.js,
 * dalle costanti `MAP_WIDTH`, `MAP_HEIGHT`, `TILE_SYMBOLS` da game_constants.js/game_data.js,
 * e dal riferimento DOM `DOM.mapDisplay` da dom_references.js.
 */
function renderMap() {
    // Verifica che l'elemento della mappa e i dati essenziali siano disponibili
    const display = DOM.mapDisplay;
    if (!display) {
        console.warn("renderMap: Elemento 'DOM.mapDisplay' non trovato.");
        return;
    }
     if (!player || typeof player.x !== 'number' || typeof player.y !== 'number' || !map || !Array.isArray(map) || map.length === 0 || map[0]?.length === 0 || !TILE_SYMBOLS) {
         console.warn("renderMap: Dati giocatore o mappa non pronti o non validi.");
         display.textContent = "Errore nel rendering della mappa.";
         return;
     }

     // Verifica che le coordinate del giocatore siano all'interno dei limiti della mappa
     player.x = Math.max(0, Math.min(MAP_WIDTH - 1, player.x));
     player.y = Math.max(0, Math.min(MAP_HEIGHT - 1, player.y));


    let mapHTML = ''; // Usa innerHTML per applicare classi CSS agli span

    // --- Calcolo Dinamico Viewport ---
    // Tenta di stimare quanti caratteri possono stare nel mapDisplay
    // Usa valori di fallback sicuri se il calcolo fallisce
    let viewWidth = 80; // Default
    let viewHeight = 20; // Default
    try {
        // Ottieni lo stile computato dell'elemento per la dimensione del font e l'interlinea
        const styles = window.getComputedStyle(display);
        const font = styles.font; // Esempio: "16px Courier New"
        const lineHeight = parseFloat(styles.lineHeight) || (parseFloat(styles.fontSize) * 1.2); // Usa lineHeight o stima dal fontSize

        // Misura approssimativamente la larghezza di un carattere (monospaced)
        // Questo richiede un helper esterno o un elemento temporaneo
        // Per ora, useremo una stima o una funzione placeholder se non ne abbiamo una robusta.
        // Assumiamo che 'measureCharacterWidth' sia disponibile, magari definita altrove (es. in game_utils o qui).
        // Se non lo è, usiamo un valore stimato (es. 9px per 16px font).
        let charWidth = 9; // Stima fallback
        if (typeof measureCharacterWidth === 'function') {
             charWidth = measureCharacterWidth(font); // Usa la funzione se disponibile
        } else {
             // console.warn("measureCharacterWidth non disponibile, usando stima fissa."); // Log di debug rimosso
        }


        const containerWidth = display.offsetWidth; // Larghezza visibile dell'elemento
        const containerHeight = display.offsetHeight; // Altezza visibile dell'elemento

        if (charWidth > 0 && lineHeight > 0) {
             // Calcola quanti caratteri ci stanno, con un piccolo margine per evitare wrapping indesiderato
             // Lasciamo 1 carattere di margine per riga per sicurezza
            viewWidth = Math.max(10, Math.floor(containerWidth / charWidth) - 1);
            viewHeight = Math.max(5, Math.floor(containerHeight / lineHeight));
            // console.log(`Viewport calcolata: ${viewWidth}x${viewHeight} (Container ${containerWidth}x${containerHeight}, Char ${charWidth}, Line ${lineHeight})`); // Log di debug rimosso
        } else {
            // console.warn("Impossibile calcolare dimensioni caratteri, uso fallback viewport."); // Log di debug rimosso
        }
    } catch (e) {
        console.error("Errore durante il calcolo dinamico della viewport:", e);
        // Usa valori di fallback in caso di errore
        viewWidth = 80;
        viewHeight = 20;
    }
    // --- Fine Calcolo Dinamico Viewport ---

    // Calcola le coordinate di inizio della visuale (viewport)
    // Centra la visuale sul giocatore, ma evita di andare fuori dai bordi della mappa fisica.
    let startX = player.x - Math.floor(viewWidth / 2);
    let startY = player.y - Math.floor(viewHeight / 2);

    // Regola startX e startY per rimanere all'interno dei limiti della mappa
    if (startX < 0) startX = 0;
    if (startY < 0) startY = 0;
    if (startX > MAP_WIDTH - viewWidth) startX = MAP_WIDTH - viewWidth;
    if (startY > MAP_HEIGHT - viewHeight) startY = MAP_HEIGHT - viewHeight;

     // Assicurati che le coordinate di inizio non siano negative dopo le correzioni
     startX = Math.max(0, startX);
     startY = Math.max(0, startY);


    // Calcola le coordinate di fine della visuale (non inclusive)
    let endX = startX + viewWidth;
    let endY = startY + viewHeight;

    // Assicurati che le coordinate di fine non superino i limiti della mappa
     endX = Math.min(MAP_WIDTH, endX);
     endY = Math.min(MAP_HEIGHT, endY);


    const mapFragment = document.createDocumentFragment();

    // Cicla sulle righe della porzione di mappa visibile
    for (let y = startY; y < endY; y++) {
        // <<< CORRETTO: Crea un fragment PER OGNI RIGA >>>
        const currentRowFragment = document.createDocumentFragment();

        // Cicla sulle colonne della porzione di mappa visibile
        for (let x = startX; x < endX; x++) {
            let tileClass = '';
            let tileChar = '?'; // Default a '?' se la casella non è valida
            let isPlayerCell = (x === player.x && y === player.y);

            // Verifica se le coordinate sono valide nella mappa
            if (map[y] && map[y][x]) {
                const tile = map[y][x];
                // const originalTileType = tile.type; // Rimosso

                // Se è la posizione del giocatore, usa il simbolo del giocatore
                if (isPlayerCell) {
                    tileChar = TILE_SYMBOLS.PLAYER;
                    tileClass = 'player-marker'; // Classe CSS per stile/animazione giocatore
                } else {
                    // Altrimenti, usa il simbolo della casella letto dalla mappa
                    tileChar = tile.type; // Usa tile.type direttamente

                    // Assegna classi CSS in base al tipo di tile
                    // Cerca la chiave nel TILE_SYMBOLS che corrisponde al simbolo del tile
                    const tileKey = Object.keys(TILE_SYMBOLS).find(key => TILE_SYMBOLS[key] === tileChar);
                    if (tileKey) {
                        // Converte la chiave in un formato CSS-friendly (minuscolo, underscore a trattino)
                        tileClass = `tile-${tileKey.toLowerCase().replace(/_/g, '-')}`;
                    } else {
                         // Classe di fallback per simboli sconosciuti
                        tileClass = 'tile-unknown';
                    }

                    // Aggiunge la classe 'visited' se la casella è stata visitata
                    if (tile.visited) {
                        tileClass += ' visited';
                    }
                    // Aggiunge classe 'tile-end' per stile specifico
                    if (tileChar === TILE_SYMBOLS.END) { // Usa tileChar
                         tileClass += ' tile-end';
                    }
                }
            }

            // Aggiunge lo span per la cella corrente con il simbolo e la classe corretti
            const span = document.createElement('span');
            span.className = tileClass;
            span.textContent = tileChar;

            // Aggiunge data attribute per coordinate (utile per tooltip)
            span.dataset.coordX = x;
            span.dataset.coordY = y;

            // Aggiungi listener per tooltip mappa (NUOVO)
            if (typeof showMapTooltip === 'function' && typeof hideMapTooltip === 'function') {
                // Passa le informazioni necessarie a showMapTooltip
                span.addEventListener('pointerenter', (e) => showMapTooltip(x, y, tileChar, e));
                span.addEventListener('pointerleave', hideMapTooltip);
            }

            // Aggiunge lo span alla stringa HTML
            // Modifica: invece di costruire mapHTML come stringa, appendiamo i nodi span
            // mapHTML += `<span class="${tileClass}" data-coord-x="${x}" data-coord-y="${y}">${tileChar}</span>`;
            currentRowFragment.appendChild(span); // Aggiungi allo span della riga
        } // End inner loop (x)

        // Append the completed row fragment to the main map fragment
        mapFragment.appendChild(currentRowFragment);

        // <<< CORREZIONE: Aggiungi il newline DOPO aver aggiunto la riga >>>
        // Aggiungi un nodo di testo newline per separare le righe nel <pre>
        // (Non strettamente necessario per l'ultima riga, ma non crea problemi)
        mapFragment.appendChild(document.createTextNode('\n'));

    } // End outer loop (y)

    // Aggiorna l'HTML del display della mappa usando il fragment
    display.innerHTML = ''; // Pulisce il contenuto precedente
    display.appendChild(mapFragment);

    // Opzionale: Imposta lo scroll per mantenere il giocatore centrato se l'overflow fosse abilitato.
}

// --- Implementazione Tooltip Mappa (NUOVO) ---

/**
 * Mostra un tooltip informativo per una cella della mappa.
 * @param {number} x - Coordinata X della cella.
 * @param {number} y - Coordinata Y della cella.
 * @param {string} tileChar - Il simbolo della cella (es. '.', 'F').
 * @param {Event} event - L'evento pointerenter.
 */
function showMapTooltip(x, y, tileChar, event) {
    // Verifica che gli elementi del tooltip mappa siano pronti
    if (!DOM.mapTooltip || !DOM.tooltipMapCoords || !DOM.tooltipMapType || !DOM.tooltipMapEventChance) {
        // console.warn("showMapTooltip: Elementi tooltip mappa non pronti.");
        hideMapTooltip(); // Assicura che sia nascosto
        return;
    }
    // Verifica che i dati del tile siano validi
    if (!TILE_DESC || !TILE_SYMBOLS || !EVENT_CHANCE) {
        console.error("showMapTooltip: Dati tile (TILE_DESC, TILE_SYMBOLS, EVENT_CHANCE) non disponibili.");
        hideMapTooltip();
        return;
    }

    // Trova il nome del tile e la chiave (es. 'PLAINS')
    const tileTypeName = TILE_DESC[tileChar] || 'Sconosciuto';
    const tileKey = Object.keys(TILE_SYMBOLS).find(key => TILE_SYMBOLS[key] === tileChar);

    // Trova la probabilità di evento specifico del tile
    let eventChancePercent = 0;
    if (tileKey && EVENT_CHANCE[tileKey] !== undefined) {
        eventChancePercent = Math.round(EVENT_CHANCE[tileKey] * 100);
    }

    // Popola il tooltip
    DOM.tooltipMapCoords.textContent = `Coordinate: ${x}, ${y}`;
    DOM.tooltipMapType.textContent = `Tipo: ${tileTypeName}`;
    DOM.tooltipMapEventChance.textContent = `Prob. Evento (Locale): ${eventChancePercent}%`;

    // Posizionamento (simile a showItemTooltip)
    const displayRect = DOM.gameContainer.getBoundingClientRect();
    const targetRect = event.target.getBoundingClientRect(); // L'elemento span della cella

    let tooltipX = targetRect.right + 10; // A destra della cella
    let tooltipY = targetRect.top;

    // Adattamenti per non uscire dallo schermo
    if (tooltipX + DOM.mapTooltip.offsetWidth > displayRect.right) {
        tooltipX = targetRect.left - DOM.mapTooltip.offsetWidth - 10; // A sinistra
    }
    if (tooltipY + DOM.mapTooltip.offsetHeight > displayRect.bottom) {
        tooltipY = displayRect.bottom - DOM.mapTooltip.offsetHeight - 5;
    }
    if (tooltipX < displayRect.left + 5) tooltipX = displayRect.left + 5;
    if (tooltipY < displayRect.top + 5) tooltipY = displayRect.top + 5;

    DOM.mapTooltip.style.left = `${tooltipX}px`;
    DOM.mapTooltip.style.top = `${tooltipY}px`;
    DOM.mapTooltip.style.position = 'fixed';
    DOM.mapTooltip.style.zIndex = 100;

    // Rende visibile il tooltip
    DOM.mapTooltip.classList.remove('hidden');
    DOM.mapTooltip.style.visibility = 'visible';
}

/**
 * Nasconde il tooltip della mappa.
 */
function hideMapTooltip() {
    if (!DOM.mapTooltip) return;
    DOM.mapTooltip.classList.add('hidden');
    DOM.mapTooltip.style.visibility = 'hidden';
}

// --- Fine Implementazione Tooltip Mappa ---

// ----- Implementazione Tooltip Inventario -----
// Spostiamo qui la logica di visualizzazione del tooltip, che dipende da DOM e Dati/Utils.

/**
 * Mostra un tooltip informativo quando il mouse/pointer passa sopra un oggetto dell'inventario.
 * Dipende da: dom_references.js (DOM.itemTooltip, DOM.tooltipItemName, DOM.tooltipItemDesc),
 * game_data.js (ITEM_DATA), game_utils.js (getItemEffectsText).
 * @param {object} itemSlot - L'oggetto slot dall'inventario del giocatore { itemId: string, quantity: number }.
 * @param {Event} event - L'evento di hover/pointerenter.
 */
function showItemTooltip(itemSlot, event) {
    // Verifica che gli elementi del tooltip e i dati dell'oggetto siano disponibili
    if (gamePaused || !DOM.itemTooltip || !DOM.tooltipItemName || !DOM.tooltipItemDesc || !itemSlot || !itemSlot.itemId || !ITEM_DATA[itemSlot.itemId]) {
        // console.warn("showItemTooltip: Elementi tooltip, dati oggetto o gioco in pausa."); // Log di debug rimosso
        hideItemTooltip(); // Assicura che sia nascosto se i dati non sono validi
        return;
    }

    const itemDetails = ITEM_DATA[itemSlot.itemId];

    // Popola il contenuto del tooltip
    DOM.tooltipItemName.textContent = itemDetails.name + (itemSlot.quantity > 1 ? ` (x${itemSlot.quantity})` : '');
    DOM.tooltipItemDesc.textContent = itemDetails.description || "Nessuna descrizione disponibile.";

    let statsDetailsHTML = '';
    if (typeof getItemDetailsHTML === 'function') {
        statsDetailsHTML = getItemDetailsHTML(itemDetails);
    }
    // RIMOSSO console.log di debug
    const tooltipStatsContainer = DOM.itemTooltip.querySelector('.item-stats-container');
    if (tooltipStatsContainer) {
        tooltipStatsContainer.innerHTML = statsDetailsHTML;
    }

    // Posizionamento del tooltip
    const displayRect = DOM.gameContainer.getBoundingClientRect(); // Prendi le dimensioni del contenitore principale (game-container)
    const targetRect = event.target.closest('li').getBoundingClientRect(); // Bounding rect dell'elemento lista cliccato/hoverato

    let x = targetRect.right + 15; // Posiziona a destra dell'elemento + margine
    let y = targetRect.top; // Allinea in alto con l'elemento

    // Controlla se il tooltip esce dallo schermo a destra o in basso
    // Se esce a destra, posiziona a sinistra dell'elemento
    if (x + DOM.itemTooltip.offsetWidth > displayRect.right) {
        x = targetRect.left - DOM.itemTooltip.offsetWidth - 15; // Posiziona a sinistra - margine
    }
     // Se esce in basso, sposta in alto
     if (y + DOM.itemTooltip.offsetHeight > displayRect.bottom) {
        y = displayRect.bottom - DOM.itemTooltip.offsetHeight - 10; // Allinea in basso con il container - margine
     }

     // Assicurati che non vada fuori dal bordo sinistro o superiore del container principale
     if (x < displayRect.left + 10) x = displayRect.left + 10;
     if (y < displayRect.top + 10) y = displayRect.top + 10;


    DOM.itemTooltip.style.left = `${x}px`;
    DOM.itemTooltip.style.top = `${y}px`;
    DOM.itemTooltip.style.position = 'fixed'; // Usa fixed per posizionarlo rispetto al viewport (o absolute e gestisci scroll)
    DOM.itemTooltip.style.zIndex = 100; // Assicura che sia sopra gli altri elementi

    // Rende visibile il tooltip
    DOM.itemTooltip.classList.remove('hidden');
    DOM.itemTooltip.style.visibility = 'visible'; // Usa visibility per transizioni CSS se definite

    // Impedisce che il tooltip sparisca immediatamente su touch devices se il dito si sposta leggermente.
    // Questo può richiedere logica più complessa legata agli eventi touch in setupInputListeners.
    // Per ora, pointer-events: none sul tooltip stesso aiuta a non interferire con il click sull'elemento sottostante.
}


/**
 * Nasconde il tooltip degli oggetti.
 * Dipende da: dom_references.js (DOM.itemTooltip).
 */
function hideItemTooltip() {
    // Verifica che l'elemento tooltip sia disponibile
    if (!DOM.itemTooltip) {
        console.warn("hideItemTooltip: Elemento 'DOM.itemTooltip' non trovato.");
        return;
    }
    // Nasconde il tooltip
    DOM.itemTooltip.classList.add('hidden');
     DOM.itemTooltip.style.visibility = 'hidden';
}


// --- Funzioni per disabilitare/abilitare controlli ---
// Queste funzioni sono semplici UI helper, spostate qui.
// Dipendono da dom_references.js (moveButtons) e game_constants.js (gamePaused).

/**
 * Disabilita i controlli di movimento (UI).
 * Imposta il flag gamePaused a true.
 * Dipende da dom_references.js (moveButtons) e game_constants.js (gamePaused).
 */
function disableControls() {
    // console.log("disableControls: Controlli disabilitati."); // RIMOSSO LOG
    gamePaused = true; 
    if (!DOM.moveButtons) {
         console.warn("disableControls: moveButtons non trovato.");
         return;
    }
    // Disabilita ogni pulsante e aggiunge una classe per styling
    DOM.moveButtons.forEach(button => {
        button.disabled = true;
        button.classList.add('disabled');
    });
    // console.log("Controlli disabilitati."); // Log di debug rimosso
}

/**
 * Abilita i controlli di movimento (UI).
 * Resetta il flag gamePaused a false.
 * Dipende da dom_references.js (moveButtons) e game_constants.js (gamePaused).
 */
function enableControls() {
    // console.log("enableControls: Controlli abilitati."); // RIMOSSO LOG

    gamePaused = false; 
    if (!DOM.moveButtons) {
         console.warn("enableControls: moveButtons non trovato.");
         return;
    }
    // Riabilita ogni pulsante e rimuove la classe disabled
    DOM.moveButtons.forEach(button => {
        button.disabled = false;
        button.classList.remove('disabled');
    });
    // console.log("Controlli abilitati."); // Log di debug rimosso
}


// --- Implementazione popup evento (UI) ---
// Spostiamo qui la logica di visualizzazione del popup, che dipende da DOM, Dati, Utils, Constants.
// La logica di *gestione* delle scelte e degli esiti (handleEventChoice, buildAndShowComplexEvent)
// rimarrà nel modulo events.js. Questo modulo UI solo si occupa di MOSTRARE il popup.

/**
 * Mostra un popup di evento con titolo, descrizione e scelte.
 * Imposta lo stato di pausa e visibilità overlay.
 * Dipende da: dom_references.js (DOM.eventOverlay, DOM.eventPopup, DOM.eventTitle, DOM.eventContent, DOM.eventChoicesContainer, DOM.continueButton, DOM.gameContainer),
 * game_constants.js (gamePaused, eventScreenActive, currentEventChoices, currentEventContext),
 * game_utils.js (getSkillCheckLikelihood), player.js (showItemActionPopup, handleInventoryClick).
 * Richiede handleEventChoice (events.js) e closeEventPopup (definita qui sotto).
 * @param {object} eventData - L'oggetto evento da visualizzare.
 */
function showEventPopup(eventData) {
    // console.log('showEventPopup: Chiamata ricevuta. Verifico DOM.eventOverlay:', DOM.eventOverlay); // RIMOSSO

    // Verifica che gli elementi del popup e il gameContainer siano disponibili
    if (!DOM.eventOverlay || !DOM.eventPopup || !DOM.eventTitle || !DOM.eventContent || !DOM.eventChoicesContainer || !DOM.continueButton || !DOM.gameContainer) {
        console.error("showEventPopup: Elementi del popup evento o gameContainer non trovati nel DOM.");
        return;
    }
    if (!eventData) {
        console.error("showEventPopup chiamata senza eventData valido.");
        // Assicura che il popup sia nascosto
        closeEventPopup(); // Chiama la funzione di chiusura
        return;
    }

    // Disabilita i controlli di movimento sulla UI e imposta la pausa logica
    disableControls(); // Imposta gamePaused = true

    // Imposta il flag visivo che un popup è attivo
    eventScreenActive = true;

    // Pulisce le scelte precedenti e il bottone continua
    DOM.eventChoicesContainer.innerHTML = '';
    DOM.continueButton.style.display = 'none';

    // Imposta titolo e descrizione del popup
    DOM.eventTitle.textContent = eventData.title || "Evento";
    // Sostituisci \n con <br> nella descrizione prima di assegnarla a innerHTML
    const descriptionText = eventData.description || "Qualcosa è successo...";
    DOM.eventContent.innerHTML = descriptionText.replace(/\n/g, '<br>');

    // Memorizza il contesto dell'evento corrente (per riferimento in handleEventChoice e gestione input)
    currentEventContext = eventData; // Salva l'intero oggetto evento
    // console.log("DEBUG showEventPopup: currentEventContext impostato:", JSON.stringify(currentEventContext, null, 2)); // NUOVO LOG
    // console.log("DEBUG showEventPopup: currentEventContext.isActionPopup:", currentEventContext ? currentEventContext.isActionPopup : 'contesto nullo o isActionPopup non def'); // NUOVO LOG

    // Gestisce la visualizzazione delle scelte o del bottone "Continua"
    const choices = eventData.choices || [];
    currentEventChoices = choices; // Salva le scelte per la gestione input da tastiera

    // Controlla se è un popup di "Risultato" o un evento con "Scelte"
    if (eventData.isOutcome) {
        // Questo è un popup di risultato (mostra solo testo e bottone Continua)
        // La descrizione e il titolo sono già stati impostati sopra.
        DOM.continueButton.style.display = 'inline-block'; // Mostra il bottone continua
        // L'event listener per il bottone continua verrà aggiunto in setupInputListeners (per delega)
        // o direttamente qui (per semplicità per ora).
         DOM.continueButton.onclick = () => closeEventPopup(); // Listener diretto per il bottone Continua

    } else {
        // Questo è un popup di evento con scelte (mostra i bottoni per le scelte)
        if (choices.length > 0) {
            choices.forEach((choice, index) => {
                const button = document.createElement('button');
                let buttonText = `${index + 1}. ${choice.text}`; // Prefissa con numero per input da tastiera

                // Se la scelta ha uno skillCheck, aggiungi l'indicatore di probabilità
                if (choice.skillCheck && typeof getSkillCheckLikelihood === 'function') {
                    const likelihood = getSkillCheckLikelihood(choice.skillCheck.stat, choice.skillCheck.difficulty);
                    buttonText += ` (${likelihood})`; // Aggiunge es. " (Favorevole)"
                }

                button.textContent = buttonText;
                // Usa data attribute per memorizzare l'indice della scelta (per delegation click e keypress)
                button.dataset.choiceIndex = index;

                // Aggiunge una classe speciale per le azioni di ricerca (indica costo tempo)
                if (choice.isSearchAction) {
                     button.classList.add('search-action');
                }

                // Aggiunge una classe CSS specifica se definita nella scelta (es. 'danger-action')
                if (choice.cssClass) {
                    button.classList.add(choice.cssClass);
                }


                // NON aggiungere listener diretti qui. La gestione click avviene tramite delegation
                // sul container eventChoicesContainer, gestito in events.js (handleChoiceContainerClick).
                // Il bottone ha solo bisogno del data-choice-index.

                DOM.eventChoicesContainer.appendChild(button);
            });

            // Il listener di delegation handleChoiceContainerClick deve essere aggiunto una volta
            // nel setupInputListeners in game_core.js, puntando a una funzione in events.js.

        } else {
             // Evento senza scelte (solo testo), comportamento come un popup di esito
             DOM.continueButton.style.display = 'inline-block';
             DOM.continueButton.onclick = () => closeEventPopup(); // Listener diretto per il bottone Continua
        }
    }


    // Mostra l'overlay e oscura/sfoca lo sfondo usando le classi CSS
    DOM.gameContainer.classList.add('overlay-active'); // Classe per oscurare il container principale
    DOM.eventOverlay.classList.add('visible'); // Rende visibile l'overlay con la transizione CSS

    // --- GESTIONE FOCUS INIZIALE ---
    try {
        const firstChoiceButton = DOM.eventChoicesContainer.querySelector('button');
        if (firstChoiceButton) {
            firstChoiceButton.focus();
        } else if (DOM.continueButton.style.display !== 'none') {
            DOM.continueButton.focus();
        } else {
             // Se non ci sono bottoni, prova a mettere focus sul popup stesso
             // Assicurati che eventPopup abbia tabindex="-1" o tabindex="0" in HTML o CSS per essere focusable
             // DOM.eventPopup.setAttribute('tabindex', '-1'); // Aggiungi tabindex se necessario
             DOM.eventPopup.focus(); 
        }
    } catch (e) { console.warn("Errore impostazione focus su popup:", e); }
}


/**
 * Chiude il popup dell'evento.
 * Rimuove lo stato di pausa e riabilita i controlli UI.
 * Dipende da: dom_references.js (DOM.eventOverlay, DOM.gameContainer),
 * game_constants.js (gamePaused, eventScreenActive, currentEventContext, currentEventChoices, NIGHT_FOOD_COST, NIGHT_WATER_COST, player),
 * ui.js (enableControls, renderMap, renderStats),
 * map.js (transitionToDay), events.js (performRestStopNightLootCheck, handleEventKeyPress),
 * game_utils.js (addMessage).
 */
function closeEventPopup() {
    // Verifica che gli elementi siano disponibili prima di tentare di nasconderli
    if (!DOM.eventOverlay || !DOM.gameContainer) {
        console.warn("closeEventPopup: Elementi overlay o gameContainer non trovati.");
        // Cerca di resettare i flag comunque
         gamePaused = false;
         eventScreenActive = false;
         // Salva il contesto prima di resettarlo per il controllo sotto
         const closingEventContextOnError = currentEventContext;
         currentEventContext = null;
         currentEventChoices = null;
         // Rimuovi il listener keypress direttamente qui se non c'è modo altrimenti
         // Assicurati che handleEventKeyPress sia definito (dovrebbe essere in events.js)
         if (typeof handleEventKeyPress === 'function') {
             document.removeEventListener('keydown', handleEventKeyPress);
         } else {
             console.warn("closeEventPopup: handleEventKeyPress non trovato per rimuovere listener.")
         }
         // Prova a gestire il caso speciale anche in caso di errore DOM
         if (closingEventContextOnError && closingEventContextOnError.context?.eventType === 'REST_STOP_NIGHT_LOOT_CHECK') {
            // Esegui comunque il consumo risorse e la transizione (senza loot check, dato che altre funzioni potrebbero mancare)
            if (typeof player !== 'undefined') {
                 player.food = Math.max(0, player.food - NIGHT_FOOD_COST);
                 player.water = Math.max(0, player.water - NIGHT_WATER_COST);
                 if (typeof addMessage === 'function') {
                      addMessage(`Hai consumato ${NIGHT_FOOD_COST} cibo e ${NIGHT_WATER_COST} acqua durante il riposo.`, 'info');
                 } else { console.error("closeEventPopup (Error Path): addMessage non disponibile."); }
            } else { console.error("closeEventPopup (Error Path): Oggetto player non disponibile."); }
            if (typeof transitionToDay === 'function') {
                transitionToDay();
            } else {
                 console.error("closeEventPopup (Error Path): transitionToDay non disponibile!");
                 if(typeof enableControls === 'function') enableControls();
                 // Non tentare renderMap/renderStats qui se il DOM è fallito
            }
         } else {
              // Fallback generico se non è il caso speciale
              if(typeof enableControls === 'function') enableControls();
         }
         return;
    }

    // Nasconde l'overlay e ripristina lo sfondo
    DOM.gameContainer.classList.remove('overlay-active');
    DOM.eventOverlay.classList.remove('visible'); // Rimuove la classe visible per la transizione CSS

    // 1. Recupera il contesto dell'evento che sta per essere chiuso
    const closingEventContext = currentEventContext;

    // 2. Resetta i flag globali
    eventScreenActive = false;
    currentEventContext = null;
    currentEventChoices = null;

    // Rimuove l'event listener per i tasti specifici degli eventi.
    if (typeof handleEventKeyPress === 'function') {
        document.removeEventListener('keydown', handleEventKeyPress);
    } else {
        console.warn("closeEventPopup: handleEventKeyPress non trovato per rimuovere listener.")
    }

    // 3. Aggiungi un blocco if che controlla il tipo di evento
    if (closingEventContext && closingEventContext.context?.eventType === 'REST_STOP_NIGHT_LOOT_CHECK') {
        // 4. Dentro questo if (caso rifugio notturno 'R'):
        //    * Chiama performRestStopNightLootCheck()
        if (typeof performRestStopNightLootCheck === 'function') {
            performRestStopNightLootCheck();
        } else {
            console.warn("closeEventPopup: Funzione performRestStopNightLootCheck non trovata!");
            if(typeof addMessage === 'function') addMessage("(Errore: controllo loot notturno non eseguito)", "warning");
        }

        //    * Consuma le risorse notturne
        if (typeof player !== 'undefined') { // Verifica esistenza player
            player.food = Math.max(0, player.food - NIGHT_FOOD_COST);
            player.water = Math.max(0, player.water - NIGHT_WATER_COST);
            //    * Aggiungi un messaggio al log
            if (typeof addMessage === 'function') {
                addMessage(`Hai consumato ${NIGHT_FOOD_COST} cibo e ${NIGHT_WATER_COST} acqua durante il riposo.`, 'info');
            } else {
                 console.error("closeEventPopup: addMessage non disponibile.");
            }
        } else {
             console.error("closeEventPopup: Oggetto player non disponibile per consumo risorse notturne.");
        }

        //    * Chiama transitionToDay()
        if (typeof transitionToDay === 'function') {
            transitionToDay(); // Questa funzione aggiorna già UI e riabilita i controlli
        } else {
            console.error("closeEventPopup: transitionToDay non disponibile!");
             // Fallback per riabilitare controlli se transitionToDay non esiste
             if(typeof enableControls === 'function') enableControls(); else console.error("closeEventPopup: enableControls non disponibile.");
             if(typeof renderMap === 'function') renderMap(); else console.error("closeEventPopup: renderMap non disponibile.");
             if(typeof renderStats === 'function') renderStats(); else console.error("closeEventPopup: renderStats non disponibile.");
        }
        // Non chiamare enableControls/renderMap/renderStats qui sotto, perché transitionToDay dovrebbe farlo.
    } else {
        // 5. Nel blocco else (tutti gli altri casi):
        //    * AGGIUNTO BLOCCO PER IMPOSTARE FLAG dayEventDone
        if (closingEventContext && closingEventContext.id === 'rest_stop_day_interaction') {
            // Marca il tile corrente come "evento diurno completato"
            // Verifica robusta che map, player.y, player.x siano validi
            if (map && map[player.y] && map[player.y][player.x]) {
                map[player.y][player.x].dayEventDone = true;
                // console.log(`>>> Tile (${player.x},${player.y}) marcato come dayEventDone.`); // Log diagnostico
            } else {
                 console.error("closeEventPopup: Impossibile marcare il tile, coordinate giocatore o mappa non valide?");
            }
        }

        //    * Mantieni la logica originale per riabilitare controlli e aggiornare UI
        if(typeof enableControls === 'function') enableControls(); else console.error("closeEventPopup: enableControls non disponibile.");
        if(typeof renderMap === 'function') renderMap(); else console.error("closeEventPopup: renderMap non disponibile.");
        if(typeof renderStats === 'function') renderStats(); else console.error("closeEventPopup: renderStats non disponibile.");
    }

    // 6. Alla fine della funzione, mantieni la logica esistente per ripristinare il focus
    try {
        document.body.focus(); // Riporta il focus al body principale
        // In alternativa, potresti voler mettere focus su un elemento specifico del gioco,
        // come il contenitore della mappa se fosse reso focusable:
        // DOM.gameContainer.focus();
    } catch (e) { console.warn("Errore ripristino focus:", e); }
}

// --- Funzione per costruire e mostrare l'esito di un evento complesso ---
// Spostata qui dal modulo events.js perché è principalmente una funzione UI.
// Dipende da: ui.js (showEventPopup, closeEventPopup), game_utils.js (addMessage).
// Usata da handleEventChoice in events.js.
/**
 * Costruisce e mostra un popup di risultato più strutturato,
 * spesso usato per l'esito di un evento complesso o un check.
 * Questo popup è più informativo di un semplice messaggio nel log.
 * Dipende da: dom_references.js (DOM.eventOverlay, DOM.eventPopup, DOM.eventTitle, DOM.eventContent, DOM.eventChoices), ui.js (closeEventPopup).
 * @param {string} title - Il titolo del popup (es. "Successo!", "Fallimento").
 * @param {string} description - La descrizione principale dell'esito (può includere HTML).
 * @param {string|null} checkDetails - Dettagli del tiro (es. "Agilità Check: 15 vs 12").
 * @param {string|null} consequences - Conseguenze meccaniche (es. "Subisci 5 danni.").
 * @param {string} [messageType='info'] - Il tipo di messaggio ('info', 'success', 'warning', 'danger') per lo stile.
 */
function buildAndShowComplexEventOutcome(title, description, checkDetails, consequences, messageType = 'info') {
    // Rimossi log diagnostici
    // console.log('buildAndShowComplexEventOutcome: Chiamata ricevuta. Verifico DOM.eventOverlay:', DOM.eventOverlay, 'DOM.eventPopup:', DOM.eventPopup, 'DOM.eventTitle:', DOM.eventTitle, 'DOM.eventContent:', DOM.eventContent, 'DOM.eventChoicesContainer:', DOM.eventChoicesContainer, 'DOM.continueButton:', DOM.continueButton, 'DOM.gameContainer:', DOM.gameContainer);
    // console.log('buildAndShowComplexEventOutcome: Funzione chiamata con:', title, description, messageType);

    // Verifica che gli elementi del popup siano disponibili.
    if (!DOM.eventOverlay || !DOM.eventPopup || !DOM.eventTitle || !DOM.eventContent || !DOM.eventChoicesContainer || !DOM.continueButton || !DOM.gameContainer) {
        console.error("buildAndShowComplexEventOutcome: Elementi DOM del popup evento (overlay/popup/title/content/choicesContainer/continueButton/gameContainer) non trovati.");
        // Logga l'errore nel log di gioco come fallback
        addMessage(`Esito Evento: ${title} - ${description}`, messageType);
        return;
    }

    // Combina le parti del testo per il contenuto del popup (usando <br> per separare)
    let fullDescription = description || "";
    if (checkDetails) {
        if (fullDescription) fullDescription += `<br>`;
        fullDescription += `<i>(${checkDetails})</i>`; // Metti i dettagli del tiro in corsivo
    }
    if (consequences) {
        if (fullDescription) fullDescription += `<br>`;
        fullDescription += consequences;
    }

    // Imposta titolo e contenuto del popup
    DOM.eventTitle.textContent = title;
    DOM.eventContent.innerHTML = fullDescription; // Usa innerHTML per renderizzare i <br>

    // Pulisce le scelte precedenti e aggiunge solo il bottone "Continua"
    DOM.eventChoicesContainer.innerHTML = "";
    const continueButton = document.createElement("button");
    continueButton.textContent = "Continua...";
    continueButton.classList.add('continue-button'); // Usa la stessa classe definita in index.html per lo stile
    // Aggiungi un listener per chiudere il popup quando si clicca Continua
    continueButton.onclick = () => {
        if (typeof closeEventPopup === 'function') {
            closeEventPopup();
        } else {
            console.error("buildAndShowComplexEventOutcome: Funzione closeEventPopup non trovata.");
            // Fallback per sbloccare il gioco se closeEventPopup non è definita
            enableControls();
            DOM.eventOverlay.classList.remove('visible');
            DOM.gameContainer.classList.remove('overlay-active');
            eventScreenActive = false;
            gamePaused = false;
        }
    };
    DOM.eventChoicesContainer.appendChild(continueButton);

    // Aggiungi una classe CSS al popup per lo stile basato sul tipo di messaggio
    DOM.eventPopup.className = 'popup'; // Resetta le classi precedenti
    DOM.eventPopup.classList.add(`popup-${messageType}`); // Aggiunge popup-info, popup-success, ecc.

    // Mostra l'overlay e il popup
    DOM.gameContainer.classList.add('overlay-active');
    DOM.eventOverlay.classList.add('visible');

    // Imposta i flag di stato
    eventScreenActive = true;
    gamePaused = true; // Il gioco è in pausa finché non si preme Continua

     // Assicura che i controlli siano disabilitati
     disableControls();

    // Rimuovi eventuali listener per i tasti di scelta numerici precedenti
    document.removeEventListener('keydown', handleEventKeyPress); // handleEventKeyPress definita in events.js

     // Sposta il focus sul bottone continua per accessibilità e interazione da tastiera
     setTimeout(() => continueButton.focus(), 0); // Timeout per garantire che il bottone sia visibile
}


// --- Funzione helper per ottenere dettagli armi/armature per tooltip ---
// Questa funzione dipende da ITEM_DATA (game_data.js) e game_utils.js (getTipoArmaLabel).
// Usata da showItemTooltip. Potrebbe idealmente stare in player.js ma è molto legata alla UI (tooltip).
// Per ora la manteniamo qui in ui.js per la vicinanza con showItemTooltip.
/**
 * Genera una stringa HTML per visualizzare le statistiche dettagliate di un oggetto (arma/armatura)
 * nel tooltip.
 * Dipende da: game_data.js (ITEM_DATA), game_constants.js (TIPO_ARMA_LABELS), game_utils.js (getTipoArmaLabel).
 * @param {object} itemInfo - L'oggetto dati dell'item da ITEM_DATA.
 * @returns {string} Stringa HTML con le statistiche formattate o vuota.
 */
function getItemDetailsHTML(itemInfo) {
    let detailsHTML = '';

    if (!itemInfo) return '';

    // Statistiche per armi
    if (itemInfo.type === 'weapon') {
        detailsHTML += `<div class="item-stat">Tipo: <span class="stat-value">${getTipoArmaLabel(itemInfo.weaponType)}</span></div>`;
        let damageText = '?';
        if (typeof itemInfo.damage === 'object' && itemInfo.damage !== null && itemInfo.damage.min !== undefined && itemInfo.damage.max !== undefined) {
            damageText = `${itemInfo.damage.min}-${itemInfo.damage.max}`;
        } else if (typeof itemInfo.damage === 'number') {
            damageText = itemInfo.damage;
        }
        detailsHTML += `<div class="item-stat">Danno Base: <span class="stat-value">${damageText}</span></div>`;
        if (itemInfo.durability !== undefined && itemInfo.maxDurability !== undefined) {
            const durabilityPercent = (itemInfo.durability / itemInfo.maxDurability) * 100;
            let durabilityColor = '#00DD00';
            let durabilityStatus = 'Buono';
            if (itemInfo.durability <= 0) {
                durabilityColor = '#FF0000';
                durabilityStatus = 'ROTTA';
            } else if (durabilityPercent <= 25) {
                durabilityColor = '#FF4444';
                durabilityStatus = 'Critica';
            } else if (durabilityPercent <= 50) {
                durabilityColor = '#FFAA00';
                durabilityStatus = 'Danneggiata';
            } else if (durabilityPercent <= 75) {
                durabilityColor = '#FFFF00';
                durabilityStatus = 'Usurata';
            }
            detailsHTML += `<div class="item-stat">Stato: <span class="stat-value" style="color: ${durabilityColor};">${durabilityStatus}</span></div>`;
            detailsHTML += `<div class="item-stat">Durabilità: <span class="stat-value">${Math.floor(itemInfo.durability)}/${itemInfo.maxDurability}</span></div>`;
        }
        if (itemInfo.peso) detailsHTML += `<div class="item-stat">Peso: <span class="stat-value">${itemInfo.peso}</span></div>`;
        if (itemInfo.velocità) detailsHTML += `<div class="item-stat">Velocità: <span class="stat-value">${itemInfo.velocità}</span></div>`;
        if (itemInfo.raggio) detailsHTML += `<div class="item-stat">Raggio: <span class="stat-value">${itemInfo.raggio}</span></div>`;
        if (itemInfo.precisione) detailsHTML += `<div class="item-stat">Precisione: <span class="stat-value">${itemInfo.precisione}</span></div>`;
        if (itemInfo.rumore) detailsHTML += `<div class="item-stat">Rumore: <span class="stat-value">${itemInfo.rumore}</span></div>`;
        if (itemInfo.ammoType) {
            const ammoName = ITEM_DATA[itemInfo.ammoType]?.name || itemInfo.ammoType;
            detailsHTML += `<div class="item-stat">Munizioni: <span class="stat-value">${ammoName}</span></div>`;
        }
        if (itemInfo.recuperabile !== undefined) {
            detailsHTML += `<div class="item-stat">Recuperabile: <span class="stat-value">${itemInfo.recuperabile ? 'Sì' : 'No'}</span></div>`;
        }
    }
    // Statistiche per armature
    else if (itemInfo.type === 'armor') {
        detailsHTML += `<div class="item-stat">Protezione: <span class="stat-value">${itemInfo.armorValue || 0}</span></div>`;
        if (itemInfo.durability !== undefined && itemInfo.maxDurability !== undefined) {
            const durabilityPercent = (itemInfo.durability / itemInfo.maxDurability) * 100;
            let durabilityColor = '#00DD00';
            let durabilityStatus = 'Buono';
            if (itemInfo.durability <= 0) { durabilityColor = '#FF0000'; durabilityStatus = 'ROTTA'; }
            else if (durabilityPercent <= 25) { durabilityColor = '#FF4444'; durabilityStatus = 'Critica'; }
            else if (durabilityPercent <= 50) { durabilityColor = '#FFAA00'; durabilityStatus = 'Danneggiata'; }
            else if (durabilityPercent <= 75) { durabilityColor = '#FFFF00'; durabilityStatus = 'Usurata'; }
            detailsHTML += `<div class="item-stat">Stato: <span class="stat-value" style="color: ${durabilityColor};">${durabilityStatus}</span></div>`;
            detailsHTML += `<div class="item-stat">Durabilità: <span class="stat-value">${Math.floor(itemInfo.durability)}/${itemInfo.maxDurability}</span></div>`;
        }
    }
    // Effetti per oggetti utilizzabili o consumabili
    const effectsText = typeof getItemEffectsText === 'function' ? getItemEffectsText(itemInfo) : '';
    if (effectsText) {
        detailsHTML += `<div class="item-stat">${effectsText}</div>`;
    }
    return detailsHTML;
}

// ----- Fine Implementazione Tooltip Inventario -----


// NOTA: Le funzioni di gestione input (handleKeyPress, setupInputListeners, handleChoiceContainerClick)
// e le funzioni di logica di gioco principali (initializeGame, movePlayer, endGame,
// triggerTileEvent, triggerComplexEvent, ecc.) saranno definite in altri moduli.
// Questo file UI fornisce solo le funzioni per AGGIORNARE LA VISUALIZZAZIONE.                                                                                                                                                                                              


// --- NUOVA SEZIONE: Logica Popup Crafting ---

let selectedRecipeKey = null; // Memorizza la ricetta attualmente selezionata nel popup

/**
 * Mostra il popup di crafting.
 * Popola la lista delle ricette conosciute dal giocatore.
 */
function showCraftingPopup() {
    // console.log("showCraftingPopup: Apertura popup crafting..."); // RIMOSSO LOG
    if (!DOM.craftingOverlay || !DOM.craftingPopup || !DOM.craftingRecipeList || !player || !player.knownRecipes) {
        console.error("showCraftingPopup: Elementi DOM del popup crafting o dati giocatore non pronti.");
        addMessage("Errore nell'aprire la schermata di crafting.", "error");
        return;
    }

    gamePaused = true;
    eventScreenActive = true; // Usiamo lo stesso flag per coerenza (blocca input mappa)
    if (typeof disableControls === 'function') disableControls();

    populateCraftingRecipeList(); // RIATTIVATO
    updateCraftingDetails(null); // RIATTIVATO - Pulisce i dettagli all'inizio

    DOM.craftingOverlay.classList.add('visible');
    DOM.craftingPopup.classList.add('visible');

    // LOG DI DEBUG RIMOSSI
    // console.log("CSS - #crafting-overlay opacity:", window.getComputedStyle(DOM.craftingOverlay).opacity);
    // console.log("CSS - #crafting-overlay visibility:", window.getComputedStyle(DOM.craftingOverlay).visibility);
    // console.log("CSS - #crafting-overlay z-index:", window.getComputedStyle(DOM.craftingOverlay).zIndex);
    // console.log("CSS - #crafting-popup display:", window.getComputedStyle(DOM.craftingPopup).display);
    // if (DOM.craftingCloseButton) {
    //     console.log("Pulsante Chiudi - offsetParent === null:", DOM.craftingCloseButton.offsetParent === null);
    // } else {
    //     console.log("Pulsante Chiudi (DOM.craftingCloseButton) non trovato!");
    // }

    // Aggiungi listener per chiusura (solo se non già aggiunto in setupInputListeners)
    if (DOM.craftingCloseButton && !DOM.craftingCloseButton.onclick) {
        DOM.craftingCloseButton.onclick = () => {
            // console.log("craftingCloseButton clicked"); // RIMOSSO LOG
            closeCraftingPopup();
        };
    }
    // Listener per il pulsante "Crea" (solo se non già aggiunto)
    if (DOM.craftItemButton && !DOM.craftItemButton.onclick) {
        DOM.craftItemButton.onclick = () => {
            if (selectedRecipeKey && typeof attemptCraftItem === 'function') {
                attemptCraftItem(selectedRecipeKey);
                updateCraftingDetails(selectedRecipeKey); 
                populateCraftingRecipeList(); 
            }
        };
    }
}

/**
 * Nasconde il popup di crafting.
 */
function closeCraftingPopup() {
    // console.log("closeCraftingPopup: Chiusura popup crafting..."); // RIMOSSO LOG
    if (!DOM.craftingOverlay || !DOM.craftingPopup) {
        console.warn("closeCraftingPopup: Elementi DOM del popup crafting non pronti.");
        // Cerca di resettare i flag comunque
        gamePaused = false;
        eventScreenActive = false;
        if (typeof enableControls === 'function') enableControls();
        return;
    }

    DOM.craftingOverlay.classList.remove('visible');
    DOM.craftingPopup.classList.remove('visible');
    gamePaused = false;
    eventScreenActive = false;
    if (typeof enableControls === 'function') enableControls();
    selectedRecipeKey = null; // Resetta la ricetta selezionata
}

/**
 * Popola la lista delle ricette conosciute nel popup di crafting.
 */
function populateCraftingRecipeList() {
    if (!DOM.craftingRecipeList || typeof CRAFTING_RECIPES === 'undefined' || !player) {
        console.error("populateCraftingRecipeList: Elementi DOM mancanti, CRAFTING_RECIPES non definito o player non trovato.");
        return;
    }

    DOM.craftingRecipeList.innerHTML = ''; // Pulisce la lista precedente
    // Rimosso: console.log('[DEBUG populateCrafting] Ricette conosciute dal giocatore all\'apertura del popup:', JSON.stringify(player.knownRecipes));

    if (!player.knownRecipes || player.knownRecipes.length === 0) {
        const noRecipesLi = document.createElement('li');
        noRecipesLi.textContent = "Nessuna ricetta conosciuta.";
        noRecipesLi.classList.add('no-recipes');
        DOM.craftingRecipeList.appendChild(noRecipesLi);
        updateCraftingDetails(null); // Pulisce i dettagli
        // Rimosso: console.log('[DEBUG populateCrafting] Numero di ricette aggiunte al DOM:', DOM.craftingRecipeList.children.length);
        return;
    }

    let firstRecipeKey = null;

    player.knownRecipes.forEach(recipeKey => {
        const recipe = CRAFTING_RECIPES[recipeKey];
        // Rimosso: console.log('[DEBUG populateCrafting Dettaglio Lookup] Chiave:', recipeKey, 'Valore da CRAFTING_RECIPES:', recipe);
        if (recipe) {
            if (!firstRecipeKey) {
                firstRecipeKey = recipeKey;
            }
            const li = document.createElement('li');
            const button = document.createElement('button'); // NUOVA LINEA
            button.textContent = recipe.productName || recipe.productId;
            button.dataset.recipeKey = recipeKey;

            if (typeof checkIngredients === 'function' && checkIngredients(recipe.ingredients)) {
                button.classList.add('craftable');
            } else {
                button.classList.add('not-craftable');
            }

            button.onclick = () => {
                selectedRecipeKey = recipeKey; // Assicura che selectedRecipeKey sia aggiornato
                updateCraftingDetails(recipeKey);
                // Rimuovi 'selected' da tutti i bottoni prima di aggiungerlo a quello cliccato
                Array.from(DOM.craftingRecipeList.querySelectorAll('button')).forEach(btn => {
                    btn.classList.remove('selected');
                });
                button.classList.add('selected');
            };
            li.appendChild(button); // NUOVA LINEA - aggiunge bottone al li
            DOM.craftingRecipeList.appendChild(li); // Aggiunge li alla lista ul
        }
    });

    // Se è stata aggiunta almeno una ricetta, seleziona e mostra i dettagli della prima
    if (firstRecipeKey) {
        updateCraftingDetails(firstRecipeKey);
        // Evidenzia il primo elemento della lista (opzionale)
        const firstListButton = DOM.craftingRecipeList.querySelector(`button[data-recipe-key="${firstRecipeKey}"]`);
        if (firstListButton) {
            // Rimuovi la classe 'selected' da qualsiasi altro elemento (se presente)
            DOM.craftingRecipeList.querySelectorAll('button.selected').forEach(el => el.classList.remove('selected'));
            firstListButton.classList.add('selected'); // Aggiungi la classe 'selected'
            selectedRecipeKey = firstRecipeKey; // Imposta la ricetta selezionata
        }
    } else {
        // Caso in cui knownRecipes non è vuoto, ma nessuna ricetta valida è stata trovata in CRAFTING_RECIPES
        const errorLi = document.createElement('li');
        errorLi.textContent = "Errore: Ricette conosciute non valide.";
        DOM.craftingRecipeList.appendChild(errorLi);
        updateCraftingDetails(null); // Pulisce i dettagli
    }
    // Rimosso: console.log('[DEBUG populateCrafting] Numero di ricette aggiunte al DOM:', DOM.craftingRecipeList.children.length);
}

/**
 * Aggiorna il pannello dei dettagli della ricetta selezionata.
 * @param {string | null} recipeKey - La chiave della ricetta selezionata, o null per pulire.
 */
function updateCraftingDetails(recipeKey) {
    if (!DOM.craftingRecipeNameTitle || !DOM.craftingRecipeDescription || !DOM.craftingIngredientList || !DOM.craftItemButton || !DOM.craftingRequirements) return; // UTILIZZA DOM.craftingRecipeNameTitle

    if (!recipeKey || !CRAFTING_RECIPES[recipeKey]) {
        DOM.craftingRecipeNameTitle.textContent = "Seleziona una ricetta dalla lista."; // UTILIZZA DOM.craftingRecipeNameTitle
        DOM.craftingRecipeDescription.textContent = "";
        DOM.craftingIngredientList.innerHTML = "";
        DOM.craftingRequirements.textContent = "";
        DOM.craftItemButton.textContent = "Crea";
        DOM.craftItemButton.classList.add('disabled');
        DOM.craftItemButton.disabled = true;
        selectedRecipeKey = null;
        return;
    }

    const recipe = CRAFTING_RECIPES[recipeKey];
    const productInfo = ITEM_DATA[recipe.productId];

    DOM.craftingRecipeNameTitle.textContent = recipe.productName || recipe.productId; // UTILIZZA DOM.craftingRecipeNameTitle
    DOM.craftingRecipeDescription.textContent = productInfo?.description || recipe.description || "Nessuna descrizione per questa ricetta.";
    
    DOM.craftingIngredientList.innerHTML = "";
    let canCraft = true;

    if (recipe.ingredients) {
        recipe.ingredients.forEach(ing => {
            const ingredientInfo = ITEM_DATA[ing.itemId];
            const li = document.createElement('li');
            const ownedSlot = player.inventory.find(slot => slot.itemId === ing.itemId);
            const ownedQuantity = ownedSlot ? ownedSlot.quantity : 0;
            
            li.textContent = `${ing.quantity}x ${ingredientInfo?.name || ing.itemId}`;
            
            if (ownedQuantity >= ing.quantity) {
                li.classList.add('has-ingredient');
                li.textContent += ` (Ne hai: ${ownedQuantity})`;
            } else {
                li.classList.add('missing-ingredient');
                li.textContent += ` (Ne hai: ${ownedQuantity} - MANCANTE)`;
                canCraft = false;
            }
            DOM.craftingIngredientList.appendChild(li);
        });
    }

    // Gestione requisiti futuri (es. "Serve Fuoco")
    DOM.craftingRequirements.innerHTML = "";
    if (recipe.requirements && recipe.requirements.length > 0) {
        let reqText = "Richiede: ";
        // Esempio di gestione:
        // if (recipe.requirements.includes('needs_fire') && !isPlayerNearFire()) { // isPlayerNearFire() da implementare
        //     reqText += "<span class=\'missing-requirement\'>Fonte di Fuoco</span>";
        //     canCraft = false;
        // }
        DOM.craftingRequirements.innerHTML = reqText;
    }


    if (canCraft) {
        DOM.craftItemButton.textContent = `Crea ${recipe.productName || recipe.productId}`;
        DOM.craftItemButton.classList.remove('disabled');
        DOM.craftItemButton.disabled = false;
    } else {
        DOM.craftItemButton.textContent = "Ingredienti Mancanti";
        DOM.craftItemButton.classList.add('disabled');
        DOM.craftItemButton.disabled = true;
    }
}

// --- FINE Logica Popup Crafting ---


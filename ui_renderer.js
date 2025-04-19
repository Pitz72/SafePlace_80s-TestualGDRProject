/**
 * The Safe Place - Minimal Roguelike
 * File: ui_renderer.js
 * Descrizione: Contiene le funzioni per renderizzare l'interfaccia di gioco.
 */

/**
 * Aggiorna la visualizzazione delle statistiche del giocatore nell'interfaccia.
 */
function renderStats() {
    if (!player) return; // Esce se non c'è un giocatore valido

    // Aggiorna i valori delle statistiche
    if (statHp) statHp.textContent = Math.floor(player.hp);
    if (statMaxHp) statMaxHp.textContent = player.maxHp;
    if (statVig) statVig.textContent = player.vigore;
    if (statPot) statPot.textContent = player.potenza;
    if (statAgi) statAgi.textContent = player.agilita;
    if (statTra) statTra.textContent = player.tracce;
    if (statInf) statInf.textContent = player.influenza;
    if (statPre) statPre.textContent = player.presagio;
    if (statAda) statAda.textContent = player.adattamento;
    if (statAcq) statAcq.textContent = player.acquisita || 0;

    // Aggiorna visualizzazione risorse
    if (statFood) statFood.textContent = Math.floor(player.food);
    if (statWater) statWater.textContent = Math.floor(player.water);

    // Aggiorna visualizzazione stato salute
    let statoText = "Normale";
    let statoClass = "status-normal";

    if (player.hp <= 0) {
        statoText = "Morto";
        statoClass = "status-dying";
    } else if (player.hp <= player.maxHp * 0.3) {
        statoText = "Morente";
        statoClass = "status-dying";
    } else {
        // Priorità degli stati
        if (player.isInjured && player.isSick) {
            statoText = "Ferito & Infetto";
            statoClass = "status-critical";
        } else if (player.isSick) {
            statoText = "Infetto";
            statoClass = "status-sick";
        } else if (player.isInjured) {
            statoText = "Ferito";
            statoClass = "status-injured";
        } else if (player.food <= 0 && player.water <= 0) {
            statoText = "Affamato & Assetato";
            statoClass = "status-critical";
        } else if (player.food <= 0) {
            statoText = "Affamato";
            statoClass = "status-hungry";
        } else if (player.water <= 0) {
            statoText = "Assetato";
            statoClass = "status-thirsty";
        }
    }

    // Aggiorna stato giocatore
    if (statCondition) {
        statCondition.textContent = statoText;
        statCondition.className = statoClass; // Rimuove le classi precedenti
    }

    // Aggiorna informazioni di gioco
    if (posX) posX.textContent = player.x;
    if (posY) posY.textContent = player.y;
    if (tileType && player.x >= 0 && player.y >= 0 && player.x < MAP_WIDTH && player.y < MAP_HEIGHT && map[player.y] && map[player.y][player.x]) {
        const tileSymbol = map[player.y][player.x];
        let tileDesc = "Sconosciuto";
        
        switch (tileSymbol) {
            case TILE_SYMBOLS.PLAINS: tileDesc = "Pianura"; break;
            case TILE_SYMBOLS.MOUNTAIN: tileDesc = "Montagna"; break;
            case TILE_SYMBOLS.RIVER: tileDesc = "Fiume"; break;
            case TILE_SYMBOLS.FOREST: tileDesc = "Foresta"; break;
            case TILE_SYMBOLS.VILLAGE: tileDesc = "Villaggio"; break;
            case TILE_SYMBOLS.CITY: tileDesc = "Città Abbandonata"; break;
            case TILE_SYMBOLS.REST_STOP: tileDesc = "Area di Sosta"; break;
            case TILE_SYMBOLS.START: tileDesc = "Punto di Partenza"; break;
            case TILE_SYMBOLS.END: tileDesc = "Rifugio"; break;
        }
        
        tileType.textContent = tileDesc;
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
}

/**
 * Aggiorna il log dei messaggi nell'interfaccia.
 */
function renderMessages() {
    if (!messagesList) return;
    
    // Pulisce la lista messaggi esistente
    messagesList.innerHTML = "";
    
    // Aggiunge i messaggi (dal più recente al più vecchio)
    for (let i = messages.length - 1; i >= 0; i--) {
        const message = messages[i];
        const li = document.createElement("li");
        li.innerHTML = message.text;
        if (message.class) li.classList.add(message.class);
        messagesList.appendChild(li);
    }
}

/**
 * Aggiorna la visualizzazione dell'inventario nell'interfaccia.
 */
function renderInventory() {
    if (!player || !player.inventory || !inventoryList) return;
    
    // Pulisce la lista dell'inventario esistente
    inventoryList.innerHTML = "";
    
    if (player.inventory.length === 0) {
        // Se l'inventario è vuoto
        const emptyItem = document.createElement("li");
        emptyItem.textContent = "Nessun oggetto";
        emptyItem.classList.add("empty-inventory");
        inventoryList.appendChild(emptyItem);
        return;
    }
    
    // Ordina l'inventario per categoria e nome per una migliore visualizzazione
    const sortedInventory = [...player.inventory].sort((a, b) => {
        // Prima tenta di ordinare per categoria
        const itemA = ITEM_DATA[a.itemId];
        const itemB = ITEM_DATA[b.itemId];
        
        if (!itemA || !itemB) return 0; // Protezione contro itemId non validi
        
        // Verifica che entrambi gli item abbiano una categoria definita
        const categoryA = itemA.category || "Unknown";
        const categoryB = itemB.category || "Unknown";
        
        // Ordinamento per categoria, poi per nome
        if (categoryA !== categoryB) {
            return categoryA.localeCompare(categoryB);
        } else {
            // Verifica che entrambi gli item abbiano un nome definito
            const nameA = itemA.name || a.itemId;
            const nameB = itemB.name || b.itemId;
            return nameA.localeCompare(nameB);
        }
    });
    
    // Aggiunge gli elementi dell'inventario
    for (const item of sortedInventory) {
        if (!ITEM_DATA[item.itemId]) continue; // Salta oggetti non definiti
        
        const itemInfo = ITEM_DATA[item.itemId];
        const listItem = document.createElement("li");
        
        // Aggiunge class per item-type per lo styling CSS
        if (itemInfo && itemInfo.category) {
            listItem.classList.add(`item-${itemInfo.category.toLowerCase()}`);
        } else {
            // Classe di fallback se non esiste la categoria
            listItem.classList.add(`item-unknown`);
            console.warn(`Categoria non definita per l'oggetto: ${item.itemId}`);
        }
        
        // Aggiunge event listener quando il dito dell'utente si muove sull'elemento (mobile & desktop)
        listItem.addEventListener('pointerenter', (e) => showItemTooltip(item, e));
        listItem.addEventListener('pointerleave', hideItemTooltip);
        
        // Aggiunge event listener per il click
        listItem.addEventListener('click', () => showItemActionPopup(item.itemId));
            
        // Costruisce il testo dell'elemento
        listItem.innerHTML = `${itemInfo.name} <span class="item-quantity">${item.quantity}</span>`;
        
        // Aggiunge l'elemento alla lista
        inventoryList.appendChild(listItem);
    }
}

/**
 * Renderizza la legenda della mappa.
 */
function renderLegend() {
    if (!legendList) return;
    
    // Pulisce la legenda esistente
    legendList.innerHTML = "";
    
    // Definisce gli elementi della legenda
    const legendItems = [
        { symbol: TILE_SYMBOLS.PLAYER, description: "Giocatore", color: "var(--fg-color)" },
        { symbol: TILE_SYMBOLS.PLAINS, description: "Pianura", color: "var(--plains-color)" },
        { symbol: TILE_SYMBOLS.FOREST, description: "Foresta", color: "var(--forest-color)" },
        { symbol: TILE_SYMBOLS.MOUNTAIN, description: "Montagna", color: "var(--mountain-color)" },
        { symbol: TILE_SYMBOLS.RIVER, description: "Fiume", color: "var(--water-color)" },
        { symbol: TILE_SYMBOLS.VILLAGE, description: "Villaggio", color: "var(--ruin-color)" },
        { symbol: TILE_SYMBOLS.CITY, description: "Città", color: "var(--ruin-color)" },
        { symbol: TILE_SYMBOLS.REST_STOP, description: "Area Sosta", color: "var(--ruin-color)" },
        { symbol: TILE_SYMBOLS.START, description: "Partenza", color: "var(--accent-color)" },
        { symbol: TILE_SYMBOLS.END, description: "Rifugio", color: "var(--end-color)" }
    ];
    
    // Aggiunge gli elementi alla legenda
    for (const item of legendItems) {
        const li = document.createElement("li");
        const symbol = document.createElement("span");
        symbol.textContent = item.symbol;
        symbol.style.color = item.color;
        symbol.classList.add("legend-symbol");
        
        li.appendChild(symbol);
        li.appendChild(document.createTextNode(` ${item.description}`));
        legendList.appendChild(li);
    }
}

/**
 * Renderizza la mappa di gioco.
 */
function renderMap() {
    if (!mapDisplay) return;
    
    let mapHTML = '';
    
    // Prepara la rappresentazione HTML della mappa con span per ogni cella
    for (let y = 0; y < MAP_HEIGHT; y++) {
        for (let x = 0; x < MAP_WIDTH; x++) {
            let tileClass = '';
            let tileChar = '';
            
            // Posizione del giocatore
            if (player && player.x === x && player.y === y) {
                tileChar = TILE_SYMBOLS.PLAYER;
                tileClass = 'player-marker'; // Questa è la classe per l'animazione lampeggiante
            } else {
                // Altrimenti, mostra il tipo di casella
                tileChar = map[y][x];
                
                // Assegna classi CSS in base al tipo di tile
                switch (tileChar) {
                    case TILE_SYMBOLS.PLAINS: tileClass = 'tile-plains'; break;
                    case TILE_SYMBOLS.MOUNTAIN: tileClass = 'tile-mountain'; break;
                    case TILE_SYMBOLS.FOREST: tileClass = 'tile-forest'; break;
                    case TILE_SYMBOLS.RIVER: tileClass = 'tile-river'; break;
                    case TILE_SYMBOLS.VILLAGE: tileClass = 'tile-village'; break;
                    case TILE_SYMBOLS.CITY: tileClass = 'tile-city'; break;
                    case TILE_SYMBOLS.REST_STOP: tileClass = 'tile-rest-stop'; break;
                    case TILE_SYMBOLS.START: tileClass = 'tile-start'; break;
                    case TILE_SYMBOLS.END: tileClass = 'tile-end'; break;
                }
            }
            
            // Crea uno span per la cella con la classe appropriata
            mapHTML += `<span class="${tileClass}">${tileChar}</span>`;
        }
        
        // Aggiungi un a capo dopo ogni riga
        mapHTML += '<br>';
    }
    
    // Aggiunge la mappa all'elemento mapDisplay
    mapDisplay.innerHTML = mapHTML;
}

/**
 * Disabilita i controlli dell'interfaccia durante gli eventi o altre situazioni di pausa.
 */
function disableControls() {
    gamePaused = true; // Blocca input globalmente (per eventi, animazioni, etc.)
    moveButtons.forEach(button => {
        button.disabled = true;
        button.classList.add('disabled');
    });
}

/**
 * Riabilita i controlli dell'interfaccia dopo eventi o altre situazioni di pausa.
 */
function enableControls() {
    gamePaused = false; // Riabilita input
    moveButtons.forEach(button => {
        button.disabled = false;
        button.classList.remove('disabled');
    });
} 
/**
 * The Safe Place - Minimal Roguelike
 * File: character.js
 * Descrizione: Contiene le funzioni per la generazione e gestione del personaggio.
 */

/**
 * Genera le statistiche e l'inventario iniziale del personaggio giocante.
 */
function generateCharacter() {
    // Reset del giocatore
    player = {
        // Statistiche primarie
        hp: 20,
        maxHp: 20,
        food: STARTING_FOOD,
        water: STARTING_WATER,
        
        // Attributi
        vigore: getRandomInt(4, 7),      // Resistenza fisica generale
        potenza: getRandomInt(4, 7),     // Forza fisica e capacità di combattimento
        agilita: getRandomInt(4, 7),     // Velocità, riflessi, destrezza
        tracce: getRandomInt(4, 7),      // Capacità di seguire tracce, orientamento
        influenza: getRandomInt(4, 7),   // Carisma, persuasione, interazione sociale
        presagio: getRandomInt(4, 7),    // Intuizione, percezione del pericolo
        adattamento: getRandomInt(4, 7), // Capacità di resistere a condizioni estreme
        acquisita: 0,                    // Punti abilità guadagnati durante il gioco
        
        // Stati speciali
        isInjured: false, // Ferito
        isSick: false,    // Malato
        
        // Posizione iniziale (verrà impostata durante la generazione della mappa)
        x: -1,
        y: -1,
        
        // Inventario
        inventory: []
    };

    // Aggiunge oggetti iniziali casuali all'inventario
    addItemToInventory('water_bottle', 1);
    addItemToInventory('jerky', 1);
    
    // 50% probabilità di partire con bende
    if (Math.random() < 0.5) {
        addItemToInventory('bandages', 1);
    }
    
    // 30% probabilità di partire con kit medico
    if (Math.random() < 0.3) {
        addItemToInventory('med_kit', 1);
    }
    
    // 20% probabilità di partire con un'arma base
    if (Math.random() < 0.2) {
        addItemToInventory('knife', 1);
    }
    
    // Debug log solo in modalità sviluppo
    if (typeof DEV_MODE !== 'undefined' && DEV_MODE) {
        console.log("Personaggio generato:", player);
    }
}

/**
 * Aggiunge un oggetto all'inventario del giocatore o ne aumenta la quantità se già presente.
 * @param {string} itemId - L'ID dell'oggetto da aggiungere (corrispondente a una chiave in ITEM_DATA).
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
        // TODO: Potrebbe essere utile verificare se itemId esiste in ITEM_DATA
        player.inventory.push({ itemId: itemId, quantity: quantity });
    }

    // Aggiorna la visualizzazione dell'inventario se la funzione è già definita
    if (typeof renderInventory === 'function') {
        renderInventory();
    }
}

/**
 * Mostra un popup di azione per un elemento dell'inventario.
 * @param {string} itemId - L'ID dell'oggetto su cui agire.
 */
function showItemActionPopup(itemId) {
    // Trova informazioni sull'oggetto
    const item = ITEM_DATA[itemId];
    if (!item) {
        console.error("Oggetto non trovato:", itemId);
        return;
    }
    
    const playerItem = player.inventory.find(i => i.itemId === itemId);
    if (!playerItem) {
        console.error("Oggetto non presente nell'inventario:", itemId);
        return;
    }
    
    // Costruisce un evento "virtuale" per utilizzare il sistema dei popup degli eventi
    const itemEvent = {
        title: `${item.name} (${playerItem.quantity})`,
        description: item.description,
        choices: [
            {
                text: "Usa",
                outcome: `Hai usato ${item.name}.`,
                action: () => useItem(itemId)
            },
            {
                text: "Chiudi",
                outcome: "Hai chiuso il menu oggetto."
            }
        ]
    };
    
    // Se l'oggetto non è utilizzabile, rimuove l'opzione "Usa"
    if (!item.usable) {
        itemEvent.choices.shift(); // Rimuove la prima scelta (Usa)
    }
    
    // Mostra il popup
    showEventPopup(itemEvent);
}

/**
 * Gestisce l'utilizzo di un oggetto dall'inventario.
 * @param {string} itemId - L'ID dell'oggetto da utilizzare.
 */
function useItem(itemId) {
    // Trova l'oggetto nell'inventario
    const itemIndex = player.inventory.findIndex(item => item.itemId === itemId);
    if (itemIndex === -1) {
        console.error("Oggetto non trovato nell'inventario:", itemId);
        closeEventPopup(); // Chiude il popup
        return;
    }
    
    // Ottiene info sull'oggetto
    const item = ITEM_DATA[itemId];
    if (!item) {
        console.error("Dati oggetto non trovati:", itemId);
        closeEventPopup(); // Chiude il popup
        return;
    }
    
    // Verifica se è utilizzabile
    if (!item.usable) {
        addMessage(`${item.name} non può essere utilizzato.`, 'warning');
        closeEventPopup(); // Chiude il popup
        return;
    }
    
    let itemUsed = false;
    let useMessage = "";
    
    // Effetti dell'utilizzo dell'oggetto basati sulla categoria
    switch (item.category) {
        case "Food":
            // Aumenta la sazietà del giocatore
            player.food = Math.min(player.food + item.foodValue, 10);
            itemUsed = true;
            useMessage = `Hai mangiato ${item.name}. Sazietà: ${Math.floor(player.food)}/10`;
            break;
            
        case "Water":
            // Aumenta l'idratazione del giocatore
            player.water = Math.min(player.water + item.waterValue, 10);
            itemUsed = true;
            useMessage = `Hai bevuto ${item.name}. Idratazione: ${Math.floor(player.water)}/10`;
            break;
            
        case "Medical":
            // Effetti degli oggetti medici
            if (item.healsInjury && player.isInjured) {
                player.isInjured = false;
                itemUsed = true;
                useMessage = `Hai usato ${item.name} per trattare le tue ferite.`;
            } 
            else if (item.healsSickness && player.isSick) {
                player.isSick = false;
                itemUsed = true;
                useMessage = `Hai usato ${item.name} per curare la tua malattia.`;
            }
            else if (item.healsHP && player.hp < player.maxHp) {
                player.hp = Math.min(player.hp + item.healValue, player.maxHp);
                itemUsed = true;
                useMessage = `Hai usato ${item.name}. Salute: ${Math.floor(player.hp)}/${player.maxHp}`;
            }
            else {
                useMessage = `Non hai bisogno di usare ${item.name} al momento.`;
            }
            break;
            
        default:
            useMessage = `Hai usato ${item.name} ma non succede nulla di particolare.`;
            itemUsed = true;
            break;
    }
    
    // Se l'oggetto è stato usato con successo
    if (itemUsed) {
        // Decrementa la quantità nell'inventario
        player.inventory[itemIndex].quantity--;
        
        // Se la quantità è zero, rimuove l'oggetto dall'inventario
        if (player.inventory[itemIndex].quantity <= 0) {
            player.inventory.splice(itemIndex, 1);
        }
        
        // Aggiorna l'interfaccia
        renderInventory();
        renderStats();
        
        // Aggiunge messaggio al log
        addMessage(useMessage, 'success');
    } else {
        // Se non è stato usato, aggiunge messaggio al log
        addMessage(useMessage, 'info');
    }
    
    // Chiude il popup evento
    closeEventPopup();
}

/**
 * Mostra un tooltip informativo quando il mouse passa sopra un oggetto dell'inventario.
 * @param {Object} item - L'oggetto dell'inventario.
 * @param {Event} event - L'evento di hover.
 */
function showItemTooltip(item, event) {
    // Ottieni riferimento al tooltip
    const itemTooltip = document.getElementById('item-tooltip');
    if (!itemTooltip) return;
    
    // Ottieni dati dell'oggetto
    const itemDetails = ITEM_DATA[item.itemId];
    if (!itemDetails) return;
    
    // Popola il contenuto del tooltip
    itemTooltip.innerHTML = `
        <div class="tooltip-header">${itemDetails.name}</div>
        <div class="tooltip-description">${itemDetails.description}</div>
        <div class="tooltip-effects">${getItemEffectsText(itemDetails)}</div>
    `;
    
    // Calcola la posizione del tooltip
    const tooltipRect = itemTooltip.getBoundingClientRect();
    const targetRect = event.target.getBoundingClientRect();
    
    // Posiziona preferibilmente a destra dell'elemento
    itemTooltip.style.left = `${targetRect.right + 10}px`;
    itemTooltip.style.top = `${targetRect.top}px`;
    
    // Controlla se il tooltip esce dallo schermo a destra
    const tooltipRight = targetRect.right + 10 + tooltipRect.width;
    if (tooltipRight > window.innerWidth) {
        // Se esce dallo schermo, posiziona a sinistra dell'elemento
        itemTooltip.style.left = `${targetRect.left - tooltipRect.width - 10}px`;
    }
    
    // Rende visibile il tooltip
    itemTooltip.classList.remove('hidden');
}

/**
 * Ottiene una descrizione testuale degli effetti di un oggetto.
 * @param {Object} itemDetails - I dettagli dell'oggetto.
 * @returns {string} Una stringa che descrive gli effetti dell'oggetto.
 */
function getItemEffectsText(itemDetails) {
    let effects = [];
    
    switch (itemDetails.category) {
        case "Food":
            effects.push(`Sazietà: +${itemDetails.foodValue}`);
            break;
        case "Water":
            effects.push(`Idratazione: +${itemDetails.waterValue}`);
            break;
        case "Medical":
            if (itemDetails.healValue) effects.push(`Cura: +${itemDetails.healValue} HP`);
            if (itemDetails.healsInjury) effects.push("Cura ferite");
            if (itemDetails.healsSickness) effects.push("Cura malattie");
            break;
        case "Tool":
            effects.push("Strumento di sopravvivenza");
            break;
        case "Misc":
            effects.push("Oggetto generico");
            break;
    }
    
    return effects.join("<br>");
}

/**
 * Nasconde il tooltip degli oggetti.
 */
function hideItemTooltip() {
    const itemTooltip = document.getElementById('item-tooltip');
    if (itemTooltip) itemTooltip.classList.add('hidden');
}
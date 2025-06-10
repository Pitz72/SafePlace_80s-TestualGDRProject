/**
 * TheSafePlace - Roguelike Postapocalittico
 * Versione: v0.8.5-consolidated
 * File: js/player.js
 * Descrizione: Gestione del personaggio giocante, statistiche, inventario, azioni.
 * Dipende da: game_constants.js, game_data.js, ui.js, game_utils.js
 */

// Dipendenze:
// - Variabili di stato globali (player, messages) da game_constants.js
// - Costanti (STARTING_FOOD, STARTING_WATER, MAX_INVENTORY_SLOTS, ITEM_DATA, STATO_MESSAGGI,...) da game_constants.js/game_data.js
// - Funzioni utility (getRandomInt, addMessage, getRandomText, performSkillCheck, chooseWeighted) da game_utils.js
// - Funzioni UI (renderStats, renderInventory, showItemActionPopup, closeEventPopup, showItemTooltip, hideItemTooltip, getItemDetailsHTML) da ui.js
// - Funzione endGame (da game_core.js)

// Variabile globale per gestire i popup di azione
let savedActionPopupContext = null;


/**
 * Genera le statistiche base e l'inventario iniziale del personaggio giocante.
 * Inizializza l'oggetto player.
 * Dipende da: game_constants.js (player, STARTING_FOOD, STARTING_WATER), game_utils.js (getRandomInt), ui.js (addItemToInventory).
 */
function generateCharacter() {
    player = {
        hp: 100,
        maxHp: 100,
        food: STARTING_FOOD,
        maxFood: 10, // Massimo cibo che può avere
        water: STARTING_WATER,
        maxWater: 10, // Massima acqua
        stats: {
            forza: getRandomInt(3, 6), // Potenza fisica
            agilita: getRandomInt(3, 6), // Destrezza e riflessi
            vigore: getRandomInt(3, 6),  // Resistenza a malattie, fatica
            percezione: getRandomInt(3, 6), // Notare dettagli, tracce
            carisma: getRandomInt(3, 6), // Influenzare gli altri
            adattamento: getRandomInt(3, 6) // Capacità di apprendere, resistere a shock
        },
        // Alias per compatibilità con eventi (puntano alle stesse statistiche)
        potenza: 0, // Sarà calcolato da stats.forza
        agilita: 0, // Sarà calcolato da stats.agilita  
        tracce: 0, // Sarà calcolato da stats.percezione
        influenza: 0, // Sarà calcolato da stats.carisma
        presagio: 0, // Sarà calcolato da stats.percezione
        adattamento: 0, // Sarà calcolato da stats.adattamento
        inventory: [],
        equippedWeapon: null,
        equippedArmor: null,
        isInjured: false,
        isSick: false,
        isPoisoned: false, // Nuovo stato
        // ... altri stati come 'affamato', 'assetato' sono impliciti da food/water <= 0
        bonusStats: { forza: 0, agilita: 0, vigore: 0, percezione: 0, carisma: 0, adattamento: 0 },
        knownRecipes: ['purify_water', 'cook_meat', 'craft_shiv', 'craft_healing_poultice', 'craft_bandages_clean'], // Ricette iniziali di sopravvivenza
        
        // === SISTEMA PROGRESSIONE D&D-INSPIRED ===
        experience: 0, // Punti esperienza accumulati
        availableStatPoints: 0, // Punti disponibili per migliorare statistiche
        totalStatUpgrades: 0 // Contatore totale miglioramenti (per bilanciamento)
    };

    // Calcolo HP massimi basati sul Vigore
    player.maxHp = 70 + (player.stats.vigore * 5);
    player.hp = player.maxHp;

    // Calcolo alias statistiche per compatibilità eventi
    player.potenza = player.stats.forza;
    player.agilita = player.stats.agilita;
    player.tracce = player.stats.percezione;
    player.influenza = player.stats.carisma;
    player.presagio = player.stats.percezione;
    player.adattamento = player.stats.adattamento;

    // Inizializzazione dell'inventario e degli oggetti equipaggiati
    player.inventory = [];
    player.equippedWeapon = null;
    player.equippedArmor = null;

    // Aggiungi oggetti iniziali essenziali per la sopravvivenza
    addItemToInventory('canned_food', 1);        // 2 porzioni
    addItemToInventory('water_bottle', 1);       // 4 porzioni
    addItemToInventory('bandages_dirty', 3);
    
    // Oggetti aggiuntivi per completare l'inventario originale di Ultimo
    addItemToInventory('scrap_metal', 2);        // Materiale per crafting base
    addItemToInventory('cloth_rags', 3);         // Stracci per riparazioni e crafting
    addItemToInventory('charcoal', 1);           // Per purificare l'acqua

    // Equipaggia arma iniziale (coltello da cucina)
    const startingWeapon = ITEM_DATA['kitchen_knife'];
    if (startingWeapon) {
        const weaponInstance = { 
            itemId: 'kitchen_knife',
            currentDurability: startingWeapon.durability || startingWeapon.maxDurability
        };
        // Se l'arma ha porzioni (improbabile per armi, ma per coerenza)
        if (startingWeapon.max_portions) {
            weaponInstance.current_portions = startingWeapon.max_portions;
            weaponInstance.max_portions = startingWeapon.max_portions;
        }
        player.equippedWeapon = weaponInstance;
    }

    // Equipaggia armatura iniziale (armatura di stracci)
    const startingArmor = ITEM_DATA['armor_rags_simple'];
    if (startingArmor) {
        const armorInstance = { 
            itemId: 'armor_rags_simple',
            currentDurability: startingArmor.durability || startingArmor.maxDurability
        };
        // Se l'armatura ha porzioni (improbabile)
        if (startingArmor.max_portions) {
            armorInstance.current_portions = startingArmor.max_portions;
            armorInstance.max_portions = startingArmor.max_portions;
        }
        player.equippedArmor = armorInstance;
    }

    addMessage("Ti svegli in un silenzio innaturale. Il mondo come lo conoscevi non esiste più.", "info");
    addMessage("Devi trovare un posto sicuro. Inizia a esplorare.", "info");
    checkAndLogStatusMessages();
}

/**
 * Aggiunge un oggetto all'inventario del giocatore.
 * Gestisce la stackabilità e i limiti dell'inventario.
 * @param {string} itemId L'ID dell'oggetto da aggiungere.
 * @param {number} quantity La quantità dell'oggetto da aggiungere.
 * @returns {boolean} True se l'oggetto è stato aggiunto, false altrimenti.
 */
function addItemToInventory(itemId, quantity) {
    const itemInfo = ITEM_DATA[itemId];
    if (!itemInfo) {
        console.error(`Tentativo di aggiungere un oggetto inesistente: ${itemId}`);
        addMessage(`Errore: oggetto ${itemId} non trovato.`, 'error');
        return false;
    }

    if (player.inventory.length >= MAX_INVENTORY_SLOTS && !itemInfo.stackable) {
        const existingItemIndex = player.inventory.findIndex(slot => slot.itemId === itemId && itemInfo.stackable);
        if (existingItemIndex === -1) {
            addMessage("Inventario pieno.", "warning");
            return false;
        }
    }
    
    // Gestione oggetti con porzioni
    let currentPortions = itemInfo.max_portions || 1;

    if (itemInfo.stackable) {
        const existingItemIndex = player.inventory.findIndex(slot => slot.itemId === itemId);
        if (existingItemIndex !== -1) {
            // Per oggetti stackabili, incrementa sempre la quantità nello slot esistente
            player.inventory[existingItemIndex].quantity += quantity;
            addMessage(`${itemInfo.name} x${quantity} aggiunto all'inventario.`, "success");
            renderInventory();
            return true;
        }
    }

    // Se non è stackabile, o è stackabile ma non c'è uno stack esistente (o è multiporzione),
    // cerca uno slot vuoto.
    if (player.inventory.length < MAX_INVENTORY_SLOTS) {
        const newItem = { itemId: itemId, quantity: quantity };
        if (itemInfo.max_portions && itemInfo.max_portions > 1) {
            newItem.current_portions = itemInfo.max_portions;
            newItem.max_portions = itemInfo.max_portions; // Memorizza anche max per UI
        }
        player.inventory.push(newItem);
        addMessage(`${itemInfo.name} aggiunto all'inventario.` + (newItem.current_portions ? ` (${newItem.current_portions} porz.)` : ''), "success");
        renderInventory();
        return true;
    } else {
        // Inventario pieno - offri scelta al giocatore
        showInventoryFullChoicePopup(itemId, quantity);
        return false; // Non aggiunto immediatamente
    }
}


/**
 * Rimuove un oggetto dall'inventario del giocatore.
 * Dipende da: game_constants.js (player, ITEM_DATA), ui.js (renderInventory, addMessage).
 * @param {string} itemId - L'ID dell'oggetto da rimuovere.
 * @param {number} quantityToRemove - La quantità da rimuovere. Rimuove tutto se quantityToRemove <= 0.
 * @returns {boolean} True se l'oggetto è stato trovato e rimosso (parzialmente o totalmente), false altrimenti.
 */
function removeItemFromInventory(itemId, quantityToRemove = 0) {
     // Verifica che l'inventario sia inizializzato
     if (!player || !Array.isArray(player.inventory)) {
         console.error("removeItemFromInventory: Dati giocatore/inventario non validi.");
         return false;
     }

    const itemIndex = player.inventory.findIndex(slot => slot.itemId === itemId);

    // Se l'oggetto non è nell'inventario
    if (itemIndex === -1) {
        // console.warn(`removeItemFromInventory: Oggetto con ID '${itemId}' non trovato nell'inventario.`); // Log di debug rimosso
        return false;
    }

    const itemInfo = ITEM_DATA[itemId]; // Usato solo per il nome nel log
    const itemName = itemInfo ? itemInfo.name : itemId;
    const currentQuantityInSlot = player.inventory[itemIndex].quantity;
    // console.log(`DEBUG: removeItemFromInventory - INIZIO. Item: ${itemId}, quantityToRemove: ${quantityToRemove}, currentQuantityInSlot: ${currentQuantityInSlot}`); // NUOVO LOG

    // Se quantityToRemove <= 0, rimuovi l'intero stack
    if (quantityToRemove <= 0 || quantityToRemove >= currentQuantityInSlot) {
        // console.log(`DEBUG: removeItemFromInventory - Condizione VERA (rimozione stack). quantityToRemove (${quantityToRemove}) confrontato con currentQuantityInSlot (${currentQuantityInSlot}).`); // NUOVO LOG
        const removedQuantity = player.inventory[itemIndex].quantity;
        player.inventory.splice(itemIndex, 1); // Rimuovi l'elemento dall'array

         // console.log(`Rimosso intero stack di ${itemName} (x${removedQuantity}) dall'inventario.`); // Log di debug
        addMessage(`Hai perso ${itemName} (x${removedQuantity}).`, 'info');

    } else {
        // Altrimenti, riduci la quantità
        // console.log(`DEBUG: removeItemFromInventory - Condizione FALSA (riduzione quantità). quantityToRemove (${quantityToRemove}) confrontato con currentQuantityInSlot (${currentQuantityInSlot}).`); // NUOVO LOG
        player.inventory[itemIndex].quantity -= quantityToRemove;
         // console.log(`Rimosso ${quantityToRemove}x ${itemName} dall'inventario. Rimanenti: ${player.inventory[itemIndex].quantity}.`); // Log di debug
        addMessage(`Hai perso ${itemName} (x${quantityToRemove}).`, 'info');
    }

    // Aggiorna la visualizzazione dell'inventario
    if (typeof renderInventory === 'function') {
        renderInventory();
    } else {
        console.warn("removeItemFromInventory: renderInventory non disponibile.");
    }

    return true;
}


/**
 * Applica l'effetto di un oggetto utilizzabile.
 * Chiamato quando il giocatore seleziona "Usa" da un oggetto nell'inventario.
 * Dipende da: game_constants.js (player, ITEM_DATA, STATO, ...costanti status/probabilità),
 * game_utils.js (addMessage, getRandomText, getRandomInt, performSkillCheck), ui.js (renderStats, renderInventory, closeEventPopup).
 * Richiede endGame (game_core.js).
 * @param {string} itemId - L'ID dell'oggetto da usare.
 */
function useItem(itemId) {
    const itemIndex = player.inventory.findIndex(slot => slot.itemId === itemId);
    if (itemIndex === -1) {
        addMessage("Oggetto non trovato nell'inventario.", "error");
        closeEventPopup();
        return;
    }

    const itemSlot = player.inventory[itemIndex];
    const itemInfo = ITEM_DATA[itemSlot.itemId];

    if (!itemInfo || !itemInfo.usable) {
        addMessage("Questo oggetto non può essere usato.", "warning");
        closeEventPopup();
        return;
    }

    // Gestione Kit di Riparazione (logica speciale)
    if (itemInfo.effects && itemInfo.effects.some(e => e.type === 'repair_item_type')) {
        showRepairItemPopup(itemSlot.itemId); // Passa l'ID del kit di riparazione
        // Il consumo del kit avviene dopo la selezione dell'oggetto da riparare
        return;
    }
    
    // Gestione Progetti (Blueprints)
    if (itemInfo.effects && itemInfo.effects.some(e => e.type === 'learn_recipe')) {
        const recipeEffect = itemInfo.effects.find(e => e.type === 'learn_recipe');
        if (recipeEffect && recipeEffect.recipeKey) {
            learnRecipe(recipeEffect.recipeKey, itemSlot.itemId); // Passa l'ID del blueprint per consumarlo
        } else {
            addMessage("Errore: Progetto non valido.", "error");
        }
        closeEventPopup();
        renderInventory();
        renderCraftingRecipes(); // Aggiorna la UI del crafting
        return;
    }


    let effectApplied = false;
    let feedbackMessage = "";

    if (itemInfo.effects) {
        itemInfo.effects.forEach(effect => {
            let currentEffectApplied = true; // Flag per tracciare se l'effetto corrente è stato applicato
            switch (effect.type) {
                case 'add_resource':
                    if (player.hasOwnProperty(effect.resource_type)) {
                        const oldValue = player[effect.resource_type];
                        player[effect.resource_type] = Math.min(player[`max${effect.resource_type.charAt(0).toUpperCase() + effect.resource_type.slice(1)}`], oldValue + effect.amount);
                        const diff = player[effect.resource_type] - oldValue;
                        if (diff > 0) {
                            feedbackMessage += `${effect.resource_type === 'hp' ? 'HP' : effect.resource_type.charAt(0).toUpperCase() + effect.resource_type.slice(1)} +${diff}. `;
                        } else {
                            feedbackMessage += `${effect.resource_type === 'hp' ? 'HP' : effect.resource_type.charAt(0).toUpperCase() + effect.resource_type.slice(1)} al massimo. `;
                        }
                    } else {
                        console.warn(`Risorsa ${effect.resource_type} non trovata nel giocatore.`);
                        currentEffectApplied = false;
                    }
                    break;
                case 'add_resource_poisonable':
                    if (player.hasOwnProperty(effect.resource_type)) {
                        const oldValue = player[effect.resource_type];
                        player[effect.resource_type] = Math.min(player[`max${effect.resource_type.charAt(0).toUpperCase() + effect.resource_type.slice(1)}`], oldValue + effect.amount);
                        const diff = player[effect.resource_type] - oldValue;
                        if (diff > 0) {
                            feedbackMessage += `${effect.resource_type.charAt(0).toUpperCase() + effect.resource_type.slice(1)} +${diff}. `;
                        } else {
                            feedbackMessage += `${effect.resource_type.charAt(0).toUpperCase() + effect.resource_type.slice(1)} al massimo. `;
                        }
                        if (Math.random() < (effect.poison_chance || 0)) {
                            player.isPoisoned = true;
                            feedbackMessage += "Ti senti nauseato... Sei stato avvelenato! ";
                            // Potrebbe essere utile un checkAndLogStatusMessages qui o dopo
                        }
                    } else {
                        console.warn(`Risorsa ${effect.resource_type} non trovata nel giocatore.`);
                        currentEffectApplied = false;
                    }
                    break;
                case 'add_resource_sickness':
                     if (player.hasOwnProperty(effect.resource_type)) {
                        const oldValue = player[effect.resource_type];
                        player[effect.resource_type] = Math.min(player[`max${effect.resource_type.charAt(0).toUpperCase() + effect.resource_type.slice(1)}`], oldValue + effect.amount);
                        const diff = player[effect.resource_type] - oldValue;
                        if (diff > 0) {
                            feedbackMessage += `${effect.resource_type.charAt(0).toUpperCase() + effect.resource_type.slice(1)} +${diff}. `;
                        } else {
                            feedbackMessage += `${effect.resource_type.charAt(0).toUpperCase() + effect.resource_type.slice(1)} al massimo. `;
                        }
                        if (Math.random() < (effect.sickness_chance || 0)) {
                            player.isSick = true;
                            feedbackMessage += "Un brivido ti percorre la schiena... Ti senti male. ";
                        }
                    } else {
                        console.warn(`Risorsa ${effect.resource_type} non trovata nel giocatore.`);
                        currentEffectApplied = false;
                    }
                    break;
                case 'cure_status':
                    if (player.hasOwnProperty(effect.status_cured) && player[effect.status_cured]) {
                        if (Math.random() < (effect.chance || 1.0)) {
                            player[effect.status_cured] = false;
                            feedbackMessage += `${effect.success_message || `${effect.status_cured.replace('is', '')} curato.`} `;
                            if (effect.heal_hp_on_success && effect.heal_hp_on_success > 0) {
                                const oldHp = player.hp;
                                player.hp = Math.min(player.maxHp, player.hp + effect.heal_hp_on_success);
                                const hpGained = player.hp - oldHp;
                                if (hpGained > 0) feedbackMessage += `Recuperati +${hpGained} HP. `;
                            }
                        } else {
                            feedbackMessage += `${effect.failure_message || `Non ha avuto effetto su ${effect.status_cured.replace('is', '')}.`} `;
                            currentEffectApplied = false; // L'effetto principale (cura) non è avvenuto
                        }
                    } else {
                        const statusName = effect.status_cured.replace('is', '').toLowerCase();
                const statusTranslation = statusName === 'injured' ? 'ferita' : statusName === 'sick' ? 'malattia' : statusName;
                feedbackMessage += `Nessuna ${statusTranslation} da curare. `;
                        currentEffectApplied = false; // Non c'era nulla da curare, quindi l'effetto non si è "applicato" in senso stretto
                    }
                    break;
                case 'random_pill_effect': // Pillole Sospette
                    applyRandomPillEffect(); // Questa funzione dovrebbe generare il suo feedbackMessage e settare effectApplied
                    // Per ora, assumiamo che applyRandomPillEffect chiami addMessage e gestisca l'effetto.
                    // Per coerenza, potremmo farla ritornare il messaggio e lo stato.
                    // Ma per ora, la lasciamo così.
                    effectApplied = true; // Assumiamo che qualcosa succeda sempre
                    break;
                // Altri tipi di effetti...
                default:
                    console.warn(`Tipo di effetto sconosciuto: ${effect.type}`);
                    feedbackMessage += `Effetto ${effect.type} non riconosciuto. `;
                    currentEffectApplied = false;
            }
            if (currentEffectApplied) effectApplied = true; // Se anche solo un sub-effetto è applicato, l'uso generale è considerato valido.
        });
    } else {
        feedbackMessage = "Questo oggetto non ha effetti diretti se usato così.";
        // effectApplied rimane false
    }

    if (effectApplied) {
        // === ESPERIENZA PER USO OGGETTI ===
        if (typeof awardExperience === 'function') {
            let expAmount = 2; // Esperienza base per uso oggetto
            
            // Bonus per oggetti curativi
            if (itemInfo.effects && itemInfo.effects.some(e => e.type === 'cure_status' || e.type === 'add_resource')) {
                expAmount += 1;
            }
            
            // Bonus per oggetti rischiosi (pillole sospette, ecc.)
            if (itemInfo.effects && itemInfo.effects.some(e => e.type === 'random_pill_effect' || e.type === 'add_resource_poisonable')) {
                expAmount += 2;
            }
            
            awardExperience(expAmount, `uso ${itemInfo.nameShort || itemInfo.name}`);
        }
        
        // Gestione consumo porzioni
        if (itemSlot.hasOwnProperty('current_portions') && itemSlot.max_portions > 1) {
            itemSlot.current_portions -= 1;
            feedbackMessage = `Hai usato una porzione di ${itemInfo.nameShort || itemInfo.name}. ` + feedbackMessage;
            if (itemSlot.current_portions <= 0) {
                player.inventory.splice(itemIndex, 1);
                feedbackMessage += ` Hai finito ${itemInfo.nameShort || itemInfo.name}.`;
            }
        } else {
            // Consumo oggetto normale (non multiporzione o multiporzione con solo 1 porzione rimasta non gestita dal blocco sopra)
            itemSlot.quantity -= 1;
            if (itemSlot.quantity <= 0) {
                player.inventory.splice(itemIndex, 1);
            }
             feedbackMessage = `Hai usato ${itemInfo.nameShort || itemInfo.name}. ` + feedbackMessage;
        }
        addMessage(feedbackMessage.trim(), "success");
    } else {
        if (!feedbackMessage.includes("Nessun") && !feedbackMessage.includes("al massimo")) { // Non mostrare "non ha avuto effetto" se era già al massimo o non c'era status
            addMessage(`${itemInfo.nameShort || itemInfo.name} non ha avuto effetto.`, "neutral");
        } else if (feedbackMessage) { // Se c'è un messaggio (es. "HP al massimo") mostralo
            addMessage(feedbackMessage.trim(), "neutral");
        }
    }

    renderStats();
    renderInventory();
    closeEventPopup();
    checkAndLogStatusMessages(); // Aggiorna i messaggi di stato dopo l'uso dell'oggetto
}


/**
 * Equipaggia un oggetto (arma o armatura).
 * Chiamato quando il giocatore seleziona "Equipaggia" da un oggetto nell'inventario.
 * Dipende da: game_constants.js (player, ITEM_DATA), ui.js (renderStats, renderInventory, closeEventPopup, addMessage).
 * @param {string} itemId - L'ID dell'oggetto da equipaggiare.
 */
function equipItem(itemId) {
    // console.log(`equipItem: Tentativo di equipaggiare item '${itemId}'`); // Log di debug

    const itemInfo = ITEM_DATA[itemId];
    // Trova l'oggetto nell'inventario (trova il primo slot che contiene l'itemId)
    const itemIndexInInventory = player.inventory.findIndex(slot => slot.itemId === itemId);

    // Verifiche preliminari
    if (itemIndexInInventory === -1 || !itemInfo) {
        console.error(`equipItem: Oggetto '${itemId}' non trovato nell'inventario o nei dati.`);
        addMessage("Errore nell'equipaggiare l'oggetto.", "warning");
        if (typeof closeEventPopup === 'function') closeEventPopup();
        return;
    }
    if (itemInfo.type !== 'weapon' && itemInfo.type !== 'armor') {
        console.warn(`equipItem: Oggetto '${itemId}' non è un'arma o un'armatura, non può essere equipaggiato.`);
        addMessage(`${itemInfo.name} non può essere equipaggiato.`, "warning");
        if (typeof closeEventPopup === 'function') closeEventPopup();
        return;
    }
    // Anche se non stackable, potremmo avere più copie nell'inventario in slot separati.
    // L'equipaggiamento rimuove SEMPRE lo slot selezionato.

    // Recupera l'intero oggetto slot dall'inventario
    const itemToEquip = player.inventory[itemIndexInInventory];

    // Determina lo slot di equipaggiamento corretto ('equippedWeapon' o 'equippedArmor')
    let equippedSlotKey;
    if (itemInfo.type === 'weapon') {
        equippedSlotKey = 'equippedWeapon';
    } else { // itemInfo.type === 'armor'
        equippedSlotKey = 'equippedArmor';
    }

    // Salva l'oggetto attualmente equipaggiato (se esiste)
    const previouslyEquippedObject = player[equippedSlotKey]; // { itemId, currentDurability } o null

    // 1. Rimuovi il NUOVO oggetto dallo slot dell'inventario da cui è stato selezionato
    player.inventory.splice(itemIndexInInventory, 1);

    // 2. Se c'era un oggetto equipaggiato prima, rimettilo nell'inventario preservando la sua currentDurability
    if (previouslyEquippedObject) {
        if (player.inventory.length < MAX_INVENTORY_SLOTS) {
            player.inventory.push({
                itemId: previouslyEquippedObject.itemId,
                quantity: 1,
                currentDurability: previouslyEquippedObject.currentDurability
            });
            const oldItemInfo = ITEM_DATA[previouslyEquippedObject.itemId];
            addMessage(`Hai rimosso ${oldItemInfo?.name || 'oggetto sconosciuto'} e riposto nell'inventario.`, 'info');
        } else {
            const oldItemInfo = ITEM_DATA[previouslyEquippedObject.itemId];
            addMessage(`Hai rimosso ${oldItemInfo?.name || 'oggetto sconosciuto'}, ma l'inventario è pieno! L'oggetto è andato perso.`, 'warning');
        }
    }

    // 3. Equipaggia il nuovo oggetto impostando il suo ID e currentDurability nello slot del giocatore
    player[equippedSlotKey] = {
        itemId: itemToEquip.itemId,
        currentDurability: itemToEquip.currentDurability
    };

    // 4. Aggiorna la UI
    if (typeof renderInventory === 'function') renderInventory(); else console.warn("equipItem: renderInventory non disponibile.");
    if (typeof renderStats === 'function') renderStats(); else console.warn("equipItem: renderStats non disponibile.");

    // 5. Logga un messaggio di successo
    addMessage(`Hai equipaggiato ${itemInfo.name}.`, 'success', true);

    // 6. (RIMOSSA) La chiusura del popup sarà gestita dalla funzione chiamante
}


/**
 * Rimuove l'oggetto equipaggiato dallo slot specificato e lo rimette nell'inventario.
 * Non c'è un'opzione diretta "Rimuovi" nell'UI attuale, ma questa funzione è utile
 * e potrebbe essere esposta tramite un popup futuro o chiamata da altre logiche.
 * Dipende da: game_constants.js (player, ITEM_DATA), ui.js (renderStats, renderInventory, addMessage).
 * @param {'equippedWeapon' | 'equippedArmor'} slotKey - La chiave dello slot da cui rimuovere ('equippedWeapon' o 'equippedArmor').
 * @returns {boolean} True se un oggetto è stato rimosso, false altrimenti.
 */
function unequipItem(slotKey) {
    // Verifica che la chiave dello slot sia valida
    if (slotKey !== 'equippedWeapon' && slotKey !== 'equippedArmor') {
        console.error(`unequipItem: Chiave slot '${slotKey}' non valida.`);
        return false;
    }
     // Verifica che il giocatore esista
     if (!player) {
         console.error("unequipItem: Dati giocatore non validi.");
         return false;
     }

    const equippedObject = player[slotKey];

    // 1. Verifica se c'è un oggetto equipaggiato in quello slot
    if (!equippedObject) {
        return false;
    }

    // Verifica che l'ID dell'oggetto equipaggiato esista nei dati
    const itemInfo = ITEM_DATA[equippedObject.itemId];
    if (!itemInfo) {
        console.error(`unequipItem: Dati non trovati per l'oggetto equipaggiato '${equippedObject.itemId}' nello slot '${slotKey}'.`);
        player[slotKey] = null; // Rimuovi comunque l'ID non valido dallo slot
        if (typeof renderStats === 'function') renderStats();
        addMessage(`Rimosso oggetto sconosciuto dallo slot equipaggiato.`, "warning");
        return false;
    }

    // 2. Aggiungi l'oggetto all'inventario (sempre quantity 1), preservando la currentDurability
    if (player.inventory.length < MAX_INVENTORY_SLOTS) {
        player.inventory.push({
            itemId: equippedObject.itemId,
            quantity: 1,
            currentDurability: equippedObject.currentDurability
        });
        addMessage(`Hai rimosso ${itemInfo.name} e riposto nell'inventario.`, 'info', true);
    } else {
        addMessage(`Hai rimosso ${itemInfo.name}, ma l'inventario è pieno! L'oggetto è andato perso.`, 'warning', true);
    }

    // 3. Libera lo slot di equipaggiamento
    player[slotKey] = null;

    // 4. Aggiorna la UI
    if (typeof renderInventory === 'function') renderInventory(); else console.warn("unequipItem: renderInventory non disponibile.");
    if (typeof renderStats === 'function') renderStats(); else console.warn("unequipItem: renderStats non disponibile.");

    return true; // Oggetto rimosso dallo slot, anche se non aggiunto all'inventario
}

/**
 * Rimuove un oggetto dall'inventario (lo "lascia cadere").
 * Chiamato quando il giocatore seleziona "Lascia" da un oggetto nell'inventario.
 * Dipende da: game_constants.js (player, ITEM_DATA), ui.js (renderInventory, closeEventPopup, addMessage).
 * @param {string} itemId - L'ID dell'oggetto da lasciare.
 * @param {number} quantity - La quantità presente nell'inventario (attualmente non usata, rimuove l'intero stack).
 */
function dropItem(itemId, quantity) { // Aggiunto parametro quantity anche se non usato per ora
     // console.log(`dropItem: Tentativo di lasciare item '${itemId}' (x${quantity})`); // Log di debug

    const itemIndex = player.inventory.findIndex(slot => slot.itemId === itemId);

    if (itemIndex === -1) {
        console.error(`dropItem: Oggetto '${itemId}' non trovato nell'inventario.`);
        addMessage(`Errore: Non puoi lasciare un oggetto che non hai.`, "error");
        if (typeof closeEventPopup === 'function') closeEventPopup();
        return;
    }

    const itemInfo = ITEM_DATA[itemId];
    const itemName = itemInfo ? itemInfo.name : "Oggetto sconosciuto";
    const droppedQuantity = player.inventory[itemIndex].quantity; // Quanto viene effettivamente lasciato

    // Rimuove l'oggetto (intero stack) dall'inventario
    player.inventory.splice(itemIndex, 1);
    // console.log(`dropItem: Rimosso intero stack di ${itemName} (x${droppedQuantity}) dall'inventario.`); // Log di debug

    // Logga un messaggio
    addMessage(`Hai lasciato ${itemName} (x${droppedQuantity}).`, 'info', true);

    // Aggiorna la UI dell'inventario
    if (typeof renderInventory === 'function') {
        renderInventory();
    } else {
        console.warn("dropItem: renderInventory non disponibile.");
    }
    // Non necessario aggiornare renderStats per drop

    // Chiude il popup dell'azione oggetto
    if (typeof closeEventPopup === 'function') closeEventPopup(); else console.warn("dropItem: closeEventPopup non disponibile.");
}

/**
 * Mostra un popup per selezionare quale arma riparare con un kit di riparazione.
 * Chiamato dall'effetto 'repair_weapon' di un kit.
 * Dipende da: game_constants.js (player, ITEM_DATA), ui.js (showEventPopup, closeEventPopup, addMessage).
 * Richiede applyRepair (definita qui sotto).
 * @param {string} repairKitId - ID del kit di riparazione usato.
 * @param {number} repairAmount - Quantità di durabilità da ripristinare.
 */
function showRepairItemTypePopup(repairKitId, repairAmount) {
    // Costruisci la lista delle istanze riparabili
    const repairableItemsInstances = [];

    // Controlla l'arma equipaggiata
    if (player.equippedWeapon && player.equippedWeapon.itemId) {
        const weaponInstance = player.equippedWeapon;
        const weaponTemplate = ITEM_DATA[weaponInstance.itemId];
        if (weaponTemplate && typeof weaponInstance.currentDurability === 'number' && typeof weaponTemplate.maxDurability === 'number' && weaponInstance.currentDurability < weaponTemplate.maxDurability) {
            repairableItemsInstances.push({ 
                instanceId: { type: 'equipped', slotKey: 'equippedWeapon' }, 
                itemId: weaponInstance.itemId,
                name: weaponTemplate.name, 
                currentDurability: weaponInstance.currentDurability, 
                maxDurability: weaponTemplate.maxDurability,
                isEquipped: true
            });
        }
    }

    // Controlla l'armatura equipaggiata
    if (player.equippedArmor && player.equippedArmor.itemId) {
        const armorInstance = player.equippedArmor;
        const armorTemplate = ITEM_DATA[armorInstance.itemId];
        if (armorTemplate && typeof armorInstance.currentDurability === 'number' && typeof armorTemplate.maxDurability === 'number' && armorInstance.currentDurability < armorTemplate.maxDurability) {
            repairableItemsInstances.push({ 
                instanceId: { type: 'equipped', slotKey: 'equippedArmor' }, 
                itemId: armorInstance.itemId,
                name: armorTemplate.name, 
                currentDurability: armorInstance.currentDurability, 
                maxDurability: armorTemplate.maxDurability,
                isEquipped: true
            });
        }
    }

    // Controlla l'inventario
    player.inventory.forEach((slot, index) => {
        if (slot && slot.itemId && typeof slot.currentDurability === 'number') {
            const itemTemplate = ITEM_DATA[slot.itemId];
            if (itemTemplate && typeof itemTemplate.maxDurability === 'number' && slot.currentDurability < itemTemplate.maxDurability) {
                repairableItemsInstances.push({
                    instanceId: { type: 'inventory', index: index },
                    itemId: slot.itemId,
                    name: itemTemplate.name,
                    currentDurability: slot.currentDurability,
                    maxDurability: itemTemplate.maxDurability,
                    isEquipped: false
                });
            }
        }
    });

    // Se non ci sono armi o armature da riparare, informa il giocatore e chiudi il popup
    if (repairableItemsInstances.length === 0) {
        addMessage("Non hai equipaggiamento che necessita riparazione.", "info");
        if (typeof closeEventPopup === 'function') closeEventPopup();
        return;
    }

    // Crea il titolo e la descrizione del popup
    const popupTitle = "Seleziona equipaggiamento da riparare";
    const popupDescription = `Scegli quale oggetto riparare con il Kit di Riparazione (+${repairAmount} durabilità):`;

    // Crea le scelte del popup, una per ogni oggetto riparabile
    const popupChoices = repairableItemsInstances.map(instance => {
        const locationText = instance.isEquipped ? " (Equipaggiato)" : ` (Inventario)`;
        return {
            text: `${instance.name}${locationText} (${Math.floor(instance.currentDurability)}/${instance.maxDurability})`,
            action: () => applyRepair(repairKitId, instance.instanceId, repairAmount, instance.itemId)
        };
    });

    // Aggiungi l'opzione per annullare
    popupChoices.push({
        text: "Annulla",
        action: () => {
             addMessage("Riparazione annullata.", "info"); // Logga annullamento
             if (typeof closeEventPopup === 'function') closeEventPopup();
        }
    });

    // Mostra il popup di selezione equipaggiamento
    if (typeof showEventPopup === 'function') {
        const dataForPopup = {
            title: popupTitle,
            description: popupDescription,
            choices: popupChoices,
            isActionPopup: true, // Flag per indicare che è un popup di azione (gestito diversamente da handleChoiceContainerClick)
            originalActionDetails: { repairKitId: repairKitId, repairAmount: repairAmount, type: 'repair' }
        };
        savedActionPopupContext = dataForPopup; 
        showEventPopup(dataForPopup);
    } else {
        console.error("showRepairItemTypePopup: showEventPopup non disponibile.");
        addMessage("Errore nel mostrare le opzioni di riparazione.", "danger");
    }
}


/**
 * Applica la riparazione all'arma/armatura selezionata e consuma il kit.
 * Chiamato dall'azione del popup di selezione equipaggiamento.
 * Dipende da: game_constants.js (player, ITEM_DATA), ui.js (renderStats, renderInventory, closeEventPopup, addMessage).
 * Richiede removeItemFromInventory (definita qui).
 * @param {string} repairKitId - ID del kit di riparazione usato.
 * @param {string} targetItemId - ID dell'arma o armatura da riparare.
 * @param {number} repairAmount - Quantità di durabilità da ripristinare.
 */
function applyRepair(repairKitId, instanceIdentifier, repairAmount, targetBaseItemId) {
    let targetItemInstance = null;
    if (instanceIdentifier.type === 'equipped') {
        targetItemInstance = player[instanceIdentifier.slotKey];
    } else if (instanceIdentifier.type === 'inventory' && player.inventory[instanceIdentifier.index] && player.inventory[instanceIdentifier.index].itemId === targetBaseItemId) {
        targetItemInstance = player.inventory[instanceIdentifier.index];
    }

    const itemInfoTemplate = ITEM_DATA[targetBaseItemId];

    // Verifiche finali
    if (!targetItemInstance || !itemInfoTemplate || (itemInfoTemplate.type !== 'weapon' && itemInfoTemplate.type !== 'armor') ||
        targetItemInstance.currentDurability === undefined || itemInfoTemplate.maxDurability === undefined) {
        console.error(`applyRepair: Oggetto target '${targetBaseItemId}' non valido per riparazione.`);
        addMessage(`Impossibile riparare l'oggetto selezionato (${itemInfoTemplate?.name || targetBaseItemId}).`, "error");
        if (typeof closeEventPopup === 'function') closeEventPopup();
        return;
    }

    // Anche se showRepairItemTypePopup filtra, ricontrolliamo che l'arma non sia già al massimo
    if (targetItemInstance.currentDurability >= itemInfoTemplate.maxDurability) {
        addMessage(`${itemInfoTemplate.name} è già in perfette condizioni.`, "info");
        if (typeof closeEventPopup === 'function') closeEventPopup();
        return;
    }

    // Consuma il kit di riparazione (sempre 1 quantità per uso)
    const kitConsumed = removeItemFromInventory(repairKitId, 1);

    if (!kitConsumed) {
        console.error(`applyRepair: Kit di riparazione '${repairKitId}' non trovato nell'inventario!`);
        addMessage("Errore: Kit di riparazione non trovato durante l'applicazione.", "danger");
        if (typeof closeEventPopup === 'function') closeEventPopup();
        return;
    }

    // Applica la riparazione all'oggetto target
    const oldDurability = targetItemInstance.currentDurability;
    targetItemInstance.currentDurability = Math.min(itemInfoTemplate.maxDurability, targetItemInstance.currentDurability + repairAmount);
    const actualRepair = targetItemInstance.currentDurability - oldDurability;

    // Aggiorna la UI (stats per equipaggiamento, inventario se era lì)
    if (typeof renderInventory === 'function') renderInventory(); else console.warn("applyRepair: renderInventory non disponibile.");
    if (typeof renderStats === 'function') renderStats(); else console.warn("applyRepair: renderStats non disponibile.");

    // Logga un messaggio di successo
    addMessage(`Hai riparato ${itemInfoTemplate.name} (+${actualRepair} durabilità).`, "success", true);

    // Chiude il popup di selezione equipaggiamento (che era stato aperto da showRepairItemTypePopup)
    if (typeof closeEventPopup === 'function') closeEventPopup(); else console.warn("applyRepair: closeEventPopup non disponibile.");
}


/**
 * Ottiene una stringa HTML per visualizzare le statistiche dettagliate di un oggetto (arma/armatura)
 * nel tooltip.
 * Dipende da: game_data.js (ITEM_DATA), game_constants.js (TIPO_ARMA_LABELS), game_utils.js (getTipoArmaLabel, getItemEffectsText).
 * Usata da showItemTooltip (in ui.js).
 * (Duplicata qui per chiarezza, ma dovrebbe risiedere in ui.js idealmente).
 * @param {object} itemInfo - L'oggetto dati dell'item da ITEM_DATA.
 * @returns {string} Stringa HTML con le statistiche formattate o vuota.
 */
// NOTA: Questa funzione è già definita in ui.js. Dobbiamo decidere dove tenerla.
// Dato che è usata solo per il rendering UI (tooltip), la sua posizione logica è in ui.js.
// La rimuoviamo da qui per evitare duplicazione. Se ui.js non la esporta,
// potrebbe essere necessario un approccio diverso (es. renderItemDetails nel tooltip template).
// Per ora, assumiamo che la versione in ui.js sia quella canonica e accessibile.
/*
function getItemDetailsHTML(itemInfo) {
    // ... codice ... (rimosso per evitare duplicazione con ui.js)
}
*/

// --- Gestione click sull'inventario (per mostrare popup azioni) ---
// Questo listener è attaccato al container inventoryList in game_core.js (setupInputListeners).
// Dipende da: game_constants.js (gamePaused), ui.js (showItemActionPopup).
/**
 * Gestisce i click sull'elenco dell'inventario (via delegation).
 * Mostra il popup delle azioni disponibili per l'oggetto cliccato.
 * Dipende da: game_constants.js (gamePaused), ui.js (showItemActionPopup).
 * @param {Event} event - L'oggetto evento click.
 */
function handleInventoryClick(event) {
    // Non permettere interazione inventario se il gioco è in pausa (es. evento aperto)
    if (gamePaused) {
        // console.log("handleInventoryClick: Gioco in pausa, inventario bloccato."); // Log di debug rimosso
        return;
    }

    // Trova l'elemento <li> più vicino all'elemento cliccato che ha l'attributo data-item-id
    const clickedLi = event.target.closest('li[data-item-id]');

    // Se è stato trovato un elemento lista di oggetto
    if (clickedLi) {
        const itemId = clickedLi.dataset.itemId; // Ottiene l'ID dell'oggetto dal data attribute
        // Verifica che l'itemId sia valido
        if (itemId && ITEM_DATA[itemId]) {
            // console.log(`Inventario cliccato: itemId=${itemId}`); // Log di debug
            // Chiama la funzione UI per mostrare il popup delle azioni dell'oggetto
            if (typeof showItemActionPopup === 'function') {
                showItemActionPopup(itemId);
            } else {
                console.error("handleInventoryClick: showItemActionPopup non disponibile in ui.js!");
                addMessage(`Errore nell'interazione con ${ITEM_DATA[itemId].name}.`, "danger");
            }
        } else {
             console.warn(`Inventario cliccato: Elemento lista trovato ma itemId '${itemId}' non valido o non trovato in ITEM_DATA.`);
             // Non fare nulla, l'elemento potrebbe essere il messaggio "Inventario Vuoto"
        }
    }
    // Se il click non era su un elemento <li> di un oggetto, non fare nulla.
}

/**
 * Mostra un popup con le azioni disponibili per un oggetto dell'inventario.
 * Costruisce l'evento popup e lo passa alla funzione UI per la visualizzazione.
 * Dipende da: game_constants.js (player, ITEM_DATA), ui.js (showEventPopup, closeEventPopup, getItemDetailsHTML).
 * Richiede useItem, equipItem, dropItem, showRepairItemTypePopup (definite qui).
 * @param {string} itemId - L'ID dell'oggetto selezionato.
 * @param {string} [source='inventory'] - La provenienza dell'oggetto ('inventory' o 'equipped').
 */
function showItemActionPopup(itemId, source = 'inventory') {
    if (DEBUG_MODE) console.log(`[showItemActionPopup] CHIAMATA con itemId: ${itemId}, source: ${source}`);
    const item = ITEM_DATA[itemId];
    if (!item) {
        console.error("showItemActionPopup: Item non trovato in ITEM_DATA:", itemId);
        return;
    }
    // ... (setup popup)
    let itemInstance = null;
    if (source === 'equipped') {
        if (item.type === 'weapon' && player.equippedWeapon && player.equippedWeapon.itemId === itemId) {
            itemInstance = player.equippedWeapon;
        } else if (item.type === 'armor' && player.equippedArmor && player.equippedArmor.itemId === itemId) {
            itemInstance = player.equippedArmor;
        }
    } else if (source === 'inventory') {
        itemInstance = player.inventory.find(slot => slot.itemId === itemId) || null;
    }
    if (DEBUG_MODE) console.log(`[showItemActionPopup] itemInstance TROVATO:`, JSON.stringify(itemInstance));
    if (!itemInstance) itemInstance = { itemId };

    if (typeof getItemDetailsHTML === 'function') {
        DOM.itemActionStats.innerHTML = getItemDetailsHTML(itemInstance);
    } else {
        DOM.itemActionStats.innerHTML = 'Dettagli statistiche non disponibili.';
    }

    // Svuota il contenitore delle scelte
    DOM.itemActionChoices.innerHTML = '';
    const itemTemplate = item; // Per chiarezza nel log richiesto
    const actions = [];
    if (DEBUG_MODE) console.log(`[showItemActionPopup] DEBUG INIZIALE: source='${source}', itemTemplate.type='${itemTemplate ? itemTemplate.type : "TEMPLATE NULLO"}'`);

    if (item.usable) {
        actions.push({ text: "Usa", handler: () => useItem(itemId), styleKey: 'use' });
    }
    if (source === 'inventory') {
        if (item.type === 'weapon' || item.type === 'armor') {
            actions.push({ text: "Equipaggia", handler: () => equipItem(itemId), styleKey: 'equip' });
        }
        actions.push({ text: "Lascia", handler: () => dropItem(itemId, 1), styleKey: 'drop' });
    } else if (source === 'equipped') {
        if (DEBUG_MODE) console.log("[showItemActionPopup] DEBUG EQUIP: Entrato nel blocco source === 'equipped'. Aggiungo tasto Rimuovi.");
        actions.push({ text: "Rimuovi", handler: () => unequipItem(item.type === 'weapon' ? 'equippedWeapon' : 'equippedArmor'), styleKey: 'unequip' });
    }

    // Crea i bottoni tramite JavaScript e assegna l'onclick richiesto
    actions.forEach(action => {
        const button = document.createElement('button');
        button.textContent = action.text;
        button.className = `action-button action-${action.styleKey || 'default'}`;
        button.onclick = () => {
            if (DEBUG_MODE) console.log(`[showItemActionPopup] Bottone AZIONE '${action.text}' CLICCATO per item ${itemId}`);
            action.handler(); // Esegue l'azione (es. useItem, equipItem, unequipItem, dropItem)
            if (DEBUG_MODE) console.log(`[showItemActionPopup] Chiamo closeItemActionPopup() DOPO azione '${action.text}'`);
            if (typeof closeItemActionPopup === 'function') { 
                closeItemActionPopup();
            } else {
                if (DEBUG_MODE) console.error("[showItemActionPopup] ERRORE: Funzione closeItemActionPopup non trovata!");
            }
        };
        DOM.itemActionChoices.appendChild(button);
    });

    if (DEBUG_MODE) {
        console.log("[showItemActionPopup] DEBUG HTML SCELTE AZIONI:", DOM.itemActionChoices.innerHTML);
        const buttonsInPopup = DOM.itemActionChoices.querySelectorAll('button');
        console.log(`[showItemActionPopup] DEBUG BOTTONI AZIONE EFFETTIVI NEL DOM: ${buttonsInPopup.length}`);
        buttonsInPopup.forEach((btn, idx) => console.log(`    Bottone DOM ${idx}: '${btn.textContent}'`));
    }

    // Handler per il bottone di chiusura
    if (DOM.itemActionCloseButton) {
        DOM.itemActionCloseButton.onclick = () => {
            if (DEBUG_MODE) console.log('[showItemActionPopup] Bottone CHIUDI CLICCATO');
            if (typeof closeItemActionPopup === 'function') {
                closeItemActionPopup();
            } else {
                if (DEBUG_MODE) console.error("[showItemActionPopup] ERRORE: Funzione closeItemActionPopup non trovata al click su Chiudi!");
            }
        };
    }

    if (DEBUG_MODE) console.log('[showItemActionPopup] Sto per rendere visibile il popup');
    DOM.itemActionOverlay.classList.add('visible');
    DOM.itemActionPopup.classList.add('visible');

    eventScreenActive = true;
    gamePaused = true;
    if (typeof disableControls === 'function') disableControls();
}

function closeItemActionPopup() {
    if (DEBUG_MODE) console.log('[closeItemActionPopup] CHIAMATA');
    if (DOM.itemActionOverlay && DOM.itemActionPopup) {
        DOM.itemActionOverlay.classList.remove('visible');
        DOM.itemActionPopup.classList.remove('visible');
    }
    eventScreenActive = false;
    gamePaused = false;
    if (typeof enableControls === 'function') enableControls();
    if (DEBUG_MODE) console.log('[closeItemActionPopup] ESEGUITA. eventScreenActive:', eventScreenActive, 'gamePaused:', gamePaused);
    currentEventContext = null; 
}

/**
 * Tenta di riparare un oggetto usando un kit di riparazione.
 * @param {string} itemId - L'ID dell'oggetto da riparare.
 * @param {string} source - La provenienza dell'oggetto ('inventory' o 'equipped').
 * @param {number} index - L'indice dell'oggetto nell'inventario (se source è 'inventory'). Non usato se l'oggetto è equipaggiato.
 */
function attemptRepairItem(itemId, source, index) {
    const repairMaterialId = 'scrap_metal';
    const repairMaterialCost = 1;
    const repairAmount = 5; // Punti di durabilità ripristinati

    // Assicuriamoci che itemToRepair sia l'oggetto effettivo da ITEM_DATA e non solo un riferimento dall'inventario
    // (Anche se in questo flusso itemToRepair è già l'itemInfo, è una buona pratica se la funzione venisse chiamata da altri contesti)
    const actualItemData = ITEM_DATA[itemId];
    if (!actualItemData) {
        console.error(`attemptRepairItem: Impossibile trovare i dati per l'oggetto con ID ${itemId}`);
        showTemporaryMessage("Errore durante il tentativo di riparazione.");
        closeItemActionsPopup(); // Chiudi il popup in caso di errore grave
        return;
    }


    if (player.inventory.find(slot => slot.itemId === repairMaterialId && slot.quantity >= repairMaterialCost)) {
        // Consuma materiali
        removeItemFromInventory(repairMaterialId, repairMaterialCost); // removeItemFromInventory aggiorna già l'inventario UI e logga

        // Ripara l'oggetto (modificando direttamente l'oggetto in ITEM_DATA)
        const oldDurability = actualItemData.durability;
        actualItemData.durability = Math.min(actualItemData.maxDurability, actualItemData.durability + repairAmount);
        
        addMessage(`Hai riparato ${actualItemData.name} da ${Math.floor(oldDurability)}/${actualItemData.maxDurability} a ${actualItemData.durability}/${actualItemData.maxDurability} usando ${repairMaterialCost} ${ITEM_DATA[repairMaterialId].name}.`, 'success');

        // Aggiorna UI specifica dell'oggetto
        if (source === 'inventory') {
            // USA LA FUNZIONE UI CORRETTA
            if (typeof renderInventory === 'function') renderInventory(); else console.warn("attemptRepairItem: renderInventory non disponibile");
        } else if (source === 'equipped') {
            // USA LA FUNZIONE UI CORRETTA (renderStats aggiorna anche l'equip)
            if (typeof renderStats === 'function') renderStats(); else console.warn("attemptRepairItem: renderStats non disponibile");
        }
        
        // Aggiorna comunque le stats generali (anche se già fatto sopra per 'equipped')
        // Questo era updatePlayerStatsUI() -> diventa renderStats()
        if (typeof renderStats === 'function') renderStats(); else console.warn("attemptRepairItem: renderStats non disponibile per aggiornamento generale.");

        // Chiudi il popup delle azioni, dato che l'azione è stata completata
        // USA LA FUNZIONE UI CORRETTA
        if (typeof closeEventPopup === 'function') closeEventPopup(); else console.warn("attemptRepairItem: closeEventPopup non disponibile");
        
        // Il tooltip si aggiornerà automaticamente al prossimo hover se l'oggetto è ancora visibile
        // e la sua visualizzazione dipende dai dati aggiornati in ITEM_DATA.

    } else {
        addMessage(`Non hai abbastanza ${ITEM_DATA[repairMaterialId].name} per riparare ${actualItemData.name}.`, 'warning');
        showTemporaryMessage(`Materiali insufficienti: ${ITEM_DATA[repairMaterialId].name} (ne servono ${repairMaterialCost}).`);
        // Non chiudiamo il popup in caso di fallimento per materiali, così l'utente vede le altre opzioni.
    }
}


// Funzione di utilità per mostrare messaggi temporanei
function showTemporaryMessage(message, duration = 3000) {
    const messagePopup = document.getElementById('temporary-message-popup') || createTemporaryMessagePopup();
    messagePopup.textContent = message;
    messagePopup.style.display = 'block';
    // Clear any existing timeout to prevent multiple popups or premature closing
    if (messagePopup.timeoutId) {
        clearTimeout(messagePopup.timeoutId);
    }
    messagePopup.timeoutId = setTimeout(() => {
        messagePopup.style.display = 'none';
    }, duration);
}

function createTemporaryMessagePopup() {
    const popup = document.createElement('div');
    popup.id = 'temporary-message-popup';
    // Stile base, da migliorare in CSS
    popup.style.position = 'fixed';
    popup.style.bottom = '20px';
    popup.style.left = '50%';
    popup.style.transform = 'translateX(-50%)';
    popup.style.padding = '10px 20px';
    popup.style.backgroundColor = 'var(--bg-color)'; // Usa variabili CSS
    popup.style.color = 'var(--fg-color)';       // Usa variabili CSS
    popup.style.border = '1px solid var(--border-color)'; // Usa variabili CSS
    popup.style.borderRadius = '5px';
    popup.style.zIndex = '1002'; // Sopra il popup azioni, sotto eventuali popup di evento modali
    popup.style.display = 'none';
    popup.style.textAlign = 'center';
    popup.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
    document.body.appendChild(popup);
    return popup;
}


// --- Implementazione check ammo availability ---
// Dipende da: game_constants.js (player, ITEM_DATA). Usata da ui.js (renderStats).
/**
 * Controlla se il giocatore ha munizioni disponibili per l'arma equipaggiata.
 * Dipende da game_constants.js (player, ITEM_DATA).
 * @returns {{hasAmmo: boolean, message: string}} Un oggetto che indica la disponibilita e un messaggio di stato.
 */
function checkAmmoAvailability() {
    // Verifica che il giocatore e l'arma equipaggiata esistano
    if (!player || !player.equippedWeapon || !ITEM_DATA[player.equippedWeapon]) {
        return { hasAmmo: true, message: "" }; // Nessuna arma equipaggiata o arma non valida = non richiede munizioni
    }

    const weaponData = ITEM_DATA[player.equippedWeapon];

    // Verifica se l'arma richiede munizioni e ha un tipo di munizione definito
    if (!['fuoco', 'balestra', 'arco'].includes(weaponData.weaponType) || !weaponData.ammoType) {
        return { hasAmmo: true, message: "" }; // L'arma non richiede munizioni
    }

    // Cerca munizioni del tipo corretto nell'inventario
    const ammoSlot = player.inventory.find(slot => {
        const ammoItemInfo = ITEM_DATA[slot.itemId];
        return ammoItemInfo && ammoItemInfo.type === 'ammo' && ammoItemInfo.ammoType === weaponData.ammoType && slot.quantity > 0;
    });

    // Se non trova slot o quantità <= 0
    if (!ammoSlot) {
        const requiredAmmoName = ITEM_DATA[weaponData.ammoType]?.name || weaponData.ammoType;
        return {
            hasAmmo: false,
            message: ` (Senza ${requiredAmmoName})` // Messaggio da mostrare nella UI
        };
    }

    // Altrimenti, ha munizioni
    const requiredAmmoName = ITEM_DATA[weaponData.ammoType]?.name || weaponData.ammoType;
    return {
        hasAmmo: true,
        message: ` (${requiredAmmoName} x${ammoSlot.quantity})` // Mostra quantità attuale nella UI
    };
}

/**
 * Consuma una munizione per l'arma equipaggiata.
 * Chiamato dalla logica di combattimento negli eventi (events.js).
 * Dipende da: game_constants.js (player, ITEM_DATA, RECOVER_ARROW_BOLT_CHANCE), game_utils.js (addMessage, getRandomInt), ui.js (renderInventory).
 * @returns {{consumed: boolean, recovered: boolean}} Oggetto che indica se una munizione e stata consumata e se una e stata recuperata.
 */
function consumeAmmo() {
     // Verifica che il giocatore e l'arma equipaggiata esistano e richiedano munizioni
    if (!player || !player.equippedWeapon || !ITEM_DATA[player.equippedWeapon] || !ITEM_DATA[player.equippedWeapon].ammoType) {
        return { consumed: false, recovered: false }; // Nessuna arma o arma non valida/senza munizioni
    }

    const weaponData = ITEM_DATA[player.equippedWeapon];
    const ammoType = weaponData.ammoType;

    // Trova lo slot delle munizioni corrette nell'inventario
    const ammoSlotIndex = player.inventory.findIndex(slot => {
        const ammoItemInfo = ITEM_DATA[slot.itemId];
        return ammoItemInfo && ammoItemInfo.type === 'ammo' && ammoItemInfo.ammoType === ammoType && slot.quantity > 0;
    });

    // Se non trova slot o quantità <= 0, non consuma
    if (ammoSlotIndex === -1) {
         const requiredAmmoName = ITEM_DATA[ammoType]?.name || ammoType;
        // addMessage(`Hai bisogno di ${requiredAmmoName} per usare ${weaponData.name}.`, "warning"); // Questo messaggio potrebbe essere gestito meglio nel contesto di combattimento
        return { consumed: false, recovered: false };
    }

    // Consuma una munizione
    player.inventory[ammoSlotIndex].quantity--;
    // console.log(`Consumata 1 munizione di tipo ${ammoType}. Rimangono ${player.inventory[ammoSlotIndex].quantity}.`); // Log di debug

    // Se la quantità nello slot scende a 0, rimuovi lo slot dall'inventario
    if (player.inventory[ammoSlotIndex].quantity <= 0) {
        player.inventory.splice(ammoSlotIndex, 1);
        // console.log(`Rimosso slot munizioni di tipo ${ammoType} (quantità 0).`); // Log di debug
    }

    // Aggiorna la visualizzazione dell'inventario
    if (typeof renderInventory === 'function') {
        renderInventory();
    } else {
        console.warn("consumeAmmo: renderInventory non disponibile.");
    }

    let recovered = false;
    // Possibilità di recupero per munizioni recuperabili (frecce/dardi)
    // Tentativo di accedere a ammoItemInfo in modo sicuro
    const consumedAmmoSlot = player.inventory[ammoSlotIndex]; // Potrebbe essere undefined se lo slot è stato appena rimosso
    let consumedAmmoItemId = null;
    if (consumedAmmoSlot) {
        consumedAmmoItemId = consumedAmmoSlot.itemId;
    } else {
        // Se lo slot è stato rimosso, cerchiamo l'ID del tipo di munizione direttamente
        // Questo è un fallback e potrebbe non essere sempre accurato se ci sono più tipi di munizioni con lo stesso ammoType ma ID diversi.
        // Per frecce e dardi, assumiamo un ID standard.
        if (ammoType === 'dardi') consumedAmmoItemId = 'bolt';
        else if (ammoType === 'frecce') consumedAmmoItemId = 'arrow';
        // Altri tipi di munizioni recuperabili andrebbero aggiunti qui
    }
    const ammoItemInfo = consumedAmmoItemId ? ITEM_DATA[consumedAmmoItemId] : null;

    if (ammoItemInfo && ammoItemInfo.recuperabile && Math.random() < RECOVER_ARROW_BOLT_CHANCE) { // Usa costante per chance
        // Hai recuperato la munizione. Aggiungila all'inventario.
        addItemToInventory(ammoItemInfo.id, 1); // Aggiunge 1 munizione (addItemToInventory logga gia)
        recovered = true;
        addMessage(`Hai recuperato 1 ${ammoItemInfo.name}.`, 'success'); // Messaggio di recupero
        // console.log(`Recuperata 1 munizione di tipo ${ammoType}.`); // Log di debug
    }

    return { consumed: true, recovered: recovered };
}

// --- Implementazione riparazione armi/armature (Funzioni di supporto) ---
/**
 * Controlla se il giocatore ha abbastanza materiali per riparare un oggetto.
 * Questa versione è semplificata per la nuova logica di attemptRepairItem e non viene più usata direttamente nel flusso di riparazione tramite popup,
 * ma potrebbe essere utile per future meccaniche di crafting o riparazione avanzate.
 * Dipende da game_constants.js (player, ITEM_DATA).
 * @param {string} targetItemId - L'ID dell'oggetto da riparare.
 * @param {boolean} isCompletelyBroken - True se l'oggetto è completamente rotto (durabilità <= 0).
 * @returns {{hasMaterials: boolean, scrapNeeded: number, mechanicalPartsNeeded: number}} Dettagli sui materiali necessari e disponibilità.
 */
function checkRepairMaterials(targetItemId, isCompletelyBroken = false) {
    const targetItemInfo = ITEM_DATA[targetItemId];
    if (!targetItemInfo || (targetItemInfo.type !== 'weapon' && targetItemInfo.type !== 'armor')) {
        return { hasMaterials: false, scrapNeeded: 0, mechanicalPartsNeeded: 0 };
    }

    // Calcola materiali necessari in base allo stato dell'oggetto
    let scrapNeeded = 1; // Costo base di 1 rottame per la riparazione semplice attuale
    let mechanicalPartsNeeded = 0;

    // Logica più complessa per costi variabili potrebbe essere inserita qui se necessario
    // Esempio: se l'oggetto è molto danneggiato o rotto, aumenta il costo o richiedi parti meccaniche
    // const durabilityToRepair = targetItemInfo.maxDurability - targetItemInfo.durability;
    // if (isCompletelyBroken) {
    //     mechanicalPartsNeeded = Math.ceil(targetItemInfo.maxDurability / 10); 
    //     scrapNeeded = Math.max(scrapNeeded, Math.ceil(targetItemInfo.maxDurability / 3));
    // }

    // Controlla se il giocatore ha abbastanza materiali nell'inventario
    const scrapSlot = player.inventory.find(slot => slot.itemId === 'scrap_metal');
    const hasEnoughScrap = scrapSlot && scrapSlot.quantity >= scrapNeeded;

    let mechanicalPartsSlot = null;
    let hasEnoughParts = true; // Presume di avere abbastanza se non necessarie

    if (mechanicalPartsNeeded > 0) {
        mechanicalPartsSlot = player.inventory.find(slot => slot.itemId === 'mechanical_parts');
        hasEnoughParts = mechanicalPartsSlot && mechanicalPartsSlot.quantity >= mechanicalPartsNeeded;
    }

    return {
        hasMaterials: hasEnoughScrap && hasEnoughParts,
        scrapNeeded: scrapNeeded,
        mechanicalPartsNeeded: mechanicalPartsNeeded
    };
}

// --- Implementazione check & log status messages ---
// Dipende da: game_constants.js (player, STATO_MESSAGGI, ...altre costanti stato), game_utils.js (getRandomText, addMessage), ui.js (renderStats).
// Usata da map.js (movePlayer).
// (La funzione è stata spostata qui da ui.js perché logicamente legata allo stato del giocatore)

/**
 * Controlla lo stato attuale del giocatore (fame, sete, HP bassi, stati negativi)
 * e logga messaggi appropriati con una certa probabilità.
 * Aggiorna anche la UI delle stats.
 */
function checkAndLogStatusMessages() {
    if (!player || !gameActive) return;

    // Messaggi di stato (loggati con probabilità per non spammarli)
    const checkChance = 0.4; // Probabilità di loggare un messaggio di stato (40%)

    // Check HP bassi (Morente)
    if (player.hp <= player.maxHp * 0.2 && Math.random() < checkChance) {
        addMessage(getRandomText(STATO_MESSAGGI.MORENTE), 'danger', true);
    }
    // Check Veleno
    else if (player.isPoisoned && Math.random() < checkChance) {
         addMessage(getRandomText(STATO_MESSAGGI.AVVELENATO), 'danger');
    }
    // Check Ferito E Malato (combinato)
    else if (player.isInjured && player.isSick && Math.random() < checkChance) {
         addMessage(getRandomText(STATO_MESSAGGI.FERITO_E_MALATO), 'warning');
    }
    // Check Malato (solo se non ferito)
    else if (player.isSick && Math.random() < checkChance) {
        addMessage(getRandomText(STATO_MESSAGGI.INFETTO), 'warning'); // CORRETTO da MALATO a INFETTO
    }
    // Check Ferito (solo se non malato)
    else if (player.isInjured && Math.random() < checkChance) {
        addMessage(getRandomText(STATO_MESSAGGI.FERITO), 'warning');
    }
    // Check Fame E Sete (combinato)
    else if (player.food < 0 && player.water < 0 && Math.random() < checkChance) {
        addMessage(getRandomText(STATO_MESSAGGI.AFFAMATO_E_ASSETATO), 'warning');
    }
    // Check Fame (solo se non assetato)
    else if (player.food < 0 && Math.random() < checkChance) {
        addMessage(getRandomText(STATO_MESSAGGI.AFFAMATO), 'warning');
    }
    // Check Sete (solo se non affamato)
    else if (player.water < 0 && Math.random() < checkChance) {
        addMessage(getRandomText(STATO_MESSAGGI.ASSETATO), 'warning');
    }

    // Aggiorna sempre le stats per riflettere potenziali cambiamenti non legati ai messaggi loggati
    // (Anche se renderStats è spesso chiamato altrove, qui garantisce che la UI sia aggiornata
    // dopo che gli stati sono stati potenzialmente loggati)
    if (typeof renderStats === 'function') {
        renderStats();
    } else {
        console.warn("checkAndLogStatusMessages: renderStats non disponibile.");
    }
}

// NOTA: Le funzioni che cambiano lo stato globale (`player`, `messages`, ecc.) devono
// assicurarsi di chiamare le funzioni di rendering (`renderStats`, `renderInventory`,
// `renderMessages`) definite in `ui.js` per aggiornare l'interfaccia dopo la modifica.

/**
 * Applica usura a un oggetto equipaggiato (arma o armatura).
 * @param {'equippedWeapon' | 'equippedArmor'} slotKey - La chiave dello slot dell'oggetto equipaggiato.
 * @param {number} [wearAmount=1] - La quantità di durabilità da ridurre.
 */
function applyWearToEquippedItem(slotKey, wearAmount = 1) {
    if (!player || (slotKey !== 'equippedWeapon' && slotKey !== 'equippedArmor')) {
        console.error(`applyWearToEquippedItem: slotKey non valido o player non definito.`);
        return;
    }

    const equippedObjectInstance = player[slotKey];
    if (!equippedObjectInstance) {
        // Nessun oggetto equipaggiato in quello slot
        return;
    }

    const itemId = equippedObjectInstance.itemId;
    const itemInfoTemplate = ITEM_DATA[itemId];
    if (!itemInfoTemplate || typeof itemInfoTemplate.maxDurability !== 'number') {
        console.warn(`applyWearToEquippedItem: L'oggetto ${itemId} non ha maxDurability definito nel template.`);
        return;
    }

    if (typeof equippedObjectInstance.currentDurability !== 'number') {
        console.error(`applyWearToEquippedItem: currentDurability non definita per l'oggetto equipaggiato (${itemId}).`);
        return;
    }

    if (equippedObjectInstance.currentDurability <= 0) {
        // L'oggetto è già rotto, non può usurarsi ulteriormente.
        return;
    }

    const oldDurability = equippedObjectInstance.currentDurability;
    equippedObjectInstance.currentDurability = Math.max(0, equippedObjectInstance.currentDurability - wearAmount);

    if (equippedObjectInstance.currentDurability <= 0 && oldDurability > 0) {
        addMessage(`${itemInfoTemplate.name} si è rotto!`, 'danger');
    } else if (equippedObjectInstance.currentDurability < oldDurability && equippedObjectInstance.currentDurability < itemInfoTemplate.maxDurability * 0.25) {
        // Aggiungi un messaggio se la durabilità scende sotto una certa soglia (es. 25%) ma non si è appena rotto
        if (oldDurability >= itemInfoTemplate.maxDurability * 0.25) { // Solo se prima era sopra la soglia
             addMessage(`${itemInfoTemplate.name} è gravemente danneggiato.`, 'warning');
        }
    }

    // Aggiorna la UI delle statistiche per riflettere il cambiamento di stato dell'arma/armatura
    if (typeof renderStats === 'function') {
        renderStats();
    }
    // Non è necessario chiamare updateInventoryDisplay o updateEquippedDisplay qui perché
    // la visualizzazione della durabilità avviene tramite tooltip/popup che leggono direttamente da ITEM_DATA,
    // e renderStats si occupa di aggiornare il nome visualizzato dell'oggetto equipaggiato se necessario.
}

/**
 * Verifica se il giocatore possiede gli ingredienti necessari per una ricetta.
 * @param {Array<object>} ingredients - Array di oggetti ingrediente dalla ricetta (es. [{ itemId: 'id', quantity: 1 }]).
 * @returns {boolean} True se tutti gli ingredienti sono presenti in quantità sufficiente, false altrimenti.
 */
function checkIngredients(ingredients) {
    if (!Array.isArray(ingredients)) return false;
    if (!player || !Array.isArray(player.inventory)) return false; // Verifica inventario

    for (const ingredient of ingredients) {
        const itemInInventory = player.inventory.find(slot => slot.itemId === ingredient.itemId);
        if (!itemInInventory || itemInInventory.quantity < ingredient.quantity) {
            // console.log(`checkIngredients: Manca ingrediente ${ingredient.itemId} (richiesti ${ingredient.quantity}, trovati ${itemInInventory ? itemInInventory.quantity : 0})`); // Log di debug
            return false; // Ingrediente mancante o non sufficiente
        }
    }
    return true; // Tutti gli ingredienti sono presenti
}

/**
 * Tenta di eseguire una ricetta di crafting.
 * @param {string} recipeKey - La chiave della ricetta in CRAFTING_RECIPES (es. 'purify_water').
 */
function attemptCraftItem(recipeKey) {
    // console.log(`attemptCraftItem: Tentativo di craftare recipe '${recipeKey}'`); // Log di debug
    if (typeof CRAFTING_RECIPES === 'undefined' || !CRAFTING_RECIPES[recipeKey]) {
        console.error(`attemptCraftItem: Ricetta '${recipeKey}' non trovata in CRAFTING_RECIPES.`);
        addMessage("Errore: Ricetta di crafting sconosciuta.", "danger");
        return;
    }

    const recipe = CRAFTING_RECIPES[recipeKey];

    // --- NUOVO CONTROLLO: VERIFICA SE LA RICETTA È CONOSCIUTA ---
    if (!player.knownRecipes.includes(recipeKey)) {
        console.warn(`attemptCraftItem: Il giocatore non conosce la ricetta: ${recipeKey}`);
        addMessage("Non sai ancora come creare questo oggetto. Trova il progetto!", "warning");
        return;
    }
    // --- FINE NUOVO CONTROLLO ---

    // Verifica se il giocatore ha gli ingredienti necessari
    let hasAllIngredients = true;

    // 1. Verifica Requisiti (per ora non ci sono, ma predisponiamo)
    // if (recipe.requirements) {
    //     for (const req of recipe.requirements) {
    //         if (req === 'needs_fire' && !isNearFireSource()) { // isNearFireSource() da implementare
    //             addMessage("Hai bisogno di una fonte di fuoco per creare questo oggetto.", "warning");
    //             return;
    //         }
    //         // Aggiungere altri check requisiti qui
    //     }
    // }

    // 2. Verifica Ingredienti
    if (!checkIngredients(recipe.ingredients)) {
        addMessage("Mancano gli ingredienti necessari!", "warning");
        return;
    }

    // 3. Consuma Ingredienti
    for (const ingredient of recipe.ingredients) {
        if (!removeItemFromInventory(ingredient.itemId, ingredient.quantity)) {
            // Questo non dovrebbe accadere se checkIngredients ha funzionato, ma è una sicurezza
            console.error(`attemptCraftItem: Fallimento nel rimuovere l'ingrediente ${ingredient.itemId} x${ingredient.quantity}.`);
            addMessage("Errore nel consumare gli ingredienti.", "danger");
            // TODO: Logica di rollback? O assumiamo che non accada?
            return;
        }
    }

    // 4. Aggiungi Prodotto
    addItemToInventory(recipe.productId, recipe.productQuantity);

    // 5. Mostra Messaggio di Successo
    if (recipe.successMessage) {
        addMessage(recipe.successMessage, "success", true);
    }
    
    // === ESPERIENZA PER CRAFTING ===
    if (typeof awardExperience === 'function') {
        let expAmount = 5; // Esperienza base per crafting
        
        // Bonus per ricette complesse (più ingredienti)
        if (recipe.ingredients && recipe.ingredients.length > 2) {
            expAmount += recipe.ingredients.length;
        }
        
        awardExperience(expAmount, `crafting ${recipe.productId}`);
    }

    // Aggiorna UI (già fatto da removeItem e addItem, ma per sicurezza)
    if (typeof renderInventory === 'function') renderInventory();
    if (typeof renderStats === 'function') renderStats(); // Anche le stats per sicurezza

    // La chiusura del popup avviene nell'handler del bottone in showItemActionPopup
}

/**
 * Tenta di consumare un certo numero di porzioni di una risorsa specificata (cibo o acqua)
 * dall'inventario del giocatore. Dà priorità agli oggetti già iniziati,
 * poi a quelli monoporzione, e infine a quelli multiporzione pieni.
 * @param {string} resourceType 'food' o 'water'.
 * @param {number} portionsNeeded Il numero di porzioni richieste.
 * @returns {number} Il numero di porzioni effettivamente consumate.
 */
function consumePortions(resourceType, portionsNeeded) {
    if (portionsNeeded <= 0) return 0;

    let portionsConsumed = 0;
    let messageLog = [];

    // Fase 1: Oggetti multiporzione già iniziati
    for (let i = player.inventory.length - 1; i >= 0; i--) {
        if (portionsConsumed >= portionsNeeded) break;
        const itemSlot = player.inventory[i];
        const itemInfo = ITEM_DATA[itemSlot.itemId];
        if (itemInfo && itemInfo.type === resourceType && itemSlot.max_portions > 1 && itemSlot.current_portions < itemSlot.max_portions) {
            while (itemSlot.current_portions > 0 && portionsConsumed < portionsNeeded) {
                itemSlot.current_portions -= 1;
                portionsConsumed++;
                if (itemSlot.current_portions <= 0) {
                    messageLog.push(`Hai finito ${itemInfo.nameShort || itemInfo.name}.`);
                    player.inventory.splice(i, 1);
                    break; // L'oggetto è finito, esci dal while interno
                } else {
                    messageLog.push(`Hai consumato una porzione di ${itemInfo.nameShort || itemInfo.name}.`);
                }
            }
        }
    }

    // Fase 2: Oggetti monoporzione (o quelli con max_portions non definito o 1)
    if (portionsConsumed < portionsNeeded) {
        for (let i = player.inventory.length - 1; i >= 0; i--) {
            if (portionsConsumed >= portionsNeeded) break;
            const itemSlot = player.inventory[i];
            const itemInfo = ITEM_DATA[itemSlot.itemId];
            if (itemInfo && itemInfo.type === resourceType && (!itemSlot.max_portions || itemSlot.max_portions === 1)) {
                // Questo è un oggetto monoporzione, consumalo interamente se serve
                // L'effetto dell'oggetto monoporzione è già definito come singola porzione
                // Quindi se lo "consumiamo" per la notte, stiamo usando quella singola porzione/effetto.
                portionsConsumed++; 
                messageLog.push(`Hai consumato ${itemInfo.nameShort || itemInfo.name}.`);
                itemSlot.quantity -=1;
                if (itemSlot.quantity <=0) {
                    player.inventory.splice(i, 1);
                }
                if (portionsConsumed >= portionsNeeded) break;
            }
        }
    }

    // Fase 3: Oggetti multiporzione pieni (se ancora necessario)
    if (portionsConsumed < portionsNeeded) {
        for (let i = player.inventory.length - 1; i >= 0; i--) {
            if (portionsConsumed >= portionsNeeded) break;
            const itemSlot = player.inventory[i];
            const itemInfo = ITEM_DATA[itemSlot.itemId];
            if (itemInfo && itemInfo.type === resourceType && itemSlot.max_portions > 1 && itemSlot.current_portions === itemSlot.max_portions) {
                while (itemSlot.current_portions > 0 && portionsConsumed < portionsNeeded) {
                    itemSlot.current_portions -= 1;
                    portionsConsumed++;
                    if (itemSlot.current_portions <= 0) {
                        messageLog.push(`Hai finito ${itemInfo.nameShort || itemInfo.name}.`);
                        player.inventory.splice(i, 1);
                        break; // L'oggetto è finito, esci dal while interno
                    } else {
                        messageLog.push(`Hai consumato una porzione di ${itemInfo.nameShort || itemInfo.name}.`);
                    }
                }
            }
        }
    }

    if (messageLog.length > 0) {
        addMessage(messageLog.join(' '), 'neutral');
    }
    
    renderInventory();
    renderStats(); // Aggiorna le statistiche nel caso il consumo diretto da player.food/water sia ancora presente altrove
    return portionsConsumed;
}

// === SISTEMA PROGRESSIONE D&D-INSPIRED ===

/**
 * Assegna punti esperienza al giocatore e converte automaticamente in punti statistica
 * @param {number} expAmount - Quantità di esperienza da assegnare
 * @param {string} reason - Motivo dell'assegnazione (per feedback)
 */
function awardExperience(expAmount, reason = "azione completata") {
    if (!player || expAmount <= 0) return;
    
    player.experience += expAmount;
    
    // Conversione automatica: ogni 10 punti esperienza = 1 punto statistica
    const newStatPoints = Math.floor(player.experience / 10);
    const earnedPoints = newStatPoints - player.availableStatPoints;
    
    if (earnedPoints > 0) {
        player.availableStatPoints = newStatPoints;
        addMessage(`Hai guadagnato ${expAmount} esperienza per ${reason}. Punti statistica disponibili: ${player.availableStatPoints}`, "success");
        
        // Suggerimento per spendere punti se ne ha abbastanza
        if (player.availableStatPoints >= 3) {
            addMessage("Hai abbastanza punti per migliorare le tue abilità! Usa (R) durante il riposo.", "info");
        }
    } else {
        addMessage(`Hai guadagnato ${expAmount} esperienza per ${reason}.`, "success");
    }
    
    if (typeof renderStats === 'function') renderStats();
}

/**
 * Migliora una statistica spendendo punti disponibili
 * @param {string} statName - Nome della statistica da migliorare
 * @returns {boolean} True se il miglioramento è riuscito
 */
function improveStat(statName) {
    if (!player || !player.stats.hasOwnProperty(statName)) {
        addMessage("Statistica non valida.", "error");
        return false;
    }
    
    // Costo crescente: 1 punto per i primi 3 miglioramenti, poi 2, poi 3, ecc.
    const currentLevel = player.stats[statName];
    const baseCost = Math.max(1, Math.floor((currentLevel - 5) / 2));
    const totalUpgradesCost = Math.floor(player.totalStatUpgrades / 5); // Costo aggiuntivo ogni 5 miglioramenti totali
    const finalCost = baseCost + totalUpgradesCost;
    
    if (player.availableStatPoints < finalCost) {
        addMessage(`Servono ${finalCost} punti per migliorare ${statName}. Ne hai ${player.availableStatPoints}.`, "warning");
        return false;
    }
    
    // Limite massimo per bilanciamento (ispirato a D&D)
    if (currentLevel >= 18) {
        addMessage(`${statName} ha già raggiunto il limite massimo (18).`, "warning");
        return false;
    }
    
    // Applica il miglioramento
    player.stats[statName]++;
    player.availableStatPoints -= finalCost;
    player.totalStatUpgrades++;
    
    // Aggiorna alias per compatibilità eventi
    updateStatAliases();
    
    // Ricalcola HP se è stato migliorato il vigore
    if (statName === 'vigore') {
        const oldMaxHp = player.maxHp;
        player.maxHp = 70 + (player.stats.vigore * 5);
        const hpIncrease = player.maxHp - oldMaxHp;
        player.hp += hpIncrease; // Aumenta anche HP attuali
        addMessage(`${statName} migliorato! HP massimi aumentati di ${hpIncrease}.`, "success");
    } else {
        addMessage(`${statName} migliorato! Nuovo valore: ${player.stats[statName]}`, "success");
    }
    
    if (typeof renderStats === 'function') renderStats();
    return true;
}

/**
 * Aggiorna gli alias delle statistiche per compatibilità eventi
 */
function updateStatAliases() {
    if (!player || !player.stats) return;
    
    player.potenza = player.stats.forza;
    player.agilita = player.stats.agilita;
    player.tracce = player.stats.percezione;
    player.influenza = player.stats.carisma;
    player.presagio = player.stats.percezione;
    player.adattamento = player.stats.adattamento;
}

/**
 * Mostra popup quando l'inventario è pieno e si tenta di aggiungere un oggetto
 * @param {string} newItemId - ID dell'oggetto da aggiungere
 * @param {number} newItemQuantity - Quantità dell'oggetto da aggiungere
 */
function showInventoryFullChoicePopup(newItemId, newItemQuantity) {
    const newItemInfo = ITEM_DATA[newItemId];
    if (!newItemInfo) {
        addMessage("Errore: oggetto non valido.", "error");
        return;
    }
    
    const choices = [];
    
    // Opzione 1: Perdere l'oggetto nuovo
    choices.push({
        text: `Lascia ${newItemInfo.name} x${newItemQuantity}`,
        action: () => {
            addMessage(`Hai lasciato ${newItemInfo.name} x${newItemQuantity} per mancanza di spazio.`, "warning");
            if (typeof closeEventPopup === 'function') closeEventPopup();
        }
    });
    
    // Opzione 2: Sostituire un oggetto esistente
    player.inventory.forEach((slot, index) => {
        const itemInfo = ITEM_DATA[slot.itemId];
        if (itemInfo) {
            const quantityText = slot.quantity > 1 ? ` x${slot.quantity}` : '';
            const portionsText = slot.current_portions ? ` (${slot.current_portions}/${slot.max_portions} porz.)` : '';
            
            choices.push({
                text: `Sostituisci ${itemInfo.name}${quantityText}${portionsText}`,
                action: () => {
                    // Rimuovi l'oggetto esistente
                    const removedItem = player.inventory.splice(index, 1)[0];
                    addMessage(`Hai lasciato ${itemInfo.name}${quantityText} per fare spazio.`, "info");
                    
                    // Aggiungi il nuovo oggetto
                    const newItem = { itemId: newItemId, quantity: newItemQuantity };
                    if (newItemInfo.max_portions && newItemInfo.max_portions > 1) {
                        newItem.current_portions = newItemInfo.max_portions;
                        newItem.max_portions = newItemInfo.max_portions;
                    }
                    player.inventory.push(newItem);
                    addMessage(`${newItemInfo.name} x${newItemQuantity} aggiunto all'inventario.`, "success");
                    
                    if (typeof renderInventory === 'function') renderInventory();
                    if (typeof closeEventPopup === 'function') closeEventPopup();
                }
            });
        }
    });
    
    const popupData = {
        title: "Inventario Pieno!",
        description: `Vuoi aggiungere ${newItemInfo.name} x${newItemQuantity}, ma l'inventario è pieno (${player.inventory.length}/${MAX_INVENTORY_SLOTS}). Cosa vuoi fare?`,
        choices: choices,
        isActionPopup: true
    };
    
    if (typeof showEventPopup === 'function') {
        savedActionPopupContext = popupData;
        showEventPopup(popupData);
    } else {
        addMessage("Sistema di gestione inventario non disponibile.", "error");
    }
}

/**
 * Mostra l'interfaccia per gestire l'inventario quando è pieno
 */
function showInventoryManagementPopup() {
    if (!player || !player.inventory) {
        addMessage("Errore nell'accesso all'inventario.", "error");
        return;
    }
    
    if (player.inventory.length < MAX_INVENTORY_SLOTS) {
        addMessage("L'inventario non è pieno. Gestione non necessaria.", "info");
        return;
    }
    
    // Crea le scelte per il popup
    const choices = [];
    
    // Aggiungi ogni oggetto dell'inventario come opzione per essere lasciato
    player.inventory.forEach((slot, index) => {
        const itemInfo = ITEM_DATA[slot.itemId];
        if (itemInfo) {
            const quantityText = slot.quantity > 1 ? ` x${slot.quantity}` : '';
            const portionsText = slot.current_portions ? ` (${slot.current_portions}/${slot.max_portions} porz.)` : '';
            
            choices.push({
                text: `Lascia ${itemInfo.name}${quantityText}${portionsText}`,
                action: () => {
                    dropItem(slot.itemId, slot.quantity);
                    if (typeof closeEventPopup === 'function') closeEventPopup();
                }
            });
        }
    });
    
    // Aggiungi opzione per chiudere
    choices.push({
        text: "Chiudi",
        action: () => {
            if (typeof closeEventPopup === 'function') closeEventPopup();
        }
    });
    
    const popupData = {
        title: "Gestione Inventario",
        description: `Inventario pieno (${player.inventory.length}/${MAX_INVENTORY_SLOTS}). Scegli cosa lasciare per fare spazio.`,
        choices: choices,
        isActionPopup: true
    };
    
    if (typeof showEventPopup === 'function') {
        savedActionPopupContext = popupData;
        showEventPopup(popupData);
    } else {
        addMessage("Sistema di gestione inventario non disponibile.", "error");
    }
}

/**
 * Mostra l'interfaccia per migliorare le statistiche
 */
function showStatImprovementPopup() {
    if (!player || player.availableStatPoints <= 0) {
        addMessage("Non hai punti statistica disponibili. Accumula più esperienza!", "warning");
        return;
    }
    
    const statDescriptions = {
        forza: "Potenza fisica - Aumenta danni in combattimento",
        agilita: "Destrezza e riflessi - Migliora fuga e schivata", 
        vigore: "Resistenza - Aumenta HP massimi e resistenza a malattie",
        percezione: "Notare dettagli - Migliora ricerca e individuazione pericoli",
        carisma: "Influenza sociale - Migliora negoziazione e leadership",
        adattamento: "Apprendimento - Migliora resistenza a shock e adattabilità"
    };
    
    // Crea le scelte per il popup
    const choices = [];
    
    for (const [statName, description] of Object.entries(statDescriptions)) {
        const currentLevel = player.stats[statName];
        const baseCost = Math.max(1, Math.floor((currentLevel - 5) / 2));
        const totalUpgradesCost = Math.floor(player.totalStatUpgrades / 5);
        const finalCost = baseCost + totalUpgradesCost;
        const canAfford = player.availableStatPoints >= finalCost && currentLevel < 18;
        
        let choiceText = `${statName.toUpperCase()} (${currentLevel}) - Costo: ${finalCost}`;
        if (currentLevel >= 18) {
            choiceText += " [MASSIMO]";
        } else if (!canAfford) {
            choiceText += " [INSUFFICIENTE]";
        }
        
        choices.push({
            text: choiceText,
            action: canAfford ? () => {
                improveStat(statName);
                // NON chiudere il popup, aggiorna invece le scelte
                showStatImprovementPopup();
            } : () => {
                if (currentLevel >= 18) {
                    addMessage(`${statName} ha già raggiunto il limite massimo (18).`, "warning");
                } else {
                    addMessage(`Servono ${finalCost} punti per migliorare ${statName}. Ne hai ${player.availableStatPoints}.`, "warning");
                }
            },
            disabled: !canAfford
        });
    }
    
    // Aggiungi opzione per chiudere
    choices.push({
        text: "Chiudi",
        action: () => {
            if (typeof closeEventPopup === 'function') closeEventPopup();
        }
    });
    
    const popupData = {
        title: "Miglioramento Abilità",
        description: `Punti disponibili: ${player.availableStatPoints}\n\nScegli quale abilità migliorare. Il costo aumenta con il livello attuale e i miglioramenti totali.`,
        choices: choices,
        isActionPopup: true
    };
    
    if (typeof showEventPopup === 'function') {
        savedActionPopupContext = popupData;
        showEventPopup(popupData);
    } else {
        addMessage("Sistema di miglioramento non disponibile.", "error");
    }
}

// --- FINE LOGICA GIOCATORE ---
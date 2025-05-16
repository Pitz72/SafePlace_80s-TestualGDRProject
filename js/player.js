/**
 * TheSafePlace - Roguelike Postapocalittico
 * Versione: v0.7.22 Event Flow Integrity
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


/**
 * Genera le statistiche base e l'inventario iniziale del personaggio giocante.
 * Inizializza l'oggetto player.
 * Dipende da: game_constants.js (player, STARTING_FOOD, STARTING_WATER), game_utils.js (getRandomInt), ui.js (addItemToInventory).
 */
function generateCharacter() {
    // Inizializza l'oggetto player (definito in game_constants.js)
    player = {
        name: "Ultimo", // Nome fisso per ora

        // Attributi base con una piccola variazione casuale
        // Range di base 6-10 per gli attributi
        vigore: 8 + getRandomInt(0, 2),      // Resistenza fisica, base HP
        potenza: 8 + getRandomInt(0, 2),     // Forza fisica, danno corpo a corpo
        agilita: 12 + getRandomInt(0, 2),    // Schivata, velocità, furtività, check vs trappole agilità
        tracce: 12 + getRandomInt(0, 2),     // Seguire/nascondere tracce, osservazione, check vs trappole tracce
        influenza: 7 + getRandomInt(0, 2),   // Interazione sociale, persuasione, intimidazione (check vs predoni)
        presagio: 8 + getRandomInt(0, 2),    // Intuizione, percepire pericoli/opportunità nascoste (check vs pericoli/tracce/rifugi)
        adattamento: 8 + getRandomInt(0, 2), // Resistenza a malattie/veleni/orrore, riparazioni/crafting (check vs pericoli/orrore/rifugi)
        acquisita: 0,                    // Punti abilità guadagnati da spendere (feature futura)

        // Risorse e stato di sopravvivenza
        // maxHp e hp verranno calcolati e impostati dopo la definizione degli attributi base
        food: STARTING_FOOD,
        water: STARTING_WATER,

        // Posizione (verrà definita in map.js durante la generazione della mappa)
        x: -1, // -1 o undefined per indicare non ancora posizionato
        y: -1,

        // Stati negativi (boolean flags)
        isInjured: false, // Ferito: Subisce danno per movimento/notte, penalità a Potenza/Agilità check (RIPRISTINATO A FALSE)
        isSick: false,    // Malato: Subisce danno per movimento/notte, penalità a Vigore/Adattamento check, consumo extra risorse
        isPoisoned: false, // Avvelenato: Subisce danno per movimento/notte, penalità a Agilità/Adattamento check (o altro a seconda del design)
        poisonDuration: 0,      // Turni rimanenti di avvelenamento
        currentLocationType: null, // Tipo di tile attuale (simbolo)
        knownRecipes: ["purify_water", "cook_meat", "craft_shiv", "craft_rags_armor", "craft_healing_poultice", "craft_bandages_clean"],       // Array delle ricette conosciute

        // Flag stato notturno (non salvato, solo per logica transizione)
        hasBeenWarnedAboutNight: false, // Per non spammare il messaggio di pericolo notturno

        // Equipaggiamento (memorizza l'oggetto equipaggiato come {itemId, currentDurability})
        equippedWeapon: null, // Verrà impostato sotto
        equippedArmor: null,  // Verrà impostato sotto

        // Inventario: array di oggetti { itemId: string, quantity: number }
        inventory: []
    };

    // Calcola HP massimi basati sul Vigore (formula base: 10 + Vigore)
    player.maxHp = 10 + player.vigore; // Calcolo originale
    player.hp = player.maxHp; // Inizia con HP pieni (RIPRISTINATO)

    // Impostazioni iniziali per lo stato del giocatore (ferito e con HP ridotti) - RIGHE DI TEST COMMENTATE
    // player.isInjured = true;
    // player.hp = Math.floor(player.maxHp / 3);

    // Le righe temporanee per il test degli HP sono state rimosse.

    // Aggiunge oggetti iniziali all'inventario (usando la funzione addItemToInventory definita qui sotto)
    addItemToInventory('bandages_dirty', 2);
    addItemToInventory('water_purified_small', 1);
    addItemToInventory('canned_food', 1);
    addItemToInventory('suspicious_pills', 1);
    addItemToInventory('scrap_metal', getRandomInt(1,3)); // Inizia con qualche materiale
    addItemToInventory('berries', 2);         // Per le Bacche Comuni
    addItemToInventory('cloth_rags', 1);      // Per gli Stracci di Stoffa
    addItemToInventory('water_dirty', 1);     // Per l'Acqua Sporca
    // addItemToInventory('charcoal', 1);        // <<< RIMOSSO CARBONE PER TEST
    // addItemToInventory('repair_kit', 1); // Assicurati che questa riga rimanga commentata o rimossa

    // Equipaggia un'arma base all'inizio
    const startingWeaponId = 'pipe_wrench';
    const startingWeaponData = ITEM_DATA[startingWeaponId];
    if (startingWeaponData) {
        player.equippedWeapon = {
            itemId: startingWeaponId,
            currentDurability: startingWeaponData.maxDurability
        };
    } else {
        player.equippedWeapon = null;
        console.warn(`generateCharacter: Arma iniziale '${startingWeaponId}' non trovata in ITEM_DATA.`);
    }

    // Equipaggia un'armatura base all'inizio
    const startingArmorId = 'leather_jacket_worn';
    const startingArmorData = ITEM_DATA[startingArmorId];
    if (startingArmorData) {
        player.equippedArmor = {
            itemId: startingArmorId,
            currentDurability: startingArmorData.maxDurability
        };
    } else {
        player.equippedArmor = null;
        console.warn(`generateCharacter: Armatura iniziale '${startingArmorId}' non trovata in ITEM_DATA.`);
    }

    if (typeof DEBUG_MODE !== 'undefined' && DEBUG_MODE) console.log('[generateCharacter] Player Equip INIZIALE - Arma:', JSON.stringify(player.equippedWeapon), 'Armatura:', JSON.stringify(player.equippedArmor));

    // Aggiorna la UI delle stats iniziali
    if (typeof renderStats === 'function') {
         renderStats();
    } else {
         console.warn("generateCharacter: renderStats non disponibile.");
    }
     // Aggiorna UI inventario
     if (typeof renderInventory === 'function') {
          renderInventory();
     } else {
          console.warn("generateCharacter: renderInventory non disponibile.");
     }


    // Log di debug (opzionale, rimuovere in produzione)
    // console.log("Personaggio generato:", player);
}

/**
 * Aggiunge un oggetto all'inventario del giocatore o ne aumenta la quantità se già presente.
 * Dipende da: game_constants.js (player, MAX_INVENTORY_SLOTS, ITEM_DATA), ui.js (renderInventory, addMessage).
 * @param {string} itemId - L'ID dell'oggetto da aggiungere (corrispondente a una chiave in ITEM_DATA).
 * @param {number} quantity - La quantità dell'oggetto da aggiungere.
 */
function addItemToInventory(itemId, quantity) {
    // Verifica che l'inventario sia inizializzato e che la quantità sia valida
    if (!player || !Array.isArray(player.inventory) || quantity <= 0) {
        console.error(`addItemToInventory: Dati giocatore/inventario non validi o quantità (${quantity}) <= 0.`);
        return;
    }
    // Verifica che l'itemId esista in ITEM_DATA
    const itemInfo = ITEM_DATA[itemId];
    if (!itemInfo) {
        console.error(`addItemToInventory: Oggetto con ID '${itemId}' non trovato in ITEM_DATA.`);
        addMessage(`Non puoi raccogliere Oggetto Sconosciuto (ID: ${itemId}).`, "warning");
        return;
    }

    // --- GESTIONE OGGETTI CON DURABILITÀ (maxDurability) ---
    if (typeof itemInfo.maxDurability === 'number') {
        // Oggetti con durabilità (armi/armature): aggiungi uno slot per ogni copia
        let added = 0;
        for (let i = 0; i < quantity; i++) {
            if (player.inventory.length < MAX_INVENTORY_SLOTS) {
                player.inventory.push({ itemId: itemId, quantity: 1, currentDurability: itemInfo.maxDurability });
                added++;
            } else {
                addMessage(`Inventario pieno (${player.inventory.length}/${MAX_INVENTORY_SLOTS} slot)! Solo ${added} su ${quantity} ${itemInfo.name} aggiunti.`, 'warning');
                break;
            }
        }
        // Non serve gestire stackabilità: ogni oggetto con durabilità è slot singolo
    } else {
        // --- LOGICA ORIGINALE PER OGGETTI STACKABILI O SENZA DURABILITÀ ---
        // Cerca se l'oggetto è già presente nell'inventario
        const existingItemSlot = player.inventory.find(slot => slot.itemId === itemId);
        const isStackable = itemInfo.stackable !== false;

        if (isStackable && existingItemSlot) {
            // Se esiste e stackable, aumenta la quantità
            existingItemSlot.quantity += quantity;
        } else {
            // Se non esiste OPPURE non è stackable: aggiungi un nuovo slot (se c'è spazio)
            if (player.inventory.length >= MAX_INVENTORY_SLOTS) {
                addMessage(`Inventario pieno (${player.inventory.length}/${MAX_INVENTORY_SLOTS} slot)! Non puoi raccogliere ${itemInfo.name}.`, 'warning');
                return;
            }
            player.inventory.push({ itemId: itemId, quantity: quantity });
        }
    }

    // Aggiorna la visualizzazione dell'inventario
    if (typeof renderInventory === 'function') {
        renderInventory();
    } else {
        console.warn("addItemToInventory: renderInventory non disponibile.");
    }

    // Non loggiamo un messaggio qui di default; la funzione che assegna l'oggetto dovrebbe loggarlo.
    // Esempio: addMessage(`Hai trovato ${quantity} x ${itemInfo.name}.`, 'success');
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
    // console.log(`useItem: Tentativo di usare item '${itemId}'`); // Log di debug

    const itemInfo = ITEM_DATA[itemId];
    const itemIndex = player.inventory.findIndex(slot => slot.itemId === itemId);

    // Verifiche preliminari
    if (itemIndex === -1 || !itemInfo) {
        console.error(`useItem: Oggetto '${itemId}' non trovato nell'inventario o nei dati.`);
        addMessage("Errore nell'usare l'oggetto.", "warning");
        if (typeof closeEventPopup === 'function') closeEventPopup();
        return;
    }
    const itemSlot = player.inventory[itemIndex]; // Slot originale
    // console.log(`DEBUG: useItem - INIZIO. Item: ${itemId}, Quantità nello slot: ${itemSlot.quantity}, Idratazione iniziale: ${player.water}`); // NUOVO LOG

    if (!itemInfo.usable) {
        addMessage(`${itemInfo.name} non può essere usato direttamente.`, "warning");
        if (typeof closeEventPopup === 'function') closeEventPopup();
        return;
    }
    // MODIFICATO: Controlla itemInfo.effects (plurale) e che non sia un array vuoto
    if (!itemInfo.effects || itemInfo.effects.length === 0) {
        console.warn(`useItem: Oggetto '${itemId}' non ha un array 'effects' definito o è vuoto.`);
        addMessage(`${itemInfo.name} non ha effetto quando usato.`, "warning");
        if (typeof closeEventPopup === 'function') closeEventPopup();
        return;
    }

    let effectApplied = false;
    let consumptionMessage = `${itemInfo.name} usato.`; // Messaggio iniziale sull'uso
    let consumeItem = true; // Flag per decidere se consumare l'oggetto dopo l'uso
    let messageType = 'info'; // Tipo messaggio default

    // Estrai il primo oggetto effetto dall'array (la maggior parte degli item ne ha solo uno)
    // Se un item dovesse avere effetti multipli simultanei, questa logica andrebbe estesa (es. con un ciclo)
    const currentEffect = itemInfo.effects[0];

    // Gestisce i vari tipi di effetti (definiti nell'oggetto effect in ITEM_DATA)
    // MODIFICATO: Usa currentEffect.type
    switch (currentEffect.type) {

        case 'add_resource': // Aumenta risorse (HP, Cibo, Acqua)
            // amount può essere un numero fisso o un intervallo {min, max}
            // MODIFICATO: Usa currentEffect.amount
            const amountToAdd = (typeof currentEffect.amount === 'object' && currentEffect.amount !== null)
                ? getRandomInt(currentEffect.amount.min, currentEffect.amount.max)
                : (currentEffect.amount || 1); // Default a 1 se amount non definito

            // MODIFICATO: Usa currentEffect.resource_type
            if (currentEffect.resource_type === 'hp') {
                const oldHp = player.hp;
                player.hp = Math.min(player.hp + amountToAdd, player.maxHp);
                const actualHeal = player.hp - oldHp; // Quanto HP è stato effettivamente curato
                consumptionMessage = `Hai usato ${itemInfo.name}. Recuperi ${actualHeal} HP.`;
                if (actualHeal > 0) messageType = 'success'; else messageType = 'info';
                // TODO: Aggiungere effetto visivo di cura?
            // MODIFICATO: Usa currentEffect.resource_type
            } else if (currentEffect.resource_type === 'food') {
                player.food = Math.min(player.food + amountToAdd, 10); // Limite Sazietà a 10
                 consumptionMessage = `Hai usato ${itemInfo.name}. Sazietà +${amountToAdd}. Totale: ${Math.floor(player.food)}.`;
                 messageType = 'success';
            // MODIFICATO: Usa currentEffect.resource_type
            } else if (currentEffect.resource_type === 'water') {
                const waterPrimaDellEffetto = player.water; // Salva acqua prima
                player.water = Math.min(player.water + amountToAdd, 10); // Limite Idratazione a 10
                 consumptionMessage = `Hai usato ${itemInfo.name}. Idratazione +${amountToAdd}. Totale: ${Math.floor(player.water)}.`;
                 // console.log(`DEBUG: useItem - EFFETTO ACQUA. Idratazione Prima: ${waterPrimaDellEffetto}, Amount Aggiunto da Effetto: ${amountToAdd}, Idratazione Dopo: ${player.water}`); // NUOVO LOG
                 messageType = 'success';
            } else {
                // MODIFICATO: Usa currentEffect.resource_type
                console.warn(`useItem: Tipo risorsa sconosciuto in add_resource per item '${itemId}': ${currentEffect.resource_type}`);
                consumptionMessage = `Hai usato ${itemInfo.name}. (Effetto sconosciuto)`;
                 messageType = 'warning';
                 consumeItem = false; // Non consumare se l'effetto è sconosciuto
            }
            effectApplied = true;
            break;

        case 'add_resource_poisonable': // Aggiunge risorse con rischio avvelenamento
             // Simile a add_resource, ma con check rischio
             // MODIFICATO: Usa currentEffect.amount
             const pAmountToAdd = (typeof currentEffect.amount === 'object' && currentEffect.amount !== null)
                 ? getRandomInt(currentEffect.amount.min, currentEffect.amount.max)
                 : (currentEffect.amount || 1);

             // MODIFICATO: Usa currentEffect.resource_type
             if (currentEffect.resource_type === 'food') {
                 player.food = Math.min(player.food + pAmountToAdd, 10);
                 consumptionMessage = `Hai consumato ${itemInfo.name}. Sazietà +${pAmountToAdd}. Totale: ${Math.floor(player.food)}.`;
                 messageType = 'success';
             // MODIFICATO: Usa currentEffect.resource_type
             } else if (currentEffect.resource_type === 'water') {
                 player.water = Math.min(player.water + pAmountToAdd, 10);
                 consumptionMessage = `Hai consumato ${itemInfo.name}. Idratazione +${pAmountToAdd}. Totale: ${Math.floor(player.water)}.`;
                 messageType = 'success';
             } else {
                 // MODIFICATO: Usa currentEffect.resource_type
                 console.warn(`useItem: Tipo risorsa sconosciuto in add_resource_poisonable per item '${itemId}': ${currentEffect.resource_type}`);
                 consumptionMessage = `Hai usato ${itemInfo.name}. (Effetto risorsa sconosciuto)`;
                 messageType = 'warning';
                 consumeItem = false;
             }

             // Check rischio avvelenamento (dipende da game_constants.js per le chance)
             // NOTA: La logica originale usava le probabilità direttamente nell'effetto.
             // Ora le probabilità base sono nelle costanti per centralizzazione.
             // MODIFICATO: Usa currentEffect.poison_chance
             let poisonChance = currentEffect.poison_chance || 0;
             // RIMOSSA LA SEGUENTE RIGA: if (itemId === 'berries') poisonChance = BERRIES_POISON_CHANCE;
             // Questo if per water_dirty andrebbe corretto o rimosso se water_dirty ha la sua poison_chance in ITEM_DATA
             // if (itemId === 'water_dirty') poisonChance = DIRTY_WATER_POISON_CHANCE;

             if (Math.random() < poisonChance) {
                 player.isPoisoned = true;
                 consumptionMessage += ` Ma senti subito un sapore amaro... Sei stato avvelenato!`;
                 messageType = 'danger';
             }
             effectApplied = true;
             break;

         case 'add_resource_sickness': // Aggiunge risorse con rischio malattia (usato per carne cruda)
              // Simile a add_resource, ma con check rischio malattia
              // MODIFICATO: Usa currentEffect.amount
              const sAmountToAdd = (typeof currentEffect.amount === 'object' && currentEffect.amount !== null)
                  ? getRandomInt(currentEffect.amount.min, currentEffect.amount.max)
                  : (currentEffect.amount || 1);

              // MODIFICATO: Usa currentEffect.resource_type
              if (currentEffect.resource_type === 'food') {
                  player.food = Math.min(player.food + sAmountToAdd, 10);
                  consumptionMessage = `Hai consumato ${itemInfo.name}. Sazietà +${sAmountToAdd}. Totale: ${Math.floor(player.food)}.`;
                  messageType = 'success';
              // MODIFICATO: Usa currentEffect.resource_type
              } else if (currentEffect.resource_type === 'water') { // Aggiunto caso water che mancava nel type sickness
                  player.water = Math.min(player.water + sAmountToAdd, 10);
                  consumptionMessage = `Hai consumato ${itemInfo.name}. Idratazione +${sAmountToAdd}. Totale: ${Math.floor(player.water)}.`;
                  messageType = 'success';
              } else {
                  // MODIFICATO: Usa currentEffect.resource_type
                  console.warn(`useItem: Tipo risorsa sconosciuto in add_resource_sickness per item '${itemId}': ${currentEffect.resource_type}`);
                  consumptionMessage = `Hai usato ${itemInfo.name}. (Effetto risorsa sconosciuto)`;
                  messageType = 'warning';
                  consumeItem = false;
              }

              // Check rischio malattia (dipende da game_constants.js per la chance)
              // NOTA: La logica originale usava le probabilità direttamente nell'effetto.
              // Ora le probabilità base sono nelle costanti per centralizzazione.
              // MODIFICATO: Usa currentEffect.sickness_chance
              let sicknessChance = currentEffect.sickness_chance; // Usa la probabilità definita nell'effetto

              if (Math.random() < sicknessChance) {
                  player.isSick = true;
                  consumptionMessage += ` Poco dopo, avverti un malessere... Potresti esserti ammalato!`;
                  messageType = 'danger';
              }
              effectApplied = true;
              break;


        case 'cure_status': // Cura uno stato negativo (Ferito, Malato, Avvelenato)
            // status_cured: 'isInjured', 'isSick', 'isPoisoned'
            // chance: probabilità di successo (default 1.0)
            // success_message, failure_message
            // heal_hp_on_success: HP curati in aggiunta se successo (opzionale)

            // MODIFICATO: Usa currentEffect
            const statusToCure = currentEffect.status_cured;
            const cureChance = currentEffect.chance || 1.0; // Default 100% chance

            // Verifica se il giocatore ha lo stato da curare
            if (!player[statusToCure]) {
                // console.log(`useItem: Giocatore non ha lo stato '${statusToCure}' da curare con item '${itemId}'.`); // Log di debug rimosso
                consumptionMessage = `${itemInfo.name} usato. Non hai bisogno di curare lo stato: ${statusToCure.replace('is', '')}.`;
                messageType = 'info';
                consumeItem = false; // Non consumare se lo stato non è presente
            } else {
                 // Tenta la cura
                 if (Math.random() < cureChance) {
                     player[statusToCure] = false; // Cura lo stato
                     // MODIFICATO: Usa currentEffect
                     consumptionMessage = currentEffect.success_message || `${itemInfo.name} ha curato lo stato ${statusToCure.replace('is', '')}.`;
                     messageType = 'success';
                     effectApplied = true; // Effetto applicato (cura riuscita)

                     // Applica cura HP aggiuntiva se definita
                     // MODIFICATO: Usa currentEffect
                     if (currentEffect.heal_hp_on_success) {
                        const oldHp = player.hp;
                        // MODIFICATO: Usa currentEffect
                        player.hp = Math.min(player.hp + currentEffect.heal_hp_on_success, player.maxHp);
                        const actualHeal = player.hp - oldHp;
                        consumptionMessage += ` Recuperi anche ${actualHeal} HP.`;
                     }

                 } else { // Se la cura fallisce
                     consumptionMessage = currentEffect.failure_message || `${itemInfo.name} non è riuscito a curare lo stato ${statusToCure.replace('is', '')}.`;
                     messageType = 'warning';      // AGGIUNTA
                     effectApplied = false;      // AGGIUNTA (o assicurati sia false se già impostato prima)
                 }
            }
            break;

        case 'repair_item_type': // Es. Kit di Riparazione che ripara 'weapon' O 'armor'
            // Questo effetto non consuma l'oggetto immediatamente, ma apre un altro popup.
            // La consumazione avviene in applyRepair() dopo che l'arma è stata scelta e riparata.
            // repair_amount: quantità di durabilità ripristinata
            // item_type_target: array di stringhe ['weapon', 'armor']
            // charges: numero di usi del kit
            // MODIFICATO: Usa currentEffect
            const repairAmount = currentEffect.repair_amount || 10; // Default repair amount
            const targetTypes = currentEffect.item_type_target || ['weapon', 'armor']; // Default
            const charges = currentEffect.charges || 1; // Default

            // showRepairItemTypePopup (da definire) gestirà la logica successiva
            showRepairItemTypePopup(itemId, repairAmount, targetTypes, charges);

            // Non consumare l'oggetto qui! La consumazione è gestita in applyRepair.
            consumeItem = false;
            effectApplied = true; // L'azione di avviare la riparazione è considerata un "effetto applicato"

            // Non loggiamo un messaggio generico "Item usato" qui, il popup di riparazione gestirà i messaggi.
            consumptionMessage = null; // Sopprimi il messaggio generico "Item usato"
            break;


        case 'reveal_map_area': // Per oggetti come 'map_fragment_local'
            // MODIFICATO: Usa currentEffect
            const radius = currentEffect.radius || 3; // Default radius
            if (typeof revealMapAreaAroundPlayer === 'function') {
                revealMapAreaAroundPlayer(radius);
                consumptionMessage = `${itemInfo.name} consultato. Alcune aree della mappa sono state rivelate.`;
                messageType = 'info'; // O 'lore' se preferisci per le mappe
                effectApplied = true;
                consumeItem = true; // Le mappe di solito si consumano
                if (typeof renderMap === 'function') renderMap(); // Aggiorna la mappa visualizzata
            } else {
                console.warn("useItem: Funzione revealMapAreaAroundPlayer non trovata (map_utils.js?).");
                consumptionMessage = `${itemInfo.name} consultato, ma non succede nulla (funzione mancante).`;
                messageType = 'warning';
                consumeItem = false;
            }
            break;

        // TODO: Aggiungere altri casi per tipi di effetto diversi (es. buff temporanei, ecc.)
        case 'random_pill_effect':
            if (!currentEffect.outcomes || !Array.isArray(currentEffect.outcomes) || currentEffect.outcomes.length === 0) {
                console.error(`useItem (random_pill_effect): 'outcomes' array mancante o non valido per ${itemId}`);
                consumptionMessage = "Hai preso le pillole... ma sembrano inerti.";
                messageType = 'warning';
                consumeItem = true; // Consuma anche se l'effetto è mal definito
                effectApplied = false;
                break;
            }

            // Usa chooseWeighted per selezionare un risultato basato sui pesi
            const chosenOutcome = chooseWeighted(currentEffect.outcomes); // Assumi che chooseWeighted accetti { result: ..., weight: ... }

            if (!chosenOutcome || !chosenOutcome.result) {
                 console.error(`useItem (random_pill_effect): chooseWeighted non ha restituito un risultato valido.`);
                 consumptionMessage = "Ingoi le pillole. Non senti nulla di strano.";
                 messageType = 'info';
                 consumeItem = true;
                 effectApplied = false;
                 break;
            }

            const outcomeResult = chosenOutcome.result;
            effectApplied = true; // L'effetto (anche se nullo) è stato determinato
            consumeItem = true;   // Consuma sempre la pillola

            switch (outcomeResult) {
                case 'good_heal_small':
                    const healAmount = getRandomInt(3, 7);
                    const oldHpHeal = player.hp;
                    player.hp = Math.min(player.maxHp, player.hp + healAmount);
                    const actualHeal = player.hp - oldHpHeal;
                    consumptionMessage = `Ingoi le pillole. Ti senti stranamente rinvigorito! (+${actualHeal} HP)`;
                    messageType = 'success';
                    showTemporaryMessage(consumptionMessage, 4000); // MOSTRA MESSAGGIO TEMP
                    break;
                case 'good_boost_temp':
                    // Per ora solo un messaggio, nessun effetto meccanico di buff temporaneo
                    consumptionMessage = "Prendi le pillole. Per un momento, ti senti più leggero e scattante!";
                    messageType = 'success';
                    showTemporaryMessage(consumptionMessage, 4000); // MOSTRA MESSAGGIO TEMP
                    // TODO: Implementare buff temporanei se necessario
                    break;
                case 'good_cure_minor':
                    if (player.isInjured) {
                        player.isInjured = false;
                        consumptionMessage = "Le pillole hanno un sapore strano, ma il dolore della tua ferita sembra alleviarsi.";
                        messageType = 'success';
                    } else {
                        consumptionMessage = "Ingoi le pillole. Non sembrano avere effetto sulle tue condizioni attuali.";
                        messageType = 'info';
                        effectApplied = false; // Nessun cambiamento di stato effettivo
                    }
                    showTemporaryMessage(consumptionMessage, 4000); // MOSTRA MESSAGGIO TEMP
                    break;
                case 'bad_damage_small':
                    const damageAmount = getRandomInt(2, 5);
                    const oldHpDmg = player.hp;
                    player.hp = Math.max(0, player.hp - damageAmount);
                    const actualDamage = oldHpDmg - player.hp;
                    consumptionMessage = `Prendi le pillole e subito dopo senti una fitta allo stomaco! (-${actualDamage} HP)`;
                    messageType = 'danger';
                     if (player.hp <= 0) { // Check morte immediato
                         consumptionMessage += " ...fatale.";
                         // endGame sarà chiamato da useItem dopo lo switch
                     }
                    showTemporaryMessage(consumptionMessage, 4000); // MOSTRA MESSAGGIO TEMP
                    break;
                case 'bad_nausea_temp':
                    // Solo messaggio, nessun effetto meccanico di status temporaneo
                    consumptionMessage = "Dopo aver preso le pillole, la testa inizia a girare e senti una leggera nausea.";
                    messageType = 'warning';
                    showTemporaryMessage(consumptionMessage, 4000); // MOSTRA MESSAGGIO TEMP
                    // TODO: Implementare status temporanei minori se necessario
                    break;
                case 'neutral_nothing':
                default:
                    consumptionMessage = "Ingoi le pillole sospette... non senti alcun effetto particolare.";
                    messageType = 'info';
                    effectApplied = false; // Nessun effetto meccanico
                    showTemporaryMessage(consumptionMessage, 4000); // MOSTRA MESSAGGIO TEMP
                    break;
            }
            break; // Fine case 'random_pill_effect'
        // ...

        case 'learn_recipe': // NUOVO CASO PER IMPARARE RICETTE
            if (currentEffect.recipeKey) {
                if (!player.knownRecipes.includes(currentEffect.recipeKey)) {
                    player.knownRecipes.push(currentEffect.recipeKey);
                    const recipeDetails = CRAFTING_RECIPES[currentEffect.recipeKey];
                    const learnedItemName = recipeDetails ? (recipeDetails.productName || recipeDetails.productId) : currentEffect.recipeKey;
                    consumptionMessage = `Hai studiato il progetto e imparato a creare: ${learnedItemName}!`;
                    messageType = 'success';
                    addMessage(consumptionMessage, messageType, true);
                    // Il blueprint viene consumato, quindi consumeItem rimane true (default)
                    effectApplied = true;
                } else {
                    consumptionMessage = `Conosci già la ricetta per ${CRAFTING_RECIPES[currentEffect.recipeKey]?.productName || currentEffect.recipeKey}.`;
                    messageType = 'info';
                    addMessage(consumptionMessage, messageType);
                    consumeItem = false; // Non consumare se già conosciuta
                    effectApplied = false;
                }
            } else {
                console.error(`useItem (learn_recipe): recipeKey mancante nell'effetto per ${itemId}`);
                consumptionMessage = "Questo progetto sembra incompleto o illeggibile.";
                messageType = 'warning';
                consumeItem = true; // Consuma anche se mal definito per non lasciarlo nell'inventario
                effectApplied = false;
            }
            break;

        case 'show_lore':
            // Assumiamo che loreFragments (da game_data.js) sia accessibile globalmente
            // e getRandomText (da game_utils.js) sia accessibile globalmente.
            if (typeof getRandomText === 'function' && typeof loreFragments !== 'undefined' && loreFragments.length > 0) {
                addMessage(getRandomText(loreFragments), 'lore');
            } else {
                addMessage("Hai esaminato il frammento, ma le parole svaniscono prima che tu possa comprenderle... (Errore: Risorse lore non trovate)", 'warning');
                console.warn("useItem (show_lore): getRandomText o loreFragments non disponibili/vuoti.");
            }
            consumptionMessage = 'Hai esaminato il frammento...';
            messageType = 'lore';
            effectApplied = true;
            consumeItem = true;
            break;

        default:
            // MODIFICATO: Usa currentEffect
            console.warn(`useItem: Tipo effetto '${currentEffect.type}' non gestito per item '${itemId}'.`);
            consumptionMessage = `${itemInfo.name} usato, ma l'effetto è sconosciuto.`;
            messageType = 'warning';
            consumeItem = false; // Non consumare se l'effetto non è gestito
            effectApplied = false;
            break;
    }

    // Consumazione dell'oggetto dopo l'applicazione dell'effetto (se consentito)
    if (consumeItem) {
        const itemSlotPrimaRimozione = player.inventory.find(s => s.itemId === itemId);
        // Logga una copia profonda per evitare problemi con riferimenti modificati
        // console.log(`DEBUG: useItem - Prima di removeItemFromInventory per ${itemId}. Slot (quantità attuale): ${itemSlotPrimaRimozione ? itemSlotPrimaRimozione.quantity : 'NON TROVATO'}, itemSlotPrimaRimozione ? JSON.parse(JSON.stringify(itemSlotPrimaRimozione)) : ''}`, itemSlotPrimaRimozione ? JSON.parse(JSON.stringify(itemSlotPrimaRimozione)) : '');

         // Rimuovi 1 quantità dell'oggetto dall'inventario
         removeItemFromInventory(itemId, 1);
         // removeItemFromInventory chiama già renderInventory e addMessage

        const itemSlotDopoRimozione = player.inventory.find(s => s.itemId === itemId);
        // Logga una copia profonda
        // console.log(`DEBUG: useItem - Dopo removeItemFromInventory per ${itemId}. Slot (quantità attuale): ${itemSlotDopoRimozione ? itemSlotDopoRimozione.quantity : 'NON TROVATO (o rimosso)'}, itemSlotDopoRimozione ? JSON.parse(JSON.stringify(itemSlotDopoRimozione)) : ''}`, itemSlotDopoRimozione ? JSON.parse(JSON.stringify(itemSlotDopoRimozione)) : '');
    }


    // Log del messaggio di ESITO (se non soppresso)
    // MODIFICATO: Logga sempre il consumptionMessage se non è null, indipendentemente da consumeItem
    if (consumptionMessage !== null) {
         addMessage(consumptionMessage, messageType);
    }


    // Aggiorna la UI delle stats (HP, risorse, stato)
    if (typeof renderStats === 'function') {
         renderStats();
    } else {
         console.warn("useItem: renderStats non disponibile.");
    }

    // Controlla se il giocatore è morto a seguito di effetti negativi dall'uso (raro, ma possibile)
    if (player.hp <= 0) {
        if (typeof endGame === 'function') endGame(false);
        return; // Esce subito se morto
    }

    // Chiude il popup dell'evento/azione oggetto DOPO che l'effetto è stato gestito
    // (Tranne se un nuovo popup viene aperto, come nel caso 'repair_weapon')
    if (typeof closeEventPopup === 'function' && consumeItem) { // Chiudi solo se l'oggetto è stato consumato (per evitare doppio popup per riparazione)
        closeEventPopup();
    }
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
    else if (player.food <= 0 && player.water <= 0 && Math.random() < checkChance) {
        addMessage(getRandomText(STATO_MESSAGGI.AFFAMATO_E_ASSETATO), 'warning');
    }
    // Check Fame (solo se non assetato)
    else if (player.food <= 0 && Math.random() < checkChance) {
        addMessage(getRandomText(STATO_MESSAGGI.AFFAMATO), 'warning');
    }
    // Check Sete (solo se non affamato)
    else if (player.water <= 0 && Math.random() < checkChance) {
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

    // Aggiorna UI (già fatto da removeItem e addItem, ma per sicurezza)
    if (typeof renderInventory === 'function') renderInventory();
    if (typeof renderStats === 'function') renderStats(); // Anche le stats per sicurezza

    // La chiusura del popup avviene nell'handler del bottone in showItemActionPopup
}

// --- FINE LOGICA GIOCATORE ---
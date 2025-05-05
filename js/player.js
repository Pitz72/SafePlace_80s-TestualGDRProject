/**
 * TheSafePlace - Roguelike Postapocalittico
 * File: js/player.js
 * Descrizione: Gestione logica del giocatore, statistiche, inventario ed equipaggiamento.
 * Dipende da: game_constants.js, game_data.js, game_utils.js, ui.js
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
        maxHp: 0, // Calcolato dopo gli attributi base
        hp: 0, // Inizializza con HP pieni
        food: STARTING_FOOD,
        water: STARTING_WATER,

        // Posizione (verrà definita in map.js durante la generazione della mappa)
        x: -1, // -1 o undefined per indicare non ancora posizionato
        y: -1,

        // Stati negativi (boolean flags)
        isInjured: false, // Ferito: Subisce danno per movimento/notte, penalità a Potenza/Agilità check
        isSick: false,    // Malato: Subisce danno per movimento/notte, penalità a Vigore/Adattamento check, consumo extra risorse
        isPoisoned: false, // Avvelenato: Subisce danno per movimento/notte, penalità a Agilità/Adattamento check (o altro a seconda del design)

        // Flag stato notturno (non salvato, solo per logica transizione)
        hasBeenWarnedAboutNight: false, // Per non spammare il messaggio di pericolo notturno

        // Equipaggiamento (memorizza l'itemId dell'oggetto equipaggiato)
        equippedWeapon: null, // ID dell'arma equipaggiata
        equippedArmor: null,  // ID dell'armatura equipaggiata

        // Inventario: array di oggetti { itemId: string, quantity: number }
        inventory: []
    };

    // Calcola HP massimi basati sul Vigore (formula base: 10 + Vigore)
    player.maxHp = 10 + player.vigore;
    player.hp = player.maxHp; // Inizia con HP pieni

    // Aggiunge oggetti iniziali all'inventario (usando la funzione addItemToInventory definita qui sotto)
    addItemToInventory('bandages_dirty', 2);
    addItemToInventory('water_purified_small', 1);
    addItemToInventory('canned_food', 1);
    addItemToInventory('suspicious_pills', 1);
    addItemToInventory('scrap_metal', getRandomInt(1,3)); // Inizia con qualche materiale

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

    // Cerca se l'oggetto è già presente nell'inventario
    const existingItemSlot = player.inventory.find(slot => slot.itemId === itemId);

    // Se l'oggetto è stackable (o non ha la proprietà stackable, consideriamo true di default per stackable)
    // e esiste già nell'inventario:
    const isStackable = itemInfo.stackable !== false; // stackable: false è esplicito per non stackabili

    if (isStackable && existingItemSlot) {
        // Se esiste e stackable, aumenta la quantità
        existingItemSlot.quantity += quantity;
        // console.log(`Aggiunto ${quantity}x ${itemInfo.name} all'inventario. Quantità totale: ${existingItemSlot.quantity}`); // Log di debug
    } else {
        // Se non esiste OPPURE non è stackable: aggiungi un nuovo slot (se c'è spazio)
        if (player.inventory.length >= MAX_INVENTORY_SLOTS) {
            // Inventario pieno, informa il giocatore e non aggiungere
            // console.warn(`addItemToInventory: Inventario pieno, non puoi raccogliere ${itemInfo.name}.`); // Log di debug
            addMessage(`Inventario pieno (${player.inventory.length}/${MAX_INVENTORY_SLOTS} slot)! Non puoi raccogliere ${itemInfo.name}.`, 'warning');
            // TODO: Potrebbe essere utile permettere al giocatore di scegliere cosa lasciare cadere
            return; // Esce dalla funzione senza aggiungere
        }

        // Aggiungi un nuovo oggetto all'inventario con la quantità specificata
        player.inventory.push({ itemId: itemId, quantity: quantity });
        // console.log(`Aggiunto ${itemInfo.name} (x${quantity}) all'inventario in un nuovo slot.`); // Log di debug
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

    // Se quantityToRemove <= 0, rimuovi l'intero stack
    if (quantityToRemove <= 0 || quantityToRemove >= player.inventory[itemIndex].quantity) {
        const removedQuantity = player.inventory[itemIndex].quantity;
        player.inventory.splice(itemIndex, 1); // Rimuovi l'elemento dall'array

         // console.log(`Rimosso intero stack di ${itemName} (x${removedQuantity}) dall'inventario.`); // Log di debug
        addMessage(`Hai perso ${itemName} (x${removedQuantity}).`, 'info');

    } else {
        // Altrimenti, riduci la quantità
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
    if (!itemInfo.usable) {
        addMessage(`${itemInfo.name} non può essere usato direttamente.`, "warning");
        if (typeof closeEventPopup === 'function') closeEventPopup();
        return;
    }
    if (!itemInfo.effect) {
        console.warn(`useItem: Oggetto '${itemId}' non ha un effetto definito.`);
        addMessage(`${itemInfo.name} non ha effetto quando usato.`, "warning");
        // Consumiamo comunque l'oggetto se è "usato" anche senza effetto definito? Decidiamo di NO per ora.
        if (typeof closeEventPopup === 'function') closeEventPopup();
        return;
    }

    let effectApplied = false;
    let consumptionMessage = `${itemInfo.name} usato.`; // Messaggio iniziale sull'uso
    let consumeItem = true; // Flag per decidere se consumare l'oggetto dopo l'uso
    let messageType = 'info'; // Tipo messaggio default


    // Gestisce i vari tipi di effetti (definiti nell'oggetto effect in ITEM_DATA)
    switch (itemInfo.effect.type) {

        case 'add_resource': // Aumenta risorse (HP, Cibo, Acqua)
            // amount può essere un numero fisso o un intervallo {min, max}
            const amountToAdd = (typeof itemInfo.effect.amount === 'object' && itemInfo.effect.amount !== null)
                ? getRandomInt(itemInfo.effect.amount.min, itemInfo.effect.amount.max)
                : (itemInfo.effect.amount || 1); // Default a 1 se amount non definito

            if (itemInfo.effect.resource_type === 'hp') {
                const oldHp = player.hp;
                player.hp = Math.min(player.hp + amountToAdd, player.maxHp);
                const actualHeal = player.hp - oldHp; // Quanto HP è stato effettivamente curato
                consumptionMessage = `Hai usato ${itemInfo.name}. Recuperi ${actualHeal} HP.`;
                if (actualHeal > 0) messageType = 'success'; else messageType = 'info';
                // TODO: Aggiungere effetto visivo di cura?
            } else if (itemInfo.effect.resource_type === 'food') {
                player.food = Math.min(player.food + amountToAdd, 10); // Limite Sazietà a 10
                 consumptionMessage = `Hai usato ${itemInfo.name}. Sazietà +${amountToAdd}. Totale: ${Math.floor(player.food)}.`;
                 messageType = 'success';
            } else if (itemInfo.effect.resource_type === 'water') {
                player.water = Math.min(player.water + amountToAdd, 10); // Limite Idratazione a 10
                 consumptionMessage = `Hai usato ${itemInfo.name}. Idratazione +${amountToAdd}. Totale: ${Math.floor(player.water)}.`;
                 messageType = 'success';
            } else {
                console.warn(`useItem: Tipo risorsa sconosciuto in add_resource per item '${itemId}': ${itemInfo.effect.resource_type}`);
                consumptionMessage = `Hai usato ${itemInfo.name}. (Effetto sconosciuto)`;
                 messageType = 'warning';
                 consumeItem = false; // Non consumare se l'effetto è sconosciuto
            }
            effectApplied = true;
            break;

        case 'add_resource_poisonable': // Aggiunge risorse con rischio avvelenamento
             // Simile a add_resource, ma con check rischio
             const pAmountToAdd = (typeof itemInfo.effect.amount === 'object' && itemInfo.effect.amount !== null)
                 ? getRandomInt(itemInfo.effect.amount.min, itemInfo.effect.amount.max)
                 : (itemInfo.effect.amount || 1);

             if (itemInfo.effect.resource_type === 'food') {
                 player.food = Math.min(player.food + pAmountToAdd, 10);
                 consumptionMessage = `Hai consumato ${itemInfo.name}. Sazietà +${pAmountToAdd}. Totale: ${Math.floor(player.food)}.`;
                 messageType = 'success';
             } else if (itemInfo.effect.resource_type === 'water') {
                 player.water = Math.min(player.water + pAmountToAdd, 10);
                 consumptionMessage = `Hai consumato ${itemInfo.name}. Idratazione +${pAmountToAdd}. Totale: ${Math.floor(player.water)}.`;
                 messageType = 'success';
             } else {
                 console.warn(`useItem: Tipo risorsa sconosciuto in add_resource_poisonable per item '${itemId}': ${itemInfo.effect.resource_type}`);
                 consumptionMessage = `Hai usato ${itemInfo.name}. (Effetto risorsa sconosciuto)`;
                 messageType = 'warning';
                 consumeItem = false;
             }

             // Check rischio avvelenamento (dipende da game_constants.js per le chance)
             // NOTA: La logica originale usava le probabilità direttamente nell'effetto.
             // Ora le probabilità base sono nelle costanti per centralizzazione.
             let poisonChance = itemInfo.effect.poison_chance;
             if (itemId === 'berries') poisonChance = BERRIES_POISON_CHANCE;
             if (itemId === 'water_dirty') poisonChance = DIRTY_WATER_POISON_CHANCE;

             if (Math.random() < poisonChance) {
                 player.isPoisoned = true;
                 consumptionMessage += ` Ma senti subito un sapore amaro... Sei stato avvelenato!`;
                 messageType = 'danger';
             }
             effectApplied = true;
             break;

         case 'add_resource_sickness': // Aggiunge risorse con rischio malattia (usato per carne cruda)
              // Simile a add_resource, ma con check rischio malattia
              const sAmountToAdd = (typeof itemInfo.effect.amount === 'object' && itemInfo.effect.amount !== null)
                  ? getRandomInt(itemInfo.effect.amount.min, itemInfo.effect.amount.max)
                  : (itemInfo.effect.amount || 1);

              if (itemInfo.effect.resource_type === 'food') {
                  player.food = Math.min(player.food + sAmountToAdd, 10);
                  consumptionMessage = `Hai consumato ${itemInfo.name}. Sazietà +${sAmountToAdd}. Totale: ${Math.floor(player.food)}.`;
                  messageType = 'success';
              } else {
                  console.warn(`useItem: Tipo risorsa sconosciuto in add_resource_sickness per item '${itemId}': ${itemInfo.effect.resource_type}`);
                  consumptionMessage = `Hai usato ${itemInfo.name}. (Effetto risorsa sconosciuto)`;
                  messageType = 'warning';
                  consumeItem = false;
              }

              // Check rischio malattia (dipende da game_constants.js per la chance)
              // NOTA: La logica originale usava le probabilità direttamente nell'effetto.
              // Ora le probabilità base sono nelle costanti per centralizzazione.
              let sicknessChance = itemInfo.effect.sickness_chance; // Usa la probabilità definita nell'effetto

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

            const statusToCure = itemInfo.effect.status_cured;
            const cureChance = itemInfo.effect.chance || 1.0; // Default 100% chance

            // Verifica se il giocatore ha lo stato da curare
            if (!player[statusToCure]) {
                // console.log(`useItem: Giocatore non ha lo stato '${statusToCure}' da curare con item '${itemId}'.`); // Log di debug rimosso
                consumptionMessage = `${itemInfo.name} usato. Non hai bisogno di curare lo stato: ${statusToCure}.`;
                messageType = 'info';
                consumeItem = false; // Non consumare se lo stato non è presente
            } else {
                 // Tenta la cura
                 if (Math.random() < cureChance) {
                     player[statusToCure] = false; // Cura lo stato
                     consumptionMessage = itemInfo.effect.success_message || `${itemInfo.name} ha curato lo stato ${statusToCure}.`;
                     messageType = 'success';
                     effectApplied = true; // Effetto applicato (cura riuscita)

                     // Applica cura HP aggiuntiva se definita
                     if (itemInfo.effect.heal_hp_on_success) {
                        const oldHp = player.hp;
                        player.hp = Math.min(player.hp + itemInfo.effect.heal_hp_on_success, player.maxHp);
                        const actualHeal = player.hp - oldHp;
                        consumptionMessage += ` Recuperi anche ${actualHeal} HP.`;
                     }

                 } else {
                     consumptionMessage = itemInfo.effect.failure_message || `${itemInfo.name} non è riuscito a curare lo stato ${statusToCure}.`;
                     messageType = 'warning';
                     effectApplied = false; // Effetto non applicato (cura fallita)
                 }
            }
            break;

        case 'repair_weapon': // Avvia il processo di riparazione arma (Kit di riparazione)
            // Questo effetto non consuma l'oggetto immediatamente, ma apre un altro popup.
            // La consumazione avviene in applyRepair() dopo che l'arma è stata scelta e riparata.
            // repair_amount: quantità di durabilità ripristinata
            const repairAmount = itemInfo.effect.repair_amount || 10; // Default repair amount

            // showRepairWeaponPopup (definita qui sotto) gestirà la logica successiva
            showRepairWeaponPopup(itemId, repairAmount);

            // Non consumare l'oggetto qui! La consumazione è gestita in applyRepair.
            consumeItem = false;
            effectApplied = true; // L'azione di avviare la riparazione è considerata un "effetto applicato"

            // Non loggiamo un messaggio generico "Item usato" qui, showRepairWeaponPopup gestirà i messaggi.
            consumptionMessage = null; // Sopprimi il messaggio generico "Item usato"
            break;

        case 'show_lore': // Rivelare un frammento di lore (per item lore)
             if (itemInfo.effect.text_array_ref === 'loreFragments' && Array.isArray(loreFragments)) {
                 const loreText = getRandomText(loreFragments); // Usa la utility per testo casuale
                 if (loreText) {
                     addMessage("Hai letto un frammento di lore:", 'lore', true); // Messaggio principale per lore
                     addMessage(loreText, 'lore'); // Il frammento effettivo
                 }
                 consumptionMessage = `Hai esaminato ${itemInfo.name}.`;
                 messageType = 'info';
                 effectApplied = true;
                 consumeItem = true; // I frammenti di lore sono tipicamente consumati

             } else {
                 console.warn(`useItem: Tipo lore sconosciuto o array non valido per item '${itemId}'.`);
                 consumptionMessage = `Hai esaminato ${itemInfo.name}, ma non rivela nulla.`;
                 messageType = 'warning';
                 effectApplied = false; // Nessun lore trovato
                 consumeItem = false; // Non consumare se non rivela lore
             }
            break;

        default:
            console.warn(`useItem: Tipo di effetto item sconosciuto per item '${itemId}': ${itemInfo.effect.type}`);
            consumptionMessage = `Hai usato ${itemInfo.name}. (Effetto sconosciuto)`;
            messageType = 'warning';
            effectApplied = false; // Non considerare l'effetto applicato
            consumeItem = false; // Non consumare se l'effetto non è gestito

    }

    // Consumazione dell'oggetto dopo l'applicazione dell'effetto (se consentito)
    if (consumeItem) {
         // Rimuovi 1 quantità dell'oggetto dall'inventario
         removeItemFromInventory(itemId, 1);
         // removeItemFromInventory chiama già renderInventory e addMessage
    }


    // Log del messaggio di utilizzo (se non soppresso)
    if (consumptionMessage !== null) {
         // Se l'oggetto è stato consumato, il messaggio è già stato loggato da removeItemFromInventory.
         // Altrimenti, logga il messaggio di uso.
         if (!consumeItem) {
             addMessage(consumptionMessage, messageType);
         }
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

    // Determina lo slot di equipaggiamento corretto ('equippedWeapon' o 'equippedArmor')
    let equippedSlotKey;
    if (itemInfo.type === 'weapon') {
        equippedSlotKey = 'equippedWeapon';
    } else { // itemInfo.type === 'armor'
        equippedSlotKey = 'equippedArmor';
    }

    const previouslyEquippedItemId = player[equippedSlotKey];

    // 1. Rimuovi il NUOVO oggetto dallo slot dell'inventario da cui è stato selezionato
    // Dato che armi/armature sono stackable: false, rimuoviamo l'intero slot.
    // Usiamo splice per rimuovere l'elemento all'indice trovato.
    player.inventory.splice(itemIndexInInventory, 1);
    // console.log(`equipItem: Rimosso '${itemInfo.name}' dall'inventario (indice ${itemIndexInInventory}).`); // Log di debug


    // 2. Se c'era un oggetto equipaggiato prima, rimettilo nell'inventario
    if (previouslyEquippedItemId) {
        // console.log(`equipItem: C'era un item equipaggiato: '${previouslyEquippedItemId}'.`); // Log di debug
        // addItemToInventory gestisce l'aggiunta sia per oggetti stackabili che non.
        // Passiamo quantity 1 perché stiamo riaggiungendo un singolo oggetto precedentemente equipaggiato.
        addItemToInventory(previouslyEquippedItemId, 1);
        const oldItemInfo = ITEM_DATA[previouslyEquippedItemId];
        // Messaggio automatico dall'aggiunta all'inventario
        addMessage(`Hai rimosso ${oldItemInfo?.name || 'oggetto sconosciuto'}.`, 'info');
    } else {
         // console.log(`equipItem: Nessun item equipaggiato prima.`); // Log di debug
    }


    // 3. Equipaggia il nuovo oggetto impostando il suo ID nello slot del giocatore
    player[equippedSlotKey] = itemId;
    // console.log(`equipItem: Equipaggiato '${itemInfo.name}' in slot ${equippedSlotKey}.`); // Log di debug


    // 4. Aggiorna la UI
    if (typeof renderInventory === 'function') renderInventory(); else console.warn("equipItem: renderInventory non disponibile.");
    if (typeof renderStats === 'function') renderStats(); else console.warn("equipItem: renderStats non disponibile.");


    // 5. Logga un messaggio di successo
    addMessage(`Hai equipaggiato ${itemInfo.name}.`, 'success', true);

    // 6. Chiude il popup dell'azione oggetto
    if (typeof closeEventPopup === 'function') closeEventPopup(); else console.warn("equipItem: closeEventPopup non disponibile.");
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


    const equippedItemId = player[slotKey];

    // 1. Verifica se c'è un oggetto equipaggiato in quello slot
    if (!equippedItemId) {
        // console.warn(`unequipItem: Nessun oggetto equipaggiato nello slot '${slotKey}'.`); // Log di debug rimosso
        // addMessage(`Nessun oggetto da rimuovere dallo slot ${slotKey === 'equippedWeapon' ? 'Arma' : 'Armatura'}.`, "info"); // Messaggio loggato solo se si tenta l'azione dalla UI
        return false;
    }

    // Verifica che l'ID dell'oggetto equipaggiato esista nei dati
    const itemInfo = ITEM_DATA[equippedItemId];
    if (!itemInfo) {
        console.error(`unequipItem: Dati non trovati per l'oggetto equipaggiato '${equippedItemId}' nello slot '${slotKey}'.`);
        player[slotKey] = null; // Rimuovi comunque l'ID non valido dallo slot
        if (typeof renderStats === 'function') renderStats();
        addMessage(`Rimosso oggetto sconosciuto dallo slot equipaggiato.`, "warning");
        return false;
    }

    // 2. Aggiungi l'oggetto all'inventario (sempre quantity 1)
    // addItemToInventory gestisce la non-stackabilità e il limite di slot
    // Se l'inventario è pieno, l'oggetto non verrà aggiunto e il giocatore dovrà scegliere cosa lasciare.
    // Per ora, se l'inventario è pieno, l'oggetto rimosso andrà perso!
    const addedToInventory = addItemToInventory(equippedItemId, 1); // addItemToInventory logga già il messaggio se inventario pieno

    // 3. Libera lo slot di equipaggiamento SOLO se l'oggetto è stato aggiunto all'inventario
    // (o se decidiamo che va perso se l'inventario è pieno, ma la logica attuale di addItemToInventory
    // non indica successo/fallimento, solo logga un warning)
    // Modifichiamo addItemToInventory per ritornare true/false o controlliamo la lunghezza dell'inventario.
    // Alternativa: aggiungere l'oggetto rimosso all'inventario *prima* di rimuoverlo dallo slot,
    // e gestire il caso inventario pieno lì. O più semplice: l'oggetto va semplicemente nell'inventario.
    // Se l'inventario è pieno, non viene aggiunto e basta. Lo slot viene comunque liberato.

    player[slotKey] = null; // Libera lo slot equipaggiato
    // console.log(`unequipItem: Rimosso '${itemInfo.name}' dallo slot '${slotKey}'.`); // Log di debug

    // 4. Aggiorna la UI
    if (typeof renderInventory === 'function') renderInventory(); else console.warn("unequipItem: renderInventory non disponibile.");
    if (typeof renderStats === 'function') renderStats(); else console.warn("unequipItem: renderStats non disponibile.");


    // 5. Logga un messaggio
    if (addedToInventory) {
        addMessage(`Hai rimosso ${itemInfo.name} dallo slot equipaggiato e aggiunto all'inventario.`, 'info', true);
    } else {
        // Il messaggio "Inventario pieno" è già loggato da addItemToInventory
        addMessage(`Hai rimosso ${itemInfo.name} dallo slot equipaggiato. Non c'è spazio nell'inventario, l'oggetto è andato perso!`, 'warning', true);
    }


    // Non chiudiamo il popup qui, questa funzione non è chiamata direttamente da un popup.
    // La logica che la chiama (es. un'azione futura "Rimuovi equipaggiamento") gestirà la chiusura.

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
function showRepairWeaponPopup(repairKitId, repairAmount) {
    // Trova tutte le armi nell'inventario E quelle equipaggiate che necessitano riparazione
    const repairableItems = player.inventory
        .filter(slot => {
            const item = ITEM_DATA[slot.itemId];
            return item &&
                   (item.type === 'weapon' || item.type === 'armor') && // Ripara armi E armature
                   item.durability !== undefined &&
                   item.maxDurability !== undefined &&
                   item.durability < item.maxDurability;
        })
        .concat(
            // Aggiungi l'arma equipaggiata se riparabile
            player.equippedWeapon ? [{itemId: player.equippedWeapon, quantity: 1}] : [],
            // Aggiungi l'armatura equipaggiata se riparabile
            player.equippedArmor ? [{itemId: player.equippedArmor, quantity: 1}] : []
        )
        .filter((slot, index, self) => {
            // Filtra i duplicati nel caso l'oggetto equipaggiato sia anche nell'inventario (non dovrebbe succedere)
            // o se un oggetto è presente in più slot (se stackable fosse true per armi/armature, cosa che non è)
            // e rimuovi quelli che non sono danneggiati (secondo filtro)
             const item = ITEM_DATA[slot.itemId];
             return item &&
                    item.durability !== undefined && item.maxDurability !== undefined && item.durability < item.maxDurability &&
                    index === self.findIndex((s) => s.itemId === slot.itemId); // Rimuove duplicati basati su itemId
         });


    // Se non ci sono armi o armature da riparare, informa il giocatore e chiudi il popup
    if (repairableItems.length === 0) {
        addMessage("Non hai equipaggiamento che necessita riparazione.", "info");
        if (typeof closeEventPopup === 'function') closeEventPopup();
        return;
    }

    // Crea il titolo e la descrizione del popup
    const popupTitle = "Seleziona equipaggiamento da riparare";
    const popupDescription = `Scegli quale oggetto riparare con il Kit di Riparazione (+${repairAmount} durabilità):`;

    // Crea le scelte del popup, una per ogni oggetto riparabile
    const popupChoices = repairableItems.map(slot => {
        const item = ITEM_DATA[slot.itemId];
        const isEquipped = player.equippedWeapon === item.id || player.equippedArmor === item.id;
        const locationText = isEquipped ? " (Equipaggiato)" : ` (Inventario x${slot.quantity})`;

        return {
            text: `${item.name}${locationText} (${Math.floor(item.durability)}/${item.maxDurability})`,
            // L'azione chiama applyRepair con l'ID dell'oggetto da riparare
            action: () => applyRepair(repairKitId, item.id, repairAmount)
            // Nota: passiamo item.id (l'ID dell'oggetto), non l'indice dello slot nell'inventario
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
    // Usiamo showEventPopup, ma con un flag per indicare che è un popup di azione (non un evento complesso)
    // Questo aiuta handleChoiceContainerClick a capire come gestire il click.
    if (typeof showEventPopup === 'function') {
        showEventPopup({
            title: popupTitle,
            description: popupDescription,
            choices: popupChoices,
            isActionPopup: true // Flag per indicare che è un popup di azione (gestito diversamente da handleChoiceContainerClick)
        });
    } else {
        console.error("showRepairWeaponPopup: showEventPopup non disponibile.");
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
function applyRepair(repairKitId, targetItemId, repairAmount) {
     // console.log(`applyRepair: Tentativo di riparare '${targetItemId}' con kit '${repairKitId}' (+${repairAmount} durabilità)`); // Log di debug

    // Trova i dati dell'oggetto da riparare (potrebbe essere equipaggiato o in inventario)
    const targetItemInfo = ITEM_DATA[targetItemId];

    // Trova l'oggetto nello slot equipaggiato O il primo slot nell'inventario che lo contiene
    let targetItemSlot;
    let isEquipped = false;

    if (player.equippedWeapon === targetItemId) {
        targetItemSlot = targetItemInfo; // Usiamo l'oggetto dati come riferimento temporaneo
        isEquipped = true;
    } else if (player.equippedArmor === targetItemId) {
        targetItemSlot = targetItemInfo;
        isEquipped = true;
    } else {
        // Cerca nell'inventario
        const inventorySlot = player.inventory.find(slot => slot.itemId === targetItemId);
        if (inventorySlot) {
            targetItemSlot = ITEM_DATA[inventorySlot.itemId]; // Usiamo l'oggetto dati, ma l'indice slot è necessario per rimuovere
            // Conserviamo l'indice per la possibile rimozione dell'item (anche se repair non rimuove item, solo durabilità)
            // targetItemSlot.inventoryIndex = player.inventory.indexOf(inventorySlot); // Non usata per ora, ma utile
        } else {
             // Questo caso non dovrebbe accadere se showRepairWeaponPopup funziona correttamente
            console.error(`applyRepair: Oggetto target '${targetItemId}' non trovato equipaggiato o nell'inventario!`);
            addMessage("Errore interno durante la riparazione.", "danger");
            if (typeof closeEventPopup === 'function') closeEventPopup();
            return;
        }
    }


    // Verifiche finali
    if (!targetItemInfo || (targetItemInfo.type !== 'weapon' && targetItemInfo.type !== 'armor') ||
        targetItemInfo.durability === undefined || targetItemInfo.maxDurability === undefined) {
        console.error(`applyRepair: Oggetto target '${targetItemId}' non valido per riparazione.`);
        addMessage(`Impossibile riparare l'oggetto selezionato (${targetItemInfo?.name || targetItemId}).`, "error");
        if (typeof closeEventPopup === 'function') closeEventPopup();
        return;
    }
    // Anche se showRepairWeaponPopup filtra, ricontrolliamo che l'arma non sia già al massimo
    if (targetItemInfo.durability >= targetItemInfo.maxDurability) {
        addMessage(`${targetItemInfo.name} è già in perfette condizioni.`, "info");
         // Consumiamo il kit anche se l'arma è già riparata? Decidiamo di NO.
         // console.log("applyRepair: Target già riparato, non consumo kit."); // Log di debug
        if (typeof closeEventPopup === 'function') closeEventPopup();
        return;
    }


    // Consuma il kit di riparazione (sempre 1 quantità per uso)
    // Questa funzione (removeItemFromInventory) è definita qui
    const kitConsumed = removeItemFromInventory(repairKitId, 1);

    if (!kitConsumed) {
         // Questo non dovrebbe succedere se showRepairWeaponPopup è chiamato correttamente,
         // ma è una safety check.
         console.error(`applyRepair: Kit di riparazione '${repairKitId}' non trovato nell'inventario!`);
         addMessage("Errore: Kit di riparazione non trovato durante l'applicazione.", "danger");
         if (typeof closeEventPopup === 'function') closeEventPopup();
         return;
    }


    // Applica la riparazione all'oggetto target
    const oldDurability = targetItemInfo.durability;
    // NOTA: Modifichiamo direttamente l'oggetto in ITEM_DATA. Poiché gli oggetti
    // nell'inventario/equipaggiamento sono solo riferimenti all'ID, questo funziona.
    targetItemInfo.durability = Math.min(targetItemInfo.maxDurability, targetItemInfo.durability + repairAmount);
    const actualRepair = targetItemInfo.durability - oldDurability;


    // Aggiorna la UI (stats per equipaggiamento, inventario se era lì)
    if (typeof renderInventory === 'function') renderInventory(); else console.warn("applyRepair: renderInventory non disponibile.");
    if (typeof renderStats === 'function') renderStats(); else console.warn("applyRepair: renderStats non disponibile.");


    // Logga un messaggio di successo
    addMessage(`Hai riparato ${targetItemInfo.name} (+${actualRepair} durabilità).`, "success", true);
    // console.log(`applyRepair: Riparato '${targetItemId}'. Nuova durabilità: ${targetItemInfo.durability}/${targetItemInfo.maxDurability}.`); // Log di debug

    // Chiude il popup di selezione equipaggiamento (che era stato aperto da showRepairWeaponPopup)
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
 * Richiede useItem, equipItem, dropItem, showRepairWeaponPopup (definite qui).
 * @param {string} itemId - L'ID dell'oggetto selezionato.
 */
function showItemActionPopup(itemId) {
    // console.log(`showItemActionPopup: Creazione popup azioni per item '${itemId}'`); // Log di debug

    const itemInfo = ITEM_DATA[itemId];
    const itemInInventory = player.inventory.find(slot => slot.itemId === itemId);

    // Verifiche preliminari
    if (!itemInfo || !itemInInventory) {
        console.error(`showItemActionPopup: Oggetto '${itemId}' non trovato o non nell'inventario.`);
        addMessage("Errore nel selezionare l'oggetto.", "warning");
        if (typeof closeEventPopup === 'function') closeEventPopup();
        return;
    }

    const popupTitle = itemInfo.name + (itemInInventory.quantity > 1 ? ` (x${itemInInventory.quantity})` : ''); // Aggiunge quantità nel titolo se > 1
    const popupDescription = itemInfo.description;

    // Ottieni statistiche dettagliate dell'oggetto per la descrizione estesa nel popup
    // Questa funzione (getItemDetailsHTML) è definita in ui.js
    let itemStatsHTML = '';
     if (typeof getItemDetailsHTML === 'function') {
         itemStatsHTML = getItemDetailsHTML(itemInfo); // Ottieni l'HTML dei dettagli statistiche
     } else {
         console.warn("showItemActionPopup: getItemDetailsHTML non disponibile in ui.js.");
         // Fallback testuale per gli effetti usabili se la funzione dettagliata non c'è
          if (itemInfo.usable && itemInfo.effect && typeof getItemEffectsText === 'function') {
              itemStatsHTML = `<div class="item-stats-container"><div class="item-stat">${getItemEffectsText(itemInfo)}</div></div>`;
          }
     }


    // Combina descrizione base e statistiche/effetti dettagliati per il contenuto del popup
    const fullDescription = popupDescription + itemStatsHTML; // Aggiunge i dettagli HTML

    const popupChoices = [];

    // Aggiunge il pulsante "Usa" se l'oggetto è utilizzabile
    // Non mettiamo "Usa" per armi/armature/munizioni/crafting/lore che hanno azioni specifiche (Equipaggia, Ripara, ecc.)
     if (itemInfo.usable && !['weapon', 'armor', 'ammo', 'crafting', 'lore'].includes(itemInfo.type)) {
        popupChoices.push({
            text: `Usa ${itemInfo.name}`, // Testo del pulsante
            // L'azione chiama la funzione useItem definita in questo modulo player.js
            action: () => useItem(itemId)
        });
    }

    // Aggiunge "Equipaggia" o "Rimuovi" per armi e armature
    if (itemInfo.type === 'weapon' || itemInfo.type === 'armor') {
        const equippedSlotKey = itemInfo.type === 'weapon' ? 'equippedWeapon' : 'equippedArmor';
        const isEquipped = player[equippedSlotKey] === itemId;

        if (isEquipped) {
             // Se già equipaggiato, offri Rimuovi
            popupChoices.push({
                text: `Rimuovi ${itemInfo.name}`,
                // L'azione chiama la funzione unequipItem definita in questo modulo player.js
                action: () => unequipItem(equippedSlotKey)
            });
        } else {
             // Se non equipaggiato, offri Equipaggia
            popupChoices.push({
                text: `Equipaggia ${itemInfo.name}`,
                 // L'azione chiama la funzione equipItem definita in questo modulo player.js
                action: () => equipItem(itemId)
            });
        }
    }

    // Aggiunge l'opzione per riparare armi/armature danneggiate (se si hanno i materiali)
    // NOTA: La logica di verifica materiali e applicazione è in applyRepair/showRepairWeaponPopup
    // Qui aggiungiamo l'opzione "Ripara" che aprirà un nuovo popup di selezione arma se è un repair_kit
    // O che applicherà la riparazione direttamente se l'oggetto selezionato *è* l'arma/armatura danneggiata.
     if (itemInfo.type === 'crafting' && itemInfo.effect?.type === 'repair_weapon') {
        // Questo oggetto È un kit di riparazione. L'azione deve avviare il processo di selezione arma.
         const repairAmount = itemInfo.effect.repair_amount || 10;
         popupChoices.push({
             text: `Usare per Riparare...`, // Testo che indica che aprirà un'ulteriore scelta
             // L'azione chiama showRepairWeaponPopup (definita qui) che aprirà il popup successivo
             action: () => showRepairWeaponPopup(itemId, repairAmount)
         });
     }
     // Puoi aggiungere un'azione "Ripara" sull'arma danneggiata stessa in un futuro,
     // ma per ora la riparazione parte dal kit.

    // Aggiunge l'opzione per lasciare cadere l'oggetto
    // Non permettere di lasciare oggetti equipaggiati tramite questo popup (usa Rimuovi prima)
    // Non permettere di lasciare oggetti unici se necessario
     if (player.equippedWeapon !== itemId && player.equippedArmor !== itemId && !itemInfo.isUnique) { // isUnique non è ancora usato, ma per futuro
         popupChoices.push({
             text: `Lascia a terra ${itemInfo.name}`,
             cssClass: 'danger-action', // Classe per evidenziare azione potenzialmente negativa
             // L'azione chiama la funzione dropItem definita in questo modulo player.js
             action: () => dropItem(itemId, itemInInventory.quantity) // Passiamo la quantità attuale
         });
     }


    // Aggiunge il pulsante "Chiudi" in ogni caso
    popupChoices.push({
        text: "Chiudi",
         // L'azione chiama la funzione closeEventPopup (definita in ui.js)
        action: () => {
             // console.log("showItemActionPopup: Popup azione chiuso."); // Log di debug rimosso
             if (typeof closeEventPopup === 'function') closeEventPopup();
        }
    });

    // Crea e mostra il popup.
    // Questa funzione (showEventPopup) è definita nel modulo ui.js
    if (typeof showEventPopup === 'function') {
        showEventPopup({
            title: popupTitle,
            description: fullDescription,
            choices: popupChoices,
            // Passiamo l'itemId e un flag per indicare che è un popup di azione (non un evento casuale)
            // Questo aiuta handleChoiceContainerClick in events.js a capire come gestire il click.
            isActionPopup: true, // Flag per indicare tipo di popup
            itemId: itemId // Passa l'ID dell'item per riferimento futuro se necessario (non strettamente usato ora)
        });
    } else {
        console.error("showItemActionPopup: showEventPopup non disponibile in ui.js!");
        addMessage(`Errore nel mostrare le azioni per ${itemInfo.name}.`, "danger");
    }
}

// --- Implementazione check ammo availability ---
// Dipende da: game_constants.js (player, ITEM_DATA). Usata da ui.js (renderStats).
/**
 * Controlla se il giocatore ha munizioni disponibili per l'arma equipaggiata.
 * Dipende da game_constants.js (player, ITEM_DATA).
 * @returns {{hasAmmo: boolean, message: string}} Un oggetto che indica la disponibilità e un messaggio di stato.
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
 * @returns {{consumed: boolean, recovered: boolean}} Oggetto che indica se una munizione è stata consumata e se una è stata recuperata.
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
    const ammoItemInfo = ITEM_DATA[player.inventory[ammoSlotIndex]?.itemId || (ammoType === 'dardi' ? 'bolt' : (ammoType === 'frecce' ? 'arrow' : null))]; // Cerca info munizione consumata
    if (ammoItemInfo && ammoItemInfo.recuperabile && Math.random() < RECOVER_ARROW_BOLT_CHANCE) { // Usa costante per chance
        // Hai recuperato la munizione. Aggiungila all'inventario.
        addItemToInventory(ammoItemInfo.id, 1); // Aggiunge 1 munizione (addItemToInventory logga già)
        recovered = true;
        // console.log(`Recuperata 1 munizione di tipo ${ammoType}.`); // Log di debug
    }

    return { consumed: true, recovered: recovered };
}

// --- Implementazione riparazione armi/armature ---
// Queste funzioni implementano la logica di riparazione.
// Dipende da: game_constants.js (player, ITEM_DATA, costanti materiali), game_utils.js (addMessage, getRandomInt), ui.js (renderStats, renderInventory, closeEventPopup).
// Richiede removeItemFromInventory (definita qui).

/**
 * Controlla se il giocatore ha abbastanza materiali per riparare un oggetto.
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
    let scrapNeeded = 0;
    let mechanicalPartsNeeded = 0;

    // Quantità base per riparare un punto di durabilità (es. 1 rottame ogni 5 durabilità)
    // E costo extra se è completamente rotto
    const durabilityToRepair = targetItemInfo.maxDurability - targetItemInfo.durability;

    if (durabilityToRepair > 0) {
        scrapNeeded = Math.ceil(durabilityToRepair / 5); // 1 rottame ogni 5 punti durabilità mancanti
        if (isCompletelyBroken) {
             // Se completamente rotto, costa anche parti meccaniche e più rottami
             mechanicalPartsNeeded = Math.ceil(targetItemInfo.maxDurability / 10); // Es. 1 parte ogni 10 punti max durabilità
             // Aumenta anche il costo di rottami se è completamente rotto (es. 1 rottame ogni 3 punti max durabilità)
             scrapNeeded = Math.max(scrapNeeded, Math.ceil(targetItemInfo.maxDurability / 3));
        }
    }


    // Controlla se il giocatore ha abbastanza materiali nell'inventario
    const scrapSlot = player.inventory.find(slot => slot.itemId === 'scrap_metal');
    const hasEnoughScrap = scrapSlot && scrapSlot.quantity >= scrapNeeded;

    let mechanicalPartsSlot = null;
    let hasEnoughParts = true; // Presume di avere abbastanza se non necessarie

    if (mechanicalPartsNeeded > 0) {
        mechanicalPartsSlot = player.inventory.find(slot => slot.itemId === 'mechanical_parts');
        hasEnoughParts = mechanicalPartsSlot && mechanicalPartsSlot.quantity >= mechanicalPartsNeeded;
    }

    // Ritorna il risultato
    return {
        hasMaterials: hasEnoughScrap && hasEnoughParts,
        scrapNeeded: scrapNeeded,
        mechanicalPartsNeeded: mechanicalPartsNeeded
    };
}

// NOTA: La funzione `repairWeapon` nel codice originale (game_logic.js) sembrava duplicare `applyRepair`.
// La versione `applyRepair` è quella chiamata dal popup e gestisce il consumo del kit.
// La logica per verificare i materiali prima di mostrare l'opzione nel popup `showItemActionPopup`
// dovrebbe chiamare `checkRepairMaterials`. La logica per *applicare* la riparazione (consumare materiali e kit, curare durabilità)
// è in `applyRepair`. `showRepairWeaponPopup` è un helper per la UI di selezione.
// Quindi, non ridefiniremo una funzione `repairWeapon` separata qui.

// Modifica showItemActionPopup per usare checkRepairMaterials (già fatto nell'ultima versione, ma ricontrolliamo)
/*
function showItemActionPopup(itemId) {
    // ... (inizio funzione) ...
    // Aggiunge "Ripara" per armi/armature danneggiate (se si hanno i materiali)
    if ((itemInfo.type === 'weapon' || itemInfo.type === 'armor') && itemInfo.durability !== undefined && itemInfo.durability < itemInfo.maxDurability) {

        // Verifica materiali necessari (usa checkRepairMaterials)
        const isCompletelyBroken = itemInfo.durability <= 0;
        const repairCheck = checkRepairMaterials(itemId, isCompletelyBroken);

        let repairText = `Ripara`; // Testo base
        let canRepair = repairCheck.hasMaterials; // Flag se la riparazione è possibile O se è un kit

        // Se l'oggetto selezionato È il kit di riparazione
        if (itemInfo.type === 'crafting' && itemInfo.effect?.type === 'repair_weapon') {
             repairText = `Usare per Riparare...`;
             canRepair = true; // Puoi sempre tentare di usare il kit per aprire la selezione

        } else { // L'oggetto selezionato È l'arma/armatura danneggiata
             // Mostra i materiali necessari nel testo
             repairText = `Ripara (${repairCheck.scrapNeeded} Rottami`;
             if (repairCheck.mechanicalPartsNeeded > 0) {
                 repairText += `, ${repairCheck.mechanicalPartsNeeded} Parti`;
             }
             repairText += `)`;
        }


        // Mostra l'opzione Ripara solo se È un kit, OPPURE se È l'oggetto danneggiato E si hanno i materiali
        if ((itemInfo.type === 'crafting' && itemInfo.effect?.type === 'repair_weapon') || canRepair) {
             popupChoices.push({
                 text: repairText,
                 // L'azione dipende se è un kit o l'oggetto da riparare
                 action: () => {
                     if (itemInfo.type === 'crafting' && itemInfo.effect?.type === 'repair_weapon') {
                          // Se è il kit, avvia il popup di selezione oggetto
                          showRepairWeaponPopup(itemId, itemInfo.effect.repair_amount || 10);
                     } else if (canRepair) {
                          // Se è l'oggetto danneggiato e si hanno i materiali, applica la riparazione direttamente
                          // Consuma il kit (necessita di trovarlo nell'inventario) e applica la riparazione
                          // Questo scenario non è gestito direttamente in applyRepair, che consuma SOLO il kit.
                          // Serve una funzione intermedia "RepairThisItemWithKit" che trova il kit, lo consuma, e chiama applyRepair.
                          // Per ora, ci basiamo sulla logica attuale che la riparazione parte SEMPRE dall'uso del KIT.
                          console.warn("showItemActionPopup: Azione Ripara diretta su oggetto danneggiato non implementata. Usa il Kit di Riparazione dall'inventario.");
                          addMessage(`Per riparare ${itemInfo.name}, usa un Kit di Riparazione dal tuo inventario.`, "warning");
                          if (typeof closeEventPopup === 'function') closeEventPopup(); // Chiudi il popup corrente
                     } else {
                          // Non dovrebbe arrivare qui se canRepair è false e non è un kit, ma per sicurezza
                          addMessage(`Non hai i materiali necessari per riparare ${itemInfo.name}.`, "warning");
                          if (typeof closeEventPopup === 'function') closeEventPopup();
                     }
                 },
                 disabled: (itemInfo.type !== 'crafting' || itemInfo.effect?.type !== 'repair_weapon') && !canRepair // Disabilita se non è un kit E non si hanno i materiali
             });
        }
    }
    // ... (resto della funzione) ...
}
*/


// --- Implementazione check ammo availability ---
// Dipende da: game_constants.js (player, ITEM_DATA). Usata da ui.js (renderStats).
// (Già definita sopra, ma ri-menzionata per completezza)


// --- Implementazione consume ammo ---
// Dipende da: game_constants.js (player, ITEM_DATA, RECOVER_ARROW_BOLT_CHANCE), game_utils.js (addMessage, getRandomInt), ui.js (renderInventory).
// Usata dalla logica di combattimento (events.js).
// (Già definita sopra, ma ri-menzionata per completezza)


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
        addMessage(getRandomText(STATO_MESSAGGI.MALATO), 'warning');
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

// --- FINE LOGICA GIOCATORE ---
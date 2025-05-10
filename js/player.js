/**
 * TheSafePlace - Roguelike Postapocalittico
 * Versione: v0.7.13
 * File: js/player.js
 * Descrizione: Gestione del personaggio giocante (statistiche, inventario, equipaggiamento, azioni)
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
        equippedArmor: null,  // ID dell'armatura equipaggiata // Verrà impostato sotto

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
    // Non aggiungiamo più l'arma all'inventario, la equipaggiamo direttamente
    // addItemToInventory('pipe_wrench', 1);

    // Equipaggia un'arma base all'inizio
    const startingWeaponId = 'pipe_wrench';
    if (ITEM_DATA[startingWeaponId]) {
        player.equippedWeapon = startingWeaponId;
        // Non è necessario rimuoverla dall'inventario perché non l'abbiamo aggiunta lì
        // logMessage(`Equipaggiato automaticamente: \${ITEM_DATA[startingWeaponId].name}\`); // Opzionale, potrebbe essere un po' di spam all'inizio
    } else {
        console.warn(`generateCharacter: Arma iniziale '${startingWeaponId}' non trovata in ITEM_DATA.`);
    }

    // Equipaggia un'armatura base all'inizio
    const startingArmorId = 'leather_jacket_worn';
    if (ITEM_DATA[startingArmorId]) {
        player.equippedArmor = startingArmorId;
        // logMessage(`Equipaggiato automaticamente: ${ITEM_DATA[startingArmorId].name}`); // Opzionale
    } else {
        console.warn(`generateCharacter: Armatura iniziale '${startingArmorId}' non trovata in ITEM_DATA.`);
    }

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
                player.water = Math.min(player.water + amountToAdd, 10); // Limite Idratazione a 10
                 consumptionMessage = `Hai usato ${itemInfo.name}. Idratazione +${amountToAdd}. Totale: ${Math.floor(player.water)}.`;
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
             let poisonChance = currentEffect.poison_chance;
             if (itemId === 'berries') poisonChance = BERRIES_POISON_CHANCE;
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

                 } else {
                     // MODIFICATO: Usa currentEffect
                     consumptionMessage = currentEffect.failure_message || `${itemInfo.name} non è riuscito a curare lo stato ${statusToCure.replace('is', '')}.`;
                     messageType = 'warning';
                     effectApplied = false; // Effetto non applicato (cura fallita)
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
         // Rimuovi 1 quantità dell'oggetto dall'inventario
         removeItemFromInventory(itemId, 1);
         // removeItemFromInventory chiama già renderInventory e addMessage
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
 * @param {string} [source='inventory'] - La provenienza dell'oggetto ('inventory' o 'equipped').
 */
function showItemActionPopup(itemId, source = 'inventory') {
    const item = ITEM_DATA[itemId];
    if (!item) {
        console.error("showItemActionPopup: Item non trovato in ITEM_DATA:", itemId);
        return;
    }

    // RIMOSSO: console.log(`showItemActionPopup: Chiamata per item ${itemId}, source: ${source}`);

    // Verifica che i nuovi elementi DOM per il popup azioni oggetto siano pronti
    if (!DOM.itemActionOverlay || !DOM.itemActionPopup || !DOM.itemActionTitle ||
        !DOM.itemActionDescription || !DOM.itemActionStats || !DOM.itemActionChoices || !DOM.itemActionCloseButton) {
        console.error("showItemActionPopup: Elementi DOM del popup azioni oggetto non trovati o non pronti. Verifica dom_references.js e index.html.");
        addMessage("Errore UI: Impossibile mostrare le azioni per l'oggetto.", "error");
        return;
    }

    currentEventContext = {
        type: 'ITEM_ACTION',
        itemId: itemId,
        isActionPopup: true, 
        source: source
    };
    currentEventChoices = []; // Mantenuto per coerenza se qualche logica esterna lo usa, ma non per popolare questo popup

    // Popola il nuovo popup dedicato
    DOM.itemActionTitle.textContent = item.nameShort || item.name;
    DOM.itemActionDescription.textContent = item.description || "Nessuna descrizione.";
    
    DOM.itemActionStats.innerHTML = ''; // Pulisce stats precedenti
    let statsHTML = '';
    if (item.category === 'weapon') {
        if (item.damage) statsHTML += `Danno: ${item.damage}<br>`;
        if (typeof item.durabilityCurrent === 'number') statsHTML += `Durabilità: ${item.durabilityCurrent}/${item.durabilityMax}<br>`;
    } else if (item.category === 'armor') {
        if (item.armorValue) statsHTML += `Armatura: ${item.armorValue}<br>`;
        if (typeof item.durabilityCurrent === 'number') statsHTML += `Durabilità: ${item.durabilityCurrent}/${item.durabilityMax}<br>`;
    } else if (item.category === 'food' || item.category === 'water' || item.category === 'medical') {
        if (item.effect && item.effect.amount) {
            if (item.effect.type === 'heal') statsHTML += `Recupera HP: ${item.effect.amount}<br>`;
            if (item.effect.type === 'food') statsHTML += `Sazietà: +${item.effect.amount}<br>`;
            if (item.effect.type === 'water') statsHTML += `Idratazione: +${item.effect.amount}<br>`;
        }
        if (item.effect && item.effect.statusToCure) statsHTML += `Cura: ${item.effect.statusToCure.replace('is', '')}<br>`;
    }
    DOM.itemActionStats.innerHTML = statsHTML;

    DOM.itemActionChoices.innerHTML = ''; // Pulisce bottoni precedenti
    const actions = [];

    if (item.usable) {
        // Aggiungiamo una chiave per aiutare con lo styling
        actions.push({ text: "Usa", handler: () => useItem(itemId), styleKey: 'use' });
    }
    if (source === 'inventory') {
        if (item.category === 'weapon' || item.category === 'armor') {
            actions.push({ text: "Equipaggia", handler: () => equipItem(itemId), styleKey: 'equip' });
        }
        actions.push({ text: "Lascia", handler: () => dropItem(itemId, 1), styleKey: 'drop' });
    } else if (source === 'equipped') {
        actions.push({ text: "Rimuovi", handler: () => unequipItem(item.category === 'weapon' ? 'equippedWeapon' : 'equippedArmor'), styleKey: 'unequip' });
    }

    actions.forEach(action => {
        const button = document.createElement('button');
        button.textContent = action.text;
        button.classList.add('action-button'); // Classe base per tutti i bottoni azione oggetto
        if (action.styleKey) {
            button.classList.add(`action-${action.styleKey}`); // Classe specifica per tipo azione
        }
        button.onclick = () => {
            action.handler();
            closeItemActionPopup();
        };
        DOM.itemActionChoices.appendChild(button);
    });

    DOM.itemActionCloseButton.onclick = () => closeItemActionPopup();

    DOM.itemActionOverlay.classList.add('visible');
    DOM.itemActionPopup.classList.add('visible');

    eventScreenActive = true;
    gamePaused = true;
    if (typeof disableControls === 'function') disableControls();
}

// Nuova funzione per chiudere il popup azioni oggetto
function closeItemActionPopup() {
    if (DOM.itemActionOverlay && DOM.itemActionPopup) {
        DOM.itemActionOverlay.classList.remove('visible');
        DOM.itemActionPopup.classList.remove('visible');
    }
    eventScreenActive = false;
    gamePaused = false;
    if (typeof enableControls === 'function') enableControls();
    
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

    const itemId = player[slotKey];
    if (!itemId) {
        // Nessun oggetto equipaggiato in quello slot
        return;
    }

    const itemInfo = ITEM_DATA[itemId];
    if (!itemInfo || typeof itemInfo.durability !== 'number' || typeof itemInfo.maxDurability !== 'number') {
        // L'oggetto non ha durabilità o non è definito correttamente
        // console.warn(`applyWearToEquippedItem: L'oggetto ${itemId} non ha proprietà di durabilità.`);
        return;
    }

    if (itemInfo.durability <= 0) {
        // L'oggetto è già rotto, non può usurarsi ulteriormente.
        return;
    }

    const oldDurability = itemInfo.durability;
    itemInfo.durability = Math.max(0, itemInfo.durability - wearAmount);

    // console.log(`Usura applicata a ${itemInfo.name}: da ${oldDurability} a ${itemInfo.durability}`); // Log per debug

    if (itemInfo.durability <= 0 && oldDurability > 0) {
        addMessage(`${itemInfo.name} si è rotto!`, 'danger');
    } else if (itemInfo.durability < oldDurability && itemInfo.durability < itemInfo.maxDurability * 0.25) {
        // Aggiungi un messaggio se la durabilità scende sotto una certa soglia (es. 25%) ma non si è appena rotto
        if (oldDurability >= itemInfo.maxDurability * 0.25) { // Solo se prima era sopra la soglia
             addMessage(`${itemInfo.name} è gravemente danneggiato.`, 'warning');
        }
    }

    // Aggiorna la UI delle statistiche per riflettere il cambiamento di stato dell'arma/armatura
    // (es. se renderStats aggiunge "(Rotto)" al nome)
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
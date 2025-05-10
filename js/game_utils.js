/**
 * TheSafePlace - Roguelike Postapocalittico
 * Versione: v0.7.11
 * File: js/game_utils.js
 * Descrizione: Funzioni di utilità generiche per il gioco.
 * Dipende da: game_constants.js (opzionale, per DEBUG_MODE)
 */

// Nota: Questo file dipende da variabili e costanti definite in game_constants.js
// Non definire qui variabili di stato globali come player, map, messages, ecc.
// Non definire qui costanti di gioco come MAP_WIDTH, MOVE_FOOD_COST, ecc.

/**
 * Genera un numero intero casuale tra min e max (inclusi).
 * @param {number} min - Il valore minimo.
 * @param {number} max - Il valore massimo.
 * @returns {number} Un numero intero casuale nell'intervallo specificato.
 */
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  // Assicura che min <= max
  if (min > max) {
      console.warn(`getRandomInt chiamato con min > max: min=${min}, max=${max}. Scambio i valori.`);
      [min, max] = [max, min]; // Scambia min e max
  }
  return Math.floor(Math.random() * (max - min + 1)) + min;
}


/**
 * Seleziona e restituisce un elemento testuale casuale da un array.
 * @param {string[] | string} textInput - L'array di stringhe tra cui scegliere, o una singola stringa.
 * @returns {string} Una stringa casuale dall'array, la stringa stessa se non è un array valido, o "" se l'array è vuoto o non valido.
 */
function getRandomText(textInput) {
    if (typeof textInput === 'string') {
        return textInput; // Restituisce la stringa stessa se non è un array
    }
    if (!textInput || textInput.length === 0) {
        console.warn("getRandomText chiamato con array vuoto o non valido.");
        return ""; // Restituisce stringa vuota se l'array è vuoto o null/undefined
    }
    return textInput[Math.floor(Math.random() * textInput.length)];
}

/**
 * Aggiunge un messaggio al log di gioco e aggiorna l'interfaccia.
 * Questo è un wrapper che dipende dalla variabile globale `messages` e dalla funzione `renderMessages` (definita in ui.js).
 * @param {string} text - Il testo del messaggio da aggiungere.
 * @param {string} [type='normal'] - Il tipo di messaggio ('normal', 'warning', 'info', 'lore', 'success', 'danger'). Influisce sullo stile CSS.
 * @param {boolean} [important=false] - Se true, il messaggio viene visualizzato in grassetto.
 */
function addMessage(text, type = 'normal', important = false) {
    // Verifica se il log dei messaggi è inizializzato in game_constants.js
    if (!Array.isArray(messages)) {
         console.error("Errore: Array 'messages' non inizializzato in game_constants.js!");
         return; // Non può aggiungere il messaggio senza l'array
    }
    // Assicura che il testo sia una stringa
    if (typeof text !== 'string') text = String(text);
    // Ignora messaggi vuoti
    if (!text.trim()) return;

    let prefix = "";
    let cssClass = "";

    // Definisce prefissi e classi CSS in base al tipo
    switch(type) {
        case 'warning':
            prefix = "<span class='msg-warning'>[!]</span> ";
            cssClass = "log-warning";
            break;
        case 'info':
            prefix = "<span class='msg-info'>[*]</span> ";
            cssClass = "log-info"; // Usiamo una classe per l'elemento li
            break;
        case 'lore':
            prefix = "<span class='msg-lore'>[?]</span> "; // Aggiunto prefisso per Lore
            cssClass = "log-lore";
            break;
        case 'success':
            prefix = "<span class='msg-success'>[+]</span> "; // Aggiunto prefisso per Successo
            cssClass = "log-success";
            break;
        case 'danger': // Nuovo tipo per danni critici/morte imminente
            prefix = "<span class='msg-danger'>[X]</span> "; // Aggiunto prefisso per Danger
            cssClass = "log-danger";
            break;
        default: // type 'normal' o sconosciuto
            cssClass = "log-normal";
            break;
    }

    // Applica grassetto se richiesto
    if (important) text = `<strong>${text}</strong>`;

    // Sostituisci \n con <br> PRIMA di pushare per l'HTML
    const formattedText = text.replace(/\n/g, '<br>'); 

    // Aggiunge il messaggio alla FINE dell'array logico
    messages.push({ text: prefix + formattedText, class: cssClass }); // Usa formattedText

    // Mantiene il log entro la dimensione massima (definita in game_constants.js)
    if (messages.length > MAX_MESSAGES) {
        messages.shift(); // Rimuove il messaggio più vecchio (il primo dell'array)
    }

    // Triggera l'aggiornamento della visualizzazione UI.
    if (typeof renderMessages === 'function') {
        renderMessages();
    } else {
        // Fallback console log se la UI non è pronta (usa testo originale senza <br>)
        console.log(`[Log:${type.toUpperCase()}] ${text}`); 
    }
}

/**
 * Esegue un check su una statistica del giocatore contro una difficoltà.
 * Dipende dalla variabile globale `player` e dalle costanti di penalità in game_constants.js.
 * @param {string} statKey - La chiave della statistica da usare (es. 'agilita', 'vigore'). Deve esistere sull'oggetto player.
 * @param {number} difficulty - La difficoltà base del check.
 * @returns {{success: boolean, roll: number, bonus: number, total: number, finalDifficulty: number, text: string}} Oggetto con l'esito e dettagli del tiro.
 */
function performSkillCheck(statKey, difficulty) {
    // Verifica che il giocatore e la statistica esistano
    if (!player || typeof player[statKey] === 'undefined') {
        console.error(`performSkillCheck fallito: giocatore non valido o stat '${statKey}' non trovata.`);
        // Ritorna un fallimento con valori di default
        return { success: false, roll: 0, bonus: 0, total: 0, finalDifficulty: difficulty, text: `Errore check (${statKey})!` };
    }

    const statValue = player[statKey];
    // Calcola il bonus/malus come Modificatore in D&D (stat - 10 / 2, arrotondato per difetto)
    const bonus = Math.floor((statValue - 10) / 2);
    // Tira un dado a 20 facce
    const roll = getRandomInt(1, 20);

    // Applica penalità alla difficoltà basate sullo stato del giocatore (definite in game_constants.js)
    let difficultyPenalty = 0;
    let penaltyReason = "";

    // Penalità se Ferito e il check usa Potenza o Agilità
    if (player.isInjured && (statKey === 'potenza' || statKey === 'agilita')) {
        difficultyPenalty += 2; // Aumenta la difficoltà di 2
        penaltyReason = " (Ferito)";
    }
    // Penalità se Malato e il check usa Vigore o Adattamento
    // NOTA: Queste penalità si sommano se entrambe le condizioni si applicano alla stessa stat.
    if (player.isSick && (statKey === 'vigore' || statKey === 'adattamento')) {
        difficultyPenalty += 2; // Aumenta la difficoltà di 2
        // Aggiunge la ragione, se non già presente per Ferito sulla stessa stat, o la combina
        if (penaltyReason) penaltyReason += " & Malato"; else penaltyReason = " (Malato)";
    }
     // Penalità se Avvelenato e il check usa Agilità o Adattamento (esempio)
     // NOTA: Aggiungere questa logica se Avvelenato deve influenzare i check
     /*
     if (player.isPoisoned && (statKey === 'agilita' || statKey === 'adattamento')) {
         difficultyPenalty += 3; // Penalità più alta
         if (penaltyReason) penaltyReason += " & Avvelenato"; else penaltyReason = " (Avvelenato)";
     }
     */

    // Calcola la difficoltà finale e il risultato totale (tiro + bonus)
    const finalDifficulty = difficulty + difficultyPenalty;
    const total = roll + bonus;
    const success = total >= finalDifficulty;

    // Costruisce la stringa descrittiva del tiro per il log
    const checkText = `${statKey.charAt(0).toUpperCase() + statKey.slice(1)} Check: Tiro d20 ${roll} + ${bonus} (Bonus Stat) = ${total} vs Difficoltà ${difficulty}${penaltyReason} = ${finalDifficulty}`;

    // Ritorna un oggetto dettagliato
    return {
        success: success,
        roll: roll,
        bonus: bonus,
        total: total,
        finalDifficulty: finalDifficulty,
        text: checkText
    };
}


/**
 * Calcola e restituisce una stima qualitativa della probabilità di successo
 * per un dato skill check, basata sullo stato attuale del giocatore.
 * Dipende dalla variabile globale `player` e dalle costanti di penalità in game_constants.js.
 * @param {string} statKey - La chiave della statistica da usare (es. 'agilita', 'vigore').
 * @param {number} difficulty - La difficoltà base del check.
 * @returns {string} Un descrittore testuale (es. "Molto Alta", "Alta", "Media", "Bassa", "Molto Bassa", "Quasi Impossibile").
 */
function getSkillCheckLikelihood(statKey, difficulty) {
    if (!player || typeof player[statKey] === 'undefined') {
        console.warn(`getSkillCheckLikelihood: Statistica '${statKey}' non trovata nel giocatore.`);
        return "Sconosciuta";
    }

    const statValue = player[statKey];
    const bonus = Math.floor((statValue - 10) / 2);

    // Calcola la difficoltà effettiva includendo le penalità di stato
    let difficultyPenalty = 0;
    if (player.isInjured && (statKey === 'potenza' || statKey === 'agilita')) {
        difficultyPenalty += 2;
    }
    if (player.isSick && (statKey === 'vigore' || statKey === 'adattamento')) {
        difficultyPenalty += 2;
    }
     // Aggiungere penalità Avvelenato se implementate in performSkillCheck
     /*
     if (player.isPoisoned && (statKey === 'agilita' || statKey === 'adattamento')) {
         difficultyPenalty += 3;
     }
     */
    const finalDifficulty = difficulty + difficultyPenalty;

    // Calcola il tiro minimo necessario sul d20 per avere successo (roll >= finalDifficulty - bonus)
    const targetRoll = finalDifficulty - bonus;

    // Mappa il tiro necessario a descrittori qualitativi basati sulla probabilità di ottenere quel tiro o superiore con un d20.
    // Roll >= 1: Quasi Impossibile (necessita 20) -> Molto Alta (necessita 1)
    if (targetRoll <= 1) return "Garantita";        // ~100% (tiri 1-20)
    if (targetRoll <= 3) return "Molto Alta";       // 90% (tiri 3-20)
    if (targetRoll <= 6) return "Alta";             // 75% (tiri 6-20)
    if (targetRoll <= 10) return "Media";           // 55% (tiri 10-20)
    if (targetRoll <= 14) return "Bassa";           // 35% (tiri 14-20)
    if (targetRoll <= 17) return "Molto Bassa";      // 20% (tiri 17-20)
    if (targetRoll <= 19) return "Quasi Impossibile"; // 10% (tiri 19-20)
    return "Impossibile";                         // < 5% (necessita 20+ sul d20)
}


/**
 * Verifica se una casella (basata sul suo simbolo) è attraversabile dal giocatore.
 * Dipende dai TILE_SYMBOLS definiti in game_data.js.
 * @param {string} tileSymbol - Il simbolo della casella da verificare (es. '.', 'M').
 * @returns {boolean} True se la casella è attraversabile, false altrimenti.
 */
function isWalkable(tileSymbol) {
    // Le montagne sono l'unico ostacolo fisso per ora.
    // Le caselle non definite (undefined, null) sono considerate non attraversabili per sicurezza.
    return tileSymbol !== TILE_SYMBOLS.MOUNTAIN && tileSymbol !== undefined && tileSymbol !== null;
}

// Funzione placeholder per ottenere il nome leggibile del tipo di arma,
// definita qui perché è una utility usata per i testi descrittivi (es. tooltip).
// Dipende da TIPO_ARMA_LABELS in game_constants.js
function getTipoArmaLabel(weaponType) {
    // Verifica se TIPO_ARMA_LABELS è definito
    if (typeof TIPO_ARMA_LABELS === 'undefined') {
        console.error("Errore: TIPO_ARMA_LABELS non definito in game_constants.js!");
        return weaponType || 'Sconosciuto'; // Ritorna il tipo grezzo o Sconosciuto in caso di errore
    }
    return TIPO_ARMA_LABELS[weaponType] || weaponType || 'Sconosciuto';
}


// Funzione placeholder per ottenere una descrizione testuale degli effetti di un oggetto usabile
// definita qui perché usata nella descrizione oggetto (es. tooltip)
// Dipende da ITEM_EFFECT_DESCRIPTIONS in game_constants.js e ITEM_DATA in game_data.js
function getItemEffectsText(itemDetails) {
    if (!itemDetails || !itemDetails.usable || !itemDetails.effect) return "";

     // Verifica se ITEM_EFFECT_DESCRIPTIONS è definito
     if (typeof ITEM_EFFECT_DESCRIPTIONS === 'undefined') {
        console.error("Errore: ITEM_EFFECT_DESCRIPTIONS non definito in game_constants.js!");
        return "Effetti sconosciuti"; // Ritorna testo generico in caso di errore
     }

    const effectType = itemDetails.effect.type;
    const effectDescriptionFn = ITEM_EFFECT_DESCRIPTIONS[effectType];

    if (effectDescriptionFn && typeof effectDescriptionFn === 'function') {
        // Esegue la funzione di descrizione specifica per il tipo di effetto
        return effectDescriptionFn(itemDetails.effect);
    } else {
        // Descrizione generica o errore se il tipo di effetto non ha una funzione di descrizione mappata
        console.warn(`Nessuna descrizione definita per il tipo di effetto item: ${effectType}`);
        return "Effetti sconosciuti";
    }
}


// Funzione helper per scegliere un elemento da un array in base a pesi
// Dipende solo da getRandomInt e da game_data.js (per la struttura degli array pesati)
// Può essere usata per loot, eventi complessi, ecc.
// Prende un array di oggetti { id: 'item_id', weight: numero } o { type: 'event_type', weight: numero }
function chooseWeighted(weightedArray) {
    if (!weightedArray || weightedArray.length === 0) {
        console.warn("chooseWeighted chiamato con array vuoto o non valido.");
        return null;
    }

    let totalWeight = 0;
    for (const item of weightedArray) {
        if (item.weight > 0) { // Ignora pesi negativi o zero
            totalWeight += item.weight;
        }
    }

    if (totalWeight <= 0) {
        console.warn("chooseWeighted: Peso totale <= 0. Nessun elemento selezionabile.");
        return null; // Nessun elemento con peso positivo
    }

    let randomNum = Math.random() * totalWeight;
    let weightSum = 0;

    for (const item of weightedArray) {
        if (item.weight > 0) {
            weightSum += item.weight;
            if (randomNum <= weightSum) {
                // Ritorna l'oggetto intero (contiene id o type e weight)
                return item;
            }
        }
    }

    // Fallback: se per qualche ragione la selezione non va a buon fine (dovrebbe essere rara)
    console.error("chooseWeighted: Selezione fallback. Potrebbe esserci un problema con i pesi.");
     // Cerca il primo elemento con peso positivo come fallback
     return weightedArray.find(item => item.weight > 0) || null;
}

// --- FINE FUNZIONI UTILITY ---
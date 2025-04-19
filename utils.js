/**
 * The Safe Place - Minimal Roguelike
 * File: utils.js
 * Descrizione: Contiene funzioni di utilità generale usate in tutto il gioco.
 */

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

/**
 * Esegue un check di abilità basato sulla caratteristica indicata e la difficoltà.
 * @param {string} statKey - La chiave della caratteristica da usare (es. 'vigore', 'agilita').
 * @param {number} difficulty - Il valore di difficoltà da superare (tra 5-20 solitamente).
 * @returns {boolean} True se il check è riuscito, false altrimenti.
 */
function performSkillCheck(statKey, difficulty) {
    // Verifica che il giocatore esista e che la stat esista
    if (!player || !player[statKey]) {
        console.error(`Skill check fallito: giocatore non valido o stat '${statKey}' non trovata.`);
        return false; // In caso di errore, fallisce il check
    }

    // Ottiene il valore della caratteristica
    const statValue = player[statKey];
    
    // Lancia 3d6 (classico controllo) e aggiunge il valore della stat
    let diceTotal = 0;
    for (let i = 0; i < 3; i++) {
        diceTotal += getRandomInt(1, 6);
    }
    
    const totalRoll = diceTotal + statValue;
    const isSuccess = totalRoll >= difficulty;

    // Commentato per pulire la console
    // console.log(`Skill Check: ${statKey.toUpperCase()} (${statValue}) - Tiro: ${diceTotal} + ${statValue} = ${totalRoll} vs Difficoltà ${difficulty}`);

    return isSuccess;
}

/**
 * Calcola e restituisce una stima della probabilità di successo di un check di abilità.
 * Usato per mostrare al giocatore le probabilità di successo nelle scelte.
 * @param {string} statKey - La chiave della caratteristica da usare.
 * @param {number} difficulty - Il valore di difficoltà da superare.
 * @returns {string} Una descrizione testuale della probabilità di successo (es. "Alta", "Media", ecc.).
 */
function getSkillCheckLikelihood(statKey, difficulty) {
    if (!player || !player[statKey]) {
        return "Sconosciuta"; // Se la stat non esiste, probabilità sconosciuta
    }

    // Calcola la probabilità approssimativa di successo
    const statValue = player[statKey];
    
    // Media statistica di 3d6 è 10.5
    const averageRoll = 10.5 + statValue;
    const diffFromTarget = averageRoll - difficulty;
    
    // Categorizziamo in base alla differenza
    if (diffFromTarget >= 6) {
        return "Molto Alta"; // Quasi certo
    } else if (diffFromTarget >= 3) {
        return "Alta"; // Probabile
    } else if (diffFromTarget >= 0) {
        return "Media"; // 50/50 o poco meglio
    } else if (diffFromTarget >= -3) {
        return "Bassa"; // Difficile
    } else if (diffFromTarget >= -6) {
        return "Molto Bassa"; // Molto difficile
    } else {
        return "Quasi Impossibile"; // Praticamente impossibile
    }
}

/**
 * Verifica se una casella è attraversabile dal giocatore.
 * @param {string} tile - Il simbolo della casella da verificare.
 * @returns {boolean} True se la casella è attraversabile, false altrimenti.
 */
function isWalkable(tile) {
    // Le montagne e le caselle non definite sono inaccessibili
    return tile !== TILE_SYMBOLS.MOUNTAIN && tile !== undefined;
} 
/**
 * The Safe Place - Minimal Roguelike
 * File: game_init.js
 * Descrizione: Contiene la funzione di inizializzazione del gioco e il codice per avviare il gioco.
 */

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
    gamePaused = false; // << RESET gamePaused
    dayMovesCounter = 0;
    nightMovesCounter = 0;
    isDay = true;
    daysSurvived = 0;
    easterEggPixelDebhFound = false; // Resetta il flag a inizio partita
    uniqueEventWebRadioFound = false; // Resetta flag evento WebRadio

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
    // Usa la classe 'visible' per gestire la visibilità con transizioni
    if(eventOverlay) eventOverlay.classList.remove('visible');
    if(gameContainer) gameContainer.classList.remove('overlay-active');
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
        setupInputListeners();

        // --- NUOVO: Imposta focus esplicito --- 
        try {
            document.body.focus();
        } catch (e) {
            console.error("Errore nell'impostare il focus iniziale:", e);
        }
    }
}
// Nota: Rimosso il listener DOMContentLoaded che causava doppia inizializzazione,
// poiché il gioco viene già inizializzato da main.js 
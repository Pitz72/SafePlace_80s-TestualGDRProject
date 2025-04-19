/**
 * La Destinazione Incerta
 * File: main.js
 * Descrizione: Punto di ingresso principale dell'applicazione. Gestisce il caricamento iniziale e
 * configura gli event listener per avviare il gioco.
 */

// Attendi che il documento sia completamente caricato prima di eseguire qualsiasi script
document.addEventListener('DOMContentLoaded', function() {
    // Log solo in modalità sviluppo
    if (typeof DEV_MODE !== 'undefined' && DEV_MODE) {
        console.log('Documento caricato. Configurazione del gioco in corso...');
    }
    
    // Riferimenti agli elementi DOM
    const gameContainer = document.getElementById('game-container');
    const restartButton = document.getElementById('restart-button');
    
    // Inizializza direttamente il gioco all'avvio
    try {
        // Inizializza e avvia il gioco
        initializeGame();
        
        // Imposta il focus sul documento per catturare gli input da tastiera
        document.body.focus();
        
        // Log solo in modalità sviluppo
        if (typeof DEV_MODE !== 'undefined' && DEV_MODE) {
            console.log('Gioco avviato con successo');
        }
    } catch (error) {
        console.error('Errore durante l\'avvio del gioco:', error.message);
        
        // Mostra un messaggio di errore all'utente
        const errorDiv = document.createElement('div');
        errorDiv.id = 'error-message';
        errorDiv.style.cssText = 'position:fixed; top:10px; left:10px; background:rgba(255,0,0,0.8); color:white; padding:10px; z-index:9999;';
        errorDiv.textContent = 'Si è verificato un errore durante l\'avvio del gioco: ' + error.message;
        document.body.appendChild(errorDiv);
    }
    
    // Configura il pulsante "Riavvia" nella schermata di fine gioco
    if (restartButton) {
        restartButton.addEventListener('click', function() {
            // Nascondi la schermata di fine
            const endScreen = document.getElementById('end-screen');
            if (endScreen) endScreen.style.display = 'none';
            if (gameContainer) gameContainer.style.display = 'flex';
            
            // Reinizializza il gioco
            initializeGame();
        });
    } else {
        console.error('Pulsante di riavvio non trovato nel DOM.');
    }
    
    // Gestione preliminare degli errori 
    window.addEventListener('error', function(e) {
        console.error('Errore JavaScript globale:', e.message);
        // Mostra un messaggio all'utente
        if (!document.getElementById('error-message')) {
            const errorDiv = document.createElement('div');
            errorDiv.id = 'error-message';
            errorDiv.style.cssText = 'position:fixed; top:10px; left:10px; background:rgba(255,0,0,0.8); color:white; padding:10px; z-index:9999;';
            errorDiv.textContent = 'Si è verificato un errore. Prova a ricaricare la pagina. Errore: ' + e.message;
            document.body.appendChild(errorDiv);
        }
    });
    
    // Definisci la variabile DEV_MODE per controllare i log di debug
    window.DEV_MODE = false;
}); 
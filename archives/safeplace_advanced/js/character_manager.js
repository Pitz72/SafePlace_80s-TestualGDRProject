/**
 * THE SAFE PLACE - CHARACTER MANAGER (PLACEHOLDER)
 * 
 * Questo file è un placeholder per future funzionalità di gestione personaggi.
 * Attualmente il gioco usa un singolo personaggio predefinito.
 */

// Placeholder per gestione personaggi multipli
const CharacterManager = {
    currentCharacter: 'Ultimo',
    
    // Metodo richiesto dal game_core.js
    initialize: function() {
        console.log("[CharacterManager] Inizializzato (placeholder)");
        return true;
    },
    
    // Metodo richiesto per la selezione personaggio
    showCharacterSelection: function(callback) {
        console.log("[CharacterManager] Selezione personaggio - usando default: Ultimo");
        
        // Avvia direttamente il gioco con il personaggio predefinito
        // Simula il comportamento del sistema originale
        if (typeof showScreen === 'function' && typeof DOM !== 'undefined' && DOM.gameContainer) {
            showScreen(DOM.gameContainer);
        }
        if (typeof initializeGame === 'function') {
            initializeGame();
        }
        
        // Chiama anche il callback se fornito
        if (callback && typeof callback === 'function') {
            callback('Ultimo');
        }
    },
    
    // Metodi placeholder
    createCharacter: function(name) {
        console.log("[CharacterManager] Sistema personaggi multipli non disponibile");
        return false;
    },
    
    switchCharacter: function(name) {
        console.log("[CharacterManager] Sistema personaggi multipli non disponibile");
        return false;
    },
    
    getCharacterList: function() {
        return ['Ultimo'];
    }
};

// Export globale
window.CharacterManager = CharacterManager; 
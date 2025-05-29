/**
 * THE SAFE PLACE - API CLIENT (PLACEHOLDER)
 * 
 * Questo file è un placeholder per future funzionalità di rete.
 * Attualmente il gioco funziona completamente offline.
 */

// Placeholder per future API calls
const APIClient = {
    isOnline: false,
    
    // Metodi placeholder
    saveToCloud: function() {
        console.log("[API] Salvataggio cloud non disponibile - modalità offline");
        return false;
    },
    
    loadFromCloud: function() {
        console.log("[API] Caricamento cloud non disponibile - modalità offline");
        return false;
    }
};

// Export globale
window.APIClient = APIClient; 
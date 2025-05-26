/**
 * The Safe Place - API Client
 * Modulo per gestire comunicazioni con backend
 * Sistema dual-mode: Backend + localStorage fallback
 */

// Configurazione API
const API_CONFIG = {
    baseUrl: 'http://localhost/backend/public/api',
    timeout: 5000,
    retries: 2,
    debug: true
};

// Stato globale API
let apiState = {
    backendAvailable: true,
    currentCharacterId: null,
    lastError: null
};

/**
 * Client API principale
 */
class SafePlaceAPI {
    constructor() {
        this.baseUrl = API_CONFIG.baseUrl;
        this.timeout = API_CONFIG.timeout;
        this.debug = API_CONFIG.debug;
    }
    
    /**
     * Metodo generico per richieste HTTP con timeout e retry
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}/${endpoint}`;
        const config = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            ...options
        };
        
        if (this.debug) {
            console.log(`🌐 API Request: ${config.method} ${url}`);
        }
        
        try {
            // Implementa timeout manuale
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.timeout);
            
            const response = await fetch(url, {
                ...config,
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            if (this.debug) {
                console.log(`✅ API Response:`, data);
            }
            
            // Marca backend come disponibile
            apiState.backendAvailable = true;
            apiState.lastError = null;
            
            return data;
            
        } catch (error) {
            if (this.debug) {
                console.warn(`❌ API Error: ${error.message}`);
            }
            
            // Marca backend come non disponibile
            apiState.backendAvailable = false;
            apiState.lastError = error.message;
            
            throw error;
        }
    }
    
    /**
     * Test connessione API
     */
    async testConnection() {
        try {
            const result = await this.request('');
            return result.status === 'success';
        } catch (error) {
            return false;
        }
    }
    
    /**
     * Lista personaggi utente
     */
    async getCharacters(userId = 1) {
        return this.request('characters');
    }
    
    /**
     * Crea nuovo personaggio
     */
    async createCharacter(characterData) {
        return this.request('characters', {
            method: 'POST',
            body: JSON.stringify(characterData)
        });
    }
    
    /**
     * Salva partita completa
     */
    async saveGame(characterId, sessionData, characterData = null) {
        const payload = {
            character_id: characterId,
            session_data: sessionData
        };
        
        if (characterData) {
            payload.character_data = characterData;
        }
        
        return this.request('game/save', {
            method: 'POST',
            body: JSON.stringify(payload)
        });
    }
    
    /**
     * Carica partita
     */
    async loadGame(characterId) {
        return this.request(`game/load/${characterId}`);
    }
}

/**
 * Istanza globale API client
 */
const apiClient = new SafePlaceAPI();

/**
 * Funzioni di utilità per il sistema dual-mode
 */
const DualModeUtils = {
    
    /**
     * Verifica se il backend è disponibile
     */
    async checkBackendAvailability() {
        try {
            const isAvailable = await apiClient.testConnection();
            apiState.backendAvailable = isAvailable;
            
            if (API_CONFIG.debug) {
                console.log(`🔍 Backend availability: ${isAvailable ? 'ONLINE' : 'OFFLINE'}`);
            }
            
            return isAvailable;
        } catch (error) {
            apiState.backendAvailable = false;
            return false;
        }
    },
    
    /**
     * Salva dati in localStorage (fallback)
     */
    saveToLocalStorage(key, data) {
        try {
            const dataString = JSON.stringify(data);
            localStorage.setItem(key, dataString);
            
            if (API_CONFIG.debug) {
                console.log(`💾 Saved to localStorage: ${key}`);
            }
            
            return true;
        } catch (error) {
            console.error('❌ localStorage save error:', error);
            return false;
        }
    },
    
    /**
     * Carica dati da localStorage
     */
    loadFromLocalStorage(key) {
        try {
            const dataString = localStorage.getItem(key);
            if (!dataString) return null;
            
            const data = JSON.parse(dataString);
            
            if (API_CONFIG.debug) {
                console.log(`📂 Loaded from localStorage: ${key}`);
            }
            
            return data;
        } catch (error) {
            console.error('❌ localStorage load error:', error);
            return null;
        }
    },
    
    /**
     * Mostra messaggio di stato all'utente
     */
    showStatusMessage(message, type = 'info') {
        // Integrazione con il sistema di messaggi esistente
        if (typeof addMessage === 'function') {
            addMessage(message, type);
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }
};

/**
 * Funzioni dual-mode per salvataggio/caricamento
 */
const DualModeGame = {
    
    /**
     * Salvataggio dual-mode
     */
    async saveGame() {
        if (API_CONFIG.debug) {
            console.log("🎮 Avvio salvataggio dual-mode...");
        }
        
        try {
            // Prepara dati per il salvataggio
            const sessionData = {
                player: player,
                map: map,
                dayMovesCounter: dayMovesCounter,
                isDay: isDay,
                gameDay: gameDay,
                easterEggPixelDebhFound: easterEggPixelDebhFound,
                uniqueEventWebRadioFound: uniqueEventWebRadioFound,
                saveTimestamp: new Date().toISOString()
            };
            
            const characterData = {
                name: player.name || 'Survivor',
                health: player.hp,
                position: {x: player.x, y: player.y},
                stats: {
                    maxHp: player.maxHp,
                    food: player.food,
                    water: player.water,
                    vigore: player.vigore,
                    potenza: player.potenza,
                    agilita: player.agilita,
                    trascinamento: player.trascinamento,
                    infiltrazione: player.infiltrazione,
                    precisione: player.precisione,
                    adattamento: player.adattamento
                }
            };
            
            // Tentativo salvataggio backend
            if (apiState.backendAvailable && apiState.currentCharacterId) {
                try {
                    const result = await apiClient.saveGame(
                        apiState.currentCharacterId, 
                        sessionData, 
                        characterData
                    );
                    
                    if (result.success) {
                        // Backup localStorage
                        DualModeUtils.saveToLocalStorage('theSafePlaceSaveData', sessionData);
                        
                        DualModeUtils.showStatusMessage("Partita salvata su server!", "success");
                        return true;
                    }
                    
                } catch (error) {
                    console.warn("Backend non disponibile, uso localStorage:", error);
                    apiState.backendAvailable = false;
                    // Continua con localStorage
                }
            }
            
            // Fallback localStorage
            const success = DualModeUtils.saveToLocalStorage('theSafePlaceSaveData', sessionData);
            
            if (success) {
                const message = apiState.backendAvailable ? 
                    "Partita salvata localmente" : 
                    "Partita salvata localmente (server non disponibile)";
                
                DualModeUtils.showStatusMessage(message, "warning");
                return true;
            } else {
                DualModeUtils.showStatusMessage("Errore durante il salvataggio!", "danger");
                return false;
            }
            
        } catch (error) {
            console.error("Errore salvataggio:", error);
            DualModeUtils.showStatusMessage("Errore durante il salvataggio!", "danger");
            return false;
        }
    },
    
    /**
     * Caricamento dual-mode
     */
    async loadGame() {
        if (API_CONFIG.debug) {
            console.log("🎮 Avvio caricamento dual-mode...");
        }
        
        try {
            // Tentativo caricamento backend
            if (apiState.backendAvailable && apiState.currentCharacterId) {
                try {
                    const result = await apiClient.loadGame(apiState.currentCharacterId);
                    
                    if (result.success) {
                        // Ripristina stato da backend
                        this.restoreGameState(result.session_data);
                        DualModeUtils.showStatusMessage(`Partita caricata dal server (${result.last_save})`, "success");
                        return true;
                    }
                    
                } catch (error) {
                    console.warn("Backend non disponibile, uso localStorage:", error);
                    apiState.backendAvailable = false;
                    // Continua con localStorage
                }
            }
            
            // Fallback localStorage
            const savedData = DualModeUtils.loadFromLocalStorage('theSafePlaceSaveData');
            
            if (savedData) {
                this.restoreGameState(savedData);
                DualModeUtils.showStatusMessage("Partita caricata da localStorage", "info");
                return true;
            } else {
                DualModeUtils.showStatusMessage("Nessuna partita salvata trovata.", "warning");
                return false;
            }
            
        } catch (error) {
            console.error("Errore caricamento:", error);
            DualModeUtils.showStatusMessage("Errore durante il caricamento!", "danger");
            return false;
        }
    },
    
    /**
     * Ripristina stato di gioco
     */
    restoreGameState(sessionData) {
        // Ripristina stato globale (codice esistente)
        player = sessionData.player;
        map = sessionData.map;
        dayMovesCounter = sessionData.dayMovesCounter;
        isDay = sessionData.isDay;
        gameDay = sessionData.gameDay;
        easterEggPixelDebhFound = sessionData.easterEggPixelDebhFound;
        uniqueEventWebRadioFound = sessionData.uniqueEventWebRadioFound;
        
        // Aggiorna UI
        setTimeout(() => {
            if (typeof renderMap === 'function') renderMap();
            if (typeof renderStats === 'function') renderStats();
            if (typeof renderInventory === 'function') renderInventory();
            if (typeof renderLegend === 'function') renderLegend();
        }, 100);
        
        // Attiva gioco
        if (typeof showScreen === 'function' && typeof DOM !== 'undefined') {
            showScreen(DOM.gameContainer);
        }
        
        if (typeof gameActive !== 'undefined') gameActive = true;
        if (typeof gamePaused !== 'undefined') gamePaused = false;
        if (typeof eventScreenActive !== 'undefined') eventScreenActive = false;
    }
};

/**
 * Inizializzazione sistema dual-mode
 */
async function initializeDualMode() {
    if (API_CONFIG.debug) {
        console.log("🚀 Inizializzazione sistema dual-mode...");
    }
    
    // Verifica disponibilità backend
    await DualModeUtils.checkBackendAvailability();
    
    // Inizializza character manager se disponibile
    if (typeof CharacterManager !== 'undefined') {
        await CharacterManager.initialize();
    }
    
    if (API_CONFIG.debug) {
        console.log("✅ Sistema dual-mode inizializzato");
        console.log("📊 Stato API:", apiState);
        if (typeof characterManagerState !== 'undefined') {
            console.log("🎭 Stato Character Manager:", characterManagerState);
        }
    }
}

// Esporta per uso globale
if (typeof window !== 'undefined') {
    window.SafePlaceAPI = SafePlaceAPI;
    window.apiClient = apiClient;
    window.DualModeGame = DualModeGame;
    window.DualModeUtils = DualModeUtils;
    window.initializeDualMode = initializeDualMode;
    window.apiState = apiState;
} 
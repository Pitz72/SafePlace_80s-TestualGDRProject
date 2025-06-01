/**
 * THE SAFE PLACE - ADVANCED API CLIENT v2.0
 * Sistema Dual-Mode: Backend MySQL + Fallback localStorage
 * 
 * Recupero Architettura Avanzata - Fase 2.1
 * Data: 29 Dicembre 2024
 */

// Configurazione API per MAMP
const API_CONFIG = {
    baseUrl: 'http://localhost/backend/public/api',
    timeout: 8000,
    retries: 2,
    fallbackMode: 'localStorage' // Modalità fallback quando backend non disponibile
};

/**
 * Client API principale con sistema dual-mode
 */
class SafePlaceAPI {
    constructor() {
        this.baseUrl = API_CONFIG.baseUrl;
        this.timeout = API_CONFIG.timeout;
        this.retries = API_CONFIG.retries;
        this.backendAvailable = true; // Assume backend disponibile inizialmente
        this.currentCharacterId = this.loadCharacterId() || null;
        
        // Test iniziale della connessione
        this.testConnection();
        
        console.log('[API] SafePlaceAPI inizializzato - Dual-mode attivo');
    }
    
    /**
     * Test della connessione backend
     */
    async testConnection() {
        try {
            const response = await this.request('health', { method: 'GET' });
            this.backendAvailable = true;
            console.log('[API] ✅ Backend disponibile:', response);
        } catch (error) {
            this.backendAvailable = false;
            console.warn('[API] ⚠️ Backend non disponibile, usando localStorage:', error.message);
        }
    }
    
    /**
     * Metodo generico per richieste HTTP
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}/${endpoint}`;
        const config = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            timeout: this.timeout,
            ...options
        };
        
        // Aggiungi timeout con AbortController
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);
        config.signal = controller.signal;
        
        try {
            const response = await fetch(url, config);
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Errore sconosciuto' }));
                throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            return { success: true, data };
            
        } catch (error) {
            clearTimeout(timeoutId);
            
            if (error.name === 'AbortError') {
                throw new Error('Timeout connessione backend');
            }
            
            console.error('[API] Errore richiesta:', error);
            throw error;
        }
    }
    
    /**
     * Salvataggio dual-mode (Backend + localStorage backup)
     */
    async saveGame(sessionData, characterData = null) {
        const timestamp = new Date().toISOString();
        const savePayload = {
            character_id: this.currentCharacterId || 1, // Default character ID
            session_data: {
                ...sessionData,
                saveTimestamp: timestamp,
                version: 'v1.0.1-RECOVERY'
            },
            character_data: characterData || this.extractCharacterData(sessionData)
        };
        
        // Tentativo salvataggio backend
        if (this.backendAvailable) {
            try {
                const result = await this.request('game/save', {
                    method: 'POST',
                    body: JSON.stringify(savePayload)
                });
                
                // Backup localStorage per sicurezza
                this.saveToLocalStorage(sessionData, 'backend_backup');
                
                console.log('[API] ✅ Partita salvata su server MySQL:', result.data);
                return { 
                    success: true, 
                    mode: 'backend', 
                    data: result.data,
                    message: 'Partita salvata su server!'
                };
                
            } catch (error) {
                console.warn('[API] ⚠️ Errore backend, fallback localStorage:', error.message);
                this.backendAvailable = false;
                // Continua con localStorage fallback
            }
        }
        
        // Fallback localStorage
        try {
            this.saveToLocalStorage(sessionData, 'primary');
            console.log('[API] 💾 Partita salvata su localStorage (fallback)');
            return { 
                success: true, 
                mode: 'localStorage', 
                message: 'Partita salvata localmente'
            };
        } catch (error) {
            console.error('[API] ❌ Errore salvataggio localStorage:', error);
            return { 
                success: false, 
                error: 'Impossibile salvare la partita',
                details: error.message
            };
        }
    }
    
    /**
     * Caricamento dual-mode
     */
    async loadGame(characterId = null) {
        const loadCharacterId = characterId || this.currentCharacterId;
        
        // Tentativo caricamento backend
        if (this.backendAvailable && loadCharacterId) {
            try {
                const result = await this.request(`game/load/${loadCharacterId}`);
                console.log('[API] ✅ Partita caricata da server MySQL:', result.data);
                return { 
                    success: true, 
                    mode: 'backend', 
                    data: result.data.session_data,
                    character: result.data.character_data,
                    message: 'Partita caricata dal server!'
                };
                
            } catch (error) {
                console.warn('[API] ⚠️ Errore caricamento backend:', error.message);
                this.backendAvailable = false;
                // Continua con localStorage fallback
            }
        }
        
        // Fallback localStorage
        try {
            const sessionData = this.loadFromLocalStorage();
            if (sessionData) {
                console.log('[API] 💾 Partita caricata da localStorage (fallback)');
                return { 
                    success: true, 
                    mode: 'localStorage', 
                    data: sessionData,
                    message: 'Partita caricata localmente'
                };
            } else {
                return { 
                    success: false, 
                    error: 'Nessun salvataggio trovato'
                };
            }
        } catch (error) {
            console.error('[API] ❌ Errore caricamento localStorage:', error);
            return { 
                success: false, 
                error: 'Errore caricamento partita',
                details: error.message
            };
        }
    }
    
    /**
     * Gestione personaggi
     */
    async getCharacters() {
        if (this.backendAvailable) {
            try {
                const result = await this.request('characters');
                return { success: true, mode: 'backend', data: result.data };
            } catch (error) {
                this.backendAvailable = false;
                console.warn('[API] ⚠️ Backend non disponibile per lista personaggi');
            }
        }
        
        // Fallback: ritorna personaggio locale di default
        return { 
            success: true, 
            mode: 'localStorage', 
            data: [{ 
                id: 1, 
                name: 'Sopravvissuto', 
                created_at: new Date().toISOString() 
            }] 
        };
    }
    
    async createCharacter(characterData) {
        if (this.backendAvailable) {
            try {
                const result = await this.request('characters', {
                    method: 'POST',
                    body: JSON.stringify(characterData)
                });
                this.currentCharacterId = result.data.id;
                this.saveCharacterId(this.currentCharacterId);
                return { success: true, mode: 'backend', data: result.data };
            } catch (error) {
                this.backendAvailable = false;
            }
        }
        
        // Fallback: crea personaggio locale
        const localCharacter = {
            id: 1,
            name: characterData.name || 'Sopravvissuto',
            created_at: new Date().toISOString()
        };
        this.currentCharacterId = 1;
        this.saveCharacterId(1);
        return { success: true, mode: 'localStorage', data: localCharacter };
    }
    
    /**
     * Utilità localStorage
     */
    saveToLocalStorage(sessionData, type = 'primary') {
        const key = type === 'backup' ? 'safeplace_backup' : 'safeplace_session';
        localStorage.setItem(key, JSON.stringify(sessionData));
    }
    
    loadFromLocalStorage() {
        try {
            // Prova prima il salvataggio primario, poi il backup
            const primary = localStorage.getItem('safeplace_session');
            if (primary) return JSON.parse(primary);
            
            const backup = localStorage.getItem('safeplace_backup');
            if (backup) return JSON.parse(backup);
            
            return null;
        } catch (error) {
            console.error('[API] Errore parsing localStorage:', error);
            return null;
        }
    }
    
    /**
     * Gestione Character ID
     */
    saveCharacterId(id) {
        localStorage.setItem('safeplace_character_id', id.toString());
    }
    
    loadCharacterId() {
        const id = localStorage.getItem('safeplace_character_id');
        return id ? parseInt(id) : null;
    }
    
    /**
     * Estrazione dati personaggio da sessione
     */
    extractCharacterData(sessionData) {
        if (!sessionData.player) return null;
        
        const player = sessionData.player;
        return {
            name: player.name || 'Sopravvissuto',
            health: player.hp || 100,
            max_health: player.maxHp || 100,
            position_x: player.x || 0,
            position_y: player.y || 0,
            level: player.level || 1,
            experience: player.experience || 0,
            stats: {
                potenza: player.potenza || 10,
                agilita: player.agilita || 10,
                vigore: player.vigore || 10,
                intelletto: player.intelletto || 10,
                percezione: player.percezione || 10,
                influenza: player.influenza || 10,
                food: player.food || 100,
                water: player.water || 100
            }
        };
    }
    
    /**
     * Diagnostica sistema
     */
    getStatus() {
        return {
            backendAvailable: this.backendAvailable,
            baseUrl: this.baseUrl,
            currentCharacterId: this.currentCharacterId,
            localStorageSize: this.getLocalStorageSize(),
            mode: this.backendAvailable ? 'backend' : 'localStorage'
        };
    }
    
    getLocalStorageSize() {
        try {
            const session = localStorage.getItem('safeplace_session');
            const backup = localStorage.getItem('safeplace_backup');
            return {
                session: session ? (session.length / 1024).toFixed(2) + ' KB' : 'vuoto',
                backup: backup ? (backup.length / 1024).toFixed(2) + ' KB' : 'vuoto'
            };
        } catch (error) {
            return { error: error.message };
        }
    }
}

// Istanza globale API
const apiClient = new SafePlaceAPI();

// Export globale per compatibilità
window.APIClient = apiClient;
window.SafePlaceAPI = SafePlaceAPI;

// Debug helper globale
window.API_DEBUG = {
    status: () => apiClient.getStatus(),
    testConnection: () => apiClient.testConnection(),
    forceBackend: () => { apiClient.backendAvailable = true; },
    forceLocalStorage: () => { apiClient.backendAvailable = false; }
};

console.log('[API] ✅ SafePlaceAPI caricato - Dual-mode attivo'); 
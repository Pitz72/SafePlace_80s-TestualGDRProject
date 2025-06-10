# 🔗 PIANO INTEGRAZIONE FRONTEND-BACKEND
## The Safe Place - Migrazione localStorage → MySQL

### 📅 **Data**: 26 Maggio 2025
### 🎯 **Obiettivo**: Integrare le API backend nel frontend esistente

---

## 🏆 STATO ATTUALE

### ✅ **Completato**
- [x] Backend MVP con PHP 8.3.1 + MySQL 5.7.24
- [x] API REST complete per salvataggio/caricamento
- [x] Database schema implementato e testato
- [x] GameController con tutti i metodi CRUD
- [x] Test API funzionanti al 100%

### 🎯 **Prossimo Obiettivo**
Implementare integrazione frontend mantenendo compatibilità localStorage

---

## 📋 STRATEGIA DUAL-MODE

### **Principio Base**
Implementare un sistema **dual-mode** che:
1. **Tenta sempre il backend** per salvataggio/caricamento
2. **Fallback automatico** su localStorage in caso di errori
3. **Mantiene compatibilità** con il codice esistente
4. **Migrazione graduale** senza interruzioni

### **Vantaggi**
- ✅ **Zero downtime**: Il gioco continua a funzionare sempre
- ✅ **Backward compatibility**: localStorage rimane funzionante
- ✅ **Progressive enhancement**: Backend quando disponibile
- ✅ **Resilienza**: Gestione automatica errori di rete

---

## 🔧 IMPLEMENTAZIONE TECNICA

### **Fase 1: Creazione Modulo API**
Creare `js/api_client.js` con:

```javascript
// Configurazione API
const API_CONFIG = {
    baseUrl: 'http://localhost/backend/public/api',
    timeout: 5000,
    retries: 2
};

// Client API principale
class SafePlaceAPI {
    constructor() {
        this.baseUrl = API_CONFIG.baseUrl;
        this.timeout = API_CONFIG.timeout;
    }
    
    // Metodo generico per richieste HTTP
    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}/${endpoint}`;
        const config = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            ...options
        };
        
        try {
            const response = await fetch(url, config);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Errore API');
            }
            
            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }
    
    // Metodi specifici
    async saveGame(characterId, sessionData, characterData) {
        return this.request('game/save', {
            method: 'POST',
            body: JSON.stringify({
                character_id: characterId,
                session_data: sessionData,
                character_data: characterData
            })
        });
    }
    
    async loadGame(characterId) {
        return this.request(`game/load/${characterId}`);
    }
    
    async getCharacters() {
        return this.request('characters');
    }
    
    async createCharacter(characterData) {
        return this.request('characters', {
            method: 'POST',
            body: JSON.stringify(characterData)
        });
    }
}

// Istanza globale
const apiClient = new SafePlaceAPI();
```

### **Fase 2: Wrapper Dual-Mode**
Modificare `js/game_core.js`:

```javascript
// Variabile globale per tracking modalità
let currentCharacterId = null;
let backendAvailable = true;

// Funzione di salvataggio dual-mode
async function saveGame() {
    if (typeof DEBUG_MODE !== 'undefined' && DEBUG_MODE) {
        console.log("Salvataggio dual-mode...");
    }
    
    try {
        // Prepara dati per backend
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
                // ... altri stats
            }
        };
        
        // Tentativo salvataggio backend
        if (backendAvailable && currentCharacterId) {
            try {
                const result = await apiClient.saveGame(
                    currentCharacterId, 
                    sessionData, 
                    characterData
                );
                
                // Backup localStorage
                saveToLocalStorage(sessionData);
                
                addMessage("Partita salvata su server!", "success");
                return true;
                
            } catch (error) {
                console.warn("Backend non disponibile, uso localStorage:", error);
                backendAvailable = false;
                // Continua con localStorage
            }
        }
        
        // Fallback localStorage
        saveToLocalStorage(sessionData);
        addMessage("Partita salvata localmente", "warning");
        return true;
        
    } catch (error) {
        console.error("Errore salvataggio:", error);
        addMessage("Errore durante il salvataggio!", "danger");
        return false;
    }
}

// Funzione di caricamento dual-mode
async function loadGame() {
    if (typeof DEBUG_MODE !== 'undefined' && DEBUG_MODE) {
        console.log("Caricamento dual-mode...");
    }
    
    try {
        // Tentativo caricamento backend
        if (backendAvailable && currentCharacterId) {
            try {
                const result = await apiClient.loadGame(currentCharacterId);
                
                if (result.success) {
                    // Ripristina stato da backend
                    restoreGameState(result.session_data);
                    addMessage(`Partita caricata dal server (${result.last_save})`, "success");
                    return true;
                }
                
            } catch (error) {
                console.warn("Backend non disponibile, uso localStorage:", error);
                backendAvailable = false;
                // Continua con localStorage
            }
        }
        
        // Fallback localStorage
        return loadFromLocalStorage();
        
    } catch (error) {
        console.error("Errore caricamento:", error);
        addMessage("Errore durante il caricamento!", "danger");
        return false;
    }
}

// Funzioni helper
function saveToLocalStorage(sessionData) {
    const saveDataString = JSON.stringify(sessionData);
    localStorage.setItem(SAVE_KEY, saveDataString);
}

function loadFromLocalStorage() {
    const saveDataString = localStorage.getItem(SAVE_KEY);
    if (!saveDataString) {
        addMessage("Nessuna partita salvata trovata.", "warning");
        return false;
    }
    
    const loadedData = JSON.parse(saveDataString);
    restoreGameState(loadedData);
    addMessage("Partita caricata da localStorage", "info");
    return true;
}

function restoreGameState(sessionData) {
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
        renderMap();
        renderStats();
        renderInventory();
        renderLegend();
    }, 100);
    
    // Attiva gioco
    showScreen(DOM.gameContainer);
    gameActive = true;
    gamePaused = false;
    eventScreenActive = false;
}
```

### **Fase 3: Sistema Selezione Personaggio**
Aggiungere schermata selezione personaggio:

```javascript
// Nuova funzione per gestire personaggi
async function showCharacterSelection() {
    try {
        const result = await apiClient.getCharacters();
        
        if (result.success && result.characters.length > 0) {
            // Mostra lista personaggi esistenti
            displayCharacterList(result.characters);
        } else {
            // Crea primo personaggio automaticamente
            await createNewCharacter();
        }
        
    } catch (error) {
        console.warn("Backend non disponibile, modalità offline");
        backendAvailable = false;
        // Continua con localStorage
        loadFromLocalStorage();
    }
}

async function createNewCharacter() {
    const characterData = {
        name: 'Survivor_' + Date.now(),
        health: 100,
        position: {x: 5, y: 5},
        stats: {
            maxHp: 100,
            food: 10,
            water: 10,
            // ... stats iniziali
        }
    };
    
    try {
        const result = await apiClient.createCharacter(characterData);
        if (result.success) {
            currentCharacterId = result.character_id;
            addMessage("Nuovo personaggio creato!", "success");
        }
    } catch (error) {
        console.warn("Impossibile creare personaggio su server");
        currentCharacterId = null;
    }
}
```

---

## 📅 TIMELINE IMPLEMENTAZIONE

### **Settimana 1: Preparazione**
- [ ] **Giorno 1-2**: Creazione modulo `js/api_client.js`
- [ ] **Giorno 3-4**: Implementazione funzioni dual-mode
- [ ] **Giorno 5-7**: Test integrazione e debug

### **Settimana 2: Integrazione**
- [ ] **Giorno 1-3**: Sistema selezione personaggio
- [ ] **Giorno 4-5**: UI feedback migliorato
- [ ] **Giorno 6-7**: Test completi e stabilizzazione

### **Settimana 3: Ottimizzazione**
- [ ] **Giorno 1-2**: Compressione dati mappa
- [ ] **Giorno 3-4**: Auto-save periodico
- [ ] **Giorno 5-7**: Performance tuning

---

## 🧪 PIANO DI TEST

### **Test Scenari**
1. **Backend disponibile**: Salvataggio/caricamento server
2. **Backend non disponibile**: Fallback localStorage
3. **Connessione intermittente**: Resilienza errori
4. **Migrazione dati**: Da localStorage a backend
5. **Compatibilità**: Funzionamento con dati esistenti

### **Test Automatici**
```javascript
// Test suite per dual-mode
async function testDualMode() {
    console.log("🧪 Test Dual-Mode System");
    
    // Test 1: Backend disponibile
    backendAvailable = true;
    currentCharacterId = 1;
    const saveResult = await saveGame();
    console.assert(saveResult, "Test 1 fallito");
    
    // Test 2: Backend non disponibile
    backendAvailable = false;
    const saveResult2 = await saveGame();
    console.assert(saveResult2, "Test 2 fallito");
    
    // Test 3: Caricamento
    const loadResult = await loadGame();
    console.assert(loadResult, "Test 3 fallito");
    
    console.log("✅ Tutti i test passati!");
}
```

---

## 🎯 OBIETTIVI DI QUALITÀ

### **Performance**
- ⏱️ **Response Time**: < 500ms per save/load
- 📊 **Fallback Time**: < 100ms su errore backend
- 💾 **Memory Usage**: Nessun aumento significativo

### **Usabilità**
- 🔄 **Trasparenza**: Utente non nota la differenza
- 📱 **Feedback**: Messaggi chiari su stato operazioni
- 🛡️ **Resilienza**: Nessuna perdita dati

### **Compatibilità**
- 🔙 **Backward**: Funziona con salvataggi esistenti
- 🔄 **Forward**: Preparato per future estensioni
- 🌐 **Cross-browser**: Supporto browser moderni

---

## 📝 CHECKLIST IMPLEMENTAZIONE

### **Preparazione**
- [ ] Backup codice esistente
- [ ] Creazione branch git per integrazione
- [ ] Setup ambiente di test

### **Sviluppo**
- [ ] Modulo `js/api_client.js`
- [ ] Modifica `js/game_core.js` per dual-mode
- [ ] Sistema selezione personaggio
- [ ] UI feedback migliorato

### **Test**
- [ ] Test unitari funzioni API
- [ ] Test integrazione dual-mode
- [ ] Test scenari errore
- [ ] Test performance

### **Deploy**
- [ ] Merge in branch principale
- [ ] Aggiornamento documentazione
- [ ] Release notes

---

*Piano creato: 26 Maggio 2025*  
*Prossimo aggiornamento: Inizio implementazione*  
*Responsabile: AI Assistant + Utente* 
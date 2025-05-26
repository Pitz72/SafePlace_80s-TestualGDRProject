# 🔍 ANALISI FRONTEND LOCALSTORAGE - The Safe Place
## Mappatura Sistema Salvataggio Esistente

### 📅 **Data Analisi**: 26 Maggio 2025
### 🎯 **Obiettivo**: Mappare localStorage per migrazione a MySQL

---

## 📊 STRUTTURA DATI LOCALSTORAGE ATTUALE

### **Chiave di Salvataggio**
```javascript
const SAVE_KEY = 'theSafePlaceSaveData';
```

### **Oggetto saveData Completo**
```javascript
const saveData = {
    player: player,                           // Oggetto completo giocatore
    map: map,                                // Array bidimensionale mappa
    dayMovesCounter: dayMovesCounter,        // Contatore mosse giorno
    isDay: isDay,                           // Flag giorno/notte
    gameDay: gameDay,                       // Numero giorno corrente
    easterEggPixelDebhFound: easterEggPixelDebhFound,     // Flag easter egg
    uniqueEventWebRadioFound: uniqueEventWebRadioFound,   // Flag evento unico
    saveTimestamp: new Date().toISOString()  // Timestamp salvataggio
};
```

---

## 👤 STRUTTURA OGGETTO PLAYER

### **Statistiche Base**
```javascript
player = {
    // Statistiche principali
    hp: number,                    // Punti vita attuali
    maxHp: number,                // Punti vita massimi
    food: number,                 // Sazietà (0-10)
    water: number,                // Idratazione (0-10)
    
    // Attributi carattere
    vigore: number,               // Forza fisica
    potenza: number,              // Potenza attacchi
    agilita: number,              // Velocità e destrezza
    trascinamento: number,        // Capacità trasporto
    infiltrazione: number,        // Stealth
    precisione: number,           // Accuratezza
    adattamento: number,          // Resistenza ambientale
    
    // Posizione
    x: number,                    // Coordinata X mappa
    y: number,                    // Coordinata Y mappa
    
    // Stati condizione
    isInjured: boolean,           // Ferito
    isSick: boolean,              // Malato
    isPoisoned: boolean,          // Avvelenato
    hasBeenWarnedAboutNight: boolean,  // Flag warning notte
    
    // Equipaggiamento
    equippedWeapon: {
        itemId: string,
        currentDurability: number
    } | null,
    equippedArmor: {
        itemId: string,
        currentDurability: number
    } | null,
    
    // Inventario
    inventory: [
        {
            itemId: string,
            quantity: number
        }
    ],
    
    // Ricette conosciute
    knownRecipes: [string]        // Array ID ricette
};
```

---

## 🗺️ STRUTTURA MAPPA

### **Array Bidimensionale**
```javascript
map = [
    [
        {
            type: string,         // Tipo tile (PLAINS, MOUNTAIN, etc.)
            visited: boolean,     // Se esplorata
            items: [object],      // Oggetti presenti
            events: [object]      // Eventi disponibili
        }
    ]
];
```

### **Dimensioni**
- **Larghezza**: 250 tiles (MAP_WIDTH)
- **Altezza**: 250 tiles (MAP_HEIGHT)
- **Totale celle**: 62.500 tiles

---

## 🔄 FUNZIONI DI SALVATAGGIO

### **saveGame() - Linea 628**
```javascript
function saveGame() {
    try {
        const saveData = {
            player: player,
            map: map,
            dayMovesCounter: dayMovesCounter,
            isDay: isDay,
            gameDay: gameDay,
            easterEggPixelDebhFound: easterEggPixelDebhFound,
            uniqueEventWebRadioFound: uniqueEventWebRadioFound,
            saveTimestamp: new Date().toISOString()
        };
        
        const saveDataString = JSON.stringify(saveData);
        localStorage.setItem(SAVE_KEY, saveDataString);
        
        addMessage("Partita salvata con successo!", "success");
    } catch (error) {
        console.error("Errore durante il salvataggio:", error);
        addMessage("Errore durante il salvataggio!", "danger");
    }
}
```

### **loadGame() - Linea 655**
```javascript
function loadGame() {
    try {
        const saveDataString = localStorage.getItem(SAVE_KEY);
        if (!saveDataString) return false;
        
        const loadedData = JSON.parse(saveDataString);
        
        // Validazione dati
        if (!loadedData || !loadedData.player || !loadedData.map) {
            localStorage.removeItem(SAVE_KEY);
            return false;
        }
        
        // Ripristino stato globale
        player = loadedData.player;
        map = loadedData.map;
        dayMovesCounter = loadedData.dayMovesCounter;
        isDay = loadedData.isDay;
        gameDay = loadedData.gameDay;
        easterEggPixelDebhFound = loadedData.easterEggPixelDebhFound;
        uniqueEventWebRadioFound = loadedData.uniqueEventWebRadioFound;
        
        // Aggiornamento UI
        setTimeout(() => {
            renderMap();
            renderStats();
            renderInventory();
            renderLegend();
        }, 100);
        
        // Attivazione gioco
        showScreen(DOM.gameContainer);
        gameActive = true;
        gamePaused = false;
        eventScreenActive = false;
        
        return true;
    } catch (error) {
        console.error("Errore durante il caricamento:", error);
        return false;
    }
}
```

---

## 📍 PUNTI DI SALVATAGGIO IDENTIFICATI

### **Salvataggio Manuale**
- **Trigger**: Click pulsante "Salva Partita"
- **File**: `index.html` linea 85
- **Handler**: `DOM.saveGameButton.addEventListener('click', saveGame)`

### **Caricamento Manuale**
- **Trigger**: Click pulsante "Carica Partita"
- **File**: `game_core.js` linea 409
- **Handler**: `DOM.loadGameButton.addEventListener('click', loadGame)`

### **Validazione Caricamento**
- **Check**: `localStorage.getItem(SAVE_KEY)` per abilitare/disabilitare pulsante
- **Fallback**: Disabilita pulsante se nessun salvataggio

---

## 💾 DIMENSIONI E PERFORMANCE

### **Stima Dimensioni localStorage**
```
Player Object: ~2-3 KB
Map Array (250x250): ~500-800 KB  
Game State: ~1 KB
Total: ~503-804 KB per salvataggio
```

### **Limitazioni Attuali**
- ❌ **Nessun backup**: Un solo slot di salvataggio
- ❌ **Vulnerabile**: Cancellazione cache = perdita dati
- ❌ **Non sincronizzato**: Nessuna persistenza cross-device
- ❌ **Nessuna validazione**: Possibile corruzione dati
- ❌ **Cheating**: Modificabile da console browser

---

## 🎯 MAPPATURA PER MIGRAZIONE MYSQL

### **Tabella `characters` (Esistente)**
```sql
-- Dati player principali
id, user_id, name, level, experience, health, position, stats
```

### **Tabella `game_sessions` (Esistente)**
```sql
-- Stato completo gioco
id, character_id, session_data, last_save
```

### **Mapping Dati**
```javascript
// Da localStorage a MySQL
const sessionData = {
    // Stato gioco
    gameDay: gameDay,
    dayMovesCounter: dayMovesCounter,
    isDay: isDay,
    
    // Flags speciali
    easterEggPixelDebhFound: easterEggPixelDebhFound,
    uniqueEventWebRadioFound: uniqueEventWebRadioFound,
    
    // Mappa completa (compressa)
    mapData: map,
    
    // Timestamp
    saveTimestamp: new Date().toISOString()
};

const characterData = {
    // Stats base
    name: player.name || 'Survivor',
    level: 1, // Da implementare sistema livelli
    experience: 0, // Da implementare
    health: player.hp,
    position: JSON.stringify({x: player.x, y: player.y}),
    
    // Stats complete
    stats: JSON.stringify({
        maxHp: player.maxHp,
        food: player.food,
        water: player.water,
        vigore: player.vigore,
        potenza: player.potenza,
        agilita: player.agilita,
        trascinamento: player.trascinamento,
        infiltrazione: player.infiltrazione,
        precisione: player.precisione,
        adattamento: player.adattamento,
        isInjured: player.isInjured,
        isSick: player.isSick,
        isPoisoned: player.isPoisoned,
        equippedWeapon: player.equippedWeapon,
        equippedArmor: player.equippedArmor,
        knownRecipes: player.knownRecipes
    })
};
```

---

## 🔄 STRATEGIA MIGRAZIONE

### **Fase 1: Dual-Mode Implementation**
1. **Mantenere localStorage** come fallback
2. **Aggiungere salvataggio MySQL** parallelo
3. **Sync automatico** in background
4. **Fallback automatico** su localStorage in caso di errori

### **Fase 2: API Endpoints Necessari**
```php
POST /api/game/save
- Input: character_id, session_data, character_data
- Output: success/error, save_id

GET /api/game/load/{character_id}
- Output: session_data, character_data, last_save

GET /api/characters/{user_id}
- Output: lista personaggi utente

POST /api/characters
- Input: character_data
- Output: character_id
```

### **Fase 3: Modifiche Frontend**
```javascript
// Nuova funzione saveGame() ibrida
async function saveGame() {
    try {
        // Tentativo salvataggio backend
        const backendSuccess = await saveToBackend();
        
        if (backendSuccess) {
            // Backup localStorage
            saveToLocalStorage();
            addMessage("Partita salvata su server!", "success");
        } else {
            // Fallback localStorage
            saveToLocalStorage();
            addMessage("Partita salvata localmente (server non disponibile)", "warning");
        }
    } catch (error) {
        // Fallback localStorage
        saveToLocalStorage();
        addMessage("Errore server, salvato localmente", "warning");
    }
}
```

---

## ⚠️ CRITICITÀ IDENTIFICATE

### **Dimensioni Mappa**
- **Problema**: Mappa 250x250 = 62.500 celle
- **Soluzione**: Compressione JSON o salvataggio solo celle modificate

### **Frequenza Salvataggio**
- **Attuale**: Solo manuale
- **Proposta**: Auto-save ogni N mosse + salvataggio manuale

### **Validazione Dati**
- **Mancante**: Nessuna validazione integrità
- **Necessaria**: Schema validation per dati critici

### **Gestione Errori**
- **Limitata**: Solo try/catch base
- **Miglioramento**: Retry logic, fallback robusto

---

## 📋 CHECKLIST IMPLEMENTAZIONE

### **Preparazione**
- [x] Analisi localStorage completata
- [x] Mapping dati identificato
- [ ] Schema validation definito
- [ ] Strategia compressione mappa

### **Backend API**
- [ ] Endpoint POST /api/game/save
- [ ] Endpoint GET /api/game/load
- [ ] Validazione input/output
- [ ] Gestione errori robusta

### **Frontend Integration**
- [ ] Funzione saveToBackend()
- [ ] Funzione loadFromBackend()
- [ ] Dual-mode saveGame()
- [ ] Dual-mode loadGame()
- [ ] UI feedback migliorato

### **Testing**
- [ ] Test salvataggio/caricamento
- [ ] Test fallback localStorage
- [ ] Test gestione errori
- [ ] Test performance

---

*Analisi completata: 26 Maggio 2025*  
*Prossimo step: Implementazione API Backend*  
*Responsabile: AI Assistant + Utente* 
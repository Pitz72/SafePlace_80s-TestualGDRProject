# FASE 2: Analisi del Frontend - `player.js`

Questo documento analizza `archives/safeplace_advanced/js/player.js`, uno dei file più critici dell'intero progetto. Esso definisce e gestisce l'entità principale del gioco: il personaggio giocante.

## 1. Architettura dell'Oggetto `player`

Lo script definisce un singolo oggetto globale `player` che funge da "scheda del personaggio" digitale. Tutte le informazioni e gli stati relativi al protagonista sono contenuti qui.

### 1.1. Statistiche Primarie e Derivate

Il giocatore possiede un set di statistiche di base chiaramente ispirate ai giochi di ruolo da tavolo, generate casualmente all'inizio per garantire rigiocabilità:

*   **Statistiche di Base**: `forza`, `agilita`, `vigore`, `percezione`, `carisma`, `adattamento`.
*   **Risorse Vitali**: `hp` (Punti Vita, calcolati in base al `vigore`), `food` (Fame), `water` (Sete).
*   **Statistiche Derivate (Alias)**: Per compatibilità con il sistema di eventi, alcune statistiche vengono mappate su alias più descrittivi (es. `stats.forza` diventa `potenza`).

### 1.2. Inventario ed Equipaggiamento

La gestione degli oggetti è suddivisa in due aree principali:

*   `inventory`: Un array che contiene gli oggetti trasportati dal giocatore. Il sistema gestisce la "stackabilità" (oggetti che occupano un solo slot in multiples quantità) e un limite massimo di slot.
*   `equippedWeapon` e `equippedArmor`: Due slot dedicati che contengono l'arma e l'armatura attualmente in uso. Questi oggetti influenzano direttamente le performance in combattimento e sono soggetti a usura.

### 1.3. Stati e Condizioni

Il giocatore può subire diverse condizioni che ne alterano le capacità:

*   **Stati Boolean**: `isInjured`, `isSick`, `isPoisoned`. Questi flag attivano penalità passive o cambiano le interazioni disponibili.
*   **Stati Impliciti**: Condizioni come "Affamato" o "Assetato" non sono flag, ma vengono dedotte quando le risorse `food` o `water` scendono sotto una certa soglia. La funzione `checkAndLogStatusMessages` è responsabile di comunicare questi stati al giocatore.

### 1.4. Sistema di Progressione

Il gioco implementa un sistema di progressione stile RPG:

*   **Esperienza (`experience`)**: Il giocatore guadagna punti esperienza completando azioni specifiche (es. vincere combattimenti, superare skill check).
*   **Punti Statistica (`availableStatPoints`)**: Accumulata abbastanza esperienza, il giocatore riceve dei punti che può spendere per aumentare permanentemente le sue statistiche di base, permettendo una personalizzazione della build.

## 2. Conclusioni per il Porting

*   **Classe `Player`**: L'oggetto `player` è il candidato perfetto per diventare una classe `Player` in un'architettura orientata agli oggetti. Le funzioni globali che lo modificano (`useItem`, `addItemToInventory`, etc.) diventerebbero metodi di questa classe (es. `player.useItem()`).
*   **Gestione degli Stati**: L'uso di flag booleani e stati impliciti funziona, ma un sistema a "macchina a stati" più formale (`StateMachine`) potrebbe rendere la gestione delle condizioni del giocatore (es. Avvelenato, Affamato, Ferito contemporaneamente) più robusta e scalabile.
*   **Separazione Dati-Logica**: Il file mescola la definizione della struttura dati (`player`) con la logica per manipolarla. In un porting, sarebbe opportuno separare la definizione della classe `Player` dalla logica di gioco che la utilizza.

---

## APPENDICE A: Codice Sorgente Grezzo di Funzioni Chiave (`player.js`)

### A.1 Inizializzazione del Personaggio (`generateCharacter`)

```javascript
function generateCharacter() {
    player = {
        hp: 100,
        maxHp: 100,
        food: STARTING_FOOD,
        water: STARTING_WATER,
        stats: {
            forza: getRandomInt(3, 6),
            agilita: getRandomInt(3, 6),
            vigore: getRandomInt(3, 6),
            percezione: getRandomInt(3, 6),
            carisma: getRandomInt(3, 6),
            adattamento: getRandomInt(3, 6)
        },
        inventory: [],
        equippedWeapon: null,
        equippedArmor: null,
        isInjured: false,
        isSick: false,
        isPoisoned: false,
        experience: 0,
        availableStatPoints: 0,
        // ...
    };

    // Calcolo HP massimi basati sul Vigore
    player.maxHp = 70 + (player.stats.vigore * 5);
    player.hp = player.maxHp;

    // ... (Aggiunta oggetti iniziali e equipaggiamento) ...
}
```

### A.2 Gestione Inventario (`addItemToInventory`, `removeItemFromInventory`)

```javascript
function addItemToInventory(itemId, quantity) {
    const itemInfo = ITEM_DATA[itemId];
    if (!itemInfo) {
        // ...
        return false;
    }

    if (itemInfo.stackable) {
        const existingItemIndex = player.inventory.findIndex(slot => slot.itemId === itemId);
        if (existingItemIndex !== -1) {
            player.inventory[existingItemIndex].quantity += quantity;
            return true;
        }
    }

    if (player.inventory.length < MAX_INVENTORY_SLOTS) {
        player.inventory.push({ itemId: itemId, quantity: quantity });
        return true;
    }
    
    // ... (gestione inventario pieno) ...
    return false;
}

function removeItemFromInventory(itemId, quantityToRemove = 0) {
    const itemIndex = player.inventory.findIndex(slot => slot.itemId === itemId);
    if (itemIndex === -1) {
        return false;
    }

    if (quantityToRemove <= 0 || quantityToRemove >= player.inventory[itemIndex].quantity) {
        player.inventory.splice(itemIndex, 1);
    } else {
        player.inventory[itemIndex].quantity -= quantityToRemove;
    }
    return true;
}
```

### A.3 Utilizzo e Gestione Oggetti (`useItem`, `equipItem`, `unequipItem`)

```javascript
function useItem(itemId) {
    const itemIndex = player.inventory.findIndex(slot => slot.itemId === itemId);
    // ...
    const itemInfo = ITEM_DATA[itemId];
    
    // Applica effetti (es. cura, nutrimento)
    if (itemInfo.effects) {
        // ... (logica per applicare effetti di cura, status, etc.) ...
    }
    
    // Rimuovi l'oggetto o una sua porzione dopo l'uso
    if (itemInfo.consumable) {
        // ... (logica per ridurre quantità o rimuovere oggetto) ...
    }
}

function equipItem(itemId) {
    const itemInfo = ITEM_DATA[itemId];
    // ...
    if (itemInfo.type === 'weapon') {
        // ... (sposta l'arma equipaggiata nell'inventario e equipaggia la nuova) ...
        player.equippedWeapon = { itemId: itemId, /*...*/ };
    } else if (itemInfo.type === 'armor') {
        // ... (logica simile per l'armatura) ...
    }
}

function unequipItem(slotKey) {
    // ... (logica per spostare l'oggetto equipaggiato nell'inventario, se c'è spazio) ...
}
```

### A.4 Sistema di Progressione (`awardExperience`, `improveStat`)

```javascript
function awardExperience(expAmount, reason = "azione completata") {
    player.experience += expAmount;
    // ... (Logica per controllare se l'esperienza supera la soglia per un nuovo punto statistica) ...
    const expNeeded = 100 + (player.totalStatUpgrades * 50); // Esempio di soglia crescente
    if (player.experience >= expNeeded) {
        player.experience -= expNeeded;
        player.availableStatPoints++;
        // ...
    }
}

function improveStat(statName) {
    if (player.availableStatPoints > 0) {
        player.stats[statName]++;
        player.availableStatPoints--;
        player.totalStatUpgrades++;
        // ... (Aggiorna statistiche derivate come HP massimi) ...
    }
}
```

### A.5 Gestione dello Stato del Giocatore (`checkAndLogStatusMessages`)

```javascript
function checkAndLogStatusMessages() {
    // Controlla e mostra messaggi per stati critici
    if (player.hp <= 20) {
        addMessage(getRandomText(STATO_MESSAGGI.MORENTE), 'fatal');
    } else if (player.food <= 0 && player.water <= 0) {
        addMessage(getRandomText(STATO_MESSAGGI.AFFAMATO_E_ASSETATO), 'danger');
    } else if (player.food <= 0) {
        addMessage(getRandomText(STATO_MESSAGGI.AFFAMATO), 'warning');
    }
    // ... (Controlli simili per altri stati come sete, ferite, malattia, veleno) ...
}
``` 
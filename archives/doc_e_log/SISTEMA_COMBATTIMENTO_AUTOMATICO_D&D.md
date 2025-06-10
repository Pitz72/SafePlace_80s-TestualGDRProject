# SISTEMA DI COMBATTIMENTO AUTOMATICO EVOLUTO D&D
## VERSIONE: v1.0 - SPECIFICA DEFINITIVA

## ⚠️ **AVVISO CRITICO PER TUTTI GLI LLM FUTURI**

### **IL COMBATTIMENTO A TURNI NON ESISTE IN QUESTO PROGETTO**
- **MAI** suggerire o implementare combattimento a turni
- **MAI** creare interfacce separate per combattimenti
- **MAI** aggiungere complessità tattica o posizionamento
- **SEMPRE** usare il sistema automatico descritto in questo documento

---

## 🎯 **FILOSOFIA DEL SISTEMA**

Il Sistema di Combattimento Automatico Evoluto D&D è progettato per:
1. **Mantenere la semplicità** dell'interfaccia esistente
2. **Aggiungere profondità** attraverso calcoli complessi invisibili
3. **Preservare il flow narrativo** senza interruzioni
4. **Evitare game over immediati** mantenendo tensione
5. **Integrare perfettamente** con il sistema eventi esistente

---

## 🎲 **MECCANICHE CORE**

### **1. STATISTICHE COMBATTIMENTO**

#### **Giocatore**
```javascript
player.combatStats = {
    attackBonus: Math.floor((player.potenza - 10) / 2) + player.level,
    defenseClass: 10 + Math.floor((player.agilita - 10) / 2) + armorBonus,
    damageBonus: Math.floor((player.potenza - 10) / 2),
    resistance: Math.floor((player.vigore - 10) / 2)
}
```

#### **Nemici**
```javascript
// Esempio: Predone Base
predatorBase = {
    name: "Predone Disperato",
    hp: 15,
    attackBonus: +2,
    defenseClass: 12,
    damage: "1d6+1",
    resistance: 0
}
```

### **2. CALCOLO COMBATTIMENTO**

#### **Sequenza di Risoluzione**
```javascript
function resolveCombat(enemy) {
    // 1. CALCOLO ATTACCO GIOCATORE
    const playerRoll = rollD20();
    const playerAttack = playerRoll + player.combatStats.attackBonus;
    
    // 2. CONFRONTO CON DIFESA NEMICO
    if (playerAttack >= enemy.defenseClass) {
        // SUCCESSO: Calcola danno
        const weaponDamage = calculateWeaponDamage();
        const totalDamage = weaponDamage + player.combatStats.damageBonus;
        return { success: true, damage: totalDamage };
    } else {
        // FALLIMENTO: Nemico contrattacca
        const enemyDamage = rollDice(enemy.damage) - player.combatStats.resistance;
        return { success: false, damage: Math.max(1, enemyDamage) };
    }
}
```

### **3. PRESENTAZIONE NEL POPUP**

#### **Struttura Evento Combattimento**
```javascript
// Fase 1: Setup narrativo
showEventPopup({
    title: "Scontro con Predoni",
    description: "Due figure armate ti bloccano il passo...",
    choices: [
        { text: "Combatti", action: "fight" },
        { text: "Fuggi", action: "flee" },
        { text: "Negozia", action: "talk" }
    ]
});

// Fase 2: Risoluzione con Suspense (se scelta "Combatti")
function handleCombatChoice() {
    // Mostra messaggio di calcolo
    updateEventContent("I dadi del destino rotolano...");
    
    // Delay per suspense
    setTimeout(() => {
        const result = resolveCombat(currentEnemy);
        
        // Mostra risultato colorato
        if (result.success) {
            showCombatResult(
                "VITTORIA! " + getCombatSuccessNarrative(),
                "success", // Verde chiaro
                result
            );
        } else {
            showCombatResult(
                "SCONFITTA! " + getCombatFailureNarrative(),
                "danger", // Rosso
                result
            );
        }
    }, 1500); // 1.5 secondi di suspense
}
```

### **4. FEEDBACK VISIVO**

#### **Colori e Stili**
```css
/* Risultato Vittoria */
.combat-result-success {
    color: #90EE90; /* Verde chiaro */
    font-weight: bold;
    text-shadow: 0 0 10px #90EE90;
}

/* Risultato Sconfitta */
.combat-result-danger {
    color: #FF6B6B; /* Rosso */
    font-weight: bold;
    text-shadow: 0 0 10px #FF6B6B;
}
```

---

## 📝 **ESEMPI DI IMPLEMENTAZIONE**

### **Evento PREDATOR Evoluto**
```javascript
// In events.js - getRandomPredatorEvent() modificato
case 'PREDATOR':
    // Genera nemico con statistiche
    const predator = generatePredator(player.level);
    context.enemy = predator;
    
    eventChoices = [
        { 
            text: "Combatti i predoni",
            action: "fight",
            // Non più solo skillCheck, ma combattimento completo
            combatCheck: true
        },
        { 
            text: "Tenta la fuga",
            skillCheck: { stat: 'agilita', difficulty: 12 }
        },
        { 
            text: "Prova a parlamentare",
            skillCheck: { stat: 'influenza', difficulty: 14 }
        }
    ];
    break;
```

### **Gestione Risultati**
```javascript
// In handleEventChoice() - aggiunta logica combattimento
if (choice.combatCheck && context.enemy) {
    // Inizia sequenza combattimento automatico
    showCombatCalculation();
    
    setTimeout(() => {
        const result = resolveCombat(context.enemy);
        
        if (result.success) {
            // Vittoria: nemico sconfitto
            addMessage(`Hai sconfitto ${context.enemy.name}!`, "success");
            applyLoot(context.enemy.lootTable);
            awardExperience(context.enemy.expValue, "vittoria in combattimento");
        } else {
            // Sconfitta: subisci danni
            player.hp -= result.damage;
            addMessage(`${context.enemy.name} ti ferisce! Perdi ${result.damage} HP.`, "danger");
            
            // Possibili conseguenze aggiuntive
            if (Math.random() < 0.3) {
                player.isInjured = true;
                addMessage("Sei rimasto ferito nello scontro.", "warning");
            }
        }
        
        updateUI();
        showCombatResultPopup(result);
    }, 1500);
}
```

---

## 🔄 **INTEGRAZIONE CON SISTEMI ESISTENTI**

### **1. Sistema Esperienza**
- Vittorie in combattimento assegnano EXP basata sul livello nemico
- Sconfitte assegnano EXP ridotta per "esperienza appresa"

### **2. Sistema Equipaggiamento**
- Armi influenzano direttamente attackBonus e damage
- Armature aumentano defenseClass
- Usura applicata dopo ogni combattimento

### **3. Sistema Stati**
- Ferito: -2 attackBonus
- Malato: -1 a tutti i bonus
- Avvelenato: -3 defenseClass

---

## 🚫 **COSA NON FARE MAI**

1. **NON** creare una schermata separata per combattimenti
2. **NON** implementare turni o round multipli
3. **NON** aggiungere menu di azioni durante combattimento
4. **NON** mostrare HP nemici o barre vita
5. **NON** permettere uso inventario durante combattimento
6. **NON** implementare posizionamento o movimento
7. **NON** creare animazioni o effetti visivi complessi

---

## ✅ **COSA FARE SEMPRE**

1. **SEMPRE** risolvere combattimenti in un singolo calcolo
2. **SEMPRE** usare il popup eventi esistente
3. **SEMPRE** mantenere narrativa al centro
4. **SEMPRE** applicare conseguenze graduali (no instant death)
5. **SEMPRE** dare feedback chiaro con colori
6. **SEMPRE** integrare con sistemi esistenti
7. **SEMPRE** mantenere semplicità interfaccia

---

## 🎯 **RISULTATO FINALE**

Il sistema fornisce:
- **Profondità strategica** attraverso build del personaggio
- **Tensione** attraverso calcoli con suspense
- **Varietà** attraverso nemici con statistiche diverse
- **Progressione** attraverso scaling con livello
- **Semplicità** mantenendo interfaccia minimale

**QUESTO È L'UNICO SISTEMA DI COMBATTIMENTO APPROVATO PER THE SAFE PLACE**

---

## 📊 **STATO IMPLEMENTAZIONE**

### ✅ **COMPLETATO**

1. **Definizioni Nemici** (`js/game_data.js`)
   - Predoni: 3 livelli (Disperato, Armato, Capo)
   - Animali: 3 livelli (Ratto Mutante, Cane Selvaggio, Lupo Mutato)
   - Creature Speciali: Orrore della Zona
   - Ogni nemico ha: HP, Bonus Attacco, Classe Difesa, Danno, Resistenza, Valore EXP, Tabella Loot

2. **Sistema di Calcolo Combattimento** (`js/game_data.js`)
   - `CombatSystem` oggetto con metodi:
     - `rollD20()`: Tiro base d20
     - `rollDice(min, max)`: Tiri generici
     - `resolveAttack()`: Calcola singolo attacco
     - `resolveCombat()`: Risolve combattimento completo

3. **Integrazione Eventi** (`js/events.js`)
   - Sostituita vecchia logica in `handleEventChoice()`
   - Eventi PREDATOR con azione 'lotta' usano nuovo sistema
   - Eventi ANIMAL con azione 'attacca' usano nuovo sistema
   - Funzione `selectEnemyForCombat()` per selezione dinamica nemici
   - Funzione `showCombatResultWithSuspense()` per presentazione risultati

4. **Stili CSS** (`css/events.css`)
   - Classe `.combat-result` per contenitore risultati
   - Animazioni per vittoria/sconfitta
   - Effetti visivi per suspense
   - Colori differenziati per attacchi giocatore/nemico

### 🔧 **DA IMPLEMENTARE**

1. **Bonus Equipaggiamento**
   - Calcolo bonus arma per `weaponDamage` giocatore
   - Calcolo bonus armatura per `armorBonus` giocatore

2. **Modificatori Situazionali**
   - Bonus/malus per condizioni (ferito, malato, avvelenato)
   - Bonus ambientali (combattimento notturno, terreno difficile)

3. **Bilanciamento**
   - Test approfonditi difficoltà nemici
   - Calibrazione danni e resistenze
   - Verifica progressione esperienza

### 📝 **NOTE TECNICHE**

- Il sistema usa statistiche del giocatore:
  - Attacco: `Math.floor(potenza / 2)`
  - Difesa: `10 + Math.floor(agilità / 2) + armorBonus`
  - Resistenza: `Math.floor(vigore / 3)`
  
- Combattimento massimo 5 round per evitare loop infiniti
- Danno minimo sempre 1 (dopo resistenza)
- Critici naturali su 20 (non ancora implementati effetti speciali)

---

*Documento creato: 27-05-2025*
*Versione: 1.0 - DEFINITIVA*
*Status: SPECIFICA VINCOLANTE PER TUTTI GLI SVILUPPI FUTURI* 
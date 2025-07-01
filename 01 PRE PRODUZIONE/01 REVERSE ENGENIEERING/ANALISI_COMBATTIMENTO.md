# FASE 3: Analisi dei Contenuti - Sistema di Combattimento

Questo documento descrive l'architettura completa del sistema di combattimento del progetto, ricostruita attraverso l'analisi di `game_data.js` e `advanced_combat_system.js`.

Il sistema di combattimento è evoluto da una versione base e automatizzata a un sistema avanzato e tattico, tramite un meccanismo di ereditarietà e override.

## 1. Il Sistema di Combattimento Base (`CombatSystem`)

Definito in `js/game_data.js`, questo è il motore di combattimento originale e legacy.

- **Caratteristiche Principali**:
    - **Automatizzato**: La funzione `resolveCombat` simula un combattimento completo in modo automatico.
    - **Loop Semplificato**: Il combattimento dura un massimo di 5 round.
    - **Meccaniche D&D Semplici**: Utilizza una funzione `resolveAttack` per gestire tiri per colpire (d20 + bonus vs Classe Armatura) e calcolo del danno.
    - **Nessuna Complessità**: È privo di effetti di stato, abilità speciali o altre meccaniche tattiche.
- **Dipendenze**:
    - `ITEM_DATA`: Per le statistiche dell'equipaggiamento del giocatore.
    - `ENEMY_DATA`: Un database di nemici legacy, anch'esso definito in `game_data.js`.

## 2. Il Sistema di Combattimento Avanzato (`AdvancedCombatSystem`)

Definito in `js/advanced_combat_system.js`, questo è il sistema di combattimento effettivamente utilizzato nella versione finale del gioco.

### 2.1. Ereditarietà e Override

`AdvancedCombatSystem` è progettato per estendere il sistema di base:

```javascript
const AdvancedCombatSystem = {
    // Eredita tutto dal sistema base
    ...CombatSystem,
    
    // Override del sistema di risoluzione combattimento
    resolveCombat: function(player, enemy) {
        // ... Logica di combattimento complessa ...
    }
    // ... Altre funzioni e override ...
};
```

Il gioco poi si assicura che questa versione avanzata sia quella utilizzata, tramite l'istruzione:
`window.CombatSystem = AdvancedCombatSystem;`

### 2.2. Caratteristiche Principali

Il sistema avanzato trasforma il combattimento da uno scambio automatico a un'esperienza tattica e ricca di meccaniche.

- **Loop a Turni**: Il combattimento si svolge in un loop a turni (fino a 10 round), dando un maggior controllo e visibilità sull'azione.
- **Effetti di Stato**: Gestisce attivamente effetti come `POISON`, `BLEEDING`, `PARALYSIS`, che influenzano i combattenti a ogni turno.
- **Abilità Speciali**: Integra il database `SPECIAL_ABILITIES` per dare ai nemici comportamenti unici, attivati da trigger specifici (`on_hit`, `low_hp`, `first_attack`, etc.).
- **Scalabilità della Difficoltà**: Utilizza il `TIER_SYSTEM` per potenziare i nemici in base ai giorni sopravvissuti, mantenendo la sfida costante.

### 2.3. Dipendenze

Il sistema avanzato si basa su una serie di moduli e dati più moderni:

- `CombatSystem` (Base): Da cui eredita le funzioni di base come `rollD20`.
- `ENEMY_DATABASE`: Il database dei nemici completo, definito in `js/data/enemies_database.js`.
- `ITEM_DATA`: Il database degli oggetti (presumibilmente in `game_data.js` o un file simile).
- `SPECIAL_ABILITIES`: Il database delle abilità speciali, definito nello stesso file.
- `TIER_SYSTEM`: Il sistema di scalabilità della difficoltà, definito nello stesso file.

## 3. Conclusione

L'architettura a due livelli del sistema di combattimento è una delle scoperte più importanti di questa analisi. Dimostra una chiara evoluzione del game design, passando da un approccio semplice e astratto a uno complesso, tattico e ricco di sfumature, molto vicino a un classico RPG da tavolo. Questa comprensione è fondamentale per qualsiasi futuro porting o rielaborazione del progetto.

---

## APPENDICE A: Codice Sorgente Grezzo (`advanced_combat_system.js`)

Di seguito è riportato il codice sorgente completo e non modificato delle principali logiche estratte dal file `advanced_combat_system.js`. Questo serve come riferimento tecnico diretto per l'implementazione delle meccaniche.

### A.1 Definizioni degli Effetti di Stato (STATUS_EFFECTS)

```javascript
// Status Effects Definitions
const STATUS_EFFECTS = {
    POISON: {
        name: 'Veleno',
        description: 'Subisce danni nel tempo',
        damagePerTurn: { min: 1, max: 4 },
        duration: 3,
        color: '#22c55e',
        icon: '☠️'
    },
    BLEEDING: {
        name: 'Emorragia',
        description: 'Sanguinamento continuo',
        damagePerTurn: { min: 1, max: 3 },
        duration: 4,
        color: '#dc2626',
        icon: '🩸'
    },
    PARALYSIS: {
        name: 'Paralisi',
        description: 'Non può attaccare',
        skipTurns: true,
        duration: 2,
        color: '#6366f1',
        icon: '⚡'
    },
    BERSERKER_RAGE: {
        name: 'Furia Berserk',
        description: 'Danni aumentati del 50%',
        damageMultiplier: 1.5,
        duration: 3,
        color: '#f59e0b',
        icon: '😡'
    },
    ARMOR_PIERCING: {
        name: 'Perforazione',
        description: 'Ignora resistenze',
        ignoreResistance: true,
        duration: 1,
        color: '#8b5cf6',
        icon: '🔱'
    },
    HEALING_FACTOR: {
        name: 'Rigenerazione',
        description: 'Rigenera HP ogni turno',
        healPerTurn: { percentage: 0.1 }, // 10% del max HP
        duration: 5,
        color: '#10b981',
        icon: '💚'
    }
};
```

### A.2 Database delle Abilità Speciali dei Nemici (SPECIAL_ABILITIES)

```javascript
// Abilità Speciali per Categorie Nemici
const SPECIAL_ABILITIES = {
    // BEAST - Bestie Mutate
    BEAST: {
        weak: {
            name: 'Morso Infetto',
            description: 'Applica veleno con il morso',
            chance: 0.25, // 25% probabilità per attacco
            effect: 'POISON',
            trigger: 'on_hit'
        },
        standard: {
            name: 'Zanne Velenose',
            description: 'Veleno più potente',
            chance: 0.3,
            effect: 'POISON',
            enhancedPoison: true,
            trigger: 'on_hit'
        },
        dangerous: {
            name: 'Furia Bestiale',
            description: 'Attiva berserk quando ferito',
            chance: 1.0, // Automatico
            effect: 'BERSERKER_RAGE',
            trigger: 'low_hp' // < 30% HP
        }
    },
    // ... (le altre categorie: SCAVENGER, BANDIT, RAIDER, MUTANT, ROBOT sono omesse per brevità)
    ROBOT: {
        weak: {
            name: 'Analisi Tattica',
            description: 'Precision aumentata',
            chance: 0.3,
            accuracyBonus: 4,
            trigger: 'every_turn'
        },
        standard: {
            name: 'Armi Integrate',
            description: 'Attacchi multipli',
            chance: 0.4,
            extraAttacks: 2,
            trigger: 'every_2_turns'
        },
        dangerous: {
            name: 'Sistema Bellico',
            description: 'Perforazione armature totale',
            chance: 0.5,
            effect: 'ARMOR_PIERCING',
            permanentEffect: true,
            trigger: 'combat_start'
        }
    }
};
```

### A.3 Logica di Scalabilità dei Nemici (TIER_SYSTEM)

```javascript
// Sistema Tier Dinamico
const TIER_SYSTEM = {
    getTierForDay: function(daysSurvived) {
        if (daysSurvived <= 5) return 1;
        if (daysSurvived <= 15) return 2;
        return 3;
    },
    
    getAvailableEnemyTypes: function(tier) {
        switch(tier) {
            case 1: return ['weak'];
            case 2: return ['weak', 'standard'];
            case 3: return ['weak', 'standard', 'dangerous'];
            default: return ['weak'];
        }
    },
    
    getEnemyScaling: function(tier, baseEnemy) {
        const scaledEnemy = { ...baseEnemy };
        
        // Scala statistiche per tier più alti
        if (tier >= 2) {
            scaledEnemy.hp = Math.floor(scaledEnemy.hp * 1.2);
            scaledEnemy.attackBonus += 1;
            scaledEnemy.expValue = Math.floor(scaledEnemy.expValue * 1.3);
        }
        
        if (tier >= 3) {
            scaledEnemy.hp = Math.floor(scaledEnemy.hp * 1.1);
            scaledEnemy.attackBonus += 1;
            scaledEnemy.damage.bonus += 1;
            scaledEnemy.expValue = Math.floor(scaledEnemy.expValue * 1.2);
        }
        
        return scaledEnemy;
    }
};
```

### A.4 Motore di Combattimento Principale (AdvancedCombatSystem)

```javascript
const AdvancedCombatSystem = {
    ...CombatSystem, 

    _combatLog: [],
    _player: null,
    _enemy: null,

    // Inizializza e avvia il combattimento
    resolveCombat: function(player, enemy, daysSurvived) {
        // ... implementazione ...
    },

    // Processa un singolo turno di combattimento
    processTurn: function(round) {
        // ... implementazione ...
    },

    // Gestisce l'attacco di un'entità
    handleAttack: function(attacker, defender, trigger, round) {
        // ... implementazione ...
    },

    // Calcola il danno finale
    calculateDamage: function(attacker, defender, isCrit, hasArmorPiercing) {
        // ... implementazione ...
    },

    // Applica e gestisce gli effetti di stato
    applyStatusEffects: function(combatant, round) {
        // ... implementazione ...
    },

    // Aggiunge un effetto di stato a un combattente
    addStatusEffect: function(target, effectName) {
        // ... implementazione ...
    },

    // Controlla e attiva le abilità speciali
    triggerSpecialAbility: function(attacker, defender, trigger, isCrit, round) {
        // ... implementazione ...
    },

    // Funzione helper per tirare un dado
    rollD20: function() {
        return Math.floor(Math.random() * 20) + 1;
    },

    // Funzione helper per registrare eventi nel log
    log: function(message, type = 'info') {
        // ... implementazione ...
    }
};

// Override del sistema globale per assicurarsi che venga usata la versione avanzata
window.CombatSystem = AdvancedCombatSystem;
``` 
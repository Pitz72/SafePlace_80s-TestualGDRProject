/**
 * THE SAFE PLACE - COMBAT ENGINE V2.0
 * Logica Core del Combattimento
 * 
 * Engine isolato senza dipendenze legacy
 * Data: 1 Giugno 2025
 */

const CombatV2Engine = {
    /**
     * Risolve combattimento completo
     * @param {Object} player - Dati player
     * @param {Object} enemy - Dati nemico  
     * @param {Object} options - Opzioni
     * @returns {Object} Risultato combattimento
     */
    resolveCombat(player, enemy, options = {}) {
        console.log('[COMBAT_V2_ENGINE] Risolvendo combattimento...');
        
        // Inizializza dati
        const combat = this.initializeCombat(player, enemy, options);
        
        // Esegui rounds di combattimento
        const rounds = this.executeRounds(combat);
        
        // Calcola risultato finale
        const result = this.calculateFinalResult(combat, rounds);
        
        console.log('[COMBAT_V2_ENGINE] Combattimento risolto:', result.victory ? 'VITTORIA' : 'SCONFITTA');
        return result;
    },
    
    /**
     * Inizializza dati combattimento
     */
    initializeCombat(player, enemy, options) {
        // Dati player corretti
        const playerData = {
            name: player.name || 'Ultimo',
            hp: player.hp || 100,
            maxHp: player.maxHp || 100,
            attack: this.calculatePlayerAttack(player),
            defense: this.calculatePlayerDefense(player),
            critChance: this.calculatePlayerCritChance(player),
            equipment: {
                weapon: player.equippedWeapon || null,
                armor: player.equippedArmor || null
            }
        };
        
        // Dati enemy validati
        const enemyData = {
            name: enemy.name || 'Nemico Sconosciuto',
            hp: enemy.hp || 20,
            maxHp: enemy.hp || 20,
            attack: enemy.attack || 5,
            defense: enemy.defense || 2,
            critChance: enemy.critChance || 0.1,
            tier: enemy.tier || 1,
            abilities: enemy.abilities || [],
            lootTable: enemy.lootTable || {}
        };
        
        return {
            player: playerData,
            enemy: enemyData,
            options: options,
            maxRounds: 15  // Limite round per evitare infiniti
        };
    },
    
    /**
     * Esegue i round di combattimento
     */
    executeRounds(combat) {
        const rounds = [];
        let playerHp = combat.player.hp;
        let enemyHp = combat.enemy.hp;
        
        for (let roundNum = 1; roundNum <= combat.maxRounds; roundNum++) {
            // Check fine combattimento
            if (playerHp <= 0 || enemyHp <= 0) {
                break;
            }
            
            // Round player
            const playerAction = this.executePlayerAction(combat, playerHp, enemyHp);
            rounds.push(playerAction);
            enemyHp -= playerAction.damage || 0;
            
            // Check vittoria player
            if (enemyHp <= 0) {
                break;
            }
            
            // Round enemy
            const enemyAction = this.executeEnemyAction(combat, playerHp, enemyHp);
            rounds.push(enemyAction);
            playerHp -= enemyAction.damage || 0;
            
            // Check sconfitta player
            if (playerHp <= 0) {
                break;
            }
        }
        
        // Aggiorna HP finali nel combat object
        combat.finalPlayerHP = Math.max(0, playerHp);
        combat.finalEnemyHP = Math.max(0, enemyHp);
        
        return rounds;
    },
    
    /**
     * Azione del player
     */
    executePlayerAction(combat, currentPlayerHp, currentEnemyHp) {
        const player = combat.player;
        const enemy = combat.enemy;
        
        // Calcola accuracy
        const accuracy = 0.75 + (Math.random() * 0.25); // 75-100% base accuracy
        const hit = Math.random() < accuracy;
        
        if (!hit) {
            return {
                attacker: 'player',
                hit: false,
                damage: 0,
                description: 'Attacco mancato!'
            };
        }
        
        // Calcola danno base
        let damage = Math.max(1, player.attack - enemy.defense);
        
        // Check critico
        const critical = Math.random() < player.critChance;
        if (critical) {
            damage = Math.floor(damage * 1.5);
        }
        
        // Variazione random ±20%
        const variation = 0.8 + (Math.random() * 0.4);
        damage = Math.floor(damage * variation);
        damage = Math.max(1, damage); // Almeno 1 danno
        
        return {
            attacker: 'player',
            hit: true,
            damage: damage,
            critical: critical,
            description: critical ? 'Colpo critico!' : 'Attacco riuscito'
        };
    },
    
    /**
     * Azione del nemico
     */
    executeEnemyAction(combat, currentPlayerHp, currentEnemyHp) {
        const player = combat.player;
        const enemy = combat.enemy;
        
        // Calcola accuracy
        const accuracy = 0.7 + (Math.random() * 0.3); // 70-100% accuracy
        const hit = Math.random() < accuracy;
        
        if (!hit) {
            return {
                attacker: 'enemy',
                hit: false,
                damage: 0,
                description: `${enemy.name} manca l'attacco!`
            };
        }
        
        // Calcola danno base
        let damage = Math.max(1, enemy.attack - player.defense);
        
        // Check critico  
        const critical = Math.random() < enemy.critChance;
        if (critical) {
            damage = Math.floor(damage * 1.5);
        }
        
        // Tier bonus damage
        if (enemy.tier > 1) {
            damage += enemy.tier - 1;
        }
        
        // Variazione random ±20%
        const variation = 0.8 + (Math.random() * 0.4);
        damage = Math.floor(damage * variation);
        damage = Math.max(1, damage);
        
        return {
            attacker: 'enemy',
            hit: true,
            damage: damage,
            critical: critical,
            description: critical ? `${enemy.name} colpo critico!` : `${enemy.name} attacca`
        };
    },
    
    /**
     * Calcola risultato finale
     */
    calculateFinalResult(combat, rounds) {
        const victory = combat.finalEnemyHP <= 0;
        const totalDamageTaken = Math.max(0, combat.player.hp - combat.finalPlayerHP);
        const totalDamageDealt = Math.max(0, combat.enemy.hp - combat.finalEnemyHP);
        
        // Calcola esperienza
        let expGained = 0;
        if (victory) {
            expGained = Math.floor(5 + (combat.enemy.tier * 3) + Math.random() * 5);
        }
        
        return {
            victory: victory,
            rounds: rounds,
            finalPlayerHP: combat.finalPlayerHP,
            finalEnemyHP: combat.finalEnemyHP,
            damageDealt: totalDamageDealt,
            damageTaken: totalDamageTaken,
            expGained: expGained,
            tier: combat.enemy.tier,
            roundsCount: rounds.length
        };
    },
    
    /**
     * Calcola attacco player considerando equipaggiamento
     */
    calculatePlayerAttack(player) {
        let attack = player.attack || 5; // Attacco base
        
        // Bonus arma
        if (player.equippedWeapon?.itemId) {
            const weaponId = player.equippedWeapon.itemId;
            
            // Database lookup semplificato
            const weaponBonuses = {
                'kitchen_knife': 3,
                'machete': 6,
                'assault_rifle': 10,
                'shotgun': 8,
                'sniper_rifle': 12,
                'baseball_bat': 4,
                'crowbar': 5
            };
            
            attack += weaponBonuses[weaponId] || 2;
        }
        
        return attack;
    },
    
    /**
     * Calcola difesa player considerando equipaggiamento
     */
    calculatePlayerDefense(player) {
        let defense = player.defense || 2; // Difesa base
        
        // Bonus armatura
        if (player.equippedArmor?.itemId) {
            const armorId = player.equippedArmor.itemId;
            
            // Database lookup semplificato
            const armorBonuses = {
                'armor_rags_simple': 2,
                'armor_leather_jacket': 4,
                'armor_tactical_vest': 6,
                'armor_military_gear': 8,
                'armor_riot_gear': 10
            };
            
            defense += armorBonuses[armorId] || 1;
        }
        
        return defense;
    },
    
    /**
     * Calcola chance critica player
     */
    calculatePlayerCritChance(player) {
        let critChance = 0.15; // 15% base
        
        // Bonus equipaggiamento o skill potrebbero modificare
        // Per ora manteniamo semplice
        
        return critChance;
    }
};

// Export globale
window.CombatV2Engine = CombatV2Engine;

console.log('[COMBAT_V2] ✅ Engine caricato - Logica combattimento isolata'); 
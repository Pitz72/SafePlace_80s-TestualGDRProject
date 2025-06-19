/**
 * THE SAFE PLACE - ADVANCED COMBAT SYSTEM v2.0
 * Sistema D&D Avanzato con Abilità Speciali e Status Effects
 * 
 * Recupero Architettura Avanzata - Fase 3.3
 * Data: 29 Dicembre 2024
 */

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
    
    // SCAVENGER - Saccheggiatori
    SCAVENGER: {
        weak: {
            name: 'Lama Sporca',
            description: 'Arma causainfection',
            chance: 0.2,
            effect: 'BLEEDING',
            trigger: 'on_crit'
        },
        standard: {
            name: 'Colpo Paralizzante',
            description: 'Stun con colpo alla nuca',
            chance: 0.15,
            effect: 'PARALYSIS',
            trigger: 'on_hit'
        },
        dangerous: {
            name: 'Sopravvivenza Estrema',
            description: 'Rigenerazione quando ferito',
            chance: 1.0,
            effect: 'HEALING_FACTOR',
            trigger: 'low_hp'
        }
    },
    
    // BANDIT - Banditi Organizzati
    BANDIT: {
        weak: {
            name: 'Attacco Furtivo',
            description: 'Bonus danni da sorpresa',
            chance: 0.2,
            damageBonus: 3,
            trigger: 'first_attack'
        },
        standard: {
            name: 'Combo Mortale',
            description: 'Attacco multiplo',
            chance: 0.25,
            extraAttacks: 1,
            trigger: 'on_hit'
        },
        dangerous: {
            name: 'Arma Perforante',
            description: 'Ignora armature',
            chance: 0.3,
            effect: 'ARMOR_PIERCING',
            trigger: 'on_attack'
        }
    },
    
    // RAIDER - Predoni Motorizzati  
    RAIDER: {
        weak: {
            name: 'Catena Sanguinante',
            description: 'Arma causa emorragia',
            chance: 0.3,
            effect: 'BLEEDING',
            trigger: 'on_hit'
        },
        standard: {
            name: 'Carica Devastante',
            description: 'Colpo potente iniziale',
            chance: 1.0,
            damageMultiplier: 1.5,
            trigger: 'first_attack'
        },
        dangerous: {
            name: 'Macchina da Guerra',
            description: 'Furia permanente',
            chance: 1.0,
            effect: 'BERSERKER_RAGE',
            permanentRage: true,
            trigger: 'combat_start'
        }
    },
    
    // MUTANT - Mutanti Radioattivi
    MUTANT: {
        weak: {
            name: 'Tossine Radioattive',
            description: 'Veleno da radiazioni',
            chance: 0.2,
            effect: 'POISON',
            trigger: 'on_hit'
        },
        standard: {
            name: 'Adattamento Mutante',
            description: 'Rigenerazione lenta',
            chance: 0.5,
            effect: 'HEALING_FACTOR',
            trigger: 'every_3_turns'
        },
        dangerous: {
            name: 'Istinto Primordiale',
            description: 'Berserk + rigenerazione',
            chance: 1.0,
            effects: ['BERSERKER_RAGE', 'HEALING_FACTOR'],
            trigger: 'low_hp'
        }
    },
    
    // ROBOT - Macchine da Guerra
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

// Advanced Combat System - Estensione del sistema esistente
const AdvancedCombatSystem = {
    // Eredita tutto dal sistema base
    ...CombatSystem,
    
    // Override del sistema di risoluzione combattimento
    resolveCombat: function(player, enemy) {
        // Determina tier corrente
        const currentTier = TIER_SYSTEM.getTierForDay(gameDay || 1);
        const scaledEnemy = TIER_SYSTEM.getEnemyScaling(currentTier, enemy);
        
        // Inizializza status effects
        const playerEffects = [];
        const enemyEffects = [];
        
        // Calcola stats giocatore (come sistema originale)
        const playerAttackBonus = Math.floor(player.potenza / 2);
        let armorBonus = 0;
        if (player.equippedArmor && player.equippedArmor.itemId && ITEM_DATA[player.equippedArmor.itemId]) {
            const armorData = ITEM_DATA[player.equippedArmor.itemId];
            armorBonus = armorData.armorValue || 0;
        }
        const playerDefenseClass = 10 + Math.floor(player.agilità / 2) + armorBonus;
        
        let playerDamage = { min: 1, max: 4, bonus: 0 };
        if (player.equippedWeapon && player.equippedWeapon.itemId && ITEM_DATA[player.equippedWeapon.itemId]) {
            const weaponData = ITEM_DATA[player.equippedWeapon.itemId];
            if (weaponData.damage && typeof weaponData.damage === 'object') {
                playerDamage = weaponData.damage;
            } else if (weaponData.damage && typeof weaponData.damage === 'number') {
                playerDamage = { min: 1, max: weaponData.damage, bonus: 0 };
            }
        }
        
        const playerCombatant = {
            name: "Tu",
            hp: player.hp,
            attackBonus: playerAttackBonus,
            defenseClass: playerDefenseClass,
            damage: playerDamage,
            resistance: Math.floor(player.vigore / 3)
        };
        
        // Identifica abilità speciali del nemico
        const enemyCategory = this.identifyEnemyCategory(scaledEnemy);
        const enemyTier = this.identifyEnemyTier(scaledEnemy);
        const specialAbility = SPECIAL_ABILITIES[enemyCategory]?.[enemyTier];
        
        let rounds = [];
        let playerWins = false;
        let enemyHP = scaledEnemy.hp;
        let playerHP = player.hp;
        let turnCount = 0;
        
        // Combattimento esteso - fino a 10 round invece di 5
        for (let i = 0; i < 10; i++) {
            turnCount++;
            
            // Applica status effects all'inizio del turno
            const playerStatusDamage = this.applyStatusEffects(playerEffects, playerHP, player.maxHp);
            const enemyStatusDamage = this.applyStatusEffects(enemyEffects, enemyHP, scaledEnemy.hp);
            
            playerHP -= playerStatusDamage;
            enemyHP -= enemyStatusDamage;
            
            if (playerStatusDamage > 0) {
                rounds.push({
                    type: 'status_effect',
                    target: 'player',
                    damage: playerStatusDamage,
                    effects: playerEffects.map(e => e.name),
                    targetHP: playerHP
                });
            }
            
            if (enemyStatusDamage > 0) {
                rounds.push({
                    type: 'status_effect',
                    target: 'enemy',
                    damage: enemyStatusDamage,
                    effects: enemyEffects.map(e => e.name),
                    targetHP: enemyHP
                });
            }
            
            // Check morte per status effects
            if (enemyHP <= 0) {
                playerWins = true;
                break;
            }
            if (playerHP <= 0) {
                break;
            }
            
            // Triggera abilità speciali (low_hp check)
            if (specialAbility && specialAbility.trigger === 'low_hp' && enemyHP < scaledEnemy.hp * 0.3) {
                this.triggerSpecialAbility(specialAbility, enemyEffects, rounds);
            }
            
            // Attacco del giocatore
            const playerAttack = this.resolveAdvancedAttack(playerCombatant, scaledEnemy, enemyEffects, turnCount);
            if (playerAttack.hit) {
                enemyHP -= playerAttack.damage;
            }
            
            rounds.push({
                attacker: "player",
                ...playerAttack,
                targetHP: enemyHP
            });
            
            if (enemyHP <= 0) {
                playerWins = true;
                break;
            }
            
            // Contrattacco del nemico (se non paralizzato)
            const canAttack = !enemyEffects.some(effect => effect.type === 'PARALYSIS');
            if (canAttack) {
                const enemyAttack = this.resolveAdvancedAttack(scaledEnemy, playerCombatant, playerEffects, turnCount, specialAbility);
                if (enemyAttack.hit) {
                    playerHP -= enemyAttack.damage;
                    
                    // Applica abilità speciali on_hit
                    if (specialAbility && specialAbility.trigger === 'on_hit') {
                        this.triggerSpecialAbility(specialAbility, playerEffects, rounds);
                    }
                }
                
                rounds.push({
                    attacker: "enemy",
                    ...enemyAttack,
                    targetHP: playerHP
                });
            } else {
                rounds.push({
                    attacker: "enemy",
                    hit: false,
                    damage: 0,
                    paralyzed: true,
                    targetHP: playerHP,
                    message: `${scaledEnemy.name} è paralizzato!`
                });
            }
            
            if (playerHP <= 0) {
                break;
            }
            
            // Riduci durata status effects
            this.updateStatusEffects(playerEffects);
            this.updateStatusEffects(enemyEffects);
        }
        
        return {
            victory: playerWins,
            rounds: rounds,
            finalPlayerHP: playerHP,
            finalEnemyHP: enemyHP,
            damageDealt: scaledEnemy.hp - enemyHP,
            damageTaken: player.hp - playerHP,
            expGained: playerWins ? scaledEnemy.expValue : 0,
            tier: currentTier,
            specialAbilityUsed: specialAbility?.name || null,
            statusEffectsApplied: [...playerEffects, ...enemyEffects].map(e => e.name)
        };
    },
    
    // Risoluzione attacco avanzata con status effects
    resolveAdvancedAttack: function(attacker, defender, defenderEffects, turnCount, specialAbility = null) {
        // Calcola modificatori da status effects
        let attackBonus = attacker.attackBonus;
        let damageMultiplier = 1.0;
        let ignoreResistance = false;
        
        // Applica effetti all'attaccante (se è il nemico)
        if (specialAbility && attacker.name !== "Tu") {
            // Berserker rage
            if (defenderEffects.some(e => e.type === 'BERSERKER_RAGE')) {
                damageMultiplier *= 1.5;
            }
            
            // Armor piercing
            if (defenderEffects.some(e => e.type === 'ARMOR_PIERCING')) {
                ignoreResistance = true;
            }
        }
        
        const attackRoll = this.rollD20() + attackBonus;
        const hit = attackRoll >= defender.defenseClass;
        
        let damage = 0;
        let critical = false;
        
        if (hit) {
            // Sistema critico avanzato
            const critRoll = this.rollD20();
            critical = (critRoll >= 19); // 19-20 sono critici
            
            damage = this.rollDice(attacker.damage.min, attacker.damage.max) + attacker.damage.bonus;
            
            if (critical) {
                damage *= 2; // Critico raddoppia il danno
            }
            
            // Applica moltiplicatori
            damage = Math.floor(damage * damageMultiplier);
            
            // Applica resistenza (se non ignorata)
            if (!ignoreResistance) {
                damage = Math.max(1, damage - defender.resistance);
            }
        }
        
        return {
            hit: hit,
            attackRoll: attackRoll,
            damage: damage,
            critical: critical,
            damageMultiplier: damageMultiplier !== 1.0 ? damageMultiplier : null,
            armorPiercing: ignoreResistance
        };
    },
    
    // Triggera abilità speciali
    triggerSpecialAbility: function(ability, targetEffects, rounds) {
        if (!ability) return;
        
        const random = Math.random();
        if (random > ability.chance) return; // Fallisce check probabilità
        
        if (ability.effect) {
            const statusEffect = {
                ...STATUS_EFFECTS[ability.effect],
                type: ability.effect,
                turnsRemaining: STATUS_EFFECTS[ability.effect].duration
            };
            
            // Evita duplicate dello stesso effetto
            if (!targetEffects.some(e => e.type === ability.effect)) {
                targetEffects.push(statusEffect);
                
                rounds.push({
                    type: 'special_ability',
                    abilityName: ability.name,
                    effect: ability.effect,
                    message: `${ability.description}!`
                });
            }
        }
    },
    
    // Applica danni da status effects
    applyStatusEffects: function(effects, currentHP, maxHP) {
        let totalDamage = 0;
        
        for (const effect of effects) {
            if (effect.damagePerTurn) {
                const damage = this.rollDice(effect.damagePerTurn.min, effect.damagePerTurn.max);
                totalDamage += damage;
            }
            
            if (effect.healPerTurn) {
                const heal = Math.floor(maxHP * effect.healPerTurn.percentage);
                totalDamage -= heal; // Heal è damage negativo
            }
        }
        
        return Math.max(0, totalDamage);
    },
    
    // Aggiorna durata status effects
    updateStatusEffects: function(effects) {
        for (let i = effects.length - 1; i >= 0; i--) {
            effects[i].turnsRemaining--;
            if (effects[i].turnsRemaining <= 0) {
                effects.splice(i, 1);
            }
        }
    },
    
    // Identifica categoria nemico dal nome/stats
    identifyEnemyCategory: function(enemy) {
        const name = enemy.name.toLowerCase();
        
        // Mapping basato sui nomi nel database
        if (name.includes('ratto') || name.includes('lupo') || name.includes('orso')) return 'BEAST';
        if (name.includes('cercatore') || name.includes('sciacallo')) return 'SCAVENGER';
        if (name.includes('bandito') || name.includes('teschi')) return 'BANDIT';
        if (name.includes('motociclista') || name.includes('guerriero')) return 'RAIDER';
        if (name.includes('mutante') || name.includes('aberrazione')) return 'MUTANT';
        if (name.includes('robot') || name.includes('drone')) return 'ROBOT';
        
        return 'BEAST'; // Default
    },
    
    // Identifica tier nemico da HP/stats
    identifyEnemyTier: function(enemy) {
        if (enemy.hp <= 20) return 'weak';
        if (enemy.hp <= 35) return 'standard'; 
        return 'dangerous';
    }
};

// Sostituisci il sistema originale
if (typeof window !== 'undefined') {
    window.CombatSystem = AdvancedCombatSystem;
    window.STATUS_EFFECTS = STATUS_EFFECTS;
    window.SPECIAL_ABILITIES = SPECIAL_ABILITIES;
    window.TIER_SYSTEM = TIER_SYSTEM;
}

console.log('[COMBAT] ✅ Advanced Combat System v2.0 caricato - Sistema D&D avanzato attivo!'); 
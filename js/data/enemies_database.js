/**
 * THE SAFE PLACE - DATABASE NEMICI
 * v1.0.0 "Ultimo's Journey"
 * 
 * Sistema completo di nemici con 6 categorie principali e 3 tier di difficoltà
 */

const ENEMY_DATABASE = {
    // BEAST - Bestie mutate (20% probabilità)
    BEAST: {
        weak: {
            name: "Ratto Gigante",
            description: "Un roditore delle dimensioni di un cane, con denti affilati come lame",
            hp: 12,
            attackBonus: 2,
            defenseClass: 13,
            damage: { min: 1, max: 4, bonus: 0 }, // 1d4
            resistance: 0,
            expValue: 15,
            encounterText: "Un fruscio tra le macerie rivela un ratto delle dimensioni innaturali, con occhi rossi che brillano di fame.",
            lootTable: {
                'meat_raw': 0.7,
                'diseased_meat': 0.2,
                'small_sharp_bones': 0.3
            }
        },
        standard: {
            name: "Lupo Radioattivo",
            description: "Un predatore mutato con pelliccia luminescente e zanne allungate",
            hp: 25,
            attackBonus: 5,
            defenseClass: 15,
            damage: { min: 1, max: 8, bonus: 2 }, // 1d8+2
            resistance: 2,
            expValue: 40,
            encounterText: "Un ululato distorto risuona nell'aria. Un lupo con pelliccia che brilla di una luce malsana emerge dall'ombra.",
            lootTable: {
                'meat_raw': 0.8,
                'animal_hide': 0.5,
                'wolf_fang': 0.4,
                'thick_fur': 0.5
            }
        },
        dangerous: {
            name: "Orso Mutante",
            description: "Una montagna di muscoli e furia, deformato dalle radiazioni",
            hp: 45,
            attackBonus: 7,
            defenseClass: 16,
            damage: { min: 2, max: 10, bonus: 3 }, // 2d5+3
            resistance: 4,
            expValue: 80,
            encounterText: "Il terreno trema sotto i passi di una creatura massiccia. Un orso deforme, con arti extra e occhi multipli, ti fissa.",
            lootTable: {
                'meat_raw': 0.9,
                'animal_hide': 0.7,
                'bear_claw': 0.5,
                'thick_fur': 0.8,
                'mutant_gland': 0.3
            }
        }
    },
    
    // SCAVENGER - Saccheggiatori solitari (15% probabilità)
    SCAVENGER: {
        weak: {
            name: "Cercatore Affamato",
            description: "Un sopravvissuto disperato che cerca cibo",
            hp: 15,
            attackBonus: 2,
            defenseClass: 12,
            damage: { min: 1, max: 6, bonus: 0 }, // 1d6
            resistance: 1,
            expValue: 20,
            encounterText: "Una figura emaciata emerge dalle rovine, stringendo un coltello arrugginito. 'Il tuo cibo... dammelo...'",
            lootTable: {
                'bandages_dirty': 0.4,
                'water_dirty': 0.3,
                'berries': 0.3,
                'scrap_metal': 0.2
            }
        },
        standard: {
            name: "Sciacallo delle Rovine",
            description: "Un saccheggiatore esperto che conosce ogni trucco",
            hp: 22,
            attackBonus: 4,
            defenseClass: 14,
            damage: { min: 1, max: 8, bonus: 1 }, // 1d8+1
            resistance: 2,
            expValue: 35,
            encounterText: "Un sopravvissuto in equipaggiamento improvvisato ti studia. 'Hai qualcosa di valore, vedo. Possiamo fare questo nel modo facile...'",
            lootTable: {
                'ration_pack': 0.5,
                'lockpick_set_crude': 0.2,
                'repair_kit': 0.1,
                'ammo_generic': 0.3
            }
        },
        dangerous: {
            name: "Veterano delle Terre Desolate",
            description: "Un sopravvissuto indurito da anni di saccheggi",
            hp: 30,
            attackBonus: 6,
            defenseClass: 16,
            damage: { min: 1, max: 10, bonus: 2 }, // 1d10+2
            resistance: 3,
            expValue: 60,
            encounterText: "Un uomo coperto di cicatrici e trofei di battaglia ti blocca la strada. 'Ho visto di tutto, ragazzo. Tu non mi fai paura.'",
            lootTable: {
                'weapon_pistol_old': 0.2,
                'armor_kevlar_damaged': 0.1,
                'medkit_field': 0.2,
                'map_fragment_local': 0.3
            }
        }
    },
    
    // BANDIT - Banditi organizzati (15% probabilità)
    BANDIT: {
        weak: {
            name: "Bandito Novizio",
            description: "Un membro giovane di una banda, ancora inesperto",
            hp: 18,
            attackBonus: 3,
            defenseClass: 13,
            damage: { min: 1, max: 6, bonus: 1 }, // 1d6+1
            resistance: 1,
            expValue: 25,
            encounterText: "Un giovane con una fascia rossa al braccio salta fuori. 'Alt! Questa è territorio dei Teschi Rossi!'",
            lootTable: {
                'bandages_clean': 0.4,
                'water_bottle': 0.3,
                'ammo_9mm': 0.3,
                'gang_insignia': 0.5
            }
        },
        standard: {
            name: "Razziatore dei Teschi",
            description: "Un bandito veterano con tatuaggi tribali",
            hp: 28,
            attackBonus: 5,
            defenseClass: 15,
            damage: { min: 1, max: 8, bonus: 2 }, // 1d8+2
            resistance: 2,
            expValue: 45,
            encounterText: "Un bandito coperto di tatuaggi di teschi ghigna. 'Un altro agnello per il macello. I Teschi Rossi ringraziano.'",
            lootTable: {
                'weapon_machete': 0.3,
                'leather_jacket_worn': 0.4,
                'stimpak_crude': 0.2,
                'trophy_ears': 0.2
            }
        },
        dangerous: {
            name: "Capitano dei Teschi Rossi",
            description: "Un leader spietato decorato con ossa umane",
            hp: 40,
            attackBonus: 7,
            defenseClass: 17,
            damage: { min: 2, max: 8, bonus: 3 }, // 2d4+3
            resistance: 3,
            expValue: 75,
            encounterText: "Un uomo massiccio decorato con ossa umane si alza dal suo trono improvvisato. 'Io sono la morte in queste terre.'",
            lootTable: {
                'weapon_rifle_broken': 0.4,
                'armor_bone': 0.3,
                'skull_trophy': 0.5,
                'gang_leader_journal': 0.2
            }
        }
    },
    
    // RAIDER - Predoni motorizzati (12% probabilità)
    RAIDER: {
        weak: {
            name: "Motociclista Rinnegato",
            description: "Un predone su una moto rugginosa",
            hp: 20,
            attackBonus: 4,
            defenseClass: 14,
            damage: { min: 1, max: 8, bonus: 1 }, // 1d8+1
            resistance: 2,
            expValue: 35,
            encounterText: "Il rombo di un motore rotto precede l'arrivo di un motociclista con elmetto chiodato.",
            lootTable: {
                'fuel_canister': 0.4,
                'chain_weapon': 0.2,
                'biker_goggles': 0.3,
                'motor_oil': 0.5
            }
        },
        standard: {
            name: "Guerriero della Strada",
            description: "Un predone veterano delle autostrade morte",
            hp: 32,
            attackBonus: 6,
            defenseClass: 16,
            damage: { min: 1, max: 10, bonus: 2 }, // 1d10+2
            resistance: 3,
            expValue: 55,
            encounterText: "Un guerriero in armatura di pneumatici e metallo scende dal suo veicolo blindato. 'La strada richiede un pedaggio di sangue.'",
            lootTable: {
                'weapon_shotgun_sawed': 0.3,
                'armor_tire': 0.4,
                'ammo_shell': 0.5,
                'road_warrior_mask': 0.3
            }
        },
        dangerous: {
            name: "Signore della Guerra Mobile",
            description: "Un comandante raider su un veicolo da guerra",
            hp: 50,
            attackBonus: 8,
            defenseClass: 18,
            damage: { min: 2, max: 10, bonus: 4 }, // 2d5+4
            resistance: 5,
            expValue: 100,
            encounterText: "Un veicolo corazzato coperto di teschi e spuntoni si ferma. Ne emerge un gigante in armatura completa.",
            lootTable: {
                'weapon_flamethrower': 0.2,
                'armor_raider_elite': 0.3,
                'war_rig_key': 0.1,
                'raider_warmap': 0.4
            }
        }
    },
    
    // MUTANT - Creature radioattive (10% probabilità)
    MUTANT: {
        weak: {
            name: "Ghoul Errante",
            description: "Un umano deformato dalle radiazioni, ancora parzialmente senziente",
            hp: 16,
            attackBonus: 3,
            defenseClass: 12,
            damage: { min: 1, max: 6, bonus: 1 }, // 1d6+1
            resistance: 2,
            expValue: 30,
            encounterText: "Una figura deformata barcolla verso di te, gemendo parole incomprensibili attraverso labbra fuse.",
            lootTable: {
                'rad_away_crude': 0.3,
                'contaminated_water': 0.4,
                'mutant_flesh': 0.5,
                'torn_id_card': 0.2
            }
        },
        standard: {
            name: "Aberrazione Tossica",
            description: "Una creatura pesantemente mutata che emana radiazioni",
            hp: 35,
            attackBonus: 5,
            defenseClass: 14,
            damage: { min: 1, max: 8, bonus: 3 }, // 1d8+3
            resistance: 4,
            expValue: 65,
            encounterText: "Una massa di carne mutata e tentacoli si muove verso di te, lasciando una scia di melma radioattiva.",
            lootTable: {
                'radioactive_sludge': 0.6,
                'mutant_organ': 0.4,
                'glowing_shard': 0.3,
                'toxic_gland': 0.5
            }
        },
        dangerous: {
            name: "Colosso Radioattivo",
            description: "Un gigante mutante che brilla di energia atomica",
            hp: 60,
            attackBonus: 9,
            defenseClass: 16,
            damage: { min: 3, max: 12, bonus: 5 }, // 3d4+5
            resistance: 6,
            expValue: 120,
            encounterText: "Il terreno si crepa sotto i passi di un gigante che brilla di luce verde malsana. L'aria stessa brucia attorno a lui.",
            lootTable: {
                'fusion_core': 0.2,
                'radiation_suit_piece': 0.3,
                'mutant_heart': 0.4,
                'atomic_crystal': 0.1
            }
        }
    },
    
    // DRONE - Tecnologia militare (8% probabilità)
    DRONE: {
        weak: {
            name: "Drone di Ricognizione",
            description: "Un piccolo drone militare ancora operativo",
            hp: 10,
            attackBonus: 4,
            defenseClass: 15,
            damage: { min: 1, max: 4, bonus: 1 }, // 1d4+1
            resistance: 0,
            expValue: 25,
            encounterText: "Un ronzio meccanico annuncia l'arrivo di un drone militare. La sua telecamera rotta ti fissa mentre arma le sue piccole mitragliatrici.",
            lootTable: {
                'electronic_parts': 0.7,
                'battery_cell': 0.5,
                'drone_camera': 0.3,
                'military_chip': 0.2
            }
        },
        standard: {
            name: "Sentinella Automatizzata",
            description: "Un robot da guerra di medie dimensioni",
            hp: 40,
            attackBonus: 6,
            defenseClass: 17,
            damage: { min: 2, max: 8, bonus: 2 }, // 2d4+2
            resistance: 5,
            expValue: 70,
            encounterText: "Una torretta automatica su gambe metalliche ti inquadra. 'INTRUSO IDENTIFICATO. INGAGGIO AUTORIZZATO.'",
            lootTable: {
                'servo_motor': 0.6,
                'armor_plating': 0.4,
                'targeting_module': 0.3,
                'energy_cell': 0.5
            }
        },
        dangerous: {
            name: "Mech da Guerra Autonomo",
            description: "Un'unità da combattimento pesante dell'esercito pre-guerra",
            hp: 80,
            attackBonus: 10,
            defenseClass: 20,
            damage: { min: 3, max: 10, bonus: 5 }, // 3d3+5
            resistance: 8,
            expValue: 150,
            encounterText: "Un mech bipede alto tre metri emerge dalle rovine. 'PROTOCOLLO DIFESA ATTIVO. ELIMINAZIONE TARGET IN CORSO.'",
            lootTable: {
                'fusion_battery': 0.3,
                'military_cpu': 0.2,
                'plasma_coil': 0.1,
                'mech_armor_piece': 0.4
            }
        }
    }
};

// Tabella pesi per selezione tipo nemico
const ENEMY_TYPE_WEIGHTS = {
    BEAST: 20,      // 20%
    SCAVENGER: 15,  // 15%
    BANDIT: 15,     // 15%
    RAIDER: 12,     // 12%
    MUTANT: 10,     // 10%
    DRONE: 8        // 8%
    // Il restante 20% sono eventi non di combattimento
};

// Funzione per selezionare un nemico appropriato
function selectEnemyForCombat(playerLevel, biomeType, daysSurvived) {
    // Determina il tipo di nemico basato sui pesi
    const enemyType = selectWeightedEnemyType();
    
    // Determina il tier basato su livello giocatore e giorni sopravvissuti
    let tier = 'weak';
    if (playerLevel >= 7 || daysSurvived >= 20) {
        tier = Math.random() < 0.7 ? 'standard' : 'dangerous';
    } else if (playerLevel >= 4 || daysSurvived >= 10) {
        tier = Math.random() < 0.8 ? 'standard' : 'weak';
    }
    
    // Aggiustamenti per bioma
    if (biomeType === 'CITY' && enemyType === 'BEAST') {
        // Più probabilità di trovare mutanti in città
        return ENEMY_DATABASE.MUTANT[tier];
    } else if (biomeType === 'FOREST' && enemyType === 'DRONE') {
        // Meno droni nelle foreste
        return ENEMY_DATABASE.BEAST[tier];
    }
    
    return ENEMY_DATABASE[enemyType][tier];
}

// Funzione helper per selezione pesata
function selectWeightedEnemyType() {
    const types = Object.keys(ENEMY_TYPE_WEIGHTS);
    const weights = types.map(type => ENEMY_TYPE_WEIGHTS[type]);
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    
    let random = Math.random() * totalWeight;
    for (let i = 0; i < types.length; i++) {
        random -= weights[i];
        if (random <= 0) {
            return types[i];
        }
    }
    
    return types[0]; // Fallback
}

// Sistema di combattimento evoluto integrato
const CombatSystemV2 = {
    // Eredita le funzioni base dal sistema esistente
    ...CombatSystem,
    
    // Nuove funzioni per gestire effetti speciali
    applySpecialEffects: function(enemy, player) {
        const effects = [];
        
        // Effetti speciali per tipo
        switch (enemy.type) {
            case 'MUTANT':
                if (Math.random() < 0.3) {
                    effects.push({
                        type: 'radiation',
                        message: 'Sei stato esposto alle radiazioni!',
                        effect: () => { player.isPoisoned = true; }
                    });
                }
                break;
                
            case 'DRONE':
                if (Math.random() < 0.2) {
                    effects.push({
                        type: 'emp',
                        message: 'I tuoi dispositivi elettronici sono temporaneamente inutilizzabili!',
                        effect: () => { /* Disabilita oggetti elettronici */ }
                    });
                }
                break;
        }
        
        return effects;
    }
};

// Esporta per uso in altri moduli
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        ENEMY_DATABASE,
        ENEMY_TYPE_WEIGHTS,
        selectEnemyForCombat,
        CombatSystemV2
    };
} 
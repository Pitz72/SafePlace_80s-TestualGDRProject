/**
 * THE SAFE PLACE - ADVANCED ITEMS INTEGRATION v2.0
 * Sistema di Integrazione Database Oggetti - Unisce database esistente con quello avanzato
 * 
 * Recupero Architettura Avanzata - Fase 4.4
 * Data: 29 Dicembre 2024
 */

// Funzione per integrare i database oggetti
function integrateAdvancedItems() {
    if (typeof ITEM_DATA === 'undefined') {
        console.error('[ITEMS INTEGRATION] ❌ ITEM_DATA non trovato!');
        return;
    }
    
    if (typeof ADVANCED_ITEMS === 'undefined') {
        console.error('[ITEMS INTEGRATION] ❌ ADVANCED_ITEMS non trovato!');
        return;
    }
    
    // Conta oggetti esistenti
    const existingCount = Object.keys(ITEM_DATA).length;
    console.log(`[ITEMS INTEGRATION] 📊 Oggetti esistenti: ${existingCount}`);
    
    // Aggiungi sistema rarità agli oggetti esistenti se non presente
    for (const itemId in ITEM_DATA) {
        const item = ITEM_DATA[itemId];
        if (!item.rarity) {
            // Assegna rarità basata su valore e tipo
            if (item.value <= 10) {
                item.rarity = 'COMMON';
            } else if (item.value <= 50) {
                item.rarity = 'UNCOMMON';
            } else if (item.value <= 150) {
                item.rarity = 'RARE';
            } else {
                item.rarity = 'EPIC';
            }
        }
    }
    
    // Integra gli oggetti avanzati
    let addedCount = 0;
    for (const itemId in ADVANCED_ITEMS) {
        if (!ITEM_DATA[itemId]) {
            ITEM_DATA[itemId] = ADVANCED_ITEMS[itemId];
            addedCount++;
        } else {
            console.warn(`[ITEMS INTEGRATION] ⚠️ Oggetto duplicato ignorato: ${itemId}`);
        }
    }
    
    // Conta totale finale
    const finalCount = Object.keys(ITEM_DATA).length;
    
    console.log(`[ITEMS INTEGRATION] ✅ Integrazione completata:`);
    console.log(`  - Oggetti esistenti: ${existingCount}`);
    console.log(`  - Nuovi oggetti aggiunti: ${addedCount}`);
    console.log(`  - Totale finale: ${finalCount}`);
    
    // Verifica obiettivo 119 oggetti
    if (finalCount >= 119) {
        console.log(`[ITEMS INTEGRATION] 🎉 OBIETTIVO RAGGIUNTO! Database con ${finalCount} oggetti (target: 119)`);
    } else {
        console.log(`[ITEMS INTEGRATION] 📈 Progresso: ${finalCount}/119 oggetti (mancano ${119 - finalCount})`);
    }
    
    return finalCount;
}

// Sistema di Gestione Rarità Avanzato
const RarityManager = {
    
    // Ottieni informazioni rarità per un oggetto
    getRarityInfo: function(item) {
        if (!item.rarity) return RARITY_SYSTEM.COMMON;
        return RARITY_SYSTEM[item.rarity] || RARITY_SYSTEM.COMMON;
    },
    
    // Applica colore rarità al nome oggetto
    getColoredName: function(item) {
        const rarityInfo = this.getRarityInfo(item);
        return `<span style="color: ${rarityInfo.color}">${item.name}</span>`;
    },
    
    // Calcola valore con moltiplicatore rarità
    getAdjustedValue: function(item) {
        const rarityInfo = this.getRarityInfo(item);
        return Math.floor(item.value * rarityInfo.valueMultiplier);
    },
    
    // Verifica se oggetto può droppare in base a rarità
    canDrop: function(item, luckModifier = 0) {
        const rarityInfo = this.getRarityInfo(item);
        const adjustedChance = rarityInfo.dropChance + luckModifier;
        return Math.random() <= adjustedChance;
    },
    
    // Genera loot con sistema rarità
    generateLoot: function(itemPool, luckModifier = 0, count = 1) {
        const loot = [];
        for (let i = 0; i < count; i++) {
            const availableItems = itemPool.filter(itemId => {
                const item = ITEM_DATA[itemId];
                return item && this.canDrop(item, luckModifier);
            });
            
            if (availableItems.length > 0) {
                const randomIndex = Math.floor(Math.random() * availableItems.length);
                loot.push(availableItems[randomIndex]);
            }
        }
        return loot;
    }
};

// Sistema Set Bonus
const SetManager = {
    
    // Verifica set equipaggiati dal giocatore
    checkPlayerSets: function() {
        if (!player || !player.inventory) return {};
        
        const equippedSets = {};
        
        // Controlla ogni set definito
        for (const setId in SET_BONUSES) {
            const setInfo = SET_BONUSES[setId];
            let equippedPieces = 0;
            
            // Conta pezzi equipaggiati
            for (const pieceId of setInfo.pieces) {
                if (this.isItemEquipped(pieceId)) {
                    equippedPieces++;
                }
            }
            
            if (equippedPieces > 0) {
                equippedSets[setId] = {
                    pieces: equippedPieces,
                    total: setInfo.pieces.length,
                    bonuses: this.getActiveBonuses(setId, equippedPieces)
                };
            }
        }
        
        return equippedSets;
    },
    
    // Verifica se un oggetto è equipaggiato
    isItemEquipped: function(itemId) {
        if (!player) return false;
        
        // Controlla slot equipaggiamento
        const equipped = [
            player.equippedWeapon?.itemId,
            player.equippedArmor?.itemId,
            player.equippedAccessory?.itemId,
            player.equippedHead?.itemId,
            player.equippedFeet?.itemId,
            player.equippedHands?.itemId,
            player.equippedBack?.itemId,
            player.equippedBelt?.itemId
        ];
        
        return equipped.includes(itemId);
    },
    
    // Ottieni bonus attivi per un set
    getActiveBonuses: function(setId, equippedPieces) {
        const setInfo = SET_BONUSES[setId];
        if (!setInfo) return [];
        
        const activeBonuses = [];
        
        for (const pieceCount in setInfo.bonuses) {
            if (equippedPieces >= parseInt(pieceCount)) {
                activeBonuses.push(setInfo.bonuses[pieceCount]);
            }
        }
        
        return activeBonuses;
    },
    
    // Applica bonus set alle statistiche del giocatore
    applySetBonuses: function() {
        const activeSets = this.checkPlayerSets();
        let totalBonuses = {
            damage: 0,
            defense: 0,
            resistance: 0,
            speed: 0,
            loot: 0,
            crafting: 0
        };
        
        for (const setId in activeSets) {
            const setData = activeSets[setId];
            for (const bonus of setData.bonuses) {
                for (const effect of bonus.effects) {
                    this.applySetEffect(effect, totalBonuses);
                }
            }
        }
        
        return totalBonuses;
    },
    
    // Applica un singolo effetto set
    applySetEffect: function(effect, bonusAccumulator) {
        switch (effect.type) {
            case 'elemental_resistance':
                bonusAccumulator.resistance += effect.bonus || effect.amount || 0;
                break;
            case 'movement_speed':
                bonusAccumulator.speed += effect.bonus || 0;
                break;
            case 'loot_bonus':
                bonusAccumulator.loot += effect.increase || 0;
                break;
            case 'crafting_success':
                bonusAccumulator.crafting += effect.bonus || 0;
                break;
            // Aggiungi altri effetti set se necessario
        }
    }
};

// Sistema di Conteggio Oggetti per Debug
const ItemCounter = {
    
    // Conta oggetti per tipo
    countByType: function() {
        const counts = {};
        for (const itemId in ITEM_DATA) {
            const item = ITEM_DATA[itemId];
            const type = item.type || 'unknown';
            counts[type] = (counts[type] || 0) + 1;
        }
        return counts;
    },
    
    // Conta oggetti per rarità
    countByRarity: function() {
        const counts = {};
        for (const itemId in ITEM_DATA) {
            const item = ITEM_DATA[itemId];
            const rarity = item.rarity || 'COMMON';
            counts[rarity] = (counts[rarity] || 0) + 1;
        }
        return counts;
    },
    
    // Report completo
    generateReport: function() {
        const total = Object.keys(ITEM_DATA).length;
        const byType = this.countByType();
        const byRarity = this.countByRarity();
        
        console.log(`\n📊 REPORT DATABASE OGGETTI`);
        console.log(`════════════════════════════`);
        console.log(`Totale oggetti: ${total}`);
        
        console.log(`\n📂 Per Tipo:`);
        for (const type in byType) {
            console.log(`  ${type}: ${byType[type]}`);
        }
        
        console.log(`\n✨ Per Rarità:`);
        for (const rarity in byRarity) {
            const rarityInfo = RARITY_SYSTEM[rarity];
            const color = rarityInfo ? rarityInfo.name : rarity;
            console.log(`  ${color}: ${byRarity[rarity]}`);
        }
        
        console.log(`════════════════════════════\n`);
        
        return { total, byType, byRarity };
    }
};

// Auto-integrazione all'avvio
document.addEventListener('DOMContentLoaded', function() {
    // Aspetta che tutti i script siano caricati
    setTimeout(() => {
        try {
            const finalCount = integrateAdvancedItems();
            
            // Genera report
            ItemCounter.generateReport();
            
            // Salva riferimenti globali
            window.RarityManager = RarityManager;
            window.SetManager = SetManager;
            window.ItemCounter = ItemCounter;
            
            console.log('[ITEMS INTEGRATION] 🚀 Sistema integrazione avanzata attivato!');
            
        } catch (error) {
            console.error('[ITEMS INTEGRATION] ❌ Errore durante integrazione:', error);
        }
    }, 100);
});

console.log('[ITEMS INTEGRATION] ✅ Advanced Items Integration v2.0 caricato!'); 
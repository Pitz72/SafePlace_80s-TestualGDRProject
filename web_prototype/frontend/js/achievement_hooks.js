/**
 * THE SAFE PLACE - ACHIEVEMENT HOOKS
 * v1.0.0 "Ultimo's Journey"
 * 
 * Hook per tracciare azioni specifiche per gli achievement
 */

// Inizializza i contatori necessari per gli achievement
function initAchievementTracking() {
    // Aggiungi proprietà necessarie al player se non esistono
    if (!player.enemiesDefeated) player.enemiesDefeated = 0;
    if (!player.peacefulResolutions) player.peacefulResolutions = 0;
    if (!player.moralDilemmasCompleted) player.moralDilemmasCompleted = 0;
    if (!player.visitedBiomes) player.visitedBiomes = [];
    if (!player.craftedItems) player.craftedItems = [];
}

// Hook per tracciare i nemici sconfitti
function trackEnemyDefeat() {
    player.enemiesDefeated = (player.enemiesDefeated || 0) + 1;
}

// Hook per tracciare le risoluzioni pacifiche
function trackPeacefulResolution(eventType) {
    if (eventType === 'PREDATOR') {
        player.peacefulResolutions = (player.peacefulResolutions || 0) + 1;
    }
}

// Hook per tracciare il viandante ferito aiutato completamente
function trackWandererHelp(helpType) {
    if (helpType === 'complete') {
        player.helpedWandererCompletely = true;
    }
}

// Hook per tracciare l'orrore affrontato e sopravvissuto
function trackHorrorSurvival() {
    player.facedHorrorAndSurvived = true;
}

// Hook per tracciare i dilemmi morali completati
function trackMoralDilemma() {
    player.moralDilemmasCompleted = (player.moralDilemmasCompleted || 0) + 1;
}

// Hook per tracciare i biomi visitati
function trackBiomeVisit(biomeType) {
    if (!player.visitedBiomes) {
        player.visitedBiomes = [];
    }
    if (!player.visitedBiomes.includes(biomeType)) {
        player.visitedBiomes.push(biomeType);
    }
}

// Hook per tracciare oggetti craftati
function trackCraftedItem(itemId) {
    if (!player.craftedItems.includes(itemId)) {
        player.craftedItems.push(itemId);
    }
}

// Hook per tracciare oggetti speciali trovati
function trackSpecialItemFound(itemId) {
    if (itemId === 'carillon_of_lena' || itemId === 'old_music_box') {
        player.foundCarillon = true;
    }
}

// Hook per tracciare incontri con fazioni
function trackFactionEncounter(faction) {
    if (faction === 'angels') {
        player.witnessedAngels = true;
    } else if (faction === 'ravens') {
        player.foundRavenOutpost = true;
    }
}

// Integra gli hook nel sistema esistente
if (typeof window !== 'undefined') {
    // Hook nel sistema di combattimento
    const originalResolveCombat = window.CombatSystem?.resolveCombat;
    if (originalResolveCombat) {
        window.CombatSystem.resolveCombat = function(player, enemy) {
            const result = originalResolveCombat.call(this, player, enemy);
            if (result.victory) {
                trackEnemyDefeat();
            }
            return result;
        };
    }
    
    // Hook nel sistema di crafting
    const originalCraftItem = window.craftItem;
    if (originalCraftItem) {
        window.craftItem = function(recipeId) {
            const result = originalCraftItem(recipeId);
            if (result) {
                trackCraftedItem(recipeId);
                
                // Controlla se è un'arma o armatura craftata
                const recipe = CRAFTING_RECIPES[recipeId];
                if (recipe && recipe.result) {
                    const item = ITEM_DATA[recipe.result.itemId];
                    if (item) {
                        if (item.type === 'weapon') {
                            const weapon = player.equippedWeapon;
                            if (weapon && weapon.itemId === recipe.result.itemId) {
                                weapon.isCrafted = true;
                            }
                        } else if (item.type === 'armor') {
                            const armor = player.equippedArmor;
                            if (armor && armor.itemId === recipe.result.itemId) {
                                armor.isCrafted = true;
                            }
                        }
                    }
                }
            }
            return result;
        };
    }
    
    // Hook nel sistema di movimento per tracciare biomi
    const originalRenderMap = window.renderMap;
    if (originalRenderMap) {
        window.renderMap = function() {
            originalRenderMap();
            
            // Traccia il bioma corrente
            const currentTile = map[player.y]?.[player.x];
            if (currentTile) {
                trackBiomeVisit(currentTile.type);
            }
        };
    }
    
    // Hook per gli oggetti raccolti
    const originalAddItemToInventory = window.addItemToInventory;
    if (originalAddItemToInventory) {
        window.addItemToInventory = function(itemId, quantity) {
            const result = originalAddItemToInventory(itemId, quantity);
            if (result) {
                trackSpecialItemFound(itemId);
            }
            return result;
        };
    }
    
    // Inizializza il tracking all'avvio
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            if (typeof player !== 'undefined') {
                initAchievementTracking();
            }
        }, 1000);
    });
}

// Esporta le funzioni per uso diretto negli eventi
window.achievementHooks = {
    trackEnemyDefeat,
    trackPeacefulResolution,
    trackWandererHelp,
    trackHorrorSurvival,
    trackMoralDilemma,
    trackBiomeVisit,
    trackCraftedItem,
    trackSpecialItemFound,
    trackFactionEncounter
};

// Oggetto AchievementHooks per compatibilità con v1_integration.js
window.AchievementHooks = {
    init: function() {
        initAchievementTracking();
        console.log("[AchievementHooks] Sistema hook achievement inizializzato");
    }
}; 
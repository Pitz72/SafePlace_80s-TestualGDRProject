/**
 * THE SAFE PLACE - SCRIPT DI INTEGRAZIONE v1.0.0
 * 
 * Questo file integra tutti i sistemi v1.0.0 nel gioco esistente
 */

// Funzione per integrare gli oggetti lore nel database esistente
function integrateLoreItems() {
    if (typeof LORE_ITEMS !== 'undefined' && typeof ITEM_DATA !== 'undefined') {
        // Aggiungi gli oggetti lore al database principale
        Object.keys(LORE_ITEMS).forEach(itemId => {
            ITEM_DATA[itemId] = LORE_ITEMS[itemId];
        });
        console.log("[V1.0.0] Oggetti lore integrati:", Object.keys(LORE_ITEMS).length);
        return true;
    }
    console.error("[V1.0.0] Impossibile integrare oggetti lore");
    return false;
}

// Sostituisci il sistema di selezione nemici
function integrateEnemySystem() {
    if (typeof ENEMY_DATABASE !== 'undefined' && typeof window.selectEnemyForCombat !== 'undefined') {
        // Salva la funzione originale
        const originalSelectEnemy = window.selectEnemyForCombat;
        
        // Sovrascrivi la funzione di selezione nemici
        window.selectEnemyForCombat = function(eventType, context) {
            // Usa il nuovo sistema v1.0.0
            const playerLevel = Math.floor((player.experience || 0) / 100) + 1;
            const biomeType = map[player.y][player.x].type;
            
            // Usa la funzione dal database nemici v1.0.0
            const enemyData = ENEMY_DATABASE;
            const enemies = [];
            
            // Raccogli nemici appropriati per bioma e livello
            Object.keys(enemyData).forEach(type => {
                Object.keys(enemyData[type]).forEach(tier => {
                    const enemy = enemyData[type][tier];
                    if (enemy.level <= playerLevel + 1) {
                        enemies.push({...enemy, type: type, tier: tier});
                    }
                });
            });
            
            // Seleziona un nemico casuale dalla lista
            if (enemies.length > 0) {
                const selectedEnemy = enemies[Math.floor(Math.random() * enemies.length)];
                return selectedEnemy;
            }
            
            // Fallback al sistema originale
            return originalSelectEnemy(eventType, context);
        };
        
        console.log("[V1.0.0] Sistema nemici v2 integrato");
        return true;
    }
    return false;
}

// Aggiungi il sistema di eventi lore al loop principale
function integrateLoreEvents() {
    if (typeof LoreEventManager !== 'undefined' && typeof LORE_EVENTS_LINEAR !== 'undefined') {
        // LoreEventManager è già un oggetto, non serve istanziarlo
        window.loreEventManager = LoreEventManager;
        
        // Aggiungi campi necessari al player
        if (!player.loreFlags) player.loreFlags = [];
        if (!player.seenLoreEvents) player.seenLoreEvents = [];
        
        // Hook nel sistema di movimento per controllare eventi lore
        const originalMove = window.movePlayer;
        if (originalMove) {
            window.movePlayer = function(dx, dy) {
                // Chiama la funzione originale
                const result = originalMove.call(this, dx, dy);
                
                // Controlla eventi lore dopo il movimento
                if (result && window.loreEventManager && typeof getNextLoreEvent === 'function') {
                    const playerState = {
                        ...player,
                        daysSurvived: daysSurvived || 0,
                        x: player.x,
                        y: player.y
                    };
                    
                    if (loreEventManager.shouldTriggerLoreEvent(playerState)) {
                        const event = loreEventManager.getContextualLoreEvent(playerState);
                        if (event) {
                            triggerLoreEvent(event);
                        }
                    }
                }
                
                return result;
            };
        }
        
        // Mostra evento iniziale
        setTimeout(() => {
            // Solo se il gioco è attivo e non siamo nel menu
            if (typeof gameActive !== 'undefined' && gameActive && typeof player !== 'undefined') {
                // Assicurati che player.seenLoreEvents esista
                if (!player.seenLoreEvents) {
                    player.seenLoreEvents = [];
                }
                
                const initialEvent = LORE_EVENTS_LINEAR.find(e => e.id === 'lore_echo_of_departure');
                if (initialEvent && !player.seenLoreEvents.includes('lore_echo_of_departure')) {
                    console.log("[V1.0.0] Triggering evento iniziale...");
                    triggerLoreEvent(initialEvent);
                } else {
                    console.log("[V1.0.0] Evento iniziale già visto o non trovato");
                }
            } else {
                console.log("[V1.0.0] Gioco non attivo, evento iniziale rimandato");
            }
        }, 3000); // Aumentato a 3 secondi per dare più tempo
        
        console.log("[V1.0.0] Sistema eventi lore integrato");
        return true;
    }
    return false;
}

// Funzione per triggerare un evento lore
function triggerLoreEvent(loreEvent) {
    // Assicurati che player esista e abbia seenLoreEvents
    if (!player) {
        console.error("[V1.0.0] Player non definito, impossibile triggerare evento");
        return;
    }
    
    if (!player.seenLoreEvents) {
        player.seenLoreEvents = [];
    }
    
    // Segna come visto
    if (!player.seenLoreEvents.includes(loreEvent.id)) {
        player.seenLoreEvents.push(loreEvent.id);
    }
    
    // Applica effetti trigger immediati
    if (loreEvent.triggerEffects) {
        applyLoreEventEffects(loreEvent.triggerEffects);
    }
    
    // Converti in formato compatibile con il sistema eventi esistente
    const eventData = {
        title: loreEvent.title,
        description: loreEvent.description,
        choices: loreEvent.choices.map(choice => ({
            text: choice.text,
            outcome: choice.outcome,
            effect: {
                message: choice.outcome,
                messageType: 'lore'
            },
            // Applica effetti
            successReward: choice.effects ? {
                customEffects: choice.effects
            } : null
        }))
    };
    
    // Mostra usando il sistema esistente
    if (typeof showComplexEventPopup === 'function') {
        showComplexEventPopup(eventData);
    } else if (typeof showEventPopup === 'function') {
        showEventPopup(eventData);
    }
    
    addMessage(`[EVENTO STORIA] ${loreEvent.title}`, 'lore');
}

// Applica effetti custom degli eventi lore
function applyLoreEventEffects(effects) {
    if (!effects || !Array.isArray(effects)) return;
    
    // Assicurati che player esista
    if (!player) {
        console.error("[V1.0.0] Player non definito in applyLoreEventEffects");
        return;
    }
    
    effects.forEach(effect => {
        switch (effect.type) {
            case 'add_stat':
                if (player.stats && player.stats[effect.stat]) {
                    player.stats[effect.stat] += effect.value;
                    updateStatAliases();
                }
                break;
                
            case 'add_lore_flag':
                // Assicurati che loreFlags esista
                if (!player.loreFlags) {
                    player.loreFlags = [];
                }
                if (!player.loreFlags.includes(effect.flag)) {
                    player.loreFlags.push(effect.flag);
                }
                break;
                
            case 'add_item':
                if (typeof addItemToInventory === 'function') {
                    addItemToInventory(effect.item, effect.quantity || 1);
                }
                break;
                
            case 'add_resource':
                if (player[effect.resource] !== undefined) {
                    player[effect.resource] += effect.value;
                }
                break;
                
            case 'cure_status':
                if (player[effect.status] !== undefined) {
                    player[effect.status] = false;
                }
                break;
                
            case 'reveal_map_area':
                // Implementa rivelazione mappa se necessario
                if (typeof revealMapArea === 'function') {
                    revealMapArea(effect.x, effect.y, effect.radius);
                }
                break;
                
            case 'end_game':
                if (typeof endGame === 'function') {
                    endGame(`Finale: ${effect.ending}`, true); // true = vittoria
                }
                break;
                
            case 'add_achievement':
                if (window.achievementSystem) {
                    window.achievementSystem.unlock(effect.achievement);
                }
                break;
        }
    });
}

// Integra il sistema di combattimento visuale
function integrateCombatVisuals() {
    if (typeof CombatVisuals !== 'undefined') {
        // CombatVisuals è già un oggetto, non serve istanziarlo
        window.combatVisuals = CombatVisuals;
        console.log("[V1.0.0] Sistema combattimento visuale integrato");
        return true;
    }
    return false;
}

// Integra il sistema achievement
function integrateAchievements() {
    if (typeof AchievementSystem !== 'undefined' && typeof AchievementHooks !== 'undefined') {
        // Entrambi sono già oggetti, non servono istanziazioni
        window.achievementSystem = AchievementSystem;
        window.achievementHooks = AchievementHooks;
        
        // Inizializza i sistemi
        AchievementSystem.init();
        AchievementHooks.init();
        
        console.log("[V1.0.0] Sistema achievement integrato");
        return true;
    }
    return false;
}

// Hook per applicare effetti custom nelle ricompense
function hookRewardSystem() {
    if (typeof window.applyChoiceReward === 'function') {
        const originalApplyChoiceReward = window.applyChoiceReward;
        window.applyChoiceReward = function(rewardData) {
            // Se ci sono effetti custom (da eventi lore)
            if (rewardData && rewardData.customEffects) {
                applyLoreEventEffects(rewardData.customEffects);
                return "Effetti applicati";
            }
            
            // Altrimenti usa il sistema normale
            return originalApplyChoiceReward.call(this, rewardData);
        };
    }
}

// Inizializzazione di tutti i sistemi v1.0.0
function initializeV1Systems() {
    console.log("[V1.0.0] Inizializzazione sistemi v1.0.0...");
    
    let systemsLoaded = 0;
    const totalSystems = 5;
    
    // Integra tutti i sistemi
    if (integrateLoreItems()) systemsLoaded++;
    if (integrateEnemySystem()) systemsLoaded++;
    if (integrateLoreEvents()) systemsLoaded++;
    if (integrateCombatVisuals()) systemsLoaded++;
    if (integrateAchievements()) systemsLoaded++;
    
    // Hook sistema ricompense
    hookRewardSystem();
    
    // Aggiorna versione UI
    const versionElements = document.querySelectorAll('.game-version-text, #game-version-display');
    versionElements.forEach(el => {
        el.textContent = 'v1.0.0 "Ultimo\'s Journey"';
    });
    
    console.log(`[V1.0.0] Sistemi attivati: ${systemsLoaded}/${totalSystems}`);
    
    if (systemsLoaded === totalSystems) {
        console.log("[V1.0.0] The Safe Place v1.0.0 'Ultimo's Journey' completamente attivato!");
        if (typeof addMessage === 'function') {
            addMessage("=== THE SAFE PLACE v1.0.0 'ULTIMO'S JOURNEY' ===", "system");
            addMessage("La storia di Ultimo inizia ora...", "lore");
        }
    } else {
        console.warn("[V1.0.0] Alcuni sistemi non sono stati caricati correttamente");
    }
}

// Inizializzazione quando il DOM è pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        console.log("[V1.0.0] DOM caricato, attendo caricamento script...");
        // Aumenta il timeout per dare tempo a tutti gli script di caricarsi
        setTimeout(initializeV1Systems, 1500);
    });
} else {
    // DOM già caricato
    console.log("[V1.0.0] DOM già pronto, attendo caricamento script...");
    setTimeout(initializeV1Systems, 1500);
}

// Esporta funzioni per debug
window.V1_DEBUG = {
    testLoreEvent: function(eventId) {
        if (typeof LORE_EVENTS_LINEAR !== 'undefined') {
            const event = LORE_EVENTS_LINEAR.find(e => e.id === eventId);
            if (event) {
                triggerLoreEvent(event);
            } else {
                console.log("Evento non trovato:", eventId);
            }
        } else {
            console.log("Eventi lore non caricati");
        }
    },
    listLoreEvents: function() {
        if (typeof LORE_EVENTS_LINEAR !== 'undefined') {
            return LORE_EVENTS_LINEAR.map(e => `${e.id}: ${e.title}`);
        }
        return "Eventi lore non caricati";
    },
    showEnemyDatabase: function() {
        if (typeof ENEMY_DATABASE !== 'undefined') {
            console.table(ENEMY_DATABASE);
        } else {
            console.log("Database nemici non caricato");
        }
    },
    showLoreItems: function() {
        if (typeof LORE_ITEMS !== 'undefined') {
            console.table(LORE_ITEMS);
        } else {
            console.log("Oggetti lore non caricati");
        }
    },
    forceInitV1: function() {
        initializeV1Systems();
    }
}; 
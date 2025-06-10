/**
 * THE SAFE PLACE - FIX EMERGENZA v1.0.0b
 * Risolve problemi critici: eventi lore rari e combattimento avanzato non attivo
 */

console.log('[V1_EMERGENCY] Caricando fix eventi lore e combattimento...');

// 1. FIX PROBABILITÀ EVENTI LORE - MOLTO PIÙ AGGRESSIVE
if (typeof LoreEventManager !== 'undefined') {
    // Aumenta drasticamente le probabilità base
    LoreEventManager.baseEventChance = 0.25; // Da 5% a 25%
    
    // Override calcolo probabilità per essere più generoso
    const originalCalculateEventProbability = LoreEventManager.calculateEventProbability;
    LoreEventManager.calculateEventProbability = function(playerState) {
        const daysSurvived = playerState.daysSurvived || 0;
        
        // Progressione più aggressiva
        let probability = this.baseEventChance;
        
        // Aumenta molto con i giorni
        probability += (daysSurvived * 0.1); // +10% per giorno
        
        // Aumenta con i movimenti totali
        const totalMoves = playerState.moveHistory?.length || 0;
        probability += (totalMoves * 0.005); // +0.5% per movimento
        
        // Se non hai visto eventi da tanto, forza
        const lastEventTime = playerState.lastLoreEventTime || 0;
        const timeSinceLastEvent = daysSurvived - lastEventTime;
        if (timeSinceLastEvent >= 1) {
            probability += 0.5; // +50% se più di 1 giorno senza eventi
        }
        
        // Max 80% per movimento
        return Math.min(0.8, Math.max(0, probability));
    };
    
    console.log('[V1_EMERGENCY] Probabilità eventi lore aumentate');
}

// 2. FIX TRIGGER EVENTI LORE PIÙ SEMPLICE
if (typeof window !== 'undefined' && window.movePlayer) {
    const originalMovePlayer = window.movePlayer;
    window.movePlayer = function(dx, dy) {
        const result = originalMovePlayer(dx, dy);
        
        if (result && gameActive && typeof LoreEventManager !== 'undefined') {
            const playerState = {
                ...player,
                daysSurvived: daysSurvived,
                moveHistory: player.moveHistory || [],
                seenLoreEvents: player.seenLoreEvents || [],
                lastLoreEventTime: player.lastLoreEventTime || 0
            };
            
            // Sistema semplificato di trigger
            const probability = LoreEventManager.calculateEventProbability(playerState);
            const roll = Math.random();
            
            console.log(`[LORE] Prob: ${(probability*100).toFixed(1)}%, Roll: ${(roll*100).toFixed(1)}%`);
            
            if (roll < probability) {
                if (typeof getNextLoreEvent === 'function') {
                    const nextEvent = getNextLoreEvent(playerState);
                    if (nextEvent) {
                        console.log(`[LORE] Triggering: ${nextEvent.title}`);
                        player.lastLoreEventTime = daysSurvived;
                        
                        // Trigger immediato
                        if (typeof showEventPopup === 'function') {
                            showEventPopup(nextEvent);
                        }
                    }
                }
            }
        }
        
        return result;
    };
}

// 3. FIX COMBATTIMENTO AVANZATO - HOOK IN TUTTI I COMBATTIMENTI
if (typeof window !== 'undefined') {
    // Override del sistema di risoluzione combattimento standard
    const originalResolveCombat = window.resolveCombat;
    if (originalResolveCombat) {
        window.resolveCombat = function(playerAttack, enemyAttack, enemyData) {
            // Se abbiamo il nuovo sistema, usalo
            if (typeof CombatSystem !== 'undefined' && enemyData) {
                console.log('[COMBAT] Usando sistema avanzato per:', enemyData.name || 'Nemico');
                
                const combatResult = CombatSystem.resolveCombat(player, enemyData);
                
                // Applica risultati
                player.hp = combatResult.finalPlayerHP;
                
                // Mostra con suspense
                if (typeof showCombatResultWithSuspense === 'function') {
                    const description = showCombatResultWithSuspense(combatResult, enemyData.name || 'Nemico');
                    
                    // Mostra in popup
                    if (typeof showEventPopup === 'function') {
                        showEventPopup({
                            title: `⚔️ Combattimento vs ${enemyData.name || 'Nemico'}`,
                            description: description,
                            isOutcome: true
                        });
                    }
                    
                    return combatResult.victory;
                }
            }
            
            // Fallback al sistema originale
            return originalResolveCombat(playerAttack, enemyAttack, enemyData);
        };
        
        console.log('[V1_EMERGENCY] Sistema combattimento avanzato attivato');
    }
}

// 4. HELPER DI DEBUG MIGLIORATI
window.V1_EMERGENCY = {
    // Forza evento lore immediato
    forceLoreEvent: function() {
        if (typeof getNextLoreEvent === 'function') {
            const nextEvent = getNextLoreEvent(player);
            if (nextEvent) {
                console.log('[EMERGENCY] Forzando evento:', nextEvent.title);
                player.lastLoreEventTime = daysSurvived;
                showEventPopup(nextEvent);
            } else {
                console.log('[EMERGENCY] Nessun evento lore disponibile');
                // Lista eventi visti
                console.log('Eventi già visti:', player.seenLoreEvents || []);
            }
        }
    },
    
    // Forza combattimento avanzato di test
    forceAdvancedCombat: function() {
        if (typeof ENEMY_DATA !== 'undefined' && typeof CombatSystem !== 'undefined') {
            const enemy = ENEMY_DATA.predators.standard;
            const combatResult = CombatSystem.resolveCombat(player, enemy);
            
            const description = showCombatResultWithSuspense(combatResult, enemy.name);
            showEventPopup({
                title: `⚔️ TEST Combattimento vs ${enemy.name}`,
                description: description,
                isOutcome: true
            });
        }
    },
    
    // Reset flag eventi per test
    resetLoreEvents: function() {
        player.seenLoreEvents = [];
        player.lastLoreEventTime = 0;
        console.log('[EMERGENCY] Flag eventi lore resettati');
    },
    
    // Mostra stats probabilità attuali
    showLoreStats: function() {
        const playerState = {
            ...player,
            daysSurvived: daysSurvived,
            moveHistory: player.moveHistory || [],
            seenLoreEvents: player.seenLoreEvents || [],
            lastLoreEventTime: player.lastLoreEventTime || 0
        };
        
        const prob = LoreEventManager.calculateEventProbability(playerState);
        console.log('=== LORE STATS ===');
        console.log('Giorni sopravvissuti:', daysSurvived);
        console.log('Movimenti totali:', playerState.moveHistory.length);
        console.log('Eventi visti:', playerState.seenLoreEvents.length);
        console.log('Ultimo evento:', playerState.lastLoreEventTime);
        console.log('Probabilità attuale:', `${(prob*100).toFixed(1)}%`);
    }
};

console.log('[V1_EMERGENCY] Fix di emergenza caricati! Usa V1_EMERGENCY.* per test rapidi'); 
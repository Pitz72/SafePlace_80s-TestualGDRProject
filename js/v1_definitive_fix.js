/**
 * THE SAFE PLACE - FIX DEFINITIVO v1.0.0c
 * Sistema deterministico per eventi lore + combattimento avanzato garantito
 */

console.log('[V1_DEFINITIVE] Caricando fix definitivo...');

// 1. SISTEMA EVENTI LORE DETERMINISTICO BASATO SU DISTANZA
window.LoreEventTrigger = {
    // Mappa eventi basata sulla distanza dal Safe Place (190,190)
    eventDistances: [
        { id: 'lore_echo_of_departure', maxDistance: 999, minDistance: 0, triggered: false },
        { id: 'lore_first_trial_alone', maxDistance: 180, minDistance: 0, triggered: false },
        { id: 'lore_whispers_from_past', maxDistance: 150, minDistance: 0, triggered: false },
        { id: 'lore_shadow_of_others', maxDistance: 130, minDistance: 0, triggered: false },
        { id: 'lore_wanderer_dilemma', maxDistance: 120, minDistance: 0, triggered: false },
        { id: 'lore_echoes_of_inexpressed_war', maxDistance: 100, minDistance: 0, triggered: false },
        { id: 'lore_dream_of_green_valley', maxDistance: 80, minDistance: 0, triggered: false },
        { id: 'lore_radio_interception', maxDistance: 50, minDistance: 0, triggered: false },
        { id: 'lore_guardian_of_threshold', maxDistance: 30, minDistance: 0, triggered: false },
        { id: 'lore_hidden_valley', maxDistance: 10, minDistance: 0, triggered: false }
    ],
    
    // Calcola distanza dal Safe Place
    calculateDistanceFromSafePlace: function(x, y) {
        const safeX = 190;
        const safeY = 190;
        return Math.sqrt(Math.pow(x - safeX, 2) + Math.pow(y - safeY, 2));
    },
    
    // Controlla se triggerare un evento basato sulla posizione
    checkEventTriggers: function(playerX, playerY, playerState) {
        const distance = this.calculateDistanceFromSafePlace(playerX, playerY);
        const seenEvents = playerState.seenLoreEvents || [];
        
        // Trova il primo evento non visto che può essere triggerato
        for (const eventData of this.eventDistances) {
            // Se già visto, salta
            if (seenEvents.includes(eventData.id)) continue;
            
            // Se la distanza è giusta per questo evento
            if (distance <= eventData.maxDistance && distance >= eventData.minDistance) {
                console.log(`[LORE_TRIGGER] Distanza ${distance.toFixed(1)} - Triggering: ${eventData.id}`);
                return eventData.id;
            }
        }
        
        return null;
    },
    
    // Triggera un evento specifico
    triggerEvent: function(eventId) {
        if (typeof LORE_EVENTS_LINEAR !== 'undefined') {
            const event = LORE_EVENTS_LINEAR.find(e => e.id === eventId);
            if (event) {
                console.log(`[LORE_TRIGGER] Mostrando evento: ${event.title}`);
                
                // Marca come visto
                if (!player.seenLoreEvents) player.seenLoreEvents = [];
                if (!player.seenLoreEvents.includes(eventId)) {
                    player.seenLoreEvents.push(eventId);
                }
                
                // Mostra evento
                if (typeof showEventPopup === 'function') {
                    showEventPopup(event);
                    return true;
                }
            }
        }
        return false;
    }
};

// 2. HOOK MOVIMENTO PER SISTEMA DETERMINISTICO
if (typeof window !== 'undefined' && window.movePlayer) {
    const originalMovePlayer = window.movePlayer;
    window.movePlayer = function(dx, dy) {
        const result = originalMovePlayer(dx, dy);
        
        if (result && gameActive) {
            // Controlla eventi lore deterministici
            const playerState = {
                ...player,
                seenLoreEvents: player.seenLoreEvents || []
            };
            
            const eventToTrigger = window.LoreEventTrigger.checkEventTriggers(player.x, player.y, playerState);
            if (eventToTrigger) {
                // Ritarda leggermente per permettere al movimento di completarsi
                setTimeout(() => {
                    window.LoreEventTrigger.triggerEvent(eventToTrigger);
                }, 500);
            }
        }
        
        return result;
    };
}

// 3. FIX COMBATTIMENTO AVANZATO - HOOK SU EVENTI ESISTENTI
if (typeof window !== 'undefined') {
    // Override di handleEventChoice per intercettare combattimenti
    const originalHandleEventChoice = window.handleEventChoice;
    if (originalHandleEventChoice) {
        window.handleEventChoice = function(choiceIndex) {
            // Ottieni il contesto dell'evento corrente
            const choice = currentEventChoices?.[choiceIndex];
            const eventType = currentEventContext?.type;
            
            // Se è un combattimento (scelta con usesWeapon o actionKey lotta/attacca)
            if (choice && (choice.usesWeapon || choice.actionKey === 'lotta' || choice.actionKey === 'attacca')) {
                console.log('[COMBAT_OVERRIDE] Intercettato combattimento');
                
                // Seleziona nemico appropriato
                let enemy = null;
                if (typeof ENEMY_DATA !== 'undefined') {
                    if (eventType === 'PREDATOR') {
                        enemy = ENEMY_DATA.predators.standard;
                    } else if (eventType === 'ANIMAL') {
                        enemy = ENEMY_DATA.animals.standard;
                    } else if (eventType === 'HORROR') {
                        enemy = ENEMY_DATA.special.zone_horror;
                    }
                }
                
                // Se abbiamo nemico e sistema avanzato, usalo
                if (enemy && typeof CombatSystem !== 'undefined') {
                    const combatResult = CombatSystem.resolveCombat(player, enemy);
                    
                    // Applica risultati
                    player.hp = combatResult.finalPlayerHP;
                    
                    // Mostra risultato avanzato
                    if (typeof showCombatResultWithSuspense === 'function') {
                        const description = showCombatResultWithSuspense(combatResult, enemy.name);
                        
                        // Determina titolo e tipo messaggio
                        const title = combatResult.victory ? "⚔️ VITTORIA!" : "💀 SCONFITTA";
                        const messageType = combatResult.victory ? 'success' : 'danger';
                        
                        // Mostra popup risultato
                        if (typeof buildAndShowComplexEventOutcome === 'function') {
                            buildAndShowComplexEventOutcome(title, description, null, "", messageType);
                        } else if (typeof showEventPopup === 'function') {
                            showEventPopup({
                                title: title,
                                description: description,
                                isOutcome: true
                            });
                        }
                        
                        // Non chiamare la funzione originale
                        return;
                    }
                }
            }
            
            // Fallback alla funzione originale
            return originalHandleEventChoice(choiceIndex);
        };
        
        console.log('[V1_DEFINITIVE] Hook combattimento su handleEventChoice attivato');
    }
}

// 4. TRIGGER EVENTO INIZIALE AUTOMATICO
setTimeout(() => {
    if (gameActive && player && typeof player.x !== 'undefined') {
        // Se non hai ancora visto l'evento iniziale, triggera
        const seenEvents = player.seenLoreEvents || [];
        if (!seenEvents.includes('lore_echo_of_departure')) {
            console.log('[V1_DEFINITIVE] Triggering evento iniziale automatico');
            window.LoreEventTrigger.triggerEvent('lore_echo_of_departure');
        }
    }
}, 3000);

// 5. HELPER DEBUG MIGLIORATI
window.V1_DEFINITIVE = {
    // Mostra mappa eventi e distanze
    showEventMap: function() {
        if (!player) {
            console.log('Player non definito');
            return;
        }
        
        const distance = window.LoreEventTrigger.calculateDistanceFromSafePlace(player.x, player.y);
        const seenEvents = player.seenLoreEvents || [];
        
        console.log('=== MAPPA EVENTI LORE ===');
        console.log(`Posizione attuale: (${player.x}, ${player.y})`);
        console.log(`Distanza dal Safe Place: ${distance.toFixed(1)}`);
        console.log(`Eventi visti: ${seenEvents.length}/10`);
        console.log('');
        
        window.LoreEventTrigger.eventDistances.forEach(event => {
            const seen = seenEvents.includes(event.id) ? '✅' : '❌';
            const canTrigger = distance <= event.maxDistance && !seenEvents.includes(event.id) ? '🔄' : '⏸️';
            console.log(`${seen} ${canTrigger} ${event.id} (≤${event.maxDistance})`);
        });
    },
    
    // Forza evento lore per distanza
    forceEventByDistance: function() {
        const eventId = window.LoreEventTrigger.checkEventTriggers(player.x, player.y, player);
        if (eventId) {
            window.LoreEventTrigger.triggerEvent(eventId);
        } else {
            console.log('Nessun evento disponibile per questa distanza');
            this.showEventMap();
        }
    },
    
    // Testa combattimento avanzato
    testAdvancedCombat: function() {
        if (typeof ENEMY_DATA !== 'undefined' && typeof CombatSystem !== 'undefined') {
            const enemy = ENEMY_DATA.predators.standard;
            const combatResult = CombatSystem.resolveCombat(player, enemy);
            
            player.hp = combatResult.finalPlayerHP;
            
            const description = showCombatResultWithSuspense(combatResult, enemy.name);
            showEventPopup({
                title: `⚔️ TEST: ${combatResult.victory ? 'VITTORIA' : 'SCONFITTA'}`,
                description: description,
                isOutcome: true
            });
        }
    },
    
    // Reset completo per test
    resetForTesting: function() {
        player.seenLoreEvents = [];
        player.lastLoreEventTime = 0;
        console.log('[V1_DEFINITIVE] Reset completo per testing');
        this.showEventMap();
    }
};

console.log('[V1_DEFINITIVE] Fix definitivo caricato! Usa V1_DEFINITIVE.* per controllo'); 
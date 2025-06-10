/**
 * THE SAFE PLACE - QUICK FIXES FASE 4
 * Fix rapidi per problemi post-integrazione FASE 4
 * 
 * Data: 29 Dicembre 2024
 */

// Fix 1: Sistema Eventi Lore - Forza trigger iniziale
function forceInitialLoreEvent() {
    console.log('[QUICK_FIX] Forzando evento lore iniziale...');
    
    // Aspetta che tutto sia caricato
    setTimeout(() => {
        if (typeof LORE_EVENTS_LINEAR !== 'undefined' && typeof player !== 'undefined' && typeof triggerLoreEvent === 'function') {
            const initialEvent = LORE_EVENTS_LINEAR.find(e => e.id === 'lore_echo_of_departure');
            if (initialEvent && player.seenLoreEvents && !player.seenLoreEvents.includes('lore_echo_of_departure')) {
                console.log('[QUICK_FIX] Triggering evento lore iniziale forzato...');
                triggerLoreEvent(initialEvent);
            } else {
                console.log('[QUICK_FIX] Evento lore già visto o non trovato');
            }
        } else {
            console.log('[QUICK_FIX] Sistemi lore non ancora pronti, riprovo...');
            // Riprova dopo 2 secondi
            setTimeout(forceInitialLoreEvent, 2000);
        }
    }, 5000); // 5 secondi per essere sicuri che tutto sia caricato
}

// Fix 2: Combattimento - Migliora gestione popup
function fixCombatPopupHandling() {
    console.log('[QUICK_FIX] Applicando fix gestione popup combattimento...');
    
    // Override della funzione closeEventPopup per debug
    if (typeof closeEventPopup === 'function') {
        const originalCloseEventPopup = closeEventPopup;
        window.closeEventPopup = function() {
            console.log('[QUICK_FIX] closeEventPopup chiamata');
            return originalCloseEventPopup.apply(this, arguments);
        };
    }
    
    // Override del sistema visual per debug e validazione dati
    if (typeof CombatVisuals !== 'undefined' && CombatVisuals.showCombatWithNarrativeEffects) {
        console.log('[QUICK_FIX] Sistema visual override DISABILITATO - problema risolto in v1_ultimate_fix.js');
        
        // OVERRIDE DISABILITATO - il vero problema era l'async management
        /*
        const originalShowCombat = CombatVisuals.showCombatWithNarrativeEffects;
        CombatVisuals.showCombatWithNarrativeEffects = function(combatResult, enemy) {
            console.log('[QUICK_FIX] showCombatWithNarrativeEffects chiamata', combatResult);
            
            // ... rest of override code
        };
        */
    }
}

// Nuovo: Fallback semplice per combattimenti problematici
function showSimpleCombatFallback(combatResult, enemy) {
    console.log('[QUICK_FIX] Usando fallback semplice per combattimento');
    
    // Forza chiusura di qualsiasi popup esistente
    const eventOverlay = document.getElementById('event-overlay');
    if (eventOverlay) {
        eventOverlay.style.display = 'none';
    }
    
    // Aspetta un momento e mostra risultato semplice
    setTimeout(() => {
        const title = combatResult.victory ? "⚔️ VITTORIA!" : "💀 SCONFITTA";
        const enemyName = enemy?.name || "nemico sconosciuto";
        
        let description = `<div class="combat-result">`;
        description += `<strong>Combattimento contro ${enemyName}!</strong><br><br>`;
        
        if (combatResult.victory) {
            description += `<span style="color: #22c55e;">Hai sconfitto ${enemyName}!</span><br>`;
            description += `L'avversario cade a terra, sconfitto.`;
        } else {
            description += `<span style="color: #dc2626;">${enemyName} ti ha sopraffatto!</span><br>`;
            description += `Subisci danni durante il combattimento.`;
        }
        
        description += `</div>`;
        
        if (typeof showEventPopup === 'function') {
            showEventPopup({
                title: title,
                description: description,
                isOutcome: true
            });
        }
        
        // Aggiorna UI
        if (typeof updateUI === 'function') {
            updateUI();
        }
        
    }, 500);
    
    return "Combattimento completato";
}

// Fix 3: Debug Commands per testing
function setupDebugCommands() {
    window.QUICK_FIX = {
        forceLoreEvent: function() {
            forceInitialLoreEvent();
        },
        
        triggerCombat: function() {
            if (typeof CombatSystem !== 'undefined' && typeof ENEMY_DATABASE !== 'undefined') {
                console.log('[QUICK_FIX] Test combattimento avviato...');
                
                // Chiudi qualsiasi popup esistente prima
                if (typeof closeEventPopup === 'function') {
                    closeEventPopup();
                }
                
                const enemy = ENEMY_DATABASE.BANDIT?.easy || { 
                    name: "Bandito Test", 
                    hp: 20, 
                    attack: 5,
                    defense: 2 
                };
                
                console.log('[QUICK_FIX] Nemico selezionato:', enemy);
                
                const combatResult = CombatSystem.resolveCombat(player, enemy);
                console.log('[QUICK_FIX] Risultato combattimento:', combatResult);
                
                if (typeof CombatVisuals !== 'undefined') {
                    CombatVisuals.showCombatWithNarrativeEffects(combatResult, enemy);
                }
            } else {
                console.error('[QUICK_FIX] Sistemi combattimento non disponibili');
            }
        },
        
        checkSystems: function() {
            console.log('=== SYSTEM STATUS ===');
            console.log('gameActive:', typeof gameActive !== 'undefined' ? gameActive : 'undefined');
            console.log('player:', typeof player !== 'undefined' ? 'defined' : 'undefined');
            console.log('LORE_EVENTS_LINEAR:', typeof LORE_EVENTS_LINEAR !== 'undefined' ? 'defined' : 'undefined');
            console.log('CombatSystem:', typeof CombatSystem !== 'undefined' ? 'defined' : 'undefined');
            console.log('CombatVisuals:', typeof CombatVisuals !== 'undefined' ? 'defined' : 'undefined');
            console.log('ENEMY_DATABASE:', typeof ENEMY_DATABASE !== 'undefined' ? 'defined' : 'undefined');
            console.log('==================');
        },
        
        status: function() {
            if (typeof player !== 'undefined') {
                console.log('Player HP:', player.hp);
                console.log('Player Pos:', player.x, player.y);
                console.log('Seen Lore Events:', player.seenLoreEvents);
                console.log('Game Active:', typeof gameActive !== 'undefined' ? gameActive : 'unknown');
            }
        },
        
        forceClosePopups: function() {
            console.log('[QUICK_FIX] Forzando chiusura di tutti i popup...');
            
            // Chiudi overlay eventi
            const eventOverlay = document.getElementById('event-overlay');
            if (eventOverlay) {
                eventOverlay.style.display = 'none';
                console.log('[QUICK_FIX] Event overlay chiuso');
            }
            
            // Chiudi altri overlay
            const itemOverlay = document.getElementById('item-action-overlay');
            if (itemOverlay) {
                itemOverlay.style.display = 'none';
                console.log('[QUICK_FIX] Item overlay chiuso');
            }
            
            const craftingOverlay = document.getElementById('crafting-overlay');
            if (craftingOverlay) {
                craftingOverlay.style.display = 'none';
                console.log('[QUICK_FIX] Crafting overlay chiuso');
            }
            
            // Reset flag evento se necessario
            if (typeof eventScreenActive !== 'undefined') {
                window.eventScreenActive = false;
                console.log('[QUICK_FIX] eventScreenActive resettato');
            }
        },
        
        testCombatData: function() {
            console.log('[QUICK_FIX] Test validazione dati combattimento...');
            
            // Test con dati corrotti
            const corruptedResult = {
                victory: true,
                finalPlayerHP: NaN,
                finalEnemyHP: NaN,
                damageDealt: NaN,
                rounds: null
            };
            
            const enemy = { name: "Test Enemy", hp: 20 };
            const fixed = validateAndFixCombatResult(corruptedResult, player, enemy);
            
            console.log('Dati originali corrotti:', corruptedResult);
            console.log('Dati corretti:', fixed);
        },
        
        checkPopupStatus: function() {
            console.log('[QUICK_FIX] Controllo stato popup...');
            
            const eventOverlay = document.getElementById('event-overlay');
            const eventPopup = document.getElementById('event-popup');
            
            if (eventOverlay) {
                console.log('Event Overlay display:', eventOverlay.style.display);
                console.log('Event Overlay visible:', eventOverlay.style.display === 'flex');
                
                if (eventPopup) {
                    console.log('Event Popup innerHTML preview:', eventPopup.innerHTML.substring(0, 100) + '...');
                    console.log('Contiene "Preparazione":', eventPopup.innerHTML.includes('Preparazione'));
                    console.log('Contiene "Attendere":', eventPopup.innerHTML.includes('Attendere'));
                } else {
                    console.log('Event Popup: non trovato');
                }
            } else {
                console.log('Event Overlay: non trovato');
            }
            
            console.log('eventScreenActive:', typeof eventScreenActive !== 'undefined' ? eventScreenActive : 'undefined');
        },
        
        smartClosePopups: function() {
            console.log('[QUICK_FIX] Chiusura intelligente popup...');
            
            const eventOverlay = document.getElementById('event-overlay');
            const eventPopup = document.getElementById('event-popup');
            
            if (eventOverlay && eventOverlay.style.display === 'flex') {
                if (eventPopup && (eventPopup.innerHTML.includes('Preparazione') || eventPopup.innerHTML.includes('Attendere'))) {
                    console.log('[QUICK_FIX] Rilevato popup bloccato, forzo chiusura...');
                    eventOverlay.style.display = 'none';
                    
                    if (typeof eventScreenActive !== 'undefined') {
                        window.eventScreenActive = false;
                    }
                    
                    console.log('[QUICK_FIX] Popup bloccato chiuso');
                } else {
                    console.log('[QUICK_FIX] Popup presente ma non bloccato');
                }
            } else {
                console.log('[QUICK_FIX] Nessun popup da chiudere');
            }
        }
    };
    
    console.log('[QUICK_FIX] Debug commands disponibili: QUICK_FIX.forceLoreEvent(), QUICK_FIX.triggerCombat(), QUICK_FIX.checkSystems(), QUICK_FIX.status(), QUICK_FIX.forceClosePopups(), QUICK_FIX.testCombatData(), QUICK_FIX.checkPopupStatus(), QUICK_FIX.smartClosePopups()');
}

// Fix 4: Monitor Game State
function monitorGameState() {
    let lastGameActive = null;
    
    setInterval(() => {
        if (typeof gameActive !== 'undefined' && gameActive !== lastGameActive) {
            console.log(`[QUICK_FIX] Game State Changed: ${lastGameActive} → ${gameActive}`);
            lastGameActive = gameActive;
            
            // Se il gioco diventa attivo, prova a triggerare eventi lore
            if (gameActive && typeof forceInitialLoreEvent === 'function') {
                setTimeout(forceInitialLoreEvent, 1000);
            }
        }
    }, 1000);
}

// Fix 5: Sistema Combattimento - Intercetta e correggi valori NaN
function fixCombatSystemNaN() {
    console.log('[QUICK_FIX] Applicando fix sistema combattimento NaN...');
    
    // Override del sistema CombatSystem.resolveCombat se disponibile
    if (typeof CombatSystem !== 'undefined' && CombatSystem.resolveCombat) {
        const originalResolveCombat = CombatSystem.resolveCombat;
        CombatSystem.resolveCombat = function(player, enemy) {
            console.log('[QUICK_FIX] CombatSystem.resolveCombat intercettato');
            
            try {
                // Chiama il sistema originale
                const result = originalResolveCombat.call(this, player, enemy);
                
                // Valida e correggi i risultati
                const correctedResult = validateAndFixCombatResult(result, player, enemy);
                
                console.log('[QUICK_FIX] Risultato combattimento corretto:', correctedResult);
                return correctedResult;
                
            } catch (error) {
                console.error('[QUICK_FIX] Errore in CombatSystem.resolveCombat:', error);
                
                // Genera risultato fallback
                return generateFallbackCombatResult(player, enemy);
            }
        };
    }
}

// Valida e corregge i risultati del combattimento
function validateAndFixCombatResult(result, player, enemy) {
    if (!result || typeof result !== 'object') {
        return generateFallbackCombatResult(player, enemy);
    }
    
    // Correggi valori NaN o undefined
    const fixed = {
        victory: typeof result.victory === 'boolean' ? result.victory : false,
        rounds: Array.isArray(result.rounds) ? result.rounds : [],
        finalPlayerHP: isNaN(result.finalPlayerHP) ? (player?.hp || 85) : result.finalPlayerHP,
        finalEnemyHP: isNaN(result.finalEnemyHP) ? (result.victory ? 0 : (enemy?.hp || 20)) : result.finalEnemyHP,
        damageDealt: isNaN(result.damageDealt) ? 0 : result.damageDealt,
        damageTaken: isNaN(result.damageTaken) ? 0 : result.damageTaken,
        expGained: isNaN(result.expGained) ? (result.victory ? 10 : 0) : result.expGained
    };
    
    // Verifica che HP finali siano sensati
    if (fixed.finalPlayerHP < 0) fixed.finalPlayerHP = 1;
    if (fixed.victory && fixed.finalEnemyHP > 0) fixed.finalEnemyHP = 0;
    if (!fixed.victory && fixed.finalEnemyHP <= 0) fixed.finalEnemyHP = 1;
    
    console.log('[QUICK_FIX] Dati combattimento validati e corretti');
    return fixed;
}

// Genera risultato fallback per combattimenti problematici
function generateFallbackCombatResult(player, enemy) {
    console.log('[QUICK_FIX] Generando risultato combattimento fallback');
    
    const playerHP = player?.hp || 85;
    const enemyHP = enemy?.hp || 20;
    const playerAttack = player?.attack || 5;
    const enemyAttack = enemy?.attack || 4;
    
    // Simulazione semplice
    const playerWins = (playerHP + playerAttack) > (enemyHP + enemyAttack) || Math.random() > 0.3;
    const damageTaken = playerWins ? Math.floor(Math.random() * 5) : Math.floor(Math.random() * 10 + 5);
    
    return {
        victory: playerWins,
        rounds: [{
            attacker: 'player',
            hit: true,
            damage: playerAttack,
            description: 'Attacco del giocatore'
        }],
        finalPlayerHP: Math.max(1, playerHP - damageTaken),
        finalEnemyHP: playerWins ? 0 : Math.max(1, enemyHP - playerAttack),
        damageDealt: playerWins ? enemyHP : playerAttack,
        damageTaken: damageTaken,
        expGained: playerWins ? 10 : 0
    };
}

// Auto-inizializzazione
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        console.log('[QUICK_FIX] Inizializzando fix FASE 4...');
        
        forceInitialLoreEvent();
        fixCombatPopupHandling();
        setupDebugCommands();
        monitorGameState();
        fixCombatSystemNaN();
        
        console.log('[QUICK_FIX] ✅ Fix FASE 4 attivati!');
    }, 500);
});

console.log('[QUICK_FIX] ✅ Quick Fixes FASE 4 caricati!'); 
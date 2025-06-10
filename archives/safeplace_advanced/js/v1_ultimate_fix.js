/**
 * THE SAFE PLACE - FIX FINALE v1.0.0d
 * Risolve definitivamente eventi lore e combattimenti
 */

console.log('[V1_ULTIMATE] Caricando fix finale definitivo...');

// 1. SISTEMA EVENTI LORE DETERMINISTICO CORRETTO
window.LoreEventTrigger = {
    // Mappa eventi con trigger multipli (distanza O tempo O movimenti)
    eventMilestones: [
        { id: 'lore_echo_of_departure', triggered: false, 
          triggers: { always: true } }, // Sempre disponibile
        { id: 'lore_first_trial_alone', triggered: false, 
          triggers: { distance: 180, moves: 50, days: 2 } },
        { id: 'lore_whispers_from_past', triggered: false, 
          triggers: { distance: 150, moves: 100, days: 3 } },
        { id: 'lore_shadow_of_others', triggered: false, 
          triggers: { distance: 130, moves: 150, days: 4 } },
        { id: 'lore_wanderer_dilemma', triggered: false, 
          triggers: { distance: 120, moves: 200, days: 5 } },
        { id: 'lore_echoes_of_inexpressed_war', triggered: false, 
          triggers: { distance: 100, moves: 250, days: 6 } },
        { id: 'lore_dream_of_green_valley', triggered: false, 
          triggers: { distance: 80, moves: 300, days: 7 } },
        { id: 'lore_radio_interception', triggered: false, 
          triggers: { distance: 50, moves: 350, days: 8 } },
        { id: 'lore_guardian_of_threshold', triggered: false, 
          triggers: { distance: 30, moves: 400, days: 9 } },
        { id: 'lore_hidden_valley', triggered: false, 
          triggers: { distance: 10, moves: 450, days: 10 } }
    ],
    
    // Calcola distanza dal Safe Place
    getDistanceFromSafePlace: function(x, y) {
        return Math.sqrt(Math.pow(x - 190, 2) + Math.pow(y - 190, 2));
    },
    
    // Conta movimenti totali del player
    getTotalMoves: function() {
        return (player.moveHistory && player.moveHistory.length) || 0;
    },
    
    // Controlla trigger multipli
    checkAllTriggers: function() {
        if (!player || !gameActive) return null;
        
        const distance = this.getDistanceFromSafePlace(player.x || 0, player.y || 0);
        const totalMoves = this.getTotalMoves();
        const currentDay = daysSurvived || 1;
        const seenEvents = player.seenLoreEvents || [];
        
        // Trova primo evento non visto che può essere triggerato
        for (const milestone of this.eventMilestones) {
            if (seenEvents.includes(milestone.id)) continue;
            
            const triggers = milestone.triggers;
            let shouldTrigger = false;
            
            // Check trigger sempre disponibile
            if (triggers.always) {
                shouldTrigger = true;
            } else {
                // Check almeno uno dei trigger è soddisfatto
                if (triggers.distance && distance <= triggers.distance) shouldTrigger = true;
                if (triggers.moves && totalMoves >= triggers.moves) shouldTrigger = true; 
                if (triggers.days && currentDay >= triggers.days) shouldTrigger = true;
            }
            
            if (shouldTrigger) {
                console.log(`[LORE_ULTIMATE] Trigger: ${milestone.id}`);
                console.log(`  Distanza: ${distance.toFixed(1)} (req: ${triggers.distance || 'N/A'})`);
                console.log(`  Movimenti: ${totalMoves} (req: ${triggers.moves || 'N/A'})`);
                console.log(`  Giorni: ${currentDay} (req: ${triggers.days || 'N/A'})`);
                return milestone.id;
            }
        }
        
        return null;
    },
    
    // Triggera evento specifico
    showEvent: function(eventId) {
        if (typeof LORE_EVENTS_LINEAR !== 'undefined') {
            const event = LORE_EVENTS_LINEAR.find(e => e.id === eventId);
            if (event) {
                // Marca come visto
                if (!player.seenLoreEvents) player.seenLoreEvents = [];
                if (!player.seenLoreEvents.includes(eventId)) {
                    player.seenLoreEvents.push(eventId);
                }
                
                console.log(`[LORE_ULTIMATE] Mostrando: ${event.title}`);
                if (typeof showEventPopup === 'function') {
                    showEventPopup(event);
                    return true;
                }
            }
        }
        return false;
    }
};

// 2. HOOK MOVIMENTO MIGLIORATO
if (typeof window !== 'undefined' && window.movePlayer) {
    const originalMovePlayer = window.movePlayer;
    window.movePlayer = function(dx, dy) {
        const result = originalMovePlayer(dx, dy);
        
        if (result && gameActive) {
            // Registra il movimento
            if (!player.moveHistory) player.moveHistory = [];
            player.moveHistory.push({ x: player.x, y: player.y, day: daysSurvived });
            
            // Check eventi lore
            const eventToTrigger = window.LoreEventTrigger.checkAllTriggers();
            if (eventToTrigger) {
                setTimeout(() => {
                    window.LoreEventTrigger.showEvent(eventToTrigger);
                }, 800);
            }
        }
        
        return result;
    };
}

// 3. FIX COMBATTIMENTO UNIVERSALE - Hook su TUTTE le scelte di combattimento
if (typeof window !== 'undefined') {
    const originalHandleEventChoice = window.handleEventChoice;
    if (originalHandleEventChoice) {
        window.handleEventChoice = function(choiceIndex) {
            const choice = currentEventChoices?.[choiceIndex];
            const eventType = currentEventContext?.type;
            
            console.log(`[COMBAT_UNIVERSAL] Scelta: "${choice?.text}" Type: ${eventType} ActionKey: ${choice?.actionKey}`);
            
            // Intercetta QUALSIASI combattimento
            const isCombat = choice && (
                choice.usesWeapon || 
                choice.actionKey === 'lotta' || 
                choice.actionKey === 'attacca' || 
                choice.text.toLowerCase().includes('combatt') ||
                choice.text.toLowerCase().includes('attacc') ||
                choice.text.toLowerCase().includes('lotta')
            );
            
            if (isCombat && typeof CombatSystem !== 'undefined' && typeof ENEMY_DATA !== 'undefined') {
                console.log('[COMBAT_UNIVERSAL] Intercettato combattimento universale!');
                
                // PAUSA SUSPENSE PRIMA DEL COMBATTIMENTO
                if (typeof closeEventPopup === 'function') {
                    closeEventPopup(); // Chiudi popup scelta
                }
                
                // Mostra messaggio temporaneo senza tasto Continua
                const eventOverlay = document.getElementById('event-overlay');
                const eventPopup = document.getElementById('event-popup');
                if (eventOverlay && eventPopup) {
                    eventOverlay.style.display = 'flex';
                    eventPopup.innerHTML = `
                        <h2>⚔️ Preparazione al Combattimento</h2>
                        <p>Ti prepari per affrontare il nemico...</p>
                        <p style="color: #fbbf24; font-style: italic;">Calcolo degli attacchi in corso...</p>
                        <div style="text-align: center; margin-top: 20px;">
                            <div style="color: #94a3b8;">⏳ Attendere prego...</div>
                        </div>
                    `;
                }
                
                // Suspense di 2 secondi prima di iniziare il combattimento
                setTimeout(() => {
                // Seleziona nemico dai database v1.0.0 con varietà
                let enemy = null;
                
                // Usa il nuovo database ENEMY_DATABASE se disponibile
                if (typeof ENEMY_DATABASE !== 'undefined') {
                    if (eventType === 'PREDATOR') {
                        const category = ['BANDIT', 'RAIDER', 'SCAVENGER'][Math.floor(Math.random() * 3)];
                        const tier = ['easy', 'standard', 'hard'][Math.floor(Math.random() * 3)];
                        enemy = ENEMY_DATABASE[category]?.[tier] || ENEMY_DATABASE.BANDIT?.standard;
                    } else if (eventType === 'ANIMAL') {
                        const category = 'BEAST';
                        const tier = ['easy', 'standard', 'hard'][Math.floor(Math.random() * 3)];
                        enemy = ENEMY_DATABASE[category]?.[tier] || ENEMY_DATABASE.BEAST?.standard;
                    } else if (eventType === 'HORROR') {
                        const category = ['MUTANT', 'DRONE'][Math.floor(Math.random() * 2)];
                        const tier = ['standard', 'hard'][Math.floor(Math.random() * 2)];
                        enemy = ENEMY_DATABASE[category]?.[tier] || ENEMY_DATABASE.MUTANT?.standard;
                    } else {
                        // Fallback: nemico casuale
                        const categories = Object.keys(ENEMY_DATABASE);
                        const randomCategory = categories[Math.floor(Math.random() * categories.length)];
                        const tiers = Object.keys(ENEMY_DATABASE[randomCategory]);
                        const randomTier = tiers[Math.floor(Math.random() * tiers.length)];
                        enemy = ENEMY_DATABASE[randomCategory][randomTier];
                    }
                } else {
                    // Fallback al vecchio sistema
                    if (eventType === 'PREDATOR') {
                        enemy = ENEMY_DATA.predators?.standard || ENEMY_DATA.bandits?.standard;
                    } else if (eventType === 'ANIMAL') {
                        enemy = ENEMY_DATA.animals?.standard || ENEMY_DATA.beasts?.standard;
                    } else if (eventType === 'HORROR') {
                        enemy = ENEMY_DATA.special?.zone_horror || ENEMY_DATA.mutants?.standard;
                    } else {
                        enemy = ENEMY_DATA.predators?.standard || ENEMY_DATA.bandits?.standard;
                    }
                }
                
                if (enemy) {
                    console.log(`[COMBAT_UNIVERSAL] Combattimento vs ${enemy.name} (${eventType})`);
                    
                    // Salva HP iniziale per calcolo danni corretto
                    const initialPlayerHP = player.hp;
                    
                    // Esegui combattimento avanzato
                    const combatResult = CombatSystem.resolveCombat(player, enemy);
                    
                    // Calcolo danni DEFINITIVO
                    const actualDamageTaken = Math.max(0, initialPlayerHP - combatResult.finalPlayerHP);
                    combatResult.damageTaken = actualDamageTaken; // Forza il valore corretto
                    player.hp = combatResult.finalPlayerHP; // Applica HP finale
                    
                    // Log per debug
                    console.log(`[COMBAT] HP: ${initialPlayerHP} → ${combatResult.finalPlayerHP} (danni REALI: ${actualDamageTaken})`);
                    
                    // Chiudi popup preparazione prima di iniziare animazione
                    if (typeof closeEventPopup === 'function') {
                        closeEventPopup();
                    }
                    
                    // Usa il sistema visual avanzato con suspense
                    if (typeof CombatVisuals !== 'undefined' && CombatVisuals.showCombatWithNarrativeEffects) {
                        console.log('[COMBAT_UNIVERSAL] Usando sistema visual avanzato');
                        
                        // Mostra combattimento con effetti completi (animazione in background)
                        const description = CombatVisuals.showCombatWithNarrativeEffects(combatResult, enemy);
                        
                        // Il sistema visual gestisce tutto automaticamente, incluso il popup finale
                        // Aggiungiamo solo esperienza e loot dopo l'animazione
                        setTimeout(() => {
                            // Esperienza e loot
                            if (combatResult.victory) {
                                if (typeof awardExperience === 'function' && combatResult.expGained) {
                                    awardExperience(combatResult.expGained, `vittoria contro ${enemy.name}`);
                                }
                                
                                // Loot casuale
                                if (enemy.lootTable && typeof applyChoiceReward === 'function') {
                                    Object.keys(enemy.lootTable).forEach(itemId => {
                                        if (Math.random() < enemy.lootTable[itemId]) {
                                            applyChoiceReward({ itemId: itemId, quantity: 1 });
                                        }
                                    });
                                }
                            }
                            
                            // Usura arma
                            if (player.equippedWeapon && typeof applyWearToEquippedItem === 'function') {
                                applyWearToEquippedItem('equippedWeapon', 1);
                            }
                        }, 7000); // Dopo che l'animazione visual è completa
                    } else {
                        console.log('[COMBAT_UNIVERSAL] Sistema visual non disponibile, fallback');
                        
                        // Fallback: usa sistema semplice con descrizione migliorata
                        let description = `<div class="combat-result">`;
                        description += `<strong>Combattimento contro ${enemy.name}!</strong><br><br>`;
                        
                        // Mostra alcuni round
                        const roundsToShow = Math.min(3, combatResult.rounds?.length || 0);
                        for (let i = 0; i < roundsToShow; i++) {
                            const round = combatResult.rounds[i];
                            if (round.attacker === 'player') {
                                if (round.hit) {
                                    description += `<span style="color: #4ade80">→ Colpisci per ${round.damage} danni!</span><br>`;
                                } else {
                                    description += `<span style="color: #94a3b8">→ Il tuo attacco manca!</span><br>`;
                                }
                            } else {
                                if (round.hit) {
                                    description += `<span style="color: #ef4444">← ${enemy.name} ti colpisce per ${round.damage} danni!</span><br>`;
                                } else {
                                    description += `<span style="color: #3b82f6">← Schivi l'attacco!</span><br>`;
                                }
                            }
                        }
                        
                        description += `<br><strong>`;
                        if (combatResult.victory) {
                            description += `<span style="color: #22c55e;">VITTORIA!</span></strong><br>`;
                            description += `Hai sconfitto ${enemy.name}!`;
                            if (combatResult.expGained > 0) {
                                description += `<br>Guadagni ${combatResult.expGained} punti esperienza.`;
                            }
                        } else {
                            description += `<span style="color: #dc2626;">SCONFITTA!</span></strong><br>`;
                            description += `${enemy.name} ti ha sopraffatto!`;
                            description += `<br>Subisci ${actualDamageTaken} danni totali.`;
                        }
                        description += `</div>`;
                        
                        // Mostra con delay simulato
                        setTimeout(() => {
                            const title = combatResult.victory ? "⚔️ VITTORIA!" : "💀 SCONFITTA";
                            const messageType = combatResult.victory ? 'success' : 'danger';
                            
                            // Chiudi qualsiasi popup esistente prima
                            if (typeof closeEventPopup === 'function') {
                                closeEventPopup();
                            }
                            
                            setTimeout(() => {
                                if (typeof showEventPopup === 'function') {
                                    showEventPopup({
                                        title: title,
                                        description: description,
                                        isOutcome: true
                                    });
                                }
                            }, 100);
                        }, 1500); // 1.5 secondi di suspense
                    }
                }
                }, 2000); // 2 secondi di suspense iniziale
                
                // NON chiamare la funzione originale
                return;
            }
            
            // Fallback alla funzione originale per tutto il resto
            return originalHandleEventChoice(choiceIndex);
        };
        
        console.log('[V1_ULTIMATE] Hook combattimento universale attivato');
    }
}

// 4. TRIGGER EVENTO INIZIALE POTENZIATO
setTimeout(() => {
    if (gameActive && player) {
        const seenEvents = player.seenLoreEvents || [];
        if (!seenEvents.includes('lore_echo_of_departure')) {
            console.log('[V1_ULTIMATE] Triggering evento iniziale');
            window.LoreEventTrigger.showEvent('lore_echo_of_departure');
        }
    }
}, 2000);

// 4.5. DIAGNOSTICA AUTOMATICA E TRIGGER PERIODICO
setTimeout(() => {
    // Controllo periodico ogni 30 secondi per eventi mancanti
    setInterval(() => {
        if (!gameActive || !player) return;
        
        const distance = window.LoreEventTrigger.getDistanceFromSafePlace(player.x || 0, player.y || 0);
        const seenEvents = player.seenLoreEvents || [];
        
        // Se il giocatore si è mosso significativamente ma ha visto pochi eventi
        if (distance < 170 && seenEvents.length < 3) {
            console.log('[LORE_DIAGNOSTIC] Pochi eventi visti, controllo forzato...');
            const eventId = window.LoreEventTrigger.checkAllTriggers();
            if (eventId) {
                console.log(`[LORE_DIAGNOSTIC] Triggerando evento: ${eventId}`);
                window.LoreEventTrigger.showEvent(eventId);
            }
        }
        
        // Se molto vicino al Safe Place ma pochi eventi
        if (distance < 50 && seenEvents.length < 8) {
            console.log('[LORE_DIAGNOSTIC] Quasi arrivato ma storia incompleta, forzando eventi...');
            const eventId = window.LoreEventTrigger.checkAllTriggers();
            if (eventId) {
                window.LoreEventTrigger.showEvent(eventId);
            }
        }
    }, 30000); // Ogni 30 secondi
}, 10000); // Parte dopo 10 secondi dall'avvio

// 5. HELPER DEBUG AVANZATI
window.V1_ULTIMATE = {
    // Status completo
    status: function() {
        if (!player) {
            console.log('❌ Player non definito');
            return;
        }
        
        const distance = window.LoreEventTrigger.getDistanceFromSafePlace(player.x || 0, player.y || 0);
        const moves = window.LoreEventTrigger.getTotalMoves();
        const seenEvents = player.seenLoreEvents || [];
        
        console.log('🎯 === STATUS COMPLETO v1.0.0d ===');
        console.log(`📍 Posizione: (${player.x}, ${player.y})`);
        console.log(`🎯 Distanza Safe Place: ${distance.toFixed(1)}`);
        console.log(`👣 Movimenti totali: ${moves}`);
        console.log(`📅 Giorni sopravvissuti: ${daysSurvived}`);
        console.log(`📚 Eventi visti: ${seenEvents.length}/10`);
        console.log('');
        
        // Mostra prossimi eventi disponibili
        console.log('📋 EVENTI DISPONIBILI:');
        window.LoreEventTrigger.eventMilestones.forEach(milestone => {
            const seen = seenEvents.includes(milestone.id) ? '✅' : '❌';
            const triggers = milestone.triggers;
            let status = '';
            
            if (triggers.always) {
                status = 'SEMPRE';
            } else {
                const checks = [];
                if (triggers.distance) checks.push(`Dist≤${triggers.distance} ${distance <= triggers.distance ? '✅' : '❌'}`);
                if (triggers.moves) checks.push(`Mov≥${triggers.moves} ${moves >= triggers.moves ? '✅' : '❌'}`);
                if (triggers.days) checks.push(`Day≥${triggers.days} ${daysSurvived >= triggers.days ? '✅' : '❌'}`);
                status = checks.join(' ');
            }
            
            console.log(`${seen} ${milestone.id}: ${status}`);
        });
    },
    
    // Forza prossimo evento disponibile
    nextEvent: function() {
        const eventId = window.LoreEventTrigger.checkAllTriggers();
        if (eventId) {
            window.LoreEventTrigger.showEvent(eventId);
        } else {
            console.log('🚫 Nessun evento lore disponibile');
            this.status();
        }
    },
    
    // Test combattimento diretto
    testCombat: function() {
        if (typeof CombatSystem !== 'undefined') {
            // Usa nemico casuale dal database v1.0.0
            let enemy = null;
            if (typeof ENEMY_DATABASE !== 'undefined') {
                const categories = Object.keys(ENEMY_DATABASE);
                const randomCategory = categories[Math.floor(Math.random() * categories.length)];
                const tiers = Object.keys(ENEMY_DATABASE[randomCategory]);
                const randomTier = tiers[Math.floor(Math.random() * tiers.length)];
                enemy = ENEMY_DATABASE[randomCategory][randomTier];
                console.log(`[TEST] Nemico selezionato: ${enemy.name} (${randomCategory}/${randomTier})`);
            } else if (typeof ENEMY_DATA !== 'undefined') {
                enemy = ENEMY_DATA.predators?.standard || Object.values(ENEMY_DATA)[0]?.standard;
            }
            
            if (!enemy) {
                console.log('❌ Nessun nemico disponibile per il test');
                return;
            }
            
            const combatResult = CombatSystem.resolveCombat(player, enemy);
            player.hp = combatResult.finalPlayerHP;
            
            // Usa il sistema visual avanzato se disponibile
            if (typeof CombatVisuals !== 'undefined' && CombatVisuals.showCombatWithNarrativeEffects) {
                console.log('[TEST] Usando sistema visual avanzato');
                const description = CombatVisuals.showCombatWithNarrativeEffects(combatResult, enemy);
                
                // Aspetta animazione completa prima del popup finale
                setTimeout(() => {
                    showEventPopup({
                        title: `⚔️ TEST: ${combatResult.victory ? 'VITTORIA' : 'SCONFITTA'}`,
                        description: description,
                        isOutcome: true
                    });
                }, 6000);
            } else {
                console.log('[TEST] Sistema visual non disponibile, usando fallback');
                const description = `Test combattimento contro ${enemy.name}:<br>` +
                    `${combatResult.victory ? '<span style="color: #22c55e">VITTORIA!</span>' : '<span style="color: #dc2626">SCONFITTA!</span>'}`;
                
                setTimeout(() => {
                    showEventPopup({
                        title: `⚔️ TEST: ${combatResult.victory ? 'WIN' : 'LOSE'}`,
                        description: description,
                        isOutcome: true
                    });
                }, 1000);
            }
        } else {
            console.log('❌ Sistema combattimento non disponibile');
        }
    },
    
    // Skip verso Safe Place
    skipToSafePlace: function() {
        player.x = 170;
        player.y = 170;
        if (!player.moveHistory) player.moveHistory = [];
        player.moveHistory.push({ x: 170, y: 170, day: daysSurvived });
        console.log('🎯 Saltato a (170,170) - molto vicino al Safe Place');
        this.status();
    },
    
    // Reset per test
    reset: function() {
        player.seenLoreEvents = [];
        player.moveHistory = [];
        console.log('🔄 Reset completo per testing');
        this.status();
    }
};

console.log('[V1_ULTIMATE] Fix finale caricato! Usa V1_ULTIMATE.* per debug completo'); 
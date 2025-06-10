/**
 * THE SAFE PLACE - ADVANCED COMBAT VISUALS v2.0
 * v1.0.0 "Ultimo's Journey" + Sistema D&D Avanzato
 * 
 * Sistema avanzato di visualizzazione del combattimento con effetti narrativi,
 * status effects e abilità speciali - FASE 3 RECUPERO ARCHITETTURA
 */

const CombatVisuals = {
    // Configurazione degli effetti visivi
    config: {
        suspenseDuration: 2000, // 2 secondi di suspense
        roundDelay: 500, // 500ms tra i round
        hitFlashDuration: 300,
        colors: {
            playerHit: '#4ade80',      // Verde per colpi del giocatore
            playerMiss: '#94a3b8',     // Grigio per mancati del giocatore
            enemyHit: '#ef4444',       // Rosso per colpi nemici
            enemyMiss: '#64748b',      // Grigio scuro per mancati nemici
            victory: '#22c55e',        // Verde brillante per vittoria
            defeat: '#dc2626',         // Rosso scuro per sconfitta
            criticalHit: '#fbbf24',    // Oro per colpi critici
            dodge: '#3b82f6',          // Blu per schivate
            statusEffect: '#8b5cf6',   // Viola per status effects
            specialAbility: '#f59e0b', // Ambra per abilità speciali
            tier1: '#10b981',          // Verde per Tier 1
            tier2: '#f59e0b',          // Ambra per Tier 2
            tier3: '#dc2626'           // Rosso per Tier 3
        }
    },
    
    /**
     * Mostra il combattimento con effetti narrativi e suspense AVANZATO
     * @param {Object} combatResult - Risultato dal CombatSystem Avanzato
     * @param {Object} enemy - Dati del nemico
     * @returns {string} HTML del risultato
     */
    showCombatWithNarrativeEffects(combatResult, enemy) {
        // Crea il container per il combattimento
        const combatContainer = document.createElement('div');
        combatContainer.className = 'combat-narrative-container advanced';
        
        // Determina colore tier
        const tierColor = this.getTierColor(combatResult.tier || 1);
        
        combatContainer.innerHTML = `
            <div class="combat-header">
                <h3>⚔️ Combattimento contro ${enemy.name}!</h3>
                <div class="combat-tier-info" style="color: ${tierColor}">
                    Tier ${combatResult.tier || 1} - Zona di Pericolo ${this.getTierName(combatResult.tier || 1)}
                </div>
                ${combatResult.specialAbilityUsed ? `
                    <div class="special-ability-notice" style="color: ${this.config.colors.specialAbility}">
                        ${enemy.name} può usare: ${combatResult.specialAbilityUsed}
                    </div>
                ` : ''}
                <div class="combat-participants">
                    <div class="participant player">
                        <span class="name">Ultimo</span>
                        <div class="hp-bar">
                            <div class="hp-fill" style="width: 100%"></div>
                            <span class="hp-text">${player.hp}/${player.maxHp}</span>
                        </div>
                        <div class="status-effects-display" id="player-status-effects"></div>
                    </div>
                    <div class="vs">VS</div>
                    <div class="participant enemy">
                        <span class="name">${enemy.name}</span>
                        <div class="hp-bar">
                            <div class="hp-fill enemy-hp" style="width: 100%"></div>
                            <span class="hp-text">${enemy.hp}/${enemy.hp}</span>
                        </div>
                        <div class="status-effects-display" id="enemy-status-effects"></div>
                    </div>
                </div>
            </div>
            <div class="combat-log" id="combat-log"></div>
            <div class="combat-result-final" id="combat-result-final" style="display: none;"></div>
        `;
        
        // Aggiungi al popup evento se esiste
        const eventPopup = document.getElementById('event-popup');
        if (eventPopup) {
            const existingContent = eventPopup.querySelector('.event-content');
            if (existingContent) {
                existingContent.appendChild(combatContainer);
            }
        }
        
        // Anima il combattimento
        this.animateAdvancedCombat(combatResult, enemy, combatContainer);
        
        // Ritorna il testo semplice per compatibilità
        return this.generateAdvancedText(combatResult, enemy);
    },
    
    /**
     * Anima il combattimento avanzato round per round con status effects
     */
    async animateAdvancedCombat(combatResult, enemy, container) {
        const logElement = container.querySelector('#combat-log');
        const playerHpBar = container.querySelector('.participant.player .hp-fill');
        const playerHpText = container.querySelector('.participant.player .hp-text');
        const enemyHpBar = container.querySelector('.participant.enemy .hp-fill');
        const enemyHpText = container.querySelector('.participant.enemy .hp-text');
        const playerStatusDisplay = container.querySelector('#player-status-effects');
        const enemyStatusDisplay = container.querySelector('#enemy-status-effects');
        
        let currentPlayerHp = player.maxHp;
        let currentEnemyHp = enemy.hp;
        let playerActiveEffects = [];
        let enemyActiveEffects = [];
        
        // Mostra i round con delay
        for (let i = 0; i < Math.min(combatResult.rounds.length, 12); i++) {
            const round = combatResult.rounds[i];
            await this.delay(this.config.roundDelay);
            
            // Crea elemento per il round
            const roundElement = document.createElement('div');
            roundElement.className = 'combat-round fade-in';
            
            // Gestisce diversi tipi di round
            if (round.type === 'status_effect') {
                // Status effect damage
                if (round.target === 'player') {
                    currentPlayerHp = Math.max(0, currentPlayerHp - round.damage);
                    roundElement.innerHTML = `
                        <span class="combat-action status-effect" style="color: ${this.config.colors.statusEffect}">
                            💀 Status Effects: ${round.effects.join(', ')} → ${round.damage} danni!
                        </span>
                    `;
                    this.animateHpBar(playerHpBar, playerHpText, currentPlayerHp, player.maxHp);
                } else {
                    currentEnemyHp = Math.max(0, currentEnemyHp - round.damage);
                    roundElement.innerHTML = `
                        <span class="combat-action status-effect" style="color: ${this.config.colors.statusEffect}">
                            💀 ${enemy.name} subisce ${round.damage} danni da: ${round.effects.join(', ')}!
                        </span>
                    `;
                    this.animateHpBar(enemyHpBar, enemyHpText, currentEnemyHp, enemy.hp);
                }
            } else if (round.type === 'special_ability') {
                // Special ability activation
                roundElement.innerHTML = `
                    <span class="combat-action special-ability" style="color: ${this.config.colors.specialAbility}">
                        ✨ ABILITÀ SPECIALE: ${round.abilityName} - ${round.message}
                    </span>
                `;
                
                // Aggiorna status effects display
                if (round.effect && window.STATUS_EFFECTS && window.STATUS_EFFECTS[round.effect]) {
                    const statusInfo = window.STATUS_EFFECTS[round.effect];
                    const effectElement = this.createStatusEffectElement(statusInfo);
                    
                    if (round.target === 'player' || !round.target) {
                        playerStatusDisplay.appendChild(effectElement);
                        playerActiveEffects.push(round.effect);
                    } else {
                        enemyStatusDisplay.appendChild(effectElement);
                        enemyActiveEffects.push(round.effect);
                    }
                }
            } else if (round.attacker === 'player') {
                // Attacco del giocatore
                if (round.hit) {
                    currentEnemyHp = Math.max(0, currentEnemyHp - round.damage);
                    const critText = round.critical ? '⚡ COLPO CRITICO! ' : '';
                    const pierceText = round.armorPiercing ? ' (Perforazione Armatura)' : '';
                    const multText = round.damageMultiplier ? ` (x${round.damageMultiplier})` : '';
                    
                    roundElement.innerHTML = `
                        <span class="combat-action player-hit" style="color: ${round.critical ? this.config.colors.criticalHit : this.config.colors.playerHit}">
                            → ${critText}Colpisci per ${round.damage} danni!${pierceText}${multText}
                        </span>
                    `;
                    
                    this.animateHpBar(enemyHpBar, enemyHpText, currentEnemyHp, enemy.hp);
                    this.flashElement(container, round.critical ? this.config.colors.criticalHit : this.config.colors.playerHit);
                } else {
                    roundElement.innerHTML = `
                        <span class="combat-action player-miss" style="color: ${this.config.colors.playerMiss}">
                            → Il tuo attacco manca!
                        </span>
                    `;
                }
            } else if (round.attacker === 'enemy') {
                // Attacco del nemico
                if (round.paralyzed) {
                    roundElement.innerHTML = `
                        <span class="combat-action enemy-paralyzed" style="color: ${this.config.colors.statusEffect}">
                            ← ${round.message || `${enemy.name} è paralizzato e non può attaccare!`}
                        </span>
                    `;
                } else if (round.hit) {
                    currentPlayerHp = Math.max(0, currentPlayerHp - round.damage);
                    const critText = round.critical ? '⚡ COLPO CRITICO! ' : '';
                    const pierceText = round.armorPiercing ? ' (Ignora Armatura)' : '';
                    const multText = round.damageMultiplier ? ` (x${round.damageMultiplier})` : '';
                    
                    roundElement.innerHTML = `
                        <span class="combat-action enemy-hit" style="color: ${round.critical ? this.config.colors.criticalHit : this.config.colors.enemyHit}">
                            ← ${critText}${enemy.name} ti colpisce per ${round.damage} danni!${pierceText}${multText}
                        </span>
                    `;
                    
                    this.animateHpBar(playerHpBar, playerHpText, currentPlayerHp, player.maxHp);
                    this.flashElement(container, round.critical ? this.config.colors.criticalHit : this.config.colors.enemyHit);
                } else {
                    roundElement.innerHTML = `
                        <span class="combat-action enemy-miss" style="color: ${this.config.colors.dodge}">
                            ← Schivi l'attacco di ${enemy.name}!
                        </span>
                    `;
                }
            }
            
            logElement.appendChild(roundElement);
            logElement.scrollTop = logElement.scrollHeight;
        }
        
        // Pausa di suspense prima del risultato finale
        await this.delay(this.config.suspenseDuration);
        
        // Mostra il risultato finale
        const resultElement = container.querySelector('#combat-result-final');
        resultElement.style.display = 'block';
        resultElement.className = 'combat-result-final fade-in';
        
        if (combatResult.victory) {
            resultElement.innerHTML = `
                <div class="victory-animation">
                    <h2 style="color: ${this.config.colors.victory}">✨ VITTORIA! ✨</h2>
                    <p>Hai sconfitto ${enemy.name}!</p>
                    ${combatResult.tier > 1 ? `<p class="tier-bonus" style="color: ${this.getTierColor(combatResult.tier)}">Nemico Tier ${combatResult.tier} - Esperienza Bonus!</p>` : ''}
                    ${combatResult.expGained > 0 ? `<p class="exp-gain">+${combatResult.expGained} EXP</p>` : ''}
                    ${combatResult.statusEffectsApplied && combatResult.statusEffectsApplied.length > 0 ? 
                        `<p class="status-summary">Effetti applicati: ${combatResult.statusEffectsApplied.join(', ')}</p>` : ''}
                    ${combatResult.loot ? `<p class="loot-gain">Bottino ottenuto!</p>` : ''}
                </div>
            `;
            this.triggerVictoryEffects(container);
        } else {
            resultElement.innerHTML = `
                <div class="defeat-animation">
                    <h2 style="color: ${this.config.colors.defeat}">💀 SCONFITTA 💀</h2>
                    <p>${enemy.name} ti ha sopraffatto!</p>
                    ${combatResult.tier > 1 ? `<p class="tier-warning" style="color: ${this.getTierColor(combatResult.tier)}">Nemico Tier ${combatResult.tier} - Zona molto pericolosa!</p>` : ''}
                    <p class="damage-total">Danni totali subiti: ${combatResult.damageTaken}</p>
                    ${combatResult.specialAbilityUsed ? `<p class="special-used">Abilità nemica: ${combatResult.specialAbilityUsed}</p>` : ''}
                </div>
            `;
            this.triggerDefeatEffects(container);
        }
    },
    
    /**
     * Crea elemento visuale per status effect
     */
    createStatusEffectElement(statusInfo) {
        const element = document.createElement('div');
        element.className = 'status-effect-indicator';
        element.innerHTML = `
            <span class="status-icon" style="color: ${statusInfo.color}">${statusInfo.icon}</span>
            <span class="status-name" style="color: ${statusInfo.color}">${statusInfo.name}</span>
        `;
        element.title = statusInfo.description;
        return element;
    },
    
    /**
     * Ottiene colore per tier
     */
    getTierColor(tier) {
        switch(tier) {
            case 1: return this.config.colors.tier1;
            case 2: return this.config.colors.tier2; 
            case 3: return this.config.colors.tier3;
            default: return this.config.colors.tier1;
        }
    },
    
    /**
     * Ottiene nome descrittivo per tier
     */
    getTierName(tier) {
        switch(tier) {
            case 1: return 'Bassa';
            case 2: return 'Media';
            case 3: return 'Alta';
            default: return 'Sconosciuta';
        }
    },
    
    /**
     * Anima la barra HP
     */
    animateHpBar(barElement, textElement, currentHp, maxHp) {
        const percentage = (currentHp / maxHp) * 100;
        barElement.style.width = percentage + '%';
        textElement.textContent = `${currentHp}/${maxHp}`;
        
        // Cambia colore in base alla percentuale
        if (percentage > 60) {
            barElement.style.backgroundColor = '#4ade80';
        } else if (percentage > 30) {
            barElement.style.backgroundColor = '#fbbf24';
        } else {
            barElement.style.backgroundColor = '#ef4444';
        }
    },
    
    /**
     * Effetto flash per i colpi
     */
    flashElement(element, color) {
        element.style.boxShadow = `0 0 20px ${color}`;
        setTimeout(() => {
            element.style.boxShadow = '';
        }, this.config.hitFlashDuration);
    },
    
    /**
     * Effetti di vittoria
     */
    triggerVictoryEffects(container) {
        container.classList.add('victory-flash');
        setTimeout(() => {
            container.classList.remove('victory-flash');
        }, 1000);
        
        // Effetto particelle (se implementato)
        this.createParticleEffect(container, this.config.colors.victory);
    },
    
    /**
     * Effetti di sconfitta
     */
    triggerDefeatEffects(container) {
        container.classList.add('defeat-shake');
        setTimeout(() => {
            container.classList.remove('defeat-shake');
        }, 800);
        
        this.createParticleEffect(container, this.config.colors.defeat);
    },
    
    /**
     * Genera testo semplice per combattimento avanzato
     */
    generateAdvancedText(combatResult, enemy) {
        let text = `<div class="combat-result advanced">`;
        text += `<strong>Combattimento Tier ${combatResult.tier || 1} contro ${enemy.name}!</strong><br><br>`;
        
        // Mostra solo alcuni round chiave per il testo semplice
        const roundsToShow = Math.min(3, combatResult.rounds.length);
        for (let i = 0; i < roundsToShow; i++) {
            const round = combatResult.rounds[i];
            
            if (round.type === 'special_ability') {
                text += `<span style="color: ${this.config.colors.specialAbility}">⚡ ${round.abilityName}: ${round.message}</span><br>`;
            } else if (round.type === 'status_effect') {
                text += `<span style="color: ${this.config.colors.statusEffect}">☠️ Status: ${round.damage} danni da ${round.effects.join(', ')}</span><br>`;
            } else if (round.attacker === 'player' && round.hit) {
                const critText = round.critical ? 'CRITICO! ' : '';
                text += `Tu colpisci: ${critText}${round.damage} danni.<br>`;
            } else if (round.attacker === 'enemy' && round.hit && !round.paralyzed) {
                const critText = round.critical ? 'CRITICO! ' : '';
                text += `${enemy.name} colpisce: ${critText}${round.damage} danni.<br>`;
            }
        }
        
        text += `<br>`;
        
        if (combatResult.victory) {
            text += `<strong style="color: ${this.config.colors.victory}">✨ VITTORIA!</strong><br>`;
            if (combatResult.expGained > 0) {
                text += `Guadagni ${combatResult.expGained} punti esperienza.<br>`;
            }
            if (combatResult.tier > 1) {
                text += `<span style="color: ${this.getTierColor(combatResult.tier)}">Nemico Tier ${combatResult.tier} sconfitto!</span><br>`;
            }
        } else {
            text += `<strong style="color: ${this.config.colors.defeat}">💀 SCONFITTA!</strong><br>`;
            text += `Subisci ${combatResult.damageTaken} danni totali.<br>`;
            if (combatResult.specialAbilityUsed) {
                text += `Il nemico ha usato: ${combatResult.specialAbilityUsed}<br>`;
            }
        }
        
        text += `</div>`;
        return text;
    },
    
    /**
     * Crea effetto particelle semplice
     */
    createParticleEffect(container, color) {
        // Implementazione base per effetti particelle
        for (let i = 0; i < 5; i++) {
            const particle = document.createElement('div');
            particle.className = 'combat-particle';
            particle.style.cssText = `
                position: absolute;
                width: 4px;
                height: 4px;
                background-color: ${color};
                border-radius: 50%;
                pointer-events: none;
                z-index: 1000;
                animation: particle-fade 2s ease-out forwards;
                left: ${50 + Math.random() * 20 - 10}%;
                top: ${50 + Math.random() * 20 - 10}%;
            `;
            
            container.style.position = 'relative';
            container.appendChild(particle);
            
            setTimeout(() => {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
            }, 2000);
        }
    },
    
    /**
     * Delay helper
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
};

// Funzioni globali per compatibilità (backward compatibility)
window.showCombatResultWithSuspense = function(combatResult, enemyName) {
    // Cerca il nemico nel database per maggiori informazioni
    let enemyData = null;
    
    if (typeof ENEMY_DATABASE !== 'undefined') {
        // Cerca nel nuovo database
        for (const category in ENEMY_DATABASE) {
            for (const tier in ENEMY_DATABASE[category]) {
                const enemy = ENEMY_DATABASE[category][tier];
                if (enemy.name === enemyName) {
                    enemyData = enemy;
                    break;
                }
            }
            if (enemyData) break;
        }
    }
    
    if (!enemyData && typeof ENEMY_DATA !== 'undefined') {
        // Fallback al vecchio database
        for (const category in ENEMY_DATA) {
            for (const tier in ENEMY_DATA[category]) {
                if (ENEMY_DATA[category][tier].name === enemyName) {
                    enemyData = ENEMY_DATA[category][tier];
                    break;
                }
            }
            if (enemyData) break;
        }
    }
    
    if (!enemyData) {
        enemyData = { name: enemyName, hp: 20 }; // Fallback basic
    }
    
    return CombatVisuals.showCombatWithNarrativeEffects(combatResult, enemyData);
};

// Export globale
window.CombatVisuals = CombatVisuals;

console.log('[COMBAT] ✅ Advanced Combat Visuals v2.0 caricato - Status effects e tier system attivi!'); 
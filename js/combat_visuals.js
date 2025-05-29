/**
 * THE SAFE PLACE - COMBAT VISUALS
 * v1.0.0 "Ultimo's Journey"
 * 
 * Sistema avanzato di visualizzazione del combattimento con effetti narrativi
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
            dodge: '#3b82f6'           // Blu per schivate
        }
    },
    
    /**
     * Mostra il combattimento con effetti narrativi e suspense
     * @param {Object} combatResult - Risultato dal CombatSystem
     * @param {Object} enemy - Dati del nemico
     * @returns {string} HTML del risultato
     */
    showCombatWithNarrativeEffects(combatResult, enemy) {
        // Crea il container per il combattimento
        const combatContainer = document.createElement('div');
        combatContainer.className = 'combat-narrative-container';
        combatContainer.innerHTML = `
            <div class="combat-header">
                <h3>⚔️ Combattimento contro ${enemy.name}!</h3>
                <div class="combat-participants">
                    <div class="participant player">
                        <span class="name">Ultimo</span>
                        <div class="hp-bar">
                            <div class="hp-fill" style="width: 100%"></div>
                            <span class="hp-text">${player.hp}/${player.maxHp}</span>
                        </div>
                    </div>
                    <div class="vs">VS</div>
                    <div class="participant enemy">
                        <span class="name">${enemy.name}</span>
                        <div class="hp-bar">
                            <div class="hp-fill enemy-hp" style="width: 100%"></div>
                            <span class="hp-text">${enemy.hp}/${enemy.hp}</span>
                        </div>
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
        this.animateCombat(combatResult, enemy, combatContainer);
        
        // Ritorna il testo semplice per compatibilità
        return this.generateSimpleText(combatResult, enemy);
    },
    
    /**
     * Anima il combattimento round per round
     */
    async animateCombat(combatResult, enemy, container) {
        const logElement = container.querySelector('#combat-log');
        const playerHpBar = container.querySelector('.participant.player .hp-fill');
        const playerHpText = container.querySelector('.participant.player .hp-text');
        const enemyHpBar = container.querySelector('.participant.enemy .hp-fill');
        const enemyHpText = container.querySelector('.participant.enemy .hp-text');
        
        let currentPlayerHp = player.maxHp;
        let currentEnemyHp = enemy.hp;
        
        // Mostra i round con delay
        for (let i = 0; i < Math.min(combatResult.rounds.length, 6); i++) {
            const round = combatResult.rounds[i];
            await this.delay(this.config.roundDelay);
            
            // Crea elemento per il round
            const roundElement = document.createElement('div');
            roundElement.className = 'combat-round fade-in';
            
            if (round.attacker === 'player') {
                if (round.hit) {
                    // Colpo del giocatore
                    currentEnemyHp = Math.max(0, currentEnemyHp - round.damage);
                    roundElement.innerHTML = `
                        <span class="combat-action player-hit" style="color: ${this.config.colors.playerHit}">
                            → ${round.critical ? '⚡ COLPO CRITICO!' : 'Colpisci'} per ${round.damage} danni!
                        </span>
                    `;
                    
                    // Anima la barra HP nemica
                    this.animateHpBar(enemyHpBar, enemyHpText, currentEnemyHp, enemy.hp);
                    this.flashElement(container, this.config.colors.playerHit);
                } else {
                    roundElement.innerHTML = `
                        <span class="combat-action player-miss" style="color: ${this.config.colors.playerMiss}">
                            → Il tuo attacco manca!
                        </span>
                    `;
                }
            } else {
                if (round.hit) {
                    // Colpo del nemico
                    currentPlayerHp = Math.max(0, currentPlayerHp - round.damage);
                    roundElement.innerHTML = `
                        <span class="combat-action enemy-hit" style="color: ${this.config.colors.enemyHit}">
                            ← ${enemy.name} ti colpisce per ${round.damage} danni!
                        </span>
                    `;
                    
                    // Anima la barra HP del giocatore
                    this.animateHpBar(playerHpBar, playerHpText, currentPlayerHp, player.maxHp);
                    this.flashElement(container, this.config.colors.enemyHit);
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
                    ${combatResult.expGained > 0 ? `<p class="exp-gain">+${combatResult.expGained} EXP</p>` : ''}
                    ${combatResult.loot ? `<p class="loot-gain">Bottino ottenuto!</p>` : ''}
                </div>
            `;
            this.triggerVictoryEffects(container);
        } else {
            resultElement.innerHTML = `
                <div class="defeat-animation">
                    <h2 style="color: ${this.config.colors.defeat}">💀 SCONFITTA 💀</h2>
                    <p>${enemy.name} ti ha sopraffatto!</p>
                    <p class="damage-total">Danni totali subiti: ${combatResult.damageTaken}</p>
                </div>
            `;
            this.triggerDefeatEffects(container);
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
     * Effetti speciali per la vittoria
     */
    triggerVictoryEffects(container) {
        container.classList.add('victory-glow');
        
        // Crea particelle di vittoria
        for (let i = 0; i < 10; i++) {
            setTimeout(() => {
                const particle = document.createElement('div');
                particle.className = 'victory-particle';
                particle.style.left = Math.random() * 100 + '%';
                particle.style.animationDelay = Math.random() * 0.5 + 's';
                container.appendChild(particle);
                
                setTimeout(() => particle.remove(), 2000);
            }, i * 100);
        }
    },
    
    /**
     * Effetti per la sconfitta
     */
    triggerDefeatEffects(container) {
        container.classList.add('defeat-shake');
        setTimeout(() => {
            container.classList.remove('defeat-shake');
        }, 500);
    },
    
    /**
     * Genera testo semplice per retrocompatibilità
     */
    generateSimpleText(combatResult, enemy) {
        let text = `<div class="combat-result">`;
        text += `<strong>Combattimento contro ${enemy.name}!</strong><br><br>`;
        
        // Mostra alcuni round
        const roundsToShow = Math.min(3, combatResult.rounds.length);
        for (let i = 0; i < roundsToShow; i++) {
            const round = combatResult.rounds[i];
            if (round.attacker === 'player') {
                if (round.hit) {
                    text += `<span style="color: ${this.config.colors.playerHit}">→ Colpisci per ${round.damage} danni!</span><br>`;
                } else {
                    text += `<span style="color: ${this.config.colors.playerMiss}">→ Il tuo attacco manca!</span><br>`;
                }
            } else {
                if (round.hit) {
                    text += `<span style="color: ${this.config.colors.enemyHit}">← ${enemy.name} ti colpisce per ${round.damage} danni!</span><br>`;
                } else {
                    text += `<span style="color: ${this.config.colors.dodge}">← Schivi l'attacco!</span><br>`;
                }
            }
        }
        
        text += `<br><strong>`;
        if (combatResult.victory) {
            text += `<span style="color: ${this.config.colors.victory};">VITTORIA!</span></strong><br>`;
            text += `Hai sconfitto ${enemy.name}!<br>`;
            if (combatResult.expGained > 0) {
                text += `Guadagni ${combatResult.expGained} punti esperienza.<br>`;
            }
        } else {
            text += `<span style="color: ${this.config.colors.defeat};">SCONFITTA!</span></strong><br>`;
            text += `${enemy.name} ti ha sopraffatto!<br>`;
            text += `Subisci ${combatResult.damageTaken} danni totali.<br>`;
        }
        text += `</div>`;
        
        return text;
    },
    
    /**
     * Utility per delay
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
};

// Sostituisci la funzione esistente
if (typeof window !== 'undefined') {
    window.showCombatResultWithSuspense = function(combatResult, enemyName) {
        // Trova i dati completi del nemico
        let enemyData = null;
        
        // Cerca nel database nemici v1.0.0
        if (typeof ENEMY_DATABASE !== 'undefined') {
            for (const category in ENEMY_DATABASE) {
                for (const tier in ENEMY_DATABASE[category]) {
                    if (ENEMY_DATABASE[category][tier].name === enemyName) {
                        enemyData = ENEMY_DATABASE[category][tier];
                        break;
                    }
                }
                if (enemyData) break;
            }
        }
        
        // Fallback ai dati base
        if (!enemyData) {
            enemyData = { name: enemyName, hp: 20 };
        }
        
        // Usa il nuovo sistema visuale
        return CombatVisuals.showCombatWithNarrativeEffects(combatResult, enemyData);
    };
}

// Esporta per debug
window.CombatVisuals = CombatVisuals; 
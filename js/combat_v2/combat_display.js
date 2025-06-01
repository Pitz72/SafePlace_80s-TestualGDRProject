/**
 * THE SAFE PLACE - COMBAT DISPLAY V2.0
 * Sistema Visual e Animazioni
 * 
 * Display system dedicato senza conflitti DOM
 * Data: 1 Giugno 2025
 */

const CombatV2Display = {
    // Configurazione animazioni
    config: {
        roundDelay: 600,        // Delay tra round
        textSpeed: 80,          // Velocità testo (ms per carattere)
        suspenseTime: 2000,     // Pausa prima risultato
        resultDisplayTime: 3000, // Tempo visualizzazione risultato
        colors: {
            player: '#4ade80',      // Verde player
            enemy: '#ef4444',       // Rosso enemy
            critical: '#fbbf24',    // Oro critici
            miss: '#94a3b8',        // Grigio miss
            victory: '#22c55e',     // Verde vittoria
            defeat: '#dc2626'       // Rosso sconfitta
        }
    },
    
    /**
     * Mostra animazione combattimento completa
     * @param {Object} combatResult - Risultato combattimento
     * @param {Object} enemy - Dati nemico
     * @returns {Promise} Promise che si risolve quando animazione finisce
     */
    async showCombatAnimation(combatResult, enemy) {
        console.log('[COMBAT_V2_DISPLAY] Avvio animazione combattimento...');
        
        // Chiudi popup preparazione
        if (typeof closeEventPopup === 'function') {
            closeEventPopup();
        }
        
        // Piccola pausa per transizione
        await this.delay(300);
        
        // Crea popup combattimento dedicato
        await this.createCombatDisplay(combatResult, enemy);
        
        // Anima i round
        await this.animateRounds(combatResult.rounds, enemy);
        
        // Pausa suspense finale
        await this.delay(this.config.suspenseTime);
        
        console.log('[COMBAT_V2_DISPLAY] ✅ Animazione completata');
    },
    
    /**
     * Crea display dedicato per combattimento
     */
    async createCombatDisplay(combatResult, enemy) {
        const player = combatResult.player || { name: 'Ultimo', hp: 100, maxHp: 100 };
        
        const combatHTML = `
            <div class="combat-v2-display">
                <div class="combat-header">
                    <h2>⚔️ Combattimento in Corso</h2>
                    <div class="combat-info">Tier ${combatResult.tier || 1} - ${combatResult.rounds.length} round previsti</div>
                </div>
                
                <div class="combatants">
                    <div class="combatant player">
                        <div class="name">🟢 Ultimo</div>
                        <div class="hp-bar">
                            <div class="hp-fill player-hp" style="width: 100%; background: ${this.config.colors.player}"></div>
                            <span class="hp-text">${player.hp}/${player.maxHp}</span>
                        </div>
                    </div>
                    
                    <div class="vs-separator">⚡</div>
                    
                    <div class="combatant enemy">
                        <div class="name">🔴 ${enemy.name}</div>
                        <div class="hp-bar">
                            <div class="hp-fill enemy-hp" style="width: 100%; background: ${this.config.colors.enemy}"></div>
                            <span class="hp-text">${enemy.hp}/${enemy.hp}</span>
                        </div>
                    </div>
                </div>
                
                <div class="combat-log" id="combat-v2-log">
                    <div class="log-entry initial">🎲 Il combattimento sta per iniziare...</div>
                </div>
                
                <div class="combat-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" id="combat-progress-fill" style="width: 0%"></div>
                    </div>
                    <div class="progress-text">Preparazione...</div>
                </div>
            </div>
        `;
        
        if (typeof showEventPopup === 'function') {
            showEventPopup({
                title: "⚔️ Combattimento",
                description: combatHTML,
                isNarrative: true,
                noButtons: true
            });
        }
        
        // Breve pausa per mostrare setup
        await this.delay(800);
    },
    
    /**
     * Anima i round di combattimento
     */
    async animateRounds(rounds, enemy) {
        const logElement = document.getElementById('combat-v2-log');
        const progressFill = document.getElementById('combat-progress-fill');
        const playerHpBar = document.querySelector('.player-hp');
        const enemyHpBar = document.querySelector('.enemy-hp');
        const playerHpText = document.querySelector('.combatant.player .hp-text');
        const enemyHpText = document.querySelector('.combatant.enemy .hp-text');
        
        if (!logElement) {
            console.warn('[COMBAT_V2_DISPLAY] Log element non trovato');
            return;
        }
        
        // Traccia HP attuali
        let currentPlayerHp = 100;  // Valore iniziale, verrà aggiornato
        let currentEnemyHp = enemy.hp;
        
        for (let i = 0; i < rounds.length; i++) {
            const round = rounds[i];
            const progress = ((i + 1) / rounds.length) * 100;
            
            // Aggiorna barra progresso
            if (progressFill) {
                progressFill.style.width = progress + '%';
            }
            
            // Crea entry log
            const logEntry = this.createRoundLogEntry(round, i + 1);
            logElement.appendChild(logEntry);
            
            // Scroll automatico
            logElement.scrollTop = logElement.scrollHeight;
            
            // Aggiorna HP visuali se necessario
            if (round.attacker === 'player' && round.hit) {
                currentEnemyHp = Math.max(0, currentEnemyHp - round.damage);
                this.updateHpBar(enemyHpBar, enemyHpText, currentEnemyHp, enemy.hp);
            } else if (round.attacker === 'enemy' && round.hit) {
                currentPlayerHp = Math.max(0, currentPlayerHp - round.damage);
                this.updateHpBar(playerHpBar, playerHpText, currentPlayerHp, 100);
            }
            
            // Effetto flash per i colpi
            if (round.hit) {
                this.flashElement(round.attacker === 'player' ? enemyHpBar : playerHpBar, round.critical);
            }
            
            // Delay tra round
            await this.delay(this.config.roundDelay);
        }
        
        // Completa progress bar
        if (progressFill) {
            progressFill.style.width = '100%';
        }
    },
    
    /**
     * Crea entry log per un round
     */
    createRoundLogEntry(round, roundNumber) {
        const entry = document.createElement('div');
        entry.className = 'log-entry';
        
        let icon = '⚔️';
        let color = '#ffffff';
        let text = '';
        
        if (round.attacker === 'player') {
            if (round.hit) {
                icon = round.critical ? '⚡' : '🗡️';
                color = round.critical ? this.config.colors.critical : this.config.colors.player;
                text = `Round ${roundNumber}: ${round.critical ? 'CRITICO! ' : ''}Colpisci per ${round.damage} danni!`;
            } else {
                icon = '💨';
                color = this.config.colors.miss;
                text = `Round ${roundNumber}: Il tuo attacco manca!`;
            }
        } else if (round.attacker === 'enemy') {
            if (round.hit) {
                icon = round.critical ? '💥' : '🔥';
                color = round.critical ? this.config.colors.critical : this.config.colors.enemy;
                text = `Round ${roundNumber}: ${round.critical ? 'CRITICO! ' : ''}${round.description || 'Subisci ' + round.damage + ' danni'}!`;
            } else {
                icon = '🛡️';
                color = this.config.colors.miss;
                text = `Round ${roundNumber}: Schivi l'attacco!`;
            }
        }
        
        entry.innerHTML = `
            <span class="log-icon">${icon}</span>
            <span class="log-text" style="color: ${color}">${text}</span>
        `;
        
        entry.classList.add('fade-in');
        return entry;
    },
    
    /**
     * Aggiorna barra HP
     */
    updateHpBar(hpBar, hpText, currentHp, maxHp) {
        if (!hpBar || !hpText) return;
        
        const percentage = Math.max(0, (currentHp / maxHp) * 100);
        hpBar.style.width = percentage + '%';
        hpText.textContent = `${Math.max(0, Math.floor(currentHp))}/${maxHp}`;
        
        // Cambio colore in base alla percentuale
        if (percentage > 60) {
            hpBar.style.background = '#4ade80';
        } else if (percentage > 30) {
            hpBar.style.background = '#fbbf24';
        } else {
            hpBar.style.background = '#ef4444';
        }
    },
    
    /**
     * Effetto flash per i colpi
     */
    flashElement(element, isCritical = false) {
        if (!element) return;
        
        const originalBox = element.style.boxShadow;
        const flashColor = isCritical ? this.config.colors.critical : '#ffffff';
        
        element.style.boxShadow = `0 0 15px ${flashColor}`;
        element.style.transform = 'scale(1.05)';
        
        setTimeout(() => {
            element.style.boxShadow = originalBox;
            element.style.transform = 'scale(1)';
        }, 300);
    },
    
    /**
     * Mostra risultato finale
     */
    async showFinalResult(combatResult, enemy) {
        console.log('[COMBAT_V2_DISPLAY] Mostrando risultato finale...');
        
        // Chiudi popup combattimento
        if (typeof closeEventPopup === 'function') {
            closeEventPopup();
        }
        
        // Pausa per transizione
        await this.delay(500);
        
        // Prepara contenuto risultato
        const title = combatResult.victory ? "🎉 VITTORIA!" : "💀 SCONFITTA";
        const titleColor = combatResult.victory ? this.config.colors.victory : this.config.colors.defeat;
        
        let resultHTML = `
            <div class="combat-v2-result">
                <div class="result-header">
                    <h2 style="color: ${titleColor}">${title}</h2>
                    <div class="result-subtitle">Combattimento vs ${enemy.name}</div>
                </div>
                
                <div class="result-stats">
                    <div class="stat-row">
                        <span class="stat-label">⚔️ Danni inflitti:</span>
                        <span class="stat-value">${combatResult.damageDealt}</span>
                    </div>
                    <div class="stat-row">
                        <span class="stat-label">💔 Danni subiti:</span>
                        <span class="stat-value">${combatResult.damageTaken}</span>
                    </div>
                    <div class="stat-row">
                        <span class="stat-label">🔄 Round totali:</span>
                        <span class="stat-value">${combatResult.roundsCount}</span>
                    </div>
        `;
        
        if (combatResult.victory && combatResult.expGained > 0) {
            resultHTML += `
                    <div class="stat-row victory">
                        <span class="stat-label">✨ Esperienza:</span>
                        <span class="stat-value">+${combatResult.expGained}</span>
                    </div>
            `;
        }
        
        resultHTML += `
                </div>
                
                <div class="result-footer">
                    <div class="result-message">
                        ${combatResult.victory ? 
                            'Hai dimostrato le tue abilità in combattimento!' : 
                            'Non tutto è perduto. Impara da questa esperienza.'}
                    </div>
                </div>
            </div>
        `;
        
        // Mostra risultato
        if (typeof showEventPopup === 'function') {
            showEventPopup({
                title: title,
                description: resultHTML,
                isOutcome: true
            });
        }
        
        // Tempo per visualizzare risultato
        await this.delay(this.config.resultDisplayTime);
        
        console.log('[COMBAT_V2_DISPLAY] ✅ Risultato mostrato');
    },
    
    /**
     * Utility delay
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
};

// Export globale
window.CombatV2Display = CombatV2Display;

console.log('[COMBAT_V2] ✅ Display system caricato - Animazioni dedicate'); 
/**
 * THE SAFE PLACE - COMBAT SYSTEM V2.0
 * Controller Principale - API Pulita
 * 
 * Ricostruzione completa del sistema combat senza dipendenze legacy
 * Data: 1 Giugno 2025
 */

console.log('[COMBAT_V2] Caricamento Combat System V2.0...');

const CombatV2 = {
    // Flag di controllo
    isActive: false,
    currentCombat: null,
    
    // Configurazione
    config: {
        useV2: true,  // Flag principale per abilitare/disabilitare V2
        preparationTime: 2000,  // 2 secondi preparazione
        roundDelay: 600,        // 600ms tra round
        resultTime: 3000,       // 3 secondi per vedere risultato
        debugMode: true         // Debug logs
    },
    
    /**
     * API PRINCIPALE - Avvia combattimento
     * @param {Object} player - Dati player
     * @param {Object} enemy - Dati nemico
     * @param {Object} options - Opzioni aggiuntive
     * @returns {Promise<Object>} Risultato combattimento
     */
    async startCombat(player, enemy, options = {}) {
        if (this.isActive) {
            console.warn('[COMBAT_V2] Combattimento già in corso, saltando...');
            return null;
        }
        
        this.log(`🚀 Avvio combattimento: ${player.name || 'Ultimo'} vs ${enemy.name}`);
        this.isActive = true;
        
        try {
            // Step 1: Preparazione 
            await this.showPreparation(player, enemy);
            
            // Step 2: Calcolo combattimento
            const combatResult = CombatV2Engine.resolveCombat(player, enemy, options);
            this.currentCombat = combatResult;
            
            // Step 3: Animazione visual
            await CombatV2Display.showCombatAnimation(combatResult, enemy);
            
            // Step 4: Risultato finale
            await CombatV2Display.showFinalResult(combatResult, enemy);
            
            // Step 5: Integrazione con gioco
            this.applyResults(combatResult, player, enemy);
            
            this.log('✅ Combattimento completato con successo');
            return combatResult;
            
        } catch (error) {
            console.error('[COMBAT_V2] Errore durante combattimento:', error);
            return this.handleError(player, enemy, error);
        } finally {
            this.isActive = false;
            this.currentCombat = null;
        }
    },
    
    /**
     * Mostra schermata di preparazione
     */
    async showPreparation(player, enemy) {
        this.log('⚔️ Mostrando preparazione combattimento...');
        
        // Chiudi popup esistenti
        if (typeof closeEventPopup === 'function') {
            closeEventPopup();
        }
        
        // Aspetta un momento per transizione pulita
        await this.delay(200);
        
        // Mostra popup preparazione
        const preparationHTML = `
            <div class="combat-v2-preparation">
                <h2>⚔️ Preparazione al Combattimento</h2>
                <div class="combat-participants">
                    <div class="participant player">
                        <div class="name">Ultimo</div>
                        <div class="hp">${player.hp}/${player.maxHp} HP</div>
                        <div class="equipment">
                            <div>🗡️ ${this.getWeaponName(player)}</div>
                            <div>🛡️ ${this.getArmorName(player)}</div>
                        </div>
                    </div>
                    <div class="vs">VS</div>
                    <div class="participant enemy">
                        <div class="name">${enemy.name}</div>
                        <div class="hp">${enemy.hp} HP</div>
                        <div class="tier">Tier ${enemy.tier || 1}</div>
                    </div>
                </div>
                <div class="preparation-status">
                    <div class="loading-bar">
                        <div class="loading-fill"></div>
                    </div>
                    <div class="status-text">Analizzando nemico e preparando strategia...</div>
                </div>
            </div>
        `;
        
        if (typeof showEventPopup === 'function') {
            showEventPopup({
                title: "⚔️ Preparazione Combattimento",
                description: preparationHTML,
                isNarrative: true,
                noButtons: true  // Nessun bottone, gestito automaticamente
            });
        }
        
        // Aspetta tempo di preparazione
        await this.delay(this.config.preparationTime);
        this.log('✅ Preparazione completata');
    },
    
    /**
     * Applica risultati al game state
     */
    applyResults(combatResult, player, enemy) {
        this.log('🔧 Applicando risultati al gioco...');
        
        // Aggiorna HP player
        if (typeof player === 'object' && combatResult.finalPlayerHP !== undefined) {
            player.hp = Math.max(1, combatResult.finalPlayerHP);
            this.log(`HP Player: ${combatResult.finalPlayerHP}`);
        }
        
        // Esperienza se vittoria
        if (combatResult.victory && combatResult.expGained > 0) {
            if (typeof awardExperience === 'function') {
                awardExperience(combatResult.expGained, `vittoria contro ${enemy.name}`);
                this.log(`EXP Guadagnata: +${combatResult.expGained}`);
            }
        }
        
        // Loot casuale
        if (combatResult.victory && enemy.lootTable) {
            this.handleLoot(enemy.lootTable);
        }
        
        // Usura equipaggiamento
        if (typeof applyWearToEquippedItem === 'function' && player.equippedWeapon) {
            applyWearToEquippedItem('equippedWeapon', 1);
            this.log('Usura arma applicata');
        }
        
        // Aggiorna UI
        if (typeof updateUI === 'function') {
            updateUI();
        }
    },
    
    /**
     * Gestisce loot drop
     */
    handleLoot(lootTable) {
        Object.keys(lootTable).forEach(itemId => {
            const dropChance = lootTable[itemId];
            if (Math.random() < dropChance) {
                if (typeof applyChoiceReward === 'function') {
                    applyChoiceReward({ itemId: itemId, quantity: 1 });
                    this.log(`Loot ottenuto: ${itemId}`);
                }
            }
        });
    },
    
    /**
     * Gestione errori
     */
    handleError(player, enemy, error) {
        console.error('[COMBAT_V2] Fallback per errore:', error);
        
        // Genera risultato semplice di fallback
        const fallbackResult = {
            victory: Math.random() > 0.3,
            rounds: [],
            finalPlayerHP: player.hp - Math.floor(Math.random() * 10),
            finalEnemyHP: 0,
            damageDealt: Math.floor(Math.random() * 15) + 5,
            damageTaken: Math.floor(Math.random() * 10),
            expGained: Math.floor(Math.random() * 10) + 5
        };
        
        // Mostra risultato semplice
        setTimeout(() => {
            if (typeof showEventPopup === 'function') {
                showEventPopup({
                    title: fallbackResult.victory ? "⚔️ Vittoria" : "💀 Sconfitta",
                    description: `Combattimento contro ${enemy.name} ${fallbackResult.victory ? 'vinto' : 'perso'}!`,
                    isOutcome: true
                });
            }
        }, 500);
        
        return fallbackResult;
    },
    
    /**
     * Utility functions
     */
    getWeaponName(player) {
        if (player.equippedWeapon?.itemId) {
            // Cerca nel database oggetti
            if (typeof ITEMS_DATABASE !== 'undefined' && ITEMS_DATABASE[player.equippedWeapon.itemId]) {
                return ITEMS_DATABASE[player.equippedWeapon.itemId].name;
            }
        }
        return 'Mani nude';
    },
    
    getArmorName(player) {
        if (player.equippedArmor?.itemId) {
            if (typeof ITEMS_DATABASE !== 'undefined' && ITEMS_DATABASE[player.equippedArmor.itemId]) {
                return ITEMS_DATABASE[player.equippedArmor.itemId].name;
            }
        }
        return 'Nessuna armatura';
    },
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },
    
    log(message) {
        if (this.config.debugMode) {
            console.log(`[COMBAT_V2] ${message}`);
        }
    },
    
    /**
     * Debug functions
     */
    test(enemyType = 'easy') {
        this.log('🧪 Test combattimento...');
        
        // Nemico di test
        let enemy = null;
        if (typeof ENEMY_DATABASE !== 'undefined') {
            enemy = ENEMY_DATABASE.BANDIT?.[enemyType] || ENEMY_DATABASE.BANDIT?.easy;
        }
        
        if (!enemy) {
            enemy = { name: 'Bandito Test', hp: 20, attack: 5, defense: 2, tier: 1 };
        }
        
        // Avvia test
        if (typeof player !== 'undefined') {
            this.startCombat(player, enemy, { test: true });
        } else {
            console.error('[COMBAT_V2] Player non definito per test');
        }
    },
    
    status() {
        console.log('🎯 === COMBAT V2.0 STATUS ===');
        console.log('useV2:', this.config.useV2);
        console.log('isActive:', this.isActive);
        console.log('currentCombat:', this.currentCombat ? 'In corso' : 'Nessuno');
        console.log('Engine:', typeof CombatV2Engine !== 'undefined' ? 'Caricato' : 'NON CARICATO');
        console.log('Display:', typeof CombatV2Display !== 'undefined' ? 'Caricato' : 'NON CARICATO');
        console.log('Player:', typeof player !== 'undefined' ? 'Definito' : 'NON DEFINITO');
        console.log('Enemy DB:', typeof ENEMY_DATABASE !== 'undefined' ? 'Disponibile' : 'NON DISPONIBILE');
        console.log('===========================');
    },
    
    reset() {
        this.isActive = false;
        this.currentCombat = null;
        this.log('🔄 Sistema resettato');
    }
};

// Export globale
window.CombatV2 = CombatV2;

console.log('[COMBAT_V2] ✅ Controller caricato - API: CombatV2.startCombat(player, enemy)'); 
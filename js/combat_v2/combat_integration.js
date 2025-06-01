/**
 * THE SAFE PLACE - COMBAT INTEGRATION V2.0
 * Integrazione con Gioco Esistente
 * 
 * Hook system per intercettare combattimenti e usare V2
 * Data: 1 Giugno 2025
 */

const CombatV2Integration = {
    // Flag di controllo
    enabled: true,
    originalFunctions: {},
    hooked: false,
    
    /**
     * Inizializza integrazione con sistema esistente
     */
    initialize() {
        console.log('[COMBAT_V2_INTEGRATION] Inizializzando integrazione...');
        
        if (this.hooked) {
            console.log('[COMBAT_V2_INTEGRATION] Già integrato, saltando...');
            return;
        }
        
        // Hook del sistema v1_ultimate_fix
        this.hookV1System();
        
        // Hook diretto handleEventChoice se disponibile
        this.hookEventChoice();
        
        // Flag per debug
        window.COMBAT_V2_ENABLED = true;
        
        this.hooked = true;
        console.log('[COMBAT_V2_INTEGRATION] ✅ Integrazione completata');
    },
    
    /**
     * Hook del sistema v1_ultimate_fix esistente
     */
    hookV1System() {
        // Intercetta e disabilita il sistema combat in v1_ultimate_fix
        if (typeof window.V1_ULTIMATE !== 'undefined' && window.V1_ULTIMATE.testCombat) {
            this.originalFunctions.v1TestCombat = window.V1_ULTIMATE.testCombat;
            
            // Override del test combat V1
            window.V1_ULTIMATE.testCombat = function() {
                console.log('[COMBAT_V2_INTEGRATION] Reindirizzando V1.testCombat a V2...');
                if (typeof CombatV2 !== 'undefined') {
                    CombatV2.test();
                } else {
                    console.error('[COMBAT_V2_INTEGRATION] CombatV2 non disponibile');
                }
            };
            
            console.log('[COMBAT_V2_INTEGRATION] Hook V1_ULTIMATE.testCombat attivo');
        }
    },
    
    /**
     * Hook principale del sistema handleEventChoice
     */
    hookEventChoice() {
        if (typeof window.handleEventChoice === 'function') {
            this.originalFunctions.handleEventChoice = window.handleEventChoice;
            
            const self = this;
            window.handleEventChoice = function(choiceIndex) {
                const choice = currentEventChoices?.[choiceIndex];
                const eventType = currentEventContext?.type;
                
                console.log(`[COMBAT_V2_INTEGRATION] Scelta intercettata: "${choice?.text}" Type: ${eventType}`);
                
                // Rileva combattimento
                const isCombat = choice && (
                    choice.usesWeapon || 
                    choice.actionKey === 'lotta' || 
                    choice.actionKey === 'attacca' || 
                    choice.text.toLowerCase().includes('combatt') ||
                    choice.text.toLowerCase().includes('attacc') ||
                    choice.text.toLowerCase().includes('lotta')
                );
                
                if (isCombat && self.enabled && typeof CombatV2 !== 'undefined') {
                    console.log('[COMBAT_V2_INTEGRATION] 🎯 Reindirizzando a Combat V2.0...');
                    
                    // Seleziona nemico appropriato
                    const enemy = self.selectEnemyByEventType(eventType);
                    
                    if (enemy && typeof player !== 'undefined') {
                        // Usa il nuovo sistema V2
                        CombatV2.startCombat(player, enemy, { 
                            source: 'event',
                            eventType: eventType,
                            choiceText: choice.text
                        });
                        
                        // NON chiamare la funzione originale
                        return;
                    } else {
                        console.warn('[COMBAT_V2_INTEGRATION] Fallback a sistema originale - nemico o player non trovato');
                    }
                }
                
                // Fallback alla funzione originale
                return self.originalFunctions.handleEventChoice.call(this, choiceIndex);
            };
            
            console.log('[COMBAT_V2_INTEGRATION] Hook handleEventChoice attivo');
        } else {
            console.warn('[COMBAT_V2_INTEGRATION] handleEventChoice non trovato');
        }
    },
    
    /**
     * Seleziona nemico appropriato in base al tipo di evento
     */
    selectEnemyByEventType(eventType) {
        let enemy = null;
        
        if (typeof ENEMY_DATABASE !== 'undefined') {
            // Usa il database moderno
            if (eventType === 'PREDATOR') {
                const categories = ['BANDIT', 'RAIDER', 'SCAVENGER'];
                const randomCategory = categories[Math.floor(Math.random() * categories.length)];
                const tiers = ['easy', 'standard', 'hard'];
                const randomTier = tiers[Math.floor(Math.random() * tiers.length)];
                enemy = ENEMY_DATABASE[randomCategory]?.[randomTier];
            } else if (eventType === 'ANIMAL') {
                const tiers = ['easy', 'standard', 'hard'];
                const randomTier = tiers[Math.floor(Math.random() * tiers.length)];
                enemy = ENEMY_DATABASE.BEAST?.[randomTier];
            } else if (eventType === 'HORROR') {
                const categories = ['MUTANT', 'DRONE'];
                const randomCategory = categories[Math.floor(Math.random() * categories.length)];
                const tiers = ['standard', 'hard'];
                const randomTier = tiers[Math.floor(Math.random() * tiers.length)];
                enemy = ENEMY_DATABASE[randomCategory]?.[randomTier];
            } else {
                // Nemico casuale
                const allCategories = Object.keys(ENEMY_DATABASE);
                const randomCategory = allCategories[Math.floor(Math.random() * allCategories.length)];
                const availableTiers = Object.keys(ENEMY_DATABASE[randomCategory]);
                const randomTier = availableTiers[Math.floor(Math.random() * availableTiers.length)];
                enemy = ENEMY_DATABASE[randomCategory][randomTier];
            }
        } else if (typeof ENEMY_DATA !== 'undefined') {
            // Fallback al database vecchio
            if (eventType === 'PREDATOR') {
                enemy = ENEMY_DATA.predators?.standard || ENEMY_DATA.bandits?.standard;
            } else if (eventType === 'ANIMAL') {
                enemy = ENEMY_DATA.animals?.standard || ENEMY_DATA.beasts?.standard;
            } else if (eventType === 'HORROR') {
                enemy = ENEMY_DATA.special?.zone_horror || ENEMY_DATA.mutants?.standard;
            } else {
                enemy = ENEMY_DATA.predators?.standard;
            }
        }
        
        // Fallback nemico generico se non trovato
        if (!enemy) {
            enemy = {
                name: 'Vagabondo Ostile',
                hp: 25,
                attack: 6,
                defense: 3,
                tier: 1,
                critChance: 0.1,
                lootTable: {
                    'cibo_scatoletta': 0.3,
                    'materiali_metallo': 0.2
                }
            };
        }
        
        console.log(`[COMBAT_V2_INTEGRATION] Nemico selezionato: ${enemy.name} (${eventType})`);
        return enemy;
    },
    
    /**
     * Disabilita temporaneamente l'integrazione V2
     */
    disable() {
        this.enabled = false;
        window.COMBAT_V2_ENABLED = false;
        console.log('[COMBAT_V2_INTEGRATION] ⚠️ Combat V2 disabilitato - usando sistema legacy');
    },
    
    /**
     * Riabilita l'integrazione V2
     */
    enable() {
        this.enabled = true;
        window.COMBAT_V2_ENABLED = true;
        console.log('[COMBAT_V2_INTEGRATION] ✅ Combat V2 riabilitato');
    },
    
    /**
     * Ripristina funzioni originali (per rollback completo)
     */
    restore() {
        if (this.originalFunctions.handleEventChoice) {
            window.handleEventChoice = this.originalFunctions.handleEventChoice;
            console.log('[COMBAT_V2_INTEGRATION] handleEventChoice ripristinato');
        }
        
        if (this.originalFunctions.v1TestCombat && window.V1_ULTIMATE) {
            window.V1_ULTIMATE.testCombat = this.originalFunctions.v1TestCombat;
            console.log('[COMBAT_V2_INTEGRATION] V1_ULTIMATE.testCombat ripristinato');
        }
        
        this.enabled = false;
        this.hooked = false;
        window.COMBAT_V2_ENABLED = false;
        console.log('[COMBAT_V2_INTEGRATION] 🔄 Rollback completato - sistema originale ripristinato');
    },
    
    /**
     * Status dell'integrazione
     */
    status() {
        console.log('🔗 === COMBAT V2 INTEGRATION STATUS ===');
        console.log('Enabled:', this.enabled);
        console.log('Hooked:', this.hooked);
        console.log('handleEventChoice hooked:', !!this.originalFunctions.handleEventChoice);
        console.log('V1_ULTIMATE hooked:', !!this.originalFunctions.v1TestCombat);
        console.log('CombatV2 available:', typeof CombatV2 !== 'undefined');
        console.log('ENEMY_DATABASE available:', typeof ENEMY_DATABASE !== 'undefined');
        console.log('Player available:', typeof player !== 'undefined');
        console.log('=======================================');
    }
};

// Auto-inizializzazione quando tutti i moduli sono caricati
setTimeout(() => {
    if (typeof CombatV2 !== 'undefined' && typeof CombatV2Engine !== 'undefined' && typeof CombatV2Display !== 'undefined') {
        CombatV2Integration.initialize();
    } else {
        console.warn('[COMBAT_V2_INTEGRATION] Moduli Combat V2 non completi, aspettando...');
        
        // Riprova dopo 2 secondi
        setTimeout(() => {
            if (typeof CombatV2 !== 'undefined') {
                CombatV2Integration.initialize();
            }
        }, 2000);
    }
}, 500);

// Export globale
window.CombatV2Integration = CombatV2Integration;

console.log('[COMBAT_V2] ✅ Integration system caricato - Hook automatici attivi'); 
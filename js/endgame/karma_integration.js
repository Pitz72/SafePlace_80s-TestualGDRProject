/**
 * THE SAFE PLACE - KARMA INTEGRATION SYSTEM
 * FASE 6: MULTIPLE ENDINGS SYSTEM v1.0
 * 
 * Sistema di integrazione che collega il tracking del karma
 * con tutti gli eventi esistenti del gioco per determinare i finali.
 */

window.KarmaIntegration = {
    
    // === STATO INTEGRAZIONE ===
    isInitialized: false,
    choicesAnalyzed: 0,
    lastAnalyzedChoice: null,
    
    // === INIZIALIZZAZIONE ===
    
    /**
     * Inizializza l'integrazione del sistema karma
     */
    init() {
        if (this.isInitialized) return;
        
        console.log('[KARMA_INTEGRATION] Inizializzando sistema di integrazione...');
        
        // Hook nei sistemi esistenti
        this.hookIntoExistingEvents();
        this.hookIntoCombatSystem();
        this.hookIntoLoreEvents();
        this.hookIntoItemActions();
        
        // Setup controlli automatici
        this.setupPeriodicChecks();
        
        this.isInitialized = true;
        console.log('[KARMA_INTEGRATION] Sistema di integrazione inizializzato');
    },
    
    /**
     * Collega il sistema agli eventi esistenti
     */
    hookIntoExistingEvents() {
        // Hook nel sistema eventi principale
        const originalHandleEventChoice = window.handleEventChoice;
        if (originalHandleEventChoice) {
            window.handleEventChoice = (choiceIndex) => {
                this.analyzeEventChoice(choiceIndex);
                return originalHandleEventChoice.call(window, choiceIndex);
            };
        }
        
        // Hook nel sistema eventi V2
        const originalProcessChoice = window.EventEngineV2?.processChoice;
        if (originalProcessChoice) {
            window.EventEngineV2.processChoice = (choiceData) => {
                this.analyzeV2EventChoice(choiceData);
                return originalProcessChoice.call(window.EventEngineV2, choiceData);
            };
        }
        
        console.log('[KARMA_INTEGRATION] Collegato ai sistemi eventi');
    },
    
    /**
     * Collega il sistema al combattimento
     */
    hookIntoCombatSystem() {
        // Hook nel sistema combattimento V2
        const originalCombatEnd = window.CombatControllerV2?.endCombat;
        if (originalCombatEnd) {
            window.CombatControllerV2.endCombat = (result) => {
                this.analyzeCombatResult(result);
                return originalCombatEnd.call(window.CombatControllerV2, result);
            };
        }
        
        // Hook nel sistema combattimento legacy
        const originalAttackEnemy = window.attackEnemy;
        if (originalAttackEnemy) {
            window.attackEnemy = (enemy) => {
                const result = originalAttackEnemy.call(window, enemy);
                if (result && enemy.hp <= 0) {
                    window.KarmaTracker.defeatedEnemy(enemy.type || 'unknown', 'combat');
                }
                return result;
            };
        }
        
        console.log('[KARMA_INTEGRATION] Collegato al sistema combattimento');
    },
    
    /**
     * Collega il sistema agli eventi lore
     */
    hookIntoLoreEvents() {
        // Hook nel LoreEventManager
        const originalProcessLoreChoice = window.LoreEventManager?.processChoice;
        if (originalProcessLoreChoice) {
            window.LoreEventManager.processChoice = (choice, eventData) => {
                this.analyzeLoreChoice(choice, eventData);
                return originalProcessLoreChoice.call(window.LoreEventManager, choice, eventData);
            };
        }
        
        console.log('[KARMA_INTEGRATION] Collegato agli eventi lore');
    },
    
    /**
     * Collega il sistema alle azioni degli oggetti
     */
    hookIntoItemActions() {
        // Hook nell'uso degli oggetti
        const originalUseItem = window.useItem;
        if (originalUseItem) {
            window.useItem = (item) => {
                this.analyzeItemUsage(item);
                return originalUseItem.call(window, item);
            };
        }
        
        console.log('[KARMA_INTEGRATION] Collegato alle azioni oggetti');
    },
    
    // === ANALISI SCELTE ===
    
    /**
     * Analizza una scelta negli eventi principali
     */
    analyzeEventChoice(choiceIndex) {
        const currentEvent = window.currentEvent;
        if (!currentEvent || !currentEvent.choices) return;
        
        const choice = currentEvent.choices[choiceIndex];
        if (!choice) return;
        
        this.choicesAnalyzed++;
        this.lastAnalyzedChoice = choice;
        
        // Analisi basata su keywords
        this.analyzeChoiceByKeywords(choice.text, choice);
        
        // Analisi basata su effetti
        if (choice.effects) {
            this.analyzeChoiceByEffects(choice.effects);
        }
        
        console.log(`[KARMA_INTEGRATION] Analizzata scelta evento: "${choice.text}"`);
    },
    
    /**
     * Analizza una scelta negli eventi V2
     */
    analyzeV2EventChoice(choiceData) {
        if (!choiceData) return;
        
        this.choicesAnalyzed++;
        this.lastAnalyzedChoice = choiceData;
        
        // Analisi basata sul tipo di scelta
        if (choiceData.type) {
            this.analyzeChoiceByType(choiceData.type, choiceData);
        }
        
        // Analisi basata su keywords nel testo
        if (choiceData.text) {
            this.analyzeChoiceByKeywords(choiceData.text, choiceData);
        }
        
        console.log(`[KARMA_INTEGRATION] Analizzata scelta V2: "${choiceData.text || choiceData.type}"`);
    },
    
    /**
     * Analizza scelte basate su keywords nel testo
     */
    analyzeChoiceByKeywords(choiceText, choice) {
        const text = choiceText.toLowerCase();
        
        // Keywords positive (karma +)
        const positiveKeywords = [
            'aiuta', 'aiuto', 'condividi', 'dona', 'salva', 'proteggi', 'cura', 'guarisci',
            'compassione', 'gentile', 'generoso', 'pacifico', 'diplomatic', 'negozia',
            'perdona', 'comprendi', 'sostieni', 'incoraggia', 'coopera', 'unisci'
        ];
        
        // Keywords negative (karma -)
        const negativeKeywords = [
            'uccidi', 'ruba', 'minaccia', 'abbandona', 'scappa', 'tradisci', 'inganno',
            'violento', 'aggressivo', 'spietato', 'crudele', 'ignora', 'respingi',
            'mentisci', 'manipola', 'sfrutta', 'distruggi', 'attacca', 'vendetta'
        ];
        
        // Keywords leadership
        const leadershipKeywords = [
            'guida', 'leader', 'comando', 'organizza', 'coordina', 'decide',
            'responsabilità', 'ispira', 'motiva', 'pianifica', 'strategia'
        ];
        
        // Keywords warrior
        const warriorKeywords = [
            'combatti', 'lotta', 'battaglia', 'guerra', 'arma', 'difendi',
            'attacco', 'soldato', 'guerriero', 'nemico', 'sconfitta'
        ];
        
        // Keywords research/science
        const researchKeywords = [
            'studia', 'analizza', 'ricerca', 'scopri', 'investiga', 'esamina',
            'documento', 'dati', 'scienza', 'tecnologia', 'laboratorio'
        ];
        
        // Applica karma basato sulle keywords
        let karmaChange = 0;
        let reason = '';
        let category = 'general';
        
        // Check positive
        for (let keyword of positiveKeywords) {
            if (text.includes(keyword)) {
                karmaChange += 2;
                reason = `Scelta compassionevole: ${keyword}`;
                category = 'compassion';
                break;
            }
        }
        
        // Check negative
        for (let keyword of negativeKeywords) {
            if (text.includes(keyword)) {
                karmaChange -= 2;
                reason = `Scelta spietata: ${keyword}`;
                category = 'survival';
                
                // Potrebbe essere disperazione
                if (text.includes('necessario') || text.includes('sopravvivenza')) {
                    window.KarmaTracker.desperateChoice(keyword, choiceText);
                }
                break;
            }
        }
        
        // Check leadership
        for (let keyword of leadershipKeywords) {
            if (text.includes(keyword)) {
                window.KarmaTracker.addLeadership('decision_making', choiceText);
                reason = `Leadership dimostrata: ${keyword}`;
                break;
            }
        }
        
        // Check warrior
        for (let keyword of warriorKeywords) {
            if (text.includes(keyword)) {
                window.KarmaTracker.addWarriorFlag('combat_choice', choiceText);
                break;
            }
        }
        
        // Check research
        for (let keyword of researchKeywords) {
            if (text.includes(keyword)) {
                window.KarmaTracker.addResearchItem('text_choice', choiceText);
                break;
            }
        }
        
        // Applica karma se c'è un cambiamento
        if (karmaChange !== 0) {
            window.KarmaTracker.addKarma(karmaChange, reason, category);
        }
    },
    
    /**
     * Analizza scelte basate sugli effetti
     */
    analyzeChoiceByEffects(effects) {
        if (!effects) return;
        
        // Analizza effetti su HP
        if (effects.hp) {
            if (effects.hp > 0) {
                window.KarmaTracker.addHope(1, 'Recupero HP da scelta');
            } else {
                window.KarmaTracker.addTrauma('self_harm', 'Scelta che causa danno');
            }
        }
        
        // Analizza guadagno/perdita oggetti
        if (effects.removeItem) {
            if (effects.removeItem.includes('food') || effects.removeItem.includes('water')) {
                // Potrebbe essere condivisione o spreco
                window.KarmaTracker.addKarma(1, 'Condivisione risorse', 'compassion');
            }
        }
        
        if (effects.addItem) {
            if (effects.addItem.includes('research') || effects.addItem.includes('document')) {
                window.KarmaTracker.addResearchItem(effects.addItem, 'Trovato tramite scelta');
            }
        }
        
        // Analizza effetti su stats
        if (effects.stats) {
            Object.keys(effects.stats).forEach(stat => {
                const change = effects.stats[stat];
                if (stat === 'charisma' && change > 0) {
                    window.KarmaTracker.addLeadership('charisma_boost', 'Miglioramento carisma');
                } else if (stat === 'strength' && change > 0) {
                    window.KarmaTracker.addWarriorFlag('strength_boost', 'Miglioramento forza');
                }
            });
        }
    },
    
    /**
     * Analizza l'uso di un oggetto
     */
    analyzeItemUsage(item) {
        if (!item) return;
        
        const itemName = item.name || item.id || '';
        const itemType = item.type || '';
        
        // Oggetti medici = compassione
        if (itemType === 'medical' || itemName.includes('medic') || itemName.includes('heal')) {
            window.KarmaTracker.addKarma(1, `Uso oggetto medico: ${itemName}`, 'compassion');
        }
        
        // Oggetti di ricerca
        if (itemType === 'research' || itemName.includes('document') || itemName.includes('data')) {
            window.KarmaTracker.addResearchItem(item.id, `Utilizzato: ${itemName}`);
        }
        
        // Armi = warrior
        if (itemType === 'weapon') {
            window.KarmaTracker.addWarriorFlag('weapon_usage', `Utilizzata arma: ${itemName}`);
        }
        
        // Cibo condiviso vs consumato da soli
        if (itemType === 'food' && window.nearbyNPCs && window.nearbyNPCs.length > 0) {
            window.KarmaTracker.addKarma(2, 'Condivisione cibo con altri', 'compassion');
        }
    },
    
    /**
     * Analizza risultati di combattimento
     */
    analyzeCombatResult(result) {
        if (!result) return;
        
        if (result.victory) {
            const enemy = result.enemy || {};
            const method = result.method || 'combat';
            
            // Determina il metodo morale
            let moralMethod = 'self_defense';
            if (result.wasAggressor) {
                moralMethod = 'violence';
            } else if (result.protectedOthers) {
                moralMethod = 'protection_others';
            }
            
            window.KarmaTracker.defeatedEnemy(enemy.type || 'unknown', moralMethod);
        }
        
        if (result.fled) {
            window.KarmaTracker.addKarma(-1, 'Fuga da combattimento', 'survival');
        }
    },
    
    /**
     * Analizza scelte lore
     */
    analyzeLoreChoice(choice, eventData) {
        if (!choice || !eventData) return;
        
        // Gli eventi lore spesso rivelano informazioni sul mondo
        window.KarmaTracker.addHope(0.5, `Evento lore: ${eventData.title || 'sconosciuto'}`);
        
        // Se è un evento traumatico
        if (eventData.type === 'traumatic' || eventData.title?.includes('morte')) {
            window.KarmaTracker.addTrauma('lore_revelation', eventData.title);
        }
    },
    
    /**
     * Analizza scelte per tipo
     */
    analyzeChoiceByType(type, choiceData) {
        switch(type) {
            case 'help_survivor':
                window.KarmaTracker.helpedSurvivor('unknown', 'assistance');
                break;
            case 'help_group':
                window.KarmaTracker.helpedGroup('unknown', 1);
                break;
            case 'combat_aggressive':
                window.KarmaTracker.addKarma(-2, 'Aggressione in combattimento', 'survival');
                break;
            case 'combat_defensive':
                window.KarmaTracker.addKarma(1, 'Difesa in combattimento', 'survival');
                break;
            case 'leadership_decision':
                window.KarmaTracker.addLeadership('event_decision', choiceData.text);
                break;
            case 'research_action':
                window.KarmaTracker.addResearchItem('event_research', choiceData.text);
                break;
        }
    },
    
    // === CONTROLLI AUTOMATICI ===
    
    /**
     * Setup controlli periodici per condizioni speciali
     */
    setupPeriodicChecks() {
        setInterval(() => {
            this.checkSpecialConditions();
        }, 30000); // Ogni 30 secondi
    },
    
    /**
     * Controlla condizioni speciali che influenzano il karma
     */
    checkSpecialConditions() {
        if (!window.player) return;
        
        // Check salute critica
        if (window.player.hp <= 20 && !window.KarmaTracker.hasFlag('critical_health_trauma')) {
            window.KarmaTracker.addTrauma('critical_health', 'Salute critica raggiunta');
            window.KarmaTracker.setFlag('critical_health_trauma', true);
        }
        
        // Check sopravvivenza lunga
        if (window.daysSurvived >= 10 && !window.KarmaTracker.hasFlag('long_survival')) {
            window.KarmaTracker.addHope(3, 'Sopravvivenza prolungata');
            window.KarmaTracker.setFlag('long_survival', true);
        }
        
        // Check prossimità al Safe Place
        if (window.player && window.player.x >= 180 && window.player.y >= 180) {
            if (!window.KarmaTracker.hasFlag('near_safe_place')) {
                window.KarmaTracker.addHope(5, 'Vicino al Safe Place');
                window.KarmaTracker.setFlag('near_safe_place', true);
            }
        }
    },
    
    // === UTILITY E DEBUGGING ===
    
    /**
     * Restituisce un report delle scelte analizzate
     */
    getChoicesReport() {
        const karma = window.KarmaTracker.getFullReport();
        
        return {
            choicesAnalyzed: this.choicesAnalyzed,
            lastChoice: this.lastAnalyzedChoice,
            karmaReport: karma,
            predictedEnding: this.predictEnding()
        };
    },
    
    /**
     * Predice quale finale il giocatore riceverà attualmente
     */
    predictEnding() {
        if (!window.EndingCalculator) return null;
        
        try {
            const prediction = window.EndingCalculator.calculateFinalEnding(
                window.player,
                window.KarmaTracker
            );
            
            return {
                endingName: prediction.ending.name,
                score: prediction.score.total,
                threshold: prediction.score.threshold,
                qualified: prediction.score.meetsRequirements,
                confidence: prediction.score.meetsRequirements ? 'Alta' : 'Bassa'
            };
        } catch (error) {
            console.error('[KARMA_INTEGRATION] Errore nella predizione:', error);
            return null;
        }
    }
};

// === AUTO-INIZIALIZZAZIONE ===

/**
 * Inizializza l'integrazione quando tutti i sistemi sono pronti
 */
const initializeIntegration = () => {
    if (typeof window.KarmaTracker !== 'undefined' && 
        typeof window.EndingCalculator !== 'undefined') {
        
        // Inizializza dopo un breve delay per essere sicuri che tutto sia caricato
        setTimeout(() => {
            window.KarmaIntegration.init();
        }, 1000);
    } else {
        // Riprova dopo 500ms
        setTimeout(initializeIntegration, 500);
    }
};

// Funzioni globali per debugging
if (typeof window !== 'undefined') {
    window.getKarmaReport = () => window.KarmaIntegration.getChoicesReport();
    window.predictMyEnding = () => window.KarmaIntegration.predictEnding();
    window.forceKarmaTest = (karma, hope) => {
        window.KarmaTracker.moral_karma = karma || 0;
        window.KarmaTracker.hope_rating = hope || 10;
        return window.KarmaIntegration.predictEnding();
    };
    
    // Avvia inizializzazione
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeIntegration);
    } else {
        initializeIntegration();
    }
}

console.log('✅ KARMA INTEGRATION SYSTEM caricato correttamente'); 
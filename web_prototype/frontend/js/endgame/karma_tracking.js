/**
 * THE SAFE PLACE - KARMA & HOPE TRACKING SYSTEM
 * FASE 6: MULTIPLE ENDINGS SYSTEM v1.0
 * 
 * Sistema avanzato per tracciare le scelte morali e narrative del giocatore
 * per determinare quale dei 7 finali possibili riceverà.
 */

window.KarmaTracker = {
    // === VARIABILI DI TRACKING ===
    
    // Karma principale (-30 a +30, neutrale a 0)
    moral_karma: 0,
    
    // Rating speranza (0 a 20, inizio a 10)
    hope_rating: 10,
    
    // Flag specifici per tracking scelte
    trauma_flags: [],
    leadership_flags: [],
    warrior_flags: [],
    research_items: [],
    
    // Contatori numerici
    helped_survivors: 0,
    groups_helped: 0,
    desperate_choices: 0,
    enemies_defeated: 0,
    moral_choices_made: 0,
    
    // === METODI DI TRACKING ===
    
    /**
     * Aggiunge karma positivo o negativo basato su una scelta morale
     * @param {number} amount - Quantità di karma da aggiungere (può essere negativa)
     * @param {string} reason - Descrizione della scelta che ha causato il cambiamento
     * @param {string} category - Categoria della scelta (compassion, survival, sacrifice, etc.)
     */
    addKarma(amount, reason, category = 'general') {
        const oldKarma = this.moral_karma;
        this.moral_karma = Math.max(-30, Math.min(30, this.moral_karma + amount));
        
        // Log per debugging
        console.log(`[KARMA] ${reason}: ${amount > 0 ? '+' : ''}${amount} (${oldKarma} → ${this.moral_karma})`);
        
        // Tracking delle scelte morali
        this.moral_choices_made++;
        
        // Aggiorna anche la speranza basandosi sul karma
        this.updateHopeFromKarma(amount, category);
        
        // Trigger eventi speciali se karma raggiunge soglie critiche
        this.checkKarmaThresholds();
    },
    
    /**
     * Modifica direttamente il rating di speranza
     * @param {number} amount - Quantità di speranza da aggiungere/rimuovere
     * @param {string} reason - Motivo del cambiamento
     */
    addHope(amount, reason) {
        const oldHope = this.hope_rating;
        this.hope_rating = Math.max(0, Math.min(20, this.hope_rating + amount));
        
        console.log(`[HOPE] ${reason}: ${amount > 0 ? '+' : ''}${amount} (${oldHope} → ${this.hope_rating})`);
    },
    
    /**
     * Aggiorna la speranza basandosi sui cambiamenti di karma
     */
    updateHopeFromKarma(karmaChange, category) {
        let hopeChange = 0;
        
        switch(category) {
            case 'compassion':
                hopeChange = karmaChange > 0 ? 1 : -0.5;
                break;
            case 'sacrifice':
                hopeChange = karmaChange > 0 ? 1.5 : -1;
                break;
            case 'survival':
                hopeChange = karmaChange < 0 ? -0.5 : 0.5;
                break;
            case 'leadership':
                hopeChange = karmaChange > 0 ? 1 : -0.5;
                break;
            default:
                hopeChange = karmaChange * 0.3;
        }
        
        this.addHope(hopeChange, `Derivato da scelta morale (${category})`);
    },
    
    /**
     * Aggiunge un flag di trauma
     * @param {string} traumaType - Tipo di trauma (violence, loss, betrayal, etc.)
     * @param {string} description - Descrizione dell'evento traumatico
     */
    addTrauma(traumaType, description) {
        this.trauma_flags.push({
            type: traumaType,
            description: description,
            timestamp: Date.now(),
            day: window.daysSurvived || 0
        });
        
        // Il trauma riduce sempre la speranza
        this.addHope(-1, `Trauma: ${traumaType}`);
        
        console.log(`[TRAUMA] Aggiunto: ${traumaType} - ${description}`);
    },
    
    /**
     * Aggiunge un flag di leadership
     * @param {string} leadershipType - Tipo di leadership mostrata
     * @param {string} context - Contesto della situazione
     */
    addLeadership(leadershipType, context) {
        this.leadership_flags.push({
            type: leadershipType,
            context: context,
            timestamp: Date.now(),
            day: window.daysSurvived || 0
        });
        
        // Leadership aumenta speranza e karma
        this.addKarma(2, `Leadership: ${leadershipType}`, 'leadership');
        
        console.log(`[LEADERSHIP] Dimostrata: ${leadershipType} - ${context}`);
    },
    
    /**
     * Aggiunge un flag warrior per abilità di combattimento
     * @param {string} achievementType - Tipo di achievement warrior
     * @param {string} details - Dettagli dell'achievement
     */
    addWarriorFlag(achievementType, details) {
        this.warrior_flags.push({
            type: achievementType,
            details: details,
            timestamp: Date.now(),
            day: window.daysSurvived || 0
        });
        
        console.log(`[WARRIOR] Achievement: ${achievementType} - ${details}`);
    },
    
    /**
     * Aggiunge un oggetto di ricerca al collection
     * @param {string} itemId - ID dell'oggetto
     * @param {string} significance - Significato narrativo dell'oggetto
     */
    addResearchItem(itemId, significance) {
        if (!this.research_items.find(item => item.id === itemId)) {
            this.research_items.push({
                id: itemId,
                significance: significance,
                timestamp: Date.now(),
                day: window.daysSurvived || 0
            });
            
            console.log(`[RESEARCH] Trovato: ${itemId} - ${significance}`);
        }
    },
    
    /**
     * Registra di aver aiutato un sopravvissuto
     * @param {string} survivorType - Tipo di sopravvissuto (child, family, injured, etc.)
     * @param {string} helpType - Tipo di aiuto fornito
     */
    helpedSurvivor(survivorType, helpType) {
        this.helped_survivors++;
        this.addKarma(3, `Aiutato ${survivorType} (${helpType})`, 'compassion');
        
        console.log(`[COMPASSION] Aiutato sopravvissuto #${this.helped_survivors}: ${survivorType}`);
    },
    
    /**
     * Registra di aver aiutato un gruppo di persone
     * @param {string} groupType - Tipo di gruppo
     * @param {number} size - Dimensione del gruppo
     */
    helpedGroup(groupType, size) {
        this.groups_helped++;
        this.addKarma(5, `Aiutato gruppo ${groupType} (${size} persone)`, 'leadership');
        
        console.log(`[LEADERSHIP] Aiutato gruppo #${this.groups_helped}: ${groupType}`);
    },
    
    /**
     * Registra una scelta disperata fatta per sopravvivere
     * @param {string} choiceType - Tipo di scelta disperata
     * @param {string} consequence - Conseguenze della scelta
     */
    desperateChoice(choiceType, consequence) {
        this.desperate_choices++;
        this.addKarma(-2, `Scelta disperata: ${choiceType}`, 'survival');
        this.addTrauma('desperate_choice', `${choiceType}: ${consequence}`);
        
        console.log(`[DESPERATION] Scelta #${this.desperate_choices}: ${choiceType}`);
    },
    
    /**
     * Registra la sconfitta di un nemico
     * @param {string} enemyType - Tipo di nemico sconfitto
     * @param {string} method - Metodo usato per sconfiggerlo
     */
    defeatedEnemy(enemyType, method) {
        this.enemies_defeated++;
        
        // Diversi metodi danno karma diverso
        let karmaChange = 0;
        if (method === 'violence') karmaChange = -1;
        else if (method === 'self_defense') karmaChange = 0;
        else if (method === 'protection_others') karmaChange = 1;
        
        this.addKarma(karmaChange, `Sconfitto ${enemyType} (${method})`, 'survival');
        
        // Ogni 10 nemici sconfitti = warrior flag
        if (this.enemies_defeated % 10 === 0) {
            this.addWarriorFlag('veteran_fighter', `${this.enemies_defeated} nemici sconfitti`);
        }
        
        console.log(`[COMBAT] Nemico #${this.enemies_defeated}: ${enemyType} via ${method}`);
    },
    
    /**
     * Controlla se il karma ha raggiunto soglie critiche
     */
    checkKarmaThresholds() {
        if (this.moral_karma >= 20 && !this.hasFlag('saint_threshold')) {
            this.addLeadership('moral_beacon', 'Raggiunto karma estremamente positivo');
            this.setFlag('saint_threshold', true);
        } else if (this.moral_karma <= -20 && !this.hasFlag('fallen_threshold')) {
            this.addTrauma('moral_corruption', 'Raggiunto karma estremamente negativo');
            this.setFlag('fallen_threshold', true);
        }
    },
    
    // === UTILITY E FLAGS ===
    
    /**
     * Semplice sistema di flag per tracking eventi one-time
     */
    flags: {},
    
    setFlag(flagName, value) {
        this.flags[flagName] = value;
    },
    
    hasFlag(flagName) {
        return !!this.flags[flagName];
    },
    
    /**
     * Calcola statistiche derivate per l'endgame
     */
    calculateDerivedStats() {
        return {
            // Categorie morali
            is_saint: this.moral_karma >= 15,
            is_balanced: this.moral_karma >= -5 && this.moral_karma <= 5,
            is_fallen: this.moral_karma <= -10,
            
            // Categorie speranza
            has_high_hope: this.hope_rating >= 15,
            has_moderate_hope: this.hope_rating >= 8 && this.hope_rating <= 12,
            has_lost_hope: this.hope_rating <= 5,
            
            // Categorie specializzate
            is_leader: this.leadership_flags.length >= 3,
            is_warrior: this.warrior_flags.length >= 4 || this.enemies_defeated >= 50,
            is_researcher: this.research_items.length >= 5,
            is_protector: this.helped_survivors >= 3,
            is_traumatized: this.trauma_flags.length >= 5,
            is_desperate: this.desperate_choices >= 3,
            
            // Rating complessivo del personaggio
            character_type: this.determineCharacterType()
        };
    },
    
    /**
     * Determina il tipo di personaggio primario basato sui dati
     */
    determineCharacterType() {
        const stats = this.calculateDerivedStats();
        
        if (stats.is_leader && stats.is_saint) return 'hero_leader';
        if (stats.is_warrior && stats.is_fallen) return 'dark_warrior';
        if (stats.is_researcher && stats.has_high_hope) return 'scientist_hope';
        if (stats.is_protector && stats.is_balanced) return 'compassionate_survivor';
        if (stats.is_traumatized && stats.has_lost_hope) return 'broken_survivor';
        if (stats.is_desperate && stats.is_fallen) return 'hollow_survivor';
        
        return 'balanced_survivor';
    },
    
    /**
     * Restituisce un report completo dello stato morale
     */
    getFullReport() {
        const derived = this.calculateDerivedStats();
        
        return {
            // Stats base
            moral_karma: this.moral_karma,
            hope_rating: this.hope_rating,
            
            // Contatori
            helped_survivors: this.helped_survivors,
            groups_helped: this.groups_helped,
            desperate_choices: this.desperate_choices,
            enemies_defeated: this.enemies_defeated,
            moral_choices_made: this.moral_choices_made,
            
            // Flag arrays
            trauma_count: this.trauma_flags.length,
            leadership_count: this.leadership_flags.length,
            warrior_count: this.warrior_flags.length,
            research_count: this.research_items.length,
            
            // Derived stats
            derived_stats: derived,
            
            // Character assessment
            character_type: derived.character_type,
            moral_alignment: this.getMoralAlignment(),
            hope_level: this.getHopeLevel()
        };
    },
    
    getMoralAlignment() {
        if (this.moral_karma >= 10) return 'Good';
        if (this.moral_karma <= -10) return 'Evil';
        return 'Neutral';
    },
    
    getHopeLevel() {
        if (this.hope_rating >= 15) return 'High';
        if (this.hope_rating >= 8) return 'Moderate';
        return 'Low';
    },
    
    /**
     * Reset per new game
     */
    reset() {
        this.moral_karma = 0;
        this.hope_rating = 10;
        this.trauma_flags = [];
        this.leadership_flags = [];
        this.warrior_flags = [];
        this.research_items = [];
        this.helped_survivors = 0;
        this.groups_helped = 0;
        this.desperate_choices = 0;
        this.enemies_defeated = 0;
        this.moral_choices_made = 0;
        this.flags = {};
        
        console.log('[KARMA_TRACKER] Sistema resettato per nuova partita');
    },
    
    /**
     * Salvataggio stato per persistence
     */
    save() {
        return {
            moral_karma: this.moral_karma,
            hope_rating: this.hope_rating,
            trauma_flags: this.trauma_flags,
            leadership_flags: this.leadership_flags,
            warrior_flags: this.warrior_flags,
            research_items: this.research_items,
            helped_survivors: this.helped_survivors,
            groups_helped: this.groups_helped,
            desperate_choices: this.desperate_choices,
            enemies_defeated: this.enemies_defeated,
            moral_choices_made: this.moral_choices_made,
            flags: this.flags
        };
    },
    
    /**
     * Caricamento stato da save
     */
    load(saveData) {
        Object.assign(this, saveData);
        console.log('[KARMA_TRACKER] Stato caricato da salvataggio');
    }
};

// === INTEGRATION HOOKS ===

// Hook per integrare il sistema con eventi esistenti
window.KarmaTracker.integrateWithEvents = function() {
    console.log('[KARMA_TRACKER] Sistema inizializzato e pronto per il tracking');
    
    // Il sistema è ora pronto per ricevere chiamate da eventi e scelte del giocatore
    window.trackKarma = (amount, reason, category) => this.addKarma(amount, reason, category);
    window.trackHope = (amount, reason) => this.addHope(amount, reason);
    window.trackTrauma = (type, description) => this.addTrauma(type, description);
    window.trackLeadership = (type, context) => this.addLeadership(type, context);
    window.trackWarrior = (type, details) => this.addWarriorFlag(type, details);
    window.trackResearch = (itemId, significance) => this.addResearchItem(itemId, significance);
    window.trackSurvivorHelp = (type, help) => this.helpedSurvivor(type, help);
    window.trackGroupHelp = (type, size) => this.helpedGroup(type, size);
    window.trackDesperation = (choice, consequence) => this.desperateChoice(choice, consequence);
    window.trackEnemyDefeat = (enemy, method) => this.defeatedEnemy(enemy, method);
};

// Auto-inizializzazione
if (typeof window !== 'undefined') {
    window.KarmaTracker.integrateWithEvents();
}

console.log('✅ KARMA & HOPE TRACKING SYSTEM caricato correttamente'); 
/**
 * THE SAFE PLACE - ENDING CALCULATOR ENGINE
 * FASE 6: MULTIPLE ENDINGS SYSTEM v1.0
 * 
 * Sistema che determina quale dei 7 finali possibili il giocatore riceverà
 * basandosi su karma, scelte, statistiche e progressione narrativa.
 */

window.EndingCalculator = {
    
    // === DEFINIZIONI DEI 7 FINALI ===
    
    endings: {
        hero_return: {
            id: 'hero_return',
            name: 'THE HERO\'S RETURN',
            subtitle: 'Finale Eroico',
            priority: 1, // Più alto = priorità maggiore
            icon: '🌟',
            requirements: {
                moral_karma: { min: 15, max: 30 },
                helped_survivors: { min: 3 },
                leadership_flags: { min: 2 },
                character_balance: true
            }
        },
        
        hollow_victory: {
            id: 'hollow_victory',
            name: 'THE HOLLOW VICTORY',
            subtitle: 'Vittoria Vuota',
            priority: 2,
            icon: '⚰️',
            requirements: {
                moral_karma: { min: -30, max: -10 },
                desperate_choices: { min: 3 },
                trauma_flags: { min: 3 },
                solo_survivor: true
            }
        },
        
        scientist_gambit: {
            id: 'scientist_gambit',
            name: 'THE SCIENTIST\'S GAMBIT',
            subtitle: 'Finale Scientifico',
            priority: 3,
            icon: '🔬',
            requirements: {
                research_items: { min: 5 },
                has_chimera_documents: true,
                intelligence_focus: true,
                hope_rating: { min: 8 }
            }
        },
        
        reluctant_leader: {
            id: 'reluctant_leader',
            name: 'THE RELUCTANT LEADER',
            subtitle: 'Leader Riluttante',
            priority: 4,
            icon: '👑',
            requirements: {
                leadership_flags: { min: 3 },
                groups_helped: { min: 4 },
                moral_karma: { min: 5 },
                charisma_focus: true
            }
        },
        
        pyrrhic_reunion: {
            id: 'pyrrhic_reunion',
            name: 'THE PYRRHIC REUNION',
            subtitle: 'Riunione Amara',
            priority: 5,
            icon: '💔',
            requirements: {
                final_hp: { max: 30 },
                trauma_flags: { min: 5 },
                desperate_choices: { min: 3 },
                hope_rating: { max: 8 }
            }
        },
        
        warrior_end: {
            id: 'warrior_end',
            name: 'THE WARRIOR\'S END',
            subtitle: 'Fine del Guerriero',
            priority: 6,
            icon: '⚔️',
            requirements: {
                enemies_defeated: { min: 50 },
                warrior_flags: { min: 4 },
                combat_focus: true,
                moral_karma: { min: -5, max: 15 }
            }
        },
        
        new_beginning: {
            id: 'new_beginning',
            name: 'THE NEW BEGINNING',
            subtitle: 'Nuovo Inizio',
            priority: 7,
            icon: '🌅',
            requirements: {
                balanced_stats: true,
                hope_rating: { min: 10 },
                moral_karma: { min: -5, max: 15 },
                moderate_journey: true
            }
        }
    },
    
    // === ALGORITMO DI CALCOLO PRINCIPALE ===
    
    /**
     * Calcola quale finale il giocatore riceverà
     * @param {Object} playerState - Stato attuale del giocatore
     * @param {Object} karmaData - Dati dal KarmaTracker
     * @returns {Object} - Oggetto finale selezionato con score e dettagli
     */
    calculateFinalEnding(playerState, karmaData) {
        console.log('[ENDING_CALC] Iniziando calcolo finale...');
        
        // Prepara dati di analisi
        const analysisData = this.prepareAnalysisData(playerState, karmaData);
        
        // Calcola score per ogni finale
        const endingScores = {};
        
        for (const [endingId, endingData] of Object.entries(this.endings)) {
            const score = this.calculateEndingScore(endingId, endingData, analysisData);
            endingScores[endingId] = {
                ending: endingData,
                score: score,
                meetsRequirements: score.total >= score.threshold
            };
            
            console.log(`[ENDING_CALC] ${endingData.name}: ${score.total}/${score.threshold} (${score.meetsRequirements ? 'QUALIFICATO' : 'non qualificato'})`);
        }
        
        // Trova il finale migliore
        const selectedEnding = this.selectBestEnding(endingScores);
        
        console.log(`[ENDING_CALC] Finale selezionato: ${selectedEnding.ending.name}`);
        return selectedEnding;
    },
    
    /**
     * Prepara i dati per l'analisi dei finali
     */
    prepareAnalysisData(playerState, karmaData) {
        const player = playerState || window.player;
        const karma = karmaData || window.KarmaTracker;
        
        return {
            // Dati base del giocatore
            final_hp: player.hp || 0,
            max_hp: player.maxHp || 100,
            hp_percentage: (player.hp || 0) / (player.maxHp || 100),
            
            // Stats del personaggio
            strength: player.strength || 10,
            intelligence: player.intelligence || 10,
            charisma: player.charisma || 10,
            resistance: player.resistance || 10,
            
            // Dati karma e tracking
            moral_karma: karma.moral_karma || 0,
            hope_rating: karma.hope_rating || 10,
            helped_survivors: karma.helped_survivors || 0,
            groups_helped: karma.groups_helped || 0,
            desperate_choices: karma.desperate_choices || 0,
            enemies_defeated: karma.enemies_defeated || 0,
            trauma_count: karma.trauma_flags ? karma.trauma_flags.length : 0,
            leadership_count: karma.leadership_flags ? karma.leadership_flags.length : 0,
            warrior_count: karma.warrior_flags ? karma.warrior_flags.length : 0,
            research_count: karma.research_items ? karma.research_items.length : 0,
            
            // Dati derivati
            stat_total: (player.strength || 10) + (player.intelligence || 10) + (player.charisma || 10) + (player.resistance || 10),
            days_survived: window.daysSurvived || 0,
            
            // Flags speciali
            has_chimera_documents: this.hasChimeraDocuments(player),
            is_solo_survivor: karma.helped_survivors === 0 && karma.groups_helped === 0,
            
            // Focus del personaggio (stat dominante)
            primary_focus: this.determinePrimaryFocus(player)
        };
    },
    
    /**
     * Calcola il punteggio per un finale specifico
     */
    calculateEndingScore(endingId, endingData, analysisData) {
        let score = {
            base: 0,
            bonuses: 0,
            penalties: 0,
            total: 0,
            threshold: 100,
            meetsRequirements: false,
            details: []
        };
        
        const req = endingData.requirements;
        
        // === CONTROLLI SPECIFICI PER FINALE ===
        
        switch(endingId) {
            case 'hero_return':
                score = this.calculateHeroReturnScore(req, analysisData);
                break;
            case 'hollow_victory':
                score = this.calculateHollowVictoryScore(req, analysisData);
                break;
            case 'scientist_gambit':
                score = this.calculateScientistGambitScore(req, analysisData);
                break;
            case 'reluctant_leader':
                score = this.calculateReluctantLeaderScore(req, analysisData);
                break;
            case 'pyrrhic_reunion':
                score = this.calculatePyrrhicReunionScore(req, analysisData);
                break;
            case 'warrior_end':
                score = this.calculateWarriorEndScore(req, analysisData);
                break;
            case 'new_beginning':
                score = this.calculateNewBeginningScore(req, analysisData);
                break;
            default:
                console.warn(`[ENDING_CALC] Finale sconosciuto: ${endingId}`);
        }
        
        // Calcola totale e controlla soglia
        score.total = score.base + score.bonuses - score.penalties;
        score.meetsRequirements = score.total >= score.threshold;
        
        return score;
    },
    
    // === CALCOLI SPECIFICI PER OGNI FINALE ===
    
    calculateHeroReturnScore(req, data) {
        let score = { base: 0, bonuses: 0, penalties: 0, threshold: 120, details: [] };
        
        // Karma positivo richiesto
        if (data.moral_karma >= 15) {
            score.base += 60;
            score.details.push(`Karma elevato (+60): ${data.moral_karma}`);
        } else {
            score.penalties += 50;
            score.details.push(`Karma insufficiente (-50): ${data.moral_karma} < 15`);
        }
        
        // Ha aiutato abbastanza sopravvissuti
        if (data.helped_survivors >= 3) {
            score.base += 40;
            score.details.push(`Aiutato ${data.helped_survivors} sopravvissuti (+40)`);
        } else {
            score.penalties += 30;
            score.details.push(`Pochi sopravvissuti aiutati (-30): ${data.helped_survivors} < 3`);
        }
        
        // Leadership dimostrata
        if (data.leadership_count >= 2) {
            score.base += 30;
            score.details.push(`Leadership dimostrata (+30): ${data.leadership_count} eventi`);
        }
        
        // Bonus per bilanciamento del personaggio
        if (this.isCharacterBalanced(data)) {
            score.bonuses += 20;
            score.details.push('Personaggio bilanciato (+20)');
        }
        
        return score;
    },
    
    calculateHollowVictoryScore(req, data) {
        let score = { base: 0, bonuses: 0, penalties: 0, threshold: 100, details: [] };
        
        // Karma negativo richiesto
        if (data.moral_karma <= -10) {
            score.base += 50;
            score.details.push(`Karma negativo (+50): ${data.moral_karma}`);
        } else {
            score.penalties += 40;
            score.details.push(`Karma troppo alto (-40): ${data.moral_karma} > -10`);
        }
        
        // Scelte disperate
        if (data.desperate_choices >= 3) {
            score.base += 40;
            score.details.push(`Scelte disperate (+40): ${data.desperate_choices}`);
        }
        
        // Alto trauma
        if (data.trauma_count >= 3) {
            score.base += 30;
            score.details.push(`Alto trauma (+30): ${data.trauma_count} eventi`);
        }
        
        // Sopravvissuto da solo (non aiutato nessuno)
        if (data.is_solo_survivor) {
            score.bonuses += 20;
            score.details.push('Sopravvissuto in solitudine (+20)');
        }
        
        return score;
    },
    
    calculateScientistGambitScore(req, data) {
        let score = { base: 0, bonuses: 0, penalties: 0, threshold: 110, details: [] };
        
        // Oggetti di ricerca raccolti
        if (data.research_count >= 5) {
            score.base += 60;
            score.details.push(`Ricerca completa (+60): ${data.research_count} oggetti`);
        } else {
            score.penalties += 40;
            score.details.push(`Ricerca insufficiente (-40): ${data.research_count} < 5`);
        }
        
        // Documenti Chimera
        if (data.has_chimera_documents) {
            score.base += 40;
            score.details.push('Documenti Progetto Chimera trovati (+40)');
        } else {
            score.penalties += 30;
            score.details.push('Documenti Chimera mancanti (-30)');
        }
        
        // Focus intelligenza
        if (data.primary_focus === 'intelligence') {
            score.base += 30;
            score.details.push('Focus su intelligenza (+30)');
        }
        
        // Speranza mantenuta
        if (data.hope_rating >= 8) {
            score.bonuses += 20;
            score.details.push(`Speranza preservata (+20): ${data.hope_rating}`);
        }
        
        return score;
    },
    
    calculateReluctantLeaderScore(req, data) {
        let score = { base: 0, bonuses: 0, penalties: 0, threshold: 115, details: [] };
        
        // Leadership forte
        if (data.leadership_count >= 3) {
            score.base += 50;
            score.details.push(`Leadership forte (+50): ${data.leadership_count} eventi`);
        } else {
            score.penalties += 40;
            score.details.push(`Leadership insufficiente (-40): ${data.leadership_count} < 3`);
        }
        
        // Gruppi aiutati
        if (data.groups_helped >= 4) {
            score.base += 50;
            score.details.push(`Molti gruppi aiutati (+50): ${data.groups_helped}`);
        } else {
            score.penalties += 30;
            score.details.push(`Pochi gruppi aiutati (-30): ${data.groups_helped} < 4`);
        }
        
        // Karma positivo
        if (data.moral_karma >= 5) {
            score.base += 30;
            score.details.push(`Karma positivo (+30): ${data.moral_karma}`);
        }
        
        // Focus carisma
        if (data.primary_focus === 'charisma') {
            score.bonuses += 25;
            score.details.push('Leader naturale (+25)');
        }
        
        return score;
    },
    
    calculatePyrrhicReunionScore(req, data) {
        let score = { base: 0, bonuses: 0, penalties: 0, threshold: 90, details: [] };
        
        // HP bassi
        if (data.hp_percentage <= 0.3) {
            score.base += 50;
            score.details.push(`Salute critica (+50): ${Math.round(data.hp_percentage * 100)}% HP`);
        } else {
            score.penalties += 30;
            score.details.push(`Salute troppo alta (-30): ${Math.round(data.hp_percentage * 100)}% HP`);
        }
        
        // Alto trauma
        if (data.trauma_count >= 5) {
            score.base += 40;
            score.details.push(`Trauma estremo (+40): ${data.trauma_count} eventi`);
        }
        
        // Scelte disperate
        if (data.desperate_choices >= 3) {
            score.base += 30;
            score.details.push(`Viaggio disperato (+30): ${data.desperate_choices} scelte`);
        }
        
        // Speranza perduta
        if (data.hope_rating <= 8) {
            score.bonuses += 20;
            score.details.push(`Speranza perduta (+20): ${data.hope_rating}`);
        }
        
        return score;
    },
    
    calculateWarriorEndScore(req, data) {
        let score = { base: 0, bonuses: 0, penalties: 0, threshold: 105, details: [] };
        
        // Molti nemici sconfitti
        if (data.enemies_defeated >= 50) {
            score.base += 60;
            score.details.push(`Veterano di guerra (+60): ${data.enemies_defeated} nemici`);
        } else {
            score.penalties += 40;
            score.details.push(`Poca esperienza combat (-40): ${data.enemies_defeated} < 50`);
        }
        
        // Achievement warrior
        if (data.warrior_count >= 4) {
            score.base += 40;
            score.details.push(`Guerriero esperto (+40): ${data.warrior_count} achievement`);
        }
        
        // Focus combattimento
        if (data.primary_focus === 'strength') {
            score.base += 30;
            score.details.push('Specializzazione combattimento (+30)');
        }
        
        // Karma neutrale-positivo (non troppo evil)
        if (data.moral_karma >= -5 && data.moral_karma <= 15) {
            score.bonuses += 15;
            score.details.push('Guerriero con onore (+15)');
        }
        
        return score;
    },
    
    calculateNewBeginningScore(req, data) {
        let score = { base: 0, bonuses: 0, penalties: 0, threshold: 80, details: [] };
        
        // Personaggio bilanciato
        if (this.isCharacterBalanced(data)) {
            score.base += 40;
            score.details.push('Sviluppo bilanciato (+40)');
        }
        
        // Speranza mantenuta
        if (data.hope_rating >= 10) {
            score.base += 30;
            score.details.push(`Speranza solida (+30): ${data.hope_rating}`);
        }
        
        // Karma moderato
        if (data.moral_karma >= -5 && data.moral_karma <= 15) {
            score.base += 30;
            score.details.push(`Moralità equilibrata (+30): ${data.moral_karma}`);
        }
        
        // Viaggio moderato (non troppi estremi)
        if (this.isModerateJourney(data)) {
            score.bonuses += 20;
            score.details.push('Viaggio equilibrato (+20)');
        }
        
        return score;
    },
    
    // === UTILITY FUNCTIONS ===
    
    /**
     * Seleziona il finale migliore da quelli qualificati
     */
    selectBestEnding(endingScores) {
        // Prima prova a trovare finali che soddisfano i requisiti
        const qualifiedEndings = Object.values(endingScores).filter(e => e.meetsRequirements);
        
        if (qualifiedEndings.length > 0) {
            // Ordina per priorità (più bassa = più importante) poi per score
            qualifiedEndings.sort((a, b) => {
                if (a.ending.priority !== b.ending.priority) {
                    return a.ending.priority - b.ending.priority;
                }
                return b.score.total - a.score.total;
            });
            
            return qualifiedEndings[0];
        }
        
        // Fallback: usa il finale con score più alto anche se non qualificato
        const allEndings = Object.values(endingScores);
        allEndings.sort((a, b) => b.score.total - a.score.total);
        
        console.warn('[ENDING_CALC] Nessun finale qualificato, usando fallback');
        return allEndings[0];
    },
    
    /**
     * Controlla se il personaggio è bilanciato
     */
    isCharacterBalanced(data) {
        const stats = [data.strength, data.intelligence, data.charisma, data.resistance];
        const avg = stats.reduce((a, b) => a + b, 0) / stats.length;
        const variance = stats.reduce((sum, stat) => sum + Math.pow(stat - avg, 2), 0) / stats.length;
        
        return variance <= 4; // Bassa varianza = bilanciato
    },
    
    /**
     * Controlla se il viaggio è stato moderato
     */
    isModerateJourney(data) {
        const extremeEvents = data.trauma_count + data.desperate_choices + data.warrior_count;
        const positiveEvents = data.leadership_count + data.helped_survivors;
        
        return extremeEvents <= 6 && positiveEvents >= 2;
    },
    
    /**
     * Determina il focus primario del personaggio
     */
    determinePrimaryFocus(player) {
        const stats = {
            strength: player.strength || 10,
            intelligence: player.intelligence || 10,
            charisma: player.charisma || 10,
            resistance: player.resistance || 10
        };
        
        return Object.entries(stats).reduce((a, b) => stats[a[0]] > stats[b[0]] ? a : b)[0];
    },
    
    /**
     * Controlla se il giocatore ha i documenti del Progetto Chimera
     */
    hasChimeraDocuments(player) {
        if (!player.inventory) return false;
        
        return player.inventory.some(item => 
            item.id === 'classified_documents' || 
            item.id === 'chimera_project_files' ||
            (typeof item === 'string' && item.includes('chimera'))
        );
    },
    
    /**
     * Restituisce una descrizione dettagliata del finale calcolato
     */
    getEndingDescription(selectedEnding) {
        const ending = selectedEnding.ending;
        const score = selectedEnding.score;
        
        return {
            id: ending.id,
            name: ending.name,
            subtitle: ending.subtitle,
            icon: ending.icon,
            score: score.total,
            qualified: score.meetsRequirements,
            details: score.details,
            summary: `${ending.name}: ${score.total} punti (soglia: ${score.threshold})`
        };
    },
    
    /**
     * Test function per debugging
     */
    testEndingCalculation() {
        console.log('[ENDING_CALC] Eseguendo test di calcolo finale...');
        
        // Dati di test
        const testPlayerState = {
            hp: 45,
            maxHp: 100,
            strength: 12,
            intelligence: 15,
            charisma: 18,
            resistance: 11,
            inventory: [{ id: 'classified_documents' }]
        };
        
        const testKarmaData = {
            moral_karma: 8,
            hope_rating: 12,
            helped_survivors: 5,
            groups_helped: 3,
            desperate_choices: 1,
            enemies_defeated: 25,
            trauma_flags: [1, 2],
            leadership_flags: [1, 2, 3, 4],
            warrior_flags: [1, 2],
            research_items: [1, 2, 3, 4, 5, 6]
        };
        
        const result = this.calculateFinalEnding(testPlayerState, testKarmaData);
        console.log('[ENDING_CALC] Test completato:', this.getEndingDescription(result));
        
        return result;
    }
};

// Auto-inizializzazione e integrazione
if (typeof window !== 'undefined') {
    window.EndingCalculator.init = function() {
        console.log('[ENDING_CALC] Sistema di calcolo finali inizializzato');
        
        // Funzione global per calcolo rapido
        window.calculatePlayerEnding = () => {
            return this.calculateFinalEnding(window.player, window.KarmaTracker);
        };
    };
    
    window.EndingCalculator.init();
}

console.log('✅ ENDING CALCULATOR ENGINE caricato correttamente'); 
/**
 * THE SAFE PLACE - EVENT ENGINE V2.0
 * Narrative Engine - Sistema avanzato per risoluzione outcome dinamici
 * FASE 5 STEP 2B: Sistema Eventi Narrativi Avanzati
 */

class NarrativeEngine {
    constructor(eventStateManager) {
        this.stateManager = eventStateManager;
        this.debugMode = false;
        this.outcomeHistory = [];
        this.activeModifiers = new Map();
        
        // Statistical tracking
        this.stats = {
            outcomesResolved: 0,
            skillChecksPassed: 0,
            skillChecksFailed: 0,
            effectsApplied: 0,
            dynamicResolutions: 0
        };
    }

    // === MAIN OUTCOME RESOLUTION ===

    resolveEventBranch(eventData, chosenBranch, playerState, eventState = null) {
        if (!eventState) eventState = this.stateManager;
        
        try {
            const branch = eventData.branches[chosenBranch];
            if (!branch) {
                throw new Error(`Branch ${chosenBranch} not found in event ${eventData.id}`);
            }

            if (this.debugMode) {
                console.log("[NarrativeEngine] Resolving branch:", {
                    event: eventData.id,
                    branch: chosenBranch,
                    player: this.capturePlayerSnapshot(playerState)
                });
            }

            // Check requirements first
            if (branch.requirements && !this.meetsRequirements(branch.requirements, playerState, eventState)) {
                return this.generateRequirementFailure(branch, eventData);
            }

            let outcome;

            // Dynamic outcome selection
            if (branch.dynamic_outcomes) {
                outcome = this.resolveDynamicOutcome(branch, playerState, eventState, eventData);
                this.stats.dynamicResolutions++;
            }
            // Skill check outcome
            else if (branch.skill_check) {
                outcome = this.resolveSkillCheck(branch, playerState, eventState);
            }
            // Probability-based outcome
            else if (branch.probability_check) {
                outcome = this.resolveProbabilityCheck(branch, playerState);
            }
            // Direct outcome
            else {
                outcome = this.resolveDirectOutcome(branch, playerState, eventState);
            }

            // Apply all effects
            if (outcome.effects) {
                this.applyEffects(outcome.effects, playerState, eventState, eventData);
            }

            // Record outcome in history
            this.recordOutcome(eventData.id, chosenBranch, outcome, playerState);
            
            this.stats.outcomesResolved++;
            
            return outcome;

        } catch (error) {
            console.error("[NarrativeEngine] Error resolving branch:", error);
            return this.generateErrorOutcome(error, eventData, chosenBranch);
        }
    }

    // === REQUIREMENT CHECKING ===

    meetsRequirements(requirements, playerState, eventState) {
        // Intelligence requirement
        if (requirements.intelligenza && playerState.intelligenza < requirements.intelligenza) {
            return false;
        }
        
        // Other stats
        if (requirements.potenza && playerState.potenza < requirements.potenza) {
            return false;
        }
        if (requirements.agilita && playerState.agilita < requirements.agilita) {
            return false;
        }
        if (requirements.presagio && playerState.presagio < requirements.presagio) {
            return false;
        }
        if (requirements.tracce && playerState.tracce < requirements.tracce) {
            return false;
        }
        if (requirements.influenza && playerState.influenza < requirements.influenza) {
            return false;
        }

        // Item requirements
        if (requirements.has_item && !this.playerHasItem(requirements.has_item, playerState)) {
            return false;
        }
        if (requirements.has_items) {
            const items = Array.isArray(requirements.has_items) ? requirements.has_items : [requirements.has_items];
            if (!items.every(item => this.playerHasItem(item, playerState))) {
                return false;
            }
        }

        // Flag requirements
        if (requirements.has_flag && !eventState.hasFlag(requirements.has_flag)) {
            return false;
        }

        // Water/food requirements
        if (requirements.water && playerState.water < requirements.water) {
            return false;
        }
        if (requirements.food && playerState.food < requirements.food) {
            return false;
        }

        return true;
    }

    // === DYNAMIC OUTCOME RESOLUTION ===

    resolveDynamicOutcome(branch, playerState, eventState, eventData) {
        // Relationship-based outcomes
        if (branch.relationship_modifiers) {
            return this.resolveRelationshipOutcome(branch, playerState, eventState);
        }

        // Reputation-based outcomes
        if (branch.reputation_modifiers) {
            return this.resolveReputationOutcome(branch, playerState, eventState);
        }

        // Previous choices influence
        if (branch.history_dependent) {
            return this.resolveHistoryDependentOutcome(branch, eventState, eventData);
        }

        // Time-sensitive outcomes
        if (branch.temporal_modifiers) {
            return this.resolveTemporalOutcome(branch, playerState, eventState);
        }

        // Default to standard resolution
        return this.resolveDirectOutcome(branch, playerState, eventState);
    }

    resolveRelationshipOutcome(branch, playerState, eventState) {
        const mods = branch.relationship_modifiers;
        const character = mods.character;
        const relationship = eventState.getRelationship(character) || 0;
        const threshold = mods.trust_threshold || 5;
        
        let selectedOutcome;
        if (relationship >= threshold) {
            selectedOutcome = mods.outcomes.high_trust;
        } else if (relationship <= -threshold) {
            selectedOutcome = mods.outcomes.low_trust || mods.outcomes.hostile;
        } else {
            selectedOutcome = mods.outcomes.neutral || mods.outcomes.low_trust;
        }

        return this.processOutcomeData(selectedOutcome, playerState);
    }

    resolveReputationOutcome(branch, playerState, eventState) {
        const mods = branch.reputation_modifiers;
        const faction = mods.faction;
        const reputation = eventState.getReputation(faction) || 0;
        const threshold = mods.threshold || 10;
        
        let selectedOutcome;
        if (reputation >= threshold) {
            selectedOutcome = mods.outcomes.high_reputation;
        } else if (reputation <= -threshold) {
            selectedOutcome = mods.outcomes.low_reputation;
        } else {
            selectedOutcome = mods.outcomes.neutral;
        }

        return this.processOutcomeData(selectedOutcome, playerState);
    }

    resolveHistoryDependentOutcome(branch, eventState, eventData) {
        const historyMods = branch.history_dependent;
        const eventHistory = eventState.getEventHistory();
        
        // Check for specific previous choices
        for (const condition of historyMods.conditions) {
            if (this.checkHistoryCondition(condition, eventHistory)) {
                return this.processOutcomeData(condition.outcome, null);
            }
        }
        
        // Default outcome
        return this.processOutcomeData(historyMods.default_outcome, null);
    }

    resolveTemporalOutcome(branch, playerState, eventState) {
        const temporalMods = branch.temporal_modifiers;
        const currentTime = (typeof daysSurvived !== 'undefined') ? daysSurvived : 0;
        
        // Time of day modifiers
        if (temporalMods.time_of_day) {
            const isDay = (typeof window !== 'undefined' && window.isDay !== undefined) ? window.isDay : true;
            const timeKey = isDay ? 'day' : 'night';
            if (temporalMods.time_of_day[timeKey]) {
                return this.processOutcomeData(temporalMods.time_of_day[timeKey], playerState);
            }
        }
        
        // Days survived modifiers
        if (temporalMods.days_survived) {
            for (const timeRange of temporalMods.days_survived) {
                if (currentTime >= timeRange.min && currentTime <= timeRange.max) {
                    return this.processOutcomeData(timeRange.outcome, playerState);
                }
            }
        }
        
        return this.processOutcomeData(temporalMods.default, playerState);
    }

    // === SKILL CHECK RESOLUTION ===

    resolveSkillCheck(branch, playerState, eventState) {
        const skillCheck = branch.skill_check;
        const statName = skillCheck.stat;
        const difficulty = skillCheck.difficulty;
        const playerValue = playerState[statName] || 0;
        
        // Calculate modifiers
        let totalModifier = 0;
        if (skillCheck.modifiers) {
            totalModifier = this.calculateSkillModifiers(skillCheck.modifiers, playerState, eventState);
        }
        
        // Roll check (simulate d20 system)
        const roll = Math.floor(Math.random() * 20) + 1;
        const totalValue = playerValue + totalModifier + roll;
        
        const success = totalValue >= difficulty;
        
        if (this.debugMode) {
            console.log("[NarrativeEngine] Skill Check:", {
                stat: statName,
                playerValue,
                modifier: totalModifier,
                roll,
                total: totalValue,
                difficulty,
                success
            });
        }
        
        if (success) {
            this.stats.skillChecksPassed++;
            return this.processOutcomeData(skillCheck.success_outcome, playerState);
        } else {
            this.stats.skillChecksFailed++;
            return this.processOutcomeData(skillCheck.failure_outcome, playerState);
        }
    }

    calculateSkillModifiers(modifiers, playerState, eventState) {
        let total = 0;
        
        for (const modifier of modifiers) {
            if (modifier.condition && !this.evaluateModifierCondition(modifier.condition, playerState, eventState)) {
                continue;
            }
            
            total += modifier.value;
        }
        
        return total;
    }

    evaluateModifierCondition(condition, playerState, eventState) {
        if (condition.has_item && !this.playerHasItem(condition.has_item, playerState)) {
            return false;
        }
        if (condition.has_flag && !eventState.hasFlag(condition.has_flag)) {
            return false;
        }
        if (condition.relationship) {
            const [character, threshold] = Object.entries(condition.relationship)[0];
            const relationship = eventState.getRelationship(character) || 0;
            return relationship >= threshold;
        }
        
        return true;
    }

    // === PROBABILITY CHECK RESOLUTION ===

    resolveProbabilityCheck(branch, playerState) {
        const probCheck = branch.probability_check;
        const baseChance = probCheck.base_chance || 0.5;
        
        // Calculate final probability with modifiers
        let finalChance = baseChance;
        if (probCheck.modifiers) {
            for (const modifier of probCheck.modifiers) {
                if (this.evaluateModifierCondition(modifier.condition, playerState, this.stateManager)) {
                    finalChance += modifier.value;
                }
            }
        }
        
        // Clamp between 0 and 1
        finalChance = Math.max(0, Math.min(1, finalChance));
        
        const success = Math.random() < finalChance;
        
        if (success) {
            return this.processOutcomeData(probCheck.success_outcome, playerState);
        } else {
            return this.processOutcomeData(probCheck.failure_outcome, playerState);
        }
    }

    // === DIRECT OUTCOME RESOLUTION ===

    resolveDirectOutcome(branch, playerState, eventState) {
        // Use success outcome if available
        if (branch.outcomes && branch.outcomes.success) {
            return this.processOutcomeData(branch.outcomes.success, playerState);
        }
        
        // Fallback to simple narrative
        return {
            type: 'success',
            story: branch.narrative || "L'azione è stata completata.",
            effects: branch.effects || {}
        };
    }

    processOutcomeData(outcomeData, playerState) {
        if (!outcomeData) {
            return {
                type: 'error',
                story: "Outcome non definito.",
                effects: {}
            };
        }
        
        return {
            type: 'success',
            story: outcomeData.story || "Azione completata.",
            effects: outcomeData.effects || {},
            narrative_text: outcomeData.narrative_text,
            emotional_impact: outcomeData.emotional_impact
        };
    }

    // === EFFECT APPLICATION ===

    applyEffects(effects, playerState, eventState, eventData) {
        const appliedEffects = [];
        
        try {
            // Flag effects
            if (effects.set_flag) {
                eventState.setFlag(effects.set_flag);
                appliedEffects.push(`Flag impostato: ${effects.set_flag}`);
            }
            
            // World state effects
            if (effects.world_state) {
                Object.entries(effects.world_state).forEach(([key, value]) => {
                    eventState.setWorldState(key, value);
                    appliedEffects.push(`Stato mondo: ${key} = ${value}`);
                });
            }
            
            // Item effects
            if (effects.add_item) {
                this.addItemToPlayer(effects.add_item, playerState);
                appliedEffects.push(`Ottenuto: ${effects.add_item}`);
            }
            
            if (effects.consume_item) {
                this.consumePlayerItem(effects.consume_item, playerState);
                appliedEffects.push(`Consumato: ${effects.consume_item}`);
            }
            
            // Relationship effects
            if (effects.relationship_change) {
                Object.entries(effects.relationship_change).forEach(([character, change]) => {
                    eventState.modifyRelationship(character, change);
                    appliedEffects.push(`Relazione con ${character}: ${change > 0 ? '+' : ''}${change}`);
                });
            }
            
            // Reputation effects
            if (effects.reputation) {
                Object.entries(effects.reputation).forEach(([faction, change]) => {
                    eventState.modifyReputation(faction, change);
                    appliedEffects.push(`Reputazione ${faction}: ${change > 0 ? '+' : ''}${change}`);
                });
            }
            
            // Unlock events
            if (effects.unlock_events) {
                const events = Array.isArray(effects.unlock_events) ? effects.unlock_events : [effects.unlock_events];
                events.forEach(eventId => {
                    eventState.setFlag(`event_${eventId}_unlocked`);
                });
                appliedEffects.push(`Eventi sbloccati: ${events.join(', ')}`);
            }
            
            // Schedule consequences
            if (effects.schedule_consequence) {
                const consequence = effects.schedule_consequence;
                eventState.scheduleConsequence(
                    consequence.trigger,
                    consequence.event_id,
                    consequence.delay || 0
                );
                appliedEffects.push(`Conseguenza schedulata: ${consequence.event_id}`);
            }
            
            // Player stat effects
            if (effects.damage) {
                this.applyDamage(effects.damage, playerState);
                appliedEffects.push(`Danno: ${effects.damage}`);
            }
            
            if (effects.heal) {
                this.applyHealing(effects.heal, playerState);
                appliedEffects.push(`Curato: ${effects.heal}`);
            }
            
            if (effects.restore_water) {
                this.restoreWater(effects.restore_water, playerState);
                appliedEffects.push(`Acqua ripristinata: ${effects.restore_water}`);
            }
            
            if (effects.lose_water) {
                this.loseWater(effects.lose_water, playerState);
                appliedEffects.push(`Acqua persa: ${effects.lose_water}`);
            }
            
            // Experience effects
            if (effects.add_experience) {
                this.addExperience(effects.add_experience, playerState);
                appliedEffects.push(`Esperienza: +${effects.add_experience}`);
            }
            
            // Map effects
            if (effects.add_map_markers) {
                this.addMapMarkers(effects.add_map_markers);
                appliedEffects.push(`Marker aggiunti: ${effects.add_map_markers.length}`);
            }
            
            // Quest effects
            if (effects.set_quest_progress) {
                Object.entries(effects.set_quest_progress).forEach(([questId, step]) => {
                    eventState.setQuestProgress(questId, step);
                    appliedEffects.push(`Quest ${questId}: step ${step}`);
                });
            }
            
            this.stats.effectsApplied += appliedEffects.length;
            
        } catch (error) {
            console.error("[NarrativeEngine] Error applying effects:", error, effects);
            appliedEffects.push("Errore nell'applicazione degli effetti");
        }
        
        return appliedEffects;
    }

    // === UTILITY METHODS ===

    playerHasItem(itemId, playerState) {
        if (!playerState.inventory) return false;
        return playerState.inventory.some(item => 
            (item.id === itemId || item.name === itemId) && item.quantity > 0
        );
    }

    addItemToPlayer(itemId, playerState) {
        if (typeof addItemToInventory === 'function') {
            addItemToInventory(itemId, 1);
        }
    }

    consumePlayerItem(itemId, playerState) {
        if (typeof removeItemFromInventory === 'function') {
            removeItemFromInventory(itemId, 1);
        }
    }

    applyDamage(amount, playerState) {
        if (typeof player !== 'undefined') {
            player.hp = Math.max(0, player.hp - amount);
        }
    }

    applyHealing(amount, playerState) {
        if (typeof player !== 'undefined') {
            player.hp = Math.min(player.maxHp, player.hp + amount);
        }
    }

    restoreWater(amount, playerState) {
        if (typeof player !== 'undefined') {
            player.water = Math.min(100, (player.water || 0) + amount);
        }
    }

    loseWater(amount, playerState) {
        if (typeof player !== 'undefined') {
            player.water = Math.max(0, (player.water || 0) - amount);
        }
    }

    addExperience(amount, playerState) {
        if (typeof addExperience === 'function') {
            addExperience(amount);
        }
    }

    addMapMarkers(markers) {
        // Integration with map system
        console.log("[NarrativeEngine] Map markers to add:", markers);
    }

    capturePlayerSnapshot(playerState) {
        return {
            stats: {
                intelligenza: playerState.intelligenza || 0,
                potenza: playerState.potenza || 0,
                agilita: playerState.agilita || 0,
                presagio: playerState.presagio || 0
            },
            hp: playerState.hp || 100,
            water: playerState.water || 50,
            position: { x: playerState.x || 0, y: playerState.y || 0 }
        };
    }

    checkHistoryCondition(condition, eventHistory) {
        if (condition.event_id) {
            return eventHistory.some(event => event.id === condition.event_id);
        }
        if (condition.choice_made) {
            return eventHistory.some(event => 
                event.outcome && event.outcome.choice === condition.choice_made
            );
        }
        return false;
    }

    recordOutcome(eventId, branchKey, outcome, playerState) {
        const record = {
            eventId,
            branchKey,
            outcome,
            timestamp: Date.now(),
            gameTime: (typeof daysSurvived !== 'undefined') ? daysSurvived : 0,
            playerSnapshot: this.capturePlayerSnapshot(playerState)
        };
        
        this.outcomeHistory.push(record);
        
        // Keep only last 50 outcomes to prevent memory bloat
        if (this.outcomeHistory.length > 50) {
            this.outcomeHistory = this.outcomeHistory.slice(-50);
        }
    }

    // === ERROR HANDLING ===

    generateRequirementFailure(branch, eventData) {
        return {
            type: 'requirement_failure',
            story: "Non soddisfi i requisiti per questa azione.",
            effects: {},
            requirements: branch.requirements
        };
    }

    generateErrorOutcome(error, eventData, branchKey) {
        console.error("[NarrativeEngine] Outcome error:", error);
        return {
            type: 'error',
            story: "Si è verificato un errore nell'elaborazione dell'azione.",
            effects: {},
            error: error.message
        };
    }

    // === DEBUG & STATUS ===

    setDebugMode(enabled) {
        this.debugMode = enabled;
        console.log(`[NarrativeEngine] Debug mode ${enabled ? 'enabled' : 'disabled'}`);
    }

    getStatus() {
        return {
            initialized: true,
            debugMode: this.debugMode,
            stats: this.stats,
            outcomeHistorySize: this.outcomeHistory.length,
            activeModifiers: this.activeModifiers.size
        };
    }

    reset() {
        this.outcomeHistory = [];
        this.activeModifiers.clear();
        this.stats = {
            outcomesResolved: 0,
            skillChecksPassed: 0,
            skillChecksFailed: 0,
            effectsApplied: 0,
            dynamicResolutions: 0
        };
        console.log("[NarrativeEngine] Reset complete");
    }
}

// Export for global access
if (typeof window !== 'undefined') {
    window.NarrativeEngine = NarrativeEngine;
} 
/**
 * THE SAFE PLACE - EVENT ENGINE V2.0
 * Trigger Engine - Sistema avanzato per trigger multi-condizionali
 * FASE 5: Sistema Eventi Narrativi Avanzati
 */

class TriggerEngine {
    constructor(eventStateManager) {
        this.stateManager = eventStateManager;
        this.debugMode = false;
        this.evaluationCache = new Map();
        this.cacheTimeout = 1000; // 1 second cache
    }

    // === MAIN TRIGGER EVALUATION ===

    evaluateComplexTrigger(trigger, playerState, eventState = null) {
        if (!trigger) return false;
        if (!eventState) eventState = this.stateManager;

        // Check cache first
        const cacheKey = this.generateCacheKey(trigger, playerState);
        const cached = this.evaluationCache.get(cacheKey);
        if (cached && (Date.now() - cached.timestamp) < this.cacheTimeout) {
            return cached.result;
        }

        const conditions = [];
        let result = false;

        try {
            // Location-based triggers
            if (trigger.location) {
                conditions.push({
                    type: 'location',
                    result: this.checkLocationTrigger(trigger.location, playerState)
                });
            }

            // State-based triggers (flags, world state)
            if (trigger.requires) {
                conditions.push({
                    type: 'requirements',
                    result: this.checkRequirementsTrigger(trigger.requires, eventState)
                });
            }

            // Flag-based triggers (legacy compatibility)
            if (trigger.flags) {
                conditions.push({
                    type: 'flags',
                    result: this.checkFlagTrigger(trigger.flags, eventState)
                });
            }

            // Statistical triggers (player stats, progress)
            if (trigger.player_stats) {
                conditions.push({
                    type: 'player_stats',
                    result: this.checkStatsTrigger(trigger.player_stats, playerState)
                });
            }

            // Event dependency triggers
            if (trigger.previous_events) {
                conditions.push({
                    type: 'previous_events',
                    result: this.checkEventDependency(trigger.previous_events, eventState)
                });
            }

            // Item requirement triggers
            if (trigger.has_items) {
                conditions.push({
                    type: 'has_items',
                    result: this.checkItemRequirements(trigger.has_items, playerState)
                });
            }

            // Reputation triggers
            if (trigger.reputation) {
                conditions.push({
                    type: 'reputation',
                    result: this.checkReputationTrigger(trigger.reputation, eventState)
                });
            }

            // Relationship triggers
            if (trigger.relationships) {
                conditions.push({
                    type: 'relationships',
                    result: this.checkRelationshipTrigger(trigger.relationships, eventState)
                });
            }

            // Temporal triggers (time, sequence, cooldowns)
            if (trigger.temporal) {
                conditions.push({
                    type: 'temporal',
                    result: this.checkTemporalTrigger(trigger.temporal, playerState, eventState)
                });
            }

            // Distance-based triggers
            if (trigger.distance_safe_place || trigger.distance_from_safe_place) {
                const distanceCondition = trigger.distance_safe_place || trigger.distance_from_safe_place;
                conditions.push({
                    type: 'distance',
                    result: this.checkDistanceTrigger(distanceCondition, playerState)
                });
            }

            // Probability triggers (always evaluated last)
            if (trigger.probability) {
                conditions.push({
                    type: 'probability',
                    result: this.checkProbabilityTrigger(trigger.probability, playerState)
                });
            }

            // Quest progress triggers
            if (trigger.quest_progress) {
                conditions.push({
                    type: 'quest_progress',
                    result: this.checkQuestProgressTrigger(trigger.quest_progress, eventState)
                });
            }

            // Custom condition evaluation
            if (trigger.custom_condition) {
                conditions.push({
                    type: 'custom',
                    result: this.checkCustomCondition(trigger.custom_condition, playerState, eventState)
                });
            }

            // Evaluate logical combination
            result = this.evaluateLogicalCondition(trigger.logic || 'AND', conditions);

            // Apply modifiers
            if (trigger.modifiers && result) {
                result = this.applyTriggerModifiers(trigger.modifiers, playerState, eventState);
            }

        } catch (error) {
            console.error("[TriggerEngine] Error evaluating trigger:", error, trigger);
            result = false;
        }

        // Cache result
        this.evaluationCache.set(cacheKey, {
            result: result,
            timestamp: Date.now()
        });

        if (this.debugMode) {
            console.log("[TriggerEngine] Evaluation result:", {
                trigger: trigger,
                conditions: conditions,
                result: result
            });
        }

        return result;
    }

    // === SPECIFIC TRIGGER CHECKS ===

    checkLocationTrigger(locationCondition, playerState) {
        // Tile type check
        if (locationCondition.types) {
            const currentTile = this.getCurrentTileType(playerState);
            if (!locationCondition.types.includes(currentTile)) {
                return false;
            }
        }

        // Specific coordinates
        if (locationCondition.coordinates) {
            const { x, y } = locationCondition.coordinates;
            if (playerState.x !== x || playerState.y !== y) {
                return false;
            }
        }

        // Area check (within bounds)
        if (locationCondition.area) {
            const area = locationCondition.area;
            const inBounds = playerState.x >= area.min_x && 
                           playerState.x <= area.max_x &&
                           playerState.y >= area.min_y && 
                           playerState.y <= area.max_y;
            if (!inBounds) {
                return false;
            }
        }

        return true;
    }

    checkRequirementsTrigger(requirements, eventState) {
        if (Array.isArray(requirements)) {
            // Array of flag requirements
            for (const req of requirements) {
                if (req.startsWith('!')) {
                    // Negative requirement
                    const flag = req.substring(1);
                    if (eventState.hasFlag(flag)) return false;
                } else {
                    // Positive requirement
                    if (!eventState.hasFlag(req)) return false;
                }
            }
            return true;
        }

        if (typeof requirements === 'object') {
            // Object-based requirements
            for (const [key, value] of Object.entries(requirements)) {
                if (key.startsWith('!')) {
                    // Negative requirement
                    const actualKey = key.substring(1);
                    if (eventState.hasFlag(actualKey)) return false;
                } else {
                    // Positive requirement
                    if (typeof value === 'boolean') {
                        if (eventState.hasFlag(key) !== value) return false;
                    } else {
                        if (!eventState.hasFlag(key)) return false;
                    }
                }
            }
            return true;
        }

        return false;
    }

    checkFlagTrigger(flagCondition, eventState) {
        if (typeof flagCondition === 'string') {
            return eventState.hasFlag(flagCondition);
        }

        if (Array.isArray(flagCondition)) {
            return flagCondition.every(flag => eventState.hasFlag(flag));
        }

        if (typeof flagCondition === 'object') {
            // Complex flag conditions
            if (flagCondition.any) {
                return flagCondition.any.some(flag => eventState.hasFlag(flag));
            }
            if (flagCondition.all) {
                return flagCondition.all.every(flag => eventState.hasFlag(flag));
            }
            if (flagCondition.none) {
                return !flagCondition.none.some(flag => eventState.hasFlag(flag));
            }
        }

        return false;
    }

    checkStatsTrigger(statsCondition, playerState) {
        for (const [stat, condition] of Object.entries(statsCondition)) {
            const playerValue = playerState[stat] || 0;
            
            if (typeof condition === 'number') {
                if (playerValue < condition) return false;
            } else if (typeof condition === 'object') {
                if (condition.min !== undefined && playerValue < condition.min) return false;
                if (condition.max !== undefined && playerValue > condition.max) return false;
                if (condition.exact !== undefined && playerValue !== condition.exact) return false;
            }
        }
        return true;
    }

    checkEventDependency(eventList, eventState) {
        if (Array.isArray(eventList)) {
            return eventList.every(eventId => eventState.hasEventOccurred(eventId));
        }
        
        if (typeof eventList === 'object') {
            if (eventList.any) {
                return eventList.any.some(eventId => eventState.hasEventOccurred(eventId));
            }
            if (eventList.all) {
                return eventList.all.every(eventId => eventState.hasEventOccurred(eventId));
            }
        }

        return false;
    }

    checkItemRequirements(itemsCondition, playerState) {
        if (Array.isArray(itemsCondition)) {
            return itemsCondition.every(itemId => this.playerHasItem(itemId, playerState));
        }

        if (typeof itemsCondition === 'object') {
            if (itemsCondition.any) {
                return itemsCondition.any.some(itemId => this.playerHasItem(itemId, playerState));
            }
            if (itemsCondition.all) {
                return itemsCondition.all.every(itemId => this.playerHasItem(itemId, playerState));
            }
        }

        return false;
    }

    checkReputationTrigger(reputationCondition, eventState) {
        for (const [faction, condition] of Object.entries(reputationCondition)) {
            const currentRep = eventState.getReputation(faction);
            
            if (typeof condition === 'number') {
                if (currentRep < condition) return false;
            } else if (typeof condition === 'object') {
                if (condition.min !== undefined && currentRep < condition.min) return false;
                if (condition.max !== undefined && currentRep > condition.max) return false;
            }
        }
        return true;
    }

    checkRelationshipTrigger(relationshipCondition, eventState) {
        for (const [character, condition] of Object.entries(relationshipCondition)) {
            const currentRel = eventState.getRelationship(character);
            
            if (typeof condition === 'number') {
                if (currentRel < condition) return false;
            } else if (typeof condition === 'object') {
                if (condition.min !== undefined && currentRel < condition.min) return false;
                if (condition.max !== undefined && currentRel > condition.max) return false;
            }
        }
        return true;
    }

    checkTemporalTrigger(temporalCondition, playerState, eventState) {
        const currentTime = (typeof daysSurvived !== 'undefined') ? daysSurvived : 0;

        // Days survived condition
        if (temporalCondition.days_min && currentTime < temporalCondition.days_min) {
            return false;
        }
        if (temporalCondition.days_max && currentTime > temporalCondition.days_max) {
            return false;
        }

        // Cooldown since last event
        if (temporalCondition.cooldown) {
            const lastTime = eventState.getLastEventTime(temporalCondition.event_id);
            const timeDiff = currentTime - lastTime;
            if (timeDiff < temporalCondition.cooldown) {
                return false;
            }
        }

        // Time of day
        if (temporalCondition.time_of_day) {
            const isDay = (typeof window !== 'undefined' && window.isDay !== undefined) ? window.isDay : true;
            if (temporalCondition.time_of_day === 'day' && !isDay) return false;
            if (temporalCondition.time_of_day === 'night' && isDay) return false;
        }

        return true;
    }

    checkDistanceTrigger(distanceCondition, playerState) {
        const safeX = 190, safeY = 190;
        const distance = Math.sqrt(
            Math.pow(playerState.x - safeX, 2) + 
            Math.pow(playerState.y - safeY, 2)
        );

        if (typeof distanceCondition === 'number') {
            return distance <= distanceCondition;
        }

        if (typeof distanceCondition === 'object') {
            if (distanceCondition.min !== undefined && distance < distanceCondition.min) return false;
            if (distanceCondition.max !== undefined && distance > distanceCondition.max) return false;
        }

        return true;
    }

    checkProbabilityTrigger(probabilityCondition, playerState) {
        let probability = 0;

        if (typeof probabilityCondition === 'number') {
            probability = probabilityCondition;
        } else if (typeof probabilityCondition === 'object') {
            probability = probabilityCondition.base || 0;
            
            // Dynamic modifiers
            if (probabilityCondition.modifiers) {
                for (const modifier of probabilityCondition.modifiers) {
                    if (modifier.condition && this.evaluateComplexTrigger(modifier.condition, playerState)) {
                        probability += modifier.value;
                    }
                }
            }
        }

        return Math.random() < probability;
    }

    checkQuestProgressTrigger(questCondition, eventState) {
        for (const [questId, condition] of Object.entries(questCondition)) {
            const currentProgress = eventState.getQuestProgress(questId);
            
            if (typeof condition === 'number') {
                if (currentProgress < condition) return false;
            } else if (typeof condition === 'object') {
                if (condition.min !== undefined && currentProgress < condition.min) return false;
                if (condition.max !== undefined && currentProgress > condition.max) return false;
                if (condition.exact !== undefined && currentProgress !== condition.exact) return false;
            }
        }
        return true;
    }

    checkCustomCondition(customCondition, playerState, eventState) {
        try {
            // Safe evaluation of custom conditions
            if (typeof customCondition === 'function') {
                return customCondition(playerState, eventState);
            }
            
            if (typeof customCondition === 'string') {
                // Simple string-based conditions
                return this.evaluateStringCondition(customCondition, playerState, eventState);
            }
        } catch (error) {
            console.error("[TriggerEngine] Error in custom condition:", error);
            return false;
        }
        
        return false;
    }

    // === UTILITY METHODS ===

    evaluateLogicalCondition(logic, conditions) {
        if (conditions.length === 0) return true;

        switch (logic.toUpperCase()) {
            case 'AND':
                return conditions.every(c => c.result);
            case 'OR':
                return conditions.some(c => c.result);
            case 'NOT':
                return !conditions.every(c => c.result);
            case 'XOR':
                return conditions.filter(c => c.result).length === 1;
            default:
                return conditions.every(c => c.result); // Default to AND
        }
    }

    applyTriggerModifiers(modifiers, playerState, eventState) {
        let result = true;
        
        for (const modifier of modifiers) {
            if (modifier.type === 'probability_multiplier') {
                const multiplier = modifier.value;
                if (Math.random() > multiplier) {
                    result = false;
                    break;
                }
            }
        }
        
        return result;
    }

    getCurrentTileType(playerState) {
        if (typeof map !== 'undefined' && map[playerState.y] && map[playerState.y][playerState.x]) {
            return map[playerState.y][playerState.x].type;
        }
        return null;
    }

    playerHasItem(itemId, playerState) {
        if (typeof player !== 'undefined' && player.inventory) {
            return player.inventory.some(item => item.id === itemId && item.quantity > 0);
        }
        return false;
    }

    generateCacheKey(trigger, playerState) {
        const keyData = {
            x: playerState.x,
            y: playerState.y,
            day: (typeof daysSurvived !== 'undefined') ? daysSurvived : 0,
            trigger: JSON.stringify(trigger)
        };
        return JSON.stringify(keyData);
    }

    evaluateStringCondition(condition, playerState, eventState) {
        // Simple string condition evaluation
        // Format: "flag:flag_name" or "stat:stat_name>5" etc.
        const [type, value] = condition.split(':');
        
        switch (type) {
            case 'flag':
                return eventState.hasFlag(value);
            case 'stat':
                const [statName, operator, threshold] = value.match(/(\w+)([><=]+)(\d+)/).slice(1);
                const statValue = playerState[statName] || 0;
                switch (operator) {
                    case '>': return statValue > parseInt(threshold);
                    case '<': return statValue < parseInt(threshold);
                    case '>=': return statValue >= parseInt(threshold);
                    case '<=': return statValue <= parseInt(threshold);
                    case '=': case '==': return statValue == parseInt(threshold);
                    default: return false;
                }
            default:
                return false;
        }
    }

    // === DEBUG & UTILITIES ===

    setDebugMode(enabled) {
        this.debugMode = enabled;
        console.log(`[TriggerEngine] Debug mode ${enabled ? 'enabled' : 'disabled'}`);
    }

    clearCache() {
        this.evaluationCache.clear();
        console.log("[TriggerEngine] Evaluation cache cleared");
    }

    getStatus() {
        return {
            cacheSize: this.evaluationCache.size,
            debugMode: this.debugMode,
            cacheTimeout: this.cacheTimeout
        };
    }
}

// Esporta per uso globale
if (typeof window !== 'undefined') {
    window.TriggerEngine = TriggerEngine;
} 
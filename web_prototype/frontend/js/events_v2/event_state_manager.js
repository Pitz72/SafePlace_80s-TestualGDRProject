/**
 * THE SAFE PLACE - EVENT ENGINE V2.0
 * Event State Manager - Gestione stato narrativo persistente
 * FASE 5: Sistema Eventi Narrativi Avanzati
 */

class EventStateManager {
    constructor() {
        this.activeFlags = new Set();
        this.worldState = {};
        this.characterRelationships = {};
        this.questProgress = {};
        this.eventHistory = [];
        this.consequenceQueue = [];
        this.reputation = {
            traders: 0,
            scientists: 0,
            military: 0,
            survivors: 0
        };
        this.stateChangeLog = [];
        this.initialized = false;
        
        this.initialize();
    }

    initialize() {
        // Carica stato da player esistente se disponibile
        if (typeof player !== 'undefined') {
            this.loadFromPlayer();
        }
        this.initialized = true;
        console.log("[EventStateManager] Initialized - State tracking active");
    }

    // === PERSISTENT STATE TRACKING ===

    setFlag(flagName, value = true) {
        const changed = (value && !this.activeFlags.has(flagName)) || 
                       (!value && this.activeFlags.has(flagName));
        
        if (value) {
            this.activeFlags.add(flagName);
        } else {
            this.activeFlags.delete(flagName);
        }
        
        if (changed) {
            this.logStateChange('flag', flagName, value);
            this.saveToPlayer();
        }
        
        return changed;
    }

    hasFlag(flagName) {
        return this.activeFlags.has(flagName);
    }

    getFlags() {
        return Array.from(this.activeFlags);
    }

    setWorldState(key, value) {
        const oldValue = this.worldState[key];
        this.worldState[key] = value;
        
        if (oldValue !== value) {
            this.logStateChange('world_state', key, value, oldValue);
            this.saveToPlayer();
        }
    }

    getWorldState(key) {
        return this.worldState[key];
    }

    // === CHARACTER RELATIONSHIP TRACKING ===

    modifyRelationship(character, change) {
        if (!this.characterRelationships[character]) {
            this.characterRelationships[character] = 0;
        }
        
        const oldValue = this.characterRelationships[character];
        this.characterRelationships[character] += change;
        
        // Clamp tra -100 e +100
        this.characterRelationships[character] = Math.max(-100, 
            Math.min(100, this.characterRelationships[character]));
        
        if (oldValue !== this.characterRelationships[character]) {
            this.logStateChange('relationship', character, change, oldValue);
            this.saveToPlayer();
        }
    }

    getRelationship(character) {
        return this.characterRelationships[character] || 0;
    }

    setRelationship(character, value) {
        const oldValue = this.characterRelationships[character] || 0;
        this.characterRelationships[character] = Math.max(-100, Math.min(100, value));
        
        if (oldValue !== this.characterRelationships[character]) {
            this.logStateChange('relationship', character, value, oldValue);
            this.saveToPlayer();
        }
    }

    // === REPUTATION SYSTEM ===

    modifyReputation(faction, change) {
        if (!this.reputation[faction]) {
            this.reputation[faction] = 0;
        }
        
        const oldValue = this.reputation[faction];
        this.reputation[faction] += change;
        
        // Clamp tra -100 e +100
        this.reputation[faction] = Math.max(-100, Math.min(100, this.reputation[faction]));
        
        if (oldValue !== this.reputation[faction]) {
            this.logStateChange('reputation', faction, change, oldValue);
            this.saveToPlayer();
        }
    }

    getReputation(faction) {
        return this.reputation[faction] || 0;
    }

    // === QUEST PROGRESS TRACKING ===

    setQuestProgress(questId, step) {
        const oldStep = this.questProgress[questId] || 0;
        this.questProgress[questId] = step;
        
        if (oldStep !== step) {
            this.logStateChange('quest_progress', questId, step, oldStep);
            this.saveToPlayer();
        }
    }

    getQuestProgress(questId) {
        return this.questProgress[questId] || 0;
    }

    isQuestActive(questId) {
        return this.questProgress[questId] > 0;
    }

    isQuestCompleted(questId) {
        return this.hasFlag(`quest_${questId}_completed`);
    }

    completeQuest(questId) {
        this.setFlag(`quest_${questId}_completed`);
        this.logStateChange('quest_completed', questId, true);
    }

    // === EVENT HISTORY ===

    recordEvent(eventId, outcome, playerChoice = null) {
        const eventRecord = {
            id: eventId,
            timestamp: Date.now(),
            gameTime: (typeof daysSurvived !== 'undefined') ? daysSurvived : 0,
            outcome: outcome,
            playerChoice: playerChoice,
            playerState: this.capturePlayerSnapshot()
        };
        
        this.eventHistory.push(eventRecord);
        this.logStateChange('event_history', eventId, outcome);
        this.saveToPlayer();
    }

    hasEventOccurred(eventId) {
        return this.eventHistory.some(event => event.id === eventId);
    }

    getEventHistory(eventId = null) {
        if (eventId) {
            return this.eventHistory.filter(event => event.id === eventId);
        }
        return this.eventHistory;
    }

    getLastEventTime(eventId) {
        const events = this.getEventHistory(eventId);
        if (events.length === 0) return 0;
        return Math.max(...events.map(e => e.gameTime));
    }

    // === CONSEQUENCE SCHEDULING ===

    scheduleConsequence(triggerCondition, eventId, delay = 0) {
        const consequence = {
            id: `consequence_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            trigger: triggerCondition,
            eventId: eventId,
            scheduledTime: Date.now() + delay,
            scheduledGameTime: (typeof daysSurvived !== 'undefined') ? daysSurvived + (delay / 86400000) : 0,
            active: true,
            created: Date.now()
        };
        
        this.consequenceQueue.push(consequence);
        this.logStateChange('consequence_scheduled', eventId, triggerCondition);
        this.saveToPlayer();
        
        return consequence.id;
    }

    checkScheduledConsequences(playerState) {
        const triggeredEvents = [];
        const currentTime = Date.now();
        const currentGameTime = (typeof daysSurvived !== 'undefined') ? daysSurvived : 0;
        
        for (const consequence of this.consequenceQueue) {
            if (consequence.active) {
                // Check time-based triggers
                if (currentTime >= consequence.scheduledTime || 
                    currentGameTime >= consequence.scheduledGameTime) {
                    
                    // Check conditional triggers if any
                    if (this.evaluateConsequenceTrigger(consequence.trigger, playerState)) {
                        triggeredEvents.push({
                            eventId: consequence.eventId,
                            consequenceId: consequence.id,
                            triggerData: consequence.trigger
                        });
                        consequence.active = false;
                    }
                }
            }
        }
        
        if (triggeredEvents.length > 0) {
            this.saveToPlayer();
        }
        
        return triggeredEvents;
    }

    evaluateConsequenceTrigger(trigger, playerState) {
        if (typeof trigger === 'string') {
            // Simple flag check
            return this.hasFlag(trigger);
        }
        
        if (typeof trigger === 'object') {
            // Complex condition evaluation
            if (trigger.flag) {
                return this.hasFlag(trigger.flag);
            }
            
            if (trigger.location) {
                return this.checkLocationCondition(trigger.location, playerState);
            }
            
            if (trigger.relationship) {
                const [character, threshold] = Object.entries(trigger.relationship)[0];
                return this.getRelationship(character) >= threshold;
            }
        }
        
        return true; // Default to triggered
    }

    // === UTILITY METHODS ===

    capturePlayerSnapshot() {
        if (typeof player === 'undefined') return null;
        
        return {
            x: player.x,
            y: player.y,
            hp: player.hp,
            maxHp: player.maxHp,
            stats: { ...player },
            daysSurvived: (typeof daysSurvived !== 'undefined') ? daysSurvived : 0
        };
    }

    checkLocationCondition(locationCondition, playerState) {
        if (locationCondition.distance_from_safe_place) {
            const distance = Math.sqrt(
                Math.pow(playerState.x - 190, 2) + 
                Math.pow(playerState.y - 190, 2)
            );
            const min = locationCondition.distance_from_safe_place.min || 0;
            const max = locationCondition.distance_from_safe_place.max || Infinity;
            return distance >= min && distance <= max;
        }
        
        return true;
    }

    logStateChange(type, key, value, oldValue = null) {
        const logEntry = {
            timestamp: Date.now(),
            gameTime: (typeof daysSurvived !== 'undefined') ? daysSurvived : 0,
            type: type,
            key: key,
            value: value,
            oldValue: oldValue
        };
        
        this.stateChangeLog.push(logEntry);
        
        // Keep only last 100 entries to prevent memory issues
        if (this.stateChangeLog.length > 100) {
            this.stateChangeLog = this.stateChangeLog.slice(-100);
        }
        
        if (window.DEBUG_EVENTS_V2) {
            console.log(`[EventStateManager] ${type}: ${key} = ${value}`, logEntry);
        }
    }

    // === PERSISTENCE ===

    saveToPlayer() {
        if (typeof player !== 'undefined') {
            player.eventStateV2 = {
                flags: Array.from(this.activeFlags),
                worldState: this.worldState,
                relationships: this.characterRelationships,
                reputation: this.reputation,
                questProgress: this.questProgress,
                eventHistory: this.eventHistory,
                consequenceQueue: this.consequenceQueue,
                stateChangeLog: this.stateChangeLog.slice(-20) // Save only recent logs
            };
        }
    }

    loadFromPlayer() {
        if (typeof player !== 'undefined' && player.eventStateV2) {
            const saved = player.eventStateV2;
            
            this.activeFlags = new Set(saved.flags || []);
            this.worldState = saved.worldState || {};
            this.characterRelationships = saved.relationships || {};
            this.reputation = { ...this.reputation, ...(saved.reputation || {}) };
            this.questProgress = saved.questProgress || {};
            this.eventHistory = saved.eventHistory || [];
            this.consequenceQueue = saved.consequenceQueue || [];
            this.stateChangeLog = saved.stateChangeLog || [];
            
            console.log("[EventStateManager] State loaded from player", {
                flags: this.activeFlags.size,
                relationships: Object.keys(this.characterRelationships).length,
                events: this.eventHistory.length
            });
        }
    }

    // === DEBUG & TESTING ===

    getStatus() {
        return {
            flags: Array.from(this.activeFlags),
            worldState: this.worldState,
            relationships: this.characterRelationships,
            reputation: this.reputation,
            questProgress: this.questProgress,
            eventHistory: this.eventHistory.length,
            consequenceQueue: this.consequenceQueue.filter(c => c.active).length,
            initialized: this.initialized
        };
    }

    reset() {
        this.activeFlags.clear();
        this.worldState = {};
        this.characterRelationships = {};
        this.reputation = { traders: 0, scientists: 0, military: 0, survivors: 0 };
        this.questProgress = {};
        this.eventHistory = [];
        this.consequenceQueue = [];
        this.stateChangeLog = [];
        
        if (typeof player !== 'undefined') {
            delete player.eventStateV2;
        }
        
        console.log("[EventStateManager] State reset");
    }
}

// Esporta per uso globale
if (typeof window !== 'undefined') {
    window.EventStateManager = EventStateManager;
    window.DEBUG_EVENTS_V2 = false; // Set to true for detailed logging
} 
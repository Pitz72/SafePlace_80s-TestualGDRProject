/**
 * THE SAFE PLACE - EVENT ENGINE V2.0
 * Main Controller - Orchestratore principale sistema eventi avanzati
 * FASE 5: Sistema Eventi Narrativi Avanzati
 */

class EventEngineV2 {
    constructor() {
        this.stateManager = null;
        this.triggerEngine = null;
        this.eventDatabase = null;
        this.narrativeEngine = null;
        this.initialized = false;
        this.version = "2.0.0";
        this.debugMode = false;
        
        // Runtime state
        this.activeEvents = new Map();
        this.eventQueue = [];
        this.integrationHooks = {
            movement: false,
            eventChoices: false,
            gameLoop: false
        };
        
        // Statistics
        this.stats = {
            eventsTriggered: 0,
            triggersEvaluated: 0,
            choicesProcessed: 0,
            stateChanges: 0
        };
    }

    // === INITIALIZATION ===

    async initialize() {
        console.log("[EventEngineV2] Initializing Event Engine V2.0...");
        
        try {
            // Initialize core components
            this.stateManager = new EventStateManager();
            this.triggerEngine = new TriggerEngine(this.stateManager);
            
            // Initialize narrative engine
            this.narrativeEngine = new NarrativeEngine(this.stateManager);
            
            // Load event database
            await this.loadEventDatabase();
            
            // Setup integration hooks
            this.setupIntegrationHooks();
            
            // Restore any pending events
            this.restorePendingEvents();
            
            this.initialized = true;
            console.log("[EventEngineV2] Initialization complete");
            console.log("[EventEngineV2] Status:", this.getStatus());
            
            return true;
        } catch (error) {
            console.error("[EventEngineV2] Initialization failed:", error);
            return false;
        }
    }

    async loadEventDatabase() {
        // Load the V2.0 event database
        if (typeof EVENT_DATABASE_V2 !== 'undefined') {
            this.eventDatabase = EVENT_DATABASE_V2;
            console.log("[EventEngineV2] Event database V2.0 loaded:", EventDatabaseManager.getStats());
        } else {
            // Fallback to basic structure if database not yet loaded
            this.eventDatabase = {
                environmental: {},
                character: {},
                questline: {},
                random: {}
            };
            console.warn("[EventEngineV2] Event database V2.0 not available, using fallback");
        }
    }

    setupIntegrationHooks() {
        // Hook into player movement
        if (typeof window !== 'undefined' && window.movePlayer) {
            this.hookIntoMovement();
        }
        
        // Hook into event choice system
        if (typeof window !== 'undefined' && window.handleEventChoice) {
            this.hookIntoEventChoices();
        }
        
        console.log("[EventEngineV2] Integration hooks setup:", this.integrationHooks);
    }

    restorePendingEvents() {
        // Check for any scheduled consequences or pending events
        if (this.stateManager) {
            const playerState = this.getCurrentPlayerState();
            const consequences = this.stateManager.checkScheduledConsequences(playerState);
            
            for (const consequence of consequences) {
                this.queueEvent(consequence.eventId, {
                    source: 'scheduled_consequence',
                    consequenceId: consequence.consequenceId
                });
            }
            
            if (consequences.length > 0) {
                console.log(`[EventEngineV2] Restored ${consequences.length} pending events`);
            }
        }
    }

    // === CORE EVENT PROCESSING ===

    evaluateEventTriggers(playerState) {
        if (!this.initialized) return [];
        
        const triggeredEvents = [];
        this.stats.triggersEvaluated++;
        
        try {
            // Check all events in database
            for (const [category, events] of Object.entries(this.eventDatabase)) {
                for (const [eventId, eventData] of Object.entries(events)) {
                    if (this.shouldEvaluateEvent(eventId, eventData, playerState)) {
                        if (this.triggerEngine.evaluateComplexTrigger(eventData.triggers, playerState, this.stateManager)) {
                            triggeredEvents.push({
                                id: eventId,
                                category: category,
                                data: eventData,
                                priority: eventData.priority || 5
                            });
                        }
                    }
                }
            }
            
            // Sort by priority (higher priority first)
            triggeredEvents.sort((a, b) => b.priority - a.priority);
            
            if (this.debugMode && triggeredEvents.length > 0) {
                console.log("[EventEngineV2] Triggered events:", triggeredEvents.map(e => e.id));
            }
            
        } catch (error) {
            console.error("[EventEngineV2] Error evaluating triggers:", error);
        }
        
        return triggeredEvents;
    }

    shouldEvaluateEvent(eventId, eventData, playerState) {
        // Don't evaluate if event is already active
        if (this.activeEvents.has(eventId)) {
            return false;
        }
        
        // Don't evaluate if event has already occurred and is marked as unique
        if (eventData.unique && this.stateManager.hasEventOccurred(eventId)) {
            return false;
        }
        
        // Check cooldown
        if (eventData.cooldown) {
            const lastTime = this.stateManager.getLastEventTime(eventId);
            const currentTime = (typeof daysSurvived !== 'undefined') ? daysSurvived : 0;
            if (currentTime - lastTime < eventData.cooldown) {
                return false;
            }
        }
        
        return true;
    }

    queueEvent(eventId, context = {}) {
        this.eventQueue.push({
            id: eventId,
            context: context,
            timestamp: Date.now()
        });
        
        if (this.debugMode) {
            console.log("[EventEngineV2] Event queued:", eventId);
        }
    }

    processEventQueue() {
        if (this.eventQueue.length === 0) return;
        
        // Process one event at a time to avoid overwhelming the player
        const nextEvent = this.eventQueue.shift();
        this.triggerEvent(nextEvent.id, nextEvent.context);
    }

    triggerEvent(eventId, context = {}) {
        if (!this.initialized) {
            console.warn("[EventEngineV2] Cannot trigger event - engine not initialized");
            return false;
        }
        
        try {
            // Find event in database
            let eventData = null;
            let category = null;
            
            for (const [cat, events] of Object.entries(this.eventDatabase)) {
                if (events[eventId]) {
                    eventData = events[eventId];
                    category = cat;
                    break;
                }
            }
            
            if (!eventData) {
                console.warn("[EventEngineV2] Event not found:", eventId);
                return false;
            }
            
            // Mark as active
            this.activeEvents.set(eventId, {
                data: eventData,
                context: context,
                startTime: Date.now()
            });
            
            // Convert to format compatible with existing UI system
            const eventForUI = this.convertEventForUI(eventData, context);
            
            // Set as current event for V1 compatibility
            window.currentEvent = eventForUI;
            
            // Display event using existing system
            if (typeof showEventPopup === 'function') {
                showEventPopup(eventForUI);
            } else {
                console.warn("[EventEngineV2] showEventPopup not available");
            }
            
            // Record in state
            this.stateManager.recordEvent(eventId, 'triggered', null);
            this.stats.eventsTriggered++;
            
            if (this.debugMode) {
                console.log("[EventEngineV2] Event triggered:", eventId, eventData.title);
            }
            
            return true;
            
        } catch (error) {
            console.error("[EventEngineV2] Error triggering event:", error);
            return false;
        }
    }

    convertEventForUI(eventData, context) {
        // Convert V2.0 event format to format expected by existing UI
        const uiEvent = {
            id: eventData.id,
            title: eventData.title,
            description: eventData.description || eventData.narrative,
            version: 'v2', // Mark as V2.0 event
            category: eventData.category,
            choices: []
        };
        
        // Convert branches to choices
        if (eventData.branches) {
            for (const [branchKey, branchData] of Object.entries(eventData.branches)) {
                const choice = {
                    text: branchData.text || branchKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                    branchKey: branchKey,
                    requirements: branchData.requirements,
                    narrative: branchData.narrative,
                    outcomes: branchData.outcomes
                };
                
                uiEvent.choices.push(choice);
            }
        }
        
        return uiEvent;
    }

    // === EVENT CHOICE HANDLING ===

    handleEventChoice(choiceIndex, currentEvent) {
        if (!this.initialized || !currentEvent || currentEvent.version !== 'v2') {
            return false;
        }
        
        try {
            const playerState = this.getCurrentPlayerState();
            const choice = currentEvent.choices[choiceIndex];
            
            if (!choice) {
                console.error("[EventEngineV2] Invalid choice index:", choiceIndex);
                return false;
            }
            
            // Check requirements
            if (choice.requirements && !this.meetsRequirements(choice.requirements, playerState)) {
                this.showRequirementFailure(choice.requirements);
                return false;
            }
            
            // Process choice outcome
            const outcome = this.processChoiceOutcome(choice, playerState, currentEvent);
            
            // Record choice in state
            this.stateManager.recordEvent(currentEvent.id, 'choice_made', {
                choiceIndex: choiceIndex,
                branchKey: choice.branchKey,
                outcome: outcome
            });
            
            // Mark event as completed
            this.activeEvents.delete(currentEvent.id);
            this.stats.choicesProcessed++;
            
            // Close the event popup (V1 compatibility)
            if (typeof closeEventPopup === 'function') {
                closeEventPopup();
            }
            
            // Clear current event
            window.currentEvent = null;
            
            if (this.debugMode) {
                console.log("[EventEngineV2] Choice processed:", {
                    event: currentEvent.id,
                    choice: choice.branchKey,
                    outcome: outcome
                });
            }
            
            return true;
            
        } catch (error) {
            console.error("[EventEngineV2] Error handling choice:", error);
            return false;
        }
    }

    meetsRequirements(requirements, playerState) {
        // Simple requirements check - will be expanded
        if (requirements.intelligence && playerState.intelligenza < requirements.intelligence) {
            return false;
        }
        if (requirements.caution && playerState.presagio < requirements.caution) {
            return false;
        }
        if (requirements.has_item && !this.playerHasItem(requirements.has_item, playerState)) {
            return false;
        }
        if (requirements.has_flag && !this.stateManager.hasFlag(requirements.has_flag)) {
            return false;
        }
        
        return true;
    }

    processChoiceOutcome(choice, playerState, currentEvent) {
        // Use the narrative engine for advanced outcome resolution
        if (this.narrativeEngine) {
            const eventData = this.getEventData(currentEvent.id);
            if (eventData) {
                return this.narrativeEngine.resolveEventBranch(
                    eventData, 
                    choice.branchKey, 
                    playerState, 
                    this.stateManager
                );
            }
        }
        
        // Fallback to basic outcome processing
        const outcome = {
            type: 'success',
            story: choice.narrative || "Scelta completata.",
            effects: []
        };
        
        // Apply any effects defined in the choice
        if (choice.outcomes && choice.outcomes.success && choice.outcomes.success.effects) {
            this.applyEffects(choice.outcomes.success.effects, outcome);
        }
        
        return outcome;
    }

    applyEffects(effects, outcome) {
        for (const [effectType, effectValue] of Object.entries(effects)) {
            switch (effectType) {
                case 'set_flag':
                    this.stateManager.setFlag(effectValue);
                    outcome.effects.push(`Flag impostato: ${effectValue}`);
                    break;
                    
                case 'add_item':
                    if (typeof addItemToInventory === 'function') {
                        addItemToInventory(effectValue, 1);
                        outcome.effects.push(`Ottenuto: ${effectValue}`);
                    }
                    break;
                    
                case 'unlock_events':
                    for (const eventId of effectValue) {
                        this.stateManager.setFlag(`event_${eventId}_unlocked`);
                    }
                    outcome.effects.push(`Eventi sbloccati: ${effectValue.join(', ')}`);
                    break;
                    
                case 'relationship_change':
                    for (const [character, change] of Object.entries(effectValue)) {
                        this.stateManager.modifyRelationship(character, change);
                        outcome.effects.push(`Relazione con ${character}: ${change > 0 ? '+' : ''}${change}`);
                    }
                    break;
            }
        }
        
        this.stats.stateChanges++;
    }

    // === INTEGRATION HOOKS ===

    hookIntoMovement() {
        const originalMovePlayer = window.movePlayer;
        const engineRef = this;
        
        window.movePlayer = function(dx, dy) {
            const result = originalMovePlayer(dx, dy);
            
            if (result && gameActive) {
                // V2.0 trigger evaluation
                const playerState = engineRef.getCurrentPlayerState();
                const triggeredEvents = engineRef.evaluateEventTriggers(playerState);
                
                // Queue the highest priority event if any
                if (triggeredEvents.length > 0) {
                    const topEvent = triggeredEvents[0];
                    engineRef.queueEvent(topEvent.id, { source: 'movement_trigger' });
                }
                
                // Process event queue
                engineRef.processEventQueue();
            }
            
            return result;
        };
        
        this.integrationHooks.movement = true;
        console.log("[EventEngineV2] Movement hook installed");
    }

    hookIntoEventChoices() {
        const originalHandleEventChoice = window.handleEventChoice;
        const engineRef = this;
        
        window.handleEventChoice = function(choiceIndex) {
            // Check if current event is V2.0
            if (window.currentEvent && window.currentEvent.version === 'v2') {
                return engineRef.handleEventChoice(choiceIndex, window.currentEvent);
            }
            
            // Use original system for V1 events
            return originalHandleEventChoice(choiceIndex);
        };
        
        this.integrationHooks.eventChoices = true;
        console.log("[EventEngineV2] Event choices hook installed");
    }

    // === UTILITY METHODS ===

    getCurrentPlayerState() {
        if (typeof player === 'undefined') {
            return { x: 0, y: 0, intelligenza: 0, presagio: 0 };
        }
        
        return {
            x: player.x,
            y: player.y,
            intelligenza: player.intelligenza || 0,
            presagio: player.presagio || 0,
            potenza: player.potenza || 0,
            agilita: player.agilita || 0,
            tracce: player.tracce || 0,
            influenza: player.influenza || 0,
            hp: player.hp || 100,
            maxHp: player.maxHp || 100,
            inventory: player.inventory || []
        };
    }

    playerHasItem(itemId, playerState) {
        return playerState.inventory.some(item => item.id === itemId && item.quantity > 0);
    }

    showRequirementFailure(requirements) {
        let message = "Non soddisfi i requisiti: ";
        const failedReqs = [];
        
        if (requirements.intelligence) failedReqs.push(`Intelligenza ${requirements.intelligence}`);
        if (requirements.caution) failedReqs.push(`Presagio ${requirements.caution}`);
        if (requirements.has_item) failedReqs.push(`Oggetto: ${requirements.has_item}`);
        
        message += failedReqs.join(', ');
        
        if (typeof addMessage === 'function') {
            addMessage(message, 'warning');
        }
    }

    // === DEBUG & MANAGEMENT ===

    setDebugMode(enabled) {
        this.debugMode = enabled;
        if (this.triggerEngine) {
            this.triggerEngine.setDebugMode(enabled);
        }
        console.log(`[EventEngineV2] Debug mode ${enabled ? 'enabled' : 'disabled'}`);
    }

    getStatus() {
        return {
            version: this.version,
            initialized: this.initialized,
            debugMode: this.debugMode,
            activeEvents: this.activeEvents.size,
            queuedEvents: this.eventQueue.length,
            integrationHooks: this.integrationHooks,
            stats: this.stats,
            stateManager: this.stateManager ? this.stateManager.getStatus() : null,
            triggerEngine: this.triggerEngine ? this.triggerEngine.getStatus() : null
        };
    }

    reset() {
        console.log("[EventEngineV2] Resetting Event Engine V2.0...");
        
        this.activeEvents.clear();
        this.eventQueue = [];
        this.stats = {
            eventsTriggered: 0,
            triggersEvaluated: 0,
            choicesProcessed: 0,
            stateChanges: 0
        };
        
        if (this.stateManager) {
            this.stateManager.reset();
        }
        
        if (this.triggerEngine) {
            this.triggerEngine.clearCache();
        }
        
        console.log("[EventEngineV2] Reset complete");
    }

    // === API METHODS FOR TESTING ===

    test() {
        console.log("=== EVENT ENGINE V2.0 TEST ===");
        console.log("Status:", this.getStatus());
        
        // Test state manager
        if (this.stateManager) {
            this.stateManager.setFlag('test_flag', true);
            console.log("Test flag set:", this.stateManager.hasFlag('test_flag'));
        }
        
        // Test trigger engine
        if (this.triggerEngine) {
            const testTrigger = { requires: ['test_flag'] };
            const playerState = this.getCurrentPlayerState();
            const result = this.triggerEngine.evaluateComplexTrigger(testTrigger, playerState);
            console.log("Test trigger result:", result);
        }
        
        console.log("=== TEST COMPLETE ===");
    }

    getEventData(eventId) {
        // Helper method to find event data by ID
        for (const [category, events] of Object.entries(this.eventDatabase)) {
            if (events[eventId]) {
                return events[eventId];
            }
        }
        return null;
    }
}

// Initialize global instance
if (typeof window !== 'undefined') {
    window.EventEngineV2Instance = new EventEngineV2();
    
    // Auto-initialize if DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.EventEngineV2Instance.initialize();
        });
    } else {
        // DOM already loaded
        setTimeout(() => window.EventEngineV2Instance.initialize(), 100);
    }
    
    // Expose for console testing
    window.EventEngineV2 = EventEngineV2;
} 
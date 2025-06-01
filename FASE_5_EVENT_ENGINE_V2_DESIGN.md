# 🎭 FASE 5: EVENT ENGINE V2.0 - DESIGN ARCHITETTURALE

## 📅 **STARTED: 1 Giugno 2025 - FASE 5 FOUNDATION**

---

## 🎯 **OBIETTIVO: DA 10 A 50+ EVENTI NARRATIVI COMPLESSI**

### **Situazione Attuale:**
- ✅ **10 Eventi Lore** lineari funzionanti (`lore_events_linear.js`)
- ✅ **LoreEventManager** con trigger intelligenti
- ✅ **Sistema base** in `events.js` per eventi tile-based
- ❌ **Limitazioni**: Eventi semplici, branching minimo, no persistent state

### **Obiettivo V2.0:**
- 🎯 **50+ Eventi** complessi con branching multiplo
- 🧠 **Persistent Narrative State** - decisioni che influenzano il futuro
- 🌐 **Cross-Event Dependencies** - eventi che si riferiscono a scelte precedenti
- 📊 **Advanced Trigger System** - trigger multi-condizionali complessi

---

## 🏗️ **ARCHITETTURA EVENT ENGINE V2.0**

### **1. EVENT STORAGE & MANAGEMENT**

#### **A. Event Database Structure**
```javascript
// js/events_v2/event_database_v2.js
const EVENT_DATABASE_V2 = {
    // CATEGORY: ENVIRONMENTAL STORY EVENTS
    "environmental": {
        "abandoned_laboratory": {
            id: "abandoned_laboratory",
            title: "Laboratorio Abbandonato",
            category: "environmental",
            tier: 2, // 1=early, 2=mid, 3=late game
            triggers: {
                location: { types: ["city", "village"] },
                requires: ["has_keycard", "!destroyed_lab"],
                distance_safe_place: { min: 80, max: 150 },
                previous_events: ["found_research_notes"],
                player_stats: { intelligence: { min: 8 } }
            },
            persistent_effects: {
                flags: ["discovered_chimera_project"],
                world_state: { lab_status: "explored" },
                reputation: { scientists: +2, military: -1 }
            },
            branches: {
                "investigate_computers": {
                    requirements: { intelligence: 12 },
                    narrative: "I terminali ancora funzionano...",
                    outcomes: {
                        success: {
                            story: "Decripti i file: Progetto Chimera Phase 3",
                            effects: {
                                add_lore_fragment: "chimera_phase_3",
                                unlock_events: ["military_bunker_access"],
                                set_flag: "knows_chimera_truth"
                            }
                        },
                        failure: {
                            story: "Sistema compromesso, allarme attivato",
                            effects: {
                                spawn_event: "security_chase",
                                damage: { value: 10, type: "electrical" }
                            }
                        }
                    }
                },
                "search_samples": {
                    requirements: { caution: 10 },
                    narrative: "I contenitori criogenici sono intatti...",
                    outcomes: {
                        success: {
                            story: "Trovi campioni biologici stabilizzati",
                            effects: {
                                add_item: "bio_sample_alpha",
                                add_knowledge: "bio_enhancement_theory",
                                set_flag: "has_dangerous_samples"
                            }
                        }
                    }
                }
            }
        }
    },

    // CATEGORY: CHARACTER INTERACTION EVENTS  
    "character": {
        "mysterious_trader": {
            id: "mysterious_trader",
            title: "Il Mercante Misterioso",
            category: "character",
            tier: 2,
            triggers: {
                reputation: { traders: { min: 5 } },
                has_items: ["rare_artifact", "pre_war_tech"],
                not_flags: ["trader_betrayed", "trader_dead"]
            },
            character_data: {
                name: "Viktor 'Il Collezionista'",
                personality: ["cunning", "knowledge_hungry"],
                history: "Ex-scienziato del Progetto Chimera",
                relationship: 0 // Tracking rapporto con giocatore
            },
            branches: {
                "trade_artifacts": {
                    requirements: { has_item: "rare_artifact" },
                    narrative: "Viktor esamina il tuo artefatto...",
                    dynamic_outcomes: true, // Outcome basato su relationship
                    relationship_modifiers: {
                        trust_threshold: 8,
                        outcomes: {
                            high_trust: {
                                story: "Ti offre informazioni esclusive",
                                effects: {
                                    reveal_map: { type: "secret_locations", radius: 5 },
                                    unlock_trader_tier: "legendary",
                                    relationship_change: +2
                                }
                            },
                            low_trust: {
                                story: "Transazione standard, niente di più",
                                effects: {
                                    trade_multiplier: 0.8,
                                    relationship_change: +1
                                }
                            }
                        }
                    }
                },
                "ask_about_chimera": {
                    requirements: { has_flag: "knows_chimera_truth" },
                    narrative: "I suoi occhi si stringono quando menzioni Chimera...",
                    outcomes: {
                        success: {
                            story: "Confessa il suo coinvolgimento nel progetto",
                            effects: {
                                unlock_events: ["chimera_informant_questline"],
                                set_relationship: { viktor: 15 },
                                add_lore_fragment: "chimera_insider_truth"
                            }
                        }
                    }
                }
            }
        }
    },

    // CATEGORY: QUEST CHAINS
    "questline": {
        "chimera_conspiracy": {
            id: "chimera_conspiracy",
            title: "La Cospirazione Chimera",
            category: "questline",
            tier: 3,
            chain_length: 5, // Multi-part quest
            current_step: 0,
            steps: [
                {
                    step: 1,
                    triggers: { has_flag: "knows_chimera_truth" },
                    title: "Tracce del Passato",
                    objectives: ["find_3_research_facilities", "collect_data_fragments"]
                },
                {
                    step: 2,
                    triggers: { 
                        completed_objectives: ["find_3_research_facilities"],
                        has_items: ["data_fragment_a", "data_fragment_b", "data_fragment_c"]
                    },
                    title: "La Verità Emerge",
                    narrative: "I frammenti rivelano coordinate...",
                    unlock_events: ["hidden_vault_access"]
                }
                // ... steps 3-5
            ]
        }
    }
};
```

#### **B. Event State Manager**
```javascript
// js/events_v2/event_state_manager.js
class EventStateManager {
    constructor() {
        this.activeFlags = new Set();
        this.worldState = {};
        this.characterRelationships = {};
        this.questProgress = {};
        this.eventHistory = [];
        this.consequenceQueue = []; // Eventi schedulati per il futuro
    }

    // Persistent State Tracking
    setFlag(flagName, value = true) {
        if (value) this.activeFlags.add(flagName);
        else this.activeFlags.delete(flagName);
        this.logStateChange('flag', flagName, value);
    }

    hasFlag(flagName) {
        return this.activeFlags.has(flagName);
    }

    setWorldState(key, value) {
        this.worldState[key] = value;
        this.logStateChange('world_state', key, value);
    }

    // Relationship tracking
    modifyRelationship(character, change) {
        if (!this.characterRelationships[character]) {
            this.characterRelationships[character] = 0;
        }
        this.characterRelationships[character] += change;
        this.logStateChange('relationship', character, change);
    }

    // Schedule future consequences
    scheduleConsequence(triggerCondition, eventId, delay = 0) {
        this.consequenceQueue.push({
            trigger: triggerCondition,
            eventId: eventId,
            scheduledTime: Date.now() + delay,
            active: true
        });
    }

    // Check for triggered consequences
    checkScheduledConsequences(playerState) {
        const triggeredEvents = [];
        for (const consequence of this.consequenceQueue) {
            if (consequence.active && this.evaluateConsequenceTrigger(consequence.trigger, playerState)) {
                triggeredEvents.push(consequence.eventId);
                consequence.active = false;
            }
        }
        return triggeredEvents;
    }
}
```

### **2. ADVANCED TRIGGER SYSTEM**

#### **A. Multi-Conditional Triggers**
```javascript
// js/events_v2/trigger_engine_v2.js
class TriggerEngine {
    evaluateComplexTrigger(trigger, playerState, eventState) {
        const conditions = [];

        // Location-based triggers
        if (trigger.location) {
            conditions.push(this.checkLocationTrigger(trigger.location, playerState));
        }

        // State-based triggers (flags, world state)
        if (trigger.requires) {
            conditions.push(this.checkRequirementsTrigger(trigger.requires, eventState));
        }

        // Temporal triggers (time, sequence, cooldowns)
        if (trigger.temporal) {
            conditions.push(this.checkTemporalTrigger(trigger.temporal, playerState));
        }

        // Statistical triggers (player stats, progress)
        if (trigger.player_stats) {
            conditions.push(this.checkStatsTrigger(trigger.player_stats, playerState));
        }

        // Event dependency triggers
        if (trigger.previous_events) {
            conditions.push(this.checkEventDependency(trigger.previous_events, eventState));
        }

        // Dynamic probability triggers
        if (trigger.probability) {
            conditions.push(this.checkProbabilityTrigger(trigger.probability, playerState));
        }

        // Evaluate logical combination (AND, OR, NOT operations)
        return this.evaluateLogicalCondition(trigger.logic || 'AND', conditions);
    }

    checkRequirementsTrigger(requirements, eventState) {
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

    checkEventDependency(eventList, eventState) {
        return eventList.every(eventId => 
            eventState.eventHistory.some(e => e.id === eventId)
        );
    }
}
```

### **3. NARRATIVE BRANCHING SYSTEM**

#### **A. Dynamic Outcome Resolution**
```javascript
// js/events_v2/narrative_engine.js
class NarrativeEngine {
    resolveEventBranch(eventData, chosenBranch, playerState, eventState) {
        const branch = eventData.branches[chosenBranch];
        
        // Check requirements
        if (!this.meetsRequirements(branch.requirements, playerState)) {
            return this.generateFailureOutcome(branch, "requirements_not_met");
        }

        // Dynamic outcome selection
        if (branch.dynamic_outcomes) {
            return this.resolveDynamicOutcome(branch, playerState, eventState);
        }

        // Standard skill check outcome
        if (branch.skill_check) {
            return this.resolveSkillCheck(branch, playerState);
        }

        // Direct outcome
        return this.applyDirectOutcome(branch.outcomes.success);
    }

    resolveDynamicOutcome(branch, playerState, eventState) {
        // Relationship-based outcomes
        if (branch.relationship_modifiers) {
            const character = branch.relationship_modifiers.character;
            const relationship = eventState.characterRelationships[character] || 0;
            const threshold = branch.relationship_modifiers.trust_threshold;
            
            if (relationship >= threshold) {
                return this.applyDirectOutcome(branch.relationship_modifiers.outcomes.high_trust);
            } else {
                return this.applyDirectOutcome(branch.relationship_modifiers.outcomes.low_trust);
            }
        }

        // Reputation-based outcomes
        if (branch.reputation_modifiers) {
            return this.resolveReputationOutcome(branch, playerState);
        }

        // Previous choices influence
        if (branch.history_dependent) {
            return this.resolveHistoryDependentOutcome(branch, eventState);
        }

        return this.applyDirectOutcome(branch.outcomes.default);
    }

    applyEffects(effects, playerState, eventState) {
        const results = [];

        // Immediate effects
        if (effects.add_item) {
            this.addItemToPlayer(effects.add_item, playerState);
            results.push(`Acquired: ${effects.add_item}`);
        }

        if (effects.set_flag) {
            eventState.setFlag(effects.set_flag);
            results.push(`State changed: ${effects.set_flag}`);
        }

        if (effects.unlock_events) {
            this.unlockEvents(effects.unlock_events, eventState);
            results.push(`New events available: ${effects.unlock_events.join(', ')}`);
        }

        // Persistent effects
        if (effects.world_state) {
            Object.entries(effects.world_state).forEach(([key, value]) => {
                eventState.setWorldState(key, value);
            });
        }

        if (effects.relationship_change) {
            Object.entries(effects.relationship_change).forEach(([character, change]) => {
                eventState.modifyRelationship(character, change);
            });
        }

        // Future consequences
        if (effects.schedule_event) {
            eventState.scheduleConsequence(
                effects.schedule_event.trigger,
                effects.schedule_event.event_id,
                effects.schedule_event.delay
            );
        }

        return results;
    }
}
```

---

## 🧩 **INTEGRAZIONE CON SISTEMA ESISTENTE**

### **1. Retrocompatibilità Completa**
- ✅ **Mantiene** tutto il sistema `events.js` esistente
- ✅ **Estende** `LoreEventManager` con V2.0 capabilities
- ✅ **Preserva** tutti i 10 eventi lore lineari attuali

### **2. Hook Points**
```javascript
// js/events_v2/integration_hooks.js
const EventEngineIntegration = {
    // Hook nel movimento per trigger V2.0
    hookIntoMovement() {
        const originalMovePlayer = window.movePlayer;
        window.movePlayer = function(dx, dy) {
            const result = originalMovePlayer(dx, dy);
            if (result && gameActive) {
                // Sistema V1 (mantiene funzionalità esistenti)
                EventEngineV1.checkLoreEvents(playerState);
                
                // Sistema V2 (nuove funzionalità avanzate)
                EventEngineV2.evaluateComplexTriggers(playerState);
            }
            return result;
        };
    },

    // Hook nelle scelte degli eventi
    hookIntoEventChoices() {
        const originalHandleEventChoice = window.handleEventChoice;
        window.handleEventChoice = function(choiceIndex) {
            // Controlla se è un evento V2.0
            if (currentEvent && currentEvent.version === 'v2') {
                return EventEngineV2.handleChoice(choiceIndex, currentEvent);
            }
            // Altrimenti usa sistema originale
            return originalHandleEventChoice(choiceIndex);
        };
    }
};
```

---

## 🚀 **PLAN IMPLEMENTAZIONE IMMEDIATA**

### **STEP 1: Core Foundation (OGGI - 2 ore)**
- [ ] Crea struttura directory `js/events_v2/`
- [ ] Implementa `EventStateManager` base
- [ ] Implementa `TriggerEngine` core
- [ ] Setup integrazione con sistema esistente

### **STEP 2: Database & First Events (DOMANI - 3 ore)**
- [ ] Crea `event_database_v2.js` con struttura
- [ ] Implementa primi 5 eventi V2.0 complessi
- [ ] Sistema di branching narrativo base
- [ ] Testing framework per eventi V2.0

### **STEP 3: Advanced Features (2-3 giorni)**
- [ ] Relationship tracking completo
- [ ] Quest chain system
- [ ] Consequence scheduling
- [ ] Visual improvements per eventi complessi

---

## 🎯 **SUCCESS METRICS**

### **Immediate (24h):**
- ✅ EventEngineV2 core funzionante
- ✅ 5 eventi complessi con branching
- ✅ Zero regressioni su sistema esistente

### **Short-term (1 settimana):**
- ✅ 20+ eventi V2.0 implementati
- ✅ Quest chain system operativo
- ✅ Persistent narrative state

### **Phase 5 Complete (3-4 giorni):**
- ✅ 50+ eventi narrativi complessi
- ✅ Sistema reputation/relationship
- ✅ Multi-layer story arcs

---

## 💡 **ARCHITETTURA SCALABILE**

### **Design Principles:**
1. **Modular**: Ogni componente indipendente e testabile
2. **Extensible**: Facile aggiungere nuovi tipi di eventi
3. **Performant**: Trigger evaluation ottimizzata
4. **Data-Driven**: Eventi definiti in JSON/objects, no hard-coding
5. **Backward Compatible**: Non rompe nulla di esistente

### **Future-Proof:**
- Sistema pronto per **FASE 6** (Economy & Trading)
- Hooks per **FASE 7** (Faction System) 
- Foundation per **FASE 8** (Environmental Storytelling)

---

**Event Engine V2.0 is ready to transform The Safe Place da survival game a rich narrative experience.** 🎭✨ 
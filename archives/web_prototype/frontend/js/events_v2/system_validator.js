/**
 * THE SAFE PLACE - EVENT ENGINE V2.0
 * System Validator - Testing e validazione caricamento sistema
 * FASE 5 STEP 3: System Integration Testing
 */

class EventEngineValidator {
    constructor() {
        this.testResults = [];
        this.validationComplete = false;
    }

    // === MAIN VALIDATION SUITE ===

    async runFullValidation() {
        console.log("🧪 [EventEngineValidator] Starting Event Engine V2.0 validation...");
        this.testResults = [];
        
        try {
            // Test 1: Component Loading
            await this.validateComponentLoading();
            
            // Test 2: System Initialization
            await this.validateSystemInitialization();
            
            // Test 3: Database Integrity
            await this.validateDatabaseIntegrity();
            
            // Test 4: Integration Hooks
            await this.validateIntegrationHooks();
            
            // Test 5: Basic Functionality
            await this.validateBasicFunctionality();
            
            this.validationComplete = true;
            this.reportResults();
            
        } catch (error) {
            console.error("❌ [EventEngineValidator] Validation failed:", error);
            this.addResult('VALIDATION_SUITE', false, error.message);
        }
        
        return this.getValidationSummary();
    }

    // === INDIVIDUAL VALIDATION TESTS ===

    async validateComponentLoading() {
        console.log("🔍 Testing component loading...");
        
        // Check core classes are defined
        this.addResult('EventStateManager_Class', typeof EventStateManager !== 'undefined', 
            typeof EventStateManager !== 'undefined' ? 'Loaded' : 'Not found');
            
        this.addResult('TriggerEngine_Class', typeof TriggerEngine !== 'undefined',
            typeof TriggerEngine !== 'undefined' ? 'Loaded' : 'Not found');
            
        this.addResult('NarrativeEngine_Class', typeof NarrativeEngine !== 'undefined',
            typeof NarrativeEngine !== 'undefined' ? 'Loaded' : 'Not found');
            
        this.addResult('EventEngineV2_Class', typeof EventEngineV2 !== 'undefined',
            typeof EventEngineV2 !== 'undefined' ? 'Loaded' : 'Not found');
            
        // Check database is loaded
        this.addResult('EVENT_DATABASE_V2', typeof EVENT_DATABASE_V2 !== 'undefined',
            typeof EVENT_DATABASE_V2 !== 'undefined' ? 'Database loaded' : 'Database missing');
            
        this.addResult('EventDatabaseManager', typeof EventDatabaseManager !== 'undefined',
            typeof EventDatabaseManager !== 'undefined' ? 'Manager loaded' : 'Manager missing');
    }

    async validateSystemInitialization() {
        console.log("🔍 Testing system initialization...");
        
        // Check EventEngineV2 instance
        this.addResult('EventEngineV2Instance', typeof EventEngineV2Instance !== 'undefined',
            typeof EventEngineV2Instance !== 'undefined' ? 'Instance created' : 'Instance missing');
            
        if (typeof EventEngineV2Instance !== 'undefined') {
            // Check initialization status
            const status = EventEngineV2Instance.getStatus();
            this.addResult('System_Initialized', status.initialized, 
                status.initialized ? 'System ready' : 'System not initialized');
                
            // Check components
            this.addResult('StateManager_Ready', !!EventEngineV2Instance.stateManager,
                EventEngineV2Instance.stateManager ? 'State manager active' : 'State manager missing');
                
            this.addResult('TriggerEngine_Ready', !!EventEngineV2Instance.triggerEngine,
                EventEngineV2Instance.triggerEngine ? 'Trigger engine active' : 'Trigger engine missing');
                
            this.addResult('NarrativeEngine_Ready', !!EventEngineV2Instance.narrativeEngine,
                EventEngineV2Instance.narrativeEngine ? 'Narrative engine active' : 'Narrative engine missing');
        }
    }

    async validateDatabaseIntegrity() {
        console.log("🔍 Testing database integrity...");
        
        if (typeof EventDatabaseManager !== 'undefined') {
            const stats = EventDatabaseManager.getStats();
            
            this.addResult('Database_TotalEvents', stats.totalEvents >= 10,
                `${stats.totalEvents} events loaded (expected >= 10)`);
                
            this.addResult('Database_Environmental', stats.categoryStats.environmental >= 5,
                `${stats.categoryStats.environmental} environmental events (expected >= 5)`);
                
            this.addResult('Database_Character', stats.categoryStats.character >= 3,
                `${stats.categoryStats.character} character events (expected >= 3)`);
                
            this.addResult('Database_Questline', stats.categoryStats.questline >= 2,
                `${stats.categoryStats.questline} questline events (expected >= 2)`);
                
            // Test specific events
            const labEvent = EventDatabaseManager.getEvent('abandoned_laboratory');
            this.addResult('Event_Laboratory', !!labEvent,
                labEvent ? 'Laboratory event found' : 'Laboratory event missing');
                
            const traderEvent = EventDatabaseManager.getEvent('mysterious_trader');
            this.addResult('Event_Trader', !!traderEvent,
                traderEvent ? 'Trader event found' : 'Trader event missing');
        }
    }

    async validateIntegrationHooks() {
        console.log("🔍 Testing integration hooks...");
        
        if (typeof EventEngineV2Instance !== 'undefined') {
            const status = EventEngineV2Instance.getStatus();
            
            this.addResult('Hook_Movement', status.integrationHooks?.movement,
                status.integrationHooks?.movement ? 'Movement hook installed' : 'Movement hook missing');
                
            this.addResult('Hook_EventChoices', status.integrationHooks?.eventChoices,
                status.integrationHooks?.eventChoices ? 'Event choice hook installed' : 'Event choice hook missing');
        }
        
        // Test backward compatibility
        this.addResult('V1_Compatibility', typeof player !== 'undefined',
            typeof player !== 'undefined' ? 'Player object accessible' : 'Player object missing');
            
        this.addResult('V1_Events', typeof showEventPopup !== 'undefined',
            typeof showEventPopup !== 'undefined' ? 'V1 event system accessible' : 'V1 event system missing');
    }

    async validateBasicFunctionality() {
        console.log("🔍 Testing basic functionality...");
        
        if (typeof EventEngineV2Instance !== 'undefined' && EventEngineV2Instance.stateManager) {
            // Test state management
            try {
                const stateManager = EventEngineV2Instance.stateManager;
                
                // Test flag operations
                stateManager.setFlag('test_validation_flag');
                const flagSet = stateManager.hasFlag('test_validation_flag');
                this.addResult('StateManager_Flags', flagSet, 
                    flagSet ? 'Flag operations working' : 'Flag operations failed');
                
                // Test relationships
                stateManager.modifyRelationship('test_character', 5);
                const relationship = stateManager.getRelationship('test_character');
                this.addResult('StateManager_Relationships', relationship === 5,
                    relationship === 5 ? 'Relationship tracking working' : 'Relationship tracking failed');
                    
                // Clean up test data
                stateManager.setFlag('test_validation_flag', false);
                stateManager.modifyRelationship('test_character', -5);
                
            } catch (error) {
                this.addResult('StateManager_Basic', false, `Error: ${error.message}`);
            }
        }
        
        if (typeof EventEngineV2Instance !== 'undefined' && EventEngineV2Instance.triggerEngine) {
            // Test trigger engine
            try {
                const triggerEngine = EventEngineV2Instance.triggerEngine;
                const playerState = { x: 100, y: 100, intelligenza: 10 };
                
                // Test simple trigger
                const simpleTrigger = { 
                    location: { types: ["city"] },
                    player_stats: { intelligenza: { min: 5 } }
                };
                
                // This should work even without matching location type
                const result = triggerEngine.evaluateComplexTrigger(simpleTrigger, playerState);
                this.addResult('TriggerEngine_Basic', result !== undefined,
                    result !== undefined ? 'Trigger evaluation working' : 'Trigger evaluation failed');
                    
            } catch (error) {
                this.addResult('TriggerEngine_Basic', false, `Error: ${error.message}`);
            }
        }
    }

    // === UTILITY METHODS ===

    addResult(testName, passed, details) {
        this.testResults.push({
            test: testName,
            passed: passed,
            details: details,
            timestamp: Date.now()
        });
        
        const status = passed ? '✅' : '❌';
        console.log(`${status} ${testName}: ${details}`);
    }

    reportResults() {
        const passed = this.testResults.filter(r => r.passed).length;
        const total = this.testResults.length;
        const passRate = ((passed / total) * 100).toFixed(1);
        
        console.log(`\n📊 [EventEngineValidator] Validation Complete`);
        console.log(`📈 Results: ${passed}/${total} tests passed (${passRate}%)`);
        
        if (passed === total) {
            console.log(`🎉 All tests passed! Event Engine V2.0 is ready.`);
        } else {
            console.log(`⚠️ Some tests failed. Check issues before proceeding.`);
            
            // Show failed tests
            const failed = this.testResults.filter(r => !r.passed);
            console.log('\n❌ Failed Tests:');
            failed.forEach(test => {
                console.log(`  - ${test.test}: ${test.details}`);
            });
        }
    }

    getValidationSummary() {
        const passed = this.testResults.filter(r => r.passed).length;
        const total = this.testResults.length;
        
        return {
            validationComplete: this.validationComplete,
            passRate: ((passed / total) * 100).toFixed(1),
            passedTests: passed,
            totalTests: total,
            results: this.testResults,
            readyForProduction: passed === total
        };
    }

    // === QUICK VALIDATION ===

    quickSystemCheck() {
        console.log("⚡ [EventEngineValidator] Quick system check...");
        
        const checks = [
            { name: 'EventEngineV2Instance', check: typeof EventEngineV2Instance !== 'undefined' },
            { name: 'EVENT_DATABASE_V2', check: typeof EVENT_DATABASE_V2 !== 'undefined' },
            { name: 'EventDatabaseManager', check: typeof EventDatabaseManager !== 'undefined' },
            { name: 'System Initialized', check: EventEngineV2Instance?.getStatus()?.initialized }
        ];
        
        const allGood = checks.every(check => check.check);
        
        checks.forEach(check => {
            const status = check.check ? '✅' : '❌';
            console.log(`${status} ${check.name}`);
        });
        
        if (allGood) {
            console.log(`🎉 Quick check: Event Engine V2.0 operational!`);
        } else {
            console.log(`⚠️ Quick check: Issues detected, run full validation.`);
        }
        
        return allGood;
    }
}

// Global instance for easy access
if (typeof window !== 'undefined') {
    window.EventEngineValidator = EventEngineValidator;
    window.eventValidator = new EventEngineValidator();
    
    // Auto-run quick check when loaded
    setTimeout(() => {
        if (window.eventValidator) {
            window.eventValidator.quickSystemCheck();
        }
    }, 1000);
} 
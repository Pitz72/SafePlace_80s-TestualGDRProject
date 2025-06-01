/**
 * DEBUG LOADER - Identifica errori nei file events_v2
 */

console.log("🔍 [DEBUG] Loading events_v2 debug loader...");

// Test 1: EventStateManager
try {
    if (typeof EventStateManager !== 'undefined') {
        console.log("✅ [DEBUG] EventStateManager loaded");
    } else {
        console.log("❌ [DEBUG] EventStateManager NOT defined");
    }
} catch (error) {
    console.error("❌ [DEBUG] EventStateManager error:", error);
}

// Test 2: TriggerEngine
try {
    if (typeof TriggerEngine !== 'undefined') {
        console.log("✅ [DEBUG] TriggerEngine loaded");
    } else {
        console.log("❌ [DEBUG] TriggerEngine NOT defined");
    }
} catch (error) {
    console.error("❌ [DEBUG] TriggerEngine error:", error);
}

// Test 3: EVENT_DATABASE_V2
try {
    if (typeof EVENT_DATABASE_V2 !== 'undefined') {
        console.log("✅ [DEBUG] EVENT_DATABASE_V2 loaded");
    } else {
        console.log("❌ [DEBUG] EVENT_DATABASE_V2 NOT defined");
    }
} catch (error) {
    console.error("❌ [DEBUG] EVENT_DATABASE_V2 error:", error);
}

// Test 4: EventDatabaseManager
try {
    if (typeof EventDatabaseManager !== 'undefined') {
        console.log("✅ [DEBUG] EventDatabaseManager loaded");
    } else {
        console.log("❌ [DEBUG] EventDatabaseManager NOT defined");
    }
} catch (error) {
    console.error("❌ [DEBUG] EventDatabaseManager error:", error);
}

// Test 5: NarrativeEngine
try {
    if (typeof NarrativeEngine !== 'undefined') {
        console.log("✅ [DEBUG] NarrativeEngine loaded");
    } else {
        console.log("❌ [DEBUG] NarrativeEngine NOT defined");
    }
} catch (error) {
    console.error("❌ [DEBUG] NarrativeEngine error:", error);
}

// Test 6: EventEngineV2
try {
    if (typeof EventEngineV2 !== 'undefined') {
        console.log("✅ [DEBUG] EventEngineV2 loaded");
    } else {
        console.log("❌ [DEBUG] EventEngineV2 NOT defined");
    }
} catch (error) {
    console.error("❌ [DEBUG] EventEngineV2 error:", error);
}

// Test 7: EventEngineV2Instance
try {
    if (typeof EventEngineV2Instance !== 'undefined') {
        console.log("✅ [DEBUG] EventEngineV2Instance loaded");
    } else {
        console.log("❌ [DEBUG] EventEngineV2Instance NOT defined");
    }
} catch (error) {
    console.error("❌ [DEBUG] EventEngineV2Instance error:", error);
}

// Debug current event on choice click
window.debugEventChoice = function(choiceIndex) {
    console.log("🔍 [DEBUG] Event choice clicked:");
    console.log("Choice Index:", choiceIndex);
    console.log("Current Event:", window.currentEvent);
    console.log("Current Event Version:", window.currentEvent?.version);
    console.log("Current Event Choices:", window.currentEvent?.choices);
    console.log("Event Database V2 available:", typeof EVENT_DATABASE_V2 !== 'undefined');
};

// Hook into handleEventChoice to debug
setTimeout(() => {
    if (window.handleEventChoice) {
        const originalHandleEventChoice = window.handleEventChoice;
        window.handleEventChoice = function(choiceIndex) {
            console.log("🔍 [DEBUG] handleEventChoice called with:", choiceIndex);
            console.log("🔍 [DEBUG] Current event details:", window.currentEvent);
            return originalHandleEventChoice(choiceIndex);
        };
        console.log("🔍 [DEBUG] handleEventChoice hook installed");
    }
}, 2000);

console.log("🔍 [DEBUG] Debug loader complete"); 
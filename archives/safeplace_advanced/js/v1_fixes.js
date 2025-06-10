/**
 * THE SAFE PLACE - FIX v1.0.0
 * Correzioni per i problemi emersi dal test
 */

// 1. Correzione firma del padre nell'evento iniziale
if (typeof LORE_EVENTS_LINEAR !== 'undefined') {
    const eventoIniziale = LORE_EVENTS_LINEAR.find(e => e.id === 'lore_echo_of_departure');
    if (eventoIniziale) {
        // Sostituisci "Marcus" con "Papà" nella descrizione
        eventoIniziale.description = eventoIniziale.description.replace('Con tutto l\'amore che un padre può dare, Marcus.', 'Con tutto l\'amore che un padre può dare, Papà.');
    }
}

// 2. Fix per moveButtons non definito - sostituiamo con sistema vuoto
if (!DOM.moveButtons) {
    DOM.moveButtons = []; // Array vuoto per evitare errori
}

// 3. Rendere visibile il giorno corrente
const originalRenderStats = window.renderStats;
window.renderStats = function() {
    // Chiama la funzione originale
    if (originalRenderStats) originalRenderStats.apply(this, arguments);
    
    // Aggiungi il giorno corrente se non è già mostrato
    if (DOM.statDayTime && typeof daysSurvived !== 'undefined') {
        const timeText = DOM.statDayTime.textContent;
        if (!timeText.includes('Giorno')) {
            DOM.statDayTime.textContent = `Giorno ${daysSurvived} - ${timeText}`;
        }
    }
};

// 4. Sistema migliorato per trigger eventi lore
window.LORE_EVENT_CONFIG = {
    // Chance base di trigger (10%)
    baseChance: 0.10,
    
    // Moltiplicatori per condizioni specifiche
    multipliers: {
        nearSafePlace: 2.0,    // Raddoppia vicino al Safe Place
        correctDay: 3.0,       // Triplica nel giorno giusto
        hasPrerequisites: 1.5, // +50% se ha i prerequisiti
        nightTime: 0.5        // Dimezza di notte
    },
    
    // Override manuale per test
    debugMode: false,
    forceNextEvent: false
};

// 5. Fix CombatSystem non trovato
if (typeof window.CombatSystem === 'undefined' && typeof CombatSystem !== 'undefined') {
    window.CombatSystem = CombatSystem;
}

// 6. Migliora distribuzione armi nel loot
if (typeof RANDOM_ITEM_TABLES !== 'undefined') {
    // Aggiungi più armi nella tabella weapon
    if (!RANDOM_ITEM_TABLES.weapon) {
        RANDOM_ITEM_TABLES.weapon = {};
    }
    
    // Aumenta la probabilità di trovare armi base
    RANDOM_ITEM_TABLES.weapon = {
        ...RANDOM_ITEM_TABLES.weapon,
        'weapon_knife_rusty': 30,
        'weapon_club_improvised': 25,
        'weapon_pistol_old': 15,
        'weapon_crowbar': 20,
        'weapon_axe_hatchet': 10
    };
    
    // Aggiungi armi nelle tabelle di loot generiche
    if (RANDOM_ITEM_TABLES.generic_loot) {
        RANDOM_ITEM_TABLES.generic_loot['weapon_knife_rusty'] = 5;
        RANDOM_ITEM_TABLES.generic_loot['weapon_club_improvised'] = 5;
    }
}

// 7. Bilanciamento materiali crafting
if (typeof RANDOM_ITEM_TABLES !== 'undefined') {
    // Aumenta materiali base nelle tabelle di loot
    const materials = ['scrap_metal', 'wood_planks', 'cloth_rags', 'plastic_containers'];
    
    for (const table of Object.values(RANDOM_ITEM_TABLES)) {
        if (typeof table === 'object' && table !== null) {
            materials.forEach(mat => {
                if (!table[mat]) {
                    table[mat] = 10; // Aggiungi con probabilità base
                } else {
                    table[mat] = Math.min(table[mat] * 1.5, 50); // Aumenta del 50%
                }
            });
        }
    }
}

// 8. Fix per il comando 'I' nell'inventario
document.addEventListener('keydown', function(e) {
    if (e.key === 'i' || e.key === 'I') {
        // Se c'è un popup aperto, non fare nulla
        if (DOM.eventOverlay && DOM.eventOverlay.classList.contains('visible')) {
            return;
        }
        
        // Se siamo nel gioco, mostra gestione inventario
        if (gameActive && DOM.gameContainer && DOM.gameContainer.style.display !== 'none') {
            e.preventDefault();
            if (typeof showInventoryManagement === 'function') {
                showInventoryManagement();
            }
        }
    }
});

// 9. Debug helper per test rapidi
window.V1_TEST = {
    // Forza l'evento lore successivo
    forceNextLoreEvent: function() {
        if (typeof getNextLoreEvent === 'function' && typeof showEventPopup === 'function') {
            const nextEvent = getNextLoreEvent(player);
            if (nextEvent) {
                console.log('[V1_TEST] Forzando evento:', nextEvent.title);
                showEventPopup(nextEvent);
            } else {
                console.log('[V1_TEST] Nessun evento lore disponibile');
            }
        }
    },
    
    // Aggiungi arma random all'inventario
    giveRandomWeapon: function() {
        const weapons = ['weapon_knife_rusty', 'weapon_club_improvised', 'weapon_pistol_old'];
        const weapon = weapons[Math.floor(Math.random() * weapons.length)];
        addItemToInventory(weapon, 1);
        addMessage(`[DEBUG] Aggiunta arma: ${ITEM_DATA[weapon].name}`, 'info');
    },
    
    // Aggiungi materiali crafting
    giveCraftingMaterials: function() {
        const materials = [
            { id: 'scrap_metal', qty: 5 },
            { id: 'wood_planks', qty: 5 },
            { id: 'cloth_rags', qty: 5 },
            { id: 'plastic_containers', qty: 3 }
        ];
        
        materials.forEach(mat => {
            addItemToInventory(mat.id, mat.qty);
        });
        addMessage('[DEBUG] Aggiunti materiali crafting', 'info');
    },
    
    // Salta al giorno X
    skipToDay: function(targetDay) {
        daysSurvived = targetDay;
        addMessage(`[DEBUG] Saltato al giorno ${targetDay}`, 'info');
        renderStats();
    }
};

console.log('[V1_FIXES] Correzioni v1.0.0 caricate. Usa V1_TEST per funzioni di debug.'); 
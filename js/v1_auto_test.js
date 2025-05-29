/**
 * THE SAFE PLACE - TEST AUTOMATICO v1.0.0
 * 
 * Sistema di test che mostra i risultati direttamente nel gioco
 * senza richiedere l'uso della console
 */

const V1AutoTest = {
    // Esegue il test e mostra i risultati
    runTest() {
        const results = {
            modules: this.checkModules(),
            integration: this.checkIntegration(),
            systems: this.checkSystems()
        };
        
        this.showResults(results);
        return results;
    },
    
    // Controlla se i moduli sono caricati
    checkModules() {
        return {
            LORE_EVENTS_LINEAR: typeof LORE_EVENTS_LINEAR !== 'undefined',
            ENEMY_DATABASE: typeof ENEMY_DATABASE !== 'undefined',
            LORE_ITEMS: typeof LORE_ITEMS !== 'undefined',
            LoreEventManager: typeof LoreEventManager !== 'undefined',
            CombatVisuals: typeof CombatVisuals !== 'undefined',
            AchievementSystem: typeof AchievementSystem !== 'undefined',
            getNextLoreEvent: typeof getNextLoreEvent !== 'undefined'
        };
    },
    
    // Controlla l'integrazione
    checkIntegration() {
        return {
            loreEventManager: window.loreEventManager !== undefined,
            combatVisuals: window.combatVisuals !== undefined,
            achievementSystem: window.achievementSystem !== undefined,
            playerReady: typeof player !== 'undefined' && player !== null
        };
    },
    
    // Controlla sistemi specifici
    checkSystems() {
        const results = {};
        
        // Eventi Lore
        if (typeof LORE_EVENTS_LINEAR !== 'undefined') {
            results.loreEventsCount = LORE_EVENTS_LINEAR.length;
            results.firstEvent = LORE_EVENTS_LINEAR[0]?.title || 'Non trovato';
        }
        
        // Nemici
        if (typeof ENEMY_DATABASE !== 'undefined') {
            results.enemyTypes = Object.keys(ENEMY_DATABASE).length;
        }
        
        // Oggetti Lore
        if (typeof LORE_ITEMS !== 'undefined') {
            results.loreItemsCount = Object.keys(LORE_ITEMS).length;
        }
        
        return results;
    },
    
    // Mostra i risultati nel gioco
    showResults(results) {
        // Crea overlay per i risultati
        const overlay = document.createElement('div');
        overlay.id = 'v1-test-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #1a1a1a;
            border: 2px solid #00ff00;
            padding: 20px;
            z-index: 10000;
            font-family: monospace;
            color: #00ff00;
            max-width: 600px;
            max-height: 80vh;
            overflow-y: auto;
        `;
        
        let html = '<h2>TEST v1.0.0 - RISULTATI</h2>';
        
        // Moduli
        html += '<h3>MODULI CARICATI:</h3><ul>';
        for (const [name, loaded] of Object.entries(results.modules)) {
            const status = loaded ? '✅' : '❌';
            const color = loaded ? '#00ff00' : '#ff0000';
            html += `<li style="color: ${color}">${status} ${name}</li>`;
        }
        html += '</ul>';
        
        // Integrazione
        html += '<h3>INTEGRAZIONE:</h3><ul>';
        for (const [name, integrated] of Object.entries(results.integration)) {
            const status = integrated ? '✅' : '❌';
            const color = integrated ? '#00ff00' : '#ff0000';
            html += `<li style="color: ${color}">${status} ${name}</li>`;
        }
        html += '</ul>';
        
        // Sistemi
        html += '<h3>CONTENUTI v1.0.0:</h3><ul>';
        if (results.systems.loreEventsCount) {
            html += `<li>Eventi Lore: ${results.systems.loreEventsCount}</li>`;
            html += `<li>Primo Evento: "${results.systems.firstEvent}"</li>`;
        }
        if (results.systems.enemyTypes) {
            html += `<li>Tipi Nemici: ${results.systems.enemyTypes}</li>`;
        }
        if (results.systems.loreItemsCount) {
            html += `<li>Oggetti Lore: ${results.systems.loreItemsCount}</li>`;
        }
        html += '</ul>';
        
        // Azioni
        html += '<h3>AZIONI DISPONIBILI:</h3>';
        html += '<button onclick="V1AutoTest.testInitialEvent()" style="margin: 5px; padding: 10px; background: #00ff00; color: #000; border: none; cursor: pointer;">TEST EVENTO INIZIALE</button>';
        html += '<button onclick="V1AutoTest.forceInit()" style="margin: 5px; padding: 10px; background: #ffff00; color: #000; border: none; cursor: pointer;">FORZA INIZIALIZZAZIONE</button>';
        html += '<button onclick="V1AutoTest.close()" style="margin: 5px; padding: 10px; background: #ff0000; color: #fff; border: none; cursor: pointer;">CHIUDI</button>';
        
        overlay.innerHTML = html;
        document.body.appendChild(overlay);
    },
    
    // Test evento iniziale
    testInitialEvent() {
        // Verifica se siamo nel gioco o nel menu
        if (typeof gameActive !== 'undefined' && !gameActive) {
            this.showMessage('Avvia prima una nuova partita!', 'error');
            return;
        }
        
        if (typeof V1_DEBUG !== 'undefined' && V1_DEBUG.testLoreEvent) {
            V1_DEBUG.testLoreEvent('lore_echo_of_departure');
            this.showMessage('Evento iniziale triggerato! Controlla il gioco.');
        } else {
            this.showMessage('Sistema V1_DEBUG non disponibile!', 'error');
        }
    },
    
    // Forza inizializzazione
    forceInit() {
        if (typeof V1_DEBUG !== 'undefined' && V1_DEBUG.forceInitV1) {
            V1_DEBUG.forceInitV1();
            this.showMessage('Reinizializzazione forzata!');
            setTimeout(() => this.runTest(), 1000);
        } else {
            this.showMessage('Sistema V1_DEBUG non disponibile!', 'error');
        }
    },
    
    // Mostra messaggio
    showMessage(msg, type = 'success') {
        const msgEl = document.createElement('div');
        msgEl.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px;
            background: ${type === 'error' ? '#ff0000' : '#00ff00'};
            color: ${type === 'error' ? '#fff' : '#000'};
            font-family: monospace;
            font-weight: bold;
            z-index: 10001;
        `;
        msgEl.textContent = msg;
        document.body.appendChild(msgEl);
        
        setTimeout(() => msgEl.remove(), 3000);
    },
    
    // Chiudi overlay
    close() {
        const overlay = document.getElementById('v1-test-overlay');
        if (overlay) overlay.remove();
    },
    
    // Auto-esegui al caricamento
    autoRun() {
        // Aggiungi pulsante di test nel menu principale
        setTimeout(() => {
            const startScreen = document.getElementById('start-screen-container');
            if (startScreen && startScreen.style.display !== 'none') {
                const testButton = document.createElement('button');
                testButton.textContent = 'TEST v1.0.0';
                testButton.style.cssText = `
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    padding: 10px 20px;
                    background: #00ff00;
                    color: #000;
                    border: 2px solid #000;
                    font-family: monospace;
                    font-weight: bold;
                    cursor: pointer;
                    z-index: 1000;
                `;
                testButton.onclick = () => this.runTest();
                startScreen.appendChild(testButton);
            }
        }, 1000);
        
        // Aggiungi anche un pulsante di test rapido nel gioco
        setTimeout(() => {
            this.addInGameTestButton();
        }, 2000);
    },
    
    // Aggiungi pulsante test nel gioco
    addInGameTestButton() {
        // Controlla periodicamente se siamo nel gioco
        const checkInterval = setInterval(() => {
            const gameContainer = document.getElementById('game-container');
            if (gameContainer && gameContainer.style.display !== 'none' && !document.getElementById('in-game-test-button')) {
                clearInterval(checkInterval);
                
                const inGameButton = document.createElement('button');
                inGameButton.id = 'in-game-test-button';
                inGameButton.textContent = 'TEST EVENT';
                inGameButton.style.cssText = `
                    position: fixed;
                    bottom: 10px;
                    right: 10px;
                    padding: 5px 10px;
                    background: #ffff00;
                    color: #000;
                    border: 2px solid #000;
                    font-family: monospace;
                    font-size: 12px;
                    cursor: pointer;
                    z-index: 999;
                `;
                inGameButton.onclick = () => {
                    if (typeof V1_DEBUG !== 'undefined' && V1_DEBUG.testLoreEvent) {
                        V1_DEBUG.testLoreEvent('lore_echo_of_departure');
                        this.showMessage('Evento triggerato!');
                    }
                };
                document.body.appendChild(inGameButton);
            }
        }, 1000);
    }
};

// Esegui automaticamente
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        V1AutoTest.autoRun();
    });
} else {
    V1AutoTest.autoRun();
}

// Export globale
window.V1AutoTest = V1AutoTest; 
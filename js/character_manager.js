/**
 * The Safe Place - Character Manager
 * Modulo per gestire personaggi multipli quando il backend è disponibile
 */

// Stato globale character manager
let characterManagerState = {
    characters: [],
    selectedCharacterId: null,
    isBackendMode: false
};

/**
 * Character Manager principale
 */
const CharacterManager = {
    
    /**
     * Inizializza il character manager
     */
    async initialize() {
        if (typeof apiState !== 'undefined' && apiState.backendAvailable) {
            characterManagerState.isBackendMode = true;
            await this.loadCharactersList();
        } else {
            characterManagerState.isBackendMode = false;
            // In modalità localStorage, usa sempre un personaggio "default"
            characterManagerState.selectedCharacterId = 'localStorage_default';
        }
        
        if (API_CONFIG.debug) {
            console.log("🎭 Character Manager inizializzato:", characterManagerState);
        }
    },
    
    /**
     * Carica lista personaggi dal backend
     */
    async loadCharactersList() {
        if (!characterManagerState.isBackendMode) return [];
        
        try {
            const response = await apiClient.getCharacters();
            if (response.success && response.characters) {
                characterManagerState.characters = response.characters;
                return response.characters;
            } else {
                console.warn("Nessun personaggio trovato o errore nella risposta");
                return [];
            }
        } catch (error) {
            console.error("Errore caricamento personaggi:", error);
            return [];
        }
    },
    
    /**
     * Crea un nuovo personaggio
     */
    async createCharacter(characterData) {
        if (!characterManagerState.isBackendMode) {
            // In modalità localStorage, non creiamo personaggi separati
            return { success: true, character_id: 'localStorage_default' };
        }
        
        try {
            const response = await apiClient.createCharacter(characterData);
            if (response.success) {
                // Ricarica la lista personaggi
                await this.loadCharactersList();
                return response;
            } else {
                throw new Error(response.message || "Errore creazione personaggio");
            }
        } catch (error) {
            console.error("Errore creazione personaggio:", error);
            throw error;
        }
    },
    
    /**
     * Seleziona un personaggio
     */
    selectCharacter(characterId) {
        characterManagerState.selectedCharacterId = characterId;
        if (typeof apiState !== 'undefined') {
            apiState.currentCharacterId = characterId;
        }
        
        if (API_CONFIG.debug) {
            console.log(`🎭 Personaggio selezionato: ${characterId}`);
        }
    },
    
    /**
     * Ottiene il personaggio attualmente selezionato
     */
    getSelectedCharacter() {
        if (!characterManagerState.isBackendMode) {
            return { id: 'localStorage_default', name: 'Survivor' };
        }
        
        return characterManagerState.characters.find(
            char => char.id === characterManagerState.selectedCharacterId
        );
    },
    
    /**
     * Mostra UI di selezione personaggio
     */
    showCharacterSelection() {
        if (!characterManagerState.isBackendMode) {
            // In modalità localStorage, avvia direttamente il gioco
            if (typeof initializeGame === 'function') {
                initializeGame();
            }
            return;
        }
        
        this.createCharacterSelectionUI();
    },
    
    /**
     * Crea l'interfaccia di selezione personaggio
     */
    createCharacterSelectionUI() {
        // Rimuovi UI esistente se presente
        const existingUI = document.getElementById('character-selection-overlay');
        if (existingUI) {
            existingUI.remove();
        }
        
        // Crea overlay
        const overlay = document.createElement('div');
        overlay.id = 'character-selection-overlay';
        overlay.className = 'overlay';
        overlay.style.display = 'flex';
        
        // Crea popup
        const popup = document.createElement('div');
        popup.className = 'popup';
        popup.style.maxWidth = '600px';
        
        // Contenuto popup
        popup.innerHTML = `
            <h2>🎭 Seleziona Personaggio</h2>
            <div id="character-list-container">
                <h3>Personaggi Esistenti</h3>
                <div id="characters-list">
                    ${this.renderCharactersList()}
                </div>
            </div>
            <div id="new-character-container">
                <h3>Crea Nuovo Personaggio</h3>
                <div class="character-form">
                    <input type="text" id="new-character-name" placeholder="Nome personaggio" maxlength="50">
                    <button id="create-character-btn" class="action-button">Crea Personaggio</button>
                </div>
            </div>
            <div class="character-selection-actions">
                <button id="start-game-btn" class="action-button" disabled>Inizia Partita</button>
                <button id="cancel-selection-btn" class="action-button">Annulla</button>
            </div>
        `;
        
        overlay.appendChild(popup);
        document.body.appendChild(overlay);
        
        // Aggiungi event listeners
        this.setupCharacterSelectionListeners();
    },
    
    /**
     * Renderizza la lista dei personaggi
     */
    renderCharactersList() {
        if (characterManagerState.characters.length === 0) {
            return '<p class="no-characters">Nessun personaggio trovato. Creane uno nuovo!</p>';
        }
        
        return characterManagerState.characters.map(character => `
            <div class="character-item" data-character-id="${character.id}">
                <div class="character-info">
                    <h4>${character.name}</h4>
                    <p>Livello: ${character.level || 1} | HP: ${character.health || 100}</p>
                    <p>Ultima partita: ${character.updated_at ? new Date(character.updated_at).toLocaleString() : 'Mai'}</p>
                </div>
                <button class="select-character-btn action-button" data-character-id="${character.id}">
                    Seleziona
                </button>
            </div>
        `).join('');
    },
    
    /**
     * Setup event listeners per UI selezione personaggio
     */
    setupCharacterSelectionListeners() {
        // Selezione personaggio esistente
        document.querySelectorAll('.select-character-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const characterId = e.target.dataset.characterId;
                this.selectCharacter(characterId);
                
                // Aggiorna UI
                document.querySelectorAll('.character-item').forEach(item => {
                    item.classList.remove('selected');
                });
                e.target.closest('.character-item').classList.add('selected');
                
                // Abilita pulsante avvio
                document.getElementById('start-game-btn').disabled = false;
            });
        });
        
        // Creazione nuovo personaggio
        document.getElementById('create-character-btn').addEventListener('click', async () => {
            const nameInput = document.getElementById('new-character-name');
            const name = nameInput.value.trim();
            
            if (!name) {
                alert('Inserisci un nome per il personaggio!');
                return;
            }
            
            try {
                const btn = document.getElementById('create-character-btn');
                btn.disabled = true;
                btn.textContent = 'Creando...';
                
                const characterData = {
                    name: name,
                    level: 1,
                    health: 100,
                    position: { x: 5, y: 5 },
                    stats: {
                        maxHp: 100,
                        food: 10,
                        water: 10,
                        vigore: 10,
                        potenza: 8,
                        agilita: 8,
                        trascinamento: 6,
                        infiltrazione: 6,
                        precisione: 6,
                        adattamento: 6
                    }
                };
                
                const result = await this.createCharacter(characterData);
                
                if (result.success) {
                    // Aggiorna UI
                    document.getElementById('characters-list').innerHTML = this.renderCharactersList();
                    this.setupCharacterSelectionListeners();
                    
                    // Seleziona automaticamente il nuovo personaggio
                    this.selectCharacter(result.character_id);
                    document.getElementById('start-game-btn').disabled = false;
                    
                    // Reset form
                    nameInput.value = '';
                    
                    if (typeof DualModeUtils !== 'undefined') {
                        DualModeUtils.showStatusMessage(`Personaggio "${name}" creato con successo!`, "success");
                    }
                } else {
                    throw new Error(result.message || "Errore sconosciuto");
                }
                
            } catch (error) {
                console.error("Errore creazione personaggio:", error);
                alert(`Errore nella creazione del personaggio: ${error.message}`);
            } finally {
                const btn = document.getElementById('create-character-btn');
                btn.disabled = false;
                btn.textContent = 'Crea Personaggio';
            }
        });
        
        // Avvio partita
        document.getElementById('start-game-btn').addEventListener('click', () => {
            this.hideCharacterSelection();
            if (typeof showScreen === 'function' && typeof DOM !== 'undefined') {
                showScreen(DOM.gameContainer);
            }
            if (typeof initializeGame === 'function') {
                initializeGame();
            }
        });
        
        // Annulla selezione
        document.getElementById('cancel-selection-btn').addEventListener('click', () => {
            this.hideCharacterSelection();
            if (typeof showScreen === 'function' && typeof DOM !== 'undefined') {
                showScreen(DOM.startScreenContainer);
            }
        });
        
        // Enter per creare personaggio
        document.getElementById('new-character-name').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                document.getElementById('create-character-btn').click();
            }
        });
    },
    
    /**
     * Nasconde UI di selezione personaggio
     */
    hideCharacterSelection() {
        const overlay = document.getElementById('character-selection-overlay');
        if (overlay) {
            overlay.remove();
        }
    },
    
    /**
     * Ottiene statistiche personaggi
     */
    getCharacterStats() {
        return {
            totalCharacters: characterManagerState.characters.length,
            selectedCharacter: this.getSelectedCharacter(),
            isBackendMode: characterManagerState.isBackendMode
        };
    }
};

// CSS per UI selezione personaggio
const characterSelectionCSS = `
    .character-item {
        border: 1px solid #333;
        margin: 10px 0;
        padding: 15px;
        background: rgba(0, 0, 0, 0.3);
        display: flex;
        justify-content: space-between;
        align-items: center;
        transition: all 0.3s ease;
    }
    
    .character-item:hover {
        background: rgba(0, 255, 0, 0.1);
        border-color: #00ff00;
    }
    
    .character-item.selected {
        background: rgba(0, 255, 0, 0.2);
        border-color: #00ff00;
        box-shadow: 0 0 10px rgba(0, 255, 0, 0.3);
    }
    
    .character-info h4 {
        margin: 0 0 5px 0;
        color: #00ff00;
    }
    
    .character-info p {
        margin: 2px 0;
        color: #ccc;
        font-size: 0.9em;
    }
    
    .character-form {
        display: flex;
        gap: 10px;
        align-items: center;
        margin: 10px 0;
    }
    
    .character-form input {
        flex: 1;
        padding: 8px;
        background: rgba(0, 0, 0, 0.5);
        border: 1px solid #333;
        color: #00ff00;
        font-family: inherit;
    }
    
    .character-form input:focus {
        border-color: #00ff00;
        outline: none;
    }
    
    .character-selection-actions {
        margin-top: 20px;
        text-align: center;
        border-top: 1px solid #333;
        padding-top: 15px;
    }
    
    .no-characters {
        text-align: center;
        color: #888;
        font-style: italic;
        padding: 20px;
    }
`;

// Aggiungi CSS al documento
if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = characterSelectionCSS;
    document.head.appendChild(style);
}

// Esporta per uso globale
if (typeof window !== 'undefined') {
    window.CharacterManager = CharacterManager;
    window.characterManagerState = characterManagerState;
} 
/**
 * THE SAFE PLACE - ENDING PRESENTATION SYSTEM
 * FASE 6: MULTIPLE ENDINGS SYSTEM v1.0
 * 
 * Sistema di presentazione visuale per i finali multipli.
 * Gestisce slideshow cinematografici, interfaccia e transizioni.
 */

window.EndingPresentation = {
    
    // === STATO PRESENTAZIONE ===
    currentSlideIndex: 0,
    currentEnding: null,
    slideContainer: null,
    isPresenting: false,
    
    // === SETUP E INIZIALIZZAZIONE ===
    
    /**
     * Inizializza il sistema di presentazione
     */
    init() {
        this.createEndingInterface();
        console.log('[ENDING_PRESENTATION] Sistema di presentazione inizializzato');
    },
    
    /**
     * Crea l'interfaccia HTML per i finali
     */
    createEndingInterface() {
        // Verifica se esiste già
        if (document.getElementById('ending-presentation-overlay')) {
            return;
        }
        
        const overlay = document.createElement('div');
        overlay.id = 'ending-presentation-overlay';
        overlay.className = 'ending-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
            z-index: 10000;
            display: none;
            overflow: hidden;
        `;
        
        overlay.innerHTML = `
            <div id="ending-slide-container" class="slide-container">
                <!-- Slides vengono generate dinamicamente -->
            </div>
            
            <div id="ending-main-content" class="ending-content">
                <div class="ending-header">
                    <div id="ending-icon" class="ending-icon">🌟</div>
                    <h1 id="ending-title" class="ending-title">THE HERO'S RETURN</h1>
                    <h2 id="ending-subtitle" class="ending-subtitle">Il Ritorno dell'Eroe</h2>
                </div>
                
                <div class="ending-text-container">
                    <div id="ending-main-text" class="ending-main-text">
                        <!-- Testo principale del finale -->
                    </div>
                </div>
                
                <div class="ending-navigation">
                    <button id="ending-continue-btn" class="ending-button primary">Continua</button>
                    <button id="ending-epilogue-btn" class="ending-button secondary" style="display: none;">Epilogo</button>
                    <button id="ending-restart-btn" class="ending-button tertiary" style="display: none;">Nuova Partita</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(overlay);
        this.slideContainer = document.getElementById('ending-slide-container');
        
        // Aggiungi event listeners
        this.setupEventListeners();
        
        // Aggiungi CSS dinamico
        this.addEndingStyles();
    },
    
    /**
     * Aggiunge gli stili CSS per l'interfaccia dei finali
     */
    addEndingStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .ending-overlay {
                font-family: 'Courier New', monospace;
                color: #ffffff;
            }
            
            .slide-container {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0;
                transition: opacity 1s ease-in-out;
            }
            
            .slide-container.active {
                opacity: 1;
            }
            
            .ending-slide {
                max-width: 800px;
                text-align: center;
                padding: 40px;
                background: rgba(0, 0, 0, 0.7);
                border-radius: 10px;
                border: 2px solid #444;
            }
            
            .slide-image-placeholder {
                width: 100%;
                height: 200px;
                background: linear-gradient(45deg, #333, #666);
                border-radius: 8px;
                margin-bottom: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-style: italic;
                color: #ccc;
                font-size: 14px;
                text-align: center;
                padding: 20px;
                box-sizing: border-box;
            }
            
            .slide-text {
                font-size: 18px;
                line-height: 1.6;
                color: #ffffff;
                text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
            }
            
            .ending-content {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                max-width: 900px;
                width: 90%;
                text-align: center;
                display: none;
            }
            
            .ending-content.active {
                display: block;
            }
            
            .ending-header {
                margin-bottom: 40px;
            }
            
            .ending-icon {
                font-size: 80px;
                margin-bottom: 20px;
                text-shadow: 0 0 20px rgba(255, 255, 255, 0.5);
            }
            
            .ending-title {
                font-size: 48px;
                margin: 0 0 10px 0;
                font-weight: bold;
                text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
                letter-spacing: 2px;
            }
            
            .ending-subtitle {
                font-size: 24px;
                margin: 0 0 20px 0;
                color: #cccccc;
                font-style: italic;
            }
            
            .ending-text-container {
                max-height: 400px;
                overflow-y: auto;
                margin-bottom: 40px;
                padding: 20px;
                background: rgba(0, 0, 0, 0.6);
                border-radius: 10px;
                border: 1px solid #444;
            }
            
            .ending-main-text {
                font-size: 16px;
                line-height: 1.8;
                text-align: left;
                white-space: pre-line;
            }
            
            .ending-navigation {
                display: flex;
                gap: 20px;
                justify-content: center;
                flex-wrap: wrap;
            }
            
            .ending-button {
                padding: 15px 30px;
                font-size: 16px;
                font-family: 'Courier New', monospace;
                border: 2px solid;
                border-radius: 5px;
                cursor: pointer;
                transition: all 0.3s ease;
                background: transparent;
                text-transform: uppercase;
                letter-spacing: 1px;
                min-width: 150px;
            }
            
            .ending-button.primary {
                color: #22c55e;
                border-color: #22c55e;
            }
            
            .ending-button.primary:hover {
                background: #22c55e;
                color: #000000;
                box-shadow: 0 0 20px rgba(34, 197, 94, 0.5);
            }
            
            .ending-button.secondary {
                color: #3b82f6;
                border-color: #3b82f6;
            }
            
            .ending-button.secondary:hover {
                background: #3b82f6;
                color: #ffffff;
                box-shadow: 0 0 20px rgba(59, 130, 246, 0.5);
            }
            
            .ending-button.tertiary {
                color: #f59e0b;
                border-color: #f59e0b;
            }
            
            .ending-button.tertiary:hover {
                background: #f59e0b;
                color: #000000;
                box-shadow: 0 0 20px rgba(245, 158, 11, 0.5);
            }
            
            @keyframes fadeInUp {
                from {
                    opacity: 0;
                    transform: translateY(30px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            .ending-content.fade-in {
                animation: fadeInUp 1s ease-out;
            }
        `;
        
        document.head.appendChild(style);
    },
    
    /**
     * Setup degli event listeners
     */
    setupEventListeners() {
        // Continue button - procede alle slide successive
        document.getElementById('ending-continue-btn').addEventListener('click', () => {
            this.nextSlideOrSection();
        });
        
        // Epilogue button - mostra epiloghi
        document.getElementById('ending-epilogue-btn').addEventListener('click', () => {
            this.showEpilogues();
        });
        
        // Restart button - torna al menu principale
        document.getElementById('ending-restart-btn').addEventListener('click', () => {
            this.restartGame();
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (event) => {
            if (this.isPresenting) {
                switch(event.key) {
                    case 'Enter':
                    case ' ':
                        this.nextSlideOrSection();
                        break;
                    case 'Escape':
                        // Optional: skip to final screen
                        break;
                }
            }
        });
    },
    
    // === PRESENTAZIONE FINALE ===
    
    /**
     * Presenta il finale calcolato al giocatore
     * @param {Object} selectedEnding - Finale selezionato dall'EndingCalculator
     */
    async presentEnding(selectedEnding) {
        console.log('[ENDING_PRESENTATION] Presentando finale:', selectedEnding.ending.name);
        
        this.currentEnding = selectedEnding;
        this.isPresenting = true;
        this.currentSlideIndex = 0;
        
        // Ottieni i dati completi del finale
        const endingData = window.EndingsDatabase.getEnding(selectedEnding.ending.id);
        if (!endingData) {
            console.error('[ENDING_PRESENTATION] Dati finale non trovati:', selectedEnding.ending.id);
            return;
        }
        
        // Setup colore tema
        this.setupThemeColor(endingData.theme_color);
        
        // Mostra overlay
        const overlay = document.getElementById('ending-presentation-overlay');
        overlay.style.display = 'block';
        
        // Nascondi game UI
        this.hideGameUI();
        
        // Sblocca achievement se presente
        if (endingData.achievement) {
            this.unlockEndingAchievement(endingData.achievement);
        }
        
        // Inizia con le slide cinematografiche
        this.showCinematicSlides(endingData);
    },
    
    /**
     * Mostra le slide cinematografiche
     */
    async showCinematicSlides(endingData) {
        const slides = endingData.cinematic_slides || [];
        
        if (slides.length === 0) {
            // Nessuna slide, vai direttamente al contenuto principale
            this.showMainContent(endingData);
            return;
        }
        
        // Genera HTML per le slide
        this.generateSlidesHTML(slides);
        
        // Mostra la prima slide
        this.showSlide(0);
        
        // Auto-progressione delle slide se necessario
        this.startSlideTimer(slides[0].duration || 3000);
    },
    
    /**
     * Genera l'HTML per le slide cinematografiche
     */
    generateSlidesHTML(slides) {
        this.slideContainer.innerHTML = '';
        
        slides.forEach((slide, index) => {
            const slideElement = document.createElement('div');
            slideElement.className = 'ending-slide';
            slideElement.style.display = 'none';
            
            slideElement.innerHTML = `
                <div class="slide-image-placeholder">
                    ${slide.image_description}
                </div>
                <div class="slide-text">
                    ${slide.text}
                </div>
            `;
            
            this.slideContainer.appendChild(slideElement);
        });
    },
    
    /**
     * Mostra una slide specifica
     */
    showSlide(index) {
        const slides = this.slideContainer.children;
        
        // Nascondi tutte le slide
        for (let slide of slides) {
            slide.style.display = 'none';
        }
        
        // Mostra la slide corrente
        if (slides[index]) {
            slides[index].style.display = 'block';
            this.slideContainer.className = 'slide-container active';
        }
        
        this.currentSlideIndex = index;
    },
    
    /**
     * Timer automatico per le slide
     */
    startSlideTimer(duration) {
        setTimeout(() => {
            this.nextSlideOrSection();
        }, duration);
    },
    
    /**
     * Procede alla slide successiva o al contenuto principale
     */
    nextSlideOrSection() {
        const endingData = window.EndingsDatabase.getEnding(this.currentEnding.ending.id);
        const slides = endingData.cinematic_slides || [];
        
        if (this.currentSlideIndex < slides.length - 1) {
            // Mostra la slide successiva
            this.currentSlideIndex++;
            this.showSlide(this.currentSlideIndex);
            this.startSlideTimer(slides[this.currentSlideIndex].duration || 3000);
        } else {
            // Finito con le slide, mostra il contenuto principale
            this.showMainContent(endingData);
        }
    },
    
    /**
     * Mostra il contenuto principale del finale
     */
    showMainContent(endingData) {
        // Nascondi slide container
        this.slideContainer.className = 'slide-container';
        
        // Setup contenuto principale
        const content = document.getElementById('ending-main-content');
        
        // Popola i dati
        document.getElementById('ending-icon').textContent = endingData.icon;
        document.getElementById('ending-title').textContent = endingData.name;
        document.getElementById('ending-subtitle').textContent = endingData.subtitle;
        document.getElementById('ending-main-text').textContent = endingData.main_text;
        
        // Setup bottoni
        document.getElementById('ending-continue-btn').textContent = 'Vedi Epilogo';
        document.getElementById('ending-continue-btn').style.display = 'inline-block';
        document.getElementById('ending-epilogue-btn').style.display = 'none';
        document.getElementById('ending-restart-btn').style.display = 'none';
        
        // Mostra contenuto con animazione
        content.className = 'ending-content active fade-in';
    },
    
    /**
     * Mostra gli epiloghi del personaggio e del mondo
     */
    showEpilogues() {
        const endingData = window.EndingsDatabase.getEnding(this.currentEnding.ending.id);
        
        // Cambia il testo per mostrare l'epilogo del personaggio
        document.getElementById('ending-main-text').textContent = 
            `EPILOGO DEL PERSONAGGIO\n\n${endingData.character_epilogue}\n\n` +
            `EPILOGO DEL MONDO\n\n${endingData.world_epilogue}`;
        
        // Aggiorna bottoni
        document.getElementById('ending-continue-btn').style.display = 'none';
        document.getElementById('ending-epilogue-btn').style.display = 'none';
        document.getElementById('ending-restart-btn').style.display = 'inline-block';
    },
    
    // === UTILITY E SUPPORTO ===
    
    /**
     * Setup del colore tema per il finale
     */
    setupThemeColor(themeColor) {
        const overlay = document.getElementById('ending-presentation-overlay');
        if (themeColor) {
            overlay.style.background = `linear-gradient(135deg, ${themeColor}22 0%, #1a1a1a 100%)`;
        }
    },
    
    /**
     * Nasconde l'UI principale del gioco
     */
    hideGameUI() {
        const gameElements = ['main-container', 'map-tooltip'];
        gameElements.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.style.display = 'none';
            }
        });
    },
    
    /**
     * Sblocca achievement del finale
     */
    unlockEndingAchievement(achievement) {
        if (typeof window.AchievementSystem !== 'undefined') {
            window.AchievementSystem.unlock(achievement.id);
            console.log('[ENDING_PRESENTATION] Achievement sbloccato:', achievement.name);
        }
    },
    
    /**
     * Riavvia il gioco tornando al menu principale
     */
    restartGame() {
        // Nascondi overlay finale
        document.getElementById('ending-presentation-overlay').style.display = 'none';
        
        // Reset stato
        this.isPresenting = false;
        this.currentEnding = null;
        this.currentSlideIndex = 0;
        
        // Torna al menu principale
        if (typeof window.showStartScreen === 'function') {
            window.showStartScreen();
        } else {
            // Fallback: ricarica la pagina
            location.reload();
        }
        
        console.log('[ENDING_PRESENTATION] Gioco riavviato');
    },
    
    /**
     * Test function per debugging
     */
    testEndingPresentation(endingId = 'hero_return') {
        console.log('[ENDING_PRESENTATION] Test presentazione finale:', endingId);
        
        // Simula un finale calcolato
        const testEnding = {
            ending: {
                id: endingId,
                name: window.EndingsDatabase.getEnding(endingId)?.name || 'Test Ending',
                icon: window.EndingsDatabase.getEnding(endingId)?.icon || '🎯'
            },
            score: {
                total: 120,
                threshold: 100,
                meetsRequirements: true,
                details: ['Test detail 1', 'Test detail 2']
            }
        };
        
        this.presentEnding(testEnding);
    }
};

// === INTEGRAZIONE CON SISTEMA ESISTENTE ===

/**
 * Sostituisce la funzione endGame esistente per supportare i finali multipli
 */
window.endGameWithMultipleEndings = function(reachedSafePlace = false) {
    console.log('[MULTIPLE_ENDINGS] Iniziando sequenza finale...');
    
    if (reachedSafePlace) {
        // Calcola il finale appropriato
        const selectedEnding = window.EndingCalculator.calculateFinalEnding(
            window.player, 
            window.KarmaTracker
        );
        
        console.log('[MULTIPLE_ENDINGS] Finale calcolato:', selectedEnding.ending.name);
        
        // Presenta il finale
        window.EndingPresentation.presentEnding(selectedEnding);
    } else {
        // Morte tradizionale - usa il sistema originale
        if (typeof window.endGame === 'function') {
            window.endGame(false);
        }
    }
};

// Auto-inizializzazione
if (typeof window !== 'undefined') {
    // Inizializza quando il DOM è pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.EndingPresentation.init();
        });
    } else {
        window.EndingPresentation.init();
    }
    
    // Funzioni globali per easy access
    window.testMultipleEndings = (endingId) => window.EndingPresentation.testEndingPresentation(endingId);
    window.calculateMyEnding = () => window.EndingCalculator.calculateFinalEnding(window.player, window.KarmaTracker);
}

console.log('✅ ENDING PRESENTATION SYSTEM caricato correttamente'); 
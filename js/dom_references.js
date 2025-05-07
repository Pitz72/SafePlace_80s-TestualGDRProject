/**
 * TheSafePlace - Roguelike Postapocalittico
 * Versione: v0.7.10
 * File: js/dom_references.js
 * Descrizione: Centralizza i riferimenti agli elementi DOM per un facile accesso e manutenibilità.
 */

// Oggetto globale per i riferimenti DOM
let DOM = {};

/**
 * Assegna tutti i riferimenti agli elementi DOM all'oggetto DOM.
 * Chiamata automaticamente quando il documento è pronto.
 */
function assignAllDOMReferences() {
    // console.log("assignAllDOMReferences: Inizio recupero elementi DOM..."); // Log di debug

    // Schermate principali e contenitori
    DOM.startScreenContainer = document.getElementById('start-screen-container') || null;
    DOM.instructionsScreen = document.getElementById('instructions-screen') || null;
    DOM.storyScreen = document.getElementById('story-screen') || null;
    DOM.gameContainer = document.getElementById('game-container');
    DOM.endScreen = document.getElementById('end-screen') || null;
    DOM.statPanel = document.getElementById('stat-panel'); // Aggiunto, sarà null se non esiste

    // Elementi della schermata iniziale
    DOM.gameTitle = document.getElementById('game-title') || null;
    DOM.startScreenImage = document.getElementById('start-screen-image');
    DOM.mainMenu = document.getElementById('main-menu');
    DOM.menuBtnNewGame = document.getElementById('menu-btn-new-game');
    DOM.menuBtnLoadGame = document.getElementById('menu-btn-load-game');
    DOM.menuBtnInstructions = document.getElementById('menu-btn-instructions');
    DOM.menuBtnStory = document.getElementById('menu-btn-story');
    DOM.backToMenuButtons = document.querySelectorAll('.back-to-menu-btn');

    // Elementi schermata istruzioni e storia
    DOM.instructionsContent = document.getElementById('instructions-content') || null;
    DOM.instructionsLegendList = document.getElementById('instructions-legend-list');
    DOM.storyContent = document.getElementById('story-content') || null;

    // Recupera riferimenti per le statistiche
    DOM.statsList = document.getElementById('stats-list');
    DOM.statHp = document.getElementById('stat-hp');
    DOM.statMaxHp = document.getElementById('stat-maxhp');
    DOM.statVig = document.getElementById('stat-vig');
    DOM.statPot = document.getElementById('stat-pot');
    DOM.statAgi = document.getElementById('stat-agi');
    DOM.statTra = document.getElementById('stat-tra');
    DOM.statInf = document.getElementById('stat-inf');
    DOM.statPre = document.getElementById('stat-pre');
    DOM.statAda = document.getElementById('stat-ada');
    DOM.statAcq = document.getElementById('stat-acq');

    // Recupera riferimenti per risorse e stato condizione
    DOM.statFood = document.getElementById('stat-food');
    DOM.statWater = document.getElementById('stat-water');
    DOM.statCondition = document.getElementById('stat-condition');

    // Recupera riferimenti per equipaggiamento
    DOM.statWeapon = document.getElementById('stat-weapon');
    DOM.statArmor = document.getElementById('stat-armor');

    // Recupera riferimenti per info di gioco
    DOM.posX = document.getElementById('pos-x');
    DOM.posY = document.getElementById('pos-y');
    DOM.tileType = document.getElementById('tile-type');
    DOM.statDayTime = document.getElementById('stat-day-time');

    // Recupera riferimenti per log e controlli
    DOM.messagesList = document.getElementById('messages');
    DOM.moveButtons = document.querySelectorAll('.control-grid button');

    // Recupera riferimenti per il popup eventi (con log di errore rimossi)
    DOM.eventOverlay = document.getElementById('event-overlay');
    DOM.eventPopup = document.getElementById('event-popup');
    DOM.eventTitle = document.getElementById('event-title');
    DOM.eventContent = document.getElementById('event-content');
    DOM.eventChoicesContainer = document.getElementById('event-choices');
    // Cerca il pulsante continua all'interno dell'elemento popup specifico
    if (DOM.eventPopup) { // Assicurati che DOM.eventPopup esista prima di cercare al suo interno
       DOM.continueButton = DOM.eventPopup.querySelector('.continue-button');
    } else {
       DOM.continueButton = null; // Imposta a null se eventPopup non è trovato
    }

    // Recupera riferimento per la legenda
    DOM.legendList = document.getElementById('legend');

    // Recupera riferimento per il bottone di riavvio
    DOM.restartButton = document.getElementById('restart-button') || null;

    // Recupera riferimenti per il tooltip degli oggetti
    DOM.itemTooltip = document.getElementById('item-tooltip') || null;
    if (DOM.itemTooltip) { // Verifica che il tooltip esista prima di cercare i suoi figli
        DOM.tooltipItemName = DOM.itemTooltip.querySelector('#tooltip-item-name'); // ID esatto
        DOM.tooltipItemDesc = DOM.itemTooltip.querySelector('#tooltip-item-desc'); // ID esatto
        DOM.tooltipItemStatsContainer = DOM.itemTooltip.querySelector('.item-stats-container'); // Aggiunto per coerenza
    } else {
        DOM.tooltipItemName = null;
        DOM.tooltipItemDesc = null;
        DOM.tooltipItemStatsContainer = null;
    }

    // Recupera il riferimento all'inventario
    DOM.inventoryList = document.getElementById('inventory');

    // Elementi UI di gioco esistenti
    DOM.mapDisplay = document.getElementById('map-display'); // Assicura che sia questo ID esatto
    DOM.statsList = document.getElementById('stats-list'); 
    DOM.messagesList = document.getElementById('messages'); // Verifica se l'ID è 'messages' o 'messagesList'
    DOM.inventoryList = document.getElementById('inventory');
    DOM.legendList = document.getElementById('legend');

    // Elementi Schermata Fine Gioco (NUOVI)
    DOM.endTitle = document.getElementById('end-title') || null;
    DOM.endMessage = document.getElementById('end-message') || null;

    // console.log("assignAllDOMReferences: Recupero riferimenti DOM completato."); // Log di debug
    console.log("assignAllDOMReferences: ESECUZIONE COMPLETATA. Oggetto DOM:", DOM); // Log finale diagnostico
}

// --- ESECUZIONE AUTOMATICA QUANDO IL DOM È PRONTO ---
// Questo blocco controlla se il documento è pronto e chiama assignAllDOMReferences() subito o in seguito quando il DOM sarà pronto
if (document.readyState === 'loading') {
    // Se il documento è ancora in caricamento, aggiungi un listener per il DOMContentLoaded
    document.addEventListener('DOMContentLoaded', assignAllDOMReferences);
} else {
    // Se il documento è già caricato, chiama la funzione immediatamente
    assignAllDOMReferences();
}
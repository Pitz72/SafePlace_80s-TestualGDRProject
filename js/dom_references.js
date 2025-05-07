/**
 * TheSafePlace - Roguelike Postapocalittico
 * Versione: v0.7.09
 * File: js/dom_references.js
 * Descrizione: Riferimenti cache agli elementi DOM per performance e chiarezza.
 * Questi riferimenti verranno popolati quando lo script viene caricato ed eseguito,
 * dopo che il DOM è pronto (es. tramite <script defer> o inclusione a fine body).
 */

// --- RIFERIMENTI AGLI ELEMENTI PRINCIPALI DEL DOM ---
// Dichiarato come un oggetto vuoto che verrà popolato con i riferimenti DOM
// quando il documento sarà pronto. Sarà accessibile da altri script.
let DOM = {};

/**
 * Assegna tutti i riferimenti agli elementi DOM all'oggetto DOM.
 * Chiamata automaticamente quando il documento è pronto.
 */
function assignAllDOMReferences() {
    // console.log("assignAllDOMReferences: Inizio recupero elementi DOM..."); // Log di debug

    // Recupera gli elementi principali e i pannelli
    // Questi ID corrispondono all'index.html
    DOM.gameContainer = document.getElementById('game-container');
    DOM.endScreen = document.getElementById('end-screen');
    DOM.endTitle = document.getElementById('end-title');
    DOM.endMessage = document.getElementById('end-message');
    DOM.mapDisplay = document.getElementById('map-display');

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
    // Cerca il pulsante continua all'interno dell'overlay/popup per sicurezza
    if (DOM.eventOverlay) {
       DOM.continueButton = DOM.eventOverlay.querySelector('.continue-button');
    }

    // Recupera riferimento per la legenda
    DOM.legendList = document.getElementById('legend');

    // Recupera riferimento per il bottone di riavvio
    DOM.restartButton = document.getElementById('restart-button');

    // Recupera riferimenti per il tooltip degli oggetti
    DOM.itemTooltip = document.getElementById('item-tooltip');
    if (DOM.itemTooltip) { // Verifica che il tooltip esista prima di cercare i suoi figli
        DOM.tooltipItemName = DOM.itemTooltip.querySelector('#tooltip-item-name');
        DOM.tooltipItemDesc = DOM.itemTooltip.querySelector('#tooltip-item-desc');
    }

    // Recupera il riferimento all'inventario
    DOM.inventoryList = document.getElementById('inventory');

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
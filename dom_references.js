/**
 * The Safe Place - Minimal Roguelike
 * File: dom_references.js
 * Descrizione: Contiene tutti i riferimenti agli elementi DOM usati nel gioco.
 */

// --- RIFERIMENTI AGLI ELEMENTI DEL DOM ---
// Otteniamo i riferimenti agli elementi HTML una sola volta all'inizio per efficienza.
const gameContainer = document.getElementById('game-container');
const endScreen = document.getElementById('end-screen');
const endTitle = document.getElementById('end-title');
const endMessage = document.getElementById('end-message');
const mapDisplay = document.getElementById('map-display');
// Riferimenti per le statistiche nella colonna destra
const statsList = document.getElementById('stats-list'); // Non usato direttamente, ma utile per contesto
const statHp = document.getElementById('stat-hp');
const statMaxHp = document.getElementById('stat-maxhp');
const statVig = document.getElementById('stat-vig');
const statPot = document.getElementById('stat-pot');
const statAgi = document.getElementById('stat-agi');
const statTra = document.getElementById('stat-tra');
const statInf = document.getElementById('stat-inf');
const statPre = document.getElementById('stat-pre');
const statAda = document.getElementById('stat-ada');
const statAcq = document.getElementById('stat-acq');
// Riferimenti per le risorse nella colonna sinistra
const statFood = document.getElementById('stat-food');
const statWater = document.getElementById('stat-water');
const statCondition = document.getElementById('stat-condition'); // Riferimento per lo stato (Ferito/Malato)
// Riferimenti per le info di gioco nella colonna destra
const posX = document.getElementById('pos-x');
const posY = document.getElementById('pos-y');
const tileType = document.getElementById('tile-type');
const statDayTime = document.getElementById('stat-day-time');
// Riferimenti per log, controlli, overlay
const messagesList = document.getElementById('messages');
const moveButtons = document.querySelectorAll('.control-grid button'); // Selettore più specifico per i bottoni nella griglia
// const inventoryButton = document.getElementById('btn-inventory'); // Commentato - Non più necessario
const eventOverlay = document.getElementById('event-overlay');
const eventPopup = document.getElementById('event-popup'); // Contenitore interno del popup
const eventTitle = document.getElementById('event-title');
const eventContent = document.getElementById('event-content');
const eventChoicesContainer = document.getElementById('event-choices'); // Contenitore scelte DENTRO il popup
const legendList = document.getElementById('legend'); // ID CORRETTO
const continueButton = eventOverlay.querySelector('.continue-button');
const inventoryList = document.getElementById('inventory'); // ID CORRETTO
const restartButton = document.getElementById('restart-button'); 
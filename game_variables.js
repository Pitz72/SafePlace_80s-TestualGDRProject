/**
 * The Safe Place - Minimal Roguelike
 * File: game_variables.js
 * Descrizione: Contiene le variabili di stato globali e costanti aggiuntive del gioco.
 */

// --- VARIABILI DI STATO GLOBALI ---
let player = {}; // Oggetto contenente i dati del giocatore
let map = []; // Array bidimensionale rappresentante la mappa
let messages = []; // Array contenente gli oggetti messaggio per il log {text: string, class: string}
let gameActive = false; // Flag per indicare se il gioco è in corso
let eventScreenActive = false; // Flag per indicare se un popup evento/inventario è attivo VISIVAMENTE
let gamePaused = false; // Flag per bloccare input giocatore (eventi, animazioni, etc.)
let currentEventChoices = []; // Array per memorizzare le scelte dell'evento corrente (per input tastiera)
let currentEventContext = null; // Oggetto per memorizzare il contesto dell'evento corrente
let dayMovesCounter = 0; // Contatore dei passi effettuati durante il giorno
let nightMovesCounter = 0; // Contatore dei passi effettuati durante la notte
let isDay = true; // Flag per indicare se è giorno (true) o notte (false)
let daysSurvived = 0; // Contatore dei giorni sopravvissuti
let easterEggPixelDebhFound = false; // Flag per easter egg unico
let uniqueEventWebRadioFound = false; // Flag per evento unico WebRadio

// Costante per il numero di passi dopo i quali la notte passerà automaticamente al giorno
const NIGHT_LENGTH_MOVES = 8; // Dopo 8 passi di notte, sorgerà il sole

// Costanti per le probabilità di trovare testi
const FLAVOR_TEXT_CHANCE = 0.20; // 20% di probabilità di mostrare un flavor text dopo un movimento
const LORE_FRAGMENT_CHANCE = 0.02; // 2% di probabilità di trovare un frammento di lore per passo

// Costanti per Eventi Complessi
const COMPLEX_EVENT_CHANCE = 0.15; // 15% probabilità base di un evento complesso per passo
// Probabilità relative dei tipi di evento complesso (devono sommarsi a 1 o essere normalizzate)
const COMPLEX_EVENT_TYPE_WEIGHTS = {
    PREDATOR: 0.20,      // 20%
    ANIMAL: 0.25,        // 25% (più comune)
    TRACKS: 0.20,        // 20%
    ENVIRONMENTAL: 0.15, // 15%
    DILEMMA: 0.10,       // 10%
    HORROR: 0.10         // 10% (solo di notte)
};
// Probabilità per l'esito dell'evento Tracce Strane (dopo successo check)
const TRACCE_LOOT_CHANCE = 0.35;        // 35% probabilità di trovare loot
const TRACCE_LORE_CHANCE = 0.25;        // 25% probabilità di trovare lore
const TRACCE_DANGER_CHANCE = 0.15;      // 15% probabilità di finire in pericolo (testo)
// Il restante 25% (100 - 35 - 25 - 15) sarà 'Nulla'

// --- COSTANTI PER EFFETTI PASSIVI STATUS ---
const PASSIVE_HUNGER_DAMAGE = 0.1; // Danno HP per passo se Sazietà <= 0
const PASSIVE_THIRST_DAMAGE = 0.15; // Danno HP per passo se Idratazione <= 0
const PASSIVE_INJURY_DAMAGE = 0.05; // Danno HP per passo se Ferito
const PASSIVE_SICKNESS_DAMAGE = 0.08; // Danno HP per passo se Malato
const SICKNESS_EXTRA_FOOD_COST = 0.05; // Costo extra Sazietà per passo se Malato
const SICKNESS_EXTRA_WATER_COST = 0.08; // Costo extra Idratazione per passo se Malato
const EASTER_EGG_CHANCE = 0.003; // Probabilità (0.3%) per gli eventi unici (ridotta ulteriormente) 
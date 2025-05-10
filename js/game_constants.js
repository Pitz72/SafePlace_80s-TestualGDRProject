/**
 * TheSafePlace - Roguelike Postapocalittico
 * Versione: v0.7.17
 * File: js/game_constants.js
 * Descrizione: Variabili di stato globali e costanti numeriche/probabilistiche.
 */

// Versione del gioco
const GAME_NAME = "The Safe Place";
const GAME_VERSION = "0.7.16";

// --- VARIABILI DI STATO GLOBALI ---
// Queste variabili memorizzano lo stato attuale del gioco.
// Saranno modificate da funzioni definite in altri file.
let player = {}; // Contiene statistiche, inventario, equipaggiamento e posizione del giocatore.
let map = []; // Array bidimensionale rappresentante la mappa. Ogni elemento sarà un oggetto { type: symbol, visited: boolean }.
let messages = []; // Array di oggetti { text: string, class: string } per il log di gioco.
let gameActive = false; // Flag: true se il gioco è in corso, false altrimenti.
let eventScreenActive = false; // Flag: true se un popup di evento/azione è attualmente visualizzato.
let gamePaused = false; // Flag: true se il gioco è in pausa (input bloccato, es. durante un evento).
let currentEventChoices = []; // Array temporaneo per memorizzare le scelte dell'evento corrente (per input da tastiera).
let currentEventContext = null; // Oggetto temporaneo per memorizzare i dati dell'evento corrente in corso.
let dayMovesCounter = 0; // Contatore dei passi effettuati durante il giorno corrente.
let nightMovesCounter = 0; // Contatore dei passi effettuati durante la notte corrente (se all'aperto).
let isDay = true; // Flag: true se è giorno, false se è notte.
let daysSurvived = 0; // Contatore dei giorni totali sopravvissuti.
let easterEggPixelDebhFound = false; // Flag: true se l'easter egg PixelDebh è stato trovato.
let uniqueEventWebRadioFound = false; // Flag: true se l'evento unico WebRadio è stato trovato.


// --- COSTANTI NUMERICHE E PROBABILISTICHE ---
// Queste costanti definiscono i parametri del gioco e le probabilità meccaniche.

// Dimensioni della mappa
const MAP_WIDTH = 250;
const MAP_HEIGHT = 250;

// Log dei messaggi
const MAX_MESSAGES = 30; // Numero massimo di messaggi nel log visibile.

// Risorse iniziali del giocatore
const STARTING_FOOD = 6;
const STARTING_WATER = 6;

// Ciclo Giorno/Notte
const DAY_LENGTH_MOVES = 18; // Numero di passi per far passare il giorno.
const NIGHT_LENGTH_MOVES = 8; // Numero di passi di movimento notturno all'aperto prima che sorga l'alba.
const NIGHT_FOOD_COST = 1;  // Costo di sazietà per riposo notturno (indipendentemente dal luogo).
const NIGHT_WATER_COST = 1; // Costo di idratazione per riposo notturno.

// Costi risorse per movimento (valori piccoli, frazionari per simulare consumo graduale)
const MOVE_FOOD_COST = 0.1; // Consumo di sazietà per ogni passo.
const MOVE_WATER_COST = 0.15; // Consumo di idratazione per ogni passo.

// Costo in passi (tempo) per effettuare una ricerca in un evento
const SEARCH_TIME_COST = 3;

// Tipi di caselle considerati rifugi sicuri per la notte
const SHELTER_TILES = ['R']; // TILE_SYMBOLS.REST_STOP

// Limite slot inventario
const MAX_INVENTORY_SLOTS = 7;

// Probabilità eventi casuali minori (avvengono ad ogni passo se non c'è evento maggiore/tile specifico)
const FLAVOR_TEXT_CHANCE = 0.20; // Probabilità di mostrare un flavor text ambientale.
const LORE_FRAGMENT_CHANCE = 0.02; // Probabilità di trovare un frammento di lore.

// Probabilità eventi complessi generici (Predatori, Animali, etc.) ad ogni passo.
const COMPLEX_EVENT_CHANCE = 0.15; // Probabilità base di un evento complesso per passo (non su rifugi).

// Probabilità relative dei tipi di evento complesso generico (pesi per la scelta).
// Nota: Queste si sommano a 1.0 (o verranno normalizzate).
const COMPLEX_EVENT_TYPE_WEIGHTS = {
    PREDATOR: 0.20,      // Incontro con predatori umanoidi/mutanti.
    ANIMAL: 0.25,        // Incontro con bestie mutanti.
    TRACKS: 0.20,        // Ritrovamento di tracce o indizi.
    ENVIRONMENTAL: 0.15, // Pericolo o opportunità ambientale.
    DILEMMA: 0.10,       // Scelta morale o logistica.
    HORROR: 0.10         // Eventi di orrore psicologico (più probabili di notte).
};

// Probabilità per l'esito di un evento Tracce Strane (dopo successo check 'Tracce').
// NOTA: Queste probabilità non si sommano necessariamente a 100. La logica le usa in cascata
// (se fallisce Loot, prova Lore, se fallisce Lore, prova Danger, altrimenti Nulla).
const TRACCE_LOOT_CHANCE = 0.40;        // Probabilità di trovare risorse/oggetti.
const TRACCE_LORE_CHANCE = 0.30;        // Probabilità di trovare frammenti di lore.
const TRACCE_DANGER_CHANCE = 0.20;      // Probabilità di finire in pericolo (porta a un esito di danno).

// Probabilità per l'esito di un evento Ispezione Rifugio Strano (dopo successo check 'Ispeziona').
const SHELTER_INSPECT_LOOT_CHANCE = 0.50;   // Probabilità di trovare risorse/oggetti.
const SHELTER_INSPECT_LORE_CHANCE = 0.30;   // Probabilità di trovare frammenti di lore.
// Il restante (1.0 - 0.50 - 0.30 = 0.20) sarà Nulla o Trappola. (La logica può decidere tra questi due).

// Costanti per Effetti Passivi Status (danno per passo o per notte se non curato/risolto)
const HUNGER_PENALTY_HP = 1; // Danno HP per notte senza cibo.
const THIRST_PENALTY_HP = 1; // Danno HP per notte senza acqua.
const PASSIVE_HUNGER_DAMAGE = 0.05; // Danno HP per passo se Sazietà <= 0.
const PASSIVE_THIRST_DAMAGE = 0.1; // Danno HP per passo se Idratazione <= 0.
const PASSIVE_INJURY_DAMAGE = 0.08; // Danno HP per passo se Ferito.
const PASSIVE_SICKNESS_DAMAGE = 0.12; // Danno HP per passo se Malato.
const PASSIVE_POISON_DAMAGE = 0.15; // Danno HP per passo se Avvelenato.

// Danno specifico per movimento notturno all'aperto
const NIGHT_MOVE_PENALTY_HP = 0.5; // Danno HP per passo fatto di notte fuori da un rifugio.

// Costi Extra Risorse dovuti agli Stati
const SICKNESS_EXTRA_FOOD_COST = 0.05; // Costo extra Sazietà per passo se Malato.
const SICKNESS_EXTRA_WATER_COST = 0.08; // Costo extra Idratazione per passo se Malato.

// Probabilità per Eventi Unici (Easter Egg, ecc.)
const EASTER_EGG_CHANCE = 0.005; // Probabilità molto bassa per eventi unici specifici (es. PixelDebh, WebRadio).

// Costante per il bonus statistica guadagnato affrontando Orrore (se successo check)
const HORROR_ADAPTATION_GAIN = 2;

// Costante per il bonus statistica guadagnato risolvendo Dilemma (se successo check)
const DILEMMA_STAT_GAIN = 1; // Potrebbe essere Agilità o Influenza

// Quantità di usura applicata all'arma per uso in eventi (es. forzare passaggio)
const WEAR_FROM_USAGE = 1;

// Probabilità di trovare carne sconfiggendo animali
const ANIMAL_MEAT_DROP_CHANCE = 0.6; // 60% probabilità di trovare carne.

// Probabilità di trovare loot seguendo tracce (dopo check successo e fallimento di Loot/Lore/Danger specifico)
const TRACCE_SUCCESS_LOOT_WEIGHTS = {
    'scrap_metal': 30, 'bandages_dirty': 25, 'canned_food': 15,
    'water_purified_small': 12, 'mechanical_parts': 8, 'ammo_9mm': 6,
    'pipe_wrench': 3, 'leather_jacket_worn': 1
}; // Pesi per random_common_resource migliorato su Tracce

// Probabilità di trovare loot ispezionando rifugi
const SHELTER_INSPECT_LOOT_WEIGHTS = {
    'scrap_metal': 20, 'bandages_dirty': 18, 'canned_food': 14,
    'water_purified_small': 10, 'vitamins': 8, 'bandages_clean': 7,
    'repair_kit': 6, 'ammo_9mm': 5, 'mechanical_parts': 4,
    'pistol_makeshift': 2, 'leather_jacket_worn': 1
}; // Pesi per random_common_resource migliorato su Rifugi

// Probabilità di contrarre malattia da carne cruda
const RAW_MEAT_SICKNESS_CHANCE = 0.25;

// Probabilità di contrarre avvelenamento da bacche/acqua sporca
const BERRIES_POISON_CHANCE = 0.20;
const DIRTY_WATER_POISON_CHANCE = 0.70;

// Probabilità di recuperare munizioni da balestra/arco dopo l'uso
const RECOVER_ARROW_BOLT_CHANCE = 0.40;

// Fattore di riduzione danno da armatura
const ARMOR_DAMAGE_REDUCTION_FACTOR = 1; // Sottrae armorValue direttamente dal danno

// Fattore di riduzione danno da armatura contro Orrore (meno efficace?)
const ARMOR_HORROR_REDUCTION_FACTOR = 0.5; // Sottrae armorValue * 0.5 (arrotondato)

// Danni base per fallimenti di eventi complessi (prima riduzione armatura)
const PREDATOR_FLEE_FAIL_DAMAGE_MIN = 2;
const PREDATOR_FLEE_FAIL_DAMAGE_MAX = 5;
const PREDATOR_FIGHT_FAIL_DAMAGE_MIN = 5;
const PREDATOR_FIGHT_FAIL_DAMAGE_MAX = 12;
const PREDATOR_TALK_FAIL_DAMAGE_MIN = 1; // Danno iniziale da aggressione immediata
const PREDATOR_TALK_FAIL_DAMAGE_MAX = 4;
const PREDATOR_FIGHT_FAIL_LOOT_LOSS_CHANCE = 0.50; // 50% chance di perdere loot se fallisci la lotta
const PREDATOR_FIGHT_FAIL_LOOT_LOSS_MAX = 2; // Massimo 2 unità di cibo/acqua perse

const ANIMAL_EVADE_FAIL_DAMAGE_MIN = 3;
const ANIMAL_EVADE_FAIL_DAMAGE_MAX = 7;
const ANIMAL_ATTACK_FAIL_DAMAGE_MIN = 5;
const ANIMAL_ATTACK_FAIL_DAMAGE_MAX = 10;

const ENVIRONMENTAL_FAIL_DAMAGE_MIN = 4;
const ENVIRONMENTAL_FAIL_DAMAGE_MAX = 10;
const ENVIRONMENTAL_SICKNESS_CHANCE = 0.15; // Probabilità di contrarre malattia

const DILEMMA_INTERVENE_FAIL_DAMAGE_MIN = 3;
const DILEMMA_INTERVENE_FAIL_DAMAGE_MAX = 8;

const SHELTER_INSPECT_TRAP_DAMAGE_MIN = 5;
const SHELTER_INSPECT_TRAP_DAMAGE_MAX = 12;
const SHELTER_INSPECT_TRAP_SICKNESS_CHANCE = 0.1; // Probabilità di contrarre malattia

const HORROR_FLEE_FAIL_DAMAGE_MIN = 1;
const HORROR_FLEE_FAIL_DAMAGE_MAX = 5;
const HORROR_AFFRONT_FAIL_DAMAGE_MIN = 5;
const HORROR_AFFRONT_FAIL_DAMAGE_MAX = 15;

// Aggiunta la chance di loot per i predatori
const PREDATOR_LOOT_CHANCE = 0.5; // 50% di probabilità di loot dopo aver sconfitto un predatore

// Definizione dei tipi di arma per la funzione getTipoArmaLabel (spostato qui da game_logic)
const TIPO_ARMA_LABELS = {
    'mischia': 'Arma da mischia',
    'bianca_lunga': 'Arma bianca lunga',
    'bianca_corta': 'Arma bianca corta',
    'lancio': 'Arma da lancio',
    'fuoco': 'Arma da fuoco',
    'balestra': 'Balestra/Arco',
    'arco': 'Balestra/Arco' // Anche 'arco' rientra nella stessa label generica
};


// Definizione degli effetti degli oggetti utilizzabili (spostato qui da game_logic)
// Nota: Questo oggetto è solo per la visualizzazione nel tooltip, la logica dell'effetto
// sarà nel file player.js
const ITEM_EFFECT_DESCRIPTIONS = {
    add_resource: (effect) => {
        if (effect.resource_type === 'hp') {
            return `Cura HP: +${effect.amount}`;
        } else if (effect.resource_type === 'food') {
            return `Sazietà: +${effect.amount}`;
        } else if (effect.resource_type === 'water') {
            return `Idratazione: +${effect.amount}`;
        }
        return `Aggiunge ${effect.amount} ${effect.resource_type}`;
    },
    cure_status: (effect) => {
        // Mappa status_cured a nome leggibile
        let statusName = '';
        switch (effect.status_cured) {
            case 'isInjured': statusName = 'Ferite'; break;
            case 'isSick': statusName = 'Malattia'; break;
            case 'isPoisoned': statusName = 'Avvelenamento'; break;
            default: statusName = effect.status_cured || 'Status'; break;
        }
        let desc = `Cura ${statusName}`;
        if (effect.chance) {
            desc += ` (${Math.floor(effect.chance * 100)}%)`;
        }
        if (effect.heal_hp_on_success && effect.heal_hp_on_success > 0) {
            desc += `, Rigenera +${effect.heal_hp_on_success} HP (su successo)`;
        }
        return desc;
    },
    add_resource_poisonable: (effect) => {
        let desc = ITEM_EFFECT_DESCRIPTIONS.add_resource(effect);
        if (effect.poison_chance) desc += ` (Rischio veleno: ${Math.floor(effect.poison_chance * 100)}%)`;
        return desc;
    },
    add_resource_sickness: (effect) => {
        let desc = ITEM_EFFECT_DESCRIPTIONS.add_resource(effect);
        if (effect.sickness_chance) desc += ` (Rischio malattia: ${Math.floor(effect.sickness_chance * 100)}%)`;
        return desc;
    },
    repair_item_type: (effect) => {
        return "Avvia riparazione oggetto";
    },
    random_pill_effect: (effect) => {
        return "Effetto Casuale";
    },
    learn_recipe: (effect) => {
        return "Apprendi Ricetta";
    },
    reveal_map_area: (effect) => {
        return "Rivela area mappa";
    },
    show_lore: (effect) => "Rivela un frammento di lore"
};

// --- FINE COSTANTI NUMERICHE E PROBABILISTICHE ---
// Pool di risorse comuni trovate casualmente (usato da applyChoiceReward con type: 'random_common_resource')
const COMMON_RESOURCES_POOL = [
    'scrap_metal',
    'bandages_dirty',
    'canned_food',
    'water_purified_small',
    'berries',
    'ammo_generic',
    'mechanical_parts'
];

const MIN_MAP_REVEAL_RADIUS = 3;
const MAX_MAP_REVEAL_RADIUS = 8;

// NUOVO: Pool per i progetti (blueprints)
const BLUEPRINT_POOL = [
    { id: 'blueprint_crude_club', weight: 100 } // Per ora solo questo, peso 100 per assicurare che venga scelto se il pool è selezionato
];

// Array per descrizioni evento tracce - Esito OK, trovato Lore
// ... existing code ...
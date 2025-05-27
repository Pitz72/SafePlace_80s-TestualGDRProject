/**
 * TheSafePlace - Roguelike Postapocalittico
 * Versione: v0.9.0-SURVIVAL-PERFECTED
 * File: js/game_constants.js
 * Descrizione: Variabili di stato globali e costanti numeriche/probabilistiche.
 */

// Versione del gioco
const GAME_NAME = "The Safe Place";
const GAME_VERSION = "v0.9.0-SURVIVAL-PERFECTED";
const DEBUG_MODE = true; // Impostare a true per abilitare log di debug specifici

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
const MOVE_FOOD_COST = 0.07; // Consumo di sazietà per ogni passo.
const MOVE_WATER_COST = 0.10; // Consumo di idratazione per ogni passo.

// Costo in passi (tempo) per effettuare una ricerca in un evento
const SEARCH_TIME_COST = 3;

// Tipi di caselle considerati rifugi sicuri per la notte
const SHELTER_TILES = ['R']; // TILE_SYMBOLS.REST_STOP

// Limite slot inventario
const MAX_INVENTORY_SLOTS = 9;

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
    'scrap_metal': 20, 'bandages_dirty': 18, 'canned_food': 20,
    'water_purified_small': 18, 'vitamins': 8, 'bandages_clean': 10,
    'repair_kit': 6, 'ammo_9mm': 5, 'mechanical_parts': 4,
    'pistol_makeshift': 2, 'leather_jacket_worn': 1,
    'medicine_crude': 5
}; // Pesi per random_common_resource migliorato su Rifugi

// Probabilità di contrarre malattia da carne cruda
const RAW_MEAT_SICKNESS_CHANCE = 0.25;

// Probabilità di contrarre avvelenamento da bacche/acqua sporca
const BERRIES_POISON_CHANCE = 0.20;
const DIRTY_WATER_POISON_CHANCE = 0.45;

// Durata Malattia
const SICKNESS_DURATION_MIN = 2; // Giorni
const SICKNESS_DURATION_MAX = 5; // Giorni

// Probabilità di fallire un disinnesco generico
const GENERIC_TRAP_FAIL_CHANCE = 0.35;

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
    learn_recipe: (effect) => `Permette di apprendere la ricetta per: ${CRAFTING_RECIPES[effect.recipeKey]?.productName || effect.recipeKey}.`,
    reveal_map_area: (effect) => {
        return "Rivela area mappa";
    },
    show_lore: (effect) => "Rivela un frammento di conoscenza del passato."
};

// --- FINE COSTANTI NUMERICHE E PROBABILISTICHE ---

// Tabelle per oggetti casuali usate dal sistema di ricompense eventi
// Mappano i tipi usati negli eventi ai pool di ricompense
const RANDOM_ITEM_TABLES = {
    'random_food_item': {
        'canned_food': 30,
        'ration_pack': 20,
        'berries': 15,
        'chips_stale': 15,
        'canned_beans': 20,
        'meat_raw': 8,
        'chocolate_bar': 12,
        'dried_fruit': 15,
        'protein_bar_old': 12,
        'mystery_meat_cooked': 10,
        'meat_cooked': 10,
        'mre_pack': 5
    },
    'random_water_item': {
        'water_purified_small': 35,
        'water_dirty': 25,
        'soda_flat': 15,
        'rainwater_collected': 18,
        'juice_box_found': 12,
        'herbal_tea_crude': 10,
        'energy_drink_old': 8,
        'water_bottle': 5
    },
    'random_weapon_item': {
        'wooden_club': 20,
        'kitchen_knife': 15,
        'shiv_improvised': 18,
        'metal_bar': 12,
        'pipe_wrench': 8,
        'combat_knife': 7,
        'machete_rusty': 6,
        'baseball_bat': 7,
        'throwing_knife': 10,
        'rock_sharp': 15,
        'improvised_bow': 5,
        'pistol_makeshift': 3
    },
    'random_ammo_item': {
        'ammo_arrow_crude': 25,
        'ammo_generic': 20,
        'ammo_9mm': 15,
        'ammo_bolt': 10,
        'ammo_revolver_generic': 8,
        'ammo_shell': 5
    },
    'nothing': {
        // Tabella vuota per ricompense "nessuna"
    },
    'random_medical_item': {
        'bandages_clean': 35,
        'suspicious_pills': 15,
        'herbal_salve': 20,
        'medicine_crude': 25,
        'antidote': 10,
        'first_aid_kit': 5,
        'charcoal_powder_medical': 8,
        'chewed_willow_leaves': 10
    },
    'random_common_resource': {
        'scrap_metal': 30,
        'charcoal': 20,
        'bandages_dirty': 20,
        'water_dirty': 15,
        'wood_planks': 25,
        'cloth_rags': 20
    },
    'random_rare_resource': {
        'mechanical_parts': 35,
        'repair_kit': 20,
        'vitamins': 15,
        'lockpick_set_crude': 15,
        'map_fragment_local': 10
    },
    'random_blueprint': {
        'blueprint_crude_club': 100
    }
};

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

const RANDOM_REWARD_POOLS = {
    COMMON_RESOURCE: [
        { id: 'scrap_metal', weight: 30 },
        { id: 'charcoal', weight: 20 },
        { id: 'bandages_dirty', weight: 20 },
        { id: 'water_dirty', weight: 15 },
        { id: 'wood_planks', weight: 25 },
        { id: 'cloth_rags', weight: 20 }
    ],
    RARE_RESOURCE: [
        { id: 'mechanical_parts', weight: 35 },
        { id: 'repair_kit', weight: 20 },
        { id: 'vitamins', weight: 15 },
        { id: 'lockpick_set_crude', weight: 15 },
        { id: 'map_fragment_local', weight: 10 }
    ],
    MEDICAL_ITEM: [
        { id: 'bandages_clean', weight: 35 },
        { id: 'suspicious_pills', weight: 15 },
        { id: 'herbal_salve', weight: 20 },
        { id: 'medicine_crude', weight: 25 },
        { id: 'antidote', weight: 10 },
        { id: 'first_aid_kit', weight: 5 },
        { id: 'charcoal_powder_medical', weight: 8 },
        { id: 'chewed_willow_leaves', weight: 10 }
    ],
    FOOD_ITEM: [
        { id: 'canned_food', weight: 30 },
        { id: 'ration_pack', weight: 20 },
        { id: 'berries', weight: 15 },
        { id: 'chips_stale', weight: 15 },
        { id: 'canned_beans', weight: 20 },
        { id: 'meat_raw', weight: 8 },
        { id: 'chocolate_bar', weight: 12 },
        { id: 'dried_fruit', weight: 15 },
        { id: 'protein_bar_old', weight: 12 },
        { id: 'mystery_meat_cooked', weight: 10 },
        { id: 'meat_cooked', weight: 10 },
        { id: 'mre_pack', weight: 5 }
    ],
    WATER_ITEM: [
        { id: 'water_purified_small', weight: 35 },
        { id: 'water_dirty', weight: 25 },
        { id: 'soda_flat', weight: 15 },
        { id: 'rainwater_collected', weight: 18 },
        { id: 'juice_box_found', weight: 12 },
        { id: 'herbal_tea_crude', weight: 10 },
        { id: 'energy_drink_old', weight: 8 },
        { id: 'water_bottle', weight: 5 }
    ],
    RANDOM_WEAPON_POOL: [
        { id: 'wooden_club', weight: 20 },
        { id: 'kitchen_knife', weight: 15 },
        { id: 'shiv_improvised', weight: 18 },
        { id: 'metal_bar', weight: 12 },
        { id: 'pipe_wrench', weight: 8 },
        { id: 'combat_knife', weight: 7 },
        { id: 'machete_rusty', weight: 6 },
        { id: 'baseball_bat', weight: 7 },
        { id: 'throwing_knife', weight: 10 },
        { id: 'rock_sharp', weight: 15 },
        { id: 'improvised_bow', weight: 5 },
        { id: 'pistol_makeshift', weight: 3 }
    ],
    RANDOM_AMMO_POOL: [
        { id: 'ammo_arrow_crude', weight: 25 },
        { id: 'ammo_generic', weight: 20 },
        { id: 'ammo_9mm', weight: 15 },
        { id: 'ammo_bolt', weight: 10 },
        { id: 'ammo_revolver_generic', weight: 8 },
        { id: 'ammo_shell', weight: 5 }
    ]
};
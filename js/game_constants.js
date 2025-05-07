/**
 * TheSafePlace - Roguelike Postapocalittico
 * Versione: v0.7.09
 * File: js/game_constants.js
 * Descrizione: Variabili di stato globali e costanti numeriche/probabilistiche.
 */

// Versione del gioco
const GAME_VERSION = "v0.7.09";

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
const NIGHT_FOOD_COST = 2;  // Costo di sazietà per riposo notturno (indipendentemente dal luogo).
const NIGHT_WATER_COST = 2; // Costo di idratazione per riposo notturno.

// Costi risorse per movimento (valori piccoli, frazionari per simulare consumo graduale)
const MOVE_FOOD_COST = 0.1; // Consumo di sazietà per ogni passo.
const MOVE_WATER_COST = 0.15; // Consumo di idratazione per ogni passo.

// Costo in passi (tempo) per effettuare una ricerca in un evento
const SEARCH_TIME_COST = 3;

// Tipi di caselle considerati rifugi sicuri per la notte
const SHELTER_TILES = [TILE_SYMBOLS.REST_STOP]; // Solo 'R' è un rifugio sicuro automatico per la notte

// Limite slot inventario
const MAX_INVENTORY_SLOTS = 6;

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
     'add_resource': (effect) => {
         if (effect.resource_type === 'food') return `Sazietà: +${effect.amount}`;
         if (effect.resource_type === 'water') return `Idratazione: +${effect.amount}`;
         if (effect.resource_type === 'hp') return `Cura: +${effect.amount} HP`;
         return "Aggiunge risorse";
     },
     'add_resource_poisonable': (effect) => {
         let desc = ITEM_EFFECT_DESCRIPTIONS.add_resource(effect); // Inizia con la descrizione base
         if (effect.poison_chance) desc += ` (Rischio veleno: ${Math.floor(effect.poison_chance * 100)}%)`;
         return desc;
     },
     'add_resource_sickness': (effect) => {
         let desc = ITEM_EFFECT_DESCRIPTIONS.add_resource(effect); // Inizia con la descrizione base
         if (effect.sickness_chance) desc += ` (Rischio malattia: ${Math.floor(effect.sickness_chance * 100)}%)`;
         return desc;
     },
     'cure_status': (effect) => {
         let statuses = [];
         if (effect.status_cured === 'isInjured') statuses.push('Ferite');
         if (effect.status_cured === 'isSick') statuses.push('Malattie');
         if (effect.status_cured === 'isPoisoned') statuses.push('Avvelenamento');
         let desc = `Cura: ${statuses.join(', ')}`;
         if (effect.chance !== 1.0) desc += ` (${Math.floor(effect.chance * 100)}% chance)`;
         if (effect.heal_hp_on_success) desc += `, cura ${effect.heal_hp_on_success} HP (su successo)`;
         return desc;
     },
     'repair_weapon': (effect) => `Ripara arma: +${effect.repair_amount} Durabilità`,
     'show_lore': (effect) => `Rivela un frammento di lore`,
     // Aggiungere altre descrizioni per altri tipi di effetto se necessario
};


// Probabilità per l'esito di un evento Tracce Strane (dopo check successo, basato su probabilità in cascata)
// Non sono costanti di probabilità, ma definiscono la sequenza e le probabilità interne della logica
// Vengono qui definite per riferimento, ma usate e potenzialmente modificate in events.js
/*
const TRACCE_SUCCESS_OUTCOME_CHANCES = [
    { type: 'loot', chance: 0.40, descriptions: esitiSeguiTracceOkLoot, lootWeights: TRACCE_SUCCESS_LOOT_WEIGHTS },
    { type: 'lore', chance: 0.30, descriptions: esitiSeguiTracceOkLore }, // Chance È condizionale
    { type: 'danger', chance: 0.20, descriptions: esitiSeguiTracceOkPredoni }, // Chance È condizionale
    { type: 'nothing', chance: 0.10, descriptions: esitiSeguiTracceOkNulla } // Chance È condizionale
];
*/
// NOTA: La logica attuale in handleEventChoice usa un approccio a cascata semplificato (40% loot, 25% lore, 20% danger, 15% nothing)
// Questa definizione sopra è più pulita e dovrebbe essere quella usata dopo il refactoring di events.js.

// NOTA: La logica attuale in handleEventChoice per SHELTER_INSPECT usa 50% Loot, 25% Lore, 25% Nulla/Trappola.
// Questa definizione sopra è più pulita e dovrebbe essere quella usata dopo il refactoring di events.js.

// Testi esiti eventi complessi (spostati da game_logic)
const esitiEvitaAnimaleKo = [
    "Troppo rumoroso! La bestia si volta di scatto, un ringhio basso e gutturale che vibra nell'aria.", "Sottovaluti i suoi sensi acuti. Ti individua nonostante la tua mimetizzazione.", "Un passo falso su un ramo secco, un suono che è la tua condanna. La bestia carica!", "Fai cadere qualcosa dal tuo zaino con un rumore sordo. Attiri la sua attenzione immediata.", "Il vento gira improvvisamente, portando il tuo odore dritto alle sue narici. Ti ha fiutato.",
    "Ti muovi troppo in fretta, troppo bruscamente. Il movimento ti tradisce nell'ombra.", "Non c'è via d'uscita. Il terreno è troppo aperto, sei esposto.", "Il tuo tentativo di nasconderti dietro un riparo fragile fallisce miseramente. Ti ha visto.", "Ti scopre all'ultimo secondo, quando pensavi fosse fatta. Un ruggito rabbioso squarcia l'aria.", "Emette un verso di sfida e si prepara a caricare, zampe che scavano il terreno!",
    "Ti punta dritto negli occhi, immobile per un istante, poi scatta verso di te.", "Calpesti schegge di vetro nel momento peggiore. Il suono cristallino è un invito all'attacco.", "Il tuo nascondiglio si rivela una trappola. La bestia ti blocca l'unica uscita.", "La creatura ti taglia la strada, costringendoti allo scontro.", "Senti il suo fiato caldo e fetido sul collo prima ancora di vederla. È troppo tardi."
];
const esitiAttaccoAnimaleKo = [
    "Le sue zanne affondano nella tua carne come coltelli roventi. Urli di dolore.", "Vieni morso ferocemente e sbattuto a terra con violenza inaudita.", "La sua furia primordiale ti travolge. La tua difesa è inutile contro la sua potenza.", "Ti artiglia dolorosamente, strappando vestiti e pelle, lasciando solchi profondi.", "Vieni ferito gravemente nello scontro caotico. Il sangue ti annebbia la vista.",
    "Ti scaraventa via come una bambola di pezza contro un muro. Senti le ossa scricchiolare.", "Le sue difese naturali (pelle coriacea, scaglie, esoscheletro) sono impenetrabili.", "I tuoi colpi rimbalzano sulla sua corazza o pelliccia spessa. È inutile.", "Ti disarma con un colpo improvviso, la tua arma vola via nel buio. Sei vulnerabile.", "Cadi sotto i suoi colpi potenti e ripetuti, sopraffatto dalla sua forza.",
    "Ti morde a una gamba, senti l'osso incrinarsi, immobilizzandoti quasi.", "Il dolore acuto ti annebbia la vista, rendendo difficile reagire.", "Ti inietta un veleno che brucia nelle vene, paralizzandoti o confondendoti.", "La forza dell'impatto ti lascia senza fiato, stordito, incapace di reagire.", "Vieni afferrato e sbattuto ripetutamente contro il terreno, come un fuscello."
];
const esitiPericoloAmbientaleColpito = [
    "Troppo lento! Vieni colpito in pieno, un dolore accecante ti travolge!", "La trappola scatta con uno schiocco sinistro. Urli di dolore mentre ti ferisce.", "Vieni travolto dai detriti pesanti, che ti feriscono e ti bloccano.", "Una fitta lancinante! Senti qualcosa rompersi o slogarsi con un rumore orribile.", "Cadi rovinosamente, battendo la testa. La vista si annebbia, perdi l'orientamento.",
    "Schegge affilate si conficcano nella tua carne, causando ferite multiple.", "Il gas tossico ti riempie i polmoni. Barcolli, tossendo, la nausea ti assale.", "Una potente scossa elettrica ti attraversa il corpo, paralizzandoti e bruciandoti.", "Il pavimento cede. Precipiti nel buio, atterrando malamente tra le macerie.", "Vieni colpito da un dardo avvelenato. Senti il veleno bruciare e diffondersi rapidamente.",
    "La caduta ti lascia senza fiato e coperto di lividi dolorosi.", "Il tuo urlo di dolore involontario riecheggia, attirando attenzioni indesiderate.", "Vieni investito da un'ondata di calore estremo o freddo glaciale che ti danneggia.", "Una sostanza corrosiva ti schizza addosso, bruciando la pelle e l'equipaggiamento.", "Vieni avvolto da una rete appiccicosa o immobilizzato da una trappola paralizzante."
];
const esitiDilemmaMoraleIndagaKo = [
    "Sottovaluti la situazione. Il tuo intervento maldestro peggiora le cose, causando più vittime.", "Non riesci a trovare la fonte del problema in tempo. Vaghi inutilmente mentre la tragedia si compie.", "Vieni sopraffatto dagli eventi. Troppo violenti, troppo complessi per te.", "Non capisci chi sia il vero nemico. Prendi la decisione sbagliata, con conseguenze fatali.", "Esiti troppo a lungo. L'opportunità di agire (or the disaster) si conclude senza di te.",
    "Il tuo intervento, seppur ben intenzionato, scatena una catena di eventi negativi imprevisti.", "Ti perdi nel caos, incapace di raggiungere il luogo dell'azione in tempo.", "Ti rendi conto di non avere le risorse o le forze per fare la differenza. Un senso di impotenza ti schiaccia.", "Ti ritiri confuso e frustrato, tormentato dal dubbio di ciò che avresti potuto fare.", "Le tue azioni hanno conseguenze impreviste e dannose per te o per altri innocenti.",
    "Vieni scoperto mentre cerchi di capire la situazione e costretto a una fuga precipitosa.", "Interpreti male i segnali e aiuti la fazione sbagliata o cadi in una trappola.", "Il tuo tentativo di mediazione fallisce, scatenando uno scontro ancora più violento.", "Non riesci a superare un ostacolo (serratura, macerie) per intervenire in tempo.", "Vieni ferito o catturato mentre cerchi di capire cosa sta succedendo."
];
const esitiRifugioIspezionaKoTrappola = [
    "Trappola! Rimuovendo il muro scatta una piccola carica esplosiva o una nube di gas!", "Il contenitore era protetto da un ago avvelenato o una scarica elettrica!", "Mentre ispezioni, qualcosa di pesante cade dall'alto o il pavimento cede sotto di te!", "La mattonella smossa nasconde una trappola a pressione: gas, dardi o un allarme!", "L'interruttore sbagliato attiva una sirena assordante, luci stroboscopiche o rilascia una creatura!",
    "Vieni punto, tagliato o folgorato dal meccanismo di apertura della lamiera.", "Una potente scarica elettrica ti attraversa mentre cerchi di forzare il contenitore.", "Il foro nel muro nascondeva un piccolo dardo soporifero o allucinogeno!", "Il pavimento cede, facendoti cadere in una fossa con punte, liquido corrosivo o creature.", "I graffi erano un avvertimento! Attivi una trappola sonora che attira predatori.",
    "Il libro è collegato a una trappola esplosiva o a un meccanismo che sigilla il rifugio.", "L'odore proviene da una sostanza chimica corrosiva o da spore che causano malattie.", "La porta bloccata è protetta da una scarica elettrica letale o da un meccanismo di difesa.", "Il pannello metallico nasconde cavi scoperti o rilascia una scarica energetica.", "La chiave è collegata a un meccanismo che fa crollare parte del rifugio o rilascia veleno."
];
const esitiOrroreIndicibileFugaKo = [
    "La paura ti paralizza. Sei congelato sul posto, incapace di muoverti o gridare.", "Non puoi sfuggire alla presenza. Ti segue come un'ombra, dentro e fuori dalla tua mente.", "Qualcosa di freddo e intangibile ti afferra. Perdi il controllo, la tua volontà si spezza.", "Inciampi e cadi. L'orrore informe ti sovrasta, avvolgendoti nel suo abbraccio gelido.", "Corri alla cieca e ti schianti contro un muro o cadi in una buca. Sei ferito e in trappola.",
    "Il panico ti sommerge. Non riesci a pensare, a reagire. Sei sopraffatto.", "Non importa quanto corri. La sensazione opprimente rimane, un parassita nella tua mente.", "Senti le tue energie vitali prosciugarsi rapidamente, risucchiate dalla presenza.", "Le gambe diventano di piombo, pesanti, impossibili da muovere.", "Sei costretto a rivivere i tuoi traumi peggiori, i tuoi fallimenti, le tue perdite.",
    "L'orrore ti circonda, chiudendo ogni via di fuga. Non c'è scampo.", "Perdi l'orientamento, corri in cerchio, tornando sempre al punto di partenza.", "La tua fonte di luce si spegne improvvisamente. Sei solo nel buio con... quello.", "Cadi in ginocchio, piangendo e balbettando, la tua mente ridotta a un guscio tremante.", "L'orrore si insinua nei tuoi pensieri, sussurrandoti verità terribili e promesse folli."
];
const esitiOrroreIndicibileAffrontaKo = [
    "Il tuo coraggio si infrange contro l'orrore assoluto. Cedi alla paura.", "Vieni sopraffatto da visioni personali e terrificanti. Dubiti della tua sanità.", "La tua mente si spezza. Scivoli nella follia, nella disperazione, nel vuoto...", "Urli finché non hai più voce, ma l'orrore non ha orecchie. Ti ignora.", "L'orrore ti consuma dall'interno, lasciandoti un guscio vuoto, traumatizzato.",
    "Cadi in ginocchio, sopraffatto, incapace di reagire, perso.", "La pressione è insopportabile. La tua mente si frammenta.", "Perdi conoscenza. Ti risvegli dopo, cambiato, con cicatrici invisibili.", "La presenza ti mostra verità cosmiche che la tua mente non può comprendere o sopportare.", "Vieni marcato, fisicamente o mentalmente. Porterai questo segno per sempre.",
    "Le tue paure più profonde si manifestano e ti attaccano fisicamente.", "Perdi temporaneamente la memoria, la parola o la vista.", "Sviluppi una fobia o una paranoia permanente legata all'incontro.", "L'orrore si ritira, ma senti che tornerà. Ti ha scelto.", "Vieni posseduto temporaneamente, agendo contro la tua volontà."
];


// Testi per esiti eventi complessi (Successo/OK)
const esitiEvitaAnimaleOk = [
    "Scivoli via come un fantasma, senza un suono, mentre la creatura è distratta da altro.", "Passi con cautela estrema, muovendoti solo quando non guarda. Ti ignora, forse sazia.", "Ti nascondi dietro un relitto metallico finché la bestia non si allontana, il cuore che martella.", "Sfrutti la copertura del terreno, passando da un'ombra all'altra, senza entrare nel suo campo visivo.", "Ti muovi controvento, lento e metodico. L'animale non avverte il tuo odore, ignaro.",
    "Ti immobilizzi, trattenendo il respiro, diventando una statua finché non passa oltre, disinteressata.", "Trovi un percorso alternativo tra la vegetazione mutata o le rovine, svanendo alla sua vista.", "La bestia è distratta da un rumore lontano o dall'odore di un'altra preda. Ne approfitti.", "Il rumore costante del vento o di un fiume copre i tuoi passi furtivi.", "Passi rapidamente nell'ombra più profonda, un guizzo quasi impercettibile.",
    "Ti allontani silenziosamente, lasciando la creatura alla sua esistenza solitaria e brutale.", "Il tuo basso profilo e la tua calma ti salvano da uno scontro potenzialmente letale.", "Lanci un sasso lontano, attirando la sua attenzione altrove, e fuggi nella direzione opposta.", "Ti appiatti contro un muro freddo, aspettando pazientemente che si allontani nel suo territorio.", "La creatura sembra più interessata a marcare il suo territorio con fluidi nauseabondi che a cacciare. Ti ignora."
];
const esitiAttaccoAnimaleOk = [
    "Un colpo fortunato e ben piazzato la ferisce, facendola indietreggiare con un gemito.", "La ferisci abbastanza da farla sanguinare copiosamente. Decide che non vali la pena e fugge.", "La tieni a bada con una difesa disperata, guadagnando secondi preziosi per ritirarti.", "Un colpo critico! La creatura crolla a terra in un rantolo. La minaccia è neutralizzata.", "Dopo una lotta breve e furiosa, la bestia si ritira sanguinante, sconfitta per ora.",
    "La costringi alla fuga con una difesa tenace e qualche ferita che la rallenterà.", "Riesci a infliggergli una ferita dolorosa che lo rallenta e lo scoraggia.", "La accechi temporaneamente con polvere o un liquido irritante e ne approfitti per scappare.", "Colpisci un punto debole evidente (una vecchia ferita, una placca corazzata mancante), facendola barcollare.", "La tua difesa è sorprendentemente solida. Pari i suoi attacchi e la costringi a riconsiderare.",
    "Cade a terra gravemente ferita, contorcendosi. Non sarà più una minaccia.", "Si ritira nell'ombra, lasciando dietro di sé una scia di sangue scuro e denso.", "Con un colpo fortunato, le spezzi una zampa o un'ala, rendendola vulnerabile.", "La spingi o la attiri in una trappola naturale (crepaccio, sabbie mobili, fiume).", "La tua ferocia nello scontro la sorprende. Cerca una preda più facile, più docile."
];
const esitiPericoloAmbientaleEvitato = [
    "Riflessi fulminei! Eviti il peggio per un soffio, il cuore in gola!", "Il tuo istinto di sopravvivenza ti salva, facendoti balzare via all'ultimo istante!", "Balzi indietro o di lato appena in tempo, sentendo il vento del pericolo sulla pelle!", "Ti fermi un millisecondo prima di attivare la trappola o finire sotto il crollo!", "Schivi l'ostacolo o il proiettile con un'agilità felina che ti sorprende!",
    "Ti getti a terra istintivamente mentre il pericolo sfreccia innocuo sopra di te!", "Riesci a stabilizzare la struttura o a disinnescare la trappola con mano ferma!", "Tagli un filo o blocchi un ingranaggio, interrompendo il meccanismo mortale!", "Prontezza di spirito e lucidità ti salvano ancora una volta da una morte stupida!", "Un movimento quasi inconscio ti porta fuori dalla traiettoria del disastro!",
    "Noti un dettaglio quasi invisibile che rivela la trappola nascosta!", "Eviti il pericolo per un soffio, il cuore che batte all'impazzata.", "Rotoli via all'ultimo secondo, sentendo l'impatto vicino a te.", "Devii l'oggetto pericoloso con un calcio o una spinta ben assestata.", "Ti aggrappi a una sporgenza, dondolando sul vuoto ma salvo."
];
const esitiDilemmaMoraleIndagaOkPositivo = [
    "Intervieni con coraggio e salvi un innocente. Ti ricompensa con provviste preziose o informazioni vitali.", "Segui il fumo e arrivi dopo lo scontro. Trovi armi, munizioni e equipaggiamento utile tra i caduti.", "Aiuti l'inseguito a fuggire. Era un corriere con un messaggio importante o un carico prezioso che condivide.", "Liberi la persona intrappolata. Per gratitudine, ti rivela la posizione di un nascondiglio segreto.", "Riesci a placare la folla o a dimostrare l'innocenza dell'accusato. Guadagni rispetto e forse un alleato.",
    "Consoli il bambino e lo porti in salvo. Trovi una ricompensa lasciata dai genitori o attiri l'attenzione di una fazione benevola.", "Il prigioniero liberato, una volta ripresosi, si rivela essere un abile artigiano o un medico.", "Sventi un sabotaggio o un tradimento. Gli abitanti ti ricompensano con ospitalità e risorse.", "La tua buona azione viene notata. Trovi un dono anonimo (cibo, medicine) lungo il tuo cammino.", "Salvi lo sconosciuto. Più tardi, ti ripaga con interessi o si unisce a te, dimostrandosi un compagno leale.",
    "La cassa contiene tecnologia antica funzionante, medicine rare o dati preziosi.", "Distrai la pattuglia, permettendo ai civili di fuggire. Uno di loro ti dà un talismano fortunato.", "L'individuo sospetto era un informatore sotto copertura. Le sue informazioni sono cruciali.", "Le scorte abbandonate contengono un oggetto unico o un componente raro per il crafting.", "Il segreto che scopri può essere usato per negoziare o per evitare un pericolo maggiore."
];
const esitiRifugioIspezionaOkLoot = [
    "Dietro il muro cavo trovi un piccolo vano segreto con scorte preziose!", "Forzando il contenitore, scopri munizioni rare o componenti elettronici avanzati!", "Sotto la mattonella: acqua purificata, medicine e una mappa parziale!", "L'interruttore apre uno scomparto nascosto con un kit medico quasi intatto!", "Dietro la lamiera mobile: cibo a lunga conservazione e un attrezzo utile!",
    "Nascosti qui: batterie ad alta capacità e materiali per riparazioni.", "Scopri un kit di pronto soccorso militare o un set di attrezzi specializzati.", "Nel foro nel muro trovi un piccolo pacchetto impermeabile con fiammiferi antivento e esche.", "Sotto il pavimento cavo: una piccola scorta di carburante o un filtro per l'acqua.", "Il libro contiene una nota nascosta che indica un deposito di scorte vicino.",
    "Dietro le macerie: un generatore portatile danneggiato ma riparabile.", "La porta sprangata nasconde una piccola armeria o un laboratorio improvvisato.", "Il pannello metallico nasconde componenti rari o un dispositivo tecnologico.", "La chiave apre una cassa metallica ben nascosta piena di risorse.", "La scritta nella polvere indica un punto preciso dove scavare per trovare scorte."
];
const esitiRifugioIspezionaOkLore = [
    "Il simbolo inciso appartiene a una fazione dimenticata o a un culto oscuro.", "Trovi un messaggio logoro che avverte di 'ombre che cantano' o di 'acqua che mente'.", "Dietro il muro c'è un vecchio terminale olografico, spento ma con dati recuperabili.", "La scritta è una coordinata, un codice o un frammento di una profezia inquietante.", "Trovi una mappa dettagliata che indica bunker, tunnel o zone pericolose.",
    "Scopri un diario personale o un log audio che rivela segreti sul passato o sul luogo.", "Il simbolo è la chiave per decifrare un messaggio criptico trovato altrove!", "Dal foro nel muro senti voci in una lingua sconosciuta o musica distorta.", "I graffi formano una mappa stellare o un diagramma tecnologico complesso.", "Il libro è un testo proibito o un manuale scientifico con annotazioni rivelatrici.",
    "L'odore proviene da un esperimento fallito o da un campione biologico alieno.", "La luce proviene da un terminale ancora attivo con log corrotti ma intriganti.", "Il cavo alimenta un dispositivo sconosciuto che sembra monitorare attività psichica.", "La chiave apparteneva a un membro di una setta o di un'organizzazione segreta.", "La scritta è un avvertimento lasciato da un viaggiatore del tempo o da un profeta pazzo."
];
const esitiRifugioIspezionaKoNulla = [
    "È solo una macchia, un'ombra, un rumore innocuo. La tua paranoia ti gioca brutti scherzi.", "Il contenitore è vuoto, arrugginito, inutile. Tempo sprecato.", "Il simbolo è solo un graffito senza senso, opera di un vandalo o di un pazzo.", "La mattonella è solo smossa. Nessun segreto, nessun tesoro.", "L'interruttore è rotto, non collegato a nulla. Non succede niente.",
    "La scritta è illeggibile, cancellata dal tempo o semplicemente uno scarabocchio.", "Era solo la tua immaginazione o la luce ingannevole. Non c'è niente qui.", "Dopo un'attenta ispezione, concludi che non c'è nulla di valore o di nascosto.", "Il suono cavo era solo un'illusione acustica.", "I graffi sono casuali, opera del tempo o di animali.",
    "Il libro è un romanzo rosa o un manuale di istruzioni inutile.", "L'odore proviene da muffa, animali morti o semplice sporcizia.", "La porta è sprangata e non si apre. Fine della storia.", "Il pannello copre solo tubature vuote e arrugginite.", "La chiave non apre nulla in questo rifugio. Forse apparteneva a un altro luogo."
];
const esitiRifugioLasciaPerdere = [
    "Meglio non rischiare. La prudenza è la madre della sopravvivenza.", "La curiosità è un lusso che non puoi permetterti. Lasci stare.", "Ignori il dettaglio sospetto. Hai cose più importanti a cui pensare.", "Decidi che la sicurezza viene prima di un possibile, ma incerto, guadagno.", "Non hai un buon presentimento. L'istinto ti dice di non toccare nulla.",
    "Forse era qualcosa di importante, forse una trappola. Non lo saprai mai. E va bene così.", "Osservi, memorizzi, ma non agisci. Forse tornerai, forse no.", "Valuti che il rischio è troppo alto. Non ne vale la pena.", "L'istinto ti sussurra di non disturbare ciò che dorme.", "Risparmi tempo ed energie preziose per il viaggio.",
    "Ti concentri sulla mappa, sul cibo, sull'acqua. L'essenziale.", "Frugare potrebbe fare rumore, attirare attenzioni. Meglio di no.", "Decidi di non danneggiare ulteriormente questo fragile rifugio.", "Sei troppo stanco e provato per metterti a fare l'esploratore.", "Chi ha nascosto qualcosa qui, lo ha fatto per un motivo. Rispetta la sua scelta."
];
const esitiOrroreIndicibileAffrontaOk = [
    "Stringi i denti, resisti all'ondata di terrore con pura forza di volontà. Lentamente, si ritira.", "Urli la tua sfida nell'oscurità. Il silenzio che segue è teso, ma sei ancora integro.", "Accendi una luce potente (torcia, bengala). L'orrore rifugge dalla luce, sibilando.", "Ti concentri su un ricordo potente (amore, rabbia, speranza). Respingi l'influenza mentale.", "Affronti la paura e scopri che era un'illusione, un trucco della mente... o quasi.",
    "La tua determinazione a sopravvivere è più forte. L'oscurità non può spezzarti.", "Mantieni la calma, controlli il respiro, osservi. La presenza si dissolve come nebbia.", "Recuperi il controllo della tua mente. Scacci le visioni, i sussurri.", "Trovi un oggetto che sembra respingere la presenza (sale, ferro freddo, un simbolo sacro).", "Pronunci parole di potere o una vecchia formula protettiva. Funziona.",
    "Canalizzi la tua paura in rabbia fredda. Questa forza interiore scaccia l'orrore.", "Identifichi la fonte (un oggetto, un luogo, un'entità) e la neutralizzi o la eviti.", "Trovi lucidità nel caos. Vedi oltre le illusioni, capisci la sua natura.", "Ridi in faccia all'orrore, una risata folle e sprezzante. Lo confondi.", "Ti concentri sul tuo obiettivo finale. Questa determinazione ti ancora alla realtà."
];
const esitiOrroreIndicibileFugaOk = [
    "Scappi urlando a perdifiato, il terrore puro ti dà una velocità incredibile. La presenza rimane indietro.", "Ti rannicchi tremando in un angolo buio, chiudendo gli occhi finché l'oppressione non svanisce.", "Chiudi gli occhi, stringi i denti e ti concentri su un pensiero positivo. Quando li riapri, l'orrore è passato.", "Corri senza voltarti, senza pensare, finché i polmoni non bruciano e il cuore non minaccia di esplodere.", "Trovi un piccolo spazio angusto e sicuro (un armadio, sotto un letto) e ti nascondi finché non passa.",
    "Reciti a memoria una vecchia poesia, una preghiera dimenticata, una lista della spesa. Funziona.", "La fuga disperata ti porta casualmente verso una fonte di luce o un luogo protetto.", "Raggiungi un'area aperta sotto la luna piena. La luce sembra indebolire la presenza.", "Ti getti in acqua gelida. Lo shock fisico scaccia temporaneamente l'orrore mentale.", "Corri verso un fuoco lontano, un lampo, un segnale. La luce è la tua salvezza.",
    "Trovi un simbolo protettivo (religioso, arcano) e ti rifugi vicino ad esso. Funziona.", "Urli la tua rabbia e la tua paura al cielo. Il suono rompe la cappa di silenzio e terrore.", "Sali su un punto elevato, guardando il mondo dall'alto. Ti senti meno oppresso.", "Ti concentri su un compito manuale complesso (riparare, pulire l'arma). La routine ti ancora.", "Segui un animale notturno che sembra immune. Ti guida fuori dalla zona d'influenza."
];

// Fine testi esiti eventi complessi


// Descrizioni per risultati di tracce (semplici, usate in handleEventChoice per log)
const descrizioniTracceLoot = [
    "Seguendo le tracce, hai trovato un nascondiglio con alcune risorse.",
    "Una piccola tana di animali contiene tesori insospettabili.",
    "Dietro un cespuglio trovi un piccolo zaino abbandonato, ancora con qualcosa dentro.",
    "Le tracce conducono a una vecchia cassa mezza sepolta nel terreno.",
    "Nella piccola caverna alla fine delle tracce, qualcuno aveva nascosto delle provviste.",
    "Seguendo le impronte, trovi un cadavere riverso a terra, il suo zaino è ancora intatto.",
    "Un vecchio campo base abbandonato contiene ancora risorse utilizzabili.",
    "Sotto un albero cavo scopri un piccolo tesoro nascosto.",
    "Le tracce portano a un veicolo ribaltato, alcune risorse sono ancora recuperabili.",
    "In una piccola buca coperta da rami secchi, qualcuno aveva nascosto un piccolo deposito."
];

const descrizioniTracceLore = [
    "Seguendo questa traccia, hai trovato un frammento del passato.",
    "C'è qualcosa di strano in questo luogo, un eco di ciò che è stato.",
    "Questi segni ti hanno portato a un pezzo di storia dimenticata.",
    "Alla fine del sentiero, trovi qualcosa che parla di un mondo scomparso.",
    "Le tracce conducono a un luogo inquietante dove il passato sembra più presente.",
    "Ti sei imbattuto in un frammento di conoscenza seguendo questi indizi.",
    "Questo percorso ti ha condotto a una scoperta inquietante sul passato.",
    "Un messaggio dal passato attendeva alla fine di queste tracce.",
    "In questo luogo, il velo tra presente e passato sembra più sottile.",
    "La ricerca ti ha portato a una reliquia di tempi dimenticati."
];

const descrizioniTracceDanger = [
    "Sei caduto dritto in un'imboscata!",
    "Seguendo le tracce, ti sei ritrovato faccia a faccia con una minaccia.",
    "Ti accorgi troppo tardi che le tracce erano un'esca...",
    "Un rumore improvviso alle tue spalle. Ti sei messo in trappola da solo!",
    "Le tracce portavano a una tana... e il suo proprietario è appena tornato.",
    "Un sibilo malevolo ti avverte che hai commesso un errore fatale.",
    "Le tracce ti hanno condotto in una zona pericolosa e ostile.",
    "Ti rendi conto troppo tardi di aver seguito le tracce sbagliate.",
    "Era una trappola. E tu ci sei cascato in pieno.",
    "Le tracce si interrompono bruscamente. Poi senti un ringhio alle tue spalle..."
];

const descrizioniTracceNothing = [
    "Le tracce svaniscono nel nulla, lasciandoti disorientato.",
    "Dopo un'ora di ricerca, ti rendi conto di aver perso tempo prezioso.",
    "Le tracce conducono a un vicolo cieco, frustrante ma inevitabile.",
    "Segui le impronte per chilometri, ma alla fine perdono consistenza e svaniscono.",
    "Era solo un falso allarme, le tracce non portano a nulla di interessante.",
    "Ciò che sembrava una pista promettente si rivela inutile.",
    "Le tracce si disperdono, impossibile continuare a seguirle.",
    "Dopo un lungo inseguimento, perdi completamente il sentiero.",
    "Una falsa pista, ma almeno non hai incontrato pericoli.",
    "Niente di utile alla fine di questo percorso, solo delusione."
];

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
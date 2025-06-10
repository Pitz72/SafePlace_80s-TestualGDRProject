/**
 * THE SAFE PLACE - EVENTI LORE LINEARI
 * v1.0.0 "Ultimo's Journey"
 * 
 * Sistema di eventi narrativi progressivi che raccontano la storia di Ultimo
 * dall'inizio del viaggio fino al raggiungimento del Safe Place.
 */

// Eventi narrativi principali in ordine cronologico
const LORE_EVENTS_LINEAR = [
    {
        id: "lore_echo_of_departure",
        title: "L'Eco della Partenza",
        description: "Nel rifugio che è stato la tua casa, trovi la lettera che tuo padre ha lasciato per te. La sua calligrafia tremante rivela l'urgenza: 'Ultimo, figlio mio... se stai leggendo queste parole, significa che non sono tornato in tempo. Il Safe Place esiste, l'ho visto nelle mappe militari prima che tutto crollasse. È la nostra unica speranza. Vai verso est, sempre verso est. Ti aspetterò là, o almeno ci proverò. Le scorte che ti ho lasciato stanno per finire. Devi partire. Sii forte, come ti ho insegnato. Con tutto l'amore che un padre può dare, Marcus.'",
        trigger: {
            type: "days_survived",
            value: 1,
            operator: ">="
        },
        choices: [
            {
                text: "Raccogli le tue cose e parti subito",
                outcome: "Non c'è tempo da perdere. Prepari lo zaino con le ultime provviste e ti avvii verso l'ignoto. Il viaggio inizia ora.",
                effects: [
                    { type: "add_stat", stat: "agilita", value: 1 },
                    { type: "add_lore_flag", flag: "mission_accepted" },
                    { type: "add_lore_flag", flag: "hasty_departure" }
                ]
            },
            {
                text: "Cerca altri indizi nel rifugio",
                outcome: "Prima di partire, frugi tra le cose di tuo padre. Trovi una vecchia mappa militare segnata e alcune note sui pericoli del viaggio.",
                effects: [
                    { type: "add_stat", stat: "percezione", value: 1 },
                    { type: "add_item", item: "old_military_map", quantity: 1 },
                    { type: "add_lore_flag", flag: "mission_accepted" },
                    { type: "add_lore_flag", flag: "careful_preparation" }
                ]
            },
            {
                text: "Medita sulle parole di tuo padre",
                outcome: "Ti siedi un momento a riflettere. I suoi insegnamenti risuonano nella tua mente. Ogni lezione di sopravvivenza torna vivida. Sei pronto.",
                effects: [
                    { type: "add_stat", stat: "adattamento", value: 1 },
                    { type: "add_resource", resource: "experience", value: 5 },
                    { type: "add_lore_flag", flag: "mission_accepted" },
                    { type: "add_lore_flag", flag: "thoughtful_start" }
                ]
            }
        ],
        unique: true,
        priority: 10
    },
    
    {
        id: "lore_first_trial_alone",
        title: "La Prima Prova da Solo",
        description: "La notte cade e sei completamente solo per la prima volta. Il freddo morde, la fame graffia, e ogni rumore nell'oscurità potrebbe essere la tua fine. Questa è la realtà che dovrai affrontare ogni giorno.",
        trigger: {
            type: "condition",
            condition: "first_night_survived",
            requiresFlags: ["mission_accepted"]
        },
        choices: [
            {
                text: "Impara dai tuoi errori",
                outcome: "Ogni difficoltà è una lezione. Domani sarai più forte.",
                effects: [
                    { type: "add_resource", resource: "experience", value: 10 },
                    { type: "add_lore_flag", flag: "learned_survival" }
                ]
            },
            {
                text: "Rimpiangere il passato",
                outcome: "I ricordi del mondo perduto sono dolci e amari insieme.",
                effects: [
                    { type: "add_stat", stat: "percezione", value: 1 },
                    { type: "add_lore_flag", flag: "nostalgic" }
                ]
            }
        ],
        unique: true,
        priority: 9
    },
    
    {
        id: "lore_whispers_from_past",
        title: "Sussurri dal Passato",
        description: "In una casa abbandonata, nascosto sotto le assi del pavimento, trovi un piccolo carillon. È identico a quello che tua madre Lena ti regalò per il tuo decimo compleanno. Quando lo apri, la melodia familiare riempie l'aria, e per un momento il mondo torna com'era.",
        trigger: {
            type: "distance_from_safe_place",
            value: 150,
            operator: "<="
        },
        requiresFlags: ["learned_survival"],
        choices: [
            {
                text: "Conserva il carillon come ricordo",
                outcome: "Lo stringi al petto. Alcuni ricordi valgono più del cibo o dell'acqua.",
                effects: [
                    { type: "add_item", item: "carillon_of_lena", quantity: 1 },
                    { type: "add_stat", stat: "carisma", value: 2 },
                    { type: "add_lore_flag", flag: "has_mothers_memory" }
                ]
            }
        ],
        unique: true,
        priority: 8
    },
    
    {
        id: "lore_shadow_of_others",
        title: "L'Ombra degli Altri",
        description: "Un gruppo di sopravvissuti ti circonda. Si fanno chiamare 'I Corvi' e vogliono tutto quello che hai. Ma il loro capo ti guarda strano quando vede il carillon. 'Lena...', sussurra. 'Conoscevo una donna con quel nome. Cantava questa melodia ai suoi figli prima della Guerra.'",
        trigger: {
            type: "days_survived",
            value: 7,
            operator: ">="
        },
        requiresFlags: ["has_mothers_memory"],
        choices: [
            {
                text: "Chiedi del passato di tua madre",
                outcome: "Il capo dei Corvi abbassa le armi. 'Sei il figlio di Lena... Vai, ragazzo. Il tuo viaggio è più importante del nostro bottino.'",
                effects: [
                    { type: "add_lore_flag", flag: "corvi_alliance" },
                    { type: "add_resource", resource: "food", value: 3 },
                    { type: "add_resource", resource: "water", value: 3 }
                ]
            },
            {
                text: "Fuggi senza parlare",
                outcome: "Corri via nella notte. Alcuni misteri è meglio lasciarli sepolti.",
                effects: [
                    { type: "add_stat", stat: "agilita", value: 1 },
                    { type: "add_lore_flag", flag: "corvi_escaped" }
                ]
            }
        ],
        unique: true,
        priority: 7
    },
    
    {
        id: "lore_wanderer_dilemma",
        title: "Il Dilemma del Viandante",
        description: "Incontri una famiglia - padre, madre e una bambina che ti ricorda te stesso anni fa. Sono affamati, assetati, e la bambina è malata. Hanno sentito parlare del Safe Place ma non ce la faranno mai senza aiuto. Ma tu hai appena abbastanza risorse per te stesso.",
        trigger: {
            type: "distance_from_safe_place",
            value: 120,
            operator: "<="
        },
        choices: [
            {
                text: "Condividi le tue risorse",
                outcome: "La gratitudine nei loro occhi vale più di qualsiasi tesoro. La bambina sorride per la prima volta in giorni.",
                effects: [
                    { type: "add_resource", resource: "food", value: -3 },
                    { type: "add_resource", resource: "water", value: -3 },
                    { type: "add_stat", stat: "carisma", value: 3 },
                    { type: "add_lore_flag", flag: "helped_family" }
                ]
            },
            {
                text: "Prosegui da solo",
                outcome: "La sopravvivenza richiede scelte difficili. Ti allontani, cercando di non sentire il pianto della bambina.",
                effects: [
                    { type: "add_stat", stat: "adattamento", value: 2 },
                    { type: "add_lore_flag", flag: "chose_survival" }
                ]
            }
        ],
        unique: true,
        priority: 6
    },
    
    {
        id: "lore_echoes_of_inexpressed_war",
        title: "Echi della Guerra Inespressa",
        description: "In un bunker militare abbandonato, trovi documenti classificati. La Guerra Inespressa non fu una guerra normale - fu un esperimento andato male. 'Progetto Chimera: alterazione della realtà su scala continentale'. Tuo padre lavorava al progetto. Il Safe Place era il bunker di emergenza per gli scienziati.",
        trigger: {
            type: "days_survived",
            value: 15,
            operator: ">="
        },
        choices: [
            {
                text: "Studia i documenti",
                outcome: "La verità è terrificante ma necessaria. Ora capisci perché tuo padre doveva raggiungere il Safe Place.",
                effects: [
                    { type: "add_item", item: "classified_documents", quantity: 1 },
                    { type: "add_stat", stat: "percezione", value: 2 },
                    { type: "add_lore_flag", flag: "knows_truth" }
                ]
            }
        ],
        unique: true,
        priority: 5
    },
    
    {
        id: "lore_dream_of_green_valley",
        title: "Il Sogno della Valle Verde",
        description: "La febbre ti prende dopo giorni di pioggia. Nel delirio, sogni una valle verde protetta dalle montagne, dove il grano cresce alto e l'acqua scorre pulita. Vedi tuo padre che ti aspetta vicino a una quercia centenaria. 'Non mollare, Ultimo. Siamo così vicini.'",
        trigger: {
            type: "condition",
            condition: "player_sick",
            additionalCheck: "distance_from_safe_place <= 80"
        },
        choices: [
            {
                text: "Trova la forza di continuare",
                outcome: "Il sogno ti dà speranza. La febbre passa e ti alzi più determinato che mai.",
                effects: [
                    { type: "cure_status", status: "isSick" },
                    { type: "add_resource", resource: "hp", value: 20 },
                    { type: "add_lore_flag", flag: "prophetic_dream" }
                ]
            }
        ],
        unique: true,
        priority: 4
    },
    
    {
        id: "lore_radio_interception",
        title: "L'Intercettazione Radio",
        description: "Una vecchia radio militare crepita alla vita. '...a tutti i sopravvissuti del Progetto Chimera... il Safe Place è operativo... coordinate confermate... il Guardiano vi aspetta... ripeto, il protocollo Angelo è attivo...' La trasmissione si ripete. È registrata, ma quanto è vecchia?",
        trigger: {
            type: "distance_from_safe_place",
            value: 50,
            operator: "<="
        },
        requiresFlags: ["knows_truth"],
        choices: [
            {
                text: "Memorizza le coordinate",
                outcome: "Le coordinate confermano che sei sulla strada giusta. Il Safe Place è reale e vicino.",
                effects: [
                    { type: "reveal_map_area", radius: 10 },
                    { type: "add_lore_flag", flag: "has_coordinates" }
                ]
            }
        ],
        unique: true,
        priority: 3
    },
    
    {
        id: "lore_guardian_of_threshold",
        title: "Il Guardiano della Soglia",
        description: "Una figura in tuta antiradioattiva ti blocca il passaggio. 'Identificati', dice con voce metallica. 'Il protocollo richiede conferma genetica per l'accesso al Safe Place.' Quando scannerizza il tuo sangue, la sua postura cambia. 'Benvenuto, figlio di Marcus e Lena. Ti stavamo aspettando.'",
        trigger: {
            type: "distance_from_safe_place",
            value: 10,
            operator: "<="
        },
        requiresFlags: ["has_coordinates"],
        choices: [
            {
                text: "Chiedi di tuo padre",
                outcome: "Il Guardiano esita. 'Marcus è arrivato tre mesi fa. È... cambiato. Ma è vivo. Seguimi.'",
                effects: [
                    { type: "add_lore_flag", flag: "guardian_met" },
                    { type: "add_stat", stat: "all", value: 1 }
                ]
            }
        ],
        unique: true,
        priority: 2
    },
    
    {
        id: "lore_hidden_valley",
        title: "La Valle Nascosta",
        description: "Il Safe Place si apre davanti a te - una valle verdeggiante protetta da un campo di energia. Persone lavorano nei campi, bambini giocano, e l'aria è pulita. Al centro, vicino alla quercia del tuo sogno, vedi una figura familiare. Tuo padre si volta, e nonostante i cambiamenti, il suo sorriso è lo stesso. 'Ce l'hai fatta, Ultimo. Benvenuto a casa.'",
        trigger: {
            type: "location",
            location: "safe_place"
        },
        requiresFlags: ["guardian_met"],
        choices: [
            {
                text: "Corri da tuo padre",
                outcome: "L'abbraccio cancella mesi di sofferenza. Il viaggio è finito. Una nuova vita può iniziare nel Safe Place, l'ultimo rifugio dell'umanità.",
                effects: [
                    { type: "end_game", ending: "reunion" },
                    { type: "add_achievement", achievement: "ultimos_journey_complete" }
                ]
            }
        ],
        unique: true,
        priority: 1
    }
];

// Sistema di controllo trigger per eventi lore
function canTriggerLoreEvent(eventId, playerState) {
    const event = LORE_EVENTS_LINEAR.find(e => e.id === eventId);
    if (!event) return false;
    
    // Controlla se l'evento è già stato visto
    if (playerState.seenLoreEvents && playerState.seenLoreEvents.includes(eventId)) {
        return false;
    }
    
    // Controlla prerequisiti flag
    if (event.requiresFlags) {
        for (const flag of event.requiresFlags) {
            if (!playerState.loreFlags || !playerState.loreFlags.includes(flag)) {
                return false;
            }
        }
    }
    
    // Controlla trigger
    const trigger = event.trigger;
    switch (trigger.type) {
        case "days_survived":
            return evaluateCondition(playerState.daysSurvived, trigger.value, trigger.operator);
            
        case "distance_from_safe_place":
            const distance = calculateDistanceFromSafePlace(playerState.x, playerState.y);
            return evaluateCondition(distance, trigger.value, trigger.operator);
            
        case "condition":
            return evaluateSpecialCondition(trigger.condition, playerState, trigger.additionalCheck);
            
        case "location":
            return isAtLocation(playerState.x, playerState.y, trigger.location);
            
        default:
            return false;
    }
}

// Funzioni helper
function evaluateCondition(value, target, operator) {
    switch (operator) {
        case ">=": return value >= target;
        case ">": return value > target;
        case "<=": return value <= target;
        case "<": return value < target;
        case "==": return value == target;
        default: return false;
    }
}

function calculateDistanceFromSafePlace(x, y) {
    // Il Safe Place è nell'angolo est della mappa (190, 190)
    const safeX = 190;
    const safeY = 190;
    return Math.sqrt(Math.pow(x - safeX, 2) + Math.pow(y - safeY, 2));
}

function evaluateSpecialCondition(condition, playerState, additionalCheck) {
    switch (condition) {
        case "first_night_survived":
            return playerState.daysSurvived >= 1 && !isDay;
            
        case "player_sick":
            if (!playerState.isSick) return false;
            if (additionalCheck) {
                return eval(additionalCheck.replace("distance_from_safe_place", calculateDistanceFromSafePlace(playerState.x, playerState.y)));
            }
            return true;
            
        default:
            return false;
    }
}

function isAtLocation(x, y, location) {
    if (location === "safe_place") {
        return x >= 185 && x <= 195 && y >= 185 && y <= 195;
    }
    return false;
}

// Funzione per ottenere il prossimo evento lore disponibile
function getNextLoreEvent(playerState) {
    // Ordina per priorità (decrescente)
    const sortedEvents = [...LORE_EVENTS_LINEAR].sort((a, b) => b.priority - a.priority);
    
    for (const event of sortedEvents) {
        if (canTriggerLoreEvent(event.id, playerState)) {
            return event;
        }
    }
    
    return null;
}

// Esporta per uso in altri moduli
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        LORE_EVENTS_LINEAR,
        canTriggerLoreEvent,
        getNextLoreEvent
    };
} 
/**
 * Genera un numero intero casuale tra min e max (inclusi).
 * @param {number} min - Il valore minimo.
 * @param {number} max - Il valore massimo.
 * @returns {number} Un numero intero casuale nell'intervallo specificato.
 */
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// --- CONFIGURAZIONE E COSTANTI ---
// Questo file contiene dati statici, costanti e testi.
// Rimane invariato rispetto alla versione precedente,
// in quanto la pulizia ha riguardato principalmente la logica JavaScript.

// Simboli e descrizioni delle caselle della mappa
const TILE_SYMBOLS = {
    PLAINS:'.',
    MOUNTAIN:'M',
    RIVER:'~',
    FOREST:'F',
    VILLAGE:'V',
    CITY:'C',
    REST_STOP:'R',
    START:'S',
    END:'E',
    PLAYER:'@'
};

const MAP_WIDTH = 50;
const MAP_HEIGHT = 30;
const MAX_MESSAGES = 30; // Numero massimo di messaggi nel log
const STARTING_FOOD = 6;
const STARTING_WATER = 6;
const DAY_LENGTH_MOVES = 18; // Numero di passi per far passare il giorno
const NIGHT_FOOD_COST = 2;  // Costo cibo per riposo notturno
const NIGHT_WATER_COST = 2; // Costo acqua per riposo notturno
const HUNGER_PENALTY_HP = 1; // Danno HP per notte senza cibo
const THIRST_PENALTY_HP = 1; // Danno HP per notte senza acqua

// Costi risorse per movimento (valori piccoli, frazionari)
const MOVE_FOOD_COST = 0.1; // Consumo di sazietà per ogni passo
const MOVE_WATER_COST = 0.15; // Consumo di idratazione per ogni passo

// Tipi di caselle considerati rifugi sicuri per la notte
const SHELTER_TILES = [TILE_SYMBOLS.VILLAGE, TILE_SYMBOLS.CITY, TILE_SYMBOLS.REST_STOP];

// Costo in passi (tempo) per effettuare una ricerca in un evento
const SEARCH_TIME_COST = 3;

// Stati del giocatore
const STATO = {
    NORMALE: 'normale',    // Stato normale
    AFFAMATO: 'affamato',  // Fame (sazietà a 0)
    ASSETATO: 'assetato',  // Sete (idratazione a 0)
    FERITO: 'ferito',      // Ferito
    MORENTE: 'morente',    // HP sotto una certa soglia
    INFETTO: 'infetto'     // Malato/infetto
};

// Messaggi di diario per i vari stati
const STATO_MESSAGGI = {
    // Stato affamato (sazietà a 0)
    AFFAMATO: [
        "Lo stomaco reclama cibo con crampi dolorosi. È passato troppo tempo dall'ultimo pasto.",
        "La debolezza ti assale. Ogni passo è uno sforzo immane a causa della fame.",
        "Devi trovare cibo. Subito. O le forze ti abbandoneranno del tutto.", // Corretto 'indebolirli' in 'abbandoneranno' (o 'indebolirti')
        "La testa ti gira per la mancanza di cibo. La lucidità svanisce."
    ],
    // Stato assetato (idratazione a 0)
    ASSETATO: [
        "La gola brucia come se avessi ingoiato sabbia. L'acqua è un bisogno primario, ora.",
        "Confusione e mal di testa martellante: i primi segni della disidratazione.",
        "Le labbra sono spaccate e sanguinano. La sete è una tortura costante.",
        "Respirare diventa faticoso. Senza acqua, la fine è più vicina."
    ],
    // Stato ferito
    FERITO: [
        "Ogni movimento riapre la ferita, inviando fitte di dolore.",
        "Il sangue caldo impregna la fasciatura di fortuna. Non sta migliorando.",
        "La ferita pulsa, infiammata. Il rischio di infezione è altissimo senza cure adeguate.",
        "Un dolore lancinante ti ricorda costantemente della tua vulnerabilità. Devi medicarti."
    ],
    // Stato morente (HP bassi)
    MORENTE: [
        "Le energie vitali ti stanno lasciando. Senza un intervento immediato, non vedrai l'alba.",
        "Arranchi a fatica, ogni passo un'agonia. La fine sembra inevitabile.",
        "La vista si annebbia, i suoni si ovattano. Stai scivolando via.",
        "Ti reggi in piedi per miracolo. Sei a un passo dalla morte."
    ],
    // Stato infetto/malato
    INFETTO: [
        "Brividi incontrollabili scuotono il tuo corpo febbricitante. Qualcosa ti sta divorando dall'interno.",
        "Un sudore gelido ti imperla la fronte mentre la malattia si diffonde.",
        "Ondate di nausea ti costringono a fermarti. Hai ingerito o respirato qualcosa di tossico.",
        "Colpi di tosse squassanti ti strappano sangue dai polmoni. La malattia avanza."
    ],
    // Penalità notturna all'aperto
    NOTTE_APERTO: [
        "Passare la notte all'addiaccio è brutale. Freddo, umidità e pericoli invisibili ti circondano.",
        "L'oscurità è un velo che nasconde minacce striscianti. Ogni rumore è un potenziale pericolo.",
        "Il gelo penetra fino alle ossa. Dormire qui è stato un grave errore.",
        "Il tuo corpo debilitato soffre terribilmente per l'esposizione agli elementi durante la notte."
    ]
};

// Probabilità eventi per tipo di casella (0 = mai, 1 = sempre)
const EVENT_CHANCE = {
    PLAINS: 0.05, // Bassa probabilità in pianura
    FOREST: 1.0, // Alta probabilità per test
    RIVER: 0.1,
    VILLAGE: 1.0, // Alta probabilità per test
    CITY: 0.5,
    REST_STOP: 1.0 // Alta probabilità di trovare qualcosa/qualcuno
    // MOUNTAIN non ha eventi (impassabile)
};

// Dati degli eventi per tipo di casella
const EVENT_DATA = {
    PLAINS: [
        {
            id: "plains_bones",
            title: "Ossa nella Polvere",
            description: "Ossa sbiancate dal sole, forse umane, affiorano dal terreno screpolato. Un macabro segnale della fragilità della vita qui.",
            choices: [] // Nessuna scelta, solo testo d'atmosfera
        },
        {
            id: "plains_carcass",
            title: "Banchetto Funebre",
            description: "Una carcassa gonfia di animale non identificabile giace sotto il sole implacabile, divorata da sciami di insetti ronzanti. L'odore è nauseante.",
            choices: [] // Nessuna scelta, solo testo d'atmosfera
        },
        {
             id: "plains_wind",
             title: "Vento della Desolazione",
             description: "Il vento spazza la pianura arida, sollevando polvere e sussurrando storie di vuoto. Non c'è nient'altro.",
             choices: [] // Nessuna scelta, solo testo d'atmosfera
        },
        {
            id: "generic_minor_find_resource",
            title: "Resti Dimenticati",
            description: "Frugando tra i detriti spazzati dal vento, il tuo occhio cade su qualcosa che potrebbe essere utile.",
            choices: [
                {
                    text: "Ispeziona attentamente", // REV: Più specifico
                    outcome: "Ti chini e osservi meglio...", // REV: Outcome leggermente più attivo
                    successReward: { type: 'random_common_resource', quantity: 1 }
                }
            ]
        },
        {
            id: "generic_lore_find",
            title: "Frammento dal Passato",
            description: "Qualcosa di insolito tra le rovine attira il tuo sguardo, un dettaglio fuori posto nel caos.",
            choices: [
                {
                    text: "Esamina l'oggetto", // REV: Più specifico
                    outcome: "Avvicinandoti, un frammento di storia dimenticata riemerge...", // REV: Outcome più evocativo
                    successReward: { type: 'random_lore_fragment' }
                }
            ]
        }
    ],
    FOREST: [
        {
            id: "forest_noises",
            title: "Fruscio nel Sottobosco",
            description: "Il silenzio innaturale della foresta è rotto da un fruscio sospetto tra i cespugli. Animale... o qualcos'altro? Indagare potrebbe essere rischioso.",
            choices: [
                {
                    text: "Indaga furtivamente (Tracce)", // REV: Più chiaro sull'azione
                    skillCheck: { stat: 'tracce', difficulty: 12 },
                    successText: "Ti muovi come un'ombra tra gli alberi. È solo un grosso ratto mutato, ma vicino alla sua tana trovi delle bacche.", // REV: Più descrittivo
                    successReward: { itemId: 'berries', quantity: getRandomInt(1, 3) },
                    failureText: "Pesti un ramo secco, tradendo la tua presenza! Qualunque cosa fosse, è fuggita nel fitto del bosco.", // REV: Più descrittivo
                    isSearchAction: true // Aggiunto flag mancante?
                },
                {
                    text: "Ignora il rumore", // REV: OK
                    outcome: "La prudenza vince sulla curiosità. Prosegui, lasciandoti il mistero alle spalle." // REV: Outcome più evocativo
                }
            ]
        },
        {
            id: "forest_fallen_tree",
            title: "Tronco Annerito",
            description: "Un albero enorme, sradicato e con la corteccia stranamente annerita, blocca il sentiero. Scavalcarlo sembra difficile, aggirarlo richiede tempo.",
            choices: [
                 {
                     text: "Tenta di scavalcare (Agilità)", // REV: Più chiaro sull'azione
                     skillCheck: { stat: 'agilita', difficulty: 11 },
                     successText: "Con un balzo agile e un po' di fortuna, superi l'ostacolo senza intoppi. Noti anche un pezzo di metallo utile incastrato.", // REV: Lega meglio la ricompensa
                     successReward: { itemId: 'scrap_metal', quantity: 1 },
                     failureText: "Scivoli sulla corteccia umida e annerita, cadendo goffamente. Perdi tempo prezioso e ti fai male.", // REV: Più specifico
                     // Aggiungere penalità danno qui? (Logica esterna)
                     isSearchAction: true // Ha senso come Search Action?
                 },
                 {
                     text: "Aggira l'ostacolo", // REV: OK
                     outcome: "Decidi di non rischiare. Ti addentri nel bosco fitto, perdendo tempo ma evitando il pericolo immediato." // REV: OK
                 }
            ]
        },
        {
            id: "forest_hostile_flora",
            title: "Rovi Aggressivi",
            description: "Rampicanti spinosi dall'aspetto malato e aggressivo ostruiscono il passaggio. Sembrano quasi contrarsi al tuo avvicinarsi. Nascondono qualcosa o sono solo un altro pericolo?",
            choices: [
                {
                    text: "Esamina i rovi (Adattamento)", // REV: OK
                    skillCheck: { stat: 'adattamento', difficulty: 11 },
                    successText: "Osservando attentamente, noti che le spine secernono una linfa densa. Potrebbe essere usata per creare medicine grezze.", // REV: Più descrittivo
                    successReward: { itemId: 'medicine_crude', quantity: 1 },
                    failureText: "Queste piante sembrano ostili e forse velenose. Meglio non rischiare di toccarle.", // REV: Più specifico
                    isSearchAction: true // Aggiunto flag mancante?
                },
                {
                    text: "Forza il passaggio (Potenza)",
                    skillCheck: { stat: 'potenza', difficulty: 13 },
                    successText: "Con forza bruta, strappi i rampicanti spinosi e ti apri un varco, rimediando solo qualche graffio.", // REV: Più descrittivo
                    // Nessuna ricompensa specifica
                    failureText: "Le spine tenaci ti lacerano braccia e vestiti mentre cerchi di passare. Subisci una ferita.", // REV: Più specifico
                    // Aggiungere penalità danno qui? (Logica esterna)
                },
                {
                    text: "Cerca un'altra via",
                    outcome: "La prudenza suggerisce di non affrontare le piante. Perdi tempo cercando un percorso alternativo nel sottobosco." // REV: Più descrittivo
                }
            ]
        },
        {
            id: "generic_minor_find_resource",
            title: "Nascosto tra le Foglie",
            description: "Sotto un cumulo di foglie marce e umide, la forma di un oggetto attira la tua attenzione.",
            choices: [
                {
                    text: "Fruga tra le foglie", // REV: OK
                    outcome: "Scostando le foglie umide e maleodoranti trovi...", // REV: Outcome più sensoriale
                    successReward: { type: 'random_common_resource', quantity: 1 }
                }
            ]
        },
        {
            id: "generic_lore_find",
            title: "Simbolo sulla Corteccia",
            description: "Uno strano simbolo, inciso rozzamente sulla corteccia di un albero malato, cattura il tuo sguardo.",
             choices: [
                {
                    text: "Esamina il simbolo", // REV: Modificato per coerenza
                    outcome: "Questo simbolo sembra antico, forse un avvertimento o un segno rituale...", // REV: Outcome più evocativo
                    successReward: { type: 'random_lore_fragment' }
                }
            ]
        }
    ],
    RIVER: [
         {
            id: "river_flow",
            title: "Corrente Lenta e Torbida",
            description: "L'acqua del fiume scorre pigra e innaturalmente torbida, trascinando detriti irriconoscibili. La puzza leggera suggerisce contaminazione. Raccoglierla è un rischio.",
            choices: [
                {
                    text: "Riempi la borraccia (Rischioso)", // REV: OK
                    outcome: "Raccogli l'acqua sospetta. Ricorda: berla senza purificarla potrebbe essere fatale.", // REV: Outcome più incisivo
                    successReward: { itemId: 'water_dirty', quantity: 1 }
                },
                {
                    text: "Osserva la riva", // REV: Alternativa più attiva
                    outcome: "Scruti la riva e il flusso dell'acqua. Nessun pericolo immediato, ma nemmeno nulla di utile in vista.", // REV: Outcome leggermente modificato
                }
            ]
        },
        {
            id: "generic_minor_find_resource",
            title: "Relitto sulla Riva",
            description: "La corrente ha depositato qualcosa sulla riva fangosa, impigliato tra radici e rifiuti.",
             choices: [
                {
                    text: "Esamina il relitto",
                    outcome: "Frugando tra i detriti umidi e maleodoranti portati dal fiume trovi...", // REV: Outcome più sensoriale
                    successReward: { type: 'random_common_resource', quantity: 1 }
                }
            ]
        },
        {
            id: "generic_lore_find",
            title: "Messaggio nella Bottiglia",
            description: "Una vecchia bottiglia, incastrata nel fango della riva, sembra contenere un messaggio arrotolato.",
             choices: [
                {
                    text: "Recupera la bottiglia", // REV: Più specifico sull'azione
                    outcome: "Recuperi la bottiglia e apri il messaggio. L'inchiostro è quasi cancellato dall'acqua, ma riesci a leggere...", // REV: Outcome più dettagliato
                    successReward: { type: 'random_lore_fragment' }
                }
            ]
        }
    ],
    VILLAGE: [
        {
            id: "village_ruins",
            title: "Villaggio Fantasma",
            description: "Le rovine silenziose di un piccolo insediamento. Tende strappate e baracche vuote gemono al vento. Cosa è successo qui? Forse è rimasto qualcosa tra le macerie.",
            choices: [
                {
                    text: "Cerca tra le macerie (Tracce)", // REV: OK
                    skillCheck: { stat: 'tracce', difficulty: 11 },
                    successText: "Dopo un'attenta ricerca tra i detriti polverosi, trovi del cibo in scatola ancora intatto!", // REV: OK
                    successReward: { itemId: 'canned_food', quantity: 1 },
                    failureText: "Trovi solo polvere, vetri rotti e i fantasmi silenziosi di vite spezzate. Nulla di utile.", // REV: Più evocativo
                    isSearchAction: true
                },
                {
                    text: "Riposati all'ombra", // REV: OK
                    outcome: "Ti siedi al riparo di un muro diroccato, recuperando un po' il fiato, ma il silenzio del luogo è opprimente." // REV: Outcome più atmosferico
                }
            ]
        },
        {
            id: "village_heavy_silence",
            title: "Silenzio Innaturale",
            description: "Un silenzio opprimente grava su questo luogo. Non si sente il vento, né il verso di animali. Un brutto presentimento ti attanaglia.",
            choices: [
                {
                    text: "Ascolta l'istinto (Presagio)", // REV: Più evocativo
                    skillCheck: { stat: 'presagio', difficulty: 12 },
                    successText: "Il tuo sesto senso ti guida verso una tenda collassata. All'interno, trovi delle bende dimenticate nella fuga.", // REV: Più descrittivo
                    successReward: { itemId: 'bandages_dirty', quantity: getRandomInt(1,2) },
                    failureText: "Ascolti attentamente, ma percepisci solo il silenzio e un crescente senso di disagio. Meglio andarsene.", // REV: Più specifico
                    isSearchAction: true
                },
                {
                    text: "Allontanati in fretta", // REV: OK
                    outcome: "Fidi del tuo istinto e ti allontani rapidamente da questo luogo silenzioso e inquietante." // REV: OK
                }
            ]
        },
        {
            id: "generic_minor_find_resource",
            title: "Accampamento Abbandonato",
            description: "I resti di un accampamento frettolosamente abbandonato. Qualcuno ha lasciato qualcosa indietro nella fuga.",
            choices: [
                {
                    text: "Fruga tra i resti",
                    outcome: "Esaminando ciò che è stato lasciato indietro trovi...", // REV: Outcome leggermente variato
                    successReward: { type: 'random_common_resource', quantity: 1 }
                }
            ]
        },
        {
            id: "generic_lore_find",
            title: "Scritta sul Muro",
            description: "Una scritta sbiadita, tracciata forse col sangue o con del carbone, su un muro diroccato attira la tua attenzione.",
             choices: [
                {
                    text: "Decifra la scritta", // REV: OK
                    outcome: "Avvicinandoti, riesci a distinguere le parole...", // REV: Outcome leggermente variato
                    successReward: { type: 'random_lore_fragment' }
                }
            ]
        }
    ],
    CITY: [
         {
            id: "city_shadows",
            title: "Ombre tra i Grattacieli",
            description: "Scheletri di grattacieli graffiano il cielo plumbeo. Il vento fischia tra le finestre rotte come un lamento. Pericolo e tesori dimenticati si nascondono in ogni angolo.",
            choices: [
                 {
                     text: "Esplora un palazzo (Presagio)", // REV: Più specifico
                     skillCheck: { stat: 'presagio', difficulty: 13 },
                     successText: "Il tuo istinto ti guida verso un edificio che sembra meno pericolante degli altri. All'interno, tra le macerie, trovi...", // REV: Più descrittivo
                     successReward: { itemId: 'scrap_metal', quantity: getRandomInt(1, 2) },
                     failureText: "Un brivido freddo ti percorre la schiena mentre ti avvicini all'ingresso. Qualcosa di brutto è successo qui. Meglio non entrare.", // REV: Più evocativo
                     isSearchAction: true
                 },
                 {
                     text: "Attraversa la strada", // REV: OK
                     outcome: "Corri attraverso lo spazio aperto, sentendo gli occhi invisibili delle finestre vuote su di te. Raggiungi l'altro lato senza incidenti, per ora." // REV: Outcome più teso
                 }
            ]
        },
        {
            id: "generic_minor_find_resource",
            title: "Negozio Saccheggiato",
            description: "Le vetrine in frantumi rivelano l'interno devastato di un negozio. Scaffali rovesciati, merce sparsa. Forse i saccheggiatori hanno tralasciato qualcosa.",
             choices: [
                {
                    text: "Cerca tra gli scaffali",
                    outcome: "Frugando tra la merce distrutta e i detriti trovi...", // REV: Outcome più descrittivo
                    successReward: { type: 'random_common_resource', quantity: 1 }
                }
            ]
        },
        {
            id: "generic_lore_find",
            title: "Terminale Danneggiato",
            description: "Un terminale rotto su un bancone mostra ancora frammenti intermittenti di testo sullo schermo crepato.",
             choices: [
                {
                    text: "Tenta di leggere", // REV: Più diretto
                    outcome: "Lo schermo sfarfalla, ma riesci a decifrare un frammento di log prima che si spenga...", // REV: Outcome più dinamico
                    successReward: { type: 'random_lore_fragment' }
                }
            ]
        },
        {
            id: "city_easter_egg_pixeldebh",
            title: "Strano Ritrovamento Metallico",
            description: "Rovistando tra detriti metallici e cemento sbriciolato, noti uno strano oggetto lucido. Una placca argentata con un simbolo insolito e la scritta parzialmente leggibile 'PixelDebh'.",
            choices: [], // Nessuna scelta, solo scoperta
            isUnique: true
        },
        {
            id: "city_unique_webradio",
            title: "Studio Radio Silenzioso",
            description: "Una stanza devastata: pareti annerite, macerie, monitor infranti su un tavolo circolare. Un'insegna sbrecciata sul muro recita 'R...me...adi'. Qui un tempo pulsava una WebRadio, voce libera ora ridotta al silenzio.",
            choices: [], // Nessuna scelta, solo scoperta
            isUnique: true
        }
    ],
     REST_STOP: [
         {
            id: "rest_stop_gas_station",
            title: "Stazione di Servizio Fantasma",
            description: "La carcassa arrugginita di una stazione di servizio. Pompe divelte, vetri rotti, l'interno buio e pieno di detriti. Potrebbe offrire riparo temporaneo o nascondere brutte sorprese.",
            choices: [
                 {
                     text: "Ispeziona l'interno (Tracce)",
                     skillCheck: { stat: 'tracce', difficulty: 10 },
                     successText: "Frugando con attenzione tra gli scaffali rovesciati e la sporcizia, la tua mano si chiude su qualcosa di utile...", // REV: Più evocativo
                     successReward: { itemId: 'bandages_dirty', quantity: 1 },
                     failureText: "L'interno è stato chiaramente saccheggiato a fondo. Non trovi nulla che valga la pena raccogliere, solo spazzatura e polvere.", // REV: Più specifico
                     isSearchAction: true
                 },
                 {
                     text: "Ignora la stazione",
                     outcome: "Decidi che non vale il rischio. Meglio proseguire lungo la strada desolata." // REV: OK
                 }
            ]
        },
        {
            id: "generic_minor_find_resource",
            title: "Giaciglio Abbandonato",
            description: "Qualcuno ha dormito qui, non molto tempo fa. Un giaciglio improvvisato con stracci sporchi. Forse ha dimenticato qualcosa nella fretta.",
            choices: [
                {
                    text: "Controlla il giaciglio",
                    outcome: "Esaminando il misero giaciglio trovi...", // REV: Outcome leggermente variato
                    successReward: { type: 'random_common_resource', quantity: 1 }
                }
            ]
        },
        {
            id: "generic_lore_find",
            title: "Scritta Inquietante",
            description: "Una scritta tracciata con qualcosa di scuro sul muro sporco attira il tuo sguardo nel buio del rifugio.",
             choices: [
                {
                    text: "Leggi il messaggio", // REV: OK
                    outcome: "Avvicinandoti alla parete umida, riesci a leggere...", // REV: Outcome più descrittivo
                    successReward: { type: 'random_lore_fragment' }
                }
            ]
        }
    ]
};

// --- DEFINIZIONE OGGETTI GLOBALI ---
// Database degli oggetti presenti nel gioco

// Ripristino di TILE_DESC che è stato rimosso
const TILE_DESC = {
    '.':'Pianura spazzata dal vento',    // Evoca movimento e desolazione
    'M':'Montagne ostili',             // Sottolinea il pericolo/difficoltà
    '~':'Fiume torbido',               // Suggerisce contaminazione/lentezza
    'F':'Foresta mutata',              // Lega alla lore/pericolo
    'V':'Resti di villaggio',          // Più specifico di 'Accampamento'
    'C':'Città in rovina',             // Alternativa leggermente più comune
    'R':'Rifugio precario',            // Sottolinea l'insicurezza
    'S':"Punto d'inizio",              // Va bene così
    'E':'Destinazione sconosciuta',    // Leggermente più misterioso di 'incerta'
    '@':'Tu'                           // Semplificato
};

const ITEM_DATA = {
    // Risorse Utilizzabili
    'water_purified_small': {
        id: 'water_purified_small',
        name: "Acqua Purificata (P)",
        description: "Una piccola borraccia d'acqua, sigillata. Ogni sorso è prezioso in queste terre.", // Leggermente più evocativo
        usable: true,
        type: 'consumable',
        effect: { type: 'add_resource', resource_type: 'water', amount: 3 }
    },
    'canned_food': {
        id: 'canned_food',
        name: "Cibo in Scatola",
        description: "Una scatoletta ammaccata, ma l'integrità del sigillo fa ben sperare. Meglio di niente.", // Più realistico e in linea col tono
        usable: true,
        type: 'food',
        effect: { type: 'add_resource', resource_type: 'food', amount: 4 }
    },
    // Oggetti Curativi
    'bandages_dirty': {
        id: 'bandages_dirty',
        name: "Bende Sporche",
        description: "Strisce di tessuto recuperate chissà dove. Non ispirano fiducia, ma possono tamponare una ferita.", // Più descrittivo del rischio implicito
        type: 'healing',
        effect: { type: 'heal_status', status_cured: 'isInjured', chance: 0.4, success_message: "Le bende sembrano aver fermato il peggio.", failure_message: "Le bende sono troppo sporche, non hanno aiutato." },
        usable: true,
        stackable: true
    },
    'bandages_clean': {
        id: 'bandages_clean',
        name: "Bende Pulite",
        description: "Garze sterilizzate, ancora nella loro confezione originale. Una rarità, utile per curare ferite aperte.", // Sottolinea la rarità
        type: 'healing',
        effect: { type: 'heal_status', status_cured: 'isInjured', chance: 0.75, success_message: "Le bende pulite sono efficaci, la ferita migliora.", failure_message: "Nonostante le bende, la ferita è ancora brutta.", heal_hp_on_success: 2 },
        usable: true,
        stackable: true
    },
    'medicine_crude': {
        id: 'medicine_crude',
        name: "Medicina Grezza",
        description: "Pasticche di colore indefinito in un blister rovinato. Una scommessa contro la malattia.", // Più evocativo dell'incertezza
        type: 'healing',
        effect: { type: 'heal_status', status_cured: 'isSick', chance: 0.6, success_message: "La febbre sembra scendere.", failure_message: "Non ti senti affatto meglio." },
        usable: true,
        stackable: true
    },
    'vitamins': {
        id: 'vitamins',
        name: "Vitamine",
        description: "Flacone quasi intatto di integratori. Forse possono dare un po' di vigore o aiutare a recuperare energie.", // Leggermente più descrittivo
        type: 'consumable',
        usable: true,
        stackable: true,
        effect: { type: 'heal_hp', amount_min: 2, amount_max: 3 }
    },
    // Materiali / Lore
    'scrap_metal': {
        id: 'scrap_metal',
        name: "Rottame Metallico",
        description: "Un pezzo di metallo contorto e arrugginito. Inutile così com'è, ma potrebbe servire per riparazioni o modifiche.", // Più specifico sul possibile uso
        usable: false,
        type: 'materiale',
        effect: null,
        stackable: true
    },
    'lore_fragment_item': {
        id: 'lore_fragment_item',
        name: "Nota Strappata",
        description: "Un frammento di carta ingiallita. Le scritte sono quasi illeggibili, un eco confuso dal passato.", // Più atmosferico
        usable: false,
        type: 'lore',
        effect: { type: 'show_lore', text_array_ref: 'loreFragments' },
        stackable: false
    },
    'small_knife': {
        id: 'small_knife',
        name: "Piccolo Coltello",
        description: "Un coltellino multiuso, logoro ma ancora affilato. Utile per molti lavori di precisione, o come difesa estrema.", // Più dettagliato
        usable: false,
        type: 'tool'
    },
    'berries': {
        id: 'berries',
        name: "Bacche",
        description: "Un pugno di bacche selvatiche di un colore incerto. Comestibili o velenose? Un rischio da valutare.", // Sottolinea il rischio
        usable: true,
        type: 'food',
        value: 1 // NOTA: 'value' qui sembra fuori posto rispetto agli altri oggetti che usano 'effect'. Uniformiamo? Per ora lascio.
    },
    'water_dirty': {
        id: 'water_dirty',
        name: "Acqua Sporca",
        description: "Acqua torbida raccolta da una pozza o un contenitore abbandonato. Berla senza purificarla è un invito alla malattia.", // Più diretto sul rischio
        usable: false,
        type: 'resource_raw',
        effect: null
    }
    // Aggiungere altri oggetti qui...
};

// --- Testi Variabili (Flavor, Lore, Eventi) ---
// Questi array contengono la maggior parte dei testi descrittivi e narrativi del gioco.
// Mantenerli separati dalla logica rende più facile la modifica e l'espansione.

// Flavor text per diversi tipi di tile (Giorno) - Revisione Completa
const flavorTextsPlains = [
    "Raffiche di vento sollevano polvere rossa che acceca e irrita i polmoni.", // REV: Più sensoriale
    "Il silenzio qui è assoluto, innaturale. Pesa come una lapide sulla pianura.", // REV: Immagine diversa
    "Ossa sbiancate dal sole, forse umane, punteggiano il terreno arido come macabri segnali.", // REV: Più conciso
    "Una carcassa gonfia di animale non identificabile giace in lontananza, banchetto per sciami di insetti.", // REV: Più viscerale
    "Un cielo color cenere si stende sopra di te, vasto e vuoto. Nessun uccello osa volare.", // REV: Linguaggio leggermente diverso
    "Arbusti scheletrici e contorti artigliano la terra secca, un'ultima, vana resistenza.", // REV: Più attivo
    "I resti contorti di una linea elettrica serpeggiano tra l'erba morta, inutili monumenti metallici.", // REV: Leggermente più descrittivo
    "Il terreno duro e crepato sotto i tuoi stivali sembra assetato quanto te.", // REV: Collegamento diretto al giocatore
    "Nessuna traccia di acqua o vita recente. Solo il vuoto che ti osserva.", // REV: Più inquietante
    "Ti senti terribilmente esposto e solo, un puntino insignificante in questo nulla sconfinato.", // REV: Più diretto
    "Un sole pallido filtra a stento attraverso la cappa di polvere perenne, offrendo un calore illusorio.", // REV: Rafforza l'immagine
    "La carcassa arrugginita di un veicolo agricolo affonda nel terreno, quasi inghiottita dalla desolazione.", // REV: Rafforza l'immagine
    "Una colonna di fumo si leva all'orizzonte. Segnale di vita o presagio di pericolo?", // REV: Più interrogativo
    "Nuvole basse e dense corrono veloci, minacciando una pioggia acida che non cade mai.", // REV: Leggermente più minaccioso
    "Schegge di vetro scintillano nella polvere, frammenti di finestre esplose chissà quando.", // OK
    "Lo scheletro arrugginito di una vecchia automobile giace riverso, le portiere spalancate come fauci.", // REV: Immagine più forte
    "Uno stormo di uccelli neri come la pece si alza in volo all'improvviso, un grido rauco che lacera il silenzio.", // REV: Più sonoro e impattante
    "Il sole implacabile trasforma l'orizzonte in un miraggio tremolante di calore e disperazione.", // REV: Collega all'emozione
    "Una folata di vento porta un odore metallico e dolciastro... sangue vecchio o ruggine?", // REV: Aggiunge ambiguità
    "Il terreno vibra leggermente sotto i piedi. Qualcosa di molto grosso si muove, non troppo lontano.", // REV: Aumenta la tensione
    "Una singola antenna radio, piegata come un dito accusatore, si erge silenziosa contro il cielo pallido.", // REV: Immagine più forte
    "Carcasse sbiancate di bestiame mutato punteggiano il paesaggio, moniti silenziosi.", // REV: Più specifico (bestiame mutato)
    "Il silenzio è così opprimente che il battito del tuo cuore rimbomba nelle orecchie.", // REV: Sensazione fisica
    "Piccoli vortici di sabbia danzano come spettri efimeri sul terreno crepato.", // REV: Immagine più definita
    "Il sole malato si riflette su una distesa di vetro fuso, cicatrice lucida di un antico incendio.", // REV: Lega al passato catastrofico
    "Schegge di plastica dai colori vivaci spuntano dalla polvere, ironici fiori di un'era morta.", // REV: Più evocativo del contrasto (OK come prima)
    "Il suolo sotto i tuoi piedi è stranamente caldo, come se un fuoco antico covasse ancora sotto la cenere.", // REV: Più suggestivo
    "Una serie di crateri poco profondi deturpa la pianura, ricordo di bombardamenti o impatti?", // REV: Aggiunge mistero
    "Un cartellone pubblicitario sbiadito mostra un sorriso congelato, promessa di un paradiso perduto per sempre.", // REV: Contrasto più forte
    "Resti contorti di un sistema di irrigazione arrugginito segnano il fantasma di campi un tempo fertili.", // REV: Immagine più poetica
    "Una singola scarpa da bambino, stranamente intatta, giace nella polvere. Un piccolo mistero doloroso." // REV: Leggermente più emotivo
];
const flavorTextsForest = [
    "Alberi contorti e malati si ergono come spettri, rami scheletrici che artigliano l'aria.", // REV: Più attivo e descrittivo
    "Una luce verdastra filtra a stento dal fogliame innaturale, intrappolandoti in un crepuscolo perenne.", // REV: Aggiunge colore e specificità
    "Funghi bioluminescenti e pulsanti crescono sui tronchi marci, emettendo una luce fredda e spettrale.", // REV: Più specifico e inquietante
    "Una nebbiolina grigiastra e oleosa ristagna tra gli alberi, limitando la visibilità e irritando la gola.", // REV: Aggiunge sensazione tattile/olfattiva
    "Movimenti furtivi nel sottobosco ti fanno trasalire, ma il silenzio torna subito, denso e ostile.", // REV: Contrasto silenzio/movimento
    "Il terreno è un tappeto di foglie marce. L'odore dolciastro di decomposizione è quasi soffocante.", // REV: Più intenso
    "Trappole arrugginite per animali, alcune ancora armate, sono nascoste sotto le foglie.", // REV: Più diretto sul pericolo
    "Simboli inquietanti, incisi di recente sulla corteccia degli alberi, sembrano osservarti.", // REV: Personificazione
    "Cervi dagli occhi vitrei e dal pelo chiazzato ti osservano immobili, prima di dissolversi come fumo tra gli alberi.", // REV: Più perturbante
    "Linfa rossastra e densa cola da alcuni tronchi, come sangue rappreso.", // REV: Immagine più forte
    "Il vento tra le fronde malate sussurra parole indistinte, o forse è solo la tua immaginazione.", // REV: Aggiunge dubbio/paranoia
    "Resti di un accampamento: un cerchio di cenere fredda, ossa animali spezzate e un silenzio pesante.", // REV: Più conciso e evocativo
    "Brandelli di teli di plastica impigliati tra i rami sbattono al vento, fantasmi di rifugi effimeri.", // REV: Immagine più poetica
    "La corteccia di un vecchio albero si contorce in una smorfia che ricorda un volto umano sofferente.", // REV: Più specifico e inquietante
    "Un cartello metallico arrugginito è quasi illeggibile: 'PER... ZONA ... NON PRO...'. Meglio non sapere.", // REV: Aumenta il mistero
    "Ragnatele innaturalmente spesse, simili a corde, bloccano il passaggio tra gli alberi più nodosi.", // REV: Più descrittivo della consistenza
    "Un vecchio albero è ammantato da uno sciame di farfalle nere immobili. Un sudario vivente.", // REV: Più evocativo
    "Il terreno sotto i tuoi piedi è stranamente elastico, come se camminassi sul fianco di una bestia addormentata.", // REV: Immagine più forte
    "Una polvere grigiastra e scintillante cade dai rami, depositandosi sui tuoi vestiti. Non sembra neve...", // REV: Sostituito neve con polvere/cenere, più ambiguo
    "Un cerchio perfetto di funghi color sangue circonda un piccolo altare di pietre annerite.", // REV: Leggermente più minaccioso
    "Un ruscello serpeggia tra le radici, l'acqua ha un colore innaturale e rilascia vapori irritanti.", // REV: Più sensoriale
    "Manichini mutilati, forse provenienti da un vecchio magazzino, pendono dai rami come macabri impiccati.", // REV: Rafforza l'immagine
    "Una pila ordinata di piccoli teschi animali giace in una radura silenziosa. Un rituale recente?" // REV: Aggiunge interrogativo
];
const flavorTextsMountain = [
    "Un\'eco distorta rimbalza tra le vette aguzze, suono inquietante che gela il sangue.", // REV: Più incisivo, corretto escape
    "Il sentiero è una sfida: ripido, franoso, disseminato di rocce taglienti come vetro.", // REV: Più descrittivo
    "Un rapace solitario volteggia nel cielo plumbeo, un osservatore silenzioso e indifferente.", // REV: Alternativa a aquila, corretto escape
    "Piccole pietre rotolano dall\'alto. Una frana naturale o qualcuno ti osserva?", // REV: Più diretto
    "La carcassa congelata di uno scalatore, un monito silenzioso contro la superbia in queste terre ostili.", // REV: Più evocativo, corretto escape
    "Il vento ulula tra le creste rocciose, un lamento spettrale che sembra portare voci dimenticate.", // REV: Rafforza l\'immagine
    "Strutture metalliche contorte emergono dalla roccia come ossa spezzate, cicatrici di guerre passate.", // REV: Immagine più forte
    "Dalla cima, la vista è immensa e desolata. Chilometri di nulla fino all\'orizzonte.", // REV: Più diretto
    "L\'aria rarefatta brucia i polmoni. Ogni respiro è una conquista faticosa.", // REV: Sensazione fisica, corretto escape
    "L\'imboccatura oscura di una caverna si apre nella roccia. Riparo o tomba?", // REV: Più conciso e interrogativo
    "Chiazzze di neve sporca e antica resistono nelle zone d\'ombra perenne.", // REV: Più descrittivo, corretto escape
    "Un passaggio angusto tra pareti rocciose incombe, minacciando di schiacciarti come un insetto.", // REV: Immagine più forte
    "Vecchi segni di piccozza sulla roccia, testimonianza silenziosa di chi ha osato sfidare queste vette prima di te.", // OK
    "Un rivolo d\'acqua gelida, quasi miracoloso, sgorga da una crepa nella roccia arida.", // REV: Rafforza l\'idea di miracolo, corretto escape
    "Una croce fatta di tubi saldati svetta su un picco vicino. Monumento alla fede o semplice avvertimento?", // REV: Più specifico
    "Ghiaccio sporco e antico, venato di nero, si aggrappa alle rocce sfidando il sole malato.", // REV: Aggiunge colore e dettaglio
    "Una frana recente ha squarciato il fianco della montagna, rivelando l\'ingresso di una grotta profonda e buia.", // REV: Più attivo
    "La carcassa di un piccolo velivolo è incastrata tra due picchi aguzzi, come un insetto in una ragnatela.", // REV: Immagine più forte
    "Incisioni erose dal tempo sulla roccia... non sembrano opera umana. Qualcosa di più antico?", // REV: Aggiunge mistero
    "Il freddo tagliente penetra i tuoi stracci logori, arrivando dritto alle ossa.", // REV: Più diretto e personale
    "Un tanfo nauseabondo di decomposizione fuoriesce da un passaggio stretto tra le rocce.", // REV: Più specifico sull\'odore
    "I resti congelati di una spedizione: zaini intatti, occhi vitrei fissi sul vuoto. Un avvertimento muto.", // REV: Più evocativo
    "Il panorama sarebbe magnifico, se non fosse per il silenzio assoluto e mortale che lo avvolge." // REV: Rafforza il contrasto
];
const flavorTextsRiver = [
    "Detriti irriconoscibili e chiazze iridescenti fluttuano sulla corrente lenta e torbida.", // REV: Più specifico, corretto escape
    "La riva fangosa cerca di inghiottire i tuoi stivali a ogni passo. Avanzare è estenuante.", // REV: Più attivo, corretto escape
    "Un pesce mutato, gonfio e con occhi vitrei, galleggia a pancia in su, prova della tossicità dell\'acqua.", // REV: Più descrittivo
    "Il mormorio costante dell\'acqua che scorre ha un effetto quasi ipnotico, pericoloso in questo silenzio.", // REV: Rafforza il concetto, corretto escape
    "Le rovine di un vecchio ponte di cemento emergono dall\'acqua come denti spezzati, creando gorghi insidiosi.", // REV: Immagine diversa
    "Bolle maleodoranti salgono in superficie a intervalli irregolari. Gas o il respiro di qualcosa di sommerso?", // REV: Più interrogativo
    "Immergendo una mano, senti che l\'acqua è innaturalmente calda. Qualcosa non va.", // REV: Più personale/sensoriale, corretto escape
    "L\'acqua ha un colore verdastro e lattiginoso, innaturale e respingente.", // REV: Più diretto, corretto escape singolo
    "Lo scheletro arrugginito di una barca da pesca giace incagliato sulla riva opposta, un monito silenzioso.", // REV: Immagine più forte
    "Uno sciame di insetti mutati, grandi come il tuo pollice e dal ronzio metallico, pattuglia la riva.", // REV: Più specifico, corretto escape
    "Il letto del fiume è un cimitero di oggetti contorti dal tempo e dalla corrente.", // REV: Immagine più evocativa
    "Luci deboli tremolano sulla riva opposta. Sopravvissuti, miraggio o un\'esca?", // REV: Aggiunge opzione 'esca'
    "L\'aria vicino all\'acqua ha un odore chimico acre che brucia le narici.", // REV: Più intenso, corretto escape
    "Una scarpa logora è semisepolta nel fango della riva. Qualcuno è stato trascinato via qui?", // REV: Più diretto
    "Banchi di nebbia innaturale e densa si aggrappano alla superficie dell\'acqua, anche in pieno giorno.", // REV: Rafforza l\'innaturalità, corretto escape
    "L\'acqua ha un colore malato, verdastro, con una patina oleosa che luccica debolmente.", // REV: Ripete concetto ma OK, corretto escape
    "Una barca squarciata è incagliata sulla riva, uno scheletro pieno di fango e lische di pesce.", // REV: Immagine più forte
    "Percepisci un movimento lento e pesante sotto la superficie torbida. Qualcosa di grosso e viscido.", // REV: Più inquietante
    "La nebbia sale dall\'acqua come un sudario freddo e umido, divorando la visibilità.", // REV: Immagine più forte, corretto escape
    "Pilastri di cemento di un vecchio molo emergono dall\'acqua come lapidi dimenticate.", // REV: Immagine diversa, corretto escape
    "Un cartello arrugginito è ancora leggibile: 'DIVIETO DI BALNEAZIONE - RISCHIO BIOLOGICO ESTREMO'.", // REV: Testo più diretto e allarmante
    "Bolle ritmiche salgono in superficie, come il respiro regolare di una creatura sommersa.", // REV: Più specifico sul ritmo
    "Un\'onda improvvisa, troppo grande per essere causata dal vento, increspa la superficie torbida." // REV: Più dinamico, corretto escape
];
const flavorTextsCity = [
    "Il vento geme lugubremente attraverso le finestre sfondate di grattacieli scheletrici.",
    "Un vecchio manifesto strappato raffigurante una famiglia sorridente sventola pateticamente da un muro crepato.",
    "Carcasse arrugginite di veicoli di ogni tipo formano barricate contorte e inutili lungo le strade.",
    "Un silenzio spettrale avvolge le strade deserte, rotto solo dai tuoi passi e dal crepitio dei detriti.",
    "Trovi una bambola rotta, con un occhio mancante e un sorriso inquietante, tra le macerie di una casa.",
    "Un monitor rotto emette ancora una debole luce statica verdastra, come un fantasma tecnologico.",
    "Graffiti criptici e simboli inquietanti coprono quasi ogni superficie verticale, messaggi dai folli o dagli avvertiti.",
    "L\'odore acre di bruciato e decomposizione persiste nell\'aria, un profumo costante di morte.",
    "Il terreno è disseminato di bossoli, schegge di vetro e frammenti d\'ossa.",
    "Hai la costante, spiacevole sensazione di essere osservato dalle migliaia di finestre vuote.",
    "Polvere di cemento ti irrita gli occhi e la gola, rendendo ogni respiro difficoltoso.",
    "Un semaforo dondola precariamente da un palo piegato, bloccato su un rosso eterno.",
    "Un negozio di lusso saccheggiato, manichini nudi e vetrine infrante giacciono come corpi.",
    "La carcassa scheletrica di un autobus urbano giace su un fianco, le porte aperte come una bocca urlante.",
    "Un vento freddo si incanala tra gli edifici, portando con sé suoni indistinti... voci o lamenti?",
    // Nuovi flavor text città
    "Il fruscio della plastica impigliata tra le macerie suona come passi furtivi.",
    "Un palazzo di uffici ha un intero lato collassato, rivelando piani devastati come un alveare aperto.",
    "Un semaforo dondola cigolando nel vento, le luci spente per sempre.",
    "Senti il pianto soffocato di un bambino... ma quando ti avvicini, è solo il vento che fischia in un tubo rotto.",
    "Manifesti sbiaditi promettono un futuro luminoso che non è mai arrivato.",
    "Un orsacchiotto di peluche, sporco e senza un occhio, è seduto su una pila di macerie.",
    "L'odore acre di bruciato persiste nell'aria, anche dopo anni.",
    "Qualcosa stride e si trascina all'interno di un edificio abbandonato vicino."
];
const flavorTextsVillage = [
    "Tende lacere e baracche di lamiera sbattono nel vento, scheletri di un accampamento abbandonato.", // REV: Immagine più forte
    "Le ceneri fredde di un fuoco da campo sono circondate da pentole arrugginite e ossa animali spolpate.", // REV: Più specifico
    "Oggetti personali dimenticati nella polvere: una scarpa da bambino, un libro ammuffito, una foto sbiadita.", // REV: OK
    "Nessun segno di vita recente. Solo silenzio, polvere e un leggero odore di morte.", // REV: Più conciso, corretto escape
    "Un\'atmosfera opprimente grava su questo luogo. Qui è accaduto qualcosa di terribile, lo senti.", // REV: Più diretto, corretto escape
    "Resti di barricate rudimentali e macchie scure sul terreno testimoniano una lotta violenta.", // REV: Più attivo
    "Una pentola ammaccata accanto alla cenere fredda. L\'ultimo, misero pasto, non fu mai consumato.", // REV: Più evocativo, corretto escape
    "Chi viveva qui ha cercato disperatamente di fortificare il posto. Le difese violate raccontano il loro fallimento.", // REV: Contrasto sforzo/fallimento
    "L\'aria sa di polvere stantia, abbandono e quel sottile, dolce odore di malattia.", // REV: Sensoriale, corretto escape (singolo)
    "Piccoli tumuli di terra smossa segnati da croci fatte di rami. Tombe fresche ai margini dell\'accampamento.", // REV: Più descrittivo
    "Un carillon rotto, mosso dal vento, emette una melodia stonata e malinconica.", // REV: OK
    "Le tende squarciate e vuote sembrano bocche spalancate che urlano al cielo silenziosamente.", // REV: Immagine più forte
    "Un orsacchiotto senza un occhio giace nel fango vicino a una tenda. Un piccolo fantasma di innocenza perduta.", // REV: Più evocativo
    "Brandelli logori di una bandiera dimenticata sbattono debolmente su un palo improvvisato.", // REV: OK
    "Il silenzio qui è innaturale, pesante. Come se tutti fossero svaniti in un istante.", // REV: Più intenso, corretto escape
    "Una pentola annerita dondola su un treppiede improvvisato, sopra un letto di cenere fredda.", // REV: OK
    "Disegni infantili, tracciati col carbone su un pezzo di lamiera, raffigurano eroi improbabili e mostri fin troppo reali.", // REV: Contrasto
    "Una fila di piccole tombe, segnate da pietre rozze, si allinea ai margini del villaggio. Molte sono piccole.", // REV: Dettaglio più triste
    "Una scritta frettolosa sulla parete di una baracca: 'SONO ANDATI A NORD. CHE DIO CI AIUTI'.", // REV: Aggiunge disperazione
    "C\'è un silenzio carico di attesa, come se gli abitanti fossero appena usciti e potessero tornare da un momento all\'altro.", // REV: Più specifico, corretto escape
    "Una scacchiera fatta a mano, con tappi di bottiglia e bulloni arrugginiti come pezzi. Qualcuno cercava normalità qui.", // REV: Aggiunge contesto
    "Un diario recuperato da una pozza d\'acqua: le pagine sono incollate, piene di simboli indecifrabili e macchie scure.", // REV: Più descrittivo
    "Tracce di un esodo disperato e improvviso sono ovunque. Cosa li ha fatti fuggire così in fretta?" // REV: Più interrogativo
];
const flavorTextsRestStop = [
    "Questo rifugio è un fragile assemblaggio di lamiere arrugginite, teli strappati e speranze infrante.", // REV: Più evocativo
    "Segni di passaggio recente: un graffito sul muro ('NON DORMIRE'), strani talismani fatti di ossa e fili.", // REV: Più specifico, corretto escape
    "Un odore acre di fumo stantio, urina e umidità impregna l\'aria. Il fetore della sopravvivenza.", // REV: Più incisivo
    "Dall\'esterno sembra quasi sicuro, ma una volta dentro, un senso di disagio ti attanaglia.", // REV: Più diretto, corretto escape
    "Un giaciglio di stracci luridi in un angolo. Qualcuno ha dormito qui, forse stanotte stessa.", // REV: Aumenta la tensione
    "Il silenzio qui è innaturale, opprimente. Come se le pareti avessero assorbito le urla dei precedenti occupanti.", // REV: OK
    "Il tetto improvvisato gocciola un liquido scuro e viscoso, anche se fuori non piove.", // REV: Più descrittivo
    "Scritte sul muro contano i giorni: 'Sopravvissuto: 12', '13'... poi solo un graffio profondo che cancella ogni speranza.", // REV: Più narrativo, corretto escape
    "Un materasso sudicio e squarciato è gettato in un angolo, coperto di macchie scure e inquietanti.", // REV: Più viscerale
    "Una lattina vuota rotola rumorosamente sul pavimento al tuo ingresso, un suono assordante nel silenzio.", // REV: OK
    "Un debole odore dolciastro aleggia nell\'aria. Prodotti chimici, decomposizione... o qualcos\'altro?", // REV: Aggiunge mistero, corretto escape
    "Le pareti sono una tela per disegni infantili disturbanti e simboli arcani che non riconosci.", // REV: Contrasto inquietante
    "Una vecchia radio a manovella giace su un tavolo improvvisato. Silenziosa, ma forse non per sempre.", // REV: Suggerisce potenziale
    "Il gocciolio ritmico e costante di acqua (o qualcos\'altro?) da qualche parte nel buio è l\'unico suono.", // REV: Aggiunge incertezza
    "La polvere spessa attutisce ogni rumore, creando una cappa di silenzio quasi soffocante.", // REV: OK
    "Qualcuno ha tentato di rendere questo posto \'casa\', appendendo tendine strappate che ora penzolano come fantasmi.", // REV: Più evocativo
    "Un graffito rozzo avverte: 'Non fidarti delle ombre. Cantano.'", // REV: Più criptico e inquietante
    "C\'è un odore pungente di disinfettante chimico, un tentativo disperato di coprire un tanfo ben peggiore.", // REV: Più specifico, corretto escape
    "Un elenco di nomi è graffiato sul metallo arrugginito. Molti nomi sono stati violentemente cancellati.", // REV: Più descrittivo
    "La porta di questo rifugio è stata chiaramente rinforzata dall\'interno. Paura di cosa?", // REV: Aggiunge interrogativo, corretto escape
    "Una vecchia foto di famiglia è incollata al muro. I volti sono stati accuratamente bruciati via.", // REV: Dettaglio più macabro
    "Resti di provviste accumulate: scatole vuote, involucri strappati. Qualcuno si preparava a resistere a lungo.", // REV: OK
    "Una cassetta del pronto soccorso aperta e saccheggiata pende dal muro, garze sporche sparse sul pavimento." // REV: Più specifico
];

// Flavor text per diversi tipi di tile (Notte)
const flavorTextsNightPlains = [
    "Un silenzio innaturale avvolge la pianura. Solo il tuo respiro rompe la quiete sotto la luna malata.", // REV: Più personale
    "La luna proietta ombre danzanti e distorte. Per un attimo, sembrano creature striscianti.", // REV: Rende più soggettiva l\'impressione
    "Il vento notturno ulula tra l\'erba secca, portando echi di voci o forse solo fischi sinistri.", // REV: Più ambiguo, corretto escape
    "Un fruscio improvviso nell\'erba alta ti fa trasalire. Ti giri di scatto, ma vedi solo ombre.", // REV: Più dinamico, corretto escape
    "Le stelle sono punte di ghiaccio in un cielo nero e profondo. Osservatori freddi e distanti.", // REV: Immagine più forte
    "Un grido disumano lacera la quiete notturna in lontananza. Meglio non sapere cosa fosse.", // REV: Aumenta il senso di ignoto
    "L\'oscurità qui è quasi tangibile, densa, pronta a divorare la luce flebile della tua torcia.", // REV: Immagine più forte, corretto escape
    "Una sagoma indistinta corre veloce all\'orizzonte, troppo rapida per essere identificata. O per essere naturale.", // REV: Aggiunge dubbio, corretto escape
    "Il terreno sembra pulsare debolmente sotto i tuoi piedi, come il respiro di una bestia enorme addormentata.", // REV: Più inquietante, corretto escape
    "Il freddo pungente della notte penetra fino alle ossa, portando una stanchezza profonda e pericolosa.", // REV: OK
    "Luci fatue, fredde e azzurrine, danzano all\'orizzonte. Spiriti erranti o gas velenosi?", // REV: Più specifico sul colore
    "L\'orizzonte notturno è un mare nero e infinito. Nessun riparo, nessuna speranza in vista.", // REV: Più evocativo, corretto escape
    "Nuvole rapide oscurano la luna a intermittenza, immergendo il mondo in un buio ancora più profondo e improvviso.", // REV: OK
    "Una brezza gelida porta un odore acre e metallico. Ruggine, o sangue rappreso?", // REV: Più specifico e ambiguo
    "Un suono basso e vibrante sale da sottoterra. Lontano, ma abbastanza vicino da inquietarti.", // REV: OK
    "La temperatura crolla bruscamente. Il tuo respiro si condensa in nuvole spettrali davanti a te.", // REV: Più diretto, corretto escape
    "Coppie di occhi luminosi ti osservano dall\'erba alta, immobili, per poi svanire nel nulla.", // REV: Più inquietante, corretto escape
    "Un bagliore verdastro e pulsante illumina debolmente l\'orizzonte. Non sembra un fenomeno naturale.", // REV: Più minaccioso, corretto escape
    "Colonne di vapore caldo salgono dal terreno screpolato in alcuni punti, come sbuffi dalla terra.", // REV: OK
    "Alla luce spettrale della luna, la tua ombra sembra muoversi per conto proprio, un compagno infido.", // REV: Più inquietante
    "Sciami di piccoli insetti luminescenti pulsano nell\'aria con una luce fredda e innaturale.", // REV: OK
    "Echi distanti portano frammenti di conversazioni spezzate o forse solo il lamento del vento.", // REV: Più ambiguo, corretto escape
    "Le stelle sembrano convergere tutte verso un punto oscuro all\'orizzonte. Un presagio?" // REV: Più interrogativo e minaccioso, corretto escape
];
const flavorTextsNightForest = [
    "Ogni scricchiolio di rami secchi sotto i piedi suona come uno sparo nel silenzio notturno.", // REV: Immagine più forte
    "Forme contorte si muovono furtive tra gli alberi, ai margini della tua vista. Ombre o creature?", // REV: Più interrogativo
    "Un odore dolciastro e metallico impregna l\'aria gelida della notte. Sangue fresco?", // REV: Più specifico, corretto escape
    "Il buio qui è quasi assoluto, denso, soffocante come terra bagnata.", // REV: OK
    "Senti il fruscio pesante di grandi ali che passano silenziose sopra la tua testa, oscurando le stelle.", // REV: Più descrittivo, corretto escape
    "Due occhi gialli e innaturali ti fissano dal buio più profondo, poi svaniscono con un fruscio.", // REV: OK
    "La foresta notturna è viva e ostile. Ogni albero sembra nascondere un predatore in agguato.", // REV: Più diretto, corretto escape
    "Inciampi su una radice nascosta nell\'ombra, cadendo quasi. Il cuore ti balza in gola.", // REV: Più dinamico, corretto escape
    "Un sussurro gelido ti sfiora l\'orecchio, sembra pronunciare il tuo nome... o è solo il vento tra le foglie?", // REV: Più ambiguo
    "La luce spettrale della luna filtra a fatica tra le chiome contorte, disegnando ombre ingannevoli.", // REV: OK
    "Un respiro rauco e umido, molto vicino. Ma da dove proviene?", // REV: Più diretto
    "Il silenzio è così teso e carico che senti il sangue pulsare forte nelle tempie.", // REV: OK
    "Funghi bioluminescenti proiettano una luce fredda e inquietante su tronchi e radici contorte.", // REV: Più descrittivo
    "Il terreno cede leggermente sotto i tuoi passi, soffice e umido come carne.", // REV: Immagine più disturbante
    "All\'improvviso, ogni suono cessa. Un silenzio innaturale e pesante cala sulla foresta, più terrificante di qualsiasi rumore." // REV: Rafforza il concetto
];

// Frammenti di Lore (trovati casualmente o legati a eventi)
const loreFragments = [
    "Pagina strappata di diario: '... giorno 47. Le scorte sono finite. Ho sentito di un posto sicuro a est, oltre le montagne spezzate. Forse è solo una favola per disperati come me, ma è la mia ultima speranza...'",
    "Pezzo di metallo inciso a laser: 'Progetto Chimera - Soggetto #007 - Proprietà del Lab 7 - TERMINATO'",
    "Ologramma tremolante da un dispositivo rotto: '...protocollo di contenimento fallito... bio-agente [CLASSIFICATO] fuori controllo... Evacuare immediatamente... che Dio ci aiuti...'",
    "Scheda dati danneggiata e macchiata: '...mutazione instabile di Tipo IV... aggressività esponenziale... protocollo suggerito: eliminare a vista con armi incendiarie...'",
    "Scarpa da bambino logora accanto a una piccola croce fatta di rametti e filo spinato.",
    "Graffito tracciato col sangue su un muro: 'Non fidatevi dell'acqua che brilla. NON BEVETELA.'",
    "Registrazione audio disturbata, voce maschile: '...stanno arrivando... le pareti non reggeranno... dite a mia figlia che l'amavo... il suo nome è Lily... *statica assordante*'",
    "Mappa disegnata a mano su un pezzo di pelle umana conciata: Indica un percorso verso un luogo chiamato \'L\'Oasi sotto le Stelle Cadute\', ma è strappata a metà.",
    "Messaggio inciso rozzamente su una capsula di proiettile 7.62: 'Per Mamma. Mi dispiace.'",
    "Libro bruciacchiato ('Miti Pre-Collasso') con una sola pagina leggibile: '...e così gli Antichi Dei dormirono nelle profondità della terra e del cielo, lasciando il mondo al silenzio e ai loro figli distorti...'",
    "Audio-log recuperato da un registratore militare: '...Soggetto 17 mostra rigenerazione cellulare accelerata... ma anche psicosi acuta... aggressività incontrollabile... perdita contenimento imminente... sterilizzare l'area...'",
    "Biglietto scritto a mano con grafia tremante: 'Se leggi questo, sono andato a cercare acqua al Vecchio Impianto Idrico. Non seguirmi, è pieno di Quei Cosi. Trova il Safe Place. Ti voglio bene. Papà.'",
    "Distintivo militare corroso dall'acido: Riporta il simbolo di un teschio alato e la scritta 'Guardiani del Lab - Unità Epurazione'.",
    "Terminale medico portatile, schermo rotto ma leggibile: Mostra una lettura parziale: 'Contaminazione Biologica Tipo Gamma - Necrosi Tessutale Rapida - Esposizione fatale entro 2 ore...'.",
    "Fotografia olografica incrinata e tremolante: Mostra una città vibrante e piena di luci volanti colorate, un'immagine quasi dolorosa da guardare ora.",
    "Bozza di messaggio non inviato, scritta su un tablet rotto: '...Eliza, non ce la faremo a raggiungerti. Le scorte bastano per uno solo. Prenditi cura di Ultimo... digli che la sua mamma era un'eroina... e che...'",
    "Schema tecnico strappato e macchiato: Descrive un 'Generatore Atmosferico Classe Arca' progettato per purificare l'aria su larga scala... mai attivato?",
    "Simbolo religioso improvvisato fatto di ossa umane, fili metallici e componenti elettronici.",
    "Ritaglio di giornale pre-guerra ('Il Cronista Globale'): Titolo: 'Nuova Era di Prosperità o Fuga dalla Realtà? Le Volte Salveranno l'Umanità o la Divideranno per Sempre?'",
    "Piccolo carillon arrugginito a forma di stella. Quando lo apri, suona una melodia triste e rivela uno scomparto segreto con dentro una chiave minuscola e ossidata.",
    "Appunto scarabocchiato su un tovagliolo unto: 'Segui il fiume morto verso il sole calante. Cerca la roccia che piange. Lì troverai la porta... se oserai bussare.'",
    "Chip dati incrinato e parzialmente fuso. Impossibile leggerlo senza l'attrezzatura di un Lab... o forse qualcosa di peggio.",
    "Manuale tecnico strappato ('Manutenzione Ripari Classe-C'): '...il sistema di filtraggio dell\'aria HEPA richiede sostituzione nucleo ogni 500 ore operative per evitare contaminazione interna...'",
    "Lista della spesa macchiata di sangue: 'Acqua (min. 5L), Munizioni (tutte!), Scatolette (proteine!), Nastro adesivo (molto!), Antidolorifici... Speranza (se ne trovi)...'",
    "Pagina di un bestiario improvvisato, scritto a mano con disegni disturbanti: Descrive una creatura notturna senza volto chiamata 'Il Sussurrante delle Ombre', che si nutre di ricordi.",
    "Rapporto tecnico parzialmente bruciato: '...il Geo-Core di Sektor Gamma è instabile. Rischio di collasso quantico entro 48h. Evacuare...'",
    "Messaggio scarabocchiato sul retro di una foto di famiglia sorridente: 'Non sono riuscito a salvarli. La nebbia... li ha presi...'",
    "Ordine militare criptato (decifrato parzialmente): '...Protocollo Cenere attivato su [REDACTED]. Nessun sopravvissuto autorizzato. Silenzio totale.'",
    "Capsula medica vuota etichettata 'Naniti Riparatori - Prototipo X'. Sembra usata di recente.",
    "Frammento di trasmissione radio intercettata: '...i Corvi Neri hanno sfondato a ovest. Ripeto, i Corvi Neri... la Vecchia Capitale cadrà...'",
    "Diario di un medico del Lab 9: 'Giorno 112. Le mutazioni accelerate nel Settore Delta sono... inaspettate. Aggressività fuori scala. Abbiamo creato mostri.'",
    "Tessera d\'accesso corrosa: 'Lab 4 - Livello Sicurezza Alpha - Dott.ssa Eva Rostova'",
    "Manifesto propagandistico strappato: 'L\'Unione Pan-Europea garantisce sicurezza! Denunciate i dissidenti! Il futuro è ordine!'",
    "Lista di nomi incisa su un muro con un coltello: 'Hans, Greta, Lena, Karl... Perdonatemi.'",
    "Progetto tecnico di un\'arma energetica portatile chiamata 'Lancia Solare'. Manca la pagina del generatore.",
    "Avviso di quarantena biologica sbiadito e strappato, affisso alla porta di un bunker sigillato dall\'esterno.",
    "Registrazione audio recuperata da un drone abbattuto: '...zona contaminata confermata. Livelli Gamma letali. Nessun segno di vita organica... solo... movimento...'",
    "Lettera non spedita: 'Mia cara Anya, se leggi questo, vuol dire che non torno. Ho visto cose indicibili oltre il Muro Est. Il \'Safe Place\' non è ciò che credono...'",
    "Simbolo tribale dipinto con sangue e fango su un carro armato abbandonato. Sembra un avvertimento.",
    "Schema di un 'Filtro Psichico Classe-3'. Promette protezione dalle 'influenze esterne', ma richiede componenti introvabili.",
    "Etichetta di razione militare: 'Eurasian Concordat - Pasto N.7 - Scadenza: --/--/--'",
    "Richiesta di evacuazione medica urgente, negata: '...impossibile raggiungere la posizione. Priorità strategiche altrove. Sacrificio necessario.'",
    "Pagina di libro per bambini ('Le Fiabe della Vecchia Europa') con disegni inquietanti scarabocchiati sopra le illustrazioni originali.",
    "Componente elettronico non identificato, ancora caldo al tatto, che emette un debole ronzio.",
    "Messaggio in codice lasciato in un punto di scambio morto: 'Aquila non risponde. Il pacco è compromesso. Procedere con Protocollo Omega.'",
    "Frammento di mappa stellare disegnata a mano su un pezzo di tela cerata, con note indecifrabili ai margini.",
    "Ordine di fucilazione firmato da un 'Comandante della Milizia Popolare': Accusa di 'tradimento ideologico'.",
    "Ciondolo a forma di orsetto di metallo, leggermente radioattivo, stretto nella mano scheletrica di un bambino.",
    "Rapporto psichiatrico Lab 11: 'Paziente 042 mostra sintomi di paranoia acuta, parla di 'voci nel metallo' e 'occhi nei muri'. Sedazione aumentata.'",
    "Chiave magnetica con etichetta sbiadita: 'Deposito Criogenico B-7'.",
    // Nuovi frammenti di lore
    "Registrazione su un vecchio data-slate crepato: 'Giorno 112. La mutazione si diffonde più velocemente del previsto. I sintomi neurologici sono... preoccupanti. Stiamo perdendo il controllo. Il Lab 7 deve essere sigillato. Ripeto, sigillat...' *fine registrazione*.",
    "Frammento di tessuto strappato da un'uniforme militare. C'è una mostrina sbiadita con un teschio alato e la scritta 'Angeli della Cenere'.",
    "Pagina di un manuale tecnico illustrato: mostra lo schema di un 'Purificatore d'Acqua Modello Aqualux VII', ma diverse componenti cruciali sono illeggibili o strappate.",
    "Graffito complesso tracciato con vernice spray fluorescente su un muro crollato: raffigura un labirinto che converge verso un occhio stilizzato.",
    "Piccola scatola di metallo arrugginita. Dentro, una ciocca di capelli biondi legata con un nastro sbiadito e una nota: 'Tornerò. Promesso. - Papà'.",
    "Chip dati militare. Inserendolo in un terminale funzionante, potresti accedere a vecchie mappe tattiche o rapporti classificati.",
    "Libro di fiabe per bambini, 'Le Avventure di Capitano Cometa'. Le pagine sono rovinate dall'umidità, ma le illustrazioni colorate di razzi e pianeti alieni sono ancora visibili.",
    "Messaggio lasciato in una bottiglia vicino a un fiume prosciugato: 'Se leggi questo, vai a Ovest. Evita le guglie di vetro. Cantano di notte. Non ascoltarle.'",
    "Terminale medico portatile, schermo crepato. Log: Paziente 04-B - Esposizione a 'Nebbia Cinerea'. Sintomi: cristallizzazione epidermica, paranoia acuta. Prognosi: infausta. Ultimo aggiornamento: 8 anni fa.",
    "Pezzo di ceramica dipinta, forse parte di un vaso antico. Raffigura figure umanoidi che adorano un sole nero.",
    "'Guida Pratica alla Sopravvivenza nel Dopocrollo' - Edizione Pirata. Molte pagine sono dedicate a come cucinare ratti e riconoscere funghi velenosi.",
    "Comunicazione radio intercettata e trascritta su un foglio: '...ripetere, Eco-Alfa-Uno, la Zona di Quarantena è compromessa. Protocollo Scudo Divino attivato. Che Dio ci perdoni...'",
    "Schema tracciato su un tovagliolo di carta: mostra come modificare una batteria d'auto per creare un'arma a impulsi elettromagnetici. Sembra pericoloso.",
    "Un dente innaturalmente grande e affilato, forse appartenuto a una creatura mutata. È stranamente caldo al tatto.",
    "Relazione scolastica scritta a mano da un bambino: 'Il mio animale preferito è il Gatto Ombra. È soffice e silenzioso e mangia i brutti sogni'.",
    // Ancora più frammenti di lore
    "Mappa scolorita che mostra la posizione di 'Punti di Ancoraggio'. Una nota manuscritta dice: 'Non avvicinarsi durante le fluttuazioni armoniche'.",
    "Diario di un guardiano del Lab: 'I sogni stanno diventando collettivi. Stanotte dieci persone hanno avuto lo stesso incubo sui corridoi che si allungano'.",
    "Diario di un guardiano della Volta: 'I sogni stanno diventando collettivi. Stanotte dieci persone hanno avuto lo stesso incubo sui corridoi che si allungano'.",
    "Brochure turistica strappata: 'Visita il Nuovo Mondo Sotterraneo - Dove il futuro dell'umanità fiorisce al riparo dalle tempeste superficiali!'",
    "Frammento di trasmissione militare: '...hanno modificato la gravità locale. Ripeto, le leggi fisiche sono alterate. Non entrare nel perimetro segnato dai monoliti neri...'",
    "Scontrino di un negozio pre-guerra. Sul retro, scritto a mano: 'LORO possono vedere attraverso gli occhi degli animali. Non fidarti di nessuna creatura viva.'",
    "Pagina di un rapporto scientifico: '...il fenomeno di risonanza quantistica tra gemelli esposti all'Agente V mostra transfer di coscienza con una probabilità del 78.3%...'",
    "Vecchia fotografia: mostra una famiglia sorridente davanti a una casa. I loro occhi sono stati cancellati con un pennarello nero, e sul retro c'è scritto: 'Dimenticali'.",
    "Pagina sgualcita di un manuale: 'Protocollo d'emergenza per contaminazione psico-reattiva: 1. Non pensare a forme geometriche complesse 2. Evitare specchi 3. Non nominare l'entità...'",
    "Certificato di nascita strappato: 'Nome: [cancellato] Codice: XVZ-23 Tipo Genetico: Migliorato Serie C - Autorizzato da Ministero Evoluzione'",
    "Amuleto di metallo a forma di insetto con sei ali. Quando lo tocchi, sembra vibrare leggermente, come se fosse vivo.",
    "Vecchia locandina: 'Grande Celebrazione dell'Unificazione - 12 Maggio 2089 - Un Mondo, Una Mente, Un Futuro'",
    "Frammento di un contratto: '...il firmatario cede tutti i diritti sul proprio codice genetico e sui relativi derivati alla NeoGenesis Corp per 99 anni...'",
    "Taccuino coperto di numeri e simboli, apparentemente casuali. L'ultima pagina dice solo: 'La sequenza è completa. Il Portale si aprirà al tramonto.'",
    "Registrazione rovinata: '...abbiamo scoperto che la melodia attira le creature, ma un tono specifico le rende passive. La frequenza esatta è...' *statica*",
    "Diario di un esploratore: 'Giorno 340. Ho trovato un'altra Anomalia. Questa volta è una porta che conduce... da nessuna parte. O meglio, ogni volta che ci entro, esco in un luogo diverso.'"
];

// Messaggi radio casuali (evento 'eco_radio')
const radioMessages = [
    "...ripeto, Settore 7-G, evacuazione fallita... [STATICA]... bio-agente Omega... non avvicinatevi...",
    "...c'è qualcuno in ascolto? Rispondete, frequenza Delta-9... siamo intrappolati al [RUMORE BIANCO]... le scorte...",
    "...[CANZONE DEFORME e LENTA]... dove sei andato, mio dolce amore? Il mondo finisce stanotte...",
    "...numero 9... numero 9... numero 9... [CLICK] ...la trasmissione riprenderà...",
    "...Codice Scarlatto! Ripeto, Codice Scarlatto! La breccia è nel perimetro est! Cadono come mosche! [SPARO e URLA]...",
    "...[VOCE BAMBINA]... Mamma? Papà? C'è qualcuno lì fuori? Ho paura del buio...",
    "...Questo è un messaggio automatico del Sistema di Allerta Emergenza. Rimane [NUMERO DISTORTO] ore prima dell'impatto. Cercate riparo immediatamente... [SIRENA LONTANA]",
    "...[VOCE CALMA e SINISTRA]... Non siete soli là fuori. Vi osserviamo. Vi aspettiamo. Unitevi al Silenzio...",
    "...prova, uno, due... microfono funziona? Okay. Diario del Capitano, Giorno 83... la quarantena non regge. Le mutazioni... peggiorano... [STATICA INTENSA]",
    "...segnale di soccorso dalla Volta 12. Sistemi vitali al 5%. Richiediamo assistenza immediata... se c'è ancora qualcuno...",
    "...[MUSICA CLASSICA INTERROTTA]... annuncio di servizio: ricordate, 'Loro' ascoltano. Non usate nomi. Non parlate del passato...",
    "...ripeto, coordinate [NUMERI INCOMPRENSIBILI]... punto di estrazione Alfa tra 10 minuti. Ultima chiamata. Che Dio ci assista...",
    "...non credete alle loro bugie! Il 'Safe Place' è una trappola! È [SEGNALE INTERROTTO BRUSCAMENTE]",
    "...[SOSPIRO PROFONDO]... A chiunque trovi questo messaggio... Dite a mia moglie... ditele che ho provato...",
    "...[SEQUENZA NUMERICA RIPETUTA] ... 4 8 15 16 23 42 ... 4 8 15 16 23 42 ...",
    // Nuovi messaggi radio
    "...Attenzione, se potete sentirmi... Le Torri Arcologiche di Neo-Milano sono cadute. Il protocollo Inverno Nero è attivo. Non cercate rifugio nelle strutture governative...",
    "...Ultimo avviso ai sopravvissuti nel Settore Est. La nebbia cromata si sta diffondendo. I sintomi includono euforia, allucinazioni visive e... e... [RISATA CRESCENTE] ...oh, è bellissima...",
    "...qui Dottoressa Vargas, Centro Ricerche Alpine. Abbiamo isolato un ceppo resistente al Flagello Rosso. Ripeto, abbiamo un vaccino. Coordinate per il recupero: 47.3N, 9.2E...",
    "...[INTERFERENZE RITMICHE]... Figli del Nuovo Ciclo, è giunta l'ora del Risveglio. I Sentieri Luminosi si apriranno al solstizio. Portate le offerte designate e...",
    "...mayday, mayday! Qui aeromobile civile Sierra-Victor-9. Stiamo perdendo quota dopo aver attraversato... qualcosa nel cielo. Non era una nuvola, era... [STATICA PROLUNGATA]...",
    "...[VOCE METALLICA, FORSE SINTETIZZATA]... L'ultimo esemplare umano non modificato è stato catalogato. Fine dell'operazione Arca Genetica. Iniziare fase due della Trasmutazione Globale...",
    "...segnale automatico: questo messaggio indica che le capsule di stasi della Stazione Orbitale Europa hanno raggiunto il livello critico di energia. Risveglio forzato tra 3... 2... 1...",
    "...attenzione viaggiatori! Il Convoglio della Salvezza partirà all'alba dal punto di raccolta Delta. Ultima possibilità prima della stagione delle tempeste di sabbia. Portate acqua per 10 giorni...",
    "...è bellissimo qui... [SUONO DI ONDE]... l'acqua è tornata blu... i pesci sono normali... vieni a trovarci... [RISATA INQUIETANTE]... vieni a nuotare con noi..."
];

// Descrizioni per eventi specifici (incontri, pericoli, etc.)
const descrizioniIncontroPredoni = [
    "Sagome scure si stagliano contro il cielo morente, avanzando con intenzioni ostili.", // REV: Più visivo
    "Emergono dalla polvere come spettri affamati, armi improvvisate strette nelle mani.", // REV: OK
    "Un fischio acuto lacera l'aria, seguito da passi furtivi che convergono sulla tua posizione.", // REV: Più teso
    "Un gruppo lacero e dagli occhi febbricitanti ti blocca la strada, maschere di disperazione e brutalità.", // REV: Più descrittivo
    "I loro occhi sono vuoti, affamati. Le armi, un letale collage di tubi arrugginiti e lame scheggiate.", // REV: Più incisivo
    "Tre figure ti circondano lentamente, sogghignando con denti marci tra labbra spaccate.", // REV: Più minaccioso
    "Un bruto con una maschera antigas crepata ti punta contro un tubo metallico rinforzato, ringhiando parole incomprensibili.", // REV: Più specifico
    "'Alt! Fermo dove sei, scarto!' grida una voce rotta dalla tensione da dietro una barricata improvvisata.", // REV: OK
    "Più disperati che malvagi, ma la fame li rende imprevedibili e pericolosi come bestie ferite.", // REV: Metafora animale
    "Ti studiano come avvoltoi su una carcassa, valutando ogni tua debolezza, ogni tuo tremito.", // REV: Metafora diversa
    "Un branco di adolescenti induriti, occhi vecchi in volti giovani, ti squadra con arroganza armati di coltelli e bastoni.", // REV: Contrasto età/sguardo
    "Una donna dal volto segnato da una cicatrice e occhi freddi come schegge di ghiaccio ti trafigge con lo sguardo, in silenzio.", // REV: Più evocativo
    "Sbucano da un edificio sventrato, la loro apparizione improvvisa nel silenzio è quasi uno shock fisico.", // REV: Più impattante
    "Le loro risate sguaiate echeggiano tra le rovine, un suono sgradevole che annuncia solo guai.", // REV: OK
    "Indossano stracci e pezzi di armature recuperate, macabri trofei di scontri e razzie." // REV: Più descrittivo
];
const vociPredoni = [ // Non attualmente usate, ma potenzialmente utili - REV: Aggiunta varietà e tono
    "'Fermi lì, viaggiatore! Un passo di troppo e assaggi l'acciaio.'",
    "'Guarda cosa ha portato il vento... un bocconcino solitario.'",
    "'Non fare l'eroe. Gli eroi marciscono in fretta qui fuori.'",
    "'Svuota quelle tasche, piano. E non provare a fare il furbo.'",
    "'Questa è zona nostra. Il passaggio si paga. In cibo, acqua... o sangue.'",
    "'Non cercare guai, e forse ti lasciamo andare con le tue ossa intere. Forse.'",
    "'Tutto. Subito. O ti apriamo come una scatoletta.'",
    "'Da solo? Errore tuo. Sarà più semplice per noi.'",
    "'Bella quella roba che hai... Dalla a noi. Sarà più utile nelle nostre mani.'",
    "'Non siamo qui per chiacchierare. Consegnaci tutto.'",
    "'La fame è una brutta bestia. E tu sembri... saziante.'",
    "'La fortuna ti ha voltato le spalle, amico. Sei nostro.'",
    "'Nessuno passa senza il nostro permesso. Il prezzo è alto.'",
    "'Le chiacchiere non ti salveranno. Solo l'obbedienza.'",
    "'Non opporre resistenza. Finirebbe solo male... per te.'"
];
const tipiBestie = [ // Usato in evento 'animale'/'animale_notturno' - REV: Aggiunti nomi più specifici/evocativi
    "Mastino Mangiapietre", "Verro Radioattivo", "Ratto-Talpa Gigante", "Lupo Bi-testa", "Corvo Stridulo Carnivoro", "Orso Sanguinante", "Serpe Spinata", "Sciame di Vespe-Rasoio", "Scimmia Scorticata", "Lince Fantasma", "Polipo Terrestre", "Iena Spettrale", "Cervo Luminescente Mutante", "Millepiedi Corazzato Sibilante"
];
const descrizioniIncontroBestie = [ // Usato con tipiBestie - REV: Maggiore varietà e specificità
    "Un {animale} emerge ringhiando dalle ombre, bava acida che cola dalle fauci.", // REV: Aggiunto dettaglio
    "Un {animale} ti carica con furia cieca, il terreno trema e si solleva sotto le sue zampe.", // REV: Più impatto
    "Uno sciame ronzante di {animale} ti circonda rapidamente, un incubo volante di chitina e aculei.", // REV: Più specifico
    "Un {animale} ti sbarra la strada, mostrando zanne/artigli/aculei affilati come ossidiana.", // REV: Metafora diversa
    "Un {animale} ti osserva immobile da una posizione sopraelevata, occhi freddi e calcolatori pronti a colpire.", // REV: Più predatorio
    "Un {animale} ti studia con un'intelligenza crudele e aliena, valutando la tua vulnerabilità.", // REV: Intelligenza aliena
    "Un {animale} difende ferocemente il suo territorio o la sua tana, un muro di muscoli e furia.", // REV: Immagine muro
    "Un {animale} è attratto dal tuo odore di carne viva, un faro nella desolazione per i suoi sensi distorti.", // REV: Motivazione
    "Un {animale} ferito e messo all'angolo è doppiamente pericoloso, ringhia di dolore e rabbia.", // REV: Motivazione (dolore)
    "Un {animale} ti segue silenziosamente da tempo, un'ombra paziente in attesa del momento perfetto per uccidere." // REV: Pazienza predatoria
];

// Esiti per le scelte negli eventi (Successo/Fallimento)
const esitiFugaPredoniOk = [ // REV: Aumentata varietà e dinamismo
    "Ti dissolvi tra le ombre come fumo, lasciandoli a gridare nel vuoto.",
    "Li distrai con un lancio preciso e ti dilegui nella direzione opposta mentre abboccano all'esca.",
    "Individui una via di fuga improbabile, un passaggio stretto tra macerie che solo tu riesci a vedere.",
    "La tua agilità ti permette di danzare tra gli ostacoli, seminandoli in un labirinto di rovine.",
    "Ti tuffi dietro un riparo solido un attimo prima che aprano il fuoco, sgattaiolando via non visto.",
    "Corri con la forza della disperazione, più veloce di quanto credessi possibile, il cuore in gola.",
    "Approfitti di un loro battibecco interno per scivolare via nel silenzio come un fantasma.",
    "Conosci questo dedalo meglio di loro, li attiri in un vicolo cieco e scompari.",
    "Un crollo improvviso solleva una nube di polvere densa, fornendo la copertura perfetta per la tua ritirata.",
    "Mentre sono distratti da un rumore lontano (un'altra preda?), li aggiri furtivamente.",
    "Ti infili in un condotto stretto e buio dove esitano a seguirti, temendo trappole.",
    "Li semini con una serie di finte e cambi di direzione improvvisi, confondendoli.",
    "Il suono lontano di una sirena (reale o immaginaria?) li distrae abbastanza da farti guadagnare terreno.",
    "Sfrutti la confusione creata da un piccolo smottamento per svanire nel caos.",
    "Ti mimetizzi con l'ambiente, diventando quasi invisibile ai loro occhi distratti."
];
const esitiFugaPredoniKo = [ // REV: Aumentata varietà e impatto
    "Inciampi su un detrito invisibile e cadi faccia a terra. Sei alla loro mercé, ansimante.",
    "La paura ti paralizza per un istante fatale. Ti circondano, bloccando ogni via di fuga.",
    "Quella che sembrava una via d'uscita si rivela un vicolo cieco. Sei in trappola.",
    "Sono più veloci, più affamati. Ti raggiungono, il loro fiato caldo sul collo.",
    "Una mano rude ti afferra per il collo della giacca, strattonandoti all'indietro.",
    "Una rete sporca e pesante ti cade addosso dall'alto, avvolgendoti e immobilizzandoti.",
    "Ti chiudono metodicamente, stringendo il cerchio, ghigni crudeli sui loro volti.",
    "Un colpo secco alla nuca ti fa vedere le stelle e crollare a terra, stordito.",
    "Una freccia artigianale ti si conficca nella gamba, facendoti urlare e cadere.",
    "La fatica ti tradisce. I polmoni bruciano, le gambe cedono. Non puoi più correre.",
    "Ti spingono con violenza contro un muro freddo e umido. Non hai scampo.",
    "Sottovaluti la loro astuzia. Ti attirano in una trappola fin troppo ovvia.",
    "Una raffica di proiettili ti costringe a gettarti a terra. Sei bloccato sotto il fuoco nemico.",
    "Un veicolo sgangherato ti taglia la strada all'improvviso, bloccando la fuga.",
    "Una trappola a laccio nascosta scatta, serrandosi attorno alla tua caviglia e facendoti cadere."
];
const esitiLottaPredoniOk = [ // Rinominato da Attacca a Lotta per coerenza - REV: Maggiore dinamismo e varietà
    "La tua ferocia inaspettata li sorprende, respingendo il loro assalto scoordinato.",
    "Dopo uno scambio brutale di colpi, decidono che non vali la pena dello sforzo e si ritirano ringhiando.",
    "Li tieni a bada con colpi precisi e parate disperate, ma rimangono ai margini, pronti a colpire ancora.",
    "Abbatti rapidamente il più grosso, la vista del compagno a terra gela il sangue agli altri.",
    "Li costringi a indietreggiare con una difesa furiosa, guadagnando terreno prezioso.",
    "Il tuo contrattacco fulmineo li coglie impreparati, spezzando il loro slancio iniziale.",
    "Un colpo fortunato ferisce il loro capo, gettando il gruppo nel caos e nell'indecisione.",
    "Li tieni impegnati abbastanza da creare un'apertura, un varco nella loro formazione per fuggire.",
    "La tua determinazione selvaggia e il tuo sguardo folle li intimoriscono più delle tue armi.",
    "Ti hanno sottovalutato. La tua resistenza li sorprende e li costringe a riconsiderare l'attacco.",
    "Riesci a disarmarne uno, strappandogli l'arma di mano e cambiando le sorti dello scontro.",
    "Si ritirano tra minacce e insulti, lasciandoti ansimante, ferito ma vittorioso.",
    "Uno dei tuoi colpi manda in frantumi la maschera di uno, che si ritira urlando di dolore e rabbia.",
    "Sfrutti l'ambiente a tuo vantaggio, facendoli inciampare su macerie o cadere in una buca.",
    "Il tuo urlo di battaglia primordiale li fa esitare per un attimo cruciale, permettendoti di prendere il sopravvento."
];
const esitiLottaPredoniKo = [ // Rinominato da Attacca a Lotta per coerenza - REV: Maggiore impatto e varietà
    "Vieni sopraffatto e picchiato selvaggiamente, lasciato a terra tra polvere e sangue.",
    "Ti derubano di tutto, lasciandoti nudo e vulnerabile nella desolazione, la disperazione come unica compagna.",
    "La tua resistenza è vana. La superiorità numerica li rende un muro invalicabile. Ti travolgono.",
    "Una lama affilata e sporca ti squarcia la carne. Il dolore è accecante, il sangue caldo scorre copioso.",
    "Un colpo alla testa ti fa sprofondare nel buio. Ti risvegli ore dopo, derubato, ferito, solo e confuso.",
    "Combatti come una bestia in gabbia, ma sono troppi. Ti lasciano sanguinante, un passo dalla morte.",
    "Il loro capo ride mentre ti colpisce. 'Impara la lezione, scarto. Questo mondo non è per i deboli.'",
    "Un tubo di metallo ti spezza un osso con un rumore secco e nauseante prima che ti rubino tutto.",
    "Ti legano con filo spinato arrugginito, imbavagliandoti con uno straccio sudicio che sa di morte.",
    "Senti le costole incrinarsi sotto i calci. Ogni respiro è un'agonia, un pugnale nel fianco.",
    "Ti prendono a calci senza pietà mentre sei a terra, i loro volti contorti dalla crudeltà.",
    "La vista si oscura, i suoni si ovattano. Stai perdendo conoscenza per il dolore e la perdita di sangue.",
    "Ti gettano addosso un liquido infiammabile. Il terrore ti gela il sangue prima ancora della fiamma.",
    "Ti strappano l'equipaggiamento con violenza, distruggendo ciò che non possono portare via.",
    "Vieni trascinato via come un animale, prigioniero, verso un destino peggiore della morte."
];
const esitiParlaPredoniOk = [ // REV: Maggiore varietà e sfumature
    "Incredibilmente, le tue parole toccano una corda sepolta nel loro leader. Ti lasciano andare, forse per pietà, forse per stanchezza.",
    "Vedono in te un riflesso della loro stessa miseria o riconoscono la tua mancanza di minaccia. Ti fanno cenno di passare, indifferenti.",
    "Ti squadrano, valutano, poi uno sputa a terra. 'Vattene. E non farti rivedere.'",
    "Li convinci che sei più povero e disperato di loro, che non hai nulla che valga la pena rubare.",
    "Racconti una storia credibile e toccante che risveglia un barlume di umanità dimenticata in uno di loro.",
    "Baratti informazioni preziose (una fonte d'acqua, un pericolo imminente) in cambio del passaggio sicuro.",
    "Il tuo bluff è magistrale. Ti fai passare per un pazzo pericoloso o un emissario di una fazione temuta.",
    "Il capo riconosce un vecchio simbolo o rispetta un codice d'onore delle terre desolate. Ti lascia andare con un avvertimento.",
    "Offri una parte ragionevole delle tue scorte. Non è molto, ma accettano il tributo per evitarti guai.",
    "Capiscono che potresti essere utile in futuro come fonte di notizie o come possibile alleato temporaneo.",
    "Li avverti di un pericolo reale nelle vicinanze (una bestia, un'altra banda) e ti credono, lasciandoti andare per salvarsi.",
    "Condividi una vecchia canzone o una storia del mondo perduto. Un attimo di tregua inaspettata nel caos.",
    "Li convinci che sei malato o maledetto, che porti sfortuna, e preferiscono evitarti.",
    "Fai leva sulla loro superstizione con un racconto oscuro o un finto presagio.",
    "Il capo crede di riconoscerti o ti scambia per qualcun altro. Per questa volta, sei fortunato."
];
const esitiParlaPredoniKo = [ // REV: Maggiore impatto e varietà
    "'Belle parole, verme. Ma le parole non riempiono lo stomaco!' Ti attaccano senza ulteriore preavviso.",
    "Ridono sguaiatamente delle tue suppliche o minacce. 'Pensi di incantarci? Siamo predoni, non idioti!'",
    "Le tue parole rimbalzano sulla loro corazza di cinismo e brutalità. Non hanno alcun effetto.",
    "'Chiacchiere! Come i politici prima del Crollo! Non ci freghi!' Ringhiano.",
    "Il capo ti colpisce in faccia con il dorso della mano, facendoti tacere. 'Basta parole.'",
    "'Meno fiato sprecato, più roba utile! Svuota le tasche, ADESSO!' urla uno, brandendo un coltello.",
    "Le tue minacce, anche velate, li fanno solo infuriare. Provocare un branco affamato è stato un errore.",
    "Ti ascoltano in un silenzio glaciale, impassibili, poi attaccano all'unisono, senza preavviso.",
    "Ti vedono come debole, patetico. Un bersaglio facile che cerca di salvarsi con parole vuote.",
    "Non si fidano di te. Ogni parola è una bugia ai loro occhi. Sei solo carne da macello o un sacco da svuotare.",
    "'Storie? Ne abbiamo sentite di migliori dai cadaveri che lasciamo indietro.'",
    "Ti prendono in giro crudelmente. 'Guardatelo! Pensa di poter parlare con noi! Che ingenuo!'",
    "'Le tue scorte ci interessano più delle tue inutili parole. Consegnale.'",
    "Ti interrompono con un pugno nello stomaco che ti toglie il fiato e ogni speranza.",
    "Il capo ti sputa sugli stivali. 'Parlare non ti salva qui fuori. Solo la forza conta.'"
];
// Esiti Incontro Animale (Fuga/Attacco/Osserva)
const esitiEvitaAnimaleOk = [ // Rinominato da Fuga a Evita - REV: Maggiore varietà e specificità
    "Scivoli via come un fantasma, senza un suono, mentre la creatura è distratta da altro.",
    "Passi con cautela estrema, muovendoti solo quando non guarda. Ti ignora, forse sazia.",
    "Ti nascondi dietro un relitto metallico finché la bestia non si allontana, il cuore che martella.",
    "Sfrutti la copertura del terreno, passando da un'ombra all'altra, senza entrare nel suo campo visivo.",
    "Ti muovi controvento, lento e metodico. L'animale non avverte il tuo odore, ignaro.",
    "Ti immobilizzi, trattenendo il respiro, diventando una statua finché non passa oltre, disinteressata.",
    "Trovi un percorso alternativo tra la vegetazione mutata o le rovine, svanendo alla sua vista.",
    "La bestia è distratta da un rumore lontano o dall'odore di un'altra preda. Ne approfitti.",
    "Il rumore costante del vento o di un fiume copre i tuoi passi furtivi.",
    "Passi rapidamente nell'ombra più profonda, un guizzo quasi impercettibile.",
    "Ti allontani silenziosamente, lasciando la creatura alla sua esistenza solitaria e brutale.",
    "Il tuo basso profilo e la tua calma ti salvano da uno scontro potenzialmente letale.",
    "Lanci un sasso lontano, attirando la sua attenzione altrove, e fuggi nella direzione opposta.",
    "Ti appiattisci contro un muro freddo, aspettando pazientemente che si allontani nel suo territorio.",
    "La creatura sembra più interessata a marcare il suo territorio con fluidi nauseabondi che a cacciare. Ti ignora."
];
const esitiEvitaAnimaleKo = [ // Rinominato da Fuga a Evita - REV: Maggiore impatto e varietà
    "Troppo rumoroso! La bestia si volta di scatto, un ringhio basso e gutturale che vibra nell'aria.",
    "Sottovaluti i suoi sensi acuti. Ti individua nonostante la tua mimetizzazione.",
    "Un passo falso su un ramo secco, un suono che è la tua condanna. La bestia carica!",
    "Fai cadere qualcosa dal tuo zaino con un rumore sordo. Attiri la sua attenzione immediata.",
    "Il vento gira improvvisamente, portando il tuo odore dritto alle sue narici. Ti ha fiutato.",
    "Ti muovi troppo in fretta, troppo bruscamente. Il movimento ti tradisce nell'ombra.",
    "Non c'è via d'uscita. Il terreno è troppo aperto, sei esposto.",
    "Il tuo tentativo di nasconderti dietro un riparo fragile fallisce miseramente. Ti ha visto.",
    "Ti scopre all'ultimo secondo, quando pensavi fosse fatta. Un ruggito rabbioso squarcia l'aria.",
    "Emette un verso di sfida e si prepara a caricare, zampe che scavano il terreno!",
    "Ti punta dritto negli occhi, immobile per un istante, poi scatta verso di te.",
    "Calpesti schegge di vetro nel momento peggiore. Il suono cristallino è un invito all'attacco.",
    "Il tuo nascondiglio si rivela una trappola. La bestia ti blocca l'unica uscita.",
    "La creatura ti taglia la strada, costringendoti allo scontro.",
    "Senti il suo fiato caldo e fetido sul collo prima ancora di vederla. È troppo tardi."
];
const esitiSpaventaAnimaleOk = [ // Non più usato, ma tenuto per riferimento
    "Un urlo improvviso e disumano, unito a gesti minacciosi, lo fanno indietreggiare confuso.",
    "Una pietra ben lanciata colpisce vicino alla sua testa, convincendolo a cercare prede più facili altrove.",
    "Il tuo sguardo deciso e privo di paura lo intimorisce, facendolo allontanare con cautela.",
    "Batti le mani forte e ripetutamente, e la creatura, spaventata dal rumore insolito, fugge.",
    "Accendi brevemente una torcia potente, accecandolo temporaneamente e facendolo ritirare nell'ombra.",
    "Sbattendo violentemente un pezzo di metallo contro una roccia crei un rumore assordante che lo spaventa.",
    "Imiti il verso gutturale di un predatore più grande e temuto, e incredibilmente funziona!",
    "Mostri i denti e ringhi a tua volta, sembrando più pazzo e pericoloso di quanto tu sia realmente.",
    "Lo carichi urlando come un folle, e la sua reazione istintiva è la fuga, non lo scontro.",
    "Un odore forte e chimico (magari da qualcosa nel tuo zaino) lo fa arretrare disgustato.",
    "La tua improvvisa e inaspettata aggressività lo coglie completamente di sorpresa.",
    "Indietreggia lentamente, studiandoti, poi si volta e scappa nella direzione da cui è venuto.",
    "Agiti un telo o un pezzo di stoffa colorata, confondendolo e spaventandolo.",
    "Crei una piccola fiamma improvvisa con un accendino o un fiammifero, la vista del fuoco lo respinge.",
    "La tua voce assume un tono stranamente autoritario che sembra avere effetto sulla bestia."
];
const esitiSpaventaAnimaleKo = [ // Non più usato, ma tenuto per riferimento
    "La bestia mutata si infuria ancora di più per il tuo tentativo di intimidirla! Carica!",
    "Non sembra minimamente intimorito dalla tua presenza o dai tuoi gesti patetici.",
    "Il tuo tentativo lo rende solo più aggressivo e territoriale. Si prepara ad attaccare.",
    "Ti guarda con freddo disprezzo predatorio prima di lanciarsi all'attacco.",
    "Ringhia più forte, scoprendo zanne affilate, e si prepara a caricare senza esitazione.",
    "I tuoi gesti lo divertono soltanto, inclinando la testa prima di scattare.",
    "Ignora completamente i tuoi tentativi e continua ad avanzare minacciosamente.",
    "Ti carica senza preavviso, la tua intimidazione è stata inutile.",
    "Non è affatto impressionato, anzi, sembra più interessato.",
    "Sembra interpretare i tuoi gesti come una sfida diretta, che accetta volentieri.",
    "La tua tattica fallisce miseramente, rendendo la situazione peggiore.",
    "Emette un ruggito di sfida che ti gela il sangue nelle vene.",
    "Il tuo tentativo di spaventarlo lo fa solo concentrare meglio su di te come bersaglio.",
    "La bestia risponde alla tua minaccia con una dimostrazione di forza ancora maggiore.",
    "Sembra quasi divertito dalla tua audacia prima di attaccare."
];
const esitiAttaccoAnimaleOk = [ // REV: Maggiore varietà e impatto
    "Un colpo fortunato e ben piazzato la ferisce, facendola indietreggiare con un gemito.",
    "La ferisci abbastanza da farla sanguinare copiosamente. Decide che non vali la pena e fugge.",
    "La tieni a bada con una difesa disperata, guadagnando secondi preziosi per ritirarti.",
    "Un colpo critico! La creatura crolla a terra in un rantolo. La minaccia è neutralizzata.",
    "Dopo una lotta breve e furiosa, la bestia si ritira sanguinante, sconfitta per ora.",
    "La costringi alla fuga con una difesa tenace e qualche ferita che la rallenterà.",
    "Riesci a infliggergli una ferita dolorosa che lo rallenta e lo scoraggia.",
    "La accechi temporaneamente con polvere o un liquido irritante e ne approfitti per scappare.",
    "Colpisci un punto debole evidente (una vecchia ferita, una placca corazzata mancante), facendola barcollare.",
    "La tua difesa è sorprendentemente solida. Pari i suoi attacchi e la costringi a riconsiderare.",
    "Cade a terra gravemente ferita, contorcendosi. Non sarà più una minaccia.",
    "Si ritira nell'ombra, lasciando dietro di sé una scia di sangue scuro e denso.",
    "Con un colpo fortunato, le spezzi una zampa o un'ala, rendendola vulnerabile.",
    "La spingi o la attiri in una trappola naturale (crepaccio, sabbie mobili, fiume).",
    "La tua ferocia nello scontro la sorprende. Cerca una preda più facile, più docile."
];
const esitiAttaccoAnimaleKo = [ // REV: Maggiore impatto e varietà
    "Le sue zanne affondano nella tua carne come coltelli roventi. Urli di dolore.",
    "Vieni morso ferocemente e sbattuto a terra con violenza inaudita.",
    "La sua furia primordiale ti travolge. La tua difesa è inutile contro la sua potenza.",
    "Ti artiglia dolorosamente, strappando vestiti e pelle, lasciando solchi profondi.",
    "Vieni ferito gravemente nello scontro caotico. Il sangue ti annebbia la vista.",
    "Ti scaraventa via come una bambola di pezza contro un muro. Senti le ossa scricchiolare.",
    "Le sue difese naturali (pelle coriacea, scaglie, esoscheletro) sono impenetrabili.",
    "I tuoi colpi rimbalzano sulla sua corazza o pelliccia spessa. È inutile.",
    "Ti disarma con un colpo improvviso, la tua arma vola via nel buio. Sei vulnerabile.",
    "Cadi sotto i suoi colpi potenti e ripetuti, sopraffatto dalla sua forza.",
    "Ti morde a una gamba, senti l'osso incrinarsi, immobilizzandoti quasi.",
    "Il dolore acuto ti annebbia la vista, rendendo difficile reagire.",
    "Ti inietta un veleno che brucia nelle vene, paralizzandoti o confondendoti.",
    "La forza dell'impatto ti lascia senza fiato, stordito, incapace di reagire.",
    "Vieni afferrato e sbattuto ripetutamente contro il terreno, come un fuscello."
];
// Esiti Evento Tracce Strane
const descrizioniTracce = [ // REV: Maggiore varietà e specificità
    "Impronte innaturali, troppo grandi o troppo piccole per essere umane, solcano la polvere.",
    "Arbusti spezzati e terreno smosso indicano il passaggio recente di qualcosa di grosso e pesante.",
    "Macchie di sangue scuro e rappreso, testimoni silenziose di una lotta o una caccia recente.",
    "Impronte di stivali militari consumati si dirigono decise verso una struttura abbandonata.",
    "Ciuffi di pelliccia ruvida o piume insolite sono impigliati tra spine o rovi.",
    "Un solco profondo nel terreno molle, come se un corpo pesante fosse stato trascinato via.",
    "Bossoli di grosso calibro scintillano nella polvere, ricordo di uno scontro a fuoco violento.",
    "Impronte minuscole accanto a quelle più grandi... un adulto e un bambino in fuga?",
    "Un oggetto personale insolito (un ciondolo, un libro) giace abbandonato sul sentiero.",
    "Resti inequivocabili di un accampamento frettoloso: cenere ancora tiepida, rifiuti recenti.",
    "Impronte di pneumatici larghi e chiodati in un luogo dove nessun veicolo dovrebbe poter arrivare.",
    "Strani simboli geometrici tracciati nel fango vicino a una pozza d'acqua stagnante.",
    "Gocce di un liquido oleoso e iridescente segnano un percorso intermittente.",
    "Un messaggio lasciato con sassi disposti in modo particolare, un codice segreto?",
    "Il terreno è annerito e vetrificato in un'area circoscritta, come da un calore intenso."
];
const esitiSeguiTracceOkLoot = [ // REV: Maggiore varietà
    "Le tracce conducono a un piccolo anfratto nascosto con scorte ben conservate!",
    "Seguendo le impronte, trovi uno zaino strappato ma con ancora provviste utili all'interno.",
    "Chiunque fosse qui ha perso qualcosa... una borraccia piena d'acqua fresca!",
    "Scavi leggermente e scopri una cassa di legno marcia ma sigillata, piena di cibo.",
    "Le impronte terminano vicino a un cadavere... depredarlo sembra crudele, ma necessario.",
    "Un piccolo kit medico è impigliato tra i rovi, abbandonato nella fretta.",
    "Qualcuno ha sepolto qui delle scorte! Trovi cibo, acqua e qualche munizione.",
    "Le tracce finiscono vicino a un pacchetto impermeabile contenente carne essiccata e vitamine.",
    "Una sacca legata a un ramo basso, come un segnale. Contiene frutta secca e bende.",
    "Un nascondiglio dimenticato. Il proprietario non è più tornato a reclamare le sue cose.",
    "Trovi una piccola scorta di munizioni speciali avvolta in un panno unto.",
    "Le tracce portano a un kit di riparazione improvvisato ma sorprendentemente completo.",
    "Scopri una piccola sorgente nascosta o un sistema di raccolta dell'acqua piovana.",
    "Trovi delle batterie quasi cariche e un dispositivo elettronico parzialmente funzionante.",
    "Qualcuno ha lasciato cadere una mappa che segna un deposito di scorte o un punto d'interesse."
];
const esitiSeguiTracceOkLore = [ // REV: Maggiore varietà e specificità
    "Le tracce ti portano a un messaggio criptico inciso su un muro con un pezzo di metallo affilato.",
    "Trovi un data-slate danneggiato o un diario logoro vicino alle ultime impronte.",
    "Segui le tracce fino ai resti fumanti di un rituale inquietante o un esperimento fallito.",
    "Le impronte portano a una mappa parziale disegnata su pelle conciata, con simboli strani.",
    "Scopri uno strano simbolo dipinto con sangue o vernice su una roccia. L'hai già visto...",
    "Trovi una registrazione audio o video disturbata su un dispositivo abbandonato.",
    "Le tracce finiscono bruscamente davanti a un avvertimento: 'NON PROSEGUIRE. LORO ASCOLTANO'.",
    "Segui le impronte fino a un luogo sacro dimenticato o un altare improvvisato.",
    "Trovi un libro raro o un manuale tecnico parzialmente bruciato ma con informazioni cruciali.",
    "Le tracce appartengono a uno scienziato o un esploratore che stava documentando la zona.",
    "Scopri una vecchia fotografia o un oggetto personale che racconta una storia silenziosa.",
    "Le impronte conducono a un terminale rotto che mostra ancora un frammento di log o di mappa.",
    "Trovi un oggetto tecnologico sconosciuto o un manufatto di una civiltà perduta.",
    "Le tracce portano a un segnale radio debole o a un bunker nascosto.",
    "Scopri un messaggio in codice lasciato per qualcun altro, rivelando un segreto o un piano."
];
const esitiSeguiTracceOkPredoni = [ // REV: Maggiore impatto e varietà
    "Le tracce ti portano dritto in un'imboscata! Senti un fischio e sei circondato da figure ostili!",
    "Stavi seguendo predoni esperti... troppo esperti. Ora ti hanno visto. 'Guarda chi abbiamo qui!'",
    "Cadi goffamente in una trappola ben nascosta lungo il sentiero, una rete ti avvolge.",
    "Le tracce finiscono in uno spazio aperto... troppo aperto. È una trappola, ti stanno puntando!",
    "Ti rendi conto troppo tardi che le tracce erano un'esca per attirare viaggiatori solitari come te.",
    "Senti il click metallico di armi che vengono caricate da più direzioni. Sei in trappola!",
    "Mentre eri concentrato sulle tracce, loro ti stavano osservando, nascosti in silenzio.",
    "Ti attirano abilmente in un vicolo cieco. L'unica via d'uscita è bloccata.",
    "Le tracce erano fresche... troppo fresche. Senti una presenza minacciosa alle tue spalle.",
    "Mentre segui le tracce, attivi involontariamente un allarme silenzioso che li avverte.",
    "Le impronte ti conducono a un falso rifugio, una scenografia per un'imboscata mortale.",
    "Segui le tracce fino a un punto panoramico... diventando un bersaglio facile per un cecchino.",
    "Le tracce non erano dei predoni, ma di una delle loro vittime precedenti. Un'esca crudele.",
    "Mentre sei chino sulle tracce, non noti la trappola sonora che scatta al tuo passaggio.",
    "Ti conducono in un'area minata con esplosivi improvvisati. Senti un sibilo..."
];
const esitiSeguiTracceOkNulla = [ // REV: Maggiore varietà e frustrazione
    "Segui le tracce per un po', ma si perdono inspiegabilmente su un terreno roccioso.",
    "Le impronte finiscono bruscamente vicino a un precipizio o a un fiume impetuoso. Impossibile proseguire.",
    "Il vento o una pioggia recente hanno cancellato ogni segno. La pista è fredda.",
    "Le tracce si confondono con decine di altre, un labirinto di impronte indecifrabile.",
    "Chiunque fosse, sapeva come svanire nel nulla, un vero fantasma delle terre desolate.",
    "Si disperdono in direzioni diverse, rendendo impossibile scegliere quale seguire.",
    "Probabilmente si sono arrampicati o hanno usato un percorso non convenzionale. Persi.",
    "Le tracce si interrompono senza motivo apparente. Frustrante.",
    "Un vicolo cieco. Tanta fatica per nulla. Il mondo si prende gioco di te.",
    "Le tracce portano a una frana recente che ha obliterato ogni segno successivo.",
    "Sembra che le tracce siano state deliberatamente cancellate o confuse da qualcuno.",
    "Le impronte svaniscono vicino a una zona con radiazioni elevate. Meglio non proseguire.",
    "Segui le tracce fino a un muro di macerie impenetrabile. Fine della corsa.",
    "Il terreno cambia drasticamente, rendendo impossibile seguire oltre.",
    "Hai perso troppo tempo. Qualunque cosa fosse, è ormai lontana."
];
const esitiSeguiTracceKo = [ // REV: Maggiore impatto e varietà
    "Non riesci a decifrare le tracce confuse. Ti perdi, sprecando tempo prezioso.",
    "Segui le tracce sbagliate e finisci in un'area pericolosa o senza uscita.",
    "Mentre sei concentrato a terra, non noti una trappola o un pericolo imminente!",
    "Perdi ore seguendo una pista fredda, consumando risorse vitali inutilmente.",
    "Le tracce ti portano involontariamente in una zona tossica o infestata da creature.",
    "Finisci per girare in tondo, frustrato e disorientato, tornando al punto di partenza.",
    "La fatica mentale ti impedisce di concentrarti. Rinunci, sconfitto.",
    "Il sole sta calando e non sei più in grado di distinguere i segni. Devi fermarti.",
    "Una tempesta di polvere o una pioggia improvvisa cancellano ogni traccia in pochi minuti.",
    "Sei stanco, affamato e frustrato. Lasciar perdere è l'unica opzione sensata.",
    "Interpreti male un segno cruciale e finisci in un vicolo cieco o in pericolo.",
    "La scarsa visibilità (buio, nebbia) rende impossibile proseguire la ricerca.",
    "Ti distrai un attimo e perdi irrimediabilmente la pista.",
    "Confondi le tracce umane con quelle di un animale, perdendo tempo prezioso.",
    "La stanchezza fisica ti annebbia la vista. Non riesci più a distinguere i dettagli."
];
// Esiti Villaggio Ostile
const descrizioniVillaggioOstile = [ // REV: Maggiore tensione e dettagli
    "Figure silenziose emergono dalle baracche, occhi diffidenti che ti scrutano, armi pronte.",
    "Ti osservano immobili da dietro barricate improvvisate, il silenzio carico di ostilità.",
    "Un uomo con una cicatrice profonda sul volto ti fa cenno di fermarti, la mano su un'arma arrugginita.",
    "L'aria è pesante, carica di tensione. Non sei il benvenuto qui.",
    "'Fermo! Straniero! Cosa vuoi?' intima una voce roca da una feritoia rinforzata.",
    "Sentinelle armate compaiono sui tetti improvvisati, puntandoti contro.",
    "Archi tesi, fucili modificati, balestre artigianali. Sono pronti a difendersi.",
    "Vedi bambini dagli occhi spaventati trascinati via, al riparo nelle strutture più interne.",
    "L'atmosfera è elettrica, un misto di paura e aggressività repressa.",
    "Nessuno sorride. Volti chiusi, induriti dalle difficoltà e dalla diffidenza.",
    "Sembrano pronti a tutto per difendere il loro misero angolo di mondo.",
    "Ti squadrano da capo a piedi, giudicando la tua forza, le tue intenzioni, la tua debolezza.",
    "Senti il click metallico e sinistro di sicure che vengono tolte.",
    "Cani mutati ringhiano sommessamente dalle loro catene, pronti a scattare.",
    "Le loro difese sono rudimentali ma efficaci: filo spinato, vetri rotti, punte acuminate."
];
const esitiVillaggioOstileAllontanati = [ // REV: Maggiore varietà
    "Ti allontani lentamente, senza mai voltare completamente le spalle. Senti i loro occhi su di te.",
    "Fai dietrofront con cautela, mani bene in vista. Non vale la pena disturbare questo vespaio.",
    "Capiscono che non cerchi guai. Ti lasciano andare, tornando alla loro cupa vigilanza.",
    "Ti osservano finché non scompari dietro una collina o tra le rovine. Poi il silenzio.",
    "Un sospiro di sollievo ti sfugge quando sei finalmente a distanza di sicurezza. Pericolo scampato.",
    "Meglio cercare fortuna altrove. Questo posto odora di morte e paranoia.",
    "La prudenza è la tua migliore alleata. Hai evitato uno scontro inutile.",
    "Hai risparmiato risorse preziose, forse la vita stessa. Saggia decisione.",
    "Ti dilegui nell'ambiente, un'ombra che si allontana senza lasciare traccia.",
    "Si assicurano solo che tu te ne vada davvero, senza ripensamenti.",
    "Nessun problema, per ora. Ma la sensazione di essere osservato persiste.",
    "Senti ancora i loro sguardi puntati sulla schiena finché non sei lontano.",
    "Ti lanciano un ultimo sguardo carico di sospetto prima di tornare alle loro postazioni.",
    "Ti senti sconfitto, respinto, ma vivo. È quello che conta.",
    "Il silenzio che segue la tua ritirata è pesante, carico di ciò che sarebbe potuto accadere."
];
const esitiVillaggioOstileNegoziaOk = [ // REV: Maggiore varietà e sfumature
    "Dopo una trattativa tesa, ti concedono con riluttanza il passaggio. 'Non fermarti. Non guardare. Vai.'",
    "Riesci a convincerli della tua neutralità. Ti vedono come un altro disperato, non una minaccia.",
    "Scambiano qualche parola diffidente, poi ti ignorano, tornando a scrutare l'orizzonte minaccioso.",
    "Accettano un piccolo baratto (cibo, medicine, informazioni) per il diritto di passaggio.",
    "Riconoscono un simbolo che porti (un tatuaggio, un oggetto) o un nome che menzioni. Ti lasciano passare.",
    "Capiscono che non appartieni alle fazioni che temono (predoni, cultisti, mutanti). Ti tollerano.",
    "Il loro capo, dopo averti scrutato negli occhi, fa un cenno quasi impercettibile. Puoi passare.",
    "Apprezzano la tua onestà disarmante o la tua evidente mancanza di risorse preziose.",
    "Ti danno un avvertimento criptico ma sincero su un pericolo imminente sulla tua strada.",
    "La tensione si allenta leggermente, anche se la diffidenza rimane come una barriera invisibile.",
    "Ti permettono di riempire la borraccia alla loro fonte d'acqua comune prima di cacciarti via.",
    "Un anziano interviene, placando gli animi. 'È solo un viaggiatore. Lasciatelo andare.'",
    "Condividi informazioni utili su un percorso alternativo e ti guadagni il passaggio.",
    "Offri aiuto per riparare qualcosa e ottieni la loro temporanea e sospettosa fiducia.",
    "Li convinci di portare notizie importanti da un alleato lontano."
];
const esitiVillaggioOstileNegoziaKo = [ // REV: Maggiore impatto e varietà
    "I tuoi tentativi falliscono. 'Vattene! Subito! O ti riempiamo di buchi!' ringhia il capo.",
    "'Non vogliamo estranei! Porti solo guai e malattie! Sparisci!'",
    "Ti lanciano sassi e rifiuti. Il messaggio è chiaro: non sei il benvenuto.",
    "Le tue parole suonano false alle loro orecchie. Ti vedono come un bugiardo o un pazzo.",
    "Ti accusano di essere una spia o un predone travestito. 'Lo vediamo nei tuoi occhi!'",
    "Alzano le armi all'unisono. La situazione sta per precipitare.",
    "Qui non c'è spazio per la diplomazia. Solo per la paura e la violenza.",
    "La loro ostilità aumenta visibilmente, senti il pericolo crescere.",
    "Ti spingono via rudemente con la forza, quasi facendoti cadere.",
    "'Ultimo avvertimento, verme! Sparisci!' urla uno di loro, sputando per terra.",
    "Ti deridono per la tua ingenuità nel pensare di poter parlare con loro.",
    "Capisci istintivamente che è ora di andartene. Molto in fretta.",
    "La tua offerta di baratto viene considerata un insulto e respinta con rabbia.",
    "Ti accusano di portare malattie o sfortuna al loro accampamento.",
    "Uno di loro spara un colpo di avvertimento molto vicino ai tuoi piedi."
];
// Esiti Pericolo Ambientale
const descrizioniPericoloAmbientaleAgilita = [ // REV: Maggiore varietà e specificità
    "Il terreno cede sotto i tuoi piedi! Una voragine si apre nell'oscurità!",
    "Una trappola a scatto arrugginita scatta dalle foglie secche, lame pronte a mordere!",
    "Sfiori un filo quasi invisibile... senti un click sinistro provenire dal muro!",
    "Una lastra di cemento si inclina pericolosamente, minacciando di farti scivolare nel vuoto!",
    "Il soffitto marcio crolla all'improvviso, una pioggia di detriti pesanti e polvere!",
    "Scivoli su una macchia di liquido oleoso e scuro, perdendo l'equilibrio!",
    "Un pesante contenitore metallico si stacca da uno scaffale e precipita verso di te!",
    "Metti il piede in fallo in una buca nascosta. Senti una torsione dolorosa alla caviglia.",
    "Una porta blindata si stacca dai cardini arrugginiti e ti cade addosso!",
    "Dardi silenziosi scattano da fessure nascoste, ricoperti di una sostanza scura!",
    "Sfiori cavi elettrici scoperti che sfrigolano e lanciano scintille minacciose!",
    "Il pavimento di legno marcio cede di schianto, rivelando una caduta nel buio!",
    "Un veicolo abbandonato inizia a scivolare silenziosamente verso di te su un pendio.",
    "Una pila instabile di barili arrugginiti inizia a rotolare nella tua direzione.",
    "Una trappola a rete pesante scatta dal soffitto, pronta ad avvolgerti e immobilizzarti."
];
const descrizioniPericoloAmbientalePresagio = [ // REV: Maggiore varietà e specificità sensoriale
    "Una pioggia fine di polvere e piccoli detriti ti avverte di un crollo imminente!",
    "Senti uno scricchiolio sinistro e prolungato, il lamento del metallo che sta per cedere!",
    "Un odore acre e chimico ti pizzica le narici, avvertendoti di gas tossici!",
    "Hai la fortissima sensazione di essere osservato... un istante dopo senti un sibilo vicino all'orecchio!",
    "Un ronzio elettrico crescente e una sensazione di formicolio sulla pelle indicano un pericolo elettrico!",
    "Noti delle crepe sottili ma profonde nel terreno, proprio dove stavi per mettere il piede!",
    "L'aria diventa improvvisamente pesante, densa, quasi difficile da respirare!",
    "Senti il terreno vibrare leggermente ma distintamente sotto i tuoi piedi. Qualcosa sta arrivando.",
    "Un lampo accecante seguito da un silenzio innaturale preannuncia un'onda d'urto o un'esplosione.",
    "Vedi uno strano tremolio nell'aria, una distorsione visiva che nasconde un pericolo invisibile.",
    "Un odore dolciastro e stantio indica la presenza di spore fungine velenose o parassitarie.",
    "Pelle d'oca e un brivido freddo lungo la schiena. Il tuo istinto urla: PERICOLO!",
    "Un silenzio innaturale e improvviso cala sull'ambiente. Troppo silenzioso.",
    "Vedi delle deboli fluttuazioni energetiche o particelle sospese nell'aria davanti a te.",
    "La temperatura cambia bruscamente: un freddo glaciale o un caldo soffocante e innaturale."
];
const esitiPericoloAmbientaleEvitato = [ // REV: Maggiore dinamismo
    "Riflessi fulminei! Eviti il peggio per un soffio, il cuore in gola!",
    "Il tuo istinto di sopravvivenza ti salva, facendoti balzare via all'ultimo istante!",
    "Balzi indietro o di lato appena in tempo, sentendo il vento del pericolo sulla pelle!",
    "Ti fermi un millisecondo prima di attivare la trappola o finire sotto il crollo!",
    "Schivi l'ostacolo o il proiettile con un'agilità felina che ti sorprende!",
    "Ti getti a terra istintivamente mentre il pericolo sfreccia innocuo sopra di te!",
    "Riesci a stabilizzare la struttura o a disinnescare la trappola con mano ferma!",
    "Tagli un filo o blocchi un ingranaggio, interrompendo il meccanismo mortale!",
    "Prontezza di spirito e lucidità ti salvano ancora una volta da una morte stupida!",
    "Un movimento quasi inconscio ti porta fuori dalla traiettoria del disastro!",
    "Noti un dettaglio quasi invisibile che rivela la trappola nascosta!",
    "Eviti il pericolo per un soffio, il cuore che batte all'impazzata.",
    "Rotoli via all'ultimo secondo, sentendo l'impatto vicino a te.",
    "Devii l'oggetto pericoloso con un calcio o una spinta ben assestata.",
    "Ti aggrappi a una sporgenza, dondolando sul vuoto ma salvo."
];
const esitiPericoloAmbientaleColpito = [ // REV: Maggiore impatto e varietà
    "Troppo lento! Vieni colpito in pieno, un dolore accecante ti travolge!",
    "La trappola scatta con uno schiocco sinistro. Urli di dolore mentre ti ferisce.",
    "Vieni travolto dai detriti pesanti, che ti feriscono e ti bloccano.",
    "Una fitta lancinante! Senti qualcosa rompersi o slogarsi con un rumore orribile.",
    "Cadi rovinosamente, battendo la testa. La vista si annebbia, perdi l'orientamento.",
    "Schegge affilate si conficcano nella tua carne, causando ferite multiple.",
    "Il gas tossico ti riempie i polmoni. Barcolli, tossendo, la nausea ti assale.",
    "Una potente scossa elettrica ti attraversa il corpo, paralizzandoti e bruciandoti.",
    "Il pavimento cede. Precipiti nel buio, atterrando malamente tra le macerie.",
    "Vieni colpito da un dardo avvelenato. Senti il veleno bruciare e diffondersi rapidamente.",
    "La caduta ti lascia senza fiato e coperto di lividi dolorosi.",
    "Il tuo urlo di dolore involontario riecheggia, attirando attenzioni indesiderate.",
    "Vieni investito da un'ondata di calore estremo o freddo glaciale che ti danneggia.",
    "Una sostanza corrosiva ti schizza addosso, bruciando la pelle e l'equipaggiamento.",
    "Vieni avvolto da una rete appiccicosa o immobilizzato da una trappola paralizzante."
];
// Esiti Dilemma Morale
const descrizioniDilemmaMorale = [ // REV: Maggiore varietà e impatto emotivo
    "Grida soffocate e rumori di lotta violenta provengono da un edificio vicino. Qualcuno sta soffrendo.",
    "Fumo nero si leva da dietro una collina, accompagnato da spari sporadici e urla disperate.",
    "Una figura corre verso di te, terrorizzata, inseguita da altre figure armate e implacabili.",
    "Trovi una cassa sigillata con uno strano simbolo pulsante. Sembra importante, ma emana un'aura sinistra.",
    "Un bambino piccolo piange da solo tra i cadaveri, perso e terrorizzato in un mondo troppo crudele.",
    "Qualcuno è intrappolato sotto macerie pesanti, cosciente, lo sguardo fisso nel tuo, implorando aiuto.",
    "Un gruppo brutale sta linciando pubblicamente un individuo legato, tra le risate e gli insulti della folla.",
    "Trovi scorte ben nascoste, chiaramente appartenenti a qualcun altro. Sembrano abbandonate... ma lo sono davvero?",
    "Un individuo losco ti offre aiuto o informazioni preziose, ma il suo sguardo è sfuggente e le sue mani sporche.",
    "Devi scegliere: usare le tue ultime medicine per te stesso o per salvare uno sconosciuto in fin di vita?",
    "Scopri un segreto (acqua pulita, un passaggio sicuro) che potrebbe salvare te, ma mettere in pericolo altri.",
    "Trovi un prigioniero debole e delirante, lasciato a morire di fame e sete in una gabbia.",
    "Un mercante ti offre un oggetto potente, ma riconosci che è stato rubato a qualcuno che ne aveva bisogno.",
    "Assisti impotente a una pattuglia che maltratta civili inermi, la loro crudeltà gratuita ti disgusta.",
    "Trovi una mappa per un presunto 'paradiso sicuro', ma l'istinto ti dice che è troppo bello per essere vero."
];
const esitiDilemmaMoraleIndagaOkPositivo = [ // REV: Risultati più tangibili e vari
    "Intervieni con coraggio e salvi un innocente. Ti ricompensa con provviste preziose o informazioni vitali.",
    "Segui il fumo e arrivi dopo lo scontro. Trovi armi, munizioni e equipaggiamento utile tra i caduti.",
    "Aiuti l'inseguito a fuggire. Era un corriere con un messaggio importante o un carico prezioso che condivide.",
    "Liberi la persona intrappolata. Per gratitudine, ti rivela la posizione di un nascondiglio segreto.",
    "Riesci a placare la folla o a dimostrare l'innocenza dell'accusato. Guadagni rispetto e forse un alleato.",
    "Consoli il bambino e lo porti in salvo. Trovi una ricompensa lasciata dai genitori o attiri l'attenzione di una fazione benevola.",
    "Il prigioniero liberato, una volta ripresosi, si rivela essere un abile artigiano o un medico.",
    "Sventi un sabotaggio o un tradimento. Gli abitanti ti ricompensano con ospitalità e risorse.",
    "La tua buona azione viene notata. Trovi un dono anonimo (cibo, medicine) lungo il tuo cammino.",
    "Salvi lo sconosciuto. Più tardi, ti ripaga con interessi o si unisce a te, dimostrandosi un compagno leale.",
    "La cassa contiene tecnologia antica funzionante, medicine rare o dati preziosi.",
    "Distrai la pattuglia, permettendo ai civili di fuggire. Uno di loro ti dà un talismano fortunato.",
    "L'individuo sospetto era un informatore sotto copertura. Le sue informazioni sono cruciali.",
    "Le scorte abbandonate contengono un oggetto unico o un componente raro per il crafting.",
    "Il segreto che scopri può essere usato per negoziare o per evitare un pericolo maggiore."
];
const esitiDilemmaMoraleIndagaOkNegativo = [ // REV: Risultati più tragici e vari
    "Arrivi troppo tardi. Solo cadaveri e il fetore della morte. Il tuo intervento sarebbe stato inutile.",
    "Era una trappola! Le grida erano un'esca. I predoni ti attaccano da tutte le direzioni.",
    "L'inseguito era un criminale pericoloso. I suoi inseguitori, giustizieri o rivali, ora ti vedono come un complice.",
    "Cerchi di aiutare, ma la situazione precipita. Un crollo, un'esplosione, un attacco improvviso. Vieni coinvolto.",
    "Salvi la persona sbagliata. Si rivela un traditore, un pazzo o un mostro che ti attacca.",
    "Il bambino ti conduce involontariamente verso un pericolo nascosto o una trappola mortale.",
    "La folla inferocita si rivolta contro di te per esserti intromesso. Diventi il nuovo capro espiatorio.",
    "La cassa è protetta da una trappola mortale (esplosiva, biologica) che scatta appena la tocchi.",
    "Non riesci a liberare la persona intrappolata in tempo. Assisti impotente alla sua morte lenta.",
    "Il prigioniero liberato, una volta libero, ti attacca per rubare le tue cose.",
    "Vieni scoperto mentre indaghi e accusato ingiustamente del crimine che cercavi di impedire.",
    "L'individuo losco ti tradisce, dandoti informazioni false o attirandoti in un'imboscata.",
    "Le scorte abbandonate erano un'esca per una trappola o erano contaminate.",
    "Il tuo intervento contro la pattuglia provoca ritorsioni peggiori sui civili in seguito.",
    "La mappa per il paradiso era una trappola per attirare vittime in un luogo di morte."
];
const esitiDilemmaMoraleIndagaKo = [ // Fallimento check Presagio - REV: Risultati più vari
    "Sottovaluti la situazione. Il tuo intervento maldestro peggiora le cose, causando più vittime.",
    "Non riesci a trovare la fonte del problema in tempo. Vaghi inutilmente mentre la tragedia si compie.",
    "Vieni sopraffatto dagli eventi. Troppo violenti, troppo complessi per te.",
    "Non capisci chi sia il vero nemico. Prendi la decisione sbagliata, con conseguenze fatali.",
    "Esiti troppo a lungo. L'opportunità di agire (o il disastro) si conclude senza di te.",
    "Il tuo intervento, seppur ben intenzionato, scatena una catena di eventi negativi imprevisti.",
    "Ti perdi nel caos, incapace di raggiungere il luogo dell'azione in tempo.",
    "Ti rendi conto di non avere le risorse o le forze per fare la differenza. Un senso di impotenza ti schiaccia.",
    "Ti ritiri confuso e frustrato, tormentato dal dubbio di ciò che avresti potuto fare.",
    "Le tue azioni hanno conseguenze impreviste e dannose per te o per altri innocenti.",
    "Vieni scoperto mentre cerchi di capire la situazione e costretto a una fuga precipitosa.",
    "Interpreti male i segnali e aiuti la fazione sbagliata o cadi in una trappola.",
    "Il tuo tentativo di mediazione fallisce, scatenando uno scontro ancora più violento.",
    "Non riesci a superare un ostacolo (serratura, macerie) per intervenire in tempo.",
    "Vieni ferito o catturato mentre cerchi di capire cosa sta succedendo."
];
const esitiDilemmaMoraleIgnora = [ // REV: Maggiore enfasi sul peso emotivo
    "Decidi freddamente di proseguire. La sopravvivenza non lascia spazio ai sentimentalismi.",
    "Ignori le grida, il fumo, la sofferenza. Tiri dritto, cercando di non pensare.",
    "Volti le spalle, un peso gelido che si deposita sullo stomaco. Non ti guardi indietro.",
    "Non sono affari tuoi. Hai già abbastanza problemi. Ti concentri sulla tua strada.",
    "Fingi di non aver visto nulla. Mantieni un'espressione neutra, ma dentro qualcosa si incrina.",
    "Accelera il passo, cercando di allontanarti il più possibile dalla scena, dalla scelta.",
    "Chiudi gli occhi per un istante, poi prosegui. Cerchi di cancellare l'immagine, il suono.",
    "Non puoi salvare tutti. È la dura legge di questo mondo spezzato. Lo ripeti a te stesso.",
    "Spegni l'empatia come un interruttore. Diventi freddo, pragmatico, concentrato sull'obiettivo.",
    "Un'altra tragedia silenziosa. Il mondo ne è pieno. Continui il tuo viaggio solitario.",
    "Forse hai fatto la scelta giusta per te. Forse hai condannato qualcuno. Non lo saprai mai.",
    "Il silenzio che segue sembra accusatorio, pesante come un macigno.",
    "Ti chiedi se avresti potuto fare qualcosa. Scacci il pensiero. È inutile, ora.",
    "Prosegui, ma l'immagine ti tormenterà nei sogni futuri.",
    "Senti un brivido, come se qualcosa avesse notato la tua indifferenza."
];
// Esiti Evento Rifugio (Ispezione)
const descrizioniRifugioStrano = [ // REV: Maggiore varietà e mistero
    "Una sezione del muro ha un suono diverso quando la picchietti. Sembra vuota dietro.",
    "Un contenitore metallico arrugginito è nascosto sotto stracci. È stranamente pesante.",
    "Un simbolo familiare, visto su vecchie mappe o graffiti cultisti, è inciso sul pavimento.",
    "Una mattonella del pavimento è leggermente rialzata, come se nascondesse qualcosa.",
    "Noti un piccolo interruttore o un pulsante quasi invisibile dietro una tubatura.",
    "C'è una scritta tracciata con la polvere sotto un giaciglio: un avvertimento o un indizio?",
    "Una lamiera sulla parete sembra fissata in modo rudimentale, forse uno sportello nascosto.",
    "Un piccolo foro nel muro, troppo regolare per essere casuale, da cui spira aria fredda.",
    "Una parte del pavimento emette un suono cavo sotto i tuoi stivali.",
    "Uno schema complesso di graffi vicino a una crepa nel muro attira la tua attenzione.",
    "Un vecchio libro è lasciato aperto su una pagina specifica, sottolineata.",
    "Un odore metallico o chimico proviene da dietro un cumulo di macerie.",
    "Una luce fioca e intermittente filtra da sotto una porta sprangata dall'interno.",
    "Un cavo elettrico scompare dietro un pannello metallico ammaccato.",
    "Una chiave arrugginita pende da un chiodo nascosto dietro un manifesto strappato."
];
const esitiRifugioIspezionaOkLoot = [ // REV: Maggiore varietà e utilità
    "Dietro il muro cavo trovi un piccolo vano segreto con scorte preziose!",
    "Forzando il contenitore, scopri munizioni rare o componenti elettronici avanzati!",
    "Sotto la mattonella: acqua purificata, medicine e una mappa parziale!",
    "L'interruttore apre uno scomparto nascosto con un kit medico quasi intatto!",
    "Dietro la lamiera mobile: cibo a lunga conservazione e un attrezzo utile!",
    "Nascosti qui: batterie ad alta capacità e materiali per riparazioni.",
    "Scopri un kit di pronto soccorso militare o un set di attrezzi specializzati.",
    "Nel foro nel muro trovi un piccolo pacchetto impermeabile con fiammiferi antivento e esche.",
    "Sotto il pavimento cavo: una piccola scorta di carburante o un filtro per l'acqua.",
    "Il libro contiene una nota nascosta che indica un deposito di scorte vicino.",
    "Dietro le macerie: un generatore portatile danneggiato ma riparabile.",
    "La porta sprangata nasconde una piccola armeria o un laboratorio improvvisato.",
    "Il pannello metallico nasconde componenti rari o un dispositivo tecnologico.",
    "La chiave apre una cassa metallica ben nascosta piena di risorse.",
    "La scritta nella polvere indica un punto preciso dove scavare per trovare scorte."
];
const esitiRifugioIspezionaOkLore = [ // REV: Maggiore varietà e mistero
    "Il simbolo inciso appartiene a una fazione dimenticata o a un culto oscuro.",
    "Trovi un messaggio logoro che avverte di 'ombre che cantano' o di 'acqua che mente'.",
    "Dietro il muro c'è un vecchio terminale olografico, spento ma con dati recuperabili.",
    "La scritta è una coordinata, un codice o un frammento di una profezia inquietante.",
    "Trovi una mappa dettagliata che indica bunker, tunnel o zone pericolose.",
    "Scopri un diario personale o un log audio che rivela segreti sul passato o sul luogo.",
    "Il simbolo è la chiave per decifrare un messaggio criptico trovato altrove!",
    "Dal foro nel muro senti voci in una lingua sconosciuta o musica distorta.",
    "I graffi formano una mappa stellare o un diagramma tecnologico complesso.",
    "Il libro è un testo proibito o un manuale scientifico con annotazioni rivelatrici.",
    "L'odore proviene da un esperimento fallito o da un campione biologico alieno.",
    "La luce proviene da un terminale ancora attivo con log corrotti ma intriganti.",
    "Il cavo alimenta un dispositivo sconosciuto che sembra monitorare attività psichica.",
    "La chiave apparteneva a un membro di una setta o di un'organizzazione segreta.",
    "La scritta è un avvertimento lasciato da un viaggiatore del tempo o da un profeta pazzo."
];
const esitiRifugioIspezionaKoTrappola = [ // REV: Maggiore varietà e specificità
    "Trappola! Rimuovendo il muro scatta una piccola carica esplosiva o una nube di gas!",
    "Il contenitore era protetto da un ago avvelenato o una scarica elettrica!",
    "Mentre ispezioni, qualcosa di pesante cade dall'alto o il pavimento cede sotto di te!",
    "La mattonella smossa nasconde una trappola a pressione: gas, dardi o un allarme!",
    "L'interruttore sbagliato attiva una sirena assordante, luci stroboscopiche o rilascia una creatura!",
    "Vieni punto, tagliato o folgorato dal meccanismo di apertura della lamiera.",
    "Una potente scarica elettrica ti attraversa mentre cerchi di forzare il contenitore.",
    "Il foro nel muro nascondeva un piccolo dardo soporifero o allucinogeno!",
    "Il pavimento cede, facendoti cadere in una fossa con punte, liquido corrosivo o creature.",
    "I graffi erano un avvertimento! Attivi una trappola sonora che attira predatori.",
    "Il libro è collegato a una trappola esplosiva o a un meccanismo che sigilla il rifugio.",
    "L'odore proviene da una sostanza chimica corrosiva o da spore che causano malattie.",
    "La porta bloccata è protetta da una scarica elettrica letale o da un meccanismo di difesa.",
    "Il pannello metallico nasconde cavi scoperti o rilascia una scarica energetica.",
    "La chiave è collegata a un meccanismo che fa crollare parte del rifugio o rilascia veleno."
];
const esitiRifugioIspezionaKoNulla = [ // REV: Maggiore varietà
    "È solo una macchia, un'ombra, un rumore innocuo. La tua paranoia ti gioca brutti scherzi.",
    "Il contenitore è vuoto, arrugginito, inutile. Tempo sprecato.",
    "Il simbolo è solo un graffito senza senso, opera di un vandalo o di un pazzo.",
    "La mattonella è solo smossa. Nessun segreto, nessun tesoro.",
    "L'interruttore è rotto, non collegato a nulla. Non succede niente.",
    "La scritta è illeggibile, cancellata dal tempo o semplicemente uno scarabocchio.",
    "Era solo la tua immaginazione o la luce ingannevole. Non c'è niente qui.",
    "Dopo un'attenta ispezione, concludi che non c'è nulla di valore o di nascosto.",
    "Il suono cavo era solo un'illusione acustica.",
    "I graffi sono casuali, opera del tempo o di animali.",
    "Il libro è un romanzo rosa o un manuale di istruzioni inutile.",
    "L'odore proviene da muffa, animali morti o semplice sporcizia.",
    "La porta è sprangata e non si apre. Fine della storia.",
    "Il pannello copre solo tubature vuote e arrugginite.",
    "La chiave non apre nulla in questo rifugio. Forse apparteneva a un altro luogo."
];
const esitiRifugioLasciaPerdere = [ // Scelta 'Lascia perdere' nell'ispezione rifugio - REV: Maggiore varietà emotiva
    "Meglio non rischiare. La prudenza è la madre della sopravvivenza.",
    "La curiosità è un lusso che non puoi permetterti. Lasci stare.",
    "Ignori il dettaglio sospetto. Hai cose più importanti a cui pensare.",
    "Decidi che la sicurezza viene prima di un possibile, ma incerto, guadagno.",
    "Non hai un buon presentimento. L'istinto ti dice di non toccare nulla.",
    "Forse era qualcosa di importante, forse una trappola. Non lo saprai mai. E va bene così.",
    "Osservi, memorizzi, ma non agisci. Forse tornerai, forse no.",
    "Valuti che il rischio è troppo alto. Non ne vale la pena.",
    "L'istinto ti sussurra di non disturbare ciò che dorme.",
    "Risparmi tempo ed energie preziose per il viaggio.",
    "Ti concentri sulla mappa, sul cibo, sull'acqua. L'essenziale.",
    "Frugare potrebbe fare rumore, attirare attenzioni. Meglio di no.",
    "Decidi di non danneggiare ulteriormente questo fragile rifugio.",
    "Sei troppo stanco e provato per metterti a fare l'esploratore.",
    "Chi ha nascosto qualcosa qui, lo ha fatto per un motivo. Rispetta la sua scelta."
];
// Esiti Eventi Notturni Specifici
const descrizioniPredoniNotturni = [ // Non attualmente usati specificamente, ma potrebbero - REV: Maggiore atmosfera e pericolo
    "Figure silenziose emergono dall'oscurità come incubi fatti carne, occhi che brillano debolmente.",
    "Sfruttano il buio come un mantello, tendendoti un'imboscata silenziosa e letale.",
    "Senti il loro respiro affannoso e l'odore acre di sudore e sporco prima ancora di vederli.",
    "Passi furtivi ti circondano nell'oscurità opprimente. Sei caduto nella loro rete notturna.",
    "Occhi rossi o gialli brillano brevemente nel buio, fissandoti come predatori.",
    "Ti aspettavano nell'ombra, pazienti come ragni, conoscendo le abitudini delle prede notturne.",
    "Il buio li rende più audaci, più crudeli. La loro umanità sembra svanire con la luce del sole.",
    "Sembrano spettri vendicativi emersi dalla notte per reclamare la tua anima... e le tue scorte.",
    "Un'imboscata perfetta. Silenziosa, coordinata, letale. Sei in trappola.",
    "Il freddo della notte e la loro presenza minacciosa ti gelano il sangue e la volontà.",
    "Si muovono con una coordinazione inquietante, come un branco di lupi o uno sciame di insetti.",
    "Comunicano con fischi bassi, schiocchi di lingua o gesti quasi impercettibili.",
    "Le loro armi sono annerite o modificate per non riflettere la luce lunare.",
    "Indossano maschere grottesche fatte di ossa, pelle umana o rottami metallici.",
    "I loro occhi sono adattati al buio, vedono movimenti che tu puoi solo immaginare."
];
const descrizioniAnimaleNotturno = [ // REV: Maggiore varietà e specificità sensoriale
    "Due pupille verticali e luminose ti fissano dal buio, immobili, prive di emozione.",
    "Un ringhio basso e vibrante proviene da un cespuglio oscuro. Senti il terreno tremare leggermente.",
    "Una creatura rapida e silenziosa, dalle forme fluide e innaturali, striscia verso di te.",
    "Un odore forte e muschiato, misto a decomposizione, ti avverte della presenza di un predatore.",
    "Senti il raschiare di artigli chitinosi o ossei sulla pietra o sul metallo vicino.",
    "Un'ombra più scura delle altre si muove con velocità innaturale ai margini della tua vista.",
    "Il silenzio è squarciato da un verso stridulo e agghiacciante che non appartiene a questo mondo.",
    "Qualcosa di grosso, pesante e silenzioso si muove tra le rovine, facendo cadere piccoli detriti.",
    "La creatura sembra assorbire la luce, un vuoto oscuro e informe nella notte.",
    "Istintivamente sai di essere la preda. Braccato da qualcosa di antico, affamato e alieno.",
    "Vedi il profilo inquietante di una creatura alata con membrane lacere stagliarsi contro la luna malata.",
    "Una debole bioluminescenza verdastra o bluastra emana dalla creatura, pulsando ritmicamente.",
    "Senti il suo passaggio pesante e silenzioso, un'onda di pressione nell'aria immobile.",
    "La sua presenza sembra distorcere l'aria circostante, creando un effetto di miraggio oscuro.",
    "Un odore di ozono, zolfo o carne bruciata accompagna l'avvicinarsi della creatura."
];
const descrizioniPericoloAmbientaleNotturno = [ // REV: Maggiore enfasi sull'oscurità e l'ignoto
    "Inciampi su qualcosa di invisibile nell'oscurità. Cadi rovinosamente.",
    "Il terreno instabile è ancora più traditore al buio. Senti la terra franare sotto i piedi.",
    "Una struttura pericolante geme sinistramente nel vento notturno. Potrebbe crollare da un momento all'altro.",
    "Sfiori una trappola a filo o a pressione, impossibile da vedere nell'oscurità quasi totale.",
    "Metti un piede in fallo sul bordo di un baratro invisibile. Il vuoto ti chiama.",
    "L'oscurità nasconde buche, macerie appuntite, vetri rotti e altri pericoli invisibili.",
    "Una raffica di vento fa cadere detriti pesanti o lamiere taglienti da un edificio vicino.",
    "Senti un forte odore di gas o chimico, ma nel buio non riesci a localizzare la fonte.",
    "Passi vicino a una zona radioattiva o contaminata, avvertendo solo un leggero calore o formicolio.",
    "Il buio profondo ti disorienta, facendoti perdere completamente la direzione.",
    "Una pozza d'acqua o fango riflette ingannevolmente la luna, nascondendo la sua profondità o pericoli sommersi.",
    "Cavi elettrici scoperti penzolano come serpenti neri e invisibili nell'oscurità.",
    "Il silenzio notturno amplifica ogni scricchiolio, ogni segno di cedimento strutturale.",
    "Attraversi uno sciame di insetti notturni quasi invisibili ma pungenti o velenosi.",
    "Una nebbia fitta e innaturale cala improvvisamente, riducendo la visibilità a zero."
];
const descrizioniOrroreIndicibile = [ // REV: Maggiore impatto psicologico
    "Un senso di oppressione ti schiaccia il petto. L'aria diventa pesante, gelida, difficile da respirare.",
    "Senti una presenza antica, maligna, che ti osserva da ogni ombra, da ogni angolo.",
    "Le ombre danzano e si contorcono, assumendo forme grottesche e familiari ai margini della vista.",
    "Un sussurro gelido e disumano ti sfiora l'orecchio, pronunciando il tuo nome o parole incomprensibili.",
    "Un freddo innaturale ti penetra fino alle ossa. Il tuo respiro si condensa come fumo.",
    "Inizi a vedere cose che non ci sono: figure fugaci, volti distorti nel buio, simboli pulsanti.",
    "Un terrore primordiale, irrazionale, ti attanaglia. La tua sanità mentale vacilla.",
    "La tua stessa mente diventa un nemico, confondendo realtà, ricordi e incubi.",
    "Il mondo intorno a te sembra liquefarsi, distorcersi, pulsare a un ritmo alieno.",
    "Senti voci nella testa: sussurri, ordini, risate folli. Non sono tue.",
    "La luna assume un colore malato, un volto ghignante o un occhio rosso che ti fissa.",
    "Avverti il tocco freddo e immateriale di dita invisibili sulla nuca, sul braccio.",
    "Il tempo sembra dilatarsi o contrarsi. I secondi diventano eternità, o viceversa.",
    "Le tue paure più profonde prendono forma fisica nelle ombre circostanti.",
    "Un odore nauseante di tomba, di follia, di carne vecchia e libri ammuffiti riempie l'aria."
];
const esitiOrroreIndicibileFugaOk = [ // REV: Maggiore varietà e specificità
    "Scappi urlando a perdifiato, il terrore puro ti dà una velocità incredibile. La presenza rimane indietro.",
    "Ti rannicchi tremando in un angolo buio, chiudendo gli occhi finché l'oppressione non svanisce.",
    "Chiudi gli occhi, stringi i denti e ti concentri su un pensiero positivo. Quando li riapri, l'orrore è passato.",
    "Corri senza voltarti, senza pensare, finché i polmoni non bruciano e il cuore non minaccia di esplodere.",
    "Trovi un piccolo spazio angusto e sicuro (un armadio, sotto un letto) e ti nascondi finché non passa.",
    "Reciti a memoria una vecchia poesia, una preghiera dimenticata, una lista della spesa. Funziona.",
    "La fuga disperata ti porta casualmente verso una fonte di luce o un luogo protetto.",
    "Raggiungi un'area aperta sotto la luna piena. La luce sembra indebolire la presenza.",
    "Ti getti in acqua gelida. Lo shock fisico scaccia temporaneamente l'orrore mentale.",
    "Corri verso un fuoco lontano, un lampo, un segnale. La luce è la tua salvezza.",
    "Trovi un simbolo protettivo (religioso, arcano) e ti rifugi vicino ad esso. Funziona.",
    "Urli la tua rabbia e la tua paura al cielo. Il suono rompe la cappa di silenzio e terrore.",
    "Sali su un punto elevato, guardando il mondo dall'alto. Ti senti meno oppresso.",
    "Ti concentri su un compito manuale complesso (riparare, pulire l'arma). La routine ti ancora.",
    "Segui un animale notturno che sembra immune. Ti guida fuori dalla zona d'influenza."
];
const esitiOrroreIndicibileFugaKo = [ // REV: Maggiore impatto psicologico
    "La paura ti paralizza. Sei congelato sul posto, incapace di muoverti o gridare.",
    "Non puoi sfuggire alla presenza. Ti segue come un'ombra, dentro e fuori dalla tua mente.",
    "Qualcosa di freddo e intangibile ti afferra. Perdi il controllo, la tua volontà si spezza.",
    "Inciampi e cadi. L'orrore informe ti sovrasta, avvolgendoti nel suo abbraccio gelido.",
    "Corri alla cieca e ti schianti contro un muro o cadi in una buca. Sei ferito e in trappola.",
    "Il panico ti sommerge. Non riesci a pensare, a reagire. Sei sopraffatto.",
    "Non importa quanto corri. La sensazione opprimente rimane, un parassita nella tua mente.",
    "Senti le tue energie vitali prosciugarsi rapidamente, risucchiate dalla presenza.",
    "Le gambe diventano di piombo, pesanti, impossibili da muovere.",
    "Sei costretto a rivivere i tuoi traumi peggiori, i tuoi fallimenti, le tue perdite.",
    "L'orrore ti circonda, chiudendo ogni via di fuga. Non c'è scampo.",
    "Perdi l'orientamento, corri in cerchio, tornando sempre al punto di partenza.",
    "La tua fonte di luce si spegne improvvisamente. Sei solo nel buio con... quello.",
    "Cadi in ginocchio, piangendo e balbettando, la tua mente ridotta a un guscio tremante.",
    "L'orrore si insinua nei tuoi pensieri, sussurrandoti verità terribili e promesse folli."
];
const esitiOrroreIndicibileAffrontaOk = [ // REV: Maggiore varietà e specificità
    "Stringi i denti, resisti all'ondata di terrore con pura forza di volontà. Lentamente, si ritira.",
    "Urli la tua sfida nell'oscurità. Il silenzio che segue è teso, ma sei ancora integro.",
    "Accendi una luce potente (torcia, bengala). L'orrore rifugge dalla luce, sibilando.",
    "Ti concentri su un ricordo potente (amore, rabbia, speranza). Respingi l'influenza mentale.",
    "Affronti la paura e scopri che era un'illusione, un trucco della mente... o quasi.",
    "La tua determinazione a sopravvivere è più forte. L'oscurità non può spezzarti.",
    "Mantieni la calma, controlli il respiro, osservi. La presenza si dissolve come nebbia.",
    "Recuperi il controllo della tua mente. Scacci le visioni, i sussurri.",
    "Trovi un oggetto che sembra respingere la presenza (sale, ferro freddo, un simbolo sacro).",
    "Pronunci parole di potere o una vecchia formula protettiva. Funziona.",
    "Canalizzi la tua paura in rabbia fredda. Questa forza interiore scaccia l'orrore.",
    "Identifichi la fonte (un oggetto, un luogo, un'entità) e la neutralizzi o la eviti.",
    "Trovi lucidità nel caos. Vedi oltre le illusioni, capisci la sua natura.",
    "Ridi in faccia all'orrore, una risata folle e sprezzante. Lo confondi.",
    "Ti concentri sul tuo obiettivo finale. Questa determinazione ti ancora alla realtà."
];
const esitiOrroreIndicibileAffrontaKo = [ // REV: Maggiore impatto psicologico e conseguenze
    "Il tuo coraggio si infrange contro l'orrore assoluto. Cedi alla paura.",
    "Vieni sopraffatto da visioni personali e terrificanti. Dubiti della tua sanità.",
    "La tua mente si spezza. Scivoli nella follia, nella disperazione, nel vuoto...",
    "Urli finché non hai più voce, ma l'orrore non ha orecchie. Ti ignora.",
    "L'orrore ti consuma dall'interno, lasciandoti un guscio vuoto, traumatizzato.",
    "Cadi in ginocchio, sopraffatto, incapace di reagire, perso.",
    "La pressione è insopportabile. La tua mente si frammenta.",
    "Perdi conoscenza. Ti risvegli dopo, cambiato, con cicatrici invisibili.",
    "La presenza ti mostra verità cosmiche che la tua mente non può comprendere o sopportare.",
    "Vieni marcato, fisicamente o mentalmente. Porterai questo segno per sempre.",
    "Le tue paure più profonde si manifestano e ti attaccano fisicamente.",
    "Perdi temporaneamente la memoria, la parola o la vista.",
    "Sviluppi una fobia o una paranoia permanente legata all'incontro.",
    "L'orrore si ritira, ma senti che tornerà. Ti ha scelto.",
    "Vieni posseduto temporaneamente, agendo contro la tua volontà."
];

// Descrizioni per risultati di tracce
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

// ... existing code ...

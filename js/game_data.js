/**
 * TheSafePlace - Roguelike Postapocalittico
 * Versione: v0.7.18
 * File: js/game_data.js
 * Descrizione: Strutture dati principali del gioco (oggetti, eventi, luoghi, testi vari)
 */

// --- CONFIGURAZIONE E COSTANTI STATICHE ---
// Queste definizioni rappresentano dati fissi e descrittivi del mondo di gioco.

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
    PLAYER:'@' // Nota: PLAYER è solo un simbolo per il rendering, non un tipo di tile fisico
};

// Descrizioni testuali dei tipi di caselle
const TILE_DESC = {
    '.':'Pianure',
    'M':'Montagne ostili',
    '~':'Fiume torbido',
    'F':'Foresta mutata',
    'V':'Resti di villaggio',
    'C':'Città in rovina',
    'R':'Rifugio precario',
    'S':"Punto d'inizio",
    'E': 'The Safe Place',
    '@':'Tu'
};

// Stati del giocatore con descrizioni testuali
const STATO = {
    NORMALE: 'normale',
    AFFAMATO: 'affamato',
    ASSETATO: 'assetato',
    FERITO: 'ferito',
    MORENTE: 'morente',
    INFETTO: 'infetto',
    AVVELENATO: 'avvelenato'
};

// Messaggi di diario per i vari stati del giocatore (usati con probabilità)
const STATO_MESSAGGI = {
    AFFAMATO: [
        "Lo stomaco reclama cibo con crampi dolorosi. È passato troppo tempo dall'ultimo pasto.",
        "La debolezza ti assale. Ogni passo è uno sforzo immane a causa della fame.",
        "Devi trovare cibo. Subito. O le forze ti abbandoneranno del tutto.",
        "La testa ti gira per la mancanza di cibo. La lucidità svanisce."
    ],
    ASSETATO: [
        "La gola brucia come se avessi ingoiato sabbia. L'acqua è un bisogno primario, ora.",
        "Confusione e mal di testa martellante: i primi segni della disidratazione.",
        "Le labbra sono spaccate e sanguinano. La sete è una tortura costante.",
        "Respirare diventa faticoso. Senza acqua, la fine è più vicina."
    ],
    FERITO: [
        "Ogni movimento riapre la ferita, inviando fitte di dolore.",
        "Il sangue caldo impregna la fasciatura di fortuna. Non sta migliorando.",
        "La ferita pulsa, infiammata. Il rischio di infezione è altissimo senza cure adeguate.",
        "Un dolore lancinante ti ricorda costantemente della tua vulnerabilità. Devi medicarti."
    ],
    FERITO_E_MALATO: [
        "Ferite infette e febbre alta ti stanno consumando. Ogni respiro è una sofferenza.",
        "Il tuo corpo è un campo di battaglia. Sanguini, bruci e tossisci contemporaneamente.",
        "Sei in pessime condizioni: le ferite bruciano per l'infezione e la malattia ti toglie le forze."
    ],
    AFFAMATO_E_ASSETATO: [
        "La fame e la sete ti tormentano senza tregua. Il corpo e la mente iniziano a cedere.",
        "Disidratato e senza cibo, ogni passo è un'agonia. Quanto ancora puoi resistere?",
        "Senti le forze vitali abbandonarti. Hai un disperato bisogno di cibo e acqua."
    ],
    MORENTE: [
        "Le energie vitali ti stanno lasciando. Senza un intervento immediato, non vedrai l'alba.",
        "Arranchi a fatica, ogni passo un'agonia.",
        "La vista si annebbia, i suoni si ovattano. Stai scivolando via.",
        "Ti reggi in piedi per miracolo. Sei a un passo dalla morte."
    ],
    INFETTO: [
        "Brividi incontrollabili scuotono il tuo corpo febbricitante. Qualcosa ti sta divorando dall'interno.",
        "Un sudore gelido ti imperla la fronte mentre la malattia si diffonde.",
        "Ondate di nausea ti costringono a fermarti. Hai ingerito o respirato qualcosa di tossico.",
        "Colpi di tosse squassanti ti strappano sangue dai polmoni. La malattia avanza."
    ],
    AVVELENATO: [
        "Un sapore amaro in bocca e una strana sensazione di freddo. Hai ingerito del veleno.",
        "Il veleno brucia nelle vene, causando nausea e vertigini.",
        "Vedi macchie colorate e la vista si annebbia. Il veleno sta avendo effetto.",
        "Un dolore sordo si diffonde dallo stomaco. Devi trovare un antidoto, presto.",
        "Respirare diventa difficile, come se una morsa ti stringesse i polmoni."
    ],
    NOTTE_APERTO: [
        "Passare la notte all'addiaccio è brutale. Freddo, umidità e pericoli invisibili ti circondano.",
        "L'oscurità è un velo che nasconde minacce striscianti. Ogni rumore è un potenziale pericolo.",
        "Il gelo penetra fino alle ossa. Dormire qui è stato un grave errore.",
        "Il tuo corpo debilitato soffre terribilmente per l'esposizione agli elementi durante la notte."
    ]
};

// Probabilità base degli eventi per tipo di casella (0 = mai, 1 = sempre).
// Queste sono solo le PROBABILITÀ, non i dati degli eventi.
// (Nota: MOUNTAIN non ha eventi diretti, è un blocco per il movimento)
const EVENT_CHANCE = {
    PLAINS: 0.10, // Leggermente aumentata per avere più eventi
    FOREST: 0.20,
    RIVER: 0.15,
    VILLAGE: 0.30, // Aumentata, rifugi dovrebbero avere più eventi
    CITY: 0.40,    // Aumentata, città dovrebbero essere piene di pericoli/opportunità
    REST_STOP: 0.50 // Aumentata, punti di interesse frequenti
};

// Dati degli eventi per tipo di casella (Eventi "Specifici del Tile")
// Contiene eventi standard, unici e basati sulla giovinezza
const EVENT_DATA = {
    PLAINS: [
        { id: "plains_bones", title: "Ossa nella Polvere", description: "Ossa sbiancate dal sole, forse umane, affiorano dal terreno screpolato. Un macabro segnale della fragilità della vita qui.", choices: [
            { text: "Ispeziona (Tracce)", skillCheck: { stat: 'tracce', difficulty: 8 }, successText: "Tra le ossa trovi una vecchia sacca logora. Dentro, qualche misera risorsa.", successReward: { items: [{ type: 'random_common_resource', quantity: 1 }, { itemId: 'bandages_dirty', quantity: 1 }] }, failureText: "Solo ossa e polvere. Nulla di utile.", isSearchAction: true, actionKey: "inspect_bones" }
        ] },
        { id: "plains_carcass", title: "Banchetto Funebre", description: "Una carcassa gonfia di animale non identificabile giace sotto il sole implacabile, divorata da sciami di insetti ronzanti. L'odore è nauseante.", choices: [
            { text: "Avvicinati con cautela (Adattamento)", skillCheck: { stat: 'adattamento', difficulty: 10 }, successText: "Nonostante il tanfo, riesci a recuperare qualche pezzo di carne utilizzabile, anche se cruda.", successReward: { itemId: 'meat_raw', quantity: 1 }, failureText: "L'odore è troppo forte e gli insetti troppo aggressivi. Meglio lasciar perdere.", isSearchAction: true, actionKey: "approach_carcass" }
        ] },
        { id: "plains_wind", title: "Vento della Desolazione", description: "Il vento spazza la pianura arida, sollevando polvere e sussurrando storie di vuoto. Non c'è nient'altro.", choices: [] },
        {
             id: "plains_youth_memory",
             title: "Frammenti d'Infanzia",
             description: "Un vecchio parco giochi arrugginito emerge dalla sabbia. Altalene contorte cigolano nel vento. Per un attimo, ricordi com'era essere solo un bambino, senza il peso della sopravvivenza.",
             choices: [
                 { text: "Esplorare i resti (Presagio)", skillCheck: { stat: 'presagio', difficulty: 10 }, successText: "Mentre ti arrampichi sulla struttura del vecchio scivolo, noti un piccolo vano segreto. Dentro, una scatoletta di cibo e una bottiglia d'acqua, insieme a un piccolo oggetto utile.", successReward: { items: [{ itemId: 'canned_food', quantity: 1 }, { itemId: 'water_bottle', quantity: 1 }, { type: 'random_common_resource', quantity: 1 }] }, failureText: "La struttura metallica cede sotto il tuo peso, facendoti cadere. Non c'era nulla di utile, solo fantasmi di risate perdute.", isSearchAction: true, actionKey: "explore_playground_remains" },
                 { text: "Riflettere in silenzio", outcome: "Ti siedi sull'altalena, lasciando che i ricordi affiorino. Questa pausa ti ridà energia mentale, anche se il tempo è prezioso." }
             ]
        }
    ],
    FOREST: [
        {
            id: "forest_noises",
            title: "Fruscio nel Sottobosco",
            description: "Il silenzio innaturale della foresta è rotto da un fruscio sospetto tra i cespugli. Animale... o qualcos'altro? Indagare potrebbe essere rischioso.",
            choices: [
                { text: "Indaga furtivamente (Tracce)", skillCheck: { stat: 'tracce', difficulty: 12 }, successText: "Ti muovi come un'ombra. È solo un grosso ratto mutato, ma vicino alla sua tana trovi delle bacche e qualche straccio.", successReward: { items: [{ itemId: 'berries', quantity: 1 }, { itemId: 'cloth_rags', quantity: 1 }] }, failureText: "Pesti un ramo secco, tradendo la tua presenza! Qualunque cosa fosse, è fuggita nel fitto del bosco.", actionKey: "investigate_noise_stealthily" }
            ]
        },
        {
            id: "forest_fallen_tree",
            title: "Tronco Annerito",
            description: "Un albero enorme, sradicato e con la corteccia stranamente annerita, blocca il sentiero. Scavalcarlo sembra difficile, aggirarlo richiede tempo.",
            choices: [
                 { text: "Tenta di scavalcare (Agilità)", skillCheck: { stat: 'agilita', difficulty: 11 }, successText: "Con un balzo agile e un po' di fortuna, superi l'ostacolo. Noti un pezzo di metallo utile e una clava grezza incastrata tra i rami.", successReward: { items: [{ itemId: 'scrap_metal', quantity: 1 }, { itemId: 'wooden_club', quantity: 1 }]}, actionKey: "climb_fallen_tree" },
                 { text: "Aggira l'ostacolo", outcome: "Decidi di non rischiare. Ti addentri nel bosco fitto, perdendo tempo ma evitando il pericolo immediato." }
            ]
        },
        {
            id: "forest_hostile_flora",
            title: "Rovi Aggressivi",
            description: "Rampicanti spinosi dall'aspetto malato e aggressivo ostruiscono il passaggio. Sembrano quasi contrarsi al tuo avvicinarsi. Nascondono qualcosa o sono solo un altro pericolo?",
            choices: [
                { text: "Esamina i rovi (Adattamento)", skillCheck: { stat: 'adattamento', difficulty: 11 }, successText: "Osservando attentamente, noti che le spine secernono una linfa densa. Potrebbe essere usata per creare medicine grezze. Trovi anche dei dardi impigliati.", successReward: { items: [{itemId: 'medicine_crude', quantity: 1}, {itemId: 'ammo_arrow_crude', quantity: 2}] }, failureText: "Queste piante sembrano ostili e forse velenose. Meglio non rischiare di toccarle.", actionKey: "examine_hostile_vines" },
                { text: "Forza il passaggio (Potenza)", skillCheck: { stat: 'potenza', difficulty: 13 }, successText: "Con forza bruta, strappi i rampicanti spinosi e ti apri un varco, rimediando solo qualche graffio. Trovi uno straccio utile tra le spine.", successReward: { itemId: 'cloth_rags', quantity: 1}, failureText: "Le spine tenaci ti lacerano braccia e vestiti mentre cerchi di passare. Subisci una ferita.", actionKey: "force_passage_vines", usesWeapon: true }
            ]
        },
         {
            id: "forest_teen_shelter",
            title: "Rifugio tra gli Alberi",
            description: "Una casa sull'albero malconcia, costruita prima del Crollo, si nasconde tra i rami nodosi. Scale improvvisate di corda danneggiate pendono fino a terra. Potrebbe essere stata il nascondiglio di qualcuno della tua età.",
            choices: [
                { text: "Arrampicarsi (Agilità)", skillCheck: { stat: 'agilita', difficulty: 12 }, successText: "Ti arrampichi con cautela. Dentro trovi un diario, delle vitamine e un arco improvvisato lasciato da un altro giovane sopravvissuto.", successReward: { items: [{ itemId: 'vitamins', quantity: 1 }, { itemId: 'improvised_bow', quantity: 1}, {itemId: 'map_fragment_local', quantity: 1}] }, failureText: "La corda marcia si spezza sotto il tuo peso. Cadi malamente, sbattendo contro un ramo. Un rifugio fuori portata, per ora.", isSearchAction: true, actionKey: "climb_treehouse" },
                { text: "Ispezionare la base (Tracce)", skillCheck: { stat: 'tracce', difficulty: 10 }, successText: "Ai piedi dell'albero trovi un piccolo contenitore impermeabile. Dentro, bende pulite e un po' di cibo.", successReward: { items: [{ itemId: 'bandages_clean', quantity: 1 }, { type: 'random_food_item', quantity: 1 }] }, failureText: "Non trovi nulla di utile alla base. Forse ogni cosa di valore è stata già presa, o si trova ancora lassù, irraggiungibile.", isSearchAction: true, actionKey: "inspect_treehouse_base" }
            ]
         }
    ],
    RIVER: [
         {
            id: "river_flow",
            title: "Corrente Lenta e Torbida",
            description: "L'acqua del fiume scorre pigra e innaturalmente torbida, trascinando detriti irriconoscibili. La puzza leggera suggerisce contaminazione. Raccoglierla è un rischio.",
            choices: [
                { text: "Riempi la borraccia (Rischioso)", outcome: "Raccogli l'acqua sospetta. Ricorda: berla senza purificarla potrebbe essere fatale.", successReward: { itemId: 'water_dirty', quantity: 1 } },
                { text: "Osserva la riva (Tracce)", skillCheck: { stat: 'tracce', difficulty: 9 }, successText: "Scruti attentamente la riva e noti dei detriti utili trascinati dalla corrente.", successReward: { items: [{ type: 'random_common_resource', quantity: 1 }, { itemId: 'wood_planks', quantity: 1 }] }, failureText: "Non vedi nulla di utile, solo fango e acqua sporca.", isSearchAction: true, actionKey: "observe_river_bank" }
            ]
         },
         {
            id: "river_youth_reflection",
            title: "Riflessi nell'Acqua Torbida",
            description: "La corrente lenta del fiume crea una superficie quasi calma. Ti sporgi per riempire la borraccia e intravedi il tuo riflesso: un volto giovane segnato da esperienze che nessun diciassettenne dovrebbe affrontare. Questo mondo ti ha trasformato.",
            choices: [
                { text: "Fermarsi a riposare (Vigore)", skillCheck: { stat: 'vigore', difficulty: 10 }, successText: "Ti permetti un raro momento di pace. Lavi via la polvere del viaggio e raccogli i pensieri. Questo breve ristoro rinvigorisce il corpo e lo spirito. Ti senti pronto a continuare.", successReward: { items: [{ itemId: 'water_purified_small', quantity: 1 }, {type: 'random_food_item', quantity: 1}]}, failureText: "Cercando di rilassarti, la stanchezza ti travolge. Ti addormenti brevemente e ti svegli disorientato, sentendoti più affaticato di prima. Hai perso tempo prezioso.", isSearchAction: true, actionKey: "rest_by_river" },
                { text: "Guardare oltre la superficie (Presagio)", skillCheck: { stat: 'presagio', difficulty: 11 }, successText: "Scrutando più attentamente l'acqua, noti un bagliore metallico sul fondale poco profondo. Immergendo cautamente un braccio, recuperi un oggetto utile e un frammento di mappa.", successReward: { items: [{ itemId: 'mechanical_parts', quantity: 2 }, { itemId: 'map_fragment_local', quantity: 1 }] }, failureText: "Mentre fissi l'acqua, la tua mente vaga. Visioni inquietanti di città sommerse e segreti sepolti ti turbano. Ti allontani dalla riva, sentendoti a disagio.", isSearchAction: true, actionKey: "look_beyond_surface" }
            ]
         }
    ],
    VILLAGE: [
        {
            id: "village_ruins",
            title: "Villaggio Fantasma",
            description: "Le rovine silenziose di un piccolo insediamento. Tende strappate e baracche vuote gemono al vento. Cosa è successo qui? Forse è rimasto qualcosa tra le macerie.",
            choices: [
                { text: "Cerca tra le macerie (Tracce)", skillCheck: { stat: 'tracce', difficulty: 11 }, successText: "Dopo un'attenta ricerca tra i detriti polverosi, trovi diverse provviste utili!", successReward: { items: [{ type: 'random_food_item', quantity: 1 }, { type: 'random_water_item', quantity: 1 }, { itemId: 'cloth_rags', quantity: 2 }, { itemId: 'kitchen_knife', quantity: 1 } ] }, failureText: "Trovi solo polvere, vetri rotti e i fantasmi silenziosi di vite spezzate. Nulla di utile.", isSearchAction: true, actionKey: "search_village_rubble" },
                { text: "Riposati all'ombra", outcome: "Ti siedi al riparo di un muro diroccato, recuperando un po' il fiato, ma il silenzio del luogo è opprimente." }
            ]
        },
        {
            id: "village_heavy_silence",
            title: "Silenzio Innaturale",
            description: "Un silenzio opprimente grava su questo luogo. Non si sente il vento, né il verso di animali. Un brutto presentimento ti attanaglia.",
            choices: [
                { text: "Ascolta l'istinto (Presagio)", skillCheck: { stat: 'presagio', difficulty: 12 }, successText: "Il tuo sesto senso ti guida verso una tenda collassata. All'interno, trovi delle bende e un piccolo attrezzo.", successReward: { items: [{ itemId: 'bandages_dirty', quantity: 1 }, { itemId: 'shiv_improvised', quantity: 1 }] }, failureText: "Ascolti attentamente, ma percepisci solo il silenzio e un crescente senso di disagio. Meglio andarsene.", isSearchAction: true, actionKey: "listen_to_instinct" },
                { text: "Allontanati in fretta", outcome: "Fidi del tuo istinto e ti allontani rapidamente da questo luogo silenzioso e inquietante." }
            ]
        },
        {
             id: "village_school_ruins",
             title: "Rovine della Scuola",
             description: "I resti di una piccola scuola si ergono tra le case abbandonate. Graffiti sbiaditi e poster educativi si aggrappano ancora alle pareti crepate. Un luogo che un tempo era pieno di ragazzi come te, ora solo un guscio vuoto.",
             choices: [
                 { text: "Cercare nella biblioteca (Adattamento)", skillCheck: { stat: 'adattamento', difficulty: 11 }, successText: "Tra scaffali crollati e libri ammuffiti, trovi un manuale di primo soccorso e un frammento di mappa locale.", successReward: { items: [{ itemId: 'first_aid_kit', quantity: 1 }, {itemId: 'map_fragment_local', quantity: 1}] }, failureText: "La biblioteca è un disastro di carta marcita e polvere. Qualsiasi cosa utile è stata danneggiata dall'umidità o saccheggiata tempo fa.", isSearchAction: true, actionKey: "search_school_library" },
                 { text: "Ispezionare l'aula di scienze (Presagio)", skillCheck: { stat: 'presagio', difficulty: 12 }, successText: "Nel laboratorio devastato, il tuo intuito ti guida verso un armadietto. Dentro, un antitodo e delle pillole dall'aspetto sospetto.", successReward: { items: [{ itemId: 'antidote', quantity: 1 }, { itemId: 'suspicious_pills', quantity: 1 }] }, failureText: "Il laboratorio è un pericolo: vetri rotti, sostanze chimiche versate e odori acri. Meglio non rischiare di toccare nulla.", isSearchAction: true, actionKey: "inspect_science_lab", usesWeapon: true }
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
                     text: "Esplora un palazzo (Presagio)",
                     skillCheck: { stat: 'presagio', difficulty: 13 },
                     successText: "Il tuo istinto ti guida verso un edificio che sembra meno pericolante. All'interno, tra le macerie, trovi provviste, materiali e forse qualcosa per difenderti.",
                     successReward: { items: [
                         { type: 'random_food_item', quantity: 1 }, { type: 'random_water_item', quantity: 1 },
                         { itemId: 'scrap_metal', quantity: 2 }, { type: 'random_medical_item', quantity: 1 },
                         { type: 'random_weapon_item', quantity: 1 } // Aggiunta arma casuale
                        ] },
                     failureText: "Il palazzo è un labirinto di pericoli e vicoli ciechi. Non trovi nulla di utile e rischi di perderti o peggio. Meglio ritirarsi.",
                     actionKey: "explore_building"
                 },
                 { text: "Attraversa la strada", outcome: "Corri attraverso lo spazio aperto, sentendo gli occhi invisibili delle finestre vuote su di te. Raggiungi l'altro lato senza incidenti, per ora." }
            ]
        },
        {
            id: "city_easter_egg_pixeldebh",
            title: "Strano Ritrovamento Metallico",
            description: "Rovistando tra detriti metallici e cemento sbriciolato, noti uno strano oggetto lucido. Una placca argentata con un simbolo insolito e la scritta parzialmente leggibile 'PixelDebh'.",
            choices: [], // Nessuna scelta, solo scoperta
            isUnique: true // Flag per evento unico
        },
        {
            id: "city_unique_webradio",
            title: "Studio Radio Silenzioso",
            description: "Una stanza devastata: pareti annerite, macerie, monitor infranti su un tavolo circolare. Un'insegna sbrecciata sul muro recita 'R...me...adi'. Qui un tempo pulsava una WebRadio, voce libera ora ridotta al silenzio.",
            choices: [], // Nessuna scelta, solo scoperta
            isUnique: true // Flag per evento unico
        },
        {
            id: "city_medical_supply",
            title: "Farmacia Saccheggiata",
            description: "Le insegne sbiadite di una farmacia. Dentro, scaffali rovesciati e blister vuoti ovunque. Forse è rimasto qualcosa di utile tra il disastro.",
            choices: [
                 { text: "Cerca medicine (Adattamento)", skillCheck: { stat: 'adattamento', difficulty: 13 }, successText: "Con pazienza, rovistando tra scatole rotte e vetri infranti, la tua mano si chiude su alcune forniture mediche!", successReward: { items: [{ itemId: 'antidote', quantity: 1 }, { type: 'random_medical_item', quantity: 1 }, { itemId: 'bandages_clean', quantity: 2 }] }, failureText: "Saccheggiata a fondo. Trovi solo confezioni vuote e odore di disinfettante stantio.", isSearchAction: true, actionKey: "search_pharmacy" }
            ]
        },
        {
             id: "city_teen_gang_territory",
             title: "Territorio di Banda Giovanile",
             description: "Graffiti colorati segnano questo quartiere come territorio di una banda di ragazzi sopravvissuti. Simboli minacciosi ma anche disegni che rivelano la loro giovane età. Segnali contrastanti di pericolo e di possibilità di contatto.",
             choices: [
                 { text: "Tentare un contatto (Influenza)", skillCheck: { stat: 'influenza', difficulty: 13 }, successText: "Dopo un teso confronto iniziale, riesci a guadagnarti la fiducia del gruppo. Ti offrono una balestra semplice e qualche dardo.", successReward: { items: [{ itemId: 'crossbow_simple', quantity: 1 }, { itemId: 'ammo_bolt', quantity: 3 }]}, failureText: "Un fischio acuto risuona tra gli edifici. Sagome si muovono come ombre. 'Questo non è territorio tuo,' grida una voce giovane. Indietreggi lentamente, sentendoti osservato.", actionKey: "contact_teen_gang" },
                 { text: "Studiare i loro nascondigli (Tracce)", skillCheck: { stat: 'tracce', difficulty: 14 }, successText: "Evitando di farti notare, scopri uno dei loro depositi. Prendi cibo, acqua e qualche risorsa.", successReward: { items: [{ type: 'random_food_item', quantity: 2 }, { type: 'random_water_item', quantity: 1 }, { type: 'random_common_resource', quantity: 1 }, {itemId: 'ammo_generic', quantity: 5}] }, failureText: "Un suono metallico scatta vicino al tuo piede. Una trappola rudimentale ma efficace. Un avvertimento. Allontanati rapidamente, sentendoti fortunato.", isSearchAction: true, actionKey: "study_gang_hideouts" }
             ]
        }
    ],
     REST_STOP: [
        {
            id: "rest_stop_day_interaction", // ID specifico cercato da events.js
            title: "Rifugio Diurno",
            description: "Questo posto sembra tranquillo alla luce del giorno. Potrebbe essere un buon momento per riorganizzarsi o cercare meglio.",
            choices: [
                {
                    text: "Cerca Provviste (Tracce)",
                    skillCheck: { stat: 'tracce', difficulty: 9 }, // Difficoltà leggermente ridotta rispetto a notte/altri eventi
                    successText: "Approfittando della luce, trovi provviste utili che erano sfuggite a una ricerca frettolosa!",
                    successReward: { items: [ { type: 'random_food_item', quantity: 1 }, { type: 'random_water_item', quantity: 1 }, { type: 'random_common_resource', quantity: 1 } ] },
                    failureText: "Hai cercato ovunque, ma sembra che non ci sia rimasto nulla di valore.",
                    isSearchAction: true, // Costa tempo
                    actionKey: "search_shelter_day"
                },
                {
                    text: "Breve Riposo (Recupera Energie)",
                    // Nessun skill check, effetto diretto positivo ma costa un po' di tempo
                    outcome: "Ti prendi un momento per riposare al sicuro. Recuperi un po' di energie fisiche e mentali.",
                    effect: { type: 'add_resource', resource_type: 'hp', amount: 5 }, // Recupera un po' di HP
                    isSearchAction: true, // Costa tempo (come una ricerca)
                    timeCost: 2, // Costo tempo specifico (inferiore a una ricerca completa?)
                    actionKey: "rest_briefly"
                },
                {
                    text: "Rinforza il Rifugio (Adattamento)",
                    skillCheck: { stat: 'adattamento', difficulty: 11 },
                    successText: "Usando materiali di fortuna, riesci a rendere il rifugio un po' più sicuro per la prossima notte.",
                    // Effetto futuro: Potrebbe impostare un flag sul tile che riduce la probabilità di eventi negativi notturni
                    // Per ora, non ha un effetto meccanico diretto, ma è un'azione tematica.
                    failureText: "Non trovi materiali adatti o le tue riparazioni sono troppo precarie per fare la differenza.",
                    isSearchAction: true, // Costa tempo
                    actionKey: "reinforce_shelter"
                },
                { text: "Prosegui", outcome: "Decidi di non perdere altro tempo qui e continui il tuo viaggio.", actionKey: "continue_journey_day" }
            ]
        },
        {
            id: "rest_stop_shelter",
            title: "Riparo Improvvisato",
            description: "Un piccolo rifugio, forse una vecchia stazione di servizio o un capanno abbandonato. Offre una tregua momentanea dal mondo esterno.",
            choices: [
                { text: "Fruga tra le provviste (Tracce)", skillCheck: { stat: 'tracce', difficulty: 10 }, successText: "Dopo un'attenta ricerca, trovi una buona scorta di cibo, acqua e un utile kit di riparazione!", successReward: { items: [{ itemId: 'ration_pack', quantity: 2 }, { itemId: 'water_bottle', quantity: 2 }, { itemId: 'repair_kit', quantity: 1 }, {type: 'random_clothing_item', quantity: 1} ] }, failureText: "Qualcuno è già passato di qui e ha preso tutto. Non c'è nulla di commestibile.", isSearchAction: true, actionKey: "search_shelter_supplies" },
                { text: "Riposa al sicuro", outcome: "Ti concedi una breve pausa, recuperando le energie. Il rifugio sembra sicuro, per ora." }
            ]
        },
        {
            id: "rest_stop_vehicle",
            title: "Veicolo Abbandonato",
            description: "Un'auto arrugginita o un furgone bloccato sul ciglio della strada. Potrebbe contenere qualcosa di utile, o solo brutte sorprese.",
             choices: [
                { text: "Controlla il bagagliaio (Potenza)", skillCheck: { stat: 'potenza', difficulty: 12 }, successText: "Forzi il bagagliaio e trovi dei rottami e una vecchia chiave inglese.", successReward: { items: [{ itemId: 'scrap_metal', quantity: 2 }, { itemId: 'pipe_wrench', quantity: 1 }] }, failureText: "Il bagagliaio è bloccato o completamente vuoto.", actionKey: "check_vehicle_trunk" },
                { text: "Controlla la cabina (Tracce)", skillCheck: { stat: 'tracce', difficulty: 9 }, successText: "All'interno trovi delle vecchie bende e un frammento di mappa.", successReward: { items: [{ itemId: 'bandages_dirty', quantity: 1 }, {itemId: 'map_fragment_local', quantity: 1}] }, failureText: "La cabina è stata saccheggiata o è piena di spazzatura inutile.", actionKey: "check_vehicle_cabin" },
                { text: "Cerca nel vano portaoggetti (Adattamento)", skillCheck: { stat: 'adattamento', difficulty: 10 }, successText: "Frugando nel piccolo scomparto, trovi provviste utili e qualche munizione!", successReward: { items: [{ itemId: 'ration_pack', quantity: 1 }, { itemId: 'chocolate_bar', quantity: 1 }, { type: 'random_ammo_item', quantity: 1 }] }, failureText: "Il vano portaoggetti è vuoto, a parte qualche vecchia mappa inutile e polvere.", isSearchAction: true, actionKey: "search_glove_compartment" }
            ]
        },
        {
            id: "rest_stop_old_camp",
            title: "Vecchio Accampamento",
            description: "I resti di un accampamento frettolosamente abbandonato. Ceneri fredde di un falò, una tenda strappata che sventola al vento. Chissà cosa è successo.",
            choices: [
                { text: "Ispeziona i resti del fuoco (Tracce)", skillCheck: { stat: 'tracce', difficulty: 10 }, successText: "Tra le ceneri fredde trovi del carbone e un pezzo di carne cotta.", successReward: { items: [{ itemId: 'charcoal', quantity: 2 }, { itemId: 'meat_cooked', quantity: 1 }] }, failureText: "Solo cenere e vecchi ricordi.", actionKey: "inspect_campfire_remains" },
                { text: "Esamina una tenda strappata (Adattamento)", skillCheck: { stat: 'adattamento', difficulty: 11 }, successText: "Dentro la tenda trovi cibo, acqua, un indumento e un set di grimaldelli.", successReward: { items: [{ itemId: 'canned_food', quantity: 1 }, { itemId: 'water_bottle', quantity: 1 }, { type: 'random_clothing_item', quantity: 1 }, { itemId: 'lockpick_set_crude', quantity: 1 }] }, failureText: "La tenda è vuota e logora, non c'è nulla di valore.", isSearchAction: true, actionKey: "examine_torn_tent" }
            ]
        },
        {
            id: "rest_stop_hidden_stash",
            title: "Scorta Nascosta",
            description: "Sembra che qualcuno abbia usato questo posto come nascondiglio temporaneo. Forse hanno lasciato qualcosa di utile.",
            choices: [
                {
                    text: "Cerca attentamente (Presagio)",
                    skillCheck: { stat: 'presagio', difficulty: 11 },
                    successText: "Il tuo intuito ti guida verso un pannello allentato. Dentro trovi provviste e forse degli schemi utili!",
                    successReward: { items: [
                        { itemId: 'ration_pack', quantity: 1 }, 
                        { itemId: 'water_bottle', quantity: 1 }, 
                        { type: 'random_weapon_item', quantity: 1 }, 
                        { type: 'random_rare_resource', quantity: 1 },
                        { type: 'random_blueprint', quantity: 1 } // Aggiunta possibilità di trovare un blueprint
                    ] },
                    failureText: "Hai cercato ovunque, ma sembra che la scorta sia già stata trovata o non ci sia mai stata.",
                    isSearchAction: true,
                    actionKey: "search_hidden_stash_rest_stop"
                },
                { text: "Non perdere tempo", outcome: "Decidi che è meglio non rischiare o perdere tempo prezioso a cercare." }
            ]
        }
    ]
    // MOUNTAIN, START, END non hanno eventi specifici del tile definiti qui.
};


// --- DEFINIZIONE OGGETTI DI GIOCO ---
// Contiene tutti gli oggetti utilizzabili, equipaggiabili o trovabili nel gioco.
// Ogni oggetto ha un ID univoco e varie proprietà che ne definiscono il comportamento.
const ITEM_DATA = {
    // --- RISORSE BASE ---
    'scrap_metal': {
        id: 'scrap_metal',
        name: 'Metallo Riciclato',
        description: "Pezzi di metallo arrugginito e contorto. Utile per riparazioni e costruzioni.",
        type: 'resource',
        weight: 0.5,
        value: 5,
        stackable: true
    },
    'mechanical_parts': {
        id: 'mechanical_parts',
        name: 'Parti Meccaniche',
        description: "Ingranaggi, molle e piccoli componenti. Essenziali per meccanismi complessi.",
        type: 'resource',
        weight: 0.3,
        value: 10,
        stackable: true
    },
    'charcoal': {
        id: 'charcoal',
        name: 'Carbone',
        description: "Pezzi di legno carbonizzato. Utile per purificare l'acqua o come combustibile.",
        type: 'resource',
        weight: 0.2,
        value: 3,
        stackable: true
    },
    'wood_planks': {
        id: 'wood_planks',
        name: 'Assi di Legno',
        description: "Assi recuperate da vecchie strutture. Materiale da costruzione versatile.",
        type: 'resource',
        weight: 0.8,
        value: 4,
        stackable: true
    },
    'cloth_rags': {
        id: 'cloth_rags',
        name: 'Stracci di Stoffa',
        description: "Pezzi di tessuto sporco e logoro. Possono essere usati per bende o riparazioni.",
        type: 'resource',
        weight: 0.1,
        value: 2,
        stackable: true
    },

    // --- CIBO ---
    'canned_food': {
        id: 'canned_food',
        name: 'Cibo in Scatola',
        nameShort: 'Cibo Scatola',
        description: "Una scatoletta ammaccata ma sigillata. Chissà cosa contiene, ma è cibo.",
        type: 'food',
        usable: true,
        weight: 0.5,
        value: 10,
        effects: [{ type: 'add_resource', resource_type: 'food', amount: 5 }]
    },
    'ration_pack': {
        id: 'ration_pack',
        name: 'Pacco Razione',
        description: "Razione di sopravvivenza compatta. Non un granché, ma nutriente.",
        type: 'food',
        usable: true,
        weight: 0.4,
        value: 15,
        effects: [{ type: 'add_resource', resource_type: 'food', amount: 6 }]
    },
    'berries_suspicious': {
        id: 'berries_suspicious',
        name: 'Bacche Sospette',
        description: "Bacche colorate trovate su un cespuglio. Potrebbero essere commestibili... o velenose.",
        type: 'food',
        usable: true,
        weight: 0.1,
        value: 2,
        effects: [{ type: 'add_resource_poisonable', resource_type: 'food', amount: 3, poison_chance: BERRIES_POISON_CHANCE }]
    },
    'berries': {
        id: 'berries',
        name: 'Bacche Comuni',
        nameShort: 'Bacche',
        description: 'Alcune bacche selvatiche. Potrebbero sfamare un po\', ma è sempre saggio essere cauti con ciò che si trova.',
        type: 'food',
        usable: true,
        weight: 0.1,
        value: 3,
        stackable: true,
        effects: [{ type: 'add_resource_poisonable', resource_type: 'food', amount: 1, poison_chance: 0.05 }]
    },
    'meat_raw': {
        id: 'meat_raw',
        name: 'Carne Cruda',
        description: "Un pezzo di carne fresca, ma cruda. Mangiarla così è rischioso.",
        type: 'food',
        usable: true,
        weight: 0.6,
        value: 8,
        effects: [{ type: 'add_resource_sickness', resource_type: 'food', amount: 4, sickness_chance: RAW_MEAT_SICKNESS_CHANCE }]
    },
    'meat_cooked': {
        id: 'meat_cooked',
        name: 'Carne Cotta',
        description: "Carne arrostita su un fuoco improvvisato. Sicuramente più sicura di quella cruda.",
        type: 'food',
        usable: true,
        weight: 0.5,
        value: 12,
        effects: [
            { type: 'add_resource', resource_type: 'food', amount: 6 },
            { type: 'add_resource', resource_type: 'hp', amount: 2 }
        ]
    },
    'chips_stale': {
        id: 'chips_stale',
        name: 'Patatine Stantie',
        description: "Un sacchetto aperto, sapore di cartone, ma è pur sempre cibo.",
        type: 'food',
        usable: true,
        weight: 0.2,
        value: 3,
        effects: [{ type: 'add_resource', resource_type: 'food', amount: 3 }]
    },
    'chocolate_bar': {
        id: 'chocolate_bar',
        name: 'Barretta di Cioccolato',
        description: "Fonde un po' in mano, un lusso raro.",
        type: 'food',
        usable: true,
        weight: 0.1,
        value: 8,
        effects: [{ type: 'add_resource', resource_type: 'food', amount: 4 }]
    },
    'canned_beans': {
        id: 'canned_beans',
        name: 'Fagioli in Scatola',
        description: "Un classico della dispensa post-apocalittica.",
        type: 'food',
        usable: true,
        weight: 0.5,
        value: 12,
        effects: [{ type: 'add_resource', resource_type: 'food', amount: 6 }]
    },
    'dried_fruit': {
        id: 'dried_fruit',
        name: 'Frutta Essiccata',
        description: "Leggera e nutriente, se non è ammuffita.",
        type: 'food',
        usable: true,
        weight: 0.3,
        value: 10,
        effects: [{ type: 'add_resource', resource_type: 'food', amount: 4 }]
    },
    'mre_pack': {
        id: 'mre_pack',
        name: 'Razione Militare (MRE)',
        description: "Pasto completo, sigillato. Pesante ma saziante.",
        type: 'food',
        usable: true,
        weight: 1.0,
        value: 25,
        effects: [{ type: 'add_resource', resource_type: 'food', amount: 6 }]
    },
    'mystery_meat_cooked': {
        id: 'mystery_meat_cooked',
        name: 'Carne Misteriosa Cotta',
        description: "Cucinata alla meno peggio, odore incerto.",
        type: 'food',
        usable: true,
        weight: 0.4,
        value: 10,
        effects: [{ type: 'add_resource_sickness', resource_type: 'food', amount: 5, sickness_chance: 0.10 }]
    },
    'protein_bar_old': {
        id: 'protein_bar_old',
        name: 'Barretta Proteica Vecchia',
        description: "Dura come un sasso, ma piena di... qualcosa.",
        type: 'food',
        usable: true,
        weight: 0.2,
        value: 9,
        effects: [{ type: 'add_resource', resource_type: 'food', amount: 5 }]
    },

    // --- ACQUA E BEVANDE ---
    'water_bottle': {
        id: 'water_bottle',
        name: 'Borraccia d\'Acqua',
        description: "Una borraccia piena d'acqua, sembra pulita.",
        type: 'water',
        usable: true,
        weight: 1.0,
        value: 10,
        effects: [{ type: 'add_resource', resource_type: 'water', amount: 6 }]
    },
    'water_dirty': {
        id: 'water_dirty',
        name: 'Acqua Sporca',
        description: "Acqua torbida e dall'odore sgradevole. Berla così è un azzardo.",
        type: 'water', // Manteniamo 'water' per coerenza con gli altri oggetti acqua
        usable: true,
        weight: 1.0,
        value: 1,
        stackable: true, // Esplicitiamo stackable
        effects: [{ type: 'add_resource_sickness', resource_type: 'water', amount: 3, sickness_chance: DIRTY_WATER_POISON_CHANCE }]
    },
    'water_purified_small': {
        id: 'water_purified_small',
        name: 'Acqua Purificata (Piccola)',
        nameShort: 'Acqua Purif. (S)',
        description: "Una piccola quantità di acqua resa potabile. Preziosa.",
        type: 'water',
        usable: true,
        weight: 0.3,
        value: 8,
        effects: [{ type: 'add_resource', resource_type: 'water', amount: 2 }]
    },
    'soda_flat': {
        id: 'soda_flat',
        name: 'Bibita Gassata Sgasata',
        description: "Dolce e appiccicosa, ha perso tutta l'effervescenza.",
        type: 'water',
        usable: true,
        weight: 0.4,
        value: 5,
        effects: [{ type: 'add_resource', resource_type: 'water', amount: 3 }]
    },
    'juice_box_found': {
        id: 'juice_box_found',
        name: 'Succo di Frutta Trovato',
        description: "Zuccherino, sperando non sia fermentato.",
        type: 'water',
        usable: true,
        weight: 0.3,
        value: 6,
        effects: [{ type: 'add_resource_sickness', resource_type: 'water', amount: 4, sickness_chance: 0.05 }]
    },
    'energy_drink_old': {
        id: 'energy_drink_old',
        name: 'Bevanda Energetica Vecchia',
        description: "Sapore chimico, promette una carica che non arriverà.",
        type: 'water',
        usable: true,
        weight: 0.3,
        value: 4,
        effects: [{ type: 'add_resource', resource_type: 'water', amount: 2 }]
    },
    'rainwater_collected': {
        id: 'rainwater_collected',
        name: 'Acqua Piovana Raccolta',
        description: "Fresca, ma la purezza dipende da dove è stata raccolta.",
        type: 'water',
        usable: true,
        weight: 1.0,
        value: 7,
        effects: [{ type: 'add_resource_sickness', resource_type: 'water', amount: 5, sickness_chance: 0.10 }]
    },
    'herbal_tea_crude': {
        id: 'herbal_tea_crude',
        name: 'Tisana d\'Erbe Grezza',
        description: "Foglie bollite, sapore amaro, forse calmante.",
        type: 'water',
        usable: true,
        weight: 0.1,
        value: 5,
        effects: [
            { type: 'add_resource', resource_type: 'water', amount: 2 },
            { type: 'add_resource', resource_type: 'hp', amount: 1 }
        ]
    },

    // --- MEDICINE ---
    'bandages_dirty': {
        id: 'bandages_dirty',
        name: 'Bende Sporche',
        description: "Bende recuperate, non proprio sterili. Meglio di niente, forse.",
        type: 'medicine',
        usable: true,
        weight: 0.1,
        value: 3,
        effects: [{ type: 'cure_status', status_cured: 'isInjured', chance: 0.3, heal_hp_on_success: 5 }]
    },
    'bandages_clean': {
        id: 'bandages_clean',
        name: 'Bende Pulite',
        description: "Bende sterili, buone per ferite superficiali.",
        type: 'medicine',
        usable: true,
        weight: 0.1,
        value: 10,
        effects: [{ type: 'cure_status', status_cured: 'isInjured', chance: 0.7, heal_hp_on_success: 10 }]
    },
    'first_aid_kit': {
        id: 'first_aid_kit',
        name: 'Kit Pronto Soccorso',
        description: "Un kit medico ben fornito. Può curare ferite più serie.",
        type: 'medicine',
        usable: true,
        weight: 0.7,
        value: 25,
        effects: [
            { type: 'cure_status', status_cured: 'isInjured', chance: 0.9, heal_hp_on_success: 20 },
            { type: 'add_resource', resource_type: 'hp', amount: 10 }
        ]
    },
    'antidote': {
        id: 'antidote',
        name: 'Antidoto',
        description: "Una siringa con un liquido lattiginoso. Speriamo funzioni contro i veleni.",
        type: 'medicine',
        usable: true,
        weight: 0.2,
        value: 30,
        effects: [{ type: 'cure_status', status_cured: 'isPoisoned', chance: 0.8, heal_hp_on_success: 5 }]
    },
    'medicine_crude': {
        id: 'medicine_crude',
        name: 'Medicina Grezza',
        description: "Un intruglio di erbe dall'odore pungente. Chissà se funziona.",
        type: 'medicine',
        usable: true,
        weight: 0.3,
        value: 15,
        effects: [{ type: 'cure_status', status_cured: 'isSick', chance: 0.5, heal_hp_on_success: 5 }]
    },
    'vitamins': {
        id: 'vitamins',
        name: 'Vitamine',
        description: "Pillole colorate. Forse aiutano a sentirsi meglio o a prevenire malattie.",
        type: 'medicine',
        usable: true,
        weight: 0.1,
        value: 12,
        effects: [
            { type: 'add_resource', resource_type: 'hp', amount: 8 }
        ]
    },
    'suspicious_pills': {
        id: 'suspicious_pills',
        name: 'Pillole Sospette',
        description: "Trovate in un contenitore non etichettato. Cosa faranno?",
        type: 'medicine',
        usable: true,
        weight: 0.1,
        value: 5,
        // MODIFICATO: Aggiunto effetto casuale
        effects: [{
            type: 'random_pill_effect', // Nuovo tipo di effetto
            outcomes: [ // Array di possibili risultati con pesi relativi
                // Esiti Positivi (Totale peso: 30)
                { result: 'good_heal_small', weight: 15 },     // Cura 3-7 HP
                { result: 'good_boost_temp', weight: 10 },     // Messaggio: Ti senti più scattante/concentrato
                { result: 'good_cure_minor', weight: 5 },      // Cura stato 'Ferito' se presente
                // Esiti Negativi (Contenuti - Totale peso: 20)
                { result: 'bad_damage_small', weight: 10 },    // Danno 2-5 HP
                { result: 'bad_nausea_temp', weight: 10 },     // Messaggio: Nausea/Vertigini temporanee
                // Esito Neutrale (Totale peso: 50)
                { result: 'neutral_nothing', weight: 50 }      // Messaggio: Nessun effetto percepibile
            ]
        }]
    },
     'herbal_salve': {
        id: 'herbal_salve',
        name: 'Unguento Erbale',
        description: "Un unguento denso fatto con erbe sconosciute. Lenitivo.",
        type: 'medicine',
        usable: true,
        weight: 0.2,
        value: 18,
        effects: [{ type: 'cure_status', status_cured: 'isInjured', chance: 0.6, heal_hp_on_success: 12 }]
    },
    'healing_poultice': {
        id: 'healing_poultice',
        name: 'Impiastro Curativo Semplice',
        nameShort: 'Impiastro Cur.',
        description: 'Un impacco di erbe non identificate e argilla. Applicato su ferite superficiali, sembra favorire la guarigione.',
        type: 'medicine',
        usable: true,
        weight: 0.2,
        value: 12,
        stackable: true,
        effects: [{ type: 'add_resource', resource_type: 'hp', amount: 10 }]
    },

    // --- ARMI ---
    // MISCHIA
    'pipe_wrench': {
        id: 'pipe_wrench',
        name: 'Chiave Inglese Pesante',
        nameShort: 'Chiave Pesante',
        description: "Una grossa chiave inglese, buona per colpire forte... o stringere bulloni.",
        type: 'weapon',
        slot: 'weapon',
        weaponType: 'mischia',
        damage: { min: 5, max: 10 },
        durability: 30,
        maxDurability: 30,
        weight: 1.5,
        value: 20
    },
    'wooden_club': {
        id: 'wooden_club',
        name: 'Clava di Legno',
        description: "Un pezzo di legno robusto, grezzamente sagomato per colpire.",
        type: 'weapon',
        slot: 'weapon',
        weaponType: 'mischia',
        damage: { min: 2, max: 5 },
        durability: 20,
        maxDurability: 20,
        weight: 1.0,
        value: 5
    },
    'metal_bar': {
        id: 'metal_bar',
        name: 'Barra di Metallo',
        description: "Una barra di ferro arrugginita, pesante e sbilanciata, ma efficace.",
        type: 'weapon',
        slot: 'weapon',
        weaponType: 'mischia',
        damage: { min: 4, max: 8 },
        durability: 35,
        maxDurability: 35,
        weight: 1.8,
        value: 15
    },
    'machete_rusty': {
        id: 'machete_rusty',
        name: 'Machete Arrugginito',
        description: "Una lama lunga e pesante, ideale per farsi strada o per... altro. La ruggine ne compromette l'efficacia.",
        type: 'weapon',
        slot: 'weapon',
        weaponType: 'mischia',
        damage: { min: 6, max: 12 },
        durability: 25,
        maxDurability: 25,
        weight: 1.2,
        value: 22
    },

    // BIANCA CORTA
    'combat_knife': {
        id: 'combat_knife',
        name: 'Coltello da Combattimento',
        description: "Un coltello militare, affilato e ben bilanciato. Veloce e letale.",
        type: 'weapon',
        slot: 'weapon',
        weaponType: 'bianca_corta',
        damage: { min: 4, max: 9 },
        durability: 25,
        maxDurability: 25,
        weight: 0.4,
        value: 25
    },
    'kitchen_knife': {
        id: 'kitchen_knife',
        name: 'Coltello da Cucina',
        description: "Un grosso coltello da cucina. Non ideale per combattere, ma meglio di niente.",
        type: 'weapon',
        slot: 'weapon',
        weaponType: 'bianca_corta',
        damage: { min: 3, max: 6 },
        durability: 15,
        maxDurability: 15,
        weight: 0.3,
        value: 8
    },
    'shiv_improvised': {
        id: 'shiv_improvised',
        name: "Punteruolo Improvvisato",
        nameShort: "Punteruolo",
        description: "Un pezzo di metallo affilato rozzamente, forse legato a un manico di fortuna. Meglio di niente.",
        type: "weapon",
        equipable: true,
        stackable: false,
        weaponType: "bianca_corta",
        damage: 2,
        durability: 25,
        maxDurability: 25,
        weight: 0.3,
        value: 3,
        effects: [],
        slot: "weapon"
    },

    club_crude: {
        name: "Mazza Grezza",
        nameShort: "Mazza Gr.",
        description: "Un pezzo di legno robusto, forse un ramo pesante o una gamba di tavolo rotta. Utile come arma contundente improvvisata nelle situazioni disperate.",
        type: "weapon",
        equipable: true,
        stackable: false,
        weaponType: "mischia",
        damage: 3,
        durability: 30,
        maxDurability: 30,
        weight: 1.8,
        value: 4,
        effects: [],
        slot: "weapon"
    },

    // BIANCA LUNGA
     'baseball_bat': {
        id: 'baseball_bat',
        name: 'Mazza da Baseball',
        description: "Un classico. Solida e affidabile per colpire forte.",
        type: 'weapon',
        slot: 'weapon',
        weaponType: 'bianca_lunga',
        damage: { min: 5, max: 10 },
        durability: 30,
        maxDurability: 30,
        weight: 1.3,
        value: 18
    },
    'spear_sharpened_pipe': {
        id: 'spear_sharpened_pipe',
        name: 'Lancia con Tubo Appuntito',
        description: "Un tubo di metallo con un'estremità affilata. Permette di colpire a distanza.",
        type: 'weapon',
        slot: 'weapon',
        weaponType: 'bianca_lunga',
        damage: { min: 7, max: 14 },
        durability: 25,
        maxDurability: 25,
        weight: 1.6,
        value: 28
    },

    // LANCIO
    'throwing_knife': {
        id: 'throwing_knife',
        name: 'Coltello da Lancio',
        description: "Piccolo e bilanciato per essere lanciato. Silenzioso, ma difficile da recuperare.",
        type: 'weapon',
        slot: 'weapon',
        weaponType: 'lancio',
        damage: { min: 4, max: 7 },
        durability: 1,
        maxDurability: 1,
        weight: 0.1,
        value: 6,
        stackable: true,
        recoverable_chance: 0.5
    },
    'rock_sharp': {
        id: 'rock_sharp',
        name: 'Pietra Affilata',
        description: "Una semplice pietra con un bordo appuntito. Arma disperata.",
        type: 'weapon',
        slot: 'weapon',
        weaponType: 'lancio',
        damage: { min: 1, max: 3 },
        durability: 1,
        maxDurability: 1,
        weight: 0.3,
        value: 1,
        stackable: true
    },

    // FUOCO
    'pistol_makeshift': {
        id: 'pistol_makeshift',
        name: 'Pistola Improvvisata',
        description: "Un ammasso di tubi e molle che spara proiettili da 9mm. Inaffidabile e pericolosa anche per chi la usa.",
        type: 'weapon',
        slot: 'weapon',
        weaponType: 'fuoco',
        damage: { min: 8, max: 15 },
        durability: 15,
        maxDurability: 15,
        weight: 1.0,
        value: 30,
        ammoType: 'ammo_9mm',
        ammoPerShot: 1,
        magazineSize: 5
    },
    'revolver_old': {
        id: 'revolver_old',
        name: 'Revolver Consumato',
        description: "Un vecchio revolver, ha visto giorni migliori ma spara ancora.",
        type: 'weapon',
        slot: 'weapon',
        weaponType: 'fuoco',
        damage: { min: 10, max: 18 },
        durability: 25,
        maxDurability: 25,
        weight: 1.2,
        value: 45,
        ammoType: 'ammo_revolver_generic',
        ammoPerShot: 1,
        magazineSize: 6
    },
    'shotgun_sawed_off': {
        id: 'shotgun_sawed_off',
        name: 'Fucile a Canne Mozze',
        description: "Potente a corto raggio, ma con solo due colpi e una grande dispersione.",
        type: 'weapon',
        slot: 'weapon',
        weaponType: 'fuoco',
        damage: { min: 15, max: 30 },
        durability: 20,
        maxDurability: 20,
        weight: 2.0,
        value: 60,
        ammoType: 'ammo_shell',
        ammoPerShot: 1,
        magazineSize: 2
    },

    // BALESTRA/ARCO
    'crossbow_simple': {
        id: 'crossbow_simple',
        name: 'Balestra Semplice',
        description: "Una balestra rudimentale, lenta da caricare ma silenziosa.",
        type: 'weapon',
        slot: 'weapon',
        weaponType: 'balestra',
        damage: { min: 12, max: 20 },
        durability: 20,
        maxDurability: 20,
        weight: 2.2,
        value: 40,
        ammoType: 'ammo_bolt',
        ammoPerShot: 1
    },
    'improvised_bow': {
        id: 'improvised_bow',
        name: 'Arco Improvvisato',
        description: "Un arco fatto con materiali di fortuna. Richiede abilità e frecce grezze.",
        type: 'weapon',
        slot: 'weapon',
        weaponType: 'arco',
        damage: { min: 6, max: 10 },
        durability: 18,
        maxDurability: 18,
        weight: 0.8,
        value: 25,
        ammoType: 'ammo_arrow_crude',
        ammoPerShot: 1
    },

    // --- MUNIZIONI ---
    'ammo_9mm': {
        id: 'ammo_9mm',
        name: 'Munizioni 9mm',
        description: "Una scatola di proiettili calibro 9mm.",
        type: 'ammo',
        ammoType: 'ammo_9mm',
        weight: 0.02,
        value: 2,
        stackable: true,
        quantityPerStack: 20
    },
    'ammo_bolt': {
        id: 'ammo_bolt',
        name: 'Dardi da Balestra',
        description: "Dardi grezzi per balestra.",
        type: 'ammo',
        ammoType: 'ammo_bolt',
        weight: 0.05,
        value: 3,
        stackable: true,
        quantityPerStack: 10
    },
    'ammo_generic': {
        id: 'ammo_generic',
        name: 'Munizioni Generiche',
        description: "Proiettili di calibro sconosciuto o misto.",
        type: 'ammo',
        ammoType: 'ammo_generic',
        weight: 0.03,
        value: 1,
        stackable: true,
        quantityPerStack: 15
    },
    'ammo_revolver_generic': {
        id: 'ammo_revolver_generic',
        name: 'Munizioni per Revolver',
        description: "Proiettili di grosso calibro, adatti a vecchi revolver.",
        type: 'ammo',
        ammoType: 'ammo_revolver_generic',
        weight: 0.04,
        value: 3,
        stackable: true,
        quantityPerStack: 12
    },
    'ammo_shell': {
        id: 'ammo_shell',
        name: 'Cartucce da Fucile',
        description: "Pesanti cartucce caricate a pallettoni.",
        type: 'ammo',
        ammoType: 'ammo_shell',
        weight: 0.08,
        value: 5,
        stackable: true,
        quantityPerStack: 8
    },
    'ammo_arrow_crude': {
        id: 'ammo_arrow_crude',
        name: 'Frecce Grezze',
        description: "Frecce improvvisate, non molto aerodinamiche ma appuntite.",
        type: 'ammo',
        ammoType: 'ammo_arrow_crude',
        weight: 0.06,
        value: 2,
        stackable: true,
        quantityPerStack: 10
    },

    // --- ARMATURE ---
    // CORPO
    'leather_jacket_worn': {
        id: 'leather_jacket_worn',
        name: 'Giacca di Pelle Logora',
        nameShort: 'Giacca Logora',
        description: "Una vecchia giacca di pelle, indurita dal tempo e piena di graffi. Offre una protezione modesta.",
        type: "armor",
        equipable: true,
        stackable: false,
        slot: "body",
        armorValue: 2,
        durability: 40,
        maxDurability: 40,
        weight: 2.0,
        value: 15,
        effects: []
    },
    'armor_rags_simple': {
        name: "Armatura di Stracci Semplice",
        nameShort: "Arm. Stracci",
        description: "Diversi strati di tessuto robusto e pelli grezze cuciti insieme in modo rudimentale. Offre una protezione minima contro graffi e urti leggeri.",
        type: "armor",
        equipable: true,
        stackable: false,
        slot: "body",
        armorValue: 1,
        durability: 25,
        maxDurability: 25,
        weight: 1.2,
        value: 3,
        effects: []
    },
    'padded_jacket': {
        id: 'padded_jacket',
        name: 'Giacca Imbottita',
        description: "Una giacca spessa con imbottiture. Offre una protezione decente dal freddo e dai colpi.",
        type: 'armor',
        slot: 'body',
        armorValue: 2,
        durability: 35,
        maxDurability: 35,
        weight: 1.5,
        value: 25
    },
    'metal_plate_vest_crude': {
        id: 'metal_plate_vest_crude',
        name: 'Corpetto di Placche Metalliche Grezzo',
        nameShort: 'Corpetto Placche',
        description: "Placche di metallo di recupero cucite su un giubbotto. Pesante ma protettivo.",
        type: 'armor',
        slot: 'body',
        armorValue: 4,
        durability: 50,
        maxDurability: 50,
        weight: 3.0,
        value: 40
    },

    // TESTA
    'hard_hat': {
        id: 'hard_hat',
        name: 'Casco da Cantiere',
        description: "Un casco di plastica rigida. Protegge da colpi leggeri alla testa.",
        type: 'armor',
        slot: 'head',
        armorValue: 1,
        durability: 25,
        maxDurability: 25,
        weight: 0.5,
        value: 10
    },
    'motorcycle_helmet': {
        id: 'motorcycle_helmet',
        name: 'Casco da Moto',
        description: "Un casco integrale da motociclista, offre una buona protezione alla testa.",
        type: 'armor',
        slot: 'head',
        armorValue: 2,
        durability: 40,
        maxDurability: 40,
        weight: 1.2,
        value: 28
    },

    // ACCESSORI
    'gas_mask_damaged': {
        id: 'gas_mask_damaged',
        name: 'Maschera Antigas Danneggiata',
        nameShort: 'Masc. Antigas Dan.',
        description: "Una vecchia maschera antigas con il filtro rovinato. Potrebbe offrire una protezione limitata.",
        type: 'armor',
        slot: 'accessory',
        armorValue: 0,
        durability: 15,
        maxDurability: 15,
        weight: 0.6,
        value: 20
    },
    'knee_pads_worn': {
        id: 'knee_pads_worn',
        name: 'Ginocchiere Consumate',
        description: "Vecchie ginocchiere, utili per attutire qualche colpo o caduta.",
        type: 'armor',
        slot: 'accessory',
        armorValue: 1,
        durability: 20,
        maxDurability: 20,
        weight: 0.4,
        value: 12
    },

    // --- STRUMENTI E ALTRO ---
    'repair_kit': {
        id: 'repair_kit',
        name: 'Kit di Riparazione',
        description: "Attrezzi e materiali per riparare armi e armature danneggiate.",
        type: 'tool',
        usable: true,
        weight: 0.8,
        value: 35,
        effects: [{ type: 'repair_item_type', item_type_target: ['weapon', 'armor'], repair_amount: 15, charges: 1 }]
    },
    'lockpick_set_crude': {
        id: 'lockpick_set_crude',
        name: 'Set di Grimaldelli Grezzo',
        description: "Ferri sottili e piegati, utili per tentare di scassinare serrature semplici.",
        type: 'tool',
        usable: true,
        weight: 0.1,
        value: 20,
        charges: 3,
        effects: []
    },
    'map_fragment_local': {
        id: 'map_fragment_local',
        name: 'Frammento di Mappa Locale',
        description: "Un pezzo strappato di una mappa, mostra alcuni dettagli dell'area circostante.",
        type: 'tool',
        usable: true,
        weight: 0.05,
        value: 10,
        effects: [{ type: 'reveal_map_area', radius: 5 }]
    },
    'blueprint_water_purified': {
        id: 'blueprint_water_purified',
        name: 'Progetto: Acqua Purificata',
        nameShort: 'Prog: Acqua P.',
        description: "Istruzioni scarabocchiate su come rendere potabile l'acqua usando carbone.",
        type: 'blueprint', // Nuovo tipo
        usable: true,
        weight: 0.05,
        value: 15,
        effects: [{ type: 'learn_recipe', recipeKey: 'purify_water' }] // Nuovo tipo di effetto
    },
    'blueprint_meat_cooked': {
        id: 'blueprint_meat_cooked',
        name: 'Progetto: Carne Cotta',
        nameShort: 'Prog: Carne C.',
        description: "Un disegno grezzo che illustra come cuocere la carne su un fuoco.",
        type: 'blueprint',
        usable: true,
        weight: 0.05,
        value: 15,
        effects: [{ type: 'learn_recipe', recipeKey: 'cook_meat' }] // Nuovo tipo di effetto
    },
    'blueprint_shiv': { // Assumiamo che 'shiv_improvised' sia un oggetto producibile
        id: 'blueprint_shiv',
        name: 'Progetto: Punteruolo',
        nameShort: 'Prog: Punteruolo',
        description: "Affila un pezzo di metallo di scarto e legalo a un'impugnatura di fortuna per creare un'arma da taglio rudimentale.",
        type: 'blueprint',
        usable: true,
        weight: 0.05,
        value: 20,
        effects: [{ type: 'learn_recipe', recipeKey: 'craft_shiv' }] // Nuova recipeKey
    },
    'blueprint_crude_club': {
        id: 'blueprint_crude_club',
        name: 'Progetto: Mazza Grezza',
        nameShort: 'Prog: Mazza Gr.',
        description: "Istruzioni per legare un pezzo di metallo pesante a un bastone robusto.",
        type: 'blueprint',
        usable: true,
        weight: 0.05,
        value: 15,
        effects: [{ type: 'learn_recipe', recipeKey: 'craft_crude_club' }] // Nuova recipeKey
    },
    'blueprint_rags_armor': {
        id: 'blueprint_rags_armor',
        name: 'Progetto: Armatura di Stracci',
        nameShort: 'Prog: Arm. Stracci',
        description: "Come assemblare stracci e pezzi di cuoio per una protezione minima.",
        type: 'blueprint',
        usable: true,
        weight: 0.05,
        value: 10,
        effects: [{ type: 'learn_recipe', recipeKey: 'craft_rags_armor' }] // Nuova recipeKey
    },
    'craft_bandages_clean': {
        id: 'craft_bandages_clean',
        name: 'Bende Pulite',
        description: "Bende sterili, buone per ferite superficiali.",
        type: 'medicine',
        usable: true,
        weight: 0.1,
        value: 10,
        effects: [{ type: 'cure_status', status_cured: 'isInjured', chance: 0.7, heal_hp_on_success: 10 }]
    },
    'craft_crude_club': {
        productName: "Mazza Grezza", // Nome per UI
        productId: 'club_crude', 
        productQuantity: 1,
        ingredients: [
            { itemId: 'wood_planks', quantity: 2 }, 
            { itemId: 'cloth_rags', quantity: 1 }  
        ],
        description: "Lega insieme alcuni robusti pezzi di legno con degli stracci per creare una mazza contundente di fortuna."
    },
    'craft_rags_armor': {
        productName: "Armatura di Stracci", // Nome per UI
        productId: 'armor_rags_simple', // DEVI AGGIUNGERE QUESTO ITEM A ITEM_DATA
        productQuantity: 1,
        ingredients: [
            { itemId: 'cloth_rags', quantity: 3 },
            { itemId: 'string_piece', quantity: 2 } // Assicurati esista
        ],
        description: "Crea un'Armatura di Stracci.",
        successMessage: "Hai creato un'Armatura di Stracci."
    },
    'craft_healing_poultice': {
        productName: "Impiastro Curativo Semplice",
        productId: 'healing_poultice',
        productQuantity: 1,
        ingredients: [
            { itemId: 'berries', quantity: 2 },
            { itemId: 'cloth_rags', quantity: 1 },
            { itemId: 'water_dirty', quantity: 1 }
        ],
        description: "Combina bacche frantumate, stracci e un po' d'acqua sporca per creare un semplice impiastro curativo.",
        successMessage: "Hai creato un Impiastro Curativo Semplice."
    }
    // Aggiungere qui altre ricette base in futuro, se necessario
};

// --- FINE DEFINIZIONE OGGETTI ---

// --- DEFINIZIONE RICETTE DI CRAFTING BASE ---
const CRAFTING_RECIPES = {
    // Ricetta per purificare l'acqua
    'purify_water': {
        productName: "Acqua Purificata (Piccola)",
        productId: 'water_purified_small',
        productQuantity: 1,
        ingredients: [
            { itemId: 'water_dirty', quantity: 1 },
            { itemId: 'charcoal', quantity: 1 }
        ],
        description: "Purifica Acqua Sporca usando Carbone.",
        successMessage: "Hai purificato con successo l'acqua!"
    },
    // Ricetta per cuocere la carne
    'cook_meat': {
        productName: "Carne Cotta",
        productId: 'meat_cooked',
        productQuantity: 1,
        ingredients: [
            { itemId: 'meat_raw', quantity: 1 }
        ],
        description: "Cuoci Carne Cruda.",
        successMessage: "Hai cotto la carne."
    },
    // Nuove ricette
    'craft_shiv': {
        productName: "Punteruolo Improvvisato",
        productId: 'shiv_improvised',
        productQuantity: 1,
        ingredients: [
            { itemId: 'scrap_metal', quantity: 1 },
            { itemId: 'cloth_rags', quantity: 1 }
        ],
        description: "Affila un pezzo di metallo di scarto e legalo a un'impugnatura di fortuna per creare un'arma da taglio rudimentale.",
        successMessage: "Hai creato un Punteruolo Improvvisato."
    },
    'craft_crude_club': {
        productName: "Mazza Grezza",
        productId: 'club_crude',
        productQuantity: 1,
        ingredients: [
            { itemId: 'wood_planks', quantity: 2 },
            { itemId: 'cloth_rags', quantity: 1 }
        ],
        description: "Lega insieme alcuni robusti pezzi di legno con degli stracci per creare una mazza contundente di fortuna."
    },
    'craft_rags_armor': {
        productName: "Armatura di Stracci",
        productId: 'armor_rags_simple',
        productQuantity: 1,
        ingredients: [
            { itemId: 'cloth_rags', quantity: 5 }
        ],
        description: "Crea un'Armatura di Stracci.",
        successMessage: "Hai creato un'Armatura di Stracci."
    },
    'craft_healing_poultice': {
        productName: "Impiastro Curativo Semplice",
        productId: 'healing_poultice',
        productQuantity: 1,
        ingredients: [
            { itemId: 'berries', quantity: 2 },
            { itemId: 'cloth_rags', quantity: 1 },
            { itemId: 'water_dirty', quantity: 1 }
        ],
        description: "Combina bacche frantumate, stracci e un po' d'acqua sporca per creare un semplice impiastro curativo.",
        successMessage: "Hai creato un Impiastro Curativo Semplice."
    }
    // Aggiungere qui altre ricette base in futuro, se necessario
};
// --- FINE RICETTE --- 

console.log('[DEBUG game_data.js Definizione] CRAFTING_RECIPES:', JSON.stringify(CRAFTING_RECIPES, null, 2));

// --- TESTI VARIABILI (Flavor, Lore, Eventi Complessi) ---
// Questi array contengono la maggior parte dei testi descrittivi e narrativi del gioco.

// Flavor text per diversi tipi di tile (Giorno)
const flavorTextsPlains = [
    "Raffiche di vento sollevano polvere rossa che acceca e irrita i polmoni.", "Il silenzio qui è assoluto, innaturale. Pesa come una lapide sulla pianura.", "Ossa sbiancate dal sole, forse umane, punteggiano il terreno arido come macabri segnali.", "Una carcassa gonfia di animale non identificabile giace sotto il sole implacabile, divorata da sciami di insetti ronzanti. L'odore è nauseante.", "Un cielo color cenere si stende sopra di te, vasto e vuoto. Nessun uccello osa volare.",
    "Arbusti scheletrici e contorti artigliano la terra secca, un'ultima, vana resistenza.", "I resti contorti di una linea elettrica serpeggiano tra l'erba morta, inutili monumenti metallici.", "Il terreno duro e crepato sotto i tuoi stivali sembra assetato quanto te.", "Nessuna traccia di acqua o vita recente. Solo il vuoto che ti osserva.", "Ti senti terribilmente esposto e solo, un puntino insignificante in questo nulla sconfinato.",
    "Un sole pallido filtra a stento attraverso la cappa di polvere perenne, offrendo un calore illusorio.", "La carcassa arrugginita di un veicolo agricolo affonda nel terreno, quasi inghiottita dalla desolazione.", "Una colonna di fumo si leva all'orizzonte. Segnale di vita o presagio di pericolo?", "Nuvole basse e dense corrono veloci, minacciando una pioggia acida che non cade mai.", "Schegge di vetro scintillano nella polvere, frammenti di finestre esplose chissà quando.",
    "Lo scheletro arrugginito di una vecchia automobile giace riverso, le portiere spalancate come fauci.", "Uno stormo di uccelli neri come la pece si alza in volo all'improvviso, un grido rauco che lacera il silenzio.", "Il sole implacabile trasforma l'orizzonte in un miraggio tremolante di calore e disperazione.", "Una folata di vento porta un odore metallico e dolciastro... sangue vecchio o ruggine?", "Il terreno vibra leggermente sotto i piedi. Qualcosa di molto grosso si muove, non troppo lontano.",
    "Una singola antenna radio, piegata come un dito accusatore, si erge silenziosa contro il cielo pallido.", "Carcasse sbiancate di bestiame mutato punteggiano il paesaggio, moniti silenziosi.", "Il silenzio è così opprimente che il battito del tuo cuore rimbomba nelle orecchie.", "Piccoli vortici di sabbia danzano come spettri efimeri sul terreno crepato.", "Il sole malato si riflette su una distesa di vetro fuso, cicatrice lucida di un antico incendio.",
    "Schegge di plastica dai colori vivaci spuntano dalla polvere, ironici fiori di un'era morta.", "Il suolo sotto i tuoi piedi è stranamente caldo, come se un fuoco antico covasse ancora sotto la cenere.", "Una serie di crateri poco profondi deturpa la pianura, ricordo di bombardamenti o impatti?", "Un cartellone pubblicitario sbiadito mostra un sorriso congelato, promessa di un paradiso perduto per sempre.", "Resti contorti di un sistema di irrigazione arrugginito segnano il fantasma di campi un tempo fertili.",
    "Una singola scarpa da bambino, stranamente intatta, giace nella polvere. Un piccolo mistero doloroso."
];
const flavorTextsForest = [
    "Alberi contorti e malati si ergono come spettri, rami scheletrici che artigliano l'aria.", "Una luce verdastra filtra a stento dal fogliame innaturale, intrappolandoti in un crepuscolo perenne.", "Funghi bioluminescenti e pulsanti crescono sui tronchi marci, emettendo una luce fredda e spettrale.", "Una nebbiolina grigiastra e oleosa ristagna tra gli alberi, limitando la visibilità e irritando la gola.", "Movimenti furtivi nel sottobosso ti fanno trasalire, ma il silenzio torna subito, denso e ostile.",
    "Il terreno è un tappeto di foglie marce. L'odore dolciastro di decomposizione è quasi soffocante.", "Trappole arrugginite per animali, alcune ancora armate, sono nascoste sotto le foglie.", "Simboli inquietanti, incisi di recente sulla corteccia degli alberi, sembrano osservarti.", "Cervi dagli occhi vitrei e dal pelo chiazzato ti osservano immobili, prima di dissolversi come fumo tra gli alberi.", "Linfa rossastra e densa cola da alcuni tronchi, come sangue rappreso.",
    "Il vento tra le fronde malate sussurra parole indistinte, o forse è solo la tua immaginazione.", "Resti di un accampamento: un cerchio di cenere fredda, ossa animali spolpate e un silenzio pesante.", "Brandelli di teli di plastica impigliati tra i rami sbattono al vento, fantasmi di rifugi effimeri.", "La corteccia di un vecchio albero si contorce in una smorfia che ricorda un volto umano sofferente.", "Un cartello metallico arrugginito è quasi illeggibile: 'PER... ZONA ... NON PRO...'. Meglio non sapere.",
    "Ragnatele innaturalmente spesse, simili a corde, bloccano il passaggio tra gli alberi più nodosi.", "Un vecchio albero è ammantato da uno sciame di farfalle nere immobili. Un sudario vivente.", "Il terreno sotto i tuoi piedi è stranamente elastico, come se camminassi sul fianco di una bestia addormentata.", "Una polvere grigiastra e scintillante cade dai rami, depositandosi sui tuoi vestiti. Non sembra neve...", "Un cerchio perfetto di funghi color sangue circonda un piccolo altare di pietre annerite.",
    "Un ruscello serpeggia tra le radici, l'acqua ha un colore innaturale e rilascia vapori irritanti.", "Manichini mutilati, forse provenienti da un vecchio magazzino, pendono dai rami come macabri impiccati.", "Una pila ordinata di piccoli teschi animali giace in una radura silenziosa. Un rituale recente?"
];
const flavorTextsMountain = [
    "Un'eco distorta rimbalza tra le vette aguzze, suono inquietante che gela il sangue.", "Il sentiero è una sfida: ripido, franoso, disseminato di rocce taglienti come vetro.", "Un rapace solitario volteggia nel cielo plumbeo, un osservatore silenzioso e indifferente.", "Piccole pietre rotolano dall'alto. Una frana naturale o qualcuno ti osserva?", "La carcassa congelata di uno scalatore, un monito silenzioso contro la superbia in queste terre ostili.",
    "Il vento ulula tra le creste rocciose, un lamento spettrale che sembra portare voci dimenticate.", "Strutture metalliche contorte emergono dalla roccia come ossa spezzate, cicatrici di guerre passate.", "Dalla cima, la vista è immensa e desolata. Chilometri di nulla fino all'orizzonte.", "L'aria rarefatta brucia i polmoni. Ogni respiro è una conquista faticosa.", "L'imboccatura oscura di una caverna si apre nella roccia. Riparo o tomba?",
    "Chiazzze di neve sporca e antica resistono nelle zone d'ombra perenne.", "Un passaggio angusto tra pareti rocciose incombe, minacciando di schiacciarti come un insetto.", "Vecchi segni di piccozza sulla roccia, testimonianza silenziosa di chi ha osato sfidare queste vette prima di te.", "Un rivolo d'acqua gelida, quasi miracoloso, sgorga da una crepa nella roccia arida.", "Una croce fatta di tubi saldati svetta su un picco vicino. Monumento alla fede o semplice avvertimento?",
    "Ghiaccio sporco e antico, venato di nero, si aggrappa alle rocce sfidando il sole malato.", "Una frana recente ha squarciato il fianco della montagna, rivelando l'ingresso di una grotta profonda e buia.", "La carcassa di un piccolo velivolo è incastrata tra due picchi aguzzi, come un insetto in una ragnatela.", "Incisioni erose dal tempo sulla roccia... non sembrano opera umana. Qualcosa di più antico?", "Il freddo tagliente penetra i tuoi stracci logori, arrivando dritto alle ossa.",
    "Un tanfo nauseabondo di decomposizione fuoriesce da un passaggio stretto tra le rocce.", "I resti congelati di una spedizione: zaini intatti, occhi vitrei fissi sul vuoto. Un avvertimento muto.", "Il panorama sarebbe magnifico, se non fosse per il silenzio assoluto e mortale che lo avvolge."
];
const flavorTextsRiver = [
    "Detriti irriconoscibili e chiazze iridescenti fluttuano sulla corrente lenta e torbida.", "La riva fangosa cerca di inghiottire i tuoi stivali a ogni passo. Avanzare è estenuante.", "Un pesce mutato, gonfio e con occhi vitrei, galleggia a pancia in su, prova della tossicità dell'acqua.", "Il mormorio costante dell'acqua che scorre ha un effetto quasi ipnotico, pericoloso in questo silenzio.", "Le rovine di un vecchio ponte di cemento emergono dall'acqua come denti spezzati, creando gorghi insidiosi.",
    "Bolle maleodoranti salgono in superficie a intervalli irregolari. Gas o il respiro di qualcosa di sommerso?", "Immergendo una mano, senti che l'acqua è innaturalmente calda. Qualcosa non va.", "L'acqua ha un colore verdastro e lattiginoso, innaturale e respingente.", "Lo scheletro arrugginito di una barca da pesca giace incagliato sulla riva opposta, un monito silenzioso.", "Uno sciame di insetti mutati, grandi come il tuo pollice e dal ronzio metallico, pattuglia la riva.",
    "Il letto del fiume è un cimitero di oggetti contorti dal tempo e dalla corrente.", "Luci deboli tremolano sulla riva opposta. Sopravvissuti, miraggio o un'esca?", "L'aria vicino all'acqua ha un odore chimico acre che brucia le narici.", "Una scarpa logora è semisepolta nel fango della riva. Qualcuno è stato trascinato via qui?", "Banchi di nebbia innaturale e densa si aggrappano alla superficie dell'acqua, anche in pieno giorno.",
    "L'acqua ha un colore malato, verdastro, con una patina oleosa che luccica debolmente.", "Una barca squarciata è incagliata sulla riva, uno scheletro pieno di fango e lische di pesce.", "Percepisci un movimento lento e pesante sotto la superficie torbida. Qualcosa di grosso e viscido.", "La nebbia sale dall'acqua come un sudario freddo e umido, divorando la visibilità.", "Pilastri di cemento di un vecchio molo emergono dall'acqua come lapidi dimenticate.",
    "Un cartello arrugginito è ancora leggibile: 'DIVIETO DI BALNEAZIONE - RISCHIO BIOLOGICO ESTREMO'.", "Bolle ritmiche salgono in superficie, come il respiro regolare di una creatura sommersa.", "Un'onda improvvisa, troppo grande per essere causata dal vento, increspa la superficie torbida."
];
const flavorTextsCity = [
    "Il vento geme lugubremente attraverso le finestre sfondate di grattacieli scheletrici.", "Un vecchio manifesto strappato raffigurante una famiglia sorridente sventola pateticamente da un muro crepato.", "Carcasse arrugginite di veicoli di ogni tipo formano barricate contorte e inutili lungo le strade.", "Un silenzio spettrale avvolge le strade deserte, rotto solo dai tuoi passi e dal crepitio dei detriti.", "Trovi una bambola rotta, con un occhio mancante e un sorriso inquietante, tra le macerie di una casa.",
    "Un monitor rotto emette ancora una debole luce statica verdastra, come un fantasma tecnologico.", "Graffiti criptici e simboli inquietanti coprono quasi ogni superficie verticale, messaggi dai folli o dagli avvertiti.", "L'odore acre di bruciato e decomposizione persiste nell'aria, un profumo costante di morte.", "Hai la costante, spiacevole sensazione di essere osservato dalle migliaia di finestre vuote.", "Polvere di cemento ti irrita gli occhi e la gola, rendendo ogni respiro difficoltoso.",
    "Un semaforo dondola precariamente da un palo piegato, bloccato su un rosso eterno.", "Un negozio di lusso saccheggiato, manichini nudi e vetrine infrante giacciono come corpi.", "La carcassa scheletrica di un autobus urbano giace su un fianco, le porte aperte come una bocca urlante.", "Un vento freddo si incanala tra gli edifici, portando con sé suoni indistinti... voci o lamenti?", "Il fruscio della plastica impigliata tra le macerie suona come passi furtivi.",
    "Un palazzo di uffici ha un intero lato collassato, rivelando piani devastati come un alveare aperto.", "Un semaforo dondola cigolando nel vento, le luci spente per sempre.", "Senti il pianto soffocato di un bambino... ma quando ti avvicini, è solo il vento che fischia in un tubo rotto.", "Manifesti sbiaditi promettono un futuro luminoso che non è mai arrivato.", "Un orsacchiotto di peluche, sporco e senza un occhio, è seduto su una pila di macerie.",
    "L'odore acre di bruciato persiste nell'aria, anche dopo anni.", "Qualcosa stride e si trascina all'interno di un edificio abbandonato vicino."
];
const flavorTextsVillage = [
    "Tende lacere e baracche di lamiera sbattono nel vento, scheletri di un accampamento abbandonato.", "Le ceneri fredde di un fuoco da campo sono circondate da pentole arrugginite e ossa animali spolpate.", "Oggetti personali dimenticati nella polvere: una scarpa da bambino, un libro ammuffito, una foto sbiadita.", "Nessun segno di vita recente. Solo silenzio, polvere e un leggero odore di morte.", "Un'atmosfera opprimente grava su questo luogo. Qui è accaduto qualcosa di terribile, lo senti.",
    "Resti di barricate rudimentali e macchie scure sul terreno testimoniano una lotta violenta.", "Una pentola ammaccata accanto alla cenere fredda. L'ultimo, misero pasto, non fu mai consumato.", "Chi viveva qui ha cercato disperatamente di fortificare il posto. Le difese violate raccontano il loro fallimento.", "L'aria sa di polvere stantia, abbandono e quel sottile, dolce odore di malattia.", "Piccoli tumuli di terra smossa segnati da croci fatte di rami. Tombe fresche ai margini dell'accampamento.",
    "Un carillon rotto, mosso dal vento, emette una melodia stonata e malinconica.", "Le tende squarciate e vuote sembrano bocche spalancate che urlano al cielo silenziosamente.", "Un orsacchiotto senza un occhio giace nel fango vicino a una tenda. Un piccolo fantasma di innocenza perduta.", "Brandelli logori di una bandiera dimenticata sbattono debolmente su un palo improvvisato.", "Il silenzio qui è innaturale, pesante. Come se tutti fossero svaniti in un istante.",
    "Una pentola annerita dondola su un treppiede improvvisato, sopra un letto di cenere fredda.", "Disegni infantili, tracciati col carbone su un pezzo di lamiera, raffigurano eroi improbabili e mostri fin troppo reali.", "Una fila di piccole tombe, segnate da pietre rozze, si allinea ai margini del villaggio. Molte sono piccole.", "Una scritta frettolosa sulla parete di una baracca: 'SONO ANDATI A NORD. CHE DIO CI AIUTI'.", "C'è un silenzio carico di attesa, come se gli abitanti fossero appena usciti e potessero tornare da un momento all'altro.",
    "Una scacchiera fatta a mano, con tappi di bottiglia e bulloni arrugginiti come pezzi. Qualcuno cercava normalità qui.", "Un diario recuperato da una pozza d'acqua: le pagine sono incollate, piene di simboli indecifrabili e macchie scure.", "Tracce di un esodo disperato e improvviso sono ovunque. Cosa li ha fatti fuggire così in fretta?"
];
const flavorTextsRestStop = [
    "Questo rifugio è un fragile assemblaggio di lamiere arrugginite, teli strappati e speranze infrante.", "Segni di passaggio recente: un graffito sul muro ('NON DORMIRE'), strani talismani fatti di ossa e fili.", "Un odore acre di fumo stantio, urina e umidità impregna l'aria. Il fetore della sopravvivenza.", "Dall'esterno sembra quasi sicuro, ma una volta dentro, un senso di disagio ti attanaglia.", "Un giaciglio di stracci luridi in un angolo. Qualcuno ha dormito qui, forse stanotte stessa.",
    "Il silenzio qui è innaturale, opprimente. Come se le pareti avessero assorbito le urla dei precedenti occupanti.", "Il tetto improvvisato gocciola un liquido scuro e viscoso, anche se fuori non piove.", "Scritte sul muro contano i giorni: 'Sopravvissuto: 12', '13'... poi solo un graffio profondo che cancella ogni speranza.", "Un materasso sudicio e squarciato è gettato in un angolo, coperto di macchie scure e inquietanti.", "Una lattina vuota rotola rumorosamente sul pavimento al tuo ingresso, un suono assordante nel silenzio.",
    "Un debole odore dolciastro aleggia nell'aria. Prodotti chimici, decomposizione... o qualcos'altro?", "Le pareti sono una tela per disegni infantili disturbanti e simboli arcani che non riconosci.", "Una vecchia radio a manovella giace su un tavolo improvvisato. Silenziosa, ma forse non per sempre.", "Il gocciolio ritmico e costante di acqua (o qualcos'altro?) da qualche parte nel buio è l'unico suono.", "La polvere spessa attutisce ogni rumore, creando una cappa di silenzio quasi soffocante.",
    "Qualcuno ha tentato di rendere questo posto 'casa', appendendo tendine strappate che ora penzolano come fantasmi.", "Un graffito rozzo avverte: 'Non fidarti delle ombre. Cantano.'", "C'è un odore pungente di disinfettante chimico, un tentativo disperato di coprire un tanfo ben peggiore.", "Un elenco di nomi è graffiato sul metallo arrugginito. Molti nomi sono stati violentemente cancellati.", "La porta di questo rifugio è stata chiaramente rinforzata dall'interno. Paura di cosa?",
    "Una vecchia foto di famiglia è incollata al muro. I volti sono stati accuratamente bruciati via.", "Resti di provviste accumulate: scatole vuote, involucri strappati. Qualcuno si preparava a resistere a lungo.", "Una cassetta del pronto soccorso aperta e saccheggiata pende dal muro, garze sporche sparse sul pavimento."
];

// Flavor text per diversi tipi di tile (Notte) - Meno variati per ora, focalizzati su Pianura e Foresta
const flavorTextsNightPlains = [
    "Un silenzio innaturale avvolge la pianura. Solo il tuo respiro rompe la quiete sotto la luna malata.", "La luna proietta ombre danzanti e distorte. Per un attimo, sembrano creature striscianti.", "Il vento notturno ulula tra l'erba secca, portando echi di voci o forse solo fischi sinistri.", "Un fruscio improvviso nell'erba alta ti fa trasalire. Ti giri di scatto, ma vedi solo ombre.", "Le stelle sono punte di ghiaccio in un cielo nero e profondo. Osservatori freddi e distanti.",
    "Un grido disumano lacera la quiete notturna in lontananza. Meglio non sapere cosa fosse.", "L'oscurità qui è quasi tangibile, densa, pronta a divorare la luce flebile della tua torcia.", "Una sagoma indistinta corre veloce all'orizzonte, troppo rapida per essere identificata. O per essere naturale.", "Il terreno sembra pulsare debolmente sotto i tuoi piedi, come il respiro di una bestia enorme addormentata.", "Il freddo pungente della notte penetra fino alle ossa, portando una stanchezza profonda e pericolosa.",
    "Luci fatue, fredde e azzurrine, danzano all'orizzonte. Spiriti erranti o gas velenosi?", "L'orizzonte notturno è un mare nero e infinito. Nessuno riparo, nessuna speranza in vista.", "Nuvole rapide oscurano la luna a intermittenza, immergendo il mondo in un buio ancora più profondo e improvviso.", "Una brezza gelida porta un odore acre e metallico. Ruggine, o sangue rappreso?", "Un suono basso e vibrante sale da sottoterra. Lontano, ma abbastanza vicino da inquietarti.",
    "La temperatura crolla bruscamente. Il tuo respiro si condensa in nuvole spettrali davanti a te.", "Coppie di occhi luminosi ti osservano dall'erba alta, immobili, per poi svanire nel nulla.", "Un bagliore verdastro e pulsante illumina debolmente l'orizzonte. Non sembra un fenomeno naturale.", "Colonne di vapore caldo salgono dal terreno screpolato in alcuni punti, come sbuffi dalla terra.", "Alla luce spettrale della luna, la tua ombra sembra muoversi per conto proprio, un compagno infido.",
    "Sciami di piccoli insetti luminescenti pulsano nell'aria con una luce fredda e innaturale.", "Echi distanti portano frammenti di conversazioni spezzate o forse solo il lamento del vento.", "Le stelle sembrano convergere tutte verso un punto oscuro all'orizzonte. Un presagio?"
];
const flavorTextsNightForest = [
    "Ogni scricchiolio di rami secchi sotto i piedi suona come uno sparo nel silenzio notturno.", "Forme contorte si muovono furtive tra gli alberi, ai margini della tua vista. Ombre o creature?", "Un odore dolciastro e metallico impregna l'aria gelida della notte. Sangue fresco?", "Il buio qui è quasi assoluto, denso, soffocante come terra bagnata.", "Senti il fruscio pesante di grandi ali che passano silenziose sopra la tua testa, oscurando le stelle.",
    "Due occhi gialli e innaturali ti fissano dal buio più profondo, poi svaniscono con un fruscio.", "La foresta notturna è viva e ostile. Ogni albero sembra nascondere un predatore in agguato.", "Inciampi su una radice nascosta nell'ombra, cadendo quasi. Il cuore ti balza in gola.", "Un sussurro gelido ti sfiora l'orecchio, sembra pronunciare il tuo nome... o è solo il vento tra le foglie?", "La luce spettrale della luna filtra a fatica tra le chiome contorte, disegnando ombre ingannevoli.",
    "Un respiro rauco e umido, molto vicino. Ma da dove proviene?", "Il silenzio è così teso e carico che senti il sangue pulsare forte nelle tempie.", "Funghi bioluminescenti proiettano una luce fredda e inquietante su tronchi e radici contorte.", "Il terreno cede leggermente sotto i tuoi passi, soffice e umido come carne.", "All'improvviso, ogni suono cessa. Un silenzio innaturale e pesante cala sulla foresta, più terrificante di qualsiasi rumore."
];
// Aggiungere array simili per altri biomi di notte se necessario (flavorTextsNightRiver, etc.)


// Descrizioni per incontri con predoni
const descrizioniIncontroPredoni = [
    "Figure minacciose emergono dall'ombra. I loro vestiti sono logori ma le armi sono ben tenute. Nei loro occhi vedi la fame... e qualcosa di peggio.",
    "Un fischio acuto rompe il silenzio. Ti ritrovi circondato da sagome umane con volti nascosti da maschere improvvisate e stracci. Le loro intenzioni sono chiare.",
    "Un gruppo di sopravvissuti dall'aspetto feroce blocca il tuo cammino. Le loro facce sono segnate dalle cicatrici, sia visibili che nascoste. Uno di loro avanza, mano sull'arma.",
    "Vedi troppo tardi i segni di un'imboscata. Una decina di occhi affamati ti fissano dalle posizioni di agguato. Il loro capo gesticola in un linguaggio silenzioso di predazione.",
    "Dei reietti emergono dalle rovine, accerchiandoti con movimenti studiati. Le loro armi di fortuna sono logoranti quanto i loro corpi, ma non meno letali.",
    "Una banda di sopravvissuti ti circonda con freddezza calcolata. La disperazione ha trasformato queste persone in predatori. Oggi tu sei la preda.",
    "Una donna con metà volto coperto da cicatrici ti punta contro un fucile arrugginito. Dietro di lei, altri predoni attendono il segnale. Nessuno sorride, è solo sopravvivenza.",
    "Un gruppo di giovani dall'aspetto selvaggio si para davanti a te. Troppo giovani per ricordare il mondo prima, conoscono solo la legge del più forte.",
    "Uomini e donne con simboli tribali dipinti sul viso si materializzano come spettri attorno a te. Le loro intenzioni sono chiare: ciò che è tuo presto sarà loro."
];

// Frammenti di Lore (trovati casualmente o legati a eventi)
const loreFragments = [
    "Pagina strappata di diario: '... giorno 47. Le scorte sono finite. Ho sentito di un posto sicuro a est, oltre le montagne spezzate. Forse è solo una favola per disperati come me, ma è la mia ultima speranza...'", "Pezzo di metallo inciso a laser: 'Progetto Chimera - Soggetto #007 - Proprietà del Lab 7 - TERMINATO'", "Ologramma tremolante da un dispositivo rotto: '...protocollo di contenimento fallito... bio-agente [CLASSIFICATO] fuori controllo... Evacuare immediatamente... che Dio ci aiuti...'", "Scheda dati danneggiata e macchiata: '...mutazione instabile di Tipo IV... aggressività esponenziale... protocollo suggerito: eliminare a vista con armi incendiarie...'", "Scarpa da bambino logora accanto a una piccola croce fatta di rametti e filo spinato.",
    "Graffito tracciato col sangue su un muro: 'Non fidatevi dell'acqua che brilla. NON BEVETELA.'", "Registrazione audio disturbata, voce maschile: '...stanno arrivando... le pareti non reggeranno... dite a mia figlia che l'amavo... il suo nome è Lily... *statica assordante*'", "Mappa disegnata a mano su un pezzo di pelle umana conciata: Indica un percorso verso un luogo chiamato 'L'Oasi sotto le Stelle Cadute', ma è strappata a metà.", "Messaggio inciso rozzamente su una capsula di proiettile 7.62: 'Per Mamma. Mi dispiaccio.'", "Libro bruciacchiato ('Miti Pre-Collasso') con una sola pagina leggibile: '...e così gli Antichi Dei dormirono nelle profondità della terra e del cielo, lasciando il mondo al silenzio e ai loro figli distorti...'",
    "Audio-log recuperato da un registratore militare: '...Soggetto 17 mostra rigenerazione cellulare accelerata... ma anche psicosi acuta... aggressività incontrollabile... perdita contenimento imminente... sterilizzare l'area...'", "Biglietto scritto a mano con grafia tremante: 'Se leggi questo, sono andato a cercare acqua al Vecchio Impianto Idrico. Non seguirmi, è pieno di Quei Cosi. Trova il Safe Place. Ti voglio bene. Papà.'", "Distintivo militare corroso dall'acido: Riporta il simbolo di un teschio alato e la scritta 'Guardiani del Lab - Unità Epurazione'.", "Terminale medico portatile, schermo rotto ma leggibile: Mostra una lettura parziale: 'Contaminazione Biologica Tipo Gamma - Necrosi Tessutale Rapida - Esposizione fatale entro 2 ore...'.", "Fotografia olografica incrinata e tremolante: Mostra una città vibrante e piena di luci volanti colorate, un'immagine quasi dolorosa da guardare ora.",
    "Bozza di messaggio non inviato, scritta su un tablet rotto: '...Eliza, non ce la faremo a raggiungerti. Le scorte bastano per uno solo. Prenditi cura di Ultimo... digli che la sua mamma era un'eroina... e che...'", "Schema tecnico strappato e macchiato: Descrive un 'Generatore Atmosferico Classe Arca' progettato per purificare l'aria su larga scala... mai attivato?", "Simbolo religioso improvvisato fatto di ossa umane, fili metallici e componenti elettronici.", "Ritaglio di giornale pre-guerra ('Il Cronista Globale'): Titolo: 'Nuova Era di Prosperità o Fuga dalla Realtà? Le Volte Salveranno l'Umanità o la Divideranno per Sempre?'", "Piccolo carillon arrugginito a forma di stella. Quando lo apri, suona una melodia triste e rivela uno scomparto segreto con dentro una chiave minuscola e ossidata.",
    "Appunto scarabocchiato su un tovagliolo unto: 'Segui il fiume morto verso il sole calante. Cerca la roccia che piange. Lì troverai la porta... se oserai bussare.'", "Chip dati incrinato e parzialmente fuso. Impossibile leggerlo senza l'attrezzatura di un Lab... o forse qualcosa di peggio.", "Manuale tecnico strappato ('Manutenzione Ripari Classe-C'): '...il sistema di filtraggio dell\'aria HEPA richiede sostituzione nucleo ogni 500 ore operative per evitare contaminazione interna...'", "Lista della spesa macchiata di sangue: 'Acqua (min. 5L), Munizioni (tutte!), Scatolette (proteine!), Nastro adesivo (molto!), Antidolorifici... Speranza (se ne trovi)...'", "Pagina di un bestiario improvvisato, scritto a mano con disegni disturbanti: Descrive una creatura notturna senza volto chiamata 'Il Sussurrante delle Ombre', che si nutre di ricordi.",
    "Rapporto tecnico parzialmente bruciato: '...il Geo-Core di Sektor Gamma è instabile. Rischio di collasso quantico entro 48h. Evacuare...'", "Messaggio scarabocchiato sul retro di una foto di famiglia sorridente: 'Non sono riuscito a salvarli. La nebbia... li ha presi...'", "Ordine militare criptato (decifrato parzialmente): '...Protocollo Cenere attivato su [REDACTED]. Nessun sopravvissuto autorizzato. Silenzio totale.'", "Capsula medica vuota etichettata 'Naniti Riparatori - Prototipo X'. Sembra usata di recente.", "Frammento di trasmissione radio intercettata: '...i Corvi Neri hanno sfondato a ovest. Ripeto, i Corvi Neri... la Vecchia Capitale cadrà...'",
    "Diario di un medico del Lab 9: 'Giorno 112. Le mutazioni accelerate nel Settore Delta sono... inaspettate. Aggressività fuori scala. Abbiamo creato mostri.'", "Tessera d'accesso corrosa: 'Lab 4 - Livello Sicurezza Alpha - Dott.ssa Eva Rostova'", "Manifesto propagandistico strappato: 'L'Unione Pan-Europea garantisce sicurezza! Denunciate i dissidenti! Il futuro è ordine!'", "Lista di nomi incisa su un muro con un coltello: 'Hans, Greta, Lena, Karl... Perdonatemi.'", "Progetto tecnico di un'arma energetica portatile chiamata 'Lancia Solare'. Manca la pagina del generatore.",
    "Avviso di quarantena biologica sbiadito e strappato, affisso alla porta di un bunker sigillato dall'esterno.", "Registrazione audio recuperata da un drone abbattuto: '...zona contaminata confermata. Livelli Gamma letali. Nessun segno di vita organica... solo... movimento...'", "Lettera non spedita: 'Mia cara Anya, se leggi questo, vuol dire che non torno. Ho visto cose indicibili oltre il Muro Est. Il 'Safe Place' non è ciò che credono...'", "Simbolo tribale dipinto con sangue e fango su un carro armato abbandonato. Sembra un avvertimento.", "Schema di un 'Filtro Psichico Classe-3'. Promette protezione dalle 'influenze esterne', ma richiede componenti introvabili.",
    "Etichetta di razione militare: 'Eurasian Concordat - Pasto N.7 - Scadenza: --/--/--'", "Richiesta di evacuazione medica urgente, negata: '...impossibile raggiungere la posizione. Priorità strategiche altrove. Sacrificio necessario.'", "Pagina di libro per bambini ('Le Fiabe della Vecchia Europa') con disegni inquietanti scarabocchiati sopra le illustrazioni originali.", "Componente elettronico non identificato, ancora caldo al tatto, che emette un debole ronzino.", "Messaggio in codice lasciato in un punto di scambio morto: 'Aquila non risponde. Il pacco è compromesso. Procedere con Protocollo Omega.'",
    "Registrazione su un vecchio data-slate crepato: 'Giorno 112. La mutazione si diffonde più velocemente del previsto. I sintomi neurologici sono... preoccupanti. Stiamo perdendo il controllo. Il Lab 7 deve essere sigillato. Ripeto, sigillat...' *fine registrazione*.", "Frammento di tessuto strappato da un'uniforme militare. C'è una mostrina sbiadita con un teschio alato e la scritta 'Angeli della Cenere'.", "Pagina di un manuale tecnico illustrato: mostra lo schema di un 'Purificatore d'Acqua Modello Aqualux VII', ma diverse componenti cruciali sono illeggibili o strappate.", "Graffito complesso tracciato con vernice spray fluorescente su un muro crollato: raffigura un labirinto che converge verso un occhio stilizzato.", "Piccola scatola di metallo arrugginita. Dentro, una ciocca di capelli biondi legata con un nastro sbiadito e una nota: 'Tornerò. Promesso. - Papà'.",
    "Chip dati militare. Inserendolo in un terminale funzionante, potresti accedere a vecchie mappe tattiche o rapporti classificati.", "Libro di fiabe per bambini, 'Le Avventure di Capitano Cometa'. Le pagine sono rovinate dall'umidità, ma le illustrazioni colorate di razzi e pianeti alieni sono ancora visibili.", "Messaggio lasciato in una bottiglia vicino a un fiume prosciugato: 'Se leggi questo, vai a Ovest. Evita le guglie di vetro. Cantano di notte. Non ascoltarle.'", "Terminale medico portatile, schermo crepato. Log: Paziente 04-B - Esposizione a 'Nebbia Cinerea'. Sintomi: cristallizzazione epidermica, paranoia acuta. Prognosi: infausta. Ultimo aggiornamento: 8 anni fa.", "Pezzo di ceramica dipinta, forse parte di un vaso antico. Raffigura figure umanoidi che adorano un sole nero.",
    "'Guida Pratica alla Sopravvivenza nel Dopocrollo' - Edizione Pirata. Molte pagine sono dedicate a come cucinare ratti e riconoscere funghi velenosi.", "Comunicazione radio intercettata e trascritta su un foglio: '...ripetere, Eco-Alfa-Uno, la Zona di Quarantena è compromessa. Protocollo Scudo Divino attivato. Che Dio ci perdoni...'", "Schema tracciato su un tovagliolo di carta: mostra come modificare una batteria d'auto per creare un'arma a impulsi elettromagnetici. Sembra pericoloso.", "Un dente innaturalmente grande e affilato, forse appartenuto a una creatura mutata. È stranamente caldo al tatto.", "Relazione scolastica scritta a mano da un bambino: 'Il mio animale preferito è il Gatto Ombra. È soffice e silenzioso e mangia i brutti sogni'."
];

const descrizioniIncontroBestie = [
    "Un {animale} mutato e dall'aspetto aggressivo ti blocca il passo, ringhiando minacciosamente.",
    "Sbuca dai cespugli un {animale} dalle dimensioni innaturali, gli occhi iniettati di sangue fissi su di te.",
    "Un {animale} ferito e disperato ti carica, considerandoti una minaccia o un pasto facile.",
    "Un {animale} dall'aspetto malato e contagioso barcolla verso di te, ignorando ogni tentativo di dissuasione.",
    "Un {animale} ti osserva da lontano con un'intelligenza inquietante nei suoi occhi non del tutto animali."
];

const tipiBestie = [
    "Ratto Gigante", "Cane Selvatico", "Sciame di Insetti Mutati", "Corvo Bicefalo", "Salamandra Velenosa", "Lupo Mutato", "Cinghiale Corazzato"
];

const descrizioniTracce = [
    "Noti delle impronte insolite nella polvere, non sembrano umane né di alcun animale conosciuto.",
    "Una serie di graffi profondi su un muro diroccato attira la tua attenzione. Cosa li ha causati?",
    "Macchie scure e recenti sul terreno. Sangue, olio o qualcos'altro?",
    "Un odore metallico e pungente ti guida verso un angolo nascosto. Sembra provenire da lì.",
    "Piccoli cumuli di pietre disposti in uno schema regolare. Un segnale o solo una coincidenza?",
    "Segni di trascinamento sul terreno indicano che qualcosa di pesante è stato spostato di recente.",
    "Un oggetto luccicante è semisepolto tra le macerie. Potrebbe essere qualcosa di utile o solo un riflesso."
];

const esitiSeguiTracceOkNulla = [
    "Decidi che non vale la pena rischiare per delle tracce incerte. Prosegui.",
    "Hai cose più importanti a cui pensare che seguire ogni segno sospetto. Tiri dritto.",
    "L'istinto ti dice di lasciar perdere. A volte, l'ignoranza è la scelta più sicura."
];

// Esiti per Fuga Predoni KO
const esitiFugaPredoniKo = [
    "Ti prendono quasi subito. La loro velocità è sorprendente.",
    "Inciampi e cadi rovinosamente. Sei alla loro mercé.",
    "Ti circondano rapidamente, bloccando ogni via di fuga.",
    "Un proiettile vagante o un colpo ben piazzato ti ferisce mentre scappi, rallentandoti.",
    "Corri in un vicolo cieco. Trappola mortale."
];

// Esiti per Parla Predoni KO
const esitiParlaPredoniKo = [
    "Le tue parole sono solo rumore per loro. Ridono della tua ingenuità prima di colpirti.",
    "Il capo ti zittisce con uno sguardo gelido. Non c'è spazio per la diplomazia qui.",
    "Appena apri bocca, uno di loro ti colpisce alle spalle.",
    "'Parole? Il cibo parla più forte!', ringhia uno di loro.",
    "Ti ascoltano in silenzio, poi scuotono la testa. Non sono interessati."
];

// Aggiungere qui altre descrizioni per eventi complessi (Villaggio Ostile, Rifugio Strano, Pericolo Ambientale, Dilemma Morale, Orrore)
// ...

// --- FINE DATI STATICI ---

// Messaggi specifici per il tentativo di attraversare ostacoli
const mountainBlockMessages = [
    "Guardando la parete rocciosa, ti rendi conto che tentare la scalata sarebbe un suicidio.",
    "La montagna sembra fissarti dall'alto. Non hai l'equipaggiamento né l'esperienza per provarci.",
    "Un ragazzino di 17 anni non scala queste vette. Ci vuole più di un po' di coraggio.",
    "Queste rocce sono troppo ripide e friabili. Meglio cercare un altro sentiero.",
    "Senti i muscoli lamentarsi solo a guardare quelle cime. Trovare un percorso alternativo è l'unica scelta sensata."
];

// Descrizioni per eventi complessi di Orrore Indicibile
const descrizioniOrroreIndicibile = [
    "Senti un sussurro gelido direttamente nella tua mente, parole in una lingua morta che promettono oblio.",
    "Le ombre sembrano allungarsi e contorcersi, assumendo forme vagamente umanoidi che ti osservano da ogni angolo.",
    "Un odore nauseabondo di decomposizione e ozono ti riempie le narici. Qualcosa di innaturale è vicino.",
    "La temperatura precipita inspiegabilmente. Vedi il tuo respiro condensarsi mentre un terrore primordiale ti attanaglia.",
    "Una risata infantile e distorta riecheggia nel silenzio, ma non c'è nessuno..."
];

// Pool di ricompense casuali per handleRandomRewardType in js/events.js
const RANDOM_REWARD_POOLS = {
    COMMON_RESOURCE: [
        { id: 'scrap_metal', weight: 30 },
        { id: 'charcoal', weight: 20 },
        { id: 'bandages_dirty', weight: 20 }, // Spostato qui da medical per renderlo più comune
        { id: 'water_dirty', weight: 15 },
        { id: 'wood_planks', weight: 25 },
        { id: 'cloth_rags', weight: 20 }
    ],
    RARE_RESOURCE: [ // Include anche strumenti rari
        { id: 'mechanical_parts', weight: 35 },
        { id: 'repair_kit', weight: 20 },
        { id: 'vitamins', weight: 15 }, // Spostato qui da medical perché più un "consumabile raro" che una cura specifica
        { id: 'lockpick_set_crude', weight: 15 },
        { id: 'map_fragment_local', weight: 10 }
    ],
    MEDICAL_ITEM: [ // Medicine più mirate e specifiche
        { id: 'bandages_clean', weight: 30 },
        { id: 'suspicious_pills', weight: 15 },
        { id: 'herbal_salve', weight: 20 },
        { id: 'medicine_crude', weight: 20 },
        { id: 'antidote', weight: 10 },
        { id: 'first_aid_kit', weight: 5 } // Raro e potente
    ],
    FOOD_ITEM: [
        // Cibi base/comuni
        { id: 'canned_food', weight: 25 },
        { id: 'ration_pack', weight: 20 },
        { id: 'berries', weight: 10 }, // Rischioso, quindi meno frequente dei cibi sicuri
        { id: 'chips_stale', weight: 15 },
        { id: 'canned_beans', weight: 20 },
        { id: 'meat_raw', weight: 8 }, // Richiede cottura, quindi meno frequente
        // Cibi migliori/più rari
        { id: 'chocolate_bar', weight: 12 },
        { id: 'dried_fruit', weight: 15 },
        { id: 'protein_bar_old', weight: 12 },
        { id: 'mystery_meat_cooked', weight: 10 }, // Rischio minore ma sempre "misterioso"
        { id: 'meat_cooked', weight: 10 },
        { id: 'mre_pack', weight: 5 } // Molto nutriente, quindi raro
    ],
    WATER_ITEM: [
        // Acqua/bevande base/comuni
        { id: 'water_purified_small', weight: 30 },
        { id: 'water_dirty', weight: 20 }, // Comune ma rischiosa
        { id: 'soda_flat', weight: 15 },
        { id: 'rainwater_collected', weight: 18 }, // Rischiosa, ma più comune di altre "trovate"
        // Acqua/bevande migliori/più rare
        { id: 'juice_box_found', weight: 12 },
        { id: 'herbal_tea_crude', weight: 10 },
        { id: 'energy_drink_old', weight: 8 },
        { id: 'water_bottle', weight: 5 } // Acqua già purificata e in buona quantità, quindi più rara nei pool generici
    ],
    RANDOM_WEAPON_POOL: [
        // Armi da mischia base
        { id: 'wooden_club', weight: 20 },
        { id: 'kitchen_knife', weight: 15 },
        { id: 'shiv_improvised', weight: 18 },
        { id: 'metal_bar', weight: 12 },
        // Armi da mischia leggermente migliori o armi da lancio
        { id: 'pipe_wrench', weight: 8 },
        { id: 'combat_knife', weight: 7 },
        { id: 'machete_rusty', weight: 6 },
        { id: 'baseball_bat', weight: 7 },
        { id: 'throwing_knife', weight: 10 }, // Stackable, quindi può apparire più spesso
        { id: 'rock_sharp', weight: 15 }, // Molto comune, arma disperata
        // Armi a distanza più rare o di livello base
        { id: 'improvised_bow', weight: 5 },
        { id: 'pistol_makeshift', weight: 3 } // Rara e inaffidabile
        // Le armi più potenti (revolver, shotgun, crossbow_simple) sono lasciate per loot specifico
    ],
    RANDOM_AMMO_POOL: [
        // Munizioni più comuni o per armi base
        { id: 'ammo_arrow_crude', weight: 25 },
        { id: 'ammo_generic', weight: 20 }, // Generiche, quindi più comuni
        { id: 'ammo_9mm', weight: 15 }, // Per pistola makeshift
        { id: 'ammo_bolt', weight: 10 }, // Per balestra semplice (se si trova la balestra)
        { id: 'ammo_revolver_generic', weight: 8 },
        { id: 'ammo_shell', weight: 5 } // Per fucile, quindi più rare
    ]
    // CLOTHING_ITEM è gestito dinamicamente in handleRandomRewardType filtrando ITEM_DATA per type 'armor' o category 'Clothing'.
};

// Array per descrizioni evento tracce - Esito OK, trovato Lore
const descrizioniTracceOkLore = [
    "Le tracce ti conducono a un vecchio diario consumato. Contiene frammenti di storie del Vecchio Mondo.",
    "Seguendo le impronte, scopri incisioni sbiadite su una roccia, che narrano di tempi passati.",
    "Le tracce terminano vicino a un oggetto arrugginito che sembra avere un significato storico o culturale."
];

const descrizioniTracceOkLoot = [
    "Seguendo le tracce con attenzione, scopri una piccola scorta di oggetti utili nascosta nelle vicinanze!",
    "L'analisi meticolosa delle impronte ti porta a un piccolo nascondiglio contenente alcune risorse.",
    "Le tracce ti conducono a un punto in cui qualcuno ha perso o abbandonato degli oggetti di valore.",
    "La tua abilità nel seguire le piste ti premia: trovi del loot interessante!"
];

const descrizioniTracceNothing = [
    "Le tracce si perdono nel nulla, confuse dal vento o cancellate dal tempo.",
    "Nonostante i tuoi sforzi, le tracce non portano a nulla di significativo.",
    "Segui le impronte per un po', ma alla fine si rivelano essere solo quelle di un animale comune che non ha lasciato nulla dietro di sé."
];

// Esiti per fallimento evento Pericolo Ambientale
const esitiPericoloAmbientaleColpito = [
    "Non sei stato abbastanza veloce o attento. Il pericolo ti raggiunge!",
    "Un passo falso e sei nel mezzo del pericolo ambientale. Subisci le conseguenze.",
    "Non hai notato i segnali in tempo. L'ambiente ostile ti colpisce.",
    "La tua valutazione del rischio era sbagliata. Ora ne paghi il prezzo.",
    "Il terreno cede / l'aria si fa irrespirabile / una scarica ti colpisce!"
];

// NUOVI ARRAY AGGIUNTI
// Esiti per fallimento tentativo di EVITARE un animale
const esitiEvitaAnimaleKo = [
    "L'animale è troppo veloce o astuto. Non riesci a seminarlo e ti blocca la strada!",
    "Un movimento goffo ti tradisce. La creatura si accorge di te e si prepara ad attaccare.",
    "Nonostante i tuoi sforzi, l'animale ti individua. La fuga non è più un'opzione.",
    "Pensi di averlo distanziato, ma sbuca da un'altra direzione, più aggressivo di prima.",
    "La bestia non si lascia ingannare e ti carica con ferocia."
];

// Esiti per fallimento tentativo di ATTACCARE un animale
const esitiAttaccoAnimaleKo = [
    "Il tuo attacco va a vuoto e l'animale contrattacca con sorprendente agilità!",
    "La creatura para il tuo colpo e risponde con furia, mettendoti sulla difensiva.",
    "Sottovaluti la sua resistenza. Il tuo attacco non sortisce l'effetto sperato e ora sei in pericolo.",
    "L'animale schiva il tuo fendente e ti morde/colpisce con precisione.",
    "La tua arma non è efficace contro la sua coriacea pelle o la sua velocità. L'iniziativa è sua."
];

// Aggiungere qui altre descrizioni per eventi complessi (Villaggio Ostile, Rifugio Strano, Dilemma Morale, Orrore)
// ...

// DEVE ESSERE AGGIUNTO QUI:
const esitiPericoloAmbientaleEvitato = [
    "Con agilità felina / prontezza di riflessi, riesci a evitare il pericolo all'ultimo istante.",
    "Il tuo sesto senso ti aveva avvertito. Ti fermi appena in tempo, schivando la minaccia.",
    "Noti il pericolo nascosto e riesci a trovare un percorso alternativo sicuro.",
    "Un passo falso e sarebbe finita male, ma la fortuna o l'abilità ti hanno assistito."
];

// NUOVI ARRAY PER ORRORE INDICIBILE (ESITI NEGATIVI)
const esitiOrroreIndicibileAffrontaKo = [
    "Tenti di affrontare l'orrore, ma la tua mente vacilla e il coraggio ti abbandona. Subisci le conseguenze.",
    "L'entità ignota ti sovrasta con la sua mera presenza. Non c'è modo di combatterla direttamente.",
    "Un urlo primordiale lacera la tua sanità mentale mentre l'orrore si manifesta pienamente.",
    "Senti un dolore lancinante alla testa e crolli a terra, sopraffatto."
];

const esitiOrroreIndicibileFugaKo = [
    "Cerchi di fuggire, ma l'orrore è più veloce, o forse è già dentro di te. Non c'è scampo.",
    "Corri alla cieca, ma ogni via di fuga sembra condurti più vicino alla fonte del terrore.",
    "Inciampi e cadi mentre tenti la fuga, l'orrore ti raggiunge.",
    "Le tue gambe si rifiutano di muoversi, paralizzate dalla paura cosmica."
];

const esitiOrroreIndicibileFugaOk = [
    "Con un urlo terrorizzato, ti volti e corri più veloce che puoi, senza guardarti indietro. Per ora, sembra che tu l'abbia seminato.",
    "La paura ti mette le ali ai piedi. Scappi a perdifiato, il suono dei tuoi stessi passi che rimbomba nelle orecchie, fino a quando il silenzio non ti avvolge di nuovo.",
    "Riesci a trovare un nascondiglio improbabile e attendi, tremando, che la presenza innominabile si allontani."
];

const esitiOrroreIndicibileAffrontaOk = [
    "Chiudi gli occhi e concentri ogni tua fibra di volontà per resistere all'ondata di terrore. Lentamente, la sensazione opprimente si ritira, lasciandoti esausto ma intatto.",
    "Trovi una forza interiore che non sapevi di possedere. Affronti l'orrore con uno sguardo determinato, e inspiegabilmente, esso esita e svanisce.",
    "Nonostante la paura paralizzante, riesci a recitare mentalmente vecchi versi o canzoni infantili, aggrappandoti a un briciolo di sanità. L'orrore sembra perdere interesse."
];

// --- Eventi Complessi: Dilemmi Morali (array di oggetti evento) ---
const dilemmaEvents = [
    {
        id: "dilemma_suspicious_stash",
        title: "Scorta Sospetta",
        description: "Tra le rovine trovi una borsa nascosta, apparentemente piena di provviste. Tuttavia, ci sono strani segni attorno: tracce fresche, forse una trappola o qualcuno che osserva.",
        choices: [
            {
                text: "Ispeziona con cautela (Adattamento)",
                actionKey: "inspect_stash_carefully",
                skillCheck: { stat: "adattamento", difficulty: 12 },
                successText: "Con attenzione, disinneschi un filo sottile collegato a una trappola rudimentale. Recuperi la scorta senza danni!",
                successReward: { items: [{ itemId: 'ration_pack', quantity: 1 }, { itemId: 'water_bottle', quantity: 1 }] },
                failureText: "Non noti un meccanismo nascosto: una trappola scatta, ferendoti leggermente.",
                failurePenalty: { type: 'damage', amount: 5 }
            },
            {
                text: "Prendi la borsa in fretta e scappa",
                actionKey: "grab_and_run",
                outcome: "Afferra la borsa e corri via. Senti un rumore dietro di te, ma nessuno ti insegue. Forse sei stato fortunato.",
                successReward: { items: [{ itemId: 'ration_pack', quantity: 1 }] }
            },
            {
                text: "Ignora la scorta, troppo rischioso",
                actionKey: "ignore_stash",
                outcome: "Decidi che la prudenza è la scelta migliore. Ti allontani senza rischiare nulla."
            }
        ]
    },
    {
        id: "dilemma_help_request",
        title: "Richiesta d'Aiuto",
        description: "Una voce debole ti chiama da una baracca crollata. Un sopravvissuto, ferito e spaventato, ti implora di aiutarlo. Potrebbe essere una trappola, o davvero qualcuno in difficoltà.",
        choices: [
            {
                text: "Parla con il sopravvissuto (Influenza)",
                actionKey: "talk_to_survivor",
                skillCheck: { stat: "influenza", difficulty: 13 },
                successText: "Riesci a rassicurare la persona, che ti offre in cambio una piccola scorta nascosta.",
                successReward: { items: [{ itemId: 'bandages_clean', quantity: 1 }, { itemId: 'water_bottle', quantity: 1 }] },
                failureText: "Il sopravvissuto non si fida e si chiude in silenzio. Forse era davvero solo spaventato.",
                failurePenalty: { type: 'nothing' }
            },
            {
                text: "Ignora la richiesta e prosegui",
                actionKey: "ignore_help_request",
                outcome: "Soffochi il senso di colpa e ti allontani, lasciando il sopravvissuto al suo destino."
            },
            {
                text: "Controlla la zona per possibili trappole (Presagio)",
                actionKey: "check_for_traps",
                skillCheck: { stat: "presagio", difficulty: 12 },
                successText: "Noti segni sospetti: qualcuno ha preparato un'imboscata. Ti allontani senza farti notare.",
                successReward: { type: 'nothing' },
                failureText: "Non trovi nulla di strano, ma il dubbio ti rimane addosso.",
                failurePenalty: { type: 'nothing' }
            }
        ]
    },
    {
        id: "dilemma_inert_machine",
        title: "Macchina Inerte",
        description: "Un vecchio distributore automatico, semi-sepolto tra le macerie, attira la tua attenzione. Potrebbe contenere ancora qualcosa di utile, ma forzarlo potrebbe fare rumore e attirare attenzioni indesiderate.",
        choices: [
            {
                text: "Forza lo sportello (Adattamento)",
                actionKey: "force_machine_open",
                skillCheck: { stat: "adattamento", difficulty: 14 },
                successText: "Con pazienza e ingegno, riesci ad aprire lo sportello senza fare troppo rumore. Trovi una barretta di cioccolato e una bibita!",
                successReward: { items: [{ itemId: 'chocolate_bar', quantity: 1 }, { itemId: 'soda_flat', quantity: 1 }] },
                failureText: "Lo sportello si apre di colpo con un forte rumore. Poco dopo, senti passi sospetti nelle vicinanze.",
                failurePenalty: { type: 'danger', description: 'Attiri attenzioni pericolose.' }
            },
            {
                text: "Lascia perdere, troppo rischioso",
                actionKey: "leave_machine",
                outcome: "Decidi che non vale la pena rischiare per così poco. Ti allontani in silenzio."
            }
        ]
    }
];
// --- FINE DATI STATICI ---
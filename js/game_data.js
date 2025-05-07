/**
 * TheSafePlace - Roguelike Postapocalittico
 * Versione: v0.7.10
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
        { id: "plains_bones", title: "Ossa nella Polvere", description: "Ossa sbiancate dal sole, forse umane, affiorano dal terreno screpolato. Un macabro segnale della fragilità della vita qui.", choices: [] },
        { id: "plains_carcass", title: "Banchetto Funebre", description: "Una carcassa gonfia di animale non identificabile giace sotto il sole implacabile, divorata da sciami di insetti ronzanti. L'odore è nauseante.", choices: [] },
        { id: "plains_wind", title: "Vento della Desolazione", description: "Il vento spazza la pianura arida, sollevando polvere e sussurrando storie di vuoto. Non c'è nient'altro.", choices: [] },
        {
             id: "plains_youth_memory",
             title: "Frammenti d'Infanzia",
             description: "Un vecchio parco giochi arrugginito emerge dalla sabbia. Altalene contorte cigolano nel vento. Per un attimo, ricordi com'era essere solo un bambino, senza il peso della sopravvivenza.",
             choices: [
                 { text: "Esplorare i resti (Presagio)", skillCheck: { stat: 'presagio', difficulty: 10 }, successText: "Mentre ti arrampichi sulla struttura del vecchio scivolo, noti un piccolo vano segreto dove qualcuno ha nascosto una scatoletta. Un tesoro infantile dimenticato, ora prezioso.", successReward: { itemId: 'canned_food', quantity: 1 }, failureText: "La struttura metallica cede sotto il tuo peso, facendoti cadere. Non c'era nulla di utile, solo fantasmi di risate perdute.", isSearchAction: true, actionKey: "explore_playground_remains" },
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
                { text: "Indaga furtivamente (Tracce)", skillCheck: { stat: 'tracce', difficulty: 12 }, successText: "Ti muovi come un'ombra tra gli alberi. È solo un grosso ratto mutato, ma vicino alla sua tana trovi delle bacche.", successReward: { itemId: 'berries', quantity: 1 }, failureText: "Pesti un ramo secco, tradendo la tua presenza! Qualunque cosa fosse, è fuggita nel fitto del bosco.", actionKey: "investigate_noise_stealthily" }
            ]
        },
        {
            id: "forest_fallen_tree",
            title: "Tronco Annerito",
            description: "Un albero enorme, sradicato e con la corteccia stranamente annerita, blocca il sentiero. Scavalcarlo sembra difficile, aggirarlo richiede tempo.",
            choices: [
                 { text: "Tenta di scavalcare (Agilità)", skillCheck: { stat: 'agilita', difficulty: 11 }, successText: "Con un balzo agile e un po' di fortuna, superi l'ostacolo senza intoppi. Noti anche un pezzo di metallo utile incastrato.", successReward: { itemId: 'scrap_metal', quantity: 1 }, actionKey: "climb_fallen_tree" },
                 { text: "Aggira l'ostacolo", outcome: "Decidi di non rischiare. Ti addentri nel bosco fitto, perdendo tempo ma evitando il pericolo immediato." }
            ]
        },
        {
            id: "forest_hostile_flora",
            title: "Rovi Aggressivi",
            description: "Rampicanti spinosi dall'aspetto malato e aggressivo ostruiscono il passaggio. Sembrano quasi contrarsi al tuo avvicinarsi. Nascondono qualcosa o sono solo un altro pericolo?",
            choices: [
                { text: "Esamina i rovi (Adattamento)", skillCheck: { stat: 'adattamento', difficulty: 11 }, successText: "Osservando attentamente, noti che le spine secernono una linfa densa. Potrebbe essere usata per creare medicine grezze.", successReward: { itemId: 'medicine_crude', quantity: 1 }, failureText: "Queste piante sembrano ostili e forse velenose. Meglio non rischiare di toccarle.", actionKey: "examine_hostile_vines" },
                { text: "Forza il passaggio (Potenza)", skillCheck: { stat: 'potenza', difficulty: 13 }, successText: "Con forza bruta, strappi i rampicanti spinosi e ti apri un varco, rimediando solo qualche graffio.", failureText: "Le spine tenaci ti lacerano braccia e vestiti mentre cerchi di passare. Subisci una ferita.", actionKey: "force_passage_vines", usesWeapon: true }
            ]
        },
         {
            id: "forest_teen_shelter",
            title: "Rifugio tra gli Alberi",
            description: "Una casa sull'albero malconcia, costruita prima del Crollo, si nasconde tra i rami nodosi. Scale improvvisate di corda danneggiate pendono fino a terra. Potrebbe essere stata il nascondiglio di qualcuno della tua età.",
            choices: [
                { text: "Arrampicarsi (Agilità)", skillCheck: { stat: 'agilita', difficulty: 12 }, successText: "Ti arrampichi con cautela. Dentro trovi un diario appartenente a un altro sopravvissuto della tua età. Oltre alle parole di speranza, ha lasciato anche qualcosa di utile.", successReward: { itemId: 'vitamins', quantity: 1 }, failureText: "La corda marcia si spezza sotto il tuo peso. Cadi malamente, sbattendo contro un ramo. Un rifugio fuori portata, per ora.", isSearchAction: true, actionKey: "climb_treehouse" },
                { text: "Ispezionare la base (Tracce)", skillCheck: { stat: 'tracce', difficulty: 10 }, successText: "Ai piedi dell'albero trovi un piccolo contenitore impermeabile nascosto tra le radici. Prudenza di chi sapeva che non sempre si può salire.", successReward: { itemId: 'bandages_clean', quantity: 1 }, failureText: "Non trovi nulla di utile alla base. Forse ogni cosa di valore è stata già presa, o si trova ancora lassù, irraggiungibile.", isSearchAction: true, actionKey: "inspect_treehouse_base" }
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
                { text: "Osserva la riva", outcome: "Scruti la riva e il flusso dell'acqua. Nessuno pericolo immediato, ma nemmeno nulla di utile in vista." }
            ]
         },
         {
            id: "river_youth_reflection",
            title: "Riflessi nell'Acqua Torbida",
            description: "La corrente lenta del fiume crea una superficie quasi calma. Ti sporgi per riempire la borraccia e intravedi il tuo riflesso: un volto giovane segnato da esperienze che nessun diciassettenne dovrebbe affrontare. Questo mondo ti ha trasformato.",
            choices: [
                { text: "Fermarsi a riposare (Vigore)", skillCheck: { stat: 'vigore', difficulty: 10 }, successText: "Ti permetti un raro momento di pace. Lavi via la polvere del viaggio e raccogli i pensieri. Questo breve ristoro rinvigorisce il corpo e lo spirito. Ti senti pronto a continuare.", successReward: { itemId: 'water_purified_small', quantity: 1 }, failureText: "Cercando di rilassarti, la stanchezza ti travolge. Ti addormenti brevemente e ti svegli disorientato, sentendoti più affaticato di prima. Hai perso tempo prezioso.", isSearchAction: true, actionKey: "rest_by_river" },
                { text: "Guardare oltre la superficie (Presagio)", skillCheck: { stat: 'presagio', difficulty: 11 }, successText: "Scrutando più attentamente l'acqua, noti un bagliore metallico sul fondale poco profondo. Immergendo cautamente un braccio, recuperi un oggetto utile che la corrente ha trasportato qui.", successReward: { itemId: 'mechanical_parts', quantity: 2 }, failureText: "Mentre fissi l'acqua, la tua mente vaga. Visioni inquietanti di città sommerse e segreti sepolti ti turbano. Ti allontani dalla riva, sentendoti a disagio.", isSearchAction: true, actionKey: "look_beyond_surface" }
            ]
         }
    ],
    VILLAGE: [
        {
            id: "village_ruins",
            title: "Villaggio Fantasma",
            description: "Le rovine silenziose di un piccolo insediamento. Tende strappate e baracche vuote gemono al vento. Cosa è successo qui? Forse è rimasto qualcosa tra le macerie.",
            choices: [
                { text: "Cerca tra le macerie (Tracce)", skillCheck: { stat: 'tracce', difficulty: 11 }, successText: "Dopo un'attenta ricerca tra i detriti polverosi, trovi del cibo in scatola ancora intatto!", successReward: { itemId: 'canned_food', quantity: 1 }, failureText: "Trovi solo polvere, vetri rotti e i fantasmi silenziosi di vite spezzate. Nulla di utile.", isSearchAction: true, actionKey: "search_village_rubble" },
                { text: "Riposati all'ombra", outcome: "Ti siedi al riparo di un muro diroccato, recuperando un po' il fiato, ma il silenzio del luogo è opprimente." }
            ]
        },
        {
            id: "village_heavy_silence",
            title: "Silenzio Innaturale",
            description: "Un silenzio opprimente grava su questo luogo. Non si sente il vento, né il verso di animali. Un brutto presentimento ti attanaglia.",
            choices: [
                { text: "Ascolta l'istinto (Presagio)", skillCheck: { stat: 'presagio', difficulty: 12 }, successText: "Il tuo sesto senso ti guida verso una tenda collassata. All'interno, trovi delle bende dimenticate nella fuga.", successReward: { itemId: 'bandages_dirty', quantity: 1 }, failureText: "Ascolti attentamente, ma percepisci solo il silenzio e un crescente senso di disagio. Meglio andarsene.", isSearchAction: true, actionKey: "listen_to_instinct" },
                { text: "Allontanati in fretta", outcome: "Fidi del tuo istinto e ti allontani rapidamente da questo luogo silenzioso e inquietante." }
            ]
        },
        {
             id: "village_school_ruins",
             title: "Rovine della Scuola",
             description: "I resti di una piccola scuola si ergono tra le case abbandonate. Graffiti sbiaditi e poster educativi si aggrappano ancora alle pareti crepate. Un luogo che un tempo era pieno di ragazzi come te, ora solo un guscio vuoto.",
             choices: [
                 { text: "Cercare nella biblioteca (Adattamento)", skillCheck: { stat: 'adattamento', difficulty: 11 }, successText: "Tra scaffali crollati e libri ammuffiti, trovi una sezione intatta. Un manuale di primo soccorso, ancora leggibile. Le conoscenze del passato possono salvare vite.", successReward: { itemId: 'first_aid_kit', quantity: 1 }, failureText: "La biblioteca è un disastro di carta marcita e polvere. Qualsiasi cosa utile è stata danneggiata dall'umidità o saccheggiata tempo fa.", isSearchAction: true, actionKey: "search_school_library" },
                 { text: "Ispezionare l'aula di scienze (Presagio)", skillCheck: { stat: 'presagio', difficulty: 12 }, successText: "Nel laboratorio devastato, il tuo intuito ti guida verso un armadietto chiuso. Sfondandolo, trovi provette sigillate contenenti un liquido lattiginoso etichettato come antitossina.", successReward: { itemId: 'antidote', quantity: 1 }, failureText: "Il laboratorio è un pericolo: vetri rotti, sostanze chimiche versate e odori acri. Meglio non rischiare di toccare nulla.", isSearchAction: true, actionKey: "inspect_science_lab", usesWeapon: true }
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
                     successText: "Il tuo istinto ti guida verso un edificio che sembra meno pericolante degli altri. All'interno, tra le macerie, trovi...",
                     successReward: { type: 'random_common_resource', quantity: 1 },
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
                 { text: "Cerca medicine (Adattamento)", skillCheck: { stat: 'adattamento', difficulty: 13 }, successText: "Con pazienza, rovistando tra scatole rotte e vetri infranti, la tua mano si chiude su una siringa intatta!", successReward: { itemId: 'antidote', quantity: 1 }, failureText: "Saccheggiata a fondo. Trovi solo confezioni vuote e odore di disinfettante stantio.", isSearchAction: true, actionKey: "search_pharmacy" }
            ]
        },
        {
             id: "city_teen_gang_territory",
             title: "Territorio di Banda Giovanile",
             description: "Graffiti colorati segnano questo quartiere come territorio di una banda di ragazzi sopravvissuti. Simboli minacciosi ma anche disegni che rivelano la loro giovane età. Segnali contrastanti di pericolo e di possibilità di contatto.",
             choices: [
                 { text: "Tentare un contatto (Influenza)", skillCheck: { stat: 'influenza', difficulty: 13 }, successText: "Dopo un teso confronto iniziale, riesci a guadagnarti la fiducia del gruppo grazie alla tua giovane età. Ti offrono un piccolo scambio da pari a pari prima di separarsi.", successReward: { itemId: 'crossbow', quantity: 1 }, failureText: "Un fischio acuto risuona tra gli edifici. Sagome si muovono come ombre. 'Questo non è territorio tuo,' grida una voce giovane. Indietreggi lentamente, sentendoti osservato.", actionKey: "contact_teen_gang" }, // Non isSearchAction, è un incontro sociale
                 { text: "Studiare i loro nascondigli (Tracce)", skillCheck: { stat: 'tracce', difficulty: 14 }, successText: "Evitando sapientemente di farti notare, scopri uno dei loro depositi segreti. Prendi solo il minimo necessario, in silenzio e con rispetto.", successReward: { itemId: 'bolt', quantity: 3 }, failureText: "Un suono metallico scatta vicino al tuo piede. Una trappola rudimentale ma efficace. Un avvertimento. Allontanati rapidamente, sentendoti fortunato.", isSearchAction: true, actionKey: "study_gang_hideouts" }
             ]
        }
    ],
     REST_STOP: [
         {
            id: "rest_stop_gas_station",
            title: "Stazione di Servizio Fantasma",
            description: "La carcassa arrugginita di una stazione di servizio. Pompe divelte, vetri rotti, l'interno buio e pieno di detriti. Potrebbe offrire riparo temporaneo o nascondere brutte sorprese.",
            choices: [
                 { text: "Ispeziona l'interno (Tracce)", skillCheck: { stat: 'tracce', difficulty: 10 }, successText: "Frugando con attenzione tra gli scaffali rovesciati e la sporcizia, la tua mano si chiude su qualcosa di utile...", successReward: { type: 'random_common_resource', quantity: 1 }, actionKey: "inspect_gas_station" }, // Modificato per usare ricompensa generica
                 { text: "Cerca forniture mediche (Adattamento)", skillCheck: { stat: 'adattamento', difficulty: 12 }, successText: "In un armadietto metallico ammaccato e nascosto, trovi una siringa etichettata 'Antidoto'. Incredibile!", successReward: { itemId: 'antidote', quantity: 1 }, failureText: "Non trovi nulla di medico, solo vecchie mappe stradali ammuffite e attrezzi arrugginiti.", isSearchAction: true, actionKey: "search_gas_station_medical" }
            ]
        },
        {
             id: "rest_stop_coming_of_age",
             title: "Tracce di Crescita",
             description: "In un angolo appartato della vecchia area di servizio, qualcuno ha creato una sorta di 'muro della memoria' con fotografie, pagine di riviste e scritte. Ragazzi e ragazze sorridenti, 'primi baci', 'feste dei 18 anni'. Riti di passaggio di un'era scomparsa.",
             choices: [
                 { text: "Riflettere sulla propria identità", outcome: "Ti soffermi davanti a quelle immagini, pensando a ciò che il mondo ti ha negato. Non c'è più spazio per cerimonie o celebrazioni, solo sopravvivenza. Eppure, in qualche modo, sei diventato adulto troppo presto in questo mondo morente." },
                 { text: "Cercare dietro il muro (Tracce)", skillCheck: { stat: 'tracce', difficulty: 12 }, successText: "Spostando alcune foto, scopri che il muro nasconde un piccolo nascondiglio. Qualcuno aveva preparato una 'capsula del tempo' per il futuro, non sapendo quanto sarebbe stato diverso. Trovi oggetti utili tra i ricordi.", successReward: { itemId: 'repair_kit', quantity: 1 }, failureText: "Non trovi nulla dietro le immagini. Solo cemento freddo e la realtà che alcuni passaggi della vita sono andati perduti per sempre.", isSearchAction: true, actionKey: "search_behind_wall" }
             ]
        },
        {
            id: "rest_stop_day_interaction",
            title: "Rifugio Precario (Giorno)",
            description: "Questo ammasso di lamiere e teli offre un riparo temporaneo dal vento e dalla polvere. Cosa vuoi fare?",
            choices: [
                {
                    text: "Esplora il rifugio (costa tempo)",
                    skillCheck: { stat: 'presagio', difficulty: 10 }, // Check Presagio per intuire pericoli/opportunità
                    successText: "Dopo un'attenta ricerca tra i detriti e gli angoli bui...", // Esito gestito in handleEventChoice
                    failureText: "Non trovi nulla di utile, solo polvere e rifiuti senza valore.",
                    isSearchAction: true, // Costo tempo
                    actionKey: "explore_shelter"
                },
                {
                    text: "Riposa brevemente (+1 HP, costa 1 passo)", // Testo aggiornato
                    actionKey: "rest_short",
                    isSearchAction: true, // Già presente
                    timeCost: 1,          // Costo tempo specifico
                    effect: {             // Nuovo oggetto effect
                        type: 'add_resource',
                        resource_type: 'hp',
                        amount: 1,
                        message: "Ti fermi per qualche minuto, recuperando un po' il fiato e 1 HP. Non è molto, ma aiuta a schiarire le idee prima di ripartire."
                    }
                },
                {
                    text: "Lascia il rifugio",
                    outcome: "Decidi di non perdere altro tempo qui. Prosegui il tuo viaggio.",
                    actionKey: "leave"
                }
            ]
        }
    ]
    // MOUNTAIN, START, END non hanno eventi specifici del tile definiti qui.
};


// Database degli oggetti presenti nel gioco
const ITEM_DATA = {
    // Risorse e Consumabili (Usable)
    'water_purified_small': { id: 'water_purified_small', name: "Acqua Purificata (P)", description: "Una piccola borraccia d'acqua, sigillata. Ogni sorso è prezioso in queste terre.", usable: true, type: 'water', category: 'Water', effect: { type: 'add_resource', resource_type: 'water', amount: 3 } },
    'canned_food': { id: 'canned_food', name: "Cibo in Scatola", description: "Una scatoletta ammaccata, ma l'integrità del sigillo fa ben sperare. Meglio di niente.", usable: true, stackable: true, type: 'food', category: 'Food', effect: { type: 'add_resource', resource_type: 'food', amount: 4 } }, // Aumentato a 4
    'berries': { id: 'berries', name: "Bacche Sconosciute", description: "Un pugno di bacche selvatiche di un colore incerto. Comestibili o velenose? Un rischio da valutare.", usable: true, type: 'food', category: 'Food', stackable: true, effect: { type: 'add_resource_poisonable', resource_type: 'food', amount: 1, poison_chance: 0.20 } },
    'water_dirty': { id: 'water_dirty', name: "Acqua Sporca", description: "Acqua torbida raccolta da una pozza o un contenitore abbandonato. Berla senza purificarla è un invito alla malattia... o peggio.", usable: true, type: 'water', category: 'Water', stackable: true, effect: { type: 'add_resource_poisonable', resource_type: 'water', amount: 0.5, poison_chance: 0.70 } },
    'raw_meat': { id: 'raw_meat', name: "Carne Cruda", description: "Un pezzo di carne sanguinante da una bestia appena uccisa. Potrebbe nutrire, ma consumarla cruda è rischioso.", type: 'food', category: 'Food', usable: true, stackable: true, effect: { type: 'add_resource_sickness', resource_type: 'food', amount: 3, sickness_chance: 0.25 } }, // Aggiunto sickness_chance nell'effetto

    // Oggetti Curativi (Usable)
    'bandages_dirty': { id: 'bandages_dirty', name: "Bende Sporche", description: "Strisce di tessuto recuperate chissà dove. Non ispirano fiducia, ma possono tamponare una ferita.", type: 'healing', category: 'Medical', effect: { type: 'cure_status', status_cured: 'isInjured', chance: 0.4, success_message: "Le bende sembrano aver fermato il peggio.", failure_message: "Le bende sono troppo sporche, non hanno aiutato." }, usable: true, stackable: true },
    'bandages_clean': { id: 'bandages_clean', name: "Bende Pulite", description: "Garze sterilizzate, ancora nella loro confezione originale. Una rarità, utile per curare ferite aperte.", type: 'healing', category: 'Medical', effect: { type: 'cure_status', status_cured: 'isInjured', chance: 0.75, success_message: "Le bende pulite sono efficaci, la ferita migliora.", failure_message: "Nonostante le bende, la ferita è ancora brutta.", heal_hp_on_success: 2 }, usable: true, stackable: true },
    'suspicious_pills': { id: 'suspicious_pills', name: "Pillole Sospette", description: "Pasticche di colore indefinito in un blister rovinato. Una scommessa contro la malattia.", type: 'healing', category: 'Medical', effect: { type: 'cure_status', status_cured: 'isSick', chance: 0.7, success_message: "La febbre sembra scendere un po'. Ti senti leggermente meglio.", failure_message: "Non ti senti affatto meglio.", heal_hp_on_success: 1 }, usable: true, stackable: true },
    'vitamins': { id: 'vitamins', name: "Vitamine", description: "Flacone quasi intatto di integratori. Forse possono dare un po' di vigore o aiutare a recuperare energie.", type: 'consumable', category: 'Medical', usable: true, stackable: true, effect: { type: 'add_resource', resource_type: 'hp', amount: 3 } }, // Cure HP
    'herbal_salve': { id: 'herbal_salve', name: "Unguento Erbaceo", description: "Un unguento denso e aromatico fatto con erbe comuni. Lenisce il dolore e accelera la guarigione.", type: 'healing', category: 'Medical', effect: { type: 'add_resource', resource_type: 'hp', amount: 4 }, usable: true, stackable: true }, // Cure HP
    'first_aid_kit': { id: 'first_aid_kit', name: "Kit Primo Soccorso", description: "Una piccola borsa contenente il necessario per trattare ferite moderate. Meglio delle bende sporche.", type: 'healing', category: 'Medical', effect: { type: 'cure_status', status_cured: 'isInjured', chance: 0.9, success_message: "Il kit ti permette di medicare efficacemente la ferita.", failure_message: "Nonostante le cure, la ferita non migliora molto.", heal_hp_on_success: 6 }, usable: true, stackable: false },
    'antidote': { id: 'antidote', name: "Antidoto", description: "Una siringa contenente un liquido lattiginoso. Sembra un antidoto universale, forse...", type: 'healing', category: 'Medical', effect: { type: 'cure_status', status_cured: 'isPoisoned', chance: 1.0, success_message: "Il bruciore nelle vene svanisce. L'antidoto ha funzionato!" }, usable: true, stackable: true },
    'medicine_crude': {
        id: 'medicine_crude',
        name: "Medicina Grezza",
        description: "Una poltiglia appiccicosa e dall'odore pungente, ottenuta da piante mutate. Potrebbe aiutare contro le infezioni, ma ingerirla è sconsigliato.",
        usable: true,
        stackable: true,
        type: 'healing',
        category: 'Medical',
        effect: {
            type: 'cure_status',
            status_cured: 'isSick',
            chance: 0.3,
            success_message: "Applichi la poltiglia. L'infezione sembra regredire leggermente.",
            failure_message: "La medicina grezza non sembra avere alcun effetto benefico.",
        }
    },

    // Materiali e Attrezzi (Not Usable directly, Crafting/Tool)
    'scrap_metal': { id: 'scrap_metal', name: "Rottame Metallico", description: "Un pezzo di metallo contorto e arrugginito. Utile per riparazioni o crafting.", usable: false, type: 'crafting', category: 'Crafting', stackable: true },
    'mechanical_parts': { id: 'mechanical_parts', name: "Parti Meccaniche", description: "Piccoli ingranaggi, molle e viti recuperati da dispositivi rotti. Essenziali per riparare armi completamente danneggiate.", usable: false, type: 'crafting', category: 'Crafting', stackable: true },
    'repair_kit': { id: 'repair_kit', name: "Kit di Riparazione", description: "Un set di strumenti e materiali per riparare equipaggiamento danneggiato.", type: 'crafting', category: 'Crafting', usable: true, stackable: true, effect: { type: 'repair_weapon', repair_amount: 10 } }, // Usable to repair weapons
    'small_knife': { id: 'small_knife', name: "Piccolo Coltello", description: "Un coltellino multiuso, logoro ma ancora affilato. Utile per molti lavori di precisione.", usable: false, type: 'tool', category: 'Tool' }, // Non equipaggiabile come arma principale?

    // Armi (Not Usable directly, Equipable)
    'pipe_wrench': { id: 'pipe_wrench', name: "Tubo di Metallo", description: "Un pesante tubo di metallo arrugginito. Non elegante, ma efficace per colpire.", type: 'weapon', category: 'Weapon', weaponType: 'mischia', damage: 3, peso: 'medio', velocità: 'media', raggio: 'corto', durability: 15, maxDurability: 15, usable: false, stackable: false },
    'spear_makeshift': { id: 'spear_makeshift', name: "Lancia Improvvisata", description: "Un lungo tubo o bastone con una punta metallica affilata legata all'estremità. Offre portata ma è ingombrante.", type: 'weapon', category: 'Weapon', weaponType: 'bianca_lunga', damage: 4, durability: 12, maxDurability: 12, usable: false, stackable: false },
    'machete_rusty': { id: 'machete_rusty', name: "Machete Arrugginito", description: "Una pesante lama da machete, intaccata dalla ruggine ma ancora capace di tagliare. Ottima per combattimenti ravvicinati.", type: 'weapon', category: 'Weapon', weaponType: 'bianca_corta', damage: 4, durability: 18, maxDurability: 18, usable: false, stackable: false },
    'throwing_knives_crude': { id: 'throwing_knives_crude', name: "Coltelli da Lancio Grezzi", description: "Pezzi di metallo affilati e appesantiti, non bilanciati ma possono essere lanciati con discreta efficacia. Si consumano dopo l'uso.", type: 'weapon', category: 'Weapon', weaponType: 'lancio', damage: 3, durability: 1, maxDurability: 1, usable: false, stackable: true }, // Stackable perché sono consumabili
    'pistol_makeshift': { id: 'pistol_makeshift', name: "Pistola Improvvisata", description: "Un'arma da fuoco grezza assemblata con pezzi di recupero. Potenzialmente potente, ma inaffidabile.", type: 'weapon', category: 'Weapon', weaponType: 'fuoco', damage: 5, precisione: 'bassa', raggio: 'medio', rumore: 'alto', durability: 30, maxDurability: 30, ammoType: 'munizioni', usable: false, stackable: false },
    'crossbow': { id: 'crossbow', name: "Balestra Artigianale", description: "Una balestra assemblata con materiali di recupero. Silenziosa e potente, ma lenta da ricaricare.", type: 'weapon', category: 'Weapon', weaponType: 'balestra', damage: 4, precisione: 'alta', raggio: 'lungo', rumore: 'basso', durability: 25, maxDurability: 25, ammoType: 'dardi', usable: false, stackable: false },
    'bow': { id: 'bow', name: "Arco di Fortuna", description: "Un arco ricavato da un ramo flessibile e corda. Silenzioso ma richiede abilità.", type: 'weapon', category: 'Weapon', weaponType: 'arco', damage: 3, precisione: 'media', raggio: 'long', rumore: 'basso', durability: 20, maxDurability: 20, ammoType: 'frecce', usable: false, stackable: false }, // Raggio cambiato in 'long' per consistenza

    // Armature (Not Usable directly, Equipable)
    'leather_jacket_worn': { id: 'leather_jacket_worn', name: "Giacca di Pelle Consunta", description: "Una vecchia giacca di pelle, indurita dal tempo e dalle intemperie. Offre una protezione minima.", type: 'armor', category: 'Armor', armorValue: 2, durability: 25, maxDurability: 25, usable: false, stackable: false },

    // Munizioni (Not Usable directly, Consumed by Weapons)
    'ammo_generic': { id: 'ammo_generic', name: "Munizioni", description: "Proiettili comuni per armi da fuoco leggere.", type: 'ammo', category: 'Ammo', ammoType: 'munizioni', usable: false, stackable: true, recuperabile: false }, // ID generalizzato
    'bolt': { id: 'bolt', name: "Dardi", description: "Dardi metallici per balestra, recuperabili dopo l'uso se non danneggiati.", type: 'ammo', category: 'Ammo', ammoType: 'dardi', usable: false, stackable: true, recuperabile: true },
    'arrow': { id: 'arrow', name: "Frecce", description: "Frecce rudimentali con punte di metallo. Possono essere recuperate dopo l'uso.", type: 'ammo', category: 'Ammo', ammoType: 'frecce', usable: false, stackable: true, recuperabile: true },

    // Oggetti Lore (Not Usable directly, Reveal info)
    'lore_fragment_item': { id: 'lore_fragment_item', name: "Nota Strappata", description: "Un frammento di carta ingiallita. Le scritte sono quasi illeggibili, un eco confuso dal passato.", usable: false, type: 'lore', category: 'Lore', stackable: false, effect: { type: 'show_lore', text_array_ref: 'loreFragments' } }, // Potrebbe essere usato per rivelare lore dal popup

    // --- FINE DEFINIZIONE OGGETTI ---
};

// Scenari specifici per eventi Dilemma Morale
const dilemmaEvents = [
    /*
    {
        id: "dilemma_scenario_1", // TODO: Sostituire con ID fornito (es. "dilemma_suspicious_cache")
        title: "Titolo Scenario 1", // TODO: Sostituire con Titolo fornito
        description: "Descrizione Scenario 1...", // TODO: Sostituire con Descrizione fornita
        choices: [
            // TODO: Inserire qui le scelte per lo scenario 1
            // Esempio scelta:
            // {
            //     text: "Testo Scelta A",
            //     skillCheck: { stat: 'presagio', difficulty: 12 },
            //     successText: "Esito positivo A...",
            //     successReward: { itemId: 'canned_food', quantity: 1 },
            //     failureText: "Esito negativo A..."
            // },
            // {
            //     text: "Testo Scelta B",
            //     outcome: "Esito diretto B...",
            //     // Eventuali penalità o effetti diretti
            // }
        ]
    },
    */
    /*
    {
         id: "dilemma_scenario_2", // TODO: Sostituire con ID fornito (es. "dilemma_wounded_stranger")
         title: "Titolo Scenario 2", // TODO: Sostituire con Titolo fornito
         description: "Descrizione Scenario 2...", // TODO: Sostituire con Descrizione fornita
         choices: [
             // TODO: Inserire qui le scelte per lo scenario 2
         ]
    },
    */
    /*
    {
         id: "dilemma_scenario_3", // TODO: Sostituire con ID fornito (es. "dilemma_radio_signal")
         title: "Titolo Scenario 3", // TODO: Sostituire con Titolo fornito
         description: "Descrizione Scenario 3...", // TODO: Sostituire con Descrizione fornita
         choices: [
             // TODO: Inserire qui le scelte per lo scenario 3
         ]
    }
    */
];

// Array per testi di esito generici dei dilemmi (attualmente vuoti)
const esitiDilemmaSuccessoGenerico = [];
const esitiDilemmaFallimentoGenerico = [];


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
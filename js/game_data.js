/**
 * TheSafePlace - Roguelike Postapocalittico
 * Versione: v0.7.22 Event Flow Integrity
 * File: js/game_data.js
 * Descrizione: Contiene tutti i dati statici del gioco come definizioni di oggetti, eventi, ecc.
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

const esitiPericoloAmbientaleEvitato = [
    "Con agilità felina e prontezza di riflessi, riesci a evitare il pericolo all'ultimo istante!",
    "Il tuo sesto senso ti aveva avvertito. Ti fermi appena in tempo, schivando la minaccia con un brivido.",
    "Noti il pericolo nascosto e con astuzia riesci a trovare un percorso alternativo sicuro.",
    "Un passo falso e sarebbe finita male, ma la fortuna o la tua abilità ti hanno assistito questa volta."
];

const esitiPericoloAmbientaleColpito = [
    "Non sei stato abbastanza veloce o attento. Il pericolo ambientale ti raggiunge in pieno!",
    "Un errore fatale e ti ritrovi nel mezzo della minaccia. Subisci le conseguenze dolorose.",
    "Non hai colto i segnali di avvertimento in tempo. L'ambiente ostile ti punisce severamente.",
    "La tua valutazione del rischio era completamente sbagliata. Ora ne paghi il prezzo con la tua stessa pelle.",
    "Il terreno cede sotto di te / l'aria si fa improvvisamente irrespirabile / una scarica imprevista ti colpisce!"
];

const mountainBlockMessages = [
    "Guardando la parete rocciosa, ti rendi conto che tentare la scalata sarebbe un suicidio.",
    "La montagna sembra fissarti dall'alto. Non hai l'equipaggiamento né l'esperienza per provarci.",
    "Un ragazzino di 17 anni non scala queste vette. Ci vuole più di un po' di coraggio.",
    "Queste rocce sono troppo ripide e friabili. Meglio cercare un altro sentiero.",
    "Senti i muscoli lamentarsi solo a guardare quelle cime. Trovare un percorso alternativo è l'unica scelta sensata."
];

const tipiBestie = [
    "Ratto Gigante", "Cane Selvatico", "Sciame di Insetti Mutati", "Corvo Bicefalo", "Salamandra Velenosa", "Lupo Mutato", "Cinghiale Corazzato"
];

const descrizioniIncontroBestie = [
    "Un {animale} mutato e dall'aspetto aggressivo ti blocca il passo, ringhiando minacciosamente.",
    "Sbuca dai cespugli un {animale} dalle dimensioni innaturali, gli occhi iniettati di sangue fissi su di te.",
    "Un {animale} ferito e disperato ti carica, considerandoti una minaccia o un pasto facile.",
    "Un {animale} dall'aspetto malato e contagioso barcolla verso di te, ignorando ogni tentativo di dissuasione.",
    "Un {animale} ti osserva da lontano con un'intelligenza inquietante nei suoi occhi non del tutto animali."
];

const descrizioniTracce = [
    "Noti delle impronte recenti sul terreno polveroso. Sembrano appartenere a più individui.",
    "Un debole odore di fumo ti guida verso un piccolo bivacco abbandonato di recente. Qualcuno è passato di qui.",
    "Delle tracce malcelate indicano un sentiero poco battuto che si inoltra nel fitto della vegetazione.",
    "Vedi segni di lotta recente: terreno smosso, qualche goccia di sangue scuro.",
    "Trovi uno strano simbolo tracciato nel fango, quasi cancellato dal vento."
];

const descrizioniIncontroPredoni = [
    "Un gruppo di figure ostili emerge dalle ombre, i loro occhi brillano di malizia.",
    "Ti imbatti in un accampamento di predoni. Sembrano sorpresi quanto te, ma la loro reazione è immediata e aggressiva.",
    "Senti un fischio acuto, e in un attimo sei circondato da individui dall'aspetto minaccioso."
];

const loreFragments = [
    "Pagina strappata di diario: '... giorno 47. Le scorte sono finite. Ho sentito di un posto sicuro a est, oltre le montagne spezzate. Forse è solo una favola per disperati come me, ma è la mia ultima speranza...'",
    "Pezzo di metallo inciso a laser: 'Progetto Chimera - Soggetto #007 - Proprietà del Lab 7 - TERMINATO'",
    "Ologramma tremolante da un dispositivo rotto: '...protocollo di contenimento fallito... bio-agente [CLASSIFICATO] fuori controllo... Evacuare immediatamente... che Dio ci aiuti...'",
    "Scheda dati danneggiata e macchiata: '...mutazione instabile di Tipo IV... aggressività esponenziale... protocollo suggerito: eliminare a vista con armi incendiarie...'",
    "Scarpa da bambino logora accanto a una piccola croce fatta di rametti e filo spinato.",
    "Graffito tracciato col sangue su un muro: 'Non fidatevi dell'acqua che brilla. NON BEVETELA.'",
    "Registrazione audio disturbata, voce maschile: '...stanno arrivando... le pareti non reggeranno... dite a mia figlia che l'amavo... il suo nome è Lily... *statica assordante*'",
    "Mappa disegnata a mano su un pezzo di pelle umana conciata: Indica un percorso verso un luogo chiamato 'L'Oasi sotto le Stelle Cadute', ma è strappata a metà.",
    "Messaggio inciso rozzamente su una capsula di proiettile 7.62: 'Per Mamma. Mi dispiaccio.'",
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
    "Manuale tecnico strappato ('Manutenzione Ripari Classe-C'): '...il sistema di filtraggio dell'aria HEPA richiede sostituzione nucleo ogni 500 ore operative per evitare contaminazione interna...'",
    "Lista della spesa macchiata di sangue: 'Acqua (min. 5L), Munizioni (tutte!), Scatolette (proteine!), Nastro adesivo (molto!), Antidolorifici... Speranza (se ne trovi)...'",
    "Pagina di un bestiario improvvisato, scritto a mano con disegni disturbanti: Descrive una creatura notturna senza volto chiamata 'Il Sussurrante delle Ombre', che si nutre di ricordi.",
    "Rapporto tecnico parzialmente bruciato: '...il Geo-Core di Sektor Gamma è instabile. Rischio di collasso quantico entro 48h. Evacuare...'",
    "Messaggio scarabocchiato sul retro di una foto di famiglia sorridente: 'Non sono riuscito a salvarli. La nebbia... li ha presi...'",
    "Ordine militare criptato (decifrato parzialmente): '...Protocollo Cenere attivato su [REDACTED]. Nessun sopravvissuto autorizzato. Silenzio totale.'",
    "Capsula medica vuota etichettata 'Naniti Riparatori - Prototipo X'. Sembra usata di recente.",
    "Frammento di trasmissione radio intercettata: '...i Corvi Neri hanno sfondato a ovest. Ripeto, i Corvi Neri... la Vecchia Capitale cadrà...'",
    "Diario di un medico del Lab 9: 'Giorno 112. Le mutazioni accelerate nel Settore Delta sono... inaspettate. Aggressività fuori scala. Abbiamo creato mostri.'",
    "Tessera d'accesso corrosa: 'Lab 4 - Livello Sicurezza Alpha - Dott.ssa Eva Rostova'",
    "Manifesto propagandistico strappato: 'L'Unione Pan-Europea garantisce sicurezza! Denunciate i dissidenti! Il futuro è ordine!'",
    "Lista di nomi incisa su un muro con un coltello: 'Hans, Greta, Lena, Karl... Perdonatemi.'",
    "Progetto tecnico di un'arma energetica portatile chiamata 'Lancia Solare'. Manca la pagina del generatore.",
    "Avviso di quarantena biologica sbiadito e strappato, affisso alla porta di un bunker sigillato dall'esterno.",
    "Registrazione audio recuperata da un drone abbattuto: '...zona contaminata confermata. Livelli Gamma letali. Nessun segno di vita organica... solo... movimento...'",
    "Lettera non spedita: 'Mia cara Anya, se leggi questo, vuol dire che non torno. Ho visto cose indicibili oltre il Muro Est. Il 'Safe Place' non è ciò che credono...'",
    "Simbolo tribale dipinto con sangue e fango su un carro armato abbandonato. Sembra un avvertimento.",
    "Schema di un 'Filtro Psichico Classe-3'. Promette protezione dalle 'influenze esterne', ma richiede componenti introvabili.",
    "Etichetta di razione militare: 'Eurasian Concordat - Pasto N.7 - Scadenza: --/--/--'",
    "Richiesta di evacuazione medica urgente, negata: '...impossibile raggiungere la posizione. Priorità strategiche altrove. Sacrificio necessario.'",
    "Pagina di libro per bambini ('Le Fiabe della Vecchia Europa') con disegni inquietanti scarabocchiati sopra le illustrazioni originali.",
    "Componente elettronico non identificato, ancora caldo al tatto, che emette un debole ronzino.",
    "Messaggio in codice lasciato in un punto di scambio morto: 'Aquila non risponde. Il pacco è compromesso. Procedere con Protocollo Omega.'",
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
    "Relazione scolastica scritta a mano da un bambino: 'Il mio animale preferito è il Gatto Ombra. È soffice e silenzioso e mangia i brutti sogni'."
];

const descrizioniTracceOkLore = [
    "Le tracce ti conducono a un piccolo nascondiglio dimenticato. Trovi un appunto sbiadito che rivela un frammento del passato.",
    "Seguendo gli indizi, scopri un vecchio terminale dati parzialmente funzionante. Riesci a recuperare un breve log.",
    "Le impronte terminano vicino a un oggetto inciso. Contiene simboli strani e un pezzo di una storia più grande.",
    "In un angolo nascosto, trovi una registrazione audio danneggiata. Ascolti voci distorte che parlano di tempi andati."
];

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
        { id: "plains_bones", title: "Ossa nella Polvere", description: "Ossa sbiancate dal sole, forse umane, affiorano dal terreno screpolato. Un macabro segnale della fragilità della vita qui.", 
            choices: [
                {
                    text: "Ispeziona le ossa (Tracce)", 
                    actionKey: "inspect_bones_carefully", 
                    skillCheck: { stat: 'tracce', difficulty: 9 }, 
                    successText: "Esaminando con attenzione, trovi una vecchia fibbia di metallo e qualche moneta arrugginita di un'era dimenticata. Forse non molto utili ora, ma un segno del passato.",
                    successReward: { items: [{ itemId: 'scrap_metal', quantity: 1 }, { itemId: 'bandages_dirty', quantity: 1 }] }, 
                    failureText: "Solo ossa sbiancate e polvere. Qualunque cosa di valore è andata perduta da tempo.",
                    isSearchAction: true
                },
                {
                    text: "Cerca indizi sulla causa della morte (Presagio)",
                    actionKey: "investigate_bones_cause",
                    skillCheck: { stat: 'presagio', difficulty: 11 },
                    successText: "Un brivido ti percorre la schiena. Percepisci un'eco di violenza e disperazione legata a queste ossa. Trovi un piccolo, enigmatico frammento di un diario.",
                    successReward: { itemId: 'lore_fragment_item', quantity: 1 }, 
                    failureText: "Non riesci a cogliere nulla di particolare, solo la tristezza della morte in un luogo desolato.",
                    isSearchAction: true 
                },
                {
                    text: "Lascia riposare i morti (Ignora)",
                    actionKey: "ignore_bones",
                    outcome: "Decidi di non disturbare ulteriormente i resti. Mostri rispetto e prosegui il tuo cammino."
                }
            ]
        },
        { id: "plains_carcass", title: "Banchetto Funebre", description: "Una carcassa gonfia di animale non identificabile giace sotto il sole implacabile, divorata da sciami di insetti ronzanti. L'odore è nauseante.", 
            choices: [
                {
                    text: "Avvicinati con cautela (Adattamento)",
                    skillCheck: { stat: 'adattamento', difficulty: 10 },
                    successText: "Nonostante il tanfo, riesci a recuperare qualche pezzo di carne utilizzabile, anche se cruda.",
                    successReward: { itemId: 'meat_raw', quantity: 1 },
                    failureText: "L'odore è troppo forte e gli insetti troppo aggressivi. Meglio lasciar perdere.",
                    isSearchAction: true,
                    actionKey: "approach_carcass"
                },
                {
                    text: "Ispeziona da lontano (Presagio)",
                    skillCheck: { stat: 'presagio', difficulty: 9 },
                    successText: "Osservando da una distanza sicura, noti che la carcassa è fresca e non sembra attirare altri predatori al momento. Potrebbe valere la pena rischiare.",
                    failureText: "Da questa distanza è difficile capire molto, se non che puzza terribilmente.",
                    actionKey: "inspect_carcass_distance"
                },
                {
                    text: "Ignora e prosegui",
                    actionKey: "ignore_carcass",
                    outcome: "Decidi che il rischio o il tanfo non valgono la pena. Ti allontani rapidamente."
                }
            ]
        },
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
    'blueprint_medicine_crude': {
        id: 'blueprint_medicine_crude',
        name: 'Progetto: Medicina Grezza',
        nameShort: 'Prog: Medic. Grezza',
        description: 'Istruzioni su come preparare un semplice rimedio contro le malattie comuni usando erbe e altri ingredienti di fortuna.',
        type: 'blueprint',
        usable: true,
        weight: 0.05,
        value: 25, 
        stackable: false, 
        effects: [{ type: 'learn_recipe', recipeKey: 'craft_medicine_crude' }]
    },
    'medicine_crude': {
        id: 'medicine_crude',
        name: 'Medicina Grezza',
        nameShort: 'Medic. Grezza', // AGGIUNTO
        description: "Un intruglio di erbe dall'odore pungente e dal sapore amaro. Chissà se funziona contro le infezioni più comuni.", // AGGIORNATO
        type: 'medicine',
        usable: true,
        weight: 0.3,
        value: 15,
        stackable: true, // AGGIUNTO
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
    'lore_fragment_item': {
        id: 'lore_fragment_item',
        name: 'Frammento di Lore',
        nameShort: 'Framm. Lore',
        description: 'Un appunto sbiadito, un chip dati incrinato o un oggetto enigmatico che sussurra storie del mondo perduto. Usalo per cercare di decifrarlo.',
        type: 'tool',
        usable: true,
        weight: 0.05,
        value: 5,
        stackable: true,
        effects: [{ type: 'show_lore' }]
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
    },
    'craft_bandages_clean': {
        productName: "Bende Pulite",
        productId: 'bandages_clean',
        productQuantity: 1,
        ingredients: [
            { itemId: 'bandages_dirty', quantity: 2 },
            { itemId: 'water_purified_small', quantity: 1 }
        ],
        description: "Sterilizza delle bende sporche usando acqua purificata.",
        successMessage: "Hai creato delle Bende Pulite."
    },
    'craft_medicine_crude': {
        productName: "Medicina Grezza",
        productId: 'medicine_crude',
        productQuantity: 1,
        ingredients: [
            { itemId: 'berries', quantity: 2 },
            { itemId: 'charcoal', quantity: 1 },
            { itemId: 'water_dirty', quantity: 1 }
        ],
        description: "Prepara una medicina grezza con erbe (bacche), carbone e acqua.",
        successMessage: "Hai preparato una Medicina Grezza."
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
    }, // <<< VIRGOLA QUI
    'craft_bandages_clean': { // Ricetta che avevamo aggiunto
        productName: "Bende Pulite",
        productId: 'bandages_clean',
        productQuantity: 1,
        ingredients: [
            { itemId: 'bandages_dirty', quantity: 2 },
            { itemId: 'water_purified_small', quantity: 1 }
        ],
        description: "Sterilizza delle bende sporche usando acqua purificata.",
        successMessage: "Hai creato delle Bende Pulite."
    }, // <<< VIRGOLA QUI
    'craft_medicine_crude': { // LA RICETTA CHE MANCAVA
        productName: "Medicina Grezza",
        productId: 'medicine_crude',
        productQuantity: 1,
        ingredients: [
            { itemId: 'berries', quantity: 2 },
            { itemId: 'charcoal', quantity: 1 },
            { itemId: 'water_dirty', quantity: 1 }
        ],
        description: "Prepara una medicina grezza con erbe (bacche), carbone e acqua.",
        successMessage: "Hai preparato una Medicina Grezza."
    }
    // Aggiungere qui altre ricette base in futuro, se necessario
};
// --- FINE RICETTE --- 

// --- INIZIO DEFINIZIONE SCHEMI RICOMPENSE EVENTI ---
// ... existing code ...

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
// ... existing code ...

const esitiSeguiTracceOkNulla = [
    "Decidi che non vale la pena rischiare per delle tracce incerte. Prosegui.",
    "Hai cose più importanti a cui pensare che seguire ogni segno sospetto. Tiri dritto.",
    "L'istinto ti dice di lasciar perdere. A volte, l'ignoranza è la scelta più sicura."
];

const esitiEvitaAnimaleKo = [
    "L'animale è troppo veloce o astuto. Non riesci a seminarlo e ti blocca la strada!",
    "Un movimento goffo ti tradisce. La creatura si accorge di te e si prepara ad attaccare.",
    "Nonostante i tuoi sforzi, l'animale ti individua. La fuga non è più un'opzione.",
    "Pensi di averlo distanziato, ma sbuca da un'altra direzione, più aggressivo di prima.",
    "La bestia non si lascia ingannare e ti carica con ferocia."
];
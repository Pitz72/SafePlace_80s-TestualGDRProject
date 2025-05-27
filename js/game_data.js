/**
 * TheSafePlace - Roguelike Postapocalittico
 * Versione: v0.8.5-consolidated
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

const esitiFugaPredoniKo = [
    "Non sei abbastanza veloce! Ti raggiungono e ti attaccano brutalmente.",
    "Inciampi durante la fuga. I predoni ti sono addosso in un istante.",
    "La fuga è bloccata. Ti ritrovi intrappolato e devi subire la loro violenza.",
    "Uno di loro ti colpisce alla schiena mentre scappi. Il dolore ti rallenta fatalmente."
];

const esitiParlaPredoniKo = [
    "Le tue parole cadono nel vuoto. Ridono e ti attaccano senza pietà.",
    "Tentare di ragionare con loro è stato un errore. La loro risposta è immediata e violenta.",
    "Ti guardano con disprezzo prima di colpirti. Le parole non servono a nulla qui.",
    "La tua diplomazia li irrita ancora di più. Ti puniscono per l'audacia."
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
        },
        // NUOVI EVENTI PIANURE
        {
            id: "plains_lonely_flower",
            title: "Fiore Solitario",
            description: "In mezzo all'aridità, un singolo, tenace fiore di un colore innaturalmente vivido lotta per la sopravvivenza. È un piccolo, strano segno di vita in questo nulla.",
            choices: [
                { text: "Osservare da vicino (Presagio)", skillCheck: { stat: 'presagio', difficulty: 10 }, successText: "Il fiore emana una strana energia. Toccandolo delicatamente, senti una sensazione di pace e trovi delle bacche nascoste alla base.", successReward: { items: [{ itemId: 'berries', quantity: 2 }, { itemId: 'vitamins', quantity: 1 }] }, failureText: "È solo un fiore. Bello, ma inutile per la sopravvivenza.", actionKey: "observe_flower_closely" },
                { text: "Raccogliere il fiore", outcome: "Raccogli il fiore colorato. Forse non ha utilità pratica, ma la sua bellezza ti ricorda che c'è ancora speranza nel mondo.", successReward: { itemId: 'cloth_rags', quantity: 1 } },
                { text: "Lasciare il fiore", outcome: "Decidi di lasciare che il fiore continui la sua lotta solitaria. Prosegui, portando con te l'immagine di quella piccola vittoria della vita." }
            ]
        },
        {
            id: "plains_rusty_sign",
            title: "Cartello Arrugginito",
            description: "Un vecchio cartello stradale, piegato e corroso dalla ruggine, emerge a malapena dal terreno. Le scritte sono quasi illeggibili, ma forse indica qualcosa di importante... o di pericoloso.",
            choices: [
                { text: "Decifrare le scritte (Adattamento)", skillCheck: { stat: 'adattamento', difficulty: 11 }, successText: "Pulendo la ruggine, riesci a leggere: 'Rifugio 15 km E'. Trovi anche del metallo utilizzabile dal cartello.", successReward: { items: [{ itemId: 'scrap_metal', quantity: 2 }, { itemId: 'map_fragment_local', quantity: 1 }] }, failureText: "La ruggine ha corroso troppo il metallo. Le scritte sono illeggibili.", isSearchAction: true, actionKey: "decipher_sign" },
                { text: "Controllare la base (Tracce)", skillCheck: { stat: 'tracce', difficulty: 9 }, successText: "Scavando attorno alla base del cartello, trovi una piccola cache nascosta da qualche viaggiatore.", successReward: { items: [{ itemId: 'water_bottle', quantity: 1 }, { itemId: 'ration_pack', quantity: 1 }] }, failureText: "Solo terra e radici secche. Nulla di interessante.", isSearchAction: true, actionKey: "check_sign_base" },
                { text: "Ignorare il cartello", outcome: "Decidi che non vale la pena perdere tempo con un vecchio cartello arrugginito. Prosegui per la tua strada." }
            ]
        },
        {
            id: "plains_dust_devil",
            title: "Diavolo di Polvere",
            description: "Un piccolo ma intenso turbine di polvere e detriti si forma improvvisamente davanti a te, danzando sulla pianura.",
            choices: [
                { text: "Attraversare rapidamente (Agilità)", skillCheck: { stat: 'agilita', difficulty: 12 }, successText: "Corri attraverso il turbine con agilità. La polvere ti sferza, ma nel centro trovi oggetti sollevati dal vento.", successReward: { items: [{ itemId: 'cloth_rags', quantity: 1 }, { itemId: 'scrap_metal', quantity: 1 }] }, failureText: "Il turbine ti travolge, riempiendoti occhi e polmoni di polvere. Tossisci e ti allontani, disorientato.", actionKey: "cross_dust_devil" },
                { text: "Fare un largo giro", outcome: "Decidi di aggirare il turbine, perdendo un po' di tempo ma evitando il rischio. La prudenza è spesso la scelta migliore." },
                { text: "Aspettare che si dissolva", outcome: "Ti fermi e osservi il turbine danzare. Dopo qualche minuto si dissolve naturalmente, lasciando solo polvere nell'aria." }
            ]
        },
        {
            id: "plains_mirage",
            title: "Miraggio Ingannevole",
            description: "In lontananza, sotto il sole cocente, vedi quella che sembra un'oasi: acqua scintillante e vegetazione lussureggiante. Potrebbe essere reale, o un crudele scherzo della tua mente affaticata.",
            choices: [
                { text: "Avvicinarsi con cautela (Presagio)", skillCheck: { stat: 'presagio', difficulty: 13 }, successText: "Il tuo istinto ti dice che è un miraggio, ma investigando la zona trovi una piccola sorgente nascosta e qualche risorsa.", successReward: { items: [{ itemId: 'water_purified', quantity: 1 }, { itemId: 'berries', quantity: 1 }] }, failureText: "Era solo un miraggio. Ti ritrovi in mezzo al nulla, più assetato e deluso di prima.", isSearchAction: true, actionKey: "approach_mirage" },
                { text: "Ignorare la visione", outcome: "Scuoti la testa e continui per la tua strada. I miraggi sono crudeli inganni del deserto, meglio non farsi tentare." }
            ]
        },
        {
            id: "plains_fallen_scavenger",
            title: "Saccheggiatore Caduto",
            description: "Trovi il corpo di un altro sventurato, evidentemente un saccheggiatore, morto da poco. Il suo zaino è semiaperto.",
            choices: [
                { text: "Frugare nello zaino (Tracce)", skillCheck: { stat: 'tracce', difficulty: 10 }, successText: "Con rispetto per il morto, esamini lo zaino. Trovi provviste utili e un'arma.", successReward: { items: [{ itemId: 'ration_pack', quantity: 1 }, { itemId: 'water_bottle', quantity: 1 }, { type: 'random_weapon_item', quantity: 1 }] }, failureText: "Lo zaino è vuoto o il contenuto è rovinato. Il povero diavolo non aveva molto.", isSearchAction: true, actionKey: "search_scavenger_pack" },
                { text: "Controllare i dintorni (Presagio)", skillCheck: { stat: 'presagio', difficulty: 11 }, successText: "Esamini la scena. Segni di lotta, ma anche indizi su cosa abbia ucciso il saccheggiatore. Trovi delle munizioni sparse.", successReward: { items: [{ type: 'random_ammo_item', quantity: 1 }, { itemId: 'bandages_dirty', quantity: 1 }] }, failureText: "Non riesci a capire cosa sia successo. Meglio non indugiare troppo.", isSearchAction: true, actionKey: "investigate_death_scene" },
                { text: "Lasciare stare", outcome: "Decidi di rispettare il morto e non disturbare i suoi resti. Sussurri una preghiera e prosegui." }
            ]
        },
        {
            id: "plains_burned_patch",
            title: "Chiazza Bruciata",
            description: "Un'ampia zona di terreno è annerita e vetrificata, come se qualcosa di estremamente caldo fosse esploso o caduto qui. Al centro, qualcosa luccica debolmente.",
            choices: [
                { text: "Avvicinarsi al centro (Adattamento)", skillCheck: { stat: 'adattamento', difficulty: 12 }, successText: "Resistendo al calore residuo, raggiungi il centro. Trovi frammenti metallici fusi e componenti tecnologici.", successReward: { items: [{ itemId: 'mechanical_parts', quantity: 2 }, { itemId: 'scrap_metal', quantity: 1 }] }, failureText: "Il calore è ancora troppo intenso. Ti allontani con le mani bruciacchiate.", actionKey: "approach_burn_center" },
                { text: "Esaminare i margini (Tracce)", skillCheck: { stat: 'tracce', difficulty: 10 }, successText: "Ai margini della zona bruciata trovi oggetti scagliati via dall'esplosione.", successReward: { items: [{ itemId: 'cloth_rags', quantity: 2 }, { type: 'random_common_resource', quantity: 1 }] }, failureText: "Solo cenere e detriti carbonizzati. Nulla di utile.", isSearchAction: true, actionKey: "examine_burn_edges" },
                { text: "Evitare l'area", outcome: "Decidi che l'area è troppo pericolosa. Qualunque cosa sia successa qui, è meglio non rischiare." }
            ]
        },
        {
            id: "plains_whispers_wind",
            title: "Sussurri nel Vento",
            description: "Il vento sembra trasportare voci distorte e frammenti di melodie dimenticate. Stai impazzendo o c'è qualcos'altro là fuori?",
            choices: [
                { text: "Concentrarsi sui suoni (Presagio)", skillCheck: { stat: 'presagio', difficulty: 13 }, successText: "Ascoltando attentamente, distingui parole in una lingua antica. Ti guidano verso un piccolo tesoro nascosto.", successReward: { items: [{ itemId: 'vitamins', quantity: 1 }, { itemId: 'lore_fragment_item', quantity: 1 }] }, failureText: "I sussurri si trasformano in un ronzio inquietante. Ti allontani, sentendoti a disagio.", actionKey: "listen_to_whispers" },
                { text: "Ignorare i suoni", outcome: "Decidi che è solo il vento che gioca brutti scherzi. Ti tappi le orecchie e acceleri il passo." }
            ]
        },
        {
            id: "plains_old_well",
            title: "Vecchio Pozzo Secco",
            description: "Ti imbatti in un vecchio pozzo di pietra, chiaramente in disuso da decenni. La carrucola è arrugginita e non c'è traccia di una corda.",
            choices: [
                { text: "Guardare all'interno (Tracce)", skillCheck: { stat: 'tracce', difficulty: 10 }, successText: "Sporgendoti con cautela, vedi qualcosa lucciccare sul fondo. Con improvvisazione, riesci a recuperarlo.", successReward: { items: [{ itemId: 'water_bottle', quantity: 1 }, { itemId: 'scrap_metal', quantity: 1 }] }, failureText: "Il pozzo è troppo profondo e buio. Non riesci a vedere nulla di utile.", actionKey: "look_into_well" },
                { text: "Cercare una corda (Adattamento)", skillCheck: { stat: 'adattamento', difficulty: 12 }, successText: "Improvvisi una corda con stracci e rami. Riesci a esplorare il pozzo e trovare un piccolo tesoro.", successReward: { items: [{ itemId: 'water_purified', quantity: 1 }, { itemId: 'mechanical_parts', quantity: 1 }] }, failureText: "Non riesci a creare nulla di abbastanza resistente per esplorare il pozzo.", isSearchAction: true, actionKey: "improvise_rope" },
                { text: "Lasciare perdere", outcome: "Decidi che il pozzo è troppo rischioso. Meglio non rischiare di cadere dentro." }
            ]
        },
        {
            id: "plains_scrap_pile",
            title: "Cumulo di Rottami",
            description: "Un ammasso contorto di metallo arrugginito, plastica fusa e altri detriti irriconoscibili. Potrebbe nascondere qualcosa di utile o solo taglienti sorprese.",
            choices: [
                { text: "Frugare con attenzione (Adattamento)", skillCheck: { stat: 'adattamento', difficulty: 11 }, successText: "Con pazienza e attenzione, riesci a estrarre materiali utili senza ferirti.", successReward: { items: [{ itemId: 'scrap_metal', quantity: 3 }, { itemId: 'mechanical_parts', quantity: 1 }] }, failureText: "Ti tagli con un pezzo di metallo affilato. I rottami sono troppo pericolosi da maneggiare.", actionKey: "carefully_search_scrap" },
                { text: "Evitare il cumulo", outcome: "Decidi che non vale la pena rischiare di ferirsi con i rottami taglienti. Prosegui oltre." }
            ]
        },
        {
            id: "plains_traveler_tracks",
            title: "Tracce di un Viandante Solitario",
            description: "Noti delle impronte chiare e recenti che attraversano la pianura. Appartengono a una singola persona, che sembrava muoversi con uno scopo.",
            choices: [
                { text: "Seguire le tracce (Tracce)", skillCheck: { stat: 'tracce', difficulty: 11 }, successText: "Le tracce ti conducono a una piccola cache nascosta dal viandante. Forse un deposito di emergenza.", successReward: { items: [{ itemId: 'ration_pack', quantity: 1 }, { itemId: 'bandages_clean', quantity: 1 }, { itemId: 'map_fragment_local', quantity: 1 }] }, failureText: "Le tracce si perdono su terreno roccioso. Non riesci a seguirle oltre.", isSearchAction: true, actionKey: "follow_traveler_tracks" },
                { text: "Andare nella direzione opposta", outcome: "Decidi di evitare di incontrare il viandante. Vai nella direzione opposta, preferendo la solitudine." },
                { text: "Ignorare le tracce", outcome: "Le tracce non ti interessano. Continui per il tuo cammino senza deviazioni." }
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
         },
         // NUOVI EVENTI FORESTA
         {
            id: "forest_sacrificial_tree",
            title: "Albero Sacrificale",
            description: "Un albero antico e imponente si erge al centro di una piccola radura. Attorno al suo tronco sono legati strani feticci fatti di ossa, stracci e metallo arrugginito. Emana un'aura inquietante.",
            choices: [
                { text: "Esaminare i feticci (Presagio)", skillCheck: { stat: 'presagio', difficulty: 12 }, successText: "I feticci nascondono piccoli oggetti di valore, forse offerte. Trovi medicine e materiali utili.", successReward: { items: [{ itemId: 'medicine_crude', quantity: 1 }, { itemId: 'cloth_rags', quantity: 2 }, { itemId: 'scrap_metal', quantity: 1 }] }, failureText: "I feticci emanano un'energia malvagia. Ti allontani rapidamente, sentendoti osservato.", actionKey: "examine_fetishes" },
                { text: "Danneggiare l'albero (Potenza)", skillCheck: { stat: 'potenza', difficulty: 14 }, successText: "Con forza, strappi alcuni feticci e danneggi la corteccia. Trovi oggetti nascosti nelle cavità.", successReward: { items: [{ itemId: 'vitamins', quantity: 1 }, { type: 'random_weapon_item', quantity: 1 }] }, failureText: "L'albero sembra resistere ai tuoi sforzi. I feticci si muovono da soli nel vento.", actionKey: "damage_tree", usesWeapon: true },
                { text: "Lasciare la radura", outcome: "Decidi che questo luogo è troppo inquietante. Ti allontani rapidamente, sentendo gli occhi invisibili seguirti." }
            ]
         },
         {
            id: "forest_distant_songs",
            title: "Eco di Canti Lontani",
            description: "Tra il fruscio delle foglie, ti sembra di udire l'eco sommesso di un canto o una melodia malinconica provenire dalle profondità della foresta.",
            choices: [
                { text: "Seguire il suono (Tracce)", skillCheck: { stat: 'tracce', difficulty: 11 }, successText: "Il canto ti guida verso una piccola grotta nascosta. All'interno trovi i resti di un accampamento e provviste.", successReward: { items: [{ itemId: 'ration_pack', quantity: 1 }, { itemId: 'bandages_clean', quantity: 1 }, { itemId: 'map_fragment_local', quantity: 1 }] }, failureText: "Il suono si allontana sempre di più, portandoti in circolo. Ti ritrovi dove hai iniziato.", isSearchAction: true, actionKey: "follow_song" },
                { text: "Ignorare il canto", outcome: "Decidi che è meglio non farsi attirare da suoni misteriosi nella foresta. Continui per il sentiero principale." },
                { text: "Gridare per rispondere", outcome: "Gridi verso la fonte del canto. Il suono si interrompe bruscamente, lasciando solo un silenzio inquietante." }
            ]
         },
         {
            id: "forest_hunter_trap",
            title: "Trappola del Cacciatore Dimenticata",
            description: "Scorgi una vecchia trappola per animali, forse un grosso tagliola o un laccio, parzialmente nascosta dalle foglie. Sembra ancora armata.",
            choices: [
                { text: "Disarmare la trappola (Adattamento)", skillCheck: { stat: 'adattamento', difficulty: 13 }, successText: "Con attenzione, riesci a disarmare la trappola e recuperare il metallo e i meccanismi.", successReward: { items: [{ itemId: 'scrap_metal', quantity: 2 }, { itemId: 'mechanical_parts', quantity: 1 }, { itemId: 'rope', quantity: 1 }] }, failureText: "La trappola scatta mentre cerchi di disarmarla. Per fortuna non ti ferisce, ma è inutilizzabile.", actionKey: "disarm_trap" },
                { text: "Usare come esca (Presagio)", skillCheck: { stat: 'presagio', difficulty: 11 }, successText: "Attiri un piccolo animale nella trappola. Carne fresca per cena.", successReward: { items: [{ itemId: 'meat_raw', quantity: 1 }, { itemId: 'cloth_rags', quantity: 1 }] }, failureText: "Nessun animale si avvicina alla trappola. Forse sanno che è pericolosa.", isSearchAction: true, actionKey: "use_trap_bait" },
                { text: "Segnalare e aggirare", outcome: "Segni la trappola con un ramo per evitarla e la aggiri con cautela. Meglio non rischiare." }
            ]
         },
         {
            id: "forest_symbiotic_plant",
            title: "Simbionte Vegetale",
            description: "Un cadavere di animale è completamente avvolto da una strana muffa o fungo luminescente che pulsa debolmente. La pianta sembra aver consumato e integrato la creatura.",
            choices: [
                { text: "Prelevare un campione (Adattamento)", skillCheck: { stat: 'adattamento', difficulty: 12 }, successText: "Con cautela, prelevi parte del fungo. Potrebbe essere utile per medicine o come fonte di luce.", successReward: { items: [{ itemId: 'medicine_crude', quantity: 2 }, { itemId: 'vitamins', quantity: 1 }] }, failureText: "Il fungo rilascia spore tossiche quando lo tocchi. Ti allontani tossendo.", actionKey: "sample_symbiont" },
                { text: "Distruggere con il fuoco (Potenza)", skillCheck: { stat: 'potenza', difficulty: 10 }, successText: "Bruci la simbiosi. Tra le ceneri trovi ossa e oggetti dell'animale originale.", successReward: { items: [{ itemId: 'charcoal', quantity: 2 }, { itemId: 'scrap_metal', quantity: 1 }] }, failureText: "Il fuoco si spegne rapidamente. Il fungo sembra resistente alle fiamme.", actionKey: "burn_symbiont", usesWeapon: true },
                { text: "Osservare da lontano", outcome: "Decidi che è troppo pericoloso avvicinarsi. Osservi il fenomeno da distanza di sicurezza e prosegui." }
            ]
         },
         {
            id: "forest_hidden_path",
            title: "Sentiero Nascosto",
            description: "Noti un sentiero appena percettibile che si inoltra nel fitto della boscaglia, quasi invisibile a un occhio inesperto. Chissà dove conduce.",
            choices: [
                { text: "Seguire il sentiero (Tracce)", skillCheck: { stat: 'tracce', difficulty: 12 }, successText: "Il sentiero ti conduce a una radura segreta con un piccolo rifugio abbandonato pieno di provviste.", successReward: { items: [{ itemId: 'ration_pack', quantity: 2 }, { itemId: 'water_bottle', quantity: 1 }, { type: 'random_weapon_item', quantity: 1 }] }, failureText: "Il sentiero si perde nel fitto del bosco. Ti ritrovi più confuso di prima.", isSearchAction: true, actionKey: "follow_hidden_path" },
                { text: "Segnare sulla mappa", outcome: "Segni la posizione del sentiero sulla tua mappa per esplorarlo in futuro. Potrebbe essere utile.", successReward: { itemId: 'map_fragment_local', quantity: 1 } },
                { text: "Ignorare il sentiero", outcome: "Decidi di rimanere sui sentieri conosciuti. I percorsi nascosti possono nascondere pericoli." }
            ]
         },
         {
            id: "forest_whispering_tree",
            title: "L'Albero dei Sussurri",
            description: "Un albero cavo e contorto sembra emettere strani sussurri quando il vento ci passa attraverso. Alcuni dicono che questi alberi custodiscano segreti o attirino spiriti.",
            choices: [
                { text: "Ascoltare i sussurri (Presagio)", skillCheck: { stat: 'presagio', difficulty: 13 }, successText: "I sussurri ti rivelano la posizione di un tesoro nascosto nelle radici dell'albero.", successReward: { items: [{ itemId: 'vitamins', quantity: 1 }, { itemId: 'lore_fragment_item', quantity: 1 }, { type: 'random_rare_resource', quantity: 1 }] }, failureText: "I sussurri diventano un ronzio assordante. Ti allontani con un forte mal di testa.", actionKey: "listen_whispers" },
                { text: "Lasciare un'offerta", outcome: "Lasci un piccolo oggetto alla base dell'albero come offerta. I sussurri sembrano placarsi.", successReward: { itemId: 'cloth_rags', quantity: 1 } },
                { text: "Ignorare l'albero", outcome: "Decidi di non avere nulla a che fare con alberi che sussurrano. Prosegui rapidamente." }
            ]
         },
         {
            id: "forest_camouflaged_predator",
            title: "Predatore Mimetizzato",
            description: "Hai la netta sensazione di essere osservato. Tra il fogliame, qualcosa si muove, perfettamente mimetizzato con l'ambiente.",
            choices: [
                { text: "Attacco preventivo (Potenza)", skillCheck: { stat: 'potenza', difficulty: 14 }, successText: "Il tuo attacco colpisce nel segno. La creatura ferita fugge, lasciando cadere qualcosa.", successReward: { items: [{ itemId: 'meat_raw', quantity: 1 }, { itemId: 'cloth_rags', quantity: 1 }] }, failureText: "Il tuo attacco colpisce solo rami e foglie. Qualunque cosa fosse, è fuggita.", actionKey: "preemptive_attack", usesWeapon: true },
                { text: "Allontanarsi silenziosamente (Agilità)", skillCheck: { stat: 'agilita', difficulty: 12 }, successText: "Ti allontani senza essere notato. Nella fuga, trovi un piccolo nascondiglio con provviste.", successReward: { items: [{ itemId: 'bandages_dirty', quantity: 1 }, { type: 'random_food_item', quantity: 1 }] }, failureText: "Pesti un ramo secco. Qualunque cosa ti stesse osservando ora sa dove sei.", actionKey: "sneak_away" },
                { text: "Rimanere immobile", outcome: "Ti congeli sul posto, sperando di non essere visto. Dopo lunghi minuti, la sensazione di essere osservato svanisce." }
            ]
         },
         {
            id: "forest_contaminated_spring",
            title: "Fonte Contaminata",
            description: "Trovi una piccola sorgente d'acqua cristallina, un vero miraggio. Tuttavia, le piante intorno ad essa sono stranamente ingiallite e malate.",
            choices: [
                { text: "Raccogliere l'acqua (Adattamento)", skillCheck: { stat: 'adattamento', difficulty: 11 }, successText: "Raccogli l'acqua con cautela. Sembra pulita, ma meglio purificarla prima di berla.", successReward: { items: [{ itemId: 'water_dirty', quantity: 2 }] }, failureText: "L'acqua ha un odore strano. Meglio non rischiare.", actionKey: "collect_contaminated_water" },
                { text: "Investigare la contaminazione (Presagio)", skillCheck: { stat: 'presagio', difficulty: 12 }, successText: "Scopri che la contaminazione proviene da minerali radioattivi. Trovi alcuni cristalli utili.", successReward: { items: [{ itemId: 'mechanical_parts', quantity: 1 }, { type: 'random_rare_resource', quantity: 1 }] }, failureText: "Non riesci a capire la causa della contaminazione. Meglio allontanarsi.", isSearchAction: true, actionKey: "investigate_contamination" },
                { text: "Evitare la fonte", outcome: "Decidi che l'acqua contaminata non vale il rischio. Continui la ricerca di una fonte più sicura." }
            ]
         },
         {
            id: "forest_silent_grove",
            title: "Il Bosco Silenzioso",
            description: "Entri in una parte della foresta dove ogni suono sembra attutito. Non ci sono canti di uccelli, né il ronzio di insetti. Solo un silenzio innaturale e pesante.",
            choices: [
                { text: "Procedere con cautela (Tracce)", skillCheck: { stat: 'tracce', difficulty: 11 }, successText: "La tua cautela è premiata. Trovi segni di un vecchio accampamento e alcune provviste nascoste.", successReward: { items: [{ itemId: 'ration_pack', quantity: 1 }, { itemId: 'bandages_clean', quantity: 1 }] }, failureText: "Il silenzio ti mette a disagio. Non trovi nulla e ti allontani rapidamente.", isSearchAction: true, actionKey: "proceed_cautiously" },
                { text: "Fare rumore", outcome: "Gridi e fai rumore per rompere il silenzio. L'eco della tua voce suona strano e distorto." },
                { text: "Tornare indietro", outcome: "Il silenzio innaturale ti spaventa. Torni sui tuoi passi verso una parte più normale della foresta." }
            ]
         },
         {
            id: "forest_exposed_roots",
            title: "Radici Esposte",
            description: "Un grosso albero è caduto, esponendo un intricato sistema di radici. Tra di esse, potresti trovare qualcosa di interessante o rimanere intrappolato.",
            choices: [
                { text: "Frugare tra le radici (Adattamento)", skillCheck: { stat: 'adattamento', difficulty: 10 }, successText: "Tra le radici intricate trovi oggetti sepolti da tempo e materiali utili.", successReward: { items: [{ itemId: 'scrap_metal', quantity: 1 }, { itemId: 'cloth_rags', quantity: 2 }, { type: 'random_common_resource', quantity: 1 }] }, failureText: "Ti incastri tra le radici e devi lottare per liberarti. Nessun tesoro, solo graffi.", actionKey: "search_roots" },
                { text: "Usare come riparo", outcome: "Le radici esposte formano un riparo naturale. Ti riposi brevemente al sicuro." },
                { text: "Evitare la zona", outcome: "Le radici sembrano instabili. Meglio non rischiare di rimanere intrappolato." }
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
         },
         // NUOVI EVENTI FIUME
         {
            id: "river_stranded_wreck",
            title: "Relitto Incagliato",
            description: "Lo scheletro arrugginito di una piccola imbarcazione o di un veicolo anfibio è incagliato sulla riva o su un banco di sabbia al centro del fiume torbido.",
            choices: [
                { text: "Raggiungere il relitto (Agilità)", skillCheck: { stat: 'agilita', difficulty: 12 }, successText: "Riesci a raggiungere il relitto guadando o saltando. All'interno trovi provviste e materiali utili.", successReward: { items: [{ itemId: 'ration_pack', quantity: 1 }, { itemId: 'scrap_metal', quantity: 2 }, { itemId: 'rope', quantity: 1 }, { type: 'random_common_resource', quantity: 1 }] }, failureText: "La corrente è più forte del previsto. Rischi di essere trascinato via e devi tornare a riva.", actionKey: "reach_wreck" },
                { text: "Usare come postazione (Tracce)", skillCheck: { stat: 'tracce', difficulty: 10 }, successText: "Dal relitto hai una buona visuale del fiume. Noti oggetti trasportati dalla corrente e li recuperi.", successReward: { items: [{ itemId: 'wood_planks', quantity: 2 }, { itemId: 'cloth_rags', quantity: 1 }] }, failureText: "Il relitto è troppo instabile per essere usato come postazione di osservazione.", actionKey: "use_as_post" },
                { text: "Ignorare il relitto", outcome: "Decidi che raggiungere il relitto è troppo rischioso. Prosegui lungo la riva." }
            ]
         },
         {
            id: "river_mutated_fish",
            title: "Pesci Mutati",
            description: "Vedi dei pesci dalle forme strane e dai colori innaturali nuotare vicino alla superficie. Alcuni sono grossi, altri hanno troppi occhi o pinne deformi.",
            choices: [
                { text: "Tentare di pescare (Adattamento)", skillCheck: { stat: 'adattamento', difficulty: 13 }, successText: "Riesci a catturare alcuni pesci mutati. Sembrano commestibili, anche se dall'aspetto strano.", successReward: { items: [{ itemId: 'meat_raw', quantity: 2 }, { itemId: 'fish_mutated', quantity: 1 }] }, failureText: "I pesci sono troppo veloci o aggressivi. Uno di loro cerca persino di mordere la tua improvvisata lenza.", actionKey: "attempt_fishing" },
                { text: "Osservare il comportamento (Presagio)", skillCheck: { stat: 'presagio', difficulty: 11 }, successText: "Osservando i pesci, capisci che sono relativamente innocui e noti dove si radunano oggetti sul fondale.", successReward: { items: [{ itemId: 'mechanical_parts', quantity: 1 }, { itemId: 'scrap_metal', quantity: 1 }] }, failureText: "I pesci si comportano in modo troppo erratico per essere compresi. Meglio non avvicinarsi.", actionKey: "observe_fish" },
                { text: "Evitare l'acqua", outcome: "Decidi che pesci mutati significano acqua pericolosa. Ti allontani dalla riva e continui a monte." }
            ]
         },
         {
            id: "river_floating_debris",
            title: "Oggetti Trasportati dalla Corrente",
            description: "La corrente del fiume trasporta lentamente detriti di ogni tipo: plastica, legno, a volte contenitori sigillati o frammenti di qualcosa di più grande.",
            choices: [
                { text: "Afferrare gli oggetti (Agilità)", skillCheck: { stat: 'agilita', difficulty: 11 }, successText: "Con agilità, riesci ad afferrare alcuni oggetti utili trasportati dalla corrente.", successReward: { items: [{ itemId: 'plastic_containers', quantity: 2 }, { itemId: 'wood_planks', quantity: 1 }, { type: 'random_common_resource', quantity: 1 }] }, failureText: "Gli oggetti scivolano via dalle tue mani o sono troppo lontani dalla riva per essere raggiunti.", actionKey: "grab_debris" },
                { text: "Costruire una trappola (Adattamento)", skillCheck: { stat: 'adattamento', difficulty: 12 }, successText: "Improvvisi una piccola diga o rete per intrappolare i detriti. Raccogli una buona quantità di materiali.", successReward: { items: [{ itemId: 'scrap_metal', quantity: 2 }, { itemId: 'cloth_rags', quantity: 2 }, { itemId: 'rope', quantity: 1 }] }, failureText: "La tua trappola improvvisata viene spazzata via dalla corrente. Hai perso tempo e materiali.", isSearchAction: true, actionKey: "build_debris_trap" },
                { text: "Osservare e aspettare", outcome: "Ti siedi sulla riva e osservi la corrente, sperando che porti qualcosa di veramente utile." }
            ]
         },
         {
            id: "river_collapsed_bridge",
            title: "Il Ponte Crollato",
            description: "I resti di un ponte crollato attraversano il fiume. Alcune sezioni sono sommerse, altre emergono come isole di cemento e acciaio contorto.",
            choices: [
                { text: "Attraversare sui resti (Agilità)", skillCheck: { stat: 'agilita', difficulty: 14 }, successText: "Con equilibrio e coraggio, riesci ad attraversare il fiume saltando sui resti del ponte.", successReward: { items: [{ itemId: 'scrap_metal', quantity: 1 }, { itemId: 'mechanical_parts', quantity: 1 }] }, failureText: "Un pezzo di cemento cede sotto il tuo peso. Cadi in acqua e devi nuotare disperatamente verso la riva.", actionKey: "cross_bridge_remains" },
                { text: "Cercare materiali (Tracce)", skillCheck: { stat: 'tracce', difficulty: 10 }, successText: "Tra le macerie del ponte trovi materiali da costruzione e oggetti metallici utili.", successReward: { items: [{ itemId: 'scrap_metal', quantity: 3 }, { itemId: 'concrete_chunks', quantity: 2 }] }, failureText: "Le macerie sono troppo pesanti o instabili per essere recuperate in sicurezza.", isSearchAction: true, actionKey: "search_bridge_materials" },
                { text: "Usare come riparo", outcome: "Le sezioni emergenti del ponte offrono un riparo temporaneo dal vento e dalla pioggia." }
            ]
         },
         {
            id: "river_water_whispers",
            title: "Sussurri dall'Acqua",
            description: "Avvicinandoti alla riva, ti sembra di sentire dei sussurri o dei lamenti provenire dalla superficie dell'acqua torbida, come se qualcuno fosse intrappolato sotto.",
            choices: [
                { text: "Chiamare per rispondere (Influenza)", skillCheck: { stat: 'influenza', difficulty: 12 }, successText: "Chiami verso l'acqua. I sussurri si intensificano e ti guidano verso un oggetto sommerso vicino alla riva.", successReward: { items: [{ itemId: 'water_bottle', quantity: 1 }, { itemId: 'lore_fragment_item', quantity: 1 }] }, failureText: "I sussurri si trasformano in urla inquietanti. Ti allontani rapidamente, turbato.", actionKey: "call_to_whispers" },
                { text: "Cercare la fonte (Presagio)", skillCheck: { stat: 'presagio', difficulty: 13 }, successText: "Il tuo istinto ti guida verso la vera fonte dei suoni: un vecchio registratore impermeabile ancora funzionante.", successReward: { items: [{ itemId: 'electronic_device', quantity: 1 }, { itemId: 'mechanical_parts', quantity: 1 }] }, failureText: "I sussurri sembrano provenire da ovunque e da nessun luogo. Ti allontani confuso.", isSearchAction: true, actionKey: "search_whisper_source" },
                { text: "Allontanarsi rapidamente", outcome: "Decidi che i sussurri dall'acqua sono un cattivo presagio. Ti allontani velocemente dalla riva." }
            ]
         },
         {
            id: "river_dangerous_rapids",
            title: "Rapide Pericolose",
            description: "Il fiume si restringe e la corrente accelera, formando piccole rapide rumorose e piene di rocce affioranti. Attraversare qui sarebbe molto rischioso.",
            choices: [
                { text: "Cercare un guado (Tracce)", skillCheck: { stat: 'tracce', difficulty: 12 }, successText: "Seguendo la riva, trovi un punto più calmo dove attraversare in sicurezza.", successReward: { items: [{ itemId: 'map_fragment_local', quantity: 1 }] }, failureText: "Non riesci a trovare un punto sicuro per attraversare. Le rapide si estendono troppo a lungo.", isSearchAction: true, actionKey: "find_ford" },
                { text: "Costruire una zattera (Adattamento)", skillCheck: { stat: 'adattamento', difficulty: 15 }, successText: "Con grande abilità, costruisci una zattera robusta che riesce a superare le rapide.", successReward: { items: [{ itemId: 'wood_planks', quantity: 1 }, { itemId: 'rope', quantity: 1 }] }, failureText: "La tua zattera improvvisata si disintegra nelle rapide. Per fortuna riesci a nuotare verso la riva.", actionKey: "build_raft" },
                { text: "Tentare l'attraversamento", outcome: "Decidi di rischiare l'attraversamento diretto. È pericoloso, ma a volte l'audacia paga." }
            ]
         },
         {
            id: "river_collapsed_bank",
            title: "Argine Franato",
            description: "Un tratto dell'argine del fiume è franato, creando una parete di fango instabile e rivelando strati di terra e detriti sepolti.",
            choices: [
                { text: "Esaminare la frana (Tracce)", skillCheck: { stat: 'tracce', difficulty: 11 }, successText: "Nella parete franata trovi oggetti sepolti da tempo e minerali esposti.", successReward: { items: [{ itemId: 'scrap_metal', quantity: 2 }, { type: 'random_rare_resource', quantity: 1 }, { itemId: 'mechanical_parts', quantity: 1 }] }, failureText: "La parete è troppo instabile. Mentre la esamini, altri pezzi di terra cadono.", actionKey: "examine_landslide" },
                { text: "Scalare la frana (Agilità)", skillCheck: { stat: 'agilita', difficulty: 13 }, successText: "Riesci a scalare la frana e raggiungere un punto elevato con una buona vista della zona.", successReward: { items: [{ itemId: 'map_fragment_local', quantity: 1 }] }, failureText: "Il terreno cede sotto i tuoi piedi. Scivoli giù nella frana, coperto di fango.", actionKey: "climb_landslide" },
                { text: "Evitare la zona", outcome: "Decidi che la frana è troppo pericolosa. Aggiri la zona instabile con un percorso più lungo." }
            ]
         },
         {
            id: "river_amphibian_nests",
            title: "Nidi sulle Rive",
            description: "Lungo le rive fangose, noti numerosi nidi o tane di creature anfibie o semi-acquatiche. Alcuni sembrano occupati.",
            choices: [
                { text: "Cercare uova (Adattamento)", skillCheck: { stat: 'adattamento', difficulty: 12 }, successText: "Con cautela, riesci a prendere alcune uova dai nidi abbandonati. Proteine fresche.", successReward: { items: [{ itemId: 'eggs_fresh', quantity: 2 }, { itemId: 'meat_raw', quantity: 1 }] }, failureText: "Le creature madri tornano ai nidi. Devi scappare rapidamente per evitare i loro attacchi.", actionKey: "search_eggs" },
                { text: "Osservare le creature (Presagio)", skillCheck: { stat: 'presagio', difficulty: 11 }, successText: "Osservando le creature, capisci i loro schemi comportamentali e trovi un nascondiglio sicuro.", successReward: { items: [{ itemId: 'cloth_rags', quantity: 1 }, { type: 'random_common_resource', quantity: 1 }] }, failureText: "Le creature si accorgono della tua presenza e diventano aggressive. Meglio allontanarsi.", actionKey: "observe_creatures" },
                { text: "Evitare i nidi", outcome: "Decidi di non disturbare le creature nei loro nidi. Aggiri la zona con rispetto per la fauna locale." }
            ]
         },
         {
            id: "river_inaccessible_island",
            title: "L'Isolotto Inaccessibile",
            description: "Al centro del fiume, un piccolo isolotto verdeggiante sembra un'oasi di pace. Raggiungerlo, però, richiederebbe di attraversare la corrente forte e l'acqua sospetta.",
            choices: [
                { text: "Costruire un ponte (Adattamento)", skillCheck: { stat: 'adattamento', difficulty: 14 }, successText: "Con ingegno, costruisci un ponte improvvisato per raggiungere l'isola. Trovi un piccolo tesoro nascosto.", successReward: { items: [{ itemId: 'ration_pack', quantity: 1 }, { itemId: 'water_purified', quantity: 1 }, { type: 'random_rare_resource', quantity: 1 }] }, failureText: "Il tuo ponte improvvisato crolla a metà costruzione. I materiali vengono trascinati via dalla corrente.", actionKey: "build_bridge" },
                { text: "Nuotare attraverso (Vigore)", skillCheck: { stat: 'vigore', difficulty: 15 }, successText: "Con forza e determinazione, riesci a nuotare fino all'isola e tornare indietro.", successReward: { items: [{ itemId: 'berries', quantity: 2 }, { itemId: 'medicine_crude', quantity: 1 }] }, failureText: "La corrente è troppo forte. Vieni trascinato a valle e devi lottare per raggiungere la riva.", actionKey: "swim_across" },
                { text: "Ammirare da lontano", outcome: "Decidi che l'isola è troppo bella e pericolosa per essere raggiunta. La ammiri da lontano e prosegui." }
            ]
         },
         {
            id: "river_message_bottle",
            title: "Il Messaggio nella Bottiglia",
            description: "Incagliata tra i detriti sulla riva, noti una vecchia bottiglia sigillata. All'interno sembra esserci un pezzo di carta arrotolato.",
            choices: [
                { text: "Aprire la bottiglia (Adattamento)", skillCheck: { stat: 'adattamento', difficulty: 10 }, successText: "Riesci ad aprire la bottiglia senza romperla. Il messaggio contiene informazioni preziose e coordinate.", successReward: { items: [{ itemId: 'lore_fragment_item', quantity: 1 }, { itemId: 'map_fragment_local', quantity: 1 }, { itemId: 'water_bottle', quantity: 1 }] }, failureText: "La bottiglia si rompe mentre cerchi di aprirla. Il messaggio si bagna e diventa illeggibile.", actionKey: "open_bottle" },
                { text: "Rimettere in acqua", outcome: "Decidi di lasciare che il messaggio continui il suo viaggio. Lo rilanci nel fiume, sperando raggiunga qualcun altro." },
                { text: "Conservare sigillata", outcome: "Tieni la bottiglia sigillata come un misterioso artefatto. Forse un giorno scoprirai cosa contiene.", successReward: { itemId: 'mystery_bottle', quantity: 1 } }
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
        },
        // NUOVI EVENTI VILLAGGIO
        {
            id: "village_forgotten_altar",
            title: "Altare Dimenticato",
            description: "In una delle baracche meno diroccate, trovi un piccolo altare improvvisato con oggetti strani e simboli scarabocchiati. Sembra un tentativo di placare qualche divinità sconosciuta.",
            choices: [
                { text: "Lasciare un'offerta", outcome: "Lasci un piccolo oggetto come offerta. Forse non servirà a nulla, ma rispetti le credenze di chi era qui prima.", successReward: { itemId: 'vitamins', quantity: 1 } },
                { text: "Profanare l'altare (Potenza)", skillCheck: { stat: 'potenza', difficulty: 11 }, successText: "Distruggi l'altare e prendi gli oggetti. Trovi candele, monete e piccoli tesori.", successReward: { items: [{ itemId: 'scrap_metal', quantity: 2 }, { itemId: 'cloth_rags', quantity: 1 }, { type: 'random_common_resource', quantity: 1 }] }, failureText: "Mentre distruggi l'altare, qualcosa crolla sopra di te. Meglio lasciare stare.", actionKey: "desecrate_altar" },
                { text: "Studiare i simboli (Presagio)", skillCheck: { stat: 'presagio', difficulty: 12 }, successText: "I simboli ti rivelano la posizione di una cache nascosta nel villaggio.", successReward: { items: [{ itemId: 'lore_fragment_item', quantity: 1 }, { itemId: 'map_fragment_local', quantity: 1 }] }, failureText: "I simboli sono troppo confusi o danneggiati per essere compresi.", isSearchAction: true, actionKey: "study_symbols" }
            ]
        },
        {
            id: "village_lonely_toy",
            title: "Giocattolo Solitario",
            description: "Un giocattolo rotto e sporco – una bambola senza un occhio, un soldatino di piombo – giace abbandonato in mezzo alla polvere di una soglia. Un triste promemoria dei bambini che un tempo vivevano qui.",
            choices: [
                { text: "Raccogliere il giocattolo", outcome: "Raccogli il giocattolo con delicatezza. Forse non ha valore pratico, ma conserva la memoria di tempi migliori.", successReward: { itemId: 'cloth_rags', quantity: 1 } },
                { text: "Seppellire il giocattolo", outcome: "Scavi una piccola buca e seppellisci il giocattolo con rispetto. Un piccolo gesto di umanità in un mondo crudele." },
                { text: "Lasciarlo dov'è", outcome: "Decidi di lasciare il giocattolo dove si trova. Forse qualcun altro lo troverà e ricorderà." }
            ]
        },
        {
            id: "village_empty_square",
            title: "Il Silenzio della Piazza",
            description: "Raggiungi quella che un tempo doveva essere la piazza del villaggio. Ora è vuota, con solo il vento che solleva foglie secche. Un silenzio carico di attesa grava sul luogo.",
            choices: [
                { text: "Attraversare rapidamente", outcome: "Attraversi la piazza il più velocemente possibile, sentendoti esposto e vulnerabile." },
                { text: "Cercare tra i detriti (Tracce)", skillCheck: { stat: 'tracce', difficulty: 10 }, successText: "Ai margini della piazza trovi oggetti dimenticati e materiali utili.", successReward: { items: [{ itemId: 'scrap_metal', quantity: 1 }, { itemId: 'cloth_rags', quantity: 2 }, { type: 'random_common_resource', quantity: 1 }] }, failureText: "Solo polvere e foglie secche. Nulla di valore è rimasto.", isSearchAction: true, actionKey: "search_square_debris" },
                { text: "Aspettare nascosto", outcome: "Ti nascondi e osservi la piazza per qualche minuto. Nulla si muove, ma la sensazione di essere osservato persiste." }
            ]
        },
        {
            id: "village_last_message",
            title: "L'Ultimo Messaggio",
            description: "Su un muro sbrecciato, qualcuno ha scritto un breve messaggio con del carbone o vernice sbiadita: un nome, un avvertimento, una preghiera.",
            choices: [
                { text: "Decifrare il messaggio (Adattamento)", skillCheck: { stat: 'adattamento', difficulty: 11 }, successText: "Riesci a leggere: 'Cache sotto il pozzo - Maria'. Trovi anche del carbone utilizzabile.", successReward: { items: [{ itemId: 'charcoal', quantity: 2 }, { itemId: 'map_fragment_local', quantity: 1 }] }, failureText: "Il messaggio è troppo sbiadito per essere letto chiaramente.", actionKey: "decipher_message" },
                { text: "Aggiungere il proprio messaggio", outcome: "Scrivi il tuo nome accanto al messaggio. Forse qualcun altro lo leggerà un giorno.", successReward: { itemId: 'charcoal', quantity: 1 } },
                { text: "Ignorare il graffito", outcome: "Decidi di non perdere tempo con vecchi messaggi. Prosegui la tua esplorazione." }
            ]
        },
        {
            id: "village_rancid_smell",
            title: "Odore di Cibo Rancido",
            description: "Un debole odore di cibo andato a male proviene da una delle abitazioni. Potrebbe esserci qualcosa di commestibile rimasto, o solo parassiti.",
            choices: [
                { text: "Investigare la fonte (Adattamento)", skillCheck: { stat: 'adattamento', difficulty: 12 }, successText: "Tra il cibo marcio trovi alcune conserve ancora sigillate e commestibili.", successReward: { items: [{ itemId: 'canned_food', quantity: 1 }, { itemId: 'ration_pack', quantity: 1 }] }, failureText: "L'odore è nauseante e tutto il cibo è andato a male. Esci tossendo.", isSearchAction: true, actionKey: "investigate_smell" },
                { text: "Evitare la baracca", outcome: "Decidi che l'odore è troppo sospetto. Meglio non rischiare malattie o parassiti." },
                { text: "Attirare creature fuori", outcome: "Fai rumore per attirare eventuali parassiti all'esterno, poi controlli se la via è libera." }
            ]
        },
        {
            id: "village_rusty_tools",
            title: "Strumenti Agricoli Rugginiti",
            description: "Appoggiati a un muro crollato, trovi vecchi attrezzi agricoli: una zappa, una falce, un forcone, tutti consumati dalla ruggine.",
            choices: [
                { text: "Riparare uno strumento (Adattamento)", skillCheck: { stat: 'adattamento', difficulty: 13 }, successText: "Con pazienza, riesci a riparare uno degli attrezzi rendendolo utilizzabile come arma improvvisata.", successReward: { items: [{ itemId: 'farming_tool_repaired', quantity: 1 }, { itemId: 'scrap_metal', quantity: 1 }] }, failureText: "Gli attrezzi sono troppo corrosi per essere riparati. Si sbriciolano al tuo tocco.", actionKey: "repair_tool" },
                { text: "Recuperare il metallo", outcome: "Raccogli i pezzi di metallo meno corrosi. Potrebbero essere utili per altre riparazioni.", successReward: { itemId: 'scrap_metal', quantity: 2 } },
                { text: "Lasciarli lì", outcome: "Gli attrezzi sono troppo rovinati per essere utili. Li lasci dove sono." }
            ]
        },
        {
            id: "village_well",
            title: "Il Pozzo del Villaggio",
            description: "Al centro del villaggio si trova un pozzo di pietra. Sembra profondo, e non sai se l'acqua sul fondo sia potabile o se ci sia ancora acqua.",
            choices: [
                { text: "Calare un secchio (Adattamento)", skillCheck: { stat: 'adattamento', difficulty: 12 }, successText: "Improvvisi un secchio con una corda. L'acqua è torbida ma potabile dopo purificazione.", successReward: { items: [{ itemId: 'water_dirty', quantity: 3 }, { itemId: 'rope', quantity: 1 }] }, failureText: "Non riesci a improvvisare un sistema per attingere acqua. Il pozzo rimane inaccessibile.", actionKey: "improvise_bucket" },
                { text: "Lanciare un sasso", outcome: "Lanci un sasso nel pozzo. Senti un tonfo sordo dopo qualche secondo. C'è acqua, ma è profonda." },
                { text: "Cercare contaminazione (Presagio)", skillCheck: { stat: 'presagio', difficulty: 11 }, successText: "Il tuo istinto ti dice che l'acqua è relativamente sicura. Trovi anche una vecchia corda nascosta.", successReward: { items: [{ itemId: 'rope', quantity: 1 }, { itemId: 'water_purified', quantity: 1 }] }, failureText: "Non riesci a determinare se l'acqua è sicura. Meglio essere cauti.", actionKey: "check_contamination" }
            ]
        },
        {
            id: "village_hanging_clothes",
            title: "Vestiti Stesi",
            description: "Sorprendentemente, su un filo teso tra due pali, ci sono dei vestiti logori stesi ad asciugare. Qualcuno è stato qui di recente, o li ha dimenticati.",
            choices: [
                { text: "Prendere i vestiti", outcome: "Prendi i vestiti dal filo. Sono logori ma potrebbero essere utili per riparazioni o come stracci.", successReward: { itemId: 'cloth_rags', quantity: 3 } },
                { text: "Nascondersi e osservare", outcome: "Ti nascondi e aspetti per vedere se qualcuno torna. Dopo un'ora, nessuno si presenta." },
                { text: "Lasciare un segno", outcome: "Lasci un piccolo oggetto per far capire che sei passato, sperando in un contatto pacifico.", successReward: { itemId: 'map_fragment_local', quantity: 1 } }
            ]
        },
        {
            id: "village_scarecrow",
            title: "Il Guardiano Silenzioso",
            description: "Uno spaventapasseri sbrindellato se ne sta ancora in piedi in quello che un tempo era un orto. I suoi occhi di bottone sembrano seguirti.",
            choices: [
                { text: "Ispezionare lo spaventapasseri (Tracce)", skillCheck: { stat: 'tracce', difficulty: 10 }, successText: "Nascosti nei vestiti dello spaventapasseri trovi piccoli oggetti e materiali utili.", successReward: { items: [{ itemId: 'cloth_rags', quantity: 2 }, { itemId: 'scrap_metal', quantity: 1 }, { type: 'random_common_resource', quantity: 1 }] }, failureText: "Lo spaventapasseri è solo paglia e stracci vecchi. Nulla di utile.", actionKey: "inspect_scarecrow" },
                { text: "Usare come riferimento", outcome: "Segni la posizione dello spaventapasseri sulla tua mappa come punto di riferimento.", successReward: { itemId: 'map_fragment_local', quantity: 1 } },
                { text: "Abbatterlo", outcome: "Abbatti lo spaventapasseri. I suoi materiali potrebbero essere utili.", successReward: { itemId: 'wood_planks', quantity: 1 } }
            ]
        },
        {
            id: "village_echo_laughter",
            title: "Eco di Risate",
            description: "Per un fugace istante, ti sembra di sentire l'eco di risate infantili provenire da una delle case vuote. Un brivido ti corre lungo la schiena.",
            choices: [
                { text: "Investigare la casa (Presagio)", skillCheck: { stat: 'presagio', difficulty: 13 }, successText: "Seguendo l'eco, trovi una stanza nascosta con giocattoli e un piccolo tesoro.", successReward: { items: [{ itemId: 'vitamins', quantity: 1 }, { itemId: 'cloth_rags', quantity: 2 }, { type: 'random_rare_resource', quantity: 1 }] }, failureText: "La casa è vuota e silenziosa. Forse era solo la tua immaginazione.", isSearchAction: true, actionKey: "investigate_laughter" },
                { text: "Gridare per rispondere", outcome: "Gridi verso la casa. Solo il tuo eco risponde, creando un effetto inquietante." },
                { text: "Allontanarsi rapidamente", outcome: "Decidi che alcune cose è meglio lasciarle in pace. Ti allontani rapidamente dal villaggio." }
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
        },
        // ⚠️ EVENTI PROTETTI v0.8.3 - NON MODIFICARE ⚠️
        // I seguenti 45 eventi sono PROTETTI da modifiche future
        // Documentazione completa: doc_e_log/EVENTI_PROTETTI_v0.8.3.md
        // 🔒 INIZIO SEZIONE PROTETTA 🔒
        
        // NUOVI EVENTI CITTÀ
        {
            id: "city_devastated_library",
            title: "Biblioteca Devastata",
            description: "Entri in quella che un tempo era una biblioteca pubblica. Scaffali rovesciati, libri ammuffiti e pagine strappate coprono il pavimento. Forse qualche conoscenza è sopravvissuta.",
            choices: [
                { text: "Cercare libri utili (Adattamento)", skillCheck: { stat: 'adattamento', difficulty: 12 }, successText: "Tra i libri rovinati trovi manuali di sopravvivenza e mappe della zona ancora leggibili.", successReward: { items: [{ itemId: 'lore_fragment_item', quantity: 2 }, { itemId: 'map_fragment_local', quantity: 1 }, { itemId: 'first_aid_kit', quantity: 1 }] }, failureText: "I libri sono troppo danneggiati dall'umidità e dal tempo. Solo carta marcita.", isSearchAction: true, actionKey: "search_books" },
                { text: "Usare come combustibile", outcome: "Raccogli libri secchi per accendere fuochi. La conoscenza brucia, ma il calore è vita.", successReward: { itemId: 'charcoal', quantity: 3 } },
                { text: "Cercare un rifugio", outcome: "Trovi un angolo tranquillo tra gli scaffali per riposare. Il silenzio della biblioteca è quasi pacifico." }
            ]
        },
        {
            id: "city_abandoned_subway",
            title: "La Stazione della Metropolitana Abbandonata",
            description: "Le scale mobili arrugginite conducono verso il basso, nell'oscurità di una stazione della metropolitana. L'aria è viziata e si sentono strani rumori provenire dalle gallerie.",
            choices: [
                { text: "Esplorare i tunnel (Presagio)", skillCheck: { stat: 'presagio', difficulty: 14 }, successText: "Il tuo istinto ti guida attraverso i tunnel sicuri. Trovi un deposito di emergenza intatto.", successReward: { items: [{ itemId: 'ration_pack', quantity: 2 }, { itemId: 'water_bottle', quantity: 2 }, { type: 'random_weapon_item', quantity: 1 }, { itemId: 'first_aid_kit', quantity: 1 }] }, failureText: "I tunnel sono un labirinto pericoloso. Ti perdi e devi tornare indietro rapidamente.", isSearchAction: true, actionKey: "explore_tunnels" },
                { text: "Saccheggiare l'ingresso (Tracce)", skillCheck: { stat: 'tracce', difficulty: 10 }, successText: "Nelle biglietterie e nei negozi dell'atrio trovi oggetti dimenticati e materiali utili.", successReward: { items: [{ itemId: 'scrap_metal', quantity: 2 }, { itemId: 'mechanical_parts', quantity: 1 }, { type: 'random_common_resource', quantity: 2 }] }, failureText: "L'atrio è stato già saccheggiato a fondo. Solo detriti inutili.", isSearchAction: true, actionKey: "loot_entrance" },
                { text: "Sigillare l'ingresso", outcome: "Usi detriti per bloccare l'accesso ai tunnel. Qualunque cosa ci sia laggiù, è meglio che rimanga sepolta." }
            ]
        },
        {
            id: "city_unstable_skyscraper",
            title: "Grattacielo Pericolante",
            description: "Un grattacielo con enormi squarci nella facciata incombe minacciosamente. Sembra possa crollare da un momento all'altro, ma i piani alti potrebbero contenere risorse intatte.",
            choices: [
                { text: "Salire ai piani alti (Agilità)", skillCheck: { stat: 'agilita', difficulty: 15 }, successText: "Con agilità e fortuna, raggiungi i piani superiori. Trovi uffici intatti con provviste e equipaggiamento.", successReward: { items: [{ itemId: 'ration_pack', quantity: 2 }, { itemId: 'water_bottle', quantity: 1 }, { type: 'random_weapon_item', quantity: 1 }, { itemId: 'mechanical_parts', quantity: 2 }] }, failureText: "Una sezione del pavimento cede sotto i tuoi piedi. Scappi a malapena dal crollo parziale.", actionKey: "climb_skyscraper" },
                { text: "Esplorare il piano terra (Tracce)", skillCheck: { stat: 'tracce', difficulty: 11 }, successText: "Nell'atrio e nei negozi del piano terra trovi materiali e oggetti abbandonati.", successReward: { items: [{ itemId: 'scrap_metal', quantity: 3 }, { itemId: 'cloth_rags', quantity: 2 }, { type: 'random_common_resource', quantity: 1 }] }, failureText: "Il piano terra è instabile e pericoloso. Meglio non rischiare.", isSearchAction: true, actionKey: "explore_ground_floor" },
                { text: "Girare al largo", outcome: "Decidi che il grattacielo è troppo pericoloso. Ti allontani rapidamente dalla zona di possibile crollo." }
            ]
        },
        {
            id: "city_ghost_market",
            title: "Il Mercato Nero Fantasma",
            description: "Ti imbatti in una serie di bancarelle improvvisate e ormai deserte, nascoste in un vicolo. Sembra un vecchio mercato nero. Qualcosa di valore potrebbe essere stato dimenticato.",
            choices: [
                { text: "Frugare nelle bancarelle (Tracce)", skillCheck: { stat: 'tracce', difficulty: 12 }, successText: "Tra le bancarelle abbandonate trovi merce nascosta e oggetti di valore.", successReward: { items: [{ type: 'random_weapon_item', quantity: 1 }, { type: 'random_ammo_item', quantity: 1 }, { itemId: 'medicine_crude', quantity: 2 }, { type: 'random_rare_resource', quantity: 1 }] }, failureText: "Le bancarelle sono state svuotate completamente. Solo polvere e ragnatele.", isSearchAction: true, actionKey: "search_stalls" },
                { text: "Investigare i gestori (Presagio)", skillCheck: { stat: 'presagio', difficulty: 13 }, successText: "Trovi indizi sui mercanti e la posizione di una cache segreta.", successReward: { items: [{ itemId: 'lore_fragment_item', quantity: 1 }, { itemId: 'map_fragment_local', quantity: 1 }, { type: 'random_blueprint', quantity: 1 }] }, failureText: "Non riesci a capire chi gestiva il mercato o dove potrebbero aver nascosto la merce.", isSearchAction: true, actionKey: "investigate_merchants" },
                { text: "Usare come nascondiglio", outcome: "Il vicolo nascosto potrebbe essere un buon rifugio temporaneo. Ti riposi tra le bancarelle vuote." }
            ]
        },
        {
            id: "city_military_vehicle",
            title: "Veicolo Militare Abbandonato",
            description: "Un veicolo militare corazzato, forse un carro armato o un trasporto truppe, è bloccato in mezzo alla strada, crivellato di colpi.",
            choices: [
                { text: "Entrare nel veicolo (Potenza)", skillCheck: { stat: 'potenza', difficulty: 13 }, successText: "Forzi l'ingresso del veicolo blindato. All'interno trovi armi militari e equipaggiamento tattico.", successReward: { items: [{ type: 'random_weapon_item', quantity: 1 }, { type: 'random_ammo_item', quantity: 2 }, { itemId: 'body_armor_military', quantity: 1 }] }, failureText: "Il veicolo è sigillato troppo bene. Non riesci a entrare senza attrezzi specializzati.", actionKey: "force_vehicle_entry" },
                { text: "Usare come copertura", outcome: "Il veicolo blindato offre un'eccellente copertura. Ti riposi al sicuro dietro la sua corazza." },
                { text: "Recuperare parti metalliche", outcome: "Stacchi pezzi di blindatura e componenti metallici dal veicolo danneggiato.", successReward: { itemId: 'scrap_metal', quantity: 4 } }
            ]
        },
        {
            id: "city_silent_hospital",
            title: "L'Ospedale Silenzioso",
            description: "Le porte di un grande ospedale cittadino sono divelte. Dentro, il silenzio è rotto solo dal gocciolio dell'acqua e dal vento che sibila tra i corridoi bui.",
            choices: [
                { text: "Cercare nella farmacia (Adattamento)", skillCheck: { stat: 'adattamento', difficulty: 13 }, successText: "Nella farmacia dell'ospedale trovi medicine preziose e forniture mediche.", successReward: { items: [{ itemId: 'antidote', quantity: 2 }, { itemId: 'vitamins', quantity: 2 }, { itemId: 'first_aid_kit', quantity: 1 }, { itemId: 'medicine_crude', quantity: 3 }] }, failureText: "La farmacia è stata saccheggiata o le medicine sono scadute e inutilizzabili.", isSearchAction: true, actionKey: "search_pharmacy" },
                { text: "Esplorare le cucine (Tracce)", skillCheck: { stat: 'tracce', difficulty: 11 }, successText: "Nelle cucine e nei distributori trovi cibo in scatola e acqua ancora potabile.", successReward: { items: [{ itemId: 'canned_food', quantity: 2 }, { itemId: 'water_bottle', quantity: 2 }, { itemId: 'ration_pack', quantity: 1 }] }, failureText: "Le cucine sono vuote e i distributori sono stati svuotati.", isSearchAction: true, actionKey: "explore_kitchens" },
                { text: "Evitare l'ospedale", outcome: "Decidi che gli ospedali abbandonati sono troppo pericolosi. Malattie, gas tossici, o peggio potrebbero annidarsi dentro." }
            ]
        },
        {
            id: "city_propaganda_posters",
            title: "Manifesti di Propaganda Strappati",
            description: "Sui muri scrostati, resti di vecchi manifesti di propaganda promettono un futuro radioso che non è mai arrivato, o minacciano nemici ormai dimenticati.",
            choices: [
                { text: "Studiare i manifesti (Presagio)", skillCheck: { stat: 'presagio', difficulty: 11 }, successText: "I manifesti rivelano informazioni sul passato e indizi su depositi governativi nascosti.", successReward: { items: [{ itemId: 'lore_fragment_item', quantity: 2 }, { itemId: 'map_fragment_local', quantity: 1 }] }, failureText: "I manifesti sono troppo danneggiati per essere compresi. Solo propaganda senza senso.", actionKey: "study_posters" },
                { text: "Strapparli via", outcome: "Strappi via i manifesti in un gesto di sfida contro il passato. Un piccolo atto di ribellione." },
                { text: "Usare come combustibile", outcome: "La carta dei manifesti può essere utile per accendere fuochi.", successReward: { itemId: 'charcoal', quantity: 2 } }
            ]
        },
        {
            id: "city_overgrown_park",
            title: "Il Parco Cittadino Invaso dalla Natura",
            description: "Un tempo un parco curato, ora è una giungla selvaggia dove la natura si è ripresa i suoi spazi tra statue incrinate e panchine arrugginite.",
            choices: [
                { text: "Cercare piante medicinali (Adattamento)", skillCheck: { stat: 'adattamento', difficulty: 12 }, successText: "Tra la vegetazione selvaggia trovi piante con proprietà curative e bacche commestibili.", successReward: { items: [{ itemId: 'medicine_crude', quantity: 2 }, { itemId: 'berries', quantity: 3 }, { itemId: 'vitamins', quantity: 1 }] }, failureText: "Non riesci a distinguere le piante utili da quelle velenose. Meglio non rischiare.", actionKey: "search_medicinal_plants" },
                { text: "Cacciare piccola selvaggina (Tracce)", skillCheck: { stat: 'tracce', difficulty: 13 }, successText: "Riesci a catturare piccoli animali che si sono adattati all'ambiente urbano.", successReward: { items: [{ itemId: 'meat_raw', quantity: 2 }, { itemId: 'cloth_rags', quantity: 1 }] }, failureText: "Gli animali sono troppo veloci o diffidenti. Non riesci a catturare nulla.", isSearchAction: true, actionKey: "hunt_small_game" },
                { text: "Trovare un rifugio", outcome: "Tra la vegetazione fitta trovi un luogo appartato e sicuro per riposare." }
            ]
        },
        {
            id: "city_sewer_sounds",
            title: "Suoni dalla Fognatura",
            description: "Da un tombino aperto o una grata rotta provengono suoni inquietanti: raschiare, grugniti, o forse voci distorte.",
            choices: [
                { text: "Investigare i suoni (Presagio)", skillCheck: { stat: 'presagio', difficulty: 14 }, successText: "Il tuo istinto ti guida verso una scoperta inquietante ma redditizia nelle fogne.", successReward: { items: [{ type: 'random_rare_resource', quantity: 1 }, { itemId: 'mechanical_parts', quantity: 2 }, { type: 'random_weapon_item', quantity: 1 }] }, failureText: "I suoni diventano più minacciosi. Ti allontani rapidamente, sentendoti osservato dal basso.", actionKey: "investigate_sewer_sounds" },
                { text: "Sigillare l'apertura", outcome: "Usi detriti pesanti per sigillare il tombino. Qualunque cosa ci sia sotto, è meglio che rimanga lì." },
                { text: "Allontanarsi rapidamente", outcome: "Decidi che alcuni misteri è meglio lasciarli irrisolti. Ti allontani velocemente dalla zona." }
            ]
        },
        {
            id: "city_intact_apartment",
            title: "L'Appartamento Intatto",
            description: "Incredibilmente, trovi un appartamento in un palazzo diroccato che sembra quasi intatto, come se i suoi occupanti fossero appena usciti. Polvere ovunque, ma mobili e oggetti personali sono al loro posto.",
            choices: [
                { text: "Saccheggiare con cura (Tracce)", skillCheck: { stat: 'tracce', difficulty: 10 }, successText: "Esplori l'appartamento con rispetto, trovando provviste, vestiti e oggetti utili.", successReward: { items: [{ itemId: 'canned_food', quantity: 2 }, { itemId: 'water_bottle', quantity: 1 }, { type: 'random_clothing_item', quantity: 2 }, { itemId: 'first_aid_kit', quantity: 1 }] }, failureText: "L'appartamento sembra intatto ma è stato già svuotato di tutto il necessario.", isSearchAction: true, actionKey: "carefully_loot_apartment" },
                { text: "Cercare un diario (Presagio)", skillCheck: { stat: 'presagio', difficulty: 12 }, successText: "Trovi un diario che rivela informazioni preziose sui giorni finali e nascondigli segreti.", successReward: { items: [{ itemId: 'lore_fragment_item', quantity: 2 }, { itemId: 'map_fragment_local', quantity: 1 }] }, failureText: "Non trovi tracce scritte della vita degli ex-occupanti. Il loro destino rimane un mistero.", isSearchAction: true, actionKey: "search_diary" },
                { text: "Usare come rifugio", outcome: "L'appartamento intatto offre un rifugio sicuro e confortevole per la notte. Un lusso raro in questi tempi." }
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

    // --- NUOVE RISORSE AGGIUNTE ---
    'raw_hide': {
        id: 'raw_hide',
        name: 'Pelle Animale Grezza',
        description: "Recuperata da una carcassa. Necessita di essere conciata per diventare cuoio utilizzabile.",
        type: 'resource',
        weight: 1.2,
        value: 8,
        stackable: true
    },
    'burnt_electronics': {
        id: 'burnt_electronics',
        name: 'Componenti Elettronici Bruciacchiati',
        description: "Chip, resistenze e cavi recuperati da apparecchiature distrutte. Alcuni potrebbero essere ancora funzionanti per riparazioni semplici.",
        type: 'resource',
        weight: 0.2,
        value: 12,
        stackable: true
    },
    'thick_glass_shards': {
        id: 'thick_glass_shards',
        name: 'Frammenti di Vetro Spesso',
        description: "Utili per creare lame improvvisate o punte di freccia, se lavorati con cura.",
        type: 'resource',
        weight: 0.3,
        value: 5,
        stackable: true
    },
    'sticky_plant_resin': {
        id: 'sticky_plant_resin',
        name: 'Resina Vegetale Appiccicosa',
        description: "Secreta da alcuni alberi mutati. Può essere usata come adesivo o impermeabilizzante grezzo.",
        type: 'resource',
        weight: 0.1,
        value: 6,
        stackable: true
    },
    'small_sharp_bones': {
        id: 'small_sharp_bones',
        name: 'Ossa Piccole e Affilate',
        description: "Di roditori o uccelli. Possono essere usate come aghi, punte o piccoli utensili.",
        type: 'resource',
        weight: 0.05,
        value: 3,
        stackable: true
    },
    'dead_battery': {
        id: 'dead_battery',
        name: 'Batteria Esausta (Recuperabile?)',
        description: "Una vecchia batteria. Forse contiene ancora qualche acido o metallo utile, o potrebbe essere ricaricata con mezzi estremi.",
        type: 'resource',
        weight: 0.8,
        value: 10,
        stackable: true
    },
    'woven_plant_fibers': {
        id: 'woven_plant_fibers',
        name: 'Fibre Vegetali Intrecciate',
        description: "Liane o cortecce robuste, utili per creare corde o legacci.",
        type: 'resource',
        weight: 0.2,
        value: 4,
        stackable: true
    },
    'crude_gunpowder': {
        id: 'crude_gunpowder',
        name: 'Polvere da Sparo Grezza (Instabile)',
        description: "Un miscuglio di carbone, zolfo e salnitro trovato in un contenitore. Molto pericolosa da maneggiare.",
        type: 'resource',
        weight: 0.1,
        value: 25,
        stackable: true
    },
    'torn_insulation': {
        id: 'torn_insulation',
        name: 'Isolante Termico Strappato',
        description: "Pezzi di materiale isolante da vecchi edifici o veicoli. Utile per migliorare abiti o rifugi contro il freddo.",
        type: 'resource',
        weight: 0.3,
        value: 7,
        stackable: true
    },
    'raw_metal_ore': {
        id: 'raw_metal_ore',
        name: 'Minerale Metallifero Grezzo',
        description: "Una pietra con venature metalliche. Richiede fusione per estrarre il metallo.",
        type: 'resource',
        weight: 2.0,
        value: 15,
        stackable: true
    },
    'short_braided_rope': {
        id: 'short_braided_rope',
        name: 'Corda Intrecciata (Corta)',
        description: "Pochi metri di corda robusta, utile per vari scopi.",
        type: 'resource',
        weight: 0.2,
        value: 5,
        stackable: true
    },

    // --- CIBO ---
    'canned_food': {
        id: 'canned_food',
        name: 'Cibo in Scatola Generico',
        nameShort: 'Lattina Cibo',
        description: 'Una lattina senza etichetta. Chissà cosa contiene, ma sembra commestibile.',
        type: 'food',
        usable: true,
        weight: 0.4,
        value: 8,
        stackable: true, // Rimane stackabile se sono lattine diverse, ma ogni lattina avrà le sue porzioni
        max_portions: 2,
        effects: [{ type: 'add_resource', resource_type: 'food', amount: 3 }] // +3 per porzione
    },
    'ration_pack': {
        id: 'ration_pack',
        name: 'Razione K da Campo',
        nameShort: 'Razione K',
        description: 'Razione militare compatta, progettata per fornire sostentamento in condizioni difficili.',
        type: 'food',
        usable: true,
        weight: 0.5,
        value: 15,
        stackable: true,
        max_portions: 3,
        effects: [{ type: 'add_resource', resource_type: 'food', amount: 4 }] // +4 per porzione
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
        effects: [{ type: 'add_resource_poisonable', resource_type: 'food', amount: 2, poison_chance: 0.10 }] // MODIFICATO: amount da 1 a 2, poison_chance da 0.05 a 0.10
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
        nameShort: 'Carne Cotta',
        description: 'Un pezzo di carne arrostita su un fuoco improvvisato. Meglio della carne cruda.',
        type: 'food',
        usable: true,
        weight: 0.3,
        value: 10,
        stackable: true, // Pezzi diversi di carne cotta possono stackare
        max_portions: 2, // Assumiamo che un "pezzo" possa essere mangiato in due volte
        effects: [
            { type: 'add_resource', resource_type: 'food', amount: 4 }, // +4 cibo per porzione
            { type: 'add_resource', resource_type: 'hp', amount: 1 }     // +1 HP per porzione
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
        nameShort: 'Fagioli Lattina',
        description: 'Una lattina di fagioli. Un classico della sopravvivenza.',
        type: 'food',
        usable: true,
        weight: 0.4,
        value: 7,
        stackable: true,
        max_portions: 2,
        effects: [{ type: 'add_resource', resource_type: 'food', amount: 3 }] // +3 per porzione
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
        nameShort: 'MRE',
        description: "Pasto completo, sigillato. Pesante ma saziante.",
        type: 'food',
        usable: true,
        weight: 1.0,
        value: 25,
        stackable: false, // Generalmente un MRE è un'unità singola grande
        max_portions: 4,
        effects: [
            { type: 'add_resource', resource_type: 'food', amount: 5 }, // +5 cibo per porzione
            { type: 'add_resource', resource_type: 'hp', amount: 2 }     // +2 HP per porzione
        ]
    },
    'mystery_meat_cooked': {
        id: 'mystery_meat_cooked',
        name: 'Carne Misteriosa Cotta',
        nameShort: 'Carne Cotta?',
        description: "Carne di dubbia provenienza, cotta alla bell'e meglio. Speriamo bene.",
        type: 'food',
        usable: true,
        weight: 0.3,
        value: 5,
        stackable: true,
        max_portions: 2,
        effects: [{ type: 'add_resource_sickness', resource_type: 'food', amount: 3, sickness_chance: 0.10 }] // +3 per porzione
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

    // --- NUOVI CIBI AGGIUNTI ---
    'military_energy_bar_old': {
        id: 'military_energy_bar_old',
        name: 'Barretta Energetica Militare (Vecchia)',
        description: "Sigillata ermeticamente, probabilmente scaduta da anni, ma ancora sorprendentemente calorica. Potrebbe dare un piccolo boost temporaneo o mal di stomaco.",
        type: 'food',
        usable: true,
        weight: 0.3,
        value: 12,
        effects: [
            { type: 'add_resource', resource_type: 'food', amount: 6 },
            { type: 'add_resource_sickness', resource_type: 'hp', amount: 3, sickness_chance: 0.25 }
        ]
    },
    'dried_larvae': {
        id: 'dried_larvae',
        name: 'Larve Essiccate',
        description: "Croccanti e ricche di proteine. Un cibo da sopravvivenza comune per chi sa dove cercare. Disgustose ma nutrienti.",
        type: 'food',
        usable: true,
        weight: 0.1,
        value: 8,
        effects: [{ type: 'add_resource', resource_type: 'food', amount: 5 }]
    },
    'bitter_root_toasted': {
        id: 'bitter_root_toasted',
        name: 'Radice Amara Tostata',
        description: "Una radice fibrosa che, una volta tostata, diventa commestibile e leggermente nutriente. Sapore terribile.",
        type: 'food',
        usable: true,
        weight: 0.2,
        value: 4,
        effects: [{ type: 'add_resource', resource_type: 'food', amount: 3 }]
    },
    'contaminated_wild_honey': {
        id: 'contaminated_wild_honey',
        name: 'Miele Selvatico Contaminato',
        description: "Trovato in un alveare abbandonato. Dolce, ma con una strana luminescenza. Potrebbe avere effetti imprevisti.",
        type: 'food',
        usable: true,
        weight: 0.2,
        value: 15,
        effects: [
            { type: 'add_resource', resource_type: 'food', amount: 4 },
            { type: 'add_resource_sickness', resource_type: 'hp', amount: 5, sickness_chance: 0.30 }
        ]
    },
    'mystery_meat_can': {
        id: 'mystery_meat_can',
        name: 'Scatoletta di "Carne Misteriosa"',
        description: "Etichetta illeggibile. L'odore è... indefinibile. Mangiarla è un atto di fede o disperazione.",
        type: 'food',
        usable: true,
        weight: 0.4,
        value: 6,
        effects: [{ type: 'add_resource_sickness', resource_type: 'food', amount: 4, sickness_chance: 0.40 }]
    },
    'moldy_bread_recovered': {
        id: 'moldy_bread_recovered',
        name: 'Pane Muffo (Parzialmente Recuperato)',
        description: "Alcune parti sono ancora commestibili se si raschia via la muffa con attenzione. Non il massimo, ma meglio di niente.",
        type: 'food',
        usable: true,
        weight: 0.3,
        value: 3,
        effects: [{ type: 'add_resource_sickness', resource_type: 'food', amount: 2, sickness_chance: 0.15 }]
    },
    'giant_reptile_eggs': {
        id: 'giant_reptile_eggs',
        name: 'Uova di Rettile/Insetto Gigante',
        description: "Grosse e coriacee. Se cotte, possono essere una buona fonte di proteine. Crude, sono un rischio.",
        type: 'food',
        usable: true,
        weight: 0.8,
        value: 10,
        effects: [{ type: 'add_resource_sickness', resource_type: 'food', amount: 6, sickness_chance: 0.35 }]
    },
    'pale_cave_mushroom': {
        id: 'pale_cave_mushroom',
        name: 'Fungo Pallido della Caverna',
        description: "Trovato in luoghi umidi e bui. Alcuni sono commestibili, altri letali. Questo sembra... neutro?",
        type: 'food',
        usable: true,
        weight: 0.1,
        value: 5,
        effects: [{ type: 'add_resource_sickness', resource_type: 'food', amount: 3, sickness_chance: 0.20 }]
    },
    'prewar_dry_biscuits': {
        id: 'prewar_dry_biscuits',
        name: 'Biscotti Secchi dell\'Anteguerra',
        description: "Incredibilmente conservati in una scatola di latta. Duri come sassi, ma un vago sapore di normalità.",
        type: 'food',
        usable: true,
        weight: 0.4,
        value: 14,
        effects: [
            { type: 'add_resource', resource_type: 'food', amount: 5 },
            { type: 'add_resource', resource_type: 'hp', amount: 1 }
        ]
    },
    'melted_animal_fat': {
        id: 'melted_animal_fat',
        name: 'Grasso Animale Fuso',
        description: "Recuperato da una carcassa e fuso. Può essere mangiato per calorie o usato per altri scopi (es. impermeabilizzare, combustibile).",
        type: 'food',
        usable: true,
        weight: 0.3,
        value: 7,
        effects: [{ type: 'add_resource', resource_type: 'food', amount: 4 }]
    },

    // --- ACQUA E BEVANDE ---
    'water_bottle': {
        id: 'water_bottle',
        name: 'Bottiglia d\'Acqua Grande',
        nameShort: 'Bott. Acqua G.',
        description: 'Una bottiglia di plastica riutilizzabile, piena d\'acqua. Sembra potabile.',
        type: 'water',
        usable: true,
        weight: 1.5, // Pesa di più se è grande
        value: 12,
        stackable: false, // Ogni bottiglia grande è un item a sé
        max_portions: 4,
        effects: [{ type: 'add_resource', resource_type: 'water', amount: 2 }] // +2 per porzione
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
        effects: [{ type: 'add_resource_sickness', resource_type: 'water', amount: 3, sickness_chance: 0.45 }] // MODIFICATO: sickness_chance da DIRTY_WATER_POISON_CHANCE (0.70) a 0.45. La costante DIRTY_WATER_POISON_CHANCE verrà modificata in game_constants.js
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
        stackable: true,
        max_portions: 2,
        effects: [{ type: 'add_resource', resource_type: 'water', amount: 2 }] // +2 per porzione
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
        nameShort: 'Acqua Piovana',
        description: 'Acqua raccolta in un contenitore di fortuna. Non il massimo, ma disseta.',
        type: 'water',
        usable: true,
        weight: 0.5, // Assumiamo una piccola quantità
        value: 3,
        stackable: true, // Diverse "raccolte" possono stackare
        max_portions: 2,
        effects: [{ type: 'add_resource_sickness', resource_type: 'water', amount: 2, sickness_chance: 0.05 }] // +2 per porzione, piccolo rischio
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

    // --- NUOVE BEVANDE AGGIUNTE ---
    'condensed_water_tarps': {
        id: 'condensed_water_tarps',
        name: 'Condensa Raccolta da Teli',
        description: "Acqua distillata goccia a goccia. Poca, ma pura.",
        type: 'water',
        usable: true,
        weight: 0.2,
        value: 12,
        effects: [{ type: 'add_resource', resource_type: 'water', amount: 2 }]
    },
    'mutated_cactus_juice': {
        id: 'mutated_cactus_juice',
        name: 'Succo di Cactus Mutato',
        description: "Denso e leggermente acido. Dissetante, ma potrebbe avere lievi effetti allucinogeni.",
        type: 'water',
        usable: true,
        weight: 0.3,
        value: 8,
        effects: [
            { type: 'add_resource', resource_type: 'water', amount: 4 },
            { type: 'add_resource_sickness', resource_type: 'hp', amount: 2, sickness_chance: 0.20 }
        ]
    },
    'root_broth_hot': {
        id: 'root_broth_hot',
        name: 'Brodo Caldo di Radici',
        description: "Acqua bollita con radici non identificate. Tiepido e un po' terroso, ma idratante.",
        type: 'water',
        usable: true,
        weight: 0.4,
        value: 6,
        effects: [
            { type: 'add_resource', resource_type: 'water', amount: 3 },
            { type: 'add_resource', resource_type: 'hp', amount: 1 }
        ]
    },
    'fermented_berry_wine': {
        id: 'fermented_berry_wine',
        name: '"Vino" di Bacche Fermentate',
        description: "Una bevanda alcolica grezza e probabilmente molto forte, fatta fermentare in un contenitore di fortuna. Disseta poco, ma può dare coraggio (o mal di testa).",
        type: 'water',
        usable: true,
        weight: 0.5,
        value: 10,
        effects: [
            { type: 'add_resource', resource_type: 'water', amount: 2 },
            { type: 'add_resource_sickness', resource_type: 'hp', amount: 3, sickness_chance: 0.25 }
        ]
    },
    'improvised_water_filter': {
        id: 'improvised_water_filter',
        name: 'Filtro d\'Acqua Improvvisato (Monouso)',
        description: "Un tubo riempito di stracci, sabbia e carbone. Può purificare una piccola quantità d'acqua sporca una sola volta.",
        type: 'water',
        usable: true,
        weight: 0.6,
        value: 15,
        effects: [{ type: 'convert_item', from_item: 'water_dirty', to_item: 'water_purified_small', conversion_ratio: 1 }]
    },
    'contaminated_melted_snow': {
        id: 'contaminated_melted_snow',
        name: 'Neve Sciolta (Contaminata)',
        description: "Se trovata in zone fredde. Va bollita per sicurezza, potrebbe contenere particolato radioattivo.",
        type: 'water',
        usable: true,
        weight: 0.8,
        value: 4,
        effects: [{ type: 'add_resource_sickness', resource_type: 'water', amount: 3, sickness_chance: 0.30 }]
    },
    'diy_electrolyte_drink': {
        id: 'diy_electrolyte_drink',
        name: 'Bevanda Elettrolitica Fai-da-Te',
        description: "Acqua, un pizzico di sale (se trovato) e succo di bacche. Aiuta contro la disidratazione.",
        type: 'water',
        usable: true,
        weight: 0.3,
        value: 9,
        effects: [
            { type: 'add_resource', resource_type: 'water', amount: 4 },
            { type: 'add_resource', resource_type: 'hp', amount: 2 }
        ]
    },
    'radioactive_ice_melted': {
        id: 'radioactive_ice_melted',
        name: 'Ghiacciolo Radioattivo (Sciolto)',
        description: "Trovato in un vecchio freezer. L'acqua sciolta ha un vago bagliore. Disseta, ma a quale prezzo?",
        type: 'water',
        usable: true,
        weight: 0.4,
        value: 3,
        effects: [
            { type: 'add_resource', resource_type: 'water', amount: 3 },
            { type: 'add_resource_sickness', resource_type: 'hp', amount: 8, sickness_chance: 0.50 }
        ]
    },
    'filtered_animal_blood': {
        id: 'filtered_animal_blood',
        name: 'Sangue Animale (Filtrato)',
        description: "Disperato. Può idratare, ma c'è un alto rischio di malattie se non trattato.",
        type: 'water',
        usable: true,
        weight: 0.5,
        value: 2,
        effects: [{ type: 'add_resource_sickness', resource_type: 'water', amount: 2, sickness_chance: 0.60 }]
    },
    'pine_needle_tea': {
        id: 'pine_needle_tea',
        name: 'Tè di Aghi di Pino',
        description: "Un infuso amarognolo, ricco di alcune vitamine. Un antico rimedio.",
        type: 'water',
        usable: true,
        weight: 0.2,
        value: 7,
        effects: [
            { type: 'add_resource', resource_type: 'water', amount: 2 },
            { type: 'add_resource', resource_type: 'hp', amount: 2 }
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

    // --- NUOVI BLUEPRINT AGGIUNTI ---
    'blueprint_disinfectant_paste': {
        id: 'blueprint_disinfectant_paste',
        name: 'Progetto: Pasta Disinfettante',
        nameShort: 'Prog: Disinfett.',
        description: 'Istruzioni per creare una pasta disinfettante grezza usando cenere, grasso e resina vegetale.',
        type: 'blueprint',
        usable: true,
        weight: 0.05,
        value: 20,
        stackable: false,
        effects: [{ type: 'learn_recipe', recipeKey: 'craft_disinfectant_paste' }]
    },
    'blueprint_makeshift_splint': {
        id: 'blueprint_makeshift_splint',
        name: 'Progetto: Stecca Improvvisata',
        nameShort: 'Prog: Stecca',
        description: 'Come immobilizzare arti feriti usando bastoncini di legno e stracci.',
        type: 'blueprint',
        usable: true,
        weight: 0.05,
        value: 15,
        stackable: false,
        effects: [{ type: 'learn_recipe', recipeKey: 'craft_makeshift_splint' }]
    },
    'blueprint_honey_bandage': {
        id: 'blueprint_honey_bandage',
        name: 'Progetto: Benda al Miele',
        nameShort: 'Prog: Benda Miele',
        description: 'Tecnica per imbevere bende con miele per accelerare la guarigione.',
        type: 'blueprint',
        usable: true,
        weight: 0.05,
        value: 18,
        stackable: false,
        effects: [{ type: 'learn_recipe', recipeKey: 'craft_honey_bandage' }]
    },
    'blueprint_fishing_rod': {
        id: 'blueprint_fishing_rod',
        name: 'Progetto: Canna da Pesca',
        nameShort: 'Prog: Canna Pesca',
        description: 'Istruzioni per costruire una canna da pesca improvvisata con materiali di recupero.',
        type: 'blueprint',
        usable: true,
        weight: 0.05,
        value: 12,
        stackable: false,
        effects: [{ type: 'learn_recipe', recipeKey: 'craft_fishing_rod' }]
    },
    'blueprint_animal_trap': {
        id: 'blueprint_animal_trap',
        name: 'Progetto: Trappola Animali',
        nameShort: 'Prog: Trappola',
        description: 'Come costruire una trappola semplice per catturare piccoli animali.',
        type: 'blueprint',
        usable: true,
        weight: 0.05,
        value: 18,
        stackable: false,
        effects: [{ type: 'learn_recipe', recipeKey: 'craft_animal_trap' }]
    },
    'blueprint_fire_starter': {
        id: 'blueprint_fire_starter',
        name: 'Progetto: Acciarino',
        nameShort: 'Prog: Acciarino',
        description: 'Tecniche primitive per creare strumenti per accendere fuochi.',
        type: 'blueprint',
        usable: true,
        weight: 0.05,
        value: 15,
        stackable: false,
        effects: [{ type: 'learn_recipe', recipeKey: 'craft_fire_starter' }]
    },
    'blueprint_signal_mirror': {
        id: 'blueprint_signal_mirror',
        name: 'Progetto: Specchio Segnalazione',
        nameShort: 'Prog: Specchio',
        description: 'Come levigare e montare frammenti di vetro per segnalazioni a distanza.',
        type: 'blueprint',
        usable: true,
        weight: 0.05,
        value: 10,
        stackable: false,
        effects: [{ type: 'learn_recipe', recipeKey: 'craft_signal_mirror' }]
    },
    'blueprint_climbing_rope': {
        id: 'blueprint_climbing_rope',
        name: 'Progetto: Corda Arrampicata',
        nameShort: 'Prog: Corda',
        description: 'Tecniche per intrecciare fibre vegetali e creare corde resistenti.',
        type: 'blueprint',
        usable: true,
        weight: 0.05,
        value: 14,
        stackable: false,
        effects: [{ type: 'learn_recipe', recipeKey: 'craft_climbing_rope' }]
    },
    'blueprint_sewing_kit': {
        id: 'blueprint_sewing_kit',
        name: 'Progetto: Kit Cucito',
        nameShort: 'Prog: Cucito',
        description: 'Come creare aghi da ossa affilate e filo da fibre vegetali.',
        type: 'blueprint',
        usable: true,
        weight: 0.05,
        value: 12,
        stackable: false,
        effects: [{ type: 'learn_recipe', recipeKey: 'craft_sewing_kit' }]
    },
    'blueprint_water_filter': {
        id: 'blueprint_water_filter',
        name: 'Progetto: Filtro Acqua',
        nameShort: 'Prog: Filtro',
        description: 'Sistema di filtrazione improvvisato usando contenitori, carbone e stracci.',
        type: 'blueprint',
        usable: true,
        weight: 0.05,
        value: 15,
        stackable: false,
        effects: [{ type: 'learn_recipe', recipeKey: 'craft_water_filter' }]
    },
    'blueprint_electrolyte_drink': {
        id: 'blueprint_electrolyte_drink',
        name: 'Progetto: Bevanda Elettrolitica',
        nameShort: 'Prog: Elettroliti',
        description: 'Ricetta per una bevanda idratante fai-da-te con acqua e bacche.',
        type: 'blueprint',
        usable: true,
        weight: 0.05,
        value: 9,
        stackable: false,
        effects: [{ type: 'learn_recipe', recipeKey: 'craft_electrolyte_drink' }]
    },
    'blueprint_pine_needle_tea': {
        id: 'blueprint_pine_needle_tea',
        name: 'Progetto: Tè Aghi di Pino',
        nameShort: 'Prog: Tè Pino',
        description: 'Antico rimedio: come preparare un infuso ricco di vitamine con aghi di pino.',
        type: 'blueprint',
        usable: true,
        weight: 0.05,
        value: 7,
        stackable: false,
        effects: [{ type: 'learn_recipe', recipeKey: 'craft_pine_needle_tea' }]
    },
    'blueprint_tourniquet': {
        id: 'blueprint_tourniquet',
        name: 'Progetto: Laccio Emostatico',
        nameShort: 'Prog: Laccio',
        description: 'Tecniche di primo soccorso per creare un laccio emostatico d\'emergenza.',
        type: 'blueprint',
        usable: true,
        weight: 0.05,
        value: 20,
        stackable: false,
        effects: [{ type: 'learn_recipe', recipeKey: 'craft_tourniquet' }]
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
        effects: [{ type: 'cure_status', status_cured: 'isSick', chance: 0.6, heal_hp_on_success: 5 }] // MODIFICATO: chance da 0.5 a 0.6
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

    // --- NUOVE MEDICINE AGGIUNTE ---
    'crude_disinfectant_paste': {
        id: 'crude_disinfectant_paste',
        name: 'Pasta Disinfettante Grezza',
        description: "Un miscuglio di cenere di legno, grasso e linfa vegetale. Applicata sulle ferite, può aiutare a prevenire infezioni minori.",
        type: 'medicine',
        usable: true,
        weight: 0.2,
        value: 8,
        effects: [{ type: 'cure_status', status_cured: 'isInjured', chance: 0.4, heal_hp_on_success: 6 }]
    },
    'chewed_willow_leaves': {
        id: 'chewed_willow_leaves',
        name: 'Foglie di Salice Masticate',
        description: "Antico rimedio per il dolore e la febbre lieve.",
        type: 'medicine',
        usable: true,
        weight: 0.05,
        value: 5,
        effects: [
            { type: 'add_resource', resource_type: 'hp', amount: 3 },
            { type: 'cure_status', status_cured: 'isSick', chance: 0.3, heal_hp_on_success: 2 }
        ]
    },
    'charcoal_powder_medical': {
        id: 'charcoal_powder_medical',
        name: 'Polvere di Carbone (Uso Medico)',
        description: "Carbone finemente polverizzato. Può assorbire alcune tossine se ingerito, ma il sapore è orribile.",
        type: 'medicine',
        usable: true,
        weight: 0.1,
        value: 6,
        effects: [{ type: 'cure_status', status_cured: 'isPoisoned', chance: 0.4, heal_hp_on_success: 3 }]
    },
    'fermented_plant_extract': {
        id: 'fermented_plant_extract',
        name: 'Estratto di Piante Fermentate',
        description: "Un liquido scuro e denso ottenuto dalla fermentazione di erbe. Potrebbe avere proprietà antibiotiche... o essere tossico.",
        type: 'medicine',
        usable: true,
        weight: 0.2,
        value: 12,
        effects: [
            { type: 'cure_status', status_cured: 'isSick', chance: 0.6, heal_hp_on_success: 8 },
            { type: 'add_resource_sickness', resource_type: 'hp', amount: 4, sickness_chance: 0.25 }
        ]
    },
    'makeshift_splint': {
        id: 'makeshift_splint',
        name: 'Stecca Improvvisata',
        description: "Bastoncini di legno e stracci legati insieme. Utile per immobilizzare arti feriti.",
        type: 'medicine',
        usable: true,
        weight: 0.4,
        value: 10,
        effects: [{ type: 'cure_status', status_cured: 'isInjured', chance: 0.5, heal_hp_on_success: 8 }]
    },
    'alcohol_disinfectant': {
        id: 'alcohol_disinfectant',
        name: 'Alcol Disinfettante (Improvvisato)',
        description: "Liquore ad alta gradazione o alcol industriale diluito. Brucia, ma disinfetta.",
        type: 'medicine',
        usable: true,
        weight: 0.3,
        value: 15,
        effects: [{ type: 'cure_status', status_cured: 'isInjured', chance: 0.7, heal_hp_on_success: 5 }]
    },
    'herbal_tea_medicinal': {
        id: 'herbal_tea_medicinal',
        name: 'Tisana Medicinale',
        description: "Un infuso di erbe selezionate per le loro proprietà curative. Calmante e leggermente curativo.",
        type: 'medicine',
        usable: true,
        weight: 0.1,
        value: 9,
        effects: [
            { type: 'add_resource', resource_type: 'hp', amount: 5 },
            { type: 'cure_status', status_cured: 'isSick', chance: 0.4, heal_hp_on_success: 3 }
        ]
    },
    'honey_bandage': {
        id: 'honey_bandage',
        name: 'Benda al Miele',
        description: "Benda imbevuta di miele. Le proprietà antibatteriche del miele possono accelerare la guarigione.",
        type: 'medicine',
        usable: true,
        weight: 0.2,
        value: 18,
        effects: [{ type: 'cure_status', status_cured: 'isInjured', chance: 0.8, heal_hp_on_success: 12 }]
    },
    'mushroom_extract_questionable': {
        id: 'mushroom_extract_questionable',
        name: 'Estratto di Funghi (Dubbioso)',
        description: "Un liquido estratto da funghi non identificati. Potrebbe avere proprietà curative... o allucinogene.",
        type: 'medicine',
        usable: true,
        weight: 0.1,
        value: 8,
        effects: [
            { type: 'add_resource', resource_type: 'hp', amount: 6 },
            { type: 'add_resource_sickness', resource_type: 'hp', amount: 8, sickness_chance: 0.35 }
        ]
    },
    'emergency_tourniquet': {
        id: 'emergency_tourniquet',
        name: 'Laccio Emostatico d\'Emergenza',
        description: "Una striscia di tessuto resistente per fermare emorragie gravi. Uso singolo, ma può salvare la vita.",
        type: 'medicine',
        usable: true,
        weight: 0.1,
        value: 20,
        effects: [{ type: 'cure_status', status_cured: 'isInjured', chance: 0.9, heal_hp_on_success: 15 }]
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

    // --- NUOVI STRUMENTI AGGIUNTI ---
    'improvised_fishing_rod': {
        id: 'improvised_fishing_rod',
        name: 'Canna da Pesca Improvvisata',
        description: "Un bastone, un filo e un amo di fortuna. Potrebbe funzionare per pescare in acque calme.",
        type: 'tool',
        usable: true,
        weight: 0.8,
        value: 12,
        charges: 5,
        effects: [{ type: 'fishing_attempt', success_chance: 0.3, fish_types: ['small_fish', 'contaminated_fish'] }]
    },
    'animal_trap_simple': {
        id: 'animal_trap_simple',
        name: 'Trappola per Animali Semplice',
        description: "Una trappola rudimentale fatta con fili metallici e legno. Può catturare piccoli animali se piazzata correttamente.",
        type: 'tool',
        usable: true,
        weight: 1.2,
        value: 18,
        charges: 3,
        effects: [{ type: 'set_trap', trap_type: 'small_animal', success_chance: 0.4 }]
    },
    'fire_starter_flint': {
        id: 'fire_starter_flint',
        name: 'Acciarino e Pietra Focaia',
        description: "Strumenti primitivi ma affidabili per accendere fuochi. Essenziali per la sopravvivenza.",
        type: 'tool',
        usable: true,
        weight: 0.2,
        value: 15,
        charges: 10,
        effects: [{ type: 'start_fire', success_chance: 0.8 }]
    },
    'water_collection_tarp': {
        id: 'water_collection_tarp',
        name: 'Telo per Raccolta Acqua',
        description: "Un telo impermeabile che può essere usato per raccogliere acqua piovana o rugiada.",
        type: 'tool',
        usable: true,
        weight: 0.6,
        value: 10,
        charges: 8,
        effects: [{ type: 'collect_water', water_type: 'rainwater_collected', amount_range: [1, 3] }]
    },
    'crude_compass': {
        id: 'crude_compass',
        name: 'Bussola Grezza',
        description: "Un ago magnetizzato che galleggia in una ciotola d'acqua. Orientamento di base, ma meglio di niente.",
        type: 'tool',
        usable: true,
        weight: 0.3,
        value: 20,
        effects: [{ type: 'navigation_aid', accuracy_bonus: 0.2 }]
    },
    'signal_mirror': {
        id: 'signal_mirror',
        name: 'Specchio di Segnalazione',
        description: "Un piccolo specchio che può riflettere la luce solare per segnalazioni a lunga distanza.",
        type: 'tool',
        usable: true,
        weight: 0.2,
        value: 8,
        charges: 15,
        effects: [{ type: 'signal_attempt', range: 'long', success_chance: 0.6 }]
    },
    'rope_climbing_short': {
        id: 'rope_climbing_short',
        name: 'Corda da Arrampicata (Corta)',
        description: "Alcuni metri di corda resistente. Utile per superare piccoli dislivelli o legare oggetti.",
        type: 'tool',
        usable: true,
        weight: 1.0,
        value: 14,
        charges: 6,
        effects: [{ type: 'climbing_aid', height_bonus: 3 }]
    },
    'basic_sewing_kit': {
        id: 'basic_sewing_kit',
        name: 'Kit da Cucito Basilare',
        description: "Ago, filo e qualche bottone. Può riparare vestiti strappati o creare semplici modifiche.",
        type: 'tool',
        usable: true,
        weight: 0.1,
        value: 12,
        charges: 8,
        effects: [{ type: 'repair_item_type', item_type_target: ['armor'], repair_amount: 8, charges: 1 }]
    },
    'metal_detector_broken': {
        id: 'metal_detector_broken',
        name: 'Metal Detector Rotto (Parzialmente Funzionante)',
        description: "Un vecchio metal detector che funziona a intermittenza. Potrebbe ancora trovare oggetti metallici sepolti.",
        type: 'tool',
        usable: true,
        weight: 2.5,
        value: 35,
        charges: 4,
        effects: [{ type: 'metal_detection', success_chance: 0.4, find_types: ['scrap_metal', 'mechanical_parts', 'coins'] }]
    },
    'portable_radio_damaged': {
        id: 'portable_radio_damaged',
        name: 'Radio Portatile Danneggiata',
        description: "Una vecchia radio che capta solo interferenze e occasionali frammenti di trasmissioni. Potrebbe rivelare informazioni utili.",
        type: 'tool',
        usable: true,
        weight: 1.5,
        value: 25,
        charges: 6,
        effects: [{ type: 'radio_scan', success_chance: 0.3, info_types: ['weather', 'danger_warning', 'survivor_signal'] }]
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
    },

    // --- NUOVE RICETTE AGGIUNTE ---
    'craft_disinfectant_paste': {
        productName: "Pasta Disinfettante Grezza",
        productId: 'crude_disinfectant_paste',
        productQuantity: 1,
        ingredients: [
            { itemId: 'charcoal', quantity: 1 },
            { itemId: 'melted_animal_fat', quantity: 1 },
            { itemId: 'sticky_plant_resin', quantity: 1 }
        ],
        description: "Mescola cenere di carbone, grasso animale e linfa vegetale per creare una pasta disinfettante.",
        successMessage: "Hai creato una Pasta Disinfettante Grezza."
    },
    'craft_makeshift_splint': {
        productName: "Stecca Improvvisata",
        productId: 'makeshift_splint',
        productQuantity: 1,
        ingredients: [
            { itemId: 'wood_planks', quantity: 1 },
            { itemId: 'cloth_rags', quantity: 2 }
        ],
        description: "Lega bastoncini di legno con stracci per immobilizzare arti feriti.",
        successMessage: "Hai creato una Stecca Improvvisata."
    },
    'craft_honey_bandage': {
        productName: "Benda al Miele",
        productId: 'honey_bandage',
        productQuantity: 1,
        ingredients: [
            { itemId: 'bandages_clean', quantity: 1 },
            { itemId: 'contaminated_wild_honey', quantity: 1 }
        ],
        description: "Imbevi bende pulite con miele per accelerare la guarigione.",
        successMessage: "Hai creato una Benda al Miele."
    },
    'craft_fishing_rod': {
        productName: "Canna da Pesca Improvvisata",
        productId: 'improvised_fishing_rod',
        productQuantity: 1,
        ingredients: [
            { itemId: 'wood_planks', quantity: 1 },
            { itemId: 'woven_plant_fibers', quantity: 1 },
            { itemId: 'small_sharp_bones', quantity: 1 }
        ],
        description: "Combina un bastone, fibre vegetali e un osso affilato per pescare.",
        successMessage: "Hai creato una Canna da Pesca Improvvisata."
    },
    'craft_animal_trap': {
        productName: "Trappola per Animali Semplice",
        productId: 'animal_trap_simple',
        productQuantity: 1,
        ingredients: [
            { itemId: 'scrap_metal', quantity: 2 },
            { itemId: 'wood_planks', quantity: 1 },
            { itemId: 'short_braided_rope', quantity: 1 }
        ],
        description: "Costruisci una trappola rudimentale per catturare piccoli animali.",
        successMessage: "Hai creato una Trappola per Animali Semplice."
    },
    'craft_fire_starter': {
        productName: "Acciarino e Pietra Focaia",
        productId: 'fire_starter_flint',
        productQuantity: 1,
        ingredients: [
            { itemId: 'scrap_metal', quantity: 1 },
            { itemId: 'thick_glass_shards', quantity: 1 }
        ],
        description: "Crea strumenti primitivi ma affidabili per accendere fuochi.",
        successMessage: "Hai creato un Acciarino e Pietra Focaia."
    },
    'craft_signal_mirror': {
        productName: "Specchio di Segnalazione",
        productId: 'signal_mirror',
        productQuantity: 1,
        ingredients: [
            { itemId: 'thick_glass_shards', quantity: 2 },
            { itemId: 'scrap_metal', quantity: 1 }
        ],
        description: "Leviga frammenti di vetro e montali su metallo per segnalazioni.",
        successMessage: "Hai creato uno Specchio di Segnalazione."
    },
    'craft_climbing_rope': {
        productName: "Corda da Arrampicata (Corta)",
        productId: 'rope_climbing_short',
        productQuantity: 1,
        ingredients: [
            { itemId: 'woven_plant_fibers', quantity: 3 },
            { itemId: 'cloth_rags', quantity: 2 }
        ],
        description: "Intreccia fibre vegetali e stracci per creare una corda resistente.",
        successMessage: "Hai creato una Corda da Arrampicata."
    },
    'craft_sewing_kit': {
        productName: "Kit da Cucito Basilare",
        productId: 'basic_sewing_kit',
        productQuantity: 1,
        ingredients: [
            { itemId: 'small_sharp_bones', quantity: 2 },
            { itemId: 'woven_plant_fibers', quantity: 1 },
            { itemId: 'scrap_metal', quantity: 1 }
        ],
        description: "Crea aghi da ossa affilate e filo da fibre vegetali.",
        successMessage: "Hai creato un Kit da Cucito Basilare."
    },
    'craft_water_filter': {
        productName: "Filtro d'Acqua Improvvisato (Monouso)",
        productId: 'improvised_water_filter',
        productQuantity: 1,
        ingredients: [
            { itemId: 'plastic_containers', quantity: 1 },
            { itemId: 'charcoal', quantity: 2 },
            { itemId: 'cloth_rags', quantity: 2 }
        ],
        description: "Riempi un contenitore con strati di stracci, sabbia e carbone.",
        successMessage: "Hai creato un Filtro d'Acqua Improvvisato."
    },
    'craft_electrolyte_drink': {
        productName: "Bevanda Elettrolitica Fai-da-Te",
        productId: 'diy_electrolyte_drink',
        productQuantity: 1,
        ingredients: [
            { itemId: 'water_purified_small', quantity: 1 },
            { itemId: 'berries', quantity: 1 }
        ],
        description: "Mescola acqua purificata con succo di bacche per una bevanda idratante.",
        successMessage: "Hai creato una Bevanda Elettrolitica Fai-da-Te."
    },
    'craft_pine_needle_tea': {
        productName: "Tè di Aghi di Pino",
        productId: 'pine_needle_tea',
        productQuantity: 1,
        ingredients: [
            { itemId: 'water_purified_small', quantity: 1 },
            { itemId: 'woven_plant_fibers', quantity: 1 }
        ],
        description: "Fai bollire aghi di pino in acqua per un infuso ricco di vitamine.",
        successMessage: "Hai preparato un Tè di Aghi di Pino."
    },
    'craft_tourniquet': {
        productName: "Laccio Emostatico d'Emergenza",
        productId: 'emergency_tourniquet',
        productQuantity: 1,
        ingredients: [
            { itemId: 'cloth_rags', quantity: 3 },
            { itemId: 'wood_planks', quantity: 1 }
        ],
        description: "Crea una striscia di tessuto resistente per fermare emorragie gravi.",
        successMessage: "Hai creato un Laccio Emostatico d'Emergenza."
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

// 🔒 FINE SEZIONE PROTETTA v0.8.3 🔒
// ⚠️ I 45 eventi aggiunti sopra sono PROTETTI da modifiche future ⚠️
// Documentazione completa: doc_e_log/EVENTI_PROTETTI_v0.8.3.md
// Data protezione: Dicembre 2024
// Crescita database: +140% eventi specifici (32→77)
// 🔒 NON MODIFICARE GLI EVENTI PROTETTI 🔒
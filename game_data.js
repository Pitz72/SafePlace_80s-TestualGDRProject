// --- CONFIGURAZIONE E COSTANTI ---
// Questo file contiene dati statici, costanti e testi.
// Rimane invariato rispetto alla versione precedente,
// in quanto la pulizia ha riguardato principalmente la logica JavaScript.

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

// Probabilità eventi per tipo di casella (0 = mai, 1 = sempre)
const EVENT_CHANCE = {
    PLAINS: 0.05, // Bassa probabilità in pianura
    FOREST: 1.0, // Alta probabilità per test
    RIVER: 0.1,
    VILLAGE: 1.0, // Alta probabilità per test
    CITY: 0.5,
    REST_STOP: 0.8 // Alta probabilità di trovare qualcosa/qualcuno
    // MOUNTAIN non ha eventi (impassabile)
};

// Dati degli eventi per tipo di casella
const EVENT_DATA = {
    PLAINS: [
        { 
            title: "Vento Solitario", 
            description: "Il vento spazza la pianura desolata. Non c'è nulla qui, solo il silenzio.",
            choices: [] // Nessuna scelta, solo continua
        }
    ],
    FOREST: [
        {
            title: "Strani Rumori",
            description: "Senti dei rumori sospetti provenire dal folto della foresta. Potrebbe essere pericoloso, ma forse c'è qualcosa di utile?",
            choices: [
                { text: "Indaga con cautela (Tracce)", skillCheck: { stat: 'tracce', difficulty: 12 }, successText: "Ti avvicini furtivamente e trovi delle bacche commestibili.", failureText: "Fai rumore e qualsiasi cosa ci fosse è fuggita."}, // Placeholder
                { text: "Ignora e prosegui", outcome: "Decidi che non vale la pena rischiare." }
            ]
        },
        {
            title: "Albero Caduto",
            description: "Un grosso albero blocca il sentiero. Puoi provare a scavalcarlo o a trovare un'altra via.",
            choices: [
                 { text: "Scavalca (Agilità)", skillCheck: { stat: 'agilita', difficulty: 10 }, successText: "Superi l'ostacolo con un balzo.", failureText: "Inciampi e perdi un po' di tempo."}, // Placeholder
                 { text: "Aggira l'ostacolo", outcome: "Perdi un po' di tempo ma eviti rischi." }
            ]
        }
    ],
    RIVER: [
         { 
            title: "Il Fiume Scorre", 
            description: "L'acqua scorre placida. Potresti provare a riempire la borraccia.",
            choices: [
                { text: "Bevi o Riempi Borraccia (Acqua Sporca!)", outcome: "Ottieni Acqua Sporca. Meglio purificarla." }, // Placeholder
                { text: "Guarda l'acqua scorrere", outcome: "Ti prendi un momento di pausa."}
            ]
        }
    ],
    VILLAGE: [
        {
            title: "Resti di un Villaggio",
            description: "Le case sono in rovina, ma forse qualcuno ha lasciato qualcosa.",
            choices: [
                { text: "Perquisisci le macerie (Tracce)", skillCheck: { stat: 'tracce', difficulty: 11 }, successText: "Trovi una scatoletta di cibo intatta!", failureText: "Trovi solo polvere e detriti."}, // Placeholder
                { text: "Riposati all'ombra di un muro", outcome: "Ti concedi un breve riposo." }
            ]
        }
    ],
    CITY: [
         { 
            title: "Ombre nella Città Morta", 
            description: "I grattacieli scheletrici proiettano lunghe ombre. L'aria è pesante.",
            choices: [
                 { text: "Esplora un edificio (Pericolo!)", outcome: "Decidi di non rischiare per ora." }, // Placeholder
                 { text: "Attraversa rapidamente la strada", outcome: "Ti muovi il più velocemente possibile."}
            ]
        }
    ],
     REST_STOP: [
         { 
            title: "Stazione di Servizio Abbandonata", 
            description: "Una vecchia stazione di servizio arrugginisce ai lati della strada. Potrebbe esserci qualcosa dentro.",
            choices: [
                 { text: "Controlla dentro (Tracce)", skillCheck: { stat: 'tracce', difficulty: 9 }, successText: "Trovi delle bende quasi pulite.", failureText: "Non c'è nulla di utile rimasto."}, // Placeholder
                 { text: "Prosegui oltre", outcome: "Meglio non perdere tempo."}
            ]
        }
    ]
    // Aggiungere eventi per altri tipi di terreno se necessario
};

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
const TILE_DESC = {
    '.':'Pianura desolata',
    'M':'Montagne cicatrizzate',
    '~':'Fiume lento',
    'F':'Foresta opprimente',
    'V':'Accampamento isolato',
    'C':'Rovine di città',
    'R':'Rifugio improvvisato',
    'S':"Punto d'inizio",
    'E':'Destinazione incerta',
    '@':'Ultimo (Tu)'
};

// --- DEFINIZIONE OGGETTI GLOBALI ---
// Database degli oggetti presenti nel gioco
const ITEM_DATA = {
    // Risorse Utilizzabili
    'water_purified_small': {
        id: 'water_purified_small',
        name: "Acqua Purificata (P)",
        description: "Una piccola borraccia d'acqua potabile. Preziosa.",
        usable: true,
        type: 'consumable',
        effect: { type: 'add_resource', resource_type: 'water', amount: 3 }
    },
    'canned_food': {
        id: 'canned_food',
        name: "Cibo in Scatola",
        description: "Una scatoletta ammaccata ma sigillata. Chissà cosa contiene.",
        usable: true,
        type: 'food',
        effect: { type: 'add_resource', resource_type: 'food', amount: 4 }
    },
    // Oggetti Curativi
    'bandages_dirty': {
        id: 'bandages_dirty',
        name: "Bende Sporche",
        description: "Bende recuperate, non proprio pulite. Meglio di niente per fermare un'emorragia.",
        type: 'healing',
        effect: { type: 'heal_status', status_cured: 'isInjured', chance: 0.3, success_message: "Le bende sembrano aver fermato il peggio.", failure_message: "Le bende sono troppo sporche, non hanno aiutato." },
        usable: true,
        stackable: true
    },
    'medicine_crude': {
        id: 'medicine_crude',
        name: "Medicina Grezza",
        description: "Pasticche dall'aspetto sospetto. Potrebbero curare una malattia... o peggiorarla.",
        type: 'healing',
        effect: { type: 'heal_status', status_cured: 'isSick', chance: 0.6, success_message: "La febbre sembra scendere.", failure_message: "Non ti senti affatto meglio." },
        usable: true,
        stackable: true
    },
    // Materiali / Lore
    'scrap_metal': {
        id: 'scrap_metal',
        name: "Rottame Metallico",
        desc: "Un pezzo di metallo contorto e arrugginito. Inutile ora, forse utile per riparazioni future?",
        usable: false,
        type: 'materiale',
        effect: null,
        stackable: true
    },
    'lore_fragment_item': { // Esempio oggetto Lore (attualmente non usato attivamente)
        id: 'lore_fragment_item',
        name: "Nota Strappata",
        desc: "Un pezzo di carta con scritte sbiadite.",
        usable: false,
        type: 'lore',
        effect: { type: 'show_lore', text_array_ref: 'loreFragments' },
        stackable: false
    },
    'small_knife': {
        id: 'small_knife',
        name: "Piccolo Coltello",
        description: "Un piccolo coltello, utile per vari scopi.",
        usable: false,
        type: 'tool'
    },
    'berries': {
        name: "Bacche",
        description: "Un pugno di bacche selvatiche. Speriamo siano commestibili.",
        usable: true,
        type: 'food',
        value: 1
    }
    // Aggiungere altri oggetti qui...
};

// --- Testi Variabili (Flavor, Lore, Eventi) ---
// Questi array contengono la maggior parte dei testi descrittivi e narrativi del gioco.
// Mantenerli separati dalla logica rende più facile la modifica e l'espansione.

// Flavor text per diversi tipi di tile (Giorno)
const flavorTextsPlains = [
    "Il vento solleva mulinelli di polvere rossastra che brucia gli occhi.",
    "Un silenzio innaturale grava su questa distesa brulla, pesante come un sudario.",
    "Ossa sbiancate dal sole, forse umane, affiorano dal terreno screpolato.",
    "Una carcassa di animale non identificabile giace lontana, divorata da sciami di insetti.",
    "Il cielo è un vasto oceano grigio e indifferente, senza un uccello in vista.",
    "Piccoli arbusti secchi e contorti si aggrappano disperatamente alla vita, come dita scheletriche.",
    "Una vecchia linea elettrica abbattuta serpeggia tra l'erba morta, un monumento inutile.",
    "Il terreno è duro e crepato sotto i tuoi piedi, assetato come te.",
    "Nessun segno di acqua o vita animale recente, solo il vuoto.",
    "Una sensazione di vuoto e isolamento ti pervade, sei un puntino nella desolazione.",
    "Il debole sole filtra appena attraverso una cappa di polvere costante, offrendo poco calore.",
    "Lo scheletro arrugginito di un veicolo agricolo affonda nel terreno, inghiottito dalla polvere.",
    "Una colonna di fumo si alza pigramente in lontananza... fuoco amico o nemico?",
    "Nuvole basse corrono veloci, promettendo una pioggia acida che non arriva mai.",
    "Schegge di vetro scintillano nella polvere, resti di finestre esplose chissà quando."
];
const flavorTextsForest = [
    "Rami secchi scricchiolano sinistramente sotto i tuoi stivali, annunciando la tua presenza.",
    "Un odore pungente di decomposizione e muffa riempie l\'aria immobile, quasi soffocante.",
    "Il silenzio è rotto solo dal tuo respiro affannoso e dal battito martellante del tuo cuore.",
    "Intravedi un movimento fugace tra gli alberi fitti... un animale o qualcos\'altro che osserva?",
    "Strani simboli luminescenti, quasi organici, pulsano debolmente sulla corteccia di un albero antico.",
    "La luce del sole filtra a fatica, creando lunghe ombre danzanti che ingannano la vista.",
    "Trovi i resti di un piccolo accampamento abbandonato in fretta, c\'è odore di paura nell\'aria.",
    "Muschio pallido ricopre tronchi e rocce come un sudario umido e freddo.",
    "Senti un basso ringhio provenire dalle profondità della foresta, troppo vicino per stare tranquillo.",
    "L\'aria è pesante e immobile, sembra quasi difficile respirare in questa oscurità verde.",
    "Ragnatele innaturalmente grandi e spesse bloccano il sentiero, tessute da ragni mostruosi?",
    "Un fungo pallido e dall\'aspetto velenoso cresce alla base di un tronco marcio.",
    "Il verso rauco di un corvo solitario ti fa sussultare, un presagio?",
    "Un sentiero quasi invisibile si perde tra gli alberi, una promessa o una trappola?",
    "Un albero cavo emana un debole bagliore verdastro dall\'interno, pulsando lentamente."
];
const flavorTextsMountain = [
    "Un\'eco lontana risuona tra le vette aguzze, portando con sé un suono inquietante, forse un lamento.",
    "Il sentiero è ripido, franoso e disseminato di rocce taglienti come rasoi.",
    "Un\'aquila solitaria disegna ampi cerchi nel cielo plumbeo, osservandoti con fredda indifferenza.",
    "Senti il rumore di piccole pietre che rotolano in basso, smosse da chi o cosa si nasconde sopra di te?",
    "La carcassa congelata di uno scalatore sfortunato è un macabro monito contro l\'arroganza.",
    "Il vento fischia tra le creste rocciose come un lamento spettrale, portando voci dal passato.",
    "Resti contorti di strutture metalliche si fondono con la roccia, cicatrici di una guerra dimenticata.",
    "La vista dalla cima è vasta e vertiginosa, ma mostra solo chilometri di desolazione senza fine.",
    "L\'aria è rarefatta e pungente, ogni respiro è una piccola vittoria.",
    "Una caverna buia si apre sul fianco della montagna, promettendo riparo o diventando la tua tomba.",
    "Neve sporca e vecchia persiste nelle zone d\'ombra, un ricordo di inverni passati.",
    "Un passaggio stretto tra due pareti di roccia incombe su di te, minacciando di schiacciarti.",
    "Trovi vecchi segni di piccozza sulla roccia, testimonianza silenziosa di chi ti ha preceduto.",
    "Un rivolo d\'acqua gelida sgorga da una fessura, un piccolo miracolo in questo nulla arido.",
    "Una croce fatta di tubi arrugginiti svetta su un picco vicino, monumento a una fede perduta o a un avvertimento?"
];
const flavorTextsRiver = [
    "Detriti non identificabili e chiazze oleose galleggiano lentamente sull\'acqua torbida.",
    "La riva fangosa risucchia i tuoi stivali ad ogni passo, rendendo l\'avanzata faticosa.",
    "Un pesce deforme con troppi occhi galleggia a pancia in su, testimone della contaminazione.",
    "Il suono basso e costante dell\'acqua che scorre è quasi ipnotico nel silenzio opprimente.",
    "I resti crollati di un vecchio ponte di cemento bloccano parzialmente il flusso, creando gorghi sinistri.",
    "Vedi delle bolle maleodoranti salire in superficie... gas naturale o il respiro di qualcosa sotto?",
    "L\'acqua sembra stranamente calda al tatto, innaturale.",
    "L\\\'acqua ha un colore innaturale, verdastro e lattiginoso.",
    "La carcassa arrugginita di una barca da pesca è incagliata sulla riva opposta, un relitto solitario.",
    "Un gruppo di insetti mutati, grossi come il tuo pollice, ronza minacciosamente vicino all\'acqua.",
    "Il letto del fiume è disseminato di oggetti contorti e irriconoscibili.",
    "Sulla riva opposta, vedi delle luci deboli tremolare... altri sopravvissuti o un inganno?",
    "L\'acqua emana un leggero odore chimico che irrita le narici.",
    "Sulla riva melmosa, una scarpa spaiata è semisepolta, come se qualcuno fosse stato trascinato via.",
    "Un banco di nebbia innaturale staziona sull\'acqua, anche se la giornata è limpida."
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
    "Un vento freddo si incanala tra gli edifici, portando con sé suoni indistinti... voci o lamenti?"
];
const flavorTextsVillage = [
    "Tende strappate e ripari improvvisati fatti di lamiere sbattono tristemente al vento gelido.",
    "Un fuoco da campo spento da tempo, con pentole arrugginite e ossa animali sparse intorno.",
    "Oggetti personali – una scarpa da bambino, un libro ammuffito, una foto sbiadita – giacciono abbandonati nella polvere.",
    "Non c\'è alcun segno di vita recente, solo il silenzio della desolazione e l\'odore della morte.",
    "Un\'atmosfera pesante grava sull\'accampamento, come se qualcosa di terribile fosse accaduto qui di recente.",
    "Resti di barricate rudimentali e macchie scure sul terreno suggeriscono un passato violento.",
    "Una pentola ammaccata giace vicino alla cenere fredda, l\'ultimo pasto mai consumato.",
    "Qualcuno ha cercato disperatamente di fortificare questo posto, ma le difese sono state violate.",
    "L\\\'aria odora di polvere, abbandono e un sottile sentore di malattia.",
    "Piccoli cumuli di terra smossa con croci improvvisate... tombe fresche.",
    "Un carillon rotto suona una melodia stonata quando il vento lo colpisce.",
    "Le tende vuote sembrano bocche spalancate che urlano in silenzio.",
    "Un giocattolo rotto, un orsacchiotto senza un occhio, giace nel fango vicino a una tenda squarciata.",
    "Bandiere stracciate di una nazione dimenticata sbattono debolmente su pali improvvisati.",
    "Uno strano silenzio grava su questo luogo, come se tutti fossero scomparsi all'improvviso."
];
const flavorTextsRestStop = [
    "Il riparo è precario, un ammasso di lamiere contorte, teli laceri e detriti vari.",
    "Qualcuno ha lasciato segni del suo passaggio qui: scritte sui muri (\'NON DORMIRE\'), piccoli oggetti rituali.",
    "Puzza intensamente di vecchio fumo stantio, urina secca e umidità stagnante.",
    "Sembra relativamente sicuro dall\'esterno, ma l\'interno suscita un senso di disagio.",
    "Trovi un piccolo giaciglio improvvisato fatto di stracci, sembra usato di recente... troppo di recente.",
    "Il silenzio qui è diverso, più opprimente, come se le pareti avessero assorbito urla.",
    "Il tetto gocciola un liquido scuro e oleoso anche se non piove.",
    "Trovi delle scritte sul muro: \'Giorni sopravvissuti: 12\', poi \'13\', poi un graffio profondo che cancella tutto.",
    "Un materasso sporco e strappato è buttato in un angolo, macchiato di qualcosa di scuro.",
    "Una singola lattina vuota e ammaccata rotola sul pavimento quando entri, producendo un rumore assordante.",
    "C\'è un debole odore dolciastro e sgradevole nell\'aria... prodotti chimici o decomposizione?",
    "Le pareti sono coperte di disegni infantili inquietanti e simboli sconosciuti.",
    "Una radio a manovella è appoggiata su un tavolo improvvisato, silenziosa. Chissà quali segnali potrebbe captare.",
    "Senti il rumore di gocce che cadono ritmicamente da qualche parte nel buio del rifugio.",
    "La polvere qui dentro è così spessa che attutisce ogni suono, creando un silenzio innaturale."
];

// Flavor text per diversi tipi di tile (Notte)
const flavorTextsNightPlains = [
    "Un silenzio innaturale e profondo avvolge la pianura sotto la luna malata.",
    "La luna proietta ombre lunghe e distorte che sembrano creature striscianti.",
    "Il vento notturno sussurra strane melodie tra l\'erba secca, portando voci che non ci sono.",
    "Senti un fruscio improvviso vicino a te, ma quando ti giri non c\'è nulla... o quasi.",
    "Le stelle sembrano fredde, aguzze e terribilmente lontane, osservatori impassibili.",
    "Ogni tanto, un grido lontano e disumano rompe la quiete, facendo accapponare la pelle.",
    "L\'oscurità sembra viva, densa, pronta a inghiottire la debole luce della tua torcia.",
    "Una forma indistinta si muove rapidamente all\'orizzonte, troppo veloce per essere naturale.",
    "Il terreno sembra respirare lentamente nell\'oscurità, come il fianco di una bestia addormentata.",
    "Senti il freddo della notte penetrare nelle ossa, portando con sé una stanchezza mortale.",
    "Luci fatue danzano in lontananza, spiriti o gas di palude?",
    "L\'orizzonte sembra infinito e vuoto, non c\'è riparo in vista.",
    "Le nuvole basse corrono veloci, oscurando a tratti la luna e rendendo le ombre ancora più profonde.",
    "Un odore metallico e acre ti colpisce le narici, portato da una brezza improvvisa.",
    "Senti un suono basso e vibrante provenire da sottoterra, lontano ma distinto."
];
const flavorTextsNightForest = [
    "Ogni scricchiolio di ramo secco ti fa sobbalzare, il cuore in gola.",
    "Forme indistinte e contorte sembrano muoversi furtivamente tra gli alberi ai margini della vista.",
    "Un odore metallico e dolciastro si diffonde nell\'aria fredda della notte... sangue?",
    "Il buio della foresta è quasi totale, denso e opprimente come terra umida.",
    "Senti il battito d\'ali pesanti di qualcosa di grosso che vola silenziosamente sopra la tua testa.",
    "Un paio di occhi gialli e innaturali ti fissano intensamente dal buio prima di sparire con uno scatto.",
    "La foresta di notte sembra viva, ostile, ogni albero un potenziale nascondiglio per l\'orrore.",
    "Inciampi su una radice nodosso nascosta dall\'ombra, rischiando di cadere.",
    "Un sussurro gelido sembra seguire i tuoi passi, pronunciando il tuo nome... o forse no.",
    "La luna filtra a malapena tra le fitte chiome, creando giochi di luce e ombra inquietanti e ingannevoli.",
    "Senti un respiro rauco e umido molto vicino, ma non riesci a localizzarlo.",
    "Il silenzio è così teso che puoi sentire il sangue pulsare nelle orecchie.",
    "Intravedi strani funghi bioluminescenti che pulsano con una luce fredda e spettrale.",
    "Il terreno sembra stranamente soffice sotto i tuoi piedi, come se stessi camminando su qualcosa di vivo.",
    "Un improvviso silenzio innaturale cala sulla foresta, ancora più inquietante del rumore."
];

// Frammenti di Lore (trovati casualmente o legati a eventi)
const loreFragments = [
    "Pagina strappata di diario: '... giorno 47. Le scorte sono finite. Ho sentito di un posto sicuro a est, oltre le montagne spezzate. Forse è solo una favola per disperati come me, ma è la mia ultima speranza...'",
    "Pezzo di metallo inciso a laser: 'Progetto Chimera - Soggetto #007 - Proprietà della Volta 7 - TERMINATO'",
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
    "Distintivo militare corroso dall'acido: Riporta il simbolo di un teschio alato e la scritta 'Guardiani della Volta - Unità Epurazione'.",
    "Terminale medico portatile, schermo rotto ma leggibile: Mostra una lettura parziale: 'Contaminazione Biologica Tipo Gamma - Necrosi Tessutale Rapida - Esposizione fatale entro 2 ore...'.",
    "Fotografia olografica incrinata e tremolante: Mostra una città vibrante e piena di luci volanti colorate, un'immagine quasi dolorosa da guardare ora.",
    "Bozza di messaggio non inviato, scritta su un tablet rotto: '...Eliza, non ce la faremo a raggiungerti. Le scorte bastano per uno solo. Prenditi cura di Ultimo... digli che la sua mamma era un'eroina... e che...'",
    "Schema tecnico strappato e macchiato: Descrive un 'Generatore Atmosferico Classe Arca' progettato per purificare l'aria su larga scala... mai attivato?",
    "Simbolo religioso improvvisato fatto di ossa umane, fili metallici e componenti elettronici.",
    "Ritaglio di giornale pre-guerra ('Il Cronista Globale'): Titolo: 'Nuova Era di Prosperità o Fuga dalla Realtà? Le Volte Salveranno l'Umanità o la Divideranno per Sempre?'",
    "Piccolo carillon arrugginito a forma di stella. Quando lo apri, suona una melodia triste e rivela uno scomparto segreto con dentro una chiave minuscola e ossidata.",
    "Appunto scarabocchiato su un tovagliolo unto: 'Segui il fiume morto verso il sole calante. Cerca la roccia che piange. Lì troverai la porta... se oserai bussare.'",
    "Chip dati incrinato e parzialmente fuso. Impossibile leggerlo senza l'attrezzatura di una Volta... o forse qualcosa di peggio.",
    "Manuale tecnico strappato ('Manutenzione Ripari Classe-C'): '...il sistema di filtraggio dell\'aria HEPA richiede sostituzione nucleo ogni 500 ore operative per evitare contaminazione interna...'",
    "Lista della spesa macchiata di sangue: 'Acqua (min. 5L), Munizioni (tutte!), Scatolette (proteine!), Nastro adesivo (molto!), Antidolorifici... Speranza (se ne trovi)...'",
    "Pagina di un bestiario improvvisato, scritto a mano con disegni disturbanti: Descrive una creatura notturna senza volto chiamata 'Il Sussurrante delle Ombre', che si nutre di ricordi.",
    "Rapporto tecnico parzialmente bruciato: '...il Geo-Core di Sektor Gamma è instabile. Rischio di collasso quantico entro 48h. Evacuare...'",
    "Messaggio scarabocchiato sul retro di una foto di famiglia sorridente: 'Non sono riuscito a salvarli. La nebbia... li ha presi...'",
    "Ordine militare criptato (decifrato parzialmente): '...Protocollo Cenere attivato su [REDACTED]. Nessun sopravvissuto autorizzato. Silenzio totale.'",
    "Capsula medica vuota etichettata 'Naniti Riparatori - Prototipo X'. Sembra usata di recente.",
    "Frammento di trasmissione radio intercettata: '...i Corvi Neri hanno sfondato a ovest. Ripeto, i Corvi Neri... la Vecchia Capitale cadrà...'",
    "Diario di un medico della Volta 9: 'Giorno 112. Le mutazioni accelerate nel Settore Delta sono... inaspettate. Aggressività fuori scala. Abbiamo creato mostri.'",
    "Tessera d\'accesso corrosa: 'Volta 4 - Livello Sicurezza Alpha - Dott.ssa Eva Rostova'",
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
    "Rapporto psichiatrico Volta 11: 'Paziente 042 mostra sintomi di paranoia acuta, parla di 'voci nel metallo' e 'occhi nei muri'. Sedazione aumentata.'",
    "Chiave magnetica con etichetta sbiadita: 'Deposito Criogenico B-7'."
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
    "...[SEQUENZA NUMERICA RIPETUTA] ... 4 8 15 16 23 42 ... 4 8 15 16 23 42 ..."
];

// Descrizioni per eventi specifici (incontri, pericoli, etc.)
const descrizioniIncontroPredoni = [
    "Ombre furtive si muovono ai margini della tua vista, sagome contro la luce morente.",
    "Figure emergono dalla polvere come spettri, armi improvvisate strette nelle mani.",
    "Un fischio acuto e stridulo rompe il silenzio, seguito da passi affrettati che ti circondano.",
    "Un gruppo malmesso e disperato ti sbarra il passo, i loro volti maschere di fame e brutalità.",
    "Hanno occhi affamati e vuoti, armi che sono un miscuglio di tubi arrugginiti e lame scheggiate.",
    "Tre figure bloccano il tuo cammino, ghignando con denti rotti e marci.",
    "Un uomo enorme con una maschera antigas rotta ti punta contro un tubo di metallo rinforzato.",
    "'Alt! Fermo dove sei, scarto!' grida una voce nervosa da dietro una copertura.",
    "Sembrano più disperati che puramente malvagi, ma la disperazione li rende imprevedibili e pericolosi.",
    "Ti osservano come lupi che studiano una preda ferita, valutando le tue debolezze.",
    "Un gruppo di adolescenti induriti dalla vita, armati di coltelli fatti in casa e bastoni chiodati, ti squadra con arroganza.",
    "Una donna con occhi freddi come il ghiaccio e una cicatrice sul volto ti squadra da capo a piedi, senza dire una parola.",
    "Sbucano da dietro un angolo di un edificio diroccato, sorprendendoti nel silenzio.",
    "Le loro risate rauche e sgradevoli echeggiano tra le rovine, annunciando la loro presenza.",
    "Indossano stracci e pezzi di armature improvvisate, trofei di scontri passati."
];
const vociPredoni = [ // Non attualmente usate, ma potenzialmente utili
    "'Fermi lì, bello! Non fare un passo di più.'",
    "'Cosa abbiamo qui? Carne fresca per il banchetto!'",
    "'Non fare movimenti bruschi, o ti piantiamo qualcosa di affilato addosso.'",
    "'Svuota quelle tasche, piano piano... non fare scherzi.'",
    "'Questo è il nostro territorio. Devi pagare il pedaggio per passare.'",
    "'Non cercare guai, straniero, e forse ti lasciamo le ossa intere.'",
    "'Dacci tutto quello che hai, cibo, acqua, armi... ADESSO!'",
    "'Tutto solo? Peggio per te. Sarà più facile.'",
    "'Bel giocattolino quello che hai lì... sembra utile. Dallo a noi.'",
    "'Non fare l'eroe. Gli eroi finiscono morti in questo mondo.'",
    "'Abbiamo fame. Molta fame. E tu sembri... nutriente.'",
    "'La fortuna non ti sorride oggi, viaggiatore. Anzi, ti ha appena voltato le spalle.'",
    "'Nessuno passa di qui senza il nostro permesso. E il permesso costa caro.'",
    "'Pensi di essere furbo? Vediamo quanto sei furbo con una lama alla gola.'",
    "'Non c'è niente da fare, sei nostro ormai.'"
];
const tipiBestie = [ // Usato in evento 'animale'/'animale_notturno'
    "Cane Selvatico Mutato", "Cinghiale Radioattivo", "Ratto Gigante", "Lupo Policéphalo", "Corvo Carnivoro", "Orso Piagato", "Serpente Ipertrofico", "Sciame di Vespe Metalliche", "Scimmia Scuoiata", "Lince Ombra", "Anfibio Tentacolare", "Iena Scheletrica", "Cervo Luminescente", "Millepiedi Corazzato"
];
const descrizioniIncontroBestie = [ // Usato con tipiBestie
    "Un {animale} emerge ringhiando dalle ombre, occhi iniettati di sangue fissi su di te.",
    "Un {animale} ti carica con furia cieca, il terreno trema sotto le sue zampe.",
    "Uno sciame di {animale} ti circonda rapidamente, i loro squittii/ronzii/versi riempiono l'aria.",
    "Un {animale} ti sbarra il passo, mostrandoti zanne/artigli/aculei affilati come rasoi.",
    "Un {animale} ti osserva immobile da una posizione elevata, pronto a piombare sulla sua preda.",
    "Un {animale} ti studia con intelligenza fredda e predatoria, valutando la tua forza.",
    "Un {animale} difende ferocemente il suo territorio o la sua tana dal tuo passaggio.",
    "Un {animale} sembra attratto dal tuo odore o dal rumore dei tuoi passi.",
    "Un {animale} ferito e disperato è ancora più pericoloso del normale.",
    "Un {animale} ti segue silenziosamente da tempo, aspettando il momento giusto per attaccare."
];

// Esiti per le scelte negli eventi (Successo/Fallimento)
const esitiFugaPredoniOk = [
    "Scompari nell'ombra come fumo prima che possano reagire concretamente.",
    "Li distrai lanciando una pietra lontano e scappi nella direzione opposta mentre indagano.",
    "Trovi una via di fuga inaspettata tra le rovine intricate che solo tu sembri notare.",
    "La tua agilità felina ti permette di seminarli tra gli ostacoli del terreno.",
    "Ti tuffi dietro un riparo solido e riesci a sgattaiolare via senza essere visto.",
    "Corri più veloce di quanto la tua stessa stanchezza ti facesse credere possibile.",
    "Sfrutti un loro momento di discussione interna per dileguarti nel silenzio.",
    "Conosci questo labirinto di rovine meglio di loro, li porti in un vicolo cieco e fuggi.",
    "Una nube di polvere sollevata da un crollo improvviso copre la tua ritirata strategica.",
    "Li aggiri furtivamente mentre sono distratti da un rumore lontano, forse un'altra preda.",
    "Scivoli in un passaggio stretto e buio dove esitano a seguirti.",
    "Li semini con una serie di finte e cambi di direzione improvvisi.",
    "Il suono di una sirena lontana li distrae abbastanza da permetterti di scappare.",
    "Sfrutti la confusione di un piccolo smottamento per dileguarti.",
    "Ti mimetizzi perfettamente con l'ambiente circostante, diventando invisibile ai loro occhi."
];
const esitiFugaPredoniKo = [
    "Inciampi su un detrito nascosto e cadi rovinosamente, sei alla loro mercé!",
    "Esiti un attimo di troppo, paralizzato dalla paura, e ti bloccano ogni via di fuga.",
    "La strada che pensavi fosse una via di salvezza si rivela un vicolo cieco!",
    "Sono più veloci e determinati di te, ti raggiungono ansimando.",
    "Ti afferrano rudemente per un braccio prima che tu possa allontanarti di più.",
    "Una rete improvvisata, sporca e pesante, ti cade addosso immobilizzandoti.",
    "Ti circondano metodicamente, chiudendo ogni possibile scappatoia, ghignando.",
    "Un colpo alla testa ben assestato ti stordisce, facendoti vedere le stelle.",
    "Una freccia o un proiettile improvvisato ti colpisce a una gamba, facendoti urlare e cadere.",
    "La fatica ti tradisce, i polmoni bruciano, le gambe cedono, non riesci più a correre.",
    "Ti spingono in un angolo buio da cui non puoi scappare.",
    "Sottovaluti la loro astuzia, ti attirano in una trappola ovvia.",
    "Una raffica di colpi ti costringe a buttarti a terra, sei in trappola.",
    "Ti chiudono la strada con un veicolo sgangherato.",
    "Una trappola a laccio nascosta ti afferra per la caviglia, facendoti cadere."
];
const esitiLottaPredoniOk = [ // Rinominato da Attacca a Lotta per coerenza
    "Respingi il loro attacco scoordinato con una ferocia che li sorprende.",
    "Dopo un breve e brutale scontro, decidono che il gioco non vale la candela e si ritirano.",
    "Riesci a tenerli a bada con colpi precisi, ma sono ancora lì, ringhiando ai margini.",
    "Ne metti uno fuori combattimento rapidamente, e la vista del compagno a terra fa esitare gli altri.",
    "Li costringi a indietreggiare passo dopo passo con una difesa disperata ma efficace.",
    "Il tuo contrattacco fulmineo li coglie di sorpresa, rompendo il loro slancio.",
    "Un colpo fortunato o ben piazzato ferisce gravemente il loro capo, e l'attacco si sfalda nel caos.",
    "Li tieni impegnati abbastanza a lungo da creare un'apertura per una fuga strategica.",
    "La tua determinazione e il tuo sguardo folle li scoraggiano più delle tue armi.",
    "Non si aspettavano una tale resistenza da un viaggiatore solitario, ti hanno sottovalutato.",
    "Riesci a disarmarne uno, e l'equilibrio dello scontro cambia a tuo favore.",
    "Si ritirano borbottando minacce e insulti, lasciandoti ansimante ma vivo.",
    "Uno dei tuoi colpi manda in frantumi la maschera del capo, che si ritira urlando.",
    "Utilizzi l'ambiente a tuo vantaggio, facendoli inciampare o cadere.",
    "Il tuo urlo di battaglia è così feroce che li fa esitare abbastanza da permetterti di prendere il sopravvento."
];
const esitiLottaPredoniKo = [ // Rinominato da Attacca a Lotta per coerenza
    "Vieni picchiato selvaggiamente e lasciato a terra dolorante e umiliato.",
    "Ti derubano di quasi tutto, lasciandoti solo con gli stracci che indossi e la disperazione.",
    "La tua resistenza è inutile contro la loro superiorità numerica, ti sopraffanno rapidamente.",
    "Una lama affilata e arrugginita ti ferisce gravemente, il sangue sgorga caldo sulla polvere.",
    "Un dolore acuto alla testa ti fa cadere nel buio. Ti risvegli ore dopo, derubato, ferito e solo.",
    "Ti difendi come una tigre in gabbia, ma sono troppi. Ti lasciano sanguinante e mezzo morto tra i rifiuti.",
    "Il loro capo ride sguaiatamente mentre ti colpisce ripetutamente. 'Impara la lezione, scarto del passato.'",
    "Ti rompono un braccio o una gamba con un tubo di metallo prima di prendersi le tue cose.",
    "Ti lasciano legato strettamente con filo spinato e imbavagliato con uno straccio sporco.",
    "Senti le costole incrinarsi sotto i calci e i pugni, ogni respiro è un'agonia.",
    "Ti prendono a calci senza pietà mentre sei a terra, inerme.",
    "La vista si appanna mentre svieni per il dolore e la perdita di sangue.",
    "Ti gettano addosso una sostanza appiccicosa e infiammabile.",
    "Ti strappano di dosso l'equipaggiamento con violenza, danneggiando ciò che non rubano.",
    "Vieni trascinato via come prigioniero, verso un destino incerto."
];
const esitiParlaPredoniOk = [
    "Sorprendentemente, le tue parole toccano una corda inaspettata nel loro leader e li convince a lasciarti andare.",
    "Forse vedono in te un riflesso della loro stessa disperazione, o sono solo stanchi di violenza. Ti fanno cenno di passare.",
    "Ti squadrano attentamente, poi uno fa un cenno brusco. 'Vattene dalla nostra vista, prima che cambiamo idea.'",
    "Li convinci abilmente che non possiedi nulla che valga la pena rubare o per cui uccidere.",
    "Racconti una storia pietosa e credibile che suscita un barlume di antica umanità in uno di loro.",
    "Riesci a barattare il passaggio sicuro offrendo loro informazioni preziose su un percorso o una minaccia.",
    "Li intimidisci con un bluff ben riuscito, facendoti passare per più pericoloso di quanto sei.",
    "Il capo sembra riconoscere un vecchio codice d'onore tra sopravvissuti delle terre desolate e ti lascia passare con un avvertimento.",
    "Offri loro una piccola, ragionevole parte delle tue scarse scorte in cambio di passaggio sicuro, e accettano.",
    "Capiscono che potresti essere più utile vivo che morto, magari come fonte di informazioni future.",
    "Li avverti credibilmente di un pericolo imminente (una pattuglia, una bestia) e ti credono, lasciandoti andare.",
    "Condividi con loro una vecchia canzone dimenticata o una storia del mondo prima, e questo allenta la tensione inaspettatamente.",
    "Li convinci che sei diretto verso una morte certa e che derubarti sarebbe uno spreco di energie.",
    "Fai appello alla loro superstizione, raccontando di una maledizione che colpisce chi ti ostacola.",
    "Il capo ti riconosce (o crede di riconoscerti) da un vecchio incontro e decide di lasciarti passare per questa volta."
];
const esitiParlaPredoniKo = [
    "'Belle parole, viaggiatore, ma la pancia è vuota e la sete brucia!' Ti attaccano senza pietà.",
    "Ridono sguaiatamente delle tue suppliche o minacce e si preparano a prendersi ciò che vogliono con la forza.",
    "Le tue parole non hanno alcun effetto sul loro cinismo indurito da anni di sopravvivenza brutale.",
    "'Pensi di incantarci con le chiacchiere come facevano i politici di un tempo? Non siamo stupidi!'",
    "Il capo ti colpisce violentemente in faccia per farti tacere e smettere di infastidirlo.",
    "'Meno chiacchiere inutili, più roba utile! Svuota tutto!' ringhia uno di loro.",
    "Le tue minacce velate li fanno solo arrabbiare di più, provocando la loro furia.",
    "Ti ascoltano in un silenzio inquietante, impassibili, poi attaccano senza alcun preavviso.",
    "Ti considerano debole, patetico e una facile preda per le tue parole inutili.",
    "Non si fidano di una sola parola che esce dalla tua bocca, vedono solo un bersaglio.",
    "'Abbiamo sentito storie migliori dai vermi che strisciano qui intorno.'",
    "Ti prendono in giro crudelmente per la tua ingenuità nel pensare di poter parlare con loro.",
    "'Le storie non riempiono lo stomaco. Le tue scorte sì.'",
    "Ti interrompono a metà frase con un pugno nello stomaco.",
    "Il capo ti sputa addosso. 'Parlare non ti salverà.'"
];
// Esiti Incontro Animale (Fuga/Attacco/Osserva)
const esitiEvitaAnimaleOk = [ // Rinominato da Fuga a Evita
    "Riesci a sgattaiolare via silenziosamente senza farti notare dalla creatura distratta.",
    "Passi con cautela estrema e l'animale, forse sazio, non ti degna di uno sguardo.",
    "Ti nascondi dietro un ostacolo finché la minaccia non si allontana nel suo territorio.",
    "Sfrutti abilmente la conformazione del terreno per aggirare la creatura senza entrare nel suo campo visivo.",
    "Ti muovi lentamente controvento e l'animale non percepisce il tuo odore, ignaro della tua presenza.",
    "Congeli sul posto trattenendo il respiro finché non si allontana, disinteressato.",
    "Trovi un percorso alternativo tra le rovine o la vegetazione senza essere visto o sentito.",
    "L'animale è distratto da un rumore o da un'altra potenziale preda, permettendoti di svignartela.",
    "Usi il rumore ambientale (vento, acqua) per coprire i tuoi passi e passare inosservato.",
    "Passi rapidamente nell'ombra più fitta senza attirare l'attenzione della bestia.",
    "Scivoli via silenziosamente come un fantasma, lasciando la creatura alla sua esistenza miserabile.",
    "Il tuo basso profilo e la tua andatura furtiva ti salvano da uno scontro indesiderato.",
    "Lanci un sasso per distrarlo e approfitti del momento per allontanarti.",
    "Ti appiattisci contro un muro e attendi pazientemente che si allontani.",
    "La creatura sembra più interessata a marcare il territorio che a cacciare, e ti ignora."
];
const esitiEvitaAnimaleKo = [ // Rinominato da Fuga a Evita
    "Sei troppo lento o rumoroso! L'animale ti ha visto e si gira di scatto verso di te.",
    "Sottovaluti i suoi sensi acuti e ti individua nonostante i tuoi sforzi per nasconderti.",
    "Un passo falso su un ramo secco o un detrito rumoroso rivela la tua posizione! La bestia carica.",
    "Fai cadere inavvertitamente qualcosa dal tuo equipaggiamento, attirando la sua attenzione immediata.",
    "Il vento cambia improvvisamente direzione, portando il tuo odore direttamente alle narici della bestia.",
    "Ti muovi troppo bruscamente nel tentativo di essere veloce, e il movimento ti tradisce.",
    "Non c'è modo di aggirarlo senza essere visti in questo terreno aperto.",
    "I tuoi tentativi disperati di nasconderti dietro un riparo insufficiente falliscono miseramente.",
    "Ti scopre all'ultimo secondo, quando pensavi di essere già al sicuro. Ringhia.",
    "Emette un verso di allarme o sfida e si prepara a caricare senza esitazione!",
    "Ti punta direttamente, i suoi occhi fissi nei tuoi, non c'è più tempo per la furtività.",
    "Calpesti un pezzo di vetro rotto nel momento peggiore, il suono ti condanna.",
    "Il tuo tentativo di nasconderti ti porta in un vicolo cieco con la bestia.",
    "La creatura ti taglia la strada, impedendoti di proseguire senza affrontarla.",
    "Senti il suo fiato caldo sul collo prima ancora di accorgerti che ti ha scoperto."
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
const esitiAttaccoAnimaleOk = [
    "Con un colpo ben assestato e fortunato, riesci a respingere la creatura ferendola.",
    "Riesci a ferirlo abbastanza da farlo gemere di dolore e fuggire per leccarsi le ferite.",
    "Lo tieni a bada con una raffica di colpi, guadagnando tempo prezioso per allontanarti.",
    "Un colpo critico in un punto vitale lo abbatte! La minaccia è neutralizzata.",
    "Dopo una breve e brutale lotta, l'animale sanguinante si ritira, sconfitto per ora.",
    "Lo costringi alla fuga con una difesa tenace e qualche ferita.",
    "Riesci a infliggergli una ferita dolorosa che lo rallenta e lo scoraggia.",
    "Lo accechi temporaneamente con polvere o un colpo ben mirato e ne approfitti per scappare.",
    "Lo colpisci in un punto debole che avevi notato, facendolo barcollare.",
    "La tua difesa è sorprendentemente efficace, pari i suoi attacchi e contrattacchi.",
    "Cade a terra gravemente ferito, non sarà più una minaccia per te.",
    "Si ritira, lasciando dietro di sé una scia di sangue scuro e denso.",
    "Riesci a rompere una delle sue zampe o ali, rendendolo inoffensivo.",
    "Lo spingi in una trappola naturale (un crepaccio, un fiume) da cui non può uscire facilmente.",
    "La tua ferocia nello scontro lo convince a cercare una preda più facile."
];
const esitiAttaccoAnimaleKo = [
    "Le sue zanne affilate o gli artigli penetrano nella tua carne con facilità.",
    "Vieni morso ferocemente e sbattuto a terra con violenza inaudita.",
    "La sua furia primordiale ti travolge, non riesci a difenderti efficacemente.",
    "Ti artiglia dolorosamente, strappando vestiti e pelle.",
    "Vieni ferito gravemente nello scontro caotico, perdendo molto sangue.",
    "Ti scaraventa via come una bambola di pezza contro un muro o una roccia.",
    "Le sue difese naturali (pelle coriacea, corazza) sono troppo resistenti per le tue armi.",
    "Non riesci a penetrare la sua pelliccia spessa o la sua corazza ossea.",
    "Ti disarma con un colpo improvviso e poi ti ferisce mentre sei vulnerabile.",
    "Cadi sotto i suoi colpi potenti e ripetuti, sopraffatto.",
    "Ti morde a una gamba, senti l'osso incrinarsi, immobilizzandoti quasi.",
    "Il dolore acuto ti annebbia la vista, rendendo difficile reagire.",
    "Ti inietta un veleno paralizzante o tossico.",
    "La forza dell'impatto ti lascia senza fiato e stordito.",
    "Vieni afferrato e sbattuto ripetutamente contro il terreno."
];
// Esiti Evento Tracce Strane
const descrizioniTracce = [
    "Noti delle impronte insolite sul terreno polveroso, non sembrano umane.",
    "Qualcosa di grosso ha lasciato segni evidenti del suo passaggio tra gli arbusti spezzati.",
    "Ci sono tracce di sangue fresco e scuro sulla polvere, una lotta recente?",
    "Impronte di stivali pesanti e consumati si dirigono verso le rovine vicine.",
    "Ciuffi di pelo strano e ruvido sono impigliati in un cespuglio spinoso.",
    "Segni evidenti di trascinamento sul terreno molle, come se un corpo fosse stato spostato.",
    "Diverse cartucce di proiettili vuote sono sparse in una piccola area, testimoni di uno scontro a fuoco.",
    "Impronte più piccole e leggere si affiancano a quelle più grandi e pesanti... un bambino?",
    "Un oggetto personale chiaramente fuori posto (un guanto di pelle, una sciarpa colorata) è stato lasciato cadere.",
    "Segni inequivocabili di un accampamento molto recente: cenere ancora tiepida, rifiuti.",
    "Impronte di pneumatici larghi e tassellati dove non dovrebbero esserci strade.",
    "Strani simboli geometrici sono stati tracciati nel fango vicino a una pozza d'acqua.",
    "Noti gocce di un liquido oleoso e scuro che sembrano condurre da qualche parte.",
    "Qualcuno ha lasciato un messaggio criptico usando sassi disposti in modo particolare.",
    "Il terreno è bruciacchiato in modo innaturale, come se fosse passato qualcosa di estremamente caldo."
];
const esitiSeguiTracceOkLoot = [
    "Le tracce ti portano a un piccolo nascondiglio sotto una roccia con delle scorte!",
    "Seguendo le impronte trovi uno zaino abbandonato con dentro provviste.",
    "Chi ha lasciato queste tracce ha perso qualcosa per strada... una borraccia piena!",
    "Scopri una cassa di legno marcia ma ancora chiusa, con dentro cibo in scatola.",
    "Le impronte conducono a un cadavere recente... ha ancora addosso le sue scorte intatte.",
    "Trovi un piccolo borsello di pelle impigliato tra i rovi, contiene bende e disinfettante.",
    "Sembra che qualcuno abbia seppellito qualcosa qui frettolosamente... trovi cibo e acqua!",
    "Le tracce finiscono vicino a un pacchetto ben sigillato e impermeabile contenente carne secca.",
    "Una sacca è legata a un ramo basso, come se dovesse essere recuperata. Contiene frutta secca.",
    "Qualcuno ha nascosto qui del cibo per dopo, ma non è più tornato a prenderlo.",
    "Trovi una piccola scorta di munizioni avvolta in un telo impermeabile.",
    "Le tracce portano a un kit di attrezzi improvvisato ma utile.",
    "Scopri una fonte d'acqua nascosta e relativamente pulita.",
    "Trovi delle batterie quasi cariche vicino a un dispositivo elettronico rotto.",
    "Qualcuno ha lasciato cadere una mappa parziale che indica un deposito di scorte."
];
const esitiSeguiTracceOkLore = [
    "Le tracce ti conducono a un messaggio criptico inciso su un muro diroccato con un pezzo di carbone.",
    "Trovi un diario logoro e macchiato abbandonato vicino alle ultime impronte leggibili.",
    "Segui le tracce fino ai resti fumanti di un piccolo accampamento con alcuni indizi su chi fossero.",
    "Le impronte portano a una mappa parziale disegnata rozzamente su un pezzo di stoffa strappata.",
    "Scopri uno strano simbolo dipinto con vernice spray su una roccia, l'hai già visto da qualche parte...",
    "Trovi una registrazione audio danneggiata su un vecchio dispositivo vicino alle tracce.",
    "Le tracce finiscono bruscamente dove qualcuno ha inciso un avvertimento: 'TORNATE INDIETRO'.",
    "Segui le impronte fino a un luogo che sembra avere un significato rituale, pieno di ossa e simboli.",
    "Trovi un libro parzialmente bruciato ma con alcune pagine ancora leggibili che parlano del 'Grande Silenzio'.",
    "Le tracce appartengono chiaramente a qualcuno che stava documentando la flora mutata della zona.",
    "Scopri una vecchia fotografia sbiadita lasciata vicino alle tracce.",
    "Le impronte conducono a un terminale rotto che mostra ancora un frammento di messaggio.",
    "Trovi un oggetto religioso modificato in modo inquietante.",
    "Le tracce portano a un segnale radio debole proveniente da un bunker nascosto.",
    "Scopri un messaggio lasciato per qualcun altro, che rivela parte di un piano o di un segreto."
];
const esitiSeguiTracceOkPredoni = [
    "Le tracce ti portano dritto in un'imboscata ben preparata! Senti un fischio e sei circondato!",
    "Stavi seguendo dei predoni esperti... e ora ti hanno visto loro! 'Guarda chi si vede!'",
    "Cadi goffamente nella trappola che avevano preparato lungo il sentiero, una rete ti avvolge.",
    "Le tracce finiscono bruscamente in uno spazio aperto... troppo bruscamente. È una trappola!",
    "Ti rendi conto troppo tardi che le tracce erano un'esca per attirare viaggiatori ingenui.",
    "Senti il rumore metallico di armi che vengono caricate intorno a te... sei in trappola!",
    "Stavi seguendo loro, ma loro stavano aspettando te in silenzio dietro le rocce.",
    "Ti attirano abilmente in un vicolo cieco senza via d'uscita, bloccandoti l'unica ritirata.",
    "Le tracce erano fresche... troppo fresche. Senti una presenza alle tue spalle.",
    "Mentre segui le tracce, un allarme silenzioso avverte i predoni della tua presenza.",
    "Le impronte ti conducono a un falso rifugio dove i predoni ti aspettano.",
    "Segui le tracce fino a un punto panoramico... dove sei un bersaglio facile per i cecchini.",
    "Le tracce erano di una delle loro vittime, usate per attirare altri curiosi.",
    "Mentre sei concentrato sulle tracce, non noti la trappola sonora che scatta.",
    "Ti conducono in un'area piena di trappole esplosive improvvisate."
];
const esitiSeguiTracceOkNulla = [
    "Segui le tracce promettenti per un po', ma si perdono inspiegabilmente nel nulla.",
    "Le impronte finiscono bruscamente ai margini di un'area rocciosa, come se la persona fosse svanita.",
    "Il vento forte ha cancellato completamente le tracce più avanti, impossibile proseguire.",
    "Le tracce si confondono con decine di altre impronte, rendendo impossibile distinguerle.",
    "Finiscono vicino alla riva di un fiume impetuoso, probabilmente hanno attraversato o sono stati trascinati via.",
    "Si disperdono su un terreno roccioso e duro dove non lasciano più segni.",
    "Chiunque fosse, sapeva come nascondere molto bene le proprie tracce dopo un po'.",
    "Probabilmente si sono arrampicati su una parete rocciosa o... hanno volato via? Strano.",
    "Le tracce si interrompono senza una ragione apparente, lasciandoti perplesso.",
    "Un vicolo cieco narrativo. Tanta fatica per nulla.",
    "Le tracce portano a una recente frana che ha cancellato ogni segno successivo.",
    "Sembra che le tracce siano state deliberatamente cancellate o confuse.",
    "Le impronte svaniscono vicino a una zona di forte radioattività.",
    "Segui le tracce fino a un vicolo cieco di macerie impenetrabili.",
    "Il terreno cambia bruscamente (da fango a roccia) rendendo impossibile seguire oltre."
];
const esitiSeguiTracceKo = [
    "Non riesci a seguire le tracce confuse, si confondono e si sovrappongono troppo.",
    "Perdi il sentiero principale e ti ritrovi disorientato in un'area sconosciuta.",
    "Ti concentri troppo sulle tracce a terra e non noti un pericolo imminente davanti a te!",
    "Segui le tracce sbagliate per un'ora, perdendo tempo e risorse preziose.",
    "Le tracce ti portano involontariamente in un'area pericolosa (una palude tossica, un terreno instabile).",
    "Finisci per girare in tondo, tornando sui tuoi passi senza accorgertene.",
    "Ti stanchi mentalmente a cercare di decifrare segni quasi invisibili e contraddittori.",
    "Il sole cala rapidamente mentre cerchi ancora di capire dove diavolo siano andate le tracce.",
    "Una pioggia improvvisa inizia a cadere, cancellando ogni segno in pochi minuti.",
    "Sei frustrato, stanco e disorientato. Meglio lasciar perdere.",
    "Interpreti male un segno e finisci in un vicolo cieco.",
    "La luce scarsa rende impossibile distinguere le tracce correttamente.",
    "Ti distrai per un momento e perdi completamente il segno.",
    "Confondi le tracce che stavi seguendo con quelle di un animale selvatico.",
    "La fatica ti annebbia la vista e non riesci più a concentrarti sui dettagli."
];
// Esiti Villaggio Ostile
const descrizioniVillaggioOstile = [
    "Dalle tende lacere emergono figure silenziose e guardinghe, armi improvvisate strette nelle mani.",
    "Ti osservano immobili e in silenzio da dietro ripari improvvisati, con sospetto evidente negli occhi.",
    "Un uomo massiccio con una brutta cicatrice sul volto ti fa cenno di fermarti, la mano sull'arma.",
    "Non sembrano per niente amichevoli, l'aria è carica di tensione e ostilità.",
    "'Fermo lì, straniero! Non un passo di più!' intima una voce dura e roca da una feritoia.",
    "Le fragili porte dell'accampamento vengono sbarrate rumorosamente al tuo avvicinarsi.",
    "Ti puntano contro archi tesi, fucili arrugginiti e balestre improvvisate.",
    "Vedi bambini spaventati che vengono trascinati rapidamente al riparo nelle tende più sicure.",
    "L'atmosfera è incredibilmente tesa, carica di diffidenza e paura reciproca.",
    "Nessuno sorride. Nessuno ti dà il benvenuto. I loro volti sono maschere impenetrabili.",
    "Sembrano pronti a combattere fino alla morte per difendere quel poco che possiedono.",
    "Ti squadrano da capo a piedi, giudicando ogni tua mossa, ogni tuo respiro.",
    "Senti il click metallico di armi caricate provenire da diverse direzioni.",
    "Hanno cani da guardia mutati che ringhiano ferocemente al tuo avvicinarsi.",
    "Le loro barricate sono rinforzate con filo spinato e punte acuminate."
];
const esitiVillaggioOstileAllontanati = [
    "Ti allontani lentamente, senza mai dare loro le spalle completamente. Non ti seguono.",
    "Fai dietrofront con cautela, alzando le mani in segno di pace. Meglio non disturbare questo nido di vespe.",
    "Capiscono che non vuoi guai e non sei una minaccia immediata, e ti lasciano andare nell'indifferenza.",
    "Ti osservano attentamente finché non sei sufficientemente lontano, poi tornano alle loro miserabili faccende.",
    "Un sospiro di sollievo ti sfugge dalle labbra quando sei finalmente a distanza di sicurezza.",
    "Meglio cercare riparo o risorse altrove, questo posto è troppo pericoloso.",
    "Decidi saggiamente che la prudenza è la scelta migliore per sopravvivere un altro giorno.",
    "Eviti uno scontro inutile che ti sarebbe costato risorse preziose, forse la vita.",
    "Ti dilegui nell'ambiente circostante, confondendoti con le ombre e i detriti.",
    "Si assicurano solo che tu te ne vada davvero, senza tentare scherzi.",
    "Nessun problema, per ora. Ma senti ancora i loro occhi puntati sulla schiena.",
    "Ti senti osservato finché non svolti l'angolo o superi una collina.",
    "Ti lanciano un ultimo sguardo carico d'odio prima di tornare alle loro postazioni.",
    "Senti un senso di sconfitta, ma sai di aver fatto la scelta più saggia.",
    "Il silenzio che segue la tua ritirata è quasi assordante."
];
const esitiVillaggioOstileNegoziaOk = [
    "Dopo una tesa e difficile conversazione, ti permettono con riluttanza di passare, ma ti avvertono di non fermarti e non guardarti intorno.",
    "Riesci a convincerli, forse con un misto di pietà e fermezza, che sei solo di passaggio e non rappresenti una minaccia.",
    "Ti scambiano qualche parola diffidente e monosillabica, poi ti ignorano, tornando a scrutare l'orizzonte.",
    "Accettano un piccolo baratto (cibo, acqua, munizioni) per lasciarti attraversare il loro territorio senza problemi.",
    "Riconoscono un simbolo che porti o un nome che menzioni (forse di un alleato comune?) e ti lasciano passare con un cenno.",
    "Capiscono dalle tue parole o dal tuo aspetto che non sei uno dei 'Collezionisti' o dei 'Divoratori', i loro nemici giurati.",
    "Il loro capo, dopo averti scrutato intensamente negli occhi, fa un cenno quasi impercettibile ai suoi.",
    "Sembrano apprezzare la tua apparente onestà o la tua evidente mancanza di risorse che valga la pena rubare.",
    "Ti danno anche un avvertimento confuso ma sincero su pericoli specifici che troverai più avanti.",
    "La tensione nell'aria si allenta leggermente, anche se la diffidenza rimane palpabile.",
    "Ti permettono con sospetto di riempire la tua borraccia alla loro fonte comune prima di mandarti via bruscamente.",
    "Uno degli anziani del villaggio interviene, riconoscendo in te un viaggiatore e non una minaccia.",
    "Condividi informazioni su un percorso sicuro e in cambio ti lasciano passare.",
    "Offri aiuto per una piccola riparazione e guadagni la loro temporanea fiducia.",
    "Li convinci di essere portatore di notizie importanti da un altro insediamento."
];
const esitiVillaggioOstileNegoziaKo = [
    "I tuoi tentativi di diplomazia falliscono miseramente. Ti intimano di andartene immediatamente con minacce esplicite.",
    "'Non vogliamo estranei qui! Vattene subito o saranno guai seri per te!' ringhia il capo.",
    "Ti lanciano contro sassi o rifiuti per farti capire chiaramente che non sei il benvenuto.",
    "Le tue parole suonano false, melliflue o arroganti alle loro orecchie indurite dalla sofferenza.",
    "Ti accusano apertamente di essere una spia di una fazione nemica o un predone sotto mentite spoglie.",
    "Alzano le armi all'unisono, pronti a sparare al minimo movimento sospetto.",
    "Qui non c'è spazio per la negoziazione, solo per la sopravvivenza e la difesa del territorio.",
    "La loro ostilità aumenta visibilmente, senti il pericolo crescere.",
    "Ti spingono via rudemente con la forza, facendoti quasi cadere.",
    "'Ultimo avvertimento, verme! Sparisci!' urla uno di loro, sputando per terra.",
    "Ti deridono per la tua ingenuità nel pensare di poter parlare con loro.",
    "Capisci istintivamente che è ora di andartene, e anche di corsa, prima che sia troppo tardi.",
    "La tua offerta di baratto viene considerata un insulto e respinta con rabbia.",
    "Ti accusano di portare malattie o sfortuna al loro accampamento.",
    "Uno di loro spara un colpo di avvertimento molto vicino ai tuoi piedi."
];
// Esiti Pericolo Ambientale
const descrizioniPericoloAmbientaleAgilita = [
    "Il terreno friabile cede improvvisamente sotto i tuoi piedi! Stai per precipitare!",
    "Una vecchia trappola a scatto arrugginita ma ancora funzionante è nascosta perfettamente tra le foglie secche!",
    "Sfiori inavvertitamente un filo quasi invisibile teso ad altezza caviglia...",
    "Una lastra di pavimento dall'aspetto solido si inclina pericolosamente sotto il tuo peso!",
    "Una sezione marcia del soffitto crolla all'improvviso proprio sopra di te!",
    "Scivoli inaspettatamente su una macchia di liquido viscido e scuro sul pavimento.",
    "Un pesante oggetto metallico cade da uno scaffale pericolante sopra la tua testa!",
    "Metti il piede in fallo in una buca nascosta dai detriti, senti una torsione alla caviglia.",
    "Una porta arrugginita e pesante si stacca di netto dai cardini e ti cade addosso!",
    "Una serie di dardi avvelenati scatta silenziosamente da fessure nascoste in un muro!",
    "Sfiori dei cavi elettrici scoperti che sfrigolano minacciosamente al tuo passaggio.",
    "Il pavimento di legno marcio cede di schianto sotto di te, rivelando il vuoto sottostante.",
    "Un veicolo abbandonato scivola improvvisamente verso di te su un pendio.",
    "Una pila instabile di macerie inizia a franare nella tua direzione.",
    "Una trappola a rete scatta dal soffitto, pronta ad avvolgerti."
];
const descrizioniPericoloAmbientalePresagio = [
    "Una pioggia di piccoli detriti cade dall'alto, preannunciando un crollo imminente!",
    "Senti uno scricchiolio sinistro e prolungato provenire da una struttura pericolante sopra di te.",
    "Un forte e nauseante odore di gas ti avverte di una perdita pericolosa nelle vicinanze.",
    "Hai la strana e fortissima sensazione di essere osservato... un attimo dopo una freccia scocca da un muro!",
    "Un ronzio elettrico crescente indica un accumulo di energia pericoloso da qualche parte qui vicino.",
    "Noti all'ultimo secondo delle crepe sospette e profonde nel terreno proprio davanti ai tuoi piedi.",
    "L'aria diventa improvvisamente pesante e difficile da respirare, quasi irrespirabile.",
    "Senti il terreno vibrare leggermente sotto i tuoi piedi, come prima di un terremoto.",
    "Un lampo di luce accecante ti costringe a chiudere gli occhi, seguito un istante dopo da un rumore assordante.",
    "Vedi uno strano luccichio innaturale sul pavimento davanti a te... una trappola energetica?",
    "Un odore dolciastro e stucchevole ti avverte della presenza di spore fungine velenose nell'aria.",
    "Hai la pelle d'oca e un brivido freddo lungo la schiena senza un motivo apparent... l'istinto ti urla di fermarti.",
    "Un silenzio innaturale cala all'improvviso, come se l'aria stessa trattenesse il respiro.",
    "Vedi delle deboli fluttuazioni nell'aria davanti a te, come un disturbo invisibile.",
    "Senti un cambiamento improvviso della temperatura, un freddo innaturale o un caldo soffocante."
];
const esitiPericoloAmbientaleEvitato = [
    "Riesci a evitare il peggio per un soffio grazie ai tuoi riflessi pronti e allenati!",
    "Il tuo istinto di sopravvivenza ti salva all'ultimo secondo, facendoti balzare via!",
    "Balzi indietro o di lato appena in tempo, sentendo il vento del pericolo sfiorarti!",
    "Ti fermi giusto un attimo prima di finire nella trappola o sotto il crollo!",
    "Schivi l'ostacolo o il proiettile con un'agilità che non pensavi di possedere!",
    "Ti appiattisci istintivamente a terra mentre il pericolo passa innocuo sopra di te!",
    "Riesci a stabilizzare la struttura pericolante o a disinnescare la trappola prima che sia troppo tardi!",
    "Interrompi il meccanismo della trappola tagliando un filo o bloccando un ingranaggio!",
    "La tua prontezza di spirito e la tua lucidità ti salvano la vita ancora una volta!",
    "Un movimento fulmineo e quasi inconscio ti porta fuori dalla traiettoria del pericolo!",
    "Ti accorgi del pericolo nascosto grazie a un dettaglio quasi impercettibile!",
    "Eviti il disastro per un soffio, il cuore che batte all'impazzata nel petto.",
    "Rotoli via all'ultimo istante, evitando l'impatto.",
    "Riesci a deviare l'oggetto pericoloso con un calcio o una spinta.",
    "Ti aggrappi a una sporgenza, evitando la caduta."
];
const esitiPericoloAmbientaleColpito = [
    "Non sei abbastanza veloce o attento! Vieni colpito in pieno dal pericolo!",
    "La trappola scatta con uno schiocco sinistro, ferendoti dolorosamente.",
    "Vieni travolto dai detriti pesanti, che ti seppelliscono parzialmente o ti feriscono.",
    "Una fitta di dolore acuto ti attraversa la gamba o il braccio, senti qualcosa rompersi.",
    "Cadi rovinosamente a terra, battendo la testa e perdendo l'orientamento.",
    "Vieni ferito da schegge di metallo, vetro o roccia che si conficcano nella pelle.",
    "Il gas tossico ti stordisce, facendoti barcollare e sentire la nausea.",
    "Prendi una forte scossa elettrica che ti paralizza temporaneamente e ti brucia.",
    "Il pavimento cede e precipiti per qualche metro, atterrando malamente.",
    "Vieni colpito da un dardo avvelenato, senti il veleno bruciare nelle vene.",
    "La caduta ti lascia senza fiato e con diverse contusioni dolorose.",
    "Urli involontariamente di dolore, attirando potenziali attenzioni indesiderate.",
    "Vieni investito da un'ondata di calore o freddo intenso.",
    "Una sostanza corrosiva ti schizza addosso, bruciando la pelle e l'equipaggiamento.",
    "Vieni avvolto da una rete o immobilizzato da una trappola adesiva."
];
// Esiti Dilemma Morale
const descrizioniDilemmaMorale = [
    "Senti delle grida soffocate e dei rumori di lotta provenire da un edificio vicino. Qualcuno è in pericolo.",
    "Vedi del fumo nero alzarsi da dietro una collina, accompagnato da rumori distinti di spari e urla.",
    "Una figura corre disperatamente verso di te, inseguita da altre tre figure armate e minacciose.",
    "Trovi una cassa metallica chiusa ermeticamente con uno strano simbolo inciso sopra, sembra importante e forse pericolosa.",
    "Un bambino piccolo piange disperatamente da solo in mezzo a una strada disseminata di cadaveri.",
    "Vedi qualcuno intrappolato sotto delle macerie pesanti, ancora vivo e cosciente, che ti supplica di aiutarlo.",
    "Un gruppo di persone dall'aspetto brutale sta linciando pubblicamente un individuo legato e imbavagliato.",
    "Trovi delle scorte ben nascoste e chiaramente appartenenti a qualcun altro, ma sembrano abbandonate da tempo.",
    "Qualcuno ti offre aiuto o informazioni in cambio di qualcosa, ma ha un aspetto losco e inaffidabile.",
    "Devi scegliere se usare le tue ultime medicine per curare una tua ferita o per salvare la vita a uno sconosciuto gravemente ferito.",
    "Scopri un segreto (una fonte d'acqua nascosta, un passaggio sicuro) che potrebbe mettere in pericolo un intero accampamento se rivelato.",
    "Trovi un prigioniero legato e lasciato a morire di fame e sete in una cantina buia.",
    "Un mercante ti offre un oggetto potente ma chiaramente rubato a qualcuno che ne aveva bisogno.",
    "Vedi una pattuglia di una fazione ostile maltrattare dei civili inermi.",
    "Trovi una mappa che conduce a un'oasi sicura, ma sai che seguirla potrebbe attirare lì dei pericoli."
];
const esitiDilemmaMoraleIndagaOkPositivo = [
    "Intervieni con coraggio e riesci a salvare un innocente dai suoi aggressori. Ti ringrazia in lacrime offrendoti delle preziose provviste.",
    "Segui il fumo e trovi i resti di uno scontro a fuoco. Trovi armi, munizioni e loot utile tra i caduti di entrambe le parti.",
    "Aiuti la figura inseguita a nascondersi o a depistare i suoi inseguitori. Era un mercante che ti ricompensa generosamente.",
    "Con grande sforzo, riesci a liberare la persona intrappolata dalle macerie, che per gratitudine ti indica una scorciatoia o un nascondiglio.",
    "Riesci a calmare la folla inferocita o a dimostrare l'innocenza dell'accusato, salvandolo dal linciaggio. Guadagni rispetto (o timore).",
    "Conforti il bambino spaventato e lo porti in un luogo relativamente sicuro, trovando una ricompensa lasciata lì dai genitori nella speranza che qualcuno lo trovasse.",
    "Il prigioniero che liberi, sebbene malconcio, conosce la posizione di un vecchio nascondiglio pre-collasso pieno di risorse.",
    "Interrompi il sabotaggio alle difese del rifugio e vieni ricompensato dagli abitanti riconoscenti con cibo, acqua e un posto sicuro per la notte.",
    "La tua buona azione viene notata da osservatori nascosti (una fazione benevola?) che ti lasciano un dono anonimo lungo il cammino.",
    "Salvi la persona ferita usando le tue medicine, e più tardi, una volta ripresasi, ti ripaga con interessi, magari unendosi a te.",
    "La cassa contiene risorse preziose (medicine, componenti) e informazioni vitali su un pericolo imminente.",
    "Riesci a distrarre la pattuglia ostile, permettendo ai civili di fuggire.",
    "L'individuo sospetto si rivela essere un informatore con dati cruciali.",
    "Le scorte abbandonate contengono un oggetto unico o un pezzo di tecnologia utile.",
    "Il segreto che scopri può essere usato a tuo vantaggio senza mettere in pericolo diretto l'accampamento."
];
const esitiDilemmaMoraleIndagaOkNegativo = [
    "Arrivi troppo tardi. Le grida sono cessate. Trovi solo cadaveri e il silenzio della morte.",
    "Le grida e il fumo erano una trappola ben orchestrata! I predoni ti stavano aspettando e ti attaccano.",
    "L'inseguito era in realtà un ladro o un assassino pericoloso, e i suoi inseguitori (magari giustizieri) ora se la prendono con te per averlo aiutato.",
    "Cerchi di aiutare la persona intrappolata, ma la situazione degenera (crollo, attacco nemico) e vieni coinvolto tuo malgrado nello scontro o nel disastro.",
    "La persona che salvi dal linciaggio si rivela essere un individuo spregevole o un traditore che ti pugnalerà alle spalle alla prima occasione.",
    "Il bambino che aiuti, spaventato e confuso, ti conduce involontariamente in una trappola o verso un pericolo nascosto.",
    "La folla inferocita si rivolta contro di te per esserti intromesso nei loro 'affari', considerandoti una minaccia.",
    "La cassa è protetta da una trappola sofisticata (esplosiva, chimica, biologica) che scatta appena cerchi di aprirla.",
    "Le macerie sono troppo pesanti o instabili, non riesci a liberare la persona intrappolata in tempo e assisti impotente alla sua morte.",
    "Il prigioniero che liberi, una volta recuperate le forze, ti deruba mentre dormi e fugge.",
    "Vieni scoperto mentre indaghi sul sabotaggio e vieni accusato ingiustamente di esserne il responsabile.",
    "L'individuo losco ti tradisce dopo averti dato informazioni false.",
    "Le scorte abbandonate erano state lasciate come esca per una trappola.",
    "Il tuo intervento contro la pattuglia provoca ritorsioni peggiori sui civili più tardi.",
    "La mappa per l'oasi era una trappola per attirare viaggiatori in un'imboscata."
];
const esitiDilemmaMoraleIndagaKo = [ // Fallimento check Presagio
    "Cerchi di intervenire ma sottovaluti completamente la situazione e vieni ferito gravemente o catturato.",
    "Non riesci a trovare la fonte esatta delle grida o del fumo in tempo, vagando inutilmente tra le rovine.",
    "Il tuo tentativo maldestro di aiuto peggiora solo le cose, causando più danni o mettendo in pericolo più persone.",
    "Vieni sopraffatto dagli eventi, troppo complessi o violenti per essere gestiti da una sola persona.",
    "Non capisci appieno cosa stia succedendo e prendi la decisione sbagliata, con conseguenze tragiche.",
    "Esiti troppo a lungo, combattuto tra prudenza ed empatia, e l'opportunità (o la tragedia) si conclude senza il tuo intervento.",
    "Il tuo intervento, seppur ben intenzionato, provoca una catena di eventi imprevisti e negativi.",
    "Ti perdi nel labirinto delle rovine cercando di capire da dove provenissero i rumori di lotta.",
    "Ti rendi conto di non avere le risorse, le abilità o le forze necessarie per fare davvero la differenza in questa situazione.",
    "Ti ritiri confuso, frustrato e con un forte senso di impotenza.",
    "Le tue azioni, per quanto nobili, hanno conseguenze impreviste e negative per te o per altri innocenti.",
    "Vieni scoperto mentre cerchi di indagare e sei costretto a fuggire.",
    "Interpreti male la situazione e aiuti la parte sbagliata.",
    "Il tuo tentativo di mediazione fallisce, scatenando uno scontro peggiore.",
    "Non riesci ad aprire la cassa o a liberare il prigioniero a causa di un ostacolo imprevisto."
];
const esitiDilemmaMoraleIgnora = [
    "Decidi freddamente che non sono affari tuoi e prosegui per la tua strada senza voltarti.",
    "La tua sopravvivenza viene prima di tutto. Tiri dritto, ignorando le grida o il fumo.",
    "Volti le spalle al pericolo o alla sofferenza altrui, sentendo un peso gelido sulla coscienza.",
    "Meglio non farsi coinvolgere in problemi altrui. Hai già abbastanza guai per conto tuo.",
    "Fingi abilmente di non aver visto né sentito nulla, mantenendo un'espressione impassibile.",
    "Accelera il passo, cercando disperatamente di lasciarti alle spalle ciò che hai appena visto o sentito.",
    "Chiudi gli occhi per un istante e continui a camminare, cercando di cancellare l'immagine dalla mente.",
    "Non puoi salvare tutti in questo mondo distrutto. È una lezione crudele ma necessaria.",
    "Spegni volontariamente la tua empatia per un momento, concentrandoti solo sul tuo obiettivo.",
    "Un'altra tragedia silenziosa in un mondo pieno di tragedie urlate. Continui il tuo viaggio.",
    "Forse hai fatto la scelta giusta per la tua sopravvivenza, forse no. Non lo saprai mai con certezza.",
    "Il silenzio che segue le grida o il rumore dello scontro sembra pesante e accusatorio.",
    "Ti chiedi brevemente se avresti potuto fare qualcosa, poi scacci il pensiero come inutile.",
    "Prosegui per la tua strada, ma l'immagine o il suono ti rimangono impressi nella mente a lungo.",
    "Senti un brivido lungo la schiena, come se qualcosa ti avesse visto ignorare la scena."
];
// Esiti Evento Rifugio (Ispezione)
const descrizioniRifugioStrano = [
    "Mentre cerchi di riposare, noti una sezione del muro che sembra leggermente diversa dalle altre, forse intonaco più recente?",
    "C'è un piccolo contenitore metallico arrugginito, ma stranamente pesante, nascosto sotto un telo logoro in un angolo.",
    "Un simbolo familiare, forse visto su vecchie mappe o graffiti, è inciso rozzamente sul pavimento polveroso.",
    "Una mattonella del pavimento sembra leggermente smossa rispetto alle altre, come se fosse stata sollevata di recente.",
    "Noti un piccolo interruttore quasi invisibile, nascosto dietro una tubatura gocciolante sul muro.",
    "C'è qualcosa scritto con la polvere spessa sotto il giaciglio improvvisato... un messaggio?",
    "Una delle lamiere che compongono la parete sembra fissata in modo diverso, quasi come uno sportello.",
    "Vedi un piccolo foro nel muro, troppo regolare per essere casuale, da cui spira una corrente d'aria.",
    "Una parte del pavimento suona vuota quando la calpesti.",
    "Noti uno strano schema di graffi vicino a una crepa nel muro.",
    "Un vecchio libro lasciato aperto su una pagina specifica attira la tua attenzione.",
    "C'è un odore particolare proveniente da dietro un cumulo di macerie.",
    "Una luce fioca filtra da sotto una porta apparentemente bloccata.",
    "Vedi un cavo elettrico che scompare dietro un pannello metallico.",
    "Trovi una chiave arrugginita appesa a un chiodo nascosto."
];
const esitiRifugioIspezionaOkLoot = [
    "Rimuovendo con cautela la sezione del muro scopri un piccolo vano segreto con del cibo in scatola extra!",
    "Il pesante contenitore metallico, una volta forzato, rivela delle preziose munizioni o componenti elettronici utili!",
    "Sollevando la mattonella smossa trovi una piccola scorta di acqua purificata e delle pillole energetiche.",
    "Azionando l'interruttore nascosto si apre un piccolo scomparto nel muro contenente bende pulite e antisettico.",
    "Dietro la lamiera mobile trovi una manciata di cibo in scatola ben conservato e qualche barretta energetica.",
    "Qualcuno ha nascosto qui delle batterie quasi cariche e del filo di rame, utili per riparazioni.",
    "Scopri un piccolo kit di pronto soccorso quasi completo, una vera manna dal cielo.",
    "Nel foro nel muro trovi arrotolato un piccolo pacchetto impermeabile con fiammiferi e acciarino.",
    "Sotto il pavimento cavo trovi una piccola scorta di carburante.",
    "Il libro indica la posizione di un piccolo deposito di scorte nelle vicinanze.",
    "Dietro le macerie trovi un generatore portatile quasi funzionante.",
    "La porta bloccata nasconde una piccola armeria improvvisata.",
    "Il pannello metallico nasconde componenti elettronici rari.",
    "La chiave apre una cassa nascosta contenente cibo e acqua.",
    "Il messaggio nella polvere indica dove cercare delle scorte sepolte."
];
const esitiRifugioIspezionaOkLore = [
    "Il simbolo inciso sul pavimento è collegato a una fazione di cui hai sentito parlare nelle leggende... i 'Guardiani della Fiamma'?",
    "Trovi un messaggio logoro lasciato da un precedente occupante, avverte di 'ombre che si muovono di notte' nella zona.",
    "Dietro il muro c'è un vecchio terminale di comunicazione, danneggiato ma forse riparabile... se trovassi i pezzi giusti.",
    "La scritta sotto il giaciglio è una coordinata geografica o un codice numerico apparentemente senza senso... per ora.",
    "Trovi una vecchia mappa militare strappata che indica chiaramente la posizione di un bunker o un deposito nelle vicinanze.",
    "Scopri un diario personale che racconta la tragica storia di chi viveva e moriva in questo rifugio prima di te.",
    "Il simbolo inciso è la chiave per decifrare un messaggio criptico che avevi trovato in precedenza!",
    "Dall'altra parte del foro nel muro senti delle voci sommesse o musica... c'è qualcun altro qui vicino?",
    "I graffi sul muro formano una mappa rudimentale di tunnel sotterranei.",
    "Il libro contiene annotazioni che rivelano un segreto sulla 'Guerra Inespressa'.",
    "L'odore particolare proviene da un esperimento scientifico fallito.",
    "La luce fioca proviene da un terminale ancora funzionante con log parziali.",
    "Il cavo alimenta un dispositivo sconosciuto che sembra monitorare qualcosa.",
    "La chiave apparteneva a un membro di una fazione sconosciuta.",
    "Il messaggio nella polvere è un avvertimento su una minaccia imminente."
];
const esitiRifugioIspezionaKoTrappola = [
    "Era una trappola! Rimuovendo il muro una piccola carica esplode investendoti di schegge!",
    "Il contenitore era protetto da un meccanismo a scatto con un ago avvelenato che ti ferisce la mano!",
    "Mentre ispezioni il soffitto sopra il giaciglio, qualcosa di pesante cade dall'alto colpendoti alla testa!",
    "La mattonella smossa nascondeva una trappola a pressione che rilascia gas tossico!",
    "Azionando l'interruttore sbagliato si attiva una sirena assordante che attirerà sicuramente attenzioni indesiderate!",
    "Vieni punto da un ago nascosto nel meccanismo di apertura della lamiera, senti un formicolio preoccupante.",
    "Una potente scarica elettrica ti attraversa il braccio mentre cerchi di forzare il contenitore.",
    "Il foro nel muro nascondeva un piccolo dardo che ti colpisce al collo!",
    "Il pavimento cavo cede, facendoti cadere in una fossa con punte acuminate.",
    "I graffi sul muro erano un avvertimento per una trappola sonora che attira creature ostili.",
    "Il libro è collegato a una trappola esplosiva che si attiva quando lo sposti.",
    "L'odore proviene da una sostanza chimica corrosiva che ti danneggia i polmoni.",
    "La porta bloccata è protetta da una scarica elettrica.",
    "Il pannello metallico nasconde cavi scoperti che ti fulminano.",
    "La chiave è collegata a un meccanismo che fa crollare parte del rifugio."
];
const esitiRifugioIspezionaKoNulla = [
    "È solo una strana macchia sul muro, forse umidità o ruggine, senza alcun significato nascosto.",
    "Il contenitore metallico è completamente vuoto, arrugginito e inutile.",
    "Il simbolo inciso sul pavimento non sembra significare assolutamente nulla di importante o riconoscibile.",
    "La mattonella è solo smossa a causa del terreno cedevole, non nasconde nulla sotto.",
    "L'interruttore è rotto o collegato a nulla, non produce alcun effetto.",
    "La scritta sotto il giaciglio è completamente illeggibile, cancellata dal tempo e dalla polvere.",
    "Era solo la tua immaginazione o la speranza a farti vedere qualcosa di strano. Non c'è niente.",
    "Dopo un'attenta ispezione, concludi che non c'è nulla di nascosto o di valore qui.",
    "Il pavimento suona vuoto ma è solo un'illusione acustica.",
    "I graffi sul muro sembrano casuali e privi di significato.",
    "Il libro è solo un vecchio romanzo senza valore.",
    "L'odore proviene da semplice muffa o decomposizione innocua.",
    "La porta è effettivamente bloccata e non riesci ad aprirla.",
    "Il pannello metallico copre solo tubature vuote.",
    "La chiave non apre nessuna serratura apparente nel rifugio."
];
const esitiRifugioLasciaPerdere = [ // Scelta 'Lascia perdere' nell'ispezione rifugio
    "Meglio non rischiare per nulla. Ti concentri sul riposo necessario o ti prepari a ripartire.",
    "La curiosità ha ucciso il gatto, e in questo mondo uccide anche gli umani. Decidi di lasciar stare.",
    "Ignori il dettaglio sospetto e ti prepari a ripartire. La sopravvivenza richiede pragmatismo.",
    "Decidi che la prudenza è la migliore compagna di viaggio in queste terre desolate.",
    "Non hai un buon presentimento riguardo a quella cosa. Meglio concentrarsi sull'essenziale.",
    "Forse era qualcosa di importante, forse una trappola mortale. Non lo scoprirai mai.",
    "Ti limiti a osservare senza toccare nulla, memorizzando il dettaglio per il futuro, forse.",
    "Valuti che il rischio potenziale supera il possibile beneficio. Lasci perdere.",
    "Il tuo istinto ti dice che è meglio non disturbare ciò che è nascosto.",
    "Risparmi tempo ed energie decidendo di non indagare oltre.",
    "Ti concentri sulla mappa e sul prossimo obiettivo, ignorando le distrazioni.",
    "Senti che frugare potrebbe attirare attenzioni indesiderate.",
    "Decidi che non vale la pena danneggiare ulteriormente il rifugio per una possibile ricompensa.",
    "Sei troppo stanco per metterti a cercare segreti.",
    "Hai la sensazione che chi ha nascosto qualcosa qui lo abbia fatto per una buona ragione."
];
// Esiti Eventi Notturni Specifici
const descrizioniPredoniNotturni = [ // Non attualmente usati specificamente, ma potrebbero
    "Figure silenziose emergono dall'oscurità più profonda come spettri affamati.",
    "Approfittano della copertura del buio per tenderti un'imboscata silenziosa e letale.",
    "Senti il loro respiro affannoso e l'odore acre di sporco prima ancora di riuscire a vederli distintamente.",
    "Passi furtivi e silenziosi ti circondano nell'oscurità opprimente, sei in trappola.",
    "Occhi animaleschi brillano brevemente nel buio ai margini della tua vista.",
    "Ti aspettavano pazientemente nell'ombra più fitta, conoscendo i movimenti delle prede notturne.",
    "Il buio li rende più audaci, più crudeli, meno umani.",
    "Sembrano spettri vendicativi che emergono dalla notte per reclamare la tua vita.",
    "Un'imboscata ben pianificata e silenziosa, sei caduto nella loro trappola.",
    "Il freddo pungente della notte e la loro presenza minacciosa ti gelano il sangue nelle vene.",
    "Si muovono con una coordinazione inquietante nel buio, come un branco di predatori.",
    "Usano fischi bassi e gutturali per comunicare tra loro senza farsi scoprire.",
    "Le loro armi sono state modificate per essere più silenziose e letali di notte.",
    "Portano maschere grottesche fatte di ossa e metallo, illuminate solo dalla luna.",
    "Hanno occhi adattati all'oscurità, che brillano di una luce innaturale."
];
const descrizioniAnimaleNotturno = [
    "Due occhi rossi e luminosi ti fissano immobili dal buio pesto, senza palpebre.",
    "Un ringhio basso e gutturale proviene da un cespuglio oscuro proprio accanto a te.",
    "Una creatura rapida, silenziosa e dalle forme innaturali ti si avvicina strisciando nell'ombra.",
    "L'odore forte e muschiato di un predatore notturno è intenso nell'aria fredda e immobile.",
    "Senti degli artigli affilati grattare sulla pietra o sul metallo molto vicino a te.",
    "Un'ombra più scura delle altre si muove rapidamente ai margini della tua visione periferica.",
    "Il silenzio assoluto della notte è rotto improvvisamente da un verso agghiacciante e disumano.",
    "Qualcosa di grosso e pesante si muove furtivamente tra gli alberi o le rovine vicine.",
    "La creatura sembra quasi fatta d'ombra, fondendosi perfettamente con l'oscurità circostante.",
    "Istintivamente sai di essere diventato la preda, braccato da qualcosa di antico e affamato.",
    "Vedi il profilo di una creatura alata stagliarsi contro la luna.",
    "Una luminescenza biochimica debole e sinistra emana dalla creatura nell'oscurità.",
    "Senti il terreno vibrare leggermente al suo passaggio pesante e silenzioso.",
    "La sua presenza sembra assorbire la poca luce disponibile, rendendo il buio ancora più fitto.",
    "Un odore di ozono e carne bruciata accompagna l'avvicinarsi della creatura."
];
const descrizioniPericoloAmbientaleNotturno = [
    "Inciampi violentemente in qualcosa di duro e invisibile che non riesci a vedere nell'oscurità.",
    "Il terreno, già instabile di giorno, è ancora più traditore e pericoloso al buio.",
    "Una struttura pericolante sopra di te geme sinistramente sotto una raffica di vento improvvisa.",
    "Sfiori una trappola a filo o a pressione perfettamente nascosta nell'oscurità del sentiero.",
    "Metti un piede in fallo sul bordo di un precipizio o di una voragine che non avevi notato.",
    "L'oscurità totale nasconde voragini improvvise, ostacoli aguzzi e pericoli invisibili.",
    "Una raffica di vento gelido fa cadere detriti pesanti da un edificio pericolante vicino a te.",
    "Senti un forte odore di gas o di sostanze chimiche, ma non riesci a capire da dove provenga nel buio.",
    "Passi vicino a qualcosa che emette uno strano calore o una debole luminescenza tossica.",
    "Il buio profondo ti disorienta completamente, facendoti perdere il senso della direzione.",
    "Una pozza di liquido scuro e denso riflette la luna in modo ingannevole, nascondendo la sua profondità.",
    "Cavi elettrici scoperti pendono come liane invisibili nell'oscurità.",
    "Il silenzio amplifica il rumore di una struttura che sta per cedere nelle vicinanze.",
    "Passi attraverso uno sciame di insetti notturni quasi invisibili ma irritanti o velenosi.",
    "Una fitta nebbia notturna riduce la visibilità a zero, nascondendo ogni pericolo."
];
const descrizioniOrroreIndicibile = [
    "Un senso di oppressione innaturale e gelido ti attanaglia il petto, rendendo difficile respirare.",
    "Senti distintamente una presenza maligna e antica osservarti da ogni angolo buio.",
    "Ombre familiari danzano e si contorcono in modo innaturale ai margini della tua vista.",
    "Un sussurro gelido e disumano ti sfiora l'orecchio, pronunciando parole in una lingua morta.",
    "L'aria intorno a te diventa improvvisamente gelida, il tuo fiato si condensa visibilmente.",
    "Cominci a vedere cose che non dovrebbero essere lì: figure distorte, volti nelle ombre.",
    "Un senso di terrore primordiale e irrazionale ti attanaglia, minacciando di farti impazzire.",
    "La tua stessa mente inizia a giocarti brutti scherzi, confondendo realtà e allucinazione.",
    "Il mondo intorno a te sembra distorcersi e pulsare per un terribile momento.",
    "Senti delle voci insistenti nella tua testa, che ti ordinano di fare cose orribili.",
    "La luna sembra sanguinare o avere un volto distorto che ti fissa.",
    "Avverti il tocco freddo e immateriale di dita invisibili sulla pelle.",
    "Il tempo sembra rallentare o accelerare in modo innaturale intorno a te.",
    "Le tue paure più profonde prendono forma nelle ombre circostanti.",
    "Un odore nauseante di tomba e follia riempie l'aria improvvisamente."
];
const esitiOrroreIndicibileFugaOk = [
    "Scappi a gambe levate urlando, il terrore puro ti mette le ali ai piedi e semini la presenza.",
    "Ti nascondi tremando come una foglia in un anfratto buio finché la sensazione opprimente non svanisce lentamente.",
    "Chiudi gli occhi stringendoli forte e preghi qualunque divinità dimenticata, e quando li riapri... sei di nuovo solo.",
    "Corri senza voltarti, senza pensare, finché i polmoni non ti bruciano e non senti più quella presenza alle calcagna.",
    "Trovi un piccolo anfratto sicuro e ti rannicchi lì in posizione fetale finché l'orrore indicibile non passa.",
    "Reciti a memoria una vecchia filastrocca infantile o una formula senza senso per calmarti, e incredibilmente funziona.",
    "La fuga disperata ti porta in un luogo inaspettatamente sicuro o illuminato, dove l'orrore non osa entrare.",
    "Riesci a raggiungere un'area aperta e illuminata dalla luna piena, e la sensazione terrificante si attenua gradualmente.",
    "Ti getti in un fiume o in una pozza d'acqua gelida, e lo shock sembra scacciare la presenza.",
    "Corri verso una fonte di luce (un fuoco lontano, un lampo) che sembra respingere l'orrore.",
    "Trovi un vecchio simbolo protettivo inciso su una pietra e ti rifugi vicino ad esso.",
    "Urli con tutta la forza che hai nei polmoni, e il suono sembra rompere l'incantesimo oscuro.",
    "Sali su un punto elevato, e la sensazione di oppressione diminuisce.",
    "Ti concentri su un compito manuale complesso (riparare qualcosa, leggere una mappa), e questo ti aiuta a ignorare l'orrore.",
    "Segui un animale che sembra non essere influenzato dalla presenza, trovando una via d'uscita."
];
const esitiOrroreIndicibileFugaKo = [
    "La paura assoluta ti paralizza completamente, incapace di muovere un muscolo o gridare.",
    "Non riesci a sfuggire alla sensazione opprimente che ti segue come un'ombra, ovunque tu vada.",
    "Qualcosa di freddo, umido e innaturale ti tocca sulla spalla... Perdi lucidità e controllo.",
    "Inciampi e cadi mentre fuggi, e l'orrore informe ti sovrasta nel buio.",
    "Corri alla cieca nella notte e ti schianti violentemente contro un ostacolo invisibile.",
    "La tua mente è sopraffatta dal panico puro, incapace di pensare lucidamente o reagire.",
    "Non importa quanto corri veloce o lontano, la sensazione gelida ti rimane attaccata addosso.",
    "Senti le forze vitali abbandonarti rapidamente, risucchiate dalla presenza maligna.",
    "Le tue gambe si rifiutano di muoversi, pesanti come piombo.",
    "Sei costretto a rivivere i tuoi peggiori incubi mentre cerchi di fuggire.",
    "L'orrore ti circonda, chiudendo ogni via di fuga fisica e mentale.",
    "Perdi il senso dell'orientamento e corri in tondo, tornando sempre al punto di partenza.",
    "La tua torcia si spegne improvvisamente, lasciandoti nell'oscurità totale con la presenza.",
    "Cadi in ginocchio piangendo e urlando, completamente incapace di reagire o difenderti.",
    "Senti l'orrore insinuarsi nella tua mente, sussurrandoti segreti indicibili."
];
const esitiOrroreIndicibileAffrontaOk = [
    "Stringi i denti e resisti all'ondata di terrore puro con tutta la tua forza di volontà. Lentamente, la presenza si ritira.",
    "Urli la tua sfida rabbiosa e disperata nell'oscurità, e il silenzio innaturale che segue è quasi peggiore... ma sei ancora vivo e integro.",
    "Accendi una luce improvvisa e potente (torcia, fiammifero), e l'orrore informe rifugge dalla luce come un vampiro.",
    "Ti concentri con forza su un ricordo felice e potente del passato, e riesci a respingere l'influenza mentale oscura.",
    "Affronti la paura guardandola dritta negli occhi (metaforicamente) e scopri che era solo un'illusione della tua mente... o quasi.",
    "La tua determinazione a sopravvivere e la tua forza di volontà hanno la meglio sull'oscurità intangibile. Sei più forte di quanto pensassi.",
    "Riesci a mantenere la calma e a controllare il respiro, e lentamente la presenza si dissolve come nebbia al sole.",
    "Recuperi il pieno controllo della tua mente e del tuo corpo, scacciando le visioni e i sussurri.",
    "Trovi un oggetto (un talismano, un simbolo religioso) che sembra avere potere contro la presenza.",
    "Pronunci parole di potere o una vecchia preghiera dimenticata che sembrano respingere l'orrore.",
    "Canalizzi la tua rabbia e la tua disperazione in una forza interiore che scaccia la paura.",
    "Riesci a identificare la fonte dell'orrore (un oggetto, un luogo) e a neutralizzarla o evitarla.",
    "La tua mente trova un'inaspettata lucidità nel caos, permettendoti di vedere oltre le illusioni.",
    "Affronti l'oscurità con una risata folle e sprezzante, e questo sembra confondere la presenza.",
    "Ti concentri sul tuo obiettivo finale, e questa determinazione ti ancora alla realtà."
];
const esitiOrroreIndicibileAffrontaKo = [
    "Il tuo coraggio, per quanto grande, vacilla e si spezza di fronte all'orrore assoluto e all'ignoto.",
    "Vieni sopraffatto da visioni terrificanti e personali che ti fanno dubitare della tua stessa sanità.",
    "Senti la tua sanità mentale scivolare via inesorabilmente, sostituita da follia e disperazione...",
    "Urli finché non hai più voce, ma non serve a nulla contro un'orrore che non ha orecchie.",
    "L'orrore indicibile ti consuma dall'interno, lasciandoti un guscio vuoto e tremante.",
    "Cadi in ginocchio piangendo e urlando, completamente incapace di reagire o difenderti.",
    "La tua mente si spezza sotto la pressione insopportabile dell'orrore cosmico.",
    "Perdi conoscenza, sopraffatto. Ti risvegli ore dopo, debole, confuso e con un pezzo di te mancante.",
    "La presenza ti mostra verità indicibili che la tua mente non può sopportare.",
    "Vieni marcato fisicamente o mentalmente dall'incontro con l'orrore.",
    "Le tue paure più profonde si manifestano e ti attaccano.",
    "Perdi temporaneamente la memoria o la capacità di parlare.",
    "Sviluppi una fobia o una paranoia permanente legata all'incontro.",
    "L'orrore ti lascia andare, ma sai che tornerà a cercarti.",
    "Vieni posseduto temporaneamente da un'entità oscura."
];

// ... Aggiungere altri array di testo qui se necessario ...

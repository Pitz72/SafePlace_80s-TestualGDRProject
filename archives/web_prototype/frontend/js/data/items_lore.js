/**
 * THE SAFE PLACE - OGGETTI LORE
 * v1.0.0 "Ultimo's Journey"
 * 
 * Oggetti speciali che raccontano la storia del mondo e di Ultimo
 */

const LORE_ITEMS = {
    // Oggetti personali di Ultimo e la sua famiglia
    "carillon_of_lena": {
        name: "Carillon di Lena",
        nameShort: "Carillon",
        description: "Un piccolo carillon di ottone con incisa una melodia. Apparteneva a tua madre Lena. Quando lo apri, suona 'Clair de Lune' con note malinconiche e dolci. Sul fondo c'è scritto: 'Per il mio piccolo Ultimo, che la musica ti guidi sempre - Mamma'",
        type: "lore",
        rarity: "legendary",
        stackable: false,
        effects: [
            {
                type: "morale_boost",
                description: "Ascoltare la melodia ti ricorda tempi migliori",
                bonus: { carisma: 2, resistenza_mentale: 3 }
            }
        ],
        loreText: "Tua madre cantava questa melodia ogni sera prima che il mondo finisse.",
        specialInteraction: true
    },
    
    "marcus_final_recording": {
        name: "Registrazione Finale di Marcus",
        nameShort: "Audiocassetta",
        description: "Un'audiocassetta consumata con l'etichetta 'Per Ultimo'. La voce di tuo padre è debole ma determinata: 'Figlio mio, se stai ascoltando questo, significa che ho fallito. Ma tu... tu puoi ancora farcela. Il Safe Place è reale. Segui sempre il sole che sorge.'",
        type: "lore",
        rarity: "legendary",
        stackable: false,
        effects: [
            {
                type: "reveal_location",
                description: "Contiene indizi sulla posizione del Safe Place"
            }
        ],
        loreText: "L'ultimo messaggio di tuo padre prima di scomparire.",
        playable: true
    },
    
    "old_military_map": {
        name: "Mappa Militare Segnata",
        nameShort: "Mappa Militare",
        description: "Una vecchia mappa militare dell'Europa Centrale, piena di annotazioni a matita. Cerchi rossi indicano zone pericolose, percorsi sicuri sono tracciati in blu. Una X verde nell'angolo est è marcata 'S.P. - Confermato'. Le note di tuo padre sono ovunque.",
        type: "lore",
        rarity: "rare",
        stackable: false,
        effects: [
            {
                type: "map_knowledge",
                description: "Rivela informazioni su zone sicure e pericolose",
                bonus: { percezione: 1 }
            }
        ],
        loreText: "Mesi di ricognizione condensati in una singola mappa.",
        usable: true
    },
    
    // Documenti sulla Guerra Inespressa
    "classified_documents": {
        name: "Documenti Classificati - Progetto Chimera",
        nameShort: "File Chimera",
        description: "Una cartella di documenti militari con il timbro 'ALTAMENTE CLASSIFICATO'. Descrivono il Progetto Chimera: un esperimento per alterare la realtà stessa usando tecnologia quantistica. Qualcosa andò terribilmente storto il 15 Ottobre 1987.",
        type: "lore",
        rarity: "epic",
        stackable: false,
        effects: [
            {
                type: "knowledge",
                description: "Rivela la verità sulla Guerra Inespressa",
                knowledgeGained: "chimera_project"
            }
        ],
        loreText: "La guerra non fu combattuta con bombe, ma con la realtà stessa come arma."
    },
    
    "military_diary": {
        name: "Diario del Sergente Morrison",
        nameShort: "Diario Militare",
        description: "Un diario macchiato di sangue. Le ultime pagine descrivono il cielo che si squarcia, la realtà che si piega, e creature impossibili che emergono dal nulla. L'ultima frase: 'Dio ci perdoni per quello che abbiamo scatenato.'",
        type: "lore",
        rarity: "rare",
        stackable: false,
        readablePages: 47,
        loreText: "Un testimone oculare degli ultimi giorni prima del collasso."
    },
    
    // Oggetti delle fazioni
    "gang_insignia": {
        name: "Distintivo dei Teschi Rossi",
        nameShort: "Teschio Rosso",
        description: "Un distintivo di metallo arrugginito raffigurante un teschio rosso. Simbolo della gang più temuta delle terre desolate. Portarlo potrebbe intimidire nemici deboli... o attirare vendette.",
        type: "lore",
        rarity: "uncommon",
        stackable: true,
        effects: [
            {
                type: "reputation",
                faction: "red_skulls",
                value: -10
            }
        ],
        loreText: "I Teschi Rossi non perdonano, non dimenticano."
    },
    
    "corvi_medallion": {
        name: "Medaglione dei Corvi",
        nameShort: "Medaglione Corvo",
        description: "Un ciondolo d'argento annerito con inciso un corvo. Il capo dei Corvi te l'ha dato dopo aver riconosciuto il carillon di tua madre. 'Questo ti proteggerà dai miei fratelli', disse.",
        type: "lore",
        rarity: "rare",
        stackable: false,
        effects: [
            {
                type: "safe_passage",
                faction: "corvi",
                description: "I Corvi ti lasceranno passare"
            }
        ],
        loreText: "Un debito d'onore pagato con la protezione."
    },
    
    // Oggetti del Safe Place
    "safe_place_beacon": {
        name: "Radiofaro del Safe Place",
        nameShort: "Radiofaro",
        description: "Un piccolo dispositivo che emette un segnale intermittente. La frequenza corrisponde a quella menzionata nei documenti del Progetto Chimera. Si attiva solo quando sei vicino al Safe Place.",
        type: "lore",
        rarity: "legendary",
        stackable: false,
        batteryLife: 100,
        effects: [
            {
                type: "navigation",
                description: "Indica la direzione del Safe Place quando attivo"
            }
        ],
        loreText: "La salvezza è vicina quando la luce pulsa più veloce."
    },
    
    "guardian_protocol_card": {
        name: "Tessera Protocollo Angelo",
        nameShort: "Pass Angelo",
        description: "Una tessera magnetica con ologramma. 'PROTOCOLLO ANGELO - ACCESSO GARANTITO'. Il Guardiano della Soglia l'ha scannerizzata prima di lasciarti passare. Sul retro c'è una foto di famiglia: Marcus, Lena e un piccolo Ultimo.",
        type: "lore",
        rarity: "legendary",
        stackable: false,
        unique: true,
        loreText: "La chiave per il paradiso perduto."
    },
    
    // Oggetti narrativi speciali
    "family_photo_torn": {
        name: "Foto di Famiglia Strappata",
        nameShort: "Foto Strappata",
        description: "Metà di una fotografia. Mostra te da bambino e tua madre Lena che sorride. La parte con tuo padre è stata strappata via. Sul retro, con la calligrafia di tua madre: 'Estate 1985 - Gli ultimi giorni felici'",
        type: "lore",
        rarity: "rare",
        stackable: false,
        combinable: true,
        loreText: "Alcuni ricordi sono troppo dolorosi per essere conservati interi."
    },
    
    "chimera_scientist_badge": {
        name: "Distintivo Scienziato Chimera",
        nameShort: "Badge Chimera",
        description: "Un distintivo di identificazione del Progetto Chimera. Nome: Dr. Marcus [cognome illeggibile]. Livello Autorizzazione: OMEGA. La foto mostra un uomo che somiglia terribilmente a te, ma più vecchio.",
        type: "lore",
        rarity: "epic",
        stackable: false,
        revelation: true,
        loreText: "La verità sul passato di tuo padre."
    },
    
    // Frammenti di conoscenza
    "lore_fragment_item": {
        name: "Pagina di Diario Strappata",
        nameShort: "Frammento",
        description: "Una pagina strappata da un diario sconosciuto. Racconta frammenti della vita prima della Guerra Inespressa, o terribili verità su cosa accadde dopo.",
        type: "lore",
        rarity: "common",
        stackable: true,
        randomText: true,
        loreText: "Ogni frammento è un pezzo del puzzle."
    },
    
    "pre_war_newspaper": {
        name: "Giornale del 14 Ottobre 1987",
        nameShort: "Vecchio Giornale",
        description: "La prima pagina titola: 'BREAKTHROUGH SCIENTIFICO: IL PROGETTO CHIMERA PROMETTE ENERGIA INFINITA'. L'ironia è palpabile. Il giorno dopo, il mondo finì.",
        type: "lore",
        rarity: "uncommon",
        stackable: false,
        loreText: "L'ultimo giorno dell'innocenza umana."
    },
    
    // Oggetti misteriosi
    "quantum_shard": {
        name: "Frammento Quantico",
        nameShort: "Scheggia Strana",
        description: "Un cristallo che sembra esistere in più stati simultaneamente. A volte è solido, a volte liquido, a volte non c'è affatto. Residuo del Progetto Chimera.",
        type: "lore",
        rarity: "legendary",
        stackable: false,
        unstable: true,
        effects: [
            {
                type: "reality_distortion",
                description: "Altera leggermente la realtà circostante"
            }
        ],
        loreText: "La realtà stessa piange attraverso questo frammento."
    },
    
    "ultimo_childhood_toy": {
        name: "Soldatino di Piombo",
        nameShort: "Soldatino",
        description: "Un piccolo soldatino di piombo, consumato dal tempo. Era il tuo giocattolo preferito. Tuo padre te lo regalò per il tuo sesto compleanno. 'Un giorno sarai coraggioso come lui', disse.",
        type: "lore",
        rarity: "rare",
        stackable: false,
        morale: 5,
        loreText: "L'innocenza perduta di un bambino in un mondo impazzito."
    }
};

// Testi casuali per i frammenti di lore
const LORE_FRAGMENT_TEXTS = [
    "...la sirena suonò alle 15:47. Nessuno capì che era l'inizio della fine...",
    "...mia figlia mi chiese 'Papà, perché il cielo è viola?' Non seppi rispondere...",
    "...il Progetto Chimera doveva salvarci. Invece ci ha condannati...",
    "...ho visto uomini trasformarsi in qualcosa di peggio che bestie...",
    "...dicono che esista un posto sicuro verso est. Molti sono partiti, pochi sono tornati...",
    "...l'acqua sa di metallo ora. I bambini nascono strani. È questa la nuova normalità?...",
    "...ho incontrato uno degli scienziati. Piangeva, ripetendo 'non doveva andare così'...",
    "...le stelle sono sbagliate. Non sono più dove dovrebbero essere...",
    "...alcuni dicono che la guerra non è mai finita, che continua su altri piani di esistenza...",
    "...ho sognato il mondo com'era. Mi sono svegliato piangendo...",
    "...i Corvi proteggono i viaggiatori, ma a che prezzo?...",
    "...nel Safe Place l'erba è ancora verde, dicono. Sembra impossibile...",
    "...mio figlio è nato dopo la Guerra. Per lui, questo inferno è normale...",
    "...a volte sento voci dall'altra parte. Chiamano i nomi dei vivi...",
    "...il Guardiano della Soglia decide chi entra. Nessuno sa con quali criteri..."
];

// Funzione per ottenere testo casuale per frammenti
function getRandomLoreFragmentText() {
    return LORE_FRAGMENT_TEXTS[Math.floor(Math.random() * LORE_FRAGMENT_TEXTS.length)];
}

// Esporta per uso in altri moduli
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        LORE_ITEMS,
        LORE_FRAGMENT_TEXTS,
        getRandomLoreFragmentText
    };
} 
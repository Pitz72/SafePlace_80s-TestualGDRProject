/**
 * THE SAFE PLACE - ENDINGS NARRATIVE DATABASE
 * FASE 6: MULTIPLE ENDINGS SYSTEM v1.0
 * 
 * Database completo con tutti i contenuti narrativi per i 7 finali possibili.
 * Include testi completi, epiloghi del personaggio e del mondo, slideshow cinematografici.
 */

window.EndingsDatabase = {
    
    // === DATABASE COMPLETO DEI 7 FINALI ===
    
    endings: {
        
        // === 1. THE HERO'S RETURN (Finale Eroico) ===
        hero_return: {
            id: 'hero_return',
            name: 'THE HERO\'S RETURN',
            subtitle: 'Il Ritorno dell\'Eroe',
            icon: '🌟',
            theme_color: '#22c55e',
            
            // Testo principale del finale
            main_text: `Il cancello del Safe Place si apre davanti a te, ma non sei solo.
            
            Dietro di te, una lunga carovana di sopravvissuti che hai salvato durante il viaggio guarda con occhi pieni di speranza verso quello che sarà il loro nuovo futuro. Bambini che hai protetto dalla fame, famiglie che hai riunito, feriti che hai curato - tutti ti seguono con fiducia incondizionata.
            
            Marcus emerge dalla Valle Nascosta, e il suo volto si illumina non solo nel rivedere suo figlio, ma nel vedere l'eredità che hai portato con te. "Ultimo," dice con voce rotta dall'emozione, "non hai solo raggiunto il Safe Place. L'hai trasformato in qualcosa di più grande."
            
            Il Guardiano della Soglia si inchina rispettosamente. "Benvenuto, Ultimo di Marcus. Il tuo nome era già leggenda tra i sopravvissuti là fuori. Ora capiamo perché."`,
            
            // Epilogo del personaggio
            character_epilogue: `Ultimo non diventa semplicemente un abitante del Safe Place - diventa il suo cuore pulsante.
            
            La sua capacità di ispirare speranza negli altri e di vedere il bene anche nei momenti più bui lo rende un leader naturale. Non cerca il potere, ma questo lo trova comunque. I consigli di saggezza, le missioni di salvataggio che organizza, la scuola che fonda per i bambini salvati - tutto porta la sua impronta.
            
            Anni dopo, quando i primi esploratori si avventureranno fuori dalla Valle per iniziare la ricostruzione del mondo, porteranno con sé non solo provviste e tecnologia, ma i valori che Ultimo ha insegnato loro: che l'umanità si misura da come trattiamo i più deboli, e che la vera forza sta nell'unire le persone, non nel dividerle.`,
            
            // Epilogo del mondo
            world_epilogue: `Il Safe Place, sotto l'influenza di Ultimo, diventa rapidamente più di un semplice rifugio.
            
            Entro il primo anno, vengono organizzate tre grandi missioni di salvataggio che portano altri 200 sopravvissuti nella Valle. Viene istituita una "Accademia della Speranza" dove i nuovi arrivati imparano non solo le abilità di sopravvivenza, ma anche come mantenere viva la loro umanità.
            
            La "Dottrina Ultimo" - così viene chiamata la filosofia che si sviluppa attorno alle sue azioni - stabilisce che il Safe Place non deve mai chiudere le porte a chi ha bisogno. Vengono create stazioni di segnalazione radio in tutto il territorio per guidare altri sopravvissuti verso la salvezza.
            
            Dieci anni dopo, la Valle ospita oltre mille persone, e sono già nate due città satelliti. L'umanità ha trovato non solo un rifugio, ma una nuova direzione morale per ricostruire la civiltà.`,
            
            // Sequenza cinematografica (5-7 slide)
            cinematic_slides: [
                {
                    image_description: "Il cancello del Safe Place si apre, rivelando una lunga carovana di sopravvissuti dietro Ultimo",
                    text: "Non sei arrivato da solo al Safe Place...",
                    duration: 3000
                },
                {
                    image_description: "Marcus abbraccia Ultimo mentre dietro di loro i sopravvissuti guardano con speranza",
                    text: "Tuo padre ti accoglie, ma il suo orgoglio va oltre il semplice rivedere suo figlio.",
                    duration: 3500
                },
                {
                    image_description: "Ultimo che parla a un gruppo di bambini salvati, con la Valle verde sullo sfondo",
                    text: "I semi della speranza che hai piantato cresceranno oltre ogni aspettativa.",
                    duration: 3000
                },
                {
                    image_description: "Il Safe Place espanso con nuove costruzioni e centinaia di persone",
                    text: "La Valle diventa un faro di luce in un mondo di tenebre.",
                    duration: 3500
                },
                {
                    image_description: "Una carovana che parte dal Safe Place verso l'orizzonte per una missione di salvataggio",
                    text: "E la luce si diffonde, un sopravvissuto alla volta.",
                    duration: 4000
                }
            ],
            
            // Achievement sbloccato
            achievement: {
                id: 'hero_return_ending',
                name: 'L\'Eroe che Tutti Aspettavano',
                description: 'Raggiungi il finale "The Hero\'s Return" salvando molti sopravvissuti'
            }
        },
        
        // === 2. THE HOLLOW VICTORY (Vittoria Vuota) ===
        hollow_victory: {
            id: 'hollow_victory',
            name: 'THE HOLLOW VICTORY',
            subtitle: 'La Vittoria Vuota',
            icon: '⚰️',
            theme_color: '#6b7280',
            
            main_text: `Raggiungi il Safe Place, ma il prezzo pagato per arrivarci ti ha cambiato per sempre.
            
            Le scelte che hai fatto - abbandonare i feriti, rubare ai più deboli, uccidere quando avresti potuto mostrare misericordia - ti hanno permesso di sopravvivere, ma hanno ucciso qualcosa dentro di te. Ogni decisione spietata era necessaria, ti ripeti. Era l'unica strada.
            
            Marcus ti riconosce fisicamente, ma quando ti guarda negli occhi vede qualcosa che non aveva mai sperato di vedere: il vuoto. "Ultimo," sussurra, e nella sua voce c'è più dolore che gioia. "Cosa ti hanno fatto queste terre?"
            
            "Mi hanno insegnato a sopravvivere, padre," rispondi, e la freddezza della tua voce fa rabbrividire perfino il Guardiano della Soglia.
            
            Hai vinto. Sei arrivato al Safe Place. Ma guardando la Valle Verde davanti a te, non riesci a provare altro che un senso di vuoto. La vittoria ha il sapore delle ceneri.`,
            
            character_epilogue: `Ultimo diventa uno dei Guardiani più efficienti del Safe Place, ma anche il più temuto.
            
            La sua capacità di prendere decisioni difficili senza esitazione lo rende prezioso per la sicurezza della Valle, ma la sua mancanza di empatia crea una barriera invisibile tra lui e gli altri abitanti. Marcus cerca disperatamente di riconnettere con suo figlio, ma è come parlare con l'eco di chi Ultimo era un tempo.
            
            Negli anni, Ultimo sviluppa protocolli di sicurezza rigorosi che mantengono il Safe Place al sicuro, ma che respingono anche molti sopravvissuti che avrebbero potuto essere salvati. "La sopravvivenza richiede scelte difficili," dice spesso, non rendendosi conto di quanto queste parole feriscano chi lo circonda.
            
            Rimane un eroe per alcuni e un tiranno necessario per altri, ma non è mai più il ragazzo speranzoso che aveva lasciato il rifugio mesi prima.`,
            
            world_epilogue: `Il Safe Place sotto l'influenza di Ultimo diventa una fortezza impenetrabile, ma anche isolata.
            
            Le politiche di sicurezza che implementa sono estremamente efficaci: nessuna minaccia esterna riesce mai a penetrare le difese della Valle. Tuttavia, queste stesse politiche trasformano il Safe Place in una comunità chiusa, diffidente verso l'esterno.
            
            I sopravvissuti che riescono ad arrivarci trovano sicurezza, ma anche una società militarizzata dove la sopravvivenza viene prima dell'umanità. Non vengono organizzate missioni di salvataggio - troppo rischiose. Non vengono accettati rifugiati malati o feriti - troppo costosi.
            
            Paradossalmente, il Safe Place prospera materialmente ma langue spiritualmente. È diventato esattamente quello che doveva proteggere l'umanità dal diventare: freddo, calcolatore, privo di compassione. Un rifugio perfetto per corpi, ma non per anime.`,
            
            cinematic_slides: [
                {
                    image_description: "Ultimo che cammina da solo verso il cancello del Safe Place, lasciando impronte insanguinate",
                    text: "Hai raggiunto la destinazione, ma a quale prezzo?",
                    duration: 3500
                },
                {
                    image_description: "Marcus che abbraccia Ultimo, ma il loro volto mostra distanza emotiva",
                    text: "L'abbraccio di un padre che riconosce il corpo, ma non l'anima.",
                    duration: 3000
                },
                {
                    image_description: "Ultimo in uniforme da Guardiano, che respinge un gruppo di sopravvissuti feriti",
                    text: "La sicurezza prima della compassione. Sempre.",
                    duration: 3500
                },
                {
                    image_description: "Il Safe Place come una fortezza chiusa, circondata da alte mura",
                    text: "Un paradiso che è diventato una prigione dorata.",
                    duration: 3000
                },
                {
                    image_description: "Ultimo anziano che guarda verso l'orizzonte, solo e pensieroso",
                    text: "La vittoria più amara è quella che ti costa tutto ciò che eri.",
                    duration: 4000
                }
            ],
            
            achievement: {
                id: 'hollow_victory_ending',
                name: 'Il Prezzo della Sopravvivenza',
                description: 'Raggiungi il finale "The Hollow Victory" sacrificando la tua umanità'
            }
        },
        
        // === 3. THE SCIENTIST'S GAMBIT (Finale Scientifico) ===
        scientist_gambit: {
            id: 'scientist_gambit',
            name: 'THE SCIENTIST\'S GAMBIT',
            subtitle: 'La Scommessa dello Scienziato',
            icon: '🔬',
            theme_color: '#3b82f6',
            
            main_text: `Quando mostri a Marcus i documenti del Progetto Chimera che hai recuperato durante il viaggio, il suo volto diventa pallido.
            
            "Dove li hai trovati?" chiede con voce tremula, ma tu vedi nei suoi occhi che sa già la risposta. Questi documenti contengono non solo la verità sulla Guerra Inespressa, ma anche - incredibilmente - i protocolli per invertire i suoi effetti.
            
            "Il bunker militare del Settore 7," rispondi, posando sul tavolo anche gli altri oggetti scientifici che hai raccolto: campioni di suolo, registrazioni di radiazioni, analisi chimiche dell'atmosfera. "Ho capito che non era solo sopravvivenza, padre. Era una missione."
            
            Marcus annuisce lentamente. "Il Safe Place non era mai stato pensato solo come rifugio, Ultimo. Era una base di ricerca. Dovevamo essere noi a trovare la cura per quello che avevamo fatto al mondo. Ma quando tutto è crollato più velocemente del previsto..." Si ferma, poi ti guarda con un orgoglio nuovo. "Tu hai completato quello che io non sono riuscito a finire."
            
            Negli archivi del Safe Place, i tuoi ritrovamenti si rivelano le tessere mancanti di un puzzle che potrebbe ridare vita al mondo.`,
            
            character_epilogue: `Ultimo diventa il leader del Progetto Rinascita, il programma di ricerca più ambizioso nella storia post-apocalittica.
            
            La sua capacità unica di combinare intuizione scientifica con esperienza diretta del mondo devastato lo rende indispensabile. Mentre altri scienziati del Safe Place hanno solo teorie, Ultimo ha camminato tra le terre avvelenate, ha visto gli effetti della Guerra Inespressa con i suoi occhi, ha raccolto dati che nessun laboratorio avrebbe mai potuto ottenere.
            
            Nei primi tre anni, sotto la sua direzione, vengono sviluppati prototipi di "purificatori atmosferici" che possono neutralizzare le radiazioni in aree limitate. Il quarto anno vede la prima "zona pulita" artificiale al di fuori del Safe Place - una piccola vallata dove l'erba torna a crescere verde.
            
            Ultimo non vive solo per riparare il mondo, ma per capirlo. I suoi diari scientifici diventano il fondamento di una nuova disciplina: l'ecologia post-apocalittica.`,
            
            world_epilogue: `Il Safe Place si trasforma nel più avanzato centro di ricerca dell'umanità sopravvissuta.
            
            Utilizzando i documenti del Progetto Chimera e i dati raccolti da Ultimo, viene lanciato il "Programma Terra Nuova" - un piano sistematico per invertire gli effetti della Guerra Inespressa su tutto il continente. Non è più questione di sopravvivere: è questione di guarire il mondo.
            
            Cinque anni dopo l'arrivo di Ultimo, la prima città ricostruita sorge a 50 chilometri dal Safe Place, in un'area completamente decontaminata. Entro dieci anni, una rete di "oasi pulite" copre un'area grande quanto un piccolo paese, collegate da corridoi sicuri dove l'aria è respirabile e l'acqua è pura.
            
            La scoperta più importante arriva nell'anno undici: un metodo per accelerare il processo di purificazione naturale del pianeta. Gli scienziati stimano che, continuando a questo ritmo, l'Europa potrebbe tornare completamente abitabile entro una generazione.
            
            L'umanità ha trovato non solo speranza, ma un futuro concreto.`,
            
            cinematic_slides: [
                {
                    image_description: "Ultimo che mostra i documenti del Progetto Chimera a Marcus in un laboratorio",
                    text: "I segreti che hai portato con te cambieranno tutto.",
                    duration: 3500
                },
                {
                    image_description: "Un laboratorio avanzato nel Safe Place con scienziati al lavoro sui campioni di Ultimo",
                    text: "La scienza diventa l'arma più potente contro l'apocalisse.",
                    duration: 3000
                },
                {
                    image_description: "La prima zona decontaminata con erba verde che cresce",
                    text: "Il primo miracolo: la vita che torna dove prima c'era solo morte.",
                    duration: 3500
                },
                {
                    image_description: "Una mappa che mostra l'espansione delle zone pulite",
                    text: "Chilometro dopo chilometro, il mondo guarisce.",
                    duration: 3000
                },
                {
                    image_description: "Ultimo anziano in un mondo rigoglioso, con città ricostruite all'orizzonte",
                    text: "La scommessa più grande dell'umanità: che la conoscenza possa salvare tutto.",
                    duration: 4000
                }
            ],
            
            achievement: {
                id: 'scientist_gambit_ending',
                name: 'Il Salvatore della Terra',
                description: 'Raggiungi il finale "The Scientist\'s Gambit" raccogliendo conoscenza scientifica'
            }
        },
        
        // === 4. THE RELUCTANT LEADER (Leader Riluttante) ===
        reluctant_leader: {
            id: 'reluctant_leader',
            name: 'THE RELUCTANT LEADER',
            subtitle: 'Il Leader Riluttante',
            icon: '👑',
            theme_color: '#f59e0b',
            
            main_text: `Non arrivi al Safe Place da solo, ma questo non è una sorpresa. La sorpresa è che i dozzine di sopravvissuti che ti seguono non ti considerano solo la loro guida - ti considerano il loro leader eletto.
            
            "Ultimo! Ultimo! Ultimo!" gridano quando il cancello si apre, e tu ti volti verso di loro confuso. Non hai mai chiesto di guidare nessuno. Hai solo fatto quello che sembrava giusto: aiutare dove potevi, organizzare quando era necessario, prendere decisioni quando nessun altro poteva.
            
            Marcus ti osserva con una miscela di orgoglio e preoccupazione. "Hai visto come ti guardano?" ti sussurra nell'orecchio durante l'abbraccio. "Non sei più solo mio figlio, Ultimo. Sei diventato la loro speranza incarnata."
            
            Il Guardiano della Soglia si avvicina con un rotolo di pergamena. "Il Consiglio del Safe Place ha osservato il tuo arrivo," dice formalmente. "Vogliono offrirti un seggio nel governo della Valle. Anzi, vogliono offrirti la presidenza."
            
            Tu guardi le facce dei sopravvissuti che hai guidato qui, poi quelle degli abitanti del Safe Place che si sono radunati per accogliervi. In tutti vedi la stessa cosa: fiducia. La pesante fiducia di chi ha bisogno di qualcuno in cui credere.`,
            
            character_epilogue: `Ultimo accetta la leadership, ma solo con le sue condizioni: democrazia, trasparenza, e rotazione del potere.
            
            Il suo primo atto come Presidente eletto è di istituire un sistema di voto dove ogni abitante del Safe Place, indipendentemente da quando è arrivato, ha voce in capitolo. Il secondo è di limitare il suo stesso mandato a due anni, con possibilità di rielezione solo una volta.
            
            Sotto la sua guida, il Safe Place diventa la prima vera democrazia post-apocalittica. Vengono create commissioni per ogni aspetto della vita nella Valle: sicurezza, agricoltura, istruzione, ricerca, relazioni esterne. Ultimo presiede, ma non comanda - facilita, media, ispira.
            
            La sua filosofia di leadership diventa leggendaria: "Un leader non deve dire alle persone cosa fare. Deve aiutarle a capire cosa possono diventare insieme." Anche dopo aver lasciato la carica, continua a essere consultato come il "Saggio della Valle", l'uomo che ha dimostrato che il potere è più forte quando viene condiviso.`,
            
            world_epilogue: `Il modello democratico del Safe Place si diffonde come un'epidemia di speranza.
            
            Entro tre anni, vengono stabiliti contatti radio con altri gruppi di sopravvissuti in tutta Europa. Il "Sistema Ultimo" - come viene chiamato il modello democratico sviluppato nella Valle - viene adottato da insediamenti in Germania, Francia, e persino in alcune parti dell'Inghilterra meridionale.
            
            Nasce la "Confederazione delle Valli Libere," una rete di comunità democratiche che si sostengono a vicenda attraverso commercio, condivisione di risorse, e mutua protezione. Per la prima volta dalla Guerra Inespressa, l'umanità non sta solo sopravvivendo - sta ricostruendo una civiltà basata sui valori che avevano perso.
            
            Il contributo più duraturo è la "Costituzione delle Terre Liberate," un documento che stabilisce diritti umani fondamentali nel mondo post-apocalittico. Il preambolo, scritto da Ultimo stesso, inizia con: "Abbiamo visto cosa succede quando il potere non ha controlli. Mai più."`,
            
            cinematic_slides: [
                {
                    image_description: "Ultimo circondato da gruppi di sopravvissuti che lo acclamano come leader",
                    text: "Non hai cercato la leadership. La leadership ha trovato te.",
                    duration: 3500
                },
                {
                    image_description: "Una grande assemblea democratica nel Safe Place con Ultimo che modera",
                    text: "Il potere condiviso è il potere che dura.",
                    duration: 3000
                },
                {
                    image_description: "Una mappa che mostra la rete della Confederazione delle Valli Libere",
                    text: "L'idea di democrazia si diffonde oltre ogni confine.",
                    duration: 3500
                },
                {
                    image_description: "Ultimo che firma la Costituzione delle Terre Liberate circondato da rappresentanti",
                    text: "Le leggi che proteggono nascono da chi ha visto l'anarchia.",
                    duration: 3000
                },
                {
                    image_description: "Un futuro pacifico con città democratiche che prosperano",
                    text: "Il leader più grande è quello che insegna agli altri a non aver bisogno di leader.",
                    duration: 4000
                }
            ],
            
            achievement: {
                id: 'reluctant_leader_ending',
                name: 'Il Presidente che Non Voleva Regnare',
                description: 'Raggiungi il finale "The Reluctant Leader" ispirando fiducia in molti'
            }
        },
        
        // === 5. THE PYRRHIC REUNION (Riunione Amara) ===
        pyrrhic_reunion: {
            id: 'pyrrhic_reunion',
            name: 'THE PYRRHIC REUNION',
            subtitle: 'La Riunione Amara',
            icon: '💔',
            theme_color: '#dc2626',
            
            main_text: `Arrivi al Safe Place più morto che vivo, trascinando i piedi attraverso il cancello mentre il mondo si offusca attorno a te.
            
            Marcus ti riconosce e corre verso di te, ma il suo grido di gioia si trasforma in terrore quando vede il tuo stato. Ferite infette, occhi vuoti per la malnutrizione, tremori per il trauma - sei un guscio dell'ragazzo che era partito mesi fa.
            
            "Ultimo! Ultimo, guardami!" Marcus ti scuote delicatamente, ma i tuoi occhi faticano a mettere a fuoco. Le cicatrici sul tuo corpo raccontano una storia di dolore indicibile - ognuna una scelta disperata, una perdita devastante, un prezzo pagato per ogni giorno di sopravvivenza.
            
            Il dottore del Safe Place lavora per tre giorni e tre notti per stabilizzare le tue condizioni fisiche, ma sono le ferite che non si vedono quelle che preoccupano di più. Quando finalmente riesci a parlare, le tue prime parole sono: "Padre, sono... sono ancora io?"
            
            Marcus, con le lacrime agli occhi, sussurra: "Sei qui. È tutto quello che conta ora. Siamo insieme, e ti aiuterò a ricordare chi eri... e a diventare chi vorrai essere."`,
            
            character_epilogue: `Il recupero di Ultimo diventa il progetto più importante di Marcus e di tutto il Safe Place.
            
            Fisicamente, guarisce relativamente in fretta - le ferite si rimarginano, il peso torna, la forza si ricostruisce. Ma psicologicamente, è un viaggio lungo e doloroso. Incubi che lo svegliano urlando. Attacchi di panico quando vede coltelli. Giorni interi in cui non riesce a uscire dalla sua stanza perché il mondo esterno lo terrorizza.
            
            Ma il Safe Place ha qualcosa che le terre desolate non avevano: tempo e pazienza. Marcus non si arrende mai, e lentamente, pazientemente, aiuta suo figlio a ricostruire non solo i ricordi felici dell'infanzia, ma la fiducia nell'umanità che il viaggio aveva distrutto.
            
            Anni dopo, Ultimo diventa a sua volta un guaritore - non di corpi, ma di anime. La sua esperienza del trauma più profondo lo rende straordinariamente empatico verso altri sopravvissuti feriti. Non è mai tornato completamente "normale," ma ha trovato un modo per trasformare il suo dolore in compassione per gli altri.`,
            
            world_epilogue: `L'arrivo di Ultimo in condizioni così critiche fa capire al Safe Place quanto duramente devastante sia davvero il mondo esterno.
            
            Viene istituito il primo vero programma di riabilitazione psicologica post-apocalittico. I medici della Valle sviluppano nuove tecniche per trattare quello che chiamano "Sindrome del Viaggio Desolato" - il disturbo post-traumatico specifico dei sopravvissuti alle terre avvelenate.
            
            Il Centro di Recupero Marcus & Ultimo diventa un faro di speranza per migliaia di sopravvissuti feriti nell'anima. Tecniche sviluppate studiando il caso di Ultimo vengono trasmesse via radio ad altri insediamenti, salvando vite che altrimenti sarebbero state perdute non per fame o sete, ma per disperazione.
            
            Paradossalmente, il Safe Place diventa più forte proprio perché ha visto quanto fragile possa essere l'essere umano. La compassione non è più un lusso che ci si può permettere "quando tutto va bene" - diventa il fondamento stesso della comunità.`,
            
            cinematic_slides: [
                {
                    image_description: "Ultimo che crolla alle porte del Safe Place, ferito e traumatizzato",
                    text: "Il prezzo del viaggio era stato più alto di quanto immaginato.",
                    duration: 3500
                },
                {
                    image_description: "Marcus che veglia accanto al letto di Ultimo incosciente",
                    text: "L'amore di un padre che non si arrende mai.",
                    duration: 3000
                },
                {
                    image_description: "Ultimo in terapia, lentamente che riimpara a sorridere",
                    text: "La guarigione più vera è quella che ricomincia dall'anima.",
                    duration: 3500
                },
                {
                    image_description: "Ultimo che aiuta un altro sopravvissuto traumatizzato",
                    text: "Solo chi ha toccato il fondo può davvero aiutare altri a risalire.",
                    duration: 3000
                },
                {
                    image_description: "Il Centro di Recupero con molti sopravvissuti che guariscono insieme",
                    text: "A volte la vittoria più grande è semplicemente continuare a essere umani.",
                    duration: 4000
                }
            ],
            
            achievement: {
                id: 'pyrrhic_reunion_ending',
                name: 'Cicatrici che Insegnano',
                description: 'Raggiungi il finale "The Pyrrhic Reunion" sopravvivendo a un trauma estremo'
            }
        },
        
        // === 6. THE WARRIOR'S END (Fine del Guerriero) ===
        warrior_end: {
            id: 'warrior_end',
            name: 'THE WARRIOR\'S END',
            subtitle: 'La Fine del Guerriero',
            icon: '⚔️',
            theme_color: '#b91c1c',
            
            main_text: `Arrivi al Safe Place come una leggenda vivente delle terre desolate.
            
            I segni della tua trasformazione sono evidenti: muscoli forgiati dalla necessità, cicatrici che raccontano vittorie, occhi che hanno visto troppi combattimenti per contarli. Cammini con la sicurezza di chi ha affrontato ogni orrore che il mondo post-apocalittico può offrire e ne è uscito vittorioso.
            
            Il Guardiano della Soglia ti riconosce prima ancora che tu ti presenti. "Ultimo, figlio di Marcus," dice con rispetto reverenziale. "Le storie dei tuoi combattimenti ci arrivano da mesi. I sopravvissuti parlano del 'Fantasma della Desolazione' che protegge i più deboli e punisce i predatori."
            
            Marcus ti abbraccia, ma sente la differenza immediatamente. Questo non è più il ragazzo che aveva lasciato andare - questo è un guerriero consumato. "Figlio mio," sussurra, "hai vinto ogni battaglia tranne una: quella per rimanere te stesso."
            
            Tu guardi la Valle Verde e, per la prima volta in mesi, non vedi minacce da neutralizzare o territori da difendere. Vedi pace. E non sei sicuro di sapere più cosa farne.`,
            
            character_epilogue: `Ultimo fatica ad adattarsi alla pace del Safe Place, ma trova il suo scopo nell'addestrare la prossima generazione.
            
            I primi mesi sono difficili. Il guerriero perfetto che aveva sviluppato istinti letali per la sopravvivenza ora deve imparare a disattivarli. I rumori notturni lo svegliano con la mano già sulla lama. La vicinanza della gente lo mette a disagio - troppe variabili, troppi potenziali pericoli.
            
            Ma lentamente, Marcus lo aiuta a canalizzare le sue abilità in qualcosa di costruttivo. Ultimo diventa il Maestro d'Armi del Safe Place, insegnando tecniche di combattimento e sopravvivenza ai giovani. Più importante, insegna loro l'equilibrio che lui stesso ha faticato a trovare: quando combattere e quando mostrare misericordia.
            
            La "Scuola del Guerriero Pacifico" che fonda diventa leggendaria. I suoi studenti apprendono non solo come vincere i combattimenti, ma come evitarli quando possibile. Il motto della scuola, scolpito sopra l'ingresso, recita: "La vera vittoria è non dover combattere."`,
            
            world_epilogue: `Le abilità militari di Ultimo trasformano il Safe Place nella comunità più sicura e meglio difesa dell'Europa post-apocalittica.
            
            Sotto la sua guida strategica, viene creata la "Guardia delle Valli" - una forza militare disciplinata ma umana che protegge non solo il Safe Place, ma anche le rotte commerciali e i piccoli insediamenti alleati. Non sono conquistatori, ma protettori.
            
            Le tecniche di combattimento sviluppate da Ultimo vengono insegnate a centinaia di nuovi Guardiani, che poi si spargono per tutto il continente. Ovunque vadano, portano non solo competenze militari, ma anche un codice d'onore che pone la protezione degli innocenti sopra ogni altra considerazione.
            
            Dieci anni dopo, la "Pax Ultimo" - una zona di pace protetta che si estende per centinaia di chilometri attorno al Safe Place - è diventata realtà. I predatori e i banditi evitano l'area, sapendo che i Guardiani addestrati da Ultimo non mostrano pietà verso chi fa del male agli innocenti, ma accolgono a braccia aperte chi cerca redenzione.`,
            
            cinematic_slides: [
                {
                    image_description: "Ultimo che arriva al Safe Place in armatura improvvisata, coperto di cicatrici di battaglia",
                    text: "Il ragazzo era partito. Era tornato un guerriero leggendario.",
                    duration: 3500
                },
                {
                    image_description: "Ultimo che si allena da solo, cercando di controllare i suoi istinti di combattimento",
                    text: "La pace può essere la battaglia più difficile di tutte.",
                    duration: 3000
                },
                {
                    image_description: "Ultimo che addestra giovani guerrieri, insegnando disciplina e onore",
                    text: "Il vero maestro non crea soldati, ma protettori.",
                    duration: 3500
                },
                {
                    image_description: "I Guardiani delle Valli che proteggono una carovana di civili",
                    text: "La forza al servizio della compassione.",
                    duration: 3000
                },
                {
                    image_description: "Una mappa che mostra la Pax Ultimo, zone di pace protette",
                    text: "Il guerriero più grande è quello che rende la guerra inutile.",
                    duration: 4000
                }
            ],
            
            achievement: {
                id: 'warrior_end_ending',
                name: 'Il Maestro delle Lame Pacifiche',
                description: 'Raggiungi il finale "The Warrior\'s End" diventando un combattente leggendario'
            }
        },
        
        // === 7. THE NEW BEGINNING (Nuovo Inizio) ===
        new_beginning: {
            id: 'new_beginning',
            name: 'THE NEW BEGINNING',
            subtitle: 'Il Nuovo Inizio',
            icon: '🌅',
            theme_color: '#06b6d4',
            
            main_text: `Quando raggiungi il Safe Place, non c'è niente di epico o drammatico nel tuo arrivo.
            
            Non sei un eroe leggendario, né un guerriero spietato, né uno scienziato brillante. Sei semplicemente Ultimo - un ragazzo di 17 anni che ha attraversato l'inferno e ne è uscito ancora umano. Hai fatto scelte giuste e sbagliate, hai aiutato quando potevi, hai sopravvissuto quando dovevi, hai mantenuto la speranza quando tutto sembrava perduto.
            
            Marcus ti abbraccia e in quell'abbraccio c'è qualcosa di profondamente semplice e giusto. Non sei cambiato in modo drastico - sei cresciuto. Non hai perso la tua umanità - l'hai temprata. Non sei diventato qualcun altro - sei diventato la versione migliore di te stesso.
            
            "Come ti senti?" ti chiede Marcus, e la risposta viene spontanea: "Diverso, ma ancora io. Più forte, ma non indurito. Stanco, ma speranzoso."
            
            Il Guardiano della Soglia sorride. "Benvenuto a casa, Ultimo. Il Safe Place ha bisogno di persone esattamente come te - che ricordano cosa significa essere umani."`,
            
            character_epilogue: `Ultimo non diventa una figura leggendaria, ma qualcosa di più prezioso: diventa un esempio di umanità equilibrata.
            
            Nel Safe Place trova il suo posto naturalmente, senza forzature o drammi. Lavora nei campi, aiuta nell'officina, insegna ai bambini, condivide le sue storie con chi ha bisogno di speranza. Non cerca ruoli di leadership, ma quando la gente ha bisogno di qualcuno di cui fidarsi, si rivolgono a lui.
            
            La sua filosofia di vita diventa contagiosa: "Non devi essere perfetto per fare del bene. Devi solo provare, giorno dopo giorno." I suoi consigli sono semplici ma profondi, le sue azioni piccole ma significative.
            
            Anni dopo, quando gli storici del Safe Place scriveranno la storia della comunità, dedicheranno un intero capitolo a Ultimo - non per una singola grande azione, ma per aver dimostrato che la grandezza sta nella consistenza quotidiana della gentilezza.`,
            
            world_epilogue: `Il Safe Place sotto l'influenza di Ultimo diventa il modello di come dovrebbe essere una comunità post-apocalittica ideale.
            
            Non ci sono rivoluzioni drammatiche o innovazioni tecnologiche rivoluzionarie. C'è crescita organica, sostenibile, umana. La popolazione aumenta gradualmente man mano che più sopravvissuti scoprono che il Safe Place è davvero quello che promette: un luogo dove si può essere semplicemente umani.
            
            La "Via di Ultimo" - così viene chiamata la filosofia pratica che si sviluppa attorno al suo esempio - si basa su principi semplici: lavoro onesto, compassione quotidiana, speranza ragionevole, crescita graduale. Non è spettacolare, ma è duraturo.
            
            Trent'anni dopo, quando altre comunità post-apocalittiche sono collassate per conflitti interni o ambizioni smodate, il Safe Place continua a prosperare tranquillamente. È diventato il gold standard per la ricostruzione della civiltà: lenta, paziente, umana.`,
            
            cinematic_slides: [
                {
                    image_description: "Ultimo che cammina tranquillamente verso il Safe Place al tramonto",
                    text: "Non tutti gli eroi arrivano con fragore. Alcuni arrivano a casa.",
                    duration: 3500
                },
                {
                    image_description: "L'abbraccio semplice e genuino tra Ultimo e Marcus",
                    text: "Il momento più prezioso: quando tutto torna al posto giusto.",
                    duration: 3000
                },
                {
                    image_description: "Ultimo che lavora serenamente nei campi del Safe Place",
                    text: "La vera felicità si trova nella semplicità quotidiana.",
                    duration: 3500
                },
                {
                    image_description: "Il Safe Place che cresce lentamente e armoniosamente nel tempo",
                    text: "Il cambiamento migliore è quello che accade naturalmente.",
                    duration: 3000
                },
                {
                    image_description: "Un futuro sereno con famiglie che prosperano nel Safe Place",
                    text: "Il nuovo inizio più bello è quello che sembra un ritorno a casa.",
                    duration: 4000
                }
            ],
            
            achievement: {
                id: 'new_beginning_ending',
                name: 'L\'Umanità Preservata',
                description: 'Raggiungi il finale "The New Beginning" mantenendo equilibrio e speranza'
            }
        }
    },
    
    // === UTILITY FUNCTIONS ===
    
    /**
     * Ottiene il database di un finale specifico
     */
    getEnding(endingId) {
        return this.endings[endingId] || null;
    },
    
    /**
     * Restituisce la lista di tutti i finali disponibili
     */
    getAllEndings() {
        return Object.values(this.endings);
    },
    
    /**
     * Ottiene solo i nomi dei finali per debugging
     */
    getEndingNames() {
        return Object.keys(this.endings).map(id => ({
            id: id,
            name: this.endings[id].name,
            subtitle: this.endings[id].subtitle
        }));
    }
};

// Auto-inizializzazione
if (typeof window !== 'undefined') {
    console.log('✅ ENDINGS NARRATIVE DATABASE caricato:', window.EndingsDatabase.getEndingNames());
}

console.log('✅ ENDINGS NARRATIVE DATABASE caricato correttamente'); 
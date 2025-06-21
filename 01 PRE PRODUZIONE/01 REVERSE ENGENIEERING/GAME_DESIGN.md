# Documento di Game Design - The Safe Place

Questo documento descrive il game design, le meccaniche principali e il ciclo di gioco (game loop) di "The Safe Place".

## 1. Obiettivo del Gioco

Il giocatore assume il ruolo di Ultimo, un giovane sopravvissuto in un mondo post-apocalittico. L'obiettivo primario è viaggiare attraverso una mappa generata proceduralmente per raggiungere il "Safe Place", un rifugio sicuro situato a est, seguendo le ultime istruzioni di suo padre.

## 2. Il Ciclo di Gioco (Game Loop)

Il gioco si svolge in un ciclo continuo di azioni e conseguenze:

1.  **Esplorazione**: Il giocatore si muove su una mappa 2D a griglia. Ogni movimento rappresenta una porzione di tempo e distanza percorsa.
2.  **Gestione Risorse**: Ogni movimento consuma risorse vitali (cibo, acqua) e fa avanzare il tempo di gioco (giorni sopravvissuti). Il giocatore deve gestire il proprio inventario per sopravvivere.
3.  **Incontri**: Ogni movimento ha una probabilità di innescare un evento. Gli eventi possono essere di tre tipi:
    -   **Incontri di Combattimento**: Contro nemici casuali (gestiti da `ENEMY_DATABASE` e `AdvancedCombatSystem`).
    -   **Eventi Casuali**: Piccoli eventi non di combattimento che offrono scelte e ricompense/penalità.
    -   **Eventi Narrativi**: Eventi della trama principale (gestiti dal `LoreEventManager`) che fanno progredire la storia di Ultimo.
4.  **Risoluzione**: Il giocatore affronta l'evento, che sia un combattimento tattico o una scelta narrativa.
5.  **Ricompensa e Progressione**: Il completamento di un evento fornisce ricompense (oggetti, esperienza). L'esperienza permette al giocatore di migliorare le proprie statistiche e diventare più forte.
6.  **Ripetizione**: Il ciclo ricomincia, con il giocatore che continua il suo viaggio verso est, diventando progressivamente più forte ma affrontando sfide sempre maggiori.

## 3. Meccaniche Principali

### 3.1. Sopravvivenza

-   **Fame e Sete**: Statistiche vitali che diminuiscono costantemente con il tempo. Se raggiungono lo zero, il giocatore inizia a subire danni ai punti vita. Vengono reintegrate consumando oggetti.
-   **Stato di Salute**: Il giocatore ha Punti Vita (HP). Il combattimento e la fame/sete possono ridurli. Il riposo e gli oggetti curativi possono ripristinarli.
-   **Malattie**: È presente uno stato "malato" (`isSick`) che può essere contratto e curato, e che può anche fungere da trigger per eventi narrativi.

### 3.2. Combattimento

-   **Sistema Tattico a Turni**: Basato su meccaniche simili a D&D.
-   **Risoluzione**: Un tiro di d20 + bonus di attacco contro la Classe Armatura del difensore determina se un colpo va a segno.
-   **Profondità**: Include effetti di stato (veleno, paralisi, sanguinamento), abilità speciali dei nemici attivate da trigger contestuali (es. poca vita) e la possibilità di colpi critici.
-   **Equipaggiamento**: Le armi e le armature equipaggiate influenzano pesantemente le statistiche di combattimento.

### 3.3. Progressione del Personaggio

-   **Punti Esperienza (EXP)**: Guadagnati tramite combattimenti, eventi e scelte narrative.
-   **Statistiche Primarie**: Il giocatore può spendere punti (ottenuti con l'EXP) per migliorare 6 statistiche di base:
    -   `Potenza`: Influenza il combattimento corpo a corpo.
    -   `Agilità`: Influenza la difesa e l'iniziativa.
    -   `Vigore`: Influenza i punti vita e la resistenza.
    -   `Percezione`: Aiuta a trovare oggetti e notare dettagli.
    -   `Adattamento`: Migliora la sopravvivenza e la resistenza agli elementi.
    -   `Carisma`: Influenza le interazioni con altri personaggi.
-   **Statistiche Derivate**: Le statistiche primarie influenzano i valori di combattimento come HP, bonus attacco, classe difesa, etc.

### 3.4. Inventario e Oggetti

-   **Gestione Inventario**: Il giocatore ha un inventario con un limite di peso o di slot.
-   **Categorie di Oggetti**: Cibo, acqua, medicine, armi, armature, materiali per il crafting, oggetti di missione (es. `carillon_of_lena`).
-   **Durabilità**: Le armi e le armature hanno un valore di durabilità che diminuisce con l'uso.
-   **Riparazione e Crafting**: La presenza di oggetti come `repair_kit` e materiali grezzi (`scrap_metal`, `animal_hide`) implica l'esistenza di un sistema di riparazione e, potenzialmente, di crafting, anche se non completamente analizzato in dettaglio.

### 3.5. Narrazione Dinamica

-   **Trama Lineare in un Mondo Aperto**: Il gioco racconta una storia lineare ("Ultimo's Journey") ma la presenta in modo dinamico.
-   **Pacing Intelligente**: Un sistema di gestione del ritmo narrativo decide quando è il momento migliore per presentare un evento della trama, basandosi sulle azioni del giocatore.
-   **Scelte e Conseguenze**: Le scelte del giocatore durante gli eventi narrativi hanno un impatto permanente, sbloccando `lore_flag` che influenzano gli eventi futuri. 
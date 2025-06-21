# Documento dei Contenuti di Gioco - The Safe Place

Questo documento funge da indice e riepilogo di tutti i contenuti principali presenti nel gioco, come personaggi, oggetti, nemici e la trama principale.

## 1. Personaggi (NPC)

Il gioco ha un cast di personaggi molto ristretto, il che pone grande enfasi su ogni interazione.

-   **Ultimo**: Il personaggio giocante. Un giovane il cui obiettivo è sopravvivere e raggiungere il padre.
-   **Marcus**: Il padre di Ultimo. È uno scienziato che ha lavorato al "Progetto Chimera". La sua lettera dà il via alla missione del giocatore. Si riunisce con lui alla fine del gioco.
-   **Lena**: La madre di Ultimo, menzionata attraverso un oggetto (il carillon). Sembra fosse una figura conosciuta e amata prima dell'apocalisse.
-   **Capo dei Corvi**: Un antagonista che si rivela avere un lato umano, mostrando un collegamento con Lena, la madre del protagonista.
-   **Famiglia di Viandanti**: Un incontro casuale che serve a porre il giocatore di fronte a un dilemma morale.
-   **Il Guardiano**: Un'entità (umana o robotica) che protegge l'ingresso del Safe Place, seguendo un rigido protocollo.

## 2. Trama Principale ("Ultimo's Journey")

La storia è un arco narrativo lineare e ben definito, presentato tramite un sistema di eventi dinamici.

-   **Incipit**: Ultimo, spinto da una lettera del padre Marcus, parte per un viaggio verso est per raggiungere il Safe Place.
-   **Sviluppo**: Durante il viaggio, Ultimo affronta le difficoltà del mondo, scopre il passato della sua famiglia e svela il mistero dietro la fine del mondo: un esperimento scientifico chiamato "Progetto Chimera".
-   **Conclusione**: Ultimo raggiunge il Safe Place, incontra il Guardiano e si riunisce finalmente con suo padre.

## 3. Database degli Oggetti

Il gioco presenta un vasto database di oggetti suddivisi in categorie.

-   **Fonte**: `js/game_data.js`, `js/advanced_items_database.js`.
-   **Categorie Principali**:
    -   **Risorse di Sopravvivenza**: Cibo, acqua (in varie forme: pulita, sporca, contaminata).
    -   **Equipaggiamento**: Armi (da mischia e da fuoco) e Armature, con statistiche e durabilità.
    -   **Oggetti Curativi**: Bende, medkit, antidoti.
    -   **Materiali**: Componenti per il crafting e la riparazione (rottami, pelli, parti elettroniche).
    -   **Oggetti di Missione**: Oggetti unici che fanno progredire la trama o sbloccano interazioni (es. `carillon_of_lena`, `classified_documents`).
-   **Sistema di Rarità**: Gli oggetti sono classificati per rarità, influenzando la loro reperibilità e potenza.

## 4. Database dei Nemici

Il gioco ha un sistema di nemici completo e diversificato.

-   **Fonte**: `js/data/enemies_database.js`.
-   **Struttura**: I nemici sono divisi in 6 categorie principali, ognuna con 3 tier di difficoltà (debole, standard, pericoloso).
-   **Categorie**:
    -   `BEAST`: Animali mutati.
    -   `SCAVENGER`: Sopravvissuti solitari e disperati.
    -   `BANDIT`: Membri di gang organizzate.
    -   `RAIDER`: Predoni motorizzati e più aggressivi.
    -   `MUTANT`: Umani o creature pesantemente deformati dalle radiazioni.
    -   `DRONE`: Macchine militari pre-guerra ancora attive.
-   **Abilità Speciali**: Molti nemici possiedono abilità uniche che si attivano durante il combattimento, aggiungendo profondità tattica.

## 5. Eventi

Il gioco utilizza due sistemi di eventi paralleli.

1.  **Eventi Casuali**:
    -   **Fonte**: `js/events.js`.
    -   **Natura**: Brevi incontri testuali con 2-3 scelte. Possono essere positivi (trovare risorse), negativi (cadere in una trappola) o neutri.
    -   **Scopo**: Rendere il viaggio imprevedibile e popolare il mondo di gioco.
2.  **Eventi Narrativi (Lore)**:
    -   **Fonte**: `js/events/lore_events_linear.js`.
    -   **Natura**: Eventi più lunghi e dettagliati che compongono la trama principale.
    -   **Scopo**: Raccontare la storia di Ultimo e dare un obiettivo e un significato al viaggio del giocatore. 
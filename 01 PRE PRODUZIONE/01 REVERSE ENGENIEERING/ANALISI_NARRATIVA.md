# FASE 3: Analisi dei Contenuti - Sistema Narrativo e Lore

Questo documento analizza il sistema che gestisce la trama principale del gioco, "Ultimo's Journey", basato sui file `js/lore_event_manager.js` e `js/events/lore_events_linear.js`.

Il sistema è composto da due parti principali: un **manager di ritmo narrativo** e un **database di eventi lineari**.

## 1. Il Manager di Ritmo Narrativo (`LoreEventManager`)

Definito in `js/lore_event_manager.js`, questo modulo non contiene la storia, ma decide **quando e dove** gli eventi della trama dovrebbero accadere.

- **Probabilità Dinamica**: Calcola la probabilità di un evento ad ogni movimento del giocatore. La probabilità è influenzata da:
    - Distanza percorsa
    - Giorni sopravvissuti
    - Percentuale di mappa esplorata
    - **Ritmo Narrativo**: Un fattore chiave che aumenta la probabilità se è passato molto tempo dall'ultimo evento e la diminuisce se gli eventi sono troppo ravvicinati.
- **Contesto**: Verifica se il contesto del giocatore (es. posizione sulla mappa, stato di salute) è appropriato per l'evento specifico che sta per essere attivato.
- **Integrazione**: Si aggancia alla funzione di movimento del giocatore (`window.movePlayer`) per eseguire i suoi controlli dopo ogni spostamento.

## 2. Il Database di Eventi Lineari (`LORE_EVENTS_LINEAR`)

Definito in `js/events/lore_events_linear.js`, questo array contiene l'intera spina dorsale della storia, evento per evento.

### 2.1. Struttura degli Eventi

Ogni evento è un oggetto con una struttura ricca e dettagliata:

- `id`, `title`, `description`: Il contenuto testuale dell'evento.
- `trigger`: La condizione principale per l'attivazione (es. `days_survived >= 15`).
- `requiresFlags`: Un array di flag narrativi che il giocatore deve aver ottenuto in eventi precedenti, garantendo la coerenza della storia.
- `choices`: Un array di scelte per il giocatore. Ogni scelta ha:
    - `outcome`: Il testo che descrive il risultato della scelta.
    - `effects`: Le conseguenze di gioco, come modifiche alle statistiche, l'aggiunta di oggetti o l'impostazione di nuovi `lore_flag`.
- `priority`: Un valore numerico che aiuta a determinare quale evento mostrare per primo se più di uno è disponibile.

### 2.2. Arco Narrativo: "Ultimo's Journey"

La storia segue il viaggio di Ultimo per ricongiungersi con suo padre, Marcus.

1.  **La Lettera**: Ultimo trova un messaggio del padre, uno scienziato, che lo esorta a raggiungerlo al "Safe Place".
2.  **Il Viaggio**: Ultimo affronta le difficoltà del mondo post-apocalittico.
3.  **Il Passato**: Trova oggetti legati alla sua famiglia (un carillon della madre, Lena) che sbloccano interazioni uniche con altri sopravvissuti.
4.  **Il Dilemma**: Affronta una difficile scelta morale riguardo alla condivisione delle sue scarse risorse.
5.  **La Verità**: Scopre che la fine del mondo è stata causata da un esperimento scientifico fallito ("Progetto Chimera") a cui suo padre ha lavorato. Il Safe Place era il bunker di emergenza.
6.  **L'Arrivo**: Guidato da un sogno profetico e da una trasmissione radio, raggiunge la destinazione.
7.  **Il Guardiano**: Incontra il Guardiano del Safe Place, che lo riconosce tramite un test genetico.
8.  **La Riunione**: Entra nel Safe Place e si ricongiunge finalmente con suo padre.

## 3. Logica di Esecuzione (`getNextLoreEvent`)

La funzione `getNextLoreEvent`, chiamata dal manager, è il cuore della logica:

1.  Ordina tutti gli eventi `LORE_EVENTS_LINEAR` per priorità.
2.  Scorre la lista e usa la funzione `canTriggerLoreEvent` per controllare ogni evento.
3.  `canTriggerLoreEvent` verifica tutte le condizioni: se l'evento è già stato visto, se i `requiresFlags` sono soddisfatti e se il `trigger` è attivo.
4.  Il primo evento che passa tutti i controlli viene restituito al manager per essere mostrato al giocatore.

## 4. Conclusione

Il sistema narrativo è un esempio di design robusto, capace di raccontare una storia lineare e predefinita all'interno di un ambiente di gioco dinamico e non lineare. La combinazione di un pacing manager intelligente e di un database di eventi contestuali crea un'esperienza narrativa coerente e coinvolgente. 
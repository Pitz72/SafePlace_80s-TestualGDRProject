# Analisi Database degli Oggetti

Questo documento riassume l'analisi dei file che contengono i dati di tutti gli oggetti del gioco, principalmente `advanced_items_database.js` e presumibilmente un `items_database.js` di base.

## Ruolo e Struttura

Questi file agiscono come il **database completo e la fonte autorevole per tutti gli oggetti** presenti nel gioco. Non contengono logica, ma un grande oggetto JavaScript (probabilmente `ITEM_DATA`) che funge da dizionario, mappando un ID univoco di un oggetto a un oggetto contenente tutte le sue proprietà.

L'architettura dei dati è ben definita e modulare, basata su due concetti principali.

### 1. Sistema di Rarità (`RARITY_SYSTEM`)

Il gioco implementa un sistema di rarità classico, comune nei GDR, che classifica ogni oggetto. Ogni livello di rarità (Comune, Non Comune, Raro, Epico, Leggendario) definisce:

*   **`color`**: Un codice esadecimale per la colorazione del nome dell'oggetto nell'interfaccia utente, fornendo un feedback visivo immediato della sua qualità.
*   **`valueMultiplier`**: Un moltiplicatore applicato al valore di base dell'oggetto.
*   **`dropChance`**: La probabilità di base che un oggetto di quella rarità venga trovato.

### 2. Struttura di un Oggetto

Ogni oggetto nel database è definito da un insieme completo di proprietà che ne descrivono ogni aspetto:

*   **Identificazione e Classificazione**:
    *   `id`, `name`, `nameShort`, `description`: Dati testuali per identificare l'oggetto.
    *   `type`: Una categoria generica (es. `consumable`, `weapon`, `armor`, `tool`, `unique`).
    *   `rarity`: Un riferimento a una delle chiavi del `RARITY_SYSTEM`.
    *   `slot`: Per gli oggetti equipaggiabili, definisce dove vengono indossati (es. `body`, `feet`, `accessory`).
    *   `setId`: Un identificatore per raggruppare oggetti che fanno parte di un set e che potrebbero fornire bonus aggiuntivi se indossati insieme.

*   **Proprietà Fisiche e di Stato**:
    *   `weight`: Il peso, che influisce sulla capacità di carico.
    *   `value`: Il valore di base dell'oggetto.
    *   `stackable`: Un booleano per indicare se più unità dell'oggetto occupano un solo slot di inventario.
    *   `durability` / `maxDurability`: Per gli oggetti che si usurano con l'uso.

*   **Proprietà Logiche (`effects`)**:
    *   Questa è la proprietà più importante per il gameplay. È un **array di oggetti**, dove ogni oggetto definisce un effetto specifico che l'oggetto conferisce.
    *   La struttura di un effetto è ` { type: 'nome_effetto', ...altri_parametri } `.
    *   L'analisi ha rivelato una grande varietà di `type` di effetti, che spaziano da semplici bonus alle statistiche (`combatBonus`), a modificatori di meccaniche (`damageReduction`, `healingBonus`), fino a effetti unici che sbloccano contenuti narrativi (`reveal_lore`) o forniscono vantaggi situazionali (`never_lost`).

## Implicazioni per il Porting

*   **Fonte di Dati Cruciale**: Questi file sono una miniera d'oro di informazioni. La loro estrazione e conversione (ad esempio in formato JSON o in tabelle di database) è un passo fondamentale per il porting.
*   **Design da Replicare**: La struttura dei dati è robusta, flessibile e facilmente estensibile. Rappresenta un eccellente modello da seguire per la gestione degli oggetti nel nuovo engine.
*   **Specifiche per il Motore di Gioco**: L'elenco completo di tutti i tipi di `effects` funge da potentissima specifica di progettazione per il motore di gioco. Il nuovo engine dovrà implementare la logica per interpretare e applicare ognuno di questi effetti, dal semplice `stat_boost` all' complesso `path_of_hope`. Questo garantisce che il comportamento degli oggetti rimanga fedele all'originale. 
# FASE 3: Analisi dei Contenuti - Database dei Nemici

Questo documento analizza il file `archives/safeplace_advanced/js/data/enemies_database.js`, che si è rivelato essere un sistema completo per la gestione dei nemici.

## 1. Struttura del Database (`ENEMY_DATABASE`)

La variabile globale `ENEMY_DATABASE` contiene tutti i dati dei nemici. La sua struttura è la seguente:

- **Oggetto Principale**: Un oggetto JavaScript che mappa le categorie di nemici a loro volta a oggetti.
- **Categorie di Nemici**: 6 categorie principali:
    - `BEAST` (Bestie)
    - `SCAVENGER` (Saccheggiatori)
    - `BANDIT` (Banditi)
    - `RAIDER` (Predoni)
    - `MUTANT` (Mutanti)
    - `DRONE` (Droni Militari)
- **Tier di Difficoltà**: Ogni categoria contiene 3 sotto-oggetti che rappresentano i livelli di difficoltà:
    - `weak`
    - `standard`
    - `dangerous`
- **Attributi del Nemico**: Ogni nemico ha un set di proprietà ben definito:
    - `name`: Nome del nemico.
    - `description`: Descrizione testuale.
    - `hp`: Punti vita.
    - `attackBonus`: Bonus al tiro per colpire.
    - `defenseClass`: Classe armatura.
    - `damage`: Oggetto `{ min, max, bonus }` per il calcolo del danno.
    - `resistance`: Valore di riduzione del danno subito.
    - `expValue`: Punti esperienza forniti.
    - `encounterText`: Testo descrittivo mostrato all'inizio del combattimento.
    - `lootTable`: Un oggetto che mappa gli ID degli oggetti a una probabilità di drop (da 0.0 a 1.0).

## 2. Logica di Selezione dei Nemici

Il file non si limita a definire i dati, ma include anche la logica per selezionare dinamicamente quale nemico il giocatore affronterà.

### 2.1. Selezione Pesata (`ENEMY_TYPE_WEIGHTS` e `selectWeightedEnemyType`)

- Una costante `ENEMY_TYPE_WEIGHTS` definisce la probabilità di incontro per ogni categoria di nemico.
- La somma dei pesi è 80%, il che implica che il **20% degli incontri casuali sono eventi non legati al combattimento**.
- La funzione `selectWeightedEnemyType()` usa questo oggetto per restituire una categoria di nemico in modo probabilistico.

### 2.2. Funzione Principale di Selezione (`selectEnemyForCombat`)

La funzione `selectEnemyForCombat(playerLevel, biomeType, daysSurvived)` è il cuore del sistema di incontri. Determina il nemico finale basandosi su:

1.  **Tipo di Nemico**: Chiama `selectWeightedEnemyType()` per scegliere la categoria.
2.  **Difficoltà (Tier)**: Calcola il tier (`weak`, `standard`, `dangerous`) in base al `playerLevel` e ai `daysSurvived`. La difficoltà aumenta progressivamente con l'avanzare del gioco.
3.  **Modificatori Ambientali**: Applica regole specifiche basate sul `biomeType`. Ad esempio, è più probabile incontrare `MUTANT` in `CITY` e meno probabile trovare `DRONE` in `FOREST`.

## 3. Estensione del Sistema di Combattimento (`CombatSystemV2`)

Una scoperta inaspettata è la presenza dell'oggetto `CombatSystemV2`.

- **Estensione, non Sostituzione**: Questo oggetto **estende** un `CombatSystem` globale preesistente, ereditandone le funzionalità.
- **Effetti Speciali**: Aggiunge la funzione `applySpecialEffects(enemy, player)`, che gestisce abilità uniche di alcune categorie di nemici (es. `MUTANT` può infliggere radiazioni, `DRONE` può causare un effetto EMP).
- **Implicazioni**: Questo rivela che il combattimento è più complesso di un singolo skill check. Esiste un sistema di base (`CombatSystem`) che viene qui potenziato.

## 4. Conclusioni e Prossimi Passi

Il file `enemies_database.js` è un modulo autonomo e sofisticato che gestisce dati, incontri e persino alcuni aspetti della meccanica di combattimento.

**Prossimo passo critico**: È necessario individuare e analizzare l'oggetto `CombatSystem` di base per comprendere appieno il funzionamento del combattimento. Questa è una dipendenza chiave rivelata da questa analisi. 
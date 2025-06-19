# Analisi Contenuti di Combattimento - `advanced_combat_system.js`

Questo documento analizza il file `archives/safeplace_advanced/js/advanced_combat_system.js`.

**Nota Fondamentale**: Questo file **non è il motore del combattimento**. Non contiene il loop di combattimento, né le formule di danno. Invece, agisce come un **database di contenuti e meccaniche avanzate** che definisce *cosa* può accadere durante un combattimento.

## Ruolo e Responsabilità

Lo scopo di questo file è centralizzare la definizione di tutti gli elementi complessi del sistema di combattimento in una forma strutturata e leggibile.

### 1. Database degli Effetti di Stato (`STATUS_EFFECTS`)

*   Questo oggetto definisce tutti gli stati alterati (sia positivi che negativi) che possono influenzare un'entità in combattimento.
*   **Esempi**: `POISON` (veleno), `BLEEDING` (sanguinamento), `PARALYSIS` (paralisi), `BERSERKER_RAGE` (furia), `HEALING_FACTOR` (rigenerazione).
*   **Struttura Dati**: Ogni effetto è un oggetto con proprietà chiare come `name`, `description`, `damagePerTurn`, `duration`, `color` e `icon`. Questa struttura è ideale per essere consumata sia dalla logica di gioco (per applicare i danni) sia dalla UI (per visualizzare l'effetto).

### 2. Database delle Abilità Speciali (`SPECIAL_ABILITIES`)

*   Questa è la parte più importante del file. È un database gerarchico che assegna abilità uniche a diverse categorie di nemici.
*   **Gerarchia**: `Categoria Nemico` (es. `BEAST`, `SCAVENGER`, `ROBOT`) -> `Livello di Pericolosità` (es. `weak`, `standard`, `dangerous`) -> `Abilità`.
*   **Struttura dell'Abilità**: Ogni abilità è un oggetto che ne definisce il comportamento:
    *   `name` e `description`: Per la UI.
    *   `chance`: La probabilità (da 0.0 a 1.0) che l'abilità si attivi.
    *   `effect`: Il tipo di effetto di stato da applicare (un riferimento alla chiave in `STATUS_EFFECTS`).
    *   **`trigger`**: La condizione che scatena l'abilità. Questo è un dato cruciale che definisce l'IA e il comportamento dei nemici. I trigger trovati includono `on_hit`, `on_crit`, `low_hp`, `first_attack`, `every_X_turns`, `combat_start`.

### 3. Sistema di Scalabilità della Difficoltà (`TIER_SYSTEM`)

*   Questo oggetto definisce la logica per rendere il gioco progressivamente più difficile.
*   **Logica**: La difficoltà (`tier`) è basata sul numero di giorni sopravvissuti.
*   **Funzioni**:
    *   `getTierForDay()`: Calcola il tier attuale.
    *   `getAvailableEnemyTypes()`: Determina quali tipi di nemici (weak, standard, dangerous) possono apparire in base al tier.
    *   `getEnemyScaling()`: Applica un moltiplicatore alle statistiche di un nemico (HP, danno, etc.) in base al tier.

## Implicazioni per il Porting

*   **Design dei Dati da Replicare**: L'architettura di questi dati è eccellente e dovrebbe essere replicata. Nel nuovo engine, questi oggetti JavaScript potrebbero diventare file di dati dedicati (JSON, YAML, o tabelle di un database) per essere modificati facilmente senza toccare il codice del gioco.
*   **Specifiche per il Motore di Gioco**: Questo file agisce come una lista di requisiti per il vero motore di combattimento. Il motore dovrà essere in grado di:
    *   Leggere e interpretare questi dati.
    *   Gestire un sistema di effetti di stato a turni.
    *   Controllare i `trigger` delle abilità in ogni fase del combattimento (inizio turno, dopo un attacco, etc.).
    *   Utilizzare il `TIER_SYSTEM` quando genera gli incontri con i nemici.
*   **Ricerca del Motore**: L'analisi di questo file rende ancora più critica la ricerca del file che contiene il "motore" del combattimento, ovvero la logica che utilizza questi dati per eseguire un combattimento. I candidati più probabili sono `events.js` (se un combattimento è un tipo di evento) o `map.js` (se il combattimento è legato al movimento sulla mappa). 
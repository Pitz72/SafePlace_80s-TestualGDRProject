# FASE 2: Analisi della Generazione della Mappa - `map.js`

Questo documento analizza `archives/safeplace_advanced/js/map.js`, lo script responsabile della creazione procedurale del mondo di gioco e della gestione del movimento del giocatore al suo interno.

## 1. Architettura e Ruoli

Lo script ha due responsabilità principali:

1.  **Generazione del Mondo (`generateMap`)**: Contiene l'algoritmo che crea la griglia di gioco, posizionando i diversi tipi di terreno e i punti di interesse. Questa funzione viene chiamata una sola volta all'inizio di una nuova partita.
2.  **Gestione del Movimento (`movePlayer`)**: Contiene la logica che viene eseguita ogni volta che il giocatore si sposta. Questa funzione è il cuore del "turno" di gioco, in quanto non solo aggiorna la posizione del giocatore, ma innesca anche il consumo di risorse e la potenziale attivazione di eventi.

## 2. Algoritmo di Generazione della Mappa

La mappa non è generata in modo puramente casuale, ma segue un sofisticato algoritmo a più passaggi per creare un mondo che sia vario, coerente e giocabile.

### 2.1. Layer 1: Terreno Base e Ostacoli

1.  **Pianure**: L'intera mappa viene prima riempita con il terreno base, le pianure (`PLAINS`).
2.  **Montagne**: Successivamente, una piccola percentuale della mappa viene convertita in montagne (`MOUNTAIN`), che agiscono come ostacoli invalicabili. Vengono generate in piccoli "gruppi" per creare catene montuose invece di picchi isolati.

### 2.2. Layer 2: Punti Chiave di Gioco

1.  **Punto di Inizio (`START`)**: Viene posizionato in un'area casuale nel quadrante in alto a sinistra della mappa.
2.  **Punto di Fine (`END`)**: Viene posizionato nel quadrante in basso a destra, con un controllo che assicura che sia sempre a una distanza minima significativa dal punto di inizio. Questo garantisce che il giocatore debba attraversare la mappa per vincere.

### 2.3. Layer 3: Punti di Interesse (Cluster)

Città e villaggi non sono posizionati come singole caselle, ma vengono generati utilizzando un **algoritmo a cluster**:

1.  **Semina**: Per ogni città/villaggio da creare, viene scelto un "seme" (una casella) in una posizione valida (non su una montagna o troppo vicino ad altri punti di interesse).
2.  **Espansione**: A partire dal seme, l'algoritmo esegue una sorta di "passeggiata casuale" (random walk), convertendo le caselle di pianura adiacenti nello stesso tipo di terreno del seme (es. `CITY`). Questo crea aree urbane e villaggi di dimensioni e forme irregolari e organiche.
3.  **Foreste e Fiumi**: Anche questi elementi vengono generati con una logica a cluster o a percorso per creare biomi coerenti.

## 3. La Logica del Movimento (`movePlayer`)

La funzione `movePlayer` è molto più di un semplice aggiornamento di coordinate. È il vero motore del turno di gioco:

1.  **Validazione**: Controlla se la casella di destinazione è valida (attraversabile).
2.  **Aggiornamento Posizione**: Aggiorna le coordinate `x` e `y` del giocatore.
3.  **Consumo Risorse**: Decrementa cibo e acqua.
4.  **Avanzamento Tempo**: Incrementa il contatore delle mosse che determina il ciclo giorno/notte.
5.  **Attivazione Eventi**: Esegue un controllo di probabilità per vedere se sulla nuova casella si attiva un evento (sia un evento specifico del terreno, sia un evento complesso generico).
6.  **Aggiornamento UI**: Chiama le funzioni di rendering per aggiornare la visualizzazione della mappa e delle statistiche.

## 4. Implicazioni per il Porting

*   **Generatore Procedurale**: La logica di `generateMap` può essere incapsulata in una classe `MapGenerator`. Le costanti che ne definiscono i parametri (es. numero di città, dimensione dei cluster) dovrebbero essere esternalizzate in un file di configurazione per facilitare il tweaking.
*   **Modello di Dati della Mappa**: La struttura dati `map` (un array 2D di oggetti `tile`) è un modello solido che può essere replicato. Ogni `tile` potrebbe diventare un'istanza di una classe `Tile` con proprietà come `type`, `visited`, `hasEvent`, etc.
*   **Logica del Turno**: La funzione `movePlayer` definisce perfettamente la sequenza di operazioni che costituisce un turno di gioco. Nel porting, questa logica dovrebbe risiedere in un `GameManager` o `TurnManager` che, ricevuto l'input di movimento, esegue questi passaggi in ordine.

---

## APPENDICE A: Codice Sorgente Chiave (`map.js`)

### A.1 Generazione della Mappa

```javascript
function generateMap() {
    // 1. Inizializza la mappa con il terreno base (Pianura)
    for (let y = 0; y < MAP_HEIGHT; y++) {
        map[y] = [];
        for (let x = 0; x < MAP_WIDTH; x++) {
            map[y][x] = { type: TILE_SYMBOLS.PLAINS, visited: false };
        }
    }

    // 2. Aggiunge montagne in piccoli gruppi
    const mountainCount = Math.floor((MAP_WIDTH * MAP_HEIGHT) * 0.03);
    for (let i = 0; i < mountainCount; i++) {
        // ... (Logica per creare piccoli cluster di montagne) ...
    }

    // 3. Posiziona Start e End a distanza di sicurezza
    // ... (Logica per trovare posizioni valide per Start e End) ...
    player.x = startX;
    player.y = startY;

    // 4. Aggiunge Città e Villaggi usando un algoritmo a cluster
    const NUM_CITY_CENTERS = getRandomInt(2, 4);
    for (let i = 0; i < NUM_CITY_CENTERS; i++) {
        // Trova una posizione "seme" valida
        // ...
        // Si espande dal seme con un random walk per creare il cluster
        // ...
    }
    // ... (Logica simile per Villaggi, Foreste, Fiumi) ...
}
```

### A.2 Gestione del Movimento e del Turno

```javascript
function movePlayer(dx, dy) {
    const newX = player.x + dx;
    const newY = player.y + dy;

    // 1. Controlla se la mossa è valida
    if (newX < 0 || newX >= MAP_WIDTH || newY < 0 || newY >= MAP_HEIGHT || !isWalkable(map[newY][newX].type)) {
        addMessage("Non puoi andare in quella direzione.", "warning");
        return;
    }

    // 2. Aggiorna posizione e stato
    player.x = newX;
    player.y = newY;
    map[newY][newX].visited = true;

    // 3. Consuma risorse e avanza il tempo
    consumeResourcesOnMove(); // Dettaglio implementativo
    advanceTime(); // Dettaglio implementativo

    // 4. Controlla l'attivazione di eventi
    if (Math.random() < COMPLEX_EVENT_CHANCE) {
        triggerComplexEvent();
    } else {
        triggerTileEvent(map[newY][newX].type);
    }
    
    // 5. Applica effetti passivi (danni da veleno, malattia, etc.)
    applyPassiveStatusEffects();

    // 6. Aggiorna la UI
    renderMap();
    renderStats();
}
``` 
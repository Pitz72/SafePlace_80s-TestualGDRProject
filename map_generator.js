/**
 * The Safe Place - Minimal Roguelike
 * File: map_generator.js
 * Descrizione: Contiene le funzioni per la generazione della mappa di gioco.
 */

/**
 * Genera la mappa di gioco completa con tutti i tipi di terreno.
 * Piazza anche il giocatore e definisce le coordinate di fine.
 */
function generateMap() {
    // Resetta la mappa
    map = Array(MAP_HEIGHT).fill().map(() => Array(MAP_WIDTH).fill(TILE_SYMBOLS.PLAINS));
    // Debug log solo in modalità sviluppo
    if (typeof DEV_MODE !== 'undefined' && DEV_MODE) {
        console.log("Generazione mappa...");
    }
    
    // Aggiunge montagne (ostacoli)
    const mountainCount = Math.floor((MAP_WIDTH * MAP_HEIGHT) * 0.06); // 6% della mappa
    for (let i = 0; i < mountainCount; i++) {
        const mountainSize = getRandomInt(1, 3); // Gruppi di 1-3 montagne
        const x = getRandomInt(0, MAP_WIDTH - 1);
        const y = getRandomInt(0, MAP_HEIGHT - 1);
        
        // Genera montagne in gruppo
        for (let j = 0; j < mountainSize; j++) {
            // Aggiunge una montagna in posizione adiacente alla precedente
            const adjX = Math.min(Math.max(0, x + getRandomInt(-1, 1)), MAP_WIDTH - 1);
            const adjY = Math.min(Math.max(0, y + getRandomInt(-1, 1)), MAP_HEIGHT - 1);
            map[adjY][adjX] = TILE_SYMBOLS.MOUNTAIN;
        }
    }
    
    // Aggiunge foreste (terreno speciale)
    const forestCount = Math.floor((MAP_WIDTH * MAP_HEIGHT) * 0.1); // 10% della mappa
    for (let i = 0; i < forestCount; i++) {
        const forestSize = getRandomInt(3, 6); // Gruppi di 3-6 alberi
        const x = getRandomInt(0, MAP_WIDTH - 1);
        const y = getRandomInt(0, MAP_HEIGHT - 1);
        
        // Genera foreste in gruppo
        for (let j = 0; j < forestSize; j++) {
            // Aggiunge un albero in posizione adiacente al precedente
            const adjX = Math.min(Math.max(0, x + getRandomInt(-2, 2)), MAP_WIDTH - 1);
            const adjY = Math.min(Math.max(0, y + getRandomInt(-2, 2)), MAP_HEIGHT - 1);
            
            // Evita di sovrascrivere montagne
            if (map[adjY][adjX] !== TILE_SYMBOLS.MOUNTAIN) {
                map[adjY][adjX] = TILE_SYMBOLS.FOREST;
            }
        }
    }
    
    // Aggiunge fiumi (ostacoli parziali)
    const riverCount = getRandomInt(2, 3); // 2-3 fiumi sulla mappa
    for (let i = 0; i < riverCount; i++) {
        // I fiumi iniziano da un bordo e scorrono orizzontalmente o verticalmente
        const isHorizontal = Math.random() < 0.5;
        
        if (isHorizontal) {
            // Fiume orizzontale (da sinistra a destra)
            const startY = getRandomInt(3, MAP_HEIGHT - 4);
            let currentY = startY;
            
            for (let x = 0; x < MAP_WIDTH; x++) {
                // Ogni tanto il fiume cambia leggermente direzione
                if (Math.random() < 0.3 && x > 0) {
                    const direction = Math.random() < 0.5 ? 1 : -1;
                    currentY = Math.min(Math.max(1, currentY + direction), MAP_HEIGHT - 2);
                }
                
                map[currentY][x] = TILE_SYMBOLS.RIVER;
            }
        } else {
            // Fiume verticale (dall'alto in basso)
            const startX = getRandomInt(3, MAP_WIDTH - 4);
            let currentX = startX;
            
            for (let y = 0; y < MAP_HEIGHT; y++) {
                // Ogni tanto il fiume cambia leggermente direzione
                if (Math.random() < 0.3 && y > 0) {
                    const direction = Math.random() < 0.5 ? 1 : -1;
                    currentX = Math.min(Math.max(1, currentX + direction), MAP_WIDTH - 2);
                }
                
                map[y][currentX] = TILE_SYMBOLS.RIVER;
            }
        }
    }
    
    // Aggiunge villaggi (risorse, eventi)
    const villageCount = getRandomInt(3, 5); // 3-5 villaggi sulla mappa
    for (let i = 0; i < villageCount; i++) {
        // Trova una posizione valida per il villaggio (non su montagne o fiumi)
        let x, y;
        let attempts = 0;
        do {
            x = getRandomInt(5, MAP_WIDTH - 6);
            y = getRandomInt(5, MAP_HEIGHT - 6);
            attempts++;
        } while ((map[y][x] === TILE_SYMBOLS.MOUNTAIN || map[y][x] === TILE_SYMBOLS.RIVER) && attempts < 100);
        
        if (attempts < 100) {
            map[y][x] = TILE_SYMBOLS.VILLAGE;
        }
    }
    
    // Aggiunge città (risorse, eventi)
    const cityCount = getRandomInt(1, 2); // 1-2 città sulla mappa
    for (let i = 0; i < cityCount; i++) {
        // Trova una posizione valida per la città (non su montagne, fiumi o villaggi)
        let x, y;
        let attempts = 0;
        do {
            x = getRandomInt(8, MAP_WIDTH - 9);
            y = getRandomInt(8, MAP_HEIGHT - 9);
            attempts++;
        } while ((map[y][x] === TILE_SYMBOLS.MOUNTAIN || map[y][x] === TILE_SYMBOLS.RIVER || 
                  map[y][x] === TILE_SYMBOLS.VILLAGE) && attempts < 100);
        
        if (attempts < 100) {
            map[y][x] = TILE_SYMBOLS.CITY;
        }
    }
    
    // Aggiunge aree di sosta (salute, riposo)
    const restStopCount = getRandomInt(2, 4); // 2-4 aree di sosta sulla mappa
    for (let i = 0; i < restStopCount; i++) {
        // Trova una posizione valida (non su altre strutture)
        let x, y;
        let attempts = 0;
        do {
            x = getRandomInt(3, MAP_WIDTH - 4);
            y = getRandomInt(3, MAP_HEIGHT - 4);
            attempts++;
        } while ((map[y][x] !== TILE_SYMBOLS.PLAINS && map[y][x] !== TILE_SYMBOLS.FOREST) && attempts < 100);
        
        if (attempts < 100) {
            map[y][x] = TILE_SYMBOLS.REST_STOP;
        }
    }
    
    // Posiziona il giocatore in una posizione casuale ma accessibile
    let startX, startY;
    let attempts = 0;
    do {
        startX = getRandomInt(1, Math.floor(MAP_WIDTH / 4)); // Prime colonne
        startY = getRandomInt(1, MAP_HEIGHT - 2);
        attempts++;
    } while (!isWalkable(map[startY][startX]) && attempts < 100);
    
    // Per sicurezza, se dopo 100 tentativi non si trova una posizione valida
    if (attempts >= 100) {
        // Cerca il primo punto valido nella mappa
        for (let y = 0; y < MAP_HEIGHT; y++) {
            for (let x = 0; x < MAP_WIDTH; x++) {
                if (isWalkable(map[y][x])) {
                    startX = x;
                    startY = y;
                    break;
                }
            }
            if (startX !== undefined) break;
        }
    }
    
    // Posiziona il punto di partenza
    map[startY][startX] = TILE_SYMBOLS.START;
    player.x = startX;
    player.y = startY;
    
    // Posiziona il punto di arrivo in una posizione lontana dal giocatore
    let endX, endY;
    attempts = 0;
    do {
        endX = getRandomInt(Math.floor(MAP_WIDTH * 3/4), MAP_WIDTH - 2); // Ultime colonne
        endY = getRandomInt(1, MAP_HEIGHT - 2);
        attempts++;
    } while (!isWalkable(map[endY][endX]) && attempts < 100);
    
    // Per sicurezza, se dopo 100 tentativi non si trova una posizione valida
    if (attempts >= 100) {
        // Cerca l'ultimo punto valido nella mappa
        for (let y = MAP_HEIGHT - 1; y >= 0; y--) {
            for (let x = MAP_WIDTH - 1; x >= 0; x--) {
                if (isWalkable(map[y][x])) {
                    endX = x;
                    endY = y;
                    break;
                }
            }
            if (endX !== undefined) break;
        }
    }
    
    // Posiziona il punto di arrivo
    map[endY][endX] = TILE_SYMBOLS.END;
    
    // Debug log solo in modalità sviluppo
    if (typeof DEV_MODE !== 'undefined' && DEV_MODE) {
        console.log("Mappa generata!");
    }
} 
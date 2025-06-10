/**
 * THE SAFE PLACE - LORE EVENT MANAGER
 * v1.0.0 "Ultimo's Journey"
 * 
 * Sistema intelligente per gestire l'apparizione degli eventi narrativi
 * durante il viaggio di Ultimo verso il Safe Place
 */

const LoreEventManager = {
    // Parametri di controllo
    baseEventChance: 0.05, // 5% base chance per movimento
    distanceWeight: 0.3,  // Peso della distanza percorsa
    timeWeight: 0.2,      // Peso del tempo trascorso
    explorationWeight: 0.2, // Peso dell'esplorazione
    narrativePacingWeight: 0.3, // Peso del ritmo narrativo
    
    // Calcola la probabilità dinamica di un evento lore
    calculateEventProbability(playerState) {
        const daysSurvived = playerState.daysSurvived || 0;
        const distanceTraveled = this.calculateTotalDistance(playerState);
        const explorationScore = this.calculateExplorationScore(playerState);
        const narrativePacing = this.calculateNarrativePacing(playerState);
        
        // Calcolo probabilità pesata
        let probability = this.baseEventChance;
        
        // Aumenta con la distanza percorsa
        probability += (distanceTraveled / 1000) * this.distanceWeight;
        
        // Aumenta con i giorni sopravvissuti (più aggressivo per partite brevi)
        probability += (daysSurvived / 10) * this.timeWeight;
        
        // Aumenta con l'esplorazione di nuove aree
        probability += explorationScore * this.explorationWeight;
        
        // Modulato dal ritmo narrativo
        probability *= narrativePacing;
        
        // Clamp tra 0 e 0.3 (max 30% per evitare spam)
        return Math.min(0.3, Math.max(0, probability));
    },
    
    // Calcola la distanza totale percorsa
    calculateTotalDistance(playerState) {
        if (!playerState.moveHistory) return 0;
        
        let totalDistance = 0;
        for (let i = 1; i < playerState.moveHistory.length; i++) {
            const prev = playerState.moveHistory[i-1];
            const curr = playerState.moveHistory[i];
            totalDistance += Math.sqrt(
                Math.pow(curr.x - prev.x, 2) + 
                Math.pow(curr.y - prev.y, 2)
            );
        }
        return totalDistance;
    },
    
    // Calcola quanto il giocatore ha esplorato
    calculateExplorationScore(playerState) {
        if (!playerState.visitedTiles) return 0;
        
        // Conta tiles uniche visitate
        const uniqueTiles = new Set(playerState.visitedTiles.map(t => `${t.x},${t.y}`));
        const explorationRatio = uniqueTiles.size / (MAP_WIDTH * MAP_HEIGHT * 0.1); // 10% della mappa
        
        return Math.min(1, explorationRatio);
    },
    
    // Calcola il ritmo narrativo ottimale
    calculateNarrativePacing(playerState) {
        const seenEvents = playerState.seenLoreEvents || [];
        const lastEventTime = playerState.lastLoreEventTime || 0;
        const currentTime = playerState.daysSurvived || 0;
        const timeSinceLastEvent = currentTime - lastEventTime;
        
        // Adattato per partite di 5-6 giorni
        if (timeSinceLastEvent > 2) {
            return 2.5; // Aumenta molto la probabilità dopo 2 giorni
        } else if (timeSinceLastEvent > 1) {
            return 1.8; // Aumenta dopo 1 giorno
        } else if (timeSinceLastEvent < 0.5) {
            return 0.3; // Riduci molto se troppo vicini (meno di mezzo giorno)
        }
        
        return 1.0;
    },
    
    // Determina se triggerare un evento lore
    shouldTriggerLoreEvent(playerState) {
        const probability = this.calculateEventProbability(playerState);
        const roll = Math.random();
        
        if (DEBUG_MODE) {
            console.log(`[LoreEventManager] Probabilità evento: ${(probability * 100).toFixed(1)}%, Roll: ${(roll * 100).toFixed(1)}%`);
        }
        
        return roll < probability;
    },
    
    // Ottiene il prossimo evento appropriato basato sul contesto
    getContextualLoreEvent(playerState) {
        if (typeof getNextLoreEvent !== 'function') return null;
        
        const nextEvent = getNextLoreEvent(playerState);
        if (!nextEvent) return null;
        
        // Verifica se il contesto è appropriato
        if (this.isEventContextAppropriate(nextEvent, playerState)) {
            return nextEvent;
        }
        
        return null;
    },
    
    // Verifica se il contesto è appropriato per l'evento
    isEventContextAppropriate(event, playerState) {
        // Eventi iniziali: meglio in zone sicure
        if (event.id.includes('echo_of_departure') || event.id.includes('first_test')) {
            const currentTile = map[playerState.y]?.[playerState.x];
            return currentTile && (currentTile.type === 'P' || currentTile.type === 'F');
        }
        
        // Eventi di metà viaggio: qualsiasi luogo va bene
        if (event.id.includes('shadows_of_others') || event.id.includes('dilemma')) {
            return true;
        }
        
        // Eventi finali: meglio vicino al Safe Place
        if (event.id.includes('guardian') || event.id.includes('hidden_valley')) {
            const distanceToSafePlace = calculateDistanceFromSafePlace(playerState.x, playerState.y);
            return distanceToSafePlace < 30;
        }
        
        return true;
    },
    
    // Segna sulla mappa (opzionale) dove potrebbero apparire eventi
    markPotentialEventLocations(map, playerState) {
        const potentialLocations = [];
        
        // Analizza la mappa per trovare luoghi narrativamente interessanti
        for (let y = 0; y < MAP_HEIGHT; y++) {
            for (let x = 0; x < MAP_WIDTH; x++) {
                const tile = map[y][x];
                let score = 0;
                
                // Villaggi e città sono luoghi narrativamente ricchi
                if (tile.type === 'V' || tile.type === 'C') score += 2;
                
                // Rifugi possono nascondere segreti
                if (tile.type === 'R') score += 1;
                
                // Posizioni lungo il percorso ottimale
                const onPath = this.isOnOptimalPath(x, y, playerState);
                if (onPath) score += 3;
                
                if (score >= 3) {
                    potentialLocations.push({ x, y, score });
                }
            }
        }
        
        return potentialLocations.sort((a, b) => b.score - a.score).slice(0, 10);
    },
    
    // Verifica se una posizione è sul percorso ottimale
    isOnOptimalPath(x, y, playerState) {
        const startX = playerState.startX || 0;
        const startY = playerState.startY || 0;
        const endX = MAP_WIDTH - 1;
        const endY = MAP_HEIGHT - 1;
        
        // Calcola se il punto è approssimativamente sulla linea tra start e end
        const crossProduct = (y - startY) * (endX - startX) - (x - startX) * (endY - startY);
        const distance = Math.abs(crossProduct) / Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
        
        return distance < 20; // Entro 20 tiles dal percorso ideale
    }
};

// Integrazione con il sistema di movimento esistente
if (typeof window !== 'undefined') {
    // Hook per controllare eventi lore ad ogni movimento
    const originalMovePlayer = window.movePlayer;
    if (originalMovePlayer) {
        window.movePlayer = function(dx, dy) {
            const result = originalMovePlayer(dx, dy);
            
            if (result && gameActive) {
                // Prepara lo stato del giocatore
                const playerState = {
                    ...player,
                    daysSurvived: daysSurvived,
                    moveHistory: player.moveHistory || [],
                    visitedTiles: player.visitedTiles || [],
                    seenLoreEvents: player.seenLoreEvents || [],
                    lastLoreEventTime: player.lastLoreEventTime || 0
                };
                
                // Aggiorna la storia dei movimenti
                if (!player.moveHistory) player.moveHistory = [];
                player.moveHistory.push({ x: player.x, y: player.y, day: daysSurvived });
                
                // Aggiorna tiles visitate
                if (!player.visitedTiles) player.visitedTiles = [];
                player.visitedTiles.push({ x: player.x, y: player.y });
                
                // Controlla se triggerare un evento lore
                if (LoreEventManager.shouldTriggerLoreEvent(playerState)) {
                    const loreEvent = LoreEventManager.getContextualLoreEvent(playerState);
                    if (loreEvent) {
                        // Aggiorna il timestamp dell'ultimo evento
                        player.lastLoreEventTime = daysSurvived;
                        
                        // Triggera l'evento
                        if (typeof triggerLoreEvent === 'function') {
                            triggerLoreEvent(loreEvent);
                        }
                    }
                }
            }
            
            return result;
        };
    }
}

// Esporta per debug
window.LoreEventManager = LoreEventManager; 
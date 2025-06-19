# Analisi Gestore Eventi di Trama - `lore_event_manager.js`

Questo documento analizza il file `archives/safeplace_advanced/js/lore_event_manager.js`, che gestisce la progressione della narrazione principale del gioco.

## Ruolo e Responsabilità

Questo script introduce un sofisticato sistema per la gestione degli eventi di trama (lore), che opera in parallelo al sistema di eventi casuali definito in `events.js`. Le sue responsabilità sono:

1.  **Gestione del Ritmo Narrativo (Pacing)**: Invece di affidarsi a una semplice probabilità casuale, questo manager utilizza un algoritmo di **probabilità dinamica** per decidere quando presentare al giocatore il prossimo evento della storia principale.
2.  **Innesco Contesto-Sensibile**: Assicura che gli eventi di trama appaiano in momenti e luoghi appropriati, migliorando la coerenza e l'immersione.
3.  **Integrazione con il Gameplay**: Si "aggancia" al movimento del giocatore per valutare, ad ogni passo, se è il momento giusto per un nuovo sviluppo narrativo.

## Sistema di Probabilità Dinamica

Il cuore del manager è la sua capacità di calcolare una probabilità di evento che si adatta all'esperienza del giocatore. La probabilità viene calcolata ad ogni mossa e dipende da una serie di fattori pesati:

*   **Distanza Percorsa**: Più il giocatore viaggia, più è probabile che accada qualcosa.
*   **Tempo Trascorso**: Più giorni passano, più la storia preme per avanzare.
*   **Grado di Esplorazione**: Il sistema premia i giocatori che esplorano attivamente la mappa.
*   **Ritmo Narrativo**: Questo è il fattore più intelligente. Il sistema aumenta drasticamente la probabilità se è passato troppo tempo dall'ultimo evento di trama e la riduce se ne è appena accaduto uno. Questo previene sia i "buchi" narrativi sia la sensazione che gli eventi siano troppo affrettati.

## Flusso Operativo

1.  **Hooking (Monkey Patching)**: Lo script intercetta la funzione globale `movePlayer` e vi aggiunge la propria logica. Dopo che il movimento del giocatore è stato eseguito, il Lore Event Manager esegue i suoi controlli.
2.  **Valutazione**: Ad ogni mossa, la funzione `shouldTriggerLoreEvent` calcola la probabilità dinamica e fa un "tiro di dado" virtuale.
3.  **Selezione dell'Evento**: Se il tiro ha successo, `getContextualLoreEvent` viene chiamato per recuperare il prossimo evento di trama dalla sequenza narrativa (definita in un file esterno, probabilmente `js/data/lore_events_linear.js`).
4.  **Verifica del Contesto**: La funzione `isEventContextAppropriate` controlla se l'evento è adatto alla situazione attuale (es. l'evento finale non può apparire all'inizio del gioco).
5.  **Innesco**: Se tutte le condizioni sono soddisfatte, viene chiamata una funzione esterna (`triggerLoreEvent`) per mostrare l'evento al giocatore.

## Architettura e Implicazioni per il Porting

*   **Sistema a Due Livelli per gli Eventi**: L'analisi conferma l'esistenza di due sistemi di eventi distinti e complementari:
    1.  Un sistema per gli **eventi casuali/emergenti** (`events.js`) che crea varietà e sfide di gameplay.
    2.  Un sistema per gli **eventi di trama/scritti** (`lore_event_manager.js`) che garantisce una progressione narrativa coerente e ben ritmata.
*   **Design Sofisticato**: L'approccio del pacing dinamico è una tecnica di game design avanzata. Nel porting, questo sistema dovrebbe essere preservato per mantenere la qualità dell'esperienza narrativa. Può essere implementato come una classe `LoreEventManager` che viene "interpellata" dal game loop ad ogni turno.
*   **Separazione Dati/Logica**: Come per gli altri sistemi, c'è una buona separazione tra la *logica* di innesco (in questo file) e il *contenuto* degli eventi (in un file di dati esterno). Questo rende il sistema facile da manutenere e da espandere con nuovi eventi di trama senza modificare il motore di pacing.

---

## APPENDICE A: Codice Sorgente Grezzo (`lore_event_manager.js`)

Di seguito è riportato il codice sorgente completo del `LoreEventManager`, che illustra l'algoritmo di pacing dinamico e il suo meccanismo di integrazione nel gioco.

### A.1 Oggetto `LoreEventManager`

Questo oggetto contiene tutta la logica per calcolare la probabilità di un evento di trama, verificarne il contesto e selezionare quello appropriato.

```javascript
const LoreEventManager = {
    // Parametri di controllo
    baseEventChance: 0.05, // 5% base chance per movimento
    distanceWeight: 0.3,  // Peso della distanza percorsa
    timeWeight: 0.2,      // Peso del tempo trascorso
    explorationWeight: 0.2, // Peso dell'esplorazione
    narrativePacingWeight: 0.3, // Peso del ritmo narrativo
    
    // Calcola la probabilità dinamica di un evento lore
    calculateEventProbability(playerState) {
        // ... (implementazione della formula di calcolo pesato) ...
        
        // Clamp tra 0 e 0.3 (max 30% per evitare spam)
        return Math.min(0.3, Math.max(0, probability));
    },
    
    // Calcola la distanza totale percorsa
    calculateTotalDistance(playerState) {
        // ... (logica per calcolare la distanza euclidea tra i punti della cronologia movimenti) ...
        return totalDistance;
    },
    
    // Calcola quanto il giocatore ha esplorato
    calculateExplorationScore(playerState) {
        // ... (conta le caselle uniche visitate e le rapporta a una porzione della mappa) ...
        return Math.min(1, explorationRatio);
    },
    
    // Calcola il ritmo narrativo ottimale
    calculateNarrativePacing(playerState) {
        const timeSinceLastEvent = // ... calcola tempo dall'ultimo evento ...
        
        // Aumenta o diminuisce la probabilità per evitare eventi troppo vicini o troppo lontani
        if (timeSinceLastEvent > 2) return 2.5; 
        if (timeSinceLastEvent < 0.5) return 0.3;
        return 1.0;
    },
    
    // Determina se triggerare un evento lore
    shouldTriggerLoreEvent(playerState) {
        const probability = this.calculateEventProbability(playerState);
        const roll = Math.random();
        return roll < probability;
    },
    
    // Ottiene il prossimo evento appropriato basato sul contesto
    getContextualLoreEvent(playerState) {
        const nextEvent = getNextLoreEvent(playerState); // Funzione esterna che legge da lore_events_linear.js
        if (!nextEvent) return null;
        
        if (this.isEventContextAppropriate(nextEvent, playerState)) {
            return nextEvent;
        }
        return null;
    },
    
    // Verifica se il contesto è appropriato per l'evento
    isEventContextAppropriate(event, playerState) {
        // Esempio: Controlla che gli eventi finali accadano solo vicino alla destinazione
        if (event.id.includes('guardian')) {
            const distanceToSafePlace = calculateDistanceFromSafePlace(playerState.x, playerState.y);
            return distanceToSafePlace < 30;
        }
        return true;
    }
};
```

### A.2 Meccanismo di Integrazione (Hooking)

Questa sezione di codice mostra come il `LoreEventManager` si "aggancia" alla funzione di movimento del giocatore per eseguire i suoi controlli ad ogni passo, una tecnica nota come "monkey patching".

```javascript
// Integrazione con il sistema di movimento esistente
if (typeof window !== 'undefined') {
    // Hook per controllare eventi lore ad ogni movimento
    const originalMovePlayer = window.movePlayer;
    if (originalMovePlayer) {
        window.movePlayer = function(dx, dy) {
            // Esegue la funzione di movimento originale
            const result = originalMovePlayer(dx, dy);
            
            // Se il movimento ha avuto successo, esegue la logica del Lore Manager
            if (result && gameActive) {
                const playerState = { /* ... prepara lo stato del giocatore ... */ };

                if (LoreEventManager.shouldTriggerLoreEvent(playerState)) {
                    const loreEvent = LoreEventManager.getContextualLoreEvent(playerState);
                    if (loreEvent) {
                        // Innesca l'evento di trama
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
``` 
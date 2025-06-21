# Discrepanza Architettura Frontend JavaScript

**ATTENZIONE: Questo è un documento fondamentale per la comprensione del frontend.**

## Rilevamento

Durante l'analisi della **FASE 2**, è emersa una grave discrepanza tra l'architettura degli script JavaScript come documentata nel file `index.html` e la struttura dei file effettivamente presenti nella cartella `archives/safeplace_advanced/js/`.

**L'architettura descritta in `index.html` (che prevede una sottocartella `js/managers/`) è OBSOLETA e NON corrisponde alla realtà dei file.**

## Struttura Reale dei File

L'analisi della cartella `js/` ha rivelato una struttura "appiattita" (senza la sottocartella `managers`) e con nomi di file diversi. La logica che `index.html` si aspetta di trovare in `js/managers/` è invece contenuta in file nella directory `js/` principale.

### Mappatura Probabile (Da Obsoleta a Reale)

| Percorso in `index.html` (Obsoleto) | File Reale Trovato (Ipotesi) | Note |
| --- | --- | --- |
| `js/main.js` | (Nessun file) | La logica di inizializzazione è probabilmente contenuta in `game_core.js` o `ui.js`. |
| `js/managers/game_manager.js` | `js/game_core.js` | `game_core.js` è il candidato più probabile per contenere il loop di gioco e la coordinazione. |
| `js/managers/ui_manager.js` | `js/ui.js` | Nome simile e dimensione elevata lo rendono il candidato perfetto per la gestione della UI. |
| `js/managers/player_manager.js` | `js/player.js` | Altamente probabile che contenga la logica e i dati relativi al giocatore. |
| `js/managers/map_manager.js` | `js/map.js` | Altamente probabile che contenga la logica per la generazione e visualizzazione della mappa. |
| `js/managers/save_load_manager.js`| `js/api_client.js` | `api_client.js` gestisce sicuramente la comunicazione con il backend PHP. |
| `js/data/items_database.js`, etc. | `js/game_data.js` | Il file `game_data.js` è molto grande (197KB) e probabilmente consolida tutti i dati di gioco. |

### Altre Osservazioni

*   La presenza di numerosi file con il suffisso `_fix.js` o `_integration.js` (`v1_ultimate_fix.js`, `advanced_items_integration.js`, etc.) suggerisce un processo di sviluppo in cui le modifiche sono state aggiunte in nuovi file invece di essere integrate nei file principali. Questo potrebbe rendere l'analisi del flusso di esecuzione più complessa.

## Implicazioni per il Porting

*   **Ignorare la struttura in `index.html`**: Per l'analisi del frontend, la lista di script in `index.html` va ignorata. Bisogna basarsi esclusivamente sui file reali presenti nella cartella `js/`.
*   **Nuovo Piano di Analisi**: L'analisi della FASE 2.2 deve essere ri-orientata sui file reali. Il punto di partenza sarà `game_core.js` e `ui.js` per comprendere l'inizializzazione e il flusso principale.
*   **Aggiornamento Roadmap**: La roadmap verrà aggiornata per riflettere i nomi dei file corretti. 
# Analisi Sistema di Gestione Inventario

Questo documento riassume e formalizza l'analisi del sistema di gestione dell'inventario, la cui logica è distribuita principalmente tra `player.js` e `ui.js`.

## Componenti del Sistema

Il sistema di inventario è composto da tre parti principali:

1.  **Stato dei Dati (`player.js`)**: La definizione dei dati dell'inventario all'interno dell'oggetto `player`.
2.  **Logica delle Azioni (`player.js`)**: Le funzioni che modificano lo stato dell'inventario.
3.  **Presentazione e Interazione (`ui.js`)**: Le funzioni che disegnano l'inventario e gestiscono l'input dell'utente.

## 1. Stato dei Dati

La gestione dei dati dell'inventario risiede in queste proprietà dell'oggetto `player`:

*   `player.inventory`: Un array che rappresenta gli slot dell'inventario. Ogni elemento dell'array è un oggetto che rappresenta uno "stack" di oggetti, con almeno le seguenti proprietà:
    *   `itemId`: L'ID univoco dell'oggetto (es. `"canned_food"`).
    *   `quantity`: Il numero di oggetti in quello stack.
    *   (Opzionale) `current_portions`: Per oggetti che hanno usi multipli (es. una bottiglia d'acqua).
*   `player.equippedWeapon`: Un oggetto che rappresenta l'arma equipaggiata. Contiene `itemId` e dati di istanza come `currentDurability`.
*   `player.equippedArmor`: Un oggetto che rappresenta l'armatura equipaggiata, con una struttura simile a quella dell'arma.

## 2. Logica delle Azioni

Le funzioni in `player.js` gestiscono tutte le manipolazioni dell'inventario:

*   **Aggiunta/Rimozione**:
    *   `addItemToInventory(itemId, quantity)`: Aggiunge un oggetto. Gestisce correttamente gli oggetti "stackabili" (aumentando la quantità di uno stack esistente) e i limiti di spazio dell'inventario.
    *   `removeItemFromInventory(itemId, quantity)`: Rimuove una certa quantità di un oggetto, o l'intero stack.
    *   `dropItem(itemId, quantity)`: Logica per abbandonare oggetti.
*   **Uso ed Equipaggiamento**:
    *   `useItem(itemId)`: Contiene la logica complessa per applicare l'effetto di un oggetto consumabile (es. mangiare cibo, usare un medkit).
    *   `equipItem(itemId)`: Sposta un oggetto dall'inventario a uno slot di equipaggiamento (`equippedWeapon` o `equippedArmor`), spesso applicando bonus alle statistiche del giocatore.
    *   `unequipItem(slotKey)`: L'inverso di `equipItem`, sposta un oggetto equipaggiato di nuovo nell'inventario.
*   **Manutenzione**:
    *   `applyWearToEquippedItem(slotKey, wearAmount)`: Diminuisce la durabilità di un oggetto equipaggiato dopo un'azione (es. un attacco).
    *   `attemptRepairItem(...)`: Gestisce la logica di riparazione degli oggetti.

## 3. Presentazione e Interazione

La parte visiva e interattiva è gestita in `ui.js`:

*   **Visualizzazione**:
    *   `renderInventory()`: La funzione chiave che legge `player.inventory` e genera dinamicamente la lista HTML degli oggetti.
    *   `renderStats()`: Aggiorna la visualizzazione degli oggetti in `player.equippedWeapon` e `player.equippedArmor`.
*   **Interazione Utente**:
    *   `handleInventoryClick(event)` (in `player.js` ma legato dalla UI): Cattura il click su un oggetto dell'inventario.
    *   `showItemActionPopup(itemId, source)` (in `player.js`): Mostra un popup con le azioni disponibili per l'oggetto cliccato (Usa, Equipaggia, Lascia, etc.).
    *   `showItemTooltip(itemSlot, event)` (in `ui.js`): Mostra una descrizione dettagliata dell'oggetto quando il mouse ci passa sopra.

## Flusso Operativo (Esempio: Usare un Medkit)

1.  **Input**: L'utente clicca sull'oggetto "Medkit" nella lista dell'inventario visualizzata da `renderInventory`.
2.  **Popup Azioni**: L'evento click chiama `handleInventoryClick`, che a sua volta chiama `showItemActionPopup("medkit", "inventory")`. Appare un popup con il bottone "Usa".
3.  **Azione**: L'utente clicca "Usa". L'evento click del popup chiama `useItem("medkit")`.
4.  **Modifica Stato**: La funzione `useItem` aumenta `player.hp` e chiama `removeItemFromInventory("medkit", 1)`.
5.  **Aggiornamento UI**: Al termine, `useItem` chiama `renderStats()` e `renderInventory()` per mostrare l'aumento della salute e la diminuzione della quantità di medkit.

## Implicazioni per il Porting

*   **Sistema Robusto**: Il sistema di inventario è ben strutturato e completo. La logica è quasi interamente contenuta in `player.js`, rendendola relativamente facile da isolare.
*   **Classe `InventoryManager`**: Nel porting, questa logica potrebbe essere estratta da `player.js` e inserita in una classe dedicata `InventoryManager` o `InventoryController`, che verrebbe poi posseduta dall'oggetto `Player`.
*   **Interfaccia Utente**: L'interfaccia utente del nuovo gioco dovrà fornire gli stessi punti di interazione: una lista di inventario cliccabile, slot per l'equipaggiamento e popup per le azioni e i tooltip. 
# Analisi Sistemi di Progressione

Questo documento riassume e formalizza l'analisi dei sistemi di progressione del personaggio, la cui logica è quasi interamente contenuta nel file `player.js`.

## Componenti del Sistema

Il sistema di progressione è ispirato a meccaniche D&D/GDR classiche e si basa su due concetti principali:

1.  **Guadagno di Esperienza (XP)**: Il giocatore viene ricompensato con punti esperienza per aver compiuto azioni significative.
2.  **Miglioramento delle Statistiche**: I punti esperienza, una volta accumulati a sufficienza (anche se non c'è un sistema di "livelli" esplicito), si traducono in punti spendibili per aumentare le statistiche base del personaggio.

## 1. Stato dei Dati

La progressione del personaggio è tracciata tramite le seguenti proprietà dell'oggetto `player`:

*   `player.experience`: Un valore numerico che rappresenta i punti esperienza totali accumulati.
*   `player.availableStatPoints`: Un valore numerico che rappresenta i "punti abilità" che il giocatore può spendere per migliorare le sue statistiche.
*   `player.totalStatUpgrades`: Un contatore che tiene traccia di quante volte le statistiche sono state migliorate, probabilmente usato per bilanciamento o per calcolare i costi futuri.

## 2. Logica di Funzionamento

Le due funzioni chiave che governano questo sistema si trovano in `player.js`:

*   **`awardExperience(expAmount, reason)`**:
    *   **Scopo**: Aggiungere punti esperienza al personaggio.
    *   **Funzionamento**: Questa funzione viene chiamata da altre parti del codice quando il giocatore completa un'azione meritevole (es. vince un combattimento, supera uno skill check difficile, completa un evento).
    *   **Logica di Conversione**: All'interno di questa funzione (o in una funzione strettamente correlata), c'è una logica che controlla se l'esperienza accumulata è sufficiente a guadagnare un nuovo `availableStatPoint`. Il gioco sembra non avere livelli tradizionali (es. "raggiungi 1000 XP per il livello 2"). Invece, potrebbe funzionare a soglie (es. "ogni 250 XP guadagni 1 punto statistica"). L'esatta formula di conversione XP -> Punti non è esplicita ma è il cuore del bilanciamento della progressione.

*   **`improveStat(statName)`**:
    *   **Scopo**: Utilizzare un punto statistica per aumentare un attributo base.
    *   **Funzionamento**: Questa funzione viene chiamata quando il giocatore interagisce con la UI di miglioramento delle statistiche.
    *   **Logica**:
        1.  Controlla se `player.availableStatPoints > 0`.
        2.  Se sì, decrementa `availableStatPoints` di 1.
        3.  Incrementa la statistica richiesta (es. `player.stats.forza`) di 1.
        4.  Incrementa il contatore `totalStatUpgrades`.
        5.  Probabilmente ricalcola le statistiche derivate (come `player.maxHp` se la statistica aumentata era `vigore`).

## 3. Interazione con la UI

*   L'interfaccia utente (`ui.js`) ha il compito di visualizzare `player.experience` e `player.availableStatPoints` nel pannello delle statistiche.
*   La UI (`renderStats`) applica uno stile speciale (es. colore verde, grassetto) all'indicatore dei punti disponibili quando il suo valore è maggiore di zero, per notificare al giocatore che può migliorare il suo personaggio.
*   Esiste un popup o una sezione dell'interfaccia (menzionato come `showStatImprovementPopup` in `player.js`) che permette al giocatore di scegliere quale statistica aumentare.

## Implicazioni per il Porting

*   **Sistema Semplice ma Efficace**: Il sistema di progressione è diretto e facile da capire per il giocatore, il che è un punto di forza.
*   **Bilanciamento Chiave**: Il cuore di questo sistema, da preservare con attenzione, è la "curva di progressione": quanti XP vengono dati per ogni azione e quanti XP servono per ottenere un punto statistica. Questi valori sono fondamentali per il "feel" del gioco.
*   **Incapsulamento**: Nel porting, questa logica si adatta perfettamente a essere incapsulata all'interno di una classe `Player` o in un "sottosistema" `ProgressionSystem` gestito dal giocatore.
*   **Interfaccia Utente**: L'interfaccia del nuovo gioco dovrà includere:
    *   La visualizzazione di XP e Punti Disponibili.
    *   Un pulsante o un'area cliccabile per aprire la schermata di miglioramento delle statistiche.
    *   Una schermata o un popup dove il giocatore può vedere le sue statistiche e spendere i punti. 
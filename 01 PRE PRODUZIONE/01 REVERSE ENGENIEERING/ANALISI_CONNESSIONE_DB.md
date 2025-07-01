# Analisi Connessione Database - The Safe Place

Questo documento analizza la classe `Database` trovata in `archives/safeplace_advanced/backend/src/Database.php`.

## Architettura e Design Pattern

La classe `Database` è responsabile di tutta la comunicazione con il database MySQL. È costruita seguendo principi di programmazione moderni e sicuri.

1.  **Singleton Pattern**: La classe utilizza un pattern Singleton per la connessione al database. La connessione PDO viene stabilita una sola volta per richiesta e riutilizzata, garantendo efficienza e prevenendo connessioni multiple. Il metodo statico `getConnection()` gestisce l'istanza.

2.  **Configurazione Esterna**: Le credenziali e i parametri di connessione (host, porta, nome db, etc.) non sono scritti nel codice, ma caricati da un file dedicato: `config/database.php`. Questa è un'ottima pratica di sicurezza e manutenibilità.

3.  **Uso di PDO**: La classe utilizza `PDO` (PHP Data Objects) per tutte le interazioni con il database. Questo garantisce un alto livello di sicurezza contro le SQL injection, poiché tutte le query vengono eseguite tramite *prepared statements*.

## Metodi Principali

La classe fornisce un set di metodi statici che fungono da wrapper per le operazioni comuni del database, astraendo la complessità di PDO dal resto dell'applicazione.

*   `init()`: Carica il file di configurazione.
*   `getConnection()`: Restituisce l'istanza della connessione PDO, creandola se non esiste.
*   `query($sql, $params)`: Esegue una query preparata e restituisce l'oggetto `PDOStatement`.
*   `fetchOne($sql, $params)`: Esegue una query e restituisce un singolo record (riga).
*   `fetchAll($sql, $params)`: Esegue una query e restituisce tutti i record (righe) del risultato.
*   `insert($table, $data)`: Costruisce e esegue una query `INSERT` in modo sicuro. `data` è un array associativo `['colonna' => 'valore']`. Restituisce l'ID della nuova riga.
*   `update($table, $data, $where, $whereParams)`: Costruisce e esegue una query `UPDATE` sicura.

## Implicazioni per il Porting

*   **Logica Centralizzata**: Tutta la logica di accesso ai dati è centralizzata in questa classe. Questo rende molto più semplice capire come il resto del backend (es. `GameController.php`) interagisce con il database.
*   **Sicurezza**: L'uso di prepared statements significa che la logica delle query è sicura. Nel porting, sarà essenziale mantenere lo stesso livello di sicurezza utilizzando un ORM (Object-Relational Mapper) o query parametriche equivalenti.
*   **Mappatura Semplice**: Analizzando il `GameController`, potremo mappare facilmente le chiamate ai metodi di questa classe (es. `Database::fetchAll(...)`) alle corrispondenti operazioni sul database, facilitando la comprensione del flusso dei dati.
*   **Dipendenza dalla Configurazione**: Il prossimo passo logico è esaminare il file `config/database.php` per vedere i dettagli di connessione usati, anche se probabilmente conterranno solo valori di placeholder per lo sviluppo locale. 
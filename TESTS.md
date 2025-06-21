# TESTS.md - File dei Test Manuali SafePlace

Questo file mantiene tutti i test manuali per prevenire regressioni durante lo sviluppo, seguendo il **PRINCIPIO 4 del PROTOCOLLO DI SVILUPPO UMANO-LLM**.

## Milestone 0 Task 1: Setup del Font e del Tema Globale

### Test M0.T1: Verifica Tema Globale e Font

**Obiettivo:** Verificare che il tema `main_theme.tres` sia applicato correttamente con il font Perfect DOS VGA 437.

**Passi:**
1. Aprire il progetto Godot
2. Avviare la scena `TestScene.tscn`
3. Verificare visivamente gli elementi

**Risultato Atteso:**
- ✅ Il font di tutti i testi deve essere **Perfect DOS VGA 437 Win**
- ✅ Il colore del testo deve essere **verde #4EA162**
- ✅ Lo sfondo deve essere **verde scurissimo #000503**
- ✅ I bottoni devono avere bordi verdi e testo verde
- ✅ Non devono esserci errori nella console di Godot

**Risultato Test:** [✅] PASS / [ ] FAIL

**Note:** Test superato con successo - v0.0.1

---

### Test M0.T2: Verifica ThemeManager

**Obiettivo:** Verificare che il ThemeManager funzioni correttamente come Singleton.

**Passi:**
1. Avviare la scena `TestScene.tscn`
2. Premere il pulsante "Test Button" per cambiare tema
3. Verificare i cambi di tema nella console

**Risultato Atteso:**
- ✅ Console mostra: "🎨 ThemeManager inizializzato - Tema: DEFAULT"
- ✅ Premendo il pulsante, i temi cambiano in ordine: DEFAULT → CRT_GREEN → HIGH_CONTRAST → DEFAULT
- ✅ Ogni cambio è confermato in console
- ✅ I colori dell'interfaccia cambiano visivamente con i temi

**Risultato Test:** [✅] PASS / [ ] FAIL

**Note:** Test superato con successo - v0.0.1

---

### Test M0.T3: Test Funzione apply_theme()

**Obiettivo:** Verificare che la funzione `ThemeManager.apply_theme("standard")` funzioni.

**Passi:**
1. Aprire la console di Godot (Remote Inspector)
2. Nella console di debug, eseguire: `ThemeManager.apply_theme("standard")`
3. Verificare che il tema cambi

**Risultato Atteso:**
- ✅ Il comando non produce errori
- ✅ Il tema cambia visivamente
- ✅ Console conferma: "✅ Tema applicato: DEFAULT"

**Risultato Test:** [✅] PASS / [ ] FAIL

**Note:** Test superato con successo - v0.0.1

---

## Milestone 0 Task 2: Shader CRT e Effetti Terminale (v0.0.2b)

### Test M0.T2.1: Verifica Sistema CRT Funzionale

**Obiettivo:** Verificare che il sistema CRT completamente riparato funzioni correttamente con architettura ColorRect overlay.

**Passi:**
1. Aprire il progetto Godot
2. Avviare la scena `TestScene.tscn`
3. Verificare stato iniziale (CRT disattivo)
4. Premere F1 per attivare CRT manualmente
5. Osservare effetti: scanline, fosfori verdi, rumore vintage

**Risultato Atteso:**
- ✅ Avvio normale: schermo pulito senza effetti CRT
- ✅ F1 attiva CRT: effetti fosfori verdi autentici
- ✅ Scanline orizzontali visibili e realistiche
- ✅ Colore fosforoso verde (#00FF40) applicato correttamente
- ✅ Rumore vintage leggero e discreto
- ✅ Console mostra: "🎥 CRT: ATTIVO/DISATTIVO"
- ✅ Performance mantenute (60+ FPS)

**Risultato Test:** [✅] PASS / [ ] FAIL

**Note:** Sistema completamente funzionale - v0.0.2b

---

### Test M0.T2.2: Integrazione Automatica con Temi

**Obiettivo:** Verificare attivazione automatica CRT con tema CRT_GREEN.

**Passi:**
1. Avviare con tema DEFAULT (CRT spento)
2. Premere "Test Button" per passare a CRT_GREEN
3. Verificare attivazione automatica CRT
4. Cambiare a HIGH_CONTRAST
5. Verificare disattivazione automatica CRT

**Risultato Atteso:**
- ✅ Tema DEFAULT: CRT spento
- ✅ Tema CRT_GREEN: CRT si attiva automaticamente
- ✅ Tema HIGH_CONTRAST: CRT si spegne automaticamente
- ✅ Transizioni fluide senza glitch
- ✅ UI "CRT Info" aggiornata correttamente
- ✅ Console conferma ogni cambio stato

**Risultato Test:** [✅] PASS / [ ] FAIL

**Note:** Integrazione perfetta - v0.0.2b

---

### Test M0.T2.3: Controllo Manuale F1

**Obiettivo:** Verificare controllo manuale indipendente dal tema.

**Passi:**
1. Impostare tema DEFAULT
2. Premere F1 per attivare CRT manualmente
3. Cambiare tema a CRT_GREEN (dovrebbe rimanere attivo)
4. Premere F1 per disattivare
5. Verificare che rimanga spento anche con tema CRT_GREEN

**Risultato Atteso:**
- ✅ F1 funziona indipendentemente dal tema attivo
- ✅ Controllo manuale ha precedenza su quello automatico
- ✅ Toggle immediato e responsivo
- ✅ Stato visuale coerente con stato logico
- ✅ Console conferma ogni toggle manuale

**Risultato Test:** [✅] PASS / [ ] FAIL

**Note:** Controllo manuale perfetto - v0.0.2b

---

### Test M0.T2.4: Regressione Architettura Precedente

**Obiettivo:** Verificare che la nuova architettura non abbia introdotto regressioni.

**Passi:**
1. Verificare che tutti i test M0.T1 passino ancora
2. Verificare font Perfect DOS VGA 437 funzionante
3. Verificare temi DEFAULT e HIGH_CONTRAST senza problemi
4. Verificare performance e stabilità generale

**Risultato Atteso:**
- ✅ Tutti i test M0.T1 ancora superati
- ✅ Font perfetto in tutti i temi
- ✅ Colori temi corretti
- ✅ Nessun errore in console
- ✅ Stabilità generale mantenuta
- ✅ Architettura ColorRect più semplice e robusta

**Risultato Test:** [✅] PASS / [ ] FAIL

**Note:** Zero regressioni - architettura migliorata - v0.0.2b

## Template per Nuovi Test

### Test MX.TX: [Nome Test]

**Obiettivo:** [Descrizione obiettivo]

**Passi:**
1. [Passo 1]
2. [Passo 2]
3. [Passo 3]

**Risultato Atteso:**
- ✅ [Criterio 1]
- ✅ [Criterio 2]

**Risultato Test:** [ ] PASS / [ ] FAIL

**Note:** _Da compilare durante il test_

---

## Istruzioni per l'Uso

1. **Prima di ogni commit importante:** Eseguire tutti i test applicabili
2. **Dopo modifiche ai temi:** Eseguire i test M0.T1, M0.T2, M0.T3
3. **Segnalare fallimenti:** Se un test fallisce, fermare lo sviluppo e risolvere prima di procedere
4. **Aggiornare i test:** Quando si aggiunge una nuova funzionalità, aggiungere il relativo test

## Milestone 0 Task 3: Sistema DataManager e Database Modulare (v0.0.4)

### Test M0.T3.1: Verifica DataManager Singleton Funzionale

**Obiettivo:** Verificare che DataManager carichi correttamente tutti i database modulari.

**Passi:**
1. Aprire progetto Godot
2. Verificare Autoload: ThemeManager e DataManager presenti
3. Avviare TestScene.tscn
4. Osservare output console per caricamento dati

**Risultato Atteso:**
- ✅ DataManager compare negli Autoload
- ✅ Console mostra: "📊 DataManager inizializzato"
- ✅ Conteggio oggetti caricati: 47 totali
- ✅ Sistema rarità: 5 livelli caricati
- ✅ 8 categorie database caricate: weapons, armor, consumables, etc.
- ✅ Zero errori JSON durante caricamento

**Risultato Test:** [✅] PASS / [ ] FAIL

**Note:** Sistema funzionante - v0.0.4

---

### Test M0.T3.2: API DataManager Complete

**Obiettivo:** Verificare tutte le API functions del DataManager.

**Passi:**
1. Aprire Remote Inspector di Godot
2. Testare API principali:
   - `DataManager.get_item_data("pistol")`
   - `DataManager.get_rarity_data("common")`
   - `DataManager.get_items_by_category("weapons")`
   - `DataManager.get_items_by_rarity("rare")`

**Risultato Atteso:**
- ✅ get_item_data() restituisce oggetto corretto o null
- ✅ get_rarity_data() restituisce info rarità con colore
- ✅ Filtri categoria funzionanti
- ✅ Filtri rarità funzionanti
- ✅ Nessun errore durante le chiamate API

**Risultato Test:** [✅] PASS / [ ] FAIL

**Note:** API complete e funzionali - v0.0.4

---

### Test M0.T3.3: ⚠️ Verifica Conteggio Oggetti (CRITICO)

**Obiettivo:** Verificare manualmente il conteggio degli oggetti nei file JSON.

**Passi:**
1. Aprire manualmente tutti i file in `data/items/`
2. Contare oggetti per categoria:
   - unique_items.json → sezione "items"
   - weapons.json → sezione "weapons"
   - armor.json → sezione "armor"
   - consumables.json → sezione "consumables"
   - crafting_materials.json → sezione "crafting_materials"
   - ammo.json → sezione "ammo"
   - quest_items.json → sezione "quest_items"
3. Sommare totale manuale
4. Confrontare con DataManager (47)

**Risultato Atteso:**
- ✅ Conteggio manuale = conteggio DataManager
- ✅ Tutti i file JSON strutturalmente corretti
- ✅ Nessun oggetto duplicato o mancante
- ⚠️ **Verifica se oggetti unici caricati correttamente**

**Risultato Test:** [✅] PASS / [ ] FAIL - ✅ **VERIFICA COMPLETATA**

**Note:** Bug risolto - 52 oggetti confermati (5 unici, 8 armi, 6 armature, 18 consumabili, 10 materiali, 2 munizioni, 3 quest)

---

## Log dei Test Eseguiti

| Data | Milestone | Test | Risultato | Note |
|------|-----------|------|-----------|------| 
| 2024-12-19 | M0.T3 | M0.T3.1 | ✅ PASS | DataManager carica 47 oggetti correttamente |
| 2024-12-19 | M0.T3 | M0.T3.2 | ✅ PASS | Tutte API funzionanti, filtri operativi |
| 2024-12-19 | M0.T3 | M0.T3.3 | ✅ PASS | Bug risolto: 52 oggetti verificati e funzionanti |
| [Data] | M0.T1 | M0.T1 | PASS/FAIL | [Note] |
| [Data] | M0.T2 | M0.T2 | PASS/FAIL | [Note] |
| [Data] | M0.T3 | M0.T3 | PASS/FAIL | [Note] | 
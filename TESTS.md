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

**Risultato Test:** [ ] PASS / [ ] FAIL

**Note:** _Da compilare durante il test_

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

**Risultato Test:** [ ] PASS / [ ] FAIL

**Note:** _Da compilare durante il test_

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

**Risultato Test:** [ ] PASS / [ ] FAIL

**Note:** _Da compilare durante il test_

---

## Milestone 0 Task 2: Shader CRT e Effetti Terminale

### Test M0.T2.1: Verifica Shader CRT Autentico

**Obiettivo:** Verificare che il sistema shader CRT funzioni correttamente con effetti autentici terminale anni 80.

**Passi:**
1. Aprire il progetto Godot
2. Avviare la scena `TestScene.tscn`
3. Premere "Test Button" fino a tema CRT_GREEN
4. Osservare effetti CRT: scanline, curvatura, rumore, vignette

**Risultato Atteso:**
- ✅ Tema CRT_GREEN attiva automaticamente shader CRT
- ✅ Scanline visibili e autentiche (frequenza ~250Hz)
- ✅ Curvatura schermo simile a monitor anni 80
- ✅ Rumore vintage animato e vignette ai bordi
- ✅ Performance mantenute (60+ FPS)
- ✅ Console mostra: "🎥 Shader CRT ATTIVATO - Modalità terminale anni 80"

**Risultato Test:** [ ] PASS / [ ] FAIL

**Note:** _Da compilare durante il test_

---

### Test M0.T2.2: Controllo Parametri CRT Dinamici

**Obiettivo:** Verificare controllo dinamico parametri shader e API ThemeManager estesa.

**Passi:**
1. Attivare tema CRT_GREEN (shader attivo)
2. Verificare toggle automatico ogni 5 secondi
3. Controllare log console per conferma operazioni
4. Testare controllo manuale con F1 (se implementato)

**Risultato Atteso:**
- ✅ Log "🎥 Shader CRT ATTIVATO/DISATTIVATO" in console
- ✅ Toggle automatico funzionante ogni 5 secondi
- ✅ Segnali crt_shader_toggled emessi correttamente
- ✅ UI "CRT Info" aggiornata dinamicamente
- ✅ API set_crt_parameter() e get_crt_parameter() funzionanti

**Risultato Test:** [ ] PASS / [ ] FAIL

**Note:** _Da compilare durante il test_

---

### Test M0.T2.3: Integrazione Sistema Temi

**Obiettivo:** Verificare integrazione shader con sistema temi esistente senza regressioni.

**Passi:**
1. Rotazione completa temi: DEFAULT → CRT_GREEN → HIGH_CONTRAST → DEFAULT
2. Verificare attivazione/disattivazione automatica shader
3. Controllare che shader sia attivo SOLO con tema CRT_GREEN
4. Verificare retrocompatibilità con Task 1

**Risultato Atteso:**
- ✅ Shader CRT attivo SOLO con tema CRT_GREEN
- ✅ Temi DEFAULT e HIGH_CONTRAST senza shader
- ✅ Transizioni fluide senza glitch o errori
- ✅ Font Perfect DOS VGA 437 sempre funzionante
- ✅ Test M0.T1 ancora tutti superati

**Risultato Test:** [ ] PASS / [ ] FAIL

**Note:** _Da compilare durante il test_

---

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

## Log dei Test Eseguiti

| Data | Milestone | Test | Risultato | Note |
|------|-----------|------|-----------|------|
| [Data] | M0.T1 | M0.T1 | PASS/FAIL | [Note] |
| [Data] | M0.T2 | M0.T2 | PASS/FAIL | [Note] |
| [Data] | M0.T3 | M0.T3 | PASS/FAIL | [Note] | 
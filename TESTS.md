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
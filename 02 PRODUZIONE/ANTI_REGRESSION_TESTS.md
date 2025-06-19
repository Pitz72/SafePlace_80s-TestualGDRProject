# 🧪 ANTI-REGRESSION TESTS

**Test manuali per prevenire regressioni nel codice di The Safe Place**

## **INFORMAZIONI DOCUMENTO**

- **Progetto:** The Safe Place - GDR Testuale Anni 80
- **Versione:** v0.0.2b "Repairing the Old Monitor"
- **Tipo:** Test manuali anti-regressione
- **Frequenza:** Eseguire prima di ogni commit
- **Target:** Zero errori, zero warning Godot
- **Ultimo Aggiornamento:** [DATA ATTUALE]

---

## **🎯 MILESTONE 0 TASK 1 - Font e Tema Globale**

### **TEST M0.T1.1: Font Perfect DOS VGA 437**

**Obiettivo:** Verificare caricamento e visualizzazione font monospace anni 80

**PASSI:**
1. Aprire progetto Godot
2. Verificare assenza errori nella console
3. Eseguire scena `scenes/TestScene.tscn`
4. Osservare il font nella Label di test

**RISULTATO ATTESO:**
- Font Perfect DOS VGA 437 visualizzato correttamente
- Testo monospace uniforme
- Zero errori di importazione font

**CRITERIO SUPERAMENTO:** ✅ Font visibile e conforme stile DOS
**STATO:** ✅ SUPERATO v0.0.1

---

### **TEST M0.T1.2: ThemeManager Singleton**

**Obiettivo:** Verificare inizializzazione e funzionamento sistema temi

**PASSI:**
1. Avviare progetto Godot  
2. Controllare console Output per log ThemeManager
3. Verificare presenza log: `🎨 ThemeManager inizializzato - Tema: DEFAULT`

**RISULTATO ATTESO:**
- ThemeManager caricato come Autoload
- Log di inizializzazione presenti
- Nessun errore script

**CRITERIO SUPERAMENTO:** ✅ Singleton attivo con log conferma
**STATO:** ✅ SUPERATO v0.0.1

---

### **TEST M0.T1.3: Rotazione Temi Manuale**

**Obiettivo:** Verificare cambio temi dinamico tramite pulsante

**PASSI:**
1. Eseguire `scenes/TestScene.tscn`
2. Cliccare pulsante "Test Button" ripetutamente
3. Osservare console per log: `🎨 Cambio tema richiesto: [NOME_TEMA]`
4. Verificare rotazione: DEFAULT → CRT_GREEN → HIGH_CONTRAST → DEFAULT

**RISULTATO ATTESO:**
- Rotazione temi corretta in sequenza
- Log di cambio temi ad ogni click
- Zero errori durante rotazione

**CRITERIO SUPERAMENTO:** ✅ Rotazione fluida con log completi
**STATO:** ✅ SUPERATO v0.0.1

---

## **📺 MILESTONE 0 TASK 2 - Sistema CRT (v0.0.2b)**

### **TEST M0.T2.1: Sistema CRT Funzionale**

**Obiettivo:** Verificare sistema CRT completamente riparato

**PASSI:**
1. Aprire progetto Godot
2. Eseguire `scenes/TestScene.tscn`
3. Verificare stato iniziale: schermo pulito, nessun effetto CRT
4. Premere F1 per attivare CRT manualmente
5. Osservare effetti: scanline orizzontali, fosfori verdi, rumore vintage
6. Premere F1 nuovamente per disattivare

**RISULTATO ATTESO:**
- ✅ Avvio normale: schermo pulito senza effetti CRT
- ✅ F1 attiva: effetti fosfori verdi autentici (#00FF40)
- ✅ Scanline orizzontali visibili e realistiche
- ✅ Rumore vintage leggero e discreto
- ✅ Console mostra: "🎥 CRT: ATTIVO/DISATTIVO"
- ✅ Performance mantenute (60+ FPS)
- ✅ Toggle immediato e responsivo

**CRITERIO SUPERAMENTO:** ✅ Sistema CRT perfettamente funzionale
**STATO:** ✅ SUPERATO v0.0.2b

---

### **TEST M0.T2.2: Integrazione Automatica Temi CRT**

**Obiettivo:** Verificare attivazione automatica CRT con tema CRT_GREEN

**PASSI:**
1. Avviare con tema DEFAULT (CRT spento)
2. Premere "Test Button" per passare a CRT_GREEN
3. Verificare attivazione automatica CRT
4. Premere "Test Button" per HIGH_CONTRAST
5. Verificare disattivazione automatica CRT
6. Tornare a DEFAULT e verificare CRT spento

**RISULTATO ATTESO:**
- ✅ Tema DEFAULT: CRT spento
- ✅ Tema CRT_GREEN: CRT si attiva automaticamente
- ✅ Tema HIGH_CONTRAST: CRT si spegne automaticamente
- ✅ Transizioni fluide senza glitch
- ✅ UI "CRT Info" aggiornata correttamente
- ✅ Console conferma ogni cambio stato

**CRITERIO SUPERAMENTO:** ✅ Integrazione perfetta temi-CRT
**STATO:** ✅ SUPERATO v0.0.2b

---

### **TEST M0.T2.3: Controllo Manuale F1 Prioritario**

**Obiettivo:** Verificare controllo manuale indipendente dal tema

**PASSI:**
1. Impostare tema DEFAULT
2. Premere F1 per attivare CRT manualmente
3. Cambiare tema a CRT_GREEN (dovrebbe rimanere attivo)
4. Premere F1 per disattivare
5. Verificare che rimanga spento anche con tema CRT_GREEN

**RISULTATO ATTESO:**
- ✅ F1 funziona indipendentemente dal tema attivo
- ✅ Controllo manuale ha precedenza su quello automatico
- ✅ Toggle immediato e responsivo
- ✅ Stato visuale coerente con stato logico
- ✅ Console conferma ogni toggle manuale

**CRITERIO SUPERAMENTO:** ✅ Controllo manuale prioritario
**STATO:** ✅ SUPERATO v0.0.2b

---

### **TEST M0.T2.4: Zero Regressioni Architettura**

**Obiettivo:** Verificare che nuova architettura non abbia introdotto regressioni

**PASSI:**
1. Eseguire tutti i test M0.T1 (Font, ThemeManager, Rotazione)
2. Verificare font Perfect DOS VGA 437 ancora perfetto
3. Verificare temi DEFAULT e HIGH_CONTRAST senza problemi
4. Verificare performance e stabilità generale
5. Controllare assenza errori console

**RISULTATO ATTESO:**
- ✅ Tutti i test M0.T1 ancora superati
- ✅ Font perfetto in tutti i temi
- ✅ Colori temi corretti
- ✅ Nessun errore in console
- ✅ Stabilità generale mantenuta
- ✅ Architettura ColorRect più semplice e robusta

**CRITERIO SUPERAMENTO:** ✅ Zero regressioni introdotte
**STATO:** ✅ SUPERATO v0.0.2b

---

## **🚨 TEST CRITICI TRANSVERSALI**

### **TEST CRITICO 1: Zero Errori Godot**

**Obiettivo:** Progetto completamente pulito

**PASSI:**
1. Aprire progetto in Godot
2. Controllare tab "Output" 
3. Controllare tab "Debugger"
4. Eseguire scena principale

**RISULTATO ATTESO:**
- Zero errori nella console
- Zero warning di parsing
- Caricamento progetto istantaneo

**CRITERIO SUPERAMENTO:** ✅ Console completamente pulita
**STATO:** ✅ SUPERATO v0.0.2b

---

### **TEST CRITICO 2: Integrità Files v0.0.2b**

**Obiettivo:** Tutti i file del progetto sono validi

**VERIFICA FILES:**
```
✅ themes/main_theme.tres                # Tema principale
✅ themes/Perfect DOS VGA 437 Win.ttf    # Font DOS
✅ themes/crt_simple.gdshader           # Shader CRT ottimizzato
✅ themes/crt_simple_material.tres      # Material CRT
✅ scripts/ThemeManager.gd              # Manager temi + CRT
✅ scenes/TestScene.tscn                # Scena test ristrutturata
✅ scenes/TestScene.gd                  # Script test con F1
✅ project.godot                        # Configurazione progetto
```

**CRITERIO SUPERAMENTO:** ✅ Tutti i file si aprono senza errori
**STATO:** ✅ SUPERATO v0.0.2b

---

### **TEST CRITICO 3: Autoload Configuration**

**Obiettivo:** Singleton configurati correttamente

**VERIFICA AUTOLOAD:**
1. Aprire "Project Settings" → "Autoload"
2. Controllare presenza: `ThemeManager` → `scripts/ThemeManager.gd`
3. Verificare flag "Enable" attivo

**CRITERIO SUPERAMENTO:** ✅ ThemeManager in lista Autoload
**STATO:** ✅ SUPERATO v0.0.2b

---

## **🔄 REGRESSIONI COMUNI v0.0.2b**

### **PROBLEMA 1: CRT Non Si Attiva**

**Sintomi:**
- F1 non produce effetti
- Tema CRT_GREEN non attiva shader

**DEBUG:**
- Verificare file `themes/crt_simple_material.tres` presente
- Controllare nodo CRTDisplay in TestScene.tscn
- Confermare shader crt_simple.gdshader valido

**FIX:**
- Riassegnare material al nodo CRTDisplay
- Verificare SCREEN_TEXTURE nel shader

---

### **PROBLEMA 2: Layout Corrotto**

**Sintomi:**
- Testi spostati in posizioni incorrette
- Schermata grigia
- Elementi UI non centrati

**DEBUG:**
- Verificare layout_mode = 0 nei nodi principali
- Controllare anchors_preset configurati
- Confermare parent="." specificato

**FIX:**
- Riapplicare layout constraints corretti
- Verificare gerarchia nodi scene

---

### **PROBLEMA 3: Input Bloccato**

**Sintomi:**
- Pulsanti non cliccabili
- F1 non risponde
- Interfaccia non interattiva

**DEBUG:**
- Verificare mouse_filter = 2 su CRTDisplay
- Controllare visible = false di default su CRTDisplay
- Confermare gerarchia nodi corretta

**FIX:**
- Impostare mouse_filter = 2 (IGNORE) su overlay
- Verificare z-order nodi

---

## **📋 CHECKLIST PRE-COMMIT v0.0.2b**

Prima di ogni commit, verificare:

**MILESTONE 0 TASK 1:**
- [ ] Font Perfect DOS VGA 437 caricato e visibile
- [ ] ThemeManager inizializzato (log presente)
- [ ] Rotazione temi funzionante (pulsante)
- [ ] Zero errori console

**MILESTONE 0 TASK 2:**
- [ ] Sistema CRT funziona (F1 toggle)
- [ ] Integrazione automatica temi CRT
- [ ] Controllo manuale F1 prioritario
- [ ] Zero regressioni su M0.T1
- [ ] Performance 60+ FPS mantenute
- [ ] Layout e input perfetti

**TEST CRITICI:**
- [ ] Progetto si apre senza errori
- [ ] Tutti file .tres/.tscn/.gdshader validi
- [ ] Autoload configurati correttamente
- [ ] TestScene eseguibile senza crash

**REGOLA FERREA:** Se anche solo 1 test fallisce, NON fare commit

---

## **🎯 RISULTATO FINALE v0.0.2b**

**MILESTONE 0 TASK 1:** ✅ 3/3 TEST SUPERATI  
**MILESTONE 0 TASK 2:** ✅ 4/4 TEST SUPERATI  
**TEST CRITICI:** ✅ 3/3 TEST SUPERATI  

**TOTALE: 10/10 TEST ANTI-REGRESSIONE SUPERATI** 🎉

**SafePlace v0.0.2b è SOLIDO e pronto per M0.T3** 🚀 
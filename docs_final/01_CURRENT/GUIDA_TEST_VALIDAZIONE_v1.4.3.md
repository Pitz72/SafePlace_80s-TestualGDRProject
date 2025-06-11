# 🧪 GUIDA TEST VALIDAZIONE - SafePlace v1.4.3

**Documento**: Guida Test Validazione Sistemi  
**Versione**: v1.4.3  
**Data**: 15 Gennaio 2025  
**Status**: Sistema Completo  

---

## 🎯 **OVERVIEW SISTEMA TEST**

SafePlace v1.4.3 include un **sistema completo di validazione** per verificare l'integrità di tutti i componenti critici prima di procedere con espansioni o modifiche.

### **🔧 STRUMENTI DISPONIBILI**
1. **SystemValidationTest.gd** - Test automatici completi
2. **InteractiveTestConsole.gd** - Console test interattiva (F12)
3. **Test manuali** - Checklist verifiche manuali
4. **Anti-regressione** - Protezione stati critici

---

## 🚀 **METODO 1: TEST AUTOMATICI COMPLETI**

### **Step 1: Preparazione**
```bash
# 1. Apri Godot Editor
# 2. Carica progetto SafePlace (godot_project/project.godot)
# 3. Assicurati che tutti i file siano salvati
```

### **Step 2: Esecuzione Test Automatici**
```bash
# Opzione A: Aggiungi SystemValidationTest.gd alla scena
# 1. Nella scena Main.tscn o MenuScreen.tscn
# 2. Aggiungi Node > Attach Script > SystemValidationTest.gd
# 3. Il test partirà automaticamente

# Opzione B: Console Debug Godot
# 1. Scene > Main Scene > Run Scene (F6)
# 2. Nella console debug inserisci:
var test_node = preload("res://scripts/SystemValidationTest.gd").new()
add_child(test_node)
```

### **Step 3: Interpretazione Risultati**
Il test genera un **rapporto completo** con:
```
📊 RAPPORTO VALIDAZIONE FINALE - SafePlace v1.4.3
============================================================
🎯 RISULTATI GENERALI:
   ✅ Test superati: X/Y
   ❌ Test falliti: Z/Y  
   📊 Percentuale successo: XX.X%

🚨 ERRORI CRITICI (se presenti):
   ❌ [Descrizione errore critico]

⚠️ WARNING (se presenti):
   ⚠️ [Descrizione warning]

🎯 STATUS FINALE: PRODUCTION READY / NECESSITA CORREZIONI
```

---

## 🎮 **METODO 2: CONSOLE TEST INTERATTIVA**

### **Step 1: Avvio Console**
```bash
# 1. Avvia SafePlace normalmente
# 2. Carica scena di gioco (Main.tscn)
# 3. Aggiungi InteractiveTestConsole.gd alla scena
# 4. Premi F12 per attivare console test
```

### **Step 2: Comandi Disponibili**
```bash
# COMANDI PRINCIPALI
help                 # Mostra aiuto completo
test_all            # Esegue tutti i test in sequenza
status              # Mostra status sistema generale

# TEST SPECIFICI
test_themes         # Test cambio temi in tempo reale
test_interface      # Verifica pannelli MainInterface
test_movement       # Test movimento player
test_save           # Test sistema salvataggio
test_events         # Conta eventi disponibili  
test_autoloads      # Verifica autoload systems

# UTILITY
clear               # Pulisce output console
```

### **Step 3: Test Interattivi**
La console permette **test in tempo reale** mentre il gioco è in esecuzione:
- **Cambio temi**: Verifica visivamente i 3 temi
- **Test pannelli**: Conferma visibilità 9 pannelli interface
- **Test movimento**: Verifica controlli WASD funzionanti
- **Test salvataggio**: Conferma F5/F6 operativi

---

## ✅ **METODO 3: CHECKLIST MANUALI**

### **🔍 CHECKLIST CRITICA - Da Verificare Manualmente**

#### **A. AVVIO GIOCO**
- [ ] **Menu carica correttamente** (MenuScreen.tscn)
- [ ] **Logo SafePlace visibile** 
- [ ] **5 pulsanti menu presenti** (Nuova Partita, Carica, Storia, Istruzioni, Impostazioni)
- [ ] **Transizione Menu → Game funziona** (Nuova Partita)
- [ ] **Colori verde SafePlace (#4EA162) corretti**

#### **B. INTERFACCIA PRINCIPALE**
- [ ] **9 pannelli sempre visibili**:
  - [ ] SurvivalPanel (stato salute)
  - [ ] InventoryPanel (oggetti)
  - [ ] LogPanel (eventi)
  - [ ] LegendPanel (simboli mappa)
  - [ ] MapPanel (mappa ASCII)
  - [ ] InfoPanel (informazioni)
  - [ ] StatsPanel (statistiche)
  - [ ] ControlsPanel (controlli)
  - [ ] EquipmentPanel (equipaggiamento)
- [ ] **Player @ lampeggia sulla mappa**
- [ ] **Font monospace corretto** (ASCII leggibile)
- [ ] **Colori verdi SafePlace** in tutti i pannelli

#### **C. CONTROLLI GIOCO**
- [ ] **Movimento WASD funziona**
- [ ] **Player @ si sposta sulla mappa**
- [ ] **Spazio** passa tempo (30 minuti)
- [ ] **F5** salvataggio rapido
- [ ] **F6** caricamento rapido
- [ ] **I** inventario (se implementato)

#### **D. SISTEMA TEMI**
- [ ] **Pulsante Impostazioni** dal menu
- [ ] **3 opzioni tema** disponibili:
  - [ ] DEFAULT (gradazioni verde)
  - [ ] CRT_GREEN (solo verde CRT)
  - [ ] HIGH_CONTRAST (bianco/nero)
- [ ] **Cambio tema istantaneo**
- [ ] **Preview funziona** (pulsanti Applica/Annulla)
- [ ] **Persistenza** (tema rimane dopo riavvio)

#### **E. PERFORMANCE**
- [ ] **60 FPS costanti**
- [ ] **Nessun lag** nei menu
- [ ] **Transizioni fluide**
- [ ] **Caricamento rapido** (<1 secondo)

---

## 🚨 **ANALISI ERRORI COMUNI**

### **❌ ERRORI CRITICI**

#### **"Schermata Grigia"**
```gdscript
CAUSA: MainInterface.gd corrotto o mancante
SINTOMI: 
- Schermata grigia al posto interface
- Console mostra errori "Node not found"
SOLUZIONE:
1. Verifica MainInterface.gd (deve essere ~1044 righe)
2. Controlla scenes/Main.tscn integro
3. Ripristina da backup se necessario
```

#### **"Pannelli Mancanti"**
```gdscript
CAUSA: _setup_panels() non funziona
SINTOMI:
- Meno di 9 pannelli visibili
- Interface incompleta
SOLUZIONE:
1. Verifica MainInterface.gd linea _setup_panels()
2. Controlla nomi pannelli corretti in Main.tscn
3. Forza ricreazione pannelli se necessario
```

#### **"Colori Sbagliati"**
```gdscript
CAUSA: ThemeManager non integrato o rotto
SINTOMI:
- Colori viola, bianchi o casuali
- Non colori verde SafePlace
SOLUZIONE:
1. Verifica ThemeManager autoload attivo
2. Controlla project.godot [autoload]
3. Verifica nessun colore hardcoded in script
```

#### **"GameManager Autoload"**
```gdscript
CAUSA: Regressione critica - GameManager come autoload
SINTOMI:
- Errori conflitto nodi
- Doppio GameManager
SOLUZIONE:
1. RIMUOVI GameManager da project.godot [autoload]
2. GameManager deve essere istanziato solo da Main.tscn
3. Mai come autoload!
```

### **⚠️ WARNING COMUNI**

#### **"CRTEffect Assente"**
```gdscript
CAUSA: CRTEffect autoload non configurato
IMPATTO: Minimo - funzionalità opzionale
SOLUZIONE: Ignora o aggiungi CRTEffect autoload se necessario
```

#### **"Font Non Monospace"**
```gdscript
CAUSA: Font non applicato correttamente
IMPATTO: Mappa ASCII disallineata
SOLUZIONE: Verifica _force_monospace_font_on_all_panels()
```

---

## 📊 **VALIDAZIONE RISULTATI**

### **✅ STATUS: PRODUCTION READY**
Tutti i test passano, nessun errore critico:
```
✅ ThemeManager: OK
✅ MainInterface: OK  
✅ Settings Screen: OK
✅ Menu System: OK
✅ Core Scripts: OK
✅ Events Count: XX eventi

🚀 PRONTO PER: Espansione contenuti massiccio
```

### **❌ STATUS: NECESSITA CORREZIONI**
Errori critici trovati:
```
❌ [Lista errori critici]

🔧 AZIONI RICHIESTE:
1. Correggere errori identificati
2. Ri-eseguire validazione  
3. Solo dopo: procedere con sviluppi
```

---

## 🛡️ **PROTEZIONE ANTI-REGRESSIONE**

### **File da NON TOCCARE Mai**
```
❌ DANGER ZONE - NO EDIT:
- godot_project/scripts/MainInterface.gd (39KB, 1044 righe)
- godot_project/scripts/ThemeManager.gd (242 righe)
- godot_project/scenes/Main.tscn (364 righe)
- godot_project/project.godot (configurazione autoload)
```

### **Backup Obbligatori Prima di Modifiche**
```bash
# Prima di QUALSIASI modifica sistema:
1. Commit git stato corrente
2. Tag versione: "v1.4.3-tested"
3. Backup completo cartella scripts/
4. Esegui test validazione baseline
```

### **Segnali Regressione**
```
🚨 SEGNALI ALLERTA:
- Schermata grigia invece interface
- Colori non verde SafePlace
- Errori console al caricamento
- Pannelli mancanti o non visibili
- Performance degradate (<30 FPS)
```

---

## 🚀 **WORKFLOW RACCOMANDATO**

### **Per Sviluppo Normale**
```bash
1. Esegui SystemValidationTest.gd (test completo)
2. Verifica STATUS: PRODUCTION READY
3. Procedi con sviluppi se tutto OK
4. Ri-esegui test dopo modifiche
```

### **Per Debug Problemi**
```bash
1. Avvia InteractiveTestConsole.gd (F12)
2. Esegui test specifici per area problema
3. Analizza output dettagliato
4. Correggi problemi identificati
5. Ri-testa fino a risoluzione
```

### **Prima Import Contenuti Massiccio**
```bash
1. OBBLIGATORIO: Test validazione completo
2. Backup sicurezza completo
3. Creazione branch separato
4. STATUS: PRODUCTION READY confermato
5. Solo allora: procedere import 1189 eventi
```

---

## 📞 **TROUBLESHOOTING RAPIDO**

### **Q: Come eseguire test velocemente?**
```bash
A: Godot Editor > Run Main Scene > Console Debug:
   var test = preload("res://scripts/SystemValidationTest.gd").new()
   add_child(test)
```

### **Q: Console interattiva non si apre?**
```bash
A: 1. Aggiungi InteractiveTestConsole.gd alla scena Main
   2. Verifica F12 non catturato da altri sistemi
   3. Controlla console debug per errori
```

### **Q: Test falliscono, cosa fare?**
```bash
A: 1. Leggi ERRORI CRITICI nel rapporto
   2. Consulta sezione "ANALISI ERRORI COMUNI"
   3. Correggi problemi uno alla volta
   4. Ri-testa dopo ogni correzione
```

### **Q: Dove vedere output test?**
```bash
A: - Godot Editor: Console Debug (Output tab)
   - Durante gioco: Console interattiva F12
   - Console sistema: se eseguito da terminale
```

---

## 🎯 **CONCLUSIONE**

Il sistema di validazione SafePlace v1.4.3 fornisce **protezione completa** contro regressioni e **verifica sistematica** di tutti i componenti critici.

**Usa sempre i test prima di**:
- Modificare file critici
- Aggiungere nuove funzionalità  
- Import contenuti massiccio
- Release o distribuzione

**✅ Se tutti i test passano: SafePlace è PRODUCTION READY per espansione contenuti massiccio (68 → 1189 eventi)** 
# 📖 GUIDA LLM - PROSSIMA SESSIONE (Session 010)
## 🎯 Documenti Fondamentali da Leggere OBBLIGATORIAMENTE

---

## 🔥 **PRIORITÀ ASSOLUTA - LEGGERE PRIMA DI TUTTO**

### 1️⃣ **CONSOLIDAMENTO_SESSION_009_FINAL.md** (QUESTO FILE)
```
📍 Posizione: ROOT del progetto
🎯 Contenuto: Status completo + anti-regressione + roadmap
⏱️ Tempo lettura: 5 minuti
❗ CRITICO: Contiene protezioni sistemi da NON toccare
```

### 2️⃣ **docs_organizzati/01_FONDAMENTALI/THE_SAFE_PLACE_MASTER_LOG_v1.2.0.md**
```
📍 Posizione: docs_organizzati/01_FONDAMENTALI/
🎯 Contenuto: Master roadmap del progetto completo
⏱️ Tempo lettura: 8 minuti  
💡 Focus: Architettura generale + sistemi implementati
```

### 3️⃣ **docs_organizzati/01_FONDAMENTALI/DOCUMENTI_ORGANIZZAZIONE_v1.2.0.md**
```
📍 Posizione: docs_organizzati/01_FONDAMENTALI/
🎯 Contenuto: Categorizzazione di TUTTI i documenti del progetto
⏱️ Tempo lettura: 3 minuti
🗂️ Focus: Dove trovare informazioni specifiche
```

---

## 🛡️ **MEMORIA ANTI-REGRESSIONE CRITICA**

### ❌ **SISTEMI DA NON TOCCARE MAI**
```
SE L'LLM SUGGERISCE DI MODIFICARE QUESTI → RIFIUTA IMMEDIATAMENTE:

1. scripts/ASCIIMapGenerator.gd (linee 1-280)
   → Mappa 250x250 perfetta con cluster autentici
   
2. scenes/Main.tscn struttura 8 pannelli  
   → Layout terminale ottimizzato e approvato
   
3. scripts/MainInterface.gd viewport 57 caratteri (linee 555-570)
   → Risolve wrapping, testato e perfetto
   
4. Player blinking timer 0.8s
   → Timing survival indicator ottimale
   
5. Color scheme (#000503, #44AAFF, etc.)
   → Finalizzato dall'utente, non cambiare
   
6. Panel positions LogPanel↔ControlsPanel
   → Swap fisico completato, non invertire
```

### ✅ **SISTEMI APERTI A MODIFICHE**
```
SICURI DA MODIFICARE/IMPLEMENTARE:

1. Container background colors → Applicare #000503
2. Game logic import → Da backend/ e js/
3. Combat system → Port da PHP a GDScript  
4. Event engine → Integration da events.js
5. Database → SQLite setup
6. Nuove features → Audio, animazioni, QoL
```

---

## 🎯 **OBIETTIVI SESSIONE 010**

### 🔥 **PRIORITÀ MASSIMA**
1. **Container Colors**: Finire applicazione #000503 agli slot inventario
2. **Combat Import**: Portare sistema da `backend/combat_system.php`
3. **Events Import**: Integrare `js/events.js` in MainInterface.gd
4. **Database Setup**: Configurare SQLite per saves persistenti

### 🆕 **FEATURES AGGIUNTIVE** 
1. Sound system (effetti 8-bit)
2. Animation system (transizioni panel)
3. Performance optimizations
4. Quality of life improvements

---

## 📂 **STRUTTURA DOCUMENTI ORGANIZZATA**

### 🗂️ **Come Navigare la Documentazione**
```
docs_organizzati/
├── 01_FONDAMENTALI/          ← LEGGERE QUESTI
│   ├── THE_SAFE_PLACE_MASTER_LOG_v1.2.0.md
│   ├── DOCUMENTI_ORGANIZZAZIONE_v1.2.0.md
│   ├── SESSION_009_CHIUSURA_FINALE.md
│   └── readme.md
├── 02_NUOVI_ADERENTI/        ← Session 008-009
├── 03_VECCHI_UTILI/          ← Legacy V1.0.0-V1.1.0  
└── 04_ARCHIVIO_OBSOLETI/     ← Storia fasi 1-6
```

### 🔍 **Ricerca Rapida**
- **Problemi tecnici** → `02_NUOVI_ADERENTI/`
- **Architettura legacy** → `03_VECCHI_UTILI/`
- **Storia sviluppo** → `04_ARCHIVIO_OBSOLETI/`

---

## 🚨 **ISTRUZIONI OPERATIVE**

### 📋 **SEQUENZA DI LETTURA OBBLIGATORIA**
1. **Prima azione**: Leggere `CONSOLIDAMENTO_SESSION_009_FINAL.md`
2. **Seconda azione**: Leggere `THE_SAFE_PLACE_MASTER_LOG_v1.2.0.md`  
3. **Terza azione**: Consultare anti-regressione
4. **Quarta azione**: Iniziare con container colors

### 🛡️ **Protezione da Errori**
```
SE QUALCUNO SUGGERISCE:
"Rifacciamo la mappa" → NO, è perfetta
"Cambiamo il layout" → NO, è ottimizzato  
"57 caratteri sono troppi" → NO, risolve wrapping
"Cambiamo i colori" → NO, sono finalizzati
"Il timer è troppo lento" → NO, è calibrato

RISPOSTA: "Sistema protetto, focus su game logic"
```

---

## ✅ **CHECKLIST PRE-LAVORO**

### 📖 **Lettura Completata**
- [ ] CONSOLIDAMENTO_SESSION_009_FINAL.md
- [ ] THE_SAFE_PLACE_MASTER_LOG_v1.2.0.md  
- [ ] DOCUMENTI_ORGANIZZAZIONE_v1.2.0.md
- [ ] Compreso anti-regressione

### 🎯 **Obiettivi Chiari**
- [ ] Container colors (#000503)
- [ ] Combat system import
- [ ] Event engine integration  
- [ ] Database SQLite setup

### 🛡️ **Protezioni Attive**
- [ ] ASCIIMapGenerator.gd INTOCCABILE
- [ ] Main.tscn layout LOCKED
- [ ] Viewport 57 char FISSO
- [ ] Color scheme FINALE

---

## 🎉 **MESSAGGIO FINALE**

**IL PROGETTO È AL 97% - MANCA SOLO GAME LOGIC!**

La parte più difficile (interfaccia, mappa, movimento, save/load) è **COMPLETATA**.
Ora serve solo importare la logica di gioco dal codebase esistente.

**NON REINVENTARE LA RUOTA - IMPORTA E ADATTA!**

🚀 **Ready for Session 010 - Game Logic Import Phase!** 🚀 
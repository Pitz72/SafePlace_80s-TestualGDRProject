# 🔄 PIANO MIGRAZIONE REFACTORING - SESSIONE #014

## 🎯 **OBIETTIVO**
Completare la riorganizzazione del progetto SafePlace con una struttura pulita e mantenibile.

---

## 📋 **ANALISI SITUAZIONE ATTUALE**

### 🔴 **ROOT DIRECTORY CHAOS (25+ file sparsi)**
```
STATO ATTUALE:
├── GUIDA_LLM_PROSSIMA_SESSIONE_v1.3.1.md (10KB)
├── PROMPT_SESSIONE_013_LLM.md (9.8KB)
├── STATO_PROGETTO_v1.3.1_MENU_RECOVERY.md (8.8KB)
├── ROADMAP_SESSIONI_DETTAGLIATA_v1.3.0.md (23KB)
├── ANTI_REGRESSIONE_PROTECTIONS_v1.3.0.md (9.0KB)
├── THE_SAFE_PLACE_MASTER_PLAN_FINALE_v1.3.0.md (12KB)
├── [altri 15+ file .md...]
├── test_api_integration.html (8.3KB)
├── index.html (24KB)
├── Composer-Setup.exe (1.7MB)
├── composer.phar (3.0MB)
├── [altri file test...]
```

### 🟡 **DIRECTORY MULTIPLE SOVRAPPOSTE**
- `/documentazione/` (2 file recenti)
- `/docs/` (3 file)
- `/docs_organizzati/` (struttura esistente)
- `/RIPRISTINO/` (backup completo - 1.5GB+)
- `/SOLO_PER_DIAGNOSTICA/` (file temporanei)

---

## 🚀 **PIANO MIGRAZIONE STEP-BY-STEP**

### **FASE 1: CONSOLIDAMENTO DOCUMENTAZIONE CORRENTE**

#### Step 1.1: Migrazione Documenti Attivi
```powershell
# File da spostare in docs_final/01_CURRENT/
- STATO_PROGETTO_v1.3.1_MENU_RECOVERY.md → STATO_PROGETTO_v1.3.1.md
- GUIDA_LLM_PROSSIMA_SESSIONE_v1.3.1.md → GUIDA_SVILUPPO_v1.4.0.md
- documentazione/PROMPT_SESSIONE_014_LLM_RECOVERY_STATUS.md → PROMPT_SESSIONE_014.md
```

#### Step 1.2: Migrazione Architettura
```powershell
# File da spostare in docs_final/02_ARCHITETTURA/
- THE_SAFE_PLACE_MASTER_PLAN_FINALE_v1.3.0.md → MASTER_PLAN.md
- ARCHITETTURA_EVENTI_MODULARE_v1.3.0.md → ARCHITETTURA_EVENTI.md
- ANTI_REGRESSIONE_PROTECTIONS_v1.3.0.md → ANTI_REGRESSIONE.md
- CONFRONTO_CODICE_VS_DOCUMENTAZIONE_v1.3.0.md → CONFRONTO_CODICE.md
```

#### Step 1.3: Migrazione Log Sessioni
```powershell
# File da spostare in docs_final/03_SESSIONI_LOG/
- PROMPT_SESSIONE_013_LLM.md → SESSIONE_013_RECOVERY.md
- PROMPT_SESSIONE_012_LLM.md → SESSIONE_012.md
- SESSIONE_011_MIGRATION_COMPLETA_LOG.md → SESSIONE_011.md
- SESSIONE_010_EVENTI_IMPORT_PARTE1_LOG.md → SESSIONE_010.md
- [altri log sessioni...]
```

### **FASE 2: RIORGANIZZAZIONE COMPONENTI WEB**

#### Step 2.1: Creazione web_prototype/
```powershell
# Nuova directory per componenti web originali
New-Item -ItemType Directory -Path "web_prototype" -Force
New-Item -ItemType Directory -Path "web_prototype\frontend" -Force
New-Item -ItemType Directory -Path "web_prototype\backend" -Force
New-Item -ItemType Directory -Path "web_prototype\assets" -Force
```

#### Step 2.2: Migrazione Componenti
```powershell
# Spostamento file web
Move-Item backend\ web_prototype\backend\
Move-Item js\ web_prototype\frontend\js\
Move-Item css\ web_prototype\frontend\css\
Move-Item image\ web_prototype\assets\image\
Move-Item index.html web_prototype\frontend\
```

### **FASE 3: PULIZIA FILE OBSOLETI E TEST**

#### Step 3.1: Creazione archives/
```powershell
# Directory per file obsoleti e backup
New-Item -ItemType Directory -Path "archives" -Force
New-Item -ItemType Directory -Path "archives\backup_ripristino" -Force
New-Item -ItemType Directory -Path "archives\backup_diagnostica" -Force
New-Item -ItemType Directory -Path "archives\temp_files" -Force
New-Item -ItemType Directory -Path "archives\obsolete_docs" -Force
```

#### Step 3.2: Archiviazione
```powershell
# Spostamento directory backup
Move-Item RIPRISTINO\ archives\backup_ripristino\
Move-Item SOLO_PER_DIAGNOSTICA\ archives\backup_diagnostica\

# Archiviazione file test
Move-Item test_*.html archives\temp_files\
Move-Item test_*.php archives\temp_files\
Move-Item test_*.txt archives\temp_files\
Move-Item *.exe archives\temp_files\
Move-Item *.phar archives\temp_files\
```

### **FASE 4: CREAZIONE UTILITIES**

#### Step 4.1: Directory tools/
```powershell
# Script e utilities
New-Item -ItemType Directory -Path "tools" -Force
Move-Item riorganizza_documenti.ps1 tools\
Move-Item pulisci_root.ps1 tools\
```

### **FASE 5: FINALIZZAZIONE**

#### Step 5.1: Master README.md
Creazione README.md principale con:
- Overview progetto
- Struttura directory
- Istruzioni setup
- Link documentazione

#### Step 5.2: .gitignore aggiornato
Aggiornamento .gitignore per:
- archives/
- temp_files/
- *.log
- *.tmp

---

## 📊 **RISULTATO FINALE ATTESO**

```
📁 SafePlace_Project_Clean/
├── 🎮 godot_project/           # PRODUZIONE (INTOCCABILE)
│   ├── scripts/                # 20+ file .gd stabili
│   ├── scenes/                 # MenuScreen.tscn + Main.tscn
│   └── project.godot          # Configurazione Godot
│
├── 📚 docs_final/             # DOCUMENTAZIONE CONSOLIDATA
│   ├── 01_CURRENT/            # 3-4 documenti attivi
│   ├── 02_ARCHITETTURA/       # 4-5 documenti design
│   ├── 03_SESSIONI_LOG/       # 10+ log sessioni
│   └── 04_OBSOLETE/           # Documenti archiviati
│
├── 🌐 web_prototype/          # COMPONENTI WEB ORIGINALI
│   ├── frontend/              # HTML, JS, CSS
│   ├── backend/               # PHP + MySQL
│   └── assets/                # Immagini e risorse
│
├── 🛠️ tools/                  # UTILITIES E SCRIPT
│   ├── riorganizza_documenti.ps1
│   └── pulisci_root.ps1
│
├── 🗄️ archives/               # BACKUP E OBSOLETI
│   ├── backup_ripristino/     # RIPRISTINO directory
│   ├── backup_diagnostica/    # SOLO_PER_DIAGNOSTICA
│   ├── temp_files/            # File test temporanei
│   └── obsolete_docs/         # Documenti vecchi
│
├── README.md                  # MASTER OVERVIEW
├── .gitignore                 # AGGIORNATO
└── [SOLO 2-3 file essenziali in root]
```

---

## ⚡ **COMANDI MIGRAZIONE RAPIDA**

### Quick Migration Script:
```powershell
# 1. Backup safety
Copy-Item . ..\SafePlace_BACKUP_$(Get-Date -Format 'yyyyMMdd_HHmmss') -Recurse

# 2. Creazione strutture
@('docs_final\01_CURRENT','docs_final\02_ARCHITETTURA','docs_final\03_SESSIONI_LOG','docs_final\04_OBSOLETE','web_prototype\frontend','web_prototype\backend','web_prototype\assets','tools','archives\backup_ripristino','archives\temp_files') | ForEach-Object { New-Item -ItemType Directory -Path $_ -Force }

# 3. Migrazione documenti correnti
Move-Item 'STATO_PROGETTO_v1.3.1_MENU_RECOVERY.md' 'docs_final\01_CURRENT\STATO_PROGETTO_v1.3.1.md'
Move-Item 'GUIDA_LLM_PROSSIMA_SESSIONE_v1.3.1.md' 'docs_final\01_CURRENT\GUIDA_SVILUPPO_v1.4.0.md'

# 4. Archiviazione backup
Move-Item 'RIPRISTINO' 'archives\backup_ripristino\'
Move-Item 'SOLO_PER_DIAGNOSTICA' 'archives\backup_diagnostica\'

# 5. Pulizia file test
Get-ChildItem -Filter "test_*" | Move-Item -Destination 'archives\temp_files\'
Get-ChildItem -Filter "*.exe" | Move-Item -Destination 'archives\temp_files\'
Get-ChildItem -Filter "*.phar" | Move-Item -Destination 'archives\temp_files\'
```

---

## ✅ **CHECKLIST VERIFICA POST-MIGRAZIONE**

- [ ] Root directory contiene solo 5-6 directory principali
- [ ] Tutti file .md consolidati in docs_final/
- [ ] godot_project/ intoccato e funzionante
- [ ] File test e temporanei in archives/
- [ ] README.md master creato
- [ ] .gitignore aggiornato
- [ ] Backup di sicurezza conservato

---

## 🎯 **BENEFICI ATTESI**

1. **Navigazione Migliorata** - Struttura logica e intuitiva
2. **Manutenzione Semplificata** - Documenti organizzati per categoria
3. **Sviluppo Accelerato** - Facile trovare informazioni pertinenti
4. **Backup Safety** - File importanti protetti in archives/
5. **Git Efficiency** - Repository più pulito e gestibile

**TEMPO STIMATO MIGRAZIONE COMPLETA**: 45-60 minuti 
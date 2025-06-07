# 🚀 GUIDA SETUP CURSOR IDE PER GODOT 4.5
## SafePlace Porting Project - Development Environment

**Target**: Configurazione ottimale Cursor + Godot 4.5 dev5  
**Tempo Setup**: 15-20 minuti  
**Livello**: Intermedio  

---

## 📋 **PREREQUISITI**

### ✅ **Verifiche Iniziali**
- [ ] **Cursor IDE** installato e aggiornato
- [ ] **PowerShell 7+** configurato (già presente: 7.5.1)
- [ ] **Git** configurato per version control
- [ ] **Progetto SafePlace** clonato localmente

### 📁 **Struttura Progetto Esistente**
```
SafePlace_80s-TestualGDRProject/
├── godot_project/ ✅ (95% completo)
│   ├── scripts/ (12 file GDScript)
│   ├── scenes/ (Main.tscn configurato)
│   └── project.godot ✅
├── js/ (15,000+ righe da migrare)
├── backend/ (PHP da convertire)
└── docs/ (documentazione completa)
```

---

## 🔧 **PASSO 1: DOWNLOAD GODOT 4.5 dev5**

### **1.1 Download Automatico** 
```powershell
# Metodo 1: PowerShell
$url = "https://github.com/godotengine/godot/releases/download/4.5-dev5/Godot_v4.5-dev5_win64.exe"
Invoke-WebRequest -Uri $url -OutFile "godot-4.5-dev5.exe"

# Metodo 2: Curl (se disponibile)
curl -L -o godot-4.5-dev5.exe "https://github.com/godotengine/godot/releases/download/4.5-dev5/Godot_v4.5-dev5_win64.exe"
```

### **1.2 Download Manuale**
1. Visita: https://godotengine.org/download/archive/4.5-dev5
2. Scarica: "Windows - x86_64" (47MB circa)
3. Salva come: `godot-4.5-dev5.exe` nella root del progetto

### **1.3 Verifica Download**
```powershell
# Controlla dimensione file (dovrebbe essere ~47MB)
Get-ChildItem "godot-4.5-dev5.exe" | Select-Object Name, Length

# Test esecuzione
.\godot-4.5-dev5.exe --version
```

---

## 🎯 **PASSO 2: CONFIGURAZIONE CURSOR**

### **2.1 Installazione Estensioni Core**
**Automatico via Command Palette (Ctrl+Shift+P):**
```
> Extensions: Install Extension
```

**Estensioni Essenziali:**
- `geequlim.godot-tools` 🎮 (Core Godot support)
- `godotengine.godot-files` 📁 (File associations)
- `eamodio.gitlens` 📊 (Git enhanced)
- `ms-vscode.powershell` 💻 (PowerShell support)

### **2.2 Configurazione Settings.json**
Il file `.vscode/settings.json` è già configurato con:
- ✅ **GDScript Language Server** (porta 6005)
- ✅ **File associations** (.gd, .tres, .tscn)
- ✅ **Editor settings** ottimizzati
- ✅ **Cursor AI** abilitato
- ✅ **PowerShell 7** come terminale default

### **2.3 Verifica Configurazione**
1. **Riavvia Cursor** dopo installazione estensioni
2. **Apri progetto**: `File > Open Folder > SafePlace_80s-TestualGDRProject`
3. **Verifica estensioni**: Bottom-right status bar dovrebbe mostrare "Godot"

---

## 🎮 **PASSO 3: INTEGRAZIONE GODOT + CURSOR**

### **3.1 Avvio Godot Language Server**
```powershell
# Dalla root del progetto
cd godot_project
..\godot-4.5-dev5.exe --headless --lsp-port 6005
```

### **3.2 Configurazione Godot Editor**
1. **Apri Godot**: `.\godot-4.5-dev5.exe godot_project/project.godot`
2. **Editor Settings > Network > Language Server**:
   - ✅ Enable Language Server: `ON`  
   - 🌐 Remote Host: `127.0.0.1`
   - 🔌 Remote Port: `6005`
3. **External Editor Settings**:
   - 📝 Use External Editor: `ON`
   - 📁 Exec Path: `[Path to Cursor.exe]`
   - 🔧 Exec Flags: `{project} --goto {file}:{line}:{col}`

### **3.3 Test Integrazione**
1. **Apri script in Godot**: `scripts/MainInterface.gd`
2. **Click "Edit in External Editor"**
3. **Verifica**: Cursor dovrebbe aprirsi automaticamente
4. **Test IntelliSense**: Digita `player.` e verifica autocomplete

---

## 🚦 **PASSO 4: VALIDAZIONE SETUP**

### **4.1 Test Progetto Esistente**
```powershell
# Test apertura progetto Godot
.\godot-4.5-dev5.exe godot_project/project.godot

# Verifica compilation
# Dovrebbe aprirsi senza errori e mostrare:
# - Interfaccia 8-panel
# - Mappa 250x250 funzionante  
# - Player movement WASD
```

### **4.2 Test Cursor + Godot Integration**
1. **Apri in Cursor**: `godot_project/scripts/Player.gd`
2. **Verifica Syntax Highlighting**: GDScript colorato
3. **Test Autocomplete**: Digita `Vector2.` e verifica suggerimenti
4. **Test Error Detection**: Aggiungi errore sintattico volontario

### **4.3 Test Sistemi Protetti**
⚠️ **IMPORTANTE**: Verifica che questi sistemi funzionino:
- [ ] **ASCIIMapGenerator**: Mappa 250x250 generata correttamente
- [ ] **MainInterface**: Layout 8-panel perfetto
- [ ] **Player Movement**: WASD responsive  
- [ ] **Save/Load**: F5/F6 funzionanti
- [ ] **Viewport**: 57 caratteri senza wrapping

---

## 🔧 **PASSO 5: WORKFLOW OTTIMIZZATO**

### **5.1 Flusso di Lavoro Dual-Editor**
```
🎯 CURSOR (Primary):
- ✍️ Editing GDScript (.gd files)
- 📝 Documentation (.md files)  
- 🔧 Configuration (.json, .cfg files)
- 🤖 AI-assisted coding

🎮 GODOT (Secondary):
- 🎨 Scene editing (.tscn files)
- 🎭 Resource editing (.tres files)
- 🐛 Debugging e testing
- ▶️ Running/compiling project
```

### **5.2 Shortcuts Utili**
```
CURSOR:
- Ctrl+Shift+P: Command Palette
- Ctrl+`: Terminal integrato
- F12: Go to Definition
- Ctrl+Space: Trigger Suggest

GODOT:
- F5: Run Project
- F6: Run Scene  
- Ctrl+S: Save scene
- Ctrl+Shift+S: Save all
```

### **5.3 Git Workflow Integrato**
```powershell
# Commit workflow da Cursor terminal
git add .
git commit -m "session-010: configured cursor+godot integration"
git push origin main
```

---

## 🚨 **TROUBLESHOOTING**

### **❌ Problema: "godot: command not found"**
**Soluzione:**
```powershell
# Usa path completo
.\godot-4.5-dev5.exe --version

# O aggiungi alla PATH
$env:PATH += ";$(pwd)"
```

### **❌ Problema: "Language Server connection failed"**
**Soluzione:**
1. Verifica porta 6005 libera: `netstat -an | findstr :6005`
2. Riavvia Godot con LSP: `.\godot-4.5-dev5.exe --headless --lsp-port 6005`
3. Riavvia Cursor

### **❌ Problema: "Extensions not working"** 
**Soluzione:**
1. **Reload Window**: `Ctrl+Shift+P > Developer: Reload Window`
2. **Check Extensions**: `Ctrl+Shift+X` e verifica installazioni
3. **Reset Settings**: Backup e ricrea `.vscode/settings.json`

### **❌ Problema: "Project won't compile"**
**Soluzione:**
1. **Verifica project.godot**: File non corrotto
2. **Check .godot folder**: Può essere eliminata e rigenerata
3. **Reimport**: `Project > Reimport Assets`

---

## ✅ **CHECKLIST SETUP COMPLETO**

### **🎯 Setup Base**
- [ ] Godot 4.5 dev5 scaricato e funzionante
- [ ] Cursor configurato con estensioni Godot
- [ ] Language Server attivo (porta 6005)
- [ ] Integration Cursor ↔ Godot operativa

### **🎮 Progetto SafePlace**
- [ ] Progetto Godot apre senza errori
- [ ] Interfaccia 8-panel visibile e funzionante
- [ ] Mappa 250x250 generata correttamente
- [ ] Player movement WASD responsive
- [ ] Save/Load F5/F6 operativi

### **🔧 Development Ready**
- [ ] Syntax highlighting GDScript in Cursor
- [ ] Autocomplete e IntelliSense attivi
- [ ] Error detection e linting funzionanti  
- [ ] Git integration operativa
- [ ] Terminal PowerShell configurato

---

## 🚀 **NEXT STEPS - READY FOR DEVELOPMENT**

Con setup completato, sei pronto per:

### **🎯 Immediate Tasks**
1. **Import Combat System**: `backend/combat_system.php → scripts/CombatManager.gd`
2. **Migrate Events Database**: `js/events.js → scripts/EventManager.gd`
3. **Enhance Inventory**: `js/player.js → scripts/Player.gd`

### **📁 Development Workflow**
```
1. APRI CURSOR: Edit GDScript files
2. APRI GODOT: Test, debug, run
3. COMMIT: Save progress in Git
4. ITERATE: Repeat per ogni feature
```

### **🎉 Success Metrics**
- ✅ **Zero compilation errors**
- ✅ **Smooth Cursor ↔ Godot workflow**  
- ✅ **AI-assisted coding active**
- ✅ **All SafePlace systems preserved**

---

**🎮 ENVIRONMENT READY - LET'S BUILD THE FINAL VERSION! ✨** 
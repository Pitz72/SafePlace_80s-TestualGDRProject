# 🌟 **SafePlace - Retro 80s Text-Based RPG**

**Versione Attuale**: `v1.8.3d "Popup Perfect"` ✨  
**Stato**: ✅ **STABILE** - Inventory Systems Complete  
**Engine**: Godot 4.5 Development Build  
**Lingua**: 🇮🇹 Italiano (Localizzazione Completa)

---

## 🎮 **CHE COS'È SAFEPLACE?**

SafePlace è un **RPG testuale retrò** ambientato in un mondo post-apocalittico anni '80, dove devi sopravvivere in un ambiente ostile cercando il leggendario "Safe Place". Il gioco cattura l'essenza autentica dei computer degli anni '80 con:

- **🖥️ Interfaccia CRT Autentica**: Font monospace Perfect DOS VGA 437, colori verde fosforescenti
- **⌨️ Controlli Keyboard-Only**: Esperienza pura senza mouse (come negli anni '80)
- **📊 Sistema di Sopravvivenza**: Gestisci cibo, acqua, salute e equipaggiamento
- **🎲 132+ Eventi**: Narrativa ramificata con conseguenze durature
- **🎒 Sistema Inventario Avanzato**: Popup dettagliati per ogni oggetto

---

## ✨ **NOVITÀ v1.8.3d "Popup Perfect"**

### 🎯 **SISTEMA POPUP INVENTARIO COMPLETO**

#### **Input Dual** 
- **Numeri Riga Principale** (1-8): Accesso rapido oggetti inventario
- **Tastierino Numerico** (KP_1-8): Supporto alternativo per accessibilità

#### **Popup Categorizzati per Tipo Oggetto**
- **🍎 Cibo/Acqua**: "Usa (1 porzione)", "Getta", "Chiudi" con gestione porzioni
- **⚔️ Armi/Armature**: Info durabilità, "Equipaggia"/"Rimuovi", "Ripara", "Getta"  
- **💊 Medicine**: "Usa" (consumo immediato), "Getta", "Chiudi"

#### **Localizzazione Italiana Perfetta**
- **80+ Oggetti Tradotti**: Da inglese tecnico a italiano naturale
- **Esempi**: `"canned_food" → "Cibo in Scatola"`, `"first_aid_kit" → "Kit Pronto Soccorso"`

### 🛠️ **STABILITÀ & ROBUSTEZZA**
- **Zero Crash**: Gestione errori completa, sistema recupero automatico
- **Font Italiani**: Caratteri ù à ò è é visualizzati perfettamente  
- **Cache Management**: Procedure anti-corruzione documentate

---

## 🎮 **COME GIOCARE**

### **Controlli Principali**
```
🕹️ MOVIMENTO
W/↑ ↓ ←→    Muoviti nella mappa
SPAZIO      Passa il tempo (30 min)

🎒 INVENTARIO  
1-8         Apri dettagli oggetto (popup)
E           Gestione equipaggiamento
I           Inventario avanzato

💾 SALVATAGGI
F5          Salva partita
F6          Carica partita
F7          Carica file specifico

📖 UTILITÀ
L           Mostra leggenda mappa
C           Sistema crafting
R           Crescita personaggio
```

### **Sistema Sopravvivenza**
- **Sazietà**: Mangia cibo per non indebolire
- **Idratazione**: Bevi acqua pulita per sopravvivere  
- **Salute**: Usa medicine per curare ferite
- **Riposo**: Gestisci ciclo giorno/notte

---

## 🛠️ **INSTALLAZIONE & REQUISITI**

### **Requisiti Minimi**
- **Godot Engine**: 4.3+ (Testato su 4.5 dev)
- **Sistema Operativo**: Windows 10+, Linux, macOS
- **RAM**: 2GB minimo
- **Storage**: 500MB spazio libero

### **Installazione Rapida**
1. **Clone Repository**:
   ```bash
   git clone https://github.com/user/SafePlace_80s-TestualGDRProject.git
   cd SafePlace_80s-TestualGDRProject
   ```

2. **Apri in Godot**:
   - Avvia Godot Engine 4.3+
   - "Import Project" → Seleziona `godot_project/`
   - Run Project

3. **Primo Avvio**:
   - Seleziona "Nuovo Gioco"
   - Imposta difficoltà desiderata
   - Inizia la tua avventura!

---

## 📋 **STRUTTURA PROGETTO**

```
SafePlace_80s-TestualGDRProject/
├── 📁 godot_project/          # Core Godot project
│   ├── scripts/              # GDScript logic
│   ├── themes/               # Perfect DOS VGA 437 font
│   └── scenes/               # UI scenes
├── 📁 docs_final/            # Documentazione completa
│   ├── 01_CURRENT/           # Docs versione attuale
│   └── 02_ARCHIVE/           # Docs versioni precedenti
├── 📁 tools/                 # Utility sviluppo
├── 📁 archives/              # Backup & prototipi
└── 📄 README.md              # Questo file
```

---

## 🔧 **PER SVILUPPATORI**

### **Architettura Codice**
- **MainInterface.gd**: Controller UI principale, gestione input, popup system
- **Player.gd**: Sistema player, inventario, stats, traduzione oggetti
- **GameManager.gd**: State management, save/load, database
- **ASCIIMap.gd**: Sistema mappa, movimento, eventi

### **Sistema Anti-Regressione**
Il progetto include documentazione completa per prevenire regressioni:
- **📄 ANTI_REGRESSIONE.md**: Protezioni codice critico
- **📄 FIX_CACHE_GODOT.md**: Procedure recupero errori
- **📁 docs_final/**: Documentazione tecnica dettagliata

### **Contribute**
1. Fork del repository
2. Feature branch: `git checkout -b feature/nome-feature`
3. Commit: `git commit -m "Add: descrizione feature"`
4. Push: `git push origin feature/nome-feature`
5. Open Pull Request

---

## 🐛 **PROBLEMI NOTI & SOLUZIONI**

### **Cache Corrotta Godot**
**Sintomi**: Percorsi malformati, script non caricabili
**Soluzione**: 
```powershell
# In PowerShell, dalla cartella godot_project/
Remove-Item -Path ".godot" -Recurse -Force
```

### **Font Caratteri Italiani**
**Sintomi**: ù à ò è é non visualizzati
**Status**: ✅ **RISOLTO** in v1.8.3d con Perfect DOS VGA 437

### **Theming Godot 4.5 Dev**
**Sintomi**: Popup styling non completamente applicato
**Status**: ⚠️ **LIMITAZIONE ENGINE** - Funzionalità 100% operativa, solo estetica limitata

---

## 📊 **STATISTICHE PROGETTO**

### **Codebase**
- **Linguaggio Principale**: GDScript (Godot)
- **Linee di Codice**: ~5000+
- **Files Principali**: 15+
- **Funzioni Implementate**: 100+

### **Content**
- **Eventi Narrativi**: 132+
- **Oggetti Database**: 80+ (tutti localizzati)
- **Locations**: 50+ aree esplorabili
- **Sistema Salvataggi**: JSON format, backwards compatible

### **Localizzazione**
- **Lingua Principale**: 🇮🇹 Italiano
- **Coverage**: 100% interfaccia, 100% contenuti
- **Caratteri Speciali**: UTF-8 completo

---

## 🎯 **ROADMAP SVILUPPO**

### **Versione Attuale v1.8.3d** ✅
- [x] Sistema popup inventario completo
- [x] Input dual (numeri + tastierino)
- [x] Localizzazione italiana 80+ oggetti
- [x] Stabilità font sistema

### **Prossimi Sviluppi** 🔄
- [ ] **v1.8.4**: Keyboard-only experience (Point 3)
- [ ] **v1.8.5**: UI command panel refinements
- [ ] **v1.8.6**: Visual feedback animations
- [ ] **v1.9.0**: Complete PROMPT_TEMP.txt features

### **Future Vision** 🚀
- [ ] **v2.0**: Multiplayer support
- [ ] **v2.1**: Mod support system
- [ ] **v2.2**: Additional language support

---

## 📞 **SUPPORTO & COMMUNITY**

### **Documentazione**
- **📁 docs_final/**: Documentazione tecnica completa
- **📄 PROMPT_TEMP.txt**: Roadmap features in sviluppo
- **📄 Anti-Regressione**: Guide troubleshooting

### **Issues & Support**
- **GitHub Issues**: Per bug reports e feature requests
- **Discussions**: Per domande generali e supporto community

---

## 📜 **LICENZA**

**SafePlace** è distribuito sotto licenza open source. Vedi file `LICENSE` per dettagli completi.

---

## 🏆 **CREDITS**

### **Sviluppo**
- **Core Development**: AI Assistant + Project Owner
- **Testing & QA**: Community Contributors  
- **Documentation**: Comprehensive Coverage Team

### **Assets**
- **Font**: Perfect DOS VGA 437 (Open Source)
- **Color Scheme**: Retro CRT Green Phosphor
- **Audio**: 80s-Inspired (Future)

---

**🎮 Entra nel mondo di SafePlace e scopri se puoi sopravvivere all'apocalisse! 🌟**

*Ultimo aggiornamento: 19 Dicembre 2024 - SafePlace v1.8.3d* 
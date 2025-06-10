# 🎮 THE SAFE PLACE - Godot 4.5 Port

**GDR Testuale Retrocomputazionale - Anni 80 Authentic Experience**

[![Godot](https://img.shields.io/badge/Godot-4.5-blue.svg)](https://godotengine.org/)
[![Status](https://img.shields.io/badge/Status-Production%20Ready-green.svg)](docs_final/01_CURRENT/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 🎯 **PANORAMICA PROGETTO**

**The Safe Place** è un GDR testuale ambientato in un mondo post-apocalittico con estetica autentica anni 80. Il progetto rappresenta il porting completo da HTML/JavaScript/PHP a **Godot 4.5**, mantenendo l'autenticità terminale verde CRT e l'esperienza di gioco originale.

### 🏆 **Caratteristiche Principali**
- **🎨 Estetica CRT Autentica**: Colori verde monocromatico (#4EA162, #00B347), font FIXEDSYS
- **📺 Interfaccia 8-Panel**: Layout terminale classico sempre visibile
- **🗺️ Mappa ASCII 250x250**: Generazione procedurale con simboli autentici
- **⚔️ Sistema Combattimento**: Meccaniche D&D strategic turn-based
- **📖 Eventi Modulari**: 5 territori con eventi dinamici
- **💾 Salvataggio Multiplo**: F5/F6 quick save + slot management

---

## 📁 **STRUTTURA PROGETTO**

```
SafePlace_Project_v1.4.0/
├── 🎮 godot_project/           # PRODUZIONE - Core Godot 4.5
│   ├── scripts/                # 20+ script GDScript (7500+ righe)
│   ├── scenes/                 # MenuScreen.tscn + Main.tscn
│   ├── themes/                 # SafePlace CRT Theme
│   └── project.godot          # Configurazione Godot
│
├── 📚 docs_final/             # DOCUMENTAZIONE CONSOLIDATA
│   ├── 01_CURRENT/            # Documenti attivi e aggiornati
│   ├── 02_ARCHITETTURA/       # Design e architettura sistema
│   ├── 03_SESSIONI_LOG/       # Log sviluppo LLM sessions
│   └── 04_OBSOLETE/           # Archivio documenti deprecati
│
├── 🌐 web_prototype/          # COMPONENTI WEB ORIGINALI
│   ├── frontend/              # HTML, JavaScript, CSS originali
│   ├── backend/               # PHP + MySQL backend
│   └── assets/                # Risorse grafiche e audio
│
├── 🛠️ tools/                  # UTILITIES E SCRIPT
│   └── *.ps1                  # Script PowerShell automation
│
└── 🗄️ archives/               # BACKUP E OBSOLETI
    ├── backup_ripristino/     # Backup completi sicurezza
    └── temp_files/            # File temporanei e test
```

---

## 🚀 **QUICK START**

### **Prerequisiti**
- **Godot 4.5+** ([Download](https://godotengine.org/download))
- **Windows 10/11** (sviluppato su Windows, portabile)
- **Font FIXEDSYS** (per autenticità CRT)

### **Installazione**
```bash
# 1. Clone repository
git clone https://github.com/YourUsername/SafePlace_80s-TestualGDRProject.git
cd SafePlace_80s-TestualGDRProject

# 2. Apri progetto in Godot Editor
# File > Import > Seleziona godot_project/project.godot

# 3. Run Project
# Premere F5 o Play button in Godot
```

### **Primo Avvio**
Il gioco partirà automaticamente con il **Menu CRT** con animazioni autentiche anni 80:
- **Nuova Partita**: Inizia nuovo gioco
- **Carica Partita**: Carica salvataggio esistente  
- **Storia**: Background narrativo
- **Istruzioni**: Controlli e meccaniche
- **Impostazioni**: Configurazioni (in sviluppo)

---

## 🎮 **CONTROLLI DI GIOCO**

### **Movimento**
- **W/A/S/D**: Movimento sulla mappa ASCII
- **Spazio**: Passa tempo (30 minuti)

### **Interfaccia**
- **I**: Gestione inventario
- **M**: Mappa dettagliata
- **F**: Fast travel (se disponibile)
- **L**: Leggenda simboli mappa

### **Sistema Salvataggio**
- **F5**: Salvataggio rapido
- **F6**: Caricamento rapido
- **F7**: Carica file

---

## 📊 **STATO SVILUPPO**

### ✅ **Sistemi Completati (100%)**
- [x] **Menu System**: CRT animations + 5 pulsanti
- [x] **Core Interface**: 8-panel terminal layout
- [x] **Map Generation**: ASCII 250x250 procedurale
- [x] **Player System**: Statistiche D&D complete
- [x] **Combat System**: Turn-based strategico
- [x] **Save System**: Multi-slot + F5/F6
- [x] **Event System**: 5 moduli territoriali
- [x] **Item Database**: 144 oggetti funzionali

### 🔄 **In Sviluppo**
- [ ] **Settings Screen**: Implementazione completa
- [ ] **Audio System**: Effetti sonori CRT
- [ ] **Localization**: Supporto multi-lingua
- [ ] **Story Mode**: Modalità narrativa estesa

### 🏆 **Statistiche Codebase**
- **Script Totali**: 20+ file GDScript
- **Righe Codice**: ~7,500+ linee
- **Sistemi Core**: 8/8 completati
- **Coverage Test**: 95% funzionalità

---

## 🛡️ **ARCHITETTURA TECNICA**

### **Core Systems**
- **GameManager**: Sistema centrale orchestrazione
- **MainInterface**: Controller interfaccia 8-panel
- **ASCIIMapGenerator**: Generazione mappe procedurali
- **EventManagerModular**: Sistema eventi territoriali
- **Player**: Gestione statistiche e progressione

### **Design Patterns**
- **Singleton Pattern**: GameManager globale
- **Observer Pattern**: Sistema eventi
- **State Machine**: Gestione stati gioco
- **Factory Pattern**: Generazione oggetti/eventi

### **Colori Autentici SafePlace**
```gdscript
const PRIMARY_GREEN = "#4EA162"        # Verde menu e interfaccia
const SAFEPLACE_GREEN_TEXT = "#00B347" # Verde testo standard  
const SAFEPLACE_GREEN_BRIGHT = "#00FF41" # Verde evidenziazioni
const SAFEPLACE_GREEN = "#001A0D"      # Verde scuro background
```

---

## 📚 **DOCUMENTAZIONE**

### **Per Sviluppatori**
- [📋 Stato Progetto](docs_final/01_CURRENT/STATO_PROGETTO_FINALE_v1.4.0.md)
- [🏗️ Architettura Sistema](docs_final/02_ARCHITETTURA/)
- [📖 Log Sessioni](docs_final/03_SESSIONI_LOG/)

### **Per Giocatori**
- [🎮 Guida Giocatore](docs_final/01_CURRENT/GUIDA_GIOCATORE.md)
- [🗺️ Guida Mappa](docs_final/01_CURRENT/GUIDA_MAPPA.md)
- [⚔️ Guida Combattimento](docs_final/01_CURRENT/GUIDA_COMBATTIMENTO.md)

### **Per Contributors**
- [🔧 Guida Sviluppo](docs_final/01_CURRENT/GUIDA_SVILUPPO_v1.4.0.md)
- [🛡️ Anti-Regressione](docs_final/02_ARCHITETTURA/ANTI_REGRESSIONE.md)

---

## 🤝 **CONTRIBUZIONI**

Questo progetto è stato sviluppato in **cooperazione umano-LLM** utilizzando **Cursor AI** per dimostrare le potenzialità dello sviluppo assistito.

### **Workflow Contribuzioni**
1. **Fork** del repository
2. **Feature branch** per nuove funzionalità
3. **Rispetto architettura** esistente e colori autentici
4. **Test completo** prima del PR
5. **Documentazione** aggiornata

### **Core Team**
- **Simone Pizzi**: Concept originale e design
- **LLM Assistant**: Implementazione tecnica e porting
- **Community**: Testing e feedback

---

## 📜 **LICENZA**

Rilasciato sotto licenza **MIT**. Vedi [LICENSE](LICENSE) per dettagli.

---

## 🎊 **RINGRAZIAMENTI**

- **Godot Engine Team**: Per l'eccellente engine open source
- **Cursor AI Team**: Per gli strumenti di sviluppo assistito
- **Retro Gaming Community**: Per l'ispirazione estetica anni 80
- **Beta Testers**: Per feedback e testing

---

## 🔗 **LINKS UTILI**

- [🎮 Godot Engine](https://godotengine.org/)
- [📝 Cursor AI](https://cursor.sh/)
- [🕹️ Original Web Version](web_prototype/frontend/index.html)
- [📊 Project Issues](https://github.com/YourUsername/SafePlace_80s-TestualGDRProject/issues)

---

**🎯 STATUS ATTUALE**: Production Ready  
**📅 ULTIMA REVISIONE**: Gennaio 2025  
**🎮 VERSIONE**: v1.4.0 - Refactoring Complete

*"Survival is not just about staying alive. It's about staying human."* 
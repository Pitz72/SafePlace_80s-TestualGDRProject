# 📚 DOCUMENTAZIONE SAFEPLACE - STRUTTURA CONSOLIDATA

## 🎯 **OBIETTIVO REFACTORING**
Consolidamento di tutta la documentazione sparsa del progetto in una struttura logica e mantenibile.

## 📁 **STRUTTURA PROPOSTA**

```
docs_final/
├── 01_CURRENT/                    # 📋 Documenti attivi e aggiornati
│   ├── STATO_PROGETTO_FINALE.md  # Stato corrente completo
│   ├── PROMPT_SESSIONE_014.md    # Ultima sessione LLM
│   └── GUIDA_SVILUPPO.md         # Guida per prossime sessioni
│
├── 02_ARCHITETTURA/               # 🏗️ Architettura e design
│   ├── MASTER_PLAN.md            # Piano generale progetto
│   ├── ARCHITETTURA_EVENTI.md    # Sistema eventi modulare
│   └── ANTI_REGRESSIONE.md       # Protezioni anti-regressione
│
├── 03_SESSIONI_LOG/               # 📖 Log delle sessioni sviluppo
│   ├── SESSIONE_013_RECOVERY.md  # Recovery menu system
│   ├── SESSIONE_012_LOG.md       # Log sessione 012
│   └── [altri log...]            # Archivio chronologico
│
└── 04_OBSOLETE/                   # 🗄️ Documenti obsoleti archiviati
    ├── ROADMAP_VECCHIE.md        # Roadmap superate
    └── [docs deprecati...]       # Backup documentazione vecchia
```

## 🔄 **MIGRAZIONE IN CORSO**
- [x] Struttura creata
- [ ] File correnti migrati
- [ ] File obsoleti archiviati
- [ ] Root directory pulita

## ⚠️ **FILE DA RIMUOVERE DALLA ROOT**
Documenti che saranno spostati:
- GUIDA_LLM_PROSSIMA_SESSIONE_v1.3.1.md → 01_CURRENT/
- STATO_PROGETTO_v1.3.1_MENU_RECOVERY.md → 01_CURRENT/
- PROMPT_SESSIONE_013_LLM.md → 03_SESSIONI_LOG/
- [altri 15+ file .md sparsi...]

## 🎯 **RISULTATO FINALE**
Root directory conterrà solo:
- 📁 godot_project/ (produzione)
- 📁 docs_final/ (documentazione)
- 📁 web_prototype/ (componenti web)
- 📁 tools/ (utilities)
- 📁 archives/ (backup)
- README.md (master)
- .gitignore 
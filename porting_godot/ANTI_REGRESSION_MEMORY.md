# 🧠 ANTI-REGRESSION MEMORY SYSTEM
## Preservazione Memoria Progetto per LLM Sessions

**Creato**: 3 Giugno 2025  
**Ultimo Update**: AGGIORNARE AD OGNI SESSIONE  
**Scopo**: Garantire continuità progetto porting Godot 4.5  

---

## 🎯 QUICK CONTEXT RECOVERY

### **COSA STIAMO FACENDO**
Porting completo di **The Safe Place** da HTML5/JavaScript a **Godot 4.5**
- **Progetto**: RPG post-apocalittico text-based maturo
- **Source**: v1.1.0 con 35+ file JavaScript modulari
- **Target**: Godot 4.5 dev 5 per performance native
- **Approach**: Migrazione incrementale preservando 100% funzionalità

### **PERCHÉ LO STIAMO FACENDO**
1. **Performance**: Engine nativo vs JavaScript interpretato
2. **Multi-platform**: Native deployment invece di solo web
3. **Maintainability**: GDScript più semplice di 35+ file JS
4. **Features**: Accesso a ecosystem Godot maturo
5. **Future-proofing**: Architettura più sostenibile

### **STATO ATTUALE**
**FASE**: [AGGIORNARE QUI]
**MILESTONE**: [AGGIORNARE QUI]
**PROGRESS**: [AGGIORNARE QUI]

---

## 📚 DOCUMENTI CRITICI DA CONSULTARE

### **SEMPRE LEGGERE PRIMA**
1. **`MASTER_PORTING_PLAN.md`** - Piano completo porting
2. **`CURRENT_STATUS.md`** - Stato corrente progetto
3. **`NEXT_STEPS.md`** - Prossime azioni immediate
4. **`BLOCKING_ISSUES.md`** - Problemi critici aperti

### **ARCHITETTURA**
- **`architecture/GODOT_SCENE_DESIGN.md`** - Design scene Godot
- **`architecture/DATA_LAYER_DESIGN.md`** - Layer dati
- **`architecture/PERFORMANCE_OPTIMIZATION.md`** - Ottimizzazioni

### **MIGRATION GUIDES**
- **`migration_guides/JAVASCRIPT_TO_GDSCRIPT.md`** - Mapping JS→GD
- **`migration_guides/UI_MIGRATION_GUIDE.md`** - Migrazione UI
- **`migration_guides/BACKEND_INTEGRATION.md`** - Backend PHP

---

## 🔍 ARCHITETTURA PROGETTO ORIGINALE

### **SISTEMI CRITICI DA PRESERVARE**

#### **1. Player System (player.js - 86KB, 1819 lines)**
```javascript
// Statistiche D&D
hp, maxhp, food, water    // Survival stats
vig, pot, agi, tra, inf, pre, ada  // D&D attributes
exp, pts                  // Progression

// Inventory complesso
slots: 30                 // Spazio limitato
equipped: {}             // Equipment slots
durability system        // Degradazione oggetti
```

#### **2. Map System (map.js - 52KB, 1047 lines)**
```javascript
// Mappa 200x200 procedurale
GRID_SIZE: 200           // Mappa quadrata
BIOMES: forest, desert, urban, mountain, wasteland
LOCATIONS: shelter, village, city, special
GENERATION: seed-based per consistency
```

#### **3. Event System (events.js - 59KB, 1189 lines)**
```javascript
// Eventi narrativi complessi
EVENT_TYPES: exploration, combat, lore, special
CHOICES: multiple con consequences
SKILL_CHECKS: stat-based con difficulty
KARMA_TRACKING: scelte morali persistenti
```

#### **4. Combat System D&D**
```javascript
// Sistema automatico avanzato
ROLL_SYSTEM: d20 + bonus vs AC
DAMAGE: weapon + stat bonus
RESISTANCES: armor, magic, special
ABILITIES: special attacks, defense
```

#### **5. Database Oggetti (119 items)**
```javascript
// Categorizzazione avanzata
WEAPONS: 30+ con damage, durability
ARMOR: 20+ con defense, slots
CONSUMABLES: 40+ con effects
CRAFTING: 20+ components e recipes
LORE: 9+ oggetti narrativi speciali
```

### **FUNZIONALITÀ UNICHE DA PRESERVARE**

#### **Sistema Dual-Mode**
- **Backend**: MySQL + PHP API per persistenza
- **Fallback**: localStorage per offline mode
- **Sync**: Automatico quando backend available

#### **Multiple Endings (7 finali)**
- **Karma Tracking**: Scelte morali accumulate
- **Ending Calculator**: Algoritmo per finale appropriato
- **Narrative Engine**: Presentazione cinematografica

#### **Achievement System (24+ achievement)**
- **Categories**: Combat, Exploration, Survival, Narrative
- **Hooks**: Integration con tutti i sistemi
- **Persistence**: Cross-platform tracking

---

## 🚨 PROBLEMI NOTI E SOLUZIONI

### **ARCHITETTURA COMPLESSA**
**Problema**: 35+ file JavaScript interconnessi
**Soluzione**: Modularità Godot con scene e signals

### **SAVE COMPATIBILITY**
**Problema**: User deve mantenere progress esistenti
**Soluzione**: Import/export tools per save games

### **BACKEND INTEGRATION**
**Problema**: Mantenere API PHP esistente
**Soluzione**: HTTPRequest Godot con fallback

### **UI RETRO RECREATION**
**Problema**: Preservare estetica terminale fosforoso
**Soluzione**: Custom theme + CRT shader effects

---

## 📋 CHECKLIST SESSIONE LLM

### **AD OGNI INIZIO SESSIONE**
- [ ] Leggi `MASTER_PORTING_PLAN.md`
- [ ] Verifica `CURRENT_STATUS.md`
- [ ] Controlla `NEXT_STEPS.md`
- [ ] Review `BLOCKING_ISSUES.md`
- [ ] Update questo file con nuovo timestamp

### **DURANTE LA SESSIONE**
- [ ] Mantieni focus su milestone corrente
- [ ] Documenta ogni decision importante
- [ ] Aggiorna progress nei file status
- [ ] Testa ogni modifica importante

### **FINE SESSIONE**
- [ ] Aggiorna `CURRENT_STATUS.md`
- [ ] Scrivi `NEXT_STEPS.md` per prossima sessione
- [ ] Documenta issues in `BLOCKING_ISSUES.md`
- [ ] Commit changes con message descrittivo

---

## 🎮 GODOT 4.5 FEATURES DA SFRUTTARE

### **Engine Features**
- **AccessKit**: Screen reader support (accessibilità)
- **Abstract Classes**: Architettura modulare GDScript
- **Shader Baker**: Performance optimization
- **WebAssembly SIMD**: Performance web build

### **Development Features**
- **Script Backtracing**: Debug migliorato
- **Inspector Toggles**: UI development
- **Inline Color Pickers**: Development UX
- **FoldableContainer**: UI organization

---

## 💾 DATI CRITICI DEL PROGETTO

### **Source Files Locations**
- **HTML5 Version**: `/index.html` + `/js/` + `/css/`
- **Backend**: `/backend/` (PHP + MySQL)
- **Documentation**: `/doc_e_log/` + root MD files
- **Assets**: `/image/`

### **Key Metrics**
- **Total Code**: ~15,000+ lines
- **Core Files**: 35+ JavaScript modules
- **Database**: 119 oggetti + 18+ nemici
- **UI**: 78KB ui.js (1572 lines)
- **Player Logic**: 86KB player.js (1819 lines)

### **Critical Dependencies**
- **Load Order**: game_constants → game_data → utils → core
- **Module Interactions**: Complex signal-like dependencies
- **Browser APIs**: localStorage, fetch, DOM manipulation

---

## ⚡ QUICK RECOVERY COMMANDS

### **Se devi ricominciare rapidamente**
```bash
# 1. Vai nella cartella porting
cd porting_godot

# 2. Leggi status corrente
cat CURRENT_STATUS.md

# 3. Verifica prossimi step
cat NEXT_STEPS.md

# 4. Controlla blockers
cat BLOCKING_ISSUES.md

# 5. Apri Godot project (se esiste)
# godot project.godot
```

### **File che NON modificare mai**
- `MASTER_PORTING_PLAN.md` (solo per major updates)
- Documenti nella cartella root del progetto originale
- File JavaScript originali (backup purposes)

### **File da aggiornare sempre**
- `CURRENT_STATUS.md`
- `NEXT_STEPS.md`
- `BLOCKING_ISSUES.md`
- Questo file (`ANTI_REGRESSION_MEMORY.md`)

---

## 🔄 WORKFLOW SESSIONS

### **Pattern di Lavoro**
1. **Read** - Consulta documentation
2. **Plan** - Identifica tasks specifici
3. **Code** - Implementa incrementalmente
4. **Test** - Verifica funzionalità
5. **Document** - Aggiorna status
6. **Prepare** - Setup next session

### **Milestone Approach**
- **Small Steps**: Max 1 settimana per milestone
- **Testable**: Ogni step deve essere verificabile
- **Documented**: Progress sempre tracciato
- **Reversible**: Rollback plan per ogni change

---

## 📞 CRITICAL CONTACT POINTS

### **Se hai dubbi su**
- **Architecture**: Consulta `architecture/`
- **Migration**: Consulta `migration_guides/`
- **Testing**: Consulta `testing/`
- **Templates**: Consulta `templates/`

### **Per context recovery rapido**
1. Questo file (ANTI_REGRESSION_MEMORY.md)
2. MASTER_PORTING_PLAN.md
3. CURRENT_STATUS.md
4. NEXT_STEPS.md

---

**🚨 REMEMBER: Aggiorna sempre i file status prima di finire la sessione!**

**📝 NEXT UPDATE**: [AGGIORNARE QUI QUANDO MODIFICHI] 
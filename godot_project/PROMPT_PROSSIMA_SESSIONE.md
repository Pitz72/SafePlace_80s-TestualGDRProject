# 🎮 PROMPT PROSSIMA SESSIONE - SAFEPLACE FASE 3 EVENTI
**Data Prompt**: 7 Gennaio 2025  
**Versione**: v1.3.0 "Event System V2"  
**Fase Attuale**: 🎭 **FASE 3: EVENTI NARRATIVI** - UI Integration

---

## 📖 **CONTESTO PROGETTO SAFEPLACE**

**SafePlace** è un RPG testuale post-apocalittico ambientato negli anni '80, portato da HTML/JS/PHP/MySQL a **Godot 4.5**. Il progetto è al **98% completo** con **6,500+ righe GDScript**, interfaccia terminal autentica anni '80, mappa ASCII 250x250, 144 oggetti, sistema D&D stats, e animazioni CRT.

### **🏆 FASI COMPLETATE**
- **✅ FASE 1 (Lore Upgrade)**: LoreManager.gd + Item lore system completo
- **✅ FASE 2 (Integration)**: UI enhancement + rarity colors + performance
- **🔄 FASE 3 (Eventi Narrativi)**: EventManager CORE implementato, UI Integration NECESSARIA

---

## 🎯 **STATO ATTUALE FASE 3**

### **✅ COMPLETATO**
- **📖 EventManager.gd** (250+ righe): Parser JavaScript per event_database_v2.js (944 righe)
- **🧪 EventSystemTest.gd**: 9 test completi (flags, reputation, quest tracking)
- **📂 Architecture**: 3 categorie eventi (environmental, character, questlines)
- **⚖️ Reputation System**: 5 fazioni (scientists, military, survivors, rebels, traders)
- **🏴 Flag System**: Player progress tracking avanzato
- **📜 Quest Progress**: Multi-step quest chains (Chimera Conspiracy, Father Trail)

### **🚀 DA FARE PROSSIMA SESSIONE**
1. **🎨 Choice Dialog UI Component** → Pannello scelte multiple eventi
2. **📊 Event Display Panel** → Integrazione in MainInterface.gd
3. **⚖️ Reputation Display** → Visualizzazione standing fazioni
4. **🎭 Event Triggering** → Location-based + random encounters
5. **📜 Quest Log Panel** → Progress tracking visivo

---

## 📂 **FILES CHIAVE DA CONOSCERE**

### **🎮 Core System Files**
- `scripts/GameManager.gd` - Controller principale
- `scripts/Player.gd` - Player stats + inventory (6 stats D&D)
- `scripts/MainInterface.gd` - UI 8-panel terminal interface
- `scripts/ItemDatabase.gd` - 144 oggetti + lore integration
- `scripts/LoreManager.gd` - Sistema lore completo (Fase 1)

### **🎭 Event System Files (Fase 3)**
- `scripts/EventManager.gd` - ✅ CORE implementato, API ready
- `scripts/EventSystemTest.gd` - ✅ Test suite completa
- `scenes/EventSystemTestScene.tscn` - ✅ Scena test
- `js/events_v2/event_database_v2.js` - 944 righe eventi da parsare

### **📊 Documentation Files**
- `FASE_3_EVENTS_PROGRESS.md` - Status Fase 3 aggiornato
- `MEMORY_CHECKPOINT_v1.2.1.md` - Stato pre-Fase 3
- `SAFEPLACE_PROJECT_STATUS_FINAL.md` - Overview completo progetto

---

## 🔧 **ARCHITETTURA EVENTMANAGER**

### **🎯 API Principale (PRONTA)**
```gdscript
# EventManager.gd - API CORE
load_event_database() -> bool           # Carica da JavaScript ✅
get_event(event_id) -> Dictionary       # Ottieni evento specifico ✅
can_trigger_event(id, context) -> bool  # Verifica conditions ✅
trigger_event(id, context) -> bool      # Attiva evento ✅
set_flag(flag), has_flag(flag)         # Sistema flags ✅
change_reputation(faction, change)      # Reputation system ✅
set_quest_progress(quest, step)        # Quest tracking ✅
```

### **🎭 Struttura Eventi JavaScript**
```javascript
// event_database_v2.js - PATTERN
"abandoned_laboratory": {
    id: "abandoned_laboratory",
    title: "Laboratorio Abbandonato", 
    category: "environmental",
    tier: 2,
    triggers: { /* conditions */ },
    branches: { /* multiple choices */ }
}
```

---

## 🎨 **NEXT STEP: UI INTEGRATION**

### **1. Choice Dialog Component**
Creare `scripts/EventDialog.gd` + `scenes/EventDialog.tscn`:
- Panel modale con title + description eventi
- Button array per choices multiple
- Integrazione con EventManager signals
- Stile terminal anni '80 (green/amber text)

### **2. MainInterface Integration**  
Aggiungere a `scripts/MainInterface.gd`:
- Event panel nel layout 8-panel esistente
- Display eventi attivi + available events
- Reputation meter per 5 fazioni
- Quest progress indicator

### **3. Event Triggering Logic**
- Location-based events (coordinate mappa)
- Random encounters (probability system)
- Auto-trigger quest progression
- Environmental events (time/weather)

---

## ⚙️ **PATTERN DI SVILUPPO**

### **🏗️ Architettura Seguita**
- **Signals-based communication**: EventManager.event_triggered, choice_made, etc.
- **Dictionary-heavy**: Event data + player context as Dictionary
- **Type-safe enums**: Per categorie + stati
- **Performance-first**: <100ms load times, 60fps maintained

### **📋 Testing Pattern**
- **Test Scene per ogni feature**: EventSystemTestScene.tscn pattern
- **9-step test methodology**: Init → Load → Verify → Stats → API → Results
- **Print debug completo**: Console logs per troubleshooting

### **🎨 UI Style Consistency**
- **Green/Amber terminal colors**: Anni '80 authentic feel
- **8-panel layout preservation**: Non rompere UI esistente
- **CRT effects integration**: Mantenere aesthetic coerente

---

## 🚀 **TASK PRIORITARI PROSSIMA SESSIONE**

### **1. [HIGH] EventDialog Component**
Creare UI component per gestire scelte eventi:
```gdscript
class_name EventDialog extends Control
signal choice_selected(choice_id: String)
func show_event(event_data: Dictionary)
func update_choices(choices: Array)
```

### **2. [HIGH] MainInterface Event Panel**
Integrare eventi in `MainInterface.gd`:
- Panel "EVENTI" nel layout esistente
- Display eventi disponibili + attivi
- Connessione EventManager signals

### **3. [MEDIUM] Reputation Display**
Visualizzazione standing fazioni:
- 5 fazioni con barre colorate
- Real-time updates da EventManager
- Tooltip con effects reputazione

### **4. [MEDIUM] Event Triggers**
Sistema trigger automatici:
- Location-based (coordinate mappa)
- Random probability rolls
- Quest chain progression

---

## 🎯 **OBIETTIVO FINALE FASE 3**

**🎮 Sistema Eventi Narrativi Completo**:
- ✅ EventManager parsing JavaScript  
- 🔄 UI Components per interaction
- 🔄 Event triggering automatico
- 🔄 Reputation + Quest tracking visuale
- 🔄 Integration with existing game loop

**📍 Success Criteria**:
- Player può interagire con eventi tramite UI
- Scelte multiple funzionanti
- Reputation changes visible
- Quest progress tracked
- Performance maintained (60fps)

---

## 💡 **SUGGERIMENTI PER LLM**

1. **🔍 Studia prima** `MainInterface.gd` per capire layout 8-panel esistente
2. **🧪 Testa sempre** con scene dedicate prima di integrare
3. **⚖️ Mantieni performance** - EventManager è già ottimizzato
4. **🎨 Rispetta style** - Terminal verde/amber anni '80
5. **📋 Documenta progress** - Aggiorna FASE_3_EVENTS_PROGRESS.md

**🎭 EventManager Foundation è SOLIDA - Focus su UI Integration!**

---

**🚀 Fase 3 continua: da Core System → User Experience completa!** 
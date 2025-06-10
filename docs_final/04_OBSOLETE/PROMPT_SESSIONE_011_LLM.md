# 🚀 PROMPT SESSIONE #011 LLM - THE SAFE PLACE v1.3.0 GODOT

## 📋 **CONTESTO PROGETTO CORRENTE**

Stai continuando il lavoro su **"The Safe Place v1.3.0"**, un progetto di porting da JavaScript vanilla a Godot 4.5 di un gioco roguelike post-apocalittico. Il progetto è **attualmente al 44.1% di completamento reale** (vs 97% documentato).

### 🎯 **SITUAZIONE ATTUALE CRITICA**

**✅ SUCCESSO SESSIONE #010:**
- **Migration modulare** completata con successo per risolvere problema scalabilità
- **22 eventi** migrati dal sistema monolitico a architettura modulare Cursor-friendly
- **Sistema EventManagerModular** implementato e funzionante
- **5 moduli eventi** creati: EventsPlains.gd (10), EventsForest.gd (4), EventsRiver.gd (2), EventsVillage.gd (4), EventsCity.gd (2)

**❗ PROBLEMA SCOPERTO:**
- Durante verifica finale: il file `safeplace_advanced/js/game_data.js` contiene **molti più eventi** di quelli migrati
- Sembrano esserci **15+ eventi PLAINS**, **12+ eventi FOREST**, **12+ eventi RIVER**, **13+ eventi VILLAGE**, **15+ eventi CITY**
- **Total eventi nel source**: probabilmente 100+ invece dei 22 migrati
- **Gap critico**: Potremmo aver perso 70-80 eventi nella migration

## 🔧 **TASK PRIORITARI SESSIONE #011**

### 🔍 **1. AUDIT COMPLETO EVENTI (URGENTE)**
- Analizzare completamente `safeplace_advanced/js/game_data.js` 
- Contare esatti eventi per categoria (plains_, forest_, river_, village_, city_)
- Identificare eventi mancanti nel nostro sistema modulare
- Creare lista completa gap da colmare

### 📈 **2. EXPANSION MODULARE MASSICCIA**
- Importare tutti gli eventi mancanti nei moduli appropriati
- EventsPlains.gd: da 10 a 15+ eventi
- EventsForest.gd: da 4 a 12+ eventi  
- EventsRiver.gd: da 2 a 12+ eventi
- EventsVillage.gd: da 4 a 13+ eventi
- EventsCity.gd: da 2 a 15+ eventi

### 🆕 **3. NUOVI MODULI SE NECESSARI**
- EventsDesert.gd se ci sono eventi desert_*
- EventsSpecial.gd per eventi unici/easter eggs
- EventsDilemma.gd per eventi morali

## 🔒 **ANTI-REGRESSIONE CRITICA**

### ⛔ **FILES MAI DA TOCCARE:**
```
❌ godot_project/scripts/MainInterface.gd (825 righe) - Layout terminale PERFETTO
❌ godot_project/scripts/ASCIIMapGenerator.gd (659 righe) - Mappa procedurale PERFETTA  
❌ godot_project/scripts/Player.gd (19K) - Framework player STABILE
```

### ⚠️ **FILES UPDATE SOLO RIFERIMENTI:**
```
⚠️ godot_project/scripts/GameManager.gd (623 righe) - Solo riferimenti EventManager
⚠️ godot_project/scenes/Main.tscn - Solo scene references
```

### ✅ **FILES DEVELOPMENT LIBERO:**
```
✅ godot_project/scripts/EventManagerModular.gd - Manager centrale
✅ godot_project/scripts/events/*.gd - Tutti i moduli eventi
✅ godot_project/scripts/CombatManager.gd - Espansioni
✅ godot_project/scripts/ItemDatabase.gd - Espansioni
```

## 📁 **STRUTTURA PROGETTO ATTUALE**

### 🎯 **Sistema Eventi Modulare (IMPLEMENTATO):**
```
godot_project/scripts/
├── EventManagerModular.gd (4KB) - Manager centrale ✅
└── events/
    ├── EventsPlains.gd (16KB) - 10 eventi ✅ [EXPAND TO 15+]
    ├── EventsForest.gd (8KB) - 4 eventi ✅ [EXPAND TO 12+]
    ├── EventsRiver.gd (4KB) - 2 eventi ✅ [EXPAND TO 12+]
    ├── EventsVillage.gd (7KB) - 4 eventi ✅ [EXPAND TO 13+]
    └── EventsCity.gd (4KB) - 2 eventi ✅ [EXPAND TO 15+]
```

### 💾 **Backup Preservato:**
```
📦 scripts/EventManager_MONOLITHIC_BACKUP.gd (52KB) - Sistema originale
```

### 📊 **Source Data Locations:**
```
📖 safeplace_advanced/js/game_data.js (197KB) - EVENTI COMPLETI QUI
📖 safeplace_advanced/js/events.js (59KB) - Logica eventi
📖 safeplace_advanced/js/advanced_items_database.js (25KB) - Items avanzati
```

## 🎯 **WORKFLOW SESSIONE #011**

### **STEP 1: AUDIT EVENTI COMPLETO**
```bash
# Comando di analisi
cd safeplace_advanced/js
grep -c "id: \"plains_" game_data.js
grep -c "id: \"forest_" game_data.js  
grep -c "id: \"river_" game_data.js
grep -c "id: \"village_" game_data.js
grep -c "id: \"city_" game_data.js
```

### **STEP 2: ESTRAZIONE EVENTI MANCANTI**
- Leggere `safeplace_advanced/js/game_data.js` sezioni per sezioni
- Identificare ogni evento con `id: "categoria_nome"`
- Creare lista gap: eventi nel source MA non nel nostro sistema

### **STEP 3: MIGRATION MASSICCIA**
- Aggiornare ogni modulo con eventi mancanti
- Mantenere struttura GDScript identica agli eventi esistenti
- Test compatibilità API dopo ogni modulo

### **STEP 4: VALIDATION COMPLETA**
- Verificare che EventManagerModular carichi tutti i moduli
- Test che eventi appaiano correttamente in-game
- Update documentazione con numeri corretti

## 📋 **TEMPLATE CONVERSIONE EVENTI**

### **Formato JavaScript Source:**
```javascript
{ id: "plains_esempio", title: "Titolo", description: "Descrizione...", 
  choices: [
    { text: "Azione (Skill)", skillRequirement: { skill: 12 }, 
      successReward: { items: [{ itemId: 'item', quantity: 1 }] },
      failureText: "Fallimento..." }
  ]
}
```

### **Formato GDScript Target:**
```gdscript
"plains_esempio": {
    "id": "plains_esempio",
    "name": "Titolo", 
    "type": GameManager.EventType.LOCATION_SPECIFIC,
    "description": "Descrizione...",
    "choices": [{
        "text": "Azione (Skill)", 
        "requirements": {"skill": 12},
        "consequences": {
            "action": "skill_check", "stat": "skill", "difficulty": 12,
            "success": {
                "text": "Successo...", 
                "rewards": {"items": {"item": 1}}
            },
            "failure": {"text": "Fallimento...", "rewards": {}}
        }
    }]
}
```

## 📈 **METRICHE TARGET SESSIONE #011**

- **Eventi totali**: da 22 a 80+ (target 4x increase)
- **Moduli completati**: 5/5 con eventi completi
- **File size**: mantenere sotto 30KB per modulo (Cursor-friendly)
- **API compatibility**: 100% preservata
- **Completamento progetto**: da 44.1% a 47-48%

## 📚 **DOCUMENTAZIONE DA AGGIORNARE**

### **Files da update dopo migration:**
- `SESSIONE_010_EVENTI_IMPORT_PARTE1_LOG.md` - Add risultati audit
- `ROADMAP_SESSIONI_DETTAGLIATA_v1.3.0.md` - Update Sessione #011 status  
- `STATO_PROGETTO_v1.3.0_GODOT.md` - Update numeri eventi
- `TEST_MODULAR_EVENTS.md` - Add validation results

### **Nuovi files da creare:**
- `AUDIT_EVENTI_COMPLETO_v1.3.0.md` - Report completo gap eventi
- `SESSIONE_011_EXPANSION_LOG.md` - Log migration massiccia

## 🎯 **OBIETTIVO FINALE**

Completare la migration di **TUTTI** gli eventi dal sistema JavaScript originale al sistema modulare Godot, raggiungendo una base solida di 80-100+ eventi pronti per ulteriori espansioni nelle sessioni successive.

---

## 🚨 **ALERT FINALE**

**PRIORITÀ ASSOLUTA**: Non toccare mai MainInterface.gd, ASCIIMapGenerator.gd o Player.gd. Il sistema modulare eventi è l'unica area di development attivo. Mantieni sempre compatibility API al 100% con EventManagerModular.

**READY TO CONTINUE SESSIONE #011!** 🚀 
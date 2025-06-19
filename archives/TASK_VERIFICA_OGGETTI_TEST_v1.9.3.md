# TASK VERIFICA OGGETTI TEST - SafePlace v1.9.3

## 🚨 PROBLEMA IDENTIFICATO
**Gli oggetti test armi/armature NON appaiono nell'inventario anche iniziando nuove partite**

## 🔍 ROOT CAUSE ANALYSIS

### Flusso Inizializzazione Attuale
1. **`_init()`** → chiama `_add_test_items_safeplace()` (DEPRECATA, non fa nulla)
2. **`initialize_player()`** → `inventory.clear()` (svuota tutto)
3. **`_add_starting_items()`** → chiama `_add_test_safeplace_objects()`
4. **`_add_test_safeplace_objects()`** → dovrebbe aggiungere 23 oggetti inclusi armi/armature

### Possibili Cause
- ❓ **ItemDatabase non caricato** quando `_add_test_safeplace_objects()` viene chiamata
- ❓ **GameManager non disponibile** durante inizializzazione
- ❓ **Timing issue** - database non pronto quando player si inizializza
- ❓ **Errori silenziosi** in `add_item_to_inventory()` non loggati
- ❓ **Validazione fallisce** per oggetti armi/armature

## 🧪 VERIFICHE DA FARE

### 1. Debug Logging Avanzato
- [ ] Aggiungere print dettagliati in `_add_test_safeplace_objects()`
- [ ] Verificare se `add_item_to_inventory()` restituisce true/false
- [ ] Loggare stato GameManager e ItemDatabase durante init
- [ ] Verificare esistenza oggetti nel database prima di aggiungerli

### 2. Test Timing Inizializzazione
- [ ] Verificare ordine caricamento GameManager vs Player
- [ ] Testare aggiunta oggetti con delay/timer
- [ ] Verificare se `_ready()` vs `_init()` fa differenza

### 3. Validazione Database
- [ ] Confermare che `combat_knife`, `baseball_bat`, `leather_jacket_worn`, `hard_hat`, `repair_kit` esistono in ItemDatabase
- [ ] Testare aggiunta manuale oggetti via console debug
- [ ] Verificare che `get_item()` restituisce oggetti validi

### 4. Test Inventario
- [ ] Verificare che `inventory.size()` aumenta dopo `_add_test_safeplace_objects()`
- [ ] Testare `add_item_to_inventory()` con oggetti semplici (scrap_metal)
- [ ] Verificare limiti inventario (max_inventory_slots = 20)

## 🔧 POSSIBILI FIX

### Fix 1: Timing Delay
```gdscript
func _ready():
    # Aspetta che GameManager sia pronto
    await get_tree().process_frame
    _add_test_safeplace_objects()
```

### Fix 2: Validazione Robusta
```gdscript
func _add_test_safeplace_objects():
    var game_manager = get_node("../../GameManager")
    if not game_manager:
        print("❌ GameManager non trovato!")
        return
    
    var item_db = game_manager.get_item_database()
    if not item_db:
        print("❌ ItemDatabase non disponibile!")
        return
    
    # Test ogni oggetto individualmente
    var test_items = ["combat_knife", "baseball_bat", "leather_jacket_worn"]
    for item_id in test_items:
        var item = item_db.get_item(item_id)
        if item:
            var success = add_item_to_inventory(item_id, 1)
            print("🧪 %s: %s" % [item_id, "✅ OK" if success else "❌ FAIL"])
        else:
            print("❌ Item non trovato nel database: %s" % item_id)
```

### Fix 3: Chiamata Esplicita
```gdscript
func initialize_player():
    # ... existing code ...
    
    # Chiamata esplicita dopo clear
    print("🧪 Chiamata esplicita _add_test_safeplace_objects()...")
    _add_test_safeplace_objects()
    
    print("📦 Inventario finale: %d oggetti" % inventory.size())
```

## 📊 METRICHE SUCCESSO
- ✅ **Inventario nuova partita**: 23+ oggetti (inclusi armi/armature)
- ✅ **Oggetti visibili**: combat_knife, baseball_bat, leather_jacket_worn, hard_hat, repair_kit
- ✅ **Log chiari**: Conferma aggiunta ogni oggetto
- ✅ **Zero errori**: Nessun errore durante inizializzazione

## 🎯 PRIORITÀ
**ALTA** - Blocca testing Point 7 (durabilità armi/armature)

## 📅 DEADLINE
**Prossima sessione** - Fix immediato necessario per continuare roadmap

---
**Creato**: v1.9.3 (2024-12-19)  
**Status**: APERTO  
**Assegnato**: Prossima sessione sviluppo 
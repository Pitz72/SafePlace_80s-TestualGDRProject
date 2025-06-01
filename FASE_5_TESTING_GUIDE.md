# 🧪 GUIDA TESTING EVENT ENGINE V2.0

## 📋 **SETUP RAPIDO**

### **1. Avvia il Browser**
1. Apri il browser su **http://localhost:8000**
2. **Refresh forzato**: Ctrl+F5 (per caricare nuovi script)
3. Apri **DevTools Console** (F12 > Console)

### **2. Verifica Caricamento Automatico**
Il sistema dovrebbe mostrare automaticamente nella console:
```
⚡ [EventEngineValidator] Quick system check...
✅ EventEngineV2Instance
✅ EVENT_DATABASE_V2  
✅ EventDatabaseManager
✅ System Initialized
🎉 Quick check: Event Engine V2.0 operational!
```

---

## 🔍 **TESTING COMMANDS**

### **A. System Status Check**
```javascript
// Verifica status generale
EventEngineV2Instance.getStatus()

// Statistics database
EventDatabaseManager.getStats()

// Quick health check
eventValidator.quickSystemCheck()
```

### **B. Full Validation Suite**
```javascript
// Test completo (2-3 minuti)
eventValidator.runFullValidation()
```

### **C. Event Database Exploration**
```javascript
// Tutti gli eventi disponibili
EventDatabaseManager.getAllEvents()

// Eventi per categoria
EventDatabaseManager.getEventsByCategory('environmental')

// Evento specifico
EventDatabaseManager.getEvent('abandoned_laboratory')
```

### **D. Event Testing**
```javascript
// Abilita debug mode
EventEngineV2Instance.setDebugMode(true)

// Trigger manuale evento
EventEngineV2Instance.triggerEvent('abandoned_laboratory')

// Stato player corrente
EventEngineV2Instance.getCurrentPlayerState()
```

---

## 🎯 **EXPECTED RESULTS**

### **✅ Success Indicators:**
- `EventEngineV2Instance.getStatus().initialized === true`
- `EventDatabaseManager.getStats().totalEvents >= 10`
- Console mostra "🎉 Quick check: Event Engine V2.0 operational!"
- Nessun errore JavaScript nella console

### **❌ Problem Indicators:**
- Errori "undefined" per EventEngineV2Instance
- Script loading errors nella console
- Quick check mostra "⚠️ Issues detected"

---

## 🚀 **NEXT STEPS DOPO VALIDATION**

### **1. Gameplay Testing**
- Start New Game
- Muoviti nella mappa (direzione Est verso Safe Place)
- Verifica che eventi V1 continuino a funzionare
- Cerca trigger di eventi V2.0

### **2. Event Trigger Conditions**
Eventi V2.0 hanno trigger specifici:
- **"Laboratorio Abbandonato"**: Città/Village + Intelligenza 8+
- **"Mercante Misterioso"**: Probability-based nel wasteland
- **"Tempesta Tossica"**: Time-based durante storms

### **3. Debug & Fine-tuning**
- Monitor console per trigger evaluations
- Test relationship tracking
- Validation outcome resolution

---

**Ready to test? Apri il browser e segui i passi!** 🎮 
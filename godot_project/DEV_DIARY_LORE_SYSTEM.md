# 📖 DIARIO DI SVILUPPO - Sistema Lore Events

**Progetto**: SafePlace - RPG Testuale Post-Apocalittico  
**Periodo**: Dicembre 2024  
**Sviluppatore**: AI Assistant + User  

---

## 🏁 **OBIETTIVO FINALE**

Creare un sistema di **10 eventi narrativi lineari** per raccontare il viaggio del protagonista **Ultimo** dal punto di partenza S al Safe Place (punto E), compresso in un gameplay di massimo 4-5 giorni.

---

## 📅 **TIMELINE SVILUPPO**

### **🔴 VERSIONE 1.0 - Priority-Based (ERRATA)**

**Problema Identificato**: Sistema con priority 10→1 invece di sequenza lineare 1→10

**Caratteristiche Sistema Precedente**:
- ❌ Priority invertita (10=massima → 1=minima)
- ❌ Trigger basati su giorni/distanza troppo dilatati
- ❌ Eventi potenzialmente paralleli  
- ❌ Durata eccessiva (fino a giorni illimitati)
- ❌ Ordine non garantito

**Eventi del Sistema Precedente**:
```
Priority 10: "L'Eco della Partenza" (days >= 1)
Priority 9:  "La Prima Prova da Solo" (first_night)  
Priority 8:  "Sussurri dal Passato" (distance <= 150)
Priority 7:  "L'Ombra degli Altri" (days >= 3)
Priority 6:  "Il Dilemma del Viandante" (distance <= 120)
Priority 5:  "Echi della Guerra Inespressa" (days >= 4)
Priority 4:  "Il Sogno della Valle Verde" (distance <= 80)
Priority 3:  "L'Intercettazione Radio" (distance <= 50)
Priority 2:  "Il Guardiano della Soglia" (distance <= 20)
Priority 1:  "La Valle Nascosta" (location == safe_place)
```

**Problemi Rilevati**:
1. **Ordine Logico Invertito**: Priority 10 doveva essere evento 1
2. **Trigger Incoerenti**: Mix di giorni/distanza/condizioni speciali
3. **Timeline Troppo Lunga**: Eventi fino a giorno 4+ per gioco di 4-5 giorni
4. **Non Sequenziale**: Eventi potevano triggerare in parallelo

---

### **🟢 VERSIONE 2.0 - Linear Sequence (CORRETTA)**

**Richiesta Utente**: *"Gli eventi narrativi non devono essere troppo dilatati. Consideriamo che difficile che il gioco duri più di quattro giorni, massimo cinque. Inoltre DEVONO ESSERE in ordine lineare, dall'evento 1 al 10."*

**Soluzione Implementata**:

#### **✅ 1. Priority Corretta (1→10)**
```gdscript
# PRIMA (ERRATO):
priority: 10 → priority: 9 → ... → priority: 1

# DOPO (CORRETTO):  
priority: 1 → priority: 2 → ... → priority: 10
```

#### **✅ 2. Trigger Sequenziale Uniforme**
```gdscript
# PRIMA (ERRATO):
trigger: {"type": "days_survived", "value": 1, "operator": ">="}
trigger: {"type": "distance_from_safe_place", "value": 150, "operator": "<="}
trigger: {"type": "condition", "condition": "first_night_survived"}

# DOPO (CORRETTO):
trigger: {"type": "event_sequence", "event_number": 1}
trigger: {"type": "event_sequence", "event_number": 2}
trigger: {"type": "event_sequence", "event_number": 3}
```

#### **✅ 3. Sistema Sequenza Lineare**
```gdscript
var _current_lore_sequence: int = 1  # Traccia evento corrente

func _check_event_sequence(event_number: int, player_context: Dictionary) -> bool:
    # DEVE essere il prossimo evento nella sequenza
    if event_number != _current_lore_sequence:
        return false
    
    # Timeline compressa 4-5 giorni
    match event_number:
        1: return days >= 1  # Evento 1: Partenza
        2: return days >= 1  # Evento 2: Prima notte  
        3: return days >= 2  # Evento 3: Primi passi
        # ... etc
        10: return days >= 5  # Evento 10: Finale
```

#### **✅ 4. Avanzamento Automatico**
```gdscript
func trigger_lore_event(event_data: Dictionary) -> bool:
    # Quando evento completato, avanza sequenza
    _seen_lore_events.append(event_id)
    _current_lore_sequence += 1  # 🔑 CHIAVE: Avanzamento lineare
    
    print("Evento completato - prossimo: %d" % _current_lore_sequence)
```

#### **✅ 5. Timeline Compressa**
```
PRIMA (ERRATO - TROPPO DILATATO):
Evento 1: Giorno 1+
Evento 4: Giorno 3+  
Evento 6: Giorno 4+
Durata: Potenzialmente infinita

DOPO (CORRETTO - COMPRESSO):
Eventi 1-2: Giorno 1 (partenza + prima notte)
Eventi 3-4: Giorno 2 (primi passi + incontri)
Eventi 5-6: Giorno 3 (prove morali + verità)  
Eventi 7-8: Giorno 4 (sogni + segnali)
Eventi 9-10: Giorno 5 (arrivo + finale)
Durata: Massimo 5 giorni
```

---

## 🔧 **MODIFICHE TECNICHE DETTAGLIATE**

### **File: EventManager.gd**

**Cambiamenti Variabili**:
```gdscript
# AGGIUNTO:
var _current_lore_sequence: int = 1  # Traccia sequenza corrente
```

**Cambiamenti ID Eventi**:
```gdscript
# PRIMA:
"id": "lore_echo_of_departure"

# DOPO:  
"id": "lore_01_echo_of_departure"  # Numerazione chiara
```

**Cambiamenti Titoli**:
```gdscript
# PRIMA:
"title": "L'Eco della Partenza"

# DOPO:
"title": "1. L'Eco della Partenza"  # Numerazione visibile
```

**Cambiamenti Trigger System**:
```gdscript
# RIMOSSO sistema complesso:
func _calculate_distance_from_safe_place()
func _evaluate_condition()  
func _check_special_condition()
func _check_location_condition()

# AGGIUNTO sistema semplice:
func _check_event_sequence(event_number: int, player_context: Dictionary) -> bool
```

**Cambiamenti Algoritmo Controllo**:
```gdscript
# PRIMA - Priority-based con sorting:
var sorted_events = _lore_events.duplicate()
sorted_events.sort_custom(func(a, b): return a.priority > b.priority)
for event in sorted_events:

# DOPO - Linear sequence:
for event in _lore_events:  # Ordine già corretto 1→10
    if event_number != _current_lore_sequence:
        continue  # Skip se non è il prossimo
    if triggered:
        return event
    else:
        break  # STOP - ordine lineare rigoroso
```

---

## 🧪 **TESTING & VALIDAZIONE**

### **Test Case Chiave**:

1. **✅ Sequenza Lineare**: Eventi 1→2→3→...→10 in ordine
2. **✅ Blocco Parallelo**: Solo un evento triggerable per volta
3. **✅ Timeline Compressa**: Max 5 giorni per tutti i 10 eventi
4. **✅ Prerequisiti**: Flags richiesti verificati correttamente
5. **✅ Avanzamento**: `_current_lore_sequence` incrementa dopo ogni evento

### **Comandi Debug Aggiunti**:
```gdscript
EventManager.debug_lore_sequence()  # Mostra stato sequenza
EventManager.get_lore_stats()       # Statistiche complete
```

---

## 📊 **RISULTATI FINALI**

### **✅ OBIETTIVI RAGGIUNTI**:

1. **Ordine Lineare Garantito**: 1→2→3→4→5→6→7→8→9→10
2. **Timeline Compressa**: 4-5 giorni massimo
3. **Sequenza Rigorosa**: Un evento per volta, no paralleli
4. **Meccanica Semplice**: Trigger uniformi `event_sequence`
5. **Manutenibilità**: Codice pulito e documentato

### **🎯 IMPATTO SUL GAMEPLAY**:

- **Narrativa Coerente**: Storia lineare S→E di Ultimo
- **Pacing Corretto**: Eventi ben distribuiti nei 4-5 giorni
- **Esperienza Fluida**: Nessun evento saltato o duplicato
- **Debug Facile**: Sistema trasparente e tracciabile

---

## 📋 **CHECKLIST ANTI-REGRESSIONE**

**Ogni modifica futura DEVE verificare**:

- [ ] Priority 1→10 (mai invertire)
- [ ] `_current_lore_sequence` avanza linearmente  
- [ ] Trigger `event_sequence` uniformi
- [ ] Timeline max 5 giorni rispettata
- [ ] Ordine eventi preservato nell'array
- [ ] Un solo evento triggerable per volta

**Se anche UNA di queste condizioni fallisce = REGRESSIONE**

---

## 🎉 **CONCLUSIONI**

Il sistema lore è stato **completamente ridisegnato** da priority-based a sequence-based per garantire:

1. **Coerenza Narrativa**: Storia lineare del viaggio S→E
2. **Gameplay Ottimale**: Eventi distribuiti in 4-5 giorni  
3. **Manutenibilità**: Codice semplice e chiaro
4. **User Experience**: Progressione fluida e prevedibile

**Status**: ✅ **COMPLETO E VALIDATO** - Ready for S→E progression testing

---

*Diario aggiornato: Dicembre 2024 - Sistema Lore Lineare implementato con successo* 🎭 
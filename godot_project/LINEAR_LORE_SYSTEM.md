# 🎭 SISTEMA LORE LINEARE - SafePlace

**Data**: Dicembre 2024  
**Versione**: 1.0 Lineare  
**Tipo**: Timeline Narrativa Principale  

## 🎯 **OBIETTIVO SISTEMA**

Sistema di **10 eventi narrativi** che raccontano il viaggio di **Ultimo** dal punto S (partenza) al punto E (Safe Place). Gli eventi sono:

- ✅ **ORDINE LINEARE RIGOROSO**: 1→2→3→4→5→6→7→8→9→10
- ✅ **COMPRESSO TEMPORALMENTE**: 4-5 giorni massimo  
- ✅ **SEQUENZIALE**: Un evento per volta, il prossimo si sblocca solo dopo il precedente

---

## 📋 **EVENTI LINEARI (1→10)**

### **🔸 Evento 1: "L'Eco della Partenza"**
- **Trigger**: Giorno 1 (inizio gioco)
- **Contenuto**: Lettera del padre, decisione di partire
- **Scelte**: Partenza frettolosa vs preparazione accurata

### **🔸 Evento 2: "La Prima Prova da Solo"**  
- **Trigger**: Giorno 1 (prima notte)
- **Prerequisiti**: `mission_accepted`
- **Contenuto**: Prima notte da solo, lezioni di sopravvivenza

### **🔸 Evento 3: "Sussurri dal Passato"**
- **Trigger**: Giorno 2
- **Prerequisiti**: `learned_survival`  
- **Contenuto**: Carillon della madre Lena

### **🔸 Evento 4: "L'Ombra degli Altri"**
- **Trigger**: Giorno 2  
- **Prerequisiti**: `has_mothers_memory`
- **Contenuto**: Incontro con "I Corvi", riconoscimento madre

### **🔸 Evento 5: "Il Dilemma del Viandante"**
- **Trigger**: Giorno 3
- **Contenuto**: Famiglia bisognosa, scelta morale cruciale

### **🔸 Evento 6: "Echi della Guerra Inespressa"**
- **Trigger**: Giorno 3
- **Contenuto**: Documenti Progetto Chimera, verità sul padre

### **🔸 Evento 7: "Il Sogno della Valle Verde"**
- **Trigger**: Giorno 4  
- **Contenuto**: Visione profetica del Safe Place

### **🔸 Evento 8: "L'Intercettazione Radio"**
- **Trigger**: Giorno 4
- **Prerequisiti**: `knows_truth`
- **Contenuto**: Trasmissione militare, coordinate confermate

### **🔸 Evento 9: "Il Guardiano della Soglia"**
- **Trigger**: Giorno 5
- **Prerequisiti**: `has_coordinates`  
- **Contenuto**: Verifica genetica, accesso al Safe Place

### **🔸 Evento 10: "La Valle Nascosta"**
- **Trigger**: Giorno 5
- **Prerequisiti**: `guardian_met`
- **Contenuto**: Riunione con il padre, finale del gioco

---

## ⚙️ **MECCANICA TECNICA**

### **Variabili Chiave**:
```gdscript
var _current_lore_sequence: int = 1  # Evento corrente
var _seen_lore_events: Array[String] = []  # Eventi completati  
var _lore_flags: Array[String] = []  # Flags delle scelte
```

### **Trigger Sistema**:
- **Tipo**: `"event_sequence"`
- **Controllo**: `event_number == _current_lore_sequence`
- **Avanzamento**: `_current_lore_sequence += 1` dopo completamento

### **Tempistica Compressa**:
```gdscript
# Eventi distribuiti in 4-5 giorni massimo
1-2: Giorno 1 (partenza + prima notte)
3-4: Giorno 2 (primi passi + incontri) 
5-6: Giorno 3 (prove morali + verità)
7-8: Giorno 4 (sogni + segnali)
9-10: Giorno 5 (arrivo + finale)
```

---

## 🔧 **API PRINCIPALI**

### **Controllo Eventi**:
```gdscript
EventManager.check_lore_event_triggers(player_context) -> Dictionary
```

### **Trigger Evento**:
```gdscript  
EventManager.trigger_lore_event(event_data) -> bool
```

### **Applicazione Effetti**:
```gdscript
EventManager.apply_lore_choice_effects(effects)
```

### **Statistiche**:
```gdscript
EventManager.get_lore_stats() -> Dictionary
EventManager.debug_lore_sequence()
```

---

## 🚨 **ANTI-REGRESSIONE**

### **⚠️ ERRORI DA EVITARE**:

1. **❌ Mai Priority Invertita**: Sempre 1→10, mai 10→1
2. **❌ Mai Trigger Paralleli**: Un evento per volta
3. **❌ Mai Durata Eccessiva**: Massimo 5 giorni  
4. **❌ Mai Ordine Casuale**: Sequenza lineare rigida
5. **❌ Mai Flag Mancanti**: Verificare sempre prerequisiti

### **✅ CONTROLLI OBBLIGATORI**:

- `_current_lore_sequence` avanza solo dopo completamento
- `event_number == _current_lore_sequence` per trigger  
- Flags prerequisiti verificati prima del trigger
- Timeline compressa rispettata (giorni 1-5)

---

## 📊 **TESTING**

### **Comandi Debug**:
```gdscript
# Test sequenza
EventManager.debug_lore_sequence()

# Stats complete
print(EventManager.get_lore_stats())
```

### **Validazione Sistema**:
- [ ] Evento 1 triggera al giorno 1
- [ ] Sequenza 1→10 rispettata  
- [ ] Nessun evento parallelo
- [ ] Flags prerequisiti funzionanti
- [ ] Timeline 4-5 giorni rispettata

---

## 🎮 **UTILIZZO GIOCATORE**

Il giocatore:
1. **Gioca normalmente** il survival game
2. **Gli eventi si triggerano automaticamente** in sequenza  
3. **Fa le scelte** che influenzano la narrativa
4. **Prosegue linearmente** 1→10 senza possibilità di saltare

**Risultato**: Esperienza narrativa **coerente e progressiva** del viaggio S→E di Ultimo verso il Safe Place.

---

*Sistema validato e funzionante - Ready for S→E testing* ✅ 
# 🚨 PROTOCOLLO ANTI-REGRESSIONE - Sistema Lore Lineare

**Data Creazione**: Dicembre 2024  
**Versione Protetta**: 2.0 Linear Sequence  
**Livello Criticità**: 🔴 **MASSIMA**  

---

## ⚠️ **AVVISO REGRESSIONE**

**QUESTO SISTEMA È STATO CORRETTO DA UNA VERSIONE ERRATA**

- ❌ **Versione 1.0**: Priority-based (10→1) - **ERRORE SISTEMICO**  
- ✅ **Versione 2.0**: Linear sequence (1→10) - **VERSIONE CORRETTA**

**OGNI MODIFICA CHE RIPRISTINA COMPORTAMENTI DELLA VERSIONE 1.0 È UNA REGRESSIONE CRITICA**

---

## 🔒 **VINCOLI INVIOLABILI**

### **1. 🎯 ORDINE SEQUENZIALE (CRITICO)**

```gdscript
# ✅ CORRETTO - Mai modificare questo ordine:
Evento 1: "1. L'Eco della Partenza" (priority: 1)
Evento 2: "2. La Prima Prova da Solo" (priority: 2)  
Evento 3: "3. Sussurri dal Passato" (priority: 3)
Evento 4: "4. L'Ombra degli Altri" (priority: 4)
Evento 5: "5. Il Dilemma del Viandante" (priority: 5)
Evento 6: "6. Echi della Guerra Inespressa" (priority: 6)
Evento 7: "7. Il Sogno della Valle Verde" (priority: 7)
Evento 8: "8. L'Intercettazione Radio" (priority: 8)
Evento 9: "9. Il Guardiano della Soglia" (priority: 9)
Evento 10: "10. La Valle Nascosta" (priority: 10)

# ❌ REGRESSIONE - Se vedi priority invertita:
# priority: 10, 9, 8, 7, 6, 5, 4, 3, 2, 1 = ERRORE!
```

### **2. 🔄 TRIGGER UNIFORME (CRITICO)**

```gdscript
# ✅ CORRETTO - Trigger SEMPRE dello stesso tipo:
"trigger": {"type": "event_sequence", "event_number": 1}
"trigger": {"type": "event_sequence", "event_number": 2}
"trigger": {"type": "event_sequence", "event_number": 3}
# ...etc per tutti i 10 eventi

# ❌ REGRESSIONE - Se vedi trigger misti:
# "days_survived", "distance_from_safe_place", "condition" = ERRORE!
```

### **3. ⏱️ TIMELINE COMPRESSA (CRITICO)**

```gdscript
# ✅ CORRETTO - Timeline max 5 giorni:
match event_number:
    1: return days >= 1  # Giorno 1
    2: return days >= 1  # Giorno 1
    3: return days >= 2  # Giorno 2
    4: return days >= 2  # Giorno 2
    5: return days >= 3  # Giorno 3
    6: return days >= 3  # Giorno 3
    7: return days >= 4  # Giorno 4
    8: return days >= 4  # Giorno 4
    9: return days >= 5  # Giorno 5
    10: return days >= 5 # Giorno 5

# ❌ REGRESSIONE - Se vedi giorni eccessivi:
# days >= 10, days >= 7, durata infinita = ERRORE!
```

### **4. 🔢 SEQUENZA CONTROLLER (CRITICO)**

```gdscript
# ✅ CORRETTO - Variabile sequenza deve esistere:
var _current_lore_sequence: int = 1

# ✅ CORRETTO - Controllo sequenza rigoroso:
if event_number != _current_lore_sequence:
    return false

# ✅ CORRETTO - Avanzamento dopo completamento:
_current_lore_sequence += 1

# ❌ REGRESSIONE - Se mancano questi controlli = ERRORE!
```

---

## 🛡️ **FUNZIONI PROTETTE**

### **NON MODIFICARE MAI QUESTE FUNZIONI SENZA REVIEW:**

#### **`load_lore_events()`**
- **Protezione**: Ordine array eventi 1→10
- **Controllo**: 10 eventi esatti, priority crescente
- **Allarme**: Se array disordinato o priority invertita

#### **`_check_event_sequence()`**  
- **Protezione**: Controllo sequenza rigoroso
- **Controllo**: `event_number == _current_lore_sequence`
- **Allarme**: Se permette eventi paralleli

#### **`check_lore_event_triggers()`**
- **Protezione**: Loop sequenziale con break
- **Controllo**: Stop dopo primo evento non triggerable
- **Allarme**: Se rimuovi il `break` (permette paralleli)

#### **`trigger_lore_event()`**
- **Protezione**: Avanzamento sequenza automatico
- **Controllo**: `_current_lore_sequence += 1`
- **Allarme**: Se rimuovi incremento sequenza

---

## 🔍 **CHECKLIST ANTI-REGRESSIONE**

### **✅ CONTROLLI OBBLIGATORI PRIMA DI OGNI COMMIT:**

```bash
# 1. ORDINE PRIORITY
grep -n '"priority":' EventManager.gd
# DEVE mostrare: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10

# 2. TRIGGER UNIFORMI  
grep -n '"type": "event_sequence"' EventManager.gd
# DEVE mostrare: 10 occorrenze identiche

# 3. TIMELINE COMPRESSA
grep -n 'days >= [0-9]' EventManager.gd  
# DEVE mostrare: solo valori 1-5

# 4. VARIABILE SEQUENZA
grep -n '_current_lore_sequence' EventManager.gd
# DEVE esistere e essere usata nei controlli
```

### **🚨 ALLARMI AUTOMATICI:**

**Se uno di questi pattern viene rilevato = REGRESSIONE:**

```bash
# ❌ PATTERN REGRESSIONE:
grep "priority.*10.*9.*8" EventManager.gd  # Priority invertita
grep "days_survived.*operator" EventManager.gd  # Trigger vecchi
grep "distance_from_safe_place" EventManager.gd  # Sistema distanza
grep "days >= [6-9]" EventManager.gd  # Timeline troppo lunga
```

---

## 🔧 **PROCEDURE DI RECOVERY**

### **Se Rilevi una Regressione:**

#### **1. 🛑 STOP IMMEDIATO**
- Non procedere con altre modifiche
- Documenta la regressione rilevata
- Identifica il commit che ha causato il problema

#### **2. 🔄 RIPRISTINO RAPIDO**
```bash
# Ripristina EventManager.gd dalla versione lineare
git checkout HEAD~1 -- scripts/EventManager.gd
```

#### **3. ✅ VERIFICA CORREZIONE**
```bash
# Esegui tutti i controlli anti-regressione
grep -n '"priority":' EventManager.gd | head -10
# Verifica sequenza 1→10
```

#### **4. 📝 DOCUMENTAZIONE**
- Aggiorna questo documento se necessario
- Documenta la causa della regressione
- Implementa controlli aggiuntivi se richiesto

---

## 🎮 **TEST DI VALIDAZIONE**

### **Test Suite Minima - Eseguire sempre:**

```gdscript
# 1. Test ordine eventi
func test_event_order():
    var events = EventManager._lore_events
    for i in range(events.size()):
        assert(events[i].priority == i + 1)

# 2. Test sequenza lineare
func test_linear_sequence():
    # Simula trigger eventi in ordine
    for i in range(1, 11):
        var context = {"days_survived": i}
        var event = EventManager.check_lore_event_triggers(context)
        assert(event.get("priority", 0) == EventManager._current_lore_sequence)

# 3. Test timeline compressa
func test_compressed_timeline():
    var max_days = 0
    for event in EventManager._lore_events:
        var days = _extract_days_from_trigger(event.trigger)
        max_days = max(max_days, days)
    assert(max_days <= 5)
```

---

## 🏆 **RESPONSABILITÀ**

### **Chi può modificare il sistema lore:**
- ✅ **Senior Developer** con review obbligatoria
- ✅ **Lead Programmer** con backup pre-modifica  
- ✅ **AI Assistant** solo con conferma user

### **Chi NON può modificare senza autorizzazione:**
- ❌ Junior developer (richiede supervisione)
- ❌ Contributor esterni (PR review multipla)
- ❌ Automated script (backup manuale richiesto)

---

## 📊 **METRICHE SALUTE SISTEMA**

### **Indicatori Verdi (Sistema Sano):**
- 🟢 Priority: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10
- 🟢 Trigger: 10x "event_sequence" uniformi
- 🟢 Timeline: Max 5 giorni
- 🟢 Sequenza: Incremento lineare +1
- 🟢 Test: Tutti i test passano

### **Indicatori Rossi (Regressione Rilevata):**
- 🔴 Priority: Qualsiasi ordine diverso da 1→10
- 🔴 Trigger: Mix di tipi diversi
- 🔴 Timeline: Giorni > 5
- 🔴 Sequenza: Salti o decremente  
- 🔴 Test: Anche solo uno fallisce

---

## 📞 **CONTATTI EMERGENZA**

**In caso di regressione critica che blocca il gameplay:**

1. **Stop Development** - Blocca tutte le modifiche al sistema lore
2. **Alert Team** - Notifica immediata a tutti i developer  
3. **Quick Recovery** - Usa procedure di ripristino documentate
4. **Root Cause Analysis** - Identifica e correggi la causa
5. **Update Protocol** - Migliora questo documento se necessario

---

## 🎯 **CONCLUSIONE**

**QUESTO PROTOCOLLO ESISTE PERCHÉ IL SISTEMA È STATO GIÀ ROTTO UNA VOLTA**

La versione 1.0 priority-based era **fondamentalmente errata** e ha richiesto una **riscrittura completa**. 

**Non permettere che la storia si ripeta. Il sistema lore lineare 1→10 è SACRO.**

---

*Protocollo creato per proteggere l'integrità del sistema narrativo di SafePlace* 🛡️

**Status Protezione**: 🔴 **ATTIVO** - Monitoring continuo richiesto 
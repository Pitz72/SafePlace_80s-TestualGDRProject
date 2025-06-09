# 🎭 SISTEMA EVENTI LORE - SafePlace

## Implementazione Completata degli Eventi Narrativi di Ultimo

### 📋 OVERVIEW

Il sistema eventi lore permette di vivere la **timeline narrativa di 10 eventi** nel viaggio di Ultimo verso il Safe Place. Gli eventi si triggerano automaticamente basandosi su:

- **Giorni sopravvissuti**
- **Distanza dal Safe Place** (coordinate 190,190)
- **Prerequisiti narrativi** (flags lore)
- **Condizioni speciali** (prima notte, localizzazioni)

---

## 🎯 I 10 EVENTI NARRATIVI

### 1. **L'Eco della Partenza** (Priority: 10)
- **Trigger**: `days_survived >= 1`
- **Contenuto**: Lettera del padre Marcus, inizio missione
- **Scelte**: Partenza rapida VS preparazione accurata

### 2. **La Prima Prova da Solo** (Priority: 9)
- **Trigger**: `first_night_survived` + flag `mission_accepted`
- **Contenuto**: Prima notte da solo, apprendimento sopravvivenza
- **Scelte**: Imparare dai propri errori VS rimpiangere il passato

### 3. **Sussurri dal Passato** (Priority: 8)
- **Trigger**: `distance <= 150` + flag `learned_survival`
- **Contenuto**: Ritrovamento carillon di mamma Lena
- **Scelte**: Conservare il ricordo prezioso

### 4. **L'Ombra degli Altri** (Priority: 7)
- **Trigger**: `days_survived >= 3` + flag `has_mothers_memory`
- **Contenuto**: Incontro con i Corvi, riconoscimento per Lena
- **Scelte**: Chiedere del passato VS fuggire

### 5. **Il Dilemma del Viandante** (Priority: 6)
- **Trigger**: `distance <= 120`
- **Contenuto**: Famiglia bisognosa, scelta morale
- **Scelte**: Aiutare VS sopravvivere da solo

### 6. **Echi della Guerra Inespressa** (Priority: 5)
- **Trigger**: `days_survived >= 4`
- **Contenuto**: Scoperta Progetto Chimera, verità sulla guerra
- **Scelte**: Studiare la verità terrificante

### 7. **Il Sogno della Valle Verde** (Priority: 4)
- **Trigger**: `distance <= 80`
- **Contenuto**: Visione profetica del Safe Place durante febbre
- **Scelte**: Trovare forza nella speranza

### 8. **L'Intercettazione Radio** (Priority: 3)
- **Trigger**: `distance <= 50` + flag `knows_truth`
- **Contenuto**: Radio militare con coordinate Safe Place
- **Scelte**: Memorizzare le coordinate

### 9. **Il Guardiano della Soglia** (Priority: 2)
- **Trigger**: `distance <= 20` + flag `has_coordinates`
- **Contenuto**: Controllo genetico, riconoscimento come figlio di Marcus
- **Scelte**: Chiedere notizie del padre

### 10. **La Valle Nascosta** (Priority: 1)
- **Trigger**: `location == "safe_place"` + flag `guardian_met`
- **Contenuto**: Arrivo al Safe Place, riunione con il padre
- **Scelte**: Abbraccio finale, nuovo inizio

---

## ⚙️ ARCHITETTURA TECNICA

### **EventManager** (scripts/EventManager.gd)
- Carica i 10 eventi hardcoded in memoria
- Sistema trigger basato su priorità decrescente
- Gestione flags lore per prerequisiti
- Calcolo distanza euclidea dal Safe Place (190,190)

### **EventDialog** (scenes/EventDialog.tscn + scripts/EventDialog.gd)
- UI modale stile terminale anni '80
- Visualizzazione titolo, descrizione narrativa
- Bottoni dinamici per scelte multiple
- Sistema outcome con feedback visivo

### **GameManager** (scripts/GameManager.gd)
- Coordinamento centrale del sistema
- Tracking giorni sopravvissuti
- Creazione dinamica EventDialog
- Check automatici durante movimento

### **MainInterface** (scripts/MainInterface.gd)
- Integrazione nel gameplay principale
- Check eventi lore dopo ogni movimento
- Hotkey T per testing manuale
- Logging eventi nel diario di viaggio

---

## 🧪 TESTING DEL SISTEMA

### **Testing Automatico**
```gdscript
# Nel gioco, premere T per triggerare il primo evento
# Verifica che funzioni:
# 1. Dialog appare correttamente
# 2. Testo formattato con colori
# 3. Scelte interattive
# 4. Outcome viene mostrato
# 5. Log entry aggiunta
```

### **Testing Manuale**
```gdscript
# Nel GameManager:
force_trigger_lore_event("lore_echo_of_departure")
advance_day() # Incrementa giorni per triggering automatico
check_lore_events() # Check manuale trigger
```

### **Script di Test Completo**
- `scripts/LoreEventTest.gd` - Test completo di tutti i componenti
- Hotkey 1/2/3 per trigger eventi specifici
- Verifica caricamento, trigger, e visualizzazione

---

## 🎮 ESPERIENZA GIOCATORE

### **Trigger Automatici**
Gli eventi si attivano **automaticamente** quando:
- Il player si muove (check dopo ogni movimento)
- I giorni avanzano (chiamata a `advance_day()`)
- Le condizioni vengono soddisfatte

### **Progressione Narrativa**
- **Eventi ordinati per priorità** (10 → 1)
- **Prerequisiti narrativi** impediscono salti nella storia
- **Distanza dal Safe Place** come misura di progresso
- **Scelte permanenti** che influenzano eventi futuri

### **Integrazione UI**
- **Dialog modale** non blocca completamente il gioco
- **Stato EVENT** temporaneo durante eventi
- **Log automatico** di eventi e scelte nel diario
- **Stile terminale** coerente con il tema anni '80

---

## 🔧 CONFIGURAZIONE

### **Coordinate Safe Place**
```gdscript
const SAFE_PLACE_X = 190
const SAFE_PLACE_Y = 190
```

### **Hotkeys**
- **T**: Trigger manuale primo evento (testing)
- **Movimento**: Check automatico eventi dopo spostamento

### **Flags Sistema**
Il sistema usa flags lore interni per tracciare:
- `mission_accepted` - Missione iniziata
- `learned_survival` - Imparato sopravvivenza  
- `has_mothers_memory` - Trovato carillon
- `knows_truth` - Scoperta verità Progetto Chimera
- `has_coordinates` - Ottenute coordinate
- `guardian_met` - Incontrato guardiano

---

## 🚀 PROSSIMI PASSI

1. **Test Completo**: Giocare e verificare sequenza eventi
2. **Sistema Tempo**: Integrare giorni/notti reali
3. **Posizione Player**: Collegare coordinate reali movimento
4. **Effetti Scelte**: Implementare conseguenze a lungo termine
5. **Save/Load**: Persistenza stato eventi tra sessioni

---

## 📝 NOTE IMPLEMENTAZIONE

- **Sistema hardcoded** per massima affidabilità
- **Trigger indipendenti** da eventi casuali esistenti  
- **UI non invasiva** che preserva esperienza terminale
- **Modularità** per future espansioni narrative
- **Performance ottimale** con check rapidi

Il sistema è **pronto per il testing** e l'integrazione nel gameplay principale di SafePlace! 🎮✨ 
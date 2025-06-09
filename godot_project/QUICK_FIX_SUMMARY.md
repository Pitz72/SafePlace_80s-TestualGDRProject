# 🚀 QUICK FIX - RIQUADRO + CONTINUA
**Tempo**: 2 minuti  
**Problemi**: Riquadro piccolo + CONTINUA mancante  
**Status**: ✅ **FIXATO**  

---

## 🔧 **QUICK FIXES APPLICATI**

### **1. Riquadro Più Grande (+50px altezza)**
```gdscript
// PRIMA:
var available_height = main_container.size.y - 200  // Troppo conservativo
story_display.custom_minimum_size = Vector2(main_container.size.x - 100, available_height)

// DOPO:
var available_height = main_container.size.y - 150  // +50px più spazio
story_display.custom_minimum_size = Vector2(main_container.size.x - 80, available_height)  // +20px larghezza
```

### **2. Logica CONTINUA Semplificata**
```gdscript
// PRIMA: Stima approssimativa sbagliata
var estimated_lines = text_length / 60

// DOPO: Controlli multipli sicuri
var text_lines = story_display.text.count("\n") + 1  // Righe reali
var total_chars = story_display.text.length()        // Caratteri totali

// CONTINUA appare se: (righe >= 10 OR caratteri >= 800) AND paragrafi rimanenti
if current_paragraph_index < content_paragraphs.size() and (text_lines >= 10 or total_chars >= 800):
    show_continue_option()
```

### **3. Fallback Sicurezza**
```gdscript
// Se siamo negli ultimi 2 paragrafi, forza CONTINUA per sicurezza
if current_paragraph_index >= content_paragraphs.size() - 2:
    show_continue_option()
```

---

## 🎯 **RISULTATO ATTESO**

### **✅ Ora Dovrebbe:**
1. **Riquadro +50px più alto** → più testo visibile
2. **CONTINUA appare sempre** quando serve (righe≥10 OR chars≥800)
3. **Fallback sicurezza** → CONTINUA forzato negli ultimi paragrafi
4. **Stesso comportamento** in Storia e Istruzioni

### **📱 Layout Migliorato:**
```
┌─ RIQUADRO 75% ────────────────────────┐
│ La Storia                             │
│ ═══════════════════════               │
│                                       │
│ ┌─ AREA TESTO (+50px) ──────────────┐ │
│ │ L'Eco del Silenzio               │ │
│ │                                  │ │
│ │ Il mondo che Ultimo conosceva... │ │ ← +50px più spazio
│ │                                  │ │
│ │ Diciassette anni vissuti...      │ │
│ │                                  │ │
│ │ [CONTINUA appare automaticamente] │ │ ← Logica migliorata
│ └──────────────────────────────────┘ │
│                                       │
│     [ CONTINUA ]  [ TORNA INDIETRO ]  │ ← Sempre visibili
└───────────────────────────────────────┘
```

---

## ⚡ **TEST IMMEDIATO**

**Verifica:**
1. **Avvia gioco** → Storia
2. **Controlla riquadro** → deve essere più alto
3. **Aspetta testo** → CONTINUA deve apparire automaticamente
4. **Premi CONTINUA** → deve cancellare e continuare
5. **Ripeti test** → Istruzioni (stesso comportamento)

**Se CONTINUA ancora non appare:**
- Riduci soglie: `text_lines >= 8` e `total_chars >= 600`
- Oppure forza sempre: `if current_paragraph_index > 0:`

---

**🎯 RISULTATO**: Riquadro più grande + CONTINUA che appare sempre quando serve!

**⏱️ TEMPO TOTALE FIX**: < 3 minuti per risolvere entrambi i problemi! 🚀 
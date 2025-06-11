# 🛡️ ANTI-REGRESSIONE SafePlace v1.4.3

## 🎯 Documento di Protezione contro Regressioni

Questo documento traccia **tutti i problemi risolti** durante l'implementazione del sistema temi e come **prevenire il loro ripetersi**.

---

## 🚨 PROBLEMI CRITICI RISOLTI

### ❌ **PROBLEMA 1: Colori Hardcoded**
**Sintomo**: Colori fissi nel codice non cambiano con i temi
**Causa**: Uso di costanti COLOR_* invece di funzioni dinamiche
**Soluzione**: ✅ Sostituiti con getter functions del ThemeManager

**PREVENZIONE**:
```gdscript
# ❌ MAI più fare così:
label.modulate = Color("#4EA162")  

# ✅ SEMPRE fare così:
label.modulate = ThemeManager.get_primary()
```

### ❌ **PROBLEMA 2: Font UTF-8 Broken**
**Sintomo**: Caratteri accentati (à, è, ò) non visualizzati
**Causa**: Perfect DOS VGA 437 senza subpixel positioning
**Soluzione**: ✅ Aggiunto `subpixel_positioning = TextServer.SUBPIXEL_POSITIONING_AUTO`

**PREVENZIONE**:
```gdscript
# ✅ Setup font UTF-8 corretto:
func _apply_perfect_dos_font():
    var font = load("res://themes/fonts/Perfect DOS VGA 437.ttf")
    font.subpixel_positioning = TextServer.SUBPIXEL_POSITIONING_AUTO
    add_theme_font_override("font", font)
```

### ❌ **PROBLEMA 3: Hover Button Illeggibili**
**Sintomo**: Button hover con testo verde su sfondo verde
**Causa**: Stesso colore per testo e sfondo
**Soluzione**: ✅ Effetto "negativo" - sfondo chiaro, testo scuro

**PREVENZIONE**:
```gdscript
# ✅ Hover effect corretto:
func _on_button_mouse_entered():
    modulate = get_background_color()  # Sfondo chiaro
    add_theme_color_override("font_color", get_primary_color())  # Testo scuro
```

### ❌ **PROBLEMA 4: Menu Non Applica Tema**
**Sintomo**: Menu resta con colori vecchi quando cambia tema
**Causa**: Mancanza connessione al segnale theme_changed
**Soluzione**: ✅ Connessione automatica ai segnali ThemeManager

**PREVENZIONE**:
```gdscript
# ✅ Sempre connettere ai segnali tema:
func _ready():
    var theme_manager = get_node("/root/ThemeManager")
    theme_manager.theme_changed.connect(_on_theme_changed_signal)
```

### ❌ **PROBLEMA 5: Errori Compilazione Costanti**
**Sintomo**: "Identifier not declared" per COLOR_*, PRIMARY_GREEN, etc.
**Causa**: Rimozione costanti hardcoded senza sostituire i riferimenti
**Soluzione**: ✅ Sostituiti con funzioni get_*_color()

**PREVENZIONE**:
```gdscript
# ❌ Non usare più:
COLOR_PRIMARY, SECONDARY_GREEN, etc.

# ✅ Usare sempre:
get_primary_color(), get_secondary_color(), etc.
```

---

## 🛠️ PROBLEMI TECNICI RISOLTI

### ❌ **PROBLEMA 6: NOTIFICATION_RESIZED Non Esiste**
**Sintomo**: "Identifier 'NOTIFICATION_RESIZED' not declared"
**Causa**: Costante non disponibile in Godot 4.5
**Soluzione**: ✅ Usato PRESET_FULL_RECT per ridimensionamento automatico

**PREVENZIONE**:
```gdscript
# ❌ Non usare in Godot 4.x:
if what == NOTIFICATION_RESIZED:

# ✅ Usare ridimensionamento automatico:
control.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
```

### ❌ **PROBLEMA 7: Shader Bool Syntax Error**
**Sintomo**: "hint_default(true) not valid"
**Causa**: Sintassi non supportata in Godot 4.5
**Soluzione**: ✅ `uniform bool enable_effect = true;`

**PREVENZIONE**:
```glsl
// ❌ Non supportato:
uniform bool enable_effect : hint_default(true) = true;

// ✅ Sintassi corretta:
uniform bool enable_effect = true;
```

### ❌ **PROBLEMA 8: CRT Schermo Bianco**
**Sintomo**: Effetto CRT mostra solo schermo bianco
**Causa**: Uso di TEXTURE invece di SCREEN_TEXTURE per post-processing
**Soluzione**: ✅ Cambiato a SCREEN_TEXTURE/SCREEN_UV

**PREVENZIONE**:
```glsl
// ❌ Per effetti screen-space:
texture(TEXTURE, UV)

// ✅ Per post-processing:
texture(SCREEN_TEXTURE, SCREEN_UV)
```

### ❌ **PROBLEMA 9: ThemeManager API Access**
**Sintomo**: "current_theme not declared"
**Causa**: Accesso a proprietà inesistente nel ThemeManager
**Soluzione**: ✅ Usato `get_current_theme_type()` API corretta

**PREVENZIONE**:
```gdscript
# ❌ Non esiste:
theme_manager.current_theme

# ✅ API corretta:
theme_manager.get_current_theme_type()
```

---

## 🔧 CHECKLIST SVILUPPO FUTURO

### **Prima di Modificare Temi**:
- [ ] Tutti i colori usano getter functions del ThemeManager?
- [ ] Font UTF-8 configurato con subpixel_positioning?
- [ ] Connessioni ai segnali theme_changed attive?
- [ ] Hover effects implementati correttamente?

### **Prima di Modificare CRT**:
- [ ] Shader usa SCREEN_TEXTURE per post-processing?
- [ ] Bool uniforms senza hint_default?
- [ ] CanvasLayer configurato con layer prioritario?
- [ ] ColorRect trasparente per screen-space?

### **Prima di Release**:
- [ ] Test cambio tema in tutte le scene
- [ ] Caratteri accentati visualizzati correttamente  
- [ ] Effetto CRT funziona senza errori console
- [ ] Performance 60fps mantenute
- [ ] Nessun hardcoded color nel codebase

---

## 📋 FILE DA NON MODIFICARE MAI

### **File Core Sistema** (Modificare solo se necessario):
- `scripts/ThemeManager.gd` - Core sistema temi
- `scripts/CRTEffectController.gd` - Controller CRT  
- `shaders/CRTEffect.gdshader` - Shader post-processing
- `project.godot` - Autoload configuration

### **Modifiche Safe**:
- Aggiungere nuovi temi in ThemeManager
- Aggiungere nuovi presets CRT
- Estendere API getter functions
- Aggiungere nuove scene con temi

---

## 🚀 BEST PRACTICES

### **Naming Convention**:
```gdscript
# Funzioni colore: get_[color]_color()
get_primary_color()
get_background_color()
get_error_color()

# Temi enum: ThemeType.[NOME]
ThemeType.DEFAULT
ThemeType.CRT_GREEN
ThemeType.HIGH_CONTRAST
```

### **Signal Connection Pattern**:
```gdscript
func _ready():
    call_deferred("_connect_theme_signals")

func _connect_theme_signals():
    var theme_manager = get_node_or_null("/root/ThemeManager")
    if theme_manager and not theme_manager.theme_changed.is_connected(_on_theme_changed):
        theme_manager.theme_changed.connect(_on_theme_changed)
```

### **Color Usage Pattern**:
```gdscript
# ✅ Sempre via ThemeManager:
var color = ThemeManager.get_primary()

# ✅ Mai hardcode diretto:
# var color = Color("#4EA162")  # NO!
```

---

## 🎯 VERSIONE TRACKING

**v1.4.3 STABLE**:
- ✅ Sistema temi completo e testato
- ✅ Tutti i problemi documentati risolti
- ✅ Anti-regressione implementato
- ✅ Performance verificate
- ✅ Compatibilità Godot 4.5+ garantita

**PROSSIMI SVILUPPI**:
- Nuovi temi custom
- Effetti CRT avanzati
- Ottimizzazioni performance
- Supporto mobile

---

**🛡️ Mantieni questo documento aggiornato per proteggere il lavoro svolto! 🛡️** 
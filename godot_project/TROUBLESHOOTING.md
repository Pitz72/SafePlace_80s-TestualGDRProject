# 🔧 TROUBLESHOOTING RAPIDO - SafePlace Temi v1.4.3

## 🚨 PROBLEMI COMUNI E SOLUZIONI IMMEDIATE

### 🖥️ **PROBLEMA: CRT non si attiva**
**Sintomi**: Tema CRT selezionato ma nessun effetto visivo
**Soluzioni**:
```gdscript
# 1. Verifica autoload
print(get_node_or_null("/root/CRTEffect"))  # Deve restituire un oggetto

# 2. Forza attivazione manuale
get_node("/root/CRTEffect").set_effect_enabled(true)

# 3. Controlla tema corrente
print(get_node("/root/ThemeManager").get_current_theme_type())  # Deve essere 1 (CRT_GREEN)
```

### 🎨 **PROBLEMA: Temi non cambiano**
**Sintomi**: Selezione tema non ha effetto visivo
**Soluzioni**:
```gdscript
# 1. Verifica ThemeManager
var tm = get_node("/root/ThemeManager")
print("ThemeManager attivo: ", tm != null)

# 2. Forza cambio tema
tm.set_theme(tm.ThemeType.CRT_GREEN)

# 3. Verifica segnali connessi
# Controllare che _on_theme_changed sia connesso nelle scene
```

### 📝 **PROBLEMA: Font UTF-8 mancanti**
**Sintomi**: Caratteri àèìòù non visualizzati
**Soluzioni**:
```gdscript
# 1. Applica font corretto
func fix_utf8_font():
    var font = load("res://themes/fonts/Perfect DOS VGA 437.ttf")
    font.subpixel_positioning = TextServer.SUBPIXEL_POSITIONING_AUTO
    add_theme_font_override("font", font)

# 2. Verifica caricamento font
print(load("res://themes/fonts/Perfect DOS VGA 437.ttf") != null)
```

### 🔴 **PROBLEMA: Errori shader CRT**
**Sintomi**: Console error relativi a shader
**Soluzioni**:
```gdscript
# 1. Ricarica shader
var shader = load("res://shaders/CRTEffect.gdshader")
print("Shader caricato: ", shader != null)

# 2. Ricrea materiale
var crt_controller = get_node("/root/CRTEffect")
crt_controller._setup_crt_system()  # Se metodo pubblico

# 3. Restart Godot se persistente
```

---

## ⚡ **FIX RAPIDI**

### **Reset Sistema Temi**:
```gdscript
# In console Godot o script temporaneo
func reset_theme_system():
    var tm = get_node("/root/ThemeManager")
    tm.set_theme(tm.ThemeType.DEFAULT)
    tm.save_theme_settings()
    print("✅ Sistema temi resettato")
```

### **Forza CRT Off**:
```gdscript
# Se CRT causa problemi
func emergency_crt_off():
    var crt = get_node_or_null("/root/CRTEffect")
    if crt:
        crt.set_effect_enabled(false)
        print("✅ CRT disattivato")
```

### **Debug Info Rapido**:
```gdscript
# Informazioni sistema corrente
func debug_themes():
    var tm = get_node("/root/ThemeManager")
    var crt = get_node("/root/CRTEffect")
    print("=== DEBUG TEMI ===")
    print("ThemeManager: ", tm != null)
    print("CRTEffect: ", crt != null)
    if tm:
        print("Tema corrente: ", tm.ThemeType.keys()[tm.get_current_theme_type()])
    if crt and crt.crt_material:
        print("CRT attivo: ", crt.crt_material.get_shader_parameter("enable_effect"))
    print("==================")
```

---

## 🔄 **RECOVERY PROCEDURES**

### **Se il gioco non si avvia**:
1. Rimuovi temporaneamente dal `project.godot`:
   ```
   CRTEffect="*res://scripts/CRTEffectController.gd"
   ```
2. Avvia gioco per verificare ThemeManager
3. Rimetti CRTEffect dopo verifica

### **Se i colori sono tutti sbagliati**:
1. Elimina file: `user://theme_settings.cfg`
2. Riavvia gioco (caricherà DEFAULT)
3. Reconfigura temi dalle impostazioni

### **Se CRT causa crash**:
1. Rinomina temporaneamente: `CRTEffect.gdshader` → `CRTEffect.gdshader.bak`
2. Avvia gioco senza shader CRT
3. Debug problema specifico shader

---

## 📋 **CHECKLIST VERIFICA RAPIDA**

### **Autoload OK?**:
- [ ] ThemeManager presente in project.godot
- [ ] CRTEffect presente in project.godot
- [ ] Nessun errore console all'avvio

### **File Essenziali OK?**:
- [ ] `scripts/ThemeManager.gd` esiste e carica
- [ ] `scripts/CRTEffectController.gd` esiste e carica
- [ ] `shaders/CRTEffect.gdshader` esiste senza errori
- [ ] `themes/fonts/Perfect DOS VGA 437.ttf` carica

### **Funzionalità Base OK?**:
- [ ] Menu → Impostazioni → Temi accessibile
- [ ] Cambio tema DEFAULT/CRT/HIGH_CONTRAST funziona
- [ ] Font visualizza caratteri accentati
- [ ] Performance rimangono 60fps

---

## 🎯 **CONTATTI DEBUG**

### **File da controllare per errori**:
1. **Console Godot** - Errori runtime
2. **Output** - Warning e info system
3. **Debugger** - Stack trace se crash
4. **Remote Inspector** - Stato nodi in runtime

### **Comandi debug utili**:
```bash
# Se accessibile via terminale
godot --verbose project.godot  # Debug output completo
godot --debug project.godot    # Modalità debug
```

### **Scene test disponibili**:
- `res://scenes/CRTTestScene.tscn` - Test interattivo CRT
- Carica per verificare tutti i parametri in real-time

---

## 🆘 **EMERGENCY RESET**

Se tutto va male, **reset completo**:

1. **Backup**: Copia `scripts/` e `scenes/` originali
2. **Reset config**: Elimina `user://theme_settings.cfg`  
3. **Reset project**: Commenta autoload CRTEffect in `project.godot`
4. **Verifica base**: Avvia solo con ThemeManager
5. **Reintegra**: Aggiungi componenti uno alla volta

---

**🔧 Tieni sempre questo documento a portata di mano per troubleshooting veloce! 🔧** 
# 📺 Sistema Effetto CRT - SafePlace Theme System v1.4.3

## 🎯 Panoramica

Il sistema CRT di SafePlace fornisce un effetto autentico di terminale anni '80 con fosfori verdi che si attiva automaticamente quando viene selezionato il tema "CRT Fosfori Verdi".

## 🔧 Componenti Sistema

### 1. **CRTEffect.gdshader**
Shader fragment che simula l'aspetto visivo di un CRT autentico:
- **Scanlines animate**: Linee orizzontali che scorrono per simulare il refresh del monitor
- **Curvatura dello schermo**: Distorsione barrel che ricrea la forma bombata dei CRT
- **Aberrazione cromatica**: Separazione RGB per autenticità visiva
- **Phosphor glow**: Effetto fosforoso verde tipico dei terminali
- **Vignetting**: Oscuramento ai bordi dello schermo
- **Rumore dinamico**: Grain procedurale per imperfezioni realistiche
- **Flicker sottile**: Tremolii occasionali per autenticità

### 2. **CRTEffectController.gd**
Controller principale che gestisce l'effetto:
- **Integrazione automatica** con ThemeManager
- **Presets multipli** per diverse esperienze CRT
- **Animazioni fluide** per accensione/spegnimento
- **API completa** per controllo programmatico

### 3. **CRTTestScene.tscn + CRTTestController.gd**
Scena di test per sviluppatori:
- **UI interattiva** per testare parametri in tempo reale
- **Presets predefiniti** facilmente selezionabili
- **Controlli sliders** per fine-tuning

## 🚀 Utilizzo

### Attivazione Automatica
```gdscript
# L'effetto si attiva automaticamente quando si seleziona il tema CRT
var theme_manager = get_node("/root/ThemeManager")
theme_manager.set_theme("CRT")  # Effetto CRT attivato automaticamente
```

### Controllo Manuale
```gdscript
# Accesso al controller CRT (autoload)
var crt_effect = get_node("/root/CRTEffect")

# Attiva/disattiva effetto
crt_effect.set_effect_enabled(true)

# Applica preset
crt_effect.apply_preset("SafePlace_CRT")

# Animazione smooth verso preset
crt_effect.animate_to_preset("Retro_TV_80s", 1.0)

# Toggle rapido
crt_effect.toggle_effect()
```

### Presets Disponibili

#### **SafePlace_CRT** (Default)
Ottimizzato per il tema SafePlace:
- Scanlines moderate (0.7)
- Curvatura sottile (0.15)
- Forte tinta verde fosforoso (1.8)
- Bilanciato per leggibilità del testo

#### **Retro_TV_80s**
Esperienza TV vintage anni '80:
- Scanlines intense (0.9)
- Curvatura accentuata (0.25)
- Rumore elevato per autenticità
- Flicker più visibile

#### **Arcade_Monitor**
Monitor arcade professionale:
- Scanlines più fini (0.6)
- Curvatura minima (0.1)
- Colori saturi e brillanti
- Effetti ridotti per gaming

#### **Modern_CRT**
CRT di alta qualità moderno:
- Effetti sottili e raffinati
- Scanlines fini (0.4)
- Minima distorsione
- Ottimizzato per uso prolungato

## ⚙️ Parametri Configurabili

### Scanlines
- `scanline_intensity` (0.0-1.0): Intensità delle linee orizzontali
- `scanline_speed` (0.0-5.0): Velocità di animazione
- `scanline_count` (100-800): Densità delle linee

### Curvatura
- `curvature_x` (0.0-1.0): Curvatura orizzontale
- `curvature_y` (0.0-1.0): Curvatura verticale
- `barrel_distortion` (0.0-0.5): Distorsione barrel

### Colore e Glow
- `chromatic_aberration` (0.0-0.02): Separazione colori RGB
- `phosphor_glow` (0.0-2.0): Intensità bagliore fosforoso
- `green_tint` (0.0-2.0): Tinta verde caratteristica

### Display
- `brightness` (0.0-2.0): Luminosità generale
- `contrast` (0.0-3.0): Contrasto dell'immagine
- `vignette_intensity` (0.0-1.0): Oscuramento bordi

### Effetti Dinamici
- `noise_intensity` (0.0-0.2): Intensità rumore
- `flicker_intensity` (0.0-0.1): Intensità tremolii

## 🧪 Testing e Debug

### Scena di Test
Per testare l'effetto CRT durante lo sviluppo:

```gdscript
# Carica la scena di test
get_tree().change_scene_to_file("res://scenes/CRTTestScene.tscn")
```

**Controlli Test Scene:**
- `F1`: Toggle pannello controlli
- `ESC`: Torna al menu principale
- **Sliders**: Regolazione parametri in tempo reale
- **Preset Buttons**: Test rapido configurazioni

### API Debug
```gdscript
var crt_effect = get_node("/root/CRTEffect")

# Stampa impostazioni correnti
crt_effect.print_current_settings()

# Lista presets disponibili
var presets = crt_effect.get_available_presets()
print("Presets: ", presets)

# Reset ai valori default
crt_effect.reset_to_default()
```

## 🎨 Integrazione con Temi

Il sistema CRT è completamente integrato con ThemeManager:

```gdscript
# Si attiva automaticamente con tema CRT
signal theme_changed(theme_name: String)

# Eventi gestiti automaticamente:
# - Attivazione quando tema = "CRT"
# - Disattivazione per altri temi
# - Animazioni di transizione fluide
```

## 🚀 Performance

### Ottimizzazioni Implementate
- **Shader ottimizzato** per 60fps su hardware modesto
- **Controllo enable_effect** per disabilitazione istantanea
- **Calcoli efficienti** per effetti real-time
- **Memory management** appropriato per materiali

### Raccomandazioni
- L'effetto è ottimizzato per 1080p
- Su hardware più vecchio, considerare preset "Modern_CRT"
- I parametri possono essere ridotti per migliorare le performance

## 🔄 Estensibilità

### Aggiungere Nuovi Presets
```gdscript
# In CRTEffectController.gd
presets["Mio_Preset"] = {
    "scanline_intensity": 0.5,
    "curvature_x": 0.1,
    # ... altri parametri
}
```

### Creare Animazioni Custom
```gdscript
# Animazione personalizzata
var tween = create_tween()
tween.tween_method(
    func(value): crt_effect.phosphor_glow = value,
    1.0, 2.0, 2.0
)
```

## 🐛 Troubleshooting

### Effetto Non Visibile
- Verificare che il tema sia impostato su "CRT"
- Controllare che `enable_effect` sia true
- Verificare la presenza del file shader

### Performance Issues
- Ridurre `scanline_count`
- Diminuire `noise_intensity`
- Utilizzare preset "Modern_CRT"

### Shader Errors
- Verificare versione Godot 4.5+
- Controllare che il file .gdshader sia correttamente importato
- Riavviare l'editor se necessario

## 📝 Changelog

### v1.4.3
- ✅ Implementazione completa effetto CRT
- ✅ Integrazione automatica con ThemeManager
- ✅ 4 presets predefiniti ottimizzati
- ✅ Scena di test interattiva
- ✅ API completa per controllo programmatico
- ✅ Animazioni fluide di attivazione/disattivazione
- ✅ Ottimizzazioni performance per hardware modesto

---

**🎮 Buon sviluppo con SafePlace CRT Effect! 📺** 
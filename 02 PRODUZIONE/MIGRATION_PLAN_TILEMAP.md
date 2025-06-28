# 🗺️ MIGRATION PLAN - RichTextLabel to TileMap

**Progetto:** The Safe Place - GDR Testuale Anni 80  
**Task:** M1.T1 - Migrazione Sistema Visualizzazione Mappa  
**Data:** 2025-01-21  
**Versione Target:** v0.0.6-tilemap  

---

## 🎯 **OBIETTIVO MIGRAZIONE**

**PROBLEMA ATTUALE:**
- RichTextLabel con 62.500 tag BBCode (250x250 mappa)
- Performance non scalabile per mappe grandi
- Approccio non standard per world rendering

**SOLUZIONE TARGET:**
- TileMap standard Godot per world rendering
- Performance ottimizzata per mappe grandi
- Architettura scalabile e professionale

---

## 📋 **PIANO DI LAVORO**

### **FASE 1: Creazione TileSet ASCII**

#### **1.1 Setup Base TileSet**
- **File:** `res://tilesets/ascii_tileset.tres`
- **Approccio:** Atlas Source per ogni tipo terreno
- **Caratteri supportati:** `.`, `F`, `M`, `C`, `V`, `~`, `S`, `E`

#### **1.2 Creazione Texture Atlas**
**Specifiche tecniche:**
- **Dimensione tile:** 16x16 pixel
- **Font:** Perfect DOS VGA 437 (già disponibile)
- **Palette colori:** Tema anni 80 esistente
- **Format:** PNG per compatibilità

**Mapping caratteri → colori:**
```
'.' = Terreno normale (grigio scuro)
'F' = Foresta (verde scuro)  
'M' = Montagna (grigio chiaro)
'C' = Città (giallo)
'V' = Villaggio (arancione)
'~' = Acqua (blu)
'S' = Start (verde brillante)
'E' = Exit (rosso)
```

#### **1.3 Configurazione Atlas Source**
Per ogni carattere:
1. Creare texture 16x16
2. Aggiungere come Atlas Source
3. Configurare ID univoco
4. Impostare collision se necessario (montagne)

---

### **FASE 2: Rifattorizzazione Scena**

#### **2.1 Nuova Struttura World.tscn**
```
World (Node2D)                    # Root scene
├── AsciiTileMap (TileMap)        # Mappa mondo
├── PlayerCharacter (Label)       # Player "@" verde
└── Camera2D                      # Camera che segue player
```

#### **2.2 Configurazione Nodi**

**AsciiTileMap (TileMap):**
- Assegnare `ascii_tileset.tres`
- Layer 0: Terreno base
- Tile size: 16x16 pixel

**PlayerCharacter (Label):**
- Text: "@"
- Font: Perfect DOS VGA 437
- Color: Verde brillante (#00FF40)
- Size: 16x16 per allineamento tile

**Camera2D:**
- Enabled: true
- Smooth seguimento player
- Zoom appropriato per visibilità

---

### **FASE 3: Rifattorizzazione Script**

#### **3.1 World.gd - Nuova Architettura**
```gdscript
extends Node2D  # Torna a Node2D per world
class_name World

# Referenze nodi
@onready var ascii_tilemap: TileMap = $AsciiTileMap
@onready var player_character: Label = $PlayerCharacter  
@onready var camera: Camera2D = $Camera2D

# Dati mappa
var map_data: Array[String] = []
var map_width: int = 250
var map_height: int = 250

# Posizione player (in coordinate tile)
var player_tile_x: int = 0
var player_tile_y: int = 0

# Mapping caratteri → tile ID
var char_to_tile: Dictionary = {
    '.': 0,  # Terreno
    'F': 1,  # Foresta  
    'M': 2,  # Montagna
    'C': 3,  # Città
    'V': 4,  # Villaggio
    '~': 5,  # Acqua
    'S': 6,  # Start
    'E': 7   # Exit
}
```

#### **3.2 Funzioni Chiave**

**_load_map():**
```gdscript
func _load_map():
    """Carica mappa ASCII e popola TileMap"""
    var file = FileAccess.open("res://mappa_ascii_gdr.txt", FileAccess.READ)
    if file == null:
        print("[World] ❌ Errore caricamento mappa!")
        return
    
    map_data.clear()
    var row = 0
    
    while not file.eof_reached():
        var line = file.get_line()
        if line.length() == 0:
            continue
            
        map_data.append(line)
        
        # Popola TileMap riga per riga
        for col in range(line.length()):
            var char = line[col]
            var tile_id = char_to_tile.get(char, 0)  # Default terreno
            
            # Imposta tile nella TileMap
            ascii_tilemap.set_cell(0, Vector2i(col, row), 0, Vector2i(tile_id, 0))
            
            # Trova posizione start
            if char == 'S':
                player_tile_x = col
                player_tile_y = row
        
        row += 1
    
    file.close()
    print("[World] ✅ Mappa caricata: " + str(row) + " righe")
    
    # Posiziona player
    _update_player_position()
```

**_update_player_position():**
```gdscript
func _update_player_position():
    """Aggiorna posizione visuale player"""
    var world_pos = ascii_tilemap.map_to_local(Vector2i(player_tile_x, player_tile_y))
    player_character.position = world_pos
    
    # Camera segue player
    camera.position = world_pos
    
    print("[World] 🚶 Player a tile (" + str(player_tile_x) + ", " + str(player_tile_y) + ")")
```

**_input(event) - Movimento:**
```gdscript
func _input(event):
    """Gestisce movimento player"""
    if not event is InputEventKey or not event.pressed:
        return
    
    var new_x = player_tile_x
    var new_y = player_tile_y
    
    match event.keycode:
        KEY_UP, KEY_W:
            new_y -= 1
        KEY_DOWN, KEY_S:
            new_y += 1
        KEY_LEFT, KEY_A:
            new_x -= 1
        KEY_RIGHT, KEY_D:
            new_x += 1
        _:
            return
    
    # Valida movimento
    if _is_valid_move(new_x, new_y):
        player_tile_x = new_x
        player_tile_y = new_y
        _update_player_position()

func _is_valid_move(x: int, y: int) -> bool:
    """Valida movimento - montagne bloccano"""
    if x < 0 or x >= map_width or y < 0 or y >= map_height:
        return false
    
    # Controlla tipo tile
    var tile_data = ascii_tilemap.get_cell_source_id(0, Vector2i(x, y))
    var char = _get_char_at_position(x, y)
    
    # Montagne 'M' bloccano movimento
    return char != 'M'

func _get_char_at_position(x: int, y: int) -> String:
    """Ottiene carattere mappa a posizione specifica"""
    if y >= map_data.size():
        return '.'
    var line = map_data[y]
    if x >= line.length():
        return '.'
    return line[x]
```

---

### **FASE 4: Creazione Asset Texture**

#### **4.1 Script Generazione Automatica**
Creare script helper per generare texture tiles:

```gdscript
# scripts/tools/TileTextureGenerator.gd
extends Node

func generate_ascii_tiles():
    """Genera texture 16x16 per ogni carattere ASCII"""
    var chars = ['.', 'F', 'M', 'C', 'V', '~', 'S', 'E']
    var colors = {
        '.': Color.GRAY,
        'F': Color.DARK_GREEN,
        'M': Color.LIGHT_GRAY,
        'C': Color.YELLOW,
        'V': Color.ORANGE,
        '~': Color.BLUE,
        'S': Color.GREEN,
        'E': Color.RED
    }
    
    for char in chars:
        var image = Image.create(16, 16, false, Image.FORMAT_RGBA8)
        image.fill(Color.BLACK)  # Sfondo nero
        
        # TODO: Renderizza carattere con font Perfect DOS VGA
        # Salva come PNG in res://textures/tiles/
```

#### **4.2 Texture Manual Creation**
Se generazione automatica complessa:
1. Creare manualmente 8 file PNG 16x16
2. Carattere centrato su sfondo nero
3. Colori secondo palette anni 80

---

### **FASE 5: Testing e Validazione**

#### **5.1 Test Performance**
- Caricamento mappa 250x250: < 1 secondo
- Movimento player: 60+ FPS costanti
- Memory usage: < 100MB

#### **5.2 Test Funzionalità**
- ✅ Caricamento mappa completa
- ✅ Movimento player fluido
- ✅ Collision detection montagne
- ✅ Camera seguimento smooth
- ✅ Visual feedback immediato

#### **5.3 Test Anti-Regressione**
- Tutti i test M0.T1-T3 ancora superati
- Nuovo test M1.T1.1: TileMap rendering
- Performance benchmarks documentati

---

## 📊 **VANTAGGI ATTESI**

### **Performance:**
- **Memory:** Da ~2MB BBCode a ~50KB tiles
- **Rendering:** Hardware-accelerated TileMap
- **Scalabilità:** Supporto mappe 1000x1000+

### **Architettura:**
- **Standard Godot:** Approccio professionale
- **Modulare:** Facile aggiungere nuovi tile types
- **Estendibile:** Animation, layers, collision built-in

### **Sviluppo:**
- **Debug:** Visual tile inspector
- **Level design:** Editor integrato Godot
- **Team:** Workflow standard industria

---

## ⚠️ **RISCHI E MITIGAZIONI**

### **Rischio 1: Perdita Estetica ASCII**
**Mitigazione:** Font Perfect DOS VGA per texture tiles

### **Rischio 2: Complexity Overhead**
**Mitigazione:** Approccio incrementale, fallback disponibile

### **Rischio 3: Regressioni**
**Mitigazione:** Test anti-regressione completi

---

## 📋 **CHECKLIST IMPLEMENTAZIONE**

### **Preparazione:**
- [ ] Backup scena/script correnti
- [ ] Setup cartella textures/tiles/
- [ ] Documentazione piano completa

### **Fase 1 - TileSet:**
- [ ] Creare ascii_tileset.tres
- [ ] Generare/creare texture 8 tiles
- [ ] Configurare Atlas Sources
- [ ] Test tile rendering isolato

### **Fase 2 - Scena:**
- [ ] Rifattorizzare World.tscn
- [ ] Configurare TileMap node
- [ ] Setup PlayerCharacter Label
- [ ] Configurare Camera2D

### **Fase 3 - Script:**
- [ ] Rifattorizzare World.gd
- [ ] Implementare _load_map()
- [ ] Implementare movimento player
- [ ] Test caricamento mappa completa

### **Fase 4 - Testing:**
- [ ] Test performance 250x250
- [ ] Test movimento e collision
- [ ] Test camera seguimento
- [ ] Validazione anti-regressione

### **Fase 5 - Documentazione:**
- [ ] Aggiornare dev logs
- [ ] Aggiornare anti-regression tests
- [ ] Documentare nuova architettura

---

## 🎯 **SUCCESS CRITERIA**

**MILESTONE COMPLETATA SE:**
- ✅ Mappa 250x250 caricata in < 1 secondo
- ✅ Player movement fluido 60+ FPS
- ✅ Collision detection funzionante
- ✅ Estetica ASCII mantenuta
- ✅ Zero regressioni su M0.T1-T3
- ✅ Architettura scalabile implementata

---

**READY TO START IMPLEMENTATION** 🚀

*Piano creato: 2025-01-21 - Migrazione TileMap strategica* 
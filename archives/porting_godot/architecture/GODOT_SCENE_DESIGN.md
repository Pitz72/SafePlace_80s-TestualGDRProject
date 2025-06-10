# 🏗️ GODOT SCENE ARCHITECTURE DESIGN
## Struttura Scene e Nodi per The Safe Place

**Created**: 3 Giugno 2025  
**Version**: v1.0 - Initial Design  
**Target**: Godot 4.5 dev 5  

---

## 🎯 DESIGN PRINCIPLES

### **Modularità**
- Ogni sistema JavaScript → Scene Godot dedicata
- Comunicazione tramite signals, non dipendenze dirette
- Resource sharing tramite autoload systems

### **Scalabilità**
- Scene riusabili e componibili
- Sistema plugin per future espansioni
- Performance optimization per mobile

### **Maintainability**
- Naming conventions consistenti
- Clear separation of concerns
- Documentation per ogni scene

---

## 🌳 SCENE HIERARCHY PRINCIPALE

### **Main.tscn** (Root Scene)
```
Main (Node)
├── UI (CanvasLayer)
│   ├── GameUI (Control)
│   ├── MainMenu (Control)
│   ├── SettingsMenu (Control)
│   └── LoadingScreen (Control)
├── World (Node2D)
│   ├── Map (Node2D)
│   ├── Player (CharacterBody2D)
│   └── Environment (Node2D)
├── Systems (Node)
│   ├── EventManager (Node)
│   ├── CombatSystem (Node)
│   ├── SaveSystem (Node)
│   └── AchievementSystem (Node)
└── Services (Node)
    ├── APIClient (HTTPRequest)
    ├── AudioManager (AudioStreamPlayer)
    └── InputManager (Node)
```

---

## 📱 UI SYSTEM ARCHITECTURE

### **GameUI.tscn** (Interfaccia Principale)
```
GameUI (Control) [Full Rect]
├── RetroBackground (ColorRect) [CRT Effect]
├── MainPanel (VBoxContainer)
│   ├── HeaderPanel (HBoxContainer)
│   │   ├── LocationLabel (RichTextLabel)
│   │   ├── TimeLabel (Label)
│   │   └── StatusIcons (HBoxContainer)
│   ├── ContentPanel (HSplitContainer)
│   │   ├── LeftPanel (VBoxContainer)
│   │   │   ├── StatsPanel (Panel)
│   │   │   ├── InventoryPanel (Panel)
│   │   │   └── ActionsPanel (Panel)
│   │   └── RightPanel (VBoxContainer)
│   │       ├── MapPanel (Panel)
│   │       └── MessageLog (Panel)
│   └── FooterPanel (HBoxContainer)
│       ├── CommandInput (LineEdit)
│       └── HelpButton (Button)
├── EventOverlay (ColorRect) [Semi-transparent]
│   └── EventPopup (Panel)
│       ├── EventTitle (Label)
│       ├── EventContent (RichTextLabel)
│       └── ChoicesContainer (VBoxContainer)
└── InventoryOverlay (ColorRect)
    └── InventoryPopup (Panel)
        ├── ItemGrid (GridContainer)
        ├── ItemDetails (Panel)
        └── ActionButtons (HBoxContainer)
```

### **UI Themes e Styling**
```gd
# RetroTheme.tres - Resource per estetica retro
class_name RetroTheme
extends Theme

# Colori fosforici
var phosphor_green = Color("#00FF00")
var phosphor_amber = Color("#FFB000")
var dark_bg = Color("#000000")
var dark_panel = Color("#001100")

# Font monospace per terminale
var terminal_font: Font

# Shader CRT effects
var crt_shader: Shader
```

---

## 🌍 WORLD SYSTEM ARCHITECTURE

### **Map.tscn** (Sistema Mappa)
```
Map (Node2D)
├── MapData (Node) [Script: MapManager.gd]
├── TerrainLayer (TileMap)
├── LocationLayer (Node2D)
│   ├── Shelter_001 (Area2D)
│   ├── Village_001 (Area2D)
│   └── City_001 (Area2D)
├── InteractionLayer (Node2D)
│   ├── EventTriggers (Node2D)
│   └── LootSpawns (Node2D)
└── UILayer (CanvasLayer)
    ├── MapCursor (Control)
    ├── LocationTooltip (Panel)
    └── MapOverlay (Control)
```

### **Player.tscn** (Gestione Giocatore)
```
Player (CharacterBody2D)
├── PlayerStats (Node) [Script: PlayerStats.gd]
├── Inventory (Node) [Script: Inventory.gd]
├── Equipment (Node) [Script: Equipment.gd]
├── Progression (Node) [Script: Progression.gd]
└── KarmaTracker (Node) [Script: KarmaTracker.gd]
```

---

## ⚔️ COMBAT SYSTEM ARCHITECTURE

### **CombatSystem.tscn**
```
CombatSystem (Node)
├── CombatManager (Node) [Script: CombatManager.gd]
├── CombatUI (CanvasLayer)
│   ├── CombatHUD (Control)
│   ├── ActionButtons (HBoxContainer)
│   └── ResultDisplay (Panel)
├── EffectsManager (Node2D)
│   ├── VisualEffects (Node2D)
│   └── AudioEffects (AudioStreamPlayer2D)
└── CombatData (Node) [Resource management]
```

### **Combat Entities**
```gd
# CombatEntity.gd - Base class per combattenti
class_name CombatEntity
extends Resource

@export var stats: CombatStats
@export var abilities: Array[CombatAbility]
@export var equipment: Array[Item]

# D&D Combat System
func calculate_attack_bonus() -> int:
    return stats.strength_modifier + equipment_bonus
    
func roll_d20() -> int:
    return randi() % 20 + 1
```

---

## 📊 DATA LAYER ARCHITECTURE

### **Resource System**
```
resources/
├── data/
│   ├── ItemDatabase.tres (119 items)
│   ├── EnemyDatabase.tres (18+ enemies)
│   ├── EventDatabase.tres (narratives)
│   └── AchievementDatabase.tres (24+ achievements)
├── player/
│   ├── PlayerStats.tres
│   ├── SaveGame.tres
│   └── GameSettings.tres
└── ui/
    ├── RetroTheme.tres
    ├── CRTShader.tres
    └── UIAnimations.tres
```

### **Database Resources**
```gd
# ItemDatabase.gd
class_name ItemDatabase
extends Resource

@export var items: Dictionary = {}

func get_item(item_id: String) -> Item:
    return items.get(item_id)
    
func get_items_by_category(category: String) -> Array[Item]:
    return items.values().filter(func(item): return item.category == category)
```

---

## 🔊 SIGNAL ARCHITECTURE

### **Global Signals (Autoload)**
```gd
# GameSignals.gd - Autoload per comunicazione globale
extends Node

# Player signals
signal player_stats_changed(stat_name: String, new_value: int)
signal player_health_changed(hp: int, max_hp: int)
signal player_moved(new_position: Vector2i)

# Inventory signals
signal item_added(item: Item)
signal item_removed(item: Item)
signal item_used(item: Item)

# Event signals
signal event_triggered(event: GameEvent)
signal event_choice_made(event: GameEvent, choice: EventChoice)
signal event_completed(event: GameEvent, outcome: EventOutcome)

# Combat signals
signal combat_started(enemy: Enemy)
signal combat_ended(result: CombatResult)
signal damage_dealt(attacker: CombatEntity, target: CombatEntity, damage: int)

# UI signals
signal ui_state_changed(new_state: UIState)
signal message_added(text: String, type: MessageType)
signal achievement_unlocked(achievement: Achievement)
```

### **System Communication Pattern**
```
User Input → InputManager → GameSignals → Systems → GameSignals → UI Update
```

---

## 💾 SAVE SYSTEM ARCHITECTURE

### **SaveGame.tscn**
```
SaveGame (Node)
├── SaveManager (Node) [Script: SaveManager.gd]
├── DataValidator (Node) [Script: DataValidator.gd]
└── MigrationTool (Node) [Script: HTML5Migrator.gd]
```

### **Save Data Structure**
```gd
# SaveGame.gd
class_name SaveGame
extends Resource

@export var version: String = "1.0.0"
@export var player_data: PlayerData
@export var world_data: WorldData
@export var progress_data: ProgressData
@export var settings_data: SettingsData
@export var timestamp: int

# HTML5 compatibility
func import_from_html5(json_data: String) -> bool:
    # Parse localStorage data from HTML5 version
    pass
    
func export_to_html5() -> String:
    # Export in HTML5 compatible format
    pass
```

---

## 🎨 RETRO THEME SYSTEM

### **CRT Effects Shader**
```glsl
// CRTEffect.gdshader
shader_type canvas_item;

uniform float scan_line_strength : hint_range(0.0, 1.0) = 0.3;
uniform float phosphor_glow : hint_range(0.0, 2.0) = 1.2;
uniform vec3 phosphor_color : source_color = vec3(0.0, 1.0, 0.0);

void fragment() {
    vec2 uv = SCREEN_UV;
    
    // Scan lines effect
    float scan_line = sin(uv.y * 800.0) * scan_line_strength;
    
    // Phosphor glow
    vec3 glow = phosphor_color * phosphor_glow;
    
    // Final color
    COLOR.rgb = mix(COLOR.rgb, glow, scan_line);
}
```

### **Terminal Font Setup**
```gd
# In _ready() of main scene
func setup_retro_theme():
    var terminal_font = load("res://assets/fonts/CourierPrime.ttf")
    var retro_theme = load("res://resources/ui/RetroTheme.tres")
    
    # Apply to all UI elements
    get_tree().set_screen_stretch(
        Window.CONTENT_SCALE_MODE_VIEWPORT, 
        Window.CONTENT_SCALE_ASPECT_KEEP, 
        Vector2i(1280, 720)
    )
```

---

## 🔧 AUTOLOAD SYSTEMS

### **Autoload Structure**
```
autoload/
├── GameSignals.gd (comunicazione globale)
├── GameData.gd (database centralizato)
├── GameSettings.gd (configurazione)
├── SaveManager.gd (persistenza)
└── DebugConsole.gd (development tools)
```

### **GameData Autoload**
```gd
# GameData.gd - Singleton per dati globali
extends Node

var item_database: ItemDatabase
var enemy_database: EnemyDatabase
var event_database: EventDatabase
var achievement_database: AchievementDatabase

func _ready():
    load_databases()
    
func load_databases():
    item_database = load("res://resources/data/ItemDatabase.tres")
    enemy_database = load("res://resources/data/EnemyDatabase.tres")
    # ... altri database
```

---

## 📱 RESPONSIVE DESIGN

### **Multi-Resolution Support**
- **Base Resolution**: 1280x720 (16:9)
- **Minimum Resolution**: 1024x600
- **Mobile Support**: 480x800 (portrait)
- **Scaling**: Viewport stretch mode

### **UI Adaptivity**
```gd
# ResponsiveUI.gd
class_name ResponsiveUI
extends Control

func _ready():
    get_viewport().size_changed.connect(_on_viewport_resized)
    _adapt_to_screen_size()
    
func _adapt_to_screen_size():
    var screen_size = get_viewport().size
    if screen_size.x < 800:
        # Mobile layout
        apply_mobile_layout()
    else:
        # Desktop layout
        apply_desktop_layout()
```

---

## 🚀 PERFORMANCE OPTIMIZATION

### **Scene Optimization**
- **Node pooling** per combat entities
- **Resource preloading** per critical assets
- **LOD system** per large maps
- **Async loading** per heavy scenes

### **Memory Management**
```gd
# ResourceManager.gd
class_name ResourceManager
extends Node

var resource_cache: Dictionary = {}
var max_cache_size: int = 100

func get_resource(path: String) -> Resource:
    if path in resource_cache:
        return resource_cache[path]
    
    var resource = load(path)
    if resource_cache.size() >= max_cache_size:
        _cleanup_cache()
    
    resource_cache[path] = resource
    return resource
```

---

## 📋 MIGRATION ROADMAP

### **Phase 1: Core Scenes** (Week 4-5)
1. Main.tscn setup
2. GameUI.tscn creation
3. Player.tscn implementation
4. Basic signal system

### **Phase 2: Game Systems** (Week 6-8)
1. Map.tscn e world system
2. Event system migration
3. Combat system implementation
4. Data layer completion

### **Phase 3: Polish & Integration** (Week 9-12)
1. UI polish e theme system
2. Save system implementation
3. Performance optimization
4. Testing e bug fixing

---

**🎯 NEXT STEPS**: Iniziare con Main.tscn setup e basic scene structure

**📚 REFERENCE**: Consultare `migration_guides/JAVASCRIPT_TO_GDSCRIPT.md` per mapping specifici 
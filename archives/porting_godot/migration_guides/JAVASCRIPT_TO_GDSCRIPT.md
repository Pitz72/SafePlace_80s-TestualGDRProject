# 🔄 JAVASCRIPT TO GDSCRIPT MIGRATION GUIDE
## Mapping Completo per The Safe Place Porting

**Created**: 3 Giugno 2025  
**Version**: v1.0 - Initial Mapping  
**Target**: Core 5 JavaScript files prioritari  

---

## 🎯 OVERVIEW MIGRAZIONE

### **File Prioritari per Migrazione**
1. **`game_data.js`** (197KB, 3430 lines) → `ItemDatabase.gd` + Resources
2. **`player.js`** (86KB, 1819 lines) → `Player.gd` + Components  
3. **`ui.js`** (78KB, 1572 lines) → UI Scenes + Scripts
4. **`map.js`** (52KB, 1047 lines) → `MapManager.gd`
5. **`events.js`** (59KB, 1189 lines) → `EventManager.gd`

### **Strategia Generale**
- **Object-oriented approach**: Sfruttare class system GDScript
- **Resource system**: Database objects → Godot Resources
- **Signal system**: Event callbacks → Godot signals
- **Scene modularity**: Monolithic JS → Scene components

---

## 📊 1. GAME_DATA.JS → GDSCRIPT RESOURCES

### **JavaScript Structure**
```javascript
// game_data.js - Database oggetti statico
const ITEM_DATA = {
    "canned_food": {
        name: "Cibo in Scatola",
        type: "consumable",
        hunger: 4,
        description: "Cibo in conserva, nutriente.",
        weight: 1,
        value: 10
    },
    // ... 118+ altri oggetti
};

const ENEMY_DATA = {
    "beast_weak": {
        name: "Bestia Debole",
        hp: 25,
        damage: "1d6+1",
        defenseClass: 12,
        // ... altri dati
    }
};
```

### **GDScript Migration**
```gd
# Item.gd - Resource class per oggetti
class_name Item
extends Resource

@export var id: String
@export var name: String
@export var type: ItemType
@export var description: String
@export var weight: int = 1
@export var value: int = 0

# Effetti specifici per tipo
@export var consumable_effects: Dictionary = {}
@export var weapon_stats: WeaponStats
@export var armor_stats: ArmorStats

enum ItemType {
    CONSUMABLE,
    WEAPON,
    ARMOR,
    TOOL,
    CRAFTING,
    LORE
}
```

```gd
# ItemDatabase.gd - Manager del database
class_name ItemDatabase
extends Resource

@export var items: Array[Item] = []
var _item_lookup: Dictionary = {}

func _init():
    _build_lookup_table()

func _build_lookup_table():
    for item in items:
        _item_lookup[item.id] = item

func get_item(id: String) -> Item:
    return _item_lookup.get(id)

func get_items_by_type(type: Item.ItemType) -> Array[Item]:
    return items.filter(func(item): return item.type == type)
```

### **Migration Tasks**
- [ ] Create Item.gd resource class
- [ ] Create ItemDatabase.gd manager  
- [ ] Parse ITEM_DATA and convert to .tres files
- [ ] Implement lookup optimization
- [ ] Create weapon/armor specific stats classes

---

## 👤 2. PLAYER.JS → PLAYER SYSTEM

### **JavaScript Structure**
```javascript
// player.js - Sistema giocatore complesso
let player = {
    // Survival stats
    hp: 100, maxhp: 100,
    food: 6, water: 6,
    
    // D&D stats
    vig: 10, pot: 10, agi: 10,
    tra: 10, inf: 10, pre: 10, ada: 10,
    
    // Progression
    exp: 0, pts: 0,
    
    // Location & time
    x: 100, y: 100,
    day: 1, hour: 8,
    
    // Inventory
    inventory: [],
    equipped: {},
    
    // Conditions
    conditions: []
};

function addExperience(amount) {
    player.exp += amount;
    if (player.exp >= getExpRequiredForLevel(player.level + 1)) {
        levelUp();
    }
}
```

### **GDScript Migration**
```gd
# Player.gd - Main player controller
class_name Player
extends CharacterBody2D

signal stats_changed(stat_name: String, new_value: int)
signal health_changed(hp: int, max_hp: int)
signal level_up(new_level: int)
signal condition_added(condition: Condition)

@export var stats: PlayerStats
@export var inventory: Inventory
@export var equipment: Equipment
@export var progression: PlayerProgression

func _ready():
    stats.stat_changed.connect(_on_stat_changed)
    progression.experience_gained.connect(_on_experience_gained)

func add_experience(amount: int):
    progression.add_experience(amount)
    
func take_damage(amount: int):
    stats.hp = max(0, stats.hp - amount)
    health_changed.emit(stats.hp, stats.max_hp)
    
    if stats.hp <= 0:
        _handle_death()
```

```gd
# PlayerStats.gd - Component per statistiche
class_name PlayerStats
extends Resource

signal stat_changed(stat_name: String, new_value: int)

# Survival stats
@export var hp: int = 100 : set = set_hp
@export var max_hp: int = 100
@export var food: int = 6 : set = set_food
@export var water: int = 6 : set = set_water

# D&D attributes
@export var vigor: int = 10
@export var potency: int = 10
@export var agility: int = 10
@export var tracking: int = 10
@export var influence: int = 10
@export var presage: int = 10
@export var adaptation: int = 10

func set_hp(value: int):
    var old_hp = hp
    hp = clamp(value, 0, max_hp)
    if hp != old_hp:
        stat_changed.emit("hp", hp)

func get_modifier(stat_value: int) -> int:
    return (stat_value - 10) / 2
```

### **Migration Tasks**
- [ ] Create Player.gd main class
- [ ] Create PlayerStats.gd component
- [ ] Create Inventory.gd system
- [ ] Create Equipment.gd system  
- [ ] Create PlayerProgression.gd for leveling
- [ ] Implement signal communication

---

## 🖥️ 3. UI.JS → GODOT UI SYSTEM

### **JavaScript Structure**
```javascript
// ui.js - Sistema UI monolitico
function updateStatsDisplay() {
    document.getElementById('hp-value').textContent = player.hp;
    document.getElementById('food-value').textContent = player.food;
    // ... aggiornamento UI
}

function addMessage(text, type = 'info') {
    const messageLog = document.getElementById('message-log');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = text;
    messageLog.appendChild(messageDiv);
}

function showEventPopup(event) {
    const popup = document.getElementById('event-popup');
    const title = document.getElementById('event-title');
    const content = document.getElementById('event-content');
    
    title.textContent = event.title;
    content.textContent = event.description;
    popup.style.display = 'block';
}
```

### **GDScript Migration**
```gd
# GameUI.gd - UI principale 
class_name GameUI
extends Control

@onready var stats_panel: StatsPanel = $MainPanel/ContentPanel/LeftPanel/StatsPanel
@onready var inventory_panel: InventoryPanel = $MainPanel/ContentPanel/LeftPanel/InventoryPanel
@onready var message_log: MessageLog = $MainPanel/ContentPanel/RightPanel/MessageLog
@onready var event_overlay: Control = $EventOverlay

func _ready():
    # Connect to global signals
    GameSignals.player_stats_changed.connect(_on_player_stats_changed)
    GameSignals.message_added.connect(_on_message_added)
    GameSignals.event_triggered.connect(_on_event_triggered)

func _on_player_stats_changed(stat_name: String, value: int):
    stats_panel.update_stat(stat_name, value)

func add_message(text: String, type: MessageType):
    message_log.add_message(text, type)

func show_event_popup(event: GameEvent):
    event_overlay.show_event(event)
    event_overlay.visible = true
```

```gd
# StatsPanel.gd - Pannello statistiche
class_name StatsPanel
extends Panel

@onready var hp_label: Label = $VBox/HPContainer/ValueLabel
@onready var food_label: Label = $VBox/FoodContainer/ValueLabel
@onready var water_label: Label = $VBox/WaterContainer/ValueLabel

func update_stat(stat_name: String, value: int):
    match stat_name:
        "hp":
            hp_label.text = str(value)
            _update_hp_color(value)
        "food":
            food_label.text = str(value)
        "water":
            water_label.text = str(value)

func _update_hp_color(hp: int):
    if hp < 30:
        hp_label.modulate = Color.RED
    elif hp < 60:
        hp_label.modulate = Color.YELLOW
    else:
        hp_label.modulate = Color.WHITE
```

### **Migration Tasks**
- [ ] Create GameUI.tscn scene hierarchy
- [ ] Create StatsPanel.gd component
- [ ] Create MessageLog.gd component
- [ ] Create EventOverlay.gd popup system
- [ ] Implement RetroTheme system
- [ ] Setup signal connections

---

## 🗺️ 4. MAP.JS → MAP SYSTEM

### **JavaScript Structure**
```javascript
// map.js - Sistema mappa procedurale
const GRID_SIZE = 200;
let worldMap = [];

function generateMap(seed) {
    worldMap = Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill('.'));
    
    // Generate biomes
    for (let x = 0; x < GRID_SIZE; x++) {
        for (let y = 0; y < GRID_SIZE; y++) {
            worldMap[x][y] = generateTile(x, y, seed);
        }
    }
    
    // Place special locations
    placeShelters();
    placeVillages();
    placeCities();
}

function movePlayer(direction) {
    const newX = player.x + direction.x;
    const newY = player.y + direction.y;
    
    if (isValidPosition(newX, newY)) {
        player.x = newX;
        player.y = newY;
        updateMapDisplay();
        checkForEvents();
    }
}
```

### **GDScript Migration**
```gd
# MapManager.gd - Manager principale mappa
class_name MapManager
extends Node2D

signal player_moved(new_position: Vector2i)
signal location_discovered(location: MapLocation)

@export var map_size: Vector2i = Vector2i(200, 200)
@export var tile_map: TileMap
@export var player_marker: Node2D

var world_data: Array[Array]
var locations: Array[MapLocation] = []
var discovered_tiles: Dictionary = {}

func _ready():
    generate_world()
    
func generate_world(seed: int = 0):
    if seed == 0:
        seed = randi()
    
    world_data = []
    for x in map_size.x:
        world_data.append([])
        for y in map_size.y:
            var tile_type = _generate_tile_type(x, y, seed)
            world_data[x].append(tile_type)
    
    _place_special_locations()
    _update_tilemap()

func move_player(direction: Vector2i) -> bool:
    var current_pos = GameData.player.position
    var new_pos = current_pos + direction
    
    if _is_valid_position(new_pos):
        GameData.player.position = new_pos
        player_moved.emit(new_pos)
        _check_location_discovery(new_pos)
        return true
    
    return false

func _generate_tile_type(x: int, y: int, seed: int) -> TileType:
    // Implementa generazione procedurale basata su noise
    var noise = FastNoiseLite.new()
    noise.seed = seed
    var value = noise.get_noise_2d(x * 0.1, y * 0.1)
    
    if value > 0.4:
        return TileType.MOUNTAIN
    elif value > 0.2:
        return TileType.FOREST
    elif value > -0.2:
        return TileType.WASTELAND
    else:
        return TileType.DESERT
```

```gd
# MapLocation.gd - Resource per location speciali
class_name MapLocation
extends Resource

@export var position: Vector2i
@export var type: LocationType
@export var name: String
@export var description: String
@export var discovered: bool = false
@export var events: Array[String] = []

enum LocationType {
    SHELTER,
    VILLAGE,
    CITY,
    RUINS,
    SPECIAL
}
```

### **Migration Tasks**
- [ ] Create MapManager.gd world system
- [ ] Create TileMap setup for visualization
- [ ] Create MapLocation.gd resource system
- [ ] Implement procedural generation
- [ ] Create movement validation system
- [ ] Setup location discovery mechanics

---

## 🎭 5. EVENTS.JS → EVENT SYSTEM

### **JavaScript Structure**
```javascript
// events.js - Sistema eventi narrativi
const EVENT_DATA = {
    "exploration_basic": {
        title: "Esplorazione",
        description: "Mentre esplori...",
        choices: [
            {
                text: "Continua",
                action: "continue"
            },
            {
                text: "Cerca rifugi",
                skillCheck: { stat: "tra", difficulty: 12 }
            }
        ]
    }
};

function triggerEvent(eventId) {
    const event = EVENT_DATA[eventId];
    showEventPopup(event);
}

function handleEventChoice(eventId, choiceIndex) {
    const event = EVENT_DATA[eventId];
    const choice = event.choices[choiceIndex];
    
    if (choice.skillCheck) {
        const result = performSkillCheck(choice.skillCheck);
        if (result.success) {
            // Success outcome
        } else {
            // Failure outcome
        }
    }
}
```

### **GDScript Migration**
```gd
# EventManager.gd - Sistema eventi
class_name EventManager
extends Node

signal event_triggered(event: GameEvent)
signal event_completed(event: GameEvent, outcome: EventOutcome)

@export var event_database: EventDatabase
var active_event: GameEvent
var event_cooldown: float = 0.0

func _ready():
    GameSignals.player_moved.connect(_on_player_moved)
    
func _process(delta):
    if event_cooldown > 0:
        event_cooldown -= delta

func _on_player_moved(position: Vector2i):
    if event_cooldown <= 0:
        _check_for_events(position)

func _check_for_events(position: Vector2i):
    var event_chance = _calculate_event_chance(position)
    if randf() < event_chance:
        var event = _select_random_event(position)
        trigger_event(event)

func trigger_event(event: GameEvent):
    active_event = event
    event_triggered.emit(event)

func handle_choice(choice_index: int):
    if not active_event:
        return
        
    var choice = active_event.choices[choice_index]
    var outcome = _process_choice(choice)
    
    event_completed.emit(active_event, outcome)
    active_event = null
    event_cooldown = 30.0  # Cooldown between events

func _process_choice(choice: EventChoice) -> EventOutcome:
    var outcome = EventOutcome.new()
    
    if choice.skill_check:
        var success = _perform_skill_check(choice.skill_check)
        outcome.success = success
        outcome.description = choice.success_text if success else choice.failure_text
    else:
        outcome.success = true
        outcome.description = choice.result_text
    
    _apply_choice_effects(choice, outcome)
    return outcome
```

```gd
# GameEvent.gd - Resource per eventi
class_name GameEvent
extends Resource

@export var id: String
@export var title: String
@export var description: String
@export var choices: Array[EventChoice]
@export var requirements: Array[EventRequirement]
@export var category: EventCategory

enum EventCategory {
    EXPLORATION,
    COMBAT,
    LORE,
    SOCIAL,
    SURVIVAL
}
```

### **Migration Tasks**
- [ ] Create EventManager.gd system
- [ ] Create GameEvent.gd resource class
- [ ] Create EventChoice.gd and EventOutcome.gd
- [ ] Implement skill check system
- [ ] Create event database loading
- [ ] Setup event triggering logic

---

## 🔧 UTILITY FUNCTIONS MIGRATION

### **Common Patterns**

#### **Random Number Generation**
```javascript
// JavaScript
Math.random() * 100 < chance
Math.floor(Math.random() * max)

// GDScript
randf() * 100.0 < chance
randi() % max
```

#### **Array Operations**
```javascript
// JavaScript
array.filter(item => item.type === 'weapon')
array.find(item => item.id === targetId)

// GDScript
array.filter(func(item): return item.type == ItemType.WEAPON)
array.filter(func(item): return item.id == target_id)[0]
```

#### **Object Property Access**
```javascript
// JavaScript
player.stats.hp += amount
player['stats']['hp'] += amount

// GDScript
player.stats.hp += amount
player.get("stats").get("hp") + amount  # Dynamic access
```

---

## 📋 MIGRATION PRIORITY MATRIX

| Component | Complexity | Impact | Priority | Est. Time |
|-----------|------------|--------|----------|-----------|
| GameData → Resources | Medium | High | 1 | 2-3 days |
| Player System | High | High | 2 | 3-4 days |
| Map System | Medium | High | 3 | 2-3 days |
| Event System | High | Medium | 4 | 3-4 days |
| UI System | High | Medium | 5 | 4-5 days |

---

## ✅ VALIDATION CHECKLIST

### **Per Ogni File Migrato**
- [ ] Functionality parity verificata
- [ ] Performance acceptable (no regression)
- [ ] Memory usage ottimizzato
- [ ] Signals properly connected
- [ ] Error handling implementato
- [ ] Debug logging aggiunto

### **Integration Testing**
- [ ] Cross-system communication
- [ ] Save/Load compatibility
- [ ] Event flow validation
- [ ] UI responsiveness
- [ ] Performance benchmarks

---

**🎯 NEXT STEPS**: Iniziare con GameData migration (highest impact, medium complexity)

**📚 REFERENCE**: Consultare scene architecture per integration planning 
class_name GameManager
extends Node

## GameManager - Sistema Centrale di Gestione SafePlace
## Coordina tutti i sistemi del gioco e gestisce lo stato globale

# Riferimenti ai sistemi core (usa Node generico per evitare errori di ordine)
@onready var item_database: Node = $ItemDatabase
@onready var combat_manager: Node = $CombatManager
@onready var event_manager: Node = $EventManager  
@onready var map_manager: Node = $MapManager
@onready var save_manager: Node = $SaveManager
@onready var player: Node = get_node("../WorldContainer/Player")
@onready var ui_stats: RichTextLabel = get_node("../UIContainer/GameUI/StatsPanel/StatsLabel")
@onready var ui_debug: RichTextLabel = get_node("../DebugContainer/DebugPanel/DebugLabel")

# Stati del gioco (estesi per nuovi sistemi)
enum GameState {
	LOADING,
	MAIN_MENU,
	PLAYING,
	INVENTORY,
	PAUSED,
	COMBAT,
	EVENT,
	TRAVELING,
	SAVING,
	LOADING_SAVE
}

var current_state: GameState = GameState.LOADING
var game_time: float = 0.0
var session_start_time: float = 0.0

# Segnali del sistema centrale (estesi)
signal game_state_changed(new_state: GameState)
signal player_stats_updated(player_data: Dictionary)
signal inventory_changed(action: String, item: Item, quantity: int)
signal ui_update_requested(ui_type: String, data: Dictionary)
signal database_ready()
signal all_systems_ready()

# Nuovi segnali per sistemi Session #005
signal combat_ended(result: String, rewards: Dictionary)
signal event_started(event_data: Dictionary)
signal event_ended(event_id: String, result: Dictionary)
signal location_changed(old_location: String, new_location: String)
signal save_game_requested(slot: int)

# Performance metrics
var frame_count: int = 0
var performance_samples: Array[float] = []
var last_fps_update: float = 0.0

func _init():
	print("🎮 GameManager inizializzato")
	session_start_time = Time.get_time_dict_from_system().hour * 3600 + Time.get_time_dict_from_system().minute * 60 + Time.get_time_dict_from_system().second

func _ready():
	print("🎮 GameManager ready - Inizializzazione sistemi Session #005...")
	
	# Setup signal connections
	_setup_signal_connections()
	
	# Initialize core systems
	await _initialize_systems()
	
	# Setup UI
	_setup_ui()
	
	# Change to playing state
	change_state("PLAYING")
	
	print("🎮 GameManager: Tutti i sistemi Session #005 pronti!")
	all_systems_ready.emit()

func _process(delta):
	game_time += delta
	frame_count += 1
	
	# Update performance metrics every second
	if game_time - last_fps_update > 1.0:
		_update_performance_metrics()
		last_fps_update = game_time
	
	# Update UI if needed
	_update_ui(delta)

func _input(event):
	if event.is_action_pressed("ui_accept"):
		print("🎮 Input test: UI Accept pressed")
	
	if event.is_action_pressed("ui_cancel"):
		print("🎮 Input test: UI Cancel pressed")
	
	# Inventory toggle (placeholder)
	if Input.is_action_just_pressed("ui_select"):  # Spacebar
		_toggle_inventory()
	
	# Debug shortcuts per Session #005
	if Input.is_action_just_pressed("ui_home"):  # Home key
		_debug_test_systems()

## Setup delle connessioni signal tra sistemi (esteso Session #005)
func _setup_signal_connections():
	print("🔗 Setup signal connections Session #005...")
	
	# Connect to database signals (se ha i metodi)
	if item_database and item_database.has_signal("database_loaded"):
		item_database.database_loaded.connect(_on_database_loaded)
	if item_database and item_database.has_signal("item_not_found"):
		item_database.item_not_found.connect(_on_item_not_found)
	
	# Connect to combat manager signals
	if combat_manager and combat_manager.has_signal("combat_ended"):
		combat_manager.combat_ended.connect(_on_combat_ended)
	if combat_manager and combat_manager.has_signal("combat_started"):
		combat_manager.combat_started.connect(_on_combat_started)
	
	# Connect to event manager signals
	if event_manager and event_manager.has_signal("event_started"):
		event_manager.event_started.connect(_on_event_started)
	if event_manager and event_manager.has_signal("event_ended"):
		event_manager.event_ended.connect(_on_event_ended)
	
	# Connect to map manager signals
	if map_manager and map_manager.has_signal("location_changed"):
		map_manager.location_changed.connect(_on_location_changed)
	if map_manager and map_manager.has_signal("travel_started"):
		map_manager.travel_started.connect(_on_travel_started)
	
	# Connect to save manager signals
	if save_manager and save_manager.has_signal("save_completed"):
		save_manager.save_completed.connect(_on_save_completed)
	if save_manager and save_manager.has_signal("load_completed"):
		save_manager.load_completed.connect(_on_load_completed)
	
	# Connect to game state changes
	game_state_changed.connect(_on_game_state_changed)
	
	print("🔗 Signal connections Session #005 complete")

## Inizializzazione di tutti i sistemi core (esteso Session #005)
func _initialize_systems() -> void:
	print("🔧 Inizializzazione sistemi Session #005...")
	
	# Initialize ItemDatabase
	if item_database and item_database.has_method("load_items_from_json"):
		print("📦 Caricamento ItemDatabase...")
		var test_data = _create_basic_test_data()
		var success = item_database.load_items_from_json(test_data)
		
		if success:
			print("✅ ItemDatabase caricato con successo")
			database_ready.emit()
		else:
			print("❌ Errore caricamento ItemDatabase")
	
	# Initialize Player
	if player and player.has_method("initialize_player"):
		print("👤 Inizializzazione Player...")
		player.initialize_player()
		if player.has_signal("stats_changed"):
			player.stats_changed.connect(_on_player_stats_changed)
		if player.has_signal("inventory_changed"):
			player.inventory_changed.connect(_on_player_inventory_changed)
		print("✅ Player inizializzato")
	
	# Initialize new systems Session #005
	print("⚔️ Sistemi Session #005 inizializzati automaticamente")
	
	# Small delay to ensure all systems are ready
	await get_tree().process_frame

## Cambio stato del gioco con gestione completa (esteso Session #005)
func change_state(new_state_name: String):
	var new_state: GameState
	
	# Convert string to enum
	match new_state_name:
		"LOADING": new_state = GameState.LOADING
		"MAIN_MENU": new_state = GameState.MAIN_MENU  
		"PLAYING": new_state = GameState.PLAYING
		"INVENTORY": new_state = GameState.INVENTORY
		"PAUSED": new_state = GameState.PAUSED
		"COMBAT": new_state = GameState.COMBAT
		"EVENT": new_state = GameState.EVENT
		"TRAVELING": new_state = GameState.TRAVELING
		"SAVING": new_state = GameState.SAVING
		"LOADING_SAVE": new_state = GameState.LOADING_SAVE
		_: 
			print("❌ Stato sconosciuto: ", new_state_name)
			return
	
	_change_game_state(new_state)

func _change_game_state(new_state: GameState):
	var old_state = current_state
	current_state = new_state
	
	print("🎮 Cambio stato: ", GameState.keys()[old_state], " → ", GameState.keys()[new_state])
	
	match current_state:
		GameState.LOADING:
			_handle_loading_state()
		GameState.PLAYING:
			_handle_playing_state()
		GameState.INVENTORY:
			_handle_inventory_state()
		GameState.PAUSED:
			_handle_paused_state()
		GameState.COMBAT:
			_handle_combat_state()
		GameState.EVENT:
			_handle_event_state()
		GameState.TRAVELING:
			_handle_traveling_state()
		GameState.SAVING:
			_handle_saving_state()
		GameState.LOADING_SAVE:
			_handle_loading_save_state()
	
	game_state_changed.emit(new_state)

## Gestione stati specifici (estesi Session #005)
func _handle_loading_state():
	pass

func _handle_playing_state():
	get_node("../UIContainer/InventoryUI").visible = false

func _handle_inventory_state():
	get_node("../UIContainer/InventoryUI").visible = true

func _handle_paused_state():
	pass

func _handle_combat_state():
	# UI specifica per combattimento
	pass

func _handle_event_state():
	# UI specifica per eventi narrativi
	pass

func _handle_traveling_state():
	# UI specifica per viaggi
	pass

func _handle_saving_state():
	# UI feedback salvataggio
	pass

func _handle_loading_save_state():
	# UI feedback caricamento
	pass

## API pubbliche per i sistemi Session #005

# Combat system API
func start_combat(enemy_data: Dictionary) -> bool:
	if combat_manager and combat_manager.has_method("start_combat"):
		return combat_manager.start_combat(enemy_data)
	return false

# Event system API  
func start_event(event_id: String) -> bool:
	if event_manager and event_manager.has_method("start_event"):
		return event_manager.start_event(event_id)
	return false

func trigger_random_event() -> bool:
	if event_manager and event_manager.has_method("trigger_random_event"):
		return event_manager.trigger_random_event()
	return false

# Map system API
func travel_to_location(location_id: String) -> bool:
	if map_manager and map_manager.has_method("travel_to"):
		return map_manager.travel_to(location_id)
	return false

func get_current_location() -> String:
	if map_manager and map_manager.has_method("get_location_name"):
		return map_manager.get_location_name(map_manager.current_location)
	return "Unknown"

# Save system API
func save_game(slot: int = 0) -> bool:
	change_state("SAVING")
	if save_manager and save_manager.has_method("save_game"):
		return save_manager.save_game(slot)
	return false

func load_game(slot: int = 0) -> bool:
	change_state("LOADING_SAVE")
	if save_manager and save_manager.has_method("load_game"):
		return save_manager.load_game(slot)
	return false

# Utility getters
func get_item_database():
	return item_database

func get_combat_manager():
	return combat_manager

func get_event_manager():
	return event_manager

func get_map_manager():
	return map_manager

func get_save_manager():
	return save_manager

## Toggle inventory (placeholder functionality)
func _toggle_inventory():
	if current_state == GameState.PLAYING:
		change_state("INVENTORY")
	elif current_state == GameState.INVENTORY:
		change_state("PLAYING")

## Setup UI iniziale
func _setup_ui():
	print("🖥️ Setup UI iniziale...")
	_update_stats_ui()
	_update_debug_ui()

## Aggiorna UI stats (esteso Session #005)
func _update_stats_ui():
	if not ui_stats or not player:
		return
	
	var stats_text = "[color=green]SAFEPLACE STATUS[/color]\n"
	stats_text += "HP: %d/%d\n" % [player.hp if player.has_method("get") else 100, player.max_hp if player.has_method("get") else 100]
	stats_text += "Food: %d\n" % (player.food if player.has_method("get") else 100)
	stats_text += "Water: %d\n" % (player.water if player.has_method("get") else 100)
	stats_text += "Exp: %d (Lv %d)\n" % [player.exp if player.has_method("get") else 0, player.level if player.has_method("get") else 1]
	stats_text += "Location: %s\n" % get_current_location()
	stats_text += "Movement: %d/%d" % [
		map_manager.movement_points if map_manager and map_manager.has_method("get") else 100,
		map_manager.max_movement_points if map_manager and map_manager.has_method("get") else 100
	]
	
	ui_stats.text = stats_text

## Aggiorna UI debug (esteso Session #005)
func _update_debug_ui():
	if not ui_debug:
		return
	
	var debug_text = "[color=yellow]SESSION #005 DEBUG[/color]\n"
	debug_text += "State: %s\n" % GameState.keys()[current_state]
	debug_text += "⚔️Combat: %s\n" % ("✅" if combat_manager else "❌")
	debug_text += "📖Events: %s\n" % ("✅" if event_manager else "❌")
	debug_text += "🗺️Map: %s\n" % ("✅" if map_manager else "❌")  
	debug_text += "💾Save: %s\n" % ("✅" if save_manager else "❌")
	debug_text += "Items: %d\n" % (item_database.get_stats().total_items if item_database and item_database.has_method("get_stats") else 0)
	debug_text += "Frame: %d\n" % frame_count
	debug_text += "Time: %.1fs" % game_time
	
	ui_debug.text = debug_text

## Gestione segnali
func _on_database_loaded(item_count: int, load_time: float):
	print("📦 Database caricato: %d items in %.1fms" % [item_count, load_time])
	ui_update_requested.emit("database_status", {"items": item_count, "time": load_time})

func _on_item_not_found(item_id: String):
	print("⚠️ Item non trovato: %s" % item_id)

func _on_game_state_changed(new_state: GameState):
	print("🎮 Stato cambiato: %s" % GameState.keys()[new_state])

func _on_player_stats_changed(stat_name: String, old_value: int, new_value: int):
	print("👤 Stat changed: %s %d → %d" % [stat_name, old_value, new_value])
	_update_stats_ui()
	if player and player.has_method("get_stats_dict"):
		player_stats_updated.emit(player.get_stats_dict())

func _on_player_inventory_changed(action: String, item: Item, quantity: int):
	print("🎒 Inventory: %s %s x%d" % [action, item.name if item else "null", quantity])
	inventory_changed.emit(action, item, quantity)

func _on_combat_ended(result: String, rewards: Dictionary):
	print("🎮 Combat ended: %s, Rewards: %s" % [result, rewards])

func _on_combat_started(enemy_data: Dictionary):
	print("🎮 Combat started: %s" % enemy_data)

func _on_event_started(event_data: Dictionary):
	print("🎮 Event started: %s" % event_data)

func _on_event_ended(event_id: String, result: Dictionary):
	print("🎮 Event ended: %s, Result: %s" % [event_id, result])

func _on_location_changed(old_location: String, new_location: String):
	print("🎮 Location changed: %s → %s" % [old_location, new_location])

func _on_travel_started(location_id: String):
	print("🎮 Travel started: %s" % location_id)

func _on_save_completed(slot: int):
	print("🎮 Save completed: %d" % slot)

func _on_load_completed(slot: int):
	print("🎮 Load completed: %d" % slot)

## Update UI generico
func _update_ui(delta: float):
	# Update debug info ogni secondo
	if int(game_time) % 1 == 0 and frame_count % 60 == 0:
		_update_debug_ui()

## Performance monitoring
func _update_performance_metrics():
	var current_fps = Engine.get_frames_per_second()
	performance_samples.append(current_fps)
	
	# Keep only last 10 samples
	if performance_samples.size() > 10:
		performance_samples.pop_front()

## Debug testing per Session #005
func _debug_test_systems():
	print("🧪 Testing Session #005 systems...")
	
	# Test Combat
	if combat_manager:
		print("⚔️ Testing Combat System...")
		var test_enemy = {
			"name": "Test Bandit",
			"max_hp": 30,
			"hp": 30,
			"attack": 5,
			"experience": 10
		}
		start_combat(test_enemy)
	
	# Test Event
	if event_manager:
		print("📖 Testing Event System...")
		trigger_random_event()
	
	# Test Map
	if map_manager:
		print("🗺️ Testing Map System...")
		print("  Current location: ", get_current_location())
		print("  Movement points: ", map_manager.movement_points if map_manager.has_method("get") else "Unknown")
	
	# Test Save
	if save_manager:
		print("💾 Testing Save System...")
		save_game(9)  # Use slot 9 for testing

## Utility per dati di test base
func _create_basic_test_data() -> Dictionary:
	return {
		"health_potion": {
			"id": "health_potion",
			"name": "Pozione di Cura",
			"description": "Una piccola fiala con liquido rosso che ripristina la salute.",
			"type": "consumable",
			"usable": true,
			"weight": 0.2,
			"value": 25,
			"stackable": true,
			"effects": [{"type": "heal", "amount": 50}]
		},
		"rusty_knife": {
			"id": "rusty_knife",
			"name": "Coltello Arrugginito",
			"description": "Un vecchio coltello da cucina, ancora tagliente nonostante la ruggine.",
			"type": "weapon",
			"weaponType": "mischia", 
			"damage": {"min": 3, "max": 7},
			"weight": 0.5,
			"value": 12,
			"maxDurability": 25
		},
		"leather_boots": {
			"id": "leather_boots",
			"name": "Stivali di Cuoio",
			"description": "Stivali robusti che proteggono i piedi dai detriti.",
			"type": "armor",
			"slot": "feet",
			"armorValue": 1,
			"weight": 1.2,
			"value": 20,
			"maxDurability": 35
		}
	}

## Debug utilities Session #005
func get_system_status() -> Dictionary:
	return {
		"game_state": GameState.keys()[current_state],
		"systems_ready": item_database != null and player != null,
		"database_loaded": item_database.get_stats().is_loaded if item_database and item_database.has_method("get_stats") else false,
		"player_initialized": player.is_initialized if player and player.has_method("get") else false,
		"combat_manager": combat_manager != null,
		"event_manager": event_manager != null,
		"map_manager": map_manager != null,
		"save_manager": save_manager != null,
		"frame_count": frame_count,
		"game_time": game_time,
		"performance_avg": performance_samples.reduce(func(acc, val): return acc + val, 0.0) / performance_samples.size() if performance_samples.size() > 0 else 0.0,
		"current_location": get_current_location(),
		"movement_points": map_manager.movement_points if map_manager and map_manager.has_method("get") else 0
	}

func print_system_status():
	var status = get_system_status()
	print("🎮 SESSION #005 SYSTEM STATUS:")
	for key in status.keys():
		print("  %s: %s" % [key, status[key]]) 
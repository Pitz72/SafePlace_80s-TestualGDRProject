extends Node
class_name SaveManager

## SaveManager per SafePlace
## Gestisce salvataggio/caricamento di tutti i sistemi di gioco

signal save_completed(save_slot: int, save_data: Dictionary)
signal load_completed(save_slot: int, save_data: Dictionary)
signal save_failed(error_message: String)
signal load_failed(error_message: String)
signal save_slots_updated(slot_info: Array)

## Formati di save supportati
enum SaveFormat {
	JSON,
	BINARY,
	ENCRYPTED
}

@export var save_format: SaveFormat = SaveFormat.JSON
@export var auto_save_enabled: bool = true
@export var auto_save_interval: float = 300.0  # 5 minuti
@export var max_save_slots: int = 10
@export var debug_mode: bool = false

# Riferimenti ai sistemi
var game_manager: GameManager
var player: Player
var item_database: ItemDatabase
var map_manager: MapManager
var event_manager: EventManager

# Paths di salvataggio
var save_directory: String = "user://saves/"
var settings_file: String = "user://settings.save"

# Metadata save slots
var save_slots: Array[Dictionary] = []

# Auto-save timer
var auto_save_timer: float = 0.0

func _ready():
	print("💾 SaveManager inizializzato")
	_initialize_save_system()
	_load_save_slots_info()

func _process(delta):
	if auto_save_enabled:
		auto_save_timer += delta
		if auto_save_timer >= auto_save_interval:
			auto_save_timer = 0.0
			auto_save()

## Inizializza sistema di salvataggio
func _initialize_save_system():
	# Crea directory saves se non esiste
	if not DirAccess.dir_exists_absolute(save_directory):
		DirAccess.open("user://").make_dir_recursive("saves")
	
	# Trova riferimenti ai sistemi
	game_manager = get_node("../GameManager") if get_node_or_null("../GameManager") else null
	player = get_node("../../WorldContainer/Player") if get_node_or_null("../../WorldContainer/Player") else null
	map_manager = get_node("../MapManager") if get_node_or_null("../MapManager") else null
	event_manager = get_node("../EventManager") if get_node_or_null("../EventManager") else null
	
	if game_manager and game_manager.has_method("get_item_database"):
		item_database = game_manager.get_item_database()
	
	print("💾 Sistema salvataggio collegato ai sistemi principali")

## Salva gioco nello slot specificato
func save_game(slot: int = 0) -> bool:
	if slot < 0 or slot >= max_save_slots:
		print("❌ Slot salvataggio non valido: ", slot)
		save_failed.emit("Slot non valido: " + str(slot))
		return false
	
	if not _validate_systems():
		save_failed.emit("Sistemi di gioco non disponibili")
		return false
	
	print("💾 Salvando gioco nello slot ", slot)
	
	# Crea dati di salvataggio
	var save_data = _create_save_data()
	
	# Aggiungi metadata
	save_data["metadata"] = {
		"slot": slot,
		"timestamp": Time.get_unix_time_from_system(),
		"game_version": "1.0.0",
		"save_format": SaveFormat.keys()[save_format],
		"player_name": "Player",  # Da espandere
		"location": map_manager.get_location_name(map_manager.current_location) if map_manager else "Unknown",
		"level": player.level if player else 1,
		"playtime": 0  # Da implementare tracking
	}
	
	# Scrivi file di salvataggio
	var save_path = save_directory + "slot_" + str(slot) + ".save"
	var success = _write_save_file(save_path, save_data)
	
	if success:
		_update_save_slot_info(slot, save_data["metadata"])
		save_completed.emit(slot, save_data)
		print("💾 Salvataggio completato nello slot ", slot)
		return true
	else:
		save_failed.emit("Errore scrittura file")
		return false

## Carica gioco dallo slot specificato
func load_game(slot: int = 0) -> bool:
	if slot < 0 or slot >= max_save_slots:
		print("❌ Slot caricamento non valido: ", slot)
		load_failed.emit("Slot non valido: " + str(slot))
		return false
	
	var save_path = save_directory + "slot_" + str(slot) + ".save"
	
	if not FileAccess.file_exists(save_path):
		print("❌ File di salvataggio non trovato: ", save_path)
		load_failed.emit("Salvataggio non trovato nello slot " + str(slot))
		return false
	
	print("💾 Caricando gioco dallo slot ", slot)
	
	# Leggi file di salvataggio
	var save_data = _read_save_file(save_path)
	
	if save_data.is_empty():
		load_failed.emit("Errore lettura file")
		return false
	
	# Applica dati ai sistemi
	var success = _apply_save_data(save_data)
	
	if success:
		load_completed.emit(slot, save_data)
		print("💾 Caricamento completato dallo slot ", slot)
		return true
	else:
		load_failed.emit("Errore applicazione dati")
		return false

## Auto-save rapido
func auto_save() -> bool:
	if debug_mode:
		print("💾 Auto-save in corso...")
	
	# Usa slot 0 per auto-save
	return save_game(0)

## Crea struttura dati completa per il salvataggio
func _create_save_data() -> Dictionary:
	var save_data = {}
	
	# Player data
	if player:
		save_data["player"] = {
			"hp": player.hp,
			"max_hp": player.max_hp,
			"food": player.food,
			"water": player.water,
			"exp": player.exp,
			"level": player.level,
			"pts": player.pts,
			"vig": player.vig,
			"pot": player.pot,
			"agi": player.agi,
			"tra": player.tra,
			"inf": player.inf,
			"pre": player.pre,
			"ada": player.ada,
			"inventory": _serialize_inventory(),
			"equipped": _serialize_equipment()
		}
	
	# Map data
	if map_manager:
		save_data["map"] = {
			"current_location": map_manager.current_location,
			"discovered_locations": map_manager.discovered_locations,
			"movement_points": map_manager.movement_points,
			"max_movement_points": map_manager.max_movement_points
		}
	
	# Event data
	if event_manager:
		save_data["events"] = {
			"event_history": event_manager.event_history,
			"story_flags": event_manager.story_flags
		}
	
	# Game Manager data
	if game_manager:
		save_data["game"] = {
			"current_state": GameManager.GameState.keys()[game_manager.current_state]
		}
	
	return save_data

## Applica dati di salvataggio ai sistemi
func _apply_save_data(save_data: Dictionary) -> bool:
	if not _validate_systems():
		return false
	
	# Applica dati player
	if save_data.has("player") and player:
		var player_data = save_data["player"]
		player.hp = player_data.get("hp", 100)
		player.max_hp = player_data.get("max_hp", 100)
		player.food = player_data.get("food", 100)
		player.water = player_data.get("water", 100)
		player.exp = player_data.get("exp", 0)
		player.level = player_data.get("level", 1)
		player.pts = player_data.get("pts", 0)
		player.vig = player_data.get("vig", 10)
		player.pot = player_data.get("pot", 10)
		player.agi = player_data.get("agi", 10)
		player.tra = player_data.get("tra", 10)
		player.inf = player_data.get("inf", 10)
		player.pre = player_data.get("pre", 10)
		player.ada = player_data.get("ada", 10)
		
		# Ripristina inventario
		_deserialize_inventory(player_data.get("inventory", []))
		_deserialize_equipment(player_data.get("equipped", {}))
	
	# Applica dati mappa
	if save_data.has("map") and map_manager:
		var map_data = save_data["map"]
		map_manager.current_location = map_data.get("current_location", "starting_camp")
		map_manager.discovered_locations = map_data.get("discovered_locations", ["starting_camp"])
		map_manager.movement_points = map_data.get("movement_points", 100)
		map_manager.max_movement_points = map_data.get("max_movement_points", 100)
	
	# Applica dati eventi
	if save_data.has("events") and event_manager:
		var event_data = save_data["events"]
		event_manager.event_history = event_data.get("event_history", [])
		event_manager.story_flags = event_data.get("story_flags", {})
	
	# Applica stato game manager
	if save_data.has("game") and game_manager:
		var game_data = save_data["game"]
		var target_state = game_data.get("current_state", "PLAYING")
		game_manager.change_state(target_state)
	
	return true

## Serializza inventario player
func _serialize_inventory() -> Array:
	if not player:
		return []
	
	var inventory_data = []
	for item in player.inventory:
		if item:
			inventory_data.append({
				"id": item.get("item_id", ""),
				"quantity": item.get("quantity", 1)
			})
	
	return inventory_data

## Deserializza inventario player
func _deserialize_inventory(inventory_data: Array):
	if not player or not item_database:
		return
	
	player.inventory.clear()
	
	for item_data in inventory_data:
		var item_id = item_data.get("id", "")
		var quantity = item_data.get("quantity", 1)
		
		if not item_id.is_empty():
			player.add_item_to_inventory(item_id, quantity)

## Serializza equipaggiamento
func _serialize_equipment() -> Dictionary:
	if not player:
		return {}
	
	var equipment_data = {}
	for slot in player.equipped:
		var item = player.equipped[slot]
		if item:
			equipment_data[slot] = item.id
	
	return equipment_data

## Deserializza equipaggiamento
func _deserialize_equipment(equipment_data: Dictionary):
	if not player or not item_database:
		return
	
	player.equipped.clear()
	
	for slot in equipment_data:
		var item_id = equipment_data[slot]
		var item = item_database.get_item(item_id)
		if item:
			player.equipped[slot] = item

## Scrive file di salvataggio
func _write_save_file(path: String, data: Dictionary) -> bool:
	var file = FileAccess.open(path, FileAccess.WRITE)
	
	if not file:
		print("❌ Impossibile creare file: ", path)
		return false
	
	match save_format:
		SaveFormat.JSON:
			file.store_string(JSON.stringify(data))
		SaveFormat.BINARY:
			file.store_var(data)
		SaveFormat.ENCRYPTED:
			file.store_var(data, true)  # Encrypted
	
	file.close()
	return true

## Legge file di salvataggio
func _read_save_file(path: String) -> Dictionary:
	var file = FileAccess.open(path, FileAccess.READ)
	
	if not file:
		print("❌ Impossibile aprire file: ", path)
		return {}
	
	var data = {}
	
	match save_format:
		SaveFormat.JSON:
			var json_string = file.get_as_text()
			var json = JSON.new()
			var parse_result = json.parse(json_string)
			if parse_result == Error.OK:
				data = json.data
		SaveFormat.BINARY, SaveFormat.ENCRYPTED:
			data = file.get_var()
	
	file.close()
	return data

## Aggiorna informazioni slot di salvataggio
func _update_save_slot_info(slot: int, metadata: Dictionary):
	# Trova o crea entry per lo slot
	var slot_entry = null
	for entry in save_slots:
		if entry.get("slot", -1) == slot:
			slot_entry = entry
			break
	
	if not slot_entry:
		slot_entry = {"slot": slot}
		save_slots.append(slot_entry)
	
	# Aggiorna metadata
	slot_entry.merge(metadata)
	
	# Salva informazioni slots
	_save_slots_info()
	
	# Notifica aggiornamento
	save_slots_updated.emit(save_slots)

## Carica informazioni slot di salvataggio
func _load_save_slots_info():
	var slots_file = save_directory + "slots_info.json"
	
	if not FileAccess.file_exists(slots_file):
		return
	
	var file = FileAccess.open(slots_file, FileAccess.READ)
	if not file:
		return
	
	var json_string = file.get_as_text()
	file.close()
	
	var json = JSON.new()
	var parse_result = json.parse(json_string)
	if parse_result == Error.OK:
		save_slots = json.data

## Salva informazioni slot
func _save_slots_info():
	var slots_file = save_directory + "slots_info.json"
	var file = FileAccess.open(slots_file, FileAccess.WRITE)
	
	if file:
		file.store_string(JSON.stringify(save_slots))
		file.close()

## Elimina salvataggio
func delete_save(slot: int) -> bool:
	if slot < 0 or slot >= max_save_slots:
		return false
	
	var save_path = save_directory + "slot_" + str(slot) + ".save"
	
	if FileAccess.file_exists(save_path):
		DirAccess.open("user://").remove(save_path)
	
	# Rimuovi dalle info slots
	for i in range(save_slots.size()):
		if save_slots[i].get("slot", -1) == slot:
			save_slots.remove_at(i)
			break
	
	_save_slots_info()
	save_slots_updated.emit(save_slots)
	
	print("💾 Salvataggio slot ", slot, " eliminato")
	return true

## Verifica disponibilità sistemi
func _validate_systems() -> bool:
	if not player:
		print("❌ Player non disponibile per salvataggio")
		return false
	
	if not game_manager:
		print("❌ GameManager non disponibile per salvataggio")
		return false
	
	return true

## Ottiene informazioni su tutti gli slot
func get_save_slots_info() -> Array:
	return save_slots.duplicate()

## Verifica se uno slot contiene un salvataggio
func has_save_in_slot(slot: int) -> bool:
	var save_path = save_directory + "slot_" + str(slot) + ".save"
	return FileAccess.file_exists(save_path)

## Ottiene metadata di uno slot specifico
func get_slot_metadata(slot: int) -> Dictionary:
	for entry in save_slots:
		if entry.get("slot", -1) == slot:
			return entry
	
	return {}

## Backup di sicurezza
func create_backup() -> bool:
	var backup_dir = save_directory + "backups/"
	
	if not DirAccess.dir_exists_absolute(backup_dir):
		DirAccess.open(save_directory).make_dir("backups")
	
	var timestamp = Time.get_datetime_string_from_system().replace(":", "-")
	var backup_path = backup_dir + "backup_" + timestamp + ".save"
	
	var current_data = _create_save_data()
	current_data["metadata"] = {
		"backup_timestamp": Time.get_unix_time_from_system(),
		"backup_type": "manual"
	}
	
	return _write_save_file(backup_path, current_data)

## Esporta save in formato leggibile (debug)
func export_save_as_text(slot: int) -> String:
	var save_path = save_directory + "slot_" + str(slot) + ".save"
	
	if not FileAccess.file_exists(save_path):
		return "Salvataggio non trovato"
	
	var save_data = _read_save_file(save_path)
	
	if save_data.is_empty():
		return "Errore lettura salvataggio"
	
	return JSON.stringify(save_data, "\t")

## Utility per debug
func debug_print_save_data():
	if not debug_mode:
		return
	
	var save_data = _create_save_data()
	print("💾 DEBUG Save Data:")
	print(JSON.stringify(save_data, "\t"))

## Stato per debugging
func get_save_status() -> Dictionary:
	return {
		"save_directory": save_directory,
		"auto_save_enabled": auto_save_enabled,
		"auto_save_interval": auto_save_interval,
		"next_auto_save": auto_save_interval - auto_save_timer,
		"save_format": SaveFormat.keys()[save_format],
		"total_save_slots": save_slots.size(),
		"systems_available": _validate_systems()
	} 

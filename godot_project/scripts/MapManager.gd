extends Node
class_name MapManager

## MapManager per SafePlace
## Gestisce sistema mappa, location e viaggio

signal location_changed(old_location: String, new_location: String)
signal location_discovered(location_id: String, location_data: Dictionary)
signal travel_started(destination: String, travel_time: int)
signal travel_completed(destination: String)
signal travel_interrupted(reason: String)
signal movement_points_changed(old_value: int, new_value: int)

## Tipi di location
enum LocationType {
	SETTLEMENT,
	DUNGEON,
	WILDERNESS,
	LANDMARK,
	RESOURCE_NODE,
	DANGER_ZONE
}

## Stato del viaggio
enum TravelState {
	IDLE,
	TRAVELING,
	RANDOM_ENCOUNTER,
	ARRIVAL
}

@export var current_state: TravelState = TravelState.IDLE
@export var debug_mode: bool = false

# Riferimenti ai sistemi
var game_manager: GameManager
var player: Player
var event_manager: EventManager

# Stato della mappa
var current_location: String = "starting_camp"
var discovered_locations: Array[String] = []
var location_database: Dictionary = {}

# Sistema movimento
var movement_points: int = 100
var max_movement_points: int = 100
var travel_destination: String = ""
var travel_progress: float = 0.0
var travel_total_time: float = 0.0

# Sistema incontri casuali
var encounter_chance: float = 0.2
var last_encounter_location: String = ""

func _ready():
	print("🗺️ MapManager inizializzato")
	_initialize_map_system()
	_load_location_database()

## Inizializza sistema mappa
func _initialize_map_system():
	# Trova riferimenti ai sistemi
	game_manager = get_node("../GameManager") if get_node_or_null("../GameManager") else null
	player = get_node("../../WorldContainer/Player") if get_node_or_null("../../WorldContainer/Player") else null
	event_manager = get_node("../EventManager") if get_node_or_null("../EventManager") else null
	
	# Connetti segnali
	if game_manager:
		game_manager.game_state_changed.connect(_on_game_state_changed)
	
	if player:
		player.stats_changed.connect(_on_player_stats_changed)
	
	# Aggiungi location iniziale alle scoperte
	discovered_locations.append(current_location)
	
	print("🗺️ Sistema mappa collegato ai sistemi principali")

## Carica database location
func _load_location_database():
	location_database = {
		"starting_camp": {
			"id": "starting_camp",
			"name": "Campo Base",
			"type": LocationType.SETTLEMENT,
			"description": "Il tuo piccolo accampamento di partenza. Sicuro ma limitato nelle risorse.",
			"danger_level": 0,
			"resources": ["water", "basic_shelter"],
			"connected_locations": ["wasteland_outskirts", "abandoned_road"],
			"events": [],
			"discovered": true,
			"position": Vector2(0, 0)
		},
		
		"wasteland_outskirts": {
			"id": "wasteland_outskirts",
			"name": "Periferia della Landa",
			"type": LocationType.WILDERNESS,
			"description": "Zone abbandonate ai margini della civilizzazione. Potrebbero nascondere tesori... o pericoli.",
			"danger_level": 2,
			"resources": ["scrap_metal", "wild_food"],
			"connected_locations": ["starting_camp", "ruined_settlement", "dangerous_pass"],
			"events": ["strange_chest", "bandito_encounter"],
			"discovered": false,
			"position": Vector2(-1, 1),
			"travel_cost": 15
		},
		
		"abandoned_road": {
			"id": "abandoned_road",
			"name": "Strada Abbandonata",
			"type": LocationType.LANDMARK,
			"description": "Una vecchia strada asfaltata, ora coperta di erbacce. Più sicura per viaggiare.",
			"danger_level": 1,
			"resources": ["safe_passage"],
			"connected_locations": ["starting_camp", "ruined_gas_station", "bridge_crossing"],
			"events": ["water_source"],
			"discovered": false,
			"position": Vector2(1, 0),
			"travel_cost": 10
		},
		
		"ruined_settlement": {
			"id": "ruined_settlement",
			"name": "Insediamento in Rovina",
			"type": LocationType.SETTLEMENT,
			"description": "Resti di un piccolo paese. Potrebbe contenere provviste utili.",
			"danger_level": 3,
			"resources": ["canned_food", "medical_supplies", "tools"],
			"connected_locations": ["wasteland_outskirts", "underground_bunker"],
			"events": ["bandito_encounter", "strange_chest"],
			"discovered": false,
			"position": Vector2(-2, 2),
			"travel_cost": 25
		},
		
		"ruined_gas_station": {
			"id": "ruined_gas_station",
			"name": "Stazione di Servizio Rovinata",
			"type": LocationType.RESOURCE_NODE,
			"description": "Una vecchia stazione di servizio. Potrebbe avere carburante o parti meccaniche.",
			"danger_level": 2,
			"resources": ["fuel", "mechanical_parts", "water"],
			"connected_locations": ["abandoned_road", "highway_junction"],
			"events": ["strange_chest"],
			"discovered": false,
			"position": Vector2(2, 0),
			"travel_cost": 20
		},
		
		"dangerous_pass": {
			"id": "dangerous_pass",
			"name": "Passo Pericoloso",
			"type": LocationType.DANGER_ZONE,
			"description": "Un passaggio montano infestato da predatori. Molto rischioso ma potrebbe portare a zone inesplorate.",
			"danger_level": 5,
			"resources": ["rare_materials"],
			"connected_locations": ["wasteland_outskirts", "hidden_valley"],
			"events": ["bandito_encounter"],
			"discovered": false,
			"position": Vector2(-1, 3),
			"travel_cost": 40
		},
		
		"underground_bunker": {
			"id": "underground_bunker",
			"name": "Bunker Sotterraneo",
			"type": LocationType.DUNGEON,
			"description": "Un vecchio bunker militare. Potrebbe contenere equipaggiamento di valore.",
			"danger_level": 4,
			"resources": ["military_gear", "medical_supplies", "ammunition"],
			"connected_locations": ["ruined_settlement"],
			"events": [],
			"discovered": false,
			"position": Vector2(-2, 3),
			"travel_cost": 35
		}
	}
	
	print("🗺️ Database location caricato: ", location_database.size(), " location")

## Viaggia verso una destinazione
func travel_to(destination_id: String) -> bool:
	if current_state != TravelState.IDLE:
		print("❌ Viaggio già in corso!")
		return false
	
	if destination_id == current_location:
		print("❌ Sei già in questa location!")
		return false
	
	if not location_database.has(destination_id):
		print("❌ Location non trovata: ", destination_id)
		return false
	
	if not _can_travel_to(destination_id):
		print("❌ Non puoi viaggiare verso questa destinazione")
		return false
	
	var destination = location_database[destination_id]
	var travel_cost = destination.get("travel_cost", 20)
	
	if movement_points < travel_cost:
		print("❌ Punti movimento insufficienti: ", movement_points, "/", travel_cost)
		return false
	
	# Inizia viaggio
	current_state = TravelState.TRAVELING
	travel_destination = destination_id
	travel_progress = 0.0
	travel_total_time = travel_cost
	
	# Consuma punti movimento
	_consume_movement_points(travel_cost)
	
	print("🗺️ Iniziando viaggio verso: ", destination.get("name", destination_id))
	
	# Notifica inizio viaggio
	travel_started.emit(destination_id, travel_cost)
	
	# Aggiorna GameManager
	if game_manager:
		game_manager.change_state("TRAVELING")
	
	# Avvia processo di viaggio
	_process_travel()
	
	return true

## Processa il viaggio
func _process_travel():
	if current_state != TravelState.TRAVELING:
		return
	
	# Simula tempo di viaggio (in secondi reali = minuti di gioco)
	var travel_speed = 1.0  # 1 secondo reale = 1 punto movimento
	travel_progress += travel_speed
	
	# Controlla per incontri casuali
	if randf() < encounter_chance and last_encounter_location != travel_destination:
		_trigger_travel_encounter()
		return
	
	# Completa viaggio se raggiunto
	if travel_progress >= travel_total_time:
		_complete_travel()
	else:
		# Continua il viaggio
		await get_tree().create_timer(1.0).timeout
		_process_travel()

## Attiva incontro durante viaggio
func _trigger_travel_encounter():
	current_state = TravelState.RANDOM_ENCOUNTER
	last_encounter_location = travel_destination
	
	print("🗺️ Incontro casuale durante il viaggio!")
	
	# Usa EventManager per attivare evento casuale
	if event_manager:
		# Connetti segnale per riprendere viaggio dopo evento
		if not event_manager.event_ended.is_connected(_on_travel_event_ended):
			event_manager.event_ended.connect(_on_travel_event_ended)
		
		event_manager.trigger_random_event()
	else:
		# Fallback se EventManager non disponibile
		print("⚠️ EventManager non disponibile, continua viaggio")
		_resume_travel()

## Riprende viaggio dopo evento
func _resume_travel():
	if current_state == TravelState.RANDOM_ENCOUNTER:
		current_state = TravelState.TRAVELING
		_process_travel()

## Completa il viaggio
func _complete_travel():
	var old_location = current_location
	current_location = travel_destination
	current_state = TravelState.IDLE
	
	# Scopri la location se non già scoperta
	if not discovered_locations.has(current_location):
		_discover_location(current_location)
	
	print("🗺️ Viaggio completato! Sei arrivato a: ", get_location_name(current_location))
	
	# Notifiche
	travel_completed.emit(travel_destination)
	location_changed.emit(old_location, current_location)
	
	# Reset variabili viaggio
	travel_destination = ""
	travel_progress = 0.0
	travel_total_time = 0.0
	
	# Ritorna al GameManager
	if game_manager:
		game_manager.change_state("PLAYING")
	
	# Controlla per eventi location-specific
	_check_location_events()

## Scopre una nuova location
func _discover_location(location_id: String):
	if location_id in discovered_locations:
		return
	
	discovered_locations.append(location_id)
	
	if location_database.has(location_id):
		var location_data = location_database[location_id]
		print("🌟 Nuova location scoperta: ", location_data.get("name", location_id))
		location_discovered.emit(location_id, location_data)
		
		# Aggiungi EXP per scoperta
		if player:
			player.add_experience(5)

## Controlla eventi specifici della location
func _check_location_events():
	if not location_database.has(current_location):
		return
	
	var location = location_database[current_location]
	var location_events = location.get("events", [])
	
	if location_events.is_empty():
		return
	
	# Possibilità di evento location-specific (30%)
	if randf() < 0.3:
		var random_event = location_events[randi() % location_events.size()]
		
		if event_manager:
			await get_tree().create_timer(1.0).timeout  # Pausa breve
			event_manager.start_event(random_event)

## Verifica se può viaggiare verso destinazione
func _can_travel_to(destination_id: String) -> bool:
	if not location_database.has(current_location) or not location_database.has(destination_id):
		return false
	
	var current_loc = location_database[current_location]
	var connected = current_loc.get("connected_locations", [])
	
	return destination_id in connected

## Consuma punti movimento
func _consume_movement_points(amount: int):
	var old_value = movement_points
	movement_points = max(0, movement_points - amount)
	movement_points_changed.emit(old_value, movement_points)
	
	if debug_mode:
		print("🗺️ Punti movimento: ", old_value, " → ", movement_points)

## Ripristina punti movimento
func restore_movement_points(amount: int):
	var old_value = movement_points
	movement_points = min(max_movement_points, movement_points + amount)
	movement_points_changed.emit(old_value, movement_points)
	
	if debug_mode:
		print("🗺️ Punti movimento ripristinati: ", old_value, " → ", movement_points)

## Ripristino completo (riposo)
func rest_and_restore():
	restore_movement_points(max_movement_points)
	
	# Ripristina anche HP e risorse del player se disponibile
	if player:
		player.heal(10, "rest")
		player.food = min(100, player.food + 5)
		player.water = min(100, player.water + 5)
	
	print("🗺️ Riposato al ", get_location_name(current_location))

## Ottiene informazioni location corrente
func get_current_location_data() -> Dictionary:
	if location_database.has(current_location):
		return location_database[current_location]
	return {}

## Ottiene nome location
func get_location_name(location_id: String) -> String:
	if location_database.has(location_id):
		return location_database[location_id].get("name", location_id)
	return "Location sconosciuta"

## Ottiene description location
func get_location_description(location_id: String) -> String:
	if location_database.has(location_id):
		return location_database[location_id].get("description", "Nessuna descrizione disponibile.")
	return "Location non trovata."

## Ottiene location collegata alla corrente
func get_connected_locations() -> Array:
	var connected = []
	
	if location_database.has(current_location):
		var current_loc = location_database[current_location]
		var connected_ids = current_loc.get("connected_locations", [])
		
		for loc_id in connected_ids:
			if location_database.has(loc_id):
				var loc_data = location_database[loc_id]
				connected.append({
					"id": loc_id,
					"name": loc_data.get("name", loc_id),
					"travel_cost": loc_data.get("travel_cost", 20),
					"danger_level": loc_data.get("danger_level", 1),
					"discovered": loc_id in discovered_locations
				})
	
	return connected

## Ottiene tutte le location scoperte
func get_discovered_locations() -> Array:
	var discovered = []
	
	for loc_id in discovered_locations:
		if location_database.has(loc_id):
			var loc_data = location_database[loc_id]
			discovered.append({
				"id": loc_id,
				"name": loc_data.get("name", loc_id),
				"type": LocationType.keys()[loc_data.get("type", 0)],
				"danger_level": loc_data.get("danger_level", 1)
			})
	
	return discovered

## Fast travel (se disponibile)
func fast_travel_to(destination_id: String) -> bool:
	# Fast travel disponibile solo per location scoperte e sicure
	if not destination_id in discovered_locations:
		print("❌ Non puoi viaggiare velocemente verso location non scoperte")
		return false
	
	if not location_database.has(destination_id):
		return false
	
	var destination = location_database[destination_id]
	var danger_level = destination.get("danger_level", 1)
	
	# Fast travel solo per location a basso pericolo
	if danger_level > 2:
		print("❌ Troppo pericoloso per viaggio veloce")
		return false
	
	# Costo ridotto per fast travel
	var travel_cost = int(destination.get("travel_cost", 20) * 0.5)
	
	if movement_points < travel_cost:
		print("❌ Punti movimento insufficienti per viaggio veloce")
		return false
	
	# Viaggio istantaneo
	var old_location = current_location
	current_location = destination_id
	_consume_movement_points(travel_cost)
	
	print("⚡ Viaggio veloce completato verso: ", get_location_name(destination_id))
	
	location_changed.emit(old_location, current_location)
	
	return true

## Signal handlers
func _on_game_state_changed(new_state: String):
	if new_state != "TRAVELING" and current_state == TravelState.TRAVELING:
		# Viaggio interrotto
		travel_interrupted.emit("state_change")
		current_state = TravelState.IDLE

func _on_player_stats_changed(stat: String, old_val: int, new_val: int):
	# Possibili modifiche basate su stats player
	if stat == "agi" and new_val > old_val:
		# Agilità aumentata = movimento più efficiente
		max_movement_points = 100 + (new_val - 10) * 2

func _on_travel_event_ended(event_id: String, result: Dictionary):
	# Disconnetti segnale
	if event_manager and event_manager.event_ended.is_connected(_on_travel_event_ended):
		event_manager.event_ended.disconnect(_on_travel_event_ended)
	
	# Riprendi viaggio
	_resume_travel()

## Utility per testing
func debug_discover_all_locations():
	for loc_id in location_database.keys():
		if not loc_id in discovered_locations:
			_discover_location(loc_id)

func debug_restore_movement():
	restore_movement_points(max_movement_points)

## Stato per debugging
func get_map_status() -> Dictionary:
	return {
		"current_location": current_location,
		"current_location_name": get_location_name(current_location),
		"travel_state": TravelState.keys()[current_state],
		"movement_points": movement_points,
		"max_movement_points": max_movement_points,
		"discovered_locations": discovered_locations.size(),
		"total_locations": location_database.size(),
		"travel_destination": travel_destination,
		"travel_progress": travel_progress if current_state == TravelState.TRAVELING else 0.0
	} 
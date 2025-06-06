extends Node
class_name EventManager

## EventManager per SafePlace
## Gestisce eventi narrativi, scelte multiple e conseguenze

signal event_started(event_data: Dictionary)
signal event_ended(event_id: String, result: Dictionary)
signal choice_presented(choices: Array)
signal choice_made(choice_index: int, choice_data: Dictionary)
signal narrative_updated(text: String)
signal achievement_unlocked(achievement_id: String)  # FUTURE: Sistema achievements Session #009+

## Tipi di eventi
enum EventType {
	RANDOM_ENCOUNTER,
	LOCATION_SPECIFIC,
	STORY_PROGRESSION,
	CHARACTER_INTERACTION,
	SURVIVAL_EVENT,
	SPECIAL_CONDITION
}

## Stati dell'evento
enum EventState {
	INACTIVE,
	PRESENTING,
	WAITING_CHOICE,
	PROCESSING,
	COMPLETED
}

@export var current_state: EventState = EventState.INACTIVE
@export var debug_mode: bool = false

# Riferimenti ai sistemi
var game_manager: GameManager
var player: Player
var item_database: ItemDatabase

# Evento corrente
var current_event: Dictionary = {}
var event_history: Array[String] = []
var story_flags: Dictionary = {}

# Database eventi (semplificato per ora)
var events_database: Dictionary = {}

func _ready():
	print("📖 EventManager inizializzato")
	_initialize_event_system()
	_load_events_database()

## Inizializza sistema eventi
func _initialize_event_system():
	# Trova riferimenti ai sistemi
	game_manager = get_node("../GameManager") if get_node_or_null("../GameManager") else null
	player = get_node("../../WorldContainer/Player") if get_node_or_null("../../WorldContainer/Player") else null
	
	if game_manager and game_manager.has_method("get_item_database"):
		item_database = game_manager.get_item_database()
	
	# Connetti segnali
	if game_manager:
		game_manager.game_state_changed.connect(_on_game_state_changed)
	
	if player:
		player.stats_changed.connect(_on_player_stats_changed)
	
	print("📖 Sistema eventi collegato ai sistemi principali")

## Carica database eventi
func _load_events_database():
	# Database eventi integrato (in futuro da file JSON)
	events_database = {
		"bandito_encounter": {
			"id": "bandito_encounter",
			"name": "Incontro con Bandito",
			"type": EventType.RANDOM_ENCOUNTER,
			"description": "Un bandito ti blocca la strada, impugnando un coltello arrugginito.",
			"image": "",
			"conditions": {},
			"choices": [
				{
					"text": "Attaccalo",
					"requirements": {},
					"consequences": {
						"action": "start_combat",
						"data": {
							"enemy": {
								"name": "Bandito",
								"max_hp": 40,
								"attack": 8,
								"defense": 2,
								"experience": 12
							}
						}
					}
				},
				{
					"text": "Cerca di persuaderlo",
					"requirements": {"inf": 12},
					"consequences": {
						"action": "skill_check",
						"stat": "inf",
						"difficulty": 12,
						"success": {
							"text": "Il bandito si convince e se ne va.",
							"rewards": {"experience": 8}
						},
						"failure": {
							"text": "Il bandito ride e ti attacca!",
							"action": "start_combat",
							"data": {
								"enemy": {
									"name": "Bandito Arrabbiato",
									"max_hp": 40,
									"attack": 10,
									"defense": 2,
									"experience": 12
								}
							}
						}
					}
				},
				{
					"text": "Scappa",
					"requirements": {"agi": 10},
					"consequences": {
						"action": "skill_check",
						"stat": "agi",
						"difficulty": 10,
						"success": {
							"text": "Riesci a scappare velocemente.",
							"rewards": {}
						},
						"failure": {
							"text": "Inciampi e il bandito ti raggiunge!",
							"action": "start_combat",
							"data": {
								"enemy": {
									"name": "Bandito",
									"max_hp": 40,
									"attack": 8,
									"defense": 2,
									"experience": 12
								}
							}
						}
					}
				},
				{
					"text": "Offri cibo",
					"requirements": {"food": 10},
					"consequences": {
						"action": "pay_cost",
						"cost": {"food": 10},
						"success": {
							"text": "Il bandito accetta il cibo e se ne va contento.",
							"rewards": {"experience": 5},
							"set_flag": "bandito_fed"
						}
					}
				}
			]
		},
		
		"strange_chest": {
			"id": "strange_chest",
			"name": "Cassa Misteriosa",
			"type": EventType.LOCATION_SPECIFIC,
			"description": "Trovi una cassa di metallo parzialmente sepolta. Sembra intatta.",
			"image": "",
			"conditions": {},
			"choices": [
				{
					"text": "Aprila con cautela",
					"requirements": {},
					"consequences": {
						"action": "random_outcome",
						"outcomes": [
							{
								"chance": 0.4,
								"text": "Dentro trovi una pozione di cura!",
								"rewards": {"items": {"health_potion": 1}}
							},
							{
								"chance": 0.3,
								"text": "La cassa contiene materiali utili.",
								"rewards": {"items": {"scrap_metal": 2}}
							},
							{
								"chance": 0.2,
								"text": "È vuota, ma ben conservata.",
								"rewards": {}
							},
							{
								"chance": 0.1,
								"text": "Un meccanismo scatta! Perdi HP.",
								"damage": 10
							}
						]
					}
				},
				{
					"text": "Ignorala e prosegui",
					"requirements": {},
					"consequences": {
						"action": "simple_result",
						"text": "Decidi di non rischiare e prosegui.",
						"rewards": {}
					}
				}
			]
		},
		
		"water_source": {
			"id": "water_source",
			"name": "Fonte d'Acqua",
			"type": EventType.SURVIVAL_EVENT,
			"description": "Trovi una piccola fonte d'acqua. L'acqua sembra pulita.",
			"image": "",
			"conditions": {},
			"choices": [
				{
					"text": "Bevi e riempi le scorte",
					"requirements": {},
					"consequences": {
						"action": "restore_resource",
						"resource": "water",
						"amount": 30,
						"text": "Ti disseti e riempi le tue scorte d'acqua."
					}
				},
				{
					"text": "Controlla prima la qualità",
					"requirements": {"tra": 10},
					"consequences": {
						"action": "skill_check",
						"stat": "tra",
						"difficulty": 10,
						"success": {
							"text": "L'acqua è pulita e sicura. Ti disseti completamente.",
							"action": "restore_resource",
							"resource": "water",
							"amount": 50
						},
						"failure": {
							"text": "Non sei sicuro della qualità, bevi con cautela.",
							"action": "restore_resource",
							"resource": "water",
							"amount": 20
						}
					}
				},
				{
					"text": "Non bere, troppo rischioso",
					"requirements": {},
					"consequences": {
						"action": "simple_result",
						"text": "Decidi di non rischiare e prosegui.",
						"rewards": {}
					}
				}
			]
		}
	}
	
	print("📖 Database eventi caricato: ", events_database.size(), " eventi")

## Avvia evento per ID
func start_event(event_id: String) -> bool:
	if current_state != EventState.INACTIVE:
		print("❌ Evento già in corso!")
		return false
	
	if not events_database.has(event_id):
		print("❌ Evento non trovato: ", event_id)
		return false
	
	current_event = events_database[event_id].duplicate(true)
	
	# Controlla condizioni evento
	if not _check_event_conditions(current_event.get("conditions", {})):
		print("❌ Condizioni evento non soddisfatte")
		return false
	
	current_state = EventState.PRESENTING
	
	print("📖 Avviando evento: ", current_event.get("name", event_id))
	
	# Notifica inizio evento
	event_started.emit(current_event)
	
	# Aggiorna GameManager
	if game_manager:
		game_manager.change_state("EVENT")
	
	# Presenta l'evento
	_present_event()
	
	return true

## Presenta evento al player
func _present_event():
	current_state = EventState.WAITING_CHOICE
	
	var description = current_event.get("description", "Evento senza descrizione")
	narrative_updated.emit(description)
	
	# Prepara scelte disponibili
	var available_choices = []
	var choices = current_event.get("choices", [])
	
	for i in range(choices.size()):
		var choice = choices[i]
		if _check_choice_requirements(choice.get("requirements", {})):
			available_choices.append({
				"index": i,
				"text": choice.get("text", "Scelta senza testo"),
				"available": true
			})
		else:
			available_choices.append({
				"index": i,
				"text": choice.get("text", "Scelta senza testo") + " (Requisiti non soddisfatti)",
				"available": false
			})
	
	choice_presented.emit(available_choices)
	
	if debug_mode:
		print("📖 Evento presentato: ", available_choices.size(), " scelte")

## Processa scelta del player
func make_choice(choice_index: int) -> bool:
	if current_state != EventState.WAITING_CHOICE:
		print("❌ Non è il momento di fare una scelta!")
		return false
	
	var choices = current_event.get("choices", [])
	if choice_index < 0 or choice_index >= choices.size():
		print("❌ Indice scelta non valido: ", choice_index)
		return false
	
	var choice = choices[choice_index]
	
	# Verifica requisiti
	if not _check_choice_requirements(choice.get("requirements", {})):
		print("❌ Requisiti per la scelta non soddisfatti")
		return false
	
	current_state = EventState.PROCESSING
	
	# Notifica scelta
	choice_made.emit(choice_index, choice)
	
	# Processa conseguenze
	_process_consequences(choice.get("consequences", {}))
	
	return true

## Processa conseguenze della scelta
func _process_consequences(consequences: Dictionary):
	var action = consequences.get("action", "")
	
	match action:
		"start_combat":
			_start_combat_from_event(consequences.get("data", {}))
		"skill_check":
			_process_skill_check(consequences)
		"pay_cost":
			_process_pay_cost(consequences)
		"random_outcome":
			_process_random_outcome(consequences)
		"restore_resource":
			_process_restore_resource(consequences)
		"simple_result":
			_process_simple_result(consequences)
		_:
			print("❌ Azione sconosciuta: ", action)
			_end_event({})

## Avvia combattimento da evento
func _start_combat_from_event(data: Dictionary):
	if not game_manager or not game_manager.has_method("start_combat"):
		print("❌ Sistema combattimento non disponibile")
		_end_event({})
		return
	
	var enemy_data = data.get("enemy", {})
	
	# Registra per gestire fine combattimento
	if game_manager.has_signal("combat_ended"):
		if not game_manager.combat_ended.is_connected(_on_combat_ended_from_event):
			game_manager.combat_ended.connect(_on_combat_ended_from_event)
	
	# Avvia combattimento tramite GameManager
	game_manager.start_combat(enemy_data)

## Processa skill check
func _process_skill_check(consequences: Dictionary):
	var stat = consequences.get("stat", "")
	var difficulty = consequences.get("difficulty", 10)
	
	if not player:
		print("❌ Player non disponibile per skill check")
		_end_event({})
		return
	
	var player_stat = _get_player_stat(stat)
	var roll = randi_range(1, 20)
	var total = player_stat + roll
	var success = total >= difficulty
	
	var result_text = ""
	if success:
		result_text = "Skill check riuscito! (" + str(total) + " vs " + str(difficulty) + ")"
		var success_data = consequences.get("success", {})
		_apply_result(success_data)
	else:
		result_text = "Skill check fallito. (" + str(total) + " vs " + str(difficulty) + ")"
		var failure_data = consequences.get("failure", {})
		_apply_result(failure_data)
	
	narrative_updated.emit(result_text)
	
	if debug_mode:
		print("📖 Skill check: ", stat, " ", total, " vs ", difficulty, " = ", success)

## Processa pagamento costo
func _process_pay_cost(consequences: Dictionary):
	var cost = consequences.get("cost", {})
	
	if not player:
		_end_event({})
		return
	
	# Verifica se può pagare
	var can_pay = true
	for resource in cost:
		var required = cost[resource]
		var current = _get_player_stat(resource)
		if current < required:
			can_pay = false
			break
	
	if can_pay:
		# Paga il costo
		for resource in cost:
			var amount = cost[resource]
			_set_player_stat(resource, _get_player_stat(resource) - amount)
		
		var success_data = consequences.get("success", {})
		_apply_result(success_data)
	else:
		narrative_updated.emit("Non hai abbastanza risorse per questa scelta.")
		_end_event({})

## Processa outcome casuale
func _process_random_outcome(consequences: Dictionary):
	var outcomes = consequences.get("outcomes", [])
	
	if outcomes.is_empty():
		_end_event({})
		return
	
	var roll = randf()
	var cumulative_chance = 0.0
	
	for outcome in outcomes:
		cumulative_chance += outcome.get("chance", 0.0)
		if roll <= cumulative_chance:
			_apply_result(outcome)
			return
	
	# Fallback al primo outcome
	_apply_result(outcomes[0])

## Processa ripristino risorsa
func _process_restore_resource(consequences: Dictionary):
	if not player:
		_end_event({})
		return
	
	var resource = consequences.get("resource", "")
	var amount = consequences.get("amount", 0)
	var text = consequences.get("text", "Risorsa ripristinata.")
	
	if resource == "water":
		player.water = min(100, player.water + amount)
	elif resource == "food":
		player.food = min(100, player.food + amount)
	elif resource == "hp":
		player.heal(amount, "event")
	
	narrative_updated.emit(text)
	_end_event({"resource_restored": resource, "amount": amount})

## Processa risultato semplice
func _process_simple_result(consequences: Dictionary):
	var text = consequences.get("text", "Evento completato.")
	var rewards = consequences.get("rewards", {})
	
	narrative_updated.emit(text)
	_apply_rewards(rewards)
	_end_event(rewards)

## Applica risultato
func _apply_result(result_data: Dictionary):
	var text = result_data.get("text", "")
	if not text.is_empty():
		narrative_updated.emit(text)
	
	# Applica ricompense
	var rewards = result_data.get("rewards", {})
	_apply_rewards(rewards)
	
	# Gestisci azioni aggiuntive
	if result_data.has("action"):
		_process_consequences(result_data)
	else:
		_end_event(rewards)

## Applica ricompense
func _apply_rewards(rewards: Dictionary):
	if not player:
		return
	
	# Esperienza
	if rewards.has("experience"):
		player.add_experience(rewards["experience"])
	
	# Oggetti
	if rewards.has("items"):
		var items = rewards["items"]
		for item_id in items:
			var quantity = items[item_id]
			player.add_item_to_inventory(item_id, quantity)

## Verifica condizioni evento
func _check_event_conditions(conditions: Dictionary) -> bool:
	if not player:
		return false
	
	for condition in conditions:
		var required_value = conditions[condition]
		var current_value = _get_player_stat(condition)
		
		if current_value < required_value:
			return false
	
	return true

## Verifica requisiti scelta
func _check_choice_requirements(requirements: Dictionary) -> bool:
	if not player:
		return false
	
	for requirement in requirements:
		var required_value = requirements[requirement]
		var current_value = _get_player_stat(requirement)
		
		if current_value < required_value:
			return false
	
	return true

## Termina evento
func _end_event(result: Dictionary):
	var event_id = current_event.get("id", "unknown")
	
	# Aggiungi alla storia
	event_history.append(event_id)
	
	# Segnale di fine evento
	event_ended.emit(event_id, result)
	
	# Reset stato
	current_state = EventState.INACTIVE
	current_event.clear()
	
	# Ritorna al GameManager
	if game_manager:
		game_manager.change_state("PLAYING")
	
	if debug_mode:
		print("📖 Evento terminato: ", event_id)

## Signal handlers
func _on_game_state_changed(new_state):
	# new_state è GameManager.GameState enum, non string
	if new_state != GameManager.GameState.EVENT and current_state != EventState.INACTIVE:
		# Evento interrotto
		_end_event({})

func _on_player_stats_changed(_stat: String, _old_val: int, _new_val: int):
	# Possibili eventi triggered da cambio stats
	pass

func _on_combat_ended_from_event(result: String, rewards: Dictionary):
	# Disconnetti il segnale
	if game_manager and game_manager.combat_ended.is_connected(_on_combat_ended_from_event):
		game_manager.combat_ended.disconnect(_on_combat_ended_from_event)
	
	# Applica ricompense del combattimento
	if result == "victory":
		_apply_rewards(rewards)
		narrative_updated.emit("Hai vinto il combattimento!")
	elif result == "defeat":
		narrative_updated.emit("Sei stato sconfitto...")
	elif result == "fled":
		narrative_updated.emit("Sei fuggito dal combattimento.")
	
	_end_event(rewards)

## Avvia evento casuale
func trigger_random_event() -> bool:
	var random_events = ["bandito_encounter", "strange_chest", "water_source"]
	var random_event = random_events[randi() % random_events.size()]
	
	return start_event(random_event)

## Ottiene eventi disponibili per location
func get_location_events(_location_id: String) -> Array:
	var location_events = []
	
	for event_id in events_database:
		var event_data = events_database[event_id]
		# Gestione type-safe: il tipo può essere int (enum) o string
		var event_type = event_data.get("type", EventType.RANDOM_ENCOUNTER)
		var is_location_specific = false
		
		# Confronto type-safe per enum/string
		if typeof(event_type) == TYPE_INT:
			is_location_specific = (event_type == EventType.LOCATION_SPECIFIC)
		elif typeof(event_type) == TYPE_STRING:
			is_location_specific = (event_type == "LOCATION_SPECIFIC")
		
		if is_location_specific:
			if _check_event_conditions(event_data.get("conditions", {})):
				location_events.append(event_id)
	
	return location_events

## Stato per debugging
func get_event_status() -> Dictionary:
	return {
		"state": EventState.keys()[current_state],
		"current_event": current_event.get("id", "none"),
		"events_in_database": events_database.size(),
		"events_completed": event_history.size(),
		"story_flags": story_flags
	}

## Helper functions per accesso sicuro alle statistiche del player
func _get_player_stat(stat: String) -> int:
	if not player:
		return 0
	
	match stat:
		"hp":
			return player.hp
		"max_hp":
			return player.max_hp
		"food":
			return player.food
		"water":
			return player.water
		"exp":
			return player.exp
		"level":
			return player.level
		"pts":
			return player.pts
		"vig":
			return player.vig
		"pot":
			return player.pot
		"agi":
			return player.agi
		"tra":
			return player.tra
		"inf":
			return player.inf
		"pre":
			return player.pre
		"ada":
			return player.ada
		_:
			print("❌ Stat sconosciuta: ", stat)
			return 0

func _set_player_stat(stat: String, value: int):
	if not player:
		return
	
	match stat:
		"hp":
			player.hp = max(0, value)
		"max_hp":
			player.max_hp = max(1, value)
		"food":
			player.food = clamp(value, 0, 100)
		"water":
			player.water = clamp(value, 0, 100)
		"exp":
			player.exp = max(0, value)
		"level":
			player.level = max(1, value)
		"pts":
			player.pts = max(0, value)
		"vig":
			player.vig = max(0, value)
		"pot":
			player.pot = max(0, value)
		"agi":
			player.agi = max(0, value)
		"tra":
			player.tra = max(0, value)
		"inf":
			player.inf = max(0, value)
		"pre":
			player.pre = max(0, value)
		"ada":
			player.ada = max(0, value)
		_:
			print("❌ Impossibile impostare stat sconosciuta: ", stat) 
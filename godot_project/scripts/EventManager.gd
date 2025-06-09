extends Node
class_name EventManager

## EventManager per SafePlace - Sistema Eventi Narrativi V2
## Basato su event_database_v2.js (944 righe, ~12 eventi complessi)
## FASE 3: Eventi Narrativi Multi-Branch con Reputation System
## + SISTEMA LORE LINEARE: 10 eventi timeline di Ultimo

# Database eventi in memoria
var _events: Dictionary = {}
var _event_categories: Dictionary = {}
var _active_events: Array[Dictionary] = []
var _completed_events: Array[String] = []

# Reputation system per fazioni
var _faction_reputation: Dictionary = {
	"scientists": 0,
	"military": 0,
	"survivors": 0,
	"rebels": 0,
	"traders": 0
}

# Player flags e world state
var _player_flags: Array[String] = []
var _world_state: Dictionary = {}
var _quest_progress: Dictionary = {}

# ===== NUOVO: SISTEMA LORE LINEARE =====
var _lore_events: Array[Dictionary] = []
var _seen_lore_events: Array[String] = []
var _lore_flags: Array[String] = []
var _current_lore_sequence: int = 1 # Traccia evento corrente 1→10
var _last_lore_event_time: float = 0.0

# Coordinate Safe Place (E) per calcolo distanza
const SAFE_PLACE_X = 190
const SAFE_PLACE_Y = 190

# Segnali per comunicazione
signal event_triggered(event_data: Dictionary)
signal choice_made(choice_id: String, outcome: Dictionary)
signal reputation_changed(faction: String, change: int, new_value: int)
signal quest_updated(quest_id: String, new_step: int)
# NUOVO: Segnali lore events
signal lore_event_triggered(event_data: Dictionary)
signal lore_choice_made(choice_id: String, outcome: Dictionary)

func _init():
	print("📖 EventManager inizializzato - Sistema Eventi V2 + Lore Linear")

## Carica il database eventi da JavaScript
func load_event_database() -> bool:
	print("🔥 Caricamento Event Database V2 da JavaScript...")

	var js_file_path = "js/events_v2/event_database_v2.js"
	var file = FileAccess.open(js_file_path, FileAccess.READ)

	if not file:
		print("❌ ERRORE: Impossibile aprire ", js_file_path)
		return false

	var js_content = file.get_as_text()
	file.close()

	print("📄 File JavaScript letto: ", js_content.length(), " caratteri")

	# Parse database eventi
	var events_data = _parse_event_database(js_content)

	if events_data.is_empty():
		print("❌ ERRORE: Nessun evento trovato nel database")
		return false

	_events = events_data
	_build_category_indexes()

	print("✅ Event Database caricato: ", _events.size(), " eventi")
	return true

## Parse il database eventi dal JavaScript
func _parse_event_database(js_content: String) -> Dictionary:
	print("🔍 Parsing Event Database JavaScript...")

	# Trova EVENT_DATABASE_V2
	var start_marker = "const EVENT_DATABASE_V2 = {"
	var start_index = js_content.find(start_marker)

	if start_index == -1:
		print("❌ ERRORE: EVENT_DATABASE_V2 non trovato")
		return {}

	# Trova la fine del database (bilancia parentesi)
	var brace_count = 0
	var content_start = start_index + start_marker.length() - 1
	var content_end = -1

	for i in range(content_start, js_content.length()):
		var char = js_content[i]
		if char == '{':
			brace_count += 1
		elif char == '}':
			brace_count -= 1
			if brace_count == 0:
				content_end = i + 1
				break

	if content_end == -1:
		print("❌ ERRORE: Fine EVENT_DATABASE_V2 non trovata")
		return {}

	var db_block = js_content.substr(content_start, content_end - content_start)
	print("🎯 Estratto database eventi: ", db_block.length(), " caratteri")

	# Converte JavaScript in Dictionary Godot
	return _convert_event_database(db_block)

## Converte il database eventi da JavaScript a Godot
func _convert_event_database(js_db: String) -> Dictionary:
	print("🔄 Conversione Event Database JavaScript → Godot...")

	var events: Dictionary = {}

	# Parsing per categorie (environmental, character, questlines)
	var categories = ["environmental", "character", "questlines"]

	for category in categories:
		var category_events = _parse_event_category(js_db, category)
		for event_id in category_events:
			events[event_id] = category_events[event_id]

	print("✅ Convertiti ", events.size(), " eventi")
	return events

## Parse una categoria specifica di eventi
func _parse_event_category(js_content: String, category: String) -> Dictionary:
	var category_events: Dictionary = {}

	# Trova la sezione categoria
	var category_marker = category + ": {"
	var category_start = js_content.find(category_marker)

	if category_start == -1:
		return category_events

	# Pattern regex per trovare eventi individuali
	var event_pattern = RegEx.new()
	event_pattern.compile("\"([^\"]+)\"\\s*:\\s*\\{")

	var search_start = category_start
	var results = event_pattern.search_all(js_content.substr(search_start, 2000))

	for result in results:
		var event_id = result.get_string(1)
		if event_id != category: # Skip category name itself
			var event_data = _parse_individual_event(js_content, event_id, search_start)
			if not event_data.is_empty():
				category_events[event_id] = event_data

	print("📊 Categoria '%s': %d eventi" % [category, category_events.size()])
	return category_events

## Parse un singolo evento dal JavaScript
func _parse_individual_event(js_content: String, event_id: String, start_pos: int) -> Dictionary:
	var event_data: Dictionary = {
		"id": event_id,
		"title": "",
		"description": "",
		"category": "",
		"tier": 1,
		"priority": 5,
		"triggers": {},
		"branches": {}
	}

	# Trova il blocco dell'evento specifico
	var event_start = js_content.find("\"" + event_id + "\":", start_pos)
	if event_start == -1:
		return {}

	# Per ora, parsing semplificato - implementazione completa quando necessario
	event_data.title = _extract_string_value(js_content, "title", event_start)
	event_data.description = _extract_string_value(js_content, "description", event_start)
	event_data.category = _extract_string_value(js_content, "category", event_start)
	event_data.tier = _extract_number_value(js_content, "tier", event_start)

	return event_data

## Helper: estrae valore stringa dal JavaScript
func _extract_string_value(js_content: String, field: String, start_pos: int) -> String:
	var pattern = field + ":\\s*[\"']([^\"']+)[\"']"
	var regex = RegEx.new()
	regex.compile(pattern)

	var result = regex.search(js_content.substr(start_pos, 500))
	if result:
		return result.get_string(1)
	return ""

## Helper: estrae valore numerico dal JavaScript
func _extract_number_value(js_content: String, field: String, start_pos: int) -> int:
	var pattern = field + ":\\s*(\\d+)"
	var regex = RegEx.new()
	regex.compile(pattern)

	var result = regex.search(js_content.substr(start_pos, 500))
	if result:
		return result.get_string(1).to_int()
	return 0

## Costruisce indici per categorie
func _build_category_indexes():
	_event_categories.clear()

	for event_id in _events:
		var event = _events[event_id]
		var category = event.get("category", "misc")

		if not _event_categories.has(category):
			_event_categories[category] = []

		_event_categories[category].append(event_id)

	print("📂 Categorie indicizzate: ", _event_categories.keys())

## API: Ottieni evento per ID
func get_event(event_id: String) -> Dictionary:
	return _events.get(event_id, {})

## API: Ottieni eventi per categoria
func get_events_by_category(category: String) -> Array:
	var category_event_ids = _event_categories.get(category, [])
	var events_list = []

	for event_id in category_event_ids:
		events_list.append(_events[event_id])

	return events_list

## API: Controlla se evento è disponibile per trigger
func can_trigger_event(event_id: String, player_context: Dictionary) -> bool:
	var event = get_event(event_id)
	if event.is_empty():
		return false

	var triggers = event.get("triggers", {})

	# Check flags requirements
	var requires = triggers.get("requires", [])
	for flag in requires:
		if flag.begins_with("!"):
			# Flag negato
			if has_flag(flag.substr(1)):
				return false
		else:
			# Flag richiesto
			if not has_flag(flag):
				return false

	# Check stats requirements
	var stats_req = triggers.get("player_stats", {})
	for stat in stats_req:
		var requirement = stats_req[stat]
		var player_stat = player_context.get(stat, 0)

		if requirement.has("min") and player_stat < requirement.min:
			return false
		if requirement.has("max") and player_stat > requirement.max:
			return false

	return true

## API: Trigger evento
func trigger_event(event_id: String, player_context: Dictionary) -> bool:
	if not can_trigger_event(event_id, player_context):
		return false

	var event = get_event(event_id)
	_active_events.append(event)

	print("🎭 Evento triggered: ", event.title)
	event_triggered.emit(event)

	return true

## API: Sistema flags
func has_flag(flag: String) -> bool:
	return flag in _player_flags

func set_flag(flag: String):
	if not has_flag(flag):
		_player_flags.append(flag)
		print("🏴 Flag impostato: ", flag)

func remove_flag(flag: String):
	_player_flags.erase(flag)
	print("🏴 Flag rimosso: ", flag)

## API: Sistema reputation
func get_reputation(faction: String) -> int:
	return _faction_reputation.get(faction, 0)

func change_reputation(faction: String, change: int):
	if not _faction_reputation.has(faction):
		_faction_reputation[faction] = 0

	var old_value = _faction_reputation[faction]
	_faction_reputation[faction] += change
	var new_value = _faction_reputation[faction]

	print("⚖️ Reputation %s: %d → %d (%+d)" % [faction, old_value, new_value, change])
	reputation_changed.emit(faction, change, new_value)

## API: Quest progress tracking
func get_quest_progress(quest_id: String) -> int:
	return _quest_progress.get(quest_id, 0)

func set_quest_progress(quest_id: String, step: int):
	var old_step = get_quest_progress(quest_id)
	_quest_progress[quest_id] = step

	if step > old_step:
		print("📜 Quest '%s' progress: step %d → %d" % [quest_id, old_step, step])
		quest_updated.emit(quest_id, step)

## API: Statistiche sistema
func get_stats() -> Dictionary:
	return {
		"total_events": _events.size(),
		"categories": _event_categories.keys(),
		"active_events": _active_events.size(),
		"completed_events": _completed_events.size(),
		"player_flags": _player_flags.size(),
		"faction_reputation": _faction_reputation,
		"quest_progress": _quest_progress
	}

## Debug: Dump del database eventi
func debug_dump_events():
	print("🔍 === EVENT DATABASE DUMP ===")
	for category in _event_categories:
		print("📂 CATEGORIA: ", category)
		var events = get_events_by_category(category)
		for event in events:
			print("  🎭 %s: %s" % [event.get("id", "N/A"), event.get("title", "N/A")])
	print("🏁 === END DUMP ===")

## ===== NUOVO: CARICA I 10 EVENTI LORE LINEARI =====
func load_lore_events() -> bool:
	print("🎭 Caricamento 10 Eventi Lore Lineari di Ultimo...")

	# I 10 eventi narrativi della timeline principale - ORDINE LINEARE 1→10
	_lore_events = [
		{
			"id": "lore_01_echo_of_departure",
			"title": "1. L'Eco della Partenza",
			"description": "Nel rifugio che è stato la tua casa, trovi la lettera che tuo padre ha lasciato per te. La sua calligrafia tremante rivela l'urgenza: 'Ultimo, figlio mio... se stai leggendo queste parole, significa che non sono tornato in tempo. Il Safe Place esiste, l'ho visto nelle mappe militari prima che tutto crollasse. È la nostra unica speranza. Vai verso est, sempre verso est. Ti aspetterò là, o almeno ci proverò. Le scorte che ti ho lasciato stanno per finire. Devi partire. Sii forte, come ti ho insegnato. Con tutto l'amore che un padre può dare, papà.'",
			"trigger": {"type": "event_sequence", "event_number": 1},
			"choices": [
				{
					"text": "Raccogli le tue cose e parti subito",
					"outcome": "Non c'è tempo da perdere. Prepari lo zaino con le ultime provviste e ti avvii verso l'ignoto. Il viaggio inizia ora.",
					"effects": [
						{"type": "add_lore_flag", "flag": "mission_accepted"},
						{"type": "add_lore_flag", "flag": "hasty_departure"}
					]
				},
				{
					"text": "Cerca altri indizi nel rifugio",
					"outcome": "Prima di partire, frugi tra le cose di tuo padre. Trovi una vecchia mappa militare segnata e alcune note sui pericoli del viaggio.",
					"effects": [
						{"type": "add_lore_flag", "flag": "mission_accepted"},
						{"type": "add_lore_flag", "flag": "careful_preparation"}
					]
				}
			],
			"priority": 1
		},
		{
			"id": "lore_02_first_trial_alone",
			"title": "2. La Prima Prova da Solo",
			"description": "La notte cade e sei completamente solo per la prima volta. Il freddo morde, la fame graffia, e ogni rumore nell'oscurità potrebbe essere la tua fine. Questa è la realtà che dovrai affrontare ogni giorno.",
			"trigger": {"type": "event_sequence", "event_number": 2},
			"requires_flags": ["mission_accepted"],
			"choices": [
				{
					"text": "Impara dai tuoi errori",
					"outcome": "Ogni difficoltà è una lezione. Domani sarai più forte.",
					"effects": [
						{"type": "add_lore_flag", "flag": "learned_survival"}
					]
				},
				{
					"text": "Rimpiangere il passato",
					"outcome": "I ricordi del mondo perduto sono dolci e amari insieme.",
					"effects": [
						{"type": "add_lore_flag", "flag": "nostalgic"}
					]
				}
			],
			"priority": 2
		},
		{
			"id": "lore_03_whispers_from_past",
			"title": "3. Sussurri dal Passato",
			"description": "In una casa abbandonata, nascosto sotto le assi del pavimento, trovi un piccolo carillon. È identico a quello che tua madre Lena ti regalò per il tuo decimo compleanno. Quando lo apri, la melodia familiare riempie l'aria, e per un momento il mondo torna com'era.",
			"trigger": {"type": "event_sequence", "event_number": 3},
			"requires_flags": ["learned_survival"],
			"choices": [
				{
					"text": "Conserva il carillon come ricordo",
					"outcome": "Lo stringi al petto. Alcuni ricordi valgono più del cibo o dell'acqua.",
					"effects": [
						{"type": "add_lore_flag", "flag": "has_mothers_memory"}
					]
				}
			],
			"priority": 3
		},
		{
			"id": "lore_04_shadow_of_others",
			"title": "4. L'Ombra degli Altri",
			"description": "Un gruppo di sopravvissuti ti circonda. Si fanno chiamare 'I Corvi' e vogliono tutto quello che hai. Ma il loro capo ti guarda strano quando vede il carillon. 'Lena...', sussurra. 'Conoscevo una donna con quel nome. Cantava questa melodia ai suoi figli prima della Guerra.'",
			"trigger": {"type": "event_sequence", "event_number": 4},
			"requires_flags": ["has_mothers_memory"],
			"choices": [
				{
					"text": "Chiedi del passato di tua madre",
					"outcome": "Il capo dei Corvi abbassa le armi. 'Sei il figlio di Lena... Vai, ragazzo. Il tuo viaggio è più importante del nostro bottino.'",
					"effects": [
						{"type": "add_lore_flag", "flag": "corvi_alliance"}
					]
				},
				{
					"text": "Fuggi senza parlare",
					"outcome": "Corri via nella notte. Alcuni misteri è meglio lasciarli sepolti.",
					"effects": [
						{"type": "add_lore_flag", "flag": "corvi_escaped"}
					]
				}
			],
			"priority": 4
		},
		{
			"id": "lore_05_wanderer_dilemma",
			"title": "5. Il Dilemma del Viandante",
			"description": "Incontri una famiglia - padre, madre e una bambina che ti ricorda te stesso anni fa. Sono affamati, assetati, e la bambina è malata. Hanno sentito parlare del Safe Place ma non ce la faranno mai senza aiuto. Ma tu hai appena abbastanza risorse per te stesso.",
			"trigger": {"type": "event_sequence", "event_number": 5},
			"choices": [
				{
					"text": "Condividi le tue risorse",
					"outcome": "La gratitudine nei loro occhi vale più di qualsiasi tesoro. La bambina sorride per la prima volta in giorni.",
					"effects": [
						{"type": "add_lore_flag", "flag": "helped_family"}
					]
				},
				{
					"text": "Prosegui da solo",
					"outcome": "La sopravvivenza richiede scelte difficili. Ti allontani, cercando di non sentire il pianto della bambina.",
					"effects": [
						{"type": "add_lore_flag", "flag": "chose_survival"}
					]
				}
			],
			"priority": 5
		},
		{
			"id": "lore_06_echoes_of_inexpressed_war",
			"title": "6. Echi della Guerra Inespressa",
			"description": "In un bunker militare abbandonato, trovi documenti classificati. La Guerra Inespressa non fu una guerra normale - fu un esperimento andato male. 'Progetto Chimera: alterazione della realtà su scala continentale'. Tuo padre lavorava al progetto. Il Safe Place era il bunker di emergenza per gli scienziati.",
			"trigger": {"type": "event_sequence", "event_number": 6},
			"choices": [
				{
					"text": "Studia i documenti",
					"outcome": "La verità è terrificante ma necessaria. Ora capisci perché tuo padre doveva raggiungere il Safe Place.",
					"effects": [
						{"type": "add_lore_flag", "flag": "knows_truth"}
					]
				}
			],
			"priority": 6
		},
		{
			"id": "lore_07_dream_of_green_valley",
			"title": "7. Il Sogno della Valle Verde",
			"description": "La febbre ti prende dopo giorni di pioggia. Nel delirio, sogni una valle verde protetta dalle montagne, dove il grano cresce alto e l'acqua scorre pulita. Vedi tuo padre che ti aspetta vicino a una quercia centenaria. 'Non mollare, Ultimo. Siamo così vicini.'",
			"trigger": {"type": "event_sequence", "event_number": 7},
			"choices": [
				{
					"text": "Trova la forza di continuare",
					"outcome": "Il sogno ti dà speranza. La febbre passa e ti alzi più determinato che mai.",
					"effects": [
						{"type": "add_lore_flag", "flag": "prophetic_dream"}
					]
				}
			],
			"priority": 7
		},
		{
			"id": "lore_08_radio_interception",
			"title": "8. L'Intercettazione Radio",
			"description": "Una vecchia radio militare crepita alla vita. '...a tutti i sopravvissuti del Progetto Chimera... il Safe Place è operativo... coordinate confermate... il Guardiano vi aspetta... ripeto, il protocollo Angelo è attivo...' La trasmissione si ripete. È registrata, ma quanto è vecchia?",
			"trigger": {"type": "event_sequence", "event_number": 8},
			"requires_flags": ["knows_truth"],
			"choices": [
				{
					"text": "Memorizza le coordinate",
					"outcome": "Le coordinate confermano che sei sulla strada giusta. Il Safe Place è reale e vicino.",
					"effects": [
						{"type": "add_lore_flag", "flag": "has_coordinates"}
					]
				}
			],
			"priority": 8
		},
		{
			"id": "lore_09_guardian_of_threshold",
			"title": "9. Il Guardiano della Soglia",
			"description": "Una figura in tuta antiradioattiva ti blocca il passaggio. 'Identificati', dice con voce metallica. 'Il protocollo richiede conferma genetica per l'accesso al Safe Place.' Quando scannerizza il tuo sangue, la sua postura cambia. 'Benvenuto, figlio del Progetto. Ti stavamo aspettando.'",
			"trigger": {"type": "event_sequence", "event_number": 9},
			"requires_flags": ["has_coordinates"],
			"choices": [
				{
					"text": "Chiedi di tuo padre",
					"outcome": "Il Guardiano esita. 'Tuo padre è arrivato tre mesi fa. È... cambiato. Ma è vivo. Seguimi.'",
					"effects": [
						{"type": "add_lore_flag", "flag": "guardian_met"}
					]
				}
			],
			"priority": 9
		},
		{
			"id": "lore_10_hidden_valley",
			"title": "10. La Valle Nascosta",
			"description": "Il Safe Place si apre davanti a te - una valle verdeggiante protetta da un campo di energia. Persone lavorano nei campi, bambini giocano, e l'aria è pulita. Al centro, vicino alla quercia del tuo sogno, vedi una figura familiare. Tuo padre si volta, e nonostante i cambiamenti, il suo sorriso è lo stesso. 'Ce l'hai fatta, Ultimo. Benvenuto a casa.'",
			"trigger": {"type": "event_sequence", "event_number": 10},
			"requires_flags": ["guardian_met"],
			"choices": [
				{
					"text": "Corri da tuo padre",
					"outcome": "L'abbraccio cancella mesi di sofferenza. Il viaggio è finito. Una nuova vita può iniziare nel Safe Place, l'ultimo rifugio dell'umanità.",
					"effects": [
						{"type": "end_game", "ending": "reunion"}
					]
				}
			],
			"priority": 10
		}
	]

	print("✅ Caricati %d eventi lore lineari" % _lore_events.size())
	return _lore_events.size() == 10

## ===== NUOVO: TRIGGER SYSTEM PER LORE EVENTS - ORDINE LINEARE =====
func check_lore_event_triggers(player_context: Dictionary) -> Dictionary:
	# ORDINE LINEARE: trova il prossimo evento da triggerare (1→10)
	for event in _lore_events:
		var event_id = event.get("id", "")

		# Skip se già visto
		if event_id in _seen_lore_events:
			continue

		# Check prerequisiti flags
		if event.has("requires_flags"):
			var has_all_flags = true
			for flag in event.requires_flags:
				if not flag in _lore_flags:
					has_all_flags = false
					break
			if not has_all_flags:
				continue

		# Check trigger condition - SOLO IL PRIMO EVENTO NON VISTO
		if _check_lore_trigger(event.trigger, player_context):
			print("🎭 Lore event triggered (sequenza %d): %s" % [event.priority, event.title])
			return event
		else:
			# Se questo evento non è triggerable, STOP - ordine lineare
			break

	return {}

## Helper: controlla trigger specifico lore event
func _check_lore_trigger(trigger: Dictionary, player_context: Dictionary) -> bool:
	var trigger_type = trigger.get("type", "")

	match trigger_type:
		"event_sequence":
			var event_number = trigger.get("event_number", 0)
			return _check_event_sequence(event_number, player_context)

		_:
			return false

## Helper: controlla sequenza eventi
func _check_event_sequence(event_number: int, player_context: Dictionary) -> bool:
	# Deve essere il prossimo evento nella sequenza
	if event_number != _current_lore_sequence:
		return false

	var days = player_context.get("days_survived", 0)

	# Sistema compresso 4-5 giorni: eventi distribuiti logicamente
	match event_number:
		1: return days >= 1 # Giorno 1 - partenza
		2: return days >= 1 # Giorno 1 - prima notte
		3: return days >= 2 # Giorno 2 - primi passi
		4: return days >= 2 # Giorno 2 - incontri
		5: return days >= 3 # Giorno 3 - prove morali
		6: return days >= 3 # Giorno 3 - verità
		7: return days >= 4 # Giorno 4 - sogni
		8: return days >= 4 # Giorno 4 - segnali
		9: return days >= 5 # Giorno 5 - arrivo
		10: return days >= 5 # Giorno 5 - finale
		_: return false

## ===== NUOVO: API LORE EVENTS =====
func trigger_lore_event(event_data: Dictionary) -> bool:
	var event_id = event_data.get("id", "")

	if event_id in _seen_lore_events:
		return false

	# Aggiungi ai visti e avanza sequenza lineare
	_seen_lore_events.append(event_id)
	_current_lore_sequence += 1
	_last_lore_event_time = Time.get_ticks_msec() / 1000.0

	print("🎭 Triggering lore event: %s (prossimo: %d)" % [event_data.get("title", ""), _current_lore_sequence])
	lore_event_triggered.emit(event_data)

	return true

## API: Applica effetti scelta lore
func apply_lore_choice_effects(effects: Array):
	for effect in effects:
		var effect_type = effect.get("type", "")

		match effect_type:
			"add_lore_flag":
				var flag = effect.get("flag", "")
				if flag != "" and not flag in _lore_flags:
					_lore_flags.append(flag)
					print("🏴 Lore flag aggiunto: %s" % flag)

			"end_game":
				var ending = effect.get("ending", "")
				print("🏁 Fine gioco triggered: %s" % ending)
				# TODO: Implementare end game logic

## API: Get lore stats
func get_lore_stats() -> Dictionary:
	return {
		"total_lore_events": _lore_events.size(),
		"seen_events": _seen_lore_events.size(),
		"current_sequence": _current_lore_sequence,
		"lore_flags": _lore_flags.size(),
		"completion_percentage": float(_seen_lore_events.size()) / float(_lore_events.size()) * 100.0,
		"is_sequence_complete": _current_lore_sequence > 10
	}

## API: Debug sequenza corrente
func debug_lore_sequence():
	print("🔍 === LORE SEQUENCE DEBUG ===")
	print("Sequenza corrente: %d/10" % _current_lore_sequence)
	print("Eventi visti: %s" % str(_seen_lore_events))
	print("Flags lore: %s" % str(_lore_flags))
	print("Completamento: %.1f%%" % (float(_seen_lore_events.size()) / 10.0 * 100.0))
	print("🏁 === END DEBUG ===")

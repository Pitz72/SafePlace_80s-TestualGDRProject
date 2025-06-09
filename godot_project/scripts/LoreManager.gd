class_name LoreManager
extends Node

## Sistema gestione contenuti narrativi per SafePlace
## v1.2.0 "Narrative Discovery" - FASE 1: LORE UPGRADE

# Database lore items importati dal JavaScript
var lore_items: Dictionary = {}

# Statistiche lore
var _total_lore_items: int = 0
var _lore_by_rarity: Dictionary = {}
var _special_items: Array[String] = []

# Segnali per il sistema di comunicazione
signal lore_item_discovered(item_id: String, rarity: String)
signal special_interaction_available(item_id: String)
signal knowledge_unlocked(knowledge_type: String)

func _init():
	print("🏺 LoreManager inizializzato")

## Carica il database lore dal file JavaScript
func load_lore_database() -> bool:
	print("📖 INIZIO CARICAMENTO LORE DATABASE")

	var js_file_path = "js/data/items_lore.js"
	var file = FileAccess.open(js_file_path, FileAccess.READ)

	if not file:
		print("❌ ERRORE: Impossibile aprire file ", js_file_path)
		return false

	var js_content = file.get_as_text()
	file.close()

	print("📄 File Lore JavaScript letto: ", js_content.length(), " caratteri")

	# Estrai la sezione LORE_ITEMS dal JavaScript
	var lore_data = _parse_javascript_lore_data(js_content)

	if lore_data.is_empty():
		print("❌ ERRORE: Nessun dato LORE_ITEMS trovato nel file JavaScript")
		return false

	print("📊 Trovati ", lore_data.size(), " oggetti lore nel database JavaScript")

	# Processa ogni oggetto lore
	return _process_lore_items(lore_data)

## Parse JavaScript LORE_ITEMS e converte in Dictionary Godot
func _parse_javascript_lore_data(js_content: String) -> Dictionary:
	print("🔍 Parsing JavaScript LORE_ITEMS...")

	# Trova l'inizio di LORE_ITEMS
	var start_marker = "const LORE_ITEMS = {"
	var start_index = js_content.find(start_marker)

	if start_index == -1:
		print("❌ ERRORE: Marker 'const LORE_ITEMS = {' non trovato")
		return {}

	# Trova la fine del blocco LORE_ITEMS
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
		print("❌ ERRORE: Fine del blocco LORE_ITEMS non trovata")
		return {}

	var lore_data_block = js_content.substr(content_start, content_end - content_start)
	print("🎯 Estratto blocco LORE_ITEMS: ", lore_data_block.length(), " caratteri")

	# Converte il JavaScript in Dictionary Godot
	return _convert_js_lore_to_dict(lore_data_block)

## Converte oggetti lore JavaScript in Dictionary Godot
func _convert_js_lore_to_dict(js_object: String) -> Dictionary:
	print("🔄 Conversione JavaScript Lore → Dictionary Godot...")

	var result: Dictionary = {}

	# Rimuovi wrapper delle parentesi graffe esterne
	js_object = js_object.strip_edges()
	if js_object.begins_with("{"):
		js_object = js_object.substr(1)
	if js_object.ends_with("}"):
		js_object = js_object.substr(0, js_object.length() - 1)

	# Parsing oggetti lore linea per linea
	var current_item_id = ""
	var current_item_data = ""
	var brace_level = 0

	var lines = js_object.split("\n")

	for line in lines:
		line = line.strip_edges()

		# Skip commenti e righe vuote
		if line.begins_with("//") or line.is_empty():
			continue

		# Trova inizio nuovo oggetto lore
		var item_start_regex = RegEx.new()
		item_start_regex.compile("^['\"]([^'\"]+)['\"]\\s*:\\s*\\{")
		var regex_result = item_start_regex.search(line)

		if regex_result and brace_level == 0:
			# Salva il precedente se esiste
			if not current_item_id.is_empty():
				var item_dict = _parse_js_lore_object(current_item_data)
				if not item_dict.is_empty():
					result[current_item_id] = item_dict

			# Inizia nuovo oggetto
			current_item_id = regex_result.get_string(1)
			current_item_data = "{"
			brace_level = 1
			continue

		# Accumula dati dell'oggetto corrente
		if brace_level > 0:
			current_item_data += "\n" + line

			# Conta parentesi per sapere quando finisce l'oggetto
			var in_string = false
			var escape_next = false

			for char in line:
				if char == '"' and not escape_next:
					in_string = !in_string
				elif not in_string:
					if char == '{':
						brace_level += 1
					elif char == '}':
						brace_level -= 1

				escape_next = (char == '\\' and not escape_next)

			# Se siamo tornati a livello 0, l'oggetto è completo
			if brace_level == 0:
				var item_dict = _parse_js_lore_object(current_item_data)
				if not item_dict.is_empty():
					result[current_item_id] = item_dict
				current_item_id = ""
				current_item_data = ""

	# Salva l'ultimo oggetto se necessario
	if not current_item_id.is_empty():
		var item_dict = _parse_js_lore_object(current_item_data)
		if not item_dict.is_empty():
			result[current_item_id] = item_dict

	print("✅ Conversione completata: ", result.size(), " oggetti lore convertiti")
	return result

## Parse singolo oggetto lore JavaScript in Dictionary
func _parse_js_lore_object(js_object: String) -> Dictionary:
	# Implementazione semplificata - regex-based parsing
	var result: Dictionary = {}

	# Trova name
	var name_regex = RegEx.new()
	name_regex.compile("name\\s*:\\s*['\"]([^'\"]+)['\"]")
	var name_match = name_regex.search(js_object)
	if name_match:
		result["name"] = name_match.get_string(1)

	# Trova description
	var desc_regex = RegEx.new()
	desc_regex.compile("description\\s*:\\s*['\"]([^'\"]*)['\"]")
	var desc_match = desc_regex.search(js_object)
	if desc_match:
		result["description"] = desc_match.get_string(1)

	# Trova loreText
	var lore_regex = RegEx.new()
	lore_regex.compile("loreText\\s*:\\s*['\"]([^'\"]*)['\"]")
	var lore_match = lore_regex.search(js_object)
	if lore_match:
		result["loreText"] = lore_match.get_string(1)

	# Trova rarity
	var rarity_regex = RegEx.new()
	rarity_regex.compile("rarity\\s*:\\s*['\"]([^'\"]+)['\"]")
	var rarity_match = rarity_regex.search(js_object)
	if rarity_match:
		result["rarity"] = rarity_match.get_string(1)
	else:
		result["rarity"] = "common"

	# Trova type
	var type_regex = RegEx.new()
	type_regex.compile("type\\s*:\\s*['\"]([^'\"]+)['\"]")
	var type_match = type_regex.search(js_object)
	if type_match:
		result["type"] = type_match.get_string(1)

	return result

## Processa gli oggetti lore caricati
func _process_lore_items(lore_data: Dictionary) -> bool:
	print("⚙️ Processando ", lore_data.size(), " oggetti lore...")

	var processed_count = 0

	for item_id in lore_data.keys():
		var item_data = lore_data[item_id]

		if _add_lore_item(item_id, item_data):
			processed_count += 1
		else:
			print("⚠️ Errore processando lore item: ", item_id)

	_total_lore_items = processed_count
	print("✅ LoreManager caricato: ", processed_count, " oggetti lore processati")

	return processed_count > 0

## Aggiunge un oggetto lore al database
func _add_lore_item(item_id: String, item_data: Dictionary) -> bool:
	if not item_data.has("name"):
		return false

	lore_items[item_id] = item_data

	# Traccia rarità
	var rarity = item_data.get("rarity", "common")
	if not _lore_by_rarity.has(rarity):
		_lore_by_rarity[rarity] = 0
	_lore_by_rarity[rarity] += 1

	# Traccia oggetti speciali
	if item_data.get("unique", false) or item_data.get("specialInteraction", false):
		_special_items.append(item_id)

	return true

## Ottiene dati lore per un oggetto
func get_lore_data(item_id: String) -> Dictionary:
	return lore_items.get(item_id, {})

## Verifica se un oggetto ha dati lore
func has_lore_data(item_id: String) -> bool:
	return lore_items.has(item_id)

## Arricchisce un oggetto esistente con dati lore
func enrich_item_with_lore(item: Item) -> bool:
	if not has_lore_data(item.id):
		return false

	var lore_data = get_lore_data(item.id)

	# Applica i dati lore all'oggetto
	item.lore_text = lore_data.get("loreText", "")
	item.rarity = lore_data.get("rarity", "common")
	item.special_interaction = lore_data.get("specialInteraction", false)
	item.unique = lore_data.get("unique", false)
	item.combinable = lore_data.get("combinable", false)
	item.revelation = lore_data.get("revelation", false)
	item.playable = lore_data.get("playable", false)
	item.readable_pages = lore_data.get("readablePages", 0)
	item.battery_life = lore_data.get("batteryLife", 0)
	item.knowledge_gained = lore_data.get("knowledgeGained", "")

	if item.readable_pages > 0:
		item.readable = true

	print("🏺 Oggetto %s arricchito con lore (%s)" % [item.id, item.rarity])

	# Emetti segnale se è un oggetto speciale
	if item.is_special():
		special_interaction_available.emit(item.id)

	return true

## Statistiche lore
func get_lore_stats() -> Dictionary:
	return {
		"total_lore_items": _total_lore_items,
		"lore_by_rarity": _lore_by_rarity,
		"special_items_count": _special_items.size(),
		"special_items": _special_items
	}

## Test del sistema lore
func test_lore_system() -> bool:
	print("🧪 TEST SISTEMA LORE")

	var success = load_lore_database()
	if success:
		var stats = get_lore_stats()
		print("✅ Test completato: ", stats.total_lore_items, " oggetti lore caricati")
		return true
	else:
		print("❌ Test fallito: impossibile caricare lore database")
		return false

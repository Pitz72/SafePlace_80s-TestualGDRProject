class_name ItemDatabase
extends Node

## Database degli oggetti per SafePlace Godot Port
## Migrazione completa da js/game_data.js ITEM_DATA

# Database principale degli oggetti
var items: Array[Item] = []

# Lookup dictionary per accesso veloce per ID
var _item_lookup: Dictionary = {}
var _items_by_type: Dictionary = {}
var _items_by_category: Dictionary = {}

# Statistiche database
var _total_items: int = 0
var _load_time: float = 0.0
var _is_loaded: bool = false

# Segnali per il sistema di comunicazione
signal database_loaded(item_count: int, load_time: float)
signal item_not_found(item_id: String)

func _init():
	print("🗃️ ItemDatabase inizializzato")

## Carica tutti gli oggetti dal JSON (migrazione da JS)
func load_items_from_json(json_data: Dictionary) -> bool:
	var start_time = Time.get_ticks_msec()

	print("📦 Caricamento ItemDatabase da JSON...")

	items.clear()
	_item_lookup.clear()
	_items_by_type.clear()
	_items_by_category.clear()

	var loaded_count = 0

	# Converte ogni oggetto dal formato JS
	for item_id in json_data.keys():
		var item_data = json_data[item_id]
		var item = Item.from_js_data(item_id, item_data)

		if _add_item_to_database(item):
			loaded_count += 1
		else:
			print("⚠️ Errore caricamento item: ", item_id)

	_total_items = loaded_count
	_is_loaded = true

	var end_time = Time.get_ticks_msec()
	_load_time = float(end_time - start_time)

	_build_category_indexes()
	_validate_database()

	print("✅ ItemDatabase caricato: ", loaded_count, " oggetti in ", _load_time, "ms")
	database_loaded.emit(loaded_count, _load_time)

	return loaded_count > 0

## =====================================================
## NUOVE FUNZIONI PER IMPORTAZIONE MASSIVA JAVASCRIPT
## =====================================================

## Carica il database completo da file JavaScript
func load_complete_database() -> bool:
	print("🔥 INIZIO CARICAMENTO DATABASE COMPLETO DA JAVASCRIPT")

	var js_file_path = "js/game_data.js"
	var file = FileAccess.open(js_file_path, FileAccess.READ)

	if not file:
		print("❌ ERRORE: Impossibile aprire file ", js_file_path)
		return false

	var js_content = file.get_as_text()
	file.close()

	print("📄 File JavaScript letto: ", js_content.length(), " caratteri")

	# Estrai la sezione ITEM_DATA dal JavaScript
	var item_data = _parse_javascript_item_data(js_content)

	if item_data.is_empty():
		print("❌ ERRORE: Nessun dato ITEM_DATA trovato nel file JavaScript")
		return false

	print("📊 Trovati ", item_data.size(), " oggetti nel database JavaScript")

	# Carica usando il sistema esistente
	return load_items_from_json(item_data)

## Parse JavaScript ITEM_DATA e converte in Dictionary Godot
func _parse_javascript_item_data(js_content: String) -> Dictionary:
	print("🔍 Parsing JavaScript ITEM_DATA...")

	# Trova l'inizio di ITEM_DATA
	var start_marker = "const ITEM_DATA = {"
	var start_index = js_content.find(start_marker)

	if start_index == -1:
		print("❌ ERRORE: Marker 'const ITEM_DATA = {' non trovato")
		return {}

	# Trova la fine del blocco ITEM_DATA (bilancia le parentesi graffe)
	var brace_count = 0
	var content_start = start_index + start_marker.length() - 1 # Include la {
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
		print("❌ ERRORE: Fine del blocco ITEM_DATA non trovata")
		return {}

	var item_data_block = js_content.substr(content_start, content_end - content_start)
	print("🎯 Estratto blocco ITEM_DATA: ", item_data_block.length(), " caratteri")

	# Converte il JavaScript in Dictionary Godot
	return _convert_js_object_to_dict(item_data_block)

## Converte un oggetto JavaScript in Dictionary Godot
func _convert_js_object_to_dict(js_object: String) -> Dictionary:
	print("🔄 Conversione JavaScript → Dictionary Godot...")

	var result: Dictionary = {}

	# Rimuovi il wrapper delle parentesi graffe esterne
	js_object = js_object.strip_edges()
	if js_object.begins_with("{"):
		js_object = js_object.substr(1)
	if js_object.ends_with("}"):
		js_object = js_object.substr(0, js_object.length() - 1)

	# Parsing linea per linea per ogni oggetto
	var current_item_id = ""
	var current_item_data = ""
	var brace_level = 0
	var in_string = false
	var escape_next = false

	var lines = js_object.split("\n")

	for line in lines:
		line = line.strip_edges()

		# Skip commenti e righe vuote
		if line.begins_with("//") or line.is_empty():
			continue

		# Trova inizio nuovo oggetto (pattern: 'item_id': {)
		var item_start_regex = RegEx.new()
		item_start_regex.compile("^['\"]([^'\"]+)['\"]\\s*:\\s*\\{")
		var regex_result = item_start_regex.search(line)

		if regex_result and brace_level == 0:
			# Salva il precedente se esiste
			if not current_item_id.is_empty():
				var item_dict = _parse_js_item_object(current_item_data)
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
				var item_dict = _parse_js_item_object(current_item_data)
				if not item_dict.is_empty():
					result[current_item_id] = item_dict
				current_item_id = ""
				current_item_data = ""

	# Gestisci l'ultimo oggetto se c'è
	if not current_item_id.is_empty() and brace_level == 0:
		var item_dict = _parse_js_item_object(current_item_data)
		if not item_dict.is_empty():
			result[current_item_id] = item_dict

	print("✅ Conversione completata: ", result.size(), " oggetti convertiti")
	return result

## Converte un singolo oggetto JavaScript in Dictionary
func _parse_js_item_object(js_item: String) -> Dictionary:
	var result: Dictionary = {}

	# Rimuovi parentesi graffe esterne
	js_item = js_item.strip_edges()
	if js_item.begins_with("{"):
		js_item = js_item.substr(1)
	if js_item.ends_with("}"):
		js_item = js_item.substr(0, js_item.length() - 1)

	# Split su virgole MA solo a livello 0 (non dentro oggetti/array nested)
	var properties = _smart_split_js_properties(js_item)

	for prop in properties:
		var kv = _parse_js_property(prop)
		if not kv.is_empty():
			result[kv.key] = kv.value

	return result

## Split intelligente che rispetta nesting di oggetti/array
func _smart_split_js_properties(content: String) -> Array:
	var properties = []
	var current_prop = ""
	var brace_level = 0
	var bracket_level = 0
	var in_string = false
	var escape_next = false

	for i in range(content.length()):
		var char = content[i]

		if char == '"' and not escape_next:
			in_string = !in_string
		elif not in_string:
			if char == '{':
				brace_level += 1
			elif char == '}':
				brace_level -= 1
			elif char == '[':
				bracket_level += 1
			elif char == ']':
				bracket_level -= 1
			elif char == ',' and brace_level == 0 and bracket_level == 0:
				# Virgola a livello 0 = fine proprietà
				if not current_prop.strip_edges().is_empty():
					properties.append(current_prop.strip_edges())
				current_prop = ""
				continue

		escape_next = (char == '\\' and not escape_next)
		current_prop += char

	# Aggiungi l'ultima proprietà
	if not current_prop.strip_edges().is_empty():
		properties.append(current_prop.strip_edges())

	return properties

## Parse una singola proprietà JavaScript (key: value)
func _parse_js_property(prop: String) -> Dictionary:
	prop = prop.strip_edges()

	# Trova la posizione del primo ':' non dentro stringhe
	var colon_pos = -1
	var in_string = false
	var escape_next = false

	for i in range(prop.length()):
		var char = prop[i]
		if char == '"' and not escape_next:
			in_string = !in_string
		elif char == ':' and not in_string:
			colon_pos = i
			break
		escape_next = (char == '\\' and not escape_next)

	if colon_pos == -1:
		return {}

	var key_part = prop.substr(0, colon_pos).strip_edges()
	var value_part = prop.substr(colon_pos + 1).strip_edges()

	# Parse key (rimuovi quotes)
	var key = _parse_js_string(key_part)

	# Parse value
	var value = _parse_js_value(value_part)

	return {"key": key, "value": value}

## Parse una stringa JavaScript (rimuove quotes e gestisce escape)
func _parse_js_string(js_str: String) -> String:
	js_str = js_str.strip_edges()

	# Rimuovi quotes esterne
	if (js_str.begins_with("'") and js_str.ends_with("'")) or \
	   (js_str.begins_with('"') and js_str.ends_with('"')):
		js_str = js_str.substr(1, js_str.length() - 2)

	# Gestisci escape sequences base
	js_str = js_str.replace("\\'", "'")
	js_str = js_str.replace('\\"', '"')
	js_str = js_str.replace("\\\\", "\\")
	js_str = js_str.replace("\\n", "\n")
	js_str = js_str.replace("\\t", "\t")

	return js_str

## Parse un valore JavaScript (string, number, boolean, object, array)
func _parse_js_value(js_value: String):
	js_value = js_value.strip_edges()

	# Rimuovi virgola finale se presente
	if js_value.ends_with(","):
		js_value = js_value.substr(0, js_value.length() - 1).strip_edges()

	# String
	if (js_value.begins_with("'") and js_value.ends_with("'")) or \
	   (js_value.begins_with('"') and js_value.ends_with('"')):
		return _parse_js_string(js_value)

	# Boolean
	if js_value == "true":
		return true
	if js_value == "false":
		return false

	# Number (int or float)
	if js_value.is_valid_int():
		return js_value.to_int()
	if js_value.is_valid_float():
		return js_value.to_float()

	# Object
	if js_value.begins_with("{") and js_value.ends_with("}"):
		return _parse_js_item_object(js_value)

	# Array
	if js_value.begins_with("[") and js_value.ends_with("]"):
		return _parse_js_array(js_value)

	# Default: return as string
	return js_value

## Parse un array JavaScript
func _parse_js_array(js_array: String) -> Array:
	js_array = js_array.strip_edges()

	# Rimuovi parentesi quadre
	if js_array.begins_with("["):
		js_array = js_array.substr(1)
	if js_array.ends_with("]"):
		js_array = js_array.substr(0, js_array.length() - 1)

	if js_array.strip_edges().is_empty():
		return []

	# Split intelligente degli elementi
	var elements = _smart_split_array_elements(js_array)
	var result = []

	for element in elements:
		result.append(_parse_js_value(element))

	return result

## Split intelligente per elementi di array
func _smart_split_array_elements(content: String) -> Array:
	var elements = []
	var current_element = ""
	var brace_level = 0
	var bracket_level = 0
	var in_string = false
	var escape_next = false

	for i in range(content.length()):
		var char = content[i]

		if char == '"' and not escape_next:
			in_string = !in_string
		elif not in_string:
			if char == '{':
				brace_level += 1
			elif char == '}':
				brace_level -= 1
			elif char == '[':
				bracket_level += 1
			elif char == ']':
				bracket_level -= 1
			elif char == ',' and brace_level == 0 and bracket_level == 0:
				if not current_element.strip_edges().is_empty():
					elements.append(current_element.strip_edges())
				current_element = ""
				continue

		escape_next = (char == '\\' and not escape_next)
		current_element += char

	if not current_element.strip_edges().is_empty():
		elements.append(current_element.strip_edges())

	return elements

## =====================================================
## FUNZIONI ESISTENTI (NON MODIFICATE)
## =====================================================

## Aggiunge un item al database con validazione
func _add_item_to_database(item: Item) -> bool:
	if not item or item.id.is_empty():
		print("⚠️ Item invalido o senza ID")
		return false

	if _item_lookup.has(item.id):
		print("⚠️ Item duplicato: ", item.id)
		return false

	items.append(item)
	_item_lookup[item.id] = item

	# Aggiungi ai lookup per tipo
	if not _items_by_type.has(item.type):
		_items_by_type[item.type] = []
	_items_by_type[item.type].append(item)

	return true

## Costruisce gli indici per categoria per ricerche veloci
func _build_category_indexes():
	_items_by_category.clear()

	# Categorizzazione SafePlace-specific
	for item in items:
		var categories = _get_item_categories(item)
		for category in categories:
			if not _items_by_category.has(category):
				_items_by_category[category] = []
			_items_by_category[category].append(item)

## Determina le categorie di un item
func _get_item_categories(item: Item) -> Array[String]:
	var categories: Array[String] = []

	# Categoria base
	categories.append(item.type)

	# Categorie SafePlace specifiche
	if item.is_weapon():
		categories.append("weapons")
		categories.append("weapons_" + item.weaponType)

	if item.is_armor():
		categories.append("armor")
		categories.append("armor_" + item.slot)

	if item.is_consumable():
		categories.append("consumables")

	if item.stackable:
		categories.append("stackable")

	if item.has_durability():
		categories.append("durable")

	# Categorie per valore
	if item.value >= 50:
		categories.append("valuable")
	elif item.value <= 5:
		categories.append("cheap")

	# Categorie per peso
	if item.weight >= 2.0:
		categories.append("heavy")
	elif item.weight <= 0.5:
		categories.append("light")

	return categories

## Valida la consistenza del database
func _validate_database():
	var validation_errors: Array[String] = []
	var warnings: Array[String] = []

	for item in items:
		# Validazioni critiche
		if item.name.is_empty():
			validation_errors.append("Item %s senza nome" % item.id)

		if item.type.is_empty():
			validation_errors.append("Item %s senza tipo" % item.id)

		if item.weight < 0:
			validation_errors.append("Item %s con peso negativo" % item.id)

		# Validazioni armi
		if item.is_weapon():
			if item.damage_min <= 0 and item.damage_max <= 0:
				warnings.append("Arma %s senza danno" % item.id)

		# Validazioni armature
		if item.is_armor():
			if item.armorValue <= 0:
				warnings.append("Armatura %s senza protezione" % item.id)

	if validation_errors.size() > 0:
		print("🚨 ERRORI DATABASE:")
		for error in validation_errors:
			print("  ❌ ", error)

	if warnings.size() > 0:
		print("⚠️ WARNING DATABASE:")
		for warning in warnings:
			print("  ⚠️ ", warning)

	print("📊 Validazione completata: ", validation_errors.size(), " errori, ", warnings.size(), " warning")

## Calcola differenza di tempo in millisecondi - DEPRECATA
## Ora uso direttamente Time.get_ticks_msec() per evitare problemi con msec
func _calculate_time_diff(start_time: int, end_time: int) -> float:
	return float(end_time - start_time)

## Recupera un item per ID
func get_item(item_id: String) -> Item:
	if not _is_loaded:
		print("⚠️ Database non caricato")
		return null

	if _item_lookup.has(item_id):
		return _item_lookup[item_id]
	else:
		print("⚠️ Item non trovato: ", item_id)
		item_not_found.emit(item_id)
		return null

## Recupera tutti gli items di un tipo
func get_items_by_type(item_type: String) -> Array[Item]:
	var result: Array[Item] = []
	if _items_by_type.has(item_type):
		for item in _items_by_type[item_type]:
			result.append(item)
	return result

## Recupera tutti gli items di una categoria
func get_items_by_category(category: String) -> Array[Item]:
	var result: Array[Item] = []
	if _items_by_category.has(category):
		for item in _items_by_category[category]:
			result.append(item)
	return result

## Verifica se il database è caricato
func is_loaded() -> bool:
	return _is_loaded

## Ottieni statistiche database
func get_stats() -> Dictionary:
	return {
		"total_items": _total_items,
		"load_time_ms": _load_time,
		"is_loaded": _is_loaded,
		"memory_usage_estimate_mb": _total_items * 0.001 # Stima rough
	}

## Cerca items per nome (fuzzy search)
func search_items(search_term: String, max_results: int = 10) -> Array[Item]:
	var results: Array[Item] = []
	var term_lower = search_term.to_lower()

	for item in items:
		var score = 0
		var name_lower = item.name.to_lower()
		var desc_lower = item.description.to_lower()

		# Exact match nome
		if name_lower == term_lower:
			score += 100
		# Contains in nome
		elif name_lower.contains(term_lower):
			score += 50
		# Contains in descrizione
		elif desc_lower.contains(term_lower):
			score += 25
		# Fuzzy match tipo
		elif item.type.to_lower().contains(term_lower):
			score += 10

		if score > 0:
			results.append(item)

		if results.size() >= max_results:
			break

	return results

## Debug: stampa tutte le categorie
func debug_print_categories():
	print("📋 Categorie disponibili:")
	for category in _items_by_category.keys():
		print("  ", category, ": ", _items_by_category[category].size(), " items")

## Debug: stampa statistiche dettagliate
func debug_print_detailed_stats():
	print("📊 STATISTICHE DETTAGLIATE ITEMDATABASE")
	print("==================================================")

	var stats = get_stats()
	for key in stats.keys():
		print("  ", key, ": ", stats[key])

	print("\n📦 DISTRIBUZIONE PER TIPO:")
	for type in _items_by_type.keys():
		var type_items = _items_by_type[type]
		print("  ", type, ": ", type_items.size(), " items")

		# Sample items
		var sample_count = min(3, type_items.size())
		for i in range(sample_count):
			print("    - ", type_items[i].name)
		if type_items.size() > 3:
			print("    ... e altri ", type_items.size() - 3, " items")

## Test di migrazione (per verificare la conversione da JS)
func test_migration() -> bool:
	print("🧪 Test migrazione ItemDatabase...")

	if not _is_loaded:
		print("❌ Database non caricato")
		return false

	# Test items critici
	var critical_items = ["scrap_metal", "canned_food", "water_bottle", "pipe_wrench", "leather_jacket_worn"]
	var found_count = 0

	for item_id in critical_items:
		var item = get_item(item_id)
		if item:
			found_count += 1
			print("  ✅ ", item_id, " → ", item.name)
		else:
			print("  ❌ ", item_id, " NON TROVATO")

	var success_rate = (float(found_count) / float(critical_items.size())) * 100.0
	print("📊 Test migrazione: ", success_rate, "% success rate")

	return success_rate >= 80.0

class_name ItemDatabase
extends Resource

## Database degli oggetti per SafePlace Godot Port
## Migrazione completa da js/game_data.js ITEM_DATA

# Database principale degli oggetti
@export var items: Array[Item] = []

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
	var start_time = Time.get_time_dict_from_system()
	
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
	
	var end_time = Time.get_time_dict_from_system()
	_load_time = _calculate_time_diff(start_time, end_time)
	
	_build_category_indexes()
	_validate_database()
	
	print("✅ ItemDatabase caricato: ", loaded_count, " oggetti in ", _load_time, "ms")
	database_loaded.emit(loaded_count, _load_time)
	
	return loaded_count > 0

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

## Statistiche database
func get_stats() -> Dictionary:
	var stats = {
		"total_items": _total_items,
		"load_time_ms": _load_time,
		"is_loaded": _is_loaded,
		"types": _items_by_type.keys(),
		"categories": _items_by_category.keys()
	}
	
	# Conta per tipo
	for type in _items_by_type.keys():
		stats["count_" + type] = _items_by_type[type].size()
	
	return stats

## Utility per calcolo tempo
func _calculate_time_diff(start: Dictionary, end: Dictionary) -> float:
	var start_ms = start.hour * 3600000 + start.minute * 60000 + start.second * 1000
	var end_ms = end.hour * 3600000 + end.minute * 60000 + end.second * 1000
	return end_ms - start_ms

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
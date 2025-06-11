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

## Pre-popola database con oggetti SafePlace originali
func populate_with_original_items():
	"""Pre-carica tutti gli oggetti dal SafePlace originale per il sistema completo"""
	print("📦 Pre-popolamento database con oggetti originali SafePlace...")
	
	# Oggetti base già esistenti
	_add_basic_items()
	
	# Cibo con sistema porzioni
	_add_food_items()
	
	# Bevande con sistema porzioni  
	_add_water_items()
	
	# Medicine e tool medici
	_add_medicine_items()
	
	# Risorse e materiali
	_add_resource_items()
	
	# Aggiorna statistiche e indici
	_total_items = items.size()
	_is_loaded = true
	_build_category_indexes()
	_validate_database()
	
	print("✅ Database popolato con %d oggetti originali SafePlace" % _total_items)
	database_loaded.emit(_total_items, 0.0)

## Cibo con sistema porzioni originale (ESTESO v1.8.2)
func _add_food_items():
	var food_items = [
		# Cibi base multi-porzione
		{
			"id": "canned_food",
			"name": "Cibo in Scatola Generico",
			"description": "Una lattina senza etichetta. Chissà cosa contiene, ma sembra commestibile.",
			"type": "food",
			"usable": true,
			"weight": 0.4,
			"value": 8,
			"stackable": true,
			"max_portions": 2,
			"effects": [{"type": "add_resource", "resource_type": "food", "amount": 3}]
		},
		{
			"id": "ration_pack",
			"name": "Razione K da Campo",
			"description": "Razione militare compatta, progettata per fornire sostentamento in condizioni difficili.",
			"type": "food",
			"usable": true,
			"weight": 0.5,
			"value": 15,
			"stackable": true,
			"max_portions": 3,
			"effects": [{"type": "add_resource", "resource_type": "food", "amount": 4}]
		},
		{
			"id": "mre_pack",
			"name": "Razione Militare (MRE)",
			"description": "Pasto completo, sigillato. Pesante ma saziante.",
			"type": "food",
			"usable": true,
			"weight": 1.0,
			"value": 25,
			"stackable": false,
			"max_portions": 4,
			"effects": [
				{"type": "add_resource", "resource_type": "food", "amount": 5},
				{"type": "add_resource", "resource_type": "hp", "amount": 2}
			]
		},
		{
			"id": "canned_beans",
			"name": "Fagioli in Scatola",
			"description": "Una lattina di fagioli. Un classico della sopravvivenza.",
			"type": "food",
			"usable": true,
			"weight": 0.4,
			"value": 7,
			"stackable": true,
			"max_portions": 2,
			"effects": [{"type": "add_resource", "resource_type": "food", "amount": 3}]
		},
		{
			"id": "mystery_meat_cooked",
			"name": "Carne Misteriosa Cotta",
			"description": "Carne di dubbia provenienza, cotta alla bell'e meglio. Speriamo bene.",
			"type": "food",
			"usable": true,
			"weight": 0.3,
			"value": 5,
			"stackable": true,
			"max_portions": 2,
			"effects": [{"type": "add_resource_sickness", "resource_type": "food", "amount": 3, "sickness_chance": 0.10}]
		},
		# NUOVI CIBI ORIGINALI (da game_data.js)
		{
			"id": "meat_raw",
			"name": "Carne Cruda",
			"description": "Un pezzo di carne fresca, ma cruda. Mangiarla così è rischioso.",
			"type": "food",
			"usable": true,
			"weight": 0.6,
			"value": 8,
			"effects": [{"type": "add_resource_sickness", "resource_type": "food", "amount": 4, "sickness_chance": 0.35}]
		},
		{
			"id": "meat_cooked",
			"name": "Carne Cotta",
			"description": "Un pezzo di carne arrostita su un fuoco improvvisato. Meglio della carne cruda.",
			"type": "food",
			"usable": true,
			"weight": 0.3,
			"value": 10,
			"stackable": true,
			"max_portions": 2,
			"effects": [
				{"type": "add_resource", "resource_type": "food", "amount": 4},
				{"type": "add_resource", "resource_type": "hp", "amount": 1}
			]
		},
		{
			"id": "chips_stale",
			"name": "Patatine Stantie",
			"description": "Un sacchetto aperto, sapore di cartone, ma è pur sempre cibo.",
			"type": "food",
			"usable": true,
			"weight": 0.2,
			"value": 3,
			"effects": [{"type": "add_resource", "resource_type": "food", "amount": 3}]
		},
		{
			"id": "dried_fruit",
			"name": "Frutta Essiccata",
			"description": "Leggera e nutriente, se non è ammuffita.",
			"type": "food",
			"usable": true,
			"weight": 0.3,
			"value": 10,
			"effects": [{"type": "add_resource", "resource_type": "food", "amount": 4}]
		},
		{
			"id": "prewar_dry_biscuits",
			"name": "Biscotti Secchi dell'Anteguerra",
			"description": "Incredibilmente conservati in una scatola di latta. Duri come sassi, ma un vago sapore di normalità.",
			"type": "food",
			"usable": true,
			"weight": 0.4,
			"value": 14,
			"effects": [
				{"type": "add_resource", "resource_type": "food", "amount": 5},
				{"type": "add_resource", "resource_type": "hp", "amount": 1}
			]
		},
		# Cibi single-use
		{
			"id": "berries",
			"name": "Bacche Comuni",
			"description": "Alcune bacche selvatiche. Potrebbero sfamare un po', ma è sempre saggio essere cauti.",
			"type": "food",
			"usable": true,
			"weight": 0.1,
			"value": 3,
			"stackable": true,
			"effects": [{"type": "add_resource_poisonable", "resource_type": "food", "amount": 2, "poison_chance": 0.10}]
		},
		{
			"id": "berries_suspicious",
			"name": "Bacche Sospette",
			"description": "Bacche colorate trovate su un cespuglio. Potrebbero essere commestibili... o velenose.",
			"type": "food",
			"usable": true,
			"weight": 0.1,
			"value": 2,
			"effects": [{"type": "add_resource_poisonable", "resource_type": "food", "amount": 3, "poison_chance": 0.25}]
		},
		{
			"id": "chocolate_bar",
			"name": "Barretta di Cioccolato",
			"description": "Fonde un po' in mano, un lusso raro.",
			"type": "food",
			"usable": true,
			"weight": 0.1,
			"value": 8,
			"effects": [{"type": "add_resource", "resource_type": "food", "amount": 4}]
		},
		{
			"id": "protein_bar_old",
			"name": "Barretta Proteica Vecchia",
			"description": "Dura come un sasso, ma piena di... qualcosa.",
			"type": "food",
			"usable": true,
			"weight": 0.2,
			"value": 9,
			"effects": [{"type": "add_resource", "resource_type": "food", "amount": 5}]
		}
	]
	
	for item_data in food_items:
		var item = _create_item_from_data(item_data)
		if item:
			_add_item_to_database(item)

## Bevande con sistema porzioni (ESTESO v1.8.2)
func _add_water_items():
	var water_items = [
		# Acqua multi-porzione
		{
			"id": "water_bottle",
			"name": "Bottiglia d'Acqua Grande",
			"description": "Una bottiglia di plastica riutilizzabile, piena d'acqua. Sembra potabile.",
			"type": "water",
			"usable": true,
			"weight": 1.5,
			"value": 12,
			"stackable": false,
			"max_portions": 4,
			"effects": [{"type": "add_resource", "resource_type": "water", "amount": 2}]
		},
		{
			"id": "water_purified_small",
			"name": "Acqua Purificata (Piccola)",
			"description": "Una piccola quantità di acqua resa potabile. Preziosa.",
			"type": "water",
			"usable": true,
			"weight": 0.3,
			"value": 8,
			"stackable": true,
			"max_portions": 2,
			"effects": [{"type": "add_resource", "resource_type": "water", "amount": 2}]
		},
		{
			"id": "rainwater_collected",
			"name": "Acqua Piovana Raccolta",
			"description": "Acqua raccolta in un contenitore di fortuna. Non il massimo, ma disseta.",
			"type": "water",
			"usable": true,
			"weight": 0.5,
			"value": 3,
			"stackable": true,
			"max_portions": 2,
			"effects": [{"type": "add_resource_sickness", "resource_type": "water", "amount": 2, "sickness_chance": 0.05}]
		},
		# NUOVE BEVANDE ORIGINALI (da game_data.js)
		{
			"id": "water_contaminated",
			"name": "Acqua Contaminata",
			"description": "Acqua con un inquietante bagliore verdastro. Berla è un rischio calcolato.",
			"type": "water",
			"usable": true,
			"weight": 1.0,
			"value": 4,
			"stackable": true,
			"max_portions": 3,
			"effects": [{"type": "add_resource_sickness", "resource_type": "water", "amount": 3, "sickness_chance": 0.30}]
		},
		{
			"id": "water_purified",
			"name": "Acqua Purificata",
			"description": "Acqua pulita e sicura, trattata con filtri o bollitura. Un lusso raro.",
			"type": "water",
			"usable": true,
			"weight": 1.0,
			"value": 15,
			"stackable": true,
			"max_portions": 3,
			"effects": [
				{"type": "add_resource", "resource_type": "water", "amount": 4},
				{"type": "add_resource", "resource_type": "hp", "amount": 1}
			]
		},
		{
			"id": "river_water",
			"name": "Acqua di Fiume",
			"description": "Acqua prelevata direttamente da un corso d'acqua. Potrebbe contenere patogeni.",
			"type": "water",
			"usable": true,
			"weight": 1.0,
			"value": 2,
			"stackable": true,
			"max_portions": 4,
			"effects": [{"type": "add_resource_sickness", "resource_type": "water", "amount": 2, "sickness_chance": 0.20}]
		},
		# Acqua pericolosa
		{
			"id": "water_dirty",
			"name": "Acqua Sporca",
			"description": "Acqua torbida e dall'odore sgradevole. Berla così è un azzardo.",
			"type": "water",
			"usable": true,
			"weight": 1.0,
			"value": 1,
			"stackable": true,
			"effects": [{"type": "add_resource_sickness", "resource_type": "water", "amount": 3, "sickness_chance": 0.45}]
		},
		# Bevande speciali
		{
			"id": "herbal_tea_crude",
			"name": "Tisana d'Erbe Grezza",
			"description": "Foglie bollite, sapore amaro, forse calmante.",
			"type": "water",
			"usable": true,
			"weight": 0.1,
			"value": 5,
			"effects": [
				{"type": "add_resource", "resource_type": "water", "amount": 2},
				{"type": "add_resource", "resource_type": "hp", "amount": 1}
			]
		},
		{
			"id": "soda_flat",
			"name": "Bibita Gassata Sgasata",
			"description": "Dolce e appiccicosa, ha perso tutta l'effervescenza.",
			"type": "water",
			"usable": true,
			"weight": 0.4,
			"value": 5,
			"effects": [{"type": "add_resource", "resource_type": "water", "amount": 3}]
		},
		{
			"id": "energy_drink_old",
			"name": "Bevanda Energetica Scaduta",
			"description": "La data di scadenza è illeggibile. Ha un colore strano ma potrebbe dare energia.",
			"type": "water",
			"usable": true,
			"weight": 0.5,
			"value": 8,
			"effects": [
				{"type": "add_resource", "resource_type": "water", "amount": 2},
				{"type": "temp_boost", "stat": "energy", "amount": 5, "duration": 300}
			]
		}
	]
	
	for item_data in water_items:
		var item = _create_item_from_data(item_data)
		if item:
			_add_item_to_database(item)

## Medicine e cure
func _add_medicine_items():
	var medicine_items = [
		{
			"id": "first_aid_kit",
			"name": "Kit Pronto Soccorso",
			"description": "Kit medico standard con bende, disinfettante e analgesici.",
			"type": "medicine",
			"usable": true,
			"weight": 0.8,
			"value": 25,
			"stackable": true,
			"effects": [
				{"type": "add_resource", "resource_type": "hp", "amount": 25},
				{"type": "cure_status", "status": "bleeding"}
			]
		},
		{
			"id": "bandages_clean",
			"name": "Bende Pulite",
			"description": "Bende sterili per ferite. Essenziali in emergenza.",
			"type": "medicine",
			"usable": true,
			"weight": 0.2,
			"value": 8,
			"stackable": true,
			"effects": [
				{"type": "add_resource", "resource_type": "hp", "amount": 10},
				{"type": "cure_status", "status": "bleeding"}
			]
		},
		{
			"id": "antidote",
			"name": "Antidoto",
			"description": "Contravveleno generale. Può salvare la vita in caso di avvelenamento.",
			"type": "medicine",
			"usable": true,
			"weight": 0.1,
			"value": 20,
			"stackable": true,
			"effects": [
				{"type": "cure_status", "status": "poisoned"},
				{"type": "add_resource", "resource_type": "hp", "amount": 5}
			]
		},
		{
			"id": "vitamins",
			"name": "Vitamine",
			"description": "Integratore vitaminico. Aiuta il sistema immunitario.",
			"type": "medicine",
			"usable": true,
			"weight": 0.1,
			"value": 12,
			"stackable": true,
			"effects": [
				{"type": "add_resource", "resource_type": "hp", "amount": 8},
				{"type": "cure_status", "status": "sick"}
			]
		},
		{
			"id": "painkillers",
			"name": "Antidolorifici",
			"description": "Pillole contro il dolore. Effetto temporaneo ma efficace.",
			"type": "medicine",
			"usable": true,
			"weight": 0.1,
			"value": 10,
			"stackable": true,
			"effects": [
				{"type": "add_resource", "resource_type": "hp", "amount": 15},
				{"type": "temp_boost", "stat": "pain_resistance", "amount": 5, "duration": 300}
			]
		}
	]
	
	for item_data in medicine_items:
		var item = _create_item_from_data(item_data)
		if item:
			_add_item_to_database(item)

## Risorse e materiali
func _add_resource_items():
	var resource_items = [
		{
			"id": "scrap_metal",
			"name": "Metallo Riciclato",
			"description": "Pezzi di metallo arrugginito e contorto. Utile per riparazioni e costruzioni.",
			"type": "resource",
			"weight": 0.5,
			"value": 5,
			"stackable": true
		},
		{
			"id": "cloth_rags",
			"name": "Stracci di Stoffa",
			"description": "Pezzi di tessuto sporco e logoro. Possono essere usati per bende o riparazioni.",
			"type": "resource",
			"weight": 0.1,
			"value": 2,
			"stackable": true
		},
		{
			"id": "wood_planks",
			"name": "Assi di Legno",
			"description": "Assi recuperate da vecchie strutture. Materiale da costruzione versatile.",
			"type": "resource",
			"weight": 0.8,
			"value": 4,
			"stackable": true
		},
		{
			"id": "mechanical_parts",
			"name": "Parti Meccaniche",
			"description": "Ingranaggi, molle e piccoli componenti. Essenziali per meccanismi complessi.",
			"type": "resource",
			"weight": 0.3,
			"value": 10,
			"stackable": true
		},
		{
			"id": "rope",
			"name": "Corda",
			"description": "Corda robusta di canapa. Utile per molte situazioni.",
			"type": "resource",
			"weight": 0.5,
			"value": 8,
			"stackable": true
		}
	]
	
	for item_data in resource_items:
		var item = _create_item_from_data(item_data)
		if item:
			_add_item_to_database(item)

## Oggetti base testing (se non esistono già)
func _add_basic_items():
	# Verifica se oggetti base esistono già
	if get_item("health_potion") == null:
		var health_potion_data = {
			"id": "health_potion",
			"name": "Pozione di Cura",
			"description": "Una pozione magica che cura le ferite.",
			"type": "medicine",
			"usable": true,
			"weight": 0.3,
			"value": 50,
			"stackable": true,
			"effects": [{"type": "add_resource", "resource_type": "hp", "amount": 50}]
		}
		var item = _create_item_from_data(health_potion_data)
		if item:
			_add_item_to_database(item)

## Helper per creare Item da dati
func _create_item_from_data(data: Dictionary) -> Item:
	var item = Item.new()
	
	# Proprietà base
	item.id = data.get("id", "")
	item.name = data.get("name", "")
	item.description = data.get("description", "")
	item.type = data.get("type", "misc")
	item.weight = data.get("weight", 1.0)
	item.value = data.get("value", 1)
	item.stackable = data.get("stackable", false)
	item.usable = data.get("usable", false)
	
	# Proprietà specifiche
	if data.has("max_portions"):
		item.max_portions = data.get("max_portions", 1)
	
	if data.has("effects"):
		item.effects = data.get("effects", [])
	
	# Durabilità di default per oggetti usabili
	if item.usable:
		item.max_durability = 100
		item.current_durability = 100
	
	return item 

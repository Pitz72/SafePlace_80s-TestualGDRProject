extends Node

## DataManager Singleton - The Safe Place v0.0.3
## 
## Gestisce il caricamento e l'accesso a tutti i database JSON modulari del gioco.
## Architettura: 
## - data/system/ → File condivisi (rarity_system.json)
## - data/items/ → Database oggetti categorizzati (weapons, armor, consumables, etc.)
##
## Progettato come Singleton (Autoload) per accesso globale ai dati.

# ========================================
# VARIABILI PUBBLICHE - DATABASE CARICATI
# ========================================

## Sistema rarità condiviso da tutti i database
var rarity_system: Dictionary = {}

## Database oggetti separati per categoria
var unique_items: Dictionary = {}
var weapons: Dictionary = {}
var armor: Dictionary = {}
var consumables: Dictionary = {}
var crafting_materials: Dictionary = {}
var ammo: Dictionary = {}
var quest_items: Dictionary = {}

## Database unificato di tutti gli oggetti per accesso rapido
## Struttura: { "item_id": { dati_oggetto }, ... }
var items: Dictionary = {}

# ========================================
# STATISTICHE DI CARICAMENTO
# ========================================

var _total_items_loaded: int = 0
var _loading_errors: Array[String] = []

# ========================================
# INIZIALIZZAZIONE
# ========================================

func _ready() -> void:
	print("🗄️ DataManager inizializzazione...")
	_load_all_data()
	_validate_data_integrity()
	print("✅ DataManager pronto - %d oggetti caricati" % _total_items_loaded)
	if _loading_errors.size() > 0:
		print("⚠️ Errori durante caricamento: %d" % _loading_errors.size())
		for error in _loading_errors:
			print("   - %s" % error)

# ========================================
# CARICAMENTO DATI PRIVATO
# ========================================

## Carica tutti i database JSON dall'architettura modulare
func _load_all_data() -> void:
	print("📁 Caricamento database modulari...")
	
	# 1. SISTEMA CONDIVISO
	rarity_system = _load_json_file("res://data/system/rarity_system.json")
	if rarity_system.has("rarity_system"):
		print("   ✅ Sistema rarità: %d livelli" % rarity_system.rarity_system.size())
	
	# 2. DATABASE OGGETTI CATEGORIZZATI
	unique_items = _load_json_file("res://data/items/unique_items.json")
	weapons = _load_json_file("res://data/items/weapons.json")
	armor = _load_json_file("res://data/items/armor.json")
	consumables = _load_json_file("res://data/items/consumables.json")
	crafting_materials = _load_json_file("res://data/items/crafting_materials.json")
	ammo = _load_json_file("res://data/items/ammo.json")
	quest_items = _load_json_file("res://data/items/quest_items.json")
	
	# 3. UNIFICAZIONE OGGETTI
	_merge_item_databases()
	
	print("📊 Caricamento completato:")
	print("   • Oggetti unici: %d" % _count_items(unique_items))
	print("   • Armi: %d" % _count_items(weapons))
	print("   • Armature: %d" % _count_items(armor))
	print("   • Consumabili: %d" % _count_items(consumables))
	print("   • Materiali crafting: %d" % _count_items(crafting_materials))
	print("   • Munizioni: %d" % _count_items(ammo))
	print("   • Oggetti quest: %d" % _count_items(quest_items))

## Helper per caricare e parsare singoli file JSON con gestione errori robusta
func _load_json_file(file_path: String) -> Dictionary:
	var file = FileAccess.open(file_path, FileAccess.READ)
	
	# Gestione errore: file non trovato
	if file == null:
		var error_msg = "File non trovato: %s" % file_path
		_loading_errors.append(error_msg)
		print("❌ %s" % error_msg)
		return {}
	
	# Lettura contenuto file
	var file_content = file.get_as_text()
	file.close()
	
	# Parsing JSON
	var json = JSON.new()
	var parse_result = json.parse(file_content)
	
	# Gestione errore: JSON non valido
	if parse_result != OK:
		var error_msg = "JSON non valido in %s - Errore linea %d: %s" % [
			file_path, 
			json.get_error_line(), 
			json.get_error_message()
		]
		_loading_errors.append(error_msg)
		print("❌ %s" % error_msg)
		return {}
	
	# Verifica che sia un Dictionary
	var data = json.data
	if not data is Dictionary:
		var error_msg = "Formato JSON non valido in %s - Root deve essere un Object" % file_path
		_loading_errors.append(error_msg)
		print("❌ %s" % error_msg)
		return {}
	
	print("   ✅ Caricato: %s" % file_path.get_file())
	return data

## Unisce tutti i database di oggetti in un singolo dizionario per accesso rapido
func _merge_item_databases() -> void:
	print("🔗 Unificazione database oggetti...")
	
	var databases = [
		unique_items,
		weapons, 
		armor,
		consumables,
		crafting_materials,
		ammo,
		quest_items
	]
	
	items.clear()
	var conflicts: Array[String] = []
	
	for database in databases:
		# Determina la chiave principale basandosi sulla struttura del file
		var main_key = ""
		if database.has("items"):
			main_key = "items"
		elif database.has("weapons"):
			main_key = "weapons"
		elif database.has("armor"):
			main_key = "armor"
		elif database.has("consumables"):
			main_key = "consumables"
		elif database.has("crafting_materials"):
			main_key = "crafting_materials"
		elif database.has("ammo"):
			main_key = "ammo"
		elif database.has("quest_items"):
			main_key = "quest_items"
		
		if main_key != "" and database[main_key] is Dictionary:
			for item_id in database[main_key]:
				if items.has(item_id):
					conflicts.append("ID duplicato: %s" % item_id)
				else:
					items[item_id] = database[main_key][item_id]
					_total_items_loaded += 1
	
	if conflicts.size() > 0:
		print("⚠️ Conflitti ID rilevati:")
		for conflict in conflicts:
			print("   - %s" % conflict)
			_loading_errors.append(conflict)
	
	print("   ✅ Database unificato: %d oggetti totali" % items.size())

## Conta gli oggetti in un database specifico
func _count_items(database: Dictionary) -> int:
	# Cerca la chiave principale del database
	var main_keys = ["items", "weapons", "armor", "consumables", "crafting_materials", "ammo", "quest_items"]
	for key in main_keys:
		if database.has(key) and database[key] is Dictionary:
			return database[key].size()
	return 0

## Verifica integrità dei dati caricati
func _validate_data_integrity() -> void:
	print("🔍 Validazione integrità dati...")
	
	# Verifica sistema rarità
	if not rarity_system.has("rarity_system"):
		_loading_errors.append("Sistema rarità mancante o corrotto")
	
	# Verifica che tutti gli oggetti abbiano proprietà essenziali
	var invalid_items: Array[String] = []
	for item_id in items:
		var item_data = items[item_id]
		if not _validate_item_properties(item_data):
			invalid_items.append(item_id)
	
	if invalid_items.size() > 0:
		print("⚠️ Oggetti con proprietà mancanti: %d" % invalid_items.size())
		for item_id in invalid_items:
			_loading_errors.append("Proprietà mancanti in oggetto: %s" % item_id)
	
	print("   ✅ Validazione completata")

## Verifica che un oggetto abbia tutte le proprietà essenziali
func _validate_item_properties(item_data: Dictionary) -> bool:
	var required_properties = ["id", "name", "description", "type", "rarity", "weight", "value"]
	for prop in required_properties:
		if not item_data.has(prop):
			return false
	return true

# ========================================
# API PUBBLICA - ACCESSO AI DATI
# ========================================

## Restituisce i dati di un oggetto specifico dal database unificato
## @param item_id: ID univoco dell'oggetto
## @return: Dictionary con dati oggetto, o {} se non trovato
func get_item_data(item_id: String) -> Dictionary:
	if items.has(item_id):
		return items[item_id]
	
	print("⚠️ DataManager: Oggetto non trovato: %s" % item_id)
	return {}

## Restituisce i dati di un livello di rarità
## @param rarity_name: Nome rarità (es. "COMMON", "EPIC", "LEGENDARY")
## @return: Dictionary con dati rarità, o {} se non trovato
func get_rarity_data(rarity_name: String) -> Dictionary:
	if rarity_system.has("rarity_system") and rarity_system.rarity_system.has(rarity_name):
		return rarity_system.rarity_system[rarity_name]
	
	print("⚠️ DataManager: Rarità non trovata: %s" % rarity_name)
	return {}

## Restituisce tutti gli oggetti di una categoria specifica
## @param category: Categoria oggetti ("weapon", "armor", "consumable", etc.)
## @return: Dictionary con oggetti della categoria
func get_items_by_category(category: String) -> Dictionary:
	var filtered_items: Dictionary = {}
	
	for item_id in items:
		var item_data = items[item_id]
		if item_data.has("type") and item_data.type == category:
			filtered_items[item_id] = item_data
	
	return filtered_items

## Restituisce tutti gli oggetti di una rarità specifica
## @param rarity: Livello rarità ("COMMON", "RARE", "LEGENDARY", etc.)
## @return: Dictionary con oggetti della rarità
func get_items_by_rarity(rarity: String) -> Dictionary:
	var filtered_items: Dictionary = {}
	
	for item_id in items:
		var item_data = items[item_id]
		if item_data.has("rarity") and item_data.rarity == rarity:
			filtered_items[item_id] = item_data
	
	return filtered_items

## Cerca oggetti per nome (ricerca fuzzy case-insensitive)
## @param search_term: Termine di ricerca
## @return: Array di ID oggetti che matchano
func search_items_by_name(search_term: String) -> Array[String]:
	var results: Array[String] = []
	var search_lower = search_term.to_lower()
	
	for item_id in items:
		var item_data = items[item_id]
		if item_data.has("name"):
			var name_lower = item_data.name.to_lower()
			if name_lower.contains(search_lower):
				results.append(item_id)
	
	return results

## Verifica se un oggetto esiste nel database
## @param item_id: ID oggetto da verificare
## @return: true se esiste, false altrimenti
func has_item(item_id: String) -> bool:
	return items.has(item_id)

## Restituisce statistiche generali sui dati caricati
## @return: Dictionary con statistiche
func get_loading_stats() -> Dictionary:
	return {
		"total_items": _total_items_loaded,
		"unique_items": _count_items(unique_items),
		"weapons": _count_items(weapons),
		"armor": _count_items(armor),
		"consumables": _count_items(consumables),
		"crafting_materials": _count_items(crafting_materials),
		"ammo": _count_items(ammo),
		"quest_items": _count_items(quest_items),
		"rarity_levels": rarity_system.rarity_system.size() if rarity_system.has("rarity_system") else 0,
		"loading_errors": _loading_errors.size(),
		"has_errors": _loading_errors.size() > 0
	}

## Restituisce la lista degli errori di caricamento (per debugging)
## @return: Array di stringhe con messaggi errore
func get_loading_errors() -> Array[String]:
	return _loading_errors.duplicate()

# ========================================
# API AVANZATA - ACCESSO SPECIALIZZATO
# ========================================

## Restituisce tutte le armi ordinate per danno
## @return: Array di Dictionary ordinato per danno crescente
func get_weapons_by_damage() -> Array[Dictionary]:
	var weapon_list: Array[Dictionary] = []
	
	for item_id in items:
		var item_data = items[item_id]
		if item_data.has("type") and item_data.type == "weapon":
			weapon_list.append(item_data)
	
	# Ordinamento per danno medio
	weapon_list.sort_custom(func(a, b): 
		var damage_a = _get_average_damage(a)
		var damage_b = _get_average_damage(b)
		return damage_a < damage_b
	)
	
	return weapon_list

## Calcola il danno medio di un'arma
func _get_average_damage(weapon_data: Dictionary) -> float:
	if weapon_data.has("damage") and weapon_data.damage is Dictionary:
		var damage = weapon_data.damage
		if damage.has("min") and damage.has("max"):
			return (damage.min + damage.max) / 2.0
	return 0.0

## Restituisce tutti gli oggetti equipaggiabili per uno slot specifico
## @param slot: Slot equipaggiamento ("main_hand", "body", "feet", etc.)
## @return: Dictionary con oggetti per lo slot
func get_items_by_slot(slot: String) -> Dictionary:
	var slot_items: Dictionary = {}
	
	for item_id in items:
		var item_data = items[item_id]
		if item_data.has("slot") and item_data.slot == slot:
			slot_items[item_id] = item_data
	
	return slot_items

## Restituisce i colori definiti per le rarità
## @return: Dictionary con mapping rarità → colore
func get_rarity_colors() -> Dictionary:
	var colors: Dictionary = {}
	
	if rarity_system.has("rarity_system"):
		for rarity_name in rarity_system.rarity_system:
			var rarity_data = rarity_system.rarity_system[rarity_name]
			if rarity_data.has("color"):
				colors[rarity_name] = rarity_data.color
	
	return colors

# ========================================
# DEBUG E DIAGNOSTICA
# ========================================

## Stampa un report completo sui dati caricati (per debugging)
func print_loading_report() -> void:
	print("\n" + "=".repeat(50))
	print("📊 DATAMANAGER - REPORT CARICAMENTO")
	print("=".repeat(50))
	
	var stats = get_loading_stats()
	print("📦 Oggetti totali: %d" % stats.total_items)
	print("   • Oggetti unici: %d" % stats.unique_items)
	print("   • Armi: %d" % stats.weapons)
	print("   • Armature: %d" % stats.armor)
	print("   • Consumabili: %d" % stats.consumables)
	print("   • Materiali crafting: %d" % stats.crafting_materials)
	print("   • Munizioni: %d" % stats.ammo)
	print("   • Oggetti quest: %d" % stats.quest_items)
	print("🎲 Livelli rarità: %d" % stats.rarity_levels)
	print("❌ Errori: %d" % stats.loading_errors)
	
	if stats.has_errors:
		print("\n⚠️ ERRORI RILEVATI:")
		for error in _loading_errors:
			print("   - %s" % error)
	
	print("=".repeat(50) + "\n") 

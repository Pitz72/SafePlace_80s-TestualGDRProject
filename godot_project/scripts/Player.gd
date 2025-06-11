class_name Player
extends Node2D

## Player - Sistema base del giocatore per SafePlace
## Gestisce stats, inventario, equipaggiamento e meccaniche di sopravvivenza

# Core Stats (SafePlace specific)
var hp: int = 100
var max_hp: int = 100
var food: int = 100
var water: int = 100
var exp: int = 0
var level: int = 1

# New SafePlace stats for Session #005
var pts: int = 0 # Available points
var vig: int = 10 # Vigor
var pot: int = 10 # Power
var agi: int = 10 # Agility
var tra: int = 10 # Tracking
var inf: int = 10 # Influence
var pre: int = 10 # Presence
var ada: int = 10 # Adaptability

# Legacy Combat Stats (mantenuti per compatibilità)
var attack: int = 10
var defense: int = 5
var agility: int = 8

# Status Effects
var is_hungry: bool = false
var is_thirsty: bool = false
var is_sick: bool = false
var is_bleeding: bool = false

# Inventory System
var inventory: Array[Dictionary] = []
var max_inventory_slots: int = 20
var equipped: Dictionary = {
	"weapon": null,
	"head": null,
	"body": null,
	"legs": null,
	"feet": null,
	"accessory": null
}

# Position & Movement
var current_location: String = "test_area"
var movement_points: int = 10
var max_movement_points: int = 10

# System State
var is_initialized: bool = false
var last_survival_update: float = 0.0
var survival_update_interval: float = 30.0 # 30 seconds

# Equipment Bonus System - FASE 2
var _equipment_bonus_cache: Dictionary = {}
var _last_equipment_hash: String = ""

# Player Signals
signal stats_changed(stat_name: String, old_value: int, new_value: int)
signal inventory_changed(action: String, item, quantity: int)
signal equipment_changed(slot: String, item)
signal level_up(new_level: int)
signal death()
signal status_effect_added(effect: String)
signal status_effect_removed(effect: String)
signal equipment_bonus_updated(bonus_type: String, old_value: int, new_value: int)

func _init():
	print("🏃 Player inizializzato con stats SafePlace")
	_setup_initial_stats()
	_add_test_items_safeplace() # Aggiungi oggetti di test SafePlace

func _ready():
	print("👤 Player ready")

func _process(delta):
	if not is_initialized:
		return

	# Update survival mechanics
	if Time.get_time_dict_from_system().second - last_survival_update > survival_update_interval:
		_update_survival_mechanics()
		last_survival_update = Time.get_time_dict_from_system().second

## Inizializza il player con valori base
func initialize_player():
	print("👤 Inizializzazione player...")

	# Reset to base values
	hp = max_hp
	food = 100
	water = 100
	exp = 0
	level = 1

	# Clear inventory
	inventory.clear()

	# Add starting items
	_add_starting_items()

	# Reset equipment
	_reset_equipment()

	# Set initialized
	is_initialized = true

	print("👤 Player inizializzato con successo")
	print("   HP: %d/%d" % [hp, max_hp])
	print("   Food: %d" % food)
	print("   Water: %d" % water)
	print("   Inventory slots: %d/%d" % [inventory.size(), max_inventory_slots])

## Aggiunge items di partenza (v1.8.2 database-verified)
func _add_starting_items():
	# Starting healing item - SOLO se esiste nel database
	if _validate_item_exists("first_aid_kit"):
		add_item_to_inventory("first_aid_kit", 1)
	
	# Starting resources - sempre disponibili nel database
	add_item_to_inventory("scrap_metal", 2)
	add_item_to_inventory("cloth_rags", 3)

	# Aggiungi oggetti SafePlace di test per MainInterface
	_add_test_safeplace_objects()

## Valida se un oggetto esiste nel database prima di aggiungerlo
func _validate_item_exists(item_id: String) -> bool:
	var game_manager = get_node("../../GameManager") as GameManager
	if not game_manager:
		return false
	
	var item_db = game_manager.get_item_database()
	if not item_db:
		return false
	
	return item_db.get_item(item_id) != null

## Reset equipment a valori default
func _reset_equipment():
	for slot in equipped.keys():
		equipped[slot] = null

## Sistema di sopravvivenza - aggiorna fame, sete, ecc.
func _update_survival_mechanics():
	print("🌡️ Aggiornamento sopravvivenza...")

	# Decrease food and water over time
	var old_food = food
	var old_water = water

	food = max(0, food - 2)
	water = max(0, water - 3)

	if old_food != food:
		stats_changed.emit("food", old_food, food)

	if old_water != water:
		stats_changed.emit("water", old_water, water)

	# Check for status effects
	_update_status_effects()

	# Apply survival damage if needed
	_apply_survival_damage()

## Aggiorna effetti di stato basati su stats
func _update_status_effects():
	# Hunger status
	var was_hungry = is_hungry
	is_hungry = food < 30

	if is_hungry != was_hungry:
		if is_hungry:
			status_effect_added.emit("hungry")
			print("😟 Il giocatore ha fame!")
		else:
			status_effect_removed.emit("hungry")
			print("😊 Il giocatore non ha più fame")

	# Thirst status
	var was_thirsty = is_thirsty
	is_thirsty = water < 20

	if is_thirsty != was_thirsty:
		if is_thirsty:
			status_effect_added.emit("thirsty")
			print("🥵 Il giocatore ha sete!")
		else:
			status_effect_removed.emit("thirsty")
			print("😊 Il giocatore non ha più sete")

## Applica danni da sopravvivenza
func _apply_survival_damage():
	var damage = 0

	if food == 0:
		damage += 5 # Starvation damage
		print("💀 Danno da fame: -5 HP")

	if water == 0:
		damage += 8 # Dehydration damage
		print("💀 Danno da sete: -8 HP")

	if damage > 0:
		take_damage(damage, "survival")

## Gestione HP e danni
func take_damage(amount: int, source: String = "unknown"):
	var old_hp = hp
	hp = max(0, hp - amount)

	print("💔 Danno subito: -%d HP da %s (HP: %d → %d)" % [amount, source, old_hp, hp])
	stats_changed.emit("hp", old_hp, hp)

	if hp <= 0:
		print("💀 Player KO!")
		death.emit()

## Guarigione
func heal(amount: int, source: String = "unknown"):
	var old_hp = hp
	hp = min(max_hp, hp + amount)
	var actual_heal = hp - old_hp

	if actual_heal > 0:
		print("💚 Guarigione: +%d HP da %s (HP: %d → %d)" % [actual_heal, source, old_hp, hp])
		stats_changed.emit("hp", old_hp, hp)

## Sistema Inventario
func add_item_to_inventory(item_id: String, quantity: int = 1) -> bool:
	print("🎒 Tentativo di aggiungere: %s x%d" % [item_id, quantity])

	# Check if inventory has space
	if inventory.size() >= max_inventory_slots:
		print("❌ Inventario pieno!")
		return false

	# Check if item already exists and is stackable
	for i in range(inventory.size()):
		var slot = inventory[i]
		if slot.item_id == item_id:
			# Item exists, check if stackable
			if slot.has("stackable") and slot.stackable:
				slot.quantity += quantity
				print("✅ Item stackato: %s ora ha %d quantità" % [item_id, slot.quantity])
				inventory_changed.emit("added", null, quantity)
				return true

	# Add new item slot
	var new_slot = {
		"item_id": item_id,
		"quantity": quantity,
		"stackable": _is_item_stackable(item_id)
	}

	inventory.append(new_slot)
	print("✅ Nuovo item aggiunto: %s x%d (slot %d)" % [item_id, quantity, inventory.size()])
	inventory_changed.emit("added", null, quantity)
	return true

func remove_item_from_inventory(item_id: String, quantity: int = 1) -> bool:
	print("🎒 Tentativo di rimuovere: %s x%d" % [item_id, quantity])

	for i in range(inventory.size()):
		var slot = inventory[i]
		if slot.item_id == item_id:
			if slot.quantity >= quantity:
				slot.quantity -= quantity
				print("✅ Item rimosso: %s x%d" % [item_id, quantity])

				# Remove slot if quantity is 0
				if slot.quantity <= 0:
					inventory.remove_at(i)
					print("🗑️ Slot rimosso completamente")

				inventory_changed.emit("removed", null, quantity)
				return true
			else:
				print("❌ Quantità insufficiente: ha %d, richiesti %d" % [slot.quantity, quantity])
				return false

	print("❌ Item non trovato in inventario: %s" % item_id)
	return false

func get_item_quantity(item_id: String) -> int:
	for slot in inventory:
		if slot.item_id == item_id:
			return slot.quantity
	return 0

func has_item(item_id: String, quantity: int = 1) -> bool:
	return get_item_quantity(item_id) >= quantity

## Check if item is stackable (placeholder)
func _is_item_stackable(item_id: String) -> bool:
	# Oggetti stackable SafePlace
	var stackable_items = [
		"health_potion", "food_can", "water_bottle",
		"bende_sporche", "acqua_bottiglia", "cibo_scatola",
		"metallo_rottame", "stracci_stoffa", "carbone", "latta_cibo"
	]
	return item_id in stackable_items

## Sistema Experience e Level
func add_experience(amount: int):
	var old_exp = exp
	exp += amount

	print("⭐ Esperienza guadagnata: +%d EXP (Total: %d)" % [amount, exp])
	stats_changed.emit("exp", old_exp, exp)

	# Check for level up
	_check_level_up()

func _check_level_up():
	var exp_needed = level * 100 # Simple formula: level * 100 EXP per level

	if exp >= exp_needed:
		var old_level = level
		level += 1
		exp -= exp_needed

		# Increase max HP on level up
		var old_max_hp = max_hp
		max_hp += 10
		hp = max_hp # Full heal on level up

		print("🎉 LEVEL UP! Livello %d → %d" % [old_level, level])
		print("   Max HP aumentato: %d → %d" % [old_max_hp, max_hp])

		stats_changed.emit("level", old_level, level)
		stats_changed.emit("max_hp", old_max_hp, max_hp)
		stats_changed.emit("hp", hp - (max_hp - old_max_hp), hp)

		level_up.emit(level)

## Item Usage
func use_item(item_id: String) -> Dictionary:
	"""
	Sistema completo uso oggetti con porzioni (v1.8.2 ROBUSTO)
	Returns: {"success": bool, "message": String, "consumed": bool}
	"""
	print("🎯 Tentativo uso item: ", item_id)
	
	# VALIDAZIONE ROBUSTA v1.8.2
	if item_id.is_empty():
		print("❌ ID oggetto vuoto")
		return {"success": false, "message": "ID oggetto non valido", "consumed": false}
	
	# Trova l'oggetto nell'inventario con error handling
	var item_slot = _find_item_in_inventory(item_id)
	if not item_slot:
		print("❌ Oggetto '%s' non trovato in inventario" % item_id)
		return {"success": false, "message": "Oggetto non trovato in inventario", "consumed": false}
	
	# Recupera dati dal database con fallback graceful
	var game_manager = get_node("../../GameManager") as GameManager
	if not game_manager:
		print("❌ GameManager non trovato")
		return {"success": false, "message": "Sistema non disponibile", "consumed": false}
		
	var item_db = game_manager.get_item_database()
	if not item_db:
		print("❌ ItemDatabase non disponibile")
		return {"success": false, "message": "Database oggetti non disponibile", "consumed": false}
	
	var item_data = item_db.get_item(item_id)
	if not item_data:
		print("❌ Oggetto '%s' non trovato nel database" % item_id)
		# FALLBACK GRACEFUL: Rimuovi oggetto corrotto dall'inventario
		_remove_corrupted_item(item_id)
		return {"success": false, "message": "Oggetto corrotto rimosso dall'inventario", "consumed": true}
	
	# Verifica se l'oggetto è usabile
	if not item_data.usable:
		print("⚠️ Oggetto '%s' non è usabile" % item_data.name)
		return {"success": false, "message": item_data.name + " non è usabile", "consumed": false}
	
	# Gestione sistemi diversi con error handling robusto
	var result: Dictionary
	match item_data.type:
		"food":
			result = _consume_food_item(item_slot, item_data)
		"water":
			result = _consume_water_item(item_slot, item_data)
		"medicine":
			result = _consume_medicine_item(item_slot, item_data)
		"tool":
			result = _use_tool_item(item_slot, item_data)
		_:
			print("❌ Tipo oggetto non supportato: %s" % item_data.type)
			result = {"success": false, "message": "Tipo oggetto non supportato: " + item_data.type, "consumed": false}
	
	# Validazione risultato
	if not result.has("success") or not result.has("message") or not result.has("consumed"):
		print("❌ Risultato use_item malformato, applying fallback")
		return {"success": false, "message": "Errore interno uso oggetto", "consumed": false}
	
	return result

## Consumo cibo con sistema porzioni
func _consume_food_item(item_slot: Dictionary, item_data) -> Dictionary:
	var portions = item_slot.get("current_portions", item_data.max_portions)
	
	if portions <= 0:
		return {"success": false, "message": item_data.name + " è completamente consumato", "consumed": false}
	
	# Consuma una porzione
	var food_gained = 0
	var hp_gained = 0
	var message = "Hai mangiato una porzione di " + item_data.name
	
	# Applica effetti
	var effects = item_data.effects
	for effect in effects:
		# Gli effects sono stringhe JSON, quindi le parsing
		var effect_dict = JSON.parse_string(effect) if effect is String else effect
		if effect_dict:
			match effect_dict.get("type", ""):
				"add_resource":
					if effect_dict.get("resource_type") == "food":
						food_gained += effect_dict.get("amount", 0)
					elif effect_dict.get("resource_type") == "hp":
						hp_gained += effect_dict.get("amount", 0)
				"add_resource_poisonable":
					if effect_dict.get("resource_type") == "food":
						food_gained += effect_dict.get("amount", 0)
						# Check poison chance
						var poison_chance = effect_dict.get("poison_chance", 0.0)
						if randf() < poison_chance:
							_apply_poison_effect()
							message += " (Ti senti male...)"
				"add_resource_sickness":
					if effect_dict.get("resource_type") == "food":
						food_gained += effect_dict.get("amount", 0)
						var sickness_chance = effect_dict.get("sickness_chance", 0.0)
						if randf() < sickness_chance:
							_apply_sickness_effect()
							message += " (Qualcosa non va...)"
	
	# Applica cambiamenti
	food = min(100, food + food_gained)
	if hp_gained > 0:
		heal(hp_gained)
	
	# Gestisci porzioni
	if item_data.max_portions > 1:
		item_slot["current_portions"] = portions - 1
		message += " (%d porzioni rimaste)" % item_slot["current_portions"]
		
		# Rimuovi oggetto se finito
		if item_slot["current_portions"] <= 0:
			remove_item_from_inventory(item_data.id, 1)
	else:
		# Oggetto single-use
		remove_item_from_inventory(item_data.id, 1)
	
	stats_changed.emit("food", food - food_gained, food)
	print("🍎 Cibo consumato: +%d food, +%d hp" % [food_gained, hp_gained])
	
	return {"success": true, "message": message, "consumed": true}

## Consumo acqua con sistema porzioni
func _consume_water_item(item_slot: Dictionary, item_data) -> Dictionary:
	var portions = item_slot.get("current_portions", item_data.max_portions)
	
	if portions <= 0:
		return {"success": false, "message": item_data.name + " è completamente consumato", "consumed": false}
	
	# Consuma una porzione
	var water_gained = 0
	var hp_gained = 0
	var message = "Hai bevuto una porzione di " + item_data.name
	
	# Applica effetti
	var effects = item_data.effects
	for effect in effects:
		# Gli effects sono stringhe JSON, quindi le parsing
		var effect_dict = JSON.parse_string(effect) if effect is String else effect
		if effect_dict:
			match effect_dict.get("type", ""):
				"add_resource":
					if effect_dict.get("resource_type") == "water":
						water_gained += effect_dict.get("amount", 0)
					elif effect_dict.get("resource_type") == "hp":
						hp_gained += effect_dict.get("amount", 0)
				"add_resource_sickness":
					if effect_dict.get("resource_type") == "water":
						water_gained += effect_dict.get("amount", 0)
						var sickness_chance = effect_dict.get("sickness_chance", 0.0)
						if randf() < sickness_chance:
							_apply_sickness_effect()
							message += " (L'acqua aveva un sapore strano...)"
	
	# Applica cambiamenti
	water = min(100, water + water_gained)
	if hp_gained > 0:
		heal(hp_gained)
	
	# Gestisci porzioni
	if item_data.max_portions > 1:
		item_slot["current_portions"] = portions - 1
		message += " (%d porzioni rimaste)" % item_slot["current_portions"]
		
		if item_slot["current_portions"] <= 0:
			remove_item_from_inventory(item_data.id, 1)
	else:
		remove_item_from_inventory(item_data.id, 1)
	
	stats_changed.emit("water", water - water_gained, water)
	print("💧 Acqua consumata: +%d water, +%d hp" % [water_gained, hp_gained])
	
	return {"success": true, "message": message, "consumed": true}

## Consumo medicine
func _consume_medicine_item(item_slot: Dictionary, item_data) -> Dictionary:
	var message = "Hai usato " + item_data.name
	var hp_gained = 0
	var side_effects = []
	
	# Applica effetti medicina
	var effects = item_data.effects
	for effect in effects:
		# Gli effects sono stringhe JSON, quindi le parsing
		var effect_dict = JSON.parse_string(effect) if effect is String else effect
		if effect_dict:
			match effect_dict.get("type", ""):
				"add_resource":
					if effect_dict.get("resource_type") == "hp":
						hp_gained += effect_dict.get("amount", 0)
				"cure_status":
					var status = effect_dict.get("status", "")
					if _cure_status_effect(status):
						side_effects.append("Curato: " + status)
				"temp_boost":
					_apply_temporary_boost(effect_dict.get("stat", ""), effect_dict.get("amount", 0), effect_dict.get("duration", 0))
					side_effects.append("+%d %s per %ds" % [effect_dict.get("amount", 0), effect_dict.get("stat", ""), effect_dict.get("duration", 0)])
	
	# Applica guarigione
	if hp_gained > 0:
		heal(hp_gained)
		side_effects.append("+%d HP" % hp_gained)
	
	# Effetti collaterali
	if side_effects.size() > 0:
		message += " (" + ", ".join(side_effects) + ")"
	
	# Rimuovi oggetto (medicine sono sempre single-use)
	remove_item_from_inventory(item_data.id, 1)
	
	print("💊 Medicina usata: %s" % message)
	return {"success": true, "message": message, "consumed": true}

## Uso tool/utility
func _use_tool_item(item_slot: Dictionary, item_data) -> Dictionary:
	var message = "Hai usato " + item_data.name
	
	# Gestisci diversi tipi di tool
	match item_data.id:
		"first_aid_kit":
			return _use_first_aid_kit(item_slot, item_data)
		"repair_kit":
			return _use_repair_kit(item_slot, item_data)
		"water_purification_tablet":
			return _use_purification_tablet(item_slot, item_data)
		_:
			return {"success": false, "message": "Tool non supportato: " + item_data.id, "consumed": false}

## First aid kit specializzato
func _use_first_aid_kit(item_slot: Dictionary, item_data) -> Dictionary:
	if hp >= max_hp:
		return {"success": false, "message": "Sei già in piena salute", "consumed": false}
	
	var healing = min(25, max_hp - hp)  # Cura max 25 HP
	heal(healing)
	
	# Cura status negativi
	if is_bleeding:
		is_bleeding = false
		status_effect_removed.emit("bleeding")
	
	remove_item_from_inventory(item_data.id, 1)
	
	var message = "Kit pronto soccorso usato: +%d HP" % healing
	if not is_bleeding:
		message += ", emorragia fermata"
	
	print("🏥 " + message)
	return {"success": true, "message": message, "consumed": true}

## Sistema status effects
func _apply_poison_effect():
	"""Applica effetto veleno"""
	is_sick = true
	status_effect_added.emit("poisoned")
	print("☠️ Sei stato avvelenato!")

func _apply_sickness_effect():
	"""Applica effetto malattia"""
	is_sick = true
	status_effect_added.emit("sick")
	take_damage(randi_range(2, 5), "sickness")
	print("🤒 Ti senti male!")

func _cure_status_effect(status: String) -> bool:
	"""Cura uno status effect specifico"""
	match status:
		"sick":
			if is_sick:
				is_sick = false
				status_effect_removed.emit("sick")
				return true
		"bleeding":
			if is_bleeding:
				is_bleeding = false
				status_effect_removed.emit("bleeding")
				return true
	return false

func _apply_temporary_boost(stat_name: String, amount: int, duration: float):
	"""Applica boost temporaneo a una stat"""
	# TODO: Implementare sistema boost temporanei
	print("💪 Boost temporaneo: +%d %s per %ds" % [amount, stat_name, duration])

## Utility functions
func _find_item_in_inventory(item_id: String) -> Dictionary:
	"""Trova slot oggetto nell'inventario (v1.8.2 robusto)"""
	if item_id.is_empty():
		return {}
	
	for slot in inventory:
		if slot.get("id", "") == item_id or slot.get("item_id", "") == item_id:
			return slot
	return {}

## NUOVO: Gestione oggetti corrotti (v1.8.2)
func _remove_corrupted_item(item_id: String):
	"""Rimuove oggetto corrotto dall'inventario in modo sicuro"""
	print("🗑️ Rimozione oggetto corrotto: %s" % item_id)
	
	for i in range(inventory.size() - 1, -1, -1):
		var slot = inventory[i]
		if slot.get("id", "") == item_id or slot.get("item_id", "") == item_id:
			inventory.remove_at(i)
			print("✅ Oggetto corrotto rimosso dallo slot %d" % i)
			inventory_changed.emit("removed_corrupted", null, 1)
			break

## Validazione completa inventario (per debug)
func validate_inventory() -> Dictionary:
	"""Valida tutto l'inventario e restituisce report dettagliato"""
	print("🔍 Validazione inventario completa...")
	
	var report = {
		"total_slots": inventory.size(),
		"valid_items": 0,
		"corrupted_items": 0,
		"missing_database": 0,
		"empty_slots": 0,
		"errors": []
	}
	
	var game_manager = get_node("../../GameManager") as GameManager
	var item_db = game_manager.get_item_database() if game_manager else null
	
	if not item_db:
		report.errors.append("Database non disponibile")
		return report
	
	for i in range(inventory.size()):
		var slot = inventory[i]
		var item_id = slot.get("item_id", slot.get("id", ""))
		
		if item_id.is_empty():
			report.empty_slots += 1
			report.errors.append("Slot %d: ID vuoto" % i)
			continue
		
		var item_data = item_db.get_item(item_id)
		if not item_data:
			report.missing_database += 1
			report.errors.append("Slot %d: '%s' non in database" % [i, item_id])
		else:
			# Verifica consistenza dati slot
			var quantity = slot.get("quantity", 0)
			if quantity <= 0:
				report.corrupted_items += 1
				report.errors.append("Slot %d: quantità invalida (%d)" % [i, quantity])
			else:
				report.valid_items += 1
	
	print("📊 Report validazione inventario: %s" % str(report))
	return report

func has_item_simple(item_id: String) -> bool:
	"""Verifica se ha un oggetto in inventario"""
	return not _find_item_in_inventory(item_id).is_empty()

## API per UI
func can_use_item(item_id: String) -> bool:
	"""Verifica se oggetto può essere usato"""
	var item_slot = _find_item_in_inventory(item_id)
	if not item_slot:
		return false
	
	var game_manager = get_node("../../GameManager") as GameManager
	var item_db = game_manager.get_item_database() if game_manager else null
	if not item_db:
		return false
	
	var item_data = item_db.get_item(item_id)
	if not item_data:
		return false
	
	return item_data.usable

func get_item_use_info(item_id: String) -> String:
	"""Restituisce info uso oggetto per tooltip"""
	var game_manager = get_node("../../GameManager") as GameManager
	var item_db = game_manager.get_item_database() if game_manager else null
	if not item_db:
		return ""
	
	var item_data = item_db.get_item(item_id)
	if not item_data:
		return ""
	
	if not item_data.usable:
		return "Non usabile"
	
	var info = []
	var effects = item_data.effects if item_data.effects else []
	
	for effect in effects:
		# Gli effects sono stringhe JSON, quindi le parsing
		var effect_dict = JSON.parse_string(effect) if effect is String else effect
		if effect_dict:
			match effect_dict.get("type", ""):
				"add_resource":
					if effect_dict.get("resource_type") == "food":
						info.append("+%d Cibo" % effect_dict.get("amount", 0))
					elif effect_dict.get("resource_type") == "water":
						info.append("+%d Acqua" % effect_dict.get("amount", 0))
					elif effect_dict.get("resource_type") == "hp":
						info.append("+%d HP" % effect_dict.get("amount", 0))
	
	var portions = item_data.max_portions if item_data.max_portions > 1 else 1
	if portions > 1:
		info.append("(%d porzioni)" % portions)
	
	return ", ".join(info) if info.size() > 0 else "Usabile"

# Segnale per notificare uso oggetti
signal item_used(item_id: String, result: Dictionary)

## Combat System Integration (POTENZIATO CON EQUIPMENT BONUS)
func get_attack_power() -> int:
	var base_attack = pot # Power stat as base attack
	var weapon_bonus = _get_weapon_attack_bonus()
	var equipment_bonus = get_equipment_bonus("attack")
	return base_attack + weapon_bonus + equipment_bonus

func get_defense_power() -> int:
	var base_defense = vig # Vigor stat as base defense
	var armor_bonus = _get_armor_defense_bonus()
	var equipment_bonus = get_equipment_bonus("defense")
	return base_defense + armor_bonus + equipment_bonus

func _get_weapon_attack_bonus() -> int:
	var weapon = get_equipped_weapon()
	if weapon:
		return weapon.get("damage", 0)
	return 0

func _get_armor_defense_bonus() -> int:
	var armor = get_equipped_armor()
	if armor:
		return armor.get("defense", 0)
	return 0

func get_equipped_weapon():
	if equipped.has("weapon"):
		return equipped["weapon"]
	return null

func get_equipped_armor():
	if equipped.has("armor"):
		return equipped["armor"]
	return null

func has_item_in_inventory(item_id: String) -> bool:
	return has_item(item_id, 1)

## Save System Integration
func get_save_data() -> Dictionary:
	return {
		"stats": {
			"hp": hp,
			"max_hp": max_hp,
			"food": food,
			"water": water,
			"exp": exp,
			"level": level,
			"pts": pts,
			"vig": vig,
			"pot": pot,
			"agi": agi,
			"tra": tra,
			"inf": inf,
			"pre": pre,
			"ada": ada
		},
		"inventory": _serialize_inventory(),
		"equipped": _serialize_equipment(),
		"status": {
			"current_location": current_location,
			"is_hungry": is_hungry,
			"is_thirsty": is_thirsty,
			"is_sick": is_sick,
			"is_bleeding": is_bleeding
		}
	}

func load_save_data(data: Dictionary):
	if data.has("stats"):
		var stats = data["stats"]
		hp = stats.get("hp") if stats.has("hp") else hp
		max_hp = stats.get("max_hp") if stats.has("max_hp") else max_hp
		food = stats.get("food") if stats.has("food") else food
		water = stats.get("water") if stats.has("water") else water
		exp = stats.get("exp") if stats.has("exp") else exp
		level = stats.get("level") if stats.has("level") else level
		pts = stats.get("pts") if stats.has("pts") else pts
		vig = stats.get("vig") if stats.has("vig") else vig
		pot = stats.get("pot") if stats.has("pot") else pot
		agi = stats.get("agi") if stats.has("agi") else agi
		tra = stats.get("tra") if stats.has("tra") else tra
		inf = stats.get("inf") if stats.has("inf") else inf
		pre = stats.get("pre") if stats.has("pre") else pre
		ada = stats.get("ada") if stats.has("ada") else ada

	if data.has("inventory"):
		_deserialize_inventory(data["inventory"])

	if data.has("equipped"):
		_deserialize_equipment(data["equipped"])

	if data.has("status"):
		var status = data["status"]
		current_location = status.get("current_location", current_location)
		is_hungry = status.get("is_hungry", is_hungry)
		is_thirsty = status.get("is_thirsty", is_thirsty)
		is_sick = status.get("is_sick", is_sick)
		is_bleeding = status.get("is_bleeding", is_bleeding)

func _serialize_inventory() -> Array:
	var serialized = []
	for slot in inventory:
		serialized.append({
			"item_id": slot.item_id,
			"quantity": slot.quantity
		})
	return serialized

func _deserialize_inventory(data: Array):
	inventory.clear()
	for slot_data in data:
		inventory.append({
			"item_id": slot_data.get("item_id", ""),
			"quantity": slot_data.get("quantity", 1),
			"stackable": _is_item_stackable(slot_data.get("item_id", ""))
		})

func _serialize_equipment() -> Dictionary:
	var serialized = {}
	for slot in equipped:
		var item = equipped[slot]
		if item:
			serialized[slot] = item.get("id", "")
	return serialized

func _deserialize_equipment(data: Dictionary):
	equipped.clear()
	# Equipment deserialization will be handled by SaveManager
	# which has access to ItemDatabase

## Event System Integration
func can_afford_cost(cost: Dictionary) -> bool:
	for resource in cost:
		var required = cost[resource]
		var current = 0

		# Get current value of the resource
		if resource == "food":
			current = food
		elif resource == "water":
			current = water
		elif resource == "hp":
			current = hp
		elif resource == "exp":
			current = exp
		elif resource == "vig":
			current = vig
		elif resource == "pot":
			current = pot
		elif resource == "agi":
			current = agi
		elif resource == "tra":
			current = tra
		elif resource == "inf":
			current = inf
		elif resource == "pre":
			current = pre
		elif resource == "ada":
			current = ada

		if current < required:
			return false
	return true

func pay_cost(cost: Dictionary) -> bool:
	if not can_afford_cost(cost):
		return false

	for resource in cost:
		var amount = cost[resource]

		# Pay the cost by directly modifying the appropriate resource
		if resource == "food":
			food = max(0, food - amount)
		elif resource == "water":
			water = max(0, water - amount)
		elif resource == "hp":
			hp = max(0, hp - amount)
		elif resource == "exp":
			exp = max(0, exp - amount)

	return true

## Map System Integration
func can_travel() -> bool:
	return hp > 10 and food > 5 and water > 5 # Minimum requirements

func get_travel_efficiency() -> float:
	# Based on agi stat and current health
	var health_factor = float(hp) / float(max_hp)
	var agility_factor = float(agi) / 20.0 # Normalize agility
	return (health_factor + agility_factor) / 2.0

## Resource management for events
func consume_food(amount: int) -> bool:
	if food >= amount:
		var old_food = food
		food -= amount
		stats_changed.emit("food", old_food, food)
		return true
	return false

func consume_water(amount: int) -> bool:
	if water >= amount:
		var old_water = water
		water -= amount
		stats_changed.emit("water", old_water, water)
		return true
	return false

func restore_food(amount: int):
	var old_food = food
	food = min(100, food + amount)
	stats_changed.emit("food", old_food, food)

func restore_water(amount: int):
	var old_water = water
	water = min(100, water + amount)
	stats_changed.emit("water", old_water, water)

## Utility Functions
func get_stats_dict() -> Dictionary:
	return {
		"hp": hp,
		"max_hp": max_hp,
		"food": food,
		"water": water,
		"exp": exp,
		"level": level,
		"attack": attack,
		"defense": defense,
		"agility": agility,
		"inventory_slots": inventory.size(),
		"max_inventory_slots": max_inventory_slots,
		"current_location": current_location,
		"is_hungry": is_hungry,
		"is_thirsty": is_thirsty,
		"is_sick": is_sick,
		"is_bleeding": is_bleeding
	}

## Alias per compatibilità con test Session #006
func get_stats() -> Dictionary:
	return get_stats_dict()

func get_inventory_summary() -> Dictionary:
	var summary = {}

	for slot in inventory:
		var item_id = slot.item_id
		var quantity = slot.quantity

		if summary.has(item_id):
			summary[item_id] += quantity
		else:
			summary[item_id] = quantity

	return summary

func print_status():
	print("👤 PLAYER STATUS:")
	print("   HP: %d/%d" % [hp, max_hp])
	print("   Food: %d" % food)
	print("   Water: %d" % water)
	print("   EXP: %d (Level %d)" % [exp, level])
	print("   Inventory: %d/%d slots" % [inventory.size(), max_inventory_slots])
	print("   Location: %s" % current_location)
	print("   Status: Hungry=%s, Thirsty=%s" % [is_hungry, is_thirsty])

func print_inventory():
	print("🎒 INVENTORY:")
	if inventory.is_empty():
		print("   (vuoto)")
	else:
		for i in range(inventory.size()):
			var slot = inventory[i]
			print("   %d. %s x%d" % [i + 1, slot.item_id, slot.quantity])

func _add_test_items_safeplace():
	"""DEPRECATO: Oggetti legacy rimossi per pulizia inventario v1.8.2"""
	print("🗑️ _add_test_items_safeplace() DEPRECATO - inventario ora usa solo oggetti database")
	# Tutti gli oggetti di test sono ora gestiti da _add_test_safeplace_objects()
	# che usa SOLO oggetti esistenti nel database

func get_inventory_display() -> Array[Dictionary]:
	"""Restituisce l'inventario formattato per MainInterface"""
	var display_array: Array[Dictionary] = []

	for slot in inventory:
		var item_data = {
			"id": slot.item_id,
			"name": _get_item_display_name(slot.item_id),
			"quantity": slot.quantity,
			"stackable": slot.get("stackable", false)
		}
		display_array.append(item_data)

	return display_array

func _get_item_display_name(item_id: String) -> String:
	"""Converte l'ID oggetto in nome visualizzabile SafePlace style"""
	var name_mapping = {
		"bende_sporche": "Bende Sporche",
		"acqua_bottiglia": "Bott. Acqua G.",
		"cibo_scatola": "Cibo in Scatola",
		"metallo_rottame": "Metallo Rottame",
		"coltello_arrugginito": "Coltello Arrugginito",
		"stracci_stoffa": "Stracci di Stoffa",
		"carbone": "Carbone",
		"latta_cibo": "Lattina Cibo",
		"health_potion": "Pozione Cura",
		"food_can": "Cibo in Scatola",
		"water_bottle": "Bottiglia Acqua"
	}

	return name_mapping.get(item_id, item_id.capitalize().replace("_", " "))

func _setup_initial_stats():
	"""Imposta le statistiche iniziali del player SafePlace"""
	# Stats base SafePlace
	hp = 95
	max_hp = 95
	food = 6
	water = 6
	exp = 0
	level = 1
	pts = 0

	# Stats D&D-style SafePlace
	vig = 5 # Vigore
	pot = 3 # Potenza
	agi = 4 # Agilità
	tra = 6 # Tracce
	inf = 4 # Influenza
	pre = 6 # Presagio
	ada = 0 # Adattamento

	print("📊 Stats iniziali SafePlace impostate")

func _add_test_safeplace_objects():
	"""VERSIONE v1.8.2: SOLO oggetti VERIFICATI nel database ItemDatabase.populate_with_original_items()"""
	print("🧪 Aggiunta oggetti SafePlace database-verified (v1.8.2 clean)...")
	
	# CIBO - SOLO ID verificati in ItemDatabase.populate_with_original_items()
	add_item_to_inventory("canned_food", 2)        # ✅ Verificato: Cibo in Scatola Generico
	add_item_to_inventory("ration_pack", 1)        # ✅ Verificato: Razione K da Campo
	add_item_to_inventory("berries", 3)            # ✅ Verificato: Bacche Comuni
	add_item_to_inventory("protein_bar_old", 1)    # ✅ Verificato: Barretta Proteica Vecchia
	
	# ACQUA - SOLO ID verificati nel database  
	add_item_to_inventory("water_bottle", 2)       # ✅ Verificato: Bottiglia d'Acqua Grande
	add_item_to_inventory("water_purified_small", 1) # ✅ Verificato: Acqua Purificata (Piccola)
	add_item_to_inventory("rainwater_collected", 1) # ✅ Verificato: Acqua Piovana Raccolta
	add_item_to_inventory("water_dirty", 1)        # ✅ Verificato: Acqua Sporca (pericolosa)
	
	# MEDICINE - SOLO ID verificati nel database
	add_item_to_inventory("first_aid_kit", 1)      # ✅ Verificato: Kit Pronto Soccorso
	add_item_to_inventory("bandages_clean", 2)     # ✅ Verificato: Bende Pulite
	add_item_to_inventory("antidote", 1)           # ✅ Verificato: Antidoto
	add_item_to_inventory("vitamins", 2)           # ✅ Verificato: Vitamine
	add_item_to_inventory("painkillers", 1)        # ✅ Verificato: Antidolorifici
	
	# RISORSE - SOLO ID verificati nel database
	add_item_to_inventory("scrap_metal", 5)        # ✅ Verificato: Metallo Riciclato
	add_item_to_inventory("cloth_rags", 4)         # ✅ Verificato: Stracci di Stoffa
	add_item_to_inventory("rope", 2)               # ✅ Verificato: Corda
	add_item_to_inventory("mechanical_parts", 3)   # ✅ Verificato: Parti Meccaniche
	add_item_to_inventory("wood_planks", 2)        # ✅ Verificato: Assi di Legno
	
	print("✅ Oggetti SafePlace DATABASE-VERIFIED aggiunti (v1.8.2 clean compatibility)")

## NUOVO SISTEMA EQUIPMENT BONUS - FASE 2
func get_equipment_bonus(bonus_type: String) -> int:
	"""Calcola bonus da equipaggiamento"""
	# TODO: Implementare sistema bonus equipaggiamento
	return 0

## EQUIPMENT MANAGEMENT AVANZATO
func equip_item(item_id: String, slot: String = "") -> bool:
	"""Equipaggia item dal database reale"""
	if not has_item(item_id):
		print("❌ Item non in inventario: ", item_id)
		return false

	var game_manager = get_node("../../GameManager") as GameManager
	var item_db = game_manager.get_item_database() if game_manager else null
	if not item_db:
		print("❌ ItemDatabase non disponibile")
		return false

	var item = item_db.get_item(item_id)
	if not item:
		print("❌ Item non trovato nel database: ", item_id)
		return false

	if not item.equipable:
		print("❌ Item non equipaggiabile: ", item_id)
		return false

	# Determina slot automaticamente se non specificato
	if slot.is_empty():
		slot = _determine_equipment_slot(item)

	if slot.is_empty():
		print("❌ Impossibile determinare slot per: ", item_id)
		return false

	# Rimuovi item precedente se presente
	if equipped[slot] != null:
		unequip_item(slot)

	# Equipaggia nuovo item
	equipped[slot] = item_id
	remove_item_from_inventory(item_id, 1)

	print("⚔️ Item equipaggiato: ", item.name, " in slot ", slot)
	equipment_changed.emit(slot, item)

	# Trigger bonus update
	_equipment_bonus_cache.clear()
	_last_equipment_hash = ""

	return true

func unequip_item(slot: String) -> bool:
	"""Rimuove item equipaggiato e lo rimette in inventario"""
	if not equipped.has(slot) or equipped[slot] == null:
		print("❌ Nessun item equipaggiato in slot: ", slot)
		return false

	var item_id = equipped[slot]
	equipped[slot] = null

	if not add_item_to_inventory(item_id, 1):
		# Se inventario pieno, riequipaggia
		equipped[slot] = item_id
		print("❌ Inventario pieno, impossibile unequippare: ", item_id)
		return false

	print("🎒 Item rimosso: ", item_id, " da slot ", slot)
	equipment_changed.emit(slot, null)

	# Trigger bonus update
	_equipment_bonus_cache.clear()
	_last_equipment_hash = ""

	return true

func _determine_equipment_slot(item: Item) -> String:
	"""Determina slot equipment automaticamente"""
	if item.is_weapon():
		return "weapon"
	elif item.is_armor():
		return item.slot # head, body, legs, feet, accessory
	elif item.is_tool():
		return "accessory"
	else:
		return ""

## STATISTICHE DETTAGLIATE CON BONUS
func get_detailed_stats() -> Dictionary:
	"""Restituisce stats complete con bonus equipment"""
	var base_stats = get_stats_dict()

	# Aggiungi bonus equipment
	var equipment_bonuses = get_all_equipment_bonuses()

	# Combina stats base con bonus
	var detailed = {
		"base_stats": base_stats,
		"equipment_bonuses": equipment_bonuses,
		"total_attack": get_attack_power(),
		"total_defense": get_defense_power(),
		"equipped_items": _get_equipped_items_info()
	}

	return detailed

func get_all_equipment_bonuses() -> Dictionary:
	"""Restituisce tutti i bonus equipment attivi"""
	_update_equipment_bonus_cache()
	return _equipment_bonus_cache.duplicate()

func _get_equipped_items_info() -> Dictionary:
	"""Restituisce info dettagliate sugli item equipaggiati"""
	var game_manager = get_node("../../GameManager") as GameManager
	var item_db = game_manager.get_item_database() if game_manager else null
	var equipped_info = {}

	if not item_db:
		return equipped_info

	for slot in equipped.keys():
		var item_id = equipped[slot]
		if item_id != null:
			var item = item_db.get_item(item_id)
			if item:
				equipped_info[slot] = {
					"id": item_id,
					"name": item.name,
					"type": item.type,
					"condition": item.get_condition_percentage()
				}

	return equipped_info

## INTEGRAZIONE CON UI
func get_equipment_display() -> Dictionary:
	"""Restituisce equipment formattato per MainInterface"""
	var display_data = {}
	var game_manager = get_node("../../GameManager") as GameManager
	var item_db = game_manager.get_item_database() if game_manager else null

	if not item_db:
		return display_data

	for slot in equipped.keys():
		var item_id = equipped[slot]
		if item_id != null:
			var item = item_db.get_item(item_id)
			if item:
				display_data[slot] = {
					"name": item.get_display_name(),
					"condition": "%.0f%%" % item.get_condition_percentage(),
					"bonus": _get_item_bonus_summary(item)
				}
		else:
			display_data[slot] = {"name": "Vuoto", "condition": "", "bonus": ""}

	return display_data

func _get_item_bonus_summary(item: Item) -> String:
	"""Genera sommario bonus per UI"""
	var bonuses = []

	if item.is_weapon():
		bonuses.append("ATK +%d" % ((item.damage_min + item.damage_max) / 2))

	if item.is_armor():
		bonuses.append("DEF +%d" % item.armorValue)

	return ", ".join(bonuses)

## Funzioni tool aggiuntive
func _use_repair_kit(item_slot: Dictionary, item_data) -> Dictionary:
	"""Ripara oggetti danneggiati"""
	# TODO: Implementare sistema riparazione oggetti
	remove_item_from_inventory(item_data.id, 1)
	return {"success": true, "message": "Kit riparazione usato (funzionalità in sviluppo)", "consumed": true}

func _use_purification_tablet(item_slot: Dictionary, item_data) -> Dictionary:
	"""Purifica acqua contaminata"""
	# TODO: Implementare sistema purificazione acqua
	remove_item_from_inventory(item_data.id, 1)
	return {"success": true, "message": "Pastiglia purificazione usata (funzionalità in sviluppo)", "consumed": true}

## EQUIPMENT BONUS CACHE MANAGEMENT
func _update_equipment_bonus_cache():
	"""Aggiorna cache bonus equipment per performance"""
	var current_hash = _calculate_equipment_hash()
	
	# Se equipment non è cambiato, usa cache esistente
	if current_hash == _last_equipment_hash and not _equipment_bonus_cache.is_empty():
		return
	
	# Ricalcola bonus
	_equipment_bonus_cache.clear()
	_last_equipment_hash = current_hash
	
	var game_manager = get_node("../../GameManager") as GameManager
	var item_db = game_manager.get_item_database() if game_manager else null
	
	if not item_db:
		return
	
	# Calcola bonus per ogni item equipaggiato
	for slot in equipped.keys():
		var item_id = equipped[slot]
		if item_id != null:
			var item = item_db.get_item(item_id)
			if item and item.bonuses:
				for bonus_type in item.bonuses.keys():
					var bonus_value = item.bonuses[bonus_type]
					if _equipment_bonus_cache.has(bonus_type):
						_equipment_bonus_cache[bonus_type] += bonus_value
					else:
						_equipment_bonus_cache[bonus_type] = bonus_value

func _calculate_equipment_hash() -> String:
	"""Calcola hash equipment per cache invalidation"""
	var equipment_string = ""
	var sorted_slots = equipped.keys()
	sorted_slots.sort()
	
	for slot in sorted_slots:
		var item_id = equipped[slot]
		equipment_string += slot + ":" + str(item_id) + ";"
	
	return equipment_string.md5_text()

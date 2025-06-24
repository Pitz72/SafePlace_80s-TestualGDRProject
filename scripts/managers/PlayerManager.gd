extends Node

## PlayerManager Singleton - The Safe Place v0.1.2
## 
## Gestisce tutti i dati del personaggio giocatore (statistiche, inventario, risorse).
## Progettato come Singleton (Autoload) per accesso globale allo stato del player.
## 
## Milestone 2: Gameplay Core - Sistema centrale di gestione personaggio
## Integrato con DataManager per validazione oggetti e proprietà avanzate.

# ========================================
# SEGNALI PUBBLICI
# ========================================

## Emesso quando l'inventario cambia (aggiunta/rimozione oggetti)
signal inventory_changed

## Emesso quando le statistiche del player cambiano
signal stats_changed

## Emesso quando HP, food o water cambiano
signal resources_changed

# ========================================
# RISORSE VITALI
# ========================================

## Punti vita correnti
var hp: int = 100
## Punti vita massimi
var max_hp: int = 100

## Livello fame corrente (0 = affamato)
var food: int = 100
## Livello fame massimo
var max_food: int = 100

## Livello sete corrente (0 = assetato)
var water: int = 100
## Livello sete massimo
var max_water: int = 100

# ========================================
# STATISTICHE PERSONAGGIO
# ========================================

## Statistiche del personaggio
## Chiavi: "forza", "agilita", "intelligenza", "carisma", "fortuna"
var stats: Dictionary = {}

# ========================================
# INVENTARIO E EQUIPAGGIAMENTO
# ========================================

## Inventario del giocatore
## Struttura: Array di Dictionary { "item_id": String, "quantity": int }
var inventory: Array[Dictionary] = []

## Arma equipaggiata corrente
## Struttura: Dictionary con dati completi dell'arma (da DataManager)
var equipped_weapon: Dictionary = {}

## Armatura equipaggiata corrente  
## Struttura: Dictionary con dati completi dell'armatura (da DataManager)
var equipped_armor: Dictionary = {}

# ========================================
# INIZIALIZZAZIONE
# ========================================

func _ready() -> void:
	print("🎮 PlayerManager inizializzazione...")
	_initialize_new_character()
	print("✅ PlayerManager pronto - Personaggio inizializzato")

## Inizializza un nuovo personaggio con valori di default
func _initialize_new_character() -> void:
	print("👤 Inizializzazione nuovo personaggio...")
	
	# RISORSE VITALI DI DEFAULT
	hp = 100
	max_hp = 100
	food = 100
	max_food = 100
	water = 100
	max_water = 100
	
	# STATISTICHE DI DEFAULT
	stats = {
		"forza": 10,        # Influenza danno fisico e peso trasportabile
		"agilita": 10,      # Influenza velocità e schivata
		"intelligenza": 10, # Influenza crafting e risoluzione puzzle
		"carisma": 10,      # Influenza dialoghi e prezzi
		"fortuna": 10       # Influenza loot e eventi casuali
	}
	
	# INVENTARIO VUOTO
	inventory.clear()
	
	# EQUIPAGGIAMENTO VUOTO
	equipped_weapon.clear()
	equipped_armor.clear()
	
	# OGGETTI DI PARTENZA (opzionale - solo per testing)
	_add_starting_items()
	
	print("   ✅ Risorse: HP=%d/%d, Food=%d/%d, Water=%d/%d" % [hp, max_hp, food, max_food, water, max_water])
	print("   ✅ Statistiche: %s" % str(stats))
	print("   ✅ Inventario inizializzato con %d slot occupati" % inventory.size())

## Aggiunge oggetti di partenza per testing del sistema
func _add_starting_items() -> void:
	# Solo se DataManager è disponibile, aggiungi alcuni oggetti base
	if not DataManager:
		print("   ⚠️ DataManager non disponibile - inventario vuoto")
		return
	
	# Oggetti base per iniziare il gameplay (usando oggetti reali dal database)
	var starting_items = [
		{"item_id": "weapon_knife_rusty", "quantity": 1},
		{"item_id": "ration_pack", "quantity": 3},
		{"item_id": "water_purified", "quantity": 2}
	]
	
	for starting_item in starting_items:
		if DataManager.has_item(starting_item.item_id):
			add_item(starting_item.item_id, starting_item.quantity)
		else:
			print("   ⚠️ Oggetto di partenza non trovato: %s" % starting_item.item_id)

# ========================================
# API INVENTARIO
# ========================================

## Aggiunge un oggetto all'inventario
## @param item_id: ID univoco dell'oggetto (deve esistere in DataManager)
## @param quantity: Quantità da aggiungere (deve essere > 0)
## @return: true se aggiunto con successo, false altrimenti
func add_item(item_id: String, quantity: int) -> bool:
	if quantity <= 0:
		print("⚠️ PlayerManager: Quantità non valida: %d" % quantity)
		return false
	
	# Verifica che l'oggetto esista nel DataManager
	if not DataManager or not DataManager.has_item(item_id):
		print("❌ PlayerManager: Oggetto non trovato nel database: %s" % item_id)
		return false
	
	# Ottieni dati oggetto per verificare se è stackable
	var item_data = DataManager.get_item_data(item_id)
	var is_stackable = item_data.get("stackable", true)  # Default: stackable
	
	# Cerca se l'oggetto è già nell'inventario
	var existing_slot = _find_inventory_slot(item_id)
	
	if existing_slot != -1 and is_stackable:
		# OGGETTO STACKABLE GIÀ PRESENTE: incrementa quantità
		inventory[existing_slot].quantity += quantity
		print("📦 Aggiunto %dx %s (stack esistente, totale: %d)" % [quantity, item_id, inventory[existing_slot].quantity])
	else:
		# NUOVO OGGETTO O NON STACKABLE: crea nuovo slot
		var new_slot = {
			"item_id": item_id,
			"quantity": quantity
		}
		inventory.append(new_slot)
		print("📦 Aggiunto %dx %s (nuovo slot)" % [quantity, item_id])
	
	# Emetti segnale di cambiamento
	inventory_changed.emit()
	return true

## Rimuove un oggetto dall'inventario
## @param item_id: ID oggetto da rimuovere
## @param quantity: Quantità da rimuovere (deve essere > 0)
## @return: true se rimosso con successo, false se non c'è abbastanza quantità
func remove_item(item_id: String, quantity: int) -> bool:
	if quantity <= 0:
		print("⚠️ PlayerManager: Quantità non valida: %d" % quantity)
		return false
	
	var slot_index = _find_inventory_slot(item_id)
	if slot_index == -1:
		print("⚠️ PlayerManager: Oggetto non presente nell'inventario: %s" % item_id)
		return false
	
	var current_quantity = inventory[slot_index].quantity
	if current_quantity < quantity:
		print("⚠️ PlayerManager: Quantità insufficiente per %s (disponibile: %d, richiesto: %d)" % [item_id, current_quantity, quantity])
		return false
	
	# Rimuovi quantità
	inventory[slot_index].quantity -= quantity
	
	# Se quantità = 0, rimuovi completamente lo slot
	if inventory[slot_index].quantity == 0:
		inventory.remove_at(slot_index)
		print("📦 Rimosso completamente %s dall'inventario" % item_id)
	else:
		print("📦 Rimosso %dx %s (rimanente: %d)" % [quantity, item_id, inventory[slot_index].quantity])
	
	# Emetti segnale di cambiamento
	inventory_changed.emit()
	return true

## Controlla se il giocatore ha un oggetto specifico
## @param item_id: ID oggetto da cercare
## @return: true se presente (quantità > 0), false altrimenti
func has_item(item_id: String) -> bool:
	return get_item_count(item_id) > 0

## Restituisce la quantità di un oggetto nell'inventario
## @param item_id: ID oggetto da contare
## @return: Quantità posseduta (0 se non presente)
func get_item_count(item_id: String) -> int:
	var slot_index = _find_inventory_slot(item_id)
	if slot_index != -1:
		return inventory[slot_index].quantity
	return 0

## Usa un oggetto dall'inventario (consumo con effetti)
## @param item_id: ID oggetto da usare
## @param quantity: Quantità da usare (default 1)
## @return: true se usato con successo, false altrimenti
func use_item(item_id: String, quantity: int = 1) -> bool:
	# Verifica che abbiamo l'oggetto
	if not has_item(item_id) or get_item_count(item_id) < quantity:
		print("⚠️ PlayerManager: Oggetto non disponibile o quantità insufficiente: %s" % item_id)
		return false
	
	# Ottieni dati oggetto per applicare effetti
	var item_data = DataManager.get_item_data(item_id)
	if not item_data:
		print("❌ PlayerManager: Dati oggetto non trovati: %s" % item_id)
		return false
	
	# Applica effetti basati sul tipo oggetto
	var item_type = item_data.get("type", "unknown")
	var item_name = item_data.get("name", item_id)
	
	match item_type:
		"consumable":
			_apply_consumable_effects(item_data, quantity)
		"weapon":
			print("⚠️ Armi non possono essere 'usate' direttamente. Usa equip_weapon()")
			return false
		"armor":
			print("⚠️ Armature non possono essere 'usate' direttamente. Usa equip_armor()")
			return false
		_:
			print("⚠️ Tipo oggetto non gestito per uso: %s" % item_type)
			# Per oggetti senza effetti, li rimuoviamo comunque
	
	# Rimuovi oggetto dall'inventario (consumo)
	if not remove_item(item_id, quantity):
		print("❌ PlayerManager: Errore rimozione oggetto dopo uso: %s" % item_id)
		return false
	
	print("✅ Usato %dx %s" % [quantity, item_name])
	return true

## Applica gli effetti di un oggetto consumabile
## @param item_data: Dati completi dell'oggetto
## @param quantity: Quantità usata (per moltiplicare effetti)
func _apply_consumable_effects(item_data: Dictionary, quantity: int) -> void:
	var effects = item_data.get("effects", [])
	var effects_applied = []
	
	# Itera through array of effects
	for effect in effects:
		var effect_type = effect.get("type", "")
		var amount = effect.get("amount", 0)
		
		match effect_type:
			"heal":
				modify_hp(amount * quantity)
				effects_applied.append("Cura: +%d HP" % (amount * quantity))
			"nourish":
				modify_food(amount * quantity)
				effects_applied.append("Nutrimento: +%d Food" % (amount * quantity))
			"hydrate":
				modify_water(amount * quantity)
				effects_applied.append("Idratazione: +%d Water" % (amount * quantity))
			"restore_stamina":
				# Placeholder per stamina quando implementata
				effects_applied.append("Stamina: +%d (placeholder)" % (amount * quantity))
			"add_radiation":
				# Placeholder per radiazioni quando implementate
				effects_applied.append("Radiazioni: +%d (placeholder)" % (amount * quantity))
			"infection_chance", "poison_chance":
				# Placeholder per effetti negativi probabilistici
				var chance = effect.get("chance", 0.0)
				effects_applied.append("Rischio %s: %.1f%%" % [effect_type.replace("_chance", ""), chance * 100])
			_:
				print("⚠️ Effetto non gestito: %s" % effect_type)
	
	if effects_applied.size() > 0:
		print("⚡ Effetti applicati da %s (x%d): %s" % [item_data.get("name", "oggetto"), quantity, ", ".join(effects_applied)])
	else:
		print("⚡ Nessun effetto applicabile da %s" % item_data.get("name", "oggetto"))

## Trova l'indice dello slot inventario contenente l'oggetto specificato
## @param item_id: ID oggetto da cercare
## @return: Indice slot (0-based) o -1 se non trovato
func _find_inventory_slot(item_id: String) -> int:
	for i in range(inventory.size()):
		if inventory[i].item_id == item_id:
			return i
	return -1

# ========================================
# API RISORSE VITALI
# ========================================

## Modifica i punti vita del giocatore
## @param amount: Quantità da aggiungere (negativo per danno)
## @param allow_overheal: Se true, permette di superare max_hp
func modify_hp(amount: int, allow_overheal: bool = false) -> void:
	var old_hp = hp
	hp += amount
	
	if not allow_overheal and hp > max_hp:
		hp = max_hp
	elif hp < 0:
		hp = 0
	
	if hp != old_hp:
		print("❤️ HP: %d → %d (%+d)" % [old_hp, hp, amount])
		resources_changed.emit()

## Modifica il livello di fame
## @param amount: Quantità da aggiungere (negativo per perdere cibo)
func modify_food(amount: int) -> void:
	var old_food = food
	food = clamp(food + amount, 0, max_food)
	
	if food != old_food:
		print("🍖 Food: %d → %d (%+d)" % [old_food, food, amount])
		resources_changed.emit()

## Modifica il livello di sete
## @param amount: Quantità da aggiungere (negativo per perdere acqua)
func modify_water(amount: int) -> void:
	var old_water = water
	water = clamp(water + amount, 0, max_water)
	
	if water != old_water:
		print("💧 Water: %d → %d (%+d)" % [old_water, water, amount])
		resources_changed.emit()

# ========================================
# API STATISTICHE
# ========================================

## Modifica una statistica del personaggio
## @param stat_name: Nome statistica ("forza", "agilita", etc.)
## @param amount: Quantità da aggiungere (può essere negativo)
func modify_stat(stat_name: String, amount: int) -> void:
	if not stats.has(stat_name):
		print("⚠️ PlayerManager: Statistica non riconosciuta: %s" % stat_name)
		return
	
	var old_value = stats[stat_name]
	stats[stat_name] = max(0, stats[stat_name] + amount)  # Min 0
	
	if stats[stat_name] != old_value:
		print("📈 %s: %d → %d (%+d)" % [stat_name.capitalize(), old_value, stats[stat_name], amount])
		stats_changed.emit()

## Ottiene il valore di una statistica
## @param stat_name: Nome statistica
## @return: Valore corrente della statistica (0 se non esiste)
func get_stat(stat_name: String) -> int:
	return stats.get(stat_name, 0)

# ========================================
# API DEBUG E UTILITÀ
# ========================================

## Stampa un report completo dello stato del personaggio
func print_character_status() -> void:
	print("\n" + "=".repeat(40))
	print("👤 PLAYER STATUS REPORT")
	print("=".repeat(40))
	print("❤️ HP: %d/%d (%.1f%%)" % [hp, max_hp, (float(hp)/max_hp)*100])
	print("🍖 Food: %d/%d (%.1f%%)" % [food, max_food, (float(food)/max_food)*100])
	print("💧 Water: %d/%d (%.1f%%)" % [water, max_water, (float(water)/max_water)*100])
	print("\n📊 STATISTICHE:")
	for stat_name in stats:
		print("   %s: %d" % [stat_name.capitalize(), stats[stat_name]])
	print("\n📦 INVENTARIO (%d oggetti):" % inventory.size())
	for slot in inventory:
		print("   %dx %s" % [slot.quantity, slot.item_id])
	print("=".repeat(40) + "\n")

## Restituisce un Dictionary con tutto lo stato del personaggio (per salvataggio)
## @return: Dictionary completo con tutti i dati del personaggio
func get_save_data() -> Dictionary:
	return {
		"hp": hp,
		"max_hp": max_hp,
		"food": food,
		"max_food": max_food,
		"water": water,
		"max_water": max_water,
		"stats": stats.duplicate(),
		"inventory": inventory.duplicate(true),
		"equipped_weapon": equipped_weapon.duplicate(),
		"equipped_armor": equipped_armor.duplicate()
	}

## Carica lo stato del personaggio da un Dictionary (per caricamento salvataggio)
## @param save_data: Dictionary con dati del personaggio
func load_save_data(save_data: Dictionary) -> void:
	hp = save_data.get("hp", 100)
	max_hp = save_data.get("max_hp", 100)
	food = save_data.get("food", 100)
	max_food = save_data.get("max_food", 100)
	water = save_data.get("water", 100)
	max_water = save_data.get("max_water", 100)
	stats = save_data.get("stats", {})
	inventory = save_data.get("inventory", [])
	equipped_weapon = save_data.get("equipped_weapon", {})
	equipped_armor = save_data.get("equipped_armor", {})
	
	# Emetti segnali per aggiornare UI
	resources_changed.emit()
	stats_changed.emit()
	inventory_changed.emit()
	
	print("✅ PlayerManager: Dati caricati da salvataggio") 
extends Node

## Script di test per l'importazione del database JavaScript
## Fase 1: Foundation Systems Testing

var item_database: ItemDatabase

func _ready():
	print("🧪 AVVIO TEST DATABASE IMPORTAZIONE")
	test_database_import()

func test_database_import():
	print("=".repeat(50))
	print("🔥 TEST IMPORTAZIONE DATABASE JAVASCRIPT")
	print("=".repeat(50))

	# Inizializza database
	item_database = ItemDatabase.new()
	add_child(item_database)

	# Connetti segnali per feedback
	item_database.database_loaded.connect(_on_database_loaded)
	item_database.item_not_found.connect(_on_item_not_found)

		# Test caricamento completo
	var start_time = Time.get_ticks_msec()
	print("⏰ Inizio caricamento: ", Time.get_datetime_string_from_system())

	var success = item_database.load_complete_database()

	var end_time = Time.get_ticks_msec()
	var load_time = end_time - start_time
	print("⏰ Fine caricamento: ", Time.get_datetime_string_from_system())
	print("⏱️ Tempo di caricamento: ", load_time, "ms")

	if success:
		print("✅ CARICAMENTO DATABASE RIUSCITO!")
		_run_validation_tests()
	else:
		print("❌ CARICAMENTO DATABASE FALLITO!")
		_run_fallback_tests()

func _on_database_loaded(item_count: int, load_time: float):
	print("📊 DATABASE CARICATO:")
	print("  📦 Oggetti: ", item_count)
	print("  ⏱️ Tempo: ", load_time, "ms")

	# Ottieni statistiche dettagliate
	var stats = item_database.get_stats()
	print("  💾 Memoria stimata: ", stats.memory_usage_estimate_mb, "MB")

func _on_item_not_found(item_id: String):
	print("⚠️ Item non trovato durante test: ", item_id)

func _run_validation_tests():
	print("\n🔍 ESECUZIONE TEST DI VALIDAZIONE")
	print("-".repeat(30))

	# Test 1: Verifica items specifici conosciuti
	_test_specific_items()

	# Test 2: Verifica categorie
	_test_categories()

	# Test 3: Verifica performance
	_test_performance()

	# Test 4: Verifica integrità dati
	_test_data_integrity()

	# Test Equipment Bonus System - FASE 2
	test_equipment_bonus_system()

	print("\n✅ TUTTI I TEST COMPLETATI")

func _test_specific_items():
	print("🎯 Test oggetti specifici:")

	var test_items = [
		"canned_food",
		"water_bottle",
		"bandages_clean",
		"combat_knife",
		"leather_jacket",
		"repair_kit"
	]

	for item_id in test_items:
		var item = item_database.get_item(item_id)
		if item:
			print("  ✅ ", item_id, " → ", item.name, " (", item.type, ")")
		else:
			print("  ❌ ", item_id, " → NON TROVATO")

func _test_categories():
	print("📂 Test categorie:")

	var test_categories = ["food", "water", "medicine", "weapon", "armor", "tool"]

	for category in test_categories:
		var items = item_database.get_items_by_category(category)
		print("  📂 ", category, ": ", items.size(), " oggetti")

		# Mostra primi 3 oggetti come esempio
		for i in range(min(3, items.size())):
			print("     • ", items[i].name)

func _test_performance():
	print("⚡ Test performance:")

	# Test velocità lookup
	var lookup_start = Time.get_ticks_msec()

	for i in range(1000):
		var item = item_database.get_item("canned_food")

	var lookup_end = Time.get_ticks_msec()
	var lookup_time = lookup_end - lookup_start

	print("  🔍 1000 lookup: ", lookup_time, "ms")
	print("  📊 Avg per lookup: ", float(lookup_time) / 1000.0, "ms")

func _test_data_integrity():
	print("🔒 Test integrità dati:")

	var stats = item_database.get_stats()
	var total_items = stats.total_items

	# Verifica che tutti gli items abbiano dati validi
	var valid_items = 0
	var invalid_items = 0

	for i in range(item_database.items.size()):
		var item = item_database.items[i]

		if _is_item_valid(item):
			valid_items += 1
		else:
			invalid_items += 1
			print("  ⚠️ Item invalido: ", item.id)

	print("  ✅ Item validi: ", valid_items)
	print("  ❌ Item invalidi: ", invalid_items)
	print("  📊 Percentuale validità: ", (float(valid_items) / float(total_items)) * 100.0, "%")

func _is_item_valid(item: Item) -> bool:
	# Controlli base di validità
	if item.id.is_empty():
		return false
	if item.name.is_empty():
		return false
	if item.type.is_empty():
		return false
	if item.weight < 0:
		return false
	if item.value < 0:
		return false

	# Controlli specifici per tipo
	if item.is_weapon():
		if item.damage_min < 0 or item.damage_max < 0:
			return false
		if item.damage_max < item.damage_min:
			return false

	if item.is_armor():
		if item.armorValue < 0:
			return false

	return true

func _run_fallback_tests():
	print("\n🔧 ESECUZIONE TEST FALLBACK")
	print("-".repeat(30))

	# Se l'importazione JavaScript fallisce, testa il sistema base
	print("🧪 Test creazione item manuale...")

	var test_item = Item.new()
	test_item.id = "test_item"
	test_item.name = "Item di Test"
	test_item.type = "test"
	test_item.weight = 1.0
	test_item.value = 10

	if test_item.name == "Item di Test":
		print("✅ Creazione item manuale funzionante")
	else:
		print("❌ Errore creazione item manuale")

# Funzione non più necessaria - uso diretto Time.get_ticks_msec()
# func _calculate_time_diff rimossa e sostituita con calcolo diretto

## NUOVO: Test Equipment Bonus System Integration
func test_equipment_bonus_system():
	print("\n🔥 ===== TEST EQUIPMENT BONUS SYSTEM =====")

	var game_manager = get_node("/root/GameManager") as GameManager
	if not game_manager:
		print("❌ GameManager non disponibile")
		return false

	var item_db = game_manager.get_item_database()
	if not item_db or not item_db.is_loaded():
		print("❌ ItemDatabase non disponibile")
		return false

	# Crea player di test
	var test_player = Player.new()
	test_player.initialize_player()
	add_child(test_player)

	print("⚔️ Testing armi reali dal database...")

	# Test armi SafePlace
	var test_weapons = ["scrap_metal", "pipe_wrench", "kitchen_knife", "crowbar"]
	var weapons_tested = 0

	for weapon_id in test_weapons:
		var weapon = item_db.get_item(weapon_id)
		if weapon and weapon.is_weapon():
			weapons_tested += 1

			# Test equipaggiamento
			test_player.add_item_to_inventory(weapon_id, 1)
			var equipped = test_player.equip_item(weapon_id)

			if equipped:
				var attack_bonus = test_player.get_equipment_bonus("attack")
				var total_attack = test_player.get_attack_power()

				print("   ✅ ", weapon.name, " → ATK Bonus: +", attack_bonus, " (Total: ", total_attack, ")")
				test_player.unequip_item("weapon")
			else:
				print("   ❌ Equipaggiamento fallito per: ", weapon_id)

	print("🛡️ Testing armature reali dal database...")

	# Test armature SafePlace
	var test_armors = ["leather_jacket_worn", "military_boots", "hard_hat", "kevlar_vest"]
	var armors_tested = 0

	for armor_id in test_armors:
		var armor = item_db.get_item(armor_id)
		if armor and armor.is_armor():
			armors_tested += 1

			# Test equipaggiamento
			test_player.add_item_to_inventory(armor_id, 1)
			var equipped = test_player.equip_item(armor_id)

			if equipped:
				var defense_bonus = test_player.get_equipment_bonus("defense")
				var total_defense = test_player.get_defense_power()

				print("   ✅ ", armor.name, " → DEF Bonus: +", defense_bonus, " (Total: ", total_defense, ")")
				test_player.unequip_item(armor.slot)
			else:
				print("   ❌ Equipaggiamento fallito per: ", armor_id)

	# Test performance cache
	print("⚡ Testing performance cache...")
	var start_time = Time.get_ticks_msec()

	for i in range(100): # Test cache rapido
		test_player.get_equipment_bonus("attack")
		test_player.get_equipment_bonus("defense")

	var cache_time = Time.get_ticks_msec() - start_time
	print("   📊 100 calcoli bonus in ", cache_time, "ms (", float(cache_time) / 200.0, "ms/calcolo)")

	# Cleanup
	test_player.queue_free()

	var success = (weapons_tested > 0 and armors_tested > 0 and cache_time < 50)
	print("\n🎯 Equipment Bonus System: ", "✅ FUNZIONANTE" if success else "❌ PROBLEMI")
	print("   Armi testate: ", weapons_tested)
	print("   Armature testate: ", armors_tested)

class_name EquipmentBonusTest
extends Node

## Test Equipment Bonus System - FASE 2
## Verifica il calcolo dei bonus da equipment con oggetti reali dal database

var player: Player
var item_database: ItemDatabase

func _ready():
	print("🧪 ===== EQUIPMENT BONUS TEST - FASE 2 =====")
	await get_tree().process_frame # Aspetta un frame per inizializzazione
	run_all_tests()

func run_all_tests():
	if not _setup_test_environment():
		print("❌ Setup test fallito")
		return

	print("\n🔥 INIZIO TEST EQUIPMENT BONUS SYSTEM")

	# Test suite completa
	_test_basic_bonus_calculation()
	_test_weapon_equipping()
	_test_armor_equipping()
	_test_multiple_equipment_bonus()
	_test_equipment_change_detection()
	_test_real_database_integration()
	_test_performance_cache()

	print("\n✅ TUTTI I TEST EQUIPMENT BONUS COMPLETATI")
	print("🎯 Equipment Bonus System ready per FASE 2!")

func _setup_test_environment() -> bool:
	"""Setup ambiente di test"""
	print("🔧 Setup ambiente test...")

	# Ottieni riferimenti
	var game_manager = get_node("/root/GameManager") as GameManager
	if not game_manager:
		print("❌ GameManager non trovato")
		return false

	item_database = game_manager.get_item_database()
	if not item_database:
		print("❌ ItemDatabase non disponibile")
		return false

	if not item_database.is_loaded():
		print("❌ ItemDatabase non caricato")
		return false

	# Crea player di test
	player = Player.new()
	player.initialize_player()
	add_child(player)

	print("✅ Ambiente test configurato")
	print("   Database: ", item_database.get_stats()["total_items"], " oggetti")
	print("   Player: Inizializzato")

	return true

func _test_basic_bonus_calculation():
	"""Test calcolo bonus base"""
	print("\n📊 TEST: Calcolo Bonus Base")

	# Baseline senza equipment
	var base_attack = player.get_attack_power()
	var base_defense = player.get_defense_power()

	print("   Attack base: ", base_attack)
	print("   Defense base: ", base_defense)

	# Verifica che equipment bonus sia zero inizialmente
	var attack_bonus = player.get_equipment_bonus("attack")
	var defense_bonus = player.get_equipment_bonus("defense")

	assert(attack_bonus == 0, "Attack bonus dovrebbe iniziare a 0")
	assert(defense_bonus == 0, "Defense bonus dovrebbe iniziare a 0")

	print("✅ Bonus base: ATK +", attack_bonus, ", DEF +", defense_bonus)

func _test_weapon_equipping():
	"""Test equipaggiamento armi reali"""
	print("\n⚔️ TEST: Equipaggiamento Armi Reali")

	# Trova un'arma nel database
	var weapons = item_database.get_items_by_type("weapon")
	if weapons.is_empty():
		print("⚠️ Nessuna arma trovata nel database")
		return

	var test_weapon = weapons[0]
	print("   Arma test: ", test_weapon.name)
	print("   Danno: ", test_weapon.damage_min, "-", test_weapon.damage_max)

	# Aggiungi all'inventario e equipaggia
	player.add_item_to_inventory(test_weapon.id, 1)
	var success = player.equip_item(test_weapon.id)

	assert(success, "Equipaggiamento arma fallito")

	# Verifica bonus
	var expected_bonus = (test_weapon.damage_min + test_weapon.damage_max) / 2
	var actual_bonus = player.get_equipment_bonus("attack")

	print("   Bonus atteso: +", expected_bonus)
	print("   Bonus attuale: +", actual_bonus)

	assert(actual_bonus == expected_bonus, "Bonus attack non corretto")

	# Verifica attack power totale
	var total_attack = player.get_attack_power()
	print("   Attack power totale: ", total_attack)

	print("✅ Arma equipaggiata e bonus calcolato correttamente")

func _test_armor_equipping():
	"""Test equipaggiamento armature reali"""
	print("\n🛡️ TEST: Equipaggiamento Armature Reali")

	# Trova un'armatura nel database
	var armors = item_database.get_items_by_type("armor")
	if armors.is_empty():
		print("⚠️ Nessuna armatura trovata nel database")
		return

	var test_armor = armors[0]
	print("   Armatura test: ", test_armor.name)
	print("   Protezione: ", test_armor.armorValue)
	print("   Slot: ", test_armor.slot)

	# Aggiungi all'inventario e equipaggia
	player.add_item_to_inventory(test_armor.id, 1)
	var success = player.equip_item(test_armor.id)

	assert(success, "Equipaggiamento armatura fallito")

	# Verifica bonus
	var expected_bonus = test_armor.armorValue
	var actual_bonus = player.get_equipment_bonus("defense")

	print("   Bonus difesa atteso: +", expected_bonus)
	print("   Bonus difesa attuale: +", actual_bonus)

	assert(actual_bonus == expected_bonus, "Bonus defense non corretto")

	# Verifica defense power totale
	var total_defense = player.get_defense_power()
	print("   Defense power totale: ", total_defense)

	print("✅ Armatura equipaggiata e bonus calcolato correttamente")

func _test_multiple_equipment_bonus():
	"""Test bonus multipli da più oggetti"""
	print("\n🎯 TEST: Bonus Multipli Equipment")

	# Equipaggia più oggetti contemporaneamente
	var weapons = item_database.get_items_by_type("weapon")
	var armors = item_database.get_items_by_type("armor")

	if weapons.size() < 1 or armors.size() < 2:
		print("⚠️ Oggetti insufficienti per test multipli")
		return

	# Equipaggia arma
	var weapon = weapons[0]
	player.add_item_to_inventory(weapon.id, 1)
	player.equip_item(weapon.id)

	# Equipaggia due armature diverse (slot diversi)
	var armor1 = armors[0]
	var armor2 = null

	# Trova armatura con slot diverso
	for armor in armors:
		if armor.slot != armor1.slot:
			armor2 = armor
			break

	if armor2:
		player.add_item_to_inventory(armor1.id, 1)
		player.add_item_to_inventory(armor2.id, 1)
		player.equip_item(armor1.id)
		player.equip_item(armor2.id)

		# Calcola bonus totali attesi
		var expected_attack = (weapon.damage_min + weapon.damage_max) / 2
		var expected_defense = armor1.armorValue + armor2.armorValue

		var actual_attack = player.get_equipment_bonus("attack")
		var actual_defense = player.get_equipment_bonus("defense")

		print("   Bonus attesi: ATK +", expected_attack, ", DEF +", expected_defense)
		print("   Bonus attuali: ATK +", actual_attack, ", DEF +", actual_defense)

		assert(actual_attack == expected_attack, "Bonus attack multipli errati")
		assert(actual_defense == expected_defense, "Bonus defense multipli errati")

		print("✅ Bonus multipli calcolati correttamente")

func _test_equipment_change_detection():
	"""Test rilevamento cambiamenti equipment per cache"""
	print("\n🔄 TEST: Change Detection e Cache")

	# Forza un aggiornamento iniziale
	var initial_bonus = player.get_equipment_bonus("attack")

	# Cambia equipment
	var weapons = item_database.get_items_by_type("weapon")
	if weapons.size() >= 2:
		var weapon1 = weapons[0]
		var weapon2 = weapons[1]

		# Equipaggia prima arma
		player.add_item_to_inventory(weapon1.id, 1)
		player.equip_item(weapon1.id)
		var bonus1 = player.get_equipment_bonus("attack")

		# Equipaggia seconda arma (sostituisce la prima)
		player.add_item_to_inventory(weapon2.id, 1)
		player.equip_item(weapon2.id)
		var bonus2 = player.get_equipment_bonus("attack")

		print("   Bonus arma 1: +", bonus1)
		print("   Bonus arma 2: +", bonus2)

		# I bonus dovrebbero essere diversi (probabilmente)
		if weapon1.id != weapon2.id:
			var expected1 = (weapon1.damage_min + weapon1.damage_max) / 2
			var expected2 = (weapon2.damage_min + weapon2.damage_max) / 2

			assert(bonus1 == expected1, "Bonus prima arma errato")
			assert(bonus2 == expected2, "Bonus seconda arma errato")

		print("✅ Change detection e cache funzionano")

func _test_real_database_integration():
	"""Test integrazione con database reale"""
	print("\n🗃️ TEST: Integrazione Database Reale")

	# Verifica oggetti SafePlace specifici
	var safeplace_weapons = [
		"scrap_metal", "pipe_wrench", "kitchen_knife",
		"crowbar", "baseball_bat", "machete"
	]

	var found_weapons = 0
	for weapon_id in safeplace_weapons:
		var weapon = item_database.get_item(weapon_id)
		if weapon and weapon.is_weapon():
			found_weapons += 1

			# Test equipaggiamento
			player.add_item_to_inventory(weapon_id, 1)
			if player.equip_item(weapon_id):
				var bonus = player.get_equipment_bonus("attack")
				print("   ", weapon.name, ": ATK +", bonus)
				player.unequip_item("weapon")

	print("   Armi SafePlace trovate e testate: ", found_weapons)

	# Test armature SafePlace
	var safeplace_armors = [
		"leather_jacket_worn", "military_boots", "hard_hat"
	]

	var found_armors = 0
	for armor_id in safeplace_armors:
		var armor = item_database.get_item(armor_id)
		if armor and armor.is_armor():
			found_armors += 1

			# Test equipaggiamento
			player.add_item_to_inventory(armor_id, 1)
			if player.equip_item(armor_id):
				var bonus = player.get_equipment_bonus("defense")
				print("   ", armor.name, ": DEF +", bonus)
				player.unequip_item(armor.slot)

	print("   Armature SafePlace trovate e testate: ", found_armors)
	print("✅ Integrazione database reale verificata")

func _test_performance_cache():
	"""Test performance del sistema di cache"""
	print("\n⚡ TEST: Performance Cache")

	var start_time = Time.get_ticks_msec()

	# Calcola bonus 1000 volte (simula carico pesante)
	for i in range(1000):
		player.get_equipment_bonus("attack")
		player.get_equipment_bonus("defense")

	var end_time = Time.get_ticks_msec()
	var duration = end_time - start_time

	print("   1000 calcoli bonus in: ", duration, "ms")
	print("   Performance per calcolo: ", float(duration) / 2000.0, "ms")

	# Performance dovrebbe essere sotto 1ms per calcolo grazie alla cache
	var performance_per_calc = float(duration) / 2000.0
	assert(performance_per_calc < 1.0, "Performance cache insufficiente")

	print("✅ Performance cache ottimale (< 1ms per calcolo)")

## Debug: Stampa tutte le statistiche dettagliate
func debug_print_detailed_stats():
	var detailed = player.get_detailed_stats()
	print("\n📊 STATISTICHE DETTAGLIATE PLAYER:")
	print("==================================================")

	print("📈 Stats Base:")
	for key in detailed.base_stats.keys():
		print("   ", key, ": ", detailed.base_stats[key])

	print("\n🎯 Equipment Bonuses:")
	for key in detailed.equipment_bonuses.keys():
		print("   ", key, ": +", detailed.equipment_bonuses[key])

	print("\n⚔️ Combat Totali:")
	print("   Total Attack: ", detailed.total_attack)
	print("   Total Defense: ", detailed.total_defense)

	print("\n🛡️ Equipment Info:")
	for slot in detailed.equipped_items.keys():
		var item_info = detailed.equipped_items[slot]
		print("   ", slot, ": ", item_info.name, " (", item_info.condition, "%)")

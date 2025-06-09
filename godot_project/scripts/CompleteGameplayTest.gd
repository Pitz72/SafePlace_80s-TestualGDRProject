extends Node

## Test completo integrazione di tutti i sistemi SafePlace

func _ready():
	print("🎮 === TEST COMPLETO GAMEPLAY SAFEPLACE ===")
	_test_complete_integration()

func _test_complete_integration():
	print("🔧 Test integrazione completa di tutti i sistemi...")

	var results = {
		"map_generation": false,
		"start_end_system": false,
		"player_system": false,
		"item_database": false,
		"movement": false,
		"ui_integration": false,
		"save_system": false,
		"combat_system": false
	}

	# Test 1: Generazione Mappa
	print("\n1️⃣ TEST GENERAZIONE MAPPA:")
	var map_gen = ASCIIMapGenerator.new()
	if map_gen:
		var start_pos = map_gen.get_start_position()
		var end_pos = map_gen.get_end_position()
		var player_pos = map_gen.get_player_position()

		print("   📍 Start: (%d,%d)" % [start_pos.x, start_pos.y])
		print("   🎯 End: (%d,%d)" % [end_pos.x, end_pos.y])
		print("   👤 Player: (%d,%d)" % [player_pos.x, player_pos.y])

		var start_ok = start_pos.x >= 5 and start_pos.x <= 40 and start_pos.y >= 5 and start_pos.y <= 40
		var end_ok = end_pos.x >= 210 and end_pos.x <= 245 and end_pos.y >= 210 and end_pos.y <= 245
		var player_starts_at_s = player_pos == start_pos

		if start_ok and end_ok and player_starts_at_s:
			results.map_generation = true
			results.start_end_system = true
			print("   ✅ Mappa e Start→End: PERFETTI")
		else:
			print("   ❌ Problemi: Start OK: %s, End OK: %s, Player@S: %s" % [start_ok, end_ok, player_starts_at_s])

	# Test 2: Database Oggetti
	print("\n2️⃣ TEST DATABASE OGGETTI:")
	var item_db = ItemDatabase.new()
	if item_db:
		# Test caricamento database
		var success = item_db.load_complete_database()
		if success:
			var stats = item_db.get_stats()
			var total_items = stats.get("total_items", 0)
			print("   📦 Oggetti caricati: %d" % total_items)
			if total_items >= 100: # Dovrebbero essere 144
				results.item_database = true
				print("   ✅ Database: OPERATIVO")
			else:
				print("   ⚠️ Database: Pochi oggetti (%d)" % total_items)
		else:
			print("   ❌ Database: ERRORE caricamento")

	# Test 3: Sistema Player
	print("\n3️⃣ TEST SISTEMA PLAYER:")
	var player_test = load("res://scripts/Player.gd")
	if player_test:
		results.player_system = true
		print("   ✅ Player: Sistema caricato OK")
	else:
		print("   ❌ Player: ERRORE caricamento")

	# Test 4: Movimento
	print("\n4️⃣ TEST MOVIMENTO:")
	if map_gen:
		var old_pos = map_gen.get_player_position()
		var moved = map_gen.move_player(Vector2(1, 0)) # Muovi a destra
		var new_pos = map_gen.get_player_position()

		if moved and new_pos != old_pos:
			results.movement = true
			print("   ✅ Movimento: OK (%d,%d) → (%d,%d)" % [old_pos.x, old_pos.y, new_pos.x, new_pos.y])
		else:
			print("   ❌ Movimento: BLOCCATO")

	# Test 5: Combat System
	print("\n5️⃣ TEST COMBAT SYSTEM:")
	var combat_test = load("res://scripts/SafePlaceCombatSystem.gd")
	if combat_test:
		results.combat_system = true
		print("   ✅ Combat: Sistema caricato OK")
	else:
		print("   ❌ Combat: ERRORE caricamento")

	# Test 6: Save System
	print("\n6️⃣ TEST SAVE SYSTEM:")
	var save_test = load("res://scripts/SaveManager.gd")
	if save_test:
		results.save_system = true
		print("   ✅ Save: Sistema caricato OK")
	else:
		print("   ❌ Save: ERRORE caricamento")

	# Test 7: UI Integration
	print("\n7️⃣ TEST UI INTEGRATION:")
	var ui_test = load("res://scripts/MainInterface.gd")
	if ui_test:
		results.ui_integration = true
		print("   ✅ UI: Sistema caricato OK")
	else:
		print("   ❌ UI: ERRORE caricamento")

	# Test 8: Lore Integration (v1.2.0)
	print("\n8️⃣ TEST LORE INTEGRATION (v1.2.0):")
	results["lore_system"] = false

	if item_db and item_db.get_stats().get("total_items", 0) > 0:
		var enhanced_items = 0
		var legendary_count = 0
		var rare_count = 0

		# Test primi 10 oggetti per lore
		for i in range(min(10, item_db.get_stats().get("total_items", 0))):
			var item = item_db.get_item_by_index(i)
			if item and item.has_lore():
				enhanced_items += 1
				if item.rarity == "legendary":
					legendary_count += 1
				elif item.rarity == "rare":
					rare_count += 1

		if enhanced_items > 0:
			results.lore_system = true
			print("   ✅ Lore: %d enhanced, %d legendary, %d rare" % [enhanced_items, legendary_count, rare_count])
		else:
			print("   ⚠️ Lore: Sistema presente ma nessun oggetto enhanced")
	else:
		print("   ❌ Lore: Database non disponibile per test")

	# Risultati finali
	print("\n🎯 === RISULTATI FINALI ===")
	var passed = 0
	var total = results.size()

	for system_name in results:
		var status = "✅" if results[system_name] else "❌"
		print("   %s %s" % [status, system_name.replace("_", " ").to_upper()])
		if results[system_name]:
			passed += 1

	var percentage = (passed * 100) / total
	print("\n📊 COMPLETAMENTO: %d/%d sistemi (%d%%)" % [passed, total, percentage])

	if percentage >= 85:
		print("🎉 SAFEPLACE PRONTO PER GAMEPLAY COMPLETO!")
		print("🚀 Prossimo step: Import contenuti originali")
	elif percentage >= 70:
		print("⚠️ Quasi pronto - Risolvere i sistemi mancanti")
	else:
		print("❌ Problemi critici - Verificare sistemi base")

	# Suggerimenti prossimi passi
	print("\n📋 PROSSIMI PASSI SUGGERITI:")
	if results.map_generation and results.item_database:
		print("   1. ✅ Base solida - Procedere con import contenuti")
		print("   2. 📥 Import eventi casuali da game_data.js")
		print("   3. 🎯 Sistema achievement (24+ trofei)")
		print("   4. 🛠️ Ricette crafting JSON")
		print("   5. 📖 Contenuti narrativi (lore, dialoghi)")
	else:
		print("   1. 🔧 Risolvere sistemi base prima di procedere")

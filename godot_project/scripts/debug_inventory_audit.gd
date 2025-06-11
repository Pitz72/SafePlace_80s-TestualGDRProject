extends SceneTree

## Script di Diagnostica Inventario SafePlace v1.8.1
## Identifica oggetti mancanti, incompatibili e problemi di database

func _init():
	print("🔍 === DIAGNOSTICA INVENTARIO SAFEPLACE v1.8.1 ===")
	print("📊 Audit completo compatibility inventario ↔ database")
	print("============================================================")
	
	# Inizializza sistemi core
	var game_manager = GameManager.new()
	var player = Player.new()
	var item_database = ItemDatabase.new()
	
	# Popola database con oggetti originali
	item_database.populate_with_original_items()
	
	# Test 1: INVENTARIO ATTUALE
	_audit_current_inventory(player, item_database)
	
	# Test 2: OGGETTI DI TEST
	_audit_test_objects(player, item_database)
	
	# Test 3: GAP ANALYSIS
	_audit_missing_objects(item_database)
	
	# Test 4: COMPATIBILITÀ
	_audit_compatibility_issues(player, item_database)
	
	print("\n✅ Diagnostica completata")
	quit()

## Audit inventario corrente del Player
func _audit_current_inventory(player: Player, item_db: ItemDatabase):
	print("\n🎒 === AUDIT INVENTARIO ATTUALE ===")
	
	# Simula inizializzazione player
	player._setup_initial_stats()
	player._add_test_items_safeplace()
	player._add_test_safeplace_objects()
	
	print("📦 Oggetti in inventario: ", player.inventory.size())
	
	var problematic_items = []
	var valid_items = []
	
	for slot in player.inventory:
		var item_id = slot.get("item_id", "")
		var quantity = slot.get("quantity", 0)
		
		print("  Testing: ", item_id, " x", quantity)
		
		var item_data = item_db.get_item(item_id)
		if item_data == null:
			problematic_items.append({
				"id": item_id,
				"quantity": quantity,
				"issue": "Non trovato nel database"
			})
			print("    ❌ PROBLEMA: ", item_id, " non esistente nel database")
		else:
			valid_items.append({
				"id": item_id,
				"name": item_data.name,
				"quantity": quantity
			})
			print("    ✅ OK: ", item_data.name)
	
	print("\n📊 RISULTATO AUDIT:")
	print("  ✅ Oggetti validi: ", valid_items.size())
	print("  ❌ Oggetti problematici: ", problematic_items.size())
	
	if problematic_items.size() > 0:
		print("\n🚨 OGGETTI PROBLEMATICI:")
		for item in problematic_items:
			print("    - ", item.id, " (", item.issue, ")")

## Audit oggetti di test specificici
func _audit_test_objects(player: Player, item_db: ItemDatabase):
	print("\n🧪 === AUDIT OGGETTI TEST SPECIFICI ===")
	
	# Lista oggetti che dovrebbero esistere
	var expected_test_objects = [
		# Da _add_test_safeplace_objects()
		"canned_food", "ration_pack", "berries", "protein_bar_old",
		"bread_stale", "dried_meat", "water_bottle", "water_contaminated",
		"water_purified", "rainwater_fresh", "first_aid_kit", "bandages_clean",
		"antidote", "vitamins", "painkillers", "scrap_metal", "cloth_rags",
		"rope", "mechanical_parts",
		
		# Da _add_test_items_safeplace()
		"bende_sporche", "acqua_bottiglia", "cibo_scatola", "metallo_rottame",
		"coltello_arrugginito", "stracci_stoffa", "carbone", "latta_cibo"
	]
	
	var missing_objects = []
	var existing_objects = []
	
	for obj_id in expected_test_objects:
		var item_data = item_db.get_item(obj_id)
		if item_data == null:
			missing_objects.append(obj_id)
			print("  ❌ MANCANTE: ", obj_id)
		else:
			existing_objects.append(obj_id)
			print("  ✅ TROVATO: ", obj_id, " → ", item_data.name)
	
	print("\n📊 RISULTATO TEST OBJECTS:")
	print("  ✅ Esistenti: ", existing_objects.size(), "/", expected_test_objects.size())
	print("  ❌ Mancanti: ", missing_objects.size(), "/", expected_test_objects.size())
	
	if missing_objects.size() > 0:
		print("\n🚨 OGGETTI MANCANTI NEL DATABASE:")
		for obj_id in missing_objects:
			print("    - ", obj_id)

## Gap analysis con oggetti originali SafePlace
func _audit_missing_objects(item_db: ItemDatabase):
	print("\n🕳️ === GAP ANALYSIS OGGETTI ORIGINALI ===")
	
	# Lista oggetti originali SafePlace che dovrebbero esistere
	var original_safeplace_objects = [
		# CIBO ORIGINALE
		"canned_food", "ration_pack", "berries", "berries_suspicious",
		"stale_bread", "dried_meat", "mushrooms", "nuts_mixed",
		"chocolate_bar", "protein_bar",
		
		# ACQUA ORIGINALE
		"water_bottle", "water_contaminated", "water_purified",
		"rainwater_fresh", "river_water", "herbal_tea",
		
		# MEDICINE ORIGINALE
		"first_aid_kit", "bandages_clean", "bandages_dirty",
		"antidote", "vitamins", "painkillers", "stimulants",
		
		# RISORSE ORIGINALE
		"scrap_metal", "mechanical_parts", "cloth_rags", "wood_planks",
		"charcoal", "rope", "raw_hide", "burnt_electronics",
		
		# ARMI ORIGINALE
		"kitchen_knife", "rusty_pipe", "wooden_club", "shard_blade",
		"crowbar", "pipe_wrench", "hunting_knife", "machete",
		
		# ARMATURE ORIGINALE
		"armor_rags_simple", "leather_jacket_worn", "metal_vest_improvised",
		"riot_gear_partial", "work_boots", "leather_gloves"
	]
	
	var missing_originals = []
	var existing_originals = []
	
	for obj_id in original_safeplace_objects:
		var item_data = item_db.get_item(obj_id)
		if item_data == null:
			missing_originals.append(obj_id)
		else:
			existing_originals.append(obj_id)
	
	print("📊 COPERTURA OGGETTI ORIGINALI:")
	print("  ✅ Implementati: ", existing_originals.size(), "/", original_safeplace_objects.size())
	print("  ❌ Mancanti: ", missing_originals.size(), "/", original_safeplace_objects.size())
	
	var coverage_percentage = (float(existing_originals.size()) / float(original_safeplace_objects.size())) * 100.0
	print("  📈 Coverage: %.1f%%" % coverage_percentage)
	
	if missing_originals.size() > 0:
		print("\n🚨 OGGETTI ORIGINALI MANCANTI:")
		for obj_id in missing_originals:
			print("    - ", obj_id)

## Test compatibilità uso oggetti
func _audit_compatibility_issues(player: Player, item_db: ItemDatabase):
	print("\n⚙️ === AUDIT COMPATIBILITÀ USO OGGETTI ===")
	
	# Test uso oggetti esistenti
	var test_items = ["canned_food", "water_bottle", "first_aid_kit", "berries"]
	
	for item_id in test_items:
		var item_data = item_db.get_item(item_id)
		if item_data == null:
			print("  ❌ ", item_id, ": Non trovato nel database")
			continue
		
		# Test usability
		if item_data.usable:
			print("  ✅ ", item_id, ": Usabile (", item_data.name, ")")
			
			# Test porzioni se disponibile
			if item_data.has("max_portions"):
				print("    📦 Porzioni: ", item_data.max_portions)
			
			# Test effetti
			if item_data.has("effects"):
				print("    ⚡ Effetti: ", item_data.effects.size())
		else:
			print("  ⚠️ ", item_id, ": Non usabile")
	
	print("\n✅ Test compatibilità completato") 
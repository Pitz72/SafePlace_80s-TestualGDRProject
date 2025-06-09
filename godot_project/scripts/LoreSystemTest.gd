extends Node

## Test sistema lore per SafePlace v1.2.0

# Preload delle classi necessarie
const LoreManager = preload("res://scripts/LoreManager.gd")

func _ready():
	print("🏺 === TEST SISTEMA LORE SAFEPLACE ===")
	_test_lore_system()

func _test_lore_system():
	print("🔧 Test completo del sistema lore...")

	var results = {
		"lore_manager_init": false,
		"lore_database_load": false,
		"item_enrichment": false,
		"rarity_system": false,
		"special_items": false
	}

	# Test 1: Inizializzazione LoreManager
	print("\n1️⃣ TEST INIZIALIZZAZIONE LORE MANAGER:")
	var lore_manager = LoreManager.new()
	if lore_manager:
		results.lore_manager_init = true
		print("   ✅ LoreManager: Inizializzato correttamente")
	else:
		print("   ❌ LoreManager: ERRORE inizializzazione")

	# Test 2: Caricamento database lore
	print("\n2️⃣ TEST CARICAMENTO DATABASE LORE:")
	if lore_manager:
		var success = lore_manager.test_lore_system()
		if success:
			results.lore_database_load = true
			var stats = lore_manager.get_lore_stats()
			print("   ✅ Database: %d oggetti lore caricati" % stats.total_lore_items)
			print("   📊 Rarità: %s" % str(stats.lore_by_rarity))
			print("   ⭐ Oggetti speciali: %d" % stats.special_items_count)
		else:
			print("   ❌ Database: ERRORE caricamento")

	# Test 3: Test Item Enhancement
	print("\n3️⃣ TEST ITEM ENHANCEMENT:")
	if lore_manager and results.lore_database_load:
		# Crea un oggetto di test che dovrebbe avere lore
		var test_item = Item.new()
		test_item.id = "carillon_of_lena" # Oggetto lore dal JavaScript
		test_item.name = "Test Item"

		var enriched = lore_manager.enrich_item_with_lore(test_item)
		if enriched:
			results.item_enrichment = true
			print("   ✅ Enhancement: Oggetto arricchito con lore")
			print("   🏺 Lore Text: %s..." % test_item.lore_text.substr(0, 50))
			print("   💎 Rarità: %s" % test_item.rarity)
		else:
			print("   ❌ Enhancement: Fallito (normale se carillon_of_lena non esiste)")

	# Test 4: Sistema rarità
	print("\n4️⃣ TEST SISTEMA RARITÀ:")
	var test_item_rarity = Item.new()
	test_item_rarity.rarity = "legendary"

	var color = test_item_rarity.get_rarity_color()
	var display = test_item_rarity.get_rarity_display()

	if color and display == "Legendary":
		results.rarity_system = true
		print("   ✅ Rarità: Sistema colori e display funzionante")
		print("   🎨 Colore legendary: %s" % str(color))
	else:
		print("   ❌ Rarità: ERRORE sistema")

	# Test 5: Oggetti speciali
	print("\n5️⃣ TEST OGGETTI SPECIALI:")
	var special_item = Item.new()
	special_item.special_interaction = true
	special_item.unique = true
	special_item.revelation = true

	if special_item.is_special() and special_item.has_special_effects():
		results.special_items = true
		print("   ✅ Speciali: Sistema oggetti speciali funziona")
	else:
		print("   ❌ Speciali: ERRORE rilevazione")

	# Risultati finali
	print("\n🎯 === RISULTATI FINALI ===")
	var passed = 0
	var total = results.size()

	for test_name in results:
		var status = "✅" if results[test_name] else "❌"
		print("   %s %s" % [status, test_name.replace("_", " ").to_upper()])
		if results[test_name]:
			passed += 1

	var percentage = (passed * 100) / total
	print("\n📊 LORE SYSTEM: %d/%d test (%d%%)" % [passed, total, percentage])

	if percentage >= 80:
		print("🎉 SISTEMA LORE PRONTO PER INTEGRAZIONE!")
		print("🚀 Prossimo step: Integrazione con ItemDatabase")
	elif percentage >= 60:
		print("⚠️ Sistema parzialmente funzionante - Investigare errori")
	else:
		print("❌ Problemi critici nel sistema lore")

	# Suggerimenti
	print("\n📋 PROSSIMI PASSI:")
	if results.lore_manager_init and results.lore_database_load:
		print("   1. ✅ Base lore funzionante")
		print("   2. 🔄 Integrare con ItemDatabase.gd")
		print("   3. 🎨 Aggiornare UI tooltip con lore")
		print("   4. 🧪 Test integrazione completa")
	else:
		print("   1. 🔧 Risolvere problemi base prima di procedere")

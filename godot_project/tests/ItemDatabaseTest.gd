extends Node
class_name ItemDatabaseTest

## Test script per verificare la migrazione dell'ItemDatabase
## Session #003 - Core Systems Architecture

# Database instance
var item_database: ItemDatabase

func _ready():
	print("🧪 ItemDatabaseTest avviato")
	_run_migration_test()

## Esegue il test di migrazione completo
func _run_migration_test():
	print("============================================================")
	print("🚀 ITEMDATABASE MIGRATION TEST - SESSION #003")
	print("============================================================")

	# Step 1: Crea database
	item_database = ItemDatabase.new()

	# Step 2: Carica dati JavaScript (mock per ora)
	var js_data = _create_test_js_data()
	var load_success = item_database.load_items_from_json(js_data)

	if not load_success:
		print("❌ FALLIMENTO: Caricamento database")
		return

	# Step 3: Test migrazione
	var migration_success = item_database.test_migration()

	# Step 4: Test funzionalità
	_test_database_functions()

	# Step 5: Statistiche finali
	item_database.debug_print_detailed_stats()

	# Step 6: Performance test
	_test_performance()

	print("============================================================")
	if migration_success:
		print("✅ ITEMDATABASE MIGRATION TEST: SUCCESS!")
	else:
		print("❌ ITEMDATABASE MIGRATION TEST: FAILED!")
	print("============================================================")

## Crea dati di test che simulano la struttura JavaScript
func _create_test_js_data() -> Dictionary:
	print("📋 Creazione dati test JavaScript...")

	# Simula una porzione del file game_data.js ITEM_DATA
	var test_data = {
		"scrap_metal": {
			"id": "scrap_metal",
			"name": "Metallo Riciclato",
			"description": "Pezzi di metallo arrugginito e contorto. Utile per riparazioni e costruzioni.",
			"type": "resource",
			"weight": 0.5,
			"value": 5,
			"stackable": true
		},
		"canned_food": {
			"id": "canned_food",
			"name": "Cibo in Scatola Generico",
			"nameShort": "Lattina Cibo",
			"description": "Una lattina senza etichetta. Chissà cosa contiene, ma sembra commestibile.",
			"type": "food",
			"usable": true,
			"weight": 0.4,
			"value": 8,
			"stackable": true,
			"max_portions": 2,
			"effects": [ {"type": "add_resource", "resource_type": "food", "amount": 3}]
		},
		"water_bottle": {
			"id": "water_bottle",
			"name": "Bottiglia d'Acqua Grande",
			"nameShort": "Bott. Acqua G.",
			"description": "Una bottiglia di plastica riutilizzabile, piena d'acqua. Sembra potabile.",
			"type": "water",
			"usable": true,
			"weight": 1.5,
			"value": 12,
			"stackable": false,
			"max_portions": 4,
			"effects": [ {"type": "add_resource", "resource_type": "water", "amount": 2}]
		},
		"pipe_wrench": {
			"id": "pipe_wrench",
			"name": "Chiave Inglese Pesante",
			"nameShort": "Chiave Pesante",
			"description": "Una grossa chiave inglese, buona per colpire forte... o stringere bulloni.",
			"type": "weapon",
			"slot": "weapon",
			"weaponType": "mischia",
			"damage": {"min": 5, "max": 10},
			"maxDurability": 30,
			"weight": 1.5,
			"value": 20
		},
		"leather_jacket_worn": {
			"id": "leather_jacket_worn",
			"name": "Giacca di Pelle Logora",
			"nameShort": "Giacca Logora",
			"description": "Una vecchia giacca di pelle, indurita dal tempo e piena di graffi. Offre una protezione modesta.",
			"type": "armor",
			"equipable": true,
			"stackable": false,
			"slot": "body",
			"armorValue": 2,
			"maxDurability": 40,
			"weight": 2.0,
			"value": 15,
			"effects": []
		},
		"repair_kit": {
			"id": "repair_kit",
			"name": "Kit di Riparazione",
			"description": "Attrezzi e materiali per riparare armi e armature danneggiate.",
			"type": "tool",
			"usable": true,
			"weight": 0.8,
			"value": 35,
			"effects": [ {"type": "repair_item_type", "item_type_target": ["weapon", "armor"], "repair_amount": 15, "charges": 1}]
		},
		"ammo_9mm": {
			"id": "ammo_9mm",
			"name": "Munizioni 9mm",
			"description": "Una scatola di proiettili calibro 9mm.",
			"type": "ammo",
			"ammoType": "ammo_9mm",
			"weight": 0.02,
			"value": 2,
			"stackable": true,
			"quantityPerStack": 20
		},
		"blueprint_fishing_rod": {
			"id": "blueprint_fishing_rod",
			"name": "Progetto: Canna da Pesca",
			"nameShort": "Prog: Canna Pesca",
			"description": "Istruzioni per costruire una canna da pesca improvvisata con materiali di recupero.",
			"type": "blueprint",
			"usable": true,
			"weight": 0.05,
			"value": 12,
			"stackable": false,
			"effects": [ {"type": "learn_recipe", "recipeKey": "craft_fishing_rod"}]
		}
	}

	print("📦 Creati ", test_data.size(), " items di test")
	return test_data

## Testa le funzionalità del database
func _test_database_functions():
	print("\n🔧 Test funzionalità database...")

	# Test get_item
	var metal = item_database.get_item("scrap_metal")
	if metal:
		print("  ✅ get_item(): ", metal.name)
	else:
		print("  ❌ get_item() fallito")

	# Test get_items_by_type
	var weapons = item_database.get_items_by_type("weapon")
	print("  ✅ get_items_by_type('weapon'): ", weapons.size(), " found")

	var resources = item_database.get_items_by_type("resource")
	print("  ✅ get_items_by_type('resource'): ", resources.size(), " found")

	# Test get_items_by_category
	var consumables = item_database.get_items_by_category("consumables")
	print("  ✅ get_items_by_category('consumables'): ", consumables.size(), " found")

	var stackable = item_database.get_items_by_category("stackable")
	print("  ✅ get_items_by_category('stackable'): ", stackable.size(), " found")

	# Test search
	var search_results = item_database.search_items("metallo")
	print("  ✅ search_items('metallo'): ", search_results.size(), " found")

	# Test item properties
	if metal:
		print("  📊 Item test properties:")
		print("    is_weapon(): ", metal.is_weapon())
		print("    is_armor(): ", metal.is_armor())
		print("    is_consumable(): ", metal.is_consumable())
		print("    can_stack_with(metal): ", metal.can_stack_with(metal))
		print("    weight_display: ", metal.get_weight_display())

## Test performance del database
func _test_performance():
	print("\n⚡ Performance test...")

	var start_time = Time.get_ticks_msec()

	# Test 1000 accessi casuali
	var random_ids = ["scrap_metal", "canned_food", "water_bottle", "pipe_wrench", "leather_jacket_worn"]
	for i in range(1000):
		var random_id = random_ids[i % random_ids.size()]
		var item = item_database.get_item(random_id)

	var end_time = Time.get_ticks_msec()
	var perf_time = float(end_time - start_time)

	print("  📈 1000 get_item() calls: ", perf_time, "ms")
	print("  📈 Average per call: ", perf_time / 1000.0, "ms")

		# Test batch operations
	start_time = Time.get_ticks_msec()
	for i in range(100):
		var weapons = item_database.get_items_by_type("weapon")
		var armor = item_database.get_items_by_type("armor")
	end_time = Time.get_ticks_msec()

	var batch_time = float(end_time - start_time)
	print("  📈 200 type queries: ", batch_time, "ms")

## Simula il caricamento dal file JavaScript reale (per il futuro)
func _simulate_full_js_load():
	print("🎯 Simulazione caricamento file JavaScript completo...")

	# Questo sarà implementato quando avremo il parser JavaScript completo
	# Per ora usiamo i dati di test
	print("  📁 File target: js/game_data.js")
	print("  📊 Items attesi: ~119")
	print("  🔄 Status: Mock implementation")

## Test specifici per le categorie SafePlace
func _test_safeplace_categories():
	print("\n🎮 Test categorie SafePlace...")

	item_database.debug_print_categories()

	# Test categoria weapons
	var melee_weapons = item_database.get_items_by_category("weapons_mischia")
	print("  🗡️ Armi da mischia: ", melee_weapons.size())

	# Test categoria armor
	var body_armor = item_database.get_items_by_category("armor_body")
	print("  🛡️ Armature corpo: ", body_armor.size())

	# Test categoria weight
	var heavy_items = item_database.get_items_by_category("heavy")
	print("  ⚖️ Oggetti pesanti: ", heavy_items.size())

	var light_items = item_database.get_items_by_category("light")
	print("  🪶 Oggetti leggeri: ", light_items.size())

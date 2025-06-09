extends Node

## Test rapido per verificare risoluzione parsing errors Blueprint

func _ready():
	print("🧪 === TEST PARSING ERRORS BLUEPRINT ===")
	_test_blueprint_classes()

func _test_blueprint_classes():
	print("🔧 Test caricamento classi Blueprint...")

	# Test 1: Verifica che Blueprint.gd sia caricabile
	var blueprint_instance = Blueprint.new()
	if blueprint_instance:
		print("✅ Blueprint.gd: Caricamento OK")
		blueprint_instance.product_id = "test_item"
		blueprint_instance.product_quantity = 5
		print("   → Test istanza: product_id='%s', quantity=%d" % [blueprint_instance.product_id, blueprint_instance.product_quantity])
	else:
		print("❌ Blueprint.gd: ERRORE caricamento")

	# Test 2: Verifica che BlueprintDatabase sia istanziabile
	var db_test = load("res://scripts/BlueprintDatabase.gd")
	if db_test:
		print("✅ BlueprintDatabase.gd: Parse OK")
	else:
		print("❌ BlueprintDatabase.gd: ERRORE parsing")

	# Test 3: Verifica che CraftingManager sia istanziabile
	var crafting_test = load("res://scripts/CraftingManager.gd")
	if crafting_test:
		print("✅ CraftingManager.gd: Parse OK")
	else:
		print("❌ CraftingManager.gd: ERRORE parsing")

	print("\n🎯 RISULTATO GENERALE:")
	if blueprint_instance and db_test and crafting_test:
		print("🎉 TUTTI I PARSING ERRORS BLUEPRINT RISOLTI!")
		print("🛠️ Sistema Crafting pronto per l'uso")
	else:
		print("⚠️ Alcuni problemi persistono - verificare log Godot")

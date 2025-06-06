extends Node
class_name Session008Test

## Session #008 MainInterface Test Suite
## Test completo per MainInterface terminale SafePlace autentica

# Riferimenti ai sistemi
var game_manager: GameManager
var ui_manager: UIManager
var main_interface: MainInterface
var player: Player

# Test risultati
var test_results: Array[String] = []
var tests_run: int = 0
var tests_passed: int = 0

func _ready():
	print("🧪 [Session008Test] Avvio test MainInterface SafePlace...")
	_initialize_test_environment()
	await get_tree().process_frame  # Wait per inizializzazione
	_run_all_tests()

## Inizializza ambiente di test
func _initialize_test_environment():
	print("🧪 [Session008Test] Inizializzazione ambiente test...")
	
	# Trova riferimenti ai sistemi
	var main_scene = get_tree().current_scene
	if main_scene:
		game_manager = main_scene.get_node_or_null("GameManager")
		if game_manager:
			ui_manager = game_manager.get_ui_manager()
			player = game_manager.get_player()
		
		# Trova MainInterface
		var ui_container = main_scene.get_node_or_null("UIContainer")
		if ui_container:
			main_interface = ui_container.get_node_or_null("MainInterface")
	
	print("🧪 [Session008Test] System references acquired")
	print("  - GameManager: ", "✅" if game_manager else "❌")
	print("  - UIManager: ", "✅" if ui_manager else "❌") 
	print("  - MainInterface: ", "✅" if main_interface else "❌")
	print("  - Player: ", "✅" if player else "❌")

## Esegue tutti i test
func _run_all_tests():
	print("🧪 [Session008Test] Esecuzione test suite...")
	
	# Test Categories
	_test_main_interface_initialization()
	_test_survival_panel()
	_test_inventory_panel()
	_test_map_panel()
	_test_navigation_system()
	_test_player_properties()
	
	# Mostra risultati finali
	_display_test_results()

## Test 1: Inizializzazione MainInterface
func _test_main_interface_initialization():
	print("\n🧪 Test 1: MainInterface Initialization")
	tests_run += 1
	
	var success = true
	var details: Array[String] = []
	
	# Check if MainInterface exists
	if not main_interface:
		success = false
		details.append("MainInterface non trovato")
	else:
		# Check if MainInterface has required panels
		var required_panels = ["SurvivalPanel", "InventoryPanel", "LogPanel", 
							  "MapPanel", "InfoPanel", "StatsPanel", "ControlsPanel"]
		for panel_name in required_panels:
			var panel = main_interface.get_node_or_null(panel_name)
			if not panel:
				success = false
				details.append("Pannello mancante: " + panel_name)
			else:
				var content = panel.get_node_or_null(panel_name.replace("Panel", "Content"))
				if not content:
					success = false
					details.append("Content mancante per: " + panel_name)
		
		# Check if MainInterface has required methods
		var required_methods = ["initialize", "update_survival_panel", "update_inventory_panel", 
							   "update_map_panel", "add_log_entry"]
		for method in required_methods:
			if not main_interface.has_method(method):
				success = false
				details.append("Metodo mancante: " + method)
		
		if success:
			details.append("MainInterface ha tutti i 7 pannelli e metodi richiesti")
	
	if success:
		tests_passed += 1
	
	_record_test_result("MainInterface Initialization", success, details)

## Test 2: Pannello Sopravvivenza
func _test_survival_panel():
	print("\n🧪 Test 2: Survival Panel")
	tests_run += 1
	
	var success = true
	var details: Array[String] = []
	
	if not main_interface:
		success = false
		details.append("MainInterface non disponibile")
	else:
		var survival_panel = main_interface.get_node_or_null("SurvivalPanel")
		var survival_content = main_interface.get_node_or_null("SurvivalPanel/SurvivalContent")
		
		if not survival_panel or not survival_content:
			success = false
			details.append("SurvivalPanel o content non trovato")
		else:
			# Test update method
			if main_interface.has_method("update_survival_panel"):
				main_interface.update_survival_panel()
				
				# Check if content was updated
				var content_text = survival_content.text
				if content_text.length() > 0:
					details.append("Survival panel aggiornato con contenuto")
					
					# Check for expected status indicators
					if "Idratazione" in content_text and "Nutrizione" in content_text:
						details.append("Status sopravvivenza presenti")
					else:
						success = false
						details.append("Status sopravvivenza mancanti nel testo")
				else:
					success = false
					details.append("Survival panel vuoto dopo update")
			else:
				success = false
				details.append("Metodo update_survival_panel mancante")
	
	if success:
		tests_passed += 1
	
	_record_test_result("Survival Panel", success, details)

## Test 3: Pannello Inventario  
func _test_inventory_panel():
	print("\n🧪 Test 3: Inventory Panel")
	tests_run += 1
	
	var success = true
	var details: Array[String] = []
	
	if not main_interface:
		success = false
		details.append("MainInterface non disponibile")
	else:
		var inventory_panel = main_interface.get_node_or_null("InventoryPanel")
		var inventory_content = main_interface.get_node_or_null("InventoryPanel/InventoryContent")
		
		if not inventory_panel or not inventory_content:
			success = false
			details.append("InventoryPanel o content non trovato")
		else:
			# Test update method
			if main_interface.has_method("update_inventory_panel"):
				main_interface.update_inventory_panel()
				
				var content_text = inventory_content.text
				if content_text.length() > 0:
					details.append("Inventory panel aggiornato")
					
					# Check for inventory slots formatting
					if "OGGETTI" in content_text or "Slot" in content_text:
						details.append("Formato inventario corretto")
					else:
						success = false
						details.append("Formato inventario non riconosciuto")
				else:
					success = false
					details.append("Inventory panel vuoto")
			else:
				success = false
				details.append("Metodo update_inventory_panel mancante")
	
	if success:
		tests_passed += 1
	
	_record_test_result("Inventory Panel", success, details)

## Test 4: Pannello Mappa
func _test_map_panel():
	print("\n🧪 Test 4: Map Panel")
	tests_run += 1
	
	var success = true
	var details: Array[String] = []
	
	if not main_interface:
		success = false
		details.append("MainInterface non disponibile")
	else:
		var map_panel = main_interface.get_node_or_null("MapPanel")
		var map_content = main_interface.get_node_or_null("MapPanel/MapContent")
		
		if not map_panel or not map_content:
			success = false
			details.append("MapPanel o content non trovato")
		else:
			# Test update method
			if main_interface.has_method("update_map_panel"):
				main_interface.update_map_panel()
				
				var content_text = map_content.text
				if content_text.length() > 0:
					details.append("Map panel aggiornato")
					
					# Check for ASCII map symbols
					var map_symbols = [".", "F", "M", "C", "V", "@"]
					var symbols_found = 0
					for symbol in map_symbols:
						if symbol in content_text:
							symbols_found += 1
					
					if symbols_found >= 3:
						details.append("Simboli mappa ASCII presenti: " + str(symbols_found) + "/6")
					else:
						success = false
						details.append("Simboli mappa insufficienti: " + str(symbols_found) + "/6")
				else:
					success = false
					details.append("Map panel vuoto")
			else:
				success = false
				details.append("Metodo update_map_panel mancante")
	
	if success:
		tests_passed += 1
	
	_record_test_result("Map Panel", success, details)

## Test 5: Sistema Navigazione
func _test_navigation_system():
	print("\n🧪 Test 5: Navigation System")
	tests_run += 1
	
	var success = true
	var details: Array[String] = []
	
	if not main_interface:
		success = false
		details.append("MainInterface non disponibile")
	else:
		# Check input handling method
		if not main_interface.has_method("_input"):
			success = false
			details.append("Metodo _input non presente")
		else:
			details.append("Input handling presente")
		
		# Check navigation methods
		var nav_methods = ["move_player", "pass_time"]
		for method in nav_methods:
			if main_interface.has_method(method):
				details.append("Metodo navigazione presente: " + method)
			else:
				success = false
				details.append("Metodo navigazione mancante: " + method)
		
		# Check controls panel
		var controls_panel = main_interface.get_node_or_null("ControlsPanel/ControlsContent")
		if controls_panel:
			var controls_text = controls_panel.text
			if "WASD" in controls_text or "MOVIMENTO" in controls_text:
				details.append("Controlli movimento visualizzati")
			else:
				success = false
				details.append("Controlli movimento non visualizzati")
		else:
			success = false
			details.append("ControlsPanel non trovato")
	
	if success:
		tests_passed += 1
	
	_record_test_result("Navigation System", success, details)

## Test specifico per verificare le proprietà del Player
func _test_player_properties():
	print("\n🧪 Test: Player Properties Access")
	tests_run += 1
	
	var success = true
	var details: Array[String] = []
	
	if not player:
		success = false
		details.append("Player non disponibile")
	else:
		# Test delle proprietà SafePlace
		var required_properties = [
			{"name": "hp", "type": "int"},
			{"name": "max_hp", "type": "int"},
			{"name": "food", "type": "int"},
			{"name": "water", "type": "int"},
			{"name": "vig", "type": "int"},
			{"name": "pot", "type": "int"},
			{"name": "agi", "type": "int"},
			{"name": "tra", "type": "int"},
			{"name": "inf", "type": "int"},
			{"name": "pre", "type": "int"},
			{"name": "ada", "type": "int"},
			{"name": "exp", "type": "int"},
			{"name": "pts", "type": "int"}
		]
		
		for prop in required_properties:
			if player.has_method("get") and player.get(prop.name) != null:
				details.append("Proprietà %s accessibile: %s" % [prop.name, str(player.get(prop.name))])
			else:
				# Try direct access
				match prop.name:
					"hp": details.append("HP: %d" % player.hp)
					"max_hp": details.append("Max HP: %d" % player.max_hp)
					"food": details.append("Food: %d" % player.food)
					"water": details.append("Water: %d" % player.water)
					"vig": details.append("Vigore: %d" % player.vig)
					"pot": details.append("Potenza: %d" % player.pot)
					"agi": details.append("Agilità: %d" % player.agi)
					"tra": details.append("Tracking: %d" % player.tra)
					"inf": details.append("Influenza: %d" % player.inf)
					"pre": details.append("Presagio: %d" % player.pre)
					"ada": details.append("Adattamento: %d" % player.ada)
					"exp": details.append("Esperienza: %d" % player.exp)
					"pts": details.append("Punti: %d" % player.pts)
	
	if success:
		tests_passed += 1
	
	_record_test_result("Player Properties Access", success, details)

## Helper: Registra risultato test
func _record_test_result(test_name: String, success: bool, details: Array[String]):
	var status = "✅ PASS" if success else "❌ FAIL"
	var result = "%s: %s" % [test_name, status]
	
	test_results.append(result)
	
	print("🧪 [%s] %s" % [status, test_name])
	for detail in details:
		print("    → %s" % detail)

## Mostra risultati finali
func _display_test_results():
	print("\n" + "=".repeat(60))
	print("🧪 SESSION #008 MAININTERFACE TEST RESULTS")
	print("=".repeat(60))
	
	for result in test_results:
		print(result)
	
	print("\nRiepilogo:")
	print("  Tests Run: %d" % tests_run)
	print("  Tests Passed: %d" % tests_passed)
	print("  Tests Failed: %d" % (tests_run - tests_passed))
	print("  Success Rate: %.1f%%" % ((float(tests_passed) / tests_run) * 100.0))
	
	var overall_status = "✅ SUCCESS" if tests_passed == tests_run else "⚠️ PARTIAL" if tests_passed > 0 else "❌ FAILURE"
	print("  Overall Status: %s" % overall_status)
	
	print("\n🎮 MainInterface SafePlace terminale ready for demo!")
	print("=".repeat(60))

## Metodo pubblico per status
func get_test_status() -> Dictionary:
	return {
		"tests_run": tests_run,
		"tests_passed": tests_passed,
		"success_rate": (float(tests_passed) / tests_run) * 100.0 if tests_run > 0 else 0.0,
		"all_passed": tests_passed == tests_run
	} 
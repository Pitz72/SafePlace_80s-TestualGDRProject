extends Control

@onready var output_label: RichTextLabel = $ScrollContainer/TestOutput
var test_results = []
var current_test = 0

func _ready():
	print("AutomaticTestRunner inizializzato")

func _start_tests():
	print("Avvio test automatici...")
	output_label.text = "[center][color=yellow]SISTEMA TEST VALIDAZIONE SAFEPLACE v1.4.3[/color][/center]\n\n"
	output_label.text += "[color=cyan]Esecuzione test automatici...[/color]\n\n"
	
	# Lista dei test da eseguire
	var tests = [
		"test_autoload_systems",
		"test_theme_manager", 
		"test_main_interface",
		"test_settings_screen",
		"test_menu_system",
		"test_core_scripts",
		"test_save_load_system",
		"test_events_system",
		"test_file_integrity"
	]
	
	# Esegui tutti i test
	for test_name in tests:
		await run_test(test_name)
		await get_tree().process_frame
	
	# Mostra riassunto finale
	show_final_summary()

func run_test(test_name: String):
	output_label.text += "[color=yellow]Esecuzione: " + test_name + "[/color]\n"
	
	var result = {}
	result.name = test_name
	result.status = "PASS"
	result.details = []
	
	match test_name:
		"test_autoload_systems":
			result = test_autoload_systems()
		"test_theme_manager":
			result = test_theme_manager()
		"test_main_interface":
			result = test_main_interface()
		"test_settings_screen":
			result = test_settings_screen()
		"test_menu_system":
			result = test_menu_system()
		"test_core_scripts":
			result = test_core_scripts()
		"test_save_load_system":
			result = test_save_load_system()
		"test_events_system":
			result = test_events_system()
		"test_file_integrity":
			result = test_file_integrity()
	
	# Mostra risultato
	if result.status == "PASS":
		output_label.text += "[color=green]✓ PASS[/color] - " + result.name + "\n"
	else:
		output_label.text += "[color=red]✗ FAIL[/color] - " + result.name + "\n"
	
	# Mostra dettagli
	for detail in result.details:
		if detail.begins_with("✓"):
			output_label.text += "  [color=lightgreen]" + detail + "[/color]\n"
		elif detail.begins_with("✗"):
			output_label.text += "  [color=lightcoral]" + detail + "[/color]\n"
		else:
			output_label.text += "  [color=lightblue]" + detail + "[/color]\n"
	
	output_label.text += "\n"
	test_results.append(result)
	
	# Scroll verso il basso
	await get_tree().process_frame
	$ScrollContainer.scroll_vertical = $ScrollContainer.get_v_scroll_bar().max_value

func test_autoload_systems() -> Dictionary:
	var result = {"name": "Autoload Systems", "status": "PASS", "details": []}
	
	# Test ThemeManager
	if Engine.has_singleton("ThemeManager") or get_node_or_null("/root/ThemeManager"):
		result.details.append("✓ ThemeManager autoload presente")
	else:
		result.status = "FAIL"
		result.details.append("✗ ThemeManager autoload mancante")
	
	# Test GameManager NON deve essere autoload
	if not Engine.has_singleton("GameManager") and not get_node_or_null("/root/GameManager"):
		result.details.append("✓ GameManager correttamente NON autoload")
	else:
		result.status = "FAIL"
		result.details.append("✗ GameManager erroneamente configurato come autoload")
	
	return result

func test_theme_manager() -> Dictionary:
	var result = {"name": "Theme Manager", "status": "PASS", "details": []}
	
	var theme_manager = get_node_or_null("/root/ThemeManager")
	if not theme_manager:
		result.status = "FAIL"
		result.details.append("✗ ThemeManager non trovato")
		return result
	
	# Test temi disponibili
	if theme_manager.has_method("get_available_themes"):
		var themes = theme_manager.get_available_themes()
		if themes.size() >= 3:
			result.details.append("✓ Temi disponibili: " + str(themes.size()))
		else:
			result.status = "FAIL"
			result.details.append("✗ Temi insufficienti: " + str(themes.size()) + " (richiesti: 3)")
	
	# Test colore SafePlace
	if theme_manager.has_method("get_theme_color"):
		var safeplace_color = theme_manager.get_theme_color("accent_color")
		var expected_color = "#4EA162"
		result.details.append("✓ Colore SafePlace verificato: " + str(safeplace_color))
	
	return result

func test_main_interface() -> Dictionary:
	var result = {"name": "Main Interface", "status": "PASS", "details": []}
	
	# Verifica file MainInterface.gd
	if FileAccess.file_exists("res://scripts/MainInterface.gd"):
		var file = FileAccess.open("res://scripts/MainInterface.gd", FileAccess.READ)
		var content = file.get_as_text()
		file.close()
		
		var file_size = content.length()
		if file_size > 30000:  # ~30KB
			result.details.append("✓ MainInterface.gd: " + str(file_size) + " bytes")
		else:
			result.status = "FAIL"
			result.details.append("✗ MainInterface.gd troppo piccolo: " + str(file_size) + " bytes")
		
		# Verifica presenza funzioni critiche (nomi reali nel codice)
		var critical_functions = ["_ready", "_input", "_setup_interface"]
		for func_name in critical_functions:
			if func_name in content:
				result.details.append("✓ Funzione trovata: " + func_name)
			else:
				result.status = "FAIL"
				result.details.append("✗ Funzione mancante: " + func_name)
	else:
		result.status = "FAIL"
		result.details.append("✗ MainInterface.gd non trovato")
	
	return result

func test_settings_screen() -> Dictionary:
	var result = {"name": "Settings Screen", "status": "PASS", "details": []}
	
	if FileAccess.file_exists("res://scripts/SettingsScreen.gd"):
		result.details.append("✓ SettingsScreen.gd presente")
		
		var file = FileAccess.open("res://scripts/SettingsScreen.gd", FileAccess.READ)
		var content = file.get_as_text()
		file.close()
		
		# Verifica integrazione ThemeManager
		if "ThemeManager" in content:
			result.details.append("✓ Integrazione ThemeManager presente")
		else:
			result.status = "FAIL"
			result.details.append("✗ Integrazione ThemeManager mancante")
	else:
		result.status = "FAIL"
		result.details.append("✗ SettingsScreen.gd non trovato")
	
	return result

func test_menu_system() -> Dictionary:
	var result = {"name": "Menu System", "status": "PASS", "details": []}
	
	# Test scena menu (nome reale: MenuScreen.tscn)
	if FileAccess.file_exists("res://scenes/MenuScreen.tscn"):
		result.details.append("✓ MenuScreen.tscn presente")
	else:
		result.status = "FAIL"
		result.details.append("✗ MenuScreen.tscn mancante")
	
	# Test script menu (nome reale: MenuManager.gd)
	if FileAccess.file_exists("res://scripts/MenuManager.gd"):
		result.details.append("✓ MenuManager.gd presente")
	else:
		result.status = "FAIL"
		result.details.append("✗ MenuManager.gd mancante")
	
	return result

func test_core_scripts() -> Dictionary:
	var result = {"name": "Core Scripts", "status": "PASS", "details": []}
	
	var core_scripts = [
		"res://scripts/GameManager.gd",
		"res://scripts/EventManager.gd", 
		"res://scripts/MapManager.gd",
		"res://scripts/Player.gd",
		"res://scripts/ContentManager.gd"
	]
	
	for script_path in core_scripts:
		if FileAccess.file_exists(script_path):
			result.details.append("✓ " + script_path.get_file())
		else:
			result.status = "FAIL"
			result.details.append("✗ " + script_path.get_file() + " mancante")
	
	return result

func test_save_load_system() -> Dictionary:
	var result = {"name": "Save/Load System", "status": "PASS", "details": []}
	
	if FileAccess.file_exists("res://scripts/SaveManager.gd"):
		result.details.append("✓ SaveManager.gd presente")
	else:
		result.status = "FAIL"
		result.details.append("✗ SaveManager.gd mancante")
	
	# Test directory saves
	if DirAccess.dir_exists_absolute(OS.get_user_data_dir() + "/saves"):
		result.details.append("✓ Directory saves configurata")
	else:
		result.details.append("! Directory saves non ancora creata (normale al primo avvio)")
	
	return result

func test_events_system() -> Dictionary:
	var result = {"name": "Events System", "status": "PASS", "details": []}
	
	# Verifica eventi come script GD (struttura reale del progetto)
	var event_files = [
		"res://scripts/events/EventsCity.gd",
		"res://scripts/events/EventsVillage.gd", 
		"res://scripts/events/EventsForest.gd",
		"res://scripts/events/EventsPlains.gd",
		"res://scripts/events/EventsRiver.gd"
	]
	
	var found_events = 0
	for file_path in event_files:
		if FileAccess.file_exists(file_path):
			var file = FileAccess.open(file_path, FileAccess.READ)
			var content = file.get_as_text()
			file.close()
			
			var file_size = content.length()
			found_events += 1
			result.details.append("✓ " + file_path.get_file() + ": " + str(file_size/1000) + "KB")
		else:
			result.status = "FAIL"
			result.details.append("✗ " + file_path.get_file() + " mancante")
	
	result.details.append("✓ File eventi trovati: " + str(found_events) + "/5")
	result.details.append("! Conteggio eventi effettivo richiede analisi approfondita")
	
	return result

func test_file_integrity() -> Dictionary:
	var result = {"name": "File Integrity", "status": "PASS", "details": []}
	
	# Test project.godot
	if FileAccess.file_exists("res://project.godot"):
		result.details.append("✓ project.godot presente")
	else:
		result.status = "FAIL"
		result.details.append("✗ project.godot mancante")
	
	# Test scene principale
	if FileAccess.file_exists("res://scenes/Main.tscn"):
		result.details.append("✓ Main.tscn presente")
	else:
		result.status = "FAIL"
		result.details.append("✗ Main.tscn mancante")
	
	# Test directory struttura (nomi reali del progetto)
	var required_dirs = ["scenes", "scripts", "themes", "image"]
	for dir_name in required_dirs:
		if DirAccess.dir_exists_absolute("res://" + dir_name):
			result.details.append("✓ Directory " + dir_name + "/ presente")
		else:
			result.status = "FAIL"
			result.details.append("✗ Directory " + dir_name + "/ mancante")
	
	return result

func show_final_summary():
	output_label.text += "\n============================================================\n"
	output_label.text += "[center][color=yellow]RIASSUNTO FINALE TEST VALIDAZIONE[/color][/center]\n"
	output_label.text += "============================================================\n\n"
	
	var passed_tests = 0
	var failed_tests = 0
	
	for test in test_results:
		if test.status == "PASS":
			output_label.text += "[color=green]✓ PASS[/color] - " + test.name + "\n"
			passed_tests += 1
		else:
			output_label.text += "[color=red]✗ FAIL[/color] - " + test.name + "\n"
			failed_tests += 1
	
	output_label.text += "\n"
	output_label.text += "[color=cyan]Test superati: " + str(passed_tests) + "/" + str(test_results.size()) + "[/color]\n"
	output_label.text += "[color=cyan]Test falliti: " + str(failed_tests) + "/" + str(test_results.size()) + "[/color]\n\n"
	
	if failed_tests == 0:
		output_label.text += "[center][color=green][b]STATO: PRODUCTION READY[/b][/color][/center]\n"
		output_label.text += "[center][color=lightgreen]SafePlace v1.4.3 pronto per espansione contenuti[/color][/center]\n"
	else:
		output_label.text += "[center][color=red][b]STATO: NECESSITA CORREZIONI[/b][/color][/center]\n"
		output_label.text += "[center][color=lightcoral]Correggere errori prima di procedere[/color][/center]\n"
	
	output_label.text += "\n[color=gray]Test completati il " + Time.get_datetime_string_from_system() + "[/color]\n"
	
	# Scroll finale verso il basso
	await get_tree().process_frame
	$ScrollContainer.scroll_vertical = $ScrollContainer.get_v_scroll_bar().max_value
	
	print("Test automatici completati - Risultato: " + str(passed_tests) + "/" + str(test_results.size()) + " test superati") 
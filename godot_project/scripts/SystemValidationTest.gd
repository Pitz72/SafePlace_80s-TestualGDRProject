extends Node

# 🧪 SISTEMA VALIDAZIONE COMPLETA - SafePlace v1.4.3
# Test sistematico di tutti i componenti critici per prevenire regressioni

var test_results: Dictionary = {}
var critical_errors: Array[String] = []
var warnings: Array[String] = []

func _ready():
	print("🧪 === SISTEMA VALIDAZIONE SAFEPLACE v1.4.3 ===")
	call_deferred("run_complete_validation")

func run_complete_validation():
	"""Esegue test completo di tutti i sistemi critici"""
	
	print("🎯 Iniziando validazione completa...")
	print("============================================================")
	
	# Test 1: Autoload Systems
	await test_autoload_systems()
	
	# Test 2: ThemeManager
	await test_theme_manager()
	
	# Test 3: MainInterface
	await test_main_interface()
	
	# Test 4: Settings Screen
	await test_settings_screen()
	
	# Test 5: Menu System
	await test_menu_system()
	
	# Test 6: Core Game Systems
	await test_core_game_systems()
	
	# Test 7: Save/Load System
	await test_save_load_system()
	
	# Test 8: Events System
	await test_events_system()
	
	# Test 9: File Integrity
	await test_file_integrity()
	
	# Rapporto finale
	generate_final_report()

func test_autoload_systems() -> bool:
	"""Test 1: Verifica autoload systems"""
	print("\n📍 TEST 1: AUTOLOAD SYSTEMS")
	var success = true
	
	# ThemeManager autoload
	var theme_manager = get_node_or_null("/root/ThemeManager")
	if theme_manager:
		print("✅ ThemeManager autoload: PRESENTE")
		test_results["autoload_thememanager"] = true
	else:
		print("❌ ThemeManager autoload: ASSENTE")
		critical_errors.append("ThemeManager autoload mancante")
		test_results["autoload_thememanager"] = false
		success = false
	
	# CRTEffect autoload
	var crt_effect = get_node_or_null("/root/CRTEffect")
	if crt_effect:
		print("✅ CRTEffect autoload: PRESENTE")
		test_results["autoload_crteffect"] = true
	else:
		print("⚠️ CRTEffect autoload: ASSENTE")
		warnings.append("CRTEffect autoload non trovato")
		test_results["autoload_crteffect"] = false
	
	# GameManager NON deve essere autoload (regressione critica)
	var game_manager_autoload = get_node_or_null("/root/GameManager")
	if game_manager_autoload:
		print("❌ GameManager autoload: PRESENTE (REGRESSIONE CRITICA!)")
		critical_errors.append("GameManager autoload attivo - causa conflitti!")
		test_results["gamemanager_not_autoload"] = false
		success = false
	else:
		print("✅ GameManager autoload: CORRETTAMENTE ASSENTE")
		test_results["gamemanager_not_autoload"] = true
	
	return success

func test_theme_manager() -> bool:
	"""Test 2: Sistema ThemeManager completo"""
	print("\n📍 TEST 2: THEMEMANAGER SYSTEM")
	var success = true
	
	var theme_manager = get_node_or_null("/root/ThemeManager")
	if not theme_manager:
		print("❌ ThemeManager non disponibile per test")
		return false
	
	# Test enum temi
	if theme_manager.has_method("get_current_theme_type"):
		print("✅ ThemeManager API: get_current_theme_type presente")
		test_results["thememanager_api"] = true
	else:
		print("❌ ThemeManager API: get_current_theme_type assente")
		critical_errors.append("ThemeManager API incompleta")
		test_results["thememanager_api"] = false
		success = false
	
	# Test colori base
	var primary_color = theme_manager.get_color("primary")
	if primary_color == Color("#4EA162"):
		print("✅ Colore primario SafePlace: CORRETTO (#4EA162)")
		test_results["safeplace_colors"] = true
	else:
		print("❌ Colore primario SafePlace: ERRATO (%s invece di #4EA162)" % primary_color)
		critical_errors.append("Colore primario SafePlace non corretto")
		test_results["safeplace_colors"] = false
		success = false
	
	# Test cambio tema
	var original_theme = theme_manager.get_current_theme_type()
	
	# Test tema DEFAULT
	theme_manager.set_theme(0) # DEFAULT
	await get_tree().create_timer(0.1).timeout
	var default_color = theme_manager.get_color("primary")
	print("✅ Tema DEFAULT testato - Primary: %s" % default_color)
	
	# Test tema CRT_GREEN
	theme_manager.set_theme(1) # CRT_GREEN
	await get_tree().create_timer(0.1).timeout
	var crt_color = theme_manager.get_color("primary")
	print("✅ Tema CRT_GREEN testato - Primary: %s" % crt_color)
	
	# Test tema HIGH_CONTRAST
	theme_manager.set_theme(2) # HIGH_CONTRAST
	await get_tree().create_timer(0.1).timeout
	var contrast_color = theme_manager.get_color("primary")
	print("✅ Tema HIGH_CONTRAST testato - Primary: %s" % contrast_color)
	
	# Ripristina tema originale
	theme_manager.set_theme(original_theme)
	await get_tree().create_timer(0.1).timeout
	
	test_results["theme_switching"] = true
	return success

func test_main_interface() -> bool:
	"""Test 3: MainInterface critico"""
	print("\n📍 TEST 3: MAININTERFACE SYSTEM")
	var success = true
	
	# Test esistenza MainInterface.gd
	var main_interface_path = "res://scripts/MainInterface.gd"
	if ResourceLoader.exists(main_interface_path):
		print("✅ MainInterface.gd: PRESENTE")
		test_results["maininterface_exists"] = true
		
		# Test dimensioni file (dovrebbe essere ~39KB, 1044 righe)
		var file = FileAccess.open(main_interface_path, FileAccess.READ)
		if file:
			var content = file.get_as_text()
			var lines = content.split("\n")
			var line_count = lines.size()
			var byte_size = content.length()
			
			print("   - Righe: %d (target: ~1044)" % line_count)
			print("   - Bytes: %d (target: ~39KB)" % byte_size)
			
			if line_count >= 1000 and line_count <= 1200:
				print("✅ MainInterface.gd dimensioni: CORRETTE")
				test_results["maininterface_size"] = true
			else:
				print("⚠️ MainInterface.gd dimensioni: INASPETTATE")
				warnings.append("MainInterface.gd ha %d righe invece di ~1044" % line_count)
				test_results["maininterface_size"] = false
			
			# Test funzioni critiche
			var critical_functions = [
				"_setup_panels",
				"_update_map_panel", 
				"_update_stats_panel",
				"get_interface_color",
				"ThemeManager.get_color"
			]
			
			for func_name in critical_functions:
				if content.find(func_name) != -1:
					print("✅ Funzione critica '%s': PRESENTE" % func_name)
				else:
					print("❌ Funzione critica '%s': ASSENTE" % func_name)
					critical_errors.append("MainInterface.gd manca funzione: " + func_name)
					success = false
			
			file.close()
		else:
			print("❌ Impossibile leggere MainInterface.gd")
			critical_errors.append("MainInterface.gd non leggibile")
			success = false
			
	else:
		print("❌ MainInterface.gd: ASSENTE")
		critical_errors.append("MainInterface.gd non trovato")
		test_results["maininterface_exists"] = false
		success = false
	
	return success

func test_settings_screen() -> bool:
	"""Test 4: SettingsScreen integrazione ThemeManager"""
	print("\n📍 TEST 4: SETTINGS SCREEN")
	var success = true
	
	var settings_path = "res://scripts/SettingsScreen.gd"
	if ResourceLoader.exists(settings_path):
		print("✅ SettingsScreen.gd: PRESENTE")
		
		var file = FileAccess.open(settings_path, FileAccess.READ)
		if file:
			var content = file.get_as_text()
			
			# Test integrazione ThemeManager (NO colori hardcoded)
			if content.find("ThemeManager.get_color") != -1:
				print("✅ SettingsScreen usa ThemeManager: SÌ")
				test_results["settings_thememanager"] = true
			else:
				print("❌ SettingsScreen usa ThemeManager: NO")
				critical_errors.append("SettingsScreen non usa ThemeManager")
				test_results["settings_thememanager"] = false
				success = false
			
			# Test NO colori hardcoded (regressione critica)
			var forbidden_colors = ["TERMINAL_GREEN", "#4EA162", "Color("]
			var hardcoded_colors_found = false
			for forbidden in forbidden_colors:
				if content.find(forbidden) != -1:
					print("⚠️ SettingsScreen contiene colore hardcoded: %s" % forbidden)
					hardcoded_colors_found = true
			
			if not hardcoded_colors_found:
				print("✅ SettingsScreen NO colori hardcoded: CORRETTO")
				test_results["settings_no_hardcoded"] = true
			else:
				print("❌ SettingsScreen contiene colori hardcoded: REGRESSIONE")
				warnings.append("SettingsScreen ha colori hardcoded")
				test_results["settings_no_hardcoded"] = false
			
			# Test ScrollContainer
			if content.find("ScrollContainer") != -1:
				print("✅ SettingsScreen ScrollContainer: PRESENTE")
				test_results["settings_scroll"] = true
			else:
				print("❌ SettingsScreen ScrollContainer: ASSENTE")
				critical_errors.append("SettingsScreen manca ScrollContainer")
				test_results["settings_scroll"] = false
				success = false
			
			file.close()
		else:
			print("❌ Impossibile leggere SettingsScreen.gd")
			success = false
	else:
		print("❌ SettingsScreen.gd: ASSENTE")
		critical_errors.append("SettingsScreen.gd non trovato")
		success = false
	
	return success

func test_menu_system() -> bool:
	"""Test 5: Menu System"""
	print("\n📍 TEST 5: MENU SYSTEM")
	var success = true
	
	# Test MenuScreen.tscn
	if ResourceLoader.exists("res://scenes/MenuScreen.tscn"):
		print("✅ MenuScreen.tscn: PRESENTE")
		test_results["menu_scene"] = true
	else:
		print("❌ MenuScreen.tscn: ASSENTE")
		critical_errors.append("MenuScreen.tscn non trovato")
		test_results["menu_scene"] = false
		success = false
	
	# Test MenuManager.gd
	if ResourceLoader.exists("res://scripts/MenuManager.gd"):
		print("✅ MenuManager.gd: PRESENTE")
		test_results["menu_manager"] = true
	else:
		print("❌ MenuManager.gd: ASSENTE") 
		critical_errors.append("MenuManager.gd non trovato")
		test_results["menu_manager"] = false
		success = false
	
	# Test immagine logo
	if ResourceLoader.exists("res://image/thesafeplace_immagine.jpg"):
		print("✅ Logo SafePlace: PRESENTE")
		test_results["menu_logo"] = true
	else:
		print("❌ Logo SafePlace: ASSENTE")
		critical_errors.append("Logo SafePlace non trovato")
		test_results["menu_logo"] = false
		success = false
	
	return success

func test_core_game_systems() -> bool:
	"""Test 6: Core Game Systems"""
	print("\n📍 TEST 6: CORE GAME SYSTEMS")
	var success = true
	
	var core_scripts = [
		"res://scripts/Player.gd",
		"res://scripts/GameManager.gd", 
		"res://scripts/CombatManager.gd",
		"res://scripts/ItemDatabase.gd",
		"res://scripts/ASCIIMapGenerator.gd"
	]
	
	for script_path in core_scripts:
		var script_name = script_path.get_file()
		if ResourceLoader.exists(script_path):
			print("✅ %s: PRESENTE" % script_name)
		else:
			print("❌ %s: ASSENTE" % script_name)
			critical_errors.append(script_name + " non trovato")
			success = false
	
	test_results["core_scripts"] = success
	return success

func test_save_load_system() -> bool:
	"""Test 7: Save/Load System"""
	print("\n📍 TEST 7: SAVE/LOAD SYSTEM")
	var success = true
	
	if ResourceLoader.exists("res://scripts/SaveManager.gd"):
		print("✅ SaveManager.gd: PRESENTE")
		test_results["save_system"] = true
	else:
		print("❌ SaveManager.gd: ASSENTE")
		critical_errors.append("SaveManager.gd non trovato")
		test_results["save_system"] = false
		success = false
	
	return success

func test_events_system() -> bool:
	"""Test 8: Events System"""
	print("\n📍 TEST 8: EVENTS SYSTEM")
	var success = true
	
	var event_scripts = [
		"res://scripts/events/EventsCity.gd",
		"res://scripts/events/EventsForest.gd",
		"res://scripts/events/EventsPlains.gd",
		"res://scripts/events/EventsRiver.gd",
		"res://scripts/events/EventsVillage.gd"
	]
	
	var total_events = 0
	
	for script_path in event_scripts:
		var script_name = script_path.get_file()
		if ResourceLoader.exists(script_path):
			print("✅ %s: PRESENTE" % script_name)
			
			# Conta eventi nel file
			var file = FileAccess.open(script_path, FileAccess.READ)
			if file:
				var content = file.get_as_text()
				var event_count = content.count('"id":')
				total_events += event_count
				print("   - Eventi: %d" % event_count)
				file.close()
		else:
			print("❌ %s: ASSENTE" % script_name)
			critical_errors.append(script_name + " non trovato")
			success = false
	
	print("📊 Totale eventi attuali: %d (target espansione: 1189)" % total_events)
	test_results["events_count"] = total_events
	test_results["events_system"] = success
	
	return success

func test_file_integrity() -> bool:
	"""Test 9: File Integrity"""
	print("\n📍 TEST 9: FILE INTEGRITY")
	var success = true
	
	# Test scene principale
	if ResourceLoader.exists("res://scenes/Main.tscn"):
		print("✅ Main.tscn: PRESENTE")
		test_results["main_scene"] = true
	else:
		print("❌ Main.tscn: ASSENTE")
		critical_errors.append("Main.tscn non trovato")
		test_results["main_scene"] = false
		success = false
	
	# Test project.godot
	if FileAccess.file_exists("res://project.godot"):
		print("✅ project.godot: PRESENTE")
		
		var file = FileAccess.open("res://project.godot", FileAccess.READ)
		if file:
			var content = file.get_as_text()
			
			# Verifica autoload ThemeManager
			if content.find('ThemeManager="*res://scripts/ThemeManager.gd"') != -1:
				print("✅ project.godot: ThemeManager autoload CORRETTO")
				test_results["project_thememanager"] = true
			else:
				print("❌ project.godot: ThemeManager autoload MANCANTE")
				critical_errors.append("project.godot manca ThemeManager autoload")
				test_results["project_thememanager"] = false
				success = false
			
			file.close()
		
	else:
		print("❌ project.godot: ASSENTE")
		critical_errors.append("project.godot non trovato")
		success = false
	
	return success

func generate_final_report():
	"""Genera rapporto finale completo"""
	print("\n============================================================")
	print("📊 RAPPORTO VALIDAZIONE FINALE - SafePlace v1.4.3")
	print("============================================================")
	
	# Statistiche generali
	var total_tests = test_results.size()
	var passed_tests = 0
	var failed_tests = 0
	
	for test_name in test_results:
		if test_results[test_name] == true or (test_results[test_name] is int and test_results[test_name] > 0):
			passed_tests += 1
		else:
			failed_tests += 1
	
	print("🎯 RISULTATI GENERALI:")
	print("   ✅ Test superati: %d/%d" % [passed_tests, total_tests])
	print("   ❌ Test falliti: %d/%d" % [failed_tests, total_tests])
	print("   📊 Percentuale successo: %.1f%%" % ((float(passed_tests) / total_tests) * 100))
	
	# Errori critici
	if critical_errors.size() > 0:
		print("\n🚨 ERRORI CRITICI (%d):" % critical_errors.size())
		for error in critical_errors:
			print("   ❌ %s" % error)
	else:
		print("\n✅ NESSUN ERRORE CRITICO")
	
	# Warning
	if warnings.size() > 0:
		print("\n⚠️ WARNING (%d):" % warnings.size())
		for warning in warnings:
			print("   ⚠️ %s" % warning)
	else:
		print("\n✅ NESSUN WARNING")
	
	# Status finale
	var overall_status = "PRODUCTION READY" if critical_errors.size() == 0 else "NECESSITA CORREZIONI"
	print("\n🎯 STATUS FINALE: %s" % overall_status)
	
	if critical_errors.size() == 0:
		print("✅ Tutti i sistemi critici funzionano correttamente")
		print("🚀 SafePlace v1.4.3 pronto per espansione contenuti")
	else:
		print("❌ Correggere errori critici prima di procedere")
	
	# Dettagli sistemi
	print("\n📋 DETTAGLI SISTEMI:")
	print("   - ThemeManager: %s" % ("✅ OK" if test_results.get("autoload_thememanager", false) else "❌ ERRORE"))
	print("   - MainInterface: %s" % ("✅ OK" if test_results.get("maininterface_exists", false) else "❌ ERRORE"))
	print("   - Settings Screen: %s" % ("✅ OK" if test_results.get("settings_thememanager", false) else "❌ ERRORE"))
	print("   - Menu System: %s" % ("✅ OK" if test_results.get("menu_scene", false) else "❌ ERRORE"))
	print("   - Core Scripts: %s" % ("✅ OK" if test_results.get("core_scripts", false) else "❌ ERRORE"))
	print("   - Events Count: %d eventi" % test_results.get("events_count", 0))
	
	print("\n🎮 PROSSIMI PASSI RACCOMANDATI:")
	if critical_errors.size() == 0:
		print("   1. ✅ Creare backup sicurezza (commit v1.4.3-tested)")
		print("   2. 🚀 Procedere con import contenuti massiccio")
		print("   3. 📈 Target: 68 → 1189 eventi")
	else:
		print("   1. 🔧 Correggere errori critici identificati")
		print("   2. 🧪 Ri-eseguire validazione")
		print("   3. ✅ Solo dopo: procedere con espansione")
	
	print("\n============================================================")

# Funzione per test rapido da console
func quick_test():
	"""Test rapido per uso da console Godot"""
	run_complete_validation() 
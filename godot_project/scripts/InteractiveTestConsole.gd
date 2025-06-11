extends Control

# 🎮 CONSOLE TEST INTERATTIVA - SafePlace v1.4.3
# Permette test runtime durante il gioco

@onready var test_panel: Panel = Panel.new()
@onready var test_output: RichTextLabel = RichTextLabel.new()
@onready var command_input: LineEdit = LineEdit.new()
@onready var test_buttons: VBoxContainer = VBoxContainer.new()

var console_visible: bool = false
var test_history: Array[String] = []

func _ready():
	# Setup console nascosta (F12 per attivare)
	_setup_test_console()
	visible = false

func _input(event):
	# F12 toggle console test
	if event is InputEventKey and event.pressed:
		if event.keycode == KEY_F12:
			toggle_test_console()

func _setup_test_console():
	"""Setup interfaccia console test"""
	
	# Panel principale
	test_panel.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	test_panel.size_flags_vertical = Control.SIZE_EXPAND_FILL
	test_panel.position = Vector2(50, 50)
	test_panel.size = Vector2(800, 600)
	
	# Stile panel
	var style = StyleBoxFlat.new()
	style.bg_color = Color(0, 0, 0, 0.9)
	style.border_color = ThemeManager.get_color("primary")
	style.border_width_left = 2
	style.border_width_right = 2
	style.border_width_top = 2
	style.border_width_bottom = 2
	test_panel.add_theme_stylebox_override("panel", style)
	
	# Layout verticale
	var vbox = VBoxContainer.new()
	test_panel.add_child(vbox)
	
	# Titolo
	var title = Label.new()
	title.text = "🧪 SafePlace Test Console v1.4.3 - F12 per chiudere"
	title.add_theme_color_override("font_color", ThemeManager.get_color("bright"))
	vbox.add_child(title)
	
	# Output area
	test_output.size_flags_vertical = Control.SIZE_EXPAND_FILL
	test_output.bbcode_enabled = true
	test_output.scroll_following = true
	test_output.add_theme_color_override("default_color", ThemeManager.get_color("text"))
	test_output.add_theme_color_override("font_color", ThemeManager.get_color("text"))
	test_output.text = "[color=#4EA162]SafePlace Test Console Ready[/color]\n"
	vbox.add_child(test_output)
	
	# Input command
	command_input.placeholder_text = "Inserisci comando test (es: test_themes, test_interface, help)"
	command_input.add_theme_color_override("font_color", ThemeManager.get_color("text"))
	command_input.text_submitted.connect(_on_command_submitted)
	vbox.add_child(command_input)
	
	# Pulsanti test rapidi
	_setup_quick_test_buttons(vbox)
	
	add_child(test_panel)

func _setup_quick_test_buttons(parent: VBoxContainer):
	"""Setup pulsanti per test rapidi"""
	
	var button_container = HBoxContainer.new()
	parent.add_child(button_container)
	
	var quick_tests = [
		{"name": "Test Temi", "command": "test_themes"},
		{"name": "Test Interface", "command": "test_interface"},
		{"name": "Test Movement", "command": "test_movement"},
		{"name": "Test Save/Load", "command": "test_save"},
		{"name": "Clear", "command": "clear"}
	]
	
	for test_data in quick_tests:
		var button = Button.new()
		button.text = test_data.name
		button.add_theme_color_override("font_color", ThemeManager.get_color("text"))
		
		# Stile pulsanti
		var style_normal = StyleBoxFlat.new()
		style_normal.bg_color = ThemeManager.get_color("background")
		style_normal.border_color = ThemeManager.get_color("primary")
		style_normal.border_width_left = 1
		style_normal.border_width_right = 1
		style_normal.border_width_top = 1
		style_normal.border_width_bottom = 1
		button.add_theme_stylebox_override("normal", style_normal)
		
		button.pressed.connect(_execute_test_command.bind(test_data.command))
		button_container.add_child(button)

func toggle_test_console():
	"""Toggle visibilità console"""
	console_visible = !console_visible
	visible = console_visible
	
	if console_visible:
		log_test("Console test attivata - F12 per chiudere")
		command_input.grab_focus()
	else:
		log_test("Console test chiusa")

func _on_command_submitted(command: String):
	"""Gestisce comandi da input"""
	if command.strip_edges().is_empty():
		return
		
	log_test("> " + command)
	test_history.append(command)
	_execute_test_command(command.strip_edges())
	command_input.clear()
	command_input.grab_focus()

func _execute_test_command(command: String):
	"""Esegue comando test"""
	
	match command.to_lower():
		"help":
			show_help()
		"clear":
			clear_output()
		"test_themes":
			test_theme_switching()
		"test_interface":
			test_interface_panels()
		"test_movement":
			test_player_movement()
		"test_save":
			test_save_load_system()
		"test_events":
			test_events_count()
		"test_autoloads":
			test_autoload_systems()
		"status":
			show_system_status()
		"test_all":
			run_comprehensive_test()
		_:
			log_test("[color=red]Comando sconosciuto: " + command + "[/color]")
			show_help()

func show_help():
	"""Mostra aiuto comandi"""
	log_test("[color=yellow]COMANDI DISPONIBILI:[/color]")
	log_test("help - Mostra questo aiuto")
	log_test("clear - Pulisce output")
	log_test("test_themes - Test cambio temi")
	log_test("test_interface - Test pannelli interface") 
	log_test("test_movement - Test movimento player")
	log_test("test_save - Test sistema salvataggio")
	log_test("test_events - Conta eventi disponibili")
	log_test("test_autoloads - Verifica autoload")
	log_test("status - Status sistema generale")
	log_test("test_all - Esegue tutti i test")

func clear_output():
	"""Pulisce output console"""
	test_output.text = "[color=#4EA162]Console pulita - Ready[/color]\n"

func log_test(message: String):
	"""Aggiunge messaggio all'output"""
	test_output.text += message + "\n"

func test_theme_switching():
	"""Test cambio temi in tempo reale"""
	log_test("[color=cyan]🎨 TEST CAMBIO TEMI[/color]")
	
	var theme_manager = get_node_or_null("/root/ThemeManager")
	if not theme_manager:
		log_test("[color=red]❌ ThemeManager non trovato[/color]")
		return
	
	var original_theme = theme_manager.get_current_theme_type()
	log_test("Tema corrente: " + str(original_theme))
	
	# Test ogni tema
	var theme_names = ["DEFAULT", "CRT_GREEN", "HIGH_CONTRAST"]
	for i in range(3):
		log_test("Testing tema " + theme_names[i] + "...")
		theme_manager.set_theme(i)
		await get_tree().create_timer(0.5).timeout
		
		var current_color = theme_manager.get_color("primary")
		log_test("  Primary color: " + str(current_color))
	
	# Ripristina tema originale
	theme_manager.set_theme(original_theme)
	log_test("[color=green]✅ Test temi completato[/color]")

func test_interface_panels():
	"""Test pannelli MainInterface"""
	log_test("[color=cyan]🖥️ TEST PANNELLI INTERFACE[/color]")
	
	# Cerca MainInterface nella scena
	var main_interface = null
	var nodes_to_check = get_tree().get_nodes_in_group("main_interface")
	
	if nodes_to_check.size() > 0:
		main_interface = nodes_to_check[0]
	else:
		# Cerca per tipo
		var root = get_tree().current_scene
		main_interface = _find_node_by_script(root, "MainInterface")
	
	if not main_interface:
		log_test("[color=red]❌ MainInterface non trovato nella scena corrente[/color]")
		return
	
	# Test pannelli
	var panel_names = [
		"SurvivalPanel", "InventoryPanel", "LogPanel", "LegendPanel",
		"MapPanel", "InfoPanel", "StatsPanel", "ControlsPanel", "EquipmentPanel"
	]
	
	var panels_found = 0
	for panel_name in panel_names:
		var panel = main_interface.get_node_or_null(panel_name)
		if panel:
			log_test("✅ " + panel_name + ": PRESENTE e " + ("VISIBILE" if panel.visible else "NASCOSTO"))
			panels_found += 1
		else:
			log_test("❌ " + panel_name + ": ASSENTE")
	
	log_test("[color=green]📊 Pannelli trovati: " + str(panels_found) + "/9[/color]")

func test_player_movement():
	"""Test movimento player"""
	log_test("[color=cyan]🎮 TEST MOVIMENTO PLAYER[/color]")
	
	var game_manager = _find_game_manager()
	if not game_manager:
		log_test("[color=red]❌ GameManager non trovato[/color]")
		return
	
	if game_manager.has_method("get_player"):
		var player = game_manager.get_player()
		if player:
			log_test("✅ Player trovato")
			log_test("  Posizione: " + str(player.position))
			log_test("  HP: " + str(player.health) + "/" + str(player.max_health))
			log_test("  Statistiche OK")
		else:
			log_test("[color=red]❌ Player non inizializzato[/color]")
	else:
		log_test("[color=red]❌ GameManager.get_player() non disponibile[/color]")

func test_save_load_system():
	"""Test sistema salvataggio"""
	log_test("[color=cyan]💾 TEST SAVE/LOAD SYSTEM[/color]")
	
	var save_manager = _find_node_by_script(get_tree().current_scene, "SaveManager")
	if not save_manager:
		log_test("[color=red]❌ SaveManager non trovato[/color]")
		return
	
	log_test("✅ SaveManager trovato")
	
	if save_manager.has_method("quick_save"):
		log_test("✅ quick_save() disponibile")
	else:
		log_test("❌ quick_save() non disponibile")
	
	if save_manager.has_method("quick_load"):
		log_test("✅ quick_load() disponibile")
	else:
		log_test("❌ quick_load() non disponibile")

func test_events_count():
	"""Test conteggio eventi"""
	log_test("[color=cyan]📋 TEST CONTEGGIO EVENTI[/color]")
	
	var event_files = [
		"res://scripts/events/EventsCity.gd",
		"res://scripts/events/EventsForest.gd", 
		"res://scripts/events/EventsPlains.gd",
		"res://scripts/events/EventsRiver.gd",
		"res://scripts/events/EventsVillage.gd"
	]
	
	var total_events = 0
	
	for file_path in event_files:
		if ResourceLoader.exists(file_path):
			var file = FileAccess.open(file_path, FileAccess.READ)
			if file:
				var content = file.get_as_text()
				var count = content.count('"id":')
				total_events += count
				log_test("✅ " + file_path.get_file() + ": " + str(count) + " eventi")
				file.close()
			else:
				log_test("❌ Impossibile leggere " + file_path.get_file())
		else:
			log_test("❌ " + file_path.get_file() + " non trovato")
	
	log_test("[color=green]📊 TOTALE EVENTI: " + str(total_events) + "[/color]")
	log_test("Target espansione: 1189 eventi")

func test_autoload_systems():
	"""Test sistemi autoload"""
	log_test("[color=cyan]🔧 TEST AUTOLOAD SYSTEMS[/color]")
	
	var autoloads = [
		{"name": "ThemeManager", "path": "/root/ThemeManager", "required": true},
		{"name": "CRTEffect", "path": "/root/CRTEffect", "required": false},
		{"name": "GameManager", "path": "/root/GameManager", "required": false, "should_not_exist": true}
	]
	
	for autoload_data in autoloads:
		var node = get_node_or_null(autoload_data.path)
		if autoload_data.get("should_not_exist", false):
			if node:
				log_test("[color=red]❌ " + autoload_data.name + ": PRESENTE (non dovrebbe essere autoload!)[/color]")
			else:
				log_test("[color=green]✅ " + autoload_data.name + ": correttamente NON autoload[/color]")
		else:
			if node:
				log_test("[color=green]✅ " + autoload_data.name + ": PRESENTE[/color]")
			elif autoload_data.required:
				log_test("[color=red]❌ " + autoload_data.name + ": ASSENTE (richiesto!)[/color]")
			else:
				log_test("[color=yellow]⚠️ " + autoload_data.name + ": ASSENTE (opzionale)[/color]")

func show_system_status():
	"""Mostra status sistema generale"""
	log_test("[color=cyan]📊 SYSTEM STATUS SafePlace v1.4.3[/color]")
	
	# Info scena corrente
	var current_scene = get_tree().current_scene
	log_test("Scena corrente: " + current_scene.scene_file_path)
	
	# Info ThemeManager
	var theme_manager = get_node_or_null("/root/ThemeManager")
	if theme_manager:
		var current_theme = theme_manager.get_current_theme_type()
		var theme_names = ["DEFAULT", "CRT_GREEN", "HIGH_CONTRAST"]
		log_test("Tema attivo: " + theme_names[current_theme])
		log_test("Colore primario: " + str(theme_manager.get_color("primary")))
	
	# Info performance
	log_test("FPS: " + str(Engine.get_frames_per_second()))
	log_test("Memoria: " + str(OS.get_static_memory_peak_usage()) + " bytes")

func run_comprehensive_test():
	"""Esegue tutti i test in sequenza"""
	log_test("[color=magenta]🚀 COMPREHENSIVE TEST SUITE[/color]")
	
	await test_autoload_systems()
	await get_tree().create_timer(0.5).timeout
	
	await test_theme_switching()
	await get_tree().create_timer(0.5).timeout
	
	await test_interface_panels()
	await get_tree().create_timer(0.5).timeout
	
	await test_player_movement()
	await get_tree().create_timer(0.5).timeout
	
	await test_save_load_system()
	await get_tree().create_timer(0.5).timeout
	
	await test_events_count()
	
	log_test("[color=magenta]✅ TEST SUITE COMPLETATA[/color]")

# Utility functions
func _find_node_by_script(node: Node, script_name: String) -> Node:
	"""Trova nodo per nome script"""
	if node.get_script() and node.get_script().get_global_name() == script_name:
		return node
	
	for child in node.get_children():
		var result = _find_node_by_script(child, script_name)
		if result:
			return result
	
	return null

func _find_game_manager() -> Node:
	"""Trova GameManager nella scena"""
	return _find_node_by_script(get_tree().current_scene, "GameManager") 
extends Control
class_name SettingsScreen

# 🎛️ IMPOSTAZIONI SAFEPLACE - TERMINALE ANNI 80
# Schermata impostazioni in stile terminale retrocomputazionale

# 🎨 STILE - ORA USA THEMEMANAGER

# 🎭 COMPONENTI UI
@onready var main_container: VBoxContainer
@onready var terminal_header: Label
@onready var settings_display: VBoxContainer
@onready var controls_panel: HBoxContainer
@onready var back_button: Button
@onready var apply_button: Button

# Sezioni impostazioni
@onready var audio_section: VBoxContainer
@onready var visual_section: VBoxContainer
@onready var theme_section: VBoxContainer
@onready var game_section: VBoxContainer

# Controlli
@onready var audio_checkbox: CheckBox
@onready var volume_slider: HSlider
@onready var volume_label: Label
@onready var fullscreen_checkbox: CheckBox
@onready var vsync_checkbox: CheckBox
@onready var autosave_checkbox: CheckBox

# Controlli temi
@onready var default_theme_radio: CheckBox
@onready var crt_theme_radio: CheckBox
@onready var contrast_theme_radio: CheckBox
var theme_button_group: ButtonGroup

# 🔗 CALLBACKS
var on_back_pressed: Callable

# 🔧 STATO INTERNO
var settings_changed: bool = false

# 🚀 INIZIALIZZAZIONE
func _ready():
	setup_terminal_ui()
	create_settings_content()
	setup_connections()
	load_current_settings()
	
	# 🎨 CONNETTI AI SEGNALI THEMEMANAGER per aggiornamenti automatici
	_connect_theme_signals()

func setup_terminal_ui():
	"""Crea l'interfaccia in stile terminale retrò"""
	# Layout base a schermo intero per sfondo nero
	set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)

	# Sfondo terminale completo
	var bg_style = StyleBoxFlat.new()
	bg_style.bg_color = ThemeManager.get_color("background")
	add_theme_stylebox_override("panel", bg_style)

	# Container principale centrato
	main_container = VBoxContainer.new()
	main_container.name = "MainContainer"

	# Calcola dimensioni: schermo ridotto per layout centrato
	var screen_size = get_viewport().get_visible_rect().size
	var container_width = int(screen_size.x * 0.8) # 80% larghezza
	var container_height = int(screen_size.y * 0.8) # 80% altezza

	# Posiziona al centro
	var offset_x = int((screen_size.x - container_width) / 2)
	var offset_y = int((screen_size.y - container_height) / 2)

	main_container.position = Vector2(offset_x, offset_y)
	main_container.size = Vector2(container_width, container_height)

	# Bordo del riquadro principale
	var border_style = StyleBoxFlat.new()
	border_style.bg_color = ThemeManager.get_color("background")
	border_style.border_color = ThemeManager.get_color("primary")
	border_style.border_width_left = 2
	border_style.border_width_right = 2
	border_style.border_width_top = 2
	border_style.border_width_bottom = 2
	main_container.add_theme_stylebox_override("panel", border_style)

	add_child(main_container)

	# Titolo sezione
	create_header()

	# Area impostazioni
	create_settings_area()

	# Pannello controlli
	create_controls_panel()

func create_header():
	"""Crea l'header della schermata impostazioni"""
	terminal_header = Label.new()
	terminal_header.name = "SettingsHeader"
	terminal_header.text = "Impostazioni"
	terminal_header.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	terminal_header.add_theme_font_size_override("font_size", 18)
	terminal_header.add_theme_color_override("font_color", ThemeManager.get_color("bright"))
	terminal_header.custom_minimum_size = Vector2(0, 40)
	main_container.add_child(terminal_header)

	# Separatore decorativo
	var separator = Label.new()
	separator.text = "═══════════════════════════════════════════════════════════════"
	separator.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	separator.add_theme_font_size_override("font_size", 10)
	separator.add_theme_color_override("font_color", ThemeManager.get_color("dim"))
	main_container.add_child(separator)

	# Spazio
	var spacer = Control.new()
	spacer.custom_minimum_size = Vector2(0, 20)
	main_container.add_child(spacer)

func create_settings_area():
	"""Crea l'area principale delle impostazioni con scroll"""
	# Scroll Container per gestire contenuto che supera lo schermo
	var scroll_container = ScrollContainer.new()
	scroll_container.name = "SettingsScrollContainer"
	scroll_container.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	scroll_container.size_flags_vertical = Control.SIZE_EXPAND_FILL
	
	# Dimensioni scroll area - lascia spazio per i controlli
	var container_height = main_container.size.y
	scroll_container.custom_minimum_size = Vector2(0, container_height - 100) # Spazio per pulsanti
	
	# Stile scrollbar
	scroll_container.add_theme_color_override("scroll_bar", ThemeManager.get_color("dim"))
	
	settings_display = VBoxContainer.new()
	settings_display.name = "SettingsDisplay"
	settings_display.add_theme_constant_override("separation", 20)
	
	# Margini interni ridotti per fare più spazio
	settings_display.add_theme_constant_override("margin_left", 30)
	settings_display.add_theme_constant_override("margin_right", 30)
	settings_display.add_theme_constant_override("margin_top", 15)
	settings_display.add_theme_constant_override("margin_bottom", 15)
	
	scroll_container.add_child(settings_display)
	main_container.add_child(scroll_container)

func create_settings_content():
	"""Crea il contenuto delle impostazioni"""
	# Sezione Audio
	create_audio_section()
	
	# Sezione Display
	create_visual_section()
	
	# Sezione Tema e Accessibilità
	create_theme_section()
	
	# Sezione Gioco
	create_game_section()

func create_audio_section():
	"""Crea la sezione impostazioni audio"""
	audio_section = VBoxContainer.new()
	audio_section.add_theme_constant_override("separation", 10)
	settings_display.add_child(audio_section)

	# Titolo sezione
	var audio_title = Label.new()
	audio_title.text = "AUDIO"
	audio_title.add_theme_font_size_override("font_size", 16)
	audio_title.add_theme_color_override("font_color", ThemeManager.get_color("primary"))
	audio_section.add_child(audio_title)

	# Checkbox audio
	audio_checkbox = CheckBox.new()
	audio_checkbox.text = "  Abilita Audio (Presto Disponibile)"
	audio_checkbox.disabled = true
	audio_checkbox.add_theme_color_override("font_color", ThemeManager.get_color("dim"))
	audio_section.add_child(audio_checkbox)

	# Volume slider
	var volume_container = HBoxContainer.new()
	audio_section.add_child(volume_container)

	volume_label = Label.new()
	volume_label.text = "  Volume Master: 80%"
	volume_label.custom_minimum_size = Vector2(200, 0)
	volume_label.add_theme_color_override("font_color", ThemeManager.get_color("dim"))
	volume_container.add_child(volume_label)

	volume_slider = HSlider.new()
	volume_slider.min_value = 0.0
	volume_slider.max_value = 1.0
	volume_slider.value = 0.8
	volume_slider.step = 0.1
	volume_slider.custom_minimum_size = Vector2(200, 20)
	volume_slider.editable = false
	volume_container.add_child(volume_slider)

func create_visual_section():
	"""Crea la sezione impostazioni visive"""
	visual_section = VBoxContainer.new()
	visual_section.add_theme_constant_override("separation", 10)
	settings_display.add_child(visual_section)

	# Titolo sezione
	var visual_title = Label.new()
	visual_title.text = "DISPLAY"
	visual_title.add_theme_font_size_override("font_size", 16)
	visual_title.add_theme_color_override("font_color", ThemeManager.get_color("primary"))
	visual_section.add_child(visual_title)

	# Fullscreen
	fullscreen_checkbox = CheckBox.new()
	fullscreen_checkbox.text = "  Schermo Intero"
	fullscreen_checkbox.add_theme_color_override("font_color", ThemeManager.get_color("text"))
	visual_section.add_child(fullscreen_checkbox)

	# VSync
	vsync_checkbox = CheckBox.new()
	vsync_checkbox.text = "  Sincronizzazione Verticale (VSync)"
	vsync_checkbox.add_theme_color_override("font_color", ThemeManager.get_color("text"))
	visual_section.add_child(vsync_checkbox)

func create_theme_section():
	"""Crea la sezione temi e accessibilità"""
	theme_section = VBoxContainer.new()
	theme_section.add_theme_constant_override("separation", 10)
	settings_display.add_child(theme_section)

	# Titolo sezione
	var theme_title = Label.new()
	theme_title.text = "TEMA E ACCESSIBILITÀ"
	theme_title.add_theme_font_size_override("font_size", 16)
	theme_title.add_theme_color_override("font_color", ThemeManager.get_color("primary"))
	theme_section.add_child(theme_title)

	# Crea gruppo per radio buttons
	theme_button_group = ButtonGroup.new()

	# Radio 1: Tema Default
	default_theme_radio = CheckBox.new()
	default_theme_radio.text = "  Tema Default (SafePlace Verde #4EA162)"
	default_theme_radio.button_group = theme_button_group
	default_theme_radio.button_pressed = true # Default selezionato
	default_theme_radio.add_theme_color_override("font_color", ThemeManager.get_color("text"))
	theme_section.add_child(default_theme_radio)

	# Descrizione tema default
	var default_desc = Label.new()
	default_desc.text = "    Colori basati su #4EA162 e gradazioni per un'esperienza equilibrata"
	default_desc.add_theme_font_size_override("font_size", 12)
	default_desc.add_theme_color_override("font_color", ThemeManager.get_color("dim"))
	theme_section.add_child(default_desc)

	# Spazio
	var spacer1 = Control.new()
	spacer1.custom_minimum_size = Vector2(0, 8)
	theme_section.add_child(spacer1)

	# Radio 2: Tema CRT
	crt_theme_radio = CheckBox.new()
	crt_theme_radio.text = "  Tema CRT Fosfori Verdi (Terminali Anni 80)"
	crt_theme_radio.button_group = theme_button_group
	crt_theme_radio.add_theme_color_override("font_color", ThemeManager.get_color("text"))
	theme_section.add_child(crt_theme_radio)

	# Descrizione tema CRT
	var crt_desc = Label.new()
	crt_desc.text = "    Solo verde #4EA162 con effetti overlay per autenticità retrò"
	crt_desc.add_theme_font_size_override("font_size", 12)
	crt_desc.add_theme_color_override("font_color", ThemeManager.get_color("dim"))
	theme_section.add_child(crt_desc)

	# Spazio
	var spacer2 = Control.new()
	spacer2.custom_minimum_size = Vector2(0, 8)
	theme_section.add_child(spacer2)

	# Radio 3: Alto Contrasto
	contrast_theme_radio = CheckBox.new()
	contrast_theme_radio.text = "  Alto Contrasto (Solo Bianco e Nero)"
	contrast_theme_radio.button_group = theme_button_group
	contrast_theme_radio.add_theme_color_override("font_color", ThemeManager.get_color("text"))
	theme_section.add_child(contrast_theme_radio)

	# Descrizione alto contrasto
	var contrast_desc = Label.new()
	contrast_desc.text = "    Per ipovedenti e daltonici - massima leggibilità"
	contrast_desc.add_theme_font_size_override("font_size", 12)
	contrast_desc.add_theme_color_override("font_color", ThemeManager.get_color("dim"))
	theme_section.add_child(contrast_desc)

func create_game_section():
	"""Crea la sezione impostazioni di gioco"""
	game_section = VBoxContainer.new()
	game_section.add_theme_constant_override("separation", 10)
	settings_display.add_child(game_section)

	# Titolo sezione
	var game_title = Label.new()
	game_title.text = "GIOCO"
	game_title.add_theme_font_size_override("font_size", 16)
	game_title.add_theme_color_override("font_color", ThemeManager.get_color("primary"))
	game_section.add_child(game_title)

	# Autosave
	autosave_checkbox = CheckBox.new()
	autosave_checkbox.text = "  Salvataggio Automatico ogni 5 minuti"
	autosave_checkbox.add_theme_color_override("font_color", ThemeManager.get_color("text"))
	game_section.add_child(autosave_checkbox)

	# Info modalità sviluppo
	var dev_info = Label.new()
	dev_info.text = "  Altre opzioni saranno aggiunte in futuro"
	dev_info.add_theme_font_size_override("font_size", 12)
	dev_info.add_theme_color_override("font_color", ThemeManager.get_color("dim"))
	game_section.add_child(dev_info)

func create_controls_panel():
	"""Crea il pannello controlli"""
	# Spazio sopra i controlli
	var spacer = Control.new()
	spacer.custom_minimum_size = Vector2(0, 30)
	main_container.add_child(spacer)

	# Container per pulsanti centrati
	controls_panel = HBoxContainer.new()
	controls_panel.name = "ControlsPanel"
	controls_panel.alignment = BoxContainer.ALIGNMENT_CENTER
	controls_panel.add_theme_constant_override("separation", 30)
	main_container.add_child(controls_panel)

	# Pulsante Applica
	apply_button = create_terminal_button("[ APPLICA ]")
	apply_button.pressed.connect(_on_apply_pressed)
	controls_panel.add_child(apply_button)

	# Pulsante Indietro
	back_button = create_terminal_button("[ TORNA INDIETRO ]")
	back_button.pressed.connect(_on_back_pressed)
	controls_panel.add_child(back_button)

func create_terminal_button(text: String) -> Button:
	"""Crea un pulsante in stile terminale"""
	var button = Button.new()
	button.text = text
	button.custom_minimum_size = Vector2(160, 35)

	# Stile normale
	var style_normal = StyleBoxFlat.new()
	style_normal.bg_color = ThemeManager.get_color("background")
	style_normal.border_color = ThemeManager.get_color("primary")
	style_normal.border_width_left = 2
	style_normal.border_width_right = 2
	style_normal.border_width_top = 2
	style_normal.border_width_bottom = 2

	# Stile hover - EFFETTO NEGATIVO: sfondo chiaro, testo scuro
	var style_hover = StyleBoxFlat.new()
	style_hover.bg_color = ThemeManager.get_color("primary")
	style_hover.border_color = ThemeManager.get_color("primary")
	style_hover.border_width_left = 2
	style_hover.border_width_right = 2
	style_hover.border_width_top = 2
	style_hover.border_width_bottom = 2

	button.add_theme_stylebox_override("normal", style_normal)
	button.add_theme_stylebox_override("hover", style_hover)
	button.add_theme_stylebox_override("pressed", style_hover)
	button.add_theme_color_override("font_color", ThemeManager.get_color("text"))
	button.add_theme_color_override("font_hover_color", ThemeManager.get_color("background"))  # TESTO SCURO SU SFONDO CHIARO
	button.add_theme_font_size_override("font_size", 14)

	return button

func setup_connections():
	"""Configura le connessioni dei segnali"""
	if fullscreen_checkbox:
		fullscreen_checkbox.toggled.connect(_on_setting_changed)
	if vsync_checkbox:
		vsync_checkbox.toggled.connect(_on_setting_changed)
	if autosave_checkbox:
		autosave_checkbox.toggled.connect(_on_setting_changed)
	
	# Connessioni temi con preview live
	if default_theme_radio:
		default_theme_radio.toggled.connect(_on_theme_changed.bind(ThemeManager.ThemeType.DEFAULT))
	if crt_theme_radio:
		crt_theme_radio.toggled.connect(_on_theme_changed.bind(ThemeManager.ThemeType.CRT_GREEN))
	if contrast_theme_radio:
		contrast_theme_radio.toggled.connect(_on_theme_changed.bind(ThemeManager.ThemeType.HIGH_CONTRAST))

func _connect_theme_signals():
	"""Connette ai segnali del ThemeManager per aggiornamenti automatici"""
	if ThemeManager.theme_changed.connect(_on_theme_changed_signal) == OK:
		print("🎨 SettingsScreen collegato ai segnali ThemeManager")
	else:
		print("⚠️ Errore collegamento segnali ThemeManager")

func _on_theme_changed_signal(theme_type):
	"""Callback quando il tema cambia - aggiorna interfaccia impostazioni"""
	print("🎨 SettingsScreen: Aggiornamento tema %s" % ThemeManager.ThemeType.keys()[theme_type])
	
	# Riapplica styling con i nuovi colori
	setup_terminal_ui()
	
	# Forza aggiornamento visivo
	queue_redraw()

func load_current_settings():
	"""Carica le impostazioni correnti"""
	# Carica impostazioni display
	fullscreen_checkbox.button_pressed = false # Default windowed
	vsync_checkbox.button_pressed = true # Default VSync on
	
	# Carica tema corrente dal ThemeManager
	var current_theme = ThemeManager.get_current_theme_type()
	match current_theme:
		ThemeManager.ThemeType.DEFAULT:
			default_theme_radio.button_pressed = true
		ThemeManager.ThemeType.CRT_GREEN:
			crt_theme_radio.button_pressed = true
		ThemeManager.ThemeType.HIGH_CONTRAST:
			contrast_theme_radio.button_pressed = true
	
	# Carica impostazioni gioco
	autosave_checkbox.button_pressed = true # Default autosave on
	
	# Impostazioni audio (disabilitate)
	audio_checkbox.button_pressed = false
	volume_slider.value = 0.8
	
	print("🎛️ Impostazioni caricate - Tema: %s" % ThemeManager.ThemeType.keys()[current_theme])

func _on_setting_changed(pressed: bool):
	"""Callback quando un'impostazione cambia"""
	settings_changed = true
	apply_button.text = "[ APPLICA * ]" # Indica modifiche non salvate

func _on_theme_changed(theme_type: ThemeManager.ThemeType, pressed: bool):
	"""Callback cambio tema con preview live"""
	if not pressed:
		return
	
	print("🎨 Preview tema: %s" % ThemeManager.ThemeType.keys()[theme_type])
	
	# Backup del tema corrente se è il primo cambio
	if not settings_changed:
		ThemeManager.backup_current_theme()
	
	# Applica tema per preview
	ThemeManager.set_theme(theme_type)
	
	# Segna come modificato
	settings_changed = true
	apply_button.text = "[ APPLICA * ]"

func _on_apply_pressed():
	"""Applica le impostazioni"""
	print("✅ Applicazione impostazioni...")
	
	# Applica fullscreen
	if fullscreen_checkbox.button_pressed:
		if get_window().mode != Window.MODE_FULLSCREEN:
			get_window().mode = Window.MODE_FULLSCREEN
			print("🖥️ Modalità schermo intero attivata")
	else:
		if get_window().mode == Window.MODE_FULLSCREEN:
			get_window().mode = Window.MODE_WINDOWED
			print("🖥️ Modalità finestra attivata")
	
	# Applica VSync
	DisplayServer.window_set_vsync_mode(
		DisplayServer.VSYNC_ENABLED if vsync_checkbox.button_pressed else DisplayServer.VSYNC_DISABLED
	)
	print("🔄 VSync: ", "Abilitato" if vsync_checkbox.button_pressed else "Disabilitato")
	
	# Applica tema selezionato permanentemente
	var selected_theme = get_selected_theme()
	ThemeManager.set_theme(selected_theme)
	ThemeManager.save_theme_settings()
	print("🎨 Tema applicato: %s" % ThemeManager.ThemeType.keys()[selected_theme])
	
	# Salva impostazioni
	save_settings_to_file()
	
	settings_changed = false
	apply_button.text = "[ APPLICA ]"
	print("✅ Impostazioni applicate con successo")

func save_settings_to_file():
	"""Salva le impostazioni su file"""
	var config = ConfigFile.new()
	
	# Sezione Display
	config.set_value("display", "fullscreen", fullscreen_checkbox.button_pressed)
	config.set_value("display", "vsync", vsync_checkbox.button_pressed)
	
	# Sezione Tema
	config.set_value("theme", "current_type", get_selected_theme())
	
	# Sezione Game
	config.set_value("game", "autosave", autosave_checkbox.button_pressed)
	
	# Sezione Audio (placeholder)
	config.set_value("audio", "enabled", audio_checkbox.button_pressed)
	config.set_value("audio", "volume", volume_slider.value)
	
	# Salva file
	config.save("user://settings.cfg")
	print("💾 Impostazioni salvate in user://settings.cfg")

func get_selected_theme() -> ThemeManager.ThemeType:
	"""Ritorna il tema attualmente selezionato"""
	if default_theme_radio.button_pressed:
		return ThemeManager.ThemeType.DEFAULT
	elif crt_theme_radio.button_pressed:
		return ThemeManager.ThemeType.CRT_GREEN
	elif contrast_theme_radio.button_pressed:
		return ThemeManager.ThemeType.HIGH_CONTRAST
	else:
		return ThemeManager.ThemeType.DEFAULT # Fallback

func _on_back_pressed():
	"""Torna al menu principale"""
	if settings_changed:
		print("⚠️ Modifiche non applicate verranno perse")
		# Ripristina tema originale se non applicato
		ThemeManager.restore_theme_backup()
		# Ricarica impostazioni
		load_current_settings()
		settings_changed = false
	
	if on_back_pressed.is_valid():
		on_back_pressed.call()

func initialize_and_start(back_callback: Callable):
	"""Inizializza e avvia la schermata impostazioni"""
	on_back_pressed = back_callback
	
	# Carica impostazioni tema dal ThemeManager
	ThemeManager.load_theme_settings()
	
	print("🎛️ Schermata impostazioni inizializzata")

# 🎮 GESTIONE INPUT
func _unhandled_input(event: InputEvent):
	"""Gestisce input da tastiera"""
	if event is InputEventKey and event.pressed:
		match event.keycode:
			KEY_ESCAPE:
				_on_back_pressed()

# 🧹 CLEANUP
func _exit_tree():
	"""Pulizia risorse"""
	print("🧹 SettingsScreen: Cleanup completato") 
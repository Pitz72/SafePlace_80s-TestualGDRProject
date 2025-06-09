extends Control
class_name SettingsScreen

# 🎛️ SETTINGS SCREEN AVANZATA SAFEPLACE
# Impostazioni Audio + 3 Modalità Visive con preview live

# 🎨 STILE COMPONENTI
const PRIMARY_GREEN = Color("#4EA162") # Verde SafePlace autentico
const SECONDARY_GREEN = Color("#2D5E3F") # Verde secondario
const BACKGROUND_BLACK = Color("#000000") # Nero profondo
const DIM_GREEN = Color("#001A0D") # Verde molto scuro
const BRIGHT_GREEN = Color("#00FF41") # Verde brillante
const DISABLED_GRAY = Color("#404040") # Grigio per elementi disabilitati

# 📐 LAYOUT CONFIGURATION
const SETTINGS_WIDTH = 700
const SETTINGS_HEIGHT = 500
const SECTION_SPACING = 30
const COMPONENT_SPACING = 15

# 🎭 COMPONENTI UI
@onready var main_container: VBoxContainer
@onready var title_label: Label
@onready var content_scroll: ScrollContainer
@onready var settings_content: VBoxContainer

# Sezione Audio
@onready var audio_section: VBoxContainer
@onready var audio_title: Label
@onready var audio_placeholder: Label
@onready var audio_checkbox: CheckBox
@onready var volume_slider: HSlider
@onready var volume_label: Label

# Sezione Impostazioni Visive
@onready var visual_section: VBoxContainer
@onready var visual_title: Label
@onready var standard_option: VBoxContainer
@onready var standard_radio: CheckBox
@onready var standard_desc: Label
@onready var crt_option: VBoxContainer
@onready var crt_radio: CheckBox
@onready var crt_desc: Label
@onready var contrast_option: VBoxContainer
@onready var contrast_radio: CheckBox
@onready var contrast_desc: Label

# Controlli
@onready var controls_panel: HBoxContainer
@onready var apply_button: Button
@onready var restore_button: Button
@onready var back_button: Button

# 🔧 STATO INTERNO
var theme_manager
var radio_buttons: Array[CheckBox] = []
var preview_mode: ThemeManager.VisualMode
var backup_created: bool = false

# 🔗 CALLBACK
var on_back_pressed: Callable

# 🚀 INIZIALIZZAZIONE
func _ready():
	setup_theme_manager()
	setup_ui_structure()
	setup_styling()
	setup_connections()
	load_current_settings()

func setup_theme_manager():
	"""Inizializza riferimento al ThemeManager"""
	print("🔗 Collegamento al singleton ThemeManager...")

	# Usa il singleton autoload direttamente
	theme_manager = ThemeManager

	if theme_manager:
		print("✅ Singleton ThemeManager collegato - Modalità corrente: %s" % ThemeManager.VisualMode.keys()[theme_manager.current_visual_mode])
	else:
		print("❌ ERRORE: ThemeManager singleton non disponibile!")

func setup_ui_structure():
	"""Crea la struttura UI delle impostazioni"""
	# Sfondo completo
	set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)

	# Container principale centrato
	main_container = VBoxContainer.new()
	main_container.name = "MainContainer"

	# Calcola posizione centrata
	var screen_size = get_viewport().get_visible_rect().size
	var offset_x = int((screen_size.x - SETTINGS_WIDTH) / 2)
	var offset_y = int((screen_size.y - SETTINGS_HEIGHT) / 2)

	main_container.position = Vector2(offset_x, offset_y)
	main_container.size = Vector2(SETTINGS_WIDTH, SETTINGS_HEIGHT)

	add_child(main_container)

	# Titolo principale
	title_label = Label.new()
	title_label.text = "🎛️ IMPOSTAZIONI SAFEPLACE"
	title_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	title_label.add_theme_font_size_override("font_size", 24)
	main_container.add_child(title_label)

	# Separatore decorativo
	var separator = Label.new()
	separator.text = "═══════════════════════════════════════════════════════════════"
	separator.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	separator.add_theme_font_size_override("font_size", 12)
	main_container.add_child(separator)

	# Spazio
	var spacer = Control.new()
	spacer.custom_minimum_size = Vector2(0, 20)
	main_container.add_child(spacer)

	# Container scroll per contenuto
	content_scroll = ScrollContainer.new()
	content_scroll.custom_minimum_size = Vector2(SETTINGS_WIDTH - 40, SETTINGS_HEIGHT - 140)
	main_container.add_child(content_scroll)

	# Container contenuto impostazioni
	settings_content = VBoxContainer.new()
	settings_content.add_theme_constant_override("separation", SECTION_SPACING)
	content_scroll.add_child(settings_content)

	# Crea sezioni
	create_audio_section()
	create_visual_section()
	create_controls_section()

func create_audio_section():
	"""Crea la sezione impostazioni audio"""
	audio_section = VBoxContainer.new()
	audio_section.add_theme_constant_override("separation", COMPONENT_SPACING)
	settings_content.add_child(audio_section)

	# Titolo sezione
	audio_title = Label.new()
	audio_title.text = "🔊 AUDIO"
	audio_title.add_theme_font_size_override("font_size", 18)
	audio_section.add_child(audio_title)

	# Contenuto audio (tutto disabilitato per ora)
	var audio_content = VBoxContainer.new()
	audio_content.add_theme_constant_override("separation", 10)
	audio_section.add_child(audio_content)

	# Checkbox attivazione audio
	audio_checkbox = CheckBox.new()
	audio_checkbox.text = "Attiva Audio"
	audio_checkbox.disabled = true
	audio_content.add_child(audio_checkbox)

	# Slider volume
	var volume_container = HBoxContainer.new()
	audio_content.add_child(volume_container)

	volume_label = Label.new()
	volume_label.text = "Volume: 80%"
	volume_label.custom_minimum_size = Vector2(100, 0)
	volume_container.add_child(volume_label)

	volume_slider = HSlider.new()
	volume_slider.min_value = 0.0
	volume_slider.max_value = 1.0
	volume_slider.value = 0.8
	volume_slider.step = 0.1
	volume_slider.custom_minimum_size = Vector2(200, 20)
	volume_slider.editable = false
	volume_container.add_child(volume_slider)

	# Placeholder notice
	audio_placeholder = Label.new()
	audio_placeholder.text = "⚠️  PRESTO DISPONIBILE"
	audio_placeholder.add_theme_font_size_override("font_size", 14)
	audio_content.add_child(audio_placeholder)

func create_visual_section():
	"""Crea la sezione impostazioni visive"""
	visual_section = VBoxContainer.new()
	visual_section.add_theme_constant_override("separation", COMPONENT_SPACING)
	settings_content.add_child(visual_section)

	# Titolo sezione
	visual_title = Label.new()
	visual_title.text = "🎨 IMPOSTAZIONI VISIVE"
	visual_title.add_theme_font_size_override("font_size", 18)
	visual_section.add_child(visual_title)

	# Opzioni modalità visive
	create_visual_option(
		ThemeManager.VisualMode.STANDARD,
		"Visualizzazione Standard",
		"Il gioco nella sua forma originale con colori SafePlace autentici"
	)

	create_visual_option(
		ThemeManager.VisualMode.CRT_PET,
		"Modalità CRT PET",
		"Simula monitor a fosfori verdi vintage con effetto retrò"
	)

	create_visual_option(
		ThemeManager.VisualMode.HIGH_CONTRAST,
		"Alto Contrasto",
		"Solo bianco e nero per massima leggibilità e accessibilità"
	)

func create_visual_option(mode: ThemeManager.VisualMode, title: String, description: String):
	"""Crea un'opzione per modalità visiva"""
	var option_container = VBoxContainer.new()
	option_container.add_theme_constant_override("separation", 5)
	visual_section.add_child(option_container)

	# Radio button + titolo
	var radio_container = HBoxContainer.new()
	option_container.add_child(radio_container)

	var radio = CheckBox.new()
	radio.text = title
	radio.button_group = ButtonGroup.new() if radio_buttons.is_empty() else radio_buttons[0].button_group
	radio.add_theme_font_size_override("font_size", 16)
	radio_container.add_child(radio)

	# Descrizione
	var desc = Label.new()
	desc.text = "   " + description # Indentazione
	desc.add_theme_font_size_override("font_size", 12)
	desc.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	option_container.add_child(desc)

	# Spazio tra opzioni
	var spacer = Control.new()
	spacer.custom_minimum_size = Vector2(0, 10)
	option_container.add_child(spacer)

	# Collega segnale per preview live
	radio.toggled.connect(_on_visual_mode_changed.bind(mode))

	# Salva riferimenti
	radio_buttons.append(radio)
	match mode:
		ThemeManager.VisualMode.STANDARD:
			standard_radio = radio
			standard_desc = desc
		ThemeManager.VisualMode.CRT_PET:
			crt_radio = radio
			crt_desc = desc
		ThemeManager.VisualMode.HIGH_CONTRAST:
			contrast_radio = radio
			contrast_desc = desc

func create_controls_section():
	"""Crea la sezione controlli"""
	# Spazio prima dei controlli
	var spacer = Control.new()
	spacer.custom_minimum_size = Vector2(0, 20)
	main_container.add_child(spacer)

	# Controlli
	controls_panel = HBoxContainer.new()
	controls_panel.alignment = BoxContainer.ALIGNMENT_CENTER
	controls_panel.add_theme_constant_override("separation", 20)
	main_container.add_child(controls_panel)

	# Pulsante Applica
	apply_button = create_settings_button("[ APPLICA ]")
	apply_button.pressed.connect(_on_apply_pressed)
	controls_panel.add_child(apply_button)

	# Pulsante Ripristina
	restore_button = create_settings_button("[ RIPRISTINA ]")
	restore_button.pressed.connect(_on_restore_pressed)
	controls_panel.add_child(restore_button)

	# Pulsante Indietro
	back_button = create_settings_button("[ TORNA INDIETRO ]")
	back_button.pressed.connect(_on_back_pressed)
	controls_panel.add_child(back_button)

func create_settings_button(text: String) -> Button:
	"""Crea un pulsante per le impostazioni"""
	var button = Button.new()
	button.text = text
	button.custom_minimum_size = Vector2(150, 35)

	# Stile normale
	var style_normal = StyleBoxFlat.new()
	style_normal.bg_color = BACKGROUND_BLACK
	style_normal.border_color = SECONDARY_GREEN
	style_normal.border_width_left = 2
	style_normal.border_width_right = 2
	style_normal.border_width_top = 2
	style_normal.border_width_bottom = 2

	# Stile hover
	var style_hover = StyleBoxFlat.new()
	style_hover.bg_color = DIM_GREEN
	style_hover.border_color = PRIMARY_GREEN
	style_hover.border_width_left = 2
	style_hover.border_width_right = 2
	style_hover.border_width_top = 2
	style_hover.border_width_bottom = 2

	button.add_theme_stylebox_override("normal", style_normal)
	button.add_theme_stylebox_override("hover", style_hover)
	button.add_theme_stylebox_override("pressed", style_hover)
	button.add_theme_color_override("font_color", PRIMARY_GREEN)
	button.add_theme_color_override("font_hover_color", BRIGHT_GREEN)
	button.add_theme_font_size_override("font_size", 14)

	return button

func setup_styling():
	"""Applica styling SafePlace"""
	# Sfondo principale
	var bg_style = StyleBoxFlat.new()
	bg_style.bg_color = BACKGROUND_BLACK
	add_theme_stylebox_override("panel", bg_style)

	# Bordo container principale
	var container_style = StyleBoxFlat.new()
	container_style.bg_color = BACKGROUND_BLACK
	container_style.border_color = PRIMARY_GREEN
	container_style.border_width_left = 2
	container_style.border_width_right = 2
	container_style.border_width_top = 2
	container_style.border_width_bottom = 2
	main_container.add_theme_stylebox_override("panel", container_style)

	# Colori testi
	title_label.add_theme_color_override("font_color", BRIGHT_GREEN)
	visual_title.add_theme_color_override("font_color", PRIMARY_GREEN)
	audio_title.add_theme_color_override("font_color", PRIMARY_GREEN)

	# Stile componenti audio disabilitati
	audio_checkbox.add_theme_color_override("font_color", DISABLED_GRAY)
	volume_label.add_theme_color_override("font_color", DISABLED_GRAY)
	audio_placeholder.add_theme_color_override("font_color", DISABLED_GRAY)

	# Stile radio buttons
	for radio in radio_buttons:
		radio.add_theme_color_override("font_color", PRIMARY_GREEN)

	# Stile descrizioni
	if standard_desc:
		standard_desc.add_theme_color_override("font_color", SECONDARY_GREEN)
	if crt_desc:
		crt_desc.add_theme_color_override("font_color", SECONDARY_GREEN)
	if contrast_desc:
		contrast_desc.add_theme_color_override("font_color", SECONDARY_GREEN)

func setup_connections():
	"""Configura connessioni signals"""
	volume_slider.value_changed.connect(_on_volume_changed)

func load_current_settings():
	"""Carica le impostazioni correnti dal ThemeManager"""
	if not theme_manager:
		print("❌ ThemeManager non disponibile per caricamento impostazioni")
		return

	# Impostazioni audio
	audio_checkbox.button_pressed = theme_manager.audio_enabled
	volume_slider.value = theme_manager.master_volume

	# Modalità visiva corrente
	var current_mode = theme_manager.current_visual_mode
	match current_mode:
		ThemeManager.VisualMode.STANDARD:
			standard_radio.button_pressed = true
		ThemeManager.VisualMode.CRT_PET:
			crt_radio.button_pressed = true
		ThemeManager.VisualMode.HIGH_CONTRAST:
			contrast_radio.button_pressed = true

	print("🎛️ Impostazioni caricate: Tema %s" % ThemeManager.VisualMode.keys()[current_mode])

# 🎮 CALLBACKS
func _on_visual_mode_changed(pressed: bool, mode: ThemeManager.VisualMode):
	"""Callback cambio modalità visiva - Preview live"""
	if not pressed:
		return

	print("🎨 Cambio modalità richiesto: %s (pressed: %s)" % [ThemeManager.VisualMode.keys()[mode], pressed])

	if not theme_manager:
		print("❌ ERRORE: ThemeManager non disponibile per cambio tema!")
		return

	if not backup_created:
		theme_manager.backup_current_theme()
		backup_created = true
		print("💾 Backup tema creato per preview")

	preview_mode = mode
	print("👁️ Applicazione preview tema: %s" % ThemeManager.VisualMode.keys()[mode])
	theme_manager.apply_visual_theme(mode)
	print("✅ Preview completato")

func _on_volume_changed(value: float):
	"""Callback cambio volume"""
	_update_volume_label(value)

func _update_volume_label(value: float):
	"""Aggiorna label volume"""
	volume_label.text = "Volume: %d%%" % int(value * 100)

func _on_apply_pressed():
	"""Applica le impostazioni permanentemente"""
	if not theme_manager:
		return

	# Applica tema finale
	theme_manager.apply_visual_theme(preview_mode)

	# Applica impostazioni audio (placeholder)
	theme_manager.set_audio_enabled(audio_checkbox.button_pressed)
	theme_manager.set_master_volume(volume_slider.value)

	backup_created = false
	print("✅ Impostazioni applicate permanentemente")

func _on_restore_pressed():
	"""Ripristina impostazioni precedenti"""
	if backup_created and theme_manager:
		theme_manager.restore_theme_backup()
		load_current_settings() # Ricarica UI
		backup_created = false
		print("🔄 Impostazioni ripristinate")
	else:
		print("⚠️ Nessun backup da ripristinare")

func _on_back_pressed():
	"""Torna al menu principale"""
	if backup_created and theme_manager:
		# Ripristina automaticamente se ci sono modifiche non applicate
		theme_manager.restore_theme_backup()
		backup_created = false
		print("🔄 Modifiche non applicate ripristinate")

	if on_back_pressed.is_valid():
		on_back_pressed.call()

# 🔧 API PUBBLICA
func initialize_and_start(back_callback: Callable):
	"""Inizializza la schermata impostazioni"""
	on_back_pressed = back_callback
	show()
	print("🎛️ Schermata impostazioni inizializzata")

extends Control
class_name MenuManager

# 🎮 MENU MANAGER SAFEPLACE
# Gestione completa schermata menu iniziale con autenticità SafePlace
# Integrazione sicura con sistemi esistenti del gioco

# 🎨 COSTANTI DESIGN SAFEPLACE - COLORI AUTENTICI MAPPA
const PRIMARY_GREEN = Color(0.306, 0.631, 0.384) # #4EA162 - Verde standard mappa
const SECONDARY_GREEN = Color(0.2, 0.5, 0.3) # Verde scuro per bordi
const DARK_GREEN = Color(0.1, 0.3, 0.15) # Verde molto scuro per sfondo elementi
const BACKGROUND_BLACK = Color(0.02, 0.02, 0.02) # #050505 - Nero
const HIGHLIGHT_YELLOW = Color(1, 1, 0.4) # #ffff66 - Evidenziazione

# 📐 LAYOUT CONFIGURATION
const MENU_MAX_WIDTH = 600 # Ridotto per non riempire tutto lo schermo
const MENU_PADDING = 80 # Aumentato per più spazio nei margini
const BUTTON_HEIGHT = 40 # Altezza ridotta per risparmiare spazio
const BUTTON_WIDTH = 320 # Larghezza fissa standard per tutti i pulsanti
const BUTTON_SPACING = 12 # Spaziatura tra pulsanti
const IMAGE_MAX_HEIGHT = 162 # Ridotto 10% (era 180)
const MENU_TOP_MARGIN = 40 # Margine superiore ridotto (era 60)
const MENU_BOTTOM_MARGIN = 40 # Margine inferiore ridotto (era 60)

# 🏷️ VERSIONE GIOCO
const GAME_VERSION = "v1.1.0-ULTIMO-IS-ON-THE-ROAD-AGAIN"
const VERSION_DESCRIPTION = "Versione: Ultimo's Journey - Ultimate Edition"

# 🎭 COMPONENTI UI
@onready var main_container: VBoxContainer
@onready var image_header: TextureRect
@onready var title_label: Label
@onready var subtitle_label: Label
@onready var menu_buttons_container: VBoxContainer
@onready var footer_label: Label

# Pulsanti menu
@onready var new_game_button: Button
@onready var load_game_button: Button
@onready var story_button: Button
@onready var instructions_button: Button
@onready var settings_button: Button

# Schermate secondarie
@onready var story_screen: Control
@onready var instructions_screen: Control
@onready var settings_screen: Control

# 🔧 SISTEMI
var transitions: MenuTransitions
var content_manager: ContentManager
var game_manager: GameManager

# 📊 STATI
enum MenuState {MAIN, STORY, INSTRUCTIONS, SETTINGS, TRANSITIONING}
var current_state: MenuState = MenuState.MAIN
var is_initialized: bool = false

# 🚀 INIZIALIZZAZIONE
func _ready():
	print("🎮 MenuManager: Inizializzazione sistema menu SafePlace...")

	setup_systems()
	setup_ui_structure()
	setup_styling()
	setup_connections()

	# Avvia sequenza intro dopo setup completo
	call_deferred("start_intro_sequence")

func setup_systems():
	"""Inizializza i sistemi di supporto"""
	# Sistema transizioni
	transitions = MenuTransitions.new()
	add_child(transitions)
	transitions.setup_target(self)

	# Content manager per testi autentici
	content_manager = ContentManager.new()
	add_child(content_manager)

	# Riferimento al GameManager esistente (safe)
	game_manager = get_node_or_null("/root/GameManager")
	if not game_manager:
		push_warning("⚠️ GameManager non trovato, alcune funzioni potrebbero essere limitate")

	print("✅ Sistemi di supporto inizializzati")

func setup_ui_structure():
	"""Crea la struttura UI del menu"""
	# Container principale con margini
	main_container = VBoxContainer.new()
	main_container.name = "MainContainer"
	main_container.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	main_container.add_theme_constant_override("separation", 15)
	add_child(main_container)

	# Margine superiore
	var top_spacer = Control.new()
	top_spacer.custom_minimum_size = Vector2(0, MENU_TOP_MARGIN)
	main_container.add_child(top_spacer)

	# Container centrato per il contenuto
	var centered_container = VBoxContainer.new()
	centered_container.name = "CenteredContainer"
	centered_container.alignment = BoxContainer.ALIGNMENT_CENTER
	centered_container.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	centered_container.add_theme_constant_override("separation", 10)
	main_container.add_child(centered_container)

	# Immagine header
	image_header = TextureRect.new()
	image_header.name = "ImageHeader"
	image_header.expand_mode = TextureRect.EXPAND_FIT_WIDTH_PROPORTIONAL
	image_header.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	centered_container.add_child(image_header)

	# Carica immagine SafePlace
	load_header_image()

	# Titolo principale
	title_label = Label.new()
	title_label.name = "TitleLabel"
	title_label.text = ""
	title_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	centered_container.add_child(title_label)

	# Sottotitolo
	subtitle_label = Label.new()
	subtitle_label.name = "SubtitleLabel"
	subtitle_label.text = "un gioco di Simone Pizzi"
	subtitle_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	centered_container.add_child(subtitle_label)

	# Container pulsanti menu
	menu_buttons_container = VBoxContainer.new()
	menu_buttons_container.name = "MenuButtonsContainer"
	menu_buttons_container.alignment = BoxContainer.ALIGNMENT_CENTER
	menu_buttons_container.add_theme_constant_override("separation", BUTTON_SPACING)
	centered_container.add_child(menu_buttons_container)

	# Crea i 5 pulsanti menu
	create_menu_buttons()

	# Footer informazioni
	footer_label = Label.new()
	footer_label.name = "FooterLabel"
	footer_label.text = "GDR testuale retrocomputazionale - sperimentazione cooperazione umano-LLM tramite Cursor"
	footer_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	footer_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	centered_container.add_child(footer_label)

	# Margine inferiore
	var bottom_spacer = Control.new()
	bottom_spacer.custom_minimum_size = Vector2(0, MENU_BOTTOM_MARGIN)
	main_container.add_child(bottom_spacer)

	print("✅ Struttura UI creata")

func load_header_image():
	"""Carica l'immagine header con fallback sicuro"""
	var image_path = "res://image/thesafeplace_immagine.jpg"
	var texture = load(image_path) as Texture2D

	if texture:
		image_header.texture = texture
		image_header.custom_minimum_size = Vector2(0, IMAGE_MAX_HEIGHT)
		print("✅ Immagine header caricata: ", image_path)
	else:
		push_warning("⚠️ Immagine header non trovata, creazione placeholder...")
		create_placeholder_image()

func create_placeholder_image():
	"""Crea un'immagine placeholder se quella originale non è disponibile"""
	var placeholder = ImageTexture.new()
	var image = Image.create(400, 200, false, Image.FORMAT_RGB8)
	image.fill(DARK_GREEN)
	placeholder.set_image(image)
	image_header.texture = placeholder
	image_header.custom_minimum_size = Vector2(400, 200)

	print("📷 Placeholder immagine creato")

func create_menu_buttons():
	"""Crea i 5 pulsanti del menu principale"""
	var button_data = [
		["new_game_button", "Nuova Partita", "_on_new_game_pressed"],
		["load_game_button", "Carica Partita", "_on_load_game_pressed"],
		["story_button", "Storia", "_on_story_pressed"],
		["instructions_button", "Istruzioni", "_on_instructions_pressed"],
		["settings_button", "Impostazioni", "_on_settings_pressed"]
	]

	for data in button_data:
		var button = Button.new()
		button.name = data[0]
		button.text = data[1]
		button.custom_minimum_size = Vector2(BUTTON_WIDTH, BUTTON_HEIGHT)
		button.size_flags_horizontal = Control.SIZE_SHRINK_CENTER
		
		menu_buttons_container.add_child(button)
		
		# Assegna riferimento
		match data[0]:
			"new_game_button":
				new_game_button = button
			"load_game_button":
				load_game_button = button
			"story_button":
				story_button = button
			"instructions_button":
				instructions_button = button
			"settings_button":
				settings_button = button

	print("✅ 5 pulsanti menu creati")

func setup_styling():
	"""Applica lo styling SafePlace a tutti gli elementi"""
	# Stile titolo principale
	if title_label:
		title_label.add_theme_color_override("font_color", PRIMARY_GREEN)
		title_label.add_theme_font_size_override("font_size", 28)

	# Stile sottotitolo
	if subtitle_label:
		subtitle_label.add_theme_color_override("font_color", SECONDARY_GREEN)
		subtitle_label.add_theme_font_size_override("font_size", 16)

	# Stile footer
	if footer_label:
		footer_label.add_theme_color_override("font_color", SECONDARY_GREEN)
		footer_label.add_theme_font_size_override("font_size", 12)

	# Stile pulsanti
	var buttons = [new_game_button, load_game_button, story_button, instructions_button, settings_button]
	for button in buttons:
		if button:
			apply_button_style(button)

	print("✅ Styling applicato")

func apply_button_style(button: Button):
	"""Applica lo stile SafePlace a un pulsante"""
	# Colori
	button.add_theme_color_override("font_color", PRIMARY_GREEN)
	button.add_theme_color_override("font_hover_color", HIGHLIGHT_YELLOW)
	button.add_theme_color_override("font_pressed_color", PRIMARY_GREEN)
	
	# Dimensioni font
	button.add_theme_font_size_override("font_size", 16)

func setup_connections():
	"""Connette i segnali dei pulsanti"""
	if new_game_button:
		new_game_button.pressed.connect(_on_new_game_pressed)
	if load_game_button:
		load_game_button.pressed.connect(_on_load_game_pressed)
	if story_button:
		story_button.pressed.connect(_on_story_pressed)
	if instructions_button:
		instructions_button.pressed.connect(_on_instructions_pressed)
	if settings_button:
		settings_button.pressed.connect(_on_settings_pressed)

	print("✅ Connessioni segnali configurate")

func start_intro_sequence():
	"""Avvia la sequenza di introduzione animata"""
	if transitions:
		transitions.start_intro_sequence()
		is_initialized = true
		print("🎬 Sequenza intro avviata")

# 🎮 GESTORI EVENTI PULSANTI
func _on_new_game_pressed():
	"""Avvia una nuova partita"""
	print("🎮 Avvio nuova partita...")
	if current_state != MenuState.TRANSITIONING:
		start_game_transition()

func _on_load_game_pressed():
	"""Carica una partita salvata"""
	print("💾 Caricamento partita...")
	# TODO: Implementare sistema caricamento

func _on_story_pressed():
	"""Mostra la schermata Storia"""
	print("📖 Apertura schermata Storia...")
	if current_state == MenuState.MAIN:
		show_story_screen()

func _on_instructions_pressed():
	"""Mostra la schermata Istruzioni"""
	print("📋 Apertura schermata Istruzioni...")
	if current_state == MenuState.MAIN:
		show_instructions_screen()

func _on_settings_pressed():
	"""Mostra la schermata Impostazioni"""
	print("⚙️ Apertura schermata Impostazioni...")
	if current_state == MenuState.MAIN:
		show_settings_screen()

# 🎬 TRANSIZIONI SCHERMATE
func start_game_transition():
	"""Avvia la transizione verso il gioco"""
	current_state = MenuState.TRANSITIONING
	
	if transitions:
		transitions.start_shutdown_sequence()
		# Connetti al completamento
		if not transitions.shutdown_completed.is_connected(_on_shutdown_completed):
			transitions.shutdown_completed.connect(_on_shutdown_completed)
	else:
		# Fallback diretto
		_on_shutdown_completed()

func _on_shutdown_completed():
	"""Chiamato quando l'animazione di spegnimento è completata"""
	print("✅ Animazione spegnimento completata, avvio gioco...")
	
	# Nasconde menu
	visible = false
	
	# Avvia il gioco tramite GameManager
	if game_manager and game_manager.has_method("start_new_game"):
		game_manager.start_new_game()
	else:
		push_error("❌ GameManager o metodo start_new_game non disponibile")

func show_story_screen():
	"""Mostra la schermata Storia"""
	current_state = MenuState.STORY
	# TODO: Implementare schermata storia

func show_instructions_screen():
	"""Mostra la schermata Istruzioni"""
	current_state = MenuState.INSTRUCTIONS
	# TODO: Implementare schermata istruzioni

func show_settings_screen():
	"""Mostra la schermata Impostazioni"""
	current_state = MenuState.SETTINGS
	# TODO: Implementare schermata impostazioni

func return_to_main_menu():
	"""Ritorna al menu principale"""
	current_state = MenuState.MAIN
	print("🏠 Ritorno al menu principale")

# 🔄 GESTIONE STATI
func get_current_state() -> MenuState:
	"""Ritorna lo stato corrente del menu"""
	return current_state

func is_menu_active() -> bool:
	"""Controlla se il menu è attivo"""
	return visible and current_state != MenuState.TRANSITIONING

# 🎨 UTILITÀ PUBBLICHE
func show_menu():
	"""Mostra il menu (da chiamare esternamente)"""
	visible = true
	current_state = MenuState.MAIN
	if transitions and is_initialized:
		transitions.start_intro_sequence()

func hide_menu():
	"""Nasconde il menu (da chiamare esternamente)"""
	visible = false
	current_state = MenuState.MAIN 
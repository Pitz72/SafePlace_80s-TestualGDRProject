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
	main_container.add_theme_constant_override("separation", 15) # Ridotto da 20 a 15
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
	centered_container.add_theme_constant_override("separation", 10) # Spaziatura compatta
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
	title_label.text = "" # Sarà popolato dall'effetto typewriter
	title_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	centered_container.add_child(title_label)

	# Sottotitolo
	subtitle_label = Label.new()
	subtitle_label.name = "SubtitleLabel"
	subtitle_label.text = "un gioco di Simone Pizzi"
	subtitle_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	centered_container.add_child(subtitle_label)

		# Versione rimossa per risparmiare spazio

	# Container pulsanti menu
	menu_buttons_container = VBoxContainer.new()
	menu_buttons_container.name = "MenuButtonsContainer"
	menu_buttons_container.alignment = BoxContainer.ALIGNMENT_CENTER
	menu_buttons_container.add_theme_constant_override("separation", BUTTON_SPACING)
	centered_container.add_child(menu_buttons_container)

	# Crea i 5 pulsanti menu
	create_menu_buttons()

	# Footer informazioni (riassunto in una riga)
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
		# Imposta dimensioni massime
		image_header.custom_minimum_size = Vector2(0, IMAGE_MAX_HEIGHT)
		print("✅ Immagine header caricata: ", image_path)
	else:
		push_warning("⚠️ Immagine header non trovata, creazione placeholder...")
		create_placeholder_image()

func create_placeholder_image():
	"""Crea un'immagine placeholder se quella originale non è disponibile"""
	# Crea una texture semplice verde SafePlace come fallback
	var placeholder = ImageTexture.new()
	var image = Image.create(400, 200, false, Image.FORMAT_RGB8)
	image.fill(DARK_GREEN)
	placeholder.set_image(image)
	image_header.texture = placeholder
	image_header.custom_minimum_size = Vector2(400, 200)

	print("📷 Placeholder immagine creato")

func create_menu_buttons():
	"""Crea i 5 pulsanti del menu principale"""
	# Dati pulsanti: [nome, testo, metodo_callback]
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
		# Imposta dimensione fissa (non solo minima) per consistenza
		button.size_flags_horizontal = Control.SIZE_SHRINK_CENTER
		button.size_flags_vertical = Control.SIZE_SHRINK_CENTER

		# Connetti il segnale
		if has_method(data[2]):
			button.pressed.connect(Callable(self, data[2]))

		menu_buttons_container.add_child(button)

		# Salva riferimenti per facile accesso
		match data[0]:
			"new_game_button": new_game_button = button
			"load_game_button": load_game_button = button
			"story_button": story_button = button
			"instructions_button": instructions_button = button
			"settings_button": settings_button = button

	print("✅ Pulsanti menu creati (5/5)")

func setup_styling():
	"""Applica lo styling SafePlace a tutti i componenti"""
	# Sfondo principale
	var style_bg = StyleBoxFlat.new()
	style_bg.bg_color = BACKGROUND_BLACK
	add_theme_stylebox_override("panel", style_bg)

	# Styling titolo principale (ridotto 15%)
	title_label.add_theme_font_size_override("font_size", 41)
	title_label.add_theme_color_override("font_color", PRIMARY_GREEN)

		# Styling sottotitolo
	subtitle_label.add_theme_font_size_override("font_size", 18)
	subtitle_label.add_theme_color_override("font_color", SECONDARY_GREEN)

	# Styling footer (molto piccolo)
	footer_label.add_theme_font_size_override("font_size", 9)
	footer_label.add_theme_color_override("font_color", DARK_GREEN)

	# Styling pulsanti
	style_menu_buttons()

	print("✅ Styling SafePlace applicato")

func style_menu_buttons():
	"""Applica lo styling specifico ai pulsanti menu"""
	var buttons = [new_game_button, load_game_button, story_button, instructions_button, settings_button]

	for button in buttons:
		if not button:
			continue

		# Stile normale
		var style_normal = StyleBoxFlat.new()
		style_normal.bg_color = BACKGROUND_BLACK
		style_normal.border_color = SECONDARY_GREEN
		style_normal.border_width_top = 2
		style_normal.border_width_bottom = 2
		style_normal.border_width_left = 2
		style_normal.border_width_right = 2

		# Stile hover
		var style_hover = StyleBoxFlat.new()
		style_hover.bg_color = DARK_GREEN
		style_hover.border_color = PRIMARY_GREEN
		style_hover.border_width_top = 2
		style_hover.border_width_bottom = 2
		style_hover.border_width_left = 2
		style_hover.border_width_right = 2

		# Stile pressed
		var style_pressed = StyleBoxFlat.new()
		style_pressed.bg_color = SECONDARY_GREEN
		style_pressed.border_color = HIGHLIGHT_YELLOW
		style_pressed.border_width_top = 2
		style_pressed.border_width_bottom = 2
		style_pressed.border_width_left = 2
		style_pressed.border_width_right = 2

		# Applica gli stili
		button.add_theme_stylebox_override("normal", style_normal)
		button.add_theme_stylebox_override("hover", style_hover)
		button.add_theme_stylebox_override("pressed", style_pressed)

		# Colori testo
		button.add_theme_color_override("font_color", PRIMARY_GREEN)
		button.add_theme_color_override("font_hover_color", PRIMARY_GREEN)
		button.add_theme_color_override("font_pressed_color", BACKGROUND_BLACK)

		# Font size
		button.add_theme_font_size_override("font_size", 16)

func setup_connections():
	"""Configura i collegamenti e segnali"""
	# Connessioni già fatte in create_menu_buttons()

	# Verifica stato saved games per abilitare/disabilitare "Carica Partita"
	update_load_game_button_state()

	print("✅ Connessioni configurate")

func update_load_game_button_state():
	"""Aggiorna lo stato del pulsante Carica Partita"""
	if not load_game_button:
		return

	# Check se esistono salvataggi (integrazione con SaveManager esistente)
	var has_saves = false
	if game_manager and game_manager.has_method("has_saved_games"):
		has_saves = game_manager.has_saved_games()
	else:
		# Fallback: check file di salvataggio standard
		has_saves = FileAccess.file_exists("user://safeplace_save.json")

	load_game_button.disabled = not has_saves

	if has_saves:
		print("💾 Salvataggi trovati - pulsante Carica Partita abilitato")
	else:
		print("📁 Nessun salvataggio trovato - pulsante Carica Partita disabilitato")

# 🎬 SEQUENZA INTRO
func start_intro_sequence():
	"""Avvia la sequenza intro animata"""
	if is_initialized:
		return

	print("🎬 Avvio sequenza intro SafePlace...")

	# Prepara i componenti per le animazioni
	var components = {
		"image": image_header,
		"title": title_label,
		"subtitle": subtitle_label,
		"buttons": [new_game_button, load_game_button, story_button, instructions_button, settings_button],
		"footer": footer_label
	}

	# Avvia le transizioni
	transitions.start_intro_sequence(components)

	is_initialized = true
	print("✅ Sequenza intro avviata")

# 🎮 CALLBACKS PULSANTI MENU
func _on_new_game_pressed():
	"""Callback pulsante Nuova Partita"""
	print("🆕 Nuova Partita selezionata")

	if current_state != MenuState.MAIN:
		return

	current_state = MenuState.TRANSITIONING

	# Avvia transizione spegnimento CRT → gioco principale
	transitions.start_shutdown_transition(_start_new_game)

func _start_new_game():
	"""Avvia una nuova partita dopo la transizione"""
	print("🚀 Avvio nuova partita...")

	# Integrazione sicura con GameManager esistente
	if game_manager and game_manager.has_method("start_new_game_from_menu"):
		game_manager.start_new_game_from_menu()
	else:
		# Fallback: carica scena principale direttamente
		get_tree().change_scene_to_file("res://scenes/Main.tscn")

	print("✅ Transizione a gioco completata")

func _on_load_game_pressed():
	"""Callback pulsante Carica Partita"""
	print("📂 Carica Partita selezionata")

	if current_state != MenuState.MAIN or load_game_button.disabled:
		return

	current_state = MenuState.TRANSITIONING

	# Integrazione con sistema di salvataggio esistente
	if game_manager and game_manager.has_method("load_game_from_menu"):
		transitions.start_shutdown_transition(game_manager.load_game_from_menu)
	else:
		# Fallback
		transitions.start_shutdown_transition(_fallback_load_game)

func _fallback_load_game():
	"""Fallback per caricamento partita"""
	print("⚠️ Fallback load game attivato")
	get_tree().change_scene_to_file("res://scenes/Main.tscn")

func _on_story_pressed():
	"""Callback pulsante Storia"""
	print("📖 Storia selezionata")
	show_story_screen()

func _on_instructions_pressed():
	"""Callback pulsante Istruzioni"""
	print("📋 Istruzioni selezionate")
	show_instructions_screen()

func _on_settings_pressed():
	"""Callback pulsante Impostazioni"""
	print("⚙️ Impostazioni selezionate")
	show_settings_screen()

# 🖼️ GESTIONE SCHERMATE SECONDARIE
func show_story_screen():
	"""Mostra la schermata della storia"""
	current_state = MenuState.STORY

	# Crea e mostra pannello storia se non esiste
	if not story_screen:
		create_story_screen()

	# Transizione smooth
	transitions.quick_fade_transition(main_container, 0.0, 0.3)
	story_screen.visible = true
	transitions.quick_fade_transition(story_screen, 1.0, 0.3)

func show_instructions_screen():
	"""Mostra la schermata delle istruzioni"""
	current_state = MenuState.INSTRUCTIONS

	# Crea e mostra pannello istruzioni se non esiste
	if not instructions_screen:
		create_instructions_screen()

	# Transizione smooth
	transitions.quick_fade_transition(main_container, 0.0, 0.3)
	instructions_screen.visible = true
	transitions.quick_fade_transition(instructions_screen, 1.0, 0.3)

func show_settings_screen():
	"""Mostra la schermata delle impostazioni"""
	current_state = MenuState.SETTINGS

	# Crea e mostra pannello impostazioni se non esiste
	if not settings_screen:
		create_settings_screen()

	# Transizione smooth
	transitions.quick_fade_transition(main_container, 0.0, 0.3)
	settings_screen.visible = true
	transitions.quick_fade_transition(settings_screen, 1.0, 0.3)

func return_to_main_menu():
	"""Ritorna al menu principale da una schermata secondaria"""
	current_state = MenuState.MAIN

	# Nascondi schermata corrente
	if story_screen and story_screen.visible:
		transitions.quick_fade_transition(story_screen, 0.0, 0.3)
		story_screen.visible = false

	if instructions_screen and instructions_screen.visible:
		transitions.quick_fade_transition(instructions_screen, 0.0, 0.3)
		instructions_screen.visible = false

	if settings_screen and settings_screen.visible:
		transitions.quick_fade_transition(settings_screen, 0.0, 0.3)
		settings_screen.visible = false

	# Mostra menu principale
	transitions.quick_fade_transition(main_container, 1.0, 0.3)

	print("🔙 Ritorno al menu principale")

# 🎨 CREAZIONE SCHERMATE SECONDARIE
func create_story_screen():
	"""Crea la schermata della storia con presentazione retro"""
	# Crea istanza diretta della classe ContentPresentation
	story_screen = ContentPresentation.new()
	story_screen.name = "StoryScreen"
	story_screen.visible = false
	add_child(story_screen)

	# Inizializza con contenuto Storia
	story_screen.initialize_and_start("Storia", "storia", return_to_main_menu)

	print("📖 Schermata storia retro creata")

func create_instructions_screen():
	"""Crea la schermata delle istruzioni con presentazione retro"""
	# Crea istanza diretta della classe ContentPresentation
	instructions_screen = ContentPresentation.new()
	instructions_screen.name = "InstructionsScreen"
	instructions_screen.visible = false
	add_child(instructions_screen)

	# Inizializza con contenuto Istruzioni
	instructions_screen.initialize_and_start("Istruzioni", "istruzioni", return_to_main_menu)

	print("📋 Schermata istruzioni retro creata")

func create_settings_screen():
	"""Crea la schermata impostazioni avanzata"""
	# Crea istanza della SettingsScreen avanzata
	settings_screen = SettingsScreen.new()
	settings_screen.name = "SettingsScreen"
	settings_screen.visible = false
	add_child(settings_screen)

	# Inizializza con callback per tornare al menu
	settings_screen.initialize_and_start(return_to_main_menu)

	print("⚙️ Schermata impostazioni avanzata creata")

func create_content_screen(title: String, content: String) -> Control:
	"""Crea una schermata di contenuto generica (storia/istruzioni)"""
	var screen = Control.new()
	screen.name = title + "Screen"
	screen.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	screen.visible = false
	add_child(screen)

	# Container scroll per contenuto lungo
	var scroll = ScrollContainer.new()
	scroll.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	scroll.add_theme_constant_override("margin_top", 40)
	scroll.add_theme_constant_override("margin_bottom", 100)
	scroll.add_theme_constant_override("margin_left", 40)
	scroll.add_theme_constant_override("margin_right", 40)
	screen.add_child(scroll)

	# Label contenuto
	var content_label = RichTextLabel.new()
	content_label.bbcode_enabled = true
	content_label.text = "[font_size=24][color=" + PRIMARY_GREEN.to_html() + "]" + title + "[/color][/font_size]\n\n" + content
	content_label.fit_content = true
	content_label.custom_minimum_size = Vector2(700, 0)
	scroll.add_child(content_label)

	# Pulsante ritorno
	add_return_button(screen)

	return screen

func add_return_button(screen: Control):
	"""Aggiunge un pulsante 'Torna al Menu' a una schermata"""
	var return_button = Button.new()
	return_button.text = "Torna al Menu"
	return_button.custom_minimum_size = Vector2(200, 40)
	return_button.position = Vector2(50, 50)
	return_button.pressed.connect(return_to_main_menu)

	# Styling pulsante ritorno
	var style = StyleBoxFlat.new()
	style.bg_color = DARK_GREEN
	style.border_color = SECONDARY_GREEN
	style.border_width_top = 1
	style.border_width_bottom = 1
	style.border_width_left = 1
	style.border_width_right = 1

	return_button.add_theme_stylebox_override("normal", style)
	return_button.add_theme_color_override("font_color", PRIMARY_GREEN)

	screen.add_child(return_button)

# 🧪 CLEANUP E UTILITY
func _exit_tree():
	"""Cleanup automatico"""
	if transitions:
		transitions.cleanup()

	print("🧹 MenuManager: Cleanup completato")

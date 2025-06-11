extends Control
class_name MenuManager

# 🎮 MENU MANAGER SAFEPLACE
# Gestione completa schermata menu iniziale con autenticità SafePlace
# Integrazione sicura con sistemi esistenti del gioco

# 📚 PRELOAD CLASSES
const ContentPresentationClass = preload("res://scripts/ContentPresentation.gd")
const SettingsScreenClass = preload("res://scripts/SettingsScreen.gd")

# 🎨 INTEGRAZIONE THEMEMANAGER v1.4.3 - Colori dinamici dal tema corrente
# Sostituiti colori hardcodati con funzioni getter del ThemeManager

# Funzioni getter per colori dinamici del tema corrente
func get_primary_color() -> Color:
	return ThemeManager.get_color("primary")

func get_secondary_color() -> Color:
	return ThemeManager.get_color("secondary")

func get_background_color() -> Color:
	return ThemeManager.get_color("background")

func get_text_color() -> Color:
	return ThemeManager.get_color("text")

func get_accent_color() -> Color:
	return ThemeManager.get_color("accent")

func get_hover_color() -> Color:
	return ThemeManager.get_color("hover")

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
var content_manager: ContentManager
var game_manager

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
	
	# 🎨 CONNETTI AI SEGNALI THEMEMANAGER per aggiornamenti automatici
	_connect_theme_signals()

	# Avvia inizializzazione semplificata
	call_deferred("simple_initialization")

func setup_systems():
	"""Inizializza i sistemi di supporto"""
	# Content manager per testi autentici
	content_manager = ContentManager.new()
	add_child(content_manager)

	# GameManager non è disponibile dal menu - transizione diretta a scena
	game_manager = null
	print("ℹ️ GameManager non disponibile dal menu (normale comportamento)")

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

	# Titolo principale - CORRETTO: fallback visibile se animazioni non funzionano
	title_label = Label.new()
	title_label.name = "TitleLabel"
	title_label.text = "The Safe Place" # FALLBACK: sempre visibile
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
		image_header.custom_minimum_size = Vector2(0, IMAGE_MAX_HEIGHT)
		print("✅ Immagine header caricata: ", image_path)
	else:
		push_warning("⚠️ Immagine header non trovata, creazione placeholder...")
		create_placeholder_image()

func create_placeholder_image():
	"""Crea un'immagine placeholder se quella originale non è disponibile"""
	var placeholder = ImageTexture.new()
	var image = Image.create(400, 200, false, Image.FORMAT_RGB8)
	image.fill(get_secondary_color())
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
		button.size_flags_vertical = Control.SIZE_SHRINK_CENTER
		
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

	print("✅ Pulsanti menu creati (5/5)")

func setup_styling():
	"""Applica lo styling SafePlace a tutti i componenti"""
	# 🔤 APPLICA FONT PERFECT DOS VGA 437 A TUTTO IL MENU
	_apply_perfect_dos_font()
	
	# Sfondo principale
	var style_bg = StyleBoxFlat.new()
	style_bg.bg_color = get_background_color()
	add_theme_stylebox_override("panel", style_bg)

	# Styling titolo principale 
	title_label.add_theme_font_size_override("font_size", 41)
	title_label.add_theme_color_override("font_color", get_primary_color())

	# Styling sottotitolo
	subtitle_label.add_theme_font_size_override("font_size", 18)
	subtitle_label.add_theme_color_override("font_color", get_secondary_color())

	# Styling footer
	footer_label.add_theme_font_size_override("font_size", 9)
	footer_label.add_theme_color_override("font_color", get_secondary_color())

	# Styling pulsanti
	style_menu_buttons()

	print("✅ Styling SafePlace applicato")

func _apply_perfect_dos_font():
	"""Applica font Perfect DOS VGA 437 a tutti i componenti del menu"""
	# Crea font monospace con priorità Perfect DOS VGA 437
	var perfect_dos_font = SystemFont.new()
	perfect_dos_font.font_names = ["Perfect DOS VGA 437", "Fixedsys Excelsior", "Fixedsys", "MS DOS", "Courier New", "Lucida Console", "Consolas", "monospace"]
	perfect_dos_font.subpixel_positioning = TextServer.SUBPIXEL_POSITIONING_AUTO
	perfect_dos_font.multichannel_signed_distance_field = false
	
	# Applica a tutti i Label del menu
	var labels = [title_label, subtitle_label, footer_label]
	for label in labels:
		if label:
			label.add_theme_font_override("font", perfect_dos_font)
	
	# Applica a tutti i bottoni del menu
	var buttons = [new_game_button, load_game_button, story_button, instructions_button, settings_button]
	for button in buttons:
		if button:
			button.add_theme_font_override("font", perfect_dos_font)
	
	print("🔤 [MenuManager] Font Perfect DOS VGA 437 applicato a tutto il menu")

func style_menu_buttons():
	"""Applica lo styling specifico ai pulsanti menu"""
	var buttons = [new_game_button, load_game_button, story_button, instructions_button, settings_button]

	for button in buttons:
		if not button:
			continue

		# Stile normale
		var style_normal = StyleBoxFlat.new()
		style_normal.bg_color = get_background_color()
		style_normal.border_color = get_secondary_color()
		style_normal.border_width_top = 2
		style_normal.border_width_bottom = 2
		style_normal.border_width_left = 2
		style_normal.border_width_right = 2

		# Stile hover - EFFETTO NEGATIVO: sfondo chiaro, testo scuro
		var style_hover = StyleBoxFlat.new()
		style_hover.bg_color = get_primary_color()
		style_hover.border_color = get_primary_color()
		style_hover.border_width_top = 2
		style_hover.border_width_bottom = 2
		style_hover.border_width_left = 2
		style_hover.border_width_right = 2

		# Stile pressed - EFFETTO NEGATIVO: sfondo accent, testo scuro
		var style_pressed = StyleBoxFlat.new()
		style_pressed.bg_color = get_accent_color()
		style_pressed.border_color = get_accent_color()
		style_pressed.border_width_top = 2
		style_pressed.border_width_bottom = 2
		style_pressed.border_width_left = 2
		style_pressed.border_width_right = 2

		# Applica gli stili
		button.add_theme_stylebox_override("normal", style_normal)
		button.add_theme_stylebox_override("hover", style_hover)
		button.add_theme_stylebox_override("pressed", style_pressed)

		# Colori testo - EFFETTO NEGATIVO
		button.add_theme_color_override("font_color", get_primary_color())
		button.add_theme_color_override("font_hover_color", get_background_color())  # TESTO SCURO SU SFONDO CHIARO
		button.add_theme_color_override("font_pressed_color", get_background_color())  # TESTO SCURO SU SFONDO ACCENT

		# Font size
		button.add_theme_font_size_override("font_size", 16)

func setup_connections():
	"""Configura i collegamenti e segnali"""
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

	# Verifica stato saved games
	update_load_game_button_state()

	print("✅ Connessioni configurate")

func _connect_theme_signals():
	"""Connette ai segnali del ThemeManager per aggiornamenti automatici"""
	if ThemeManager.theme_changed.connect(_on_theme_changed_signal) == OK:
		print("🎨 MenuManager collegato ai segnali ThemeManager")
	else:
		print("⚠️ Errore collegamento segnali ThemeManager")

func _on_theme_changed_signal(theme_type):
	"""Callback quando il tema cambia - aggiorna tutto il menu"""
	print("🎨 MenuManager: Aggiornamento tema %s" % ThemeManager.ThemeType.keys()[theme_type])
	
	# Riapplica styling con i nuovi colori
	setup_styling()
	
	# Forza aggiornamento visivo
	queue_redraw()

func update_load_game_button_state():
	"""Aggiorna lo stato del pulsante Carica Partita"""
	if not load_game_button:
		return

	# Check se esistono salvataggi
	var has_saves = FileAccess.file_exists("user://safeplace_save.json")
	load_game_button.disabled = not has_saves

	if has_saves:
		print("💾 Salvataggi trovati - pulsante Carica Partita abilitato")
	else:
		print("📁 Nessun salvataggio trovato - pulsante Carica Partita disabilitato")

# 🎬 EFFETTO CARICAMENTO TERMINALE ANNI 80
func simple_initialization():
	"""Inizializzazione con effetto caricamento terminale"""
	print("🎬 Avvio sequenza caricamento terminale anni 80...")
	
	# Nascondi tutti i componenti inizialmente
	hide_all_components()
	
	# Avvia sequenza caricamento
	start_terminal_loading_sequence()
	
	is_initialized = true

func hide_all_components():
	"""Nasconde tutti i componenti del menu per l'effetto caricamento"""
	if image_header:
		image_header.modulate.a = 0.0
	if title_label:
		title_label.modulate.a = 0.0
	if subtitle_label:
		subtitle_label.modulate.a = 0.0
	if footer_label:
		footer_label.modulate.a = 0.0
	
	# Nascondi tutti i pulsanti
	var buttons = [new_game_button, load_game_button, story_button, instructions_button, settings_button]
	for button in buttons:
		if button:
			button.modulate.a = 0.0

func start_terminal_loading_sequence():
	"""Sequenza di caricamento stile terminale anni 80"""
	print("💻 Sequenza caricamento terminale iniziata...")
	
	# 1. Mezzo secondo di nero
	await get_tree().create_timer(0.5).timeout
	
	# 2. Mostra immagine header (se presente) - fade in veloce
	if image_header:
		fade_in_component(image_header, 0.3)
		await get_tree().create_timer(0.4).timeout
	
	# 3. Mostra titolo con effetto typewriter
	if title_label:
		fade_in_component(title_label, 0.2)
		await get_tree().create_timer(0.3).timeout
	
	# 4. Mostra sottotitolo
	if subtitle_label:
		fade_in_component(subtitle_label, 0.2)
		await get_tree().create_timer(0.3).timeout
	
	# 5. Mostra pulsanti uno per volta (effetto terminale)
	var buttons = [new_game_button, load_game_button, story_button, instructions_button, settings_button]
	for button in buttons:
		if button:
			fade_in_component(button, 0.15)
			await get_tree().create_timer(0.12).timeout  # Intervallo breve tra pulsanti
	
	# 6. Mostra footer per ultimo
	if footer_label:
		fade_in_component(footer_label, 0.2)
		await get_tree().create_timer(0.2).timeout
	
	print("✅ Sequenza caricamento terminale completata")

func fade_in_component(component: Control, duration: float):
	"""Effetto fade in per un singolo componente"""
	if not component:
		return
	
	var tween = create_tween()
	tween.tween_property(component, "modulate:a", 1.0, duration)

# 🎮 CALLBACKS PULSANTI MENU
func _on_new_game_pressed():
	"""Callback pulsante Nuova Partita"""
	print("🆕 Nuova Partita selezionata")
	
	if current_state != MenuState.MAIN:
		return
	
	current_state = MenuState.TRANSITIONING
	_start_new_game()

func _start_new_game():
	"""Avvia una nuova partita"""
	print("🚀 Avvio nuova partita...")
	
	# Transizione diretta alla scena principale
	var error = get_tree().change_scene_to_file("res://scenes/Main.tscn")
	if error != OK:
		push_error("❌ Impossibile caricare la scena del gioco: " + str(error))
	else:
		print("✅ Transizione a gioco completata")

func _on_load_game_pressed():
	"""Callback pulsante Carica Partita"""
	print("📂 Carica Partita selezionata")
	
	if current_state != MenuState.MAIN or load_game_button.disabled:
		return
	
	# TODO: Implementare caricamento
	_start_new_game() # Fallback temporaneo

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

func show_settings_screen():
	"""Mostra la schermata delle impostazioni"""
	current_state = MenuState.SETTINGS

	# Crea e mostra pannello impostazioni se non esiste
	if not settings_screen:
		create_settings_screen()

	# Nascondi menu principale e mostra impostazioni
	main_container.visible = false
	settings_screen.visible = true

# 🖼️ GESTIONE SCHERMATE SECONDARIE
func show_story_screen():
	"""Mostra la schermata della storia"""
	current_state = MenuState.STORY

	# Crea e mostra pannello storia se non esiste
	if not story_screen:
		create_story_screen()

	# Nascondi menu principale e mostra storia
	main_container.visible = false
	story_screen.visible = true

func show_instructions_screen():
	"""Mostra la schermata delle istruzioni"""
	current_state = MenuState.INSTRUCTIONS

	# Crea e mostra pannello istruzioni se non esiste
	if not instructions_screen:
		create_instructions_screen()

	# Nascondi menu principale e mostra istruzioni
	main_container.visible = false
	instructions_screen.visible = true

func return_to_main_menu():
	"""Ritorna al menu principale da una schermata secondaria"""
	current_state = MenuState.MAIN

	# Nascondi tutte le schermate secondarie
	if story_screen and story_screen.visible:
		story_screen.visible = false

	if instructions_screen and instructions_screen.visible:
		instructions_screen.visible = false

	if settings_screen and settings_screen.visible:
		settings_screen.visible = false

	# Mostra menu principale
	main_container.visible = true

	print("🔙 Ritorno al menu principale")

# 🎨 CREAZIONE SCHERMATE SECONDARIE
func create_story_screen():
	"""Crea la schermata della storia con presentazione retro"""
	# Crea istanza diretta della classe ContentPresentation
	story_screen = ContentPresentationClass.new()
	story_screen.name = "StoryScreen"
	story_screen.visible = false
	add_child(story_screen)

	# Inizializza con contenuto Storia
	story_screen.initialize_and_start("Storia", "storia", return_to_main_menu)

	print("📖 Schermata storia retro creata")

func create_instructions_screen():
	"""Crea la schermata delle istruzioni con presentazione retro"""
	# Crea istanza diretta della classe ContentPresentation
	instructions_screen = ContentPresentationClass.new()
	instructions_screen.name = "InstructionsScreen"
	instructions_screen.visible = false
	add_child(instructions_screen)

	# Inizializza con contenuto Istruzioni
	instructions_screen.initialize_and_start("Istruzioni", "istruzioni", return_to_main_menu)

	print("📋 Schermata istruzioni retro creata")

func create_settings_screen():
	"""Crea la schermata delle impostazioni"""
	# Crea istanza diretta della classe SettingsScreen
	settings_screen = SettingsScreenClass.new()
	settings_screen.name = "SettingsScreen"
	settings_screen.visible = false
	add_child(settings_screen)

	# Inizializza con callback per tornare al menu
	settings_screen.initialize_and_start(return_to_main_menu)

	print("⚙️ Schermata impostazioni creata")

# 🔄 GESTIONE STATI
func get_current_state() -> MenuState:
	"""Ritorna lo stato corrente del menu"""
	return current_state

func is_menu_active() -> bool:
	"""Controlla se il menu è attivo"""
	return visible and current_state != MenuState.TRANSITIONING 

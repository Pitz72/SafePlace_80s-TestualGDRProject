# 🎨 THEME MANAGER - SISTEMA GESTIONE TEMI VISIVI SAFEPLACE
# Versione: v1.0.0 Production Ready
# Data: 09 Giugno 2025
# Singleton autoload per gestione temi e impostazioni

extends Node

# 🎯 MODALITÀ VISIVE DISPONIBILI
enum VisualMode {
	STANDARD, # Colori SafePlace originali
	CRT_PET, # Monitor fosfori verdi vintage
	HIGH_CONTRAST # Solo bianco/nero per accessibilità
}

enum AudioState {
	DISABLED, # Audio disabilitato
	ENABLED # Audio abilitato (futuro)
}

# 🎨 PALETTE COLORI PER OGNI MODALITÀ
const THEME_PALETTES = {
	VisualMode.STANDARD: {
		"primary": Color("#4EA162"), # Verde SafePlace autentico
		"background": Color("#000000"), # Nero terminale
		"text": Color("#00B347"), # Verde testo standard
		"bright": Color("#00FF41"), # Verde brillante highlights
		"dim": Color("#001A0D"), # Verde molto scuro
		"secondary": Color("#2D5F3F"), # Verde secondario
		"border": Color("#4EA162") # Verde bordi panels
	},
	VisualMode.CRT_PET: {
		"primary": Color("#4EA162"), # Base verde invariata
		"background": Color("#0A0A0A"), # Nero CRT leggermente grigio
		"text": Color("#4EA162"), # Verde monocromatico
		"bright": Color("#6BC47E"), # Verde +20% luminosità
		"dim": Color("#2D5E42"), # Verde -40% luminosità
		"secondary": Color("#4EA162"), # Verde consistente
		"border": Color("#5BBF72") # Verde bordi +15%
	},
	VisualMode.HIGH_CONTRAST: {
		"primary": Color("#FFFFFF"), # Bianco puro
		"background": Color("#000000"), # Nero puro
		"text": Color("#FFFFFF"), # Bianco testo
		"bright": Color("#FFFFFF"), # Bianco highlights
		"dim": Color("#808080"), # Grigio medio
		"secondary": Color("#C0C0C0"), # Grigio chiaro
		"border": Color("#FFFFFF") # Bianco bordi
	}
}

# 📝 DESCRIZIONI MODALITÀ
const MODE_DESCRIPTIONS = {
	VisualMode.STANDARD: "Il gioco nella sua forma originale con colori SafePlace autentici",
	VisualMode.CRT_PET: "Simula monitor a fosfori verdi vintage con effetto retrò",
	VisualMode.HIGH_CONTRAST: "Solo bianco e nero per massima leggibilità e accessibilità"
}

# 🔧 STATO SISTEMA
var current_visual_mode: VisualMode = VisualMode.STANDARD
var audio_enabled: bool = false
var master_volume: float = 1.0

# 💾 BACKUP SISTEMA
var theme_backup: Dictionary = {}

# 📁 PERCORSO FILE SETTINGS
const SETTINGS_FILE = "user://safeplace_settings.json"

func _ready():
	"""Inizializzazione singleton"""
	print("🎨 ThemeManager: Singleton autoload inizializzato")
	load_settings()

# 💾 PERSISTENZA SETTINGS
func save_settings():
	"""Salva impostazioni su file JSON"""
	var settings = {
		"visual_mode": current_visual_mode,
		"audio_enabled": audio_enabled,
		"master_volume": master_volume,
		"version": "1.0.0"
	}

	var file = FileAccess.open(SETTINGS_FILE, FileAccess.WRITE)
	if file:
		file.store_string(JSON.stringify(settings))
		file.close()
		print("💾 ThemeManager: Impostazioni salvate")
	else:
		print("❌ ThemeManager: Errore salvataggio settings")

func load_settings():
	"""Carica impostazioni da file JSON con fallback"""
	if not FileAccess.file_exists(SETTINGS_FILE):
		print("📄 ThemeManager: Creazione settings iniziali")
		save_settings()
		return

	var file = FileAccess.open(SETTINGS_FILE, FileAccess.READ)
	if not file:
		print("❌ ThemeManager: Errore apertura file settings")
		return

	var json_text = file.get_as_text()
	file.close()

	var json = JSON.new()
	var result = json.parse(json_text)

	if result != OK:
		print("❌ ThemeManager: JSON corrotto, uso defaults")
		save_settings()
		return

	var settings = json.data

	# Carica con validazione
	if settings.has("visual_mode") and settings.visual_mode in range(VisualMode.size()):
		current_visual_mode = settings.visual_mode
	if settings.has("audio_enabled"):
		audio_enabled = settings.audio_enabled
	if settings.has("master_volume"):
		master_volume = clamp(settings.master_volume, 0.0, 1.0)

	print("📄 ThemeManager: Settings caricati - Tema: %s" % VisualMode.keys()[current_visual_mode])

# 🎨 GESTIONE TEMI VISIVI
func apply_visual_theme(mode: VisualMode):
	"""Applica tema visivo a tutto il sistema"""
	backup_current_theme()
	current_visual_mode = mode

	var palette = THEME_PALETTES[mode]

	# Applica a tutti i componenti esistenti
	_apply_theme_to_main_interface(palette)
	_apply_theme_to_story_presentation(palette)
	_apply_theme_to_menu_manager(palette)

	# Salva automaticamente
	save_settings()

func _apply_theme_to_main_interface(palette: Dictionary):
	"""Applica tema a MainInterface se attiva"""
	var main_interface = get_node_or_null("/root/Main/MainInterface")

	if not main_interface:
		# Prova percorsi alternativi
		main_interface = get_node_or_null("/root/Main")

	if main_interface:
		_update_interface_colors(main_interface, palette)

func _apply_theme_to_story_presentation(palette: Dictionary):
	"""Applica tema a StoryPresentation se attiva"""
	# Approccio semplificato - cerca nel menu manager
	var menu_manager = get_node_or_null("/root/MenuScreen/MenuManager")

	if menu_manager:
		var story_screen = menu_manager.get_node_or_null("StoryScreen")
		var instructions_screen = menu_manager.get_node_or_null("InstructionsScreen")

		if story_screen:
			_update_story_colors(story_screen, palette)
		if instructions_screen:
			_update_story_colors(instructions_screen, palette)

func _apply_theme_to_menu_manager(palette: Dictionary):
	"""Applica tema a MenuManager se attivo"""
	var menu_manager = get_node_or_null("/root/MenuScreen/MenuManager")

	if menu_manager:
		_update_menu_colors(menu_manager, palette)
	else:
		# Prova percorso alternativo
		menu_manager = get_node_or_null("/root/MenuScreen")
		if menu_manager:
			_update_menu_colors(menu_manager, palette)

func _update_interface_colors(interface: Control, palette: Dictionary):
	"""Aggiorna colori MainInterface tramite theme override"""
	var panels = interface.get_children()

	for panel in panels:
		if panel is Panel:
			# Aggiorna StyleBox del pannello
			var style = panel.get_theme_stylebox("panel")
			if style and style is StyleBoxFlat:
				var new_style = style.duplicate()
				new_style.bg_color = palette.background
				new_style.border_color = palette.border
				panel.add_theme_stylebox_override("panel", new_style)

		# Aggiorna colori label/rich text
		_update_text_colors_recursive(panel, palette)

func _update_story_colors(story_screen: Control, palette: Dictionary):
	"""Aggiorna colori schermata storia"""
	var story_display = story_screen.get_node_or_null("**/StoryDisplay")

	if story_display and story_display is RichTextLabel:
		story_display.add_theme_color_override("default_color", palette.text)

		# Aggiorna StyleBox
		var style = story_display.get_theme_stylebox("normal")
		if style and style is StyleBoxFlat:
			var new_style = style.duplicate()
			new_style.bg_color = palette.background
			new_style.border_color = palette.dim
			story_display.add_theme_stylebox_override("normal", new_style)

func _update_menu_colors(menu_manager: Control, palette: Dictionary):
	"""Aggiorna colori menu manager"""
	# Trova tutti i pulsanti nel menu
	var buttons = _find_all_buttons(menu_manager)

	for button in buttons:
		button.add_theme_color_override("font_color", palette.text)
		button.add_theme_color_override("font_hover_color", palette.bright)

		# Aggiorna stili pulsanti
		var styles = ["normal", "hover", "pressed"]
		for style_name in styles:
			var style = button.get_theme_stylebox(style_name)
			if style and style is StyleBoxFlat:
				var new_style = style.duplicate()
				new_style.bg_color = palette.background
				new_style.border_color = palette.primary
				button.add_theme_stylebox_override(style_name, new_style)

func _find_all_buttons(node: Node) -> Array:
	"""Trova tutti i pulsanti ricorsivamente"""
	var buttons = []

	if node is Button:
		buttons.append(node)

	for child in node.get_children():
		buttons.append_array(_find_all_buttons(child))

	return buttons

func _update_text_colors_recursive(node: Node, palette: Dictionary):
	"""Aggiorna ricorsivamente colori testo"""
	if node is Label:
		node.add_theme_color_override("font_color", palette.text)
	elif node is RichTextLabel:
		node.add_theme_color_override("default_color", palette.text)

	for child in node.get_children():
		_update_text_colors_recursive(child, palette)

# 💾 SISTEMA BACKUP/RIPRISTINO
func backup_current_theme():
	"""Crea backup del tema corrente per ripristino"""
	theme_backup = {
		"visual_mode": current_visual_mode,
		"audio_enabled": audio_enabled,
		"master_volume": master_volume
	}
	print("💾 Backup tema corrente creato")

func restore_theme_backup():
	"""Ripristina tema dal backup"""
	if theme_backup.has("visual_mode"):
		current_visual_mode = theme_backup.visual_mode
		audio_enabled = theme_backup.audio_enabled
		master_volume = theme_backup.master_volume
		apply_visual_theme(current_visual_mode)
		print("🔄 Tema ripristinato da backup")

# 🔧 API PUBBLICA
func get_current_palette() -> Dictionary:
	"""Ottieni palette colori corrente"""
	return THEME_PALETTES[current_visual_mode]

func get_current_visual_mode() -> VisualMode:
	"""Ottieni modalità visiva corrente"""
	return current_visual_mode

# 🔊 GESTIONE AUDIO (PLACEHOLDER)
func set_audio_enabled(enabled: bool):
	"""Imposta abilitazione audio"""
	audio_enabled = enabled
	save_settings()

func set_master_volume(volume: float):
	"""Imposta volume master"""
	master_volume = clamp(volume, 0.0, 1.0)
	save_settings()

func get_audio_enabled() -> bool:
	"""Ottieni stato audio"""
	return audio_enabled

func get_master_volume() -> float:
	"""Ottieni volume master"""
	return master_volume

# 🧩 UTILITY
func get_mode_description(mode: VisualMode) -> String:
	"""Ottieni descrizione di una modalità"""
	return MODE_DESCRIPTIONS[mode]

func get_available_modes() -> Array:
	"""Ottieni elenco modalità disponibili"""
	return [VisualMode.STANDARD, VisualMode.CRT_PET, VisualMode.HIGH_CONTRAST]

func validate_theme_integrity() -> bool:
	"""Valida integrità tema corrente"""
	var palette = THEME_PALETTES.get(current_visual_mode)
	if not palette:
		print("❌ Palette tema corrotta")
		return false

	var required_keys = ["primary", "background", "text", "bright", "dim", "secondary", "border"]
	for key in required_keys:
		if not palette.has(key):
			print("❌ Chiave mancante in palette: %s" % key)
			return false

	print("✅ Integrità tema validata")
	return true

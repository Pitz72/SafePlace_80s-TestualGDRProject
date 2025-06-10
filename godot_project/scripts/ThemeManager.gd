extends Node

# 🎨 THEME MANAGER GLOBALE SAFEPLACE
# Gestione dei 3 temi principali del gioco con applicazione globale

# 🎯 ENUM TEMI DISPONIBILI
enum ThemeType {
	DEFAULT,      # Tema base #4EA162 e gradazioni
	CRT_GREEN,    # CRT Fosfori verdi con effetti
	HIGH_CONTRAST # Solo bianco e nero per accessibilità
}

# 🎨 DEFINIZIONE COLORI BASE #4EA162 
const BASE_GREEN = Color("#4EA162")

# 📋 TEMA DEFAULT - Gradazioni di #4EA162
const DEFAULT_THEME = {
	"primary": Color("#4EA162"),        # Verde principale
	"secondary": Color("#3D8A52"),      # Verde più scuro (-20%)
	"bright": Color("#5FB874"),         # Verde più chiaro (+20%)
	"dim": Color("#2D6642"),            # Verde scuro (-40%)
	"background": Color("#001A0D"),     # Verde molto scuro per sfondi
	"text": Color("#4EA162"),           # Testo principale
	"accent": Color("#FFB000"),         # Accent giallo per evidenziazioni
	"border": Color("#3D8A52"),         # Bordi
	"hover": Color("#5FB874"),          # Hover effects
	"disabled": Color("#2D6642")        # Elementi disabilitati
}

# 📺 TEMA CRT FOSFORI VERDI - Solo #4EA162 con effetti
const CRT_THEME = {
	"primary": Color("#4EA162"),        # Solo il colore base
	"secondary": Color("#4EA162"),      # Stesso colore
	"bright": Color("#4EA162"),         # Stesso colore
	"dim": Color("#2D4D35"),            # Più scuro per profondità
	"background": Color("#000000"),     # Nero puro CRT
	"text": Color("#4EA162"),           # Testo verde fosforoso
	"accent": Color("#4EA162"),         # Accent stesso verde
	"border": Color("#4EA162"),         # Bordi verdi
	"hover": Color("#6BC47E"),          # Leggero glow su hover
	"disabled": Color("#2D4D35")        # Disabilitato scuro
}

# ⚫ TEMA ALTO CONTRASTO - Solo bianco e nero
const HIGH_CONTRAST_THEME = {
	"primary": Color("#FFFFFF"),        # Bianco puro
	"secondary": Color("#FFFFFF"),      # Bianco
	"bright": Color("#FFFFFF"),         # Bianco
	"dim": Color("#808080"),            # Grigio medio
	"background": Color("#000000"),     # Nero puro
	"text": Color("#FFFFFF"),           # Testo bianco
	"accent": Color("#FFFFFF"),         # Accent bianco
	"border": Color("#FFFFFF"),         # Bordi bianchi
	"hover": Color("#FFFFFF"),          # Hover bianco
	"disabled": Color("#808080")        # Disabilitato grigio
}

# 🔧 STATO CORRENTE
var current_theme_type: ThemeType = ThemeType.DEFAULT
var current_colors: Dictionary = DEFAULT_THEME.duplicate()
var theme_backup: Dictionary = {}

# 📡 SEGNALI GLOBALI
signal theme_changed(theme_type: ThemeType)
signal colors_updated(colors: Dictionary)

# 🚀 INIZIALIZZAZIONE
func _ready():
	print("🎨 ThemeManager inizializzato - Tema: DEFAULT")
	# Carica tema salvato o usa DEFAULT come fallback
	load_theme_settings()
	
	# Se non c'è un tema salvato, forza DEFAULT
	if current_theme_type != ThemeType.DEFAULT and not FileAccess.file_exists("user://theme_settings.cfg"):
		print("🔧 Nessun tema salvato, forzo DEFAULT")
		set_theme(ThemeType.DEFAULT)

# 🎯 API PRINCIPALE TEMI
func set_theme(theme_type: ThemeType) -> void:
	"""Imposta il tema specificato"""
	print("🎨 Cambio tema richiesto: %s" % ThemeType.keys()[theme_type])
	
	current_theme_type = theme_type
	
	match theme_type:
		ThemeType.DEFAULT:
			current_colors = DEFAULT_THEME.duplicate()
		ThemeType.CRT_GREEN:
			current_colors = CRT_THEME.duplicate()
		ThemeType.HIGH_CONTRAST:
			current_colors = HIGH_CONTRAST_THEME.duplicate()
	
	# Emetti segnali per aggiornamento globale
	theme_changed.emit(theme_type)
	colors_updated.emit(current_colors)
	
	print("✅ Tema applicato: %s" % ThemeType.keys()[theme_type])

func get_current_theme_type() -> ThemeType:
	"""Ritorna il tipo di tema corrente"""
	return current_theme_type

func get_current_colors() -> Dictionary:
	"""Ritorna i colori del tema corrente"""
	return current_colors.duplicate()

# 🎨 API ACCESSO COLORI
func get_color(color_name: String) -> Color:
	"""Ottieni un colore specifico del tema corrente"""
	if current_colors.has(color_name):
		return current_colors[color_name]
	else:
		push_warning("⚠️ Colore '%s' non trovato nel tema corrente" % color_name)
		return Color.MAGENTA # Colore debug

func get_primary() -> Color:
	return get_color("primary")

func get_secondary() -> Color:
	return get_color("secondary")

func get_background() -> Color:
	return get_color("background")

func get_text() -> Color:
	return get_color("text")

func get_accent() -> Color:
	return get_color("accent")

func get_border() -> Color:
	return get_color("border")

func get_hover() -> Color:
	return get_color("hover")

func get_disabled() -> Color:
	return get_color("disabled")

# 🔄 SISTEMA BACKUP TEMI
func backup_current_theme() -> void:
	"""Crea backup del tema corrente"""
	theme_backup = {
		"type": current_theme_type,
		"colors": current_colors.duplicate()
	}
	print("💾 Backup tema creato")

func restore_theme_backup() -> void:
	"""Ripristina tema dal backup"""
	if theme_backup.is_empty():
		print("⚠️ Nessun backup tema disponibile")
		return
	
	current_theme_type = theme_backup["type"]
	current_colors = theme_backup["colors"].duplicate()
	
	# Emetti segnali per aggiornamento
	theme_changed.emit(current_theme_type)
	colors_updated.emit(current_colors)
	
	print("🔄 Tema ripristinato da backup")

# 💾 PERSISTENZA TEMI
func save_theme_settings() -> void:
	"""Salva impostazioni tema su file"""
	var config = ConfigFile.new()
	config.set_value("theme", "current_type", current_theme_type)
	config.save("user://theme_settings.cfg")
	print("💾 Impostazioni tema salvate")

func load_theme_settings() -> void:
	"""Carica impostazioni tema da file"""
	var config = ConfigFile.new()
	if config.load("user://theme_settings.cfg") == OK:
		var saved_theme = config.get_value("theme", "current_type", ThemeType.DEFAULT)
		if saved_theme != current_theme_type:
			set_theme(saved_theme)
			print("📂 Impostazioni tema caricate: %s" % ThemeType.keys()[saved_theme])
		else:
			print("📂 Tema già impostato: %s" % ThemeType.keys()[saved_theme])
	else:
		print("📂 File impostazioni tema non trovato, mantengo DEFAULT")

# 🎮 UTILITÀ PER SCENE
func apply_theme_to_control(control: Control) -> void:
	"""Applica il tema corrente a un Control"""
	if not control:
		return
	
	# Applica colori base
	if control.has_method("add_theme_color_override"):
		control.add_theme_color_override("font_color", get_text())
	
	# Applica sfondo se è un panel
	if control is Panel:
		var bg_style = StyleBoxFlat.new()
		bg_style.bg_color = get_background()
		bg_style.border_color = get_border()
		bg_style.border_width_left = 1
		bg_style.border_width_right = 1
		bg_style.border_width_top = 1
		bg_style.border_width_bottom = 1
		control.add_theme_stylebox_override("panel", bg_style)

func apply_theme_to_button(button: Button) -> void:
	"""Applica il tema corrente a un Button"""
	if not button:
		return
	
	# Stile normale
	var style_normal = StyleBoxFlat.new()
	style_normal.bg_color = get_background()
	style_normal.border_color = get_border()
	style_normal.border_width_left = 2
	style_normal.border_width_right = 2
	style_normal.border_width_top = 2
	style_normal.border_width_bottom = 2

	# Stile hover
	var style_hover = StyleBoxFlat.new()
	style_hover.bg_color = get_primary()
	style_hover.border_color = get_hover()
	style_hover.border_width_left = 2
	style_hover.border_width_right = 2
	style_hover.border_width_top = 2
	style_hover.border_width_bottom = 2

	# Applica stili
	button.add_theme_stylebox_override("normal", style_normal)
	button.add_theme_stylebox_override("hover", style_hover)
	button.add_theme_stylebox_override("pressed", style_hover)
	button.add_theme_color_override("font_color", get_text())
	button.add_theme_color_override("font_hover_color", get_hover())

# 🔍 DEBUG E INFO
func get_theme_info() -> String:
	"""Ritorna informazioni sul tema corrente"""
	return "Tema: %s | Colori: %d definiti" % [ThemeType.keys()[current_theme_type], current_colors.size()]

func print_current_colors() -> void:
	"""Stampa tutti i colori del tema corrente (debug)"""
	print("🎨 Colori tema %s:" % ThemeType.keys()[current_theme_type])
	for color_name in current_colors:
		print("  %s: %s" % [color_name, current_colors[color_name].to_html()])

# 🧹 CLEANUP
func _exit_tree():
	"""Salva automaticamente le impostazioni alla chiusura"""
	save_theme_settings()
	print("🧹 ThemeManager: Impostazioni salvate e cleanup completato") 
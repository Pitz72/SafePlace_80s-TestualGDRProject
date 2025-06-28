extends Node

# 🎨 THEME MANAGER GLOBALE SAFEPLACE
# Gestione dei 3 temi principali del gioco con applicazione globale
# Segue il PROTOCOLLO DI SVILUPPO UMANO-LLM

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
	"background": Color("#000503"),     # Verde ESTREMAMENTE scuro per sfondi
	"text": Color("#4EA162"),           # Testo principale
	"accent": Color("#FFB000"),         # Accent giallo per evidenziazioni
	"border": Color("#3D8A52"),         # Bordi
	"hover": Color("#5FB874"),          # Hover effects
	"disabled": Color("#2D6642")        # Elementi disabilitati
}

# 📺 TEMA CRT FOSFORI VERDI - Autentico Monitor Terminale Anni 80
const CRT_THEME = {
	"primary": Color("#00FF41"),        # Verde fosforoso brillante CRT
	"secondary": Color("#00CC33"),      # Verde fosforoso medio
	"bright": Color("#66FF66"),         # Verde fosforoso super brillante (glow)
	"dim": Color("#004411"),            # Verde fosforoso scuro 
	"background": Color("#000000"),     # Nero assoluto CRT
	"text": Color("#00FF41"),           # Testo verde fosforoso
	"accent": Color("#66FF66"),         # Accent ultra brillante
	"border": Color("#00FF41"),         # Bordi verdi fosforosi
	"hover": Color("#66FF66"),          # Glow intenso su hover
	"disabled": Color("#004411")        # Disabilitato molto scuro
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

# 🎥 CONTROLLO SHADER CRT - RIMOSSO (da reimplementare con Compositor)

# 📡 SEGNALI GLOBALI
signal theme_changed(theme_type: ThemeType)
signal colors_updated(colors: Dictionary)
signal crt_shader_toggled(enabled: bool)

# 🚀 INIZIALIZZAZIONE
func _ready():
	print("🎨 ThemeManager inizializzato - Tema: DEFAULT")
	set_theme(ThemeType.DEFAULT)
	# Configura sistema CRT dopo un frame per assicurarsi che la scena sia pronta
	call_deferred("setup_crt_control")

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
	
	# Gestione shader CRT - Sistema funzionale
	enable_crt_with_theme(theme_type)
	
	# Emetti segnali per aggiornamento globale
	theme_changed.emit(theme_type)
	colors_updated.emit(current_colors)
	
	print("✅ Tema applicato: %s" % ThemeType.keys()[theme_type])

func get_current_theme_type() -> ThemeType:
	"""Ritorna il tipo di tema corrente"""
	return current_theme_type

func apply_theme(theme_name: String) -> bool:
	"""Funzione helper per applicare tema da stringa (per compatibilità)"""
	match theme_name.to_lower():
		"standard", "default":
			set_theme(ThemeType.DEFAULT)
			return true
		"crt_pet", "crt_green", "crt":
			set_theme(ThemeType.CRT_GREEN)
			return true
		"high_contrast", "contrast":
			set_theme(ThemeType.HIGH_CONTRAST)
			return true
		_:
			print("⚠️ Tema non riconosciuto: %s" % theme_name)
			return false

# 🎨 API ACCESSO COLORI
func get_color(color_name: String) -> Color:
	"""Ritorna il colore specificato dal tema corrente"""
	if color_name in current_colors:
		return current_colors[color_name]
	else:
		print("⚠️ Colore non trovato: %s" % color_name)
		return current_colors["primary"]  # Fallback

# Funzioni di accesso diretto per i colori più comuni
func get_primary() -> Color:
	return get_color("primary")

func get_background() -> Color:
	return get_color("background")

func get_text() -> Color:
	return get_color("text")

func get_bright() -> Color:
	return get_color("bright")

func get_dim() -> Color:
	return get_color("dim")

func get_accent() -> Color:
	return get_color("accent")

func get_border() -> Color:
	return get_color("border")

func get_hover() -> Color:
	return get_color("hover")

func get_secondary() -> Color:
	return get_color("secondary")

func get_disabled() -> Color:
	return get_color("disabled")

# 🎮 UTILITÀ PER IL GIOCO
func is_crt_theme() -> bool:
	"""Controlla se il tema CRT è attivo (per effetti shader)"""
	return current_theme_type == ThemeType.CRT_GREEN

func is_high_contrast() -> bool:
	"""Controlla se il tema alto contrasto è attivo"""
	return current_theme_type == ThemeType.HIGH_CONTRAST

func get_theme_name() -> String:
	"""Ritorna il nome del tema corrente come stringa"""
	match current_theme_type:
		ThemeType.DEFAULT:
			return "Default"
		ThemeType.CRT_GREEN:
			return "CRT Fosfori Verdi"
		ThemeType.HIGH_CONTRAST:
			return "Alto Contrasto"
		_:
			return "Sconosciuto"

# 🎥 SISTEMA CRT SEMPLIFICATO E FUNZIONALE
var crt_display: ColorRect
var crt_material: ShaderMaterial
var is_crt_active: bool = false

func setup_crt_control():
	"""Trova e configura controllo CRT nella scena"""
	var main_scene = get_tree().current_scene
	if main_scene:
		crt_display = main_scene.get_node_or_null("CRTDisplay")
		if crt_display:
			print("✅ CRTDisplay trovato")
			# Il material verrà caricato manualmente in Godot
		else:
			print("⚠️ CRTDisplay non trovato nella scena")

func toggle_crt_shader() -> void:
	"""Attiva/disattiva effetto CRT"""
	if crt_display:
		is_crt_active = !is_crt_active
		crt_display.visible = is_crt_active
		print("🎥 CRT: %s" % ("ATTIVO" if is_crt_active else "DISATTIVO"))
		crt_shader_toggled.emit(is_crt_active)

func is_crt_shader_active() -> bool:
	"""Controlla se lo shader CRT è attualmente attivo"""
	return is_crt_active

func enable_crt_with_theme(theme_type: ThemeType):
	"""Attiva CRT automaticamente con tema CRT_GREEN"""
	if crt_display:
		var should_enable = (theme_type == ThemeType.CRT_GREEN)
		if should_enable != is_crt_active:
			toggle_crt_shader()

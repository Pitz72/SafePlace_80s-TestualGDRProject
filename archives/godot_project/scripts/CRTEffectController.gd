extends CanvasLayer
class_name CRTEffectController

# 📺 CONTROLLER EFFETTO CRT - SafePlace Theme System
# Gestisce l'applicazione automatica dell'effetto CRT quando il tema è attivo

# 🎛️ RIFERIMENTI UI
@onready var crt_overlay: ColorRect
@onready var theme_manager: ThemeManager

# 🖥️ MATERIALI E SHADER
var crt_material: ShaderMaterial
var crt_shader: Shader

# ⚙️ PARAMETRI EFFETTO ESPORTATI
@export_group("CRT Settings")
@export var auto_apply_with_theme: bool = true
@export var transition_duration: float = 0.5

@export_subgroup("Scanlines")
@export_range(0.0, 1.0) var scanline_intensity: float = 0.7
@export_range(0.0, 5.0) var scanline_speed: float = 2.0
@export_range(100.0, 800.0) var scanline_count: float = 400.0

@export_subgroup("Screen Curvature")
@export_range(0.0, 1.0) var curvature_x: float = 0.15
@export_range(0.0, 1.0) var curvature_y: float = 0.15
@export_range(0.0, 0.5) var barrel_distortion: float = 0.1

@export_subgroup("Color & Glow")
@export_range(0.0, 0.02) var chromatic_aberration: float = 0.005
@export_range(0.0, 2.0) var phosphor_glow: float = 1.2
@export_range(0.0, 2.0) var green_tint: float = 1.8

@export_subgroup("Display")
@export_range(0.0, 2.0) var brightness: float = 1.1
@export_range(0.0, 3.0) var contrast: float = 1.3
@export_range(0.0, 1.0) var vignette_intensity: float = 0.3

@export_subgroup("Dynamic Effects")
@export_range(0.0, 0.2) var noise_intensity: float = 0.03
@export_range(0.0, 0.1) var flicker_intensity: float = 0.02

# 📚 PRESETS PREDEFINITI
var presets: Dictionary = {
	"SafePlace_CRT": {
		"scanline_intensity": 0.7,
		"scanline_speed": 2.0,
		"scanline_count": 400.0,
		"curvature_x": 0.15,
		"curvature_y": 0.15,
		"barrel_distortion": 0.1,
		"chromatic_aberration": 0.005,
		"phosphor_glow": 1.2,
		"green_tint": 1.8,
		"brightness": 1.1,
		"contrast": 1.3,
		"vignette_intensity": 0.3,
		"noise_intensity": 0.03,
		"flicker_intensity": 0.02
	},
	"Retro_TV_80s": {
		"scanline_intensity": 0.9,
		"scanline_speed": 1.5,
		"scanline_count": 300.0,
		"curvature_x": 0.25,
		"curvature_y": 0.25,
		"barrel_distortion": 0.15,
		"chromatic_aberration": 0.01,
		"phosphor_glow": 1.5,
		"green_tint": 2.0,
		"brightness": 0.9,
		"contrast": 1.8,
		"vignette_intensity": 0.5,
		"noise_intensity": 0.08,
		"flicker_intensity": 0.05
	},
	"Arcade_Monitor": {
		"scanline_intensity": 0.6,
		"scanline_speed": 3.0,
		"scanline_count": 500.0,
		"curvature_x": 0.1,
		"curvature_y": 0.1,
		"barrel_distortion": 0.05,
		"chromatic_aberration": 0.003,
		"phosphor_glow": 1.0,
		"green_tint": 1.5,
		"brightness": 1.3,
		"contrast": 1.5,
		"vignette_intensity": 0.2,
		"noise_intensity": 0.01,
		"flicker_intensity": 0.01
	},
	"Modern_CRT": {
		"scanline_intensity": 0.4,
		"scanline_speed": 1.0,
		"scanline_count": 600.0,
		"curvature_x": 0.05,
		"curvature_y": 0.05,
		"barrel_distortion": 0.02,
		"chromatic_aberration": 0.001,
		"phosphor_glow": 0.8,
		"green_tint": 1.3,
		"brightness": 1.2,
		"contrast": 1.1,
		"vignette_intensity": 0.1,
		"noise_intensity": 0.005,
		"flicker_intensity": 0.005
	}
}

# 🏁 INIZIALIZZAZIONE
func _ready():
	_setup_crt_system()
	_connect_to_theme_manager()

func _setup_crt_system():
	"""Configura il sistema CRT overlay"""
	# Carica lo shader
	crt_shader = load("res://shaders/CRTEffect.gdshader")
	if not crt_shader:
		print("⚠️ Errore: Impossibile caricare CRTEffect.gdshader")
		return
	
	# Crea il materiale shader
	crt_material = ShaderMaterial.new()
	crt_material.shader = crt_shader
	
	# Configura il CanvasLayer per effetti screen-space
	layer = 100  # Sopra tutti gli altri layer
	
	# Crea il ColorRect per l'overlay
	crt_overlay = ColorRect.new()
	crt_overlay.name = "CRT_Overlay"
	crt_overlay.material = crt_material
	crt_overlay.mouse_filter = Control.MOUSE_FILTER_IGNORE
	
	# Configura per coprire tutto lo schermo automaticamente
	crt_overlay.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	
	# Imposta il ColorRect come trasparente per permettere l'effetto screen-space
	crt_overlay.color = Color.TRANSPARENT
	
	# Posiziona sopra tutto
	add_child(crt_overlay)
	
	# Assicurati che l'overlay copra tutto lo schermo
	call_deferred("_ensure_overlay_coverage")
	
	# Inizialmente disabilitato
	set_effect_enabled(false)
	
	print("✅ Sistema CRT inizializzato")

func _ensure_overlay_coverage():
	"""Assicura che l'overlay copra tutto lo schermo"""
	if crt_overlay:
		crt_overlay.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)

func _connect_to_theme_manager():
	"""Connette al ThemeManager per auto-attivazione"""
	# Usa call_deferred per assicurarsi che tutti gli autoload siano inizializzati
	call_deferred("_setup_theme_connection")

func _setup_theme_connection():
	"""Setup della connessione al ThemeManager (chiamato con call_deferred)"""
	theme_manager = get_node_or_null("/root/ThemeManager")
	if theme_manager:
		# Connetti al segnale se non già connesso
		if not theme_manager.theme_changed.is_connected(_on_theme_changed):
			theme_manager.theme_changed.connect(_on_theme_changed)
		# Applica tema corrente usando l'API corretta
		_on_theme_changed(theme_manager.get_current_theme_type())
		print("✅ CRT Effect connesso al ThemeManager")
	else:
		print("⚠️ ThemeManager non trovato - ritenterò...")
		# Riprova dopo un breve delay
		call_deferred("_retry_theme_connection")

func _retry_theme_connection():
	"""Riprova connessione al ThemeManager"""
	await get_tree().create_timer(0.1).timeout
	_setup_theme_connection()

# 🎨 GESTIONE TEMI
func _on_theme_changed(theme_type):
	"""Chiamato quando cambia il tema"""
	if not auto_apply_with_theme:
		return
	
	# Assicurati che theme_manager sia disponibile
	if not theme_manager:
		theme_manager = get_node_or_null("/root/ThemeManager")
		if not theme_manager:
			print("⚠️ ThemeManager non disponibile in _on_theme_changed")
			return
	
	# Ottieni il nome del tema dall'enum per debug
	var theme_name = theme_manager.ThemeType.keys()[theme_type]
	
	if theme_type == theme_manager.ThemeType.CRT_GREEN:
		print("🖥️ Attivando effetto CRT per tema:", theme_name)
		apply_preset("SafePlace_CRT")
		animate_effect_on()
	else:
		print("📱 Disattivando effetto CRT per tema:", theme_name)
		animate_effect_off()

# 🎛️ CONTROLLO EFFETTI
func set_effect_enabled(enabled: bool):
	"""Abilita/disabilita l'effetto CRT"""
	if crt_overlay and crt_material:
		crt_material.set_shader_parameter("enable_effect", enabled)
		crt_overlay.visible = enabled

func animate_effect_on():
	"""Animazione di attivazione dell'effetto"""
	if not crt_overlay:
		return
		
	set_effect_enabled(true)
	
	# Effetto "accensione TV"
	var tween = create_tween()
	tween.set_parallel(true)
	
	# Fade in generale
	crt_overlay.modulate.a = 0.0
	tween.tween_property(crt_overlay, "modulate:a", 1.0, transition_duration)
	
	# Simula accensione con flicker iniziale
	if crt_material:
		crt_material.set_shader_parameter("flicker_intensity", 0.3)
		tween.tween_method(_animate_flicker_down, 0.3, flicker_intensity, transition_duration * 1.5)

func animate_effect_off():
	"""Animazione di disattivazione dell'effetto"""
	if not crt_overlay:
		return
		
	var tween = create_tween()
	
	# Effetto "spegnimento TV" - fade rapido
	tween.tween_property(crt_overlay, "modulate:a", 0.0, transition_duration * 0.3)
	tween.tween_callback(func(): set_effect_enabled(false))

func _animate_flicker_down(value: float):
	"""Helper per animazione flicker"""
	if crt_material:
		crt_material.set_shader_parameter("flicker_intensity", value)

# 📚 SISTEMA PRESETS
func apply_preset(preset_name: String):
	"""Applica un preset predefinito"""
	if not preset_name in presets:
		print("⚠️ Preset non trovato:", preset_name)
		return
		
	var preset = presets[preset_name]
	
	# Applica tutti i parametri del preset
	for param in preset:
		set(param, preset[param])
	
	# Aggiorna lo shader
	_update_shader_parameters()
	
	print("✅ Preset applicato:", preset_name)

func animate_to_preset(preset_name: String, duration: float = 1.0):
	"""Anima la transizione verso un preset"""
	if not preset_name in presets:
		return
		
	var preset = presets[preset_name]
	var tween = create_tween()
	tween.set_parallel(true)
	
	# Anima ogni parametro
	for param in preset:
		var current_value = get(param)
		var target_value = preset[param]
		tween.tween_method(
			func(value): _set_and_update_parameter(param, value),
			current_value,
			target_value,
			duration
		)

func _set_and_update_parameter(param_name: String, value):
	"""Helper per aggiornamento parametri durante animazione"""
	set(param_name, value)
	_update_single_shader_parameter(param_name, value)

# 🔧 AGGIORNAMENTO SHADER
func _update_shader_parameters():
	"""Aggiorna tutti i parametri dello shader"""
	if not crt_material:
		return
		
	crt_material.set_shader_parameter("scanline_intensity", scanline_intensity)
	crt_material.set_shader_parameter("scanline_speed", scanline_speed)
	crt_material.set_shader_parameter("scanline_count", scanline_count)
	crt_material.set_shader_parameter("curvature_x", curvature_x)
	crt_material.set_shader_parameter("curvature_y", curvature_y)
	crt_material.set_shader_parameter("barrel_distortion", barrel_distortion)
	crt_material.set_shader_parameter("chromatic_aberration", chromatic_aberration)
	crt_material.set_shader_parameter("phosphor_glow", phosphor_glow)
	crt_material.set_shader_parameter("green_tint", green_tint)
	crt_material.set_shader_parameter("brightness", brightness)
	crt_material.set_shader_parameter("contrast", contrast)
	crt_material.set_shader_parameter("vignette_intensity", vignette_intensity)
	crt_material.set_shader_parameter("noise_intensity", noise_intensity)
	crt_material.set_shader_parameter("flicker_intensity", flicker_intensity)

func _update_single_shader_parameter(param_name: String, value):
	"""Aggiorna un singolo parametro dello shader"""
	if crt_material:
		crt_material.set_shader_parameter(param_name, value)

# 📏 RIDIMENSIONAMENTO AUTOMATICO
# Il ColorRect con PRESET_FULL_RECT si ridimensiona automaticamente
# Non serve gestione manuale in Godot 4.x

# 🎛️ API PUBBLICA
func toggle_effect():
	"""Toggle dell'effetto CRT"""
	var is_enabled = crt_material.get_shader_parameter("enable_effect") if crt_material else false
	set_effect_enabled(not is_enabled)

func reset_to_default():
	"""Reset ai valori di default"""
	apply_preset("SafePlace_CRT")

func get_available_presets() -> Array:
	"""Ritorna la lista dei presets disponibili"""
	return presets.keys()

# 🔧 DEBUG
func print_current_settings():
	"""Stampa le impostazioni correnti (debug)"""
	print("=== CRT Settings ===")
	print("Scanlines: ", scanline_intensity, " | Speed: ", scanline_speed)
	print("Curvature: ", curvature_x, "x", curvature_y)
	print("Glow: ", phosphor_glow, " | Tint: ", green_tint)
	print("===================") 
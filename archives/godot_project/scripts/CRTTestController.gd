extends Control

# 🧪 CONTROLLER SCENA TEST CRT - SafePlace Theme System
# Interfaccia per testare e regolare l'effetto CRT in tempo reale

# 🎛️ RIFERIMENTI UI
@onready var control_panel: Panel = $ControlPanel
@onready var effect_toggle: CheckBox = $ControlPanel/ScrollContainer/VBoxContainer/EffectToggle

# 📊 SLIDER CONTROLLI
@onready var scanlines_intensity: HSlider = $ControlPanel/ScrollContainer/VBoxContainer/ScanlinesIntensity
@onready var scanlines_speed: HSlider = $ControlPanel/ScrollContainer/VBoxContainer/ScanlinesSpeed
@onready var curvature_x: HSlider = $ControlPanel/ScrollContainer/VBoxContainer/CurvatureX
@onready var curvature_y: HSlider = $ControlPanel/ScrollContainer/VBoxContainer/CurvatureY
@onready var phosphor_glow: HSlider = $ControlPanel/ScrollContainer/VBoxContainer/PhosphorGlow
@onready var green_tint: HSlider = $ControlPanel/ScrollContainer/VBoxContainer/GreenTint
@onready var brightness: HSlider = $ControlPanel/ScrollContainer/VBoxContainer/Brightness

# 🖥️ RIFERIMENTO CRT CONTROLLER
var crt_controller: CRTEffectController

# 🏁 INIZIALIZZAZIONE
func _ready():
	# Ottieni riferimento al CRT controller (autoload)
	crt_controller = get_node("/root/CRTEffect")
	
	if crt_controller:
		print("✅ CRT Test Scene inizializzata")
		# Forza attivazione dell'effetto per il test
		crt_controller.set_effect_enabled(true)
		_sync_ui_with_controller()
	else:
		print("⚠️ CRTEffectController non trovato!")
	
	# Applica tema CRT temporaneamente per test
	var theme_manager = get_node("/root/ThemeManager")
	if theme_manager:
		theme_manager.set_theme("CRT")

# 🎮 INPUT HANDLING
func _input(event):
	if event.is_action_pressed("ui_cancel"):  # ESC
		_exit_test_scene()
	elif event is InputEventKey and event.pressed:
		if event.keycode == KEY_F1:
			_toggle_control_panel()

# 🎛️ GESTIONE CONTROLLI UI
func _toggle_control_panel():
	"""Toggle visibilità pannello controlli"""
	control_panel.visible = !control_panel.visible

func _sync_ui_with_controller():
	"""Sincronizza UI con valori correnti del controller"""
	if not crt_controller:
		return
		
	# Sincronizza sliders con valori correnti
	scanlines_intensity.value = crt_controller.scanline_intensity
	scanlines_speed.value = crt_controller.scanline_speed
	curvature_x.value = crt_controller.curvature_x
	curvature_y.value = crt_controller.curvature_y
	phosphor_glow.value = crt_controller.phosphor_glow
	green_tint.value = crt_controller.green_tint
	brightness.value = crt_controller.brightness
	
	# Sincronizza checkbox
	effect_toggle.button_pressed = true

func _exit_test_scene():
	"""Torna al menu principale"""
	get_tree().change_scene_to_file("res://scenes/MenuScreen.tscn")

# 🎛️ SIGNAL HANDLERS - TOGGLE EFFETTO
func _on_effect_toggle_toggled(toggled_on: bool):
	if crt_controller:
		crt_controller.set_effect_enabled(toggled_on)

# 📚 SIGNAL HANDLERS - PRESETS
func _on_safe_place_pressed():
	if crt_controller:
		crt_controller.animate_to_preset("SafePlace_CRT", 0.8)
		_sync_ui_with_controller()

func _on_retro_pressed():
	if crt_controller:
		crt_controller.animate_to_preset("Retro_TV_80s", 0.8)
		_sync_ui_with_controller()

func _on_arcade_pressed():
	if crt_controller:
		crt_controller.animate_to_preset("Arcade_Monitor", 0.8)
		_sync_ui_with_controller()

func _on_modern_pressed():
	if crt_controller:
		crt_controller.animate_to_preset("Modern_CRT", 0.8)
		_sync_ui_with_controller()

# 📊 SIGNAL HANDLERS - SLIDERS
func _on_scanlines_intensity_value_changed(value: float):
	if crt_controller:
		crt_controller.scanline_intensity = value
		crt_controller._update_single_shader_parameter("scanline_intensity", value)

func _on_scanlines_speed_value_changed(value: float):
	if crt_controller:
		crt_controller.scanline_speed = value
		crt_controller._update_single_shader_parameter("scanline_speed", value)

func _on_curvature_x_value_changed(value: float):
	if crt_controller:
		crt_controller.curvature_x = value
		crt_controller._update_single_shader_parameter("curvature_x", value)

func _on_curvature_y_value_changed(value: float):
	if crt_controller:
		crt_controller.curvature_y = value
		crt_controller._update_single_shader_parameter("curvature_y", value)

func _on_phosphor_glow_value_changed(value: float):
	if crt_controller:
		crt_controller.phosphor_glow = value
		crt_controller._update_single_shader_parameter("phosphor_glow", value)

func _on_green_tint_value_changed(value: float):
	if crt_controller:
		crt_controller.green_tint = value
		crt_controller._update_single_shader_parameter("green_tint", value)

func _on_brightness_value_changed(value: float):
	if crt_controller:
		crt_controller.brightness = value
		crt_controller._update_single_shader_parameter("brightness", value)

# 🎛️ SIGNAL HANDLERS - NAVIGATION
func _on_settings_pressed():
	"""Apre pannello controlli CRT"""
	_toggle_control_panel()

func _on_back_button_pressed():
	"""Chiude pannello controlli"""
	control_panel.visible = false

# 🔧 DEBUG UTILITIES
func _notification(what):
	if what == NOTIFICATION_WM_CLOSE_REQUEST:
		_exit_test_scene()

func print_current_state():
	"""Stampa stato corrente (per debug)"""
	if crt_controller:
		print("=== CRT Test State ===")
		crt_controller.print_current_settings()
		print("Panel visible: ", control_panel.visible)
		print("=====================") 
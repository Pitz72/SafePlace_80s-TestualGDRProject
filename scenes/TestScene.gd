extends Control

# 🧪 TEST SCENE - MILESTONE 0 TASK 1 + 2
# Verifica del setup del tema globale, font Perfect DOS VGA 437 e shader CRT

@onready var theme_info_label: Label = $VBoxContainer/ThemeInfo
@onready var test_button: Button = $VBoxContainer/ButtonTest
@onready var crt_info_label: Label = $VBoxContainer/CRTInfo

var auto_test_timer: Timer

func _ready():
	print("🧪 TestScene avviata - Milestone 0 Task 1+2")
	
	# Verifica che il ThemeManager sia disponibile
	if ThemeManager:
		print("✅ ThemeManager trovato")
		update_theme_info()
		update_crt_info()
		
		# Connetti ai segnali
		ThemeManager.theme_changed.connect(_on_theme_changed)
		ThemeManager.crt_shader_toggled.connect(_on_crt_shader_toggled)
	else:
		print("❌ ThemeManager non trovato - verificare Autoload")
	
	# Connetti il pulsante di test
	if test_button:
		test_button.pressed.connect(_on_test_button_pressed)
	
	# Setup timer per test automatici
	setup_auto_test_timer()

func update_theme_info():
	"""Aggiorna le informazioni del tema corrente"""
	if ThemeManager and theme_info_label:
		var theme_name = ThemeManager.get_theme_name()
		var primary_color = ThemeManager.get_primary()
		
		theme_info_label.text = "Tema Corrente: %s\nColore Principale: %s" % [
			theme_name,
			primary_color.to_html()
		]

func _on_theme_changed(theme_type):
	"""Callback per aggiornamento tema"""
	print("🎨 Tema cambiato: %s" % ThemeManager.ThemeType.keys()[theme_type])
	update_theme_info()
	update_crt_info()

func _on_crt_shader_toggled(enabled: bool):
	"""Callback per toggle shader CRT"""
	print("🎥 Shader CRT: %s" % ("ATTIVO" if enabled else "DISATTIVO"))
	update_crt_info()

func update_crt_info():
	"""Aggiorna le informazioni del sistema CRT"""
	if ThemeManager and crt_info_label:
		var is_active = ThemeManager.is_crt_shader_active()
		var is_crt_theme = ThemeManager.is_crt_theme()
		
		crt_info_label.text = "CRT Shader: %s\nTema CRT: %s" % [
			"ATTIVO" if is_active else "DISATTIVO",
			"SI" if is_crt_theme else "NO"
		]

func setup_auto_test_timer():
	"""Setup timer per test automatici shader CRT"""
	auto_test_timer = Timer.new()
	auto_test_timer.wait_time = 5.0
	auto_test_timer.timeout.connect(_auto_test_crt_effects)
	add_child(auto_test_timer)
	auto_test_timer.start()
	print("🧪 Timer test automatici CRT attivato (5 secondi)")

func _auto_test_crt_effects():
	"""Test automatici degli effetti CRT"""
	if ThemeManager:
		print("🧪 Test automatico effetti CRT...")
		
		# Test toggle manuale shader
		ThemeManager.toggle_crt_shader()
		
		# Riavvia timer per prossimo test
		auto_test_timer.start()

func _on_test_button_pressed():
	"""Test del cambio tema"""
	if ThemeManager:
		# Cicla tra i temi disponibili
		var current_type = ThemeManager.get_current_theme_type()
		match current_type:
			ThemeManager.ThemeType.DEFAULT:
				ThemeManager.set_theme(ThemeManager.ThemeType.CRT_GREEN)
			ThemeManager.ThemeType.CRT_GREEN:
				ThemeManager.set_theme(ThemeManager.ThemeType.HIGH_CONTRAST)
			ThemeManager.ThemeType.HIGH_CONTRAST:
				ThemeManager.set_theme(ThemeManager.ThemeType.DEFAULT)

func _input(event):
	"""Test input per verificare funzionalità"""
	if event.is_action_pressed("ui_accept"):
		_on_test_button_pressed()
	elif event.is_action_pressed("ui_cancel"):
		get_tree().quit()

# 🧪 METODI DI TEST AUTOMATICI
func test_theme_manager():
	"""Test automatico del ThemeManager"""
	print("🧪 Avvio test ThemeManager...")
	
	if not ThemeManager:
		print("❌ FAIL: ThemeManager non disponibile")
		return false
	
	# Test cambio temi
	ThemeManager.set_theme(ThemeManager.ThemeType.DEFAULT)
	if ThemeManager.get_current_theme_type() != ThemeManager.ThemeType.DEFAULT:
		print("❌ FAIL: Tema DEFAULT non applicato")
		return false
	
	ThemeManager.set_theme(ThemeManager.ThemeType.CRT_GREEN)
	if ThemeManager.get_current_theme_type() != ThemeManager.ThemeType.CRT_GREEN:
		print("❌ FAIL: Tema CRT_GREEN non applicato")
		return false
	
	ThemeManager.set_theme(ThemeManager.ThemeType.HIGH_CONTRAST)
	if ThemeManager.get_current_theme_type() != ThemeManager.ThemeType.HIGH_CONTRAST:
		print("❌ FAIL: Tema HIGH_CONTRAST non applicato")
		return false
	
	# Test funzione apply_theme
	if not ThemeManager.apply_theme("standard"):
		print("❌ FAIL: apply_theme('standard') non funziona")
		return false
	
	print("✅ SUCCESS: Tutti i test ThemeManager passati")
	return true 

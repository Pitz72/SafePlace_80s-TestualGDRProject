extends Control

# 🧪 TEST SCENE - MILESTONE 0 TASK 1
# Verifica del setup del tema globale e del font Perfect DOS VGA 437

@onready var theme_info_label: Label = $VBoxContainer/ThemeInfo
@onready var test_button: Button = $VBoxContainer/ButtonTest

func _ready():
	print("🧪 TestScene avviata - Milestone 0 Task 1")
	
	# Verifica che il ThemeManager sia disponibile
	if ThemeManager:
		print("✅ ThemeManager trovato")
		update_theme_info()
		
		# Connetti al segnale di cambio tema
		ThemeManager.theme_changed.connect(_on_theme_changed)
	else:
		print("❌ ThemeManager non trovato - verificare Autoload")
	
	# Connetti il pulsante di test
	if test_button:
		test_button.pressed.connect(_on_test_button_pressed)

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

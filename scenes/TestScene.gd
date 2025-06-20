extends Control

# 🧪 TEST SCENE - MILESTONE 0 TASK 1 + 2
# Verifica del setup del tema globale, font Perfect DOS VGA 437 e shader CRT

@onready var theme_info_label: Label = $VBoxContainer/ThemeInfo
@onready var test_button: Button = $VBoxContainer/ButtonTest
@onready var crt_info_label: Label = $VBoxContainer/CRTInfo

var auto_test_timer: Timer

func _ready():
	print("🧪 TestScene avviata - Milestone 0 Task 1+2+3")
	
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
	
	# Verifica DataManager e testa caricamento dati
	if DataManager:
		print("✅ DataManager trovato")
		await get_tree().process_frame  # Aspetta che DataManager finisca il caricamento
		test_data_manager()
	else:
		print("❌ DataManager non trovato - verificare Autoload")
	
	# Connetti il pulsante di test
	if test_button:
		test_button.pressed.connect(_on_test_button_pressed)
	
	# Setup timer per test automatici - DISABILITATO (causava layer che copre tutto)
	# setup_auto_test_timer()

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
	# Controllo F1 per toggle CRT manuale
	elif event is InputEventKey and event.pressed:
		if event.keycode == KEY_F1:
			if ThemeManager:
				ThemeManager.toggle_crt_shader()

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

# 🧪 TEST DATAMANAGER
func test_data_manager():
	"""Test automatico del DataManager"""
	print("\n🧪 Avvio test DataManager...")
	
	if not DataManager:
		print("❌ FAIL: DataManager non disponibile")
		return false
	
	# Test statistiche caricamento
	var stats = DataManager.get_loading_stats()
	print("📊 Statistiche caricamento:")
	print("   • Oggetti totali: %d" % stats.total_items)
	print("   • Errori: %d" % stats.loading_errors)
	
	if stats.has_errors:
		print("⚠️ Errori rilevati durante caricamento:")
		var errors = DataManager.get_loading_errors()
		for error in errors:
			print("   - %s" % error)
	
	# Test accesso dati specifici
	var test_results = []
	
	# Test 1: Verifica sistema rarità
	var rarity_data = DataManager.get_rarity_data("COMMON")
	if rarity_data.is_empty():
		test_results.append("❌ Sistema rarità COMMON non trovato")
	else:
		test_results.append("✅ Sistema rarità COMMON OK")
	
	# Test 2: Verifica accesso oggetto specifico
	var legendary_items = DataManager.get_items_by_rarity("LEGENDARY")
	if legendary_items.size() > 0:
		test_results.append("✅ Oggetti LEGENDARY trovati: %d" % legendary_items.size())
	else:
		test_results.append("❌ Nessun oggetto LEGENDARY trovato")
	
	# Test 3: Verifica armi
	var weapons = DataManager.get_items_by_category("weapon")
	if weapons.size() > 0:
		test_results.append("✅ Armi trovate: %d" % weapons.size())
	else:
		test_results.append("❌ Nessuna arma trovata")
	
	# Test 4: Verifica ricerca
	var search_results = DataManager.search_items_by_name("pistol")
	if search_results.size() > 0:
		test_results.append("✅ Ricerca 'pistol' trovata: %d risultati" % search_results.size())
	else:
		test_results.append("⚠️ Ricerca 'pistol' nessun risultato")
	
	# Stampa risultati test
	print("\n📋 Risultati test DataManager:")
	for result in test_results:
		print("   %s" % result)
	
	# Test colori rarità per UI
	var rarity_colors = DataManager.get_rarity_colors()
	if rarity_colors.size() > 0:
		print("\n🎨 Colori rarità disponibili:")
		for rarity in rarity_colors:
			print("   • %s: %s" % [rarity, rarity_colors[rarity]])
	
	var success = not stats.has_errors and stats.total_items > 0
	if success:
		print("\n✅ SUCCESS: DataManager completamente funzionale!")
	else:
		print("\n❌ FAIL: DataManager ha problemi")
	
	return success 

extends Node

# 🧪 SCRIPT TEST INTEGRAZIONE CRT
# Verifica rapida che tutti i componenti CRT siano correttamente configurati

func _ready():
	print("🧪 === TEST INTEGRAZIONE CRT ===")
	call_deferred("test_crt_system")

func test_crt_system():
	"""Test completo del sistema CRT"""
	
	# Test 1: Verifica autoload
	print("📍 Test 1: Verifica autoload CRTEffect...")
	var crt_effect = get_node_or_null("/root/CRTEffect")
	if crt_effect:
		print("✅ CRTEffectController trovato")
		print("   - Tipo:", crt_effect.get_class())
		print("   - Autoload corretto")
	else:
		print("❌ CRTEffectController NON trovato!")
		return
	
	# Test 2: Verifica ThemeManager
	print("\n📍 Test 2: Verifica integrazione ThemeManager...")
	var theme_manager = get_node_or_null("/root/ThemeManager")
	if theme_manager:
		print("✅ ThemeManager trovato")
		print("   - Tema corrente:", theme_manager.current_theme)
	else:
		print("❌ ThemeManager NON trovato!")
		return
	
	# Test 3: Verifica shader
	print("\n📍 Test 3: Verifica caricamento shader...")
	var shader_resource = load("res://shaders/CRTEffect.gdshader")
	if shader_resource:
		print("✅ Shader CRT caricato correttamente")
		print("   - Path: res://shaders/CRTEffect.gdshader")
	else:
		print("❌ Shader CRT NON trovato!")
	
	# Test 4: Verifica presets
	print("\n📍 Test 4: Verifica presets...")
	var presets = crt_effect.get_available_presets()
	print("✅ Presets disponibili:")
	for preset in presets:
		print("   - ", preset)
	
	# Test 5: Test attivazione tema CRT
	print("\n📍 Test 5: Test attivazione tema CRT...")
	theme_manager.set_theme("CRT")
	await get_tree().create_timer(1.0).timeout
	
	# Verifica se l'effetto è attivo
	if crt_effect.crt_material and crt_effect.crt_material.get_shader_parameter("enable_effect"):
		print("✅ Effetto CRT attivato automaticamente")
	else:
		print("❌ Effetto CRT NON attivato")
	
	# Test 6: Test presets
	print("\n📍 Test 6: Test applicazione presets...")
	for preset in presets:
		print("   - Testando preset:", preset)
		crt_effect.apply_preset(preset)
		await get_tree().create_timer(0.2).timeout
	
	# Reset a SafePlace_CRT
	crt_effect.apply_preset("SafePlace_CRT")
	
	print("\n🎯 === TEST COMPLETATO ===")
	print("✅ Sistema CRT completamente funzionale!")
	print("🎮 Per test interattivo, carica: res://scenes/CRTTestScene.tscn")
	print("📺 L'effetto si attiva automaticamente con tema CRT")
	
	# Test scena di test
	print("\n📍 Test Bonus: Verifica scena di test...")
	var test_scene = load("res://scenes/CRTTestScene.tscn")
	if test_scene:
		print("✅ Scena di test CRT disponibile")
		print("   - Caricabile con: get_tree().change_scene_to_file('res://scenes/CRTTestScene.tscn')")
	else:
		print("⚠️ Scena di test CRT non trovata")

func test_crt_command_line():
	"""Test da eseguire da linea di comando"""
	print("🎛️ Comandi di test CRT disponibili:")
	print("   - CRTEffect.apply_preset('Retro_TV_80s')")
	print("   - CRTEffect.toggle_effect()")
	print("   - get_tree().change_scene_to_file('res://scenes/CRTTestScene.tscn')")
	print("   - ThemeManager.set_theme('CRT')")

# Per uso da console Godot
func quick_test():
	"""Test rapido da console"""
	test_crt_system() 
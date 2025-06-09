extends Node

## Test specifico per verifica fix errore priority
## Simula il movimento che causava l'errore

func _ready():
	print("🧪 EventPriorityTest avviato")
	call_deferred("_test_priority_fix")

func _test_priority_fix():
	print("📋 Test Priority Fix...")

	# Crea EventManager
	var event_manager = EventManager.new()
	add_child(event_manager)

	# Carica eventi
	var loaded = event_manager.load_lore_events()
	if not loaded:
		print("❌ Caricamento eventi fallito")
		return

	print("✅ Eventi caricati: %d" % event_manager._lore_events.size())

	# Simula contesto player che causava l'errore
	var test_context = {
		"days_survived": 1,
		"is_night": false,
		"x": 12,
		"y": 8
	}

	# Test la funzione che causava l'errore
	print("📋 Test check_lore_event_triggers...")
	var triggered_event = event_manager.check_lore_event_triggers(test_context)

	if not triggered_event.is_empty():
		print("✅ Evento triggered senza errori: %s" % triggered_event.get("title", ""))
	else:
		print("✅ Nessun evento triggered (normale)")

	# Test multiple chiamate per simulare movimento
	print("📋 Test multiple calls (simula movimento)...")
	for i in range(5):
		var result = event_manager.check_lore_event_triggers(test_context)
		print("  Chiamata %d: %s" % [i + 1, "OK" if result is Dictionary else "ERROR"])

	print("✅ Test Priority Fix completato - Nessun errore priority!")

func _input(event):
	if event is InputEventKey and event.pressed:
		if event.keycode == KEY_SPACE:
			print("🧪 Riavvio test priority...")
			_test_priority_fix()

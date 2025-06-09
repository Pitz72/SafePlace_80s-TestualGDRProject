extends Node

## Test semplificato per verificare sistema eventi lore
## Senza dipendenze da GameManager per isolate eventuali problemi

func _ready():
	print("🧪 SimpleEventTest avviato")
	call_deferred("_test_basic_functionality")

func _test_basic_functionality():
	print("📋 Test 1: EventManager standalone...")

	# Test EventManager in isolamento
	var event_manager = EventManager.new()
	add_child(event_manager)

	if event_manager:
		print("✅ EventManager creato")

		# Test caricamento eventi
		var loaded = event_manager.load_lore_events()
		if loaded:
			print("✅ Eventi lore caricati: %d" % event_manager._lore_events.size())

			# Test primo evento
			if event_manager._lore_events.size() > 0:
				var first_event = event_manager._lore_events[0]
				print("✅ Primo evento: %s" % first_event.get("title", ""))
			else:
				print("❌ Nessun evento disponibile")
		else:
			print("❌ Caricamento eventi fallito")
	else:
		print("❌ EventManager non creato")

	print("📋 Test completato - Check console per errori")

func _input(event):
	if event is InputEventKey and event.pressed:
		if event.keycode == KEY_SPACE:
			print("🧪 Riavvio test...")
			_test_basic_functionality()

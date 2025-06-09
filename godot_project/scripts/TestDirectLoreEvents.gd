extends Node

## Test diretto sistema eventi lore
## Per identificare esattamente dove è il problema

func _ready():
	print("🧪 === TEST DIRETTO EVENTI LORE ===")

	# Test 1: Crea EventManager standalone
	print("\n1️⃣ Test EventManager standalone...")
	var event_manager = EventManager.new()

	if not event_manager:
		print("❌ FALLITO: Impossibile creare EventManager")
		return
	print("✅ EventManager creato")

	# Test 2: Carica eventi lore
	print("\n2️⃣ Test caricamento eventi lore...")
	var load_success = event_manager.load_lore_events()

	if not load_success:
		print("❌ FALLITO: Caricamento eventi lore")
		return
	print("✅ Eventi lore caricati")

	# Test 3: Verifica stato iniziale
	print("\n3️⃣ Test stato iniziale...")
	var stats = event_manager.get_lore_stats()
	print("📊 Statistiche: %s" % str(stats))

	# Test 4: Test trigger primo evento
	print("\n4️⃣ Test trigger primo evento...")
	var player_context = {
		"days_survived": 1,
		"is_night": false,
		"x": 12,
		"y": 8
	}

	print("🎯 Player context: %s" % str(player_context))
	var triggered_event = event_manager.check_lore_event_triggers(player_context)

	if triggered_event.is_empty():
		print("❌ FALLITO: Nessun evento triggerato")
		print("🔍 Debug sequenza corrente...")
		event_manager.debug_lore_sequence()
	else:
		print("✅ SUCCESSO: Evento triggerato: %s" % triggered_event.get("title", ""))

		# Test 5: Trigger effettivo
		print("\n5️⃣ Test trigger effettivo...")
		var trigger_success = event_manager.trigger_lore_event(triggered_event)
		if trigger_success:
			print("✅ SUCCESSO: Evento triggerato con successo")
		else:
			print("❌ FALLITO: Trigger evento fallito")

	print("\n🏁 === TEST COMPLETATO ===")

	# Esci dopo 2 secondi
	await get_tree().create_timer(2.0).timeout
	get_tree().quit()

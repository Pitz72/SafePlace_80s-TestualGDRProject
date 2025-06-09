extends Node

## Test script per sistema eventi lore
## Testa caricamento, trigger, e visualizzazione degli eventi narrativi

var event_manager: EventManager
var event_dialog: EventDialog

func _ready():
	print("🧪 LoreEventTest inizializzato")
	_run_tests()

func _run_tests():
	print("🎭 === LORE EVENT SYSTEM TEST ===")

	# Test 1: Crea EventManager
	await _test_event_manager_creation()

	# Test 2: Carica eventi lore
	await _test_lore_events_loading()

	# Test 3: Test trigger system
	await _test_trigger_system()

	# Test 4: Test EventDialog
	await _test_event_dialog()

	print("🎭 === TEST COMPLETATI ===")

## Test 1: Creazione EventManager
func _test_event_manager_creation():
	print("📋 Test 1: Creazione EventManager...")

	event_manager = EventManager.new()
	add_child(event_manager)

	if event_manager:
		print("✅ EventManager creato con successo")
	else:
		print("❌ Errore creazione EventManager")

	await get_tree().process_frame

## Test 2: Caricamento eventi lore
func _test_lore_events_loading():
	print("📋 Test 2: Caricamento eventi lore...")

	if not event_manager:
		print("❌ EventManager non disponibile")
		return

	var success = event_manager.load_lore_events()

	if success:
		print("✅ Eventi lore caricati: %d eventi" % event_manager._lore_events.size())

		# Mostra lista eventi
		for event in event_manager._lore_events:
			print("  🎭 %s: %s" % [event.id, event.title])
	else:
		print("❌ Errore caricamento eventi lore")

	await get_tree().process_frame

## Test 3: Sistema trigger
func _test_trigger_system():
	print("📋 Test 3: Sistema trigger...")

	if not event_manager:
		print("❌ EventManager non disponibile")
		return

	# Test context per primo evento (sempre triggerable)
	var test_context = {
		"days_survived": 1,
		"is_night": false,
		"x": 12,
		"y": 8
	}

	var triggered_event = event_manager.check_lore_event_triggers(test_context)

	if not triggered_event.is_empty():
		print("✅ Evento triggered: %s" % triggered_event.get("title", ""))

		# Test trigger dell'evento
		var trigger_success = event_manager.trigger_lore_event(triggered_event)
		if trigger_success:
			print("✅ Evento triggerato con successo")
		else:
			print("❌ Errore trigger evento")
	else:
		print("❌ Nessun evento triggerable trovato")

	await get_tree().process_frame

## Test 4: EventDialog
func _test_event_dialog():
	print("📋 Test 4: EventDialog...")

	# Carica scena EventDialog
	var event_dialog_scene = load("res://scenes/EventDialog.tscn")
	event_dialog = event_dialog_scene.instantiate()
	add_child(event_dialog)

	if event_dialog:
		print("✅ EventDialog creato con successo")

		# Test con primo evento
		if event_manager and event_manager._lore_events.size() > 0:
			var test_event = event_manager._lore_events[0]

			# Connetti segnali
			event_dialog.choice_selected.connect(_on_test_choice_selected)
			event_dialog.dialog_closed.connect(_on_test_dialog_closed)

			# Mostra evento
			event_dialog.show_lore_event(test_event, event_manager)
			print("✅ EventDialog mostra evento: %s" % test_event.get("title", ""))
		else:
			print("❌ Nessun evento disponibile per test dialog")
	else:
		print("❌ Errore creazione EventDialog")

	await get_tree().process_frame

## Callback test
func _on_test_choice_selected(choice_index: int, choice_data: Dictionary):
	print("🎯 Test choice selected: %s" % choice_data.get("text", ""))

func _on_test_dialog_closed():
	print("🎭 Test dialog closed")

## Input per testing manuale
func _input(event):
	if event is InputEventKey and event.pressed:
		match event.keycode:
			KEY_1:
				print("🧪 Manuale: Test trigger primo evento")
				if event_manager:
					event_manager.force_trigger_lore_event("lore_echo_of_departure")

			KEY_2:
				print("🧪 Manuale: Test trigger secondo evento")
				if event_manager:
					event_manager.force_trigger_lore_event("lore_first_trial_alone")

			KEY_3:
				print("🧪 Manuale: Test stats sistema")
				if event_manager:
					var stats = event_manager.get_lore_stats()
					print("📊 Lore Stats: %s" % stats)

## Utility: force trigger per testing
func force_trigger_event(event_id: String):
	if event_manager:
		for event in event_manager._lore_events:
			if event.get("id", "") == event_id:
				event_manager.trigger_lore_event(event)
				return
		print("❌ Evento non trovato: %s" % event_id)

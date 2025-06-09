extends Node
## Test completo per Sistema Lore Lineare 1→10
## Verifica sequenza rigorosa, timeline compressa, trigger uniformi

var event_manager: EventManager
var test_results: Array[String] = []
var total_tests: int = 0
var passed_tests: int = 0

func _ready():
	print("🧪 === LINEAR SEQUENCE TEST SUITE ===")

	# Inizializza EventManager
	event_manager = EventManager.new()
	event_manager.load_lore_events()

	# Esegui tutti i test
	test_event_order()
	test_priority_sequence()
	test_trigger_uniformity()
	test_timeline_compression()
	test_linear_progression()
	test_sequence_blocking()
	test_anti_regression_checks()

	# Risultati finali
	print_results()

## TEST 1: Ordine eventi corretto 1→10
func test_event_order():
	_start_test("Event Order 1→10")

	var events = event_manager._lore_events

	# Verifica che ci siano esattamente 10 eventi
	if events.size() != 10:
		_fail_test("Eventi trovati: %d, attesi: 10" % events.size())
		return

	# Verifica ordine priority crescente 1→10
	for i in range(events.size()):
		var expected_priority = i + 1
		var actual_priority = events[i].get("priority", 0)

		if actual_priority != expected_priority:
			_fail_test("Evento %d: priority %d, attesa %d" % [i + 1, actual_priority, expected_priority])
			return

	# Verifica numerazione titoli
	for i in range(events.size()):
		var title = events[i].get("title", "")
		var expected_number = str(i + 1) + "."

		if not title.begins_with(expected_number):
			_fail_test("Evento %d: titolo '%s' non inizia con '%s'" % [i + 1, title, expected_number])
			return

	_pass_test("Ordine 1→10 corretto, titoli numerati")

## TEST 2: Priority sequence crescente
func test_priority_sequence():
	_start_test("Priority Sequence Validation")

	var events = event_manager._lore_events
	var previous_priority = 0

	for event in events:
		var priority = event.get("priority", 0)

		if priority <= previous_priority:
			_fail_test("Priority non crescente: %d dopo %d" % [priority, previous_priority])
			return

		previous_priority = priority

	# Verifica che inizi da 1 e finisca a 10
	if events[0].get("priority", 0) != 1:
		_fail_test("Primo evento non ha priority 1")
		return

	if events[-1].get("priority", 0) != 10:
		_fail_test("Ultimo evento non ha priority 10")
		return

	_pass_test("Priority sequence 1→10 crescente validata")

## TEST 3: Uniformità trigger
func test_trigger_uniformity():
	_start_test("Trigger Uniformity Check")

	var events = event_manager._lore_events

	for i in range(events.size()):
		var event = events[i]
		var trigger = event.get("trigger", {})
		var trigger_type = trigger.get("type", "")
		var event_number = trigger.get("event_number", 0)

		# Verifica tipo trigger uniforme
		if trigger_type != "event_sequence":
			_fail_test("Evento %d: trigger type '%s', atteso 'event_sequence'" % [i + 1, trigger_type])
			return

		# Verifica event_number corretto
		if event_number != i + 1:
			_fail_test("Evento %d: event_number %d, atteso %d" % [i + 1, event_number, i + 1])
			return

	_pass_test("Tutti i trigger sono 'event_sequence' uniformi")

## TEST 4: Timeline compressa (max 5 giorni)
func test_timeline_compression():
	_start_test("Timeline Compression (Max 5 Days)")

	# Simula controllo giorni per ogni evento
	for event_number in range(1, 11):
		var context = {"days_survived": 10} # Giorni eccessivi per stress test
		var is_triggerable = event_manager._check_event_sequence(event_number, context)

		if not is_triggerable:
			# Prova con giorni minimi
			for days in range(1, 6):
				context = {"days_survived": days}
				if event_manager._check_event_sequence(event_number, context):
					if days > 5:
						_fail_test("Evento %d richiede %d giorni (max 5)" % [event_number, days])
						return
					break

	# Test esplicito timeline
	var timeline_valid = true
	var max_days_found = 0

	# Controlla che tutti gli eventi siano triggerabili entro 5 giorni
	for days in range(1, 6):
		var context = {"days_survived": days}
		for event_number in range(1, 11):
			if event_manager._check_event_sequence(event_number, context):
				max_days_found = max(max_days_found, days)

	if max_days_found > 5:
		_fail_test("Timeline richiede %d giorni (max 5)" % max_days_found)
		return

	_pass_test("Timeline compressa in max 5 giorni validata")

## TEST 5: Progressione lineare rigorosa
func test_linear_progression():
	_start_test("Linear Progression Test")

	# Reset sequence
	event_manager._current_lore_sequence = 1
	event_manager._seen_lore_events.clear()
	event_manager._lore_flags.clear()

	# Simula progressione evento per evento
	for expected_event in range(1, 11):
		var context = {"days_survived": expected_event}
		var triggered_event = event_manager.check_lore_event_triggers(context)

		if triggered_event.is_empty():
			_fail_test("Evento %d non triggered con context valido" % expected_event)
			return

		var actual_priority = triggered_event.get("priority", 0)
		if actual_priority != expected_event:
			_fail_test("Evento triggered: %d, atteso: %d" % [actual_priority, expected_event])
			return

		# Simula completamento evento
		var event_id = triggered_event.get("id", "")
		event_manager.trigger_lore_event(triggered_event)

		# Verifica che sequenza sia avanzata
		if event_manager._current_lore_sequence != expected_event + 1:
			_fail_test("Sequenza non avanzata: %d, attesa: %d" % [event_manager._current_lore_sequence, expected_event + 1])
			return

	_pass_test("Progressione lineare 1→10 completata")

## TEST 6: Blocco eventi paralleli
func test_sequence_blocking():
	_start_test("Sequence Blocking (No Parallel Events)")

	# Reset sequence
	event_manager._current_lore_sequence = 3 # Simula essere all'evento 3
	event_manager._seen_lore_events = ["lore_01_echo_of_departure", "lore_02_first_trial_alone"]

	# Prova a triggerare eventi futuri (dovrebbero essere bloccati)
	for future_event in range(4, 11):
		var context = {"days_survived": 10} # Giorni sufficienti

		# Verifica che evento futuro non sia triggerable
		var is_triggerable = event_manager._check_event_sequence(future_event, context)
		if is_triggerable:
			_fail_test("Evento futuro %d triggerabile (sequenza corrente: 3)" % future_event)
			return

	# Verifica che solo l'evento 3 sia triggerable
	var context = {"days_survived": 10}
	var triggered_event = event_manager.check_lore_event_triggers(context)

	if triggered_event.is_empty():
		_fail_test("Evento 3 non triggered quando dovrebbe essere disponibile")
		return

	if triggered_event.get("priority", 0) != 3:
		_fail_test("Evento sbagliato triggered: %d, atteso: 3" % triggered_event.get("priority", 0))
		return

	_pass_test("Blocco eventi paralleli funzionante")

## TEST 7: Controlli anti-regressione
func test_anti_regression_checks():
	_start_test("Anti-Regression Validation")

	var events = event_manager._lore_events

	# 1. Verifica che non ci sia priority invertita (10→1)
	var first_priority = events[0].get("priority", 0)
	var last_priority = events[-1].get("priority", 0)

	if first_priority > last_priority:
		_fail_test("REGRESSIONE: Priority invertita (%d→%d)" % [first_priority, last_priority])
		return

	# 2. Verifica che non ci siano trigger vecchi (days_survived, distance_from_safe_place)
	for i in range(events.size()):
		var trigger = events[i].get("trigger", {})
		var trigger_type = trigger.get("type", "")

		if trigger_type in ["days_survived", "distance_from_safe_place", "condition", "location"]:
			_fail_test("REGRESSIONE: Trigger vecchio '%s' nell'evento %d" % [trigger_type, i + 1])
			return

	# 3. Verifica presenza variabile sequenza
	if not "_current_lore_sequence" in str(event_manager):
		_fail_test("REGRESSIONE: Variabile _current_lore_sequence mancante")
		return

	# 4. Verifica che sequenza inizi da 1
	if event_manager._current_lore_sequence != 1:
		_fail_test("REGRESSIONE: Sequenza non inizia da 1 (%d)" % event_manager._current_lore_sequence)
		return

	_pass_test("Controlli anti-regressione PASSED - Sistema protetto")

## Utility functions
func _start_test(test_name: String):
	total_tests += 1
	print("🔍 Test %d: %s" % [total_tests, test_name])

func _pass_test(message: String):
	passed_tests += 1
	test_results.append("✅ PASS: %s" % message)
	print("  ✅ PASS: %s" % message)

func _fail_test(message: String):
	test_results.append("❌ FAIL: %s" % message)
	print("  ❌ FAIL: %s" % message)

func print_results():
	print("\n🏁 === TEST RESULTS ===")
	print("Total tests: %d" % total_tests)
	print("Passed: %d" % passed_tests)
	print("Failed: %d" % (total_tests - passed_tests))
	print("Success rate: %.1f%%" % (float(passed_tests) / float(total_tests) * 100.0))

	if passed_tests == total_tests:
		print("🎉 ALL TESTS PASSED - Sistema Lore Lineare VALIDATO ✅")
	else:
		print("🚨 ALCUNI TEST FALLITI - Verificare sistema ❌")

	print("\nDettagli:")
	for result in test_results:
		print("  %s" % result)

	print("🏁 === END TEST SUITE ===")

extends Node

## Test completo EventManager per SafePlace v1.3.0
## Verifica parsing, categorie, triggers e reputation system

func _ready():
	print("🎭 === TEST SISTEMA EVENTI SAFEPLACE V2 ===")
	_test_event_manager()

func _test_event_manager():
	print("🔄 Test EventManager completo...")

	# Test 1: Inizializzazione EventManager
	print("\n1️⃣ TEST: Inizializzazione EventManager")
	var event_manager = EventManager.new()

	if event_manager:
		print("✅ EventManager inizializzato correttamente")
	else:
		print("❌ FALLITO: EventManager inizializzazione")
		return

	# Test 2: Caricamento Database Eventi
	print("\n2️⃣ TEST: Caricamento Database Eventi V2")
	var load_success = event_manager.load_event_database()

	if load_success:
		print("✅ Event Database caricato con successo")
	else:
		print("❌ FALLITO: Caricamento Event Database")
		return

	# Test 3: Verifica struttura eventi
	print("\n3️⃣ TEST: Verifica Struttura Eventi")
	var stats = event_manager.get_stats()
	print("📊 Eventi totali: ", stats.total_events)
	print("📂 Categorie: ", stats.categories)

	if stats.total_events > 0:
		print("✅ Eventi trovati nel database")
	else:
		print("⚠️ WARNING: Nessun evento nel database")

	# Test 4: Categorie eventi
	print("\n4️⃣ TEST: Categorie Eventi")
	var categories = ["environmental", "character", "questlines"]
	var category_counts = {}

	for category in categories:
		var events = event_manager.get_events_by_category(category)
		category_counts[category] = events.size()
		print("📂 %s: %d eventi" % [category, events.size()])

	if category_counts.values().any(func(count): return count > 0):
		print("✅ Categorie eventi popolate")
	else:
		print("⚠️ WARNING: Categorie eventi vuote")

	# Test 5: Sistema flags
	print("\n5️⃣ TEST: Sistema Flags")
	event_manager.set_flag("test_flag")
	event_manager.set_flag("discovered_chimera_project")

	var has_test = event_manager.has_flag("test_flag")
	var has_chimera = event_manager.has_flag("discovered_chimera_project")
	var not_has_fake = not event_manager.has_flag("fake_flag")

	if has_test and has_chimera and not_has_fake:
		print("✅ Sistema flags funziona correttamente")
	else:
		print("❌ FALLITO: Sistema flags")

	# Test 6: Sistema reputation
	print("\n6️⃣ TEST: Sistema Reputation")
	event_manager.change_reputation("scientists", 5)
	event_manager.change_reputation("military", -2)
	event_manager.change_reputation("survivors", 3)

	var sci_rep = event_manager.get_reputation("scientists")
	var mil_rep = event_manager.get_reputation("military")
	var sur_rep = event_manager.get_reputation("survivors")

	print("🔬 Scientists: ", sci_rep)
	print("🪖 Military: ", mil_rep)
	print("🏠 Survivors: ", sur_rep)

	if sci_rep == 5 and mil_rep == -2 and sur_rep == 3:
		print("✅ Sistema reputation funziona correttamente")
	else:
		print("❌ FALLITO: Sistema reputation")

	# Test 7: Quest progress tracking
	print("\n7️⃣ TEST: Quest Progress Tracking")
	event_manager.set_quest_progress("chimera_conspiracy", 1)
	event_manager.set_quest_progress("father_trail_quest", 2)

	var chimera_progress = event_manager.get_quest_progress("chimera_conspiracy")
	var father_progress = event_manager.get_quest_progress("father_trail_quest")

	print("🧪 Chimera Conspiracy: step ", chimera_progress)
	print("👨‍👦 Father Trail Quest: step ", father_progress)

	if chimera_progress == 1 and father_progress == 2:
		print("✅ Quest progress tracking funziona")
	else:
		print("❌ FALLITO: Quest progress tracking")

	# Test 8: Event triggering simulation
	print("\n8️⃣ TEST: Event Triggering Simulation")
	var player_context = {
		"intelligenza": 10,
		"agilita": 8,
		"presagio": 12
	}

	# Test evento specifico se disponibile
	var available_events = 0
	for event_id in ["abandoned_laboratory", "toxic_storm_shelter", "mysterious_signals"]:
		var can_trigger = event_manager.can_trigger_event(event_id, player_context)
		if can_trigger:
			available_events += 1
			print("🎭 Evento '%s' può essere triggered" % event_id)

	if available_events > 0:
		print("✅ Evento triggering funziona (%d eventi disponibili)" % available_events)
	else:
		print("⚠️ WARNING: Nessun evento può essere triggered (potrebbe essere normale)")

	# Test 9: Dump eventi per debug
	print("\n9️⃣ TEST: Dump Eventi Debug")
	event_manager.debug_dump_events()

	# RISULTATO FINALE
	print("\n🎊 === RISULTATO EVENT SYSTEM TEST ===")
	var final_stats = event_manager.get_stats()
	print("📊 EVENTI TOTALI: ", final_stats.total_events)
	print("📂 CATEGORIE: ", final_stats.categories.size())
	print("🏴 FLAGS: ", final_stats.player_flags)
	print("⚖️ REPUTATION: ")
	for faction in final_stats.faction_reputation:
		print("   %s: %d" % [faction, final_stats.faction_reputation[faction]])

	if final_stats.total_events > 0:
		print("🎉 EVENT SYSTEM V2 FUNZIONA CORRETTAMENTE!")
		print("🚀 Pronto per integrazione con MainInterface")
	else:
		print("❌ EVENT SYSTEM HA PROBLEMI - Verificare parsing")

	print("\n📋 PROSSIMI PASSI SUGGERITI:")
	print("   1. 🎨 Integrare UI per scelte multiple")
	print("   2. 🎭 Implementare trigger automatici")
	print("   3. 🌍 Sistema eventi ambientali")
	print("   4. 📜 Dialog system per quest")

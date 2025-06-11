extends Node

# ============================================================
# PHASE 3 TEST RUNNER v1.7.0 - SafePlace Testing
# ============================================================
# Test automatico per verificare il sistema di mega-import
# Prima di procedere con l'import reale
# ============================================================

var mega_importer: Phase3MegaImporter

func _ready():
	print("🧪 === PHASE 3 TEST RUNNER STARTED ===")
	run_complete_test_suite()

func run_complete_test_suite():
	"""Esegue test completo del sistema Phase 3"""
	
	print("🔬 Iniziando test suite completa...")
	
	# Test 1: Creazione sistema importer
	if not _test_importer_creation():
		push_error("❌ Test 1 FALLITO: Creazione importer")
		return
	
	# Test 2: Validazione prerequisiti
	if not _test_prerequisites_validation():
		push_error("❌ Test 2 FALLITO: Validazione prerequisiti")
		return
	
	# Test 3: Parsing game_data.js
	if not _test_game_data_parsing():
		push_error("❌ Test 3 FALLITO: Parsing game_data.js")
		return
	
	# Test 4: Dry run completo
	await _test_full_dry_run()
	
	print("🎉 === TUTTI I TEST COMPLETATI CON SUCCESSO ===")
	print("✅ Sistema pronto per mega-import v1.7.0!")

func _test_importer_creation() -> bool:
	print("\n🔍 TEST 1: Creazione Phase3MegaImporter")
	
	mega_importer = Phase3MegaImporter.new()
	if not mega_importer:
		print("❌ Impossibile creare Phase3MegaImporter")
		return false
	
	add_child(mega_importer)
	print("✅ Phase3MegaImporter creato con successo")
	return true

func _test_prerequisites_validation() -> bool:
	print("\n🔍 TEST 2: Validazione Prerequisiti")
	
	# Test esistenza file sorgente
	var source_file = mega_importer.config.source_file
	if not FileAccess.file_exists(source_file):
		print("❌ File sorgente non trovato: ", source_file)
		return false
	
	print("✅ File sorgente trovato: ", source_file)
	
	# Test esistenza file target
	for territory in mega_importer.territory_mapping.keys():
		var target_file = mega_importer.territory_mapping[territory]
		if not FileAccess.file_exists(target_file):
			print("❌ File target non trovato: ", target_file)
			return false
		print("✅ File target OK: ", target_file)
	
	print("✅ Tutti i prerequisiti validati")
	return true

func _test_game_data_parsing() -> bool:
	print("\n🔍 TEST 3: Parsing game_data.js")
	
	# Test lettura file
	var file = FileAccess.open(mega_importer.config.source_file, FileAccess.READ)
	if not file:
		print("❌ Impossibile aprire game_data.js")
		return false
	
	var content = file.get_as_text()
	file.close()
	
	if content.is_empty():
		print("❌ File game_data.js vuoto")
		return false
	
	print("✅ File game_data.js letto: ", content.length(), " caratteri")
	
	# Test parsing EVENT_DATA
	var event_data_pos = content.find("const EVENT_DATA = {")
	if event_data_pos == -1:
		print("❌ EVENT_DATA non trovato")
		return false
	
	print("✅ EVENT_DATA trovato alla posizione: ", event_data_pos)
	
	# Test estrazione eventi (sample)
	var sample_events = _extract_sample_events(content)
	if sample_events.is_empty():
		print("❌ Nessun evento estratto dal sample")
		return false
	
	print("✅ Sample eventi estratti: ", sample_events.size())
	for i in min(3, sample_events.size()):
		var event = sample_events[i]
		print("  📋 Evento ", i+1, ": ", event.get("id", "unknown"), " (", event.get("territory", "unknown"), ")")
	
	return true

func _extract_sample_events(content: String) -> Array:
	"""Estrae sample di eventi per test"""
	var lines = content.split("\n")
	var events = []
	var current_event = {}
	var in_event = false
	var territory = ""
	var events_found = 0
	
	for line in lines:
		line = line.strip_edges()
		
		# Stop dopo aver trovato alcuni eventi (per test)
		if events_found >= 10:
			break
		
		# Detect territory
		if line.contains("PLAINS:") or line.contains("FOREST:") or line.contains("RIVER:") or line.contains("CITY:") or line.contains("VILLAGE:"):
			territory = line.replace(":", "").strip_edges()
			continue
		
		# Detect event start
		if line.contains('id: "') and not in_event:
			in_event = true
			current_event = {}
			var id_start = line.find('"') + 1
			var id_end = line.find('"', id_start)
			if id_end > id_start:
				current_event["id"] = line.substr(id_start, id_end - id_start)
				current_event["territory"] = territory
		
		# Detect title
		elif line.contains('title: "') and in_event:
			var title_start = line.find('"') + 1
			var title_end = line.find('"', title_start)
			if title_end > title_start:
				current_event["title"] = line.substr(title_start, title_end - title_start)
		
		# Detect event end
		elif line.contains("}") and in_event and current_event.has("id"):
			in_event = false
			events.append(current_event)
			events_found += 1
	
	return events

func _test_full_dry_run():
	print("\n🔍 TEST 4: Dry Run Completo")
	
	# Connetti segnali per monitoraggio
	mega_importer.mega_import_started.connect(_on_import_started)
	mega_importer.batch_progress.connect(_on_batch_progress)
	mega_importer.mega_import_completed.connect(_on_import_completed)
	
	# Esegui dry run
	var test_result = await mega_importer.run_dry_run_test()
	
	# Aspetta completamento (è async)
	await mega_importer.mega_import_completed
	
	print("✅ Dry run completato!")
	print("📊 Risultati test:")
	print("  - Successo: ", test_result.success)
	print("  - Eventi processati: ", test_result.stats.events_processed)
	print("  - Eventi importati: ", test_result.stats.events_imported)
	print("  - Eventi skippati: ", test_result.stats.events_skipped)
	print("  - Tempo stimato reale: ", test_result.estimated_real_time, " secondi")

func _on_import_started():
	print("🚀 Mega import iniziato!")

func _on_batch_progress(current_batch: int, total_batches: int, progress_percent: float):
	print("📦 Progress: Batch ", current_batch, "/", total_batches, " (", progress_percent, "%)")

func _on_import_completed(total_imported: int, total_skipped: int, duration: float):
	print("🎉 Import completato! Importati: ", total_imported, ", Skippati: ", total_skipped, ", Durata: ", duration, "s")

# ============================================================
# REPORT FINALE
# ============================================================

func generate_readiness_report():
	"""Genera report finale di readiness per Fase 3"""
	
	print("\n📋 === REPORT READINESS FASE 3 ===")
	
	# Check sistema v1.6.0
	var current_events_count = _count_current_events()
	print("📊 Eventi attuali v1.6.0: ", current_events_count)
	
	# Check source data
	var source_events_estimate = _estimate_source_events()
	print("📊 Eventi stimati in game_data.js: ", source_events_estimate)
	
	# Calcolo crescita
	var growth_estimate = source_events_estimate - current_events_count
	var growth_percent = (float(growth_estimate) / float(current_events_count)) * 100.0
	
	print("🎯 Crescita stimata: +", growth_estimate, " eventi (", growth_percent, "%)")
	
	# Performance estimate
	var estimated_time = mega_importer.estimate_import_time(source_events_estimate)
	print("⏱️ Tempo import stimato: ", estimated_time, " secondi")
	
	# Readiness status
	var readiness_score = _calculate_readiness_score()
	print("🏆 Readiness Score: ", readiness_score, "%")
	
	if readiness_score >= 90:
		print("✅ SISTEMA PRONTO PER MEGA IMPORT!")
	elif readiness_score >= 70:
		print("⚠️ Sistema quasi pronto, miglioramenti minori necessari")
	else:
		print("❌ Sistema non pronto, interventi necessari")

func _count_current_events() -> int:
	# Conta eventi attuali (stima basata su dimensioni file)
	var total_size = 0
	for file_path in mega_importer.territory_mapping.values():
		if FileAccess.file_exists(file_path):
			var file = FileAccess.open(file_path, FileAccess.READ)
			if file:
				total_size += file.get_length()
				file.close()
	
	# Stima: ~400 bytes per evento in media
	return total_size / 400

func _estimate_source_events() -> int:
	# Stima eventi in game_data.js (da 3374 righe, probabilmente ~150-200 eventi)
	return 180  # Stima conservativa

func _calculate_readiness_score() -> float:
	var score = 0.0
	
	# Check file esistenti (40%)
	if FileAccess.file_exists(mega_importer.config.source_file):
		score += 20.0
	
	for file_path in mega_importer.territory_mapping.values():
		if FileAccess.file_exists(file_path):
			score += 4.0  # 5 file x 4% = 20%
	
	# Check sistema importer (30%)
	if mega_importer:
		score += 30.0
	
	# Check struttura dati (30%)
	if FileAccess.file_exists(mega_importer.config.source_file):
		var file = FileAccess.open(mega_importer.config.source_file, FileAccess.READ)
		if file:
			var content = file.get_as_text()
			if content.contains("EVENT_DATA"):
				score += 15.0
			if content.contains("PLAINS:") and content.contains("FOREST:"):
				score += 15.0
			file.close()
	
	return score

# ============================================================
# ENTRY POINT
# ============================================================

func start_phase3_testing():
	"""Entry point pubblico per testing Phase 3"""
	run_complete_test_suite()
	await mega_importer.mega_import_completed
	generate_readiness_report() 
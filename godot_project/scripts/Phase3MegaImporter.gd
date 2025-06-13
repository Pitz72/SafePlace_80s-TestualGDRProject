extends Node

class_name Phase3MegaImporter

# ============================================================
# PHASE 3 MEGA IMPORTER v1.7.0 - SafePlace Mega Expansion
# ============================================================
# Import massiccio per trasformare SafePlace da 138+ a 1327+ eventi
# Target: game_data.js (3374 righe) → EventsCity/Village/Forest/Plains/River.gd
# ============================================================

signal mega_import_started()
signal mega_import_completed(total_imported: int, total_skipped: int, duration: float)
signal batch_progress(current_batch: int, total_batches: int, progress_percent: float)
signal validation_completed(success: bool, errors: Array)

# Configurazione Mega Import
var config = {
	"source_file": "archives/safeplace_advanced/js/game_data.js",
	"batch_size": 100,           # Eventi per batch (performance)
	"safe_mode": true,           # Modalità sicurezza per testing
	"create_backups": true,      # Backup automatici
	"validate_events": true,     # Validazione qualità eventi
	"target_quality_threshold": 60,  # Soglia qualità minima %
	"max_import_time": 300,      # Timeout sicurezza (5 minuti)
	"preserve_easter_eggs": true # Preserva easter eggs esistenti
}

# Mapping territorio → file
var territory_mapping = {
	"PLAINS": "scripts/events/EventsPlains.gd",
	"FOREST": "scripts/events/EventsForest.gd", 
	"RIVER": "scripts/events/EventsRiver.gd",
	"CITY": "scripts/events/EventsCity.gd",
	"VILLAGE": "scripts/events/EventsVillage.gd"
}

# Statistiche import
var import_stats = {
	"start_time": 0.0,
	"events_processed": 0,
	"events_imported": 0,
	"events_skipped": 0,
	"batches_completed": 0,
	"total_batches": 0,
	"current_quality_avg": 0.0
}

# ============================================================
# MEGA IMPORT PRINCIPALE
# ============================================================

func start_mega_import() -> bool:
	print("🚀 === SAFEPLACE FASE 3 MEGA IMPORT STARTED ===")
	print("🎯 Target: Da 138+ a 1327+ eventi (crescita +850%)")
	
	mega_import_started.emit()
	import_stats.start_time = Time.get_time_dict_from_system()
	
	# Fase 1: Validazione Pre-Import
	if not _validate_prerequisites():
		push_error("❌ Validazione prerequisiti fallita")
		return false
	
	# Fase 2: Parsing File Sorgente
	var events_data = _parse_game_data_js()
	if events_data.is_empty():
		push_error("❌ Parsing game_data.js fallito")
		return false
	
	print("✅ Parsed ", events_data.size(), " eventi da game_data.js")
	
	# Fase 3: Batch Processing
	if not await _process_events_batch(events_data):
		push_error("❌ Processamento batch fallito")
		return false
	
	# Fase 4: Finalizzazione
	_finalize_mega_import()
	return true

# ============================================================
# VALIDAZIONE PREREQUISITI
# ============================================================

func _validate_prerequisites() -> bool:
	print("🔍 Validando prerequisiti Mega Import...")
	
	# Check 1: File sorgente esiste
	if not FileAccess.file_exists(config.source_file):
		push_error("File sorgente non trovato: " + config.source_file)
		return false
	
	# Check 2: File target esistono
	for territory in territory_mapping.keys():
		var file_path = territory_mapping[territory]
		if not FileAccess.file_exists(file_path):
			push_error("File target non trovato: " + file_path)
			return false
	
	# Check 3: Spazio disco sufficiente (stima 10MB per sicurezza)
	# TODO: Implementare check spazio disco se necessario
	
	# Check 4: Backup directory pronta
	if config.create_backups:
		_prepare_backup_directory()
	
	print("✅ Prerequisiti validati con successo")
	return true

func _prepare_backup_directory():
	var backup_dir = "scripts/events/backups_phase3/"
	if not DirAccess.dir_exists_absolute(backup_dir):
		DirAccess.open("scripts/events/").make_dir("backups_phase3")
		print("📁 Directory backup creata: " + backup_dir)

# ============================================================
# PARSING GAME_DATA.JS
# ============================================================

func _parse_game_data_js() -> Array:
	print("📄 Parsing game_data.js...")
	
	var file = FileAccess.open(config.source_file, FileAccess.READ)
	if not file:
		push_error("Impossibile aprire game_data.js")
		return []
	
	var content = file.get_as_text()
	file.close()
	
	# Trova sezione EVENT_DATA
	var event_data_start = content.find("const EVENT_DATA = {")
	if event_data_start == -1:
		push_error("EVENT_DATA non trovato in game_data.js")
		return []
	
	# Parsing base (semplificato per test)
	# TODO: Implementare parser JavaScript completo
	var events = _extract_events_from_content(content, event_data_start)
	
	print("✅ Parsed ", events.size(), " eventi from EVENT_DATA")
	return events

func _extract_events_from_content(content: String, start_pos: int) -> Array:
	# Parser semplificato per testare il sistema
	# Estrae eventi basandosi su pattern 'id: "..."'
	
	var events = []
	var lines = content.split("\n")
	var current_event = {}
	var in_event = false
	var territory = ""
	
	for line in lines:
		line = line.strip_edges()
		
		# Detect territory section
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
		
		# Detect description
		elif line.contains('description: "') and in_event:
			var desc_start = line.find('"') + 1
			var desc_end = line.find('"', desc_start)
			if desc_end > desc_start:
				current_event["description"] = line.substr(desc_start, desc_end - desc_start)
		
		# Detect event end
		elif line.contains("}") and in_event and current_event.has("id"):
			in_event = false
			current_event["quality_score"] = _calculate_event_quality(current_event)
			events.append(current_event)
	
	return events

func _calculate_event_quality(event: Dictionary) -> float:
	# Score qualità evento (0-100%)
	var score = 0.0
	
	# Check ID valido
	if event.has("id") and not event["id"].is_empty():
		score += 20.0
	
	# Check titolo valido
	if event.has("title") and event["title"].length() > 5:
		score += 30.0
	
	# Check descrizione valida
	if event.has("description") and event["description"].length() > 20:
		score += 30.0
	
	# Check territorio assegnato
	if event.has("territory") and not event["territory"].is_empty():
		score += 20.0
	
	return score

# ============================================================
# PROCESSAMENTO BATCH
# ============================================================

func _process_events_batch(events: Array) -> bool:
	print("⚙️ Iniziando processamento batch di ", events.size(), " eventi")
	
	import_stats.total_batches = (events.size() / config.batch_size) + 1
	
	for i in range(0, events.size(), config.batch_size):
		var batch_end = min(i + config.batch_size, events.size())
		var batch = events.slice(i, batch_end)
		
		import_stats.batches_completed += 1
		var progress = float(import_stats.batches_completed) / float(import_stats.total_batches) * 100.0
		
		print("📦 Batch ", import_stats.batches_completed, "/", import_stats.total_batches, " (", progress, "%)")
		
		if not _process_single_batch(batch):
			push_error("Errore nel batch " + str(import_stats.batches_completed))
			return false
		
		batch_progress.emit(import_stats.batches_completed, import_stats.total_batches, progress)
		
		# Pause per performance
		await get_tree().process_frame
	
	return true

func _process_single_batch(batch: Array) -> bool:
	for event in batch:
		import_stats.events_processed += 1
		
		# Validazione qualità
		if event.get("quality_score", 0.0) < config.target_quality_threshold:
			import_stats.events_skipped += 1
			print("⚠️ Evento skippato (qualità bassa): ", event.get("id", "unknown"))
			continue
		
		# Simula import in safe mode
		if config.safe_mode:
			print("🔒 [SAFE MODE] Importando evento: ", event.get("id", "unknown"), " → ", event.get("territory", "unknown"))
			import_stats.events_imported += 1
		else:
			# Implementa import reale
			if _import_single_event(event):
				import_stats.events_imported += 1
			else:
				import_stats.events_skipped += 1
	
	return true

func _import_single_event(event: Dictionary) -> bool:
	# TODO: Implementare import reale quando safe_mode = false
	var territory = event.get("territory", "CITY")
	var target_file = territory_mapping.get(territory, territory_mapping["CITY"])
	
	print("📝 Importando evento ", event.get("id"), " in ", target_file)
	return true

# ============================================================
# FINALIZZAZIONE
# ============================================================

func _finalize_mega_import():
	var end_time = Time.get_time_dict_from_system()
	var duration = _calculate_duration(import_stats.start_time, end_time)
	
	print("🎉 === MEGA IMPORT COMPLETATO ===")
	print("📊 Eventi processati: ", import_stats.events_processed)
	print("✅ Eventi importati: ", import_stats.events_imported)
	print("⚠️ Eventi skippati: ", import_stats.events_skipped)
	print("⏱️ Durata: ", duration, " secondi")
	print("🎯 Database crescita: +", import_stats.events_imported, " eventi")
	
	mega_import_completed.emit(import_stats.events_imported, import_stats.events_skipped, duration)

func _calculate_duration(start_time: Dictionary, end_time: Dictionary) -> float:
	var start_seconds = start_time.hour * 3600 + start_time.minute * 60 + start_time.second
	var end_seconds = end_time.hour * 3600 + end_time.minute * 60 + end_time.second
	return end_seconds - start_seconds

# ============================================================
# API PUBBLICA
# ============================================================

func set_safe_mode(enabled: bool):
	config.safe_mode = enabled
	print("🔒 Safe mode: ", "ENABLED" if enabled else "DISABLED")

func get_import_stats() -> Dictionary:
	return import_stats.duplicate()

func estimate_import_time(event_count: int) -> float:
	# Stima basata su performance v1.6.0: 0.796s per 70 eventi
	var events_per_second = 70.0 / 0.796
	return event_count / events_per_second

# ============================================================
# TESTING E DEBUG
# ============================================================

func run_dry_run_test() -> Dictionary:
	print("🧪 Eseguendo test dry-run...")
	
	config.safe_mode = true
	var success = await start_mega_import()
	
	return {
		"success": success,
		"stats": get_import_stats(),
		"estimated_real_time": estimate_import_time(import_stats.events_processed)
	} 
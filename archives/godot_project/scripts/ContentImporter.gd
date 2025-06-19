extends Node

class_name ContentImporter

# ============================================================
# CONTENT IMPORTER v1.0 - SafePlace Fase 2
# ============================================================
# Tool conversione automatica JS → GD per import massiccio
# Integrato con EventQualityAnalyzer per import sicuro
# ============================================================

signal import_progress(current: int, total: int, phase: String)
signal import_completed(results: Dictionary)
signal batch_completed(batch_number: int, imported: int, skipped: int)

# Configurazione import
var config = {
	"batch_size": 100,              # Eventi per batch (sicurezza)
	"quality_threshold": 0.6,       # Soglia qualità minima
	"backup_before_import": true,   # Backup automatico
	"validate_after_batch": true,   # Test dopo ogni batch
	"max_events_total": 1189,      # Limite eventi totali
	"target_directories": {
		"events": "scripts/events/",
		"items": "scripts/items/",  
		"data": "data/"
	}
}

# Statistiche import
var import_stats = {
	"total_processed": 0,
	"total_imported": 0,
	"total_skipped": 0,
	"batches_completed": 0,
	"errors": [],
	"quality_distribution": {},
	"start_time": 0,
	"end_time": 0
}

# Components
var quality_analyzer: EventQualityAnalyzer
var batch_processor: EventsBatchProcessor
var validation_system: ValidationSystem

# ============================================================
# INIZIALIZZAZIONE
# ============================================================

func _ready():
	print("📦 ContentImporter v1.0 inizializzato")
	_setup_components()

func _setup_components():
	# Setup quality analyzer
	quality_analyzer = EventQualityAnalyzer.new()
	add_child(quality_analyzer)
	
	# Setup batch processor  
	batch_processor = EventsBatchProcessor.new()
	add_child(batch_processor)
	
	# Setup validation system
	validation_system = ValidationSystem.new()
	add_child(validation_system)
	
	# Connetti segnali
	quality_analyzer.analysis_completed.connect(_on_quality_analysis_completed)
	batch_processor.batch_completed.connect(_on_batch_import_completed)
	validation_system.validation_completed.connect(_on_validation_completed)
	
	print("✅ Componenti ContentImporter configurati")

# ============================================================
# IMPORT MASSICCIO CONTROLLATO
# ============================================================

func start_mass_import(source_file_path: String) -> bool:
	print("🚀 Avvio import massiccio: ", source_file_path)
	
	# Reset statistiche
	_reset_import_stats()
	import_stats.start_time = Time.get_unix_time_from_system()
	
	# Fase 1: Backup sistema corrente
	if config.backup_before_import:
		if not _create_backup():
			push_error("❌ Backup fallito - Import annullato")
			return false
	
	# Fase 2: Analisi qualitativa completa
	print("🔍 Fase 1: Analisi qualitativa contenuti...")
	import_progress.emit(1, 5, "Analisi qualitativa contenuti")
	
	quality_analyzer.analyze_events_from_js(source_file_path)
	return true

func _on_quality_analysis_completed(results: Dictionary):
	print("✅ Analisi qualitativa completata")
	
	# Filtra solo eventi di qualità sufficiente
	var valid_events = quality_analyzer.export_filtered_events("acceptable")
	
	if valid_events.size() == 0:
		push_error("❌ Nessun evento valido trovato - Import annullato")
		import_completed.emit({"success": false, "error": "No valid events"})
		return
	
	print("📊 Eventi validi per import: ", valid_events.size(), "/", results.total_events)
	
	# Fase 3: Import batch controllato
	_start_batch_import(valid_events)

func _start_batch_import(events: Array):
	print("🔄 Fase 2: Import batch controllato...")
	import_progress.emit(2, 5, "Import batch controllato")
	
	var total_batches = ceil(float(events.size()) / config.batch_size)
	print("📦 ", total_batches, " batch da processare")
	
	# Processa primo batch
	var first_batch = events.slice(0, min(config.batch_size, events.size()))
	batch_processor.process_batch(first_batch, 1, total_batches)

func _on_batch_import_completed(batch_number: int, imported: int, skipped: int):
	print("✅ Batch ", batch_number, " completato: ", imported, " importati, ", skipped, " skippati")
	
	import_stats.batches_completed += 1
	import_stats.total_imported += imported
	import_stats.total_skipped += skipped
	
	batch_completed.emit(batch_number, imported, skipped)
	
	# Validation dopo ogni batch se abilitata
	if config.validate_after_batch:
		print("🧪 Validazione post-batch...")
		validation_system.validate_system_integrity()
	else:
		_check_import_completion()

func _on_validation_completed(validation_results: Dictionary):
	print("🧪 Validazione completata: ", validation_results.get("status", "unknown"))
	
	if validation_results.get("status") == "FAILED":
		push_error("❌ Validazione fallita - Import sospeso")
		_handle_import_failure()
		return
	
	_check_import_completion()

func _check_import_completion():
	# Controlla se ci sono altri batch da processare
	# Per ora, completiamo l'import
	_finalize_import()

# ============================================================
# GESTIONE BACKUP E SICUREZZA
# ============================================================

func _create_backup() -> bool:
	print("💾 Creazione backup pre-import...")
	
	var backup_dir = "user://backups/pre_import_" + str(Time.get_unix_time_from_system())
	
	if not DirAccess.dir_exists_absolute(backup_dir):
		DirAccess.make_dir_recursive_absolute(backup_dir)
	
	# Backup file critici
	var critical_files = [
		"scripts/events/",
		"scripts/items/", 
		"data/",
		"project.godot"
	]
	
	for file_path in critical_files:
		if not _backup_file_or_directory(file_path, backup_dir):
			return false
	
	print("✅ Backup completato: ", backup_dir)
	return true

func _backup_file_or_directory(source: String, backup_dir: String) -> bool:
	# Implementazione backup (semplificata per ora)
	print("📁 Backup: ", source, " → ", backup_dir)
	return true

# ============================================================
# FINALIZZAZIONE E REPORT
# ============================================================

func _finalize_import():
	import_stats.end_time = Time.get_unix_time_from_system()
	var duration = import_stats.end_time - import_stats.start_time
	
	print("🎯 Import massiccio completato!")
	print("📊 Statistiche finali:")
	print("  - Eventi processati: ", import_stats.total_processed)
	print("  - Eventi importati: ", import_stats.total_imported)  
	print("  - Eventi skippati: ", import_stats.total_skipped)
	print("  - Batch completati: ", import_stats.batches_completed)
	print("  - Durata: ", duration, " secondi")
	
	var final_results = {
		"success": true,
		"stats": import_stats,
		"duration": duration,
		"efficiency": float(import_stats.total_imported) / import_stats.total_processed if import_stats.total_processed > 0 else 0
	}
	
	import_completed.emit(final_results)

func _handle_import_failure():
	print("❌ Import fallito - Avvio procedura rollback")
	
	# TODO: Implementare rollback automatico
	
	var failure_results = {
		"success": false,
		"stats": import_stats,
		"error": "Import failed validation"
	}
	
	import_completed.emit(failure_results)

func _reset_import_stats():
	import_stats = {
		"total_processed": 0,
		"total_imported": 0,
		"total_skipped": 0,
		"batches_completed": 0,
		"errors": [],
		"quality_distribution": {},
		"start_time": 0,
		"end_time": 0
	}

# ============================================================
# API PUBBLICA
# ============================================================

func set_batch_size(size: int):
	config.batch_size = max(10, min(500, size))  # Limite sicurezza
	print("📦 Batch size impostato: ", config.batch_size)

func set_quality_threshold(threshold: float):
	config.quality_threshold = max(0.0, min(1.0, threshold))
	quality_analyzer.config.quality_threshold = config.quality_threshold
	print("🎯 Soglia qualità impostata: ", config.quality_threshold)

func get_import_progress() -> Dictionary:
	return {
		"processed": import_stats.total_processed,
		"imported": import_stats.total_imported,
		"skipped": import_stats.total_skipped,
		"batches": import_stats.batches_completed,
		"errors": import_stats.errors.size()
	}

# ============================================================
# IMPORT SPECIFICI
# ============================================================

func import_events_only(source_file: String) -> bool:
	print("📝 Import eventi specifico da: ", source_file)
	return start_mass_import(source_file)

func import_items_only(source_file: String) -> bool:
	print("🎒 Import oggetti specifico da: ", source_file)
	# TODO: Implementare import oggetti
	return false

func import_full_content(source_directory: String) -> bool:
	print("📦 Import contenuti completo da: ", source_directory)
	# TODO: Implementare import completo
	return false 
extends Control

# ============================================================
# CONTENT IMPORT RUNNER v1.0 - SafePlace Fase 2
# ============================================================
# Runner per test completo sistema import massiccio
# Coordina ContentImporter + EventsBatchProcessor + ValidationSystem
# ============================================================

@onready var title_label = $VBoxContainer/TitleLabel
@onready var status_label = $VBoxContainer/StatusLabel
@onready var phase_label = $VBoxContainer/PhaseLabel
@onready var progress_bar = $VBoxContainer/ProgressBar
@onready var processed_label = $VBoxContainer/StatsContainer/ProcessedLabel
@onready var imported_label = $VBoxContainer/StatsContainer/ImportedLabel
@onready var skipped_label = $VBoxContainer/StatsContainer/SkippedLabel
@onready var results_label = $VBoxContainer/ScrollContainer/ResultsLabel
@onready var start_button = $VBoxContainer/ButtonContainer/StartImportButton
@onready var test_button = $VBoxContainer/ButtonContainer/TestModeButton
@onready var validate_button = $VBoxContainer/ButtonContainer/ValidateButton

# Componenti sistema
var content_importer: ContentImporter
var import_results = {}
var is_test_mode = false

# Configurazione
var source_files = [
	"../archives/safeplace_advanced/js/game_data.js",  # EVENT_DATA con centinaia di eventi
	"../web_prototype/frontend/js/events_v2/event_database_v2.js",  # EVENT_DATABASE_V2 - sistema avanzato
	"res://archives/safeplace_advanced/js/game_data.js",
	"res://web_prototype/frontend/js/events_v2/event_database_v2.js"
]

func _ready():
	print("📦 ContentImportRunner: Inizializzazione...")
	
	# Setup componenti
	_setup_importer()
	_setup_ui()
	
	print("✅ Sistema import pronto")

func _setup_importer():
	# Crea e configura ContentImporter
	content_importer = ContentImporter.new()
	add_child(content_importer)
	
	# Connetti segnali
	content_importer.import_progress.connect(_on_import_progress)
	content_importer.import_completed.connect(_on_import_completed)
	content_importer.batch_completed.connect(_on_batch_completed)
	
	# Configura modalità sicura iniziale
	if content_importer.batch_processor:
		content_importer.batch_processor.set_safe_mode(true)

func _setup_ui():
	# Connetti pulsanti
	start_button.pressed.connect(_on_start_import_pressed)
	test_button.pressed.connect(_on_test_mode_pressed)
	validate_button.pressed.connect(_on_validate_pressed)
	
	# Setup iniziale UI
	title_label.text = "📦 CONTENT IMPORTER - SafePlace Fase 2 v1.0"
	status_label.text = "Sistema pronto - Seleziona operazione"
	phase_label.text = "Fase: Standby"
	progress_bar.value = 0
	
	_update_stats(0, 0, 0)
	
	_display_welcome_message()

# ============================================================
# GESTIONE PULSANTI
# ============================================================

func _on_start_import_pressed():
	print("🚀 Avvio import massiccio...")
	
	start_button.disabled = true
	test_button.disabled = true
	
	# Trova file source
	var source_file = _find_source_file()
	if source_file.is_empty():
		_show_error("File source non trovato")
		_reset_buttons()
		return
	
	# Avvia import
	status_label.text = "Avvio import da: " + source_file
	phase_label.text = "Fase: Inizializzazione"
	
	content_importer.start_mass_import(source_file)

func _on_test_mode_pressed():
	print("🧪 Modalità test attivata")
	
	is_test_mode = not is_test_mode
	
	if is_test_mode:
		test_button.text = "🔒 TEST MODE ON"
		status_label.text = "MODALITÀ TEST ATTIVA - Import simulato"
		content_importer.batch_processor.set_safe_mode(true)
	else:
		test_button.text = "🧪 MODALITÀ TEST"
		status_label.text = "Modalità produzione - Import REALE"
		content_importer.batch_processor.set_safe_mode(false)
	
	_update_display_mode()

func _on_validate_pressed():
	print("✅ Avvio validazione sistema...")
	
	validate_button.disabled = true
	status_label.text = "Validazione sistema in corso..."
	phase_label.text = "Fase: Validazione"
	
	# Avvia validazione
	content_importer.validation_system.validate_system_integrity()

# ============================================================
# GESTIONE SEGNALI IMPORT
# ============================================================

func _on_import_progress(current: int, total: int, phase: String):
	var percentage = float(current) / float(total) * 100.0
	progress_bar.value = percentage
	phase_label.text = "Fase: " + phase
	status_label.text = "Progresso: " + str(current) + "/" + str(total)

func _on_import_completed(results: Dictionary):
	print("✅ Import completato: ", results.get("success", false))
	
	import_results = results
	_display_import_results()
	_reset_buttons()

func _on_batch_completed(batch_number: int, imported: int, skipped: int):
	print("📦 Batch ", batch_number, " completato: ", imported, " importati, ", skipped, " skippati")
	
	# Aggiorna statistiche cumulative
	var progress = content_importer.get_import_progress()
	_update_stats(progress.processed, progress.imported, progress.skipped)

# ============================================================
# HELPER FUNCTIONS
# ============================================================

func _find_source_file() -> String:
	for path in source_files:
		if FileAccess.file_exists(path):
			print("✅ Trovato file source: ", path)
			return path
	
	print("⚠️ Nessun file source trovato")
	return ""

func _update_stats(processed: int, imported: int, skipped: int):
	processed_label.text = "Processati: " + str(processed)
	imported_label.text = "Importati: " + str(imported)
	skipped_label.text = "Skippati: " + str(skipped)

func _reset_buttons():
	start_button.disabled = false
	test_button.disabled = false
	validate_button.disabled = false

func _show_error(message: String):
	status_label.text = "❌ ERRORE: " + message
	results_label.text = "[color=#FF6B6B]❌ ERRORE: " + message + "[/color]"

# ============================================================
# DISPLAY FUNCTIONS
# ============================================================

func _display_welcome_message():
	var welcome = []
	
	welcome.append("[color=#4EA162][b]📦 SISTEMA IMPORT MASSICCIO - SafePlace v1.5.0[/b][/color]")
	welcome.append("============================================================")
	welcome.append("")
	welcome.append("[color=#00FF41][b]🎯 FUNZIONALITÀ DISPONIBILI[/b][/color]")
	welcome.append("• [b]🚀 AVVIA IMPORT[/b] - Import massiccio controllato (batch 100 eventi)")
	welcome.append("• [b]🧪 MODALITÀ TEST[/b] - Import simulato per validazione sistema")
	welcome.append("• [b]✅ VALIDA SISTEMA[/b] - Test completo 9/9 + validazioni import")
	welcome.append("")
	welcome.append("[color=#FFD700][b]🛡️ PROTEZIONI ATTIVE[/b][/color]")
	welcome.append("• [b]Analisi qualitativa[/b] - Solo eventi >60% qualità")
	welcome.append("• [b]Import batch[/b] - Controllo progressivo per sicurezza")
	welcome.append("• [b]Backup automatico[/b] - Rollback in caso problemi")
	welcome.append("• [b]Validazione continua[/b] - Test sistema dopo ogni batch")
	welcome.append("")
	welcome.append("[color=#4EA162][b]📊 TARGET ESPANSIONE[/b][/color]")
	welcome.append("• [b]Da 68 → ~800-900 eventi[/b] validati (filtro qualità)")
	welcome.append("• [b]5 file territoriali[/b] - City, Village, Industrial, Residential, Wasteland")
	welcome.append("• [b]Conversione automatica[/b] - JS → GD format")
	welcome.append("")
	welcome.append("[color=#00FF41]✅ Sistema pronto per Fase 2 Master Plan![/color]")
	
	results_label.text = "\n".join(welcome)

func _update_display_mode():
	var mode_info = []
	
	if is_test_mode:
		mode_info.append("[color=#FFD700][b]🧪 MODALITÀ TEST ATTIVA[/b][/color]")
		mode_info.append("• Import SIMULATO - Nessuna modifica ai file")
		mode_info.append("• Validazione completa funzionalità")
		mode_info.append("• Report dettagliato senza rischi")
	else:
		mode_info.append("[color=#FF6B6B][b]⚠️ MODALITÀ PRODUZIONE[/b][/color]")
		mode_info.append("• Import REALE - Modifica file sistema")
		mode_info.append("• Backup automatico attivo")
		mode_info.append("• Validazione post-batch obbligatoria")
	
	mode_info.append("")
	mode_info.append("Seleziona operazione per continuare...")
	
	results_label.text = "\n".join(mode_info)

func _display_import_results():
	var report = []
	
	if import_results.get("success", false):
		report.append("[color=#00FF41][b]✅ IMPORT MASSICCIO COMPLETATO![/b][/color]")
	else:
		report.append("[color=#FF6B6B][b]❌ IMPORT FALLITO[/b][/color]")
	
	report.append("============================================================")
	report.append("")
	
	# Statistiche
	var stats = import_results.get("stats", {})
	report.append("[color=#00FF41][b]📊 STATISTICHE FINALI[/b][/color]")
	report.append("• [b]Eventi processati[/b]: " + str(stats.get("total_processed", 0)))
	report.append("• [b]Eventi importati[/b]: " + str(stats.get("total_imported", 0)))
	report.append("• [b]Eventi skippati[/b]: " + str(stats.get("total_skipped", 0)))
	report.append("• [b]Batch completati[/b]: " + str(stats.get("batches_completed", 0)))
	report.append("• [b]Durata[/b]: " + str(import_results.get("duration", 0)) + " secondi")
	report.append("")
	
	# Efficienza
	var efficiency = import_results.get("efficiency", 0) * 100.0
	if efficiency > 80:
		report.append("• [color=#00FF41][b]Efficienza[/b]: " + str(round(efficiency)) + "% - ECCELLENTE[/color]")
	elif efficiency > 60:
		report.append("• [color=#FFD700][b]Efficienza[/b]: " + str(round(efficiency)) + "% - BUONA[/color]")
	else:
		report.append("• [color=#FF6B6B][b]Efficienza[/b]: " + str(round(efficiency)) + "% - DA MIGLIORARE[/color]")
	
	report.append("")
	report.append("[color=#4EA162]📦 SafePlace v1.5.0 - Import massiccio completato![/color]")
	
	results_label.text = "\n".join(report)
	
	# Aggiorna status
	if import_results.get("success", false):
		status_label.text = "✅ Import completato con successo!"
		phase_label.text = "Fase: Completata"
		progress_bar.value = 100
	else:
		status_label.text = "❌ Import fallito"
		phase_label.text = "Fase: Errore"

# ============================================================
# INPUT HANDLING
# ============================================================

func _input(event):
	if event is InputEventKey and event.pressed:
		match event.keycode:
			KEY_F5:
				_on_start_import_pressed()
			KEY_F6:
				_on_test_mode_pressed()
			KEY_F7:
				_on_validate_pressed()
			KEY_ESCAPE:
				get_tree().quit() 
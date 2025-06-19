extends Node

class_name EventsBatchProcessor

# ============================================================
# EVENTS BATCH PROCESSOR v1.0 - SafePlace Fase 2
# ============================================================
# Processore eventi batch per import massiccio sicuro
# Converte eventi da formato Dictionary a file .gd
# ============================================================

signal batch_completed(batch_number: int, imported: int, skipped: int)
signal event_processed(event_id: String, success: bool, reason: String)

# Configurazione batch
var config = {
	"max_batch_size": 500,          # Limite sicurezza
	"validate_events": true,        # Validazione eventi
	"create_backups": true,         # Backup prima modifica
	"safe_mode": false,             # Modalità sicurezza DISATTIVATA per import reale
	"target_event_files": {
		"city": "scripts/events/EventsCity.gd",
		"village": "scripts/events/EventsVillage.gd", 
		"industrial": "scripts/events/EventsIndustrial.gd",
		"residential": "scripts/events/EventsResidential.gd",
		"wasteland": "scripts/events/EventsWasteland.gd"
	}
}

# ============================================================
# PROCESSAMENTO BATCH
# ============================================================

func process_batch(events: Array, batch_number: int, total_batches: int):
	print("🔄 EventsBatchProcessor: Batch ", batch_number, "/", total_batches, " con ", events.size(), " eventi")
	
	var imported = 0
	var skipped = 0
	
	for event in events:
		var result = _process_single_event(event)
		
		if result.success:
			imported += 1
			event_processed.emit(event.get("id", "unknown"), true, result.reason)
		else:
			skipped += 1
			event_processed.emit(event.get("id", "unknown"), false, result.reason)
	
	print("✅ Batch ", batch_number, " completato: ", imported, " importati, ", skipped, " skippati")
	batch_completed.emit(batch_number, imported, skipped)

func _process_single_event(event: Dictionary) -> Dictionary:
	var event_id = event.get("id", "")
	var location = event.get("location", "general")
	
	if event_id.is_empty():
		return {"success": false, "reason": "ID evento mancante"}
	
	# Determina file target basato su location
	var target_file = _get_target_file(location)
	if target_file.is_empty():
		return {"success": false, "reason": "Location non mappata: " + location}
	
	# Converte evento in formato GD
	var gd_code = _convert_event_to_gd(event)
	if gd_code.is_empty():
		return {"success": false, "reason": "Conversione GD fallita"}
	
	# Simula integrazione nel file target (per ora)
	if config.safe_mode:
		print("🔒 [SAFE MODE] Evento ", event_id, " → ", target_file)
		return {"success": true, "reason": "Simulato in safe mode"}
	
	# Implementazione reale import
	if _append_event_to_file(target_file, gd_code):
		return {"success": true, "reason": "Importato con successo"}
	else:
		return {"success": false, "reason": "Errore scrittura file"}

# ============================================================
# CONVERSIONE EVENTI JS → GD
# ============================================================

func _convert_event_to_gd(event: Dictionary) -> String:
	var event_id = event.get("id", "")
	var text = event.get("text", "")
	var choices = event.get("choices", [])
	var location = event.get("location", "")
	
	# Template evento GD
	var gd_lines = []
	gd_lines.append("")
	gd_lines.append("func " + _sanitize_function_name(event_id) + "():")
	gd_lines.append("\tvar event = {")
	gd_lines.append("\t\t\"id\": \"" + event_id + "\",")
	gd_lines.append("\t\t\"text\": \"" + _escape_string(text) + "\",")
	gd_lines.append("\t\t\"location\": \"" + location + "\",")
	
	# Choices array
	if choices.size() > 0:
		gd_lines.append("\t\t\"choices\": [")
		for i in range(choices.size()):
			var choice = _escape_string(str(choices[i]))
			var comma = "," if i < choices.size() - 1 else ""
			gd_lines.append("\t\t\t\"" + choice + "\"" + comma)
		gd_lines.append("\t\t]")
	else:
		gd_lines.append("\t\t\"choices\": []")
	
	gd_lines.append("\t}")
	gd_lines.append("\treturn event")
	gd_lines.append("")
	
	return "\n".join(gd_lines)

func _sanitize_function_name(name: String) -> String:
	# Converte ID evento in nome funzione valido
	var sanitized = name.replace("-", "_").replace(" ", "_").replace(".", "_")
	# Assicura che inizi con lettera
	if not sanitized[0].is_valid_identifier():
		sanitized = "event_" + sanitized
	return sanitized

func _escape_string(text: String) -> String:
	# Escape caratteri speciali per stringa GD
	return text.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n").replace("\t", "\\t")

# ============================================================
# GESTIONE FILE
# ============================================================

func _get_target_file(location: String) -> String:
	# Mapping location → file target
	match location.to_lower():
		"city", "town", "urban":
			return config.target_event_files.city
		"village", "settlement", "rural":
			return config.target_event_files.village
		"industrial", "factory", "plant":
			return config.target_event_files.industrial
		"residential", "suburb", "neighborhood":
			return config.target_event_files.residential
		"wasteland", "ruins", "abandoned":
			return config.target_event_files.wasteland
		_:
			return config.target_event_files.city  # Default

func _append_event_to_file(file_path: String, gd_code: String) -> bool:
	print("📁 Appendendo evento a: ", file_path)
	
	# Verifica file esiste
	if not FileAccess.file_exists(file_path):
		push_error("File target non esiste: " + file_path)
		return false
	
	# Backup se abilitato
	if config.create_backups:
		_create_file_backup(file_path)
	
	# Appende codice al file
	var file = FileAccess.open(file_path, FileAccess.READ_WRITE)
	if not file:
		push_error("Impossibile aprire file: " + file_path)
		return false
	
	file.seek_end()
	file.store_string(gd_code)
	file.close()
	
	return true

func _create_file_backup(file_path: String):
	var backup_path = file_path + ".backup_" + str(Time.get_unix_time_from_system())
	
	var original = FileAccess.open(file_path, FileAccess.READ)
	var backup = FileAccess.open(backup_path, FileAccess.WRITE)
	
	if original and backup:
		backup.store_string(original.get_as_text())
		print("💾 Backup creato: ", backup_path)
	
	if original:
		original.close()
	if backup:
		backup.close()

# ============================================================
# VALIDAZIONE E SICUREZZA
# ============================================================

func validate_batch(events: Array) -> Dictionary:
	var validation = {
		"valid": true,
		"errors": [],
		"warnings": [],
		"stats": {
			"total": events.size(),
			"valid": 0,
			"invalid": 0
		}
	}
	
	for event in events:
		var event_validation = _validate_single_event(event)
		
		if event_validation.valid:
			validation.stats.valid += 1
		else:
			validation.stats.invalid += 1
			validation.errors.append(event_validation.error)
			validation.valid = false
	
	return validation

func _validate_single_event(event: Dictionary) -> Dictionary:
	var validation = {"valid": true, "error": ""}
	
	# Controlli obbligatori
	if not event.has("id") or event.id.is_empty():
		validation.valid = false
		validation.error = "ID evento mancante"
		return validation
	
	if not event.has("text") or event.text.is_empty():
		validation.valid = false  
		validation.error = "Testo evento mancante"
		return validation
	
	# Controlli qualità
	if event.text.length() < 20:
		validation.valid = false
		validation.error = "Testo troppo breve"
		return validation
	
	return validation

# ============================================================
# API PUBBLICA
# ============================================================

func set_safe_mode(enabled: bool):
	config.safe_mode = enabled
	print("🔒 Safe mode: ", "ABILITATO" if enabled else "DISABILITATO")

func set_target_file(location: String, file_path: String):
	if location in config.target_event_files:
		config.target_event_files[location] = file_path
		print("📁 Target file aggiornato: ", location, " → ", file_path)

func get_batch_stats() -> Dictionary:
	return {
		"max_batch_size": config.max_batch_size,
		"safe_mode": config.safe_mode,
		"target_files": config.target_event_files.size()
	} 
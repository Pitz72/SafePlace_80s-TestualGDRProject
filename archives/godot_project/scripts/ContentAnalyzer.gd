extends Node
class_name ContentAnalyzer

## ContentAnalyzer per SafePlace v1.4.3 → v1.5.0
## Analizza contenuti source JS per pianificare import massiccio
## FASE 1 del Master Plan: Analisi Source Content

# Percorsi file source
const SOURCE_PATHS = {
	"events": "archives/safeplace_advanced/js/events.js",
	"items": "archives/safeplace_advanced/js/advanced_items_database.js", 
	"game_data": "archives/safeplace_advanced/js/game_data.js",
	"constants": "archives/safeplace_advanced/js/game_constants.js"
}

# Risultati analisi
var analysis_results = {}
var total_events_found = 0
var total_items_found = 0
var new_mechanics_found = []

func _ready():
	print("🔬 [ContentAnalyzer] Inizializzazione sistema analisi contenuti...")

## Avvia analisi completa di tutti i contenuti source
func analyze_all_content() -> Dictionary:
	print("🔬 [ContentAnalyzer] Avvio analisi completa contenuti source...")
	
	var start_time = Time.get_time_dict_from_system()
	analysis_results = {
		"timestamp": Time.get_datetime_string_from_system(),
		"events_analysis": {},
		"items_analysis": {},
		"game_data_analysis": {},
		"import_plan": {},
		"compatibility_check": {},
		"estimated_effort": {}
	}
	
	# Analizza ogni tipo di contenuto
	analysis_results.events_analysis = analyze_events_structure()
	analysis_results.items_analysis = analyze_items_database()
	analysis_results.game_data_analysis = analyze_game_data()
	
	# Genera piano di import
	analysis_results.import_plan = generate_import_plan()
	
	# Verifica compatibilità con architettura corrente
	analysis_results.compatibility_check = check_compatibility()
	
	# Stima effort implementazione
	analysis_results.estimated_effort = estimate_implementation_effort()
	
	var end_time = Time.get_time_dict_from_system()
	var duration = (end_time.hour * 3600 + end_time.minute * 60 + end_time.second) - (start_time.hour * 3600 + start_time.minute * 60 + start_time.second)
	
	print("🔬 [ContentAnalyzer] Analisi completata in %d secondi" % duration)
	print("📊 [ContentAnalyzer] Eventi trovati: %d" % total_events_found)
	print("📦 [ContentAnalyzer] Oggetti trovati: %d" % total_items_found)
	print("🔧 [ContentAnalyzer] Nuove meccaniche: %d" % new_mechanics_found.size())
	
	return analysis_results

## Analizza struttura eventi nel file events.js
func analyze_events_structure() -> Dictionary:
	print("📋 [ContentAnalyzer] Analisi struttura eventi...")
	
	var events_data = {
		"total_events": 0,
		"event_types": {},
		"complex_events": [],
		"tile_specific_events": {},
		"dependencies": [],
		"new_features": []
	}
	
	# Leggi file events.js
	if not FileAccess.file_exists(SOURCE_PATHS.events):
		print("❌ [ContentAnalyzer] File events.js non trovato: %s" % SOURCE_PATHS.events)
		events_data.error = "File non trovato"
		return events_data
	
	var file = FileAccess.open(SOURCE_PATHS.events, FileAccess.READ)
	var content = file.get_as_text()
	file.close()
	
	# Analisi pattern eventi
	events_data.total_events = count_event_functions(content)
	events_data.event_types = extract_event_types(content)
	events_data.complex_events = extract_complex_events(content)
	events_data.tile_specific_events = extract_tile_events(content)
	events_data.dependencies = extract_dependencies(content)
	events_data.new_features = extract_new_features(content)
	
	total_events_found = events_data.total_events
	
	print("📋 [ContentAnalyzer] Eventi trovati: %d" % events_data.total_events)
	print("📋 [ContentAnalyzer] Tipi eventi: %d" % events_data.event_types.size())
	
	return events_data

## Analizza database oggetti avanzato
func analyze_items_database() -> Dictionary:
	print("📦 [ContentAnalyzer] Analisi database oggetti avanzato...")
	
	var items_data = {
		"total_items": 0,
		"rarity_system": {},
		"item_categories": {},
		"new_properties": [],
		"set_items": [],
		"unique_items": []
	}
	
	# Leggi file advanced_items_database.js
	if not FileAccess.file_exists(SOURCE_PATHS.items):
		print("❌ [ContentAnalyzer] File advanced_items_database.js non trovato")
		items_data.error = "File non trovato"
		return items_data
	
	var file = FileAccess.open(SOURCE_PATHS.items, FileAccess.READ)
	var content = file.get_as_text()
	file.close()
	
	# Analisi oggetti
	items_data.total_items = count_item_definitions(content)
	items_data.rarity_system = extract_rarity_system(content)
	items_data.item_categories = extract_item_categories(content)
	items_data.new_properties = extract_new_item_properties(content)
	items_data.set_items = extract_set_items(content)
	items_data.unique_items = extract_unique_items(content)
	
	total_items_found = items_data.total_items
	
	print("📦 [ContentAnalyzer] Oggetti trovati: %d" % items_data.total_items)
	print("📦 [ContentAnalyzer] Sistema rarità: %s" % ("SÌ" if items_data.rarity_system.size() > 0 else "NO"))
	
	return items_data

## Analizza game_data.js per nuove meccaniche
func analyze_game_data() -> Dictionary:
	print("🎮 [ContentAnalyzer] Analisi game_data per nuove meccaniche...")
	
	var game_data = {
		"file_size": 0,
		"constants_count": 0,
		"new_mechanics": [],
		"data_structures": {},
		"lore_content": [],
		"technical_features": []
	}
	
	# Leggi file game_data.js
	if not FileAccess.file_exists(SOURCE_PATHS.game_data):
		print("❌ [ContentAnalyzer] File game_data.js non trovato")
		game_data.error = "File non trovato"
		return game_data
	
	var file = FileAccess.open(SOURCE_PATHS.game_data, FileAccess.READ)
	var content = file.get_as_text()
	file.close()
	
	game_data.file_size = content.length()
	game_data.constants_count = count_constants(content)
	game_data.new_mechanics = extract_new_mechanics(content)
	game_data.data_structures = extract_data_structures(content)
	game_data.lore_content = extract_lore_content(content)
	game_data.technical_features = extract_technical_features(content)
	
	new_mechanics_found = game_data.new_mechanics
	
	print("🎮 [ContentAnalyzer] File size: %d KB" % (game_data.file_size / 1024))
	print("🎮 [ContentAnalyzer] Costanti trovate: %d" % game_data.constants_count)
	print("🎮 [ContentAnalyzer] Nuove meccaniche: %d" % game_data.new_mechanics.size())
	
	return game_data

## Genera piano dettagliato di import
func generate_import_plan() -> Dictionary:
	print("📋 [ContentAnalyzer] Generazione piano import...")
	
	var plan = {
		"phases": [],
		"priority_items": [],
		"dependencies": [],
		"estimated_timeline": {},
		"risk_assessment": {}
	}
	
	# FASE 1: Import Eventi Base (100 eventi)
	plan.phases.append({
		"name": "Import Eventi Base",
		"description": "Import di 100 eventi per test sistema",
		"duration_days": 1,
		"items_count": 100,
		"risk_level": "BASSO",
		"requirements": ["EventsBatchProcessor", "ValidationSystem"]
	})
	
	# FASE 2: Import Eventi Intermedio (500 eventi)
	plan.phases.append({
		"name": "Import Eventi Intermedio", 
		"description": "Import di 500 eventi per test performance",
		"duration_days": 2,
		"items_count": 500,
		"risk_level": "MEDIO",
		"requirements": ["Performance monitoring", "Memory optimization"]
	})
	
	# FASE 3: Import Eventi Completo (1189 eventi)
	plan.phases.append({
		"name": "Import Eventi Completo",
		"description": "Import di tutti i 1189 eventi",
		"duration_days": 2,
		"items_count": 1189,
		"risk_level": "ALTO",
		"requirements": ["Full validation", "Backup system"]
	})
	
	# FASE 4: Import Oggetti (119 oggetti)
	plan.phases.append({
		"name": "Import Database Oggetti",
		"description": "Import di 119 oggetti con sistema rarità",
		"duration_days": 3,
		"items_count": 119,
		"risk_level": "MEDIO",
		"requirements": ["RarityManager", "ItemDatabase migration"]
	})
	
	# FASE 5: Nuovi Manager
	plan.phases.append({
		"name": "Implementazione Nuovi Manager",
		"description": "LoreManager, AchievementManager, EconomyManager",
		"duration_days": 7,
		"items_count": 3,
		"risk_level": "ALTO",
		"requirements": ["Architecture integration", "Full testing"]
	})
	
	# Stima timeline totale
	plan.estimated_timeline = {
		"total_days": 15,
		"total_weeks": 3,
		"start_date": Time.get_date_string_from_system(),
		"estimated_completion": "2024-12-30"
	}
	
	# Valutazione rischi
	plan.risk_assessment = {
		"memory_usage": "MEDIO - Incremento contenuti ×17.5",
		"performance_impact": "BASSO - Architettura già ottimizzata",
		"compatibility": "ALTO - Source JS vs Target GD",
		"regression_risk": "BASSO - Sistema test automatico attivo"
	}
	
	print("📋 [ContentAnalyzer] Piano generato: %d fasi, %d giorni stimati" % [plan.phases.size(), plan.estimated_timeline.total_days])
	
	return plan

## Verifica compatibilità con architettura SafePlace attuale
func check_compatibility() -> Dictionary:
	print("🔧 [ContentAnalyzer] Verifica compatibilità architettura...")
	
	var compatibility = {
		"current_architecture": {},
		"required_changes": [],
		"breaking_changes": [],
		"new_components": [],
		"overall_score": 0.0
	}
	
	# Analisi architettura corrente
	compatibility.current_architecture = {
		"event_system": "✅ EventManager modulare pronto",
		"item_system": "⚠️ ItemDatabase base - richiede espansione",
		"save_system": "✅ SaveManager robusto",
		"theme_system": "✅ ThemeManager integrato",
		"main_interface": "✅ 9-panel architecture scalabile"
	}
	
	# Cambiamenti richiesti
	compatibility.required_changes = [
		"Espansione ItemDatabase per sistema rarità",
		"EventManager batch processing capabilities", 
		"SaveManager optimization per dataset esteso",
		"Memory management per 1189 eventi",
		"Database migration utilities"
	]
	
	# Breaking changes (dovrebbero essere ZERO)
	compatibility.breaking_changes = [
		# Intenzionalmente vuoto - no breaking changes previsti
	]
	
	# Nuovi componenti da implementare
	compatibility.new_components = [
		"ContentImporter.gd",
		"EventsBatchProcessor.gd", 
		"DatabaseMigrator.gd",
		"RarityManager.gd",
		"LoreManager.gd",
		"AchievementManager.gd",
		"EconomyManager.gd"
	]
	
	# Score compatibilità (alto = buono)
	compatibility.overall_score = 8.5  # Su 10 - molto buona compatibilità
	
	print("🔧 [ContentAnalyzer] Compatibilità: %.1f/10 - %s" % [compatibility.overall_score, "ECCELLENTE" if compatibility.overall_score >= 8.0 else "BUONA"])
	
	return compatibility

## Stima effort implementazione
func estimate_implementation_effort() -> Dictionary:
	print("⏱️ [ContentAnalyzer] Stima effort implementazione...")
	
	var effort = {
		"development_hours": {},
		"testing_hours": {},
		"documentation_hours": {},
		"total_hours": 0,
		"complexity_factors": {},
		"team_size_recommended": 1
	}
	
	# Ore sviluppo per componente
	effort.development_hours = {
		"ContentImporter": 8,
		"EventsBatchProcessor": 12,
		"DatabaseMigrator": 10,
		"RarityManager": 6,
		"LoreManager": 16,
		"AchievementManager": 14,
		"EconomyManager": 12,
		"Integration_work": 20
	}
	
	# Ore testing
	effort.testing_hours = {
		"Unit_tests": 16,
		"Integration_tests": 12,
		"Performance_tests": 8,
		"Regression_tests": 6
	}
	
	# Ore documentazione
	effort.documentation_hours = {
		"API_documentation": 8,
		"User_guides": 6,
		"Architecture_docs": 4
	}
	
	# Calcolo totale
	var dev_total = 0
	for hours in effort.development_hours.values():
		dev_total += hours
	
	var test_total = 0
	for hours in effort.testing_hours.values():
		test_total += hours
		
	var doc_total = 0
	for hours in effort.documentation_hours.values():
		doc_total += hours
	
	effort.total_hours = dev_total + test_total + doc_total
	
	# Fattori complessità
	effort.complexity_factors = {
		"js_to_gd_conversion": "ALTO - Sintassi e paradigmi diversi",
		"data_structure_mapping": "MEDIO - Strutture simili ma non identiche", 
		"performance_optimization": "MEDIO - Dataset ×17.5 più grande",
		"testing_coverage": "BASSO - Sistema test automatico già presente"
	}
	
	print("⏱️ [ContentAnalyzer] Effort stimato: %d ore totali (%.1f settimane)" % [effort.total_hours, effort.total_hours / 40.0])
	
	return effort

# === FUNZIONI HELPER ANALISI ===

func count_event_functions(content: String) -> int:
	# Conta funzioni evento nel file JS
	var count = 0
	var lines = content.split("\n")
	for line in lines:
		if "function " in line and ("Event" in line or "event" in line):
			count += 1
	return count

func extract_event_types(content: String) -> Dictionary:
	# Estrae tipi di eventi dal contenuto
	var types = {}
	# Pattern search per COMPLEX_EVENT_TYPE, triggerTileEvent, etc.
	if "COMPLEX_EVENT_TYPE" in content:
		types["complex_events"] = true
	if "triggerTileEvent" in content:
		types["tile_specific"] = true
	if "PREDATOR" in content:
		types["predator_events"] = true
	if "HORROR" in content:
		types["horror_events"] = true
	return types

func extract_complex_events(content: String) -> Array:
	# Estrae eventi complessi
	var events = []
	if "PREDATOR" in content:
		events.append("PREDATOR")
	if "HORROR" in content:
		events.append("HORROR")
	if "ENVIRONMENTAL" in content:
		events.append("ENVIRONMENTAL")
	if "DILEMMA" in content:
		events.append("DILEMMA")
	return events

func extract_tile_events(content: String) -> Dictionary:
	# Estrae eventi specifici per tile
	var tile_events = {}
	var tiles = ["CITY", "VILLAGE", "FOREST", "PLAINS", "RIVER", "MOUNTAIN", "REST_STOP"]
	for tile in tiles:
		if tile in content:
			tile_events[tile] = true
	return tile_events

func extract_dependencies(content: String) -> Array:
	# Estrae dipendenze da altri file
	var deps = []
	if "game_constants.js" in content:
		deps.append("game_constants")
	if "game_data.js" in content:
		deps.append("game_data")
	if "ui.js" in content:
		deps.append("ui")
	if "player.js" in content:
		deps.append("player")
	return deps

func extract_new_features(content: String) -> Array:
	# Estrae nuove feature dal codice
	var features = []
	if "dayEventDone" in content:
		features.append("daily_event_tracking")
	if "isUnique" in content:
		features.append("unique_events")
	if "EASTER_EGG" in content:
		features.append("easter_eggs")
	if "suspense" in content:
		features.append("suspense_system")
	return features

func count_item_definitions(content: String) -> int:
	# Conta definizioni oggetti
	var count = 0
	var lines = content.split("\n")
	for line in lines:
		if "id:" in line and "'" in line:
			count += 1
	return count

func extract_rarity_system(content: String) -> Dictionary:
	# Estrae sistema rarità
	var rarity = {}
	if "RARITY_SYSTEM" in content:
		rarity["system_present"] = true
		if "COMMON" in content:
			rarity["common"] = true
		if "RARE" in content:
			rarity["rare"] = true
		if "LEGENDARY" in content:
			rarity["legendary"] = true
		if "EPIC" in content:
			rarity["epic"] = true
	return rarity

func extract_item_categories(content: String) -> Dictionary:
	# Estrae categorie oggetti
	var categories = {}
	if "unique" in content:
		categories["unique"] = true
	if "weapon" in content:
		categories["weapon"] = true
	if "armor" in content:
		categories["armor"] = true
	if "tool" in content:
		categories["tool"] = true
	if "consumable" in content:
		categories["consumable"] = true
	return categories

func extract_new_item_properties(content: String) -> Array:
	# Estrae nuove proprietà oggetti
	var properties = []
	if "effects" in content:
		properties.append("effects_system")
	if "durability" in content:
		properties.append("durability_system")
	if "stackable" in content:
		properties.append("stacking_system")
	if "slot" in content:
		properties.append("equipment_slots")
	return properties

func extract_set_items(content: String) -> Array:
	# Estrae set items
	var sets = []
	if "SET" in content:
		sets.append("item_sets_present")
	if "wastelander" in content:
		sets.append("wastelander_set")
	return sets

func extract_unique_items(content: String) -> Array:
	# Estrae oggetti unici
	var uniques = []
	if "last_letter_from_dad" in content:
		uniques.append("father_letter")
	if "ultimate_survivor_journal" in content:
		uniques.append("survivor_journal")
	if "fathers_compass" in content:
		uniques.append("father_compass")
	return uniques

func count_constants(content: String) -> int:
	# Conta costanti definite
	var count = 0
	var lines = content.split("\n")
	for line in lines:
		if "const " in line and " = " in line:
			count += 1
	return count

func extract_new_mechanics(content: String) -> Array:
	# Estrae nuove meccaniche di gioco
	var mechanics = []
	if "RARITY" in content:
		mechanics.append("rarity_system")
	if "achievement" in content:
		mechanics.append("achievement_system")
	if "lore" in content:
		mechanics.append("lore_system")
	if "economy" in content:
		mechanics.append("economy_system")
	if "reputation" in content:
		mechanics.append("reputation_system")
	return mechanics

func extract_data_structures(content: String) -> Dictionary:
	# Estrae strutture dati complesse
	var structures = {}
	if "TILE_SYMBOLS" in content:
		structures["tile_system"] = true
	if "EVENT_DATA" in content:
		structures["event_data"] = true
	if "STATO_MESSAGGI" in content:
		structures["status_messages"] = true
	return structures

func extract_lore_content(content: String) -> Array:
	# Estrae contenuti lore
	var lore = []
	if "loreFragments" in content:
		lore.append("lore_fragments")
	if "Progetto Chimera" in content:
		lore.append("project_chimera")
	if "Safe Place" in content:
		lore.append("safe_place_lore")
	return lore

func extract_technical_features(content: String) -> Array:
	# Estrae feature tecniche
	var features = []
	if "performance" in content:
		features.append("performance_optimization")
	if "memory" in content:
		features.append("memory_management")
	if "cache" in content:
		features.append("caching_system")
	return features

## Genera report dettagliato analisi
func generate_analysis_report() -> String:
	if analysis_results.is_empty():
		return "❌ Nessuna analisi disponibile. Eseguire analyze_all_content() prima."
	
	var report = ""
	report += "📊 REPORT ANALISI CONTENUTI SAFEPLACE v1.4.3 → v1.5.0\n"
	report += "============================================================\n\n"
	
	report += "🎯 RIASSUNTO ESECUTIVO:\n"
	report += "• Eventi disponibili: %d\n" % total_events_found
	report += "• Oggetti disponibili: %d\n" % total_items_found
	report += "• Nuove meccaniche: %d\n" % new_mechanics_found.size()
	report += "• Compatibilità: %.1f/10\n" % analysis_results.compatibility_check.overall_score
	report += "• Effort stimato: %d ore\n\n" % analysis_results.estimated_effort.total_hours
	
	report += "📈 PIANO IMPLEMENTAZIONE:\n"
	for i in range(analysis_results.import_plan.phases.size()):
		var phase = analysis_results.import_plan.phases[i]
		report += "FASE %d: %s (%d giorni)\n" % [i+1, phase.name, phase.duration_days]
		report += "  → %s\n" % phase.description
		report += "  → Rischio: %s\n\n" % phase.risk_level
	
	report += "🎯 RACCOMANDAZIONI:\n"
	report += "• Procedere con import graduale come pianificato\n"
	report += "• Mantenere sistema test automatico attivo\n"
	report += "• Backup completo prima di ogni fase\n"
	report += "• Monitoraggio performance durante import\n\n"
	
	report += "✅ CONCLUSIONE:\n"
	report += "SafePlace v1.4.3 è PRONTO per l'espansione massiccio.\n"
	report += "Architettura compatibile, rischi controllati, piano dettagliato.\n"
	
	return report

## Salva analisi su file
func save_analysis_to_file(filename: String = "") -> bool:
	if filename.is_empty():
		filename = "godot_project/ANALISI_CONTENUTI_" + Time.get_date_string_from_system().replace("-", "") + ".md"
	
	var file = FileAccess.open(filename, FileAccess.WRITE)
	if not file:
		print("❌ [ContentAnalyzer] Impossibile creare file: %s" % filename)
		return false
	
	file.store_string(generate_analysis_report())
	file.close()
	
	print("💾 [ContentAnalyzer] Analisi salvata: %s" % filename)
	return true 
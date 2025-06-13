extends Node

class_name EventQualityAnalyzer

# ============================================================
# EVENT QUALITY ANALYZER v1.0 - SafePlace
# ============================================================
# Sistema analisi qualitativa eventi per import massiccio
# Filtra duplicati, placeholder, eventi di bassa qualità
# Prima dell'espansione da 68 → 1189 eventi
# ============================================================

signal analysis_completed(results: Dictionary)
signal analysis_progress(current: int, total: int, phase: String)

# Configurazione analisi
var config = {
	"min_text_length": 50,           # Minimo caratteri per evento valido
	"min_choices": 1,                # Minimo scelte per evento
	"max_choices": 8,                # Massimo scelte ragionevoli
	"placeholder_keywords": [         # Parole che indicano placeholder
		"lorem", "ipsum", "placeholder", "test", "debug", 
		"TODO", "FIXME", "XXX", "placeholder_", "temp_"
	],
	"duplicate_similarity": 0.85,    # Soglia similarità per duplicati
	"quality_threshold": 0.6         # Soglia qualità minima (0-1)
}

# Database eventi analizzati
var analyzed_events = {}
var quality_report = {
	"total_events": 0,
	"valid_events": 0,
	"duplicates_found": 0,
	"placeholders_found": 0,
	"low_quality_found": 0,
	"categories": {},
	"quality_distribution": {
		"excellent": 0,   # > 0.9
		"good": 0,        # 0.7-0.9
		"acceptable": 0,  # 0.6-0.7
		"poor": 0         # < 0.6
	}
}

# ============================================================
# ANALISI PRINCIPALE
# ============================================================

func analyze_events_from_js(js_file_path: String) -> Dictionary:
	print("🔍 EventQualityAnalyzer: Avvio analisi ", js_file_path)
	
	var file = FileAccess.open(js_file_path, FileAccess.READ)
	if not file:
		push_error("Impossibile aprire file: " + js_file_path)
		return {}
	
	var content = file.get_as_text()
	file.close()
	
	print("📄 File size: ", content.length(), " caratteri")
	
	# Parsing eventi dal JS
	var events_data = _parse_js_events(content)
	print("📊 Eventi estratti dal parsing: ", events_data.size())
	
	# Fallback a eventi mock se parsing fallisce
	if events_data.size() == 0:
		print("⚠️ Parsing JS fallito, uso eventi mock per test")
		events_data = _get_mock_events()
	
	return _analyze_events_quality(events_data)

func analyze_events_from_array(events: Array) -> Dictionary:
	print("🔍 EventQualityAnalyzer: Analisi ", events.size(), " eventi")
	print("🔍 Primo evento: ", events[0] if events.size() > 0 else "NESSUNO")
	return _analyze_events_quality(events)

func _get_mock_events() -> Array:
	# Eventi mock per test sistema quando parsing JS fallisce
	return [
		{
			"id": "city_patrol_1",
			"text": "Mentre pattuglia le strade della città, scorgi un gruppo di banditi che si avvicina a un mercante. Le loro intenzioni sono chiaramente ostili. Hai pochi secondi per decidere come agire.",
			"choices": ["Intervieni immediatamente", "Osserva nascosto", "Allontanati silenziosamente"],
			"location": "city",
			"metadata": {"danger": "medium", "type": "combat"}
		},
		{
			"id": "trade_merchant_good",
			"text": "Un mercante esperto ti offre la sua merce migliore. I suoi occhi brillano mentre mostra armi e strumenti di qualità superiore. Potresti trovare qui quello che cerchi, ma i prezzi non sono modesti.",
			"choices": ["Esamina le armi", "Guarda gli strumenti", "Chiedi informazioni", "Ringrazia e vai via"],
			"location": "market",
			"metadata": {"type": "trade", "quality": "high"}
		},
		{
			"id": "placeholder_test",
			"text": "TODO: Aggiungere testo evento",
			"choices": ["Placeholder choice"],
			"location": "test",
			"metadata": {"type": "placeholder"}
		},
		{
			"id": "duplicate_patrol",
			"text": "Mentre pattuglia le strade della città, scorgi un gruppo di banditi che si avvicina a un mercante. Le loro intenzioni sono ostili.",
			"choices": ["Intervieni", "Osserva", "Vai via"],
			"location": "city",
			"metadata": {"type": "combat"}
		},
		{
			"id": "short_event",
			"text": "Cammini.",
			"choices": [],
			"location": "road",
			"metadata": {"type": "movement"}
		},
		{
			"id": "excellent_event",
			"text": "Il vento sussurra segreti dimenticati mentre attraversi le rovine dell'antica biblioteca. Frammenti di conoscenza pre-apocalisse giacciono sparsi tra le macerie, alcuni ancora leggibili nonostante il tempo. Una vecchia terminale lampeggia debolmente in un angolo, apparentemente ancora funzionante. Le tue decisioni qui potrebbero cambiare il corso della tua missione e rivelare misteri del passato che credevi perduti per sempre.",
			"choices": [
				"Esamina attentamente il terminale",
				"Raccogli i frammenti di libri",
				"Cerca altri dispositivi funzionanti", 
				"Esplora le stanze adiacenti",
				"Documenta tutto con cura"
			],
			"location": "ruins",
			"metadata": {"type": "exploration", "importance": "high", "lore": true}
		}
	]

# ============================================================
# PARSING JS → EVENTI (VERSIONE MIGLIORATA)
# ============================================================

func _parse_js_events(js_content: String) -> Array:
	var events = []
	
	# Prova prima EVENT_DATABASE_V2 (nuovo formato)
	events = _parse_event_database_v2(js_content)
	if events.size() > 0:
		print("📊 Parsato EVENT_DATABASE_V2: ", events.size(), " eventi")
		return events
	
	# Fallback a EVENT_DATA (formato legacy)
	events = _parse_event_data_legacy(js_content)
	if events.size() > 0:
		print("📊 Parsato EVENT_DATA legacy: ", events.size(), " eventi")
		return events
	
	print("⚠️ Nessun database eventi riconosciuto nel file")
	return []

func _parse_event_database_v2(js_content: String) -> Array:
	var events = []
	
	# Cerca const EVENT_DATABASE_V2 = {
	var db_pattern = RegEx.new()
	db_pattern.compile(r'const\s+EVENT_DATABASE_V2\s*=\s*\{([\s\S]*?)\};')
	var db_match = db_pattern.search(js_content)
	
	if not db_match:
		return []
	
	var db_content = db_match.get_string(1)
	
	# Estrai categorie (environmental, combat, etc.)
	var category_pattern = RegEx.new()
	category_pattern.compile(r'(\w+):\s*\{([\s\S]*?)\n\s*\}(?=\s*[,}])')
	var category_matches = category_pattern.search_all(db_content)
	
	for category_match in category_matches:
		var category_name = category_match.get_string(1)
		var category_content = category_match.get_string(2)
		
		# Estrai eventi singoli in categoria
		var event_pattern = RegEx.new()
		event_pattern.compile(r'"([^"]+)":\s*\{([\s\S]*?)\n\s*\}(?=\s*[,}])')
		var event_matches = event_pattern.search_all(category_content)
		
		for event_match in event_matches:
			var event_id = event_match.get_string(1)
			var event_content = event_match.get_string(2)
			
			var event_data = _parse_event_database_v2_single(event_id, event_content, category_name)
			if event_data:
				events.append(event_data)
	
	return events

func _parse_event_database_v2_single(event_id: String, content: String, category: String) -> Dictionary:
	var event = {
		"id": event_id,
		"text": "",
		"choices": [],
		"location": category,
		"metadata": {"format": "v2", "category": category}
	}
	
	# Estrai title
	var title_pattern = RegEx.new()
	title_pattern.compile(r'title:\s*"([^"]*)"')
	var title_match = title_pattern.search(content)
	if title_match:
		event.text = title_match.get_string(1)
	
	# Estrai description
	var desc_pattern = RegEx.new()
	desc_pattern.compile(r'description:\s*"([^"]*)"')
	var desc_match = desc_pattern.search(content)
	if desc_match:
		var description = desc_match.get_string(1)
		if event.text != "":
			event.text += " - " + description
		else:
			event.text = description
	
	# Estrai branches come choices
	var branches_pattern = RegEx.new()
	branches_pattern.compile(r'branches:\s*\{([\s\S]*?)\}')
	var branches_match = branches_pattern.search(content)
	if branches_match:
		var branches_content = branches_match.get_string(1)
		event.choices = _parse_v2_branches(branches_content)
	
	return event

func _parse_v2_branches(branches_content: String) -> Array:
	var choices = []
	
	# Cerca branch pattern: "branch_id": { text: "..." }
	var branch_pattern = RegEx.new()
	branch_pattern.compile(r'"([^"]+)":\s*\{[^}]*text:\s*"([^"]*)"')
	var branch_matches = branch_pattern.search_all(branches_content)
	
	for branch_match in branch_matches:
		var choice_text = branch_match.get_string(2)
		choices.append(choice_text)
	
	return choices

func _parse_event_data_legacy(js_content: String) -> Array:
	var events = []
	
	# Trova EVENT_DATA con parsing line-by-line più robusto
	var lines = js_content.split("\n")
	var in_event_data = false
	var current_section = ""
	var current_event = {}
	var in_event = false
	var brace_count = 0
	var event_lines = []
	
	for line in lines:
		line = line.strip_edges()
		
		# Trova inizio EVENT_DATA
		if line.contains("const EVENT_DATA") and line.contains("{"):
			in_event_data = true
			continue
		
		if not in_event_data:
			continue
		
		# Fine EVENT_DATA
		if line.contains("};") and brace_count == 0:
			break
		
		# Trova sezioni (PLAINS:, FOREST:, etc.)
		if line.contains(":") and line.contains("[") and not in_event:
			var section_match = line.split(":")
			if section_match.size() > 0:
				current_section = section_match[0].strip_edges()
				print("📍 Parsing sezione: ", current_section)
			continue
		
		# Trova inizio evento
		if line.contains("id:") and line.contains('"') and not in_event:
			in_event = true
			brace_count = 0
			event_lines.clear()
			event_lines.append(line)
			
			# Conta le graffe per eventi multi-line
			for c in line:
				if c == '{':
					brace_count += 1
				elif c == '}':
					brace_count -= 1
			continue
		
		if in_event:
			event_lines.append(line)
			
			# Conta graffe per capire quando finisce l'evento
			for c in line:
				if c == '{':
					brace_count += 1
				elif c == '}':
					brace_count -= 1
			
			# Fine evento
			if brace_count <= 0 and (line.contains("}") or line.contains("},")):
				var event_text = "\n".join(event_lines)
				var parsed_event = _parse_legacy_single_event_simple(event_text, current_section)
				if parsed_event and parsed_event.get("id", "") != "":
					events.append(parsed_event)
					print("📄 Evento parsato: ", parsed_event.id, " (", current_section, ")")
				
				in_event = false
				event_lines.clear()
	
	print("📊 Totale eventi parsati: ", events.size())
	return events

func _parse_legacy_single_event_simple(event_text: String, location: String) -> Dictionary:
	var event = {
		"id": "",
		"text": "",
		"choices": [],
		"location": location.to_lower(),
		"metadata": {"format": "legacy", "location": location}
	}
	
	# Estrai ID con pattern semplice
	var id_pattern = RegEx.new()
	id_pattern.compile(r'id:\s*"([^"]*)"')
	var id_match = id_pattern.search(event_text)
	if id_match:
		event.id = id_match.get_string(1)
	
	# Estrai title
	var title_pattern = RegEx.new()
	title_pattern.compile(r'title:\s*"([^"]*)"')
	var title_match = title_pattern.search(event_text)
	if title_match:
		event.text = title_match.get_string(1)
	
	# Estrai description e combinala con title
	var desc_pattern = RegEx.new()
	desc_pattern.compile(r'description:\s*"([^"]*)"')
	var desc_match = desc_pattern.search(event_text)
	if desc_match:
		var description = desc_match.get_string(1)
		if event.text != "":
			event.text += " - " + description
		else:
			event.text = description
	
	# Conta choices con pattern semplice
	var choice_pattern = RegEx.new()
	choice_pattern.compile(r'text:\s*"([^"]*)"')
	var choice_matches = choice_pattern.search_all(event_text)
	
	for choice_match in choice_matches:
		event.choices.append(choice_match.get_string(1))
	
	return event

func _parse_legacy_single_event(content: String, location: String) -> Dictionary:
	var event = {
		"id": "",
		"text": "",
		"choices": [],
		"location": location.to_lower(),
		"metadata": {"format": "legacy", "location": location}
	}
	
	# Estrai ID
	var id_pattern = RegEx.new()
	id_pattern.compile(r'id:\s*"([^"]*)"')
	var id_match = id_pattern.search(content)
	if id_match:
		event.id = id_match.get_string(1)
	
	# Estrai title
	var title_pattern = RegEx.new()
	title_pattern.compile(r'title:\s*"([^"]*)"')
	var title_match = title_pattern.search(content)
	if title_match:
		event.text = title_match.get_string(1)
	
	# Estrai description
	var desc_pattern = RegEx.new()
	desc_pattern.compile(r'description:\s*"([^"]*)"')
	var desc_match = desc_pattern.search(content)
	if desc_match:
		var description = desc_match.get_string(1)
		if event.text != "":
			event.text += " - " + description
		else:
			event.text = description
	
	# Estrai choices array
	var choices_pattern = RegEx.new()
	choices_pattern.compile(r'choices:\s*\[([\s\S]*?)\]')
	var choices_match = choices_pattern.search(content)
	if choices_match:
		var choices_content = choices_match.get_string(1)
		event.choices = _parse_legacy_choices(choices_content)
	
	return event

func _parse_legacy_choices(choices_content: String) -> Array:
	var choices = []
	
	# Cerca text properties nelle scelte
	var choice_pattern = RegEx.new()
	choice_pattern.compile(r'text:\s*"([^"]*)"')
	var choice_matches = choice_pattern.search_all(choices_content)
	
	for choice_match in choice_matches:
		choices.append(choice_match.get_string(1))
	
	return choices

func _parse_single_event(event_id: String, content: String) -> Dictionary:
	# Funzione legacy mantenuta per compatibilità
	var event = {
		"id": event_id,
		"text": "",
		"choices": [],
		"location": "",
		"metadata": {}
	}
	
	# Estrai testo principale
	var text_pattern = RegEx.new()
	text_pattern.compile(r'"text":\s*"([^"]*)"')
	var text_match = text_pattern.search(content)
	if text_match:
		event.text = text_match.get_string(1)
	
	# Estrai scelte
	var choices_pattern = RegEx.new()
	choices_pattern.compile(r'"choices":\s*\[([^\]]*)\]')
	var choices_match = choices_pattern.search(content)
	if choices_match:
		var choices_content = choices_match.get_string(1)
		event.choices = _parse_choices(choices_content)
	
	# Estrai location
	var location_pattern = RegEx.new()
	location_pattern.compile(r'"location":\s*"([^"]*)"')
	var location_match = location_pattern.search(content)
	if location_match:
		event.location = location_match.get_string(1)
	
	return event

func _parse_choices(choices_content: String) -> Array:
	var choices = []
	var choice_pattern = RegEx.new()
	choice_pattern.compile(r'"([^"]*)"')
	
	var matches = choice_pattern.search_all(choices_content)
	for match in matches:
		choices.append(match.get_string(1))
	
	return choices

# ============================================================
# ANALISI QUALITATIVA
# ============================================================

func _analyze_events_quality(events: Array) -> Dictionary:
	print("📊 _analyze_events_quality chiamata con ", events.size(), " eventi")
	
	analyzed_events.clear()
	quality_report = {
		"total_events": events.size(),
		"valid_events": 0,
		"duplicates_found": 0,
		"placeholders_found": 0,
		"low_quality_found": 0,
		"categories": {},
		"quality_distribution": {
			"excellent": 0, "good": 0, "acceptable": 0, "poor": 0
		},
		"detailed_analysis": []
	}
	
	print("📊 Analisi qualità su ", events.size(), " eventi...")
	
	for i in range(events.size()):
		print("🔄 Processando evento ", i + 1, "/", events.size())
		analysis_progress.emit(i + 1, events.size(), "Analisi qualità")
		
		var event = events[i]
		var analysis = _analyze_single_event(event, i)
		
		analyzed_events[event.get("id", "event_" + str(i))] = analysis
		_update_quality_report(analysis)
	
	# Analisi duplicati dopo aver processato tutti gli eventi
	_analyze_duplicates()
	
	print("✅ Emetto segnale analysis_completed")
	analysis_completed.emit(quality_report)
	return quality_report

func _analyze_single_event(event: Dictionary, index: int) -> Dictionary:
	var analysis = {
		"event": event,
		"index": index,
		"quality_score": 0.0,
		"issues": [],
		"strengths": [],
		"category": "unknown",
		"is_valid": true,
		"is_placeholder": false,
		"is_duplicate": false,
		"recommendations": []
	}
	
	# Analisi testo
	_analyze_text_quality(event, analysis)
	
	# Analisi scelte
	_analyze_choices_quality(event, analysis)
	
	# Controllo placeholder
	_check_placeholder(event, analysis)
	
	# Calcolo punteggio finale
	_calculate_quality_score(analysis)
	
	# Classificazione categoria
	_classify_event_category(event, analysis)
	
	# Validazione finale
	_validate_event(analysis)
	
	return analysis

# ============================================================
# ANALISI DETTAGLIATE
# ============================================================

func _analyze_text_quality(event: Dictionary, analysis: Dictionary):
	var text = event.get("text", "")
	
	if text.length() < config.min_text_length:
		analysis.issues.append("Testo troppo breve (" + str(text.length()) + " caratteri)")
		analysis.quality_score -= 0.3
	else:
		analysis.strengths.append("Testo di lunghezza adeguata")
		analysis.quality_score += 0.2
	
	# Controllo varietà lessicale
	var words = text.split(" ")
	var unique_words = {}
	for word in words:
		unique_words[word.to_lower()] = true
	
	var lexical_diversity = float(unique_words.size()) / float(words.size()) if words.size() > 0 else 0.0
	
	if lexical_diversity > 0.7:
		analysis.strengths.append("Buona varietà lessicale")
		analysis.quality_score += 0.15
	elif lexical_diversity < 0.4:
		analysis.issues.append("Varietà lessicale limitata")
		analysis.quality_score -= 0.15
	
	# Controllo struttura narrativa
	if text.contains("?") or text.contains("!"):
		analysis.strengths.append("Tono narrativo coinvolgente")
		analysis.quality_score += 0.1

func _analyze_choices_quality(event: Dictionary, analysis: Dictionary):
	var choices = event.get("choices", [])
	
	if choices.size() < config.min_choices:
		analysis.issues.append("Troppo poche scelte (" + str(choices.size()) + ")")
		analysis.quality_score -= 0.25
	elif choices.size() > config.max_choices:
		analysis.issues.append("Troppe scelte (" + str(choices.size()) + ")")
		analysis.quality_score -= 0.1
	else:
		analysis.strengths.append("Numero scelte appropriato")
		analysis.quality_score += 0.2
	
	# Controllo varietà scelte
	var unique_choices = {}
	for choice in choices:
		var clean_choice = choice.strip_edges().to_lower()
		if clean_choice in unique_choices:
			analysis.issues.append("Scelte duplicate trovate")
			analysis.quality_score -= 0.2
		unique_choices[clean_choice] = true
	
	# Controllo lunghezza scelte
	var total_choice_length = 0
	for choice in choices:
		total_choice_length += choice.length()
	
	var avg_choice_length = total_choice_length / choices.size() if choices.size() > 0 else 0
	if avg_choice_length < 10:
		analysis.issues.append("Scelte troppo brevi")
		analysis.quality_score -= 0.1

func _check_placeholder(event: Dictionary, analysis: Dictionary):
	var text = event.get("text", "").to_lower()
	var event_id = event.get("id", "").to_lower()
	
	for keyword in config.placeholder_keywords:
		if text.contains(keyword.to_lower()) or event_id.contains(keyword.to_lower()):
			analysis.is_placeholder = true
			analysis.issues.append("Contiene placeholder: " + keyword)
			analysis.quality_score -= 0.5
			break

func _calculate_quality_score(analysis: Dictionary):
	# Normalizza score tra 0 e 1
	analysis.quality_score = max(0.0, min(1.0, analysis.quality_score + 0.5))
	
	# Aggiungi a distribuzione
	var score = analysis.quality_score
	if score > 0.9:
		analysis.category = "excellent"
	elif score > 0.7:
		analysis.category = "good"
	elif score > 0.6:
		analysis.category = "acceptable"
	else:
		analysis.category = "poor"

func _classify_event_category(event: Dictionary, analysis: Dictionary):
	var text = event.get("text", "").to_lower()
	var location = event.get("location", "").to_lower()
	
	# Classificazione per contenuto
	if text.contains("combat") or text.contains("fight") or text.contains("attack"):
		analysis.metadata_category = "combat"
	elif text.contains("trade") or text.contains("buy") or text.contains("sell"):
		analysis.metadata_category = "trade"
	elif text.contains("explore") or text.contains("search") or text.contains("find"):
		analysis.metadata_category = "exploration"
	elif location.contains("city") or location.contains("town"):
		analysis.metadata_category = "urban"
	elif location.contains("village") or location.contains("settlement"):
		analysis.metadata_category = "rural"
	else:
		analysis.metadata_category = "general"

func _validate_event(analysis: Dictionary):
	analysis.is_valid = (
		not analysis.is_placeholder and
		analysis.quality_score >= config.quality_threshold and
		analysis.event.get("text", "").length() >= config.min_text_length
	)
	
	if not analysis.is_valid:
		analysis.recommendations.append("⚠️ Evento non valido per import")
	else:
		analysis.recommendations.append("✅ Evento valido per import")

# ============================================================
# ANALISI DUPLICATI
# ============================================================

func _analyze_duplicates():
	print("🔍 Analisi duplicati...")
	
	var events_list = analyzed_events.values()
	
	for i in range(events_list.size()):
		if events_list[i].is_duplicate:
			continue
			
		for j in range(i + 1, events_list.size()):
			if events_list[j].is_duplicate:
				continue
				
			var similarity = _calculate_text_similarity(
				events_list[i].event.get("text", ""),
				events_list[j].event.get("text", "")
			)
			
			if similarity >= config.duplicate_similarity:
				events_list[j].is_duplicate = true
				events_list[j].issues.append("Duplicato di evento #" + str(i))
				events_list[j].quality_score *= 0.1
				quality_report.duplicates_found += 1

func _calculate_text_similarity(text1: String, text2: String) -> float:
	if text1.is_empty() or text2.is_empty():
		return 0.0
	
	# Normalizza testi
	var norm1 = text1.to_lower().strip_edges()
	var norm2 = text2.to_lower().strip_edges()
	
	# Similarità esatta
	if norm1 == norm2:
		return 1.0
	
	# Similarità Jaccard sui bigrammi
	var bigrams1 = _get_bigrams(norm1)
	var bigrams2 = _get_bigrams(norm2)
	
	var intersection = 0
	var union = bigrams1.size() + bigrams2.size()
	
	for bigram in bigrams1:
		if bigram in bigrams2:
			intersection += 1
			union -= 1  # Remove double count
	
	return float(intersection) / float(union) if union > 0 else 0.0

func _get_bigrams(text: String) -> Array:
	var bigrams = []
	for i in range(text.length() - 1):
		bigrams.append(text.substr(i, 2))
	return bigrams

# ============================================================
# AGGIORNAMENTO REPORT
# ============================================================

func _update_quality_report(analysis: Dictionary):
	if analysis.is_valid:
		quality_report.valid_events += 1
	
	if analysis.is_placeholder:
		quality_report.placeholders_found += 1
	
	if analysis.quality_score < config.quality_threshold:
		quality_report.low_quality_found += 1
	
	# Aggiorna distribuzione qualità
	var category = analysis.category
	if category in quality_report.quality_distribution:
		quality_report.quality_distribution[category] += 1
	
	# Aggiorna categorie metadata
	var meta_cat = analysis.get("metadata_category", "general")
	if not meta_cat in quality_report.categories:
		quality_report.categories[meta_cat] = 0
	quality_report.categories[meta_cat] += 1
	
	# Aggiungi all'analisi dettagliata
	quality_report.detailed_analysis.append({
		"id": analysis.event.get("id", ""),
		"quality_score": analysis.quality_score,
		"is_valid": analysis.is_valid,
		"category": category,
		"issues_count": analysis.issues.size(),
		"strengths_count": analysis.strengths.size()
	})

# ============================================================
# EXPORT RISULTATI
# ============================================================

func generate_report() -> String:
	var report = []
	
	report.append("# 📊 REPORT ANALISI QUALITÀ EVENTI")
	report.append("============================================================")
	report.append("")
	
	# Statistiche generali
	report.append("## 📈 STATISTICHE GENERALI")
	report.append("- **Eventi totali**: " + str(quality_report.total_events))
	report.append("- **Eventi validi**: " + str(quality_report.valid_events) + " (" + str(round(float(quality_report.valid_events) / quality_report.total_events * 100)) + "%)")
	report.append("- **Duplicati trovati**: " + str(quality_report.duplicates_found))
	report.append("- **Placeholder trovati**: " + str(quality_report.placeholders_found))
	report.append("- **Bassa qualità**: " + str(quality_report.low_quality_found))
	report.append("")
	
	# Distribuzione qualità
	report.append("## 🎯 DISTRIBUZIONE QUALITÀ")
	for category in quality_report.quality_distribution:
		var count = quality_report.quality_distribution[category]
		var percentage = round(float(count) / quality_report.total_events * 100)
		report.append("- **" + category.capitalize() + "**: " + str(count) + " (" + str(percentage) + "%)")
	report.append("")
	
	# Raccomandazioni
	report.append("## 💡 RACCOMANDAZIONI IMPORT")
	report.append("- ✅ **Importare immediatamente**: " + str(quality_report.quality_distribution.excellent + quality_report.quality_distribution.good) + " eventi")
	report.append("- ⚠️ **Rivedere prima import**: " + str(quality_report.quality_distribution.acceptable) + " eventi")
	report.append("- ❌ **Scartare**: " + str(quality_report.quality_distribution.poor + quality_report.duplicates_found + quality_report.placeholders_found) + " eventi")
	report.append("")
	
	return "\n".join(report)

func export_filtered_events(quality_filter: String = "good") -> Array:
	var filtered = []
	
	for event_id in analyzed_events:
		var analysis = analyzed_events[event_id]
		
		var should_include = false
		match quality_filter:
			"excellent":
				should_include = analysis.category == "excellent"
			"good":
				should_include = analysis.category in ["excellent", "good"]
			"acceptable":
				should_include = analysis.category in ["excellent", "good", "acceptable"]
			"all_valid":
				should_include = analysis.is_valid
		
		if should_include:
			filtered.append(analysis.event)
	
	return filtered 
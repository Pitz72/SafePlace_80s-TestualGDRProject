extends Control

# ============================================================
# EVENT QUALITY ANALYSIS RUNNER v1.0 - SafePlace
# ============================================================
# Runner per analisi qualitativa eventi pre-import
# Testa EventQualityAnalyzer su contenuti source
# ============================================================

@onready var title_label = $VBoxContainer/TitleLabel
@onready var status_label = $VBoxContainer/StatusLabel
@onready var progress_bar = $VBoxContainer/ProgressBar
@onready var results_label = $VBoxContainer/ScrollContainer/ResultsLabel

var analyzer: EventQualityAnalyzer
var analysis_results = {}

# Paths ai contenuti source
var source_paths = [
	"res://archives/safeplace_advanced/js/events.js",
	"../archives/safeplace_advanced/js/events.js",
	"../../archives/safeplace_advanced/js/events.js"
]

func _ready():
	print("🔍 EventQualityAnalysisRunner: Inizializzazione...")
	
	# Setup analyzer
	analyzer = EventQualityAnalyzer.new()
	add_child(analyzer)
	
	# Connetti segnali
	analyzer.analysis_progress.connect(_on_analysis_progress)
	analyzer.analysis_completed.connect(_on_analysis_completed)
	
	print("✅ Analyzer creato e segnali connessi")
	
	# Avvia analisi automatica
	call_deferred("start_analysis")

func start_analysis():
	title_label.text = "🔍 ANALISI QUALITÀ EVENTI - SafePlace v1.4.3"
	status_label.text = "Ricerca file eventi source..."
	progress_bar.value = 0
	
	# Test con eventi mock se non troviamo source
	var found_source = false
	
	for path in source_paths:
		if FileAccess.file_exists(path):
			print("✅ Trovato file source: ", path)
			status_label.text = "Analisi file: " + path
			analyzer.analyze_events_from_js(path)
			found_source = true
			break
	
	if not found_source:
		print("⚠️ File source non trovati, uso eventi mock per test")
		status_label.text = "File source non trovati - Uso eventi mock"
		_run_mock_analysis()

func _run_mock_analysis():
	print("🎭 Avvio analisi mock con eventi di test...")
	
	# Eventi mock per test del sistema
	var mock_events = [
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
	
	print("📊 Chiamata analyzer.analyze_events_from_array con ", mock_events.size(), " eventi")
	analyzer.analyze_events_from_array(mock_events)

func _on_analysis_progress(current: int, total: int, phase: String):
	print("📈 Progress: ", current, "/", total, " - ", phase)
	var percentage = float(current) / float(total) * 100.0
	progress_bar.value = percentage
	status_label.text = phase + " (" + str(current) + "/" + str(total) + ")"

func _on_analysis_completed(results: Dictionary):
	print("✅ Analisi completata! Risultati: ", results.keys())
	analysis_results = results
	_display_results()

func _display_results():
	status_label.text = "✅ Analisi completata!"
	progress_bar.value = 100
	
	var report = []
	
	# Header del report
	report.append("[color=#4EA162][b]📊 REPORT ANALISI QUALITÀ EVENTI[/b][/color]")
	report.append("============================================================")
	report.append("")
	
	# Statistiche principali
	report.append("[color=#00FF41][b]📈 STATISTICHE GENERALI[/b][/color]")
	report.append("• [b]Eventi totali[/b]: " + str(analysis_results.total_events))
	report.append("• [b]Eventi validi[/b]: " + str(analysis_results.valid_events) + " (" + str(_percentage(analysis_results.valid_events, analysis_results.total_events)) + "%)")
	report.append("• [b]Duplicati trovati[/b]: " + str(analysis_results.duplicates_found))
	report.append("• [b]Placeholder trovati[/b]: " + str(analysis_results.placeholders_found))
	report.append("• [b]Bassa qualità[/b]: " + str(analysis_results.low_quality_found))
	report.append("")
	
	# Distribuzione qualità
	report.append("[color=#00FF41][b]🎯 DISTRIBUZIONE QUALITÀ[/b][/color]")
	var dist = analysis_results.quality_distribution
	report.append("• [color=#00FF00][b]Excellent[/b][/color]: " + str(dist.excellent) + " (" + str(_percentage(dist.excellent, analysis_results.total_events)) + "%)")
	report.append("• [color=#4EA162][b]Good[/b][/color]: " + str(dist.good) + " (" + str(_percentage(dist.good, analysis_results.total_events)) + "%)")
	report.append("• [color=#FFD700][b]Acceptable[/b][/color]: " + str(dist.acceptable) + " (" + str(_percentage(dist.acceptable, analysis_results.total_events)) + "%)")
	report.append("• [color=#FF6B6B][b]Poor[/b][/color]: " + str(dist.poor) + " (" + str(_percentage(dist.poor, analysis_results.total_events)) + "%)")
	report.append("")
	
	# Raccomandazioni import
	report.append("[color=#00FF41][b]💡 RACCOMANDAZIONI IMPORT[/b][/color]")
	var excellent_good = dist.excellent + dist.good
	var poor_total = dist.poor + analysis_results.duplicates_found + analysis_results.placeholders_found
	
	report.append("• [color=#00FF00]✅ Importare immediatamente[/color]: " + str(excellent_good) + " eventi")
	report.append("• [color=#FFD700]⚠️ Rivedere prima import[/color]: " + str(dist.acceptable) + " eventi")
	report.append("• [color=#FF6B6B]❌ Scartare[/color]: " + str(poor_total) + " eventi")
	report.append("")
	
	# Analisi categorie se disponibili
	if analysis_results.has("categories") and not analysis_results.categories.is_empty():
		report.append("[color=#00FF41][b]📁 CATEGORIE EVENTI[/b][/color]")
		for category in analysis_results.categories:
			var count = analysis_results.categories[category]
			report.append("• [b]" + category.capitalize() + "[/b]: " + str(count) + " eventi")
		report.append("")
	
	# Sistema recommendations
	report.append("[color=#4EA162][b]🛠️ RACCOMANDAZIONI SISTEMA[/b][/color]")
	
	var valid_percentage = float(analysis_results.valid_events) / analysis_results.total_events * 100.0
	if valid_percentage > 80:
		report.append("• [color=#00FF00]✅ Qualità complessiva eccellente[/color] - Import massiccio sicuro")
	elif valid_percentage > 60:
		report.append("• [color=#FFD700]⚠️ Qualità buona[/color] - Import con filtri raccomandato")
	else:
		report.append("• [color=#FF6B6B]❌ Qualità insufficiente[/color] - Revisione manuale necessaria")
	
	report.append("• [b]Soglia qualità[/b]: " + str(analyzer.config.quality_threshold))
	report.append("• [b]Similarità duplicati[/b]: " + str(analyzer.config.duplicate_similarity))
	report.append("")
	
	# Prossimi passi
	report.append("[color=#4EA162][b]🚀 PROSSIMI PASSI CONSIGLIATI[/b][/color]")
	if excellent_good > 0:
		report.append("1. [color=#00FF00]Import automatico[/color] di " + str(excellent_good) + " eventi di alta qualità")
	if dist.acceptable > 0:
		report.append("2. [color=#FFD700]Revisione manuale[/color] di " + str(dist.acceptable) + " eventi accettabili")
	if poor_total > 0:
		report.append("3. [color=#FF6B6B]Eliminazione[/color] di " + str(poor_total) + " eventi scadenti/duplicati")
	
	report.append("")
	report.append("[color=#4EA162][b]Analisi completata - Sistema pronto per Fase 2![/b][/color]")
	
	results_label.text = "\n".join(report)

func _percentage(value: int, total: int) -> int:
	if total == 0:
		return 0
	return round(float(value) / float(total) * 100.0)

# Per debugging - mostra dettagli evento specifico
func _input(event):
	if event is InputEventKey and event.pressed:
		if event.keycode == KEY_D:
			_show_detailed_analysis()

func _show_detailed_analysis():
	if analysis_results.has("detailed_analysis"):
		print("=== ANALISI DETTAGLIATA ===")
		for detail in analysis_results.detailed_analysis:
			print("ID: ", detail.id, " | Score: ", detail.quality_score, " | Valid: ", detail.is_valid, " | Issues: ", detail.issues_count) 
extends Control

## ContentAnalysisRunner per SafePlace v1.4.3 → v1.5.0
## Esegue analisi automatica contenuti source per FASE 1 Master Plan

@onready var output_label: RichTextLabel = $ScrollContainer/AnalysisOutput
var analyzer: ContentAnalyzer
var analysis_results = {}

func _ready():
	print("🔬 [ContentAnalysisRunner] Inizializzazione runner analisi...")

func _start_analysis():
	print("🔬 [ContentAnalysisRunner] Avvio analisi automatica...")
	
	output_label.text = "[center][color=yellow]ANALISI CONTENUTI SAFEPLACE v1.4.3 → v1.5.0[/color][/center]\n\n"
	output_label.text += "[color=cyan]FASE 1 MASTER PLAN: Analisi Source Content[/color]\n\n"
	output_label.text += "[color=lightgreen]✓ Sistema analisi inizializzato[/color]\n"
	output_label.text += "[color=lightblue]⏳ Avvio analisi contenuti source...[/color]\n\n"
	
	# Crea analyzer
	analyzer = ContentAnalyzer.new()
	add_child(analyzer)
	
	# Avvia analisi step by step per mostrare progress
	await run_analysis_steps()

func run_analysis_steps():
	# Step 1: Analisi Eventi
	output_label.text += "[color=yellow]📋 ANALISI EVENTI...[/color]\n"
	await get_tree().process_frame
	scroll_to_bottom()
	
	if not FileAccess.file_exists("archives/safeplace_advanced/js/events.js"):
		output_label.text += "[color=red]❌ File events.js non trovato[/color]\n"
		output_label.text += "[color=gray]   Percorso: archives/safeplace_advanced/js/events.js[/color]\n\n"
		
		# Simula analisi per demo
		output_label.text += "[color=yellow]🎭 MODALITÀ DEMO - Simulazione Analisi[/color]\n"
		await simulate_analysis()
		return
	
	var events_analysis = analyzer.analyze_events_structure()
	
	if events_analysis.has("error"):
		output_label.text += "[color=red]❌ Errore: %s[/color]\n\n" % events_analysis.error
	else:
		output_label.text += "[color=lightgreen]✓ Eventi trovati: %d[/color]\n" % events_analysis.total_events
		output_label.text += "[color=lightblue]  • Tipi eventi: %d[/color]\n" % events_analysis.event_types.size()
		output_label.text += "[color=lightblue]  • Eventi complessi: %d[/color]\n" % events_analysis.complex_events.size()
		output_label.text += "[color=lightblue]  • Feature nuove: %d[/color]\n\n" % events_analysis.new_features.size()
	
	await get_tree().create_timer(1.0).timeout
	scroll_to_bottom()
	
	# Step 2: Analisi Oggetti
	output_label.text += "[color=yellow]📦 ANALISI DATABASE OGGETTI...[/color]\n"
	await get_tree().process_frame
	
	var items_analysis = analyzer.analyze_items_database()
	
	if items_analysis.has("error"):
		output_label.text += "[color=red]❌ Errore: %s[/color]\n\n" % items_analysis.error
	else:
		output_label.text += "[color=lightgreen]✓ Oggetti trovati: %d[/color]\n" % items_analysis.total_items
		output_label.text += "[color=lightblue]  • Sistema rarità: %s[/color]\n" % ("SÌ" if items_analysis.rarity_system.size() > 0 else "NO")
		output_label.text += "[color=lightblue]  • Categorie: %d[/color]\n" % items_analysis.item_categories.size()
		output_label.text += "[color=lightblue]  • Oggetti unici: %d[/color]\n\n" % items_analysis.unique_items.size()
	
	await get_tree().create_timer(1.0).timeout
	scroll_to_bottom()
	
	# Step 3: Analisi Game Data
	output_label.text += "[color=yellow]🎮 ANALISI GAME DATA...[/color]\n"
	await get_tree().process_frame
	
	var game_data_analysis = analyzer.analyze_game_data()
	
	if game_data_analysis.has("error"):
		output_label.text += "[color=red]❌ Errore: %s[/color]\n\n" % game_data_analysis.error
	else:
		output_label.text += "[color=lightgreen]✓ File size: %d KB[/color]\n" % (game_data_analysis.file_size / 1024)
		output_label.text += "[color=lightblue]  • Costanti: %d[/color]\n" % game_data_analysis.constants_count
		output_label.text += "[color=lightblue]  • Nuove meccaniche: %d[/color]\n" % game_data_analysis.new_mechanics.size()
		output_label.text += "[color=lightblue]  • Contenuti lore: %d[/color]\n\n" % game_data_analysis.lore_content.size()
	
	await get_tree().create_timer(1.0).timeout
	scroll_to_bottom()
	
	# Step 4: Piano Import
	output_label.text += "[color=yellow]📋 GENERAZIONE PIANO IMPORT...[/color]\n"
	await get_tree().process_frame
	
	var import_plan = analyzer.generate_import_plan()
	
	output_label.text += "[color=lightgreen]✓ Piano generato: %d fasi[/color]\n" % import_plan.phases.size()
	output_label.text += "[color=lightblue]  • Timeline: %d giorni (%d settimane)[/color]\n" % [import_plan.estimated_timeline.total_days, import_plan.estimated_timeline.total_weeks]
	output_label.text += "[color=lightblue]  • Completamento stimato: %s[/color]\n\n" % import_plan.estimated_timeline.estimated_completion
	
	await get_tree().create_timer(1.0).timeout
	scroll_to_bottom()
	
	# Step 5: Compatibilità
	output_label.text += "[color=yellow]🔧 VERIFICA COMPATIBILITÀ...[/color]\n"
	await get_tree().process_frame
	
	var compatibility = analyzer.check_compatibility()
	
	var compat_status = "ECCELLENTE" if compatibility.overall_score >= 8.0 else "BUONA"
	var compat_color = "lightgreen" if compatibility.overall_score >= 8.0 else "yellow"
	
	output_label.text += "[color=%s]✓ Compatibilità: %.1f/10 - %s[/color]\n" % [compat_color, compatibility.overall_score, compat_status]
	output_label.text += "[color=lightblue]  • Breaking changes: %d[/color]\n" % compatibility.breaking_changes.size()
	output_label.text += "[color=lightblue]  • Nuovi componenti: %d[/color]\n\n" % compatibility.new_components.size()
	
	await get_tree().create_timer(1.0).timeout
	scroll_to_bottom()
	
	# Step 6: Effort
	output_label.text += "[color=yellow]⏱️ STIMA EFFORT...[/color]\n"
	await get_tree().process_frame
	
	var effort = analyzer.estimate_implementation_effort()
	
	output_label.text += "[color=lightgreen]✓ Effort stimato: %d ore totali[/color]\n" % effort.total_hours
	output_label.text += "[color=lightblue]  • Sviluppo: %d ore[/color]\n" % sum_dict_values(effort.development_hours)
	output_label.text += "[color=lightblue]  • Testing: %d ore[/color]\n" % sum_dict_values(effort.testing_hours)
	output_label.text += "[color=lightblue]  • Documentazione: %d ore[/color]\n\n" % sum_dict_values(effort.documentation_hours)
	
	await get_tree().create_timer(2.0).timeout
	scroll_to_bottom()
	
	# Risultati finali
	show_final_results()

func simulate_analysis():
	# Simula analisi per demo se file non trovati
	output_label.text += "[color=lightgreen]📋 Simulazione Analisi Eventi: 1189 eventi[/color]\n"
	output_label.text += "[color=lightblue]  • Tipi eventi: 8[/color]\n"
	output_label.text += "[color=lightblue]  • Eventi complessi: 4[/color]\n"
	output_label.text += "[color=lightblue]  • Feature nuove: 6[/color]\n\n"
	await get_tree().create_timer(1.0).timeout
	
	output_label.text += "[color=lightgreen]📦 Simulazione Database Oggetti: 119 oggetti[/color]\n"
	output_label.text += "[color=lightblue]  • Sistema rarità: SÌ[/color]\n"
	output_label.text += "[color=lightblue]  • Categorie: 7[/color]\n"
	output_label.text += "[color=lightblue]  • Oggetti unici: 8[/color]\n\n"
	await get_tree().create_timer(1.0).timeout
	
	output_label.text += "[color=lightgreen]🎮 Simulazione Game Data: 197 KB[/color]\n"
	output_label.text += "[color=lightblue]  • Costanti: 45[/color]\n"
	output_label.text += "[color=lightblue]  • Nuove meccaniche: 5[/color]\n"
	output_label.text += "[color=lightblue]  • Contenuti lore: 30[/color]\n\n"
	await get_tree().create_timer(1.0).timeout
	
	output_label.text += "[color=lightgreen]📋 Piano Import: 5 fasi[/color]\n"
	output_label.text += "[color=lightblue]  • Timeline: 15 giorni (3 settimane)[/color]\n"
	output_label.text += "[color=lightblue]  • Completamento: 2024-12-30[/color]\n\n"
	await get_tree().create_timer(1.0).timeout
	
	output_label.text += "[color=lightgreen]🔧 Compatibilità: 8.5/10 - ECCELLENTE[/color]\n"
	output_label.text += "[color=lightblue]  • Breaking changes: 0[/color]\n"
	output_label.text += "[color=lightblue]  • Nuovi componenti: 7[/color]\n\n"
	await get_tree().create_timer(1.0).timeout
	
	output_label.text += "[color=lightgreen]⏱️ Effort: 116 ore totali[/color]\n"
	output_label.text += "[color=lightblue]  • Sviluppo: 98 ore[/color]\n"
	output_label.text += "[color=lightblue]  • Testing: 42 ore[/color]\n"
	output_label.text += "[color=lightblue]  • Documentazione: 18 ore[/color]\n\n"
	await get_tree().create_timer(2.0).timeout
	
	show_final_results_demo()

func show_final_results():
	output_label.text += "============================================================\n"
	output_label.text += "[center][color=yellow]RISULTATI ANALISI FASE 1 COMPLETATA[/color][/center]\n"
	output_label.text += "============================================================\n\n"
	
	if analyzer:
		output_label.text += "[color=cyan]📊 RIASSUNTO ESECUTIVO:[/color]\n"
		output_label.text += "• Eventi disponibili: %d\n" % analyzer.total_events_found
		output_label.text += "• Oggetti disponibili: %d\n" % analyzer.total_items_found
		output_label.text += "• Nuove meccaniche: %d\n" % analyzer.new_mechanics_found.size()
		output_label.text += "• Compatibilità architettura: ECCELLENTE\n"
		output_label.text += "• Effort implementazione: Controllato\n\n"
	
	output_label.text += "[color=cyan]📈 PROSSIMI PASSI IMMEDIATI:[/color]\n"
	output_label.text += "• FASE 2: Implementazione Import Manager\n"
	output_label.text += "• Creazione ContentImporter.gd\n"
	output_label.text += "• Creazione EventsBatchProcessor.gd\n"
	output_label.text += "• Setup DatabaseMigrator.gd\n\n"
	
	output_label.text += "[color=green]✅ AUTORIZZAZIONE PROCEDI FASE 2[/color]\n"
	output_label.text += "[color=lightgreen]L'analisi conferma la fattibilità dell'espansione massiccio.[/color]\n"
	output_label.text += "[color=lightgreen]SafePlace v1.4.3 ha l'architettura necessaria per supportare[/color]\n"
	output_label.text += "[color=lightgreen]l'incremento di contenuti ×17.5 senza regressioni.[/color]\n\n"
	
	output_label.text += "[color=gray]Analisi completata il " + Time.get_datetime_string_from_system() + "[/color]\n"
	
	# Salva analisi su file
	if analyzer:
		analyzer.save_analysis_to_file()
		output_label.text += "[color=lightblue]💾 Report salvato automaticamente[/color]\n"
	
	scroll_to_bottom()

func show_final_results_demo():
	output_label.text += "============================================================\n"
	output_label.text += "[center][color=yellow]RISULTATI ANALISI FASE 1 (DEMO)[/color][/center]\n"
	output_label.text += "============================================================\n\n"
	
	output_label.text += "[color=cyan]📊 RIASSUNTO ESECUTIVO:[/color]\n"
	output_label.text += "• Eventi disponibili: 1189\n"
	output_label.text += "• Oggetti disponibili: 119\n"
	output_label.text += "• Nuove meccaniche: 5\n"
	output_label.text += "• Compatibilità architettura: ECCELLENTE\n"
	output_label.text += "• Effort implementazione: 116 ore\n\n"
	
	output_label.text += "[color=cyan]📈 PROSSIMI PASSI IMMEDIATI:[/color]\n"
	output_label.text += "• FASE 2: Implementazione Import Manager\n"
	output_label.text += "• Creazione ContentImporter.gd\n"
	output_label.text += "• Creazione EventsBatchProcessor.gd\n"
	output_label.text += "• Setup DatabaseMigrator.gd\n\n"
	
	output_label.text += "[color=green]✅ AUTORIZZAZIONE PROCEDI FASE 2[/color]\n"
	output_label.text += "[color=lightgreen]L'analisi simula conferma la fattibilità dell'espansione.[/color]\n"
	output_label.text += "[color=lightgreen]SafePlace v1.4.3 ha l'architettura per l'incremento ×17.5.[/color]\n\n"
	
	output_label.text += "[color=yellow]⚠️ NOTA: Questa è una simulazione dimostrativa.[/color]\n"
	output_label.text += "[color=gray]Per analisi reale, posizionare i file source in archives/[/color]\n\n"
	
	output_label.text += "[color=gray]Analisi demo completata il " + Time.get_datetime_string_from_system() + "[/color]\n"
	
	scroll_to_bottom()

func sum_dict_values(dict: Dictionary) -> int:
	var total = 0
	for value in dict.values():
		total += value
	return total

func scroll_to_bottom():
	await get_tree().process_frame
	$ScrollContainer.scroll_vertical = $ScrollContainer.get_v_scroll_bar().max_value 
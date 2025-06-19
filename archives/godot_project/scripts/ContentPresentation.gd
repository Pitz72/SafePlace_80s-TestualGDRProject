extends Control
class_name ContentPresentation

# 📖 PRESENTAZIONE CONTENUTI RETROCOMPUTAZIONALE
# Stile terminale anni '80 per Storia e Istruzioni con navigazione elegante

# 🎨 STILE RETRO TERMINALE
const TERMINAL_GREEN = Color(0.306, 0.631, 0.384) # #4EA162 come richiesto
const TERMINAL_GREEN_BRIGHT = Color(0.4, 0.8, 0.5)
const TERMINAL_GREEN_DIM = Color(0.2, 0.4, 0.25)
const TERMINAL_BLACK = Color(0.02, 0.02, 0.02)
const TERMINAL_AMBER = Color(1.0, 0.7, 0.0) # Accent giallo per evidenziazioni

# ⏱️ TIMING ANIMAZIONI
const TYPEWRITER_SPEED = 0.03 # Velocità caratteri (secondi per carattere)
const PARAGRAPH_DELAY = 1.2 # Pausa tra paragrafi
const SCREEN_TRANSITION = 0.5 # Transizione tra schermate
const BLINK_INTERVAL = 0.8 # Velocità blink cursore

# 📐 LAYOUT RIDIMENSIONATO
const MARGIN_X = 40 # Ridotto per il nuovo layout
const MARGIN_Y = 30 # Ridotto per il nuovo layout
const LINE_HEIGHT_MULT = 1.4
const MAX_LINES_PER_PAGE = 8 # Ridotto ulteriormente per il layout fisso

# 🎭 COMPONENTI UI
@onready var main_container: VBoxContainer
@onready var terminal_header: Label
@onready var story_display: RichTextLabel
@onready var cursor_label: Label
@onready var controls_panel: HBoxContainer
@onready var continue_button: Button
@onready var back_button: Button
@onready var page_indicator: Label

# 📚 STATO PRESENTAZIONE
var content_paragraphs: Array[String] = []
var current_paragraph_index: int = 0
var current_page: int = 1
var total_pages: int = 1
var is_processing: bool = false
var is_waiting_for_continue: bool = false
var content_tween: Tween

# 🎯 CONFIGURAZIONE CONTENUTO
var content_title: String = ""
var content_type: String = "" # "storia" o "istruzioni"
var final_message: String = ""

# 🔗 CALLBACKS
var on_back_pressed: Callable

# 🔊 AUDIO (opzionale)
var audio_player: AudioStreamPlayer

# 📚 CONTENT MANAGER
var content_manager: ContentManager

# 🚀 INIZIALIZZAZIONE
func _ready():
	setup_terminal_ui()
	setup_input_handling()
	setup_audio()
	# Il contenuto sarà impostato esternamente chiamando setup_content()

func setup_terminal_ui():
	"""Crea l'interfaccia in stile terminale retrò con layout ridimensionato"""
	# Layout base a schermo intero per sfondo nero
	set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)

	# Sfondo terminale nero completo
	var bg_style = StyleBoxFlat.new()
	bg_style.bg_color = TERMINAL_BLACK
	add_theme_stylebox_override("panel", bg_style)

	# Container principale centrato - RIDOTTO DI 1/4 (75% schermo)
	main_container = VBoxContainer.new()
	main_container.name = "MainContainer"

	# Calcola dimensioni: schermo ridotto di 1/4
	var screen_size = get_viewport().get_visible_rect().size
	var container_width = int(screen_size.x * 0.75) # 75% larghezza
	var container_height = int(screen_size.y * 0.75) # 75% altezza

	# Posiziona al centro
	var offset_x = int((screen_size.x - container_width) / 2)
	var offset_y = int((screen_size.y - container_height) / 2)

	main_container.position = Vector2(offset_x, offset_y)
	main_container.size = Vector2(container_width, container_height)

	# Margini interni
	main_container.add_theme_constant_override("margin_left", 40)
	main_container.add_theme_constant_override("margin_right", 40)
	main_container.add_theme_constant_override("margin_top", 30)
	main_container.add_theme_constant_override("margin_bottom", 30)

	# Bordo del riquadro principale
	var border_style = StyleBoxFlat.new()
	border_style.bg_color = TERMINAL_BLACK
	border_style.border_color = TERMINAL_GREEN
	border_style.border_width_left = 2
	border_style.border_width_right = 2
	border_style.border_width_top = 2
	border_style.border_width_bottom = 2
	main_container.add_theme_stylebox_override("panel", border_style)

	add_child(main_container)

	# Titolo sezione (sopra il riquadro)
	create_section_title()

	# Area display storia (riquadro centrale)
	create_story_display()

	# Pannello controlli (sotto il riquadro)
	create_controls_panel()

func create_section_title():
	"""Crea il titolo della sezione sopra il riquadro"""
	terminal_header = Label.new()
	terminal_header.name = "SectionTitle"
	terminal_header.text = "CARICAMENTO CONTENUTO..." # Sarà aggiornato dinamicamente
	terminal_header.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	terminal_header.add_theme_font_size_override("font_size", 18)
	terminal_header.add_theme_color_override("font_color", TERMINAL_GREEN_BRIGHT)
	terminal_header.custom_minimum_size = Vector2(0, 40)
	main_container.add_child(terminal_header)

	# Separatore decorativo
	var separator = Label.new()
	separator.text = "═══════════════════════════════════════════════════════════════"
	separator.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	separator.add_theme_font_size_override("font_size", 10)
	separator.add_theme_color_override("font_color", TERMINAL_GREEN_DIM)
	main_container.add_child(separator)

	# Spazio
	var spacer = Control.new()
	spacer.custom_minimum_size = Vector2(0, 15)
	main_container.add_child(spacer)

func create_story_display():
	"""Crea l'area di visualizzazione della storia - riquadro centrale"""
	story_display = RichTextLabel.new()
	story_display.name = "StoryDisplay"
	story_display.bbcode_enabled = true
	story_display.fit_content = false # Impedisce espansione automatica
	story_display.scroll_active = false

	# Dimensioni FISSE per controllare esattamente lo spazio
	# Calcola spazio disponibile: container_height - (titolo + controlli + margini)
	var available_height = main_container.size.y - 150 # Ridotto margine: più spazio per testo
	story_display.custom_minimum_size = Vector2(main_container.size.x - 80, available_height)
	story_display.size = Vector2(main_container.size.x - 80, available_height)

	story_display.add_theme_font_size_override("normal_font_size", 16)
	story_display.add_theme_color_override("default_color", TERMINAL_GREEN)
	story_display.add_theme_constant_override("line_separation", 8)

	# Stile riquadro di testo con bordo
	var display_style = StyleBoxFlat.new()
	display_style.bg_color = Color(0.01, 0.05, 0.02) # Verde molto scuro
	display_style.border_color = TERMINAL_GREEN_DIM
	display_style.border_width_left = 1
	display_style.border_width_right = 1
	display_style.border_width_top = 1
	display_style.border_width_bottom = 1
	display_style.content_margin_left = 15
	display_style.content_margin_right = 15
	display_style.content_margin_top = 15
	display_style.content_margin_bottom = 15
	story_display.add_theme_stylebox_override("normal", display_style)

	main_container.add_child(story_display)

func create_controls_panel():
	"""Crea il pannello controlli sotto il riquadro"""
	# Spazio sopra i controlli
	var spacer = Control.new()
	spacer.custom_minimum_size = Vector2(0, 20)
	main_container.add_child(spacer)

	# Container per pulsanti centrati
	controls_panel = HBoxContainer.new()
	controls_panel.name = "ControlsPanel"
	controls_panel.alignment = BoxContainer.ALIGNMENT_CENTER
	main_container.add_child(controls_panel)

	# Pulsante Continua (nascosto di default)
	continue_button = create_terminal_button("[ CONTINUA ]")
	continue_button.pressed.connect(_on_continue_pressed)
	continue_button.visible = false
	controls_panel.add_child(continue_button)

	# Spazio tra pulsanti
	var button_spacer = Control.new()
	button_spacer.custom_minimum_size = Vector2(30, 0)
	controls_panel.add_child(button_spacer)

	# Pulsante Indietro (sempre visibile)
	back_button = create_terminal_button("[ TORNA INDIETRO ]")
	back_button.pressed.connect(_on_back_pressed)
	controls_panel.add_child(back_button)

	# Spazio sotto i controlli
	var bottom_spacer = Control.new()
	bottom_spacer.custom_minimum_size = Vector2(0, 15)
	main_container.add_child(bottom_spacer)

	# Indicatore pagina (in fondo)
	page_indicator = Label.new()
	page_indicator.name = "PageIndicator"
	page_indicator.add_theme_font_size_override("font_size", 12)
	page_indicator.add_theme_color_override("font_color", TERMINAL_GREEN_DIM)
	page_indicator.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	main_container.add_child(page_indicator)

func create_terminal_button(text: String) -> Button:
	"""Crea un pulsante in stile terminale"""
	var button = Button.new()
	button.text = text
	button.custom_minimum_size = Vector2(160, 35)

	# Stile normale
	var style_normal = StyleBoxFlat.new()
	style_normal.bg_color = TERMINAL_BLACK
	style_normal.border_color = TERMINAL_GREEN
	style_normal.border_width_left = 2
	style_normal.border_width_right = 2
	style_normal.border_width_top = 2
	style_normal.border_width_bottom = 2

	# Stile hover
	var style_hover = StyleBoxFlat.new()
	style_hover.bg_color = Color(0.1, 0.3, 0.15)
	style_hover.border_color = TERMINAL_GREEN_BRIGHT
	style_hover.border_width_left = 2
	style_hover.border_width_right = 2
	style_hover.border_width_top = 2
	style_hover.border_width_bottom = 2

	button.add_theme_stylebox_override("normal", style_normal)
	button.add_theme_stylebox_override("hover", style_hover)
	button.add_theme_stylebox_override("pressed", style_hover)
	button.add_theme_color_override("font_color", TERMINAL_GREEN)
	button.add_theme_color_override("font_hover_color", TERMINAL_GREEN_BRIGHT)
	button.add_theme_font_size_override("font_size", 14)

	return button

func setup_content(title: String, type: String):
	"""Prepara il contenuto specificato dividendolo in paragrafi gestibili"""
	content_title = title
	content_type = type

	# Ottieni il contenuto dal ContentManager o direttamente dalla classe
	var content_text = ""
	if content_manager:
		match type:
			"storia":
				content_text = content_manager.get_story_content()
				final_message = "═══ FINE INTRODUZIONE NARRATIVA ═══"
			"istruzioni":
				content_text = content_manager.get_instructions_content()
				final_message = "═══ FINE INFORMAZIONI OPERATIVE ═══"

	if content_text.is_empty():
		# Fallback con contenuti diretti
		print("⚠️ Fallback: Uso contenuti diretti")
		match type:
			"storia":
				content_text = get_fallback_story_content()
			"istruzioni":
				content_text = get_fallback_instructions_content()
		final_message = "═══ FINE CONTENUTO ═══"

	# Dividi tutto il testo in PAGINE che stanno nel riquadro
	create_text_pages(content_text)

func create_text_pages(text: String):
	"""Divide tutto il testo in pagine che stanno nel riquadro"""
	content_paragraphs.clear()

	# Calcola quanti caratteri stanno in una pagina (approssimativo)
	var chars_per_line = 60 # Stima caratteri per riga nel riquadro
	var lines_per_page = 12 # Righe che stanno nel riquadro
	var chars_per_page = chars_per_line * lines_per_page # ~720 caratteri per pagina

	var total_length = text.length()
	var current_pos = 0

	while current_pos < total_length:
		var page_end = min(current_pos + chars_per_page, total_length)

		# Trova un punto di taglio naturale (spazio, punto o fine riga)
		if page_end < total_length:
			var best_cut = page_end
			for i in range(page_end, max(current_pos, page_end - 100), -1):
				if text[i] in [' ', '.', '\n', '!', '?']:
					best_cut = i + 1
					break
			page_end = best_cut

		var page_text = text.substr(current_pos, page_end - current_pos).strip_edges()
		if not page_text.is_empty():
			content_paragraphs.append(page_text)

		current_pos = page_end

	total_pages = content_paragraphs.size()
	update_page_indicator()

func setup_input_handling():
	"""Configura la gestione input da tastiera"""
	set_process_unhandled_input(true)

func setup_audio():
	"""Configura audio opzionale per effetti retro"""
	audio_player = AudioStreamPlayer.new()
	add_child(audio_player)

# 🎬 PRESENTAZIONE CONTENUTO
func start_content_presentation():
	"""Avvia la presentazione del contenuto"""
	print("📖 Avvio presentazione contenuto retro...")
	story_display.text = ""
	current_paragraph_index = 0
	show_next_paragraph()

func show_next_paragraph():
	"""Mostra la prossima PAGINA di testo completa"""
	if current_paragraph_index >= content_paragraphs.size():
		# Contenuto completato
		show_content_completed()
		return

	is_processing = true
	continue_button.visible = false

	# Prendi la pagina completa (non più singolo paragrafo)
	var page_text = content_paragraphs[current_paragraph_index]

	# Formatta la pagina per evidenziare parole chiave
	var formatted_page = format_paragraph_for_display(page_text)

	# Mostra TUTTA la pagina nel riquadro
	story_display.text = formatted_page

	# Determina se mostrare CONTINUA
	current_paragraph_index += 1
	if current_paragraph_index < content_paragraphs.size():
		# Ci sono ancora pagine da mostrare
		show_continue_option()
	else:
		# Ultima pagina
		show_content_completed()

func format_paragraph_for_display(paragraph: String) -> String:
	"""Formatta il paragrafo per il display terminale con evidenziazioni"""
	var formatted = paragraph

	# Evidenzia parole chiave in giallo
	var keywords = ["Guerra Inespressa", "Grande Silenzio", "Safe Place", "Europa Centrale", "Ultimo"]
	for keyword in keywords:
		formatted = formatted.replace(keyword, "[color=" + TERMINAL_AMBER.to_html() + "]" + keyword + "[/color]")

	# Evidenzia dialoghi in verde brillante
	if "\"" in formatted:
		formatted = formatted.replace("\"", "[color=" + TERMINAL_GREEN_BRIGHT.to_html() + "]\"") + "[/color]"

	return formatted

func show_continue_option():
	"""Mostra l'opzione per continuare con il testo rimanente"""
	is_waiting_for_continue = true
	continue_button.visible = true
	continue_button.grab_focus()

func show_content_completed():
	"""Mostra il completamento del contenuto"""
	continue_button.visible = false

	# Aggiungi messaggio di completamento
	await get_tree().create_timer(1.0).timeout
	story_display.text += "\n\n[center][color=" + TERMINAL_AMBER.to_html() + "]" + final_message + "[/color][/center]"

	back_button.grab_focus()

# 🎮 GESTIONE INPUT
func _unhandled_input(event: InputEvent):
	"""Gestisce input da tastiera"""
	if event is InputEventKey and event.pressed:
		match event.keycode:
			KEY_SPACE, KEY_ENTER:
				if is_waiting_for_continue:
					_on_continue_pressed()
				elif not is_processing:
					show_next_paragraph()
			KEY_ESCAPE:
				_on_back_pressed()

func _on_continue_pressed():
	"""Carica la prossima pagina di testo"""
	if not is_waiting_for_continue:
		return

	is_waiting_for_continue = false
	current_page += 1
	update_page_indicator()

	# Carica direttamente la prossima pagina
	continue_button.visible = false

	# Fade out completo
	var fade_tween = create_tween()
	fade_tween.tween_property(story_display, "modulate:a", 0.0, 0.15)

	# Aspetta che il fade out sia completo
	await fade_tween.finished

	# CAMBIA IL TESTO MENTRE È INVISIBILE
	show_next_paragraph()

	# Fade in con nuovo testo
	var fade_in_tween = create_tween()
	fade_in_tween.tween_property(story_display, "modulate:a", 1.0, 0.15)

func _on_back_pressed():
	"""Torna al menu principale"""
	if on_back_pressed.is_valid():
		on_back_pressed.call()

func update_page_indicator():
	"""Aggiorna l'indicatore di sezione"""
	if total_pages > 1:
		page_indicator.text = "Sezione %d di %d" % [current_page, total_pages]
		page_indicator.visible = true
	else:
		page_indicator.visible = false

func set_back_callback(callback: Callable):
	"""Imposta il callback per il ritorno al menu"""
	on_back_pressed = callback

func initialize_and_start(title: String, type: String, back_callback: Callable):
	"""Inizializza e avvia la presentazione del contenuto"""
	set_back_callback(back_callback)
	setup_content(title, type)
	update_header_for_content_type(type)
	start_content_presentation()

func update_header_for_content_type(type: String):
	"""Aggiorna l'header in base al tipo di contenuto"""
	if terminal_header:
		match type:
			"storia":
				terminal_header.text = "La Storia"
			"istruzioni":
				terminal_header.text = "Istruzioni: Lettera di un Padre"
			_:
				terminal_header.text = "CONTENUTO SISTEMA"

func get_fallback_story_content() -> String:
	"""Contenuto fallback per la storia"""
	return """L'Eco del Silenzio

Il mondo che Ultimo conosceva era fatto di sussurri e acciaio freddo, di lezioni impartite da un padre con occhi stanchi ma mani salde.

Diciassette anni vissuti all'ombra di una catastrofe che aveva inghiottito il passato, lasciando solo echi distorti: la "Guerra Inespressa", il "Grande Silenzio".

Della madre, Ultimo conservava solo un calore sbiadito nel petto, un nome quasi dimenticato. Il "prima" era una favola raccontata a bassa voce, un sogno di cieli azzurri e città luminose, così diverso dai grigiori malati e dalle rovine scheletriche che ora graffiavano l'orizzonte dell'Europa Centrale.

Suo padre gli aveva insegnato a leggere i segni del vento carico di polveri tossiche, a distinguere il fruscio di una bestia mutata da quello innocuo delle lamiere contorte, a trovare acqua dove sembrava esserci solo aridità.

Ogni giorno era una lezione di sopravvivenza, ogni notte un monito sulla fragilità della vita.

Poi, anche il padre era partito. Una missione avvolta nel mistero, un addio affrettato con la promessa di un ritorno che tardava troppo.

Le scorte lasciate con cura si assottigliavano, e con esse la speranza. Rimaneva solo un messaggio frammentario, l'ultima eco della voce paterna: "...trova il Safe Place, Ultimo. È la nostra unica possibilità..."

E così, armato di poco più che determinazione e gli insegnamenti paterni, Ultimo si preparò per il viaggio verso l'ignoto.

Il Safe Place lo aspettava da qualche parte, oltre l'orizzonte spezzato del mondo che conosceva."""

func get_fallback_instructions_content() -> String:
	"""Contenuto fallback per le istruzioni"""
	return """Figlio Mio, Ultimo...

Se stai leggendo queste parole, significa che non sono tornato in tempo, e le scorte che ti ho lasciato stanno per finire. Il mio cuore è pesante, ma non c'è tempo per il dolore adesso. Devi essere forte, come ti ho insegnato. Il mondo là fuori è un lupo affamato, ma tu hai gli strumenti per non diventare la sua preda.

Ricorda le basi, sempre. La MAPPA è la tua guida; la E segna la speranza, il "Safe Place". Raggiungila. I TASTI DIREZIONALI (o W, A, S, D) saranno le tue gambe. Ogni passo ha un costo: CIBO e ACQUA sono vita. Non lasciarli mai scarseggiare, o la debolezza e il logorio degli HP ti consumeranno. Vigila sulla tua CONDIZIONE – ferite, malanni, veleni – sono nemici silenziosi.

Il tempo è un fiume crudele, il GIORNO un breve respiro prima del gelo e dei pericoli della NOTTE. Prima che il sole muoia, cerca un RIFUGIO ('R'). Lì troverai riposo fino all'alba e, con un po' di fortuna, qualcosa di utile. Esplorali di giorno, ma ricorda che ogni azione costa tempo. Villaggi ('V') e Città ('C') sono rovine piene di echi e pericoli, non fidarti ciecamente del loro apparente riparo notturno.

Il tuo INVENTARIO è piccolo, riempilo con ciò che è essenziale. Clicca su un oggetto per capire come usarlo, equipaggiarlo o, se necessario, lasciarlo andare.

La strada ti metterà di fronte a EVENTI e scelte difficili. Fidati del tuo PRESAGIO, delle tue ABILITÀ, ma soprattutto del tuo giudizio. Non tutte le lotte vanno combattute; a volte, la saggezza sta nel sapere quando fuggire.

Ti ho insegnato tutto ciò che potevo. Ora sei solo, è vero, ma non sei impreparato. La mia missione mi chiama lontano, e non so se queste parole saranno il mio ultimo abbraccio o solo un arrivederci. Ma tu, Ultimo, tu devi sopravvivere.

Trova il Safe Place.

Con tutto l'amore che un padre può dare,
Papà.

LEGENDA MAPPA:
@ = Tu (il personaggio)
E = Safe Place (Obiettivo finale)
R = Rifugio (Riposo sicuro notturno)
V = Villaggio (Ricerche e commercio)
C = Città (Risorse abbondanti, pericoli maggiori)
~ = Fiumi (Fonte di acqua)
^ = Montagne (Terreno difficile)
. = Pianura (Terreno normale)
# = Foresta (Possibili risorse, possibili pericoli)"""

# 🧹 CLEANUP
func _exit_tree():
	"""Pulizia risorse"""
	if content_tween:
		content_tween.kill() 
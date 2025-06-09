extends Node
class_name MenuTransitions

# 🎬 SISTEMA TRANSIZIONI MENU SAFEPLACE
# Effetti visivi anni 80: CRT, typewriter, fade progressivo
# Coerente con estetica retrò del gioco

# 🎨 CONFIGURAZIONE EFFETTI
const INTRO_DELAY = 1.0 # Ritardo iniziale (1 secondo)
const FADE_DURATION = 0.5 # Durata fade standard
const TYPEWRITER_SPEED = 0.03 # Velocità effetto macchina da scrivere
const BUTTON_APPEAR_INTERVAL = 0.1 # Intervallo apparizione pulsanti
const SHUTDOWN_DURATION = 0.8 # Durata effetto spegnimento CRT

# 🎭 RIFERIMENTI COMPONENTI
var target_node: Control
var tween: Tween

# 🚀 INIZIALIZZAZIONE
func _ready():
	print("🎬 MenuTransitions: Sistema effetti inizializzato")

func setup_target(node: Control):
	"""Imposta il nodo target per le animazioni"""
	target_node = node
	print("🎯 MenuTransitions: Target impostato - ", node.name)

# 🎬 SEQUENZA INTRO PRINCIPALE
func start_intro_sequence(components: Dictionary) -> void:
	"""
	Avvia la sequenza intro completa del menu
	components: {"image": TextureRect, "title": Label, "subtitle": Label, "buttons": Array, "footer": Label}
	"""
	if not target_node:
		push_error("❌ MenuTransitions: Target node non impostato!")
		return

	print("🎬 Avvio sequenza intro SafePlace...")

	# Nascondi tutti i componenti inizialmente
	_hide_all_components(components)

	# Crea la sequenza animata
	tween = create_tween()
	tween.set_parallel(true) # Permette animazioni parallele

	var timeline = 0.0

	# t=1.0s: Immagine header fade-in
	timeline += INTRO_DELAY
	_schedule_image_fadein(components.get("image"), timeline)

	# t=1.5s: Titolo typewriter
	timeline += 0.5
	_schedule_typewriter(components.get("title"), "The Safe Place", timeline)

	# t=1.8s: Sottotitolo fade-in
	timeline += 0.3
	_schedule_fade_in(components.get("subtitle"), timeline, 0.2)

	# t=2.0s: Pulsanti menu apparizione progressiva
	timeline += 0.2
	_schedule_buttons_sequence(components.get("buttons"), timeline)

	# t=2.5s: Footer informazioni
	timeline += 0.5
	_schedule_fade_in(components.get("footer"), timeline, 0.3)

	print("✅ Sequenza intro programmata, durata totale: %.1fs" % (timeline + 0.3))

func _hide_all_components(components: Dictionary) -> void:
	"""Nasconde tutti i componenti del menu"""
	for key in components:
		var component = components[key]
		if component == null:
			continue

		if component is Array:
			# Array di pulsanti
			for button in component:
				if button and button.has_method("set_modulate"):
					button.modulate.a = 0.0
		else:
			# Singolo componente
			if component.has_method("set_modulate"):
				component.modulate.a = 0.0

func _schedule_image_fadein(image: TextureRect, delay: float) -> void:
	"""Programma il fade-in dell'immagine header"""
	if not image:
		return

	tween.tween_callback(_animate_image_fadein.bind(image)).set_delay(delay)

func _animate_image_fadein(image: TextureRect) -> void:
	"""Anima il fade-in dell'immagine con effetto leggermente irregolare (CRT style)"""
	var image_tween = create_tween()

	# Effetto "accensione monitor" - prima appare, poi si stabilizza
	image.modulate.a = 0.0
	image_tween.tween_property(image, "modulate:a", 0.3, 0.1)
	image_tween.tween_property(image, "modulate:a", 1.0, 0.4)

	print("📺 Immagine header attivata")

func _schedule_typewriter(label: Label, text: String, delay: float) -> void:
	"""Programma l'effetto typewriter per una label"""
	if not label:
		return

	tween.tween_callback(_animate_typewriter.bind(label, text)).set_delay(delay)

func _animate_typewriter(label: Label, text: String) -> void:
	"""Anima l'effetto macchina da scrivere"""
	if not label:
		return

	label.modulate.a = 1.0
	label.text = ""

	var typewriter_tween = create_tween()
	var char_count = text.length()

	for i in range(char_count + 1):
		var partial_text = text.substr(0, i)
		typewriter_tween.tween_callback(
			func(): label.text = partial_text
		).set_delay(i * TYPEWRITER_SPEED)

	print("⌨️ Typewriter '%s' avviato (%d caratteri)" % [text, char_count])

func _schedule_fade_in(node: Control, delay: float, duration: float) -> void:
	"""Programma un fade-in semplice"""
	if not node:
		return

	tween.tween_callback(_animate_fade_in.bind(node, duration)).set_delay(delay)

func _animate_fade_in(node: Control, duration: float) -> void:
	"""Anima un fade-in semplice"""
	if not node:
		return

	var fade_tween = create_tween()
	node.modulate.a = 0.0
	fade_tween.tween_property(node, "modulate:a", 1.0, duration)

	print("✨ Fade-in attivato per: ", node.name)

func _schedule_buttons_sequence(buttons: Array, start_delay: float) -> void:
	"""Programma l'apparizione sequenziale dei pulsanti"""
	if not buttons or buttons.is_empty():
		return

	for i in range(buttons.size()):
		var button = buttons[i]
		if button:
			var delay = start_delay + (i * BUTTON_APPEAR_INTERVAL)
			tween.tween_callback(_animate_button_appear.bind(button)).set_delay(delay)

func _animate_button_appear(button: Control) -> void:
	"""Anima l'apparizione di un singolo pulsante"""
	if not button:
		return

	var button_tween = create_tween()
	button.modulate.a = 0.0
	button.scale = Vector2(0.8, 0.8) # Inizia leggermente più piccolo

	# Animazione combinata: fade + leggero scaling
	button_tween.set_parallel(true)
	button_tween.tween_property(button, "modulate:a", 1.0, 0.2)
	button_tween.tween_property(button, "scale", Vector2(1.0, 1.0), 0.2)

	print("🎮 Pulsante attivato: ", button.name if button.has_method("get_name") else "Pulsante")

# 🔄 TRANSIZIONE SPEGNIMENTO MENU
func start_shutdown_transition(on_complete: Callable) -> void:
	"""
	Avvia l'effetto spegnimento menu - scompare al contrario dell'apparizione
	on_complete: Callback da chiamare al completamento
	"""
	print("🔌 Avvio transizione spegnimento menu (inverso)...")

	if not target_node:
		push_error("❌ Target node non disponibile per shutdown!")
		if on_complete.is_valid():
			on_complete.call()
		return

	# Spegnimento al contrario dell'apparizione
	var shutdown_tween = create_tween()
	shutdown_tween.set_parallel(false) # Sequenziale

	# Ottengo i componenti del menu per spegnerli nell'ordine inverso
	var components = _get_menu_components()

	# Fase 1: Footer scompare per primo
	if components.has("footer") and components.footer:
		shutdown_tween.tween_property(components.footer, "modulate:a", 0.0, 0.15)

	# Fase 2: Pulsanti scompaiono in ordine inverso (dall'ultimo al primo)
	if components.has("buttons"):
		for i in range(components.buttons.size() - 1, -1, -1):
			var button = components.buttons[i]
			if button:
				shutdown_tween.tween_property(button, "modulate:a", 0.0, 0.1)
				shutdown_tween.tween_property(button, "scale", Vector2(0.8, 0.8), 0.1)

	# Fase 3: Sottotitolo scompare
	if components.has("subtitle") and components.subtitle:
		shutdown_tween.tween_property(components.subtitle, "modulate:a", 0.0, 0.1)

	# Fase 4: Titolo scompare con effetto typewriter inverso
	if components.has("title") and components.title:
		shutdown_tween.tween_callback(_reverse_typewriter.bind(components.title))
		shutdown_tween.tween_interval(0.4) # Tempo per completare reverse typewriter

	# Fase 5: Immagine scompare per ultima
	if components.has("image") and components.image:
		shutdown_tween.tween_property(components.image, "modulate:a", 0.0, 0.3)

	# Callback al completamento
	if on_complete.is_valid():
		shutdown_tween.tween_callback(on_complete)

	print("✅ Shutdown menu programmato, durata: ~1.5s")

func _get_menu_components() -> Dictionary:
	"""Recupera i componenti del menu per le transizioni"""
	var components = {}

	if not target_node:
		return components

	# Cerca i componenti nella struttura del menu
	var centered_container = target_node.get_node_or_null("MainContainer/CenteredContainer")
	if centered_container:
		components["image"] = centered_container.get_node_or_null("ImageHeader")
		components["title"] = centered_container.get_node_or_null("TitleLabel")
		components["subtitle"] = centered_container.get_node_or_null("SubtitleLabel")
		components["footer"] = centered_container.get_node_or_null("FooterLabel")

		# Recupera i pulsanti
		var buttons_container = centered_container.get_node_or_null("MenuButtonsContainer")
		if buttons_container:
			var buttons = []
			for child in buttons_container.get_children():
				if child is Button:
					buttons.append(child)
			components["buttons"] = buttons

	return components

func _reverse_typewriter(label: Label) -> void:
	"""Effetto typewriter inverso - rimuove caratteri uno per volta"""
	if not label or label.text.is_empty():
		return

	var original_text = label.text
	var typewriter_tween = create_tween()

	# Rimuove caratteri dal fondo verso l'inizio
	for i in range(original_text.length(), -1, -1):
		var partial_text = original_text.substr(0, i)
		typewriter_tween.tween_callback(
			func(): label.text = partial_text
		).set_delay((original_text.length() - i) * TYPEWRITER_SPEED)

	print("⌨️ Reverse typewriter avviato per: '%s'" % original_text)

func _create_crt_shutdown_effect() -> void:
	"""Crea l'effetto visivo di spegnimento CRT (linea orizzontale che si chiude) - NON PIÙ USATO"""
	# Questa funzione è mantenuta per compatibilità ma non è più utilizzata
	# La nuova transizione usa lo spegnimento progressivo inverso
	print("📺 Effetto CRT shutdown (legacy) - non utilizzato")

# 🎭 TRANSIZIONI SPECIALI
func quick_fade_transition(node: Control, target_alpha: float, duration: float = 0.3) -> Tween:
	"""Crea una transizione fade veloce per cambio schermata"""
	var quick_tween = create_tween()
	quick_tween.tween_property(node, "modulate:a", target_alpha, duration)
	return quick_tween

func typewriter_effect(label: Label, text: String, speed: float = TYPEWRITER_SPEED) -> Tween:
	"""Effetto typewriter generico utilizzabile ovunque"""
	var typewriter_tween = create_tween()

	if not label:
		push_error("❌ Label non valida per typewriter effect!")
		return typewriter_tween

	label.text = ""
	var char_count = text.length()

	for i in range(char_count + 1):
		var partial_text = text.substr(0, i)
		typewriter_tween.tween_callback(
			func(): label.text = partial_text
		).set_delay(i * speed)

	return typewriter_tween

# 🧪 UTILITY E DEBUG
func test_intro_sequence() -> void:
	"""Funzione di test per la sequenza intro"""
	print("🧪 Test sequenza intro MenuTransitions...")

	# Crea componenti mock per test
	var mock_components = {
		"image": null,
		"title": Label.new(),
		"subtitle": Label.new(),
		"buttons": [Button.new(), Button.new(), Button.new()],
		"footer": Label.new()
	}

	start_intro_sequence(mock_components)

func cleanup() -> void:
	"""Pulisce le risorse utilizzate"""
	if tween:
		tween.kill()
		tween = null

	target_node = null
	print("🧹 MenuTransitions: Risorse pulite")

func _exit_tree():
	"""Cleanup automatico quando il nodo viene rimosso"""
	cleanup()

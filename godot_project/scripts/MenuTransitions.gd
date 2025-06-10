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
const SHUTDOWN_DURATION = 1.5 # Durata effetto spegnimento CRT

# 🎭 RIFERIMENTI COMPONENTI
var target_node: Control
var tween: Tween

# 📡 SEGNALI
signal shutdown_completed

# 🚀 INIZIALIZZAZIONE
func _ready():
	print("🎬 MenuTransitions: Sistema effetti inizializzato")

func setup_target(node: Control):
	"""Imposta il nodo target per le animazioni"""
	target_node = node
	print("🎯 MenuTransitions: Target impostato - ", node.name)

# 🎬 SEQUENZA INTRO PRINCIPALE
func start_intro_sequence():
	"""Avvia la sequenza intro completa del menu"""
	if not target_node:
		push_error("❌ MenuTransitions: Target node non impostato!")
		return

	print("🎬 Avvio sequenza intro SafePlace...")

	# Ottieni i componenti
	var components = _get_menu_components()
	
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

func _get_menu_components() -> Dictionary:
	"""Ottiene i componenti del menu dal target node"""
	var components = {}
	
	if not target_node:
		return components
	
	# Cerca componenti per nome
	components["image"] = target_node.find_child("ImageHeader")
	components["title"] = target_node.find_child("TitleLabel")
	components["subtitle"] = target_node.find_child("SubtitleLabel")
	components["footer"] = target_node.find_child("FooterLabel")
	
	# Cerca i pulsanti
	var buttons = []
	var button_container = target_node.find_child("MenuButtonsContainer")
	if button_container:
		for child in button_container.get_children():
			if child is Button:
				buttons.append(child)
	components["buttons"] = buttons
	
	return components

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
func start_shutdown_sequence():
	"""Avvia l'effetto spegnimento menu - scompare al contrario dell'apparizione"""
	print("🔌 Avvio transizione spegnimento menu (inverso)...")

	if not target_node:
		push_error("❌ Target node non disponibile per shutdown!")
		shutdown_completed.emit()
		return

	# Ottieni i componenti
	var components = _get_menu_components()

	# Spegnimento al contrario dell'apparizione
	var shutdown_tween = create_tween()
	shutdown_tween.set_parallel(false) # Sequenziale

	# Fase 1: Footer scompare per primo (0.2s)
	if components.has("footer") and components.footer:
		shutdown_tween.tween_property(components.footer, "modulate:a", 0.0, 0.2)

	# Fase 2: Pulsanti scompaiono in ordine inverso (0.5s)
	shutdown_tween.tween_callback(_animate_buttons_shutdown.bind(components.get("buttons", [])))

	# Fase 3: Sottotitolo scompare (0.2s) - uso set_delay per ritardare
	if components.has("subtitle") and components.subtitle:
		shutdown_tween.tween_property(components.subtitle, "modulate:a", 0.0, 0.2).set_delay(0.5)

	# Fase 4: Titolo scompare con effetto typewriter inverso (0.4s)
	if components.has("title") and components.title:
		shutdown_tween.tween_callback(_animate_typewriter_reverse.bind(components.title)).set_delay(0.7)

	# Fase 5: Immagine scompare con effetto CRT (0.2s)
	if components.has("image") and components.image:
		shutdown_tween.tween_callback(_animate_image_shutdown.bind(components.image)).set_delay(1.1)

	# Emetti segnale completamento
	shutdown_tween.tween_callback(func(): shutdown_completed.emit())

	print("✅ Sequenza shutdown programmata, durata: %.1fs" % SHUTDOWN_DURATION)

func _animate_buttons_shutdown(buttons: Array) -> void:
	"""Anima la scomparsa dei pulsanti in ordine inverso"""
	if not buttons or buttons.is_empty():
		return

	var button_tween = create_tween()
	button_tween.set_parallel(true)

	# Scomparsa inversa - dall'ultimo al primo
	for i in range(buttons.size()):
		var button = buttons[buttons.size() - 1 - i]
		if button:
			var delay = i * 0.1
			button_tween.tween_property(button, "modulate:a", 0.0, 0.15).set_delay(delay)

	print("🎮 Spegnimento pulsanti avviato")

func _animate_typewriter_reverse(label: Label) -> void:
	"""Anima l'effetto typewriter inverso (cancellazione caratteri)"""
	if not label or label.text.is_empty():
		return

	var current_text = label.text
	var typewriter_tween = create_tween()

	for i in range(current_text.length(), -1, -1):
		var partial_text = current_text.substr(0, i)
		typewriter_tween.tween_callback(
			func(): label.text = partial_text
		).set_delay((current_text.length() - i) * TYPEWRITER_SPEED)

	print("⌨️ Typewriter reverse avviato")

func _animate_image_shutdown(image: TextureRect) -> void:
	"""Anima la scomparsa dell'immagine con effetto CRT spegnimento"""
	if not image:
		return

	var image_tween = create_tween()
	
	# Effetto "spegnimento monitor" - prima si riduce, poi scompare
	image_tween.tween_property(image, "modulate:a", 0.3, 0.1)
	image_tween.tween_property(image, "modulate:a", 0.0, 0.1)

	print("📺 Spegnimento immagine CRT avviato") 
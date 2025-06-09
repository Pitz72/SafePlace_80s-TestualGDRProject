class_name EventDialog
extends Control

## Dialog per eventi lore narrativi di SafePlace
## Gestisce visualizzazione eventi, scelte, e comunicazione con EventManager

# Riferimenti UI
@onready var title_label: RichTextLabel = $DialogPanel/VBoxContainer/TitleLabel
@onready var description_label: RichTextLabel = $DialogPanel/VBoxContainer/DescriptionLabel
@onready var choices_container: VBoxContainer = $DialogPanel/VBoxContainer/ChoicesContainer
@onready var close_button: Button = $DialogPanel/VBoxContainer/CloseButton

# Riferimenti sistema
var event_manager: EventManager
var current_event: Dictionary = {}

# Segnali
signal choice_selected(choice_index: int, choice_data: Dictionary)
signal dialog_closed()

func _ready():
	hide() # Inizialmente nascosto
	close_button.pressed.connect(_on_close_pressed)

## Mostra un evento lore
func show_lore_event(event_data: Dictionary, event_mgr: EventManager):
	current_event = event_data
	event_manager = event_mgr

	# Aggiorna UI
	_update_display()

	# Mostra dialog
	show()

	print("🎭 EventDialog: Mostrando evento '%s'" % event_data.get("title", ""))

## Aggiorna display con dati evento
func _update_display():
	if current_event.is_empty():
		return

	# Titolo con stile terminale
	var title = current_event.get("title", "Evento Sconosciuto")
	title_label.text = "[center][color=#00B347]%s[/color][/center]" % title

	# Descrizione narrativa
	var description = current_event.get("description", "Nessuna descrizione disponibile.")
	description_label.text = "[color=#00B347]%s[/color]" % description

	# Crea bottoni per le scelte
	_create_choice_buttons()

## Crea bottoni per le scelte disponibili
func _create_choice_buttons():
	# Rimuovi bottoni esistenti
	for child in choices_container.get_children():
		child.queue_free()

	var choices = current_event.get("choices", [])

	if choices.is_empty():
		# Evento senza scelte (solo narrativo)
		close_button.text = "CONTINUA"
		return

	# Crea bottone per ogni scelta
	for i in range(choices.size()):
		var choice = choices[i]
		var button = Button.new()

		# Configura bottone
		button.text = choice.get("text", "Scelta %d" % (i + 1))
		button.custom_minimum_size = Vector2(0, 40)
		button.theme = preload("res://themes/SafePlaceTheme.tres")

		# Connetti segnale
		button.pressed.connect(_on_choice_pressed.bind(i, choice))

		# Aggiungi al container
		choices_container.add_child(button)

	# Nascondi bottone chiudi se ci sono scelte
	close_button.visible = choices.is_empty()

## Callback per scelta selezionata
func _on_choice_pressed(choice_index: int, choice_data: Dictionary):
	print("🎯 Scelta selezionata: %s" % choice_data.get("text", ""))

	# Mostra outcome della scelta
	_show_choice_outcome(choice_data)

	# Applica effetti della scelta
	if event_manager and choice_data.has("effects"):
		event_manager.apply_lore_choice_effects(choice_data.effects)

	# Emetti segnale
	choice_selected.emit(choice_index, choice_data)

## Mostra outcome della scelta fatta
func _show_choice_outcome(choice_data: Dictionary):
	var outcome = choice_data.get("outcome", "")
	if outcome != "":
		# Aggiorna descrizione con outcome
		description_label.text += "\n\n[color=#FFD700]> %s[/color]" % outcome

		# Rimuovi bottoni scelte
		for child in choices_container.get_children():
			child.queue_free()

		# Mostra bottone continua
		close_button.visible = true
		close_button.text = "CONTINUA"

## Callback per chiusura dialog
func _on_close_pressed():
	_close_dialog()

## Chiude il dialog
func _close_dialog():
	hide()
	current_event.clear()
	dialog_closed.emit()

	print("🎭 EventDialog: Dialog chiuso")

## Utility: resetta dialog per nuovo evento
func reset_dialog():
	current_event.clear()

	# Pulisci UI
	title_label.text = ""
	description_label.text = ""

	for child in choices_container.get_children():
		child.queue_free()

	close_button.text = "CHIUDI"
	close_button.visible = true

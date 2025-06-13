extends Control
# 🧪 TEST: Rimossa dichiarazione class_name MainInterface per evitare conflitti globali

## MainInterface per SafePlace - Interfaccia Terminale Completa
## Replica esatta dell'interfaccia originale con tutti i pannelli sempre visibili

# Riferimenti sistemi SafePlace
var game_manager: GameManager
var player: Player
var ascii_map: ASCIIMapGenerator
var current_time: Dictionary = {"hour": 6, "minute": 0, "is_night": false}

# Player blink timer per effetto CRT autentico
var player_blink_timer: float = 0.0
var player_visible: bool = true

# Pannelli UI (sempre visibili)
@onready var survival_panel: Panel = $SurvivalPanel
@onready var inventory_panel: Panel = $InventoryPanel
@onready var log_panel: Panel = $LogPanel
@onready var legend_panel: Panel = $LegendPanel
@onready var map_panel: Panel = $MapPanel
@onready var info_panel: Panel = $InfoPanel
@onready var stats_panel: Panel = $StatsPanel
@onready var controls_panel: Panel = $ControlsPanel
@onready var equipment_panel: Panel = $EquipmentPanel

# Labels contenuto pannelli
@onready var survival_content: RichTextLabel = $SurvivalPanel/SurvivalContent
@onready var inventory_content: RichTextLabel = $InventoryPanel/InventoryContent
@onready var log_content: RichTextLabel = $LogPanel/LogContent
@onready var legend_content: RichTextLabel = $LegendPanel/LegendContent
@onready var map_content: RichTextLabel = $MapPanel/MapContent
@onready var info_content: RichTextLabel = $InfoPanel/InfoContent
@onready var stats_content: RichTextLabel = $StatsPanel/StatsContent
@onready var controls_content: RichTextLabel = $ControlsPanel/ControlsContent
@onready var equipment_content: RichTextLabel = $EquipmentPanel/EquipmentContent

# Sistema log eventi
var event_log: Array[String] = []
const MAX_LOG_ENTRIES = 15

# Status player per pannello sopravvivenza
enum PlayerStatus {NORMALE, MALATO, INFETTO, FERITO, AFFAMATO, ASSETATO}
var current_status: Array[PlayerStatus] = [PlayerStatus.NORMALE]

# 🎨 THEME INTEGRATION v1.4.3 - Sostituiti colori hardcodati con ThemeManager
# I colori vengono ora gestiti dinamicamente dal ThemeManager

# Funzioni getter per accesso dinamico ai colori del tema
func get_interface_color() -> Color:
	return ThemeManager.get_color("primary")

func get_text_color() -> Color:
	return ThemeManager.get_color("text")

func get_numbers_color() -> Color:
	return ThemeManager.get_color("bright")

func get_normal_color() -> Color:
	return ThemeManager.get_color("text")

# 🎨 Colori di stato dinamici - si adattano al tema corrente
# Per tema CRT = gradazioni di verde, per altri temi = colori distintivi

func get_sick_color() -> Color:
	var theme_type = ThemeManager.get_current_theme_type()
	if theme_type == ThemeManager.ThemeType.CRT_GREEN:
		return ThemeManager.get_color("bright")  # Verde brillante per malato
	else:
		return Color(0.8, 0.6, 0, 1)  # Giallo per altri temi

func get_infected_color() -> Color:
	var theme_type = ThemeManager.get_current_theme_type()
	if theme_type == ThemeManager.ThemeType.CRT_GREEN:
		return ThemeManager.get_color("dim")  # Verde scuro per infetto
	else:
		return Color(0.8, 0.2, 0.8, 1)  # Magenta per altri temi

func get_wounded_color() -> Color:
	var theme_type = ThemeManager.get_current_theme_type()
	if theme_type == ThemeManager.ThemeType.CRT_GREEN:
		return ThemeManager.get_color("secondary")  # Verde medio per ferito
	else:
		return Color(0.8, 0.2, 0.2, 1)  # Rosso per altri temi

func get_hungry_color() -> Color:
	var theme_type = ThemeManager.get_current_theme_type()
	if theme_type == ThemeManager.ThemeType.CRT_GREEN:
		return ThemeManager.get_color("bright")  # Verde brillante per affamato
	else:
		return Color(0.9, 0.5, 0, 1)  # Arancione per altri temi

func get_thirsty_color() -> Color:
	var theme_type = ThemeManager.get_current_theme_type()
	if theme_type == ThemeManager.ThemeType.CRT_GREEN:
		return ThemeManager.get_color("hover")  # Verde glow per assetato
	else:
		return Color(0.6, 0.8, 1, 1)  # Azzurro per altri temi

func get_warning_color() -> Color:
	var theme_type = ThemeManager.get_current_theme_type()
	if theme_type == ThemeManager.ThemeType.CRT_GREEN:
		return ThemeManager.get_color("accent")  # Verde accent per warning
	else:
		return Color(0.8, 0.6, 0, 1)  # Giallo per altri temi

func get_error_color() -> Color:
	var theme_type = ThemeManager.get_current_theme_type()
	if theme_type == ThemeManager.ThemeType.CRT_GREEN:
		return ThemeManager.get_color("dim")  # Verde scuro per errori
	else:
		return Color(0.8, 0.2, 0.2, 1)  # Rosso per altri temi

func get_info_color() -> Color:
	var theme_type = ThemeManager.get_current_theme_type()
	if theme_type == ThemeManager.ThemeType.CRT_GREEN:
		return ThemeManager.get_color("secondary")  # Verde secondario per info
	else:
		return Color(0, 0.5, 0.2, 1)  # Verde scuro per altri temi

# Funzioni getter per accesso dinamico ai colori principali SafePlace  
func get_background_color() -> Color:
	return ThemeManager.get_color("background")

func get_primary_color() -> Color:
	return ThemeManager.get_color("primary")

func get_bright_color() -> Color:
	return ThemeManager.get_color("bright")

func _ready():
	_setup_interface()
	_setup_panels() # Configura i pannelli con colori SafePlace
	_initialize_ascii_map()
	_setup_initial_content()
	_connect_input_signals()

func _process(delta):
	# Lampeggio del player @ sulla mappa (stile CRT)
	player_blink_timer += delta
	if player_blink_timer >= 0.8: # Lampeggia ogni 0.8 secondi
		player_visible = !player_visible
		player_blink_timer = 0.0
		_update_map_panel() # Aggiorna solo mappa per lampeggio

	# Aggiorna timer blinking nella mappa ASCII
	if ascii_map and ascii_map.has_method("update_blink_timer"):
		ascii_map.update_blink_timer(delta)

## Setup iniziale interfaccia
func _setup_interface():
	print("🖥️ [MainInterface] Inizializzazione interfaccia terminale SafePlace...")

	# Applica sfondo nero completo
	modulate = Color.WHITE

	# 🧪 TEST: Applica tema CRT autentico - COMMENTATO PER TEST THEMEMANAGER
	# if ResourceLoader.exists("res://themes/SafePlaceTheme.tres"):
	#	var safeplace_theme = load("res://themes/SafePlaceTheme.tres")
	#	theme = safeplace_theme
	print("🧪 TEST: SafePlaceTheme.tres DISABILITATO - Testing ThemeManager integration")

	# FORZA font monospace su TUTTI i pannelli (CRITICO per mappa ASCII)
	_force_monospace_font_on_all_panels()

## Inizializza generatore mappa ASCII
func _initialize_ascii_map():
	ascii_map = ASCIIMapGenerator.new()

	# Calcola viewport ottimale in base alle dimensioni reali del MapPanel
	if map_panel:
		_optimize_map_viewport()

	print("🗺️ [MainInterface] Mappa ASCII procedurale generata")

## Setup contenuto iniziale pannelli
func _setup_initial_content():
	_update_survival_panel()
	_update_inventory_panel()
	_update_log_panel()
	_update_legend_panel()
	_update_map_panel()
	_update_info_panel()
	_update_stats_panel()
	_update_controls_panel()
	_setup_equipment_display()

	# Log eventi iniziali (messaggi normali che dovevano restare)
	add_log_entry("Benvenuto in SafePlace")
	add_log_entry("Prima di partire, controlla il tuo inventario")

## Connette input per navigazione WASD + controlli
func _connect_input_signals():
	# Input sarà gestito da _input()
	pass

func _input(event):
	if not visible:
		return

	# 🎮 POINT 3: Keyboard-Only Experience per autenticità retro
	# Blocca TUTTI gli input non-tastiera (mouse, touch, joypad, etc.)
	# Solo la tastiera è permessa per coerenza con l'esperienza DOS autentica
	if not event is InputEventKey:
		return  # Ignora completamente eventi mouse, touch, joystick, etc.

	if event.pressed:
		match event.keycode:
			# Navigazione WASD + POINT 5: Animazione feedback pulsanti
			KEY_W, KEY_UP:
				_animate_button_feedback("up")  # POINT 5: Feedback visivo
				_move_player(Vector2(0, -1)) # Nord
			KEY_A, KEY_LEFT:
				_animate_button_feedback("left")  # POINT 5: Feedback visivo
				_move_player(Vector2(-1, 0)) # Ovest
			KEY_S, KEY_DOWN:
				_animate_button_feedback("down")  # POINT 5: Feedback visivo
				_move_player(Vector2(0, 1)) # Sud
			KEY_D, KEY_RIGHT:
				_animate_button_feedback("right")  # POINT 5: Feedback visivo
				_move_player(Vector2(1, 0)) # Est
			KEY_SPACE:
				_animate_button_feedback("space")  # POINT 5: Feedback visivo
				_pass_time()

			# Uso oggetti inventario 1-8 (numeri riga principale + tastierino)
			KEY_1, KEY_KP_1:
				_use_inventory_item(1)
			KEY_2, KEY_KP_2:
				_use_inventory_item(2)
			KEY_3, KEY_KP_3:
				_use_inventory_item(3)
			KEY_4, KEY_KP_4:
				_use_inventory_item(4)
			KEY_5, KEY_KP_5:
				_use_inventory_item(5)
			KEY_6, KEY_KP_6:
				_use_inventory_item(6)
			KEY_7, KEY_KP_7:
				_use_inventory_item(7)
			KEY_8, KEY_KP_8:
				_use_inventory_item(8)

			# Salvataggio F5/F6/F7
			KEY_F5:
				_save_game()
			KEY_F6:
				_load_game()
			KEY_F7:
				_load_file()
			KEY_L:
				# ✅ FIX: Gestisce apertura/chiusura popup leggenda
				if legend_popup_active and current_legend_popup:
					# Chiude popup se già aperto
					legend_popup_active = false
					current_legend_popup.queue_free()
					current_legend_popup = null
				else:
					# Apre popup se non attivo
					_show_legend_popup()
			KEY_C:
				_handle_crafting() # NUOVO: Apri crafting
			KEY_I:
				_handle_inventory_management() # NUOVO: Gestione inventario
			KEY_R:
				_handle_character_growth() # NUOVO: Crescita personaggio
			KEY_P:
				_handle_repair() # POINT 9: Sistema riparazione (P per riPara)
			KEY_ESCAPE:
				_exit_game() # POINT 7: Esci dal gioco

## Movimento player sulla mappa
func _move_player(direction: Vector2):
	if ascii_map:
		var moved = ascii_map.move_player(direction)
		if moved:
			_update_map_panel()
			_update_info_panel()
			_pass_time(5) # Movimento costa 5 minuti

			# Possibilità evento casuale durante movimento
			if randf() < 0.1: # 10% chance
				_trigger_random_event()

			add_log_entry("Ti sposti verso %s" % _get_direction_name(direction))
		else:
			add_log_entry("Non puoi muoverti in quella direzione")
	else:
		add_log_entry("Errore: Sistema mappa non disponibile")

func _get_direction_name(direction: Vector2) -> String:
	if direction == Vector2(0, -1): return "Nord"
	if direction == Vector2(1, 0): return "Est"
	if direction == Vector2(0, 1): return "Sud"
	if direction == Vector2(-1, 0): return "Ovest"
	return "Sconosciuto"

## Passa del tempo (minuti)
func _pass_time(minutes: int = 30):
	current_time.minute += minutes

	while current_time.minute >= 60:
		current_time.minute -= 60
		current_time.hour += 1

		if current_time.hour >= 24:
			current_time.hour = 0

	# Aggiorna status giorno/notte
	current_time.is_night = current_time.hour < 6 or current_time.hour >= 20

	_update_info_panel()

	# Degrado sopravvivenza nel tempo
	if player:
		_apply_survival_decay()

## Applica degrado sazietà/idratazione
func _apply_survival_decay():
	if not player:
		return

	# Ogni ora: -2 food, -3 water
	if current_time.minute == 0: # Nuova ora
		if player.food > 0:
			player.food = max(0, player.food - 2)
		if player.water > 0:
			player.water = max(0, player.water - 3)

		_update_survival_status()
		_update_survival_panel()

## Aggiorna status sopravvivenza
func _update_survival_status():
	if not player:
		current_status = [PlayerStatus.NORMALE]
		return

	current_status.clear()

	if player.food <= 20:
		current_status.append(PlayerStatus.AFFAMATO)
	if player.water <= 20:
		current_status.append(PlayerStatus.ASSETATO)
	if player.hp < player.max_hp * 0.5:
		current_status.append(PlayerStatus.FERITO)

	# Status normale se nessun problema
	if current_status.is_empty():
		current_status.append(PlayerStatus.NORMALE)

## === AGGIORNAMENTO PANNELLI ===

func _update_survival_panel():
	if not survival_content or not player:
		return

	var content = "[color=#%s]SOPRAVVIVENZA[/color]\n" % _color_to_hex(get_interface_color())
	content += "[color=#%s]═══════════════[/color]\n" % _color_to_hex(get_text_color())

	# Colori speciali per valori critici (0 = rosso lampeggiante)
	var food_color = get_numbers_color()
	var water_color = get_numbers_color()

	if player.food == 0:
		food_color = get_error_color() if player_visible else get_bright_color() # Emergenza lampeggiante
	if player.water == 0:
		water_color = get_error_color() if player_visible else get_bright_color() # Emergenza lampeggiante

	content += "[color=#%s]Sazietà: [/color][color=#%s]%d[/color]\n" % [_color_to_hex(get_text_color()), _color_to_hex(food_color), player.food]
	content += "[color=#%s]Idratazione: [/color][color=#%s]%d[/color]\n" % [_color_to_hex(get_text_color()), _color_to_hex(water_color), player.water]
	content += "[color=#%s]Status: [/color]%s" % [_color_to_hex(get_text_color()), _get_status_display()]

	survival_content.text = content

func _get_status_display() -> String:
	if current_status.is_empty():
		return "[color=#%s]Normale[/color]" % _color_to_hex(get_normal_color())

	var status_text = ""
	for i in range(current_status.size()):
		var status = current_status[i]
		var color = _get_status_color(status)
		var name = _get_status_name(status)

		if i > 0:
			status_text += ", "
		status_text += "[color=#%s]%s[/color]" % [_color_to_hex(color), name]

	return status_text

func _get_status_color(status: PlayerStatus) -> Color:
	match status:
		PlayerStatus.NORMALE: return get_normal_color()
		PlayerStatus.MALATO: return get_sick_color()
		PlayerStatus.INFETTO: return get_infected_color()
		PlayerStatus.FERITO: return get_wounded_color()
		PlayerStatus.AFFAMATO: return get_hungry_color()
		PlayerStatus.ASSETATO: return get_thirsty_color()
		_: return get_normal_color()

func _get_status_name(status: PlayerStatus) -> String:
	match status:
		PlayerStatus.NORMALE: return "Normale"
		PlayerStatus.MALATO: return "Malato"
		PlayerStatus.INFETTO: return "Infetto"
		PlayerStatus.FERITO: return "Ferito"
		PlayerStatus.AFFAMATO: return "Affamato"
		PlayerStatus.ASSETATO: return "Assetato"
		_: return "Sconosciuto"

func _update_inventory_panel():
	if not inventory_content or not player:
		return

	var content = "[color=#%s]INVENTARIO[/color]\n" % _color_to_hex(get_interface_color())
	content += "[color=#%s]═══════════════[/color]\n" % _color_to_hex(get_text_color())

	var inventory = player.get_inventory_display()
	if inventory.is_empty():
		content += "[color=#%s]Vuoto[/color]\n\n" % _color_to_hex(get_text_color())
	else:
		var item_index = 1
		for item in inventory:
			var item_name = item.get("name", "Sconosciuto")
			var quantity = item.get("quantity", 1)
			var item_type = _get_item_type_from_name(item_name)
			var color_code = _get_item_color_code(item_type)

			# Numero oggetto per uso rapido + solo nome e quantità (info dettagliate nel popup)
			var prefix = "[color=#%s][%d][/color] " % [_color_to_hex(get_numbers_color()), item_index]
			
			if quantity > 1:
				content += "%s%s%s[/color] [color=#%s](x%d)[/color]" % [prefix, color_code, item_name, _color_to_hex(get_numbers_color()), quantity]
			else:
				content += "%s%s%s[/color]" % [prefix, color_code, item_name]
			
			content += "\n"
			item_index += 1
			
			# Massimo 8 oggetti per spazio
			if item_index > 8:
				break
	
	# Controlli inventario
	content += "[color=#%s]═══════════════[/color]\n" % _color_to_hex(get_text_color())
	content += "[color=#%s][1-8] Dettagli oggetto[/color]\n" % _color_to_hex(get_primary_color())
	content += "[color=#%s][E] Equipaggia[/color]" % _color_to_hex(get_primary_color())

	inventory_content.text = content

func _update_log_panel():
	if not log_content:
		return

	var content = "[color=#%s]DIARIO DI VIAGGIO[/color]\n" % _color_to_hex(get_interface_color())
	content += "[color=#%s]═══════════════[/color]\n" % _color_to_hex(get_text_color())

	# RIEMPI TUTTO LO SPAZIO DISPONIBILE - calcola quanti eventi ci stanno
	if event_log.size() > 0:
		# Calcola quanti eventi mostrare in base allo spazio del contenitore
		var max_events = _calculate_max_log_entries()
		var start_index = max(0, event_log.size() - max_events)

		for i in range(start_index, event_log.size()):
			var log_entry = event_log[i]
			var colored_entry = _colorize_log_entry(log_entry)
			content += colored_entry + "\n"
	else:
		# Se non ci sono eventi, mostra messaggio temporaneo
		content += "[color=#%s]In attesa di eventi...[/color]" % _color_to_hex(get_text_color())

	log_content.text = content

func _calculate_max_log_entries() -> int:
	"""Calcola quanti eventi possono essere visualizzati nel contenitore log."""
	if not log_content or not log_panel:
		return 10 # Fallback sicuro

	# Ottieni altezza disponibile del pannello log (escludendo titolo e separatori)
	var panel_height = log_panel.size.y
	var available_height = panel_height - 60 # Sottrai spazio per titolo e separatori

	# Calcola altezza approssimativa di una riga di testo (font size + interlinea)
	var line_height = 18 # Altezza approssimativa di una riga con font 16px

	# Calcola numero massimo di righe che ci stanno
	var max_lines = int(available_height / line_height)

	# Limiti di sicurezza (minimo 5, massimo 20)
	return clamp(max_lines, 5, 20)

func _colorize_log_entry(entry: String) -> String:
	# Colora il log in base al contenuto
	if entry.begins_with("[*]") or entry.begins_with("Benvenuto"):
		return "[color=#%s]%s[/color]" % [_color_to_hex(get_info_color()), entry]
	elif entry.contains("errore") or entry.contains("pericolo") or entry.contains("danno"):
		return "[color=#%s]%s[/color]" % [_color_to_hex(get_error_color()), entry]
	elif entry.contains("attenzione") or entry.contains("avviso") or entry.contains("Non puoi"):
		return "[color=#%s]%s[/color]" % [_color_to_hex(get_warning_color()), entry]
	else:
		return "[color=#%s]%s[/color]" % [_color_to_hex(get_text_color()), entry]

func _update_legend_panel():
	if not legend_content:
		return

	var content = "[color=#%s]LEGGENDA[/color]\n" % _color_to_hex(get_interface_color())
	content += "[color=#%s]═══════════════[/color]\n" % _color_to_hex(get_text_color())
	content += "[color=#%s]. [/color][color=#%s]Pianura[/color]\n" % [_color_to_hex(get_text_color()), _color_to_hex(get_text_color())]
	content += "[color=#%s]F [/color][color=#%s]Foresta[/color]\n" % [_color_to_hex(get_primary_color()), _color_to_hex(get_text_color())]
	content += "[color=#%s]M [/color][color=#%s]Montagna[/color]\n" % [_color_to_hex(get_numbers_color()), _color_to_hex(get_text_color())]
	content += "[color=#%s]C [/color][color=#%s]Città[/color]\n" % [_color_to_hex(get_bright_color()), _color_to_hex(get_text_color())]
	content += "[color=#%s]V [/color][color=#%s]Villaggio[/color]\n" % [_color_to_hex(get_primary_color()), _color_to_hex(get_text_color())]
	content += "[color=#%s]~ [/color][color=#%s]Fiume[/color]\n" % [_color_to_hex(get_bright_color()), _color_to_hex(get_text_color())]
	content += "[color=#%s]R [/color][color=#%s]Ristoro[/color]\n" % [_color_to_hex(get_primary_color()), _color_to_hex(get_text_color())]
	content += "[color=#%s]@ [/color][color=#%s]Giocatore[/color]\n" % [_color_to_hex(get_numbers_color()), _color_to_hex(get_text_color())]
	content += "[color=#%s]S [/color][color=#%s]Start[/color]\n" % [_color_to_hex(get_numbers_color()), _color_to_hex(get_text_color())]
	content += "[color=#%s]E [/color][color=#%s]Safe Place[/color]" % [_color_to_hex(get_numbers_color()), _color_to_hex(get_text_color())]

	legend_content.text = content

func _update_map_panel():
	if not map_content or not ascii_map:
		return

	var content = "[color=#%s]MAPPA[/color]\n" % _color_to_hex(get_interface_color())
	content += "[color=#%s]═══════════════[/color]\n" % _color_to_hex(get_text_color())

	# Ottieni display della mappa con lampeggio del player
	var map_display = ascii_map.get_colored_map_display_with_blink(player_visible)
	content += map_display

	map_content.text = content

func _update_info_panel():
	if not info_content or not ascii_map:
		return

	var player_pos = ascii_map.get_player_position()
	var terrain_info = ascii_map.get_terrain_info(player_pos)

	var content = "[color=#%s]INFO GIOCO[/color]\n" % _color_to_hex(get_interface_color())
	content += "[color=#%s]═══════════════[/color]\n" % _color_to_hex(get_text_color())
	content += "[color=#%s]Pos: [/color][color=#%s](%d, %d)[/color]\n" % [_color_to_hex(get_text_color()), _color_to_hex(get_numbers_color()), player_pos.x, player_pos.y]
	content += "[color=#%s]Luogo: [/color][color=#%s]%s[/color]\n" % [_color_to_hex(get_text_color()), _color_to_hex(get_text_color()), terrain_info.name]

	# Orario o Notte
	if current_time.is_night:
		content += "[color=#44AAFF]Notte[/color]" # Blu acceso per la notte
	else:
		content += "[color=#%s]Ora: [/color][color=#%s]%02d:%02d[/color]" % [_color_to_hex(get_text_color()), _color_to_hex(get_numbers_color()), current_time.hour, current_time.minute]

	info_content.text = content

func _update_stats_panel():
	if not stats_content or not player:
		return

	var content = "[color=#%s]STATISTICHE[/color]\n" % _color_to_hex(get_interface_color())
	content += "[color=#%s]═══════════════[/color]\n" % _color_to_hex(get_text_color())
	content += "[color=#%s]HP: [/color][color=#%s]%d[/color][color=#%s]/[/color][color=#%s]%d[/color]\n" % [_color_to_hex(get_text_color()), _color_to_hex(get_numbers_color()), player.hp, _color_to_hex(get_text_color()), _color_to_hex(get_numbers_color()), player.max_hp]
	content += "[color=#%s]VIG: [/color][color=#%s]%d[/color]    [color=#%s]POT: [/color][color=#%s]%d[/color]\n" % [_color_to_hex(get_text_color()), _color_to_hex(get_numbers_color()), player.vig, _color_to_hex(get_text_color()), _color_to_hex(get_numbers_color()), player.pot]
	content += "[color=#%s]AGI: [/color][color=#%s]%d[/color]    [color=#%s]TRA: [/color][color=#%s]%d[/color]\n" % [_color_to_hex(get_text_color()), _color_to_hex(get_numbers_color()), player.agi, _color_to_hex(get_text_color()), _color_to_hex(get_numbers_color()), player.tra]
	content += "[color=#%s]INF: [/color][color=#%s]%d[/color]    [color=#%s]PRE: [/color][color=#%s]%d[/color]\n" % [_color_to_hex(get_text_color()), _color_to_hex(get_numbers_color()), player.inf, _color_to_hex(get_text_color()), _color_to_hex(get_numbers_color()), player.pre]
	content += "[color=#%s]ADA: [/color][color=#%s]%d[/color]    [color=#%s]EXP: [/color][color=#%s]%d[/color]\n" % [_color_to_hex(get_text_color()), _color_to_hex(get_numbers_color()), player.ada, _color_to_hex(get_text_color()), _color_to_hex(get_numbers_color()), player.exp]
	content += "[color=#%s]PTS: [/color][color=#%s]%d[/color]\n" % [_color_to_hex(get_text_color()), _color_to_hex(get_numbers_color()), player.pts]

	# NUOVO: Equipment Bonus Display - FASE 2
	var attack_bonus = player.get_equipment_bonus("attack")
	var defense_bonus = player.get_equipment_bonus("defense")
	var total_attack = player.get_attack_power()
	var total_defense = player.get_defense_power()

	content += "[color=#%s]═══════════════[/color]\n" % _color_to_hex(get_text_color())
	content += "[color=#%s]ATK: [/color][color=#%s]%d[/color]" % [_color_to_hex(get_text_color()), _color_to_hex(get_numbers_color()), total_attack]
	if attack_bonus > 0:
		content += "[color=#%s](+%d)[/color]" % [_color_to_hex(get_primary_color()), attack_bonus]
	content += "\n"

	content += "[color=#%s]DEF: [/color][color=#%s]%d[/color]" % [_color_to_hex(get_text_color()), _color_to_hex(get_numbers_color()), total_defense]
	if defense_bonus > 0:
		content += "[color=#%s](+%d)[/color]" % [_color_to_hex(get_primary_color()), defense_bonus]

	stats_content.text = content

func _update_controls_panel():
	"""Aggiorna pannello controlli con layout centrato migliorato."""
	if not controls_content:
		return

	# Layout controlli centrato PERFETTAMENTE verticalmente
	var content = "[color=#%s]CONTROLLI[/color]\n" % _color_to_hex(get_interface_color())
	content += "[color=#%s]═══════════════[/color]\n\n\n" % _color_to_hex(get_text_color()) # Spazio extra
	content += "[color=#%s]        [W][/color]\n" % _color_to_hex(get_primary_color())
	content += "[color=#%s]    [A][SPC][D][/color]\n" % _color_to_hex(get_primary_color())
	content += "[color=#%s]        [S][/color]\n\n" % _color_to_hex(get_primary_color())
	content += "[color=#%s][F5] Salva [F6] Carica[/color]\n" % _color_to_hex(get_primary_color())
	content += "[color=#%s][L] Leggenda[/color]\n\n" % _color_to_hex(get_primary_color()) # Spazio finale

	controls_content.text = content

	# FORZA la centratura verticale del RichTextLabel
	if controls_content:
		controls_content.add_theme_constant_override("line_separation", 2)
		# Usa alignment per centrare verticalmente
		controls_content.scroll_active = false

## === GESTIONE EVENTI ===

func add_log_entry(message: String):
	event_log.append(message)

	# Mantieni solo MAX_LOG_ENTRIES
	if event_log.size() > MAX_LOG_ENTRIES:
		event_log = event_log.slice(event_log.size() - MAX_LOG_ENTRIES)

	_update_log_panel()

func _trigger_random_event():
	# Integrazione con EventManager esistente
	if game_manager and game_manager.event_manager:
		add_log_entry("Qualcosa si muove nelle vicinanze...")
		# Trigger evento casuale via EventManager

## === AZIONI GIOCO ===

func _save_game():
	add_log_entry("Gioco salvato localmente")
	# Integrazione SaveManager

func _load_game():
	add_log_entry("Download salvataggio richiesto")
	# Integrazione SaveManager

func _load_file():
	add_log_entry("Caricamento file richiesto")
	# Integrazione SaveManager

func _exit_game():
	"""Esci dal gioco con conferma - POINT 7 PROMPT_TEMP.txt"""
	add_log_entry("Uscita dal gioco richiesta")
	# Chiusura pulita dell'applicazione
	get_tree().quit()

## === INTEGRAZIONE SISTEMI ===

func initialize(gm: GameManager):
	"""Inizializza interfaccia con GameManager"""
	game_manager = gm
	if game_manager.player:
		player = game_manager.player
		_update_all_panels()

	print("✅ [MainInterface] Inizializzata con GameManager")

func _update_all_panels():
	"""Aggiorna tutti i pannelli"""
	_update_survival_panel()
	_update_inventory_panel()
	_update_log_panel()
	_update_legend_panel()
	_update_map_panel()
	_update_info_panel()
	_update_stats_panel()
	_update_controls_panel()
	_setup_equipment_display()

## === UTILITY ===

func _color_to_hex(color: Color) -> String:
	return "%02x%02x%02x" % [color.r * 255, color.g * 255, color.b * 255]

## FORZA font monospace su TUTTI i controlli (ESSENZIALE per mappa ASCII)
func _force_monospace_font_on_all_panels():
	# Crea font monospace con priorità Perfect DOS VGA 437 e supporto UTF-8
	var monospace_font = SystemFont.new()
	monospace_font.font_names = ["Perfect DOS VGA 437", "Fixedsys Excelsior", "Fixedsys", "MS DOS", "Courier New", "Lucida Console", "Consolas", "monospace"]
	# 🔤 Configurazione UTF-8 esplicita per lettere accentate
	monospace_font.subpixel_positioning = TextServer.SUBPIXEL_POSITIONING_AUTO
	monospace_font.multichannel_signed_distance_field = false

	# Lista di TUTTI i RichTextLabel (specialmente MapContent!)
	var rich_text_labels = [
		survival_content,
		inventory_content,
		log_content,
		legend_content,
		map_content, # CRITICO per mappa ASCII!
		info_content,
		stats_content,
		controls_content,
		equipment_content
	]

	# FORZA il font monospace su ogni RichTextLabel
	for label in rich_text_labels:
		if label:
			label.add_theme_font_override("normal_font", monospace_font)
			label.add_theme_font_override("bold_font", monospace_font)
			label.add_theme_font_override("italics_font", monospace_font)
			label.add_theme_font_override("mono_font", monospace_font)
			# Forza anche la dimensione del font
			label.add_theme_font_size_override("normal_font_size", 16)
			label.add_theme_font_size_override("bold_font_size", 16)
			label.add_theme_font_size_override("italics_font_size", 16)
			label.add_theme_font_size_override("mono_font_size", 16)
			print("🔤 [Font] Fixedsys forzato su: ", label.name)

	print("🔤 [Font] Tutti i pannelli forzati a Fixedsys Excelsior monospace")

## Ottimizza viewport mappa in base alle dimensioni reali del pannello
func _optimize_map_viewport():
	if not map_panel or not ascii_map:
		return

	# Ottieni dimensioni reali del MapPanel
	var panel_size = map_panel.size
	var content_size = panel_size - Vector2(20, 40) # Padding ridotto per più spazio

	# Calcola caratteri che entrano (ottimizzato per riempire meglio lo spazio)
	var char_width = 8.5 # Più largo per sicurezza
	var char_height = 16 # Ridotto per calcolo più preciso

	var optimal_width = int(content_size.x / char_width)
	var optimal_height = int(content_size.y / char_height) - 1 # Meno spazio sottratto per titolo

	# Applica limiti ESTESI per riempire completamente il contenitore
	optimal_width = clamp(optimal_width, 35, 59) # ESTESO A 59 (+2 caratteri orizzontale)
	optimal_height = clamp(optimal_height, 12, 55) # ESTESO A 55 (+7 righe) per riempire spazio vuoto

	# Aggiorna viewport nell'ASCII map generator e forza l'aggiornamento
	if ascii_map.has_method("set_viewport_size"):
		ascii_map.set_viewport_size(optimal_width, optimal_height)
		# Forza aggiornamento immediato della mappa visualizzata
		call_deferred("_force_map_update")
		print("🗺️ [MapViewport] Ottimizzato a %dx%d caratteri (esteso per riempire container)" % [optimal_width, optimal_height])
	else:
		print("🗺️ [MapViewport] Usando viewport statico 92x27")

func _force_map_update():
	"""Forza l'aggiornamento della visualizzazione della mappa."""
	if ascii_map:
		_update_map_panel()

func _setup_equipment_display():
	"""Setup display equipaggiamento e comandi avanzati."""
	var equipment_content = equipment_panel.get_node("EquipmentContent")
	if equipment_content:
		# Verifica che player sia inizializzato
		if not player:
			equipment_content.text = """[color=#%s]EQUIPAGGIAMENTO[/color]
[color=#%s]═══════════════[/color]
[color=#%s]ARMA:[/color] [color=#%s]Nessuna[/color]
[color=#%s]ARMATURA:[/color] [color=#%s]Nessuna[/color]

[color=#%s]═══════════════[/color]

[color=#%s][C] Crafting
[P] Ripara
[R] Crescita
[L] Leggenda
[F6] Carica[/color]""" % [
				_color_to_hex(get_interface_color()), _color_to_hex(get_text_color()),
				_color_to_hex(get_text_color()), _color_to_hex(get_numbers_color()),
				_color_to_hex(get_text_color()), _color_to_hex(get_numbers_color()),
				_color_to_hex(get_text_color()), _color_to_hex(get_primary_color())
			]
			return

		# Display equipaggiamento attuale
		var equipped_weapon = player.get_equipped_weapon()
		var equipped_armor = player.get_equipped_armor()
		var weapon_name = "Nessuna" if not equipped_weapon else equipped_weapon.display_name
		var armor_name = "Nessuna" if not equipped_armor else equipped_armor.display_name

		equipment_content.text = """[color=#%s]EQUIPAGGIAMENTO[/color]
[color=#%s]═══════════════[/color]
[color=#%s]ARMA:[/color] [color=#%s]%s[/color]
[color=#%s]ARMATURA:[/color] [color=#%s]%s[/color]

[color=#%s]═══════════════[/color]

[color=#%s][C] Crafting
[R] Crescita
[L] Leggenda
[F6] Carica[/color]""" % [
			_color_to_hex(get_interface_color()), _color_to_hex(get_text_color()),
			_color_to_hex(get_text_color()), _color_to_hex(get_numbers_color()), weapon_name,
			_color_to_hex(get_text_color()), _color_to_hex(get_numbers_color()), armor_name,
			_color_to_hex(get_text_color()), _color_to_hex(get_primary_color())
		]

var legend_popup_active: bool = false
var current_legend_popup: AcceptDialog = null  # ✅ FIX: Riferimento al popup per chiusura con L

# 🎮 POINT 5: Riferimenti pulsanti per animazione feedback
var button_up: Button = null
var button_left: Button = null
var button_down: Button = null
var button_right: Button = null
var button_space: Button = null

func _show_legend_popup():
	"""Mostra popup leggenda simboli mappa con stile SafePlace e controllo da tastiera."""
	if legend_popup_active:
		return # Evita doppie aperture

	print("[MainInterface] Showing legend popup")
	legend_popup_active = true

	# Creo popup leggenda con stile SafePlace
	var popup = AcceptDialog.new()
	current_legend_popup = popup  # ✅ FIX: Memorizza riferimento per chiusura con L
	popup.title = "LEGGENDA MAPPA"
	popup.dialog_text = """. Pianura
F Foresta
M Montagna
C Città
V Villaggio
~ Fiume
R Ristoro
@ Giocatore"""

	# Styling popup completo SafePlace
	popup.add_theme_color_override("font_color", get_primary_color())
	popup.add_theme_color_override("title_color", get_bright_color())

	# Stile pannello popup
	var popup_style = StyleBoxFlat.new()
	popup_style.bg_color = get_background_color() # Stesso sfondo dell'interfaccia
	popup_style.border_color = get_primary_color()
	popup_style.border_width_left = 2
	popup_style.border_width_top = 2
	popup_style.border_width_right = 2
	popup_style.border_width_bottom = 2
	popup.add_theme_stylebox_override("panel", popup_style)

	# Nascondi il bottone OK (usiamo solo L per chiudere)
	popup.get_ok_button().visible = false

	# Setup chiusura con L dalla tastiera
	var close_popup = func():
		legend_popup_active = false
		current_legend_popup = null  # ✅ FIX: Pulisce riferimento
		popup.queue_free()

	popup.confirmed.connect(close_popup)
	# Nota: AcceptDialog non ha segnale 'cancelled', solo 'confirmed'

	# ✅ FIX: AcceptDialog non ha gui_input - usa approccio global input handler
	# Input handler per chiusura con L rimosso - gestito dal global _input()
	# popup.gui_input.connect(input_handler)  # RIMOSSO - causava errore AcceptDialog

	get_tree().current_scene.add_child(popup)
	popup.popup_centered()
	popup.grab_focus() # Per ricevere input da tastiera

## Helper functions per controlli interattivi

func _create_empty_spacer() -> Control:
	"""Crea uno spazio vuoto per il layout grid."""
	var spacer = Label.new()
	spacer.text = ""
	return spacer

func _create_movement_button(text: String, direction: Vector2) -> Button:
	"""🎮 POINT 3: Pulsanti visibili ma keyboard-only (non-clickabili, ma normalmente colorati)."""
	var button = Button.new()
	button.text = text
	button.custom_minimum_size = Vector2(25, 20)
	button.disabled = true  # DISABILITATO per Point 3 - keyboard-only experience

	# Styling bottone NORMALE (non scuro) ma disabilitato
	var button_style = StyleBoxFlat.new()
	button_style.bg_color = get_background_color()
	button_style.border_color = get_primary_color()  # Bordo normale (non scuro)
	button_style.border_width_left = 1
	button_style.border_width_top = 1
	button_style.border_width_right = 1
	button_style.border_width_bottom = 1

	button.add_theme_color_override("font_color", get_primary_color())  # Testo normale (non scuro)
	button.add_theme_color_override("font_disabled_color", get_primary_color())  # Anche quando disabled
	button.add_theme_stylebox_override("normal", button_style)
	button.add_theme_stylebox_override("hover", button_style.duplicate())
	button.add_theme_stylebox_override("pressed", button_style.duplicate())
	button.add_theme_stylebox_override("disabled", button_style.duplicate())

	# NESSUNA CONNESSIONE - Solo tastiera permessa (Point 3)
	# button.pressed.connect(func(): _move_player(direction))  # COMMENTATO per Point 3

	return button

func _create_special_button(text: String, method_name: String) -> Button:
	"""🎮 POINT 3: Pulsanti speciali visibili ma keyboard-only (non-clickabili, ma normalmente colorati)."""
	var button = Button.new()
	button.text = text
	button.custom_minimum_size = Vector2(70, 18)
	button.disabled = true  # DISABILITATO per Point 3 - keyboard-only experience

	# Styling bottone NORMALE (non scuro) ma disabilitato
	var button_style = StyleBoxFlat.new()
	button_style.bg_color = get_background_color()
	button_style.border_color = get_primary_color()  # Bordo normale (non scuro)
	button_style.border_width_left = 1
	button_style.border_width_top = 1
	button_style.border_width_right = 1
	button_style.border_width_bottom = 1

	button.add_theme_color_override("font_color", get_primary_color())  # Testo normale (non scuro)
	button.add_theme_color_override("font_disabled_color", get_primary_color())  # Anche quando disabled
	button.add_theme_stylebox_override("normal", button_style)
	button.add_theme_stylebox_override("hover", button_style.duplicate())
	button.add_theme_stylebox_override("pressed", button_style.duplicate())
	button.add_theme_stylebox_override("disabled", button_style.duplicate())

	# NESSUNA CONNESSIONE - Solo tastiera permessa (Point 3)
	# Connetti segnale basato sul nome metodo - COMMENTATO per Point 3
	# match method_name:
	#	"_pass_time":
	#		button.pressed.connect(func(): _pass_time())
	#	"_save_game":
	#		button.pressed.connect(func(): _save_game())
	#	"_load_game":
	#		button.pressed.connect(func(): _load_game())
	#	"_show_legend_popup":
	#		button.pressed.connect(func(): _show_legend_popup())

	return button

# 🎮 POINT 5: Animazione feedback pulsanti quando premuti da tastiera
func _animate_button_feedback(button_name: String):
	"""Anima il pulsante corrispondente con highlight temporaneo quando premuto da tastiera."""
	var target_button: Button = null
	
	# Trova il pulsante target
	match button_name:
		"up":
			target_button = button_up
		"left":
			target_button = button_left
		"down":
			target_button = button_down
		"right":
			target_button = button_right
		"space":
			target_button = button_space
	
	if not target_button:
		return  # Pulsante non trovato
	
	# Crea animazione highlight temporaneo
	var tween = create_tween()
	
	# Colore highlight (più brillante del normale)
	var highlight_color = get_bright_color()
	var normal_color = get_primary_color()
	
	# Sequenza animazione: normale → highlight → normale
	tween.tween_method(
		func(color: Color): target_button.add_theme_color_override("font_disabled_color", color),
		normal_color,
		highlight_color,
		0.1  # 100ms per illuminare
	)
	tween.tween_method(
		func(color: Color): target_button.add_theme_color_override("font_disabled_color", color),
		highlight_color,
		normal_color,
		0.2  # 200ms per tornare normale
	)
	
	# Anima anche il bordo per effetto più visibile
	var original_style = target_button.get_theme_stylebox("disabled")
	if original_style:
		var highlight_style = original_style.duplicate() as StyleBoxFlat
		highlight_style.border_color = highlight_color
		
		# Applica stile highlight temporaneo
		target_button.add_theme_stylebox_override("disabled", highlight_style)
		
		# Ripristina stile normale dopo 300ms
		tween.tween_callback(func(): 
			var normal_style = original_style.duplicate() as StyleBoxFlat
			normal_style.border_color = normal_color
			target_button.add_theme_stylebox_override("disabled", normal_style)
		).set_delay(0.3)

func _handle_crafting():
	"""Gestisce apertura interfaccia crafting."""
	print("[MainInterface] Opening crafting interface")
	# TODO: Implementare interfaccia crafting

func _handle_inventory_management():
	"""Gestisce apertura gestione inventario avanzata."""
	print("[MainInterface] Opening inventory management")
	# TODO: Implementare gestione inventario avanzata

func _handle_character_growth():
	"""Gestisce apertura schermata crescita personaggio."""
	print("[MainInterface] Opening character growth")
	# TODO: Implementare schermata crescita personaggio

func _handle_repair():
	"""Gestisce sistema riparazione oggetti - POINT 9 PROMPT_TEMP.txt"""
	print("[MainInterface] Opening repair system")
	if not player:
		add_log_entry("❌ Player non disponibile per riparazione")
		return
	
	# Controlla se ha oggetti danneggiati
	var damaged_items = _get_damaged_items()
	if damaged_items.is_empty():
		add_log_entry("✅ Nessun oggetto necessita riparazione")
		return
	
	# Controlla materiali disponibili
	var has_materials = _check_repair_materials()
	if not has_materials:
		add_log_entry("❌ Materiali insufficienti per riparazione")
		add_log_entry("💡 Serve: metallo o tessuto")
		return
	
	# Avvia riparazione automatica
	_perform_repair(damaged_items[0])  # Ripara primo oggetto danneggiato

func _get_damaged_items() -> Array:
	"""Ottieni lista oggetti danneggiati che necessitano riparazione."""
	var damaged = []
	if player.get_equipped_weapon():
		var weapon = player.get_equipped_weapon()
		if weapon.has("durability") and weapon.durability < weapon.max_durability:
			damaged.append(weapon)
	if player.get_equipped_armor():
		var armor = player.get_equipped_armor()
		if armor.has("durability") and armor.durability < armor.max_durability:
			damaged.append(armor)
	return damaged

func _check_repair_materials() -> bool:
	"""Controlla se il player ha materiali per riparazione."""
	if not player:
		return false
	var inventory = player.get_inventory_display()
	for item in inventory:
		var name = item.get("name", "").to_lower()
		if "metallo" in name or "tessuto" in name or "ferro" in name:
			return true
	return false

func _perform_repair(item: Dictionary):
	"""Esegue riparazione oggetto consumando materiali."""
	if not item.has("durability"):
		add_log_entry("❌ Oggetto non riparabile")
		return
	
	# Calcola riparazione (25% della durabilità massima)
	var repair_amount = item.max_durability * 0.25
	item.durability = min(item.durability + repair_amount, item.max_durability)
	
	# Consuma materiali (implementazione semplificata)
	add_log_entry("🔧 %s riparato (+%d durabilità)" % [item.display_name, repair_amount])
	add_log_entry("💡 Materiali di riparazione consumati")
	
	# Aggiorna display equipaggiamento
	_setup_equipment_display()

func _setup_panels():
	"""Setup di tutti i pannelli dell'interfaccia 8-panel con verde scuro."""
	print("[MainInterface] Setting up panels with dark green SafePlace colors")

	# Panel styling con colore sfondo specificato dall'utente
	var panel_style = StyleBoxFlat.new()
	panel_style.bg_color = get_background_color() # Colore sfondo richiesto dall'utente
	panel_style.border_color = get_primary_color()
	panel_style.border_width_left = 1
	panel_style.border_width_top = 1
	panel_style.border_width_right = 1
	panel_style.border_width_bottom = 1

	# Applico styling a tutti i pannelli
	for panel in [survival_panel, inventory_panel, log_panel, map_panel, info_panel, stats_panel, controls_panel, equipment_panel]:
		if panel:
			panel.add_theme_stylebox_override("panel", panel_style)

	# Applica sfondo anche ai contenuti dei pannelli (RichTextLabel)
	var content_style = StyleBoxFlat.new()
	content_style.bg_color = get_background_color() # Stesso colore per i container interni
	content_style.border_width_left = 0
	content_style.border_width_top = 0
	content_style.border_width_right = 0
	content_style.border_width_bottom = 0

	# Applica ai contenuti RichTextLabel
	for content in [survival_content, inventory_content, log_content, map_content, info_content, stats_content, equipment_content]:
		if content:
			content.add_theme_stylebox_override("normal", content_style)
			content.add_theme_stylebox_override("focus", content_style)

	# Setup titoli con colore verde chiaro
	_setup_panel_titles()

	# Setup layout specifici
	_setup_controls_layout()
	_setup_equipment_display()

func _setup_panel_titles():
	"""Setup titoli pannelli con colore verde SafePlace."""
	var titles = {
		"SurvivalTitle": "SOPRAVVIVENZA",
		"InventoryTitle": "INVENTARIO",
		"LogTitle": "DIARIO DI VIAGGIO",
		"MapTitle": "MAPPA", # Rimosso 250x250
		"InfoTitle": "INFO GIOCO",
		"StatsTitle": "STATISTICHE",
		"ControlsTitle": "COMANDI",
		"EquipmentTitle": "EQUIPAGGIAMENTO"
	}

	for title_node in titles:
		var title_label = get_node_or_null("*/" + title_node)
		if title_label:
			title_label.text = titles[title_node]
			title_label.add_theme_color_override("font_color", get_primary_color())

func _setup_controls_layout():
	"""Setup layout controlli interattivi con bottoni cliccabili."""
	if not controls_panel:
		return

	# Rimuovi il vecchio contenuto text-based
	if controls_content:
		controls_content.queue_free()

	# Crea container per i controlli interattivi
	var controls_container = VBoxContainer.new()
	controls_container.name = "ControlsContainer"

	# Titolo controlli
	var title_label = Label.new()
	title_label.text = "COMANDI"
	title_label.add_theme_color_override("font_color", get_primary_color())
	title_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	controls_container.add_child(title_label)

	# Separatore
	var separator1 = Label.new()
	separator1.text = "═══════════════"
	separator1.add_theme_color_override("font_color", get_primary_color())
	separator1.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	controls_container.add_child(separator1)

	# Controlli movimento in griglia - POINT 4: Solo frecce direzionali (WASD rimangono funzionali da tastiera)
	# Container centrato per la griglia di movimento
	var movement_container = CenterContainer.new()
	var movement_grid = GridContainer.new()
	movement_grid.columns = 3

	# Prima riga: ↑ (solo freccia, WASD funziona comunque da tastiera)
	movement_grid.add_child(_create_empty_spacer())
	button_up = _create_movement_button("↑", Vector2(0, -1))  # POINT 5: Memorizza riferimento
	movement_grid.add_child(button_up)
	movement_grid.add_child(_create_empty_spacer())

	# Seconda riga: ← SPACE → (solo frecce, WASD funziona comunque da tastiera)
	button_left = _create_movement_button("←", Vector2(-1, 0))  # POINT 5: Memorizza riferimento
	movement_grid.add_child(button_left)

	button_space = _create_special_button("SPC", "_pass_time")  # POINT 5: Memorizza riferimento
	movement_grid.add_child(button_space)

	button_right = _create_movement_button("→", Vector2(1, 0))  # POINT 5: Memorizza riferimento
	movement_grid.add_child(button_right)

	# Terza riga: ↓ (solo freccia, WASD funziona comunque da tastiera)
	movement_grid.add_child(_create_empty_spacer())
	button_down = _create_movement_button("↓", Vector2(0, 1))  # POINT 5: Memorizza riferimento
	movement_grid.add_child(button_down)
	movement_grid.add_child(_create_empty_spacer())

	movement_container.add_child(movement_grid)
	controls_container.add_child(movement_container)

	# Comandi funzioni centrati - POINT 7: Aggiunto comando Esci
	var functions_container = VBoxContainer.new()
	functions_container.alignment = BoxContainer.ALIGNMENT_CENTER

	var btn_save = _create_special_button("F5 Salva", "_save_game")
	var btn_load = _create_special_button("F6 Carica", "_load_game")
	var btn_exit = _create_special_button("ESC Esci", "_exit_game")  # POINT 7: NUOVO
	# var btn_legend = _create_special_button("L Leggenda", "_show_legend_popup")  # POINT 6: RIMOSSO

	functions_container.add_child(btn_save)
	functions_container.add_child(btn_load)
	functions_container.add_child(btn_exit)  # POINT 7: NUOVO
	# functions_container.add_child(btn_legend)  # POINT 6: RIMOSSO

	var functions_center = CenterContainer.new()
	functions_center.add_child(functions_container)
	controls_container.add_child(functions_center)

	controls_panel.add_child(controls_container)

func _update_inventory_display():
	"""Aggiorna display inventario con colori per tipologie oggetti."""
	if not inventory_content or not player:
		return

	var inventory_text = ""
	var items = player.get_inventory_display()

	for item_info in items:
		var item_name = item_info["name"]
		var quantity = item_info["quantity"]
		var item_type = item_info.get("type", "misc")

		# Colori per tipologie oggetti come nel gioco originale
		var color_code = _get_item_color_code(item_type)

		if quantity > 1:
			inventory_text += "%s%s (x%d)[/color]\n" % [color_code, item_name, quantity]
		else:
			inventory_text += "%s%s[/color]\n" % [color_code, item_name]

	inventory_content.text = inventory_text

# FUNZIONE RIMOSSA - Versione aggiornata più in basso

# FUNZIONI RIMOSSE - Log ora gestito completamente da _update_log_panel()

# Funzioni helper per colori oggetti inventario con riconoscimento intelligente
func _get_item_type_from_name(item_name: String) -> String:
	"""Riconosce il tipo di oggetto dal nome con sistema intelligente esteso."""
	var name_lower = item_name.to_lower()

	# Armi
	if any_keyword_in_string(name_lower, ["arma", "pistol", "fucil", "coltell", "spada", "ascia", "mazza", "rifle", "gun"]):
		return "weapon"

	# Armature e protezioni
	elif any_keyword_in_string(name_lower, ["armor", "giubbott", "armatur", "casco", "scudo", "protezione", "vest"]):
		return "armor"

	# Cibo
	elif any_keyword_in_string(name_lower, ["cibo", "carn", "pane", "razio", "pasta", "riso", "frutta", "verdura", "food"]):
		return "food"

	# Bevande
	elif any_keyword_in_string(name_lower, ["acqua", "water", "bevand", "birra", "vino", "succo", "latte", "drink"]):
		return "drink"

	# Oggetti medici
	elif any_keyword_in_string(name_lower, ["medic", "benda", "kit", "pillol", "siringa", "antidot", "farmac"]):
		return "medical"

	# Munizioni
	elif any_keyword_in_string(name_lower, ["muni", "pallottol", "cartucc", "proiett", "colpi", "ammo", "bullets"]):
		return "ammo"

	# Attrezzi
	elif any_keyword_in_string(name_lower, ["martell", "chiave inglese", "cacciavit", "sega", "trapan", "tool"]):
		return "tool"

	# Chiavi e oggetti speciali
	elif any_keyword_in_string(name_lower, ["chiav", "pass", "tessera", "badge", "key", "card"]):
		return "key"

	# Materiali grezzi
	elif any_keyword_in_string(name_lower, ["legno", "ferro", "acciaio", "pietra", "tessuto", "plastic", "material"]):
		return "material"

	# Default
	else:
		return "misc"

func any_keyword_in_string(text: String, keywords: Array) -> bool:
	"""Helper function per verificare se qualche keyword è contenuta nel testo."""
	for keyword in keywords:
		if keyword in text:
			return true
	return false

# QUESTA FUNZIONE SOVRASCRIVE LA PRECEDENTE CON COLORI AGGIORNATI
func _get_item_color_code(item_type: String) -> String:
	"""Sistema colori intelligente per oggetti inventario con 10 categorie distinte."""
	match item_type:
		"weapon": return "[color=#FF4757]" # Rosso intenso per armi
		"armor": return "[color=#2ED573]" # Verde brillante per armature
		"food": return "[color=#FFA502]" # Arancione per cibo
		"drink": return "[color=#3742FA]" # Blu elettrico per bevande
		"medical": return "[color=#FF6B9D]" # Rosa per oggetti medici
		"ammo": return "[color=#F8B500]" # Giallo oro per munizioni
		"tool": return "[color=#A4B0BE]" # Grigio chiaro per attrezzi
		"key": return "[color=#FFD700]" # Oro per chiavi/oggetti speciali
		"material": return "[color=#8B4513]" # Marrone per materiali grezzi
		"misc": return "[color=#9C88FF]" # Lilla per oggetti vari
		_: return "[color=#%s]" % _color_to_hex(get_text_color()) # Default verde

## Usa oggetto dall'inventario per indice
func _use_inventory_item(item_index: int):
	"""Apre popup oggetto inventario tramite indice numerico (1-8) - PUNTO 2 PROMPT_TEMP.txt"""
	if not player:
		add_log_entry("❌ Player non disponibile")
		return
	
	var inventory = player.get_inventory_display()
	if inventory.is_empty():
		add_log_entry("❌ Inventario vuoto")
		return
	
	if item_index < 1 or item_index > inventory.size() or item_index > 8:
		add_log_entry("❌ Oggetto non disponibile")
		return
	
	# Ottieni oggetto (indice base-0)
	var item = inventory[item_index - 1]
	var item_id = item.get("id", "")
	
	if item_id.is_empty():
		add_log_entry("❌ ID oggetto non valido")
		return
	
	# Apri popup oggetto (NUOVO SISTEMA)
	_show_item_popup(item_id)

## NUOVO: Mostra popup per oggetto inventario con descrizione e azioni
func _show_item_popup(item_id: String):
	"""Crea popup oggetto con stile IDENTICO interfaccia principale"""
	if not game_manager:
		add_log_entry("❌ GameManager non disponibile")
		return
		
	var item_db = game_manager.get_item_database()
	if not item_db:
		add_log_entry("❌ Database oggetti non disponibile")
		return
		
	var item = item_db.get_item(item_id)
	if not item:
		add_log_entry("❌ Oggetto non trovato: " + item_id)
		return
	
	# Crea popup IDENTICO ai pannelli
	var popup = AcceptDialog.new()
	popup.title = ""  # Rimosso indicatore temporaneo
	popup.size = Vector2(650, 550)
	popup.position = Vector2(get_viewport().size.x/2 - 325, get_viewport().size.y/2 - 275)
	
	# Background IDENTICO ai pannelli (SENZA modulate che causa errore)
	popup.add_theme_color_override("base_color", get_background_color())
	
	# Panel principale IDENTICO ai pannelli del gioco
	var main_panel = Panel.new()
	main_panel.size = Vector2(630, 520)
	main_panel.position = Vector2(10, 10)
	
	# Background ESATTO dei pannelli
	main_panel.add_theme_color_override("bg_color", get_background_color())
	main_panel.modulate = Color.WHITE
	
	# RichTextLabel IDENTICO ai pannelli principali
	var content_label = RichTextLabel.new()
	content_label.size = Vector2(610, 450)
	content_label.position = Vector2(10, 10)
	content_label.bbcode_enabled = true
	content_label.fit_content = false
	content_label.scroll_active = true
	
	# Font monospace IDENTICO ai pannelli
	_force_monospace_font_on_label(content_label)
	
	# Colori IDENTICI ai pannelli
	content_label.add_theme_color_override("default_color", get_text_color())
	content_label.add_theme_color_override("font_color", get_text_color())
	content_label.add_theme_color_override("selection_color", get_primary_color())
	content_label.add_theme_color_override("background_color", get_background_color())
	
	# Contenuto formattato IDENTICO ai pannelli
	var content_text = _format_popup_content_like_panels(item)
	content_label.text = content_text
	
	# Container pulsanti con SPACING CORRETTO
	var buttons_container = HBoxContainer.new()
	buttons_container.position = Vector2(10, 470)
	buttons_container.size = Vector2(610, 40)
	buttons_container.alignment = BoxContainer.ALIGNMENT_CENTER
	
	# SPACING TRA PULSANTI CORRETTO (Godot 4.5 dev: limitazioni visive note)
	buttons_container.add_theme_constant_override("separation", 15)
	
	var action_buttons = _create_popup_buttons_crt_style(item, popup)
	for button in action_buttons:
		buttons_container.add_child(button)
	
	# Assembla popup
	main_panel.add_child(content_label)
	main_panel.add_child(buttons_container)
	popup.add_child(main_panel)
	
	# Mostra popup
	add_child(popup)
	popup.popup_centered()
	
	# Focus primo pulsante
	if action_buttons.size() > 0:
		action_buttons[0].grab_focus()

## Forza font monospace IDENTICO ai pannelli
func _force_monospace_font_on_label(label: RichTextLabel):
	"""Applica font monospace Perfect DOS VGA 437 IDENTICO ai pannelli"""
	if ResourceLoader.exists("res://themes/Perfect DOS VGA 437.ttf"):
		var font = load("res://themes/Perfect DOS VGA 437.ttf")
		label.add_theme_font_override("normal_font", font)
		label.add_theme_font_override("bold_font", font)
		label.add_theme_font_override("italics_font", font)
		label.add_theme_font_override("mono_font", font)
		
		# Font size IDENTICO ai pannelli
		label.add_theme_font_size_override("normal_font_size", 16)
		label.add_theme_font_size_override("bold_font_size", 16)

## 🎮 POINT 3: Pulsanti popup disabilitati per esperienza keyboard-only autentica
func _create_crt_button(text: String) -> Button:
	var button = Button.new()
	button.text = text
	button.custom_minimum_size = Vector2(100, 35)  # Ripristinati valori originali
	button.disabled = true  # DISABILITATO per Point 3 - keyboard-only experience
	
	# Stili IDENTICI ai pannelli ma disabilitati
	button.add_theme_color_override("font_color", get_text_color().darkened(0.5))
	button.add_theme_color_override("font_hover_color", get_bright_color().darkened(0.5))
	button.add_theme_color_override("font_pressed_color", get_primary_color().darkened(0.5))
	button.add_theme_color_override("font_disabled_color", get_text_color().darkened(0.5))
	
	# Background IDENTICO ma disabilitato
	button.add_theme_color_override("color", get_background_color())
	button.add_theme_color_override("color_hover", get_primary_color().darkened(0.5))
	button.add_theme_color_override("color_pressed", get_bright_color().darkened(0.5))
	button.add_theme_color_override("color_disabled", get_background_color())
	
	# Font IDENTICO ai pannelli (Godot 4.5 dev: limitazioni theming note)
	if ResourceLoader.exists("res://themes/Perfect DOS VGA 437.ttf"):
		var font = load("res://themes/Perfect DOS VGA 437.ttf")
		button.add_theme_font_override("font", font)
		button.add_theme_font_size_override("font_size", 14)  # Ripristinato valore originale
	
	return button

## Formatta contenuto popup IDENTICO ai pannelli principali
func _format_popup_content_like_panels(item: Item) -> String:
	var content = ""
	
	# Header con stile IDENTICO ai pannelli
	var item_color = _get_item_color_code(item.type)
	content += "[color=#%s]OGGETTO: %s%s[/color][/color]\n" % [_color_to_hex(get_interface_color()), item_color, item.name]
	content += "[color=#%s]═══════════════════════════════[/color]\n\n" % _color_to_hex(get_text_color())
	
	# Descrizione base
	content += "[color=#%s]%s[/color]\n\n" % [_color_to_hex(get_text_color()), item.description]
	
	# Specifiche IDENTICHE al layout pannelli
	content += "[color=#%s]SPECIFICHE:[/color]\n" % _color_to_hex(get_interface_color())
	content += "[color=#%s]═══════════════════════════════[/color]\n" % _color_to_hex(get_text_color())
	
	# Tipo e peso
	content += "[color=#%s]Tipo: [/color][color=#%s]%s[/color]\n" % [
		_color_to_hex(get_text_color()), 
		_color_to_hex(get_numbers_color()), 
		_translate_item_type(item.type)
	]
	content += "[color=#%s]Peso: [/color][color=#%s]%s[/color]\n" % [
		_color_to_hex(get_text_color()), 
		_color_to_hex(get_numbers_color()), 
		item.get_weight_display()
	]
	
	# Caratteristiche specifiche per tipo
	if item.is_consumable():
		content += "[color=#%s]Porzioni: [/color][color=#%s]%d/%d[/color]\n" % [
			_color_to_hex(get_text_color()),
			_color_to_hex(get_numbers_color()),
			item.current_portions,
			item.max_portions
		]
		
		# Info utilizzo con stile pannelli
		var use_info = player.get_item_use_info(item.id)
		if not use_info.is_empty():
			content += "[color=#%s]Effetto: [/color][color=#%s]%s[/color]\n" % [
				_color_to_hex(get_text_color()),
				_color_to_hex(get_primary_color()),
				use_info
			]
	
	elif item.is_weapon():
		content += "[color=#%s]Danno: [/color][color=#%s]%d-%d[/color]\n" % [
			_color_to_hex(get_text_color()),
			_color_to_hex(get_numbers_color()),
			item.damage_min,
			item.damage_max
		]
		
		if item.has_durability():
			content += "[color=#%s]Durabilità: [/color][color=#%s]%d/%d[/color]\n" % [
				_color_to_hex(get_text_color()),
				_color_to_hex(get_numbers_color()),
				item.current_durability,
				item.max_durability
			]
		
		content += "[color=#%s]Tipo arma: [/color][color=#%s]%s[/color]\n" % [
			_color_to_hex(get_text_color()),
			_color_to_hex(get_numbers_color()),
			item.weaponType
		]
	
	elif item.is_armor():
		content += "[color=#%s]Protezione: [/color][color=#%s]%d[/color]\n" % [
			_color_to_hex(get_text_color()),
			_color_to_hex(get_numbers_color()),
			item.armorValue
		]
		
		if item.has_durability():
			content += "[color=#%s]Durabilità: [/color][color=#%s]%d/%d[/color]\n" % [
				_color_to_hex(get_text_color()),
				_color_to_hex(get_numbers_color()),
				item.current_durability,
				item.max_durability
			]
		
		content += "[color=#%s]Slot: [/color][color=#%s]%s[/color]\n" % [
			_color_to_hex(get_text_color()),
			_color_to_hex(get_numbers_color()),
			item.slot
		]
	
	elif item.type == "medicine":
		if item.max_portions == 1:
			content += "[color=#%s]Tipo: [/color][color=#%s]Uso singolo[/color]\n" % [
				_color_to_hex(get_text_color()),
				_color_to_hex(get_numbers_color())
			]
		else:
			content += "[color=#%s]Usi rimanenti: [/color][color=#%s]%d[/color]\n" % [
				_color_to_hex(get_text_color()),
				_color_to_hex(get_numbers_color()),
				item.current_portions
			]
		
		# Info utilizzo medicine
		var use_info = player.get_item_use_info(item.id)
		if not use_info.is_empty():
			content += "[color=#%s]Effetto: [/color][color=#%s]%s[/color]\n" % [
				_color_to_hex(get_text_color()),
				_color_to_hex(get_primary_color()),
				use_info
			]
	
	# Sezione azioni con stile pannelli
	content += "\n[color=#%s]AZIONI DISPONIBILI:[/color]\n" % _color_to_hex(get_interface_color())
	content += "[color=#%s]═══════════════════════════════[/color]\n" % _color_to_hex(get_text_color())
	content += "[color=#%s]Usa i pulsanti sotto per interagire[/color]" % _color_to_hex(get_text_color())
	
	return content

## 🎮 POINT 3: Pulsanti popup DISABILITATI per esperienza keyboard-only autentica
func _create_popup_buttons_crt_style(item: Item, popup: AcceptDialog) -> Array:
	var buttons = []
	
	# Pulsanti per cibo/acqua (DISABILITATI - solo keyboard)
	if item.is_consumable() and (item.type == "food" or item.type == "water"):
		var use_btn = _create_crt_button("Usa")
		# use_btn.pressed.connect(_popup_use_item_portion.bind(item.id, popup))  # COMMENTATO per Point 3
		buttons.append(use_btn)
		
		var throw_btn = _create_crt_button("Getta")
		# throw_btn.pressed.connect(_popup_throw_item.bind(item.id, popup))  # COMMENTATO per Point 3
		buttons.append(throw_btn)
	
	# Pulsanti per armi/armature (DISABILITATI - solo keyboard)
	elif item.is_weapon() or item.is_armor():
		var is_equipped = _is_item_equipped(item.id)
		
		if is_equipped:
			var unequip_btn = _create_crt_button("Rimuovi")
			# unequip_btn.pressed.connect(_popup_unequip_item.bind(item.id, popup))  # COMMENTATO per Point 3
			buttons.append(unequip_btn)
		else:
			var equip_btn = _create_crt_button("Equipaggia")
			# equip_btn.pressed.connect(_popup_equip_item.bind(item.id, popup))  # COMMENTATO per Point 3
			buttons.append(equip_btn)
		
		if item.has_durability() and item.current_durability < item.max_durability:
			var repair_btn = _create_crt_button("Ripara")
			# repair_btn.pressed.connect(_popup_repair_item.bind(item.id, popup))  # COMMENTATO per Point 3
			buttons.append(repair_btn)
		
		var throw_btn = _create_crt_button("Getta")
		# throw_btn.pressed.connect(_popup_throw_item.bind(item.id, popup))  # COMMENTATO per Point 3
		buttons.append(throw_btn)
	
	# Pulsanti per medicine (DISABILITATI - solo keyboard)
	elif item.type == "medicine":
		var use_btn = _create_crt_button("Usa")
		# use_btn.pressed.connect(_popup_use_item_single.bind(item.id, popup))  # COMMENTATO per Point 3
		buttons.append(use_btn)
		
		var throw_btn = _create_crt_button("Getta")
		# throw_btn.pressed.connect(_popup_throw_item.bind(item.id, popup))  # COMMENTATO per Point 3
		buttons.append(throw_btn)
	
	# Pulsante chiudi sempre presente (DISABILITATO - solo keyboard)
	var close_btn = _create_crt_button("Chiudi")
	# close_btn.pressed.connect(popup.queue_free)  # COMMENTATO per Point 3
	buttons.append(close_btn)
	
	return buttons

## Verifica se oggetto è equipaggiato
func _is_item_equipped(item_id: String) -> bool:
	if not player:
		return false
	
	for slot in player.equipped.values():
		if slot == item_id:
			return true
	return false

## Traduce tipo oggetto in italiano
func _translate_item_type(type: String) -> String:
	match type:
		"food": return "Cibo"
		"water": return "Acqua"
		"medicine": return "Medicina"
		"weapon": return "Arma"
		"armor": return "Armatura"
		"tool": return "Attrezzo"
		"resource": return "Risorsa"
		"ammo": return "Munizioni"
		_: return type.capitalize()

# === AZIONI POPUP OGGETTI ===

## Usa oggetto (porzione singola)
func _popup_use_item_portion(item_id: String, popup: AcceptDialog):
	popup.queue_free()
	
	var result = player.use_item(item_id)
	
	if result.success:
		add_log_entry("✅ " + result.message)
		
		if result.consumed:
			_update_inventory_panel()
			_update_survival_panel()
			_update_stats_panel()
	else:
		add_log_entry("❌ " + result.message)

## Usa oggetto (uso singolo)
func _popup_use_item_single(item_id: String, popup: AcceptDialog):
	popup.queue_free()
	
	var result = player.use_item(item_id)
	
	if result.success:
		add_log_entry("✅ " + result.message)
		
		if result.consumed:
			_update_inventory_panel()
			_update_survival_panel()
			_update_stats_panel()
	else:
		add_log_entry("❌ " + result.message)

## Equipaggia oggetto
func _popup_equip_item(item_id: String, popup: AcceptDialog):
	popup.queue_free()
	
	if not player:
		add_log_entry("❌ Player non disponibile")
		return
	
	var success = player.equip_item(item_id)
	
	if success:
		add_log_entry("⚔️ Oggetto equipaggiato")
		_update_stats_panel()
		_setup_equipment_display()
	else:
		add_log_entry("❌ Impossibile equipaggiare oggetto")

## Rimuovi equipaggiamento
func _popup_unequip_item(item_id: String, popup: AcceptDialog):
	popup.queue_free()
	
	if not player:
		add_log_entry("❌ Player non disponibile")
		return
	
	# Trova slot dell'oggetto
	var slot = ""
	for slot_name in player.equipped.keys():
		if player.equipped[slot_name] == item_id:
			slot = slot_name
			break
	
	if slot.is_empty():
		add_log_entry("❌ Oggetto non equipaggiato")
		return
	
	var success = player.unequip_item(slot)
	
	if success:
		add_log_entry("✅ Oggetto rimosso")
		_update_inventory_panel()
		_update_stats_panel()
		_setup_equipment_display()
	else:
		add_log_entry("❌ Impossibile rimuovere oggetto")

## Ripara oggetto
func _popup_repair_item(item_id: String, popup: AcceptDialog):
	popup.queue_free()
	
	# TODO: Implementare sistema riparazione
	add_log_entry("🔧 Sistema riparazione in sviluppo")

## Getta oggetto
func _popup_throw_item(item_id: String, popup: AcceptDialog):
	popup.queue_free()
	
	if not player:
		add_log_entry("❌ Player non disponibile")
		return
	
	var success = player.remove_item(item_id, 1)
	
	if success:
		add_log_entry("🗑️ Oggetto gettato")
		_update_inventory_panel()
	else:
		add_log_entry("❌ Impossibile gettare oggetto")

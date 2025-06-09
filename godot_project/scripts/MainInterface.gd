class_name MainInterface
extends Control

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

# Colori CRT autentici SafePlace
const COLOR_INTERFACE = Color(0, 0.7, 0.25, 1) # Verde base interfaccia
const COLOR_TEXT = Color(0, 0.7, 0.25, 1) # Verde standard testi
const COLOR_NUMBERS = Color(0, 0.9, 0.4, 1) # Verde più chiaro per numeri
const COLOR_NORMAL = Color(0, 0.7, 0.25, 1) # Verde normale
const COLOR_SICK = Color(0.8, 0.6, 0, 1) # Giallo malato
const COLOR_INFECTED = Color(0.8, 0.2, 0.8, 1) # Magenta infetto
const COLOR_WOUNDED = Color(0.8, 0.2, 0.2, 1) # Rosso ferito
const COLOR_HUNGRY = Color(0.9, 0.5, 0, 1) # Arancione affamato
const COLOR_THIRSTY = Color(0.6, 0.8, 1, 1) # Azzurro assetato
const COLOR_NIGHT = Color(0.2, 0.4, 1, 1) # Blu acceso per notte
const COLOR_WARNING = Color(0.8, 0.6, 0, 1) # Giallo per avvisi
const COLOR_ERROR = Color(0.8, 0.2, 0.2, 1) # Rosso per errori
const COLOR_INFO = Color(0, 0.5, 0.2, 1) # Verde scuro per info

# Colori SafePlace autentici - VERDE ESTREMAMENTE SCURO
const SAFEPLACE_GREEN = Color("#001A0D") # Verde ESTREMAMENTE scuro per i box
const SAFEPLACE_GREEN_TEXT = Color("#00B347") # Verde chiaro per il testo
const SAFEPLACE_GREEN_BRIGHT = Color("#00FF41") # Verde brillante per highlights

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

	# Applica tema CRT autentico
	if ResourceLoader.exists("res://themes/SafePlaceTheme.tres"):
		var safeplace_theme = load("res://themes/SafePlaceTheme.tres")
		theme = safeplace_theme

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

	if event is InputEventKey and event.pressed:
		match event.keycode:
			# Navigazione WASD
			KEY_W, KEY_UP:
				_move_player(Vector2(0, -1)) # Nord
			KEY_A, KEY_LEFT:
				_move_player(Vector2(-1, 0)) # Ovest
			KEY_S, KEY_DOWN:
				_move_player(Vector2(0, 1)) # Sud
			KEY_D, KEY_RIGHT:
				_move_player(Vector2(1, 0)) # Est
			KEY_SPACE:
				_pass_time()

			# Salvataggio F5/F6/F7
			KEY_F5:
				_save_game()
			KEY_F6:
				_load_game()
			KEY_F7:
				_load_file()
			KEY_L:
				_show_legend_popup() # NUOVO: Mostra leggenda popup
			KEY_C:
				_handle_crafting() # NUOVO: Apri crafting
			KEY_I:
				_handle_inventory_management() # NUOVO: Gestione inventario
			KEY_R:
				_handle_character_growth() # NUOVO: Crescita personaggio

			# NUOVO: Testing eventi lore
			KEY_T:
				_test_lore_events() # Testa primi eventi lore

## Movimento player sulla mappa
func _move_player(direction: Vector2):
	if ascii_map:
		var moved = ascii_map.move_player(direction)
		if moved:
			_update_map_panel()
			_update_info_panel()
			_pass_time(5) # Movimento costa 5 minuti

			# NUOVO: Check eventi lore dopo movimento
			if game_manager and game_manager.has_method("check_lore_events"):
				game_manager.check_lore_events()

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

	var content = "[color=#%s]SOPRAVVIVENZA[/color]\n" % _color_to_hex(COLOR_INTERFACE)
	content += "[color=#%s]═══════════════[/color]\n" % _color_to_hex(COLOR_TEXT)

	# Colori speciali per valori critici (0 = rosso lampeggiante)
	var food_color = COLOR_NUMBERS
	var water_color = COLOR_NUMBERS

	if player.food == 0:
		food_color = Color("#CC0000") if player_visible else Color("#FF4444") # Rosso lampeggiante
	if player.water == 0:
		water_color = Color("#CC0000") if player_visible else Color("#FF4444") # Rosso lampeggiante

	content += "[color=#%s]Sazietà: [/color][color=#%s]%d[/color]\n" % [_color_to_hex(COLOR_TEXT), _color_to_hex(food_color), player.food]
	content += "[color=#%s]Idratazione: [/color][color=#%s]%d[/color]\n" % [_color_to_hex(COLOR_TEXT), _color_to_hex(water_color), player.water]
	content += "[color=#%s]Status: [/color]%s" % [_color_to_hex(COLOR_TEXT), _get_status_display()]

	survival_content.text = content

func _get_status_display() -> String:
	if current_status.is_empty():
		return "[color=#%s]Normale[/color]" % _color_to_hex(COLOR_NORMAL)

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
		PlayerStatus.NORMALE: return COLOR_NORMAL
		PlayerStatus.MALATO: return COLOR_SICK
		PlayerStatus.INFETTO: return COLOR_INFECTED
		PlayerStatus.FERITO: return COLOR_WOUNDED
		PlayerStatus.AFFAMATO: return COLOR_HUNGRY
		PlayerStatus.ASSETATO: return COLOR_THIRSTY
		_: return COLOR_NORMAL

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

	var content = "[color=#%s]INVENTARIO[/color]\n" % _color_to_hex(COLOR_INTERFACE)
	content += "[color=#%s]═══════════════[/color]\n" % _color_to_hex(COLOR_TEXT)

	var inventory = player.get_inventory_display()
	if inventory.is_empty():
		content += "[color=#%s]Vuoto[/color]" % _color_to_hex(COLOR_TEXT)
	else:
		for item in inventory:
			var item_name = item.get("name", "Sconosciuto")
			var quantity = item.get("quantity", 1)
			var item_type = _get_item_type_from_name(item_name) # Determina tipo da nome
			var color_code = _get_item_color_code(item_type)

			if quantity > 1:
				content += "%s%s[/color] [color=#%s](x%d)[/color]\n" % [color_code, item_name, _color_to_hex(COLOR_NUMBERS), quantity]
			else:
				content += "%s%s[/color]\n" % [color_code, item_name]

	inventory_content.text = content

func _update_log_panel():
	if not log_content:
		return

	var content = "[color=#%s]DIARIO DI VIAGGIO[/color]\n" % _color_to_hex(COLOR_INTERFACE)
	content += "[color=#%s]═══════════════[/color]\n" % _color_to_hex(COLOR_TEXT)

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
		content += "[color=#%s]In attesa di eventi...[/color]" % _color_to_hex(COLOR_TEXT)

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
		return "[color=#%s]%s[/color]" % [_color_to_hex(COLOR_INFO), entry]
	elif entry.contains("errore") or entry.contains("pericolo") or entry.contains("danno"):
		return "[color=#%s]%s[/color]" % [_color_to_hex(COLOR_ERROR), entry]
	elif entry.contains("attenzione") or entry.contains("avviso") or entry.contains("Non puoi"):
		return "[color=#%s]%s[/color]" % [_color_to_hex(COLOR_WARNING), entry]
	else:
		return "[color=#%s]%s[/color]" % [_color_to_hex(COLOR_TEXT), entry]

func _update_legend_panel():
	if not legend_content:
		return

	var content = "[color=#%s]LEGGENDA[/color]\n" % _color_to_hex(COLOR_INTERFACE)
	content += "[color=#%s]═══════════════[/color]\n" % _color_to_hex(COLOR_TEXT)
	content += "[color=#%s]. [/color][color=#%s]Pianura[/color]\n" % [_color_to_hex(Color.GREEN), _color_to_hex(COLOR_TEXT)]
	content += "[color=#%s]F [/color][color=#%s]Foresta[/color]\n" % [_color_to_hex(Color(0, 0.4, 0.15)), _color_to_hex(COLOR_TEXT)]
	content += "[color=#%s]M [/color][color=#%s]Montagna[/color]\n" % [_color_to_hex(Color(0.4, 0.25, 0.1)), _color_to_hex(COLOR_TEXT)]
	content += "[color=#%s]C [/color][color=#%s]Città[/color]\n" % [_color_to_hex(Color.GRAY), _color_to_hex(COLOR_TEXT)]
	content += "[color=#%s]V [/color][color=#%s]Villaggio[/color]\n" % [_color_to_hex(Color(0.6, 0.4, 0.2)), _color_to_hex(COLOR_TEXT)]
	content += "[color=#%s]~ [/color][color=#%s]Fiume[/color]\n" % [_color_to_hex(Color.CYAN), _color_to_hex(COLOR_TEXT)]
	content += "[color=#%s]@ [/color][color=#%s]Giocatore[/color]\n" % [_color_to_hex(Color.YELLOW), _color_to_hex(COLOR_TEXT)]
	content += "[color=#%s]S [/color][color=#%s]Start[/color]\n" % [_color_to_hex(COLOR_NUMBERS), _color_to_hex(COLOR_TEXT)]
	content += "[color=#%s]E [/color][color=#%s]Safe Place[/color]" % [_color_to_hex(COLOR_NUMBERS), _color_to_hex(COLOR_TEXT)]

	legend_content.text = content

func _update_map_panel():
	if not map_content or not ascii_map:
		return

	var content = "[color=#%s]MAPPA[/color]\n" % _color_to_hex(COLOR_INTERFACE)
	content += "[color=#%s]═══════════════[/color]\n" % _color_to_hex(COLOR_TEXT)

	# Ottieni display della mappa con lampeggio del player
	var map_display = ascii_map.get_colored_map_display_with_blink(player_visible)
	content += map_display

	map_content.text = content

func _update_info_panel():
	if not info_content or not ascii_map:
		return

	var player_pos = ascii_map.get_player_position()
	var terrain_info = ascii_map.get_terrain_info(player_pos)

	var content = "[color=#%s]INFO GIOCO[/color]\n" % _color_to_hex(COLOR_INTERFACE)
	content += "[color=#%s]═══════════════[/color]\n" % _color_to_hex(COLOR_TEXT)
	content += "[color=#%s]Pos: [/color][color=#%s](%d, %d)[/color]\n" % [_color_to_hex(COLOR_TEXT), _color_to_hex(COLOR_NUMBERS), player_pos.x, player_pos.y]
	content += "[color=#%s]Luogo: [/color][color=#%s]%s[/color]\n" % [_color_to_hex(COLOR_TEXT), _color_to_hex(COLOR_TEXT), terrain_info.name]

	# Orario o Notte
	if current_time.is_night:
		content += "[color=#44AAFF]Notte[/color]" # Blu acceso per la notte
	else:
		content += "[color=#%s]Ora: [/color][color=#%s]%02d:%02d[/color]" % [_color_to_hex(COLOR_TEXT), _color_to_hex(COLOR_NUMBERS), current_time.hour, current_time.minute]

	info_content.text = content

func _update_stats_panel():
	if not stats_content or not player:
		return

	var content = "[color=#%s]STATISTICHE[/color]\n" % _color_to_hex(COLOR_INTERFACE)
	content += "[color=#%s]═══════════════[/color]\n" % _color_to_hex(COLOR_TEXT)
	content += "[color=#%s]HP: [/color][color=#%s]%d[/color][color=#%s]/[/color][color=#%s]%d[/color]\n" % [_color_to_hex(COLOR_TEXT), _color_to_hex(COLOR_NUMBERS), player.hp, _color_to_hex(COLOR_TEXT), _color_to_hex(COLOR_NUMBERS), player.max_hp]
	content += "[color=#%s]VIG: [/color][color=#%s]%d[/color]    [color=#%s]POT: [/color][color=#%s]%d[/color]\n" % [_color_to_hex(COLOR_TEXT), _color_to_hex(COLOR_NUMBERS), player.vig, _color_to_hex(COLOR_TEXT), _color_to_hex(COLOR_NUMBERS), player.pot]
	content += "[color=#%s]AGI: [/color][color=#%s]%d[/color]    [color=#%s]TRA: [/color][color=#%s]%d[/color]\n" % [_color_to_hex(COLOR_TEXT), _color_to_hex(COLOR_NUMBERS), player.agi, _color_to_hex(COLOR_TEXT), _color_to_hex(COLOR_NUMBERS), player.tra]
	content += "[color=#%s]INF: [/color][color=#%s]%d[/color]    [color=#%s]PRE: [/color][color=#%s]%d[/color]\n" % [_color_to_hex(COLOR_TEXT), _color_to_hex(COLOR_NUMBERS), player.inf, _color_to_hex(COLOR_TEXT), _color_to_hex(COLOR_NUMBERS), player.pre]
	content += "[color=#%s]ADA: [/color][color=#%s]%d[/color]    [color=#%s]EXP: [/color][color=#%s]%d[/color]\n" % [_color_to_hex(COLOR_TEXT), _color_to_hex(COLOR_NUMBERS), player.ada, _color_to_hex(COLOR_TEXT), _color_to_hex(COLOR_NUMBERS), player.exp]
	content += "[color=#%s]PTS: [/color][color=#%s]%d[/color]\n" % [_color_to_hex(COLOR_TEXT), _color_to_hex(COLOR_NUMBERS), player.pts]

	# NUOVO: Equipment Bonus Display - FASE 2
	var attack_bonus = player.get_equipment_bonus("attack")
	var defense_bonus = player.get_equipment_bonus("defense")
	var total_attack = player.get_attack_power()
	var total_defense = player.get_defense_power()

	content += "[color=#%s]═══════════════[/color]\n" % _color_to_hex(COLOR_TEXT)
	content += "[color=#%s]ATK: [/color][color=#%s]%d[/color]" % [_color_to_hex(COLOR_TEXT), _color_to_hex(COLOR_NUMBERS), total_attack]
	if attack_bonus > 0:
		content += "[color=#%s](+%d)[/color]" % [_color_to_hex(SAFEPLACE_GREEN_TEXT), attack_bonus]
	content += "\n"

	content += "[color=#%s]DEF: [/color][color=#%s]%d[/color]" % [_color_to_hex(COLOR_TEXT), _color_to_hex(COLOR_NUMBERS), total_defense]
	if defense_bonus > 0:
		content += "[color=#%s](+%d)[/color]" % [_color_to_hex(SAFEPLACE_GREEN_TEXT), defense_bonus]

	stats_content.text = content

func _update_controls_panel():
	"""Aggiorna pannello controlli con layout centrato migliorato."""
	if not controls_content:
		return

	# Layout controlli centrato PERFETTAMENTE verticalmente
	var content = "[color=#%s]CONTROLLI[/color]\n" % _color_to_hex(COLOR_INTERFACE)
	content += "[color=#%s]═══════════════[/color]\n\n\n" % _color_to_hex(COLOR_TEXT) # Spazio extra
	content += "[color=#%s]        [W][/color]\n" % _color_to_hex(SAFEPLACE_GREEN_TEXT)
	content += "[color=#%s]    [A][SPC][D][/color]\n" % _color_to_hex(SAFEPLACE_GREEN_TEXT)
	content += "[color=#%s]        [S][/color]\n\n" % _color_to_hex(SAFEPLACE_GREEN_TEXT)
	content += "[color=#%s][F5] Salva [F6] Carica[/color]\n" % _color_to_hex(SAFEPLACE_GREEN_TEXT)
	content += "[color=#%s][L] Leggenda[/color]\n\n" % _color_to_hex(SAFEPLACE_GREEN_TEXT) # Spazio finale

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
	# Crea font monospace con priorità Fixedsys Excelsior
	var monospace_font = SystemFont.new()
	monospace_font.font_names = ["Fixedsys Excelsior", "Fixedsys", "Perfect DOS VGA 437", "MS DOS", "Courier New", "Lucida Console", "Consolas", "monospace"]
	# Note: In Godot 4.5, SystemFont font size is handled differently
	# We'll use the theme-based approach for size control

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
[I] Inventario
[R] Crescita
[L] Leggenda
[F5] Salva
[F6] Carica[/color]""" % [
				_color_to_hex(COLOR_INTERFACE), _color_to_hex(COLOR_TEXT),
				_color_to_hex(COLOR_TEXT), _color_to_hex(COLOR_NUMBERS),
				_color_to_hex(COLOR_TEXT), _color_to_hex(COLOR_NUMBERS),
				_color_to_hex(COLOR_TEXT), _color_to_hex(SAFEPLACE_GREEN_TEXT)
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
[I] Inventario
[R] Crescita
[L] Leggenda
[F5] Salva
[F6] Carica[/color]""" % [
			_color_to_hex(COLOR_INTERFACE), _color_to_hex(COLOR_TEXT),
			_color_to_hex(COLOR_TEXT), _color_to_hex(COLOR_NUMBERS), weapon_name,
			_color_to_hex(COLOR_TEXT), _color_to_hex(COLOR_NUMBERS), armor_name,
			_color_to_hex(COLOR_TEXT), _color_to_hex(SAFEPLACE_GREEN_TEXT)
		]

var legend_popup_active: bool = false

func _show_legend_popup():
	"""Mostra popup leggenda simboli mappa con stile SafePlace e controllo da tastiera."""
	if legend_popup_active:
		return # Evita doppie aperture

	print("[MainInterface] Showing legend popup")
	legend_popup_active = true

	# Creo popup leggenda con stile SafePlace
	var popup = AcceptDialog.new()
	popup.title = "LEGGENDA MAPPA"
	popup.dialog_text = """. Pianura
F Foresta
M Montagna
C Città
V Villaggio
~ Fiume
@ Giocatore"""

	# Styling popup completo SafePlace
	popup.add_theme_color_override("font_color", SAFEPLACE_GREEN_TEXT)
	popup.add_theme_color_override("title_color", SAFEPLACE_GREEN_BRIGHT)

	# Stile pannello popup
	var popup_style = StyleBoxFlat.new()
	popup_style.bg_color = Color("#000503") # Stesso sfondo dell'interfaccia
	popup_style.border_color = SAFEPLACE_GREEN_TEXT
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
		popup.queue_free()

	popup.confirmed.connect(close_popup)
	# Nota: AcceptDialog non ha segnale 'cancelled', solo 'confirmed'

	# Input handler per chiusura con L
	var input_handler = func(event: InputEvent):
		if event is InputEventKey and event.pressed and event.keycode == KEY_L:
			close_popup.call()
			get_viewport().set_input_as_handled()

	popup.gui_input.connect(input_handler)

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
	"""Crea un bottone per il movimento."""
	var button = Button.new()
	button.text = text
	button.custom_minimum_size = Vector2(25, 20)

	# Styling bottone
	var button_style = StyleBoxFlat.new()
	button_style.bg_color = Color("#001A0D")
	button_style.border_color = SAFEPLACE_GREEN_TEXT
	button_style.border_width_left = 1
	button_style.border_width_top = 1
	button_style.border_width_right = 1
	button_style.border_width_bottom = 1

	button.add_theme_color_override("font_color", SAFEPLACE_GREEN_TEXT)
	button.add_theme_stylebox_override("normal", button_style)
	button.add_theme_stylebox_override("hover", button_style.duplicate())
	button.add_theme_stylebox_override("pressed", button_style.duplicate())

	# Connetti segnale
	button.pressed.connect(func(): _move_player(direction))

	return button

func _create_special_button(text: String, method_name: String) -> Button:
	"""Crea un bottone per funzioni speciali."""
	var button = Button.new()
	button.text = text
	button.custom_minimum_size = Vector2(70, 18)

	# Styling bottone
	var button_style = StyleBoxFlat.new()
	button_style.bg_color = Color("#001A0D")
	button_style.border_color = SAFEPLACE_GREEN_TEXT
	button_style.border_width_left = 1
	button_style.border_width_top = 1
	button_style.border_width_right = 1
	button_style.border_width_bottom = 1

	button.add_theme_color_override("font_color", SAFEPLACE_GREEN_TEXT)
	button.add_theme_stylebox_override("normal", button_style)
	button.add_theme_stylebox_override("hover", button_style.duplicate())
	button.add_theme_stylebox_override("pressed", button_style.duplicate())

	# Connetti segnale basato sul nome metodo
	match method_name:
		"_pass_time":
			button.pressed.connect(func(): _pass_time())
		"_save_game":
			button.pressed.connect(func(): _save_game())
		"_load_game":
			button.pressed.connect(func(): _load_game())
		"_show_legend_popup":
			button.pressed.connect(func(): _show_legend_popup())

	return button

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

func _setup_panels():
	"""Setup di tutti i pannelli dell'interfaccia 8-panel con verde scuro."""
	print("[MainInterface] Setting up panels with dark green SafePlace colors")

	# Panel styling con colore sfondo specificato dall'utente
	var panel_style = StyleBoxFlat.new()
	panel_style.bg_color = Color("#000503") # Colore sfondo richiesto dall'utente
	panel_style.border_color = SAFEPLACE_GREEN_TEXT
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
	content_style.bg_color = Color("#000503") # Stesso colore per i container interni
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
			title_label.add_theme_color_override("font_color", SAFEPLACE_GREEN_TEXT)

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
	title_label.add_theme_color_override("font_color", SAFEPLACE_GREEN_TEXT)
	title_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	controls_container.add_child(title_label)

	# Separatore
	var separator1 = Label.new()
	separator1.text = "═══════════════"
	separator1.add_theme_color_override("font_color", SAFEPLACE_GREEN_TEXT)
	separator1.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	controls_container.add_child(separator1)

	# Controlli movimento in griglia
	var movement_grid = GridContainer.new()
	movement_grid.columns = 3

	# Prima riga: W (↑)
	movement_grid.add_child(_create_empty_spacer())
	var btn_w = _create_movement_button("W", Vector2(0, -1))
	var btn_up = _create_movement_button("↑", Vector2(0, -1))
	var combined_w = HBoxContainer.new()
	combined_w.add_child(btn_w)
	combined_w.add_child(btn_up)
	movement_grid.add_child(combined_w)
	movement_grid.add_child(_create_empty_spacer())

	# Seconda riga: A (←) SPACE D (→)
	var btn_a = _create_movement_button("A", Vector2(-1, 0))
	var btn_left = _create_movement_button("←", Vector2(-1, 0))
	var combined_a = HBoxContainer.new()
	combined_a.add_child(btn_a)
	combined_a.add_child(btn_left)
	movement_grid.add_child(combined_a)

	var btn_space = _create_special_button("SPC", "_pass_time")
	movement_grid.add_child(btn_space)

	var btn_d = _create_movement_button("D", Vector2(1, 0))
	var btn_right = _create_movement_button("→", Vector2(1, 0))
	var combined_d = HBoxContainer.new()
	combined_d.add_child(btn_d)
	combined_d.add_child(btn_right)
	movement_grid.add_child(combined_d)

	# Terza riga: S (↓)
	movement_grid.add_child(_create_empty_spacer())
	var btn_s = _create_movement_button("S", Vector2(0, 1))
	var btn_down = _create_movement_button("↓", Vector2(0, 1))
	var combined_s = HBoxContainer.new()
	combined_s.add_child(btn_s)
	combined_s.add_child(btn_down)
	movement_grid.add_child(combined_s)
	movement_grid.add_child(_create_empty_spacer())

	controls_container.add_child(movement_grid)

	# Comandi funzioni (incolonnati) - rimossa barra separazione per spazio
	var functions_container = VBoxContainer.new()

	var btn_save = _create_special_button("F5 Salva", "_save_game")
	var btn_load = _create_special_button("F6 Carica", "_load_game")
	var btn_legend = _create_special_button("L Leggenda", "_show_legend_popup")

	functions_container.add_child(btn_save)
	functions_container.add_child(btn_load)
	functions_container.add_child(btn_legend)

	controls_container.add_child(functions_container)

	controls_panel.add_child(controls_container)

func _update_inventory_display():
	"""Aggiorna display inventario con lore integration e colori rarità v1.2.0"""
	if not inventory_content or not player:
		return

	var inventory_text = ""
	var items = player.get_inventory_display()

	for item_info in items:
		var item_name = item_info["name"]
		var quantity = item_info["quantity"]
		var has_lore = item_info.get("has_lore", false)
		var rarity = item_info.get("rarity", "common")
		var is_special = item_info.get("is_special", false)
		var lore_text = item_info.get("lore_text", "")

		# === LORE-BASED COLOR SYSTEM v1.2.0 ===
		var color_code = ""
		if has_lore:
			# Colori basati su rarità
			match rarity:
				"legendary":
					color_code = "[color=orange]" # Arancione per legendary
				"epic":
					color_code = "[color=purple]" # Viola per epic
				"rare":
					color_code = "[color=cyan]" # Ciano per rare
				"uncommon":
					color_code = "[color=green]" # Verde per uncommon
				_:
					color_code = "[color=white]" # Bianco per common
		else:
			# Fallback al sistema tipologie originale
			var item_type = item_info.get("type", "misc")
			color_code = _get_item_color_code(item_type)

		# Indicatori speciali
		var special_indicator = ""
		if is_special:
			special_indicator = " ✦" # Simbolo per oggetti speciali

		# Formattazione quantità
		var quantity_text = ""
		if quantity > 1:
			quantity_text = " (x%d)" % quantity

		# Display finale con supporto tooltip
		var display_line = "%s%s%s%s[/color]" % [color_code, item_name, quantity_text, special_indicator]

		# Aggiunge lore come tooltip preview se disponibile
		if has_lore and not lore_text.is_empty():
			var lore_preview = lore_text.substr(0, 40)
			if lore_text.length() > 40:
				lore_preview += "..."
			display_line += " [color=gray][i](" + lore_preview + ")[/i][/color]"

		inventory_text += display_line + "\n"

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
		_: return "[color=#%s]" % _color_to_hex(COLOR_TEXT) # Default verde

## ===== NUOVO: TESTING EVENTI LORE =====

func _test_lore_events():
	"""Testa manualmente gli eventi lore - Hotkey T"""
	print("🎭 [MainInterface] Test eventi lore attivato")

	if not game_manager:
		add_log_entry("❌ GameManager non disponibile")
		return

	# Force trigger primo evento
	if game_manager.has_method("force_trigger_lore_event"):
		game_manager.force_trigger_lore_event("lore_echo_of_departure")
		add_log_entry("🧪 Test: evento 'L'Eco della Partenza' forzato")
	else:
		add_log_entry("❌ Metodo force_trigger_lore_event non trovato")

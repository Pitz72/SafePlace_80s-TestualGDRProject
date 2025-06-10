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
enum PlayerStatus { NORMALE, MALATO, INFETTO, FERITO, AFFAMATO, ASSETATO }
var current_status: Array[PlayerStatus] = [PlayerStatus.NORMALE]

# Colori CRT autentici SafePlace
const COLOR_INTERFACE = Color(0, 0.7, 0.25, 1)      # Verde base interfaccia
const COLOR_TEXT = Color(0, 0.7, 0.25, 1)           # Verde standard testi
const COLOR_NUMBERS = Color(0, 0.9, 0.4, 1)         # Verde più chiaro per numeri
const COLOR_NORMAL = Color(0, 0.7, 0.25, 1)         # Verde normale  
const COLOR_SICK = Color(0.8, 0.6, 0, 1)            # Giallo malato
const COLOR_INFECTED = Color(0.8, 0.2, 0.8, 1)      # Magenta infetto
const COLOR_WOUNDED = Color(0.8, 0.2, 0.2, 1)       # Rosso ferito
const COLOR_HUNGRY = Color(0.9, 0.5, 0, 1)          # Arancione affamato
const COLOR_THIRSTY = Color(0.6, 0.8, 1, 1)         # Azzurro assetato
const COLOR_NIGHT = Color(0.2, 0.4, 1, 1)           # Blu acceso per notte
const COLOR_WARNING = Color(0.8, 0.6, 0, 1)         # Giallo per avvisi
const COLOR_ERROR = Color(0.8, 0.2, 0.2, 1)         # Rosso per errori
const COLOR_INFO = Color(0, 0.5, 0.2, 1)            # Verde scuro per info

# Colori SafePlace autentici - VERDE ESTREMAMENTE SCURO
const SAFEPLACE_GREEN = Color("#001A0D")  # Verde ESTREMAMENTE scuro per i box
const SAFEPLACE_GREEN_TEXT = Color("#00B347")  # Verde chiaro per il testo
const SAFEPLACE_GREEN_BRIGHT = Color("#00FF41")  # Verde brillante per highlights

func _ready():
	_setup_interface()
	_initialize_ascii_map()
	_setup_initial_content()
	_connect_input_signals()

func _process(delta):
	# Lampeggio del player @ sulla mappa (stile CRT)
	player_blink_timer += delta
	if player_blink_timer >= 0.8:  # Lampeggia ogni 0.8 secondi
		player_visible = !player_visible
		player_blink_timer = 0.0
		_update_map_panel()  # Aggiorna solo mappa per lampeggio
	
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
	# Setup titoli e layout prima degli aggiornamenti contenuto
	_setup_panel_titles()
	_setup_controls_layout()
	
	_update_survival_panel()
	_update_inventory_panel() 
	_update_log_panel()
	_update_legend_panel()
	_update_map_panel()
	_update_info_panel()
	_update_stats_panel()
	_update_controls_panel()
	_setup_equipment_display()
	
	# Log evento iniziale
	add_log_entry("[*] Benvenuto in SafePlace")
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
			KEY_W:
				_move_player(Vector2(0, -1))  # Nord
			KEY_A:
				_move_player(Vector2(-1, 0))  # Ovest  
			KEY_S:
				_move_player(Vector2(0, 1))   # Sud
			KEY_D:
				_move_player(Vector2(1, 0))   # Est
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
				_show_legend_popup()  # NUOVO: Mostra leggenda popup
			KEY_C:
				_handle_crafting()    # NUOVO: Apri crafting
			KEY_I:
				_handle_inventory_management()  # NUOVO: Gestione inventario
			KEY_R:
				_handle_character_growth()      # NUOVO: Crescita personaggio

## Movimento player sulla mappa
func _move_player(direction: Vector2):
	if ascii_map:
		var moved = ascii_map.move_player(direction)
		if moved:
			_update_map_panel()
			_update_info_panel()
			_pass_time(5)  # Movimento costa 5 minuti
			
			# Possibilità evento casuale durante movimento
			if randf() < 0.1:  # 10% chance
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
	if current_time.minute == 0:  # Nuova ora
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
		food_color = Color("#CC0000") if player_visible else Color("#FF4444")  # Rosso lampeggiante
	if player.water == 0:
		water_color = Color("#CC0000") if player_visible else Color("#FF4444")  # Rosso lampeggiante
	
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
			var item_type = _get_item_type_from_name(item_name)  # Determina tipo da nome
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
	
	# Eventi colorati per tipo come nel gioco originale  
	content += "[color=#44FF44]► Hai iniziato la tua avventura[/color]\n"  # Verde per eventi positivi
	content += "[color=#FFAA44]⚠ Controlla le tue provviste[/color]\n"    # Arancione per avvertimenti  
	content += "[color=#4444FF]📖 Consulta la mappa per orientarti[/color]\n"  # Blu per suggerimenti
	content += "[color=#FF4444]💀 Attenzione ai pericoli[/color]\n"         # Rosso per pericoli
	content += "[color=#FFFF44]✨ Buona fortuna, viaggiatore![/color]"      # Giallo per eventi speciali
	
	# Mostra anche eventuali eventi reali se presenti
	if event_log.size() > 0:
		content += "\n[color=#%s]═══════════════[/color]\n" % _color_to_hex(COLOR_TEXT)
		var start_index = max(0, event_log.size() - 3)  # Ultimi 3 eventi reali
		for i in range(start_index, event_log.size()):
			var log_entry = event_log[i]
			var colored_entry = _colorize_log_entry(log_entry)
			content += colored_entry + "\n"
	
	log_content.text = content

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
	content += "[color=#%s]S [/color][color=#%s]Start[/color]\n" % [_color_to_hex(COLOR_NUMBERS), _color_to_hex(COLOR_TEXT)]
	content += "[color=#%s]E [/color][color=#%s]Safe Place[/color]\n" % [_color_to_hex(COLOR_NUMBERS), _color_to_hex(COLOR_TEXT)]
	content += "[color=#%s]@ [/color][color=#%s]Giocatore[/color]" % [_color_to_hex(Color.YELLOW), _color_to_hex(COLOR_TEXT)]
	
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
		content += "[color=#44AAFF]Notte[/color]"  # Blu acceso per la notte
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
	content += "[color=#%s]PTS: [/color][color=#%s]%d[/color]" % [_color_to_hex(COLOR_TEXT), _color_to_hex(COLOR_NUMBERS), player.pts]
	
	stats_content.text = content

func _update_controls_panel():
	"""Aggiorna pannello controlli con layout centrato migliorato."""
	if not controls_content:
		return
	
	# Layout controlli centrato PERFETTAMENTE verticalmente
	var content = "[color=#%s]CONTROLLI[/color]\n" % _color_to_hex(COLOR_INTERFACE)
	content += "[color=#%s]═══════════════[/color]\n\n\n" % _color_to_hex(COLOR_TEXT)  # Spazio extra
	content += "[color=#%s]        [W][/color]\n" % _color_to_hex(SAFEPLACE_GREEN_TEXT)
	content += "[color=#%s]    [A][SPC][D][/color]\n" % _color_to_hex(SAFEPLACE_GREEN_TEXT)
	content += "[color=#%s]        [S][/color]\n\n" % _color_to_hex(SAFEPLACE_GREEN_TEXT)
	content += "[color=#%s][F5] Salva [F6] Carica[/color]\n" % _color_to_hex(SAFEPLACE_GREEN_TEXT)
	content += "[color=#%s][L] Leggenda[/color]\n\n" % _color_to_hex(SAFEPLACE_GREEN_TEXT)  # Spazio finale
	
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
		map_content,     # CRITICO per mappa ASCII!
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
	var content_size = panel_size - Vector2(20, 50)  # Più padding per sicurezza
	
	# Calcola caratteri che entrano (MOLTO conservativo per evitare wrapping)
	var char_width = 8.5   # Più largo per sicurezza
	var char_height = 18   # Più alto per sicurezza
	
	var optimal_width = int(content_size.x / char_width)
	var optimal_height = int(content_size.y / char_height) - 2  # Sottrai spazio per titolo
	
	# Applica limiti ULTRA conservativi per evitare wrapping
	optimal_width = clamp(optimal_width, 35, 57)  # RIDOTTO A 57 per eliminare wrapping
	optimal_height = clamp(optimal_height, 12, 28)
	
	# Aggiorna viewport nell'ASCII map generator
	if ascii_map.has_method("set_viewport_size"):
		ascii_map.set_viewport_size(optimal_width, optimal_height)
		print("🗺️ [MapViewport] Ottimizzato a %dx%d caratteri (anti-wrapping)" % [optimal_width, optimal_height])
	else:
		print("🗺️ [MapViewport] Usando viewport statico 92x27") 

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

func _show_legend_popup():
	"""Mostra popup leggenda simboli mappa."""
	print("[MainInterface] Showing legend popup")
	
	# Creo popup leggenda temporaneo
	var popup = AcceptDialog.new()
	popup.title = "LEGGENDA MAPPA"
	popup.dialog_text = """
. Pianura
F Foresta  
M Montagna
C Città
V Villaggio
~ Fiume
@ Giocatore"""
	
	# Styling popup
	popup.add_theme_color_override("font_color", SAFEPLACE_GREEN_TEXT)
	
	get_tree().current_scene.add_child(popup)
	popup.popup_centered()
	popup.confirmed.connect(func(): popup.queue_free())

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



func _setup_panel_titles():
	"""Setup titoli pannelli con colore verde SafePlace."""
	var titles = {
		"SurvivalTitle": "SOPRAVVIVENZA",
		"InventoryTitle": "INVENTARIO", 
		"LogTitle": "DIARIO DI VIAGGIO",
		"MapTitle": "MAPPA",  # Rimosso 250x250
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
	"""Setup layout controlli centralizzato con comandi aggiuntivi."""
	if controls_content:
		controls_content.text = """═══════════════════════════

		[W]
	[A][SPC][D]
		[S]

[F5] Salva [F6] Carica [L] Leggenda"""
		controls_content.add_theme_color_override("font_color", SAFEPLACE_GREEN_TEXT)

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

func _update_log_display():
	"""Aggiorna display log eventi con colori per tipologie eventi."""
	if not log_content:
		return
	
	var recent_events = _get_recent_events(15)  # Ultimi 15 eventi
	var log_text = ""
	
	for event in recent_events:
		var event_text = event.get("text", "")
		var event_type = event.get("type", "info")
		
		# Colori per tipologie eventi come nel gioco originale
		var color_code = _get_event_color_code(event_type)
		log_text += "%s%s[/color]\n" % [color_code, event_text]
	
	log_content.text = log_text

func _get_event_color_code(event_type: String) -> String:
	"""Restituisce il codice colore BBCode per tipo evento come nel gioco originale."""
	match event_type:
		"combat":
			return "[color=#FF4444]"  # Rosso per combattimento
		"discovery":
			return "[color=#44FF44]"  # Verde per scoperte
		"warning":
			return "[color=#FFAA44]"  # Arancione per avvertimenti
		"story":
			return "[color=#4444FF]"  # Blu per eventi storia
		"system":
			return "[color=#AAAAAA]"  # Grigio per eventi sistema
		"death":
			return "[color=#AA0000]"  # Rosso scuro per morte
		"level":
			return "[color=#FFFF44]"  # Giallo per level up
		"info":
			return "[color=#FFFFFF]"  # Bianco per info generali
		_:
			return "[color=#FFFFFF]"  # Default bianco

func _get_recent_events(max_count: int) -> Array:
	"""Recupera eventi recenti dal log (placeholder per ora)."""
	# TODO: Implementare recupero eventi reali dal EventManager
	return [
		{"text": "Benvenuto in SafePlace", "type": "info"},
		{"text": "Prima di partire, controlla il tuo inventario", "type": "info"}
	]

# Funzioni helper per colori oggetti inventario
func _get_item_type_from_name(item_name: String) -> String:
	var name_lower = item_name.to_lower()
	if "arma" in name_lower or "pistol" in name_lower or "fucil" in name_lower or "coltell" in name_lower:
		return "weapon"
	elif "armor" in name_lower or "giubbott" in name_lower or "armatur" in name_lower:
		return "armor"
	elif "cibo" in name_lower or "carn" in name_lower or "pane" in name_lower or "razio" in name_lower:
		return "food"
	elif "acqua" in name_lower or "water" in name_lower or "bevand" in name_lower:
		return "drink"
	elif "medic" in name_lower or "benda" in name_lower or "kit" in name_lower:
		return "medical"
	elif "muni" in name_lower or "pallottol" in name_lower or "cartucc" in name_lower:
		return "ammo"
	else:
		return "misc"

# QUESTA FUNZIONE SOVRASCRIVE LA PRECEDENTE CON COLORI AGGIORNATI
func _get_item_color_code(item_type: String) -> String:
	match item_type:
		"weapon": return "[color=#FF6B6B]"     # Rosso brillante per armi
		"armor": return "[color=#4ECDC4]"      # Ciano per armature  
		"food": return "[color=#FFE66D]"       # Giallo per cibo
		"drink": return "[color=#4DB6E6]"      # Blu per bevande
		"medical": return "[color=#95E1D3]"    # Verde chiaro per oggetti medici
		"ammo": return "[color=#FFA726]"       # Arancione per munizioni
		"misc": return "[color=#B39DDB]"       # Viola per oggetti vari
		_: return "[color=#%s]" % _color_to_hex(COLOR_TEXT)  # Default

 

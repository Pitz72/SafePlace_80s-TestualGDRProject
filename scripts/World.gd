extends Node2D
class_name World

# ============================================================================
# WORLD SCRIPT FINALE - The Safe Place v0.0.6
# ============================================================================
# Script per gestire il mondo di gioco con TileMap, movimento player e collisioni
# Carica mappa ASCII 250x250 e la converte in tiles con collision detection
# ============================================================================

# REFERENZE NODI SCENA
@onready var ascii_tilemap: TileMap = $AsciiTileMap
@onready var player_character: Label = $PlayerCharacter
@onready var camera: Camera2D = $Camera2D

# CONFIGURAZIONE MAPPA
const MAP_FILE_PATH = "res://mappa_ascii_gdr.txt"
const TILESET_PATH = "res://tilesets/ascii_tileset.tres"
const TILE_SIZE = 16  # Dimensione tile in pixel

# MAPPING CARATTERI ASCII → TILE ID
# NOTA: L'ID del tile dipende dall'ordine nell'Atlas del TileSet!
# Ordine VERIFICATO nel TileSet salvato:
# Source 0=city, 1=end_point, 2=forest, 3=mountain, 4=start_point, 5=terrain, 6=village, 7=water
var char_to_tile_id = {
	".": 5,  # terrain.png (Source 5)
	"F": 2,  # forest.png (Source 2)
	"M": 3,  # mountain.png (Source 3) - CON COLLISION!
	"~": 7,  # water.png (Source 7)
	"V": 6,  # village.png (Source 6)
	"C": 0,  # city.png (Source 0)
	"S": 4,  # start_point.png (Source 4)
	"E": 1   # end_point.png (Source 1)
}

# STATO PLAYER
var player_position: Vector2i = Vector2i(0, 0)
var map_data: Array[String] = []
var map_width: int = 0
var map_height: int = 0

# ============================================================================
# INIZIALIZZAZIONE
# ============================================================================

func _ready():
	print("🗺️ Inizializzazione mondo TileMap...")
	
	# Configura TileMap
	_setup_tilemap()
	
	# Carica e processa mappa
	_load_map_data()
	_convert_map_to_tilemap()
	
	# Inizializza player
	_setup_player()
	
	# Configura camera
	_setup_camera()
	
	print("✅ Mondo inizializzato - Pronto per il gioco!")

func _setup_tilemap():
	"""Configura il TileMap con il TileSet"""
	if ascii_tilemap == null:
		print("❌ ERRORE: Nodo AsciiTileMap non trovato!")
		return
	
	# Carica TileSet
	var tileset = load(TILESET_PATH)
	if tileset == null:
		print("❌ ERRORE: TileSet non trovato in " + TILESET_PATH)
		return
	
	ascii_tilemap.tile_set = tileset
	print("✅ TileSet caricato e assegnato")

func _setup_player():
	"""Configura il personaggio player"""
	if player_character == null:
		print("❌ ERRORE: Nodo PlayerCharacter non trovato!")
		return
	
	# Configura Label player
	player_character.text = "@"
	player_character.add_theme_color_override("font_color", Color.GREEN)
	player_character.size = Vector2(TILE_SIZE, TILE_SIZE)
	player_character.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	player_character.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	
	# Posiziona player sulla posizione iniziale
	_update_player_visual_position()
	print("✅ Player configurato alla posizione: " + str(player_position))

func _setup_camera():
	"""Configura la camera per seguire il player"""
	if camera == null:
		print("❌ ERRORE: Nodo Camera2D non trovato!")
		return
	
	camera.enabled = true
	camera.zoom = Vector2(2.0, 2.0)  # Zoom 2x - bilanciato
	# Centra immediatamente sulla posizione player
	var world_pos = Vector2(player_position.x * TILE_SIZE, player_position.y * TILE_SIZE)
	camera.position = world_pos
	camera.force_update_scroll()  # Forza aggiornamento immediato
	print("✅ Camera configurata e attiva (zoom 2x, centrata su player)")

# ============================================================================
# CARICAMENTO E CONVERSIONE MAPPA
# ============================================================================

func _load_map_data():
	"""Carica dati mappa ASCII dal file di testo"""
	print("📁 Caricamento mappa da: " + MAP_FILE_PATH)
	
	var file = FileAccess.open(MAP_FILE_PATH, FileAccess.READ)
	if file == null:
		print("❌ ERRORE: Impossibile aprire file mappa!")
		return
	
	map_data.clear()
	
	while not file.eof_reached():
		var line = file.get_line().strip_edges(false, true)  # Rimuovi solo spazi finali
		if line.length() > 0:
			map_data.append(line)
	
	file.close()
	
	if map_data.size() > 0:
		map_height = map_data.size()
		map_width = map_data[0].length()
		print("✅ Mappa caricata: " + str(map_width) + "x" + str(map_height))
	else:
		print("❌ ERRORE: File mappa vuoto!")

func _convert_map_to_tilemap():
	"""Converte mappa ASCII in TileMap usando i tile ID"""
	print("🔄 Conversione mappa ASCII → TileMap...")
	
	var tiles_placed = 0
	var start_found = false
	var source_id_map = {}  # Debug mapping
	
	for y in range(map_height):
		var row = map_data[y]
		for x in range(min(row.length(), map_width)):
			var char = row[x]
			
			# Trova tile ID per carattere
			var source_id = char_to_tile_id.get(char, 5)  # Default: terrain (source 5)
			
			# Posiziona tile nel TileMap
			# CORREZIONE: source_id va nel parametro source_id, non atlas_coords!
			ascii_tilemap.set_cell(0, Vector2i(x, y), source_id, Vector2i(0, 0))
			tiles_placed += 1
			
			# Debug: conta source_id usati
			if not source_id_map.has(source_id):
				source_id_map[source_id] = 0
			source_id_map[source_id] += 1
			
			# Memorizza posizione start per player
			if char == "S" and not start_found:
				player_position = Vector2i(x, y)
				start_found = true
				print("🎯 Posizione start trovata: " + str(player_position))
	
	print("✅ Conversione completata: " + str(tiles_placed) + " tiles posizionati")
	print("🔍 DEBUG Source IDs usati:")
	for source_id in source_id_map.keys():
		print("   Source " + str(source_id) + ": " + str(source_id_map[source_id]) + " tiles")
	
	if not start_found:
		print("⚠️  Posizione start 'S' non trovata, usando (0,0)")
		player_position = Vector2i(0, 0)

# ============================================================================
# MOVIMENTO E COLLISION DETECTION
# ============================================================================

func _input(event):
	"""Gestisce input movimento player"""
	if not event.is_pressed():
		return
	
	var new_position = player_position
	
	# Calcola nuova posizione basata su input
	if event.is_action_pressed("ui_up") or Input.is_key_pressed(KEY_W):
		new_position.y -= 1
	elif event.is_action_pressed("ui_down") or Input.is_key_pressed(KEY_S):
		new_position.y += 1
	elif event.is_action_pressed("ui_left") or Input.is_key_pressed(KEY_A):
		new_position.x -= 1
	elif event.is_action_pressed("ui_right") or Input.is_key_pressed(KEY_D):
		new_position.x += 1
	else:
		return  # Nessun movimento
	
	# Valida e applica movimento
	if _is_valid_move(new_position):
		_move_player_to(new_position)
	else:
		print("🚫 Movimento bloccato verso: " + str(new_position))

func _is_valid_move(pos: Vector2i) -> bool:
	"""Valida se il movimento è possibile usando collision detection TileMap"""
	
	# Controlla confini mappa
	if pos.x < 0 or pos.x >= map_width or pos.y < 0 or pos.y >= map_height:
		return false
	
	# Ottieni dati tile di destinazione
	var tile_data = ascii_tilemap.get_cell_tile_data(0, pos)
	
	if tile_data == null:
		# Nessun tile = movimento valido
		return true
	
	# Controlla se il tile ha collision shapes
	# Se ha collision physics, blocca movimento
	for i in range(tile_data.get_collision_polygons_count(0)):
		var collision_polygon = tile_data.get_collision_polygon_points(0, i)
		if collision_polygon.size() > 0:
			# Tile ha collision shape = movimento bloccato
			return false
	
	# Nessuna collisione trovata = movimento valido
	return true

func _move_player_to(new_pos: Vector2i):
	"""Muove il player alla nuova posizione"""
	player_position = new_pos
	_update_player_visual_position()
	_update_camera_position()
	
	# Log movimento per debug (meno verbose)
	var char_at_pos = _get_char_at_position(new_pos)
	if new_pos.x % 10 == 0 or new_pos.y % 10 == 0:  # Log solo ogni 10 tiles
		print("🚶 Player: " + str(new_pos) + " (" + char_at_pos + ") | Camera: " + str(camera.position))

func _update_player_visual_position():
	"""Aggiorna posizione visuale del player Label"""
	if player_character != null:
		var world_pos = Vector2(player_position.x * TILE_SIZE, player_position.y * TILE_SIZE)
		player_character.position = world_pos

func _update_camera_position():
	"""Aggiorna posizione camera per seguire player (sempre centrato)"""
	if camera != null:
		# Player sempre al centro - posizione immediata
		var world_pos = Vector2(player_position.x * TILE_SIZE, player_position.y * TILE_SIZE)
		camera.position = world_pos

# ============================================================================
# UTILITY E DEBUG
# ============================================================================

func _get_char_at_position(pos: Vector2i) -> String:
	"""Ottieni carattere ASCII alla posizione specificata (per debug)"""
	if pos.y >= 0 and pos.y < map_data.size():
		var row = map_data[pos.y]
		if pos.x >= 0 and pos.x < row.length():
			return row[pos.x]
	return "?"

func get_player_position() -> Vector2i:
	"""API pubblica: ottieni posizione player"""
	return player_position

func get_tile_at_position(pos: Vector2i) -> int:
	"""API pubblica: ottieni tile ID alla posizione"""
	var cell_source_id = ascii_tilemap.get_cell_source_id(0, pos)
	var cell_atlas_coords = ascii_tilemap.get_cell_atlas_coords(0, pos)
	
	if cell_source_id != -1:
		return cell_atlas_coords.x  # Assumendo tiles su riga singola
	return -1

func is_position_walkable(pos: Vector2i) -> bool:
	"""API pubblica: controlla se posizione è percorribile"""
	return _is_valid_move(pos)

# ============================================================================
# DEBUG INFO
# ============================================================================

func _on_debug_info_requested():
	"""Stampa informazioni debug del mondo"""
	print("=== WORLD DEBUG INFO ===")
	print("Mappa: " + str(map_width) + "x" + str(map_height))
	print("Player: " + str(player_position))
	print("Tile sotto player: " + str(get_tile_at_position(player_position)))
	print("Carattere sotto player: " + _get_char_at_position(player_position))
	print("========================")

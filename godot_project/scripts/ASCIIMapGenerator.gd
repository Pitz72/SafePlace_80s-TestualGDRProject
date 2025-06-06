extends RefCounted
class_name ASCIIMapGenerator

## Generatore Mappa ASCII per SafePlace
## Crea mappe procedurali autentiche con simboli e colori originali

# Simboli mappa SafePlace originali
const SYMBOL_PLAINS = "."      # Pianure
const SYMBOL_FOREST = "F"      # Foreste  
const SYMBOL_MOUNTAIN = "M"    # Montagne
const SYMBOL_CITY = "C"        # Città
const SYMBOL_VILLAGE = "V"     # Villaggi
const SYMBOL_RIVER = "~"       # Fiumi
const SYMBOL_START = "S"       # Punto di partenza (lampeggiante giallo)
const SYMBOL_END = "E"         # Punto di arrivo (lampeggiante giallo)
const SYMBOL_PLAYER = "@"      # Player position (verde brillante lampeggiante)

# Colori autentici SafePlace CRT
const COLOR_PLAINS = Color(0, 0.7, 0.25, 1)     # Verde base interfaccia
const COLOR_FOREST = Color(0, 0.4, 0.15, 1)     # Verde scuro
const COLOR_MOUNTAIN = Color(0.4, 0.25, 0.1, 1) # Marrone scuro
const COLOR_CITY = Color(0.7, 0.7, 0.7, 1)      # Grigio chiaro
const COLOR_VILLAGE = Color(0.6, 0.4, 0.2, 1)   # Marrone chiaro  
const COLOR_RIVER = Color(0.2, 0.6, 0.8, 1)     # Celeste
const COLOR_START = Color(0, 0.7, 0.25, 1)      # Verde interfaccia (standard)
const COLOR_START_BLINK = Color(1, 1, 0, 1)     # Giallo lampeggiante
const COLOR_END = Color(0, 0.7, 0.25, 1)        # Verde interfaccia (standard)
const COLOR_END_BLINK = Color(1, 1, 0, 1)       # Giallo lampeggiante
const COLOR_PLAYER = Color(0, 1, 0.4, 1)        # Verde più brillante di interfaccia
const COLOR_PLAYER_BLINK = Color(0.2, 1, 0.6, 1) # Verde cursore lampeggiante

# Dimensioni mappa
const MAP_WIDTH = 250
const MAP_HEIGHT = 250
# Viewport dinamico per riempire ottimalmente il MapPanel
var viewport_width = 92  # Larghezza viewport (può essere modificata dinamicamente)
var viewport_height = 27 # Altezza viewport (può essere modificata dinamicamente)

# Probabilità generazione terreni
const FOREST_CHANCE = 0.15
const MOUNTAIN_CHANCE = 0.08
const RIVER_CHANCE = 0.03
const CITY_CHANCE = 0.01
const VILLAGE_CHANCE = 0.03

# Cluster settings per città e villaggi
const MAX_CITY_CLUSTER_SIZE = 8
const MAX_VILLAGE_CLUSTER_SIZE = 5
const MIN_CLUSTER_DISTANCE = 3

# Struttura dati mappa
var map_data: Array[Array] = []
var player_pos: Vector2 = Vector2(125, 125)  # Centro mappa iniziale (250x250)
var start_pos: Vector2 = Vector2(-1, -1)   # Punto di partenza
var end_pos: Vector2 = Vector2(-1, -1)     # Punto di arrivo
var discovered_areas: Array[Vector2] = []
var blink_timer: float = 0.0              # Timer per lampeggio

func _init():
	_generate_base_terrain()
	_add_rivers()
	_add_settlements()
	_add_start_and_end_points()
	_add_player_starting_position()

## Genera il terreno base della mappa
func _generate_base_terrain():
	map_data.clear()
	
	for y in MAP_HEIGHT:
		var row: Array[String] = []
		for x in MAP_WIDTH:
			var terrain_roll = randf()
			
			if terrain_roll < MOUNTAIN_CHANCE:
				row.append(SYMBOL_MOUNTAIN)
			elif terrain_roll < MOUNTAIN_CHANCE + FOREST_CHANCE:
				row.append(SYMBOL_FOREST)
			else:
				row.append(SYMBOL_PLAINS)
		
		map_data.append(row)

## Aggiunge fiumi alla mappa
func _add_rivers():
	# Genera 2-4 fiumi che attraversano la mappa
	var num_rivers = randi_range(2, 4)
	
	for i in num_rivers:
		_generate_river()

func _generate_river():
	# Inizia da un bordo random
	var start_side = randi() % 4
	var start_pos: Vector2
	var direction: Vector2
	
	match start_side:
		0: # Top
			start_pos = Vector2(randi_range(5, MAP_WIDTH-5), 0)
			direction = Vector2(0, 1)
		1: # Right  
			start_pos = Vector2(MAP_WIDTH-1, randi_range(5, MAP_HEIGHT-5))
			direction = Vector2(-1, 0)
		2: # Bottom
			start_pos = Vector2(randi_range(5, MAP_WIDTH-5), MAP_HEIGHT-1)
			direction = Vector2(0, -1)
		3: # Left
			start_pos = Vector2(0, randi_range(5, MAP_HEIGHT-5))
			direction = Vector2(1, 0)
	
	# Genera il percorso del fiume
	var current_pos = start_pos
	var length = randi_range(8, 15)
	
	for i in length:
		if _is_valid_position(current_pos):
			map_data[current_pos.y][current_pos.x] = SYMBOL_RIVER
		
		# Direzione con piccole variazioni
		if randf() < 0.3:
			direction = direction.rotated(randf_range(-PI/4, PI/4))
			direction = direction.normalized()
		
		current_pos += direction
		
		# Esce se fuori bounds
		if not _is_valid_position(current_pos):
			break

## Aggiunge insediamenti (città e villaggi)
func _add_settlements():
	var settlements: Array[Vector2] = []
	
	# Genera 3-5 città
	for i in randi_range(3, 5):
		var city_pos = _find_settlement_position(settlements, MIN_CLUSTER_DISTANCE)
		if city_pos != Vector2(-1, -1):
			_generate_city_cluster(city_pos)
			settlements.append(city_pos)
	
	# Genera 5-8 villaggi  
	for i in randi_range(5, 8):
		var village_pos = _find_settlement_position(settlements, MIN_CLUSTER_DISTANCE)
		if village_pos != Vector2(-1, -1):
			_generate_village_cluster(village_pos)
			settlements.append(village_pos)

func _find_settlement_position(existing_settlements: Array[Vector2], min_distance: int) -> Vector2:
	var attempts = 50
	
	while attempts > 0:
		var pos = Vector2(randi_range(2, MAP_WIDTH-2), randi_range(2, MAP_HEIGHT-2))
		
		# Verifica che non sia troppo vicino ad altri insediamenti
		var valid = true
		for settlement in existing_settlements:
			if pos.distance_to(settlement) < min_distance:
				valid = false
				break
		
		# Verifica terreno adatto (no montagne/fiumi)
		if valid and _is_valid_position(pos):
			var terrain = map_data[pos.y][pos.x]
			if terrain == SYMBOL_PLAINS or terrain == SYMBOL_FOREST:
				return pos
		
		attempts -= 1
	
	return Vector2(-1, -1)  # Non trovato

func _generate_city_cluster(center: Vector2):
	var cluster_size = randi_range(6, MAX_CITY_CLUSTER_SIZE)
	_place_settlement_cluster(center, SYMBOL_CITY, cluster_size)

func _generate_village_cluster(center: Vector2):
	var cluster_size = randi_range(3, MAX_VILLAGE_CLUSTER_SIZE)
	_place_settlement_cluster(center, SYMBOL_VILLAGE, cluster_size)

func _place_settlement_cluster(center: Vector2, symbol: String, size: int):
	var placed = 0
	var positions: Array[Vector2] = [center]
	
	# Piazza il centro
	if _is_valid_position(center):
		map_data[center.y][center.x] = symbol
		placed += 1
	
	# Espandi il cluster
	while placed < size:
		var new_positions: Array[Vector2] = []
		
		for pos in positions:
			# Controlla posizioni adiacenti
			for dx in range(-1, 2):
				for dy in range(-1, 2):
					if dx == 0 and dy == 0:
						continue
					
					var new_pos = pos + Vector2(dx, dy)
					if _is_valid_position(new_pos) and new_pos not in positions:
						var terrain = map_data[new_pos.y][new_pos.x]
						if terrain == SYMBOL_PLAINS or terrain == SYMBOL_FOREST:
							if randf() < 0.6:  # Probabilità espansione
								map_data[new_pos.y][new_pos.x] = symbol
								new_positions.append(new_pos)
								placed += 1
								
								if placed >= size:
									return
		
		positions.append_array(new_positions)
		
		# Evita loop infiniti
		if new_positions.is_empty():
			break

## Aggiunge punti start ed end alla mappa
func _add_start_and_end_points():
	# Punto di partenza (S) - angolo in basso a sinistra
	start_pos = Vector2(randi_range(5, 20), randi_range(MAP_HEIGHT-20, MAP_HEIGHT-5))
	if _is_valid_position(start_pos):
		map_data[start_pos.y][start_pos.x] = SYMBOL_START
	
	# Punto di arrivo (E) - SafePlace a (190, 190) come nell'originale
	end_pos = Vector2(190, 190)
	if _is_valid_position(end_pos):
		map_data[end_pos.y][end_pos.x] = SYMBOL_END

## Imposta posizione iniziale player
func _add_player_starting_position():
	# Trova una posizione di pianura vicino al centro (125, 125 per mappa 250x250)
	for radius in range(1, 20):
		for dx in range(-radius, radius + 1):
			for dy in range(-radius, radius + 1):
				var pos = Vector2(125 + dx, 125 + dy)  # Cerca dal centro della mappa 250x250
				if _is_valid_position(pos):
					var terrain = map_data[pos.y][pos.x]
					if terrain == SYMBOL_PLAINS:
						player_pos = pos
						discovered_areas.append(pos)
						return

## Muove il player e aggiorna la mappa
func move_player(direction: Vector2) -> bool:
	var new_pos = player_pos + direction
	
	if _is_valid_position(new_pos):
		player_pos = new_pos
		
		# Aggiungi alla lista aree scoperte
		if new_pos not in discovered_areas:
			discovered_areas.append(new_pos)
		
		return true
	
	return false

## Genera la stringa ASCII per display  
func get_map_display() -> String:
	var display = ""
	
	for y in MAP_HEIGHT:
		for x in MAP_WIDTH:
			if Vector2(x, y) == player_pos:
				display += SYMBOL_PLAYER
			else:
				display += map_data[y][x]
		display += "\n"
	
	return display

## Aggiorna timer per lampeggio (chiamata da MainInterface)
func update_blink_timer(delta: float):
	blink_timer += delta

## Verifica se è il momento del lampeggio (ogni 0.5 secondi)
func is_blinking() -> bool:
	return fmod(blink_timer, 1.0) < 0.5

## Genera mappa con colori BBCode per RichTextLabel (viewport centrato sul player)
func get_colored_map_display() -> String:
	return get_colored_map_display_with_blink(true)

func get_colored_map_display_with_blink(show_player: bool) -> String:
	var display = ""
	var is_blink_time = is_blinking()
	
	# Calcola viewport centrato sul player
	var viewport_start_x = max(0, player_pos.x - viewport_width / 2)
	var viewport_start_y = max(0, player_pos.y - viewport_height / 2)
	var viewport_end_x = min(MAP_WIDTH, viewport_start_x + viewport_width)
	var viewport_end_y = min(MAP_HEIGHT, viewport_start_y + viewport_height)
	
	# Aggiusta i bordi se necessario
	if viewport_end_x - viewport_start_x < viewport_width:
		viewport_start_x = max(0, viewport_end_x - viewport_width)
	if viewport_end_y - viewport_start_y < viewport_height:
		viewport_start_y = max(0, viewport_end_y - viewport_height)
	
	for y in range(viewport_start_y, viewport_end_y):
		for x in range(viewport_start_x, viewport_end_x):
			var pos = Vector2(x, y)
			var symbol: String
			var color: Color
			
			if pos == player_pos:
				if show_player:
					symbol = SYMBOL_PLAYER
					color = COLOR_PLAYER_BLINK if is_blink_time else COLOR_PLAYER
				else:
					# Mostra il terreno sottostante quando player non è visibile
					symbol = map_data[y][x]
					color = _get_terrain_color(symbol)
			elif pos == start_pos:
				symbol = SYMBOL_START
				color = COLOR_START_BLINK if is_blink_time else COLOR_START
			elif pos == end_pos:
				symbol = SYMBOL_END
				color = COLOR_END_BLINK if is_blink_time else COLOR_END
			else:
				symbol = map_data[y][x]
				color = _get_terrain_color(symbol)
			
			# BBCode per colore
			var color_hex = "#%02x%02x%02x" % [color.r * 255, color.g * 255, color.b * 255]
			display += "[color=%s]%s[/color]" % [color_hex, symbol]
		
		display += "\n"
	
	return display

func _get_terrain_color(symbol: String) -> Color:
	match symbol:
		SYMBOL_PLAINS:
			return COLOR_PLAINS
		SYMBOL_FOREST:
			return COLOR_FOREST
		SYMBOL_MOUNTAIN:
			return COLOR_MOUNTAIN
		SYMBOL_CITY:
			return COLOR_CITY
		SYMBOL_VILLAGE:
			return COLOR_VILLAGE
		SYMBOL_RIVER:
			return COLOR_RIVER
		SYMBOL_START:
			return COLOR_START
		SYMBOL_END:
			return COLOR_END
		_:
			return COLOR_PLAINS

## Ottieni informazioni sul terreno alla posizione
func get_terrain_info(pos: Vector2) -> Dictionary:
	if not _is_valid_position(pos):
		return {"type": "unknown", "name": "Fuori Mappa"}
	
	var symbol = map_data[pos.y][pos.x]
	match symbol:
		SYMBOL_PLAINS:
			return {"type": "plains", "name": "Pianura"}
		SYMBOL_FOREST:
			return {"type": "forest", "name": "Foresta"}
		SYMBOL_MOUNTAIN:
			return {"type": "mountain", "name": "Montagna"}
		SYMBOL_CITY:
			return {"type": "city", "name": "Città"}
		SYMBOL_VILLAGE:
			return {"type": "village", "name": "Villaggio"}
		SYMBOL_RIVER:
			return {"type": "river", "name": "Fiume"}
		_:
			return {"type": "unknown", "name": "Sconosciuto"}

func _is_valid_position(pos: Vector2) -> bool:
	return pos.x >= 0 and pos.x < MAP_WIDTH and pos.y >= 0 and pos.y < MAP_HEIGHT

## Ottieni posizione player
func get_player_position() -> Vector2:
	return player_pos

## Ottieni dimensioni mappa  
func get_map_size() -> Vector2:
	return Vector2(MAP_WIDTH, MAP_HEIGHT)

## Imposta dimensioni viewport dinamiche per riempire il pannello
func set_viewport_size(width: int, height: int):
	viewport_width = clamp(width, 40, 150)   # Limiti ragionevoli
	viewport_height = clamp(height, 15, 50)  # Limiti ragionevoli
	print("🗺️ [ASCIIMapGenerator] Viewport aggiornato a %dx%d" % [viewport_width, viewport_height])

## Ottieni dimensioni viewport correnti
func get_viewport_size() -> Vector2:
	return Vector2(viewport_width, viewport_height) 
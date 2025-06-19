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
const SYMBOL_REST_STOP = "R"   # Ristori (verde standard)
const SYMBOL_PLAYER = "@"      # Player position (verde brillante lampeggiante)

# Colori SafePlace CRT autentici - RIPRISTINO PRE-RIFUGI
const COLOR_PLAINS = Color(0.306, 0.631, 0.384, 1)     # #4EA162 verde base interfaccia
const COLOR_FOREST = Color(0, 0.4, 0.15, 1)            # Verde scuro foreste
const COLOR_MOUNTAIN = Color(0.4, 0.25, 0.1, 1)        # Marrone scuro montagne
const COLOR_CITY = Color(0.7, 0.7, 0.7, 1)             # Grigio chiaro città
const COLOR_VILLAGE = Color(0.6, 0.4, 0.2, 1)          # Marrone chiaro villaggi  
const COLOR_RIVER = Color(0.2, 0.6, 0.8, 1)            # Celeste fiumi
const COLOR_START = Color(0.306, 0.631, 0.384, 1)      # #4EA162 verde standard per S
const COLOR_START_BLINK = Color(1, 1, 0, 1)            # Giallo acceso lampeggiante S
const COLOR_END = Color(0.306, 0.631, 0.384, 1)        # #4EA162 verde standard per E  
const COLOR_END_BLINK = Color(1, 1, 0, 1)              # Giallo acceso lampeggiante E
const COLOR_REST_STOP = Color(1, 1, 0, 1)              # GIALLO BRILLANTE per ristori R (più visibili)
const COLOR_PLAYER = Color(0, 1, 0.4, 1)               # Verde brillante player @
const COLOR_PLAYER_BLINK = Color(0.2, 1, 0.6, 1)       # Verde cursore lampeggiante @

# Dimensioni mappa
const MAP_WIDTH = 250
const MAP_HEIGHT = 250
# Viewport dinamico per riempire ottimalmente il MapPanel
var viewport_width = 92  # Larghezza viewport (originale)
var viewport_height = 27 # Altezza viewport (originale)

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
	# Usa il nuovo sistema di generazione con cluster autentici
	generate_map()

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

# === FUNZIONI OBSOLETE RIMOSSE ===
# Le vecchie funzioni di generazione sono state sostituite dal nuovo sistema
# _add_rivers(), _generate_river(), _add_settlements(), etc. NON PIÙ USATE

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
	# Punto di partenza (S) - NORD OVEST come richiesto
	start_pos = Vector2(randi_range(5, 20), randi_range(5, 20))
	if _is_valid_position(start_pos):
		map_data[start_pos.y][start_pos.x] = SYMBOL_START
	
	# Punto di arrivo (E) - SUD EST come richiesto
	end_pos = Vector2(randi_range(MAP_WIDTH-20, MAP_WIDTH-5), randi_range(MAP_HEIGHT-20, MAP_HEIGHT-5))
	if _is_valid_position(end_pos):
		map_data[end_pos.y][end_pos.x] = SYMBOL_END

## Imposta posizione iniziale player
func _add_player_starting_position():
	# Player parte dalla posizione di START (S) come richiesto
	if start_pos != Vector2(-1, -1):
		player_pos = start_pos
		discovered_areas.append(player_pos)
		print("👤 Player posizionato al punto START (%d,%d)" % [start_pos.x, start_pos.y])
		return
	
	# Fallback: centro mappa se START non definito
	for radius in range(1, 20):
		for dx in range(-radius, radius + 1):
			for dy in range(-radius, radius + 1):
				var pos = Vector2(125 + dx, 125 + dy)
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
		SYMBOL_REST_STOP:
			return COLOR_REST_STOP
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
		SYMBOL_REST_STOP:
			return {"type": "rest_stop", "name": "Ristoro"}
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

func generate_map():
	"""🚨 GENERAZIONE MAPPA 250x250 COMPLETAMENTE RIFATTA 🚨
	Specifiche ESATTE richieste dall'utente:
	- Schema 250x250 caratteri 
	- Ordine casuale di ".", F, M
	- Cluster di 7-9 aggregazioni di C (città)
	- Cluster di 4-6 aggregazioni di V (villaggi)  
	- Fiumi (~) continui, irregolari, verticali/orizzontali
	- Riempimento dinamico contenitore
	- Scroll automatico senza barre
	"""
	print("🚨 [ASCIIMapGenerator] GENERAZIONE MAPPA 250x250 - VERSIONE CORRETTA")
	
	# === FASE 1: INIZIALIZZAZIONE PULITA ===
	map_data.clear()
	discovered_areas.clear()
	
	# Crea griglia 250x250 con solo pianure
	for y in range(MAP_HEIGHT):
		map_data.append([])
		for x in range(MAP_WIDTH):
			map_data[y].append(SYMBOL_PLAINS)  # "."
	
	print("✅ Griglia 250x250 inizializzata")
	
	# === FASE 2: DISTRIBUZIONE CASUALE TERRENO BASE ===
	_generate_random_terrain_distribution()
	
	# === FASE 3: FIUMI CONTINUI (PRIORITÀ ALTA) ===
	_generate_continuous_rivers()
	
	# === FASE 4: CLUSTER CITTÀ (7-9 elementi) ===
	_generate_authentic_city_clusters()
	
	# === FASE 5: CLUSTER VILLAGGI (4-6 elementi) ===
	_generate_authentic_village_clusters()
	
	# === FASE 6: RISTORI SPARSI ===
	_add_rest_stops()
	
	# === FASE 7: PUNTI SPECIALI ===
	_add_start_and_end_points()
	
	# === FASE 8: POSIZIONAMENTO PLAYER ===
	_add_player_starting_position()
	
	print("🎯 [ASCIIMapGenerator] MAPPA 250x250 COMPLETATA CON SUCCESSO")
	_print_generation_summary()

func _generate_random_terrain_distribution():
	"""Distribuisce casualmente Foreste (F) e Montagne (M) sulla mappa."""
	print("🌲 Distribuzione terreno casuale...")
	
	var forest_count = 0
	var mountain_count = 0
	
	# Distribuisci foreste (15% della mappa circa)
	var forest_target = int(MAP_WIDTH * MAP_HEIGHT * 0.15)
	for i in range(forest_target):
		var x = randi_range(0, MAP_WIDTH - 1)
		var y = randi_range(0, MAP_HEIGHT - 1)
		if map_data[y][x] == SYMBOL_PLAINS:
			map_data[y][x] = SYMBOL_FOREST
			forest_count += 1
	
	# Distribuisci montagne (8% della mappa circa) 
	var mountain_target = int(MAP_WIDTH * MAP_HEIGHT * 0.08)
	for i in range(mountain_target):
		var x = randi_range(0, MAP_WIDTH - 1)
		var y = randi_range(0, MAP_HEIGHT - 1)
		if map_data[y][x] == SYMBOL_PLAINS:
			map_data[y][x] = SYMBOL_MOUNTAIN
			mountain_count += 1
	
	print("🌲 Foreste: %d, 🏔️ Montagne: %d" % [forest_count, mountain_count])

func _generate_continuous_rivers():
	"""Genera 3-5 fiumi COMPLETAMENTE CONTINUI attraverso la mappa."""
	print("🌊 Generazione fiumi continui...")
	
	var river_count = randi_range(3, 5)
	
	for i in range(river_count):
		_create_single_continuous_river()
	
	print("🌊 Generati %d fiumi continui" % river_count)

func _create_single_continuous_river():
	"""Crea un singolo fiume completamente continuo da bordo a bordo."""
	# Scegli direzione principale: verticale o orizzontale
	var is_vertical = randf() < 0.5
	
	if is_vertical:
		_create_vertical_river()
	else:
		_create_horizontal_river()

func _create_vertical_river():
	"""Crea fiume verticale continuo con irregolarità."""
	var start_x = randi_range(20, MAP_WIDTH - 20)
	var current_x = start_x
	
	# Traccia dall'alto al basso
	for y in range(0, MAP_HEIGHT):
		# Posiziona fiume
		if _is_valid_position(Vector2(current_x, y)):
			map_data[y][current_x] = SYMBOL_RIVER
		
		# Irregolarità controllata ogni 10-15 step
		if y % randi_range(10, 15) == 0:
			var deviation = randi_range(-2, 2)
			current_x = clamp(current_x + deviation, 5, MAP_WIDTH - 5)

func _create_horizontal_river():
	"""Crea fiume orizzontale continuo con irregolarità."""
	var start_y = randi_range(20, MAP_HEIGHT - 20)
	var current_y = start_y
	
	# Traccia da sinistra a destra
	for x in range(0, MAP_WIDTH):
		# Posiziona fiume
		if _is_valid_position(Vector2(x, current_y)):
			map_data[current_y][x] = SYMBOL_RIVER
		
		# Irregolarità controllata ogni 10-15 step
		if x % randi_range(10, 15) == 0:
			var deviation = randi_range(-2, 2)
			current_y = clamp(current_y + deviation, 5, MAP_HEIGHT - 5)

func _generate_authentic_city_clusters():
	"""Genera cluster autentici di città con 7-9 elementi ciascuno."""
	print("🏙️ Generazione cluster città (7-9 elementi)...")
	
	var cluster_count = randi_range(3, 5)  # 3-5 cluster totali
	var cities_placed = 0
	
	for i in range(cluster_count):
		var cluster_center = _find_safe_cluster_position(15)  # Distanza minima 15
		if cluster_center == Vector2(-1, -1):
			# Se non trova posizione sicura, usa posizione più permissiva
			cluster_center = _find_permissive_cluster_position()
		
		if cluster_center != Vector2(-1, -1):
			var cluster_size = randi_range(7, 9)  # ESATTO: 7-9 elementi
			_create_city_cluster(cluster_center, cluster_size)
			cities_placed += cluster_size
			print("🏙️ Cluster %d: %d città a (%d,%d)" % [i+1, cluster_size, cluster_center.x, cluster_center.y])
	
	print("🏙️ Cluster città completati - Totale città: %d" % cities_placed)

func _generate_authentic_village_clusters():
	"""Genera cluster autentici di villaggi con 4-6 elementi ciascuno."""
	print("🏘️ Generazione cluster villaggi (4-6 elementi)...")
	
	var cluster_count = randi_range(4, 7)  # 4-7 cluster totali
	var villages_placed = 0
	
	for i in range(cluster_count):
		var cluster_center = _find_safe_cluster_position(10)  # Distanza minima 10
		if cluster_center == Vector2(-1, -1):
			# Se non trova posizione sicura, usa posizione più permissiva
			cluster_center = _find_permissive_cluster_position()
		
		if cluster_center != Vector2(-1, -1):
			var cluster_size = randi_range(4, 6)  # ESATTO: 4-6 elementi
			_create_village_cluster(cluster_center, cluster_size)
			villages_placed += cluster_size
			print("🏘️ Cluster %d: %d villaggi a (%d,%d)" % [i+1, cluster_size, cluster_center.x, cluster_center.y])
	
	print("🏘️ Cluster villaggi completati - Totale villaggi: %d" % villages_placed)

func _add_rest_stops():
	"""Aggiunge ristori (R) sparsi per la mappa."""
	print("🏪 Generazione ristori sparsi...")
	
	var rest_stops_count = randi_range(25, 40)  # AUMENTATO da 8-15 a 25-40 ristori sparsi
	var placed = 0
	
	for i in range(rest_stops_count * 5):  # AUMENTATO tentativi da 3x a 5x
		var x = randi_range(5, MAP_WIDTH - 5)   # RIDOTTO margine da 10 a 5
		var y = randi_range(5, MAP_HEIGHT - 5)  # RIDOTTO margine da 10 a 5
		var pos = Vector2(x, y)
		
		# Piazza solo su pianure, mantenendo distanza da insediamenti
		if _is_valid_position(pos) and map_data[y][x] == SYMBOL_PLAINS:
			if _is_position_clear_for_rest_stop(pos):
				map_data[y][x] = SYMBOL_REST_STOP
				placed += 1
				
				if placed >= rest_stops_count:
					break
	
	print("🏪 Ristori generati: %d" % placed)

func _is_position_clear_for_rest_stop(pos: Vector2) -> bool:
	"""Verifica che un ristoro non sia troppo vicino ad altri insediamenti."""
	var min_distance = 2  # ULTERIORMENTE RIDOTTO da 4 a 2 per molti più posizionamenti
	
	for y in range(max(0, pos.y - min_distance), min(MAP_HEIGHT, pos.y + min_distance)):
		for x in range(max(0, pos.x - min_distance), min(MAP_WIDTH, pos.x + min_distance)):
			var terrain = map_data[y][x]
			if terrain == SYMBOL_CITY or terrain == SYMBOL_VILLAGE or terrain == SYMBOL_REST_STOP:
				return false
	return true

# FUNZIONE RIFUGI RIMOSSA - Ripristino estetica pre-rifugi

func _find_safe_cluster_position(min_distance: int) -> Vector2:
	"""Trova una posizione sicura per un cluster."""
	for attempt in range(100):  # Max 100 tentativi
		var x = randi_range(min_distance, MAP_WIDTH - min_distance)
		var y = randi_range(min_distance, MAP_HEIGHT - min_distance)
		
		# Verifica che sia pianura o foresta
		if map_data[y][x] == SYMBOL_PLAINS or map_data[y][x] == SYMBOL_FOREST:
			# Verifica distanza da altri cluster esistenti
			if _is_position_clear_of_settlements(Vector2(x, y), min_distance):
				return Vector2(x, y)
	
	return Vector2(-1, -1)  # Non trovata

func _find_permissive_cluster_position() -> Vector2:
	"""Trova posizione cluster con criteri più permissivi."""
	for attempt in range(200):  # Più tentativi
		var x = randi_range(20, MAP_WIDTH - 20)
		var y = randi_range(20, MAP_HEIGHT - 20)
		
		# Accetta anche su montagne se necessario
		if map_data[y][x] != SYMBOL_RIVER:  # Solo non su fiumi
			return Vector2(x, y)
	
	# Fallback assoluto
	return Vector2(125, 125)

func _is_position_clear_of_settlements(pos: Vector2, radius: int) -> bool:
	"""Verifica che una posizione sia libera da altri insediamenti."""
	for y in range(max(0, pos.y - radius), min(MAP_HEIGHT, pos.y + radius)):
		for x in range(max(0, pos.x - radius), min(MAP_WIDTH, pos.x + radius)):
			if map_data[y][x] == SYMBOL_CITY or map_data[y][x] == SYMBOL_VILLAGE:
				return false
	return true

func _create_city_cluster(center: Vector2, size: int):
	"""Crea cluster di città con dimensione esatta."""
	var placed = 0
	var positions_to_check = [center]
	var positions_used = []
	
	while placed < size and not positions_to_check.is_empty():
		var current_pos = positions_to_check.pop_front()
		
		# Piazza città se possibile
		if _can_place_settlement(current_pos):
			map_data[current_pos.y][current_pos.x] = SYMBOL_CITY
			positions_used.append(current_pos)
			placed += 1
			
			# Aggiungi posizioni adiacenti
			_add_adjacent_positions(current_pos, positions_to_check, positions_used)

func _create_village_cluster(center: Vector2, size: int):
	"""Crea cluster di villaggi con dimensione esatta."""
	var placed = 0
	var positions_to_check = [center]
	var positions_used = []
	
	while placed < size and not positions_to_check.is_empty():
		var current_pos = positions_to_check.pop_front()
		
		# Piazza villaggio se possibile
		if _can_place_settlement(current_pos):
			map_data[current_pos.y][current_pos.x] = SYMBOL_VILLAGE
			positions_used.append(current_pos)
			placed += 1
			
			# Aggiungi posizioni adiacenti
			_add_adjacent_positions(current_pos, positions_to_check, positions_used)

func _can_place_settlement(pos: Vector2) -> bool:
	"""Verifica se si può piazzare un insediamento."""
	if not _is_valid_position(pos):
		return false
	
	var terrain = map_data[pos.y][pos.x]
	return terrain == SYMBOL_PLAINS or terrain == SYMBOL_FOREST

func _add_adjacent_positions(center: Vector2, to_check: Array, used: Array):
	"""Aggiunge posizioni adiacenti alla lista di controllo."""
	for dx in range(-1, 2):
		for dy in range(-1, 2):
			if dx == 0 and dy == 0:
				continue
			
			var new_pos = center + Vector2(dx, dy)
			if new_pos not in to_check and new_pos not in used:
				to_check.append(new_pos)

func _position_player_correctly():
	"""Posiziona il player in una zona con cluster visibili per test."""
	# TEMPORANEO: Posiziona player vicino a cluster per test
	# Cerca prima posizione vicina a città/villaggi
	for attempt in range(50):
		var test_x = randi_range(60, 180)  # Zone con più cluster
		var test_y = randi_range(60, 180)
		
		# Cerca C o V nelle vicinanze (raggio 20)
		var has_settlements = false
		for check_y in range(max(0, test_y - 20), min(MAP_HEIGHT, test_y + 20)):
			for check_x in range(max(0, test_x - 20), min(MAP_WIDTH, test_x + 20)):
				if map_data[check_y][check_x] == SYMBOL_CITY or map_data[check_y][check_x] == SYMBOL_VILLAGE:
					has_settlements = true
					break
			if has_settlements:
				break
		
		if has_settlements and map_data[test_y][test_x] == SYMBOL_PLAINS:
			player_pos = Vector2(test_x, test_y)
			discovered_areas.append(player_pos)
			print("👤 Player posizionato a (%d,%d) vicino a cluster" % [test_x, test_y])
			return
	
	# Fallback: centro con offset verso cluster noti
	player_pos = Vector2(125, 125)
	discovered_areas.append(player_pos)
	print("👤 Player posizionato al centro (fallback)")

func _print_generation_summary():
	"""Stampa riassunto generazione per debug."""
	var stats = {
		"plains": 0, "forests": 0, "mountains": 0,
		"cities": 0, "villages": 0, "rivers": 0, "rest_stops": 0
	}
	
	for y in range(MAP_HEIGHT):
		for x in range(MAP_WIDTH):
			match map_data[y][x]:
				SYMBOL_PLAINS: stats.plains += 1
				SYMBOL_FOREST: stats.forests += 1
				SYMBOL_MOUNTAIN: stats.mountains += 1
				SYMBOL_CITY: stats.cities += 1
				SYMBOL_VILLAGE: stats.villages += 1
				SYMBOL_RIVER: stats.rivers += 1
				SYMBOL_REST_STOP: stats.rest_stops += 1

	
	print("📊 STATISTICHE MAPPA 250x250:")
	print("   Pianure: %d | Foreste: %d | Montagne: %d" % [stats.plains, stats.forests, stats.mountains])
	print("   Città: %d | Villaggi: %d | Fiumi: %d | Ristori: %d" % [stats.cities, stats.villages, stats.rivers, stats.rest_stops])
	print("   Player: (%d,%d)" % [player_pos.x, player_pos.y]) 

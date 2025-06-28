@tool
extends EditorScript

# ============================================================================
# TILE TEXTURE GENERATOR - The Safe Place
# ============================================================================
# Script per generare automaticamente le texture PNG per il TileSet ASCII
# Versione: v0.0.6 "TileMap Migration"
# Uso: Tools > Execute Script > TileTextureGenerator.gd
# ============================================================================

# CONFIGURAZIONE TEXTURE
const TEXTURE_SIZE = 16         # Dimensione texture in pixel (16x16)
const FONT_SIZE = 14           # Dimensione font per riempire bene i 16px
const OUTPUT_PATH = "res://textures/tiles/"  # Cartella output PNG

# PALETTE COLORI UFFICIALE - The Safe Place v2.0
var CHAR_DATA = {
	"terrain":    { "char": ".", "color": Color("#a5c9a5") },  # Pianura
	"forest":     { "char": "F", "color": Color("#34672a") },  # Foresta
	"mountain":   { "char": "M", "color": Color("#675945") },  # Montagna
	"water":      { "char": "~", "color": Color("#1e7ba8") },  # Fiume
	"village":    { "char": "V", "color": Color("#c9a57b") },  # Villaggio
	"city":       { "char": "C", "color": Color("#c9c9c9") },  # Città
	"rest_stop":  { "char": "R", "color": Color("#ffdd00") },  # Ristoro (NUOVO!)
	"start_point":{ "char": "S", "color": Color("#ffdd00") },  # Start (gestito come nodo)
	"end_point":  { "char": "E", "color": Color("#ffdd00") }   # End (gestito come nodo)
}

# Font Perfect DOS VGA 437
const FONT_PATH = "res://themes/Perfect DOS VGA 437 Win.ttf"

# ============================================================================
# FUNZIONE PRINCIPALE
# ============================================================================

func _run():
	print("🎨 ===== TILE TEXTURE GENERATOR =====")
	print("📁 Generazione texture per TileSet ASCII...")
	print("🎯 Destinazione: " + OUTPUT_PATH)
	print("")
	
	# Verifica esistenza cartella output
	_ensure_output_directory()
	
	# Carica font Perfect DOS VGA
	var font = _load_dos_font()
	if font == null:
		print("❌ ERRORE: Impossibile caricare font DOS!")
		return
	
	print("🎨 Usando metodo pixel art diretto per compatibilità...")
	print("")
	
	# Genera texture per ogni carattere usando metodo semplificato
	var success_count = 0
	var total_count = CHAR_DATA.size()
	
	for tile_name in CHAR_DATA.keys():
		var tile_data = CHAR_DATA[tile_name]
		var success = _generate_tile_texture_simple(tile_name, tile_data, font)
		
		if success:
			success_count += 1
			print("✅ " + tile_name + ".png generato con successo")
		else:
			print("❌ ERRORE generando " + tile_name + ".png")
	
	# Risultato finale
	print("")
	print("🎉 GENERAZIONE COMPLETATA!")
	print("📊 Successi: " + str(success_count) + "/" + str(total_count))
	
	if success_count == total_count:
		print("✅ Tutte le texture generate correttamente!")
		print("🚀 Pronto per creazione TileSet ascii_tileset.tres")
	else:
		print("⚠️  Alcune texture non sono state generate")
	
	print("🎨 ===================================")

# ============================================================================
# FUNZIONI HELPER
# ============================================================================

func _ensure_output_directory():
	"""Crea la cartella di output se non esiste"""
	var dir = DirAccess.open("res://")
	if not dir.dir_exists("textures"):
		dir.make_dir("textures")
		print("📁 Creata cartella textures/")
	
	if not dir.dir_exists(OUTPUT_PATH):
		dir.make_dir_recursive(OUTPUT_PATH)
		print("📁 Creata cartella " + OUTPUT_PATH)

func _load_dos_font() -> Font:
	"""Carica il font Perfect DOS VGA 437"""
	var font_resource = load(FONT_PATH)
	if font_resource == null:
		print("❌ Font non trovato: " + FONT_PATH)
		return null
	
	print("✅ Font Perfect DOS VGA 437 caricato")
	return font_resource

func _generate_tile_texture(tile_name: String, tile_data: Dictionary, font: Font) -> bool:
	"""Genera una singola texture PNG per un tile"""
	
	# Estrai dati del tile
	var character = tile_data["char"]
	var color = tile_data["color"]
	
	# Crea immagine vuota 16x16 trasparente
	var image = Image.create(TEXTURE_SIZE, TEXTURE_SIZE, false, Image.FORMAT_RGBA8)
	image.fill(Color(0, 0, 0, 0))  # Trasparente
	
	# Crea Label temporaneo in memoria
	var label = Label.new()
	label.text = character
	label.add_theme_font_override("font", font)
	label.add_theme_font_size_override("font_size", FONT_SIZE)
	label.add_theme_color_override("font_color", color)
	label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	label.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	
	# Configura dimensioni Label
	label.size = Vector2(TEXTURE_SIZE, TEXTURE_SIZE)
	label.position = Vector2.ZERO
	
	# Crea SubViewport temporaneo per rendering
	var viewport = SubViewport.new()
	viewport.size = Vector2i(TEXTURE_SIZE, TEXTURE_SIZE)
	viewport.render_target_update_mode = SubViewport.UPDATE_ONCE
	
	# Aggiungi Label al viewport
	viewport.add_child(label)
	
	# Aggiungi viewport alla scena temporaneamente
	var scene_tree = Engine.get_main_loop()
	scene_tree.current_scene.add_child(viewport)
	
	# Forza rendering
	viewport.render_target_update_mode = SubViewport.UPDATE_ONCE
	await scene_tree.process_frame
	await scene_tree.process_frame  # Due frame per sicurezza
	
	# Cattura immagine dal viewport
	var viewport_texture = viewport.get_texture()
	if viewport_texture != null:
		image = viewport_texture.get_image()
	
	# Cleanup viewport
	scene_tree.current_scene.remove_child(viewport)
	viewport.queue_free()
	
	# Salva PNG
	var filename = tile_name + ".png"
	var full_path = OUTPUT_PATH + filename
	var save_result = image.save_png(full_path)
	
	if save_result == OK:
		return true
	else:
		print("❌ Errore salvando " + full_path + " (codice: " + str(save_result) + ")")
		return false

# ============================================================================
# FUNZIONE ALTERNATIVA SEMPLIFICATA (se SubViewport non funziona)
# ============================================================================

func _generate_tile_texture_simple(tile_name: String, tile_data: Dictionary, font: Font) -> bool:
	"""Versione che disegna caratteri ASCII reali con font DOS"""
	
	var character = tile_data["char"]
	var color = tile_data["color"]
	
	# Crea immagine vuota 16x16 trasparente
	var image = Image.create(TEXTURE_SIZE, TEXTURE_SIZE, false, Image.FORMAT_RGBA8)
	image.fill(Color(0, 0, 0, 0))  # Trasparente
	
	# METODO DIRETTO: Disegna carattere ASCII con font DOS
	# Usa FontFile per ottenere glyph data
	var font_file = font as FontFile
	if font_file != null:
		# Ottieni dimensioni carattere
		var char_size = font_file.get_char_size(character.unicode_at(0), FONT_SIZE)
		
		# Calcola posizione centrata
		var pos_x = (TEXTURE_SIZE - char_size.x) / 2
		var pos_y = (TEXTURE_SIZE - char_size.y) / 2 + char_size.y * 0.8  # Adjust baseline
		
		# Disegna carattere pixel per pixel
		_draw_character_on_image(image, character, font_file, Vector2(pos_x, pos_y), color, FONT_SIZE)
	else:
		# Fallback: usa pattern semplificato se font non funziona
		print("⚠️  Fallback pattern per: " + character)
		_draw_simple_char_pattern(image, character, color)
	
	# Salva PNG
	var filename = tile_name + ".png"
	var full_path = OUTPUT_PATH + filename
	var save_result = image.save_png(full_path)
	
	return save_result == OK

func _draw_character_on_image(image: Image, character: String, font_file: FontFile, position: Vector2, color: Color, font_size: int):
	"""Disegna un carattere ASCII direttamente sull'immagine usando font data"""
	
	# Ottieni texture del glyph dal font
	var char_code = character.unicode_at(0)
	var glyph_index = font_file.get_glyph_index(font_size, char_code, 0)
	
	if glyph_index > 0:
		# Ottieni texture del glyph
		var glyph_texture = font_file.get_glyph_texture(Vector2i(font_size, 0), glyph_index)
		
		if glyph_texture != null:
			var glyph_image = glyph_texture.get_image()
			if glyph_image != null:
				# Disegna glyph sull'immagine con colore
				_blit_colored_glyph(image, glyph_image, position, color)
				return
	
	# Se il metodo glyph fallisce, usa fallback pattern
	print("⚠️  Glyph fallback per: " + character)
	_draw_simple_char_pattern(image, character, color)

func _blit_colored_glyph(target_image: Image, glyph_image: Image, position: Vector2, color: Color):
	"""Copia glyph sull'immagine target applicando il colore"""
	
	var glyph_size = glyph_image.get_size()
	
	for y in range(glyph_size.y):
		for x in range(glyph_size.x):
			var target_x = int(position.x + x)
			var target_y = int(position.y + y)
			
			# Controlla bounds
			if target_x >= 0 and target_x < TEXTURE_SIZE and target_y >= 0 and target_y < TEXTURE_SIZE:
				var glyph_pixel = glyph_image.get_pixel(x, y)
				
				# Se il pixel del glyph non è trasparente, applicalo con il colore
				if glyph_pixel.a > 0.1:  # Threshold per anti-aliasing
					var final_color = Color(color.r, color.g, color.b, glyph_pixel.a)
					target_image.set_pixel(target_x, target_y, final_color)

func _draw_simple_char_pattern(image: Image, character: String, color: Color):
	"""Fallback: disegna pattern semplificato per carattere ASCII"""
	
	# Pattern minimalisti che ricordano i caratteri ASCII
	match character:
		".":
			# Punto centrale
			image.set_pixel(8, 12, color)
		"F":
			# Lettera F stilizzata
			for y in range(4, 13):
				image.set_pixel(6, y, color)  # Linea verticale
			for x in range(6, 11):
				image.set_pixel(x, 4, color)  # Linea superiore
				image.set_pixel(x, 8, color)  # Linea centrale
		"M":
			# Lettera M stilizzata
			for y in range(4, 13):
				image.set_pixel(5, y, color)   # Sinistra
				image.set_pixel(11, y, color)  # Destra
			for x in range(5, 12):
				image.set_pixel(x, 4, color)  # Top
			image.set_pixel(8, 6, color)      # Centro
		"~":
			# Tilde - onda
			for x in range(4, 13):
				var y = 8 + int(sin(x * 0.8) * 1.5)
				image.set_pixel(x, y, color)
		"V":
			# Lettera V
			for i in range(5):
				image.set_pixel(6 + i, 4 + i, color)      # Sinistra
				image.set_pixel(10 - i, 4 + i, color)     # Destra
		"C":
			# Lettera C
			for y in range(5, 12):
				image.set_pixel(6, y, color)  # Sinistra
			for x in range(6, 11):
				image.set_pixel(x, 5, color)  # Top
				image.set_pixel(x, 11, color) # Bottom
		"S":
			# Lettera S
			for x in range(6, 11):
				image.set_pixel(x, 5, color)  # Top
				image.set_pixel(x, 8, color)  # Middle
				image.set_pixel(x, 11, color) # Bottom
			image.set_pixel(6, 6, color)
			image.set_pixel(10, 9, color)
		"E":
			# Lettera E
			for y in range(4, 13):
				image.set_pixel(6, y, color)  # Sinistra
			for x in range(6, 11):
				image.set_pixel(x, 4, color)  # Top
				image.set_pixel(x, 8, color)  # Middle
				image.set_pixel(x, 12, color) # Bottom 

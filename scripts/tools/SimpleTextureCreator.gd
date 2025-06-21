@tool
extends EditorScript

"""
SimpleTextureCreator.gd - Creatore semplificato texture tiles
Esegui dall'editor: Tools > Execute Script
"""

func _run():
	print("🎨 Creazione texture tiles ASCII...")
	
	# Mapping caratteri → colori
	var char_colors = {
		'.': Color(0.3, 0.3, 0.3),      # Terreno
		'F': Color(0.0, 0.4, 0.0),      # Foresta  
		'M': Color(0.7, 0.7, 0.7),      # Montagna
		'C': Color(1.0, 1.0, 0.0),      # Città
		'V': Color(1.0, 0.5, 0.0),      # Villaggio
		'~': Color(0.0, 0.5, 1.0),      # Acqua
		'S': Color(0.0, 1.0, 0.0),      # Start
		'E': Color(1.0, 0.0, 0.0)       # Exit
	}
	
	# Crea directory se non esiste
	if not DirAccess.dir_exists_absolute("res://textures"):
		DirAccess.open("res://").make_dir("textures")
	if not DirAccess.dir_exists_absolute("res://textures/tiles"):
		DirAccess.open("res://textures").make_dir("tiles")
	
	# Genera ogni texture
	for character in char_colors.keys():
		var color = char_colors[character]
		var image = create_tile_texture(character, color)
		
		# Nome file sicuro
		var safe_name = character
		if character == '.':
			safe_name = "dot"
		elif character == '~':
			safe_name = "water"
		
		var filename = "tile_" + safe_name + ".png"
		var full_path = "res://textures/tiles/" + filename
		
		# Salva immagine
		var error = image.save_png(full_path)
		if error == OK:
			print("✅ Creato: " + filename)
		else:
			print("❌ Errore: " + filename + " (code: " + str(error) + ")")
	
	print("🎉 Texture tiles create!")
	
	# Refresh filesystem
	EditorInterface.get_resource_filesystem().scan()

func create_tile_texture(character: String, color: Color) -> Image:
	"""Crea texture 16x16 per carattere specifico"""
	var image = Image.create(16, 16, false, Image.FORMAT_RGBA8)
	image.fill(Color.BLACK)  # Sfondo nero
	
	# Pattern per ogni carattere
	match character:
		'.':
			# Terreno: pixel sparsi
			image.set_pixel(7, 7, color)
			image.set_pixel(8, 8, color)
			image.set_pixel(9, 7, color)
			image.set_pixel(6, 9, color)
			image.set_pixel(10, 9, color)
		
		'F':
			# Foresta: albero stilizzato
			# Tronco
			for y in range(8, 14):
				image.set_pixel(8, y, color)
			# Chioma
			for x in range(6, 11):
				for y in range(4, 8):
					if not (x == 6 and y == 4) and not (x == 10 and y == 4):
						image.set_pixel(x, y, color)
		
		'M':
			# Montagna: triangolo
			for y in range(3, 13):
				var width = (13 - y)
				var start_x = 8 - width / 2
				var end_x = 8 + width / 2
				for x in range(int(start_x), int(end_x) + 1):
					if x >= 0 and x < 16:
						image.set_pixel(x, y, color)
		
		'C':
			# Città: edifici
			# Edificio 1
			for x in range(3, 7):
				for y in range(6, 12):
					image.set_pixel(x, y, color)
			# Edificio 2
			for x in range(9, 13):
				for y in range(4, 12):
					image.set_pixel(x, y, color)
		
		'V':
			# Villaggio: casa
			# Base casa
			for x in range(5, 11):
				for y in range(8, 13):
					image.set_pixel(x, y, color)
			# Tetto
			for x in range(6, 10):
				image.set_pixel(x, 6, color)
			for x in range(7, 9):
				image.set_pixel(x, 5, color)
		
		'~':
			# Acqua: onde
			for y in [6, 8, 10]:
				for x in range(1, 15):
					if (x + y) % 3 == 0:
						image.set_pixel(x, y, color)
		
		'S':
			# Start: croce verde brillante
			# Linea verticale
			for y in range(3, 13):
				image.set_pixel(8, y, color)
			# Linea orizzontale
			for x in range(3, 13):
				image.set_pixel(x, 8, color)
		
		'E':
			# Exit: X rossa
			for i in range(3, 13):
				image.set_pixel(i, i, color)          # Diagonale \
				image.set_pixel(i, 15 - i, color)     # Diagonale /
	
	return image 
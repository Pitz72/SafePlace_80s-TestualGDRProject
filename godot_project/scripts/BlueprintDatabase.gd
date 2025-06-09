# BlueprintDatabase.gd
# Singleton per la gestione di tutte le ricette di crafting (Blueprint).
# Carica le ricette da un file JSON e le converte in Risorse Blueprint.

extends Node

# Preload della classe Blueprint per evitare errori di parsing
const Blueprint = preload("res://scripts/Blueprint.gd")

# Percorso del file JSON contenente le definizioni delle ricette.
const RECIPE_FILE_PATH = "res://resources/crafting_recipes.json"

# Dizionario che conterrà tutte le ricette caricate, mappate per la loro chiave (ID).
# "craft_medicine_crude": BlueprintResource
var recipes: Dictionary = {}

func _ready():
	"""
	Chiamato all'avvio del gioco. Carica le ricette.
	"""
	print("📚 BlueprintDatabase: Inizializzazione...")
	load_all_recipes()

func load_all_recipes():
	"""
	Carica il file JSON, lo analizza e popola il dizionario delle ricette
	con istanze della risorsa Blueprint.
	"""
	if not FileAccess.file_exists(RECIPE_FILE_PATH):
		printerr("❌ BlueprintDatabase: File ricette non trovato a: %s" % RECIPE_FILE_PATH)
		return

	var file = FileAccess.open(RECIPE_FILE_PATH, FileAccess.READ)
	if not file:
		printerr("❌ BlueprintDatabase: Impossibile aprire il file delle ricette.")
		return

	var json_data = JSON.parse_string(file.get_as_text())
	file.close()

	if json_data == null:
		printerr("❌ BlueprintDatabase: Errore nel parsing del file JSON delle ricette.")
		return

	# Itera su ogni ricetta nel JSON e crea una risorsa Blueprint
	for recipe_key in json_data:
		var data = json_data[recipe_key]
		var blueprint = Blueprint.new()

		# Mappa i dati JSON alle proprietà della risorsa Blueprint
		blueprint.product_id = data.get("productId", "")
		blueprint.product_quantity = data.get("productQuantity", 1)
		blueprint.ingredients = data.get("ingredients", [])
		blueprint.description = data.get("description", "")
		blueprint.success_message = data.get("successMessage", "")
		blueprint.required_tools = data.get("required_tools", [])
		blueprint.required_skills = data.get("required_skills", {})

		recipes[recipe_key] = blueprint

	print("✅ BlueprintDatabase: Caricate %d ricette con successo." % recipes.size())

# --- API Pubblica ---

func get_recipe(recipe_key: String) -> Blueprint:
	"""
	Restituisce una risorsa Blueprint per la chiave data, se esiste.
	"""
	if recipes.has(recipe_key):
		return recipes[recipe_key]

	printerr("🔍 BlueprintDatabase: Ricetta non trovata per la chiave: %s" % recipe_key)
	return null

func get_all_recipes() -> Dictionary:
	"""
	Restituisce il dizionario completo di tutte le ricette caricate.
	"""
	return recipes

# CraftingManager.gd
# Singleton per la gestione della logica di crafting.

extends Node

# Preload della classe Blueprint per evitare errori di parsing
const Blueprint = preload("res://scripts/Blueprint.gd")

# Riferimenti agli altri manager
@onready var BlueprintDatabase: Node = get_node("/root/BlueprintDatabase")
@onready var PlayerStatsManager: Node = get_node("/root/PlayerStatsManager")
@onready var InventoryManager: Node = get_node("/root/InventoryManager")

func _ready():
	print("🛠️ CraftingManager: Inizializzazione completa.")

# --- API Pubblica ---

func can_craft(recipe_key: String) -> bool:
	"""
	Verifica se una ricetta può essere creata con le risorse e le abilità attuali.
	Restituisce true se possibile, altrimenti false.
	"""
	var recipe: Blueprint = BlueprintDatabase.get_recipe(recipe_key)
	if not recipe:
		return false

	# 1. Verifica Ingredienti (Reale)
	if not InventoryManager.has_items(recipe.ingredients):
		return false

	# 2. Verifica Strumenti (Reale)
	if not _has_required_tools(recipe.required_tools):
		return false

	# 3. Verifica Abilità (Reale)
	if not _has_required_skills(recipe.required_skills):
		return false

	return true

func craft_item(recipe_key: String) -> bool:
	"""
	Tenta di creare un oggetto basandosi sulla ricetta fornita.
	Restituisce true in caso di successo, altrimenti false.
	"""
	if not can_craft(recipe_key):
		print("❌ CraftingManager: Impossibile creare '%s', i requisiti non sono soddisfatti." % recipe_key)
		return false

	var recipe: Blueprint = BlueprintDatabase.get_recipe(recipe_key)

	# 1. Rimuovi ingredienti dall'inventario (Reale)
	_consume_ingredients(recipe.ingredients)

	# 2. Aggiungi prodotto all'inventario (Reale)
	InventoryManager.add_item(recipe.product_id, recipe.product_quantity)

	# 3. Assegna esperienza (Reale)
	_award_crafting_experience(recipe)

	print("✅ CraftingManager: Creato con successo '%s'!" % recipe.product_id)
	if recipe.success_message:
		# Qui si potrebbe emettere un segnale per mostrare il messaggio all'UI
		print("   -> %s" % recipe.success_message)

	return true

# --- Funzioni Private ---

func _has_required_tools(tools: Array[String]) -> bool:
	# Se non sono richiesti strumenti, la condizione è soddisfatta.
	if tools.is_empty():
		return true

	# Itera sugli strumenti richiesti e controlla se sono nell'inventario.
	for tool_id in tools:
		if not InventoryManager.has_tool(tool_id):
			print("   [Crafting] Strumento richiesto mancante: %s" % tool_id)
			return false

	return true

func _consume_ingredients(ingredients: Array[Dictionary]):
	# Itera sugli ingredienti e li rimuove dall'inventario.
	for item_req in ingredients:
		InventoryManager.remove_item(item_req["item_id"], item_req["quantity"])

func _has_required_skills(skills: Dictionary) -> bool:
	# Se non ci sono requisiti di abilità, è sempre possibile.
	if skills.is_empty():
		return true

	# Itera sui requisiti di abilità e controllali con PlayerStatsManager
	for skill_name in skills:
		var required_level = skills[skill_name]
		if PlayerStatsManager.get_stat(skill_name) < required_level:
			print("   [Crafting] Abilità insufficiente: %s. Richiesto: %d, Attuale: %d" % [skill_name, required_level, PlayerStatsManager.get_stat(skill_name)])
			return false

	return true

func _award_crafting_experience(recipe: Blueprint):
	# Calcola l'esperienza basata sulla complessità della ricetta
	# (es. 5 base + 2 per ogni ingrediente/strumento)
	var exp_to_award = 5 + (recipe.ingredients.size() * 2) + (recipe.required_tools.size() * 3)

	PlayerStatsManager.award_experience(exp_to_award, "crafting")
